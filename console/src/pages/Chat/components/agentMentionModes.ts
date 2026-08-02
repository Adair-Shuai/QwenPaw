import { useSyncExternalStore } from "react";
import type { AgentSummary } from "../../../api/types/agents";
import {
  buildMultiAgentOrchestrationPrompt,
  extractAgentMentions,
  removeAgentMention,
} from "./agentMentionUtils";

export type AgentMentionMode = "delegate" | "collaborate";
export type AgentMentionModesSnapshot = Readonly<
  Record<string, AgentMentionMode>
>;

export interface AgentMentionDispatch {
  requestText: string;
  targetAgentId?: string;
  coordinationRequested: boolean;
}

const modes = new Map<string, AgentMentionMode>();
const listeners = new Set<() => void>();
let snapshot: AgentMentionModesSnapshot = Object.freeze({});
let pendingSubmitSnapshot: AgentMentionModesSnapshot | null = null;

function publish() {
  snapshot = Object.freeze(Object.fromEntries(modes));
  listeners.forEach((listener) => listener());
}

export function setAgentMentionMode(
  agentId: string,
  mode: AgentMentionMode,
): void {
  if (modes.get(agentId) === mode) return;
  modes.set(agentId, mode);
  publish();
}

export function getAgentMentionMode(agentId: string): AgentMentionMode {
  return modes.get(agentId) ?? "delegate";
}

export function getAgentMentionModesSnapshot(): AgentMentionModesSnapshot {
  return snapshot;
}

export function captureAgentMentionModesForSubmit(): void {
  pendingSubmitSnapshot = Object.freeze({ ...snapshot });
}

export function consumeAgentMentionModesForSubmit(): AgentMentionModesSnapshot {
  const submitted = pendingSubmitSnapshot ?? snapshot;
  pendingSubmitSnapshot = null;
  return submitted;
}

export function restoreAgentMentionModes(
  restored: AgentMentionModesSnapshot | undefined,
): void {
  modes.clear();
  for (const [agentId, mode] of Object.entries(restored ?? {})) {
    if (mode === "delegate" || mode === "collaborate") {
      modes.set(agentId, mode);
    }
  }
  publish();
}

export function clearAgentMentionModes(): void {
  if (modes.size === 0) return;
  modes.clear();
  publish();
}

export function syncAgentMentionModes(
  text: string,
  agents: AgentSummary[],
  getDisplayName: (agent: AgentSummary) => string,
): string[] {
  const agentIds = extractAgentMentions(text, agents, getDisplayName).agentIds;
  const present = new Set(agentIds);
  let changed = false;
  for (const agentId of [...modes.keys()]) {
    if (!present.has(agentId)) {
      modes.delete(agentId);
      changed = true;
    }
  }
  for (const agentId of agentIds) {
    if (!modes.has(agentId)) {
      modes.set(agentId, "delegate");
      changed = true;
    }
  }
  if (changed) publish();
  return agentIds;
}

export function shouldCoordinateAgentMentions(
  agentIds: string[],
  modeSnapshot: AgentMentionModesSnapshot = snapshot,
): boolean {
  return (
    agentIds.length > 1 ||
    (agentIds.length === 1 && modeSnapshot[agentIds[0]] === "collaborate")
  );
}

export function buildAgentMentionDispatch(
  text: string,
  agents: AgentSummary[],
  getDisplayName: (agent: AgentSummary) => string,
  modeSnapshot: AgentMentionModesSnapshot = snapshot,
): AgentMentionDispatch {
  const extracted = extractAgentMentions(text, agents, getDisplayName);
  const coordinationRequested =
    extracted.agentIds.length > 1 ||
    (extracted.agentIds.length === 1 &&
      modeSnapshot[extracted.agentIds[0]] === "collaborate");
  if (coordinationRequested) {
    return {
      requestText: buildMultiAgentOrchestrationPrompt(
        text,
        agents,
        getDisplayName,
      ).prompt,
      coordinationRequested: true,
    };
  }
  const targetAgentId = extracted.agentIds[0];
  const targetAgent = agents.find((agent) => agent.id === targetAgentId);
  return {
    requestText: targetAgent
      ? removeAgentMention(text, targetAgent, getDisplayName).text
      : text,
    targetAgentId,
    coordinationRequested: false,
  };
}

export function useAgentMentionModes(): AgentMentionModesSnapshot {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => snapshot,
  );
}
