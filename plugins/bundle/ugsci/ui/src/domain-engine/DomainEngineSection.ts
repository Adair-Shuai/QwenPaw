/**
 * Domain engine section — the main container component.
 *
 * Fetches the domain engine catalog, probes dependencies, and renders
 * cards grouped by domain.  Each card failure is isolated — one engine's
 * error does not affect the others.
 */

import { getHost } from "../core/runtime";
import {
  fetchDomainEngines,
  fetchBuiltinToolStatuses,
  fetchMcpProviderStatuses,
  type McpProviderStatus,
} from "./domainEngineApi";
import { buildEngineView, groupByDomain } from "./runtimeStatus";
import type { DomainEngineView } from "./types";
import { DomainEngineCard } from "./DomainEngineCard";
import { DomainEngineDetail } from "./DomainEngineDetail";

const DOMAIN_GROUP_LABELS: Record<string, string> = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模",
};

export function DomainEngineSection({
  onNavigateToMcp,
  onNavigateToTools,
  onNavigateToSkills,
}: {
  onNavigateToMcp?: () => void;
  onNavigateToTools?: (subTab?: string) => void;
  onNavigateToSkills?: () => void;
} = {}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo, useRef } = React;
  const {
    Spin,
    Empty,
    Button,
    message: antdMsg,
    Row,
    Col,
    Input,
    Drawer,
    Typography,
  } = getHost().antd;
  const { ReloadOutlined, SearchOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  // Track the current agent so we re-fetch when it changes.
  const selected = getHost().useSelectedAgent?.();
  const agentId = selected?.id || "default";

  const [views, setViews] = useState<DomainEngineView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<DomainEngineView | null>(null);

  // Ref to track the latest agent ID — allows stale fetch responses
  // to be discarded without recreating the loadEngines callback.
  const agentIdRef = useRef(agentId);
  agentIdRef.current = agentId;

  const loadEngines = useCallback(
    async (force = false) => {
      setLoading(true);
      // Capture the agent at call time so stale responses from a
      // previous agent can be detected and discarded.
      const callerAgent = agentIdRef.current;
      try {
        // Fetch domain engines and MCP provider statuses in parallel.
        // When force=true, bypass the HTTP cache so the refresh button
        // always returns fresh data.
        const [responses, mcpStatuses, builtinTools] = await Promise.all([
          fetchDomainEngines(force),
          fetchMcpProviderStatuses(callerAgent, force),
          fetchBuiltinToolStatuses(callerAgent, force),
        ]);
        // If the agent changed while we were fetching, discard results.
        if (callerAgent !== agentIdRef.current) return;
        const built: DomainEngineView[] = [];
        for (const resp of responses) {
          try {
            // Look up MCP provider info for MCP-sourced engines
            let mcpInfo: McpProviderStatus | null = null;
            if (resp.engine.source === "mcp") {
              const providerKey = resp.engine.provider.id;
              mcpInfo = mcpStatuses.get(providerKey) || null;
            }
            built.push(buildEngineView(resp, mcpInfo, builtinTools));
          } catch {
            // Skip individual failures
          }
        }
        setViews(built);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "加载领域引擎失败";
        antdMsg.error(msg);
        setViews([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Re-fetch when the component mounts or when the selected agent changes.
  useEffect(() => {
    loadEngines();
  }, [agentId, loadEngines]);

  const filteredViews = useMemo(() => {
    if (!searchText.trim()) return views;
    const q = searchText.toLowerCase();
    return views.filter(
      (v: DomainEngineView) =>
        v.definition.name.toLowerCase().includes(q) ||
        v.definition.domain.toLowerCase().includes(q) ||
        v.definition.description.toLowerCase().includes(q) ||
        v.definition.tags.some((t: string) => t.toLowerCase().includes(q)),
    );
  }, [views, searchText]);

  const groups = useMemo(
    () => groupByDomain(filteredViews),
    [filteredViews],
  );

  const handleRefresh = useCallback(() => {
    loadEngines(true);
  }, [loadEngines]);

  const handleCardClick = useCallback((view: DomainEngineView) => {
    setActiveView(view);
    setDrawerOpen(true);
  }, []);

  const handleNavigateToMcp = useCallback(() => {
    setDrawerOpen(false);
    onNavigateToMcp?.();
  }, [onNavigateToMcp]);

  const handleNavigateToTools = useCallback(
    (subTab?: string) => {
      setDrawerOpen(false);
      onNavigateToTools?.(subTab);
    },
    [onNavigateToTools],
  );

  const handleNavigateToSkills = useCallback(() => {
    setDrawerOpen(false);
    onNavigateToSkills?.();
  }, [onNavigateToSkills]);

  return React.createElement(
    "div",
    null,
    // Action bar
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索领域引擎...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: { target: { value: string } }) =>
          setSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 280 },
      }),
      React.createElement(
        Button,
        {
          icon: ReloadOutlined
            ? React.createElement(ReloadOutlined)
            : undefined,
          onClick: handleRefresh,
          loading,
        },
        "刷新",
      ),
    ),
    // Content
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, {
            size: "large",
            tip: "正在加载领域引擎...",
          }),
        )
      : filteredViews.length === 0
        ? React.createElement(Empty, {
            description: searchText
              ? "无匹配引擎"
              : "暂无领域引擎",
          })
        : React.createElement(
            "div",
            null,
            ...(Array.from(groups.entries()) as [string, DomainEngineView[]][]).map(
              ([domain, domainViews]) =>
                React.createElement(
                  "div",
                  { key: domain, style: { marginBottom: 20 } },
                  React.createElement(
                    Text,
                    {
                      strong: true,
                      style: {
                        fontSize: 14,
                        display: "block",
                        marginBottom: 8,
                      },
                    },
                    DOMAIN_GROUP_LABELS[domain] || domain,
                  ),
                  React.createElement(
                    Row,
                    { gutter: [12, 12], align: "stretch" },
                    ...domainViews.map((view: DomainEngineView) =>
                      React.createElement(
                        Col,
                        {
                          key: view.definition.id,
                          xs: 24,
                          sm: 12,
                          md: 8,
                          lg: 6,
                          style: { display: "flex" },
                        },
                        React.createElement(DomainEngineCard, {
                          view,
                          onClick: () => handleCardClick(view),
                        }),
                      ),
                    ),
                  ),
                ),
            ),
          ),
    // Detail drawer
    React.createElement(DomainEngineDetail, {
      view: activeView,
      open: drawerOpen,
      onClose: () => setDrawerOpen(false),
      onNavigateToMcp: handleNavigateToMcp,
      onNavigateToTools: handleNavigateToTools,
      onNavigateToSkills: handleNavigateToSkills,
    }),
  );
}
