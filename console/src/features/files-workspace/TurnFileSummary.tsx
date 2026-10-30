import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  FolderOpen,
  GitCompareArrows,
  Package,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  TURN_FILES_UPDATED_EVENT,
  turnFilesApi,
  turnFilesSessionId,
  type SessionFilesScope,
  type TurnFileDiff,
  type TurnFileEntry,
  type TurnFileManifest,
} from "../../api/modules/turnFiles";
import { DownloadCancelledError } from "../../utils/downloadFileFromUrl";
import { filesWorkspaceScopeKey } from "./filesWorkspaceScope";
import { openFilePreview } from "./openFilePreview";
import { turnFileTarget } from "./turnFileTarget";
import styles from "./TurnFileSummary.module.less";

const DiffViewer = lazy(() => import("./TurnFileDiffViewer"));
const RETRY_DELAYS = [400, 800, 1600, 2500, 4000];
const COLLAPSED_FILES = 6;

export interface TurnFileSummaryProps {
  scope: SessionFilesScope;
  responseId?: string;
  clientMessageId?: string;
  completed: boolean;
  fallback?: ReactNode;
}

function matchTurn(
  turns: TurnFileManifest[],
  responseId?: string,
  clientMessageId?: string,
) {
  const exact =
    responseId && turns.find((turn) => turn.response_id === responseId);
  if (exact) return exact;
  // Older histories synthesized this specific timestamp-based response ID.
  // Never fall back from a real response ID to another regeneration attempt.
  const legacyId =
    !responseId || /^response_\d{13}-[a-z0-9]+$/i.test(responseId);
  return legacyId && clientMessageId
    ? turns.find((turn) => turn.client_message_id === clientMessageId)
    : undefined;
}

function SummaryContent({
  scope,
  turn,
}: {
  scope: SessionFilesScope;
  turn: TurnFileManifest;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState("");
  const [diffId, setDiffId] = useState<string>();
  const [diff, setDiff] = useState<TurnFileDiff>();
  const [diffError, setDiffError] = useState(false);
  const diffRequest = useRef(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      diffRequest.current += 1;
    };
  }, []);
  const files = expanded ? turn.files : turn.files.slice(0, COLLAPSED_FILES);
  const changed = turn.files.filter((file) => file.status !== "delivered");
  const additions = changed.reduce(
    (sum, file) => sum + (file.additions ?? 0),
    0,
  );
  const deletions = changed.reduce(
    (sum, file) => sum + (file.deletions ?? 0),
    0,
  );
  const delivered = turn.files.filter(
    (file) =>
      file.delivered && file.after_available && file.status !== "deleted",
  ).length;
  const hasLineCounts = changed.some(
    (file) => file.additions != null || file.deletions != null,
  );
  const archiveScope = { ...scope, sessionId: turn.session_id };

  const download = async (id: string, operation: () => Promise<void>) => {
    setBusy(id);
    setError("");
    try {
      await operation();
    } catch (err) {
      if (alive.current && !(err instanceof DownloadCancelledError))
        setError(t("turnFiles.downloadFailed"));
    } finally {
      if (alive.current) setBusy(undefined);
    }
  };
  const showDiff = async (file: TurnFileEntry, retry = false) => {
    const requestId = ++diffRequest.current;
    if (diffId === file.id && !retry) {
      setDiffId(undefined);
      setDiff(undefined);
      return;
    }
    setDiffId(file.id);
    setDiff(undefined);
    setDiffError(false);
    try {
      const result = await turnFilesApi.diff(archiveScope, turn.id, file.id);
      if (alive.current && diffRequest.current === requestId) setDiff(result);
    } catch {
      if (alive.current && diffRequest.current === requestId)
        setDiffError(true);
    }
  };

  if (turn.files.length === 0 && !turn.incomplete && !turn.overlap) return null;
  return (
    <section
      className={styles.summary}
      aria-label={t("turnFiles.title")}
      data-turn-id={turn.id}
    >
      <header className={styles.header}>
        <span className={styles.heading}>
          <FileText size={16} />
          <strong>{t("turnFiles.title")}</strong>
          <span>{turn.files.length}</span>
        </span>
        {hasLineCounts && (
          <span
            className={styles.counts}
            aria-label={t("turnFiles.lineChanges")}
          >
            <span className={styles.added}>+{additions}</span>
            <span className={styles.removed}>−{deletions}</span>
          </span>
        )}
        {delivered > 0 && (
          <span className={styles.deliveryCount}>
            <Package size={13} />
            {t("turnFiles.deliveredCount", { count: delivered })}
          </span>
        )}
        <button
          className={styles.bundle}
          type="button"
          disabled={
            Boolean(busy) ||
            !turn.files.some(
              (file) => file.before_available || file.after_available,
            )
          }
          onClick={() =>
            void download("bundle", () =>
              turnFilesApi.downloadBundle(archiveScope, turn.id),
            )
          }
        >
          <Download size={14} />
          {t("turnFiles.downloadTurn")}
        </button>
      </header>
      <p className={styles.caption}>{t("turnFiles.archiveHint")}</p>
      {turn.status !== "completed" &&
        turn.status !== "success" &&
        turn.status !== "running" && (
          <p className={styles.notice}>{t("turnFiles.interrupted")}</p>
        )}
      {turn.overlap && (
        <p className={styles.notice}>{t("turnFiles.overlap")}</p>
      )}
      {turn.incomplete && (
        <p className={styles.notice}>{t("turnFiles.incomplete")}</p>
      )}
      {turn.warnings?.length > 0 && (
        <details className={styles.warnings}>
          <summary>{t("turnFiles.captureDetails")}</summary>
          <ul>
            {turn.warnings.map((warning, index) => (
              <li key={`${index}:${warning}`}>{warning}</li>
            ))}
          </ul>
        </details>
      )}
      <ul className={styles.files}>
        {files.map((file) => {
          const version = file.status === "deleted" ? "before" : "after";
          const available =
            version === "before" ? file.before_available : file.after_available;
          const canDiff =
            !file.binary &&
            file.status !== "delivered" &&
            (file.status === "created" || file.before_available) &&
            (file.status === "deleted" || file.after_available);
          return (
            <li key={file.id} className={styles.file}>
              <div className={styles.row}>
                <span className={styles.status} data-status={file.status}>
                  {t(`turnFiles.status.${file.status}`)}
                </span>
                <button
                  className={styles.fileName}
                  type="button"
                  aria-label={`${t("turnFiles.openArchive")} ${file.name}`}
                  title={`${file.root}/${file.path}`}
                  disabled={!available}
                  onClick={(event) =>
                    openFilePreview(
                      turnFileTarget(archiveScope, turn, file, version),
                      event.currentTarget,
                      scope,
                    )
                  }
                >
                  <strong>{file.name}</strong>
                  <small>
                    {file.root} / {file.path}
                  </small>
                </button>
                <div className={styles.fileMeta}>
                  {file.delivered && file.status !== "deleted" && (
                    <span className={styles.deliveryTag}>
                      {t("turnFiles.delivery")}
                    </span>
                  )}
                  {file.binary ? (
                    <span>{t("turnFiles.binary")}</span>
                  ) : (
                    (file.additions != null || file.deletions != null) && (
                      <span>
                        <span className={styles.added}>
                          +{file.additions ?? 0}
                        </span>{" "}
                        <span className={styles.removed}>
                          −{file.deletions ?? 0}
                        </span>
                      </span>
                    )
                  )}
                </div>
                <div className={styles.actions}>
                  {canDiff && (
                    <button
                      type="button"
                      aria-expanded={diffId === file.id}
                      aria-label={`${t("turnFiles.diff")} ${file.name}`}
                      title={t("turnFiles.diff")}
                      onClick={() => void showDiff(file)}
                    >
                      <GitCompareArrows size={15} />
                    </button>
                  )}
                  {file.status !== "deleted" && (
                    <button
                      type="button"
                      aria-label={`${t("turnFiles.openCurrent")} ${file.name}`}
                      title={t("turnFiles.openCurrent")}
                      onClick={(event) =>
                        openFilePreview(
                          {
                            source: "workspace",
                            path: file.path,
                            root: file.root,
                          },
                          event.currentTarget,
                          scope,
                        )
                      }
                    >
                      <FolderOpen size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!available || Boolean(busy)}
                    aria-label={`${t(
                      version === "before"
                        ? "turnFiles.downloadBefore"
                        : "turnFiles.download",
                    )} ${file.name}`}
                    title={t(
                      version === "before"
                        ? "turnFiles.downloadBefore"
                        : "turnFiles.download",
                    )}
                    onClick={() =>
                      void download(file.id, () =>
                        turnFilesApi.downloadFile(
                          archiveScope,
                          turn.id,
                          file,
                          version,
                        ),
                      )
                    }
                  >
                    <Download size={15} />
                  </button>
                </div>
              </div>
              {!available && (
                <span className={styles.unavailable}>
                  {t("turnFiles.unavailable")}
                </span>
              )}
              {version === "before" && available && (
                <span className={styles.version}>
                  {t("turnFiles.beforeVersion")}
                </span>
              )}
              {diffId === file.id && (
                <div className={styles.diff}>
                  <div className={styles.diffHeading}>
                    {t("turnFiles.diffHint")}
                  </div>
                  {diffError ? (
                    <p role="alert">
                      {t("turnFiles.diffFailed")}{" "}
                      <button
                        type="button"
                        onClick={() => void showDiff(file, true)}
                      >
                        {t("turnFiles.retry")}
                      </button>
                    </p>
                  ) : !diff ? (
                    <p role="status">{t("turnFiles.loadingDiff")}</p>
                  ) : (
                    <>
                      {diff.truncated && (
                        <p className={styles.notice}>
                          {t("turnFiles.diffTruncated")}
                        </p>
                      )}
                      <Suspense
                        fallback={
                          <p role="status">{t("turnFiles.loadingDiff")}</p>
                        }
                      >
                        <DiffViewer diff={diff} />
                      </Suspense>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {turn.files.length > COLLAPSED_FILES && (
        <button
          className={styles.expand}
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded
            ? t("turnFiles.collapse")
            : t("turnFiles.showAll", { count: turn.files.length })}
        </button>
      )}
      {error && (
        <p role="alert" className={styles.notice}>
          {error}
        </p>
      )}
    </section>
  );
}

/** Replaces legacy tool hints only when an authoritative, scoped turn exists. */
export default function TurnFileSummary({
  scope,
  responseId,
  clientMessageId,
  completed,
  fallback,
}: TurnFileSummaryProps) {
  const { t } = useTranslation();
  const runtimeSessionId = turnFilesSessionId(scope);
  const scopeKey = JSON.stringify([
    filesWorkspaceScopeKey(scope),
    scope.chatId,
    runtimeSessionId,
    responseId,
    clientMessageId,
  ]);
  const [resolved, setResolved] = useState<{
    key: string;
    turn: TurnFileManifest;
  }>();
  const [revision, setRevision] = useState(0);
  const [captureState, setCaptureState] = useState<{
    key: string;
    state: "running" | "timeout" | "error";
  }>();
  const { agentId, sessionId, chatId, projectDirOverride } = scope;
  useEffect(() => {
    if (!completed || (!responseId && !clientMessageId)) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let latestTurn: TurnFileManifest | undefined;
    setCaptureState(undefined);
    const requestScope: SessionFilesScope = {
      kind: "session",
      agentId,
      sessionId,
      chatId,
      projectDirOverride,
    };
    const legacyId =
      !responseId || /^response_\d{13}-[a-z0-9]+$/i.test(responseId);
    const identityFilter =
      legacyId && clientMessageId ? { clientMessageId } : { responseId };
    const find = (turns: TurnFileManifest[]) =>
      matchTurn(
        turns.filter(
          (item) =>
            item.agent_id === agentId && item.session_id === runtimeSessionId,
        ),
        responseId,
        clientMessageId,
      );
    const poll = async () => {
      let failed = false;
      try {
        const result = await turnFilesApi.list(
          requestScope,
          attempt === 0 && revision === 0
            ? {}
            : { refresh: true, ...identityFilter },
        );
        if (!active) return;
        let turn = find(result.turns);
        // Recent results are shared by all cards. Older turns need an exact
        // query because the history can exceed the server's recent-page limit.
        if (!turn && attempt === 0) {
          const historical = await turnFilesApi.list(
            requestScope,
            identityFilter,
          );
          if (!active) return;
          turn = find(historical.turns);
        }
        if (turn) {
          latestTurn = turn;
          setResolved({ key: scopeKey, turn });
          if (turn.status === "running") {
            setCaptureState({ key: scopeKey, state: "running" });
          } else {
            setCaptureState(undefined);
            window.dispatchEvent(
              new CustomEvent(TURN_FILES_UPDATED_EVENT, {
                detail: {
                  agentId,
                  sessionId,
                  chatId,
                  turn,
                },
              }),
            );
            return;
          }
        }
      } catch {
        failed = true;
      }
      if (active && attempt < RETRY_DELAYS.length)
        timer = setTimeout(() => {
          attempt += 1;
          void poll();
        }, RETRY_DELAYS[attempt]);
      else if (active && (failed || latestTurn?.status === "running"))
        setCaptureState({ key: scopeKey, state: failed ? "error" : "timeout" });
    };
    void poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [
    scopeKey,
    completed,
    agentId,
    sessionId,
    chatId,
    projectDirOverride,
    responseId,
    clientMessageId,
    runtimeSessionId,
    revision,
  ]);
  const turn = resolved?.key === scopeKey ? resolved.turn : undefined;
  const status =
    captureState?.key === scopeKey ? captureState.state : undefined;
  // A running manifest can be empty before FINALLY completes the snapshot.
  // Keep the usable legacy hints until there is an authoritative final record.
  const showTurn = turn && (turn.status !== "running" || turn.files.length > 0);
  return (
    <>
      {showTurn ? (
        <SummaryContent
          key={`${scopeKey}:${turn.id}`}
          scope={scope}
          turn={turn}
        />
      ) : (
        fallback
      )}
      {status && (
        <p
          className={styles.captureStatus}
          role={status === "error" ? "alert" : "status"}
        >
          {t(
            status === "error"
              ? "turnFiles.captureFailed"
              : "turnFiles.capturing",
          )}
          {status !== "running" && (
            <button
              type="button"
              onClick={() => setRevision((value) => value + 1)}
            >
              {t("turnFiles.retry")}
            </button>
          )}
        </p>
      )}
    </>
  );
}
