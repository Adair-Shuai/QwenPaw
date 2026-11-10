import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWorkflowI18n } from "./i18n";
import type { GraphEdge, GraphNode } from "./graphContracts";
import { VariableTree } from "./VariableTree";
import {
  childVariables,
  snapshotStatus,
  validateVariableExpression,
  variablePreview,
  variableRoots,
  variableExpressionMatches,
  type VariableReference,
  type VariableSnapshot,
} from "./variableBindings";

function completionVariables(roots: VariableReference[]) {
  const result: VariableReference[] = [];
  const add = (items: VariableReference[], depth: number) => {
    for (const reference of items) {
      if (result.length >= 300) return;
      result.push(reference);
      if (depth < 8) add(childVariables(reference).slice(0, 50), depth + 1);
    }
  };
  add(roots, 0);
  return result;
}

export function VariableExpression({
  node,
  nodes,
  edges,
  field,
  snapshot,
  workflowInputs,
  onBind,
  onExpression,
  onLocate,
}: {
  node: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
  field: { name: string; type?: string; required?: boolean };
  snapshot?: VariableSnapshot;
  workflowInputs?: { name: string }[];
  onBind: (field: string, source: string, handle: string) => void;
  onExpression: (field: string, expression: string) => void;
  onLocate?: (nodeId: string, output: string) => void;
}): React.ReactElement {
  const { t } = useWorkflowI18n();
  const value = node.data.inputs?.[field.name];
  const [text, setText] = useState(
    typeof value === "string" && value.includes("${") ? value : "",
  );
  const [cursor, setCursor] = useState(0);
  const [forced, setForced] = useState(false);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setText(typeof value === "string" && value.includes("${") ? value : "");
    setForced(false);
  }, [node.id, field.name, value]);
  const roots = useMemo(
    () =>
      variableRoots(
        nodes.filter((source) => source.id !== node.id),
        snapshot,
      ),
    [nodes, snapshot, node.id],
  );
  const candidates = useMemo(() => completionVariables(roots), [roots]);
  const check = (expression: string) =>
    validateVariableExpression({
      text: expression,
      field,
      node,
      nodes,
      edges,
      snapshot,
      workflowInputs,
      t,
    });
  const result = check(text);
  const start = text.lastIndexOf("${", cursor);
  const open =
    start >= 0 &&
    cursor >= start + 2 &&
    !variableExpressionMatches(text.slice(start, cursor)).length;
  const needle = open ? text.slice(start + 2, cursor).toLowerCase() : "";
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[\[\]"\']/g, ".")
      .replace(/\.+/g, ".");
  const terms = normalize(needle)
    .replace(/^(?:\$\{)?(?:output_slots|outputs?)\.?/, "")
    .split(".")
    .filter(Boolean);
  const suggestions =
    !dismissed && (forced || open)
      ? candidates
          .filter((reference) =>
            terms.every((term) =>
              normalize(reference.expression).includes(term),
            ),
          )
          .slice(0, 12)
      : [];
  const insert = (reference: VariableReference) => {
    const from = open ? start : cursor;
    const complete = open
      ? variableExpressionMatches(text.slice(start))[0]
      : undefined;
    const to = complete?.index === 0 ? start + complete[0].length : cursor;
    const next = text.slice(0, from) + reference.expression + text.slice(to);
    const position = from + reference.expression.length;
    setText(next);
    setCursor(position);
    setForced(false);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(position, position);
    });
  };
  const choose = (reference: VariableReference) => {
    setText(reference.expression);
    setCursor(reference.expression.length);
    setDismissed(true);
    if (check(reference.expression).errors.length) return;
    if (!reference.path.length)
      onBind(field.name, reference.nodeId, reference.output);
    else onExpression(field.name, reference.expression);
  };
  const status = snapshotStatus(snapshot);
  return (
    <section
      className="ff-variable-editor"
      aria-label={t(
        "{field} 的变量与表达式",
        "Variables and expression for {field}",
        { field: field.name },
      )}
    >
      <p className="ff-variable-snapshot" role="status">
        {status === "matched" &&
          t(
            "实际运行 {run} · 修订 {revision}",
            "Observed run {run} · revision {revision}",
            { run: snapshot!.record!.run_id, revision: snapshot!.revision! },
          )}
        {status === "unrecorded" &&
          t(
            "尚无运行记录，当前仅展示输出声明。",
            "No run record is available. Only declared outputs are shown.",
          )}
        {status === "scope" &&
          t(
            "运行记录属于其他工作流或专家，实际值不可用。",
            "The run belongs to another workflow or agent. Its values are unavailable.",
          )}
        {status === "unversioned" &&
          t(
            "运行记录缺少修订信息，实际值不可用。",
            "The run has no revision metadata. Its values are unavailable.",
          )}
        {status === "stale" &&
          t(
            "运行记录已过期，修订不匹配，实际值不可用。",
            "The run is stale. Its revision differs, so actual values are unavailable.",
          )}
      </p>
      <p className="ff-muted">
        {t(
          "选择字段即可绑定。编辑表达式后点击应用，Ctrl+Space 打开补全。",
          "Select a field to bind it. Apply an edited expression. Ctrl+Space opens completion.",
        )}
      </p>
      <VariableTree roots={roots} onSelect={choose} onLocate={onLocate} />
      <label htmlFor={`ff-expression-${node.id}-${field.name}`}>
        {t("变量表达式", "Variable expression")}
      </label>
      <textarea
        ref={input}
        id={`ff-expression-${node.id}-${field.name}`}
        aria-label={t("{field} 的表达式", "Expression for {field}", {
          field: field.name,
        })}
        value={text}
        spellCheck={false}
        rows={3}
        aria-invalid={text.length > 0 && result.errors.length > 0}
        onChange={(event) => {
          setText(event.target.value);
          setCursor(event.target.selectionStart);
          setActive(0);
          setDismissed(false);
        }}
        onSelect={(event) => setCursor(event.currentTarget.selectionStart)}
        onKeyDown={(event) => {
          if (event.ctrlKey && event.code === "Space") {
            event.preventDefault();
            setForced(true);
            setDismissed(false);
          }
          if (event.key === "Escape") {
            setForced(false);
            setDismissed(true);
          }
          if (
            suggestions.length &&
            ["ArrowDown", "ArrowUp"].includes(event.key)
          ) {
            event.preventDefault();
            setActive(
              (active +
                (event.key === "ArrowDown" ? 1 : -1) +
                suggestions.length) %
                suggestions.length,
            );
          }
          if (suggestions.length && event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            insert(suggestions[active % suggestions.length]);
          }
        }}
      />
      {suggestions.length > 0 && (
        <ul
          className="ff-variable-completions"
          role="listbox"
          aria-label={t("表达式补全", "Expression completion")}
        >
          {suggestions.map((reference, index) => (
            <li
              key={reference.expression}
              role="option"
              aria-selected={index === active}
            >
              <button type="button" onClick={() => insert(reference)}>
                {reference.expression}
                <span>{variablePreview(reference, t)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {text && result.errors.length > 0 && (
        <ul role="alert" className="ff-variable-errors">
          {result.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      {text && result.warnings.length > 0 && (
        <ul className="ff-variable-warnings">
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
      {text && !result.errors.length && (
        <p className="ff-variable-valid">
          {t("表达式检查通过", "Expression checks passed")}
        </p>
      )}
      <button
        type="button"
        disabled={result.errors.length > 0 || !text}
        onClick={() => onExpression(field.name, text)}
      >
        {t("应用表达式", "Apply expression")}
      </button>
    </section>
  );
}
