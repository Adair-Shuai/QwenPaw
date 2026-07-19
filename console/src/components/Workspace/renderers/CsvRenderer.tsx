/**
 * CsvRenderer — CSV/TSV 表格渲染器
 *
 * 特性（吸取 LeAgent 优点）：
 * - RFC 4180 解析（支持引号、嵌入式换行/逗号）
 * - 自动分隔符检测（, \t ; |）
 * - 列类型推断（数字右对齐、日期着色、布尔标记）
 * - 表头 sticky（滚动时固定）
 * - 全文搜索 + 高亮
 * - 大文件分页（默认每页 200 行，超过 50000 行截断）
 * - 复制为 TSV / 下载原文件
 * - 主题适配（light/dark）
 */
import React, { useMemo, useState, useCallback } from "react";
import {
  Button,
  Space,
  Tooltip,
  Input,
  InputNumber,
  Tag,
  Typography,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";
import {
  parseCsv,
  inferColumnType,
  type ColumnType,
} from "../../../utils/parseCsvForPreview";

const PAGE_SIZE = 200;

const CsvRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);

  const isDark = theme === "dark";

  // 解析 CSV
  const parsed = useMemo(() => {
    const text = artifact.textContent ?? "";
    const isTsv =
      artifact.mimeType === "text/tab-separated-values" ||
      artifact.extension?.toLowerCase() === "tsv";
    return parseCsv(text, {
      delimiter: isTsv ? "\t" : undefined,
      hasHeader: true,
      maxRows: 50000,
    });
  }, [artifact.textContent, artifact.mimeType, artifact.extension]);

  // 列类型推断
  const colTypes = useMemo<ColumnType[]>(() => {
    return parsed.headers.map((_, i) => inferColumnType(i, parsed.rows));
  }, [parsed]);

  // 搜索过滤
  const filteredRows = useMemo(() => {
    if (!search.trim()) return parsed.rows;
    const q = search.toLowerCase();
    return parsed.rows.filter((row) =>
      row.some((cell) => cell?.toLowerCase().includes(q)),
    );
  }, [parsed.rows, search]);

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  // 高亮搜索词
  const highlight = useCallback(
    (text: string): React.ReactNode => {
      if (!search.trim()) return text;
      const q = search.trim();
      const lower = text.toLowerCase();
      const idx = lower.indexOf(q.toLowerCase());
      if (idx < 0) return text;
      return (
        <>
          {text.slice(0, idx)}
          <mark
            style={{
              background: isDark ? "#594320" : "#fff3a0",
              color: isDark ? "#ffd591" : "#874d00",
              padding: "0 1px",
              borderRadius: 2,
            }}
          >
            {text.slice(idx, idx + q.length)}
          </mark>
          {highlight(text.slice(idx + q.length))}
        </>
      );
    },
    [search, isDark],
  );

  const handleCopy = useCallback(async () => {
    try {
      // 复制为 TSV
      const tsv = [
        parsed.headers.join("\t"),
        ...filteredRows.map((r) => r.join("\t")),
      ].join("\n");
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }, [parsed.headers, filteredRows]);

  const handleDownload = useCallback(() => {
    workspace.download?.(artifact);
  }, [workspace, artifact]);

  const colCount = parsed.headers.length;

  // 样式
  const bg = isDark ? "#1e1e1e" : "#ffffff";
  const headerBg = isDark ? "#2a2a2a" : "#fafafa";
  const borderColor = isDark ? "#3a3a3a" : "#e8e8e8";
  const textColor = isDark ? "#d4d4d4" : "#333";
  const hoverBg = isDark ? "#2a2a2a" : "#f5f5f5";
  const numColor = isDark ? "#b5cea8" : "#098658";
  const dateColor = isDark ? "#4d9eff" : "#1677ff";

  const renderCell = (value: string, colIdx: number): React.ReactNode => {
    const type = colTypes[colIdx];
    if (value === undefined || value === null || value === "") {
      return <span style={{ color: "#999" }}>—</span>;
    }
    const highlighted = highlight(value);
    if (type === "number") {
      return (
        <span style={{ color: numColor, fontVariantNumeric: "tabular-nums" }}>
          {highlighted}
        </span>
      );
    }
    if (type === "date") {
      return <span style={{ color: dateColor }}>{highlighted}</span>;
    }
    if (type === "boolean") {
      const isTrue = /^(true|yes|1)$/i.test(value.trim());
      return (
        <Tag
          color={isTrue ? "green" : "default"}
          style={{ margin: 0, fontSize: 11 }}
        >
          {highlighted}
        </Tag>
      );
    }
    return highlighted;
  };

  if (colCount === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          background: bg,
          color: "#999",
        }}
      >
        {t("workspace.emptyCsv", "CSV 文件为空或无法解析")}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: bg,
      }}
    >
      {/* 工具栏 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Space size={4}>
          <TableOutlined style={{ color: "#999" }} />
          <span style={{ fontSize: 11, color: "#999" }}>
            {parsed.rowCount.toLocaleString()} 行 × {colCount} 列
          </span>
          {parsed.truncated && (
            <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>
              {t("workspace.truncated", "已截断")}
            </Tag>
          )}
          {parsed.delimiter !== "," && (
            <Tag style={{ fontSize: 10, margin: 0 }}>
              分隔符: {parsed.delimiter === "\t" ? "Tab" : parsed.delimiter}
            </Tag>
          )}
        </Space>

        <Space size={4}>
          <Input
            size="small"
            allowClear
            prefix={<SearchOutlined style={{ color: "#999" }} />}
            placeholder={t("workspace.searchInTable", "搜索表格...")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: 160 }}
          />
          <Tooltip
            title={
              copied
                ? t("workspace.copied", "已复制")
                : t("workspace.copy", "复制")
            }
          >
            <Button
              size="small"
              type="text"
              icon={
                copied ? (
                  <CheckOutlined style={{ color: "#52c41a" }} />
                ) : (
                  <CopyOutlined />
                )
              }
              onClick={handleCopy}
            />
          </Tooltip>
          <Tooltip title={t("workspace.download", "下载")}>
            <Button
              size="small"
              type="text"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 表格 */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          position: "relative",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {/* sticky 表头 */}
          <thead>
            <tr>
              <th
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  background: headerBg,
                  color: "#999",
                  padding: "6px 8px",
                  textAlign: "right",
                  borderBottom: `1px solid ${borderColor}`,
                  borderRight: `1px solid ${borderColor}`,
                  width: 48,
                  minWidth: 48,
                  fontSize: 11,
                  fontWeight: 400,
                }}
              >
                #
              </th>
              {parsed.headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: headerBg,
                    color: textColor,
                    padding: "6px 12px",
                    textAlign: "left",
                    borderBottom: `1px solid ${borderColor}`,
                    borderRight: `1px solid ${borderColor}`,
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                  title={h}
                >
                  {h || `col${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, rowIdx) => {
              const realRowNum = (safePage - 1) * PAGE_SIZE + rowIdx + 1;
              return (
                <tr
                  key={rowIdx}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td
                    style={{
                      padding: "4px 8px",
                      textAlign: "right",
                      color: "#999",
                      borderBottom: `1px solid ${borderColor}`,
                      borderRight: `1px solid ${borderColor}`,
                      fontSize: 11,
                      userSelect: "none",
                    }}
                  >
                    {realRowNum}
                  </td>
                  {parsed.headers.map((_, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        padding: "4px 12px",
                        color: textColor,
                        borderBottom: `1px solid ${borderColor}`,
                        borderRight: `1px solid ${borderColor}`,
                        whiteSpace: "nowrap",
                        maxWidth: 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign:
                          colTypes[colIdx] === "number" ? "right" : "left",
                      }}
                      title={row[colIdx]}
                    >
                      {renderCell(row[colIdx] ?? "", colIdx)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 分页栏 */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            padding: "4px 12px",
            borderTop: `1px solid ${borderColor}`,
            flexShrink: 0,
            fontSize: 12,
            color: "#999",
          }}
        >
          <Typography.Text style={{ fontSize: 12, color: "#999" }}>
            {(safePage - 1) * PAGE_SIZE + 1}-
            {Math.min(safePage * PAGE_SIZE, filteredRows.length)} /{" "}
            {filteredRows.length}
          </Typography.Text>
          <InputNumber
            size="small"
            min={1}
            max={totalPages}
            value={safePage}
            onChange={(v) => v && setPage(v)}
            style={{ width: 60 }}
          />
          <span style={{ color: "#999" }}>/ {totalPages}</span>
        </div>
      )}
    </div>
  );
};

export default CsvRenderer;
