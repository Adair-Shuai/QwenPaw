import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MonitorProps = {
  runId: string;
  status?: string;
  scope?: { agentId?: string; chatId?: string };
  subscribe?: boolean;
  compact?: boolean;
};
type HostWindow = Window & {
  QwenPaw?: any;
  __qwenpawRunCenterRegistered?: boolean;
  __loadSimulationCharts?: (url: string) => Promise<unknown>;
};
const win = window as HostWindow;
const bundleFolder = path.resolve(
  process.cwd(),
  "../plugins/bundle/qwenpaw-run-center/ui/dist",
);
const chartModule: Record<string, unknown> = {};
// Exercise the shipped ECharts implementation. Only the browser ES-module
// network loader is replaced for jsdom's new Function execution environment.
new Function(
  "exports",
  ts.transpileModule(
    fs.readFileSync(path.join(bundleFolder, "simulation-charts.mjs"), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText,
)(chartModule);

const result = (overrides: Record<string, unknown> = {}) => ({
  schema_version: 1,
  run_id: "sim-1",
  revision: 1,
  status: "running",
  simulator: "eclipse",
  updated_at: new Date().toISOString(),
  simulation_time: "30 days",
  start_ts: Date.now() / 1000 - 100,
  finalized: false,
  collection_status: "collecting",
  capabilities: { checkpoint_resume: false },
  metrics: [
    {
      id: "residual",
      label: "残差",
      unit: "",
      points: [
        { time: 1, value: 0.1 },
        { time: 2, value: 0.01 },
      ],
    },
  ],
  series: [
    {
      id: "WOPR:A",
      label: "产油量",
      unit: "m³/d",
      time_unit: "天",
      well: "A",
      points: [
        { time: 0, value: 3 },
        { time: 1, value: null },
        { time: 2, value: 5 },
      ],
      total_points: 300,
    },
    {
      id: "WOPR:B",
      label: "产油量",
      unit: "m³/d",
      time_unit: "天",
      well: "B",
      points: [
        { time: 0, value: 7 },
        { time: 2, value: 8 },
      ],
      total_points: 200,
    },
  ],
  fields: {
    status: "ready",
    datasets: [
      {
        dataset_id: "dataset-1",
        label: "油藏网格",
        revision: 1,
        properties: ["pressure", "swat"],
        time_steps: [
          { index: 0, timeStep: 1, step_number: 1, date: "20260101" },
        ],
      },
    ],
    warnings: [],
  },
  warnings: [],
  ...overrides,
});

describe("Run Center published simulation monitor", () => {
  let fetchHost: ReturnType<typeof vi.fn>;
  let snapshot: ReturnType<typeof result>;
  let route: React.ComponentType | null;
  let viewer: {
    ready: Promise<void>;
    executeCommand: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  };
  let mountViewer: ReturnType<typeof vi.fn>;
  let Monitor: React.ComponentType<MonitorProps>;

  beforeEach(() => {
    snapshot = result();
    route = null;
    delete win.__qwenpawRunCenterRegistered;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      measureText: (value: string) => ({ width: String(value).length * 7 }),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    URL.createObjectURL = vi.fn(() => "blob:simulation-csv");
    URL.revokeObjectURL = vi.fn();
    viewer = {
      ready: Promise.resolve(),
      executeCommand: vi.fn(async () => ({ ok: true })),
      dispose: vi.fn(),
    };
    mountViewer = vi.fn(async () => viewer);
    fetchHost = vi.fn(async (url: string) => {
      if (url.includes("/results/export"))
        return new Response("time,value\n0,3\n1,\n2,5", {
          headers: { "content-type": "text/csv" },
        });
      if (url.endsWith("/results/refresh"))
        return new Response(JSON.stringify({ status: "collecting" }));
      if (url.endsWith("/results"))
        return new Response(JSON.stringify(snapshot));
      if (url.includes("/events/stream"))
        return new Response("", {
          headers: { "content-type": "application/json" },
        });
      if (url.endsWith("/events"))
        return new Response(
          JSON.stringify({
            events: [
              {
                seq: 1,
                type: "log.line",
                data: { message: "solver still running" },
              },
            ],
          }),
        );
      if (url.includes("/runs/"))
        return new Response(
          JSON.stringify({
            run_id: "sim-1",
            operation: "simulation.run",
            status: "running",
            source: "run-center",
          }),
        );
      if (url.includes("/run-center/runs"))
        return new Response(
          JSON.stringify({
            runs: [
              {
                run_id: "sim-1",
                operation: "simulation.run",
                status: "running",
              },
            ],
          }),
        );
      return new Response(
        JSON.stringify({ models: [], studies: [], capabilities: {} }),
      );
    });
    win.QwenPaw = {
      host: {
        React,
        fetch: fetchHost,
        getApiUrl: (url: string) => `/deployment/api/${url.replace(/^\//, "")}`,
        getApiToken: () => "test-token",
        getSelectedAgentId: () => "agent-a",
      },
      route: {
        add: (_id: string, definition: { component: React.ComponentType }) => {
          route = definition.component;
        },
      },
      menu: { add: vi.fn() },
      ugsci: { visualization: { mount: mountViewer } },
    };
    win.__loadSimulationCharts = vi.fn(async () => chartModule);
    const source = fs.readFileSync(path.join(bundleFolder, "index.js"), "utf8");
    expect(source.match(/import\(/g)).toHaveLength(1);
    new Function(source.replace("import(", "window.__loadSimulationCharts("))();
    Monitor = win.QwenPaw.runCenter.SimulationMonitor;
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete win.QwenPaw;
    delete win.__qwenpawRunCenterRegistered;
    delete win.__loadSimulationCharts;
    window.history.replaceState(null, "", "/");
  });

  it("mounts monitoring from the real run page, keeps logs and disables unsupported pause", async () => {
    window.history.replaceState(null, "", "/run-center?run_id=sim-1");
    render(React.createElement(route!));
    await waitFor(() =>
      expect(screen.getByText("ECLIPSE 数模监测")).toBeInTheDocument(),
    );
    expect(screen.getByText("solver still running")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "暂停" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "取消" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "克隆" })).toBeEnabled();
    expect(screen.getByText("30 days")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen
          .getByRole("img", { name: "模拟井曲线（可缩放）" })
          .querySelector("svg"),
      ).not.toBeNull(),
    );
    // Plugins execute as blob scripts in the host. Their dynamic imports must
    // receive a fully qualified URL rather than a blob-relative /api path.
    expect(win.__loadSimulationCharts).toHaveBeenCalledWith(
      new URL(
        "/deployment/api/frontend_plugin/qwenpaw-run-center/files/ui/dist/simulation-charts.mjs",
        window.location.href,
      ).href,
    );
    expect(
      fetchHost.mock.calls.some(([url]) =>
        String(url).includes("/results/refresh"),
      ),
    ).toBe(false);
  });

  it.each([
    ["running", "暂停"],
    ["paused", "恢复"],
  ])(
    "keeps %s controls disabled while simulator capabilities are pending",
    async (status, buttonName) => {
      let releaseResults: () => void = () => {};
      const resultsReady = new Promise<void>((resolve) => {
        releaseResults = resolve;
      });
      const defaultFetch = fetchHost.getMockImplementation() as (
        url: string,
      ) => Promise<Response>;
      fetchHost.mockImplementation(async (url: string) => {
        if (url.endsWith("/results")) {
          await resultsReady;
          return new Response(
            JSON.stringify(
              result({ capabilities: { checkpoint_resume: true } }),
            ),
          );
        }
        if (url.endsWith("/run-center/runs/sim-1"))
          return new Response(
            JSON.stringify({
              run_id: "sim-1",
              operation: "simulation.run",
              status,
              source: "run-center",
            }),
          );
        return defaultFetch(url);
      });
      window.history.replaceState(null, "", "/run-center?run_id=sim-1");
      render(React.createElement(route!));
      await waitFor(() =>
        expect(screen.getByRole("button", { name: buttonName })).toBeDisabled(),
      );
      expect(screen.getByRole("button", { name: "取消" })).toBeEnabled();
      fireEvent.click(screen.getByRole("button", { name: buttonName }));
      expect(
        fetchHost.mock.calls.some(([url]) =>
          /\/(pause|resume)$/.test(String(url)),
        ),
      ).toBe(false);
      await act(async () => {
        releaseResults();
      });
      await waitFor(() =>
        expect(screen.getByRole("button", { name: buttonName })).toBeEnabled(),
      );
    },
  );

  it("filters multiple well curves, keeps missing values and exports the complete selected series with host scope", async () => {
    snapshot = result({
      series: [
        ...snapshot.series.map((item) => ({ ...item, label: item.id })),
        {
          id: "WBHP:A",
          label: "WBHP:A",
          unit: "bar",
          time_unit: "天",
          well: "A",
          points: [
            { time: 0, value: 200 },
            { time: 1, value: 190 },
          ],
        },
        {
          id: "TIME",
          label: "TIME",
          unit: "天",
          well: null,
          points: [
            { time: 0, value: 0 },
            { time: 1, value: 1 },
          ],
        },
      ],
    });
    render(
      <Monitor
        runId="ugsci:sim-1"
        scope={{ agentId: "fixed-agent", chatId: "chat-1" }}
        subscribe={false}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText("ECLIPSE 数模监测")).toBeInTheDocument(),
    );
    const variableOptions = within(screen.getByLabelText("曲线变量"));
    expect(
      variableOptions.getAllByRole("option", { name: "井产油量 (WOPR)" }),
    ).toHaveLength(1);
    expect(
      variableOptions.queryByRole("option", { name: /TIME/ }),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByLabelText("导出曲线")).getAllByRole("option"),
    ).toHaveLength(2);
    await waitFor(() =>
      expect(
        screen
          .getByRole("img", { name: "模拟井曲线（可缩放）" })
          .querySelector("svg"),
      ).not.toBeNull(),
    );
    const oilChart = screen.getByRole("img", { name: "模拟井曲线（可缩放）" });
    const firstCurve = oilChart.querySelector('path[stroke="#2563eb"]');
    expect(
      firstCurve?.getAttribute("d")?.match(/M/g)?.length,
    ).toBeGreaterThanOrEqual(2);
    fireEvent.change(screen.getByLabelText("曲线变量"), {
      target: { value: "all" },
    });
    expect(
      screen.getAllByRole("img", { name: "模拟井曲线（可缩放）" }),
    ).toHaveLength(2);
    expect(screen.getByText("纵轴：m³/d · 横轴：天")).toBeInTheDocument();
    expect(screen.getByText("纵轴：bar · 横轴：天")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("曲线变量"), {
      target: { value: "WOPR" },
    });
    fireEvent.change(screen.getByLabelText("井筛选"), {
      target: { value: "A" },
    });
    expect(
      within(screen.getByLabelText("导出曲线")).getAllByRole("option"),
    ).toHaveLength(1);
    expect(
      screen.getByText(/显示 3 \/ 300 点；缺测值保留为空/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "导出完整 CSV" }));
    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled());
    const call = fetchHost.mock.calls.find(([url]) =>
      String(url).includes("/results/export"),
    )!;
    expect(call[0]).toBe(
      "/ugsci/sim/jobs/ugsci%3Asim-1/results/export?series_id=WOPR%3AA",
    );
    const options = call[1] as RequestInit;
    expect(new Headers(options.headers).get("X-Agent-Id")).toBe("fixed-agent");
    expect(new Headers(options.headers).get("X-Chat-Id")).toBe("chat-1");
    expect(new Headers(options.headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:simulation-csv");
    expect(mountViewer).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        scope: { agentId: "fixed-agent", chatId: "chat-1" },
      }),
    );
  });

  it("refreshes live fields in place, preserves manual timestep and disposes the viewer and timers", async () => {
    const rendered = render(<Monitor runId="sim-1" subscribe={false} />);
    await waitFor(() =>
      expect(viewer.executeCommand).toHaveBeenCalledWith("refresh-dataset", {
        datasetId: "dataset-1",
        followLatest: true,
      }),
    );
    fireEvent.change(screen.getByLabelText("场图时间步"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("场图变量"), {
      target: { value: "swat" },
    });
    await waitFor(() =>
      expect(viewer.executeCommand).toHaveBeenCalledWith("set-property", {
        property: "swat",
      }),
    );
    expect(screen.getByLabelText("跟随最新")).not.toBeChecked();
    snapshot = result({
      revision: 2,
      fields: {
        status: "ready",
        datasets: [
          {
            ...snapshot.fields.datasets[0],
            revision: 2,
            time_steps: [
              ...snapshot.fields.datasets[0].time_steps,
              { index: 1, timeStep: 2, step_number: 2, date: "20260201" },
            ],
          },
        ],
        warnings: [],
      },
    });
    vi.useFakeTimers();
    // A manual refresh also exercises the final-collection POST and then reads
    // the updated snapshot without remounting the rendering engine.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "重新采集结果" }));
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(mountViewer).toHaveBeenCalledTimes(1);
    expect(viewer.executeCommand).toHaveBeenCalledWith("refresh-dataset", {
      datasetId: "dataset-1",
      followLatest: false,
    });
    expect(screen.getByLabelText("场图时间步")).toHaveValue("0");
    expect(screen.getByLabelText("场图变量")).toHaveValue("swat");
    rendered.unmount();
    expect(viewer.dispose).toHaveBeenCalledTimes(1);
    const requests = fetchHost.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    expect(fetchHost.mock.calls).toHaveLength(requests);
  });

  it("continues polling after solver exit until final results, then retains the final snapshot", async () => {
    vi.useFakeTimers();
    snapshot = result({
      status: "succeeded",
      collection_status: "finalizing",
      finalized: false,
      fields: { datasets: [], warnings: [] },
    });
    await act(async () => {
      render(
        <Monitor runId="sim-1" status="succeeded" subscribe={false} compact />,
      );
    });
    const count = () =>
      fetchHost.mock.calls.filter(([url]) => String(url).endsWith("/results"))
        .length;
    const before = count();
    snapshot = result({
      status: "succeeded",
      collection_status: "complete",
      finalized: true,
      simulation_time: "365 days",
      fields: { datasets: [], warnings: [] },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(count()).toBeGreaterThan(before);
    expect(screen.getByText("365 days")).toBeInTheDocument();
    const complete = count();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(count()).toBe(complete);
    expect(screen.getByText(/历史结果/)).toBeInTheDocument();
  });

  it("uses archived ISO timestamps and job status without chat props and only collects history on request", async () => {
    vi.useFakeTimers();
    snapshot = result({
      status: "not_collected",
      job_status: "interrupted",
      collection_status: "not_collected",
      finalized: false,
      started_at: "2026-10-26T01:00:00Z",
      finished_at: "2026-10-26T02:02:03Z",
      start_ts: null,
      end_ts: null,
      updated_at: "2026-10-26T08:00:00Z",
      data_updated_at: "2026-10-26T02:00:00Z",
      series: [],
      metrics: [],
      fields: { datasets: [], warnings: [] },
    });
    await act(async () => {
      render(<Monitor runId="sim-1" subscribe={false} />);
    });
    expect(screen.getByText("1时 2分 3秒")).toBeInTheDocument();
    expect(screen.getByText(/已中断/)).toBeInTheDocument();
    expect(
      screen.getByText(
        `数据更新时间：${new Date("2026-10-26T02:00:00Z").toLocaleString()}`,
      ),
    ).toBeInTheDocument();
    const resultCalls = () =>
      fetchHost.mock.calls.filter(([url]) => String(url).endsWith("/results"))
        .length;
    const previousCalls = resultCalls();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(resultCalls()).toBe(previousCalls);
    expect(screen.getByText("1时 2分 3秒")).toBeInTheDocument();
    snapshot = result({
      status: "interrupted",
      collection_status: "collecting",
      finalized: false,
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "采集历史结果" }));
    });
    expect(
      fetchHost.mock.calls.some(([url]) =>
        String(url).endsWith("/results/refresh"),
      ),
    ).toBe(true);
    const collectedCalls = resultCalls();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(resultCalls()).toBeGreaterThan(collectedCalls);
  });

  it("uses SSE updates, falls back to polling, retains old results on failure and retries", async () => {
    vi.useFakeTimers();
    let stream: ReadableStreamDefaultController<Uint8Array> | undefined;
    let fail = false;
    fetchHost.mockImplementation(async (url: string) => {
      if (url.includes("events/stream"))
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              stream = controller;
            },
          }),
          { headers: { "content-type": "text/event-stream" } },
        );
      if (fail)
        return new Response(JSON.stringify({ detail: "临时读取失败" }), {
          status: 503,
        });
      return new Response(JSON.stringify(snapshot));
    });
    await act(async () => {
      render(<Monitor runId="sim-1" compact />);
    });
    snapshot = result({ simulation_time: "45 days" });
    await act(async () => {
      stream!.enqueue(
        new TextEncoder().encode('data: {"seq":2,"type":"result.updated"}\n\n'),
      );
    });
    expect(screen.getByText("45 days")).toBeInTheDocument();
    fail = true;
    await act(async () => {
      stream!.close();
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByText("45 days")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("当前保留上次成功结果");
    fail = false;
    snapshot = result({ simulation_time: "60 days" });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "重试结果" }));
    });
    expect(screen.getByText("60 days")).toBeInTheDocument();
  });

  it("isolates a delayed old run response, captures Agent scope and tolerates a missing UGSci viewer", async () => {
    let release: ((value: Response) => void) | undefined;
    fetchHost.mockImplementation(async (url: string) => {
      if (url.includes("/old/"))
        return new Promise<Response>((resolve) => {
          release = resolve;
        });
      return new Response(
        JSON.stringify({ ...snapshot, simulation_time: "new-run-time" }),
      );
    });
    delete win.QwenPaw.ugsci;
    const rendered = render(<Monitor runId="old" subscribe={false} />);
    rendered.rerender(
      <Monitor
        runId="new"
        scope={{ agentId: "new-agent" }}
        subscribe={false}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText("new-run-time")).toBeInTheDocument(),
    );
    await act(async () => {
      release!(
        new Response(
          JSON.stringify(result({ simulation_time: "old-run-time" })),
        ),
      );
    });
    expect(screen.queryByText("old-run-time")).not.toBeInTheDocument();
    expect(screen.getByText(/UGSci 场图查看器尚未加载/)).toBeInTheDocument();
    win.QwenPaw.host.getSelectedAgentId = () => "another-agent";
    fireEvent.click(screen.getByRole("button", { name: "重新采集结果" }));
    await waitFor(() =>
      expect(
        fetchHost.mock.calls.some(([url]) =>
          String(url).endsWith("/results/refresh"),
        ),
      ).toBe(true),
    );
    const calls = fetchHost.mock.calls.filter(([url]) =>
      String(url).includes("/new/"),
    );
    expect(
      calls.every(
        (call) =>
          new Headers((call[1] as RequestInit).headers).get("X-Agent-Id") ===
          "new-agent",
      ),
    ).toBe(true);
  });
});
