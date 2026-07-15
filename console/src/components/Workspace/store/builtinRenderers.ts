/**
 * builtinRenderers — 内置渲染器注册
 *
 * 融合 TipTap 和 LibreChat 的优势：
 *
 * TipTap 优势 → Markdown / RichText 渲染器
 *   - 静态渲染（renderToReactElement）无需 Editor 实例
 *   - 支持表格、数学公式、代码高亮
 *   - 可切换为可编辑模式
 *
 * LibreChat 优势 → 多格式渲染器
 *   - Sandpack 代码执行预览
 *   - react-pdf 文档渲染
 *   - 后端 Office 文档转换（mammoth/xlsx/pptx-preview）
 *   - monaco-editor 代码查看
 *
 * 渲染器分类：
 *   1. 文本类：Markdown、HTML、代码、JSON
 *   2. 文档类：PDF、DOCX、XLSX、PPTX
 *   3. 媒体类：图片、视频、音频
 *   4. 可执行类：React 组件、Sandpack
 *   5. 科学数据类（预留）：测井曲线、三维网格
 */
import type { Disposable } from "../../../plugins/registry/types";
import { rendererRegistry } from "./rendererRegistry";
import { MimeTypes } from "./rendererRegistry";
import type { RendererRegistration } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// 渲染器组件（延迟加载，按需 import）
// ─────────────────────────────────────────────────────────────────────────────

import MarkdownRenderer from "../renderers/MarkdownRenderer";
import HtmlRenderer from "../renderers/HtmlRenderer";
import CodeRenderer from "../renderers/CodeRenderer";
import JsonRenderer from "../renderers/JsonRenderer";
import ImageRenderer from "../renderers/ImageRenderer";
import PdfRenderer from "../renderers/PdfRenderer";
import OfficeDocRenderer from "../renderers/OfficeDocRenderer";
import MediaRenderer from "../renderers/MediaRenderer";
import SandpackRenderer from "../renderers/SandpackRenderer";
import MermaidRenderer from "../renderers/MermaidRenderer";
import FallbackRenderer from "../renderers/FallbackRenderer";

// ─────────────────────────────────────────────────────────────────────────────
// 内置渲染器注册表
// ─────────────────────────────────────────────────────────────────────────────

const builtinRenderers: RendererRegistration[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // 1. 文本类
  // ═══════════════════════════════════════════════════════════════════════

  // Markdown 渲染器（TipTap 静态渲染）
  {
    id: "markdown",
    name: "Markdown",
    component: MarkdownRenderer,
    mimeTypes: [MimeTypes.MARKDOWN, "text/x-markdown"],
    extensions: ["md", "markdown", "mdx"],
    priority: 10,
    editable: true,
    streamable: true,
    description: "TipTap 驱动的 Markdown 渲染，支持表格、数学公式、代码高亮",
  },

  // HTML 渲染器（iframe 沙箱）
  {
    id: "html",
    name: "HTML",
    component: HtmlRenderer,
    mimeTypes: [MimeTypes.HTML],
    extensions: ["html", "htm"],
    priority: 10,
    streamable: true,
    description: "沙箱 iframe 渲染 HTML，支持 SVG 内联",
  },

  // 代码渲染器（Monaco Editor）
  {
    id: "code",
    name: "Code",
    component: CodeRenderer,
    mimeTypes: [
      MimeTypes.JAVASCRIPT,
      MimeTypes.TYPESCRIPT,
      MimeTypes.PYTHON,
      MimeTypes.CSS,
      MimeTypes.SHELL,
      MimeTypes.PLAIN,
    ],
    extensions: [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "c",
      "cpp",
      "go",
      "rs",
      "rb",
      "php",
      "sql",
      "sh",
      "bash",
      "css",
      "less",
      "scss",
    ],
    priority: 5,
    editable: true,
    streamable: true,
    description: "Monaco Editor 代码查看，支持语法高亮和智能提示",
  },

  // JSON 渲染器
  {
    id: "json",
    name: "JSON",
    component: JsonRenderer,
    mimeTypes: [MimeTypes.JSON],
    extensions: ["json", "jsonc"],
    priority: 8,
    editable: true,
    streamable: true,
    description: "JSON 树形查看器，支持折叠/展开和 JSON Path 搜索",
  },

  // Mermaid 图表渲染器
  {
    id: "mermaid",
    name: "Mermaid",
    component: MermaidRenderer,
    mimeTypes: [MimeTypes.MERMAID],
    extensions: ["mmd", "mermaid"],
    priority: 10,
    streamable: true,
    description: "Mermaid 图表渲染（流程图、时序图、甘特图等）",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 2. 文档类
  // ═══════════════════════════════════════════════════════════════════════

  // PDF 渲染器（react-pdf）
  {
    id: "pdf",
    name: "PDF",
    component: PdfRenderer,
    mimeTypes: [MimeTypes.PDF],
    extensions: ["pdf"],
    priority: 10,
    description: "PDF 文档渲染，支持页码导航和缩放",
  },

  // Office 文档渲染器（后端转换 + HTML 渲染）
  {
    id: "office-doc",
    name: "Office Document",
    component: OfficeDocRenderer,
    mimeTypes: [MimeTypes.DOCX, MimeTypes.XLSX, MimeTypes.PPTX],
    extensions: ["docx", "xlsx", "pptx", "doc", "xls", "ppt"],
    priority: 10,
    description: "Office 文档渲染（后端转换为 HTML，支持 DOCX/XLSX/PPTX）",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 3. 媒体类
  // ═══════════════════════════════════════════════════════════════════════

  // 图片渲染器
  {
    id: "image",
    name: "Image",
    component: ImageRenderer,
    mimeTypes: [
      MimeTypes.PNG,
      MimeTypes.JPEG,
      MimeTypes.GIF,
      MimeTypes.SVG,
      MimeTypes.WEBP,
    ],
    extensions: ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"],
    priority: 10,
    description: "图片查看器，支持缩放、旋转和全屏",
  },

  // 视频/音频渲染器
  {
    id: "media",
    name: "Media",
    component: MediaRenderer,
    mimeTypes: [
      MimeTypes.MP4,
      MimeTypes.WEBM,
      MimeTypes.MP3,
      MimeTypes.WAV,
    ],
    extensions: [
      "mp4", "webm", "avi", "mov", "mkv", "wmv", "flv",
      "mp3", "wav", "flac", "aac", "ogg", "wma",
    ],
    priority: 10,
    description: "视频/音频播放器，支持 MP4、WebM、MP3、WAV 等",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 4. 可执行类
  // ═══════════════════════════════════════════════════════════════════════

  // React 代码预览（Sandpack）
  {
    id: "sandpack-react",
    name: "React Preview",
    component: SandpackRenderer,
    mimeTypes: [MimeTypes.REACT_COMPONENT],
    extensions: ["react.js", "react.jsx"],
    sources: ["tool_call", "generated"],
    priority: 10,
    description: "Sandpack 代码执行预览，支持 React/HTML 实时渲染",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 5. 科学数据类（预留扩展点，未来实现）
  // ═══════════════════════════════════════════════════════════════════════
  // 测井曲线渲染器（LAS/DLIS）— 插件注册
  // 三维网格渲染器（OBJ/STL/VTK）— 插件注册
  // 地震数据渲染器（SEGY）— 插件注册

  // ═══════════════════════════════════════════════════════════════════════
  // 6. Fallback
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "fallback",
    name: "File",
    component: FallbackRenderer,
    priority: -1,
    description: "未知文件类型的兜底渲染器，显示文件信息和下载按钮",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 注册函数
// ─────────────────────────────────────────────────────────────────────────────

let registered: Disposable | null = null;

/**
 * 注册所有内置渲染器（在应用启动时调用一次）
 */
export function registerBuiltinRenderers(): Disposable {
  if (registered) return registered;
  registered = rendererRegistry.registerAll(builtinRenderers);
  return registered;
}

/**
 * 注销所有内置渲染器
 */
export function unregisterBuiltinRenderers(): void {
  if (registered) {
    registered.dispose();
    registered = null;
  }
}
