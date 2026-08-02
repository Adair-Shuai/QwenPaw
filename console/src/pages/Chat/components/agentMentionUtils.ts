import type { AgentSummary } from "../../../api/types/agents";

type DisplayNameResolver = (agent: AgentSummary) => string;
const MENTION_BOUNDARY_CLASS = "\\s,，。；;：:！？!?、()（）\\[\\]【】{}“”\"'";

interface MentionMatch {
  agentId: string;
  token: string;
  start: number;
  end: number;
}

export interface AgentMentionsExtraction {
  agentIds: string[];
  cleanedText: string;
}

export interface AgentAssignment {
  agentId: string;
  mention: string;
  task: string;
}

export interface AgentMentionRange {
  agentId: string;
  label: string;
  start: number;
  end: number;
}

export function withAgentCoordinationContext(
  requestContext: unknown,
): Record<string, unknown> {
  const existing =
    requestContext && typeof requestContext === "object"
      ? (requestContext as Record<string, unknown>)
      : {};
  return { ...existing, agent_coordination_requested: true };
}

export type AgentMentionRangeFinder = (text: string) => AgentMentionRange[];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mentionTokens(
  agent: AgentSummary,
  getDisplayName: DisplayNameResolver,
): string[] {
  return [...new Set([getDisplayName(agent), agent.name, agent.id])]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}

export function removeAgentMention(
  text: string,
  agent: AgentSummary,
  getDisplayName: DisplayNameResolver,
): { found: boolean; text: string } {
  const extracted = extractAgentMentions(text, [agent], getDisplayName);
  return {
    found: extracted.agentIds.length > 0,
    text: extracted.cleanedText,
  };
}

export function extractAgentMentions(
  text: string,
  agents: AgentSummary[],
  getDisplayName: DisplayNameResolver,
): AgentMentionsExtraction {
  const nonOverlapping = findMentionMatches(text, agents, getDisplayName);

  const agentIds = [...new Set(nonOverlapping.map((match) => match.agentId))];
  let cleanedText = text;
  for (const match of [...nonOverlapping].reverse()) {
    cleanedText =
      cleanedText.slice(0, match.start) + cleanedText.slice(match.end);
  }
  cleanedText = cleanedText.replace(/[ \t]{2,}/g, " ").trim();
  return { agentIds, cleanedText };
}

function findMentionMatches(
  text: string,
  agents: AgentSummary[],
  getDisplayName: DisplayNameResolver,
): MentionMatch[] {
  const matches: MentionMatch[] = [];
  for (const agent of agents) {
    for (const token of mentionTokens(agent, getDisplayName)) {
      const pattern = new RegExp(
        `(^|[^A-Za-z0-9._%+\\-])@${escapeRegExp(token)}` +
          `(?=[${MENTION_BOUNDARY_CLASS}]|$)`,
        "g",
      );
      for (const match of text.matchAll(pattern)) {
        const leadingLength = match[1]?.length ?? 0;
        const start = (match.index ?? 0) + leadingLength;
        matches.push({
          agentId: agent.id,
          token,
          start,
          end: start + token.length + 1,
        });
      }
    }
  }

  matches.sort(
    (a, b) => a.start - b.start || b.end - b.start - (a.end - a.start),
  );
  const nonOverlapping: MentionMatch[] = [];
  for (const match of matches) {
    const previous = nonOverlapping[nonOverlapping.length - 1];
    if (previous && match.start < previous.end) continue;
    nonOverlapping.push(match);
  }
  return nonOverlapping;
}

export function findAgentMentionRanges(
  text: string,
  agents: AgentSummary[],
  getDisplayName: DisplayNameResolver,
): AgentMentionRange[] {
  return findMentionMatches(text, agents, getDisplayName).map((match) => ({
    agentId: match.agentId,
    label: `@${match.token}`,
    start: match.start,
    end: match.end,
  }));
}

/** Build the highlight-only Agent matcher once instead of compiling one
 * regular expression per Agent alias on every composer keystroke. */
export function createAgentMentionRangeFinder(
  agents: AgentSummary[],
  getDisplayName: DisplayNameResolver,
): AgentMentionRangeFinder {
  const tokenOwners = new Map<string, string>();
  for (const agent of agents) {
    for (const token of mentionTokens(agent, getDisplayName)) {
      if (!tokenOwners.has(token)) tokenOwners.set(token, agent.id);
    }
  }
  const tokens = [...tokenOwners.keys()].sort((a, b) => b.length - a.length);
  if (tokens.length === 0) return () => [];

  const pattern = new RegExp(
    `(^|[^A-Za-z0-9._%+\\-])@(${tokens.map(escapeRegExp).join("|")})` +
      `(?=[${MENTION_BOUNDARY_CLASS}]|$)`,
    "g",
  );
  return (text: string) => {
    pattern.lastIndex = 0;
    const ranges: AgentMentionRange[] = [];
    for (const match of text.matchAll(pattern)) {
      const token = match[2];
      const agentId = tokenOwners.get(token);
      if (!agentId) continue;
      const leadingLength = match[1]?.length ?? 0;
      const start = (match.index ?? 0) + leadingLength;
      ranges.push({
        agentId,
        label: `@${token}`,
        start,
        end: start + token.length + 1,
      });
    }
    return ranges;
  };
}

export function buildMultiAgentOrchestrationPrompt(
  text: string,
  agents: AgentSummary[],
  getDisplayName: DisplayNameResolver,
): { prompt: string; assignments: AgentAssignment[] } {
  const matches = findMentionMatches(text, agents, getDisplayName);
  const assignments = matches.map((match, index) => ({
    agentId: match.agentId,
    mention: `@${match.token}`,
    task: text
      .slice(match.end, matches[index + 1]?.start ?? text.length)
      .trim(),
  }));
  const globalContext = text.slice(0, matches[0]?.start ?? text.length).trim();
  const assignmentLines = assignments.map(
    (assignment, index) =>
      `${index + 1}. ${assignment.mention}（agent_id: ${
        assignment.agentId
      }）\n` + `   分工：${assignment.task || "结合原始请求完成对应专业任务"}`,
  );

  const prompt = [
    assignments.length > 1
      ? "以下请求包含明确的多智能体指派。你是当前任务的协调者。"
      : "用户要求你与指定 Agent 共同协作。你是当前任务的协调者和最终答复者。",
    `总体任务：${globalContext || text}`,
    "指派顺序：",
    ...assignmentLines,
    "执行要求：",
    assignments.length > 1
      ? "- 必须使用 chat_with_agent 按上述顺序逐一调用对应 agent_id，不要只转述分工。"
      : "- 必须使用 chat_with_agent 调用指定 agent_id，并结合你自己的分析共同完成任务。",
    "- 后续任务依赖前序结果时，调用后续 Agent 时必须传入必要的前序结果和总体任务背景。",
    "- 某个 Agent 失败时说明具体失败原因，并继续完成仍可执行的部分。",
    "- 所有指派完成后，由你汇总结果、核对衔接关系并向用户给出最终答复。",
    `用户原始请求：${text}`,
  ].join("\n");
  return { prompt, assignments };
}

export function extractAgentMention(
  text: string,
  agents: AgentSummary[],
  getDisplayName: DisplayNameResolver,
): { agentId: string | null; cleanedText: string } {
  const extracted = extractAgentMentions(text, agents, getDisplayName);
  return {
    agentId: extracted.agentIds[0] ?? null,
    cleanedText: extracted.cleanedText,
  };
}
