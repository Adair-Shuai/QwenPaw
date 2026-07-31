/**
 * MCP access policy helpers — normalization, validation, and rule manipulation.
 * Ported from console accessPolicy.ts.
 */

import type {
  MCPAccessEffect,
  MCPAccessPolicy,
  MCPAccessPrincipalOption,
  MCPAccessRule,
  MCPAccessSourceType,
  MCPAccessSubjectType,
  MCPToolAccessOverride,
  MCPToolDefaultPolicy,
  MCPToolInfo,
} from "../core/types";

// ─── Capability Center Page ───────────────────────────────────────────────────

// ── MCP Access Policy helpers (ported from console accessPolicy.ts) ──

export const MCP_CHANNEL_SOURCE_VALUES = [
  "console", "dingtalk", "feishu", "wechat", "wecom",
  "discord", "telegram", "qq", "imessage", "mattermost",
  "matrix", "onebot", "mqtt", "voice", "sip", "xiaoyi",
] as const;

export const CHANNEL_SOURCE_LABELS: Record<string, string> = {
  console: "Console", dingtalk: "DingTalk", feishu: "Feishu",
  wechat: "WeChat", wecom: "WeCom", discord: "Discord",
  telegram: "Telegram", qq: "QQ", imessage: "iMessage",
  mattermost: "Mattermost", matrix: "Matrix", onebot: "OneBot",
  mqtt: "MQTT", voice: "Voice", sip: "SIP", xiaoyi: "XiaoYi",
};

export interface MCPAccessToolGroup {
  toolName: string;
  description: string;
  inputSchema: Record<string, unknown>;
  stale: boolean;
  defaultEffect: MCPAccessEffect;
  hasExplicitDefault: boolean;
  rules: MCPToolAccessOverride[];
}

export function normalizeSourceType(t: string): MCPAccessSourceType {
  return (t || "").trim() || "channel";
}
export function normalizeSourceValue(v: string): string {
  return (v || "").trim();
}
export function isWildcardSourceValue(v: string): boolean {
  const n = normalizeSourceValue(v);
  return n === "" || n === "*";
}
export function normalizeSubjectType(t: MCPAccessSubjectType): MCPAccessSubjectType {
  return t === "user" ? "user" : "all";
}

export function normalizeMCPAccessRule(rule: MCPAccessRule): MCPAccessRule {
  const subjectType = normalizeSubjectType(rule.subject_type);
  return {
    source_type: normalizeSourceType(rule.source_type),
    source_value: normalizeSourceValue(rule.source_value),
    subject_type: subjectType,
    subject_value: subjectType === "all" ? "" : (rule.subject_value || "").trim(),
    effect: rule.effect,
  };
}

export function normalizeMCPToolRule(rule: MCPToolAccessOverride): MCPToolAccessOverride {
  return { tool_name: rule.tool_name || "*", ...normalizeMCPAccessRule(rule) };
}

export function normalizeMCPToolDefault(d: MCPToolDefaultPolicy): MCPToolDefaultPolicy {
  return { tool_name: d.tool_name || "*", effect: d.effect };
}

export function sortAccessRules(rules: MCPAccessRule[]): MCPAccessRule[] {
  return [...rules].map(normalizeMCPAccessRule).sort((a, b) =>
    a.source_type.localeCompare(b.source_type) ||
    a.source_value.localeCompare(b.source_value) ||
    a.subject_type.localeCompare(b.subject_type) ||
    a.subject_value.localeCompare(b.subject_value)
  );
}

export function sortToolRules(rules: MCPToolAccessOverride[]): MCPToolAccessOverride[] {
  return [...rules].map(normalizeMCPToolRule).sort((a, b) =>
    a.tool_name.localeCompare(b.tool_name) ||
    a.source_type.localeCompare(b.source_type) ||
    a.source_value.localeCompare(b.source_value) ||
    a.subject_type.localeCompare(b.subject_type) ||
    a.subject_value.localeCompare(b.subject_value)
  );
}

export function sortToolDefaults(d: MCPToolDefaultPolicy[]): MCPToolDefaultPolicy[] {
  return [...d].map(normalizeMCPToolDefault).sort((a, b) => a.tool_name.localeCompare(b.tool_name));
}

export function normalizeMCPAccessPolicy(policy: MCPAccessPolicy): MCPAccessPolicy {
  return {
    default_effect: policy.default_effect || "deny",
    client_overrides: sortAccessRules(policy.client_overrides || []),
    tool_defaults: sortToolDefaults(policy.tool_defaults || []),
    tool_overrides: sortToolRules(policy.tool_overrides || []),
    unmanaged_rules_count: policy.unmanaged_rules_count || 0,
  };
}

export function accessRuleIdentityKey(rule: Pick<MCPAccessRule, "source_type" | "source_value" | "subject_type" | "subject_value">): string {
  return [normalizeSourceType(rule.source_type), normalizeSourceValue(rule.source_value), normalizeSubjectType(rule.subject_type), rule.subject_type === "all" ? "" : (rule.subject_value || "").trim()].join("\u0000");
}

export function toolRuleIdentityKey(rule: Pick<MCPToolAccessOverride, "tool_name" | "source_type" | "source_value" | "subject_type" | "subject_value">): string {
  return [(rule.tool_name || "*"), normalizeSourceType(rule.source_type), normalizeSourceValue(rule.source_value), normalizeSubjectType(rule.subject_type), rule.subject_type === "all" ? "" : (rule.subject_value || "").trim()].join("\u0000");
}

export function buildMCPAccessToolGroups(tools: MCPToolInfo[], policy: MCPAccessPolicy): MCPAccessToolGroup[] {
  const np = normalizeMCPAccessPolicy(policy);
  const rulesByTool = new Map<string, MCPToolAccessOverride[]>();
  np.tool_overrides.forEach(o => {
    const r = normalizeMCPToolRule(o);
    const arr = rulesByTool.get(r.tool_name) || [];
    arr.push(r);
    rulesByTool.set(r.tool_name, arr);
  });
  const defaultsByTool = new Map(np.tool_defaults.map(d => [d.tool_name, normalizeMCPToolDefault(d)]));
  const currentNames = new Set(tools.map(t => t.name));
  const current: MCPAccessToolGroup[] = tools.map(t => ({
    toolName: t.name,
    description: t.description,
    inputSchema: t.input_schema,
    stale: false,
    defaultEffect: defaultsByTool.get(t.name)?.effect || np.default_effect,
    hasExplicitDefault: defaultsByTool.has(t.name),
    rules: sortToolRules(rulesByTool.get(t.name) || []),
  }));
  const staleNames = new Set([...rulesByTool.keys(), ...defaultsByTool.keys()]);
  const stale: MCPAccessToolGroup[] = Array.from(staleNames)
    .filter(n => n !== "*" && !currentNames.has(n))
    .map(n => ({
      toolName: n,
      description: "",
      inputSchema: {},
      stale: true,
      defaultEffect: defaultsByTool.get(n)?.effect || np.default_effect,
      hasExplicitDefault: defaultsByTool.has(n),
      rules: sortToolRules(rulesByTool.get(n) || []),
    }));
  return [...current, ...stale];
}

export function nextDefaultSourceValue(policy: MCPAccessPolicy, toolName: string | null): string {
  const np = normalizeMCPAccessPolicy(policy);
  const used = new Set(
    toolName === null
      ? np.client_overrides.map(r => accessRuleIdentityKey(normalizeMCPAccessRule(r)))
      : np.tool_overrides.filter(r => r.tool_name === toolName).map(r => toolRuleIdentityKey(normalizeMCPToolRule(r)))
  );
  for (const sv of MCP_CHANNEL_SOURCE_VALUES) {
    const candidate = toolName === null
      ? accessRuleIdentityKey({ source_type: "channel", source_value: sv, subject_type: "all", subject_value: "" })
      : toolRuleIdentityKey({ tool_name: toolName, source_type: "channel", source_value: sv, subject_type: "all", subject_value: "" });
    if (!used.has(candidate)) return sv;
  }
  return "console";
}

export function addClientRule(policy: MCPAccessPolicy): MCPAccessPolicy {
  return upsertClientRule(policy, { source_type: "channel", source_value: nextDefaultSourceValue(policy, null), subject_type: "all", subject_value: "", effect: "ask" });
}

export function addToolRule(policy: MCPAccessPolicy, toolName: string): MCPAccessPolicy {
  return upsertToolRule(policy, { tool_name: toolName, source_type: "channel", source_value: nextDefaultSourceValue(policy, toolName), subject_type: "all", subject_value: "", effect: "ask" });
}

export function upsertClientRule(policy: MCPAccessPolicy, rule: MCPAccessRule, prev?: Parameters<typeof accessRuleIdentityKey>[0]): MCPAccessPolicy {
  const np = normalizeMCPAccessPolicy(policy);
  const nr = normalizeMCPAccessRule(rule);
  const prevKey = prev ? accessRuleIdentityKey(prev) : accessRuleIdentityKey(nr);
  const nextKey = accessRuleIdentityKey(nr);
  const next = np.client_overrides.filter(r => { const k = accessRuleIdentityKey(normalizeMCPAccessRule(r)); return k !== prevKey && k !== nextKey; });
  next.push(nr);
  return { ...np, client_overrides: sortAccessRules(next) };
}

export function upsertToolRule(policy: MCPAccessPolicy, rule: MCPToolAccessOverride, prev?: Parameters<typeof toolRuleIdentityKey>[0]): MCPAccessPolicy {
  const np = normalizeMCPAccessPolicy(policy);
  const nr = normalizeMCPToolRule(rule);
  const prevKey = prev ? toolRuleIdentityKey(prev) : toolRuleIdentityKey(nr);
  const nextKey = toolRuleIdentityKey(nr);
  const next = np.tool_overrides.filter(r => { const k = toolRuleIdentityKey(normalizeMCPToolRule(r)); return k !== prevKey && k !== nextKey; });
  next.push(nr);
  return { ...np, tool_overrides: sortToolRules(next) };
}

export function upsertToolDefault(policy: MCPAccessPolicy, toolName: string, effect: MCPAccessEffect): MCPAccessPolicy {
  const np = normalizeMCPAccessPolicy(policy);
  const next = np.tool_defaults.filter(d => d.tool_name !== toolName);
  next.push({ tool_name: toolName, effect });
  return { ...np, tool_defaults: sortToolDefaults(next) };
}

export function removeClientRule(policy: MCPAccessPolicy, rule: Parameters<typeof accessRuleIdentityKey>[0]): MCPAccessPolicy {
  const np = normalizeMCPAccessPolicy(policy);
  const tk = accessRuleIdentityKey(rule);
  return { ...np, client_overrides: np.client_overrides.filter(r => accessRuleIdentityKey(normalizeMCPAccessRule(r)) !== tk) };
}

export function removeToolRule(policy: MCPAccessPolicy, rule: Parameters<typeof toolRuleIdentityKey>[0]): MCPAccessPolicy {
  const np = normalizeMCPAccessPolicy(policy);
  const tk = toolRuleIdentityKey(rule);
  return { ...np, tool_overrides: np.tool_overrides.filter(r => toolRuleIdentityKey(normalizeMCPToolRule(r)) !== tk) };
}

export function filterPrincipalOptionsForRule(principals: MCPAccessPrincipalOption[], rule: MCPAccessRule): MCPAccessPrincipalOption[] {
  const st = normalizeSourceType(rule.source_type);
  const sv = normalizeSourceValue(rule.source_value);
  if (isWildcardSourceValue(sv)) return [];
  const bySubject = new Map<string, MCPAccessPrincipalOption>();
  principals.forEach(p => {
    if (normalizeSourceType(p.source_type) !== st || normalizeSourceValue(p.source_value) !== sv) return;
    const sv2 = (p.subject_value || "").trim();
    if (!sv2 || bySubject.has(sv2)) return;
    bySubject.set(sv2, p);
  });
  return Array.from(bySubject.values());
}

export function buildSubjectValueOptions(principals: MCPAccessPrincipalOption[], rule: MCPAccessRule): { label: string; value: string }[] {
  return filterPrincipalOptionsForRule(principals, rule).map(p => ({ label: p.subject_value, value: p.subject_value }));
}

export function ruleHasAmbiguousUserSource(rule: MCPAccessRule): boolean {
  return normalizeSourceType(rule.source_type) === "channel" && isWildcardSourceValue(rule.source_value) && normalizeSubjectType(rule.subject_type) === "user" && Boolean((rule.subject_value || "").trim());
}

export function ruleHasUnknownUserValue(principals: MCPAccessPrincipalOption[], rule: MCPAccessRule): boolean {
  const n = normalizeMCPAccessRule(rule);
  return n.subject_type === "user" && Boolean(n.subject_value) && n.subject_value !== "*" &&
    principals.some(p => normalizeSourceType(p.source_type) === n.source_type) &&
    !ruleHasAmbiguousUserSource(n) &&
    !filterPrincipalOptionsForRule(principals, n).some(p => p.subject_value === n.subject_value);
}

export function validateMCPAccessPolicy(policy: MCPAccessPolicy): { reason: string; rule: MCPAccessRule | MCPToolAccessOverride } | null {
  const rules: Array<MCPAccessRule | MCPToolAccessOverride> = [...(policy.client_overrides || []), ...(policy.tool_overrides || [])];
  for (const rule of rules) {
    const n = normalizeMCPAccessRule(rule);
    if (n.subject_type !== "user") continue;
    if (!n.subject_value || n.subject_value === "*" || !n.source_value) return { reason: "missingUserValue", rule };
    if (ruleHasAmbiguousUserSource(n)) return { reason: "ambiguousUserSource", rule };
  }
  return null;
}

export function withRuleDefaults<R extends MCPAccessRule>(rule: R, patch: Partial<MCPAccessRule>): R {
  const nr = { ...rule, ...patch } as R;
  if (patch.subject_type) (nr as any).subject_value = "";
  if ((patch.source_type !== undefined || patch.source_value !== undefined) && patch.subject_value === undefined && (nr as any).subject_type === "user") (nr as any).subject_value = "";
  return nr;
}

export function policySignature(p: MCPAccessPolicy): string {
  return JSON.stringify(normalizeMCPAccessPolicy(p));
}

// ── MCP Access Modal Component (ported from console MCPAccessModal) ──

