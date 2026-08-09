/**
 * Mount module — orchestrates the viewer lifecycle.
 *
 * This module separates the mounting logic from the engine implementation.
 * It creates the panel UI, instantiates the Three.js engine, and
 * wires up the state store to the engine.
 *
 * The mount module is called by the IIFE entry (viewer/index.tsx).
 */

import { ApiClient } from "../api/client";
import { createPanels, type PanelManager } from "../panels";
import { viewerStore } from "../stores/viewerState";
import type { ViewerMountOptions } from "../../bootstrap/viewerLoader";

export interface MountResult {
  dispose(): void;
  update(options: Partial<ViewerMountOptions>): void;
}

export function mountViewer(
  container: HTMLElement,
  options: ViewerMountOptions,
): MountResult {
  // Create API client
  const api = new ApiClient(options.apiBase, options.authToken);

  // Create UI panels
  const panels = createPanels(container);

  // Subscribe to store updates
  const unsubscribe = viewerStore.subscribe((state) => {
    panels.updateInfo(
      state.dataset
        ? `${state.dataset.name} — ${state.dataset.n_cells.toLocaleString()} cells`
        : "无数据集"
    );
    panels.updateMetrics(state.metrics);
  });

  // Build sidebar controls
  buildSidebarControls(panels.sidebar, api);

  return {
    dispose() {
      unsubscribe();
      panels.dispose();
    },
    update(newOptions) {
      if (newOptions.authToken !== undefined || newOptions.apiBase) {
        // Re-create API client with new options
        // (for future use when auth token refreshes)
      }
    },
  };
}

function buildSidebarControls(sidebar: HTMLElement, api: ApiClient) {
  // This function builds the sidebar DOM controls
  // It's a placeholder — the actual controls are built in viewer/index.tsx
  // In a future refactor, they will be moved here.
  const label = document.createElement("div");
  label.textContent = "Sidebar controls are built in the engine.";
  label.style.color = "#8b949e";
  label.style.fontSize = "12px";
  sidebar.appendChild(label);
}
