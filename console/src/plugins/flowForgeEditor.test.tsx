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
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  Api,
  FlowDocument,
  NodeTypeSpec,
} from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/model";

// Match production's host React boundary, including the real ReactFlow.
const buildOptions = {
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
    `import {buildSync} from "esbuild"; process.stdout.write(buildSync(${JSON.stringify(
      buildOptions,
    )}).outputFiles[0].text);`,
  ],
  { cwd: process.cwd(), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
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

afterEach(cleanup);
const specs: NodeTypeSpec[] = [
  {
    class_type: "LLMNode",
    display_name: "模型调用",
    description: "生成",
    category: "workflow/action",
    icon: "",
    control_schema: [],
    inputs_schema: [
      { name: "prompt", type: "string", required: true, multiline: true },
    ],
    outputs_schema: [{ name: "text", type: "string" }],
  },
];
const flow: FlowDocument = {
  id: "editor",
  name: "真实编辑器验收",
  description: "",
  version: "1",
  revision: 1,
  inputs: [],
  outputs: [],
  start_id: null,
  metadata: {},
  nodes: { model: { class_type: "LLMNode", label: "目标任务", inputs: {} } },
  edges: [],
};
const nodeTypes = { workflow: NodeCard },
  edgeTypes = {};
function editor(api: Api, onRun = vi.fn(), flowId = "editor") {
  return (
    <WorkflowEditor
      flowId={flowId}
      agentId="expert-a"
      api={api}
      antd={antd}
      onBack={vi.fn()}
      onRun={onRun}
      onHistory={vi.fn()}
      runStatuses={{}}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      Inspector={NodeInspector}
      IoConfig={() => null}
    />
  );
}
function mount(api: Api, onRun = vi.fn()) {
  return render(editor(api, onRun));
}
describe("FlowForge mounted editor architecture", () => {
  it.each(["zh", "en"])(
    "groups infrequent actions without losing version input configuration or layout in %s",
    async (language) => {
      const previousLanguage = localStorage.getItem("language");
      localStorage.setItem("language", language);
      const api = vi.fn(async (url: string) => {
        if (url === "/flowforge/node-types") return specs;
        if (url.endsWith("/versions")) return [];
        return structuredClone(flow);
      }) as Api;
      const inputsOpen = vi.fn();
      const element = editor(api);
      const view = render(
        React.cloneElement(element, {
          IoConfig: ({ open }: { open: boolean }) => {
            if (open) inputsOpen();
            return open ? <div role="dialog">IO configuration</div> : null;
          },
        }),
      );
      try {
        await screen.findByText(flow.name);
        const english = language === "en";
        expect(
          screen.queryByRole("button", { name: english ? "Versions" : "版本" }),
        ).toBeNull();
        const more = screen.getByRole("button", {
          name: english ? "More actions" : "更多操作",
        });
        fireEvent.click(
          screen.getByRole("button", { name: english ? "Arrange" : "排列" }),
        );
        fireEvent.click(
          await screen.findByRole("menuitem", {
            name: english ? "Auto layout" : "自动布局",
          }),
        );
        fireEvent.click(more);
        fireEvent.click(
          await screen.findByRole("menuitem", {
            name: english ? "Inputs / outputs" : "输入 / 输出",
          }),
        );
        await waitFor(() => expect(inputsOpen).toHaveBeenCalled());
        fireEvent.click(more);
        fireEvent.click(
          await screen.findByRole("menuitem", {
            name: english ? "Versions" : "版本",
          }),
        );
        await screen.findByText(english ? "Workflow revisions" : "工作流版本");
        expect(api).toHaveBeenCalledWith("/flowforge/flows/editor/versions");
        expect(
          screen.getByRole("button", { name: english ? "Save" : "保存" }),
        ).toBeEnabled();
        expect(view.container.querySelector(".react-flow")).toBeInTheDocument();
      } finally {
        view.unmount();
        if (previousLanguage === null) localStorage.removeItem("language");
        else localStorage.setItem("language", previousLanguage);
      }
    },
  );

  it("locates a required field in the real inspector and saves its corrected value", async () => {
    const saved: FlowDocument[] = [];
    const api = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === "/flowforge/node-types") return specs;
      if (options?.method === "PUT") {
        const value = JSON.parse(String(options.body));
        saved.push(value);
        return { ...value, revision: 2 };
      }
      return structuredClone(flow);
    }) as Api;
    const view = mount(api);
    fireEvent.click(
      await screen.findByRole("button", { name: "目标任务：请填写 提示词" }),
    );
    const prompt = await screen.findByRole("textbox", { name: "提示词" });
    fireEvent.change(prompt, { target: { value: "请整理输入数据" } });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "目标任务：请填写 提示词" }),
      ).not.toBeInTheDocument(),
    );
    expect(view.container.querySelector(".react-flow")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0].nodes.model.inputs.prompt).toBe("请整理输入数据");
    expect(saved[0].revision).toBe(1);
    expect(saved[0].nodes.model._diagnostics).toBeUndefined();
  });

  it("rejects an obsolete successful validation when the draft changes before trial execution", async () => {
    let finish!: (value: unknown) => void;
    const response = new Promise((resolve) => {
      finish = resolve;
    });
    const onRun = vi.fn(),
      writes = vi.fn();
    const api = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === "/flowforge/node-types") return specs;
      if (url === "/flowforge/flows/validate") return response;
      if (options?.method === "PUT") writes();
      return {
        ...structuredClone(flow),
        nodes: {
          model: {
            class_type: "LLMNode",
            label: "目标任务",
            inputs: { prompt: "已配置" },
          },
        },
      };
    }) as Api;
    mount(api, onRun);
    fireEvent.click(await screen.findByRole("button", { name: "试运行" }));
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith(
        "/flowforge/flows/validate",
        expect.objectContaining({ headers: { "X-Agent-Id": "expert-a" } }),
      ),
    );
    fireEvent.click(screen.getByTitle("根据提示词生成内容"));
    await act(async () => {
      finish({ ok: true, errors: [] });
      await response;
    });
    expect(onRun).not.toHaveBeenCalled();
    expect(writes).not.toHaveBeenCalled();
    expect(screen.queryByText("工作流结构验证通过")).not.toBeInTheDocument();
    expect(screen.getAllByRole("textbox", { name: "提示词" })).toHaveLength(1);
  });

  it("does not open a run after leaving the editor while validation is pending", async () => {
    let finish!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      finish = resolve;
    });
    const onRun = vi.fn();
    const api = vi.fn(async (url: string) => {
      if (url === "/flowforge/node-types") return specs;
      if (url.endsWith("/validate")) return pending;
      return {
        ...flow,
        nodes: {
          model: { class_type: "LLMNode", inputs: { prompt: "完整配置" } },
        },
      };
    }) as Api;
    const view = mount(api, onRun);
    fireEvent.click(await screen.findByRole("button", { name: "试运行" }));
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith(
        "/flowforge/flows/validate",
        expect.anything(),
      ),
    );
    view.unmount();
    await act(async () => {
      finish({ ok: true, errors: [] });
      await pending;
    });
    expect(onRun).not.toHaveBeenCalled();
  });

  it("isolates a late save across flow visits including returning to the original flow", async () => {
    let finish!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      finish = resolve;
    });
    const onRun = vi.fn(),
      writes: Array<FlowDocument & { expected_revision: number }> = [];
    const api = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === "/flowforge/node-types") return specs;
      if (options?.method === "PUT") {
        writes.push(JSON.parse(String(options.body)));
        if (writes.length === 1) return pending;
        return { ...writes[writes.length - 1], revision: 8 };
      }
      const id = url.split("/").pop();
      return {
        ...flow,
        id,
        revision: id === "other" ? 5 : 7,
        name: `访问 ${id}`,
      };
    }) as Api;
    const view = mount(api, onRun);
    fireEvent.click(await screen.findByRole("button", { name: "保存" }));
    await waitFor(() => expect(writes).toHaveLength(1));
    view.rerender(editor(api, onRun, "other"));
    await screen.findByText("访问 other");
    view.rerender(editor(api, onRun));
    await screen.findByText("访问 editor");
    await act(async () => {
      finish({ ...flow, revision: 99 });
      await pending;
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() => expect(writes).toHaveLength(2));
    expect(writes[1].expected_revision).toBe(7);
    expect(writes[1].id).toBe("editor");
  });

  it("resolves existing input bindings after the node catalogue arrives later than the flow", async () => {
    let finishCatalogue!: (value: NodeTypeSpec[]) => void;
    const catalogue = new Promise<NodeTypeSpec[]>((resolve) => {
      finishCatalogue = resolve;
    });
    const boundFlow = {
      ...structuredClone(flow),
      nodes: {
        source: {
          class_type: "LLMNode",
          label: "上游模型",
          inputs: { prompt: "准备资料" },
        },
        target: {
          class_type: "LLMNode",
          label: "下游模型",
          inputs: { prompt: ["source", 0] },
        },
      },
      edges: [
        {
          id: "bound-edge",
          source: "source",
          target: "target",
          source_handle: "text",
          target_handle: "prompt",
          source_slot: 0,
          kind: "data",
        },
      ],
    };
    const api = vi.fn(async (url: string) =>
      url === "/flowforge/node-types" ? catalogue : boundFlow,
    ) as Api;
    mount(api);
    // Opening the already loaded canvas before resolving the catalogue makes
    // the original nodes retain their empty schema, as a real slow API does.
    fireEvent.click(await screen.findByText("下游模型"));
    await act(async () => {
      finishCatalogue(specs);
      await catalogue;
    });
    const input = await screen.findByRole("textbox", { name: "提示词" });
    expect(input).toBeDisabled();
    expect(input).toHaveValue("上游模型 → 文本");
    expect(input).not.toHaveValue(expect.stringContaining("来源已失效"));
    fireEvent.click(screen.getByRole("tab", { name: "数据" }));
    expect(
      screen.getByRole("combobox", { name: "prompt 的数据来源" }),
    ).toHaveValue(JSON.stringify(["source", "text"]));
  });

  it.each(["source", "missing-source"])(
    "identifies and selects an edge-only diagnostic from %s so the actual editor can remove that connection",
    async (edgeSource) => {
      const writes: FlowDocument[] = [];
      const badFlow = {
        ...structuredClone(flow),
        nodes: {
          source: {
            class_type: "LLMNode",
            label: "来源模型",
            inputs: { prompt: "上游" },
          },
          target: {
            class_type: "LLMNode",
            label: "处理模型",
            inputs: { prompt: ["source", -1] },
          },
        },
        edges: [
          {
            id: "broken-edge",
            source: edgeSource,
            target: "target",
            target_handle: "prompt",
            source_slot: -1,
            kind: "data",
          },
        ],
      };
      const api = vi.fn(async (url: string, options?: RequestInit) => {
        if (url === "/flowforge/node-types") return specs;
        if (url.endsWith("/validate"))
          return {
            ok: false,
            errors: [
              "edge 'broken-edge' source_slot must be a non-negative integer",
            ],
            diagnostics: [
              {
                code: "EDGE_SLOT_INVALID",
                severity: "error",
                message: "输出槽位必须是非负整数。",
                edge_id: "broken-edge",
                field: "source_slot",
              },
            ],
          };
        if (options?.method === "PUT") {
          const value = JSON.parse(String(options.body));
          writes.push(value);
          return { ...value, revision: 2 };
        }
        return badFlow;
      }) as Api;
      const view = mount(api);
      fireEvent.click(await screen.findByText("来源模型"));
      await waitFor(() =>
        expect(
          view.container.querySelector('.react-flow__node[data-id="source"]'),
        ).toHaveClass("selected"),
      );
      fireEvent.click(await screen.findByRole("button", { name: "验证" }));
      const issue = await screen.findByRole("button", {
        name: "连线 broken-edge：输出槽位必须是非负整数。",
      });
      expect(issue).toBeEnabled();
      fireEvent.click(issue);
      expect(
        view.container.querySelector('.react-flow__node[data-id="source"]'),
      ).not.toHaveClass("selected");
      // Delete uses the actual editor's ReactFlow edge selection, so this fails
      // if locating a diagnostic only changes a label or opens a node drawer.
      fireEvent.keyDown(window, { key: "Delete" });
      fireEvent.click(screen.getByRole("button", { name: "保存" }));
      await waitFor(() => expect(writes).toHaveLength(1));
      expect(writes[0].edges).toEqual([]);
      expect(Object.keys(writes[0].nodes)).toEqual(["source", "target"]);
    },
  );
});
