import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  chatApi,
  type ChatSteeringState,
  type SteeringReceipt,
} from "../../../api/modules/chat";
import { ApiError, request } from "../../../api/request";
import i18n, { i18nReady } from "../../../i18n";
import {
  useMessageQueueStore,
  type QueueItem,
} from "../../../stores/messageQueueStore";
import MessageQueuePanel from "../components/MessageQueuePanel";
import { recoverQueuedSteering } from "../queueSteeringRecovery";
import { useQueueSteering } from "./useQueueSteering";

// Keep the actual API routes, request bodies, hook, store and queue controls.
// Only the HTTP transport is replaced with a deterministic synthetic server.
vi.mock("../../../api/request", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../api/request")>()),
  request: vi.fn(),
}));

type Options = Parameters<typeof useQueueSteering>[0];
type RequestOptions = Parameters<typeof request>[1];
const initialOptions: Options = {
  chatId: "chat-a",
  queueKey: "chat-a",
  agentId: "agent-a",
  enabled: true,
  isOwner: true,
};

function resetMemory() {
  useMessageQueueStore.setState({
    queues: {},
    runStates: {},
    currentSendingId: null,
    lastMigratedTo: null,
  });
}

function enqueue(
  text = "Check the source dates before continuing",
  options = initialOptions,
) {
  const store = useMessageQueueStore.getState();
  store.enqueue(options.queueKey, {
    text,
    agentId: options.agentId,
    backendSessionId: `runtime-${options.chatId}`,
  });
  const items = store.getQueue(options.queueKey);
  return items[items.length - 1];
}

function receiptFor(
  item: QueueItem,
  status: SteeringReceipt["status"],
): SteeringReceipt {
  return {
    request_id: item.steering!.requestId,
    run_id: item.steering!.runId,
    text: item.text,
    status,
  };
}

function postedReceipt(
  options: RequestOptions,
  status: SteeringReceipt["status"] = "pending",
): SteeringReceipt {
  const body = JSON.parse(String(options?.body));
  return {
    request_id: body.request_id,
    run_id: body.expected_run_id,
    text: body.text,
    status,
  };
}

function transport(
  handler: (
    path: string,
    options: RequestOptions,
  ) => unknown | Promise<unknown>,
) {
  vi.mocked(request).mockImplementation(async (path, options) =>
    handler(path, options),
  );
}

function state(
  receipts: SteeringReceipt[] = [],
  runId: string | null = "run-a",
  supported = true,
): ChatSteeringState {
  return { active_run_id: runId, supported, receipts };
}

function Harness(options: Options) {
  const steering = useQueueSteering(options);
  const items = useMessageQueueStore((store) => store.queues[options.queueKey]);
  const runState = useMessageQueueStore(
    (store) => store.runStates[options.queueKey],
  );
  const store = useMessageQueueStore.getState();
  return (
    <>
      <span data-testid="active-run">{steering.activeRunId ?? "none"}</span>
      <span data-testid="history-revision">{steering.historyRevision}</span>
      <MessageQueuePanel
        items={items ?? []}
        runState={runState ?? "idle"}
        steeringRunId={steering.activeRunId}
        steeringAgentId={options.agentId}
        onSteer={steering.steer}
        onRemove={(id) => store.remove(options.queueKey, id)}
        onEdit={(id, text) => store.edit(options.queueKey, id, text)}
        onReorder={(next) => store.reorder(options.queueKey, next)}
        onClear={() => store.clear(options.queueKey)}
        onPauseResume={() =>
          store.setRunState(
            options.queueKey,
            runState === "paused" ? "running" : "paused",
          )
        }
        onRetry={(id) => store.setItemStatus(options.queueKey, id, "pending")}
        onSkip={(id) => store.remove(options.queueKey, id)}
        onInterruptAndSend={() => {
          void chatApi.stopChat(options.chatId!, options.agentId);
        }}
      />
    </>
  );
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

async function advance(ms = 1500) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function postCalls() {
  return vi
    .mocked(request)
    .mock.calls.filter(([, options]) => options?.method === "POST");
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

beforeEach(async () => {
  resetMemory();
  localStorage.clear();
  sessionStorage.clear();
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: undefined,
  });
  vi.mocked(request).mockReset();
  await i18nReady;
  await i18n.changeLanguage("en");
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
});

afterEach(() => {
  cleanup();
  resetMemory();
  localStorage.clear();
  sessionStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useQueueSteering with the actual queue panel and store", () => {
  it("steers explicitly without stopping and waits for adoption before removing the queued text", async () => {
    const original = enqueue();
    let receipts: SteeringReceipt[] = [];
    transport((path, options) => {
      if (path === "/chats/chat-a/steering") return state(receipts);
      if (path === "/chats/chat-a/steer") {
        receipts = [postedReceipt(options)];
        return receipts[0];
      }
      throw new Error(`Unexpected request: ${path}`);
    });
    render(<Harness {...initialOptions} />);
    await flush();
    expect(
      screen.getByRole("button", { name: "Steer current answer" }),
    ).toBeEnabled();
    expect(postCalls()).toHaveLength(0);

    fireEvent.click(
      screen.getByRole("button", { name: "Steer current answer" }),
    );
    await flush();
    const pending = useMessageQueueStore.getState().getQueue("chat-a")[0];
    expect(pending).toMatchObject({
      id: original.id,
      text: original.text,
      status: "steering",
    });
    expect(screen.getByRole("status")).toHaveTextContent("Awaiting adoption");
    expect(screen.getByText(original.text)).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Steer current answer" }),
    ).not.toBeInTheDocument();
    expect(postCalls()).toEqual([
      [
        "/chats/chat-a/steer",
        {
          method: "POST",
          headers: { "X-Agent-Id": "agent-a" },
          body: JSON.stringify({
            expected_run_id: "run-a",
            request_id: pending.steering!.requestId,
            text: original.text,
          }),
          signal: undefined,
        },
      ],
    ]);
    expect(screen.getByTestId("history-revision")).toHaveTextContent("1");

    receipts = [receiptFor(pending, "applied")];
    await advance();
    expect(useMessageQueueStore.getState().getQueue("chat-a")).toEqual([]);
    expect(screen.queryByText(original.text)).not.toBeInTheDocument();
    expect(screen.getByTestId("history-revision")).toHaveTextContent("2");
    expect(postCalls()).toHaveLength(1);
  });

  it("keeps the original history dirty when another tab adopts and removes the shared receipt first", async () => {
    const original = enqueue();
    transport((path, options) => {
      if (path === "/chats/chat-a/steering") return state();
      if (path === "/chats/chat-a/steer") return postedReceipt(options);
      throw new Error(`Unexpected request: ${path}`);
    });
    render(<Harness {...initialOptions} />);
    await flush();
    fireEvent.click(
      screen.getByRole("button", { name: "Steer current answer" }),
    );
    await flush();
    const store = useMessageQueueStore.getState();
    const pending = store.getQueue("chat-a")[0];
    expect(pending).toMatchObject({ id: original.id, status: "steering" });
    expect(screen.getByRole("status")).toHaveTextContent("Awaiting adoption");
    expect(screen.getByTestId("history-revision")).toHaveTextContent("1");

    // A non-owner tab can observe an applied receipt first and synchronize
    // its removal. This owner never sees that terminal receipt in its poll.
    act(() => {
      expect(
        store.resolveSteering(
          "chat-a",
          pending.id,
          pending.steering!.requestId,
          "applied",
        ),
      ).toBe(true);
    });
    await flush();
    expect(store.getQueue("chat-a")).toEqual([]);
    expect(screen.getByTestId("history-revision")).toHaveTextContent("1");
    expect(screen.queryByText(original.text)).not.toBeInTheDocument();
    const reads = vi.mocked(request).mock.calls.length;
    await advance(3000);
    expect(vi.mocked(request).mock.calls).toHaveLength(reads);
    expect(postCalls()).toHaveLength(1);
  });

  it("quarantines an uncertain transport result and retries the identical request before receipt recovery", async () => {
    const original = enqueue();
    let receipts: SteeringReceipt[] = [];
    let attempts = 0;
    transport((path, options) => {
      if (path === "/chats/chat-a/steering") return state(receipts);
      if (path === "/chats/chat-a/steer") {
        attempts += 1;
        if (attempts === 1)
          throw new TypeError("Connection dropped after upload");
        receipts = [postedReceipt(options)];
        return receipts[0];
      }
      if (path.startsWith("/chats/chat-a/steering/"))
        throw new ApiError(404, "Unknown receipt");
      throw new Error(`Unexpected request: ${path}`);
    });
    render(<Harness {...initialOptions} />);
    await flush();
    fireEvent.click(
      screen.getByRole("button", { name: "Steer current answer" }),
    );
    await flush();
    const pending = useMessageQueueStore.getState().getQueue("chat-a")[0];
    expect(pending).toMatchObject({
      id: original.id,
      status: "steering",
      errorMessage: i18n.t("chat.queue.steerConfirming"),
    });
    expect(screen.getByRole("status")).toHaveTextContent("Confirming delivery");
    await advance(4500);
    expect(postCalls()).toHaveLength(1);
    expect(useMessageQueueStore.getState().getQueue("chat-a")[0].status).toBe(
      "steering",
    );
    await advance();
    expect(postCalls()).toHaveLength(2);
    expect(postCalls()[1][0]).toBe(postCalls()[0][0]);
    expect(postCalls()[1][1]?.headers).toEqual(postCalls()[0][1]?.headers);
    expect(postCalls()[1][1]?.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(String(postCalls()[1][1]?.body))).toEqual(
      JSON.parse(String(postCalls()[0][1]?.body)),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Awaiting adoption");
    receipts = [receiptFor(pending, "applied")];
    await advance();
    expect(useMessageQueueStore.getState().getQueue("chat-a")).toEqual([]);
    expect(postCalls().every(([path]) => path.endsWith("/steer"))).toBe(true);
  });

  it("preserves a refused run as a failed queue head without sending later messages", async () => {
    const original = enqueue();
    const later = enqueue("Run a separate comparison afterwards");
    transport((path) => {
      if (path === "/chats/chat-a/steering") return state([], "run-a");
      if (path === "/chats/chat-a/steer")
        throw new ApiError("Run identity changed", 409);
      throw new Error(`Unexpected request: ${path}`);
    });
    render(<Harness {...initialOptions} />);
    await flush();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Steer current answer" })[0],
    );
    await flush();
    expect(useMessageQueueStore.getState().getQueue("chat-a")).toEqual([
      {
        ...original,
        status: "failed",
        retryCount: 1,
        errorMessage: i18n.t("chat.queue.steerRejected"),
      },
      later,
    ]);
    expect(useMessageQueueStore.getState().getRunState("chat-a")).toBe("error");
    expect(screen.getByText(original.text)).toBeVisible();
    await advance(6000);
    expect(postCalls()).toHaveLength(1);
  });

  it("restores an unresolved delivery after reload and adopts its receipt after the original run ends", async () => {
    const original = enqueue();
    transport((path) => {
      if (path === "/chats/chat-a/steering") return state();
      if (path === "/chats/chat-a/steer")
        throw new TypeError("Upload response lost");
      throw new Error(`Unexpected request: ${path}`);
    });
    const first = render(<Harness {...initialOptions} />);
    await flush();
    fireEvent.click(
      screen.getByRole("button", { name: "Steer current answer" }),
    );
    await flush();
    const pending = useMessageQueueStore.getState().getQueue("chat-a")[0];
    first.unmount();
    resetMemory();
    useMessageQueueStore.getState().loadFromStorage("chat-a");
    expect(useMessageQueueStore.getState().getQueue("chat-a")[0]).toMatchObject(
      { id: original.id, steering: pending.steering },
    );
    transport((path) => {
      if (path === "/chats/chat-a/steering") return state([], null);
      if (path.endsWith(`/steering/${pending.steering!.requestId}`))
        return receiptFor(pending, "applied");
      throw new Error(`Unexpected request: ${path}`);
    });
    render(<Harness {...initialOptions} />);
    await flush();
    expect(useMessageQueueStore.getState().getQueue("chat-a")).toEqual([]);
    expect(postCalls()).toHaveLength(1);
    expect(screen.getByTestId("active-run")).toHaveTextContent("none");
    expect(screen.getByTestId("history-revision")).toHaveTextContent("1");
  });

  it("never retargets a delayed send receipt after navigating to a different agent and chat", async () => {
    const original = enqueue();
    const oldPost = deferred<SteeringReceipt>();
    const nextOptions = {
      ...initialOptions,
      chatId: "chat-b",
      queueKey: "chat-b",
      agentId: "agent-b",
    };
    const next = enqueue("New agent instruction", nextOptions);
    transport((path) => {
      if (path === "/chats/chat-a/steering") return state();
      if (path === "/chats/chat-a/steer") return oldPost.promise;
      if (path === "/chats/chat-b/steering") return state([], "run-b");
      throw new Error(`Unexpected request: ${path}`);
    });
    const view = render(<Harness {...initialOptions} />);
    await flush();
    fireEvent.click(
      screen.getByRole("button", { name: "Steer current answer" }),
    );
    await flush();
    const pending = useMessageQueueStore.getState().getQueue("chat-a")[0];
    expect(pending.id).toBe(original.id);
    view.rerender(<Harness {...nextOptions} />);
    await flush();
    expect(screen.getByTestId("active-run")).toHaveTextContent("run-b");
    await act(async () => {
      oldPost.resolve(receiptFor(pending, "applied"));
    });
    expect(useMessageQueueStore.getState().getQueue("chat-a")).toEqual([]);
    expect(useMessageQueueStore.getState().getQueue("chat-b")).toEqual([next]);
    expect(screen.getByText(next.text)).toBeVisible();
    expect(screen.getByTestId("history-revision")).toHaveTextContent("0");
    expect(postCalls().map(([path]) => path)).toEqual(["/chats/chat-a/steer"]);
  });

  it("ignores stale availability and an old steering callback when agent ownership changes", async () => {
    const item = enqueue();
    const oldRefresh = deferred<ChatSteeringState>();
    const nextOptions = {
      ...initialOptions,
      chatId: "chat-b",
      queueKey: "chat-b",
      agentId: "agent-b",
    };
    enqueue("Other agent", nextOptions);
    let oldReads = 0;
    transport((path) => {
      if (path === "/chats/chat-a/steering") {
        oldReads += 1;
        return oldReads === 1 ? state() : oldRefresh.promise;
      }
      if (path === "/chats/chat-b/steering") return state([], "run-b", false);
      throw new Error(`Unexpected request: ${path}`);
    });
    const view = renderHook((options: Options) => useQueueSteering(options), {
      initialProps: initialOptions,
    });
    await flush();
    expect(view.result.current.activeRunId).toBe("run-a");
    const oldSteer = view.result.current.steer;
    await advance();
    expect(oldReads).toBe(2);
    view.rerender(nextOptions);
    await flush();
    await act(async () => {
      oldRefresh.resolve(state([], "run-a"));
    });
    expect(view.result.current.activeRunId).toBeNull();
    act(() => oldSteer(item));
    await flush();
    expect(postCalls()).toHaveLength(0);
    expect(useMessageQueueStore.getState().getQueue("chat-a")[0]).toMatchObject(
      { id: item.id, status: "pending" },
    );
  });

  it("does not accept another run's receipt and a non-owner never retries an unknown delivery", async () => {
    const original = enqueue();
    const store = useMessageQueueStore.getState();
    store.beginSteering("chat-a", original.id, "run-a");
    const pending = store.getQueue("chat-a")[0];
    let wrongReceipt = true;
    transport((path) => {
      if (path === "/chats/chat-a/steering") return state([], "run-b");
      if (path.endsWith(`/steering/${pending.steering!.requestId}`)) {
        if (wrongReceipt)
          return { ...receiptFor(pending, "applied"), run_id: "run-b" };
        throw new ApiError(404, "Not yet known");
      }
      throw new Error(`Unexpected request: ${path}`);
    });
    render(<Harness {...initialOptions} isOwner={false} />);
    await flush();
    expect(store.getQueue("chat-a")[0].status).toBe("steering");
    expect(screen.getByTestId("history-revision")).toHaveTextContent("0");
    wrongReceipt = false;
    await advance(9000);
    expect(store.getQueue("chat-a")[0].steering).toEqual(pending.steering);
    expect(postCalls()).toHaveLength(0);
  });
});

describe("background steering receipt recovery", () => {
  it("resolves an applied receipt while paused and preserves the remaining FIFO and agent identity", async () => {
    const original = enqueue();
    const later = enqueue("Wait for manual queue resume");
    const store = useMessageQueueStore.getState();
    store.beginSteering("chat-a", original.id, "run-a");
    store.setRunState("chat-a", "paused");
    const claimed = store.getQueue("chat-a")[0];
    sessionStorage.setItem(
      "qwenpaw-agent-storage",
      JSON.stringify({ state: { selectedAgent: "other-agent" } }),
    );
    transport((path) => {
      if (path === `/chats/chat-a/steering/${claimed.steering!.requestId}`)
        return receiptFor(claimed, "applied");
      throw new Error(`Unexpected request: ${path}`);
    });
    const controller = new AbortController();
    await expect(
      recoverQueuedSteering("chat-a", "chat-a", claimed, controller.signal),
    ).resolves.toBe(true);
    expect(store.getQueue("chat-a")).toEqual([later]);
    expect(store.getRunState("chat-a")).toBe("paused");
    expect(vi.mocked(request).mock.calls).toEqual([
      [
        `/chats/chat-a/steering/${claimed.steering!.requestId}`,
        { headers: { "X-Agent-Id": "agent-a" }, signal: controller.signal },
      ],
    ]);
    expect(postCalls()).toHaveLength(0);
  });

  it("retries an unknown background receipt using the original run id and request id without interrupting", async () => {
    const original = enqueue();
    const store = useMessageQueueStore.getState();
    store.beginSteering("chat-a", original.id, "run-a");
    const claimed = store.getQueue("chat-a")[0];
    const controller = new AbortController();
    transport((path, options) => {
      if (path.endsWith(`/steering/${claimed.steering!.requestId}`))
        throw new ApiError(404, "Not yet stored");
      if (path === "/chats/chat-a/steer") return postedReceipt(options);
      throw new Error(`Unexpected request: ${path}`);
    });
    await expect(
      recoverQueuedSteering("chat-a", "chat-a", claimed, controller.signal),
    ).resolves.toBe(false);
    expect(store.getQueue("chat-a")[0].steering).toEqual(claimed.steering);
    expect(postCalls()).toEqual([
      [
        "/chats/chat-a/steer",
        {
          method: "POST",
          headers: { "X-Agent-Id": "agent-a" },
          body: JSON.stringify({
            expected_run_id: "run-a",
            request_id: claimed.steering!.requestId,
            text: original.text,
          }),
          signal: controller.signal,
        },
      ],
    ]);
  });

  it("keeps uncertain background delivery quarantined and preserves a refused instruction as a failed head", async () => {
    const original = enqueue();
    const later = enqueue("Independent later task");
    const store = useMessageQueueStore.getState();
    store.beginSteering("chat-a", original.id, "run-a");
    const claimed = store.getQueue("chat-a")[0];
    const controller = new AbortController();
    transport(() => {
      throw new TypeError("Offline");
    });
    await expect(
      recoverQueuedSteering("chat-a", "chat-a", claimed, controller.signal),
    ).resolves.toBe(false);
    expect(store.getQueue("chat-a")[0]).toMatchObject({
      id: original.id,
      status: "steering",
      errorMessage: i18n.t("chat.queue.steerConfirming"),
    });
    expect(postCalls()).toHaveLength(0);
    transport((path) => {
      if (path.endsWith(`/steering/${claimed.steering!.requestId}`))
        throw new ApiError(404, "Unknown request");
      if (path === "/chats/chat-a/steer")
        throw new ApiError(409, "Run finished");
      throw new Error(`Unexpected request: ${path}`);
    });
    await expect(
      recoverQueuedSteering("chat-a", "chat-a", claimed, controller.signal),
    ).resolves.toBe(true);
    expect(store.getQueue("chat-a")).toEqual([
      {
        ...original,
        status: "failed",
        retryCount: 1,
        errorMessage: i18n.t("chat.queue.steerRejected"),
      },
      later,
    ]);
    expect(store.getRunState("chat-a")).toBe("error");
  });

  it("ignores a late background receipt after cancellation and rejects mismatched receipt text", async () => {
    const original = enqueue();
    const store = useMessageQueueStore.getState();
    store.beginSteering("chat-a", original.id, "run-a");
    const claimed = store.getQueue("chat-a")[0];
    const late = deferred<SteeringReceipt>();
    transport(() => late.promise);
    const controller = new AbortController();
    const recovering = recoverQueuedSteering(
      "chat-a",
      "chat-a",
      claimed,
      controller.signal,
    );
    controller.abort();
    late.resolve(receiptFor(claimed, "applied"));
    await expect(recovering).resolves.toBe(false);
    expect(store.getQueue("chat-a")[0].status).toBe("steering");
    transport(() => ({
      ...receiptFor(claimed, "applied"),
      text: "A different instruction",
    }));
    await expect(
      recoverQueuedSteering(
        "chat-a",
        "chat-a",
        claimed,
        new AbortController().signal,
      ),
    ).resolves.toBe(false);
    expect(store.getQueue("chat-a")[0].steering).toEqual(claimed.steering);
    expect(postCalls()).toHaveLength(0);
  });
});
