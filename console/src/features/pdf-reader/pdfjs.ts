/**
 * pdfjs — 延迟加载 react-pdf + pdfjs worker
 *
 * 设计要点：
 * - react-pdf 按需 import，未安装时优雅降级
 * - worker 使用本地打包的 pdfjs-dist worker（Vite ?url 导入），
 *   不再依赖 CDN (unpkg.com)，在 Tauri 离线环境下也能秒开
 * - 在 Tauri 环境下无需网络请求即可加载 worker
 */
import type * as ReactPdfTypes from "react-pdf";

// Vite 在构建时将 worker 文件复制到 assets 目录，并返回其 URL。
// 这样 worker 直接从本地加载，无需 CDN 网络请求。
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

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
      // 配置 worker — 使用本地打包的 worker，不依赖 CDN
      mod.pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
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
