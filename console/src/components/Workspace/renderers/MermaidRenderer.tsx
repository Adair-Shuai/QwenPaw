/** MermaidRenderer — Mermaid 图表渲染器 */
import React, { useEffect, useRef, useState } from "react";
import { Button, Tooltip, Spin } from "antd";
import {
  DownloadOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";

const MermaidRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
  hostControls,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const content = artifact.textContent ?? "";

  const renderMermaid = async () => {
    if (!content || !containerRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === "dark" ? "dark" : "default",
        securityLevel: "strict",
      });
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, content);
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    renderMermaid();
  }, [content, theme]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: theme === "dark" ? "#1e1e1e" : "#fff",
      }}
    >
      {!hostControls && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "4px 8px",
            borderBottom: `1px solid ${theme === "dark" ? "#333" : "#f0f0f0"}`,
            flexShrink: 0,
          }}
        >
          <Tooltip title={t("workspace.reload")}>
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={renderMermaid}
            />
          </Tooltip>
          <Tooltip title={t("workspace.download")}>
            <Button
              size="small"
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => workspace.download?.(artifact)}
            />
          </Tooltip>
          <Tooltip title={t("workspace.revealInFileManager", "在文件夹中打开")}>
            <Button
              size="small"
              type="text"
              icon={<FolderOpenOutlined />}
              onClick={() => workspace.revealInFileManager?.(artifact)}
              disabled={!artifact.workspacePath}
            />
          </Tooltip>
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        {loading && (
          <Spin tip={t("workspace.rendering")}>
            <div style={{ minHeight: 48 }} />
          </Spin>
        )}
        {error && (
          <div style={{ color: "#ff4d4f", padding: 16, fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MermaidRenderer;
