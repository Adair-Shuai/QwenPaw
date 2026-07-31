/**
 * Marketplace page — browse and install skills, MCP clients, and expert bundles.
 */

import { getHost, clearApiCache, clearAgentCache, apiFetch } from "../core/runtime";
import { PRIMARY_BTN_STYLE, renderMarkdown, PageHeader } from "../core/shared";
import type { AgentSummary, MCPClientInfo } from "../core/types";
import { fetchAgents, fetchPoolSkills } from "../core/api";
import { ExpertAvatar } from "../components/avatars";
import {
  extractPromptFromSkills,
  installSkillFromPool,
  deletePoolSkill,
  writeKnowledgeFile,
  fetchAgentMCPClients,
  createMCPForAgent,
} from "../expert/expertApi";
import {
  type MCPTemplate,
  MCP_ENV_HINTS,
  mcpTemplateNeedsConfig,
  type GitHubSkill,
  type GitHubSkillSource,
  type DynamicCategory,
  type OssMcpServer,
  type OssAgent,
  type GenericSource,
  ossProxyUrl,
  fetchOssJson,
  ossMcpToTemplate,
  loadGenericSources,
  saveGenericSources,
  loadMcpSources,
  saveMcpSources,
  loadExpertSources,
  saveExpertSources,
  loadGithubSources,
  saveGithubSources,
  fetchGitHubSourceSkills,
  fetchOSSSourceSkills,
  fetchOSSMcpManifest,
  fetchOSSSkillsManifest,
  fetchOSSAgentsManifest,
  fetchAllGitHubSkills,
  _extractSkillCategories,
  SourceConfigModal,
  GenericSourceConfigModal,
  type MarketResult,
  type MarketProviderInfo,
  type MarketCategory,
  type MarketSearchResponse,
  _tagGroupLabel,
} from "./marketHelpers";

export async function fetchMarketProviders(): Promise<MarketProviderInfo[]> {
  return apiFetch<MarketProviderInfo[]>("/market/providers");
}

export async function fetchMarketCategories(lang: string): Promise<MarketCategory[]> {
  return apiFetch<MarketCategory[]>(
    `/market/categories?lang=${encodeURIComponent(lang)}`,
  );
}

export async function searchMarket(
  query: string,
  providerPages: Record<string, number>,
  limit: number,
  lang: string,
  category?: string,
): Promise<MarketSearchResponse> {
  return apiFetch<MarketSearchResponse>("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      provider_pages: providerPages,
      limit,
      lang,
      category: category || undefined,
    }),
  });
}

export async function startHubInstall(
  agentId: string,
  bundleUrl: string,
  enable: boolean,
): Promise<{ task_id: string }> {
  return apiFetch<{ task_id: string }>("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify({
      bundle_url: bundleUrl,
      enable,
    }),
  });
}

export async function pollHubInstallStatus(
  agentId: string,
  taskId: string,
): Promise<any> {
  return apiFetch<any>(
    `/skills/hub/install/status/${encodeURIComponent(taskId)}`,
    {
      headers: { "X-Agent-Id": agentId },
    },
  );
}

/** Parse an API error to extract a human-readable message. */
export function _parseApiError(err: any): string {
  if (!err) return "";
  const msg = err.message || String(err);
  try {
    const parsed = JSON.parse(msg);
    if (parsed.detail) {
      if (typeof parsed.detail === "string") return parsed.detail;
      if (parsed.detail.message) return parsed.detail.message;
    }
  } catch {
    // Not JSON, return as-is
  }
  return msg;
}

/** Import a skill directly into the skill pool (no agent required). */
export async function importSkillToPool(
  bundleUrl: string,
  accessToken?: string,
): Promise<{
  installed: boolean;
  name: string;
  source_url: string;
  installed_from: string;
}> {
  const body: Record<string, any> = { bundle_url: bundleUrl };
  if (accessToken) {
    body.access_token = accessToken;
  }
  return apiFetch<{
    installed: boolean;
    name: string;
    source_url: string;
    installed_from: string;
  }>("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function MarketplacePage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo, useRef } = React;
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
    Tooltip,
    Typography,
    Select,
    Drawer,
    Descriptions,
    Tabs,
    Badge,
    Progress,
    Modal,
    Alert,
  } = getHost().antd;
  const {
    ReloadOutlined,
    SearchOutlined,
    DownloadOutlined,
    AppstoreOutlined,
    ShopOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    UserOutlined,
    SettingOutlined,
    GithubOutlined,
    ApiOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph, Title } = Typography;

  // Tab: 'skills' | 'mcp' | 'experts'
  const [activeTab, setActiveTab] = useState("skills");

  // Skill market state
  const [providers, setProviders] = useState<MarketProviderInfo[]>([]);
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [results, setResults] = useState<MarketResult[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [providerPages, setProviderPages] = useState<Record<string, number>>(
    {},
  );
  const [detailItem, setDetailItem] = useState<MarketResult | null>(null);
  const [installing, setInstalling] = useState<Record<string, string>>({});

  // Agent list for install target selection
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [installTargetAgent, setInstallTargetAgent] = useState<string>("");

  // Expert templates state
  const [expertSearchText, setExpertSearchText] = useState("");

  // MCP market state
  const [mcpSearchText, setMcpSearchText] = useState("");
  const [mcpInstalling, setMcpInstalling] = useState<Record<string, boolean>>({});
  const [mcpInstallTargetAgent, setMcpInstallTargetAgent] = useState<string>("");
  const [existingMcpKeys, setExistingMcpKeys] = useState<Set<string>>(new Set());
  // MCP install config modal (for templates that require token/env input)
  const [mcpConfigTemplate, setMcpConfigTemplate] = useState<MCPTemplate | null>(null);
  const [mcpConfigEnvValues, setMcpConfigEnvValues] = useState<Record<string, string>>({});

  // GitHub skill sources state
  const [githubSources, setGithubSources] = useState<GitHubSkillSource[]>([]);
  const [githubSkills, setGithubSkills] = useState<GitHubSkill[]>([]);
  // Official OSS skills bypass localStorage so older saved source settings
  // cannot accidentally hide the canonical registry.
  const [ossSkills, setOssSkills] = useState<GitHubSkill[]>([]);
  const [ossSkillsError, setOssSkillsError] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [sourceConfigOpen, setSourceConfigOpen] = useState(false);

  // MCP sources state
  const [mcpSources, setMcpSources] = useState<GenericSource[]>([]);
  const [mcpSourceConfigOpen, setMcpSourceConfigOpen] = useState(false);

  // Expert sources state
  const [expertSources, setExpertSources] = useState<GenericSource[]>([]);
  const [expertSourceConfigOpen, setExpertSourceConfigOpen] = useState(false);

  // ── OSS MCP market state (dynamic from official manifest) ──
  const [ossMcpServers, setOssMcpServers] = useState<OssMcpServer[]>([]);
  const [ossMcpCategories, setOssMcpCategories] = useState<DynamicCategory[]>([]);
  const [ossMcpLoading, setOssMcpLoading] = useState(false);
  const [mcpSelectedCategory, setMcpSelectedCategory] = useState("");

  // ── OSS Agents market state (dynamic from official manifest) ──
  const [ossAgents, setOssAgents] = useState<OssAgent[]>([]);
  const [ossAgentCategories, setOssAgentCategories] = useState<DynamicCategory[]>([]);
  const [ossAgentLoading, setOssAgentLoading] = useState(false);
  const [expertSelectedCategory, setExpertSelectedCategory] = useState("");
  const [ossAgentCreating, setOssAgentCreating] = useState(false);

  // ── Dynamic skill categories (from OSS manifest tag_groups) ──
  const [ossSkillCategories, setOssSkillCategories] = useState<DynamicCategory[]>([]);

  const searchTimerRef = useRef<any>(null);

  // Load providers and categories on mount
  useEffect(() => {
    Promise.all([
      fetchMarketProviders().catch(() => []),
      fetchMarketCategories("zh").catch(() => []),
      fetchAgents().catch(() => []),
    ]).then(([provs, cats, agentList]) => {
      setProviders(provs);
      setCategories(cats);
      setAgents(agentList);
      if (agentList.length > 0) {
        setInstallTargetAgent(agentList[0].id);
        setMcpInstallTargetAgent(agentList[0].id);
      }
    });
  }, []);

  // Load GitHub sources from localStorage on mount, then fetch skills
  const loadGithubSkills = useCallback(async (sources?: GitHubSkillSource[]) => {
    const srcs = sources ?? loadGithubSources();
    if (sources) setGithubSources(sources);
    else setGithubSources(srcs);
    const enabled = srcs.filter((s) => s.enabled);
    if (enabled.length === 0) {
      setGithubSkills([]);
      return;
    }
    setGithubLoading(true);
    try {
      const { skills, errors, categories } = await fetchAllGitHubSkills(srcs);
      setGithubSkills(skills);
      setOssSkillCategories(categories);
      // Extract dynamic categories from OSS skills that have tags
      // (Categories computed dynamically via unifiedCategories)
      if (errors.length > 0) {
        for (const err of errors) {
          console.warn(`[ugsci] GitHub source '${err.label}' error: ${err.message}`);
        }
        antdMsg.warning(
          `部分源加载失败: ${errors.map((e) => e.label).join(", ")}`,
        );
      }
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能源失败");
      setGithubSkills([]);
    } finally {
      setGithubLoading(false);
    }
  }, []);

  // Load all official OSS markets on mount (parallel).
  const loadOssMarketData = useCallback(async () => {
    setOssMcpLoading(true);
    setOssAgentLoading(true);
    setGithubLoading(true);
    const [mcpResult, agentsResult, skillsResult] = await Promise.allSettled([
      fetchOSSMcpManifest(),
      fetchOSSAgentsManifest(),
      fetchOSSSkillsManifest(),
    ]);
    // Process MCP result
    if (mcpResult.status === "fulfilled") {
      setOssMcpServers(mcpResult.value.servers);
      setOssMcpCategories(mcpResult.value.categories);
    } else {
      console.warn(`[ugsci] MCP manifest error: ${mcpResult.reason?.message || mcpResult.reason}`);
      setOssMcpServers([]);
      setOssMcpCategories([]);
    }
    setOssMcpLoading(false);
    // Process Agents result
    if (agentsResult.status === "fulfilled") {
      setOssAgents(agentsResult.value.agents);
      setOssAgentCategories(agentsResult.value.categories);
    } else {
      console.warn(`[ugsci] Agents manifest error: ${agentsResult.reason?.message || agentsResult.reason}`);
      setOssAgents([]);
      setOssAgentCategories([]);
    }
    setOssAgentLoading(false);
    // Process Skills result
    if (skillsResult.status === "fulfilled") {
      setOssSkills(skillsResult.value.skills);
      setOssSkillsError("");
    } else {
      const errorMessage =
        skillsResult.reason?.message || String(skillsResult.reason);
      console.warn(`[ugsci] Skills manifest error: ${errorMessage}`);
      setOssSkills([]);
      setOssSkillsError(errorMessage);
    }
    setGithubLoading(false);
  }, []);

  useEffect(() => {
    loadGithubSkills();
    loadOssMarketData();
    // Load MCP and Expert sources from localStorage
    setMcpSources(loadMcpSources());
    setExpertSources(loadExpertSources());
  }, [loadGithubSkills, loadOssMarketData]);

  const doSearch = useCallback(
    async (query: string, category: string, pages: Record<string, number>) => {
      setLoading(true);
      try {
        const resp = await searchMarket(
          query,
          pages,
          20,
          "zh",
          category || undefined,
        );
        if (pages === undefined || Object.keys(pages).length === 0) {
          setResults(resp.results);
        } else {
          setResults((prev: MarketResult[]) => [...prev, ...resp.results]);
        }
        const anyHasMore = Object.values(resp.by_provider || {}).some(
          (p: any) => p.has_more,
        );
        setHasMore(anyHasMore);
        // Update provider pages for next load-more
        const newPages: Record<string, number> = {};
        for (const [key, info] of Object.entries(resp.by_provider || {})) {
          newPages[key] = (pages[key] || 1) + 1;
        }
        setProviderPages(newPages);
        if (resp.errors.length > 0) {
          for (const err of resp.errors) {
            console.warn(
              `[ugsci] Market provider '${err.provider}' error: ${err.message}`,
            );
          }
        }
      } catch (err: any) {
        antdMsg.error(err.message || "搜索市场失败");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      doSearch(searchText, selectedCategory, {});
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchText, selectedCategory, doSearch]);

  const handleLoadMore = () => {
    doSearch(searchText, selectedCategory, providerPages);
  };

  const handleInstallSkill = async (item: MarketResult) => {
    const itemKey = `${item.source}:${item.slug}`;
    try {
      setInstalling((prev: any) => ({ ...prev, [itemKey]: "installing" }));
      const result = await importSkillToPool(item.source_url);
      if (result.installed) {
        antdMsg.success(
          `技能「${result.name || item.name}」已安装到技能池，可在技能中心查看`,
        );
      }
      setInstalling((prev: any) => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
    } catch (err: any) {
      antdMsg.error(_parseApiError(err) || "安装技能失败");
      setInstalling((prev: any) => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
    }
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleInstallGithubSkill = async (skill: GitHubSkill) => {
    const itemKey = `github:${skill.sourceId}:${skill.name}`;
    // Look up the source to get its access token (for Gitee private repos)
    const source = githubSources.find((s) => s.id === skill.sourceId);
    const accessToken = source?.accessToken || undefined;
    try {
      setInstalling((prev: any) => ({ ...prev, [itemKey]: "installing" }));
      const result = await importSkillToPool(skill.source_url, accessToken);
      if (result.installed) {
        antdMsg.success(
          `技能「${result.name || skill.name}」已安装到技能池，可在技能中心查看`,
        );
      }
      setInstalling((prev: any) => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
    } catch (err: any) {
      antdMsg.error(_parseApiError(err) || "安装技能失败");
      setInstalling((prev: any) => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
    }
  };

  // Merge the permanent OSS registry with configurable sources. Deduplication
  // also handles legacy localStorage entries that still point at official OSS.
  const allSkills = useMemo(() => {
    const merged: GitHubSkill[] = [];
    const seen = new Set<string>();
    for (const skill of [...ossSkills, ...githubSkills]) {
      const key = skill.source_url || `${skill.sourceLabel}:${skill.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(skill);
    }
    return merged;
  }, [ossSkills, githubSkills]);

  // Unified dynamic categories: prefer manifest tag_groups (like MCP/Agents),
  // fall back to per-skill tag extraction, then add imported custom sources.
  const unifiedCategories = useMemo(() => {
    const cats: DynamicCategory[] = [];
    const seen = new Set<string>();
    // 1. If the OSS manifest defines tag_groups, use them as the primary
    //    category source (consistent with MCP and Agents tabs).
    if (ossSkillCategories.length > 0) {
      for (const c of ossSkillCategories) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          cats.push(c);
        }
      }
    }
    // 2. Fallback: extract unique tags from individual skills (when the
    //    manifest has no tag_groups, or for skills without a group).
    for (const s of allSkills) {
      if (s.tag && !seen.has(s.tag)) {
        seen.add(s.tag);
        cats.push({ id: s.tag, label: s.tag });
      }
    }
    // 3. Custom imported source labels (non-official skills)
    for (const s of allSkills) {
      if (!s.isOfficial && s.sourceLabel && !seen.has(s.sourceLabel)) {
        seen.add(s.sourceLabel);
        cats.push({ id: s.sourceLabel, label: s.sourceLabel });
      }
    }
    return cats;
  }, [allSkills, ossSkillCategories]);

  // Filtered skills based on search text and unified category
  const filteredGithubSkills = useMemo(() => {
    let filtered = allSkills;
    if (selectedCategory) {
      // Check if the selected category is a tag_group (has `tags` array)
      const groupCat = ossSkillCategories.find((c) => c.id === selectedCategory);
      if (groupCat && groupCat.tags) {
        // Filter by tag group membership: skill's tag must be in the group's tags
        filtered = filtered.filter(
          (s) =>
            (s.tag && groupCat.tags!.includes(s.tag)) ||
            s.sourceLabel === selectedCategory,
        );
      } else {
        filtered = filtered.filter(
          (s) => s.tag === selectedCategory || s.sourceLabel === selectedCategory,
        );
      }
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [allSkills, searchText, selectedCategory, ossSkillCategories]);

  // Available providers
  const availableProviders = providers.filter((p) => p.available);

  // Filtered market results based on category filter
  const filteredResults = useMemo(() => {
    if (!selectedCategory) return results;
    return results.filter((r) => {
      const provider = availableProviders.find((p) => p.key === r.source);
      return provider?.label === selectedCategory;
    });
  }, [results, selectedCategory, availableProviders]);

  // Skill Market Tab
  const skillsMarketTab = React.createElement(
    "div",
    null,
    // Top bar: search + filters + install target
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
        placeholder: "搜索技能市场...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { flex: 1, minWidth: 200, maxWidth: 400 },
      }),
      // Pool install info
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池",
      ),
      // Configure skill source button
      React.createElement(
        Button,
        {
          icon: GithubOutlined
            ? React.createElement(GithubOutlined)
            : undefined,
          onClick: () => setSourceConfigOpen(true),
          size: "small",
        },
        "配置技能源",
      ),
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    ossSkillsError && allSkills.length === 0
      ? React.createElement(Alert, {
          type: "warning",
          showIcon: true,
          message: "UGSci 官方 OSS 技能库加载失败",
          description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
          style: { marginBottom: 12 },
        })
      : null,
    unifiedCategories.length > 0
      ? React.createElement(
          "div",
          {
            style: {
              marginBottom: 12,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
            },
          },
          React.createElement(
            Text,
            { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
            "分类:",
          ),
          React.createElement(
            Tag,
            {
              style: {
                fontSize: 11,
                cursor: "pointer",
                borderRadius: 12,
              },
              color: selectedCategory === "" ? "blue" : undefined,
              onClick: () => setSelectedCategory(""),
            },
            "全部",
          ),
          ...unifiedCategories.map((cat) => {
            // Check if this category is from an imported source (non-official)
            const isImported = githubSkills.some(
              (s) => !s.isOfficial && s.sourceLabel === cat.id,
            );
            return React.createElement(
              Tag,
              {
                key: cat.id,
                style: {
                  fontSize: 11,
                  cursor: "pointer",
                  borderRadius: 12,
                },
                color: selectedCategory === cat.id
                  ? (isImported ? "blue" : "geekblue")
                  : undefined,
                icon: isImported
                  ? (GithubOutlined ? React.createElement(GithubOutlined) : undefined)
                  : undefined,
                onClick: () =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? "" : cat.id,
                  ),
              },
              cat.label,
            );
          }),
        )
      : null,
    // GitHub skills section
    githubLoading && allSkills.length === 0
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
          React.createElement(Spin, { size: "large" }, React.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能...")),
        )
      : filteredGithubSkills.length > 0
        ? React.createElement(
            "div",
            { style: { marginBottom: 20 } },
            React.createElement(
              "div",
              {
                style: {
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                },
              },
              GithubOutlined
                ? React.createElement(GithubOutlined, {
                    style: { fontSize: 14, color: "#1677ff" },
                  })
                : null,
              React.createElement(
                Text,
                { strong: true, style: { fontSize: 13 } },
                `技能市场 (${filteredGithubSkills.length})`,
              ),
            ),
            React.createElement(
              Row,
              { gutter: [12, 12] },
              ...filteredGithubSkills.map((skill) => {
                const itemKey = `github:${skill.sourceId}:${skill.name}`;
                const installState = installing[itemKey];
                return React.createElement(
                  Col,
                  { key: itemKey, xs: 24, sm: 12, md: 8, lg: 6 },
                  React.createElement(
                    Card,
                    {
                      hoverable: true,
                      size: "small",
                      style: { height: "100%" },
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
                      GithubOutlined
                        ? React.createElement(GithubOutlined, {
                            style: { fontSize: 18, color: "#57606a" },
                          })
                        : React.createElement(
                            "span",
                            { style: { fontSize: 18 } },
                            "📦",
                          ),
                      React.createElement(
                        Tooltip,
                        { title: skill.name },
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
                      ),
                    ),
                    React.createElement(
                      Paragraph,
                      {
                        type: "secondary",
                        style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                        ellipsis: { rows: 2 },
                      },
                      skill.description || "暂无描述",
                    ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            marginTop: 8,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          },
                        },
                        React.createElement(
                          "div",
                          { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" } },
                          // Show source path (e.g. "UGSci/anthropics") in bottom-left
                          skill.sourcePath || skill.sourceLabel
                            ? React.createElement(
                                "span",
                                {
                                  style: {
                                    fontSize: 10,
                                    color: "#999",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 2,
                                  },
                                },
                                ApiOutlined
                                  ? React.createElement(ApiOutlined, { style: { fontSize: 10 } })
                                  : null,
                                skill.sourcePath || skill.sourceLabel,
                              )
                            : null,
                          // Show tag as category badge
                          skill.tag
                            ? React.createElement(
                                Tag,
                                { color: "geekblue", style: { fontSize: 10 } },
                                skill.tag,
                              )
                            : null,
                          skill.version
                            ? React.createElement(
                                Tag,
                                { style: { fontSize: 10 } },
                                `v${skill.version}`,
                              )
                            : null,
                        ),
                      installState
                        ? React.createElement(
                            Button,
                            {
                              size: "small",
                              disabled: true,
                              icon: LoadingOutlined
                                ? React.createElement(LoadingOutlined)
                                : undefined,
                            },
                            "安装中",
                          )
                        : React.createElement(
                            Button,
                            {
                              type: "primary",
                              size: "small",
                              icon: DownloadOutlined
                                ? React.createElement(DownloadOutlined)
                                : undefined,
                              onClick: () => handleInstallGithubSkill(skill),
                            },
                            "安装",
                          ),
                    ),
                  ),
                );
              }),
            ),
          )
        : null,
    // Market results section title
    filteredResults.length > 0 || loading
      ? React.createElement(
          "div",
          {
            style: {
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            },
          },
          ShopOutlined
            ? React.createElement(ShopOutlined, {
                style: { fontSize: 14, color: "#1677ff" },
              })
            : null,
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 13 } },
            `技能市场${filteredResults.length > 0 ? ` (${filteredResults.length})` : ""}`,
          ),
        )
      : null,
    // Results grid
    loading && filteredResults.length === 0
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
        )
      : filteredResults.length === 0
        ? React.createElement(Empty, {
            description: searchText
              ? `未找到匹配「${searchText}」的技能`
              : "输入关键词搜索技能市场",
            image: Empty.PRESENTED_IMAGE_SIMPLE,
          })
        : React.createElement(
            Row,
            { gutter: [12, 12] },
            ...filteredResults.map((item) => {
              const itemKey = `${item.source}:${item.slug}`;
              const installState = installing[itemKey];
              return React.createElement(
                Col,
                { key: itemKey, xs: 24, sm: 12, md: 8, lg: 6 },
                React.createElement(
                  Card,
                  {
                    hoverable: true,
                    size: "small",
                    style: { height: "100%", cursor: "pointer" },
                    onClick: () => setDetailItem(item),
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
                    item.icon_url
                      ? React.createElement("img", {
                          src: item.icon_url,
                          alt: item.name,
                          style: { width: 24, height: 24, borderRadius: 4 },
                        })
                      : React.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          "📦",
                        ),
                    React.createElement(
                      Tooltip,
                      { title: item.name },
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
                        item.name,
                      ),
                    ),
                  ),
                  React.createElement(
                    Paragraph,
                    {
                      type: "secondary",
                      style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                      ellipsis: { rows: 2 },
                    },
                    item.description || "暂无描述",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    },
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 4 } },
                      React.createElement(
                        Tag,
                        { color: "geekblue", style: { fontSize: 10 } },
                        item.source,
                      ),
                      item.version
                        ? React.createElement(
                            Tag,
                            { style: { fontSize: 10 } },
                            `v${item.version}`,
                          )
                        : null,
                    ),
                    installState
                      ? React.createElement(
                          Button,
                          {
                            size: "small",
                            disabled: true,
                            icon: LoadingOutlined
                              ? React.createElement(LoadingOutlined)
                              : undefined,
                          },
                          "安装中",
                        )
                      : React.createElement(
                          Button,
                          {
                            type: "primary",
                            size: "small",
                            icon: DownloadOutlined
                              ? React.createElement(DownloadOutlined)
                              : undefined,
                            onClick: (e: any) => {
                              e.stopPropagation();
                              handleInstallSkill(item);
                            },
                          },
                          "安装",
                        ),
                  ),
                ),
              );
            }),
          ),
    // Load more button
    hasMore && !loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          React.createElement(
            Button,
            { onClick: handleLoadMore, loading },
            "加载更多",
          ),
        )
      : null,
    // Detail Drawer
    detailItem
      ? React.createElement(
          Drawer,
          {
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              detailItem.icon_url
                ? React.createElement("img", {
                    src: detailItem.icon_url,
                    alt: detailItem.name,
                    style: { width: 28, height: 28, borderRadius: 4 },
                  })
                : React.createElement(
                    "span",
                    { style: { fontSize: 20 } },
                    "📦",
                  ),
              React.createElement("span", null, detailItem.name),
            ),
            open: true,
            onClose: () => setDetailItem(null),
            width: 480,
            extra: React.createElement(
              Button,
              {
                type: "primary",
                icon: DownloadOutlined
                  ? React.createElement(DownloadOutlined)
                  : undefined,
                onClick: () => {
                  handleInstallSkill(detailItem);
                },
              },
              "安装到技能池",
            ),
          },
          React.createElement(
            Descriptions,
            { column: 1, bordered: true, size: "small" },
            React.createElement(
              Descriptions.Item,
              { label: "来源" },
              detailItem.source,
            ),
            React.createElement(
              Descriptions.Item,
              { label: "描述" },
              detailItem.description || "-",
            ),
            detailItem.version
              ? React.createElement(
                  Descriptions.Item,
                  { label: "版本" },
                  detailItem.version,
                )
              : null,
            detailItem.author
              ? React.createElement(
                  Descriptions.Item,
                  { label: "作者" },
                  detailItem.author,
                )
              : null,
            React.createElement(
              Descriptions.Item,
              { label: "来源链接" },
              React.createElement(
                "a",
                { href: detailItem.source_url, target: "_blank" },
                detailItem.source_url,
              ),
            ),
          ),
          detailItem.stats
            ? React.createElement(
                "div",
                { style: { marginTop: 16 } },
                React.createElement(
                  Text,
                  {
                    strong: true,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "统计",
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
                  ...Object.entries(detailItem.stats).map(([key, value]) =>
                    React.createElement(
                      "div",
                      { key, style: { textAlign: "center" } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#1677ff",
                          },
                        },
                        String(value),
                      ),
                      React.createElement(
                        Text,
                        { type: "secondary", style: { fontSize: 11 } },
                        key,
                      ),
                    ),
                  ),
                ),
              )
            : null,
        )
      : null,
  );

  // Expert Templates Tab — filtered from OSS agents (dynamic)
  const filteredOssAgents = useMemo(() => {
    let filtered = ossAgents;
    if (expertSelectedCategory) {
      filtered = filtered.filter((a) => a.category === expertSelectedCategory);
    }
    if (expertSearchText.trim()) {
      const q = expertSearchText.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return filtered;
  }, [ossAgents, expertSearchText, expertSelectedCategory]);

  const handleCreateOssAgent = async (agent: OssAgent) => {
    if (ossAgentCreating) return;
    setOssAgentCreating(true);
    try {
      // Fetch instructions (AGENTS.md) from OSS if available
      let systemPrompt = agent.description;
      if (agent.instructions) {
        try {
          const instrPath = agent.instructions.replace(/^\/+/, "");
          const resp = await fetch(ossProxyUrl(instrPath));
          if (resp.ok) {
            systemPrompt = await resp.text();
          }
        } catch {}
      }
      // Fetch skills manifest from OSS if available
      let skillNames: string[] = [];
      if (agent.skills_manifest) {
        try {
          const manifestPath = agent.skills_manifest.replace(/^\/+/, "");
          const resp = await fetch(ossProxyUrl(manifestPath));
          if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data)) {
              skillNames = data.map((s: any) => typeof s === "string" ? s : s.name).filter(Boolean);
            } else if (data.skills) {
              skillNames = data.skills.map((s: any) => typeof s === "string" ? s : s.name).filter(Boolean);
            }
          }
        } catch {}
      }
      const agentRef = await apiFetch<{ id: string }>("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agent.name,
          description: agent.description,
          skill_names: skillNames,
        }),
      });
      await writeKnowledgeFile(agentRef.id, "AGENTS.md", systemPrompt);
      antdMsg.success(`专家「${agent.name}」创建成功，已跳转至专家`);
      navigateTo("/ugsci-experts");
    } catch (err: any) {
      antdMsg.error(err.message || "创建专家失败");
    } finally {
      setOssAgentCreating(false);
    }
  };

  // ── MCP Market: load existing MCP keys when target agent changes ──
  const loadExistingMcpKeys = useCallback(async (agentId: string) => {
    if (!agentId) return;
    try {
      const data = await fetchAgentMCPClients(agentId);
      setExistingMcpKeys(new Set(data.map((m) => m.key)));
    } catch {
      setExistingMcpKeys(new Set());
    }
  }, []);

  useEffect(() => {
    if (mcpInstallTargetAgent) {
      loadExistingMcpKeys(mcpInstallTargetAgent);
    }
  }, [mcpInstallTargetAgent, loadExistingMcpKeys]);

  // ── MCP Market: install handler ──
  const handleInstallMcp = async (template: MCPTemplate) => {
    if (!mcpInstallTargetAgent) {
      antdMsg.warning("请先选择目标专家");
      return;
    }
    // If template has env fields, open config modal for user to input tokens
    if (mcpTemplateNeedsConfig(template)) {
      const envEntries = Object.entries(template.env!);
      const initialValues: Record<string, string> = {};
      for (const [k] of envEntries) {
        // Start with empty string so user must fill in their real value
        initialValues[k] = "";
      }
      setMcpConfigEnvValues(initialValues);
      setMcpConfigTemplate(template);
      return;
    }
    // No env config needed — install directly
    await doInstallMcp(template, template.env || {});
  };

  // ── MCP Market: actual install (called after config or directly) ──
  const doInstallMcp = async (
    template: MCPTemplate,
    envValues: Record<string, string>,
  ) => {
    setMcpInstalling((prev) => ({ ...prev, [template.id]: true }));
    try {
      const clientKey = template.id;
      await createMCPForAgent(mcpInstallTargetAgent, {
        client_key: clientKey,
        client: {
          name: template.name,
          description: template.description,
          enabled: true,
          transport: template.transport,
          url: template.url || "",
          command: template.command || "",
          args: template.args || [],
          env: envValues,
          cwd: template.cwd || "",
          headers: template.headers || {},
        },
      });
      antdMsg.success(`MCP「${template.name}」已添加到当前专家`);
      setExistingMcpKeys((prev) => new Set(prev).add(clientKey));
    } catch (err: any) {
      antdMsg.error(err.message || `添加 MCP「${template.name}」失败`);
    } finally {
      setMcpInstalling((prev) => ({ ...prev, [template.id]: false }));
    }
  };

  // ── MCP Market: confirm install from config modal ──
  const confirmInstallMcp = async () => {
    if (!mcpConfigTemplate) return;
    // Validate that all required env fields are filled
    const missing: string[] = [];
    for (const [k, v] of Object.entries(mcpConfigEnvValues)) {
      if (!v || !v.trim()) {
        const hint = MCP_ENV_HINTS[k];
        missing.push(hint?.label || k);
      }
    }
    if (missing.length > 0) {
      antdMsg.warning(`请填写以下配置项: ${missing.join(", ")}`);
      return;
    }
    const template = mcpConfigTemplate;
    setMcpConfigTemplate(null);
    setMcpConfigEnvValues({});
    await doInstallMcp(template, { ...mcpConfigEnvValues });
  };

  // ── MCP Market: filtered servers from OSS (dynamic) ──
  const filteredMcpTemplates = useMemo(() => {
    let filtered = ossMcpServers;
    if (mcpSelectedCategory) {
      filtered = filtered.filter((s) => s.category === mcpSelectedCategory);
    }
    if (mcpSearchText.trim()) {
      const q = mcpSearchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return filtered.map(ossMcpToTemplate);
  }, [ossMcpServers, mcpSearchText, mcpSelectedCategory]);

  const mcpMarketTab = React.createElement(
    "div",
    null,
    // Search + agent selector
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索 MCP 服务器...",
        prefix: SearchOutlined ? React.createElement(SearchOutlined) : undefined,
        value: mcpSearchText,
        onChange: (e: any) => setMcpSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 300 },
      }),
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到：",
        ),
        React.createElement(Select, {
          value: mcpInstallTargetAgent,
          onChange: (v: string) => setMcpInstallTargetAgent(v),
          style: { minWidth: 180 },
          size: "small",
          options: agents.map((a) => ({ value: a.id, label: a.name })),
        }),
      ),
      // Configure MCP source button
      React.createElement(
        Button,
        {
          icon: ApiOutlined ? React.createElement(ApiOutlined) : undefined,
          onClick: () => setMcpSourceConfigOpen(true),
          size: "small",
        },
        "配置 MCP 源",
      ),
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    ossMcpCategories.length > 0
      ? React.createElement(
          "div",
          {
            style: {
              marginBottom: 12,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
            },
          },
          React.createElement(
            Text,
            { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
            "分类:",
          ),
          React.createElement(
            Tag,
            {
              style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
              color: mcpSelectedCategory === "" ? "blue" : undefined,
              onClick: () => setMcpSelectedCategory(""),
            },
            "全部",
          ),
          ...ossMcpCategories.map((cat) =>
            React.createElement(
              Tag,
              {
                key: cat.id,
                style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
                color: mcpSelectedCategory === cat.id ? "geekblue" : undefined,
                onClick: () =>
                  setMcpSelectedCategory(
                    mcpSelectedCategory === cat.id ? "" : cat.id,
                  ),
              },
              cat.label,
            ),
          ),
        )
      : null,
    // MCP server cards (dynamic from OSS)
    ossMcpLoading && filteredMcpTemplates.length === 0
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 40 } },
          React.createElement(Spin, { size: "large" }, React.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器...")),
        )
      : filteredMcpTemplates.length === 0
        ? React.createElement(Empty, {
            description: "未找到匹配的 MCP 服务器",
            image: Empty.PRESENTED_IMAGE_SIMPLE,
          })
        : React.createElement(
            Row,
            { gutter: [12, 12] },
            ...filteredMcpTemplates.map((template) =>
              React.createElement(
                Col,
                { key: template.id, xs: 24, sm: 12, md: 8 },
          React.createElement(
            Card,
            {
              hoverable: true,
              size: "small",
              style: { height: "100%" },
            },
            // Header: emoji + name + tags
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8,
                },
              },
React.createElement(
"span",
{ style: { fontSize: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 } },
template.iconUrl
  ? React.createElement("img", {
      src: template.iconUrl,
      alt: template.name,
      style: { width: 28, height: 28, objectFit: "contain" },
      onError: (e: any) => { e.target.style.display = "none"; },
    })
  : template.emoji,
),
              React.createElement(
                "div",
                { style: { flex: 1 } },
                React.createElement(
                  Text,
                  { strong: true, style: { fontSize: 14 } },
                  template.name,
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  React.createElement(
                    Tag,
                    { color: "blue", style: { fontSize: 10 } },
                    template.category,
                  ),
                  React.createElement(
                    Tag,
                    {
                      color: template.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 },
                    },
                    template.transport,
                  ),
                  template.env && Object.keys(template.env).length > 0
                    ? React.createElement(
                        Tag,
                        { color: "orange", style: { fontSize: 10 } },
                        "需配置密钥",
                      )
                    : null,
                ),
              ),
            ),
            // Description
            React.createElement(
              Paragraph,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 },
              },
              template.description,
            ),
            // Footer: config preview + install button
            React.createElement(
              "div",
              {
                style: {
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              },
              React.createElement(
                Text,
                { type: "secondary", style: { fontSize: 11 } },
                template.transport === "stdio"
                  ? `${template.command} ${(template.args || []).join(" ")}`
                  : template.url || "",
              ),
              existingMcpKeys.has(template.id)
                ? React.createElement(
                    Button,
                    { size: "small", disabled: true },
                    "已安装",
                  )
                : React.createElement(
                    Button,
                    {
                      type: "primary",
                      size: "small",
                      loading: !!mcpInstalling[template.id],
                      icon: ApiOutlined
                        ? React.createElement(ApiOutlined)
                        : undefined,
                      onClick: () => handleInstallMcp(template),
                    },
                    "安装",
                  ),
            ),
          ),
        ),
      ),
    ),
    // Future expansion hint
    React.createElement(
      "div",
      {
        style: {
          marginTop: 20,
          padding: 16,
          textAlign: "center",
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          background: "#fafafa",
        },
      },
      ShopOutlined
        ? React.createElement(ShopOutlined, {
            style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 },
          })
        : null,
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新",
      ),
    ),
  );

  // ── MCP Config Modal (for templates requiring token/secret input) ──
  const mcpConfigModal = mcpConfigTemplate
    ? React.createElement(
        Modal,
        {
          title: React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            React.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, mcpConfigTemplate.iconUrl ? React.createElement("img", { src: mcpConfigTemplate.iconUrl, alt: mcpConfigTemplate.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (e: any) => { e.target.style.display = "none"; } }) : mcpConfigTemplate.emoji),
            React.createElement("span", null, `配置 ${mcpConfigTemplate.name} 密钥`),
          ),
          open: !!mcpConfigTemplate,
          onCancel: () => {
            setMcpConfigTemplate(null);
            setMcpConfigEnvValues({});
          },
          onOk: confirmInstallMcp,
          okText: "安装",
          cancelText: "取消",
          width: 520,
          destroyOnClose: true,
        },
        // Description
        React.createElement(
          Text,
          { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
          mcpConfigTemplate.description,
        ),
        // Env fields
        ...Object.entries(mcpConfigTemplate.env || {}).map(([envKey]) => {
          const hint = MCP_ENV_HINTS[envKey];
          const isSecret = hint?.isSecret !== false; // default to secret
          return React.createElement(
            "div",
            { key: envKey, style: { marginBottom: 16 } },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
              React.createElement(
                Text,
                { strong: true, style: { fontSize: 13 } },
                hint?.label || envKey,
              ),
              React.createElement(
                Tag,
                { color: "orange", style: { fontSize: 10 } },
                "必填",
              ),
            ),
            // Help text with optional link
            hint
              ? React.createElement(
                  "div",
                  { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
                  hint.help,
                  hint.link
                    ? React.createElement(
                        "a",
                        {
                          href: hint.link,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          style: { marginLeft: 4, fontSize: 12 },
                        },
                        "获取方式 ↗",
                      )
                    : null,
                )
              : null,
            // Input field
            isSecret
              ? React.createElement(Input.Password, {
                  placeholder: `请输入 ${hint?.label || envKey}`,
                  value: mcpConfigEnvValues[envKey] || "",
                  onChange: (e: any) =>
                    setMcpConfigEnvValues((prev: any) => ({
                      ...prev,
                      [envKey]: e.target.value,
                    })),
                  style: { width: "100%" },
                })
              : React.createElement(Input, {
                  placeholder: `请输入 ${hint?.label || envKey}`,
                  value: mcpConfigEnvValues[envKey] || "",
                  onChange: (e: any) =>
                    setMcpConfigEnvValues((prev: any) => ({
                      ...prev,
                      [envKey]: e.target.value,
                    })),
                  style: { width: "100%" },
                }),
            // Show env key name for reference
            React.createElement(
              Text,
              { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
              `环境变量名: ${envKey}`,
            ),
          );
        }),
      )
    : null;

  const expertsMarketTab = React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索专家模板...",
        prefix: SearchOutlined ? React.createElement(SearchOutlined) : undefined,
        value: expertSearchText,
        onChange: (e: any) => setExpertSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 400, flex: 1, minWidth: 200 },
      }),
      React.createElement(
        Button,
        {
          icon: UserOutlined ? React.createElement(UserOutlined) : undefined,
          onClick: () => setExpertSourceConfigOpen(true),
          size: "small",
        },
        "配置专家源",
      ),
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    ossAgentCategories.length > 0
      ? React.createElement(
          "div",
          {
            style: {
              marginBottom: 12,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
            },
          },
          React.createElement(
            Text,
            { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
            "分类:",
          ),
          React.createElement(
            Tag,
            {
              style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
              color: expertSelectedCategory === "" ? "blue" : undefined,
              onClick: () => setExpertSelectedCategory(""),
            },
            "全部",
          ),
          ...ossAgentCategories.map((cat) =>
            React.createElement(
              Tag,
              {
                key: cat.id,
                style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
                color: expertSelectedCategory === cat.id ? "geekblue" : undefined,
                onClick: () =>
                  setExpertSelectedCategory(
                    expertSelectedCategory === cat.id ? "" : cat.id,
                  ),
              },
              cat.label,
            ),
          ),
        )
      : null,
    // Agent cards (dynamic from OSS)
    ossAgentLoading && filteredOssAgents.length === 0
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 40 } },
          React.createElement(Spin, { size: "large" }, React.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载专家模板...")),
        )
      : filteredOssAgents.length === 0
        ? React.createElement(Empty, {
            description: "未找到匹配的专家模板",
            image: Empty.PRESENTED_IMAGE_SIMPLE,
          })
        : React.createElement(
            Row,
            { gutter: [12, 12] },
            ...filteredOssAgents.map((agent) =>
              React.createElement(
                Col,
                { key: agent.id, xs: 24, sm: 12, md: 8 },
                React.createElement(
                  Card,
                  {
                    hoverable: true,
                    size: "small",
                    style: { height: "100%", cursor: "pointer" },
                    onClick: () => handleCreateOssAgent(agent),
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 8,
                      },
                    },
                    React.createElement(ExpertAvatar, {
                      name: agent.name,
                      size: 40,
                    }),
                    React.createElement(
                      "div",
                      { style: { flex: 1 } },
                      React.createElement(
                        Text,
                        { strong: true, style: { fontSize: 14 } },
                        agent.name,
                      ),
                      React.createElement(
                        "div",
                        { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                        agent.category
                          ? React.createElement(
                              Tag,
                              { color: "blue", style: { fontSize: 10 } },
                              _tagGroupLabel(agent.category),
                            )
                          : null,
                        agent.tags.includes("mcp")
                          ? React.createElement(
                              Tag,
                              { color: "purple", style: { fontSize: 10 } },
                              "MCP",
                            )
                          : null,
                      ),
                    ),
                  ),
                  React.createElement(
                    Paragraph,
                    {
                      type: "secondary",
                      style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                      ellipsis: { rows: 3 },
                    },
                    agent.description,
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: "1px solid #f0f0f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    },
                    React.createElement(
                      Text,
                      { type: "secondary", style: { fontSize: 11 } },
                      agent.tags.filter((t) => t !== "agent" && t !== "template" && t !== "workspace").slice(0, 3).join(" · ") || "专家模板",
                    ),
                    React.createElement(
                      Button,
                      {
                        type: "primary",
                        size: "small",
                        loading: ossAgentCreating,
                        disabled: ossAgentCreating,
                        icon: AppstoreOutlined
                          ? React.createElement(AppstoreOutlined)
                          : undefined,
                      },
                      "一键创建",
                    ),
                  ),
                ),
              ),
            ),
          ),
    // Info hint
    React.createElement(
      "div",
      {
        style: {
          marginTop: 20,
          padding: 16,
          textAlign: "center",
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          background: "#fafafa",
        },
      },
      ShopOutlined
        ? React.createElement(ShopOutlined, {
            style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 },
          })
        : null,
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12 } },
        "专家模板来自 UGSci 官方源，自动同步更新",
      ),
    ),
  );

  const tabItems = [
    {
      key: "skills",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        AppstoreOutlined
          ? React.createElement(AppstoreOutlined, { style: { fontSize: 14 } })
          : null,
        "技能市场",
      ),
      children: skillsMarketTab,
    },
    {
      key: "mcp",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ApiOutlined
          ? React.createElement(ApiOutlined, { style: { fontSize: 14 } })
          : null,
        "MCP 市场",
      ),
      children: mcpMarketTab,
    },
    {
      key: "experts",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        UserOutlined
          ? React.createElement(UserOutlined, { style: { fontSize: 14 } })
          : null,
        "专家模板",
      ),
      children: expertsMarketTab,
    },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 创建专家模板 · 随时更新能力和专家",
      extra: React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement(
          Button,
          {
            type: "primary",
            icon: ReloadOutlined
              ? React.createElement(ReloadOutlined)
              : undefined,
            onClick: () => {
              doSearch(searchText, selectedCategory, {});
              loadGithubSkills();
              loadOssMarketData();
            },
            loading: loading || githubLoading || ossMcpLoading || ossAgentLoading,
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
    // Skill source config modal
    React.createElement(SourceConfigModal, {
      open: sourceConfigOpen,
      onClose: () => setSourceConfigOpen(false),
      sources: githubSources,
      onChange: (next: GitHubSkillSource[]) => {
        setGithubSources(next);
        loadGithubSkills(next);
      },
    }),
    // MCP source config modal
    React.createElement(GenericSourceConfigModal, {
      open: mcpSourceConfigOpen,
      onClose: () => setMcpSourceConfigOpen(false),
      sources: mcpSources,
      onChange: (next: GenericSource[]) => setMcpSources(next),
      type: "mcp",
    }),
    // MCP token config modal (for templates requiring secrets)
    mcpConfigModal,
    // Expert source config modal
    React.createElement(GenericSourceConfigModal, {
      open: expertSourceConfigOpen,
      onClose: () => setExpertSourceConfigOpen(false),
      sources: expertSources,
      onChange: (next: GenericSource[]) => setExpertSources(next),
      type: "expert",
    }),
  );
}

