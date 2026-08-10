/**
 * Mount module — orchestrates the viewer lifecycle.
 *
 * This module separates the mounting logic from the engine implementation.
 * It creates the panel UI, instantiates the Three.js engine, and
 * wires up the state store to the engine.
 *
 * The mount module is called by the IIFE entry (viewer/index.tsx).
 */

import { viewerStore } from "./stores/viewerState";
import { threeEngineAdapter } from "./engines/three-engine";
import type { ViewerMountOptions, ViewerHandle } from "./contracts/types";

export type MountResult = ViewerHandle;

export function mountViewer(
  container: HTMLElement,
  options: ViewerMountOptions,
): MountResult {
  // The runtime host owns engine selection and lifecycle.  The Three.js
  // implementation still owns its legacy DOM panels for now, but it is now
  // reached through the RenderingEngine contract rather than a global mount
  // call.  This is the compatibility seam for future panel extraction.
  const engine = threeEngineAdapter.create({ container, ...options });

  return {
    executeCommand: (command, args) => {
      if (!engine.executeCommand) {
        return Promise.reject(new Error("Viewer command execution unavailable"));
      }
      return engine.executeCommand(command, args);
    },
    dispose() {
      engine.dispose();
      viewerStore.reset();
    },
    update(newOptions) {
      engine.update?.(newOptions);
    },
  };
}
