/**
 * PDF Reader 模块入口
 *
 * 导出：
 * - PdfReader: 主组件（简单模式 + 论文模式）
 * - 子组件：PdfToolbar, PdfSearchBar, PdfThumbnails, PaperSidebar, ResearchPanel
 * - readerComposerBridge: PDF 上下文 → 聊天 composer 桥接
 * - usePdfDocument: PDF 文档加载 Hook
 * - 类型定义
 */
export { default as PdfReader } from "./PdfReader";
export { default as PdfToolbar } from "./PdfToolbar";
export { default as PdfSearchBar } from "./PdfSearchBar";
export { default as PdfThumbnails } from "./PdfThumbnails";
export { default as PaperSidebar } from "./PaperSidebar";
export { default as ResearchPanel } from "./ResearchPanel";
export { readerComposerBridge } from "./readerComposerBridge";
export { usePdfDocument } from "./usePdfDocument";
export { useReaderContextInjector } from "./useReaderContextInjector";
export { loadReactPdf } from "./pdfjs";

export type {
  PdfReaderMode,
  ZoomLevel,
  PdfOutlineNode,
  SearchMatch,
  SearchState,
  ResearchNote,
  PdfContextPayload,
  PdfReaderState,
} from "./types";
