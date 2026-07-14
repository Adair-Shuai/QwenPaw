/**
 * SandpackRenderer — 代码执行预览渲染器
 *
 * 设计灵感：LibreChat 的 ArtifactPreview（使用 @codesandbox/sandpack-react）
 * - 支持 React/HTML/CSS 实时预览
 * - 沙箱环境安全执行
 * - 流式更新：代码变化时自动刷新预览
 */
import React, { useState, useEffect } from "react";
import { Button, Segmented, Space, Tooltip, Spin } from "antd";
import { CodeOutlined, EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";

type ViewMode = "preview" | "code";

const SandpackRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [sandpackLoaded, setSandpackLoaded] = useState(false);
  const [sandpackMod, setSandpackMod] = useState<any>(null);
  const code = artifact.textContent ?? "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("@codesandbox/sandpack-react");
        if (!cancelled) {
          setSandpackMod(mod);
          setSandpackLoaded(true);
        }
      } catch {
        if (!cancelled) setSandpackLoaded(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (viewMode === "code") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Toolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          artifact={artifact}
          workspace={workspace}
          t={t}
        />
        <pre
          style={{
            margin: 0,
            padding: 12,
            fontSize: 13,
            flex: 1,
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {code}
        </pre>
      </div>
    );
  }

  if (!sandpackLoaded || !sandpackMod) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Toolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          artifact={artifact}
          workspace={workspace}
          t={t}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin tip={t("workspace.loadingSandpack")} />
        </div>
      </div>
    );
  }

  const { SandpackProvider, SandpackPreview } = sandpackMod;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        artifact={artifact}
        workspace={workspace}
        t={t}
      />
      <div style={{ flex: 1, position: "relative" }}>
        <SandpackProvider
          template="react"
          files={{
            "/App.js": { code, active: true },
          }}
          theme={theme === "dark" ? "dark" : "light"}
        >
          <SandpackPreview style={{ height: "100%" }} />
        </SandpackProvider>
      </div>
    </div>
  );
};

const Toolbar: React.FC<any> = ({
  viewMode,
  setViewMode,
  artifact,
  workspace,
  t,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "4px 8px",
      borderBottom: "1px solid #f0f0f0",
      flexShrink: 0,
    }}
  >
    <Segmented
      size="small"
      value={viewMode}
      onChange={(v) => setViewMode(v as ViewMode)}
      options={[
        { label: <EyeOutlined />, value: "preview" },
        { label: <CodeOutlined />, value: "code" },
      ]}
    />
    <Space size={2}>
      <Tooltip title={t("workspace.download")}>
        <Button
          size="small"
          type="text"
          icon={<DownloadOutlined />}
          onClick={() => workspace.download?.(artifact)}
        />
      </Tooltip>
    </Space>
  </div>
);

export default SandpackRenderer;
