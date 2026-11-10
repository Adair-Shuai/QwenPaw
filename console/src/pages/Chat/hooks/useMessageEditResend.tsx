import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button, Checkbox, Input, Select, Tag, Tooltip } from "antd";
import { SquarePen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppMessage } from "../../../hooks/useAppMessage";
import type { AgentSummary } from "../../../api/types/agents";
import {
  MAX_QUEUE_SIZE,
  useMessageQueueStore,
} from "../../../stores/messageQueueStore";
import type { SessionIdentity } from "../sessionApi";
import { buildSubmissionBizParams } from "../submissionBizParams";
import {
  getRequestEditSnapshot,
  getRequestEditTarget,
  createRequestEditKeyResolver,
  type RequestEditSnapshot,
  type RequestEditTarget,
} from "../requestEditSnapshot";
import type { AgentMentionModesSnapshot } from "../components/agentMentionModes";
import { extractAgentMentions } from "../components/agentMentionUtils";
import styles from "../components/MessageEditResend.module.less";
import { ANSWER_QUOTES_KEY } from "../answerQuotes";
import { AnswerQuoteSummary } from "../components/AnswerQuoteRequest";

interface Options {
  visit: object;
  queueKey: string;
  agentId: string;
  enabled: boolean;
  supportsAttachments: boolean;
  agents: AgentSummary[];
  displayName: (agent: AgentSummary) => string;
  isReady: () => boolean;
  getIdentity: () => SessionIdentity;
  prepareQuery: (text: string) => string;
  captureContext: (
    context: Record<string, unknown> | undefined,
    text: string,
    modes: AgentMentionModesSnapshot,
  ) => Record<string, unknown>;
}

type RequestKey = string | object;

function InlineRequestFrame({
  requestKey,
  editing,
  original,
  editor,
  register,
}: {
  requestKey: RequestKey;
  editing: boolean;
  original: ReactNode;
  editor: ReactNode;
  register: (key: RequestKey) => () => void;
}) {
  useEffect(() => register(requestKey), [register, requestKey]);
  return (
    <div
      data-message-edit-frame
      className={editing ? styles.frameEditing : undefined}
    >
      <div hidden={editing} style={{ display: editing ? "none" : undefined }}>
        {original}
      </div>
      {editing ? editor : null}
    </div>
  );
}

interface Draft {
  requestKey: RequestKey;
  token: object;
  visit: object;
  queueKey: string;
  agentId: string;
  identity: SessionIdentity;
  snapshot: RequestEditSnapshot;
  text: string;
  modes: Record<string, "delegate" | "collaborate">;
  keepOriginal: boolean;
  target?: RequestEditTarget;
}

function sameIdentity(a: SessionIdentity, b: SessionIdentity): boolean {
  return (
    a.chatId === b.chatId &&
    a.sdkSessionId === b.sdkSessionId &&
    a.sessionId === b.sessionId &&
    a.userId === b.userId &&
    a.channel === b.channel
  );
}

/** Queue an independent edit; the backend commits the selected history policy. */
export function useMessageEditResend(options: Options) {
  const { t } = useTranslation();
  const { message } = useAppMessage();
  const current = useRef(options);
  current.current = options;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string>();
  const admitted = useRef(false);
  const activeEdit = useRef<object | null>(null);
  const visit = options.visit;
  const resolveRequestKey = useMemo(() => {
    // Preserve explicit invalidation when the surrounding owner or registry changes.
    void visit;
    return createRequestEditKeyResolver();
  }, [visit]);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const presentRequests = useRef(new Map<RequestKey, number>());
  const trigger = useRef<HTMLElement | null>(null);
  const register = useCallback((key: RequestKey) => {
    const present = presentRequests.current;
    present.set(key, (present.get(key) ?? 0) + 1);
    return () => {
      const count = (present.get(key) ?? 1) - 1;
      if (count) present.set(key, count);
      else present.delete(key);
      // A refreshed card with the same durable identity mounts in this commit.
      // A vanished legacy object must never move its editor to another row.
      queueMicrotask(() => {
        if (!present.has(key) && draftRef.current?.requestKey === key) {
          activeEdit.current = null;
          setDraft(null);
          setError(undefined);
        }
      });
    };
  }, []);

  useEffect(() => {
    activeEdit.current = null;
    setDraft(null);
    setError(undefined);
    return () => {
      activeEdit.current = null;
    };
  }, [visit, options.enabled]);

  const open = useCallback(
    (data: unknown, button: HTMLElement) => {
      const now = current.current;
      if (now.visit !== visit || !now.enabled || !now.isReady()) return;
      const snapshot = getRequestEditSnapshot(data);
      if (
        !snapshot ||
        snapshot.unsupported ||
        (snapshot.attachments.length > 0 && !now.supportsAttachments)
      )
        return;
      const identity = now.getIdentity();
      if (!identity.sessionId || !(identity.chatId || identity.sdkSessionId))
        return;
      admitted.current = false;
      const token = {};
      activeEdit.current = token;
      trigger.current = button;
      setError(undefined);
      setDraft({
        requestKey: resolveRequestKey(data),
        token,
        visit,
        queueKey: now.queueKey,
        agentId: now.agentId,
        identity: { ...identity },
        snapshot,
        text: snapshot.text,
        keepOriginal: false,
        target: getRequestEditTarget(data),
        // Never inherit the unrelated composer/global mention preferences.
        modes: { ...snapshot.mentionModes },
      });
    },
    [visit, resolveRequestKey],
  );

  const cancel = () => {
    activeEdit.current = null;
    setDraft(null);
    setError(undefined);
    const button = trigger.current;
    requestAnimationFrame(() => {
      if (button?.isConnected) button.focus({ preventScroll: true });
    });
  };

  const send = () => {
    if (!draft || admitted.current || activeEdit.current !== draft.token)
      return;
    const now = current.current;
    if (
      !now.enabled ||
      !now.isReady() ||
      now.visit !== draft.visit ||
      now.queueKey !== draft.queueKey ||
      now.agentId !== draft.agentId ||
      !sameIdentity(now.getIdentity(), draft.identity)
    ) {
      activeEdit.current = null;
      setDraft(null);
      return;
    }
    if (draft.snapshot.attachments.length > 0 && !now.supportsAttachments) {
      setError(t("chat.editResend.unsupported"));
      return;
    }
    if (!draft.keepOriginal && !draft.target) {
      setError(t("chat.editResend.missingTarget"));
      return;
    }
    const text = draft.text.trim();
    if (!text && draft.snapshot.attachments.length === 0) return;
    const store = useMessageQueueStore.getState();
    if (store.getQueue(draft.queueKey).length >= MAX_QUEUE_SIZE) {
      setError(t("chat.queue.queueFull", { max: MAX_QUEUE_SIZE }));
      return;
    }
    const query = now.prepareQuery(text);
    admitted.current = true;
    try {
      store.enqueue(draft.queueKey, {
        text: query,
        attachments: draft.snapshot.attachments.length
          ? draft.snapshot.attachments.map((file) => ({ ...file }))
          : undefined,
        agentId: draft.agentId,
        backendSessionId: draft.identity.sessionId,
        userId: draft.identity.userId,
        channel: draft.identity.channel,
        requestContext: {
          ...now.captureContext(undefined, query, { ...draft.modes }),
          ...(draft.snapshot.answerQuotes?.length
            ? { [ANSWER_QUOTES_KEY]: draft.snapshot.answerQuotes }
            : {}),
          qwenpaw_edit_resend: {
            keep_original: draft.keepOriginal,
            ...(draft.target ? { target: draft.target } : {}),
          },
        },
        bizParams: buildSubmissionBizParams(draft.identity),
      });
      activeEdit.current = null;
      setDraft(null);
      message.success(t("chat.editResend.queued"));
    } catch {
      admitted.current = false;
      setError(t("chat.editResend.failed"));
    }
  };

  const activeDraft = options.enabled && draft?.visit === visit ? draft : null;
  const mentioned = activeDraft
    ? extractAgentMentions(
        activeDraft.text,
        options.agents,
        options.displayName,
      ).agentIds
    : [];

  const renderAction = useCallback(
    ({ data }: { data: unknown }) => {
      const snapshot = getRequestEditSnapshot(data);
      const unsupported =
        !snapshot ||
        snapshot.unsupported ||
        (snapshot.attachments.length > 0 && !options.supportsAttachments);
      return (
        <Tooltip
          title={t(
            unsupported
              ? "chat.editResend.unsupported"
              : "chat.editResend.action",
          )}
        >
          <span>
            <Button
              type="text"
              size="small"
              aria-label={t("chat.editResend.action")}
              disabled={!options.enabled || unsupported}
              icon={<SquarePen size={16} />}
              onClick={(event) => open(data, event.currentTarget)}
            />
          </span>
        </Tooltip>
      );
    },
    [open, options.enabled, options.supportsAttachments, t],
  );

  const editor = (
    <div
      data-message-edit-resend
      role="group"
      aria-label={t("chat.editResend.action")}
      className={styles.editor}
    >
      <AnswerQuoteSummary quotes={activeDraft?.snapshot.answerQuotes ?? []} />
      <Input.TextArea
        aria-label={t("chat.editResend.message")}
        variant="borderless"
        autoFocus
        value={activeDraft?.text ?? ""}
        autoSize={{ minRows: 4, maxRows: 20 }}
        onChange={(event) => {
          setDraft((value) => value && { ...value, text: event.target.value });
          setError(undefined);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            event.stopPropagation();
            cancel();
            return;
          }
          if (
            event.key === "Enter" &&
            (event.ctrlKey || event.metaKey) &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            event.stopPropagation();
            send();
          }
        }}
      />
      {Boolean(activeDraft?.snapshot.attachments.length) && (
        <div
          style={{ marginTop: 12 }}
          aria-label={t("chat.editResend.attachments")}
        >
          {activeDraft?.snapshot.attachments.map((file, index) => (
            <Tag
              key={index}
              style={{
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                verticalAlign: "bottom",
              }}
            >
              {file.name || file.url}
            </Tag>
          ))}
        </div>
      )}
      {mentioned.map((id) => {
        const agent = options.agents.find((item) => item.id === id)!;
        const label = t("chat.editResend.mentionMode", {
          agent: options.displayName(agent),
        });
        return (
          <div
            key={id}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <span>@{options.displayName(agent)}</span>
            <Select
              aria-label={label}
              value={activeDraft?.modes[id] ?? "delegate"}
              options={[
                { value: "delegate", label: t("chat.editResend.delegate") },
                {
                  value: "collaborate",
                  label: t("chat.editResend.collaborate"),
                },
              ]}
              onChange={(mode: "delegate" | "collaborate") =>
                setDraft(
                  (value) =>
                    value && {
                      ...value,
                      modes: { ...value.modes, [id]: mode },
                    },
                )
              }
            />
          </div>
        );
      })}
      {error && (
        <p
          role="alert"
          style={{ color: "var(--app-error-text)", marginBottom: 0 }}
        >
          {error}
        </p>
      )}

      <div className={styles.footer}>
        <div className={styles.historyOption}>
          <Checkbox
            checked={activeDraft?.keepOriginal ?? false}
            onChange={(event) => {
              setDraft(
                (value) =>
                  value && { ...value, keepOriginal: event.target.checked },
              );
              setError(undefined);
            }}
          >
            {t("chat.editResend.keepOriginal")}
          </Checkbox>
          <span className={styles.hint}>
            {t(
              activeDraft?.keepOriginal
                ? "chat.editResend.description"
                : "chat.editResend.replaceDescription",
            )}
          </span>
        </div>
        <div className={styles.actions}>
          <Button onClick={cancel}>{t("common.cancel")}</Button>
          <Button
            type="primary"
            onClick={send}
            disabled={
              !activeDraft ||
              (!activeDraft.text.trim() &&
                !activeDraft.snapshot.attachments.length)
            }
          >
            {t("chat.editResend.send")}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderRequest = ({
    data,
    fallback,
  }: {
    data: unknown;
    fallback: () => ReactNode;
  }) => {
    const key = resolveRequestKey(data);
    return (
      <InlineRequestFrame
        requestKey={key}
        editing={activeDraft?.requestKey === key}
        original={fallback()}
        editor={editor}
        register={register}
      />
    );
  };

  return { renderAction, renderRequest };
}
