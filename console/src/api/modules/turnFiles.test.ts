// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  download: vi.fn(),
  token: "token-a",
}));
vi.mock("../request", () => ({ request: mocks.request }));
vi.mock("../config", () => ({
  getApiUrl: (path: string) => `/api${path}`,
  getApiToken: () => mocks.token,
}));
vi.mock("../../pages/Chat/sessionApi", () => ({
  default: {
    getSessionIdentity: (id: string) => ({
      sessionId: id.replace("route-", "runtime-"),
    }),
  },
}));
vi.mock("../../utils/downloadFileFromUrl", () => ({
  downloadFileFromUrl: mocks.download,
}));
import {
  turnFilesApi,
  type SessionFilesScope,
  type TurnFileManifest,
} from "./turnFiles";
import { turnFileTarget } from "../../features/files-workspace/turnFileTarget";
const scope: SessionFilesScope = {
  kind: "session",
  agentId: "agent-a",
  sessionId: "route-a",
  chatId: "chat-a",
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.token = "token-a";
  mocks.request.mockResolvedValue({ turns: [] });
});

describe("turnFilesApi", () => {
  it("keeps historical pages and exact-response queries separate in the list cache", async () => {
    const pagedScope = { ...scope, sessionId: "route-pagination" };
    await turnFilesApi.list(pagedScope, { offset: 0, limit: 100 });
    await turnFilesApi.list(pagedScope, { offset: 100, limit: 100 });
    await turnFilesApi.list(pagedScope, { responseId: "response-old" });
    await turnFilesApi.list(pagedScope, { offset: 0, limit: 100 });
    expect(mocks.request).toHaveBeenCalledTimes(3);
    expect(mocks.request.mock.calls.map(([path]) => path)).toEqual([
      expect.stringContaining("offset=0&limit=100"),
      expect.stringContaining("offset=100&limit=100"),
      expect.stringContaining("response_id=response-old"),
    ]);
  });
  it("shares concurrent requests while retaining explicit agent and backend session scope", async () => {
    let finish!: (value: { turns: never[] }) => void;
    mocks.request.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const first = turnFilesApi.list(scope, { refresh: true });
    const second = turnFilesApi.list(scope);
    expect(first).toBe(second);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    expect(mocks.request).toHaveBeenCalledWith(
      "/agents/agent-a/workspace/turn-files?session_id=runtime-a&chat_id=chat-a",
      {
        headers: {
          Authorization: "Bearer token-a",
          "X-Agent-Id": "agent-a",
          "X-Chat-Id": "chat-a",
        },
      },
    );
    finish({ turns: [] });
    await first;
  });

  it("refreshes past an older in-flight request without letting its late result replace new files", async () => {
    const freshScope = { ...scope, sessionId: "route-refresh-race" };
    let finishOld!: (value: { turns: TurnFileManifest[] }) => void;
    mocks.request.mockReturnValueOnce(
      new Promise((resolve) => {
        finishOld = resolve;
      }),
    );
    const older = turnFilesApi.list(freshScope);
    const fresh = { turns: [{ id: "finished-turn" } as TurnFileManifest] };
    mocks.request.mockResolvedValueOnce(fresh);
    expect(await turnFilesApi.list(freshScope, { refresh: true })).toEqual(
      fresh,
    );
    finishOld({ turns: [] });
    await older;
    expect(await turnFilesApi.list(freshScope)).toEqual(fresh);
    expect(mocks.request).toHaveBeenCalledTimes(2);
  });

  it("does not share cached data across authentication changes or conversation identity", async () => {
    await turnFilesApi.list(scope, { refresh: true });
    await turnFilesApi.list(scope);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    mocks.token = "token-b";
    await turnFilesApi.list(scope);
    await turnFilesApi.list({ ...scope, chatId: "chat-b" });
    await turnFilesApi.list({ ...scope, agentId: "agent-b" });
    expect(mocks.request).toHaveBeenCalledTimes(4);
  });

  it("downloads immutable versions using authenticated scoped native download", async () => {
    const file = {
      id: "file+a",
      name: "report.pdf",
    } as TurnFileManifest["files"][number];
    await turnFilesApi.downloadFile(scope, "turn+a", file, "before");
    const [url, filename, options] = mocks.download.mock.calls[0];
    expect(url).toContain(
      "/agents/agent-a/workspace/turn-files/turn%2Ba/files/file%2Ba?",
    );
    expect(url).toContain("session_id=runtime-a");
    expect(url).toContain("version=before&download=true");
    expect(url).toContain("token=token-a");
    expect(filename).toBe("report.pdf");
    expect(options.headers).toMatchObject({
      "X-Agent-Id": "agent-a",
      "X-Chat-Id": "chat-a",
      Authorization: "Bearer token-a",
    });
  });

  it("keeps same-name archives, roots, turns and versions separate from mutable workspace tabs", () => {
    const turn = {
      id: "turn-a",
      session_id: "runtime-a",
      started_at: "2026-10-30T00:00:00Z",
    } as TurnFileManifest;
    const file = {
      id: "file-a",
      root: "project:/extra",
      path: "output/report.md",
      name: "report.md",
      size: 50,
      before_size: 20,
      status: "modified",
      binary: false,
      before_available: true,
      after_available: true,
      delivered: true,
    } as TurnFileManifest["files"][number];
    const after = turnFileTarget(scope, turn, file);
    const before = turnFileTarget(scope, turn, file, "before");
    const next = turnFileTarget(scope, { ...turn, id: "turn-b" }, file);
    expect(after).toMatchObject({
      source: "artifact",
      path: file.path,
      root: file.root,
      size: 50,
    });
    expect(after.artifact?.meta).toMatchObject({
      turnFileArchive: true,
      version: "after",
      startedAt: turn.started_at,
    });
    expect(before.size).toBe(20);
    expect(
      new Set([after.artifact?.id, before.artifact?.id, next.artifact?.id])
        .size,
    ).toBe(3);
    expect(after.artifact?.binaryUrl).toBe(after.artifactUrl);
  });
});
