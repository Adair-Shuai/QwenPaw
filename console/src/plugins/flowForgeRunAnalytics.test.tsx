// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://tauri.localhost"}
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

const options = {
  entryPoints: ["../src/qwenpaw/plugins_bundle/flowforge/ui/src/RunPanels.tsx"],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "browser",
  jsx: "transform",
  external: ["react"],
  loader: { ".css": "empty" },
};
const code = execFileSync(
  process.execPath,
  [
    "--input-type=module",
    "-e",
    `import {buildSync} from "esbuild"; process.stdout.write(buildSync(${JSON.stringify(
      options,
    )}).outputFiles[0].text);`,
  ],
  { cwd: process.cwd(), encoding: "utf8" },
);
const module = { exports: {} as { RunMonitor: React.ComponentType<any> } };
new Function("require", "module", "exports", code)(
  (name: string) => {
    if (name === "react") return React;
    if (name === "react/jsx-runtime") return jsxRuntime;
    throw new Error(`Unexpected dependency ${name}`);
  },
  module,
  module.exports,
);
const { RunMonitor } = module.exports;

let language = "zh";
let fetchMock: ReturnType<typeof vi.fn>;
let loadPreview: ReturnType<typeof vi.fn>;
const record = (overrides: Record<string, unknown> = {}) => ({
  run_id: "analytics-run",
  flow_id: "双语-workflow",
  agent_id: "recorded-agent",
  status: "failed",
  started_at: 1,
  duration_ms: 700,
  flow_revision: 2,
  node_statuses: {
    model: "failed",
    legacy: "success",
    cached: "cached",
    zero: "success",
  },
  node_details: {
    model: {
      id: "model",
      label: "中文 English 模型",
      class_type: "LLMCallNode",
      status: "failed",
      error: "failed Bearer private-session-value",
      retry_count: 1,
      timeline: [
        {
          started_at_ms: 1000,
          finished_at_ms: 1500,
          retry_count: 1,
          status: "failed",
        },
      ],
      usage_summary: {
        input_tokens: 0,
        output_tokens: 50,
        total_tokens: 50,
        recorded_executions: 1,
        executions: 1,
        incomplete: true,
      },
      outputs: [
        [
          {
            name: "中英 English",
            zero: 0,
            enabled: false,
            api_key: "hidden-output-value",
            nested: { language: "中文 English" },
          },
          { name: "第二行", zero: 1, enabled: true },
        ],
      ],
    },
    legacy: {
      id: "legacy",
      label: "旧节点",
      status: "success",
      duration_ms: 200,
    },
    cached: {
      id: "cached",
      status: "cached",
      metadata: { usage: { input_tokens: 999, output_tokens: 999 } },
    },
    zero: {
      id: "zero",
      label: "Zero time",
      status: "success",
      retry_count: 0,
      timeline: [
        {
          started_at_ms: 1700,
          finished_at_ms: 1700,
          retry_count: 0,
          status: "success",
        },
      ],
      usage_summary: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
    },
  },
  outputs: {},
  errors: [],
  events: [
    {
      type: "executing",
      node_id: "model",
      state: { status: "running", started_at_ms: 1000, metadata: { retry: 1 } },
    },
    {
      type: "progress",
      node_id: "model",
      state: { status: "running", started_at_ms: 1000, metadata: { retry: 1 } },
    },
    {
      type: "node_error",
      node_id: "model",
      state: {
        status: "error",
        started_at_ms: 1000,
        finished_at_ms: 1500,
        metadata: { retry: 1 },
      },
    },
  ],
  ...overrides,
});

function mount(run = record()) {
  const api = vi.fn(async (path: string) =>
    path === "/flowforge/runs" ? [] : run,
  );
  const props = {
    runId: run.run_id,
    agentId: "current-different-agent",
    onClose: vi.fn(),
    onStatusUpdate: vi.fn(),
    onResumed: vi.fn(),
    antd,
    api,
    streamUrl: (path: string) => `/api${path}`,
    headers: () => ({}),
  };
  return { ...render(<RunMonitor {...props} />), props };
}
const outputPanel = () =>
  screen
    .getByRole("region", { name: "节点详情 中文 English 模型" })
    .querySelector(".ff-run-value") as HTMLElement;
const chooseView = (panel: HTMLElement, name: string) => {
  const toggle = panel.querySelector(".ff-value-options") as HTMLDetailsElement;
  if (!toggle.open)
    fireEvent.click(
      within(panel).getByText(language === "zh" ? "查看方式" : "View options"),
    );
  fireEvent.click(within(panel).getByRole("button", { name }));
};

beforeEach(() => {
  language = "zh";
  loadPreview = vi.fn(
    async () =>
      function Preview({ artifact }: any) {
        return (
          <pre data-testid="host-file-preview">{JSON.stringify(artifact)}</pre>
        );
      },
  );
  (window as any).QwenPaw = {
    host: {
      useLocale: () => language,
      getApiUrl: (path: string) => `/api${path}`,
      getApiToken: () => "host-token",
      getSelectedAgentId: () => "current-different-agent",
    },
    workspace: { loadPreview },
  };
  fetchMock = vi.fn(async (url: string) =>
    String(url).endsWith("/events")
      ? new Response(new ReadableStream({ start() {} }))
      : Response.json({
          message: "中文 English 文件",
          api_key: "private-file-value",
          zero: 0,
          enabled: false,
        }),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "QwenPaw");
});

describe("FlowForge mounted run analytics and result views", () => {
  it("falls back to raw output when the same observed node changes to an incompatible result shape", async () => {
    const run = record();
    run.node_details.model.outputs = [
      [{ name: "原始 English", zero: 0, enabled: false }],
    ] as any;
    const view = mount(run);
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    const panel = outputPanel();
    fireEvent.change(
      within(panel).getByRole("combobox", { name: "选择输出槽" }),
      {
        target: { value: "0" },
      },
    );
    chooseView(panel, "表格");
    expect(within(panel).getByRole("table")).toHaveTextContent("原始 English");
    const updated = structuredClone(run);
    updated.node_details.model.outputs = [
      { message: "更新后的中文 English", zero: 0, enabled: false },
    ] as any;
    view.props.api.mockImplementation(async (path: string) =>
      path === "/flowforge/runs" ? [] : structuredClone(updated),
    );
    await waitFor(
      () => {
        expect(outputPanel().querySelector("pre")).toHaveTextContent(
          "更新后的中文 English",
        );
        expect(outputPanel()).toHaveTextContent('"zero": 0');
        expect(outputPanel()).toHaveTextContent('"enabled": false');
      },
      { timeout: 5000 },
    );
    expect(within(outputPanel()).queryByRole("table")).toBeNull();
    expect(
      within(outputPanel()).getByRole("button", { name: "原始 JSON" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("uses recorded timestamps and explicit retries with honest legacy gaps and failure aggregation", async () => {
    const view = mount();
    fireEvent.click(await screen.findByRole("tab", { name: "运行分析" }));
    const panel = screen.getByRole("region", { name: "运行分析" });
    const bars = panel.querySelectorAll(".ff-waterfall-bar");
    expect(bars).toHaveLength(2);
    expect(bars[0]).toHaveAttribute("data-start-ms", "1000");
    expect(bars[0]).toHaveAttribute("data-finish-ms", "1500");
    expect(bars[1]).toHaveAttribute("data-start-ms", "1700");
    expect(bars[1]).toHaveAttribute("data-finish-ms", "1700");
    expect(within(panel).getByText("已记录重试总数 1")).toBeVisible();
    expect(within(panel).getAllByText("起止时间未记录")).toHaveLength(2);
    expect(panel).toHaveTextContent("failed Bearer [redacted]");
    expect(panel).not.toHaveTextContent("private-session-value");
    expect(panel).not.toHaveTextContent("999");
    language = "en";
    view.rerender(<RunMonitor {...view.props} />);
    expect(
      screen.getByRole("region", { name: "Run analytics" }),
    ).toHaveTextContent("Recorded retries 1");
    expect(
      screen.getByRole("heading", { name: "Failure summary" }),
    ).toBeVisible();
    expect(
      screen.getByRole("region", { name: "Run analytics" }),
    ).toHaveTextContent("中文 English 模型");
  });

  it("estimates only recorded token usage with explicit currency and per-million rates including zero", async () => {
    mount();
    fireEvent.click(await screen.findByRole("tab", { name: "运行分析" }));
    const panel = screen.getByRole("region", { name: "运行分析" });
    expect(panel).toHaveTextContent("填写币种和两项单价");
    expect(panel).toHaveTextContent("部分用量记录不完整");
    fireEvent.change(screen.getByRole("textbox", { name: "费用币种" }), {
      target: { value: "USD" },
    });
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "输入单价 / 百万 token" }),
      { target: { value: "0" } },
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "输出单价 / 百万 token" }),
      { target: { value: "0" } },
    );
    expect(within(panel).getByRole("status")).toHaveTextContent(
      "已记录用量估算 USD 0",
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "输出单价 / 百万 token" }),
      { target: { value: "4" } },
    );
    expect(within(panel).getByRole("status")).toHaveTextContent(
      "已记录用量估算 USD 0.0002",
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "输入单价 / 百万 token" }),
      { target: { value: "" } },
    );
    expect(within(panel).getByRole("status")).toHaveTextContent(
      "填写币种和两项单价",
    );
  });

  it("switches actual node output between raw text expandable JSON and object-array tables without changing zero false or bilingual values", async () => {
    mount();
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    const panel = outputPanel();
    expect(panel).toHaveTextContent('"enabled": false');
    expect(panel).not.toHaveTextContent("hidden-output-value");
    chooseView(panel, "表格");
    const table = within(panel).getByRole("table");
    expect(
      within(table).getByRole("columnheader", { name: "name" }),
    ).toBeVisible();
    expect(
      within(table).getByRole("cell", { name: "中英 English" }),
    ).toBeVisible();
    expect(within(table).getByRole("cell", { name: "false" })).toBeVisible();
    expect(within(table).getByRole("cell", { name: "0" })).toBeVisible();
    expect(table).not.toHaveTextContent("hidden-output-value");
    chooseView(panel, "JSON 树");
    expect(panel.querySelector(".ff-json-tree")).toHaveAttribute("open");
    chooseView(panel, "文本");
    expect(panel).toHaveTextContent('"zero": 0');
    expect(panel).toHaveTextContent("中英 English");
    chooseView(panel, "原始 JSON");
    expect(panel).toHaveTextContent('"api_key": "[redacted]"');
  });

  it("bounds table pages JSON expansion and file discovery while preserving the complete raw value", async () => {
    const run = record();
    run.node_details.model.outputs = Array.from(
      { length: 1005 },
      (_, index) => ({ row: index, name: `业务行 English ${index}` }),
    ) as any;
    mount(run);
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    const panel = outputPanel();
    chooseView(panel, "表格");
    expect(within(panel).getAllByRole("row")).toHaveLength(101);
    expect(panel).toHaveTextContent("显示 1–100 / 1005 行");
    expect(
      within(panel).queryByRole("cell", { name: "业务行 English 1004" }),
    ).toBeNull();
    fireEvent.click(within(panel).getByRole("button", { name: "下一页" }));
    expect(panel).toHaveTextContent("显示 101–200 / 1005 行");
    expect(
      within(panel).getByRole("cell", { name: "业务行 English 100" }),
    ).toBeVisible();
    chooseView(panel, "JSON 树");
    expect(panel.querySelectorAll(".ff-json-tree")).toHaveLength(101);
    fireEvent.click(
      within(panel).getByRole("button", { name: "显示更多（剩余 905 项）" }),
    );
    expect(panel.querySelectorAll(".ff-json-tree")).toHaveLength(201);
    chooseView(panel, "文件");
    expect(panel).toHaveTextContent("文件列表扫描上限为 1000 项");
    expect(loadPreview).not.toHaveBeenCalled();
    chooseView(panel, "原始 JSON");
    expect(panel).toHaveTextContent("业务行 English 1004");
  });

  it("opens safe files through the real host preview contract using the recorded agent and redacted content", async () => {
    const run = record();
    run.node_details.model.outputs = [
      {
        file_path: "C:\\data\\中文 report.json",
        download_url: "https://remote.invalid/private.json",
      },
    ] as any;
    mount(run);
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    expect(loadPreview).not.toHaveBeenCalled();
    const panel = outputPanel();
    chooseView(panel, "文件");
    expect(loadPreview).not.toHaveBeenCalled();
    fireEvent.click(
      within(panel).getByRole("button", {
        name: "预览 C:/data/中文 report.json",
      }),
    );
    const preview = await screen.findByTestId("host-file-preview");
    const artifact = JSON.parse(preview.textContent!);
    expect(artifact).toMatchObject({
      workspacePath: "C:/data/中文 report.json",
      agentId: "recorded-agent",
      source: "tool_call",
      extension: "json",
    });
    expect(artifact.binaryUrl).toBe(
      `${window.location.origin}/api/files/preview/C%3A/data/%E4%B8%AD%E6%96%87%20report.json`,
    );
    expect(artifact.textContent).toContain("中文 English 文件");
    expect(artifact.textContent).toContain('"api_key": "[redacted]"');
    expect(preview).not.toHaveTextContent("private-file-value");
    const fileCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/files/preview/"),
    );
    expect(fileCall?.[1].headers).toEqual({
      "X-Agent-Id": "recorded-agent",
      Authorization: "Bearer host-token",
    });
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("remote.invalid"),
      ),
    ).toBe(false);
  });

  it("previews desktop SDK API files across origins while keeping record URLs and credentials scoped", async () => {
    expect(window.location.origin).toBe("https://tauri.localhost");
    (window as any).QwenPaw.host.getApiUrl = (path: string) =>
      `http://127.0.0.1:58223/api${path}`;
    const run = record();
    run.node_details.model.outputs = [
      {
        file_path: "C:/work/桌面.json",
        download_url: "http://127.0.0.1:58224/api/files/preview/wrong.json",
      },
    ] as any;
    mount(run);
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    chooseView(outputPanel(), "文件");
    fireEvent.click(
      screen.getByRole("button", { name: "预览 C:/work/桌面.json" }),
    );
    const preview = await screen.findByTestId("host-file-preview");
    const artifact = JSON.parse(preview.textContent!);
    expect(artifact).toMatchObject({
      workspacePath: "C:/work/桌面.json",
      agentId: "recorded-agent",
      binaryUrl:
        "http://127.0.0.1:58223/api/files/preview/C%3A/work/%E6%A1%8C%E9%9D%A2.json",
    });
    expect(artifact.textContent).toContain("[redacted]");
    const fileCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/files/preview/"),
    );
    expect(fileCalls).toHaveLength(1);
    expect(new URL(fileCalls[0][0]).origin).toBe("http://127.0.0.1:58223");
    expect(fileCalls[0][1].headers).toEqual({
      "X-Agent-Id": "recorded-agent",
      Authorization: "Bearer host-token",
    });
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).includes(":58224/")),
    ).toBe(false);
  });

  it("views actual LLM and script output slots explicitly while preserving bilingual zero false and complete raw outputs", async () => {
    const rows = [{ 中文字段: "English value", count: 0, enabled: false }];
    for (const [classType, outputs, index] of [
      ["LLMCallNode", [JSON.stringify(rows), rows], "1"],
      ["ScriptNode", [rows, "stdout 中文", "stderr English"], "0"],
    ] as const) {
      const run = record({ run_id: `slots-${classType}` });
      run.node_details.model.class_type = classType;
      run.node_details.model.outputs = outputs as any;
      const view = mount(run);
      await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
      const panel = outputPanel();
      const select = within(panel).getByRole("combobox", {
        name: "选择输出槽",
      });
      expect(select).toHaveValue("all");
      expect(panel.querySelector("pre")?.textContent).toBe(
        JSON.stringify(outputs, null, 2),
      );
      fireEvent.change(select, { target: { value: index } });
      chooseView(panel, "表格");
      const table = within(panel).getByRole("table");
      expect(
        within(table).getByRole("columnheader", { name: "中文字段" }),
      ).toBeVisible();
      expect(
        within(table).getByRole("cell", { name: "English value" }),
      ).toBeVisible();
      expect(within(table).getByRole("cell", { name: "0" })).toBeVisible();
      expect(within(table).getByRole("cell", { name: "false" })).toBeVisible();
      fireEvent.change(select, { target: { value: "all" } });
      expect(panel.querySelector("pre")?.textContent).toBe(
        JSON.stringify(outputs, null, 2),
      );
      view.unmount();
    }
  });

  it("resets output views and slots when switching observed nodes and closes the previous node file loader", async () => {
    let finish!: (value: React.ComponentType<any>) => void;
    loadPreview.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const run = record();
    run.node_details.model.outputs = [
      [{ 名称: "English row", zero: 0, enabled: false }],
    ] as any;
    (run.node_details as any).artifact = {
      id: "artifact",
      label: "Artifact file",
      outputs: [{ path: "/tmp/artifact.pdf" }],
      status: "success",
    };
    (run.node_statuses as any).artifact = "success";
    mount(run);
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    const original = outputPanel();
    fireEvent.change(
      within(original).getByRole("combobox", { name: "选择输出槽" }),
      { target: { value: "0" } },
    );
    chooseView(original, "表格");
    expect(within(original).getByRole("table")).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "检查节点 Artifact file" }),
    );
    const detail = screen.getByRole("region", {
      name: "节点详情 Artifact file",
    });
    const filePanel = detail.querySelector(".ff-run-value") as HTMLElement;
    expect(filePanel.querySelector("pre")).toHaveTextContent(
      "/tmp/artifact.pdf",
    );
    expect(
      within(filePanel).getByRole("combobox", { name: "选择输出槽" }),
    ).toHaveValue("all");
    expect(within(filePanel).queryByRole("table")).toBeNull();
    chooseView(filePanel, "文件");
    fireEvent.click(
      within(filePanel).getByRole("button", { name: "预览 /tmp/artifact.pdf" }),
    );
    await waitFor(() => expect(loadPreview).toHaveBeenCalledTimes(1));
    fireEvent.click(
      screen.getByRole("button", { name: "检查节点 中文 English 模型" }),
    );
    const returned = outputPanel();
    expect(
      within(returned).getByRole("combobox", { name: "选择输出槽" }),
    ).toHaveValue("all");
    expect(returned.querySelector("pre")).toHaveTextContent("English row");
    expect(within(returned).queryByRole("table")).toBeNull();
    await act(async () => finish(() => <div>obsolete node preview</div>));
    expect(screen.queryByText("obsolete node preview")).toBeNull();
  });

  it("closes an old slot file preview and ignores its late loader after choosing another observed slot", async () => {
    let finish!: (value: React.ComponentType<any>) => void;
    loadPreview.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const run = record();
    run.node_details.model.outputs = [
      { path: "/tmp/slot-zero.pdf" },
      { path: "/tmp/slot-one.pdf" },
    ] as any;
    mount(run);
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    const panel = outputPanel();
    const select = within(panel).getByRole("combobox", { name: "选择输出槽" });
    fireEvent.change(select, { target: { value: "0" } });
    chooseView(panel, "文件");
    fireEvent.click(
      within(panel).getByRole("button", { name: "预览 /tmp/slot-zero.pdf" }),
    );
    await waitFor(() => expect(loadPreview).toHaveBeenCalledTimes(1));
    fireEvent.change(select, { target: { value: "1" } });
    await act(async () => finish(() => <div>obsolete slot preview</div>));
    expect(screen.queryByText("obsolete slot preview")).toBeNull();
    chooseView(panel, "文件");
    expect(
      within(panel).getByRole("button", { name: "预览 /tmp/slot-one.pdf" }),
    ).toBeVisible();
    expect(
      within(panel).queryByRole("button", { name: "预览 /tmp/slot-zero.pdf" }),
    ).toBeNull();
    expect(loadPreview).toHaveBeenCalledTimes(1);
  });

  it("keeps failed host preview loading visible and retryable while legacy records without agent context stay disabled", async () => {
    const run = record();
    run.node_details.model.outputs = [{ path: "/tmp/report.pdf" }] as any;
    loadPreview.mockRejectedValueOnce(new Error("loader unavailable"));
    const view = mount(run);
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    chooseView(outputPanel(), "文件");
    fireEvent.click(
      screen.getByRole("button", { name: "预览 /tmp/report.pdf" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "loader unavailable",
    );
    fireEvent.click(screen.getByRole("button", { name: "重试文件预览" }));
    expect(await screen.findByTestId("host-file-preview")).toBeVisible();
    expect(loadPreview).toHaveBeenCalledTimes(2);
    const old = record({ run_id: "legacy-run", agent_id: undefined });
    old.node_details.model.outputs = [{ path: "/tmp/report.pdf" }] as any;
    view.rerender(
      <RunMonitor
        {...view.props}
        runId={old.run_id}
        api={async (path: string) => (path === "/flowforge/runs" ? [] : old)}
      />,
    );
    await waitFor(() =>
      expect(screen.queryByTestId("host-file-preview")).toBeNull(),
    );
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    chooseView(outputPanel(), "文件");
    expect(
      screen.getByRole("button", { name: "预览 /tmp/report.pdf" }),
    ).toBeDisabled();
    expect(outputPanel()).toHaveTextContent("此旧记录缺少所属专家");
    expect(loadPreview).toHaveBeenCalledTimes(2);
  });

  it("translates a file preview availability error live without repeating a file request", async () => {
    (window as any).QwenPaw.workspace.loadPreview = undefined;
    const run = record();
    run.node_details.model.outputs = [{ path: "./reports/中文.json" }] as any;
    const view = mount(run);
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    chooseView(outputPanel(), "文件");
    fireEvent.click(
      screen.getByRole("button", { name: "预览 reports/中文.json" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "宿主文件预览暂不可用。",
    );
    language = "en";
    view.rerender(<RunMonitor {...view.props} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The host file preview is unavailable.",
    );
    expect(
      screen.getByRole("button", { name: "Retry file preview" }),
    ).toBeVisible();
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).includes("/files/preview/"),
      ),
    ).toHaveLength(0);
    expect(loadPreview).not.toHaveBeenCalled();
  });

  it("ignores a late preview resolver after switching runs and keeps arbitrary remote links as recorded text", async () => {
    let finish!: (value: React.ComponentType<any>) => void;
    loadPreview.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const run = record();
    run.node_details.model.outputs = [{ path: "/tmp/old.pdf" }] as any;
    const view = mount(run);
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    chooseView(outputPanel(), "文件");
    fireEvent.click(screen.getByRole("button", { name: "预览 /tmp/old.pdf" }));
    await waitFor(() => expect(loadPreview).toHaveBeenCalledTimes(1));
    const fresh = record({ run_id: "fresh-run" });
    fresh.node_details.model.outputs = [
      "https://remote.invalid/result.json",
      "javascript:alert(1)",
    ] as any;
    view.rerender(
      <RunMonitor
        {...view.props}
        runId={fresh.run_id}
        api={async (path: string) => (path === "/flowforge/runs" ? [] : fresh)}
      />,
    );
    await screen.findByRole("region", { name: "节点详情 中文 English 模型" });
    await act(async () => finish(() => <div>obsolete preview</div>));
    expect(screen.queryByText("obsolete preview")).toBeNull();
    const panel = outputPanel();
    fireEvent.click(within(panel).getByText("查看方式"));
    expect(within(panel).queryByRole("button", { name: "文件" })).toBeNull();
    expect(panel).toHaveTextContent("https://remote.invalid/result.json");
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("remote.invalid"),
      ),
    ).toBe(false);
  });
});
