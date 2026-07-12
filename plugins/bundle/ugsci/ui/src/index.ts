/**
 * UGSci frontend plugin for QwenPaw
 *
 * Transforms the QwenPaw UI into a petroleum-domain-friendly interface with
 * three core modules: Capabilities, Skills, and Experts.
 *
 * Key design: Expert display data is LINKED to real Agent data — each expert
 * card/drawer fetches the agent's actual skills, MCP clients, tools, and
 * system prompt files from the existing QwenPaw API.
 *
 * Uses window.QwenPaw plugin API for route + menu registration.
 */

// ─── Types (mirrors console/src/api/types/) ──────────────────────────────────

interface AgentSummary {
  id: string;
  name: string;
  description: string;
  workspace_dir: string;
  enabled: boolean;
  active_model?: { provider_id: string; model: string } | null;
}

interface AgentProfileConfig {
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

interface SkillSpec {
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

interface PoolSkillSpec {
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

interface MCPClientInfo {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  transport: "stdio" | "streamable_http" | "sse";
  url: string;
  command: string;
  args: string[];
  tools: string[] | null;
}

interface WorkspaceSkillSummary {
  agent_id: string;
  agent_name?: string;
  workspace_dir: string;
  skills: SkillSpec[];
}

/** Aggregated expert data — the VIEW layer on top of Agent data. */
interface ExpertData {
  agent: AgentSummary;
  config: AgentProfileConfig | null;
  skills: SkillSpec[];
  mcps: MCPClientInfo[];
  loading: boolean;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

function getHost() {
  const host = (window as any).QwenPaw?.host;
  if (!host) throw new Error("[ugsci] QwenPaw.host not available");
  return host as {
    React: typeof React;
    antd: any;
    antdIcons: any;
    getApiUrl: (path: string) => string;
    getApiToken: () => string;
    setSelectedAgent?: (agentId: string) => void;
    ReactMarkdown?: any;
    remarkGfm?: any;
  };
}

function getToken(): string {
  try {
    return getHost().getApiToken() || "";
  } catch {
    return "";
  }
}

function apiUrl(path: string): string {
  return getHost().getApiUrl(path);
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
  return headers;
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const resp = await fetch(apiUrl(path), {
    ...opts,
    headers: { ...authHeaders(), ...(opts?.headers || {}) },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || `HTTP ${resp.status}`);
  }
  if (resp.status === 204) return null as T;
  return resp.json();
}

async function fetchAgents(): Promise<AgentSummary[]> {
  const data = await apiFetch<{ agents: AgentSummary[] }>("/agents");
  return data?.agents || [];
}

async function fetchAgentConfig(agentId: string): Promise<AgentProfileConfig> {
  return apiFetch<AgentProfileConfig>(`/agents/${encodeURIComponent(agentId)}`);
}

async function fetchAgentSkills(agentId: string): Promise<SkillSpec[]> {
  const data = await apiFetch<SkillSpec[]>("/skills", {
    headers: { "X-Agent-Id": agentId },
  });
  return data || [];
}

async function fetchPoolSkills(): Promise<PoolSkillSpec[]> {
  const data = await apiFetch<PoolSkillSpec[]>("/skills/pool");
  return data || [];
}

async function fetchWorkspaceSkills(): Promise<WorkspaceSkillSummary[]> {
  const data = await apiFetch<WorkspaceSkillSummary[]>("/skills/workspaces");
  return data || [];
}

async function fetchMCPClients(): Promise<MCPClientInfo[]> {
  const data = await apiFetch<MCPClientInfo[]>("/mcp");
  return data || [];
}

/** Parse agent config's mcp field to extract MCP client keys. */
function extractMCPKeys(mcpConfig: unknown): string[] {
  if (!mcpConfig || typeof mcpConfig !== "object") return [];
  const cfg = mcpConfig as Record<string, unknown>;
  // MCP config can be in mcpServers wrapper or direct key→config
  const servers =
    (cfg.mcpServers as Record<string, unknown>) ||
    (cfg as Record<string, unknown>);
  if (!servers || typeof servers !== "object") return [];
  return Object.keys(servers).filter((k) => k !== "mcpServers");
}

// ─── React import shim ────────────────────────────────────────────────────────

import type React from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Check if the sidebar is currently in simple mode. */
function isSimpleMode(): boolean {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return false;
  }
}

/**
 * Render markdown text using the host's ReactMarkdown component.
 * Falls back to plain text if ReactMarkdown is not available.
 */
function renderMarkdown(text: string, React: typeof import("react")) {
  const host = getHost();
  if (host.ReactMarkdown && host.remarkGfm) {
    return React.createElement(
      host.ReactMarkdown,
      { remarkPlugins: [host.remarkGfm] },
      text,
    );
  }
  // Fallback: strip basic markdown formatting
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^[-*]\s+/gm, "• ");
}

// ─── Shared Components ────────────────────────────────────────────────────────

function PageHeader({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}) {
  const React = getHost().React;
  const { Space } = getHost().antd;
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: "1px solid #f0f0f0",
      },
    },
    React.createElement(
      "div",
      null,
      React.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        title,
      ),
      subtitle
        ? React.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
            subtitle,
          )
        : null,
    ),
    extra ? React.createElement(Space, null, extra) : null,
  );
}

function TagList({
  items,
  max = 5,
  color = "blue",
  emptyText = "无",
}: {
  items: string[];
  max?: number;
  color?: string;
  emptyText?: string;
}) {
  const React = getHost().React;
  const { Tag } = getHost().antd;
  if (!items || items.length === 0) {
    return React.createElement(
      "span",
      { style: { fontSize: 12, color: "#bfbfbf" } },
      emptyText,
    );
  }
  return React.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...items.slice(0, max).map((item, i) =>
      React.createElement(
        Tag,
        { key: i, color, style: { fontSize: 11, marginRight: 0 } },
        item,
      ),
    ),
    items.length > max
      ? React.createElement(
          Tag,
          { style: { fontSize: 11, marginRight: 0 } },
          `+${items.length - max}`,
        )
      : null,
  );
}

// ─── Expert Center Page ───────────────────────────────────────────────────────

function ExpertCard({
  expert,
  onClick,
}: {
  expert: ExpertData;
  onClick: () => void;
}) {
  const React = getHost().React;
  const { Card, Tag, Badge, Typography, Spin } = getHost().antd;
  const { Text } = Typography;

  const { agent, skills, mcps, loading } = expert;
  const isEnabled = agent.enabled;
  const skillNames = skills.filter((s) => s.enabled !== false).map((s) => s.name);
  const mcpNames = mcps.map((m) => m.name || m.key);
  const modelText = agent.active_model
    ? `${agent.active_model.provider_id}/${agent.active_model.model}`
    : null;

  return React.createElement(
    Card,
    {
      hoverable: true,
      onClick,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: isEnabled ? undefined : "#d9d9d9",
        opacity: isEnabled ? 1 : 0.7,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        React.createElement(
          "div",
          null,
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 15 } },
            agent.name,
          ),
          React.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#bfbfbf",
                fontFamily: "monospace",
              },
            },
            agent.id,
          ),
        ),
      ),
      React.createElement(Badge, {
        status: isEnabled ? "success" : "default",
        text: isEnabled ? "启用" : "停用",
      }),
    ),
    // Description (rendered as markdown)
    agent.description
      ? React.createElement(
          "div",
          {
            style: {
              fontSize: 12,
              color: "#595959",
              marginBottom: 10,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            },
          },
          renderMarkdown(agent.description, React),
        )
      : React.createElement(
          "div",
          { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10 } },
          "暂无描述",
        ),
    // Model info
    modelText
      ? React.createElement(
          "div",
          { style: { marginBottom: 8 } },
          React.createElement(
            Tag,
            { color: "geekblue", style: { fontSize: 11 } },
            `🤖 ${modelText}`,
          ),
        )
      : null,
    // Skills
    loading
      ? React.createElement(Spin, { size: "small" })
      : React.createElement(
          "div",
          { style: { marginBottom: 6 } },
          React.createElement(
            "div",
            { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
            `技能 (${skillNames.length})`,
          ),
          React.createElement(TagList, {
            items: skillNames,
            max: 4,
            color: "cyan",
            emptyText: "未配置技能",
          }),
        ),
    // MCP
    !loading && mcpNames.length > 0
      ? React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
            `MCP (${mcpNames.length})`,
          ),
          React.createElement(TagList, {
            items: mcpNames,
            max: 3,
            color: "purple",
          }),
        )
      : null,
  );
}

function ExpertDrawer({
  expert,
  open,
  onClose,
}: {
  expert: ExpertData | null;
  open: boolean;
  onClose: () => void;
}) {
  const React = getHost().React;
  const {
    Drawer,
    Descriptions,
    Tag,
    Typography,
    Space,
    Button,
    Empty,
    Tabs,
    List,
    Spin,
  } = getHost().antd;
  const { Text, Paragraph } = Typography;
  const {
    EditOutlined,
    ThunderboltOutlined,
    FileTextOutlined,
    ToolOutlined,
  } = getHost().antdIcons || {};

  if (!expert) return null;

  const { agent, config, skills, mcps, loading } = expert;
  const enabledSkills = skills.filter((s) => s.enabled !== false);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const basicInfoTab = React.createElement(
    "div",
    null,
    React.createElement(
      Descriptions,
      { column: 1, bordered: true, size: "small" },
      React.createElement(Descriptions.Item, { label: "专家名称" }, agent.name),
      React.createElement(
        Descriptions.Item,
        { label: "专家 ID" },
        React.createElement("code", { style: { fontSize: 12 } }, agent.id),
      ),
      React.createElement(
        Descriptions.Item,
        { label: "状态" },
        React.createElement(
          Tag,
          { color: agent.enabled ? "green" : "default" },
          agent.enabled ? "启用" : "停用",
        ),
      ),
React.createElement(
Descriptions.Item,
{ label: "功能简介" },
agent.description
  ? renderMarkdown(agent.description, React)
  : "暂无描述",
),
      React.createElement(
        Descriptions.Item,
        { label: "使用模型" },
        agent.active_model
          ? `${agent.active_model.provider_id} / ${agent.active_model.model}`
          : "使用全局默认模型",
      ),
      config?.workspace_dir
        ? React.createElement(
            Descriptions.Item,
            { label: "工作区路径" },
            React.createElement(
              "code",
              { style: { fontSize: 11 } },
              config.workspace_dir,
            ),
          )
        : null,
      config?.approval_level
        ? React.createElement(
            Descriptions.Item,
            { label: "审批级别" },
            config.approval_level,
          )
        : null,
    ),
    // System prompt files
    config?.system_prompt_files && config.system_prompt_files.length > 0
      ? React.createElement(
          "div",
          { style: { marginTop: 16 } },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              },
            },
            FileTextOutlined
              ? React.createElement(FileTextOutlined, {
                  style: { fontSize: 14, color: "#1677ff" },
                })
              : null,
            React.createElement(Text, { strong: true }, "系统提示词文件"),
          ),
          React.createElement(
            Space,
            { wrap: true },
            ...config.system_prompt_files.map((file, i) =>
              React.createElement(
                Tag,
                {
                  key: i,
                  icon: FileTextOutlined
                    ? React.createElement(FileTextOutlined)
                    : undefined,
                  style: { fontSize: 12 },
                },
                file,
              ),
            ),
          ),
        )
      : null,
  );

  const skillsTab = loading
    ? React.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        React.createElement(Spin, { size: "large" }),
      )
    : enabledSkills.length === 0
      ? React.createElement(Empty, {
          description: "该专家暂无已启用的技能",
          image: Empty.PRESENTED_IMAGE_SIMPLE,
        })
      : React.createElement(List, {
          dataSource: enabledSkills,
          renderItem: (skill: SkillSpec) =>
            React.createElement(
              List.Item,
              null,
              React.createElement(
                "div",
                { style: { width: "100%" } },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    },
                  },
                  skill.emoji
                    ? React.createElement(
                        "span",
                        { style: { fontSize: 16 } },
                        skill.emoji,
                      )
                    : null,
                  React.createElement(Text, { strong: true }, skill.name),
                  skill.version_text
                    ? React.createElement(
                        Tag,
                        { style: { fontSize: 10 } },
                        `v${skill.version_text}`,
                      )
                    : null,
                ),
                skill.description
                  ? React.createElement(
                      Paragraph,
                      {
                        type: "secondary",
                        style: { fontSize: 12, margin: 0 },
                        ellipsis: { rows: 2 },
                      },
                      skill.description,
                    )
                  : null,
                skill.tags && skill.tags.length > 0
                  ? React.createElement(
                      "div",
                      { style: { marginTop: 4 } },
                      ...skill.tags.map((tag, i) =>
                        React.createElement(
                          Tag,
                          { key: i, color: "cyan", style: { fontSize: 10 } },
                          tag,
                        ),
                      ),
                    )
                  : null,
              ),
            ),
        });

  const mcpTab = loading
    ? React.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        React.createElement(Spin, { size: "large" }),
      )
    : mcps.length === 0
      ? React.createElement(Empty, {
          description: "该专家暂无关联的 MCP 客户端",
          image: Empty.PRESENTED_IMAGE_SIMPLE,
        })
      : React.createElement(List, {
          dataSource: mcps,
          renderItem: (mcp: MCPClientInfo) =>
            React.createElement(
              List.Item,
              null,
              React.createElement(
                "div",
                { style: { width: "100%" } },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    },
                  },
                  React.createElement(
                    "span",
                    { style: { fontSize: 14 } },
                    "🔌",
                  ),
                  React.createElement(
                    Text,
                    { strong: true },
                    mcp.name || mcp.key,
                  ),
                  React.createElement(
                    Tag,
                    {
                      color: mcp.enabled ? "green" : "default",
                      style: { fontSize: 10 },
                    },
                    mcp.enabled ? "启用" : "停用",
                  ),
                  React.createElement(
                    Tag,
                    { color: "purple", style: { fontSize: 10 } },
                    mcp.transport,
                  ),
                ),
                mcp.description
                  ? React.createElement(
                      Paragraph,
                      {
                        type: "secondary",
                        style: { fontSize: 12, margin: 0 },
                        ellipsis: { rows: 2 },
                      },
                      mcp.description,
                    )
                  : null,
                mcp.tools && mcp.tools.length > 0
                  ? React.createElement(
                      "div",
                      {
                        style: {
                          marginTop: 4,
                          fontSize: 11,
                          color: "#8c8c8c",
                        },
                      },
                      `提供 ${mcp.tools.length} 个工具`,
                    )
                  : null,
              ),
            ),
        });

  const toolsTab = config?.tools
    ? React.createElement(
        "div",
        { style: { padding: 16 } },
        React.createElement(
          "div",
          { style: { marginBottom: 12 } },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              },
            },
            ToolOutlined
              ? React.createElement(ToolOutlined, {
                  style: { fontSize: 14, color: "#1677ff" },
                })
              : null,
            React.createElement(Text, { strong: true }, "工具配置"),
          ),
          React.createElement(
            "pre",
            {
              style: {
                background: "#fafafa",
                padding: 12,
                borderRadius: 6,
                fontSize: 12,
                overflow: "auto",
                maxHeight: 300,
              },
            },
            JSON.stringify(config.tools, null, 2),
          ),
        ),
      )
    : React.createElement(Empty, {
        description: "暂无工具配置",
        image: Empty.PRESENTED_IMAGE_SIMPLE,
      });

  const tabItems = [
    { key: "basic", label: "基本信息", children: basicInfoTab },
    { key: "skills", label: `技能 (${enabledSkills.length})`, children: skillsTab },
    { key: "mcp", label: `MCP (${mcps.length})`, children: mcpTab },
    { key: "tools", label: "工具配置", children: toolsTab },
  ];

  return React.createElement(
    Drawer,
    {
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        React.createElement("span", null, agent.name),
      ),
      open,
      onClose,
      width: 560,
      extra: React.createElement(
        Space,
        null,
        React.createElement(
          Button,
          {
            size: "small",
            icon: EditOutlined
              ? React.createElement(EditOutlined)
              : undefined,
            onClick: () => navigateTo("/agents"),
          },
          "编辑专家",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            size: "small",
            icon: ThunderboltOutlined
              ? React.createElement(ThunderboltOutlined)
              : undefined,
            onClick: () => {
              // Set this agent as selected via the host store API
              try {
                const host = getHost();
                if (host.setSelectedAgent) {
                  host.setSelectedAgent(agent.id);
                }
              } catch (err) {
                console.warn("[ugsci] Failed to set selected agent:", err);
              }
              navigateTo("/chat");
            },
          },
          "开始对话",
        ),
      ),
    },
    React.createElement(Tabs, {
      items: tabItems,
      defaultActiveKey: "basic",
    }),
  );
}

function ExpertCenterPage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo } = React;
  const { Spin, Empty, Input, Button, message: antdMsg, Row, Col } =
    getHost().antd;
  const { ReloadOutlined, PlusOutlined, SearchOutlined } =
    getHost().antdIcons || {};

  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeExpert, setActiveExpert] = useState<ExpertData | null>(null);
  const [searchText, setSearchText] = useState("");

  const loadExperts = useCallback(async () => {
    setLoading(true);
    try {
      const agents = await fetchAgents();
      const allMCPClients = await fetchMCPClients().catch(
        () => [] as MCPClientInfo[],
      );

      // Fetch detailed data for each agent in parallel
      const expertDataList: ExpertData[] = await Promise.all(
        agents.map(async (agent): Promise<ExpertData> => {
          try {
            const [config, skills] = await Promise.all([
              fetchAgentConfig(agent.id).catch(() => null),
              fetchAgentSkills(agent.id).catch(() => [] as SkillSpec[]),
            ]);

            // Extract MCP keys from agent config and cross-reference with global MCP list
            const mcpKeys = extractMCPKeys(config?.mcp);
            const agentMCPs = allMCPClients.filter(
              (mcp) =>
                mcpKeys.includes(mcp.key) || mcpKeys.includes(mcp.name),
            );

            return {
              agent,
              config,
              skills,
              mcps: agentMCPs,
              loading: false,
            };
          } catch {
            return {
              agent,
              config: null,
              skills: [],
              mcps: [],
              loading: false,
            };
          }
        }),
      );

      setExperts(expertDataList);
    } catch (err: any) {
      antdMsg.error(err.message || "加载专家列表失败");
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  const handleCardClick = useCallback((expert: ExpertData) => {
    setActiveExpert(expert);
    setDrawerOpen(true);
  }, []);

  const filteredExperts = useMemo(() => {
    if (!searchText.trim()) return experts;
    const q = searchText.toLowerCase();
    return experts.filter(
      (e) =>
        e.agent.name.toLowerCase().includes(q) ||
        e.agent.description?.toLowerCase().includes(q) ||
        e.agent.id.toLowerCase().includes(q) ||
        e.skills.some((s) => s.name.toLowerCase().includes(q)),
    );
  }, [experts, searchText]);

  const enabledCount = experts.filter((e) => e.agent.enabled).length;
  const totalSkills = experts.reduce(
    (sum, e) =>
      sum + e.skills.filter((s) => s.enabled !== false).length,
    0,
  );
  const totalMCPs = experts.reduce((sum, e) => sum + e.mcps.length, 0);

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "专家中心",
      subtitle: `共 ${experts.length} 位专家（${enabledCount} 位启用）· ${totalSkills} 个技能 · ${totalMCPs} 个 MCP 客户端`,
      extra: React.createElement(
        React.Fragment,
        null,
        React.createElement(
          Button,
          {
            icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined,
            onClick: loadExperts,
            loading,
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: () => {
              window.history.pushState({}, "", "/agents");
              window.dispatchEvent(new PopStateEvent("popstate"));
            },
          },
          "创建专家",
        ),
      ),
    }),
    // Search bar
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(Input, {
        placeholder: "搜索专家名称、描述或技能...",
        prefix: SearchOutlined ? React.createElement(SearchOutlined) : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 400 },
      }),
    ),
    // Content
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
        )
      : filteredExperts.length === 0
        ? React.createElement(Empty, {
            description: searchText
              ? "未找到匹配的专家"
              : "暂无专家，点击「创建专家」添加",
          })
        : React.createElement(
            Row,
            { gutter: [12, 12] },
            ...filteredExperts.map((expert) =>
              React.createElement(
                Col,
                { key: expert.agent.id, xs: 24, sm: 12, md: 8, lg: 6 },
                React.createElement(ExpertCard, {
                  expert,
                  onClick: () => handleCardClick(expert),
                }),
              ),
            ),
          ),
    // Drawer
    React.createElement(ExpertDrawer, {
      expert: activeExpert,
      open: drawerOpen,
      onClose: () => setDrawerOpen(false),
    }),
  );
}

// ─── Capability Center Page ───────────────────────────────────────────────────

function CapabilityCard({
  mcp,
  onClick,
}: {
  mcp: MCPClientInfo;
  onClick: () => void;
}) {
  const React = getHost().React;
  const { Card, Tag, Badge, Typography } = getHost().antd;
  const { Text } = Typography;

  const transportIcons: Record<string, string> = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡",
  };

  return React.createElement(
    Card,
    {
      hoverable: true,
      onClick,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: mcp.enabled ? undefined : "#d9d9d9",
        opacity: mcp.enabled ? 1 : 0.7,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement(
          "span",
          { style: { fontSize: 18 } },
          transportIcons[mcp.transport] || "🔌",
        ),
        React.createElement(
          Text,
          { strong: true, style: { fontSize: 14 } },
          mcp.name || mcp.key,
        ),
      ),
      React.createElement(Badge, {
        status: mcp.enabled ? "success" : "default",
        text: mcp.enabled ? "启用" : "停用",
      }),
    ),
    mcp.description
      ? React.createElement(
          "div",
          {
            style: {
              fontSize: 12,
              color: "#595959",
              marginBottom: 8,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            },
          },
          mcp.description,
        )
      : null,
    React.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      React.createElement(
        Tag,
        { color: "purple", style: { fontSize: 11 } },
        mcp.transport,
      ),
      mcp.tools && mcp.tools.length > 0
        ? React.createElement(
            Tag,
            { color: "blue", style: { fontSize: 11 } },
            `${mcp.tools.length} 个工具`,
          )
        : React.createElement(
            Tag,
            { style: { fontSize: 11 } },
            "全部工具",
          ),
      mcp.url
        ? React.createElement(
            Tag,
            {
              color: "geekblue",
              style: {
                fontSize: 11,
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            },
            mcp.url,
          )
        : null,
    ),
  );
}

function CapabilityCenterPage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo } = React;
  const {
    Spin,
    Empty,
    Input,
    Button,
    message: antdMsg,
    Row,
    Col,
    Drawer,
    Descriptions,
    Tag,
    Typography,
    List,
  } = getHost().antd;
  const { ReloadOutlined, PlusOutlined, SearchOutlined, ApiOutlined } =
    getHost().antdIcons || {};
  const { Text } = Typography;

  const [mcps, setMcps] = useState<MCPClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeMCP, setActiveMCP] = useState<MCPClientInfo | null>(null);

  const loadMCPs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMCPClients();
      setMcps(data);
    } catch (err: any) {
      antdMsg.error(err.message || "加载能力列表失败");
      setMcps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMCPs();
  }, [loadMCPs]);

  const filteredMCPs = useMemo(() => {
    if (!searchText.trim()) return mcps;
    const q = searchText.toLowerCase();
    return mcps.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.key.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.transport.toLowerCase().includes(q),
    );
  }, [mcps, searchText]);

  const enabledCount = mcps.filter((m) => m.enabled).length;
  const totalTools = mcps.reduce(
    (sum, m) => sum + (m.tools?.length || 0),
    0,
  );

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "能力中心",
      subtitle: `共 ${mcps.length} 个 MCP 客户端（${enabledCount} 个启用）· ${totalTools} 个工具`,
      extra: React.createElement(
        React.Fragment,
        null,
        React.createElement(
          Button,
          {
            icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined,
            onClick: loadMCPs,
            loading,
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: () => navigateTo("/mcp"),
          },
          "管理 MCP",
        ),
      ),
    }),
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(Input, {
        placeholder: "搜索能力名称、描述...",
        prefix: SearchOutlined ? React.createElement(SearchOutlined) : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 400 },
      }),
    ),
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
        )
      : filteredMCPs.length === 0
        ? React.createElement(Empty, {
            description: searchText
              ? "未找到匹配的能力"
              : "暂无 MCP 客户端，点击「管理 MCP」添加",
          })
        : React.createElement(
            Row,
            { gutter: [12, 12] },
            ...filteredMCPs.map((mcp) =>
              React.createElement(
                Col,
                { key: mcp.key, xs: 24, sm: 12, md: 8, lg: 6 },
                React.createElement(CapabilityCard, {
                  mcp,
                  onClick: () => {
                    setActiveMCP(mcp);
                    setDrawerOpen(true);
                  },
                }),
              ),
            ),
          ),
    // Detail drawer
    activeMCP
      ? React.createElement(
          Drawer,
          {
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement("span", { style: { fontSize: 18 } }, "🔌"),
              React.createElement("span", null, activeMCP.name || activeMCP.key),
            ),
            open: drawerOpen,
            onClose: () => setDrawerOpen(false),
            width: 480,
          },
          React.createElement(
            Descriptions,
            { column: 1, bordered: true, size: "small" },
            React.createElement(
              Descriptions.Item,
              { label: "Key" },
              React.createElement(
                "code",
                { style: { fontSize: 12 } },
                activeMCP.key,
              ),
            ),
            React.createElement(
              Descriptions.Item,
              { label: "名称" },
              activeMCP.name || "-",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "描述" },
              activeMCP.description || "-",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "状态" },
              React.createElement(
                Tag,
                { color: activeMCP.enabled ? "green" : "default" },
                activeMCP.enabled ? "启用" : "停用",
              ),
            ),
            React.createElement(
              Descriptions.Item,
              { label: "传输方式" },
              activeMCP.transport,
            ),
            activeMCP.url
              ? React.createElement(
                  Descriptions.Item,
                  { label: "URL" },
                  activeMCP.url,
                )
              : null,
            activeMCP.command
              ? React.createElement(
                  Descriptions.Item,
                  { label: "命令" },
                  React.createElement(
                    "code",
                    { style: { fontSize: 11 } },
                    activeMCP.command,
                  ),
                )
              : null,
            activeMCP.args && activeMCP.args.length > 0
              ? React.createElement(
                  Descriptions.Item,
                  { label: "参数" },
                  activeMCP.args.join(" "),
                )
              : null,
          ),
          activeMCP.tools && activeMCP.tools.length > 0
            ? React.createElement(
                "div",
                { style: { marginTop: 16 } },
                React.createElement(
                  Text,
                  { strong: true, style: { display: "block", marginBottom: 8 } },
                  "提供的工具",
                ),
                React.createElement(List, {
                  size: "small",
                  dataSource: activeMCP.tools,
                  renderItem: (tool: string) =>
                    React.createElement(
                      List.Item,
                      null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        ApiOutlined
                          ? React.createElement(ApiOutlined, {
                              style: { fontSize: 12, color: "#1677ff" },
                            })
                          : null,
                        React.createElement(
                          Text,
                          { style: { fontSize: 12 } },
                          tool,
                        ),
                      ),
                    ),
                }),
              )
            : React.createElement(
                "div",
                { style: { marginTop: 16, fontSize: 12, color: "#8c8c8c" } },
                "此 MCP 客户端未设置工具白名单（所有工具均可用）",
              ),
        )
      : null,
  );
}

// ─── Skill Center Page ────────────────────────────────────────────────────────

function SkillCenterPage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo } = React;
  const {
    Spin,
    Empty,
    Input,
    Button,
    message: antdMsg,
    Row,
    Col,
    Card,
    Tag,
    Typography,
    Drawer,
    Descriptions,
    List,
  } = getHost().antd;
  const {
    ReloadOutlined,
    SearchOutlined,
    DownloadOutlined,
    ThunderboltOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [poolSkills, setPoolSkills] = useState<PoolSkillSpec[]>([]);
  const [workspaceSkills, setWorkspaceSkills] = useState<
    WorkspaceSkillSummary[]
  >([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState<PoolSkillSpec | null>(null);
  const [installedAgents, setInstalledAgents] = useState<string[]>([]);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    try {
      const [pool, agentList, wsSkills] = await Promise.all([
        fetchPoolSkills(),
        fetchAgents(),
        fetchWorkspaceSkills(),
      ]);
      setPoolSkills(pool);
      setAgents(agentList);
      setWorkspaceSkills(wsSkills);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能列表失败");
      setPoolSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const filteredSkills = useMemo(() => {
    if (!searchText.trim()) return poolSkills;
    const q = searchText.toLowerCase();
    return poolSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [poolSkills, searchText]);

  const computeInstalledAgents = useCallback(
    (skillName: string): string[] => {
      const result: string[] = [];
      for (const ws of workspaceSkills) {
        if (ws.skills.some((s) => s.name === skillName)) {
          const agent = agents.find((a) => a.id === ws.agent_id);
          result.push(agent?.name || ws.agent_name || ws.agent_id);
        }
      }
      return result;
    },
    [workspaceSkills, agents],
  );

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "技能中心",
      subtitle: `技能池共 ${poolSkills.length} 个技能`,
      extra: React.createElement(
        React.Fragment,
        null,
        React.createElement(
          Button,
          {
            icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined,
            onClick: loadSkills,
            loading,
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            icon: DownloadOutlined
              ? React.createElement(DownloadOutlined)
              : undefined,
            onClick: () => navigateTo("/skill-pool"),
          },
          "管理技能池",
        ),
      ),
    }),
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(Input, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: SearchOutlined ? React.createElement(SearchOutlined) : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 400 },
      }),
    ),
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
        )
      : filteredSkills.length === 0
        ? React.createElement(Empty, {
            description: searchText ? "未找到匹配的技能" : "技能池为空",
          })
        : React.createElement(
            Row,
            { gutter: [12, 12] },
            ...filteredSkills.map((skill) =>
              React.createElement(
                Col,
                { key: skill.name, xs: 24, sm: 12, md: 8, lg: 6 },
                React.createElement(
                  Card,
                  {
                    hoverable: true,
                    size: "small",
                    style: { cursor: "pointer", height: "100%" },
                    onClick: () => {
                      setActiveSkill(skill);
                      setInstalledAgents(computeInstalledAgents(skill.name));
                      setDrawerOpen(true);
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      },
                    },
                    skill.emoji
                      ? React.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          skill.emoji,
                        )
                      : React.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          "⚡",
                        ),
                    React.createElement(
                      Text,
                      {
                        strong: true,
                        style: {
                          fontSize: 13,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      },
                      skill.name,
                    ),
                    skill.protected
                      ? React.createElement(
                          Tag,
                          { color: "gold", style: { fontSize: 10 } },
                          "内置",
                        )
                      : null,
                  ),
                  skill.description
                    ? React.createElement(
                        Paragraph,
                        {
                          type: "secondary",
                          style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                          ellipsis: { rows: 2 },
                        },
                        skill.description,
                      )
                    : null,
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 8,
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                      },
                    },
                    skill.version_text
                      ? React.createElement(
                          Tag,
                          { style: { fontSize: 10 } },
                          `v${skill.version_text}`,
                        )
                      : null,
                    ...skill.tags
                      ?.slice(0, 3)
                      .map((tag, i) =>
                        React.createElement(
                          Tag,
                          { key: i, color: "cyan", style: { fontSize: 10 } },
                          tag,
                        ),
                      ),
                  ),
                ),
              ),
            ),
          ),
    // Skill detail drawer
    activeSkill
      ? React.createElement(
          Drawer,
          {
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement(
                "span",
                { style: { fontSize: 18 } },
                activeSkill.emoji || "⚡",
              ),
              React.createElement("span", null, activeSkill.name),
            ),
            open: drawerOpen,
            onClose: () => setDrawerOpen(false),
            width: 520,
            extra: React.createElement(
              Button,
              {
                type: "primary",
                size: "small",
                icon: ThunderboltOutlined
                  ? React.createElement(ThunderboltOutlined)
                  : undefined,
                onClick: () => navigateTo("/skills"),
              },
              "管理技能",
            ),
          },
          React.createElement(
            Descriptions,
            { column: 1, bordered: true, size: "small" },
            React.createElement(
              Descriptions.Item,
              { label: "技能名称" },
              activeSkill.name,
            ),
            React.createElement(
              Descriptions.Item,
              { label: "描述" },
              activeSkill.description || "-",
            ),
            activeSkill.version_text
              ? React.createElement(
                  Descriptions.Item,
                  { label: "版本" },
                  activeSkill.version_text,
                )
              : null,
            React.createElement(
              Descriptions.Item,
              { label: "来源" },
              activeSkill.source || "-",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "受保护" },
              activeSkill.protected ? "是（内置）" : "否",
            ),
            activeSkill.sync_status
              ? React.createElement(
                  Descriptions.Item,
                  { label: "同步状态" },
                  activeSkill.sync_status,
                )
              : null,
            activeSkill.installed_from
              ? React.createElement(
                  Descriptions.Item,
                  { label: "安装来源" },
                  activeSkill.installed_from,
                )
              : null,
          ),
          // Tags
          activeSkill.tags && activeSkill.tags.length > 0
            ? React.createElement(
                "div",
                { style: { marginTop: 16 } },
                React.createElement(
                  Text,
                  { strong: true, style: { display: "block", marginBottom: 8 } },
                  "标签",
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
                  ...activeSkill.tags.map((tag, i) =>
                    React.createElement(Tag, { key: i, color: "cyan" }, tag),
                  ),
                ),
              )
            : null,
          // Installed agents
          React.createElement(
            "div",
            { style: { marginTop: 16 } },
            React.createElement(
              Text,
              { strong: true, style: { display: "block", marginBottom: 8 } },
              `已安装此技能的专家 (${installedAgents.length})`,
            ),
            installedAgents.length > 0
              ? React.createElement(List, {
                  size: "small",
                  dataSource: installedAgents,
                  renderItem: (agentName: string) =>
                    React.createElement(
                      List.Item,
                      null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        React.createElement("span", null, "🧑‍🔬"),
                        React.createElement(
                          Text,
                          { style: { fontSize: 13 } },
                          agentName,
                        ),
                      ),
                    ),
                })
              : React.createElement(
                  Text,
                  { type: "secondary", style: { fontSize: 12 } },
                  "暂无专家安装此技能",
                ),
          ),
        )
      : null,
  );
}

// ─── Plugin Registration ──────────────────────────────────────────────────────

function buildPlugin() {
  const QP = (window as any).QwenPaw;
  if (!QP?.menu || !QP?.route) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled",
    );
    return;
  }

  const React = getHost().React;
  const PLUGIN_ID = "ugsci";

  // ── Register Routes + Menu Items ─────────────────────────────────────
  // Use the new QwenPaw.route.add / QwenPaw.menu.add API so items appear
  // in the agent-scoped section, not under plugins-group.

  // Expert Center
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: ExpertCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家中心",
    icon: React.createElement("span", { style: { fontSize: 16 } }, "🧑‍🔬"),
    route: "ugsci.experts",
    order: 5,
    visible: () => isSimpleMode(),
  });

  // Capability Center
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: CapabilityCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "能力中心",
    icon: React.createElement("span", { style: { fontSize: 16 } }, "🔌"),
    route: "ugsci.capabilities",
    order: 6,
    visible: () => isSimpleMode(),
  });

  // Skill Center
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: SkillCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能中心",
    icon: React.createElement("span", { style: { fontSize: 16 } }, "⚡"),
    route: "ugsci.skills-center",
    order: 7,
    visible: () => isSimpleMode(),
  });

  // ── Register for Simple Mode ─────────────────────────────────────────
  // Register the three center IDs so they remain visible when the user
  // switches the sidebar to "simple" mode.  Without this, the sidebar's
  // whitelist filter would hide plugin entries in simple mode.
  if (QP.sidebar?.registerSimpleModeItems) {
    QP.sidebar.registerSimpleModeItems([
      "ugsci.experts",
      "ugsci.capabilities",
      "ugsci.skills-center",
    ]);
    console.info("[ugsci] Registered 3 items for simple-mode visibility");
  } else {
    console.warn(
      "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode",
    );
  }

  // ── Simplify Navigation (Simple Mode only) ────────────────────────────
  // In simple mode, hide these built-in items because the three UGSci
  // centers provide a simpler, domain-focused alternative.
  // In full mode, ALL built-in items remain visible (original QwenPaw).
  // Items are hidden (not removed) via menu.replace with visible callback.

  const hideItems = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool",
  ];

  for (const itemId of hideItems) {
    // Try agent-scoped location
    try {
      const snapshot = QP.menu.snapshot("primary.agentScoped");
      const existing = snapshot.find((i: any) => i.id === itemId);
      if (existing) {
        QP.menu.replace(PLUGIN_ID, itemId, {
          ...existing,
          visible: () => !isSimpleMode(),
        });
      }
    } catch {}
    // Also try settings location (for skill-pool)
    try {
      const snapshot = QP.menu.snapshot("primary.settings");
      const existing = snapshot.find((i: any) => i.id === itemId);
      if (existing) {
        QP.menu.replace(PLUGIN_ID, itemId, {
          ...existing,
          visible: () => !isSimpleMode(),
        });
      }
    } catch {}
  }

  console.info(
    "[ugsci] Plugin registered: 3 routes + menu items, simple-mode whitelist + simplified navigation active",
  );
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

function tryBuildPlugin() {
  try {
    buildPlugin();
  } catch (err) {
    console.error("[ugsci] Failed to build plugin:", err);
    setTimeout(tryBuildPlugin, 500);
  }
}

// Wait for host to be ready
if ((window as any).QwenPaw?.host) {
  tryBuildPlugin();
} else {
  const interval = setInterval(() => {
    if ((window as any).QwenPaw?.host) {
      clearInterval(interval);
      tryBuildPlugin();
    }
  }, 200);
  setTimeout(() => clearInterval(interval), 10000);
}
