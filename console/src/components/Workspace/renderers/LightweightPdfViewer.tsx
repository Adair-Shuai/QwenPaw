import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, InputNumber, Space, Spin, Tooltip } from "antd";
import {
  ColumnWidthOutlined,
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  VariableSizeList,
  type ListChildComponentProps,
  type ListOnItemsRenderedProps,
} from "react-window";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from "pdfjs-dist";
import { loadLightweightPdfJs } from "../../../features/pdf-reader/lightweightPdf";
import { constrainCanvasScale } from "./pdfViewerLimits";

const RANGE_CHUNK_BYTES = 256 * 1024;
const DEFAULT_PAGE_WIDTH = 600;
const DEFAULT_PAGE_HEIGHT = 800;
const PAGE_GAP = 16;

type ZoomMode = "fit-width" | number;

interface LightweightPdfViewerProps {
  url: string;
  headers?: Record<string, string>;
  fileSize?: number;
  theme: "light" | "dark";
  onLoadError?: (error: Error) => void;
}

interface PageDimensions {
  width: number;
  height: number;
}

interface PageRowData {
  documentVersion: number;
  getDocument: () => PDFDocumentProxy | null;
  getPageWidth: (index: number) => number;
  reportPageDimensions: (index: number, dimensions: PageDimensions) => void;
  enqueueRender: (operation: () => Promise<void>) => Promise<void>;
}

const PdfPageRow: React.FC<ListChildComponentProps<PageRowData>> = ({
  index,
  style,
  data,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<Error | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const pageNumber = index + 1;
  const targetWidth = data.getPageWidth(index);

  useEffect(() => {
    let cancelled = false;
    let pageForCleanup: PDFPageProxy | null = null;
    let pageCleaned = false;
    const cleanupPage = () => {
      if (pageCleaned || !pageForCleanup) return;
      pageCleaned = true;
      pageForCleanup.cleanup();
    };
    setStatus("loading");
    setError(null);

    void data
      .enqueueRender(async () => {
        if (cancelled) return;
        const document = data.getDocument();
        if (!document) throw new Error("PDF document is not ready");
        const page = await document.getPage(pageNumber);
        pageForCleanup = page;
        if (cancelled || data.getDocument() !== document) return;

        const baseViewport = page.getViewport({ scale: 1 });
        data.reportPageDimensions(index, {
          width: baseViewport.width,
          height: baseViewport.height,
        });
        const viewport = page.getViewport({
          scale: targetWidth / baseViewport.width,
        });
        const constrained = constrainCanvasScale(
          viewport.width,
          viewport.height,
          window.devicePixelRatio,
        );
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = Math.max(
          1,
          Math.floor(constrained.cssWidth * constrained.outputScale),
        );
        canvas.height = Math.max(
          1,
          Math.floor(constrained.cssHeight * constrained.outputScale),
        );
        canvas.style.width = `${Math.floor(constrained.cssWidth)}px`;
        canvas.style.height = `${Math.floor(constrained.cssHeight)}px`;
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Canvas 2D is unavailable");
        const renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform:
            constrained.outputScale === 1
              ? undefined
              : [constrained.outputScale, 0, 0, constrained.outputScale, 0, 0],
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (!cancelled) setStatus("ready");
      })
      .catch((reason: unknown) => {
        if (
          cancelled ||
          (reason instanceof Error &&
            reason.name === "RenderingCancelledException")
        ) {
          return;
        }
        setError(reason instanceof Error ? reason : new Error(String(reason)));
        setStatus("error");
      })
      .finally(() => {
        cleanupPage();
      });

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      cleanupPage();
    };
  }, [data, index, pageNumber, retryVersion, targetWidth]);

  const numericStyleWidth =
    typeof style.width === "number" ? style.width : Number(style.width) || 0;

  return (
    <div
      style={{
        ...style,
        display: "flex",
        justifyContent: "center",
        minWidth: Math.max(numericStyleWidth, targetWidth + 32),
        padding: `${PAGE_GAP / 2}px 16px`,
        boxSizing: "border-box",
      }}
      data-pdf-page={pageNumber}
    >
      <div
        style={{
          position: "relative",
          width: targetWidth,
          minHeight: 120,
          flexShrink: 0,
        }}
      >
        <canvas
          ref={canvasRef}
          aria-label={`${t("workspace.pdfPage", "PDF 页面")} ${pageNumber}`}
          style={{
            display: status === "ready" ? "block" : "none",
            background: "#fff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          }}
        />
        {status === "loading" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 160,
              background: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            }}
          >
            <Spin size="small" />
          </div>
        ) : null}
        {status === "error" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 160,
              gap: 8,
              padding: 16,
              background: "#fff",
              color: "#666",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 12 }}>
              {error?.message ||
                t("workspace.pdfPageLoadFailed", "页面加载失败")}
            </span>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => setRetryVersion((value) => value + 1)}
            >
              {t("workspace.retry", "重试")}
            </Button>
          </div>
        ) : null}
        <span
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            padding: "1px 6px",
            borderRadius: 4,
            background: "rgba(0,0,0,0.48)",
            color: "#fff",
            fontSize: 11,
            pointerEvents: "none",
          }}
        >
          {pageNumber}
        </span>
      </div>
    </div>
  );
};

const LightweightPdfViewer: React.FC<LightweightPdfViewerProps> = ({
  url,
  headers,
  fileSize,
  onLoadError,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<VariableSizeList<PageRowData>>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const pageDimensionsRef = useRef(new Map<number, PageDimensions>());
  const renderQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [documentVersion, setDocumentVersion] = useState(0);
  const [pageDimensionsVersion, setPageDimensionsVersion] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState<ZoomMode>("fit-width");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<Error | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateSize = () =>
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    setPageNumber(1);
    setPageCount(0);
    setDocumentVersion(0);
    pageDimensionsRef.current.clear();
    setPageDimensionsVersion((value) => value + 1);
    void loadingTaskRef.current?.destroy();
    documentRef.current = null;

    void loadLightweightPdfJs()
      .then(({ pdfjs, worker }) => {
        if (cancelled) return null;
        const isWorkspaceRequest = Boolean(headers);
        const useStrictRange =
          isWorkspaceRequest &&
          (fileSize === undefined || fileSize > 8 * 1024 * 1024);
        const task = pdfjs.getDocument({
          url,
          httpHeaders: headers,
          worker,
          rangeChunkSize: RANGE_CHUNK_BYTES,
          disableRange: false,
          disableStream: useStrictRange,
          disableAutoFetch: useStrictRange,
          useWasm: false,
          verbosity: 0,
        });
        loadingTaskRef.current = task;
        return task.promise;
      })
      .then((document) => {
        if (cancelled || !document) return;
        documentRef.current = document;
        setPageCount(document.numPages);
        setDocumentVersion((value) => value + 1);
        setStatus("ready");
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        const nextError =
          reason instanceof Error ? reason : new Error(String(reason));
        setError(nextError);
        setStatus("error");
        onLoadError?.(nextError);
      });

    return () => {
      cancelled = true;
      const task = loadingTaskRef.current;
      loadingTaskRef.current = null;
      if (task) void task.destroy();
      documentRef.current = null;
    };
  }, [fileSize, headers, onLoadError, retryVersion, url]);

  const enqueueRender = useCallback(
    async (operation: () => Promise<void>): Promise<void> => {
      const queued = renderQueueRef.current
        .catch(() => undefined)
        .then(operation);
      renderQueueRef.current = queued.catch(() => undefined);
      await queued;
    },
    [],
  );

  const reportPageDimensions = useCallback(
    (index: number, dimensions: PageDimensions) => {
      const current = pageDimensionsRef.current.get(index);
      if (
        current &&
        Math.abs(current.width - dimensions.width) < 0.5 &&
        Math.abs(current.height - dimensions.height) < 0.5
      ) {
        return;
      }
      pageDimensionsRef.current.set(index, dimensions);
      setPageDimensionsVersion((value) => value + 1);
      listRef.current?.resetAfterIndex(index);
    },
    [],
  );

  const getDimensions = useCallback(
    (index: number) =>
      pageDimensionsRef.current.get(index) ?? {
        width: DEFAULT_PAGE_WIDTH,
        height: DEFAULT_PAGE_HEIGHT,
      },
    [],
  );

  const getPageWidth = useCallback(
    (index: number) => {
      const dimensions = getDimensions(index);
      const availableWidth = Math.max(containerSize.width - 32, 160);
      return zoom === "fit-width"
        ? availableWidth
        : Math.max(160, dimensions.width * zoom);
    },
    [containerSize.width, getDimensions, zoom],
  );

  const getItemSize = useCallback(
    (index: number) => {
      const dimensions = getDimensions(index);
      const width = getPageWidth(index);
      return (dimensions.height / dimensions.width) * width + PAGE_GAP;
    },
    [getDimensions, getPageWidth],
  );

  useEffect(() => {
    listRef.current?.resetAfterIndex(0, true);
  }, [containerSize.width, pageDimensionsVersion, zoom]);

  const goToPage = useCallback(
    (number: number | null) => {
      if (number === null || pageCount === 0) return;
      const next = Math.max(1, Math.min(pageCount, number));
      setPageNumber(next);
      listRef.current?.scrollToItem(next - 1, "start");
    },
    [pageCount],
  );

  const handleItemsRendered = useCallback(
    ({ visibleStartIndex }: ListOnItemsRenderedProps) => {
      setPageNumber(visibleStartIndex + 1);
    },
    [],
  );

  const itemData = useMemo<PageRowData>(
    () => ({
      documentVersion,
      getDocument: () => documentRef.current,
      getPageWidth,
      reportPageDimensions,
      enqueueRender,
    }),
    [documentVersion, enqueueRender, getPageWidth, reportPageDimensions],
  );

  const zoomPercent = zoom === "fit-width" ? null : Math.round(zoom * 100);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: 0,
        background: "#fff",
      }}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "PageUp") {
          goToPage(pageNumber - 1);
        } else if (event.key === "PageDown") {
          goToPage(pageNumber + 1);
        } else if (event.key === "+" || event.key === "=") {
          setZoom((value) =>
            typeof value === "number" ? Math.min(value + 0.15, 3) : 1.15,
          );
        } else if (event.key === "-") {
          setZoom((value) =>
            typeof value === "number" ? Math.max(value - 0.15, 0.35) : 0.85,
          );
        } else if (event.key === "0") {
          setZoom("fit-width");
        }
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 36,
          padding: "4px 8px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <Space size={4} wrap>
          <InputNumber
            size="small"
            min={1}
            max={Math.max(pageCount, 1)}
            value={pageNumber}
            onChange={goToPage}
            controls={false}
            aria-label={t("workspace.pageNumber", "页码")}
            style={{ width: 56 }}
          />
          <span style={{ color: "#666", fontSize: 12 }}>
            / {pageCount || "-"}
          </span>
          <Tooltip title={t("workspace.zoomOut", "缩小")}>
            <Button
              size="small"
              type="text"
              icon={<ZoomOutOutlined />}
              onClick={() =>
                setZoom((value) =>
                  typeof value === "number"
                    ? Math.max(value - 0.15, 0.35)
                    : 0.85,
                )
              }
            />
          </Tooltip>
          <span
            style={{
              width: 46,
              textAlign: "center",
              color: "#666",
              fontSize: 12,
            }}
          >
            {zoomPercent === null
              ? t("workspace.fitWidthShort", "适宽")
              : `${zoomPercent}%`}
          </span>
          <Tooltip title={t("workspace.zoomIn", "放大")}>
            <Button
              size="small"
              type="text"
              icon={<ZoomInOutlined />}
              onClick={() =>
                setZoom((value) =>
                  typeof value === "number" ? Math.min(value + 0.15, 3) : 1.15,
                )
              }
            />
          </Tooltip>
          <Tooltip title={t("workspace.fitWidth", "适应宽度")}>
            <Button
              size="small"
              type={zoom === "fit-width" ? "default" : "text"}
              icon={<ColumnWidthOutlined />}
              onClick={() => setZoom("fit-width")}
            />
          </Tooltip>
        </Space>
      </div>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          background: "#f5f5f5",
        }}
      >
        {status === "ready" &&
        pageCount > 0 &&
        containerSize.width > 0 &&
        containerSize.height > 0 ? (
          <VariableSizeList<PageRowData>
            ref={listRef}
            width={containerSize.width}
            height={containerSize.height}
            itemCount={pageCount}
            itemSize={getItemSize}
            itemData={itemData}
            itemKey={(index) => `${documentVersion}:${index}`}
            overscanCount={1}
            onItemsRendered={handleItemsRendered}
            style={{ background: "#f5f5f5" }}
          >
            {PdfPageRow}
          </VariableSizeList>
        ) : null}

        {status === "loading" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              color: "#666",
              background: "#f5f5f5",
            }}
          >
            <Spin />
            <span style={{ fontSize: 12 }}>
              {t("workspace.loadingPdf", "正在加载 PDF")}
            </span>
          </div>
        ) : null}

        {status === "error" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: 24,
              color: "#555",
              background: "#f5f5f5",
              textAlign: "center",
            }}
          >
            <span>
              {error?.message || t("workspace.pdfLoadFailed", "PDF 加载失败")}
            </span>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setRetryVersion((value) => value + 1)}
            >
              {t("workspace.retry", "重试")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LightweightPdfViewer;
