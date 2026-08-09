/**
 * Skill pool tab — browse and manage the shared skill pool.
 */

import { getHost } from "../core/runtime";
import { PRIMARY_BTN_STYLE, renderMarkdown } from "../core/shared";
import type { PoolSkillSpec, WorkspaceSkillSummary, AgentSummary } from "../core/types";
import { fetchPoolSkillContent } from "../core/api";
import { deletePoolSkill, installSkillFromPool } from "../expert/expertApi";
import { ExpertAvatar } from "../components/avatars";

export function SkillPoolTab({
  poolSkills,
  workspaceSkills,
  agents,
  loading,
  onReload,
  onSkillInstalled,
  agentId,
  agentName,
}: {
  poolSkills: PoolSkillSpec[];
  workspaceSkills: WorkspaceSkillSummary[];
  agents: AgentSummary[];
  loading: boolean;
  onReload: () => void | Promise<void>;
  onSkillInstalled: (skill: PoolSkillSpec) => void;
  agentId: string;
  agentName: string;
}) {
  const React = getHost().React;
  const { useState, useMemo, useCallback, useEffect, useRef } = React;
  const {
    Spin,
    Empty,
    Input,
    Button,
    Row,
    Col,
    Card,
    Tag,
    Typography,
    Drawer,
    Descriptions,
    List,
    Modal,
    message: antdMsg,
  } = getHost().antd;
  const {
    ReloadOutlined,
    SearchOutlined,
    DownloadOutlined,
    ThunderboltOutlined,
    DeleteOutlined,
    PlusOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState<PoolSkillSpec | null>(null);
  const [installedAgents, setInstalledAgents] = useState<string[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(24);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const scrollTopRef = useRef(0);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

  const installedForCurrentAgent = useMemo(
    () =>
      new Set(
        workspaceSkills
          .find((workspace) => workspace.agent_id === agentId)
          ?.skills.map((skill) => skill.name) || [],
      ),
    [workspaceSkills, agentId],
  );

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

  const visibleSkills = useMemo(
    () => filteredSkills.slice(0, displayCount),
    [filteredSkills, displayCount],
  );

  // Load the next page as the user approaches the end of the list. The
  // sentinel is deliberately placed below the grid so appending cards does
  // not replace the existing DOM or disturb the user's scroll position.
  useEffect(() => {
    if (visibleSkills.length >= filteredSkills.length) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const loadNextPage = () => {
      setDisplayCount((current) =>
        Math.min(current + 24, filteredSkills.length),
      );
    };

    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) loadNextPage();
        },
        { rootMargin: "240px 0px" },
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
    }

    // Older embedded WebViews may not expose IntersectionObserver. Keep the
    // same behavior with a lightweight scroll fallback.
    const onScroll = () => {
      if (sentinel.getBoundingClientRect().top <= window.innerHeight + 240) {
        loadNextPage();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [filteredSkills.length, visibleSkills.length]);

  const handleSearchChange = useCallback((val: string) => {
    setSearchText(val);
    setDisplayCount(24);
  }, []);

  const restoreScrollPosition = useCallback(() => {
    const top = scrollTopRef.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top, behavior: "auto" });
      if (document.scrollingElement) document.scrollingElement.scrollTop = top;
    });
  }, []);

  const handleReload = useCallback(async () => {
    scrollTopRef.current =
      document.scrollingElement?.scrollTop ?? window.scrollY ?? 0;
    try {
      await onReload();
    } finally {
      restoreScrollPosition();
    }
  }, [onReload, restoreScrollPosition]);

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

  const handleCardClick = useCallback(
    async (skill: PoolSkillSpec) => {
      setActiveSkill(skill);
      setInstalledAgents(computeInstalledAgents(skill.name));
      setDrawerOpen(true);
      // Lazy-load full content if not already present
      if (!skill.content) {
        setContentLoading(true);
        try {
          const content = await fetchPoolSkillContent(skill.name);
          setActiveSkill({ ...skill, content });
        } catch {
          // keep empty content on error
        } finally {
          setContentLoading(false);
        }
      }
    },
    [computeInstalledAgents],
  );

  useEffect(() => {
    if (activeSkill) {
      setInstalledAgents(computeInstalledAgents(activeSkill.name));
    }
  }, [activeSkill, computeInstalledAgents, workspaceSkills]);

  // ── Hover action handlers ─────────────────────────────────────────────────
  const handleInstallToAgent = async (skill: PoolSkillSpec) => {
    setActionLoading(true);
    try {
      await installSkillFromPool(agentId, skill.name);
      antdMsg.success(
        `已将技能「${skill.name}」加载到当前专家「${agentName}」`,
      );
      // Installing an agent skill does not change the pool itself. Avoid a
      // full pool reload so the user's current list and scroll position stay
      // exactly where they are; notify the sibling tab instead.
      onSkillInstalled(skill);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能失败");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFromPool = (skill: PoolSkillSpec) => {
    if (skill.protected) {
      antdMsg.warning("内置技能不可删除");
      return;
    }
    Modal.confirm({
      title: `确认从技能池删除「${skill.name}」？`,
      content:
        "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        setActionLoading(true);
        try {
          await deletePoolSkill(skill.name);
          antdMsg.success(`已从技能池删除「${skill.name}」`);
          await handleReload();
        } catch (err: any) {
          antdMsg.error(err.message || "删除失败");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        },
      },
      React.createElement(Input, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: any) => handleSearchChange(e.target.value),
        allowClear: true,
        style: { maxWidth: 400 },
      }),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement(
          Button,
          {
            icon: ReloadOutlined
              ? React.createElement(ReloadOutlined)
              : undefined,
            onClick: handleReload,
            loading,
            size: "small",
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
            size: "small",
            style: PRIMARY_BTN_STYLE,
          },
          "管理技能池",
        ),
      ),
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
            React.Fragment,
            null,
            React.createElement(
              Row,
              { gutter: [12, 12] },
              ...visibleSkills.map((skill) =>
                React.createElement(
                  Col,
                  { key: skill.name, xs: 24, sm: 12, md: 8, lg: 6 },
                  React.createElement(
                    Card,
                    {
                      hoverable: true,
                      size: "small",
                      style: { cursor: "pointer", height: "100%" },
                      onClick: () => handleCardClick(skill),
                      onMouseEnter: () => setHoveredSkill(skill.name),
                      onMouseLeave: () => setHoveredSkill(null),
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
                    ...(skill.tags || [])
                      .slice(0, 3)
                      .map((tag, i) =>
                        React.createElement(
                          Tag,
                          { key: i, color: "cyan", style: { fontSize: 10 } },
                          tag,
                        ),
                      ),
                  ),
                  // Hover action footer
                  hoveredSkill === skill.name
                    ? React.createElement(
                        "div",
                        {
                          style: {
                            marginTop: 8,
                            paddingTop: 8,
                            borderTop: "1px solid #f0f0f0",
                            display: "flex",
                            gap: 8,
                            justifyContent: "flex-end",
                          },
                        },
                        React.createElement(
                          Button,
                          {
                            size: "small",
                            type: "primary",
                            icon: PlusOutlined
                              ? React.createElement(PlusOutlined)
                              : undefined,
                            disabled:
                              actionLoading || installedForCurrentAgent.has(skill.name),
                            onClick: (e: any) => {
                              e.stopPropagation();
                              handleInstallToAgent(skill);
                            },
                          },
                          installedForCurrentAgent.has(skill.name)
                            ? "已加载"
                            : "加载到当前Agent",
                        ),
                        React.createElement(
                          Button,
                          {
                            size: "small",
                            danger: true,
                            icon: DeleteOutlined
                              ? React.createElement(DeleteOutlined)
                              : undefined,
                            disabled: actionLoading || skill.protected,
                            onClick: (e: any) => {
                              e.stopPropagation();
                              handleDeleteFromPool(skill);
                            },
                          },
                          "删除",
                        ),
                      )
                    : null,
                ),
              ),
            ),
            // Infinite-scroll sentinel
            visibleSkills.length < filteredSkills.length
              ? React.createElement(
                  "div",
                  {
                    ref: loadMoreSentinelRef,
                    style: {
                      minHeight: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 16,
                    },
                  },
                  React.createElement(
                    Text,
                    { type: "secondary", style: { fontSize: 12 } },
                    `继续下滑自动加载 · 还剩 ${filteredSkills.length - visibleSkills.length} 个`,
                  ),
                )
              : null,
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
                  {
                    strong: true,
                    style: { display: "block", marginBottom: 8 },
                  },
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
                        React.createElement(ExpertAvatar, { name: agentName, size: 20 }),
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
          // Skill content preview (lazy-loaded)
          contentLoading
            ? React.createElement(
                "div",
                { style: { marginTop: 16, textAlign: "center" } },
                React.createElement(Spin, { size: "small" }),
              )
            : activeSkill.content
              ? React.createElement(
                  "div",
                  { style: { marginTop: 16 } },
                  React.createElement(
                    Text,
                    {
                      strong: true,
                      style: { display: "block", marginBottom: 8 },
                    },
                    "技能内容",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        maxHeight: 300,
                        overflow: "auto",
                        padding: 12,
                        background: "var(--ant-color-fill-secondary, #f5f5f5)",
                        borderRadius: 6,
                        fontSize: 12,
                        whiteSpace: "pre-wrap",
                      },
                    },
                    activeSkill.content.slice(0, 2000) +
                      (activeSkill.content.length > 2000
                        ? "\n\n... (内容已截断)"
                        : ""),
                  ),
                )
              : null,
        )
      : null,
  );
}
