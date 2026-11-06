import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { ChatRunLifecycle } from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Execution/runLifecycle";
import { request } from "../../api/request";
import {
  getQueuedAgentMentionContext,
  getSubmittedAgentMention,
} from "./agentMentionSubmission";
import {
  useMessageQueueStore,
  withBackgroundSendLock,
  withSendLock,
} from "../../stores/messageQueueStore";
import {
  awaitInChatScope,
  awaitQueueAcceptance,
  recoverSendingQueueHead,
  waitForChatIdle,
  yieldQueueReadinessWaits,
} from "./chatRunLifecycle";
import {
  clearBackgroundAbortIfCurrent,
  getBackgroundAbort,
  setBackgroundAbort,
  stopBackgroundQueue,
} from "./backgroundQueueRegistry";
vi.mock("../../api/request", () => ({ request: vi.fn() }));
const key = "chat-a";
function run() {
  return new ChatRunLifecycle({
    runId: "run-a",
    source: "host-queue",
    sessionId: key,
    cancel: vi.fn(),
  });
}
function sendingHead() {
  const store = useMessageQueueStore.getState();
  store.enqueue(key, { text: "first", agentId: "agent-a" });
  store.enqueue(key, { text: "second", agentId: "agent-a" });
  const head = store.getQueue(key)[0];
  store.setItemStatus(key, head.id, "sending");
  return head;
}
beforeEach(() => {
  localStorage.clear();
  useMessageQueueStore.setState({
    queues: {},
    runStates: {},
    currentSendingId: null,
  });
  vi.mocked(request).mockReset();
});
afterEach(() => vi.unstubAllGlobals());

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe("chat scope cancellation", () => {
  it("rejects promptly without waiting for a pending operation, and consumes its late rejection", async () => {
    const controller = new AbortController();
    const operation = deferred<void>();
    const pending = awaitInChatScope(operation.promise, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    operation.reject(new Error("late network failure"));
    // The promise is already observed by awaitInChatScope; Vitest would report
    // an unhandled rejection if the cancellation path detached its handler.
    await Promise.resolve();
  });

  it("does not accept a resolved value when abort wins before its continuation", async () => {
    const controller = new AbortController();
    const pending = awaitInChatScope(
      Promise.resolve("headers"),
      controller.signal,
    );
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("cleans its listener after normal success and propagates non-abort failure", async () => {
    const controller = new AbortController();
    const add = vi.spyOn(controller.signal, "addEventListener");
    const remove = vi.spyOn(controller.signal, "removeEventListener");
    await expect(
      awaitInChatScope(Promise.resolve("ok"), controller.signal),
    ).resolves.toBe("ok");
    expect(remove).toHaveBeenCalledWith("abort", add.mock.calls[0][1]);
    await expect(
      awaitInChatScope(Promise.reject(new Error("offline")), controller.signal),
    ).rejects.toThrow("offline");
    expect(remove).toHaveBeenCalledWith("abort", add.mock.calls[1][1]);
    add.mockRestore();
    remove.mockRestore();
  });
});

describe("steering yields queue readiness without cancelling the active run", () => {
  it("releases a pending readiness GET and gives the explicit steering claim the next send lock", async () => {
    const locks = new Map<string, Promise<void>>();
    vi.stubGlobal("navigator", {
      locks: {
        request: async (
          name: string,
          options: { ifAvailable?: boolean },
          callback: (lock: unknown) => Promise<unknown>,
        ) => {
          if (options.ifAvailable && locks.has(name)) return callback(null);
          const previous = locks.get(name) ?? Promise.resolve();
          let release!: () => void;
          const own = new Promise<void>((resolve) => {
            release = resolve;
          });
          locks.set(name, own);
          await previous;
          try {
            return await callback({ name });
          } finally {
            release();
            if (locks.get(name) === own) locks.delete(name);
          }
        },
      },
    });
    const reply = deferred<{ status: string; messages: never[] }>();
    vi.mocked(request).mockReturnValue(reply.promise);
    const caller = new AbortController();
    const waiting = withSendLock(key, () =>
      waitForChatIdle(key, caller.signal, "agent-a", key),
    );
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    const querySignal = vi.mocked(request).mock.calls[0][1]!
      .signal as AbortSignal;
    expect(querySignal).not.toBe(caller.signal);
    expect(await withSendLock(key, () => "automatic send")).toBeNull();

    yieldQueueReadinessWaits(key);
    const steeringClaim = withSendLock(key, () => "steering claimed", {
      wait: true,
    });
    await expect(waiting).resolves.toBe(false);
    await expect(steeringClaim).resolves.toBe("steering claimed");
    expect(querySignal.aborted).toBe(true);
    expect(caller.signal.aborted).toBe(false);
    expect(locks.size).toBe(0);
    reply.reject(new Error("late response after readiness was yielded"));
    await Promise.resolve();
  });

  it("yields only the requested queue and unregisters completed readiness scopes", async () => {
    const replyA = deferred<{ status: string; messages: never[] }>();
    const replyB = deferred<{ status: string; messages: never[] }>();
    vi.mocked(request)
      .mockReturnValueOnce(replyA.promise)
      .mockReturnValueOnce(replyB.promise);
    const callerA = new AbortController();
    const callerB = new AbortController();
    const add = vi.spyOn(callerB.signal, "addEventListener");
    const remove = vi.spyOn(callerB.signal, "removeEventListener");
    const waitingA = waitForChatIdle(
      "chat-a",
      callerA.signal,
      "agent-a",
      "queue-a",
    );
    const waitingB = waitForChatIdle(
      "chat-b",
      callerB.signal,
      "agent-b",
      "queue-b",
    );
    const signalA = vi.mocked(request).mock.calls[0][1]!.signal as AbortSignal;
    const signalB = vi.mocked(request).mock.calls[1][1]!.signal as AbortSignal;
    yieldQueueReadinessWaits("queue-a");
    await expect(waitingA).resolves.toBe(false);
    expect(signalA.aborted).toBe(true);
    expect(signalB.aborted).toBe(false);
    replyB.resolve({ status: "idle", messages: [] });
    await expect(waitingB).resolves.toBe(true);
    yieldQueueReadinessWaits("queue-b");
    expect(signalB.aborted).toBe(false);
    expect(callerA.signal.aborted).toBe(false);
    expect(callerB.signal.aborted).toBe(false);
    expect(remove).toHaveBeenCalledWith("abort", add.mock.calls[0][1]);
    add.mockRestore();
    remove.mockRestore();
    replyA.resolve({ status: "idle", messages: [] });
  });

  it("releases the polling delay immediately and permits the next independent idle check", async () => {
    vi.useFakeTimers();
    try {
      vi.mocked(request).mockResolvedValue({ status: "running", messages: [] });
      const caller = new AbortController();
      const waiting = waitForChatIdle(key, caller.signal, "agent-a", key);
      await Promise.resolve();
      await Promise.resolve();
      expect(vi.getTimerCount()).toBe(1);
      yieldQueueReadinessWaits(key);
      await expect(waiting).resolves.toBe(false);
      expect(vi.getTimerCount()).toBe(0);
      expect(caller.signal.aborted).toBe(false);
      vi.mocked(request).mockResolvedValue({ status: "idle", messages: [] });
      await expect(
        waitForChatIdle(key, caller.signal, "agent-a", key),
      ).resolves.toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("leaves an unresolved sending marker intact when steering yields its receipt readiness wait", async () => {
    const head = sendingHead();
    const reply = deferred<{ status: string; messages: unknown[] }>();
    vi.mocked(request).mockReturnValue(reply.promise);
    const caller = new AbortController();
    const recovering = recoverSendingQueueHead(
      key,
      caller.signal,
      "agent-a",
      key,
      "not a send failure",
    );
    yieldQueueReadinessWaits(key);
    await recovering;
    expect(useMessageQueueStore.getState().getQueue(key)[0]).toMatchObject({
      id: head.id,
      status: "sending",
      retryCount: 0,
    });
    expect(useMessageQueueStore.getState().getRunState(key)).toBe("idle");
    expect(caller.signal.aborted).toBe(false);
    reply.resolve({
      status: "idle",
      messages: [
        {
          role: "user",
          metadata: { qwenpaw_client_message_id: head.clientMessageId },
        },
      ],
    });
    await Promise.resolve();
    expect(useMessageQueueStore.getState().getQueue(key)[0].id).toBe(head.id);
  });
});

/**
 * Execute the actual private startBackgroundQueue body, without mounting the
 * whole ChatPage or exporting test-only production APIs. TypeScript AST
 * extraction avoids a copied worker implementation or fragile line offsets.
 * Only transport/payload/UI glue is injected. Scope cancellation, queue store,
 * both lock wrappers, idle polling and abort registry are production code.
 * This is a worker protocol test, not browser/Web Locks/backend E2E.
 */
const chatSource = ts.createSourceFile(
  "index.tsx",
  readFileSync(join(process.cwd(), "src/pages/Chat/index.tsx"), "utf8"),
  ts.ScriptTarget.ES2020,
  true,
  ts.ScriptKind.TSX,
);
const backgroundWorkerNode = chatSource.statements.find(
  (node): node is ts.FunctionDeclaration =>
    ts.isFunctionDeclaration(node) &&
    node.name?.text === "startBackgroundQueue",
);
if (!backgroundWorkerNode)
  throw new Error("Missing production startBackgroundQueue");
const backgroundWorkerJS = ts.transpileModule(
  backgroundWorkerNode.getText(chatSource),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
    },
  },
).outputText;

function backgroundWorkerFixture() {
  const sessionApi = {
    setLastUserMessage: vi.fn(),
    discardLastUserMessage: vi.fn(),
  };
  const dependencies = {
    useMessageQueueStore,
    withBackgroundSendLock,
    awaitInChatScope,
    waitForChatIdle,
    recoverSendingQueueHead,
    stopBackgroundQueue,
    setBackgroundAbort,
    clearBackgroundAbortIfCurrent,
    sessionApi,
    getQueuedAgentMentionContext,
    getSubmittedAgentMention,
    i18n: { t: (value: string) => value },
    buildAuthHeaders: () => ({}),
    getApiUrl: (path: string) => `/api${path}`,
    buildAttachmentContentItems: () => [],
    applyChatPayloadTransforms: (payload: unknown) => payload,
    withPendingSessionSettings: (requestBody: unknown) => ({ requestBody }),
    setPendingProjectDirectory: vi.fn(),
    notifyProjectDirectoryChanged: vi.fn(),
    setPendingThinking: vi.fn(),
    QWENPAW_CLIENT_MESSAGE_ID_KEY: "qwenpaw_client_message_id",
    DEFAULT_USER_ID: "default",
    DEFAULT_CHANNEL: "console",
  };
  const start = new Function(
    ...Object.keys(dependencies),
    `${backgroundWorkerJS}\nreturn startBackgroundQueue;`,
  )(...Object.values(dependencies)) as (
    queueKey: string,
    backendSessionId: string,
    chatId: string,
  ) => Promise<void>;
  return { start, sessionApi };
}

describe("background queue transport handoff", () => {
  let held: Set<string>;
  let workers: Promise<void>[];
  let finishFixtures: Array<() => void>;

  beforeEach(() => {
    held = new Set();
    workers = [];
    finishFixtures = [];
    vi.stubGlobal("navigator", {
      locks: {
        request: async (
          name: string,
          _options: unknown,
          callback: (lock: unknown) => Promise<unknown>,
        ) => {
          if (held.has(name)) return callback(null);
          held.add(name);
          try {
            return await callback({});
          } finally {
            held.delete(name);
          }
        },
      },
    });
    vi.mocked(request).mockResolvedValue({ status: "idle", messages: [] });
    useMessageQueueStore.getState().enqueue(key, {
      text: "first",
      agentId: "agent-a",
      backendSessionId: "runtime-a",
    });
    useMessageQueueStore.getState().enqueue(key, {
      text: "second",
      agentId: "agent-a",
      backendSessionId: "runtime-a",
    });
  });

  afterEach(async () => {
    stopBackgroundQueue();
    finishFixtures.forEach((finish) => finish());
    await Promise.allSettled(workers);
  });

  async function expectReleased() {
    await vi.waitFor(() => expect(held.size).toBe(0), { timeout: 1000 });
    expect(getBackgroundAbort(key)).toBeUndefined();
    expect(
      await withBackgroundSendLock(key, () => "foreground acquired both"),
    ).toBe("foreground acquired both");
  }

  it.each([200, 503])(
    "releases pending headers, keeps unknown receipt sending and cancels a late HTTP %s body",
    async (status) => {
      const headers = deferred<Response>();
      const fetchFixture = vi.fn<typeof fetch>(() => headers.promise);
      vi.stubGlobal("fetch", fetchFixture);
      const cancelFinished = deferred<void>();
      const cancel = vi.fn(() => cancelFinished.promise);
      const body = new ReadableStream<Uint8Array>({ cancel });
      const response = new Response(body, { status });
      finishFixtures.push(() => {
        cancelFinished.resolve();
        headers.resolve(response);
      });
      const fixture = backgroundWorkerFixture();
      workers.push(fixture.start(key, "runtime-a", key));
      await vi.waitFor(() => expect(fetchFixture).toHaveBeenCalledTimes(1));
      expect(held).toEqual(
        new Set([`qwenpaw:queue-owner:${key}`, `qwenpaw:queue-send:${key}`]),
      );
      expect(fetchFixture).toHaveBeenCalledWith(
        "/api/console/chat",
        expect.objectContaining({ method: "POST" }),
      );
      expect(fetchFixture.mock.calls[0]).toHaveLength(2);
      expect(fetchFixture.mock.calls[0][1]).not.toHaveProperty("signal");
      stopBackgroundQueue(key);
      await expectReleased();
      expect(cancel).not.toHaveBeenCalled();
      expect(
        useMessageQueueStore
          .getState()
          .getQueue(key)
          .map((item) => item.status),
      ).toEqual(["sending", "pending"]);
      headers.resolve(response);
      await vi.waitFor(() => expect(cancel).toHaveBeenCalledTimes(1));
      expect(fixture.sessionApi.discardLastUserMessage).not.toHaveBeenCalled();
      expect(
        useMessageQueueStore
          .getState()
          .getQueue(key)
          .map((item) => item.status),
      ).toEqual(["sending", "pending"]);
      expect(useMessageQueueStore.getState().getRunState(key)).not.toBe(
        "error",
      );
      expect(fetchFixture).toHaveBeenCalledTimes(1);
    },
  );

  it("cancels a silent reader and releases both locks without awaiting its cancellation hook", async () => {
    const cancelFinished = deferred<void>();
    const cancel = vi.fn(() => cancelFinished.promise);
    const body = new ReadableStream<Uint8Array>({ cancel });
    finishFixtures.push(() => {
      cancelFinished.resolve();
    });
    const fetchFixture = vi.fn(async () => new Response(body));
    vi.stubGlobal("fetch", fetchFixture);
    const fixture = backgroundWorkerFixture();
    workers.push(fixture.start(key, "runtime-a", key));
    await vi.waitFor(() => expect(body.locked).toBe(true));
    expect(held.size).toBe(2);
    stopBackgroundQueue(key);
    await expectReleased();
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(body.locked).toBe(false);
    expect(useMessageQueueStore.getState().getQueue(key)).toMatchObject([
      { text: "second", status: "pending" },
    ]);
    expect(useMessageQueueStore.getState().getQueue(key)).toHaveLength(1);
    expect(useMessageQueueStore.getState().getRunState(key)).not.toBe("error");
    expect(fixture.sessionApi.discardLastUserMessage).not.toHaveBeenCalled();
    // Only the original POST exists: cancellation did not issue a backend
    // stop request or dispatch the next queued item.
    expect(fetchFixture).toHaveBeenCalledTimes(1);
  });

  it("retains an actual pre-acceptance HTTP failure as failed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 })),
    );
    const fixture = backgroundWorkerFixture();
    const worker = fixture.start(key, "runtime-a", key);
    workers.push(worker);
    await worker;
    expect(
      useMessageQueueStore
        .getState()
        .getQueue(key)
        .map((item) => item.status),
    ).toEqual(["failed", "pending"]);
    expect(useMessageQueueStore.getState().getRunState(key)).toBe("error");
    expect(fixture.sessionApi.discardLastUserMessage).toHaveBeenCalledTimes(1);
    await expectReleased();
  });
});
describe("queue Run handoff", () => {
  it("releases the send lock when switching away from a real disconnected SDK Run", async () => {
    let held = false;
    vi.stubGlobal("navigator", {
      locks: {
        request: async (
          _name: string,
          _options: unknown,
          callback: (lock: unknown) => Promise<unknown>,
        ) => {
          if (held) return callback(null);
          held = true;
          try {
            return await callback({});
          } finally {
            held = false;
          }
        },
      },
    });
    const lifecycle = run();
    lifecycle.markSubmitting();
    lifecycle.markDispatched();
    const controller = new AbortController();
    const locked = withSendLock(key, () =>
      awaitQueueAcceptance(
        Promise.resolve(lifecycle.handle),
        controller.signal,
      ),
    );
    lifecycle.markDisconnected(
      new Error("chat session changed during streaming"),
    );
    expect(await withSendLock(key, () => "next")).toBeNull();
    controller.abort();
    await locked;
    expect(lifecycle.getState()).toBe("disconnected");
    expect(await withSendLock(key, () => "next")).toBe("next");
  });
  it("also leaves an unresolved SDK execution when its Chat scope ends", async () => {
    const controller = new AbortController();
    const pending = awaitQueueAcceptance(
      new Promise(() => {}),
      controller.signal,
    );
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
  it("retains normal accepted and rejected SDK results", async () => {
    const accepted = run();
    accepted.markAccepted(key);
    await expect(
      awaitQueueAcceptance(
        Promise.resolve(accepted.handle),
        new AbortController().signal,
      ),
    ).resolves.toMatchObject({ accepted: true });
    const rejected = run();
    rejected.fail(new Error("offline"));
    await expect(
      awaitQueueAcceptance(
        Promise.resolve(rejected.handle),
        new AbortController().signal,
      ),
    ).resolves.toMatchObject({ accepted: false });
  });
});
describe("persisted sending recovery", () => {
  it("removes a confirmed receipt after reload and preserves the next queued task", async () => {
    const head = sendingHead();
    useMessageQueueStore.setState({ queues: {}, runStates: {} });
    useMessageQueueStore.getState().loadFromStorage(key);
    vi.mocked(request).mockResolvedValue({
      status: "idle",
      messages: [
        {
          role: "user",
          metadata: { qwenpaw_client_message_id: head.clientMessageId },
        },
      ],
    });
    await recoverSendingQueueHead(
      key,
      new AbortController().signal,
      "agent-a",
      key,
      "retry required",
    );
    expect(
      useMessageQueueStore
        .getState()
        .getQueue(key)
        .map((item) => [item.text, item.status]),
    ).toEqual([["second", "pending"]]);
    expect(request).toHaveBeenCalledWith(
      "/chats/chat-a",
      expect.objectContaining({ headers: { "X-Agent-Id": "agent-a" } }),
    );
  });
  it("makes an unknown receipt explicitly retryable instead of silently resending", async () => {
    sendingHead();
    vi.mocked(request).mockResolvedValue({ status: "idle", messages: [] });
    await recoverSendingQueueHead(
      key,
      new AbortController().signal,
      "agent-a",
      key,
      "retry required",
    );
    expect(useMessageQueueStore.getState().getQueue(key)[0]).toMatchObject({
      status: "failed",
      errorMessage: "retry required",
    });
    expect(useMessageQueueStore.getState().getRunState(key)).toBe("error");
    expect(useMessageQueueStore.getState().getQueue(key)).toHaveLength(2);
  });
  it("does not mutate a sending item after another Agent switch during recovery", async () => {
    sendingHead();
    const controller = new AbortController();
    vi.mocked(request).mockImplementation(async () => {
      controller.abort();
      return { status: "idle", messages: [] };
    });
    await recoverSendingQueueHead(
      key,
      controller.signal,
      "agent-a",
      key,
      "retry required",
    );
    expect(useMessageQueueStore.getState().getQueue(key)[0].status).toBe(
      "sending",
    );
  });
});
