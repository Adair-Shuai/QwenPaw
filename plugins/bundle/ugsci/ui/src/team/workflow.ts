import type * as ReactNamespace from "react";

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
  team_mode?: "pipeline" | "coordinator" | "roundtable";
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

export interface PresetTeam {
  id: string;
  name: string;
  emoji: string;
  category: string;
  mode: "pipeline" | "coordinator" | "roundtable";
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
  Card: ReactNamespace.ElementType;
  Tag: ReactNamespace.ElementType;
  Typography: {
    Text: ReactNamespace.ElementType;
    Paragraph: ReactNamespace.ElementType;
  };
  Button: ReactNamespace.ElementType;
  Steps: ReactNamespace.ElementType;
  Empty: ReactNamespace.ElementType;
  Alert: ReactNamespace.ElementType;
}

interface QwenPawHost {
  React: typeof ReactNamespace;
  antd: AntdHost;
  antdIcons?: {
    ReloadOutlined?: ReactNamespace.ElementType;
  };
  getApiUrl: (path: string) => string;
  getApiToken: () => string;
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

function requestHeaders(agentId?: string): Record<string, string> {
  const token = getHost().getApiToken() || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(agentId ? { "X-Agent-Id": agentId } : {}),
  };
}

async function fetchJson<T>(
  path: string,
  agentId?: string,
  signal?: AbortSignal,
): Promise<T | null> {
  try {
    const response = await fetch(getHost().getApiUrl(path), {
      headers: requestHeaders(agentId),
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
    pipeline: "流水线模式",
    coordinator: "协调者模式",
    roundtable: "圆桌讨论",
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
              color: "#666",
            },
            ellipsis: { rows: 2 },
          },
          `任务: ${state.task}`,
        )
      : null,
  );
}
