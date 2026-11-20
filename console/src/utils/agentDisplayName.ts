import type { TFunction } from "i18next";
import type { AgentSummary } from "../api/types/agents";

export const DEFAULT_AGENT_ID = "default";
export const DEFAULT_AGENT_DISPLAY_NAME = "Default Agent";

/** UI label for an agent; `default` id uses i18n, others use API `name` (fallback: id). */
export function getAgentDisplayName(
  agent: Pick<AgentSummary, "id" | "name">,
  t: TFunction,
): string {
  // For default agent, preserve i18n unless explicitly customized
  if (agent.id === DEFAULT_AGENT_ID) {
    // If name is customized (not the default placeholder), show custom name
    if (agent.name && agent.name !== DEFAULT_AGENT_DISPLAY_NAME) {
      return agent.name;
    }
    // Otherwise, fall back to localized default name
    return t("agent.defaultDisplayName");
  }
  const presets = [
    "QwenPaw-Data",
    "QA Agent",
    "CloudPaw-Master",
    "CloudPaw-Executor",
    "CloudPaw-Verifier",
  ];
  return presets.includes(agent.name)
    ? t(`agent.presetNames.${agent.name}`, { defaultValue: agent.name })
    : agent.name || agent.id;
}
