/**
 * Core API helpers for the UGSci frontend plugin.
 *
 * These functions wrap the QwenPaw REST API and are shared across multiple
 * domain modules. Each function uses `apiFetch` from `./runtime` which
 * handles auth headers, caching, and agent-scoping automatically.
 */

import { apiFetch } from "./runtime";
import type {
  AgentProfileConfig,
  AgentSummary,
  PoolSkillSpec,
  SkillSpec,
  WorkspaceSkillSummary,
} from "./types";

// ─── Agent & Skill API ────────────────────────────────────────────────────────

export async function fetchAgents(): Promise<AgentSummary[]> {
  const data = await apiFetch<{ agents: AgentSummary[] }>("/agents");
  return data?.agents || [];
}

export async function fetchAgentConfig(
  agentId: string,
): Promise<AgentProfileConfig> {
  return apiFetch<AgentProfileConfig>(
    `/agents/${encodeURIComponent(agentId)}`,
  );
}

export async function fetchAgentSkills(
  agentId: string,
): Promise<SkillSpec[]> {
  const data = await apiFetch<SkillSpec[]>(
    `/agents/${encodeURIComponent(agentId)}/skills`,
  );
  return data || [];
}

export async function fetchPoolSkills(
  summary = false,
): Promise<PoolSkillSpec[]> {
  const qs = summary ? "?summary=true" : "";
  const data = await apiFetch<PoolSkillSpec[]>(`/skills/pool${qs}`);
  return data || [];
}

export async function fetchPoolSkillContent(
  skillName: string,
): Promise<string> {
  const data = await apiFetch<{ name: string; content: string }>(
    `/skills/pool/${encodeURIComponent(skillName)}/content`,
  );
  return data?.content || "";
}

export async function fetchWorkspaceSkills(): Promise<
  WorkspaceSkillSummary[]
> {
  type WorkspaceSkillWire = Partial<WorkspaceSkillSummary> & {
    agent_id: string;
    skills?: SkillSpec[];
  };
  const data = await apiFetch<WorkspaceSkillWire[]>(
    "/skills/workspaces",
  );
  return (data || []).map((workspace) => ({
    agent_id: workspace.agent_id,
    agent_name: workspace.agent_name || "",
    // Current hosts return skill_names. Keep the legacy fallback so the
    // plugin remains compatible with older QwenPaw releases.
    skill_names: Array.isArray(workspace.skill_names)
      ? workspace.skill_names
      : Array.isArray(workspace.skills)
        ? workspace.skills.map((skill) => skill.name)
        : [],
  }));
}
