/**
 * FileSummaryCards — 在 AI 回复结尾显示涉及到的文件
 *
 * 扫描 response 的 output 数组，找出所有文件相关的工具调用
 * （read_file, write_file, edit_file, append_file, send_file_to_user 等），
 * 分类显示：
 *
 * - 交付物（Deliverables）：最终产物（docx, pdf, xlsx, pptx, html, 图片等），
 *   以卡片形式展示，点击可在工作区预览
 * - 生成的中间文件（Generated Files）：脚本文件（py, js, ts, sh 等），
 *   以折叠列表形式展示，点击可展开预览
 *
 * 交互：
 * - 点击卡片/列表项 → 在右侧工作区打开文件内容预览
 * - 点击文件夹图标 → 在系统文件资源管理器中定位文件
 */
import React, { useMemo, useState } from "react";
import {
  FileTextOutlined,
  FileAddOutlined,
  EditOutlined,
  FileImageOutlined,
  CodeOutlined,
  FolderOpenOutlined,
  SendOutlined,
  EyeOutlined,
  DownloadOutlined,
  LoadingOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Tooltip, message } from "antd";
import { invoke } from "@tauri-apps/api/core";
import { workspaceApi } from "@/api/modules/workspace";
import { buildAuthHeaders } from "@/api/authHeaders";
import { useAgentStore } from "@/stores/agentStore";
import { openFilePreview } from "@/features/files-workspace/openFilePreview";
import {
  DownloadCancelledError,
  downloadFileFromUrl,
} from "@/utils/downloadFileFromUrl";
import { stringifyResult, toDisplayUrl } from "./utils";
import { useTheme } from "@/contexts/ThemeContext";
import MediaPreview from "./MediaPreview";

// ─────────────────────────────────────────────────────────────────────────────
// 类型
// ─────────────────────────────────────────────────────────────────────────────

interface FileInfo {
  /** 工具调用 ID（用于去重和 artifact ID） */
  toolCallId: string;
  /** 文件名（短名） */
  fileName: string;
  /** 文件路径（完整） */
  filePath: string;
  /** 操作类型 */
  operation: "read" | "write" | "edit" | "append" | "send" | "other";
  /** 工具名称 */
  toolName: string;
  /** 内容（如果有） */
  content?: string;
  /** 文件扩展名 */
  extension?: string;
  /** 是否是二进制文件（图片/视频/音频等） */
  isBinary?: boolean;
  /** 二进制文件的 URL（如果有） */
  binaryUrl?: string;
  /** 文件预览 URL（从 send_file_to_user 的 DataBlock 中提取，用于文本文件预览） */
  fileUrl?: string;
  /** 是否是交付物（最终产物）vs 生成的中间文件 */
  isDeliverable: boolean;
  /** 已知文件大小（字节）；旧工具结果可能不提供 */
  fileSize?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 工具调用解析
// ─────────────────────────────────────────────────────────────────────────────

/** 文件操作工具名 → 操作类型映射 */
const TOOL_OPERATION_MAP: Record<string, FileInfo["operation"]> = {
  read_file: "read",
  write_file: "write",
  edit_file: "edit",
  append_file: "append",
  send_file_to_user: "send",
  view_image: "read",
  view_video: "read",
};

/** 命令执行工具 — 其输出中可能包含生成的交付物文件路径 */
const COMMAND_EXECUTION_TOOLS = new Set([
  "execute_shell_command",
  "execute_python_code",
  "shell",
  "bash",
  "run_command",
  "terminal",
]);

/** Tool call message types (from vendor's AgentScopeRuntimeMessageType) */
const TOOL_CALL_TYPES = new Set([
  "plugin_call",
  "plugin_call_output",
  "tool_call",
  "tool_call_output",
  "mcp_call",
  "mcp_call_output",
  "function_call",
  "function_call_output",
  "component_call",
  "component_call_output",
]);

/** 脚本文件扩展名 — 这些通常是生成中间文件，不是最终交付物 */
const SCRIPT_EXTENSIONS = new Set([
  "py",
  "js",
  "ts",
  "tsx",
  "jsx",
  "sh",
  "bash",
  "rb",
  "pl",
  "bat",
  "ps1",
  "r",
  "m",
  "sql",
  "lua",
  "go",
  "rs",
  "c",
  "cpp",
  "h",
  "hpp",
  "java",
  "kt",
  "swift",
  "php",
]);

/** Binary file extensions */
const BINARY_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "webp",
  "svg",
  "tiff",
  "tif",
  "mp4",
  "avi",
  "mov",
  "wmv",
  "flv",
  "mkv",
  "webm",
  "mp3",
  "wav",
  "flac",
  "aac",
  "ogg",
  "wma",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "odt",
  "ods",
  "odp",
  "zip",
  "tar",
  "gz",
  "7z",
  "rar",
]);

/** 交付物文件扩展名 — 最终产物（非脚本的文件类型） */
const DELIVERABLE_EXTENSIONS = new Set([
  // Documents
  "md",
  "markdown",
  "txt",
  "rtf",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "odt",
  "ods",
  "odp",
  "csv",
  "tsv",
  // Web
  "html",
  "htm",
  "xml",
  // Data
  "json",
  "yaml",
  "yml",
  // Images
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "webp",
  "svg",
  "tiff",
  "tif",
  // Video
  "mp4",
  "avi",
  "mov",
  "wmv",
  "flv",
  "mkv",
  "webm",
  // Audio
  "mp3",
  "wav",
  "flac",
  "aac",
  "ogg",
  "wma",
  // Archives
  "zip",
  "tar",
  "gz",
  "7z",
  "rar",
]);

/** 从工具调用参数中提取文件路径 */
function extractFilePath(params: Record<string, unknown>): string {
  return (
    (params.file_path as string) ||
    (params.path as string) ||
    (params.image_path as string) ||
    (params.video_path as string) ||
    (params.audio_path as string) ||
    ""
  );
}

/** 从路径中提取短文件名 */
function shortName(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || path;
}

/** 从路径中提取扩展名 */
function getExtension(path: string): string {
  const match = path.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : "";
}

/** 检查是否是文件相关的工具调用 */
function isFileRelatedTool(toolName: string): boolean {
  return toolName.toLowerCase() in TOOL_OPERATION_MAP;
}

/**
 * 从命令执行输出文本中提取交付物文件路径。
 *
 * 匹配模式：
 * - "Saved to /path/to/file.docx"
 * - "Output written to /path/to/report.pdf"
 * - "生成文件: /path/to/output.xlsx"
 * - 裸路径 /path/to/file.docx
 */
function extractDeliverablePathsFromOutput(output: string): string[] {
  const paths = new Set<string>();

  // Pattern 1: "Saved to" / "输出到" / "生成" 等 + file path
  const savedPattern =
    /(?:saved to|written to|output(?:ted)? to|created|generated|保存到|输出到|生成(?:文件)?|创建)[:\s]+([^\s\n]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = savedPattern.exec(output)) !== null) {
    const p = match[1].replace(/["',.;]+$/, "");
    const ext = getExtension(p);
    if (ext && DELIVERABLE_EXTENSIONS.has(ext)) {
      paths.add(p);
    }
  }

  // Pattern 2: bare absolute file paths with deliverable extensions
  // Unix: /path/to/file.ext  Windows: C:\path\to\file.ext
  const extPattern = Array.from(DELIVERABLE_EXTENSIONS).join("|");
  const barePathRegex = new RegExp(
    // Backslashes are intentional because this is a RegExp constructor string.
    // eslint-disable-next-line no-useless-escape
    `(?:/[\w./-]+|[A-Za-z]:[\\/][\w.\\/-]+)\.(?:${extPattern})`,
    "gi",
  );
  while ((match = barePathRegex.exec(output)) !== null) {
    paths.add(match[0].replace(/\\/g, "/"));
  }

  return Array.from(paths);
}

/**
 * 从 response data 的 output 数组中提取所有文件相关的工具调用。
 */
// Exported for contract tests that exercise the production parser.
// eslint-disable-next-line react-refresh/only-export-components
export function extractFileInfos(data: Record<string, unknown>): FileInfo[] {
  const output = data.output as unknown[] | undefined;
  if (!Array.isArray(output)) return [];

  const infos: FileInfo[] = [];
  // Map: call_id or name → output content (for matching input with output)
  const outputMap = new Map<string, unknown>();

  // First pass: collect output contents
  for (const msg of output) {
    if (!msg || typeof msg !== "object") continue;
    const m = msg as Record<string, unknown>;
    const msgType = m.type as string;

    if (
      !msgType ||
      !msgType.endsWith("_output") ||
      !TOOL_CALL_TYPES.has(msgType)
    )
      continue;

    const content = m.content;
    if (!Array.isArray(content) || content.length === 0) continue;

    const firstItem = content[0] as Record<string, unknown> | undefined;
    if (!firstItem || typeof firstItem !== "object") continue;

    const dataObj = firstItem.data as Record<string, unknown> | undefined;
    if (!dataObj) continue;

    const name = (dataObj.name as string) || "";
    const callId = (dataObj.call_id as string) || "";
    const outputVal = dataObj.output;
    const key = callId || name;
    if (key && outputVal !== undefined) {
      outputMap.set(key, outputVal);
    }
  }

  // Second pass: collect tool call inputs
  for (const msg of output) {
    if (!msg || typeof msg !== "object") continue;
    const m = msg as Record<string, unknown>;
    const msgType = m.type as string;

    if (!msgType || !TOOL_CALL_TYPES.has(msgType)) continue;

    const content = m.content;
    if (!Array.isArray(content) || content.length === 0) continue;

    const firstItem = content[0] as Record<string, unknown> | undefined;
    if (!firstItem || typeof firstItem !== "object") continue;

    const callData = firstItem.data as Record<string, unknown> | undefined;
    if (!callData) continue;

    const name = (callData.name as string) || "";
    if (!isFileRelatedTool(name)) continue;

    // Parse arguments
    let params: Record<string, unknown> = {};
    const rawArgs = callData.arguments;
    if (typeof rawArgs === "string") {
      try {
        params = JSON.parse(rawArgs);
      } catch {
        params = {};
      }
    } else if (rawArgs && typeof rawArgs === "object") {
      params = rawArgs as Record<string, unknown>;
    }

    const filePath = extractFilePath(params);
    if (!filePath) continue;

    const callId = (callData.call_id as string) || "";
    const msgId = (m.id as string) || "";

    // Get output content
    let rawResult: unknown;
    if (content.length > 1) {
      const secondItem = content[1] as Record<string, unknown> | undefined;
      const outputData = secondItem?.data as
        | Record<string, unknown>
        | undefined;
      if (outputData?.output !== undefined) {
        rawResult = outputData.output;
      }
    }
    if (rawResult === undefined) {
      const key = callId || name;
      rawResult = outputMap.get(key);
    }

    // For write_file / append_file, the actual file content is in
    // params.content. The tool result is just a success message like
    // "Wrote 676 bytes to /path/to/file.md." — we must NOT use that
    // as the preview content.
    //
    // For edit_file, the tool result is also just a success message
    // ("Successfully replaced text in ...") — we must NOT use that
    // either, so handleOpenInWorkspace will fetch the actual file
    // content from the backend.
    //
    // For send_file_to_user, the tool result contains a DataBlock with
    // the file URL and a TextBlock "File sent successfully." — we must
    // NOT use the text as content. The URL is extracted separately.
    //
    // For other tools (read_file, etc.), the tool result may contain
    // useful content.
    let resultContent: string | undefined;
    if (name === "write_file" || name === "append_file") {
      resultContent = params.content as string;
    }
    if (
      !resultContent &&
      rawResult !== undefined &&
      name !== "edit_file" &&
      name !== "send_file_to_user"
    ) {
      resultContent = stringifyResult(rawResult);
    }

    const ext = getExtension(filePath);
    const isBinary = BINARY_EXTENSIONS.has(ext);
    const operation = TOOL_OPERATION_MAP[name.toLowerCase()] || "other";

    // For binary files, try to get a displayable URL from the result
    let binaryUrl: string | undefined;
    if (isBinary) {
      // Try extracting URL from result blocks (send_file_to_user returns
      // a DataBlock with URLSource)
      const extractedBinaryUrl = extractUrlFromResult(rawResult);
      binaryUrl = extractedBinaryUrl
        ? toDisplayUrl(extractedBinaryUrl)
        : undefined;
      // Fall back to the authenticated preview API. It preserves absolute
      // local paths through the Vite proxy and also resolves relative paths.
      if (!binaryUrl) binaryUrl = toDisplayUrl(filePath);
    }

    // For send_file_to_user with text files, extract the file URL from
    // the DataBlock so we can fetch the actual content for preview.
    let fileUrl: string | undefined;
    if (operation === "send" && !isBinary) {
      const rawUrl = extractUrlFromResult(rawResult);
      if (rawUrl) {
        fileUrl = toDisplayUrl(rawUrl);
      }
    }

    // 判断是否是交付物：
    // - send_file_to_user 始终是交付物
    // - 脚本文件（.py, .js, .sh 等）视为中间文件
    // - 其他文件视为交付物
    // - read 操作既不是交付物也不是中间文件（不显示）
    const isDeliverable =
      operation === "send" ||
      name.toLowerCase() === "view_image" ||
      (operation !== "read" && !SCRIPT_EXTENSIONS.has(ext));

    infos.push({
      toolCallId: callId || msgId || `${name}-${filePath}`,
      fileName: shortName(filePath),
      filePath,
      operation,
      toolName: name,
      content: resultContent,
      extension: ext,
      isBinary,
      binaryUrl,
      fileUrl,
      isDeliverable,
      fileSize:
        extractFileSize(rawResult) ??
        (typeof resultContent === "string"
          ? new TextEncoder().encode(resultContent).byteLength
          : undefined),
    });
  }

  // Third pass: scan command execution outputs for deliverable file paths.
  // When AI writes a script (.py) and runs it via execute_shell_command,
  // the script may produce deliverable files (e.g., .docx, .pdf) whose
  // paths appear in the command output. We need to capture these.
  for (const msg of output) {
    if (!msg || typeof msg !== "object") continue;
    const m = msg as Record<string, unknown>;
    const msgType = m.type as string;
    if (!msgType || !TOOL_CALL_TYPES.has(msgType)) continue;

    const content = m.content;
    if (!Array.isArray(content) || content.length === 0) continue;

    const firstItem = content[0] as Record<string, unknown> | undefined;
    if (!firstItem || typeof firstItem !== "object") continue;

    const callData = firstItem.data as Record<string, unknown> | undefined;
    if (!callData) continue;

    const name = (callData.name as string) || "";
    if (!COMMAND_EXECUTION_TOOLS.has(name.toLowerCase())) continue;

    const callId = (callData.call_id as string) || "";
    const msgId = (m.id as string) || "";

    // Get output text
    let outputText = "";
    if (content.length > 1) {
      const secondItem = content[1] as Record<string, unknown> | undefined;
      const outputData = secondItem?.data as
        | Record<string, unknown>
        | undefined;
      if (outputData?.output !== undefined) {
        outputText = stringifyResult(outputData.output);
      }
    }
    if (!outputText) {
      const key = callId || name;
      const rawOutput = outputMap.get(key);
      if (rawOutput !== undefined) {
        outputText = stringifyResult(rawOutput);
      }
    }
    if (!outputText) continue;

    // Extract deliverable file paths from the output
    const deliverablePaths = extractDeliverablePathsFromOutput(outputText);
    for (const filePath of deliverablePaths) {
      // Skip if already tracked by a write_file / send_file_to_user call
      if (infos.some((i) => i.filePath === filePath)) continue;

      const ext = getExtension(filePath);
      const isBinary = BINARY_EXTENSIONS.has(ext);
      let binaryUrl: string | undefined;
      if (isBinary) {
        binaryUrl = toDisplayUrl(filePath);
      }

      infos.push({
        toolCallId: `${callId || msgId}-deliverable-${filePath}`,
        fileName: shortName(filePath),
        filePath,
        operation: "other",
        toolName: name,
        extension: ext,
        isBinary,
        binaryUrl,
        isDeliverable: true,
        fileSize: extractFileSize(outputMap.get(callId || name)),
      });
    }
  }

  // 去重：同一路径只保留最后一次操作。
  // 关键：read 操作不应覆盖 write/send/edit/append 操作——
  // 否则先写后读的文件会被 read 覆盖然后被过滤器删掉。
  const seen = new Map<string, FileInfo>();
  for (const info of infos) {
    const existing = seen.get(info.filePath);
    if (
      info.operation === "read" &&
      existing &&
      existing.operation !== "read"
    ) {
      // read 不覆盖已有的非 read 操作
      continue;
    }
    seen.set(info.filePath, info);
  }

  // Ordinary reads are implementation details. `view_image` is different:
  // its media is a user-facing response result and must remain inline even
  // though the underlying operation is classified as a read.
  return Array.from(seen.values()).filter(
    (info) => info.operation !== "read" || info.isDeliverable,
  );
}

/** Try to extract a URL from MCP result blocks */
function extractUrlFromResult(result: unknown): string | null {
  let arr: unknown[] | null = null;

  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) arr = parsed;
    } catch {
      return null;
    }
  } else if (Array.isArray(result)) {
    arr = result;
  }

  if (!arr) return null;

  for (const block of arr) {
    if (!block || typeof block !== "object") continue;
    const b = block as Record<string, unknown>;
    if (b.source && typeof b.source === "object") {
      const src = b.source as Record<string, unknown>;
      if (typeof src.url === "string" && src.url) return src.url;
    }
    if (typeof b.url === "string" && b.url) return b.url;
    if (typeof b.path === "string" && b.path) return b.path;
  }

  return null;
}

/** 从工具结果块中尽力提取结构化文件大小。 */
function extractFileSize(result: unknown): number | undefined {
  let value = result;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  const queue: unknown[] = Array.isArray(value) ? [...value] : [value];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    const record = current as Record<string, unknown>;
    for (const key of ["file_size_bytes", "file_size", "size"]) {
      const size = record[key];
      if (typeof size === "number" && Number.isFinite(size) && size >= 0) {
        return size;
      }
    }
    for (const child of Object.values(record)) {
      if (child && typeof child === "object") queue.push(child);
    }
  }
  return undefined;
}

function formatFileSize(size?: number): string {
  if (size === undefined) return "大小未知";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function downloadTextContent(
  content: string,
  fileName: string,
  mimeType: string,
) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// 图标和颜色
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Operation type → icon, colour, label.
 *
 * Colours are theme-aware: the `color` function receives `isDark` and
 * returns an appropriate hex value for the current mode.  Most accent
 * colours (blue, green, orange …) are bright enough for both modes, but
 * the neutral grey used by the "other" operation must be lifted in dark
 * mode to remain visible.
 */
const OPERATION_CONFIG: Record<
  FileInfo["operation"],
  { icon: React.ReactNode; color: (isDark: boolean) => string; label: string }
> = {
  read: {
    icon: <FileTextOutlined />,
    color: () => "#1677ff",
    label: "读取",
  },
  write: {
    icon: <FileAddOutlined />,
    color: () => "#52c41a",
    label: "写入",
  },
  edit: {
    icon: <EditOutlined />,
    color: () => "#faad14",
    label: "编辑",
  },
  append: {
    icon: <FileAddOutlined />,
    color: () => "#722ed1",
    label: "追加",
  },
  send: {
    icon: <SendOutlined />,
    color: () => "#13c2c2",
    label: "发送",
  },
  other: {
    icon: <CodeOutlined />,
    color: (isDark) => (isDark ? "#999999" : "#8c8c8c"),
    label: "操作",
  },
};

const EXTENSION_ICON: Record<string, React.ReactNode> = {
  md: <FileTextOutlined />,
  markdown: <FileTextOutlined />,
  txt: <FileTextOutlined />,
  csv: <FileTextOutlined />,
  json: <CodeOutlined />,
  js: <CodeOutlined />,
  ts: <CodeOutlined />,
  tsx: <CodeOutlined />,
  jsx: <CodeOutlined />,
  py: <CodeOutlined />,
  html: <FileTextOutlined />,
  htm: <FileTextOutlined />,
  xml: <FileTextOutlined />,
  yaml: <FileTextOutlined />,
  yml: <FileTextOutlined />,
  pdf: <FileTextOutlined />,
  doc: <FileTextOutlined />,
  docx: <FileTextOutlined />,
  xls: <FileTextOutlined />,
  xlsx: <FileTextOutlined />,
  ppt: <FileTextOutlined />,
  pptx: <FileTextOutlined />,
  png: <FileImageOutlined />,
  jpg: <FileImageOutlined />,
  jpeg: <FileImageOutlined />,
  gif: <FileImageOutlined />,
  svg: <FileImageOutlined />,
  webp: <FileImageOutlined />,
  bmp: <FileImageOutlined />,
};

// ─────────────────────────────────────────────────────────────────────────────
// MIME type detection
// ─────────────────────────────────────────────────────────────────────────────

function getMimeType(ext: string): string {
  const extMap: Record<string, string> = {
    md: "text/markdown",
    markdown: "text/markdown",
    txt: "text/plain",
    csv: "text/csv",
    tsv: "text/tab-separated-values",
    json: "application/json",
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "text/javascript",
    jsx: "text/javascript",
    ts: "text/typescript",
    tsx: "text/typescript",
    py: "text/x-python",
    sh: "application/x-sh",
    yaml: "application/x-yaml",
    yml: "application/x-yaml",
    xml: "application/xml",
    rtf: "application/rtf",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    tiff: "image/tiff",
    tif: "image/tiff",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    odt: "application/vnd.oasis.opendocument.text",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    odp: "application/vnd.oasis.opendocument.presentation",
    zip: "application/zip",
    tar: "application/x-tar",
    gz: "application/gzip",
    "7z": "application/x-7z-compressed",
    rar: "application/vnd.rar",
    mp4: "video/mp4",
    webm: "video/webm",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    flac: "audio/flac",
    aac: "audio/aac",
    ogg: "audio/ogg",
  };
  return extMap[ext.toLowerCase()] || "text/plain";
}

// ─────────────────────────────────────────────────────────────────────────────
// 主组件
// ─────────────────────────────────────────────────────────────────────────────

const FileSummaryCards: React.FC<{ data: Record<string, unknown> }> = ({
  data,
}) => {
  const { isDark } = useTheme();
  const fileInfos = useMemo(() => extractFileInfos(data), [data]);
  const [expandedFiles, setExpandedFiles] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(
    () => new Set(),
  );

  // ── Theme-aware palette ───────────────────────────────────────────────
  // Ant Design CSS variables (--ant-color-*) may not be available because
  // the app uses prefixCls="qwenpaw".  We therefore derive colours from
  // the same token values configured in App.tsx ConfigProvider.
  const c = {
    text: isDark ? "#ffffff" : "rgba(0,0,0,0.88)",
    textSecondary: isDark ? "#aaaaaa" : "rgba(0,0,0,0.65)",
    textTertiary: isDark ? "#6f6f6f" : "rgba(0,0,0,0.45)",
    textQuaternary: isDark ? "#555555" : "#bbb",
    borderSecondary: isDark ? "#1a1a1a" : "rgba(0,0,0,0.08)",
    fillQuaternary: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
    fillHover: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
  } as const;

  // 分离交付物和中间文件
  const { deliverables, generatedFiles } = useMemo(() => {
    const deliverables: FileInfo[] = [];
    const generatedFiles: FileInfo[] = [];
    for (const info of fileInfos) {
      if (info.isDeliverable) {
        deliverables.push(info);
      } else {
        generatedFiles.push(info);
      }
    }
    return { deliverables, generatedFiles };
  }, [fileInfos]);

  if (deliverables.length === 0 && generatedFiles.length === 0) return null;

  /** 点击卡片/列表项：在工作区打开文件内容预览 */
  const handleOpenInWorkspace = (info: FileInfo) => {
    const ext = info.extension || "";
    const mimeType = getMimeType(ext);
    const artifactId = `filecard-${info.toolCallId}`;

    // Content supplied directly by a write/append tool is an inline artifact.
    if (
      (info.operation === "write" || info.operation === "append") &&
      info.content &&
      !info.isBinary
    ) {
      openFilePreview({
        source: "artifact",
        path: info.filePath || info.fileName,
        artifact: {
          id: artifactId,
          title: info.fileName,
          source: "tool_call",
          mimeType,
          extension: ext || undefined,
          textContent: info.content,
          toolName: info.toolName,
          workspacePath: info.filePath,
          agentId: useAgentStore.getState().selectedAgent,
          size: info.fileSize,
        },
      });
      return;
    }

    const artifactUrl = info.fileUrl || info.binaryUrl;
    openFilePreview({
      source: artifactUrl ? "attachment" : "workspace",
      path: info.filePath || info.fileName,
      root: artifactUrl ? undefined : "project",
      artifactUrl,
    });
  };

  /** 点击文件夹图标：在系统文件资源管理器中定位文件 */
  const handleRevealInFileManager = (info: FileInfo) => {
    // Tauri desktop: invoke native command
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      invoke("reveal_in_file_manager", { path: info.filePath }).catch((err) => {
        console.warn("[FileSummaryCards] reveal failed:", err);
        message.error(`无法打开文件管理器: ${err}`);
      });
    } else {
      message.warning("此功能仅在桌面应用中可用");
    }
  };

  /** 直接保存交付物；二进制与远端文本走统一跨端下载链路。 */
  const handleDownload = async (info: FileInfo) => {
    setDownloadingIds((ids) => new Set(ids).add(info.toolCallId));
    try {
      const mimeType = getMimeType(info.extension || "");
      const downloadUrl = info.binaryUrl || info.fileUrl;
      if (downloadUrl) {
        await downloadFileFromUrl(downloadUrl, info.fileName, {
          headers: buildAuthHeaders(),
          errorMessage: "文件下载失败",
          preferResponseFilename: true,
        });
        return;
      }

      if (info.content !== undefined) {
        downloadTextContent(info.content, info.fileName, mimeType);
        return;
      }

      const result = await workspaceApi.loadCodeFile(info.filePath);
      downloadTextContent(result.content, info.fileName, mimeType);
    } catch (error) {
      if (!(error instanceof DownloadCancelledError)) {
        message.error(
          error instanceof Error ? error.message : "文件下载失败，请稍后重试",
        );
      }
    } finally {
      setDownloadingIds((ids) => {
        const next = new Set(ids);
        next.delete(info.toolCallId);
        return next;
      });
    }
  };

  /** 渲染单个文件卡片（交付物用） */
  const renderCard = (info: FileInfo) => {
    const opConfig = OPERATION_CONFIG[info.operation];
    const opColor = opConfig.color(isDark);
    const downloading = downloadingIds.has(info.toolCallId);
    const extIcon = EXTENSION_ICON[info.extension || ""] || (
      <FileTextOutlined />
    );

    const isInlineImage = Boolean(
      info.binaryUrl &&
        [
          "png",
          "jpg",
          "jpeg",
          "gif",
          "webp",
          "bmp",
          "svg",
          "tiff",
          "tif",
        ].includes(info.extension || ""),
    );

    return (
      <div key={info.toolCallId} style={{ minWidth: 0 }}>
        {isInlineImage && (
          <div style={{ marginBottom: 8 }}>
            <MediaPreview
              media={{
                type: "image",
                url: info.binaryUrl!,
                name: info.fileName,
              }}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minHeight: 58,
            padding: "8px 10px",
            borderRadius: 8,
            border: `1px solid ${c.borderSecondary}`,
            background: c.fillQuaternary,
            transition: "all 0.15s ease",
            overflow: "hidden",
            width: "100%",
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={() => handleOpenInWorkspace(info)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              minWidth: 0,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.parentElement!.style.borderColor = opColor;
              e.currentTarget.parentElement!.style.background = isDark
                ? `rgba(255,255,255,0.06)`
                : `${opColor}0a`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.parentElement!.style.borderColor =
                c.borderSecondary;
              e.currentTarget.parentElement!.style.background =
                c.fillQuaternary;
            }}
          >
            <span
              style={{
                fontSize: 18,
                color: opColor,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {extIcon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                title={info.fileName}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: c.text,
                }}
              >
                {info.fileName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: c.textTertiary,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  minWidth: 0,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(info.extension || "file").toUpperCase()} ·{" "}
                  {formatFileSize(info.fileSize)}
                </span>
                <span style={{ flexShrink: 0 }}>·</span>
                <span style={{ color: opColor, flexShrink: 0 }}>已生成</span>
              </div>
            </div>
          </div>
          <Tooltip title="预览">
            <button
              aria-label={`预览 ${info.fileName}`}
              onClick={() => handleOpenInWorkspace(info)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                width: 26,
                height: 26,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                borderRadius: 4,
                color: c.textQuaternary,
              }}
            >
              <EyeOutlined style={{ fontSize: 14 }} />
            </button>
          </Tooltip>
          <Tooltip title="下载">
            <button
              aria-label={`下载 ${info.fileName}`}
              disabled={downloading}
              onClick={(e) => {
                e.stopPropagation();
                void handleDownload(info);
              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: downloading ? "wait" : "pointer",
                width: 26,
                height: 26,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                borderRadius: 4,
                color: c.textQuaternary,
              }}
            >
              {downloading ? (
                <LoadingOutlined style={{ fontSize: 14 }} />
              ) : (
                <DownloadOutlined style={{ fontSize: 14 }} />
              )}
            </button>
          </Tooltip>
          <Tooltip title="在文件管理器中显示">
            <button
              aria-label={`定位 ${info.fileName}`}
              onClick={(e) => {
                e.stopPropagation();
                handleRevealInFileManager(info);
              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                width: 26,
                height: 26,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                borderRadius: 4,
                color: c.textQuaternary,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = opColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = c.textQuaternary;
              }}
            >
              <FolderOpenOutlined style={{ fontSize: 14 }} />
            </button>
          </Tooltip>
        </div>
      </div>
    );
  };

  /** 渲染中间文件列表项 */
  const renderListItem = (info: FileInfo) => {
    const extIcon = EXTENSION_ICON[info.extension || ""] || <CodeOutlined />;

    return (
      <div
        key={info.toolCallId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 8px",
          borderRadius: 6,
          cursor: "pointer",
          transition: "background 0.12s ease",
        }}
        onClick={() => handleOpenInWorkspace(info)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = c.fillHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: c.textTertiary,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {extIcon}
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily:
              "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: c.textSecondary,
            flex: 1,
          }}
        >
          {info.fileName}
        </span>
        <Tooltip title="在文件管理器中显示">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRevealInFileManager(info);
            }}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              color: c.textQuaternary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = c.textSecondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = c.textQuaternary;
            }}
          >
            <FolderOpenOutlined style={{ fontSize: 12 }} />
          </button>
        </Tooltip>
      </div>
    );
  };

  return (
    <div style={{ padding: "8px 0" }}>
      {/* 交付物卡片区域 — 优先横向排列 */}
      {deliverables.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 8,
            width: "100%",
            maxWidth: 856,
          }}
        >
          {deliverables.map(renderCard)}
        </div>
      )}

      {/* 生成的中间文件 — 折叠列表 */}
      {generatedFiles.length > 0 && (
        <div style={{ marginTop: deliverables.length > 0 ? 8 : 0 }}>
          <div
            onClick={() => setExpandedFiles(!expandedFiles)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              padding: "4px 0",
              fontSize: 12,
              color: c.textTertiary,
              userSelect: "none",
            }}
          >
            {expandedFiles ? (
              <DownOutlined style={{ fontSize: 10 }} />
            ) : (
              <RightOutlined style={{ fontSize: 10 }} />
            )}
            <span>生成的中间文件 ({generatedFiles.length})</span>
          </div>
          {expandedFiles && (
            <div
              style={{
                marginTop: 4,
                padding: "4px 8px",
                borderRadius: 8,
                border: `1px solid ${c.borderSecondary}`,
                background: c.fillQuaternary,
              }}
            >
              {generatedFiles.map(renderListItem)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileSummaryCards;
