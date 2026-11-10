// @vitest-environment jsdom
import React, { useState } from "react";
import * as ReactDOM from "react-dom";
import * as jsxRuntime from "react/jsx-runtime";
import path from "node:path";
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
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Api } from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/model";

// Compile the actual components with production's host React boundary. Running
// esbuild in Node also avoids jsdom's separate TextEncoder/Uint8Array realms.
const buildOptions = {
  stdin: {
    contents:
      'export { NodeInspector } from "./src/NodeInspector"; export { NodeCard } from "./src/NodeCard"; export { ReactFlowProvider } from "@xyflow/react";',
    resolveDir: path.resolve(
      process.cwd(),
      "../src/qwenpaw/plugins_bundle/flowforge/ui",
    ),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "cjs",
  platform: "browser",
  jsx: "transform",
  external: ["react", "react-dom"],
};
const source = execFileSync(
  process.execPath,
  [
    "-e",
    `process.stdout.write(require("esbuild").buildSync(${JSON.stringify(
      buildOptions,
    )}).outputFiles[0].text)`,
  ],
  { cwd: process.cwd(), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
);
const compiledModule = {
  exports: {} as Record<string, React.ComponentType<Record<string, unknown>>>,
};
new Function("require", "module", "exports", source)(
  (name: string) => {
    if (name === "react") return React;
    if (name === "react-dom") return ReactDOM;
    if (name === "react/jsx-runtime") return jsxRuntime;
    throw new Error(`Unexpected external dependency: ${name}`);
  },
  compiledModule,
  compiledModule.exports,
);
const { NodeInspector, NodeCard, ReactFlowProvider } = compiledModule.exports;

const agentSpec = {
  class_type: "AgentNode",
  display_name: "智能体",
  description: "真实专家任务",
  category: "模型与能力",
  icon: "",
  inputs_schema: [
    { name: "agent_id", type: "string", required: true, options: [] },
    { name: "query", type: "string", required: true, options: [] },
    { name: "context", type: "*", options: [] },
  ],
  outputs_schema: [{ name: "reply", type: "string" }],
  control_schema: ["next", "error_handler"],
};
const node = (inputs: Record<string, unknown> = {}) => ({
  id: "expert",
  position: { x: 0, y: 0 },
  data: {
    class_type: "AgentNode",
    inputs,
    control: { max_retries: 0, retry_delay_sec: 0 },
  },
});
const readyAgents = {
  agents: [
    {
      id: "research",
      name: "研究专家",
      description: "检索资料并整理结论",
      enabled: true,
    },
    { id: "disabled", name: "停用专家", enabled: false },
    {
      id: "managed",
      name: "应用引擎",
      managed_by_app: "private-app",
      available_in_chat: false,
    },
  ],
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const base = (overrides: Record<string, unknown> = {}) => ({
  node: node(),
  nodeTypes: [agentSpec],
  availableNodes: [],
  edges: [],
  antd,
  api: vi.fn(async () => readyAgents) as Api,
  agentId: "host-agent",
  flowId: "flow",
  onUpdate: vi.fn(),
  ...overrides,
});

afterEach(cleanup);

describe("FlowForge mounted node inspector", () => {
  it("focuses structured schema JSON pointer errors in the actual field without losing their detail", async () => {
    const onUpdate = vi.fn();
    render(
      <NodeInspector
        {...base()}
        node={{
          ...node(),
          data: {
            class_type: "LLMCallNode",
            inputs: { output_schema: { type: "unknown" } },
          },
        }}
        nodeTypes={[
          {
            ...agentSpec,
            class_type: "LLMCallNode",
            inputs_schema: [{ name: "output_schema", type: "object" }],
          },
        ]}
        focusedField="inputs.output_schema/type"
        diagnostics={[
          {
            field: "inputs.output_schema/type",
            severity: "error",
            message: "Invalid JSON Schema type",
          },
        ]}
        onUpdate={onUpdate}
      />,
    );
    const schemaInput = screen.getByRole("textbox", {
      name: "输出 JSON Schema",
    });
    await waitFor(() => expect(schemaInput).toHaveFocus());
    const schemaField = schemaInput.closest(
      '[data-field-name="output_schema"]',
    ) as HTMLElement;
    for (const alert of within(schemaField).getAllByRole("alert"))
      expect(alert).toHaveTextContent("Invalid JSON Schema type");
    expect(schemaInput).toHaveValue('{\n  "type": "unknown"\n}');
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("edits structured model schemas through the real inspector and preserves bilingual business keys", async () => {
    const Language = React.createContext("zh");
    const previous = Object.getOwnPropertyDescriptor(window, "QwenPaw");
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: { host: { useLocale: () => React.useContext(Language) } },
    });
    const schema = {
      type: "object",
      properties: { 中文名称: { type: "string" }, count: { type: "integer" } },
      required: ["中文名称"],
    };
    const spec = {
      ...agentSpec,
      class_type: "LLMCallNode",
      inputs_schema: [
        { name: "prompt", type: "string", required: true, multiline: true },
        {
          name: "response_format",
          type: "enum",
          default: "text",
          options: ["text", "json_schema"],
        },
        { name: "output_schema", type: "object", default: {} },
      ],
      outputs_schema: [
        { name: "content", type: "string" },
        { name: "parsed", type: "*" },
      ],
    };
    const changed = vi.fn();
    function Harness() {
      const [language, setLanguage] = useState("zh");
      const [value, setValue] = useState({
        ...node(),
        data: {
          class_type: "LLMCallNode",
          inputs: {
            prompt: "中文 English",
            response_format: "text",
            output_schema: schema,
          },
          control: {},
        },
      });
      return (
        <Language.Provider value={language}>
          <button onClick={() => setLanguage("en")}>Switch language</button>
          <NodeInspector
            {...base({ nodeTypes: [spec] })}
            node={value}
            onUpdate={(next: typeof value) => {
              changed(next);
              setValue(next);
            }}
          />
        </Language.Provider>
      );
    }
    try {
      render(<Harness />);
      fireEvent.mouseDown(screen.getByRole("combobox", { name: "响应格式" }));
      fireEvent.click(screen.getByText("JSON Schema 校验"));
      expect(changed).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            inputs: expect.objectContaining({
              response_format: "json_schema",
              output_schema: schema,
            }),
          }),
        }),
      );
      const schemaInput = screen.getByRole("textbox", {
        name: "输出 JSON Schema",
      });
      fireEvent.change(schemaInput, { target: { value: '{"type":' } });
      expect(schemaInput).toHaveValue('{"type":');
      fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
      expect(
        screen.getByRole("textbox", { name: "Output JSON Schema" }),
      ).toHaveValue('{"type":');
      expect(
        screen.getByRole("combobox", { name: "Response format" }),
      ).toBeEnabled();
      expect(screen.getByRole("textbox", { name: "Prompt" })).toHaveValue(
        "中文 English",
      );
      fireEvent.change(
        screen.getByRole("textbox", { name: "Output JSON Schema" }),
        {
          target: { value: JSON.stringify(schema) },
        },
      );
      expect(changed).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            inputs: {
              prompt: "中文 English",
              response_format: "json_schema",
              output_schema: schema,
            },
          }),
        }),
      );
      await waitFor(() =>
        expect(
          screen.getByText(/Local \$defs and \$ref are supported/),
        ).toBeVisible(),
      );
    } finally {
      cleanup();
      if (previous) Object.defineProperty(window, "QwenPaw", previous);
      else Reflect.deleteProperty(window, "QwenPaw");
    }
  });

  it("switches live node settings between Chinese and English while preserving model overrides and business values", () => {
    const Language = React.createContext("zh");
    const previous = Object.getOwnPropertyDescriptor(window, "QwenPaw");
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: { host: { useLocale: () => React.useContext(Language) } },
    });
    const changed = vi.fn();
    const spec = {
      ...agentSpec,
      class_type: "LLMCallNode",
      inputs_schema: [
        { name: "prompt", type: "string", required: true, multiline: true },
        { name: "system", type: "string", multiline: true },
        { name: "model", type: "string" },
        { name: "temperature", type: "number", min: 0, max: 2 },
        { name: "max_tokens", type: "integer", min: 1, max: 32768 },
      ],
    };
    function Harness() {
      const [language, setLanguage] = useState("zh");
      const [value, setValue] = useState({
        ...node(),
        data: {
          class_type: "LLMCallNode",
          inputs: {
            prompt: "业务提问 English prompt",
            system: "写中文. Return English when requested.",
            model: "provider/custom-model",
            temperature: 0,
            max_tokens: 1,
          },
          control: {},
        },
      });
      return (
        <Language.Provider value={language}>
          <button onClick={() => setLanguage(language === "zh" ? "en" : "zh")}>
            Switch language
          </button>
          <NodeInspector
            {...base({
              node: value,
              nodeTypes: [spec],
              onUpdate: (updated: typeof value) => {
                setValue(updated);
                changed(updated);
              },
            })}
          />
        </Language.Provider>
      );
    }
    try {
      render(<Harness />);
      expect(screen.getByRole("textbox", { name: "覆盖模型" })).toHaveValue(
        "provider/custom-model",
      );
      expect(
        screen.getByText(/填写 model 或 provider\/model 可显式覆盖/),
      ).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
      expect(screen.getByText("Models are provided by the host")).toBeVisible();
      expect(
        screen.getByRole("textbox", { name: "Model override" }),
      ).toHaveValue("provider/custom-model");
      expect(screen.getByRole("textbox", { name: "Prompt" })).toHaveValue(
        "业务提问 English prompt",
      );
      expect(
        screen.getByRole("textbox", { name: "System instructions" }),
      ).toHaveValue("写中文. Return English when requested.");
      expect(
        screen.getByRole("spinbutton", { name: "Temperature" }),
      ).toHaveValue("0");
      expect(
        screen.getByRole("spinbutton", { name: "Maximum output tokens" }),
      ).toHaveValue("1");
      fireEvent.change(
        screen.getByRole("textbox", { name: "System instructions" }),
        {
          target: { value: "中英混排 system instructions" },
        },
      );
      expect(changed).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            inputs: expect.objectContaining({
              model: "provider/custom-model",
              temperature: 0,
              system: "中英混排 system instructions",
            }),
          }),
        }),
      );
      fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
      expect(screen.getByRole("textbox", { name: "系统提示词" })).toHaveValue(
        "中英混排 system instructions",
      );
    } finally {
      cleanup();
      if (previous) Object.defineProperty(window, "QwenPaw", previous);
      else Reflect.deleteProperty(window, "QwenPaw");
    }
  });

  it("edits bilingual system instructions while preserving the linked user prompt", () => {
    const props = base({
      node: {
        ...node(),
        data: {
          class_type: "LLMCallNode",
          inputs: { prompt: ["input", 0], system: "原系统指令" },
          control: {},
        },
      },
      nodeTypes: [
        {
          ...agentSpec,
          class_type: "LLMCallNode",
          inputs_schema: [
            { name: "prompt", type: "string", required: true, multiline: true },
            { name: "system", type: "string", multiline: true, default: "" },
          ],
        },
      ],
    });
    render(<NodeInspector {...props} />);
    const field = screen.getByRole("textbox", { name: "系统提示词" });
    expect(field.tagName).toBe("TEXTAREA");
    expect(field).toHaveValue("原系统指令");
    fireEvent.change(field, {
      target: { value: "写中文故事\nWrite an English story." },
    });
    expect(props.onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inputs: {
            prompt: ["input", 0],
            system: "写中文故事\nWrite an English story.",
          },
        }),
      }),
    );
  });

  it("loads real host agent choices without replacing saved ids and edits multiline tasks", async () => {
    const request = deferred<typeof readyAgents>();
    const api = vi.fn(() => request.promise);
    const changed = vi.fn();
    function Harness() {
      const [value, setValue] = useState(
        node({ agent_id: "old-expert", query: "原任务", private_value: 0 }),
      );
      return (
        <NodeInspector
          {...base({
            api,
            node: value,
            onUpdate: (updated: typeof value) => {
              changed(updated);
              setValue(updated);
            },
          })}
        />
      );
    }
    render(<Harness />);
    expect(screen.getByText("old-expert · 已保存，待确认")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("正在加载智能体");
    expect(api).toHaveBeenCalledWith(
      "/agents",
      expect.objectContaining({
        headers: { "X-Agent-Id": "host-agent" },
        signal: expect.any(AbortSignal),
      }),
    );
    await act(async () => request.resolve(readyAgents));
    expect(screen.getByText(/old-expert · 当前目录不可用/)).toBeVisible();
    expect(changed).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "执行智能体" }));
    fireEvent.click(await screen.findByText("研究专家 · 已启用"));
    expect(screen.getByText("检索资料并整理结论")).toBeVisible();
    expect(screen.queryByText("应用引擎 · 已启用")).not.toBeInTheDocument();
    const query = screen.getByRole("textbox", { name: "任务指令" });
    expect(query.tagName).toBe("TEXTAREA");
    fireEvent.change(query, { target: { value: "第一步分析\n第二步汇总" } });
    expect(changed).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inputs: {
            agent_id: "research",
            query: "第一步分析\n第二步汇总",
            private_value: 0,
          },
          control: { max_retries: 0, retry_delay_sec: 0 },
        }),
      }),
    );
  });

  it("aborts old directory requests and rejects late responses across agent and flow scope", async () => {
    const old = deferred<typeof readyAgents>(),
      fresh = deferred<typeof readyAgents>();
    const api = vi
      .fn()
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(fresh.promise);
    const props = base({ api, node: node({ agent_id: "research" }) });
    const view = render(<NodeInspector {...props} />);
    const oldSignal = (api.mock.calls[0][1] as RequestInit).signal!;
    view.rerender(
      <NodeInspector {...props} agentId="new-host" flowId="other-flow" />,
    );
    expect(oldSignal.aborted).toBe(true);
    expect(api.mock.calls[1][1].headers).toEqual({ "X-Agent-Id": "new-host" });
    await act(async () =>
      fresh.resolve({
        agents: [{ id: "research", name: "新作用域专家", enabled: true }],
      }),
    );
    await act(async () => old.resolve(readyAgents));
    expect(screen.getByText("新作用域专家 · 已启用")).toBeVisible();
    expect(screen.queryByText("研究专家 · 已启用")).not.toBeInTheDocument();
    expect(props.onUpdate).not.toHaveBeenCalled();
    view.unmount();
    expect(api.mock.calls[1][1].signal.aborted).toBe(true);
  });

  it("translates a recorded agent directory failure after a live language switch without refetching", async () => {
    const Language = React.createContext("zh");
    const previous = Object.getOwnPropertyDescriptor(window, "QwenPaw");
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: { host: { useLocale: () => React.useContext(Language) } },
    });
    const api = vi.fn().mockResolvedValue({ agents: null });
    const props = base({ api, node: node({ agent_id: "research" }) });
    const inspector = <NodeInspector {...props} />;
    try {
      const view = render(
        <Language.Provider value="zh">{inspector}</Language.Provider>,
      );
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "智能体目录响应无效",
      );
      view.rerender(
        <Language.Provider value="en">{inspector}</Language.Provider>,
      );
      expect(screen.getByRole("alert")).toHaveTextContent(
        "The agent directory response is invalid",
      );
      expect(screen.getByRole("alert")).not.toHaveTextContent(
        "智能体目录响应无效",
      );
      expect(api).toHaveBeenCalledTimes(1);
      expect(props.onUpdate).not.toHaveBeenCalled();
    } finally {
      cleanup();
      if (previous) Object.defineProperty(window, "QwenPaw", previous);
      else Reflect.deleteProperty(window, "QwenPaw");
    }
  });

  it("keeps saved values on directory failures and retries malformed responses explicitly", async () => {
    const api = vi
      .fn()
      .mockRejectedValueOnce(new Error("连接已断开"))
      .mockResolvedValueOnce({ agents: null })
      .mockResolvedValueOnce(readyAgents);
    const props = base({
      api,
      node: node({ agent_id: "research", query: "保留任务" }),
    });
    render(<NodeInspector {...props} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "智能体加载失败：连接已断开",
    );
    expect(screen.getByRole("textbox", { name: "任务指令" })).toHaveValue(
      "保留任务",
    );
    fireEvent.click(screen.getByRole("button", { name: "重新加载智能体" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("智能体目录响应无效"),
    );
    fireEvent.click(screen.getByRole("button", { name: "重新加载智能体" }));
    expect(await screen.findByText("研究专家 · 已启用")).toBeVisible();
    expect(props.onUpdate).not.toHaveBeenCalled();
  });

  it("uses current edges as read-only input sources before serialization and preserves controls", async () => {
    const upstream = {
      id: "source",
      position: { x: 0, y: 0 },
      data: {
        label: "资料提取",
        outputs_schema: [{ name: "text", type: "string" }],
      },
    };
    const props = base({
      node: node({ query: "原固定值", context: { count: 0 } }),
      availableNodes: [upstream],
      edges: [
        {
          source: "source",
          target: "expert",
          sourceHandle: "text",
          targetHandle: "query",
          data: { kind: "data" },
        },
      ],
    });
    render(<NodeInspector {...props} />);
    await screen.findByText(/使用宿主中已配置/);
    const query = screen.getByRole("textbox", { name: "任务指令" });
    expect(query).toBeDisabled();
    expect(query).toHaveValue("资料提取 → 文本");
    const context = screen.getByRole("textbox", { name: "上游上下文" });
    expect(context.tagName).toBe("TEXTAREA");
    expect(JSON.parse((context as HTMLTextAreaElement).value)).toEqual({
      count: 0,
    });
    fireEvent.change(query, { target: { value: "不能覆盖" } });
    expect(props.onUpdate).not.toHaveBeenCalled();
    fireEvent.change(screen.getByPlaceholderText("节点显示名称"), {
      target: { value: "专家汇总" },
    });
    expect(props.onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inputs: { query: "原固定值", context: { count: 0 } },
          control: { max_retries: 0, retry_delay_sec: 0 },
        }),
      }),
    );
    for (const label of [
      "重试次数",
      "重试延迟（秒）",
      "输出变量名",
      "执行模式",
      "节点超时（秒）",
      "完成后继续",
      "失败处理节点",
    ])
      expect(screen.getByText(label)).toBeVisible();
  });

  it("localizes schema fields and focuses validation without offering an unsupported model override", async () => {
    const spec = {
      ...agentSpec,
      class_type: "LLMNode",
      inputs_schema: [
        { name: "prompt", type: "string", required: true },
        { name: "temperature", type: "number", min: 0, max: 2 },
        { name: "enabled", type: "boolean", display_name: "启用生成" },
        {
          name: "mode",
          type: "enum",
          options: ["fast", "careful"],
          display_name: "生成模式",
        },
        { name: "data", type: "object" },
        { name: "path", type: "file" },
      ].map((field) => ({ options: [], ...field })),
    };
    const current = {
      ...node(),
      data: {
        class_type: "LLMNode",
        inputs: {
          prompt: "",
          temperature: 0,
          enabled: false,
          data: { n: 0 },
          path: "input.csv",
        },
        control: {},
      },
    };
    const props = base({
      node: current,
      nodeTypes: [spec],
      focusedField: "inputs.prompt",
      diagnostics: [
        { field: "inputs.prompt", severity: "error", message: "请填写提示词" },
      ],
    });
    render(<NodeInspector {...props} />);
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "提示词" })).toHaveFocus(),
    );
    expect(screen.getByText("模型由宿主提供")).toBeVisible();
    expect(
      screen.queryByRole("combobox", { name: /模型/ }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("请填写提示词")).toBeVisible());
    expect(screen.getByRole("spinbutton", { name: "生成温度" })).toHaveValue(
      "0",
    );
    expect(screen.getByRole("switch", { name: "启用生成" })).not.toBeChecked();
    fireEvent.change(screen.getByRole("textbox", { name: "数据" }), {
      target: { value: '{"n":1}' },
    });
    expect(props.onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inputs: expect.objectContaining({ data: { n: 1 } }),
        }),
      }),
    );
    expect(screen.getByRole("textbox", { name: "文件路径" })).toHaveValue(
      "input.csv",
    );
    expect(props.api).not.toHaveBeenCalled();
  });
});

it("renders named typed ports and keeps configuration diagnostics separate from actual run status", () => {
  const data = {
    class_type: "AgentNode",
    _displayLabel: "智能体",
    inputs_schema: agentSpec.inputs_schema,
    outputs_schema: agentSpec.outputs_schema,
    _diagnostics: [
      {
        severity: "error",
        field: "inputs.agent_id",
        message: "请选择执行智能体",
      },
    ],
  };
  const props = { id: "expert", data, selected: false } as React.ComponentProps<
    typeof NodeCard
  >;
  const view = render(
    <ReactFlowProvider>
      <NodeCard {...props} />
    </ReactFlowProvider>,
  );
  expect(screen.getByText("未执行")).toBeVisible();
  expect(screen.getByText(/待配置 1 项/)).toHaveTextContent("请选择执行智能体");
  expect(screen.getByText("执行智能体")).toBeVisible();
  expect(screen.getByText("智能体回复")).toBeVisible();
  expect(screen.getAllByText("文本").length).toBeGreaterThan(1);
  expect(
    view.container.querySelector(
      '[data-handleid="agent_id"][data-handlepos="left"]',
    ),
  ).toBeInTheDocument();
  view.rerender(
    <ReactFlowProvider>
      <NodeCard {...props} data={{ ...data, _status: "running" }} />
    </ReactFlowProvider>,
  );
  expect(screen.getByText("执行中")).toBeVisible();
  expect(screen.getByText(/待配置 1 项/)).toBeVisible();
});
