/**
 * HtmlRenderer — 沙箱 iframe HTML 渲染器
 *
 * 设计灵感：LibreChat 的 HTMLRenderer
 * - 使用 iframe srcdoc 在沙箱中渲染 HTML，防止 XSS
 * - 支持流式更新（实时刷新 iframe 内容）
 * - 支持代码/预览切换
 *
 * 沙箱策略：
 * - 使用 sandbox="allow-scripts"（不含 allow-same-origin）
 *   避免「allow-scripts + allow-same-origin 可逃逸沙箱」的浏览器安全警告
 * - 注入 localStorage/sessionStorage 内存级 polyfill，
 *   使沙箱内 JS 可以正常使用这两个 Web API（否则会抛 SecurityError
 *   中断脚本执行，导致番茄钟、待办列表等功能无法使用）
 * - 注入 <base href="about:blank"> 防止 HTML 中的相对路径
 *   （如 <script src="script.js">）被解析为父页面 URL，导致 404
 *
 * 文档规范化：
 * - 如果内容是 HTML 片段（无 <!DOCTYPE>/<html>/<head>/<body>），
 *   自动包裹为完整 HTML 文档，确保浏览器以 standards mode 渲染，
 *   避免 quirks mode 导致布局/样式异常
 * - 始终注入 <meta charset="utf-8"> 防止编码问题
 */
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button, Segmented, Space, Tooltip, Spin } from "antd";
import {
  CodeOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// 模块级常量（避免每次渲染重新创建）
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 当 sandbox 不含 allow-same-origin 时，iframe 获得不透明 origin，
 * window.localStorage / sessionStorage / document.cookie 访问会抛
 * SecurityError，导致 HTML 内 JS 中断。
 *
 * 此脚本在任何业务 JS 之前执行，尝试访问原生 storage / cookie；
 * 若失败则用 Object.defineProperty 安装内存级 polyfill。
 *
 * polyfill 行为说明：
 * - localStorage / sessionStorage：内存级实现，数据不跨刷新持久化
 *   （对预览场景可接受；原生 API 在沙箱中同样不持久化）
 * - 不 polyfill document.cookie：该属性在 HTML 规范中为
 *   [LegacyUnforgeable]，某些浏览器拒绝 Object.defineProperty
 *   覆盖会抛 TypeError 导致脚本中断；Chrome/Edge 下访问返回空
 *   字符串不抛错，无需 polyfill
 */
const STORAGE_POLYFILL =
  "<script>" +
  "(function(){" +
  "function makeStorage(){var s={};return{" +
  "getItem:function(k){return k in s?s[k]:null;}," +
  "setItem:function(k,v){s[k]=String(v);}," +
  "removeItem:function(k){delete s[k];}," +
  // clear() 重新赋值 s={}；由于所有方法共享同一闭包变量 s，
  // 其他方法会看到新的空对象（JavaScript 闭包按变量引用捕获）
  "clear:function(){s={};}," +
  "key:function(i){var ks=Object.keys(s);return i>=0&&i<ks.length?ks[i]:null;}," +
  "get length(){return Object.keys(s).length;}" +
  "};}" +
  // localStorage
  'try{window.localStorage.getItem("__p_test");}' +
  'catch(e){Object.defineProperty(window,"localStorage",{configurable:true,value:makeStorage()});}' +
  // sessionStorage
  'try{window.sessionStorage.getItem("__p_test");}' +
  'catch(e){Object.defineProperty(window,"sessionStorage",{configurable:true,value:makeStorage()});}' +
  "})();" +
  "</script>";

const HtmlRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const content = artifact.textContent ?? "";

  const handleDownload = useCallback(() => {
    if (workspace.download) workspace.download(artifact);
  }, [workspace, artifact]);

  /**
   * 规范化 HTML 内容：
   *
   * 1. 如果内容是 HTML 片段（无 <!DOCTYPE>/<html>/<head>/<body>），
   *    自动包裹为完整 HTML 文档，确保 standards mode 渲染。
   *
   * 2. 注入 <base href="about:blank"> 标签，防止 HTML 中的相对路径
   *    被解析为父页面 URL（srcdoc iframe 的 base URL 继承自父页面）。
   *
   * 3. 始终注入 <meta charset="utf-8"> 防止编码问题。
   *
 * 4. 注入 STORAGE_POLYFILL 脚本，在所有业务 JS 之前安装
 *    localStorage/sessionStorage 内存级 polyfill。
   */
  const processedContent = useMemo(() => {
    if (!content) return content;

    const baseTag = '<base href="about:blank">';
    const metaCharset = '<meta charset="utf-8">';

    // 正则匹配文档结构标签（大小写不敏感）
    // hasBaseTag: 匹配 <base ...>、<base>、<base/>
    const hasBaseTag = /<base[\s>]/i.test(content);
    const hasDoctype = /<!doctype\s+html/i.test(content);
    const hasHtmlTag = /<html[\s>]/i.test(content);
    const hasHeadTag = /<head[\s>]/i.test(content);
    const hasBodyTag = /<body[\s>]/i.test(content);
    // hasMetaCharset: 大小写不敏感匹配 <meta charset="...">
    const hasMetaCharset = /<meta\s+charset/i.test(content);

    // 收集需要注入到 <head> 最前面的标签
    const injects = [
      ...(hasBaseTag ? [] : [baseTag]),
      ...(hasMetaCharset ? [] : [metaCharset]),
      STORAGE_POLYFILL,
    ];

    // ── Case 1：已经是完整 HTML 文档（有 <!DOCTYPE> 或 <html>+<head>） ──
    if (hasDoctype || (hasHtmlTag && hasHeadTag)) {
      if (hasHeadTag) {
        // 注入到 <head> 开标签之后
        return content.replace(
          /<head([^>]*)>/i,
          `<head$1>${injects.join("")}`,
        );
      }
      if (hasHtmlTag) {
        // 有 <html> 但无 <head>，在 <html> 之后创建 <head>
        return content.replace(
          /<html([^>]*)>/i,
          `<html$1><head>${injects.join("")}</head>`,
        );
      }
      // 有 DOCTYPE 但无 <html>/<head>，构造完整结构
      // 同时清除可能存在的 <body> 标签，避免嵌套
      const bodyContent = content
        .replace(/<!doctype[^>]*>/i, "")
        .replace(/<\/?body[^>]*>/gi, "");
      return `<!DOCTYPE html><html><head>${injects.join("")}</head><body>${bodyContent}</body></html>`;
    }

    // ── Case 2：有 <html> 但无 <head> ──
    if (hasHtmlTag) {
      return content.replace(
        /<html([^>]*)>/i,
        `<html$1><head>${injects.join("")}</head>`,
      );
    }

    // ── Case 3：有 <body> 但无 <html>/<head> ──
    if (hasBodyTag) {
      return `<!DOCTYPE html><html><head>${injects.join("")}</head>${content}</html>`;
    }

    // ── Case 4：纯 HTML 片段（无任何文档结构标签） ──
    return `<!DOCTYPE html><html><head>${injects.join(
      "",
    )}</head><body>${content}</body></html>`;
  }, [content]);

  const handleReload = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = processedContent;
    }
  }, [processedContent]);

  const previewContent = useMemo(() => {
    if (!content) {
      return (
        <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>
          {artifact.isStreaming ? (
            <Spin tip={t("workspace.streaming")} />
          ) : (
            t("workspace.emptyContent")
          )}
        </div>
      );
    }
    return (
      <iframe
        ref={iframeRef}
        srcDoc={processedContent}
        title={artifact.title}
        sandbox="allow-scripts"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
          background: theme === "dark" ? "#1e1e1e" : "#fff",
        }}
      />
    );
  }, [processedContent, artifact.isStreaming, artifact.title, theme, t]);

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
        <Segmented
          size="small"
          value={viewMode}
          onChange={(v) => setViewMode(v as "preview" | "code")}
          options={[
            { label: <EyeOutlined />, value: "preview" },
            { label: <CodeOutlined />, value: "code" },
          ]}
        />
        <Space size={2}>
          <Tooltip title={t("workspace.reload")}>
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleReload}
            />
          </Tooltip>
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
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          position: "relative",
        }}
      >
        {viewMode === "preview" && previewContent}
        {viewMode === "code" && (
          <pre
            style={{
              margin: 0,
              padding: "12px",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            {content}
          </pre>
        )}
      </div>
    </div>
  );
};

export default HtmlRenderer;
