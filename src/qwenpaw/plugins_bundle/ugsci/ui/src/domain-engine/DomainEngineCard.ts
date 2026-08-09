/**
 * Domain engine card component.
 */

import { getHost } from "../core/runtime";
import type { DomainEngineView } from "./types";
import { STATUS_COLORS, STATUS_LABELS } from "./runtimeStatus";

const DOMAIN_ICONS: Record<string, string> = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊",
};

const SOURCE_LABELS: Record<string, string> = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库",
};

export function DomainEngineCard({
  view,
  onClick,
}: {
  view: DomainEngineView;
  onClick: () => void;
}) {
  const React = getHost().React;
  const { Card, Tag, Typography } = getHost().antd;
  const { Text } = Typography;

  const def = view.definition;
  const icon = DOMAIN_ICONS[def.domain] || "📦";
  const status = view.effectiveStatus;
  const opCount = def.operations.length;
  const toolCount = view.discoveredToolCount;

  return React.createElement(
    Card,
    {
      hoverable: true,
      onClick,
      size: "small",
      style: {
        cursor: "pointer",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      },
      styles: {
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flex: 1,
        },
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("span", { style: { fontSize: 20 } }, icon),
        React.createElement(
          "div",
          null,
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 14 } },
            def.name,
          ),
          React.createElement("br"),
          React.createElement(
            Text,
            { type: "secondary", style: { fontSize: 11 } },
            SOURCE_LABELS[def.source] || def.source,
          ),
        ),
      ),
      React.createElement(
        Tag,
        { color: STATUS_COLORS[status] || "default", style: { fontSize: 11 } },
        STATUS_LABELS[status] || status,
      ),
    ),
    React.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12 } },
        def.description,
      ),
    ),
    React.createElement(
      "div",
      {
        style: {
          marginTop: 8,
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        },
      },
      React.createElement(
        Tag,
        { style: { fontSize: 11 } },
        `${opCount} 操作`,
      ),
      toolCount > 0
        ? React.createElement(
            Tag,
            { color: "blue", style: { fontSize: 11 } },
            `${toolCount} 工具`,
          )
        : null,
      ...(def.tags || []).map((tag: string) =>
        React.createElement(
          Tag,
          { key: tag, color: "cyan", style: { fontSize: 10 } },
          tag,
        ),
      ),
    ),
  );
}
