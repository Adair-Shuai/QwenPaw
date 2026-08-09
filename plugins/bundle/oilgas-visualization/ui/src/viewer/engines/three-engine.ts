/**
 * Three.js rendering engine — the primary 3D engine for the viewer.
 *
 * Delegates to the ThreeViewerEngine class which contains the full
 * Three.js implementation. This module provides the RenderingEngine
 * adapter that the mount module uses.
 */

import type { RenderingEngine, EngineHandle, EngineMountOptions } from "./base";

// Lazy import Three.js to keep the module boundary clean
let threeEngine: any = null;

async function loadThreeEngine() {
  if (threeEngine) return threeEngine;
  // Three.js is bundled into this IIFE, so we can import directly
  threeEngine = await import("three");
  return threeEngine;
}

export const threeEngineAdapter: RenderingEngine = {
  id: "three-reservoir",
  name: "Three.js Reservoir Engine",

  create(options: EngineMountOptions): EngineHandle {
    // The actual ThreeViewerEngine class is in the viewer's index.tsx
    // This is a thin adapter that delegates to the existing engine.
    // In a future refactor, the engine code will be moved here.
    throw new Error(
      "threeEngineAdapter.create() is a placeholder. " +
      "The actual ThreeViewerEngine is instantiated directly in viewer/index.tsx. " +
      "Future refactoring will extract it into this module."
    );
  },
};
