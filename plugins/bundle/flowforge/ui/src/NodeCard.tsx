import React, { useEffect, useState } from "react";
import { useWorkflowI18n } from "./i18n";
import {
  Handle,
  Position,
  useUpdateNodeInternals,
  type NodeProps,
} from "@xyflow/react";
import { NodeIcon } from "./NodeIcon";
import { controlLabel, fieldLabel, typeLabel } from "./fieldPresentation";

const colors: Record<string, string> = {
  StartNode: "#52c41a",
  EndNode: "#fa541c",
  InputNode: "#52c41a",
  OutputNode: "#fa541c",
  ToolCallNode: "#1677ff",
  ToolNode: "#1677ff",
  AgentNode: "#722ed1",
  ConditionNode: "#faad14",
  LLMCallNode: "#13c2c2",
  LLMNode: "#13c2c2",
  CodeNode: "#eb2f96",
  ScriptNode: "#eb2f96",
  ParallelNode: "#874d00",
  WaitNode: "#8c8c8c",
  TransformNode: "#0958d9",
  ErrorHandlerNode: "#cf1322",
  HumanReviewNode: "#d4380d",
  SubworkflowNode: "#5b8c00",
  QualityGateNode: "#7cb305",
  IterativeRefineNode: "#08979c",
  AssetExportNode: "#c41d7f",
};
const statusLabels: Record<string, string> = {
  pending: "待执行",
  queued: "排队中",
  not_executed: "未执行",
  cached: "使用缓存",
  timeout: "已超时",
  paused: "已暂停",
  waiting_human: "待审核",
  running: "执行中",
  completed: "完成",
  success: "完成",
  failed: "失败",
  error: "错误",
  blocked: "待审核",
  skipped: "已跳过",
  cancelled: "已取消",
};

export function NodeCard({
  id,
  data,
  selected,
}: NodeProps): React.ReactElement {
  const { t, locale } = useWorkflowI18n();
  const [expanded, setExpanded] = useState(false);
  const detailed = selected || expanded;
  const updateInternals = useUpdateNodeInternals();
  const d = data as any;
  const classType = d.class_type || d.type || "ToolNode";
  const label = d.label || d._displayLabel || classType;
  const color = colors[classType] || "#1677ff";
  const status: string | undefined = d._status;
  const allInputs = [...(d.inputs_schema || [])];
  for (const name of d._targetHandles || [])
    if (!allInputs.some((field: any) => field.name === name))
      allInputs.push({ name, type: "any" });
  const allOutputs: any[] = d.outputs_schema || [];
  const inputs = detailed
    ? allInputs
    : allInputs.filter(
        (field, index) =>
          field.required ||
          (d._targetHandles || []).includes(field.name) ||
          index === 0,
      );
  const outputs = detailed
    ? allOutputs
    : allOutputs.filter(
        (field, index) =>
          (d._sourceHandles || []).includes(field.name) || index === 0,
      );
  const hiddenPorts =
    allInputs.length + allOutputs.length - inputs.length - outputs.length;
  const controls = [
    ...new Set<string>([
      ...(d._controlHandles || []),
      ...(Array.isArray(d.control?.conditions)
        ? d.control.conditions.map(
            (_: any, index: number) => `condition:${index}`,
          )
        : []),
      ...(classType === "ConditionNode"
        ? [
            (d._controlHandles || []).includes("else_node")
              ? "else_node"
              : "else",
          ]
        : []),
      ...(classType === "HumanReviewNode" ? ["next", "on_reject"] : []),
      ...(classType === "QualityGateNode" ? ["pass_node", "fail_node"] : []),
      ...(classType === "IterativeRefineNode"
        ? ["retry_node", "exhausted_node"]
        : []),
    ]),
  ];
  const portGeometry = JSON.stringify([
    inputs.map((field) => field.name),
    outputs.map((field) => field.name),
    controls,
  ]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const wrapper = Array.from(
        document.querySelectorAll<HTMLElement>(".react-flow__node"),
      ).find((element) => element.dataset.id === id);
      // Hidden or unmeasured nodes are refreshed by ReactFlow's ResizeObserver.
      if (wrapper && wrapper.getBoundingClientRect().width > 0)
        updateInternals(id);
    });
    return () => cancelAnimationFrame(frame);
  }, [id, portGeometry, updateInternals]);
  const diagnostics: { severity: string; message: string; field?: string }[] =
    d._diagnostics || [];
  const errors = diagnostics.filter((item) => item.severity === "error");
  const warnings = diagnostics.filter((item) => item.severity !== "error");
  const statusColor =
    status === "failed" || status === "error"
      ? "var(--ant-color-error, #ff4d4f)"
      : status === "running"
      ? "var(--ant-color-primary, #1677ff)"
      : status === "completed" || status === "success"
      ? "var(--ant-color-success, #52c41a)"
      : "var(--ant-color-text-secondary, #666)";
  const summary =
    d.inputs?.query ??
    d.inputs?.prompt ??
    d.inputs?.tool_name ??
    d.inputs?.name;
  return (
    <div
      className="ff-node-card"
      data-node-density={detailed ? "expanded" : "compact"}
      style={{
        width: 270,
        borderRadius: 10,
        padding: "12px 14px",
        background: "var(--ant-color-bg-container, #fff)",
        color: "var(--ant-color-text, #222)",
        border: `2px solid ${
          selected
            ? color
            : errors.length
            ? "var(--ant-color-error, #ff4d4f)"
            : "var(--ant-color-border, #d9d9d9)"
        }`,
        boxShadow:
          status === "running"
            ? `0 0 0 3px ${color}33`
            : "0 1px 5px rgba(0,0,0,0.08)",
        fontSize: 12,
      }}
    >
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ color }}>
          <NodeIcon classType={classType} icon={d.icon} />
        </span>
        <strong
          title={label}
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </strong>
        <span
          data-run-status={status || "unrun"}
          style={{ color: statusColor, fontSize: 11, flexShrink: 0 }}
        >
          {status
            ? t(statusLabels[status] || status)
            : t("未执行", "Not executed")}
        </span>
      </div>
      {typeof summary === "string" && summary.trim() ? (
        <div
          title={summary}
          style={{
            marginTop: 6,
            color: "var(--ant-color-text-secondary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {summary}
        </div>
      ) : d.description ? (
        <div
          title={d.description}
          style={{
            marginTop: 6,
            color: "var(--ant-color-text-secondary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {d.description}
        </div>
      ) : null}
      {d._unavailableReason && (
        <div style={{ marginTop: 6, color: "var(--ant-color-error)" }}>
          {t("当前不可用", "Unavailable")} · {d._unavailableReason}
        </div>
      )}
      {errors.length > 0 && (
        <div
          data-config-status="error"
          title={errors.map((item) => item.message).join("\n")}
          style={{ marginTop: 6, color: "var(--ant-color-error)" }}
        >
          {t("待配置 {count} 项", "{count} configuration issues", {
            count: errors.length,
          })}{" "}
          · {errors[0].message}
        </div>
      )}
      {!errors.length && warnings.length > 0 && (
        <div
          data-config-status="warning"
          title={warnings.map((item) => item.message).join("\n")}
          style={{
            marginTop: 6,
            color: "var(--ant-color-warning-text, #ad6800)",
          }}
        >
          {warnings[0].message}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 14,
          marginTop: 12,
        }}
      >
        <div>
          {inputs.length ? (
            inputs.map((field: any) => (
              <div
                key={field.name}
                style={{ position: "relative", minHeight: 30 }}
                title={`${fieldLabel(field, locale)} · ${typeLabel(
                  field.type,
                  locale,
                )}${field.required ? ` · ${t("必填", "Required")}` : ""}`}
              >
                <Handle
                  id={field.name}
                  type="target"
                  position={Position.Left}
                  style={{
                    top: 10,
                    left: -16,
                    background: field.color || color,
                  }}
                />
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fieldLabel(field, locale)}
                  {field.required && (
                    <span
                      aria-label={t("必填", "Required")}
                      style={{ color: "var(--ant-color-error)" }}
                    >
                      {" "}
                      *{" "}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--ant-color-text-tertiary)",
                  }}
                >
                  {typeLabel(field.type, locale)}
                </div>
              </div>
            ))
          ) : (
            <div style={{ position: "relative", minHeight: 30 }}>
              <Handle
                type="target"
                position={Position.Left}
                style={{ top: 10, left: -16 }}
              />
              <span style={{ color: "var(--ant-color-text-tertiary)" }}>
                {t("控制输入", "Control input")}
              </span>
            </div>
          )}
        </div>
        <div>
          {outputs.length ? (
            outputs.map((field: any) => (
              <div
                key={field.name}
                style={{
                  position: "relative",
                  minHeight: 30,
                  textAlign: "right",
                }}
                title={`${fieldLabel(field, locale)} · ${typeLabel(
                  field.type,
                  locale,
                )}`}
              >
                <Handle
                  id={field.name}
                  type="source"
                  position={Position.Right}
                  style={{
                    top: 10,
                    right: -16,
                    background: field.color || color,
                  }}
                />
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fieldLabel(field, locale)}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--ant-color-text-tertiary)",
                  }}
                >
                  {typeLabel(field.type, locale)}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                position: "relative",
                minHeight: 30,
                textAlign: "right",
              }}
            >
              <Handle
                type="source"
                position={Position.Right}
                style={{ top: 10, right: -16 }}
              />
              <span style={{ color: "var(--ant-color-text-tertiary)" }}>
                {t("后续节点", "Next node")}
              </span>
            </div>
          )}
        </div>
      </div>
      {controls.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 12px",
            marginTop: 10,
            borderTop: "1px solid var(--ant-color-border-secondary)",
            paddingTop: 6,
          }}
        >
          {controls.map((handle) => (
            <div
              key={handle}
              style={{
                position: "relative",
                paddingBottom: 4,
                color: "var(--ant-color-warning-text, #ad6800)",
                fontSize: 10,
              }}
              title={t("控制路径 {path}", "Control path {path}", {
                path: controlLabel(handle, locale),
              })}
            >
              {controlLabel(handle, locale)}
              <Handle
                id={handle}
                type="source"
                position={Position.Bottom}
                style={{
                  bottom: -5,
                  background: "var(--ant-color-warning, #d97706)",
                  borderRadius: 2,
                }}
              />
            </div>
          ))}
        </div>
      )}
      {(hiddenPorts > 0 || expanded) && (
        <button
          type="button"
          className="ff-expand-ports nodrag"
          aria-expanded={detailed}
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
        >
          {expanded
            ? t("收起可选端口", "Collapse optional ports")
            : t("展开其余 {count} 个端口", "Show {count} more ports", {
                count: hiddenPorts,
              })}
        </button>
      )}
      <div
        title={t("节点 ID {id}", "Node ID {id}", { id })}
        style={{
          fontSize: 9,
          marginTop: 8,
          color: "var(--ant-color-text-quaternary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {id}
      </div>
    </div>
  );
}
