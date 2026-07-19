/**
 * PdfSearchBar — PDF 全文搜索栏（P1 #6）
 *
 * 功能：
 * - 跨页全文搜索（使用 pdfjs text layer）
 * - 搜索结果上/下导航
 * - 匹配计数（当前/总数）
 * - 高亮匹配项
 * - 搜索进度指示（大文档搜索耗时）
 */
import React, { useState, useCallback, useEffect } from "react";
import { Input, Button, Space, Tooltip, Spin } from "antd";
import {
  SearchOutlined,
  UpOutlined,
  DownOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { SearchMatch } from "./types";

interface PdfSearchBarProps {
  /** 搜索查询 */
  query: string;
  /** 搜索结果 */
  matches: SearchMatch[];
  /** 当前匹配索引（0-based） */
  currentMatch: number;
  /** 是否正在搜索 */
  isSearching: boolean;
  /** 搜索回调 */
  onSearch: (query: string) => void;
  /** 上一个匹配 */
  onPrev: () => void;
  /** 下一个匹配 */
  onNext: () => void;
  /** 关闭搜索栏 */
  onClose: () => void;
  /** 主题 */
  theme: "light" | "dark";
}

const PdfSearchBar: React.FC<PdfSearchBarProps> = ({
  query,
  matches,
  currentMatch,
  isSearching,
  onSearch,
  onPrev,
  onNext,
  onClose,
  theme,
}) => {
  const { t } = useTranslation();
  const [localQuery, setLocalQuery] = useState(query);
  const isDark = theme === "dark";

  // 同步外部 query
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        onSearch(localQuery);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.shiftKey ? onPrev() : onNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [onPrev, onNext, onClose],
  );

  const bg = isDark ? "#2a2a2a" : "#f5f5f5";
  const borderColor = isDark ? "#444" : "#d9d9d9";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "4px 8px",
        background: bg,
        borderBottom: `1px solid ${borderColor}`,
        gap: 4,
        flexShrink: 0,
      }}
    >
      <Input
        size="small"
        prefix={<SearchOutlined style={{ color: "#999" }} />}
        placeholder={t("workspace.searchInPdf", "在 PDF 中搜索...")}
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        allowClear
        style={{ maxWidth: 280 }}
      />
      <Space size={0}>
        <Tooltip title={t("workspace.prevMatch", "上一个匹配 (Shift+Enter)")}>
          <Button
            size="small"
            type="text"
            icon={<UpOutlined />}
            disabled={matches.length === 0}
            onClick={onPrev}
          />
        </Tooltip>
        <Tooltip title={t("workspace.nextMatch", "下一个匹配 (Enter)")}>
          <Button
            size="small"
            type="text"
            icon={<DownOutlined />}
            disabled={matches.length === 0}
            onClick={onNext}
          />
        </Tooltip>
      </Space>
      {/* 匹配计数 */}
      <div
        style={{
          fontSize: 12,
          color: "#999",
          minWidth: 80,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {isSearching ? (
          <>
            <Spin size="small" />
            <span>{t("workspace.searching", "搜索中...")}</span>
          </>
        ) : localQuery.trim() ? (
          <span>
            {matches.length > 0
              ? `${currentMatch + 1} / ${matches.length}`
              : t("workspace.noMatches", "无匹配")}
          </span>
        ) : null}
      </div>
      <Tooltip title={t("workspace.close", "关闭")}>
        <Button
          size="small"
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
        />
      </Tooltip>
    </div>
  );
};

export default PdfSearchBar;
