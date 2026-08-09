/**
 * Workspace Renderer — file preview component with inline viewer.
 */

import { getHost } from "../core/runtime";
import { loadViewerRuntime, type ViewerHandle } from "./viewerLoader";

/** Inline viewer sub-component — loads viewer runtime into a container. */
function InlineViewer({ jobId }: { jobId: string }) {
  const React = getHost().React;
  const { useEffect, useRef } = React;

  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ViewerHandle | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    async function mount() {
      try {
        const host = getHost();
        const runtime = await loadViewerRuntime();
        if (cancelled || !containerRef.current) return;
        handleRef.current = runtime.mount(containerRef.current, {
          apiBase: host.getApiUrl("oilgas-vis"),
          authToken: host.getApiToken() || undefined,
        });
      } catch {
        // Inline load failed — user can click the button
      }
    }
    mount();

    return () => {
      cancelled = true;
      if (handleRef.current) {
        try { handleRef.current.dispose(); } catch {}
        handleRef.current = null;
      }
    };
  }, [jobId]);

  return React.createElement("div", {
    ref: containerRef,
    style: {
      width: "100%", height: "300px", marginTop: 8,
      border: "1px solid #30363d", borderRadius: 8, overflow: "hidden",
    },
  });
}

export function OilGasWorkspaceRenderer(props: {
  artifact?: { workspacePath?: string; filename?: string; id?: string };
}) {
  const React = getHost().React;
  const { useEffect, useState } = React;
  const { Button, Spin, Alert, Typography } = getHost().antd;
  const { Text } = Typography;

  const [importing, setImporting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileName = props.artifact?.filename || "unknown";
  const workspacePath = props.artifact?.workspacePath;

  useEffect(() => {
    if (!workspacePath) return;
    let cancelled = false;
    setImporting(true);
    setError(null);

    async function importFile() {
      try {
        const host = getHost();
        const apiBase = host.getApiUrl("oilgas-vis");
        const token = host.getApiToken() || "";

        const fileResp = await fetch(
          `${apiBase}/resource/${encodeURIComponent(workspacePath)}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {},
        );

        if (!fileResp.ok) {
          setImporting(false);
          return;
        }

        const blob = await fileResp.blob();
        const file = new File([blob], fileName);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", fileName.split(".")[0]);

        const resp = await fetch(`${apiBase}/imports`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (!resp.ok) throw new Error(`Import failed: HTTP ${resp.status}`);
        const result = await resp.json();

        if (!cancelled) {
          setJobId(result.job_id);
          setImporting(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setImporting(false);
        }
      }
    }

    importFile();
    return () => { cancelled = true; };
  }, [workspacePath, fileName]);

  if (importing) {
    return React.createElement(
      "div",
      { style: { padding: 24, textAlign: "center" } },
      React.createElement(Spin, { size: "large" }),
      React.createElement(
        "div",
        { style: { marginTop: 8, color: "#8b949e" } },
        "正在导入并转换文件...",
      ),
    );
  }

  if (error) {
    return React.createElement(
      "div",
      { style: { padding: 24 } },
      React.createElement(Alert, {
        type: "warning", message: "导入失败", description: error, showIcon: true,
      }),
      React.createElement(
        Button,
        { type: "primary", onClick: () => window.location.reload(), style: { marginTop: 12 } },
        "重试",
      ),
    );
  }

  return React.createElement(
    "div",
    {
      style: {
        padding: 24, display: "flex", flexDirection: "column",
        gap: 12, alignItems: "center",
      },
    },
    React.createElement(Text, { strong: true }, `文件: ${fileName}`),
    jobId
      ? React.createElement(Text, { type: "success" }, `导入完成 (job: ${jobId})`)
      : React.createElement(Text, { type: "secondary" }, "此文件类型需要在可视化页面中查看。"),
    React.createElement(
      Button,
      {
        type: "primary",
        onClick: () => { window.location.href = "/oilgas-visualization"; },
      },
      "打开油气可视化页面",
    ),
    jobId ? React.createElement(InlineViewer, { jobId }) : null,
  );
}
