import type * as ReactTypes from "react";

export type BuiltinPageId = "tools" | "mcp" | "acp";

export interface QwenPawHost {
  React: typeof ReactTypes;
  // Host-owned namespaces are intentionally dynamic across console versions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  antd: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  antdIcons: any;
  getApiUrl: (path: string) => string;
  getApiToken: () => string | null;
  /** Host-owned transport that tracks authentication and Agent scoping. */
  fetch?: (path: string, init?: RequestInit) => Promise<Response>;
  setSelectedAgent?: (agentId: string) => void;
  refreshAgents?: (options?: { force?: boolean }) => Promise<void>;
  useSelectedAgent?: () => { id: string };
  getCurrentSessionId?: () => string;
  getSelectedAgentId?: () => string;
  ReactMarkdown?: ReactTypes.ComponentType<any>;
  remarkGfm?: unknown;
  loadBuiltinPage?: (page: BuiltinPageId) => Promise<any>;
}

export function getHost(): QwenPawHost {
  const host = (
    window as Window & {
      QwenPaw?: { host?: unknown };
    }
  ).QwenPaw?.host;
  if (!host) throw new Error("[ugsci] QwenPaw.host not available");
  return host as QwenPawHost;
}

function getToken(): string {
  try {
    return getHost().getApiToken() || "";
  } catch {
    return "";
  }
}

export function apiUrl(path: string): string {
  return getHost().getApiUrl(path);
}

export function authHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function headersToRecord(headers?: HeadersInit): Record<string, string> {
  const normalized = new Headers(headers);
  const result: Record<string, string> = {};
  normalized.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Send a QwenPaw API request through the host-owned transport. The fallback is
 * only for older hosts that predate host.fetch; current hosts therefore remain
 * the single owner of URL resolution, authentication, and Agent headers.
 */
export function hostFetch(path: string, init?: RequestInit): Promise<Response> {
  const host = getHost();
  const callerHeaders = headersToRecord(init?.headers);
  if (host.fetch) {
    return host.fetch(path, { ...init, headers: callerHeaders });
  }
  return fetch(host.getApiUrl(path), {
    ...init,
    headers: { ...authHeaders(), ...callerHeaders },
  });
}

interface CacheEntry {
  data: unknown;
  ts: number;
  /** Agent ID this entry is scoped to (undefined for global resources). */
  agentId?: string;
}

const apiCache = new Map<string, CacheEntry>();
const API_CACHE_TTL = 15_000;

/** Extract X-Agent-Id from request headers (case-insensitive lookup). */
function extractAgentId(headers?: Record<string, string> | Headers): string {
  if (!headers) return "";
  if (headers instanceof Headers) {
    return headers.get("X-Agent-Id") || headers.get("x-agent-id") || "";
  }
  // Plain object — check common casing
  return headers["X-Agent-Id"] || headers["x-agent-id"] || "";
}

/** Build a cache key that includes method, path, and agent scope.
 *  This prevents data cross-contamination between agents that access
 *  the same API path with different X-Agent-Id headers. */
function buildCacheKey(method: string, path: string, agentId: string): string {
  return `${method}:${path}:${agentId}`;
}

export function clearApiCache(): void {
  apiCache.clear();
}

/** Clear cache entries scoped to a specific agent.
 *  If no agentId is provided, clears ALL agent-scoped entries
 *  (entries that were cached with an X-Agent-Id header).
 *  Call this when the selected agent changes to ensure fresh data. */
export function clearAgentCache(agentId?: string): void {
  for (const [key, entry] of apiCache) {
    if (agentId ? entry.agentId === agentId : !!entry.agentId) {
      apiCache.delete(key);
    }
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { bypassCache?: boolean },
): Promise<T> {
  const method = (options?.method || "GET").toUpperCase();
  const { bypassCache, ...fetchOptions } = (options || {}) as RequestInit & {
    bypassCache?: boolean;
  };

  // Extract X-Agent-Id from request headers for cache scoping.
  // This ensures requests with different agents don't share cache entries.
  const agentId = extractAgentId(
    fetchOptions.headers as Record<string, string> | undefined,
  );
  const cacheKey = buildCacheKey(method, path, agentId);

  // Non-GET requests invalidate cache. If the mutation targets a specific
  // agent (X-Agent-Id present), only clear that agent's scoped entries;
  // otherwise clear everything (global mutation like skill pool download).
  if (method !== "GET") {
    if (agentId) {
      clearAgentCache(agentId);
    } else {
      clearApiCache();
    }
  }

  if (method === "GET" && !bypassCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < API_CACHE_TTL) {
      return cached.data as T;
    }
  }

  const response = await hostFetch(path, fetchOptions);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `HTTP ${response.status}`);
  }
  if (response.status === 204) return null as T;

  const data = (await response.json()) as T;
  if (method === "GET") {
    apiCache.set(cacheKey, {
      data,
      ts: Date.now(),
      agentId: agentId || undefined,
    });
  }
  return data;
}
