// @vitest-environment jsdom
import React from "react";
import * as ReactDOM from "react-dom";
import * as jsxRuntime from "react/jsx-runtime";
import { execFileSync } from "node:child_process";
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
  Reflect.deleteProperty(window, "QwenPaw");
});

function apiFor(
  document = flow,
  handler?: (url: string, options?: RequestInit) => Promise<unknown>,
) {
  return vi.fn(async (url: string, request?: RequestInit) => {
    if (url.includes("node-types")) return specs;
    if (url.endsWith("/validate")) return { ok: true, errors: [] };
    if (handler && (request?.method === "PUT" || url.endsWith("/debug")))
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
