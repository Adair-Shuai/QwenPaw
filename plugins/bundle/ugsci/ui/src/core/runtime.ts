import type React from "react";

export interface QwenPawHost {
  React: typeof React;
  // Host-owned namespaces are intentionally dynamic across console versions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  antd: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  antdIcons: any;
  getApiUrl: (path: string) => string;
  getApiToken: () => string;
  setSelectedAgent?: (agentId: string) => void;
  useSelectedAgent?: () => { id: string };
  ReactMarkdown?: React.ElementType;
  remarkGfm?: unknown;
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

const apiCache = new Map<string, { data: unknown; ts: number }>();
const API_CACHE_TTL = 15_000;

export function clearApiCache(): void {
  apiCache.clear();
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { bypassCache?: boolean },
): Promise<T> {
  const method = (options?.method || "GET").toUpperCase();
  const { bypassCache, ...fetchOptions } = (options || {}) as RequestInit & {
    bypassCache?: boolean;
  };

  if (method !== "GET") clearApiCache();
  if (method === "GET" && !bypassCache) {
    const cached = apiCache.get(path);
    if (cached && Date.now() - cached.ts < API_CACHE_TTL) {
      return cached.data as T;
    }
  }

  const response = await fetch(apiUrl(path), {
    ...fetchOptions,
    headers: { ...authHeaders(), ...(fetchOptions.headers || {}) },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `HTTP ${response.status}`);
  }
  if (response.status === 204) return null as T;

  const data = (await response.json()) as T;
  if (method === "GET") {
    apiCache.set(path, { data, ts: Date.now() });
  }
  return data;
}
