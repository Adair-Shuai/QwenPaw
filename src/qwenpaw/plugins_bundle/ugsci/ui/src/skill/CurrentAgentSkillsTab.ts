/**
 * Current agent skills tab — shows skills installed for the selected agent.
 */

import { CapabilityDetail } from "../capability/CapabilityDetail";
import { getHost, clearApiCache, clearAgentCache } from "../core/runtime";
import { PRIMARY_BTN_STYLE, renderMarkdown, PageHeader } from "../core/shared";
import type { SkillSpec, PoolSkillSpec } from "../core/types";
import {
  fetchAgentSkills,
  fetchPoolSkills,
  fetchPoolSkillContent,
} from "../core/api";
import {
  enableSkillForAgent,
  disableSkillForAgent,
  deleteSkillForAgent,
  batchEnableSkillsForAgent,
  batchDisableSkillsForAgent,
  batchDeleteSkillsForAgent,
  installSkillFromPool,
  deletePoolSkill,
} from "../expert/expertApi";

export function CurrentAgentSkillsTab({
  agentId,
  agentName,
  refreshKey = 0,
  onNavigate,
}: {
  agentId: string;
  agentName: string;
  /** Incremented by the skill-pool tab after an install completes. */
  refreshKey?: number;
  onNavigate: (path: string) => void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useRef, useMemo } = React;
  const {
    Input,
    Spin,
    Empty,
    Button,
    Row,
    Col,
    Card,
    Tag,
    Checkbox,
    Modal,
    Typography,
    Switch,
    Descriptions,
    message: antdMsg,
  } = getHost().antd;
  const {
    ReloadOutlined,
    ThunderboltOutlined,
    SettingOutlined,
    CheckSquareOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    DeleteOutlined,
    CloseOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [skills, setSkills] = useState<SkillSpec[]>([]);
  const [skillsOwner, setSkillsOwner] = useState("");
  const [searchText, setSearchText] = useState("");
  const filteredSkills = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return query
      ? skills.filter((skill) =>
          [skill.name, skill.description, ...(skill.tags || [])].some(
            (value) => value?.toLowerCase().includes(query),
          ),
        )
      : skills;
  }, [skills, searchText]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState<SkillSpec | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const requestGeneration = useRef(0);
  const currentAgent = useRef(agentId);
  currentAgent.current = agentId;
  const [actionLoading, setActionLoading] = useState(false);

  const loadSkills = useCallback(async () => {
    if (!agentId || currentAgent.current !== agentId) return;
    const generation = ++requestGeneration.current;
    setLoading(true);
    try {
      const data = await fetchAgentSkills(agentId);
      if (
        generation === requestGeneration.current &&
        currentAgent.current === agentId
      ) {
        setSkills(data);
        setSkillsOwner(agentId);
      }
    } catch (err: any) {
      if (
        generation !== requestGeneration.current ||
        currentAgent.current !== agentId
      )
        return;
      antdMsg.error(err.message || "加载技能失败");
      setSkills([]);
      setSkillsOwner(agentId);
    } finally {
      if (
        generation === requestGeneration.current &&
        currentAgent.current === agentId
      )
        setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    setDrawerOpen(false);
    setActiveSkill(null);
    setBatchMode(false);
    setSelectedSkills(new Set());
    return () => {
      requestGeneration.current++;
    };
  }, [agentId]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills, refreshKey]);

  // ── Batch helpers ─────────────────────────────────────────────────────────
  const toggleSelect = (name: string) => {
    setSelectedSkills((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const clearSelection = () => setSelectedSkills(new Set());

  const selectAll = () => setSelectedSkills(new Set(skills.map((s) => s.name)));

  const toggleBatchMode = () => {
    if (batchMode) {
      clearSelection();
      setBatchMode(false);
    } else {
      setBatchMode(true);
    }
  };

  const handleBatchEnable = async () => {
    const names = Array.from(selectedSkills);
    if (names.length === 0) return;
    setBatchLoading(true);
    try {
      const { results } = await batchEnableSkillsForAgent(agentId, names);
      const failed = Object.entries(results).filter(
        ([, r]) => r.success === false,
      );
      const succeeded = names.length - failed.length;
      if (failed.length > 0) {
        antdMsg.warning(
          `批量启用完成：成功 ${succeeded} 个，失败 ${failed.length} 个`,
        );
      } else {
        antdMsg.success(`成功启用 ${names.length} 个技能`);
      }
      clearSelection();
      await loadSkills();
    } catch (err: any) {
      antdMsg.error(err.message || "批量启用失败");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchDisable = async () => {
    const names = Array.from(selectedSkills);
    if (names.length === 0) return;
    setBatchLoading(true);
    try {
      const { results } = await batchDisableSkillsForAgent(agentId, names);
      const failed = Object.entries(results).filter(
        ([, r]) => r.success === false,
      );
      const succeeded = names.length - failed.length;
      if (failed.length > 0) {
        antdMsg.warning(
          `批量停用完成：成功 ${succeeded} 个，失败 ${failed.length} 个`,
        );
      } else {
        antdMsg.success(`成功停用 ${names.length} 个技能`);
      }
      clearSelection();
      await loadSkills();
    } catch (err: any) {
      antdMsg.error(err.message || "批量停用失败");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchDelete = () => {
    const names = Array.from(selectedSkills);
    if (names.length === 0) return;
    Modal.confirm({
      title: `确认删除 ${names.length} 个技能？`,
      content:
        "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        setBatchLoading(true);
        try {
          const { results } = await batchDeleteSkillsForAgent(agentId, names);
          const failed = Object.entries(results).filter(
            ([, r]) => r.success === false,
          );
          const succeeded = names.length - failed.length;
          if (failed.length > 0) {
            antdMsg.warning(
              `批量删除完成：成功 ${succeeded} 个，失败 ${failed.length} 个`,
            );
          } else {
            antdMsg.success(`成功删除 ${names.length} 个技能`);
          }
          clearSelection();
          await loadSkills();
        } catch (err: any) {
          antdMsg.error(err.message || "批量删除失败");
        } finally {
          setBatchLoading(false);
        }
      },
    });
  };

  // ── Single-skill hover actions ────────────────────────────────────────────
  const handleToggleEnabled = async (skill: SkillSpec) => {
    setActionLoading(true);
    try {
      if (skill.enabled === false) {
        await enableSkillForAgent(agentId, skill.name);
        antdMsg.success(`已启用技能「${skill.name}」`);
      } else {
        await disableSkillForAgent(agentId, skill.name);
        antdMsg.success(`已禁用技能「${skill.name}」`);
      }
      await loadSkills();
    } catch (err: any) {
      antdMsg.error(err.message || "操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (skill: SkillSpec) => {
    Modal.confirm({
      title: `确认删除技能「${skill.name}」？`,
      content:
        "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        setActionLoading(true);
        try {
          await deleteSkillForAgent(agentId, skill.name);
          if (currentAgent.current === agentId) setDrawerOpen(false);
          antdMsg.success(`已删除技能「${skill.name}」`);
          await loadSkills();
        } catch (err: any) {
          antdMsg.error(err.message || "删除失败");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const focused = drawerOpen && skillsOwner === agentId;
  return React.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": focused },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        },
      },
      React.createElement(Input, {
        placeholder: "搜索当前专家的技能...",
        value: searchText,
        allowClear: true,
        style: { maxWidth: 320 },
        onChange: (event: any) => setSearchText(event.target.value),
      }),
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 13 } },
        batchMode
          ? `已选择 ${selectedSkills.size} / ${skills.length} 个技能`
          : `共 ${skills.length} 个技能`,
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          },
        },
        batchMode
          ? React.createElement(
              React.Fragment,
              null,
              React.createElement(
                Button,
                { size: "small", onClick: selectAll },
                "全选",
              ),
              React.createElement(
                Button,
                {
                  size: "small",
                  icon: CloseOutlined
                    ? React.createElement(CloseOutlined)
                    : undefined,
                  onClick: clearSelection,
                },
                "取消选择",
              ),
              React.createElement(
                Button,
                {
                  size: "small",
                  type: "default",
                  icon: EyeOutlined
                    ? React.createElement(EyeOutlined)
                    : undefined,
                  disabled: selectedSkills.size === 0 || batchLoading,
                  loading: batchLoading,
                  onClick: handleBatchEnable,
                },
                "批量启用",
              ),
              React.createElement(
                Button,
                {
                  size: "small",
                  danger: true,
                  icon: EyeInvisibleOutlined
                    ? React.createElement(EyeInvisibleOutlined)
                    : undefined,
                  disabled: selectedSkills.size === 0 || batchLoading,
                  loading: batchLoading,
                  onClick: handleBatchDisable,
                },
                "批量停用",
              ),
              React.createElement(
                Button,
                {
                  size: "small",
                  danger: true,
                  icon: DeleteOutlined
                    ? React.createElement(DeleteOutlined)
                    : undefined,
                  disabled: selectedSkills.size === 0 || batchLoading,
                  loading: batchLoading,
                  onClick: handleBatchDelete,
                },
                `删除 (${selectedSkills.size})`,
              ),
              React.createElement(
                Button,
                {
                  size: "small",
                  type: "primary",
                  onClick: toggleBatchMode,
                },
                "退出批量",
              ),
            )
          : React.createElement(
              React.Fragment,
              null,
              React.createElement(
                Button,
                {
                  size: "small",
                  icon: CheckSquareOutlined
                    ? React.createElement(CheckSquareOutlined)
                    : undefined,
                  onClick: toggleBatchMode,
                  disabled: filteredSkills.length === 0,
                },
                "批量管理",
              ),
              React.createElement(
                Button,
                {
                  icon: ReloadOutlined
                    ? React.createElement(ReloadOutlined)
                    : undefined,
                  onClick: () => {
                    clearApiCache();
                    loadSkills();
                  },
                },
                "刷新",
              ),
            ),
      ),
    ),
    loading || skillsOwner !== agentId
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
        )
      : skills.length === 0
      ? React.createElement(Empty, {
          description: searchText
            ? "未找到匹配的技能"
            : "当前智能体未加载任何技能",
        })
      : React.createElement(
          Row,
          { gutter: [12, 12] },
          ...filteredSkills.map((skill) =>
            React.createElement(
              Col,
              { key: skill.name, xs: 24, sm: 12, md: 12, lg: 8, xxl: 6 },
              React.createElement(
                Card,
                { size: "small", className: "ugsci-capability-card" },
                React.createElement(
                  "div",
                  { className: "ugsci-capability-card-title" },
                  React.createElement(
                    "span",
                    {
                      className: "ugsci-capability-avatar",
                      "aria-hidden": true,
                    },
                    skill.emoji || "⚡",
                  ),
                  React.createElement(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setActiveSkill(skill);
                        setDrawerOpen(true);
                      },
                    },
                    skill.name,
                  ),
                  batchMode
                    ? React.createElement(Checkbox, {
                        "aria-label": `选择 ${skill.name}`,
                        checked: selectedSkills.has(skill.name),
                        onChange: () => toggleSelect(skill.name),
                      })
                    : null,
                ),
                React.createElement(
                  Paragraph,
                  {
                    className: "ugsci-capability-card-copy",
                    ellipsis: { rows: 2 },
                    style: { margin: 0 },
                  },
                  skill.description || "暂无描述",
                ),
                React.createElement(
                  "div",
                  { className: "ugsci-capability-card-meta" },
                  skill.version_text
                    ? React.createElement(Tag, null, `v${skill.version_text}`)
                    : null,
                  ...(skill.tags || [])
                    .slice(0, 3)
                    .map((tag) => React.createElement(Tag, { key: tag }, tag)),
                ),
                !batchMode
                  ? React.createElement(
                      "div",
                      { className: "ugsci-capability-card-footer" },
                      React.createElement(
                        Button,
                        {
                          size: "small",
                          onClick: () => {
                            setActiveSkill(skill);
                            setDrawerOpen(true);
                          },
                          "aria-label": `配置 ${skill.name}`,
                        },
                        "配置",
                      ),
                      React.createElement(
                        "span",
                        {
                          style: {
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          },
                        },
                        React.createElement(
                          Text,
                          { type: "secondary", style: { fontSize: 12 } },
                          skill.enabled === false ? "已禁用" : "已启用",
                        ),
                        React.createElement(Switch, {
                          size: "small",
                          checked: skill.enabled !== false,
                          loading: actionLoading,
                          "aria-label": `${
                            skill.enabled === false ? "启用" : "禁用"
                          } ${skill.name}`,
                          onChange: () => handleToggleEnabled(skill),
                        }),
                      ),
                    )
                  : null,
              ),
            ),
          ),
        ),
    // Skill detail drawer
    activeSkill
      ? React.createElement(
          CapabilityDetail,
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
            open: focused,
            onClose: () => setDrawerOpen(false),
            width: 520,
            footer: React.createElement(
              Button,
              {
                danger: true,
                disabled: actionLoading,
                onClick: () => handleDelete(activeSkill),
              },
              "删除技能",
            ),
            extra: React.createElement(
              Button,
              {
                type: "primary",
                size: "small",
                icon: SettingOutlined
                  ? React.createElement(SettingOutlined)
                  : undefined,
                onClick: () => onNavigate("/skills"),
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
              { label: "状态" },
              activeSkill.enabled === false ? "已禁用" : "已启用",
            ),
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
                    React.createElement(Tag, { key: i, color: "blue" }, tag),
                  ),
                ),
              )
            : null,
          // Skill content preview
          activeSkill.content
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
                      background: "var(--app-fill, #f5f5f5)",
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

/** Skill pool tab — the original skill center content (Tab 2). */
