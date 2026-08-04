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
import { useCallback, useMemo, useRef, useState } from "react";
import type { AgentSummary } from "../../../api/types/agents";
import { getAgentDisplayName } from "../../../utils/agentDisplayName";
import { useTranslation } from "react-i18next";
import {
  setAgentMentionMode,
  type AgentMentionMode,
} from "./agentMentionModes";
import { findAgentMentionRanges } from "./agentMentionUtils";

export interface AgentMentionState {
  visible: boolean;
  query: string;
  startIndex: number;
}

export interface UseAgentMentionResult {
  mentionState: AgentMentionState;
  filteredAgents: AgentSummary[];
  activeIndex: number;
  selectionMode: AgentMentionMode;
  collaborationLocked: boolean;
  setActiveIndex: (index: number) => void;
  setSelectionMode: (mode: AgentMentionMode) => void;
  handleKeyDown: (e: KeyboardEvent, textarea: HTMLTextAreaElement) => boolean;
  handleInputChange: (textarea: HTMLTextAreaElement) => void;
  insertMention: (agent: AgentSummary, textarea: HTMLTextAreaElement) => void;
  reset: (textarea?: HTMLTextAreaElement | null) => void;
}

const IDLE_STATE: AgentMentionState = {
  visible: false,
  query: "",
  startIndex: -1,
};
const EMPTY_SELECTED_AGENT_IDS: readonly string[] = [];

export function useAgentMention(
  agents: AgentSummary[],
  selectedAgent: string,
  selectedMentionAgentIds: readonly string[] = EMPTY_SELECTED_AGENT_IDS,
): UseAgentMentionResult {
  const { t } = useTranslation();
  const [mentionState, setMentionState] =
    useState<AgentMentionState>(IDLE_STATE);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectionMode, setSelectionMode] =
    useState<AgentMentionMode>("delegate");
  const mentionStateRef = useRef(mentionState);
  const activeIndexRef = useRef(activeIndex);

  mentionStateRef.current = mentionState;
  activeIndexRef.current = activeIndex;

  const mentionableAgents = useMemo(
    () => agents.filter((agent) => agent.enabled && agent.id !== selectedAgent),
    [agents, selectedAgent],
  );
  const enabledAgents = useMemo(() => {
    const alreadyMentioned = new Set(selectedMentionAgentIds);
    return mentionableAgents.filter((agent) => !alreadyMentioned.has(agent.id));
  }, [mentionableAgents, selectedMentionAgentIds]);
  const collaborationLocked = selectedMentionAgentIds.length >= 1;

  const filterAgents = useCallback(
    (query: string) => {
      if (!query) return enabledAgents;
      const q = query.toLowerCase();
      return enabledAgents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(q) ||
          agent.id.toLowerCase().includes(q),
      );
    },
    [enabledAgents],
  );

  const filteredAgents = useMemo(() => {
    if (!mentionState.visible) return enabledAgents;
    return filterAgents(mentionState.query);
  }, [enabledAgents, filterAgents, mentionState.query, mentionState.visible]);
  const filteredAgentsRef = useRef(filteredAgents);
  filteredAgentsRef.current = filteredAgents;

  const updateActiveIndex = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  /**
   * 检测 textarea 中光标位置前是否有未完成的 @ 触发
   * 返回 null 表示不在提及模式，否则返回 { startIndex, query }
   */
  const detectMention = useCallback(
    (
      textarea: HTMLTextAreaElement,
    ): { startIndex: number; query: string } | null => {
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = textarea.value.slice(0, cursorPos);

      // 中文里常直接写“然后@专家”，因此允许 @ 紧跟 CJK 文本；但排除
      // ASCII 单词/邮箱内部的 @，避免输入邮箱地址时误触发候选框。
      const tokenStart = textBeforeCursor.lastIndexOf("@");
      if (tokenStart < 0) return null;
      if (
        tokenStart > 0 &&
        /[A-Za-z0-9._%+-]/.test(textBeforeCursor[tokenStart - 1])
      ) {
        return null;
      }
      const query = textBeforeCursor.slice(tokenStart + 1);
      if (query && /[@\s,，。；;：:！？!?、()（）[\]【】{}“”"']/.test(query)) {
        return null;
      }

      return {
        startIndex: tokenStart,
        query,
      };
    },
    [],
  );

  const handleInputChange = useCallback(
    (textarea: HTMLTextAreaElement) => {
      const detected = detectMention(textarea);
      if (detected) {
        if (!mentionStateRef.current.visible) {
          const completedMentions = findAgentMentionRanges(
            textarea.value,
            mentionableAgents,
            (agent) => getAgentDisplayName(agent, t),
          ).filter((range) => range.start !== detected.startIndex);
          setSelectionMode(
            completedMentions.length > 0 ? "collaborate" : "delegate",
          );
        }
        const nextState = {
          visible: true,
          query: detected.query,
          startIndex: detected.startIndex,
        };
        mentionStateRef.current = nextState;
        filteredAgentsRef.current = filterAgents(detected.query);
        setMentionState(nextState);
        updateActiveIndex(0);
        textarea.dataset.agentMentionActive = "true";
      } else if (mentionStateRef.current.visible) {
        mentionStateRef.current = IDLE_STATE;
        setMentionState(IDLE_STATE);
        delete textarea.dataset.agentMentionActive;
      }
    },
    [
      detectMention,
      filterAgents,
      mentionableAgents,
      t,
      updateActiveIndex,
    ],
  );

  const insertMention = useCallback(
    (agent: AgentSummary, textarea: HTMLTextAreaElement) => {
      const displayName = getAgentDisplayName(agent, t);
      // 构造插入文本: @AgentName (带空格结尾)
      const insertText = `@${displayName} `;
      const before = textarea.value.substring(
        0,
        mentionStateRef.current.startIndex,
      );
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
      const existingMentionCount = findAgentMentionRanges(
        before + after,
        mentionableAgents,
        (candidate) => getAgentDisplayName(candidate, t),
      ).length;
      setAgentMentionMode(
        agent.id,
        existingMentionCount > 0 ? "collaborate" : selectionMode,
      );
      const event = new Event("input", { bubbles: true });
      textarea.dispatchEvent(event);

      mentionStateRef.current = IDLE_STATE;
      setMentionState(IDLE_STATE);
      delete textarea.dataset.agentMentionActive;
      textarea.focus();
    },
    [mentionableAgents, selectionMode, t],
  );

  const reset = useCallback(
    (textarea?: HTMLTextAreaElement | null) => {
      mentionStateRef.current = IDLE_STATE;
      setMentionState(IDLE_STATE);
      updateActiveIndex(0);
      if (textarea) delete textarea.dataset.agentMentionActive;
    },
    [updateActiveIndex],
  );

  const deleteMentionBeforeCursor = useCallback(
    (e: KeyboardEvent, textarea: HTMLTextAreaElement): boolean => {
      if (
        e.key !== "Backspace" ||
        textarea.selectionStart !== textarea.selectionEnd
      ) {
        return false;
      }

      const cursor = textarea.selectionStart;
      const beforeCursor = textarea.value.slice(0, cursor);
      const candidates = mentionableAgents
        .map((agent) => `@${getAgentDisplayName(agent, t)}`)
        .sort((a, b) => b.length - a.length);
      const mention = candidates.find((candidate) => {
        const withoutTrailingSpace = beforeCursor.endsWith(candidate);
        const withTrailingSpace = beforeCursor.endsWith(`${candidate} `);
        if (!withoutTrailingSpace && !withTrailingSpace) return false;
        const start = cursor - candidate.length - (withTrailingSpace ? 1 : 0);
        return (
          start === 0 || !/[A-Za-z0-9._%+-]/.test(textarea.value[start - 1])
        );
      });
      if (!mention) return false;

      const hasTrailingSpace = beforeCursor.endsWith(`${mention} `);
      const start = cursor - mention.length - (hasTrailingSpace ? 1 : 0);
      const nextValue =
        textarea.value.slice(0, start) + textarea.value.slice(cursor);
      e.preventDefault();
      e.stopImmediatePropagation();

      const nativeValueSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      nativeValueSetter?.call(textarea, nextValue);
      if (!nativeValueSetter) textarea.value = nextValue;
      textarea.selectionStart = textarea.selectionEnd = start;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      reset(textarea);
      return true;
    },
    [mentionableAgents, reset, t],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, textarea: HTMLTextAreaElement): boolean => {
      if (deleteMentionBeforeCursor(e, textarea)) return true;
      if (!mentionStateRef.current.visible) return false;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        reset(textarea);
        return true;
      }

      if (filteredAgentsRef.current.length === 0) {
        return false;
      }

      const currentAgents = filteredAgentsRef.current;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopImmediatePropagation();
        updateActiveIndex(
          activeIndexRef.current + 1 >= currentAgents.length
            ? 0
            : activeIndexRef.current + 1,
        );
        return true;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopImmediatePropagation();
        updateActiveIndex(
          activeIndexRef.current - 1 < 0
            ? currentAgents.length - 1
            : activeIndexRef.current - 1,
        );
        return true;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (!collaborationLocked) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setSelectionMode((current) =>
            current === "delegate" ? "collaborate" : "delegate",
          );
          return true;
        }
      }

      if (e.key === "Enter" || e.key === "Tab") {
        const agent = currentAgents[activeIndexRef.current];
        if (agent) {
          e.preventDefault();
          e.stopImmediatePropagation();
          insertMention(agent, textarea);
          return true;
        }
      }

      return false;
    },
    [
      collaborationLocked,
      deleteMentionBeforeCursor,
      insertMention,
      reset,
      updateActiveIndex,
    ],
  );

  return {
    mentionState,
    filteredAgents,
    activeIndex,
    selectionMode: collaborationLocked ? "collaborate" : selectionMode,
    collaborationLocked,
    setActiveIndex: updateActiveIndex,
    setSelectionMode,
    handleKeyDown,
    handleInputChange,
    insertMention,
    reset,
  };
}
