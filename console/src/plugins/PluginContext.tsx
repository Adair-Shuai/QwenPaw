/**
 * PluginContext.tsx
 *
 * Reactive plugin context for the host application.
 * Subscribes to the PluginSystem singleton and exposes plugin-registered
 * routes and tool renderers to any component via usePlugins().
 *
 *  const { toolRenderConfig, pluginRoutes, loading, error } = usePlugins();
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { pluginSystem } from "./hostExternals";
import { loadAllPlugins } from "./usePluginLoader";
import { fetchBundledPluginStatus } from "../api/modules/plugin";
import { reportPluginUiVerification } from "../tauri/uiVerification";
import type { PluginRouteDeclaration } from "./hostExternals";
import {
  routeRegistry,
  subscribe as registrySubscribe,
} from "./registry/store";

/** Derive the legacy PluginRouteDeclaration[] shape from routeRegistry. */
function derivePluginRoutes(): PluginRouteDeclaration[] {
  // Include both legacy (registerRoutes shim) routes and any new route.add
  // registrations from a plugin source. Built-in `core.*` routes are excluded.
  return routeRegistry
    .snapshot()
    .filter((r) => r.source !== "core")
    .map((r) => ({
      path: r.path,
      component: r.Component,
      label: r.id,
      icon: "",
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────────────────────

export interface PluginContextValue {
  /** Map of tool-name → React component. Pass to `@agentscope-ai/chat`. */
  toolRenderConfig: Record<string, React.FC<Record<string, unknown>>>;
  /** Page routes registered by plugins. Inject into the router + sidebar. */
  pluginRoutes: PluginRouteDeclaration[];
  /** True until the initial plugin-load attempt completes. */
  loading: boolean;
  /** Non-null if one or more plugins failed to load. */
  error: string | null;
}

const PluginContext = createContext<PluginContextValue>({
  toolRenderConfig: {},
  pluginRoutes: [],
  loading: true,
  error: null,
});

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wrap your application root with `<PluginProvider>` once.
 * All descendants can then call `usePlugins()` to access plugin-registered
 * routes and tool renderers.
 */
export function PluginProvider({ children }: { children: React.ReactNode }) {
  const [toolRenderConfig, setToolRenderConfig] = useState<
    Record<string, React.FC<Record<string, unknown>>>
  >(
    pluginSystem.getToolRenderConfig() as Record<
      string,
      React.FC<Record<string, unknown>>
    >,
  );
  const [pluginRoutes, setPluginRoutes] = useState<PluginRouteDeclaration[]>(
    derivePluginRoutes(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Re-sync state whenever any plugin registers new capabilities — both
    // the legacy pluginSystem (toolRenderers) and the new registry
    // (routes via shim + direct route.add) notify on change.
    const unsubA = pluginSystem.subscribe(() => {
      setToolRenderConfig(
        pluginSystem.getToolRenderConfig() as Record<
          string,
          React.FC<Record<string, unknown>>
        >,
      );
    });
    const unsubB = registrySubscribe(() => {
      setPluginRoutes(derivePluginRoutes());
    });

    let loadPromise: Promise<void> | null = null;
    let reloadedAtRegistryReady = false;
    let reloadedAtReady = false;
    const load = () => {
      if (!loadPromise) {
        loadPromise = loadAllPlugins().then(async ({ failed }) => {
          setError(failed.length > 0 ? failed.join("; ") : null);
          await reportPluginUiVerification();
          setLoading(false);
        });
      }
      return loadPromise;
    };

    // Load all installed plugins and PawApps (non-fatal: one bad module
    // won’t block others). PawApps are 'app'-type plugins: the loader
    // executes their ui bundle, which self-registers the /apps/{id} route
    // so the App Center can render them inline.
    void load();

    // The backend deliberately lets the core UI become interactive before
    // bundled-plugin repair finishes. If the first plugin list was observed
    // during that repair window, refresh once after the atomic sync completes
    // so newly installed plugins appear without a full app restart.
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    let syncAttempts = 0;
    let pollCount = 0;
    let observedLoadedCount = -1;

    // Plugins are published by the backend shortly after the shell renders.
    // Poll quickly at first so newly registered plugins surface within a few
    // hundred ms instead of waiting up to a fixed 1.5s tick, then relax the
    // cadence once the initial burst is over to keep idle cost low.
    const nextPollDelay = () => (pollCount <= 10 ? 300 : 1500);

    const refreshPluginManifest = async () => {
      await load();
      if (cancelled) return;
      loadPromise = null;
      await load();
    };

    const pollBundleSync = async () => {
      pollCount += 1;
      try {
        const status = await fetchBundledPluginStatus();
        if (cancelled) return;
        if (status.state === "error") {
          // A transient dependency/install error should not permanently leave
          // the frontend with an empty plugin list. Retry a few times so a
          // later atomic repair can become visible without a full restart.
          syncAttempts += 1;
          if (syncAttempts < 8)
            timer = setTimeout(
              pollBundleSync,
              Math.min(5000, 1000 * syncAttempts),
            );
          return;
        }
        syncAttempts = 0;
        let refreshedThisPoll = false;
        const loadedCount = Math.max(0, status.loaded_count ?? 0);
        if (loadedCount > observedLoadedCount) {
          observedLoadedCount = loadedCount;
          await refreshPluginManifest();
          refreshedThisPoll = true;
        }
        if (status.state === "registry_ready") {
          if (!reloadedAtRegistryReady) {
            reloadedAtRegistryReady = true;
            if (!refreshedThisPoll) await refreshPluginManifest();
          }
          // Static plugin menus/routes are now available, but agent-dependent
          // plugin services may still be starting. Keep polling for `ready`.
        } else if (status.state === "ready") {
          if (!reloadedAtReady) {
            reloadedAtReady = true;
            // Perform one final authoritative manifest refresh. This also
            // keeps compatibility with backends that publish `ready` directly
            // without the intermediate registry_ready state.
            if (!refreshedThisPoll) await refreshPluginManifest();
          }
          return;
        }
      } catch {
        // Backend may still be accepting requests; retry below.
      }
      if (!cancelled) timer = setTimeout(pollBundleSync, nextPollDelay());
    };
    void pollBundleSync();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubA();
      unsubB();
    };
  }, []);

  return (
    <PluginContext.Provider
      value={{ toolRenderConfig, pluginRoutes, loading, error }}
    >
      {children}
    </PluginContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Consumer hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Consume the global plugin context.
 *
 * ```tsx
 * const { toolRenderConfig, pluginRoutes, loading } = usePlugins();
 * ```
 */
export function usePlugins(): PluginContextValue {
  return useContext(PluginContext);
}
