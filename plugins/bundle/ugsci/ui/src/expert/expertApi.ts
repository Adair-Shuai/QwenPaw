/**
 * Expert-domain API helpers — knowledge base, skills, MCP, heartbeat,
 * running config, language/timezone, system prompt files.
 */

import { apiFetch } from "../core/runtime";
import { fetchAgentConfig } from "../core/api";
import type { SkillSpec, MCPClientInfo } from "../core/types";

function agentSkillsPath(agentId: string, suffix = ""): string {
  return `/agents/${encodeURIComponent(agentId)}/skills${suffix}`;
}

// ─── Preset Prompt Extraction ────────────────────────────────────────────────

/**
 * Auto-generate suggested prompts from a list of skills.
 *
 * Each enabled skill's `description` is transformed into a natural-language
 * request that the user can click to start a conversation.
 */
/** Prompt object with a visible label and the full prompt value. */
export interface PromptItem {
  label: string;
  value: string;
}

export function extractPromptFromSkills(skills: SkillSpec[]): PromptItem[] {
  const prompts: PromptItem[] = [];
  for (const skill of skills) {
    if (skill.enabled === false) continue;
    const desc = skill.description?.trim();
    if (!desc) continue;

    // Use skill name as the short label (fall back to truncated description)
    const label = (skill.name || desc).length > 20
      ? (skill.name || desc).substring(0, 18) + "…"
      : (skill.name || desc);

    // Transform description into a user-facing prompt
    let prompt = desc;
    // Strip markdown formatting for cleaner prompt text
    prompt = prompt
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/^#+\s*/gm, "")
      .trim();

    // Transform into a request sentence
    if (
      /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(prompt)
    ) {
      // Starts with a verb — prefix with "请"
      prompt = `请${prompt}`;
    } else if (/^(a |an |the )/i.test(prompt)) {
      // English article — leave as is
      prompt = `Help me with ${prompt}`;
    } else if (!/[。？！.?!]$/.test(prompt)) {
      // No ending punctuation — add "帮我" prefix
      prompt = `帮我${prompt}`;
    }

    // Cap length
    if (prompt.length > 80) {
      prompt = prompt.substring(0, 77) + "...";
    }

    prompts.push({ label, value: prompt });
    if (prompts.length >= 4) break;
  }
  return prompts;
}

// ─── Knowledge Base Helpers ──────────────────────────────────────────────────

export interface KnowledgeFileInfo {
  filename: string;
  path: string;
  size: number;
  created_time: string;
  modified_time: string;
}

export async function fetchKnowledgeFiles(
  agentId: string,
): Promise<KnowledgeFileInfo[]> {
  // Use the workspace API to list md files for this agent
  const data = await apiFetch<KnowledgeFileInfo[]>("/workspace/files", {
    headers: { "X-Agent-Id": agentId },
  });
  return data || [];
}

export async function writeKnowledgeFile(
  agentId: string,
  filename: string,
  content: string,
): Promise<{ written: boolean; filename?: string }> {
  return apiFetch(`/workspace/files/${encodeURIComponent(filename)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify({ content }),
  });
}

export interface KnowledgeFileSaveResult {
  written: boolean;
  filename: string;
  system_prompt_files: string[];
}

export async function saveKnowledgeFile(
  agentId: string,
  filename: string,
  content: string,
  enable: boolean | null,
): Promise<KnowledgeFileSaveResult> {
  return apiFetch<KnowledgeFileSaveResult>("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify({ filename, content, enable }),
  });
}

export const WINDOWS_RESERVED_FILENAMES = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (_, index) => `COM${index + 1}`),
  ...Array.from({ length: 9 }, (_, index) => `LPT${index + 1}`),
]);

export function normalizeKnowledgeFilename(value: string): string {
  let filename = value.trim();
  if (!filename) throw new Error("请输入文件名");
  if (/[\\/]/.test(filename)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(filename)) {
    throw new Error("文件名包含系统不支持的字符");
  }
  if (/[ .]$/.test(filename)) throw new Error("文件名不能以空格或句点结尾");
  if (!filename.toLowerCase().endsWith(".md")) filename += ".md";
  else filename = `${filename.slice(0, -3)}.md`;
  const stem = filename.split(".", 1)[0].toUpperCase();
  if (!filename.slice(0, -3)) throw new Error("文件名不能为空");
  if (WINDOWS_RESERVED_FILENAMES.has(stem)) {
    throw new Error("该文件名是系统保留名称，请更换");
  }
  if (new TextEncoder().encode(filename).length > 255) {
    throw new Error("文件名过长");
  }
  return filename;
}

export async function updateAgentSystemPromptFiles(
  agentId: string,
  systemPromptFiles: string[],
): Promise<void> {
  // Fetch current config, update system_prompt_files, save back
  const config = await fetchAgentConfig(agentId);
  config.system_prompt_files = systemPromptFiles;
  await apiFetch(`/agents/${encodeURIComponent(agentId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
}

// ─── Skill Management Helpers ────────────────────────────────────────────────

/** Download a skill from the pool into an agent's workspace. */
export async function installSkillFromPool(
  agentId: string,
  skillName: string,
): Promise<void> {
  await apiFetch("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: skillName,
      targets: [{ workspace_id: agentId }],
      overwrite: false,
    }),
  });
}

/** Enable a skill in an agent's workspace. */
export async function enableSkillForAgent(
  agentId: string,
  skillName: string,
): Promise<void> {
  await apiFetch(
    agentSkillsPath(agentId, `/${encodeURIComponent(skillName)}/enable`),
    {
      method: "POST",
    },
  );
}

/** Delete a skill from an agent's workspace. */
export async function deleteSkillForAgent(
  agentId: string,
  skillName: string,
): Promise<void> {
  await apiFetch(agentSkillsPath(agentId, `/${encodeURIComponent(skillName)}`), {
    method: "DELETE",
  });
}

// ─── Batch Skill Management Helpers ──────────────────────────────────────────

export interface BatchSkillResult {
  results: Record<string, { success: boolean; reason?: string }>;
}

export async function batchEnableSkillsForAgent(
  agentId: string,
  skillNames: string[],
): Promise<BatchSkillResult> {
  return apiFetch<BatchSkillResult>(agentSkillsPath(agentId, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(skillNames),
  });
}

export async function batchDisableSkillsForAgent(
  agentId: string,
  skillNames: string[],
): Promise<BatchSkillResult> {
  return apiFetch<BatchSkillResult>(agentSkillsPath(agentId, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(skillNames),
  });
}

export async function batchDeleteSkillsForAgent(
  agentId: string,
  skillNames: string[],
): Promise<BatchSkillResult> {
  return apiFetch<BatchSkillResult>(agentSkillsPath(agentId, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(skillNames),
  });
}

// ─── MCP Management Helpers ──────────────────────────────────────────────────

/** List all MCP clients for a specific agent. */
export async function fetchAgentMCPClients(agentId: string): Promise<MCPClientInfo[]> {
  const data = await apiFetch<MCPClientInfo[]>("/mcp", {
    headers: { "X-Agent-Id": agentId },
  });
  return data || [];
}

/** Delete an MCP client from a specific agent. */
export async function deleteMCPForAgent(
  agentId: string,
  clientKey: string,
): Promise<void> {
  await apiFetch(`/mcp/${encodeURIComponent(clientKey)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": agentId },
  });
}

/** Create an MCP client for a specific agent. */
export async function createMCPForAgent(
  agentId: string,
  body: Record<string, unknown>,
): Promise<MCPClientInfo> {
  return apiFetch<MCPClientInfo>("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(body),
  });
}

/** Toggle an MCP client's enabled status for a specific agent. */
export async function toggleMCPForAgent(
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

/** Disable a skill in an agent's workspace. */
export async function disableSkillForAgent(
  agentId: string,
  skillName: string,
): Promise<void> {
  await apiFetch(
    agentSkillsPath(agentId, `/${encodeURIComponent(skillName)}/disable`),
    {
      method: "POST",
    },
  );
}

/** Delete a skill from the pool (non-protected only). */
export async function deletePoolSkill(skillName: string): Promise<void> {
  await apiFetch(`/skills/pool/${encodeURIComponent(skillName)}`, {
    method: "DELETE",
  });
}

// ─── Heartbeat Helpers ───────────────────────────────────────────────────────

export interface HeartbeatConfig {
  enabled: boolean;
  every: string;
  target: string;
  timeoutSeconds: number;
  activeHours?: { start: string; end: string } | null;
}

export interface EveryParts {
  number: number;
  unit: "m" | "h";
}

export function parseEvery(every: string): EveryParts {
  const s = (every || "").trim();
  if (!s) return { number: 6, unit: "h" };
  const m = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!m) return { number: 6, unit: "h" };
  const hours = parseInt(m[1] || "0", 10);
  const minutes = parseInt(m[2] || "0", 10);
  const seconds = parseInt(m[3] || "0", 10);
  const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
  if (totalMinutes <= 0) return { number: 6, unit: "h" };
  if (totalMinutes >= 60 && totalMinutes % 60 === 0) {
    return { number: totalMinutes / 60, unit: "h" };
  }
  return { number: totalMinutes, unit: "m" };
}

export function serializeEvery(parts: EveryParts): string {
  return parts.unit === "h" ? `${parts.number}h` : `${parts.number}m`;
}

export async function fetchHeartbeatConfig(
  agentId: string,
): Promise<HeartbeatConfig> {
  return apiFetch<HeartbeatConfig>("/config/heartbeat", {
    headers: { "X-Agent-Id": agentId },
  });
}

export async function updateHeartbeatConfig(
  agentId: string,
  body: HeartbeatConfig,
): Promise<HeartbeatConfig> {
  return apiFetch<HeartbeatConfig>("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(body),
  });
}

export async function runHeartbeatNow(agentId: string): Promise<void> {
  await apiFetch<{ started: boolean }>("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": agentId },
  });
}

// ─── Running Config Helpers ──────────────────────────────────────────────────

export interface LoopIterationConfig {
  enabled?: boolean;
  max_iterations?: number;
}
export interface LoopDoomLoopConfig {
  enabled?: boolean;
  window_size?: number;
  similarity_threshold?: number;
  stages?: unknown[];
}
export interface LoopConfig {
  iteration?: LoopIterationConfig;
  doom_loop?: LoopDoomLoopConfig;
}
export interface AutoTitleConfig {
  enabled: boolean;
  timeout_seconds: number;
}
export interface LightContextConfig {
  strategy?: string;
  dialog_path?: string;
  token_count_estimate_divisor?: number;
  scroll_config?: {
    history_retention_days?: number;
  };
  [key: string]: unknown;
}
export interface AgentsRunningConfig {
  max_iters: number;
  loop?: LoopConfig;
  shell_command_timeout: number;
  shell_command_executable: string;
  llm_retry_enabled: boolean;
  llm_max_retries: number;
  llm_backoff_base: number;
  llm_backoff_cap: number;
  llm_max_concurrent: number;
  llm_max_qpm: number;
  llm_rate_limit_pause: number;
  llm_rate_limit_jitter: number;
  llm_acquire_timeout: number;
  history_max_length: number;
  context_manager_backend: string;
  light_context_config?: LightContextConfig;
  memory_manager_backend: string;
  reme_light_memory_config?: unknown;
  adbpg_memory_config?: unknown;
  approval_level?: string;
  auto_title_config?: AutoTitleConfig;
  [key: string]: unknown;
}

export async function fetchRunningConfig(
  agentId: string,
): Promise<AgentsRunningConfig> {
  return apiFetch<AgentsRunningConfig>("/workspace/running-config", {
    headers: { "X-Agent-Id": agentId },
  });
}

export async function updateRunningConfig(
  agentId: string,
  body: AgentsRunningConfig,
): Promise<AgentsRunningConfig> {
  return apiFetch<AgentsRunningConfig>("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(body),
  });
}

// ─── System Prompt Files Helpers ─────────────────────────────────────────────

// ─── Language / Timezone Helpers (agent-scoped) ───────────────────────────────

export async function fetchAgentLanguage(
  agentId: string,
): Promise<string> {
  const data = await apiFetch<{ language: string }>("/workspace/language", {
    headers: { "X-Agent-Id": agentId },
  });
  return data.language || "zh";
}

export async function updateAgentLanguage(
  agentId: string,
  language: string,
): Promise<void> {
  await apiFetch<{ language: string }>("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify({ language }),
  });
}

export async function fetchUserTimezone(): Promise<string> {
  const data = await apiFetch<{ timezone: string }>("/config/user-timezone");
  return data.timezone || "UTC";
}

export async function updateUserTimezone(timezone: string): Promise<void> {
  await apiFetch<{ timezone: string }>("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone }),
  });
}

export async function fetchSystemPromptFiles(agentId: string): Promise<string[]> {
  const data = await apiFetch<string[]>("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": agentId },
  });
  return data || [];
}

export async function updateSystemPromptFiles(
  agentId: string,
  files: string[],
): Promise<string[]> {
  return apiFetch<string[]>("/workspace/system-prompt-files", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(files),
  });
}

// Default system prompt files that are always present
