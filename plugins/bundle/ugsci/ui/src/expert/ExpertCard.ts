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
        borderColor: isEnabled ? undefined : "#d9d9d9",
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
              minHeight: 54,
              flex: "1 0 auto",
            },
          },
          renderMarkdown(agent.description, React),
        )
      : React.createElement(
          "div",
          { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
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
          { style: { marginTop: "auto" } },
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
                  style: { fontSize: 16, color: "#8c8c8c" },
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
                              color: "#8c8c8c",
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

  const handleCreateBlank = async (name: string, description: string) => {
    setCreating(true);
    try {
      const agentRef = await apiFetch<{ id: string }>("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "新专家",
          description: description || "",
          skill_names: [],
        }),
      });

      // Write a minimal AGENTS.md
      await writeKnowledgeFile(
        agentRef.id,
        "AGENTS.md",
        `# ${name || "新专家"}\n\n请在此处编写该专家的系统提示词。\n`,
      );

      antdMsg.success("专家「" + (name || "新专家") + "」创建成功");
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
            { style: { marginTop: 12, color: "#8c8c8c" } },
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
                      border: "2px dashed #d9d9d9",
                      background: "#fafafa",
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
                      { style: { fontSize: 28, color: "#8c8c8c" } },
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

export function BlankExpertModal({
  open,
  onCancel,
  onCreate,
}: {
  open: boolean;
  onCancel: () => void;
  onCreate: (name: string, description: string) => Promise<void> | void;
}) {
  const React = getHost().React;
  const { useState, useEffect } = React;
  const { Modal, Input, message: antdMsg } = getHost().antd;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form fields whenever the modal is opened
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setLoading(false);
    }
  }, [open]);

  return React.createElement(
    Modal,
    {
      open,
      title: "从空白模版创建专家",
      onCancel,
      onOk: () => {
        if (!name.trim()) {
          antdMsg.warning("请输入专家名称");
          return;
        }
        setLoading(true);
        // Fire-and-forget: do NOT return the Promise so antd
        // doesn't set its internal okButtonLoading state which
        // can prevent the modal from closing when open becomes false.
        //
        // IMPORTANT: Use okButtonProps.loading instead of confirmLoading.
        // In Ant Design 5.x, Modal's handleCancel checks `confirmLoading`
        // and blocks closing (returns early) when it is true.  Using
        // okButtonProps.loading shows the spinner on the OK button without
        // preventing the user from closing the modal via X / Cancel / mask / ESC.
        Promise.resolve(onCreate(name.trim(), description.trim())).finally(() => {
          setLoading(false);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: loading },
      maskClosable: true,
      keyboard: true,
    },
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家名称",
      ),
      React.createElement(Input, {
        placeholder: "输入专家名称",
        value: name,
        onChange: (e: any) => setName(e.target.value),
        maxLength: 50,
      }),
    ),
    React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家描述（可选）",
      ),
      React.createElement(Input.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: description,
        onChange: (e: any) => setDescription(e.target.value),
        rows: 3,
        maxLength: 200,
      }),
    ),
  );
}
