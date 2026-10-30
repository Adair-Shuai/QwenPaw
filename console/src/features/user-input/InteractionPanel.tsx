import { useCallback, useEffect, useRef, useState } from "react";
import type { FilesWorkspaceScope } from "../files-workspace/filesWorkspaceScope";
import { interactionApi } from "./api";
import {
  clearInputDraft,
  readInputDraft,
  readInputDraftState,
  saveInputDraft,
} from "./drafts";
import { deliverInteractionAnswer } from "./delivery";
import { useInteractionRuntime } from "./runtime";
import type {
  InteractionRequest,
  InteractionScope,
  InputValues,
  InteractionFormProps,
} from "./types";
import type { ComponentType } from "react";
import styles from "./InteractionPanel.module.less";

interface PanelProps {
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  runtimeSessionId?: string;
  interactionRequestId?: string;
}
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "请求失败，请重试。";
const statusText = (request: InteractionRequest) =>
  request.status === "pending"
    ? "待填写"
    : request.status === "cancelled"
    ? "已取消"
    : request.delivery_status === "queued"
    ? "已加入对话队列"
    : "答复已保存";

/** Scope-keyed wrapper prevents drafts and late responses crossing conversations. */
export function InteractionPanel(props: PanelProps) {
  return (
    <ScopedInteractionPanel
      key={`${props.scope.agentId}:${
        props.runtimeSessionId ?? props.scope.sessionId
      }`}
      {...props}
    />
  );
}

function ScopedInteractionPanel({
  scope: chatScope,
  runtimeSessionId,
  interactionRequestId,
}: PanelProps) {
  const runtime = useInteractionRuntime();
  const Form = runtime?.InteractionForm;
  const scope = useRef<InteractionScope>({
    agentId: chatScope.agentId,
    sessionId: runtimeSessionId || "",
  }).current;
  const [requests, setRequests] = useState<InteractionRequest[]>([]);
  const [selected, setSelected] = useState(interactionRequestId || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  const loading = useRef(false);
  const creating = useRef(false);
  const mutationGeneration = useRef(0);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (interactionRequestId) setSelected(interactionRequestId);
  }, [interactionRequestId]);

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!scope.sessionId || loading.current || !Form) return;
      loading.current = true;
      const generation = mutationGeneration.current;
      try {
        const data = await interactionApi.list(scope, signal);
        if (
          !alive.current ||
          signal?.aborted ||
          generation !== mutationGeneration.current
        )
          return;
        setRequests((current) =>
          data.requests
            .filter(
              (item) =>
                item.agent_id === scope.agentId &&
                item.session_id === scope.sessionId,
            )
            .map((item) => {
              const previous = current.find((entry) => entry.id === item.id);
              // A poll started before Save/Submit must not roll back the accepted answer.
              if (
                previous &&
                (previous.revision > item.revision ||
                  (previous.revision === item.revision &&
                    previous.delivery_status === "queued"))
              )
                return previous;
              return item;
            }),
        );
        setError("");
      } catch (caught) {
        if (alive.current && !signal?.aborted) setError(errorText(caught));
      } finally {
        loading.current = false;
      }
    },
    [scope, Form],
  );

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    const timer = window.setInterval(
      () => void refresh(controller.signal),
      3000,
    );
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [refresh]);

  const replace = (request: InteractionRequest) => {
    if (!alive.current) return;
    mutationGeneration.current += 1;
    setRequests((current) => [
      request,
      ...current.filter((item) => item.id !== request.id),
    ]);
  };
  const demo = async () => {
    if (creating.current) return;
    creating.current = true;
    setBusy(true);
    setError("");
    try {
      const request = await interactionApi.demo(scope);
      if (!alive.current) return;
      replace(request);
      setSelected(request.id);
    } catch (caught) {
      if (alive.current) setError(errorText(caught));
    } finally {
      creating.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const current =
    requests.find((item) => item.id === selected) ??
    requests.find((item) => item.status === "pending") ??
    requests[0];

  return (
    <section className={styles.panel} aria-label="任务交互">
      <header className={styles.toolbar}>
        <h2>任务交互</h2>
        <div className={styles.actions}>
          <button
            onClick={() => void refresh()}
            disabled={!Form || !scope.sessionId}
          >
            刷新
          </button>
          <button
            onClick={() => void demo()}
            disabled={busy || !Form || !scope.sessionId}
          >
            试用参数确认
          </button>
        </div>
      </header>
      <p className={styles.muted}>
        在这里确认选择、补充参数并继续当前任务。收起面板可稍后处理。
      </p>
      {!Form ? (
        <p role="status" className={styles.notice}>
          请启用支持任务交互的 OpenUI
          插件后使用。已保存的请求和草稿可在重新启用后继续处理。
        </p>
      ) : !scope.sessionId ? (
        <p role="status">发送一条消息建立会话后，即可试用参数确认。</p>
      ) : null}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {Form && scope.sessionId && (
        <>
          {requests.length === 0 && !error && (
            <p className={styles.notice}>
              当前没有待处理请求。可以点击“试用参数确认”，或让 AI
              在计算前向你确认参数。
            </p>
          )}
          <nav className={styles.requests} aria-label="交互请求列表">
            {requests.map((request) => (
              <button
                key={request.id}
                className={`${styles.request} ${
                  current?.id === request.id ? styles.selected : ""
                }`}
                aria-pressed={current?.id === request.id}
                onClick={() => setSelected(request.id)}
              >
                <span>{request.title}</span>
                <small>{statusText(request)}</small>
              </button>
            ))}
          </nav>
          {current && (
            <InteractionEditor
              key={current.id}
              scope={scope}
              chatSessionId={chatScope.sessionId}
              request={current}
              Form={Form}
              onUpdate={replace}
            />
          )}
        </>
      )}
    </section>
  );
}

interface EditorProps {
  scope: InteractionScope;
  chatSessionId: string;
  request: InteractionRequest;
  Form: ComponentType<InteractionFormProps>;
  onUpdate: (request: InteractionRequest) => void;
}

function InteractionEditor({
  scope,
  chatSessionId,
  request,
  Form,
  onUpdate,
}: EditorProps) {
  const [initialDraft] = useState(() => readInputDraftState(scope, request));
  const [values, setValues] = useState<InputValues>(initialDraft.values);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const operation = useRef(false);
  const dirty = useRef(initialDraft.dirty);
  const revision = useRef(initialDraft.revision);
  const alive = useRef(true);
  const latest = useRef(request);
  latest.current = request;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (revision.current === request.revision) return;
    if (dirty.current && request.status === "pending") {
      setError(
        "此请求已在其他窗口更新。请点击“重新载入”获取最新参数后再提交。",
      );
      return;
    }
    revision.current = request.revision;
    setValues(readInputDraft(scope, request));
  }, [request, scope]);
  const change = (next: InputValues) => {
    dirty.current = true;
    setValues(next);
    setNotice("");
    if (
      !saveInputDraft(scope, { ...request, revision: revision.current }, next)
    ) {
      setError("浏览器无法保存本地草稿，请使用“保存草稿”保存到任务。");
    }
  };
  const run = async (action: "save" | "submit" | "cancel") => {
    if (operation.current) return;
    if (revision.current !== request.revision && request.status === "pending") {
      setError("参数版本已变化，请重新载入后提交。");
      return;
    }
    operation.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (action === "save") {
        const next = await interactionApi.draft(scope, request, values);
        if (!alive.current) return;
        dirty.current = false;
        revision.current = next.revision;
        saveInputDraft(scope, next, values);
        onUpdate(next);
        setNotice("草稿已保存到任务。");
      } else if (action === "cancel") {
        const next = await interactionApi.cancel(scope, request);
        if (!alive.current) return;
        dirty.current = false;
        clearInputDraft(scope, request.id);
        onUpdate(next);
      } else {
        const result = await interactionApi.submit(
          scope,
          request,
          request.status === "submitted"
            ? request.answer ?? request.values
            : values,
        );
        dirty.current = false;
        clearInputDraft(scope, request.id);
        if (alive.current) onUpdate(result.request);
        // Closing the panel does not revoke an explicit submit. The host's
        // admission still rejects an answer after an Agent/session switch.
        const next = await deliverInteractionAnswer(
          scope,
          chatSessionId,
          result.request,
          result.continuation,
        );
        if (!alive.current) return;
        onUpdate(next);
        setNotice("答复已加入当前对话队列，AI 将根据确认的参数继续处理。");
      }
    } catch (caught) {
      if (alive.current) setError(errorText(caught));
    } finally {
      operation.current = false;
      if (alive.current) setBusy(false);
    }
  };
  return (
    <div className={styles.editor}>
      {request.status !== "pending" && (
        <p role="status" className={styles.notice}>
          {request.status === "cancelled"
            ? "本次请求已取消，未提交计算。"
            : request.delivery_status === "queued"
            ? "答复已保存并加入对话队列。执行进度请查看聊天。"
            : "答复已保存，等待发送给当前会话。"}
        </p>
      )}
      <Form
        requestId={request.id}
        title={request.title}
        description={request.description}
        fields={request.fields}
        preview={request.preview}
        values={values}
        onChange={change}
        onSubmit={() => void run("submit")}
        onCancel={
          request.status === "pending" ? () => void run("cancel") : undefined
        }
        disabled={busy || request.status !== "pending"}
        error={error}
        submitLabel={busy ? "正在处理…" : "确认并继续"}
      />
      <div className={styles.actions}>
        {request.status === "pending" && (
          <button disabled={busy} onClick={() => void run("save")}>
            保存草稿
          </button>
        )}
        {request.status === "submitted" &&
          request.delivery_status !== "queued" && (
            <button disabled={busy} onClick={() => void run("submit")}>
              继续任务／重试发送
            </button>
          )}
        {error && (
          <button
            disabled={busy}
            onClick={() => {
              dirty.current = false;
              revision.current = latest.current.revision;
              clearInputDraft(scope, request.id);
              setValues(latest.current.answer ?? latest.current.values);
              setError("");
            }}
          >
            重新载入
          </button>
        )}
        {notice && (
          <span role="status" className={styles.muted}>
            {notice}
          </span>
        )}
      </div>
    </div>
  );
}
