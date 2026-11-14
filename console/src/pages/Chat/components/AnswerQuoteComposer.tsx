import {
  useEffect,
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Popover } from "antd";
import { Quote, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppMessage } from "../../../hooks/useAppMessage";
import {
  addAnswerQuote,
  consumeAnswerQuotes,
  readAnswerQuotes,
  subscribeAnswerQuotes,
} from "../answerQuotes";
import {
  openQuoteSource,
  useWorkspaceQuotes,
} from "../../../features/files-workspace/workspaceQuotes";
import { getActiveSenderTextarea } from "../utils";
import styles from "./AnswerQuoteComposer.module.less";

const SOURCE = "[data-answer-quote-source]";
const EXCLUDED =
  'button,input,textarea,select,iframe,header,[contenteditable]:not([contenteditable="false"]),[role="button"],[aria-hidden="true"]';
const CODE_TOOLBAR = 'header[data-answer-quote-ignore="true"]';

export function getAnswerSelection(
  root: HTMLElement,
  selection: Selection | null,
) {
  if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
  const element = (node: Node | null) =>
    node instanceof Element ? node : node?.parentElement;
  const start = element(selection.anchorNode),
    end = element(selection.focusNode);
  const source = start?.closest<HTMLElement>(SOURCE);
  if (
    !source ||
    !root.contains(source) ||
    source !== end?.closest(SOURCE) ||
    start?.closest(EXCLUDED) ||
    end?.closest(EXCLUDED)
  )
    return null;
  const range = selection.getRangeAt(0);
  // Host code toolbars use user-select:none. Other interactive content
  // inside a selected range continues to invalidate the selection.
  if (
    Array.from(source.querySelectorAll(EXCLUDED)).some(
      (node) => range.intersectsNode(node) && !node.closest(CODE_TOOLBAR),
    )
  )
    return null;
  const text = selection.toString().replace(/\r\n?/g, "\n");
  if (!text.trim()) return null;
  return { messageId: source.dataset.answerQuoteSource || "", text, range };
}

export function AnswerQuoteComposer({
  scope,
  rootRef,
  enabled,
}: {
  scope: string;
  rootRef: RefObject<HTMLDivElement>;
  enabled: boolean;
}) {
  const { t } = useTranslation();
  const workspace = useWorkspaceQuotes();
  const { message } = useAppMessage();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const quotes = useSyncExternalStore(subscribeAnswerQuotes, () =>
    readAnswerQuotes(scope),
  );
  const [selection, setSelection] = useState<null | {
    messageId: string;
    text: string;
    x: number;
    y: number;
    scope: string;
  }>(null);
  const current = enabled && selection?.scope === scope ? selection : null;
  const quoteSelection = useCallback(() => {
    if (!current) return;
    if (!addAnswerQuote(scope, current)) {
      message.warning(t("chat.answerQuote.limit"));
      return;
    }
    setSelection(null);
    window.getSelection()?.removeAllRanges();
    getActiveSenderTextarea()?.focus();
  }, [current, message, scope, t]);
  useEffect(() => {
    if (!current) return;
    const keydown = (event: KeyboardEvent) => {
      if (
        !event.isComposing &&
        event.altKey &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        (event.code === "KeyQ" || event.key.toLowerCase() === "q")
      ) {
        event.preventDefault();
        quoteSelection();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [current, quoteSelection]);
  useEffect(() => {
    setSelection(null);
    if (!enabled) return;
    const update = () => {
      if (document.activeElement === buttonRef.current) return;
      const root = rootRef.current;
      const selected = root && getAnswerSelection(root, window.getSelection());
      if (!selected) {
        setSelection(null);
        return;
      }
      const rect = selected.range.getBoundingClientRect();
      setSelection({
        ...selected,
        scope,
        x: Math.max(8, Math.min(rect.left, window.innerWidth - 210)),
        y: Math.max(
          8,
          rect.top > 46
            ? rect.top - 42
            : Math.min(rect.bottom + 6, window.innerHeight - 48),
        ),
      });
    };
    const dismiss = () => setSelection(null);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("selectionchange", update);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("selectionchange", update);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [enabled, rootRef, scope]);
  if (!enabled) return null;
  return (
    <>
      {quotes.length > 0 && (
        <div
          className={styles.bar}
          data-answer-quotes
          aria-label={t("chat.answerQuote.selected")}
        >
          {quotes.map((quote) => (
            <div key={quote.id} className={styles.chip}>
              <Popover
                trigger="click"
                content={<div className={styles.preview}>{quote.text}</div>}
              >
                <button
                  type="button"
                  className={styles.label}
                  aria-label={t("chat.answerQuote.view", { text: quote.text })}
                >
                  <Quote size={13} />
                  <span>
                    {quote.source?.kind === "file"
                      ? quote.messageId
                      : quote.text}
                  </span>
                </button>
              </Popover>
              {quote.source && (
                <button
                  type="button"
                  aria-label={t("workbench.quotes.locate", {
                    name: quote.messageId,
                  })}
                  onClick={() =>
                    openQuoteSource(quote.source!, workspace?.scope)
                  }
                >
                  <Quote size={13} />
                  {t("workbench.quotes.source")}
                </button>
              )}
              <button
                type="button"
                aria-label={t("chat.answerQuote.remove", { text: quote.text })}
                onClick={() => consumeAnswerQuotes(scope, [quote])}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      {current &&
        createPortal(
          <button
            ref={buttonRef}
            type="button"
            className={styles.selection}
            aria-keyshortcuts="Alt+Shift+Q"
            style={{ left: current.x, top: current.y }}
            onPointerDown={(event) => event.preventDefault()}
            onClick={quoteSelection}
          >
            <Quote size={14} />
            {t("chat.answerQuote.action")}
          </button>,
          document.body,
        )}
    </>
  );
}
