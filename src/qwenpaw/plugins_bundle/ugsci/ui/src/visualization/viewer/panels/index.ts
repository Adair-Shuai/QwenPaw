/**
 * UI panel components — sidebar, info bar, and property panel.
 *
 * These are plain DOM-based panels (not React components) because
 * the viewer runtime uses its own independent React root.
 * The bootstrap React provides the mount point; the viewer creates
 * DOM elements directly for maximum performance.
 */

import type { DatasetInfo } from "../contracts/types";

export interface PanelManager {
  sidebar: HTMLElement;
  infoBar: HTMLElement;
  hud: HTMLElement;
  updateDatasets(datasets: DatasetInfo[]): void;
  updateInfo(text: string): void;
  updateMetrics(metrics: { fps: number; frameTime: number; drawCalls: number; triangles: number; jsHeapMB: number }): void;
  dispose(): void;
}

const DARK_STYLE = {
  sidebar: {
    position: "absolute", top: "0", left: "0", bottom: "0",
    width: "280px", background: "rgba(13,17,23,0.92)",
    borderRight: "1px solid #30363d", overflowY: "auto",
    padding: "12px", boxSizing: "border-box", zIndex: "100",
    fontFamily: "-apple-system, sans-serif", color: "#c9d1d9",
    fontSize: "13px",
  },
  hud: {
    position: "absolute", top: "8px", right: "8px",
    background: "rgba(22,27,34,0.85)", border: "1px solid #30363d",
    borderRadius: "8px", padding: "10px 14px", fontSize: "12px",
    fontFamily: "monospace", pointerEvents: "none", zIndex: "10",
    minWidth: "160px",
  },
  infoBar: {
    position: "absolute", bottom: "8px", left: "8px",
    background: "rgba(22,27,34,0.85)", border: "1px solid #30363d",
    borderRadius: "8px", padding: "8px 12px", fontSize: "12px",
    fontFamily: "monospace", color: "#8b949e", pointerEvents: "none",
    maxWidth: "500px", zIndex: "10",
  },
} as const;

function applyStyles(el: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, styles);
}

export function createPanels(container: HTMLElement): PanelManager {
  // Sidebar
  const sidebar = document.createElement("div");
  applyStyles(sidebar, DARK_STYLE.sidebar as any);
  container.appendChild(sidebar);

  // HUD
  const hud = document.createElement("div");
  applyStyles(hud, DARK_STYLE.hud as any);
  const metrics = ["FPS", "Frame", "Draw Calls", "Triangles", "JS Heap"];
  for (const label of metrics) {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; justify-content: space-between; gap: 16px; margin: 2px 0;";
    const lbl = document.createElement("span");
    lbl.textContent = label;
    lbl.style.color = "#8b949e";
    const val = document.createElement("span");
    val.textContent = "—";
    val.style.color = "#58a6ff";
    val.style.fontWeight = "600";
    val.dataset.metric = label;
    row.appendChild(lbl);
    row.appendChild(val);
    hud.appendChild(row);
  }
  container.appendChild(hud);

  // Info bar
  const infoBar = document.createElement("div");
  applyStyles(infoBar, DARK_STYLE.infoBar as any);
  infoBar.textContent = "加载中...";
  container.appendChild(infoBar);

  return {
    sidebar,
    infoBar,
    hud,

    updateDatasets(datasets: DatasetInfo[]) {
      const select = sidebar.querySelector("#vis-dataset") as HTMLSelectElement;
      if (select) {
        select.innerHTML = "";
        for (const ds of datasets) {
          const opt = document.createElement("option");
          opt.value = ds.id;
          opt.textContent = `${ds.name} (${ds.n_cells.toLocaleString()} cells)`;
          select.appendChild(opt);
        }
      }
    },

    updateInfo(text: string) {
      infoBar.textContent = text;
    },

    updateMetrics(m) {
      const setMetric = (label: string, value: string) => {
        const el = hud.querySelector(`[data-metric="${label}"]`);
        if (el) el.textContent = value;
      };
      setMetric("FPS", m.fps.toFixed(0));
      setMetric("Frame", m.frameTime.toFixed(1) + "ms");
      setMetric("Draw Calls", String(m.drawCalls));
      setMetric("Triangles", m.triangles.toLocaleString());
      setMetric("JS Heap", m.jsHeapMB.toFixed(0) + " MB");
    },

    dispose() {
      [sidebar, hud, infoBar].forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    },
  };
}
