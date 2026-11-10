import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  chatContextApi,
  type ChatContextSnapshot,
} from "../../../api/modules/chatContext";
import type {
  ContextInspectorDetails,
  ContextInspectorSource,
} from "../components/ContextUsageIndicator/types";

interface Options {
  scopeKey: string;
  agentId: string;
  chatId?: string | null;
  sessionId?: string;
  userId?: string;
  enabled: boolean;
  executionBusy: boolean;
}

const sourceKinds: Record<string, ContextInspectorSource["kind"]> = {
  conversation: "message",
  file: "attachment",
  quote: "quote",
  system: "rule",
  summary: "other",
  memory: "memory",
};

/** Read only, on demand. A stale request cannot publish into a new visit. */
export function useContextInspection(options: Options) {
  const { t } = useTranslation();
  const {
    scopeKey,
    agentId,
    chatId,
    sessionId,
    userId,
    enabled,
    executionBusy,
  } = options;
  const identity = JSON.stringify([
    scopeKey,
    agentId,
    chatId,
    sessionId,
    userId,
    enabled,
  ]);
  const current = useRef(identity);
  current.current = identity;
  const requestRevision = useRef(0);
  const pending = useRef<AbortController>();
  const [openIdentity, setOpenIdentity] = useState<string | null>(null);
  const [state, setState] = useState<{
    identity: string;
    loading: boolean;
    data?: ChatContextSnapshot;
    error?: "load" | "mismatch";
  }>();
  const isOpen = openIdentity === identity;
  const openRef = useRef(false);
  openRef.current = isOpen;
  useEffect(() => {
    setOpenIdentity(null);
  }, [identity]);

  const reload = useCallback(async () => {
    if (!enabled || !chatId || !openRef.current || current.current !== identity)
      return;
    pending.current?.abort();
    const revision = ++requestRevision.current;
    const controller = new AbortController();
    pending.current = controller;
    setState({ identity, loading: true });
    try {
      const data = await chatContextApi.get(chatId, agentId, {
        sessionId,
        userId,
        signal: controller.signal,
      });
      if (
        controller.signal.aborted ||
        current.current !== identity ||
        requestRevision.current !== revision
      )
        return;
      if (
        data.agent_id !== agentId ||
        data.chat_id !== chatId ||
        (sessionId && data.session_id !== sessionId) ||
        (userId && data.user_id !== userId)
      ) {
        setState({ identity, loading: false, error: "mismatch" });
        return;
      }
      setState({ identity, loading: false, data });
    } catch {
      if (
        !controller.signal.aborted &&
        current.current === identity &&
        requestRevision.current === revision
      ) {
        setState({ identity, loading: false, error: "load" });
      }
    }
  }, [identity, enabled, chatId, agentId, sessionId, userId]);

  useEffect(() => {
    const requestRevisionAtSetup = requestRevision;
    if (isOpen) void reload();
    return () => {
      pending.current?.abort();
      requestRevisionAtSetup.current++;
    };
    // Refresh saved data on a run's state transition; never poll a closed panel.
  }, [isOpen, reload, executionBusy]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        openRef.current = false;
        pending.current?.abort();
        requestRevision.current++;
      }
      setOpenIdentity(open ? identity : null);
    },
    [identity],
  );

  const visible = state?.identity === identity ? state : undefined;
  const data = visible?.data;
  const details = useMemo<ContextInspectorDetails>(() => {
    if (!enabled)
      return {
        sources: [],
        summaryAvailable: false,
        notice: t("chat.contextInspector.notices.unsupported"),
      };
    if (!data) return { sources: [] };
    const notices = [
      t(
        executionBusy
          ? "chat.contextInspector.notices.running"
          : data.snapshot?.basis === "saved_session"
          ? "chat.contextInspector.notices.savedSession"
          : "chat.contextInspector.notices.latestSaved",
      ),
    ];
    if (data.snapshot?.captured_at) {
      const date = new Date(data.snapshot.captured_at);
      if (!Number.isNaN(date.getTime()))
        notices.push(
          t("chat.contextInspector.capturedAt", {
            time: date.toLocaleString(),
          }),
        );
    }
    for (const code of data.limitations) {
      const key = `chat.contextInspector.limitations.${code}`;
      // Unknown future server codes are not user-facing prose.
      if (t(key) !== key) notices.push(t(key));
    }
    if (data.summary.stale)
      notices.push(t("chat.contextInspector.summaryStale"));
    return {
      sources: data.sources.map((source) => ({
        id: source.id,
        kind: sourceKinds[source.kind] ?? "other",
        title: [
          "user",
          "assistant",
          "system",
          "tool",
          "quote",
          "memory",
        ].includes(source.label)
          ? t(`chat.contextInspector.labels.${source.label}`)
          : source.label ||
            t(`chat.contextInspector.sourceKinds.${source.kind}`),
        detail: [
          source.path,
          source.truncated ? t("chat.contextInspector.sourceTruncated") : "",
        ]
          .filter(Boolean)
          .join(" · "),
        content: source.content ?? undefined,
        status: source.provenance === "model_request" ? "included" : "unknown",
        removable: false,
      })),
      summary:
        data.summary.kind === "none"
          ? null
          : {
              content: data.summary.content,
              notice:
                [
                  data.summary.stale
                    ? t("chat.contextInspector.summaryStale")
                    : "",
                  data.summary.truncated
                    ? t("chat.contextInspector.sourceTruncated")
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ") || undefined,
            },
      summaryAvailable: true,
      notice: notices.join(" "),
    };
  }, [data, enabled, executionBusy, t]);

  return {
    inspectionScopeKey: identity,
    details,
    detailsLoading: Boolean(
      isOpen && enabled && chatId && (!visible || visible.loading),
    ),
    detailsError: visible?.error
      ? t(`chat.contextInspector.errors.${visible.error}`)
      : undefined,
    onOpenChange,
    onRetry: reload,
  };
}
