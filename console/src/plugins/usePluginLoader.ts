/**
 * usePluginLoader.ts — plugin loading utility
 *
 * Fetches the plugin list, then dynamically imports each frontend bundle
 * via a same-origin URL so plugins can self-register into the
 * `pluginSystem` singleton (hostExternals.ts).
 *
 * Exports `loadAllPlugins()` — the single function PluginContext calls —
 * plus `loadPawApp()` to mount one newly installed PawApp without a reload.
 */

import { getApiToken, getApiUrl } from "../api/config";
import { removePluginRuntime } from "./pluginRuntimeCleanup";
import { routeRegistry } from "./registry/store";

export interface PluginLoadSummary {
  loaded: number;
  failed: string[];
}

interface FrontendPluginInfo {
  id: string;
  name: string;
  enabled?: boolean;
  plugin_type?: string;
  frontend_entry?: string;
  version?: string;
  frontend_revision?: string;
}

// Plugin bundles register capabilities through global host APIs as a side
// effect. Re-executing the same bundle duplicates routes, menu items, chat
// slots, and React keys. Manifest refreshes must therefore be idempotent per
// plugin revision while still allowing an upgraded bundle to run.
const loadedPluginRevisions = new Map<string, string>();

const loadingApps = new Map<string, Promise<void>>();

function authHeaders(): Record<string, string> {
  const token = getApiToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function resolveUrl(pluginId: string, apiPath: string): string {
  return getApiUrl(`frontend_plugin/${pluginId}/files/${apiPath}`);
}

async function fetchFrontendPlugins(): Promise<FrontendPluginInfo[]> {
  const response = await fetch(getApiUrl("/frontend_plugin"), {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to list frontend plugins (${response.status})`);
  }
  return response.json();
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
  version?: string,
): Promise<void> {
  // Versioned URLs re-use the WebView disk cache between launches while still
  // invalidating immediately after a plugin upgrade.
  const versionedUrl = version
    ? `${entryUrl}${entryUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(
        version,
      )}`
    : entryUrl;

  // Strategy 1: Fetch + Blob URL import (most reliable in Tauri WebView).
  let response: Response;
  try {
    response = await fetch(versionedUrl, {
      headers: authHeaders(),
      cache: "default",
    });
  } catch (fetchError) {
    console.warn(
      `[PluginLoader] Failed to fetch ${entryUrl}, trying direct import:`,
      fetchError,
    );
    await import(/* @vite-ignore */ versionedUrl);
    return;
  }

  // An HTTP error is authoritative. A direct import would request the same
  // resource again and can mask the useful status with a module-loader error.
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${entryUrl}`);
  }

  try {
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

/** Load every installed frontend plugin during Console startup. */
export async function loadAllPlugins(): Promise<PluginLoadSummary> {
  let plugins: FrontendPluginInfo[];
  try {
    plugins = await fetchFrontendPlugins();
  } catch (error) {
    console.warn("[PluginLoader] failed to fetch plugin list:", error);
    return { loaded: 0, failed: [] };
  }

  // A disabled record can still carry a frontend entry, but its backend
  // routes/tools were deliberately not registered. Never expose a UI that
  // can only answer with 404s.
  const loadable = plugins.filter(
    (p) => p.frontend_entry && p.enabled !== false,
  );

  const results = await Promise.allSettled(
    loadable.map(async (p) => {
      const revision = p.frontend_revision || p.version || "0";
      const previousRevision = loadedPluginRevisions.get(p.id);
      if (previousRevision === revision) return;
      if (previousRevision !== undefined) {
        removePluginRuntime(p.id);
      }
      await executePluginScript(resolveUrl(p.id, p.frontend_entry!), revision);
      loadedPluginRevisions.set(p.id, revision);
      console.info(`[PluginLoader] ✓ ${p.id}`);
    }),
  );
  const failed = results.flatMap((result, index) =>
    result.status === "rejected"
      ? [`${loadable[index].id}: ${result.reason}`]
      : [],
  );
  return { loaded: loadable.length - failed.length, failed };
}

/** Load one newly installed PawApp without reloading the page. */
export function loadPawApp(appId: string, entryPage?: string): Promise<void> {
  const registered = () =>
    routeRegistry
      .snapshot()
      .some(
        (route) =>
          route.source === appId &&
          route.path.startsWith("/apps/") &&
          (!entryPage || route.path === entryPage),
      );
  if (registered()) return Promise.resolve();

  const pending = loadingApps.get(appId);
  if (pending) return pending;

  const promise = (async () => {
    const plugins = await fetchFrontendPlugins();
    const plugin = plugins.find((item) => item.id === appId);
    if (!plugin?.frontend_entry || plugin.plugin_type !== "app") {
      throw new Error(`PawApp frontend plugin not found: ${appId}`);
    }

    try {
      await executePluginScript(resolveUrl(plugin.id, plugin.frontend_entry));
      if (!registered()) {
        throw new Error(`PawApp ${appId} did not register its app route`);
      }
    } catch (error) {
      removePluginRuntime(appId);
      throw error;
    }
  })().finally(() => {
    loadingApps.delete(appId);
  });

  loadingApps.set(appId, promise);
  return promise;
}

/** Reset pending loads between unit tests. */
export function resetPawAppLoaderForTests(): void {
  loadingApps.clear();
}
