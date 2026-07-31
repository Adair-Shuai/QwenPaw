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
  },
}));
vi.mock("@/api/authHeaders", () => ({ buildAuthHeaders }));
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

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("aborts the request when the component unmounts", () => {
    fetchMock.mockImplementation(
      () => new Promise(() => undefined),
    );
    const { unmount } = renderHook(() =>
      useAuthenticatedWorkspaceBlob("result.png", "agent-b"),
    );
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;

    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
