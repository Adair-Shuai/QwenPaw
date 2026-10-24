/** Domain engine summary card. */
import { getHost } from "../core/runtime";
import type { DomainEngineView, RuntimeInstallTask } from "./types";
import { STATUS_COLORS, STATUS_LABELS } from "./runtimeStatus";
import { ENGINE_PRESENTATIONS } from "./operationPresentation";
import { OperationList } from "./OperationList";

const DOMAIN_ICONS: Record<string, string> = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  reservoir_engineering: "🛢️",
  underground_gas_storage: "🛢️",
  gas_storage: "🛢️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊",
};

export function DomainEngineCard({
  view,
  onDetails,
  onInstall,
  onConfigure,
  onRefresh,
  installTask,
}: {
  view: DomainEngineView;
  onDetails: () => void;
  onInstall?: () => void;
  onConfigure?: () => void;
  onRefresh?: () => void;
  installTask?: RuntimeInstallTask | null;
}) {
  const React = getHost().React;
  const { Card, Tag, Typography, Button, Modal, Tooltip } = getHost().antd;
  const { Text } = Typography;
  const [functionsOpen, setFunctionsOpen] = React.useState(false);
  const def = view.definition;
  const presentation = ENGINE_PRESENTATIONS[def.id];
  const busy =
    installTask?.status === "queued" || installTask?.status === "running";
  const pythonInstallable =
    def.id !== "neqsim" &&
    view.effectiveStatus === "unavailable" &&
    def.dependencies.length > 0 &&
    def.dependencies.every((name) => !/(three\.js|java|neqsim)/i.test(name));
  const primary = busy
    ? { label: "查看安装进度", action: onInstall, disabled: false }
    : def.id === "neqsim" && view.effectiveStatus === "needs_install"
    ? {
        label: "安装 NeqSim 运行环境",
        action: onInstall,
        disabled: false,
      }
    : view.effectiveStatus === "needs_install" || pythonInstallable
    ? {
        label: "安装运行环境",
        action: onInstall,
        disabled: false,
      }
    : view.effectiveStatus === "unconfigured" ||
      view.effectiveStatus === "partial"
    ? { label: "启用工具", action: onConfigure, disabled: false }
    : view.effectiveStatus === "error" || view.effectiveStatus === "unknown"
    ? { label: "重新检测", action: onRefresh, disabled: false }
    : null;

  return React.createElement(
    Card,
    {
      size: "small",
      style: { width: "100%", minWidth: 0 },
      styles: {
        body: { minWidth: 0, display: "flex", flexDirection: "column" },
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          minWidth: 0,
        },
      },
      React.createElement(
        "span",
        {
          "aria-hidden": true,
          style: {
            display: "grid",
            placeItems: "center",
            flex: "0 0 36px",
            width: 36,
            height: 36,
            borderRadius: 9,
            fontSize: 20,
            background: "var(--ant-color-fill-tertiary, rgba(127,127,127,.12))",
          },
        },
        DOMAIN_ICONS[def.domain] || "📦",
      ),
      React.createElement(
        "div",
        { style: { flex: 1, minWidth: 0 } },
        React.createElement(
          Text,
          {
            strong: true,
            style: {
              display: "block",
              fontSize: 14,
              lineHeight: "21px",
              overflowWrap: "anywhere",
            },
          },
          def.name,
        ),
        React.createElement(
          "div",
          { style: { marginTop: 3 } },
          React.createElement(
            Tooltip,
            { title: `${view.statusDescription} 该状态未包含实际试算验证。` },
            React.createElement(
              Tag,
              {
                color: STATUS_COLORS[view.effectiveStatus] || "default",
                tabIndex: 0,
              },
              STATUS_LABELS[view.effectiveStatus] || view.effectiveStatus,
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      Text,
      {
        type: "secondary",
        style: {
          display: "block",
          marginTop: 10,
          fontSize: 13,
          lineHeight: "20px",
          overflowWrap: "anywhere",
        },
      },
      presentation?.description || def.description || "暂无领域说明",
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 5,
          marginTop: 10,
          padding: "8px 10px",
          borderRadius: 8,
          background: "var(--ant-color-fill-quaternary, rgba(127,127,127,.07))",
        },
      },
      React.createElement(
        Text,
        {
          type: "secondary",
          style: { fontSize: 12, lineHeight: "18px", overflowWrap: "anywhere" },
        },
        `输入 · ${presentation?.inputs || "输入信息未提供"}`,
      ),
      React.createElement(
        Text,
        {
          type: "secondary",
          style: { fontSize: 12, lineHeight: "18px", overflowWrap: "anywhere" },
        },
        `输出 · ${presentation?.outputs || "输出信息未提供"}`,
      ),
    ),
    installTask && busy
      ? React.createElement(
          Text,
          {
            type: "secondary",
            role: "status",
            style: { marginTop: 8, fontSize: 12, lineHeight: "18px" },
          },
          installTask.message || "运行环境安装中…",
        )
      : null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginTop: "auto",
          paddingTop: 10,
        },
      },
      React.createElement(
        Button,
        {
          type: "link",
          size: "small",
          "aria-label": `查看 ${def.name} 的函数`,
          onClick: () => setFunctionsOpen(true),
        },
        `查看函数 · ${def.operations.length}`,
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 4,
            marginLeft: "auto",
          },
        },
        primary
          ? React.createElement(
              Button,
              {
                size: "small",
                type: "primary",
                disabled: primary.disabled || !primary.action,
                loading: false,
                "aria-label": primary.label,
                onClick: primary.action,
              },
              primary.label,
            )
          : null,
        React.createElement(
          Button,
          {
            size: "small",
            "aria-label": `查看 ${def.name} 详情`,
            onClick: onDetails,
          },
          "查看详情",
        ),
      ),
    ),
    React.createElement(
      Modal,
      {
        title: `${def.name} · 函数说明`,
        open: functionsOpen,
        onCancel: () => setFunctionsOpen(false),
        width: "min(720px, calc(100vw - 32px))",
        destroyOnHidden: true,
        footer: React.createElement(
          Button,
          {
            onClick: () => setFunctionsOpen(false),
            "aria-label": "关闭函数说明",
          },
          "关闭",
        ),
        styles: { body: { maxHeight: "65vh", overflowY: "auto" } },
      },
      React.createElement(OperationList, { operations: def.operations }),
    ),
  );
}
