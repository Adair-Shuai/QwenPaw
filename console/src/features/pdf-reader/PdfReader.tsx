/**
 * PdfReader — PDF 阅读器主组件
 *
 * 整合所有子组件，提供两种模式：
 *
 * 1. 简单模式（Simple）：
 *    ┌──────────────────────────┐
 *    │      PdfToolbar          │
 *    ├──────────────────────────┤
 *    │   [PdfSearchBar]         │  ← 可选
 *    ├──────────────────────────┤
 *    │                          │
 *    │     PDF Page(s)          │
 *    │                          │
 *    └──────────────────────────┘
 *
 * 2. 论文模式（Paper）：
 *    ┌──────────────────────────────────────────────────┐
 *    │                  PdfToolbar                       │
 *    ├────────┬───────────────────────────┬──────────────┤
 *    │        │   [PdfSearchBar]          │              │
 *    │  Thumb ├───────────────────────────┤  Research    │
 *    │  nails │                           │  Panel       │
 *    │  or    │     PDF Page(s)           │              │
 *    │  Outline│                          │              │
 *    │        │                           │              │
 *    └────────┴───────────────────────────┴──────────────┘
 *
 * 功能：
 * - 全文搜索：遍历所有页文本，高亮匹配，上/下导航
 * - 缩放：适应宽度 / 适应页面 / 百分比
 * - 页面跳转：工具栏输入、缩略图点击、大纲点击
 * - 研究面板：笔记 + 问 AI
 * - 上下文桥接：选中文字 → 发给聊天 composer
 */
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Spin, Alert } from "antd";
import { useTranslation } from "react-i18next";
import { usePdfDocument } from "./usePdfDocument";
import PdfToolbar from "./PdfToolbar";
import PdfSearchBar from "./PdfSearchBar";
import PdfThumbnails from "./PdfThumbnails";
import PaperSidebar from "./PaperSidebar";
import ResearchPanel from "./ResearchPanel";
import { readerComposerBridge } from "./readerComposerBridge";
import type { PdfReaderMode, ZoomLevel, SearchMatch } from "./types";

interface PdfReaderProps {
  /** PDF 文件 URL */
  fileUrl: string;
  /** 文件名 */
  fileName: string;
  /** 主题 */
  theme: "light" | "dark";
  /** 下载回调 */
  onDownload: () => void;
  /** 初始模式 */
  initialMode?: PdfReaderMode;
}

const PdfReader: React.FC<PdfReaderProps> = ({
  fileUrl,
  fileName,
  theme,
  onDownload,
  initialMode = "simple",
}) => {
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const {
    pdfModule,
    loading,
    error,
    numPages,
    outline,
    pageTexts,
    onDocumentLoad,
    loadPageText,
  } = usePdfDocument();

  // ── 状态 ──
  const [mode, setMode] = useState<PdfReaderMode>(initialMode);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState<ZoomLevel>("fit-width");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(
    undefined,
  );

  // ── 容器宽度监听（ResizeObserver）──
  // fit-width 模式下，Page 的 width prop 需要容器实际宽度。
  // 首次渲染时 ref 未挂载，clientWidth 为 0，导致 PDF 首屏宽度不对。
  // 用 ResizeObserver 持续跟踪，首次挂载即可正确计算。
  useEffect(() => {
    const el = pageContainerRef.current;
    if (!el) return;
    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth(); // 立即同步一次
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── 文件切换时重置状态 ──
  // react-pdf <Document file={fileUrl}> 会自动重新加载文档，
  // 我们只需在 URL 变化时重置页码等状态。
  useEffect(() => {
    setCurrentPage(1);
  }, [fileUrl]);

  // ── 页码导航 ──
  const goToPage = useCallback(
    (page: number) => {
      const safe = Math.max(1, Math.min(numPages || 1, page));
      setCurrentPage(safe);
    },
    [numPages],
  );

  const prevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(numPages, p + 1));
  }, [numPages]);

  // ── 全文搜索 ──
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim() || !numPages) {
        setSearchMatches([]);
        setCurrentMatch(0);
        return;
      }
      setIsSearching(true);
      const q = query.toLowerCase();
      const matches: SearchMatch[] = [];

      // 遍历所有页
      for (let page = 1; page <= numPages; page++) {
        let text = pageTexts.get(page);
        if (text === undefined) {
          text = await loadPageText(page);
        }
        if (!text) continue;
        const lower = text.toLowerCase();
        let idx = 0;
        while ((idx = lower.indexOf(q, idx)) !== -1) {
          const start = Math.max(0, idx - 30);
          const end = Math.min(text.length, idx + q.length + 30);
          matches.push({
            page,
            matchIndex: matches.length,
            text: text.slice(idx, idx + q.length),
            context:
              (start > 0 ? "..." : "") +
              text.slice(start, end) +
              (end < text.length ? "..." : ""),
          });
          idx += q.length;
        }
        // 每搜索 10 页更新一次 UI（避免卡顿）
        if (page % 10 === 0) {
          setSearchMatches([...matches]);
        }
      }
      setSearchMatches(matches);
      setCurrentMatch(matches.length > 0 ? 0 : -1);
      setIsSearching(false);

      // 跳转到第一个匹配
      if (matches.length > 0 && matches[0].page) {
        setCurrentPage(matches[0].page);
      }
    },
    [numPages, pageTexts, loadPageText],
  );

  const nextMatch = useCallback(() => {
    if (searchMatches.length === 0) return;
    const next = (currentMatch + 1) % searchMatches.length;
    setCurrentMatch(next);
    setCurrentPage(searchMatches[next].page);
  }, [searchMatches, currentMatch]);

  const prevMatch = useCallback(() => {
    if (searchMatches.length === 0) return;
    const prev =
      (currentMatch - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatch(prev);
    setCurrentPage(searchMatches[prev].page);
  }, [searchMatches, currentMatch]);

  // ── 模式切换 ──
  const handleModeChange = useCallback((newMode: PdfReaderMode) => {
    setMode(newMode);
    // 进入论文模式时自动展开搜索栏和研究面板
    if (newMode === "paper") {
      // 保持当前状态
    }
  }, []);

  // ── 缩放计算 ──
  const scale = useMemo(() => {
    if (zoom === "fit-width" || zoom === "fit-page") return null; // 由 CSS 控制
    return parseInt(zoom) / 100;
  }, [zoom]);

  // ── 加载中 ──
  if (!pdfModule || loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 12,
          background: isDark ? "#1e1e1e" : "#525659",
        }}
      >
        <Spin size="large" />
        <span style={{ color: "#ccc", fontSize: 12 }}>
          {t("workspace.loadingPdf", "正在加载 PDF...")}
        </span>
      </div>
    );
  }

  // ── 错误 ──
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          background: isDark ? "#1e1e1e" : "#525659",
          padding: 24,
        }}
      >
        <Alert
          type="warning"
          message={t("workspace.pdfLoadFailed", "PDF 加载失败")}
          description={error}
          showIcon
        />
      </div>
    );
  }

  const bgColor = isDark ? "#1e1e1e" : "#525659";
  const Document = pdfModule.Document;
  const Page = pdfModule.Page;

  // 论文标题（从 outline 首项推断）
  const paperTitle = outline[0]?.title ?? undefined;

  // 当前页文本
  const currentPageText = pageTexts.get(currentPage);

  // ── 渲染 ──
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: bgColor,
      }}
    >
      {/* 工具栏 */}
      <PdfToolbar
        currentPage={currentPage}
        numPages={numPages}
        zoom={zoom}
        mode={mode}
        searchVisible={searchVisible}
        onPrevPage={prevPage}
        onNextPage={nextPage}
        onJumpToPage={goToPage}
        onZoomChange={setZoom}
        onModeChange={handleModeChange}
        onToggleSearch={() => setSearchVisible(!searchVisible)}
        onDownload={onDownload}
        theme={theme}
      />

      {/* 搜索栏 */}
      {searchVisible && (
        <PdfSearchBar
          query={searchQuery}
          matches={searchMatches}
          currentMatch={currentMatch}
          isSearching={isSearching}
          onSearch={handleSearch}
          onPrev={prevMatch}
          onNext={nextMatch}
          onClose={() => {
            setSearchVisible(false);
            setSearchMatches([]);
          }}
          theme={theme}
        />
      )}

      {/* 主体区域 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* 左侧栏：缩略图（论文模式）或大纲 */}
        {mode === "paper" && (
          <div
            style={{
              width: 160,
              flexShrink: 0,
              height: "100%",
            }}
          >
            {/* 论文有大纲时显示大纲，否则显示缩略图 */}
            {outline.length > 0 ? (
              <PaperSidebar
                outline={outline}
                numPages={numPages}
                currentPage={currentPage}
                onNavigate={goToPage}
                theme={theme}
              />
            ) : (
              <PdfThumbnails
                pdfModule={pdfModule}
                fileUrl={fileUrl}
                numPages={numPages}
                currentPage={currentPage}
                onPageClick={goToPage}
                theme={theme}
              />
            )}
          </div>
        )}

        {/* 中央：PDF 页面 */}
        <div
          ref={pageContainerRef}
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            padding: "16px 0",
            background: bgColor,
          }}
          onMouseUp={() => {
            // 选中文字时缓存
            const sel = window.getSelection()?.toString().trim();
            if (sel && sel.length > 0) {
              setSelectedText(sel);
            }
          }}
        >
          <Document
            file={fileUrl}
            loading={null}
            onLoadSuccess={onDocumentLoad}
            error={
              <div style={{ color: "#ccc", textAlign: "center", padding: 40 }}>
                {t("workspace.pdfLoadFailed", "PDF 加载失败")}
              </div>
            }
          >
            <div
              style={{
                position: "relative",
                // 搜索高亮标记层（简化版：仅跳转到匹配页）
                boxShadow:
                  currentMatch >= 0 &&
                  searchMatches[currentMatch]?.page === currentPage
                    ? "0 0 0 3px rgba(22,119,255,0.5)"
                    : "none",
                transition: "box-shadow 0.3s",
              }}
            >
              <Page
                pageNumber={currentPage}
                scale={scale ?? undefined}
                width={
                  scale === null && zoom === "fit-width"
                    ? containerWidth
                      ? containerWidth - 32
                      : undefined
                    : undefined
                }
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="pdf-reader-page"
              />
            </div>
          </Document>
        </div>

        {/* 右侧：研究面板（论文模式） */}
        {mode === "paper" && (
          <div
            style={{
              width: 280,
              flexShrink: 0,
              height: "100%",
            }}
          >
            <ResearchPanel
              fileUrl={fileUrl}
              fileName={fileName}
              currentPage={currentPage}
              numPages={numPages}
              pageText={currentPageText}
              paperTitle={paperTitle}
              onNavigate={goToPage}
              theme={theme}
            />
          </div>
        )}
      </div>

      {/* 选中文字时浮动「问 AI」按钮 */}
      {selectedText && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: mode === "paper" ? 296 : 16,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => {
              readerComposerBridge.publish({
                fileName,
                fileUrl,
                currentPage,
                numPages,
                selectedText,
                pageText: currentPageText,
                paperTitle,
              });
              setSelectedText("");
            }}
            style={{
              padding: "6px 16px",
              background: "#1677ff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {t("workspace.askAboutSelection", "问 AI：选中内容")}
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfReader;
