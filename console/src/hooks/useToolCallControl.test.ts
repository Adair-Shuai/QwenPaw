import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getInfo = vi.fn();
const getOffloadPolicy = vi.fn();
let resolvePreferred: (preferred?: string | null) => string = () =>
  "backend-sid";

vi.mock("../api/modules/toolCalls", () => ({
  toolCallsApi: {
    getInfo: (...args: unknown[]) => getInfo(...args),
    getOffloadPolicy: (...args: unknown[]) => getOffloadPolicy(...args),
  },
}));

vi.mock("../utils/resolveBackendSessionId", () => ({
  resolveBackendSessionId: (preferred?: string | null) =>
    resolvePreferred(preferred),
}));

const registerBackgroundTask = vi.fn();

vi.mock("./useBackgroundTaskWatcher", () => ({
  registerBackgroundTask: (...args: unknown[]) =>
    registerBackgroundTask(...args),
}));

vi.mock("../stores/backgroundTasksStore", () => ({
  useBackgroundTasksStore: {
    getState: () => ({ tasks: [] }),
  },
}));

import { useToolCallControl } from "./useToolCallControl";

describe("useToolCallControl", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
    getInfo.mockReset();
    getOffloadPolicy.mockReset();
    registerBackgroundTask.mockReset();
    getOffloadPolicy.mockResolvedValue({ default_action: "keep_foreground" });
    resolvePreferred = (preferred?: string | null) =>
      preferred || "backend-sid";
  });

  it("bounds slow polling requests and resumes after failure without losing offload detection", async () => {
    const pending: Array<(value: unknown) => void> = [];
    getInfo.mockImplementation(
      () => new Promise((resolve) => pending.push(resolve)),
    );
    let resolvePolicy!: (value: unknown) => void;
    getOffloadPolicy.mockReturnValue(
      new Promise((resolve) => {
        resolvePolicy = resolve;
      }),
    );
    const { unmount } = renderHook(() =>
      useToolCallControl("backend-sid", "tc-slow", true),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    // Initial deadline lookup and ongoing status polling each allow one request.
    expect(getInfo).toHaveBeenCalledTimes(2);
    expect(getOffloadPolicy).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.splice(0).forEach((resolve) => resolve(null));
      resolvePolicy({ default_action: "keep_foreground" });
    });
    getInfo.mockRejectedValueOnce(new Error("temporary backend failure"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    getInfo.mockResolvedValue({ status: "offloaded" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(registerBackgroundTask).toHaveBeenCalledTimes(1);
    expect(registerBackgroundTask).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "backend-sid",
        toolCallId: "tc-slow",
      }),
    );
    unmount();
    const count = getInfo.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(getInfo).toHaveBeenCalledTimes(count);
  });

  it("ignores slow polling results from a previous tool after switching identity", async () => {
    const pending: Array<(value: unknown) => void> = [];
    getInfo.mockImplementation(
      () => new Promise((resolve) => pending.push(resolve)),
    );
    const { result, rerender, unmount } = renderHook(
      ({ id }) => useToolCallControl("backend-sid", id, true),
      { initialProps: { id: "old-tool" } },
    );
    const oldRequests = pending.splice(0);
    rerender({ id: "new-tool" });
    await act(async () => {
      oldRequests.forEach((resolve) =>
        resolve({ status: "offloaded", offload_remaining: 20 }),
      );
    });
    expect(registerBackgroundTask).not.toHaveBeenCalled();
    expect(result.current.offloadRemaining).toBeNull();
    unmount();
    await act(async () => {
      pending.forEach((resolve) => resolve({ status: "offloaded" }));
    });
    expect(registerBackgroundTask).not.toHaveBeenCalled();
  });

  it("keeps killRemaining ticking after offload countdown hits zero", async () => {
    let nowMs = 0;
    vi.spyOn(performance, "now").mockImplementation(() => nowMs);

    getInfo.mockImplementation(async () => ({
      status: "running",
      offload_remaining: nowMs >= 1000 ? 0 : 1,
      kill_remaining: Math.max(0, 5 - nowMs / 1000),
    }));

    const { result } = renderHook(() =>
      useToolCallControl("backend-sid", "tc-1", true, "shell"),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.defaultPolicy).toBe("keep_foreground");
    expect(result.current.offloadRemaining).toBe(1);
    expect(result.current.killRemaining).toBe(5);

    await act(async () => {
      nowMs += 1000;
      vi.advanceTimersByTime(1000);
    });

    // Offload window closed; kill countdown must keep ticking locally.
    expect(result.current.offloadRemaining).toBe(0);
    expect(result.current.killRemaining).not.toBeNull();
    expect(result.current.killRemaining as number).toBeLessThanOrEqual(4);

    const killAfterOffloadZero = result.current.killRemaining as number;

    await act(async () => {
      nowMs += 1000;
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(result.current.killRemaining as number).toBeLessThan(
      killAfterOffloadZero,
    );
  });

  it("loads offload policy from settings", async () => {
    getOffloadPolicy.mockResolvedValue({ default_action: "offload" });
    getInfo.mockResolvedValue({
      status: "running",
      offload_remaining: 20,
      kill_remaining: null,
    });

    const { result } = renderHook(() =>
      useToolCallControl("backend-sid", "tc-2", true),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.defaultPolicy).toBe("offload");
  });

  it("retries getInfo after session id becomes available", async () => {
    let mappedSid = "";
    resolvePreferred = () => mappedSid;

    getInfo.mockImplementation(async (sid: string) => {
      if (sid !== "backend-ready") return null;
      return {
        status: "running",
        offload_remaining: 12,
        kill_remaining: 40,
      };
    });

    const { result } = renderHook(() =>
      useToolCallControl("", "tc-retry", true, "shell"),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.offloadRemaining).toBeNull();
    expect(getInfo).not.toHaveBeenCalled();

    mappedSid = "backend-ready";

    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getInfo).toHaveBeenCalledWith("backend-ready", "tc-retry");
    expect(result.current.offloadRemaining).toBe(12);
    expect(result.current.killRemaining).toBe(40);
  });

  it("does not register foreground completions into the bg task panel", async () => {
    getInfo.mockResolvedValue({
      status: "completed",
      offload_remaining: null,
      kill_remaining: null,
      offload_reason: null,
    });

    const { rerender } = renderHook(
      ({ calling }: { calling: boolean }) =>
        useToolCallControl("backend-sid", "tc-fg", calling, "shell"),
      { initialProps: { calling: true } },
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      rerender({ calling: false });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(registerBackgroundTask).not.toHaveBeenCalled();
  });

  it("does not auto-open the control panel before min foreground runtime", async () => {
    let nowMs = 0;
    vi.spyOn(performance, "now").mockImplementation(() => nowMs);

    getInfo.mockResolvedValue({
      status: "running",
      offload_remaining: 30,
      kill_remaining: 60,
      elapsed: 0,
    });

    const { result } = renderHook(() =>
      useToolCallControl("backend-sid", "tc-popup", true, "shell"),
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // First second: offload already ≤ 30, but elapsed < 15 → stay closed.
    await act(async () => {
      nowMs += 1000;
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.bannerVisible).toBe(false);

    // After minWait (min(15, 30*0.5)=15s) the panel may auto-open.
    await act(async () => {
      nowMs += 14000;
      vi.advanceTimersByTime(14000);
    });
    expect(result.current.bannerVisible).toBe(true);
  }, 30000);

  it("registers alreadyCompleted only when offload_reason is set", async () => {
    getInfo.mockResolvedValue({
      status: "completed",
      offload_remaining: null,
      kill_remaining: null,
      offload_reason: "timeout",
    });

    const { rerender } = renderHook(
      ({ calling }: { calling: boolean }) =>
        useToolCallControl("backend-sid", "tc-bg-fast", calling, "shell"),
      { initialProps: { calling: true } },
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      rerender({ calling: false });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(registerBackgroundTask).toHaveBeenCalledWith(
      expect.objectContaining({
        toolCallId: "tc-bg-fast",
        alreadyCompleted: true,
      }),
    );
  });
});
