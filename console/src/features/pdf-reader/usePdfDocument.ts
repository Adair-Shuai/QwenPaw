/**
 * usePdfDocument — PDF 文档加载 Hook
 *
 * 封装 react-pdf 的 Document 组件加载逻辑：
 * - 加载状态管理（loading / error / loaded）
 * - 页数获取
 * - 大纲（outline）提取
 * - 全文文本缓存（用于搜索）
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
  /** 加载文档 */
  loadDocument: (url: string) => Promise<void>;
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

  const loadDocument = useCallback(
    async (url: string) => {
      if (!pdfModule) {
        setError("react-pdf not loaded");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // 使用 pdfjs 底层 API 加载文档（不依赖 React 组件）
        // react-pdf 的类型声明未暴露 getDocument，用类型断言访问
        const pdfjs = pdfModule.pdfjs as unknown as {
          getDocument: (url: string) => { promise: Promise<any> };
        };
        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);

        // 提取大纲
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

        // 预加载前 5 页文本（用于初始搜索）
        const texts = new Map<number, string>();
        const preloadPages = Math.min(5, pdf.numPages);
        for (let i = 1; i <= preloadPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            texts.set(i, text);
          } catch {
            // 单页文本加载失败忽略
          }
        }
        setPageTexts(texts);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message || "Failed to load PDF");
        setLoading(false);
      }
    },
    [pdfModule],
  );

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
    loadDocument,
    loadPageText,
  };
}
