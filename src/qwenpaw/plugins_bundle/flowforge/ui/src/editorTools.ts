import type { FlowDocument } from "./model";
import { CONTROL_HANDLES } from "./model";
import {
  parseVariablePath,
  pathExpression,
  variableExpressionMatches,
} from "./variableBindings";

export interface EditorGroup {
  id: string;
  label: string;
  nodeIds: string[];
}
export interface EditorNote {
  id: string;
  text: string;
  position: { x: number; y: number };
}
export interface CanvasTools {
  groups: EditorGroup[];
  notes: EditorNote[];
  previousModes?: Record<string, string>;
}
export function canvasTools(doc: FlowDocument | null): CanvasTools {
  const value = doc?.metadata?.canvas_tools;
  return {
    previousModes: value?.previousModes || {},
    groups: Array.isArray(value?.groups)
      ? value.groups.filter(
          (item: any) =>
            typeof item.id === "string" && Array.isArray(item.nodeIds),
        )
      : [],
    notes: Array.isArray(value?.notes)
      ? value.notes.filter(
          (item: any) =>
            typeof item.id === "string" &&
            typeof item.text === "string" &&
            Number.isFinite(item.position?.x) &&
            Number.isFinite(item.position?.y),
        )
      : [],
  };
}

/** Copy the document contract rather than ReactFlow's transient internals. */
export function duplicateSubgraph(
  doc: FlowDocument,
  ids: string[],
  offset = 60,
) {
  const selected = ids.filter((id) =>
    Object.prototype.hasOwnProperty.call(doc.nodes, id),
  );
  const mapping = new Map(
    selected.map((id) => [id, `${id}_copy_${crypto.randomUUID().slice(0, 8)}`]),
  );
  const aliases = new Map<string, string>();
  for (const id of selected) {
    const alias = doc.nodes[id].control?.output || doc.nodes[id].inputs?.output;
    if (
      typeof alias === "string" &&
      alias &&
      Object.values(doc.nodes).filter(
        (node) => (node.control?.output || node.inputs?.output) === alias,
      ).length === 1
    )
      aliases.set(alias, `${alias}_${mapping.get(id)!.slice(-8)}`);
  }
  const remap = (value: any): any => {
    if (Array.isArray(value)) {
      if (
        value.length === 2 &&
        typeof value[0] === "string" &&
        Number.isInteger(value[1]) &&
        mapping.has(value[0])
      )
        return [mapping.get(value[0]), value[1]];
      return value.map(remap);
    }
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, remap(item)]),
      );
    if (typeof value !== "string") return value;
    let result = value;
    for (const match of variableExpressionMatches(value)) {
      try {
        const parts = parseVariablePath(match[1]);
        const index = ["output", "outputs", "output_slots"].includes(
          String(parts[0]),
        )
          ? 1
          : 0;
        if (mapping.has(String(parts[index]))) {
          parts[index] = mapping.get(String(parts[index]))!;
          result = result.replace(match[0], pathExpression(parts));
        } else {
          const aliasIndex = ["var", "vars", "variables"].includes(
            String(parts[0]),
          )
            ? 1
            : 0;
          if (aliases.has(String(parts[aliasIndex]))) {
            parts[aliasIndex] = aliases.get(String(parts[aliasIndex]))!;
            result = result.replace(match[0], pathExpression(parts));
          }
        }
      } catch {
        /* Keep invalid drafts verbatim for the normal diagnostics. */
      }
    }
    return result;
  };
  const nodes = Object.fromEntries(
    selected.map((id) => {
      const definition = JSON.parse(JSON.stringify(doc.nodes[id]));
      definition.inputs = Object.fromEntries(
        Object.entries(definition.inputs || {}).map(([key, value]) => [
          key,
          key === "output_schema" &&
          definition.class_type === "LLMCallNode" &&
          value !== null &&
          typeof value === "object"
            ? value
            : remap(value),
        ]),
      );
      const alias = definition.control?.output || definition.inputs.output;
      if (aliases.has(alias)) {
        if (definition.control?.output)
          definition.control.output = aliases.get(alias);
        if (definition.inputs.output)
          definition.inputs.output = aliases.get(alias);
      }
      const control = remap(definition.control || {});
      for (const key of CONTROL_HANDLES)
        if (mapping.has(control[key])) control[key] = mapping.get(control[key]);
      if (Array.isArray(control.conditions))
        control.conditions = control.conditions.map((condition: any) => ({
          ...condition,
          ...(mapping.has(condition.then_node)
            ? { then_node: mapping.get(condition.then_node) }
            : {}),
          ...(mapping.has(condition.then)
            ? { then: mapping.get(condition.then) }
            : {}),
        }));
      definition.control = control;
      return [mapping.get(id)!, definition];
    }),
  );
  // Include incoming external dependencies; never copy outgoing edges into an
  // unselected target, which would replace its existing input binding.
  const edges = doc.edges
    .filter(
      (edge) =>
        mapping.has(edge.target) &&
        (mapping.has(edge.source) || edge.kind !== "control"),
    )
    .map((edge) => ({
      ...JSON.parse(JSON.stringify(edge)),
      id: `edge_${crypto.randomUUID()}`,
      source: mapping.get(edge.source) || edge.source,
      target: mapping.get(edge.target),
    }));
  const positions = Object.fromEntries(
    selected.map((id) => [
      mapping.get(id)!,
      {
        x: (doc.metadata?.positions?.[id]?.x || 0) + offset,
        y: (doc.metadata?.positions?.[id]?.y || 0) + offset,
      },
    ]),
  );
  return { nodes, edges, positions, ids: [...mapping.values()] };
}
