import React, { useEffect, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TaskLayout, type TaskLayoutPlan } from "../src/TaskLayout";
import { registerTaskLayout } from "../src/taskApi";
import type { QwenPawWindowNamespace } from "../src/qwenpaw-host";

const host = { host: { useTheme: () => "light", useLocale: () => "en" } } as unknown as QwenPawWindowNamespace;
const base: TaskLayoutPlan = { title: "Solver results", layout: "tabs", panels: [
  { id: "fields", title: "Fields" }, { id: "curves", title: "Curves" },
] };
beforeEach(() => Object.assign(window, { QwenPaw: host }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("uses the real runtime and preserves host viewers across polling, tabs, layout, titles and filtering", () => {
  const mounted = vi.fn();
  const unmounted = vi.fn();
  function Viewer({ value, id }: { value: number; id: string }) {
    const [zoom, setZoom] = useState(1);
    useEffect(() => { mounted(id); return () => unmounted(id); }, []);
    return <button onClick={() => setZoom(zoom + 1)}>{id}:{value}:zoom{zoom}</button>;
  }
  const panels = (value: number) => ({ fields: <Viewer id="field" value={value} />, curves: <Viewer id="curve" value={value} /> });
  const view = render(<TaskLayout scopeKey="run-a" plan={base} panels={panels(1)} />);
  expect(screen.queryByRole("alert")).toBeNull();
  const field = screen.getByRole("button", { name: "field:1:zoom1" });
  fireEvent.click(field);
  expect(mounted.mock.calls).toEqual([["field"], ["curve"]]);
  fireEvent.click(screen.getByRole("tab", { name: "Curves" }));
  const curve = screen.getByRole("button", { name: "curve:1:zoom1" });
  fireEvent.click(curve);
  const tab = screen.getByRole("tab", { name: "Curves" });
  view.rerender(<TaskLayout scopeKey="run-a" plan={{ ...base, title: "Updated" }} panels={panels(2)} />);
  expect(screen.getByRole("tab", { name: "Curves" })).toBe(tab);
  expect(tab.getAttribute("aria-selected")).toBe("true");
  expect(screen.getByRole("button", { name: "curve:2:zoom2" })).toBe(curve);
  view.rerender(<TaskLayout scopeKey="run-a" plan={{ ...base, layout: "dashboard", panels: [base.panels[1]] }} panels={panels(3)} />);
  expect(screen.queryByRole("button", { name: /field:/ })).toBeNull();
  expect(view.container.querySelector('[data-openui-task-panel="fields"]')?.hasAttribute("hidden")).toBe(true);
  view.rerender(<TaskLayout scopeKey="run-a" plan={{ ...base, layout: "stack", panels: [...base.panels].reverse() }} panels={panels(4)} />);
  expect(screen.getByRole("button", { name: "field:4:zoom2" })).toBe(field);
  expect(screen.getByRole("button", { name: "curve:4:zoom2" })).toBe(curve);
  expect(unmounted).not.toHaveBeenCalled();
  expect(mounted).toHaveBeenCalledTimes(2);
  view.rerender(<TaskLayout scopeKey="run-b" plan={base} panels={panels(5)} />);
  expect(unmounted).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("button", { name: "field:5:zoom1" })).not.toBe(field);
});

it("appends new panels without replacing existing host elements or tab state", () => {
  const view = render(<TaskLayout scopeKey="r" plan={base} panels={{ fields: <input defaultValue="typed" />, curves: <p>rate 1</p> }} />);
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "kept" } });
  const next = { ...base, panels: [...base.panels, { id: "logs", title: "Logs" }] };
  view.rerender(<TaskLayout scopeKey="r" plan={next} panels={{ logs: <p>new log</p>, curves: <p>rate 2</p>, fields: <input defaultValue="typed" /> }} />);
  expect(screen.getByRole("textbox")).toBe(input);
  expect((input as HTMLInputElement).value).toBe("kept");
  expect(screen.getByRole("tab", { name: "Fields" }).getAttribute("aria-selected")).toBe("true");
  fireEvent.click(screen.getByRole("tab", { name: "Logs" }));
  expect(screen.getByText("new log")).toBeTruthy();
});

it.each([
  { ...base, rawScript: 'Query("run", {})' },
  { ...base, panels: [{ id: "missing" }] },
  { ...base, panels: [{ id: "fields" }, { id: "fields" }] },
  { ...base, panels: [] },
  null,
])("shows every supplied result and an explanation for an invalid plan: %j", (plan) => {
  render(<TaskLayout scopeKey="r" plan={plan as TaskLayoutPlan} panels={{ fields: <p>field result</p>, curves: <p>curve result</p> }} />);
  expect(screen.getByRole("alert").textContent).toContain("All available results");
  expect(screen.getByText("field result").closest("[hidden]")).toBeNull();
  expect(screen.getByText("curve result").closest("[hidden]")).toBeNull();
});

it("treats quoted panel IDs and model text as inert data and isolates task instances", () => {
  const id = 'x")\nroot = Query("fetch", {})\n("';
  const unsafe = '<script>window.executed = true</script>';
  const plan: TaskLayoutPlan = { layout: "stack", title: unsafe, panels: [{ id, title: unsafe }] };
  render(<>
    <TaskLayout scopeKey="a" plan={plan} panels={{ [id]: <p>private A</p> }} />
    <TaskLayout scopeKey="b" plan={plan} panels={{ [id]: <p>private B</p> }} />
  </>);
  expect(screen.queryByRole("alert")).toBeNull();
  expect(document.querySelector("script")).toBeNull();
  expect(screen.getByText("private A").closest("[data-openui-task-scope]")?.getAttribute("data-openui-task-scope")).toBe("a");
  expect(screen.getByText("private B").closest("[data-openui-task-scope]")?.getAttribute("data-openui-task-scope")).toBe("b");
});

it("contains a failed host panel and keeps other results readable", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  function Broken(): React.ReactElement { throw new Error("viewer failure"); }
  render(<TaskLayout scopeKey="r" plan={{ ...base, layout: "stack" }} panels={{ fields: <Broken />, curves: <p>still available</p> }} />);
  expect(screen.getByRole("alert").textContent).toContain("other results remain available");
  expect(screen.getByText("still available")).toBeTruthy();
});

it("publishes a replaceable API and releases its global reference on disposal", () => {
  const notify = vi.fn();
  window.addEventListener("qwenpaw:openui-task-layout-ready", notify);
  const first = registerTaskLayout(host);
  const second = registerTaskLayout(host);
  const exposed = host as QwenPawWindowNamespace & { openui?: typeof first };
  expect(exposed.openui).toBe(second);
  first.dispose();
  expect(exposed.openui).toBe(second);
  second.dispose();
  expect(exposed.openui).toBeUndefined();
  expect(notify).toHaveBeenCalledTimes(4);
  window.removeEventListener("qwenpaw:openui-task-layout-ready", notify);
});
