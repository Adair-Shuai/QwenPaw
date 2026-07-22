/**
 * OfficeDocRenderer — Office 文档渲染器
 *
 * 三级 fallback 策略（吸取 LeAgent 优点）：
 * 1. 优先：后端 /api/workspace/convert-office 转换为 HTML（保真度最高）
 * 2. 二级 fallback：后端不可用时，前端纯浏览器解析 OOXML
 *    - DOCX → mammoth.convertToHtml
 *    - XLSX → read-excel-file
 *    - PPTX → JSZip 提取幻灯片
 * 3. 三级 fallback：前端解析也失败 → 文件信息 + 下载按钮
 *
 * 支持的格式：DOCX、XLSX、PPTX（以及旧版 DOC/XLS/PPT，旧版只能走后端）
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
import OfficeOoxmlPreview from "./OfficeOoxmlPreview";
import { isOfficeOoxmlMime } from "../../../utils/mimeForPreview";

const API_BASE = "/api/workspace";

/** 判断是否为 OOXML 格式（可走前端解析） */
function isOoxml(mime: string, ext?: string): boolean {
  if (isOfficeOoxmlMime(mime)) return true;
  const e = (ext ?? "").toLowerCase();
  return e === "docx" || e === "xlsx" || e === "pptx";
}

type FallbackStage = "none" | "client-side" | "download-only";

const OfficeDocRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackStage, setFallbackStage] = useState<FallbackStage>("none");
  const fileUrl = artifact.binaryUrl ?? "";

  const canClientSideParse = isOoxml(artifact.mimeType, artifact.extension);

  const convertDocument = useCallback(async () => {
    if (!fileUrl) {
      setError(t("workspace.noFileUrl"));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setFallbackStage("none");

    // file:/// URLs are local paths that the backend cannot access.
    // Skip the backend conversion attempt entirely and go straight to
    // client-side parsing (OOXML) or download-only fallback.
    if (fileUrl.startsWith("file://")) {
      if (canClientSideParse) {
        setFallbackStage("client-side");
      } else {
        setFallbackStage("download-only");
      }
      setLoading(false);
      return;
    }

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
        // 405 / 404 means the endpoint doesn't exist —
        // 优先走前端解析（仅 OOXML），否则走下载模式
        if (res.status === 405 || res.status === 404) {
          if (canClientSideParse) {
            setFallbackStage("client-side");
          } else {
            setFallbackStage("download-only");
          }
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
      // 网络错误 → 优先前端解析，否则下载
      if (canClientSideParse) {
        setFallbackStage("client-side");
      } else {
        setFallbackStage("download-only");
      }
    } finally {
      setLoading(false);
    }
  }, [fileUrl, artifact.mimeType, t, theme, canClientSideParse]);

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

  // 二级 fallback：前端纯浏览器解析 OOXML
  if (fallbackStage === "client-side") {
    return (
      <OfficeOoxmlPreview
        artifact={artifact}
        theme={theme}
        workspace={workspace}
      />
    );
  }

  // 三级 fallback：仅下载
  if (fallbackStage === "download-only") {
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
        <span
          style={{ fontSize: 13, color: theme === "dark" ? "#ccc" : "#666" }}
        >
          {artifact.extension?.toUpperCase()} 文档无法在浏览器中直接预览
        </span>
        <span style={{ fontSize: 12, color: "#999" }}>{artifact.title}</span>
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
