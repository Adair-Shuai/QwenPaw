/**
 * OfficeDocRenderer — Office 文档渲染器
 *
 * 当后端支持 /api/workspace/convert-office 时，将 Office 文档转换为 HTML
 * 并在 iframe 中渲染。当后端不支持该端点时（返回 405），自动回退为
 * 文件信息 + 下载按钮模式。
 *
 * 支持的格式：DOCX、XLSX、PPTX（以及旧版 DOC/XLS/PPT）
 */
import React, { useEffect, useState, useCallback } from "react";
import { Button, Space, Tooltip, Spin, Alert } from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";
import { buildAuthHeaders } from "@/api/authHeaders";

const API_BASE = "/api/workspace";

const OfficeDocRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const fileUrl = artifact.binaryUrl ?? "";

  const convertDocument = useCallback(async () => {
    if (!fileUrl) {
      setError(t("workspace.noFileUrl"));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setFallbackMode(false);
    try {
      const res = await fetch(`${API_BASE}/convert-office`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({
          url: fileUrl,
          mimeType: artifact.mimeType,
        }),
      });
      if (!res.ok) {
        // 405 Method Not Allowed means the endpoint doesn't exist —
        // fall back to download mode instead of showing an error.
        if (res.status === 405 || res.status === 404) {
          setFallbackMode(true);
          setLoading(false);
          return;
        }
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      const rawHtml = data.html ?? "";
      // Build theme-aware CSS based on the app's current theme (not the
      // system preference, which would mismatch inside an iframe).
      const isDark = theme === "dark";
      const bgColor = isDark ? "#1e1e1e" : "#ffffff";
      const textColor = isDark ? "#d4d4d4" : "#333333";
      const borderColor = isDark ? "#444444" : "#e0e0e0";
      const thBg = isDark ? "#2a2a2a" : "#f5f5f5";
      const cellBorder = isDark ? "#555555" : "#dddddd";
      const styledHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 24px 32px; line-height: 1.7; color: ${textColor}; background: ${bgColor}; max-width: 900px; margin: 0 auto; }
        h1 { font-size: 1.6em; border-bottom: 2px solid ${borderColor}; padding-bottom: 8px; margin-top: 1.5em; }
        h2 { font-size: 1.3em; margin-top: 1.2em; }
        h3 { font-size: 1.1em; margin-top: 1em; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        th, td { border: 1px solid ${cellBorder}; padding: 8px 12px; text-align: left; }
        th { background: ${thBg}; font-weight: 600; }
        img { max-width: 100%; height: auto; }
        a { color: ${isDark ? "#4d9eff" : "#1677ff"}; }
        ul, ol { padding-left: 1.5em; }
        .docx-page-break {
          position: relative;
          margin: 32px 0;
          height: 0;
          border-top: 2px dashed ${isDark ? "#555" : "#ccc"};
        }
        .docx-page-break::after {
          content: "— Page Break —";
          position: absolute;
          top: -11px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: ${isDark ? "#888" : "#999"};
          background: ${bgColor};
          padding: 0 12px;
          white-space: nowrap;
        }
      </style></head><body>${rawHtml}</body></html>`;
      setHtmlContent(styledHtml);
    } catch (err) {
      // Network error or other failure — fall back to download mode
      setFallbackMode(true);
    } finally {
      setLoading(false);
    }
  }, [fileUrl, artifact.mimeType, t, theme]);

  useEffect(() => {
    convertDocument();
  }, [convertDocument]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          background: theme === "dark" ? "#1e1e1e" : "#fff",
        }}
      >
        <Spin tip={t("workspace.converting")} size="large" />
      </div>
    );
  }

  // Fallback mode: backend doesn't support conversion — show download button
  if (fallbackMode) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: 24,
          gap: 12,
          background: theme === "dark" ? "#1e1e1e" : "#fafafa",
        }}
      >
        <FileTextOutlined style={{ fontSize: 48, color: "#999" }} />
        <span style={{ fontSize: 13, color: theme === "dark" ? "#ccc" : "#666" }}>
          {artifact.extension?.toUpperCase()} 文档无法在浏览器中直接预览
        </span>
        <span style={{ fontSize: 12, color: "#999" }}>
          {artifact.title}
        </span>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => workspace.download?.(artifact)}
        >
          {t("workspace.download")}
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 24,
          height: "100%",
          overflow: "auto",
          background: theme === "dark" ? "#1e1e1e" : "#fff",
        }}
      >
        <Alert
          type="warning"
          message={t("workspace.convertFailed")}
          description={error}
          showIcon
        />
        <Space style={{ marginTop: 16 }}>
          <Button icon={<ReloadOutlined />} onClick={convertDocument}>
            {t("workspace.retry")}
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => workspace.download?.(artifact)}
          >
            {t("workspace.download")}
          </Button>
        </Space>
      </div>
    );
  }

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
        <Space size={4}>
          <FileTextOutlined />
          <span style={{ fontSize: 12, color: "#999" }}>
            {artifact.extension?.toUpperCase()}
          </span>
        </Space>
        <Space size={2}>
          <Tooltip title={t("workspace.reload")}>
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={convertDocument}
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
        </Space>
      </div>
      <iframe
        srcDoc={htmlContent}
        title={artifact.title}
        sandbox="allow-same-origin"
        style={{ width: "100%", flex: 1, border: "none", background: "#fff" }}
      />
    </div>
  );
};

export default OfficeDocRenderer;
