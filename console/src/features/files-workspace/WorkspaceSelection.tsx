import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useWorkspaceQuotes } from "./workspaceQuotes";
import type { FileTarget } from "./types";
import styles from "../../pages/Chat/components/AnswerQuoteComposer.module.less";

export default function WorkspaceSelection({
  target,
  content,
  active,
  children,
}: {
  target?: FileTarget;
  content: string;
  active: boolean;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const quotes = useWorkspaceQuotes();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<{
    text: string;
    line?: number;
    endLine?: number;
    x: number;
    y: number;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setSelected(null);
    if (!active || !target || !quotes) return;
    const update = () => {
      const selection = window.getSelection();
      if (
        !selection ||
        selection.isCollapsed ||
        !selection.rangeCount ||
        !root.current?.contains(selection.anchorNode) ||
        !root.current.contains(selection.focusNode)
      ) {
        setSelected(null);
        return;
      }
      const range = selection.getRangeAt(0);
      if (
        Array.from(
          root.current.querySelectorAll(
            'button,input,textarea,[contenteditable="true"]',
          ),
        ).some((node) => range.intersectsNode(node))
      ) {
        setSelected(null);
        return;
      }
      const sourceElement = (node: Node) =>
        (node instanceof Element
          ? node
          : node.parentElement
        )?.closest<HTMLElement>("[data-source-start]");
      const startSource = sourceElement(range.startContainer);
      const endSource = sourceElement(range.endContainer);
      const line = Number(startSource?.dataset.sourceStart) || undefined;
      const endLine = Number(endSource?.dataset.sourceEnd) || line;
      const text = selection.toString().trim();
      const rect = range.getBoundingClientRect();
      setSelected(
        text
          ? {
              text,
              line,
              endLine,
              x: Math.max(8, Math.min(rect.left, window.innerWidth - 180)),
              y: Math.max(8, rect.top - 40),
            }
          : null,
      );
    };
    const dismiss = () => setSelected(null);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("selectionchange", update);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("selectionchange", update);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [active, target, quotes]);
  return (
    <div ref={root} style={{ display: "contents" }}>
      {children}
      {error && <span role="alert">{error}</span>}
      {selected &&
        target &&
        quotes &&
        createPortal(
          <button
            type="button"
            className={styles.selection}
            style={{ left: selected.x, top: selected.y }}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              const start = content.indexOf(selected.text);
              const unique =
                start >= 0 && content.indexOf(selected.text, start + 1) < 0;
              const line = unique
                ? content.slice(0, start).split("\n").length
                : selected.line;
              const endLine =
                unique && line
                  ? line + selected.text.split("\n").length - 1
                  : selected.endLine;
              if (
                !quotes.add(selected.text, {
                  kind: "file",
                  scope: quotes.scope,
                  target: {
                    ...target,
                    line,
                    endLine,
                  },
                })
              ) {
                setError(t("chat.answerQuote.limit"));
                return;
              }
              setError("");
              setSelected(null);
              window.getSelection()?.removeAllRanges();
            }}
          >
            {t("workbench.quotes.ask")}
          </button>,
          document.body,
        )}
    </div>
  );
}
