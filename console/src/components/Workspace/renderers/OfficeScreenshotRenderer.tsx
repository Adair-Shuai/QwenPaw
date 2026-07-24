/**
 * OfficeScreenshotRenderer — Office 文档截图预览（OfficeCLI 高保真渲染）
 *
 * 降级策略：
 * 1. 优先：调用 /api/workspace/office-screenshot 获取 PNG 截图
 * 2. 降级：officecli 未安装（404）或截图失败 → 委托给 OfficeDocRenderer
 *
 * 当截图可用时，提供 "截图 / HTML" 视图切换按钮。
 *
 * 支持的格式：DOCX、XLSX、PPTX
 */
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Button,
  Space,
  Tooltip,
  Spin,
  Alert,
  Tag,
} from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  FileTextOutlined,
  LeftOutlined,
  RightOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";
import { buildAuthHeaders } from "@/api/authHeaders";
import OfficeDocRenderer from "./OfficeDocRenderer";

const API_BASE = "/api/workspace";

type ViewMode = "screenshot" | "html";

const OfficeScreenshotRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
  readOnly,
  locale,
}) => {
  const { t } = useTranslation();
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0); // 0 = unknown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("screenshot");
  const fileUrl = artifact.binaryUrl ?? "";
  const objectUrlRef = useRef<string>("");

  const fetchScreenshot = useCallback(
    async (page: number) => {
      if (!fileUrl) {
        setError(t("workspace.noFileUrl"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/office-screenshot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...buildAuthHeaders(),
          },
          body: JSON.stringify({ url: fileUrl, page }),
        });

        if (res.status === 404) {
          // officecli not installed — fall back to OfficeDocRenderer
          setUseFallback(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.detail ?? `HTTP ${res.status}`);
        }

        // Revoke previous object URL to avoid memory leak
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setScreenshotUrl(url);

        // Try to get page count from headers (optional)
        const totalHeader = res.headers.get("X-Total-Pages");
        if (totalHeader) {
          const count = parseInt(totalHeader, 10);
          if (count > 0) {
            setPageCount(count);
          }
        }
      } catch (err) {
        // Network error or other failure — fall back to HTML rendering
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    },
    [fileUrl, t],
  );

  useEffect(() => {
    if (viewMode === "screenshot" && !useFallback) {
      fetchScreenshot(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchScreenshot, currentPage, viewMode, useFallback]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  // ── Fallback to OfficeDocRenderer ──
  if (useFallback || viewMode === "html") {
    return (
      <OfficeDocRenderer
        artifact={artifact}
        theme={theme}
        workspace={workspace}
        readOnly={readOnly}
        locale={locale}
      />
    );
  }

  // ── Loading ──
  if (loading && !screenshotUrl) {
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

  // ── Error ──
  if (error && !screenshotUrl) {
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
          message={t("workspace.screenshotFailed")}
          description={error}
          showIcon
        />
        <Space style={{ marginTop: 16 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchScreenshot(currentPage)}
          >
            {t("workspace.retry")}
          </Button>
          <Button
            icon={<CodeOutlined />}
            onClick={() => setViewMode("html")}
          >
            {t("workspace.switchToHtml")}
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

  // ── Screenshot view ──
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toolbar */}
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
          <Tag color="green" style={{ fontSize: 10, marginInlineStart: 4 }}>
            OfficeCLI
          </Tag>
        </Space>

        <Space size={2}>
          {/* Page navigation */}
          <Tooltip title={t("workspace.prevPage")}>
            <Button
              size="small"
              type="text"
              icon={<LeftOutlined />}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            />
          </Tooltip>
          <span style={{ fontSize: 11, color: "#999", minWidth: 40, textAlign: "center" }}>
            {currentPage} / {pageCount > 0 ? pageCount : "?"}
          </span>
          <Tooltip title={t("workspace.nextPage")}>
            <Button
              size="small"
              type="text"
              icon={<RightOutlined />}
              disabled={pageCount > 0 && currentPage >= pageCount}
              onClick={() => setCurrentPage((p) => p + 1)}
            />
          </Tooltip>

          {/* View mode toggle */}
          <Tooltip title={t("workspace.switchToHtml")}>
            <Button
              size="small"
              type="text"
              icon={<CodeOutlined />}
              onClick={() => setViewMode("html")}
            />
          </Tooltip>

          {/* Reload */}
          <Tooltip title={t("workspace.reload")}>
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => fetchScreenshot(currentPage)}
            />
          </Tooltip>

          {/* Download */}
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

      {/* Screenshot image */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          background: theme === "dark" ? "#1e1e1e" : "#f5f5f5",
          padding: 16,
        }}
      >
        {loading && screenshotUrl && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <Spin size="large" />
          </div>
        )}
        {screenshotUrl && (
          <img
            src={screenshotUrl}
            alt={`${artifact.title} - ${t("workspace.page")} ${currentPage}`}
            style={{
              maxWidth: "100%",
              height: "auto",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              borderRadius: 4,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OfficeScreenshotRenderer;
