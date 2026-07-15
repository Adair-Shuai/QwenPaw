/**
 * CodeRenderer — Monaco Editor 代码渲染器
 *
 * 使用 @monaco-editor/react（项目已有依赖），自动处理 web worker 配置。
 *
 * 性能优化：
 * - 使用 @monaco-editor/react 的 loader，自动配置 Monaco web workers
 *   （语法分析、诊断等在 worker 线程执行，不阻塞主线程）
 * - 禁用 TS/JS 语言服务的诊断和智能提示（预览场景不需要）
 * - 禁用 automaticLayout，改用 onMount 时手动 layout
 *
 * 支持流式追加（通过 model.applyEdits 实现无闪烁更新）
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import Editor, { type OnMount, type BeforeMount } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
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

// 配置 @monaco-editor/react 使用本地 monaco-editor 包（而非 CDN 默认的 CDN 加载）
// 延迟初始化：仅在组件首次挂载时执行一次，避免在模块加载时就引入完整的 monaco-editor
import { loader } from "@monaco-editor/react";

let loaderInitialized = false;
function ensureLoaderConfig() {
  if (loaderInitialized) return;
  loaderInitialized = true;
  // 动态导入本地 monaco-editor，配置 loader 使用它而非 CDN
  // 这样 web worker 也能正确从本地加载
  import("monaco-editor")
    .then((monacoNs) => loader.config(monacoNs))
    .catch(() => {
      // 如果本地包加载失败，loader 会回退到 CDN
    });
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
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const prevContentRef = useRef<string>("");

  const content = artifact.textContent ?? "";
  const language = detectLanguage(artifact.extension);
  const readOnly = forceReadOnly || !editable;

  // 首次挂载时初始化 Monaco loader（延迟加载 monaco-editor 包）
  useEffect(() => {
    ensureLoaderConfig();
  }, []);

  /**
   * beforeMount: 在 Monaco 实例创建前配置语言服务。
   *
   * 关键性能优化：禁用 TS/JS 诊断和智能提示。
   * 这些功能需要 worker 线程做完整的类型检查，对于预览场景非常重。
   */
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    // 禁用 TypeScript / JavaScript 诊断（预览不需要类型检查）
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.javascript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
  }, []);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    prevContentRef.current = content;
  }, [content]);

  // 流式更新：增量追加内容（参考 LibreChat 的 model.applyEdits 模式）
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const prev = prevContentRef.current;
    // 如果新内容是旧内容的追加，只插入新增部分
    if (
      content.startsWith(prev) &&
      prev.length > 0 &&
      content.length > prev.length
    ) {
      const appended = content.slice(prev.length);
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
      editor.revealLine(model.getLineCount());
    } else if (content !== prev) {
      // 内容完全变化，整体替换
      model.setValue(content);
    }
    prevContentRef.current = content;
  }, [content]);

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
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue={content}
          theme={theme === "dark" ? "vs-dark" : "light"}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          loading={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#999",
                fontSize: 13,
              }}
            >
              加载编辑器...
            </div>
          }
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 20,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            lineNumbers: "on",
            folding: true,
            renderWhitespace: "selection",
            fontFamily:
              "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
            // 性能优化：禁用不需要的功能
            automaticLayout: true,
            // 禁用智能提示和代码补全（预览场景不需要）
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            parameterHints: { enabled: false },
            hover: { enabled: false },
            // 禁用代码镜头（引用计数等）
            codeLens: false,
            // 禁用 git diff 指示器
            renderLineHighlight: "line",
            // 禁用链接检测
            links: false,
            // 禁用折叠标志（保留折叠功能但不在边距显示箭头）
            showFoldingControls: "mouseover",
          }}
        />
      </div>
    </div>
  );
};

export default CodeRenderer;
