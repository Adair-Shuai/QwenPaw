/**
 * Three.js rendering engine — the primary 3D engine for the viewer.
 *
 * Delegates to the ThreeViewerEngine class which contains the full
 * Three.js implementation. This module provides the RenderingEngine
 * adapter that the mount module uses.
 */

import type { RenderingEngine, EngineHandle, EngineMountOptions } from "./base";
import { createRegisteredEngine } from "./registry";

export const threeEngineAdapter: RenderingEngine = {
  id: "three-reservoir",
  name: "Three.js Reservoir Engine",

  create(options: EngineMountOptions): EngineHandle {
    return createRegisteredEngine(threeEngineAdapter, options);
  },
};
