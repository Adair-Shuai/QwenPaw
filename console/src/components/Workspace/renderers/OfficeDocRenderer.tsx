/**
 * OfficeDocRenderer — Office 文档渲染器
 *
 * 三级 fallback 策略（吸取 LeAgent 优点）：
 * 1. 优先：后端 /api/workspace/convert-office 转换为 HTML（保真度最高）
 * 2. 二级 fallback（@deprecated 计划移除）：后端不可用时，前端纯浏览器解析 OOXML
 *    - DOCX → mammoth.convertToHtml
 *    - XLSX → read-excel-file
 *    - PPTX → JSZip 提取幻灯片
 *    注意：此 fallback 依赖 mammoth/read-excel-file (~10MB)，
 *    待 officecli 稳定后将在后续版本中移除，简化为两级 fallback。
 * 3. 三级 fallback：前端解析也失败 → 文件信息 + 下载按钮
 *
 * 支持的格式：DOCX、XLSX、PPTX（以及旧版 DOC/XLS/PPT，旧版只能走后端）
 */
import React, { useEffect, useState, useCallback } from "react";
import { Button, Space, Tooltip, Spin, Alert, Tag } from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";
import { buildWorkspaceScopeHeaders } from "@/api/authHeaders";
import OfficeOoxmlPreview from "./OfficeOoxmlPreview";
import { isOfficeOoxmlMime } from "../../../utils/mimeForPreview";

const API_BASE = "/api/workspace";

/**
 * In-memory cache for officecli conversion results.
 * Key: fileUrl, Value: { html, engine, timestamp }
 * Avoids re-converting the same file when switching tabs back and forth.
 * Entries expire after 5 minutes to handle file edits.
 * Capped at 50 entries; stale entries are evicted on read.
 */
const _convertCache = new Map<
  string,
  { html: string; engine: string; ts: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_SIZE = 50;

/** Evict expired and overflow entries from the module-level cache. */
function _evictConvertCache() {
  const now = Date.now();
  for (const [key, val] of _convertCache) {
    if (now - val.ts >= CACHE_TTL) {
      _convertCache.delete(key);
    }
  }
  if (_convertCache.size > CACHE_MAX_SIZE) {
    const sorted = [..._convertCache.entries()].sort(
      (a, b) => a[1].ts - b[1].ts,
    );
    for (let i = 0; i < _convertCache.size - CACHE_MAX_SIZE; i++) {
      _convertCache.delete(sorted[i][0]);
    }
  }
}

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
  hostControls,
}) => {
  const { t } = useTranslation();
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackStage, setFallbackStage] = useState<FallbackStage>("none");
  const [rendererEngine, setRendererEngine] = useState<"officecli" | "legacy">(
    "legacy",
  );
  const fileUrl = artifact.binaryUrl ?? "";
  const cacheKey = [
    artifact.agentId ?? "",
    artifact.chatId ?? "",
    artifact.projectDirOverride ?? "",
    artifact.workspaceRoot ?? "",
    fileUrl,
  ].join("|");

  // Workspace files must use the backend OfficeCLI pipeline. Browser-side
  // OOXML parsing remains only as compatibility for detached uploads whose
  // backend URL may no longer be reachable.
  const canClientSideParse =
    !artifact.workspaceRoot && isOoxml(artifact.mimeType, artifact.extension);

  const convertDocument = useCallback(async () => {
    if (!fileUrl) {
      setError(t("workspace.noFileUrl"));
      setLoading(false);
      return;
    }

    // Check cache first — avoids re-converting when switching tabs.
    // Eviction runs here so stale entries are cleaned up on every access.
    _evictConvertCache();
    const cached = _convertCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setHtmlContent(cached.html);
      setRendererEngine(cached.engine as "officecli" | "legacy");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setFallbackStage("none");

    // Always try backend conversion first. The backend runs locally
    // (both in Tauri desktop and Vite dev mode) and can access local
    // files, including file:// paths. If the backend is unreachable or
    // returns 404/405, detached uploads may use the compatibility parser;
    // workspace-backed files stay on the backend pipeline.
    try {
      const res = await fetch(`${API_BASE}/convert-office`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...buildWorkspaceScopeHeaders({
            agentId: artifact.agentId,
            chatId: artifact.chatId,
            projectDirOverride: artifact.projectDirOverride,
          }),
        },
        body: JSON.stringify({
          url: fileUrl,
          mime_type: artifact.mimeType,
        }),
      });
      if (!res.ok) {
        // A detached OOXML upload may use the compatibility parser. Files
        // owned by /files never silently switch away from the backend.
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
      const isOfficecli = data.engine === "officecli";
      setRendererEngine(isOfficecli ? "officecli" : "legacy");

      if (isOfficecli) {
        // officecli returns a complete standalone HTML document with
        // its own CSS and JavaScript for high-fidelity rendering.
        // Do NOT wrap it in our template — use it as-is so scripts
        // and styles work correctly.
        setHtmlContent(rawHtml);
        _convertCache.set(cacheKey, {
          html: rawHtml,
          engine: "officecli",
          ts: Date.now(),
        });
      } else {
        // Legacy rendering: wrap in theme-aware styled template
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
        _convertCache.set(cacheKey, {
          html: styledHtml,
          engine: "legacy",
          ts: Date.now(),
        });
      }
    } catch (err) {
      // Detached uploads retain the browser fallback. Workspace-backed files
      // surface the backend error instead of silently changing render engines.
      if (canClientSideParse) {
        setFallbackStage("client-side");
      } else {
        setError(
          err instanceof Error ? err.message : t("workspace.convertFailed"),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    artifact.agentId,
    artifact.chatId,
    artifact.mimeType,
    artifact.projectDirOverride,
    cacheKey,
    canClientSideParse,
    fileUrl,
    t,
    theme,
  ]);

  useEffect(() => {
    convertDocument();
  }, [convertDocument]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          background: theme === "dark" ? "#1e1e1e" : "#fff",
        }}
      >
        <Spin size="large" />
        <span style={{ marginTop: 12, color: "#999", fontSize: 12 }}>
          {t("workspace.converting")}
        </span>
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
        hostControls={hostControls}
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
        {artifact.workspacePath && (
          <Button
            icon={<FolderOpenOutlined />}
            onClick={() => workspace.revealInFileManager?.(artifact)}
          >
            {t("workspace.revealInFileManager", "在文件夹中打开")}
          </Button>
        )}
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
          {artifact.workspacePath && (
            <Button
              icon={<FolderOpenOutlined />}
              onClick={() => workspace.revealInFileManager?.(artifact)}
            >
              {t("workspace.revealInFileManager", "在文件夹中打开")}
            </Button>
          )}
        </Space>
      </div>
    );
  }

  // OfficeCLI's spreadsheet document includes a colored `.file-title` bar.
  // FilesWorkspace already presents the filename in its tab strip, so keeping
  // that bar would recreate the duplicate header that hostControls removes
  // from the React renderer chrome.
  const previewHtml =
    hostControls && rendererEngine === "officecli"
      ? htmlContent.replace(
          /<\/head>/i,
          "<style>.file-title{display:none!important}</style></head>",
        )
      : htmlContent;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {!hostControls && (
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
            {rendererEngine === "officecli" && (
              <Tag color="green" style={{ fontSize: 10, marginInlineStart: 4 }}>
                OfficeCLI
              </Tag>
            )}
            {rendererEngine === "legacy" && fallbackStage === "none" && (
              <Tag
                color="orange"
                style={{ fontSize: 10, marginInlineStart: 4 }}
              >
                {t("workspace.basicRender")}
              </Tag>
            )}
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
            <Tooltip
              title={t("workspace.revealInFileManager", "在文件夹中打开")}
            >
              <Button
                size="small"
                type="text"
                icon={<FolderOpenOutlined />}
                onClick={() => workspace.revealInFileManager?.(artifact)}
                disabled={!artifact.workspacePath}
              />
            </Tooltip>
          </Space>
        </div>
      )}
      <iframe
        srcDoc={previewHtml}
        title={artifact.title}
        sandbox={
          rendererEngine === "officecli" ? "allow-scripts" : "allow-same-origin"
        }
        style={{ width: "100%", flex: 1, border: "none", background: "#fff" }}
      />
    </div>
  );
};

/** Clear the in-memory conversion cache (for testing). */
export function _clearConvertCache() {
  _convertCache.clear();
}

export default OfficeDocRenderer;
