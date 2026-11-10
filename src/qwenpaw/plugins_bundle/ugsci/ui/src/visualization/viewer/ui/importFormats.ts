/** Shared import filename rules for the viewer picker and workspace browser. */
import { ApiClient } from "../api/client";

import { waitForImportJob } from "../api/importJobs";
export {
  IMPORT_EXTENSIONS,
  fileExtension,
  isImportableFilename,
  fileAcceptAttribute,
  classifyPickedFiles,
} from "../../imports/formats";
export type { ImportExtension } from "../../imports/formats";

export type WorkspaceRoot = "project" | "workspace";

export interface WorkspaceTreeEntry {
  kind: "directory" | "file";
  name: string;
  path: string;
  size?: number | null;
}

export interface WorkspaceTreePage {
  directory: string;
  entries: WorkspaceTreeEntry[];
  has_more: boolean;
  next_cursor: string | null;
}

export async function hostApiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const host = (
    window as Window & {
      QwenPaw?: {
        host?: {
          fetch?: (path: string, init?: RequestInit) => Promise<Response>;
          getApiUrl?: (path: string) => string;
          getApiToken?: () => string | null;
        };
      };
    }
  ).QwenPaw?.host;
  if (host?.fetch) return host.fetch(path, init);
  const url = host?.getApiUrl?.(path.replace(/^\//, "")) || path;
  const token = host?.getApiToken?.() || "";
  const headers = new Headers(init?.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...init, headers });
}

export async function listWorkspaceTree(options: {
  path?: string;
  root?: WorkspaceRoot;
  cursor?: string | null;
  signal?: AbortSignal;
  apiBase?: string;
  authToken?: string;
  headers?: Record<string, string>;
  request?: typeof fetch;
}): Promise<WorkspaceTreePage> {
  const params = new URLSearchParams();
  if (options.path) params.set("path", options.path);
  params.set("root", options.root || "project");
  if (options.cursor) params.set("cursor", options.cursor);
  const response = options.apiBase
    ? await new ApiClient(
        options.apiBase.replace(/\/ugsci\/visualization\/?$/, "") +
          "/workspace",
        options.authToken,
        { headers: options.headers, request: options.request },
      ).request(`/tree?${params.toString()}`, { signal: options.signal })
    : await hostApiFetch(`/workspace/tree?${params.toString()}`, {
        signal: options.signal,
      });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `工作区列表失败: HTTP ${response.status}`);
  }
  return response.json() as Promise<WorkspaceTreePage>;
}

export async function pollImportJob(options: {
  apiBase: string;
  authToken?: string;
  headers?: Record<string, string>;
  request?: typeof fetch;
  jobId: string;
  onProgress?: (progress: number, status: string) => void;
  signal?: AbortSignal;
}): Promise<{ id: string; name?: string }> {
  const api = new ApiClient(options.apiBase, options.authToken, options);
  const labels: Record<string, string> = {
    queued: "排队中",
    running: "处理中",
    completed: "已完成",
    failed: "失败",
    cancelled: "已取消",
  };
  const job = await waitForImportJob(api, options.jobId, {
    signal: options.signal,
    onProgress: (status) =>
      options.onProgress?.(status.progress, labels[status.status]),
  });
  return { id: job.result.id, name: job.result.name || job.name };
}
