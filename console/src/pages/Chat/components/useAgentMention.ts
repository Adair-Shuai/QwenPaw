/**
 * useAgentMention — @ 提及 Agent 的输入检测和状态管理
 *
 * 检测用户在聊天框中输入 "@" 触发 Agent 选择弹窗，
 * 支持键盘上下导航和 Enter 选中。
 *
 * 调用方式：
 *   const { mentionState, filteredAgents, activeIndex, handleKeyDown,
 *           handleInputChange, reset, insertMention } = useAgentMention();
 *
 *   // 在 textarea 的 onKeyDown 中调用 handleKeyDown
 *   // 在 textarea 的 onInput / onChange 中调用 handleInputChange
 *   // 弹窗渲染时使用 filteredAgents 和 activeIndex
 */
import { useCallback, useMemo, useState } from "react";
import { useAgentStore } from "../../../stores/agentStore";
import type { AgentSummary } from "../../../api/types/agents";
import { getAgentDisplayName } from "../../../utils/agentDisplayName";
import { useTranslation } from "react-i18next";

export interface AgentMentionState {
  visible: boolean;
  query: string;
  startIndex: number;
}

export interface UseAgentMentionResult {
  mentionState: AgentMentionState;
  filteredAgents: AgentSummary[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  handleKeyDown: (e: KeyboardEvent, textarea: HTMLTextAreaElement) => boolean;
  handleInputChange: (textarea: HTMLTextAreaElement) => void;
  insertMention: (agent: AgentSummary, textarea: HTMLTextAreaElement) => void;
  reset: () => void;
}

const IDLE_STATE: AgentMentionState = {
  visible: false,
  query: "",
  startIndex: -1,
};

export function useAgentMention(): UseAgentMentionResult {
  const { t } = useTranslation();
  const { agents, selectedAgent } = useAgentStore();
  const [mentionState, setMentionState] =
    useState<AgentMentionState>(IDLE_STATE);
  const [activeIndex, setActiveIndex] = useState(0);

  const enabledAgents = useMemo(
    () => agents.filter((a) => a.enabled && a.id !== selectedAgent),
    [agents, selectedAgent],
  );

  const filteredAgents = useMemo(() => {
    if (!mentionState.visible || !mentionState.query) return enabledAgents;
    const q = mentionState.query.toLowerCase();
    return enabledAgents.filter(
      (a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q),
    );
  }, [enabledAgents, mentionState]);

  /**
   * 检测 textarea 中光标位置前是否有未完成的 @ 触发
   * 返回 null 表示不在提及模式，否则返回 { startIndex, query }
   */
  const detectMention = useCallback(
    (
      textarea: HTMLTextAreaElement,
    ): { startIndex: number; query: string } | null => {
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPos);

      // 从光标位置向前查找最近的 @
      // @ 必须在行首或前面是空白字符
      let atIdx = -1;
      for (let i = textBeforeCursor.length - 1; i >= 0; i--) {
        const ch = textBeforeCursor[i];
        if (ch === "@") {
          // @ 前面必须是行首或空白字符
          if (i === 0 || /\s/.test(textBeforeCursor[i - 1])) {
            atIdx = i;
          }
          break;
        }
        // 遇到空白字符后停止回溯（@ 后不能有空格）
        if (/\s/.test(ch) && atIdx === -1) {
          // 继续往前找，可能 @ 在更前面
          continue;
        }
      }

      if (atIdx === -1) return null;

      // 提取 @ 后面的文本作为搜索词
      const query = textBeforeCursor.substring(atIdx + 1);
      // 如果 @ 后面有空格，说明已经完成输入
      if (/\s/.test(query)) return null;

      return { startIndex: atIdx, query };
    },
    [],
  );

  const handleInputChange = useCallback(
    (textarea: HTMLTextAreaElement) => {
      const detected = detectMention(textarea);
      if (detected) {
        setMentionState({
          visible: true,
          query: detected.query,
          startIndex: detected.startIndex,
        });
        setActiveIndex(0);
      } else if (mentionState.visible) {
        setMentionState(IDLE_STATE);
      }
    },
    [detectMention, mentionState.visible],
  );

  const insertMention = useCallback(
    (agent: AgentSummary, textarea: HTMLTextAreaElement) => {
      const displayName = getAgentDisplayName(agent, t);
      // 构造插入文本: @AgentName (带空格结尾)
      const insertText = `@${displayName} `;
      const before = textarea.value.substring(0, mentionState.startIndex);
      const after = textarea.value.substring(textarea.selectionStart);
      const newValue = before + insertText + after;

      // 使用原生 setter 更新值
      const nativeValueSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      if (nativeValueSetter) {
        nativeValueSetter.call(textarea, newValue);
      } else {
        textarea.value = newValue;
      }

      // 光标移到插入文本之后
      const newCursorPos = before.length + insertText.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;

      // 触发 input 事件以同步 React 状态
      const event = new Event("input", { bubbles: true });
      textarea.dispatchEvent(event);

      setMentionState(IDLE_STATE);
      textarea.focus();
    },
    [mentionState.startIndex, t],
  );

  const reset = useCallback(() => {
    setMentionState(IDLE_STATE);
    setActiveIndex(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, textarea: HTMLTextAreaElement): boolean => {
      if (!mentionState.visible || filteredAgents.length === 0) return false;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev + 1 >= filteredAgents.length ? 0 : prev + 1,
        );
        return true;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev - 1 < 0 ? filteredAgents.length - 1 : prev - 1,
        );
        return true;
      }

      if (e.key === "Enter" || e.key === "Tab") {
        const agent = filteredAgents[activeIndex];
        if (agent) {
          e.preventDefault();
          e.stopPropagation();
          insertMention(agent, textarea);
          return true;
        }
      }

      if (e.key === "Escape") {
        e.preventDefault();
        reset();
        return true;
      }

      return false;
    },
    [mentionState.visible, filteredAgents, activeIndex, insertMention, reset],
  );

  return {
    mentionState,
    filteredAgents,
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    handleInputChange,
    insertMention,
    reset,
  };
}
