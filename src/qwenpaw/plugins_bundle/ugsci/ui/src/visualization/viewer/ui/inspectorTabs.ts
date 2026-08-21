/**
 * Right-rail inspector: Controls / Actions / Addons tabs and Name/Control rows.
 */

export type InspectorTabId = "controls" | "actions" | "addons";

export const INSPECTOR_TABS: ReadonlyArray<{ id: InspectorTabId; label: string }> = [
  { id: "controls", label: "Controls" },
  { id: "actions", label: "Actions" },
  { id: "addons", label: "Addons" },
];

export interface InspectorTabs {
  tabBar: HTMLElement;
  panes: Record<InspectorTabId, HTMLElement>;
  footer: HTMLElement;
  setTab: (id: InspectorTabId) => void;
  setBadge: (id: InspectorTabId, count: number) => void;
  active: () => InspectorTabId;
}

export function createInspectorTabs(onChange?: (id: InspectorTabId) => void): InspectorTabs {
  let active: InspectorTabId = "controls";
  const tabBar = document.createElement("div");
  tabBar.className = "oilgas-inspector-tabs";
  tabBar.style.cssText = [
    "display:flex;gap:4px;padding:0 0 8px;margin:0 0 8px;",
    "border-bottom:1px solid #30363d;flex:0 0 auto;",
  ].join("");

  const panes = {} as Record<InspectorTabId, HTMLElement>;
  const buttons = new Map<InspectorTabId, HTMLButtonElement>();
  const badges = new Map<InspectorTabId, HTMLElement>();

  const apply = () => {
    for (const tab of INSPECTOR_TABS) {
      const on = tab.id === active;
      const btn = buttons.get(tab.id);
      const pane = panes[tab.id];
      if (btn) {
        btn.style.background = on ? "rgba(31,111,235,.32)" : "transparent";
        btn.style.color = on ? "#e6edf3" : "#8b949e";
        btn.setAttribute("aria-selected", String(on));
      }
      if (pane) pane.style.display = on ? "block" : "none";
    }
    onChange?.(active);
  };

  for (const tab of INSPECTOR_TABS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.tab = tab.id;
    btn.setAttribute("role", "tab");
    btn.title = tab.label;
    btn.style.cssText = [
      "flex:1;display:flex;align-items:center;justify-content:center;gap:6px;",
      "padding:6px 4px;border:1px solid #30363d;border-radius:6px;",
      "background:transparent;color:#8b949e;cursor:pointer;",
      "font:600 11px/1 -apple-system,sans-serif;",
    ].join("");
    const label = document.createElement("span");
    label.textContent = tab.label;
    const badge = document.createElement("span");
    badge.dataset.badge = tab.id;
    badge.style.cssText = [
      "min-width:16px;padding:1px 5px;border-radius:999px;",
      "background:#21262d;color:#8b949e;font:600 10px/1.4 monospace;",
    ].join("");
    badge.textContent = "0";
    btn.append(label, badge);
    btn.addEventListener("click", () => {
      active = tab.id;
      apply();
    });
    tabBar.appendChild(btn);
    buttons.set(tab.id, btn);
    badges.set(tab.id, badge);

    const pane = document.createElement("div");
    pane.dataset.inspectorPane = tab.id;
    pane.style.cssText = "display:none;padding-bottom:8px;";
    panes[tab.id] = pane;
  }

  const footer = document.createElement("div");
  footer.className = "oilgas-inspector-footer";
  footer.style.cssText = [
    "flex:0 0 auto;display:flex;align-items:center;gap:6px;",
    "padding-top:8px;margin-top:8px;border-top:1px solid #30363d;",
  ].join("");

  apply();
  return {
    tabBar,
    panes,
    footer,
    setTab: (id) => {
      active = id;
      apply();
    },
    setBadge: (id, count) => {
      const badge = badges.get(id);
      if (badge) badge.textContent = String(count);
    },
    active: () => active,
  };
}

export function createControlTable(): { table: HTMLElement; body: HTMLElement } {
  const table = document.createElement("div");
  table.style.cssText = "display:flex;flex-direction:column;gap:0;";
  const head = document.createElement("div");
  head.style.cssText = [
    "display:grid;grid-template-columns:42% 1fr;gap:8px;",
    "padding:4px 2px 6px;color:#6e7681;font:600 10px/1 -apple-system,sans-serif;",
    "letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid #21262d;",
  ].join("");
  const name = document.createElement("div");
  name.textContent = "Name";
  const control = document.createElement("div");
  control.textContent = "Control";
  head.append(name, control);
  const body = document.createElement("div");
  table.append(head, body);
  return { table, body };
}

export function appendControlRow(body: HTMLElement, name: string, control: HTMLElement): HTMLElement {
  const row = document.createElement("div");
  row.style.cssText = [
    "display:grid;grid-template-columns:42% 1fr;gap:8px;align-items:center;",
    "padding:7px 2px;border-bottom:1px solid rgba(48,54,61,.45);",
  ].join("");
  const label = document.createElement("div");
  label.textContent = name;
  label.style.cssText = "color:#8b949e;font-size:11px;word-break:break-word;";
  const cell = document.createElement("div");
  cell.style.minWidth = "0";
  cell.appendChild(control);
  row.append(label, cell);
  body.appendChild(row);
  return row;
}

export function createBoolSwitch(
  id: string,
  initial: boolean,
  onChange: (value: boolean) => void,
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;border:1px solid #30363d;border-radius:5px;overflow:hidden;height:24px;";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = id;
  input.checked = initial;
  input.style.cssText = "position:absolute;opacity:0;width:0;height:0;";
  const falseBtn = pill("False");
  const trueBtn = pill("True");
  const paint = () => {
    const on = input.checked;
    falseBtn.style.background = on ? "transparent" : "#1f6feb";
    falseBtn.style.color = on ? "#8b949e" : "#fff";
    trueBtn.style.background = on ? "#1f6feb" : "transparent";
    trueBtn.style.color = on ? "#fff" : "#8b949e";
  };
  const set = (value: boolean) => {
    input.checked = value;
    paint();
    onChange(value);
  };
  falseBtn.addEventListener("click", () => set(false));
  trueBtn.addEventListener("click", () => set(true));
  input.addEventListener("change", () => {
    paint();
    onChange(input.checked);
  });
  input.addEventListener("ugsci-sync", () => paint());
  wrap.append(input, falseBtn, trueBtn);
  paint();
  return wrap;
}

function pill(text: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = text;
  btn.style.cssText = [
    "flex:1;border:0;background:transparent;color:#8b949e;cursor:pointer;",
    "font:600 11px/24px -apple-system,sans-serif;padding:0;",
  ].join("");
  return btn;
}

export function inspectorActionButton(text: string, options?: { tone?: "default" | "primary" | "danger" }): HTMLButtonElement {
  const tone = options?.tone || "default";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = text;
  const colors = {
    default: { bg: "#30363d", fg: "#c9d1d9", bd: "#484f58" },
    primary: { bg: "#1f6feb", fg: "#fff", bd: "#388bfd" },
    danger: { bg: "#da3633", fg: "#fff", bd: "#f85149" },
  }[tone];
  Object.assign(btn.style, {
    width: "100%",
    padding: "7px",
    background: colors.bg,
    color: colors.fg,
    border: "1px solid " + colors.bd,
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    marginBottom: "8px",
  } as CSSStyleDeclaration);
  return btn;
}
