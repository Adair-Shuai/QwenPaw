import { describe, it, expect } from "vitest";
import {
  ANSWER_QUOTES_KEY,
  addAnswerQuote,
  readAnswerQuotes,
  consumeAnswerQuotes,
  restoreAnswerQuote,
  formatAnswerQuotes,
  applyAnswerQuotePayload,
  quotesFromMessage,
  withoutAnswerQuoteContent,
} from "./answerQuotes";
import { applyChatPayloadTransforms } from "./chatPayload";
import { getRequestEditSnapshot } from "./requestEditSnapshot";
import { queueSteeringBlockReason } from "./queueSteering";

describe("answer quote submission", () => {
  it("isolates persistent quote drafts and consumes only the admitted selection", () => {
    const scope = crypto.randomUUID();
    addAnswerQuote(scope, { messageId: "m1", text: "first" });
    addAnswerQuote(scope, { messageId: "m1", text: "first" });
    const captured = readAnswerQuotes(scope);
    expect(captured).toHaveLength(1);
    addAnswerQuote(scope, { messageId: "m2", text: "second" });
    consumeAnswerQuotes(scope, captured);
    expect(readAnswerQuotes(scope).map((q) => q.text)).toEqual(["second"]);
    expect(readAnswerQuotes(scope + "-other")).toEqual([]);
    expect(
      JSON.parse(localStorage.getItem(scope + "_answer_quotes")!)[0].text,
    ).toBe("second");
    expect(
      addAnswerQuote(scope, { messageId: "huge", text: "a".repeat(32000) }),
    ).toBe(false);
    expect(readAnswerQuotes(scope)).toHaveLength(1);
  });

  it("preserves quotes through mention dispatch, attachment transport, retry and edit reconstruction", () => {
    const quotes = [
      {
        id: "q1",
        messageId: "reply1",
        text: "@Unrelated /new\nQuoted guidance",
      },
      { id: "q2", messageId: "reply2", text: "50 min" },
    ];
    const file = {
      type: "file",
      file_url: "/evidence.csv",
      file_name: "evidence.csv",
    };
    const payload = {
      input: [
        {
          role: "user",
          content: [{ type: "text", text: "@Reviewer adjust" }, file],
        },
      ],
      request_context: {
        [ANSWER_QUOTES_KEY]: quotes,
        qwenpaw_agent_mention_dispatch: {
          requestText: "adjust",
          targetAgentId: "reviewer",
          coordinationRequested: false,
        },
      },
    };
    const sent = applyChatPayloadTransforms(payload, "default", "client", []);
    const user = (sent.input as Array<Record<string, unknown>>)[0];
    expect(sent.target_agent_id).toBe("reviewer");
    expect(user.content).toEqual([
      { type: "text", text: "adjust" },
      file,
      { type: "text", text: formatAnswerQuotes(quotes) },
    ]);
    expect(quotesFromMessage(user)).toEqual(quotes);
    // A reopened history message carries metadata even without request_context.
    const retried = applyChatPayloadTransforms(
      { input: [user] },
      "default",
      undefined,
      [],
    );
    expect((retried.input as typeof payload.input)[0].content).toEqual(
      user.content,
    );
    const editable = getRequestEditSnapshot({ input: [user] });
    expect(editable).toMatchObject({
      text: "adjust",
      answerQuotes: quotes,
      unsupported: false,
    });
    expect(editable?.attachments[0].url).toBe("/evidence.csv");
    expect(
      withoutAnswerQuoteContent({
        role: "user",
        content: [{ type: "text", text: formatAnswerQuotes(quotes) }],
      }).content,
    ).toHaveLength(1);
    expect(
      queueSteeringBlockReason(
        {
          id: "q",
          text: "adjust",
          status: "pending",
          retryCount: 0,
          createdAt: 0,
          agentId: "default",
          requestContext: payload.request_context,
        },
        "default",
      ),
    ).toBe("chat.queue.steerTextOnly");
    expect(applyAnswerQuotePayload(sent, quotes)).toEqual(sent);
    const history = {
      ...user,
      metadata: { [ANSWER_QUOTES_KEY]: [quotes[0]] },
      content: [
        { type: "text", text: "Earlier question" },
        { type: "text", text: formatAnswerQuotes([quotes[0]]) },
      ],
    };
    const withHistory = applyChatPayloadTransforms(
      {
        ...payload,
        input: [history, { role: "assistant", content: [] }, ...payload.input],
      },
      "default",
      undefined,
      [],
    );
    expect((withHistory.input as unknown[])[0]).toEqual(history);
    expect(
      (withHistory.input as Array<Record<string, unknown>>)[2].content,
    ).toEqual(user.content);
  });
});

it("preserves workspace source identity through payload transport and keeps quoted commands inert", () => {
  const scope = crypto.randomUUID();
  addAnswerQuote(scope, {
    messageId: "source.py:4-5",
    text: "@Other /new quoted command",
    source: {
      kind: "file",
      scope: {
        kind: "session",
        agentId: "expert",
        sessionId: "source-session",
        chatId: "chat",
      },
      target: {
        source: "workspace",
        root: "workspace",
        path: "source.py",
        line: 4,
        endLine: 5,
      },
    },
  });
  const quotes = readAnswerQuotes(scope);
  const sent = applyChatPayloadTransforms(
    {
      input: [{ role: "user", content: [{ type: "text", text: "explain" }] }],
      request_context: { [ANSWER_QUOTES_KEY]: quotes },
    },
    "expert",
    "client",
    [],
  );
  expect(sent.target_agent_id).toBeUndefined();
  const message = (sent.input as Array<Record<string, unknown>>)[0];
  expect(quotesFromMessage(message)).toEqual(quotes);
  expect(withoutAnswerQuoteContent(message).content).toEqual([
    { type: "text", text: "explain" },
  ]);
  expect(formatAnswerQuotes(quotes)).toContain("source.py:4-5");
  const original = quotes[0];
  addAnswerQuote(scope, {
    ...original,
    source: {
      kind: "file",
      scope: { kind: "session", agentId: "expert", sessionId: "other-session" },
      target: { source: "workspace", path: "source.py", line: 4, endLine: 5 },
    },
  });
  expect(readAnswerQuotes(scope)).toHaveLength(2);
  consumeAnswerQuotes(scope, [original]);
  expect(restoreAnswerQuote(scope, original, 0)).toBe(true);
  expect(readAnswerQuotes(scope)).toHaveLength(2);
  expect(readAnswerQuotes(scope)[0].source).toEqual(original.source);
});
