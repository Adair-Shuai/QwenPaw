/**
 * PdfToolbar — PDF 阅读器工具栏
 *
 * 功能：
 * - 上一页 / 下一页 / 页码跳转
 * - 缩放（适应宽度 / 适应页面 / 百分比）
 * - 模式切换（简单模式 ↔ 论文模式）
 * - 搜索触发（展开搜索栏）
 * - 下载
 */
import React from "react";
import { Button, Space, Tooltip, InputNumber, Select, Segmented } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  ReadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { PdfReaderMode, ZoomLevel } from "./types";

interface PdfToolbarProps {
  currentPage: number;
  numPages: number;
  zoom: ZoomLevel;
  mode: PdfReaderMode;
  searchVisible: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (page: number) => void;
  onZoomChange: (zoom: ZoomLevel) => void;
  onModeChange: (mode: PdfReaderMode) => void;
  onToggleSearch: () => void;
  onDownload: () => void;
  /** 在文件管理器中定位回调 */
  onRevealInFileManager?: () => void;
  /** 是否可在文件管理器中定位 */
  canRevealInFileManager?: boolean;
  theme: "light" | "dark";
}

const ZOOM_OPTIONS: { label: string; value: ZoomLevel }[] = [
  { label: "适应宽度", value: "fit-width" },
  { label: "适应页面", value: "fit-page" },
  { label: "50%", value: "50" },
  { label: "75%", value: "75" },
  { label: "100%", value: "100" },
  { label: "125%", value: "125" },
  { label: "150%", value: "150" },
  { label: "200%", value: "200" },
];

const PdfToolbar: React.FC<PdfToolbarProps> = ({
  currentPage,
  numPages,
  zoom,
  mode,
  searchVisible,
  onPrevPage,
  onNextPage,
  onJumpToPage,
  onZoomChange,
  onModeChange,
  onToggleSearch,
  onDownload,
  onRevealInFileManager,
  canRevealInFileManager,
  theme,
}) => {
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const toolbarBg = isDark ? "#252528" : "#323639";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 8px",
        background: toolbarBg,
        flexShrink: 0,
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {/* 左侧：模式切换 + 页码导航 */}
      <Space size={4}>
        <Segmented
          size="small"
          value={mode}
          onChange={(v) => onModeChange(v as PdfReaderMode)}
          options={[
            {
              label: "",
              value: "simple",
              icon: <FileTextOutlined />,
            },
            {
              label: "",
              value: "paper",
              icon: <ReadOutlined />,
            },
          ]}
        />
        <Button
          size="small"
          type="text"
          icon={<LeftOutlined />}
          disabled={currentPage <= 1}
          onClick={onPrevPage}
          style={{ color: "#ccc" }}
        />
        <InputNumber
          size="small"
          min={1}
          max={numPages || 1}
          value={currentPage}
          onChange={(v) => v && onJumpToPage(v)}
          style={{ width: 60 }}
        />
        <span style={{ color: "#ccc", fontSize: 12 }}>/ {numPages}</span>
        <Button
          size="small"
          type="text"
          icon={<RightOutlined />}
          disabled={currentPage >= numPages}
          onClick={onNextPage}
          style={{ color: "#ccc" }}
        />
      </Space>

      {/* 右侧：缩放 + 搜索 + 下载 */}
      <Space size={4}>
        <Select
          size="small"
          value={zoom}
          onChange={onZoomChange}
          options={ZOOM_OPTIONS}
          style={{ width: 110 }}
        />
        <Tooltip
          title={
            searchVisible
              ? t("workspace.hideSearch", "隐藏搜索")
              : t("workspace.showSearch", "全文搜索")
          }
        >
          <Button
            size="small"
            type={searchVisible ? "primary" : "text"}
            icon={<SearchOutlined />}
            onClick={onToggleSearch}
            style={searchVisible ? {} : { color: "#ccc" }}
          />
        </Tooltip>
        <Tooltip title={t("workspace.download", "下载")}>
          <Button
            size="small"
            type="text"
            icon={<DownloadOutlined />}
            onClick={onDownload}
            style={{ color: "#ccc" }}
          />
        </Tooltip>
        {canRevealInFileManager && onRevealInFileManager && (
          <Tooltip title={t("workspace.revealInFileManager", "在文件夹中打开")}>
            <Button
              size="small"
              type="text"
              icon={<FolderOpenOutlined />}
              onClick={onRevealInFileManager}
              style={{ color: "#ccc" }}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  );
};

export default PdfToolbar;
