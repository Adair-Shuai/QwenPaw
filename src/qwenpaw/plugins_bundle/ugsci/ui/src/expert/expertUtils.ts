/**
 * Shared expert UI components and constants.
 */

import { getHost } from "../core/runtime";
import { PRIMARY_BTN_STYLE } from "../core/shared";
import type { PoolSkillSpec, SkillSpec } from "../core/types";

export const DEFAULT_PROMPT_FILES = ["AGENTS.md", "SOUL.md", "PROFILE.md"];

export function TagList({
  items,
  max = 5,
  color = "blue",
  emptyText = "无",
}: {
  items: string[];
  max?: number;
  color?: string;
  emptyText?: string;
}) {
  const React = getHost().React;
  const { Tag } = getHost().antd;
  if (!items || items.length === 0) {
    return React.createElement(
      "span",
      { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
      emptyText,
    );
  }
  return React.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...items
      .slice(0, max)
      .map((item, i) =>
        React.createElement(
          Tag,
          { key: i, color, style: { fontSize: 11, marginRight: 0 } },
          item,
        ),
      ),
    items.length > max
      ? React.createElement(
          Tag,
          { style: { fontSize: 11, marginRight: 0 } },
          `+${items.length - max}`,
        )
      : null,
  );
}

// ─── Skill Picker Modal (card-grid style, consistent with Skill Center) ───────

export function SkillPickerModal({
  open,
  onClose,
  poolSkills,
  installedSkillNames,
  loading,
  onInstall,
}: {
  open: boolean;
  onClose: () => void;
  poolSkills: PoolSkillSpec[];
  installedSkillNames: string[];
  loading: boolean;
  onInstall: (skillNames: string[]) => Promise<void>;
}) {
  const React = getHost().React;
  const { useState, useEffect, useMemo } = React;
  const { Modal, Button, Empty, Spin, Input, Tag, Tooltip, Typography } =
    getHost().antd;
  const { CheckOutlined, SearchOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedNames([]);
      setSearchText("");
    }
  }, [open]);

  const filteredSkills = useMemo(() => {
    if (!searchText.trim()) return poolSkills;
    const q = searchText.toLowerCase();
    return poolSkills.filter(
      (s: PoolSkillSpec) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some((t: string) => t.toLowerCase().includes(q)),
    );
  }, [poolSkills, searchText]);

  const availableSkills = filteredSkills.filter(
    (s: PoolSkillSpec) => !installedSkillNames.includes(s.name),
  );

  const toggleSkill = (name: string) => {
    setSelectedNames((prev: string[]) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleConfirm = async () => {
    if (selectedNames.length === 0) return;
    await onInstall(selectedNames);
    setSelectedNames([]);
  };

  return React.createElement(
    Modal,
    {
      open,
      onCancel: onClose,
      title: "从技能池选择技能",
      width: 680,
      footer: React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          },
        },
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${selectedNames.length} 个技能`,
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          React.createElement(Button, { onClick: onClose }, "取消"),
          React.createElement(
            Button,
            {
              type: "primary",
              onClick: handleConfirm,
              disabled: selectedNames.length === 0,
            },
            selectedNames.length > 0
              ? `添加 (${selectedNames.length})`
              : "添加",
          ),
        ),
      ),
    },
    // Search + bulk actions bar
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { flex: 1 },
      }),
      React.createElement(
        Button,
        {
          size: "small",
          type: "primary",
          onClick: () => setSelectedNames(availableSkills.map((s) => s.name)),
        },
        "全选",
      ),
      React.createElement(
        Button,
        {
          size: "small",
          onClick: () => setSelectedNames([]),
        },
        "清空",
      ),
    ),
    // Skill grid (card style matching Skill Center)
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 40 } },
          React.createElement(Spin, { size: "large" }),
        )
      : filteredSkills.length === 0
        ? React.createElement(Empty, {
            description: searchText ? "未找到匹配的技能" : "技能池暂无可用技能",
            image: Empty.PRESENTED_IMAGE_SIMPLE,
          })
        : React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
                gap: 8,
                maxHeight: 360,
                overflowY: "auto",
                padding: 2,
              },
            },
            ...filteredSkills.map((skill: PoolSkillSpec) => {
              const isSelected = selectedNames.includes(skill.name);
              const isInstalled = installedSkillNames.includes(skill.name);
              return React.createElement(
                "div",
                {
                  key: skill.name,
                  onClick: () => !isInstalled && toggleSkill(skill.name),
                  style: {
                    position: "relative",
                    padding: "10px 12px",
                    border: `1px solid ${isSelected ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
                    borderRadius: 6,
                    cursor: isInstalled ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                    background: isSelected
                      ? "rgba(0, 114, 245, 0.06)"
                      : isInstalled
                        ? "var(--ant-color-fill-quaternary, #fafafa)"
                        : "var(--ant-color-bg-container, #fff)",
                    opacity: isInstalled ? 0.5 : 1,
                    minHeight: 64,
                  },
                },
                isSelected
                  ? React.createElement(
                      "span",
                      {
                        style: {
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#0072f5",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                        },
                      },
                      CheckOutlined
                        ? React.createElement(CheckOutlined)
                        : "\u2713",
                    )
                  : null,
                isInstalled
                  ? React.createElement(
                      "span",
                      {
                        style: {
                          position: "absolute",
                          top: 6,
                          right: 8,
                          fontSize: 10,
                          color: "var(--ant-color-text-quaternary, #bbb)",
                        },
                      },
                      "已安装",
                    )
                  : null,
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                      paddingRight: isInstalled || isSelected ? 24 : 0,
                    },
                  },
                  React.createElement(
                    "span",
                    { style: { fontSize: 16 } },
                    skill.emoji || "\u26a1",
                  ),
                  React.createElement(
                    Tooltip,
                    { title: skill.name },
                    React.createElement(
                      Text,
                      {
                        strong: true,
                        style: {
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      },
                      skill.name,
                    ),
                  ),
                ),
                skill.description
                  ? React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          color: "var(--ant-color-text-tertiary, #8c8c8c)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: "1.4",
                        },
                      },
                      skill.description,
                    )
                  : null,
                skill.tags && skill.tags.length > 0
                  ? React.createElement(
                      "div",
                      {
                        style: {
                          marginTop: 4,
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                        },
                      },
                      ...skill.tags.slice(0, 2).map((tag: string, i: number) =>
                        React.createElement(
                          Tag,
                          {
                            key: i,
                            color: "cyan",
                            style: { fontSize: 10, marginRight: 0 },
                          },
                          tag,
                        ),
                      ),
                    )
                  : null,
              );
            }),
          ),
  );
}

