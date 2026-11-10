import React, { useState } from "react";
import { useWorkflowI18n } from "./i18n";
import { typeLabel } from "./fieldPresentation";
import {
  childVariables,
  variablePreview,
  variableValueType,
  type VariableReference,
} from "./variableBindings";

function VariableItem({
  reference,
  onSelect,
  onLocate,
}: {
  reference: VariableReference;
  onSelect: (reference: VariableReference) => void;
  onLocate?: (nodeId: string, output: string) => void;
}) {
  const { t, locale } = useWorkflowI18n();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(30);
  const structured =
    reference.available &&
    reference.value !== null &&
    typeof reference.value === "object";
  const children = expanded ? childVariables(reference) : [];
  const label = reference.path.length
    ? String(reference.path[reference.path.length - 1])
    : reference.output;
  const type = reference.available
    ? variableValueType(reference.value)
    : reference.declaredType;
  return (
    <li
      role="treeitem"
      aria-expanded={structured ? expanded : undefined}
      className="ff-variable-item"
    >
      <div className="ff-variable-row">
        {structured && (
          <button
            type="button"
            className="ff-variable-toggle"
            aria-label={t("展开字段 {field}", "Expand field {field}", {
              field: label,
            })}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "▾" : "▸"}
          </button>
        )}
        <code title={reference.expression}>{label}</code>
        <span className="ff-variable-type">
          {type === "null" ? "null" : typeLabel(type, locale)}
        </span>
        <button
          type="button"
          onClick={() => onSelect(reference)}
          aria-label={t("使用变量 {path}", "Use variable {path}", {
            path: reference.expression,
          })}
        >
          {t("使用", "Use")}
        </button>
        {onLocate && (
          <button
            type="button"
            onClick={() => onLocate(reference.nodeId, reference.output)}
            aria-label={t(
              "定位来源 {node} 的 {output}",
              "Locate {output} on {node}",
              { node: reference.nodeLabel, output: reference.output },
            )}
          >
            {t("定位", "Locate")}
          </button>
        )}
      </div>
      <div className="ff-variable-preview">{variablePreview(reference, t)}</div>
      {expanded && structured && (
        <ul role="group">
          {children.slice(0, visible).map((child) => (
            <VariableItem
              key={child.expression}
              reference={child}
              onSelect={onSelect}
              onLocate={onLocate}
            />
          ))}
          {children.length > visible && (
            <li>
              <button type="button" onClick={() => setVisible(visible + 30)}>
                {t(
                  "显示更多字段（剩余 {count}）",
                  "Show more fields ({count} remaining)",
                  { count: children.length - visible },
                )}
              </button>
            </li>
          )}
          {!children.length && (
            <li className="ff-muted">
              {t("空对象或空数组", "Empty object or array")}
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

export function VariableTree({
  roots,
  onSelect,
  onLocate,
}: {
  roots: VariableReference[];
  onSelect: (reference: VariableReference) => void;
  onLocate?: (nodeId: string, output: string) => void;
}): React.ReactElement {
  const { t } = useWorkflowI18n();
  const groups = new Map<string, VariableReference[]>();
  for (const reference of roots)
    groups.set(reference.nodeId, [
      ...(groups.get(reference.nodeId) || []),
      reference,
    ]);
  return (
    <div
      role="tree"
      aria-label={t("按来源节点分组的变量", "Variables grouped by source node")}
      className="ff-variable-tree"
    >
      {Array.from(groups, ([id, references]) => (
        <details key={id} open>
          <summary>
            {references[0].nodeLabel} <code>{id}</code>
            {references[0].configurationChanged && (
              <span className="ff-variable-warnings">
                {" "}
                · {t("配置已修改", "Configuration changed")}
              </span>
            )}
          </summary>
          <ul role="group">
            {references.map((reference) => (
              <VariableItem
                key={reference.expression}
                reference={reference}
                onSelect={onSelect}
                onLocate={onLocate}
              />
            ))}
          </ul>
        </details>
      ))}
      {!roots.length && (
        <p className="ff-muted">
          {t(
            "没有可用的上游输出端口",
            "No upstream output ports are available",
          )}
        </p>
      )}
    </div>
  );
}
