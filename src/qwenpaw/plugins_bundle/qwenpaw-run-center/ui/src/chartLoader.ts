/** Charts are a separate ES module so opening Run Center does not load ECharts. */
let pending: Promise<any> | null = null;
let attempts = 0;

export function loadSimulationCharts(host: any): Promise<any> {
  if (!pending) {
    // frontend_plugin serves public, read-only plugin assets (including .mjs).
    // Result data continues to use the authenticated host.fetch transport.
    // The host can execute this bundle from a blob URL. Resolve against the
    // page explicitly: a root-relative import cannot resolve from blob:.
    const base = new URL(
      host.getApiUrl(
        "frontend_plugin/qwenpaw-run-center/files/ui/dist/simulation-charts.mjs",
      ),
      window.location.href,
    ).href;
    // Leave the fixed filename unversioned: the host then revalidates it after
    // plugin updates instead of caching a constant ?v=1 forever.
    const url = attempts++ ? `${base}?retry=${attempts}` : base;
    pending = import(/* @vite-ignore */ url).catch((error) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}
