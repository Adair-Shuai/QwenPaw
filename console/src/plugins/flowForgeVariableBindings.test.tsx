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
    `import {buildSync} from "esbuild";process.stdout.write(buildSync(${JSON.stringify(
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
const { WorkflowEditor, NodeInspector, NodeCard } = compiled.exports;
const specs: NodeTypeSpec[] = [
  {
    class_type: "VariableSource",
    display_name: "数据源",
    description: "",
    icon: "",
    category: "",
    control_schema: [],
    inputs_schema: [],
    outputs_schema: [
      { name: "payload", type: "object" },
      { name: "count", type: "int" },
    ],
  },
  {
    class_type: "VariableTarget",
    display_name: "目标",
    description: "",
    icon: "",
    category: "",
    control_schema: [],
    inputs_schema: [
      { name: "query", type: "string", required: true },
      { name: "threshold", type: "int" },
      { name: "enabled", type: "boolean" },
    ],
    outputs_schema: [{ name: "result", type: "any" }],
  },
  {
    class_type: "LLMCallNode",
    display_name: "模型调用",
    description: "",
    icon: "",
    category: "",
    control_schema: [],
    inputs_schema: [
      { name: "prompt", type: "string" },
      {
        name: "response_format",
        type: "enum",
        options: ["text", "json_schema"],
      },
      { name: "output_schema", type: "object" },
    ],
    outputs_schema: [
      { name: "content", type: "string" },
      { name: "parsed", type: "any" },
    ],
  },
];
const flow: FlowDocument = {
  id: "variable-ui",
  name: "变量 中文 English",
  description: "",
  version: "1",
  revision: 4,
  inputs: [],
  outputs: [],
  metadata: {},
  start_id: null,
  edges: [],
  nodes: {
    source: {
      class_type: "VariableSource",
      label: "原始数据 Source",
      inputs: { value: "配置假值不得展示" },
    },
    text: {
      class_type: "LLMCallNode",
      label: "文本模型 Text",
      inputs: { prompt: "配置中的提示词", response_format: "text" },
    },
    target: {
      class_type: "VariableTarget",
      label: "目标 Target",
      inputs: { query: "原有固定值", threshold: 0, enabled: false },
      control: { output: "target_alias" },
    },
  },
};
const payload = {
  "中文.field": [
    {
      'say"hi': "真实 English",
      zero: 0,
      enabled: false,
      empty: null,
      blank: "",
    },
  ],
};
const record: RunRecord = {
  run_id: "observed-run",
  flow_id: flow.id,
  agent_id: "expert-a",
  flow_revision: 4,
  status: "completed",
  started_at: 1,
  duration_ms: 3,
  node_statuses: { source: "success", text: "success" },
  outputs: { source: "顶层推测值不得展示" },
  errors: [],
  node_details: {
    source: { id: "source", outputs: [payload, 0] },
    text: { id: "text", outputs: ["真实文本 content"] },
  },
};
let language = "zh";
beforeEach(() => {
  localStorage.clear();
  language = "zh";
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
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "QwenPaw");
});
function apiFor(document = flow, catalog = specs) {
  return vi.fn(async (url: string, request?: RequestInit) => {
    if (url.includes("node-types")) return structuredClone(catalog);
    if (url.endsWith("/validate")) return { ok: true, errors: [] };
    if (request?.method === "PUT")
      return { ...JSON.parse(String(request.body)), revision: 5 };
    return structuredClone(document);
  }) as Api;
}
function editor(api: Api, props: Record<string, unknown> = {}) {
  return (
    <antd.ConfigProvider theme={{ token: { motion: false } }}>
      <WorkflowEditor
        flowId={flow.id}
        agentId="expert-a"
        userId="account:variables"
        api={api}
        antd={antd}
        nodeTypes={{ workflow: NodeCard }}
        edgeTypes={{}}
        Inspector={NodeInspector}
        IoConfig={() => null}
        onBack={vi.fn()}
        onRun={vi.fn()}
        onHistory={vi.fn()}
        runStatuses={{}}
        debugRecord={record}
        {...props}
      />
    </antd.ConfigProvider>
  );
}
async function openVariables(field = "query", english = false) {
  fireEvent.click(
    await screen.findByText("目标 Target", { selector: "strong" }),
  );
  const panel = within(
    screen.getByRole("complementary", {
      name: english ? "Node properties" : "节点属性",
    }),
  );
  const label = english
    ? `Variables and expression for ${field}`
    : `${field} 的变量与表达式`;
  fireEvent.click(panel.getByText(label, { selector: "button" }));
  return panel.getByRole("region", { name: label });
}
function expand(
  name: string,
  english = false,
  root: HTMLElement = document.body,
) {
  fireEvent.click(
    within(root).getByLabelText(
      english ? `Expand field ${name}` : `展开字段 ${name}`,
      { selector: "button" },
    ),
  );
}
const nestedExpression =
  '${output_slots["source"][0]["中文.field"][0]["say\\"hi"]}';

describe("FlowForge mounted visual variable binding", () => {
  it("binds observed nested bilingual object fields and locates their real source output", async () => {
    const api = apiFor();
    const view = render(editor(api));
    const region = await openVariables();
    expect(within(region).getByRole("status")).toHaveTextContent(
      "observed-run",
    );
    expect(within(region).getByRole("status")).toHaveTextContent("修订 4");
    expand("payload", false, region);
    expand("中文.field", false, region);
    expand("0", false, region);
    expect(within(region).getByText("真实 English")).toBeVisible();
    expect(within(region).getByText("null（空值）")).toBeVisible();
    expect(within(region).getByText("空字符串")).toBeVisible();
    fireEvent.click(
      within(region).getByLabelText(`使用变量 ${nestedExpression}`, {
        selector: "button",
      }),
    );
    expect(document.getElementById("ff-input-target-query")).toHaveValue(
      nestedExpression,
    );
    expect(within(region).getByText("真实 English")).toBeVisible();
    const toolbar = within(
      view.container.querySelector("header.ff-toolbar") as HTMLElement,
    );
    const saveButton = toolbar.getByLabelText("保存", { selector: "button" });
    fireEvent.click(saveButton);
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
        target: {
          inputs: { query: nestedExpression, threshold: 0, enabled: false },
        },
      },
      edges: [],
    });
    fireEvent.click(
      within(region).getAllByLabelText("定位来源 原始数据 Source 的 payload", {
        selector: "button",
      })[0],
    );
    await waitFor(() =>
      expect(
        document.getElementById("ff-output-source-payload"),
      ).toHaveAttribute("data-focused", "true"),
    );
    await waitFor(() =>
      expect(document.activeElement?.id).toBe("ff-output-source-payload"),
    );
    expect(
      view.container.querySelector(
        '[data-nodeid="source"][data-handleid="payload"]',
      ),
    ).toBeInTheDocument();
  });

  it("retains typed whole-output bindings and named canvas handles through the existing serializer", async () => {
    const api = apiFor();
    const view = render(editor(api));
    await screen.findByText(flow.name);
    fireEvent.click(screen.getByText("目标 Target", { selector: "strong" }));
    fireEvent.change(
      screen.getByRole("combobox", { name: "threshold 的数据来源" }),
      { target: { value: JSON.stringify(["source", "count"]) } },
    );
    expect(document.getElementById("ff-input-target-threshold")).toBeDisabled();
    expect(
      view.container.querySelector(
        '[data-nodeid="source"][data-handleid="count"]',
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() =>
      expect(
        vi
          .mocked(api)
          .mock.calls.some(([, request]) => request?.method === "PUT"),
      ).toBe(true),
    );
    const body = JSON.parse(
      String(
        vi
          .mocked(api)
          .mock.calls.find(([, request]) => request?.method === "PUT")![1]!
          .body,
      ),
    );
    expect(body.nodes.target.inputs.threshold).toEqual(["source", 1]);
    expect(body.nodes.target.inputs.enabled).toBe(false);
    expect(body.edges).toContainEqual(
      expect.objectContaining({
        source: "source",
        target: "target",
        source_handle: "count",
        target_handle: "threshold",
        source_slot: 1,
      }),
    );
  });

  it("withholds stale foreign unversioned and unrecorded values without reading configured or summary values", async () => {
    const api = apiFor();
    const view = render(
      editor(api, { debugRecord: { ...record, agent_id: "another-agent" } }),
    );
    let region = await openVariables();
    expect(within(region).getByRole("status")).toHaveTextContent(
      "其他工作流或专家",
    );
    expect(within(region).queryByText("真实 English")).toBeNull();
    expect(within(region).queryByText("配置假值不得展示")).toBeNull();
    view.rerender(
      editor(api, { debugRecord: { ...record, flow_revision: 3 } }),
    );
    expect(within(region).getByRole("status")).toHaveTextContent("修订不匹配");
    view.rerender(
      editor(api, { debugRecord: { ...record, flow_revision: undefined } }),
    );
    expect(within(region).getByRole("status")).toHaveTextContent(
      "缺少修订信息",
    );
    view.rerender(
      editor(api, { debugRecord: { ...record, node_details: {} } }),
    );
    expect(within(region).queryByText("顶层推测值不得展示")).toBeNull();
    expect(within(region).getAllByText("未记录实际值").length).toBeGreaterThan(
      0,
    );
    view.rerender(editor(api, { agentId: "expert-b", debugRecord: record }));
    await screen.findByText(flow.name);
    region = await openVariables();
    expect(within(region).getByRole("status")).toHaveTextContent(
      "其他工作流或专家",
    );
    expect(within(region).queryByText("真实 English")).toBeNull();
  });

  it("completes stable slot expressions and validates missing fields types cycles and incomplete paths immediately", async () => {
    const api = apiFor();
    const view = render(editor(api));
    const region = await openVariables("threshold");
    const input = within(region).getByRole("textbox", {
      name: "threshold 的表达式",
    });
    const expression = '${output_slots["source"][0]["中文.field"][0]["zero"]}';
    fireEvent.change(input, {
      target: { value: '${output_slots["source"][0]' },
    });
    const completions = within(region).getByRole("listbox", {
      name: "表达式补全",
    });
    fireEvent.click(within(completions).getByText(expression));
    expect(input).toHaveValue(expression);
    fireEvent.click(within(region).getByRole("button", { name: "应用表达式" }));
    expect(document.getElementById("ff-input-target-threshold")).toHaveValue(
      expression,
    );
    fireEvent.change(input, { target: { value: "${outputs.source" } });
    fireEvent.click(
      within(
        within(region).getByRole("listbox", { name: "表达式补全" }),
      ).getByText(expression),
    );
    expect(input).toHaveValue(expression);
    fireEvent.keyDown(input, { ctrlKey: true, code: "Space", key: " " });
    expect(
      within(region).getByRole("listbox", { name: "表达式补全" }),
    ).toBeVisible();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(
      within(region).queryByRole("listbox", { name: "表达式补全" }),
    ).toBeNull();
    for (const [value, message] of [
      ['${output_slots["source"][0]["absent"]}', "不存在此字段"],
      ['${output_slots["source"][0]}', "类型与输入类型不兼容"],
      ['${output_slots["target"][0]}', "形成循环"],
      ["${vars.target_alias}", "形成循环"],
      ['${output_slots["source"][}', "语法无效"],
      ['${output_slots["source"]', "不完整"],
    ]) {
      fireEvent.change(input, { target: { value } });
      expect(within(region).getByRole("alert")).toHaveTextContent(message);
      expect(
        within(region).getByRole("button", { name: "应用表达式" }),
      ).toBeDisabled();
      expect(input).toHaveValue(value);
    }
    expect(document.getElementById("ff-input-target-threshold")).toHaveValue(
      expression,
    );
    view.unmount();
    const bounded = {
      ...flow,
      nodes: {
        ...flow.nodes,
        target: {
          ...flow.nodes.target,
          class_type: "IterativeRefineNode",
          control: { retry_node: "source" },
        },
      },
      edges: [
        {
          source: "source",
          target: "target",
          kind: "control",
          source_handle: "next",
        },
        {
          source: "target",
          target: "source",
          kind: "control",
          source_handle: "retry_node",
        },
      ],
    };
    const boundedCatalog = [
      ...specs,
      { ...specs[1], class_type: "IterativeRefineNode" },
    ];
    render(editor(apiFor(bounded, boundedCatalog)));
    const boundedRegion = await openVariables("query");
    fireEvent.change(
      within(boundedRegion).getByRole("textbox", { name: "query 的表达式" }),
      { target: { value: nestedExpression } },
    );
    expect(within(boundedRegion).queryByRole("alert")).toBeNull();
    expect(
      within(boundedRegion).getByRole("button", { name: "应用表达式" }),
    ).toBeEnabled();
  }, 30_000);

  it("exposes text model content through slot zero while withholding the inactive parsed slot", async () => {
    const api = apiFor();
    render(editor(api));
    const region = await openVariables();
    const expression = '${output_slots["text"][0]}';
    expect(within(region).getByText("真实文本 content")).toBeVisible();
    expect(
      within(region).queryByRole("button", {
        name: '使用变量 ${output_slots["text"][1]}',
      }),
    ).toBeNull();
    expect(
      screen.getByRole("combobox", { name: "query 的数据来源" }),
    ).not.toHaveTextContent("parsed");
    const input = within(region).getByRole("textbox", {
      name: "query 的表达式",
    });
    fireEvent.change(input, { target: { value: expression } });
    fireEvent.click(within(region).getByRole("button", { name: "应用表达式" }));
    expect(document.getElementById("ff-input-target-query")).toHaveValue(
      expression,
    );
    fireEvent.change(input, {
      target: { value: '${output_slots["text"][1]}' },
    });
    expect(within(region).getByRole("alert")).toHaveTextContent(
      "输出槽位不存在",
    );
    expect(
      within(region).getByRole("button", { name: "应用表达式" }),
    ).toBeDisabled();
  });

  it("offers parsed fields only in structured mode and keeps array slot paths executable", async () => {
    const structuredFlow = {
      ...flow,
      nodes: {
        ...flow.nodes,
        text: {
          ...flow.nodes.text,
          inputs: { prompt: "JSON", response_format: "json_schema" },
        },
      },
    };
    const observed = {
      ...record,
      node_details: {
        ...record.node_details,
        text: {
          id: "text",
          outputs: [
            '{"items":[{"字段":"结构化 English"}]}',
            { items: [{ 字段: "结构化 English" }] },
          ],
        },
      },
    };
    const api = apiFor(structuredFlow);
    render(editor(api, { debugRecord: observed }));
    const region = await openVariables();
    expand("parsed");
    expand("items");
    expand("0");
    const expression = '${output_slots["text"][1]["items"][0]["字段"]}';
    fireEvent.click(
      within(region).getByRole("button", { name: `使用变量 ${expression}` }),
    );
    expect(document.getElementById("ff-input-target-query")).toHaveValue(
      expression,
    );
    expect(within(region).getByText("结构化 English")).toBeVisible();
  });

  it("hides values only for changed source configurations while preserving unaffected upstream observations", async () => {
    const api = apiFor();
    render(editor(api));
    let region = await openVariables();
    expand("payload");
    expand("中文.field");
    expand("0");
    fireEvent.click(
      within(region).getByRole("button", {
        name: `使用变量 ${nestedExpression}`,
      }),
    );
    expect(within(region).getByText("真实 English")).toBeVisible();
    fireEvent.click(
      screen.getByText("原始数据 Source", { selector: "strong" }),
    );
    const typeLabel = screen.getByText("节点类型");
    const typeField = typeLabel.closest(".ant-form-item") as HTMLElement;
    fireEvent.mouseDown(within(typeField).getByRole("combobox"));
    const choices = await screen.findAllByText("模型调用 / JSON");
    fireEvent.click(choices[choices.length - 1]);
    region = await openVariables();
    expect(within(region).queryByText("真实 English")).toBeNull();
    expect(within(region).getByText("真实文本 content")).toBeVisible();
    expect(
      within(region).getByText("来源配置已修改，实际值不可用"),
    ).toBeVisible();
  });

  it("localizes the actual variable inspector and completion while keeping authored Unicode keys intact", async () => {
    language = "en";
    const api = apiFor();
    const view = render(editor(api));
    const region = await openVariables("query", true);
    expect(within(region).getByRole("status")).toHaveTextContent(
      "Observed run observed-run",
    );
    expand("payload", true);
    expand("中文.field", true);
    expand("0", true);
    fireEvent.click(
      within(region).getByRole("button", {
        name: `Use variable ${nestedExpression}`,
      }),
    );
    expect(document.getElementById("ff-input-target-query")).toHaveValue(
      nestedExpression,
    );
    expect(within(region).getByText("Expression checks passed")).toBeVisible();
    language = "zh";
    view.rerender(editor(api));
    expect(screen.getByRole("button", { name: "应用表达式" })).toBeVisible();
    await waitFor(() =>
      expect(document.getElementById("ff-input-target-query")).toHaveValue(
        nestedExpression,
      ),
    );
  });
});
