import React from "react";
import ReactDOM from "react-dom";
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
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const win = window as any;
const folder = path.resolve(
  process.cwd(),
  "../plugins/bundle/qwenpaw-run-center/ui/dist",
);
const charts: Record<string, any> = {};
new Function(
  "exports",
  ts.transpileModule(
    fs.readFileSync(path.join(folder, "simulation-charts.mjs"), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText,
)(charts);
const makePlan = (extra: any = {}) => ({
  version: 1,
  task_type: "analysis",
  layout: "stack",
  panels: [
    { id: "summary", kind: "overview" },
    { id: "metrics", kind: "metrics" },
  ],
  ...extra,
});
const run = (extra: any = {}) => ({
  run_id: "run-a",
  operation: "storage.capacity.evaluate",
  status: "succeeded",
  ...extra,
});
const scope = { agentId: "owner-a", chatId: "chat-a" };

describe("Run Center adaptive results from the published bundle", () => {
  let fetchHost: ReturnType<typeof vi.fn>;
  let saved: any;
  let View: any;
  let Monitor: any;
  let viewer: any;
  let mount: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    saved = { run_id: "run-a", revision: 0, plan: null };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      measureText: (value: string) => ({ width: String(value).length * 7 }),
    } as any);
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    fetchHost = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/presentation")) {
        if (init?.method === "PUT") {
          const body = JSON.parse(String(init.body));
          if (body.expected_revision !== saved.revision)
            return new Response(JSON.stringify({ detail: "conflict" }), {
              status: 409,
            });
          saved = { ...saved, revision: saved.revision + 1, plan: body.plan };
        }
        return new Response(JSON.stringify(saved));
      }
      throw new Error(`Unexpected request ${url}`);
    });
    viewer = {
      ready: Promise.resolve(),
      dispose: vi.fn(),
      executeCommand: vi.fn(async () => ({ ok: true })),
    };
    mount = vi.fn(async () => viewer);
    win.QwenPaw = {
      host: {
        React,
        ReactDOM,
        fetch: fetchHost,
        getSelectedAgentId: () => "owner-a",
        getApiToken: () => "test-token",
        getApiUrl: (url: string) => `/api/${url.replace(/^\//, "")}`,
        useTheme: () => "light",
        useLocale: () => "zh",
        openExternalLink: vi.fn(),
      },
      route: { add: vi.fn() },
      menu: { add: vi.fn() },
      chat: {
        disposeAll: vi.fn(),
        submit: vi.fn(),
        codeBlock: vi.fn(() => ({ dispose() {} })),
        requestPayload: { add: vi.fn(() => ({ dispose() {} })) },
      },
      ugsci: { visualization: { mount } },
    };
    delete win.__qwenpawRunCenterRegistered;
    win.__adaptiveCharts = vi.fn(async () => charts);
    new Function(
      fs
        .readFileSync(path.join(folder, "index.js"), "utf8")
        .replace("import(", "window.__adaptiveCharts("),
    )();
    View = win.QwenPaw.runCenter.AdaptiveRunView;
    Monitor = win.QwenPaw.runCenter.SimulationMonitor;
  });
  afterEach(() => {
    cleanup();
    win.QwenPaw?.openui?.dispose?.();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete win.QwenPaw;
    delete win.__qwenpawRunCenterRegistered;
    delete win.__adaptiveCharts;
  });

  it("projects analysis metrics/tables and bounded raw data without interpreting input text or calling simulation APIs", async () => {
    render(
      <View
        run={run({
          payload: {
            input_snapshot: {
              parameters: { note: "<script>window.injected=true</script>" },
            },
            result: {
              metrics: [null, 4, { id: "working_gas", value: 42, unit: "m³" }],
              result: {
                layers: [
                  { layer: "A", capacity: 30 },
                  { layer: "B", capacity: 12 },
                ],
                note: "x".repeat(30000),
              },
              warnings: ["uncalibrated"],
            },
          },
        })}
        events={[]}
        scope={scope}
      />,
    );
    expect(screen.getByText("已识别：结果分析")).toBeInTheDocument();
    expect(screen.getByText("42 m³")).toBeInTheDocument();
    expect(
      within(screen.getByRole("table", { name: "layers数据表" })).getByText(
        "B",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("任务结果警告")).toHaveTextContent(
      "uncalibrated",
    );
    expect(
      screen.getByText(/<script>window.injected=true<\/script>/),
    ).toBeInTheDocument();
    expect(win.injected).toBeUndefined();
    expect(document.querySelector("script")).toBeNull();
    expect(screen.getAllByText(/已截断/).length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "保存展示" })).toBeEnabled(),
    );
    expect(
      fetchHost.mock.calls.every(([url]) =>
        String(url).endsWith("/presentation"),
      ),
    ).toBe(true);
  });

  it.each([0, false])("keeps scalar result %s as real data", (value) => {
    render(
      <View
        run={run({ payload: { result: value } })}
        events={[]}
        scope={scope}
      />,
    );
    expect(screen.queryByText(/尚无计算结果/)).toBeNull();
    expect(
      within(screen.getByRole("table", { name: "结果明细" })).getByText(
        String(value),
      ),
    ).toBeInTheDocument();
  });

  it("skips malformed series points while preserving an explicit missing value as an ECharts gap", async () => {
    render(
      <View
        run={run({
          payload: {
            result: {
              series: [
                null,
                {
                  id: "pressure",
                  unit: "bar",
                  time_unit: "day",
                  points: [
                    null,
                    4,
                    { time: 0, value: 2 },
                    { time: 1, value: null, y: 99 },
                    { time: 2, value: 3 },
                  ],
                },
              ],
            },
          },
        })}
        events={[]}
        scope={scope}
      />,
    );
    const plot = screen.getByRole("img", { name: "任务结果曲线" });
    await waitFor(() => expect(plot.querySelector("svg")).not.toBeNull());
    expect(
      plot
        .querySelector('path[stroke="#2563eb"]')
        ?.getAttribute("d")
        ?.match(/M/g)?.length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("uses newest result events for comparisons and shows stage metrics for workflows", async () => {
    const view = render(
      <View
        run={run({ operation: "study.realization.run" })}
        scope={scope}
        events={[
          {
            seq: 1,
            type: "result.ready",
            data: { result: { rows: [{ scenario: "old", score: 1 }] } },
          },
          {
            seq: 2,
            type: "run.status_changed",
            data: {
              result: {
                result: { rows: [{ scenario: "new", score: 7 }] },
                metrics: { score: 7 },
              },
            },
          },
        ]}
      />,
    );
    expect(screen.getByText("已识别：方案比较")).toBeInTheDocument();
    expect(
      within(screen.getByRole("table", { name: "rows数据表" })).getByText(
        "new",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("old")).toBeNull();
    view.rerender(
      <View
        run={run({
          run_id: "workflow-b",
          operation: "workflow.execute",
          status: "failed",
          error: { message: "solver failed" },
          stages: [
            {
              stage_id: "solve",
              status: "failed",
              metrics: { residual: { value: 0.01, unit: "ratio" } },
              warnings: ["tolerance not met"],
            },
          ],
        })}
        events={[]}
        scope={scope}
      />,
    );
    expect(screen.getByText("已识别：执行流程")).toBeInTheDocument();
    expect(screen.getByText("solve · residual")).toBeInTheDocument();
    expect(screen.getByText("0.01 ratio")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("solver failed");
    expect(screen.getByLabelText("任务结果警告")).toHaveTextContent(
      "tolerance not met",
    );
  });

  it("imports a real dataset reference, preserves the viewer across updates/layout and saves/reloads presentation", async () => {
    const props = {
      run: run({
        operation: "visualization.import",
        stages: [{ name: "reading", status: "completed" }],
      }),
      scope,
      events: [
        { seq: 1, type: "completed", data: { dataset_id: "dataset-42" } },
      ],
    };
    const view = render(<View {...props} />);
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
    expect(screen.getByText("已识别：数据导入")).toBeInTheDocument();
    expect(mount).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ initialDatasetId: "dataset-42", scope }),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "保存展示" })).toBeEnabled(),
    );
    fireEvent.change(screen.getByLabelText("任务布局"), {
      target: { value: "tabs" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "数据场图" }));
    view.rerender(<View {...props} run={{ ...props.run, phase: "done" }} />);
    expect(screen.getByRole("tab", { name: "数据场图" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(mount).toHaveBeenCalledTimes(1);
    expect(viewer.dispose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "保存展示" }));
    await screen.findByText("展示计划已保存");
    expect(saved.plan.layout).toBe("tabs");
    const put = fetchHost.mock.calls.find(
      ([, init]) => init?.method === "PUT",
    )!;
    expect(JSON.parse(String(put[1]?.body)).expected_revision).toBe(0);
    expect(new Headers(put[1]?.headers).get("X-Agent-Id")).toBe("owner-a");
    expect(new Headers(put[1]?.headers).get("X-Chat-Id")).toBe("chat-a");
    view.unmount();
    render(<View {...props} />);
    await waitFor(() =>
      expect(screen.getByLabelText("任务布局")).toHaveValue("tabs"),
    );
    expect(
      fetchHost.mock.calls.every(
        ([url]) => !String(url).includes("/ugsci/sim/"),
      ),
    ).toBe(true);
  });

  it("retains unsaved edits through remote revisions and reports a save conflict instead of overwriting", async () => {
    vi.useFakeTimers();
    saved = { ...saved, revision: 1, plan: makePlan() };
    await act(async () => {
      render(<View run={run()} events={[]} scope={scope} />);
    });
    fireEvent.change(screen.getByLabelText("任务布局"), {
      target: { value: "tabs" },
    });
    saved = {
      ...saved,
      revision: 2,
      plan: makePlan({ layout: "dashboard", title: "Remote plan" }),
    };
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByLabelText("任务布局")).toHaveValue("tabs");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "保存展示" }));
    });
    const put = fetchHost.mock.calls.find(
      ([, init]) => init?.method === "PUT",
    )!;
    expect(JSON.parse(String(put[1]?.body)).expected_revision).toBe(1);
    expect(screen.getByText(/计划已由其他入口更新/)).toBeInTheDocument();
    expect(saved.revision).toBe(2);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "刷新计划" }));
    });
    expect(screen.getByLabelText("任务布局")).toHaveValue("dashboard");
  });

  it("disables draft changes and pauses plan polling during a pending save", async () => {
    vi.useFakeTimers();
    let release: (response: Response) => void = () => {};
    const defaultFetch = fetchHost.getMockImplementation() as (
      url: string,
      init?: RequestInit,
    ) => Promise<Response>;
    fetchHost.mockImplementation(async (url: string, init?: RequestInit) =>
      init?.method === "PUT"
        ? new Promise<Response>((resolve) => {
            release = resolve;
          })
        : defaultFetch(url, init),
    );
    await act(async () => {
      render(<View run={run()} events={[]} scope={scope} />);
    });
    fireEvent.change(screen.getByLabelText("任务布局"), {
      target: { value: "tabs" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存展示" }));
    expect(screen.getByLabelText("任务布局")).toBeDisabled();
    expect(screen.getByLabelText("展示重点")).toBeDisabled();
    expect(screen.getByRole("button", { name: "刷新计划" })).toBeDisabled();
    const calls = fetchHost.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(fetchHost.mock.calls).toHaveLength(calls);
    await act(async () => {
      release(
        new Response(
          JSON.stringify({ revision: 1, plan: makePlan({ layout: "tabs" }) }),
        ),
      );
    });
    expect(screen.getByText("展示计划已保存")).toBeInTheDocument();
    expect(screen.getByLabelText("任务布局")).toHaveValue("tabs");
    expect(screen.getByLabelText("任务布局")).toBeEnabled();
  });

  it("honors saved compact panel titles/order and directs unsupported field panels to the full sidebar", async () => {
    saved = {
      ...saved,
      revision: 1,
      plan: makePlan({
        title: "重点观察井压",
        task_type: "simulation",
        layout: "tabs",
        panels: [
          { id: "selected-curves", kind: "curves", title: "注采响应" },
          { id: "selected-overview", kind: "overview", title: "本次运行" },
          { id: "spatial", kind: "fields", title: "压力分布" },
        ],
      }),
    };
    const defaultFetch = fetchHost.getMockImplementation() as (
      url: string,
      init?: RequestInit,
    ) => Promise<Response>;
    fetchHost.mockImplementation(async (url: string, init?: RequestInit) =>
      url.endsWith("/results")
        ? new Response(
            JSON.stringify({
              schema_version: 1,
              run_id: "sim_compact",
              status: "completed",
              finalized: true,
              collection_status: "complete",
              metrics: [],
              series: [],
              fields: { datasets: [] },
              warnings: ["source warning"],
            }),
          )
        : defaultFetch(url, init),
    );
    const view = render(
      <Monitor runId="sim_compact" scope={scope} subscribe={false} compact />,
    );
    await screen.findByText("重点观察井压");
    const visible = [
      ...view.container.querySelectorAll("[data-run-panel]:not([hidden])"),
    ];
    expect(visible.map((node) => node.getAttribute("data-run-panel"))).toEqual([
      "curves",
      "overview",
    ]);
    expect(screen.getByText("注采响应")).toBeInTheDocument();
    expect(screen.getByText("本次运行")).toBeInTheDocument();
    expect(screen.getByText(/压力分布，可在侧栏完整查看/)).toBeInTheDocument();
    expect(
      view.container.querySelector('[data-task-layout="stack"]'),
    ).not.toBeNull();
    expect(screen.queryByLabelText("任务布局")).toBeNull();
    expect(screen.getByLabelText("结果提示")).toHaveTextContent(
      "source warning",
    );
    expect(mount).not.toHaveBeenCalled();
  });

  it("ignores a delayed old scope response and rejects malformed plans with readable native fallback", async () => {
    let release: (response: Response) => void = () => {};
    fetchHost.mockImplementation(async (url: string) =>
      url.includes("/old/")
        ? new Promise<Response>((resolve) => {
            release = resolve;
          })
        : new Response(
            JSON.stringify({
              revision: 1,
              plan: makePlan({ title: { bad: "object" } }),
            }),
          ),
    );
    const view = render(
      <View run={run({ run_id: "old" })} events={[]} scope={scope} />,
    );
    view.rerender(
      <View
        run={run({ run_id: "new", payload: { result: { answer: 99 } } })}
        events={[]}
        scope={{ agentId: "new-owner", chatId: "new-chat" }}
      />,
    );
    await screen.findByText(/展示计划格式不兼容/);
    await act(async () => {
      release(
        new Response(
          JSON.stringify({
            revision: 3,
            plan: makePlan({ title: "Old private plan" }),
          }),
        ),
      );
    });
    expect(screen.queryByText("Old private plan")).toBeNull();
    expect(
      within(screen.getByRole("table", { name: "结果明细" })).getByText("99"),
    ).toBeInTheDocument();
    expect(
      view.container.querySelector('[data-task-layout="stack"]'),
    ).not.toBeNull();
    const calls = fetchHost.mock.calls.filter(([url]) =>
      String(url).includes("/new/"),
    );
    expect(
      calls.every(
        ([, init]) =>
          new Headers(init?.headers).get("X-Agent-Id") === "new-owner",
      ),
    ).toBe(true);
  });

  it("loads the published OpenUI runtime on readiness and falls back when the plugin is disposed", async () => {
    const view = render(
      <View
        run={run({ payload: { result: { answer: 7 } } })}
        events={[]}
        scope={scope}
      />,
    );
    expect(view.container.querySelector("[data-task-layout]")).not.toBeNull();
    await act(async () => {
      // @ts-expect-error The actual shipped JavaScript artifact has no declaration file.
      await import("../../../plugins/bundle/qwenpaw-openui/dist/index.js");
    });
    await waitFor(() =>
      expect(
        view.container.querySelector("[data-openui-task-scope]"),
      ).not.toBeNull(),
    );
    expect(
      within(screen.getByRole("table", { name: "结果明细" })).getByText("7"),
    ).toBeInTheDocument();
    act(() => {
      win.QwenPaw.openui.dispose();
    });
    expect(view.container.querySelector("[data-task-layout]")).not.toBeNull();
  });

  it("applies simulation plan defaults once while retaining manual filters and field state across plan changes", async () => {
    vi.useFakeTimers();
    let snapshot: any = {
      schema_version: 1,
      run_id: "sim_case",
      status: "completed",
      finalized: true,
      collection_status: "complete",
      metrics: [],
      series: [
        {
          id: "P:A",
          label: "P:A",
          well: "A",
          unit: "bar",
          points: [
            { time: 0, value: 2 },
            { time: 1, value: null },
          ],
        },
        {
          id: "P:B",
          label: "P:B",
          well: "B",
          unit: "bar",
          points: [{ time: 0, value: 3 }],
        },
      ],
      fields: {
        datasets: [
          {
            dataset_id: "grid",
            revision: 1,
            properties: ["pressure", "swat"],
            time_steps: [],
          },
        ],
      },
      warnings: ["missing unit source"],
    };
    saved = {
      ...saved,
      revision: 1,
      plan: makePlan({
        task_type: "simulation",
        panels: [
          { id: "curves", kind: "curves", options: { series_ids: ["P:A"] } },
          { id: "fields", kind: "fields", options: { property: "swat" } },
        ],
      }),
    };
    const defaultFetch = fetchHost.getMockImplementation() as (
      url: string,
      init?: RequestInit,
    ) => Promise<Response>;
    fetchHost.mockImplementation(async (url: string, init?: RequestInit) =>
      url.endsWith("/results")
        ? new Response(JSON.stringify(snapshot))
        : defaultFetch(url, init),
    );
    await act(async () => {
      render(<Monitor runId="sim_case" scope={scope} subscribe={false} />);
    });
    expect(
      fetchHost.mock.calls.some(([url]) =>
        String(url).includes("/runs/ugsci%3Asim_case/presentation"),
      ),
    ).toBe(true);
    expect(
      within(screen.getByLabelText("导出曲线")).getAllByRole("option"),
    ).toHaveLength(1);
    expect(screen.getByLabelText("场图变量")).toHaveValue("swat");
    saved = {
      ...saved,
      revision: 2,
      plan: {
        ...saved.plan,
        panels: [
          { id: "curves", kind: "curves", options: { series_ids: ["P:A"] } },
          { id: "fields", kind: "fields", options: { property: "sgas" } },
        ],
      },
    };
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(
      screen.getByText("计划指定的场变量 sgas 尚不可用，当前显示 pressure。"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("场图变量")).toHaveValue("pressure");
    fireEvent.change(screen.getByLabelText("曲线变量"), {
      target: { value: "P" },
    });
    fireEvent.change(screen.getByLabelText("井筛选"), {
      target: { value: "B" },
    });
    fireEvent.change(screen.getByLabelText("场图变量"), {
      target: { value: "pressure" },
    });
    saved = {
      ...saved,
      revision: 2,
      plan: {
        ...saved.plan,
        layout: "dashboard",
        panels: [
          {
            id: "new-curve-id",
            kind: "curves",
            options: { series_ids: ["P:A"] },
          },
          { id: "new-field-id", kind: "fields", options: { property: "swat" } },
        ],
      },
    };
    const resultCalls = fetchHost.mock.calls.filter(([url]) =>
      String(url).endsWith("/results"),
    ).length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByLabelText("井筛选")).toHaveValue("B");
    expect(screen.getByLabelText("导出曲线")).toHaveValue("P:B");
    expect(screen.getByLabelText("场图变量")).toHaveValue("pressure");
    expect(mount).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("结果提示")).toHaveTextContent(
      "missing unit source",
    );
    expect(
      fetchHost.mock.calls.filter(([url]) => String(url).endsWith("/results")),
    ).toHaveLength(resultCalls);
  });
});
