import type { QwenPawHost } from "../core/runtime";
import type { ViewerMountOptions } from "./viewer/contracts/types";

export interface WorkspaceFileRef {
  workspacePath?: string;
  title?: string;
  filename?: string;
  id?: string;
  path?: string;
  size?: number;
  workspaceRoot?: "project" | "workspace";
  agentId?: string;
  chatId?: string;
  projectDirOverride?: string;
}

/** Capture the embedding scope once; refresh credentials on each request. */
export function hostViewerOptions(
  host: QwenPawHost,
  file: WorkspaceFileRef = {},
): ViewerMountOptions {
  const apiBase = host.getApiUrl("ugsci/visualization").replace(/\/$/, "");
  const serviceUrl = new URL(apiBase, window.location.href);
  const workspaceTreeUrl = new URL(
    host.getApiUrl("workspace/tree"),
    window.location.href,
  );
  const agentId = file.agentId || host.getSelectedAgentId?.();
  const headers: Record<string, string> = {};
  if (agentId) headers["X-Agent-Id"] = agentId;
  if (file.chatId) headers["X-Chat-Id"] = file.chatId;
  else if (file.projectDirOverride)
    headers["X-Session-Project-Dir"] = file.projectDirOverride;
  return {
    apiBase,
    headers,
    request: async (input, init) => {
      const url = new URL(
        input instanceof Request ? input.url : String(input),
        window.location.href,
      );
      const isVisualization =
        url.origin === serviceUrl.origin &&
        url.pathname.startsWith(`${serviceUrl.pathname}/`);
      const isWorkspaceTree =
        url.origin === workspaceTreeUrl.origin &&
        url.pathname === workspaceTreeUrl.pathname &&
        (init?.method || "GET").toUpperCase() === "GET";
      if (
        (!isVisualization && !isWorkspaceTree) ||
        url.username ||
        url.password
      )
        throw new Error("可视化请求超出当前数据服务范围");
      const currentHeaders = new Headers(init?.headers);
      Object.entries(headers).forEach(([key, value]) =>
        currentHeaders.set(key, value),
      );
      const token = host.getApiToken();
      if (token) currentHeaders.set("Authorization", `Bearer ${token}`);
      else currentHeaders.delete("Authorization");
      const scopedInit = { ...init, headers: currentHeaders };
      if (host.fetch)
        return host.fetch(
          isWorkspaceTree
            ? `/workspace/tree${url.search}`
            : `/ugsci/visualization${url.pathname.slice(
                serviceUrl.pathname.length,
              )}${url.search}`,
          scopedInit,
        );
      return fetch(url.href, scopedInit);
    },
  };
}
