/**
 * OfficeOoxmlPreview — 纯前端 OOXML 预览（fallback 专用）
 *
 * @deprecated 此前端解析模块计划在后续版本中移除。
 * 后端 officecli 已能稳定、高保真地渲染 DOCX/XLSX/PPTX，
 * 前端解析仅在 officecli 不可用时作为最后 fallback。
 * 如果 officecli 在未来几个版本中保持稳定，此模块及其
 * 独占依赖（mammoth、read-excel-file）将被移除以减少
 * 约 10MB 的 node_modules 体积。
 * 新功能不应依赖此模块，请使用后端 convert-office 端点。
 *
 * 当后端 /api/workspace/convert-office 不可用时，作为二级 fallback：
 * - DOCX：用 mammoth.convertToHtml({ arrayBuffer }) 转为 HTML
 * - XLSX：用 read-excel-file 解析为行列数据，渲染为表格
 * - PPTX：用 JSZip 提取 ppt/slides/slide*.xml，解析文本和布局，渲染为简化幻灯片
 *
 * 设计要点（吸取 LeAgent 优点）：
 * - 动态 import 第三方库，未安装也不崩
 * - 主题感知（light/dark）
 * - 进度/错误状态明确
 * - 渲染结果放沙箱 iframe（HTML 类）或原生表格（XLSX），避免 XSS
 * - 支持超时取消（防止大文件卡死）
 */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Space, Tooltip, Spin, Alert, Tag } from "antd";
import {
  DownloadOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  ReloadOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import JSZip from "jszip";
import type { RendererContext } from "../types";
import { buildAuthHeaders } from "@/api/authHeaders";
import { isDesktopTauriRuntime } from "@/utils/openExternalLink";
import { invoke } from "@tauri-apps/api/core";
import { useAgentStore } from "@/stores/agentStore";
import { workspaceApi } from "@/api/modules/workspace";

type PreviewKind = "docx" | "xlsx" | "pptx" | "unknown";

interface PreviewState {
  loading: boolean;
  error: string | null;
  /** DOCX 渲染出的 HTML */
  html: string;
  /** XLSX 解析出的 sheet 数据 */
  sheets: { name: string; rows: string[][] }[];
  activeSheet: number;
  /** PPTX 所有幻灯片 HTML */
  pptxSlides: string[];
  slideCount: number;
  currentSlide: number;
}

const EMPTY_STATE: PreviewState = {
  loading: true,
  error: null,
  html: "",
  sheets: [],
  activeSheet: 0,
  pptxSlides: [],
  slideCount: 0,
  currentSlide: 1,
};

/** 根据扩展名/MIME 判定预览类型 */
function detectKind(mime: string, ext?: string): PreviewKind {
  const e = (ext ?? "").toLowerCase();
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    e === "docx"
  )
    return "docx";
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    e === "xlsx"
  )
    return "xlsx";
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    e === "pptx"
  )
    return "pptx";
  return "unknown";
}

/**
 * 获取文件 ArrayBuffer（带鉴权头）
 *
 * 处理三种 URL 类型：
 * 1. file:/// URL — 浏览器无法直接 fetch，需通过 Tauri invoke 或转换为 API URL
 * 2. http(s):// URL — 直接 fetch，附带鉴权头
 * 3. 相对路径 — 通过 workspace API fetch
 */
async function fetchArrayBuffer(
  url: string,
  signal: AbortSignal | undefined,
  agentId: string,
): Promise<ArrayBuffer> {
  // file:/// URLs: browser security blocks direct fetch.
  // Use Tauri invoke in desktop mode, or convert to workspace API URL.
  if (url.startsWith("file://")) {
    // Strip "file://" (7 chars), then URL-decode.
    // file:///tmp/test.docx   → /tmp/test.docx  (Unix absolute)
    // file:///C:/Users/...    → /C:/Users/...   → C:/Users/... (Windows)
    // file://localhost/path   → /path
    let filePath = decodeURIComponent(url.slice(7));
    // On Windows, strip leading "/" before a drive letter: /C:/x → C:/x
    if (
      filePath.length > 2 &&
      filePath[0] === "/" &&
      filePath[2] === ":" &&
      /^[a-zA-Z]$/.test(filePath[1])
    ) {
      filePath = filePath.slice(1);
    }

    // Tauri desktop: read file directly from disk
    if (isDesktopTauriRuntime()) {
      const response = await invoke<ArrayBuffer | number[]>(
        "read_workspace_binary_file",
        { filePath, agentId },
      );
      // Tauri returns either an ArrayBuffer or a number[] depending on
      // the IPC channel; both are accepted by the Uint8Array constructor.
      return new Uint8Array(response).buffer;
    }

    // Browser: convert file:/// path to workspace API URL
    const apiUrl = workspaceApi.getBinaryFileUrl(filePath);
    const res = await fetch(apiUrl, {
      headers: { ...buildAuthHeaders() },
      signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.arrayBuffer();
  }

  // Standard HTTP or relative URL
  const res = await fetch(url, {
    headers: { ...buildAuthHeaders() },
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.arrayBuffer();
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCX：mammoth 转 HTML
// ─────────────────────────────────────────────────────────────────────────────

async function convertDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value || "<p>(empty document)</p>";
}

// ─────────────────────────────────────────────────────────────────────────────
// XLSX：read-excel-file 解析为行列
// ─────────────────────────────────────────────────────────────────────────────

async function convertXlsx(
  arrayBuffer: ArrayBuffer,
): Promise<{ name: string; rows: string[][] }[]> {
  const readXlsxFile = (await import("read-excel-file/browser")).default;
  // read-excel-file 默认返回所有 sheet：{ sheet: string, data: Row[] }[]
  const rawSheets = await readXlsxFile(arrayBuffer);
  const sheets: { name: string; rows: string[][] }[] = [];

  for (const raw of rawSheets) {
    const stringRows: string[][] = (raw.data ?? []).map((row) =>
      (Array.isArray(row) ? row : []).map((cell) =>
        cell === null || cell === undefined ? "" : String(cell),
      ),
    );
    sheets.push({
      name: raw.sheet || `Sheet${sheets.length + 1}`,
      rows: stringRows,
    });
  }

  if (sheets.length === 0) {
    sheets.push({ name: "Sheet1", rows: [["(无法解析)"]] });
  }
  return sheets;
}

// ─────────────────────────────────────────────────────────────────────────────
// PPTX：JSZip 提取幻灯片文本
// ─────────────────────────────────────────────────────────────────────────────

/** 简易 XML 文本提取（去标签） */
function extractTextFromXml(xml: string): string[] {
  const texts: string[] = [];
  // <a:t>...</a:t> 是 PowerPoint 中的文本节点
  const regex = /<a:t>([^<]*)<\/a:t>/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    if (m[1].trim()) texts.push(m[1]);
  }
  return texts;
}

async function convertPptx(
  arrayBuffer: ArrayBuffer,
): Promise<{ slidesHtml: string[]; count: number }> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  // 找出所有 slide 文件
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)?.[1] ?? "0");
      const nb = parseInt(b.match(/slide(\d+)\.xml/)?.[1] ?? "0");
      return na - nb;
    });

  const slidesHtml: string[] = [];
  for (const file of slideFiles) {
    const xml = await zip.file(file)?.async("string");
    if (!xml) continue;
    const texts = extractTextFromXml(xml);
    const slideHtml = texts.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
    slidesHtml.push(slideHtml || "<p style='color:#999'>(空白幻灯片)</p>");
  }
  return { slidesHtml, count: slidesHtml.length };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─────────────────────────────────────────────────────────────────────────────
// 主组件
// ─────────────────────────────────────────────────────────────────────────────

const OfficeOoxmlPreview: React.FC<{
  artifact: RendererContext["artifact"];
  theme: RendererContext["theme"];
  workspace: RendererContext["workspace"];
}> = ({ artifact, theme, workspace }) => {
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const [state, setState] = useState<PreviewState>(EMPTY_STATE);
  const selectedAgent = useAgentStore((state) => state.selectedAgent);

  const kind = useMemo(
    () => detectKind(artifact.mimeType, artifact.extension),
    [artifact.mimeType, artifact.extension],
  );

  const fileUrl = artifact.binaryUrl ?? "";

  const convert = useCallback(async () => {
    if (!fileUrl) {
      setState({ ...EMPTY_STATE, loading: false, error: "No file URL" });
      return;
    }
    setState({ ...EMPTY_STATE });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const buf = await fetchArrayBuffer(
        fileUrl,
        controller.signal,
        selectedAgent,
      );
      if (kind === "docx") {
        const html = await convertDocx(buf);
        setState({
          ...EMPTY_STATE,
          loading: false,
          html,
        });
      } else if (kind === "xlsx") {
        const sheets = await convertXlsx(buf);
        setState({
          ...EMPTY_STATE,
          loading: false,
          sheets,
          activeSheet: 0,
        });
      } else if (kind === "pptx") {
        const { slidesHtml, count } = await convertPptx(buf);
        // Concatenate all slides into one continuous HTML string
        // with slide separators, matching the DOCX continuous-read UX
        const continuousHtml = slidesHtml
          .map(
            (slide, i) =>
              `<div class="pptx-slide-separator">Slide ${
                i + 1
              } / ${count}</div><div class="pptx-slide">${slide}</div>`,
          )
          .join("");
        setState({
          ...EMPTY_STATE,
          loading: false,
          pptxSlides: slidesHtml,
          html: continuousHtml,
          slideCount: count,
          currentSlide: 1,
        });
      } else {
        setState({
          ...EMPTY_STATE,
          loading: false,
          error: "Unsupported format",
        });
      }
    } catch (err) {
      setState({
        ...EMPTY_STATE,
        loading: false,
        error: (err as Error).message || String(err),
      });
    } finally {
      clearTimeout(timeout);
    }
  }, [fileUrl, kind, selectedAgent]);

  useEffect(() => {
    convert();
  }, [convert]);

  // 样式
  const bgColor = isDark ? "#1e1e1e" : "#ffffff";
  const borderColor = isDark ? "#333" : "#e8e8e8";
  const textColor = isDark ? "#d4d4d4" : "#333";
  const headerBg = isDark ? "#2a2a2a" : "#fafafa";

  const icon =
    kind === "docx" ? (
      <FileTextOutlined />
    ) : kind === "xlsx" ? (
      <FileExcelOutlined />
    ) : kind === "pptx" ? (
      <FilePptOutlined />
    ) : (
      <FileTextOutlined />
    );

  const label = kind.toUpperCase();

  // 加载中
  if (state.loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 12,
          background: bgColor,
        }}
      >
        <Spin size="large" />
        <span style={{ color: "#999", fontSize: 12 }}>
          {t("workspace.clientSideConverting", "正在浏览器端解析")} {label}...
        </span>
      </div>
    );
  }

  // 错误
  if (state.error) {
    return (
      <div
        style={{
          padding: 24,
          height: "100%",
          overflow: "auto",
          background: bgColor,
        }}
      >
        <Alert
          type="warning"
          message={`${label} ${t(
            "workspace.clientSideConvertFailed",
            "前端解析失败",
          )}`}
          description={state.error}
          showIcon
        />
        <Space style={{ marginTop: 16 }}>
          <Button icon={<ReloadOutlined />} onClick={convert}>
            {t("workspace.retry", "重试")}
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => workspace.download?.(artifact)}
          >
            {t("workspace.download", "下载")}
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

  // XLSX 表格视图
  if (kind === "xlsx" && state.sheets.length > 0) {
    const sheet = state.sheets[state.activeSheet];
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: bgColor,
        }}
      >
        {/* 工具栏 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px",
            borderBottom: `1px solid ${borderColor}`,
            flexShrink: 0,
          }}
        >
          <Space size={4}>
            {icon}
            <span style={{ fontSize: 11, color: "#999" }}>{label}</span>
            <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
              {t("workspace.clientSidePreview", "前端解析")}
            </Tag>
            {state.sheets.length > 1 && (
              <select
                value={state.activeSheet}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    activeSheet: Number(e.target.value),
                  }))
                }
                style={{
                  fontSize: 12,
                  background: isDark ? "#333" : "#fff",
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 4,
                  padding: "2px 6px",
                }}
              >
                {state.sheets.map((s, i) => (
                  <option key={i} value={i}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            <span style={{ fontSize: 11, color: "#999" }}>
              {sheet.rows.length} 行
            </span>
          </Space>
          <Space size={2}>
            <Tooltip title={t("workspace.download", "下载")}>
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
        {/* 表格 */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: headerBg,
                    color: "#999",
                    padding: "4px 8px",
                    textAlign: "right",
                    borderBottom: `1px solid ${borderColor}`,
                    borderRight: `1px solid ${borderColor}`,
                    width: 48,
                    fontSize: 11,
                    fontWeight: 400,
                  }}
                >
                  #
                </th>
                {sheet.rows[0]?.map((_, i) => (
                  <th
                    key={i}
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: headerBg,
                      color: "#999",
                      padding: "4px 8px",
                      textAlign: "center",
                      borderBottom: `1px solid ${borderColor}`,
                      borderRight: `1px solid ${borderColor}`,
                      fontSize: 11,
                      fontWeight: 400,
                      minWidth: 60,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.rows.slice(0, 5000).map((row, ri) => (
                <tr key={ri}>
                  <td
                    style={{
                      padding: "3px 8px",
                      textAlign: "right",
                      color: "#999",
                      borderBottom: `1px solid ${borderColor}`,
                      borderRight: `1px solid ${borderColor}`,
                      fontSize: 11,
                      background: headerBg,
                    }}
                  >
                    {ri + 1}
                  </td>
                  {sheet.rows[0]?.map((_, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: "3px 12px",
                        color: textColor,
                        borderBottom: `1px solid ${borderColor}`,
                        borderRight: `1px solid ${borderColor}`,
                        whiteSpace: "nowrap",
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={row[ci]}
                    >
                      {row[ci] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // DOCX / PPTX HTML 视图
  const isPptx = kind === "pptx";
  const styledHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: ${
      isPptx ? "24px" : "24px 32px"
    }; line-height: 1.7; color: ${textColor}; background: ${bgColor}; ${
      isPptx
        ? "max-width: 720px; margin: 0 auto;"
        : "max-width: 900px; margin: 0 auto;"
    } }
    h1 { font-size: 1.6em; border-bottom: 2px solid ${borderColor}; padding-bottom: 8px; margin-top: 1.5em; }
    h2 { font-size: 1.3em; margin-top: 1.2em; }
    h3 { font-size: 1.1em; margin-top: 1em; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    th, td { border: 1px solid ${
      isDark ? "#555" : "#ddd"
    }; padding: 8px 12px; text-align: left; }
    th { background: ${headerBg}; font-weight: 600; }
    img { max-width: 100%; height: auto; }
    a { color: ${isDark ? "#4d9eff" : "#1677ff"}; }
    ul, ol { padding-left: 1.5em; }
    p { margin: 0.5em 0; }
    .pptx-slide-separator {
      text-align: center;
      font-size: 11px;
      color: ${isDark ? "#888" : "#999"};
      border-top: 1px dashed ${isDark ? "#555" : "#ccc"};
      padding: 8px 0 4px;
      margin-top: 24px;
    }
    .pptx-slide:first-child .pptx-slide-separator { border-top: none; margin-top: 0; }
    .pptx-slide { padding: 8px 0; }
  </style></head><body>${state.html}</body></html>`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 工具栏 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
          background: bgColor,
        }}
      >
        <Space size={4}>
          {icon}
          <span style={{ fontSize: 11, color: "#999" }}>{label}</span>
          <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
            {t("workspace.clientSidePreview", "前端解析")}
          </Tag>
          {isPptx && state.slideCount > 0 && (
            <span style={{ fontSize: 11, color: "#999" }}>
              {state.slideCount} slides · continuous scroll
            </span>
          )}
        </Space>
        <Space size={2}>
          <Tooltip title={t("workspace.retry", "重试")}>
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={convert}
            />
          </Tooltip>
          <Tooltip title={t("workspace.download", "下载")}>
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
        </Space>
      </div>
      {/* 内容 */}
      <iframe
        srcDoc={styledHtml}
        title={artifact.title}
        sandbox="allow-same-origin"
        style={{ width: "100%", flex: 1, border: "none", background: bgColor }}
      />
    </div>
  );
};

export default OfficeOoxmlPreview;
