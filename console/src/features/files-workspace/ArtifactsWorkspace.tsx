import { FileText, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { workspaceApi } from "../../api/modules/workspace";
import type { DirectoryEntry, FileTarget } from "./types";
import type { FilesWorkspaceScope } from "./filesWorkspaceScope";
import { useResponseArtifacts } from "./responseArtifactRegistry";
import styles from "./FilesWorkspace.module.less";

interface ArtifactsWorkspaceProps {
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  target?: FileTarget;
  onSelect: (target: FileTarget) => void;
  preview: ReactNode;
}

/** Chat artifacts are a flat collection, separate from the file manager tree. */
export default function ArtifactsWorkspace({
  scope,
  target,
  onSelect,
  preview,
}: ArtifactsWorkspaceProps) {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const responseArtifacts = useResponseArtifacts();
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void workspaceApi
      .listDirectory(
        "output",
        undefined,
        200,
        scope.chatId,
        "workspace",
        scope.projectDirOverride,
      )
      .then((page) => {
        if (!cancelled) {
          setEntries(page.entries.filter((entry) => entry.kind === "file"));
        }
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [revision, scope.agentId, scope.chatId, scope.projectDirOverride]);

  const artifacts: FileTarget[] = [...responseArtifacts];
  const seenPaths = new Set(artifacts.map((item) => item.path));
  for (const entry of entries) {
    if (seenPaths.has(entry.path)) continue;
    artifacts.push({
      source: "workspace",
      path: entry.path,
      root: "workspace",
    });
    seenPaths.add(entry.path);
  }
  if (
    target &&
    !artifacts.some(
      (item) => item.path === target.path && item.root === target.root,
    )
  ) {
    artifacts.unshift(target);
  }

  return (
    <div className={styles.artifactsWorkspace}>
      <aside className={styles.artifactShelf} aria-label="Artifact 区域">
        <header className={styles.artifactShelfHeader}>
          <div>
            <strong>Artifacts</strong>
            <span>{artifacts.length} 个文件</span>
          </div>
          <button type="button" aria-label="刷新 Artifacts" onClick={refresh}>
            <RefreshCw size={15} />
          </button>
        </header>
        <div className={styles.artifactItems}>
          {artifacts.map((item) => {
            const name =
              item.path.replace(/\\/g, "/").split("/").pop() || item.path;
            const selected =
              item.path === target?.path && item.root === target.root;
            return (
              <button
                type="button"
                key={`${item.root ?? "url"}:${item.path}`}
                className={`${styles.artifactItem} ${
                  selected ? styles.artifactItemSelected : ""
                }`}
                aria-pressed={selected}
                onClick={() => onSelect(item)}
                title={item.path}
              >
                <FileText size={17} />
                <span>{name}</span>
              </button>
            );
          })}
          {!loading && artifacts.length === 0 && (
            <div className={styles.artifactShelfEmpty}>
              本会话生成的文件会显示在这里。
            </div>
          )}
          {loading && artifacts.length === 0 && (
            <div className={styles.artifactShelfEmpty}>正在加载 Artifacts…</div>
          )}
        </div>
      </aside>
      <section className={styles.artifactPreview} aria-label="Artifact 预览">
        {preview}
      </section>
    </div>
  );
}
