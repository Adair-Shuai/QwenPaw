/**
 * Team builder modal, expert team card, and team section.
 */

import { getHost } from "../core/runtime";
import type { AgentSummary } from "../core/types";
import {
  buildTeamMessage,
  deleteCustomTeamFromBackend,
  fetchCustomTeams,
  findAgentIdByName,
  loadCustomTeams,
  migrateCachedCustomTeams,
  saveCustomTeamToBackend,
  saveCustomTeams,
  sendTeamMessage,
  type ExpertTeam,
  type ExpertTeamMember,
  type ExpertTeamStep,
  type TeamMode,
} from "../team/model";
import { ExpertAvatar, TeamAvatar } from "../components/avatars";
import { PRIMARY_BTN_STYLE } from "../core/shared";
import {
  fetchPresetTeamsFromBackend,
  fetchUgsciRoles,
  TeamRunHistory,
  TeamWorkflowCard,
  type PresetTeam,
  type RoleDefinition,
} from "../team/workflow";
import { TeamFlowDiagram } from "../team/flowDiagram";

function inferRoleKey(name: string): string {
  const compact = name.replace(/\s+/g, "").toLowerCase();
  if (compact.includes("测井")) return "log-analyst";
  if (compact.includes("地球物理")) return "geophysicist";
  if (compact.includes("油藏")) return "reservoir-engineer";
  if (compact.includes("钻井")) return "drilling-engineer";
  if (compact.includes("采油") || compact.includes("生产")) return "production-engineer";
  if (compact.includes("pvt") || compact.includes("物性")) return "pvt-analyst";
  if (compact.includes("审核") || compact.includes("verifier")) return "domain-reviewer";
  if (compact.includes("master") || compact.includes("planner")) return "planner";
  // Unknown display names fail closed to the restricted analyst role. Users
  // can select a more specific role explicitly in the builder.
  return "analyst";
}

const FALLBACK_ROLE_OPTIONS: RoleDefinition[] = [
  { key: "analyst", display_name: "需求分析师", allowed_tools: [], skills: [], prompt: "" },
  { key: "reservoir-engineer", display_name: "油藏工程师", allowed_tools: [], skills: [], prompt: "" },
  { key: "log-analyst", display_name: "测井分析师", allowed_tools: [], skills: [], prompt: "" },
  { key: "geophysicist", display_name: "地球物理专家", allowed_tools: [], skills: [], prompt: "" },
  { key: "drilling-engineer", display_name: "钻井工程师", allowed_tools: [], skills: [], prompt: "" },
  { key: "production-engineer", display_name: "采油工程师", allowed_tools: [], skills: [], prompt: "" },
  { key: "pvt-analyst", display_name: "PVT 分析师", allowed_tools: [], skills: [], prompt: "" },
  { key: "domain-reviewer", display_name: "领域审核专家", allowed_tools: [], skills: [], prompt: "" },
  { key: "planner", display_name: "规划者", allowed_tools: [], skills: [], prompt: "" },
  { key: "verifier", display_name: "验证者", allowed_tools: [], skills: [], prompt: "" },
];

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
  const [mode, setMode] = useState<TeamMode>("pipeline");
  const [coordinatorName, setCoordinatorName] = useState<string>("");
  const [taskTemplate, setTaskTemplate] = useState("");
  const [steps, setSteps] = useState<ExpertTeamStep[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [maxReviewRounds, setMaxReviewRounds] = useState(2);
  const [successCriteria, setSuccessCriteria] = useState("");
  const [routingInstruction, setRoutingInstruction] = useState("");
  const [memberBindings, setMemberBindings] = useState<
    Record<string, "fixed" | "preferred" | "temporary">
  >({});
  const [memberRoleKeys, setMemberRoleKeys] = useState<Record<string, string>>({});
  const [roleOptions, setRoleOptions] = useState<RoleDefinition[]>(
    FALLBACK_ROLE_OPTIONS,
  );

  const workflowTemplates: Array<{
    value: TeamMode;
    icon: string;
    title: string;
    description: string;
    topology: string;
    accent: string;
  }> = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" },
  ];

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
        setMaxReviewRounds(editingTeam.maxReviewRounds || 2);
        setSuccessCriteria(editingTeam.successCriteria || "");
        setRoutingInstruction(editingTeam.routingInstruction || "");
        setMemberBindings(
          Object.fromEntries(
            editingTeam.members.map((member) => [
              member.name,
              member.bindingMode || (member.agentId ? "fixed" : "preferred"),
            ]),
          ),
        );
        setMemberRoleKeys(
          Object.fromEntries(
            editingTeam.members.map((member) => [
              member.name,
              member.roleKey || inferRoleKey(member.name),
            ]),
          ),
        );
      } else {
        setName("");
        setEmoji("🤝");
        setDescription("");
        setMode("pipeline");
        setCoordinatorName("");
        setTaskTemplate("请执行以下任务：\n任务描述：{任务描述}");
        setSteps([]);
        setSelectedMembers([]);
        setMaxReviewRounds(2);
        setSuccessCriteria("");
        setRoutingInstruction("");
        setMemberBindings({});
        setMemberRoleKeys({});
      }
    }
  }, [open, editingTeam]);

  useEffect(() => {
    if (!open) return;
    void fetchUgsciRoles().then((roles) => {
      if (roles?.length) setRoleOptions(roles);
    });
  }, [open]);

  // Sync steps when mode or members change
  const syncStepsFromMembers = useCallback(() => {
    if (mode === "roundtable" || mode === "debate" || mode === "router") {
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
      setMemberBindings({ ...memberBindings, [agentName]: "fixed" });
      setMemberRoleKeys({
        ...memberRoleKeys,
        [agentName]: inferRoleKey(agentName),
      });
      // Supervisor / debate templates require an explicit control role.
      if ((mode === "coordinator" || mode === "debate") && !coordinatorName) {
        setCoordinatorName(agentName);
      }
    }
  };

  const handleRemoveMember = (agentName: string) => {
    const remainingMembers = selectedMembers.filter((n) => n !== agentName);
    setSelectedMembers(remainingMembers);
    setSteps(steps.filter((s) => s.agentName !== agentName));
    const nextBindings = { ...memberBindings };
    delete nextBindings[agentName];
    setMemberBindings(nextBindings);
    const nextRoles = { ...memberRoleKeys };
    delete nextRoles[agentName];
    setMemberRoleKeys(nextRoles);
    if (coordinatorName === agentName) {
      setCoordinatorName(remainingMembers[0] || "");
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

  const handleSave = async () => {
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
    if ((mode === "coordinator" || mode === "debate") && !coordinatorName) {
      antdMsg.warning(mode === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }

    setSaving(true);
    try {
      // Build member objects from agent list
      let orderedMembers = [...selectedMembers];
      if (mode === "coordinator" && coordinatorName) {
        orderedMembers = [coordinatorName, ...orderedMembers.filter((n) => n !== coordinatorName)];
      } else if (mode === "debate" && coordinatorName) {
        orderedMembers = [...orderedMembers.filter((n) => n !== coordinatorName), coordinatorName];
      }
      const memberObjs: ExpertTeamMember[] = orderedMembers.map(
        (agentName) => {
          const agent = agents.find((a) => a.name === agentName);
          const bindingMode = memberBindings[agentName] || "fixed";
          const roleKey = memberRoleKeys[agentName] || inferRoleKey(agentName);
          const roleDefinition = roleOptions.find((role) => role.key === roleKey);
          return {
            name: agentName,
            role:
              roleDefinition?.display_name ||
              agent?.description?.slice(0, 30) ||
              "需求分析师",
            emoji: "",
            agentId: bindingMode === "temporary" ? undefined : agent?.id,
            roleKey,
            bindingMode,
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
        coordinatorName:
          mode === "coordinator" || mode === "debate" ? coordinatorName : undefined,
        taskTemplate: taskTemplate.trim(),
        orchestrationPrompt: "", // Custom teams use steps-based instructions
        steps: finalSteps,
        custom: true,
        createdAt: editingTeam?.createdAt || Date.now(),
        maxReviewRounds,
        successCriteria: successCriteria.trim(),
        routingInstruction: routingInstruction.trim(),
      };

      // Persist to the backend source of truth, then refresh the offline cache.
      const savedTeam = await saveCustomTeamToBackend(team);
      const existing = loadCustomTeams();
      const idx = existing.findIndex((t) => t.id === savedTeam.id);
      if (idx >= 0) {
        existing[idx] = savedTeam;
      } else {
        existing.push(savedTeam);
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
      width: 860,
      onOk: handleSave,
      okText: "保存专家团",
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
        "1. 定义任务工作流",
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
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: name,
          onChange: (e: any) => setName(e.target.value),
          style: { flex: 1 },
        }),
      ),
      React.createElement(Input.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: description,
        onChange: (e: any) => setDescription(e.target.value),
        rows: 2,
        style: { marginBottom: 8 },
      }),
      React.createElement(
        Text,
        { strong: true, style: { display: "block", margin: "12px 0 8px", fontSize: 13 } },
        "选择协同模式",
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8,
          },
        },
        ...workflowTemplates.map((template) => {
          const active = mode === template.value;
          return React.createElement(
            "button",
            {
              key: template.value,
              type: "button",
              onClick: () => {
                setMode(template.value);
                if (template.value !== "coordinator" && template.value !== "debate") setCoordinatorName("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: active ? `${template.accent}0d` : "#fff",
                border: `1px solid ${active ? template.accent : "#d9d9d9"}`,
                boxShadow: active ? `0 0 0 2px ${template.accent}1a` : "none",
              },
            },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: template.accent, fontWeight: 600 } },
              React.createElement("span", { style: { fontSize: 18 } }, template.icon),
              template.title,
            ),
            React.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, template.description),
            React.createElement("div", { style: { fontSize: 10, color: template.accent, marginTop: 5, fontFamily: "monospace" } }, template.topology),
          );
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
        "2. 配置专家角色",
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
                  (mode === "coordinator" || mode === "debate") && coordinatorName === memberName
                    ? React.createElement(
                        Tag,
                        { color: "blue", style: { fontSize: 10 } },
                        mode === "debate" ? "裁决者" : "主控",
                      )
                    : null,
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 4 } },
                  React.createElement(Select, {
                    size: "small",
                    value: memberRoleKeys[memberName] || inferRoleKey(memberName),
                    style: { width: 132 },
                    onChange: (value: string) =>
                      setMemberRoleKeys({ ...memberRoleKeys, [memberName]: value }),
                    options: roleOptions.map((role) => ({
                      value: role.key,
                      label: role.display_name,
                    })),
                  }),
                  React.createElement(Select, {
                    size: "small",
                    value: memberBindings[memberName] || "fixed",
                    style: { width: 118 },
                    onChange: (value: "fixed" | "preferred" | "temporary") =>
                      setMemberBindings({ ...memberBindings, [memberName]: value }),
                    options: [
                      { value: "fixed", label: "固定实例" },
                      { value: "preferred", label: "优先实例" },
                      { value: "temporary", label: "临时派生" },
                    ],
                  }),
                  mode === "coordinator" || mode === "debate"
                    ? React.createElement(
                        Button,
                        {
                          size: "small",
                          type: "link",
                          onClick: () => setCoordinatorName(memberName),
                        },
                        mode === "debate" ? "设为裁决者" : "设为主控",
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
    mode === "review_loop" || mode === "router"
      ? React.createElement(
          "div",
          {
            style: {
              margin: "0 0 16px",
              padding: 12,
              borderRadius: 8,
              background: "#fafafa",
              border: "1px solid #f0f0f0",
            },
          },
          mode === "review_loop"
            ? React.createElement(
                "div",
                { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
                React.createElement(Select, {
                  value: maxReviewRounds,
                  onChange: (value: number) => setMaxReviewRounds(value),
                  options: [1, 2, 3, 4, 5].map((value) => ({ value, label: `最多 ${value} 轮` })),
                }),
                React.createElement(Input, {
                  value: successCriteria,
                  onChange: (e: any) => setSuccessCriteria(e.target.value),
                  placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷",
                }),
              )
            : React.createElement(Input, {
                value: routingInstruction,
                onChange: (e: any) => setRoutingInstruction(e.target.value),
                placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师",
              }),
        )
      : null,
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
            `3. 配置专家任务${mode === "roundtable" ? "（并行独立）" : mode === "pipeline" ? "（顺序交接）" : mode === "router" ? "（作为候选能力）" : mode === "review_loop" ? "（首位执行、末位评审）" : mode === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`,
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
  const { Card, Tag, Typography, Button, Tooltip, Popconfirm } = getHost().antd;
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
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" },
  };
  const modeInfo = modeLabels[team.mode] || modeLabels.coordinator;

  // In OMP architecture, team members are spawned via spawn_subagent
  // with role prompts — they don't need to exist as pre-created agents.
  // We still check for informational purposes, but don't block.
  const memberStatus = team.members.map((m) => {
    const temporary = m.bindingMode === "temporary";
    const agentId = temporary
      ? null
      : (m.agentId && agents.some((agent) => agent.id === m.agentId)
          ? m.agentId
          : null) || findAgentIdByName(agents, m.name);
    return { ...m, found: !!agentId, agentId, temporary };
  });
  const foundCount = memberStatus.filter((m) => m.found).length;

  // Determine coordinator agent
  const coordinatorName = team.coordinatorName || team.members[0]?.name;
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
                  React.createElement(
                    Popconfirm,
                    {
                      title: `删除专家团「${team.name}」？`,
                      description: "此操作会删除后端定义，但不会删除既有讨论记录。",
                      okText: "删除",
                      cancelText: "取消",
                      okButtonProps: { danger: true },
                      onConfirm: () => onDelete(team),
                    },
                    React.createElement(Button, {
                      type: "text",
                      size: "small",
                      danger: true,
                      icon: DeleteOutlined
                        ? React.createElement(DeleteOutlined)
                        : undefined,
                      onClick: (e: any) => e.stopPropagation(),
                    }),
                  ),
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
            title: `${m.name}（${m.role}）${
              m.temporary
                ? " - OMP 临时派生"
                : m.found
                  ? " - 已绑定实例"
                  : " - OMP 按角色派发"
            }`,
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
            m.temporary
              ? React.createElement(
                  Tag,
                  { color: "purple", style: { fontSize: 9, marginInlineEnd: 0 } },
                  "派生",
                )
              : null,
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
        coordinatorName
          ? `${team.mode === "debate" ? "裁决者" : "主控"}: ${coordinatorName}`
          : "OMP 动态编排",
      ),
      React.createElement(
        Button,
        {
          type: "primary",
          size: "small",
          icon: RocketOutlined
            ? React.createElement(RocketOutlined)
            : undefined,
          disabled: agents.length === 0,
          onClick: () => onLaunch(team),
          style: PRIMARY_BTN_STYLE,
        },
        "运行工作流",
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

  // Show the offline cache immediately, then reconcile with the backend source
  // of truth and migrate legacy browser-only definitions once.
  useEffect(() => {
    setCustomTeams(loadCustomTeams());
    let active = true;
    void (async () => {
      try {
        await migrateCachedCustomTeams();
        const teams = await fetchCustomTeams();
        if (active) setCustomTeams(teams);
      } catch (error) {
        console.warn("[ugsci] Failed to load backend expert teams:", error);
        if (active) antdMsg.warning("专家团后端同步失败，当前显示本地缓存");
      }
    })();
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
    void fetchCustomTeams()
      .then(setCustomTeams)
      .catch((error) => {
        console.warn("[ugsci] Failed to refresh expert teams:", error);
        setCustomTeams(loadCustomTeams());
      });
  }, []);

  const handleDeleteTeam = useCallback(
    (team: ExpertTeam) => {
      void deleteCustomTeamFromBackend(team.id)
        .then(() => {
          const existing = loadCustomTeams();
          const filtered = existing.filter((t) => t.id !== team.id);
          saveCustomTeams(filtered);
          setCustomTeams(filtered);
          antdMsg.success(`团队「${team.name}」已删除`);
        })
        .catch((error) => antdMsg.error(error.message || "删除专家团失败"));
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
        "OMP 协作工作流 — 专家是可组合的角色节点，可按顺序、并行、路由、评审闭环或多方论证运行，并由统一状态机负责交接、验证与失败恢复。",
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
          {
            key: "active",
            label: "进行中的讨论",
            children: React.createElement(
              React.Fragment,
              null,
              React.createElement(TeamWorkflowCard),
              React.createElement(TeamRunHistory, { activeOnly: true }),
            ),
          },
          {
            key: "history",
            label: "讨论历史",
            children: React.createElement(TeamRunHistory),
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
