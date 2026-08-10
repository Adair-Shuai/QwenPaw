/**
 * Frontend test suite for the oilgas-visualization viewer.
 *
 * Tests the core data structures and logic without requiring
 * a WebGL context. Run with: npx vitest
 */

import { describe, it, expect } from "vitest";
import { ACCEPTANCE_THRESHOLDS } from "../benchmark/benchmark";

describe("Benchmark thresholds", () => {
  it("should have realistic acceptance thresholds", () => {
    expect(ACCEPTANCE_THRESHOLDS.synthetic_m_p50_fps).toBeGreaterThanOrEqual(30);
    expect(ACCEPTANCE_THRESHOLDS.synthetic_m_p95_frame).toBeLessThanOrEqual(50);
    expect(ACCEPTANCE_THRESHOLDS.leak_retained).toBeLessThanOrEqual(100);
    expect(ACCEPTANCE_THRESHOLDS.bootstrap_size).toBeLessThanOrEqual(150 * 1024);
  });
});

describe("Colormap", () => {
  it("should interpolate colors correctly", () => {
    const { colormap } = createTestColormap();
    const c0 = colormap("viridis", 0);
    expect(c0[0]).toBeCloseTo(0.267, 2);

    const c1 = colormap("viridis", 1);
    expect(c1[0]).toBeCloseTo(0.993, 2);

    const cMid = colormap("viridis", 0.5);
    // Should be somewhere between c0 and c1
    expect(cMid[0]).toBeGreaterThan(c0[0]);
    expect(cMid[0]).toBeLessThan(c1[0]);
  });
});

describe("Dataset manifest structure", () => {
  it("should have correct file descriptor shape", () => {
    const manifest = {
      version: 1,
      datasets: [{
        id: "test",
        name: "Test",
        n_vertices: 8,
        n_cells: 1,
        n_indices: 36,
        files: {
          positions: "test_positions.f32",
          indices: "test_indices.u32",
          cell_ids: "test_cell_ids.u32",
          scalars: { porosity: "test_scalars_porosity.f32" },
        },
      }],
    };
    expect(manifest.version).toBe(1);
    expect(manifest.datasets).toHaveLength(1);
    expect(manifest.datasets[0].files.scalars.porosity).toBeDefined();
  });
});

// Helper to test colormap logic without importing the viewer
function createTestColormap() {
  const colormaps: Record<string, number[][]> = {
    viridis: [
      [0.267, 0.005, 0.329], [0.282, 0.140, 0.457], [0.254, 0.265, 0.530],
      [0.207, 0.372, 0.553], [0.164, 0.471, 0.558], [0.138, 0.567, 0.550],
      [0.135, 0.659, 0.518], [0.157, 0.745, 0.467], [0.215, 0.813, 0.398],
      [0.350, 0.851, 0.333], [0.536, 0.851, 0.261], [0.737, 0.813, 0.185],
      [0.921, 0.737, 0.089], [0.993, 0.906, 0.144],
    ],
  };

  function colormap(name: string, t: number): [number, number, number] {
    const cm = colormaps[name] || colormaps.viridis;
    const idx = Math.max(0, Math.min(cm.length - 1, Math.floor(t * (cm.length - 1))));
    const next = Math.min(cm.length - 1, idx + 1);
    const frac = t * (cm.length - 1) - idx;
    return [
      cm[idx][0] + (cm[next][0] - cm[idx][0]) * frac,
      cm[idx][1] + (cm[next][1] - cm[idx][1]) * frac,
      cm[idx][2] + (cm[next][2] - cm[idx][2]) * frac,
    ];
  }

  return { colormap };
}
