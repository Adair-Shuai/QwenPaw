import type { ReactNode } from "react";
import { apiFetch, getHost } from "../core/runtime";
import type { MCPClientInfo } from "../core/types";
import { createMCPForAgent } from "../expert/expertApi";
import { MCP_ENV_HINTS, type MCPTemplate } from "./marketHelpers";
import { resolveMcpConnection, safeMcpLink } from "./mcpConnection";

type Phase = "config" | "saved" | "saving" | "starting" | "waiting" | "checking" | "connected" | "error";
interface Props {
  template: MCPTemplate;
  agentId: string;
  agentName: string;
  existing?: MCPClientInfo;
  onSaved: (client: MCPClientInfo) => void;
  onConnected: () => void;
  onClose: () => void;
}

/** Credentials stay in this short-lived form; only the server persists them. */
export function MCPConnectModal({ template, agentId, agentName, existing, onSaved, onConnected, onClose }: Props) {
  const { React, antd, openExternalLink } = getHost();
  const { useState, useRef, useEffect } = React;
  const { Modal, Button, Input, Alert, Tag } = antd;
  const h = React.createElement;
  const oauth = template.authType === "oauth2";
  const fields = Object.entries(template.env || {}).filter(([, value]) => value.startsWith("your-") || value.includes("${"));
  const [values, setValues] = useState<Record<string, string>>({});
  const [client, setClient] = useState<MCPClientInfo | undefined>(existing);
  const [phase, setPhase] = useState<Phase>(existing ? "saved" : "config");
  const [error, setError] = useState("");
  const [authUrl, setAuthUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [clientId, setClientId] = useState("");
  const [scope, setScope] = useState("");
  const [toolCount, setToolCount] = useState(0);
  const mounted = useRef(true);
  const generation = useRef(0);
  const sessionRef = useRef("");
  const headers = { "Content-Type": "application/json", "X-Agent-Id": agentId };
  const key = encodeURIComponent(template.id);
  const request = <T,>(path: string, init: RequestInit = {}) => apiFetch<T>(path, { ...init, headers, cache: "no-store", bypassCache: true });
  const cancelSession = (id: string): Promise<boolean> => id ? request(`/mcp/oauth/session/${key}?session_id=${encodeURIComponent(id)}`, { method: "DELETE" }).then(() => true, () => false) : Promise.resolve(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
      void cancelSession(sessionRef.current);
    };
  }, []);

  const active = (run: number) => mounted.current && generation.current === run;
  const openAuthPage = (url: string) => {
    const safe = safeMcpLink(url);
    if (!safe) throw new Error("授权服务返回的登录地址无效，请联系服务提供方。");
    if (openExternalLink) openExternalLink(safe);
    else window.open(safe, "_blank", "noopener,noreferrer");
  };

  const verifyConnection = async (saved: MCPClientInfo, run = ++generation.current) => {
    setError("");
    setPhase("checking");
    try {
      if (oauth) {
        const status = await request<{ authorized: boolean }>(`/mcp/oauth/status/${key}`);
        if (!active(run)) return;
        if (!status.authorized) {
          setPhase("saved");
          setError("账号尚未授权或授权已过期，请点击登录授权。");
          return;
        }
      }
      // Set enabled explicitly; a toggle could accidentally disable a connection.
      const enabled = await request<MCPClientInfo>(`/mcp/${key}`, { method: "PUT", body: JSON.stringify({ enabled: true }) });
      if (!active(run)) return;
      setClient({ ...saved, ...enabled, enabled: true });
      onSaved({ ...saved, ...enabled, enabled: true });
      const tools = await request<unknown[]>(`/mcp/tools/${key}`);
      if (!active(run)) return;
      if (!Array.isArray(tools) || tools.length === 0) {
        setError("配置已启用，但服务尚未返回可用工具。可稍后重新检测，或检查账号权限和服务接入要求。");
        setPhase("error");
        return;
      }
      setToolCount(tools.length);
      setPhase("connected");
      onConnected();
    } catch {
      if (!active(run)) return;
      setPhase("error");
      setError(oauth ? "账号授权后，工具连接检测未通过。请检查网络或服务账号权限后重试；授权失效可重新登录。" : "配置已保存，工具连接检测未通过。请检查网络、密钥权限或本地运行环境后重试。");
    }
  };

  const startAuthorization = async (saved: MCPClientInfo, run = ++generation.current) => {
    setPhase("starting");
    setError("");
    setAuthUrl("");
    const previous = sessionRef.current;
    sessionRef.current = "";
    setSessionId("");
    await cancelSession(previous);
    if (!active(run)) return;
    try {
      const result = await request<{ auth_url: string; session_id: string }>(`/mcp/oauth/start/${key}`, {
        // The backend uses the saved endpoint, including securely stored URL credentials.
        method: "POST", body: JSON.stringify({ url: "", client_id: clientId.trim(), scope: scope.trim() }),
      });
      if (!active(run)) { void cancelSession(result.session_id); return; }
      if (!result.session_id || !safeMcpLink(result.auth_url)) throw new Error("Invalid authorization response");
      sessionRef.current = result.session_id;
      setSessionId(result.session_id);
      setAuthUrl(result.auth_url);
      setPhase("waiting");
      openAuthPage(result.auth_url);
    } catch {
      if (!active(run)) return;
      setPhase("error");
      setError("无法发起登录授权。请确认服务支持标准 MCP OAuth；若服务要求预先注册客户端，可在高级设置填写客户端 ID，或查看服务接入说明后重试。");
    }
  };

  // Poll one session at a time. Focus resumes promptly after the browser returns.
  useEffect(() => {
    if (phase !== "waiting" || !sessionId || !client) return;
    const run = generation.current;
    let stopped = false;
    let inFlight = false;
    let timer: ReturnType<typeof setTimeout>;
    let failures = 0;
    const deadline = Date.now() + 5 * 60_000;
    const poll = async () => {
      if (stopped || inFlight || !active(run)) return;
      clearTimeout(timer);
      if (Date.now() >= deadline) {
        void cancelSession(sessionId);
        setPhase("error");
        setError("等待授权超时。配置已保留，请重新登录授权。");
        return;
      }
      inFlight = true;
      try {
        const status = await request<{ authorized: boolean; phase?: string }>(`/mcp/oauth/status/${key}?session_id=${encodeURIComponent(sessionId)}`);
        if (stopped || !active(run)) return;
        failures = 0;
        if (status.authorized && status.phase === "authorized") {
          sessionRef.current = "";
          setSessionId("");
          void verifyConnection(client, run);
          return;
        }
        if (["denied", "failed", "cancelled", "expired"].includes(status.phase || "")) {
          setPhase("error");
          setError(status.phase === "denied" ? "授权未获同意。你可以重新登录并选择允许的权限。" : "本次授权未完成或已失效，配置已保留，可重新登录授权。");
          return;
        }
      } catch {
        if (++failures >= 3 && !stopped && active(run)) {
          setPhase("error");
          setError("暂时无法查询授权状态，请检查网络后重试。");
          return;
        }
      } finally { inFlight = false; }
      if (!stopped && active(run)) timer = setTimeout(poll, 2000);
    };
    void poll();
    window.addEventListener("focus", poll);
    return () => { stopped = true; clearTimeout(timer); window.removeEventListener("focus", poll); };
  }, [phase, sessionId, client]);

  const save = async () => {
    const missing = fields.filter(([field]) => !values[field]?.trim());
    if (missing.length) {
      setError(`请填写：${missing.map(([field]) => (template.inputHints?.[field] || MCP_ENV_HINTS[field])?.label || field).join("、")}`);
      return;
    }
    let resolved;
    try {
      resolved = resolveMcpConnection({ url: template.url, command: template.command, args: template.args, headers: template.headers, cwd: template.cwd, env: { ...template.env, ...values } }, values);
    } catch (err) { setError(err instanceof Error ? err.message : "请检查连接配置"); return; }
    const run = ++generation.current;
    setPhase("saving");
    setError("");
    try {
      const payload = { name: template.name, description: template.description, enabled: !oauth, transport: template.transport, ...resolved };
      const saved = client
        ? await request<MCPClientInfo>(`/mcp/${key}`, { method: "PUT", body: JSON.stringify(payload) })
        : await createMCPForAgent(agentId, { client_key: template.id, client: payload });
      if (!active(run)) return;
      // Never keep the unmasked resolved credentials after saving.
      const info = { ...saved, key: template.id, enabled: !oauth };
      setClient(info);
      setValues({});
      onSaved(info);
      if (oauth) await startAuthorization(info, run);
      else await verifyConnection(info, run);
    } catch {
      if (!active(run)) return;
      setPhase("config");
      setError("配置未能保存，请检查服务配置或是否已有同名连接后重试。填写内容暂时保留在此窗口。");
    }
  };

  const stop = async () => {
    generation.current += 1;
    setPhase("saved");
    setError("已取消本次授权等待，配置已保留。尚未完成授权的连接保持未启用。");
    const cancelled = await cancelSession(sessionRef.current);
    if (!cancelled && mounted.current) setError("已停止等待，但暂时无法取消服务端授权流程。请关闭授权网页；连接不会在此窗口自动启用。");
    sessionRef.current = "";
    setSessionId("");
    setAuthUrl("");
  };
  const busy = ["saving", "starting", "waiting", "checking"].includes(phase);
  const source = safeMcpLink(template.source);
  const setupUrl = safeMcpLink(template.setupUrl);
  const status = phase === "connected" ? `已连接 · 已读取 ${toolCount} 个工具` : phase === "waiting" ? "等待浏览器登录授权" : phase === "starting" ? "正在准备安全登录" : phase === "checking" ? "正在检测可用工具" : phase === "saving" ? "正在保存连接配置" : client ? (oauth ? "已保存 · 账号授权与连接待确认" : "已保存 · 连接待检测") : "填写接入信息";
  const footer: ReactNode[] = [h(Button, { key: "close", onClick: onClose }, busy ? "关闭并停止等待" : "关闭")];
  if (phase === "config") footer.push(h(Button, { key: "save", type: "primary", onClick: save }, client ? "更新凭证并连接" : "添加连接"));
  else if (phase === "waiting") footer.push(h(Button, { key: "cancel", onClick: stop }, "取消授权"), h(Button, { key: "reopen", type: "primary", onClick: () => openAuthPage(authUrl) }, "重新打开授权页"));
  else if (!busy && client) {
    if (fields.length) footer.push(h(Button, { key: "edit", onClick: () => { setValues({}); setError(""); setPhase("config"); } }, "更新凭证"));
    footer.push(h(Button, { key: "check", onClick: () => verifyConnection(client) }, "重新检测"));
    if (oauth) footer.push(h(Button, { key: "auth", type: "primary", onClick: () => startAuthorization(client) }, "登录授权"));
  }

  return h(Modal, { title: `连接 ${template.name}`, open: true, onCancel: onClose, footer, width: 560, destroyOnClose: true },
    h("p", { style: { color: "var(--ant-color-text-secondary)" } }, template.description),
    h("p", null, `目标专家：${agentName}`),
    h(Tag, { color: phase === "connected" ? "green" : "blue" }, status),
    oauth ? h(Alert, { style: { margin: "12px 0" }, type: "info", showIcon: true, message: "在服务提供方页面登录并确认权限，返回这里自动完成连接检测。UGSci 不需要你的账号密码。" }) : null,
    error ? h(Alert, { role: "alert", style: { margin: "12px 0" }, type: "warning", showIcon: true, message: error }) : null,
    ...(template.requirements || []).map((text, i) => h("p", { key: `req-${i}` }, text)),
    setupUrl ? h("p", null, h("a", { href: setupUrl, target: "_blank", rel: "noopener noreferrer", onClick: openExternalLink ? (event: any) => { event.preventDefault(); openExternalLink(setupUrl); } : undefined }, "开通账号 / 获取授权信息 ↗")) : null,
    source ? h("a", { href: source, target: "_blank", rel: "noopener noreferrer", onClick: openExternalLink ? (event: any) => { event.preventDefault(); openExternalLink(source); } : undefined }, "查看服务接入说明 ↗") : null,
    phase === "config" ? h("div", { style: { marginTop: 16 } }, ...fields.map(([field]) => {
      const hint = template.inputHints?.[field] || MCP_ENV_HINTS[field];
      const link = safeMcpLink(hint?.link);
      const label = hint?.label || field;
      return h("div", { key: field, style: { marginBottom: 16 } },
        h("label", { htmlFor: `mcp-input-${field}`, style: { display: "block", marginBottom: 6 } }, `${label}（必填）`),
        hint?.help ? h("p", { style: { fontSize: 12, margin: "4px 0" } }, hint.help) : null,
        link ? h("a", { href: link, target: "_blank", rel: "noopener noreferrer", onClick: openExternalLink ? (event: any) => { event.preventDefault(); openExternalLink(link); } : undefined }, "获取密钥 / 查看设置 ↗") : null,
        h(hint?.isSecret === false ? Input : Input.Password, { id: `mcp-input-${field}`, placeholder: `请输入 ${label}`, value: values[field] || "", autoComplete: "off", onChange: (event: any) => setValues((old) => ({ ...old, [field]: event.target.value })) }),
      );
    })) : null,
    oauth ? h("div", { style: { marginTop: 12 } },
      h(Button, { type: "link", size: "small", disabled: busy, onClick: () => setAdvanced(!advanced) }, advanced ? "收起高级设置" : "高级设置（服务要求时填写）"),
      advanced ? h("div", null,
        h(Input, { "aria-label": "OAuth 客户端 ID", placeholder: "客户端 ID（通常自动获取）", value: clientId, disabled: busy, onChange: (e: any) => setClientId(e.target.value) }),
        h(Input, { "aria-label": "OAuth 权限范围", placeholder: "权限范围（按服务文档填写，可留空）", value: scope, disabled: busy, style: { marginTop: 8 }, onChange: (e: any) => setScope(e.target.value) }),
      ) : null,
    ) : null,
    template.limitations?.length ? h("details", { style: { marginTop: 12 } }, h("summary", null, "使用限制"), ...template.limitations.map((text, i) => h("p", { key: i }, text))) : null,
  );
}
