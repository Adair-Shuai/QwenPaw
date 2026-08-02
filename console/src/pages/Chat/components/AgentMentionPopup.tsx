import React, { memo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Bot, Users } from "lucide-react";
import type { AgentSummary } from "../../../api/types/agents";
import { AgentStatusIndicator } from "../../../components/AgentStatusIndicator";
import { getAgentDisplayName } from "../../../utils/agentDisplayName";
import type { AgentMentionMode } from "./agentMentionModes";

interface AgentMentionPopupProps {
  visible: boolean;
  agents: AgentSummary[];
  activeIndex: number;
  onSelect: (agent: AgentSummary) => void;
  mode: AgentMentionMode;
  collaborationLocked: boolean;
  selectedCount: number;
  onModeChange: (mode: AgentMentionMode) => void;
  theme: "light" | "dark";
}

const AgentMentionPopup: React.FC<AgentMentionPopupProps> = ({
  visible,
  agents,
  activeIndex,
  onSelect,
  mode,
  collaborationLocked,
  selectedCount,
  onModeChange,
  theme,
}) => {
  const { t } = useTranslation();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isDark = theme === "dark";

  useEffect(() => {
    if (visible && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" });
    }
  }, [activeIndex, visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "100%",
        left: 0,
        zIndex: 10000,
        minWidth: 320,
        maxWidth: 440,
        maxHeight: 320,
        marginBottom: 4,
        overflowY: "auto",
        padding: 4,
        background: isDark ? "#1f1f1f" : "#fff",
        border: `1px solid ${isDark ? "#3a3a3a" : "#e8e8e8"}`,
        borderRadius: 10,
        boxShadow: "0 10px 28px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "6px 8px 9px",
          marginBottom: 3,
          borderBottom: `1px solid ${isDark ? "#333" : "#f0f0f0"}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            {selectedCount > 0
              ? t("chat.mention.selectedCount", "已选择 {{count}} 位 Agent", {
                  count: selectedCount,
                })
              : t("chat.mention.selectAgent", "选择要指派的 Agent")}
          </div>
          <div style={{ marginTop: 2, fontSize: 10, color: "#999" }}>
            {collaborationLocked
              ? t(
                  "chat.mention.multiAgentHint",
                  "继续添加将由当前 Agent 统一协调",
                )
              : mode === "delegate"
              ? t("chat.mention.delegateHint", "目标 Agent 独立处理")
              : t(
                  "chat.mention.collaborateHint",
                  "当前 Agent 与目标 Agent 协作",
                )}
          </div>
        </div>
        <div
          style={{
            display: "inline-flex",
            flexShrink: 0,
            padding: 2,
            borderRadius: 8,
            background: isDark ? "#141414" : "#f3f4f6",
          }}
        >
          {(["delegate", "collaborate"] as AgentMentionMode[]).map((option) => {
            const selected = mode === option;
            const disabled = collaborationLocked && option === "delegate";
            const Icon = option === "collaborate" ? Users : Bot;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onModeChange(option)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 7px",
                  border: 0,
                  borderRadius: 6,
                  color: disabled
                    ? "#888"
                    : selected
                    ? isDark
                      ? option === "collaborate"
                        ? "#d3adf7"
                        : "#91caff"
                      : option === "collaborate"
                      ? "#531dab"
                      : "#0958d9"
                    : "#777",
                  background: selected
                    ? isDark
                      ? "#303030"
                      : "#fff"
                    : "transparent",
                  boxShadow: selected ? "0 1px 3px rgba(0,0,0,.12)" : "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontSize: 11,
                }}
              >
                <Icon size={11} aria-hidden />
                {option === "delegate"
                  ? t("chat.mention.delegate", "直接指派")
                  : t("chat.mention.collaborate", "共同协作")}
              </button>
            );
          })}
        </div>
      </div>

      {agents.length === 0 && (
        <div style={{ padding: "12px 10px", color: "#999", fontSize: 12 }}>
          {t("chat.mention.noMoreAgents", "没有其他可添加的 Agent")}
        </div>
      )}

      {agents.map((agent, index) => {
        const isActive = index === activeIndex;
        const displayName = getAgentDisplayName(agent, t);
        return (
          <button
            type="button"
            key={agent.id}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            onClick={() => onSelect(agent)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "7px 9px",
              border: 0,
              borderRadius: 7,
              color: "inherit",
              textAlign: "left",
              cursor: "pointer",
              transition: "background 0.1s",
              background: isActive
                ? isDark
                  ? "#2a2a2a"
                  : mode === "collaborate"
                  ? "#f9f0ff"
                  : "#f0f5ff"
                : "transparent",
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
                  overflow: "hidden",
                  color: isActive
                    ? isDark
                      ? mode === "collaborate"
                        ? "#d3adf7"
                        : "#69b1ff"
                      : mode === "collaborate"
                      ? "#531dab"
                      : "#0958d9"
                    : isDark
                    ? "#e0e0e0"
                    : "#333",
                  fontSize: 13,
                  fontWeight: 500,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </div>
              {agent.description && (
                <div
                  style={{
                    overflow: "hidden",
                    color: "#999",
                    fontSize: 11,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {agent.description}
                </div>
              )}
            </div>
            <span style={{ flexShrink: 0, color: "#aaa", fontSize: 10 }}>
              {collaborationLocked || mode === "collaborate"
                ? t("chat.mention.addToCollaboration", "加入协作")
                : t("chat.mention.assign", "指派")}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default memo(AgentMentionPopup);
