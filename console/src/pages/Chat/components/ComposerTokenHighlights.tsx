import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, Sparkles, Terminal, Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AgentSummary } from "../../../api/types/agents";
import { getAgentDisplayName } from "../../../utils/agentDisplayName";
import { isCommandInput } from "../../../utils/commandPrefix";
import { setTextareaValue } from "../utils";
import {
  createComposerHighlightIndex,
  extractComposerHighlights,
  type ComposerHighlight,
} from "./composerHighlights";
import { createAgentMentionRangeFinder } from "./agentMentionUtils";
import { getAgentMentionMode, useAgentMentionModes } from "./agentMentionModes";
import styles from "./ComposerTokenHighlights.module.less";

interface ComposerTokenHighlightsProps {
  agents: AgentSummary[];
  skillNames: string[];
  commandNames: string[];
  selectedAgentId: string;
}

export const COMPOSER_VALUE_CHANGE_EVENT = "qwenpaw:composer-value-change";

function getHighlightAgentId(highlight: ComposerHighlight): string {
  const parts = highlight.key.split(":");
  return parts[parts.length - 1] ?? highlight.key;
}

export default function ComposerTokenHighlights({
  agents,
  skillNames,
  commandNames,
  selectedAgentId,
}: ComposerTokenHighlightsProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [inlineHost, setInlineHost] = useState<HTMLElement | null>(null);
  const [mirrorScroll, setMirrorScroll] = useState({ top: 0, left: 0 });
  useAgentMentionModes();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightsRef = useRef<ComposerHighlight[]>([]);
  const syncFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const getTextarea = () => {
      if (textareaRef.current?.isConnected) return textareaRef.current;
      textareaRef.current = document.querySelector(
        '[class*="sender"] textarea',
      ) as HTMLTextAreaElement | null;
      return textareaRef.current;
    };
    const sync = (target?: EventTarget | null) => {
      const textarea =
        target instanceof HTMLTextAreaElement ? target : getTextarea();
      if (!textarea || !textarea.closest('[class*="sender"]')) return;
      textareaRef.current = textarea;
      setValue(textarea.value);
    };
    const scheduleSync = (target?: EventTarget | null) => {
      if (syncFrameRef.current !== null) {
        window.cancelAnimationFrame(syncFrameRef.current);
      }
      syncFrameRef.current = window.requestAnimationFrame(() => {
        syncFrameRef.current = null;
        sync(target);
      });
    };
    const handleInput = (event: Event) => scheduleSync(event.target);
    const handleKeyDown = (event: KeyboardEvent) => {
      const textarea = event.target;
      if (!(textarea instanceof HTMLTextAreaElement)) return;
      if (!textarea.closest('[class*="sender"]')) return;

      if (event.key === "Backspace" || event.key === "Delete") {
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        const highlight = highlightsRef.current.find((item) => {
          if (item.kind === "agent") return false;
          if (selectionStart !== selectionEnd) {
            return selectionStart < item.end && selectionEnd > item.start;
          }
          if (event.key === "Delete") return selectionStart === item.start;
          return (
            selectionStart === item.end ||
            (selectionStart === item.end + 1 &&
              /\s/.test(textarea.value[item.end] ?? ""))
          );
        });
        if (highlight) {
          event.preventDefault();
          event.stopImmediatePropagation();
          let end = highlight.end;
          if (/\s/.test(textarea.value[end] ?? "")) end += 1;
          const next =
            textarea.value.slice(0, highlight.start) +
            textarea.value.slice(end);
          setTextareaValue(textarea, next);
          textarea.selectionStart = textarea.selectionEnd = highlight.start;
          return;
        }
      }

      if (
        (event.key === "Enter" || event.key === "Tab") &&
        isCommandInput(textarea.value)
      ) {
        // Sender commits a keyboard suggestion as a controlled update without
        // a native input event. Read once after that React commit.
        scheduleSync(textarea);
      }
    };
    const handleControlledChange = (event: Event) => {
      if (!(event instanceof CustomEvent) || typeof event.detail !== "string") {
        return;
      }
      if (syncFrameRef.current !== null) {
        window.cancelAnimationFrame(syncFrameRef.current);
        syncFrameRef.current = null;
      }
      setValue(event.detail);
    };
    sync();
    document.addEventListener("input", handleInput, true);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener(
      COMPOSER_VALUE_CHANGE_EVENT,
      handleControlledChange,
    );
    return () => {
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener(
        COMPOSER_VALUE_CHANGE_EVENT,
        handleControlledChange,
      );
      if (syncFrameRef.current !== null) {
        window.cancelAnimationFrame(syncFrameRef.current);
        syncFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const textarea =
      textareaRef.current ??
      (document.querySelector(
        '[class*="sender"] textarea',
      ) as HTMLTextAreaElement | null);
    if (!textarea) return;
    textareaRef.current = textarea;

    const content = textarea.closest<HTMLElement>('[class*="sender-content"]');
    if (!content) return;

    const existing = content.querySelector<HTMLElement>(
      ":scope > [data-qwenpaw-composer-token-mirror]",
    );
    const host = existing ?? document.createElement("div");
    if (!existing) {
      host.dataset.qwenpawComposerTokenMirror = "";
      host.className = styles.inlineMirrorHost;
      content.appendChild(host);
    }
    content.classList.add(styles.inlineInputContainer);

    const syncGeometry = () => {
      const textareaRect = textarea.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const computed = window.getComputedStyle(textarea);
      host.style.left = `${textareaRect.left - contentRect.left}px`;
      host.style.top = `${textareaRect.top - contentRect.top}px`;
      host.style.width = `${textareaRect.width}px`;
      host.style.height = `${textareaRect.height}px`;
      host.style.font = computed.font;
      host.style.lineHeight = computed.lineHeight;
      host.style.letterSpacing = computed.letterSpacing;
      host.style.padding = computed.padding;
      host.style.textAlign = computed.textAlign;
    };
    const syncScroll = () =>
      setMirrorScroll({ top: textarea.scrollTop, left: textarea.scrollLeft });

    syncGeometry();
    syncScroll();
    textarea.addEventListener("scroll", syncScroll, { passive: true });
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(syncGeometry);
    resizeObserver?.observe(textarea);
    setInlineHost(host);

    return () => {
      textarea.removeEventListener("scroll", syncScroll);
      resizeObserver?.disconnect();
      textarea.classList.remove(styles.inlineInput);
      content.classList.remove(styles.inlineInputContainer);
      if (!existing) host.remove();
    };
  }, []);

  const agentMentionFinder = useMemo(
    () =>
      createAgentMentionRangeFinder(agents, (agent) =>
        getAgentDisplayName(agent, t),
      ),
    [agents, t],
  );
  const highlightIndex = useMemo(
    () =>
      createComposerHighlightIndex(
        skillNames,
        commandNames,
        agentMentionFinder,
      ),
    [agentMentionFinder, commandNames, skillNames],
  );
  const highlights = useMemo(
    () =>
      extractComposerHighlights(
        value,
        agents,
        skillNames,
        commandNames,
        (agent) => getAgentDisplayName(agent, t),
        highlightIndex,
      ),
    [agents, commandNames, highlightIndex, skillNames, t, value],
  );
  highlightsRef.current = highlights;

  const remove = (highlight: ComposerHighlight) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    let end = highlight.end;
    if (/\s/.test(textarea.value[end] ?? "")) end += 1;
    const next =
      textarea.value.slice(0, highlight.start) + textarea.value.slice(end);
    setTextareaValue(textarea, next);
    textarea.selectionStart = textarea.selectionEnd = highlight.start;
    textarea.focus();
  };

  const agentHighlights = useMemo(() => {
    const seen = new Set<string>();
    return highlights.filter((highlight) => {
      if (highlight.kind !== "agent") return false;
      const agentId = getHighlightAgentId(highlight);
      if (seen.has(agentId)) return false;
      seen.add(agentId);
      return true;
    });
  }, [highlights]);
  const coordinationActive =
    agentHighlights.length > 1 ||
    (agentHighlights.length === 1 &&
      getAgentMentionMode(getHighlightAgentId(agentHighlights[0])) ===
        "collaborate");
  const selectedAgentName = useMemo(() => {
    const selected = agents.find((agent) => agent.id === selectedAgentId);
    return selected ? getAgentDisplayName(selected, t) : selectedAgentId;
  }, [agents, selectedAgentId, t]);
  const inlineHighlights = useMemo(
    () => highlights.filter((highlight) => highlight.kind !== "agent"),
    [highlights],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.classList.toggle(styles.inlineInput, inlineHighlights.length > 0);
    const prefix = inlineHighlights[0]
      ? textarea.value[inlineHighlights[0].start]
      : "";
    textarea.style.setProperty(
      "--qwenpaw-inline-token-indent",
      prefix === "/" ? "10px" : "0px",
    );
    return () => {
      textarea.classList.remove(styles.inlineInput);
      textarea.style.removeProperty("--qwenpaw-inline-token-indent");
    };
  }, [inlineHighlights]);

  const renderAgentHighlights = (items: ComposerHighlight[]) => (
    <div
      className={styles.tokenBar}
      aria-label={t("chat.highlights.activeTokens", "已使用的 Agent 和 Skill")}
    >
      {coordinationActive && (
        <span className={`${styles.token} ${styles.coordinator}`}>
          <Users size={13} aria-hidden />
          <span className={styles.label}>
            {t("chat.mention.coordinatorLabel", "{{agent}} · 协调", {
              agent: selectedAgentName,
            })}
          </span>
        </span>
      )}
      {items.map((highlight) => {
        const agentId = getHighlightAgentId(highlight);
        const mode = coordinationActive
          ? "collaborate"
          : getAgentMentionMode(agentId);
        const order = items.length > 1 ? items.indexOf(highlight) + 1 : null;
        return (
          <span
            key={highlight.key}
            className={`${styles.token} ${styles[highlight.kind]} ${
              mode === "collaborate" ? styles.collaboratingAgent : ""
            }`}
          >
            {order !== null && <span className={styles.order}>{order}</span>}
            <Bot size={13} aria-hidden />
            <span className={styles.label}>{highlight.label}</span>
            <span className={styles.modeLabel}>
              {coordinationActive || mode === "collaborate"
                ? t("chat.mention.collaborateShort", "协作")
                : t("chat.mention.delegateShort", "指派")}
            </span>
            <button
              type="button"
              className={styles.remove}
              aria-label={t("chat.highlights.removeToken", "移除 {{token}}", {
                token: highlight.label,
              })}
              onClick={() => remove(highlight)}
            >
              <X size={11} aria-hidden />
            </button>
          </span>
        );
      })}
    </div>
  );

  const renderInlineText = () => {
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    inlineHighlights.forEach((highlight) => {
      if (highlight.start > cursor) {
        nodes.push(value.slice(cursor, highlight.start));
      }
      const Icon = highlight.kind === "skill" ? Sparkles : Terminal;
      const token = value.slice(highlight.start, highlight.end);
      nodes.push(
        <span
          key={highlight.key}
          className={`${styles.inlineToken} ${
            highlight.kind === "skill"
              ? styles.inlineSkill
              : styles.inlineCommand
          }`}
        >
          <Icon className={styles.inlineIcon} size={11} aria-hidden />
          <span className={styles.inlinePrefix}>{token.slice(0, 1)}</span>
          {token.slice(1)}
        </span>,
      );
      cursor = highlight.end;
    });
    if (cursor < value.length) nodes.push(value.slice(cursor));
    return nodes;
  };

  if (highlights.length === 0) return null;

  return (
    <>
      {agentHighlights.length > 0 && renderAgentHighlights(agentHighlights)}
      {inlineHost &&
        inlineHighlights.length > 0 &&
        createPortal(
          <div
            className={styles.inlineMirror}
            style={{
              transform: `translate(${-mirrorScroll.left}px, ${-mirrorScroll.top}px)`,
            }}
            aria-hidden
          >
            {renderInlineText()}
          </div>,
          inlineHost,
        )}
    </>
  );
}
