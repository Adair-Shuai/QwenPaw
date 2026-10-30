import { EXPERT_STYLES } from "./expertStyles";
import {
  EXPERT_CATEGORIES,
  expertPresentation,
  fetchExpertPresentation,
} from "./expertPresentation";
/**
 * Expert center page with knowledge base tab and preset prompts tab.
 */

import {
  getHost,
  clearApiCache,
  clearAgentCache,
  apiFetch,
} from "../core/runtime";
import { PRIMARY_BTN_STYLE, renderMarkdown, PageHeader } from "../core/shared";
import type {
  AgentSummary,
  SkillSpec,
  MCPClientInfo,
  ExpertData,
} from "../core/types";
import {
  type ExpertBundle,
  type ExpertTemplate,
  EXPERT_BUNDLES,
  EXPERT_TEMPLATES,
  getBundleAvatarUrl,
  BundleAvatar,
} from "./bundles";
import {
  extractPromptFromSkills,
  type PromptItem,
  type KnowledgeFileInfo,
  fetchKnowledgeFiles,
  writeKnowledgeFile,
  saveKnowledgeFile,
  normalizeKnowledgeFilename,
  updateAgentSystemPromptFiles,
  installSkillFromPool,
  enableSkillForAgent,
  deleteSkillForAgent,
  fetchAgentMCPClients,
  deleteMCPForAgent,
  createMCPForAgent,
  toggleMCPForAgent,
  fetchAgentLanguage,
  updateAgentLanguage,
  fetchUserTimezone,
  updateUserTimezone,
  fetchSystemPromptFiles,
  updateSystemPromptFiles,
  fetchHeartbeatConfig,
  updateHeartbeatConfig,
  runHeartbeatNow,
  fetchRunningConfig,
  updateRunningConfig,
} from "./expertApi";
import { DEFAULT_PROMPT_FILES, TagList, SkillPickerModal } from "./expertUtils";
import { ExpertConfigModal } from "./ExpertConfigModal";
import { ExpertCard, ExpertDrawer, ExpertTemplateModal } from "./ExpertCard";
import {
  TeamBuilderModal,
  ExpertTeamCard,
  ExpertTeamSection,
} from "./TeamBuilder";
import {
  fetchAgents,
  fetchAgentConfig,
  fetchAgentSkills,
  fetchPoolSkills,
} from "../core/api";
import {
  fetchPresetTeamsFromBackend,
  TeamWorkflowCard,
  type PresetTeam,
} from "../team/workflow";
import {
  findAgentIdByName,
  sendTeamMessage,
  type ExpertTeam,
} from "../team/model";
import { ExpertAvatar, TeamAvatar } from "../components/avatars";
import { KnowledgeBaseTab, PresetPromptsTab } from "./expertTabs";
import { CollaborationWorkflowSection } from "../workflow/CollaborationWorkflowSection";

function resolveTeamControllerId(
  team: ExpertTeam,
  agents: AgentSummary[],
): string | null {
  const coordinatorName = team.coordinatorName || team.members[0]?.name;
  const coordinator =
    team.members.find((member) => member.name === coordinatorName) ||
    team.members[0];

  if (
    coordinator?.bindingMode !== "temporary" &&
    coordinator?.agentId &&
    agents.some((agent) => agent.id === coordinator.agentId)
  ) {
    return coordinator.agentId;
  }

  if (coordinatorName && coordinator?.bindingMode !== "temporary") {
    const matched = findAgentIdByName(agents, coordinatorName);
    if (matched) return matched;
  }

  if (coordinator?.bindingMode === "fixed") return null;

  // OMP only needs a live controller process. A preferred or temporary
  // binding may therefore fall back to another available agent while the
  // team prompt retains the requested expert roles.
  return agents[0]?.id || null;
}

function sectionFromLocation(): "experts" | "teams" | "workflows" {
  const section = new URLSearchParams(window.location.search).get("section");
  return section === "teams" || section === "workflows" ? section : "experts";
}

// ─── Knowledge Base Tab ──────────────────────────────────────────────────────

export function ExpertCenterPage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo } = React;
  const routerNavigate = getHost().useNavigate?.();
  const navigateToExpert = useCallback(
    (path: string) => {
      if (routerNavigate) routerNavigate(path);
      else window.location.assign(path);
    },
    [routerNavigate],
  );
  const {
    Spin,
    Empty,
    Input,
    Button,
    message: antdMsg,
    Tabs,
    Modal,
    Typography,
  } = getHost().antd;
  const {
    ReloadOutlined,
    PlusOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeExpert, setActiveExpert] = useState<ExpertData | null>(null);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("全部专家");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(sectionFromLocation);
  const [teamLaunchModal, setTeamLaunchModal] = useState<ExpertTeam | null>(
    null,
  );
  const [teamLaunchInput, setTeamLaunchInput] = useState("");
  const [teamLaunching, setTeamLaunching] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configExpert, setConfigExpert] = useState<ExpertData | null>(null);

  // Cache the raw agent list for team matching
  const [rawAgents, setRawAgents] = useState<AgentSummary[]>([]);

  const loadExperts = useCallback(async () => {
    setLoading(true);
    try {
      const agents = await fetchAgents();

      // Fetch detailed data for each agent in parallel
      const expertDataList: ExpertData[] = await Promise.all(
        agents.map(async (agent): Promise<ExpertData> => {
          try {
            const [config, skills, agentMCPs, presentation] = await Promise.all(
              [
                fetchAgentConfig(agent.id).catch(() => null),
                fetchAgentSkills(agent.id).catch(() => [] as SkillSpec[]),
                fetchAgentMCPClients(agent.id).catch(
                  () => [] as MCPClientInfo[],
                ),
                fetchExpertPresentation(agent.id).catch(() => null),
              ],
            );

            return {
              agent,
              config,
              skills,
              mcps: agentMCPs,
              presentation,
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
      setRawAgents(agents);
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

  useEffect(() => {
    const restoreSection = () => setActiveTab(sectionFromLocation());
    window.addEventListener("popstate", restoreSection);
    return () => window.removeEventListener("popstate", restoreSection);
  }, []);

  // Sync configExpert with the refreshed experts list so tab labels
  // (skill count, MCP count) stay in sync after edits inside the modal.
  useEffect(() => {
    if (configExpert && configModalOpen) {
      const updated = experts.find((e) => e.agent.id === configExpert.agent.id);
      if (updated && updated !== configExpert) {
        setConfigExpert(updated);
      }
    }
  }, [experts, configExpert, configModalOpen]);

  const handleLaunchTeam = useCallback(
    async (team: ExpertTeam) => {
      // In OMP architecture, any agent can be the workflow controller.
      // Try to find the preferred coordinator by name first, but
      // fall back to the first available agent if not found.
      const coordinatorName = team.coordinatorName || team.members[0]?.name;
      const coordinatorId = resolveTeamControllerId(team, rawAgents);

      if (!coordinatorId) {
        const requested = team.members.find(
          (member) => member.name === coordinatorName,
        );
        antdMsg.error(
          requested?.bindingMode === "fixed"
            ? `固定协调者「${
                coordinatorName || "协调者"
              }」当前不可用，请修复绑定后再运行`
            : "没有可用的 Agent 作为工作流控制器",
        );
        return;
      }

      // Check if task template has placeholders
      const hasPlaceholders = /\{.+?\}/.test(team.taskTemplate);
      if (hasPlaceholders) {
        // Open modal pre-filled with the template so the user can
        // directly edit placeholders {参数名} inline.
        setTeamLaunchInput(team.taskTemplate);
        setTeamLaunchModal(team);
        return;
      }
      // No placeholders — launch directly
      await doLaunchTeam(team, coordinatorId, team.taskTemplate);
    },
    [rawAgents, antdMsg],
  );

  const doLaunchTeam = useCallback(
    async (team: ExpertTeam, coordinatorId: string, taskText: string) => {
      setTeamLaunching(true);
      try {
        // Build the task text (either user-filled or template)
        const task = taskText || team.taskTemplate;

        // Custom teams are already persisted by the builder. Launching only
        // references the stable ID, so a run cannot overwrite a definition
        // that another browser/device edited after this page was loaded.
        const teamRef = team.custom ? `@${team.id}` : team.name;

        // Construct the /ugsci-team slash command
        // Format: /ugsci-team <mode> <team_ref> <task...>
        const command = `/ugsci-team ${team.mode} ${teamRef} ${task}`;

        // Set coordinator as selected agent (becomes the workflow controller)
        const host = getHost();
        if (host.setSelectedAgent) {
          host.setSelectedAgent(coordinatorId);
        }

        // Send the slash command via console chat API
        // The mode handler will activate the gate and rewrite the message
        const chatId = await sendTeamMessage(coordinatorId, command, team.name);

        antdMsg.success(`OMP 工作流已启动：${team.name}（${team.mode}模式）`);
        setTeamLaunchModal(null);

        // Navigate to chat page with the specific chat ID so the user
        // lands on the session where the workflow was started.
        // BUG-008: previously navigated to /chat (no ID), which loaded
        // a stale session instead of the one just created.
        navigateToExpert(`/chat/${chatId}`);
      } catch (err: any) {
        antdMsg.error(err.message || "发起团队任务失败");
      } finally {
        setTeamLaunching(false);
      }
    },
    [antdMsg, navigateToExpert],
  );

  const handleCardClick = useCallback((expert: ExpertData) => {
    setActiveExpert(expert);
    setDrawerOpen(true);
  }, []);

  const handleConfigureExpert = useCallback((expert: ExpertData) => {
    setConfigExpert(expert);
    setConfigModalOpen(true);
  }, []);

  const handleSummonExpert = useCallback(
    (expert: ExpertData) => {
      if (!expert.agent.enabled) {
        antdMsg.warning(`专家「${expert.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        if (expert.agent.managed_by_app) {
          navigateToExpert(
            `/apps/${encodeURIComponent(expert.agent.managed_by_app)}`,
          );
          return;
        }
        if (expert.agent.available_in_chat === false) {
          throw new Error("此专家不支持通用聊天，请从所属应用打开");
        }
        const host = getHost();
        if (!host.setSelectedAgent)
          throw new Error("当前版本不支持切换专家，请更新软件后重试");
        host.setSelectedAgent(expert.agent.id);
        // Follow the host's New Chat contract rather than restoring an old session.
        sessionStorage.setItem("qwenpaw_pending_new_chat", "1");
        navigateToExpert("/chat");
        antdMsg.success(`已召唤专家「${expert.agent.name}」`);
      } catch (err) {
        sessionStorage.removeItem("qwenpaw_pending_new_chat");
        console.warn("[ugsci] Failed to set selected agent:", err);
        antdMsg.error(
          err instanceof Error ? err.message : "召唤专家失败，请重试",
        );
      }
    },
    [antdMsg, navigateToExpert],
  );

  const filteredExperts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return experts.filter((e) => {
      const display = expertPresentation(e);
      return (
        (category === "全部专家" || display.category === category) &&
        `${display.name} ${display.specialty} ${display.summary} ${
          e.agent.name
        } ${e.agent.id} ${e.agent.description || ""} ${e.skills
          .map((s) => s.name)
          .join(" ")}`
          .toLowerCase()
          .includes(q)
      );
    });
  }, [experts, searchText, category]);

  const enabledCount = experts.filter((e) => e.agent.enabled).length;
  const totalSkills = experts.reduce(
    (sum, e) => sum + e.skills.filter((s) => s.enabled !== false).length,
    0,
  );
  const totalMCPs = experts.reduce((sum, e) => sum + e.mcps.length, 0);

  const tabItems = [
    {
      key: "experts",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        UserOutlined
          ? React.createElement(UserOutlined, { style: { fontSize: 14 } })
          : null,
        "专家",
      ),
      children: React.createElement(
        "div",
        { className: "ugsci-expert-library" },
        React.createElement("style", null, EXPERT_STYLES),
        // Search bar
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16,
            },
          },
          React.createElement(Input, {
            placeholder: "搜索名称、职责或技能",
            "aria-label": "搜索专家",
            prefix: SearchOutlined
              ? React.createElement(SearchOutlined)
              : undefined,
            value: searchText,
            onChange: (e: any) => setSearchText(e.target.value),
            allowClear: true,
            style: { flex: "1 1 280px", maxWidth: 400 },
          }),
          React.createElement(
            Button,
            {
              type: "primary",
              icon: PlusOutlined
                ? React.createElement(PlusOutlined)
                : undefined,
              onClick: () => setTemplateModalOpen(true),
              style: PRIMARY_BTN_STYLE,
            },
            "创建专家",
          ),
        ),
        React.createElement(
          "nav",
          { className: "ugsci-expert-filters", "aria-label": "专家分类" },
          ...EXPERT_CATEGORIES.map((value) =>
            React.createElement(
              "button",
              {
                key: value,
                type: "button",
                className: "ugsci-expert-filter",
                "aria-pressed": category === value,
                onClick: () => setCategory(value),
              },
              value,
              React.createElement(
                "small",
                null,
                value === "全部专家"
                  ? experts.length
                  : experts.filter(
                      (e) => expertPresentation(e).category === value,
                    ).length,
              ),
            ),
          ),
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
              description:
                searchText || category !== "全部专家"
                  ? "未找到匹配的专家"
                  : "暂无专家，点击「创建专家」添加",
            })
          : React.createElement(
              "div",
              {
                className: "ugsci-expert-grid",
                "aria-live": "polite",
              },
              ...filteredExperts.map((expert) =>
                React.createElement(
                  "div",
                  {
                    key: expert.agent.id,
                    style: { display: "flex", minWidth: 0 },
                  },
                  React.createElement(ExpertCard, {
                    expert,
                    onClick: () => handleCardClick(expert),
                    onSummon: () => handleSummonExpert(expert),
                    onConfigure: () => handleConfigureExpert(expert),
                  }),
                ),
              ),
            ),
      ),
    },
    {
      key: "teams",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        TeamOutlined
          ? React.createElement(TeamOutlined, { style: { fontSize: 14 } })
          : null,
        "专家团",
      ),
      children: React.createElement(ExpertTeamSection, {
        agents: rawAgents,
        onLaunch: handleLaunchTeam,
      }),
    },
    {
      key: "workflows",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        getHost().antdIcons?.ApartmentOutlined
          ? React.createElement(getHost().antdIcons.ApartmentOutlined, {
              style: { fontSize: 14 },
            })
          : null,
        "协作工作流",
      ),
      children: React.createElement(CollaborationWorkflowSection),
    },
  ];

  return React.createElement(
    "div",
    {
      className: activeTab === "experts" ? "ugsci-expert-page" : undefined,
      style: { padding: 24 },
    },
    React.createElement(PageHeader, {
      title: "专家·协作",
      subtitle:
        activeTab === "experts"
          ? `共 ${experts.length} 位专家（${enabledCount} 位启用）· ${totalSkills} 个技能 · ${totalMCPs} 个 MCP 客户端`
          : activeTab === "teams"
          ? "开放式多专家讨论、联合研判与 OMP 动态协作"
          : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: React.createElement(
        React.Fragment,
        null,
        activeTab === "experts"
          ? React.createElement(
              Button,
              {
                icon: ReloadOutlined
                  ? React.createElement(ReloadOutlined)
                  : undefined,
                onClick: () => {
                  clearApiCache();
                  loadExperts();
                },
                loading,
              },
              "刷新",
            )
          : null,
      ),
    }),
    React.createElement(Tabs, {
      items: tabItems,
      activeKey: activeTab,
      onChange: (key: string) => {
        setActiveTab(key as "experts" | "teams" | "workflows");
        const url = new URL(window.location.href);
        if (key === "experts") url.searchParams.delete("section");
        else url.searchParams.set("section", key);
        window.history.pushState({}, "", `${url.pathname}${url.search}`);
      },
    }),
    // Drawer
    React.createElement(ExpertDrawer, {
      onSummon: handleSummonExpert,
      expert: activeExpert,
      open: drawerOpen,
      onClose: () => setDrawerOpen(false),
      onRefresh: () => loadExperts(),
    }),
    // Template Modal
    React.createElement(ExpertTemplateModal, {
      open: templateModalOpen,
      onClose: () => setTemplateModalOpen(false),
      onCreated: () => loadExperts(),
    }),
    // Config Modal (gear icon)
    React.createElement(ExpertConfigModal, {
      expert: configExpert,
      open: configModalOpen,
      onClose: () => setConfigModalOpen(false),
      onRefresh: () => loadExperts(),
    }),
    // Team Launch Modal (for filling placeholders)
    teamLaunchModal
      ? React.createElement(
          Modal,
          {
            open: true,
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement(TeamAvatar, {
                members: teamLaunchModal.members.map((m) => m.name),
                size: 28,
              }),
              React.createElement(
                "span",
                null,
                `发起团队任务 - ${teamLaunchModal.name}`,
              ),
            ),
            onCancel: () => setTeamLaunchModal(null),
            onOk: () => {
              const coordinatorId = resolveTeamControllerId(
                teamLaunchModal,
                rawAgents,
              );
              if (!coordinatorId) {
                antdMsg.error("固定协调者不可用或没有可用的控制器 Agent");
                return;
              }
              // The textarea is pre-filled with the task template.
              // The user edits it directly (replacing {占位符} as needed),
              // so the edited text IS the final task — no separate override.
              const taskText =
                teamLaunchInput.trim() || teamLaunchModal.taskTemplate;
              doLaunchTeam(teamLaunchModal, coordinatorId, taskText);
            },
            confirmLoading: teamLaunching,
            okText: "发起任务",
            width: 600,
          },
          React.createElement(
            "div",
            null,
            React.createElement(
              Text,
              {
                type: "secondary",
                style: { fontSize: 12, display: "block", marginBottom: 8 },
              },
              "任务内容（请替换 {参数名} 等占位符后发起）：",
            ),
            React.createElement(Input.TextArea, {
              value: teamLaunchInput,
              onChange: (e: any) => setTeamLaunchInput(e.target.value),
              rows: 8,
              style: { fontSize: 13, fontFamily: "monospace" },
            }),
          ),
          React.createElement(
            "div",
            {
              style: {
                marginTop: 12,
                padding: "8px 12px",
                background: "var(--app-info-bg)",
                borderRadius: 6,
              },
            },
            React.createElement(
              Text,
              { style: { fontSize: 12, color: "var(--app-action-link)" } },
              `协调者: ${
                teamLaunchModal.coordinatorName ||
                teamLaunchModal.members[0]?.name ||
                "—"
              } · 成员: ${teamLaunchModal.members
                .map((m) => m.name)
                .join("、")}`,
            ),
          ),
        )
      : null,
  );
}
