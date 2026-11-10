export const ANSWER_QUOTES_KEY = "qwenpaw_answer_quotes";
export interface AnswerQuote {
  id: string;
  messageId: string;
  text: string;
}
const EMPTY: AnswerQuote[] = [];
const drafts = new Map<string, AnswerQuote[]>();
const listeners = new Set<() => void>();
const storageKey = (scope: string) => `${scope}_answer_quotes`;

export function parseAnswerQuotes(value: unknown): AnswerQuote[] {
  if (!Array.isArray(value) || value.length > 12) return EMPTY;
  if (
    !value.every(
      (q) =>
        q &&
        typeof q.id === "string" &&
        typeof q.messageId === "string" &&
        typeof q.text === "string" &&
        q.text.trim() &&
        q.text.length <= 32000,
    ) ||
    value.reduce((n, q) => n + q.text.length, 0) > 32000
  )
    return EMPTY;
  return value;
}

export function readAnswerQuotes(scope: string): AnswerQuote[] {
  if (!drafts.has(scope)) {
    try {
      drafts.set(
        scope,
        parseAnswerQuotes(
          JSON.parse(localStorage.getItem(storageKey(scope)) || "null"),
        ),
      );
    } catch {
      drafts.set(scope, EMPTY);
    }
  }
  return drafts.get(scope)!;
}

export function subscribeAnswerQuotes(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key.endsWith("_answer_quotes")) {
      drafts.clear();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(scope: string, quotes: AnswerQuote[]) {
  drafts.set(scope, quotes);
  try {
    if (quotes.length)
      localStorage.setItem(storageKey(scope), JSON.stringify(quotes));
    else localStorage.removeItem(storageKey(scope));
  } catch {
    /* The live draft remains usable when browser storage is full. */
  }
  listeners.forEach((notify) => notify());
}

export function addAnswerQuote(
  scope: string,
  quote: Omit<AnswerQuote, "id">,
): boolean {
  const current = readAnswerQuotes(scope);
  if (
    current.some(
      (q) => q.messageId === quote.messageId && q.text === quote.text,
    )
  )
    return true;
  if (
    !quote.text.trim() ||
    current.length >= 12 ||
    current.reduce((n, q) => n + q.text.length, quote.text.length) > 32000
  )
    return false;
  write(scope, [
    ...current,
    { messageId: quote.messageId, text: quote.text, id: crypto.randomUUID() },
  ]);
  return true;
}

/** Consume only the admitted snapshot, retaining selections added during awaits. */
export function consumeAnswerQuotes(
  scope: string,
  submitted: readonly AnswerQuote[],
) {
  const ids = new Set(submitted.map((q) => q.id));
  write(
    scope,
    readAnswerQuotes(scope).filter((q) => !ids.has(q.id)),
  );
}

/** Restore one removed draft quote without replacing newer selections. */
export function restoreAnswerQuote(
  scope: string,
  quote: AnswerQuote,
  index: number,
): boolean {
  if (parseAnswerQuotes([quote]).length !== 1) return false;
  const current = readAnswerQuotes(scope);
  const sameId = current.find((item) => item.id === quote.id);
  if (sameId)
    return sameId.messageId === quote.messageId && sameId.text === quote.text;
  if (
    current.some(
      (item) => item.messageId === quote.messageId && item.text === quote.text,
    )
  )
    return true;
  const next = [...current];
  const position = Number.isFinite(index)
    ? Math.max(0, Math.min(Math.trunc(index), next.length))
    : next.length;
  next.splice(position, 0, { ...quote });
  if (parseAnswerQuotes(next).length !== next.length) return false;
  write(scope, next);
  return true;
}

export function quotesFromContext(context?: Record<string, unknown>) {
  return parseAnswerQuotes(context?.[ANSWER_QUOTES_KEY]);
}

export function quotesFromMessage(
  message: Record<string, unknown>,
): AnswerQuote[] {
  const metadata = message.metadata as Record<string, unknown> | undefined;
  const direct = quotesFromContext(metadata);
  return direct.length
    ? direct
    : quotesFromContext(metadata?.metadata as Record<string, unknown>);
}

export function formatAnswerQuotes(quotes: readonly AnswerQuote[]) {
  return (
    "Quoted passages from assistant replies:\n" +
    quotes
      .map(
        (q) =>
          `[${q.messageId}]\n${q.text
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n")}`,
      )
      .join("\n\n")
  );
}

/** Only remove the exact context block described by the message's own metadata. */
export function withoutAnswerQuoteContent<T extends Record<string, unknown>>(
  message: T,
): T {
  const quotes = quotesFromMessage(message);
  if (!quotes.length || !Array.isArray(message.content)) return message;
  const block = formatAnswerQuotes(quotes);
  return {
    ...message,
    content: message.content.filter(
      (part) => !(part?.type === "text" && part.text === block),
    ),
  };
}

export function attachAnswerQuotes<T extends Record<string, unknown>>(
  message: T,
  quotes: AnswerQuote[],
): T {
  if (!quotes.length) return message;
  return {
    ...message,
    metadata: { ...(message.metadata as object), [ANSWER_QUOTES_KEY]: quotes },
  };
}

/** Runs after mention dispatch: quoted @names and slash commands are just text. */
export function applyAnswerQuotePayload(
  payload: Record<string, unknown>,
  quotes: AnswerQuote[],
) {
  if (!quotes.length || !Array.isArray(payload.input)) return payload;
  const input = [...payload.input];
  for (let i = input.length - 1; i >= 0; i--) {
    if (input[i]?.role !== "user" || !Array.isArray(input[i].content)) continue;
    const message = withoutAnswerQuoteContent(input[i]);
    input[i] = attachAnswerQuotes(
      {
        ...message,
        content: [
          ...message.content,
          { type: "text", text: formatAnswerQuotes(quotes) },
        ],
      },
      quotes,
    );
    break;
  }
  return { ...payload, input };
}
