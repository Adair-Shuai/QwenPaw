/**
 * Marketplace page — browse and install skills, MCP clients, and expert bundles.
 */

import {
  getHost,
  clearApiCache,
  clearAgentCache,
  apiFetch,
} from "../core/runtime";
import { PRIMARY_BTN_STYLE, renderMarkdown, PageHeader } from "../core/shared";
import type { AgentSummary, MCPClientInfo } from "../core/types";
import { fetchAgents, fetchPoolSkills } from "../core/api";
import { ExpertAvatar } from "../components/avatars";
import { MCPConnectModal } from "./MCPConnectModal";
import { safeMcpLink } from "./mcpConnection";
import { ExpertPublishModal } from "./ExpertPublishModal";
import {
  extractPromptFromSkills,
  installSkillFromPool,
  deletePoolSkill,
  writeKnowledgeFile,
  fetchAgentMCPClients,
} from "../expert/expertApi";
import {
  type MCPTemplate,
  type GitHubSkill,
  type GitHubSkillSource,
  type DynamicCategory,
  type OssMcpServer,
  type OssAgent,
  type GenericSource,
  fetchOssResponse,
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
  subscribeOssManifestUpdates,
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

export async function fetchMarketCategories(
  lang: string,
): Promise<MarketCategory[]> {
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

export function MarketplacePage({
  embedded = false,
}: { embedded?: boolean } = {}) {
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
    UserAddOutlined,
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
  const [mcpInstallTargetAgent, setMcpInstallTargetAgent] =
    useState<string>("");
  const [existingMcps, setExistingMcps] = useState<
    Record<string, MCPClientInfo>
  >({});
  const [connectedMcps, setConnectedMcps] = useState<Set<string>>(new Set());
  const [mcpConfig, setMcpConfig] = useState<{
    template: MCPTemplate;
    agentId: string;
    existing?: MCPClientInfo;
  } | null>(null);
  const [mcpVisibleCount, setMcpVisibleCount] = useState(24);
  const mcpTargetRef = useRef(mcpInstallTargetAgent);
  mcpTargetRef.current = mcpInstallTargetAgent;

  // GitHub skill sources state
  const [githubSources, setGithubSources] = useState<GitHubSkillSource[]>([]);
  const [githubSkills, setGithubSkills] = useState<GitHubSkill[]>([]);
  // Official OSS skills bypass localStorage so older saved source settings
  // cannot accidentally hide the canonical registry.
  const [ossSkills, setOssSkills] = useState<GitHubSkill[]>([]);
  const [ossSkillsError, setOssSkillsError] = useState("");
  const [ossSkillsLoading, setOssSkillsLoading] = useState(false);
  const [skillVisibleCount, setSkillVisibleCount] = useState(24);
  const [expertVisibleCount, setExpertVisibleCount] = useState(24);
  const [githubLoading, setGithubLoading] = useState(false);
  const [sourceConfigOpen, setSourceConfigOpen] = useState(false);

  // MCP sources state
  const [mcpSources, setMcpSources] = useState<GenericSource[]>([]);
  const [mcpSourceConfigOpen, setMcpSourceConfigOpen] = useState(false);

  // Expert sources state
  const [expertSources, setExpertSources] = useState<GenericSource[]>([]);
  const [expertSourceConfigOpen, setExpertSourceConfigOpen] = useState(false);
  const [expertPublishOpen, setExpertPublishOpen] = useState(false);

  // ── OSS MCP market state (dynamic from official manifest) ──
  const [ossMcpServers, setOssMcpServers] = useState<OssMcpServer[]>([]);
  const [ossMcpCategories, setOssMcpCategories] = useState<DynamicCategory[]>(
    [],
  );
  const [ossMcpLoading, setOssMcpLoading] = useState(false);
  const [ossMcpError, setOssMcpError] = useState("");
  const [mcpSelectedCategory, setMcpSelectedCategory] = useState("");

  // ── OSS Agents market state (dynamic from official manifest) ──
  const [ossAgents, setOssAgents] = useState<OssAgent[]>([]);
  const [ossAgentCategories, setOssAgentCategories] = useState<
    DynamicCategory[]
  >([]);
  const [ossAgentLoading, setOssAgentLoading] = useState(false);
  const [ossAgentError, setOssAgentError] = useState("");
  const [expertSelectedCategory, setExpertSelectedCategory] = useState("");
  const [ossAgentCreating, setOssAgentCreating] = useState(false);
  const [agentDetail, setAgentDetail] = useState<OssAgent | null>(null);

  // ── Dynamic skill categories (from OSS manifest tag_groups) ──
  const [ossSkillCategories, setOssSkillCategories] = useState<
    DynamicCategory[]
  >([]);

  const searchTimerRef = useRef<any>(null);
  const catalogGeneration = useRef(0);
  const githubGeneration = useRef(0);

  // Load providers and categories on mount
  useEffect(() => {
    let alive = true;
    fetchMarketProviders()
      .then((value) => {
        if (alive) setProviders(value);
      })
      .catch(() => {});
    fetchMarketCategories("zh")
      .then((value) => {
        if (alive) setCategories(value);
      })
      .catch(() => {});
    fetchAgents()
      .then((agentList) => {
        if (!alive) return;
        setAgents(agentList);
        if (agentList.length > 0) {
          setInstallTargetAgent(agentList[0].id);
          setMcpInstallTargetAgent(agentList[0].id);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Load GitHub sources from localStorage on mount, then fetch skills
  const loadGithubSkills = useCallback(
    async (sources?: GitHubSkillSource[]) => {
      const generation = ++githubGeneration.current;
      const srcs = sources ?? loadGithubSources();
      if (sources) setGithubSources(sources);
      else setGithubSources(srcs);
      const enabled = srcs.filter((s) => s.enabled);
      if (enabled.length === 0) {
        setGithubSkills([]);
        setGithubLoading(false);
        return;
      }
      setGithubLoading(true);
      try {
        const { skills, errors } = await fetchAllGitHubSkills(srcs);
        if (generation !== githubGeneration.current) return;
        setGithubSkills(skills);
        // Extract dynamic categories from OSS skills that have tags
        // (Categories computed dynamically via unifiedCategories)
        if (errors.length > 0) {
          for (const err of errors) {
            console.warn(
              `[ugsci] GitHub source '${err.label}' error: ${err.message}`,
            );
          }
          antdMsg.warning(
            `部分源加载失败: ${errors.map((e) => e.label).join(", ")}`,
          );
        }
      } catch (err: any) {
        if (generation !== githubGeneration.current) return;
        antdMsg.error(err.message || "加载技能源失败");
      } finally {
        if (generation === githubGeneration.current) setGithubLoading(false);
      }
    },
    [],
  );

  // Each catalog paints independently; a slow source never gates another tab.
  const loadOssMarketData = useCallback(async (refresh = false) => {
    const generation = ++catalogGeneration.current;
    const current = () => generation === catalogGeneration.current;
    setOssMcpLoading(true);
    setOssAgentLoading(true);
    setOssSkillsLoading(true);
    await Promise.allSettled([
      fetchOSSMcpManifest(refresh)
        .then((value) => {
          if (!current()) return;
          setOssMcpServers(value.servers);
          setOssMcpCategories(value.categories);
          setOssMcpError("");
        })
        .catch(() => {
          if (current())
            setOssMcpError("MCP 目录暂时无法更新，已有内容仍可浏览。");
        })
        .finally(() => {
          if (current()) setOssMcpLoading(false);
        }),
      fetchOSSAgentsManifest(refresh)
        .then((value) => {
          if (!current()) return;
          setOssAgents(value.agents);
          setOssAgentCategories(value.categories);
          setOssAgentError("");
        })
        .catch(() => {
          if (current())
            setOssAgentError("人才目录暂时无法更新，已有内容仍可浏览。");
        })
        .finally(() => {
          if (current()) setOssAgentLoading(false);
        }),
      fetchOSSSkillsManifest(refresh)
        .then((value) => {
          if (!current()) return;
          setOssSkills(value.skills);
          setOssSkillCategories(value.categories);
          setOssSkillsError("");
        })
        .catch(() => {
          if (current())
            setOssSkillsError("技能目录暂时无法更新，已有内容仍可浏览。");
        })
        .finally(() => {
          if (current()) setOssSkillsLoading(false);
        }),
    ]);
  }, []);

  useEffect(() => {
    loadGithubSkills();
    loadOssMarketData();
    // Load MCP and Expert sources from localStorage
    setMcpSources(loadMcpSources());
    setExpertSources(loadExpertSources());
    const unsubscribe = subscribeOssManifestUpdates(() => {
      void loadOssMarketData();
    });
    return () => {
      unsubscribe();
      catalogGeneration.current += 1;
      githubGeneration.current += 1;
    };
  }, [loadGithubSkills, loadOssMarketData]);

  useEffect(() => {
    setSkillVisibleCount(24);
  }, [searchText, selectedCategory]);
  useEffect(() => {
    setExpertVisibleCount(24);
  }, [expertSearchText, expertSelectedCategory]);

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
          `技能「${
            result.name || skill.name
          }」已安装到技能池，可在技能中心查看`,
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
      const groupCat = ossSkillCategories.find(
        (c) => c.id === selectedCategory,
      );
      if (groupCat && groupCat.tags) {
        // Filter by tag group membership: skill's tag must be in the group's tags
        filtered = filtered.filter(
          (s) =>
            (s.tag && groupCat.tags!.includes(s.tag)) ||
            s.sourceLabel === selectedCategory,
        );
      } else {
        filtered = filtered.filter(
          (s) =>
            s.tag === selectedCategory || s.sourceLabel === selectedCategory,
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
  const skillsMarketTab =
    activeTab === "skills"
      ? React.createElement(
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
            React.createElement(
              Button,
              {
                size: "small",
                loading: ossSkillsLoading,
                onClick: () => {
                  void loadOssMarketData(true);
                  void loadGithubSkills();
                },
              },
              "刷新技能目录",
            ),
          ),
          // Dynamic category filter tags (from OSS manifest tags + imported sources)
          ossSkillsError
            ? React.createElement(Alert, {
                type: "warning",
                showIcon: true,
                message: "UGSci 官方 OSS 技能库加载失败",
                description:
                  "请检查网络后点击“刷新技能目录”重试，已加载的技能仍可浏览。",
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
                  {
                    type: "secondary",
                    style: { fontSize: 12, marginRight: 4 },
                  },
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
                      color:
                        selectedCategory === cat.id
                          ? isImported
                            ? "blue"
                            : "geekblue"
                          : undefined,
                      icon: isImported
                        ? GithubOutlined
                          ? React.createElement(GithubOutlined)
                          : undefined
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
          (githubLoading || ossSkillsLoading) && allSkills.length === 0
            ? React.createElement(
                "div",
                {
                  style: { textAlign: "center", padding: 40, marginBottom: 16 },
                },
                React.createElement(
                  Spin,
                  { size: "large" },
                  React.createElement(
                    "div",
                    {
                      style: {
                        minHeight: 60,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    },
                    "正在加载技能...",
                  ),
                ),
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
                  ...filteredGithubSkills
                    .slice(0, skillVisibleCount)
                    .map((skill) => {
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
                                  style: {
                                    fontSize: 18,
                                    color:
                                      "var(--ant-color-text-secondary, #57606a)",
                                  },
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
                              style: {
                                fontSize: 11,
                                margin: 0,
                                lineHeight: 1.4,
                              },
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
                              {
                                style: {
                                  display: "flex",
                                  gap: 4,
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                },
                              },
                              // Show source path (e.g. "UGSci/anthropics") in bottom-left
                              skill.sourcePath || skill.sourceLabel
                                ? React.createElement(
                                    "span",
                                    {
                                      style: {
                                        fontSize: 10,
                                        color:
                                          "var(--ant-color-text-tertiary, #999)",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 2,
                                      },
                                    },
                                    ApiOutlined
                                      ? React.createElement(ApiOutlined, {
                                          style: { fontSize: 10 },
                                        })
                                      : null,
                                    skill.sourcePath || skill.sourceLabel,
                                  )
                                : null,
                              // Show tag as category badge
                              skill.tag
                                ? React.createElement(
                                    Tag,
                                    {
                                      color: "geekblue",
                                      style: { fontSize: 10 },
                                    },
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
                                    onClick: () =>
                                      handleInstallGithubSkill(skill),
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
          filteredGithubSkills.length > skillVisibleCount
            ? React.createElement(
                "div",
                { style: { textAlign: "center", marginBottom: 20 } },
                React.createElement(
                  Button,
                  {
                    onClick: () =>
                      setSkillVisibleCount((count: number) => count + 24),
                  },
                  `显示更多技能（已显示 ${Math.min(
                    skillVisibleCount,
                    filteredGithubSkills.length,
                  )} / ${filteredGithubSkills.length}）`,
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
                  `技能市场${
                    filteredResults.length > 0
                      ? ` (${filteredResults.length})`
                      : ""
                  }`,
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
                    {
                      style: { display: "flex", alignItems: "center", gap: 8 },
                    },
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
                        {
                          style: { display: "flex", gap: 12, flexWrap: "wrap" },
                        },
                        ...Object.entries(detailItem.stats).map(
                          ([key, value]) =>
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
        )
      : null;

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
      // Download the complete published template before creating local state.
      const [systemPrompt, skillNames] = await Promise.all([
        agent.instructions
          ? (async () => {
              const resp = await fetchOssResponse(
                agent.instructions!.replace(/^\/+/, ""),
              );
              if (!resp.ok)
                throw new Error("专家提示词加载失败，请重试后再创建");
              const content = await resp.text();
              if (!content.trim()) throw new Error("专家提示词为空，无法创建");
              return content;
            })()
          : Promise.resolve(agent.description),
        agent.skills_manifest
          ? (async () => {
              const resp = await fetchOssResponse(
                agent.skills_manifest!.replace(/^\/+/, ""),
              );
              if (!resp.ok)
                throw new Error("专家技能清单加载失败，请重试后再创建");
              const data = await resp.json();
              const list = Array.isArray(data) ? data : data.skills;
              if (!Array.isArray(list)) throw new Error("专家技能清单格式无效");
              return list
                .map((item: any) =>
                  typeof item === "string" ? item : item?.name,
                )
                .filter((item: any) => typeof item === "string" && item.trim());
            })()
          : Promise.resolve([] as string[]),
      ]);
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

  // Read persisted configuration separately from verified connection status.
  const loadExistingMcpKeys = useCallback(async (agentId: string) => {
    if (!agentId) return;
    try {
      const data = await fetchAgentMCPClients(agentId);
      if (mcpTargetRef.current !== agentId) return;
      setExistingMcps(
        Object.fromEntries(data.map((client) => [client.key, client])),
      );
    } catch {
      if (mcpTargetRef.current === agentId) setExistingMcps({});
    }
  }, []);

  useEffect(() => {
    setExistingMcps({});
    setConnectedMcps(new Set());
    if (mcpInstallTargetAgent) loadExistingMcpKeys(mcpInstallTargetAgent);
  }, [mcpInstallTargetAgent, loadExistingMcpKeys]);

  useEffect(() => {
    setMcpVisibleCount(24);
  }, [mcpSearchText, mcpSelectedCategory]);

  const handleInstallMcp = (template: MCPTemplate) => {
    if (!mcpInstallTargetAgent) {
      antdMsg.warning("请先选择目标专家");
      return;
    }
    setMcpConfig({
      template,
      agentId: mcpInstallTargetAgent,
      existing: existingMcps[template.id],
    });
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

  const mcpMarketTab =
    activeTab === "mcp"
      ? React.createElement(
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
              prefix: SearchOutlined
                ? React.createElement(SearchOutlined)
                : undefined,
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
                {
                  type: "secondary",
                  style: { fontSize: 12, whiteSpace: "nowrap" },
                },
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
                icon: ApiOutlined
                  ? React.createElement(ApiOutlined)
                  : undefined,
                onClick: () => setMcpSourceConfigOpen(true),
                size: "small",
              },
              "配置 MCP 源",
            ),
            React.createElement(
              Button,
              {
                size: "small",
                loading: ossMcpLoading,
                onClick: () => loadOssMarketData(true),
              },
              "刷新目录",
            ),
          ),
          ossMcpError
            ? React.createElement(Alert, {
                type: "warning",
                showIcon: true,
                message: ossMcpError,
                style: { marginBottom: 12 },
              })
            : null,
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
                  {
                    type: "secondary",
                    style: { fontSize: 12, marginRight: 4 },
                  },
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
                      style: {
                        fontSize: 11,
                        cursor: "pointer",
                        borderRadius: 12,
                      },
                      color:
                        mcpSelectedCategory === cat.id ? "geekblue" : undefined,
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
                React.createElement(
                  Spin,
                  { size: "large" },
                  React.createElement(
                    "div",
                    {
                      style: {
                        minHeight: 60,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    },
                    "正在加载 MCP 服务器...",
                  ),
                ),
              )
            : filteredMcpTemplates.length === 0
            ? React.createElement(Empty, {
                description: "未找到匹配的 MCP 服务器",
                image: Empty.PRESENTED_IMAGE_SIMPLE,
              })
            : React.createElement(
                Row,
                { gutter: [12, 12] },
                ...filteredMcpTemplates
                  .slice(0, mcpVisibleCount)
                  .map((template, index) =>
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
                            {
                              style: {
                                fontSize: 28,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 32,
                                height: 32,
                              },
                            },
                            template.iconUrl
                              ? React.createElement("img", {
                                  src: template.iconUrl,
                                  alt: template.name,
                                  width: 28,
                                  height: 28,
                                  decoding: "async",
                                  loading: index < 12 ? "eager" : "lazy",
                                  style: {
                                    width: 28,
                                    height: 28,
                                    objectFit: "contain",
                                  },
                                  onError: (e: any) => {
                                    e.target.style.display = "none";
                                  },
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
                              {
                                style: {
                                  display: "flex",
                                  gap: 4,
                                  marginTop: 4,
                                  flexWrap: "wrap",
                                },
                              },
                              React.createElement(
                                Tag,
                                { color: "blue", style: { fontSize: 10 } },
                                template.category,
                              ),
                              React.createElement(
                                Tag,
                                {
                                  color:
                                    template.transport === "stdio"
                                      ? "purple"
                                      : "cyan",
                                  style: { fontSize: 10 },
                                },
                                template.transport,
                              ),
                              template.authType === "oauth2"
                                ? React.createElement(
                                    Tag,
                                    {
                                      color: "geekblue",
                                      style: { fontSize: 10 },
                                    },
                                    "账号登录授权",
                                  )
                                : null,
                              template.env &&
                                Object.values(template.env).some(
                                  (value) =>
                                    value.startsWith("your-") ||
                                    value.includes("${"),
                                )
                                ? React.createElement(
                                    Tag,
                                    {
                                      color: "orange",
                                      style: { fontSize: 10 },
                                    },
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
                        template.requirements?.length ||
                          template.limitations?.length
                          ? React.createElement(
                              "details",
                              { style: { marginTop: 8, fontSize: 12 } },
                              React.createElement(
                                "summary",
                                {
                                  style: {
                                    cursor: "pointer",
                                    color: "var(--ant-color-primary, #1677ff)",
                                  },
                                },
                                "接入要求与限制",
                              ),
                              ...[
                                ...(template.requirements || []),
                                ...(template.limitations || []),
                              ].map((text, i) =>
                                React.createElement(
                                  "p",
                                  { key: i, style: { margin: "6px 0" } },
                                  text,
                                ),
                              ),
                              safeMcpLink(template.source)
                                ? React.createElement(
                                    "a",
                                    {
                                      href: safeMcpLink(template.source),
                                      target: "_blank",
                                      rel: "noopener noreferrer",
                                    },
                                    "查看来源说明 ↗",
                                  )
                                : null,
                            )
                          : null,
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
                            connectedMcps.has(template.id)
                              ? "已连接 · 工具检测通过"
                              : existingMcps[template.id]
                              ? template.authType === "oauth2" &&
                                !existingMcps[template.id].oauth_status
                                  ?.authorized
                                ? "已保存 · 待登录授权"
                                : "已保存 · 连接待检测"
                              : template.transport === "stdio"
                              ? `${template.command} ${(
                                  template.args || []
                                ).join(" ")}`
                              : template.authType === "oauth2"
                              ? "浏览器登录 · 自动检测连接"
                              : "远程服务 · 按账号权限连接",
                          ),
                          React.createElement(
                            Button,
                            {
                              type: "primary",
                              size: "small",
                              icon: ApiOutlined
                                ? React.createElement(ApiOutlined)
                                : undefined,
                              onClick: () => handleInstallMcp(template),
                            },
                            existingMcps[template.id]
                              ? "管理连接"
                              : template.transport === "stdio"
                              ? "添加工具"
                              : "连接",
                          ),
                        ),
                      ),
                    ),
                  ),
              ),
          filteredMcpTemplates.length > mcpVisibleCount
            ? React.createElement(
                "div",
                { style: { textAlign: "center", marginTop: 16 } },
                React.createElement(
                  Button,
                  { onClick: () => setMcpVisibleCount((count) => count + 24) },
                  `加载更多 MCP（已显示 ${Math.min(
                    mcpVisibleCount,
                    filteredMcpTemplates.length,
                  )} / ${filteredMcpTemplates.length}）`,
                ),
              )
            : null,
          // Future expansion hint
          React.createElement(
            "div",
            {
              style: {
                marginTop: 20,
                padding: 16,
                textAlign: "center",
                border: "1px dashed var(--ant-color-border, #d9d9d9)",
                borderRadius: 8,
                background: "var(--ant-color-fill-quaternary, #fafafa)",
              },
            },
            ShopOutlined
              ? React.createElement(ShopOutlined, {
                  style: {
                    fontSize: 24,
                    color: "var(--ant-color-text-quaternary, #bfbfbf)",
                    marginBottom: 8,
                  },
                })
              : null,
            React.createElement(
              Text,
              { type: "secondary", style: { fontSize: 12 } },
              "MCP 服务器列表来自 UGSci 官方源，自动同步更新",
            ),
          ),
        )
      : null;

  const mcpConfigModal = mcpConfig
    ? React.createElement(MCPConnectModal, {
        key: `${mcpConfig.agentId}:${mcpConfig.template.id}`,
        template: mcpConfig.template,
        agentId: mcpConfig.agentId,
        agentName:
          agents.find((agent) => agent.id === mcpConfig.agentId)?.name ||
          mcpConfig.agentId,
        existing: mcpConfig.existing,
        onSaved: (client: MCPClientInfo) => {
          if (mcpTargetRef.current !== mcpConfig.agentId) return;
          setExistingMcps((old) => ({ ...old, [client.key]: client }));
          setConnectedMcps((old) => {
            const next = new Set(old);
            next.delete(client.key);
            return next;
          });
        },
        onConnected: () => {
          if (mcpTargetRef.current === mcpConfig.agentId)
            setConnectedMcps((old) => new Set(old).add(mcpConfig.template.id));
        },
        onClose: () => setMcpConfig(null),
      })
    : null;
  const expertsMarketTab =
    activeTab === "experts"
      ? React.createElement(
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
              placeholder: "搜索人才...",
              prefix: SearchOutlined
                ? React.createElement(SearchOutlined)
                : undefined,
              value: expertSearchText,
              onChange: (e: any) => setExpertSearchText(e.target.value),
              allowClear: true,
              style: { maxWidth: 400, flex: 1, minWidth: 200 },
            }),
            React.createElement(
              Button,
              {
                icon: UserOutlined
                  ? React.createElement(UserOutlined)
                  : undefined,
                onClick: () => setExpertSourceConfigOpen(true),
                size: "small",
              },
              "配置专家源",
            ),
            React.createElement(
              Button,
              {
                size: "small",
                loading: ossAgentLoading,
                onClick: () => loadOssMarketData(true),
              },
              "刷新人才目录",
            ),
            React.createElement(
              Button,
              {
                type: "primary",
                size: "small",
                onClick: () => setExpertPublishOpen(true),
              },
              "发布 / 更新专家",
            ),
          ),
          ossAgentError
            ? React.createElement(Alert, {
                type: "warning",
                showIcon: true,
                message: ossAgentError,
                style: { marginBottom: 12 },
              })
            : null,
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
                  {
                    type: "secondary",
                    style: { fontSize: 12, marginRight: 4 },
                  },
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
                      style: {
                        fontSize: 11,
                        cursor: "pointer",
                        borderRadius: 12,
                      },
                      color:
                        expertSelectedCategory === cat.id
                          ? "geekblue"
                          : undefined,
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
                React.createElement(
                  Spin,
                  { size: "large" },
                  React.createElement(
                    "div",
                    {
                      style: {
                        minHeight: 60,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    },
                    "正在加载人才市场...",
                  ),
                ),
              )
            : filteredOssAgents.length === 0
            ? React.createElement(Empty, {
                description: "未找到匹配的人才",
                image: Empty.PRESENTED_IMAGE_SIMPLE,
              })
            : React.createElement(
                Row,
                { gutter: [12, 12] },
                ...filteredOssAgents.slice(0, expertVisibleCount).map((agent) =>
                  React.createElement(
                    Col,
                    { key: agent.id, xs: 24, sm: 12, md: 8 },
                    React.createElement(
                      Card,
                      {
                        hoverable: true,
                        size: "small",
                        style: { height: "100%", cursor: "pointer" },
                        onClick: () => setAgentDetail(agent),
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
                            {
                              style: {
                                display: "flex",
                                gap: 4,
                                marginTop: 4,
                                flexWrap: "wrap",
                              },
                            },
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
                          agent.tags
                            .filter(
                              (t) =>
                                t !== "agent" &&
                                t !== "template" &&
                                t !== "workspace",
                            )
                            .slice(0, 3)
                            .join(" · ") || "人才模板",
                        ),
                        React.createElement(
                          Button,
                          {
                            type: "primary",
                            size: "small",
                            icon: UserAddOutlined
                              ? React.createElement(UserAddOutlined)
                              : undefined,
                          },
                          "查看详情",
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          filteredOssAgents.length > expertVisibleCount
            ? React.createElement(
                "div",
                { style: { textAlign: "center", marginTop: 16 } },
                React.createElement(
                  Button,
                  {
                    onClick: () =>
                      setExpertVisibleCount((count: number) => count + 24),
                  },
                  `显示更多人才（已显示 ${Math.min(
                    expertVisibleCount,
                    filteredOssAgents.length,
                  )} / ${filteredOssAgents.length}）`,
                ),
              )
            : null,
          // Info hint
          React.createElement(
            "div",
            {
              style: {
                marginTop: 20,
                padding: 16,
                textAlign: "center",
                border: "1px dashed var(--ant-color-border, #d9d9d9)",
                borderRadius: 8,
                background: "var(--ant-color-fill-quaternary, #fafafa)",
              },
            },
            ShopOutlined
              ? React.createElement(ShopOutlined, {
                  style: {
                    fontSize: 24,
                    color: "var(--ant-color-text-quaternary, #bfbfbf)",
                    marginBottom: 8,
                  },
                })
              : null,
            React.createElement(
              Text,
              { type: "secondary", style: { fontSize: 12 } },
              "人才市场来自 UGSci 官方源，自动同步更新",
            ),
          ),
        )
      : null;

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
        UserAddOutlined
          ? React.createElement(UserAddOutlined, { style: { fontSize: 14 } })
          : null,
        "人才市场",
      ),
      children: expertsMarketTab,
    },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    embedded
      ? null
      : React.createElement(PageHeader, {
          title: "市场",
          subtitle:
            "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
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
                  loadOssMarketData(true);
                },
                loading:
                  loading ||
                  githubLoading ||
                  ossSkillsLoading ||
                  ossMcpLoading ||
                  ossAgentLoading,
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
    React.createElement(ExpertPublishModal, {
      open: expertPublishOpen,
      onClose: () => {
        setExpertPublishOpen(false);
        void loadOssMarketData();
      },
    }),
    React.createElement(GenericSourceConfigModal, {
      open: expertSourceConfigOpen,
      onClose: () => setExpertSourceConfigOpen(false),
      sources: expertSources,
      onChange: (next: GenericSource[]) => setExpertSources(next),
      type: "expert",
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    agentDetail
      ? React.createElement(
          Modal,
          {
            title: React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                },
              },
              React.createElement(ExpertAvatar, {
                name: agentDetail.name,
                size: 40,
              }),
              React.createElement(
                "div",
                null,
                React.createElement(
                  Text,
                  { strong: true, style: { fontSize: 16 } },
                  agentDetail.name,
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: 4,
                      marginTop: 2,
                      flexWrap: "wrap",
                    },
                  },
                  agentDetail.category
                    ? React.createElement(
                        Tag,
                        { color: "blue", style: { fontSize: 10 } },
                        _tagGroupLabel(agentDetail.category),
                      )
                    : null,
                  ...agentDetail.tags
                    .filter(
                      (t) =>
                        t !== "agent" && t !== "template" && t !== "workspace",
                    )
                    .slice(0, 5)
                    .map((tag) =>
                      React.createElement(
                        Tag,
                        { key: tag, style: { fontSize: 10 } },
                        tag,
                      ),
                    ),
                ),
              ),
            ),
            open: true,
            onCancel: () => setAgentDetail(null),
            width: 640,
            footer: React.createElement(
              "div",
              { style: { textAlign: "right" } },
              React.createElement(
                Button,
                {
                  onClick: () => setAgentDetail(null),
                  style: { marginRight: 8 },
                },
                "取消",
              ),
              React.createElement(
                Button,
                {
                  type: "primary",
                  loading: ossAgentCreating,
                  disabled: ossAgentCreating,
                  icon: UserAddOutlined
                    ? React.createElement(UserAddOutlined)
                    : undefined,
                  style: PRIMARY_BTN_STYLE,
                  onClick: async () => {
                    await handleCreateOssAgent(agentDetail);
                    setAgentDetail(null);
                  },
                },
                "创建专家",
              ),
            ),
          },
          // Description
          React.createElement(
            "div",
            { style: { marginBottom: 16 } },
            React.createElement(
              Text,
              { strong: true, style: { display: "block", marginBottom: 6 } },
              "简介",
            ),
            React.createElement(
              Paragraph,
              {
                type: "secondary",
                style: { fontSize: 13, lineHeight: 1.7, margin: 0 },
              },
              agentDetail.description,
            ),
          ),
          // Skills manifest hint
          agentDetail.skills_manifest
            ? React.createElement(
                "div",
                {
                  style: {
                    marginBottom: 16,
                    padding: 12,
                    background: "#f6ffed",
                    borderRadius: 8,
                    border: "1px solid #b7eb8f",
                  },
                },
                React.createElement(
                  Text,
                  { style: { fontSize: 12, color: "#52c41a" } },
                  "✓ 包含技能清单，创建后将自动安装推荐技能",
                ),
              )
            : null,
          // Instructions hint
          agentDetail.instructions
            ? React.createElement(
                "div",
                {
                  style: {
                    marginBottom: 16,
                    padding: 12,
                    background: "#e6f4ff",
                    borderRadius: 8,
                    border: "1px solid #91caff",
                  },
                },
                React.createElement(
                  Text,
                  { style: { fontSize: 12, color: "#1677ff" } },
                  "✓ 包含系统提示词，创建后将自动写入 AGENTS.md",
                ),
              )
            : null,
          // Drivers
          agentDetail.drivers && Object.keys(agentDetail.drivers).length > 0
            ? React.createElement(
                "div",
                null,
                React.createElement(
                  Text,
                  {
                    strong: true,
                    style: { display: "block", marginBottom: 6 },
                  },
                  "推荐引擎",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    },
                  },
                  ...Object.entries(agentDetail.drivers).map(
                    ([driver, tools]) =>
                      React.createElement(
                        Tag,
                        { key: driver, color: "cyan", style: { fontSize: 11 } },
                        `${driver}${
                          tools && tools.length > 0
                            ? ` (${tools.join(", ")})`
                            : ""
                        }`,
                      ),
                  ),
                ),
              )
            : null,
        )
      : null,
  );
}
