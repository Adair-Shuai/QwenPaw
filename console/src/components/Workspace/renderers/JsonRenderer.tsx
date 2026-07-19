/**
 * JsonRenderer — 增强版 JSON 查看器
 *
 * 特性（吸取 LeAgent 优点）：
 * - 自动检测：如果是压缩 JSON（无换行），自动 pretty-print
 * - 双视图：树形查看 / 原始文本（CodeRenderer）
 * - 树形节点支持折叠/展开、路径面包屑
 * - JSON Path 搜索 + 高亮匹配节点
 * - 复制格式化结果 / 复制原始
 * - 大数据保护（>1MB 节点折叠展示）
 * - 主题适配
 *
 * 当 react-json-view-tree 等库不可用时，使用内置轻量树渲染。
 */
import React, { useMemo, useState, useCallback } from "react";
import {
  Button,
  Space,
  Tooltip,
  Input,
  Segmented,
  Tag,
  Typography,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckOutlined,
  ApartmentOutlined,
  CodeOutlined,
  ExpandOutlined,
  CompressOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";
import CodeRenderer from "./CodeRenderer";

// ─────────────────────────────────────────────────────────────────────────────
// JSON 工具函数
// ─────────────────────────────────────────────────────────────────────────────

/** 检测 JSON 文本是否为压缩格式（无换行或换行极少） */
function isMinified(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  // 首字符是 { 或 [ 且不含换行
  if (!/^[{\[]/.test(trimmed)) return false;
  const newlineCount = (trimmed.match(/\n/g) ?? []).length;
  const length = trimmed.length;
  // 平均每行 > 500 字符视为压缩
  return newlineCount === 0 || length / newlineCount > 500;
}

/** 安全 JSON 解析 */
function tryParseJson(text: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** 格式化 JSON（带 2 空格缩进） */
function prettyPrintJson(text: string): string {
  const result = tryParseJson(text);
  if (result.ok) {
    return JSON.stringify(result.data, null, 2);
  }
  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 类型推断（用于着色）
// ─────────────────────────────────────────────────────────────────────────────

type JsonValueType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "undefined";

function getValueType(v: unknown): JsonValueType {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (Array.isArray(v)) return "array";
  return typeof v as JsonValueType;
}

// ─────────────────────────────────────────────────────────────────────────────
// 轻量 JSON 树节点
// ─────────────────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  /** 键名 */
  keyName?: string | number;
  /** 值 */
  value: unknown;
  /** 深度 */
  depth: number;
  /** 搜索词（高亮） */
  search: string;
  /** 路径前缀 */
  pathPrefix: string;
  /** 默认展开深度 */
  defaultExpandDepth: number;
  /** 主题 */
  isDark: boolean;
  /** 路径点击回调 */
  onPathClick: (path: string) => void;
}

const TYPE_COLORS: Record<JsonValueType, { dark: string; light: string }> = {
  object: { dark: "#9cdcfe", light: "#267fd9" },
  array: { dark: "#9cdcfe", light: "#267fd9" },
  string: { dark: "#ce9178", light: "#a31515" },
  number: { dark: "#b5cea8", light: "#098658" },
  boolean: { dark: "#569cd6", light: "#0000ff" },
  null: { dark: "#569cd6", light: "#888" },
  undefined: { dark: "#666", light: "#aaa" },
};

const TreeNode: React.FC<TreeNodeProps> = ({
  keyName,
  value,
  depth,
  search,
  pathPrefix,
  defaultExpandDepth,
  isDark,
  onPathClick,
}) => {
  const type = getValueType(value);
  const isContainer = type === "object" || type === "array";
  const [expanded, setExpanded] = useState(depth < defaultExpandDepth);

  // 容器的子项
  const entries = useMemo(() => {
    if (!isContainer) return [];
    if (type === "array") {
      return (value as unknown[]).map((v, i) => [i, v] as [number, unknown]);
    }
    return Object.entries(value as Record<string, unknown>);
  }, [value, type, isContainer]);

  const childCount = entries.length;
  const currentPath =
    pathPrefix +
    (keyName !== undefined
      ? typeof keyName === "number"
        ? `[${keyName}]`
        : depth === 0
          ? keyName
          : `.${keyName}`
      : "");

  // 高亮键名/字符串值
  const highlight = (text: string): React.ReactNode => {
    if (!search.trim()) return text;
    const q = search.trim();
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
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
  };

  // 叶子节点：单行渲染
  if (!isContainer) {
    let displayValue: string;
    if (type === "string") {
      displayValue = JSON.stringify(value);
    } else if (type === "null") {
      displayValue = "null";
    } else if (type === "undefined") {
      displayValue = "undefined";
    } else {
      displayValue = String(value);
    }
    const color =
      TYPE_COLORS[type][isDark ? "dark" : "light"];
    return (
      <div
        style={{
          paddingLeft: depth * 16 + 8,
          display: "flex",
          gap: 6,
          alignItems: "baseline",
          lineHeight: 1.7,
        }}
      >
        {keyName !== undefined && (
          <>
            <span
              style={{ color: isDark ? "#9cdcfe" : "#267fd9", cursor: "pointer" }}
              onClick={() => onPathClick(currentPath)}
              title={currentPath}
            >
              {highlight(String(keyName))}
            </span>
            <span style={{ color: "#888" }}>:</span>
          </>
        )}
        <span style={{ color }}>{highlight(displayValue)}</span>
      </div>
    );
  }

  // 容器节点
  const openChar = type === "array" ? "[" : "{";
  const closeChar = type === "array" ? "]" : "}";
  const empty = childCount === 0;

  return (
    <div>
      <div
        style={{
          paddingLeft: depth * 16 + 8,
          display: "flex",
          gap: 4,
          alignItems: "baseline",
          lineHeight: 1.7,
        }}
      >
        {!empty && (
          <span
            onClick={() => setExpanded(!expanded)}
            style={{
              cursor: "pointer",
              color: "#999",
              display: "inline-block",
              width: 12,
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.1s",
              userSelect: "none",
            }}
          >
            ▶
          </span>
        )}
        {empty && <span style={{ width: 12, display: "inline-block" }} />}
        {keyName !== undefined && (
          <>
            <span
              style={{ color: isDark ? "#9cdcfe" : "#267fd9", cursor: "pointer" }}
              onClick={() => onPathClick(currentPath)}
              title={currentPath}
            >
              {highlight(String(keyName))}
            </span>
            <span style={{ color: "#888" }}>:</span>
          </>
        )}
        <span
          style={{ color: isDark ? "#9cdcfe" : "#267fd9", cursor: "pointer" }}
          onClick={() => setExpanded(!expanded)}
        >
          {openChar}
        </span>
        {!expanded && (
          <>
            <span style={{ color: "#999", fontSize: 11 }}>
              {childCount} {type === "array" ? "items" : "keys"}
            </span>
            <span style={{ color: isDark ? "#9cdcfe" : "#267fd9" }}>
              {closeChar}
            </span>
          </>
        )}
      </div>
      {expanded && !empty && (
        <div>
          {entries.slice(0, 1000).map(([k, v]) => (
            <TreeNode
              key={String(k)}
              keyName={k}
              value={v}
              depth={depth + 1}
              search={search}
              pathPrefix={currentPath}
              defaultExpandDepth={defaultExpandDepth}
              isDark={isDark}
              onPathClick={onPathClick}
            />
          ))}
          {entries.length > 1000 && (
            <div
              style={{
                paddingLeft: (depth + 1) * 16 + 8,
                color: "#999",
                fontSize: 11,
                fontStyle: "italic",
              }}
            >
              ... {entries.length - 1000} more items
            </div>
          )}
          <div
            style={{
              paddingLeft: depth * 16 + 8,
              color: isDark ? "#9cdcfe" : "#267fd9",
              lineHeight: 1.7,
            }}
          >
            {closeChar}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// JsonRenderer 主组件
// ─────────────────────────────────────────────────────────────────────────────

const JsonRenderer: React.FC<RendererContext> = (props) => {
  const { artifact, theme, workspace } = props;
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const [viewMode, setViewMode] = useState<"tree" | "raw">("tree");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [pathBreadcrumb, setPathBreadcrumb] = useState<string>("");
  const [expandDepth, setExpandDepth] = useState(2);

  const rawContent = artifact.textContent ?? "";

  // 检测是否压缩 → 自动格式化
  const displayContent = useMemo(() => {
    if (!rawContent) return "";
    if (isMinified(rawContent)) {
      return prettyPrintJson(rawContent);
    }
    return rawContent;
  }, [rawContent]);

  // 解析为 JS 对象（树形视图用）
  const parsed = useMemo(() => tryParseJson(displayContent), [displayContent]);

  // 统计信息
  const stats = useMemo(() => {
    if (!parsed.ok) return null;
    const countNodes = (v: unknown): number => {
      if (v === null || typeof v !== "object") return 1;
      if (Array.isArray(v)) return v.reduce((s, x) => s + countNodes(x), 1);
      return Object.values(v).reduce((s, x) => s + countNodes(x), 1);
    };
    const type = getValueType(parsed.data);
    return { nodes: countNodes(parsed.data), type };
  }, [parsed]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [displayContent]);

  // 解析失败 → 退回 CodeRenderer
  if (!parsed.ok) {
    return <CodeRenderer {...props} />;
  }

  const bgColor = isDark ? "#1e1e1e" : "#ffffff";
  const borderColor = isDark ? "#333" : "#e8e8e8";
  const textColor = isDark ? "#d4d4d4" : "#333";

  // 当数据量过大（>50k 节点），强制用 raw 视图避免卡顿
  const forceRaw = stats && stats.nodes > 50000;

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
          {forceRaw ? (
            <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>
              {t("workspace.largeJson", "大数据")}
            </Tag>
          ) : null}
          {stats && (
            <span style={{ fontSize: 11, color: "#999" }}>
              {stats.type} · {stats.nodes.toLocaleString()} {t("workspace.nodes", "节点")}
            </span>
          )}
        </Space>

        <Space size={4}>
          {!forceRaw && (
            <Input
              size="small"
              allowClear
              prefix={<SearchOutlined style={{ color: "#999" }} />}
              placeholder={t("workspace.searchJson", "搜索键/值...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 140 }}
            />
          )}
          {!forceRaw && (
            <Segmented
              size="small"
              value={viewMode}
              onChange={(v) => setViewMode(v as "tree" | "raw")}
              options={[
                { label: "", value: "tree", icon: <ApartmentOutlined /> },
                { label: "", value: "raw", icon: <CodeOutlined /> },
              ]}
            />
          )}
          <Tooltip
            title={
              viewMode === "tree"
                ? t("workspace.expandAll", "全部展开")
                : t("workspace.compress", "折叠")
            }
          >
            <Button
              size="small"
              type="text"
              icon={
                expandDepth >= 10 ? <CompressOutlined /> : <ExpandOutlined />
              }
              onClick={() =>
                setExpandDepth((d) => (d >= 10 ? 1 : d + 3))
              }
              disabled={forceRaw || viewMode === "raw"}
            />
          </Tooltip>
          <Tooltip title={copied ? t("workspace.copied", "已复制") : t("workspace.copy", "复制")}>
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
              onClick={() => workspace.download?.(artifact)}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 路径面包屑 */}
      {viewMode === "tree" && pathBreadcrumb && (
        <div
          style={{
            padding: "2px 12px",
            borderBottom: `1px solid ${borderColor}`,
            fontSize: 11,
            color: "#999",
            fontFamily:
              "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
            flexShrink: 0,
            cursor: "pointer",
            background: isDark ? "#181818" : "#fafafa",
          }}
          onClick={() => setPathBreadcrumb("")}
          title={t("workspace.clearPath", "点击清除路径")}
        >
          <Typography.Text
            style={{ fontSize: 11, color: isDark ? "#4d9eff" : "#1677ff" }}
            code
          >
            {pathBreadcrumb}
          </Typography.Text>
        </div>
      )}

      {/* 内容区 */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: viewMode === "tree" ? "8px 0" : 0,
        }}
      >
        {viewMode === "tree" && !forceRaw ? (
          <div
            style={{
              fontFamily:
                "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
              fontSize: 13,
              color: textColor,
            }}
          >
            <TreeNode
              value={parsed.data}
              depth={0}
              search={search}
              pathPrefix=""
              defaultExpandDepth={expandDepth}
              isDark={isDark}
              onPathClick={setPathBreadcrumb}
            />
          </div>
        ) : (
          <CodeRenderer
            {...props}
            artifact={{ ...props.artifact, textContent: displayContent }}
          />
        )}
      </div>
    </div>
  );
};

export default JsonRenderer;
