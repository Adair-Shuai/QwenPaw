import { afterEach, describe, expect, it, vi } from "vitest";
import { chatContextApi } from "./chatContext";
import { request } from "../request";

vi.mock("../request", () => ({ request: vi.fn().mockResolvedValue({}) }));
afterEach(() => vi.clearAllMocks());

describe("chat context API", () => {
  it("reads an explicitly scoped encoded chat without creating messages or model calls", async () => {
    const controller = new AbortController();
    await chatContextApi.get("chat/a b", "agent-two", {
      sessionId: "runtime/a b",
      userId: "user/a b",
      signal: controller.signal,
    });
    expect(request).toHaveBeenCalledExactlyOnceWith(
      "/chats/chat%2Fa%20b/context?expected_session_id=runtime%2Fa+b&expected_user_id=user%2Fa+b",
      { headers: { "X-Agent-Id": "agent-two" }, signal: controller.signal },
    );
  });
});
