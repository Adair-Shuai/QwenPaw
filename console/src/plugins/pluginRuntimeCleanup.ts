import { pluginSystem } from "./hostExternals";
import { chatExtensions } from "./registry/chatExtensions";
import { menuRegistry, routeRegistry, slotRegistry } from "./registry/store";
import { marketplaceExtensionRegistry } from "../pages/Market/marketplaceRegistry";
import { memoryBackendRegistry } from "./memoryBackends";

/** Remove every host-managed registration owned by one frontend plugin. */
export function removePluginRuntime(pluginId: string): void {
  // OpenUI also publishes an optional renderer shared with Run Center.
  // Revoke it with the owning plugin, including when its disposer fails.
  if (pluginId === "qwenpaw-openui" && typeof window !== "undefined") {
    const namespace = (window as unknown as {
      QwenPaw?: { openui?: { dispose?: () => void } };
    }).QwenPaw;
    const runtime = namespace?.openui;
    try {
      runtime?.dispose?.();
    } catch (error) {
      console.warn("[PluginLoader] OpenUI cleanup failed", error);
    } finally {
      if (runtime && namespace?.openui === runtime) {
        delete namespace.openui;
        window.dispatchEvent(new Event("qwenpaw:openui-task-layout-ready"));
      }
    }
  }
  menuRegistry.removeBySource(pluginId);
  routeRegistry.removeBySource(pluginId);
  slotRegistry.removeBySource(pluginId);
  marketplaceExtensionRegistry.removeBySource(pluginId);
  memoryBackendRegistry.removeBySource(pluginId);
  pluginSystem.removePlugin(pluginId);
  chatExtensions.disposeAll(pluginId);
}
