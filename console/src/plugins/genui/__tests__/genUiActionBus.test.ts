/**
 * Tests for GenUI action bus: dispatchGenUiAction.
 *
 * Covers plan section 9.2:
 * - send_message action is allowed and dispatches via the sender textarea
 * - Other action types are blocked (console.warn)
 * - String action shorthand
 * - Invalid action types are ignored
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  dispatchGenUiAction,
  isActionAllowed,
  getAllowedActionsList,
  resetActionBus,
} from "@genui-src/lib/genUiActionBus";

/** Mock textarea element for _sendViaTextarea. */
function setupMockTextarea() {
  const textarea = document.createElement("textarea");
  const sender = document.createElement("div");
  sender.className = "asr-sender";
  sender.appendChild(textarea);
  document.body.appendChild(sender);
  return textarea;
}

function cleanupMockTextarea() {
  const sender = document.querySelector('[class*="sender"]');
  if (sender) sender.remove();
}

describe("dispatchGenUiAction", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    vi.clearAllMocks();
    resetActionBus();
    (window as any).QwenPaw = {};
    textarea = setupMockTextarea();
    // Stub dispatchEvent to prevent jsdom from firing Enter events that
    // could trigger side effects in jsdom's fake event system.
    vi.spyOn(textarea, "dispatchEvent");
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanupMockTextarea();
    delete (window as any).QwenPaw;
  });

  it("dispatches send_message action with content", () => {
    dispatchGenUiAction({
      type: "send_message",
      payload: { content: "Hello world" },
    });
    expect(textarea.value).toBe("Hello world");
    expect(textarea.dispatchEvent).toHaveBeenCalled();
  });

  it("dispatches send_message action with message key", () => {
    dispatchGenUiAction({
      type: "send_message",
      payload: { message: "Alternative key" },
    });
    expect(textarea.value).toBe("Alternative key");
    expect(textarea.dispatchEvent).toHaveBeenCalled();
  });

  it("does nothing for send_message with empty content", () => {
    dispatchGenUiAction({
      type: "send_message",
      payload: { content: "" },
    });
    expect(textarea.value).toBe("");
  });

  it("does nothing for send_message with no payload", () => {
    dispatchGenUiAction({ type: "send_message" });
    expect(textarea.value).toBe("");
  });

  it("blocks unknown action types", () => {
    dispatchGenUiAction({ type: "navigate", payload: { url: "/test" } });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("not allowed"),
    );
    expect(textarea.value).toBe("");
  });

  it("blocks malicious action types", () => {
    dispatchGenUiAction({ type: "eval", payload: { code: "alert(1)" } });
    expect(warnSpy).toHaveBeenCalled();
    expect(textarea.value).toBe("");
  });

  it("blocks open_url action", () => {
    dispatchGenUiAction({ type: "open_url", payload: { url: "javascript:alert(1)" } });
    expect(warnSpy).toHaveBeenCalled();
    expect(textarea.value).toBe("");
  });

  it("handles string action shorthand", () => {
    dispatchGenUiAction("send_message");
    // String shorthand creates { type: "send_message" } but has no payload
    expect(textarea.value).toBe("");
  });

  it("ignores null action", () => {
    dispatchGenUiAction(null);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(textarea.value).toBe("");
  });

  it("ignores undefined action", () => {
    dispatchGenUiAction(undefined);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(textarea.value).toBe("");
  });

  it("ignores number action", () => {
    dispatchGenUiAction(42);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(textarea.value).toBe("");
  });

  it("ignores string that is not an action type", () => {
    dispatchGenUiAction("random_string");
    // "random_string" becomes { type: "random_string" } which is not in ALLOWED
    expect(warnSpy).toHaveBeenCalled();
    expect(textarea.value).toBe("");
  });

  it("logs info when sender textarea is not found", () => {
    cleanupMockTextarea();
    dispatchGenUiAction({
      type: "send_message",
      payload: { content: "fallback test" },
    });
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining("could not find chat sender"),
      "fallback test",
    );
  });
});

// ── Config-based allowed actions (PLAN §8) ─────────────────────────────────

describe("config-based allowed actions", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    vi.clearAllMocks();
    resetActionBus();
    (window as any).QwenPaw = {};
    textarea = setupMockTextarea();
    vi.spyOn(textarea, "dispatchEvent");
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanupMockTextarea();
    delete (window as any).QwenPaw;
  });

  it("defaults to send_message only when no config", () => {
    expect(isActionAllowed("send_message")).toBe(true);
    expect(isActionAllowed("open_url")).toBe(false);
    expect(isActionAllowed("navigate")).toBe(false);
  });

  it("reads allowed actions from host config", () => {
    (window as any).QwenPaw.genui = {
      config: {
        allow_actions: ["send_message", "open_url", "navigate"],
      },
    };
    expect(isActionAllowed("send_message")).toBe(true);
    expect(isActionAllowed("open_url")).toBe(true);
    expect(isActionAllowed("navigate")).toBe(true);
    expect(isActionAllowed("eval")).toBe(false);
  });

  it("falls back to default when config has empty allow_actions", () => {
    (window as any).QwenPaw.genui = {
      config: { allow_actions: [] },
    };
    expect(isActionAllowed("send_message")).toBe(true);
  });

  it("falls back to default when config has invalid allow_actions", () => {
    (window as any).QwenPaw.genui = {
      config: { allow_actions: "not-an-array" },
    };
    expect(isActionAllowed("send_message")).toBe(true);
  });

  it("falls back to default when genui config is missing", () => {
    (window as any).QwenPaw.genui = {};
    expect(isActionAllowed("send_message")).toBe(true);
  });

  it("getAllowedActionsList returns array of allowed actions", () => {
    const list = getAllowedActionsList();
    expect(Array.isArray(list)).toBe(true);
    expect(list).toContain("send_message");
  });

  it("getAllowedActionsList reflects config changes", () => {
    (window as any).QwenPaw.genui = {
      config: { allow_actions: ["send_message", "open_url"] },
    };
    const list = getAllowedActionsList();
    expect(list).toContain("send_message");
    expect(list).toContain("open_url");
    expect(list.length).toBe(2);
  });

  it("dispatches custom allowed action when in config", () => {
    (window as any).QwenPaw.genui = {
      config: { allow_actions: ["send_message", "open_url"] },
    };
    // open_url is now allowed but not handled — should not warn
    dispatchGenUiAction({ type: "open_url", payload: { url: "/test" } });
    expect(warnSpy).not.toHaveBeenCalled();
    // But send_message is not called for open_url
    expect(textarea.value).toBe("");
  });

  it("blocks actions not in config allow list", () => {
    (window as any).QwenPaw.genui = {
      config: { allow_actions: ["open_url"] }, // send_message NOT in list
    };
    dispatchGenUiAction({
      type: "send_message",
      payload: { content: "test" },
    });
    expect(warnSpy).toHaveBeenCalled();
    expect(textarea.value).toBe("");
  });
});
