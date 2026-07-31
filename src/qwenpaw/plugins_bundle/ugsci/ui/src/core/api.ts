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
  MCPAccessPolicy,
  MCPAccessPrincipalOption,
  MCPClientInfo,
  MCPToolInfo,
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
  const data = await apiFetch<SkillSpec[]>("/skills", {
    headers: { "X-Agent-Id": agentId },
  });
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
  const data = await apiFetch<WorkspaceSkillSummary[]>(
    "/skills/workspaces",
  );
  return data || [];
}

// ─── MCP API (global) ─────────────────────────────────────────────────────────

export async function fetchMCPClients(): Promise<MCPClientInfo[]> {
  const data = await apiFetch<MCPClientInfo[]>("/mcp");
  return data || [];
}

// ─── Agent-aware MCP API helpers (mirror console /mcp page) ───────────────────

/** List MCP clients for a specific agent (passes X-Agent-Id). */
export async function fetchAgentMCPClientsForCapabilities(
  agentId: string,
): Promise<MCPClientInfo[]> {
  const data = await apiFetch<MCPClientInfo[]>("/mcp", {
    headers: { "X-Agent-Id": agentId },
  });
  return data || [];
}

/** Toggle an MCP client's enabled status for a specific agent. */
export async function toggleMCPClientForCapabilities(
  agentId: string,
  clientKey: string,
): Promise<MCPClientInfo> {
  return apiFetch<MCPClientInfo>(
    `/mcp/toggle/${encodeURIComponent(clientKey)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": agentId },
    },
  );
}

/** Delete an MCP client for a specific agent. */
export async function deleteMCPClientForCapabilities(
  agentId: string,
  clientKey: string,
): Promise<void> {
  await apiFetch(`/mcp/${encodeURIComponent(clientKey)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": agentId },
  });
}

/** Create an MCP client for a specific agent. */
export async function createMCPClientForCapabilities(
  agentId: string,
  clientKey: string,
  client: Record<string, unknown>,
): Promise<MCPClientInfo> {
  return apiFetch<MCPClientInfo>("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify({ client_key: clientKey, client }),
  });
}

/** Update an MCP client for a specific agent. */
export async function updateMCPClientForCapabilities(
  agentId: string,
  clientKey: string,
  updates: Record<string, unknown>,
): Promise<MCPClientInfo> {
  return apiFetch<MCPClientInfo>(
    `/mcp/${encodeURIComponent(clientKey)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
      body: JSON.stringify(updates),
    },
  );
}

/** List tools from a connected MCP server for a specific agent. */
export async function listMCPToolsForCapabilities(
  agentId: string,
  clientKey: string,
): Promise<MCPToolInfo[]> {
  const data = await apiFetch<MCPToolInfo[]>(
    `/mcp/tools/${encodeURIComponent(clientKey)}`,
    { headers: { "X-Agent-Id": agentId } },
  );
  return data || [];
}

/** Get saved MCP access policy for a specific agent. */
export async function getMCPPolicyForCapabilities(
  agentId: string,
  clientKey: string,
): Promise<MCPAccessPolicy> {
  return apiFetch<MCPAccessPolicy>(
    `/mcp/policy/${encodeURIComponent(clientKey)}`,
    { headers: { "X-Agent-Id": agentId } },
  );
}

/** Update saved MCP access policy for a specific agent. */
export async function updateMCPPolicyForCapabilities(
  agentId: string,
  clientKey: string,
  policy: MCPAccessPolicy,
): Promise<MCPAccessPolicy> {
  return apiFetch<MCPAccessPolicy>(
    `/mcp/policy/${encodeURIComponent(clientKey)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
      body: JSON.stringify(policy),
    },
  );
}

/** List recent source-scoped principals for MCP access rules. */
export async function listMCPAccessPrincipalsForCapabilities(
  agentId: string,
): Promise<MCPAccessPrincipalOption[]> {
  const data = await apiFetch<MCPAccessPrincipalOption[]>(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": agentId } },
  );
  return data || [];
}

/** Start OAuth flow for a remote MCP client. */
export async function startMCPOAuthForCapabilities(
  agentId: string,
  clientKey: string,
  body: {
    url: string;
    scope?: string;
    client_id?: string;
    auth_endpoint?: string;
    token_endpoint?: string;
  },
): Promise<{ auth_url: string; session_id: string }> {
  return apiFetch<{ auth_url: string; session_id: string }>(
    `/mcp/oauth/start/${encodeURIComponent(clientKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
      body: JSON.stringify(body),
    },
  );
}

/** Get OAuth status for an MCP client. */
export async function getMCPOAuthStatusForCapabilities(
  agentId: string,
  clientKey: string,
): Promise<{ authorized: boolean; expires_at: number; scope: string }> {
  return apiFetch<{
    authorized: boolean;
    expires_at: number;
    scope: string;
  }>(`/mcp/oauth/status/${encodeURIComponent(clientKey)}`, {
    headers: { "X-Agent-Id": agentId },
  });
}

/** Revoke OAuth tokens for an MCP client. */
export async function revokeMCPOAuthForCapabilities(
  agentId: string,
  clientKey: string,
): Promise<void> {
  await apiFetch<{ message: string }>(
    `/mcp/oauth/${encodeURIComponent(clientKey)}`,
    {
      method: "DELETE",
      headers: { "X-Agent-Id": agentId },
    },
  );
}

/** Parse agent config's mcp field to extract MCP client keys. */
export function extractMCPKeys(mcpConfig: unknown): string[] {
  if (!mcpConfig || typeof mcpConfig !== "object") return [];
  const cfg = mcpConfig as Record<string, unknown>;
  // MCP config can be in mcpServers wrapper or direct key→config
  const servers =
    (cfg.mcpServers as Record<string, unknown>) ||
    (cfg as Record<string, unknown>);
  if (!servers || typeof servers !== "object") return [];
  return Object.keys(servers).filter((k) => k !== "mcpServers");
}
