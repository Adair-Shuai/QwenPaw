import { hostFetch } from "../core/runtime";
import type { TeamMode } from "./model";
import type * as ReactTypes from "react";

type ReactElementType = ReactTypes.ElementType;

export type TeamPhase =
  | "plan"
  | "dispatch"
  | "verify"
  | "synthesize"
  | "completed";

export interface TeamMember {
  name: string;
  role: string;
  emoji?: string;
}

export interface TeamWorkflowState {
  current_phase?: TeamPhase;
  team_id?: string;
  team_name?: string;
  team_mode?: TeamMode;
  members?: TeamMember[];
  task?: string;
  iteration?: number;
  verify_retries?: number;
  dispatch_retries?: number;
  merge_waits?: number;
  workflow_status?: "active" | "completed" | "terminated";
  termination_reason?: string;
}

export interface TeamWorkflowResponse {
  active: boolean;
  status: "idle" | "active" | "completed" | "terminated" | "unreadable";
  state: TeamWorkflowState;
  instance_id?: string | null;
  error?: string | null;
}

export interface TeamRunSummary {
  instance_id: string;
  team_id: string;
  team_name: string;
  team_mode: TeamMode;
  status: "active" | "completed" | "terminated" | "unreadable";
  current_phase: TeamPhase;
  iteration: number;
  task: string;
  created_at_ns: number;
  finished_at_ns: number;
}

export interface PresetTeam {
  id: string;
  name: string;
  emoji: string;
  category: string;
  mode: TeamMode;
  description: string;
  members: TeamMember[];
  coordinatorName?: string;
  taskTemplate: string;
  orchestrationPrompt: string;
}

export interface RoleDefinition {
  key: string;
  display_name: string;
  allowed_tools: string[] | null;
  skills: string[] | null;
  prompt: string;
}

interface AntdHost {
  Card: ReactElementType;
  Tag: ReactElementType;
  Typography: {
    Text: ReactElementType;
    Paragraph: ReactElementType;
  };
  Button: ReactElementType;
  Steps: ReactElementType;
  Empty: ReactElementType;
  Alert: ReactElementType;
  Spin: ReactElementType;
}

interface QwenPawHost {
  React: typeof ReactTypes;
  antd: AntdHost;
  antdIcons?: {
    ReloadOutlined?: ReactElementType;
  };
  useSelectedAgent?: () => { id: string };
}

function getHost(): QwenPawHost {
  const host = (
    window as Window & {
      QwenPaw?: { host?: unknown };
    }
  ).QwenPaw?.host;
  if (!host) throw new Error("[ugsci] QwenPaw.host not available");
  return host as QwenPawHost;
}

async function fetchJson<T>(
  path: string,
  agentId?: string,
  signal?: AbortSignal,
): Promise<T | null> {
  try {
    const response = await hostFetch(path, {
      headers: agentId ? { "X-Agent-Id": agentId } : undefined,
      signal,
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function fetchTeamWorkflowState(
  agentId: string,
  signal?: AbortSignal,
): Promise<TeamWorkflowResponse | null> {
  return fetchJson<TeamWorkflowResponse>("/ugsci/team/state", agentId, signal);
}

export async function fetchTeamRuns(
  agentId: string,
  signal?: AbortSignal,
): Promise<TeamRunSummary[]> {
  const response = await hostFetch("/ugsci/team/runs", {
    headers: { "X-Agent-Id": agentId },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to load team runs: ${response.status}`);
  }
  return (await response.json()) as TeamRunSummary[];
}

export function TeamRunHistory({ activeOnly = false }: { activeOnly?: boolean }) {
  const host = getHost();
  const React = host.React;
  const { useCallback, useEffect, useRef, useState } = React;
  const { Alert, Button, Card, Empty, Spin, Tag, Typography } = host.antd;
  const { Text, Paragraph } = Typography;
  const selectedAgent = host.useSelectedAgent
    ? host.useSelectedAgent()
    : { id: "default" };
  const agentId = selectedAgent?.id || "default";
  const [runs, setRuns] = useState<TeamRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const requestControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const result = await fetchTeamRuns(agentId, controller.signal);
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      setRuns(result);
      setFailed(false);
    } catch {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      setFailed(true);
    } finally {
      if (!controller.signal.aborted && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [agentId]);

  useEffect(() => {
    void load();
    return () => {
      requestControllerRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, [load]);

  if (loading) return React.createElement(Spin);
  if (failed) {
    return React.createElement(Alert, {
      type: "warning",
      message: "讨论运行记录加载失败",
      action: React.createElement(Button, { size: "small", onClick: () => void load() }, "重试"),
    });
  }
  const visibleRuns = runs.filter((run) =>
    activeOnly ? run.status === "active" : run.status !== "active",
  );
  if (visibleRuns.length === 0) {
    return React.createElement(Empty, {
      description: activeOnly ? "暂无进行中的专家团讨论" : "暂无历史讨论",
    });
  }
  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...visibleRuns.map((run) =>
      React.createElement(
        Card,
        { key: run.instance_id, size: "small" },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          React.createElement(Text, { strong: true }, run.team_name || run.team_id),
          React.createElement(Tag, { color: run.status === "completed" ? "green" : run.status === "terminated" ? "orange" : "blue" }, run.status),
          React.createElement(Tag, null, run.current_phase),
          React.createElement(Text, { type: "secondary" }, `迭代 ${run.iteration}`),
        ),
        React.createElement(Paragraph, { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } }, run.task || "暂无任务描述"),
      ),
    ),
  );
}

export async function fetchPresetTeamsFromBackend(): Promise<
  PresetTeam[] | null
> {
  const response = await fetchJson<{ teams: PresetTeam[] }>(
    "/ugsci/team/preset-teams",
  );
  return response?.teams ?? null;
}

export async function fetchUgsciRoles(): Promise<RoleDefinition[] | null> {
  const response = await fetchJson<{ roles: RoleDefinition[] }>(
    "/ugsci/team/roles",
  );
  return response?.roles ?? null;
}

const PHASE_LABELS: Record<
  TeamPhase,
  { label: string; color: string; icon: string }
> = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" },
};

const PHASE_ORDER: TeamPhase[] = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed",
];
const TEAM_STATE_MAX_FAILURES = 3;

export function TeamWorkflowCard() {
  const host = getHost();
  const React = host.React;
  const { useState, useEffect, useCallback, useRef } = React;
  const { Card, Tag, Typography, Button, Steps, Empty, Alert } = host.antd;
  const { ReloadOutlined } = host.antdIcons || {};
  const { Text, Paragraph } = Typography;
  const selectedAgent = host.useSelectedAgent
    ? host.useSelectedAgent()
    : { id: "default" };
  const agentId = selectedAgent?.id || "default";

  const [response, setResponse] = useState<TeamWorkflowResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const responseRef = useRef<TeamWorkflowResponse | null>(null);
  const failCountRef = useRef(0);
  const requestIdRef = useRef(0);
  const requestControllerRef = useRef<AbortController | null>(null);

  const loadState = useCallback(
    async (showLoading: boolean) => {
      requestControllerRef.current?.abort();
      const controller = new AbortController();
      requestControllerRef.current = controller;
      const requestId = ++requestIdRef.current;
      if (showLoading) setLoading(true);
      const result = await fetchTeamWorkflowState(agentId, controller.signal);
      if (controller.signal.aborted || requestId !== requestIdRef.current)
        return;
      if (result) {
        failCountRef.current = 0;
        responseRef.current = result;
        setResponse(result);
      } else {
        failCountRef.current += 1;
      }
      setLoading(false);
    },
    [agentId],
  );

  const refresh = useCallback(() => loadState(true), [loadState]);

  useEffect(() => {
    requestControllerRef.current?.abort();
    requestIdRef.current += 1;
    failCountRef.current = 0;
    responseRef.current = null;
    setResponse(null);
    void refresh();

    const interval = window.setInterval(() => {
      if (failCountRef.current >= TEAM_STATE_MAX_FAILURES) return;
      if (
        responseRef.current?.status === "completed" ||
        responseRef.current?.status === "terminated"
      )
        return;
      void loadState(false);
    }, 5000);
    return () => {
      window.clearInterval(interval);
      requestControllerRef.current?.abort();
      requestIdRef.current += 1;
    };
  }, [agentId, loadState, refresh]);

  if (response?.status === "unreadable") {
    return React.createElement(Alert, {
      type: "warning",
      showIcon: true,
      message: "专家团状态暂时无法读取",
      description: `实例 ${
        response.instance_id || "未知"
      } 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: React.createElement(
        Button,
        { size: "small", onClick: refresh, loading },
        "重试",
      ),
    });
  }

  if (!response || !response.active) {
    if (response?.status === "completed" || response?.status === "terminated") {
      const completed = response.status === "completed";
      return React.createElement(Alert, {
        type: completed ? "success" : "info",
        showIcon: true,
        message: completed ? "专家团工作流已完成" : "专家团工作流已终止",
        description: completed
          ? `实例 ${
              response.instance_id || "未知"
            } 已完成，结果文件保留在工作区。`
          : `原因：${response.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 },
      });
    }
    return React.createElement(Empty, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 },
    });
  }

  const state = response.state;
  const phase = state.current_phase || "plan";
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const teamName = state.team_name || "未知团队";
  const teamMode = state.team_mode || "pipeline";
  const iteration = state.iteration || 0;
  const members = state.members || [];
  const verifyRetries = state.verify_retries || 0;
  const modeLabels: Record<string, string> = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证",
  };

  return React.createElement(
    Card,
    {
      size: "small",
      style: { marginBottom: 16 },
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("span", { style: { fontSize: 16 } }, "🔄"),
        React.createElement(Text, { strong: true }, `${teamName} — 工作流状态`),
        React.createElement(
          Tag,
          { color: "blue", style: { fontSize: 10 } },
          modeLabels[teamMode] || teamMode,
        ),
        React.createElement(
          Tag,
          { style: { fontSize: 10 } },
          `迭代 ${iteration}`,
        ),
        verifyRetries > 0
          ? React.createElement(
              Tag,
              { color: "orange", style: { fontSize: 10 } },
              `验证重试 ${verifyRetries}`,
            )
          : null,
      ),
      extra: React.createElement(
        Button,
        {
          size: "small",
          type: "text",
          icon: ReloadOutlined
            ? React.createElement(ReloadOutlined)
            : undefined,
          onClick: refresh,
          loading,
        },
        "刷新",
      ),
    },
    React.createElement(Steps, {
      current: phaseIndex,
      size: "small",
      items: PHASE_ORDER.map((itemPhase) => {
        const info = PHASE_LABELS[itemPhase];
        return {
          title: `${info.icon} ${info.label}`,
          description:
            itemPhase === "plan"
              ? "分析任务，创建任务分解"
              : itemPhase === "dispatch"
              ? "分派专家执行任务"
              : itemPhase === "verify"
              ? "交叉验证专家结果"
              : itemPhase === "synthesize"
              ? "综合形成最终报告"
              : "工作流完成",
        };
      }),
    }),
    React.createElement(
      "div",
      {
        style: {
          marginTop: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        },
      },
      ...members.map((member, index) =>
        React.createElement(
          Tag,
          { key: `${member.name}-${index}`, style: { fontSize: 11 } },
          `${member.emoji || ""} ${member.name}（${member.role}）`,
        ),
      ),
    ),
    state.task
      ? React.createElement(
          Paragraph,
          {
            style: {
              fontSize: 12,
              marginTop: 8,
              marginBottom: 0,
              color: "var(--ant-color-text-secondary, #666)",
            },
            ellipsis: { rows: 2 },
          },
          `任务: ${state.task}`,
        )
      : null,
  );
}
