import type { GraphEdge, GraphNode } from "./graphContracts";
import { compatibleTypes } from "./graphContracts";
import type { RunRecord } from "./runRecord";

export interface VariableSnapshot {
  flowId: string;
  agentId: string;
  revision?: number;
  record?: RunRecord;
  sourceChangedIds?: string[];
}
export interface VariableReference {
  nodeId: string;
  nodeLabel: string;
  output: string;
  slot: number;
  path: (string | number)[];
  expression: string;
  available: boolean;
  value?: unknown;
  declaredType?: string;
  configurationChanged?: boolean;
}
export type TranslateVariable = (
  source: string,
  english: string,
  values?: Record<string, string | number>,
) => string;

export function snapshotStatus(snapshot?: VariableSnapshot) {
  const record = snapshot?.record;
  if (!record) return "unrecorded";
  if (
    record.flow_id !== snapshot.flowId ||
    record.agent_id !== snapshot.agentId
  )
    return "scope";
  if (snapshot.revision === undefined || record.flow_revision === undefined)
    return "unversioned";
  return record.flow_revision === snapshot.revision ? "matched" : "stale";
}

export function pathExpression(parts: (string | number)[]): string {
  return (
    "${" +
    parts
      .map((part, index) =>
        index === 0 ? String(part) : `[${JSON.stringify(part)}]`,
      )
      .join("") +
    "}"
  );
}

const expressionPattern = () =>
  /\$\{((?:\[\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*\]|[^}])+)\}/g;
export function variableExpressionMatches(text: string) {
  return Array.from(text.matchAll(expressionPattern()));
}
export function parseVariablePath(path: string): (string | number)[] {
  const parts: (string | number)[] = [];
  let position = 0;
  while (position < path.length) {
    if (path[position] === "[") {
      const bracket =
        /^\[\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[0-9]+)\s*\]/.exec(
          path.slice(position),
        );
      if (!bracket) throw new Error("Invalid variable path");
      const token = bracket[1];
      let quoted = token;
      if (token[0] === "'") {
        quoted = '"';
        const characters = token.slice(1, -1);
        for (let index = 0; index < characters.length; index++) {
          const character = characters[index];
          if (character === "\\") {
            const escaped = characters[++index];
            quoted += escaped === "'" ? "'" : "\\" + escaped;
          } else quoted += character === '"' ? '\\"' : character;
        }
        quoted += '"';
      }
      parts.push(JSON.parse(quoted));
      position += bracket[0].length;
      continue;
    }
    if (parts.length && path[position++] !== ".")
      throw new Error("Invalid variable path");
    const name = /^[^.\[\]]+/.exec(path.slice(position));
    if (!name) throw new Error("Invalid variable path");
    parts.push(name[0]);
    position += name[0].length;
  }
  if (!parts.length) throw new Error("Empty variable path");
  return parts;
}

export function observedValue(value: unknown, path: (string | number)[]) {
  let current = value;
  for (const key of path) {
    if (
      current === null ||
      typeof current !== "object" ||
      !Object.prototype.hasOwnProperty.call(current, key)
    )
      return { available: false, value: undefined };
    current = (current as Record<string | number, unknown>)[key];
  }
  return { available: true, value: current };
}

export function variableOutputFields(
  node: GraphNode,
): { name: string; type?: string }[] {
  const schema = node.data.outputs_schema || [];
  const textMode =
    node.data.class_type === "LLMCallNode" &&
    [undefined, null, "", "text"].includes(node.data.inputs?.response_format);
  return textMode ? schema.slice(0, 1) : schema;
}

export function variableRoots(
  nodes: GraphNode[],
  snapshot?: VariableSnapshot,
): VariableReference[] {
  const record =
    snapshotStatus(snapshot) === "matched" ? snapshot?.record : undefined;
  return nodes.flatMap((node) => {
    const outputs = variableOutputFields(node);
    const configurationChanged =
      snapshot?.sourceChangedIds?.includes(node.id) || false;
    const values = configurationChanged
      ? undefined
      : record?.node_details?.[node.id]?.outputs;
    return outputs.map((output, slot) => ({
      configurationChanged,
      nodeId: node.id,
      nodeLabel: String(node.data.label || node.data._displayLabel || node.id),
      output: output.name,
      slot,
      path: [],
      expression: pathExpression(["output_slots", node.id, slot]),
      available:
        Array.isArray(values) &&
        Object.prototype.hasOwnProperty.call(values, slot),
      value: Array.isArray(values) ? values[slot] : undefined,
      declaredType: output.type,
    }));
  });
}

export function childVariables(
  reference: VariableReference,
): VariableReference[] {
  const value = reference.value;
  if (!reference.available || value === null || typeof value !== "object")
    return [];
  const prefix = parseVariablePath(reference.expression.slice(2, -1));
  return Object.entries(value).map(([key, child]) => {
    const segment = Array.isArray(value) ? Number(key) : key;
    return {
      ...reference,
      path: [...reference.path, segment],
      expression: pathExpression([...prefix, segment]),
      value: child,
      declaredType: undefined,
    };
  });
}

export function variableValueType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number")
    return Number.isInteger(value) ? "int" : "float";
  return typeof value;
}

export function variablePreview(
  reference: VariableReference,
  t: TranslateVariable,
): string {
  if (reference.configurationChanged)
    return t(
      "来源配置已修改，实际值不可用",
      "The source configuration changed. Its actual value is unavailable",
    );
  if (!reference.available)
    return t("未记录实际值", "Actual value was not recorded");
  if (reference.value === null) return t("null（空值）", "null (empty value)");
  if (reference.value === "") return t("空字符串", "Empty string");
  if (Array.isArray(reference.value))
    return t("数组，共 {count} 项", "Array with {count} items", {
      count: reference.value.length,
    });
  if (typeof reference.value === "object")
    return t("对象，共 {count} 个字段", "Object with {count} fields", {
      count: Object.keys(reference.value as object).length,
    });
  const text =
    typeof reference.value === "string"
      ? reference.value
      : JSON.stringify(reference.value);
  return text && text.length > 160 ? text.slice(0, 160) + "…" : String(text);
}

function nodeForPath(
  parts: (string | number)[],
  nodes: GraphNode[],
): GraphNode | undefined {
  const prefix = parts[0];
  if (prefix === "outputs" || prefix === "output" || prefix === "output_slots")
    return nodes.find((node) => node.id === parts[1]);
  if (["input", "inputs", "state"].includes(String(prefix))) return undefined;
  const direct = ["var", "vars", "variables"].includes(String(prefix))
    ? undefined
    : nodes.find((node) => node.id === prefix);
  if (direct) return direct;
  const alias = ["vars", "var", "variables"].includes(String(prefix))
    ? parts[1]
    : prefix;
  const producers = nodes.filter(
    (node) => (node.data.inputs?.output || node.data.control?.output) === alias,
  );
  return producers.length === 1 ? producers[0] : undefined;
}

function referencedSources(value: unknown, nodes: GraphNode[]): string[] {
  if (typeof value === "string")
    return Array.from(value.matchAll(expressionPattern())).flatMap((match) => {
      try {
        const source = nodeForPath(parseVariablePath(match[1]), nodes);
        return source ? [source.id] : [];
      } catch {
        return [];
      }
    });
  if (value && typeof value === "object")
    return Object.values(value).flatMap((child) =>
      referencedSources(child, nodes),
    );
  return [];
}

function createsCycle(
  source: string,
  target: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
): boolean {
  const links = edges
    .filter(
      (edge) =>
        !(
          edge.sourceHandle === "retry_node" &&
          nodes.find((node) => node.id === edge.source)?.data.class_type ===
            "IterativeRefineNode"
        ),
    )
    .map((edge) => [edge.source, edge.target]);
  for (const node of nodes.filter((entry) => entry.id !== target))
    for (const upstream of referencedSources(
      {
        inputs: Object.fromEntries(
          Object.entries(node.data.inputs || {}).filter(
            ([name, value]) =>
              !(
                node.data.class_type === "LLMCallNode" &&
                name === "output_schema" &&
                value !== null &&
                typeof value === "object" &&
                !Array.isArray(value)
              ),
          ),
        ),
        control: node.data.control,
      },
      nodes,
    ))
      links.push([upstream, node.id]);
  const pending = [target],
    visited = new Set<string>();
  while (pending.length) {
    const id = pending.pop()!;
    if (id === source) return true;
    if (visited.has(id)) continue;
    visited.add(id);
    pending.push(...links.filter(([from]) => from === id).map(([, to]) => to));
  }
  return false;
}

function valueMatches(value: unknown, type?: string): boolean {
  const target = String(type || "any").toLowerCase();
  if (target.includes(","))
    return target.split(",").some((item) => valueMatches(value, item));
  if (["any", "*", "enum", "select"].includes(target)) return true;
  if (["number", "float"].includes(target)) return typeof value === "number";
  if (["int", "integer"].includes(target))
    return typeof value === "number" && Number.isInteger(value);
  if (["boolean", "bool"].includes(target)) return typeof value === "boolean";
  return compatibleTypes(variableValueType(value), target);
}

export function validateVariableExpression({
  text,
  field,
  node,
  nodes,
  edges,
  snapshot,
  workflowInputs = [],
  t,
}: {
  text: string;
  field: { name: string; type?: string; required?: boolean };
  node: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
  snapshot?: VariableSnapshot;
  workflowInputs?: { name: string }[];
  t: TranslateVariable;
}) {
  const errors: string[] = [],
    warnings: string[] = [];
  const matches = Array.from(text.matchAll(expressionPattern()));
  if (!matches.length || text.replace(expressionPattern(), "").includes("${"))
    errors.push(
      t(
        "表达式不完整，请使用 ${...} 引用变量。",
        "Complete the expression using ${...} to reference a variable.",
      ),
    );
  const roots = variableRoots(nodes, snapshot);
  const values: {
    available: boolean;
    value?: unknown;
    declaredType?: string;
  }[] = [];
  for (const match of matches) {
    let parts: (string | number)[];
    try {
      parts = parseVariablePath(match[1]);
    } catch {
      errors.push(t("变量路径语法无效", "The variable path syntax is invalid"));
      continue;
    }
    const explicitOutput = ["output", "outputs", "output_slots"].includes(
      String(parts[0]),
    );
    const source = nodeForPath(parts, nodes);
    const alias = ["vars", "var", "variables"].includes(String(parts[0]))
      ? parts[1]
      : !explicitOutput && !nodes.some((entry) => entry.id === parts[0])
      ? parts[0]
      : undefined;
    const producers =
      alias === undefined
        ? []
        : nodes.filter(
            (entry) =>
              (entry.data.inputs?.output || entry.data.control?.output) ===
              alias,
          );
    if (producers.length > 1) {
      errors.push(
        t(
          "输出变量名存在歧义，请使用节点槽位引用",
          "The output alias is ambiguous. Reference a node output slot instead",
        ),
      );
      continue;
    }
    if (explicitOutput && parts.length > 1 && !source) {
      errors.push(t("来源节点不存在", "The source node does not exist"));
      continue;
    }
    if (source) {
      if (createsCycle(source.id, node.id, nodes, edges)) {
        errors.push(
          t("该变量引用会形成循环", "This variable reference creates a cycle"),
        );
        continue;
      }
      if (producers.length) {
        values.push({ available: false });
        continue;
      }
      const remainder = parts.slice(explicitOutput ? 2 : 1);
      const outputs = roots.filter((root) => root.nodeId === source.id);
      const slot =
        parts[0] === "output_slots" || outputs.length !== 1
          ? Number(remainder.shift())
          : 0;
      const root = outputs[slot];
      if (!root || !Number.isInteger(slot) || slot < 0) {
        errors.push(t("输出槽位不存在", "The output slot does not exist"));
        continue;
      }
      const result = root.available
        ? observedValue(root.value, remainder)
        : { available: false };
      if (root.available && !result.available)
        errors.push(
          t(
            "最近运行中不存在此字段或数组索引",
            "This field or array index is absent from the latest run",
          ),
        );
      values.push({
        ...result,
        declaredType: remainder.length ? undefined : root.declaredType,
      });
      continue;
    }
    if (
      ["input", "inputs"].includes(String(parts[0])) &&
      parts.length > 1 &&
      !workflowInputs.some((input) => input.name === parts[1])
    )
      errors.push(t("工作流输入不存在", "The workflow input does not exist"));
    values.push({ available: false });
  }
  const exact = matches.length === 1 && matches[0][0] === text;
  if (exact && values[0]) {
    const value = values[0];
    if (value.available && value.value === null)
      warnings.push(
        field.required
          ? t(
              "当前实际值为 null，必填输入运行时可能失败。",
              "The observed value is null. This required input may fail at runtime.",
            )
          : t("当前实际值为 null", "The observed value is null"),
      );
    else if (value.available && !valueMatches(value.value, field.type))
      errors.push(
        t(
          "实际值类型与输入类型不兼容",
          "The observed value type is incompatible with this input",
        ),
      );
    else if (
      !value.available &&
      value.declaredType &&
      !compatibleTypes(value.declaredType, field.type)
    )
      errors.push(
        t(
          "输出类型与输入类型不兼容",
          "The output type is incompatible with this input",
        ),
      );
  } else if (!exact && matches.length && !compatibleTypes("string", field.type))
    errors.push(
      t(
        "混合文本表达式只能用于字符串输入",
        "An expression mixed with text requires a string input",
      ),
    );
  if (values.some((value) => !value.available))
    warnings.push(
      t(
        "缺少匹配修订的实际值，运行时将再次解析和验证。",
        "No actual value is available for the matching revision. The runtime will resolve and validate this expression.",
      ),
    );
  return {
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    values,
  };
}
