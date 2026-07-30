import { apiUrl, authHeaders } from "../core/runtime";

export interface ExpertTeamMember {
  name: string;
  role: string;
  emoji: string;
}

export interface ExpertTeamStep {
  agentName: string;
  instruction: string;
  passContext: boolean;
}

export interface ExpertTeam {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  mode: "coordinator" | "pipeline" | "roundtable";
  members: ExpertTeamMember[];
  coordinatorName?: string;
  taskTemplate: string;
  orchestrationPrompt: string;
  steps?: ExpertTeamStep[];
  custom?: boolean;
  createdAt?: number;
}

export interface TeamAgentSummary {
  id: string;
  name: string;
}

const CUSTOM_TEAMS_STORAGE_KEY = "ugsci_custom_teams";

function isExpertTeam(value: unknown): value is ExpertTeam {
  if (!value || typeof value !== "object") return false;
  const team = value as Partial<ExpertTeam>;
  return (
    typeof team.id === "string" &&
    typeof team.name === "string" &&
    typeof team.taskTemplate === "string" &&
    typeof team.orchestrationPrompt === "string" &&
    Array.isArray(team.members)
  );
}

export function loadCustomTeams(): ExpertTeam[] {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(CUSTOM_TEAMS_STORAGE_KEY) || "[]",
    ) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isExpertTeam) : [];
  } catch {
    return [];
  }
}

export function saveCustomTeams(teams: ExpertTeam[]): void {
  try {
    localStorage.setItem(CUSTOM_TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch {
    // Custom teams remain usable for this session if storage is unavailable.
  }
}

export async function sendTeamMessage(
  agentId: string,
  messageText: string,
): Promise<void> {
  const response = await fetch(apiUrl("/console/chat"), {
    method: "POST",
    headers: {
      ...authHeaders(),
      "X-Agent-Id": agentId,
    },
    body: JSON.stringify({
      channel: "console",
      user_id: "default",
      session_id: `team-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      input: [
        {
          role: "user",
          content: [{ type: "text", text: messageText }],
        },
      ],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `HTTP ${response.status}`);
  }
}

export function findAgentIdByName(
  agents: TeamAgentSummary[],
  name: string,
): string | null {
  const compactName = name.replace(/\s+/g, "");
  const exact = agents.find(
    (agent) =>
      agent.name === name || agent.name.replace(/\s+/g, "") === compactName,
  );
  if (exact) return exact.id;
  return (
    agents.find(
      (agent) =>
        agent.name.includes(name) ||
        name.includes(agent.name) ||
        agent.name.replace(/\s+/g, "").includes(compactName),
    )?.id || null
  );
}

export function buildTeamMessage(team: ExpertTeam): string {
  const memberList = team.members
    .map((member) => `- ${member.name}（${member.role}）`)
    .join("\n");

  if (team.custom && team.steps && team.steps.length > 0) {
    const stepList = team.steps
      .map((step, index) => {
        const contextNote = step.passContext
          ? "（传递上一步的结果作为上下文）"
          : "（独立执行，不传递上下文）";
        return `${index + 1}. 向「${step.agentName}」发送请求：${
          step.instruction
        } ${contextNote}`;
      })
      .join("\n");
    const modeDescription =
      team.mode === "pipeline"
        ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家："
        : team.mode === "roundtable"
        ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合："
        : `你是团队协调者（${
            team.coordinatorName || team.members[0]?.name || ""
          }），请按需调用以下专家完成任务：`;

    return `${modeDescription}

---

## 团队任务

${team.taskTemplate}

---

## 执行步骤

${stepList}

---

## 团队成员

${memberList}

---

请现在开始执行团队任务。首先使用 list_agents() 确认可用专家，然后按照上述步骤依次/同时咨询各成员。每步结果请明确标注来自哪位专家。`;
  }

  return `${team.orchestrationPrompt}

---

## 团队任务

${team.taskTemplate}

---

## 团队成员

${memberList}

---

请现在开始执行团队任务。首先使用 list_agents() 查看可用专家，然后按照上述流程依次咨询各成员。`;
}
