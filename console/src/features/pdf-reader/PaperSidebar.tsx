/**
 * PaperSidebar — 论文大纲侧边栏
 *
 * 功能：
 * - 显示 PDF outline（章节/书签结构）
 * - 点击章节跳转到对应页
 * - 可折叠/展开的树形结构
 * - 当 PDF 无 outline 时，显示页码列表作为替代
 *
 * 设计灵感来自 LeAgent 的 PaperSidebar.tsx：
 * - 深度缩进 + 折叠箭头
 * - 当前页对应章节高亮
 */
import React, { useState, useMemo } from "react";
import { Empty } from "antd";
import { useTranslation } from "react-i18next";
import type { PdfOutlineNode } from "./types";

interface PaperSidebarProps {
  /** 论文大纲 */
  outline: PdfOutlineNode[];
  /** 总页数 */
  numPages: number;
  /** 当前页码（1-based） */
  currentPage: number;
  /** 点击章节回调 */
  onNavigate: (page: number) => void;
  /** 主题 */
  theme: "light" | "dark";
}

/** 根据当前页找到对应的大纲节点标题（高亮用） */
function findActiveOutlineTitle(
  outline: PdfOutlineNode[],
  currentPage: number,
): string | null {
  let activeTitle: string | null = null;
  const walk = (nodes: PdfOutlineNode[]) => {
    for (const node of nodes) {
      if (node.dest && node.dest <= currentPage) {
        activeTitle = node.title;
      }
      if (node.children.length > 0) {
        walk(node.children);
      }
    }
  };
  walk(outline);
  return activeTitle;
}

const OutlineTree: React.FC<{
  nodes: PdfOutlineNode[];
  currentPage: number;
  onNavigate: (page: number) => void;
  isDark: boolean;
}> = ({ nodes, currentPage, onNavigate, isDark }) => {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // 默认展开第一层
    const set = new Set<string>();
    nodes.forEach((_n, i) => set.add(`${i}`));
    return set;
  });

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const activeTitle = findActiveOutlineTitle(nodes, currentPage);

  const renderNode = (
    node: PdfOutlineNode,
    key: string,
    depth: number,
  ): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(key);
    const isActive = activeTitle === node.title;
    const canNavigate = node.dest !== undefined;

    return (
      <div key={key}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 8px",
            paddingLeft: depth * 12 + 8,
            cursor: canNavigate ? "pointer" : "default",
            borderRadius: 4,
            fontSize: 12,
            lineHeight: 1.5,
            background: isActive
              ? isDark
                ? "rgba(22,119,255,0.15)"
                : "rgba(22,119,255,0.08)"
              : "transparent",
            color: isActive ? "#1677ff" : isDark ? "#ccc" : "#333",
            fontWeight: isActive ? 600 : 400,
          }}
          onClick={() => {
            if (canNavigate && node.dest) {
              onNavigate(node.dest);
            }
            if (hasChildren) toggle(key);
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = isDark ? "#2a2a2a" : "#f0f0f0";
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          {hasChildren ? (
            <span
              style={{
                display: "inline-block",
                width: 12,
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.1s",
                color: "#999",
                userSelect: "none",
              }}
            >
              ▶
            </span>
          ) : (
            <span style={{ width: 12, display: "inline-block" }} />
          )}
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={node.title}
          >
            {node.title}
          </span>
          {node.dest && (
            <span style={{ color: "#999", fontSize: 10, flexShrink: 0 }}>
              {node.dest}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child, i) =>
              renderNode(child, `${key}.${i}`, depth + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return <div>{nodes.map((node, i) => renderNode(node, `${i}`, 0))}</div>;
};

const PaperSidebar: React.FC<PaperSidebarProps> = ({
  outline,
  numPages,
  currentPage,
  onNavigate,
  theme,
}) => {
  const { t } = useTranslation();
  const isDark = theme === "dark";

  // 当无大纲时，显示页码列表
  const pageList = useMemo(() => {
    if (outline.length > 0) return null;
    return Array.from({ length: numPages }, (_, i) => i + 1);
  }, [outline, numPages]);

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "8px 4px",
        background: isDark ? "#1a1a1a" : "#fafafa",
        borderRight: `1px solid ${isDark ? "#333" : "#e8e8e8"}`,
      }}
    >
      {outline.length > 0 ? (
        <>
          <div
            style={{
              fontSize: 11,
              color: "#999",
              padding: "0 8px 6px",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {t("workspace.outline", "目录")}
          </div>
          <OutlineTree
            nodes={outline}
            currentPage={currentPage}
            onNavigate={onNavigate}
            isDark={isDark}
          />
        </>
      ) : pageList ? (
        <>
          <div
            style={{
              fontSize: 11,
              color: "#999",
              padding: "0 8px 6px",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {t("workspace.pages", "页面")}
          </div>
          {pageList.map((page) => (
            <div
              key={page}
              onClick={() => onNavigate(page)}
              style={{
                padding: "3px 8px",
                cursor: "pointer",
                borderRadius: 4,
                fontSize: 12,
                background:
                  page === currentPage
                    ? isDark
                      ? "rgba(22,119,255,0.15)"
                      : "rgba(22,119,255,0.08)"
                    : "transparent",
                color:
                  page === currentPage ? "#1677ff" : isDark ? "#ccc" : "#333",
                fontWeight: page === currentPage ? 600 : 400,
              }}
            >
              {t("workspace.page", "第")} {page} {t("workspace.pageUnit", "页")}
            </div>
          ))}
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("workspace.noOutline", "无目录信息")}
        />
      )}
    </div>
  );
};

export default PaperSidebar;
