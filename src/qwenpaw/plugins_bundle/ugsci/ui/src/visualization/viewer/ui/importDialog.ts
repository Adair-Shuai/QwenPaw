/**
 * Local-file and workspace-tree import UI for the reservoir viewer.
 */

import {
  classifyPickedFiles,
  fileAcceptAttribute,
  isImportableFilename,
  listWorkspaceTree,
  pollImportJob,
  type WorkspaceRoot,
  type WorkspaceTreeEntry,
} from "./importFormats";
import { ApiClient } from "../api/client";

export interface ImportDialogHost {
  apiBase: string;
  authToken?: string;
  headers?: Record<string, string>;
  request?: typeof fetch;
  container: HTMLElement;
  onStatus: (message: string) => void;
  onImported: (datasetId: string) => Promise<void>;
}

function overlayStyle(): string {
  return [
    "position:absolute;inset:0;z-index:240;display:flex;align-items:center;justify-content:center;",
    "background:rgba(1,4,9,.62);padding:18px;box-sizing:border-box;",
  ].join("");
}

function panelStyle(): string {
  return [
    "width:min(520px,100%);max-height:min(520px,100%);overflow:auto;",
    "background:#161b22;border:1px solid #30363d;border-radius:10px;",
    "color:#c9d1d9;font:13px/1.4 -apple-system,sans-serif;padding:14px;",
    "box-shadow:0 12px 40px rgba(0,0,0,.45);",
  ].join("");
}

function buttonCss(tone: "default" | "primary" | "ghost" = "default"): string {
  const colors = {
    default: "background:#21262d;color:#c9d1d9;border-color:#484f58;",
    primary: "background:#1f6feb;color:#fff;border-color:#388bfd;",
    ghost: "background:transparent;color:#8b949e;border-color:#30363d;",
  }[tone];
  return `padding:6px 10px;border:1px solid;border-radius:6px;cursor:pointer;font-size:12px;${colors}`;
}

export function createHiddenFileInput(onFiles: (files: File[]) => void): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.accept = fileAcceptAttribute();
  input.style.display = "none";
  input.setAttribute("aria-hidden", "true");
  input.addEventListener("change", () => {
    const files = Array.from(input.files || []);
    input.value = "";
    if (files.length) onFiles(files);
  });
  return input;
}

export function bindDropImport(target: HTMLElement, onFiles: (files: File[]) => void): () => void {
  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer?.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };
  const onDrop = (event: DragEvent) => {
    if (!event.dataTransfer?.files?.length) return;
    event.preventDefault();
    onFiles(Array.from(event.dataTransfer.files));
  };
  target.addEventListener("dragover", onDragOver);
  target.addEventListener("drop", onDrop);
  return () => {
    target.removeEventListener("dragover", onDragOver);
    target.removeEventListener("drop", onDrop);
  };
}

export async function importLocalFiles(host: ImportDialogHost, files: File[]): Promise<void> {
  const picked = classifyPickedFiles(files);
  if (!picked) {
    host.onStatus("没有可导入的油气文件（EGRID/GRDECL/DAT/SR3/LAS/ROFF 等）");
    return;
  }
  host.onStatus(
    picked.companion
      ? `正在上传 ${picked.primary.name} + ${picked.companion.name}...`
      : `正在上传 ${picked.primary.name}...`,
  );
  const api = new ApiClient(host.apiBase, host.authToken, host);
  const submitted = await api.createImport(picked.primary, picked.primary.name.replace(/\.[^.]+$/, ""), undefined, picked.companion);
  const result = await pollImportJob({
    apiBase: host.apiBase,
    authToken: host.authToken,
    headers: host.headers,
    request: host.request,
    jobId: submitted.job_id,
    onProgress: (progress, status) => {
      host.onStatus(`后台解析 ${picked.primary.name}（${status} ${Math.round(progress * 100)}%）`);
    },
  });
  await host.onImported(result.id);
  if (picked.extra.length) {
    host.onStatus(`已导入 ${result.name || result.id}；其余 ${picked.extra.length} 个文件未导入，请逐个导入，或使用「从工作区导入」自动匹配伴随文件`);
  }
}

export async function importWorkspaceFile(
  host: ImportDialogHost,
  path: string,
  root: WorkspaceRoot,
): Promise<void> {
  const name = path.split("/").pop() || path;
  host.onStatus(`正在从工作区提交 ${name}...`);
  const api = new ApiClient(host.apiBase, host.authToken, host);
  const submitted = await api.createWorkspaceImport(path, root, name.replace(/\.[^.]+$/, ""));
  const result = await pollImportJob({
    apiBase: host.apiBase,
    authToken: host.authToken,
    headers: host.headers,
    request: host.request,
    jobId: submitted.job_id,
    onProgress: (progress, status) => {
      host.onStatus(`后台解析 ${name}（${status} ${Math.round(progress * 100)}%）`);
    },
  });
  await host.onImported(result.id);
}

const openPickers = new WeakMap<HTMLElement, () => void>();

export function openWorkspacePicker(host: ImportDialogHost): () => void {
  openPickers.get(host.container)?.();
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  let closed = false;
  let revision = 0;
  let request: AbortController | null = null;
  const rootEl = document.createElement("div");
  rootEl.style.cssText = overlayStyle();
  rootEl.setAttribute("role", "dialog");
  rootEl.setAttribute("aria-label", "从工作区导入");
  rootEl.setAttribute("aria-modal", "true");

  const panel = document.createElement("div");
  panel.style.cssText = panelStyle();

  const title = document.createElement("div");
  title.textContent = "从工作区导入";
  title.style.cssText = "font-weight:600;color:#e6edf3;margin-bottom:6px;font-size:14px;";

  const hint = document.createElement("div");
  hint.textContent = "Eclipse/CMG 的 INIT、UNRST、SR3 会在同目录自动匹配，不必手动多选。";
  hint.style.cssText = "color:#8b949e;font-size:11px;margin-bottom:10px;";

  const toolbar = document.createElement("div");
  toolbar.style.cssText = "display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;align-items:center;";

  let root: WorkspaceRoot = "project";
  let currentPath = "";
  const crumb = document.createElement("div");
  crumb.style.cssText = "flex:1;min-width:120px;color:#58a6ff;font-size:12px;word-break:break-all;";

  const list = document.createElement("div");
  list.style.cssText = "border:1px solid #30363d;border-radius:8px;min-height:220px;max-height:280px;overflow:auto;background:#0d1117;";

  const status = document.createElement("div");
  status.setAttribute("role", "status");
  status.style.cssText = "color:#8b949e;font-size:11px;margin-top:8px;min-height:16px;";

  const close = () => {
    if (closed) return;
    closed = true;
    revision++;
    request?.abort();
    rootEl.remove();
    openPickers.delete(host.container);
    if (previousFocus?.isConnected) previousFocus.focus();
  };

  const setRoot = (next: WorkspaceRoot) => {
    root = next;
    currentPath = "";
    void loadPage();
  };

  const projectBtn = document.createElement("button");
  projectBtn.type = "button";
  projectBtn.textContent = "项目目录";
  const workspaceBtn = document.createElement("button");
  workspaceBtn.type = "button";
  workspaceBtn.textContent = "Agent 工作区";
  const paintRoots = () => {
    projectBtn.style.cssText = buttonCss(root === "project" ? "primary" : "ghost");
    workspaceBtn.style.cssText = buttonCss(root === "workspace" ? "primary" : "ghost");
    projectBtn.setAttribute("aria-pressed", String(root === "project"));
    workspaceBtn.setAttribute("aria-pressed", String(root === "workspace"));
  };
  projectBtn.addEventListener("click", () => {
    setRoot("project");
    paintRoots();
  });
  workspaceBtn.addEventListener("click", () => {
    setRoot("workspace");
    paintRoots();
  });
  paintRoots();

  const upBtn = document.createElement("button");
  upBtn.type = "button";
  upBtn.textContent = "上级";
  upBtn.style.cssText = buttonCss();
  upBtn.addEventListener("click", () => {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    currentPath = parts.join("/");
    void loadPage();
  });

  toolbar.append(projectBtn, workspaceBtn, upBtn, crumb);

  const renderEntries = (entries: WorkspaceTreeEntry[], append: boolean, pageRoot: WorkspaceRoot) => {
    if (!append) list.innerHTML = "";
    list.querySelector("[data-empty]")?.remove();
    const visible = entries.filter((entry) => entry.kind === "directory" || isImportableFilename(entry.name));
    if (list.childElementCount === 0 && visible.length === 0) {
      const empty = document.createElement("div");
      empty.dataset.empty = "true";
      empty.style.cssText = "padding:16px;color:#6e7681;";
      empty.textContent = "此目录没有可导入的油气文件";
      list.appendChild(empty);
      return;
    }
    for (const entry of visible) {
      const row = document.createElement("button");
      row.type = "button";
      row.style.cssText = [
        "display:flex;width:100%;text-align:left;gap:8px;padding:8px 10px;",
        "border:0;border-bottom:1px solid #21262d;background:transparent;color:#c9d1d9;cursor:pointer;",
      ].join("");
      const kind = document.createElement("span");
      kind.textContent = entry.kind === "directory" ? "[目录]" : "[文件]";
      kind.style.cssText = "color:#8b949e;flex:0 0 auto;font-size:11px;";
      const name = document.createElement("span");
      name.textContent = entry.name;
      name.style.cssText = "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
      row.append(kind, name);
      row.addEventListener("click", () => {
        if (entry.kind === "directory") {
          currentPath = entry.path;
          void loadPage();
          return;
        }
        close();
        void importWorkspaceFile(host, entry.path, pageRoot).catch((error) => {
          host.onStatus(error instanceof Error ? error.message : String(error));
        });
      });
      list.appendChild(row);
    }
  };

  const loadPage = async (cursor?: string | null) => {
    const pageRevision = ++revision;
    const pageRoot = root;
    const pagePath = currentPath;
    request?.abort();
    request = new AbortController();
    if (!cursor) list.replaceChildren();
    list.setAttribute("aria-busy", "true");
    status.textContent = "正在读取工作区...";
    crumb.textContent = `${root === "project" ? "项目" : "工作区"} / ${currentPath || ""}`;
    upBtn.disabled = !currentPath;
    try {
      const page = await listWorkspaceTree({ path: pagePath, root: pageRoot, cursor, signal: request.signal, apiBase: host.apiBase, authToken: host.authToken, headers: host.headers, request: host.request });
      if (closed || pageRevision !== revision) return;
      renderEntries(page.entries, Boolean(cursor), pageRoot);
      status.textContent = page.has_more ? "还有更多条目，请点击「加载更多」" : "";
      if (page.has_more && page.next_cursor) {
        const more = document.createElement("button");
        more.type = "button";
        more.textContent = "加载更多";
        more.style.cssText = `${buttonCss()};width:100%;margin:6px 0;`;
        more.addEventListener("click", () => {
          more.remove();
          void loadPage(page.next_cursor);
        });
        list.appendChild(more);
      }
    } catch (error) {
      if (closed || pageRevision !== revision) return;
      status.textContent = error instanceof Error ? error.message : String(error);
      const retry = document.createElement("button");
      retry.type = "button";
      retry.textContent = "重试读取";
      retry.style.cssText = `${buttonCss()};width:100%;margin:6px 0;`;
      retry.addEventListener("click", () => {
        retry.remove();
        void loadPage(cursor);
      });
      list.appendChild(retry);
    } finally {
      if (!closed && pageRevision === revision) list.setAttribute("aria-busy", "false");
    }
  };

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.textContent = "取消";
  cancel.style.cssText = `${buttonCss()};margin-top:10px;`;
  cancel.addEventListener("click", close);
  rootEl.addEventListener("click", (event) => {
    if (event.target === rootEl) close();
  });
  rootEl.addEventListener("keydown", (event) => {
    // Keep modal keystrokes out of the scene's Delete / H / I shortcuts.
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex='0']"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  panel.append(title, hint, toolbar, list, status, cancel);
  rootEl.appendChild(panel);
  host.container.appendChild(rootEl);
  openPickers.set(host.container, close);
  projectBtn.focus();
  void loadPage();
  return close;
}
