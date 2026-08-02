import type { AgentSummary } from "../../../api/types/agents";
import { normalizeCommandPrefix } from "../../../utils/commandPrefix";
import {
  findAgentMentionRanges,
  type AgentMentionRangeFinder,
} from "./agentMentionUtils";

export type ComposerHighlightKind = "agent" | "skill" | "command";

export interface ComposerHighlight {
  key: string;
  kind: ComposerHighlightKind;
  label: string;
  start: number;
  end: number;
}

export interface ComposerHighlightIndex {
  skills: ReadonlySet<string>;
  commands: ReadonlySet<string>;
  findAgentMentions: AgentMentionRangeFinder;
}

function normalizeKnownName(name: string): string {
  const normalized = normalizeCommandPrefix(name).trim();
  const withoutPrefix = normalized.startsWith("/")
    ? normalized.slice(1)
    : normalized;
  return withoutPrefix.split(/\s/, 1)[0].toLowerCase();
}

export function createComposerHighlightIndex(
  skillNames: string[],
  commandNames: string[],
  findAgentMentions: AgentMentionRangeFinder,
): ComposerHighlightIndex {
  return {
    skills: new Set(skillNames.map(normalizeKnownName).filter(Boolean)),
    commands: new Set(commandNames.map(normalizeKnownName).filter(Boolean)),
    findAgentMentions,
  };
}

export function extractComposerHighlights(
  text: string,
  agents: AgentSummary[],
  skillNames: string[],
  commandNames: string[],
  getDisplayName: (agent: AgentSummary) => string,
  index?: ComposerHighlightIndex,
): ComposerHighlight[] {
  const mentionRanges = index
    ? index.findAgentMentions(text)
    : findAgentMentionRanges(text, agents, getDisplayName);
  const highlights: ComposerHighlight[] = mentionRanges.map((mention) => ({
    key: `agent:${mention.start}:${mention.agentId}`,
    kind: "agent",
    label: mention.label.slice(1),
    start: mention.start,
    end: mention.end,
  }));

  const normalized = normalizeCommandPrefix(text);
  const commandMatch = normalized.match(/^\/(\S+)/);
  if (commandMatch) {
    const name = commandMatch[1];
    const lowerName = name.toLowerCase();
    const skills = index?.skills ?? new Set(skillNames.map(normalizeKnownName));
    const commands =
      index?.commands ?? new Set(commandNames.map(normalizeKnownName));
    if (skills.has(lowerName) || commands.has(lowerName)) {
      highlights.push({
        key: `command:0:${lowerName}`,
        // Registered commands win a same-name collision, matching backend
        // dispatch semantics. The menu normally filters these collisions too.
        kind: commands.has(lowerName) ? "command" : "skill",
        label: text.slice(0, commandMatch[0].length),
        start: 0,
        end: commandMatch[0].length,
      });
    }
  }

  return highlights.sort((a, b) => a.start - b.start);
}
