import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pawappApi, type PawAppInfo } from "../api/modules/pawapp";
import { notifyPluginChange } from "../utils/pluginChangeEvents";
import { useSidebarAppEntries } from "./useSidebarAppEntries";

afterEach(() => vi.restoreAllMocks());

function app(id: string, overrides: Partial<PawAppInfo> = {}): PawAppInfo {
  return {
    id,
    name: id,
    status: "loaded",
    enabled: true,
    loaded: true,
    ...overrides,
  } as PawAppInfo;
}

describe("sidebar app entries", () => {
  it("uses available installed apps and refreshes after install, disable and uninstall", async () => {
    const list = vi.spyOn(pawappApi, "list").mockResolvedValue({
      apps: [
        app("文书"),
        app("disabled", { enabled: false }),
        app("failed", { status: "failed" }),
      ],
      total: 3,
    });
    const view = renderHook(() => useSidebarAppEntries(true));
    await waitFor(() => expect(view.result.current.entries).toHaveLength(1));
    expect(view.result.current.entries[0]).toMatchObject({
      key: "pawapp:文书",
      path: `/apps/${encodeURIComponent("文书")}`,
      label: "文书",
    });
    list.mockResolvedValue({ apps: [app("notes")], total: 1 });
    act(() => notifyPluginChange());
    await waitFor(() =>
      expect(view.result.current.entries[0].key).toBe("pawapp:notes"),
    );
    list.mockResolvedValue({ apps: [], total: 0 });
    act(() => notifyPluginChange());
    await waitFor(() => expect(view.result.current.entries).toHaveLength(0));
  });

  it("ignores stale replies and supports retry after a failed app list request", async () => {
    let resolveOld!: (value: { apps: PawAppInfo[]; total: number }) => void;
    const list = vi
      .spyOn(pawappApi, "list")
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValue({ apps: [app("new")], total: 1 });
    const view = renderHook(() => useSidebarAppEntries(true));
    act(() => notifyPluginChange());
    await waitFor(() =>
      expect(view.result.current.entries[0]?.key).toBe("pawapp:new"),
    );
    await act(async () => resolveOld({ apps: [app("old")], total: 1 }));
    expect(view.result.current.entries[0].key).toBe("pawapp:new");
    list.mockRejectedValueOnce(new Error("offline"));
    act(() => notifyPluginChange());
    await waitFor(() => expect(view.result.current.error).toBe(true));
    expect(view.result.current.entries).toHaveLength(0);
    act(() => view.result.current.retry());
    await waitFor(() => expect(view.result.current.error).toBe(false));
    expect(view.result.current.entries[0].key).toBe("pawapp:new");
  });
});
