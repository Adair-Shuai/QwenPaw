/**
 * Viewer application layer — view routing and tab management.
 *
 * Manages which engine is active based on the current view type
 * and coordinates cross-view selection sync.
 */

import type { ViewType } from "../contracts/types";
import { viewerStore } from "../stores/viewerState";

export class ViewRouter {
  private container: HTMLElement;
  private currentView: ViewType = "reservoir";
  private tabs = new Map<ViewType, HTMLElement>();
  private onChange: ((view: ViewType) => void) | null;

  // View tab labels
  static readonly VIEW_LABELS: Record<ViewType, string> = {
    reservoir: "储层 3D",
    wellbore: "井筒 3D",
    intersection: "剖面",
    welllog: "测井",
    network: "管网",
    benchmark: "基准测试",
  };

  static readonly VIEWS = Object.keys(ViewRouter.VIEW_LABELS) as ViewType[];

  constructor(container: HTMLElement, onChange?: (view: ViewType) => void) {
    this.container = container;
    this.onChange = onChange || null;
  }

  switchTo(view: ViewType) {
    this.currentView = view;
    viewerStore.setActiveView(view);
    for (const [candidate, tab] of this.tabs) {
      tab.style.background = candidate === view ? "rgba(31,111,235,.28)" : "rgba(22,27,34,0.6)";
      tab.style.color = candidate === view ? "#e6edf3" : "#8b949e";
      tab.setAttribute("aria-selected", String(candidate === view));
    }
    this.onChange?.(view);
  }

  getActiveView(): ViewType {
    return this.currentView;
  }

  createTabs(): HTMLElement {
    const tabs = document.createElement("div");
    Object.assign(tabs.style, {
      position: "absolute", top: "0", left: "280px",
      display: "flex", gap: "0", zIndex: "50",
    } as CSSStyleDeclaration);

    for (const view of ViewRouter.VIEWS) {
      const tab = document.createElement("div");
      tab.textContent = ViewRouter.VIEW_LABELS[view];
      Object.assign(tab.style, {
        padding: "8px 16px", cursor: "pointer",
        background: "rgba(22,27,34,0.6)",
        border: "1px solid #30363d",
        borderRadius: "6px 6px 0 0",
        color: "#8b949e", fontSize: "13px",
        fontFamily: "-apple-system, sans-serif",
        userSelect: "none",
      } as CSSStyleDeclaration);

      tab.addEventListener("click", () => this.switchTo(view));
      tab.addEventListener("mouseenter", () => {
        tab.style.background = "rgba(88,166,255,0.15)";
      });
      tab.addEventListener("mouseleave", () => {
        const active = this.currentView === view;
        tab.style.background = active ? "rgba(31,111,235,.28)" : "rgba(22,27,34,0.6)";
        tab.style.color = active ? "#e6edf3" : "#8b949e";
      });

      tabs.appendChild(tab);
      this.tabs.set(view, tab);
    }

    this.switchTo(this.currentView);

    return tabs;
  }
}
