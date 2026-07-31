/**
 * Capability center page — MCP tab + Engine tab.
 */

import { getHost, clearApiCache, clearAgentCache } from "../core/runtime";
import { PRIMARY_BTN_STYLE, PageHeader } from "../core/shared";
import type { MCPClientInfo, MCPClientUpdate, MCPAccessPolicy } from "../core/types";
import {
  fetchAgentMCPClientsForCapabilities,
  createMCPClientForCapabilities,
  updateMCPClientForCapabilities,
  extractMCPKeys,
  toggleMCPClientForCapabilities,
  deleteMCPClientForCapabilities,
  updateMCPPolicyForCapabilities,
} from "../core/api";
import {
  MCP_CHANNEL_SOURCE_VALUES,
  CHANNEL_SOURCE_LABELS,
  normalizeSourceType,
  normalizeSourceValue,
  isWildcardSourceValue,
  normalizeSubjectType,
  normalizeMCPAccessRule,
} from "./mcpAccessPolicy";
import { CapabilityCard } from "./CapabilityCard";
import { EngineSection } from "./EngineSection";

// ─── Capability Center Page (with tabs) ───────────────────────────────────────

export function CapabilityCenterPage() {
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
    Tabs,
    Modal,
  } = getHost().antd;
  const {
    ReloadOutlined,
    PlusOutlined,
    SearchOutlined,
    ApiOutlined,
    RocketOutlined,
  } = getHost().antdIcons || {};
  const { TextArea } = Input;

  // ── Agent context (mirror console /mcp page) ──
  const host = getHost();
  const useSelectedAgent = host.useSelectedAgent;
  const selectedAgentInfo = useSelectedAgent ? useSelectedAgent() : null;
  const currentAgentId = selectedAgentInfo?.id || "default";

  // Clear agent-scoped cache when the selected agent changes to ensure
  // this page always loads fresh data for the current agent.
  useEffect(() => {
    clearAgentCache();
  }, [currentAgentId]);

  const [mcps, setMcps] = useState<MCPClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("mcp");

  // ── Create modal state (mirror console /mcp create) ──
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createJson, setCreateJson] = useState(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`);
  const [creating, setCreating] = useState(false);

  const loadMCPs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgentMCPClientsForCapabilities(currentAgentId);
      setMcps(data);
    } catch (err: any) {
      antdMsg.error(err.message || "加载 MCP 列表失败");
      setMcps([]);
    } finally {
      setLoading(false);
    }
  }, [currentAgentId]);

  useEffect(() => {
    loadMCPs();
  }, [loadMCPs]);

  // ── MCP CRUD handlers (mirror console /mcp page) ──
  const handleToggle = useCallback(
    async (mcp: MCPClientInfo) => {
      try {
        await toggleMCPClientForCapabilities(currentAgentId, mcp.key);
        antdMsg.success(mcp.enabled ? "已禁用" : "已启用");
        loadMCPs();
      } catch (err: any) {
        antdMsg.error(err.message || "切换状态失败");
      }
    },
    [currentAgentId, loadMCPs],
  );

  const handleDelete = useCallback(async (mcp: MCPClientInfo) => {
    try {
      await deleteMCPClientForCapabilities(currentAgentId, mcp.key);
      antdMsg.success(`MCP「${mcp.key}」已删除`);
      loadMCPs();
    } catch (err: any) {
      antdMsg.error(err.message || "删除失败");
    }
  }, [currentAgentId, loadMCPs]);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    try {
      const parsed = JSON.parse(createJson);
      const servers = parsed.mcpServers || parsed;
      const entries = Object.entries(servers);
      if (entries.length === 0) {
        antdMsg.warning("未找到 MCP 客户端配置");
        return;
      }
      let allSuccess = true;
      for (const [clientKey, cfg] of entries) {
        const clientCfg = cfg as Record<string, unknown>;
        const transport = clientCfg.url
          ? "streamable_http"
          : "stdio";
        const clientData = {
          name: (clientCfg.name as string) || clientKey,
          description: (clientCfg.description as string) || "",
          enabled: true,
          transport,
          url: (clientCfg.url as string) || "",
          command: (clientCfg.command as string) || "",
          args: clientCfg.args || [],
          env: clientCfg.env || {},
          cwd: (clientCfg.cwd as string) || "",
          headers: clientCfg.headers || {},
        };
        try {
          await createMCPClientForCapabilities(
            currentAgentId,
            clientKey,
            clientData,
          );
        } catch {
          allSuccess = false;
        }
      }
      if (allSuccess) {
        antdMsg.success("MCP 客户端已创建");
        setCreateModalOpen(false);
        loadMCPs();
      }
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        antdMsg.error("JSON 格式错误：" + err.message);
      } else {
        antdMsg.error(err.message || "创建 MCP 失败");
      }
    } finally {
      setCreating(false);
    }
  }, [createJson, currentAgentId, loadMCPs]);

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
  const totalTools = mcps.reduce((sum, m) => sum + (m.tools?.length || 0), 0);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // ── MCP Tab Content ──
  const mcpTabContent = React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索能力名称、描述...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 400 },
      }),
      React.createElement(
        Button,
        {
          type: "primary",
          icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
          onClick: () => setCreateModalOpen(true),
          style: PRIMARY_BTN_STYLE,
        },
        "添加 MCP",
      ),
      React.createElement(
        Button,
        {
          icon: ApiOutlined ? React.createElement(ApiOutlined) : undefined,
          onClick: () => navigateTo("/mcp"),
        },
        "前往 MCP 管理",
      ),
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
              : "暂无 MCP 客户端，点击「添加 MCP」创建",
          })
        : React.createElement(
            Row,
            { gutter: [12, 12], align: "stretch" },
            ...filteredMCPs.map((mcp) =>
              React.createElement(
                Col,
                {
                  key: mcp.key,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" },
                },
                React.createElement(CapabilityCard, {
                  mcp,
                  agentId: currentAgentId,
                  onToggle: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleToggle(mcp);
                  },
                  onDelete: () => {
                    handleDelete(mcp);
                  },
                  onUpdate: async (key: string, updates: MCPClientUpdate) => {
                    try {
                      await updateMCPClientForCapabilities(currentAgentId, key, updates as any);
                      antdMsg.success("MCP 配置已更新");
                      loadMCPs();
                      return true;
                    } catch (err: any) {
                      antdMsg.error(err.message || "更新 MCP 失败");
                      return false;
                    }
                  },
                  onUpdatePolicy: async (key: string, policy: MCPAccessPolicy) => {
                    try {
                      await updateMCPPolicyForCapabilities(currentAgentId, key, policy);
                      antdMsg.success("访问策略已保存");
                      loadMCPs();
                      return true;
                    } catch (err: any) {
                      antdMsg.error(err.message || "保存访问策略失败");
                      return false;
                    }
                  },
                  onRefresh: async () => { loadMCPs(); },
                }),
              ),
            ),
          ),
  );

  const tabItems = [
    {
      key: "mcp",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ApiOutlined
          ? React.createElement(ApiOutlined, { style: { fontSize: 14 } })
          : null,
        "MCP 客户端",
      ),
      children: mcpTabContent,
    },
    {
      key: "software",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        RocketOutlined
          ? React.createElement(RocketOutlined, { style: { fontSize: 14 } })
          : null,
        "计算引擎",
      ),
      children: React.createElement(EngineSection),
    },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "工具",
      subtitle: `MCP: ${mcps.length} 个客户端（${enabledCount} 个启用）· ${totalTools} 个工具`,
      extra: React.createElement(
        React.Fragment,
        null,
        React.createElement(
          Button,
          {
            icon: ReloadOutlined
              ? React.createElement(ReloadOutlined)
              : undefined,
            onClick: () => { clearApiCache(); loadMCPs(); },
            loading,
          },
          "刷新",
        ),
      ),
    }),
    React.createElement(Tabs, {
      items: tabItems,
      activeKey: activeTab,
      onChange: (k: string) => setActiveTab(k),
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    React.createElement(
      Modal,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: createModalOpen,
        onCancel: () => setCreateModalOpen(false),
        onOk: handleCreate,
        confirmLoading: creating,
        okText: "创建",
        cancelText: "取消",
        width: 700,
      },
      React.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "支持格式: ",
        React.createElement("code", null, '{ "mcpServers": { "key": {...} } }'),
        " 或 ",
        React.createElement("code", null, '{ "key": {...} }'),
      ),
      React.createElement(TextArea, {
        value: createJson,
        onChange: (e: any) => setCreateJson(e.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 },
      }),
    ),
  );
}

