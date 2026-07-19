/**
 * PdfRenderer — PDF 文档渲染器
 *
 * 集成 features/pdf-reader/PdfReader 组件，支持：
 * - 简单模式：基础页码导航 + 缩放 + 下载
 * - 论文模式：缩略图/大纲 + 正文 + 研究面板三栏布局
 * - 全文搜索：跨页匹配 + 高亮 + 上/下导航
 * - 上下文桥接：选中文字 → 发给聊天 composer
 *
 * 当 react-pdf 不可用时，回退为下载按钮。
 */
import React, { useState, useCallback } from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";
import { PdfReader } from "../../../features/pdf-reader";
import type { PdfReaderMode } from "../../../features/pdf-reader";

const PdfRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const url = artifact.binaryUrl ?? "";
  const [readerMode] = useState<PdfReaderMode>("simple");

  const handleDownload = useCallback(() => {
    workspace.download?.(artifact);
  }, [workspace, artifact]);

  // 如果没有 URL，显示错误
  if (!url) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 12,
          background: theme === "dark" ? "#1e1e1e" : "#525659",
          color: "#ccc",
        }}
      >
        <span>{t("workspace.noFileUrl", "无文件 URL")}</span>
        <Button icon={<DownloadOutlined />} onClick={handleDownload}>
          {t("workspace.download", "下载")}
        </Button>
      </div>
    );
  }

  return (
    <PdfReader
      fileUrl={url}
      fileName={artifact.title}
      theme={theme}
      onDownload={handleDownload}
      initialMode={readerMode}
    />
  );
};

export default PdfRenderer;
