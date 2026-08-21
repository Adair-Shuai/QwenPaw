/** Right-click context menu used by the component tree and 3D canvas. */

export interface ContextMenuItem {
  id: string;
  label: string;
  danger?: boolean;
  disabled?: boolean;
}

export function showContextMenu(
  host: HTMLElement,
  clientX: number,
  clientY: number,
  items: ContextMenuItem[],
  onPick: (id: string) => void,
): void {
  host.querySelectorAll(".oilgas-context-menu").forEach((node) => node.remove());
  const menu = document.createElement("div");
  menu.className = "oilgas-context-menu";
  menu.style.cssText = [
    "position:fixed;z-index:400;min-width:168px;",
    "background:#161b22;border:1px solid #30363d;border-radius:8px;",
    "padding:4px;box-shadow:0 12px 32px rgba(0,0,0,.45);",
    "font:12px/1.4 -apple-system,sans-serif;",
  ].join("");
  const rect = host.getBoundingClientRect();
  menu.style.left = Math.min(clientX, rect.right - 180) + "px";
  menu.style.top = Math.min(clientY, rect.bottom - 12 - items.length * 28) + "px";

  for (const item of items) {
    const row = document.createElement("button");
    row.type = "button";
    row.textContent = item.label;
    row.disabled = Boolean(item.disabled);
    row.style.cssText = [
      "display:block;width:100%;text-align:left;padding:7px 10px;border:0;border-radius:5px;",
      "background:transparent;cursor:pointer;font:12px/1.3 -apple-system,sans-serif;",
      item.danger ? "color:#f85149;" : "color:#c9d1d9;",
      item.disabled ? "opacity:.45;cursor:default;" : "",
    ].join("");
    row.addEventListener("mouseenter", () => {
      if (!item.disabled) row.style.background = "rgba(31,111,235,.28)";
    });
    row.addEventListener("mouseleave", () => {
      row.style.background = "transparent";
    });
    row.addEventListener("click", (event) => {
      event.stopPropagation();
      menu.remove();
      if (!item.disabled) onPick(item.id);
    });
    menu.appendChild(row);
  }

  const close = () => {
    menu.remove();
    window.removeEventListener("mousedown", onDown, true);
    window.removeEventListener("keydown", onKey);
  };
  const onDown = (event: MouseEvent) => {
    if (!menu.contains(event.target as Node)) close();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  };
  window.addEventListener("mousedown", onDown, true);
  window.addEventListener("keydown", onKey);
  host.appendChild(menu);
}

export function objectContextItems(hasTarget: boolean): ContextMenuItem[] {
  return [
    { id: "focus", label: "\u805a\u7126 / \u9002\u914d", disabled: !hasTarget },
    { id: "isolate", label: "\u4ec5\u663e\u793a\u6b64\u9879", disabled: !hasTarget },
    { id: "hide", label: "\u9690\u85cf", disabled: !hasTarget },
    { id: "show-all", label: "\u663e\u793a\u5168\u90e8" },
    { id: "delete", label: "\u5220\u9664", danger: true, disabled: !hasTarget },
  ];
}
