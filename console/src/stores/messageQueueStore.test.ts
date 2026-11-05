import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  useMessageQueueStore,
  STORAGE_PREFIX,
  getStorageKey,
  removeQueueFromStorage,
  nextQueueId,
  MAX_QUEUE_SIZE,
  findQueueItemSessionId,
  getLatestQueuedSessionIdForAgent,
  withSendLock,
  withAvailableOwnershipLock,
  withBackgroundSendLock,
  holdOwnershipLock,
  getQueueKey,
  isDraftQueueKey,
  recoverLegacyDraftQueue,
  type QueueItem,
} from "./messageQueueStore";

const SESSION_ID = "sess-1";

function resetStore() {
  useMessageQueueStore.setState({
    queues: {},
    runStates: {},
    currentSendingId: null,
    lastMigratedTo: null,
  });
}

function clearStorage() {
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }
}

describe("messageQueueStore", () => {
  beforeEach(() => {
    resetStore();
    clearStorage();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetStore();
    clearStorage();
  });

  // ---------------------------------------------------------------------------
  // Constants / helpers
  // ---------------------------------------------------------------------------

  it("STORAGE_PREFIX is 'qwenpaw:message-queue:'", () => {
    expect(STORAGE_PREFIX).toBe("qwenpaw:message-queue:");
  });

  it("getStorageKey concatenates prefix + sessionId", () => {
    expect(getStorageKey("abc")).toBe("qwenpaw:message-queue:abc");
  });

  it("MAX_QUEUE_SIZE is 50", () => {
    expect(MAX_QUEUE_SIZE).toBe(50);
  });

  it("isolates draft queues and locks without changing backend Chat UUIDs", () => {
    expect(getQueueKey("a")).not.toBe(getQueueKey("b"));
    expect(getQueueKey("a", "new")).toBe(getQueueKey("a"));
    expect(getQueueKey("a", "chat-uuid")).toBe("chat-uuid");
    expect(isDraftQueueKey(getQueueKey("a"))).toBe(true);
    expect(
      getLatestQueuedSessionIdForAgent(
        { [getQueueKey("a")]: [{ agentId: "a", createdAt: 1 } as QueueItem] },
        "a",
      ),
    ).toBeUndefined();
  });

  it("recovers legacy drafts once per Agent without dropping attachments or paused state", async () => {
    const store = useMessageQueueStore.getState();
    store.enqueue("new", {
      text: "A",
      agentId: "a",
      attachments: [{ url: "/file-a" }],
    });
    store.enqueue("new", { text: "B", agentId: "b" });
    store.setRunState("new", "paused");
    await recoverLegacyDraftQueue(getQueueKey("a"));
    await recoverLegacyDraftQueue(getQueueKey("b"));
    await recoverLegacyDraftQueue(getQueueKey("a"));
    expect(store.getQueue(getQueueKey("a"))).toHaveLength(1);
    expect(store.getQueue(getQueueKey("a"))[0].attachments).toEqual([
      { url: "/file-a" },
    ]);
    expect(store.getQueue(getQueueKey("b"))[0].text).toBe("B");
    expect(store.getRunState(getQueueKey("a"))).toBe("paused");
    expect(localStorage.getItem(getStorageKey("new"))).toBeNull();
  });

  it("migrates only the creating Agent's legacy draft and preserves the other Agent's FIFO", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue("new", { text: "B first", agentId: "agent-b" });
    store.enqueue("new", { text: "A first", agentId: "agent-a" });
    store.enqueue("new", { text: "B second", agentId: "agent-b" });
    store.setRunState("new", "paused");
    store.migrateQueue("new", "chat-a", "agent-a");
    expect(store.getQueue("chat-a").map((item) => item.text)).toEqual([
      "A first",
    ]);
    expect(store.getQueue("new").map((item) => item.text)).toEqual([
      "B first",
      "B second",
    ]);
    expect(store.getRunState("new")).toBe("paused");
    expect(store.getRunState("chat-a")).toBe("paused");
    store.migrateQueue("new", "chat-b", "agent-b");
    expect(store.getQueue("chat-b").map((item) => item.text)).toEqual([
      "B first",
      "B second",
    ]);
    expect(store.getQueue("new")).toEqual([]);
  });

  it("nextQueueId returns unique monotonically increasing ids", () => {
    const a = nextQueueId();
    const b = nextQueueId();
    const c = nextQueueId();
    expect(a).not.toBe(b);
    expect(b).not.toBe(c);
    expect(a.startsWith("mq-")).toBe(true);
  });

  it("removeQueueFromStorage removes the entry from localStorage", () => {
    localStorage.setItem(getStorageKey(SESSION_ID), "sentinel");
    removeQueueFromStorage(SESSION_ID);
    expect(localStorage.getItem(getStorageKey(SESSION_ID))).toBeNull();
  });

  it("finds the newest queued session for the requested agent", () => {
    const queueItem = (
      agentId: string | undefined,
      createdAt: number,
    ): QueueItem => ({
      id: `item-${createdAt}`,
      text: "queued",
      agentId,
      status: "pending",
      retryCount: 0,
      createdAt,
    });

    expect(
      getLatestQueuedSessionIdForAgent(
        {
          "default-newer": [queueItem("default", 300)],
          "qa-older": [queueItem("qa", 100)],
          "qa-newer": [queueItem("qa", 200)],
        },
        "qa",
      ),
    ).toBe("qa-newer");
  });

  it("treats legacy queue items without agentId as default-agent items", () => {
    const legacyItem: QueueItem = {
      id: "legacy",
      text: "queued",
      status: "pending",
      retryCount: 0,
      createdAt: 100,
    };

    const queues = { legacy: [legacyItem] };
    expect(getLatestQueuedSessionIdForAgent(queues, "default")).toBe("legacy");
    expect(getLatestQueuedSessionIdForAgent(queues, "qa")).toBeUndefined();
  });

  it("locates an item after the new queue migrates while it is submitting", () => {
    const migrated: QueueItem = {
      id: "moving-item",
      text: "queued",
      status: "sending",
      retryCount: 0,
      createdAt: 100,
    };

    expect(
      findQueueItemSessionId({ "chat-uuid": [migrated] }, migrated.id, "new"),
    ).toBe("chat-uuid");
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  it("starts with empty queues, runStates, null currentSendingId and lastMigratedTo", () => {
    const state = useMessageQueueStore.getState();
    expect(state.queues).toEqual({});
    expect(state.runStates).toEqual({});
    expect(state.currentSendingId).toBeNull();
    expect(state.lastMigratedTo).toBeNull();
  });

  it("getQueue returns [] for an unknown session", () => {
    expect(useMessageQueueStore.getState().getQueue("unknown")).toEqual([]);
  });

  it("getRunState defaults to 'idle' for an unknown session", () => {
    expect(useMessageQueueStore.getState().getRunState("unknown")).toBe("idle");
  });

  // ---------------------------------------------------------------------------
  // enqueue
  // ---------------------------------------------------------------------------

  it("enqueue creates a pending item with the given text", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "hello" });

    const queue = useMessageQueueStore.getState().getQueue(SESSION_ID);
    expect(queue).toHaveLength(1);
    expect(queue[0].text).toBe("hello");
    expect(queue[0].clientMessageId).toBeTruthy();
    expect(queue[0].status).toBe("pending");
    expect(queue[0].retryCount).toBe(0);
    expect(queue[0].createdAt).toBeGreaterThan(0);
  });

  it("enqueue appends multiple items preserving order", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "one" });
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "two" });
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "three" });

    const queue = useMessageQueueStore.getState().getQueue(SESSION_ID);
    expect(queue.map((i) => i.text)).toEqual(["one", "two", "three"]);
  });

  it("enqueue persists items to localStorage under the session key", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "persisted" });

    const raw = localStorage.getItem(getStorageKey(SESSION_ID));
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].text).toBe("persisted");
    expect(parsed.runState).toBe("idle");
  });

  it("enqueue rejects when the queue is already at MAX_QUEUE_SIZE", () => {
    for (let i = 0; i < MAX_QUEUE_SIZE; i++) {
      useMessageQueueStore
        .getState()
        .enqueue(SESSION_ID, { text: `item-${i}` });
    }
    expect(useMessageQueueStore.getState().getQueue(SESSION_ID)).toHaveLength(
      MAX_QUEUE_SIZE,
    );

    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "overflow" });

    expect(useMessageQueueStore.getState().getQueue(SESSION_ID)).toHaveLength(
      MAX_QUEUE_SIZE,
    );
    expect(
      useMessageQueueStore
        .getState()
        .getQueue(SESSION_ID)
        .some((i) => i.text === "overflow"),
    ).toBe(false);
  });

  it("enqueue captures agentId from sessionStorage when available", () => {
    sessionStorage.setItem(
      "qwenpaw-agent-storage",
      JSON.stringify({ state: { selectedAgent: "agent-x" } }),
    );

    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "hi" });

    const item = useMessageQueueStore.getState().getQueue(SESSION_ID)[0];
    expect(item.agentId).toBe("agent-x");
  });

  it("enqueue prefers the caller's admission-time agentId", () => {
    sessionStorage.setItem(
      "qwenpaw-agent-storage",
      JSON.stringify({ state: { selectedAgent: "new-agent" } }),
    );

    useMessageQueueStore.getState().enqueue(SESSION_ID, {
      text: "hi",
      agentId: "source-agent",
    });

    const item = useMessageQueueStore.getState().getQueue(SESSION_ID)[0];
    expect(item.agentId).toBe("source-agent");
  });

  it("enqueue does not inherit a stale global runtime session", () => {
    (window as unknown as { currentSessionId?: string }).currentSessionId =
      "backend-42";

    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "hi" });

    const item = useMessageQueueStore.getState().getQueue(SESSION_ID)[0];
    expect(item.backendSessionId).toBeUndefined();

    delete (window as unknown as { currentSessionId?: string })
      .currentSessionId;
  });

  it("enqueue prefers the explicit agent and backend session snapshot", () => {
    sessionStorage.setItem(
      "qwenpaw-agent-storage",
      JSON.stringify({ state: { selectedAgent: "stale-agent" } }),
    );
    (window as unknown as { currentSessionId?: string }).currentSessionId =
      "stale-session";

    useMessageQueueStore.getState().enqueue(SESSION_ID, {
      text: "hi",
      agentId: "queued-agent",
      backendSessionId: "queued-session",
    });

    const item = useMessageQueueStore.getState().getQueue(SESSION_ID)[0];
    expect(item.agentId).toBe("queued-agent");
    expect(item.backendSessionId).toBe("queued-session");

    delete (window as unknown as { currentSessionId?: string })
      .currentSessionId;
  });

  it("enqueue prefers the caller's authoritative backendSessionId", () => {
    (window as unknown as { currentSessionId?: string }).currentSessionId =
      "stale-window-session";

    useMessageQueueStore.getState().enqueue(SESSION_ID, {
      text: "hi",
      backendSessionId: "authoritative-session",
    });

    const item = useMessageQueueStore.getState().getQueue(SESSION_ID)[0];
    expect(item.backendSessionId).toBe("authoritative-session");

    delete (window as unknown as { currentSessionId?: string })
      .currentSessionId;
  });

  it("enqueue leaves agentId/backendSessionId undefined when none are set", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "hi" });

    const item = useMessageQueueStore.getState().getQueue(SESSION_ID)[0];
    expect(item.agentId).toBeUndefined();
    expect(item.backendSessionId).toBeUndefined();
  });

  it("enqueue carries userId and channel from the input", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, {
      text: "hi",
      userId: "u1",
      channel: "web",
    });

    const item = useMessageQueueStore.getState().getQueue(SESSION_ID)[0];
    expect(item.userId).toBe("u1");
    expect(item.channel).toBe("web");
  });

  // ---------------------------------------------------------------------------
  // remove / edit / reorder
  // ---------------------------------------------------------------------------

  it("remove drops the item with the matching id", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "keep" });
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "drop" });
    const queue = useMessageQueueStore.getState().getQueue(SESSION_ID);
    const targetId = queue[1].id;

    useMessageQueueStore.getState().remove(SESSION_ID, targetId);

    const next = useMessageQueueStore.getState().getQueue(SESSION_ID);
    expect(next).toHaveLength(1);
    expect(next[0].text).toBe("keep");
  });

  it("remove on an unknown id is a no-op", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });
    useMessageQueueStore.getState().remove(SESSION_ID, "does-not-exist");
    expect(useMessageQueueStore.getState().getQueue(SESSION_ID)).toHaveLength(
      1,
    );
  });

  it("remove on an unknown session does not throw", () => {
    expect(() =>
      useMessageQueueStore.getState().remove("ghost", "x"),
    ).not.toThrow();
  });

  it("edit updates the text of the matching item only", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "a" });
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "b" });
    const idA = useMessageQueueStore.getState().getQueue(SESSION_ID)[0].id;

    useMessageQueueStore.getState().edit(SESSION_ID, idA, "edited");

    const queue = useMessageQueueStore.getState().getQueue(SESSION_ID);
    expect(queue[0].text).toBe("edited");
    expect(queue[1].text).toBe("b");
  });

  it("reorder replaces the entire item list for the session", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "a" });
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "b" });
    const reordered = [
      { ...useMessageQueueStore.getState().getQueue(SESSION_ID)[1] },
      { ...useMessageQueueStore.getState().getQueue(SESSION_ID)[0] },
    ];

    useMessageQueueStore.getState().reorder(SESSION_ID, reordered);

    const queue = useMessageQueueStore.getState().getQueue(SESSION_ID);
    expect(queue.map((i) => i.text)).toEqual(["b", "a"]);
  });

  // ---------------------------------------------------------------------------
  // clear
  // ---------------------------------------------------------------------------

  it("clear removes the session queue and its runState", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });
    useMessageQueueStore.getState().setRunState(SESSION_ID, "paused");

    useMessageQueueStore.getState().clear(SESSION_ID);

    expect(useMessageQueueStore.getState().getQueue(SESSION_ID)).toEqual([]);
    expect(useMessageQueueStore.getState().getRunState(SESSION_ID)).toBe(
      "idle",
    );
    expect(localStorage.getItem(getStorageKey(SESSION_ID))).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // migrateQueue
  // ---------------------------------------------------------------------------

  it("migrateQueue moves items from source to destination and clears source", () => {
    useMessageQueueStore.getState().enqueue("src", { text: "s1" });
    useMessageQueueStore.getState().enqueue("dst", { text: "d1" });

    useMessageQueueStore.getState().migrateQueue("src", "dst");

    const dst = useMessageQueueStore.getState().getQueue("dst");
    const src = useMessageQueueStore.getState().getQueue("src");
    expect(dst.map((i) => i.text)).toEqual(["d1", "s1"]);
    expect(src).toEqual([]);
  });

  it("migrateQueue is a no-op when source and destination are the same", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });

    useMessageQueueStore.getState().migrateQueue(SESSION_ID, SESSION_ID);

    expect(useMessageQueueStore.getState().getQueue(SESSION_ID)).toHaveLength(
      1,
    );
    expect(useMessageQueueStore.getState().lastMigratedTo).toBeNull();
  });

  it("retains later messages through new-to-local-to-UUID migration and first acceptance", () => {
    const store = useMessageQueueStore.getState();
    for (const text of ["A", "B", "C"]) store.enqueue("new", { text });
    const first = store.getQueue("new")[0];
    store.setRunState("new", "paused");
    store.setItemStatus("new", first.id, "sending");

    store.migrateQueue("new", "1788357954784-1iwrrlb");
    store.migrateQueue("1788357954784-1iwrrlb", "chat-uuid");
    const owner = findQueueItemSessionId(
      useMessageQueueStore.getState().queues,
      first.id,
      "new",
    );
    expect(owner).toBe("chat-uuid");
    store.remove(owner!, first.id);

    expect(store.getQueue("chat-uuid").map((item) => item.text)).toEqual([
      "B",
      "C",
    ]);
    expect(store.getRunState("chat-uuid")).toBe("paused");
    expect(localStorage.getItem(getStorageKey("new"))).toBeNull();
    expect(
      localStorage.getItem(getStorageKey("1788357954784-1iwrrlb")),
    ).toBeNull();
    resetStore();
    store.loadFromStorage("chat-uuid");
    expect(store.getQueue("chat-uuid").map((item) => item.text)).toEqual([
      "B",
      "C",
    ]);
    expect(store.getRunState("chat-uuid")).toBe("paused");
  });

  it("migrateQueue sets lastMigratedTo to the destination", () => {
    useMessageQueueStore.getState().enqueue("src", { text: "s1" });

    useMessageQueueStore.getState().migrateQueue("src", "dst");

    expect(useMessageQueueStore.getState().lastMigratedTo).toBe("dst");
  });

  it("migrateQueue carries source runState to destination when destination has none", () => {
    useMessageQueueStore.getState().setRunState("src", "paused");

    useMessageQueueStore.getState().migrateQueue("src", "dst");

    expect(useMessageQueueStore.getState().getRunState("dst")).toBe("paused");
  });

  it("migrateQueue does not overwrite destination runState if already set", () => {
    useMessageQueueStore.getState().setRunState("src", "paused");
    useMessageQueueStore.getState().setRunState("dst", "running");

    useMessageQueueStore.getState().migrateQueue("src", "dst");

    expect(useMessageQueueStore.getState().getRunState("dst")).toBe("running");
  });

  // ---------------------------------------------------------------------------
  // setItemStatus
  // ---------------------------------------------------------------------------

  it("setItemStatus updates the status of the matching item", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });
    const id = useMessageQueueStore.getState().getQueue(SESSION_ID)[0].id;

    useMessageQueueStore.getState().setItemStatus(SESSION_ID, id, "sent");

    expect(useMessageQueueStore.getState().getQueue(SESSION_ID)[0].status).toBe(
      "sent",
    );
  });

  it("setItemStatus to 'failed' increments retryCount and stores errorMessage", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });
    const id = useMessageQueueStore.getState().getQueue(SESSION_ID)[0].id;

    useMessageQueueStore
      .getState()
      .setItemStatus(SESSION_ID, id, "failed", "boom");

    const item = useMessageQueueStore.getState().getQueue(SESSION_ID)[0];
    expect(item.status).toBe("failed");
    expect(item.retryCount).toBe(1);
    expect(item.errorMessage).toBe("boom");
    expect(useMessageQueueStore.getState().getRunState(SESSION_ID)).toBe(
      "error",
    );
    expect(
      JSON.parse(localStorage.getItem(getStorageKey(SESSION_ID))!).runState,
    ).toBe("error");
  });

  it.each(["error", "idle"] as const)(
    "keeps a failed head stopped after reload even when its saved run state is %s",
    (runState) => {
      const store = useMessageQueueStore.getState();
      store.enqueue(SESSION_ID, { text: "failed-first" });
      store.enqueue(SESSION_ID, { text: "later" });
      const first = store.getQueue(SESSION_ID)[0];
      store.setItemStatus(SESSION_ID, first.id, "failed", "offline");
      store.setRunState(SESSION_ID, runState);
      resetStore();
      store.loadFromStorage(SESSION_ID);
      expect(store.getRunState(SESSION_ID)).toBe("error");
      expect(store.getQueue(SESSION_ID)[0].status).toBe("failed");

      store.setItemStatus(SESSION_ID, first.id, "pending");
      store.setRunState(SESSION_ID, "running");
      expect(store.getRunState(SESSION_ID)).toBe("running");
      expect(store.getQueue(SESSION_ID)[0].status).toBe("pending");
    },
  );

  it("setItemStatus to a non-failed status does not increment retryCount", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });
    const id = useMessageQueueStore.getState().getQueue(SESSION_ID)[0].id;

    useMessageQueueStore.getState().setItemStatus(SESSION_ID, id, "sending");
    useMessageQueueStore.getState().setItemStatus(SESSION_ID, id, "sent");

    const item = useMessageQueueStore.getState().getQueue(SESSION_ID)[0];
    expect(item.retryCount).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Non-interrupting steering ownership and receipts
  // ---------------------------------------------------------------------------

  it("claims steering with a distinct persisted request identity and preserves the original FIFO", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue(SESSION_ID, { text: "first", agentId: "agent-a" });
    store.enqueue(SESSION_ID, { text: "guide this run", agentId: "agent-a" });
    const [first, target] = store.getQueue(SESSION_ID);

    expect(store.beginSteering(SESSION_ID, target.id, "run-a")).toBe(true);
    expect(store.beginSteering(SESSION_ID, target.id, "run-b")).toBe(false);
    expect(store.beginSteering(SESSION_ID, first.id, "")).toBe(false);
    expect(store.beginSteering("draft:agent-a", first.id, "run-a")).toBe(false);
    store.setItemStatus(SESSION_ID, first.id, "steering");
    expect(store.getQueue(SESSION_ID)[0].status).toBe("pending");
    store.setItemStatus(SESSION_ID, first.id, "sending");
    expect(store.beginSteering(SESSION_ID, first.id, "run-a")).toBe(false);

    const claimed = store.getQueue(SESSION_ID)[1];
    expect(claimed).toMatchObject({
      id: target.id,
      clientMessageId: target.clientMessageId,
      text: target.text,
      agentId: target.agentId,
      status: "steering",
      steering: { runId: "run-a" },
    });
    expect(claimed.steering?.requestId).toMatch(/^steer-/);
    expect(claimed.steering?.requestId).not.toBe(target.clientMessageId);
    expect(store.getQueue(SESSION_ID).map((item) => item.id)).toEqual([
      first.id,
      target.id,
    ]);
    expect(
      JSON.parse(localStorage.getItem(getStorageKey(SESSION_ID))!).items[1],
    ).toEqual(JSON.parse(JSON.stringify(claimed)));
  });

  it("keeps uncertain steering immutable through reload until the matching server receipt arrives", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue(SESSION_ID, { text: "keep analysing, check dates first" });
    store.enqueue(SESSION_ID, { text: "ordinary next turn" });
    const target = store.getQueue(SESSION_ID)[0];
    store.beginSteering(SESSION_ID, target.id, "run-a");
    const requestId = store.getQueue(SESSION_ID)[0].steering!.requestId;
    expect(
      store.setSteeringError(SESSION_ID, target.id, requestId, "offline"),
    ).toBe(true);
    expect(
      store.setSteeringError(SESSION_ID, target.id, "old-request", "stale"),
    ).toBe(false);

    resetStore();
    store.loadFromStorage(SESSION_ID);
    const unresolved = store.getQueue(SESSION_ID)[0];
    const onChange = vi.fn();
    const unsubscribe = useMessageQueueStore.subscribe(onChange);
    expect(
      store.setSteeringError(SESSION_ID, target.id, requestId, "offline"),
    ).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    unsubscribe();
    expect(unresolved).toMatchObject({
      status: "steering",
      errorMessage: "offline",
      retryCount: 0,
      steering: { requestId, runId: "run-a" },
    });
    store.edit(SESSION_ID, target.id, "changed after delivery");
    store.remove(SESSION_ID, target.id);
    store.setItemStatus(SESSION_ID, target.id, "pending");
    store.setItemStatus(SESSION_ID, target.id, "failed", "stale failure");
    store.reorder(SESSION_ID, [...store.getQueue(SESSION_ID)].reverse());
    expect(store.getQueue(SESSION_ID)[0]).toEqual(unresolved);
    expect(store.getRunState(SESSION_ID)).toBe("idle");
    store.clear(SESSION_ID);
    expect(store.getQueue(SESSION_ID)).toEqual([unresolved]);
    expect(
      store.resolveSteering(SESSION_ID, target.id, "wrong-request", "applied"),
    ).toBe(false);
    expect(
      store.resolveSteering(SESSION_ID, target.id, requestId, "applied"),
    ).toBe(true);
    expect(store.getQueue(SESSION_ID)).toEqual([]);
    expect(localStorage.getItem(getStorageKey(SESSION_ID))).toBeNull();
  });

  it("returns unapplied steering as an explicit failed head and ignores receipts from an earlier attempt", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue(SESSION_ID, { text: "guide current task" });
    store.enqueue(SESSION_ID, { text: "wait behind the guide" });
    const [target, later] = store.getQueue(SESSION_ID);
    store.beginSteering(SESSION_ID, target.id, "run-a");
    const firstAttempt = store.getQueue(SESSION_ID)[0];
    const firstRequestId = firstAttempt.steering!.requestId;
    expect(
      store.resolveSteering(
        SESSION_ID,
        target.id,
        firstRequestId,
        "returned",
        "turn already ended",
      ),
    ).toBe(true);
    expect(store.getQueue(SESSION_ID)).toEqual([
      {
        ...target,
        status: "failed",
        retryCount: 1,
        errorMessage: "turn already ended",
      },
      later,
    ]);
    expect(store.getRunState(SESSION_ID)).toBe("error");
    // A second tab still polling the old claim must not overwrite the return.
    useMessageQueueStore.setState({
      queues: { [SESSION_ID]: [firstAttempt, later] },
    });
    expect(
      store.setSteeringError(SESSION_ID, target.id, firstRequestId, "offline"),
    ).toBe(false);
    expect(
      store.resolveSteering(SESSION_ID, target.id, firstRequestId, "applied"),
    ).toBe(false);
    resetStore();
    store.loadFromStorage(SESSION_ID);
    expect(store.getRunState(SESSION_ID)).toBe("error");
    expect(store.getQueue(SESSION_ID)[0].steering).toBeUndefined();
    store.setItemStatus(SESSION_ID, target.id, "pending");
    store.setRunState(SESSION_ID, "running");
    expect(store.beginSteering(SESSION_ID, target.id, "run-b")).toBe(true);
    const secondRequestId = store.getQueue(SESSION_ID)[0].steering!.requestId;
    expect(secondRequestId).not.toBe(firstRequestId);
    expect(
      store.resolveSteering(SESSION_ID, target.id, firstRequestId, "applied"),
    ).toBe(false);
    expect(store.getQueue(SESSION_ID)[0].clientMessageId).toBe(
      target.clientMessageId,
    );
    expect(
      store.resolveSteering(SESSION_ID, target.id, secondRequestId, "applied"),
    ).toBe(true);
    expect(store.getQueue(SESSION_ID)).toEqual([later]);
  });

  it("does not mistake a normal user history receipt for an applied steering receipt", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue(SESSION_ID, { text: "guide", agentId: "agent-a" });
    store.enqueue(SESSION_ID, { text: "normal", agentId: "agent-a" });
    const [guide, normal] = store.getQueue(SESSION_ID);
    store.beginSteering(SESSION_ID, guide.id, "run-a");
    store.setItemStatus(SESSION_ID, normal.id, "sending");
    store.reconcileHistory(
      SESSION_ID,
      "agent-a",
      [guide, normal].map((item) => ({
        role: "user",
        metadata: {
          metadata: { qwenpaw_client_message_id: item.clientMessageId },
        },
      })),
    );
    expect(store.getQueue(SESSION_ID)).toHaveLength(1);
    expect(store.getQueue(SESSION_ID)[0]).toMatchObject({
      id: guide.id,
      status: "steering",
      steering: { runId: "run-a" },
    });
  });

  it("pins unresolved steering while allowing unrelated queue items to reorder", () => {
    const store = useMessageQueueStore.getState();
    for (const text of ["a", "guide", "b"]) store.enqueue(SESSION_ID, { text });
    const stale = store.getQueue(SESSION_ID);
    store.beginSteering(SESSION_ID, stale[1].id, "run-a");
    const claimed = store.getQueue(SESSION_ID)[1];
    store.reorder(SESSION_ID, [stale[2], stale[1], stale[0]]);
    expect(store.getQueue(SESSION_ID)).toEqual([stale[2], claimed, stale[0]]);
    store.reorder(SESSION_ID, [stale[2], stale[0]]);
    expect(store.getQueue(SESSION_ID)).toEqual([stale[2], claimed, stale[0]]);
    store.migrateQueue(SESSION_ID, "other-chat");
    expect(store.getQueue(SESSION_ID)).toEqual([claimed]);
    expect(store.getQueue("other-chat")).toEqual([stale[2], stale[0]]);
  });

  it.each([
    "remove",
    "edit",
    "clear",
    "reorder",
    "setItemStatus",
    "enqueue",
    "setRunState",
    "persistToStorage",
    "applyRemoteItems",
  ] as const)(
    "preserves an already persisted steering claim when a stale tab calls %s",
    (action) => {
      const store = useMessageQueueStore.getState();
      store.enqueue(SESSION_ID, { text: "steering draft" });
      const stale = store.getQueue(SESSION_ID);
      store.beginSteering(SESSION_ID, stale[0].id, "run-a");
      const claimed = store.getQueue(SESSION_ID)[0];
      // Simulate the other tab before its BroadcastChannel/storage event lands.
      useMessageQueueStore.setState({ queues: { [SESSION_ID]: stale } });
      switch (action) {
        case "remove":
          store.remove(SESSION_ID, stale[0].id);
          break;
        case "edit":
          store.edit(SESSION_ID, stale[0].id, "rewritten");
          break;
        case "clear":
          store.clear(SESSION_ID);
          break;
        case "reorder":
          store.reorder(SESSION_ID, stale);
          break;
        case "setItemStatus":
          store.setItemStatus(SESSION_ID, stale[0].id, "pending");
          break;
        case "enqueue":
          store.enqueue(SESSION_ID, { text: "later" });
          break;
        case "setRunState":
          store.setRunState(SESSION_ID, "paused");
          break;
        case "persistToStorage":
          store.persistToStorage(SESSION_ID);
          break;
        case "applyRemoteItems":
          store.applyRemoteItems(SESSION_ID, []);
          break;
      }
      expect(
        JSON.parse(localStorage.getItem(getStorageKey(SESSION_ID))!).items[0],
      ).toEqual(claimed);
      resetStore();
      store.loadFromStorage(SESSION_ID);
      expect(store.getQueue(SESSION_ID)[0]).toEqual(claimed);
      expect(store.beginSteering(SESSION_ID, stale[0].id, "run-b")).toBe(false);
    },
  );

  it.each(["applied", "returned", "new-attempt"] as const)(
    "does not resurrect a once-steered message from late pending or steering snapshots after %s",
    (terminal) => {
      const store = useMessageQueueStore.getState();
      store.enqueue(SESSION_ID, { text: "deliver this instruction only once" });
      const beforeClaim = store.getQueue(SESSION_ID)[0];
      store.beginSteering(SESSION_ID, beforeClaim.id, "run-a");
      const oldClaim = store.getQueue(SESSION_ID)[0];
      const requestId = oldClaim.steering!.requestId;
      store.resolveSteering(
        SESSION_ID,
        oldClaim.id,
        requestId,
        terminal === "applied" ? "applied" : "returned",
        "original turn ended",
      );
      if (terminal === "new-attempt") {
        store.setItemStatus(SESSION_ID, oldClaim.id, "pending");
        store.beginSteering(SESSION_ID, oldClaim.id, "run-b");
      }
      const canonical = store.getQueue(SESSION_ID);
      // Reopen the tab before either delayed snapshot is delivered; protection
      // must survive memory loss and application removing the queue key.
      resetStore();
      store.applyRemoteItems(SESSION_ID, [beforeClaim]);
      expect(store.getQueue(SESSION_ID)).toEqual(canonical);
      store.applyRemoteItems(SESSION_ID, [oldClaim]);
      expect(store.getQueue(SESSION_ID)).toEqual(canonical);
      store.reorder(SESSION_ID, [beforeClaim]);
      expect(store.getQueue(SESSION_ID)).toEqual(canonical);
      store.persistToStorage(SESSION_ID);
      resetStore();
      store.loadFromStorage(SESSION_ID);
      expect(store.getQueue(SESSION_ID)).toEqual(canonical);
    },
  );

  it("ignores late receipt callbacks after an applied item removed its persisted queue", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue(SESSION_ID, { text: "once" });
    const target = store.getQueue(SESSION_ID)[0];
    store.beginSteering(SESSION_ID, target.id, "run-a");
    const claimed = store.getQueue(SESSION_ID)[0];
    const requestId = claimed.steering!.requestId;
    store.resolveSteering(SESSION_ID, target.id, requestId, "applied");
    useMessageQueueStore.setState({ queues: { [SESSION_ID]: [claimed] } });
    expect(
      store.resolveSteering(SESSION_ID, target.id, requestId, "returned"),
    ).toBe(false);
    expect(
      store.setSteeringError(SESSION_ID, target.id, requestId, "old timeout"),
    ).toBe(false);
    store.enqueue(SESSION_ID, { text: "genuinely new work" });
    expect(store.getQueue(SESSION_ID).map((item) => item.text)).toEqual([
      "genuinely new work",
    ]);
  });

  it.each(["journal", "claim"] as const)(
    "retains the pending text and refuses steering when %s persistence fails",
    (failure) => {
      const store = useMessageQueueStore.getState();
      store.enqueue(SESSION_ID, { text: "preserve on storage failure" });
      const target = store.getQueue(SESSION_ID)[0];
      const setItem = vi.mocked(localStorage.setItem);
      const originalSetItem = setItem.getMockImplementation()!;
      setItem.mockImplementation((key, value) => {
        const isJournal = key === `qwenpaw:queue-steering-claims:${SESSION_ID}`;
        const isClaim =
          key === getStorageKey(SESSION_ID) &&
          JSON.parse(value).items.some(
            (item: QueueItem) => item.status === "steering",
          );
        if (
          (failure === "journal" && isJournal) ||
          (failure === "claim" && isClaim)
        )
          throw new DOMException(
            "Storage quota exceeded",
            "QuotaExceededError",
          );
        originalSetItem(key, value);
      });
      try {
        expect(store.beginSteering(SESSION_ID, target.id, "run-a")).toBe(false);
        expect(store.getQueue(SESSION_ID)).toEqual([target]);
        resetStore();
        store.loadFromStorage(SESSION_ID);
        expect(store.getQueue(SESSION_ID)).toEqual([target]);
      } finally {
        setItem.mockImplementation(originalSetItem);
      }
    },
  );

  it("does not erase unresolved steering through the legacy storage cleanup helper", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue(SESSION_ID, { text: "keep receipt ownership" });
    const target = store.getQueue(SESSION_ID)[0];
    store.beginSteering(SESSION_ID, target.id, "run-a");
    const claimed = store.getQueue(SESSION_ID)[0];
    removeQueueFromStorage(SESSION_ID);
    resetStore();
    store.loadFromStorage(SESSION_ID);
    expect(store.getQueue(SESSION_ID)).toEqual([claimed]);
  });

  it.each(["error", "paused"] as const)(
    "preserves authoritative %s before and after a late remote running snapshot for a steered queue",
    (runState) => {
      const store = useMessageQueueStore.getState();
      store.enqueue(SESSION_ID, { text: "ordinary pending head" });
      store.enqueue(SESSION_ID, { text: "guidance after the head" });
      const guide = store.getQueue(SESSION_ID)[1];
      store.beginSteering(SESSION_ID, guide.id, "run-a");
      const staleItems = store.getQueue(SESSION_ID);
      if (runState === "error")
        store.resolveSteering(
          SESSION_ID,
          guide.id,
          staleItems[1].steering!.requestId,
          "returned",
          "turn ended",
        );
      else store.setRunState(SESSION_ID, "paused");
      const canonicalItems = store.getQueue(SESSION_ID);
      // Before the delayed remote event even arrives, a stale tab's getter
      // must honor the current durable pause/error instead of sending its head.
      useMessageQueueStore.setState({ runStates: { [SESSION_ID]: "running" } });
      expect(store.getRunState(SESSION_ID)).toBe(runState);
      store.applyRemoteRunState(SESSION_ID, "running");
      store.applyRemoteItems(SESSION_ID, staleItems);
      expect(store.getRunState(SESSION_ID)).toBe(runState);
      expect(useMessageQueueStore.getState().runStates[SESSION_ID]).toBe(
        runState,
      );
      expect(store.getQueue(SESSION_ID)).toEqual(canonicalItems);
      expect(
        JSON.parse(localStorage.getItem(getStorageKey(SESSION_ID))!).runState,
      ).toBe(runState);
    },
  );

  it.each([
    "enqueue",
    "edit",
    "remove",
    "reorder",
    "setItemStatus",
    "persistToStorage",
    "reconcileHistory",
    "migrateQueue",
  ] as const)(
    "does not write stale running over a returned steering error when a stale tab calls %s",
    (action) => {
      const store = useMessageQueueStore.getState();
      store.enqueue(SESSION_ID, { text: "ordinary head" });
      store.enqueue(SESSION_ID, { text: "returned guide" });
      const [head, guide] = store.getQueue(SESSION_ID);
      store.beginSteering(SESSION_ID, guide.id, "run-a");
      store.resolveSteering(
        SESSION_ID,
        guide.id,
        store.getQueue(SESSION_ID)[1].steering!.requestId,
        "returned",
        "turn ended",
      );
      useMessageQueueStore.setState({ runStates: { [SESSION_ID]: "running" } });
      switch (action) {
        case "enqueue":
          store.enqueue(SESSION_ID, { text: "new work" });
          break;
        case "edit":
          store.edit(SESSION_ID, head.id, "edited ordinary head");
          break;
        case "remove":
          store.remove(SESSION_ID, head.id);
          break;
        case "reorder":
          store.reorder(SESSION_ID, [...store.getQueue(SESSION_ID)].reverse());
          break;
        case "setItemStatus":
          store.setItemStatus(SESSION_ID, head.id, "sending");
          break;
        case "persistToStorage":
          store.persistToStorage(SESSION_ID);
          break;
        case "reconcileHistory":
          store.reconcileHistory(SESSION_ID, "default", [
            {
              role: "user",
              metadata: { qwenpaw_client_message_id: head.clientMessageId },
            },
          ]);
          break;
        case "migrateQueue":
          store.migrateQueue(SESSION_ID, "moved-steering-queue");
          break;
      }
      const destination =
        action === "migrateQueue" ? "moved-steering-queue" : SESSION_ID;
      const saved = JSON.parse(
        localStorage.getItem(getStorageKey(destination))!,
      );
      expect(saved.runState).toBe("error");
      expect(saved.items).toContainEqual(
        expect.objectContaining({ id: guide.id, status: "failed" }),
      );
      expect(store.getRunState(destination)).toBe("error");
    },
  );

  it.each([
    "setSteeringError",
    "beginSteering",
    "resolveSteering",
    "clear",
  ] as const)(
    "keeps a durable pause when a stale steering tab calls %s",
    (action) => {
      const store = useMessageQueueStore.getState();
      store.enqueue(SESSION_ID, { text: "ordinary head" });
      store.enqueue(SESSION_ID, { text: "pending guidance" });
      const [head, guide] = store.getQueue(SESSION_ID);
      store.beginSteering(SESSION_ID, guide.id, "run-a");
      const requestId = store.getQueue(SESSION_ID)[1].steering!.requestId;
      store.setRunState(SESSION_ID, "paused");
      useMessageQueueStore.setState({ runStates: { [SESSION_ID]: "running" } });
      switch (action) {
        case "setSteeringError":
          store.setSteeringError(SESSION_ID, guide.id, requestId, "confirming");
          break;
        case "beginSteering":
          store.beginSteering(SESSION_ID, head.id, "run-a");
          break;
        case "resolveSteering":
          store.resolveSteering(SESSION_ID, guide.id, requestId, "applied");
          break;
        case "clear":
          store.clear(SESSION_ID);
          break;
      }
      expect(store.getRunState(SESSION_ID)).toBe("paused");
      expect(
        JSON.parse(localStorage.getItem(getStorageKey(SESSION_ID))!).runState,
      ).toBe("paused");
    },
  );

  it("allows explicit retry and resume after steering returns while ignoring an older remote error snapshot", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue(SESSION_ID, { text: "ordinary head" });
    store.enqueue(SESSION_ID, { text: "guide to retry" });
    const guide = store.getQueue(SESSION_ID)[1];
    store.beginSteering(SESSION_ID, guide.id, "run-a");
    const firstRequest = store.getQueue(SESSION_ID)[1].steering!.requestId;
    store.resolveSteering(
      SESSION_ID,
      guide.id,
      firstRequest,
      "returned",
      "turn ended",
    );
    const oldErrorItems = store.getQueue(SESSION_ID);
    store.setItemStatus(SESSION_ID, guide.id, "pending");
    store.setRunState(SESSION_ID, "running");
    store.applyRemoteRunState(SESSION_ID, "error");
    store.applyRemoteItems(SESSION_ID, oldErrorItems);
    expect(store.getRunState(SESSION_ID)).toBe("running");
    expect(store.getQueue(SESSION_ID)[1]).toMatchObject({
      id: guide.id,
      status: "pending",
    });
    expect(store.beginSteering(SESSION_ID, guide.id, "run-b")).toBe(true);
    const retry = store.getQueue(SESSION_ID)[1];
    expect(retry.steering!.requestId).not.toBe(firstRequest);
    store.setRunState(SESSION_ID, "paused");
    store.setRunState(SESSION_ID, "running");
    store.applyRemoteRunState(SESSION_ID, "paused");
    expect(store.getRunState(SESSION_ID)).toBe("running");
  });

  it("keeps remote run-state updates unchanged for queues that never used steering", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue(SESSION_ID, { text: "ordinary only" });
    store.setRunState(SESSION_ID, "paused");
    store.applyRemoteRunState(SESSION_ID, "running");
    expect(store.getRunState(SESSION_ID)).toBe("running");
    expect(
      JSON.parse(localStorage.getItem(getStorageKey(SESSION_ID))!).runState,
    ).toBe("paused");
  });

  // ---------------------------------------------------------------------------
  // setRunState / getRunState / persistToStorage
  // ---------------------------------------------------------------------------

  it("setRunState updates the runState and persists it with the items", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });

    useMessageQueueStore.getState().setRunState(SESSION_ID, "paused");

    expect(useMessageQueueStore.getState().getRunState(SESSION_ID)).toBe(
      "paused",
    );
    const parsed = JSON.parse(
      localStorage.getItem(getStorageKey(SESSION_ID)) as string,
    );
    expect(parsed.runState).toBe("paused");
  });

  it("setRunState with 'running' then 'idle' cycles the persisted state", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });
    useMessageQueueStore.getState().setRunState(SESSION_ID, "running");
    useMessageQueueStore.getState().setRunState(SESSION_ID, "idle");

    const parsed = JSON.parse(
      localStorage.getItem(getStorageKey(SESSION_ID)) as string,
    );
    expect(parsed.runState).toBe("idle");
  });

  // ---------------------------------------------------------------------------
  // setCurrentSendingId
  // ---------------------------------------------------------------------------

  it("setCurrentSendingId stores the id and can be cleared with null", () => {
    useMessageQueueStore.getState().setCurrentSendingId("abc");
    expect(useMessageQueueStore.getState().currentSendingId).toBe("abc");
    useMessageQueueStore.getState().setCurrentSendingId(null);
    expect(useMessageQueueStore.getState().currentSendingId).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // consumeMigratedTo
  // ---------------------------------------------------------------------------

  it("consumeMigratedTo returns the stored destination then resets to null", () => {
    useMessageQueueStore.getState().enqueue("src", { text: "s" });
    useMessageQueueStore.getState().migrateQueue("src", "dst");

    expect(useMessageQueueStore.getState().consumeMigratedTo()).toBe("dst");
    expect(useMessageQueueStore.getState().consumeMigratedTo()).toBeNull();
  });

  it("consumeMigratedTo returns null when no migration has happened", () => {
    expect(useMessageQueueStore.getState().consumeMigratedTo()).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // persistToStorage / loadFromStorage
  // ---------------------------------------------------------------------------

  it("persistToStorage writes the current items + runState to localStorage", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });
    useMessageQueueStore.getState().setRunState(SESSION_ID, "paused");

    // Wipe storage then re-persist.
    localStorage.removeItem(getStorageKey(SESSION_ID));
    useMessageQueueStore.getState().persistToStorage(SESSION_ID);

    const parsed = JSON.parse(
      localStorage.getItem(getStorageKey(SESSION_ID)) as string,
    );
    expect(parsed.items).toHaveLength(1);
    expect(parsed.runState).toBe("paused");
  });

  it("loadFromStorage restores items and respects persisted 'paused' runState", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });
    useMessageQueueStore.getState().setRunState(SESSION_ID, "paused");

    resetStore();
    useMessageQueueStore.getState().loadFromStorage(SESSION_ID);

    const queue = useMessageQueueStore.getState().getQueue(SESSION_ID);
    expect(queue).toHaveLength(1);
    expect(queue[0].text).toBe("x");
    expect(useMessageQueueStore.getState().getRunState(SESSION_ID)).toBe(
      "paused",
    );
  });

  it("loadFromStorage resets a persisted non-paused runState to 'idle'", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "x" });
    useMessageQueueStore.getState().setRunState(SESSION_ID, "running");

    resetStore();
    useMessageQueueStore.getState().loadFromStorage(SESSION_ID);

    expect(useMessageQueueStore.getState().getRunState(SESSION_ID)).toBe(
      "idle",
    );
  });

  it("loadFromStorage clears stale in-memory state when no stored entry exists", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "stale" });

    removeQueueFromStorage(SESSION_ID);
    useMessageQueueStore.getState().loadFromStorage(SESSION_ID);

    expect(useMessageQueueStore.getState().getQueue(SESSION_ID)).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // applyRemoteItems / applyRemoteRunState
  // ---------------------------------------------------------------------------

  it("applyRemoteItems replaces the in-memory queue for the session", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "local" });
    const remote = [
      {
        id: "remote-1",
        text: "remote",
        status: "pending" as const,
        retryCount: 0,
        createdAt: 1,
      },
    ];

    useMessageQueueStore.getState().applyRemoteItems(SESSION_ID, remote);

    expect(useMessageQueueStore.getState().getQueue(SESSION_ID)).toEqual(
      remote,
    );
  });

  it("applyRemoteItems with an empty list deletes the session queue", () => {
    useMessageQueueStore.getState().enqueue(SESSION_ID, { text: "local" });

    useMessageQueueStore.getState().applyRemoteItems(SESSION_ID, []);

    expect(useMessageQueueStore.getState().getQueue(SESSION_ID)).toEqual([]);
    expect(SESSION_ID in useMessageQueueStore.getState().queues).toBe(false);
  });

  it("applyRemoteRunState sets the runState without broadcasting", () => {
    useMessageQueueStore.getState().applyRemoteRunState(SESSION_ID, "error");

    expect(useMessageQueueStore.getState().getRunState(SESSION_ID)).toBe(
      "error",
    );
  });

  // ---------------------------------------------------------------------------
  // withSendLock — falls back to direct execution in jsdom (no navigator.locks)
  // ---------------------------------------------------------------------------

  it("withSendLock runs the callback and returns its result when Web Locks is unavailable", async () => {
    // jsdom does not implement navigator.locks, so this exercises the fallback path.
    const result = await withSendLock(SESSION_ID, () => "done");
    expect(result).toBe("done");
  });

  it("withSendLock propagates async results through the fallback path", async () => {
    const result = await withSendLock(SESSION_ID, async () => 42);
    expect(result).toBe(42);
  });

  it("withAvailableOwnershipLock runs directly when Web Locks is unavailable", async () => {
    const result = await withAvailableOwnershipLock(
      SESSION_ID,
      async () => "background",
    );
    expect(result).toBe("background");
  });

  it("withBackgroundSendLock skips background work when another tab owns the conversation", async () => {
    const originalLocks = (navigator as Navigator & { locks?: unknown }).locks;
    const request = vi.fn(
      async (
        _name: string,
        _options: unknown,
        callback: (lock: unknown) => Promise<unknown>,
      ) => callback(null),
    );
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: { request },
    });
    const callback = vi.fn(() => "should-not-run");

    try {
      const result = await withBackgroundSendLock(SESSION_ID, callback);

      expect(result).toBeNull();
      expect(callback).not.toHaveBeenCalled();
      expect(request).toHaveBeenCalledWith(
        `qwenpaw:queue-owner:${SESSION_ID}`,
        { mode: "exclusive", ifAvailable: true },
        expect.any(Function),
      );
    } finally {
      Object.defineProperty(navigator, "locks", {
        configurable: true,
        value: originalLocks,
      });
    }
  });

  it("withBackgroundSendLock drains when no foreground owner exists", async () => {
    const originalLocks = (navigator as Navigator & { locks?: unknown }).locks;
    const request = vi.fn(
      async (
        _name: string,
        _options: unknown,
        callback: (lock: unknown) => Promise<unknown>,
      ) => callback({ name: `qwenpaw:queue-owner:${SESSION_ID}` }),
    );
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: { request },
    });
    const callback = vi.fn(() => "drained");

    try {
      await expect(withBackgroundSendLock(SESSION_ID, callback)).resolves.toBe(
        "drained",
      );
      expect(callback).toHaveBeenCalledOnce();
      expect(request).toHaveBeenNthCalledWith(
        1,
        `qwenpaw:queue-owner:${SESSION_ID}`,
        { mode: "exclusive", ifAvailable: true },
        expect.any(Function),
      );
      expect(request).toHaveBeenNthCalledWith(
        2,
        `qwenpaw:queue-send:${SESSION_ID}`,
        { ifAvailable: true },
        expect.any(Function),
      );
    } finally {
      Object.defineProperty(navigator, "locks", {
        configurable: true,
        value: originalLocks,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // holdOwnershipLock — fires onAcquired immediately when Web Locks unavailable
  // ---------------------------------------------------------------------------

  it("holdOwnershipLock calls onAcquired synchronously when Web Locks is unavailable", async () => {
    const onAcquired = vi.fn();
    const controller = new AbortController();

    await holdOwnershipLock(SESSION_ID, onAcquired, controller.signal);

    expect(onAcquired).toHaveBeenCalled();
    controller.abort();
  });
});

describe("upstream queue regressions", () => {
  it("enqueue clones and persists frozen business parameters", () => {
    resetStore();
    localStorage.clear();
    const bizParams = {
      session_id: "session-a",
      user_id: "u1",
      channel: "web",
      request_context: { source: "console_chat_queue" },
    };
    useMessageQueueStore.getState().enqueue(SESSION_ID, {
      agentId: "agent-a",
      text: "hi",
      bizParams,
    });

    bizParams.session_id = "session-b";
    bizParams.request_context.source = "changed";

    const item = useMessageQueueStore.getState().getQueue(SESSION_ID)[0];
    expect(item.bizParams).toEqual({
      session_id: "session-a",
      user_id: "u1",
      channel: "web",
      request_context: { source: "console_chat_queue" },
    });

    resetStore();
    useMessageQueueStore.getState().loadFromStorage(SESSION_ID);
    expect(
      useMessageQueueStore.getState().getQueue(SESSION_ID)[0].bizParams,
    ).toEqual({
      session_id: "session-a",
      user_id: "u1",
      channel: "web",
      request_context: { source: "console_chat_queue" },
    });
  });
});

describe("upstream queue regressions", () => {
  it("does not request background ownership after it is aborted", async () => {
    const request = vi.fn();
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: { request },
    });
    const controller = new AbortController();
    controller.abort();

    const result = await withBackgroundSendLock(
      SESSION_ID,
      vi.fn(),
      controller.signal,
    );

    expect(result).toBeNull();
    expect(request).not.toHaveBeenCalled();
  });
});

describe("main queue snapshot compatibility", () => {
  it("restores the captured backend identity from main's persisted format", () => {
    resetStore();
    localStorage.clear();
    const item = {
      id: "main-item",
      text: "queued",
      agentId: "agent-a",
      status: "pending",
      retryCount: 0,
      createdAt: 1,
      bizParams: {
        session_id: "runtime-a",
        user_id: "user-a",
        channel: "console",
        request_context: { agent_id: "agent-a", chat_id: "chat-a" },
      },
    } as QueueItem;
    localStorage.setItem(
      getStorageKey("chat-a"),
      JSON.stringify({
        version: 2,
        items: [item],
        runState: "paused",
      }),
    );
    const store = useMessageQueueStore.getState();
    store.loadFromStorage("chat-a");
    expect(store.getQueue("chat-a")[0]).toMatchObject({
      backendSessionId: "runtime-a",
      userId: "user-a",
      channel: "console",
      requestContext: { agent_id: "agent-a", chat_id: "chat-a" },
    });
    store.applyRemoteItems("chat-b", [item]);
    expect(store.getQueue("chat-b")[0].backendSessionId).toBe("runtime-a");
  });

  it("recovers main's Agent-scoped draft without dispatching it as a Chat", async () => {
    resetStore();
    localStorage.clear();
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    });
    const store = useMessageQueueStore.getState();
    store.enqueue("new:agent-a", { text: "draft", agentId: "agent-a" });
    store.setRunState("new:agent-a", "paused");
    expect(isDraftQueueKey("new:agent-a")).toBe(true);
    await recoverLegacyDraftQueue(getQueueKey("agent-a"));
    expect(store.getQueue(getQueueKey("agent-a"))[0].text).toBe("draft");
    expect(store.getRunState(getQueueKey("agent-a"))).toBe("paused");
    expect(store.getQueue("new:agent-a")).toEqual([]);
  });
});
