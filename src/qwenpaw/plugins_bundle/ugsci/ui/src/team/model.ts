import { hostFetch } from "../core/runtime";

export interface ExpertTeamMember {
  name: string;
  role: string;
  emoji: string;
  agentId?: string;
  roleKey?: string;
  bindingMode?: "fixed" | "preferred" | "temporary";
}

export interface ExpertTeamStep {
  agentName: string;
  instruction: string;
  passContext: boolean;
}

export type TeamMode =
  | "pipeline"
  | "roundtable"
  | "coordinator"
  | "router"
  | "review_loop"
  | "debate";

export interface ExpertTeam {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  mode: TeamMode;
  members: ExpertTeamMember[];
  coordinatorName?: string;
  taskTemplate: string;
  orchestrationPrompt: string;
  steps?: ExpertTeamStep[];
  custom?: boolean;
  createdAt?: number;
  updatedAt?: number;
  version?: number;
  maxReviewRounds?: number;
  routingInstruction?: string;
  successCriteria?: string;
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

/** Read the legacy/offline team cache for migration or explicit recovery. */
export function loadCachedCustomTeams(): ExpertTeam[] {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(CUSTOM_TEAMS_STORAGE_KEY) || "[]",
    ) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isExpertTeam) : [];
  } catch {
    return [];
  }
}

/** Write the legacy/offline team cache; it is never the normal read source. */
export function saveCachedCustomTeams(teams: ExpertTeam[]): void {
  try {
    localStorage.setItem(CUSTOM_TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch {
    // Custom teams remain usable for this session if storage is unavailable.
  }
}

/** @deprecated Use loadCachedCustomTeams; backend data is the source of truth. */
export function loadCustomTeams(): ExpertTeam[] {
  return loadCachedCustomTeams();
}

/** @deprecated Use saveCachedCustomTeams; backend data is the source of truth. */
export function saveCustomTeams(teams: ExpertTeam[]): void {
  saveCachedCustomTeams(teams);
}

function teamPayload(team: ExpertTeam): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: team.id,
    name: team.name,
    description: team.description,
    emoji: team.emoji,
    category: team.category,
    mode: team.mode,
    members: team.members,
    steps: team.steps || [],
    orchestrationPrompt: team.orchestrationPrompt,
    coordinatorName: team.coordinatorName || undefined,
    taskTemplate: team.taskTemplate,
    maxReviewRounds: team.maxReviewRounds || 2,
    routingInstruction: team.routingInstruction || "",
    successCriteria: team.successCriteria || "",
  };
  if (team.updatedAt) {
    // The API stores timestamps in seconds while the UI uses milliseconds.
    payload.expectedUpdatedAt = team.updatedAt / 1000;
  }
  if (team.version) {
    payload.expectedVersion = team.version;
  }
  return payload;
}

interface StoredExpertTeam {
  team_id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  mode: TeamMode;
  members: ExpertTeamMember[];
  steps: ExpertTeamStep[];
  orchestrationPrompt: string;
  coordinatorName?: string;
  taskTemplate: string;
  maxReviewRounds: number;
  routingInstruction: string;
  successCriteria: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

function fromStoredTeam(team: StoredExpertTeam): ExpertTeam {
  return {
    id: team.team_id,
    name: team.name,
    emoji: team.emoji || "🤝",
    category: team.category || "自定义",
    description: team.description || `${team.name}（${team.members.length} 位专家）`,
    mode: team.mode,
    members: team.members,
    steps: team.steps,
    orchestrationPrompt: team.orchestrationPrompt || "",
    coordinatorName: team.coordinatorName,
    taskTemplate: team.taskTemplate || "请执行以下任务：\n任务描述：{任务描述}",
    maxReviewRounds: team.maxReviewRounds || 2,
    routingInstruction: team.routingInstruction || "",
    successCriteria: team.successCriteria || "",
    createdAt: team.createdAt ? team.createdAt * 1000 : Date.now(),
    updatedAt: team.updatedAt ? team.updatedAt * 1000 : Date.now(),
    version: team.version || 1,
    custom: true,
  };
}

export async function fetchCustomTeams(
  updateOfflineCache = true,
): Promise<ExpertTeam[]> {
  const response = await hostFetch("/ugsci/team/custom");
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `HTTP ${response.status}`);
  }
  const records = (await response.json()) as StoredExpertTeam[];
  const teams = records.map(fromStoredTeam);
  if (updateOfflineCache) {
    saveCachedCustomTeams(teams); // Cache only; backend remains source of truth.
  }
  return teams;
}

export async function saveCustomTeamToBackend(
  team: ExpertTeam,
): Promise<ExpertTeam> {
  const response = await hostFetch("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teamPayload(team)),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `HTTP ${response.status}`);
  }
  const result = (await response.json()) as { team_id: string };
  return { ...team, id: result.team_id };
}

export async function deleteCustomTeamFromBackend(teamId: string): Promise<void> {
  const response = await hostFetch(
    `/ugsci/team/custom/${encodeURIComponent(teamId)}`,
    { method: "DELETE" },
  );
  if (!response.ok && response.status !== 404) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `HTTP ${response.status}`);
  }
}

export async function migrateCachedCustomTeams(): Promise<void> {
  const cached = loadCachedCustomTeams();
  if (cached.length === 0) return;
  // Read without mutating the offline cache. If any upload fails, every
  // not-yet-migrated legacy definition remains recoverable locally.
  const existing = await fetchCustomTeams(false);
  const existingIds = new Set(existing.map((team) => team.id));
  await Promise.all(
    cached
      .filter((team) => !existingIds.has(team.id))
      .map((team) => saveCustomTeamToBackend(team)),
  );
}

/**
 * Consume the SSE response from POST /console/chat until we can confirm
 * that the workflow has been activated (agent started producing output)
 * or an error event is received.
 *
 * BUG-008: The previous implementation only checked response.ok and
 * discarded the streaming body. FastAPI returns HTTP 200 before the
 * agent processes the slash command, so parse failures and agent errors
 * — which arrive as SSE events — were silently ignored.
 *
 * We stop reading as soon as we see a content/response event (workflow
 * activated) or an error event. The backend continues processing after
 * the client stops reading; the chat page will reconnect to the stream
 * when the user navigates to it.
 */
async function _consumeSseUntilActivated(
  response: Response,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse complete SSE event blocks (separated by \n\n).
      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);

        for (const line of block.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);

          let payload: Record<string, unknown>;
          try {
            payload = JSON.parse(raw) as Record<string, unknown>;
          } catch {
            continue; // Non-JSON SSE line — skip.
          }

          // Error event — backend sent an explicit error.
          if (payload.error) {
            const errVal = payload.error;
            const msg =
              typeof errVal === "string"
                ? errVal
                : (errVal as { message?: string })?.message ||
                  "工作流启动失败";
            throw new Error(msg);
          }

          // Response event — check for failure status.
          if (
            payload.object === "response" ||
            payload.type === "response"
          ) {
            const status = payload.status as string;
            if (status === "failed" || status === "error") {
              const msg =
                (payload.error as { message?: string })?.message ||
                "工作流启动失败";
              throw new Error(msg);
            }
            // Any other response status means the workflow has been
            // activated — stop reading and return success.
            return;
          }

          // Content / message event — the agent has started producing
          // output, confirming the workflow is active.
          if (
            payload.object === "content" ||
            payload.type === "message"
          ) {
            return;
          }
        }
      }
    }
  } finally {
    // Release the reader lock. We intentionally do NOT abort the fetch
    // — the backend continues processing and the chat page will
    // reconnect to the running stream.
    reader.releaseLock();
  }
}

export async function sendTeamMessage(
  agentId: string,
  messageText: string,
  teamName?: string,
): Promise<string> {
  // BUG-008: Previously, sendTeamMessage generated a random session ID,
  // sent a fire-and-forget POST to /console/chat, and only checked the
  // HTTP status. Two problems:
  //   1. The SSE body was never read, so slash-command parse failures
  //      and agent errors (sent as SSE events) were silently ignored.
  //   2. The random session ID was never bound to the UI; navigating
  //      to /chat landed the user on a different (stale) session.
  //
  // Fix: create a proper chat via POST /chats so it appears in the
  // session list, send the message with stream:true, consume the SSE
  // to detect errors, and return the chat UUID for navigation.

  const sessionId = `console:default:team-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  // 1. Create a chat session so it shows up in the session drawer.
  const createResponse = await hostFetch("/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": agentId,
    },
    body: JSON.stringify({
      session_id: sessionId,
      user_id: "default",
      channel: "console",
      name: teamName ? `团队：${teamName}` : "团队任务",
    }),
  });
  if (!createResponse.ok) {
    const detail = await createResponse.text().catch(() => "");
    throw new Error(
      detail || `创建会话失败 (HTTP ${createResponse.status})`,
    );
  }
  const chat = (await createResponse.json()) as { id: string };
  const chatId = chat.id;

  // 2. Send the slash command with stream:true so we can consume SSE.
  const response = await hostFetch("/console/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": agentId,
    },
    body: JSON.stringify({
      channel: "console",
      user_id: "default",
      session_id: sessionId,
      stream: true,
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

  // 3. Consume SSE until the workflow is confirmed active or an error
  //    is received. Only after confirmation do we report success.
  await _consumeSseUntilActivated(response);

  // 4. Return the chat ID so the caller can navigate to /chat/{chatId}.
  return chatId;
}

export async function registerCustomTeam(
  team: ExpertTeam,
): Promise<string> {
  /** Register a custom team definition on the backend and return its team_id.
   *  The team_id is a whitespace-free token used in the /ugsci-team slash
   *  command as @<team_id>, avoiding the name-with-spaces parsing problem. */
  const response = await hostFetch("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teamPayload(team)),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `HTTP ${response.status}`);
  }
  const data = await response.json() as { team_id: string };
  return data.team_id;
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
