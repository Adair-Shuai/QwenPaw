import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/common_setup";
import i18n from "../../i18n";
import {
  turnFilesApi,
  type TurnFileManifest,
} from "../../api/modules/turnFiles";
import TurnReviewPanel from "./TurnReviewPanel";

vi.mock("../../monacoSetup", () => ({}));
vi.mock("@monaco-editor/react", () => ({
  DiffEditor: ({
    original,
    modified,
  }: {
    original: string;
    modified: string;
  }) => (
    <div data-testid="archive-diff">
      {original} → {modified}
    </div>
  ),
}));
vi.mock("../../api/modules/turnFiles", async (original) => ({
  ...(await original<typeof import("../../api/modules/turnFiles")>()),
  turnFilesApi: {
    list: vi.fn(),
    diff: vi.fn(),
    fileUrl: vi.fn(() => "/archive"),
  },
}));

const scope = {
  kind: "session" as const,
  agentId: "default",
  sessionId: "review",
  chatId: "chat-review",
};
const makeTurn = (id: string): TurnFileManifest => ({
  id,
  session_id: "review",
  agent_id: "default",
  status: "completed",
  started_at: "2026-11-11T10:00:00Z",
  incomplete: false,
  warnings: [],
  overlap: false,
  files: [
    {
      id: `${id}-file`,
      root: "workspace",
      path: `${id}.txt`,
      name: `${id}.txt`,
      status: "modified",
      size: 5,
      binary: false,
      before_available: true,
      after_available: true,
      delivered: false,
      additions: 1,
      deletions: 1,
    },
  ],
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(turnFilesApi.list).mockResolvedValue({
    turns: [makeTurn("new"), makeTurn("old")],
    has_more: true,
  });
  vi.mocked(turnFilesApi.diff).mockResolvedValue({
    before: "archived before",
    after: "archived after",
    truncated: false,
  });
});

it("reviews the selected real archived turn and requests its exact diff instead of current file contents", async () => {
  renderWithProviders(<TurnReviewPanel scope={scope} active />);
  const select = await screen.findByRole("combobox", {
    name: i18n.t("workbench.review.turn"),
  });
  fireEvent.change(select, { target: { value: "old" } });
  fireEvent.click(
    await screen.findByRole("button", {
      name: `${i18n.t("delivery.openWith")} old.txt`,
    }),
  );
  fireEvent.click(
    await screen.findByRole("menuitem", { name: i18n.t("turnFiles.diff") }),
  );
  expect(await screen.findByTestId("archive-diff")).toHaveTextContent(
    "archived before → archived after",
  );
  expect(turnFilesApi.diff).toHaveBeenCalledWith(scope, "old", "old-file");
  fireEvent.click(
    screen.getByRole("button", { name: i18n.t("workbench.review.older") }),
  );
  await waitFor(() =>
    expect(turnFilesApi.list).toHaveBeenLastCalledWith(
      scope,
      expect.objectContaining({ offset: 20, limit: 20 }),
    ),
  );
});

it("shows archive errors and retries the scoped turn history through its normal refresh control", async () => {
  vi.mocked(turnFilesApi.list).mockRejectedValueOnce(new Error("offline"));
  renderWithProviders(<TurnReviewPanel scope={scope} active />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    i18n.t("workbench.review.loadFailed"),
  );
  fireEvent.click(
    screen.getByRole("button", { name: i18n.t("common.refresh") }),
  );
  expect(await screen.findByRole("combobox")).toHaveValue("new");
});

it("shows an empty review for an unsaved chat without requesting a nonexistent archive", async () => {
  renderWithProviders(
    <TurnReviewPanel
      scope={{ kind: "session", agentId: "default", sessionId: "new" }}
      active
    />,
  );
  expect(
    await screen.findByText(i18n.t("workbench.review.empty")),
  ).toBeVisible();
  expect(turnFilesApi.list).not.toHaveBeenCalled();
});
