/** Shared import filename rules for the viewer picker and workspace browser. */

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
  return {
    primary: ranked[0],
    companion: ranked[1],
    extra: ranked.slice(2),
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
}): Promise<WorkspaceTreePage> {
  const params = new URLSearchParams();
  if (options.path) params.set("path", options.path);
  params.set("root", options.root || "project");
  if (options.cursor) params.set("cursor", options.cursor);
  const response = await hostApiFetch(`/workspace/tree?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `工作区列表失败: HTTP ${response.status}`);
  }
  return response.json() as Promise<WorkspaceTreePage>;
}

export async function pollImportJob(options: {
  apiBase: string;
  authToken?: string;
  jobId: string;
  onProgress?: (progress: number, status: string) => void;
  signal?: AbortSignal;
}): Promise<{ id: string; name?: string }> {
  const headers: Record<string, string> = options.authToken
    ? { Authorization: `Bearer ${options.authToken}` }
    : {};
  for (let attempt = 0; attempt < 240; attempt += 1) {
    if (options.signal?.aborted) throw new Error("导入已取消");
    const response = await fetch(`${options.apiBase}/imports/${options.jobId}`, {
      headers,
      signal: options.signal,
    });
    if (!response.ok) throw new Error(`导入状态查询失败: HTTP ${response.status}`);
    const status = await response.json();
    options.onProgress?.(Number(status.progress || 0), String(status.status || ""));
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
