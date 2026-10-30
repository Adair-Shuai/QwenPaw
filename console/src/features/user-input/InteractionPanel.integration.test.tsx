import { useCallback, useReducer } from "react";
import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { renderWithProviders } from "../../test/common_setup";
import i18n from "../../i18n";
import FilesDrawer from "../files-workspace/FilesDrawer";
import { filesDrawerReducer } from "../files-workspace/filesDrawerState";
import { useWorkbenchRequests } from "../files-workspace/useWorkbenchRequests";
import type { FilesDrawerState } from "../files-workspace/types";
import type { FilesWorkspaceScope } from "../files-workspace/filesWorkspaceScope";
import { installHostExternals } from "../../plugins/hostExternals";
import { installHostSdk } from "../../plugins/hostSdk/install";
import { bindChatSubmit } from "../../plugins/hostSdk/chatSubmit";
import { enqueuePluginSubmission } from "../../pages/Chat/pluginSubmission";
import {
  MAX_QUEUE_SIZE,
  useMessageQueueStore,
} from "../../stores/messageQueueStore";
import { removePluginRuntime } from "../../plugins/pluginRuntimeCleanup";
import type {
  InteractionRequest,
  InputValues,
  InteractionRuntime,
} from "./types";

// Native file tabs are not exercised by this suite. The actual drawer, activity
// selection, notification hook, API, draft/delivery code and shipped OpenUI form
// are all mounted; no mock replaces any part of the protected interaction path.
vi.mock("../files-workspace/FilesWorkspace", () => ({ default: () => null }));
vi.mock("../../monacoSetup", () => ({}));
vi.mock("@monaco-editor/react", () => ({
  default: () => null,
  DiffEditor: () => null,
}));

type SessionScope = Extract<FilesWorkspaceScope, { kind: "session" }>;
const chatScope: SessionScope = {
  kind: "session",
  agentId: "interaction-owner",
  sessionId: "route-a",
  chatId: "chat-a",
};
const otherScope: SessionScope = {
  kind: "session",
  agentId: "other-owner",
  sessionId: "route-b",
  chatId: "chat-b",
};
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const response = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status });
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

function request(
  id: string,
  overrides: Partial<InteractionRequest> = {},
): InteractionRequest {
  return {
    id,
    kind: "form",
    title: "计算参数确认（示例）",
    description: "确认尺寸后计算体积或表面积。",
    fields: [
      {
        name: "length",
        label: "长",
        type: "number",
        unit: "m",
        required: true,
        minimum: 0,
        default: 10,
      },
      {
        name: "width",
        label: "宽",
        type: "number",
        unit: "m",
        required: true,
        minimum: 0,
        default: 5,
      },
      {
        name: "height",
        label: "高",
        type: "number",
        unit: "m",
        required: true,
        minimum: 0,
        default: 2,
      },
      {
        name: "mode",
        label: "计算类型",
        type: "select",
        required: true,
        options: [
          { label: "体积", value: "volume" },
          { label: "表面积", value: "surface" },
        ],
      },
    ],
    status: "pending",
    revision: 1,
    values: { length: 10, width: 5, height: 2, mode: "volume" },
    agent_id: chatScope.agentId,
    session_id: "runtime-a",
    created_at: "2026-10-30T00:00:00Z",
    updated_at: "2026-10-30T00:00:00Z",
    ...overrides,
  };
}

function WorkbenchHost({
  scope = chatScope,
  runtimeId = "runtime-a",
  initiallyOpen = true,
}: {
  scope?: SessionScope;
  runtimeId?: string;
  initiallyOpen?: boolean;
}) {
  const [state, dispatch] = useReducer(
    filesDrawerReducer,
    initiallyOpen
      ? ({
          kind: "workspace",
          mode: "interactions",
          trigger: null,
        } satisfies FilesDrawerState)
      : ({ kind: "closed" } satisfies FilesDrawerState),
  );
  const isActive = useCallback(() => true, []);
  const getRuntimeSessionId = useCallback(() => runtimeId, [runtimeId]);
  useWorkbenchRequests({ scope, isActive, getRuntimeSessionId, dispatch });
  return (
    <>
      <button
        onClick={() =>
          dispatch({
            type: "OPEN_WORKSPACE",
            mode: "interactions",
            trigger: null,
          })
        }
      >
        打开工作区
      </button>
      <output data-testid="drawer-state">{state.kind}</output>
      {state.kind !== "closed" && (
        <FilesDrawer
          state={state}
          scope={scope}
          runtimeSessionId={runtimeId}
          dispatch={dispatch}
        />
      )}
    </>
  );
}

interface RecordedCall {
  path: string;
  method: string;
  agent: string | null;
  body: {
    session_id: string;
    expected_revision?: number;
    values?: InputValues;
  };
}

describe("published OpenUI interaction in the native right workspace", () => {
  const namespace = window as unknown as Record<string, unknown>;
  let originalNamespace: unknown;
  let originalLanguage: string;
  let runtime: typeof window.QwenPaw & {
    openui?: InteractionRuntime & { dispose: () => void };
  };
  let records: InteractionRequest[];
  let calls: RecordedCall[];
  let serial = 0;
  let activeId = "";
  let acceptedSubmissions = 0;
  let failNextSubmit = false;
  let failNextQueue = false;
  let holdSubmit: ReturnType<typeof deferred<Response>> | undefined;
  let holdList:
    | { session: string; pending: ReturnType<typeof deferred<Response>> }
    | undefined;
  let disposeChat: (() => void) | undefined;
  let admissionScope = chatScope;
  const admitted = vi.fn(
    async (input: { agentId: string; sessionId: string; query: string }) => {
      enqueuePluginSubmission(input, {
        active: true,
        ready: true,
        agentId: admissionScope.agentId,
        currentSessionId: admissionScope.sessionId,
        queueKey: admissionScope.sessionId,
        resolveIdentity: (id) => {
          const source = [chatScope.sessionId, chatScope.chatId].includes(id)
            ? chatScope
            : otherScope;
          return {
            sdkSessionId: source.sessionId,
            chatId: source.chatId,
            sessionId: source === chatScope ? "runtime-a" : "runtime-b",
            userId: "interaction-user",
            channel: "console",
          };
        },
        prepareQuery: (query) => query,
        requestContext: { source: "interaction-panel" },
        queueFullMessage: "Queue full",
        staleMessage: "请回到原来的对话后再提交。",
      });
    },
  );

  const fetchNetwork = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), window.location.origin);
      const path = url.pathname.replace(/^\/api/, "");
      if (!path.startsWith("/openui/interactions"))
        throw new Error(`Unexpected network request ${url}`);
      const method = init?.method || "GET";
      const agent = new Headers(init?.headers).get("X-Agent-Id");
      const body: RecordedCall["body"] = init?.body
        ? JSON.parse(String(init.body))
        : { session_id: url.searchParams.get("session_id") || "" };
      calls.push({ path, method, agent, body: clone(body) });
      if (method === "GET") {
        if (holdList?.session === body.session_id)
          return holdList.pending.promise;
        return response({
          requests: records.filter(
            (item) =>
              item.agent_id === agent && item.session_id === body.session_id,
          ),
        });
      }
      if (path.endsWith("/demo")) {
        const created = request(activeId);
        records.push(created);
        return response(created);
      }
      const [, id, action] =
        path.match(/\/interactions\/([^/]+)\/(draft|submit|queued|cancel)$/) ||
        [];
      const current = records.find(
        (item) =>
          item.id === id &&
          item.agent_id === agent &&
          item.session_id === body.session_id,
      );
      if (!current) return response({ detail: "Interaction not found" }, 404);
      if (action === "submit" && holdSubmit) return holdSubmit.promise;
      if (action === "submit" && failNextSubmit) {
        failNextSubmit = false;
        return response({ detail: "计算参数暂时未能保存，请重试。" }, 503);
      }
      if (action === "queued" && failNextQueue) {
        failNextQueue = false;
        return response({ detail: "发送回执暂时未能保存，请重试。" }, 503);
      }
      if (action === "queued") {
        current.delivery_status = "queued";
        return response(current);
      }
      if (action === "submit" && current.status === "submitted") {
        if (JSON.stringify(body.values) !== JSON.stringify(current.answer))
          return response({ detail: "Answer conflict" }, 409);
        return response({
          request: current,
          continuation: current.continuation,
        });
      }
      if (body.expected_revision !== current.revision)
        return response({ detail: "Revision conflict" }, 409);
      if (action === "draft") {
        current.values = clone(body.values!);
        current.revision += 1;
        return response(current);
      }
      if (action === "cancel") {
        current.status = "cancelled";
        current.revision += 1;
        return response(current);
      }
      acceptedSubmissions += 1;
      Object.assign(current, {
        status: "submitted",
        answer: clone(body.values!),
        values: clone(body.values!),
        revision: current.revision + 1,
        delivery_status: "pending",
        continuation: `用户已确认请求 ${current.id}：${JSON.stringify(
          body.values,
        )}`,
      });
      return response({ request: current, continuation: current.continuation });
    },
  );

  beforeAll(async () => {
    originalNamespace = namespace.QwenPaw;
    originalLanguage = i18n.language;
    delete namespace.QwenPaw;
    installHostExternals();
    installHostSdk();
    runtime = window.QwenPaw as typeof runtime;
    await i18n.changeLanguage("zh");
    // This imports the release artifact, including the actual OpenUI Renderer,
    // Card and registered business input components, using the host's React.
    // @ts-expect-error Generated release modules intentionally have no declarations.
    await import("../../../../plugins/bundle/qwenpaw-openui/dist/index.js");
    expect(runtime.openui?.InteractionForm).toBeTypeOf("function");
  }, 60_000);

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    records = [];
    calls = [];
    acceptedSubmissions = 0;
    failNextSubmit = false;
    failNextQueue = false;
    holdSubmit = undefined;
    holdList = undefined;
    activeId = `workspace-request-${++serial}`;
    admissionScope = chatScope;
    useMessageQueueStore.setState({
      queues: {},
      runStates: {},
      currentSendingId: null,
    });
    admitted.mockClear();
    fetchNetwork.mockClear();
    vi.stubGlobal("fetch", fetchNetwork);
    disposeChat = bindChatSubmit(admitted).dispose;
  });
  afterEach(() => {
    cleanup();
    disposeChat?.();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
  afterAll(async () => {
    removePluginRuntime("qwenpaw-openui");
    namespace.QwenPaw = originalNamespace;
    await i18n.changeLanguage(originalLanguage);
  }, 30_000);

  it("creates the demo from FilesDrawer, preserves zero and selected parameters in saved drafts, reopens and queues the exact scoped answer", async () => {
    const view = renderWithProviders(<WorkbenchHost />);
    fireEvent.click(
      await screen.findByText("试用参数确认", { selector: "button" }),
    );
    const length = await screen.findByLabelText(/长\s*\(m\)/);
    expect(
      view.container.querySelector('[class*="openui-card"]'),
    ).not.toBeNull();
    fireEvent.change(length, { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/高\s*\(m\)/), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByLabelText(/计算类型/), {
      target: { value: "surface" },
    });
    fireEvent.click(screen.getByText("保存草稿", { selector: "button" }));
    await screen.findByText("草稿已保存到任务。");
    const values = { length: 0, width: 5, height: 8, mode: "surface" };
    expect(calls.find((call) => call.path.endsWith("/demo"))).toMatchObject({
      method: "POST",
      agent: chatScope.agentId,
      body: { session_id: "runtime-a" },
    });
    expect(calls.find((call) => call.path.endsWith("/draft"))).toMatchObject({
      method: "PUT",
      agent: chatScope.agentId,
      body: { session_id: "runtime-a", expected_revision: 1, values },
    });
    fireEvent.click(screen.getByLabelText("关闭", { selector: "button" }));
    expect(screen.queryByRole("form")).toBeNull();
    fireEvent.click(screen.getByText("打开工作区", { selector: "button" }));
    expect(await screen.findByLabelText(/长\s*\(m\)/)).toHaveValue(0);
    expect(screen.getByLabelText(/高\s*\(m\)/)).toHaveValue(8);
    expect(screen.getByLabelText(/计算类型/)).toHaveValue("surface");
    fireEvent.click(screen.getByText("确认并继续", { selector: "button" }));
    await screen.findByText("答复已保存并加入对话队列。执行进度请查看聊天。");
    expect(calls.find((call) => call.path.endsWith("/submit"))).toMatchObject({
      method: "POST",
      agent: chatScope.agentId,
      body: { session_id: "runtime-a", expected_revision: 2, values },
    });
    expect(admitted).toHaveBeenCalledExactlyOnceWith({
      agentId: chatScope.agentId,
      sessionId: chatScope.sessionId,
      query: records[0].continuation,
    });
    expect(
      useMessageQueueStore.getState().getQueue(chatScope.sessionId),
    ).toEqual([
      expect.objectContaining({
        text: records[0].continuation,
        agentId: chatScope.agentId,
        backendSessionId: "runtime-a",
      }),
    ]);
    expect(calls.filter((call) => call.path.endsWith("/queued"))).toHaveLength(
      1,
    );
    expect(records[0]).toMatchObject({
      answer: values,
      status: "submitted",
      delivery_status: "queued",
    });
    expect(screen.getByLabelText(/长\s*\(m\)/)).toBeDisabled();
  }, 30_000);

  it("keeps false and zero after a rejected submit and accepts one retry without duplicate submission from a double click", async () => {
    const record = request(activeId);
    record.fields.push({
      name: "corrected",
      label: "采用修正",
      type: "boolean",
      required: true,
    });
    record.values.corrected = true;
    records.push(record);
    failNextSubmit = true;
    renderWithProviders(<WorkbenchHost />);
    fireEvent.change(await screen.findByLabelText(/长\s*\(m\)/), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/采用修正/), {
      target: { value: "false" },
    });
    const submit = screen.getByText("确认并继续", { selector: "button" });
    act(() => {
      fireEvent.click(submit);
      fireEvent.click(submit);
    });
    await screen.findByText("计算参数暂时未能保存，请重试。");
    expect(calls.filter((call) => call.path.endsWith("/submit"))).toHaveLength(
      1,
    );
    expect(admitted).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/长\s*\(m\)/)).toHaveValue(0);
    expect(screen.getByLabelText(/采用修正/)).toHaveValue("false");
    fireEvent.click(screen.getByText("确认并继续", { selector: "button" }));
    await screen.findByText("答复已保存并加入对话队列。执行进度请查看聊天。");
    expect(records[0].answer).toMatchObject({ length: 0, corrected: false });
    expect(acceptedSubmissions).toBe(1);
    expect(admitted).toHaveBeenCalledTimes(1);
  }, 30_000);

  it("retries a failed queued acknowledgement after remount without sending the saved answer to chat twice", async () => {
    records.push(request(activeId));
    failNextQueue = true;
    renderWithProviders(<WorkbenchHost />);
    fireEvent.change(await screen.findByLabelText(/长\s*\(m\)/), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByText("确认并继续", { selector: "button" }));
    await screen.findByText("发送回执暂时未能保存，请重试。");
    expect(admitted).toHaveBeenCalledTimes(1);
    expect(records[0]).toMatchObject({
      status: "submitted",
      delivery_status: "pending",
      answer: { length: 0 },
    });
    fireEvent.click(screen.getByLabelText("关闭", { selector: "button" }));
    fireEvent.click(screen.getByText("打开工作区", { selector: "button" }));
    fireEvent.click(
      await screen.findByText("继续任务／重试发送", { selector: "button" }),
    );
    await screen.findByText("答复已保存并加入对话队列。执行进度请查看聊天。");
    expect(admitted).toHaveBeenCalledTimes(1);
    expect(acceptedSubmissions).toBe(1);
    expect(calls.filter((call) => call.path.endsWith("/queued"))).toHaveLength(
      2,
    );
    expect(records[0].answer?.length).toBe(0);
  }, 30_000);

  it("discovers requests through useWorkbenchRequests, ignores another scope, and leaves the form being edited selected", async () => {
    records.push(request(activeId));
    renderWithProviders(<WorkbenchHost initiallyOpen={false} />);
    const length = await screen.findByLabelText(/长\s*\(m\)/);
    fireEvent.change(length, { target: { value: "17" } });
    records.unshift(request(`${activeId}-new`, { title: "另一个待确认请求" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3100);
    });
    expect(screen.getByLabelText(/长\s*\(m\)/)).toBe(length);
    expect(length).toHaveValue(17);
    expect(screen.getByRole("form")).toHaveAttribute(
      "aria-label",
      "计算参数确认（示例）",
    );
    fireEvent.click(screen.getByLabelText("关闭", { selector: "button" }));
    act(() =>
      window.dispatchEvent(
        new CustomEvent("qwenpaw:open-interaction-workbench", {
          detail: {
            agentId: otherScope.agentId,
            sessionId: "runtime-b",
            requestId: activeId,
          },
        }),
      ),
    );
    expect(screen.getByTestId("drawer-state")).toHaveTextContent("closed");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByTestId("drawer-state")).toHaveTextContent("closed");
    act(() =>
      window.dispatchEvent(
        new CustomEvent("qwenpaw:open-interaction-workbench", {
          detail: {
            agentId: chatScope.agentId,
            sessionId: "runtime-a",
            requestId: activeId,
          },
        }),
      ),
    );
    expect(await screen.findByLabelText(/长\s*\(m\)/)).toHaveValue(17);
  }, 30_000);

  it("discards a late discovery response after switching agent and runtime session", async () => {
    const oldList = deferred<Response>();
    holdList = { session: "runtime-a", pending: oldList };
    const view = renderWithProviders(<WorkbenchHost initiallyOpen={false} />);
    await waitFor(() =>
      expect(calls.some((call) => call.body.session_id === "runtime-a")).toBe(
        true,
      ),
    );
    view.rerender(
      <WorkbenchHost
        initiallyOpen={false}
        scope={otherScope}
        runtimeId="runtime-b"
      />,
    );
    await waitFor(() =>
      expect(
        calls.some(
          (call) =>
            call.agent === otherScope.agentId &&
            call.body.session_id === "runtime-b",
        ),
      ).toBe(true),
    );
    await act(async () => {
      oldList.resolve(response({ requests: [request(activeId)] }));
    });
    expect(screen.getByTestId("drawer-state")).toHaveTextContent("closed");
    records.push(
      request(`${activeId}-b`, {
        title: "B 会话的参数",
        agent_id: otherScope.agentId,
        session_id: "runtime-b",
      }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });
    expect(
      await screen.findByRole("form", { name: "B 会话的参数" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("form", { name: "计算参数确认（示例）" }),
    ).toBeNull();
  }, 30_000);

  it("does not deliver a late submit result into a different conversation", async () => {
    records.push(request(activeId));
    const submission = deferred<Response>();
    holdSubmit = submission;
    const view = renderWithProviders(<WorkbenchHost />);
    fireEvent.click(
      await screen.findByText("确认并继续", { selector: "button" }),
    );
    await waitFor(() =>
      expect(
        calls.filter((call) => call.path.endsWith("/submit")),
      ).toHaveLength(1),
    );
    admissionScope = otherScope;
    view.rerender(<WorkbenchHost scope={otherScope} runtimeId="runtime-b" />);
    await act(async () => {
      submission.resolve(
        response({
          request: {
            ...records[0],
            status: "submitted",
            revision: 2,
            answer: records[0].values,
          },
          continuation: "仅供 A 会话继续",
        }),
      );
    });
    // Delivery still attempts its original route; the actual chat admission
    // rejects it and both message queues remain untouched.
    expect(admitted).toHaveBeenCalledExactlyOnceWith({
      agentId: chatScope.agentId,
      sessionId: chatScope.sessionId,
      query: "仅供 A 会话继续",
    });
    expect(
      useMessageQueueStore.getState().getQueue(chatScope.sessionId),
    ).toHaveLength(0);
    expect(
      useMessageQueueStore.getState().getQueue(otherScope.sessionId),
    ).toHaveLength(0);
    expect(calls.filter((call) => call.path.endsWith("/queued"))).toHaveLength(
      0,
    );
    expect(screen.queryByRole("form")).toBeNull();
  }, 30_000);

  it("finishes an explicitly submitted answer after closing the drawer while the server response is pending", async () => {
    records.push(request(activeId));
    const submission = deferred<Response>();
    holdSubmit = submission;
    renderWithProviders(<WorkbenchHost />);
    fireEvent.change(await screen.findByLabelText(/长\s*\(m\)/), {
      target: { value: "27" },
    });
    fireEvent.click(screen.getByText("确认并继续", { selector: "button" }));
    await waitFor(() =>
      expect(
        calls.filter((call) => call.path.endsWith("/submit")),
      ).toHaveLength(1),
    );
    fireEvent.click(screen.getByLabelText("关闭", { selector: "button" }));
    expect(screen.queryByRole("form")).toBeNull();
    const values = { ...records[0].values, length: 27 };
    Object.assign(records[0], {
      status: "submitted",
      revision: 2,
      answer: values,
      values,
      delivery_status: "pending",
      continuation: "按确认的长 27 m 继续计算",
    });
    await act(async () => {
      submission.resolve(
        response({
          request: records[0],
          continuation: records[0].continuation,
        }),
      );
    });
    await waitFor(() => expect(records[0].delivery_status).toBe("queued"));
    expect(
      useMessageQueueStore.getState().getQueue(chatScope.sessionId),
    ).toEqual([
      expect.objectContaining({
        text: "按确认的长 27 m 继续计算",
        backendSessionId: "runtime-a",
      }),
    ]);
    fireEvent.click(screen.getByText("打开工作区", { selector: "button" }));
    await screen.findByText("答复已保存并加入对话队列。执行进度请查看聊天。");
    expect(await screen.findByLabelText(/长\s*\(m\)/)).toHaveValue(27);
    expect(admitted).toHaveBeenCalledTimes(1);
  }, 30_000);

  it("retains a restored local draft when another window advances the revision and requires an explicit reload", async () => {
    records.push(request(activeId));
    renderWithProviders(<WorkbenchHost />);
    fireEvent.change(await screen.findByLabelText(/长\s*\(m\)/), {
      target: { value: "17" },
    });
    fireEvent.click(screen.getByLabelText("关闭", { selector: "button" }));
    fireEvent.click(screen.getByText("打开工作区", { selector: "button" }));
    expect(await screen.findByLabelText(/长\s*\(m\)/)).toHaveValue(17);
    records[0] = {
      ...records[0],
      revision: 2,
      values: { ...records[0].values, length: 99 },
    };
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3100);
    });
    await screen.findByText(
      "此请求已在其他窗口更新。请点击“重新载入”获取最新参数后再提交。",
    );
    expect(screen.getByLabelText(/长\s*\(m\)/)).toHaveValue(17);
    fireEvent.click(screen.getByText("确认并继续", { selector: "button" }));
    await screen.findByText("参数版本已变化，请重新载入后提交。");
    expect(calls.filter((call) => call.path.endsWith("/submit"))).toHaveLength(
      0,
    );
    fireEvent.click(screen.getByText("重新载入", { selector: "button" }));
    expect(screen.getByLabelText(/长\s*\(m\)/)).toHaveValue(99);
  }, 30_000);

  it("does not let an earlier list response erase the demo created and edited while it was in flight", async () => {
    const initialList = deferred<Response>();
    holdList = { session: "runtime-a", pending: initialList };
    renderWithProviders(<WorkbenchHost />);
    await waitFor(() =>
      expect(calls.some((call) => call.method === "GET")).toBe(true),
    );
    fireEvent.click(screen.getByText("试用参数确认", { selector: "button" }));
    const length = await screen.findByLabelText(/长\s*\(m\)/);
    fireEvent.change(length, { target: { value: "31" } });
    await act(async () => {
      initialList.resolve(response({ requests: [] }));
    });
    expect(screen.getByLabelText(/长\s*\(m\)/)).toBe(length);
    expect(length).toHaveValue(31);
    expect(records).toHaveLength(1);
  }, 30_000);

  it("safely unloads the plugin and restores a persisted request and local draft after loading the shipped bundle again", async () => {
    records.push(request(activeId));
    renderWithProviders(<WorkbenchHost />);
    fireEvent.change(await screen.findByLabelText(/长\s*\(m\)/), {
      target: { value: "23" },
    });
    act(() => removePluginRuntime("qwenpaw-openui"));
    await screen.findByText(/请启用支持任务交互的 OpenUI 插件后使用/);
    expect(screen.queryByRole("form")).toBeNull();
    expect(
      screen.getByText("试用参数确认", { selector: "button" }),
    ).toBeDisabled();
    await act(async () => {
      // A new module identity models the loader's versioned reload URL.
      await import(
        // @ts-expect-error Generated release modules intentionally have no declarations.
        "../../../../plugins/bundle/qwenpaw-openui/dist/index.js?interaction-reload"
      );
    });
    expect(await screen.findByLabelText(/长\s*\(m\)/)).toHaveValue(23);
    expect(records).toHaveLength(1);
    expect(records[0].status).toBe("pending");
    expect(admitted).not.toHaveBeenCalled();
  }, 60_000);

  it("cancels an edited request without queuing it and cannot resurrect it from a stale poll or local draft", async () => {
    records.push(request(activeId));
    renderWithProviders(<WorkbenchHost />);
    fireEvent.change(await screen.findByLabelText(/长\s*\(m\)/), {
      target: { value: "43" },
    });
    const stale = clone(records);
    const pending = deferred<Response>();
    holdList = { session: "runtime-a", pending };
    await act(async () => vi.advanceTimersByTimeAsync(3100));
    expect(
      calls.filter((call) => call.method === "GET").length,
    ).toBeGreaterThan(1);
    fireEvent.click(screen.getByText("取消本次请求", { selector: "button" }));
    await screen.findByText("本次请求已取消，未提交计算。");
    await act(async () => pending.resolve(response({ requests: stale })));
    expect(
      screen.getByText("本次请求已取消，未提交计算。"),
    ).toBeInTheDocument();
    holdList = undefined;
    fireEvent.click(screen.getByLabelText("关闭", { selector: "button" }));
    fireEvent.click(screen.getByText("打开工作区", { selector: "button" }));
    await screen.findByText("本次请求已取消，未提交计算。");
    expect(screen.getByLabelText(/长\s*\(m\)/)).toHaveValue(10);
    expect(screen.getByLabelText(/长\s*\(m\)/)).toBeDisabled();
    expect(screen.queryByText("保存草稿", { selector: "button" })).toBeNull();
    expect(
      screen.queryByText("继续任务／重试发送", { selector: "button" }),
    ).toBeNull();
    expect(calls.filter((call) => call.path.endsWith("/cancel"))).toEqual([
      expect.objectContaining({
        agent: chatScope.agentId,
        body: { session_id: "runtime-a", expected_revision: 1 },
      }),
    ]);
    expect(
      calls.filter((call) => /\/(submit|queued)$/.test(call.path)),
    ).toHaveLength(0);
    expect(admitted).not.toHaveBeenCalled();
    expect(
      useMessageQueueStore.getState().getQueue(chatScope.sessionId),
    ).toHaveLength(0);
  }, 30_000);

  it("retains the accepted answer when the real chat queue is full and retries admission after space becomes available", async () => {
    const store = useMessageQueueStore.getState();
    for (let index = 0; index < MAX_QUEUE_SIZE; index++)
      store.enqueue(chatScope.sessionId, { text: `existing-${index}` });
    const existing = store.getQueue(chatScope.sessionId);
    records.push(request(activeId));
    renderWithProviders(<WorkbenchHost />);
    fireEvent.change(await screen.findByLabelText(/长\s*\(m\)/), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByText("确认并继续", { selector: "button" }));
    await screen.findByText("Queue full");
    expect(acceptedSubmissions).toBe(1);
    expect(records[0]).toMatchObject({
      status: "submitted",
      delivery_status: "pending",
      answer: { length: 0 },
    });
    expect(store.getQueue(chatScope.sessionId)).toEqual(existing);
    expect(calls.filter((call) => call.path.endsWith("/queued"))).toHaveLength(
      0,
    );
    act(() => store.remove(chatScope.sessionId, existing[0].id));
    fireEvent.click(
      screen.getByText("继续任务／重试发送", { selector: "button" }),
    );
    await screen.findByText("答复已保存并加入对话队列。执行进度请查看聊天。");
    const queue = store.getQueue(chatScope.sessionId);
    expect(queue).toHaveLength(MAX_QUEUE_SIZE);
    expect(queue.slice(0, -1)).toEqual(existing.slice(1));
    expect(queue[queue.length - 1]).toMatchObject({
      text: records[0].continuation,
      agentId: chatScope.agentId,
      backendSessionId: "runtime-a",
    });
    expect(acceptedSubmissions).toBe(1);
    expect(admitted).toHaveBeenCalledTimes(2);
    expect(calls.filter((call) => call.path.endsWith("/queued"))).toHaveLength(
      1,
    );
  }, 30_000);

  it("keeps independent unsaved values when switching between requests with identical field names", async () => {
    records.push(
      request(activeId),
      request(`${activeId}-second`, { title: "第二个参数请求" }),
    );
    renderWithProviders(<WorkbenchHost />);
    fireEvent.change(await screen.findByLabelText(/长\s*\(m\)/), {
      target: { value: "17" },
    });
    fireEvent.click(screen.getByRole("button", { name: /第二个参数请求/ }));
    expect(screen.getByLabelText(/长\s*\(m\)/)).toHaveValue(10);
    fireEvent.change(screen.getByLabelText(/长\s*\(m\)/), {
      target: { value: "29" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /计算参数确认（示例）/ }),
    );
    expect(screen.getByLabelText(/长\s*\(m\)/)).toHaveValue(17);
    fireEvent.click(screen.getByLabelText("关闭", { selector: "button" }));
    fireEvent.click(screen.getByText("打开工作区", { selector: "button" }));
    await screen.findByLabelText(/长\s*\(m\)/);
    fireEvent.click(screen.getByRole("button", { name: /第二个参数请求/ }));
    expect(screen.getByLabelText(/长\s*\(m\)/)).toHaveValue(29);
    expect(calls.every((call) => call.method === "GET")).toBe(true);
    expect(admitted).not.toHaveBeenCalled();
  }, 30_000);
});
