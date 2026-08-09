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

export function OilGasPluginPage() {
  const React = getHost().React;
  const { useEffect, useRef, useState } = React;
  const { Spin, Alert, Button, Typography, message } = getHost().antd;
  const { Text } = Typography;

  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ViewerHandle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const apiBase = host.getApiUrl("oilgas-vis");

        // Pass auth token so viewer can make authenticated API calls
        const mountOptions: ViewerMountOptions = {
          apiBase,
          authToken: host.getApiToken() || undefined,
        };

        handleRef.current = runtime.mount(mountRef.current, mountOptions);

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
          "正在加载三维可视化引擎...",
        ),
      ),
  );
}
