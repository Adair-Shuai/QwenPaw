/**
 * Team builder modal, expert team card, and team section.
 */

import { getHost } from "../core/runtime";
import type { AgentSummary } from "../core/types";
import {
  buildTeamMessage,
  findAgentIdByName,
  loadCustomTeams,
  registerCustomTeam,
  saveCustomTeams,
  sendTeamMessage,
  type ExpertTeam,
  type ExpertTeamMember,
  type ExpertTeamStep,
} from "../team/model";
import { ExpertAvatar, TeamAvatar } from "../components/avatars";
import { PRIMARY_BTN_STYLE } from "../core/shared";
import {
  fetchPresetTeamsFromBackend,
  TeamWorkflowCard,
  type PresetTeam,
} from "../team/workflow";
import { TeamFlowDiagram } from "../team/flowDiagram";

// ─── Expert Teams (多智能体协同) ─────────────────────────────────────────────

// ─── Team Flow Diagram (visual step display) ──────────────────────────────────

// ─── Team Builder Modal (create/edit custom teams) ───────────────────────────

export function TeamBuilderModal({
  open,
  onClose,
  agents,
  editingTeam,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  agents: AgentSummary[];
  editingTeam: ExpertTeam | null;
  onSaved: () => void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    Modal,
    Input,
    Button,
    Select,
    Tag,
    Typography,
    Switch,
    Empty,
    message: antdMsg,
    Divider,
    Steps,
  } = getHost().antd;
  const { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowRightOutlined } =
    getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🤝");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"coordinator" | "pipeline" | "roundtable">(
    "pipeline",
  );
  const [coordinatorName, setCoordinatorName] = useState<string>("");
  const [taskTemplate, setTaskTemplate] = useState("");
  const [steps, setSteps] = useState<ExpertTeamStep[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (editingTeam) {
        setName(editingTeam.name);
        setEmoji(editingTeam.emoji);
        setDescription(editingTeam.description);
        setMode(editingTeam.mode);
        setCoordinatorName(editingTeam.coordinatorName || "");
        setTaskTemplate(editingTeam.taskTemplate);
        setSteps(editingTeam.steps || []);
        setSelectedMembers(editingTeam.members.map((m) => m.name));
      } else {
        setName("");
        setEmoji("🤝");
        setDescription("");
        setMode("pipeline");
        setCoordinatorName("");
        setTaskTemplate("请执行以下任务：\n任务描述：{任务描述}");
        setSteps([]);
        setSelectedMembers([]);
      }
    }
  }, [open, editingTeam]);

  // Sync steps when mode or members change
  const syncStepsFromMembers = useCallback(() => {
    if (mode === "roundtable") {
      // Each member gets an independent step
      const newSteps = selectedMembers.map((agentName) => ({
        agentName,
        instruction: "请给出你的专业评估意见",
        passContext: false,
      }));
      setSteps(newSteps);
    } else if (mode === "pipeline") {
      // Each member gets a sequential step
      const existing = new Map(steps.map((s) => [s.agentName, s]));
      const newSteps = selectedMembers.map((agentName) => {
        const existingStep = existing.get(agentName);
        return (
          existingStep || {
            agentName,
            instruction: "请完成你的专业部分",
            passContext: true,
          }
        );
      });
      setSteps(newSteps);
    }
  }, [mode, selectedMembers, steps]);

  const handleAddMember = (agentName: string) => {
    if (!selectedMembers.includes(agentName)) {
      setSelectedMembers([...selectedMembers, agentName]);
      // For coordinator mode, set first member as coordinator
      if (mode === "coordinator" && !coordinatorName) {
        setCoordinatorName(agentName);
      }
    }
  };

  const handleRemoveMember = (agentName: string) => {
    setSelectedMembers(selectedMembers.filter((n) => n !== agentName));
    setSteps(steps.filter((s) => s.agentName !== agentName));
    if (coordinatorName === agentName) {
      setCoordinatorName(selectedMembers[0] || "");
    }
  };

  const handleUpdateStep = (
    index: number,
    field: keyof ExpertTeamStep,
    value: any,
  ) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSave = () => {
    if (!name.trim()) {
      antdMsg.warning("请输入团队名称");
      return;
    }
    if (selectedMembers.length < 2) {
      antdMsg.warning("至少需要选择 2 个成员");
      return;
    }
    if (!taskTemplate.trim()) {
      antdMsg.warning("请输入任务模板");
      return;
    }
    if (mode === "coordinator" && !coordinatorName) {
      antdMsg.warning("请选择协调者");
      return;
    }

    setSaving(true);
    try {
      // Build member objects from agent list
      const memberObjs: ExpertTeamMember[] = selectedMembers.map(
        (agentName) => {
          const agent = agents.find((a) => a.name === agentName);
          return {
            name: agentName,
            role: agent?.description?.slice(0, 30) || "团队成员",
            emoji: "",
          };
        },
      );

      // Sync steps if not manually set
      let finalSteps = steps;
      if (steps.length === 0 || steps.length !== selectedMembers.length) {
        finalSteps = selectedMembers.map((agentName) => ({
          agentName,
          instruction: "请完成你的专业部分",
          passContext: mode === "pipeline",
        }));
      }

      const team: ExpertTeam = {
        id: editingTeam?.id || `custom-${Date.now()}`,
        name: name.trim(),
        emoji,
        category: "自定义",
        description:
          description.trim() ||
          `${name.trim()}（${selectedMembers.length}人团队）`,
        mode,
        members: memberObjs,
        coordinatorName: mode === "coordinator" ? coordinatorName : undefined,
        taskTemplate: taskTemplate.trim(),
        orchestrationPrompt: "", // Custom teams use steps-based instructions
        steps: finalSteps,
        custom: true,
        createdAt: editingTeam?.createdAt || Date.now(),
      };

      // Save to localStorage
      const existing = loadCustomTeams();
      const idx = existing.findIndex((t) => t.id === team.id);
      if (idx >= 0) {
        existing[idx] = team;
      } else {
        existing.push(team);
      }
      saveCustomTeams(existing);

      antdMsg.success(editingTeam ? "团队已更新" : "团队已创建");
      onSaved();
      onClose();
    } catch (err: any) {
      antdMsg.error(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const emojiOptions = [
    "🤝",
    "🛢️",
    "⛏️",
    "📋",
    "🧪",
    "🌍",
    "📡",
    "⚙️",
    "🔬",
    "📊",
    "🏗️",
    "💡",
  ];

  const availableAgents = agents.filter(
    (a) => !selectedMembers.includes(a.name),
  );

  return React.createElement(
    Modal,
    {
      open,
      onCancel: onClose,
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement(
          "span",
          { style: { fontSize: 20 } },
          editingTeam ? "✏️" : "➕",
        ),
        React.createElement(
          "span",
          null,
          editingTeam ? "编辑专家团" : "创建专家团",
        ),
      ),
      width: 720,
      onOk: handleSave,
      okText: "保存团队",
      confirmLoading: saving,
      okButtonProps: {
        icon: SaveOutlined ? React.createElement(SaveOutlined) : undefined,
      },
    },
    // Step 1: Basic info
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(
        Text,
        {
          strong: true,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        "1. 基本信息",
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        selectedMembers.length > 0
          ? React.createElement(TeamAvatar, {
              members: selectedMembers,
              size: 36,
            })
          : null,
        React.createElement(Input, {
          placeholder: "团队名称（如：储层评价团队）",
          value: name,
          onChange: (e: any) => setName(e.target.value),
          style: { flex: 1 },
        }),
      ),
      React.createElement(Input.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: description,
        onChange: (e: any) => setDescription(e.target.value),
        rows: 2,
        style: { marginBottom: 8 },
      }),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式：",
        ),
        React.createElement(Select, {
          value: mode,
          onChange: (v: any) => setMode(v),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" },
          ],
        }),
      ),
    ),
    React.createElement(Divider, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(
        Text,
        {
          strong: true,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        "2. 选择团队成员",
      ),
      // Available agents
      availableAgents.length > 0
        ? React.createElement(
            "div",
            {
              style: {
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 8,
                padding: 8,
                background: "#f5f5f5",
                borderRadius: 6,
              },
            },
            ...availableAgents.map((agent) =>
              React.createElement(
                Button,
                {
                  key: agent.id,
                  size: "small",
                  icon: PlusOutlined
                    ? React.createElement(PlusOutlined)
                    : undefined,
                  onClick: () => handleAddMember(agent.name),
                },
                agent.name,
              ),
            ),
          )
        : null,
      // Selected members
      selectedMembers.length === 0
        ? React.createElement(Empty, {
            description: "请从上方添加团队成员",
            image: Empty.PRESENTED_IMAGE_SIMPLE,
          })
        : React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...selectedMembers.map((memberName) =>
              React.createElement(
                "div",
                {
                  key: memberName,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    background: "#f0f5ff",
                    borderRadius: 6,
                    border: "1px solid #d6e4ff",
                  },
                },
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 6 } },
                  React.createElement(ExpertAvatar, { name: memberName, size: 24 }),
                  React.createElement(
                    Text,
                    { strong: true, style: { fontSize: 13 } },
                    memberName,
                  ),
                  mode === "coordinator" && coordinatorName === memberName
                    ? React.createElement(
                        Tag,
                        { color: "blue", style: { fontSize: 10 } },
                        "协调者",
                      )
                    : null,
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 4 } },
                  mode === "coordinator"
                    ? React.createElement(
                        Button,
                        {
                          size: "small",
                          type: "link",
                          onClick: () => setCoordinatorName(memberName),
                        },
                        "设为协调者",
                      )
                    : null,
                  React.createElement(
                    Button,
                    {
                      size: "small",
                      type: "link",
                      danger: true,
                      icon: DeleteOutlined
                        ? React.createElement(DeleteOutlined)
                        : undefined,
                      onClick: () => handleRemoveMember(memberName),
                    },
                    "移除",
                  ),
                ),
              ),
            ),
          ),
    ),
    React.createElement(Divider, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    selectedMembers.length > 0
      ? React.createElement(
          "div",
          { style: { marginBottom: 16 } },
          React.createElement(
            Text,
            {
              strong: true,
              style: { display: "block", marginBottom: 8, fontSize: 13 },
            },
            `3. 编排执行步骤${mode === "roundtable" ? "（各步独立执行）" : mode === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`,
          ),
          // Auto-sync button
          React.createElement(
            Button,
            {
              size: "small",
              type: "dashed",
              onClick: syncStepsFromMembers,
              style: { marginBottom: 8 },
            },
            "自动生成步骤",
          ),
          // Steps list
          steps.length === 0
            ? React.createElement(
                Text,
                { type: "secondary", style: { fontSize: 12 } },
                "点击「自动生成步骤」或手动配置每步的指令",
              )
            : React.createElement(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: 6 } },
                ...steps.map((step, i) =>
                  React.createElement(
                    "div",
                    {
                      key: i,
                      style: {
                        padding: 8,
                        background: "#fff",
                        borderRadius: 6,
                        border: "1px solid #e8e8e8",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        },
                      },
                      mode === "pipeline"
                        ? React.createElement(
                            "div",
                            {
                              style: {
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: "#13c2c2",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 600,
                              },
                            },
                            `${i + 1}`,
                          )
                        : React.createElement(
                            "span",
                            { style: { fontSize: 14 } },
                            "🔀",
                          ),
                      React.createElement(
                        Tag,
                        { color: "blue", style: { fontSize: 11 } },
                        step.agentName,
                      ),
                      React.createElement(
                        "div",
                        { style: { flex: 1 } },
                        React.createElement(Input, {
                          placeholder: "请输入该步骤的指令...",
                          value: step.instruction,
                          onChange: (e: any) =>
                            handleUpdateStep(i, "instruction", e.target.value),
                          size: "small",
                        }),
                      ),
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          paddingLeft: 28,
                        },
                      },
                      React.createElement(Switch, {
                        size: "small",
                        checked: step.passContext,
                        onChange: (v: boolean) =>
                          handleUpdateStep(i, "passContext", v),
                      }),
                      React.createElement(
                        Text,
                        { type: "secondary", style: { fontSize: 11 } },
                        step.passContext
                          ? "传递上一步结果作为上下文"
                          : "独立执行",
                      ),
                    ),
                  ),
                ),
              ),
        )
      : null,
    React.createElement(Divider, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    React.createElement(
      "div",
      null,
      React.createElement(
        Text,
        {
          strong: true,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        `${selectedMembers.length > 0 ? "4" : "3"}. 任务模板`,
      ),
      React.createElement(Input.TextArea, {
        placeholder:
          "输入任务模板，可用 {参数名} 作为占位符...\n\n例如：\n请对区块 {区块名} 的井 {井号} 进行储层评价",
        value: taskTemplate,
        onChange: (e: any) => setTaskTemplate(e.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 },
      }),
      React.createElement(
        Text,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 },
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换",
      ),
    ),
  );
}

/**
 * ExpertTeamCard component — displays a team with members, mode, and launch button.
 */
export function ExpertTeamCard({
  team,
  agents,
  onLaunch,
  onEdit,
  onDelete,
}: {
  team: ExpertTeam;
  agents: AgentSummary[];
  onLaunch: (team: ExpertTeam) => void;
  onEdit?: (team: ExpertTeam) => void;
  onDelete?: (team: ExpertTeam) => void;
}) {
  const React = getHost().React;
  const { useState } = React;
  const { Card, Tag, Typography, Button, Tooltip } = getHost().antd;
  const {
    TeamOutlined,
    RocketOutlined,
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    DownOutlined,
    UpOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [showFlow, setShowFlow] = useState(false);

  const modeLabels: Record<string, { label: string; color: string }> = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" },
  };
  const modeInfo = modeLabels[team.mode] || modeLabels.coordinator;

  // In OMP architecture, team members are spawned via spawn_subagent
  // with role prompts — they don't need to exist as pre-created agents.
  // We still check for informational purposes, but don't block.
  const memberStatus = team.members.map((m) => {
    const agentId = findAgentIdByName(agents, m.name);
    return { ...m, found: !!agentId, agentId };
  });
  const foundCount = memberStatus.filter((m) => m.found).length;

  // Determine coordinator agent
  const coordinatorName = team.coordinatorName || team.members[0]?.name;
  const coordinatorAgent = coordinatorName
    ? findAgentIdByName(agents, coordinatorName)
    : null;

  return React.createElement(
    Card,
    {
      hoverable: true,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" },
    },
    // Header: emoji + name + mode tag + custom badge
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        },
      },
      React.createElement(TeamAvatar, {
        members: team.members.map((m) => m.name),
        size: 36,
      }),
      React.createElement(
        "div",
        { style: { flex: 1 } },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 14 } },
            team.name,
          ),
          team.custom
            ? React.createElement(
                Tag,
                { color: "gold", style: { fontSize: 9 } },
                "自定义",
              )
            : null,
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          React.createElement(
            Tag,
            { color: modeInfo.color, style: { fontSize: 10 } },
            modeInfo.label,
          ),
          React.createElement(
            Tag,
            { color: "green", style: { fontSize: 10 } },
            `${team.members.length} 位专家`,
          ),
          foundCount < team.members.length
            ? React.createElement(
                Tooltip,
                {
                  title:
                    "OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，\n" +
                    "控制器会根据角色 prompt 创建子 agent 执行任务。",
                },
                React.createElement(
                  Tag,
                  { color: "blue", style: { fontSize: 10 } },
                  "OMP 自动派发",
                ),
              )
            : React.createElement(
                Tag,
                { color: "green", style: { fontSize: 10 } },
                "全部就绪",
              ),
        ),
      ),
      // Edit/delete for custom teams
      team.custom
        ? React.createElement(
            "div",
            { style: { display: "flex", gap: 2 } },
            onEdit
              ? React.createElement(
                  Tooltip,
                  { title: "编辑" },
                  React.createElement(Button, {
                    type: "text",
                    size: "small",
                    icon: EditOutlined
                      ? React.createElement(EditOutlined)
                      : undefined,
                    onClick: (e: any) => {
                      e.stopPropagation();
                      onEdit(team);
                    },
                  }),
                )
              : null,
            onDelete
              ? React.createElement(
                  Tooltip,
                  { title: "删除" },
                  React.createElement(Button, {
                    type: "text",
                    size: "small",
                    danger: true,
                    icon: DeleteOutlined
                      ? React.createElement(DeleteOutlined)
                      : undefined,
                    onClick: (e: any) => {
                      e.stopPropagation();
                      onDelete(team);
                    },
                  }),
                )
              : null,
          )
        : null,
    ),
    // Description
    React.createElement(
      Paragraph,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 },
      },
      team.description,
    ),
    // Member avatars
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap",
        },
      },
      ...memberStatus.map((m) =>
        React.createElement(
          Tooltip,
          {
            key: m.name,
            title: `${m.name}（${m.role}）${m.found ? "" : " - 未创建"}`,
          },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
background: m.found ? "#f0f5ff" : "#f0f0ff",
border: `1px solid ${m.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11,
              },
            },
            React.createElement(ExpertAvatar, { name: m.name, size: 18 }),
            React.createElement(
              Text,
              {
                style: { fontSize: 11, color: m.found ? "#1f4e8c" : "#531dab" },
              },
              m.name,
            ),
          ),
        ),
      ),
    ),
    // Toggle flow diagram
    React.createElement(
      Button,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (e: any) => {
          e.stopPropagation();
          setShowFlow(!showFlow);
        },
        icon: showFlow
          ? UpOutlined
            ? React.createElement(UpOutlined)
            : "▲"
          : DownOutlined
            ? React.createElement(DownOutlined)
            : "▼",
      },
      showFlow ? "收起流程" : "查看执行流程",
    ),
    showFlow ? React.createElement(TeamFlowDiagram, { team }) : null,
    // Footer: launch button
    React.createElement(
      "div",
      {
        style: {
          marginTop: "auto",
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
        coordinatorName ? `协调者: ${coordinatorName}` : "",
      ),
      React.createElement(
        Button,
        {
          type: "primary",
          size: "small",
          icon: RocketOutlined
            ? React.createElement(RocketOutlined)
            : undefined,
          disabled: !coordinatorAgent,
          onClick: () => onLaunch(team),
          style: PRIMARY_BTN_STYLE,
        },
        "发起团队任务",
      ),
    ),
  );
}

/**
 * ExpertTeamSection — displays preset expert teams and allows launching team tasks.
 */
export function ExpertTeamSection({
  agents,
  onLaunch,
}: {
  agents: AgentSummary[];
  onLaunch: (team: ExpertTeam) => void;
}) {
  const React = getHost().React;
  const { useMemo, useState, useCallback, useEffect } = React;
const {
Row,
Col,
Input,
Empty,
Typography,
Tag,
Button,
Divider,
Tabs,
message: antdMsg,
Popconfirm,
} = getHost().antd;
const { SearchOutlined, TeamOutlined, PlusOutlined, RocketOutlined } =
getHost().antdIcons || {};
const { Text } = Typography;

  const [searchText, setSearchText] = useState("");
  const [customTeams, setCustomTeams] = useState<ExpertTeam[]>([]);
  const [presetTeams, setPresetTeams] = useState<ExpertTeam[]>([]);
  const [presetLoadFailed, setPresetLoadFailed] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ExpertTeam | null>(null);

  // Load custom teams from localStorage on mount
  useEffect(() => {
    setCustomTeams(loadCustomTeams());
    let active = true;
    void fetchPresetTeamsFromBackend().then((teams: PresetTeam[] | null) => {
      if (!active) return;
      if (teams) {
        setPresetTeams(teams as ExpertTeam[]);
        setPresetLoadFailed(false);
      } else {
        setPresetLoadFailed(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const refreshCustomTeams = useCallback(() => {
    setCustomTeams(loadCustomTeams());
  }, []);

  const handleDeleteTeam = useCallback(
    (team: ExpertTeam) => {
      const existing = loadCustomTeams();
      const filtered = existing.filter((t) => t.id !== team.id);
      saveCustomTeams(filtered);
      setCustomTeams(filtered);
      antdMsg.success(`团队「${team.name}」已删除`);
    },
    [antdMsg],
  );

  const handleEditTeam = useCallback((team: ExpertTeam) => {
    setEditingTeam(team);
    setBuilderOpen(true);
  }, []);

  const handleCreateTeam = useCallback(() => {
    setEditingTeam(null);
    setBuilderOpen(true);
  }, []);

  // Combine preset + custom teams
  const allTeams = useMemo(() => {
    return [...customTeams, ...presetTeams];
  }, [customTeams, presetTeams]);

  const filteredTeams = useMemo(() => {
    if (!searchText.trim()) return allTeams;
    const q = searchText.toLowerCase();
    return allTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [allTeams, searchText]);

  // Split into custom and preset for display
  const customFiltered = filteredTeams.filter((t) => t.custom);
  const presetFiltered = filteredTeams.filter((t) => !t.custom);

  return React.createElement(
    "div",
    null,
    // Workflow status card (OMP-backed)
    React.createElement(TeamWorkflowCard),
    presetLoadFailed
      ? React.createElement(getHost().antd.Alert, {
          type: "warning",
          showIcon: true,
          message: "预设专家团加载失败",
          description: "请确认 UGSci 后端插件已启用，然后刷新页面。",
          style: { marginBottom: 16 },
        })
      : null,
    // Info banner
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: "12px 16px",
          background: "linear-gradient(135deg, #f6ffed 0%, #f0fff0 100%)",
          borderRadius: 8,
          border: "1px solid #b7eb8f",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        },
      },
      React.createElement(
        Text,
        { style: { fontSize: 13, color: "#389e0d" } },
        "OMP 驱动的专家团工作流 — 5 阶段状态机（规划→分派→验证→综合→完成），支持结构化交接、角色工具隔离、fork 并行执行和自动重试。",
      ),
      React.createElement(
        Button,
        {
          type: "primary",
          size: "small",
          icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
          onClick: handleCreateTeam,
          style: PRIMARY_BTN_STYLE,
        },
        "创建专家团",
      ),
    ),
    // Search
    React.createElement(Input, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: SearchOutlined ? React.createElement(SearchOutlined) : undefined,
      value: searchText,
      onChange: (e: any) => setSearchText(e.target.value),
      allowClear: true,
      style: { marginBottom: 16, maxWidth: 400 },
    }),
    // Tabs: preset teams vs custom teams
    React.createElement(
      Tabs,
      {
        defaultActiveKey: "preset",
        items: [
          {
            key: "preset",
            label: `预设团队${presetFiltered.length ? ` (${presetFiltered.length})` : ""}`,
            children: React.createElement(
              "div",
              null,
              presetFiltered.length > 0
                ? React.createElement(
                    Row,
                    { gutter: [12, 12] },
                    ...presetFiltered.map((team) =>
                      React.createElement(
                        Col,
                        { key: team.id, xs: 24, sm: 12, md: 8 },
                        React.createElement(ExpertTeamCard, {
                          team,
                          agents,
                          onLaunch,
                        }),
                      ),
                    ),
                  )
                : React.createElement(Empty, {
                    description: "未找到匹配的预设团队",
                    image: Empty.PRESENTED_IMAGE_SIMPLE,
                  }),
            ),
          },
          {
            key: "custom",
            label: `自定义团队${customFiltered.length ? ` (${customFiltered.length})` : ""}`,
            children: React.createElement(
              "div",
              null,
              customFiltered.length > 0
                ? React.createElement(
                    Row,
                    { gutter: [12, 12] },
                    ...customFiltered.map((team) =>
                      React.createElement(
                        Col,
                        { key: team.id, xs: 24, sm: 12, md: 8 },
                        React.createElement(ExpertTeamCard, {
                          team,
                          agents,
                          onLaunch,
                          onEdit: handleEditTeam,
                          onDelete: handleDeleteTeam,
                        }),
                      ),
                    ),
                  )
                : React.createElement(Empty, {
                    description:
                      "暂无自定义团队，点击「创建专家团」自定义",
                    image: Empty.PRESENTED_IMAGE_SIMPLE,
                  }),
            ),
          },
        ],
      },
    ),
    // Team Builder Modal
    React.createElement(TeamBuilderModal, {
      open: builderOpen,
      onClose: () => {
        setBuilderOpen(false);
        setEditingTeam(null);
      },
      agents,
      editingTeam,
      onSaved: refreshCustomTeams,
    }),
  );
}

