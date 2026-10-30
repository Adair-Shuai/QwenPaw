import { getHost } from "../core/runtime";
import type { DomainOperation } from "./types";
import { OPERATION_PRESENTATIONS } from "./operationPresentation";

export function getOperationPresentation(operation: DomainOperation) {
  const detail = OPERATION_PRESENTATIONS[operation.id];
  return {
    description: detail?.description || operation.description || "暂无说明",
    inputs: detail?.inputs || "输入信息未提供",
    outputs: detail?.outputs || "输出信息未提供",
    limitations: detail?.limitations,
  };
}

export function OperationList({
  operations,
}: {
  operations: DomainOperation[];
}) {
  const React = getHost().React;
  const { Tag, Typography } = getHost().antd;
  const { Text } = Typography;
  return React.createElement(
    "div",
    { style: { display: "grid", gap: 8, minWidth: 0 } },
    ...operations.map((op) => {
      const presentation = getOperationPresentation(op);
      return React.createElement(
        "div",
        {
          key: op.id,
          style: {
            padding: "10px 12px",
            border: "1px solid var(--app-border-subtle, #f0f0f0)",
            borderRadius: 6,
            minWidth: 0,
          },
        },
        React.createElement(
          Text,
          { strong: true, style: { overflowWrap: "anywhere" } },
          op.name,
        ),
        React.createElement(
          Text,
          {
            type: "secondary",
            style: { display: "block", fontSize: 11, overflowWrap: "anywhere" },
          },
          op.tool_names.length
            ? `工具：${op.tool_names.join("、")}`
            : "工具：未声明",
        ),
        React.createElement(
          Text,
          {
            style: {
              display: "block",
              marginTop: 6,
              fontSize: 12,
              overflowWrap: "anywhere",
            },
          },
          presentation.description,
        ),
        React.createElement(
          Text,
          {
            type: "secondary",
            style: {
              display: "block",
              marginTop: 4,
              fontSize: 12,
              overflowWrap: "anywhere",
            },
          },
          `输入：${presentation.inputs}`,
        ),
        React.createElement(
          Text,
          {
            type: "secondary",
            style: { display: "block", fontSize: 12, overflowWrap: "anywhere" },
          },
          `输出：${presentation.outputs}`,
        ),
        presentation.limitations
          ? React.createElement(
              Text,
              {
                type: "warning",
                style: {
                  display: "block",
                  fontSize: 12,
                  overflowWrap: "anywhere",
                },
              },
              `限制：${presentation.limitations}`,
            )
          : null,
        !OPERATION_PRESENTATIONS[op.id]
          ? React.createElement(
              Tag,
              { style: { marginTop: 4 } },
              "详细说明待补充",
            )
          : null,
      );
    }),
  );
}
