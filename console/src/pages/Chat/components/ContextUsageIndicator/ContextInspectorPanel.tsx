import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { ChevronDown, FileText, Quote, X } from "lucide-react";
import type {
  ContextInspectorProps,
  ContextInspectorSource,
  ContextInspectorSourceKind,
} from "./types";
import styles from "./ContextUsageIndicator.module.less";

const SOURCE_KINDS: ContextInspectorSourceKind[] = [
  "attachment",
  "quote",
  "rule",
  "memory",
  "message",
  "other",
];

function SourceRow({
  source,
  editable,
  onRemove,
}: {
  source: ContextInspectorSource;
  editable: boolean;
  onRemove?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const status = source.status ?? "unknown";
  return (
    <li className={styles.sourceRow}>
      {source.kind === "quote" ? (
        <Quote size={15} aria-hidden />
      ) : (
        <FileText size={15} aria-hidden />
      )}
      <div className={styles.sourceMain}>
        {source.content ? (
          <details className={styles.sourceDetail}>
            <summary>
              <span>{source.title}</span>
              <ChevronDown size={13} aria-hidden />
            </summary>
            <div className={styles.sourceContent}>{source.content}</div>
          </details>
        ) : (
          <span className={styles.sourceTitle}>{source.title}</span>
        )}
        {source.detail && <div className={styles.muted}>{source.detail}</div>}
        <span className={styles.sourceStatus} data-status={status}>
          {t(`chat.contextInspector.status.${status}`)}
        </span>
      </div>
      {editable && source.removable && onRemove && (
        <button
          type="button"
          className={styles.iconButton}
          aria-label={t("chat.contextInspector.remove", {
            title: source.title,
          })}
          onClick={() => onRemove(source.id)}
        >
          <X size={14} aria-hidden />
        </button>
      )}
    </li>
  );
}

export function ContextInspectorPanel({
  metrics,
  onClose,
  onCompact,
  onNew,
  draftSources = [],
  details,
  detailsLoading,
  detailsError,
  onRetry,
  onRemoveSource,
  removedSource,
  onUndoRemove,
  executionBusy,
}: ContextInspectorProps & {
  metrics: ReactNode;
  onClose: () => void;
  onCompact: () => void;
  onNew: () => void;
}) {
  const { t } = useTranslation();
  const panelId = useId();
  const [tab, setTab] = useState<"sources" | "summary">("sources");
  const [scope, setScope] = useState<"draft" | "latest">("draft");
  const sources = scope === "draft" ? draftSources : details?.sources ?? [];
  const showRemoteStatus = tab === "summary" || scope === "latest";
  const switchTab = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? "sources"
        : event.key === "End"
        ? "summary"
        : tab === "sources"
        ? "summary"
        : "sources";
    setTab(next);
    document.getElementById(`${panelId}-${next}-tab`)?.focus();
  };
  return (
    <div className={styles.panel}>
      <header className={styles.heading}>
        <strong>{t("chat.contextInspector.title")}</strong>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onClose}
          aria-label={t("chat.contextInspector.close")}
        >
          <X size={16} aria-hidden />
        </button>
      </header>
      <div className={styles.metrics}>{metrics}</div>
      <div
        role="tablist"
        aria-label={t("chat.contextInspector.sections")}
        className={styles.tabs}
      >
        {(["sources", "summary"] as const).map((value) => (
          <button
            key={value}
            id={`${panelId}-${value}-tab`}
            type="button"
            role="tab"
            aria-selected={tab === value}
            aria-controls={`${panelId}-content`}
            tabIndex={tab === value ? 0 : -1}
            onClick={() => setTab(value)}
            onKeyDown={switchTab}
          >
            {t(`chat.contextInspector.${value}`)}
          </button>
        ))}
      </div>
      <div
        id={`${panelId}-content`}
        role="tabpanel"
        aria-labelledby={`${panelId}-${tab}-tab`}
        className={styles.content}
        tabIndex={0}
      >
        {tab === "sources" && (
          <div className={styles.scopeRow}>
            <select
              aria-label={t("chat.contextInspector.scope")}
              value={scope}
              onChange={(event) =>
                setScope(event.target.value as "draft" | "latest")
              }
            >
              <option value="draft">{t("chat.contextInspector.draft")}</option>
              <option value="latest">
                {t("chat.contextInspector.latest")}
              </option>
            </select>
            <span className={styles.muted}>
              {t(
                scope === "draft"
                  ? "chat.contextInspector.draftHint"
                  : "chat.contextInspector.latestHint",
              )}
            </span>
          </div>
        )}
        {showRemoteStatus && detailsLoading ? (
          <p className={styles.empty} role="status">
            {t("chat.contextInspector.loading")}
          </p>
        ) : showRemoteStatus && detailsError ? (
          <div className={styles.empty} role="alert">
            <p>{detailsError}</p>
            {onRetry && (
              <Button size="small" onClick={onRetry}>
                {t("chat.contextInspector.retry")}
              </Button>
            )}
          </div>
        ) : tab === "sources" ? (
          <>
            {sources.length ? (
              SOURCE_KINDS.map((kind) => {
                const entries = sources.filter(
                  (source) => source.kind === kind,
                );
                if (!entries.length) return null;
                return (
                  <section key={kind} className={styles.sourceGroup}>
                    <h3>
                      {t(`chat.contextInspector.kind.${kind}`)}
                      <span>{entries.length}</span>
                    </h3>
                    <ul>
                      {entries.map((source) => (
                        <SourceRow
                          key={source.id}
                          source={source}
                          editable={scope === "draft"}
                          onRemove={onRemoveSource}
                        />
                      ))}
                    </ul>
                  </section>
                );
              })
            ) : (
              <p className={styles.empty}>
                {t(
                  scope === "draft"
                    ? "chat.contextInspector.emptyDraft"
                    : "chat.contextInspector.emptyLatest",
                )}
              </p>
            )}
            {scope === "draft" && removedSource && onUndoRemove && (
              <div className={styles.undo} role="status" aria-live="polite">
                <span>
                  {t("chat.contextInspector.removed", {
                    title: removedSource.title,
                  })}
                </span>
                <button type="button" onClick={onUndoRemove}>
                  {t("chat.contextInspector.undo")}
                </button>
              </div>
            )}
            <p className={styles.notice}>
              {scope === "latest" && details?.notice
                ? details.notice
                : t("chat.contextInspector.sourcesNotice")}
            </p>
          </>
        ) : (
          <section className={styles.summary}>
            {details?.summary?.content ? (
              <>
                <h3>{t("chat.contextInspector.retainedSummary")}</h3>
                {details.summary.updatedAt && (
                  <p className={styles.muted}>{details.summary.updatedAt}</p>
                )}
                <div className={styles.sourceContent}>
                  {details.summary.content}
                </div>
              </>
            ) : (
              <p className={styles.empty}>
                {details?.summary?.notice ||
                  t(
                    details?.summaryAvailable === false
                      ? "chat.contextInspector.summaryUnavailable"
                      : "chat.contextInspector.emptySummary",
                  )}
              </p>
            )}
            {details?.summary?.content && details.summary.notice && (
              <p className={styles.notice}>{details.summary.notice}</p>
            )}
            <p className={styles.notice}>
              {t("chat.contextInspector.summaryNotice")}
            </p>
          </section>
        )}
      </div>
      <footer className={styles.footer}>
        <div>
          <Button
            size="small"
            onClick={onCompact}
            disabled={executionBusy}
            title={
              executionBusy ? t("chat.contextInspector.busyHint") : undefined
            }
          >
            {t("chat.turnUsagePopover.compact")}
          </Button>
          <Button size="small" onClick={onNew}>
            {t("chat.turnUsagePopover.new")}
          </Button>
        </div>
        <span className={styles.muted}>
          {t(
            executionBusy
              ? "chat.contextInspector.busyHint"
              : "chat.contextInspector.manageHint",
          )}
        </span>
      </footer>
    </div>
  );
}
