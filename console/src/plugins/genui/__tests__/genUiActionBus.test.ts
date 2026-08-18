/**
 * Tests for GenUI action bus: dispatchGenUiAction.
 *
 * Covers plan section 9.2:
 * - send_message action is allowed and dispatches via the host chat SDK
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

describe("dispatchGenUiAction", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let sendMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    resetActionBus();
    sendMessage = vi.fn(() => true);
    (window as any).QwenPaw = { chat: { sendMessage } };
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as any).QwenPaw;
  });

  it("dispatches send_message action with content", () => {
    dispatchGenUiAction({
      type: "send_message",
      payload: { content: "Hello world" },
    });
    expect(sendMessage).toHaveBeenCalledWith("Hello world");
  });

  it("appends current form values when content has no placeholders", () => {
    dispatchGenUiAction(
      { type: "submit_form", payload: { content: "提交验收" } },
      { formId: "acceptance", formValues: { name: "张三", phase: "二期" } },
    );
    expect(sendMessage).toHaveBeenCalledWith(
      "提交验收\nname: 张三\nphase: 二期",
    );
  });

  it("dispatches send_message action with message key", () => {
    dispatchGenUiAction({
      type: "send_message",
      payload: { message: "Alternative key" },
    });
    expect(sendMessage).toHaveBeenCalledWith("Alternative key");
  });

  it("does nothing for send_message with empty content", () => {
    dispatchGenUiAction({
      type: "send_message",
      payload: { content: "" },
    });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("does nothing for send_message with no payload", () => {
    dispatchGenUiAction({ type: "send_message" });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("blocks unknown action types", () => {
    dispatchGenUiAction({ type: "navigate", payload: { url: "/test" } });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("not allowed"),
    );
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("blocks malicious action types", () => {
    dispatchGenUiAction({ type: "eval", payload: { code: "alert(1)" } });
    expect(warnSpy).toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("blocks open_url action", () => {
    dispatchGenUiAction({
      type: "open_url",
      payload: { url: "javascript:alert(1)" },
    });
    expect(warnSpy).toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("handles string action shorthand", () => {
    dispatchGenUiAction("send_message");
    // String shorthand creates { type: "send_message" } but has no payload
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("ignores null action", () => {
    dispatchGenUiAction(null);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("ignores undefined action", () => {
    dispatchGenUiAction(undefined);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("ignores number action", () => {
    dispatchGenUiAction(42);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("ignores string that is not an action type", () => {
    dispatchGenUiAction("random_string");
    // "random_string" becomes { type: "random_string" } which is not in ALLOWED
    expect(warnSpy).toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("logs info when the host sender API is unavailable", () => {
    (window as any).QwenPaw.chat = {};
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
  let sendMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    resetActionBus();
    sendMessage = vi.fn(() => true);
    (window as any).QwenPaw = { chat: { sendMessage } };
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it("opens http(s) URLs when open_url is allowed", () => {
    const open = vi.fn();
    window.open = open;
    (window as any).QwenPaw.genui = {
      config: { allow_actions: ["send_message", "open_url"] },
    };
    const result = dispatchGenUiAction({
      type: "open_url",
      payload: { url: "https://example.com/docs" },
    });
    expect(result.ok).toBe(true);
    expect(open).toHaveBeenCalledWith(
      "https://example.com/docs",
      "_blank",
      "noopener,noreferrer",
    );
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("rejects javascript and relative URLs even when open_url is allowed", () => {
    const open = vi.fn();
    window.open = open;
    (window as any).QwenPaw.genui = {
      config: { allow_actions: ["open_url"] },
    };
    expect(
      dispatchGenUiAction({
        type: "open_url",
        payload: { url: "javascript:alert(1)" },
      }).ok,
    ).toBe(false);
    expect(
      dispatchGenUiAction({ type: "open_url", payload: { url: "/settings" } })
        .ok,
    ).toBe(false);
    expect(open).not.toHaveBeenCalled();
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
    expect(sendMessage).not.toHaveBeenCalled();
  });
});
