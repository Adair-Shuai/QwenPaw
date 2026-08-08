import { getApiToken } from "./config";

/** Authorization + X-Agent-Id for API requests. Caller sets Content-Type when needed. */
export function buildAuthHeaders(agentId?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getApiToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    // Read from sessionStorage first (per-tab agent), fall back to localStorage
    const agentStorage =
      sessionStorage.getItem("qwenpaw-agent-storage") ||
      localStorage.getItem("qwenpaw-agent-storage");
    if (agentStorage) {
      const parsed = JSON.parse(agentStorage);
      const selectedAgent = parsed?.state?.selectedAgent;
      if (!agentId && selectedAgent) {
        headers["X-Agent-Id"] = selectedAgent;
      }
    }
  } catch (error) {
    console.warn("Failed to get selected agent from storage:", error);
  }
  if (agentId) headers["X-Agent-Id"] = agentId;
  return headers;
}

export interface WorkspaceScopeHeaderOptions {
  agentId?: string;
  chatId?: string;
  projectDirOverride?: string;
}

/** Authentication plus the project-directory scope used by workspace files. */
export function buildWorkspaceScopeHeaders({
  agentId,
  chatId,
  projectDirOverride,
}: WorkspaceScopeHeaderOptions = {}): Record<string, string> {
  return {
    ...buildAuthHeaders(agentId),
    ...(chatId ? { "X-Chat-Id": chatId } : {}),
    ...(!chatId && projectDirOverride
      ? { "X-Session-Project-Dir": projectDirOverride }
      : {}),
  };
}

/** Add credentials usable by native media elements that cannot set headers. */
export function buildAuthenticatedMediaUrl(
  url: string,
  agentId?: string,
): string {
  const params = new URLSearchParams();
  const token = getApiToken();
  if (token) params.set("token", token);
  if (agentId) params.set("agent_id", agentId);
  const query = params.toString();
  if (!query) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
}
