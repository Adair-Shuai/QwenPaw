import {
  ArrowLeft,
  FileWarning,
  Files,
  GitBranch,
  PackageCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildAuthHeaders } from "../../api/authHeaders";
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
  type EditorTab,
  type PendingDiff,
} from "../../stores/codingTabsStore";
import { useCodingMode } from "../../stores/codingModeStore";
import { downloadFileFromUrl } from "../../utils/downloadFileFromUrl";
import FilesNavigator from "./FilesNavigator";
import ArtifactsWorkspace from "./ArtifactsWorkspace";
import { useSessionDeliverables } from "./useSessionDeliverables";
import MemoryGraphView from "./MemoryGraphView";
import WorkspaceArtifactSaveDialog from "./WorkspaceArtifactSaveDialog";
import { isInlineGeneratedTab } from "./workspaceSavePath";
import { withDefaultFileView } from "./fileOpenModes";
import {
  UPDATE_FILE_PREVIEW_EVENT,
  type UpdateFilePreviewDetail,
} from "./openFilePreview";
import MemoryTagsNavigator from "./MemoryTagsNavigator";
import { useMemoryFileConfig } from "./useMemoryTagSupport";
import { fileTabPath, fileTabTarget, findOpenFileTab } from "./fileIdentity";
import { projectRootPath, workspaceRoots } from "./directorySources";
import {
  filesWorkspaceScopeKey,
  type FilesWorkspaceScope,
} from "./filesWorkspaceScope";
import { toProjectRelativePath } from "./internalFileLinks";
import {
  revealTargetFromEditorTab,
  revealWorkspacePath,
} from "./workspaceReveal";
import type {
  FileMetadata,
  FileTarget,
  MemoryGraphRoot,
  WorkspaceRoot,
} from "./types";
import styles from "./FilesWorkspace.module.less";

interface FilesWorkspaceProps {
  initialTarget?: FileTarget;
  initialMemoryTag?: string;
  scope: FilesWorkspaceScope;
  hideNavigator?: boolean;
  active?: boolean;
  onActiveTargetChange?: (target: FileTarget | undefined) => void;
  onBrowseMemoryTag?: () => void;
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
    /\.(?:md|mdx|txt|log|json|ya?ml|toml|xml|html?|css|less|scss|js|jsx|ts|tsx|py|java|go|rs|sh)$/i.test(
      path,
    ) ||
    !path.split("/").pop()?.includes(".")
  ) {
    return "text";
  }
  return "binary";
}

function loadedFileSize(file: {
  size?: number;
  content: string;
  previewKind: FileMetadata["preview_kind"];
}): number | undefined {
  return (
    file.size ??
    (file.previewKind === "text" || file.previewKind === "csv"
      ? new Blob([file.content]).size
      : undefined)
  );
}

export default function FilesWorkspace({
  initialTarget,
  initialMemoryTag,
  scope,
  hideNavigator = false,
  active = true,
  onActiveTargetChange,
  onBrowseMemoryTag,
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
  const { config: memoryConfig, getConfig: getMemoryConfig } =
    useMemoryFileConfig(agentId);
  const memoryTagsSupported = memoryConfig !== null;
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
  const activeTab = tabs.find((tab) => tab.path === activeTabPath);
  const activeTarget = activeTab ? fileTabTarget(activeTab) : undefined;
  const {
    clearProjectTabs,
    closeTab,
    openTab,
    refreshTab,
    setActiveTab,
    setTabContent,
    setTabDirty,
    setTabEtag,
  } = useCodingTabsStore();
  const hydratedTabs = useRef(new Set<string>());
  const revalidatedScope = useRef("");
  const revalidationSequence = useRef(new Map<string, number>());
  const mountedRef = useRef(false);
  const scopeKeyRef = useRef(scopeKey);
  scopeKeyRef.current = scopeKey;
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const targetsByTab = useRef(new Map<string, FileTarget>());
  useEffect(() => {
    const update = (event: Event) => {
      const detail = (event as CustomEvent<UpdateFilePreviewDetail>).detail;
      if (!detail?.id || !detail.patch) return;
      const { patch } = detail;
      const matchingTabs = (
        useCodingTabsStore.getState().tabsByAgent[scopeKey] ?? []
      ).filter(
        (tab) => tab.source === "artifact" && tab.artifact?.id === detail.id,
      );
      if (matchingTabs.length === 0) return;
      if (
        (patch.agentId && patch.agentId !== agentId) ||
        (patch.chatId && patch.chatId !== chatId) ||
        (patch.sessionId &&
          patch.sessionId !== sessionId &&
          !matchingTabs.some(
            (tab) => tab.artifact?.sessionId === patch.sessionId,
          ))
      )
        return;
      // Once an artifact streams an update, its current tab is the source of
      // truth. Drop the initial open-target snapshot rather than copying state.
      for (const [path, target] of targetsByTab.current) {
        if (target.artifact?.id === detail.id)
          targetsByTab.current.delete(path);
      }
      useCodingTabsStore
        .getState()
        .updateArtifactTabs(scopeKey, detail.id, patch);
    };
    window.addEventListener(UPDATE_FILE_PREVIEW_EVENT, update);
    return () => window.removeEventListener(UPDATE_FILE_PREVIEW_EVENT, update);
  }, [agentId, chatId, scopeKey, sessionId]);
  useEffect(() => {
    const tab = tabs.find((item) => item.path === activeTabPath);
    onActiveTargetChange?.(
      tab
        ? {
            ...(targetsByTab.current.get(tab.path) ?? {
              source: tab.source ?? "workspace",
              path: tab.displayPath ?? tab.path,
              root: tab.workspaceRoot,
              artifactUrl: tab.artifactUrl,
              artifact: tab.artifact,
            }),
            size: tab.size,
          }
        : undefined,
    );
  }, [activeTabPath, tabs, onActiveTargetChange]);
  const navigationSequence = useRef(0);
  const openTargetSequence = useRef(0);
  const [loadError, setLoadError] = useState("");
  const [memoryGraphRoot, setMemoryGraphRoot] =
    useState<MemoryGraphRoot | null>(null);
  const [activity, setActivity] = useState<"files" | "git" | "deliverables">(
    "files",
  );
  const deliverables = useSessionDeliverables(
    scope.kind === "session" ? scope : undefined,
    active && !hideNavigator && activity === "deliverables",
  );
  const [memoryTagsActive, setMemoryTagsActive] = useState(false);
  const [selectedMemoryTag, setSelectedMemoryTag] = useState<string | null>(
    null,
  );
  const [memoryTagsRevision, setMemoryTagsRevision] = useState(0);
  const [mobilePane, setMobilePane] = useState<
    "navigator" | "source" | "document"
  >(tabs.length > 0 ? "document" : "navigator");
  const [directoryRevision, setDirectoryRevision] = useState(0);
  const [savedFileRevision, setSavedFileRevision] = useState(0);
  const [artifactSave, setArtifactSave] = useState<{
    scopeKey: string;
    path: string;
    root: WorkspaceRoot;
    content: string;
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);
  const artifactSaveRef = useRef(artifactSave);
  artifactSaveRef.current = artifactSave;
  const [editorNavigation, setEditorNavigation] = useState<{
    path: string;
    line: number;
    endLine: number;
    column?: number;
    sequence: number;
  } | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setArtifactSave(null);
    return () => {
      artifactSaveRef.current?.reject(new Error("Workspace scope closed"));
      artifactSaveRef.current = null;
    };
  }, [scopeKey, projectDirOverride]);

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
      if (target.artifact?.textContent !== undefined) {
        return {
          content: target.artifact.textContent,
          previewKind: "text" as const,
          readOnly: true,
          etag: "",
          size: new Blob([target.artifact.textContent]).size,
        };
      }
      if (target.source === "profile") {
        return {
          content: (await workspaceApi.loadFile(target.path, agentId)).content,
          previewKind: "text" as const,
          readOnly: false,
          etag: "",
          size: undefined,
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
          size: undefined,
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
          size: metadata.size,
        };
      }
      if (!target.artifactUrl) {
        throw new Error(`Missing artifact URL for ${target.source}`);
      }
      const response = await fetch(target.artifactUrl, {
        headers: buildAuthHeaders(),
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
        size: response.headers.has("Content-Length")
          ? Number(response.headers.get("Content-Length"))
          : undefined,
      };
    },
    [agentId, chatId, projectDirOverride],
  );

  const loadTab = useCallback(
    async (tabPath: string) => {
      const tab = tabsRef.current.find((item) => item.path === tabPath);
      const target =
        targetsByTab.current.get(tabPath) ??
        fileTabTarget(tab ?? { path: tabPath, content: "", dirty: false });
      return loadTarget(target);
    },
    [loadTarget],
  );

  const getLiveTab = useCallback(
    (tabPath: string) =>
      useCodingTabsStore
        .getState()
        .tabsByAgent[scopeKey]?.find((item) => item.path === tabPath),
    [scopeKey],
  );

  const isTabSnapshotCurrent = useCallback(
    (
      tabPath: string,
      snapshot: EditorTab | undefined,
      diffSnapshot: PendingDiff | undefined,
    ) => {
      if (!mountedRef.current || !snapshot) return false;
      const currentTab = getLiveTab(tabPath);
      const currentDiff =
        useCodingTabsStore.getState().diffsByAgent[scopeKey]?.[tabPath];
      // Diffs can change independently, including individual hunk decisions.
      return (
        scopeKeyRef.current === scopeKey &&
        currentTab === snapshot &&
        !currentTab.dirty &&
        currentDiff === diffSnapshot
      );
    },
    [getLiveTab, scopeKey],
  );

  const loadTabContent = useCallback(
    async (tabPath: string) => {
      const snapshot = getLiveTab(tabPath);
      const diffSnapshot =
        useCodingTabsStore.getState().diffsByAgent[scopeKey]?.[tabPath];
      const loaded = await loadTab(tabPath);
      if (!isTabSnapshotCurrent(tabPath, snapshot, diffSnapshot)) {
        throw new Error("File state changed while loading");
      }
      refreshTab(
        scopeKey,
        tabPath,
        loaded.content,
        loaded.etag,
        loadedFileSize(loaded),
      );
      return loaded.content;
    },
    [getLiveTab, isTabSnapshotCurrent, loadTab, refreshTab, scopeKey],
  );

  const revalidateTab = useCallback(
    async (tabPath: string) => {
      const tab = getLiveTab(tabPath);
      const diffSnapshot =
        useCodingTabsStore.getState().diffsByAgent[scopeKey]?.[tabPath];
      const previewKind =
        tab?.previewKind ??
        inferPreviewKind(tab?.displayPath ?? tab?.path ?? tabPath);
      if (
        !tab ||
        tab.dirty ||
        (previewKind !== "text" && previewKind !== "csv")
      ) {
        return;
      }

      const sequence = (revalidationSequence.current.get(tabPath) ?? 0) + 1;
      revalidationSequence.current.set(tabPath, sequence);
      try {
        const loaded = await loadTab(tabPath);
        if (
          scopeKeyRef.current !== scopeKey ||
          revalidationSequence.current.get(tabPath) !== sequence ||
          !isTabSnapshotCurrent(tabPath, tab, diffSnapshot)
        ) {
          return;
        }
        refreshTab(
          scopeKey,
          tabPath,
          loaded.content,
          loaded.etag,
          loadedFileSize(loaded),
        );
      } catch {
        if (
          mountedRef.current &&
          scopeKeyRef.current === scopeKey &&
          revalidationSequence.current.get(tabPath) === sequence &&
          isTabSnapshotCurrent(tabPath, tab, diffSnapshot)
        ) {
          setLoadError(t("files.loadFailed"));
        }
      }
    },
    [getLiveTab, isTabSnapshotCurrent, loadTab, refreshTab, scopeKey, t],
  );

  const activateTab = useCallback(
    (tabPath: string) => {
      // Selecting an existing tab also supersedes a file still being loaded.
      openTargetSequence.current += 1;
      revalidatedScope.current = scopeKey;
      setLoadError("");
      setActiveTab(scopeKey, tabPath);
      setMobilePane("document");
      void revalidateTab(tabPath);
    },
    [revalidateTab, scopeKey, setActiveTab],
  );

  const openTarget = useCallback(
    async (target: FileTarget) => {
      const requestSequence = ++openTargetSequence.current;
      try {
        const resolvedTarget = withDefaultFileView(
          await resolveEditableTarget(target),
        );
        const canAlias =
          resolvedTarget.source === "daily" ||
          resolvedTarget.source === "digest" ||
          resolvedTarget.source === "memory" ||
          (resolvedTarget.source === "workspace" &&
            resolvedTarget.root === "workspace");
        let memory = null;
        try {
          memory =
            canAlias && tabsRef.current.length ? await getMemoryConfig() : null;
        } catch (error) {
          // Exact identities remain usable offline. Without one, retry later
          // rather than opening a second buffer for a potentially dirty alias.
          if (!findOpenFileTab(tabsRef.current, resolvedTarget, null))
            throw error;
        }
        if (
          !mountedRef.current ||
          scopeKeyRef.current !== scopeKey ||
          requestSequence !== openTargetSequence.current
        )
          return;
        const existing = findOpenFileTab(
          tabsRef.current,
          resolvedTarget,
          memory,
        );
        const tabPath = existing?.path ?? fileTabPath(resolvedTarget);
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
        if (existing) {
          if (existing.source === "artifact" && existing.artifact)
            targetsByTab.current.delete(tabPath);
          activateTab(tabPath);
          return;
        }
        targetsByTab.current.set(tabPath, resolvedTarget);
        const loaded = await loadTarget(resolvedTarget);
        if (
          !mountedRef.current ||
          scopeKeyRef.current !== scopeKey ||
          requestSequence !== openTargetSequence.current
        )
          return;
        setLoadError("");
        openTab(scopeKey, {
          path: tabPath,
          displayPath: resolvedTarget.path,
          content: loaded.content,
          dirty: false,
          source: resolvedTarget.source,
          workspaceRoot: resolvedTarget.root,
          artifactUrl: resolvedTarget.artifactUrl,
          artifact: resolvedTarget.artifact,
          preferredView: resolvedTarget.preferredView,
          size: loadedFileSize(loaded),
          previewKind: loaded.previewKind,
          readOnly: loaded.readOnly,
          etag: loaded.etag,
        });
        revalidatedScope.current = scopeKey;
        setActiveTab(scopeKey, tabPath);
        setMobilePane("document");
      } catch (error) {
        if (
          mountedRef.current &&
          scopeKeyRef.current === scopeKey &&
          requestSequence === openTargetSequence.current &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          setLoadError(t("files.loadFailed"));
        }
      }
    },
    [
      activateTab,
      getMemoryConfig,
      loadTarget,
      openTab,
      resolveEditableTarget,
      scopeKey,
      setActiveTab,
      t,
    ],
  );

  useEffect(() => {
    hydratedTabs.current.clear();
    revalidationSequence.current.clear();
    setMemoryTagsActive(false);
    setSelectedMemoryTag(null);
  }, [scopeKey]);

  const showMemoryTag = useCallback(
    (tag: string) => {
      onBrowseMemoryTag?.();
      setActivity("files");
      setMemoryTagsActive(true);
      setSelectedMemoryTag(tag);
      setMobilePane("navigator");
    },
    [onBrowseMemoryTag],
  );

  useEffect(() => {
    if (!chatId && projectDirOverride) {
      setActivity("files");
    }
  }, [chatId, projectDirOverride]);

  useEffect(() => {
    tabs.forEach((tab) => {
      if (tab.content || tab.dirty || hydratedTabs.current.has(tab.path)) {
        return;
      }
      hydratedTabs.current.add(tab.path);
      const diffSnapshot =
        useCodingTabsStore.getState().diffsByAgent[scopeKey]?.[tab.path];
      void loadTab(tab.path)
        .then((loaded) => {
          if (!isTabSnapshotCurrent(tab.path, tab, diffSnapshot)) return;
          refreshTab(
            scopeKey,
            tab.path,
            loaded.content,
            loaded.etag,
            loadedFileSize(loaded),
          );
        })
        .catch(() => {
          if (!isTabSnapshotCurrent(tab.path, tab, diffSnapshot)) return;
          closeTab(scopeKey, tab.path);
          setLoadError(t("files.loadFailed"));
        });
    });
  }, [closeTab, isTabSnapshotCurrent, loadTab, refreshTab, scopeKey, t, tabs]);

  useEffect(() => {
    let cancelled = false;
    if (initialTarget) {
      void openTarget(initialTarget).then(() => {
        if (!cancelled && initialMemoryTag) setMobilePane("navigator");
      });
    }
    return () => {
      cancelled = true;
    };
  }, [initialTarget, initialMemoryTag, openTarget]);

  useEffect(() => {
    if (initialMemoryTag && memoryTagsSupported)
      showMemoryTag(initialMemoryTag);
  }, [initialMemoryTag, memoryTagsSupported, scopeKey, showMemoryTag]);

  useEffect(() => {
    if (!activeTabPath || revalidatedScope.current === scopeKey) return;
    revalidatedScope.current = scopeKey;
    const activeTab = tabsRef.current.find((tab) => tab.path === activeTabPath);
    // Empty restored tabs are already handled by the hydration effect above.
    if (activeTab?.content) void revalidateTab(activeTabPath);
  }, [activeTabPath, revalidateTab, scopeKey]);

  useEffect(() => {
    if (tabs.length === 0 && !memoryGraphRoot) {
      setMobilePane(activity === "git" && codingMode ? "source" : "navigator");
    }
  }, [activity, codingMode, memoryGraphRoot, tabs.length]);

  const handleClose = (path: string) => {
    const index = tabs.findIndex((tab) => tab.path === path);
    closeTab(scopeKey, path);
    if (tabs.length === 1 && !memoryGraphRoot) {
      setMobilePane(activity === "git" && codingMode ? "source" : "navigator");
    }
    if (activeTabPath === path) {
      const nextPath = tabs[index + 1]?.path ?? tabs[index - 1]?.path ?? "";
      if (nextPath) activateTab(nextPath);
      else setActiveTab(scopeKey, "");
    }
  };

  const handleCloseOthers = (path: string) => {
    tabs.forEach((tab) => {
      if (tab.path !== path) closeTab(scopeKey, tab.path);
    });
    activateTab(path);
  };

  const hasDocument = tabs.length > 0 || memoryGraphRoot !== null;

  return (
    <div
      className={styles.workspace}
      data-mobile-pane={hideNavigator ? "document" : mobilePane}
    >
      {(codingMode || scope.kind === "session") && !hideNavigator && (
        <nav className={styles.activityRail} aria-label={t("files.workspace")}>
          <button
            type="button"
            className={activity === "files" ? styles.activityActive : ""}
            aria-label={t("files.navigator")}
            onClick={() => {
              setActivity("files");
              setMobilePane("navigator");
            }}
          >
            <Files size={18} />
          </button>
          {scope.kind === "session" && (
            <button
              type="button"
              className={
                activity === "deliverables" ? styles.activityActive : ""
              }
              aria-label={t("files.deliverables", "会话成果")}
              aria-pressed={activity === "deliverables"}
              onClick={() => {
                setActivity("deliverables");
                setMobilePane("navigator");
              }}
            >
              <PackageCheck size={18} />
            </button>
          )}
          {codingMode && (chatId || !projectDirOverride) ? (
            <button
              type="button"
              className={activity === "git" ? styles.activityActive : ""}
              aria-label={t("files.sourceControl")}
              onClick={() => {
                setActivity("git");
                setMobilePane("source");
              }}
            >
              <GitBranch size={18} />
            </button>
          ) : null}
        </nav>
      )}
      {!hideNavigator &&
        (activity === "deliverables" && scope.kind === "session" ? (
          <div className={styles.navigatorPane}>
            {hasDocument && (
              <button
                type="button"
                className={styles.mobilePaneSwitch}
                aria-label={t("files.openFilesLabel")}
                onClick={() => setMobilePane("document")}
              >
                <Files size={16} />
                <span>{t("files.openFilesLabel")}</span>
              </button>
            )}
            <ArtifactsWorkspace
              scope={scope}
              persistedArtifacts={deliverables.artifacts}
              loading={deliverables.loading}
              error={
                deliverables.error
                  ? deliverables.moreError
                    ? t(
                        "files.deliverablesMoreFailed",
                        "历史成果加载失败，请重试。",
                      )
                    : t(
                        "files.deliverablesLoadFailed",
                        "成果加载失败，请刷新重试。",
                      )
                  : undefined
              }
              onRefresh={deliverables.refresh}
              hasMore={deliverables.hasMore}
              loadingMore={deliverables.loadingMore}
              moreError={deliverables.moreError}
              onLoadMore={deliverables.loadMore}
              target={(() => {
                const tab = tabs.find((item) => item.path === activeTabPath);
                return tab
                  ? targetsByTab.current.get(tab.path) ?? {
                      source: tab.source ?? "workspace",
                      path: tab.displayPath ?? tab.path,
                      root: tab.workspaceRoot,
                      artifactUrl: tab.artifactUrl,
                      artifact: tab.artifact,
                    }
                  : undefined;
              })()}
              onSelect={(target) => {
                setMemoryGraphRoot(null);
                void openTarget(target);
              }}
            />
          </div>
        ) : activity === "files" || !codingMode ? (
          <div className={styles.navigatorPane}>
            {hasDocument && (
              <button
                type="button"
                className={styles.mobilePaneSwitch}
                aria-label={t("files.openFilesLabel")}
                onClick={() => setMobilePane("document")}
              >
                <Files size={16} />
                <span>{t("files.openFilesLabel")}</span>
              </button>
            )}
            <FilesNavigator
              key={`${scopeKey}:${
                projectDirOverride ?? ""
              }:${directoryRevision}:${savedFileRevision}`}
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
              onShowMemoryGraph={(root) => {
                setMemoryGraphRoot(root);
                setMobilePane("document");
              }}
              onShowFiles={() => {
                setMemoryTagsActive(false);
                setMemoryGraphRoot(null);
              }}
              memoryTagsActive={memoryTagsSupported && memoryTagsActive}
              onShowMemoryTags={() => setMemoryTagsActive(true)}
              memoryTagsPanel={
                memoryTagsSupported ? (
                  <MemoryTagsNavigator
                    key={`${scopeKey}:${selectedMemoryTag ?? ""}`}
                    agentId={agentId}
                    tag={selectedMemoryTag}
                    revision={memoryTagsRevision}
                    memoryConfig={memoryConfig}
                    selectedPath={activeTarget?.path ?? ""}
                    selectedSource={activeTarget?.source}
                    selectedRoot={activeTarget?.root}
                    onSelectTag={setSelectedMemoryTag}
                    onOpenFile={(target) => {
                      setMemoryGraphRoot(null);
                      void openTarget(target);
                    }}
                  />
                ) : undefined
              }
            />
          </div>
        ) : (
          <aside className={styles.sourcePanel}>
            {hasDocument && (
              <button
                type="button"
                className={styles.mobilePaneSwitch}
                aria-label={t("files.openFilesLabel")}
                onClick={() => setMobilePane("document")}
              >
                <ArrowLeft size={16} />
                <span>{t("files.openFilesLabel")}</span>
              </button>
            )}
            <header>
              <GitBranch size={15} />
              <span>{t("files.sourceControl")}</span>
            </header>
            <GitPanel chatId={chatId} />
          </aside>
        ))}
      <main className={styles.documentSurface}>
        {!hideNavigator && (
          <button
            type="button"
            className={styles.mobilePaneSwitch}
            aria-label={t(
              activity === "git"
                ? "files.sourceControl"
                : activity === "deliverables"
                ? "files.deliverables"
                : "files.navigator",
            )}
            onClick={() =>
              setMobilePane(activity === "git" ? "source" : "navigator")
            }
          >
            {activity === "git" ? (
              <GitBranch size={16} />
            ) : activity === "deliverables" ? (
              <PackageCheck size={16} />
            ) : (
              <Files size={16} />
            )}
            <span>
              {t(
                activity === "git"
                  ? "files.sourceControl"
                  : activity === "deliverables"
                  ? "files.deliverables"
                  : "files.navigator",
              )}
            </span>
          </button>
        )}
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
            previewActive={active}
            previewManagedUpdates
            activeTabPath={activeTabPath}
            scopeKey={scopeKey}
            onTabSelect={activateTab}
            onTabClose={handleClose}
            onCloseOtherTabs={handleCloseOthers}
            onTabDirtyChange={(path, dirty) =>
              setTabDirty(scopeKey, path, dirty)
            }
            onTabContentChange={(path, content) =>
              setTabContent(scopeKey, path, content)
            }
            onLoadFile={loadTabContent}
            chatId={chatId}
            projectDirOverride={projectDirOverride}
            navigation={editorNavigation}
            onRevealFile={async (path) => {
              const tab = tabsRef.current.find((item) => item.path === path);
              const target = revealTargetFromEditorTab(tab, path);
              if (target)
                await revealWorkspacePath({
                  ...target,
                  chatId,
                  projectDirOverride,
                });
            }}
            onMemoryTagClick={memoryTagsSupported ? showMemoryTag : undefined}
            onFileSaved={() => setMemoryTagsRevision((value) => value + 1)}
            onDownloadFile={async (path) => {
              const tab = tabsRef.current.find((item) => item.path === path);
              const target = fileTabTarget(
                tab ?? { path, content: "", dirty: false },
              );
              const sourcePath = target.path;
              const filename = sourcePath.split("/").pop() ?? sourcePath;
              if (tab?.artifactUrl) {
                await downloadFileFromUrl(tab.artifactUrl, filename, {
                  headers: buildAuthHeaders(),
                  errorMessage: t("files.downloadFailed"),
                });
                return;
              }
              if (target.source === "workspace") {
                await downloadFileFromUrl(
                  workspaceApi.getFileDownloadUrl(sourcePath, target.root),
                  filename,
                  {
                    headers: {
                      ...buildAuthHeaders(),
                      ...(chatId ? { "X-Chat-Id": chatId } : {}),
                      ...(!chatId && projectDirOverride
                        ? {
                            "X-Session-Project-Dir": projectDirOverride,
                          }
                        : {}),
                    },
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
            onSaveFile={async (path, content) => {
              const tab = tabsRef.current.find((item) => item.path === path);
              if (isInlineGeneratedTab(tab)) {
                if (artifactSaveRef.current) {
                  throw new Error("An artifact save is already open");
                }
                return new Promise<void>((resolve, reject) => {
                  const request = {
                    scopeKey,
                    path: tab?.displayPath ?? "reply.md",
                    root: tab?.workspaceRoot ?? ("project" as const),
                    content,
                    resolve,
                    reject,
                  };
                  artifactSaveRef.current = request;
                  setArtifactSave(request);
                });
              }
              const target = fileTabTarget(
                tab ?? { path, content, dirty: true },
              );
              if (target.source === "workspace") {
                const saved = await workspaceApi.saveFileContent(
                  target.path,
                  content,
                  tab?.etag,
                  chatId,
                  target.root,
                  projectDirOverride,
                );
                setTabEtag(scopeKey, path, saved.etag);
                return;
              }
              const { source, path: sourcePath } = target;
              if (source === "profile") {
                await workspaceApi.saveFile(sourcePath, content, agentId);
              } else if (source === "daily" || source === "digest") {
                await workspaceApi.saveMemoryFile(sourcePath, content, source);
              } else if (source === "memory") {
                await workspaceApi.saveDailyMemory(sourcePath, content);
              } else {
                throw new Error("This file cannot be saved in place");
              }
            }}
          />
        )}
      </main>
      {artifactSave && artifactSave.scopeKey === scopeKey && (
        <WorkspaceArtifactSaveDialog
          suggestedPath={artifactSave.path}
          onCancel={() => {
            artifactSave.reject(new Error("Save cancelled"));
            artifactSaveRef.current = null;
            setArtifactSave(null);
          }}
          onSave={async (path) => {
            const request = artifactSave;
            const navigation = openTargetSequence.current;
            const separator = path.lastIndexOf("/");
            const result = await workspaceApi.uploadFiles(
              [
                new File([request.content], path.slice(separator + 1), {
                  type: "text/plain;charset=utf-8",
                }),
              ],
              separator < 0 ? "" : path.slice(0, separator),
              "rename",
              chatId,
              request.root,
              projectDirOverride,
            );
            const saved = result.files.find(
              (file) => file.status === "uploaded",
            );
            if (!saved) throw new Error("No file was saved");
            if (
              !mountedRef.current ||
              scopeKeyRef.current !== request.scopeKey ||
              artifactSaveRef.current !== request
            )
              return;
            artifactSaveRef.current = null;
            setArtifactSave(null);
            setSavedFileRevision((revision) => revision + 1);
            request.resolve();
            // A later file selection wins over a slow save finishing.
            if (openTargetSequence.current === navigation) {
              await openTarget({
                source: "workspace",
                path: saved.path,
                root: request.root,
              });
            }
          }}
        />
      )}
    </div>
  );
}
