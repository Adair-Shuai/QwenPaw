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
  workspace_dir: string;
  skills: SkillSpec[];
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

export interface MCPToolInfo {
  name: string;
  description: string;
  enabled: boolean;
  input_schema: Record<string, unknown>;
}

export type MCPAccessSourceType = "channel" | (string & {});
export type MCPAccessSubjectType = "all" | "user";

export interface MCPAccessRule {
  source_type: MCPAccessSourceType;
  source_value: string;
  subject_type: MCPAccessSubjectType;
  subject_value: string;
  effect: MCPAccessEffect;
}

export interface MCPAccessPrincipalOption {
  source_type: MCPAccessSourceType;
  source_value: string;
  subject_type: "user";
  subject_value: string;
  label: string;
  chat_id: string;
  chat_name: string;
  session_id: string;
  updated_at: string | null;
}

export interface MCPToolDefaultPolicy {
  tool_name: string;
  effect: MCPAccessEffect;
}

export interface MCPToolAccessOverride extends MCPAccessRule {
  tool_name: string;
}

export interface MCPAccessPolicy {
  default_effect: MCPAccessEffect;
  client_overrides: MCPAccessRule[];
  tool_defaults: MCPToolDefaultPolicy[];
  tool_overrides: MCPToolAccessOverride[];
  unmanaged_rules_count: number;
}

export interface MCPClientUpdate {
  name?: string;
  description?: string;
  command?: string;
  enabled?: boolean;
  transport?: "stdio" | "streamable_http" | "sse";
  url?: string;
  headers?: Record<string, string>;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
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
