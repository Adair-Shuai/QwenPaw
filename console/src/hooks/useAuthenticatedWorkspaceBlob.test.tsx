import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";

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

  it("fetches the binary with the Artifact's Agent headers and revokes the URL", async () => {
    const { result, unmount } = renderHook(() =>
      useAuthenticatedWorkspaceBlob("reports/images/result.png", "agent-b"),
    );

    await waitFor(() => expect(result.current).toBe("blob:authenticated"));
    expect(buildAuthHeaders).toHaveBeenCalledWith("agent-b");
    expect(fetchMock).toHaveBeenCalledWith(
      "/binary/reports/images/result.png",
      {
        headers: {
          Authorization: "Bearer test-token",
          "X-Agent-Id": "agent-b",
        },
      },
    );

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:authenticated");
  });
});
