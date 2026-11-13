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
import { notifyPluginChange } from "../utils/pluginChangeEvents";

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
let observedManifestRevision = "";

const loadingPlugins = new Map<string, Promise<void>>();
const pendingRequests = new Map<
  string,
  { intent: number; promise: Promise<void> }
>();
let manifestRequest = 0;
let intentSequence = 0;
const pluginIntents = new Map<string, number>();

function clearRuntime(pluginId: string): void {
  removePluginRuntime(pluginId);
  loadedPluginRevisions.delete(pluginId);
}

/** Startup, refresh and explicit reload share one lifecycle per plugin. */
function enqueue(
  pluginId: string,
  operation: () => Promise<void>,
): Promise<void> {
  const previous = loadingPlugins.get(pluginId);
  const next = (previous ? previous.catch(() => undefined) : Promise.resolve())
    .then(operation)
    .finally(() => {
      if (loadingPlugins.get(pluginId) === next)
        loadingPlugins.delete(pluginId);
    });
  loadingPlugins.set(pluginId, next);
  return next;
}

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

/** Fetch authenticated scripts before evaluating them once. An evaluation
 * error can follow partial registration, so it must never trigger a second
 * import of the same code. Direct import is only a pre-evaluation fallback. */
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

interface LoadPluginOptions {
  force?: boolean;
  expectedType?: "app";
  entryPage?: string;
}

function hasAppRoute(pluginId: string, entryPage?: string): boolean {
  return routeRegistry
    .snapshot()
    .some(
      (route) =>
        route.source === pluginId &&
        route.path.startsWith("/apps/") &&
        (!entryPage || route.path === entryPage),
    );
}

async function executeFrontendPlugin(
  plugin: FrontendPluginInfo,
  options: LoadPluginOptions = {},
  prefetchedResponse?: Promise<Response | undefined>,
): Promise<void> {
  const revision = plugin.frontend_revision || plugin.version || "0";
  try {
    if (options.force || loadedPluginRevisions.get(plugin.id) !== revision) {
      clearRuntime(plugin.id);
      await executePluginScript(
        resolveUrl(plugin.id, plugin.frontend_entry!),
        revision,
        prefetchedResponse,
      );
    }
    if (
      options.expectedType === "app" &&
      !hasAppRoute(plugin.id, options.entryPage)
    ) {
      throw new Error(`PawApp ${plugin.id} did not register its app route`);
    }
    loadedPluginRevisions.set(plugin.id, revision);
  } catch (error) {
    clearRuntime(plugin.id);
    throw error;
  }
}

/** Load every installed frontend plugin during Console startup. */
export async function loadAllPlugins(
  beforeExecute?: Promise<unknown>,
): Promise<PluginLoadSummary> {
  const request = ++intentSequence;
  manifestRequest = request;
  let plugins: FrontendPluginInfo[];
  try {
    plugins = await fetchFrontendPlugins();
  } catch (error) {
    console.warn("[PluginLoader] failed to fetch plugin list:", error);
    return { loaded: 0, failed: [] };
  }
  // A slow earlier manifest must not restore plugins removed by a newer one.
  if (request !== manifestRequest) return { loaded: 0, failed: [] };
  observedManifestRevision = JSON.stringify(
    plugins
      .map((plugin) => [
        plugin.id,
        plugin.frontend_revision || plugin.version,
        plugin.enabled,
      ])
      .sort(),
  );
  const loadable = plugins.filter(
    (p) => p.frontend_entry && p.enabled !== false,
  );
  const loadableIds = new Set(loadable.map((plugin) => plugin.id));
  const removals = [
    ...new Set([...loadedPluginRevisions.keys(), ...loadingPlugins.keys()]),
  ]
    .filter(
      (id) => !loadableIds.has(id) && (pluginIntents.get(id) ?? 0) <= request,
    )
    .map((id) => {
      pluginIntents.set(id, request);
      return enqueue(id, async () => {
        if (pluginIntents.get(id) === request) clearRuntime(id);
      });
    });
  const loads = loadable.map((plugin) => {
    if ((pluginIntents.get(plugin.id) ?? 0) > request) return Promise.resolve();
    pluginIntents.set(plugin.id, request);
    const revision = plugin.frontend_revision || plugin.version || "0";
    const entryUrl = resolveUrl(plugin.id, plugin.frontend_entry!);
    const prefetched =
      loadedPluginRevisions.get(plugin.id) === revision
        ? undefined
        : fetchPluginScript(
            `${entryUrl}${
              entryUrl.includes("?") ? "&" : "?"
            }v=${encodeURIComponent(revision)}`,
          );
    return enqueue(plugin.id, async () => {
      await beforeExecute;
      if (request !== manifestRequest) return;
      await executeFrontendPlugin(plugin, {}, prefetched);
    });
  });
  const [results] = await Promise.all([
    Promise.allSettled(loads),
    Promise.all(removals),
  ]);
  const failed = results.flatMap((result, index) =>
    result.status === "rejected"
      ? [`${loadable[index].id}: ${result.reason}`]
      : [],
  );
  return { loaded: loadable.length - failed.length, failed };
}

function loadFrontendPlugin(
  pluginId: string,
  options: LoadPluginOptions = {},
): Promise<void> {
  const key = `${pluginId}:${!!options.force}:${options.expectedType || ""}:${
    options.entryPage || ""
  }`;
  const pending = pendingRequests.get(key);
  if (pending && pending.intent === pluginIntents.get(pluginId))
    return pending.promise;
  const intent = ++intentSequence;
  pluginIntents.set(pluginId, intent);
  const promise = enqueue(pluginId, async () => {
    const plugins = await fetchFrontendPlugins();
    const plugin = plugins.find((item) => item.id === pluginId);
    if (!plugin?.frontend_entry || plugin.enabled === false) {
      clearRuntime(pluginId);
      if (options.expectedType === "app") {
        throw new Error(`PawApp frontend plugin not found: ${pluginId}`);
      }
      return;
    }
    if (options.expectedType && plugin.plugin_type !== options.expectedType) {
      clearRuntime(pluginId);
      throw new Error(`PawApp frontend plugin not found: ${pluginId}`);
    }
    await executeFrontendPlugin(plugin, options);
  }).finally(() => {
    if (pendingRequests.get(key)?.promise === promise)
      pendingRequests.delete(key);
  });
  pendingRequests.set(key, { intent, promise });
  return promise;
}

/** Load one newly installed PawApp without reloading the page. */
export function loadPawApp(
  appId: string,
  entryPage?: string,
  options: { force?: boolean } = {},
): Promise<void> {
  return loadFrontendPlugin(appId, {
    ...options,
    expectedType: "app",
    entryPage,
  });
}

/** Force reload an installed PawApp after an update. */
export function reloadPawApp(appId: string, entryPage?: string): Promise<void> {
  return loadFrontendPlugin(appId, {
    expectedType: "app",
    entryPage,
    force: true,
  });
}

/** Reload a frontend plugin after installation or update. */
export function reloadFrontendPlugin(pluginId: string): Promise<boolean> {
  return loadFrontendPlugin(pluginId, { force: true }).then(() => true);
}

/** Revoke unavailable UI after an authoritative backend state change. */
export function unloadFrontendPlugin(
  pluginId: string,
  beforeRemove?: () => void,
): Promise<void> {
  pluginIntents.set(pluginId, ++intentSequence);
  return enqueue(pluginId, async () => {
    try {
      beforeRemove?.();
    } finally {
      clearRuntime(pluginId);
    }
  });
}

/** Reset pending loads between unit tests. */
export function resetPawAppLoaderForTests(): void {
  loadingPlugins.clear();
  pendingRequests.clear();
  loadedPluginRevisions.clear();
  observedManifestRevision = "";
  manifestRequest = 0;
  intentSequence = 0;
  pluginIntents.clear();
}

/** Observe backend hot updates in every open browser and native window. */
export async function synchronizeFrontendPlugins(): Promise<void> {
  const previous = JSON.stringify([...loadedPluginRevisions]);
  const previousManifest = observedManifestRevision;
  await loadAllPlugins();
  if (
    JSON.stringify([...loadedPluginRevisions]) !== previous ||
    observedManifestRevision !== previousManifest
  )
    notifyPluginChange();
}
