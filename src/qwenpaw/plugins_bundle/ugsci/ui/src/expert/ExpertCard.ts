/**
 * Expert card, drawer, template modal, and blank expert creation modal.
 */

import { getHost, clearApiCache, clearAgentCache, apiFetch } from "../core/runtime";
import { PRIMARY_BTN_STYLE, renderMarkdown, PageHeader } from "../core/shared";
import type { AgentSummary, SkillSpec, PoolSkillSpec, MCPClientInfo, ExpertData } from "../core/types";
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
  batchEnableSkillsForAgent,
  batchDisableSkillsForAgent,
  batchDeleteSkillsForAgent,
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
import { KnowledgeBaseTab, PresetPromptsTab } from "./expertTabs";
import { ExpertAvatar } from "../components/avatars";
import { fetchPoolSkills, fetchAgentConfig } from "../core/api";

/** Refresh the host agent store before selecting an agent just created here. */
async function selectCreatedAgent(agentId: string): Promise<void> {
  const host = getHost();
  if (host.refreshAgents) {
    try {
      await host.refreshAgents({ force: true });
    } catch (err) {
      // The agent was already created successfully. Leave selection to the
      // next normal refresh rather than selecting against a stale host list.
      console.warn("[ugsci] Failed to refresh newly created agent:", err);
      return;
    }
  }
  host.setSelectedAgent?.(agentId);
}

// ─── Expert Center Page ───────────────────────────────────────────────────────

export function ExpertCard({
  expert,
  onClick,
  onSummon,
  onConfigure,
}: {
  expert: ExpertData;
  onClick: () => void;
  onSummon?: () => void;
  onConfigure?: () => void;
}) {
  const React = getHost().React;
  const { Card, Tag, Badge, Typography, Spin, Button, Tooltip } = getHost().antd;
  const { Text } = Typography;
  const { ThunderboltOutlined, SettingOutlined } = getHost().antdIcons || {};

  const { agent, skills, mcps, loading } = expert;
  const isEnabled = agent.enabled;
  const skillNames = skills
    .filter((s) => s.enabled !== false)
    .map((s) => s.name);
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
        borderColor: isEnabled ? undefined : "var(--ant-color-border, #d9d9d9)",
        opacity: isEnabled ? 1 : 0.7,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      },
      styles: {
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flex: 1,
        },
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
        React.createElement(ExpertAvatar, { name: agent.name, size: 36 }),
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
                color: "var(--ant-color-text-quaternary, #bfbfbf)",
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
              minHeight: 54,
              flex: "1 0 auto",
            },
          },
          renderMarkdown(agent.description, React),
        )
      : React.createElement(
          "div",
          { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
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
            { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
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
          { style: { marginTop: "auto" } },
          React.createElement(
            "div",
            { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
            `MCP (${mcpNames.length})`,
          ),
          React.createElement(TagList, {
            items: mcpNames,
            max: 3,
            color: "purple",
          }),
        )
      : null,
    // Bottom bar: gear icon (left) + summon button (right)
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid #f0f0f0",
        },
      },
      // Gear icon (bottom-left) — opens configuration modal
      React.createElement(
        Tooltip,
        { title: "配置专家", placement: "top" },
        React.createElement(
          Button,
          {
            type: "text",
            size: "small",
            icon: SettingOutlined
              ? React.createElement(SettingOutlined, {
                  style: { fontSize: 16, color: "var(--ant-color-text-tertiary, #8c8c8c)" },
                })
              : undefined,
            onClick: (e: any) => {
              e.stopPropagation();
              if (onConfigure) onConfigure();
            },
          },
        ),
      ),
      // Summon button (bottom-right)
      React.createElement(
        Button,
        {
          type: "primary",
          size: "small",
          icon: ThunderboltOutlined
            ? React.createElement(ThunderboltOutlined)
            : undefined,
          disabled: !isEnabled,
          onClick: (e: any) => {
            e.stopPropagation();
            if (onSummon) onSummon();
          },
          style: PRIMARY_BTN_STYLE,
        },
        "召唤专家",
      ),
    ),
  );
}

export function ExpertDrawer({
  expert,
  open,
  onClose,
  onRefresh,
}: {
  expert: ExpertData | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
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
    Modal,
    message: antdMsg,
  } = getHost().antd;
  const { Text, Paragraph } = Typography;
  const {
    EditOutlined,
    ThunderboltOutlined,
    FileTextOutlined,
    ToolOutlined,
    PlusOutlined,
  } = getHost().antdIcons || {};

  const [skillPickerOpen2, setSkillPickerOpen2] = React.useState(false);
  const [poolSkillsList2, setPoolSkillsList2] = React.useState<PoolSkillSpec[]>(
    [],
  );
  const [poolLoading2, setPoolLoading2] = React.useState(false);

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

  const handleOpenSkillPicker = async () => {
    setSkillPickerOpen2(true);
    setPoolLoading2(true);
    try {
      const pool = await fetchPoolSkills(true);
      setPoolSkillsList2(pool);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能池失败");
    } finally {
      setPoolLoading2(false);
    }
  };

  const handleBatchInstallSkills = async (skillNames: string[]) => {
    let successCount = 0;
    let failCount = 0;
    for (const skillName of skillNames) {
      try {
        await installSkillFromPool(agent.id, skillName);
        successCount++;
      } catch {
        failCount++;
      }
    }
    if (successCount > 0) {
      antdMsg.success(
        `成功添加 ${successCount} 个技能${failCount > 0 ? `，${failCount} 个失败` : ""}`,
      );
      onRefresh();
    } else if (failCount > 0) {
      antdMsg.error("添加技能失败");
    }
    setSkillPickerOpen2(false);
  };

  const handleRemoveSkill = async (skillName: string) => {
    try {
      await deleteSkillForAgent(agent.id, skillName);
      antdMsg.success(`技能「${skillName}」已移除`);
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "移除技能失败");
    }
  };

  const handleRemoveMCP = async (clientKey: string) => {
    try {
      await deleteMCPForAgent(agent.id, clientKey);
      antdMsg.success(`MCP「${clientKey}」已移除`);
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "移除 MCP 失败");
    }
  };

  const skillsTab = loading
    ? React.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        React.createElement(Spin, { size: "large" }),
      )
    : React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            },
          },
          React.createElement(
            Text,
            { strong: true },
            `已启用技能 (${enabledSkills.length})`,
          ),
          React.createElement(
            Button,
            {
              type: "primary",
              size: "small",
              icon: PlusOutlined
                ? React.createElement(PlusOutlined)
                : undefined,
              onClick: handleOpenSkillPicker,
            },
            "从技能池添加",
          ),
        ),
        enabledSkills.length === 0
          ? React.createElement(Empty, {
              description: "该专家暂无已启用的技能",
              image: Empty.PRESENTED_IMAGE_SIMPLE,
            })
          : React.createElement(List, {
              dataSource: enabledSkills,
              renderItem: (skill: SkillSpec) =>
                React.createElement(
                  List.Item,
                  {
                    actions: [
                      React.createElement(
                        Button,
                        {
                          type: "link",
                          size: "small",
                          danger: true,
                          onClick: () => handleRemoveSkill(skill.name),
                        },
                        "移除",
                      ),
                    ],
                  },
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
                              {
                                key: i,
                                color: "cyan",
                                style: { fontSize: 10 },
                              },
                              tag,
                            ),
                          ),
                        )
                      : null,
                  ),
                ),
            }),
        // Skill Picker Modal (card-grid style, consistent with Skill Center)
        React.createElement(SkillPickerModal, {
          open: skillPickerOpen2,
          onClose: () => setSkillPickerOpen2(false),
          poolSkills: poolSkillsList2,
          installedSkillNames: enabledSkills.map((s: SkillSpec) => s.name),
          loading: poolLoading2,
          onInstall: handleBatchInstallSkills,
        }),
      );

  const mcpTab = loading
    ? React.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        React.createElement(Spin, { size: "large" }),
      )
    : React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            },
          },
          React.createElement(
            Text,
            { strong: true },
            `MCP 客户端 (${mcps.length})`,
          ),
          React.createElement(
            Button,
            {
              type: "primary",
              size: "small",
              icon: PlusOutlined
                ? React.createElement(PlusOutlined)
                : undefined,
              onClick: () => {
                window.history.pushState({}, "", `/agents/${agent.id}/mcp`);
                window.dispatchEvent(new PopStateEvent("popstate"));
              },
            },
            "配置 MCP",
          ),
        ),
        mcps.length === 0
          ? React.createElement(Empty, {
              description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
              image: Empty.PRESENTED_IMAGE_SIMPLE,
            })
          : React.createElement(List, {
              dataSource: mcps,
              renderItem: (mcp: MCPClientInfo) =>
                React.createElement(
                  List.Item,
                  {
                    actions: [
                      React.createElement(
                        Button,
                        {
                          type: "link",
                          size: "small",
                          danger: true,
                          onClick: () => handleRemoveMCP(mcp.key),
                        },
                        "移除",
                      ),
                    ],
                  },
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
                              color: "var(--ant-color-text-tertiary, #8c8c8c)",
                            },
                          },
                          `提供 ${mcp.tools.length} 个工具`,
                        )
                      : null,
                  ),
                ),
            }),
      );

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
                background: "var(--ant-color-fill-quaternary, #fafafa)",
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
    {
      key: "skills",
      label: `技能 (${enabledSkills.length})`,
      children: skillsTab,
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: React.createElement(PresetPromptsTab, {
        skills: enabledSkills,
        agentId: agent.id,
      }),
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: React.createElement(KnowledgeBaseTab, {
        agentId: agent.id,
        systemPromptFiles: config?.system_prompt_files || [],
        onRefresh: () => onRefresh(),
      }),
    },
    { key: "mcp", label: `MCP (${mcps.length})`, children: mcpTab },
    { key: "tools", label: "工具配置", children: toolsTab },
  ];

  return React.createElement(
    Drawer,
    {
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement(ExpertAvatar, { name: agent.name, size: 28 }),
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
            icon: EditOutlined ? React.createElement(EditOutlined) : undefined,
            onClick: () => {
              // Close the drawer first to avoid React unmount conflicts
              onClose();
              // Set the selected agent so /agents page knows which to edit
              try {
                const host = getHost();
                if (host.setSelectedAgent) {
                  host.setSelectedAgent(agent.id);
                }
              } catch (err) {
                console.warn("[ugsci] Failed to set selected agent:", err);
              }
              // Defer navigation to allow React to process state updates
              setTimeout(() => navigateTo("/agents"), 0);
            },
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
              // Close the drawer first to avoid React unmount conflicts
              onClose();
              // Set this agent as selected via the host store API
              try {
                const host = getHost();
                if (host.setSelectedAgent) {
                  host.setSelectedAgent(agent.id);
                }
              } catch (err) {
                console.warn("[ugsci] Failed to set selected agent:", err);
              }
              // Defer navigation to allow React to process state updates
              setTimeout(() => navigateTo("/chat"), 0);
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

// ─── Expert Template Modal ───────────────────────────────────────────────────

export function ExpertTemplateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const React = getHost().React;
  const { useState } = React;
  const {
    Modal,
    Card,
    Tag,
    Input,
    Row,
    Col,
    Spin,
    message: antdMsg,
    Typography,
  } = getHost().antd;
  const { Text } = Typography;
  const { FileAddOutlined } = getHost().antdIcons || {};
  const [creating, setCreating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [blankModalOpen, setBlankModalOpen] = useState(false);

  const handleCreateBlank = async (values: BlankExpertCreateValues) => {
    setCreating(true);
    try {
      const agentRef = await apiFetch<{ id: string }>("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: values.id || undefined,
          name: values.name,
          description: values.description,
          skill_names: values.skillNames,
        }),
      });

      const systemPrompt = values.systemPrompt.trim() ||
        `# ${values.name}\n\n你是${values.name}。${
          values.description ? `\n\n职责：${values.description}` : ""
        }\n`;
      const setupResults = await Promise.allSettled([
        writeKnowledgeFile(agentRef.id, "AGENTS.md", systemPrompt),
        ...values.mcpClients.map(({ clientKey, client }) =>
          createMCPForAgent(agentRef.id, {
            client_key: clientKey,
            client,
          }),
        ),
      ]);
      const failedSetups = setupResults.filter(
        (result) => result.status === "rejected",
      ).length;

      if (failedSetups > 0) {
        antdMsg.warning(
          `专家「${values.name}」已创建，${failedSetups} 项初始配置失败，可在专家配置中重试`,
        );
      } else {
        antdMsg.success(`专家「${values.name}」创建成功`);
      }
      await selectCreatedAgent(agentRef.id);
      setBlankModalOpen(false);
      // Defer closing the outer modal to avoid simultaneous closing race condition
      // when BlankExpertModal and ExpertTemplateModal try to close at the same time
      setTimeout(() => {
        onClose();
        onCreated();
      }, 0);
    } catch (err: any) {
      antdMsg.error(err.message || "创建专家失败");
    } finally {
      setCreating(false);
    }
  };

  const filteredTemplates = EXPERT_TEMPLATES.filter((t) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  const handleSelectTemplate = async (template: ExpertTemplate) => {
    setCreating(true);
    try {
      // 1. Create agent via POST /api/agents
      const agentRef = await apiFetch<{ id: string }>("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          skill_names: template.recommended_skills,
        }),
      });

      // 2. Write AGENTS.md with template system prompt
      await writeKnowledgeFile(agentRef.id, "AGENTS.md", template.system_prompt);

      // 3. Update agent config with approval level
      const config = await fetchAgentConfig(agentRef.id);
      config.approval_level = template.approval_level;
      await apiFetch(`/agents/${encodeURIComponent(agentRef.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      await selectCreatedAgent(agentRef.id);
      antdMsg.success(`专家「${template.name}」创建成功`);
      onClose();
      onCreated();
    } catch (err: any) {
      antdMsg.error(err.message || "创建专家失败");
    } finally {
      setCreating(false);
    }
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
    Modal,
    {
      open,
      onCancel: onClose,
      footer: null,
      title: "选择专家模板",
      width: 800,
      maskClosable: true,
      keyboard: true,
    },
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(Input, {
        placeholder: "搜索模板名称或类别...",
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
      }),
    ),
    creating
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
          React.createElement(
            "div",
            { style: { marginTop: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            "正在创建专家...",
          ),
        )
      : React.createElement(
          Row,
          { gutter: [12, 12] },
          // ── Blank template card (always first) ──
          !searchText.trim()
            ? React.createElement(
                Col,
                { xs: 24, sm: 12 },
                React.createElement(
                  Card,
                  {
                    hoverable: true,
                    size: "small",
                    onClick: () => setBlankModalOpen(true),
                    style: {
                      cursor: "pointer",
                      height: "100%",
                      border: "2px dashed var(--ant-color-border, #d9d9d9)",
                      background: "var(--ant-color-fill-quaternary, #fafafa)",
                    },
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
                    React.createElement(
                      "span",
                      { style: { fontSize: 28, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
                      FileAddOutlined
                        ? React.createElement(FileAddOutlined)
                        : "📝",
                    ),
                    React.createElement(
                      "div",
                      { style: { flex: 1 } },
                      React.createElement(
                        Text,
                        { strong: true, style: { fontSize: 15 } },
                        "从空白模版开始创建",
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          Tag,
                          { color: "default", style: { fontSize: 10 } },
                          "空白",
                        ),
                      ),
                    ),
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        color: "#595959",
                        lineHeight: 1.5,
                      },
                    },
                    "创建一个全新的专家，不使用任何预设模板。创建后可自行配置系统提示词、技能和 MCP 客户端。",
                  ),
                ),
              )
            : null,
          ...filteredTemplates.map((template) =>
            React.createElement(
              Col,
              { key: template.id, xs: 24, sm: 12 },
              React.createElement(
                Card,
                {
                  hoverable: true,
                  size: "small",
                  onClick: () => handleSelectTemplate(template),
                  style: { cursor: "pointer", height: "100%" },
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
                    name: template.name,
                    size: 40,
                  }),
                  React.createElement(
                    "div",
                    { style: { flex: 1 } },
                    React.createElement(
                      Text,
                      { strong: true, style: { fontSize: 15 } },
                      template.name,
                    ),
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        Tag,
                        { color: "blue", style: { fontSize: 10 } },
                        template.category,
                      ),
                      template.approval_level === "MANUAL"
                        ? React.createElement(
                            Tag,
                            { color: "orange", style: { fontSize: 10 } },
                            "需审批",
                          )
                        : null,
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      color: "#595959",
                      lineHeight: 1.5,
                    },
                  },
                  renderMarkdown(template.description, React),
                ),
              ),
            ),
          ),
        ),
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    React.createElement(BlankExpertModal, {
      open: blankModalOpen,
      onCancel: () => setBlankModalOpen(false),
      onCreate: handleCreateBlank,
    }),
  );
}

// ─── Blank Expert Creation Modal ─────────────────────────────────────────────

export interface InitialMCPClient {
  clientKey: string;
  client: Record<string, unknown>;
}

export interface BlankExpertCreateValues {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  skillNames: string[];
  mcpClients: InitialMCPClient[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseInitialMCPConfig(value: string): InitialMCPClient[] {
  const text = value.trim();
  if (!text) return [];

  const parsed = JSON.parse(text) as unknown;
  if (!isRecord(parsed)) {
    throw new Error("MCP 配置必须是 JSON 对象");
  }

  const servers = parsed.mcpServers ?? parsed;
  if (!isRecord(servers)) {
    throw new Error("mcpServers 必须是 JSON 对象");
  }

  return Object.entries(servers).map(([rawKey, rawConfig]) => {
    const clientKey = rawKey.trim();
    if (!clientKey || !isRecord(rawConfig)) {
      throw new Error(`MCP「${rawKey || "未命名"}」配置无效`);
    }

    const url = typeof rawConfig.url === "string" ? rawConfig.url : "";
    const command =
      typeof rawConfig.command === "string" ? rawConfig.command : "";
    if (!url && !command) {
      throw new Error(`MCP「${clientKey}」需要配置 url 或 command`);
    }

    const declaredTransport =
      typeof rawConfig.transport === "string"
        ? rawConfig.transport
        : typeof rawConfig.type === "string"
          ? rawConfig.type
          : "";
    const transport = declaredTransport === "sse"
      ? "sse"
      : url
        ? "streamable_http"
        : "stdio";

    return {
      clientKey,
      client: {
        name:
          typeof rawConfig.name === "string" ? rawConfig.name : clientKey,
        description:
          typeof rawConfig.description === "string"
            ? rawConfig.description
            : "",
        enabled:
          typeof rawConfig.enabled === "boolean" ? rawConfig.enabled : true,
        transport,
        url,
        command,
        args: Array.isArray(rawConfig.args) ? rawConfig.args : [],
        env: isRecord(rawConfig.env) ? rawConfig.env : {},
        cwd: typeof rawConfig.cwd === "string" ? rawConfig.cwd : "",
        headers: isRecord(rawConfig.headers) ? rawConfig.headers : {},
      },
    };
  });
}

export function BlankExpertModal({
  open,
  onCancel,
  onCreate,
}: {
  open: boolean;
  onCancel: () => void;
  onCreate: (values: BlankExpertCreateValues) => Promise<void> | void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useMemo } = React;
  const {
    Modal,
    Input,
    Select,
    Button,
    Row,
    Col,
    Spin,
    Tag,
    Typography,
    message: antdMsg,
  } = getHost().antd;
  const { CheckCircleOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [poolSkills, setPoolSkills] = useState<PoolSkillSpec[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [mcpJson, setMcpJson] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form fields whenever the modal is opened
  useEffect(() => {
    if (open) {
      setName("");
      setAgentId("");
      setDescription("");
      setSystemPrompt("");
      setSelectedSkills([]);
      setMcpJson("");
      setLoading(false);
      setSkillsLoading(true);
      fetchPoolSkills(true)
        .then(setPoolSkills)
        .catch((err: any) => {
          setPoolSkills([]);
          antdMsg.error(err.message || "加载技能池失败");
        })
        .finally(() => setSkillsLoading(false));
    }
  }, [open]);

  const trimmedAgentId = agentId.trim();
  const agentIdError = useMemo(() => {
    if (!trimmedAgentId) return "";
    if (trimmedAgentId.length < 2 || trimmedAgentId.length > 64) {
      return "ID 长度需为 2-64 个字符";
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(trimmedAgentId)) {
      return "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾";
    }
    if (trimmedAgentId === "default") return "default 是系统保留 ID";
    return "";
  }, [trimmedAgentId]);

  const mcpPreview = useMemo(() => {
    try {
      return { clients: parseInitialMCPConfig(mcpJson), error: "" };
    } catch (err: any) {
      return { clients: [] as InitialMCPClient[], error: err.message || "MCP 配置无效" };
    }
  }, [mcpJson]);

  const handleCreate = () => {
    const expertName = name.trim();
    if (!expertName) {
      antdMsg.warning("请输入专家名称");
      return;
    }
    if (agentIdError) {
      antdMsg.warning(agentIdError);
      return;
    }
    if (mcpPreview.error) {
      antdMsg.warning(mcpPreview.error);
      return;
    }

    setLoading(true);
    Promise.resolve(
      onCreate({
        id: trimmedAgentId,
        name: expertName,
        description: description.trim(),
        systemPrompt,
        skillNames: selectedSkills,
        mcpClients: mcpPreview.clients,
      }),
    ).finally(() => setLoading(false));
  };

  const selectBuiltinSkills = () => {
    setSelectedSkills(
      poolSkills
        .filter((skill) => skill.source === "builtin")
        .map((skill) => skill.name),
    );
  };

  const sectionTitle = (title: string, detail?: string) =>
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        },
      },
      React.createElement(Text, { strong: true, style: { fontSize: 15 } }, title),
      detail
        ? React.createElement(Text, { type: "secondary", style: { fontSize: 12 } }, detail)
        : null,
    );

  return React.createElement(
    Modal,
    {
      open,
      title: "创建专家",
      onCancel,
      onOk: handleCreate,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: loading },
      maskClosable: true,
      keyboard: true,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } },
    },
    React.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      sectionTitle("基本信息", "ID 留空时自动生成"),
      React.createElement(
        Row,
        { gutter: [16, 12] },
        React.createElement(
          Col,
          { xs: 24, md: 12 },
          React.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            React.createElement("span", { style: { color: "#ff4d4f", marginLeft: 4 } }, "*"),
          ),
          React.createElement(Input, {
            placeholder: "例如：合同审查专家",
            value: name,
            onChange: (e: any) => setName(e.target.value),
            maxLength: 50,
          }),
        ),
        React.createElement(
          Col,
          { xs: 24, md: 12 },
          React.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）",
          ),
          React.createElement(Input, {
            placeholder: "例如：contract-reviewer",
            value: agentId,
            onChange: (e: any) => setAgentId(e.target.value),
            maxLength: 64,
            status: agentIdError ? "error" : undefined,
          }),
          agentIdError
            ? React.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, agentIdError)
            : null,
        ),
        React.createElement(
          Col,
          { span: 24 },
          React.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）",
          ),
          React.createElement(Input.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: description,
            onChange: (e: any) => setDescription(e.target.value),
            rows: 2,
            maxLength: 200,
            showCount: true,
          }),
        ),
      ),
    ),
    React.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", padding: "20px 0" } },
      sectionTitle("角色指令", "保存为 AGENTS.md"),
      React.createElement(Input.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: systemPrompt,
        onChange: (e: any) => setSystemPrompt(e.target.value),
        rows: 6,
        style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 },
      }),
    ),
    React.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      sectionTitle("初始能力"),
      React.createElement(
        Row,
        { gutter: [20, 16], align: "top" },
        React.createElement(
          Col,
          { xs: 24, md: 12 },
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            React.createElement(Text, { strong: true }, "初始技能"),
            React.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              React.createElement(Button, { size: "small", onClick: selectBuiltinSkills, disabled: skillsLoading }, "内置"),
              React.createElement(Button, { size: "small", onClick: () => setSelectedSkills([]), disabled: selectedSkills.length === 0 }, "清空"),
            ),
          ),
          skillsLoading
            ? React.createElement("div", { style: { textAlign: "center", padding: 32 } }, React.createElement(Spin, { size: "small" }))
            : React.createElement(Select, {
                mode: "multiple",
                value: selectedSkills,
                onChange: setSelectedSkills,
                placeholder: "搜索并选择技能",
                showSearch: true,
                allowClear: true,
                optionFilterProp: "label",
                maxTagCount: "responsive",
                style: { width: "100%" },
                options: poolSkills.map((skill) => ({
                  value: skill.name,
                  label: skill.name,
                })),
                notFoundContent: "暂无可用技能",
              }),
          React.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            selectedSkills.length > 0
              ? React.createElement(Tag, { color: "blue" }, `已选择 ${selectedSkills.length} 个技能`)
              : React.createElement(Text, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能"),
          ),
        ),
        React.createElement(
          Col,
          { xs: 24, md: 12 },
          React.createElement(Text, { strong: true, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
          React.createElement(Input.TextArea, {
            placeholder: '{\n  "mcpServers": {\n    "filesystem": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-filesystem"]\n    }\n  }\n}',
            value: mcpJson,
            onChange: (e: any) => setMcpJson(e.target.value),
            rows: 8,
            status: mcpPreview.error ? "error" : undefined,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 },
          }),
          React.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            mcpPreview.error
              ? React.createElement(Text, { type: "danger", style: { fontSize: 12 } }, mcpPreview.error)
              : mcpPreview.clients.length > 0
                ? React.createElement(
                    Tag,
                    {
                      color: "green",
                      icon: CheckCircleOutlined ? React.createElement(CheckCircleOutlined) : undefined,
                    },
                    `已识别 ${mcpPreview.clients.length} 个 MCP`,
                  )
                : React.createElement(Text, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP"),
          ),
        ),
      ),
    ),
  );
}
