import { isControlHandle, type FlowDocument, type NodeTypeSpec } from "./model";
import { fieldLabel } from "./fieldPresentation";
import { translateWorkflow, workflowLocale } from "./i18n";

export interface Diagnostic {
  code: string;
  severity: "error" | "warning";
  message: string;
  node_id?: string;
  field?: string;
  edge_id?: string;
}
export interface ValidationResult {
  ok: boolean;
  errors: unknown[];
  warnings?: string[];
  diagnostics?: Diagnostic[];
}
export interface GraphNode {
  id: string;
  data: Record<string, any>;
}
export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: Record<string, any>;
}
type Wire = Pick<
  GraphEdge,
  "source" | "target" | "sourceHandle" | "targetHandle"
>;

// The catalogue lowercases the engine's IO types. Do not silently coerce
// INT to FLOAT or media references to strings: runtime contracts are strict.
export function compatibleTypes(source?: string, target?: string): boolean {
  const a = String(source || "*").toLowerCase();
  const b = String(target || "*").toLowerCase();
  if (["*", "any"].includes(a) || ["*", "any"].includes(b)) return true;
  if (a === "enum" || b === "enum") return true; // Choice values need backend validation.
  return a.split(",").some((type) => b.split(",").includes(type));
}

/** Fast authoring feedback only. The scoped backend remains authoritative. */
export function connectionIssue(
  wire: Wire,
  nodes: GraphNode[],
  edges: GraphEdge[],
  locale: string = workflowLocale(),
): string | null {
  const t = (
    source: string,
    english: string,
    values?: Record<string, string>,
  ) => translateWorkflow(source, locale, english, values);
  const source = nodes.find((node) => node.id === wire.source);
  const target = nodes.find((node) => node.id === wire.target);
  if (!source || !target)
    return t("连接的节点不存在", "A connected node is missing");
  if (source.id === target.id)
    return t("不能连接节点自身", "A node cannot connect to itself");
  if (
    edges.some(
      (edge) =>
        edge.source === wire.source &&
        edge.target === wire.target &&
        (edge.sourceHandle || null) === (wire.sourceHandle || null) &&
        (edge.targetHandle || null) === (wire.targetHandle || null),
    )
  )
    return t("这条连线已存在", "This connection already exists");
  const control = isControlHandle(wire.sourceHandle);
  if (control) {
    if (
      edges.some(
        (edge) =>
          edge.source === source.id && edge.sourceHandle === wire.sourceHandle,
      )
    )
      return t(
        "此控制分支已有目标，请先断开原连线",
        "This branch already has a target. Disconnect its existing connection first.",
      );
  } else {
    const outputs: any[] = source.data.outputs_schema || [];
    const inputs: any[] = target.data.inputs_schema || [];
    const output = wire.sourceHandle
      ? outputs.find((field) => field.name === wire.sourceHandle)
      : outputs[0];
    const input = inputs.find((field) => field.name === wire.targetHandle);
    if (wire.sourceHandle && !output)
      return t(
        "输出端口已不存在，请刷新节点目录",
        "The output port is missing. Refresh the node catalog.",
      );
    if (wire.targetHandle && !input)
      return t(
        "输入端口已不存在，请刷新节点目录",
        "The input port is missing. Refresh the node catalog.",
      );
    if (
      wire.targetHandle &&
      edges.some(
        (edge) =>
          edge.target === target.id &&
          edge.targetHandle === wire.targetHandle &&
          !isControlHandle(edge.sourceHandle) &&
          edge.data?.kind !== "control",
      )
    )
      return t(
        "此输入已有数据来源，请先断开或在节点属性中更换",
        "This input already has a source. Disconnect it or change its source in node settings.",
      );
    if (output && input && !compatibleTypes(output.type, input.type))
      return t(
        "类型不兼容：{source} → {target}",
        "Incompatible types {source} → {target}",
        { source: output.type, target: input.type },
      );
  }
  // Only the dedicated bounded-refinement port can introduce a back edge.
  // Its budget and reachability are checked by the backend before execution.
  if (
    control &&
    wire.sourceHandle === "retry_node" &&
    source.data.class_type === "IterativeRefineNode"
  )
    return null;
  const pending = [target.id],
    seen = new Set<string>();
  while (pending.length) {
    const id = pending.pop()!;
    if (id === source.id)
      return t(
        "这条连线会形成循环；请使用有界的迭代优化节点",
        "This connection creates a cycle. Use a bounded iterative refinement node.",
      );
    if (seen.has(id)) continue;
    seen.add(id);
    for (const edge of edges) {
      const owner = nodes.find((node) => node.id === edge.source);
      if (
        edge.sourceHandle === "retry_node" &&
        owner?.data.class_type === "IterativeRefineNode"
      )
        continue;
      if (edge.source === id) pending.push(edge.target);
    }
  }
  return null;
}

export function configurationDiagnostics(
  flow: FlowDocument | null,
  specs: NodeTypeSpec[],
  locale: string = workflowLocale(),
): Diagnostic[] {
  if (!flow || !specs.length) return [];
  const result: Diagnostic[] = [];
  for (const [id, node] of Object.entries(flow.nodes)) {
    const spec = specs.find((item) => item.class_type === node.class_type);
    if (!spec) continue; // Catalogue loading must not erase unknown historical nodes.
    if (spec.available === false)
      result.push({
        code: "node_unavailable",
        severity: "error",
        node_id: id,
        message:
          spec.unavailable_reason ||
          translateWorkflow(
            "此节点当前不可用",
            locale,
            "This node is currently unavailable",
          ),
      });
    for (const field of spec.inputs_schema || []) {
      const value = node.inputs?.[field.name] ?? field.default;
      if (
        field.required &&
        (value === undefined || value === null || value === "")
      )
        result.push({
          code: "required_input",
          severity: "error",
          node_id: id,
          field: `inputs.${field.name}`,
          message: translateWorkflow(
            "请填写 {field}",
            locale,
            "Enter {field}",
            { field: field.displayName || fieldLabel(field, locale) },
          ),
        });
    }
  }
  return result;
}

export function validationDiagnostics(
  result: ValidationResult,
  locale: string = workflowLocale(),
): Diagnostic[] {
  if (result.diagnostics?.length)
    return result.diagnostics.map((diagnostic) => ({
      ...diagnostic,
      message:
        diagnostic.code === "OUTPUT_SLOT_UNAVAILABLE"
          ? translateWorkflow(
              "结构化结果仅在来源节点启用 JSON Schema 模式时可用。",
              locale,
              "The structured result is available only when the source node uses JSON Schema mode.",
            )
          : diagnostic.code === "TEMPLATE_REFERENCE_INVALID"
          ? translateWorkflow(
              "变量引用无效 {detail}",
              locale,
              "Invalid variable reference {detail}",
              {
                detail: diagnostic.message.replace(/^变量引用无效[：:]\s*/, ""),
              },
            )
          : diagnostic.message,
    }));
  return [
    ...result.errors.map((error, index): Diagnostic => {
      const message = typeof error === "string" ? error : JSON.stringify(error);
      const required =
        /node '([^']+)' required input '([^']+)' is missing/.exec(message);
      return required
        ? {
            code: "required_input",
            severity: "error",
            node_id: required[1],
            field: `inputs.${required[2]}`,
            message: translateWorkflow(
              "请填写 {field}",
              locale,
              "Enter {field}",
              { field: fieldLabel({ name: required[2] }, locale) },
            ),
          }
        : {
            code: `legacy_${index}`,
            severity: "error",
            message,
            node_id: /node '([^']+)'/.exec(message)?.[1],
          };
    }),
    ...(result.warnings || []).map(
      (message, index): Diagnostic => ({
        code: `warning_${index}`,
        severity: "warning",
        message,
      }),
    ),
  ];
}
