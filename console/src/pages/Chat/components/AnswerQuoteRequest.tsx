import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import type { IAgentScopeRuntimeRequest } from "@agentscope-ai/chat";
import { FileText } from "lucide-react";
import {
  quotesFromMessage,
  withoutAnswerQuoteContent,
  type AnswerFileReferenceSource,
  type AnswerQuote,
} from "../answerQuotes";
import { compactFileReferenceLabel } from "../fileReferenceFormatting";
import {
  openQuoteSource,
  useWorkspaceQuotes,
} from "../../../features/files-workspace/workspaceQuotes";
import styles from "./AnswerQuoteComposer.module.less";

export function FileReferenceButton({
  source,
}: {
  source: AnswerFileReferenceSource;
}) {
  const workspace = useWorkspaceQuotes();
  const path = source.target.path;
  return (
    <button
      type="button"
      className={styles.label}
      title={path}
      onClick={(event) =>
        openQuoteSource(source, workspace?.scope, event.currentTarget)
      }
    >
      <FileText size={13} aria-hidden="true" />
      <span>{compactFileReferenceLabel({ kind: "file", path })}</span>
    </button>
  );
}

export function AnswerQuoteSummary({ quotes }: { quotes: AnswerQuote[] }) {
  const { t } = useTranslation();
  const workspace = useWorkspaceQuotes();
  if (!quotes.length) return null;
  const references = quotes.filter(
    (quote) => quote.source?.kind === "file-reference",
  );
  const passages = quotes.filter(
    (quote) => quote.source?.kind !== "file-reference",
  );
  return (
    <>
      {references.length > 0 && (
        <div className={styles.sentReferences} data-sent-file-references>
          {references.map(
            ({ id, source }) =>
              source?.kind === "file-reference" && (
                <span className={styles.chip} key={id}>
                  <FileReferenceButton source={source} />
                </span>
              ),
          )}
        </div>
      )}
      {passages.length > 0 && (
        <details className={styles.sent} data-sent-answer-quotes>
          <summary>
            {t("chat.answerQuote.count", { count: passages.length })}
          </summary>
          {passages.map((quote) => (
            <blockquote key={quote.id}>
              {quote.source && (
                <button
                  type="button"
                  onClick={() =>
                    openQuoteSource(quote.source!, workspace?.scope)
                  }
                >
                  {quote.messageId}
                </button>
              )}
              {quote.text}
            </blockquote>
          ))}
        </details>
      )}
    </>
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
