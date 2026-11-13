// @vitest-environment jsdom
import React from "react";
import * as ReactDOM from "react-dom";
import * as jsxRuntime from "react/jsx-runtime";
import { execFileSync } from "node:child_process";
import * as antd from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import type {
  Api,
  FlowDocument,
  NodeTypeSpec,
} from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/model";
import type { RunRecord } from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/runRecord";

const options = {
  stdin: {
    resolveDir: process.cwd(),
    contents: [
      'export { WorkflowEditor } from "../src/qwenpaw/plugins_bundle/flowforge/ui/src/Editor";',
      'export { NodeInspector } from "../src/qwenpaw/plugins_bundle/flowforge/ui/src/NodeInspector";',
      'export { NodeCard } from "../src/qwenpaw/plugins_bundle/flowforge/ui/src/NodeCard";',
      'export { ReactFlow, useStoreApi } from "../src/qwenpaw/plugins_bundle/flowforge/ui/node_modules/@xyflow/react";',
    ].join("\n"),
  },
  bundle: true,
  write: false,
  format: "cjs",
  platform: "browser",
  jsx: "transform",
  external: ["react", "react-dom"],
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
  { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
);
const compiled = {
  exports: {} as Record<string, React.ComponentType<Record<string, unknown>>>,
};
new Function("require", "module", "exports", code)(
  (name: string) => {
    if (name === "react") return React;
    if (name === "react-dom") return ReactDOM;
    if (name === "react/jsx-runtime") return jsxRuntime;
    throw new Error(`Unexpected dependency ${name}`);
  },
  compiled,
  compiled.exports,
);
const { WorkflowEditor, NodeInspector, NodeCard, ReactFlow } = compiled.exports;
const useFlowStore = compiled.exports.useStoreApi as unknown as () => {
  getState: () => {
    nodeLookup: Map<
      string,
      { internals: { handleBounds?: { source?: { id: string }[] } } }
    >;
  };
};
type AuthoringRequest = {
  prompt: string;
  flow: FlowDocument;
  agent_id: string;
  selected_node_ids: string[] | null;
  parent_proposal_id: string | null;
  repair_run_id?: string;
  repair_node_id?: string;
};

const specs: NodeTypeSpec[] = [
  {
    class_type: "LLMNode",
    display_name: "模型调用",
    description: "根据提示词生成内容",
    category: "workflow/action",
    icon: "",
    control_schema: [],
    inputs_schema: [
      { name: "prompt", type: "string", required: true, multiline: true },
      { name: "system", type: "string", multiline: true },
      { name: "temperature", type: "number" },
    ],
    outputs_schema: [{ name: "text", type: "string" }],
  },
];
const flow: FlowDocument = {
  id: "workbench",
  name: "中文 English 调试流程",
  description: "",
  revision: 1,
  version: "1.0",
  metadata: {},
  inputs: [],
  outputs: [],
  start_id: null,
  edges: [],
  nodes: {
    model: {
      class_type: "LLMNode",
      label: "业务分析",
      inputs: { prompt: "服务器内容" },
    },
  },
};
const record: RunRecord = {
  run_id: "run-fixture",
  flow_id: flow.id,
  flow_revision: 1,
  agent_id: "expert-a",
  status: "completed",
  node_statuses: { model: "success" },
  outputs: {},
  errors: [],
  started_at: 1,
  duration_ms: 12,
  node_details: {
    model: {
      id: "model",
      inputs_available: true,
      inputs: { prompt: "中文 English" },
      outputs: ["中文 English 结果"],
    },
  },
};
let language = "zh";
beforeEach(() => {
  localStorage.clear();
  language = "zh";
  antd.ConfigProvider.config({
    holderRender: (children) => (
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        {children}
      </antd.ConfigProvider>
    ),
  });
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: { host: { useLocale: () => language } },
  });
});
afterEach(async () => {
  cleanup();
  await act(async () => {
    antd.Modal.destroyAll();
    antd.message.destroy();
  });
  await waitFor(() =>
    expect(document.querySelector(".ant-modal-confirm")).toBeNull(),
  );
  antd.ConfigProvider.config({ holderRender: undefined });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "QwenPaw");
});

function apiFor(
  document = flow,
  handler?: (url: string, options?: RequestInit) => Promise<unknown>,
) {
  return vi.fn(async (url: string, request?: RequestInit) => {
    if (url.includes("node-types")) return specs;
    if (url.endsWith("/validate")) return { ok: true, errors: [] };
    if (
      handler &&
      (request?.method === "PUT" ||
        url.endsWith("/debug") ||
        url.includes("/authoring/proposals"))
    )
      return handler(url, request);
    if (request?.method === "PUT")
      return { ...JSON.parse(String(request.body)), revision: 2 };
    return structuredClone(document);
  }) as Api;
}
function editor(api: Api, props: Record<string, unknown> = {}) {
  return (
    <antd.ConfigProvider theme={{ token: { motion: false } }}>
      <WorkflowEditor
        flowId={flow.id}
        userId="account:one"
        agentId="expert-a"
        antd={antd}
        api={api}
        nodeTypes={{ workflow: NodeCard }}
        edgeTypes={{}}
        Inspector={NodeInspector}
        IoConfig={() => null}
        onBack={vi.fn()}
        onRun={vi.fn()}
        onHistory={vi.fn()}
        runStatuses={{}}
        {...props}
      />
    </antd.ConfigProvider>
  );
}
async function editPrompt(value: string, root: HTMLElement = document.body) {
  fireEvent.click(
    await within(root).findByText("业务分析", { selector: "strong" }),
  );
  fireEvent.change(
    await within(root).findByRole("textbox", { name: "提示词" }),
    { target: { value } },
  );
}
function storageKeys() {
  return Array.from(
    { length: localStorage.length },
    (_, index) => localStorage.key(index)!,
  ).filter(Boolean);
}
function localDrafts() {
  return storageKeys()
    .filter((key) => key.startsWith("flowforge:editor-draft:v1:"))
    .map((key) => ({ key, ...JSON.parse(localStorage.getItem(key)!) }));
}

describe("FlowForge mounted workbench drafts and debugging", () => {
  it.each([false, true])(
    "saves edits across all property tabs in the mounted editor with drawer=%s",
    async (narrow) => {
      vi.stubGlobal("matchMedia", (query: string) => ({
        matches: query === "(max-width: 1000px)" && narrow,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      const api = apiFor();
      render(editor(api));
      await editPrompt("分组配置 Chinese English");
      const panel = within(
        narrow
          ? screen.getByRole("dialog")
          : screen.getByRole("complementary", { name: "节点属性" }),
      );
      expect(panel.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
        "参数",
        "数据",
        "输出",
        "执行",
        "基础",
      ]);
      expect(panel.getAllByRole("tabpanel")).toHaveLength(1);
      expect(panel.queryByRole("spinbutton", { name: "重试次数" })).toBeNull();
      fireEvent.click(panel.getByRole("tab", { name: "数据" }));
      expect(
        panel.getByRole("combobox", { name: "prompt 的数据来源" }),
      ).toBeVisible();
      fireEvent.click(panel.getByRole("tab", { name: "输出" }));
      fireEvent.change(panel.getByRole("textbox", { name: "输出变量名" }), {
        target: { value: "result_alias" },
      });
      expect(panel.getByRole("region", { name: "输出字段" })).toHaveTextContent(
        "文本",
      );
      fireEvent.click(panel.getByRole("tab", { name: "执行" }));
      fireEvent.change(
        panel.getByRole("spinbutton", { name: "重试延迟（秒）" }),
        { target: { value: "0" } },
      );
      fireEvent.change(
        panel.getByRole("spinbutton", { name: "节点超时（秒）" }),
        { target: { value: "25" } },
      );
      fireEvent.click(panel.getByRole("tab", { name: "基础" }));
      fireEvent.change(panel.getByRole("textbox", { name: "显示标签" }), {
        target: { value: "新节点名称" },
      });
      fireEvent.click(panel.getByRole("tab", { name: "参数" }));
      expect(panel.getByRole("textbox", { name: "提示词" })).toHaveValue(
        "分组配置 Chinese English",
      );
      if (narrow) fireEvent.click(panel.getByRole("button", { name: "Close" }));
      fireEvent.click(screen.getByRole("button", { name: "保存" }));
      await waitFor(() =>
        expect(
          vi
            .mocked(api)
            .mock.calls.some(([, request]) => request?.method === "PUT"),
        ).toBe(true),
      );
      const request = vi
        .mocked(api)
        .mock.calls.find(([, request]) => request?.method === "PUT")![1]!;
      expect(JSON.parse(String(request.body))).toMatchObject({
        nodes: {
          model: {
            label: "新节点名称",
            inputs: { prompt: "分组配置 Chinese English" },
            control: {
              output: "result_alias",
              retry_delay_sec: 0,
              timeout_sec: 25,
            },
          },
        },
      });
    },
  );

  it("recovers bilingual drafts after remount and clears only the successfully saved content", async () => {
    const api = apiFor();
    const first = render(editor(api));
    await editPrompt("中文 English 草稿");
    await waitFor(() =>
      expect(localDrafts()[0]?.document.nodes.model.inputs.prompt).toBe(
        "中文 English 草稿",
      ),
    );
    first.unmount();
    render(editor(api));
    await waitFor(
      () =>
        expect(screen.getByRole("button", { name: "恢复草稿" })).toBeVisible(),
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole("button", { name: "恢复草稿" }));
    fireEvent.click(
      await screen.findByText("业务分析", { selector: "strong" }),
    );
    expect(await screen.findByRole("textbox", { name: "提示词" })).toHaveValue(
      "中文 English 草稿",
    );
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() => expect(localDrafts()).toHaveLength(0));
    const write = vi
      .mocked(api)
      .mock.calls.find(([, request]) => request?.method === "PUT");
    expect(JSON.parse(String(write?.[1]?.body))).toMatchObject({
      expected_revision: 1,
      nodes: { model: { inputs: { prompt: "中文 English 草稿" } } },
    });
  });

  it("isolates local drafts by authenticated account and execution agent", async () => {
    const api = apiFor();
    const first = render(editor(api));
    await editPrompt("账户一专家一");
    await waitFor(() => expect(localDrafts()).toHaveLength(1));
    first.unmount();
    const second = render(editor(api, { userId: "account:two" }));
    await screen.findByText(flow.name);
    expect(screen.queryByText("恢复本地草稿")).toBeNull();
    second.unmount();
    render(editor(api, { agentId: "expert-b" }));
    await editPrompt("另一个专家");
    await waitFor(() => expect(localDrafts()).toHaveLength(2));
    expect(
      localDrafts()
        .map((draft) => draft.document.nodes.model.inputs.prompt)
        .sort(),
    ).toEqual(["另一个专家", "账户一专家一"].sort());
  });

  it("keeps newer edits when an earlier save completes and refreshes the draft revision", async () => {
    let finish!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      finish = resolve;
    });
    const api = apiFor(flow, async () => pending);
    render(editor(api));
    await editPrompt("提交版本");
    await waitFor(() =>
      expect(localDrafts()[0]?.document.nodes.model.inputs.prompt).toBe(
        "提交版本",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() =>
      expect(
        vi
          .mocked(api)
          .mock.calls.some(([, request]) => request?.method === "PUT"),
      ).toBe(true),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "提示词" }), {
      target: { value: "等待期间的新草稿" },
    });
    await waitFor(() =>
      expect(localDrafts()[0]?.document.nodes.model.inputs.prompt).toBe(
        "等待期间的新草稿",
      ),
    );
    await act(async () => {
      finish({ ...flow, revision: 2 });
      await pending;
    });
    await waitFor(() => expect(localDrafts()[0]?.baseRevision).toBe(2));
    expect(localDrafts()[0].document.nodes.model.inputs.prompt).toBe(
      "等待期间的新草稿",
    );
    expect(screen.getByText("有未保存修改")).toBeVisible();
  });

  it("preserves another editor draft when one concurrent editor saves", async () => {
    const api = apiFor();
    const first = render(editor(api));
    const second = render(editor(api));
    await editPrompt("窗口 A", first.container);
    await editPrompt("窗口 B", second.container);
    await waitFor(() => expect(localDrafts()).toHaveLength(2));
    fireEvent.click(
      within(first.container).getByRole("button", { name: "保存" }),
    );
    await waitFor(() => expect(localDrafts()).toHaveLength(1));
    expect(localDrafts()[0].document.nodes.model.inputs.prompt).toBe("窗口 B");
  });

  it("reports unavailable local draft storage and still allows a server save", async () => {
    const api = apiFor();
    render(editor(api));
    const write = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("Disk quota", "QuotaExceededError");
    });
    await editPrompt("存储异常时仍保留输入");
    expect(
      await screen.findByText("本地草稿保存不可用，请手动保存工作流"),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() =>
      expect(
        vi
          .mocked(api)
          .mock.calls.some(([, request]) => request?.method === "PUT"),
      ).toBe(true),
    );
    expect(screen.getByRole("textbox", { name: "提示词" })).toHaveValue(
      "存储异常时仍保留输入",
    );
    write.mockRestore();
  });

  it("guards host sidebar navigation and preserves an acknowledged draft before retrying once", async () => {
    render(editor(apiFor()));
    await editPrompt("离开后继续的草稿");
    const retry = vi.fn();
    const event = new CustomEvent("qwenpaw:before-navigate", {
      cancelable: true,
      detail: { to: "/chat", retry },
    });
    act(() => {
      window.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(retry).not.toHaveBeenCalled();
    fireEvent.click(
      await screen.findByRole("button", { name: "保留草稿并离开" }),
    );
    expect(retry).toHaveBeenCalledOnce();
    expect(localDrafts()[0].document.nodes.model.inputs.prompt).toBe(
      "离开后继续的草稿",
    );
  });

  it("keeps a stale recovered draft on revision conflict without overwriting the newer server revision", async () => {
    const first = render(editor(apiFor()));
    await editPrompt("旧修订草稿");
    await waitFor(() => expect(localDrafts()).toHaveLength(1));
    first.unmount();
    const api = apiFor({ ...flow, revision: 3 }, async () => {
      throw new Error("409 Revision conflict");
    });
    render(editor(api));
    fireEvent.click(await screen.findByRole("button", { name: "恢复草稿" }));
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() =>
      expect(
        vi
          .mocked(api)
          .mock.calls.some(([, request]) => request?.method === "PUT"),
      ).toBe(true),
    );
    const write = vi
      .mocked(api)
      .mock.calls.find(([, request]) => request?.method === "PUT");
    expect(JSON.parse(String(write?.[1]?.body)).expected_revision).toBe(1);
    expect(
      localDrafts().some(
        (draft) => draft.document.nodes.model.inputs.prompt === "旧修订草稿",
      ),
    ).toBe(true);
  });

  it("docks a resizable inspector beside the real canvas and keeps optional node ports compact", async () => {
    const view = render(editor(apiFor()));
    await screen.findByText("业务分析", { selector: "strong" });
    expect(
      view.container.querySelector('[data-node-density="compact"]'),
    ).toBeInTheDocument();
    expect(view.container.querySelector('[data-handleid="system"]')).toBeNull();
    await editPrompt("编辑时显示完整端口");
    expect(
      view.container.querySelector('[data-node-density="expanded"]'),
    ).toBeInTheDocument();
    expect(
      view.container.querySelector('[data-handleid="system"]'),
    ).toBeInTheDocument();
    const panel = screen.getByRole("complementary", { name: "节点属性" });
    expect(panel.closest('[role="dialog"]')).toBeNull();
    const separator = screen.getByRole("separator", { name: "调整属性栏宽度" });
    fireEvent.keyDown(separator, { key: "End" });
    expect(separator).toHaveAttribute("aria-valuenow", "560");
    expect(view.container.querySelector(".react-flow")).toBeInTheDocument();
    view.unmount();

    // jsdom needs geometry values. The real ReactFlow store still measures the real handles.
    const matrixDescriptor = Object.getOwnPropertyDescriptor(
      window,
      "DOMMatrixReadOnly",
    );
    Object.defineProperty(window, "DOMMatrixReadOnly", {
      configurable: true,
      value: class {
        m22 = 1;
      },
    });
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(270);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(180);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 270,
      bottom: 180,
      width: 270,
      height: 180,
      toJSON: () => ({}),
    });
    let store: ReturnType<typeof useFlowStore> | undefined;
    function PortCard(props: Record<string, unknown>) {
      store = useFlowStore();
      return <NodeCard {...props} />;
    }
    const portTypes = { workflow: PortCard };
    const portFlow = (connected: string) => (
      <ReactFlow
        nodes={[
          {
            id: "ports",
            type: "workflow",
            position: { x: 0, y: 0 },
            data: {
              class_type: "LLMNode",
              inputs_schema: [],
              outputs_schema: [
                { name: "text", type: "string" },
                { name: "alpha", type: "string" },
                { name: "beta", type: "string" },
              ],
              _sourceHandles: [connected],
            },
          },
        ]}
        nodeTypes={portTypes}
      />
    );
    const sourceIds = () =>
      store
        ?.getState()
        .nodeLookup.get("ports")
        ?.internals.handleBounds?.source?.map((handle) => handle.id);
    try {
      const ports = render(portFlow("alpha"));
      await waitFor(() => expect(sourceIds()).toEqual(["text", "alpha"]), {
        timeout: 5000,
      });
      ports.rerender(portFlow("beta"));
      await waitFor(() => expect(sourceIds()).toEqual(["text", "beta"]), {
        timeout: 5000,
      });
      expect(
        ports.container.querySelector('[data-handleid="alpha"]'),
      ).toBeNull();
      expect(
        ports.container.querySelector('[data-handleid="beta"]'),
      ).toBeInTheDocument();
      ports.unmount();
    } finally {
      if (matrixDescriptor)
        Object.defineProperty(window, "DOMMatrixReadOnly", matrixDescriptor);
      else Reflect.deleteProperty(window, "DOMMatrixReadOnly");
    }
  });

  it("runs a selected node with fixed bilingual slots while leaving normal run inputs independent", async () => {
    const debugCalls: Record<string, unknown>[] = [];
    const debugFlow = {
      ...flow,
      nodes: {
        source: {
          class_type: "LLMNode",
          label: "上游输出",
          inputs: { prompt: "来源" },
        },
        model: {
          class_type: "LLMNode",
          label: "业务分析",
          inputs: { prompt: ["source", 0] },
        },
      },
      edges: [
        {
          id: "source-model",
          source: "source",
          target: "model",
          source_handle: "text",
          target_handle: "prompt",
          source_slot: 0,
          kind: "data",
        },
      ],
    };
    const debugRecord = {
      ...record,
      node_details: {
        ...record.node_details,
        source: {
          id: "source",
          outputs: ["中文 story"],
          inputs_available: true,
          inputs: { prompt: "来源" },
        },
      },
    };
    const api = apiFor(debugFlow, async (url, request) => {
      if (url.endsWith("/debug")) {
        debugCalls.push(JSON.parse(String(request?.body)));
        return { run_id: "debug-run" };
      }
      return { ...flow, revision: 2 };
    });
    const onDebugRun = vi.fn(),
      onRun = vi.fn();
    render(editor(api, { debugRecord, onDebugRun, onRun }));
    fireEvent.click(
      await screen.findByText("业务分析", { selector: "strong" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "调试与变量" }));
    fireEvent.click(screen.getByRole("button", { name: "导入本次运行变量" }));
    expect(
      screen.getByRole("textbox", { name: "节点 model 的固定输出" }),
    ).toHaveValue('[\n  "中文 English 结果"\n]');
    fireEvent.change(
      screen.getByRole("textbox", { name: "节点 source 的固定输出" }),
      { target: { value: '["English reused"]' } },
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: "目标节点输入覆盖 JSON" }),
      { target: { value: '{"temperature":0}' } },
    );
    fireEvent.click(screen.getByRole("button", { name: "运行此节点" }));
    await waitFor(() => expect(onDebugRun).toHaveBeenCalledWith("debug-run"));
    expect(debugCalls[0]).toMatchObject({
      mode: "node",
      target_node_id: "model",
      expected_revision: 1,
      pins: { source: ["English reused"] },
      node_inputs: { temperature: 0 },
    });
    fireEvent.click(screen.getByRole("button", { name: "运行到此处" }));
    await waitFor(() => expect(debugCalls).toHaveLength(2));
    expect(debugCalls[1].mode).toBe("until");
    fireEvent.click(screen.getByRole("button", { name: "试运行" }));
    await waitFor(() => expect(onRun).toHaveBeenCalledWith(flow.id));
    expect(debugCalls).toHaveLength(2);
    expect(
      vi
        .mocked(api)
        .mock.calls.filter(([, request]) => request?.method === "PUT"),
    ).toHaveLength(0);
  });

  it("saves named Chinese English and mixed test cases and excludes another agent's run variables", async () => {
    const view = render(
      editor(apiFor(), { debugRecord: { ...record, agent_id: "other-agent" } }),
    );
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "调试与变量" }));
    expect(
      screen.getByRole("button", { name: "导入本次运行变量" }),
    ).toBeDisabled();
    for (const name of ["中文案例", "English case", "中英 mixed error"]) {
      fireEvent.change(screen.getByRole("textbox", { name: "测试案例名称" }), {
        target: { value: name },
      });
      fireEvent.change(
        screen.getByRole("textbox", { name: "工作流输入 JSON" }),
        {
          target: {
            value: JSON.stringify({ text: name, zero: 0, enabled: false }),
          },
        },
      );
      fireEvent.click(screen.getByRole("button", { name: "保存测试案例" }));
    }
    const keys = storageKeys().filter((key) =>
      key.startsWith("flowforge:debug-sample:v1:"),
    );
    expect(keys).toHaveLength(3);
    expect(
      keys
        .map((key) => JSON.parse(localStorage.getItem(key)!))
        .map((sample) => sample.inputs.zero),
    ).toEqual([0, 0, 0]);
    view.rerender(editor(apiFor(), { agentId: "other-agent" }));
    await screen.findByText(flow.name);
    expect(screen.queryByText("English case", { exact: true })).toBeNull();
  });

  it("recovers valid drafts alongside a corrupt record while retaining the corrupt source", async () => {
    const first = render(editor(apiFor()));
    await editPrompt("仍可恢复的草稿");
    await waitFor(() => expect(localDrafts()).toHaveLength(1));
    const validKey = localDrafts()[0].key;
    first.unmount();
    const corruptKey = validKey + "-corrupt";
    localStorage.setItem(corruptKey, "{broken");
    render(editor(apiFor()));
    fireEvent.click(await screen.findByRole("button", { name: "恢复草稿" }));
    fireEvent.click(
      await screen.findByText("业务分析", { selector: "strong" }),
    );
    expect(await screen.findByRole("textbox", { name: "提示词" })).toHaveValue(
      "仍可恢复的草稿",
    );
    expect(localStorage.getItem(corruptKey)).toBe("{broken");
  });

  it("requires confirmation again after an acknowledged same-page navigation", async () => {
    render(editor(apiFor()));
    await editPrompt("仍然未提交的草稿");
    const firstRetry = vi.fn();
    act(() => {
      window.dispatchEvent(
        new CustomEvent("qwenpaw:before-navigate", {
          cancelable: true,
          detail: {
            to: "/flowforge?flow=workbench#details",
            method: "push",
            retry: firstRetry,
          },
        }),
      );
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "保留草稿并离开" }),
    );
    expect(firstRetry).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "保留草稿并离开" }),
      ).toBeNull(),
    );
    const secondRetry = vi.fn();
    const second = new CustomEvent("qwenpaw:before-navigate", {
      cancelable: true,
      detail: { to: "/chat", method: "push", retry: secondRetry },
    });
    act(() => {
      window.dispatchEvent(second);
    });
    expect(second.defaultPrevented).toBe(true);
    expect(secondRetry).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole("button", { name: "继续编辑" }));
    expect(secondRetry).not.toHaveBeenCalled();
  });

  it("guards native browser back and consumes approval for only the requested history entry", async () => {
    const previousUrl = window.location.href;
    const previousState = window.history.state;
    window.history.replaceState(
      { idx: 4 },
      "",
      "/flowforge?flow=workbench#previous",
    );
    window.history.pushState({ idx: 5 }, "", "/flowforge?flow=workbench");
    const view = render(editor(apiFor()));
    try {
      await editPrompt("浏览器返回草稿");
      await act(async () => {
        window.history.back();
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      const leave = await screen.findByRole(
        "button",
        {
          name: "保留草稿并离开",
        },
        { timeout: 5000 },
      );
      expect(window.history.state.idx).toBe(5);
      fireEvent.click(leave);
      await waitFor(() => expect(window.history.state.idx).toBe(4));
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "保留草稿并离开" }),
        ).toBeNull(),
      );
      await act(async () => {
        window.history.forward();
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      fireEvent.click(await screen.findByRole("button", { name: "继续编辑" }));
      expect(window.history.state.idx).toBe(4);
      expect(localDrafts()[0].document.nodes.model.inputs.prompt).toBe(
        "浏览器返回草稿",
      );
    } finally {
      view.unmount();
      window.history.replaceState(previousState, "", previousUrl);
    }
  });

  it("tracks clean and acknowledged same-page pushes before guarding native back", async () => {
    const previousUrl = window.location.href;
    const previousState = window.history.state;
    window.history.replaceState({ idx: 20 }, "", "/flowforge?flow=workbench");
    const view = render(editor(apiFor()));
    const navigate = (idx: number, hash: string) => {
      const to = "/flowforge?flow=workbench" + hash;
      const retry = () => window.history.pushState({ idx }, "", to);
      const event = new CustomEvent("qwenpaw:before-navigate", {
        cancelable: true,
        detail: { to, method: "push", retry },
      });
      if (window.dispatchEvent(event)) retry();
    };
    try {
      await screen.findByText(flow.name);
      await act(async () => {
        navigate(21, "#clean");
      });
      await editPrompt("同页跳转后的未保存草稿");
      await act(async () => {
        window.history.back();
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      fireEvent.click(
        await screen.findByRole(
          "button",
          { name: "继续编辑" },
          { timeout: 5000 },
        ),
      );
      expect(window.history.state.idx).toBe(21);
      await waitFor(() =>
        expect(screen.queryByRole("button", { name: "继续编辑" })).toBeNull(),
      );
      act(() => {
        navigate(22, "#approved");
      });
      fireEvent.click(
        await screen.findByRole("button", { name: "保留草稿并离开" }),
      );
      expect(window.history.state.idx).toBe(22);
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "保留草稿并离开" }),
        ).toBeNull(),
      );
      await act(async () => {
        window.history.back();
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      fireEvent.click(
        await screen.findByRole(
          "button",
          { name: "继续编辑" },
          { timeout: 5000 },
        ),
      );
      expect(window.history.state.idx).toBe(22);
    } finally {
      view.unmount();
      window.history.replaceState(previousState, "", previousUrl);
    }
  }, 30_000);

  it("recovers valid named samples alongside corruption and resets case state across scopes", async () => {
    const prefix = (agent: string) =>
      "flowforge:debug-sample:v1:" +
      encodeURIComponent(JSON.stringify(["account:one", agent, flow.id])) +
      ":";
    const brokenKey = prefix("expert-a") + "broken";
    const wrongShapeKey = prefix("expert-a") + "wrong-shape";
    localStorage.setItem(brokenKey, "{broken 中文");
    localStorage.setItem(
      wrongShapeKey,
      JSON.stringify({
        id: "bad",
        name: "bad",
        revision: 1,
        updatedAt: 1,
        inputs: [],
        nodeInputs: {},
        pins: { model: 1 },
      }),
    );
    localStorage.setItem(
      prefix("expert-a") + "valid",
      JSON.stringify({
        id: "valid",
        name: "可用 English 样本",
        revision: 1,
        updatedAt: 1,
        inputs: { text: "中文 English", zero: 0 },
        nodeInputs: {},
        pins: { model: [[1, 2]] },
      }),
    );
    const secondBroken = prefix("expert-b") + "broken";
    localStorage.setItem(secondBroken, "null");
    const api = apiFor();
    const view = render(editor(api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "调试与变量" }));
    expect(await screen.findByText(/部分测试案例损坏/)).toBeVisible();
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "选择测试案例" }));
    const choices = await screen.findAllByText("可用 English 样本");
    fireEvent.click(choices[choices.length - 1]);
    expect(
      screen.getByRole("textbox", { name: "工作流输入 JSON" }),
    ).toHaveValue(JSON.stringify({ text: "中文 English", zero: 0 }, null, 2));
    fireEvent.change(screen.getByRole("textbox", { name: "测试案例名称" }), {
      target: { value: "scope-local name" },
    });
    view.rerender(editor(api, { agentId: "expert-b" }));
    await screen.findByText(flow.name);
    expect(screen.getByRole("textbox", { name: "测试案例名称" })).toHaveValue(
      "",
    );
    expect(
      screen.getByRole("textbox", { name: "工作流输入 JSON" }),
    ).toHaveValue("{}");
    expect(screen.getByRole("button", { name: "添加固定输出" })).toBeDisabled();
    expect(
      screen.queryByRole("textbox", { name: "节点 model 的固定输出" }),
    ).toBeNull();
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "选择测试案例" }));
    expect(screen.queryByText("可用 English 样本")).toBeNull();
    expect(localStorage.getItem(brokenKey)).toBe("{broken 中文");
    expect(localStorage.getItem(wrongShapeKey)).not.toBeNull();
    expect(localStorage.getItem(secondBroken)).toBe("null");
  });

  it("ignores a late debug response after switching the execution agent", async () => {
    let finish!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      finish = resolve;
    });
    const api = apiFor(flow, async () => pending);
    const onDebugRun = vi.fn();
    const view = render(editor(api, { onDebugRun }));
    fireEvent.click(
      await screen.findByText("业务分析", { selector: "strong" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "调试与变量" }));
    fireEvent.click(screen.getByRole("button", { name: "运行此节点" }));
    await waitFor(() =>
      expect(
        vi.mocked(api).mock.calls.some(([url]) => url.endsWith("/debug")),
      ).toBe(true),
    );
    view.rerender(editor(api, { agentId: "expert-b", onDebugRun }));
    await act(async () => {
      finish({ run_id: "late-debug-run" });
      await pending;
    });
    expect(onDebugRun).not.toHaveBeenCalled();
  });

  it("keeps invalid debug JSON editable and sends no execution request", async () => {
    const api = apiFor();
    render(editor(api));
    fireEvent.click(
      await screen.findByText("业务分析", { selector: "strong" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "调试与变量" }));
    const input = screen.getByRole("textbox", { name: "工作流输入 JSON" });
    fireEvent.change(input, { target: { value: "{invalid 中文" } });
    fireEvent.click(screen.getByRole("button", { name: "运行此节点" }));
    expect(
      await within(
        screen.getByRole("region", { name: "调试与变量" }),
      ).findByRole("alert"),
    ).toBeVisible();
    expect(input).toHaveValue("{invalid 中文");
    expect(
      vi.mocked(api).mock.calls.filter(([url]) => url.endsWith("/debug")),
    ).toHaveLength(0);
  });

  it("preserves source run revision and edited provenance when a named sample is restored", async () => {
    const source = { ...record, flow_revision: 0 };
    const first = render(editor(apiFor(), { debugRecord: source }));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "调试与变量" }));
    fireEvent.click(screen.getByRole("button", { name: "导入本次运行变量" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "节点 model 的固定输出" }),
      { target: { value: '["编辑后的 English 输出"]' } },
    );
    fireEvent.change(screen.getByRole("textbox", { name: "测试案例名称" }), {
      target: { value: "保留来源案例" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存测试案例" }));
    const key = storageKeys().find((name) =>
      name.startsWith("flowforge:debug-sample:v1:"),
    )!;
    expect(JSON.parse(localStorage.getItem(key)!).source).toEqual({
      runId: record.run_id,
      revision: 0,
      edited: true,
    });
    first.unmount();
    render(editor(apiFor()));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "调试与变量" }));
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "选择测试案例" }));
    const choices = await screen.findAllByText("保留来源案例");
    fireEvent.click(choices[choices.length - 1]);
    expect(await screen.findByText(/来源运行 run-fixture/)).toHaveTextContent(
      "来源修订 0",
    );
    expect(screen.getByText(/来源运行 run-fixture/)).toHaveTextContent(
      "测试变量已编辑",
    );
    expect(screen.getByText(/变量来自修订 0，当前修订 1/)).toBeVisible();
    expect(
      screen.getByRole("textbox", { name: "节点 model 的固定输出" }),
    ).toHaveValue('[\n  "编辑后的 English 输出"\n]');
  });

  it("localizes the mounted workbench while preserving authored bilingual node content", async () => {
    language = "en";
    const api = apiFor();
    const view = render(editor(api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByText("业务分析", { selector: "strong" }));
    expect(await screen.findByRole("textbox", { name: "Prompt" })).toHaveValue(
      "服务器内容",
    );
    expect(
      screen.getByRole("button", { name: "Debug and variables" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
    language = "zh";
    view.rerender(editor(api));
    expect(await screen.findByRole("textbox", { name: "提示词" })).toHaveValue(
      "服务器内容",
    );
    expect(screen.getByText(flow.name)).toBeVisible();
  });
});

async function menu(label: string, item: string | RegExp) {
  fireEvent.click(screen.getByRole("button", { name: label }));
  fireEvent.click(await screen.findByRole("menuitem", { name: item }));
}
const twoNodes = (): FlowDocument => ({
  ...structuredClone(flow),
  nodes: {
    source: {
      class_type: "LLMNode",
      label: "Source 中文",
      inputs: { prompt: "原文" },
      control: { mode: "bypass" },
    },
    target: {
      class_type: "LLMNode",
      label: "Target English",
      inputs: {
        prompt: ["source", 0],
        system: '前缀 ${output_slots["source"][0]}',
      },
    },
  },
  edges: [
    {
      id: "wire",
      source: "source",
      target: "target",
      source_handle: "text",
      target_handle: "prompt",
      source_slot: 0,
      kind: "data",
    },
  ],
  metadata: {
    positions: { source: { x: 20, y: 30 }, target: { x: 350, y: 30 } },
  },
});

describe("FlowForge layered toolbar", () => {
  it("duplicates a selected real subgraph with remapped bindings and supports undo", async () => {
    const writes: FlowDocument[] = [];
    const api = apiFor(twoNodes(), async (_url, request) => {
      const value = JSON.parse(String(request?.body));
      writes.push(value);
      return { ...value, revision: 2 };
    });
    const view = render(editor(api));
    await screen.findByText(flow.name);
    expect(
      screen.getByRole("toolbar", { name: "编辑与调试工具" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "节点库" }).querySelector("svg"),
    ).toBeTruthy();
    await menu("编辑", /全选节点/);
    fireEvent.click(
      within(screen.getByRole("toolbar", { name: "选中节点操作" })).getByRole(
        "button",
        { name: "副本" },
      ),
    );
    await waitFor(() =>
      expect(
        view.container.querySelectorAll(".react-flow__node-workflow"),
      ).toHaveLength(4),
    );
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() => expect(writes).toHaveLength(1));
    const doc = writes[0],
      source = Object.keys(doc.nodes).find((id) =>
        id.startsWith("source_copy_"),
      )!,
      target = Object.keys(doc.nodes).find((id) =>
        id.startsWith("target_copy_"),
      )!;
    expect(doc.nodes[target].inputs.prompt).toEqual([source, 0]);
    expect(doc.nodes[target].inputs.system).toBe(
      `前缀 \${output_slots[${JSON.stringify(source)}][0]}`,
    );
    expect(doc.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source, target, target_handle: "prompt" }),
      ]),
    );
    fireEvent.click(screen.getByRole("button", { name: "撤销" }));
    await waitFor(() =>
      expect(
        view.container.querySelectorAll(".react-flow__node-workflow"),
      ).toHaveLength(2),
    );
  });

  it("persists grouping notes and mute controls through the real save and restores bypass when enabling", async () => {
    const writes: FlowDocument[] = [];
    const mixedModes = twoNodes();
    mixedModes.nodes.target.control = { mode: "mute" };
    const api = apiFor(mixedModes, async (_url, request) => {
      const value = JSON.parse(String(request?.body));
      writes.push(value);
      return { ...value, revision: 2 };
    });
    const view = render(editor(api));
    await screen.findByText(flow.name);
    await menu("编辑", /全选节点/);
    const selection = screen.getByRole("toolbar", { name: "选中节点操作" });
    fireEvent.click(
      within(selection).getByRole("button", { name: "创建分组" }),
    );
    await waitFor(() =>
      expect(
        view.container.querySelector(".ff-canvas-group"),
      ).toBeInTheDocument(),
    );
    fireEvent.click(
      within(selection).getByRole("button", { name: "禁用节点" }),
    );
    await menu("编辑", "添加备注");
    fireEvent.change(await screen.findByRole("textbox", { name: "备注内容" }), {
      target: { value: "中文流程 English note" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].metadata.canvas_tools.groups[0].nodeIds).toEqual([
      "source",
      "target",
    ]);
    expect(writes[0].metadata.canvas_tools.notes[0].text).toBe(
      "中文流程 English note",
    );
    expect(writes[0].nodes.source.control.mode).toBe("mute");
    expect(writes[0].nodes.target.control.mode).toBe("mute");
    fireEvent.click(
      within(selection).getByRole("button", { name: "启用节点" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() => expect(writes).toHaveLength(2));
    expect(writes[1].nodes.source.control.mode).toBe("bypass");
    expect(writes[1].nodes.target.control.mode).toBe("run");
    await waitFor(() =>
      expect(view.container.querySelector(".ff-save-status")).toHaveTextContent(
        "已保存",
      ),
    );
    view.unmount();
    render(editor(apiFor(writes[1])));
    await screen.findByText(flow.name, { selector: ".ff-title strong" });
    expect(
      await screen.findByRole("textbox", { name: "备注内容" }),
    ).toHaveValue("中文流程 English note");
    expect(document.querySelector(".ff-canvas-group")).toBeInTheDocument();
  });

  it("finds real nodes and locks canvas edits while keeping view controls available", async () => {
    const writes: FlowDocument[] = [];
    const view = render(
      editor(
        apiFor(twoNodes(), async (_url, request) => {
          const value = JSON.parse(String(request?.body));
          writes.push(value);
          return { ...value, revision: 2 };
        }),
      ),
    );
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "查找画布节点" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "查找节点名称或 ID" }),
      { target: { value: "Target" } },
    );
    const search = screen.getByRole("search", { name: "查找画布节点" });
    expect(within(search).queryByRole("button", { name: /Source/ })).toBeNull();
    fireEvent.click(
      within(search).getByRole("button", { name: /Target English/ }),
    );
    await waitFor(() =>
      expect(
        view.container.querySelector('.react-flow__node[data-id="target"]'),
      ).toHaveClass("selected"),
    );
    await menu("视图", /显示网格/);
    expect(view.container.querySelector(".react-flow__background")).toBeNull();
    await menu("视图", /锁定画布编辑/);
    expect(
      within(screen.getByRole("toolbar", { name: "选中节点操作" })).getByRole(
        "button",
        { name: "副本" },
      ),
    ).toBeDisabled();
    fireEvent.keyDown(window, { key: "Delete" });
    fireEvent.keyDown(window, { key: "d", ctrlKey: true });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(Object.keys(writes[0].nodes)).toEqual(["source", "target"]);
    await menu("视图", /聚焦选中节点/);
    expect(
      view.container.querySelectorAll(".react-flow__node-workflow"),
    ).toHaveLength(2);
  });

  it("previews JSON import as an undoable draft preserving workflow identity and rejects malformed documents", async () => {
    const writes: FlowDocument[] = [];
    const view = render(
      editor(
        apiFor(flow, async (_url, request) => {
          const value = JSON.parse(String(request?.body));
          writes.push(value);
          return { ...value, revision: 2 };
        }),
      ),
    );
    await screen.findByText(flow.name);
    await menu("更多操作", "导入 JSON");
    fireEvent.change(screen.getByRole("textbox", { name: "工作流 JSON" }), {
      target: { value: '{"nodes":[]}' },
    });
    fireEvent.click(screen.getByRole("button", { name: "应用到当前草稿" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "完整的工作流 JSON",
    );
    expect(writes).toHaveLength(0);
    fireEvent.change(screen.getByRole("textbox", { name: "工作流 JSON" }), {
      target: {
        value: JSON.stringify({
          ...twoNodes(),
          id: "foreign-flow",
          revision: 99,
        }),
      },
    });
    await waitFor(() =>
      expect(screen.getByText("将导入 2 个节点")).toBeVisible(),
    );
    fireEvent.click(screen.getByRole("button", { name: "应用到当前草稿" }));
    await waitFor(() =>
      expect(
        view.container.querySelectorAll(".react-flow__node-workflow"),
      ).toHaveLength(2),
    );
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].id).toBe(flow.id);
    expect(writes[0]).toMatchObject({ expected_revision: 1 });
    fireEvent.click(screen.getByRole("button", { name: "撤销" }));
    await waitFor(() =>
      expect(
        view.container.querySelectorAll(".react-flow__node-workflow"),
      ).toHaveLength(1),
    );
  });

  it("pastes real copied nodes and clears the clipboard when the execution agent changes", async () => {
    const api = apiFor(twoNodes());
    const view = render(editor(api));
    await screen.findByText(flow.name);
    await menu("编辑", /全选节点/);
    await menu("编辑", /^复制/);
    await menu("编辑", /^粘贴/);
    await waitFor(() =>
      expect(
        view.container.querySelectorAll(".react-flow__node-workflow"),
      ).toHaveLength(4),
    );
    fireEvent.click(screen.getByRole("button", { name: "撤销" }));
    await waitFor(() =>
      expect(
        view.container.querySelectorAll(".react-flow__node-workflow"),
      ).toHaveLength(2),
    );
    view.rerender(editor(api, { agentId: "expert-b" }));
    await screen.findByText(flow.name, { selector: ".ff-title strong" });
    fireEvent.click(screen.getByRole("button", { name: "编辑" }));
    expect(
      await screen.findByRole("menuitem", { name: /^粘贴/ }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      view.container.querySelectorAll(".react-flow__node-workflow"),
    ).toHaveLength(2);
  });

  function measureAuthoringCanvas() {
    vi.stubGlobal(
      "DOMMatrixReadOnly",
      class {
        m22 = 1;
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(270);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(180);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 270,
      bottom: 180,
      width: 270,
      height: 180,
      toJSON: () => ({}),
    });
  }

  it("edits the real selected subgraph across conversation rounds and applies a chosen checkpoint with undo", async () => {
    measureAuthoringCanvas();
    const original = twoNodes();
    const requests: AuthoringRequest[] = [];
    const previews: Record<string, FlowDocument> = {};
    const api = apiFor(original, async (url, options) => {
      if (url.endsWith("/apply")) {
        const segments = url.split("/");
        const id = segments[segments.length - 2];
        return { ...structuredClone(previews[id]), revision: 2 };
      }
      const body = JSON.parse(String(options?.body));
      requests.push(body);
      const id = `round-${requests.length}`;
      const next = structuredClone(body.flow);
      next.nodes.source.label =
        requests.length === 1 ? "第一轮选区修改" : "第二轮选区修改";
      next.nodes.added = {
        class_type: "LLMNode",
        label: "新增日志",
        inputs: { prompt: "整理日志" },
      };
      next.metadata.positions.added = { x: 20, y: 350 };
      previews[id] = next;
      return {
        proposal_id: id,
        parent_proposal_id: body.parent_proposal_id,
        flow: next,
        base_revision: 1,
        validation: { ok: true, errors: [] },
        changes: [
          {
            kind: "modified",
            node_id: "source",
            description: next.nodes.source.label,
          },
          { kind: "added", node_id: "added", description: "新增日志节点" },
        ],
      };
    });
    const view = render(editor(api));
    fireEvent.click(
      await screen.findByText("Source 中文", { selector: "strong" }),
    );
    const toolbar = within(
      view.container.querySelector<HTMLElement>(".ff-commandbar")!,
    );
    const selectionbar = within(
      view.container.querySelector<HTMLElement>(".ff-selectionbar")!,
    );
    fireEvent.click(selectionbar.getByRole("button", { name: "AI 修改" }));
    let panel = within(await screen.findByRole("dialog"));
    expect(panel.getByRole("button", { name: "当前选区 (1)" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.change(
      panel.getByRole("textbox", { name: "业务目标与修改要求" }),
      { target: { value: "增加选区日志" } },
    );
    fireEvent.click(panel.getByRole("button", { name: "生成变更预览" }));
    await panel.findByRole("button", { name: "查看第 1 轮方案" });
    expect(requests[0].selected_node_ids).toEqual(["source"]);
    expect(requests[0].parent_proposal_id).toBeNull();
    expect(requests[0].flow.nodes.target).toEqual({
      ...original.nodes.target,
      control: {},
    });
    await waitFor(() =>
      expect(
        view.container.querySelector('.ff-ai-modified[data-id="source"]'),
      ).toBeInTheDocument(),
    );
    expect(
      view.container.querySelector('.ff-ai-added[data-id="added"]'),
    ).toBeInTheDocument();
    fireEvent.change(
      panel.getByRole("textbox", { name: "业务目标与修改要求" }),
      { target: { value: "继续细化日志" } },
    );
    fireEvent.click(panel.getByRole("button", { name: "继续修改" }));
    await panel.findByRole("button", { name: "查看第 2 轮方案" });
    expect(requests[1].parent_proposal_id).toBe("round-1");
    expect(requests[1].flow).toEqual(requests[0].flow);
    fireEvent.click(panel.getByRole("button", { name: /取\s*消/ }));
    fireEvent.click(toolbar.getByRole("button", { name: "AI 编辑" }));
    panel = within(await screen.findByRole("dialog"));
    fireEvent.click(
      await panel.findByRole("button", { name: "查看第 1 轮方案" }),
    );
    expect(
      panel.getByRole("button", { name: "查看第 1 轮方案" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(panel.getByRole("button", { name: "应用并保存" }));
    await waitFor(() =>
      expect(view.container.querySelector(".ff-ai-previewbar")).toBeNull(),
    );
    await waitFor(() =>
      expect(
        screen.getByText("第一轮选区修改", { selector: "strong" }),
      ).toBeVisible(),
    );
    await waitFor(() =>
      expect(
        screen.getByText("Target English", { selector: "strong" }),
      ).toBeVisible(),
    );
    expect(
      view.container.querySelectorAll(".react-flow__node-workflow"),
    ).toHaveLength(3);
    fireEvent.click(toolbar.getByRole("button", { name: "撤销" }));
    await screen.findByText("Source 中文", { selector: "strong" });
    expect(
      view.container.querySelectorAll(".react-flow__node-workflow"),
    ).toHaveLength(2);
    expect(
      vi
        .mocked(api)
        .mock.calls.filter(([url]) => String(url).endsWith("/apply")),
    ).toHaveLength(1);
  });

  it("previews added removed and changed nodes and edges on the real canvas without changing the draft", async () => {
    measureAuthoringCanvas();
    const api = apiFor(twoNodes(), async (_url, options) => {
      const body = JSON.parse(String(options?.body));
      const next = structuredClone(body.flow);
      next.nodes.source.label = "预览中的源节点";
      delete next.nodes.target;
      next.nodes.added = {
        class_type: "LLMNode",
        label: "预览中的新增节点",
        inputs: { prompt: ["source", 0] },
      };
      next.metadata.positions.added = { x: 350, y: 300 };
      next.edges = [{ ...next.edges[0], id: "new-wire", target: "added" }];
      return {
        proposal_id: "diff-preview",
        flow: next,
        base_revision: 1,
        validation: { ok: true, errors: [] },
        changes: [
          { kind: "modified", node_id: "source", description: "修改源节点" },
          { kind: "removed", node_id: "target", description: "删除目标节点" },
          { kind: "added", node_id: "added", description: "新增节点" },
        ],
      };
    });
    const view = render(editor(api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "业务目标与修改要求" }),
      { target: { value: "替换目标节点" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "生成变更预览" }));
    await screen.findByRole("button", { name: "定位变更节点 target" });
    await waitFor(() =>
      expect(
        view.container.querySelector(".ff-ai-edge-removed"),
      ).toBeInTheDocument(),
    );
    expect(
      view.container.querySelector(".ff-ai-edge-added"),
    ).toBeInTheDocument();
    expect(
      view.container.querySelector('.ff-ai-removed[data-id="target"]'),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "试运行" })).toBeDisabled();
    fireEvent.click(
      screen.getByRole("button", { name: "定位变更节点 target" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.keyDown(window, { key: "Delete" });
    window.dispatchEvent(
      new CustomEvent("flowforge:edge-delete", { detail: { id: "wire" } }),
    );
    fireEvent.click(screen.getByRole("button", { name: "退出预览" }));
    await screen.findByText("Source 中文", { selector: "strong" });
    await waitFor(() =>
      expect(
        screen.getByText("Target English", { selector: "strong" }),
      ).toBeVisible(),
    );
    expect(view.container.querySelector('[data-id="added"]')).toBeNull();
    expect(view.container.querySelectorAll(".react-flow__edge")).toHaveLength(
      1,
    );
    expect(
      screen.getByText("已保存", { selector: ".ff-save-status" }),
    ).toBeVisible();
    expect(
      vi.mocked(api).mock.calls.some(([url]) => String(url).endsWith("/apply")),
    ).toBe(false);
  });

  it("blocks stale AI proposals after draft edits and ignores late responses across expert visits", async () => {
    let finish!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      finish = resolve;
    });
    let base!: FlowDocument;
    const api = apiFor(twoNodes(), async (_url, options) => {
      base = JSON.parse(String(options?.body)).flow;
      return pending;
    });
    const view = render(editor(api));
    fireEvent.click(
      await screen.findByText("Source 中文", { selector: "strong" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "业务目标与修改要求" }),
      { target: { value: "开始修改" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "生成变更预览" }));
    await waitFor(() => expect(base).toBeDefined());
    fireEvent.change(screen.getByRole("textbox", { name: "提示词" }), {
      target: { value: "请求期间的新草稿" },
    });
    const proposal = {
      proposal_id: "late",
      flow: base,
      base_revision: 1,
      validation: { ok: true, errors: [] },
      changes: [],
    };
    await act(async () => {
      finish(proposal);
      await pending;
    });
    await screen.findByText("草稿已变化，请开始新对话");
    expect(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "应用并保存",
      }),
    ).toBeDisabled();
    expect(view.container.querySelector(".ff-ai-previewbar")).toBeNull();
    view.rerender(editor(api, { agentId: "expert-b" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    expect(
      screen.queryByRole("button", { name: "查看第 1 轮方案" }),
    ).toBeNull();
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: /取\s*消/,
      }),
    );
    view.rerender(editor(api, { agentId: "expert-a" }));
    await screen.findByText(flow.name, { selector: ".ff-title strong" });
  });

  it.each(["generation", "apply"])(
    "ignores late AI %s responses after leaving and returning to an expert",
    async (stage) => {
      let finish!: (value: unknown) => void;
      const pending = new Promise((resolve) => {
        finish = resolve;
      });
      let candidate!: FlowDocument;
      const api = apiFor(twoNodes(), async (url, options) => {
        if (url.endsWith("/apply")) return pending;
        const body = JSON.parse(String(options?.body));
        candidate = structuredClone(body.flow);
        candidate.nodes.source.label = "迟到的方案";
        if (stage === "generation") return pending;
        return {
          proposal_id: "pending-apply",
          flow: candidate,
          base_revision: 1,
          validation: { ok: true, errors: [] },
          changes: [
            { kind: "modified", node_id: "source", description: "修改源节点" },
          ],
        };
      });
      const view = render(editor(api));
      await screen.findByText(flow.name);
      fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
      fireEvent.change(
        screen.getByRole("textbox", { name: "业务目标与修改要求" }),
        { target: { value: "修改源节点" } },
      );
      fireEvent.click(screen.getByRole("button", { name: "生成变更预览" }));
      await waitFor(() => expect(candidate).toBeDefined());
      if (stage === "apply") {
        await screen.findByRole("button", { name: "查看第 1 轮方案" });
        fireEvent.click(
          within(screen.getByRole("dialog")).getByRole("button", {
            name: "应用并保存",
          }),
        );
        await waitFor(() =>
          expect(
            vi
              .mocked(api)
              .mock.calls.some(([url]) => String(url).endsWith("/apply")),
          ).toBe(true),
        );
      }
      view.rerender(editor(api, { agentId: "expert-b" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      view.rerender(editor(api, { agentId: "expert-a" }));
      await screen.findByText("Source 中文", { selector: "strong" });
      await act(async () => {
        finish(
          stage === "apply"
            ? { ...candidate, revision: 2 }
            : {
                proposal_id: "late-generation",
                flow: candidate,
                base_revision: 1,
                validation: { ok: true, errors: [] },
                changes: [],
              },
        );
        await pending;
      });
      expect(
        screen.queryByText("迟到的方案", { selector: "strong" }),
      ).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
      expect(
        screen.queryByRole("button", { name: "查看第 1 轮方案" }),
      ).toBeNull();
      expect(
        screen.getByRole("textbox", { name: "业务目标与修改要求" }),
      ).toHaveValue("");
    },
  );

  it("retains the current AI round and unsent followup when generation fails and can retry", async () => {
    const requests: AuthoringRequest[] = [];
    const api = apiFor(twoNodes(), async (_url, options) => {
      const body = JSON.parse(String(options?.body));
      requests.push(body);
      if (requests.length === 2) throw new Error("模型连接暂时中断");
      return {
        proposal_id: `retry-${requests.length}`,
        flow: body.flow,
        base_revision: 1,
        validation: { ok: true, errors: [] },
        changes: [],
      };
    });
    render(editor(api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "业务目标与修改要求" }),
      { target: { value: "第一轮" } },
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: /取\s*消/,
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    expect(
      screen.getByRole("textbox", { name: "业务目标与修改要求" }),
    ).toHaveValue("第一轮");
    fireEvent.click(screen.getByRole("button", { name: "生成变更预览" }));
    await screen.findByRole("button", { name: "查看第 1 轮方案" });
    fireEvent.change(
      screen.getByRole("textbox", { name: "业务目标与修改要求" }),
      { target: { value: "保留这段继续修改的要求" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "继续修改" }));
    await screen.findByText("模型连接暂时中断");
    expect(
      screen.getByRole("textbox", { name: "业务目标与修改要求" }),
    ).toHaveValue("保留这段继续修改的要求");
    expect(
      screen.queryByRole("button", { name: "查看第 2 轮方案" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "继续修改" }));
    await screen.findByRole("button", { name: "查看第 2 轮方案" });
    expect(requests[1].parent_proposal_id).toBe("retry-1");
    expect(requests[2]).toEqual(requests[1]);
  });

  it.each(["zh", "en"])(
    "repairs a real failed canvas node through followups preview apply and undo in %s",
    async (locale) => {
      measureAuthoringCanvas();
      language = locale;
      const english = locale === "en";
      const original = twoNodes();
      const requests: AuthoringRequest[] = [];
      let candidate = structuredClone(original);
      const api = apiFor(original, async (url, options) => {
        if (url.endsWith("/apply")) return { ...candidate, revision: 2 };
        const body = JSON.parse(String(options?.body)) as AuthoringRequest;
        requests.push(body);
        candidate = structuredClone(body.flow);
        candidate.nodes.source.inputs.prompt = "已经修正的业务提示词";
        return {
          proposal_id: `repair-${requests.length}`,
          flow: candidate,
          base_revision: 1,
          validation: { ok: true, errors: [] },
          changes: [
            { kind: "modified", node_id: "source", description: "修复提示词" },
          ],
          explanation: "根据运行中的零值输入修正提示词，保留业务数据。",
          repair_context: {
            run_id: "failed-actual-run",
            node_id: "source",
            node_label: "历史源节点",
            flow_revision: 0,
            configuration_available: true,
            configuration: { inputs: { prompt: "历史配置" } },
            inputs_available: true,
            inputs: { amount: 0, enabled: false, value: null },
            outputs_available: true,
            outputs: [0, false, null],
            error: "recorded failure",
            events: [],
          },
        };
      });
      const failed: RunRecord = {
        ...record,
        run_id: "failed-actual-run",
        flow_id: original.id,
        node_statuses: { source: "failed", target: "success" },
        node_details: { source: { id: "source", status: "failed" } },
      };
      const view = render(
        editor(api, { debugRecord: failed, runStatuses: failed.node_statuses }),
      );
      await within(view.container).findByText("Source 中文", {
        selector: "strong",
      });
      const node = within(
        view.container.querySelector<HTMLElement>(
          '.react-flow__node[data-id="source"]',
        )!,
      );
      expect(
        within(
          view.container.querySelector<HTMLElement>(
            '.react-flow__node[data-id="target"]',
          )!,
        ).queryByRole("button", { name: /AI.*修复|AI repair/ }),
      ).toBeNull();
      fireEvent.click(
        await node.findByRole("button", {
          name: english
            ? "AI repair node Source 中文"
            : "AI 修复节点 Source 中文",
        }),
      );
      const dialog = await screen.findByRole("dialog", {
        name: english ? "Repair failed node" : "AI 修复失败节点",
      });
      const panel = within(dialog);
      await panel.findByRole("button", {
        name: english ? "View round 1" : "查看第 1 轮方案",
      });
      expect(requests[0]).toMatchObject({
        repair_run_id: "failed-actual-run",
        repair_node_id: "source",
        selected_node_ids: ["source"],
        parent_proposal_id: null,
      });
      expect(
        panel.getByRole("region", {
          name: english ? "Repair explanation" : "修复说明",
        }),
      ).toHaveTextContent("保留业务数据");
      const context = panel.getByRole("region", {
        name: english ? "Failure repair context" : "失败节点修复上下文",
      });
      expect(context).toHaveTextContent("failed-actual-run");
      expect(context.textContent).toContain('"amount": 0');
      expect(context.textContent).toContain('"enabled": false');
      expect(context.textContent).toContain('"value": null');
      expect(context.textContent).toContain(
        JSON.stringify([0, false, null], null, 2),
      );
      fireEvent.change(
        panel.getByRole("textbox", {
          name: english ? "Goal and requested changes" : "业务目标与修改要求",
        }),
        { target: { value: "补充空值处理" } },
      );
      fireEvent.click(
        panel.getByRole("button", {
          name: english ? "Continue editing" : "继续修改",
        }),
      );
      await panel.findByRole("button", {
        name: english ? "View round 2" : "查看第 2 轮方案",
      });
      expect(requests[1]).toMatchObject({
        repair_run_id: "failed-actual-run",
        repair_node_id: "source",
        parent_proposal_id: "repair-1",
      });
      expect(
        view.container.querySelector('.ff-ai-modified[data-id="source"]'),
      ).toBeInTheDocument();
      expect(
        vi
          .mocked(api)
          .mock.calls.some(([url]) => /\/run$|\/debug$/.test(String(url))),
      ).toBe(false);
      fireEvent.click(
        panel.getByRole("button", {
          name: english ? "Apply and save" : "应用并保存",
        }),
      );
      await waitFor(() =>
        expect(view.container.querySelector(".ff-ai-previewbar")).toBeNull(),
      );
      expect(candidate.nodes.target).toEqual({
        ...original.nodes.target,
        control: {},
      });
      const toolbar = within(
        view.container.querySelector<HTMLElement>(".ff-commandbar")!,
      );
      fireEvent.click(
        toolbar.getByRole("button", { name: english ? "Undo" : "撤销" }),
      );
      fireEvent.click(
        await within(view.container).findByText("Source 中文", {
          selector: "strong",
        }),
      );
      expect(
        await screen.findByRole("textbox", {
          name: english ? "Prompt" : "提示词",
        }),
      ).toHaveValue(original.nodes.source.inputs.prompt);
    },
  );

  it("retains a failed repair request for retry and ignores late repairs across expert visits", async () => {
    measureAuthoringCanvas();
    const original = twoNodes();
    let finish: (value: unknown) => void = () => {};
    const requests: AuthoringRequest[] = [];
    const api = apiFor(original, async (_url, options) => {
      requests.push(JSON.parse(String(options?.body)));
      if (requests.length === 1) throw new Error("repair model offline");
      return new Promise((resolve) => {
        finish = resolve;
      });
    });
    const failed: RunRecord = {
      ...record,
      flow_id: original.id,
      run_id: "failed-retry",
      node_statuses: { source: "timeout" },
      node_details: { source: { id: "source", status: "timeout" } },
    };
    const view = render(
      editor(api, { debugRecord: failed, runStatuses: failed.node_statuses }),
    );
    await within(view.container).findByText("Source 中文", {
      selector: "strong",
    });
    const source = within(
      view.container.querySelector<HTMLElement>(
        '.react-flow__node[data-id="source"]',
      )!,
    );
    fireEvent.click(
      await source.findByRole("button", { name: "AI 修复节点 Source 中文" }),
    );
    const panel = within(
      await screen.findByRole("dialog", { name: "AI 修复失败节点" }),
    );
    await panel.findByText("repair model offline");
    expect(
      panel.getByRole("textbox", { name: "业务目标与修改要求" }),
    ).not.toHaveValue("");
    fireEvent.click(panel.getByRole("button", { name: "生成变更预览" }));
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1]).toEqual(requests[0]);
    view.rerender(
      editor(api, {
        agentId: "expert-b",
        debugRecord: failed,
        runStatuses: failed.node_statuses,
      }),
    );
    view.rerender(
      editor(api, {
        agentId: "expert-a",
        debugRecord: failed,
        runStatuses: failed.node_statuses,
      }),
    );
    await act(async () =>
      finish({
        proposal_id: "late-repair",
        flow: original,
        base_revision: 1,
        validation: { ok: true, errors: [] },
        changes: [],
      }),
    );
    expect(
      screen.queryByRole("dialog", { name: "AI 修复失败节点" }),
    ).toBeNull();
    expect(view.container.querySelector(".ff-ai-previewbar")).toBeNull();
  });
});

function concurrentAssistantApi(document = twoNodes()) {
  const chats: Record<string, any> = {
    "chat-1": { id: "chat-1", title: "第一个会话", messages: [] },
  };
  const requests: any[] = [];
  const pending: Record<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      request: any;
    }
  > = {};
  let saved = structuredClone(document);
  let counter = 1;
  const baseApi = apiFor();
  const api = vi.fn(async (url: string, options?: RequestInit) => {
    if (url.endsWith("/conversations")) {
      if (options?.method === "POST") {
        const id = `chat-${++counter}`;
        chats[id] = { id, title: `新对话 ${counter}`, messages: [] };
        return structuredClone(chats[id]);
      }
      return Object.values(chats)
        .reverse()
        .map(({ id, title }) => ({ id, title }));
    }
    if (url.endsWith("/experience")) return [];
    if (url === `/flowforge/flows/${flow.id}`) return structuredClone(saved);
    const match = url.match(/\/authoring\/conversations\/([^/]+)/);
    if (match) {
      const id = match[1];
      if (url.endsWith("/messages")) {
        const request = JSON.parse(String(options?.body));
        requests.push({ chat_id: id, ...request });
        chats[id].messages.push({
          id: `turn-${requests.length}`,
          prompt: request.prompt,
          status: "running",
          references: (request.selected_node_ids || []).map(
            (nodeId: string) => ({
              id: nodeId,
              label: request.flow.nodes[nodeId].label,
            }),
          ),
        });
        return new Promise((resolve, reject) => {
          pending[id] = { resolve, reject, request };
        });
      }
      if (url.endsWith("/apply")) {
        const turn = chats[id].messages.at(-1);
        const body = JSON.parse(String(options?.body));
        if (body.expected_revision !== saved.revision)
          throw Object.assign(new Error("版本已变化"), { status: 409 });
        saved = { ...turn.proposal.flow, revision: (saved.revision || 0) + 1 };
        turn.applied = structuredClone(saved);
        return structuredClone(saved);
      }
      return structuredClone(chats[id]);
    }
    return baseApi(url, options);
  }) as Api;
  return {
    api,
    requests,
    chats,
    finish(id: string) {
      const operation = pending[id];
      const turn = chats[id].messages.at(-1);
      const next = structuredClone(operation.request.flow);
      const nodeId = operation.request.selected_node_ids?.[0] || "source";
      next.nodes[nodeId].label = `${id} 的修改`;
      Object.assign(turn, {
        status: "completed",
        reply: `${id} 已生成方案`,
        base_flow: operation.request.flow,
        execution_agent_id: "expert-a",
        proposal: {
          proposal_id: `proposal-${turn.id}`,
          flow: next,
          base_revision: operation.request.flow.revision,
          validation: { ok: true, errors: [] },
          changes: [
            {
              kind: "modified",
              node_id: nodeId,
              description: `${id} 修改节点`,
            },
          ],
        },
      });
      operation.resolve(structuredClone(chats[id]));
    },
    fail(id: string) {
      Object.assign(chats[id].messages.at(-1), {
        status: "failed",
        error: `${id} 模型暂时不可用`,
      });
      pending[id].reject(new Error(`${id} 模型暂时不可用`));
    },
  };
}

describe("FlowForge persistent assistant", () => {
  it("restores messages and unsent text after remount and keeps chatting after apply", async () => {
    let chat: any = { id: "chat-one", title: "持续会话", messages: [] };
    let saved = structuredClone(flow);
    const requests: any[] = [];
    let otherConversationIsNewer = false;
    let releaseReply!: (value: unknown) => void;
    const baseApi = apiFor(saved);
    const api = vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith("/conversations"))
        return [
          ...(otherConversationIsNewer
            ? [{ id: "other-chat", title: "另一个新会话" }]
            : []),
          { id: chat.id, title: chat.title },
        ];
      if (url.endsWith("/experience")) return [];
      if (url === `/flowforge/flows/${flow.id}`) return structuredClone(saved);
      if (url.endsWith("/apply")) {
        saved = { ...chat.messages.at(-1).proposal.flow, revision: 2 };
        chat.messages.at(-1).applied = saved;
        return saved;
      }
      if (url.endsWith("/messages")) {
        const request = JSON.parse(String(options?.body));
        requests.push(request);
        chat.messages.push({
          id: `turn-${requests.length}`,
          prompt: request.prompt,
          base_flow: structuredClone(request.flow),
          execution_agent_id: "expert-a",
          reply: requests.length === 1 ? "已准备说明修改" : "可以继续讨论",
          status: "completed",
          ...(requests.length === 1
            ? {
                proposal: {
                  proposal_id: "new-proposal",
                  flow: { ...request.flow, description: "更新说明" },
                  base_revision: 1,
                  changes: [
                    {
                      kind: "modified",
                      field: "description",
                      description: "更新说明",
                    },
                  ],
                  validation: { ok: true, errors: [] },
                },
              }
            : {}),
        });
        if (requests.length === 2)
          return new Promise((resolve) => {
            releaseReply = resolve;
          });
        return structuredClone(chat);
      }
      if (url.endsWith("/authoring/conversations/other-chat"))
        return { id: "other-chat", title: "另一个新会话", messages: [] };
      if (url.includes("/authoring/conversations/"))
        return structuredClone(chat);
      return baseApi(url, options);
    }) as Api;
    const view = render(editor(api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    let panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await waitFor(() =>
      expect(panel.getByRole("button", { name: "发送" })).toBeDisabled(),
    );
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "修改说明" },
    });
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await panel.findByText("已准备说明修改");
    fireEvent.click(panel.getByRole("button", { name: "应用并保存" }));
    await panel.findByText(/已应用/);
    expect(panel.getByRole("textbox", { name: "消息" })).toBeVisible();
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "应用后的草稿" },
    });
    view.unmount();
    otherConversationIsNewer = true;
    render(editor(api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await panel.findByText("已准备说明修改");
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
      "应用后的草稿",
    );
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(requests).toHaveLength(2));
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "生成期间补充的下一条草稿" },
    });
    await act(async () => releaseReply(structuredClone(chat)));
    await panel.findByText("可以继续讨论");
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
      "生成期间补充的下一条草稿",
    );
    expect(requests[1].flow.revision).toBe(2);
    expect(requests).toHaveLength(2);
    expect(chat.messages[0].applied.revision).toBe(2);
  });

  it("checks each restored proposal against its own canvas and expert", async () => {
    const chat: any = { id: "chat-baselines", title: "逐轮校验", messages: [] };
    const baseApi = apiFor();
    const api = vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith("/conversations"))
        return [{ id: chat.id, title: chat.title }];
      if (url.endsWith("/experience")) return [];
      if (url.endsWith("/messages")) {
        const request = JSON.parse(String(options?.body));
        const number = chat.messages.length + 1;
        chat.messages.push({
          id: `turn-${number}`,
          prompt: request.prompt,
          reply: `方案 ${number}`,
          status: "completed",
          execution_agent_id: "expert-a",
          base_flow: structuredClone(request.flow),
          proposal: {
            proposal_id: `proposal-${number}`,
            base_revision: request.flow.revision,
            flow: { ...request.flow, description: `建议 ${number}` },
            changes: [
              {
                kind: "modified",
                field: "description",
                description: `建议 ${number}`,
              },
            ],
            validation: { ok: true, errors: [] },
          },
        });
        return structuredClone(chat);
      }
      if (url.includes("/authoring/conversations/"))
        return structuredClone(chat);
      return baseApi(url, options);
    }) as Api;
    let view = render(editor(api));
    await screen.findByText(flow.name, { selector: ".ff-title strong" });
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    let panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await waitFor(() =>
      expect(panel.getByRole("textbox", { name: "消息" })).toBeEnabled(),
    );
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "第一个要求" },
    });
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await panel.findByText("方案 1");
    expect(panel.getByRole("button", { name: "应用并保存" })).toBeEnabled();
    await editPrompt("后来的手工修改");
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "根据新画布继续修改" },
    });
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await panel.findByText("方案 2");
    expect(chat.messages[1].base_flow.nodes.model.inputs.prompt).toBe(
      "后来的手工修改",
    );
    let applyButtons = panel.getAllByRole("button", { name: "应用并保存" });
    expect(applyButtons[1]).toBeEnabled();
    fireEvent.click(panel.getAllByRole("button", { name: "预览变更" })[0]);
    expect(applyButtons[0]).toBeDisabled();
    expect(view.container.querySelector(".ff-ai-previewbar")).toBeNull();
    expect(screen.getByRole("textbox", { name: "提示词" })).toHaveValue(
      "后来的手工修改",
    );
    view.unmount();
    view = render(editor(api));
    await screen.findByText(flow.name, { selector: ".ff-title strong" });
    fireEvent.click(await screen.findByRole("button", { name: "恢复草稿" }));
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await panel.findByText("方案 2");
    applyButtons = panel.getAllByRole("button", { name: "应用并保存" });
    expect(applyButtons[1]).toBeEnabled();
    fireEvent.click(panel.getAllByRole("button", { name: "预览变更" })[0]);
    expect(applyButtons[0]).toBeDisabled();
    view.rerender(editor(api, { agentId: "expert-b" }));
    await waitFor(() =>
      expect(
        panel
          .getAllByRole("button", { name: "应用并保存" })
          .every((button) => button.hasAttribute("disabled")),
      ).toBe(true),
    );
    expect(
      vi.mocked(api).mock.calls.some(([url]) => String(url).endsWith("/apply")),
    ).toBe(false);
  });

  it.each(["zh", "en"])(
    "quotes selected canvas nodes as removable persistent message references in %s",
    async (locale) => {
      language = locale;
      const text = (zh: string, en: string) => (locale === "zh" ? zh : en);
      Object.assign((window as any).QwenPaw.host, { ReactMarkdown, remarkGfm });
      const chat: any = { id: "quoted-chat", title: "节点讨论", messages: [] };
      const other = { id: "other-chat", title: "另一段对话", messages: [] };
      const requests: any[] = [];
      const baseApi = apiFor(twoNodes());
      const api = vi.fn(async (url: string, options?: RequestInit) => {
        if (url.endsWith("/conversations"))
          return [
            { id: chat.id, title: chat.title },
            { id: other.id, title: other.title },
          ];
        if (url.endsWith("/experience")) return [];
        if (url.endsWith("/messages")) {
          const body = JSON.parse(String(options?.body));
          requests.push(body);
          chat.messages.push({
            id: `quoted-${requests.length}`,
            prompt: body.prompt,
            status: "completed",
            reply:
              "### 选区说明\n\n- 保留 **零值**\n- 检查 `prompt`\n\n|字段|用途|\n|---|---|\n|prompt|输入|",
            references: (body.selected_node_ids || []).map((id: string) => ({
              id,
              label: body.flow.nodes[id].label,
            })),
          });
          return structuredClone(chat);
        }
        if (url.endsWith(`/authoring/conversations/${other.id}`))
          return structuredClone(other);
        if (url.endsWith(`/authoring/conversations/${chat.id}`))
          return structuredClone(chat);
        return baseApi(url, options);
      }) as Api;
      let view = render(editor(api));
      await screen.findByText(flow.name);
      await menu(text("编辑", "Edit"), /全选节点|Select all nodes/);
      fireEvent.click(
        screen.getByRole("button", { name: text("AI 编辑", "AI edit") }),
      );
      let panel = within(
        await screen.findByRole("complementary", {
          name: text("工作流助手", "Workflow assistant"),
        }),
      );
      let references = within(
        await panel.findByRole("group", {
          name: text("消息引用", "Message references"),
        }),
      );
      expect(references.getByText("Source 中文")).toBeVisible();
      expect(references.getByText("Target English")).toBeVisible();
      fireEvent.click(
        references.getByRole("button", {
          name: text("移除引用 Source 中文", "Remove reference Source 中文"),
        }),
      );
      expect(references.queryByText("Source 中文")).toBeNull();
      const composer = panel.getByRole("textbox", {
        name: text("消息", "Message"),
      });
      fireEvent.change(composer, { target: { value: "解释这些节点" } });
      fireEvent.keyDown(composer, { key: "Enter", isComposing: true });
      fireEvent.keyDown(composer, { key: "Enter", shiftKey: true });
      expect(requests).toHaveLength(0);
      fireEvent.click(
        panel.getByRole("button", { name: text("发送", "Send") }),
      );
      await panel.findByRole("heading", { name: "选区说明", level: 3 });
      expect(requests[0].selected_node_ids).toEqual(["target"]);
      expect(panel.getByRole("table")).toHaveTextContent("prompt输入");
      const sentReferences = within(
        panel.getByRole("group", {
          name: text("消息中的引用", "Sent references"),
        }),
      );
      expect(sentReferences.getByText("Target English")).toBeVisible();
      fireEvent.click(
        sentReferences.getByRole("button", {
          name: text(
            "定位引用节点 Target English",
            "Locate referenced node Target English",
          ),
        }),
      );
      expect(
        view.container.querySelector('.react-flow__node[data-id="target"]'),
      ).toHaveClass("selected");
      fireEvent.change(composer, { target: { value: "稍后继续" } });
      view.unmount();
      view = render(editor(api));
      await screen.findByText(flow.name);
      fireEvent.click(
        screen.getByRole("button", { name: text("AI 编辑", "AI edit") }),
      );
      panel = within(
        await screen.findByRole("complementary", {
          name: text("工作流助手", "Workflow assistant"),
        }),
      );
      references = within(
        await panel.findByRole("group", {
          name: text("消息引用", "Message references"),
        }),
      );
      expect(references.getByText("Target English")).toBeVisible();
      expect(
        panel.getByRole("textbox", { name: text("消息", "Message") }),
      ).toHaveValue("稍后继续");
      fireEvent.click(
        panel.getByRole("button", { name: text("会话历史", "History") }),
      );
      fireEvent.click(await panel.findByRole("button", { name: "另一段对话" }));
      await waitFor(() =>
        expect(
          panel.queryByRole("group", {
            name: text("消息引用", "Message references"),
          }),
        ).toBeNull(),
      );
      fireEvent.click(
        panel.getByRole("button", { name: text("会话历史", "History") }),
      );
      fireEvent.click(await panel.findByRole("button", { name: "节点讨论" }));
      references = within(
        await panel.findByRole("group", {
          name: text("消息引用", "Message references"),
        }),
      );
      fireEvent.click(
        references.getByRole("button", {
          name: text(
            "移除引用 Target English",
            "Remove reference Target English",
          ),
        }),
      );
      expect(
        panel.queryByRole("group", {
          name: text("消息引用", "Message references"),
        }),
      ).toBeNull();
      fireEvent.click(
        panel.getByRole("button", { name: text("发送", "Send") }),
      );
      await waitFor(() => expect(requests).toHaveLength(2));
      expect(requests[1].selected_node_ids).toBeNull();
      expect(
        panel.getAllByRole("group", {
          name: text("消息中的引用", "Sent references"),
        }),
      ).toHaveLength(1);
    },
  );

  it.each(["zh", "en"])(
    "collapses crowded node references without dropping hidden context in %s",
    async (locale) => {
      language = locale;
      const text = (zh: string, en: string) => (locale === "zh" ? zh : en);
      const document = twoNodes();
      for (let index = 0; index < 4; index += 1) {
        document.nodes[`context-${index}`] = {
          class_type: "LLMNode",
          label: `用于核对长名称省略与节点引用的上下文 ${index}`,
          inputs: { prompt: "引用测试" },
        };
      }
      const ids = Object.keys(document.nodes).sort();
      const server = concurrentAssistantApi(document);
      let view = render(editor(server.api));
      await screen.findByText(flow.name);
      await menu(text("编辑", "Edit"), /全选节点|Select all nodes/);
      fireEvent.click(
        screen.getByRole("button", { name: text("AI 编辑", "AI edit") }),
      );
      let panel = within(
        await screen.findByRole("complementary", {
          name: text("工作流助手", "Workflow assistant"),
        }),
      );
      let references = within(
        await panel.findByRole("group", {
          name: text("消息引用", "Message references"),
        }),
      );
      const locatePattern = /定位引用节点|Locate referenced node/;
      expect(
        references.getAllByRole("button", { name: locatePattern }),
      ).toHaveLength(2);
      const more = references.getByRole("button", {
        name: text("还有 4 个", "4 more"),
      });
      expect(more).toHaveAttribute("aria-expanded", "false");
      expect(
        view.container.querySelector(
          `[id="${more.getAttribute("aria-controls")}"]`,
        ),
      ).not.toBeNull();
      fireEvent.click(more);
      expect(
        references.getAllByRole("button", { name: locatePattern }),
      ).toHaveLength(6);
      expect(
        references.getByRole("button", {
          name: text("收起引用", "Collapse references"),
        }),
      ).toHaveAttribute("aria-expanded", "true");
      const located = document.nodes["context-2"].label;
      fireEvent.click(
        references.getByRole("button", {
          name: text(
            `定位引用节点 ${located}`,
            `Locate referenced node ${located}`,
          ),
        }),
      );
      expect(
        view.container.querySelector('.react-flow__node[data-id="context-2"]'),
      ).toHaveClass("selected");
      const removed = document.nodes["context-3"].label;
      fireEvent.click(
        references.getByRole("button", {
          name: text(`移除引用 ${removed}`, `Remove reference ${removed}`),
        }),
      );
      expect(
        references.getAllByRole("button", { name: locatePattern }),
      ).toHaveLength(5);
      fireEvent.click(
        references.getByRole("button", {
          name: text("收起引用", "Collapse references"),
        }),
      );
      expect(
        references.getAllByRole("button", { name: locatePattern }),
      ).toHaveLength(2);
      expect(
        references.getByRole("button", { name: text("还有 3 个", "3 more") }),
      ).toHaveAttribute("aria-expanded", "false");
      fireEvent.change(
        panel.getByRole("textbox", { name: text("消息", "Message") }),
        { target: { value: "解释全部引用节点" } },
      );
      fireEvent.click(
        panel.getByRole("button", { name: text("发送", "Send") }),
      );
      await waitFor(() => expect(server.requests).toHaveLength(1));
      expect(server.requests[0].selected_node_ids).toEqual(
        ids.filter((id) => id !== "context-3"),
      );
      await act(async () => server.finish("chat-1"));
      await panel.findByText("chat-1 已生成方案");
      const sent = within(
        panel.getByRole("group", {
          name: text("消息中的引用", "Sent references"),
        }),
      );
      expect(sent.getAllByRole("button", { name: locatePattern })).toHaveLength(
        2,
      );
      fireEvent.click(
        sent.getByRole("button", { name: text("还有 3 个", "3 more") }),
      );
      expect(sent.getAllByRole("button", { name: locatePattern })).toHaveLength(
        5,
      );
      expect(
        sent.queryByRole("button", { name: /移除引用|Remove reference/ }),
      ).toBeNull();
      fireEvent.click(
        references.getByRole("button", { name: text("还有 3 个", "3 more") }),
      );
      fireEvent.click(
        panel.getByRole("button", { name: text("新对话", "New conversation") }),
      );
      await waitFor(() =>
        expect(
          panel.getByRole("tab", { name: text("会话 2", "Conversation 2") }),
        ).toHaveAttribute("aria-selected", "true"),
      );
      expect(
        panel.queryByRole("group", {
          name: text("消息引用", "Message references"),
        }),
      ).toBeNull();
      fireEvent.click(
        panel.getByRole("tab", { name: text("会话 1", "Conversation 1") }),
      );
      references = within(
        await panel.findByRole("group", {
          name: text("消息引用", "Message references"),
        }),
      );
      expect(
        references.getByRole("button", { name: text("还有 3 个", "3 more") }),
      ).toHaveAttribute("aria-expanded", "false");
      view.unmount();
      view = render(editor(server.api));
      await screen.findByText(flow.name);
      fireEvent.click(
        screen.getByRole("button", { name: text("AI 编辑", "AI edit") }),
      );
      panel = within(
        await screen.findByRole("complementary", {
          name: text("工作流助手", "Workflow assistant"),
        }),
      );
      references = within(
        await panel.findByRole("group", {
          name: text("消息引用", "Message references"),
        }),
      );
      fireEvent.click(
        references.getByRole("button", { name: text("还有 3 个", "3 more") }),
      );
      expect(
        references.getAllByRole("button", { name: locatePattern }),
      ).toHaveLength(5);
      expect(
        references.queryByRole("button", {
          name: text(
            `定位引用节点 ${removed}`,
            `Locate referenced node ${removed}`,
          ),
        }),
      ).toBeNull();
    },
  );

  it("runs numbered workflow conversations concurrently and restores their independent drafts", async () => {
    const server = concurrentAssistantApi();
    let view = render(editor(server.api));
    fireEvent.click(
      await screen.findByText("Source 中文", { selector: "strong" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    let panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await waitFor(() =>
      expect(panel.getByRole("textbox", { name: "消息" })).toBeEnabled(),
    );
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "修改输入节点" },
    });
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(server.requests).toHaveLength(1));
    expect(panel.getByRole("tab", { name: "会话 1" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(panel.getByRole("button", { name: "新对话" })).toBeEnabled();
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await waitFor(() =>
      expect(panel.getByRole("tab", { name: "会话 2" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue("");
    expect(panel.queryByRole("group", { name: "消息引用" })).toBeNull();
    fireEvent.click(screen.getByText("Target English", { selector: "strong" }));
    fireEvent.click(panel.getByRole("button", { name: "引用当前选区" }));
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "修改输出节点" },
    });
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(server.requests).toHaveLength(2));
    expect(
      server.requests.map((request) => [
        request.chat_id,
        request.selected_node_ids,
      ]),
    ).toEqual([
      ["chat-1", ["source"]],
      ["chat-2", ["target"]],
    ]);
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "第二个会话的补充草稿" },
    });
    fireEvent.click(panel.getByRole("tab", { name: "会话 1" }));
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
      "修改输入节点",
    );
    expect(
      within(panel.getByRole("group", { name: "消息引用" })).getByText(
        "Source 中文",
      ),
    ).toBeVisible();
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "第一个会话的补充草稿" },
    });
    await act(async () => server.finish("chat-2"));
    expect(panel.queryByText("chat-2 已生成方案")).toBeNull();
    expect(panel.getByRole("tab", { name: "会话 2" })).toHaveAttribute(
      "data-state",
      "ready",
    );
    expect(panel.getByRole("tab", { name: "会话 1" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await act(async () => server.finish("chat-1"));
    await panel.findByText("chat-1 已生成方案");
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
      "第一个会话的补充草稿",
    );
    fireEvent.click(panel.getByRole("tab", { name: "会话 2" }));
    await panel.findByText("chat-2 已生成方案");
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
      "第二个会话的补充草稿",
    );
    fireEvent.mouseDown(panel.getByRole("combobox", { name: "工作方式" }));
    fireEvent.click(
      await screen.findByText("仅讨论", {
        selector: ".ant-select-item-option-content",
      }),
    );
    fireEvent.click(panel.getByRole("button", { name: "应用并保存" }));
    await panel.findByText(/已应用/);
    expect(
      view.container.querySelector('.react-flow__node[data-id="source"]'),
    ).toHaveTextContent("Source 中文");
    expect(
      view.container.querySelector('.react-flow__node[data-id="target"]'),
    ).toHaveTextContent("chat-2 的修改");
    fireEvent.click(panel.getByRole("tab", { name: "会话 1" }));
    expect(panel.getByRole("button", { name: "应用并保存" })).toBeDisabled();
    expect(panel.queryByText(/已应用/)).toBeNull();
    expect(
      panel.getByRole("combobox", { name: "工作方式" }).closest(".ant-select"),
    ).toHaveTextContent("自动");
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await waitFor(() =>
      expect(panel.getByRole("tab", { name: "会话 3" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    expect(panel.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "1",
      "2",
      "3",
    ]);
    view.unmount();
    view = render(editor(server.api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await waitFor(() =>
      expect(panel.getByRole("tab", { name: "会话 3" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    expect(panel.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "1",
      "2",
      "3",
    ]);
    fireEvent.click(panel.getByRole("tab", { name: "会话 1" }));
    await waitFor(() =>
      expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
        "第一个会话的补充草稿",
      ),
    );
    fireEvent.keyDown(panel.getByRole("tab", { name: "会话 1" }), {
      key: "ArrowRight",
    });
    await waitFor(() =>
      expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
        "第二个会话的补充草稿",
      ),
    );
    expect(panel.getByRole("tab", { name: "会话 2" })).toHaveFocus();
    expect(
      panel.getByRole("combobox", { name: "工作方式" }).closest(".ant-select"),
    ).toHaveTextContent("仅讨论");
    expect(panel.getByText(/已应用/)).toBeVisible();
  });

  it("reuses the last empty conversation with its draft and references when starting another chat", async () => {
    const server = concurrentAssistantApi();
    render(editor(server.api));
    fireEvent.click(
      await screen.findByText("Source 中文", { selector: "strong" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    const panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await waitFor(() =>
      expect(panel.getByRole("textbox", { name: "消息" })).toBeEnabled(),
    );
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "第一个会话生成中" },
    });
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(server.requests).toHaveLength(1));
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await waitFor(() =>
      expect(panel.getByRole("tab", { name: "会话 2" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    fireEvent.click(panel.getByRole("button", { name: "引用当前选区" }));
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "最后一个会话的未发送草稿" },
    });
    fireEvent.click(panel.getByRole("tab", { name: "会话 1" }));
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await waitFor(() =>
      expect(panel.getByRole("tab", { name: "会话 2" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
      "最后一个会话的未发送草稿",
    );
    expect(
      within(panel.getByRole("group", { name: "消息引用" })).getByText(
        "Source 中文",
      ),
    ).toBeVisible();
    for (let click = 0; click < 3; click += 1) {
      fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    }
    expect(panel.getAllByRole("tab")).toHaveLength(2);
    expect(Object.keys(server.chats)).toHaveLength(2);
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
      "最后一个会话的未发送草稿",
    );
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(server.requests).toHaveLength(2));
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await waitFor(() =>
      expect(panel.getByRole("tab", { name: "会话 3" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    expect(Object.keys(server.chats)).toHaveLength(3);
    await act(async () => {
      server.finish("chat-1");
      server.finish("chat-2");
    });
  });

  it("caps open conversations at ten while reusing the final empty tab and guarding history opens", async () => {
    const server = concurrentAssistantApi();
    const ids = [
      "chat-1",
      ...Array.from({ length: 8 }, (_, index) => `saved-${index + 2}`),
    ];
    for (const id of [...ids, "history-only"]) {
      server.chats[id] = {
        id,
        title: id === "history-only" ? "历史中的另一段对话" : `已保存 ${id}`,
        messages: [
          {
            id: `message-${id}`,
            prompt: `讨论 ${id}`,
            reply: `说明 ${id}`,
            status: "completed",
          },
        ],
      };
    }
    localStorage.setItem(
      `flowforge-chat-tabs:account:one:${flow.id}`,
      JSON.stringify(ids),
    );
    localStorage.setItem(
      `flowforge-chat-active:account:one:${flow.id}`,
      "chat-1",
    );
    let view = render(editor(server.api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    let panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await panel.findByText("说明 chat-1");
    await waitFor(() => expect(panel.getAllByRole("tab")).toHaveLength(9));
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await waitFor(() =>
      expect(panel.getByRole("tab", { name: "会话 10" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "第十个窗口的草稿" },
    });
    fireEvent.click(panel.getByRole("tab", { name: "会话 1" }));
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    expect(panel.getByRole("tab", { name: "会话 10" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
      "第十个窗口的草稿",
    );
    expect(
      panel.queryByText("最多打开 10 个会话，请切换已有会话。"),
    ).toBeNull();
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(server.requests).toHaveLength(1));
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await panel.findByText("最多打开 10 个会话，请切换已有会话。");
    expect(panel.getAllByRole("tab")).toHaveLength(10);
    expect(Object.keys(server.chats)).toHaveLength(11);
    fireEvent.click(panel.getByRole("button", { name: "会话历史" }));
    fireEvent.click(
      await panel.findByRole("button", { name: "历史中的另一段对话" }),
    );
    await panel.findByText("最多打开 10 个会话，请切换已有会话。");
    expect(panel.getAllByRole("tab")).toHaveLength(10);
    expect(panel.getByRole("tab", { name: "会话 10" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await act(async () => server.finish("chat-2"));
    await panel.findByText("chat-2 已生成方案");
    view.unmount();
    view = render(editor(server.api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await panel.findByText("chat-2 已生成方案");
    expect(panel.getAllByRole("tab")).toHaveLength(10);
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await panel.findByText("最多打开 10 个会话，请切换已有会话。");
    expect(Object.keys(server.chats)).toHaveLength(11);
  });

  it("restores at most ten saved conversation tabs while retaining the active chat and its draft", async () => {
    const server = concurrentAssistantApi();
    const ids = Array.from({ length: 12 }, (_, index) => `legacy-${index + 1}`);
    for (const id of ids)
      server.chats[id] = { id, title: `旧会话 ${id}`, messages: [] };
    const active = ids[11];
    const key = `flowforge-chat-tabs:account:one:${flow.id}`;
    localStorage.setItem(key, JSON.stringify(ids));
    localStorage.setItem(
      `flowforge-chat-active:account:one:${flow.id}`,
      active,
    );
    localStorage.setItem(
      `flowforge-chat-draft:account:one:${flow.id}:${active}`,
      "旧会话里的草稿",
    );
    let view = render(editor(server.api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    let panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await waitFor(() =>
      expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
        "旧会话里的草稿",
      ),
    );
    expect(panel.getAllByRole("tab")).toHaveLength(10);
    expect(panel.getByRole("tab", { name: "会话 10" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual([
      ...ids.slice(0, 9),
      active,
    ]);
    fireEvent.click(panel.getByRole("tab", { name: "会话 1" }));
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await waitFor(() =>
      expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
        "旧会话里的草稿",
      ),
    );
    expect(Object.keys(server.chats)).toHaveLength(13);
    fireEvent.click(panel.getByRole("button", { name: "会话历史" }));
    expect(
      await panel.findByRole("button", { name: "旧会话 legacy-11" }),
    ).toBeVisible();
    fireEvent.click(panel.getByRole("tab", { name: "会话 10" }));
    view.unmount();
    view = render(editor(server.api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await waitFor(() =>
      expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
        "旧会话里的草稿",
      ),
    );
    expect(panel.getAllByRole("tab")).toHaveLength(10);
    expect(Object.keys(server.chats)).toHaveLength(13);
  });

  it("keeps background conversation failures and retries on their own numbered tab", async () => {
    const server = concurrentAssistantApi();
    render(editor(server.api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    const panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await waitFor(() =>
      expect(panel.getByRole("textbox", { name: "消息" })).toBeEnabled(),
    );
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "会话一要求" },
    });
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(server.requests).toHaveLength(1));
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await waitFor(() =>
      expect(panel.getByRole("tab", { name: "会话 2" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "会话二要求" },
    });
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(server.requests).toHaveLength(2));
    await act(async () => server.fail("chat-1"));
    expect(panel.queryByText("chat-1 模型暂时不可用")).toBeNull();
    expect(panel.getByRole("tab", { name: "会话 1" })).toHaveAttribute(
      "data-state",
      "error",
    );
    expect(panel.getByRole("tab", { name: "会话 2" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    fireEvent.click(panel.getByRole("tab", { name: "会话 1" }));
    await panel.findByText("chat-1 模型暂时不可用");
    await panel.findByText("会话一要求", { selector: ".ff-assistant-user p" });
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue(
      "会话一要求",
    );
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(server.requests).toHaveLength(3));
    expect(server.requests[2].chat_id).toBe("chat-1");
    await act(async () => server.finish("chat-1"));
    await panel.findByText("chat-1 已生成方案");
    expect(panel.getAllByText("chat-1 模型暂时不可用")).toHaveLength(1);
    await act(async () => server.finish("chat-2"));
    expect(panel.queryByText("chat-2 已生成方案")).toBeNull();
    fireEvent.click(panel.getByRole("tab", { name: "会话 2" }));
    await panel.findByText("chat-2 已生成方案");
    expect(panel.queryByText("chat-1 已生成方案")).toBeNull();
  });

  it("restores a running conversation and polls its result without interrupting another tab", async () => {
    const server = concurrentAssistantApi();
    let view = render(editor(server.api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    let panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await waitFor(() =>
      expect(panel.getByRole("textbox", { name: "消息" })).toBeEnabled(),
    );
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "刷新前开始生成" },
    });
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(server.requests).toHaveLength(1));
    view.unmount();
    view = render(editor(server.api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByRole("button", { name: "AI 编辑" }));
    panel = within(
      await screen.findByRole("complementary", { name: "工作流助手" }),
    );
    await waitFor(() =>
      expect(panel.getByRole("tab", { name: "会话 1" })).toHaveAttribute(
        "aria-busy",
        "true",
      ),
    );
    expect(panel.getByRole("button", { name: "发送" })).toBeDisabled();
    fireEvent.click(panel.getByRole("button", { name: "新对话" }));
    await waitFor(() =>
      expect(panel.getByRole("tab", { name: "会话 2" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    fireEvent.change(panel.getByRole("textbox", { name: "消息" }), {
      target: { value: "刷新后另一会话生成" },
    });
    fireEvent.click(panel.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(server.requests).toHaveLength(2));
    await act(async () => server.finish("chat-1"));
    await waitFor(
      () =>
        expect(panel.getByRole("tab", { name: "会话 1" })).toHaveAttribute(
          "data-state",
          "ready",
        ),
      { timeout: 5000 },
    );
    expect(panel.queryByText("chat-1 已生成方案")).toBeNull();
    expect(panel.getByRole("tab", { name: "会话 2" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await act(async () => server.finish("chat-2"));
    await panel.findByText("chat-2 已生成方案");
    fireEvent.click(panel.getByRole("tab", { name: "会话 1" }));
    await panel.findByText("chat-1 已生成方案");
    expect(panel.getByRole("textbox", { name: "消息" })).toHaveValue("");
  });
});
