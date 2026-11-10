import { useWorkflowI18n } from "./i18n";
import React, { useEffect, useState } from "react";
import type { Api } from "./model";
interface AgentSummary {
  id: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  startup_status?: string;
  available_in_chat?: boolean;
  managed_by_app?: string | null;
}

/** Uses the host registry, scoped to the current inspector lifetime. */
export function AgentField({
  value,
  onChange,
  api,
  antd,
  agentId,
  scopeKey,
  id,
}: {
  value: unknown;
  onChange: (value: string | undefined) => void;
  api: Api;
  antd: any;
  agentId: string;
  scopeKey: string;
  id: string;
}): React.ReactElement {
  const { t } = useWorkflowI18n();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    key: string;
    status: "loading" | "ready" | "error";
    agents: AgentSummary[];
    error?: string;
  }>({
    key: "",
    status: "loading",
    agents: [],
  });
  const key = `${scopeKey}:${agentId}:${attempt}`;
  const current: typeof state =
    state.key === key
      ? state
      : {
          key,
          status: "loading",
          agents: [],
        };
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState({
      key,
      status: "loading",
      agents: [],
    });
    api<{
      agents: AgentSummary[];
    }>("/agents", {
      signal: controller.signal,
      headers: {
        "X-Agent-Id": agentId,
      },
    })
      .then((result) => {
        if (!active) return;
        if (
          !Array.isArray(result?.agents) ||
          result.agents.some((entry) => !entry || typeof entry.id !== "string")
        )
          throw new Error("智能体目录响应无效");
        setState({
          key,
          status: "ready",
          agents: result.agents.filter(
            (entry) =>
              entry.available_in_chat !== false && !entry.managed_by_app,
          ),
        });
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        setState({
          key,
          status: "error",
          agents: [],
          error: error instanceof Error ? error.message : String(error),
        });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [api, agentId, key]);
  const selectedId = typeof value === "string" && value ? value : undefined;
  const selected = current.agents.find((entry) => entry.id === selectedId);
  const statusText = (agent: AgentSummary) =>
    agent.enabled === false
      ? t("已停用")
      : agent.startup_status === "failed"
      ? t("启动失败")
      : agent.startup_status === "starting"
      ? t("启动中")
      : agent.startup_status === "pending"
      ? t("等待启动")
      : t("已启用");
  const options = current.agents.map((agent) => ({
    value: agent.id,
    label: `${agent.name || agent.id} · ${statusText(agent)}`,
    disabled: agent.enabled === false,
    title: `${agent.description || ""}${agent.description ? " · " : ""}${
      agent.id
    }`,
  }));
  if (selectedId && !selected)
    options.unshift({
      value: selectedId,
      label: `${selectedId} · ${
        current.status === "ready"
          ? t("当前目录不可用，原值已保留")
          : t("已保存，待确认")
      }`,
      disabled: true,
      title: selectedId,
    });
  return (
    <div>
      <antd.Select
        id={id}
        aria-label={t("执行智能体")}
        value={selectedId}
        options={options}
        loading={current.status === "loading"}
        showSearch
        optionFilterProp="label"
        allowClear
        placeholder={t("选择执行任务的智能体")}
        style={{
          width: "100%",
        }}
        onChange={onChange}
        notFoundContent={
          current.status === "loading"
            ? t("正在加载智能体…")
            : t("没有可选智能体")
        }
      />
      {current.status === "loading" && (
        <div role="status">{t("正在加载智能体…")}</div>
      )}
      {current.status === "error" && (
        <div
          role="alert"
          style={{
            color: "var(--ant-color-error)",
            marginTop: 6,
          }}
        >
          {t("智能体加载失败：")}
          {t(current.error || "")}
          {t("。已保存的选择不会改变。")}
          <antd.Button
            size="small"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {t("重新加载智能体")}
          </antd.Button>
        </div>
      )}
      {current.status === "ready" && selectedId && !selected && (
        <div role="alert">
          {t(
            "当前目录中找不到该智能体，可能已删除或不可访问。请选择其他智能体，或检查宿主配置。",
          )}
        </div>
      )}
      {selected && (
        <div
          style={{
            color: "var(--ant-color-text-secondary)",
            marginTop: 6,
          }}
        >
          {selected.description || t("该智能体未填写用途说明")}
          {selected.enabled === false &&
            t("；该智能体已停用，请启用或重新选择。")}
          {selected.startup_status === "failed" &&
            t("；该智能体启动失败，请先检查宿主状态。")}
        </div>
      )}
      {current.status === "ready" &&
        current.agents.length === 0 &&
        !selectedId && (
          <div role="status">
            {t("当前没有可选智能体，请先在宿主中创建或启用。")}
          </div>
        )}
    </div>
  );
}
