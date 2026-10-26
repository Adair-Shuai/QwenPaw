/** Right-click context menu used by the component tree and 3D canvas. */

export interface ContextMenuItem {
  id: string;
  label: string;
  danger?: boolean;
  disabled?: boolean;
}

const openMenus = new WeakMap<HTMLElement, () => void>();

export function closeContextMenu(host: HTMLElement): void {
  openMenus.get(host)?.();
}

export function showContextMenu(
  host: HTMLElement,
  clientX: number,
  clientY: number,
  items: ContextMenuItem[],
  onPick: (id: string) => void,
): () => void {
  closeContextMenu(host);
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const menu = document.createElement("div");
  menu.className = "oilgas-context-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "对象操作");
  menu.tabIndex = -1;
  menu.style.cssText = [
    "position:fixed;z-index:400;width:180px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;box-sizing:border-box;",
    "background:#161b22;border:1px solid #30363d;border-radius:8px;",
    "padding:4px;box-shadow:0 12px 32px rgba(0,0,0,.45);",
    "font:12px/1.4 -apple-system,sans-serif;",
  ].join("");
  const rect = host.getBoundingClientRect();
  const left = Math.max(8, rect.left);
  const top = Math.max(8, rect.top);
  menu.style.left = Math.max(left, Math.min(clientX, Math.min(rect.right, window.innerWidth) - 188)) + "px";
  menu.style.top = Math.max(top, Math.min(clientY, Math.min(rect.bottom, window.innerHeight) - 12 - items.length * 32)) + "px";

  for (const item of items) {
    const row = document.createElement("button");
    row.type = "button";
    row.setAttribute("role", "menuitem");
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
      close();
      if (!item.disabled) onPick(item.id);
    });
    menu.appendChild(row);
  }

  const close = () => {
    menu.remove();
    observer.disconnect();
    window.removeEventListener("mousedown", onDown, true);
    menu.removeEventListener("keydown", onKey);
    if (openMenus.get(host) === close) openMenus.delete(host);
    if (previousFocus?.isConnected && (document.activeElement === document.body || menu.contains(document.activeElement))) previousFocus.focus();
  };
  const onDown = (event: MouseEvent) => {
    if (!menu.contains(event.target as Node)) close();
  };
  const onKey = (event: KeyboardEvent) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      const buttons = Array.from(menu.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
        : (current + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    } else if (event.key === "Tab") close();
  };
  const observer = new MutationObserver(() => { if (!menu.isConnected) close(); });
  observer.observe(host, { childList: true });
  window.addEventListener("mousedown", onDown, true);
  menu.addEventListener("keydown", onKey);
  host.appendChild(menu);
  openMenus.set(host, close);
  (menu.querySelector<HTMLButtonElement>("button:not(:disabled)") || menu).focus();
  return close;
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
