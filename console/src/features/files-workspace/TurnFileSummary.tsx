import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  GitCompareArrows,
  LoaderCircle,
} from "lucide-react";
import prettyBytes from "pretty-bytes";
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
import TurnFileReviewHeader from "./TurnFileReviewHeader";
import DeliveryFileActions from "./DeliveryFileActions";
import ZoomableChatImage from "./ZoomableChatImage";
import { normalizeTurnFileCapture } from "./turnFileCaptureDiagnostics";
import styles from "./TurnFileSummary.module.less";

const DiffViewer = lazy(() => import("./TurnFileDiffViewer"));
const RETRY_DELAYS = [400, 800, 1600, 2500, 4000];
const COLLAPSED_FILES = 4;
const IMAGE_FILE = /\.(?:png|jpe?g|gif|webp|avif|bmp|svg)$/i;

function DeliveredImage({
  scope,
  turn,
  file,
}: {
  scope: SessionFilesScope;
  turn: TurnFileManifest;
  file: TurnFileEntry;
}) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <span className={styles.imageError} role="status">
        <span>{t("turnFiles.imagePreviewFailed")}</span>
        <button type="button" onClick={() => setFailed(false)}>
          {t("turnFiles.retry")}
        </button>
      </span>
    );
  const src = turnFilesApi.fileUrl(scope, turn.id, file.id, "after");
  return (
    <ZoomableChatImage
      className={styles.imagePreview}
      key={src}
      src={src}
      alt={file.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export interface TurnFileSummaryProps {
  scope: SessionFilesScope;
  responseId?: string;
  clientMessageId?: string;
  completed: boolean;
  /** Saved calls or trusted capture metadata must support ambient changes. */
  includeObservedChanges?: boolean;
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

function canCompare(file: TurnFileEntry): boolean {
  return (
    !file.binary &&
    file.status !== "delivered" &&
    (file.status === "created" || file.before_available) &&
    (file.status === "deleted" || file.after_available)
  );
}

function SummaryContent({
  scope,
  turn,
  review = false,
}: {
  scope: SessionFilesScope;
  turn: TurnFileManifest;
  review?: boolean;
}) {
  const { t } = useTranslation();
  const captureWarnings = [
    ...(turn.warnings ?? []),
    ...(turn.scan_warnings ?? []),
  ];
  const [expanded, setExpanded] = useState(false);
  const [archiveExpanded, setArchiveExpanded] = useState(false);
  const [otherExpanded, setOtherExpanded] = useState(false);
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState("");
  const [diffId, setDiffId] = useState<string>();
  const [diff, setDiff] = useState<TurnFileDiff>();
  const [split, setSplit] = useState(true);
  const [wrap, setWrap] = useState(false);
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
  // A failed archive remains a visible delivery, with its actions disabled.
  const deliveries = turn.files.filter(
    (file) => file.delivered && file.status !== "deleted",
  );
  const otherFiles = turn.files.filter(
    (file) => !file.delivered || file.status === "deleted",
  );
  const primaryFiles = deliveries.length > 0 ? deliveries : turn.files;
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
  // These are shortcuts to real archived siblings, not inferred deliveries.
  // Keep delivery counts and the complete change list faithful to the manifest.
  const imageDirectories = new Set(
    deliveries
      .filter((file) => IMAGE_FILE.test(file.name))
      .map((file) =>
        JSON.stringify([
          file.root,
          file.path.slice(0, file.path.lastIndexOf("/") + 1),
        ]),
      ),
  );
  const relatedPages = otherFiles
    .filter(
      (file) =>
        file.status !== "deleted" &&
        file.after_available &&
        /\.html?$/i.test(file.name) &&
        imageDirectories.has(
          JSON.stringify([
            file.root,
            file.path.slice(0, file.path.lastIndexOf("/") + 1),
          ]),
        ),
    )
    .sort(
      (a, b) =>
        Number(/^index\.html?$/i.test(b.name)) -
        Number(/^index\.html?$/i.test(a.name)),
    );

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
    if (!canCompare(file)) return;
    try {
      const result = await turnFilesApi.diff(archiveScope, turn.id, file.id);
      if (alive.current && diffRequest.current === requestId) setDiff(result);
    } catch {
      if (alive.current && diffRequest.current === requestId)
        setDiffError(true);
    }
  };

  const selectedFile = turn.files.find((file) => file.id === diffId);
  const initialReview = useRef(false);
  useEffect(() => {
    if (!review || initialReview.current || !turn.files.length) return;
    initialReview.current = true;
    void showDiff(turn.files.find(canCompare) ?? turn.files[0]);
    // The enclosing turn/scope identity remounts this archive view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review, turn.id]);

  const comparison = selectedFile && (
    <div className={styles.diff}>
      <TurnFileReviewHeader
        scope={archiveScope}
        turn={turn}
        file={selectedFile}
        onSelect={(file) => {
          if (file.id !== diffId) void showDiff(file);
        }}
        split={split}
        onSplit={setSplit}
        wrap={wrap}
        onWrap={setWrap}
      />
      <div className={styles.diffHeading}>{t("turnFiles.diffHint")}</div>
      {!canCompare(selectedFile) ? (
        <p role="status">{t("turnFiles.diffUnsupported")}</p>
      ) : diffError ? (
        <p role="alert">
          {t("turnFiles.diffFailed")}{" "}
          <button
            type="button"
            onClick={() => void showDiff(selectedFile, true)}
          >
            {t("turnFiles.retry")}
          </button>
        </p>
      ) : !diff ? (
        <p role="status">{t("turnFiles.loadingDiff")}</p>
      ) : (
        <>
          {diff.truncated && (
            <p className={styles.notice}>{t("turnFiles.diffTruncated")}</p>
          )}
          <Suspense
            fallback={<p role="status">{t("turnFiles.loadingDiff")}</p>}
          >
            <DiffViewer
              diff={diff}
              sideBySide={split}
              wrapLines={wrap}
              hideToolbar
            />
          </Suspense>
        </>
      )}
    </div>
  );

  const renderFiles = (files: TurnFileEntry[], featured = false) => (
    <ul className={`${styles.files}${featured ? "" : ` ${styles.changeList}`}`}>
      {files.map((file) => {
        const version = file.status === "deleted" ? "before" : "after";
        const available =
          version === "before" ? file.before_available : file.after_available;
        const canDiff = canCompare(file);
        const extension =
          file.name.match(/\.([^.]+)$/)?.[1].toLowerCase() || "";
        const kind = /^(csv|tsv|xlsx?|ods)$/.test(extension)
          ? "table"
          : /^(png|jpe?g|gif|webp|svg|ico)$/.test(extension)
          ? "image"
          : /^(json|py|[cm]?[jt]sx?|html|css|ya?ml|sh)$/.test(extension)
          ? "code"
          : "document";
        const FileIcon = {
          table: FileSpreadsheet,
          image: FileImage,
          code: FileCode2,
          document: FileText,
        }[kind];
        const size = version === "before" ? file.before_size : file.size;
        const target = turnFileTarget(archiveScope, turn, file, version);
        return (
          <DeliveryFileActions
            key={file.id}
            compact
            name={file.name}
            target={target}
            scope={archiveScope}
            disabled={!available}
            onPreview={(trigger, presentation) =>
              openFilePreview(target, trigger, scope, presentation)
            }
            moreActions={[
              ...(canDiff
                ? [
                    {
                      key: "diff",
                      label: t("turnFiles.diff"),
                      icon: <GitCompareArrows size={16} />,
                      onSelect: () => void showDiff(file),
                    },
                  ]
                : []),
              ...(file.status !== "deleted"
                ? [
                    {
                      key: "current",
                      label: t("turnFiles.openCurrent"),
                      icon: <FolderOpen size={16} />,
                      onSelect: (trigger: HTMLElement) =>
                        openFilePreview(
                          {
                            source: "workspace",
                            path: file.path,
                            root: file.root,
                          },
                          trigger,
                          scope,
                        ),
                    },
                  ]
                : []),
              {
                key: "download",
                label: t(
                  version === "before"
                    ? "turnFiles.downloadBefore"
                    : "turnFiles.download",
                ),
                icon:
                  busy === file.id ? (
                    <LoaderCircle size={16} className={styles.spinner} />
                  ) : (
                    <Download size={16} />
                  ),
                disabled: !available || Boolean(busy),
                onSelect: () =>
                  void download(file.id, () =>
                    turnFilesApi.downloadFile(
                      archiveScope,
                      turn.id,
                      file,
                      version,
                    ),
                  ),
              },
            ]}
          >
            {(actions) => (
              <li
                className={styles.file}
                data-featured={featured}
                onClick={(event) => {
                  if (
                    available &&
                    event.target instanceof Element &&
                    event.currentTarget.contains(event.target) &&
                    !event.target.closest("button, a, input, summary")
                  )
                    openFilePreview(target, event.currentTarget, scope);
                }}
              >
                {featured &&
                  file.delivered &&
                  available &&
                  version === "after" &&
                  IMAGE_FILE.test(file.name) && (
                    <DeliveredImage
                      key={`${turn.id}:${file.id}`}
                      scope={archiveScope}
                      turn={turn}
                      file={file}
                    />
                  )}
                <div className={styles.row}>
                  <button
                    className={styles.previewButton}
                    type="button"
                    aria-label={`${t("turnFiles.openArchive")} ${file.name}`}
                    title={`${file.root}/${file.path}`}
                    disabled={!available}
                    onClick={(event) =>
                      openFilePreview(target, event.currentTarget, scope)
                    }
                  >
                    <span
                      className={styles.fileIcon}
                      data-kind={kind}
                      aria-hidden="true"
                    >
                      <FileIcon size={22} strokeWidth={1.6} />
                    </span>
                    <span className={styles.fileInfo}>
                      <span className={styles.fileName}>
                        {!featured && file.path.includes("/") && (
                          <span className={styles.pathDirectory}>
                            {file.path.slice(0, file.path.lastIndexOf("/") + 1)}
                          </span>
                        )}
                        <strong>{file.name}</strong>
                      </span>
                      <span className={styles.fileMeta}>
                        {featured && (
                          <span className={styles.fileType}>
                            {extension && extension.length <= 6
                              ? extension.toUpperCase()
                              : t("turnFiles.file")}
                          </span>
                        )}
                        {featured && size != null && (
                          <span>{prettyBytes(size)}</span>
                        )}
                        {!featured && (
                          <span
                            className={styles.status}
                            data-status={file.status}
                          >
                            {t(`turnFiles.status.${file.status}`)}
                          </span>
                        )}
                        {version === "before" && available && (
                          <span
                            className={styles.version}
                            title={t("turnFiles.beforeVersion")}
                          >
                            {t("turnFiles.beforeVersion")}
                          </span>
                        )}
                        {!file.binary &&
                          (file.additions != null ||
                            file.deletions != null) && (
                            <span>
                              <span className={styles.added}>
                                +{file.additions ?? 0}
                              </span>{" "}
                              <span className={styles.removed}>
                                −{file.deletions ?? 0}
                              </span>
                            </span>
                          )}
                      </span>
                    </span>
                  </button>
                  {actions}
                </div>
                {!available && (
                  <span className={styles.unavailable}>
                    {t("turnFiles.unavailable")}
                  </span>
                )}
              </li>
            )}
          </DeliveryFileActions>
        );
      })}
    </ul>
  );

  if (turn.files.length === 0 && !turn.incomplete && !turn.overlap) return null;
  return (
    <section
      className={styles.summary}
      aria-label={t("turnFiles.title")}
      data-turn-id={turn.id}
    >
      {deliveries.length === 0 && turn.files.length > 0 && (
        <div className={styles.changesHeading}>
          <span className={styles.fileIcon}>
            <FileCode2 size={20} aria-hidden="true" />
          </span>
          <div>
            <strong>
              {t("turnFiles.changedCount", { count: turn.files.length })}
            </strong>
            {hasLineCounts && (
              <span className={styles.counts}>
                <span className={styles.added}>+{additions}</span>
                <span className={styles.removed}>−{deletions}</span>
              </span>
            )}
          </div>
        </div>
      )}
      {review && comparison}
      {renderFiles(
        expanded ? primaryFiles : primaryFiles.slice(0, COLLAPSED_FILES),
        deliveries.length > 0,
      )}
      <header className={styles.header}>
        <div className={styles.heading}>
          <div className={styles.subtitle}>
            {delivered > 0 && (
              <span>{t("turnFiles.deliveredCount", { count: delivered })}</span>
            )}
            <span>
              {t("turnFiles.fileCount", { count: turn.files.length })}
            </span>
          </div>
        </div>
        <button
          className={styles.bundle}
          type="button"
          aria-busy={busy === "bundle"}
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
          {busy === "bundle" ? (
            <LoaderCircle size={14} className={styles.spinner} />
          ) : (
            <Download size={14} />
          )}
          {t("turnFiles.downloadTurn")}
        </button>
      </header>
      {primaryFiles.length > COLLAPSED_FILES && (
        <button
          className={styles.expand}
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded
            ? t("turnFiles.collapse")
            : t("turnFiles.showAll", { count: primaryFiles.length })}
        </button>
      )}
      {relatedPages.length > 0 && (
        <nav
          className={styles.relatedPages}
          aria-label={t("turnFiles.relatedPages")}
        >
          <span>{t("turnFiles.relatedPages")}</span>
          {relatedPages.map((file) => (
            <button
              key={file.id}
              type="button"
              title={`${file.root}/${file.path}`}
              aria-label={`${t("turnFiles.openRelatedPage")} ${file.name}`}
              onClick={(event) =>
                openFilePreview(
                  turnFileTarget(archiveScope, turn, file),
                  event.currentTarget,
                  scope,
                )
              }
            >
              <FileCode2 size={14} aria-hidden="true" />
              {file.name}
            </button>
          ))}
        </nav>
      )}
      {deliveries.length > 0 && otherFiles.length > 0 && (
        <details className={styles.otherFiles}>
          <summary>
            <ChevronDown
              size={14}
              className={styles.chevron}
              aria-hidden="true"
            />
            <span>{t("turnFiles.otherChanges")}</span>
            <span className={styles.badge}>{otherFiles.length}</span>
          </summary>
          {renderFiles(
            otherExpanded ? otherFiles : otherFiles.slice(0, COLLAPSED_FILES),
          )}
          {!review &&
            otherFiles.some((file) => file.id === diffId) &&
            comparison}
          {otherFiles.length > COLLAPSED_FILES && (
            <button
              className={styles.expand}
              type="button"
              aria-expanded={otherExpanded}
              onClick={() => setOtherExpanded(!otherExpanded)}
            >
              {otherExpanded ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
              {otherExpanded
                ? t("turnFiles.collapse")
                : t("turnFiles.showAll", { count: otherFiles.length })}
            </button>
          )}
        </details>
      )}
      {!review &&
        !(
          deliveries.length > 0 && otherFiles.some((file) => file.id === diffId)
        ) &&
        comparison}
      <footer className={styles.footer}>
        <details
          className={styles.archiveDetails}
          onToggle={(event) => setArchiveExpanded(event.currentTarget.open)}
        >
          <summary>{t("turnFiles.versionDetails")}</summary>
          <div className={styles.archiveNote}>
            <span>{t("turnFiles.archiveHint")}</span>
            {hasLineCounts && (
              <span
                className={styles.counts}
                aria-label={t("turnFiles.lineChanges")}
              >
                <span className={styles.added}>+{additions}</span>
                <span className={styles.removed}>−{deletions}</span>
              </span>
            )}
          </div>
          {archiveExpanded && (
            <div className={styles.archiveVersions}>
              {turn.files
                .filter((file) => file.before_available)
                .map((file) => (
                  <div key={file.id}>
                    <span title={`${file.root}/${file.path}`}>{file.name}</span>
                    <button
                      type="button"
                      aria-label={`${t("turnFiles.openBefore")} ${file.name}`}
                      onClick={(event) =>
                        openFilePreview(
                          turnFileTarget(archiveScope, turn, file, "before"),
                          event.currentTarget,
                          scope,
                        )
                      }
                    >
                      {t("turnFiles.openBefore")}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      aria-label={`${t("turnFiles.downloadPrevious")} ${
                        file.name
                      }`}
                      onClick={() =>
                        void download(`before:${file.id}`, () =>
                          turnFilesApi.downloadFile(
                            archiveScope,
                            turn.id,
                            file,
                            "before",
                          ),
                        )
                      }
                    >
                      {t("turnFiles.downloadPrevious")}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </details>
        {turn.status !== "completed" &&
          turn.status !== "success" &&
          turn.status !== "running" && (
            <p className={styles.notice}>
              <AlertCircle size={13} />
              {t("turnFiles.interrupted")}
            </p>
          )}
        {turn.overlap && (
          <p className={styles.notice}>
            <AlertCircle size={13} />
            {t("turnFiles.overlap")}
          </p>
        )}
        {turn.incomplete && captureWarnings.length === 0 && (
          <p className={styles.notice}>
            <AlertCircle size={13} />
            {t("turnFiles.incomplete")}
          </p>
        )}
        {captureWarnings.length > 0 && (
          <details className={styles.warnings}>
            <summary className={turn.incomplete ? styles.notice : undefined}>
              {turn.incomplete && <AlertCircle size={13} />}
              {t(
                turn.incomplete
                  ? "turnFiles.incomplete"
                  : turn.scan_warnings?.length
                  ? "turnFiles.scanDetails"
                  : "turnFiles.captureDetails",
              )}
            </summary>
            <ul>
              {captureWarnings.map((warning, index) => (
                <li key={`${index}:${warning}`}>{warning}</li>
              ))}
            </ul>
          </details>
        )}
      </footer>
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
  includeObservedChanges = true,
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
          turn = normalizeTurnFileCapture(turn);
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
  // Older snapshots watched the shared workspace even for plain conversation.
  // Preserve their immutable records, but only present proven deliveries when
  // neither saved tool calls nor capture metadata establish tool activity.
  const displayTurn =
    turn && !includeObservedChanges && !turn.tool_activity
      ? {
          ...turn,
          files: turn.files.filter((file) => file.delivered),
          incomplete: turn.files.some(
            (file) => file.delivered && !file.after_available,
          ),
          warnings: (turn.warnings ?? []).filter((warning) =>
            /deliver|archiv/i.test(warning),
          ),
          overlap: false,
        }
      : turn;
  return (
    <>
      {showTurn ? (
        <SummaryContent
          key={`${scopeKey}:${turn.id}`}
          scope={scope}
          turn={displayTurn!}
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

export { SummaryContent as TurnFileDetails };
