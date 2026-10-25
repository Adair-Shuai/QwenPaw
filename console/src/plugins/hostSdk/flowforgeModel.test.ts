import { describe, expect, it } from "vitest";
import {
  canvasFromDocument,
  controlEdges,
  documentFromCanvas,
  fingerprint,
  isControlHandle,
  isTypingTarget,
  localizedSpec,
  parseRuntimeInputs,
  type FlowDocument,
  type NodeTypeSpec,
} from "../../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/model";

const document = (overrides: Partial<FlowDocument> = {}): FlowDocument => ({
  id: "inventory",
  name: "库存复核",
  description: "",
  nodes: {},
  edges: [],
  inputs: [],
  outputs: [],
  start_id: null,
  metadata: { selected_agent_id: "expert-a", owner: "ugsci" },
  version: "1.0",
  revision: 7,
  ...overrides,
});
const types: NodeTypeSpec[] = [
  {
    class_type: "Source",
    display_name: "数据来源",
    description: "",
    category: "data",
    icon: "",
    inputs_schema: [],
    outputs_schema: [{ name: "value" }, { name: "confidence" }],
    control_schema: [],
  },
  {
    class_type: "Sink",
    display_name: "结果",
    description: "",
    category: "data",
    icon: "",
    inputs_schema: [{ name: "value", type: "number" }],
    outputs_schema: [],
    control_schema: [],
  },
];

describe("FlowForge durable editor contract", () => {
  it("preserves labels metadata and control edge semantics through a canvas round trip", () => {
    const flow = document({
      nodes: {
        a: {
          class_type: "Source",
          label: "库存偏差",
          inputs: {},
          control: {
            conditions: [
              {
                if: { left: "deviation", operator: "gt", right: 0.03 },
                then_node: "b",
              },
            ],
          },
        },
        b: { class_type: "Sink", inputs: {} },
      },
      edges: [
        {
          id: "branch",
          kind: "control",
          source: "a",
          source_handle: "condition:0",
          target: "b",
          label: "偏差超过阈值",
          business_annotation: "keep",
        },
      ],
    });
    const canvas = canvasFromDocument(flow, types),
      result = documentFromCanvas(flow, canvas.nodes, canvas.edges);
    expect(result.nodes.a.label).toBe("库存偏差");
    expect(result.nodes.a.control.conditions[0]).toEqual(
      flow.nodes.a.control.conditions[0],
    );
    expect(result.edges[0]).toMatchObject({
      kind: "control",
      source_handle: "condition:0",
      label: "偏差超过阈值",
      business_annotation: "keep",
    });
    expect(result.metadata).toMatchObject(flow.metadata);
    expect(result.revision).toBe(7);
  });
  it("maps named output handles to the correct runtime output slot", () => {
    const flow = document({
      nodes: {
        a: { class_type: "Source", inputs: {} },
        b: { class_type: "Sink", inputs: {} },
      },
    });
    const graph = canvasFromDocument(flow, types);
    const result = documentFromCanvas(flow, graph.nodes, [
      {
        id: "wire",
        source: "a",
        target: "b",
        sourceHandle: "confidence",
        targetHandle: "value",
        data: { kind: "data" },
      },
    ]);
    expect(result.edges[0].source_slot).toBe(1);
    expect(result.nodes.b.inputs.value).toEqual(["a", 1]);
  });
  it("deleting the last data edge releases the previously connected input", () => {
    const flow = document({
      nodes: {
        a: { class_type: "Source", inputs: {} },
        b: {
          class_type: "Sink",
          inputs: {
            value: ["a", 0],
            __flow_dependencies: [["a", 0]],
            note: "retain",
          },
        },
      },
      edges: [{ source: "a", target: "b", target_handle: "value" }],
    });
    const graph = canvasFromDocument(flow, types),
      result = documentFromCanvas(flow, graph.nodes, []);
    expect(result.nodes.b.inputs).toEqual({ note: "retain" });
    expect(result.edges).toEqual([]);
  });
  it("preserves data sockets behind a legacy ordering-only edge", () => {
    const flow = document({
      nodes: {
        a: { class_type: "Source" },
        b: { class_type: "Sink", inputs: { value: ["a", 1] } },
      },
      edges: [{ source: "a", target: "b", source_slot: 1 }],
    });
    const graph = canvasFromDocument(flow, types);
    expect(
      documentFromCanvas(flow, graph.nodes, graph.edges).nodes.b.inputs.value,
    ).toEqual(["a", 1]);
  });
  it("shows legacy DSL data and control references when edges were omitted", () => {
    const flow = document({
      nodes: {
        a: { class_type: "Source", control: { next: "b" } },
        b: { class_type: "Sink", inputs: { value: ["a", 0] } },
      },
      edges: undefined as unknown as any[],
    });
    const graph = canvasFromDocument(flow, types);
    expect(graph.edges).toHaveLength(2);
    expect(graph.edges.map((edge) => edge.data?.kind).sort()).toEqual([
      "control",
      "data",
    ]);
  });
  it("does not resurrect intentionally deleted edges from legacy input references", () => {
    const graph = canvasFromDocument(
      document({
        nodes: {
          a: { class_type: "Source", control: { next: "b" } },
          b: { class_type: "Sink", inputs: { value: ["a", 0] } },
        },
        edges: [],
      }),
      types,
    );
    expect(graph.edges).toEqual([]);
  });
  it("upgrades legacy multiple ordering dependencies to visible canvas edges", () => {
    const flow = document({
      nodes: {
        a: { class_type: "Source" },
        b: { class_type: "Source" },
        join: {
          class_type: "Sink",
          inputs: {
            __flow_dependencies: [
              ["a", 0],
              ["b", 1],
            ],
          },
        },
      },
      edges: undefined as unknown as any[],
    });
    const graph = canvasFromDocument(flow, types);
    expect(graph.edges.map((edge) => [edge.source, edge.target])).toEqual([
      ["a", "join"],
      ["b", "join"],
    ]);
    expect(graph.edges.every((edge) => edge.targetHandle === undefined)).toBe(
      true,
    );
    expect(
      documentFromCanvas(flow, graph.nodes, graph.edges).edges,
    ).toHaveLength(2);
  });
  it("removes a deleted branch target but retains its predicate for repair", () => {
    const flow = document({
      nodes: {
        a: {
          class_type: "ConditionNode",
          control: {
            conditions: [
              { if: { left: "x", operator: "gt", right: 5 }, then_node: "b" },
            ],
            else_node: "b",
          },
        },
        b: { class_type: "Sink" },
      },
      edges: [],
    });
    const graph = canvasFromDocument(flow, types),
      result = documentFromCanvas(flow, graph.nodes, []);
    expect(result.nodes.a.control.conditions[0]).toEqual({
      if: { left: "x", operator: "gt", right: 5 },
    });
    expect(result.nodes.a.control).not.toHaveProperty("else_node");
  });
  it("projects quality-gate and bounded-iteration control ports", () => {
    const edges = controlEdges({
      id: "gate",
      data: {
        control: {
          pass_node: "ok",
          fail_node: "refine",
          retry_node: "generate",
          exhausted_node: "manual",
        },
      },
    });
    expect(edges.map((edge) => edge.sourceHandle)).toEqual([
      "pass_node",
      "fail_node",
      "retry_node",
      "exhausted_node",
    ]);
    for (const edge of edges)
      expect(isControlHandle(edge.sourceHandle)).toBe(true);
    expect(isControlHandle("condition:4")).toBe(true);
    expect(isControlHandle("confidence")).toBe(false);
  });
  it("never saves runtime badges or catalogue schemas into workflow node definitions", () => {
    const flow = document({
        nodes: { a: { class_type: "Source", label: "keep" } },
      }),
      graph = canvasFromDocument(flow, types);
    graph.nodes[0].data._status = "running";
    graph.nodes[0].data._unavailableReason = "missing";
    const result = documentFromCanvas(flow, graph.nodes, []);
    for (const property of [
      "_status",
      "_displayLabel",
      "_unavailableReason",
      "inputs_schema",
      "outputs_schema",
      "_controlHandles",
      "_targetHandles",
    ])
      expect(result.nodes.a).not.toHaveProperty(property);
    expect(result.nodes.a.label).toBe("keep");
  });
  it("catalogue refresh and localization do not dirty an unlabeled saved graph", () => {
    const flow = document({
      nodes: { a: { class_type: "Source", inputs: {} } },
    });
    const before = canvasFromDocument(flow, []),
      after = canvasFromDocument(flow, types);
    expect(fingerprint(documentFromCanvas(flow, before.nodes, []))).toBe(
      fingerprint(documentFromCanvas(flow, after.nodes, [])),
    );
    expect(after.nodes[0].data._displayLabel).toBe("数据来源");
  });
  it("preserves dynamic expert node identities and catalogue availability", () => {
    const dynamic = {
      ...types[0],
      class_type: "agent_custom_expert",
      display_name: "储气库专家",
      available: true,
    };
    expect(localizedSpec(dynamic)).toEqual(dynamic);
    const unavailable = {
      ...types[1],
      available: false,
      unavailable_reason: "工具尚未启用",
    };
    const graph = canvasFromDocument(
      document({ nodes: { task: { class_type: "Sink", inputs: {} } } }),
      [unavailable],
    );
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].data._unavailableReason).toBe("工具尚未启用");
  });
  it("local edit fingerprint ignores only revision and detects changed business inputs", () => {
    const flow = document({
      nodes: { a: { class_type: "Source", inputs: { threshold: 3 } } },
    });
    expect(fingerprint({ ...flow, revision: 8 })).toBe(fingerprint(flow));
    expect(
      fingerprint({
        ...flow,
        nodes: { a: { ...flow.nodes.a, inputs: { threshold: 5 } } },
      }),
    ).not.toBe(fingerprint(flow));
  });
});

describe("FlowForge typed business input and keyboard safety", () => {
  it("parses numbers booleans arrays and objects while preserving zero and false", () => {
    expect(
      parseRuntimeInputs(
        [
          { name: "n", type: "number", required: true },
          { name: "approved", type: "boolean", required: true },
          { name: "items", type: "array" },
          { name: "config", type: "object" },
        ],
        { n: "0", approved: false, items: "[1,2]", config: '{"mode":"test"}' },
      ),
    ).toEqual({
      n: 0,
      approved: false,
      items: [1, 2],
      config: { mode: "test" },
    });
  });
  it.each([
    [{ name: "x", type: "number" }, "NaN"],
    [{ name: "x", type: "number" }, "Infinity"],
    [{ name: "x", type: "integer" }, "1.5"],
    [{ name: "x", type: "array" }, "{}"],
    [{ name: "x", type: "object" }, "[]"],
    [{ name: "x", type: "object" }, "broken"],
    [{ name: "x", type: "boolean" }, "yes"],
    [{ name: "x", type: "number", min: 0, max: 1 }, "2"],
    [{ name: "x", type: "string", required: true }, ""],
  ])("rejects invalid typed input %j %s", (field, value) => {
    expect(() => parseRuntimeInputs([field], { x: value })).toThrow();
  });
  it("rejects blank and duplicate variable names", () => {
    expect(() => parseRuntimeInputs([{ name: "" }], {})).toThrow();
    expect(() =>
      parseRuntimeInputs([{ name: "x" }, { name: "x" }], {}),
    ).toThrow();
  });
  it("does not treat a contenteditable child as a canvas keyboard target", () => {
    const editor = globalThis.document.createElement("div"),
      nested = globalThis.document.createElement("span");
    editor.setAttribute("contenteditable", "true");
    editor.appendChild(nested);
    expect(isTypingTarget(nested)).toBe(true);
    expect(isTypingTarget(globalThis.document.createElement("input"))).toBe(
      true,
    );
    expect(isTypingTarget(globalThis.document.createElement("textarea"))).toBe(
      true,
    );
    expect(isTypingTarget(globalThis.document.createElement("button"))).toBe(
      false,
    );
  });
});
