/**
 * CodeRenderer — Monaco Editor 代码渲染器
 *
 * 设计灵感：LibreChat 的 ArtifactCodeEditor
 * - 使用 Monaco Editor 渲染代码
 * - 支持流式追加（通过 model.applyEdits 实现无闪烁更新）
 * - 支持语法高亮、代码折叠、行号
 * - 只读/编辑模式切换
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
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

// 延迟加载 Monaco Editor（复用项目中已有的 monaco-editor）
let monacoLoaded = false;
async function loadMonaco() {
  if (monacoLoaded) return true;
  try {
    await import("monaco-editor");
    // 配置 worker（如果需要）
    monacoLoaded = true;
    return true;
  } catch {
    return false;
  }
}

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

const CodeRenderer: React.FC<RendererContext> = ({
  artifact,
  readOnly: forceReadOnly,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [editable, setEditable] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const prevContentRef = useRef<string>("");

  const content = artifact.textContent ?? "";
  const language = detectLanguage(artifact.extension);
  const readOnly = forceReadOnly || !editable;

  // 初始化 Monaco Editor
  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    (async () => {
      const loaded = await loadMonaco();
      if (disposed || !loaded || !containerRef.current) return;

      const monaco = await import("monaco-editor");
      const model = monaco.editor.createModel(content, language);
      modelRef.current = model;
      prevContentRef.current = content;

      const editor = monaco.editor.create(containerRef.current, {
        model,
        theme: theme === "dark" ? "vs-dark" : "vs",
        readOnly,
        automaticLayout: true,
        fontSize: 13,
        lineHeight: 20,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        lineNumbers: "on",
        folding: true,
        renderWhitespace: "selection",
        fontFamily:
          "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
      });
      editorRef.current = editor;
    })();

    return () => {
      disposed = true;
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
      if (modelRef.current) {
        modelRef.current.dispose();
        modelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 流式更新：增量追加内容（参考 LibreChat 的 model.applyEdits 模式）
  useEffect(() => {
    if (!editorRef.current || !modelRef.current) return;

    const prev = prevContentRef.current;
    // 如果新内容是旧内容的追加，只插入新增部分
    if (
      content.startsWith(prev) &&
      prev.length > 0 &&
      content.length > prev.length
    ) {
      const appended = content.slice(prev.length);
      const model = modelRef.current;
      const lastLine = model.getLineCount();
      const lastColumn = model.getLineMaxColumn(lastLine);
      model.applyEdits([
        {
          range: {
            startLineNumber: lastLine,
            startColumn: lastColumn,
            endLineNumber: lastLine,
            endColumn: lastColumn,
          },
          text: appended,
        },
      ]);
      // 自动滚动到底部
      editorRef.current.revealLine(model.getLineCount());
    } else if (content !== prev) {
      // 内容完全变化，整体替换
      modelRef.current.setValue(content);
    }
    prevContentRef.current = content;
  }, [content]);

  // 切换只读模式
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  // 切换主题
  useEffect(() => {
    if (editorRef.current) {
      import("monaco-editor").then((monaco) => {
        monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");
      });
    }
  }, [theme]);

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
          <span
            style={{ fontSize: 11, color: "#999", textTransform: "uppercase" }}
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
          <Tooltip title={copied ? t("workspace.copied") : t("workspace.copy")}>
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
                onClick={() => setEditable(!editable)}
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
      <div ref={containerRef} style={{ flex: 1, overflow: "hidden" }} />
    </div>
  );
};

export default CodeRenderer;
