import path from "node:path";
import { execFileSync } from "node:child_process";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as antd from "antd";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Build the real plugin components with the same external React contract as
// production. The plugin checkout has its own development React installation.
const buildOptions = {
  entryPoints: [
    path.resolve(
      process.cwd(),
      "../src/qwenpaw/plugins_bundle/flowforge/ui/src/RunPanels.tsx",
    ),
  ],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "browser",
  jsx: "transform",
  external: ["react"],
  loader: { ".css": "empty" },
};
// esbuild must run in Node's own realm, outside jsdom's Uint8Array constructor.
const componentCode = execFileSync(
  process.execPath,
  [
    "--input-type=module",
    "-e",
    `import { buildSync } from "esbuild"; process.stdout.write(buildSync(${JSON.stringify(
      buildOptions,
    )}).outputFiles[0].text);`,
  ],
  { cwd: process.cwd(), encoding: "utf8" },
);
const componentModule = {
  exports: {} as { RunMonitor: React.ComponentType<Record<string, unknown>> },
};
new Function("require", "module", "exports", componentCode)(
  (name: string) => {
    if (name === "react") return React;
    if (name === "react/jsx-runtime") return jsxRuntime;
    throw new Error(`Unexpected dependency: ${name}`);
  },
  componentModule,
  componentModule.exports,
);
const { RunMonitor } = componentModule.exports;

const makeRun = (overrides: Record<string, unknown> = {}) => ({
  run_id: "run-old",
  flow_id: "flow-old",
  status: "completed",
  started_at: 1,
  duration_ms: 30,
  flow_revision: 3,
  node_statuses: { model: "success", wait: "pending", branch: "skipped" },
  node_details: {
    model: {
      id: "model",
      label: "历史模型名称",
      class_type: "LLMNode",
      status: "success",
      inputs_available: false,
      outputs: { count: 0, api_key: "do-not-render" },
      duration_ms: 0,
    },
    wait: {
      id: "wait",
      label: "待处理节点",
      status: "pending",
      inputs_available: false,
    },
    branch: {
      id: "branch",
      label: "未选分支",
      status: "skipped",
      inputs_available: false,
    },
    untouched: {
      id: "untouched",
      label: "未到达节点",
      status: "not_executed",
      inputs_available: false,
    },
  },
  outputs: {
    model: "This is a workflow output, not the node value",
    api_key: "do-not-render-output",
  },
  errors: [],
  events: [],
  ...overrides,
});

function pendingStream() {
  return new Response(new ReadableStream({ start() {} }));
}

describe("FlowForge actual run inspector", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      fetchMock.mockReset().mockImplementation(pendingStream),
    );
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  function mount(record = makeRun(), overrides: Record<string, unknown> = {}) {
    const api = vi.fn(async (url: string) =>
      url === "/flowforge/runs" ? [] : record,
    );
    const props = {
      runId: record.run_id,
      onClose: vi.fn(),
      onStatusUpdate: vi.fn(),
      onResumed: vi.fn(),
      antd,
      api,
      streamUrl: (url: string) => `/api${url}`,
      headers: () => ({
        Authorization: "Bearer session-token",
        "X-Agent-Id": "agent-a",
      }),
      ...overrides,
    };
    return { ...render(<RunMonitor {...props} />), props, api };
  }

  it("inspects immutable node observations and distinguishes waiting skipped and unexecuted nodes", async () => {
    mount();
    const detail = await screen.findByRole("region", {
      name: "节点详情 历史模型名称",
    });
    expect(within(detail).getByText("耗时：0 ms")).toBeVisible();
    expect(
      within(detail).getByText(/此运行未记录解析后的实际输入/),
    ).toBeVisible();
    expect(detail.textContent).toContain('"count": 0');
    expect(detail.textContent).not.toContain("This is a workflow output");
    expect(document.body.textContent).not.toContain("do-not-render");
    expect(
      screen.getByRole("button", { name: "检查节点 待处理节点" }),
    ).toHaveTextContent("等待执行");
    expect(
      screen.getByRole("button", { name: "检查节点 未选分支" }),
    ).toHaveTextContent("已跳过");
    expect(
      screen.getByRole("button", { name: "检查节点 未到达节点" }),
    ).toHaveTextContent("未执行");
    fireEvent.click(
      screen.getByRole("button", { name: "检查节点 未到达节点" }),
    );
    expect(
      screen.getByRole("region", { name: "节点详情 未到达节点" }),
    ).toHaveTextContent("尚无已记录的节点输出");
    expect(fetchMock.mock.calls[0][1].headers).toEqual({
      Authorization: "Bearer session-token",
      "X-Agent-Id": "agent-a",
    });
  });

  it("preserves node identity output keys while masking credentials inside their values", async () => {
    mount(
      makeRun({
        node_statuses: { "secret-check": "success" },
        node_details: {
          "secret-check": {
            id: "secret-check",
            label: "ordinary output",
            status: "success",
          },
        },
        outputs: {
          "secret-check": {
            text: "normal business result",
            api_key: "must-not-render",
          },
          api_key: "also-hidden",
        },
      }),
    );
    fireEvent.click(await screen.findByRole("tab", { name: "输出" }));
    const output = screen.getByRole("tabpanel", { name: "输出" });
    expect(output).toHaveTextContent("normal business result");
    expect(output).not.toHaveTextContent("must-not-render");
    expect(output).not.toHaveTextContent("also-hidden");
  });

  it("shows node errors and fallback event timings without exposing legacy credential fields", async () => {
    mount(
      makeRun({
        node_statuses: { legacy: "error" },
        node_details: undefined,
        events: [
          {
            type: "node_error",
            node_id: "legacy",
            state: {
              status: "error",
              error: "Provider rejected Bearer a-secret-value",
              metadata: { duration_ms: 12, password: "hidden-password" },
            },
          },
        ],
      }),
    );
    const detail = await screen.findByRole("region", {
      name: "节点详情 legacy",
    });
    expect(detail).toHaveTextContent("耗时：12 ms");
    expect(detail).toHaveTextContent("Provider rejected Bearer [redacted]");
    expect(detail).not.toHaveTextContent("a-secret-value");
    expect(detail).not.toHaveTextContent("hidden-password");
    expect(detail).toHaveTextContent("尚无已记录的节点输出");
  });

  it("keeps review resume cancellation and parent child run navigation on the actual monitor", async () => {
    const run = makeRun({
      status: "waiting_human",
      parent_run_id: "parent",
      node_statuses: { review: "blocked" },
    });
    const api = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/resume")) {
        expect(JSON.parse(String(init?.body))).toEqual({
          inputs: { approved: true, comments: "checked" },
        });
        return { run_id: "resumed" };
      }
      if (url.endsWith("/cancel")) return { cancelled: true };
      if (url === "/flowforge/runs")
        return [
          makeRun({
            run_id: "child",
            parent_run_id: "run-old",
            status: "waiting_human",
          }),
        ];
      return run;
    });
    const view = mount(run, { api });
    fireEvent.click(
      await screen.findByRole("button", { name: "返回父工作流运行" }),
    );
    expect(view.props.onResumed).toHaveBeenCalledWith("parent");
    fireEvent.click(await screen.findByRole("button", { name: "查看并处理" }));
    expect(view.props.onResumed).toHaveBeenCalledWith("child");
    fireEvent.change(screen.getByRole("textbox", { name: "审核意见" }), {
      target: { value: "checked" },
    });
    fireEvent.click(screen.getByRole("button", { name: "通过并继续" }));
    await waitFor(() =>
      expect(view.props.onResumed).toHaveBeenCalledWith("resumed"),
    );
    fireEvent.click(screen.getByRole("button", { name: /取消运行/ }));
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith("/flowforge/runs/run-old/cancel", {
        method: "POST",
      }),
    );
  });

  it("reconnects authenticated SSE with CRLF frames and preserves repeated events without replay duplicates", async () => {
    const event = {
      type: "progress",
      node_id: "model",
      state: { status: "running", message: "same progress" },
    };
    const frame = `data: ${JSON.stringify(event)}\r\n\r\n`;
    const encoder = new TextEncoder();
    let first: ReadableStreamDefaultController<Uint8Array>;
    let second: ReadableStreamDefaultController<Uint8Array>;
    fetchMock
      .mockReset()
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(
            new ReadableStream({
              start(controller) {
                first = controller;
              },
            }),
          ),
        ),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(
            new ReadableStream({
              start(controller) {
                second = controller;
              },
            }),
          ),
        ),
      );
    mount(makeRun({ status: "running" }));
    await screen.findByRole("region", { name: "节点详情 历史模型名称" });
    await act(async () => {
      first!.enqueue(encoder.encode(frame.slice(0, -1)));
      first!.enqueue(encoder.encode(frame.slice(-1)));
    });
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "事件流 (1)" })).toBeVisible(),
    );
    await act(async () => first!.error(new Error("connection reset")));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2), {
      timeout: 3000,
    });
    await act(async () => second!.enqueue(encoder.encode(frame + frame)));
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "事件流 (2)" })).toBeVisible(),
    );
    expect(fetchMock.mock.calls[1][1].headers["X-Agent-Id"]).toBe("agent-a");
    expect(
      screen.getByRole("region", { name: "节点详情 历史模型名称" }),
    ).toHaveTextContent("节点事件（2）");
  });

  it.each(["unmount", "return"])(
    "ignores a late review response after %s of the run monitor",
    async (transition) => {
      let finishReview: (value: { run_id: string }) => void = () => {};
      const waiting = makeRun({
        status: "waiting_human",
        node_statuses: { review: "blocked" },
      });
      const api = vi.fn((url: string) => {
        if (url.endsWith("/resume"))
          return new Promise((resolve) => {
            finishReview = resolve;
          });
        if (url === "/flowforge/runs") return Promise.resolve([]);
        return Promise.resolve({
          ...waiting,
          run_id: url.endsWith("run-new") ? "run-new" : "run-old",
        });
      });
      const view = mount(waiting, { api });
      fireEvent.click(
        await screen.findByRole("button", { name: "通过并继续" }),
      );
      await waitFor(() =>
        expect(api).toHaveBeenCalledWith(
          "/flowforge/runs/run-old/resume",
          expect.anything(),
        ),
      );
      if (transition === "unmount") view.unmount();
      else {
        view.rerender(<RunMonitor {...view.props} runId="run-new" />);
        await waitFor(() =>
          expect(document.body.textContent).toContain("运行监控 · run-new"),
        );
        view.rerender(<RunMonitor {...view.props} />);
        await screen.findByRole("button", { name: "通过并继续" });
      }
      await act(async () => finishReview({ run_id: "obsolete-followup" }));
      expect(view.props.onResumed).not.toHaveBeenCalled();
    },
  );

  it("isolates late record responses after switching runs and aborts the old event request", async () => {
    let resolveOld: (record: ReturnType<typeof makeRun>) => void = () => {};
    const api = vi.fn((url: string) => {
      if (url === "/flowforge/runs") return Promise.resolve([]);
      if (url.endsWith("run-old"))
        return new Promise((resolve) => {
          resolveOld = resolve;
        });
      return Promise.resolve(
        makeRun({
          run_id: "run-new",
          flow_id: "flow-new",
          node_details: { fresh: { id: "fresh", label: "新运行节点" } },
          node_statuses: { fresh: "success" },
        }),
      );
    });
    const view = mount(makeRun(), { api });
    const oldSignal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    view.rerender(<RunMonitor {...view.props} runId="run-new" />);
    await screen.findByRole("region", { name: "节点详情 新运行节点" });
    await act(async () => resolveOld(makeRun()));
    expect(oldSignal.aborted).toBe(true);
    expect(
      screen.queryByRole("button", { name: "检查节点 历史模型名称" }),
    ).not.toBeInTheDocument();
    expect(view.props.onStatusUpdate).toHaveBeenCalledTimes(1);
    expect(view.props.onStatusUpdate).toHaveBeenCalledWith(
      { fresh: "success" },
      "flow-new",
    );
  });
});
