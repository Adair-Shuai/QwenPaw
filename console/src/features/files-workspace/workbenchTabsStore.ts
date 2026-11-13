import { create } from "zustand";
import type { FileTarget, MemoryGraphRoot, WorkbenchMode } from "./types";
import { fileTabTarget } from "./fileIdentity";
import { isProjectRoot } from "./directorySources";

export type BrowserPage =
  | { kind: "url"; url: string }
  | { kind: "file"; tabPath: string };
export interface BrowserSession {
  pages: BrowserPage[];
  index: number;
  input: string;
}

/** References only. File buffers and pending diffs remain in codingTabsStore. */
export interface WorkbenchTab {
  id: string;
  kind: WorkbenchMode | "graph";
  title: string;
  filePath?: string;
  target?: FileTarget;
  graphRoot?: MemoryGraphRoot;
  runId?: string;
  requestId?: string;
  taskId?: string;
  browser?: BrowserSession;
  browserRevision?: number;
  reviewState?: { offset: number; turnId: string };
  terminalTarget?: { id: string; nonce: string };
}

interface WorkspaceTabs {
  secondaryId?: string;
  splitAxis?: "horizontal" | "vertical";
  splitBefore?: boolean;
  tabs: WorkbenchTab[];
  activeId: string;
  recent: WorkbenchTab[];
}
export const EMPTY_WORKBENCH: WorkspaceTabs = {
  tabs: [],
  activeId: "",
  recent: [],
};

interface WorkbenchTabsState {
  scopes: Record<string, WorkspaceTabs>;
  split: (
    scope: string,
    id: string,
    axis: "horizontal" | "vertical",
    before?: boolean,
  ) => void;
  merge: (scope: string) => void;
  open: (scope: string, tab: WorkbenchTab, focus?: boolean) => void;
  replaceStartTab: (scope: string, id: string, tab: WorkbenchTab) => boolean;
  select: (scope: string, id: string) => void;
  update: (scope: string, id: string, patch: Partial<WorkbenchTab>) => void;
  close: (scope: string, ids: string[]) => void;
  syncFiles: (scope: string, files: WorkbenchTab[], activePath: string) => void;
  migrateScope: (from: string, to: string) => void;
  removeScope: (scope: string) => void;
  clearProjectTabs: (scope: string) => void;
}

function withoutProjectContent(tab: WorkbenchTab): WorkbenchTab | undefined {
  if (tab.target?.source === "workspace" && isProjectRoot(tab.target.root))
    return undefined;
  if (!tab.browser) return tab;
  const browser = tab.browser;
  const current = browser.pages[browser.index];
  const pages = browser.pages.filter((page) => {
    if (page.kind !== "file") return true;
    const target = fileTabTarget({
      path: page.tabPath,
      content: "",
      dirty: false,
    });
    return target.source !== "workspace" || !isProjectRoot(target.root);
  });
  if (pages.length === browser.pages.length) return tab;
  if (!pages.length) return undefined;
  const index = pages.includes(current)
    ? pages.indexOf(current)
    : Math.min(browser.index, pages.length - 1);
  const page = pages[index];
  return {
    ...tab,
    browserRevision: (tab.browserRevision ?? 0) + 1,
    browser: {
      pages,
      index,
      input:
        page === current
          ? browser.input
          : page.kind === "url"
          ? page.url
          : page.tabPath,
    },
  };
}

export const useWorkbenchTabsStore = create<WorkbenchTabsState>((set) => ({
  scopes: {},
  split: (scope, id, axis, before = false) =>
    set((state) => {
      const current = state.scopes[scope];
      if (
        !current ||
        current.tabs.length < 2 ||
        !current.tabs.some((tab) => tab.id === id)
      )
        return state;
      const activeId =
        current.activeId === id
          ? current.tabs.find((tab) => tab.id !== id)!.id
          : current.activeId;
      return {
        scopes: {
          ...state.scopes,
          [scope]: {
            ...current,
            activeId,
            secondaryId: id,
            splitAxis: axis,
            splitBefore: before,
          },
        },
      };
    }),
  merge: (scope) =>
    set((state) => {
      const current = state.scopes[scope];
      return current
        ? {
            scopes: {
              ...state.scopes,
              [scope]: { ...current, secondaryId: undefined },
            },
          }
        : state;
    }),
  replaceStartTab: (scope, id, tab) => {
    let replaced = false;
    set((state) => {
      const current = state.scopes[scope];
      const source = current?.tabs.find((item) => item.id === id);
      // Only the originating empty page is disposable. Keep address drafts,
      // navigation history and pages the user has since switched away from.
      if (
        !current ||
        source?.kind !== "browser" ||
        source.browser?.pages.length ||
        source.browser?.input ||
        (current.activeId !== id && current.secondaryId !== id)
      )
        return state;
      const existing = current.tabs.find((item) => item.id === tab.id);
      const replacement = { ...existing, ...tab };
      const activeId = current.activeId === id ? tab.id : current.activeId;
      const secondaryId =
        current.secondaryId === id ? tab.id : current.secondaryId;
      replaced = true;
      return {
        scopes: {
          ...state.scopes,
          [scope]: {
            ...current,
            tabs: current.tabs.flatMap((item) =>
              item.id === id ? [replacement] : item.id === tab.id ? [] : [item],
            ),
            activeId,
            secondaryId: secondaryId === activeId ? undefined : secondaryId,
            recent: current.recent.filter((item) => item.id !== tab.id),
          },
        },
      };
    });
    return replaced;
  },
  open: (scope, tab, focus = true) =>
    set((state) => {
      const current = state.scopes[scope] ?? EMPTY_WORKBENCH;
      const exists = current.tabs.some((item) => item.id === tab.id);
      return {
        scopes: {
          ...state.scopes,
          [scope]: {
            ...current,
            secondaryId:
              focus && tab.id === current.secondaryId
                ? current.activeId
                : current.secondaryId,
            tabs: exists
              ? current.tabs.map((item) =>
                  item.id === tab.id ? { ...item, ...tab } : item,
                )
              : [...current.tabs, tab],
            activeId: focus ? tab.id : current.activeId,
            recent: current.recent.filter((item) => item.id !== tab.id),
          },
        },
      };
    }),
  select: (scope, id) =>
    set((state) => {
      const current = state.scopes[scope];
      if (!current?.tabs.some((item) => item.id === id)) return state;
      return {
        scopes: {
          ...state.scopes,
          [scope]: {
            ...current,
            activeId: id,
            secondaryId:
              id === current.secondaryId
                ? current.activeId
                : current.secondaryId,
          },
        },
      };
    }),
  update: (scope, id, patch) =>
    set((state) => {
      const current = state.scopes[scope];
      if (!current?.tabs.some((item) => item.id === id)) return state;
      return {
        scopes: {
          ...state.scopes,
          [scope]: {
            ...current,
            tabs: current.tabs.map((item) =>
              item.id === id
                ? { ...item, ...patch, id, kind: item.kind }
                : item,
            ),
          },
        },
      };
    }),
  close: (scope, ids) =>
    set((state) => {
      const current = state.scopes[scope];
      if (!current) return state;
      const removed = current.tabs.filter((item) => ids.includes(item.id));
      if (!removed.length) return state;
      const tabs = current.tabs.filter((item) => !ids.includes(item.id));
      const previousIndex = current.tabs.findIndex(
        (item) => item.id === current.activeId,
      );
      return {
        scopes: {
          ...state.scopes,
          [scope]: {
            ...current,
            tabs,
            secondaryId:
              ids.includes(current.secondaryId ?? "") ||
              (ids.includes(current.activeId) &&
                tabs[Math.min(previousIndex, tabs.length - 1)]?.id ===
                  current.secondaryId)
                ? undefined
                : current.secondaryId,
            activeId: ids.includes(current.activeId)
              ? tabs[Math.min(previousIndex, tabs.length - 1)]?.id ?? ""
              : current.activeId,
            recent: [
              ...removed.slice().reverse(),
              ...current.recent.filter((item) => !ids.includes(item.id)),
            ].slice(0, 8),
          },
        },
      };
    }),
  syncFiles: (scope, files, activePath) =>
    set((state) => {
      const existing = state.scopes[scope];
      const current = existing ?? EMPTY_WORKBENCH;
      const fileIds = new Set(files.map((item) => item.id));
      const tabs = current.tabs
        .filter((item) => item.kind !== "files" || fileIds.has(item.id))
        .map((item) => {
          const file = files.find((candidate) => candidate.id === item.id);
          if (!file) return item;
          if (
            item.title === file.title &&
            item.target?.source === file.target?.source &&
            item.target?.path === file.target?.path &&
            item.target?.root === file.target?.root &&
            item.target?.artifact === file.target?.artifact &&
            item.target?.artifactUrl === file.target?.artifactUrl
          )
            return item;
          return file;
        });
      tabs.push(
        ...files.filter((file) => !tabs.some((item) => item.id === file.id)),
      );
      const activeId = tabs.some((item) => item.id === current.activeId)
        ? current.activeId
        : tabs.find((item) => item.filePath === activePath)?.id ??
          tabs[0]?.id ??
          "";
      if (
        existing &&
        current.activeId === activeId &&
        (!current.secondaryId ||
          tabs.some((tab) => tab.id === current.secondaryId)) &&
        current.tabs.length === tabs.length &&
        current.tabs.every((tab, index) => tab === tabs[index])
      )
        return state;
      return {
        scopes: {
          ...state.scopes,
          [scope]: {
            ...current,
            tabs,
            secondaryId:
              tabs.some((tab) => tab.id === current.secondaryId) &&
              current.secondaryId !== activeId
                ? current.secondaryId
                : undefined,
            activeId,
            recent: current.recent.filter((item) => !fileIds.has(item.id)),
          },
        },
      };
    }),
  migrateScope: (from, to) =>
    set((state) => {
      if (from === to || !state.scopes[from]) return state;
      const source = state.scopes[from];
      const target = state.scopes[to] ?? EMPTY_WORKBENCH;
      const scopes = { ...state.scopes };
      delete scopes[from];
      const activeId = target.activeId || source.activeId;
      const secondaryId = target.secondaryId ?? source.secondaryId;
      scopes[to] = {
        secondaryId: secondaryId !== activeId ? secondaryId : undefined,
        splitAxis: target.secondaryId ? target.splitAxis : source.splitAxis,
        splitBefore: target.secondaryId
          ? target.splitBefore
          : source.splitBefore,
        tabs: [
          ...target.tabs,
          ...source.tabs.filter(
            (item) => !target.tabs.some((tab) => tab.id === item.id),
          ),
        ],
        activeId: target.activeId || source.activeId,
        recent: [...target.recent, ...source.recent]
          .filter(
            (item, index, items) =>
              items.findIndex((tab) => tab.id === item.id) === index &&
              !target.tabs.some((tab) => tab.id === item.id) &&
              !source.tabs.some((tab) => tab.id === item.id),
          )
          .slice(0, 8),
      };
      return { scopes };
    }),
  removeScope: (scope) =>
    set((state) => {
      const scopes = { ...state.scopes };
      delete scopes[scope];
      return { scopes };
    }),
  clearProjectTabs: (scope) =>
    set((state) => {
      const current = state.scopes[scope];
      if (!current) return state;
      const tabs = current.tabs
        .map(withoutProjectContent)
        .filter((tab): tab is WorkbenchTab => Boolean(tab));
      const recent = current.recent
        .map(withoutProjectContent)
        .filter((tab): tab is WorkbenchTab => Boolean(tab));
      return {
        scopes: {
          ...state.scopes,
          [scope]: {
            ...current,
            secondaryId:
              tabs.some((tab) => tab.id === current.secondaryId) &&
              tabs.some((tab) => tab.id === current.activeId)
                ? current.secondaryId
                : undefined,
            tabs,
            recent,
            activeId: tabs.some((tab) => tab.id === current.activeId)
              ? current.activeId
              : tabs[0]?.id ?? "",
          },
        },
      };
    }),
}));
