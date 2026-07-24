/**
 * usePdfDocument — PDF 文档加载 Hook
 *
 * 封装 react-pdf 的 Document 组件加载逻辑：
 * - 加载状态管理（loading / error / loaded）
 * - 页数获取
 * - 大纲（outline）提取
 * - 全文文本缓存（用于搜索）
 *
 * 性能优化：
 * - 不再单独通过 pdfjs.getDocument() 加载文档，而是复用 react-pdf
 *   <Document> 组件的 onLoadSuccess 回调中已经加载好的 PDFDocumentProxy，
 *   避免重复下载和解析 PDF 文件
 * - 移除了前 5 页文本预加载（阻塞渲染），改为搜索时按需懒加载
 * - 大纲提取移至后台异步执行，不阻塞首屏渲染
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { loadReactPdf, type RawOutlineItem } from "./pdfjs";
import type { PdfOutlineNode } from "./types";

export interface UsePdfDocumentResult {
  /** react-pdf 模块（加载后可用） */
  pdfModule: typeof import("react-pdf") | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 加载错误 */
  error: string | null;
  /** 总页数 */
  numPages: number;
  /** PDF 大纲 */
  outline: PdfOutlineNode[];
  /** 每页的文本内容（1-based 索引） */
  pageTexts: Map<number, string>;
  /**
   * 接收 react-pdf <Document> 组件 onLoadSuccess 回调中的 PDFDocumentProxy。
   * 从中提取页数、大纲等信息，不再单独加载文档。
   */
  onDocumentLoad: (pdf: any) => void;
  /** 加载某页文本（懒加载，搜索时按需调用） */
  loadPageText: (pageNum: number) => Promise<string>;
}

/**
 * 将 react-pdf 原始 outline 转为 PdfOutlineNode。
 * 需要 pdf 对象来解析 dest → 页码。
 */
async function convertOutline(
  items: RawOutlineItem[],
  pdf: any,
  depth = 0,
): Promise<PdfOutlineNode[]> {
  const result: PdfOutlineNode[] = [];
  for (const item of items) {
    let destPage: number | undefined;
    if (item.dest && pdf) {
      try {
        let dest = item.dest;
        if (typeof dest === "string") {
          dest = await pdf.getDestination(dest);
        }
        if (Array.isArray(dest) && dest[0]) {
          const pageIndex = await pdf.getPageIndex(dest[0]);
          destPage = pageIndex + 1;
        }
      } catch {
        // dest 解析失败，忽略
      }
    }
    const children = item.items?.length
      ? await convertOutline(item.items, pdf, depth + 1)
      : [];
    result.push({
      title: item.title,
      dest: destPage,
      children,
      depth,
    });
  }
  return result;
}

export function usePdfDocument(): UsePdfDocumentResult {
  const [pdfModule, setPdfModule] = useState<typeof import("react-pdf") | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [outline, setOutline] = useState<PdfOutlineNode[]>([]);
  const [pageTexts, setPageTexts] = useState<Map<number, string>>(new Map());

  const pdfDocRef = useRef<any>(null);

  // 加载 react-pdf 模块
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await loadReactPdf();
      if (!cancelled) {
        setPdfModule(mod);
        if (!mod) {
          setError("react-pdf not available");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * 接收 react-pdf <Document> 组件加载成功后的 PDFDocumentProxy。
   * 从中提取页数并异步加载大纲，不阻塞渲染。
   *
   * 这取代了之前单独调用 pdfjs.getDocument() 的方式，
   * 避免了 PDF 文件被下载和解析两次。
   */
  const onDocumentLoad = useCallback((pdf: any) => {
    pdfDocRef.current = pdf;
    setNumPages(pdf.numPages);
    // 立即解除 loading 状态，让 PDF 页面开始渲染
    setLoading(false);
    setError(null);

    // 异步提取大纲（不阻塞首屏渲染）
    (async () => {
      try {
        const rawOutline = await pdf.getOutline();
        if (rawOutline && rawOutline.length > 0) {
          const converted = await convertOutline(rawOutline, pdf);
          setOutline(converted);
        } else {
          setOutline([]);
        }
      } catch {
        setOutline([]);
      }
    })();
  }, []);

  const loadPageText = useCallback(
    async (pageNum: number): Promise<string> => {
      // 先查缓存
      const cached = pageTexts.get(pageNum);
      if (cached !== undefined) return cached;

      if (!pdfDocRef.current) return "";

      try {
        const page = await pdfDocRef.current.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(" ");
        setPageTexts((prev) => new Map(prev).set(pageNum, text));
        return text;
      } catch {
        return "";
      }
    },
    [pageTexts],
  );

  return {
    pdfModule,
    loading,
    error,
    numPages,
    outline,
    pageTexts,
    onDocumentLoad,
    loadPageText,
  };
}
