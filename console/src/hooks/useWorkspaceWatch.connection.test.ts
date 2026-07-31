import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// 顶层 mock（Vitest 会提升这些），使用 doMock 以兼容 resetModules
vi.mock("../api/modules/workspace", () => ({
  workspaceApi: { getWatchUrl: vi.fn().mockReturnValue("http://test/watch") },
}));
vi.mock("../api/authHeaders", () => ({
  buildAuthHeaders: vi.fn((agentId?: string) => ({
    "X-Agent-Id": agentId ?? "default",
  })),
}));

// 创建一个永远挂起的 fetch（用于不关心 SSE 内容的测试）
function makePendingFetchMock() {
  return vi.fn().mockReturnValue(new Promise(() => {}));
}

describe("useWorkspaceWatch — connection lifecycle", () => {
  let useWorkspaceWatch: typeof import("./useWorkspaceWatch").useWorkspaceWatch;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.doMock("../api/modules/workspace", () => ({
      workspaceApi: {
        getWatchUrl: vi.fn().mockReturnValue("http://test/watch"),
      },
    }));
    vi.doMock("../api/authHeaders", () => ({
      buildAuthHeaders: vi.fn((agentId?: string) => ({
        "X-Agent-Id": agentId ?? "default",
      })),
    }));

    ({ useWorkspaceWatch } = await import("./useWorkspaceWatch"));
  });

  afterEach(() => {
    // 恢复原始 fetch（防止 mock 泄漏）
    vi.restoreAllMocks();
  });

  // ─── 测试 1：disabled 时不调用 fetch ───────────────────────────────────────
  it("disabled 时不调用 fetch", async () => {
    const mockFetch = makePendingFetchMock();
    vi.stubGlobal("fetch", mockFetch);

    const { unmount } = renderHook(() => useWorkspaceWatch(vi.fn(), false));

    // 等一个 tick，确保 effect 已执行
    await act(async () => {});

    expect(mockFetch).not.toHaveBeenCalled();
    unmount();
  });

  // ─── 测试 2：enabled 时会调用 fetch ───────────────────────────────────────
  it("enabled 时挂载后会调用 fetch", async () => {
    const mockFetch = makePendingFetchMock();
    vi.stubGlobal("fetch", mockFetch);

    const { unmount } = renderHook(() => useWorkspaceWatch(vi.fn(), true));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://test/watch",
        expect.objectContaining({ method: "GET" }),
      );
    });

    unmount();
  });

  // ─── 测试 7：最后一个 listener unmount 后断开连接（abort 被调用）──────────
  it("最后一个 listener unmount 后 AbortController.abort 被调用", async () => {
    const mockFetch = makePendingFetchMock();
    vi.stubGlobal("fetch", mockFetch);

    const abortSpy = vi.spyOn(AbortController.prototype, "abort");

    const { unmount } = renderHook(() => useWorkspaceWatch(vi.fn(), true));

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    act(() => {
      unmount();
    });

    expect(abortSpy).toHaveBeenCalled();
  });

  // ─── 测试 8：enabled 从 false 变为 true 时启动连接 ────────────────────────
  it("enabled 从 false 变为 true 时启动连接", async () => {
    const mockFetch = makePendingFetchMock();
    vi.stubGlobal("fetch", mockFetch);

    const { rerender, unmount } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useWorkspaceWatch(vi.fn(), enabled),
      { initialProps: { enabled: false } },
    );

    await act(async () => {});
    expect(mockFetch).not.toHaveBeenCalled();

    rerender({ enabled: true });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://test/watch",
        expect.objectContaining({ method: "GET" }),
      );
    });

    unmount();
  });

  it("Agent 或项目作用域变化时 abort 旧连接并建立新连接", async () => {
    const mockFetch = makePendingFetchMock();
    vi.stubGlobal("fetch", mockFetch);
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");

    const { rerender, unmount } = renderHook(
      ({ agentId, projectRoot }) =>
        useWorkspaceWatch(vi.fn(), true, { agentId, projectRoot }),
      {
        initialProps: { agentId: "agent-a", projectRoot: "/project/one" },
      },
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    const firstSignal = mockFetch.mock.calls[0][1].signal as AbortSignal;

    rerender({ agentId: "agent-b", projectRoot: "/project/two" });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    expect(firstSignal.aborted).toBe(true);
    expect(abortSpy).toHaveBeenCalled();
    expect(mockFetch.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        headers: { "X-Agent-Id": "agent-b" },
      }),
    );
    unmount();
  });

  it("同一作用域的两个 Hook 共享一个连接", async () => {
    const mockFetch = makePendingFetchMock();
    vi.stubGlobal("fetch", mockFetch);
    const scope = { agentId: "agent-a", projectRoot: "/project/one" };

    const first = renderHook(() => useWorkspaceWatch(vi.fn(), true, scope));
    const second = renderHook(() => useWorkspaceWatch(vi.fn(), true, scope));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    first.unmount();
    expect(mockFetch.mock.calls[0][1].signal.aborted).toBe(false);
    second.unmount();
  });
});
