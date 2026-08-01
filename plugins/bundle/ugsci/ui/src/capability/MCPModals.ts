/**
 * MCP Access Modal and OAuth Modal components.
 */

import { getHost } from "../core/runtime";
import { PRIMARY_BTN_STYLE } from "../core/shared";
import type { MCPClientInfo, MCPAccessPolicy, MCPAccessPrincipalOption, MCPToolInfo, MCPAccessEffect, MCPAccessRule, MCPAccessSourceType, MCPAccessSubjectType, MCPToolAccessOverride } from "../core/types";
import {
  listMCPToolsForCapabilities,
  getMCPPolicyForCapabilities,
  updateMCPPolicyForCapabilities,
  listMCPAccessPrincipalsForCapabilities,
  startMCPOAuthForCapabilities,
  getMCPOAuthStatusForCapabilities,
  revokeMCPOAuthForCapabilities,
} from "../core/api";
import {
  normalizeMCPAccessPolicy,
  normalizeMCPAccessRule,
  normalizeMCPToolRule,
  normalizeMCPToolDefault,
  normalizeSourceType,
  normalizeSourceValue,
  normalizeSubjectType,
  isWildcardSourceValue,
  sortAccessRules,
  sortToolRules,
  sortToolDefaults,
  accessRuleIdentityKey,
  toolRuleIdentityKey,
  buildMCPAccessToolGroups,
  nextDefaultSourceValue,
  addClientRule,
  addToolRule,
  upsertClientRule,
  upsertToolRule,
  upsertToolDefault,
  removeClientRule,
  removeToolRule,
  filterPrincipalOptionsForRule,
  buildSubjectValueOptions,
  ruleHasAmbiguousUserSource,
  ruleHasUnknownUserValue,
  validateMCPAccessPolicy,
  withRuleDefaults,
  policySignature,
  type MCPAccessToolGroup,
  MCP_CHANNEL_SOURCE_VALUES,
  CHANNEL_SOURCE_LABELS,
} from "./mcpAccessPolicy";

export function UGSciMCPAccessModal({
  client,
  agentId,
  open,
  onClose,
  onSave,
}: {
  client: MCPClientInfo;
  agentId: string;
  open: boolean;
  onClose: () => void;
  onSave: (key: string, policy: MCPAccessPolicy) => Promise<boolean>;
}) {
  const React = getHost().React;
  const { useState, useEffect, useMemo, useCallback } = React;
  const { Modal, Spin, Empty, Button, Tag, Segmented, Select, Input, AutoComplete, Typography, message: antdMsg } = getHost().antd;
  const { PlusOutlined, DeleteOutlined, ReloadOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [policy, setPolicy] = useState<MCPAccessPolicy | null>(null);
  const [tools, setTools] = useState<MCPToolInfo[]>([]);
  const [principalOptions, setPrincipalOptions] = useState<MCPAccessPrincipalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toolsError, setToolsError] = useState("");
  const [toolsLoading, setToolsLoading] = useState(false);
  const [initialSig, setInitialSig] = useState("");

  // ── Reload tools (manual refresh / retry after 503) ──
  const reloadTools = useCallback(async () => {
    if (!client.enabled) { setToolsError("MCP 客户端未启用，无法获取工具列表"); return; }
    setToolsLoading(true); setToolsError("");
    try {
      const t = await listMCPToolsForCapabilities(agentId, client.key);
      setTools(t);
    } catch (err: any) {
      setToolsError(err?.message || "无法加载工具列表");
      setTools([]);
    } finally {
      setToolsLoading(false);
    }
  }, [agentId, client.key, client.enabled]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true); setTools([]); setPrincipalOptions([]); setToolsError("");
      try {
        const savedPolicy = await getMCPPolicyForCapabilities(agentId, client.key);
        if (!cancelled) {
          const normalized = normalizeMCPAccessPolicy(savedPolicy);
          setPolicy(normalized);
          setInitialSig(policySignature(normalized));
        }
        try {
          const principals = await listMCPAccessPrincipalsForCapabilities(agentId);
          if (!cancelled) setPrincipalOptions(principals);
        } catch { if (!cancelled) setPrincipalOptions([]); }
        // Tools are NOT loaded automatically — user clicks "刷新工具" to fetch.
        // This avoids 503 errors when the MCP client is still connecting.
      } catch { if (!cancelled) { setPolicy(null); setInitialSig(""); setToolsError("加载访问策略失败"); } }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [open, client.key, client.enabled, agentId]);

  const groups = useMemo(() => policy ? buildMCPAccessToolGroups(tools, policy) : [], [tools, policy]);
  const isDirty = useMemo(() => Boolean(policy && policySignature(policy) !== initialSig), [policy, initialSig]);

  const channelLabel = (v: string) => CHANNEL_SOURCE_LABELS[v] || v;

  const setDefaultEffect = useCallback((e: MCPAccessEffect) => {
    setPolicy((prev: MCPAccessPolicy | null) => prev ? { ...prev, default_effect: e } : prev);
  }, []);

  const updateClientRule = useCallback((rule: MCPAccessRule, patch: Partial<MCPAccessRule>) => {
    setPolicy((prev: MCPAccessPolicy | null) => prev ? upsertClientRule(prev, withRuleDefaults(rule, patch), { source_type: rule.source_type, source_value: rule.source_value, subject_type: rule.subject_type, subject_value: rule.subject_value }) : prev);
  }, []);

  const updateToolRule = useCallback((rule: MCPToolAccessOverride, patch: Partial<MCPAccessRule>) => {
    setPolicy((prev: MCPAccessPolicy | null) => prev ? upsertToolRule(prev, withRuleDefaults(rule, patch) as MCPToolAccessOverride, { tool_name: rule.tool_name, source_type: rule.source_type, source_value: rule.source_value, subject_type: rule.subject_type, subject_value: rule.subject_value }) : prev);
  }, []);

  const handleSave = useCallback(async () => {
    if (!policy) return;
    const err = validateMCPAccessPolicy(policy);
    if (err) { antdMsg.error(err.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确"); return; }
    setSaving(true);
    try {
      const ok = await onSave(client.key, policy);
      if (ok) { setInitialSig(policySignature(policy)); onClose(); }
    } finally { setSaving(false); }
  }, [policy, client.key, onSave, onClose, antdMsg]);

  const handleClose = useCallback(() => {
    if (!isDirty || saving) { onClose(); return; }
    Modal.confirm({
      title: "放弃修改", content: "确定要放弃未保存的修改吗？",
      okText: "确认", cancelText: "取消", onOk: onClose,
    });
  }, [isDirty, saving, onClose]);

  // ── Rule row renderer ──
  const renderRuleRow = useCallback((rule: MCPAccessRule | MCPToolAccessOverride, isToolRule: boolean) => {
    const subjectValueOptions = buildSubjectValueOptions(principalOptions, rule);
    const hasAmbiguous = ruleHasAmbiguousUserSource(rule);
    const hasUnknown = ruleHasUnknownUserValue(principalOptions, rule);
    const sourceValueOpts = [{ label: "所有渠道", value: "*" }, ...MCP_CHANNEL_SOURCE_VALUES.map(v => ({ label: channelLabel(v), value: v }))];
    const subjectTypeOpts = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }];
    const updateRule = (patch: Partial<MCPAccessRule>) => {
      if (isToolRule) {
        updateToolRule(rule as MCPToolAccessOverride, patch);
      } else {
        updateClientRule(rule, patch);
      }
    };
    const setEffect = (e: MCPAccessEffect) => {
      if (isToolRule) {
        setPolicy((prev: MCPAccessPolicy | null) => prev ? upsertToolRule(prev, { ...(rule as MCPToolAccessOverride), effect: e }) : prev);
      } else {
        setPolicy((prev: MCPAccessPolicy | null) => prev ? upsertClientRule(prev, { ...rule, effect: e }) : prev);
      }
    };
    const deleteFn = () => {
      if (isToolRule) {
        setPolicy((prev: MCPAccessPolicy | null) => prev ? removeToolRule(prev, { tool_name: (rule as MCPToolAccessOverride).tool_name, source_type: rule.source_type, source_value: rule.source_value, subject_type: rule.subject_type, subject_value: rule.subject_value }) : prev);
      } else {
        setPolicy((prev: MCPAccessPolicy | null) => prev ? removeClientRule(prev, { source_type: rule.source_type, source_value: rule.source_value, subject_type: rule.subject_type, subject_value: rule.subject_value }) : prev);
      }
    };
    const key = isToolRule ? toolRuleIdentityKey(rule as MCPToolAccessOverride) : accessRuleIdentityKey(rule);

    return React.createElement(
      "div",
      { key, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      React.createElement("div", null,
        React.createElement(Text, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        React.createElement(Select, {
          size: "small", style: { width: "100%" }, value: rule.source_type || "channel",
          onChange: (v: string) => updateRule({ source_type: v as MCPAccessSourceType, source_value: v === "channel" ? (rule.source_value || "*") : rule.source_value }),
          options: [{ label: "渠道", value: "channel" }, ...(rule.source_type && rule.source_type !== "channel" ? [{ label: rule.source_type, value: rule.source_type }] : [])],
        }),
      ),
      // source_value
      React.createElement("div", null,
        React.createElement(Text, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        rule.source_type === "channel"
          ? React.createElement(Select, { size: "small", style: { width: "100%" }, value: rule.source_value || "*", onChange: (v: string) => updateRule({ source_value: v }), options: sourceValueOpts })
          : React.createElement(Input, { size: "small", placeholder: "来源标识", value: rule.source_value, onChange: (e: any) => updateRule({ source_value: e.target.value }) }),
      ),
      // subject_type
      React.createElement("div", null,
        React.createElement(Text, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        React.createElement(Select, { size: "small", style: { width: "100%" }, value: rule.subject_type, onChange: (v: string) => updateRule({ subject_type: v as MCPAccessSubjectType }), options: subjectTypeOpts }),
      ),
      // subject_value
      React.createElement("div", null,
        React.createElement(Text, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象"),
        rule.subject_type === "user"
          ? React.createElement("div", null,
              React.createElement(AutoComplete, {
                size: "small", style: { width: "100%" }, value: rule.subject_value,
                options: subjectValueOptions,
                placeholder: subjectValueOptions.length > 0 ? "用户 ID" : "无近期用户",
                onChange: (v: string) => updateRule({ subject_value: v }),
                onSelect: (v: string) => updateRule({ subject_value: v }),
                filterOption: (input: string, option: any) => String(option?.value || "").toLowerCase().includes(input.toLowerCase()),
              }),
              hasAmbiguous ? React.createElement(Text, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
              hasUnknown ? React.createElement(Text, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null,
            )
          : React.createElement(Input, { size: "small", disabled: true, value: "所有人" }),
      ),
      // effect
      React.createElement("div", null,
        React.createElement(Text, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        React.createElement(Select, {
          size: "small", style: { width: "100%" }, value: rule.effect,
          onChange: (v: string) => setEffect(v as MCPAccessEffect),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }],
        }),
      ),
      // delete
      React.createElement(Button, { size: "small", type: "text", icon: React.createElement(DeleteOutlined), onClick: deleteFn, title: "删除规则" }),
    );
  }, [principalOptions, updateClientRule, updateToolRule]);

  // ── Segmented for default effect ──
  const renderSegmented = (value: MCPAccessEffect, onChange: (e: MCPAccessEffect) => void) => {
    const colors: Record<MCPAccessEffect, { bg: string; border: string; text: string }> = {
      ask: { bg: "rgba(245,158,11,0.24)", border: "rgba(217,119,6,0.36)", text: "#8a4b00" },
      allow: { bg: "rgba(34,197,94,0.22)", border: "rgba(22,163,74,0.35)", text: "#17643a" },
      deny: { bg: "rgba(239,68,68,0.2)", border: "rgba(220,38,38,0.34)", text: "#9f1f26" },
    };
    const c = colors[value];
    return React.createElement(Segmented, {
      size: "small",
      value,
      onChange: (v: string) => onChange(v as MCPAccessEffect),
      style: { "--mcp-policy-segment-bg": c.bg, "--mcp-policy-segment-border": c.border, "--mcp-policy-segment-text": c.text } as any,
      options: [{ label: "询问", value: "ask" }, { label: "允许", value: "allow" }, { label: "拒绝", value: "deny" }],
    });
  };

  return React.createElement(
    Modal,
    {
      title: `${client.name || client.key} - 工具与访问策略`,
      open,
      onCancel: handleClose,
      width: "min(1040px, calc(100vw - 32px))" as any,
      styles: {
        body: {
          maxHeight: "min(520px, calc(100vh - 280px))",
          overflowY: "auto",
          overflowX: "hidden",
        },
      },
      footer: React.createElement(
        "div",
        { style: { textAlign: "right" } },
        React.createElement(Button, { onClick: handleClose, style: { marginRight: 8 } }, "取消"),
        React.createElement(Button, { type: "primary", onClick: handleSave, loading: saving, disabled: !policy || loading }, "保存"),
      ),
    },
    loading && !policy
      ? React.createElement("div", { style: { textAlign: "center", padding: 40 } }, React.createElement(Spin))
      : policy
        ? React.createElement(
            "div",
            null,
            // ── Client-level panel ──
            React.createElement(
              "div",
              { style: { marginBottom: 16, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" } },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
                React.createElement(Text, { strong: true }, "客户端访问策略"),
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 8 } },
                  React.createElement(Text, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                  renderSegmented(policy.default_effect, setDefaultEffect),
                  React.createElement(Button, { size: "small", icon: React.createElement(PlusOutlined), onClick: () => setPolicy((prev: MCPAccessPolicy | null) => prev ? addClientRule(prev) : prev) }, "添加规则"),
                ),
              ),
              policy.client_overrides.length === 0
                ? React.createElement(Text, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则")
                : React.createElement("div", null, ...policy.client_overrides.map((r) => renderRuleRow(r, false))),
            ),
            // ── Error message with retry button ──
            toolsError
              ? React.createElement(
                  "div",
                  {
                    style: {
                      color: "#ff4d4f",
                      fontSize: 12,
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    },
                  },
                  React.createElement("span", null, toolsError),
                  React.createElement(
                    Button,
                    {
                      size: "small",
                      icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined,
                      onClick: reloadTools,
                      loading: toolsLoading,
                    },
                    "重试",
                  ),
                )
              : null,
            // ── Tool-level panel ──
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
              React.createElement(Text, { strong: true }, "工具访问策略"),
              React.createElement(
                Button,
                {
                  size: "small",
                  type: "text",
                  icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined,
                  onClick: reloadTools,
                  loading: toolsLoading,
                },
                "刷新工具",
              ),
            ),
            groups.length === 0
              ? React.createElement(Empty, {
                  description: toolsLoading ? "正在加载工具..." : "点击「刷新工具」加载工具列表",
                })
              : React.createElement(
                  "div",
                  null,
                  ...groups.map((group) =>
                    React.createElement(
                      "div",
                      { key: group.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
                      React.createElement(
                        "div",
                        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
                        React.createElement(
                          "div",
                          { style: { display: "flex", alignItems: "center", gap: 6 } },
                          React.createElement(Tag, { color: group.stale ? "default" : "blue" }, group.toolName),
                          group.stale ? React.createElement(Tag, { color: "orange" }, "已失效") : null,
                        ),
                        React.createElement(
                          "div",
                          { style: { display: "flex", alignItems: "center", gap: 8 } },
                          React.createElement(Text, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                          renderSegmented(group.defaultEffect, (e) => setPolicy((prev: MCPAccessPolicy | null) => prev ? upsertToolDefault(prev, group.toolName, e) : prev)),
                          React.createElement(Button, { size: "small", icon: React.createElement(PlusOutlined), onClick: () => setPolicy((prev: MCPAccessPolicy | null) => prev ? addToolRule(prev, group.toolName) : prev) }, "添加规则"),
                        ),
                      ),
                      // Tool schema
                      (group.description || (group.inputSchema && Object.keys(group.inputSchema).length > 0))
                        ? React.createElement(
                            "details",
                            { style: { marginBottom: 6, fontSize: 12 } },
                            React.createElement("summary", { style: { cursor: "pointer", color: "#888" } }, "工具详情"),
                            group.description ? React.createElement("div", { style: { padding: "4px 0", color: "#666" } }, group.description) : null,
                            group.inputSchema && Object.keys(group.inputSchema).length > 0
                              ? React.createElement("pre", { style: { background: "#f5f5f5", padding: 8, borderRadius: 4, fontSize: 11, overflow: "auto", maxHeight: 200 } }, JSON.stringify(group.inputSchema, null, 2))
                              : null,
                          )
                        : null,
                      // Tool rules
                      group.rules.length === 0
                        ? React.createElement(Text, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则")
                        : React.createElement("div", null, ...group.rules.map((r) => renderRuleRow(r, true))),
                    )
                  ),
              ),
          )
        : React.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败"),
  );
}

// ── MCP OAuth Modal Component (ported from console MCPOAuthSection) ──

export function UGSciMCPOAuthModal({
  client,
  agentId,
  open,
  onClose,
  onAuthChanged,
}: {
  client: MCPClientInfo;
  agentId: string;
  open: boolean;
  onClose: () => void;
  onAuthChanged: () => void;
}) {
  const React = getHost().React;
  const { useState, useCallback, useEffect } = React;
  const { Modal, Button, Input, Typography, message: antdMsg } = getHost().antd;
  const { Text } = Typography;

  const [phase, setPhase] = useState<"idle" | "starting" | "waiting" | "success" | "error" | "revoking">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clientId, setClientId] = useState(client.oauth_status?.client_id || "");
  const [scope, setScope] = useState(client.oauth_status?.scope || "");
  const [authEndpoint, setAuthEndpoint] = useState("");
  const [tokenEndpoint, setTokenEndpoint] = useState("");

  useEffect(() => {
    if (phase !== "waiting") return;
    const timer = setInterval(async () => {
      try {
        const st = await getMCPOAuthStatusForCapabilities(agentId, client.key);
        if (st.authorized) { setPhase("success"); onAuthChanged(); }
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(timer);
  }, [phase, client.key, agentId, onAuthChanged]);

  const isAuthorized = phase === "success" || (phase === "idle" && client.oauth_status?.authorized === true);
  const isExpired = phase === "idle" && client.oauth_status?.authorized && client.oauth_status.expires_at > 0 && client.oauth_status.expires_at < Date.now() / 1000;

  const handleStart = useCallback(async () => {
    if (!client.url?.trim()) { setErrorMsg("缺少 URL"); return; }
    setPhase("starting"); setErrorMsg("");
    try {
      const resp = await startMCPOAuthForCapabilities(agentId, client.key, {
        url: client.url, scope, client_id: clientId, auth_endpoint: authEndpoint, token_endpoint: tokenEndpoint,
      });
      setPhase("waiting");
      window.open(resp.auth_url, "_blank", "popup,width=600,height=700");
    } catch (err: any) {
      setPhase("error");
      setErrorMsg(err?.message || "OAuth 启动失败");
    }
  }, [agentId, client.key, client.url, scope, clientId, authEndpoint, tokenEndpoint]);

  const handleRevoke = useCallback(async () => {
    setPhase("revoking");
    try {
      await revokeMCPOAuthForCapabilities(agentId, client.key);
      setPhase("idle");
      onAuthChanged();
    } catch { setPhase("idle"); }
  }, [agentId, client.key, onAuthChanged]);

  return React.createElement(
    Modal,
    {
      title: `${client.name || client.key} — OAuth 授权管理`,
      open,
      onCancel: onClose,
      footer: React.createElement("div", { style: { textAlign: "right" } }, React.createElement(Button, { onClick: onClose }, "关闭")),
      width: 560,
    },
    React.createElement(
      "div",
      { style: { background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 8, padding: "12px 14px" } },
      // Status
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 } },
        React.createElement(
          "span",
          { style: { fontSize: 12, padding: "2px 8px", borderRadius: 12, border: "1px solid", color: isExpired ? "#e67e22" : isAuthorized ? "#27ae60" : "#7f8c8d", borderColor: isExpired ? "#e67e22" : isAuthorized ? "#27ae60" : "#7f8c8d", background: "white" } },
          isExpired ? "已过期" : isAuthorized ? "已授权" : phase === "waiting" ? "等待授权..." : phase === "error" ? "授权失败" : "未授权",
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          (isAuthorized || isExpired) ? React.createElement(Button, { size: "small", onClick: handleRevoke, loading: String(phase) === "revoking" }, "撤销") : null,
          React.createElement(Button, { size: "small", type: isAuthorized && !isExpired ? "default" : "primary", onClick: handleStart, loading: phase === "starting" || phase === "waiting", disabled: !client.url?.trim() }, isAuthorized && !isExpired ? "重新授权" : "授权"),
        ),
      ),
      errorMsg ? React.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, errorMsg) : null,
      // Advanced
      React.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => setShowAdvanced(v => !v) },
        showAdvanced ? "收起高级设置" : "展开高级设置",
      ),
      showAdvanced
        ? React.createElement(
            "div",
            { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
            React.createElement(Text, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
            React.createElement(Input, { size: "small", placeholder: "留空则使用动态注册", value: clientId, onChange: (e: any) => setClientId(e.target.value) }),
            React.createElement(Text, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
            React.createElement(Input, { size: "small", placeholder: "OAuth scope", value: scope, onChange: (e: any) => setScope(e.target.value) }),
            React.createElement(Text, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
            React.createElement(Input, { size: "small", placeholder: "https://auth.example.com/authorize", value: authEndpoint, onChange: (e: any) => setAuthEndpoint(e.target.value) }),
            React.createElement(Text, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
            React.createElement(Input, { size: "small", placeholder: "https://auth.example.com/token", value: tokenEndpoint, onChange: (e: any) => setTokenEndpoint(e.target.value) }),
          )
        : null,
    ),
  );
}


