import { apiFetch } from "../core/runtime";
import { getHost } from "../core/runtime";

type GenUiConfig = {
  enabled: boolean;
  persisted_enabled: boolean;
  overridden: boolean;
  channels: string[];
  allow_html: boolean;
  allow_actions: string[];
  backend_unavailable?: boolean;
};

const DEGRADED_CONFIG: GenUiConfig = {
  enabled: true,
  persisted_enabled: true,
  overridden: false,
  channels: ["response.append"],
  allow_html: false,
  allow_actions: [],
  backend_unavailable: true,
};

function publishConfig(value: GenUiConfig): void {
  const QP = (window as any).QwenPaw;
  if (QP) QP.genui = { ...(QP.genui || {}), config: value };
}

export function GenUiSettingsPage() {
  const React = getHost().React;
  const { Alert, Card, Space, Spin, Switch, Typography, message } = getHost().antd;
  const { useEffect, useState } = React;
  const [config, setConfig] = useState(null as GenUiConfig | null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    const load = (notify = false) => {
      apiFetch<GenUiConfig>("/ugsci/genui/config")
        .then((value) => { if (active) { setConfig(value); publishConfig(value); } })
        .catch((error) => {
          if (!active) return;
          setConfig(DEGRADED_CONFIG);
          publishConfig(DEGRADED_CONFIG);
          if (notify) message.error(String(error));
          retryTimer = setTimeout(() => load(false), 30_000);
        });
    };
    load(true);
    return () => { active = false; if (retryTimer) clearTimeout(retryTimer); };
  }, []);

  const update = async (enabled: boolean) => {
    setSaving(true);
    try {
      const value = await apiFetch<GenUiConfig>("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      setConfig(value);
      publishConfig(value);
      message.success(value.overridden
        ? "设置已保存，但环境变量或插件配置正在覆盖它"
        : enabled ? "GenUI 已开启" : "GenUI 已关闭");
    } catch (error) {
      message.error(`保存 GenUI 设置失败：${String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return React.createElement(
    "div",
    { style: { padding: 24, maxWidth: 880 } },
    React.createElement(Typography.Title, { level: 2 }, "GenUI 设置"),
    React.createElement(
      Typography.Paragraph,
      { type: "secondary" },
      "控制 UGSci 的生成式界面能力。该设置对所有 Agent 生效，新安装时默认开启。",
    ),
    React.createElement(
      Card,
      null,
      config === null
        ? React.createElement(Spin)
        : React.createElement(
            Space,
            { direction: "vertical", size: 16, style: { width: "100%" } },
            React.createElement(
              Space,
              { style: { width: "100%", justifyContent: "space-between" } },
              React.createElement(
                "div",
                null,
                React.createElement(Typography.Text, { strong: true }, "启用 GenUI"),
                React.createElement(
                  Typography.Paragraph,
                  { type: "secondary", style: { margin: "4px 0 0" } },
                  "允许 Agent 生成卡片、表格、图表、表单，并在对话中交互和增量更新。",
                ),
              ),
              React.createElement(Switch, {
                checked: config.persisted_enabled,
                loading: saving,
                disabled: config.backend_unavailable,
                onChange: update,
              }),
            ),
            React.createElement(Alert, {
              type: config.backend_unavailable ? "error" : config.enabled ? "success" : "warning",
              showIcon: true,
              message: config.backend_unavailable
                ? "UGSci 后端当前不可用，正在使用兼容降级模式；设置不会写入。"
                : config.enabled
                ? "GenUI 当前有效；各 Agent 仍可显式关闭自己的 GenUI 工具"
                : config.overridden
                  ? "GenUI 当前被环境变量或插件配置关闭；本地设置已保存但暂不生效。"
                  : "GenUI 已全局关闭；已有界面仍可查看，但 Agent 不会再生成或更新界面。",
            }),
          ),
    ),
  );
}
