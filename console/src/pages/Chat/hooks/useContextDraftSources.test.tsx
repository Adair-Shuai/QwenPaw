import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ANSWER_QUOTES_KEY,
  addAnswerQuote,
  applyAnswerQuotePayload,
  consumeAnswerQuotes,
  readAnswerQuotes,
  restoreAnswerQuote,
} from "../answerQuotes";
import { useContextDraftSources } from "./useContextDraftSources";

const scope = () => ({
  scopeKey: crypto.randomUUID(),
  quoteScope: crypto.randomUUID(),
});

describe("useContextDraftSources", () => {
  it("UGSci fork feature: removes real pending quotes and restores their identity without replacing newer draft selections", () => {
    const props = scope();
    addAnswerQuote(props.quoteScope, {
      messageId: "reply-1",
      text: "First passage",
    });
    addAnswerQuote(props.quoteScope, {
      messageId: "reply-2",
      text: "Second passage",
    });
    const original = readAnswerQuotes(props.quoteScope);
    const { result } = renderHook(() => useContextDraftSources(props));

    expect(result.current.draftSources).toEqual(
      original.map((quote) => ({
        id: `quote:${quote.id}`,
        kind: "quote",
        title: quote.text,
        content: quote.text,
        status: "pending",
        removable: true,
      })),
    );
    act(() => {
      expect(result.current.onRemoveSource(`quote:${original[0].id}`)).toBe(
        true,
      );
      addAnswerQuote(props.quoteScope, {
        messageId: "reply-3",
        text: "A newer passage",
      });
    });
    expect(
      readAnswerQuotes(props.quoteScope).map((quote) => quote.text),
    ).toEqual(["Second passage", "A newer passage"]);
    expect(result.current.removedSource?.content).toBe("First passage");
    const payload = applyAnswerQuotePayload(
      {
        input: [{ role: "user", content: [{ type: "text", text: "Explain" }] }],
      },
      readAnswerQuotes(props.quoteScope),
    );
    const submitted = (
      payload.input as Array<{ metadata: Record<string, unknown> }>
    )[0];
    expect(submitted.metadata[ANSWER_QUOTES_KEY]).not.toContainEqual(
      original[0],
    );

    act(() => {
      expect(result.current.onUndoRemove()).toBe(true);
    });
    expect(readAnswerQuotes(props.quoteScope).slice(0, 2)).toEqual(original);
    expect(
      readAnswerQuotes(props.quoteScope).map((quote) => quote.text),
    ).toEqual(["First passage", "Second passage", "A newer passage"]);
    expect(
      JSON.parse(localStorage.getItem(`${props.quoteScope}_answer_quotes`)!),
    ).toEqual(readAnswerQuotes(props.quoteScope));
    expect(result.current.removedSource).toBeNull();
    expect(result.current.onUndoRemove()).toBe(false);
  });

  it("invalidates undo on submission without changing its immutable quote snapshot", () => {
    const props = scope();
    addAnswerQuote(props.quoteScope, { messageId: "reply-1", text: "Keep" });
    addAnswerQuote(props.quoteScope, {
      messageId: "reply-2",
      text: "Remove before sending",
    });
    const { result } = renderHook(() => useContextDraftSources(props));
    act(() => {
      result.current.onRemoveSource(result.current.draftSources[1].id);
    });
    const admitted = readAnswerQuotes(props.quoteScope);
    const oldUndo = result.current.onUndoRemove;
    act(() => {
      result.current.invalidateUndo();
      consumeAnswerQuotes(props.quoteScope, admitted);
      addAnswerQuote(props.quoteScope, {
        messageId: "reply-3",
        text: "Next message",
      });
    });
    act(() => {
      expect(oldUndo()).toBe(false);
    });
    expect(admitted.map((quote) => quote.text)).toEqual(["Keep"]);
    expect(
      readAnswerQuotes(props.quoteScope).map((quote) => quote.text),
    ).toEqual(["Next message"]);
    expect(result.current.removedSource).toBeNull();
  });

  it("rejects stale actions across agent or chat visits even after returning to the original draft", () => {
    const first = scope(),
      second = scope();
    addAnswerQuote(first.quoteScope, {
      messageId: "reply-a",
      text: "First chat",
    });
    addAnswerQuote(second.quoteScope, {
      messageId: "reply-b",
      text: "Second chat",
    });
    const { result, rerender } = renderHook(
      (props) => useContextDraftSources(props),
      {
        initialProps: first,
      },
    );
    const firstQuoteId = result.current.draftSources[0].id;
    const oldActions = result.current;
    act(() => {
      result.current.onRemoveSource(firstQuoteId);
    });
    rerender(second);
    expect(result.current.draftSources.map((source) => source.title)).toEqual([
      "Second chat",
    ]);
    expect(result.current.removedSource).toBeNull();
    act(() => {
      result.current.onRemoveSource(result.current.draftSources[0].id);
      expect(oldActions.onRemoveSource(firstQuoteId)).toBe(false);
      expect(oldActions.onUndoRemove()).toBe(false);
      oldActions.invalidateUndo();
    });
    expect(result.current.removedSource?.title).toBe("Second chat");
    act(() => {
      expect(result.current.onUndoRemove()).toBe(true);
    });
    rerender(first);
    expect(result.current.removedSource).toBeNull();
    act(() => {
      expect(result.current.onUndoRemove()).toBe(false);
    });
    expect(readAnswerQuotes(first.quoteScope)).toEqual([]);
    expect(
      readAnswerQuotes(second.quoteScope).map((quote) => quote.text),
    ).toEqual(["Second chat"]);
  });

  it("preserves current selections when undo reaches the quote limit and retries after space is available", () => {
    const props = scope();
    addAnswerQuote(props.quoteScope, {
      messageId: "removed",
      text: "Removed passage",
    });
    const { result } = renderHook(() => useContextDraftSources(props));
    act(() => {
      result.current.onRemoveSource(result.current.draftSources[0].id);
      for (let index = 0; index < 12; index++) {
        addAnswerQuote(props.quoteScope, {
          messageId: `new-${index}`,
          text: `New ${index}`,
        });
      }
    });
    const full = readAnswerQuotes(props.quoteScope);
    act(() => {
      expect(result.current.onUndoRemove()).toBe(false);
    });
    expect(readAnswerQuotes(props.quoteScope)).toEqual(full);
    expect(result.current.removedSource?.title).toBe("Removed passage");
    act(() => {
      consumeAnswerQuotes(props.quoteScope, [full[11]]);
      expect(result.current.onUndoRemove()).toBe(true);
    });
    expect(readAnswerQuotes(props.quoteScope)).toHaveLength(12);
    expect(readAnswerQuotes(props.quoteScope)[0].text).toBe("Removed passage");
  });

  it("does not duplicate a passage selected again before undo", () => {
    const props = scope();
    const passage = { messageId: "reply-1", text: "Same passage" };
    addAnswerQuote(props.quoteScope, passage);
    const { result } = renderHook(() => useContextDraftSources(props));
    act(() => {
      result.current.onRemoveSource(result.current.draftSources[0].id);
      addAnswerQuote(props.quoteScope, passage);
    });
    const newSelection = readAnswerQuotes(props.quoteScope);
    act(() => {
      expect(result.current.onUndoRemove()).toBe(true);
    });
    expect(readAnswerQuotes(props.quoteScope)).toEqual(newSelection);
    expect(result.current.removedSource).toBeNull();
  });

  it("disables removed draft callbacks after their composer unmounts", () => {
    const props = scope();
    addAnswerQuote(props.quoteScope, {
      messageId: "reply-1",
      text: "Old composer",
    });
    const { result, unmount } = renderHook(() => useContextDraftSources(props));
    act(() => {
      result.current.onRemoveSource(result.current.draftSources[0].id);
    });
    const oldActions = result.current;
    unmount();
    expect(oldActions.onUndoRemove()).toBe(false);
    expect(readAnswerQuotes(props.quoteScope)).toEqual([]);
  });

  it("rejects identity collisions and oversized restores without changing stored quotes", () => {
    const props = scope();
    addAnswerQuote(props.quoteScope, { messageId: "reply-1", text: "Current" });
    const original = readAnswerQuotes(props.quoteScope);
    expect(
      restoreAnswerQuote(
        props.quoteScope,
        { ...original[0], text: "Altered" },
        0,
      ),
    ).toBe(false);
    expect(
      restoreAnswerQuote(
        props.quoteScope,
        {
          id: "oversized",
          messageId: "reply-2",
          text: "x".repeat(32000),
        },
        0,
      ),
    ).toBe(false);
    expect(
      restoreAnswerQuote(
        props.quoteScope,
        {
          id: "empty",
          messageId: "reply-2",
          text: " ",
        },
        0,
      ),
    ).toBe(false);
    expect(readAnswerQuotes(props.quoteScope)).toEqual(original);
  });
});
