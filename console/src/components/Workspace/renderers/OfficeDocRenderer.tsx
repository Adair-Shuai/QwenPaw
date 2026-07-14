/**
 * OfficeDocRenderer — Office 文档渲染器
 *
 * 设计灵感：LibreChat 的 html.ts 后端转换
 *
 * 流程：
 * 1. 前端发送文件 URL 到后端 /api/workspace/convert-office
 * 2. 后端使用 mammoth (DOCX) / xlsx (XLSX) / pptx-preview (PPTX) 转换为 HTML
 * 3. 后端对 HTML 进行 sanitize（防止 XSS）
 * 4. 前端在 iframe 中渲染转换后的 HTML
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
  const fileUrl = artifact.binaryUrl ?? "";

  const convertDocument = useCallback(async () => {
    if (!fileUrl) {
      setError(t("workspace.noFileUrl"));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/convert-office`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: fileUrl,
          mimeType: artifact.mimeType,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setHtmlContent(data.html ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [fileUrl, artifact.mimeType, t]);

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
