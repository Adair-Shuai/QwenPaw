/**
 * Oil & Gas Visualization — Plugin Page (lightweight shell).
 *
 * This page is the bootstrap entry. It:
 * 1. Shows a loading spinner
 * 2. Lazily loads the viewer runtime (Three.js)
 * 3. Mounts the viewer into a div ref
 * 4. Provides an error boundary and dispose on unmount
 *
 * It does NOT import Three.js directly — the viewer runtime does.
 */

import { getHost } from "../core/runtime";
import {
  loadViewerRuntime,
  type ViewerHandle,
  type ViewerMountOptions,
} from "./viewerLoader";

type RequestedWorkspaceFile = {
  path: string;
  root: string;
  name: string;
  agentId?: string;
  chatId?: string;
  projectDirOverride?: string;
};

function requestedWorkspaceFile(): RequestedWorkspaceFile | null {
  const search = new URLSearchParams(window.location.search);
  const path = search.get("path")?.trim();
  if (!path) return null;
  return {
    path,
    root: search.get("root") || "project",
    name: search.get("name") || path.replace(/\\/g, "/").split("/").pop() || path,
    agentId: search.get("agentId") || undefined,
    chatId: search.get("chatId") || undefined,
    projectDirOverride: search.get("projectDirOverride") || undefined,
  };
}

function workspaceHeaders(host: any, file: RequestedWorkspaceFile) {
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

async function pluginFetch(host: any, path: string, init: RequestInit) {
  if (typeof host.fetch === "function") return host.fetch(path, init);
  const relative = path.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${host.getApiUrl("ugsci/visualization")}${relative}`, init);
}

async function importWorkspaceFile(host: any, file: RequestedWorkspaceFile) {
  const response = await pluginFetch(host, "/ugsci/visualization/imports/workspace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...workspaceHeaders(host, file),
    },
    body: JSON.stringify({
      path: file.path,
      root: file.root,
      name: file.name.replace(/\.[^.]+$/, ""),
    }),
  });
  if (!response.ok) throw new Error(`导入失败: HTTP ${response.status}`);
  const submitted = await response.json();
  for (let attempt = 0; attempt < 240; attempt += 1) {
    const statusResponse = await pluginFetch(
      host,
      `/ugsci/visualization/imports/${submitted.job_id}`,
      { headers: workspaceHeaders(host, file) },
    );
    if (!statusResponse.ok) throw new Error(`状态查询失败: HTTP ${statusResponse.status}`);
    const status = await statusResponse.json();
    if (status.status === "completed") {
      if (!status.result?.id) throw new Error("导入完成但未返回数据集 ID");
      return status.result.id as string;
    }
    if (status.status === "failed" || status.status === "cancelled") {
      throw new Error(status.error || "导入任务未完成");
    }
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
  throw new Error("导入超时，请稍后重试");
}

async function openImportedDataset(handle: ViewerHandle, datasetId: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      await handle.executeCommand?.("open", { datasetId });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (lastError) throw lastError;
}

export function OilGasPluginPage() {
  const React = getHost().React;
  const { useEffect, useRef, useState } = React;
  const { Spin, Alert, Button, Typography, message } = getHost().antd;
  const { Text } = Typography;

  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ViewerHandle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("正在加载三维可视化引擎...");

  useEffect(() => {
    let cancelled = false;

    async function mountViewer() {
      if (!mountRef.current) return;

      try {
        setLoading(true);
        setError(null);

        const runtime = await loadViewerRuntime();
        if (cancelled) return;

        const host = getHost();
        const apiBase = host.getApiUrl("ugsci/visualization");

        // Pass auth token so viewer can make authenticated API calls
        const mountOptions: ViewerMountOptions = {
          apiBase,
          authToken: host.getApiToken() || undefined,
        };

        handleRef.current = runtime.mount(mountRef.current, mountOptions);

        const requestedFile = requestedWorkspaceFile();
        if (requestedFile) {
          setLoadingText(`正在导入 ${requestedFile.name}...`);
          const datasetId = await importWorkspaceFile(host, requestedFile);
          if (cancelled || !handleRef.current) return;
          setLoadingText("正在打开三维网格...");
          await openImportedDataset(handleRef.current, datasetId);
          if (cancelled) return;
        }

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Failed to load viewer";
          setError(msg);
          setLoading(false);
          message.error(`可视化引擎加载失败: ${msg}`);
        }
      }
    }

    mountViewer();

    return () => {
      cancelled = true;
      if (handleRef.current) {
        try {
          handleRef.current.dispose();
        } catch (err) {
          console.warn("[oilgas-vis] Dispose error:", err);
        }
        handleRef.current = null;
      }
    };
  }, []);

  // Error state
  if (error) {
    return React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: 48,
          gap: 16,
        },
      },
      React.createElement(Alert, {
        type: "error",
        message: "可视化引擎加载失败",
        description: error,
        showIcon: true,
        style: { maxWidth: 600 },
      }),
      React.createElement(
        Button,
        {
          type: "primary",
          onClick: () => window.location.reload(),
        },
        "重试",
      ),
      React.createElement(
        Text,
        { type: "secondary" },
        "如果持续失败，请检查网络连接或联系管理员。",
      ),
    );
  }

  return React.createElement(
    "div",
    {
      style: { width: "100%", height: "100%", position: "relative" },
    },
    React.createElement("div", {
      ref: mountRef,
      style: { width: "100%", height: "100%" },
    }),
    loading &&
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          },
        },
        React.createElement(Spin, { size: "large" }),
        React.createElement(
          "div",
          { style: { marginTop: 16, color: "#8b949e" } },
          loadingText,
        ),
      ),
  );
}
