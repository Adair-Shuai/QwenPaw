import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import type { IAgentScopeRuntimeRequest } from "@agentscope-ai/chat";
import {
  quotesFromMessage,
  withoutAnswerQuoteContent,
  type AnswerQuote,
} from "../answerQuotes";
import {
  openQuoteSource,
  useWorkspaceQuotes,
} from "../../../features/files-workspace/workspaceQuotes";
import styles from "./AnswerQuoteComposer.module.less";

export function AnswerQuoteSummary({ quotes }: { quotes: AnswerQuote[] }) {
  const { t } = useTranslation();
  const workspace = useWorkspaceQuotes();
  if (!quotes.length) return null;
  return (
    <details className={styles.sent} data-sent-answer-quotes>
      <summary>{t("chat.answerQuote.count", { count: quotes.length })}</summary>
      {quotes.map((quote) => (
        <blockquote key={quote.id}>
          {quote.source && (
            <button
              type="button"
              onClick={() => openQuoteSource(quote.source!, workspace?.scope)}
            >
              {quote.messageId}
            </button>
          )}
          {quote.text}
        </blockquote>
      ))}
    </details>
  );
}

/** Keep the SDK's card, media, actions and public plugin slots mounted. */
export function renderQuotedRequest(
  data: IAgentScopeRuntimeRequest,
  fallback: ReactNode,
): ReactNode {
  const quotes = (data.input || []).flatMap((message) =>
    quotesFromMessage(message as unknown as Record<string, unknown>),
  );
  if (!quotes.length || !isValidElement(fallback)) return fallback;
  const node = fallback as ReactElement<{
    data: IAgentScopeRuntimeRequest;
    contentPrepend?: ReactNode;
  }>;
  if (!node.props.data)
    return (
      <>
        <AnswerQuoteSummary quotes={quotes} />
        {fallback}
      </>
    );
  return cloneElement(node, {
    data: {
      ...data,
      input: data.input.map((message) =>
        withoutAnswerQuoteContent(
          message as unknown as Record<string, unknown>,
        ),
      ),
    } as IAgentScopeRuntimeRequest,
    contentPrepend: (
      <>
        {node.props.contentPrepend}
        <AnswerQuoteSummary quotes={quotes} />
      </>
    ),
  });
}
