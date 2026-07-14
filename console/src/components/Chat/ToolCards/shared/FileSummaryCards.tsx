/**
 * FileSummaryCards — 在 AI 回复结尾显示涉及到的文件小卡片
 *
 * 扫描 response 的 output 数组，找出所有文件相关的工具调用
 * （read_file, write_file, edit_file, append_file, send_file_to_user 等），
 * 以小卡片形式列出。点击卡片自动在右侧工作区打开预览。
 *
 * 布局：根据窗口宽度一行显示 2-3 个卡片。
 *
 * 数据结构说明：
 * vendor (@agentscope-ai/chat) 的 output 数组中，每个 tool 消息的结构为：
 *   {
 *     id: string,
 *     type: "plugin_call" | "plugin_call_output" | "tool_call" | "tool_call_output" | ...,
 *     role: string,
 *     status: string,
 *     content: [
 *       { type: "data", data: { name, arguments, call_id, server_label } },   // [0] = call info
 *       { type: "data", data: { output, state } },                             // [1] = result (if merged)
 *     ]
 *   }
 *
 * 工具名在 content[0].data.name，参数在 content[0].data.arguments (JSON string)。
 * mergeToolMessages 可能已将 input/output 合并到同一条消息的 content 数组中。
 */
import React, { useMemo } from "react";
import {
  FileTextOutlined,
  FileAddOutlined,
  EditOutlined,
  FileImageOutlined,
  CodeOutlined,
  FolderOpenOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useWorkspaceStore } from "@/components/Workspace/store/workspaceStore";
import { stringifyResult } from "./utils";

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
 * 从 response data 的 output 数组中提取所有文件相关的工具调用。
 *
 * output 数组中的每个 tool 消息有 type 为 plugin_call/plugin_call_output 等，
 * content[0].data.name 为工具名，content[0].data.arguments 为 JSON 参数字符串。
 *
 * 如果 mergeToolMessages 已合并 input+output，则 content[1].data.output 为结果。
 */
function extractFileInfos(data: Record<string, unknown>): FileInfo[] {
  const output = data.output as unknown[] | undefined;
  if (!Array.isArray(output)) return [];

  const infos: FileInfo[] = [];
  // Map: call_id or name → output content (for matching input with output)
  const outputMap = new Map<string, string>();

  // First pass: collect output contents
  for (const msg of output) {
    if (!msg || typeof msg !== "object") continue;
    const m = msg as Record<string, unknown>;
    const msgType = m.type as string;

    // Only look at output-type messages
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
      outputMap.set(key, stringifyResult(outputVal));
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

    // content[0].data has tool call info
    const firstItem = content[0] as Record<string, unknown> | undefined;
    if (!firstItem || typeof firstItem !== "object") continue;

    const callData = firstItem.data as Record<string, unknown> | undefined;
    if (!callData) continue;

    const name = (callData.name as string) || "";
    if (!isFileRelatedTool(name)) continue;

    // Parse arguments (JSON string or object)
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

    // Try to get output content:
    // 1. If merged (content[1].data.output exists)
    // 2. If separate output message exists in outputMap
    let resultContent: string | undefined;
    if (content.length > 1) {
      const secondItem = content[1] as Record<string, unknown> | undefined;
      const outputData = secondItem?.data as Record<string, unknown> | undefined;
      if (outputData?.output !== undefined) {
        resultContent = stringifyResult(outputData.output);
      }
    }
    if (!resultContent) {
      const key = callId || name;
      resultContent = outputMap.get(key);
    }

    // For write_file / append_file, the content is in params
    if (!resultContent) {
      if (name === "write_file" || name === "append_file") {
        const paramContent = params.content as string;
        if (paramContent) resultContent = paramContent;
      }
    }

    infos.push({
      toolCallId: callId || msgId || `${name}-${filePath}`,
      fileName: shortName(filePath),
      filePath,
      operation: TOOL_OPERATION_MAP[name.toLowerCase()] || "other",
      toolName: name,
      content: resultContent,
      extension: getExtension(filePath),
    });
  }

  // 去重：同一路径只保留最后一次操作
  const seen = new Map<string, FileInfo>();
  for (const info of infos) {
    seen.set(info.filePath, info);
  }

  return Array.from(seen.values());
}

// ─────────────────────────────────────────────────────────────────────────────
// 图标和颜色
// ─────────────────────────────────────────────────────────────────────────────

const OPERATION_CONFIG: Record<
  FileInfo["operation"],
  { icon: React.ReactNode; color: string; label: string }
> = {
  read: {
    icon: <FileTextOutlined />,
    color: "#1677ff",
    label: "读取",
  },
  write: {
    icon: <FileAddOutlined />,
    color: "#52c41a",
    label: "写入",
  },
  edit: {
    icon: <EditOutlined />,
    color: "#faad14",
    label: "编辑",
  },
  append: {
    icon: <FileAddOutlined />,
    color: "#722ed1",
    label: "追加",
  },
  send: {
    icon: <SendOutlined />,
    color: "#13c2c2",
    label: "发送",
  },
  other: {
    icon: <CodeOutlined />,
    color: "#8c8c8c",
    label: "操作",
  },
};

const EXTENSION_ICON: Record<string, React.ReactNode> = {
  md: <FileTextOutlined />,
  markdown: <FileTextOutlined />,
  json: <CodeOutlined />,
  js: <CodeOutlined />,
  ts: <CodeOutlined />,
  tsx: <CodeOutlined />,
  jsx: <CodeOutlined />,
  py: <CodeOutlined />,
  png: <FileImageOutlined />,
  jpg: <FileImageOutlined />,
  jpeg: <FileImageOutlined />,
  gif: <FileImageOutlined />,
  svg: <FileImageOutlined />,
  webp: <FileImageOutlined />,
};

// ─────────────────────────────────────────────────────────────────────────────
// 主组件
// ─────────────────────────────────────────────────────────────────────────────

const FileSummaryCards: React.FC<{ data: Record<string, unknown> }> = ({
  data,
}) => {
  const fileInfos = useMemo(() => extractFileInfos(data), [data]);

  if (fileInfos.length === 0) return null;

  const handleOpen = (info: FileInfo) => {
    const ext = info.extension || "";
    const mimeType =
      ext === "md"
        ? "text/markdown"
        : ext === "json"
          ? "application/json"
          : ext === "html"
            ? "text/html"
            : ext === "py"
              ? "text/x-python"
              : ext === "js" || ext === "jsx"
                ? "text/javascript"
                : ext === "ts" || ext === "tsx"
                  ? "text/typescript"
                  : "text/plain";

    useWorkspaceStore.getState().openArtifact({
      id: `filecard-${info.toolCallId}`,
      title: info.fileName,
      source: "tool_call",
      mimeType,
      extension: ext || undefined,
      textContent: info.content || "",
      toolName: info.toolName,
    });
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 8,
        padding: "8px 0",
        maxWidth: "100%",
      }}
    >
      {fileInfos.map((info) => {
        const opConfig = OPERATION_CONFIG[info.operation];
        const extIcon = EXTENSION_ICON[info.extension || ""] || (
          <FileTextOutlined />
        );

        return (
          <div
            key={info.toolCallId}
            onClick={() => handleOpen(info)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              border:
                "1px solid var(--ant-color-border-secondary, rgba(0,0,0,0.08))",
              background:
                "var(--ant-color-fill-quaternary, rgba(0,0,0,0.02))",
              cursor: "pointer",
              transition: "all 0.15s ease",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = opConfig.color;
              e.currentTarget.style.background = `${opConfig.color}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.background = "";
            }}
          >
            {/* 文件类型图标 */}
            <span
              style={{
                fontSize: 18,
                color: opConfig.color,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {extIcon}
            </span>

            {/* 文件名 + 操作标签 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "var(--ant-color-text, rgba(0,0,0,0.88))",
                }}
              >
                {info.fileName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: opConfig.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {opConfig.icon}
                <span>{opConfig.label}</span>
              </div>
            </div>

            {/* 打开按钮 */}
            <FolderOpenOutlined
              style={{
                fontSize: 14,
                color: "var(--ant-color-text-quaternary, #bbb)",
                flexShrink: 0,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FileSummaryCards;
