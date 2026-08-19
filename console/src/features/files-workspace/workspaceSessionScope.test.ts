import { beforeEach, describe, expect, it, vi } from "vitest";

const getRealIdForSession = vi.fn((id: string) =>
  id.startsWith("known-") ? "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" : null,
);

vi.mock("../../pages/Chat/sessionApi", () => ({
  default: {
    lastActiveChatId: "known-last-active",
    getRealIdForSession: (id: string) => getRealIdForSession(id),
  },
}));

vi.mock("../project-directory/pendingProjectDirectory", () => ({
  getPendingProjectDirectory: vi.fn(),
}));

import sessionApi from "../../pages/Chat/sessionApi";
import { getPendingProjectDirectory } from "../project-directory/pendingProjectDirectory";
import {
  resolveBackendChatId,
  resolveWorkspaceSessionScope,
} from "./workspaceSessionScope";

const pendingDir = vi.mocked(getPendingProjectDirectory);

describe("resolveBackendChatId", () => {
  beforeEach(() => {
    getRealIdForSession.mockClear();
  });

  it("returns the mapped backend id", () => {
    expect(resolveBackendChatId("known-chat")).toBe(
      "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    );
  });

  it("accepts a backend UUID that is not yet in the session list", () => {
    expect(resolveBackendChatId("11111111-2222-4333-8444-555555555555")).toBe(
      "11111111-2222-4333-8444-555555555555",
    );
  });

  it("omits unpersisted local timestamp ids", () => {
    expect(resolveBackendChatId("1785114733908-0l0jmai")).toBeUndefined();
  });
});

describe("resolveWorkspaceSessionScope", () => {
  beforeEach(() => {
    getRealIdForSession.mockClear();
    pendingDir.mockReset();
    sessionApi.lastActiveChatId = "known-last-active";
  });

  it("sends X-Chat-Id for a persisted session and ignores pending dirs", () => {
    pendingDir.mockReturnValue("/tmp/pending");
    expect(
      resolveWorkspaceSessionScope({
        selectedAgent: "agent-a",
        pathname: "/chat/known-chat",
      }),
    ).toEqual({
      sessionId: "known-chat",
      chatId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    });
  });

  it("sends the pending project dir instead of a local session id", () => {
    pendingDir.mockReturnValue("/tmp/pending-project");
    expect(
      resolveWorkspaceSessionScope({
        selectedAgent: "agent-a",
        pathname: "/chat/1785114733908-0l0jmai",
      }),
    ).toEqual({
      sessionId: "1785114733908-0l0jmai",
      projectDirOverride: "/tmp/pending-project",
    });
  });
});
