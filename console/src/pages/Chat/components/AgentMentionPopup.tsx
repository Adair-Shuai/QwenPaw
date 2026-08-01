/**
 * AgentMentionPopup — @ 提及 Agent 选择弹窗
 *
 * 当用户在聊天框输入 "@" 时弹出 Agent 列表，
 * 选中后在文本中插入 @AgentName 标记。
 *
 * 提交时 customFetch 会解析 @AgentName 并将 target_agent_id
 * 加入请求体，实现消息转发到指定 Agent。
 */
import React, { useEffect, useMemo, useRef } from "react";
import { getAgentDisplayName } from "../../../utils/agentDisplayName";
import { useTranslation } from "react-i18next";
import { Bot } from "lucide-react";
import { AgentStatusIndicator } from "../../../components/AgentStatusIndicator";
import type { AgentSummary } from "../../../api/types/agents";

export interface AgentMentionState {
  /** 弹窗是否可见 */
  visible: boolean;
  /** 搜索关键词（@ 后输入的文本） */
  query: string;
  /** @ 符号在文本中的起始位置 */
  startIndex: number;
  /** 选中的 Agent */
  selectedAgent: AgentSummary | null;
}

interface AgentMentionPopupProps {
  visible: boolean;
  query: string;
  agents: AgentSummary[];
  activeIndex: number;
  onSelect: (agent: AgentSummary) => void;
  onDismiss: () => void;
  theme: "light" | "dark";
}

const AgentMentionPopup: React.FC<AgentMentionPopupProps> = ({
  visible,
  query,
  agents,
  activeIndex,
  onSelect,
  onDismiss,
  theme,
}) => {
  const { t } = useTranslation();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isDark = theme === "dark";

  const filtered = useMemo(() => {
    if (!query) return agents;
    const q = query.toLowerCase();
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q),
    );
  }, [agents, query]);

  useEffect(() => {
    if (visible && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeIndex, visible]);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, onDismiss]);

  if (!visible || filtered.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "100%",
        left: 0,
        marginBottom: 4,
        zIndex: 10000,
        minWidth: 240,
        maxWidth: 360,
        maxHeight: 280,
        overflowY: "auto",
        background: isDark ? "#1f1f1f" : "#fff",
        border: `1px solid ${isDark ? "#3a3a3a" : "#e8e8e8"}`,
        borderRadius: 8,
        boxShadow:
          "0 6px 16px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.04)",
        padding: 4,
      }}
    >
      <div
        style={{
          padding: "4px 8px",
          fontSize: 11,
          color: "#999",
          borderBottom: `1px solid ${isDark ? "#333" : "#f0f0f0"}`,
          marginBottom: 2,
        }}
      >
        {t("chat.mention.selectAgent", "选择要指派的 Agent")}
      </div>
      {filtered.map((agent, index) => {
        const isActive = index === activeIndex;
        const displayName = getAgentDisplayName(agent, t);
        return (
          <div
            key={agent.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            onClick={() => onSelect(agent)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer",
              transition: "background 0.1s",
              background: isActive
                ? isDark
                  ? "#2a2a2a"
                  : "#f0f5ff"
                : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = isDark
                  ? "#252525"
                  : "#f5f5f5";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <AgentStatusIndicator
              status={agent.startup_status}
              enabled={agent.enabled}
            />
            <Bot size={14} strokeWidth={2} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: isDark ? "#e0e0e0" : "#333",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </div>
              {agent.description && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#999",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {agent.description}
                </div>
              )}
            </div>
            <span
              style={{
                fontSize: 10,
                color: "#aaa",
                fontFamily: "monospace",
                flexShrink: 0,
              }}
            >
              {agent.id}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AgentMentionPopup;
