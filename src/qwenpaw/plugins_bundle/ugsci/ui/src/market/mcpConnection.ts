/** Catalog connection normalization. Never mutate or persist catalog credentials. */
export interface CatalogInputHint {
  label: string;
  help?: string;
  link?: string;
  isSecret?: boolean;
}

export function normalizeMcpTransport(value: unknown, hasUrl = false): "stdio" | "sse" | "streamable_http" {
  const key = String(value || "").trim().toLowerCase().replace(/[-_]/g, "");
  if (key === "sse") return "sse";
  if (key === "stdio") return "stdio";
  if (key === "streamablehttp" || key === "http" || (!key && hasUrl)) return "streamable_http";
  if (!key) return "stdio";
  throw new Error("不支持的 MCP 连接方式，请检查目录配置");
}

export function connectionVariables(config: { url?: string; command?: string; args?: string[]; headers?: Record<string, string>; env?: Record<string, string>; cwd?: string }): string[] {
  return [...new Set([...JSON.stringify(config).matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((match) => match[1]))];
}

/** URL query values are encoded individually; a whole-URL input stays a URL. */
export function resolveMcpConnection<T extends { url?: string; command?: string; args?: string[]; headers?: Record<string, string>; env?: Record<string, string>; cwd?: string }>(config: T, values: Record<string, string>): T {
  const replace = (text: string, encode = false) => text.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_match, key) => {
    const value = values[key];
    if (!value?.trim()) throw new Error(`请填写配置项：${key}`);
    return encode ? encodeURIComponent(value) : value;
  });
  let url = config.url;
  if (url) {
    const question = url.indexOf("?");
    url = question < 0 ? replace(url) : replace(url.slice(0, question)) + "?" + replace(url.slice(question + 1), true);
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error("请输入有效的 HTTP MCP 地址");
    if (parsed.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)) throw new Error("远程 MCP 请使用 HTTPS 地址");
    if (parsed.hash) throw new Error("MCP 地址不能包含片段标识");
  }
  const headers = Object.fromEntries(Object.entries(config.headers || {}).map(([key, value]) => {
    const resolved = replace(value);
    if (/[\r\n]/.test(key + resolved)) throw new Error("请求头不能包含换行");
    return [key, resolved];
  }));
  return { ...config, url, command: replace(config.command || ""), args: (config.args || []).map((arg) => replace(arg)), cwd: replace(config.cwd || ""), headers,
    env: Object.fromEntries(Object.entries(config.env || {}).map(([key, value]) => [key, replace(value)])) };
}
