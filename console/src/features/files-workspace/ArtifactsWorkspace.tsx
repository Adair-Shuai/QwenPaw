import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import type { FileTarget } from "./types";
import type { FilesWorkspaceScope } from "./filesWorkspaceScope";
import {
  responseArtifactIdentity,
  useResponseArtifacts,
} from "./responseArtifactRegistry";
import FileGlyph from "./FileGlyph";
import styles from "./FilesWorkspace.module.less";

interface ArtifactsWorkspaceProps {
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  target?: FileTarget;
  onSelect: (target: FileTarget) => void;
  preview?: ReactNode;
  persistedArtifacts?: FileTarget[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  moreError?: boolean;
  onLoadMore?: () => void;
}

/** Only explicit session deliveries belong here; the shared output folder does not. */
export default function ArtifactsWorkspace({
  scope,
  target,
  onSelect,
  preview,
  persistedArtifacts = [],
  loading = false,
  error,
  onRefresh,
  hasMore = false,
  loadingMore = false,
  moreError = false,
  onLoadMore,
}: ArtifactsWorkspaceProps) {
  const { t } = useTranslation();
  const responseArtifacts = useResponseArtifacts(scope);
  const artifacts = new Map<string, FileTarget>();
  const persistedPaths = new Set(
    persistedArtifacts.map((item) =>
      JSON.stringify([item.root ?? "", item.path]),
    ),
  );
  for (const item of [
    ...persistedArtifacts,
    ...responseArtifacts.filter(
      (item) =>
        !persistedPaths.has(JSON.stringify([item.root ?? "", item.path])),
    ),
  ]) {
    const identity = responseArtifactIdentity(item);
    if (!artifacts.has(identity)) artifacts.set(identity, item);
  }
  const selectedIdentity = target ? responseArtifactIdentity(target) : "";
  const shelf = (
    <aside
      className={styles.artifactShelf}
      aria-label={t("files.deliverables", "会话成果")}
    >
      <header className={styles.artifactShelfHeader}>
        <div>
          <strong>{t("files.deliverables", "会话成果")}</strong>
          <span>
            {t("files.deliverablesCount", "{{count}} 个文件", {
              count: artifacts.size,
            })}
          </span>
        </div>
        {onRefresh && (
          <button
            type="button"
            aria-label={t("files.refreshDeliverables", "刷新会话成果")}
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={15} />
          </button>
        )}
      </header>
      <div className={styles.artifactItems} aria-busy={loading}>
        {error && (
          <div className={styles.artifactShelfEmpty} role="alert">
            {error}
          </div>
        )}
        {Array.from(artifacts, ([identity, item]) => {
          const name =
            item.path.replace(/\\/g, "/").split("/").pop() || item.path;
          const selected = identity === selectedIdentity;
          const archivedAt =
            item.artifact?.meta?.finishedAt || item.artifact?.meta?.startedAt;
          const archiveDate =
            typeof archivedAt === "string" ? new Date(archivedAt) : null;
          const archiveLabel =
            archiveDate && Number.isFinite(archiveDate.getTime())
              ? archiveDate.toLocaleString()
              : "";
          return (
            <button
              type="button"
              key={identity}
              className={`${styles.artifactItem} ${
                selected ? styles.artifactItemSelected : ""
              }`}
              aria-pressed={selected}
              onClick={() => onSelect(item)}
              title={`${item.root ?? item.source}: ${item.path}`}
            >
              <FileGlyph name={name} size={17} />
              <span className={styles.artifactFileDetails}>
                <span>{name}</span>
                <small>
                  {item.root ? `${item.root} / ` : ""}
                  {item.path}
                </small>
                {archiveLabel && <small>{archiveLabel}</small>}
              </span>
            </button>
          );
        })}
        {!loading && !error && artifacts.size === 0 && (
          <div className={styles.artifactShelfEmpty}>
            {t(
              "files.deliverablesEmpty",
              "本会话生成和交付的文件会显示在这里。",
            )}
          </div>
        )}
        {loading && artifacts.size === 0 && (
          <div className={styles.artifactShelfEmpty} role="status">
            {t("files.deliverablesLoading", "正在加载会话成果…")}
          </div>
        )}
        {hasMore && onLoadMore && (
          <button
            type="button"
            className={styles.artifactLoadMore}
            onClick={onLoadMore}
            disabled={loading}
          >
            {loadingMore
              ? t("files.loadingMoreDeliverables", "正在加载历史成果…")
              : moreError
              ? t("files.retryMoreDeliverables", "重试加载历史成果")
              : t("files.loadMoreDeliverables", "加载更多历史成果")}
          </button>
        )}
      </div>
    </aside>
  );
  return preview === undefined ? (
    shelf
  ) : (
    <div className={styles.artifactsWorkspace}>
      {shelf}
      <section
        className={styles.artifactPreview}
        aria-label={t("files.deliverablePreview", "成果预览")}
      >
        {preview}
      </section>
    </div>
  );
}
