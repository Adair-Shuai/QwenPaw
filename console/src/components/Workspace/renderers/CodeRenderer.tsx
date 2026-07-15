/**
 * CodeRenderer — 轻量级代码查看器
 *
 * 使用纯 <pre> + 基本语法高亮，不依赖 Monaco Editor。
 *
 * 设计原因：
 * - 工作区面板用于预览文件，不需要完整编辑器功能
 * - Monaco Editor 在 Tauri 环境中从 CDN 加载会失败，导致页面崩溃
 * - TabbedEditor 已使用 Monaco 提供完整编辑体验
 * - 轻量查看器加载快、无 worker 依赖、不崩溃
 *
 * 支持：行号、语法高亮色、只读/编辑切换（编辑模式回退到 textarea）、复制、下载
 */
import React, { useCallback, useState } from "react";
import { Button, Space, Tooltip } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";

// 根据文件扩展名推断语言
function detectLanguage(extension?: string): string {
  const ext = extension?.toLowerCase();
  const map: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    go: "go",
    rs: "rust",
    rb: "ruby",
    php: "php",
    sql: "sql",
    sh: "shell",
    bash: "shell",
    css: "css",
    less: "less",
    scss: "scss",
    html: "html",
    htm: "html",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    vue: "html",
  };
  return map[ext ?? ""] ?? "plaintext";
}

// 简单的语法高亮：关键字着色
// 不是完整的语法高亮器，但比纯文本好很多
const KEYWORD_SETS: Record<string, Set<string>> = {
  javascript: new Set([
    "const", "let", "var", "function", "return", "if", "else", "for",
    "while", "do", "switch", "case", "break", "continue", "new", "try",
    "catch", "finally", "throw", "class", "extends", "super", "this",
    "import", "export", "from", "default", "async", "await", "yield",
    "typeof", "instanceof", "in", "of", "delete", "void", "null",
    "undefined", "true", "false", "NaN",
  ]),
  typescript: new Set([
    "const", "let", "var", "function", "return", "if", "else", "for",
    "while", "do", "switch", "case", "break", "continue", "new", "try",
    "catch", "finally", "throw", "class", "extends", "super", "this",
    "import", "export", "from", "default", "async", "await", "yield",
    "typeof", "instanceof", "in", "of", "delete", "void", "null",
    "undefined", "true", "false", "NaN", "interface", "type", "enum",
    "namespace", "public", "private", "protected", "readonly", "abstract",
    "as", "is", "keyof", "infer", "never", "unknown", "any", "string",
    "number", "boolean", "symbol", "bigint", "object",
  ]),
  python: new Set([
    "def", "class", "return", "if", "elif", "else", "for", "while",
    "break", "continue", "pass", "import", "from", "as", "try",
    "except", "finally", "raise", "with", "lambda", "yield", "global",
    "nonlocal", "assert", "del", "in", "is", "not", "and", "or",
    "None", "True", "False", "self", "cls", "async", "await",
  ]),
  shell: new Set([
    "if", "then", "else", "elif", "fi", "for", "do", "done", "while",
    "case", "esac", "function", "return", "break", "continue", "exit",
    "echo", "export", "local", "read", "source", "alias", "unset",
  ]),
};

function getKeywordSet(language: string): Set<string> | null {
  if (language === "javascript" || language === "jsx")
    return KEYWORD_SETS.javascript;
  if (language === "typescript" || language === "tsx")
    return KEYWORD_SETS.typescript;
  if (language === "python") return KEYWORD_SETS.python;
  if (language === "shell") return KEYWORD_SETS.shell;
  return null;
}

/** 简单的高亮渲染：关键字、字符串、注释着色 */
function highlightLine(
  line: string,
  language: string,
  isDark: boolean,
): React.ReactNode {
  const keywords = getKeywordSet(language);
  if (!keywords) return line;

  const commentColor = isDark ? "#6a9955" : "#6a737d";
  const keywordColor = isDark ? "#569cd6" : "#0000ff";
  const stringColor = isDark ? "#ce9178" : "#a31515";
  const numberColor = isDark ? "#b5cea8" : "#098658";

  // Handle full-line comments
  const trimmed = line.trimStart();
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith('"""')
  ) {
    return <span style={{ color: commentColor }}>{line}</span>;
  }

  const parts: React.ReactNode[] = [];
  // Tokenize: strings, comments, words, numbers
  const tokenRegex =
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\/\/.*$|#.*$)|(\b\d+\.?\d*\b)|(\b\w+\b)|(\s+)|([^\w\s]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    const [full, str, comment, num, word, space, other] = match;
    if (str) {
      parts.push(
        <span key={key++} style={{ color: stringColor }}>
          {str}
        </span>,
      );
    } else if (comment) {
      parts.push(
        <span key={key++} style={{ color: commentColor }}>
          {comment}
        </span>,
      );
    } else if (num) {
      parts.push(
        <span key={key++} style={{ color: numberColor }}>
          {num}
        </span>,
      );
    } else if (word) {
      if (keywords.has(word)) {
        parts.push(
          <span key={key++} style={{ color: keywordColor, fontWeight: 500 }}>
            {word}
          </span>,
        );
      } else if (word === "true" || word === "false" || word === "null" || word === "undefined" || word === "None" || word === "True" || word === "False") {
        parts.push(
          <span key={key++} style={{ color: numberColor }}>
            {word}
          </span>,
        );
      } else {
        parts.push(word);
      }
    } else if (space) {
      parts.push(space);
    } else if (other) {
      parts.push(other);
    }
    lastIndex = match.index + full.length;
  }
  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return <>{parts}</>;
}

const CodeRenderer: React.FC<RendererContext> = ({
  artifact,
  readOnly: forceReadOnly,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [editable, setEditable] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editContent, setEditContent] = useState("");

  const content = artifact.textContent ?? "";
  const language = detectLanguage(artifact.extension);
  const isDark = theme === "dark";
  const isReadOnly = forceReadOnly || !editable;

  const lines = content.split("\n");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }, [content]);

  const handleDownload = useCallback(() => {
    if (workspace.download) workspace.download(artifact);
  }, [workspace, artifact]);

  const handleEditToggle = useCallback(() => {
    if (!editable) {
      setEditContent(content);
    }
    setEditable(!editable);
  }, [editable, content]);

  const bgColor = isDark ? "#1e1e1e" : "#ffffff";
  const textColor = isDark ? "#d4d4d4" : "#333333";
  const lineNumColor = isDark ? "#858585" : "#999999";
  const borderColor = isDark ? "#333" : "#e8e8e8";

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
          <span
            style={{
              fontSize: 11,
              color: "#999",
              textTransform: "uppercase",
            }}
          >
            {language}
          </span>
          {artifact.isStreaming && (
            <span style={{ fontSize: 11, color: "#52c41a" }}>
              ● {t("workspace.streaming")}
            </span>
          )}
        </Space>
        <Space size={2}>
          <Tooltip
            title={copied ? t("workspace.copied") : t("workspace.copy")}
          >
            <Button
              size="small"
              type="text"
              icon={
                copied ? (
                  <CheckOutlined style={{ color: "#52c41a" }} />
                ) : (
                  <CopyOutlined />
                )
              }
              onClick={handleCopy}
            />
          </Tooltip>
          {!forceReadOnly && (
            <Tooltip
              title={editable ? t("workspace.readOnly") : t("workspace.edit")}
            >
              <Button
                size="small"
                type="text"
                icon={editable ? <EyeOutlined /> : <EditOutlined />}
                onClick={handleEditToggle}
              />
            </Tooltip>
          )}
          <Tooltip title={t("workspace.download")}>
            <Button
              size="small"
              type="text"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 代码区域 */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          fontFamily:
            "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {editable ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              padding: "8px 12px",
              background: bgColor,
              color: textColor,
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
              resize: "none",
            }}
          />
        ) : (
          <div style={{ display: "flex", minWidth: "max-content" }}>
            {/* 行号 */}
            <div
              style={{
                padding: "8px 8px 8px 12px",
                textAlign: "right",
                color: lineNumColor,
                userSelect: "none",
                borderRight: `1px solid ${borderColor}`,
                flexShrink: 0,
              }}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* 代码内容 */}
            <div
              style={{
                padding: "8px 12px",
                color: textColor,
                whiteSpace: "pre",
                flex: 1,
              }}
            >
              {lines.map((line, i) => (
                <div key={i}>
                  {highlightLine(line, language, isDark) || "\u00A0"}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeRenderer;
