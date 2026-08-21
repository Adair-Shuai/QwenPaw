/** Viewport HUD: hover coordinates and selected-object metadata. */

export interface ReadoutState {
  hover: [number, number, number] | null;
  selectedLabel: string;
  selectedMeta: string;
  pickKind: string;
}

export function createReadoutPanel(): HTMLElement {
  const el = document.createElement("div");
  el.className = "oilgas-readout";
  Object.assign(el.style, {
    position: "absolute",
    minWidth: "210px",
    maxWidth: "280px",
    background: "rgba(13,17,23,.92)",
    border: "1px solid #30363d",
    borderRadius: "8px",
    padding: "8px 10px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: "11px",
    color: "#c9d1d9",
    pointerEvents: "none",
    zIndex: "18",
    boxSizing: "border-box",
  } as CSSStyleDeclaration);
  el.innerHTML = [
    '<div style="color:#8b949e;font:600 10px/1 -apple-system,sans-serif;letter-spacing:.06em;margin-bottom:6px;">SELECTED</div>',
    '<div data-readout="selected" style="color:#e6edf3;font-weight:600;margin-bottom:2px;">—</div>',
    '<div data-readout="meta" style="color:#8b949e;margin-bottom:8px;">将指针移到场景中拾取</div>',
    '<div style="color:#8b949e;font:600 10px/1 -apple-system,sans-serif;letter-spacing:.06em;margin-bottom:6px;">READOUT</div>',
    row("Easting", "easting"),
    row("Northing", "northing"),
    row("TVD", "tvd"),
  ].join("");
  return el;
}

function row(label: string, key: string): string {
  return [
    '<div style="display:flex;justify-content:space-between;gap:12px;margin:2px 0;">',
    '<span style="color:#8b949e;">' + label + "</span>",
    '<span data-readout="' + key + '" style="color:#58a6ff;font-weight:600;">—</span>',
    "</div>",
  ].join("");
}

export function updateReadout(el: HTMLElement, state: ReadoutState) {
  const selected = el.querySelector('[data-readout="selected"]');
  const meta = el.querySelector('[data-readout="meta"]');
  if (selected) selected.textContent = state.selectedLabel || "—";
  if (meta) meta.textContent = state.selectedMeta || (state.pickKind ? state.pickKind : "未选中对象");
  const coords = state.hover;
  setValue(el, "easting", coords ? formatCoord(coords[0]) : "—");
  setValue(el, "northing", coords ? formatCoord(coords[1]) : "—");
  setValue(el, "tvd", coords ? formatCoord(coords[2]) : "—");
}

function setValue(root: HTMLElement, key: string, value: string) {
  const el = root.querySelector('[data-readout="' + key + '"]');
  if (el) el.textContent = value;
}

export function formatCoord(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000) return value.toFixed(1);
  if (abs >= 1) return value.toFixed(2);
  return value.toPrecision(4);
}
