/** Lightweight page shell; all rendering is supplied by the reusable runtime. */
import { getHost } from "../core/runtime";
import { loadViewerRuntime, type ViewerHandle } from "./viewerLoader";
import { hostViewerOptions, type WorkspaceFileRef } from "./hostAdapter";
import { ApiClient } from "./viewer/api/client";
import { waitForWorkspaceImport, WorkspaceImportFailedError } from "./workspaceImport";

export function OilGasPluginPage() {
  const host = getHost();
  const React = host.React;
  const { useEffect, useRef, useState } = React;
  const { Spin, Alert, Button } = host.antd;
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ViewerHandle | null>(null);
  const jobRef = useRef<{ scope: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [loadingText, setLoadingText] = useState("正在加载三维可视化引擎…");
  const selectedAgent = host.useSelectedAgent?.().id || host.getSelectedAgentId?.();
  const locationSearch = host.useLocation?.().search ?? window.location.search;

  useEffect(() => {
    const controller = new AbortController();
    let handle: ViewerHandle | null = null;
    const mount = async () => {
      setLoading(true);
      setError(null);
      setLoadingText("正在加载三维可视化引擎…");
      try {
        const search = new URLSearchParams(locationSearch);
        const path = search.get("path")?.trim();
        const file: WorkspaceFileRef = {
          agentId: search.get("agentId") || selectedAgent,
          chatId: search.get("chatId") || undefined,
          projectDirOverride: search.get("projectDirOverride") || undefined,
        };
        const options = hostViewerOptions(host, file);
        let datasetId = search.get("datasetId") || undefined;
        if (path && !datasetId) {
          const client = new ApiClient(options.apiBase, options.authToken, options);
          const name = search.get("name") || path.replace(/\\/g, "/").split("/").pop() || path;
          setLoadingText(`正在导入 ${name}…`);
          const root = search.get("root") === "workspace" ? "workspace" : "project";
          const scope = JSON.stringify([options.apiBase, options.headers, path, root]);
          if (jobRef.current?.scope !== scope) {
            jobRef.current = null;
            const submitted = await client.createWorkspaceImport(path, root, name.replace(/\.[^.]+$/, ""), controller.signal);
            controller.signal.throwIfAborted();
            jobRef.current = { scope, id: submitted.job_id };
          }
          datasetId = await waitForWorkspaceImport(client, jobRef.current.id, { signal: controller.signal });
        }
        const runtime = await loadViewerRuntime();
        if (controller.signal.aborted || !mountRef.current) return;
        setLoadingText("正在加载场景…");
        handle = runtime.mount(mountRef.current, { ...options, initialDatasetId: datasetId, enableCommands: true });
        handleRef.current = handle;
        await handle.ready;
        if (!controller.signal.aborted) setLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof WorkspaceImportFailedError) jobRef.current = null;
        handle?.dispose();
        handle = null;
        handleRef.current = null;
        setError(err instanceof Error ? err.message : "可视化引擎加载失败");
        setLoading(false);
      }
    };
    void mount();
    return () => {
      controller.abort();
      handle?.dispose();
      if (handleRef.current === handle) handleRef.current = null;
    };
  }, [retry, selectedAgent, locationSearch]);

  return React.createElement("div", { style: { width: "100%", height: "100%", minHeight: 300, position: "relative", overflow: "hidden" } },
    React.createElement("div", { ref: mountRef, style: { width: "100%", height: "100%" } }),
    loading && React.createElement("div", {
      role: "status", style: { position: "absolute", inset: 0, display: "grid", placeContent: "center", textAlign: "center", background: "#0d1117e8", color: "#dce5ef", zIndex: 100 },
    }, React.createElement(Spin, { size: "large" }), React.createElement("div", { style: { marginTop: 16 } }, loadingText)),
    error && React.createElement("div", { style: { position: "absolute", inset: 0, display: "grid", placeContent: "center", padding: 24, gap: 16, background: "#0d1117", zIndex: 100 } },
      React.createElement(Alert, { type: "error", message: "可视化引擎加载失败", description: error, showIcon: true }),
      React.createElement(Button, { type: "primary", onClick: () => setRetry((value) => value + 1) }, "重试")),
  );
}
