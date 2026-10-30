// @vitest-environment jsdom
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSessionDeliverables } from "./useSessionDeliverables";
import type { ResponseArtifactScope } from "./responseArtifactRegistry";

const api = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock("../../api/modules/turnFiles", () => ({
  turnFilesApi: api,
  TURN_FILES_UPDATED_EVENT: "qwenpaw:turn-files-updated",
}));
vi.mock("./turnFileTarget", () => ({
  turnFileTarget: (
    _scope: unknown,
    _turn: unknown,
    file: { path: string },
  ) => ({ source: "artifact", path: file.path }),
}));
const scope: ResponseArtifactScope = {
  kind: "session",
  agentId: "agent-a",
  sessionId: "session-a",
  chatId: "chat-a",
};
function Probe({
  currentScope = scope,
  active = true,
}: {
  currentScope?: ResponseArtifactScope;
  active?: boolean;
}) {
  const state = useSessionDeliverables(currentScope, active);
  return (
    <>
      <output>{JSON.stringify(state)}</output>
      <button onClick={state.refresh}>refresh</button>
      <button
        onClick={state.loadMore}
        disabled={!state.hasMore || state.loading}
      >
        more
      </button>
    </>
  );
}
function result(path: string) {
  return {
    turns: [
      {
        files: [
          { path, delivered: true, after_available: true, status: "created" },
        ],
      },
    ],
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("persistent session deliverables", () => {
  beforeEach(() => api.list.mockReset());

  it("loads delivered and generated output versions and retains results after a failed refresh", async () => {
    api.list
      .mockResolvedValueOnce({
        turns: [
          {
            files: [
              {
                path: "report.md",
                delivered: true,
                after_available: true,
                status: "created",
              },
              {
                path: "deleted.md",
                delivered: true,
                after_available: true,
                status: "deleted",
              },
              {
                path: "temporary.md",
                delivered: false,
                after_available: true,
                status: "modified",
              },
              {
                path: "output/shell-report.csv",
                delivered: false,
                after_available: true,
                status: "created",
              },
              {
                path: "output/office-report.docx",
                delivered: false,
                after_available: true,
                status: "modified",
              },
              {
                path: "output/deleted.md",
                delivered: false,
                after_available: false,
                status: "deleted",
              },
              {
                path: "unavailable.md",
                delivered: true,
                after_available: false,
                status: "created",
              },
            ],
          },
        ],
      })
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(result("recovered.md"));
    render(<Probe />);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("report.md"),
    );
    expect(screen.getByRole("status")).not.toHaveTextContent("deleted.md");
    expect(screen.getByRole("status")).not.toHaveTextContent("temporary.md");
    expect(screen.getByRole("status")).toHaveTextContent(
      "output/shell-report.csv",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "output/office-report.docx",
    );
    expect(screen.getByRole("status")).not.toHaveTextContent(
      "output/deleted.md",
    );
    expect(screen.getByRole("status")).not.toHaveTextContent("unavailable.md");
    fireEvent.click(screen.getByRole("button", { name: "refresh" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent('"error":true'),
    );
    expect(screen.getByRole("status")).toHaveTextContent("report.md");
    fireEvent.click(screen.getByRole("button", { name: "refresh" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("recovered.md"),
    );
    expect(screen.getByRole("status")).toHaveTextContent('"error":false');
  });

  it("clears the previous scope immediately and ignores its late response", async () => {
    const old = deferred<ReturnType<typeof result>>();
    const next = deferred<ReturnType<typeof result>>();
    api.list.mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise);
    const { rerender } = render(<Probe />);
    rerender(
      <Probe
        currentScope={{ ...scope, sessionId: "session-b", chatId: "chat-b" }}
      />,
    );
    await act(async () => old.resolve(result("other-session.md")));
    expect(screen.getByRole("status")).not.toHaveTextContent(
      "other-session.md",
    );
    await act(async () => next.resolve(result("current-session.md")));
    expect(screen.getByRole("status")).toHaveTextContent("current-session.md");
  });

  it("loads older pages with version deduplication, retries failures and resets on refresh", async () => {
    api.list
      .mockResolvedValueOnce({
        ...result("latest.md"),
        has_more: true,
        next_offset: 100,
      })
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        turns: [...result("latest.md").turns, ...result("older.md").turns],
        has_more: false,
      })
      .mockResolvedValueOnce(result("newest.md"));
    render(<Probe />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "more" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "more" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent('"moreError":true'),
    );
    expect(screen.getByRole("status")).toHaveTextContent("latest.md");
    fireEvent.click(screen.getByRole("button", { name: "more" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("older.md"),
    );
    const state = JSON.parse(screen.getByRole("status").textContent!);
    expect(state.artifacts.map((file: { path: string }) => file.path)).toEqual([
      "latest.md",
      "older.md",
    ]);
    expect(api.list.mock.calls.map((call) => call[1].offset)).toEqual([
      0, 100, 100,
    ]);
    fireEvent.click(screen.getByRole("button", { name: "refresh" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("newest.md"),
    );
    expect(screen.getByRole("status")).not.toHaveTextContent("older.md");
    expect(api.list.mock.calls[3][1].offset).toBe(0);
  });

  it("discards an older history page after switching scope and restarts returning sessions at page zero", async () => {
    const latePage = deferred<ReturnType<typeof result>>();
    api.list
      .mockResolvedValueOnce({
        ...result("first-chat.md"),
        has_more: true,
        next_offset: 100,
      })
      .mockReturnValueOnce(latePage.promise)
      .mockResolvedValueOnce(result("second-chat.md"))
      .mockResolvedValueOnce(result("first-chat-refreshed.md"));
    const { rerender } = render(<Probe />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "more" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "more" }));
    rerender(
      <Probe
        currentScope={{ ...scope, sessionId: "session-b", chatId: "chat-b" }}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("second-chat.md"),
    );
    await act(async () => latePage.resolve(result("late-other-chat.md")));
    expect(screen.getByRole("status")).not.toHaveTextContent(
      "late-other-chat.md",
    );
    rerender(<Probe />);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "first-chat-refreshed.md",
      ),
    );
    expect(api.list.mock.calls.map((call) => call[1].offset)).toEqual([
      0, 100, 0, 0,
    ]);
  });

  it("refreshes on matching turn updates and ignores other scopes or a hidden panel", async () => {
    api.list.mockResolvedValue(result("initial.md"));
    const { rerender } = render(<Probe />);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("initial.md"),
    );
    act(() =>
      window.dispatchEvent(
        new CustomEvent("qwenpaw:turn-files-updated", {
          detail: { ...scope, agentId: "other" },
        }),
      ),
    );
    expect(api.list).toHaveBeenCalledTimes(1);
    act(() =>
      window.dispatchEvent(
        new CustomEvent("qwenpaw:turn-files-updated", { detail: scope }),
      ),
    );
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
    rerender(<Probe active={false} />);
    act(() =>
      window.dispatchEvent(
        new CustomEvent("qwenpaw:turn-files-updated", { detail: scope }),
      ),
    );
    expect(api.list).toHaveBeenCalledTimes(2);
  });

  it.each([100, 99, -1, 100.5])(
    "rejects a non-advancing history cursor %s without losing results and retries the same page",
    async (nextOffset) => {
      api.list
        .mockResolvedValueOnce({
          ...result("latest.md"),
          has_more: true,
          next_offset: 100,
        })
        .mockResolvedValueOnce({
          ...result("invalid-page.md"),
          has_more: true,
          next_offset: nextOffset,
        })
        .mockResolvedValueOnce({ ...result("older.md"), has_more: false });
      render(<Probe />);
      const more = screen.getByRole("button", { name: "more" });
      await waitFor(() => expect(more).toBeEnabled());
      fireEvent.click(more);
      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(
          '"moreError":true',
        ),
      );
      expect(screen.getByRole("status")).toHaveTextContent("latest.md");
      expect(screen.getByRole("status")).not.toHaveTextContent(
        "invalid-page.md",
      );
      expect(more).toBeEnabled();
      fireEvent.click(more);
      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent("older.md"),
      );
      expect(screen.getByRole("status")).toHaveTextContent('"error":false');
      expect(more).toBeDisabled();
      expect(api.list.mock.calls.map((call) => call[1].offset)).toEqual([
        0, 100, 100,
      ]);
    },
  );

  it("discards an in-flight history page when a turn update refreshes the first page", async () => {
    const latePage = deferred<ReturnType<typeof result>>();
    api.list
      .mockResolvedValueOnce({
        ...result("latest.md"),
        has_more: true,
        next_offset: 100,
      })
      .mockReturnValueOnce(latePage.promise)
      .mockResolvedValueOnce(result("new-turn.md"));
    render(<Probe />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "more" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "more" }));
    act(() =>
      window.dispatchEvent(
        new CustomEvent("qwenpaw:turn-files-updated", { detail: scope }),
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("new-turn.md"),
    );
    await act(async () => latePage.resolve(result("stale-older.md")));
    expect(screen.getByRole("status")).not.toHaveTextContent("stale-older.md");
    expect(screen.getByRole("status")).not.toHaveTextContent("latest.md");
    expect(api.list.mock.calls.map((call) => call[1].offset)).toEqual([
      0, 100, 0,
    ]);
    expect(api.list.mock.calls[2][1].refresh).toBe(true);
  });

  it("ignores a pending response while hidden and reloads from the server when reopened", async () => {
    const pending = deferred<ReturnType<typeof result>>();
    api.list
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(result("reopened.md"));
    const view = render(<Probe />);
    view.rerender(<Probe active={false} />);
    await act(async () => pending.resolve(result("hidden-late.md")));
    expect(screen.getByRole("status")).not.toHaveTextContent("hidden-late.md");
    expect(api.list).toHaveBeenCalledTimes(1);
    view.rerender(<Probe />);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("reopened.md"),
    );
    expect(api.list).toHaveBeenCalledTimes(2);
  });
});
