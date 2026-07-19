/**
 * PdfThumbnails — PDF 缩略图侧边栏（P1 #6）
 *
 * 功能：
 * - 渲染每页的缩略图（小尺寸预览）
 * - 点击缩略图跳转到对应页
 * - 当前页高亮
 * - 懒加载（视口内才渲染）
 * - 滚动同步（当前页变化时自动滚动到对应缩略图）
 *
 * 使用 react-pdf 的 Page 组件渲染缩略图，缩放比例约 0.2-0.3。
 */
import React, { useEffect, useRef, useCallback } from "react";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";

interface PdfThumbnailsProps {
  /** react-pdf 模块 */
  pdfModule: typeof import("react-pdf") | null;
  /** PDF 文件 URL */
  fileUrl: string;
  /** 总页数 */
  numPages: number;
  /** 当前页码（1-based） */
  currentPage: number;
  /** 点击缩略图回调 */
  onPageClick: (page: number) => void;
  /** 主题 */
  theme: "light" | "dark";
}

// 单个缩略图项
const ThumbnailItem: React.FC<{
  pdfModule: typeof import("react-pdf");
  fileUrl: string;
  page: number;
  isCurrent: boolean;
  onClick: () => void;
  isDark: boolean;
}> = ({ pdfModule, fileUrl, page, isCurrent, onClick, isDark }) => {
  const [error, setError] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  // 懒加载：使用 IntersectionObserver 检测是否进入视口
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { Document, Page } = pdfModule;

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: 6,
        margin: "4px 0",
        border: `2px solid ${isCurrent ? "#1677ff" : "transparent"}`,
        borderRadius: 4,
        background: isCurrent
          ? isDark
            ? "rgba(22,119,255,0.15)"
            : "rgba(22,119,255,0.08)"
          : "transparent",
        transition: "all 0.15s ease",
        position: "relative",
        textAlign: "center",
      }}
      onMouseEnter={(e) => {
        if (!isCurrent) {
          e.currentTarget.style.background = isDark ? "#333" : "#f0f0f0";
        }
      }}
      onMouseLeave={(e) => {
        if (!isCurrent) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {visible && !error ? (
          <Document
            file={fileUrl}
            loading={null}
            error={null}
            onLoadError={() => setError(true)}
          >
            <Page
              pageNumber={page}
              scale={0.25}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onRenderSuccess={() => {}}
              onLoadError={() => setError(true)}
              loading={
                <div
                  style={{ height: 100, display: "flex", alignItems: "center" }}
                >
                  <Spin size="small" />
                </div>
              }
            />
          </Document>
        ) : error ? (
          <span style={{ color: "#999", fontSize: 11 }}>⚠️</span>
        ) : (
          <Spin size="small" />
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          color: isCurrent ? "#1677ff" : "#999",
          marginTop: 2,
          fontWeight: isCurrent ? 600 : 400,
        }}
      >
        {page}
      </div>
    </div>
  );
};

const PdfThumbnails: React.FC<PdfThumbnailsProps> = ({
  pdfModule,
  fileUrl,
  numPages,
  currentPage,
  onPageClick,
  theme,
}) => {
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  // 当前页变化时，滚动到对应缩略图
  useEffect(() => {
    if (currentRef.current && containerRef.current) {
      const container = containerRef.current;
      const el = currentRef.current;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (
        elRect.top < containerRect.top ||
        elRect.bottom > containerRect.bottom
      ) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentPage]);

  const handleClick = useCallback(
    (page: number) => {
      onPageClick(page);
    },
    [onPageClick],
  );

  if (!pdfModule) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          color: "#999",
        }}
      >
        {t("workspace.pdfUnavailable", "PDF 组件不可用")}
      </div>
    );
  }

  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "8px 6px",
        background: isDark ? "#1a1a1a" : "#fafafa",
        borderRight: `1px solid ${isDark ? "#333" : "#e8e8e8"}`,
      }}
    >
      {pages.map((page) => (
        <div key={page} ref={page === currentPage ? currentRef : undefined}>
          <ThumbnailItem
            pdfModule={pdfModule}
            fileUrl={fileUrl}
            page={page}
            isCurrent={page === currentPage}
            onClick={() => handleClick(page)}
            isDark={isDark}
          />
        </div>
      ))}
    </div>
  );
};

export default PdfThumbnails;
