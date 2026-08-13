/**
 * usePluginLoader.ts — plugin loading utility
 *
 * Fetches the plugin list, then dynamically imports each frontend bundle
 * via a same-origin URL so plugins can self-register into the
 * `pluginSystem` singleton (hostExternals.ts).
 *
 * Exports `loadAllPlugins()` — the single function PluginContext calls.
 */

import { getApiUrl, getApiToken } from "../api/config";

// ─────────────────────────────────────────────────────────────────────────────
// Plugin manifest type (mirrors backend PluginInfo)
// ─────────────────────────────────────────────────────────────────────────────

interface PluginInfo {
  id: string;
  name: string;
  enabled?: boolean;
  frontend_entry?: string;
  version?: string;
  frontend_revision?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a backend-relative API path (e.g. `/plugins/…/files/index.js`)
 * to a full URL using the same base that all other API calls use.
 */
function resolveUrl(pluginId: string, apiPath: string): string {
  return getApiUrl(`frontend_plugin/${pluginId}/files/${apiPath}`);
}

/**
 * Execute a plugin's frontend bundle via dynamic `import()`.
 *
 * Strategy (fetch + Blob URL first, direct import as fallback):
 *
 * 1. **Fetch + Blob URL `import()`** — preferred and most reliable.
 *    The plugin JS is fetched via `fetch()` (allowed by `connect-src`)
 *    and then imported via a `blob:` URL (allowed by `script-src blob:`).
 *    This works in Tauri desktop, web dev, and all modern browsers.
 *    The key reason this is preferred over direct `import(url)` is that
 *    in Tauri's WKWebView, `import()` of an HTTP URL can be silently
 *    blocked by CSP without throwing an error, causing the fallback
 *    to never execute.
 *
 * 2. **Direct `import(url)` fallback** — if the Blob URL approach fails
 *    (e.g. the webview doesn't support `import()` of blob: URLs), try
 *    a direct same-origin `import()`. This requires the HTTP origin
 *    to be in `script-src`.
 */
async function executePluginScript(
  entryUrl: string,
  version: string,
): Promise<void> {
  // Versioned URLs re-use the WebView disk cache between launches while still
  // invalidating immediately after a plugin upgrade.
  const versionedUrl = `${entryUrl}${
    entryUrl.includes("?") ? "&" : "?"
  }v=${encodeURIComponent(version)}`;

  // Strategy 1: Fetch + Blob URL import (most reliable in Tauri WebView).
  const token = getApiToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(versionedUrl, {
      headers,
      cache: "default",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${entryUrl}`);
    }

    const jsText = await response.text();
    const blobUrl = URL.createObjectURL(
      new Blob([jsText], { type: "text/javascript" }),
    );
    try {
      await import(/* @vite-ignore */ blobUrl);
      return;
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  } catch (blobErr) {
    console.warn(
      `[PluginLoader] Blob URL import failed for ${entryUrl}, trying direct import:`,
      blobErr,
    );
  }

  // Strategy 2: Direct same-origin dynamic import (fallback).
  // In some environments (e.g. web dev mode), this may work when the
  // Blob URL approach doesn't.
  await import(/* @vite-ignore */ versionedUrl);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the plugin list from `GET /api/plugins`, then load every plugin that
 * has a `frontend_entry` in parallel.  Failures are isolated per plugin so
 * one bad plugin never blocks the others.
 *
 * Returns a summary `{ loaded, failed }` for the caller to surface as an error.
 */
export async function loadAllPlugins(): Promise<{
  loaded: number;
  failed: string[];
}> {
  const failed: string[] = [];

  let plugins: PluginInfo[];
  try {
    const token = getApiToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(getApiUrl("/frontend_plugin"), { headers });
    if (!res.ok) {
      console.warn(`[PluginLoader] /api/plugins returned ${res.status}`);
      return { loaded: 0, failed: [] };
    }
    plugins = await res.json();
  } catch (err) {
    console.warn("[PluginLoader] failed to fetch plugin list:", err);
    return { loaded: 0, failed: [] };
  }

  // A disabled record can still carry a frontend entry, but its backend
  // routes/tools were deliberately not registered. Never expose a UI that
  // can only answer with 404s.
  const frontendPlugins = plugins.filter(
    (p) => p.frontend_entry && p.enabled !== false,
  );

  const results = await Promise.allSettled(
    frontendPlugins.map(async (p) => {
      await executePluginScript(
        resolveUrl(p.id, p.frontend_entry!),
        p.frontend_revision || p.version || "0",
      );
      console.info(`[PluginLoader] ✓ ${p.id}`);
    }),
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const msg = `${frontendPlugins[i].id}: ${r.reason}`;
      console.error(`[PluginLoader] ✗ ${msg}`);
      failed.push(msg);
    }
  });

  console.info(
    `[PluginLoader] ${frontendPlugins.length - failed.length}/${
      frontendPlugins.length
    } plugin(s) loaded`,
  );
  return { loaded: frontendPlugins.length - failed.length, failed };
}
