/** Shared import filename rules for the viewer picker and workspace browser. */
import { ApiClient } from "../api/client";

export const IMPORT_EXTENSIONS = [
  "egrid", "grid", "grdecl", "init", "unrst", "roff", "roffbin",
  "dat", "sr3", "irf", "data", "model", "tnav", "tpr",
  "las", "las3", "dlis",
  "vtk", "vtu", "pvtu", "vti", "xdmf",
  "csv", "arrow", "parquet", "json",
] as const;

const PRIMARY_RANK = [
  "egrid", "grid", "grdecl", "roff", "roffbin", "dat", "sr3",
  "data", "model", "tnav", "tpr", "las", "las3", "dlis",
  "vtk", "vtu", "pvtu", "vti", "xdmf", "csv", "arrow", "parquet", "json",
];

export type ImportExtension = (typeof IMPORT_EXTENSIONS)[number];

export function fileExtension(name: string): string {
  const trimmed = name.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot < 0 || dot === trimmed.length - 1) return "";
  return trimmed.slice(dot + 1).toLowerCase();
}

export function isImportableFilename(name: string): boolean {
  return (IMPORT_EXTENSIONS as readonly string[]).includes(fileExtension(name));
}

export function fileAcceptAttribute(): string {
  return IMPORT_EXTENSIONS.map((ext) => `.${ext}`).join(",");
}

export function classifyPickedFiles(files: Iterable<File>): {
  primary: File;
  companion?: File;
  extra: File[];
} | null {
  const list = Array.from(files).filter((file) => isImportableFilename(file.name));
  if (list.length === 0) return null;
  const ranked = [...list].sort((left, right) => {
    const leftRank = PRIMARY_RANK.indexOf(fileExtension(left.name));
    const rightRank = PRIMARY_RANK.indexOf(fileExtension(right.name));
    return (leftRank < 0 ? 99 : leftRank) - (rightRank < 0 ? 99 : rightRank);
  });
  const primary = ranked[0];
  const extension = fileExtension(primary.name);
  const stem = primary.name.replace(/\.[^.]+$/, "").toLowerCase();
  const companions = ["egrid", "grid", "grdecl", "data"].includes(extension)
    ? ["init", "unrst"] : ["dat", "sr3"].includes(extension) ? ["dat", "sr3", "irf"] : [];
  const companion = ranked.slice(1).find((file) =>
    file.name.replace(/\.[^.]+$/, "").toLowerCase() === stem
    && fileExtension(file.name) !== extension
    && companions.includes(fileExtension(file.name)),
  );
  return {
    primary,
    companion,
    extra: ranked.slice(1).filter((file) => file !== companion),
  };
}

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

export async function hostApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const host = (window as Window & {
    QwenPaw?: {
      host?: {
        fetch?: (path: string, init?: RequestInit) => Promise<Response>;
        getApiUrl?: (path: string) => string;
        getApiToken?: () => string | null;
      };
    };
  }).QwenPaw?.host;
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
    ? await new ApiClient(options.apiBase.replace(/\/ugsci\/visualization\/?$/, "") + "/workspace", options.authToken, { headers: options.headers, request: options.request }).request(`/tree?${params.toString()}`, { signal: options.signal })
    : await hostApiFetch(`/workspace/tree?${params.toString()}`, { signal: options.signal });
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
  if (!options.jobId || typeof options.jobId !== "string") throw new Error("导入任务未返回有效编号，请重试");
  const api = new ApiClient(options.apiBase, options.authToken, options);
  for (let attempt = 0; attempt < 240; attempt += 1) {
    if (options.signal?.aborted) throw new Error("导入已取消");
    const status = await api.getJobStatus(options.jobId, options.signal);
    const progress = Number(status.progress);
    const labels: Record<string, string> = { pending: "等待处理", queued: "排队中", running: "处理中", completed: "已完成", failed: "失败", cancelled: "已取消" };
    options.onProgress?.(Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0, labels[String(status.status)] || "处理中");
    if (status.status === "completed") {
      const id = status.result?.id;
      if (!id) throw new Error("导入完成但未返回数据集 ID");
      return { id, name: status.result?.name || status.name };
    }
    if (status.status === "failed" || status.status === "cancelled") {
      throw new Error(status.error || (status.status === "cancelled" ? "导入已取消" : "导入失败"));
    }
    await new Promise((resolve) => window.setTimeout(resolve, 750));
  }
  throw new Error("导入超时，请稍后在组件树中查看是否已出现新对象");
}
