/**
 * pdfjs — 延迟加载 react-pdf + pdfjs worker
 *
 * 设计要点：
 * - react-pdf 按需 import，未安装时优雅降级
 * - worker 使用本地 CDN（unpkg），版本与 pdfjs-dist 对齐
 * - 在 Tauri 环境下可能无法访问 CDN，此时 worker 失败但仍可渲染（主线程降级）
 */
import type * as ReactPdfTypes from "react-pdf";

let cachedModule: typeof ReactPdfTypes | null = null;
let loadingPromise: Promise<typeof ReactPdfTypes | null> | null = null;

/**
 * 加载 react-pdf 模块并配置 worker。
 * 返回 null 表示不可用（未安装或加载失败）。
 */
export function loadReactPdf(): Promise<typeof ReactPdfTypes | null> {
  if (cachedModule) return Promise.resolve(cachedModule);
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const mod = await import("react-pdf");
      // 配置 worker
      const version = mod.pdfjs.version;
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
      cachedModule = mod;
      return mod;
    } catch (err) {
      console.warn("[PdfReader] react-pdf unavailable:", err);
      return null;
    }
  })();

  return loadingPromise;
}

/** 同步获取已加载的模块（未加载返回 null） */
export function getReactPdf(): typeof ReactPdfTypes | null {
  return cachedModule;
}

/** PDF 文档加载参数 */
export interface PdfDocumentLoadSuccess {
  numPages: number;
}

/** 从 PDF outline 数据结构提取大纲 */
export type RawOutlineItem = {
  title: string;
  dest?: unknown;
  items: RawOutlineItem[];
};

export type { PdfDocumentLoadSuccess as DocumentLoadSuccess };
