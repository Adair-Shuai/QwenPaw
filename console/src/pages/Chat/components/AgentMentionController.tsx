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

    const getTextarea = (): HTMLTextAreaElement | null =>
      document.querySelector('[class*="sender"] textarea');

    const onKeyDown = (event: KeyboardEvent) => {
      const textarea = getTextarea();
      if (!textarea || event.target !== textarea) return;
      handleKeyDown(event, textarea);
    };

    const onInput = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLTextAreaElement)) return;
      if (!target.closest('[class*="sender"]')) return;
      handleInputChange(target);
      syncAgentMentionModes(target.value, agents, (agent) =>
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
