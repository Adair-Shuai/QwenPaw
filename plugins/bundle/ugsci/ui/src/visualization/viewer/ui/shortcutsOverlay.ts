/** Keyboard shortcut cheat sheet overlay. */

export function createShortcutsOverlay(): HTMLElement {
  const root = document.createElement("div");
  root.className = "oilgas-shortcuts";
  root.style.cssText = [
    "display:none;position:absolute;inset:48px 24px auto 24px;max-width:420px;",
    "background:rgba(13,17,23,.94);border:1px solid #30363d;border-radius:10px;",
    "padding:14px 16px;z-index:80;color:#c9d1d9;",
    "font:12px/1.5 -apple-system,sans-serif;box-shadow:0 16px 40px rgba(0,0,0,.4);",
  ].join("");
  root.innerHTML = [
    "<div style='font-weight:700;margin-bottom:8px;color:#e6edf3;'>\u5feb\u6377\u952e</div>",
    "<div>Alt+T/B/N/S/E/W/I \u2014 \u9876/\u5e95/\u5317/\u5357/\u4e1c/\u897f/\u4e09\u7ef4\u89c6\u89d2</div>",
    "<div>F \u9002\u914d\u5168\u90e8 \u00b7 O \u6b63\u4ea4\u6295\u5f71 \u00b7 G \u5e95\u677f\u7f51\u683c</div>",
    "<div>I \u4ec5\u663e\u793a\u5f53\u524d \u00b7 H \u9690\u85cf \u00b7 A \u663e\u793a\u5168\u90e8</div>",
    "<div>Delete \u4ece\u76ee\u5f55\u79fb\u9664 \u00b7 ? \u6253\u5f00\u672c\u5217\u8868</div>",
    "<div>Esc \u5173\u95ed\u83dc\u5355</div>",
  ].join("");
  return root;
}

export function toggleShortcutsOverlay(root: HTMLElement): void {
  root.style.display = root.style.display === "none" || !root.style.display ? "block" : "none";
}

export function hideShortcutsOverlay(root: HTMLElement): void {
  root.style.display = "none";
}
