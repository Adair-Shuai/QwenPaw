/**
 * Expert configuration modal with tabs for heartbeat, skills, MCP, and running config.
 */

import { getHost, clearApiCache, apiFetch } from "../core/runtime";
import { PRIMARY_BTN_STYLE } from "../core/shared";
import type { SkillSpec, PoolSkillSpec, MCPClientInfo, ExpertData } from "../core/types";
import {
  fetchHeartbeatConfig,
  updateHeartbeatConfig,
  runHeartbeatNow,
  fetchRunningConfig,
  updateRunningConfig,
  fetchAgentLanguage,
  updateAgentLanguage,
  fetchUserTimezone,
  updateUserTimezone,
  fetchSystemPromptFiles,
  updateSystemPromptFiles,
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
  disableSkillForAgent,
  deletePoolSkill,
  parseEvery,
  serializeEvery,
  type HeartbeatConfig,
  type EveryParts,
  type AgentsRunningConfig,
} from "./expertApi";
import { KnowledgeBaseTab } from "./expertTabs";
import { fetchAgentSkills, fetchPoolSkills, fetchAgentConfig } from "../core/api";
import { DEFAULT_PROMPT_FILES, TagList, SkillPickerModal } from "./expertUtils";

// ─── Expert Config Modal ─────────────────────────────────────────────────────

// ── Shared layout styles for Expert Config Modal tabs ──
// A form-like layout: label on top, control below, consistent spacing.
export const CFG_LABEL_STYLE: Record<string, unknown> = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4,
};
export const CFG_ROW_STYLE: Record<string, unknown> = { marginBottom: 16 };
// Two-column grid for fields that can share a row
export const CFG_GRID_2COL_STYLE: Record<string, unknown> = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16,
};
// Section card title style
export const CFG_SECTION_TITLE_STYLE: Record<string, unknown> = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0",
};
// Tooltip hint text next to a control
export const CFG_HINT_STYLE: Record<string, unknown> = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8,
};

/** Heartbeat configuration tab — fetches/saves /config/heartbeat with X-Agent-Id. */
export function HeartbeatConfigTab({ agentId }: { agentId: string }) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    Switch,
    InputNumber,
    Select,
    Button,
    Spin,
    Space,
    Typography,
    message: antdMsg,
  } = getHost().antd;
  const { PlayCircleOutlined, SaveOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [everyNumber, setEveryNumber] = useState(6);
  const [everyUnit, setEveryUnit] = useState<"m" | "h">("h");
  const [target, setTarget] = useState("main");
  const [timeoutSeconds, setTimeoutSeconds] = useState(300);
  const [useActiveHours, setUseActiveHours] = useState(false);
  const [activeHoursStart, setActiveHoursStart] = useState("08:00");
  const [activeHoursEnd, setActiveHoursEnd] = useState("22:00");

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchHeartbeatConfig(agentId);
      const parts = parseEvery(data.every ?? "6h");
      setEnabled(data.enabled ?? false);
      setEveryNumber(parts.number);
      setEveryUnit(parts.unit);
      setTarget(data.target ?? "main");
      setTimeoutSeconds(data.timeoutSeconds ?? 300);
      setUseActiveHours(!!data.activeHours);
      setActiveHoursStart(data.activeHours?.start ?? "08:00");
      setActiveHoursEnd(data.activeHours?.end ?? "22:00");
    } catch (err: any) {
      antdMsg.error(err.message || "加载心跳配置失败");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHeartbeatConfig(agentId, {
        enabled,
        every: serializeEvery({ number: everyNumber, unit: everyUnit }),
        target,
        timeoutSeconds,
        activeHours:
          useActiveHours && activeHoursStart && activeHoursEnd
            ? { start: activeHoursStart, end: activeHoursEnd }
            : undefined,
      });
      antdMsg.success("心跳配置已保存");
    } catch (err: any) {
      antdMsg.error(err.message || "保存心跳配置失败");
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await runHeartbeatNow(agentId);
      antdMsg.success("已触发心跳检查");
    } catch (err: any) {
      antdMsg.error(err.message || "触发心跳失败");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      React.createElement(Spin, { size: "large" }),
    );
  }

  // Helper: a labelled form field row
  const field = (label: string, control: any, hint?: string) =>
    React.createElement(
      "div",
      { style: CFG_ROW_STYLE },
      React.createElement("div", { style: CFG_LABEL_STYLE }, label),
      control,
      hint
        ? React.createElement(
            Text,
            { type: "secondary", style: CFG_HINT_STYLE },
            hint,
          )
        : null,
    );

  // Helper: a 2-column row with two labelled fields
  const fieldPair = (
    label1: string,
    control1: any,
    label2: string,
    control2: any,
  ) =>
    React.createElement(
      "div",
      { style: CFG_GRID_2COL_STYLE },
      React.createElement(
        "div",
        null,
        React.createElement("div", { style: CFG_LABEL_STYLE }, label1),
        control1,
      ),
      React.createElement(
        "div",
        null,
        React.createElement("div", { style: CFG_LABEL_STYLE }, label2),
        control2,
      ),
    );

  const { Divider } = getHost().antd;

  return React.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "基本设置"),
    field(
      "启用心跳",
      React.createElement(Switch, {
        checked: enabled,
        onChange: (v: boolean) => setEnabled(v),
      }),
      enabled ? "已启用，专家将定期自检" : "已停用",
    ),
    fieldPair(
      "检查频率",
      React.createElement(
        Space,
        null,
        React.createElement(InputNumber, {
          min: 1,
          value: everyNumber,
          onChange: (v: number | null) => setEveryNumber(v ?? 1),
          style: { width: "100%" },
        }),
        React.createElement(Select, {
          value: everyUnit,
          onChange: (v: "m" | "h") => setEveryUnit(v),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" },
          ],
        }),
      ),
      "心跳目标",
      React.createElement(Select, {
        value: target,
        onChange: (v: string) => setTarget(v),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" },
        ],
      }),
    ),
    field(
      "超时时间 (秒)",
      React.createElement(InputNumber, {
        min: 1,
        max: 3600,
        value: timeoutSeconds,
        onChange: (v: number | null) => setTimeoutSeconds(v ?? 300),
        style: { width: 200 },
      }),
    ),

    // ── Section: 活跃时段 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "活跃时段"),
    field(
      "启用活跃时段限制",
      React.createElement(Switch, {
        checked: useActiveHours,
        onChange: (v: boolean) => setUseActiveHours(v),
      }),
      "仅在指定时段内触发心跳",
    ),
    useActiveHours
      ? fieldPair(
          "开始时间",
          React.createElement("input", {
            type: "time",
            value: activeHoursStart,
            onChange: (e: any) => setActiveHoursStart(e.target.value),
            style: {
              width: "100%",
              padding: "4px 11px",
              borderRadius: 6,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            },
          }),
          "结束时间",
          React.createElement("input", {
            type: "time",
            value: activeHoursEnd,
            onChange: (e: any) => setActiveHoursEnd(e.target.value),
            style: {
              width: "100%",
              padding: "4px 11px",
              borderRadius: 6,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            },
          }),
        )
      : null,

    // ── Action buttons ──
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 16,
          gap: 8,
        },
      },
      React.createElement(
        Button,
        {
          type: "primary",
          icon: SaveOutlined ? React.createElement(SaveOutlined) : undefined,
          loading: saving,
          onClick: handleSave,
          style: PRIMARY_BTN_STYLE,
        },
        "保存配置",
      ),
      React.createElement(
        Button,
        {
          icon: PlayCircleOutlined
            ? React.createElement(PlayCircleOutlined)
            : undefined,
          loading: running,
          onClick: handleRunNow,
        },
        "立即执行",
      ),
    ),
  );
}

/** Skills configuration tab — list, enable/disable, add from pool, delete. */
export function SkillsConfigTab({
  agentId,
  onRefresh,
}: {
  agentId: string;
  onRefresh: () => void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    List,
    Tag,
    Switch,
    Button,
    Empty,
    Spin,
    Typography,
    message: antdMsg,
  } = getHost().antd;
  const { PlusOutlined, ReloadOutlined, DeleteOutlined } =
    getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [skills, setSkills] = useState<SkillSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [poolSkills, setPoolSkills] = useState<PoolSkillSpec[]>([]);
  const [poolLoading, setPoolLoading] = useState(false);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgentSkills(agentId);
      setSkills(data);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能失败");
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleOpenPicker = async () => {
    setPickerOpen(true);
    setPoolLoading(true);
    try {
      const pool = await fetchPoolSkills(true);
      setPoolSkills(pool);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能池失败");
    } finally {
      setPoolLoading(false);
    }
  };

  const handleBatchInstall = async (skillNames: string[]) => {
    let ok = 0;
    let fail = 0;
    for (const name of skillNames) {
      try {
        await installSkillFromPool(agentId, name);
        ok++;
      } catch {
        fail++;
      }
    }
    if (ok > 0) {
      antdMsg.success(
        `成功添加 ${ok} 个技能${fail > 0 ? `，${fail} 个失败` : ""}`,
      );
      loadSkills();
      onRefresh();
    } else if (fail > 0) {
      antdMsg.error("添加技能失败");
    }
    setPickerOpen(false);
  };

  const handleToggle = async (skill: SkillSpec, enable: boolean) => {
    try {
      if (enable) {
        await enableSkillForAgent(agentId, skill.name);
      } else {
        await disableSkillForAgent(agentId, skill.name);
      }
      antdMsg.success(enable ? "已启用" : "已停用");
      loadSkills();
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "操作失败");
    }
  };

  const handleDelete = async (skillName: string) => {
    try {
      await deleteSkillForAgent(agentId, skillName);
      antdMsg.success(`技能「${skillName}」已移除`);
      loadSkills();
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "移除技能失败");
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      React.createElement(Spin, { size: "large" }),
    );
  }

  const enabledSkills = skills.filter((s) => s.enabled !== false);

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
          marginBottom: 12,
        },
      },
      React.createElement(
        Text,
        { strong: true },
        `技能列表 (${skills.length}，已启用 ${enabledSkills.length})`,
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement(
          Button,
          {
            size: "small",
            icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined,
            onClick: () => { clearApiCache(); loadSkills(); },
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            size: "small",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: handleOpenPicker,
            style: PRIMARY_BTN_STYLE,
          },
          "从技能池添加",
        ),
      ),
    ),
    skills.length === 0
      ? React.createElement(Empty, {
          description: "该专家暂无技能",
          image: Empty.PRESENTED_IMAGE_SIMPLE,
        })
      : React.createElement(List, {
          dataSource: skills,
          renderItem: (skill: SkillSpec) =>
            React.createElement(
              List.Item,
              {
                actions: [
                  React.createElement(Switch, {
                    key: "toggle",
                    size: "small",
                    checked: skill.enabled !== false,
                    onChange: (v: boolean) => handleToggle(skill, v),
                  }),
                  React.createElement(
                    Button,
                    {
                      key: "del",
                      type: "link",
                      size: "small",
                      danger: true,
                      icon: DeleteOutlined
                        ? React.createElement(DeleteOutlined)
                        : undefined,
                      onClick: () => handleDelete(skill.name),
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
              ),
            ),
        }),
    React.createElement(SkillPickerModal, {
      open: pickerOpen,
      onClose: () => setPickerOpen(false),
      poolSkills,
      installedSkillNames: skills.map((s) => s.name),
      loading: poolLoading,
      onInstall: handleBatchInstall,
    }),
  );
}

/** MCP configuration tab — list, toggle, delete, create via JSON import. */
export function MCPConfigTab({
  agentId,
  onRefresh,
  isActive,
}: {
  agentId: string;
  onRefresh: () => void;
  isActive: boolean;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    List,
    Tag,
    Button,
    Empty,
    Spin,
    Modal,
    Input,
    Typography,
    message: antdMsg,
  } = getHost().antd;
  const { PlusOutlined, ReloadOutlined, DeleteOutlined } =
    getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;
  const { TextArea } = Input;

  const [mcps, setMcps] = useState<MCPClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`);
  const [creating, setCreating] = useState(false);

  const loadMCPs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgentMCPClients(agentId);
      setMcps(data);
    } catch (err: any) {
      antdMsg.error(err.message || "加载 MCP 失败");
      setMcps([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadMCPs();
  }, [loadMCPs]);

  // Refresh MCP data when this tab becomes active so that
  // changes made externally (e.g. in the Agent MCP page) are reflected.
  useEffect(() => {
    if (isActive) {
      loadMCPs();
    }
  }, [isActive, loadMCPs]);

  const handleToggle = async (key: string) => {
    try {
      await toggleMCPForAgent(agentId, key);
      antdMsg.success("已切换 MCP 状态");
      loadMCPs();
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "切换失败");
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteMCPForAgent(agentId, key);
      antdMsg.success(`MCP「${key}」已移除`);
      loadMCPs();
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "移除 MCP 失败");
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const parsed = JSON.parse(jsonInput);
      const servers = parsed.mcpServers || parsed;
      const entries = Object.entries(servers);
      if (entries.length === 0) {
        antdMsg.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [clientKey, cfg] of entries) {
        const clientCfg = cfg as Record<string, unknown>;
        const transport = clientCfg.url
          ? "streamable_http"
          : "stdio";
        await createMCPForAgent(agentId, {
          client_key: clientKey,
          client: {
            name: (clientCfg.name as string) || clientKey,
            description: (clientCfg.description as string) || "",
            enabled: true,
            transport,
            url: (clientCfg.url as string) || "",
            command: (clientCfg.command as string) || "",
            args: clientCfg.args || [],
            env: clientCfg.env || {},
            cwd: (clientCfg.cwd as string) || "",
            headers: clientCfg.headers || {},
          },
        });
      }
      antdMsg.success("MCP 客户端已创建");
      setCreateOpen(false);
      loadMCPs();
      onRefresh();
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        antdMsg.error("JSON 格式错误：" + err.message);
      } else {
        antdMsg.error(err.message || "创建 MCP 失败");
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      React.createElement(Spin, { size: "large" }),
    );
  }

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
          marginBottom: 12,
        },
      },
      React.createElement(Text, { strong: true }, `MCP 客户端 (${mcps.length})`),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement(
          Button,
          {
            size: "small",
            icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined,
            onClick: () => { clearApiCache(); loadMCPs(); },
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            size: "small",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: () => setCreateOpen(true),
            style: PRIMARY_BTN_STYLE,
          },
          "添加 MCP",
        ),
      ),
    ),
    mcps.length === 0
      ? React.createElement(Empty, {
          description: "该专家暂无 MCP 客户端",
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
                      key: "toggle",
                      size: "small",
                      onClick: () => handleToggle(mcp.key),
                    },
                    mcp.enabled ? "停用" : "启用",
                  ),
                  React.createElement(
                    Button,
                    {
                      key: "del",
                      type: "link",
                      size: "small",
                      danger: true,
                      icon: DeleteOutlined
                        ? React.createElement(DeleteOutlined)
                        : undefined,
                      onClick: () => handleDelete(mcp.key),
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
                  React.createElement("span", { style: { fontSize: 14 } }, "🔌"),
                  React.createElement(Text, { strong: true }, mcp.name || mcp.key),
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
                      { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
                      `提供 ${mcp.tools.length} 个工具`,
                    )
                  : null,
              ),
            ),
        }),
    // Create MCP modal
    React.createElement(
      Modal,
      {
        open: createOpen,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => setCreateOpen(false),
        onOk: handleCreate,
        confirmLoading: creating,
        okText: "创建",
        width: 560,
      },
      React.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区：",
      ),
      React.createElement(TextArea, {
        value: jsonInput,
        onChange: (e: any) => setJsonInput(e.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 },
      }),
    ),
  );
}

/** Running configuration tab — fetches/saves /workspace/running-config. */
export function RunningConfigTab({ agentId }: { agentId: string }) {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useRef } = React;
  const {
    Card,
    InputNumber,
    Input,
    Select,
    Switch,
    Button,
    Spin,
    Space,
    Typography,
    Divider,
    message: antdMsg,
  } = getHost().antd;
  const { SaveOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const originalRef = useRef<AgentsRunningConfig | null>(null);

  // ── Basic settings ──
  const [shellTimeout, setShellTimeout] = useState(60);
  const [shellExecutable, setShellExecutable] = useState("");
  const [autoTitleEnabled, setAutoTitleEnabled] = useState(true);
  const [autoTitleTimeout, setAutoTitleTimeout] = useState(30);
  const [language, setLanguage] = useState("zh");
  const [timezone, setTimezone] = useState("UTC");

  // ── Iteration & Loop ──
  const [iterEnabled, setIterEnabled] = useState(true);
  const [maxIters, setMaxIters] = useState(100);
  const [doomLoopEnabled, setDoomLoopEnabled] = useState(true);
  const [doomWindowSize, setDoomWindowSize] = useState(3);
  const [doomSimilarity, setDoomSimilarity] = useState(1.0);

  // ── LLM Retry ──
  const [llmRetryEnabled, setLlmRetryEnabled] = useState(true);
  const [llmMaxRetries, setLlmMaxRetries] = useState(3);
  const [llmBackoffBase, setLlmBackoffBase] = useState(2);
  const [llmBackoffCap, setLlmBackoffCap] = useState(60);

  // ── LLM Rate Limiter ──
  const [llmMaxConcurrent, setLlmMaxConcurrent] = useState(1);
  const [llmMaxQpm, setLlmMaxQpm] = useState(0);
  const [llmRateLimitPause, setLlmRateLimitPause] = useState(1);
  const [llmRateLimitJitter, setLlmRateLimitJitter] = useState(0);
  const [llmAcquireTimeout, setLlmAcquireTimeout] = useState(30);

  // ── Context & Memory ──
  const [historyMaxLength, setHistoryMaxLength] = useState(50);
  const [contextBackend, setContextBackend] = useState("light");
  const [contextStrategy, setContextStrategy] = useState("scroll");
  const [memoryBackend, setMemoryBackend] = useState("remelight");

  // ── Approval ──
  const [approvalLevel, setApprovalLevel] = useState("AUTO");

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [config, lang, tz] = await Promise.all([
        fetchRunningConfig(agentId),
        fetchAgentLanguage(agentId).catch(() => "zh"),
        fetchUserTimezone().catch(() => "UTC"),
      ]);
      originalRef.current = config;
      // Basic
      setShellTimeout(config.shell_command_timeout ?? 60);
      setShellExecutable(config.shell_command_executable ?? "");
      const atc = config.auto_title_config ?? { enabled: true, timeout_seconds: 30 };
      setAutoTitleEnabled(atc.enabled ?? true);
      setAutoTitleTimeout(atc.timeout_seconds ?? 30);
      setLanguage(lang);
      setTimezone(tz);
      // Iteration & Loop
      const loop = config.loop ?? {};
      setIterEnabled(loop.iteration?.enabled ?? true);
      setMaxIters(loop.iteration?.max_iterations ?? config.max_iters ?? 100);
      setDoomLoopEnabled(loop.doom_loop?.enabled ?? true);
      setDoomWindowSize(loop.doom_loop?.window_size ?? 3);
      setDoomSimilarity(loop.doom_loop?.similarity_threshold ?? 1.0);
      // LLM Retry
      setLlmRetryEnabled(config.llm_retry_enabled ?? true);
      setLlmMaxRetries(config.llm_max_retries ?? 3);
      setLlmBackoffBase(config.llm_backoff_base ?? 2);
      setLlmBackoffCap(config.llm_backoff_cap ?? 60);
      // LLM Rate Limiter
      setLlmMaxConcurrent(config.llm_max_concurrent ?? 1);
      setLlmMaxQpm(config.llm_max_qpm ?? 0);
      setLlmRateLimitPause(config.llm_rate_limit_pause ?? 1);
      setLlmRateLimitJitter(config.llm_rate_limit_jitter ?? 0);
      setLlmAcquireTimeout(config.llm_acquire_timeout ?? 30);
      // Context & Memory
      setHistoryMaxLength(config.history_max_length ?? 50);
      setContextBackend(config.context_manager_backend ?? "light");
      setContextStrategy(config.light_context_config?.strategy ?? "scroll");
      setMemoryBackend(config.memory_manager_backend ?? "remelight");
      // Approval
      setApprovalLevel(config.approval_level ?? "AUTO");
    } catch (err: any) {
      antdMsg.error(err.message || "加载运行配置失败");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    const original = originalRef.current;
    if (!original) return;
    setSaving(true);
    try {
      const configToSave: AgentsRunningConfig = {
        ...original,
        max_iters: maxIters,
        loop: {
          ...(original.loop ?? {}),
          iteration: { enabled: iterEnabled, max_iterations: maxIters },
          doom_loop: {
            enabled: doomLoopEnabled,
            window_size: doomWindowSize,
            similarity_threshold: doomSimilarity,
            stages: original.loop?.doom_loop?.stages ?? [],
          },
        },
        shell_command_timeout: shellTimeout,
        shell_command_executable: shellExecutable,
        auto_title_config: {
          enabled: autoTitleEnabled,
          timeout_seconds: autoTitleTimeout,
        },
        llm_retry_enabled: llmRetryEnabled,
        llm_max_retries: llmMaxRetries,
        llm_backoff_base: llmBackoffBase,
        llm_backoff_cap: llmBackoffCap,
        llm_max_concurrent: llmMaxConcurrent,
        llm_max_qpm: llmMaxQpm,
        llm_rate_limit_pause: llmRateLimitPause,
        llm_rate_limit_jitter: llmRateLimitJitter,
        llm_acquire_timeout: llmAcquireTimeout,
        history_max_length: historyMaxLength,
        context_manager_backend: contextBackend,
        light_context_config: {
          ...(original.light_context_config ?? {}),
          strategy: contextStrategy,
        },
        memory_manager_backend: memoryBackend,
        approval_level: approvalLevel,
      };
      await updateRunningConfig(agentId, configToSave);
      originalRef.current = configToSave;

      // Also save language and timezone (separate endpoints)
      if (language) await updateAgentLanguage(agentId, language).catch(() => {});
      if (timezone) await updateUserTimezone(timezone).catch(() => {});

      antdMsg.success("运行配置已保存");
    } catch (err: any) {
      antdMsg.error(err.message || "保存运行配置失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      React.createElement(Spin, { size: "large" }),
    );
  }

  // Helper: a labelled form field row
  const field = (
    label: string,
    control: any,
    hint?: string,
  ) =>
    React.createElement(
      "div",
      { style: CFG_ROW_STYLE },
      React.createElement("div", { style: CFG_LABEL_STYLE }, label),
      control,
      hint
        ? React.createElement(
            Text,
            { type: "secondary", style: CFG_HINT_STYLE },
            hint,
          )
        : null,
    );

  // Helper: a 2-column row with two labelled fields
  const fieldPair = (
    label1: string,
    control1: any,
    label2: string,
    control2: any,
  ) =>
    React.createElement(
      "div",
      { style: CFG_GRID_2COL_STYLE },
      React.createElement(
        "div",
        null,
        React.createElement("div", { style: CFG_LABEL_STYLE }, label1),
        control1,
      ),
      React.createElement(
        "div",
        null,
        React.createElement("div", { style: CFG_LABEL_STYLE }, label2),
        control2,
      ),
    );

  return React.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    React.createElement(
      "div",
      { style: CFG_SECTION_TITLE_STYLE },
      "基础设置",
    ),
    fieldPair(
      "Shell 命令超时 (秒)",
      React.createElement(InputNumber, {
        min: 1,
        value: shellTimeout,
        onChange: (v: number | null) => setShellTimeout(v ?? 60),
        style: { width: "100%" },
      }),
      "Shell 可执行文件",
      React.createElement(Input, {
        value: shellExecutable,
        onChange: (e: any) => setShellExecutable(e.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" },
      }),
    ),
    fieldPair(
      "语言",
      React.createElement(Select, {
        value: language,
        onChange: (v: string) => setLanguage(v),
        style: { width: "100%" },
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "ru", label: "Русский" },
        ],
      }),
      "时区",
      React.createElement(Select, {
        value: timezone,
        onChange: (v: string) => setTimezone(v),
        style: { width: "100%" },
        showSearch: true,
        filterOption: (input: string, option: any) =>
          (option?.label?.toString() || "")
            .toLowerCase()
            .includes(input.toLowerCase()),
        options: [
          "UTC",
          "Asia/Shanghai",
          "Asia/Tokyo",
          "Asia/Singapore",
          "Asia/Kolkata",
          "Europe/London",
          "Europe/Paris",
          "America/New_York",
          "America/Los_Angeles",
          "America/Chicago",
          "Australia/Sydney",
        ].map((tz) => ({ value: tz, label: tz })),
      }),
    ),
    fieldPair(
      "自动生成会话标题",
      React.createElement(Space, null, React.createElement(Switch, {
        checked: autoTitleEnabled,
        onChange: (v: boolean) => setAutoTitleEnabled(v),
      })),
      "标题生成超时 (秒)",
      React.createElement(InputNumber, {
        min: 5,
        value: autoTitleTimeout,
        onChange: (v: number | null) => setAutoTitleTimeout(v ?? 30),
        style: { width: "100%" },
        disabled: !autoTitleEnabled,
      }),
    ),

    // ── Section: 审批级别 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "审批级别"),
    field(
      "工具执行审批",
      React.createElement(Select, {
        value: approvalLevel,
        onChange: (v: string) => setApprovalLevel(v),
        style: { width: "100%" },
        options: [
          { value: "STRICT", label: "严格 (STRICT) — 每次工具调用需审批" },
          { value: "SMART", label: "智能 (SMART) — 高风险操作需审批" },
          { value: "AUTO", label: "自动 (AUTO) — 自动执行" },
          { value: "OFF", label: "关闭 (OFF) — 无限制" },
        ],
      }),
    ),

    // ── Section: 迭代与循环 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "迭代与循环"),
    field(
      "启用迭代限制",
      React.createElement(Switch, {
        checked: iterEnabled,
        onChange: (v: boolean) => setIterEnabled(v),
      }),
      "停止 Agent 前的最大循环轮次",
    ),
    iterEnabled
      ? field(
          "最大迭代次数",
          React.createElement(InputNumber, {
            min: 1,
            max: 500,
            value: maxIters,
            onChange: (v: number | null) => setMaxIters(v ?? 100),
            style: { width: "100%" },
          }),
        )
      : null,
    field(
      "启用重复循环保护",
      React.createElement(Switch, {
        checked: doomLoopEnabled,
        onChange: (v: boolean) => setDoomLoopEnabled(v),
      }),
      "检测并阻止重复操作循环",
    ),
    doomLoopEnabled
      ? fieldPair(
          "检测窗口大小",
          React.createElement(InputNumber, {
            min: 2,
            max: 20,
            value: doomWindowSize,
            onChange: (v: number | null) => setDoomWindowSize(v ?? 3),
            style: { width: "100%" },
          }),
          "相似度阈值",
          React.createElement(InputNumber, {
            min: 0,
            max: 1,
            step: 0.05,
            value: doomSimilarity,
            onChange: (v: number | null) => setDoomSimilarity(v ?? 1.0),
            style: { width: "100%" },
          }),
        )
      : null,

    // ── Section: LLM 重试 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "LLM 重试"),
    field(
      "启用 LLM 重试",
      React.createElement(Switch, {
        checked: llmRetryEnabled,
        onChange: (v: boolean) => setLlmRetryEnabled(v),
      }),
    ),
    fieldPair(
      "最大重试次数",
      React.createElement(InputNumber, {
        min: 1,
        value: llmMaxRetries,
        onChange: (v: number | null) => setLlmMaxRetries(v ?? 3),
        style: { width: "100%" },
        disabled: !llmRetryEnabled,
      }),
      "退避基数 (秒)",
      React.createElement(InputNumber, {
        min: 0.1,
        step: 0.1,
        value: llmBackoffBase,
        onChange: (v: number | null) => setLlmBackoffBase(v ?? 2),
        style: { width: "100%" },
        disabled: !llmRetryEnabled,
      }),
    ),
    field(
      "退避上限 (秒)",
      React.createElement(InputNumber, {
        min: 0.5,
        step: 0.5,
        value: llmBackoffCap,
        onChange: (v: number | null) => setLlmBackoffCap(v ?? 60),
        style: { width: 200 },
        disabled: !llmRetryEnabled,
      }),
    ),

    // ── Section: LLM 限流 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "LLM 限流"),
    fieldPair(
      "最大并发数",
      React.createElement(InputNumber, {
        min: 1,
        value: llmMaxConcurrent,
        onChange: (v: number | null) => setLlmMaxConcurrent(v ?? 1),
        style: { width: "100%" },
      }),
      "最大 QPM (0=不限)",
      React.createElement(InputNumber, {
        min: 0,
        step: 10,
        value: llmMaxQpm,
        onChange: (v: number | null) => setLlmMaxQpm(v ?? 0),
        style: { width: "100%" },
      }),
    ),
    fieldPair(
      "限流暂停时间 (秒)",
      React.createElement(InputNumber, {
        min: 1.0,
        step: 0.5,
        value: llmRateLimitPause,
        onChange: (v: number | null) => setLlmRateLimitPause(v ?? 1),
        style: { width: "100%" },
      }),
      "限流抖动 (秒)",
      React.createElement(InputNumber, {
        min: 0.0,
        step: 0.5,
        value: llmRateLimitJitter,
        onChange: (v: number | null) => setLlmRateLimitJitter(v ?? 0),
        style: { width: "100%" },
      }),
    ),
    field(
      "获取超时 (秒)",
      React.createElement(InputNumber, {
        min: 10.0,
        step: 10,
        value: llmAcquireTimeout,
        onChange: (v: number | null) => setLlmAcquireTimeout(v ?? 30),
        style: { width: 200 },
      }),
      "应大于 限流暂停 + 抖动",
    ),

    // ── Section: 上下文与记忆 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "上下文与记忆"),
    fieldPair(
      "上下文管理后端",
      React.createElement(Select, {
        value: contextBackend,
        onChange: (v: string) => setContextBackend(v),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }],
      }),
      "上下文策略",
      React.createElement(Select, {
        value: contextStrategy,
        onChange: (v: string) => setContextStrategy(v),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" },
        ],
      }),
    ),
    fieldPair(
      "记忆管理后端",
      React.createElement(Select, {
        value: memoryBackend,
        onChange: (v: string) => setMemoryBackend(v),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" },
        ],
      }),
      "历史消息最大长度",
      React.createElement(InputNumber, {
        min: 1,
        value: historyMaxLength,
        onChange: (v: number | null) => setHistoryMaxLength(v ?? 50),
        style: { width: "100%" },
      }),
    ),

    // ── Save button ──
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      React.createElement(
        Button,
        {
          type: "primary",
          icon: SaveOutlined ? React.createElement(SaveOutlined) : undefined,
          loading: saving,
          onClick: handleSave,
          style: PRIMARY_BTN_STYLE,
        },
        "保存运行配置",
      ),
    ),
  );
}

/**
 * Expert configuration modal with 5 tabs: Heartbeat, Files, Skills, MCP,
 * Running Config. All API calls use X-Agent-Id to target the expert's
 * workspace. The Files tab reuses the existing KnowledgeBaseTab component.
 */
export function ExpertConfigModal({
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
  const { useState, useEffect, useCallback } = React;
  const { Modal, Tabs, Spin, Typography } = getHost().antd;
  const { SettingOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  // System prompt files for the Files tab (KnowledgeBaseTab needs them as prop)
  const [promptFiles, setPromptFiles] = useState<string[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("heartbeat");

  const loadPromptFiles = useCallback(async () => {
    if (!expert) return;
    setFilesLoading(true);
    try {
      const files = await fetchSystemPromptFiles(expert.agent.id);
      setPromptFiles(files);
    } catch {
      setPromptFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, [expert]);

  useEffect(() => {
    if (open && expert) {
      loadPromptFiles();
    }
  }, [open, expert, loadPromptFiles]);

  if (!expert) return null;

  const { agent } = expert;

  const handleFilesRefresh = () => {
    loadPromptFiles();
    onRefresh();
  };

  const tabItems = [
    {
      key: "heartbeat",
      label: "心跳",
      children: React.createElement(HeartbeatConfigTab, {
        agentId: agent.id,
      }),
    },
    {
      key: "files",
      label: "文件",
      children: filesLoading
        ? React.createElement(
            "div",
            { style: { textAlign: "center", padding: 40 } },
            React.createElement(Spin, { size: "large" }),
          )
        : React.createElement(KnowledgeBaseTab, {
            agentId: agent.id,
            systemPromptFiles: promptFiles,
            onRefresh: handleFilesRefresh,
          }),
    },
    {
      key: "skills",
      label: `技能 (${expert.skills.filter((s) => s.enabled !== false).length})`,
      children: React.createElement(SkillsConfigTab, {
        agentId: agent.id,
        onRefresh,
      }),
    },
    {
      key: "mcp",
      label: `MCP (${expert.mcps.length})`,
      children: React.createElement(MCPConfigTab, {
        agentId: agent.id,
        onRefresh,
        isActive: activeTab === "mcp",
      }),
    },
    {
      key: "running",
      label: "运行配置",
      children: React.createElement(RunningConfigTab, {
        agentId: agent.id,
      }),
    },
  ];

  return React.createElement(
    Modal,
    {
      open,
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        SettingOutlined
          ? React.createElement(SettingOutlined, { style: { fontSize: 18 } })
          : null,
        React.createElement("span", null, `配置 - ${agent.name}`),
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          agent.id,
        ),
      ),
      onCancel: onClose,
      footer: null,
      width: 800,
      centered: true,
      styles: {
        body: {
          height: "min(520px, calc(100vh - 280px))",
          overflowY: "auto",
          overflowX: "hidden",
        },
      },
    },
    React.createElement(Tabs, {
      items: tabItems,
      activeKey: activeTab,
      onChange: (k: string) => setActiveTab(k),
      size: "small",
      tabBarStyle: { marginBottom: 16 },
    }),
  );
}
