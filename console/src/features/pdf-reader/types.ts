/**
 * PDF Reader 类型定义
 *
 * 设计灵感来自 LeAgent 的 features/pdf-reader/types.ts：
 * - 论文模式（Paper Mode）：缩略图 | 正文 | 研究面板 三栏布局
 * - 简单模式（Simple Mode）：仅正文 + 工具栏
 * - 全文搜索：跨页匹配 + 高亮 + 上/下导航
 * - 论文大纲：从 PDF outline 提取章节结构
 */

/** PDF 阅读器视图模式 */
export type PdfReaderMode = "simple" | "paper";

/** PDF 大纲节点（从 PDF outline 提取） */
export interface PdfOutlineNode {
  /** 标题 */
  title: string;
  /** 目标页码（1-based） */
  dest?: number;
  /** 子节点 */
  children: PdfOutlineNode[];
  /** 深度 */
  depth: number;
}

/** 搜索匹配项 */
export interface SearchMatch {
  /** 页码（1-based） */
  page: number;
  /** 匹配在页内的索引 */
  matchIndex: number;
  /** 匹配的文本上下文（前后各 30 字符） */
  context: string;
  /** 匹配文本 */
  text: string;
}

/** 搜索状态 */
export interface SearchState {
  query: string;
  matches: SearchMatch[];
  currentMatch: number; // 0-based index into matches
  isSearching: boolean;
  totalMatches: number;
}

/** 研究笔记条目 */
export interface ResearchNote {
  id: string;
  /** 关联页码 */
  page: number;
  /** 笔记内容 */
  content: string;
  /** 创建时间 */
  createdAt: number;
  /** 是否是问题（问题会被发送给 AI） */
  isQuestion: boolean;
}

/** 缩略图加载状态 */
export interface ThumbnailInfo {
  page: number;
  loaded: boolean;
  error: boolean;
}

/** 缩放级别 */
export type ZoomLevel =
  | "fit-width"
  | "fit-page"
  | "50"
  | "75"
  | "100"
  | "125"
  | "150"
  | "200";

/** PDF Reader 内部状态（供 bridge 使用） */
export interface PdfReaderState {
  mode: PdfReaderMode;
  currentPage: number;
  numPages: number;
  zoom: ZoomLevel;
  search: SearchState;
  outline: PdfOutlineNode[];
  sidebarVisible: boolean;
  researchPanelVisible: boolean;
}

/** 传递给聊天 composer 的 PDF 上下文 */
export interface PdfContextPayload {
  /** 文件名 */
  fileName: string;
  /** 文件 URL */
  fileUrl: string;
  /** 当前页码 */
  currentPage: number;
  /** 总页数 */
  numPages: number;
  /** 选中的文本（如有） */
  selectedText?: string;
  /** 当前页的文本内容 */
  pageText?: string;
  /** 论文标题（从 outline 首项推断） */
  paperTitle?: string;
}
