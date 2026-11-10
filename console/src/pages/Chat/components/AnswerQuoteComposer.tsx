import {
  useEffect,
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
import { getActiveSenderTextarea } from "../utils";
import styles from "./AnswerQuoteComposer.module.less";

const SOURCE = "[data-answer-quote-source]";
const EXCLUDED =
  'button,input,textarea,select,[contenteditable="true"],[role="button"],[aria-hidden="true"]';

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
  // Exclude spans that also sweep across plugin controls or editable fields.
  if (
    Array.from(source.querySelectorAll(EXCLUDED)).some((node) =>
      range.intersectsNode(node),
    )
  )
    return null;
  const text = selection.toString().trim();
  if (!text) return null;
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
  const { message } = useAppMessage();
  const quotes = useSyncExternalStore(subscribeAnswerQuotes, () =>
    readAnswerQuotes(scope),
  );
  const [selection, setSelection] = useState<null | {
    messageId: string;
    text: string;
    x: number;
    y: number;
  }>(null);
  useEffect(() => {
    setSelection(null);
    if (!enabled) return;
    const update = () => {
      const root = rootRef.current;
      const selected = root && getAnswerSelection(root, window.getSelection());
      if (!selected) {
        setSelection(null);
        return;
      }
      const rect = selected.range.getBoundingClientRect();
      setSelection({
        ...selected,
        x: Math.max(8, Math.min(rect.left, window.innerWidth - 100)),
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
                  <span>{quote.text}</span>
                </button>
              </Popover>
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
      {selection &&
        createPortal(
          <button
            type="button"
            className={styles.selection}
            style={{ left: selection.x, top: selection.y }}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              if (!addAnswerQuote(scope, selection)) {
                message.warning(t("chat.answerQuote.limit"));
                return;
              }
              setSelection(null);
              window.getSelection()?.removeAllRanges();
              getActiveSenderTextarea()?.focus();
            }}
          >
            <Quote size={14} />
            {t("chat.answerQuote.action")}
          </button>,
          document.body,
        )}
    </>
  );
}
