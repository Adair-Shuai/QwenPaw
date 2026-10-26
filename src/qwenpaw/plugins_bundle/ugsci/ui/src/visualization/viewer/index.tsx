/** Lazy viewer runtime: concrete engines are registered behind the public mount contract. */
import { ThreeViewerEngine } from "./engines/ThreeViewerEngine";
import { mountViewer } from "./mount";
import { registerEngineFactory } from "./engines/registry";
import type { ViewerHandle, ViewerMountOptions } from "./contracts/types";

// ─── Engine registration and runtime API ────────────────────────────────────

/**
 * Register the concrete Three.js implementation behind the engine contract.
 * The registration happens once when the lazy runtime bundle is evaluated;
 * callers no longer need to reach through window.OilGasViewerRuntime to create
 * an engine.
 */
registerEngineFactory("three-reservoir", (options) => {
  const viewer = new ThreeViewerEngine(options.container, options);
  const command = (name: string, args: Record<string, unknown>) =>
    viewer.executeCommand(name, args);
  return {
    get ready() { return viewer.ready; },
    loadDataset: async (datasetId) => { await command("open", { datasetId }); },
    setProperty: (name) => { void command("set-property", { property: name }); },
    setColorMap: (name) => { void command("set-colormap", { colormap: name }); },
    setOpacity: (value) => { void command("set-opacity", { opacity: value }); },
    setWireframe: (enabled) => { void command("set-wireframe", { enabled }); },
    setView: (view) => { void command("set-view", { view }); },
    focusObject: (objectType, id) => { void command("focus", { objectType, objectId: id }); },
    captureScreenshot: () => viewer.captureScreenshot(false),
    runBenchmark: async () => command("benchmark", {}),
    executeCommand: command,
    update: (next) => viewer.update(next),
    dispose: () => viewer.dispose(),
  };
});

const OilGasViewerRuntime = {
  version: "0.4.0",
  registerEngine: registerEngineFactory,
  mount(element: HTMLElement, options: ViewerMountOptions): ViewerHandle {
    return mountViewer(element, options);
  },
};

(window as any).OilGasViewerRuntime = OilGasViewerRuntime;
export default OilGasViewerRuntime;
