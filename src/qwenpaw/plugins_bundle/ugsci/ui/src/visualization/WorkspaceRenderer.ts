/**
 * Workspace Renderer — zero-copy file handoff and deferred inline viewer.
 *
 * Large oil-field files must never take the old browser path
 * workspace-download -> Blob -> File -> multipart upload.  The renderer now
 * sends an authenticated workspace-relative path to the backend, which reads
 * the file directly from the agent/project workspace on a worker thread.
 */

import { getHost } from "../core/runtime";
import { loadViewerRuntime, type ViewerHandle } from "./viewerLoader";

type ImportPhase = "queued" | "running" | "completed" | "failed" | "cancelled";

type WorkspaceFileRef = {
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
};

function scopedHeaders(host: any, file: WorkspaceFileRef): Record<string, string> {
  const token = host.getApiToken?.() || "";
  const headers: Record<string, string> = typeof host.buildAuthHeaders === "function"
    ? { ...host.buildAuthHeaders(file.agentId) }
    : (token ? { Authorization: `Bearer ${token}` } : {});
  if (file.agentId) headers["X-Agent-Id"] = file.agentId;
  if (file.chatId) headers["X-Chat-Id"] = file.chatId;
  if (!file.chatId && file.projectDirOverride) {
    headers["X-Session-Project-Dir"] = file.projectDirOverride;
  }
  return headers;
}

async function apiRequest(host: any, path: string, init: RequestInit): Promise<Response> {
  if (typeof host.fetch === "function") {
    return host.fetch(path, init);
  }
  const relative = path.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${host.getApiUrl("ugsci/visualization")}${relative}`, init);
}

function phaseLabel(phase: ImportPhase): string {
  switch (phase) {
    case "queued": return "已提交，等待后台处理";
    case "running": return "后台解析中，大型网格可能需要一些时间";
    case "completed": return "导入完成，正在加载三维场景";
    case "cancelled": return "导入任务已取消";
    default: return "";
  }
}

/** Polls the lightweight job endpoint first; Three.js is loaded only after success. */
function InlineViewer({ jobId, file }: { jobId: string; file: WorkspaceFileRef }) {
  const React = getHost().React;
  const { useEffect, useRef, useState } = React;
  const host = getHost();
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ViewerHandle | null>(null);
  const [phase, setPhase] = useState<ImportPhase>("queued");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [datasetId, setDatasetId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const apiPath = `/ugsci/visualization/imports/${jobId}`;
      for (let attempt = 0; attempt < 240 && !cancelled; attempt += 1) {
        try {
          const response = await apiRequest(host, apiPath, {
            headers: { ...scopedHeaders(host, file) },
          });
          if (!response.ok) throw new Error(`状态查询失败: HTTP ${response.status}`);
          const status = await response.json();
          if (cancelled) return;
          setProgress(Number(status.progress || 0));
          setPhase(status.status as ImportPhase);
          if (status.status === "completed") {
            if (!status.result?.id) throw new Error("导入完成但未返回数据集 ID");
            setDatasetId(status.result.id);
            return;
          }
          if (status.status === "failed" || status.status === "cancelled") {
            setMessage(status.error || phaseLabel(status.status));
            return;
          }
        } catch (err) {
          if (attempt >= 239 && !cancelled) {
            setPhase("failed");
            setMessage(err instanceof Error ? err.message : String(err));
            return;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 750));
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [jobId, file.agentId, file.chatId, file.projectDirOverride]);

  // This effect is intentionally separate from polling: no viewer runtime,
  // canvas, GPU buffers, or default demo dataset exist while import is queued.
  useEffect(() => {
    if (phase !== "completed" || !datasetId || !containerRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const runtime = await loadViewerRuntime();
        if (cancelled || !containerRef.current) return;
        handleRef.current = runtime.mount(containerRef.current, {
          apiBase: host.getApiUrl("ugsci/visualization"),
          authToken: host.getApiToken() || undefined,
        });
        // mount() starts its initial manifest request asynchronously.  A
        // workspace import can finish before that request populates the
        // viewer's in-memory catalog, so retry the open command briefly
        // instead of reporting a false "dataset not found" race.
        let lastError: unknown;
        for (let attempt = 0; attempt < 20 && !cancelled; attempt += 1) {
          try {
            await handleRef.current.executeCommand?.("open", { datasetId });
            lastError = undefined;
            break;
          } catch (err) {
            lastError = err;
            const text = err instanceof Error ? err.message : String(err);
            if (!text.includes("数据集不存在") && !text.includes("dataset")) {
              throw err;
            }
            await new Promise((resolve) => setTimeout(resolve, 250));
          }
        }
        if (lastError && !cancelled) throw lastError;
      } catch (err) {
        if (!cancelled) {
          setPhase("failed");
          setMessage(err instanceof Error ? err.message : String(err));
        }
      }
    })();
    return () => {
      cancelled = true;
      try { handleRef.current?.dispose(); } catch {}
      handleRef.current = null;
    };
  }, [phase, datasetId]);

  return React.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    phase === "completed"
      ? React.createElement("div", {
          ref: containerRef,
          style: {
            // The legacy viewer uses absolute-positioned panels.  Establish a
            // local positioning context so those panels stay inside the
            // preview card instead of anchoring to the workspace viewport.
            position: "relative",
            isolation: "isolate",
            width: "100%", height: "300px", minHeight: 0,
            border: "1px solid #30363d", borderRadius: 8, overflow: "hidden",
            contain: "layout paint style",
          },
        })
      : React.createElement(
          "div",
          { style: { padding: "12px 16px", width: "100%", color: "#8b949e" } },
          `${phaseLabel(phase)}${progress > 0 ? `（${Math.round(progress * 100)}%）` : ""}`,
        ),
    message
      ? React.createElement(
          "div",
          { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
          `预览状态：${message}`,
        )
      : null,
  );
}

export function OilGasWorkspaceRenderer(props: {
  artifact?: WorkspaceFileRef;
  file?: WorkspaceFileRef;
  workspacePath?: string;
  filename?: string;
}) {
  const React = getHost().React;
  const { useEffect, useState } = React;
  const { Button, Spin, Alert, Typography } = getHost().antd;
  const { Text } = Typography;

  const file = props.artifact || props.file || {};
  const fileName = file.filename || file.title || props.filename || "unknown";
  const workspacePath = file.workspacePath || file.path || props.workspacePath;
  const [phase, setPhase] = useState<"idle" | "submitting" | "submitted" | "failed">("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspacePath) return;
    let cancelled = false;
    setPhase("submitting");
    setJobId(null);
    setError(null);

    (async () => {
      try {
        const host = getHost();
        const response = await apiRequest(host, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...scopedHeaders(host, file),
          },
          body: JSON.stringify({
            path: workspacePath,
            root: file.workspaceRoot || "project",
            name: fileName.replace(/\.[^.]+$/, ""),
          }),
        });
        if (!response.ok) throw new Error(`Import failed: HTTP ${response.status}`);
        const result = await response.json();
        if (!cancelled) {
          setJobId(result.job_id);
          setPhase("submitted");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setPhase("failed");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [workspacePath, fileName, file.workspaceRoot, file.agentId, file.chatId, file.projectDirOverride]);

  if (phase === "submitting") {
    return React.createElement(
      "div",
      { style: { padding: 24, textAlign: "center" } },
      React.createElement(Spin, { size: "large" }),
      React.createElement("div", { style: { marginTop: 8, color: "#8b949e" } },
        "正在提交工作区文件，浏览器不会复制大型文件..."),
    );
  }

  if (phase === "failed") {
    return React.createElement(
      "div",
      { style: { padding: 24 } },
      React.createElement(Alert, {
        type: "warning", message: "导入失败", description: error, showIcon: true,
      }),
      React.createElement(Button, {
        type: "primary", onClick: () => window.location.reload(), style: { marginTop: 12 },
      }, "重试"),
    );
  }

  return React.createElement(
    "div",
    { style: { padding: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" } },
    React.createElement(Text, { strong: true }, `文件: ${fileName}`),
    file.size ? React.createElement(Text, { type: "secondary" }, `大小: ${(file.size / 1024 / 1024).toFixed(1)} MB`) : null,
    jobId
      ? React.createElement(InlineViewer, { jobId, file })
      : React.createElement(Text, { type: "secondary" }, "正在准备导入任务..."),
    React.createElement(Button, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization");
        window.dispatchEvent(new PopStateEvent("popstate"));
      },
    }, "打开油气可视化页面"),
  );
}
