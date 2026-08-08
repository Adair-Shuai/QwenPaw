import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";

const { buildAuthHeaders } = vi.hoisted(() => ({
  buildAuthHeaders: vi.fn((agentId?: string) => ({
    Authorization: "Bearer test-token",
    "X-Agent-Id": agentId ?? "current",
  })),
}));

vi.mock("@/api/modules/workspace", () => ({
  workspaceApi: {
    getBinaryFileUrl: (path: string) => `/binary/${path}`,
    getFileDownloadUrl: (path: string, root: string) =>
      `/download?path=${encodeURIComponent(path)}&root=${root}`,
  },
}));
vi.mock("@/api/modules/chat", () => ({
  chatApi: {
    filePreviewUrl: (path: string) =>
      `/preview/${encodeURIComponent(path.replace(/^file:\/\//, ""))}`,
  },
}));
vi.mock("@/api/authHeaders", () => ({
  buildAuthHeaders,
  buildWorkspaceScopeHeaders: ({
    agentId,
    chatId,
    projectDirOverride,
  }: {
    agentId?: string;
    chatId?: string;
    projectDirOverride?: string;
  } = {}) => ({
    ...buildAuthHeaders(agentId),
    ...(chatId ? { "X-Chat-Id": chatId } : {}),
    ...(!chatId && projectDirOverride
      ? { "X-Session-Project-Dir": projectDirOverride }
      : {}),
  }),
}));
vi.mock("@/utils/openExternalLink", () => ({
  isDesktopTauriRuntime: () => false,
}));

import { useAuthenticatedWorkspaceBlob } from "./useAuthenticatedWorkspaceBlob";

describe("useAuthenticatedWorkspaceBlob", () => {
  const fetchMock = vi.fn();
  const createObjectURL = vi.fn(() => "blob:authenticated");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["image"])),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    buildAuthHeaders.mockClear();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("loads with the owning Agent headers and revokes the Object URL", async () => {
    const { result, unmount } = renderHook(() =>
      useAuthenticatedWorkspaceBlob("reports/images/result.png", "agent-b"),
    );

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.url).toBe("blob:authenticated");
    expect(buildAuthHeaders).toHaveBeenCalledWith("agent-b");
    expect(fetchMock).toHaveBeenCalledWith(
      "/binary/reports/images/result.png",
      {
        headers: {
          Authorization: "Bearer test-token",
          "X-Agent-Id": "agent-b",
        },
        signal: expect.any(AbortSignal),
      },
    );

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:authenticated");
  });

  it("exposes HTTP errors and retries the authenticated request", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: () => Promise.resolve({ detail: "Invalid token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(new Blob(["image"])),
      });
    const { result } = renderHook(() =>
      useAuthenticatedWorkspaceBlob("result.png", "agent-b"),
    );

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error?.message).toBe("401: Invalid token");

    const callsBeforeRetry = fetchMock.mock.calls.length;
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
  });

  it("aborts the request when the component unmounts", () => {
    fetchMock.mockImplementation(() => new Promise(() => undefined));
    const { unmount } = renderHook(() =>
      useAuthenticatedWorkspaceBlob("result.png", "agent-b"),
    );
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const signal = lastCall[1].signal as AbortSignal;

    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("routes absolute local paths through the authenticated file preview API", async () => {
    const absolutePath = "/Users/lzw/Documents/文件预览测试/测试图片.jpg";
    const { result } = renderHook(() =>
      useAuthenticatedWorkspaceBlob(absolutePath, {
        agentId: "agent-b",
        chatId: "chat-1",
        root: "project",
      }),
    );

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(fetchMock).toHaveBeenCalledWith(
      `/preview/${encodeURIComponent(absolutePath)}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Agent-Id": "agent-b",
          "X-Chat-Id": "chat-1",
        }),
      }),
    );
  });

  it("keeps relative workspace paths on the scoped download endpoint", async () => {
    const { result } = renderHook(() =>
      useAuthenticatedWorkspaceBlob("images/result.png", {
        agentId: "agent-b",
        root: "workspace",
      }),
    );

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/download?path=images%2Fresult.png&root=workspace",
      expect.any(Object),
    );
  });
});
