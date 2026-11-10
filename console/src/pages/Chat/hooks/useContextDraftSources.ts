import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  consumeAnswerQuotes,
  readAnswerQuotes,
  restoreAnswerQuote,
  subscribeAnswerQuotes,
  type AnswerQuote,
} from "../answerQuotes";
import type { ContextInspectorSource } from "../components/ContextUsageIndicator/types";

interface DraftScope {
  scopeKey: string;
  quoteScope: string;
}

interface RemovedQuote {
  visit: DraftScope;
  quote: AnswerQuote;
  index: number;
  source: ContextInspectorSource;
}

function quoteSource(quote: AnswerQuote): ContextInspectorSource {
  const title = quote.text.replace(/\s+/gu, " ").trim();
  return {
    id: `quote:${quote.id}`,
    kind: "quote",
    title: title.length > 80 ? `${title.slice(0, 80)}…` : title,
    content: quote.text,
    status: "pending",
    removable: true,
  };
}

/**
 * Exposes the composer's real quote store, not already-sent message content.
 * The host must call invalidateUndo synchronously when a submission starts,
 * including its direct execution and queue shortcuts. This intentionally
 * excludes the host's upload log: the SDK owns the actual attachment list.
 */
export function useContextDraftSources({ scopeKey, quoteScope }: DraftScope) {
  const visit = useMemo(
    () => ({ scopeKey, quoteScope }),
    [scopeKey, quoteScope],
  );
  const activeVisit = useRef<DraftScope | null>(visit);
  activeVisit.current = visit;
  const getQuotes = useCallback(
    () => readAnswerQuotes(quoteScope),
    [quoteScope],
  );
  const quotes = useSyncExternalStore(subscribeAnswerQuotes, getQuotes);
  const draftSources = useMemo(() => quotes.map(quoteSource), [quotes]);
  const undo = useRef<RemovedQuote | null>(null);
  const [removed, setRemoved] = useState<RemovedQuote | null>(null);

  useEffect(() => {
    activeVisit.current = visit;
    return () => {
      if (activeVisit.current === visit) activeVisit.current = null;
    };
  }, [visit]);

  const invalidateUndo = useCallback(() => {
    if (activeVisit.current !== visit) return;
    undo.current = null;
    setRemoved(null);
  }, [visit]);

  const onRemoveSource = useCallback(
    (id: string): boolean => {
      if (activeVisit.current !== visit) return false;
      const current = readAnswerQuotes(quoteScope);
      const index = current.findIndex((quote) => `quote:${quote.id}` === id);
      if (index < 0) return false;
      const quote = current[index];
      const record = { visit, quote, index, source: quoteSource(quote) };
      undo.current = record;
      setRemoved(record);
      consumeAnswerQuotes(quoteScope, [quote]);
      return true;
    },
    [quoteScope, visit],
  );

  const onUndoRemove = useCallback((): boolean => {
    const record = undo.current;
    if (activeVisit.current !== visit || record?.visit !== visit) return false;
    if (!restoreAnswerQuote(quoteScope, record.quote, record.index))
      return false;
    undo.current = null;
    setRemoved(null);
    return true;
  }, [quoteScope, visit]);

  return {
    draftSources,
    onRemoveSource,
    removedSource: removed?.visit === visit ? removed.source : null,
    onUndoRemove,
    invalidateUndo,
  };
}
