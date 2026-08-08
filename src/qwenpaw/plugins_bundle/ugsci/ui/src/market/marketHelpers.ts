/**
 * Market domain types, helpers, and source configuration.
 * Includes MCPTemplate, MCP_ENV_HINTS, OSS/GitHub source parsing,
 * and source config modals.
 */

import { getHost, apiUrl, apiFetch, hostFetch } from "../core/runtime";
import { PRIMARY_BTN_STYLE } from "../core/shared";

export interface MCPTemplate {
  id: string;
  name: string;
  emoji: string;
  /** Optional icon URL (overrides emoji when present) */
  iconUrl?: string;
  category: string;
  description: string;
  transport: "stdio" | "streamable_http" | "sse";
  /** stdio transport */
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  /** http / sse transport */
  url?: string;
  headers?: Record<string, string>;
}


// ─── MCP Env Hints ──────────────────────────────────────────────────────────
// Provides helpful labels and links for well-known env keys so users know
// where to obtain their tokens during MCP installation.
export const MCP_ENV_HINTS: Record<
  string,
  { label: string; help: string; link?: string; isSecret?: boolean }
> = {
  BRAVE_API_KEY: {
    label: "Brave API Key",
    help: "在 Brave Search API 官网注册获取",
    link: "https://brave.com/search/api/",
    isSecret: true,
  },
  GITHUB_PERSONAL_ACCESS_TOKEN: {
    label: "GitHub Personal Access Token",
    help: "GitHub Settings → Developer settings → Personal access tokens",
    link: "https://github.com/settings/tokens",
    isSecret: true,
  },
  GITLAB_PERSONAL_ACCESS_TOKEN: {
    label: "GitLab Personal Access Token",
    help: "GitLab User Settings → Access Tokens",
    link: "https://gitlab.com/-/user_settings/personal_access_tokens",
    isSecret: true,
  },
  GITLAB_API_URL: {
    label: "GitLab API URL",
    help: "默认为 https://gitlab.com/api/v4，自建实例请修改",
    isSecret: false,
  },
  EVERART_API_KEY: {
    label: "EverArt API Key",
    help: "在 EverArt 官网获取 API Key",
    link: "https://everart.ai/",
    isSecret: true,
  },
  SLACK_BOT_TOKEN: {
    label: "Slack Bot Token",
    help: "以 xoxb- 开头，在 Slack App 设置中获取",
    link: "https://api.slack.com/apps",
    isSecret: true,
  },
  SLACK_TEAM_ID: {
    label: "Slack Team ID",
    help: "在 Slack 工作区设置中查看 Team ID",
    isSecret: false,
  },
  POSTGRES_CONNECTION_STRING: {
    label: "PostgreSQL 连接串",
    help: "格式: postgresql://user:password@host:port/dbname",
    isSecret: true,
  },
};

/** Check whether a template's env values look like placeholders needing user input. */
export function mcpTemplateNeedsConfig(template: MCPTemplate): boolean {
  if (!template.env) return false;
  const entries = Object.entries(template.env);
  if (entries.length === 0) return false;
  // Any non-empty env value is treated as needing configuration
  return entries.some(([, v]) => typeof v === "string" && v.length > 0);
}

// ─── Marketplace Page ────────────────────────────────────────────────────────

export interface MarketResult {
  source: string;
  slug: string;
  name: string;
  description: string | null;
  source_url: string;
  version: string | null;
  author: string | null;
  icon_url: string | null;
  stats: Record<string, string | number> | null;
}

// ─── GitHub Skill Source: types & helpers ────────────────────────────────────

export interface GitHubSkillSource {
  id: string;
  url: string;
  label: string;
  owner: string;
  repo: string;
  ref: string;
  skillsPath: string;
  enabled: boolean;
  platform: "github" | "gitee" | "oss";
  accessToken?: string;
}

export interface GitHubSkill {
  sourceId: string;
  sourceLabel: string;
  /** e.g. "UGSci/anthropics" — shown on card to indicate collection origin */
  sourcePath?: string;
  name: string;
  description: string;
  source_url: string;
  html_url: string;
  version: string | null;
  author: string | null;
  tag?: string;
  isOfficial?: boolean;
}

export const UGSCI_GITHUB_SOURCES_KEY = "ugsci.market.githubSources";
export const DEFAULT_GITHUB_SOURCE_URL =
  "https://github.com/anthropics/skills/tree/main/skills";
// UGSci official OSS base URL — serves skills, mcp, and agents manifests
export const UGSCI_OSS_BASE = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com";

// Default OSS source – Alibaba Cloud OSS bucket (skills path)
export const DEFAULT_OSS_SOURCE_URL = `${UGSCI_OSS_BASE}/skills`;

/**
 * Build a backend-proxied OSS URL to avoid CORS.
 * The backend endpoint `/api/plugins/oss-proxy?path=xxx` fetches
 * from OSS server-side and returns the content with CORS headers.
 */
export function ossProxyUrl(ossPath: string): string {
  const cleanPath = ossPath.replace(/^\/+/, "");
  return apiUrl(`/plugins/oss-proxy?path=${encodeURIComponent(cleanPath)}`);
}

/** Fetch one OSS resource through QwenPaw's auth-aware proxy transport. */
export function fetchOssResponse(ossPath: string): Promise<Response> {
  const cleanPath = ossPath.replace(/^\/+/, "");
  return hostFetch(`/plugins/oss-proxy?path=${encodeURIComponent(cleanPath)}`);
}

/**
 * Fetch JSON from the official OSS bucket through QwenPaw's backend proxy.
 * Skills, MCP, and Expert templates all use this CORS-safe data path.
 */
export async function fetchOssJson(ossPath: string): Promise<any> {
  const cleanPath = ossPath.replace(/^\/+/, "");
  const resp = await fetchOssResponse(cleanPath);
  if (!resp.ok) {
    throw new Error(`OSS fetch failed (${resp.status}): ${cleanPath}`);
  }
  return await resp.json();
}

// ─── MCP / Expert Source: types & helpers ─────────────────────────────────────

/** Dynamic category extracted from OSS manifests. */
export interface DynamicCategory {
  id: string;
  label: string;
  /** For MCP/Agents: which tags belong to this group */
  tags?: string[];
}

/** MCP server entry from OSS manifest. */
export interface OssMcpServer {
  id: string;
  name: string;
  description: string;
  tags: string[];
  transport: string;
  config?: { command: string; args: string[] };
  env?: string[];
  source?: string;
  icon?: string;
  /** Relative path to icon image in OSS (e.g. mcp/assets/icons/filesystem.svg) */
  icon_url?: string;
  /** Computed: which tag_group this server belongs to */
  category?: string;
}

/** Agent entry from OSS manifest. */
export interface OssAgent {
  id: string;
  name: string;
  description: string;
  path: string;
  tags: string[];
  config?: string;
  instructions?: string;
  skills_manifest?: string;
  drivers?: Record<string, string[]>;
  /** Computed: which tag_group this agent belongs to */
  category?: string;
}

/** Display label for a tag group key (not hardcoded categories — just i18n labels). */
export function _tagGroupLabel(key: string): string {
  const labels: Record<string, string> = {
    domain: "领域",
    workflow: "工作流",
    computation: "计算与数据",
    integration: "集成与工具",
    type: "类型",
    capability: "能力",
    tooling: "工具链",
  };
  return labels[key] || key;
}

/** Map an OSS MCP server to the internal MCPTemplate format. */
export function ossMcpToTemplate(server: OssMcpServer): MCPTemplate {
  const envObj: Record<string, string> = {};
  if (server.env && server.env.length > 0) {
    for (const envKey of server.env) {
      envObj[envKey] = `your-${envKey.toLowerCase().replace(/_/g, "-")}`;
    }
  }
  // Pick an emoji based on icon name or id
  let emoji = "🔌";
  const iconLower = (server.icon || "").toLowerCase();
  if (iconLower.includes("folder")) emoji = "📁";
  else if (iconLower.includes("git")) emoji = "🌿";
  else if (iconLower.includes("github")) emoji = "🐙";
  else if (iconLower.includes("database") || iconLower.includes("postgres") || iconLower.includes("sqlite")) emoji = "🗄️";
  else if (iconLower.includes("search") || iconLower.includes("brave")) emoji = "🔍";
  else if (iconLower.includes("browser") || iconLower.includes("puppeteer")) emoji = "🎭";
  else if (iconLower.includes("memory") || iconLower.includes("brain")) emoji = "🧠";
  else if (iconLower.includes("file") || iconLower.includes("fetch")) emoji = "🌐";
  else if (iconLower.includes("slack")) emoji = "💬";
  else if (iconLower.includes("google")) emoji = "📁";
  else if (iconLower.includes("notion")) emoji = "📝";
  else if (iconLower.includes("jupyter")) emoji = "📊";
  else if (iconLower.includes("science") || iconLower.includes("flask")) emoji = "🔬";
  else if (iconLower.includes("book") || iconLower.includes("arxiv")) emoji = "📚";
  else if (iconLower.includes("patent")) emoji = "📜";
  return {
    id: server.id,
    name: server.name,
    emoji,
    iconUrl: server.icon_url
      ? ossProxyUrl(server.icon_url)
      : undefined,
    category: server.category ? _tagGroupLabel(server.category) : "",
    description: server.description,
    transport: (server.transport || "stdio") as "stdio" | "streamable_http" | "sse",
    command: server.config?.command || "",
    args: server.config?.args || [],
    env: Object.keys(envObj).length > 0 ? envObj : undefined,
  };
}

export interface GenericSource {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
  type: "mcp" | "expert";
}

export const UGSCI_MCP_SOURCES_KEY = "ugsci.market.mcpSources";
export const UGSCI_EXPERT_SOURCES_KEY = "ugsci.market.expertSources";

export function loadGenericSources(
  storageKey: string,
  type: "mcp" | "expert",
): GenericSource[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s: any) =>
        s &&
        typeof s.id === "string" &&
        typeof s.label === "string" &&
        typeof s.url === "string",
    ).map((s: any) => ({
      id: s.id,
      label: s.label,
      url: s.url,
      enabled: s.enabled !== false,
      type,
    }));
  } catch {
    return [];
  }
}

export function saveGenericSources(
  storageKey: string,
  sources: GenericSource[],
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(sources));
  } catch {}
}

export function loadMcpSources(): GenericSource[] {
  return loadGenericSources(UGSCI_MCP_SOURCES_KEY, "mcp");
}

export function saveMcpSources(sources: GenericSource[]): void {
  saveGenericSources(UGSCI_MCP_SOURCES_KEY, sources);
}

export function loadExpertSources(): GenericSource[] {
  return loadGenericSources(UGSCI_EXPERT_SOURCES_KEY, "expert");
}

export function saveExpertSources(sources: GenericSource[]): void {
  saveGenericSources(UGSCI_EXPERT_SOURCES_KEY, sources);
}

export function _parseGitHubSkillSourceUrl(
  raw: string,
): {
  owner: string;
  repo: string;
  ref: string;
  skillsPath: string;
  label: string;
  platform: "github" | "gitee";
} | null {
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.toLowerCase();
    let platform: "github" | "gitee";
    if (host === "github.com" || host === "www.github.com") {
      platform = "github";
    } else if (host === "gitee.com" || host === "www.gitee.com") {
      platform = "gitee";
    } else {
      return null;
    }
    const parts = url.pathname.split("/").filter((p) => p.length > 0);
    if (parts.length < 2) return null;
    const owner = decodeURIComponent(parts[0]);
    const repo = decodeURIComponent(parts[1]);
    let ref = "main";
    let skillsPath = "";
    if (parts.length >= 4 && (parts[2] === "tree" || parts[2] === "blob")) {
      ref = decodeURIComponent(parts[3]);
      if (parts.length > 4) {
        skillsPath = parts.slice(4).map(decodeURIComponent).join("/");
      }
    } else if (parts.length > 2) {
      skillsPath = parts.slice(2).map(decodeURIComponent).join("/");
    }
    skillsPath = skillsPath.replace(/\/+$/, "").replace(/^\/+/, "");
    return {
      owner,
      repo,
      ref: ref || "main",
      skillsPath,
      label: `${owner}/${repo}`,
      platform,
    };
  } catch {
    return null;
  }
}

export function _githubSourceId(
  owner: string,
  repo: string,
  skillsPath: string,
  platform: string = "github",
): string {
  if (platform === "oss") {
    return `oss:${owner}/${skillsPath || "/"}`;
  }
  return `${platform}:${owner}/${repo}:${skillsPath || "/"}`;
}

export function _parseOSSSkillSourceUrl(
  raw: string,
): {
  endpoint: string;
  prefix: string;
  label: string;
  platform: "oss";
} | null {
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.toLowerCase();
    const ossMatch = host.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/,
    );
    if (!ossMatch) return null;
    const bucket = ossMatch[1];
    const endpoint = `${url.protocol}//${host}`;
    const path = decodeURIComponent(url.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    if (!path) return null;
    return {
      endpoint,
      prefix: path,
      label: "UGSci",
      platform: "oss",
    };
  } catch {
    return null;
  }
}

export function loadGithubSources(): GitHubSkillSource[] {
  try {
    const raw = localStorage.getItem(UGSCI_GITHUB_SOURCES_KEY);
    if (!raw) {
      // Official OSS is permanent and loaded outside localStorage, just like
      // MCP and Experts. Only configurable sources are stored here.
      const seed: GitHubSkillSource[] = [];
      // GitHub remains optional because official OSS mirrors these skills.
      // Users can manually enable it from the Source Config modal if
      // they need direct GitHub access.
      const parsed = _parseGitHubSkillSourceUrl(DEFAULT_GITHUB_SOURCE_URL);
      if (parsed) {
        seed.push({
          id: _githubSourceId(
            parsed.owner,
            parsed.repo,
            parsed.skillsPath,
            parsed.platform,
          ),
          url: DEFAULT_GITHUB_SOURCE_URL,
          label: parsed.label,
          owner: parsed.owner,
          repo: parsed.repo,
          ref: parsed.ref,
          skillsPath: parsed.skillsPath,
          enabled: false,
          platform: parsed.platform,
        });
      }
      localStorage.setItem(UGSCI_GITHUB_SOURCES_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const migrated = parsed.filter(
      (s: any) =>
        s &&
        typeof s.id === "string" &&
        (typeof s.owner === "string" || s.platform === "oss") &&
        !(s.platform === "oss" && s.url === DEFAULT_OSS_SOURCE_URL),
    ).map((s: any) => ({
      ...s,
      platform: s.platform || "github",
      owner: s.owner || "",
      repo: s.repo || "",
      ref: s.ref || "",
      skillsPath: s.skillsPath || "",
    }));
    if (migrated.length !== parsed.length) {
      localStorage.setItem(
        UGSCI_GITHUB_SOURCES_KEY,
        JSON.stringify(migrated),
      );
    }
    return migrated;
  } catch {
    return [];
  }
}

export function saveGithubSources(sources: GitHubSkillSource[]): void {
  try {
    localStorage.setItem(
      UGSCI_GITHUB_SOURCES_KEY,
      JSON.stringify(sources),
    );
  } catch {
    /* ignore */
  }
}

export function _parseSkillFrontmatter(content: string): {
  name?: string;
  description?: string;
  version?: string;
  author?: string;
} {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};
  const fm = fmMatch[1];
  const result: {
    name?: string;
    description?: string;
    version?: string;
    author?: string;
  } = {};
  // Simple YAML key extraction (avoid pulling in a YAML lib in plugin bundle)
  const lines = fm.split("\n");
  let currentKey = "";
  for (const line of lines) {
    const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      let val = kvMatch[2].trim();
      // Strip surrounding quotes
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (currentKey === "name") result.name = val;
      else if (currentKey === "description") result.description = val;
      else if (currentKey === "version") result.version = val;
      else if (currentKey === "author") result.author = val;
    }
  }
  return result;
}

export async function fetchGitHubSourceSkills(
  source: GitHubSkillSource,
): Promise<GitHubSkill[]> {
  const isGitee = source.platform === "gitee";
  const encodedPath = source.skillsPath
    ? encodeURIComponent(source.skillsPath).replace(/%2F/g, "/")
    : "";

  // 1. List directory contents via API
  const listUrl = isGitee
    ? `https://gitee.com/api/v5/repos/${source.owner}/${source.repo}/contents/${encodedPath}?ref=${encodeURIComponent(source.ref)}`
    : `https://api.github.com/repos/${source.owner}/${source.repo}/contents/${encodedPath}?ref=${encodeURIComponent(source.ref)}`;
  const reqHeaders: Record<string, string> = {
    Accept: isGitee
      ? "application/json"
      : "application/vnd.github+json",
  };
  if (isGitee && source.accessToken) {
    reqHeaders["Authorization"] = `token ${source.accessToken}`;
  }
  const listResp = await fetch(listUrl, {
    headers: reqHeaders,
  });
  if (!listResp.ok) {
    throw new Error(
      `${isGitee ? "Gitee" : "GitHub"} API ${listResp.status}: ${source.label} (${source.skillsPath || "/"})`,
    );
  }
  const items = (await listResp.json()) as any[];
  if (!Array.isArray(items)) return [];
  // Filter directories (skill folders)
  const dirs = items.filter(
    (item) => item.type === "dir" && item.name,
  );

  // 2. Fetch SKILL.md for each dir in parallel (raw URLs, CORS-safe)
  const skills = await Promise.all(
    dirs.map(async (dir) => {
      const pathPrefix = source.skillsPath ? source.skillsPath + "/" : "";
      const rawUrl = isGitee
        ? `https://gitee.com/${source.owner}/${source.repo}/raw/${source.ref}/${pathPrefix}${dir.name}/SKILL.md`
        : `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${source.ref}/${pathPrefix}${dir.name}/SKILL.md`;
      const htmlUrl = isGitee
        ? `https://gitee.com/${source.owner}/${source.repo}/tree/${source.ref}/${pathPrefix}${dir.name}`
        : `https://github.com/${source.owner}/${source.repo}/tree/${source.ref}/${pathPrefix}${dir.name}`;
      const fallbackSkill: GitHubSkill = {
        sourceId: source.id,
        sourceLabel: source.label,
        name: dir.name,
        description: "",
        source_url: htmlUrl,
        html_url: htmlUrl,
        version: null,
        author: null,
      };
      try {
        const mdHeaders: Record<string, string> = {};
        if (isGitee && source.accessToken) {
          mdHeaders["Authorization"] = `token ${source.accessToken}`;
        }
        const mdResp = await fetch(rawUrl, {
          headers: mdHeaders,
        });
        if (!mdResp.ok) return fallbackSkill;
        const mdContent = await mdResp.text();
        const fm = _parseSkillFrontmatter(mdContent);
        return {
          ...fallbackSkill,
          name: fm.name || dir.name,
          description: fm.description || "",
          version: fm.version || null,
          author: fm.author || null,
        };
      } catch {
        return fallbackSkill;
      }
    }),
  );
  return skills;
}

export async function fetchOSSSourceSkills(
  source: GitHubSkillSource,
): Promise<{ skills: GitHubSkill[]; categories: DynamicCategory[] }> {
  const ossParsed = _parseOSSSkillSourceUrl(source.url);
  if (!ossParsed) {
    throw new Error(`Invalid OSS URL: ${source.url}`);
  }
  const { endpoint, prefix } = ossParsed;
  const encodedPrefix = prefix.split("/").map(encodeURIComponent).join("/");

  // Fetch manifest.json — the authoritative source for skill metadata + tags
  const manifestResp = await fetchOssResponse(
    `${encodedPrefix}/manifest.json`,
  );
  if (!manifestResp.ok) {
    throw new Error(
      `无法获取技能列表: manifest.json (${manifestResp.status})`,
    );
  }
  const manifest = await manifestResp.json();

  // Extract tag_groups from manifest (same pattern as MCP/Agents manifests).
  // When tag_groups is present, categories are derived from it; otherwise
  // we fall back to extracting unique tag values from individual skills.
  const manifestCategories: DynamicCategory[] = [];
  const tagGroups: Record<string, string[]> = {};
  if (manifest && manifest.tag_groups && typeof manifest.tag_groups === "object") {
    for (const [groupKey, tags] of Object.entries(manifest.tag_groups)) {
      if (Array.isArray(tags)) {
        tagGroups[groupKey] = tags as string[];
        manifestCategories.push({
          id: groupKey,
          label: _tagGroupLabel(groupKey),
          tags: tags as string[],
        });
      }
    }
  }

  const skills: GitHubSkill[] = [];

/** Recursively process manifest items, flattening collections. */
function processItems(items: any[], parentCollection?: string) {
for (const item of items) {
if (item.type === "collection" && Array.isArray(item.children)) {
// Recurse into collection children, passing the collection name
processItems(item.children, item.name);
continue;
}
// Individual skill
const skillPath: string = item.path || item.name || "";
if (!skillPath) continue;
const encodedPath = skillPath
.split("/")
.map(encodeURIComponent)
.join("/");
const skillUrl = `${endpoint}/${encodedPrefix}/${encodedPath}`;
// Try to extract version from metadata string like 'version: "1.2.0"'
let version: string | null = null;
if (item.metadata) {
const vm = item.metadata.match(/version:\s*"?([\d.]+)"?/);
if (vm) version = vm[1];
}
// Build sourcePath: "UGSci/<collection>" or just "UGSci" for top-level
const sourcePath = parentCollection
? `${source.label}/${parentCollection}`
: source.label;
skills.push({
sourceId: source.id,
sourceLabel: source.label,
sourcePath,
name: item.name || skillPath.split("/").pop() || skillPath,
description: item.description || "",
source_url: skillUrl,
html_url: skillUrl,
version,
author: null,
tag: item.tag || undefined,
isOfficial: true,
});
}
}

  if (Array.isArray(manifest)) {
    // Legacy: manifest is a plain array of strings or objects
    processItems(
      manifest.map((s: any) =>
        typeof s === "string" ? { name: s, path: s } : s,
      ),
    );
  } else if (manifest && Array.isArray(manifest.skills)) {
    processItems(manifest.skills);
  }

  if (skills.length === 0) {
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${source.url}/manifest.json`,
    );
  }

  return { skills, categories: manifestCategories };
}

/** Fetch MCP servers from the UGSci official OSS manifest. */
export async function fetchOSSMcpManifest(): Promise<{
  servers: OssMcpServer[];
  categories: DynamicCategory[];
}> {
  const manifest = await fetchOssJson("mcp/manifest.json");

  // Extract dynamic categories from tag_groups
  const categories: DynamicCategory[] = [];
  const tagGroups: Record<string, string[]> = {};
  if (manifest.tag_groups && typeof manifest.tag_groups === "object") {
    for (const [groupKey, tags] of Object.entries(manifest.tag_groups)) {
      if (Array.isArray(tags)) {
        tagGroups[groupKey] = tags as string[];
        categories.push({
          id: groupKey,
          label: _tagGroupLabel(groupKey),
          tags: tags as string[],
        });
      }
    }
  }

  // Process servers — assign category based on tag_groups
  const servers: OssMcpServer[] = (manifest.servers || []).map((s: any) => {
    let category = "";
    const serverTags: string[] = s.tags || [];
    for (const [groupKey, tags] of Object.entries(tagGroups)) {
      if (tags.some((t) => serverTags.includes(t))) {
        category = groupKey;
        break;
      }
    }
    return {
      id: s.id || s.name,
      name: s.name || s.id,
      description: s.description || "",
      tags: serverTags,
      transport: s.transport || "stdio",
      config: s.config,
      env: Array.isArray(s.env) ? s.env : undefined,
      source: s.source,
      icon: s.icon,
      icon_url: s.icon_url || s.icon_path || undefined,
      category,
    } as OssMcpServer;
  });

  return { servers, categories };
}

/**
 * Fetch the official skill registry independently of browser source settings.
 * This mirrors the permanent official-source behavior of MCP and Experts.
 */
export async function fetchOSSSkillsManifest(): Promise<{
  skills: GitHubSkill[];
  categories: DynamicCategory[];
}> {
  const manifest = await fetchOssJson("skills/manifest.json");
  const skills: GitHubSkill[] = [];
  const tags = new Set<string>();

  function processItems(items: any[], parentCollection?: string): void {
    for (const item of items) {
      if (item?.type === "collection" && Array.isArray(item.children)) {
        processItems(item.children, item.name || parentCollection);
        continue;
      }

      const skillPath = String(item?.path || item?.name || "").trim();
      if (!skillPath) continue;
      const encodedPath = skillPath
        .split("/")
        .map(encodeURIComponent)
        .join("/");
      const skillUrl = `${UGSCI_OSS_BASE}/skills/${encodedPath}`;
      const tag =
        typeof item.tag === "string" && item.tag.trim()
          ? item.tag.trim()
          : undefined;
      if (tag) tags.add(tag);

      let version: string | null = null;
      if (typeof item.metadata === "string") {
        const match = item.metadata.match(/version:\s*"?([\d.]+)"?/);
        if (match) version = match[1];
      }

      skills.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: parentCollection
          ? `UGSci/${parentCollection}`
          : "UGSci",
        name: item.name || skillPath.split("/").pop() || skillPath,
        description: item.description || "",
        source_url: skillUrl,
        html_url: skillUrl,
        version,
        author: null,
        tag,
        isOfficial: true,
      });
    }
  }

  if (Array.isArray(manifest)) {
    processItems(
      manifest.map((item: any) =>
        typeof item === "string" ? { name: item, path: item } : item,
      ),
    );
  } else if (manifest && Array.isArray(manifest.skills)) {
    processItems(manifest.skills);
  }

  if (skills.length === 0) {
    throw new Error("OSS 技能清单中没有可用技能");
  }

  return {
    skills,
    categories: Array.from(tags).map((tag) => ({
      id: tag,
      label: tag,
    })),
  };
}

/** Fetch agents from the UGSci official OSS manifest. */
export async function fetchOSSAgentsManifest(): Promise<{
  agents: OssAgent[];
  categories: DynamicCategory[];
}> {
  const manifest = await fetchOssJson("agents/manifest.json");

  // Extract dynamic categories from tag_groups
  const categories: DynamicCategory[] = [];
  const tagGroups: Record<string, string[]> = {};
  if (manifest.tag_groups && typeof manifest.tag_groups === "object") {
    for (const [groupKey, tags] of Object.entries(manifest.tag_groups)) {
      if (Array.isArray(tags)) {
        tagGroups[groupKey] = tags as string[];
        categories.push({
          id: groupKey,
          label: _tagGroupLabel(groupKey),
          tags: tags as string[],
        });
      }
    }
  }

  // Process agents — assign category based on tag_groups
  const agentsList: OssAgent[] = (manifest.agents || []).map((a: any) => {
    let category = "";
    const agentTags: string[] = a.tags || [];
    for (const [groupKey, tags] of Object.entries(tagGroups)) {
      if (tags.some((t) => agentTags.includes(t))) {
        category = groupKey;
        break;
      }
    }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      path: a.path || "",
      tags: agentTags,
      config: a.config,
      instructions: a.instructions,
      skills_manifest: a.skills_manifest,
      drivers: a.drivers,
      category,
    } as OssAgent;
  });

  return { agents: agentsList, categories };
}

/** Extract dynamic skill categories from loaded OSS skills. */
export function _extractSkillCategories(skills: GitHubSkill[]): DynamicCategory[] {
  const tagSet = new Set<string>();
  for (const s of skills) {
    if (s.tag) tagSet.add(s.tag);
  }
  return Array.from(tagSet).map((tag) => ({ id: tag, label: tag }));
}

export async function fetchAllGitHubSkills(
  sources: GitHubSkillSource[],
): Promise<{ skills: GitHubSkill[]; errors: { label: string; message: string }[]; categories: DynamicCategory[] }> {
  const enabled = sources.filter((s) => s.enabled);
  const results = await Promise.all(
    enabled.map(async (s) => {
      try {
        if (s.platform === "oss") {
          const { skills, categories } = await fetchOSSSourceSkills(s);
          return { skills, categories, error: null as string | null, label: s.label };
        } else {
          const skills = await fetchGitHubSourceSkills(s);
          return { skills, categories: [] as DynamicCategory[], error: null as string | null, label: s.label };
        }
      } catch (e: any) {
        return {
          skills: [] as GitHubSkill[],
          categories: [] as DynamicCategory[],
          error: e.message || String(e),
          label: s.label,
        };
      }
    }),
  );
  const allSkills: GitHubSkill[] = [];
  const allCategories: DynamicCategory[] = [];
  const errors: { label: string; message: string }[] = [];
  for (const r of results) {
    allSkills.push(...r.skills);
    allCategories.push(...r.categories);
    if (r.error) errors.push({ label: r.label, message: r.error });
  }
  return { skills: allSkills, errors, categories: allCategories };
}


// ─── Source Config Modal: manage GitHub skill sources ─────────────────────────

export function SourceConfigModal({
  open,
  onClose,
  sources,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  sources: GitHubSkillSource[];
  onChange: (sources: GitHubSkillSource[]) => void;
}) {
  const React = getHost().React;
  const { useState } = React;
  const {
    Modal,
    Input,
    Button,
    List,
    Tag,
    Switch,
    Typography,
    Tooltip,
    message: antdMsg,
  } = getHost().antd;
  const {
    PlusOutlined,
    DeleteOutlined,
    LinkOutlined,
    GithubOutlined,
  } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [newUrl, setNewUrl] = useState("");
  const [newToken, setNewToken] = useState("");

  const handleAdd = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    const parsed = _parseGitHubSkillSourceUrl(trimmed);
    if (!parsed) {
      antdMsg.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const id = _githubSourceId(parsed.owner, parsed.repo, parsed.skillsPath, parsed.platform);
    if (sources.some((s) => s.id === id)) {
      antdMsg.warning("该源已存在");
      return;
    }
    const newSource: GitHubSkillSource = {
      id,
      url: trimmed,
      label: parsed.label,
      owner: parsed.owner,
      repo: parsed.repo,
      ref: parsed.ref,
      skillsPath: parsed.skillsPath,
      enabled: true,
      platform: parsed.platform,
      accessToken: newToken.trim() || undefined,
    };
    const next = [...sources, newSource];
    saveGithubSources(next);
    onChange(next);
    setNewUrl("");
    setNewToken("");
    antdMsg.success(`已添加源: ${parsed.label}`);
  };

  const handleToggle = (id: string, enabled: boolean) => {
    const next = sources.map((s) =>
      s.id === id ? { ...s, enabled } : s,
    );
    saveGithubSources(next);
    onChange(next);
  };

  const handleTokenChange = (id: string, token: string) => {
    const next = sources.map((s) =>
      s.id === id ? { ...s, accessToken: token.trim() || undefined } : s,
    );
    saveGithubSources(next);
    onChange(next);
  };

  const handleDelete = (id: string) => {
    const next = sources.filter((s) => s.id !== id);
    saveGithubSources(next);
    onChange(next);
    antdMsg.success("已移除源");
  };

  return React.createElement(
    Modal,
    {
      open,
      onCancel: onClose,
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        GithubOutlined
          ? React.createElement(GithubOutlined, { style: { fontSize: 18 } })
          : null,
        React.createElement("span", null, "配置技能源"),
      ),
      footer: React.createElement(
        Button,
        { onClick: onClose },
        "关闭",
      ),
      width: 640,
    },
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式：",
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        React.createElement(Input, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: newUrl,
          onChange: (e: any) => setNewUrl(e.target.value),
          onPressEnter: handleAdd,
          prefix: LinkOutlined ? React.createElement(LinkOutlined) : undefined,
          style: { flex: 1 },
        }),
        React.createElement(
          Button,
          {
            type: "primary",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: handleAdd,
          },
          "添加",
        ),
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      newUrl.trim() && newUrl.trim().toLowerCase().includes("gitee.com")
        ? React.createElement(
            "div",
            { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
            React.createElement(
              Text,
              { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
              "Gitee Token:",
            ),
            React.createElement(Input.Password, {
              placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
              value: newToken,
              onChange: (e: any) => setNewToken(e.target.value),
              style: { flex: 1 },
            }),
          )
        : null,
    ),
    React.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      React.createElement(Text, { strong: true }, `已配置源 (${sources.length})`),
    ),
    React.createElement(List, {
      size: "small",
      bordered: true,
      dataSource: sources,
      renderItem: (source: GitHubSkillSource) =>
        React.createElement(
          List.Item,
          {
            actions: [
              React.createElement(
                Tooltip,
                { title: source.enabled ? "点击禁用" : "点击启用" },
                React.createElement(Switch, {
                  size: "small",
                  checked: source.enabled,
                  onChange: (v: boolean) => handleToggle(source.id, v),
                }),
              ),
              React.createElement(
                Tooltip,
                { title: "移除此源" },
                React.createElement(
                  Button,
                  {
                    size: "small",
                    type: "text",
                    danger: true,
                    icon: DeleteOutlined
                      ? React.createElement(DeleteOutlined)
                      : undefined,
                    onClick: () => handleDelete(source.id),
                  },
                ),
              ),
            ],
          },
          React.createElement(
            "div",
            { style: { flex: 1, minWidth: 0 } },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
              React.createElement(
                Tag,
                { color: source.platform === "gitee" ? "orange" : source.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
                source.platform === "gitee" ? "Gitee" : source.platform === "oss" ? "OSS" : "GitHub",
              ),
              React.createElement(
                Tag,
                { style: { fontSize: 11 } },
                source.label,
              ),
              source.skillsPath
                ? React.createElement(
                    Text,
                    { type: "secondary", style: { fontSize: 11 } },
                    `/${source.skillsPath}`,
                  )
                : null,
              source.platform !== "oss"
                ? React.createElement(
                    Text,
                    { type: "secondary", style: { fontSize: 11 } },
                    `@${source.ref}`,
                  )
                : null,
            ),
            React.createElement(
              Text,
              {
                type: "secondary",
                style: { fontSize: 11, wordBreak: "break-all" },
              },
              source.url,
            ),
            // Gitee token input for existing Gitee sources
            source.platform === "gitee"
              ? React.createElement(
                  "div",
                  { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
                  React.createElement(
                    Text,
                    { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
                    "Token:",
                  ),
                  React.createElement(Input.Password, {
                    size: "small",
                    placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
                    value: source.accessToken || "",
                    onChange: (e: any) => handleTokenChange(source.id, e.target.value),
                    style: { flex: 1 },
                  }),
                )
              : null,
          ),
        ),
    }),
  );
}

// ─── Generic Source Config Modal: for MCP / Expert sources ──────────────────

export function GenericSourceConfigModal({
  open,
  onClose,
  sources,
  onChange,
  type,
}: {
  open: boolean;
  onClose: () => void;
  sources: GenericSource[];
  onChange: (sources: GenericSource[]) => void;
  type: "mcp" | "expert";
}) {
  const React = getHost().React;
  const { useState } = React;
  const {
    Modal,
    Input,
    Button,
    List,
    Tag,
    Switch,
    Typography,
    Tooltip,
    message: antdMsg,
  } = getHost().antd;
  const {
    PlusOutlined,
    DeleteOutlined,
    LinkOutlined,
    ApiOutlined,
    UserOutlined,
    ImportOutlined,
    ExportOutlined,
    CopyOutlined,
  } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  const typeLabel = type === "mcp" ? "MCP" : "专家模板";
  const typeIcon =
    type === "mcp"
      ? ApiOutlined
        ? React.createElement(ApiOutlined, { style: { fontSize: 18 } })
        : null
      : UserOutlined
        ? React.createElement(UserOutlined, { style: { fontSize: 18 } })
        : null;

  const handleAdd = () => {
    const trimmedUrl = newUrl.trim();
    const trimmedLabel = newLabel.trim();
    if (!trimmedUrl) return;
    const label = trimmedLabel || trimmedUrl.slice(0, 40);
    const id = `${type}:${trimmedUrl}`;
    if (sources.some((s) => s.id === id)) {
      antdMsg.warning("该源已存在");
      return;
    }
    const newSource: GenericSource = {
      id,
      label,
      url: trimmedUrl,
      enabled: true,
      type,
    };
    const next = [...sources, newSource];
    if (type === "mcp") saveMcpSources(next);
    else saveExpertSources(next);
    onChange(next);
    setNewUrl("");
    setNewLabel("");
    antdMsg.success(`已添加${typeLabel}源: ${label}`);
  };

  const handleToggle = (id: string, enabled: boolean) => {
    const next = sources.map((s) =>
      s.id === id ? { ...s, enabled } : s,
    );
    if (type === "mcp") saveMcpSources(next);
    else saveExpertSources(next);
    onChange(next);
  };

  const handleDelete = (id: string) => {
    const next = sources.filter((s) => s.id !== id);
    if (type === "mcp") saveMcpSources(next);
    else saveExpertSources(next);
    onChange(next);
    antdMsg.success("已移除源");
  };

  const handleExport = () => {
    const exportData = JSON.stringify(
      { type, sources },
      null,
      2,
    );
    try {
      navigator.clipboard.writeText(exportData);
      antdMsg.success(`${typeLabel}源已复制到剪贴板（${sources.length} 个源）`);
    } catch {
      // Fallback: create a temporary textarea
      const textarea = document.createElement("textarea");
      textarea.value = exportData;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      antdMsg.success(`${typeLabel}源已复制到剪贴板（${sources.length} 个源）`);
    }
  };

  const handleImport = () => {
    const trimmed = importText.trim();
    if (!trimmed) {
      antdMsg.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const data = JSON.parse(trimmed);
      let importedSources: GenericSource[] = [];

      // Accept either { type, sources: [...] } or raw [...]
      if (Array.isArray(data)) {
        importedSources = data;
      } else if (data && Array.isArray(data.sources)) {
        importedSources = data.sources;
      } else if (data && typeof data === "object") {
        // Single source object
        importedSources = [data];
      } else {
        throw new Error("Invalid format");
      }

      const valid = importedSources.filter(
        (s: any) =>
          s &&
          typeof s.url === "string" &&
          typeof s.label === "string",
      );

      if (valid.length === 0) {
        antdMsg.error("未找到有效的源数据");
        return;
      }

      // Merge with existing (deduplicate by id)
      const existingIds = new Set(sources.map((s) => s.id));
      const toAdd: GenericSource[] = [];
      for (const s of valid) {
        const id = s.id || `${type}:${s.url}`;
        if (!existingIds.has(id)) {
          toAdd.push({
            id,
            label: s.label,
            url: s.url,
            enabled: s.enabled !== false,
            type,
          });
        }
      }

      if (toAdd.length === 0) {
        antdMsg.info("所有源均已存在，无新增");
        return;
      }

      const next = [...sources, ...toAdd];
      if (type === "mcp") saveMcpSources(next);
      else saveExpertSources(next);
      onChange(next);
      setImportText("");
      setShowImport(false);
      antdMsg.success(`成功导入 ${toAdd.length} 个${typeLabel}源`);
    } catch (err: any) {
      antdMsg.error(`JSON 解析失败: ${err.message || "格式错误"}`);
    }
  };

  return React.createElement(
    Modal,
    {
      open,
      onCancel: onClose,
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        typeIcon,
        React.createElement("span", null, `配置${typeLabel}源`),
      ),
      footer: React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        React.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          React.createElement(
            Button,
            {
              icon: ExportOutlined
                ? React.createElement(ExportOutlined)
                : undefined,
              onClick: handleExport,
              disabled: sources.length === 0,
              size: "small",
            },
            "导出到剪贴板",
          ),
          React.createElement(
            Button,
            {
              icon: ImportOutlined
                ? React.createElement(ImportOutlined)
                : undefined,
              onClick: () => setShowImport(!showImport),
              size: "small",
            },
            showImport ? "隐藏导入" : "导入JSON",
          ),
        ),
        React.createElement(
          Button,
          { onClick: onClose },
          "关闭",
        ),
      ),
      width: 680,
    },
    // Description
    React.createElement(
      Text,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${typeLabel}源地址，支持从远程仓库或团队共享的 JSON 导入${typeLabel}配置。`,
    ),
    // Import section (collapsible)
    showImport
      ? React.createElement(
          "div",
          {
            style: {
              marginBottom: 16,
              padding: 12,
              background: "var(--ant-color-fill-quaternary, #fafafa)",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
            },
          },
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 12, display: "block", marginBottom: 8 } },
            `粘贴${typeLabel}源 JSON（支持从导出的剪贴板内容粘贴）`,
          ),
          React.createElement(Input.TextArea, {
            placeholder:
              type === "mcp"
                ? '{\n  "type": "mcp",\n  "sources": [\n    { "label": "团队MCP", "url": "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" }\n  ]\n}'
                : '{\n  "type": "expert",\n  "sources": [\n    { "label": "团队专家库", "url": "https://raw.githubusercontent.com/team/expert-registry/main/experts.json" }\n  ]\n}',
            value: importText,
            onChange: (e: any) => setImportText(e.target.value),
            autoSize: { minRows: 4, maxRows: 10 },
            style: { fontFamily: "monospace", fontSize: 12 },
          }),
          React.createElement(
            "div",
            { style: { marginTop: 8, display: "flex", gap: 8 } },
            React.createElement(
              Button,
              {
                type: "primary",
                size: "small",
                onClick: handleImport,
              },
              "导入",
            ),
            React.createElement(
              Button,
              {
                size: "small",
                onClick: () => setImportText(""),
              },
              "清空",
            ),
          ),
        )
      : null,
    // Add new source
    React.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      React.createElement(Input, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: newLabel,
        onChange: (e: any) => setNewLabel(e.target.value),
        style: { width: 200 },
      }),
      React.createElement(Input, {
        placeholder:
          type === "mcp"
            ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json"
            : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: newUrl,
        onChange: (e: any) => setNewUrl(e.target.value),
        onPressEnter: handleAdd,
        prefix: LinkOutlined ? React.createElement(LinkOutlined) : undefined,
        style: { flex: 1 },
      }),
      React.createElement(
        Button,
        {
          type: "primary",
          icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
          onClick: handleAdd,
        },
        "添加",
      ),
    ),
    // Source list
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
      React.createElement(
        Text,
        { strong: true },
        `已配置源 (${sources.length})`,
      ),
    ),
    React.createElement(List, {
      size: "small",
      bordered: true,
      dataSource: sources,
      renderItem: (source: GenericSource) =>
        React.createElement(
          List.Item,
          {
            actions: [
              React.createElement(
                Tooltip,
                { title: source.enabled ? "点击禁用" : "点击启用" },
                React.createElement(Switch, {
                  size: "small",
                  checked: source.enabled,
                  onChange: (v: boolean) => handleToggle(source.id, v),
                }),
              ),
              React.createElement(
                Tooltip,
                { title: "移除此源" },
                React.createElement(
                  Button,
                  {
                    size: "small",
                    type: "text",
                    danger: true,
                    icon: DeleteOutlined
                      ? React.createElement(DeleteOutlined)
                      : undefined,
                    onClick: () => handleDelete(source.id),
                  },
                ),
              ),
            ],
          },
          React.createElement(
            "div",
            { style: { flex: 1, minWidth: 0 } },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                },
              },
              React.createElement(
                Tag,
                {
                  color: type === "mcp" ? "purple" : "blue",
                  style: { fontSize: 11 },
                },
                source.label,
              ),
              !source.enabled
                ? React.createElement(
                    Tag,
                    { style: { fontSize: 10 } },
                    "已禁用",
                  )
                : null,
            ),
            React.createElement(
              Text,
              {
                type: "secondary",
                style: { fontSize: 11, wordBreak: "break-all" },
              },
              source.url,
            ),
          ),
        ),
    }),
    // Share hint
    React.createElement(
      "div",
      {
        style: {
          marginTop: 12,
          padding: "8px 12px",
          background: "#e6f4ff",
          borderRadius: 6,
          fontSize: 12,
          color: "#1677ff",
        },
      },
      React.createElement(
        "span",
        null,
        "💡 ",
        `点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。`,
      ),
    ),
  );
}

export interface MarketSearchResponse {
  results: MarketResult[];
  errors: { provider: string; message: string }[];
  by_provider: Record<string, { has_more: boolean; total: number }>;
}

export interface MarketProviderInfo {
  key: string;
  label: string;
  available: boolean;
  reason: string | null;
  supports_browse: boolean;
}

export interface MarketCategory {
  id: string;
  label: string;
}
