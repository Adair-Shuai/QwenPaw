import {
  ArrowLeft,
  Expand,
  FileWarning,
  Files,
  GitBranch,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input, Modal, message } from "antd";
import { useTranslation } from "react-i18next";
import { buildWorkspaceScopeHeaders } from "../../api/authHeaders";
import { projectDirectoryApi } from "../../api/modules/projectDirectory";
import { getPendingProjectDirectory } from "../project-directory/pendingProjectDirectory";
import { loadSessionProjectDirs } from "../project-directory/loadSessionProjectDirs";
import { listenForProjectDirectoryChanges } from "../project-directory/projectDirectoryChangeEvent";
import { workspaceApi } from "../../api/modules/workspace";
import GitPanel from "../../pages/Coding/GitPanel";
import TabbedEditor from "../../pages/Coding/TabbedEditor";
import {
  useCodingTabsStore,
  useActiveTabPathForScope,
  useTabsForScope,
} from "../../stores/codingTabsStore";
import { useCodingMode } from "../../stores/codingModeStore";
import { downloadFileFromUrl } from "../../utils/downloadFileFromUrl";
import FilesNavigator from "./FilesNavigator";
import MemoryGraphView from "./MemoryGraphView";
import { projectRootPath, workspaceRoots } from "./directorySources";
import {
  filesWorkspaceScopeKey,
  type FilesWorkspaceScope,
} from "./filesWorkspaceScope";
import { toProjectRelativePath } from "./internalFileLinks";
import type {
  FileMetadata,
  FileTarget,
  MemoryGraphRoot,
  WorkspaceRoot,
} from "./types";
import {
  isInlineGeneratedTab,
  sanitizeWorkspaceSavePath,
} from "./workspaceSavePath";
import {
  revealTargetFromEditorTab,
  revealWorkspacePath,
  stripEditorTabPath,
} from "./workspaceReveal";
import {
  UPDATE_FILE_PREVIEW_EVENT,
  type UpdateFilePreviewDetail,
} from "./openFilePreview";
import styles from "./FilesWorkspace.module.less";

interface FilesWorkspaceProps {
  initialTarget?: FileTarget;
  scope: FilesWorkspaceScope;
  compact?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  onClose?: () => void;
}

function inferPreviewKind(
  path: string,
  contentType = "",
): FileMetadata["preview_kind"] {
  if (/\.(?:png|jpe?g|gif|webp|svg|ico|bmp)$/i.test(path)) return "image";
  if (/\.pdf$/i.test(path)) return "pdf";
  if (/\.csv$/i.test(path)) return "csv";
  if (
    contentType.startsWith("text/") ||
    /\.(?:md|mdx|markdown|mmd|mermaid|txt|log|json|ya?ml|toml|xml|html?|css|less|scss|js|jsx|ts|tsx|py|java|go|rs|sh)$/i.test(
      path,
    ) ||
    !path.split("/").pop()?.includes(".")
  ) {
    return "text";
  }
  return "binary";
}

export default function FilesWorkspace({
  initialTarget,
  scope,
  compact = false,
  onExpand,
  onCollapse,
  onClose,
}: FilesWorkspaceProps) {
  const { t } = useTranslation();
  const { codingMode } = useCodingMode();
  const scopeKey = filesWorkspaceScopeKey(scope);
  const chatId = scope.kind === "session" ? scope.chatId : undefined;
  // Primitives rather than `scope`: the object is rebuilt by the parent on
  // every render, and callbacks keyed on it feed effects that would then
  // refetch and re-activate the initial tab on unrelated re-renders.
  const scopeKind = scope.kind;
  const agentId = scope.agentId;
  const sessionId = scope.kind === "session" ? scope.sessionId : "";
  const projectDirOverride =
    scope.kind === "session" && !scope.chatId
      ? getPendingProjectDirectory(scope.agentId, scope.sessionId) ??
        scope.projectDirOverride ??
        undefined
      : undefined;
  const effectiveScope: FilesWorkspaceScope =
    scope.kind === "session" ? { ...scope, projectDirOverride } : scope;
  const tabs = useTabsForScope(scopeKey);
  const activeTabPath = useActiveTabPathForScope(scopeKey);
  const {
    clearProjectTabs,
    closeTab,
    openTab,
    setActiveTab,
    setTabContent,
    setTabDirty,
    setTabEtag,
  } = useCodingTabsStore();
  const hydratedTabs = useRef(new Set<string>());
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const targetsByTab = useRef(new Map<string, FileTarget>());
  const navigationSequence = useRef(0);
  const [loadError, setLoadError] = useState("");
  const [memoryGraphRoot, setMemoryGraphRoot] =
    useState<MemoryGraphRoot | null>(null);
  const [activity, setActivity] = useState<"files" | "git">("files");
  const [directoryRevision, setDirectoryRevision] = useState(0);
  const [editorNavigation, setEditorNavigation] = useState<{
    path: string;
    line: number;
    endLine: number;
    column?: number;
    sequence: number;
  } | null>(null);

  useEffect(
    () =>
      listenForProjectDirectoryChanges((changedScopeKey) => {
        if (changedScopeKey === scopeKey) {
          clearProjectTabs(scopeKey);
          setDirectoryRevision((current) => current + 1);
        }
      }),
    [clearProjectTabs, scopeKey],
  );

  const resolveEditableTarget = useCallback(
    async (target: FileTarget): Promise<FileTarget> => {
      if (target.source !== "attachment" || !target.path) {
        return target;
      }
      try {
        const agentInfo = await projectDirectoryApi.get();
        const workspaceDirectory = agentInfo.workspace_dir ?? agentInfo.path;
        // An attachment can live under any directory the session is bound to,
        // so every one is a candidate — checking only the primary would leave
        // a file in an extra root stuck as a read-only historical artifact.
        const boundDirs =
          scopeKind === "session"
            ? (await loadSessionProjectDirs(agentId, sessionId, chatId)).dirs
            : [
                {
                  path: agentInfo.path,
                  label: null,
                  exists: true,
                  nested_with: null,
                },
              ];
        const directPath = toProjectRelativePath(target.path);
        const candidates: Array<{
          path: string;
          root: WorkspaceRoot;
        }> = [];
        const addCandidate = (path: string | null, root: WorkspaceRoot) => {
          if (
            path &&
            !candidates.some((item) => item.path === path && item.root === root)
          ) {
            candidates.push({ path, root });
          }
        };

        workspaceRoots(boundDirs).forEach((root) => {
          const directory =
            root === "workspace"
              ? workspaceDirectory
              : projectRootPath(root) ?? boundDirs[0]?.path ?? "";
          addCandidate(
            directPath ?? toProjectRelativePath(target.path, directory),
            root,
          );
        });

        for (const candidate of candidates) {
          try {
            await workspaceApi.getFileMetadata(
              candidate.path,
              chatId,
              candidate.root,
              projectDirOverride,
            );
            return {
              ...target,
              source: "workspace",
              path: candidate.path,
              root: candidate.root,
            };
          } catch {
            // Try the next visible directory root.
          }
        }
      } catch {
        // Keep historical attachments read-only when directory lookup fails.
      }
      return target;
    },
    [agentId, chatId, projectDirOverride, scopeKind, sessionId],
  );

  const loadTarget = useCallback(
    async (target: FileTarget) => {
      if (target.source === "profile") {
        return {
          content: (await workspaceApi.loadFile(target.path)).content,
          previewKind: "text" as const,
          readOnly: false,
          etag: "",
        };
      }
      if (
        target.source === "memory" ||
        target.source === "daily" ||
        target.source === "digest"
      ) {
        const section =
          target.source === "daily" || target.source === "digest"
            ? target.source
            : undefined;
        return {
          content: (
            await (section
              ? workspaceApi.loadMemoryFile(target.path, section)
              : workspaceApi.loadDailyMemory(target.path))
          ).content,
          previewKind: "text" as const,
          readOnly: false,
          etag: "",
        };
      }
      if (target.source === "workspace") {
        const metadata = await workspaceApi.getFileMetadata(
          target.path,
          chatId,
          target.root,
          projectDirOverride,
        );
        const isText =
          metadata.preview_kind === "text" || metadata.preview_kind === "csv";
        const loaded = isText
          ? await workspaceApi.loadFileText(
              target.path,
              chatId,
              target.root,
              projectDirOverride,
            )
          : null;
        return {
          content: loaded?.content ?? "",
          previewKind: metadata.preview_kind,
          readOnly: !isText,
          etag: loaded?.etag ?? metadata.etag,
        };
      }
      if (target.artifact?.textContent !== undefined) {
        const previewKind = inferPreviewKind(
          target.path,
          target.artifact.mimeType ?? "",
        );
        return {
          content: target.artifact.textContent,
          previewKind,
          readOnly: previewKind !== "text" && previewKind !== "csv",
          etag: "",
        };
      }
      if (!target.artifactUrl) {
        throw new Error(`Missing artifact URL for ${target.source}`);
      }
      const response = await fetch(target.artifactUrl, {
        headers: buildWorkspaceScopeHeaders({
          agentId: scope.agentId,
          chatId,
          projectDirOverride,
        }),
      });
      if (!response.ok) throw new Error(`${response.status}`);
      const previewKind = inferPreviewKind(
        target.path,
        response.headers.get("Content-Type") ?? "",
      );
      return {
        content:
          previewKind === "text" || previewKind === "csv"
            ? await response.text()
            : "",
        previewKind,
        readOnly: true,
        etag: response.headers.get("ETag") ?? "",
      };
    },
    [chatId, projectDirOverride, scope.agentId],
  );

  const loadTabContent = useCallback(
    async (tabPath: string) => {
      const tab = tabsRef.current.find((item) => item.path === tabPath);
      const separator = tabPath.indexOf("::");
      const target =
        targetsByTab.current.get(tabPath) ??
        ({
          source:
            tab?.source ??
            (separator < 0
              ? "workspace"
              : (tabPath.slice(0, separator) as FileTarget["source"])),
          path: separator < 0 ? tabPath : tabPath.slice(separator + 2),
          root: tab?.workspaceRoot,
          artifactUrl: tab?.artifactUrl,
        } satisfies FileTarget);
      const loaded = await loadTarget(target);
      setTabEtag(scopeKey, tabPath, loaded.etag);
      return loaded.content;
    },
    [loadTarget, scopeKey, setTabEtag],
  );

  const openTarget = useCallback(
    async (target: FileTarget) => {
      const resolvedTarget = await resolveEditableTarget(target);
      // Tab identity has to include the root: the same relative path exists in
      // more than one bound directory, and a bare path would make two different
      // files share one tab (and one dirty buffer). The primary keeps its bare
      // path so previously persisted tabs still match.
      const tabPath =
        resolvedTarget.source === "workspace"
          ? resolvedTarget.root === "workspace"
            ? `workspace-root::${resolvedTarget.path}`
            : resolvedTarget.root && resolvedTarget.root !== "project"
            ? `${resolvedTarget.root}::${resolvedTarget.path}`
            : resolvedTarget.path
          : `${resolvedTarget.source}::${resolvedTarget.path}`;
      targetsByTab.current.set(tabPath, resolvedTarget);
      if (resolvedTarget.line) {
        navigationSequence.current += 1;
        setEditorNavigation({
          path: tabPath,
          line: resolvedTarget.line,
          endLine: resolvedTarget.endLine ?? resolvedTarget.line,
          column: resolvedTarget.column,
          sequence: navigationSequence.current,
        });
      }
      const existing = tabsRef.current.find((tab) => tab.path === tabPath);
      if (existing) {
        setLoadError("");
        const inlineText = resolvedTarget.artifact?.textContent;
        if (inlineText !== undefined && !existing.readOnly) {
          setTabContent(scopeKey, tabPath, inlineText);
          setActiveTab(scopeKey, tabPath);
          return;
        }
        if (inlineText === undefined) {
          setActiveTab(scopeKey, tabPath);
          return;
        }
        closeTab(scopeKey, tabPath);
      }
      try {
        const loaded = await loadTarget(resolvedTarget);
        setLoadError("");
        openTab(scopeKey, {
          path: tabPath,
          displayPath: resolvedTarget.path,
          content: loaded.content,
          dirty: false,
          source: resolvedTarget.source,
          workspaceRoot: resolvedTarget.root,
          artifactUrl: resolvedTarget.artifactUrl,
          previewKind: loaded.previewKind,
          readOnly: loaded.readOnly,
          etag: loaded.etag,
        });
        setActiveTab(scopeKey, tabPath);
      } catch {
        setLoadError(t("files.loadFailed"));
      }
    },
    [
      closeTab,
      loadTarget,
      openTab,
      resolveEditableTarget,
      scopeKey,
      setActiveTab,
      setTabContent,
      t,
    ],
  );

  useEffect(() => {
    const applyPreviewUpdate = (event: Event) => {
      const detail = (event as CustomEvent<UpdateFilePreviewDetail>).detail;
      if (!detail?.id) return;
      for (const [tabPath, target] of targetsByTab.current) {
        if (target.artifact?.id !== detail.id) continue;
        targetsByTab.current.set(tabPath, {
          ...target,
          artifact: target.artifact
            ? { ...target.artifact, ...detail.patch }
            : target.artifact,
        });
        if (detail.patch.textContent !== undefined) {
          setTabContent(scopeKey, tabPath, detail.patch.textContent);
        }
      }
    };
    window.addEventListener(UPDATE_FILE_PREVIEW_EVENT, applyPreviewUpdate);
    return () =>
      window.removeEventListener(UPDATE_FILE_PREVIEW_EVENT, applyPreviewUpdate);
  }, [scopeKey, setTabContent]);

  useEffect(() => {
    hydratedTabs.current.clear();
  }, [scopeKey]);

  useEffect(() => {
    if (!chatId && projectDirOverride) {
      setActivity("files");
    }
  }, [chatId, projectDirOverride]);

  const promptWorkspaceSavePath = useCallback(
    (defaultPath: string) =>
      new Promise<string | null>((resolve) => {
        let draft = defaultPath;
        Modal.confirm({
          title: t("files.saveToWorkspace"),
          content: (
            <Input
              defaultValue={defaultPath}
              placeholder={t("files.savePathPlaceholder")}
              onChange={(event) => {
                draft = event.target.value;
              }}
            />
          ),
          okText: t("common.save"),
          cancelText: t("common.cancel"),
          onOk: () => {
            const path = sanitizeWorkspaceSavePath(draft);
            if (!path) {
              message.error(t("files.invalidSavePath"));
              return Promise.reject();
            }
            resolve(path);
          },
          onCancel: () => resolve(null),
        });
      }),
    [t],
  );

  const saveGeneratedArtifact = useCallback(
    async (tabPath: string, content: string) => {
      const tab = tabsRef.current.find((item) => item.path === tabPath);
      const suggested =
        tab?.displayPath?.split("/").pop() ||
        tabPath.split("::").pop() ||
        "note.md";
      const dest = await promptWorkspaceSavePath(suggested);
      if (!dest) return;

      const saved = await workspaceApi.saveFileContent(
        dest,
        content,
        undefined,
        chatId,
        "project",
        projectDirOverride,
      );
      closeTab(scopeKey, tabPath);
      targetsByTab.current.delete(tabPath);
      const existing = tabsRef.current.find((item) => item.path === dest);
      if (existing) {
        setTabContent(scopeKey, dest, content);
        setTabEtag(scopeKey, dest, saved.etag);
      } else {
        openTab(scopeKey, {
          path: dest,
          displayPath: dest,
          content,
          dirty: false,
          source: "workspace",
          workspaceRoot: "project",
          previewKind: inferPreviewKind(dest),
          readOnly: false,
          etag: saved.etag,
        });
      }
      targetsByTab.current.set(dest, {
        source: "workspace",
        path: dest,
        root: "project",
      });
      setActiveTab(scopeKey, dest);
      setDirectoryRevision((current) => current + 1);
      message.success(t("files.savedToWorkspace", { path: dest }));
    },
    [
      chatId,
      closeTab,
      openTab,
      projectDirOverride,
      promptWorkspaceSavePath,
      scopeKey,
      setActiveTab,
      setTabContent,
      setTabEtag,
      t,
    ],
  );

  useEffect(() => {
    tabs.forEach((tab) => {
      if (
        tab.content ||
        tab.dirty ||
        hydratedTabs.current.has(tab.path) ||
        isInlineGeneratedTab(tab)
      ) {
        return;
      }
      hydratedTabs.current.add(tab.path);
      void loadTabContent(tab.path)
        .then((content) => setTabContent(scopeKey, tab.path, content))
        .catch(() => {
          closeTab(scopeKey, tab.path);
          setLoadError(t("files.loadFailed"));
        });
    });
  }, [closeTab, loadTabContent, scopeKey, setTabContent, t, tabs]);

  useEffect(() => {
    if (initialTarget) void openTarget(initialTarget);
  }, [initialTarget, openTarget]);

  const handleClose = (path: string) => {
    const remaining = tabsRef.current.filter((tab) => tab.path !== path);
    tabsRef.current = remaining;
    closeTab(scopeKey, path);
    if (remaining.length === 0) {
      onClose?.();
      return;
    }
    if (activeTabPath === path) {
      setActiveTab(scopeKey, remaining[0]?.path ?? "");
    }
  };

  const handleCloseOthers = (path: string) => {
    tabs.forEach((tab) => {
      if (tab.path !== path) closeTab(scopeKey, tab.path);
    });
    setActiveTab(scopeKey, path);
  };

  return (
    <div
      className={`${styles.workspace} ${
        tabs.length === 0 && !memoryGraphRoot ? styles.workspaceEmpty : ""
      }`}
    >
      {!compact && codingMode && (
        <nav className={styles.activityRail} aria-label={t("files.workspace")}>
          <button
            type="button"
            className={activity === "files" ? styles.activityActive : ""}
            aria-label={t("files.navigator")}
            onClick={() => setActivity("files")}
          >
            <Files size={18} />
          </button>
          {chatId || !projectDirOverride ? (
            <button
              type="button"
              className={activity === "git" ? styles.activityActive : ""}
              aria-label={t("files.sourceControl")}
              onClick={() => setActivity("git")}
            >
              <GitBranch size={18} />
            </button>
          ) : null}
        </nav>
      )}
      {!compact && (activity === "files" || !codingMode) ? (
        <FilesNavigator
          key={`${scopeKey}:${projectDirOverride ?? ""}:${directoryRevision}`}
          scope={effectiveScope}
          selectedPath={
            tabs.find((tab) => tab.path === activeTabPath)?.displayPath ??
            activeTabPath
          }
          onSelect={(target) => {
            setMemoryGraphRoot(null);
            void openTarget(target);
          }}
          activeMemoryGraphRoot={memoryGraphRoot}
          onShowMemoryGraph={(root) => setMemoryGraphRoot(root)}
          onShowFiles={() => setMemoryGraphRoot(null)}
        />
      ) : !compact ? (
        <aside className={styles.sourcePanel}>
          <header>
            <GitBranch size={15} />
            <span>{t("files.sourceControl")}</span>
          </header>
          <GitPanel chatId={chatId} />
        </aside>
      ) : null}
      <main className={styles.documentSurface}>
        {loadError && (
          <div className={styles.loadError} role="alert">
            <FileWarning size={24} />
            <span>{loadError}</span>
          </div>
        )}
        {memoryGraphRoot ? (
          <MemoryGraphView
            agentId={scope.agentId}
            root={memoryGraphRoot}
            onOpenFile={(source, path) => {
              setMemoryGraphRoot(null);
              void openTarget({ source, path });
            }}
          />
        ) : (
          <TabbedEditor
            key={`${scopeKey}:${directoryRevision}`}
            tabs={tabs}
            activeTabPath={activeTabPath}
            scopeKey={scopeKey}
            onTabSelect={(path) => setActiveTab(scopeKey, path)}
            onTabClose={handleClose}
            onCloseOtherTabs={handleCloseOthers}
            onTabDirtyChange={(path, dirty) =>
              setTabDirty(scopeKey, path, dirty)
            }
            onTabContentChange={(path, content) =>
              setTabContent(scopeKey, path, content)
            }
            headerActions={
              <>
                {compact && onExpand ? (
                  <button
                    type="button"
                    className={styles.workspaceChromeButton}
                    aria-label={t("files.expandWorkspace")}
                    title={t("files.expandWorkspace")}
                    onClick={onExpand}
                  >
                    <Expand size={14} />
                  </button>
                ) : onCollapse ? (
                  <button
                    type="button"
                    className={styles.workspaceChromeButton}
                    aria-label={t("files.backToPreview")}
                    title={t("files.backToPreview")}
                    onClick={onCollapse}
                  >
                    <ArrowLeft size={14} />
                  </button>
                ) : null}
                {onClose && (
                  <button
                    type="button"
                    className={styles.workspaceChromeButton}
                    aria-label={t("common.close")}
                    title={t("common.close")}
                    onClick={onClose}
                  >
                    <X size={15} />
                  </button>
                )}
              </>
            }
            onLoadFile={loadTabContent}
            chatId={chatId}
            projectDirOverride={projectDirOverride}
            navigation={editorNavigation}
            onDownloadFile={async (path) => {
              const tab = tabsRef.current.find((item) => item.path === path);
              const sourcePath = tab?.displayPath ?? stripEditorTabPath(path);
              const filename = sourcePath.split("/").pop() ?? sourcePath;
              if (tab?.artifactUrl) {
                await downloadFileFromUrl(tab.artifactUrl, filename, {
                  headers: buildWorkspaceScopeHeaders({
                    agentId: scope.agentId,
                    chatId,
                    projectDirOverride,
                  }),
                  errorMessage: t("files.downloadFailed"),
                });
                return;
              }
              if ((tab?.source ?? "workspace") === "workspace") {
                await downloadFileFromUrl(
                  workspaceApi.getFileDownloadUrl(
                    sourcePath,
                    tab?.workspaceRoot,
                  ),
                  filename,
                  {
                    headers: buildWorkspaceScopeHeaders({
                      agentId: scope.agentId,
                      chatId,
                      projectDirOverride,
                    }),
                    errorMessage: t("files.downloadFailed"),
                  },
                );
                return;
              }
              const blob = new Blob([tab?.content ?? ""], {
                type: "text/plain;charset=utf-8",
              });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = filename;
              anchor.click();
              URL.revokeObjectURL(url);
            }}
            onRevealFile={async (path) => {
              const tab = tabsRef.current.find((item) => item.path === path);
              const target = revealTargetFromEditorTab(tab, path);
              if (!target) {
                message.warning(
                  t("workspace.revealUnavailable", "无法定位该文件的磁盘位置"),
                );
                return;
              }
              try {
                await revealWorkspacePath({
                  path: target.path,
                  root: target.root,
                  chatId,
                  projectDirOverride,
                });
              } catch {
                message.error(
                  t("workspace.revealFailed", "无法在文件管理器中打开"),
                );
              }
            }}
            onSaveFile={async (path, content) => {
              const tab = tabsRef.current.find((item) => item.path === path);
              if (isInlineGeneratedTab(tab)) {
                try {
                  await saveGeneratedArtifact(path, content);
                } catch {
                  message.error(t("files.saveFailed"));
                }
                return;
              }
              const separator = path.indexOf("::");
              if ((tab?.source ?? "workspace") === "workspace") {
                const saved = await workspaceApi.saveFileContent(
                  tab?.displayPath ?? path,
                  content,
                  tab?.etag,
                  chatId,
                  tab?.workspaceRoot,
                  projectDirOverride,
                );
                setTabEtag(scopeKey, path, saved.etag);
                return;
              }
              const source = path.slice(0, separator);
              const sourcePath = path.slice(separator + 2);
              if (source === "profile") {
                await workspaceApi.saveFile(sourcePath, content);
              } else if (source === "daily" || source === "digest") {
                await workspaceApi.saveMemoryFile(sourcePath, content, source);
              } else if (source === "memory") {
                await workspaceApi.saveDailyMemory(sourcePath, content);
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
