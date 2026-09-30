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

const loadingPlugins = new Map<string, Promise<void>>();

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
  prefetchedResponse?: Promise<Response | undefined>,
): Promise<void> {
  // Versioned URLs re-use the WebView disk cache between launches while still
  // invalidating immediately after a plugin upgrade.
  const versionedUrl = version
    ? `${entryUrl}${entryUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(
        version,
      )}`
    : entryUrl;

  // Strategy 1: Fetch + Blob URL import (most reliable in Tauri WebView).
  const response = await (prefetchedResponse ??
    fetchPluginScript(versionedUrl));

  // An HTTP error is authoritative. A direct import would request the same
  // resource again and can mask the useful status with a module-loader error.
  if (response && !response.ok) {
    throw new Error(`HTTP ${response.status} for ${entryUrl}`);
  }

  if (response) {
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
  }

  // Strategy 2: Direct same-origin dynamic import (fallback).
  // In some environments (e.g. web dev mode), this may work when the
  // Blob URL approach doesn't.
  await import(/* @vite-ignore */ versionedUrl);
}

function fetchPluginScript(
  versionedUrl: string,
): Promise<Response | undefined> {
  return fetch(versionedUrl, {
    headers: authHeaders(),
    cache: "default",
  }).catch((fetchError) => {
    console.warn(
      `[PluginLoader] Failed to fetch ${versionedUrl}, will try direct import fallback:`,
      fetchError,
    );
    return undefined;
  });
}

/** Load every installed frontend plugin during Console startup. */
export async function loadAllPlugins(
  beforeExecute?: Promise<unknown>,
): Promise<PluginLoadSummary> {
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
  const loadableIds = new Set(loadable.map((plugin) => plugin.id));
  for (const pluginId of loadedPluginRevisions.keys()) {
    if (loadableIds.has(pluginId)) continue;
    removePluginRuntime(pluginId);
    loadedPluginRevisions.delete(pluginId);
  }

  // Fetch bundles while the host SDK is initializing. Their registration
  // side effects still run only after the host is ready.
  const prefetched = loadable.map((plugin) => {
    const revision = plugin.frontend_revision || plugin.version || "0";
    if (loadedPluginRevisions.get(plugin.id) === revision) return undefined;
    const entryUrl = resolveUrl(plugin.id, plugin.frontend_entry!);
    const versionedUrl = `${entryUrl}${
      entryUrl.includes("?") ? "&" : "?"
    }v=${encodeURIComponent(revision)}`;
    return fetchPluginScript(versionedUrl);
  });
  await beforeExecute;

  const results = await Promise.allSettled(
    loadable.map(async (p, index) => {
      const revision = p.frontend_revision || p.version || "0";
      const previousRevision = loadedPluginRevisions.get(p.id);
      if (previousRevision === revision) return;
      if (previousRevision !== undefined) {
        removePluginRuntime(p.id);
      }
      await executePluginScript(
        resolveUrl(p.id, p.frontend_entry!),
        revision,
        prefetched[index],
      );
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
interface LoadPluginOptions {
  force?: boolean;
  expectedType?: "app";
  entryPage?: string;
}

function loadFrontendPlugin(
  pluginId: string,
  options: LoadPluginOptions = {},
): Promise<void> {
  const registered = () =>
    routeRegistry
      .snapshot()
      .some(
        (route) =>
          route.source === pluginId &&
          route.path.startsWith("/apps/") &&
          (!options.entryPage || route.path === options.entryPage),
      );
  if (!options.force && options.expectedType === "app" && registered()) {
    return Promise.resolve();
  }

  const promise = (async () => {
    const plugins = await fetchFrontendPlugins();
    const plugin = plugins.find((item) => item.id === pluginId);
    if (!plugin?.frontend_entry || plugin.enabled === false) {
      if (options.expectedType === "app") {
        throw new Error(`PawApp frontend plugin not found: ${pluginId}`);
      }
      return;
    }
    if (options.expectedType && plugin.plugin_type !== options.expectedType) {
      throw new Error(`PawApp frontend plugin not found: ${pluginId}`);
    }

    try {
      if (options.force) {
        removePluginRuntime(pluginId);
        loadedPluginRevisions.delete(pluginId);
      }
      const revision = plugin.frontend_revision || plugin.version || "0";
      await executePluginScript(
        resolveUrl(plugin.id, plugin.frontend_entry),
        revision,
      );
      loadedPluginRevisions.set(plugin.id, revision);
      if (options.expectedType === "app" && !registered()) {
        throw new Error(`PawApp ${pluginId} did not register its app route`);
      }
    } catch (error) {
      removePluginRuntime(pluginId);
      loadedPluginRevisions.delete(pluginId);
      throw error;
    }
  })().finally(() => {
    loadingPlugins.delete(pluginId);
  });

  loadingPlugins.set(pluginId, promise);
  return promise;
}

/** Load one newly installed PawApp without reloading the page. */
export function loadPawApp(
  appId: string,
  entryPage?: string,
  options: { force?: boolean } = {},
): Promise<void> {
  if (options.force) return reloadPawApp(appId, entryPage);
  const pending = loadingPlugins.get(appId);
  if (pending) return pending;
  return loadFrontendPlugin(appId, {
    expectedType: "app",
    entryPage,
  });
}

/** Force reload an installed PawApp after an update. */
export function reloadPawApp(appId: string, entryPage?: string): Promise<void> {
  const pending = loadingPlugins.get(appId);
  if (pending) {
    return pending.then(() =>
      loadFrontendPlugin(appId, {
        expectedType: "app",
        entryPage,
        force: true,
      }),
    );
  }
  return loadFrontendPlugin(appId, {
    expectedType: "app",
    entryPage,
    force: true,
  });
}

/** Reload a frontend plugin after installation or update. */
export function reloadFrontendPlugin(pluginId: string): Promise<boolean> {
  const pending = loadingPlugins.get(pluginId);
  if (pending) {
    return pending.then(() =>
      loadFrontendPlugin(pluginId, { force: true }).then(() => true),
    );
  }
  return loadFrontendPlugin(pluginId, { force: true }).then(() => true);
}

/** Reset pending loads between unit tests. */
export function resetPawAppLoaderForTests(): void {
  loadingPlugins.clear();
  loadedPluginRevisions.clear();
}
