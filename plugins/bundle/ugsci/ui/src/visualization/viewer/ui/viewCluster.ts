/** Compact named-view cluster (ResInsight-style orientation cube substitute). */

import { NAMED_VIEWS, type NamedView } from "./standardViews";

export function createViewCluster(onPick: (view: NamedView) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "oilgas-view-cluster";
  root.style.cssText = [
    "position:absolute;display:grid;grid-template-columns:repeat(3,24px);gap:3px;",
    "padding:6px;background:rgba(13,17,23,.82);border:1px solid #30363d;",
    "border-radius:8px;z-index:18;pointer-events:auto;",
  ].join("");

  const order: Array<NamedView | null> = [
    null, "north", null,
    "west", "top", "east",
    null, "south", "iso",
    "bottom", null, null,
  ];
  const labels: Record<NamedView, string> = {
    top: "T",
    bottom: "B",
    north: "N",
    south: "S",
    east: "E",
    west: "W",
    iso: "3D",
  };

  for (const id of order) {
    if (!id) {
      const spacer = document.createElement("span");
      spacer.style.cssText = "width:24px;height:22px;";
      root.appendChild(spacer);
      continue;
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = labels[id];
    btn.title = NAMED_VIEWS.find((item) => item.id === id)?.label + " (" +
      (NAMED_VIEWS.find((item) => item.id === id)?.shortcut || "") + ")";
    btn.style.cssText = [
      "width:24px;height:22px;padding:0;border:1px solid #30363d;border-radius:4px;",
      "background:#21262d;color:#c9d1d9;cursor:pointer;font:600 10px/22px sans-serif;",
    ].join("");
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      onPick(id);
    });
    root.appendChild(btn);
  }
  return root;
}
