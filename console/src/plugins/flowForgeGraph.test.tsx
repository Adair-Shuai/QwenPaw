// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  connectionIssue,
  compatibleTypes,
  configurationDiagnostics,
  validationDiagnostics,
} from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/graphContracts";
import { InputBindings } from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/InputBindings";
import { duplicateSubgraph } from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/editorTools";
import {
  canvasFromDocument,
  documentFromCanvas,
  type FlowDocument,
  type NodeTypeSpec,
} from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/model";

afterEach(cleanup);
const specs: NodeTypeSpec[] = [
  {
    class_type: "Source",
    display_name: "输入",
    description: "",
    icon: "",
    category: "",
    control_schema: [],
    inputs_schema: [],
    outputs_schema: [
      { name: "value", type: "string" },
      { name: "score", type: "float" },
    ],
  },
  {
    class_type: "Target",
    display_name: "处理",
    description: "",
    icon: "",
    category: "",
    control_schema: [],
    outputs_schema: [{ name: "value", type: "string" }],
    inputs_schema: [
      { name: "query", type: "string", required: true },
      { name: "threshold", type: "float", required: true, default: 0 },
    ],
  },
];
const doc: FlowDocument = {
  id: "graph",
  name: "图",
  description: "",
  inputs: [],
  outputs: [],
  start_id: null,
  metadata: {},
  version: "1.0",
  nodes: {
    a: { class_type: "Source", label: "原始数据", inputs: {} },
    b: { class_type: "Target", inputs: { query: "固定任务" } },
    c: { class_type: "Target", inputs: { query: "其他任务" } },
  },
  edges: [],
};

describe("FlowForge authoring contracts", () => {
  it("copies subgraphs without stealing control routes or changing literal schema values and rewrites output aliases", () => {
    const document = structuredClone(doc);
    document.nodes.a.control = { output: "summary", next: "b" };
    document.nodes.b = {
      class_type: "LLMCallNode",
      inputs: {
        query: ["a", 0],
        prompt: "内容 ${vars.summary}",
        literal: "summary",
        output_schema: { enum: ["a", 0] },
      },
    };
    document.edges = [
      {
        id: "incoming-control",
        source: "c",
        target: "a",
        kind: "control",
        source_handle: "next",
      },
      {
        id: "incoming-data",
        source: "c",
        target: "a",
        kind: "data",
        target_handle: "value",
      },
      {
        id: "internal-control",
        source: "a",
        target: "b",
        kind: "control",
        source_handle: "next",
      },
      {
        id: "internal-data",
        source: "a",
        target: "b",
        kind: "data",
        target_handle: "query",
        source_slot: 0,
      },
    ];
    const original = structuredClone(document);
    const copied = duplicateSubgraph(document, ["a", "b"]);
    const [source, target] = copied.ids;
    expect(copied.nodes[source].control.next).toBe(target);
    const alias = copied.nodes[source].control.output;
    expect(alias).not.toBe("summary");
    expect(copied.nodes[target].inputs.prompt).toBe(
      `内容 \${vars[${JSON.stringify(alias)}]}`,
    );
    expect(copied.nodes[target].inputs.query).toEqual([source, 0]);
    expect(copied.nodes[target].inputs.literal).toBe("summary");
    expect(copied.nodes[target].inputs.output_schema).toEqual({
      enum: ["a", 0],
    });
    expect(
      copied.edges.some(
        (edge) => edge.source === "c" && edge.kind === "control",
      ),
    ).toBe(false);
    expect(copied.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "c", target: source, kind: "data" }),
      ]),
    );
    expect(document).toEqual(original);
  });
  it("rejects incompatible occupied and cyclic data bindings without coercing runtime types", () => {
    const { nodes } = canvasFromDocument(doc, specs);
    const wire = {
      source: "a",
      target: "b",
      sourceHandle: "value",
      targetHandle: "query",
    };
    expect(connectionIssue(wire, nodes, [])).toBeNull();
    expect(
      connectionIssue({ ...wire, sourceHandle: "score" }, nodes, []),
    ).toMatch(/类型不兼容/);
    expect(connectionIssue(wire, nodes, [wire])).toMatch(/已存在/);
    expect(connectionIssue({ ...wire, source: "c" }, nodes, [wire])).toMatch(
      /已有数据来源/,
    );
    expect(
      connectionIssue(
        {
          source: "c",
          target: "b",
          sourceHandle: "value",
          targetHandle: "query",
        },
        nodes,
        [
          {
            source: "b",
            target: "c",
            sourceHandle: "value",
            targetHandle: "query",
          },
        ],
      ),
    ).toMatch(/循环/);
    expect(compatibleTypes("int", "float")).toBe(false);
    expect(compatibleTypes("string,image", "image")).toBe(true);
    expect(compatibleTypes("*", "image")).toBe(true);
  });

  it("preserves bounded refinement routes while rejecting duplicate control destinations", () => {
    const { nodes } = canvasFromDocument(doc, specs);
    nodes[2].data.class_type = "IterativeRefineNode";
    const forward = {
      source: "b",
      target: "c",
      sourceHandle: "next",
      data: { kind: "control" },
    };
    const retry = { source: "c", target: "b", sourceHandle: "retry_node" };
    expect(connectionIssue(retry, nodes, [forward])).toBeNull();
    expect(
      connectionIssue({ ...retry, target: "a" }, nodes, [forward, retry]),
    ).toMatch(/已有目标/);
    expect(
      connectionIssue({ ...retry, sourceHandle: "next" }, nodes, [forward]),
    ).toMatch(/循环/);
  });

  it("binds the selected typed output through the real canvas serializer and keeps other inputs", () => {
    const graph = canvasFromDocument(doc, specs),
      bind = vi.fn(),
      disconnect = vi.fn();
    const view = render(
      <InputBindings
        node={graph.nodes[1]}
        nodes={graph.nodes}
        edges={[]}
        onBind={bind}
        onDisconnect={disconnect}
      />,
    );
    const selector = screen.getByRole("combobox", { name: "query 的数据来源" });
    expect(selector).not.toHaveTextContent("score");
    fireEvent.change(selector, {
      target: { value: JSON.stringify(["a", "value"]) },
    });
    expect(bind).toHaveBeenCalledWith("query", "a", "value");
    const edge = {
      id: "data",
      source: "a",
      target: "b",
      sourceHandle: "value",
      targetHandle: "query",
      data: { kind: "data" },
    };
    const serialized = documentFromCanvas(doc, graph.nodes, [edge]);
    expect(serialized.nodes.b.inputs.query).toEqual(["a", 0]);
    expect(serialized.nodes.c.inputs.query).toBe("其他任务");
    view.rerender(
      <InputBindings
        node={graph.nodes[1]}
        nodes={graph.nodes}
        edges={[edge]}
        onBind={bind}
        onDisconnect={disconnect}
      />,
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: "query 的数据来源" }),
      { target: { value: "" } },
    );
    expect(disconnect).toHaveBeenCalledWith("query");
    const bound = canvasFromDocument(serialized, specs);
    expect(
      documentFromCanvas(serialized, bound.nodes, []).nodes.b.inputs.query,
    ).toBeUndefined();
  });

  it("keeps explicit zero defaults and exposes node-addressable errors from old and new servers", () => {
    expect(configurationDiagnostics(doc, specs)).toEqual([]);
    const missing = {
      ...doc,
      nodes: { ...doc.nodes, b: { class_type: "Target", inputs: {} } },
    };
    expect(configurationDiagnostics(missing, specs)).toMatchObject([
      { node_id: "b", field: "inputs.query", severity: "error" },
    ]);
    const result = validationDiagnostics({
      ok: false,
      errors: ["node 'b' required input 'query' is missing"],
    });
    expect(result).toMatchObject([{ node_id: "b", field: "inputs.query" }]);
    expect(
      validationDiagnostics({
        ok: true,
        errors: [],
        diagnostics: [
          {
            code: "isolated_node",
            severity: "warning",
            node_id: "a",
            message: "独立节点",
          },
        ],
      }),
    ).toMatchObject([{ code: "isolated_node", severity: "warning" }]);
  });
});
