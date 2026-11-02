// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  SessionFilesScope,
  TurnFileDiff,
  TurnFileManifest,
} from "../../api/modules/turnFiles";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  diff: vi.fn(),
  downloadFile: vi.fn(),
  downloadBundle: vi.fn(),
}));
vi.mock("../../api/modules/turnFiles", () => ({
  TURN_FILES_UPDATED_EVENT: "qwenpaw:turn-files-updated",
  turnFilesSessionId: (scope: SessionFilesScope) =>
    scope.sessionId.replace("route-", "runtime-"),
  turnFilesApi: {
    ...mocks,
    fileUrl: (
      scope: SessionFilesScope,
      turn: string,
      file: string,
      version: string,
    ) =>
      `/api/agents/${scope.agentId}/workspace/turn-files/${turn}/files/${file}?version=${version}&session_id=${scope.sessionId}`,
  },
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count == null ? key : `${key}:${options.count}`,
  }),
}));
vi.mock("./TurnFileDiffViewer", () => ({
  default: ({ diff }: { diff: TurnFileDiff }) => (
    <div data-testid="read-only-diff">
      {diff.before} → {diff.after}
    </div>
  ),
}));
import TurnFileSummary from "./TurnFileSummary";

const scope: SessionFilesScope = {
  kind: "session",
  agentId: "agent-a",
  sessionId: "route-a",
  chatId: "chat-a",
};
function manifest(patch: Partial<TurnFileManifest> = {}): TurnFileManifest {
  return {
    id: "turn-a",
    response_id: "response-real-a",
    client_message_id: "client-a",
    session_id: "runtime-a",
    agent_id: "agent-a",
    status: "completed",
    started_at: "2026-10-30T10:00:00Z",
    finished_at: "2026-10-30T10:01:00Z",
    incomplete: false,
    warnings: [],
    overlap: false,
    files: [
      {
        id: "file-a",
        root: "project",
        path: "output/report.md",
        name: "report.md",
        status: "modified",
        size: 20,
        before_size: 10,
        binary: false,
        additions: 3,
        deletions: 1,
        before_available: true,
        after_available: true,
        delivered: true,
      },
    ],
    ...patch,
  };
}
function renderSummary(
  props: Partial<React.ComponentProps<typeof TurnFileSummary>> = {},
) {
  return render(
    <TurnFileSummary
      scope={scope}
      responseId="response-real-a"
      clientMessageId="client-a"
      completed
      fallback={<p>legacy file hints</p>}
      {...props}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.list.mockResolvedValue({ turns: [manifest()] });
  mocks.downloadFile.mockResolvedValue(undefined);
  mocks.downloadBundle.mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("TurnFileSummary", () => {
  it("shows delivered images inline and links archived sibling pages without inventing deliveries", async () => {
    const image = {
      ...manifest().files[0],
      id: "image",
      name: "preview.png",
      path: "design/preview.png",
      binary: true,
    };
    const page = {
      ...image,
      id: "html",
      name: "index.html",
      path: "design/index.html",
      binary: false,
      delivered: false,
    };
    const unrelated = { ...page, id: "unrelated", path: "another/index.html" };
    const missing = {
      ...page,
      id: "missing",
      name: "missing.html",
      path: "design/missing.html",
      after_available: false,
    };
    mocks.list.mockResolvedValue({
      turns: [manifest({ files: [image, page, unrelated, missing] })],
    });
    const open = vi.fn();
    window.addEventListener("qwenpaw:open-file-preview", open);
    try {
      renderSummary();
      const thumbnail = await screen.findByRole("img", { name: "preview.png" });
      expect(thumbnail).toHaveAttribute(
        "src",
        expect.stringContaining("turn-a/files/image?version=after"),
      );
      expect(screen.getByText("turnFiles.deliveredCount:1")).toBeVisible();
      const pages = screen.getByRole("navigation", {
        name: "turnFiles.relatedPages",
      });
      expect(within(pages).getAllByRole("button")).toHaveLength(1);
      fireEvent.click(
        within(pages).getByRole("button", {
          name: "turnFiles.openRelatedPage index.html",
        }),
      );
      expect(open.mock.calls[0][0].detail.target.artifact.meta).toMatchObject({
        turnFileArchive: true,
        fileId: "html",
        turnSessionId: "runtime-a",
      });
      fireEvent.click(
        screen.getByRole("button", {
          name: "turnFiles.previewImage preview.png",
        }),
      );
      expect(open.mock.calls[1][0].detail.target.artifact.meta.fileId).toBe(
        "image",
      );
      fireEvent.error(thumbnail);
      expect(screen.getByText("turnFiles.imagePreviewFailed")).toBeVisible();
      expect(
        screen.getByRole("button", {
          name: "turnFiles.openArchive preview.png",
        }),
      ).toBeEnabled();
      expect(
        screen.getByRole("button", { name: "turnFiles.download preview.png" }),
      ).toBeEnabled();
    } finally {
      window.removeEventListener("qwenpaw:open-file-preview", open);
    }
  });

  it("prioritizes deliveries and keeps secondary archived changes accessible after expansion", async () => {
    const delivered = manifest().files[0];
    const removed = {
      ...delivered,
      id: "removed",
      name: "old.md",
      path: "old.md",
      status: "deleted" as const,
      delivered: false,
      after_available: false,
    };
    mocks.list.mockResolvedValue({
      turns: [manifest({ files: [removed, delivered] })],
    });
    mocks.diff.mockResolvedValue({
      before: "old",
      after: "",
      truncated: false,
    });
    renderSummary();
    const primary = await screen.findByRole("button", {
      name: "turnFiles.openArchive report.md",
    });
    expect(primary).toBeVisible();
    const secondary = screen
      .getByText("turnFiles.otherChanges")
      .closest("details")!;
    const before = within(secondary).getByText("old.md");
    expect(before).not.toBeVisible();
    fireEvent.click(within(secondary).getByText("turnFiles.otherChanges"));
    expect(before).toBeVisible();
    expect(
      within(secondary).queryByRole("button", {
        name: "turnFiles.openCurrent old.md",
      }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(secondary).getByRole("button", { name: "turnFiles.diff old.md" }),
    );
    expect(await screen.findByTestId("read-only-diff")).toHaveTextContent(
      "old →",
    );
    fireEvent.click(within(secondary).getByText("turnFiles.otherChanges"));
    expect(screen.getByTestId("read-only-diff")).not.toBeVisible();
    fireEvent.click(within(secondary).getByText("turnFiles.otherChanges"));
    expect(screen.getByTestId("read-only-diff")).toBeVisible();
    expect(mocks.diff).toHaveBeenCalledTimes(1);
    fireEvent.click(
      within(secondary).getByRole("button", {
        name: "turnFiles.downloadBefore old.md",
      }),
    );
    await waitFor(() =>
      expect(mocks.downloadFile).toHaveBeenCalledWith(
        { ...scope, sessionId: "runtime-a" },
        "turn-a",
        removed,
        "before",
      ),
    );
  });

  it("expands delivery and change lists independently without hiding unavailable deliveries", async () => {
    const file = manifest().files[0];
    const changes = Array.from({ length: 7 }, (_, index) => ({
      ...file,
      id: `change-${index}`,
      name: `change-${index}.md`,
      delivered: false,
    }));
    const deliveries = Array.from({ length: 7 }, (_, index) => ({
      ...file,
      id: `delivery-${index}`,
      name: `delivery-${index}.md`,
      after_available: index !== 0,
    }));
    mocks.list.mockResolvedValue({
      turns: [manifest({ files: [...changes, ...deliveries] })],
    });
    renderSummary();
    expect(
      await screen.findByRole("button", {
        name: "turnFiles.openArchive delivery-0.md",
      }),
    ).toBeDisabled();
    expect(screen.getByText("turnFiles.unavailable")).toBeVisible();
    expect(screen.queryByText("delivery-6.md")).not.toBeInTheDocument();
    const expandDeliveries = screen
      .getAllByRole("button", { name: "turnFiles.showAll:7" })
      .find((button) => !button.closest("details"))!;
    fireEvent.click(expandDeliveries);
    expect(screen.getByText("delivery-6.md")).toBeVisible();
    const secondary = screen
      .getByText("turnFiles.otherChanges")
      .closest("details")!;
    fireEvent.click(within(secondary).getByText("turnFiles.otherChanges"));
    expect(screen.queryByText("change-6.md")).not.toBeInTheDocument();
    fireEvent.click(
      within(secondary).getByRole("button", { name: "turnFiles.showAll:7" }),
    );
    expect(screen.getByText("change-6.md")).toBeVisible();
    fireEvent.click(expandDeliveries);
    expect(screen.queryByText("delivery-6.md")).not.toBeInTheDocument();
    expect(screen.getByText("change-6.md")).toBeVisible();
  });

  it("does not represent unknown line counts as zero changes", async () => {
    const turn = manifest();
    turn.files[0] = {
      ...turn.files[0],
      additions: undefined,
      deletions: undefined,
    };
    mocks.list.mockResolvedValue({ turns: [turn] });
    renderSummary();
    await screen.findByRole("region", { name: "turnFiles.title" });
    expect(
      screen.queryByLabelText("turnFiles.lineChanges"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("+0")).not.toBeInTheDocument();
  });

  it("keeps polling an empty running manifest after the chat response ends", async () => {
    vi.useFakeTimers();
    mocks.list
      .mockResolvedValueOnce({
        turns: [manifest({ status: "running", files: [] })],
      })
      .mockResolvedValue({ turns: [manifest({ status: "cancelled" })] });
    renderSummary();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByText("legacy file hints")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("turnFiles.capturing");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(
      screen.getByRole("region", { name: "turnFiles.title" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("legacy file hints")).not.toBeInTheDocument();
    expect(screen.getByText("turnFiles.interrupted")).toBeInTheDocument();
    expect(screen.queryByText("turnFiles.capturing")).not.toBeInTheDocument();
  });

  it("offers a real retry when capture is still running after bounded polling", async () => {
    vi.useFakeTimers();
    mocks.list.mockResolvedValue({
      turns: [manifest({ status: "running", files: [] })],
    });
    renderSummary();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    expect(mocks.list).toHaveBeenCalledTimes(6);
    expect(screen.getByText("legacy file hints")).toBeInTheDocument();
    mocks.list.mockResolvedValue({ turns: [manifest()] });
    fireEvent.click(screen.getByRole("button", { name: "turnFiles.retry" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(
      screen.getByRole("region", { name: "turnFiles.title" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("turnFiles.capturing")).not.toBeInTheDocument();
    expect(mocks.list).toHaveBeenLastCalledWith(scope, {
      refresh: true,
      responseId: "response-real-a",
    });
  });
  it("waits for a completed turn before looking for an authoritative manifest", async () => {
    const view = renderSummary({ completed: false });
    expect(screen.getByText("legacy file hints")).toBeInTheDocument();
    expect(mocks.list).not.toHaveBeenCalled();
    view.rerender(
      <TurnFileSummary
        scope={scope}
        responseId="response-real-a"
        completed
        fallback="legacy file hints"
      />,
    );
    expect(
      await screen.findByRole("region", { name: "turnFiles.title" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("legacy file hints")).not.toBeInTheDocument();
  });

  it("opens the immutable version and current file through distinct scoped native targets", async () => {
    const preview = vi.fn();
    window.addEventListener("qwenpaw:open-file-preview", preview);
    try {
      renderSummary();
      fireEvent.click(
        await screen.findByRole("button", {
          name: "turnFiles.openArchive report.md",
        }),
      );
      const historical = (preview.mock.calls[0][0] as CustomEvent).detail;
      expect(historical).toMatchObject({
        agentId: "agent-a",
        sessionId: "route-a",
        chatId: "chat-a",
        target: {
          source: "artifact",
          path: "output/report.md",
          root: "project",
          artifact: {
            sessionId: "runtime-a",
            meta: { turnFileArchive: true, version: "after" },
          },
        },
      });
      expect(historical.target.artifactUrl).toContain(
        "/turn-a/files/file-a?version=after",
      );
      fireEvent.click(
        screen.getByRole("button", { name: "turnFiles.openCurrent report.md" }),
      );
      expect((preview.mock.calls[1][0] as CustomEvent).detail).toMatchObject({
        sessionId: "route-a",
        target: {
          source: "workspace",
          path: "output/report.md",
          root: "project",
        },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "turnFiles.download report.md" }),
      );
      await waitFor(() =>
        expect(mocks.downloadFile).toHaveBeenCalledWith(
          { ...scope, sessionId: "runtime-a" },
          "turn-a",
          manifest().files[0],
          "after",
        ),
      );
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "turnFiles.downloadTurn" }),
        ).toBeEnabled(),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "turnFiles.downloadTurn" }),
      );
      expect(mocks.downloadBundle).toHaveBeenCalledWith(
        { ...scope, sessionId: "runtime-a" },
        "turn-a",
      );
      expect(
        screen.getByText("turnFiles.deliveredCount:1"),
      ).toBeInTheDocument();
    } finally {
      window.removeEventListener("qwenpaw:open-file-preview", preview);
    }
  });

  it("labels deleted versions and never offers to open their current workspace file", async () => {
    const turn = manifest();
    turn.files[0] = {
      ...turn.files[0],
      status: "deleted",
      after_available: false,
      delivered: false,
    };
    mocks.list.mockResolvedValue({ turns: [turn] });
    renderSummary();
    expect(
      await screen.findByText("turnFiles.beforeVersion"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "turnFiles.openCurrent report.md" }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "turnFiles.downloadBefore report.md",
      }),
    );
    expect(mocks.downloadFile).toHaveBeenCalledWith(
      expect.anything(),
      "turn-a",
      turn.files[0],
      "before",
    );
  });

  it("does not offer unavailable archives or text comparisons for binary files", async () => {
    const turn = manifest();
    turn.files[0] = {
      ...turn.files[0],
      binary: true,
      before_available: false,
      after_available: false,
    };
    turn.incomplete = true;
    turn.overlap = true;
    turn.warnings = ["File exceeded the capture limit"];
    mocks.list.mockResolvedValue({ turns: [turn] });
    renderSummary();
    expect(await screen.findByText("turnFiles.incomplete")).toBeInTheDocument();
    expect(screen.getByText("turnFiles.overlap")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "turnFiles.openArchive report.md" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: "turnFiles.download report.md",
      }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "turnFiles.diff report.md" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("File exceeded the capture limit"),
    ).toBeInTheDocument();
  });

  it("never matches another attempt, agent, or session by a shared client message ID", async () => {
    mocks.list.mockResolvedValue({
      turns: [
        manifest({ response_id: "response-other" }),
        manifest({ agent_id: "other-agent" }),
        manifest({ session_id: "runtime-other" }),
      ],
    });
    renderSummary();
    await waitFor(() => expect(mocks.list).toHaveBeenCalled());
    expect(screen.getByText("legacy file hints")).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("uses a client message identity for old history with a synthesized response ID", async () => {
    renderSummary({ responseId: "response_1730000000000-abc123" });
    expect(
      await screen.findByRole("region", { name: "turnFiles.title" }),
    ).toBeInTheDocument();
  });

  it("drops late list results after switching conversations", async () => {
    let resolveOld!: (value: { turns: TurnFileManifest[] }) => void;
    mocks.list
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
      )
      .mockResolvedValue({ turns: [] });
    const view = renderSummary();
    view.rerender(
      <TurnFileSummary
        scope={{ ...scope, sessionId: "route-b", chatId: "chat-b" }}
        responseId="response-real-b"
        completed
        fallback="other conversation"
      />,
    );
    await act(async () => {
      resolveOld({ turns: [manifest()] });
    });
    expect(screen.getByText("other conversation")).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("retries temporary list failures but bounds polling for pre-feature history", async () => {
    vi.useFakeTimers();
    mocks.list.mockRejectedValue(new Error("temporarily unavailable"));
    renderSummary();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    expect(mocks.list).toHaveBeenCalledTimes(6);
    expect(screen.getByText("legacy file hints")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "turnFiles.captureFailed",
    );
    expect(
      screen.getByRole("button", { name: "turnFiles.retry" }),
    ).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(mocks.list).toHaveBeenCalledTimes(6);
  });

  it("recovers an initially missing archive after capture finishes", async () => {
    vi.useFakeTimers();
    mocks.list
      .mockResolvedValueOnce({ turns: [] })
      .mockResolvedValue({ turns: [manifest()] });
    renderSummary();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });
    expect(
      screen.getByRole("region", { name: "turnFiles.title" }),
    ).toBeInTheDocument();
    expect(mocks.list).toHaveBeenLastCalledWith(scope, {
      responseId: "response-real-a",
    });
  });

  it("loads a read-only comparison on demand and retries a failed comparison", async () => {
    mocks.diff.mockRejectedValueOnce(new Error("busy")).mockResolvedValue({
      before: "old text",
      after: "new text",
      truncated: true,
    });
    renderSummary();
    fireEvent.click(
      await screen.findByRole("button", { name: "turnFiles.diff report.md" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "turnFiles.diffFailed",
    );
    fireEvent.click(screen.getByRole("button", { name: "turnFiles.retry" }));
    expect(await screen.findByTestId("read-only-diff")).toHaveTextContent(
      "old text → new text",
    );
    expect(screen.getByText("turnFiles.diffTruncated")).toBeInTheDocument();
    expect(mocks.diff).toHaveBeenLastCalledWith(
      { ...scope, sessionId: "runtime-a" },
      "turn-a",
      "file-a",
    );
  });

  it("discards a comparison response after its file was collapsed", async () => {
    let resolveDiff!: (value: TurnFileDiff) => void;
    mocks.diff.mockReturnValue(
      new Promise((resolve) => {
        resolveDiff = resolve;
      }),
    );
    renderSummary();
    const button = await screen.findByRole("button", {
      name: "turnFiles.diff report.md",
    });
    fireEvent.click(button);
    fireEvent.click(button);
    await act(async () => {
      resolveDiff({ before: "old", after: "new", truncated: false });
    });
    expect(screen.queryByTestId("read-only-diff")).not.toBeInTheDocument();
  });

  it("replaces misleading legacy hints even when the captured turn has no file changes", async () => {
    mocks.list.mockResolvedValue({ turns: [manifest({ files: [] })] });
    const { container } = renderSummary();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
