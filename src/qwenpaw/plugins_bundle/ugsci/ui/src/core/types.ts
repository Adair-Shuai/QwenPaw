/**
 * Shared type definitions for the UGSci frontend plugin.
 *
 * These types mirror the backend API shapes and are used across multiple
 * domain modules (Expert, Capability, Skill, Market).
 */

// ─── Agent Types ──────────────────────────────────────────────────────────────

export interface AgentSummary {
  id: string;
  name: string;
  description: string;
  workspace_dir: string;
  enabled: boolean;
  active_model?: { provider_id: string; model: string } | null;
}

export interface AgentProfileConfig {
  id: string;
  name: string;
  description?: string;
  workspace_dir?: string;
  approval_level?: string;
  active_model?: { provider_id: string; model: string } | null;
  channels?: unknown;
  mcp?: unknown;
  heartbeat?: unknown;
  running?: unknown;
  llm_routing?: unknown;
  system_prompt_files?: string[];
  tools?: unknown;
  security?: unknown;
}

// ─── Skill Types ──────────────────────────────────────────────────────────────

export interface SkillSpec {
  name: string;
  description?: string;
  version_text?: string;
  content: string;
  source: string;
  enabled?: boolean;
  channels?: string[];
  tags?: string[];
  config?: Record<string, unknown>;
  last_updated?: string;
  emoji?: string;
  installed_from?: string;
}

export interface PoolSkillSpec {
  name: string;
  description?: string;
  version_text?: string;
  content: string;
  source: string;
  protected: boolean;
  external?: boolean;
  external_path?: string;
  sync_status?: string;
  tags?: string[];
  emoji?: string;
  installed_from?: string;
  auto_update?: boolean;
}

export interface WorkspaceSkillSummary {
  agent_id: string;
  agent_name?: string;
  skill_names: string[];
}

// ─── MCP Types ────────────────────────────────────────────────────────────────

export interface MCPClientOAuthStatus {
  authorized: boolean;
  expires_at: number;
  scope: string;
  client_id: string;
}

export type MCPAccessEffect = "allow" | "ask" | "deny";

export interface MCPAccessSummary {
  default_effect: MCPAccessEffect;
  overrides_count: number;
}

export interface MCPClientInfo {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  transport: "stdio" | "streamable_http" | "sse";
  url: string;
  headers: Record<string, string>;
  command: string;
  args: string[];
  env: Record<string, string>;
  cwd: string;
  tools: string[] | null;
  oauth_status: MCPClientOAuthStatus | null;
  access_summary: MCPAccessSummary;
}

// ─── Expert Aggregate Type ────────────────────────────────────────────────────

/** Aggregated expert data — the VIEW layer on top of Agent data. */
export interface ExpertData {
  agent: AgentSummary;
  config: AgentProfileConfig | null;
  skills: SkillSpec[];
  mcps: MCPClientInfo[];
  loading: boolean;
}
