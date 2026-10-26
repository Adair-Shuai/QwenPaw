/**
 * Mount module — orchestrates the viewer lifecycle.
 *
 * This module separates the mounting logic from the engine implementation.
 * It creates the panel UI, instantiates the Three.js engine, and
 * wires up the state store to the engine.
 *
 * The mount module is called by the IIFE entry (viewer/index.tsx).
 */

import { threeEngineAdapter } from "./engines/three-engine";
import { createEngine } from "./engines/registry";
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
  const engine = options.engineId
    ? createEngine(options.engineId, { container, ...options })
    : threeEngineAdapter.create({ container, ...options });
  let disposed = false;

  return {
    get ready() { return engine.ready; },
    executeCommand: (command, args) => {
      if (disposed) return Promise.reject(new Error("查看器已关闭"));
      if (!engine.executeCommand) {
        return Promise.reject(new Error("查看器暂不支持命令执行"));
      }
      return engine.executeCommand(command, args);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      engine.dispose();
    },
    update(newOptions) {
      if (disposed) return;
      engine.update?.(newOptions);
    },
  };
}
