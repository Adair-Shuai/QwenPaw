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
}

interface WorkspaceTabs {
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
  open: (scope: string, tab: WorkbenchTab, focus?: boolean) => void;
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
  open: (scope, tab, focus = true) =>
    set((state) => {
      const current = state.scopes[scope] ?? EMPTY_WORKBENCH;
      const exists = current.tabs.some((item) => item.id === tab.id);
      return {
        scopes: {
          ...state.scopes,
          [scope]: {
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
        scopes: { ...state.scopes, [scope]: { ...current, activeId: id } },
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
            tabs,
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
      scopes[to] = {
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
