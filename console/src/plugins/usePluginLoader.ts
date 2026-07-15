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
  frontend_entry?: string;
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
 * Strategy (tries same-origin import first, falls back to Blob URL):
 *
 * 1. **Same-origin `import(url)`** — preferred. The plugin JS is served
 *    from the same origin as the console page, so `script-src: 'self'`
 *    (Tauri CSP) allows it. This works in Tauri desktop, web dev, and
 *    all modern browsers.
 *
 * 2. **Blob URL fallback** — if the same-origin import fails (e.g. the
 *    server doesn't return the correct `Content-Type` or the webview
 *    blocks cross-path imports), fall back to fetching the JS text and
 *    executing via a blob: URL. This requires `blob:` in `script-src`.
 */
async function executePluginScript(entryUrl: string): Promise<void> {
  // Append a cache-busting query parameter so the browser always fetches
  // the latest plugin bundle instead of serving a stale cached version.
  const cacheBustUrl = `${entryUrl}${
    entryUrl.includes("?") ? "&" : "?"
  }_t=${Date.now()}`;

  // Strategy 1: Direct same-origin dynamic import.
  // The plugin endpoint is public (no auth required), so we don't need
  // to pass an Authorization header.
  try {
    await import(/* @vite-ignore */ cacheBustUrl);
    return;
  } catch (directErr) {
    console.warn(
      `[PluginLoader] Direct import failed for ${entryUrl}, trying blob fallback:`,
      directErr,
    );
  }

  // Strategy 2: Fetch + Blob URL fallback.
  // Some webview environments may block `import()` of same-origin URLs
  // that are not regular `<script>` sources. The blob: approach creates
  // a truly same-origin module that bypasses such restrictions, at the
  // cost of requiring `blob:` in the CSP `script-src`.
  const token = getApiToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(cacheBustUrl, {
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${entryUrl}`);
  }

  const jsText = await response.text();
  const blobUrl = URL.createObjectURL(
    new Blob([jsText], { type: "application/javascript" }),
  );
  try {
    await import(/* @vite-ignore */ blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
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

  const frontendPlugins = plugins.filter((p) => p.frontend_entry);

  const results = await Promise.allSettled(
    frontendPlugins.map(async (p) => {
      await executePluginScript(resolveUrl(p.id, p.frontend_entry!));
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
