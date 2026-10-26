/** Workspace file handoff: no browser copy of large reservoir files. */
import { getHost } from "../core/runtime";
import { loadViewerRuntime, type ViewerHandle } from "./viewerLoader";
import { hostViewerOptions, type WorkspaceFileRef } from "./hostAdapter";
import { ApiClient } from "./viewer/api/client";
import { waitForWorkspaceImport, WorkspaceImportFailedError } from "./workspaceImport";

function InlineViewer({ jobId, file, onOpen, onRetryImport }: { jobId: string; file: WorkspaceFileRef; onOpen: (id: string) => void; onRetryImport: () => void }) {
  const host = getHost();
  const React = host.React;
  const { useEffect, useRef, useState } = React;
  const { Button, Alert } = host.antd;
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("等待后台处理…");
  const [error, setError] = useState<string | null>(null);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const [needsImport, setNeedsImport] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let handle: ViewerHandle | null = null;
    setError(null);
    setNeedsImport(false);
    setReady(false);
    setDatasetId(null);
    const options = hostViewerOptions(host, file);
    const client = new ApiClient(options.apiBase, options.authToken, options);
    void (async () => {
      try {
        const id = await waitForWorkspaceImport(client, jobId, {
          signal: controller.signal,
          onProgress: (job) => setText(`${job.status === "queued" ? "等待后台处理" : "正在解析数据"}（${Math.round(job.progress * 100)}%）`),
        });
        if (controller.signal.aborted) return;
        setDatasetId(id);
        setText("正在加载场景…");
        const runtime = await loadViewerRuntime();
        if (controller.signal.aborted || !containerRef.current) return;
        handle = runtime.mount(containerRef.current, { ...options, initialDatasetId: id, autoLoad: false, compact: true, enableCommands: false });
        await handle.ready;
        if (!controller.signal.aborted) setReady(true);
      } catch (err) {
        if (controller.signal.aborted) return;
        handle?.dispose();
        handle = null;
        setNeedsImport(err instanceof WorkspaceImportFailedError);
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => { controller.abort(); handle?.dispose(); };
  }, [jobId, retry, file.agentId, file.chatId, file.projectDirOverride]);

  return React.createElement("div", { style: { width: "100%", marginTop: 8 } },
    React.createElement("div", { ref: containerRef, "aria-label": "油气三维预览", style: {
      position: "relative", isolation: "isolate", width: "100%", height: 360, minHeight: 0,
      border: "1px solid #30363d", borderRadius: 8, overflow: "hidden", contain: "layout paint style",
      display: error ? "none" : "block",
    } }),
    !ready && !error && React.createElement("div", { role: "status", style: { padding: 12 } }, text),
    error && React.createElement(Alert, { type: "warning", message: "预览失败", description: error, showIcon: true }),
    error && React.createElement(Button, { onClick: () => needsImport ? onRetryImport() : setRetry((value) => value + 1), style: { marginTop: 8 } }, needsImport ? "重新导入" : "重试预览"),
    datasetId && React.createElement(Button, { type: "primary", onClick: () => onOpen(datasetId), style: { marginTop: 8 } }, "在可视化页面展开"),
  );
}

export function OilGasWorkspaceRenderer(props: { artifact?: WorkspaceFileRef; file?: WorkspaceFileRef; workspacePath?: string; filename?: string }) {
  const host = getHost();
  const React = host.React;
  const { useEffect, useState } = React;
  const { Button, Spin, Alert, Typography } = host.antd;
  const navigate = host.useNavigate?.();
  const selectedAgent = host.useSelectedAgent?.().id || host.getSelectedAgentId?.();
  const sourceFile = props.artifact || props.file || {};
  const file: WorkspaceFileRef = { ...sourceFile, agentId: sourceFile.agentId || selectedAgent };
  const fileName = file.filename || file.title || props.filename || "未命名文件";
  const workspacePath = file.workspacePath || file.path || props.workspacePath;
  const importKey = JSON.stringify([workspacePath, fileName, file.workspaceRoot, file.agentId, file.chatId, file.projectDirOverride]);
  const [job, setJob] = useState<{ id: string; key: string } | null>(null);
  const jobId = job?.key === importKey ? job.id : null;
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setJob(null);
    setError(null);
    if (!workspacePath) { setError("文件缺少工作区路径，无法导入预览"); return; }
    const options = hostViewerOptions(host, file);
    const client = new ApiClient(options.apiBase, options.authToken, options);
    void client.createWorkspaceImport(workspacePath, file.workspaceRoot || "project", fileName.replace(/\.[^.]+$/, ""), controller.signal)
      .then((result) => { if (!controller.signal.aborted) setJob({ id: result.job_id, key: importKey }); })
      .catch((err) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : String(err)); });
    return () => controller.abort();
  }, [importKey, retry]);

  const open = (datasetId: string) => {
    if (!navigate) { setError("当前宿主未提供页面导航，请从侧栏打开油气可视化"); return; }
    const query = new URLSearchParams({ datasetId });
    const agentId = file.agentId;
    if (agentId) query.set("agentId", agentId);
    if (file.chatId) query.set("chatId", file.chatId);
    else if (file.projectDirOverride) query.set("projectDirOverride", file.projectDirOverride);
    navigate(`/oilgas-visualization?${query}`);
  };
  return React.createElement("div", { style: { padding: 16, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", width: "100%", boxSizing: "border-box" } },
    React.createElement(Typography.Text, { strong: true }, `文件：${fileName}`),
    !jobId && !error && React.createElement(Spin, { tip: "正在提交工作区文件…" }),
    error && React.createElement(Alert, { type: "warning", message: "预览提示", description: error, showIcon: true }),
    error && !jobId && workspacePath && React.createElement(Button, { onClick: () => setRetry((value) => value + 1) }, "重试导入"),
    jobId && React.createElement(InlineViewer, { key: `${jobId}:${file.agentId || ""}:${file.chatId || ""}:${file.projectDirOverride || ""}`, jobId, file, onOpen: open, onRetryImport: () => setRetry((value) => value + 1) }),
  );
}
