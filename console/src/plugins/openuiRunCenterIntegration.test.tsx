import React from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { installHostExternals } from "./hostExternals";
import { installHostSdk } from "./hostSdk/install";
import { removePluginRuntime } from "./pluginRuntimeCleanup";
import { chatExtensions } from "./registry/chatExtensions";

type ViewProps = {
  run: Record<string, unknown>;
  events: Record<string, unknown>[];
  scope: { agentId: string; chatId: string };
};
type Runtime = typeof window.QwenPaw & {
  openui?: { TaskLayout: React.ComponentType; dispose: () => void };
  runCenter?: { AdaptiveRunView: React.ComponentType<ViewProps> };
};
const scope = { agentId: "integration-owner", chatId: "integration-chat" };
const plan = () => ({
  version: 1,
  task_type: "analysis",
  title: "已验证的容量结果",
  layout: "tabs",
  panels: [
    { id: "summary", kind: "overview", title: "计算结果" },
    { id: "capacity", kind: "metrics", title: "容量指标" },
    { id: "layers", kind: "table", title: "层段数据" },
  ],
});
const run = (capacity = 42) => ({
  run_id: "openui-integration-run",
  operation: "storage.capacity.evaluate",
  status: "succeeded",
  payload: { result: {
    metrics: { working_gas: { value: capacity, unit: "m³" } },
    result: { answer: capacity, layers: [{ layer: "A", capacity: 30 }, { layer: "B", capacity: capacity - 30 }] },
  } },
});

describe("published OpenUI and Run Center integration", () => {
  const globalWindow = window as unknown as Record<string, unknown>;
  let originalNamespace: unknown;
  let runtime: Runtime;
  let View: React.ComponentType<ViewProps>;
  let saved = { revision: 1, plan: plan() };
  const fetchHost = vi.fn(async (url: string, _init?: RequestInit) => {
    if (url !== "/run-center/runs/openui-integration-run/presentation") {
      throw new Error(`Unexpected integration request: ${url}`);
    }
    return new Response(JSON.stringify(saved));
  });

  beforeAll(async () => {
    originalNamespace = globalWindow.QwenPaw;
    delete globalWindow.QwenPaw;
    delete globalWindow.__qwenpawRunCenterRegistered;
    // Use the actual host registries, SDK, shared React, theme and locale hooks.
    installHostExternals();
    installHostSdk();
    runtime = window.QwenPaw as Runtime;
    runtime.host.fetch = fetchHost;
    // @ts-expect-error The generated release module intentionally has no source declarations.
    await import("../../../plugins/bundle/qwenpaw-openui/dist/index.js");
    // Run Center is the shipped host script, with no source rewriting or mocks.
    new Function(readFileSync(path.resolve(
      process.cwd(), "../plugins/bundle/qwenpaw-run-center/ui/dist/index.js",
    ), "utf8"))();
    View = runtime.runCenter!.AdaptiveRunView;
  }, 60_000);

  beforeEach(() => {
    saved = { revision: 1, plan: plan() };
    fetchHost.mockClear();
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); });
  afterAll(() => {
    removePluginRuntime("qwenpaw-openui");
    removePluginRuntime("qwenpaw-run-center");
    delete globalWindow.__qwenpawRunCenterRegistered;
    globalWindow.QwenPaw = originalNamespace;
  });

  it("renders Run Center result panels through the published OpenUI runtime and preserves tab and DOM state across polling", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const view = render(<View run={run()} events={[]} scope={scope} />);
    expect(runtime.openui?.TaskLayout).toBeTypeOf("function");
    await screen.findByRole("tab", { name: "容量指标" });
    expect(view.container.querySelector("[data-openui-task-scope]")).not.toBeNull();
    expect(view.container.querySelector("[data-task-layout]")).toBeNull();
    expect(within(screen.getByRole("table", { name: "结果明细" })).getByText("42")).toBeInTheDocument();
    const tab = screen.getByRole("tab", { name: "容量指标" });
    fireEvent.click(tab);
    const metric = screen.getByText("42 m³");
    const panel = metric.closest("[data-openui-task-panel]");
    expect(panel).not.toHaveAttribute("hidden");
    expect(tab).toHaveAttribute("aria-selected", "true");

    saved = { revision: 2, plan: { ...plan(), title: "轮询更新的容量结果", panels: [...plan().panels].reverse() } };
    const requestsBeforePoll = fetchHost.mock.calls.length;
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    await waitFor(() => expect(fetchHost.mock.calls.length).toBeGreaterThan(requestsBeforePoll));
    expect(screen.getByText("轮询更新的容量结果")).toBeInTheDocument();
    view.rerender(<View run={run(43)} events={[]} scope={scope} />);
    expect(screen.getByRole("tab", { name: "容量指标" })).toBe(tab);
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("43 m³")).toBe(metric);
    expect(metric.closest("[data-openui-task-panel]")).toBe(panel);
    fireEvent.click(screen.getByRole("tab", { name: "层段数据" }));
    expect(within(screen.getByRole("table", { name: "layers数据表" })).getByText("13")).toBeInTheDocument();
    const headers = new Headers(fetchHost.mock.calls[0][1]?.headers);
    expect(headers.get("X-Agent-Id")).toBe(scope.agentId);
    expect(headers.get("X-Chat-Id")).toBe(scope.chatId);
  });

  it("uses the real plugin cleanup to revoke OpenUI and keep Run Center results readable in the native layout", async () => {
    const view = render(<View run={run()} events={[]} scope={scope} />);
    await screen.findByRole("tab", { name: "容量指标" });
    expect(view.container.querySelector("[data-openui-task-scope]")).not.toBeNull();
    expect(chatExtensions.getListSnapshot()["response.codeBlocks"].some((entry) => entry.pluginId === "qwenpaw-openui")).toBe(true);
    act(() => removePluginRuntime("qwenpaw-openui"));
    expect(runtime.openui).toBeUndefined();
    expect(chatExtensions.getListSnapshot()["response.codeBlocks"].some((entry) => entry.pluginId === "qwenpaw-openui")).toBe(false);
    expect(view.container.querySelector("[data-openui-task-scope]")).toBeNull();
    expect(view.container.querySelector('[data-task-layout="tabs"]')).not.toBeNull();
    expect(within(screen.getByRole("table", { name: "结果明细" })).getByText("42")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "容量指标" }));
    expect(screen.getByText("42 m³").closest("[hidden]")).toBeNull();
    view.rerender(<View run={run(44)} events={[]} scope={scope} />);
    expect(screen.getByText("44 m³").closest("[hidden]")).toBeNull();
    expect(document.querySelector('style[data-qwenpaw-plugin="qwenpaw-openui"]')).toBeNull();
  });
});
