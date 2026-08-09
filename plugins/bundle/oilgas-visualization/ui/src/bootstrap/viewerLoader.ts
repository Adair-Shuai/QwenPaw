/**
 * Lazy loader for the Three.js viewer runtime.
 *
 * The viewer runtime is a separate IIFE bundle that contains
 * Three.js, OrbitControls, and all rendering logic.
 * It is only loaded when the user actually opens the visualization page.
 *
 * This keeps the bootstrap entry point under 150 KiB.
 */

export interface ViewerRuntime {
  mount(
    element: HTMLElement,
    options: ViewerMountOptions,
  ): ViewerHandle;
  version: string;
}

export interface ViewerMountOptions {
  apiBase: string;
  authToken?: string;
}

export interface ViewerHandle {
  update(options: Partial<ViewerMountOptions>): void;
  dispose(): Promise<void> | void;
}

let runtimePromise: Promise<ViewerRuntime> | null = null;

/**
 * Load the viewer runtime IIFE script.
 * Uses direct <script src> for same-origin resources.
 */
export function loadViewerRuntime(): Promise<ViewerRuntime> {
  if (runtimePromise) return runtimePromise;

  runtimePromise = (async () => {
    const host = (window as any).QwenPaw?.host;
    if (!host?.getApiUrl) {
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    }

    // The viewer runtime is served by the plugin's static file handler.
    // In production, this is a content-hashed filename written by the build.
    // In development, we use a fixed name.
    const url = host.getApiUrl(
      "frontend_plugin/oilgas-visualization/files/ui/dist/viewer-runtime.js",
    );

    console.info("[oilgas-vis] Loading viewer runtime from", url);

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.dataset.plugin = "oilgas-visualization";
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Viewer runtime failed to load"));
      document.head.appendChild(script);
    });

    const runtime = (window as any).OilGasViewerRuntime;
    if (!runtime) {
      throw new Error(
        "[oilgas-vis] window.OilGasViewerRuntime not found after script load",
      );
    }

    console.info(
      "[oilgas-vis] Viewer runtime loaded, version:",
      runtime.version,
    );
    return runtime as ViewerRuntime;
  })().catch((err) => {
    // Clear so retry is possible
    runtimePromise = null;
    throw err;
  });

  return runtimePromise;
}

/**
 * Wait for the Workspace SDK to be available.
 * QwenPaw installs it asynchronously, so we poll.
 */
export async function waitForWorkspaceSdk(
  timeoutMs = 10_000,
): Promise<any | null> {
  const started = performance.now();
  while (!(window as any).QwenPaw?.workspace) {
    if (performance.now() - started > timeoutMs) return null;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return (window as any).QwenPaw.workspace;
}
