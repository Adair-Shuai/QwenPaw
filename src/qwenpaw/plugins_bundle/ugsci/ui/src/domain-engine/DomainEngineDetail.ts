/**
 * Domain engine detail drawer component.
 */

import { getHost } from "../core/runtime";
import type { DomainEngineView } from "./types";
import { STATUS_COLORS, STATUS_LABELS } from "./runtimeStatus";

export function DomainEngineDetail({
  view,
  open,
  onClose,
  onNavigateToMcp,
  onNavigateToTools,
  onNavigateToSkills,
}: {
  view: DomainEngineView | null;
  open: boolean;
  onClose: () => void;
  onNavigateToMcp: () => void;
  onNavigateToTools: (subTab?: string) => void;
  onNavigateToSkills: () => void;
}) {
  const React = getHost().React;
  const { Drawer, Descriptions, Tag, Typography, Button, Space, Divider } =
    getHost().antd;
  const { Text, Paragraph } = Typography;

  if (!view) return null;

  const def = view.definition;
  const depStatus = view.dependencyStatus;

  return React.createElement(
    Drawer,
    {
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("span", null, def.name),
        React.createElement(
          Tag,
          {
            color: STATUS_COLORS[view.effectiveStatus] || "default",
            style: { fontSize: 11 },
          },
          STATUS_LABELS[view.effectiveStatus] || view.effectiveStatus,
        ),
      ),
      open,
      onClose,
      width: 560,
    },
    // Overview
    React.createElement(
      Descriptions,
      { column: 1, bordered: true, size: "small" },
      React.createElement(
        Descriptions.Item,
        { label: "领域" },
        def.domain,
      ),
      React.createElement(
        Descriptions.Item,
        { label: "来源" },
        def.source === "builtin"
          ? "内置工具"
          : def.source === "mcp"
            ? "MCP 服务"
            : "科学计算库 / 技能",
      ),
      React.createElement(
        Descriptions.Item,
        { label: "实现" },
        `${def.provider.kind}:${def.provider.id}`,
      ),
      React.createElement(
        Descriptions.Item,
        { label: "描述" },
        def.description,
      ),
      React.createElement(
        Descriptions.Item,
        { label: "检测时间" },
        view.checkedAt,
      ),
    ),
    // Operations
    React.createElement(
      "div",
      { style: { marginTop: 16, marginBottom: 8 } },
      React.createElement(Text, { strong: true }, "领域操作"),
    ),
    ...def.operations.map((op: { id: string; name: string; description: string; tool_names: string[] }) =>
      React.createElement(
        "div",
        {
          key: op.id,
          style: {
            padding: "8px 12px",
            marginBottom: 4,
            background: "#fafafa",
            borderRadius: 6,
          },
        },
        React.createElement(
          "div",
          null,
          React.createElement(Text, { strong: true, style: { fontSize: 13 } }, op.name),
          React.createElement(
            Text,
            { type: "secondary", style: { fontSize: 11, marginLeft: 8 } },
            op.id,
          ),
        ),
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12 } },
          op.description,
        ),
        op.tool_names.length > 0
          ? React.createElement(
              "div",
              { style: { marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" } },
              ...op.tool_names.map((name: string) =>
                React.createElement(
                  Tag,
                  { key: name, color: "blue", style: { fontSize: 10 } },
                  name,
                ),
              ),
            )
          : null,
      ),
    ),
    // Dependencies
    React.createElement(Divider, null),
    React.createElement(Text, { strong: true }, "实现与依赖"),
    depStatus && depStatus.dependencies.length > 0
      ? React.createElement(
          "div",
          { style: { marginTop: 8 } },
          ...depStatus.dependencies.map(
            (dep: { name: string; status: string; reason: string }) =>
              React.createElement(
                "div",
                {
                  key: dep.name,
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 0",
                  },
                },
                React.createElement(Text, { style: { fontSize: 13 } }, dep.name),
                React.createElement(
                  Tag,
                  {
                    color: STATUS_COLORS[dep.status] || "default",
                    style: { fontSize: 11 },
                  },
                  STATUS_LABELS[dep.status] || dep.status,
                ),
              ),
          ),
        )
      : React.createElement(
          Paragraph,
          { type: "secondary", style: { fontSize: 12 } },
          "无外部依赖",
        ),
    // Actions
    React.createElement(Divider, null),
    React.createElement(Text, { strong: true }, "问题处理"),
    React.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      def.source === "mcp"
        ? React.createElement(
            Button,
            { size: "small", onClick: onNavigateToMcp },
            "配置 MCP 服务",
          )
        : def.source === "library"
          ? React.createElement(
              Button,
              { size: "small", onClick: onNavigateToSkills },
              "查看相关技能",
            )
          : React.createElement(
            Button,
            { size: "small", onClick: () => onNavigateToTools("builtin") },
            "查看内置工具",
          ),
    ),
  );
}
