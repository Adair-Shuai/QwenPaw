import type { Edge, Node } from "@xyflow/react";

export interface FlowDocument {
  id: string;
  name: string;
  description: string;
  nodes: Record<string, any>;
  edges: any[];
  inputs: any[];
  outputs: any;
  start_id: string | null;
  metadata: Record<string, any>;
  version: string;
  revision?: number;
}
export interface NodeTypeSpec {
  class_type: string;
  display_name: string;
  description: string;
  category: string;
  icon: string;
  inputs_schema: any[];
  outputs_schema: any[];
  control_schema: string[];
  available?: boolean;
  unavailable_reason?: string;
}
export type Api = <T>(path: string, options?: RequestInit) => Promise<T>;
export const CONTROL_HANDLES = [
  "next",
  "else",
  "else_node",
  "on_reject",
  "error_handler",
  "pass_node",
  "fail_node",
  "retry_node",
  "exhausted_node",
];
export const isControlHandle = (name?: string | null) =>
  !!name && (CONTROL_HANDLES.includes(name) || /^condition:\d+$/.test(name));
const names: Record<string, [string, string]> = {
  InputNode: ["工作流输入", "接收试运行或业务调用的输入参数"],
  OutputNode: ["工作流输出", "返回计算结果与业务产物"],
  StartNode: ["开始", "初始化工作流输入与变量"],
  EndNode: ["结束", "返回最终执行结果"],
  AgentNode: ["智能体", "由选定专家执行分析与任务"],
  ToolNode: ["工具调用", "调用已注册的专业能力"],
  ToolCallNode: ["能力调用", "调用已注册的工具与专业能力"],
  LLMNode: ["模型调用", "根据提示词生成内容"],
  LLMCallNode: ["模型调用", "调用模型生成结构化内容"],
  ConditionNode: ["条件分支", "按业务条件选择后续执行路径"],
  HumanReviewNode: ["人工审核", "暂停执行，等待审核决定"],
  ParallelNode: ["并行分支", "并行处理任务并合并结果"],
  SubworkflowNode: ["子工作流", "复用已有工作流执行子任务"],
  QualityGateNode: ["质量检查", "比较真实评分与质量要求"],
  IterativeRefineNode: ["迭代优化", "在限定次数内优化并重新检查"],
  ScriptNode: ["脚本计算", "执行已配置的处理脚本"],
  CodeNode: ["代码计算", "执行数据处理与计算代码"],
  TransformNode: ["数据变换", "映射、提取并转换上游结果"],
  WaitNode: ["等待", "延迟后继续执行"],
  ErrorHandlerNode: ["异常处理", "处理失败信息并执行补救流程"],
  PreviewNode: ["结果预览", "查看上游生成的结果"],
  AssetExportNode: ["产物导出", "导出文件与业务成果"],
  ControlAgentNode: ["调度智能体", "按任务目标协调后续步骤"],
  CodingAgentNode: ["编程智能体", "通过编程解决指定任务"],
  ScriptAgentNode: ["脚本智能体", "生成并执行任务脚本"],
};
export function localizedSpec(spec: NodeTypeSpec): NodeTypeSpec {
  const label = names[spec.class_type];
  const categories: Record<string, string> = {
    "workflow/io": "输入与输出",
    "workflow/action": "模型与能力",
    "workflow/control": "控制逻辑",
    "workflow/human": "人工协作",
    "workflow/data": "数据处理",
    "art/evaluate": "质量与优化",
  };
  return {
    ...spec,
    ...(label ? { display_name: label[0], description: label[1] } : {}),
    category: categories[spec.category] || spec.category,
  };
}
export function controlEdges(node: Pick<Node, "id" | "data">): Edge[] {
  const control: any = node.data.control || {};
  const result: Edge[] = [];
  const add = (handle: string, target: any) => {
    if (typeof target === "string" && target)
      result.push({
        id: `ctrl_${node.id}_${handle}`,
        source: node.id,
        target,
        sourceHandle: handle,
        type: "labeled",
        data: { kind: "control", label: handle },
      });
  };
  for (const key of CONTROL_HANDLES) add(key, control[key]);
  if (Array.isArray(control.conditions))
    control.conditions.forEach((condition: any, index: number) =>
      add(`condition:${index}`, condition.then_node || condition.then),
    );
  return result;
}
const isLink = (value: any): boolean =>
  Array.isArray(value) &&
  value.length === 2 &&
  typeof value[0] === "string" &&
  typeof value[1] === "number";
export function canvasFromDocument(
  flow: FlowDocument,
  specs: NodeTypeSpec[],
): { nodes: Node[]; edges: Edge[] } {
  let wireDefinitions = flow.edges;
  if (!Array.isArray(wireDefinitions)) {
    wireDefinitions = [];
    for (const [id, definition] of Object.entries(flow.nodes || {})) {
      for (const [field, value] of Object.entries(definition.inputs || {})) {
        const links = isLink(value)
          ? [value]
          : Array.isArray(value) && value.every(isLink)
          ? value
          : [];
        links.forEach((link: any, index: number) =>
          wireDefinitions.push({
            id: `legacy_${id}_${field}_${index}`,
            source: link[0],
            target: id,
            target_handle: field.startsWith("__") ? undefined : field,
            source_slot: link[1],
            kind: "data",
          }),
        );
      }
      wireDefinitions.push(
        ...controlEdges({ id, data: definition }).map((edge) => ({
          ...edge.data,
          id: edge.id,
          source: id,
          target: edge.target,
          source_handle: edge.sourceHandle,
        })),
      );
    }
  }
  const nodes = Object.entries(flow.nodes || {}).map(
    ([id, definition], index) => {
      const spec = specs.find(
        (entry) =>
          entry.class_type === (definition.class_type || definition.type),
      );
      return {
        id,
        type: "workflow",
        position: flow.metadata?.positions?.[id] || {
          x: 60 + (index % 3) * 330,
          y: 60 + Math.floor(index / 3) * 210,
        },
        data: {
          ...definition,
          class_type: definition.class_type || definition.type,
          label: definition.label,
          _displayLabel: spec?.display_name || definition.class_type,
          icon: spec?.icon,
          description: spec?.description,
          inputs_schema: spec?.inputs_schema || [],
          outputs_schema: spec?.outputs_schema || [],
          _unavailableReason:
            spec?.available === false
              ? spec.unavailable_reason || "此能力当前不可用"
              : undefined,
          _controlHandles: wireDefinitions
            .filter((edge) => edge.source === id && edge.kind === "control")
            .map((edge) => edge.source_handle || edge.sourceHandle || "next"),
          _targetHandles: wireDefinitions
            .filter((edge) => edge.target === id)
            .map((edge) => edge.target_handle || edge.targetHandle)
            .filter(Boolean),
        },
      };
    },
  );
  const edges = wireDefinitions.map((edge, index) => ({
    id: edge.id || `edge_${index}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.source_handle ?? edge.sourceHandle,
    targetHandle: edge.target_handle ?? edge.targetHandle,
    type: "labeled",
    data: { ...edge, kind: edge.kind || "data", label: edge.label || "" },
  }));
  return { nodes, edges };
}
export function documentFromCanvas(
  doc: FlowDocument,
  nodes: Node[],
  edges: Edge[],
): FlowDocument {
  const definitions: Record<string, any> = {},
    positions: Record<string, any> = {};
  const slotFor = (edge: Edge) => {
    const fields = (nodes.find((node) => node.id === edge.source)?.data
      .outputs_schema || []) as any[];
    const index = fields.findIndex((field) => field.name === edge.sourceHandle);
    return index >= 0 ? index : Number(edge.data?.source_slot ?? 0);
  };
  for (const node of nodes) {
    const {
      icon,
      description,
      inputs_schema,
      outputs_schema,
      _status,
      _controlHandles,
      _targetHandles,
      _unavailableReason,
      _displayLabel,
      ...definition
    } = node.data as any;
    const inputs = { ...(definition.inputs || {}) },
      control = { ...(definition.control || {}) };
    delete inputs.__flow_dependencies;
    for (const [field, value] of Object.entries(inputs))
      if (
        isLink(value) &&
        !edges.some(
          (edge) =>
            edge.target === node.id &&
            edge.source === (value as any)[0] &&
            edge.data?.kind !== "control" &&
            (!edge.targetHandle || edge.targetHandle === field),
        )
      )
        delete inputs[field];
    for (const edge of edges.filter(
      (entry) =>
        entry.target === node.id &&
        entry.targetHandle &&
        entry.data?.kind !== "control",
    ))
      inputs[edge.targetHandle!] = [edge.source, slotFor(edge)];
    const outgoing = edges.filter(
      (edge) => edge.source === node.id && edge.data?.kind === "control",
    );
    for (const key of CONTROL_HANDLES) {
      const edge = outgoing.find((entry) => entry.sourceHandle === key);
      if (edge) control[key] = edge.target;
      else delete control[key];
    }
    if (Array.isArray(control.conditions))
      control.conditions = control.conditions.map(
        (condition: any, index: number) => {
          const expression = { ...condition };
          delete expression.then;
          delete expression.then_node;
          const edge = outgoing.find(
            (entry) => entry.sourceHandle === `condition:${index}`,
          );
          if (edge) expression.then_node = edge.target;
          return expression;
        },
      );
    definitions[node.id] = { ...definition, inputs, control };
    positions[node.id] = node.position;
  }
  return {
    ...doc,
    nodes: definitions,
    edges: edges.map((edge) => ({
      ...edge.data,
      id: edge.id,
      source: edge.source,
      target: edge.target,
      source_handle: edge.sourceHandle ?? undefined,
      target_handle: edge.targetHandle ?? undefined,
      source_slot: slotFor(edge),
      kind: edge.data?.kind || "data",
      label: edge.data?.label || "",
    })),
    metadata: { ...doc.metadata, positions },
  };
}
export function fingerprint(doc: FlowDocument): string {
  const { revision, ...content } = doc;
  return JSON.stringify(content);
}
export function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    !!target.closest(
      "input,textarea,select,[contenteditable=true],[role=textbox],[role=combobox]",
    )
  );
}
export function parseRuntimeInputs(
  fields: any[],
  values: Record<string, any>,
): Record<string, any> {
  const result: Record<string, any> = {},
    names = new Set<string>();
  for (const field of fields) {
    const name = String(field.name || "").trim();
    if (!name || names.has(name)) throw new Error("输入参数名称不能为空或重复");
    names.add(name);
    let value = values[name] ?? field.default;
    if (value === undefined || value === "") {
      if (field.required) throw new Error(`请填写必填参数：${name}`);
      continue;
    }
    const type = String(field.type || "any").toLowerCase();
    if (["number", "float", "int", "integer"].includes(type)) {
      value = Number(value);
      if (
        !Number.isFinite(value) ||
        (["int", "integer"].includes(type) && !Number.isInteger(value))
      )
        throw new Error(
          `${name} 必须是有效数字${
            ["int", "integer"].includes(type) ? "（整数）" : ""
          }`,
        );
      if (
        (field.min !== undefined && value < field.min) ||
        (field.max !== undefined && value > field.max)
      )
        throw new Error(`${name} 超出允许范围`);
    } else if (["object", "array"].includes(type)) {
      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch {
          throw new Error(`${name} 不是有效 JSON`);
        }
      }
      if (
        type === "array"
          ? !Array.isArray(value)
          : !value || typeof value !== "object" || Array.isArray(value)
      )
        throw new Error(`${name} 必须是 ${type}`);
    } else if (
      ["boolean", "bool"].includes(type) &&
      typeof value !== "boolean"
    ) {
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else throw new Error(`${name} 必须是布尔值`);
    }
    result[name] = value;
  }
  return result;
}
