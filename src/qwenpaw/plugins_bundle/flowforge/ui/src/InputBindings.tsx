import { useWorkflowI18n } from "./i18n";
import React, { useEffect, useState } from "react";
import { VariableExpression } from "./VariableExpression";
import {
  variableOutputFields,
  type VariableSnapshot,
} from "./variableBindings";
import {
  connectionIssue,
  type GraphEdge,
  type GraphNode,
} from "./graphContracts";
import { fieldLabel, typeLabel } from "./fieldPresentation";
export function InputBindings({
  node,
  nodes,
  edges,
  onBind,
  onDisconnect,
  onExpression,
  onLocateSource,
  snapshot,
  workflowInputs,
}: {
  node: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onBind: (field: string, source: string, handle: string) => void;
  onDisconnect: (field: string) => void;
  onExpression?: (field: string, expression: string) => void;
  onLocateSource?: (nodeId: string, output: string) => void;
  snapshot?: VariableSnapshot;
  workflowInputs?: { name: string }[];
}): React.ReactElement | null {
  const { t, locale } = useWorkflowI18n();
  const [activeField, setActiveField] = useState<string | null>(null);
  useEffect(() => setActiveField(null), [node.id]);
  const inputs: any[] = node.data.inputs_schema || [];
  if (!inputs.length) return null;
  return (
    <section
      className="ff-bindings"
      aria-label={t("上游数据绑定", "Upstream data bindings")}
    >
      <h4>{t("上游数据", "Upstream data")}</h4>
      <p className="ff-muted">
        {t(
          "选择输出即可建立数据连线。更换来源保留其他输入，断开后可填写固定值。",
          "Choose an output to create a data connection. Other inputs are preserved. Disconnect to use a fixed value.",
        )}
      </p>
      {inputs.map((field) => {
        const incoming = edges.filter(
          (edge) =>
            edge.target === node.id &&
            edge.targetHandle === field.name &&
            edge.data?.kind !== "control",
        );
        const rest = edges.filter((edge) => !incoming.includes(edge));
        const choices = nodes.flatMap((source) =>
          variableOutputFields(source).flatMap((output: any) => {
            const wire = {
              source: source.id,
              target: node.id,
              sourceHandle: output.name,
              targetHandle: field.name,
            };
            return connectionIssue(wire, nodes, rest, locale)
              ? []
              : [
                  {
                    value: JSON.stringify([source.id, output.name]),
                    label: `${
                      source.data.label ||
                      source.data._displayLabel ||
                      source.id
                    } · ${fieldLabel(output, locale)} (${typeLabel(
                      output.type || "any",
                      locale,
                    )})`,
                  },
                ];
          }),
        );
        const current = incoming[0];
        const currentNode = nodes.find((item) => item.id === current?.source);
        const handle =
          current?.sourceHandle ||
          currentNode?.data.outputs_schema?.[current?.data?.source_slot || 0]
            ?.name;
        const value = current ? JSON.stringify([current.source, handle]) : "";
        return (
          <div className="ff-binding-row" key={field.name}>
            <label htmlFor={`ff-binding-${node.id}-${field.name}`}>
              {field.displayName || fieldLabel(field, locale)}
            </label>
            <select
              id={`ff-binding-${node.id}-${field.name}`}
              aria-label={t("{v0} 的数据来源", "Data source for {v0}", {
                v0: field.name,
              })}
              value={value}
              onChange={(event) => {
                if (!event.target.value) onDisconnect(field.name);
                else {
                  const [source, output] = JSON.parse(event.target.value);
                  onBind(field.name, source, output);
                }
              }}
            >
              <option value="">
                {t("固定值 / 未绑定", "Fixed value / unbound")}
              </option>
              {value && !choices.some((choice) => choice.value === value) && (
                <option value={value}>
                  {t("当前连接需检查：", "Check current connection ")}
                  {current!.source} ·{" "}
                  {handle || t("默认输出", "Default output")}
                </option>
              )}
              {choices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            {onExpression && (
              <div className="ff-binding-tools">
                <button
                  type="button"
                  aria-expanded={activeField === field.name}
                  onClick={() =>
                    setActiveField(
                      activeField === field.name ? null : field.name,
                    )
                  }
                >
                  {t(
                    "{field} 的变量与表达式",
                    "Variables and expression for {field}",
                    { field: field.name },
                  )}
                </button>
                {activeField === field.name && (
                  <VariableExpression
                    key={JSON.stringify([
                      node.id,
                      field.name,
                      snapshot?.flowId,
                      snapshot?.agentId,
                    ])}
                    node={node}
                    nodes={nodes}
                    edges={rest}
                    field={field}
                    snapshot={snapshot}
                    workflowInputs={workflowInputs}
                    onBind={onBind}
                    onExpression={onExpression}
                    onLocate={onLocateSource}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
