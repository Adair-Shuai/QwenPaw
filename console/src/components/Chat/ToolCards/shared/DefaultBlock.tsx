/**
 * DefaultBlock — reusable Input/Output block with title + copy button.
 *
 * Renders monospace text or auto-detected markdown/JSON content inside a
 * bordered block with a copy button in the header.
 * - Markdown content → rendered via Markdown component
 * - JSON content → pretty-printed and rendered with syntax highlighting
 * - Plain text → rendered with syntax highlighting
 *
 * When `workspaceTitle` is provided, an additional "Open in Workspace"
 * button appears next to the copy button, allowing the user to preview
 * the content in the workspace panel.
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Markdown } from "@agentscope-ai/chat";
import {
  CopyOutlined,
  CheckOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { copyText } from "@/utils/clipboard";
import { looksLikeMarkdown } from "./utils";
import { useWorkspaceStore } from "@/components/Workspace/store/workspaceStore";
import styles from "./toolCards.module.less";

export interface DefaultBlockProps {
  title: string;
  content: string;
  copyTitle?: string;
  /**
   * If provided, an "Open in Workspace" button will be shown.
   * This string is used as the artifact title in the workspace.
   */
  workspaceTitle?: string;
  /** Optional file extension for renderer matching (e.g. "md", "json", "py") */
  workspaceExtension?: string;
  /** When true (default if workspaceTitle is set), inline content is hidden. */
  hideContent?: boolean;
}

/** Try to parse JSON. Returns parsed object or null. */
function tryParseJson(text: string): unknown | null {
  const trimmed = text.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  return null;
}

/** Detect a reasonable MIME type from content + extension. */
function detectMimeType(content: string, ext?: string): string {
  if (ext) {
    const extMap: Record<string, string> = {
      md: "text/markdown",
      markdown: "text/markdown",
      json: "application/json",
      html: "text/html",
      css: "text/css",
      js: "text/javascript",
      ts: "text/typescript",
      py: "text/x-python",
      sh: "text/x-shellscript",
      yaml: "text/yaml",
      yml: "text/yaml",
      xml: "text/xml",
      svg: "image/svg+xml",
    };
    if (extMap[ext.toLowerCase()]) return extMap[ext.toLowerCase()];
  }
  const trimmed = content.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return "application/json";
  }
  if (looksLikeMarkdown(content)) {
    return "text/markdown";
  }
  return "text/plain";
}

const highlighterStyle = {
  margin: 0,
  borderRadius: 0,
  padding: "10px 12px",
  fontSize: "12px",
  lineHeight: "1.6",
  maxHeight: "300px",
  overflowY: "auto" as const,
};

const DefaultBlock: React.FC<DefaultBlockProps> = ({
  title,
  content,
  copyTitle,
  workspaceTitle,
  workspaceExtension,
  hideContent,
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMarkdown = useMemo(() => looksLikeMarkdown(content), [content]);
  const parsedJson = useMemo(
    () => (isMarkdown ? null : tryParseJson(content)),
    [content, isMarkdown],
  );

  // When workspaceTitle is provided, hide inline content by default
  const contentHidden = hideContent ?? !!workspaceTitle;

  const handleCopy = useCallback(() => {
    void copyText(content)
      .then(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setCopied(true);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }, [content]);

  const handleOpenInWorkspace = useCallback(() => {
    if (!content) return;
    const mimeType = detectMimeType(content, workspaceExtension);
    useWorkspaceStore.getState().openArtifact({
      id: `block-${workspaceTitle || title}-${Date.now()}`,
      title: workspaceTitle || title,
      source: "tool_call",
      mimeType,
      extension: workspaceExtension,
      textContent: content,
    });
  }, [content, workspaceTitle, title, workspaceExtension]);

  const renderContent = () => {
    if (isMarkdown) {
      return (
        <div className={styles.defaultBlockContentMd}>
          <Markdown content={content} />
        </div>
      );
    }
    if (parsedJson !== null) {
      return (
        <SyntaxHighlighter
          language="json"
          style={oneDark}
          customStyle={highlighterStyle}
          wrapLongLines
        >
          {JSON.stringify(parsedJson, null, 2)}
        </SyntaxHighlighter>
      );
    }
    return (
      <SyntaxHighlighter
        language="text"
        style={oneDark}
        customStyle={highlighterStyle}
        wrapLongLines
      >
        {content}
      </SyntaxHighlighter>
    );
  };

  return (
    <div className={styles.defaultBlock}>
      <div className={styles.defaultBlockHeader}>
        <span
          className={styles.defaultBlockTitle}
          style={contentHidden ? { cursor: "pointer", flex: 1 } : undefined}
          onClick={contentHidden ? () => setExpanded((v) => !v) : undefined}
        >
          {contentHidden && (
            <span style={{ marginRight: 4, fontSize: 10, opacity: 0.6 }}>
              {expanded ? "▼" : "▶"}
            </span>
          )}
          {title}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {workspaceTitle && content && (
            <Tooltip title="在工作区打开">
              <button
                type="button"
                className={styles.defaultBlockCopy}
                onClick={handleOpenInWorkspace}
                title="在工作区打开"
              >
                <FolderOpenOutlined />
              </button>
            </Tooltip>
          )}
          <button
            type="button"
            className={styles.defaultBlockCopy}
            onClick={handleCopy}
            title={copyTitle}
          >
            {copied ? <CheckOutlined /> : <CopyOutlined />}
          </button>
        </div>
      </div>
      {(!contentHidden || expanded) && renderContent()}
    </div>
  );
};

export default DefaultBlock;
