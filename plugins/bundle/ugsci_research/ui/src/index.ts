/**
 * UGSci Research — Frontend plugin for QwenPaw
 *
 * Registers:
 * 1. Research Mode toggle (parallel to Coding Mode toggle)
 * 2. Artifact panel — displays figures, plots, tables from research sessions
 * 3. Custom tool cards for research tools (literature_search, web_search, data_analysis)
 * 4. Research dashboard route
 *
 * Uses window.QwenPaw host API for all registrations.
 */

// ─── Host Access ─────────────────────────────────────────────────────────────

function getHost() {
  return (window as any).QwenPaw.host;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ResearchModeConfig {
  enabled: boolean;
  domain: "general" | "physics" | "biology" | "ml";
}

interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  research_mode?: ResearchModeConfig;
  [key: string]: any;
}

// ─── API Helpers ─────────────────────────────────────────────────────────────
//
// We use dedicated plugin endpoints (/api/ugsci-research/research-mode/{agentId})
// instead of the generic PUT /api/agents/{agentId} because AgentProfileConfig
// uses Pydantic extra="ignore", which silently drops the research_mode field.

/**
 * Build the full API URL for a plugin endpoint.
 *
 * host.getApiUrl(path) prepends `/api` automatically, so we pass the path
 * WITHOUT the `/api` prefix.  When host.getApiUrl is not available, we
 * fall back to constructing the URL manually.
 */
function _buildUrl(pathWithoutApi: string): string {
  const QP = (window as any).QwenPaw;
  const host = QP?.host;
  // host.getApiUrl adds /api prefix for us
  if (host?.getApiUrl) {
    return host.getApiUrl(pathWithoutApi);
  }
  // Fallback: construct manually
  const base = host?.apiBaseUrl || "";
  const p = pathWithoutApi.startsWith("/") ? pathWithoutApi : `/${pathWithoutApi}`;
  return `${base}/api${p}`;
}

/** Auth-aware fetch that uses host.fetch when available (adds auth headers). */
function _apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const QP = (window as any).QwenPaw;
  const host = QP?.host;
  // host.fetch already calls getApiUrl internally, which would double-prefix.
  // So we use window.fetch directly with the full URL we built above.
  const token = host?.getApiToken?.() || "";
  const headers: Record<string, string> = {
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  return window.fetch(url, { ...init, headers });
}

async function getResearchMode(agentId: string): Promise<ResearchModeConfig> {
  try {
    const url = _buildUrl(`/ugsci-research/research-mode/${encodeURIComponent(agentId)}`);
    const resp = await _apiFetch(url);
    if (!resp.ok) return { enabled: false, domain: "general" };
    const data = await resp.json();
    return {
      enabled: !!data.enabled,
      domain: data.domain || "general",
    };
  } catch {
    return { enabled: false, domain: "general" };
  }
}

async function setResearchMode(
  agentId: string,
  enabled: boolean,
  domain?: string,
): Promise<boolean> {
  try {
    const current = await getResearchMode(agentId);
    const body = {
      enabled,
      domain: domain || current.domain || "general",
    };
    const url = _buildUrl(`/ugsci-research/research-mode/${encodeURIComponent(agentId)}`);
    const resp = await _apiFetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// ─── Research Mode Toggle Component ──────────────────────────────────────────

function ResearchModeToggle() {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const { Switch, Select, Tag, Space, Tooltip, message } = getHost().antd;
  const { ExperimentOutlined } = getHost().antdIcons;

  const QP = (window as any).QwenPaw;
  const agentId = QP?.host?.getSelectedAgentId?.() || "default";
  const [enabled, setEnabled] = useState(false);
  const [domain, setDomain] = useState("general");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const rm = await getResearchMode(agentId);
    setEnabled(rm.enabled);
    setDomain(rm.domain);
  }, [agentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    const ok = await setResearchMode(agentId, checked);
    if (ok) {
      setEnabled(checked);
      message.success(
        checked ? "🔬 Research Mode enabled" : "Research Mode disabled",
      );
    } else {
      message.error("Failed to toggle Research Mode");
    }
    setLoading(false);
  };

  const handleDomainChange = async (value: string) => {
    setLoading(true);
    const ok = await setResearchMode(agentId, enabled, value);
    if (ok) {
      setDomain(value);
    }
    setLoading(false);
  };

  return React.createElement(
    Space,
    { size: 4, align: "center" },
    React.createElement(
      Tooltip,
      { title: "Toggle Research Mode (parallel to Coding Mode)" },
      React.createElement(Switch, {
        checked: enabled,
        onChange: handleToggle,
        loading,
        checkedChildren: React.createElement(ExperimentOutlined),
        unCheckedChildren: React.createElement(ExperimentOutlined),
      }),
    ),
    enabled &&
      React.createElement(Select, {
        size: "small",
        value: domain,
        onChange: handleDomainChange,
        loading,
        style: { width: 110 },
        options: [
          { value: "general", label: "🔬 General" },
          { value: "physics", label: "⚛️ Physics" },
          { value: "biology", label: "🧬 Biology" },
          { value: "ml", label: "🤖 ML" },
        ],
      }),
    enabled &&
      React.createElement(
        Tag,
        { color: "cyan", style: { margin: 0, fontSize: 11 } },
        "Research",
      ),
  );
}

// ─── Research Mode Header Toggle (button styled like CodingModeToggle) ───────

function ResearchModeHeaderToggle() {
  const host = getHost();
  const React = host.React;
  const { useState, useEffect, useCallback } = React;
  const { Tooltip, Select, message, Popover, Button, Space } = host.antd;
  const { ExperimentOutlined, SettingOutlined } = host.antdIcons;

  const QP = (window as any).QwenPaw;
  const agentId = QP?.host?.getSelectedAgentId?.() || "default";
  const [enabled, setEnabled] = useState(false);
  const [domain, setDomain] = useState("general");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const rm = await getResearchMode(agentId);
    setEnabled(rm.enabled);
    setDomain(rm.domain);
  }, [agentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleToggle = async () => {
    setLoading(true);
    const newEnabled = !enabled;
    const ok = await setResearchMode(agentId, newEnabled);
    if (ok) {
      setEnabled(newEnabled);
      message.success(newEnabled ? "🔬 研究模式已启用" : "研究模式已关闭");
    } else {
      message.error("切换研究模式失败");
    }
    setLoading(false);
  };

  const handleDomainChange = async (value: string) => {
    setLoading(true);
    const ok = await setResearchMode(agentId, enabled, value);
    if (ok) {
      setDomain(value);
    }
    setLoading(false);
  };

  const navigateToDashboard = () => {
    window.location.href = "/ugsci-research-dashboard";
  };

  const buttonStyle: any = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "6px",
    border: enabled ? "1.5px solid #06b6d4" : "1.5px solid rgba(0,0,0,0.12)",
    background: enabled ? "rgba(6,182,212,0.08)" : "transparent",
    color: enabled ? "#06b6d4" : "rgba(0,0,0,0.55)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.18s ease",
  };

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement?.classList?.contains("dark-mode");

  if (isDark) {
    buttonStyle.border = enabled ? "1.5px solid #22d3ee" : "1.5px solid rgba(255,255,255,0.15)";
    buttonStyle.color = enabled ? "#22d3ee" : "rgba(255,255,255,0.85)";
    buttonStyle.background = enabled ? "rgba(6,182,212,0.18)" : "transparent";
  }

  const settingsBtnStyle: any = {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 6px",
    borderRadius: "6px",
    border: "1.5px solid rgba(0,0,0,0.12)",
    background: "transparent",
    cursor: "pointer",
    color: "rgba(0,0,0,0.55)",
  };
  if (isDark) {
    settingsBtnStyle.border = "1.5px solid rgba(255,255,255,0.15)";
    settingsBtnStyle.color = "rgba(255,255,255,0.85)";
  }

  // Popover content: domain selector + dashboard link
  const popoverContent = React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 12, padding: 4, minWidth: 160 } },
    React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { style: { fontSize: 12, color: "#999", marginBottom: 4 } },
        "研究领域",
      ),
      React.createElement(Select, {
        size: "small",
        value: domain,
        onChange: handleDomainChange,
        loading,
        style: { width: "100%" },
        options: [
          { value: "general", label: "🔬 通用" },
          { value: "physics", label: "⚛️ 物理" },
          { value: "biology", label: "🧬 生物" },
          { value: "ml", label: "🤖 ML" },
        ],
      }),
    ),
    React.createElement(
      Button,
      {
        size: "small",
        type: "link",
        onClick: navigateToDashboard,
        style: { padding: 0, textAlign: "left" },
      },
      "研究面板 →",
    ),
  );

  return React.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
    React.createElement(
      Tooltip,
      {
        title: enabled ? `研究模式已开启 (${domain}) — 点击关闭` : "研究模式 — 点击启用",
        placement: "bottom",
      },
      React.createElement(
        "button",
        {
          type: "button",
          style: buttonStyle,
          onClick: () => void handleToggle(),
          disabled: loading,
          "aria-label": "Toggle Research Mode",
        },
        React.createElement("span", { style: { display: "flex", alignItems: "center" } }, "🔬"),
        React.createElement("span", { style: { lineHeight: 1 } }, enabled ? `研究 ${domain}` : "研究"),
      ),
    ),
    React.createElement(
      Popover,
      { content: popoverContent, placement: "bottomRight", trigger: "click" },
      React.createElement(
        "button",
        { type: "button", style: settingsBtnStyle, "aria-label": "Research settings" },
        React.createElement(SettingOutlined, { style: { fontSize: 12 } }),
      ),
    ),
  );
}

// ─── Artifact Panel Component ─────────────────────────────────────────────────

interface Artifact {
  id: string;
  type: "figure" | "table" | "code" | "text" | "las";
  title: string;
  content: string;
  language?: string;
  filePath?: string;
  createdAt?: number;
}

function ArtifactPanel() {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    Card,
    Tabs,
    Empty,
    Image,
    Table,
    Typography,
    Button,
    Space,
    Tag,
    Tooltip,
  } = getHost().antd;
  const {
    PictureOutlined,
    TableOutlined,
    CodeOutlined,
    FileTextOutlined,
    ReloadOutlined,
    DownloadOutlined,
  } = getHost().antdIcons;
  const ReactMarkdown = getHost().ReactMarkdown;
  const remarkGfm = getHost().remarkGfm;

  const QP = (window as any).QwenPaw;
  const sessionId = QP?.host?.getCurrentSessionId?.();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const fetchArtifacts = useCallback(async () => {
    setLoading(true);
    try {
      // Scan the workspace for generated artifacts (figures, tables, etc.)
      const fetchFn = QP?.host?.fetch || window.fetch.bind(window);
      const baseUrl = QP?.host?.apiBaseUrl || "";
      const agentId = QP?.host?.getSelectedAgentId?.() || "default";

      // Try to list files in the workspace
      const resp = await fetchFn(
        `${baseUrl}/api/files/list?path=.&agent_id=${agentId}`,
      );
      if (!resp.ok) {
        setArtifacts([]);
        return;
      }
      const data = await resp.json();
      const files: any[] = data.files || data.entries || [];

      const found: Artifact[] = [];
      for (const f of files) {
        const name = f.name || f.filename || "";
        const ext = name.split(".").pop()?.toLowerCase() || "";
        const isArtifact =
          /^(fig|figure|plot|chart|table|artifact)/i.test(name) ||
          ["png", "jpg", "jpeg", "svg", "csv", "json"].includes(ext);

        if (!isArtifact) continue;

        let type: Artifact["type"] = "text";
        if (["png", "jpg", "jpeg", "svg", "gif"].includes(ext)) {
          type = "figure";
        } else if (["csv", "tsv"].includes(ext)) {
          type = "table";
        } else if (["py", "js", "ts", "sh"].includes(ext)) {
          type = "code";
        } else if (ext === "las") {
          type = "las";
        }

        found.push({
          id: name,
          type,
          title: name,
          content: f.url || f.path || name,
          filePath: f.path || name,
          createdAt: f.modified || Date.now(),
        });
      }
      setArtifacts(found);
    } catch {
      setArtifacts([]);
    } finally {
      setLoading(false);
    }
  }, [QP]);

  useEffect(() => {
    fetchArtifacts();
  }, [fetchArtifacts]);

  const filtered = artifacts.filter((a) => {
    if (activeTab === "all") return true;
    return a.type === activeTab;
  });

  const renderArtifact = (artifact: Artifact) => {
    const baseUrl = (window as any).QwenPaw?.host?.apiBaseUrl || "";
    switch (artifact.type) {
      case "figure":
        return React.createElement(Image, {
          src: `${baseUrl}/api/files/read?path=${encodeURIComponent(
            artifact.filePath || "",
          )}`,
          alt: artifact.title,
          style: { maxWidth: "100%", borderRadius: 8 },
        });
      case "table":
        return React.createElement(
          "div",
          { style: { overflowX: "auto" } },
          React.createElement(Typography.Text, {
            code: true,
            children: artifact.filePath,
          }),
          React.createElement(
            "p",
            { style: { color: "#999", fontSize: 12 } },
            "CSV file — use data_analysis tool for detailed analysis",
          ),
        );
      case "code":
        return React.createElement(
          "pre",
          {
            style: {
              background: "rgba(0,0,0,0.04)",
              padding: 12,
              borderRadius: 8,
              overflow: "auto",
              fontSize: 12,
            },
          },
          artifact.content,
        );
      case "las":
        return React.createElement(
          "div",
          null,
          React.createElement(Tag, { color: "orange" }, "LAS Well Log"),
          React.createElement(
            "p",
            { style: { fontSize: 12, color: "#999" } },
            "Use data_analysis tool with operation='las_curves' for details",
          ),
          React.createElement(
            "pre",
            {
              style: {
                background: "rgba(0,0,0,0.04)",
                padding: 12,
                borderRadius: 8,
                overflow: "auto",
                fontSize: 11,
                maxHeight: 300,
              },
            },
            artifact.content,
          ),
        );
      default:
        return React.createElement(
          "div",
          { style: { fontSize: 13 } },
          ReactMarkdown
            ? React.createElement(ReactMarkdown, {
                remarkPlugins: remarkGfm ? [remarkGfm] : [],
                children: artifact.content,
              })
            : artifact.content,
        );
    }
  };

  const tabItems = [
    { key: "all", label: "All", icon: React.createElement(FileTextOutlined) },
    {
      key: "figure",
      label: "Figures",
      icon: React.createElement(PictureOutlined),
    },
    { key: "table", label: "Tables", icon: React.createElement(TableOutlined) },
    { key: "code", label: "Code", icon: React.createElement(CodeOutlined) },
    {
      key: "las",
      label: "Well Logs",
      icon: React.createElement(TableOutlined),
    },
  ];

  return React.createElement(
    Card,
    {
      size: "small",
      title: React.createElement(
        Space,
        null,
        React.createElement(PictureOutlined),
        "Artifacts",
        React.createElement(
          Tag,
          { color: "blue", style: { fontSize: 10 } },
          String(artifacts.length),
        ),
      ),
      extra: React.createElement(
        Space,
        null,
        React.createElement(
          Tooltip,
          { title: "Refresh" },
          React.createElement(Button, {
            size: "small",
            type: "text",
            icon: React.createElement(ReloadOutlined),
            onClick: fetchArtifacts,
            loading,
          }),
        ),
      ),
      style: { height: "100%", overflow: "auto" },
    },
    artifacts.length === 0
      ? React.createElement(Empty, {
          description:
            "No artifacts yet. Run research tasks to generate figures and data.",
          image: Empty.PRESENTED_IMAGE_SIMPLE,
        })
      : React.createElement(Tabs, {
          activeKey: activeTab,
          onChange: setActiveTab,
          size: "small",
          items: tabItems.map((t) => ({
            key: t.key,
            label: React.createElement(Space, { size: 4 }, t.icon, t.label),
            children: React.createElement(
              "div",
              { style: { display: "grid", gap: 12 } },
              filtered.map((a) =>
                React.createElement(
                  Card,
                  {
                    key: a.id,
                    size: "small",
                    title: a.title,
                    extra: React.createElement(
                      Tag,
                      { color: a.type === "figure" ? "green" : "blue" },
                      a.type,
                    ),
                  },
                  renderArtifact(a),
                ),
              ),
            ),
          })),
        }),
  );
}

// ─── Artifact Panel Wrapper (for right-side chat panel) ───────────────────────────────────────

function ArtifactPanelWrapper() {
  const host = getHost();
  const React = host.React;
  const { useState, useEffect } = React;
  const { Button, Tooltip } = host.antd;
  const { PictureOutlined } = host.antdIcons;

  const [collapsed, setCollapsed] = useState(false);
  const QP = (window as any).QwenPaw;
  const agentId = QP?.host?.getSelectedAgentId?.() || "default";
  const [rmEnabled, setRmEnabled] = useState(false);

  // Check if research mode is enabled; only show panel when active
  useEffect(() => {
    let mounted = true;
    getResearchMode(agentId).then((rm) => {
      if (mounted) setRmEnabled(rm.enabled);
    });
    const interval = setInterval(() => {
      getResearchMode(agentId).then((rm) => {
        if (mounted) setRmEnabled(rm.enabled);
      });
    }, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, [agentId]);

  if (!rmEnabled) return null;

  const panelStyle = {
    width: collapsed ? 44 : 320,
    flexShrink: 0,
    height: "100%",
    overflow: "hidden",
    borderLeft: "1px solid rgba(0,0,0,0.06)",
    transition: "width 0.2s ease",
    display: "flex",
    flexDirection: "column" as const,
  };

  const isDark = typeof document !== "undefined" && document.documentElement?.classList?.contains("dark-mode");
  if (isDark) {
    panelStyle.borderLeft = "1px solid rgba(255,255,255,0.08)";
    (panelStyle as any).background = "#1e1e1e";
  }

  if (collapsed) {
    return React.createElement(
      "div",
      { style: { ...panelStyle, alignItems: "center", paddingTop: 8 } },
      React.createElement(
        Tooltip,
        { title: "Expand Artifacts", placement: "left" },
        React.createElement(Button, {
          type: "text",
          size: "small",
          icon: React.createElement(PictureOutlined),
          onClick: () => setCollapsed(false),
        }),
      ),
    );
  }

  return React.createElement(
    "div",
    { style: panelStyle },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          fontSize: 13,
          fontWeight: 600,
          color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
        },
      },
      React.createElement("span", null, "\ud83d\udcd7 Artifacts"),
      React.createElement(
        Tooltip,
        { title: "Collapse", placement: "left" },
        React.createElement(
          Button,
          { type: "text", size: "small", onClick: () => setCollapsed(true), style: { fontSize: 12 } },
          "\u2039",
        ),
      ),
    ),
    React.createElement(
      "div",
      { style: { flex: 1, overflow: "auto", padding: 8 } },
      React.createElement(ArtifactPanel),
    ),
  );
}

// ─── Research Dashboard Page ──────────────────────────────────────────────────

function ResearchDashboardPage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Divider,
    List,
    Tag,
    Space,
    Button,
    Select,
    Tooltip,
    message,
  } = getHost().antd;
  const {
    ExperimentOutlined,
    BookOutlined,
    BarChartOutlined,
    BulbOutlined,
    ArrowRightOutlined,
    ThunderboltOutlined,
  } = getHost().antdIcons;

  const QP = (window as any).QwenPaw;
  const agentId = QP?.host?.getSelectedAgentId?.() || "default";
  const [rmConfig, setRmConfig] = useState<ResearchModeConfig>({
    enabled: false,
    domain: "general",
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const rm = await getResearchMode(agentId);
    setRmConfig(rm);
  }, [agentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleToggle = async () => {
    setLoading(true);
    const ok = await setResearchMode(agentId, !rmConfig.enabled);
    if (ok) {
      setRmConfig({ ...rmConfig, enabled: !rmConfig.enabled });
      message.success(
        !rmConfig.enabled ? "🔬 研究模式已启用" : "研究模式已关闭",
      );
    } else {
      message.error("切换研究模式失败");
    }
    setLoading(false);
  };

  const handleDomainChange = async (value: string) => {
    setLoading(true);
    const ok = await setResearchMode(agentId, rmConfig.enabled, value);
    if (ok) {
      setRmConfig({ ...rmConfig, domain: value });
    }
    setLoading(false);
  };

  const navigateToChat = () => {
    window.location.href = "/chat";
  };

  const navigateToSkillPool = () => {
    window.location.href = "/skill-pool";
  };

  const stages = [
    { name: "SCOPE", desc: "定义研究问题", icon: "🎯" },
    { name: "LITERATURE", desc: "检索与综述文献", icon: "📚" },
    { name: "REASON", desc: "推理与思考", icon: "💡" },
    { name: "METHODOLOGY", desc: "设计研究方法", icon: "📋" },
    { name: "COMPUTE", desc: "执行计算", icon: "⚙️" },
    { name: "ANALYZE", desc: "分析结果", icon: "📊" },
    { name: "SYNTHESIZE", desc: "综合解读", icon: "🔗" },
    { name: "WRITE", desc: "撰写成果", icon: "✍️" },
  ];

  const tools = [
    {
      name: "literature_search",
      desc: "搜索 OpenAlex、arXiv、Crossref",
      icon: "📚",
      action: "在对话中使用 /research on 后自动可用",
    },
    {
      name: "web_search",
      desc: "网络搜索科学信息",
      icon: "🔍",
      action: "在对话中使用 /research on 后自动可用",
    },
    {
      name: "data_analysis",
      desc: "分析 CSV、JSON、LAS 测井文件",
      icon: "📊",
      action: "在对话中使用 /research on 后自动可用",
    },
  ];

  const skills = [
    { name: "literature-review", desc: "PRISMA 系统综述", icon: "📚" },
    { name: "scientific-visualization", desc: "出版级图表绘制", icon: "📈" },
    { name: "hypothesis-generation", desc: "结构化假说设计", icon: "💡" },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24, maxWidth: 1200, margin: "0 auto" } },
    // ── Header Card with Toggle ──
    React.createElement(
      Card,
      null,
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 } },
        React.createElement(
          Space,
          { align: "center", size: 12 },
          React.createElement(ExperimentOutlined, {
            style: { fontSize: 28, color: rmConfig.enabled ? "#06b6d4" : "#999" },
          }),
          React.createElement(
            "div",
            null,
            React.createElement(
              Typography.Title,
              { level: 4, style: { margin: 0 } },
              "研究模式",
            ),
            React.createElement(
              Typography.Text,
              { type: "secondary" },
              `Agent: ${agentId}`,
            ),
          ),
          rmConfig.enabled
            ? React.createElement(Tag, { color: "green" }, "已启用")
            : React.createElement(Tag, { color: "default" }, "未启用"),
        ),
        React.createElement(
          Space,
          { size: 8 },
          React.createElement(Select, {
            size: "small",
            value: rmConfig.domain,
            onChange: handleDomainChange,
            loading,
            style: { width: 120 },
            options: [
              { value: "general", label: "🔬 通用" },
              { value: "physics", label: "⚛️ 物理" },
              { value: "biology", label: "🧬 生物" },
              { value: "ml", label: "🤖 ML" },
            ],
          }),
          React.createElement(
            Button,
            {
              type: rmConfig.enabled ? "default" : "primary",
              danger: rmConfig.enabled,
              loading,
              onClick: handleToggle,
              icon: React.createElement(ExperimentOutlined),
            },
            rmConfig.enabled ? "关闭研究模式" : "启用研究模式",
          ),
        ),
      ),
    ),
    React.createElement(Divider, null),
    // ── Stats Row ──
    React.createElement(
      Row,
      { gutter: [16, 16] },
      React.createElement(
        Col,
        { span: 8 },
        React.createElement(Card, {
          size: "small",
          children: React.createElement(Statistic, {
            title: "研究模式",
            value: rmConfig.enabled ? "已启用" : "未启用",
            prefix: React.createElement(ExperimentOutlined),
            valueStyle: rmConfig.enabled
              ? { color: "#06b6d4" }
              : { color: "#999" },
          }),
        }),
      ),
      React.createElement(
        Col,
        { span: 8 },
        React.createElement(Card, {
          size: "small",
          children: React.createElement(Statistic, {
            title: "研究领域",
            value: rmConfig.domain,
            prefix: React.createElement(BookOutlined),
          }),
        }),
      ),
      React.createElement(
        Col,
        { span: 8 },
        React.createElement(Card, {
          size: "small",
          children: React.createElement(Statistic, {
            title: "工作流阶段",
            value: 8,
            prefix: React.createElement(BarChartOutlined),
          }),
        }),
      ),
    ),
    React.createElement(Divider, null),
    // ── Start Research Button ──
    React.createElement(
      "div",
      { style: { textAlign: "center", marginBottom: 24 } },
      React.createElement(
        Button,
        {
          type: "primary",
          size: "large",
          icon: React.createElement(ThunderboltOutlined),
          disabled: !rmConfig.enabled,
          onClick: navigateToChat,
          style: rmConfig.enabled
            ? { background: "#06b6d4", borderColor: "#06b6d4" }
            : {},
        },
        "开始研究对话",
      ),
      !rmConfig.enabled &&
        React.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 12, color: "#999" } },
          "请先启用研究模式",
        ),
    ),
    // ── Workflow Stages ──
    React.createElement(
      Card,
      {
        size: "small",
        title: React.createElement(Space, null, "🔬 研究工作流阶段"),
        style: { marginBottom: 16 },
      },
      React.createElement(List, {
        grid: { gutter: 16, column: 4 },
        dataSource: stages,
        renderItem: (stage: any, index: number) =>
          React.createElement(
            List.Item,
            null,
            React.createElement(
              Tooltip,
              { title: `${stage.name} — ${stage.desc}` },
              React.createElement(
                Card,
                {
                  size: "small",
                  hoverable: true,
                  style: {
                    textAlign: "center",
                    height: "100%",
                    cursor: "pointer",
                    borderLeft: rmConfig.enabled
                      ? "3px solid #06b6d4"
                      : "3px solid #e8e8e8",
                    opacity: rmConfig.enabled ? 1 : 0.6,
                  },
                },
                React.createElement(
                  "div",
                  { style: { fontSize: 24 } },
                  stage.icon,
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontWeight: 600,
                      fontSize: 12,
                      marginTop: 4,
                    },
                  },
                  stage.name,
                ),
                React.createElement(
                  "div",
                  { style: { fontSize: 11, color: "#999" } },
                  stage.desc,
                ),
              ),
            ),
          ),
      }),
    ),
    // ── Tools + Skills ──
    React.createElement(
      Row,
      { gutter: [16, 16] },
      React.createElement(
        Col,
        { span: 12 },
        React.createElement(
          Card,
          {
            size: "small",
            title: React.createElement(Space, null, "🛠️ 研究工具"),
          },
          React.createElement(List, {
            size: "small",
            dataSource: tools,
            renderItem: (tool: any) =>
              React.createElement(
                List.Item,
                {
                  actions: [
                    React.createElement(
                      Tooltip,
                      { title: tool.action },
                      React.createElement(
                        Tag,
                        { color: rmConfig.enabled ? "cyan" : "default" },
                        rmConfig.enabled ? "可用" : "未启用",
                      ),
                    ),
                  ],
                },
                React.createElement(
                  "div",
                  { style: { cursor: "default" } },
                  React.createElement(
                    Space,
                    null,
                    React.createElement("span", { style: { fontSize: 18 } }, tool.icon),
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "code",
                        { style: { fontSize: 13, fontWeight: 600 } },
                        tool.name,
                      ),
                      React.createElement("br"),
                      React.createElement(
                        Typography.Text,
                        { type: "secondary", style: { fontSize: 11 } },
                        tool.desc,
                      ),
                    ),
                  ),
                ),
              ),
          }),
        ),
      ),
      React.createElement(
        Col,
        { span: 12 },
        React.createElement(
          Card,
          {
            size: "small",
            title: React.createElement(Space, null, "⚡ 研究技能"),
            extra: React.createElement(
              Button,
              {
                size: "small",
                type: "link",
                onClick: navigateToSkillPool,
                icon: React.createElement(ArrowRightOutlined),
              },
              "技能池",
            ),
          },
          React.createElement(List, {
            size: "small",
            dataSource: skills,
            renderItem: (skill: any) =>
              React.createElement(
                List.Item,
                null,
                React.createElement(
                  "div",
                  {
                    style: { cursor: "pointer", width: "100%" },
                    onClick: navigateToSkillPool,
                  },
                  React.createElement(
                    Space,
                    null,
                    React.createElement("span", { style: { fontSize: 18 } }, skill.icon),
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "strong",
                        { style: { fontSize: 13 } },
                        skill.name,
                      ),
                      React.createElement("br"),
                      React.createElement(
                        Typography.Text,
                        { type: "secondary", style: { fontSize: 11 } },
                        skill.desc,
                      ),
                    ),
                  ),
                ),
              ),
          }),
        ),
      ),
    ),
  );
}

// ─── Custom Tool Cards ────────────────────────────────────────────────────────

function LiteratureSearchCard(props: any) {
  const React = getHost().React;
  const { ToolCardShell, DefaultBlock } = getToolCardShared();
  const { BookOutlined, Tag } = { ...getHost().antdIcons, ...getHost().antd };

  const content = props.data || props.content || {};
  const params = content.params || {};
  const query = params.query || "";
  const source = params.source || "all";

  const resultText =
    typeof content.result === "string"
      ? content.result
      : JSON.stringify(content.result, null, 2);

  // Try to parse and render structured results
  let parsedResults: any[] = [];
  try {
    const data = JSON.parse(resultText);
    parsedResults = data.results || [];
  } catch {
    // Not JSON, show as text
  }

  return React.createElement(ToolCardShell, {
    content,
    isStreaming: props.isStreaming,
    icon: React.createElement(BookOutlined),
    title: `📚 Literature Search: "${query}" (${source})`,
    inlineResult: parsedResults.length
      ? `${parsedResults.length} results`
      : undefined,
    children: React.createElement(
      React.Fragment,
      null,
      parsedResults.length > 0
        ? React.createElement(
            "div",
            { style: { maxHeight: 400, overflow: "auto" } },
            parsedResults.slice(0, 10).map((r: any, i: number) =>
              React.createElement(
                "div",
                {
                  key: i,
                  style: {
                    padding: "8px 0",
                    borderBottom: i < 9 ? "1px solid #f0f0f0" : "none",
                  },
                },
                React.createElement(
                  "strong",
                  { style: { fontSize: 13 } },
                  r.title || "Untitled",
                ),
                r.year &&
                  React.createElement(
                    "span",
                    { style: { color: "#999", marginLeft: 8 } },
                    `(${r.year})`,
                  ),
                r.authors &&
                  React.createElement(
                    "div",
                    { style: { fontSize: 11, color: "#666" } },
                    Array.isArray(r.authors) ? r.authors.join(", ") : r.authors,
                  ),
                r.doi &&
                  React.createElement(
                    "code",
                    { style: { fontSize: 10 } },
                    r.doi,
                  ),
                r.abstract &&
                  React.createElement(
                    "div",
                    { style: { fontSize: 11, color: "#999", marginTop: 4 } },
                    r.abstract.substring(0, 200) + "...",
                  ),
                React.createElement(
                  Tag,
                  { style: { fontSize: 10, marginTop: 4 } },
                  r.source || "unknown",
                ),
              ),
            ),
          )
        : React.createElement(DefaultBlock, {
            title: "Output",
            content: resultText,
          }),
    ),
  });
}

function WebSearchCard(props: any) {
  const React = getHost().React;
  const { ToolCardShell, DefaultBlock } = getToolCardShared();
  const { SearchOutlined } = getHost().antdIcons;

  const content = props.data || props.content || {};
  const params = content.params || {};
  const query = params.query || "";

  const resultText =
    typeof content.result === "string"
      ? content.result
      : JSON.stringify(content.result, null, 2);

  return React.createElement(ToolCardShell, {
    content,
    isStreaming: props.isStreaming,
    icon: React.createElement(SearchOutlined),
    title: `🔍 Web Search: "${query}"`,
    children: React.createElement(DefaultBlock, {
      title: "Output",
      content: resultText,
    }),
  });
}

function DataAnalysisCard(props: any) {
  const React = getHost().React;
  const { ToolCardShell, DefaultBlock } = getToolCardShared();
  const { BarChartOutlined } = getHost().antdIcons;

  const content = props.data || props.content || {};
  const params = content.params || {};
  const dataPath = params.data_path || "";
  const operation = params.operation || "summary";

  const resultText =
    typeof content.result === "string"
      ? content.result
      : JSON.stringify(content.result, null, 2);

  const fileName = dataPath.split("/").pop() || dataPath;

  return React.createElement(ToolCardShell, {
    content,
    isStreaming: props.isStreaming,
    icon: React.createElement(BarChartOutlined),
    title: `📊 Data Analysis: ${fileName} (${operation})`,
    children: React.createElement(DefaultBlock, {
      title: "Output",
      content: resultText,
    }),
  });
}

// ─── Tool Card Shared Helpers ─────────────────────────────────────────────────

let _toolCardShared: any = null;

function getToolCardShared() {
  if (_toolCardShared) return _toolCardShared;
  // These are built into the host and available via the plugin system
  // We create minimal versions that work with the host's styling
  const React = getHost().React;

  const DefaultBlock = ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => {
    return React.createElement(
      "div",
      { style: { margin: "4px 0 2px 18px" } },
      React.createElement(
        "div",
        { style: { fontSize: 11, color: "#999", marginBottom: 2 } },
        title,
      ),
      React.createElement(
        "pre",
        {
          style: {
            fontSize: 12,
            lineHeight: 1.5,
            padding: "8px 12px",
            background: "rgba(0,0,0,0.03)",
            borderRadius: 8,
            overflow: "auto",
            maxHeight: 360,
          },
        },
        content,
      ),
    );
  };

  const ToolCardShell = ({
    content,
    isStreaming,
    icon,
    title,
    inlineResult,
    children,
  }: any) => {
    const isLoading = content.status === "calling" && isStreaming;
    const isError = content.status === "error";

    return React.createElement(
      "details",
      {
        open: isLoading || isError,
        style: {
          margin: "4px 0",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 8,
          padding: "4px 8px",
        },
      },
      React.createElement(
        "summary",
        {
          style: {
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
          },
        },
        isLoading
          ? React.createElement("span", {
              className: "ant-spin-dot ant-spin-dot-spin",
            })
          : React.createElement("span", null, icon),
        React.createElement("span", null, title),
        !isLoading &&
          inlineResult &&
          React.createElement(
            "span",
            { style: { fontSize: 11, color: "#999", marginLeft: "auto" } },
            inlineResult,
          ),
      ),
      isError
        ? React.createElement(DefaultBlock, {
            title: "Error",
            content: JSON.stringify(content.result, null, 2),
          })
        : children,
    );
  };

  _toolCardShared = { ToolCardShell, DefaultBlock };
  return _toolCardShared;
}

// ─── Plugin Registration ──────────────────────────────────────────────────────

function buildPlugin() {
  const QP = (window as any).QwenPaw;
  if (!QP?.route) {
    console.warn(
      "[ugsci-research] QwenPaw.route API not available — plugin disabled",
    );
    return;
  }

  const React = getHost().React;
  const PLUGIN_ID = "ugsci_research";

  // ── 1. Register Research Dashboard Route (accessible from toggle) ──
  QP.route.add(PLUGIN_ID, {
    id: "ugsci_research.dashboard",
    path: "/ugsci-research-dashboard",
    component: ResearchDashboardPage,
  });

  // ── 2. Register Research Mode Toggle in Header (parallel to Coding Mode) ──
  // The host header renders `header.right`; older builds exposed a separate
  // `header.toggle` slot, which is no longer mounted and made this control
  // invisible. Keep the toggle in the live right-side header slot.
  if (QP.slot?.fill) {
    QP.slot.fill(
      PLUGIN_ID,
      "header.right",
      () => React.createElement(ResearchModeHeaderToggle),
      { id: "research-mode-toggle", order: 5 },
    );
    console.info("[ugsci-research] Registered header.right toggle");
  } else {
    // Fallback: use chat.rightHeader to place the toggle in the chat header
    if (QP.chat?.rightHeader?.add) {
      QP.chat.rightHeader.add(
        PLUGIN_ID,
        React.createElement(ResearchModeHeaderToggle),
        { id: "research-mode-toggle", order: 5 },
      );
      console.info("[ugsci-research] Registered chat.rightHeader toggle");
    }
  }

  // ── 3. Register Custom Tool Cards ───────────────────────────────────
  if (QP.registerToolRender) {
    QP.registerToolRender(PLUGIN_ID, {
      literature_search: LiteratureSearchCard,
      web_search: WebSearchCard,
      data_analysis: DataAnalysisCard,
    });
    console.info("[ugsci-research] Registered 3 custom tool cards");
  }

  // Also register via chat API if available
  if (QP.chat?.toolRender) {
    QP.chat.toolRender(PLUGIN_ID, "literature_search", LiteratureSearchCard);
    QP.chat.toolRender(PLUGIN_ID, "web_search", WebSearchCard);
    QP.chat.toolRender(PLUGIN_ID, "data_analysis", DataAnalysisCard);
  }

  // ── 4. Register Artifact Panel in the right-side chat panel slot ──
  //    This renders the Artifact panel on the right side of the chat
  //    window, parallel to the chat messages, instead of being appended
  //    after each response.
  if (QP.slot?.fill) {
    QP.slot.fill(PLUGIN_ID, "chat.rightPanel", () =>
      React.createElement(ArtifactPanelWrapper),
    );
    console.info("[ugsci-research] Registered artifact panel in chat.rightPanel slot");
  }

  console.info(
    "[ugsci-research] Plugin registered: dashboard route + tool cards + toggle + artifact panel",
  );
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

function tryBuildPlugin() {
  try {
    buildPlugin();
  } catch (err) {
    console.error("[ugsci-research] Failed to build plugin:", err);
    setTimeout(tryBuildPlugin, 500);
  }
}

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
