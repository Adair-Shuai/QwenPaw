/**
 * Benchmark module — performance measurement and reporting.
 *
 * Implements the benchmark protocol from Section 9:
 * - Fixed camera trajectory
 * - P50/P95/P99 frame time measurement
 * - Memory leak detection (10x mount/dispose)
 * - JSON/CSV export
 */

import type { BenchmarkResult } from "../engines/base";

const BENCHMARK_DURATION_MS = 5000;
const LEAK_TEST_CYCLES = 10;
const LEAK_THRESHOLD_MB = 100;

/**
 * Run a performance benchmark on a rendering engine.
 */
export async function runBenchmark(
  engine: { runBenchmark: () => Promise<BenchmarkResult> } | null,
  datasetId: string,
): Promise<BenchmarkResult> {
  if (engine?.runBenchmark) {
    return engine.runBenchmark();
  }

  // Fallback: measure frame times directly
  const times: number[] = [];
  const start = performance.now();
  let lastTime = start;

  return new Promise((resolve) => {
    const measure = () => {
      const now = performance.now();
      if (lastTime > 0) {
        times.push(now - lastTime);
      }
      lastTime = now;

      if (now - start < BENCHMARK_DURATION_MS) {
        requestAnimationFrame(measure);
      } else {
        times.sort((a, b) => a - b);
        const p50 = times[Math.floor(times.length * 0.5)] || 0;
        const p95 = times[Math.floor(times.length * 0.95)] || 0;
        const p99 = times[Math.floor(times.length * 0.99)] || 0;
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const heap = (performance as any).memory?.usedJSHeapSize || 0;

        resolve({
          datasetId,
          p50,
          p95,
          p99,
          fps: 1000 / avg,
          drawCalls: 0,
          triangles: 0,
          jsHeapMB: heap / 1024 / 1024,
          duration: BENCHMARK_DURATION_MS,
        });
      }
    };
    lastTime = 0;
    requestAnimationFrame(measure);
  });
}

/**
 * Memory leak test: mount and dispose the engine multiple times.
 */
export async function runLeakTest(
  mountFn: () => { dispose: () => void },
  cycles: number = LEAK_TEST_CYCLES,
): Promise<{ passed: boolean; retainedMB: number; threshold: number }> {
  const before = (performance as any).memory?.usedJSHeapSize || 0;

  for (let i = 0; i < cycles; i++) {
    const handle = mountFn();
    await new Promise((r) => setTimeout(r, 200));
    handle.dispose();
    await new Promise((r) => setTimeout(r, 100));
  }

  const after = (performance as any).memory?.usedJSHeapSize || 0;
  const retainedMB = (after - before) / 1024 / 1024;

  return {
    passed: retainedMB <= LEAK_THRESHOLD_MB,
    retainedMB,
    threshold: LEAK_THRESHOLD_MB,
  };
}

/**
 * Export benchmark results as CSV.
 */
export function exportCSV(results: BenchmarkResult[]): string {
  const headers = [
    "datasetId", "p50", "p95", "p99", "fps",
    "drawCalls", "triangles", "jsHeapMB", "duration",
  ];
  const rows = results.map((r) => [
    r.datasetId, r.p50.toFixed(2), r.p95.toFixed(2), r.p99.toFixed(2),
    r.fps.toFixed(1), r.drawCalls, r.triangles,
    r.jsHeapMB.toFixed(0), r.duration,
  ]);
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
}

/**
 * Export benchmark results as JSON.
 */
export function exportJSON(results: BenchmarkResult[]): string {
  return JSON.stringify(results, null, 2);
}

// Acceptance thresholds from Section 9.5
export const ACCEPTANCE_THRESHOLDS = {
  synthetic_s_first_frame: 3000,   // ≤ 3s
  synthetic_m_first_frame: 8000,   // ≤ 8s
  synthetic_l_first_frame: 15000,  // ≤ 15s
  synthetic_m_p50_fps: 30,         // ≥ 30 FPS
  synthetic_m_p95_frame: 50,       // ≤ 50ms
  property_switch: 1000,           // ≤ 1s
  cached_timestep_switch: 500,    // ≤ 500ms
  cell_pick: 200,                 // ≤ 200ms
  synthetic_m_rss: 1024,           // ≤ 1 GiB
  leak_retained: 100,             // ≤ 100 MiB
  bootstrap_size: 150 * 1024,     // ≤ 150 KiB
  no_viewer_load: 0,              // 0 requests before page open
};
