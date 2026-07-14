/** PdfRenderer — PDF 文档渲染器（react-pdf） */
import React, { useState, useCallback } from "react";
import { Button, Space, Tooltip, Spin, InputNumber } from "antd";
import { LeftOutlined, RightOutlined, DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";

const PdfRenderer: React.FC<RendererContext> = ({ artifact, theme, workspace }) => {
  const { t } = useTranslation();
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const url = artifact.binaryUrl ?? "";

  // 延迟加载 react-pdf 以避免未安装时报错
  const [pdfComponent, setPdfComponent] = useState<any>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("react-pdf");
        if (!cancelled) {
          mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
          setPdfComponent(mod);
        }
      } catch {
        if (!cancelled) setPdfComponent(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme === "dark" ? "#1e1e1e" : "#525659" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", background: theme === "dark" ? "#252528" : "#323639", flexShrink: 0 }}>
        <Space size={4}>
          <Button size="small" type="text" icon={<LeftOutlined />} disabled={pageNum <= 1} onClick={() => setPageNum(p => p - 1)} />
          <InputNumber size="small" min={1} max={numPages || 1} value={pageNum} onChange={(v) => v && setPageNum(v)} style={{ width: 60 }} />
          <span style={{ color: "#ccc", fontSize: 12 }}>/ {numPages}</span>
          <Button size="small" type="text" icon={<RightOutlined />} disabled={pageNum >= numPages} onClick={() => setPageNum(p => p + 1)} />
        </Space>
        <Tooltip title={t("workspace.download")}>
          <Button size="small" type="text" icon={<DownloadOutlined />} onClick={() => workspace.download?.(artifact)} />
        </Tooltip>
      </div>
      <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: 16 }}>
        {loading && <Spin tip={t("workspace.loading")} />}
        {pdfComponent && (
          <pdfComponent.Document file={url} onLoadSuccess={onDocumentLoadSuccess} loading={null}>
            <pdfComponent.Page pageNumber={pageNum} renderTextLayer={false} renderAnnotationLayer={false} />
          </pdfComponent.Document>
        )}
        {!pdfComponent && !loading && (
          <div style={{ color: "#ccc", textAlign: "center" }}>
            <p>PDF rendering unavailable</p>
            <Button icon={<DownloadOutlined />} onClick={() => workspace.download?.(artifact)}>Download PDF</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfRenderer;
