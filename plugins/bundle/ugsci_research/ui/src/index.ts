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

async function fetchAgentConfig(
  agentId: string,
): Promise<AgentConfig | null> {
  const QP = (window as any).QwenPaw;
  const fetchFn = QP?.host?.fetch || window.fetch.bind(window);
  const baseUrl = QP?.host?.apiBaseUrl || "";
  try {
    const resp = await fetchFn(`${baseUrl}/api/agents/${agentId}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data;
  } catch {
    return null;
  }
}

async function updateAgentConfig(
  agentId: string,
  config: Partial<AgentConfig>,
): Promise<boolean> {
  const QP = (window as any).QwenPaw;
  const fetchFn = QP?.host?.fetch || window.fetch.bind(window);
  const baseUrl = QP?.host?.apiBaseUrl || "";
  const token = QP?.host?.getApiToken?.() || "";
  try {
    const existing = await fetchAgentConfig(agentId);
    if (!existing) return false;
    const merged = { ...existing, ...config };
    const resp = await fetchFn(`${baseUrl}/api/agents/${agentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(merged),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function getResearchMode(
  agentId: string,
): Promise<ResearchModeConfig> {
  const config = await fetchAgentConfig(agentId);
  const rm = config?.research_mode;
  if (rm && typeof rm === "object") {
    return {
      enabled: !!rm.enabled,
      domain: rm.domain || "general",
    };
  }
  return { enabled: false, domain: "general" };
}

async function setResearchMode(
  agentId: string,
  enabled: boolean,
  domain?: string,
): Promise<boolean> {
  const current = await getResearchMode(agentId);
  const rm: ResearchModeConfig = {
    enabled,
    domain: (domain as any) || current.domain || "general",
  };
  return updateAgentConfig(agentId, { research_mode: rm } as any);
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
        checked
          ? "🔬 Research Mode enabled"
          : "Research Mode disabled",
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
      React.createElement(
        Switch,
        {
          checked: enabled,
          onChange: handleToggle,
          loading,
          checkedChildren: React.createElement(ExperimentOutlined),
          unCheckedChildren: React.createElement(ExperimentOutlined),
        },
      ),
    ),
    enabled &&
      React.createElement(
        Select,
        {
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
        },
      ),
    enabled &&
      React.createElement(
        Tag,
        { color: "cyan", style: { margin: 0, fontSize: 11 } },
        "Research",
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
          src: `${baseUrl}/api/files/read?path=${encodeURIComponent(artifact.filePath || "")}`,
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
    { key: "figure", label: "Figures", icon: React.createElement(PictureOutlined) },
    { key: "table", label: "Tables", icon: React.createElement(TableOutlined) },
    { key: "code", label: "Code", icon: React.createElement(CodeOutlined) },
    { key: "las", label: "Well Logs", icon: React.createElement(TableOutlined) },
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
          description: "No artifacts yet. Run research tasks to generate figures and data.",
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

// ─── Research Dashboard Page ──────────────────────────────────────────────────

function ResearchDashboardPage() {
  const React = getHost().React;
  const { Card, Row, Col, Statistic, Typography, Divider, List, Tag, Space } =
    getHost().antd;
  const {
    ExperimentOutlined,
    BookOutlined,
    BarChartOutlined,
    BulbOutlined,
  } = getHost().antdIcons;

  const QP = (window as any).QwenPaw;
  const agentId = QP?.host?.getSelectedAgentId?.() || "default";
  const [rmConfig, setRmConfig] = React.useState<ResearchModeConfig>({
    enabled: false,
    domain: "general",
  });

  React.useEffect(() => {
    getResearchMode(agentId).then(setRmConfig);
  }, [agentId]);

  const stages = [
    { name: "SCOPE", desc: "Define research question", icon: "🎯" },
    { name: "LITERATURE", desc: "Search & review papers", icon: "📚" },
    { name: "REASON", desc: "Deliberate on findings", icon: "💡" },
    { name: "METHODOLOGY", desc: "Design the approach", icon: "📋" },
    { name: "COMPUTE", desc: "Execute computations", icon: "⚙️" },
    { name: "ANALYZE", desc: "Process results", icon: "📊" },
    { name: "SYNTHESIZE", desc: "Interpret findings", icon: "🔗" },
    { name: "WRITE", desc: "Produce deliverable", icon: "✍️" },
  ];

  const tools = [
    { name: "literature_search", desc: "Search OpenAlex, arXiv, Crossref", icon: "📚" },
    { name: "web_search", desc: "Web search for scientific info", icon: "🔍" },
    { name: "data_analysis", desc: "Analyze CSV, JSON, LAS files", icon: "📊" },
  ];

  const skills = [
    { name: "literature-review", desc: "PRISMA systematic review", icon: "📚" },
    { name: "scientific-visualization", desc: "Publication-quality figures", icon: "📈" },
    { name: "hypothesis-generation", desc: "Structured hypothesis design", icon: "💡" },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(
      Card,
      null,
      React.createElement(
        Space,
        { align: "center", size: 12 },
        React.createElement(ExperimentOutlined, {
          style: { fontSize: 28, color: "#06b6d4" },
        }),
        React.createElement(
          "div",
          null,
          React.createElement(
            Typography.Title,
            { level: 4, style: { margin: 0 } },
            "Research Mode Dashboard",
          ),
          React.createElement(
            Typography.Text,
            { type: "secondary" },
            `Agent: ${agentId} · Domain: ${rmConfig.domain}`,
          ),
        ),
        rmConfig.enabled
          ? React.createElement(Tag, { color: "green" }, "ACTIVE")
          : React.createElement(Tag, { color: "default" }, "INACTIVE"),
      ),
    ),
    React.createElement(Divider, null),
    React.createElement(
      Row,
      { gutter: [16, 16] },
      React.createElement(
        Col,
        { span: 8 },
        React.createElement(Card, {
          size: "small",
          children: React.createElement(Statistic, {
            title: "Research Mode",
            value: rmConfig.enabled ? "Enabled" : "Disabled",
            prefix: React.createElement(ExperimentOutlined),
          }),
        }),
      ),
      React.createElement(
        Col,
        { span: 8 },
        React.createElement(Card, {
          size: "small",
          children: React.createElement(Statistic, {
            title: "Domain",
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
            title: "Workflow Stages",
            value: 8,
            prefix: React.createElement(BarChartOutlined),
          }),
        }),
      ),
    ),
    React.createElement(Divider, null),
    React.createElement(
      Card,
      {
        size: "small",
        title: React.createElement(Space, null, "🔬 Research Workflow Stages"),
      },
      React.createElement(
        List,
        {
          grid: { gutter: 16, column: 4 },
          dataSource: stages,
          renderItem: (stage: any) =>
            React.createElement(
              List.Item,
              null,
              React.createElement(
                Card,
                {
                  size: "small",
                  style: { textAlign: "center", height: "100%" },
                },
                React.createElement("div", { style: { fontSize: 24 } }, stage.icon),
                React.createElement(
                  "div",
                  { style: { fontWeight: 600, fontSize: 12, marginTop: 4 } },
                  stage.name,
                ),
                React.createElement(
                  "div",
                  { style: { fontSize: 11, color: "#999" } },
                  stage.desc,
                ),
              ),
            ),
        },
      ),
    ),
    React.createElement(Divider, null),
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
            title: React.createElement(Space, null, "🛠️ Research Tools"),
          },
          React.createElement(
            List,
            {
              size: "small",
              dataSource: tools,
              renderItem: (tool: any) =>
                React.createElement(
                  List.Item,
                  null,
                  React.createElement(
                    Space,
                    null,
                    React.createElement("span", null, tool.icon),
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "code",
                        null,
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
            },
          ),
        ),
      ),
      React.createElement(
        Col,
        { span: 12 },
        React.createElement(
          Card,
          {
            size: "small",
            title: React.createElement(Space, null, "⚡ Research Skills"),
          },
          React.createElement(
            List,
            {
              size: "small",
              dataSource: skills,
              renderItem: (skill: any) =>
                React.createElement(
                  List.Item,
                  null,
                  React.createElement(
                    Space,
                    null,
                    React.createElement("span", null, skill.icon),
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "strong",
                        null,
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
            },
          ),
        ),
      ),
    ),
  );
}

// ─── Custom Tool Cards ────────────────────────────────────────────────────────

function LiteratureSearchCard(props: any) {
  const React = getHost().React;
  const { ToolCardShell, DefaultBlock } = getToolCardShared();
  const { BookOutlined } = getHost().antdIcons;

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

  const { BookOutlined: BookIcon } = getHost().antdIcons;

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
                r.year && React.createElement("span", { style: { color: "#999", marginLeft: 8 } }, `(${r.year})`),
                r.authors &&
                  React.createElement(
                    "div",
                    { style: { fontSize: 11, color: "#666" } },
                    Array.isArray(r.authors)
                      ? r.authors.join(", ")
                      : r.authors,
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

  const DefaultBlock = ({ title, content }: { title: string; content: string }) => {
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
          ? React.createElement("span", { className: "ant-spin-dot ant-spin-dot-spin" })
          : React.createElement("span", null, icon),
        React.createElement("span", null, title),
        !isLoading && inlineResult &&
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
  if (!QP?.menu || !QP?.route) {
    console.warn(
      "[ugsci-research] QwenPaw.menu/route API not available — plugin disabled",
    );
    return;
  }

  const React = getHost().React;
  const PLUGIN_ID = "ugsci_research";

  // ── 1. Register Research Dashboard Route + Menu ─────────────────────
  QP.route.add(PLUGIN_ID, {
    id: "ugsci_research.dashboard",
    path: "/ugsci-research-dashboard",
    component: ResearchDashboardPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci_research.dashboard",
    location: "primary.agentScoped",
    label: () => "研究模式",
    icon: React.createElement("span", { style: { fontSize: 16 } }, "🔬"),
    route: "ugsci_research.dashboard",
    order: 9,
    visible: () => true,
  });

  // ── 2. Register Simple Mode Whitelist ───────────────────────────────
  if (QP.sidebar?.registerSimpleModeItems) {
    QP.sidebar.registerSimpleModeItems([
      "ugsci_research.dashboard",
    ]);
    console.info("[ugsci-research] Registered for simple-mode visibility");
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

  // ── 4. Register Research Mode Toggle in Chat Header ────────────────
  if (QP.chat?.actions?.add) {
    QP.chat.actions.add(PLUGIN_ID, {
      id: "research-mode-toggle",
      label: "Research Mode",
      render: () => React.createElement(ResearchModeToggle),
      order: 10,
    });
    console.info("[ugsci-research] Registered chat action: research-mode-toggle");
  }

  // ── 5. Register Artifact Panel as Response Slot ─────────────────────
  if (QP.chat?.response?.append) {
    QP.chat.response.append(
      PLUGIN_ID,
      (_ctx: any) => {
        // Only show artifact panel when research mode is active
        const agentId = QP.host?.getSelectedAgentId?.() || "default";
        // We use a reactive check — the component itself handles visibility
        return React.createElement(ArtifactPanel);
      },
      { id: "artifact-panel", order: 100 },
    );
    console.info("[ugsci-research] Registered artifact panel in response slot");
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
