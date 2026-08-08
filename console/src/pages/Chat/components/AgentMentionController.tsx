import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AgentSummary } from "../../../api/types/agents";
import { getAgentDisplayName } from "../../../utils/agentDisplayName";
import AgentMentionPopup from "./AgentMentionPopup";
import { useAgentMention } from "./useAgentMention";
import {
  clearAgentMentionModes,
  syncAgentMentionModes,
  useAgentMentionModes,
} from "./agentMentionModes";
import { getSenderTextareaFromTarget } from "../utils";

interface AgentMentionControllerProps {
  active: boolean;
  theme: "light" | "dark";
  agents: AgentSummary[];
  selectedAgent: string;
}

/** Keeps rapidly-changing mention navigation state out of the large ChatPage. */
export default function AgentMentionController({
  active,
  theme,
  agents,
  selectedAgent,
}: AgentMentionControllerProps) {
  const { t } = useTranslation();
  const mentionModes = useAgentMentionModes();
  const selectedMentionAgentIds = useMemo(
    () => Object.keys(mentionModes),
    [mentionModes],
  );
  const mention = useAgentMention(
    agents,
    selectedAgent,
    selectedMentionAgentIds,
  );
  const { handleInputChange, handleKeyDown, reset } = mention;

  useEffect(() => {
    if (!active) return;

    const getTextarea = (): HTMLTextAreaElement | null => {
      // When RichFileReferenceInput (Lexical editor) is active, the visible
      // input is a ContentEditable, not a <textarea>.  The hidden textarea
      // synced by the rich editor is still inside the sender container, so
      // the selector finds it for both plain-textarea and rich-editor modes.
      const focused =
        document.activeElement instanceof HTMLElement
          ? document.activeElement.closest('[class*="sender"]')
          : null;
      const focusedTextarea = focused?.querySelector("textarea");
      if (focusedTextarea instanceof HTMLTextAreaElement) return focusedTextarea;
      return document.querySelector('[class*="sender"] textarea');
    };

    const onKeyDown = (event: KeyboardEvent) => {
      // Resolve the sender's hidden textarea from either a plain <textarea> or
      // a Lexical ContentEditable event target.
      const textarea = getSenderTextareaFromTarget(event.target);
      if (!textarea) return;
      handleKeyDown(event, textarea);
    };

    const onInput = (event: Event) => {
      // The rich editor dispatches a synthetic input event on the hidden
      // textarea via setTextareaValue().  That event has the textarea as
      // target.  The native ContentEditable input event (target = div) is
      // also handled by getSenderTextareaFromTarget.
      const textarea = getSenderTextareaFromTarget(event.target);
      if (!textarea) return;
      handleInputChange(textarea);
      syncAgentMentionModes(textarea.value, agents, (agent) =>
        getAgentDisplayName(agent, t),
      );
    };

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const popup = document.querySelector("[data-agent-mention-popup]");
      const textarea = getTextarea();
      if (
        popup &&
        !popup.contains(target) &&
        (!textarea || !textarea.contains(target))
      ) {
        reset(textarea);
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("mousedown", onClickOutside, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("mousedown", onClickOutside, true);
      const textarea = getTextarea();
      if (textarea) delete textarea.dataset.agentMentionActive;
    };
  }, [active, agents, handleInputChange, handleKeyDown, reset, t]);

  useEffect(() => {
    clearAgentMentionModes();
  }, [selectedAgent]);

  useEffect(() => {
    const textarea = document.querySelector(
      '[class*="sender"] textarea',
    ) as HTMLTextAreaElement | null;
    if (textarea) {
      syncAgentMentionModes(textarea.value, agents, (agent) =>
        getAgentDisplayName(agent, t),
      );
    }
  }, [agents, selectedAgent, t]);

  if (!mention.mentionState.visible) return null;

  return (
    <div
      data-agent-mention-popup
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: 480,
          margin: "0 auto",
          pointerEvents: "auto",
        }}
      >
        <AgentMentionPopup
          visible
          agents={mention.filteredAgents}
          activeIndex={mention.activeIndex}
          theme={theme}
          mode={mention.selectionMode}
          collaborationLocked={mention.collaborationLocked}
          selectedCount={selectedMentionAgentIds.length}
          onModeChange={mention.setSelectionMode}
          onSelect={(agent) => {
            const textarea = document.querySelector(
              '[class*="sender"] textarea',
            ) as HTMLTextAreaElement | null;
            if (textarea) mention.insertMention(agent, textarea);
          }}
        />
      </div>
    </div>
  );
}
