import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  chatContextApi,
  type ChatContextSnapshot,
} from "../../../api/modules/chatContext";
import { useContextInspection } from "./useContextInspection";

vi.mock("../../../api/modules/chatContext", () => ({
  chatContextApi: { get: vi.fn() },
}));

const fixture = (chatId = "chat-a"): ChatContextSnapshot => ({
  agent_id: "agent-a",
  chat_id: chatId,
  session_id: `runtime-${chatId}`,
  user_id: "user-a",
  channel: "console",
  status: "saved",
  snapshot: {
    id: "call-1",
    captured_at: "2026-11-06T09:00:00Z",
    basis: "model_request",
    message_count: 2,
    tool_count: 1,
  },
  sources: [
    {
      id: "rule",
      kind: "system",
      label: "AGENTS.md",
      provenance: "model_request",
      content: "Actual frozen rule",
      truncated: false,
    },
  ],
  summary: {
    kind: "native",
    content: "Exact saved summary\nsecond line",
    stale: false,
  },
  limitations: [],
});
const options = (chatId = "chat-a") => ({
  scopeKey: chatId,
  agentId: "agent-a",
  chatId,
  sessionId: `runtime-${chatId}`,
  userId: "user-a",
  enabled: true,
  executionBusy: false,
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe("context inspection lifecycle", () => {
  beforeEach(() => {
    vi.mocked(chatContextApi.get).mockReset().mockResolvedValue(fixture());
  });

  it("loads only while open and refreshes the saved snapshot after execution changes", async () => {
    const { result, rerender } = renderHook(useContextInspection, {
      initialProps: options(),
    });
    expect(chatContextApi.get).not.toHaveBeenCalled();
    act(() => result.current.onOpenChange(true));
    await waitFor(() =>
      expect(result.current.details.sources[0]?.content).toBe(
        "Actual frozen rule",
      ),
    );
    expect(chatContextApi.get).toHaveBeenCalledWith(
      "chat-a",
      "agent-a",
      expect.objectContaining({
        sessionId: "runtime-chat-a",
        userId: "user-a",
      }),
    );
    expect(result.current.details.sources[0]).toMatchObject({
      status: "included",
      removable: false,
    });
    expect(result.current.details.summary?.content).toBe(
      "Exact saved summary\nsecond line",
    );
    rerender({ ...options(), executionBusy: true });
    await waitFor(() => expect(chatContextApi.get).toHaveBeenCalledTimes(2));
    rerender(options());
    await waitFor(() => expect(chatContextApi.get).toHaveBeenCalledTimes(3));
    act(() => result.current.onOpenChange(false));
    rerender({ ...options(), executionBusy: true });
    expect(chatContextApi.get).toHaveBeenCalledTimes(3);
  });

  it("aborts old visits and never shows a late result after switching away and back", async () => {
    const old = deferred<ChatContextSnapshot>();
    vi.mocked(chatContextApi.get).mockReturnValueOnce(old.promise);
    const { result, rerender } = renderHook(useContextInspection, {
      initialProps: options(),
    });
    act(() => result.current.onOpenChange(true));
    const signal = vi.mocked(chatContextApi.get).mock.calls[0][2]?.signal;
    rerender(options("chat-b"));
    expect(signal?.aborted).toBe(true);
    expect(result.current.details.sources).toEqual([]);
    rerender(options());
    act(() => result.current.onOpenChange(false));
    await act(async () =>
      old.resolve({
        ...fixture(),
        sources: [{ ...fixture().sources[0], content: "obsolete" }],
      }),
    );
    expect(
      result.current.details.sources.some((s) => s.content === "obsolete"),
    ).toBe(false);
  });

  it("rejects mismatched session evidence and offers retry without retaining prior records", async () => {
    vi.mocked(chatContextApi.get).mockResolvedValueOnce({
      ...fixture(),
      session_id: "other",
    });
    const { result } = renderHook(() => useContextInspection(options()));
    act(() => result.current.onOpenChange(true));
    await waitFor(() => expect(result.current.detailsError).toBeTruthy());
    expect(result.current.details.sources).toEqual([]);
    await act(async () => {
      await result.current.onRetry();
    });
    expect(result.current.detailsError).toBeUndefined();
    expect(result.current.details.sources).toHaveLength(1);
    vi.mocked(chatContextApi.get).mockRejectedValueOnce(new Error("offline"));
    await act(async () => {
      await result.current.onRetry();
    });
    expect(result.current.detailsError).toBeTruthy();
    expect(result.current.details.sources).toEqual([]);
  });

  it("marks legacy sources unknown and avoids querying new chats or unsupported backends", async () => {
    const legacy = fixture();
    legacy.snapshot!.basis = "saved_session";
    legacy.sources[0].provenance = "saved_session";
    vi.mocked(chatContextApi.get).mockResolvedValue(legacy);
    const { result, rerender } = renderHook(useContextInspection, {
      initialProps: options(),
    });
    act(() => result.current.onOpenChange(true));
    await waitFor(() =>
      expect(result.current.details.sources[0]?.status).toBe("unknown"),
    );
    rerender({ ...options(), enabled: false });
    act(() => result.current.onOpenChange(true));
    expect(result.current.details.summaryAvailable).toBe(false);
    rerender({ ...options(), chatId: "" });
    act(() => result.current.onOpenChange(true));
    expect(result.current.details.sources).toEqual([]);
    expect(chatContextApi.get).toHaveBeenCalledTimes(1);
  });
});
