/**
 * HtmlRenderer — 沙箱 iframe HTML 渲染器
 *
 * 设计灵感：LibreChat 的 HTMLRenderer
 * - 使用 iframe srcdoc 在沙箱中渲染 HTML，防止 XSS
 * - 支持流式更新（实时刷新 iframe 内容）
 * - 支持代码/预览切换
 */
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button, Segmented, Space, Tooltip, Spin } from "antd";
import {
  CodeOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";

const HtmlRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const content = artifact.textContent ?? "";

  const handleDownload = useCallback(() => {
    if (workspace.download) workspace.download(artifact);
  }, [workspace, artifact]);

  const handleReload = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = content;
    }
  }, [content]);

  const previewContent = useMemo(() => {
    if (!content) {
      return (
        <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>
          {artifact.isStreaming ? (
            <Spin tip={t("workspace.streaming")} />
          ) : (
            t("workspace.emptyContent")
          )}
        </div>
      );
    }
    return (
      <iframe
        ref={iframeRef}
        srcDoc={content}
        title={artifact.title}
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: theme === "dark" ? "#1e1e1e" : "#fff",
        }}
      />
    );
  }, [content, artifact.isStreaming, artifact.title, theme, t]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
          borderBottom: `1px solid ${theme === "dark" ? "#333" : "#f0f0f0"}`,
          flexShrink: 0,
        }}
      >
        <Segmented
          size="small"
          value={viewMode}
          onChange={(v) => setViewMode(v as "preview" | "code")}
          options={[
            { label: <EyeOutlined />, value: "preview" },
            { label: <CodeOutlined />, value: "code" },
          ]}
        />
        <Space size={2}>
          <Tooltip title={t("workspace.reload")}>
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleReload}
            />
          </Tooltip>
          <Tooltip title={t("workspace.download")}>
            <Button
              size="small"
              type="text"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
        </Space>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {viewMode === "preview" && previewContent}
        {viewMode === "code" && (
          <pre
            style={{
              margin: 0,
              padding: "12px",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            {content}
          </pre>
        )}
      </div>
    </div>
  );
};

export default HtmlRenderer;
