import { beforeEach, describe, expect, it } from "vitest";
import { useWorkbenchTabsStore, type WorkbenchTab } from "./workbenchTabsStore";

const scope = "session:default:pending";
const file: WorkbenchTab = {
  id: "file:workspace-root::report.md",
  kind: "files",
  title: "report.md",
  filePath: "workspace-root::report.md",
  target: { source: "workspace", root: "workspace", path: "report.md" },
};

describe("workbench content references", () => {
  beforeEach(() => useWorkbenchTabsStore.setState({ scopes: {} }));

  it("keeps tool selection when native file references hydrate and change", () => {
    const store = useWorkbenchTabsStore.getState();
    store.open(scope, {
      id: "compute:default",
      kind: "compute",
      title: "计算轨道",
    });
    store.syncFiles(scope, [file], file.filePath!);
    expect(useWorkbenchTabsStore.getState().scopes[scope].activeId).toBe(
      "compute:default",
    );
    expect(useWorkbenchTabsStore.getState().scopes[scope].tabs).toEqual([
      expect.objectContaining({ kind: "compute" }),
      file,
    ]);
    const previous = useWorkbenchTabsStore.getState();
    store.syncFiles(
      scope,
      [{ ...file, target: { ...file.target! } }],
      file.filePath!,
    );
    expect(useWorkbenchTabsStore.getState()).toBe(previous);
  });

  it("protects browser drafts, history and inactive tabs from late start-page replacements", () => {
    const store = useWorkbenchTabsStore.getState();
    const blank: WorkbenchTab = {
      id: "browser:blank",
      kind: "browser",
      title: "New tab",
      browser: { pages: [], index: -1, input: "" },
    };
    for (const browser of [
      { pages: [], index: -1, input: "unfinished address" },
      {
        pages: [{ kind: "url" as const, url: "https://example.com/" }],
        index: 0,
        input: "",
      },
    ]) {
      store.open(scope, { ...blank, browser });
      const before = useWorkbenchTabsStore.getState();
      expect(store.replaceStartTab(scope, blank.id, file)).toBe(false);
      expect(useWorkbenchTabsStore.getState()).toBe(before);
    }
    store.open(scope, blank);
    store.open(scope, file);
    const before = useWorkbenchTabsStore.getState();
    expect(store.replaceStartTab(scope, blank.id, file)).toBe(false);
    expect(store.replaceStartTab("other", blank.id, file)).toBe(false);
    expect(useWorkbenchTabsStore.getState()).toBe(before);
  });

  it("merges duplicate split destinations without leaving stale pane or recent references", () => {
    const store = useWorkbenchTabsStore.getState();
    const blank: WorkbenchTab = {
      id: "browser:blank",
      kind: "browser",
      title: "New tab",
      browser: { pages: [], index: -1, input: "" },
    };
    store.open(scope, file);
    store.open(scope, blank);
    store.split(scope, blank.id, "vertical");
    expect(store.replaceStartTab(scope, blank.id, file)).toBe(true);
    expect(useWorkbenchTabsStore.getState().scopes[scope]).toMatchObject({
      tabs: [file],
      activeId: file.id,
      secondaryId: undefined,
      recent: [],
    });
    store.close(scope, [file.id]);
    store.open(scope, blank);
    expect(store.replaceStartTab(scope, blank.id, file)).toBe(true);
    expect(useWorkbenchTabsStore.getState().scopes[scope]).toMatchObject({
      tabs: [file],
      activeId: file.id,
      recent: [],
    });
  });

  it("closes adjacent views and retains exact scoped identities in recent content", () => {
    const store = useWorkbenchTabsStore.getState();
    store.open(scope, file);
    store.open(scope, {
      id: "simulation:run-a",
      kind: "simulation",
      title: "A",
      runId: "run-a",
    });
    store.open(scope, {
      id: "simulation:run-b",
      kind: "simulation",
      title: "B",
      runId: "run-b",
    });
    store.close(scope, ["simulation:run-b"]);
    expect(useWorkbenchTabsStore.getState().scopes[scope].activeId).toBe(
      "simulation:run-a",
    );
    store.close(scope, ["simulation:run-a", file.id]);
    const empty = useWorkbenchTabsStore.getState().scopes[scope];
    expect(empty.tabs).toEqual([]);
    expect(empty.activeId).toBe("");
    expect(empty.recent.find((item) => item.kind === "files")).toEqual(file);
    store.open(
      scope,
      empty.recent.find((item) => item.id === "simulation:run-b")!,
    );
    expect(useWorkbenchTabsStore.getState().scopes[scope].tabs[0].runId).toBe(
      "run-b",
    );
    expect(useWorkbenchTabsStore.getState().scopes[scope].recent).toHaveLength(
      2,
    );
  });

  it("migrates pending scopes explicitly and removes deleted conversation content", () => {
    const store = useWorkbenchTabsStore.getState();
    const destination = "session:default:saved";
    store.open(scope, file);
    store.open(scope, {
      id: "interactions:request-a",
      kind: "interactions",
      title: "请求",
      requestId: "request-a",
    });
    store.open(destination, {
      id: "compute:default",
      kind: "compute",
      title: "计算轨道",
    });
    store.migrateScope(scope, destination);
    const migrated = useWorkbenchTabsStore.getState();
    expect(migrated.scopes[scope]).toBeUndefined();
    expect(migrated.scopes[destination].tabs).toHaveLength(3);
    expect(migrated.scopes[destination].activeId).toBe("compute:default");
    expect(migrated.scopes["session:other:saved"]).toBeUndefined();
    store.removeScope(destination);
    expect(useWorkbenchTabsStore.getState().scopes).toEqual({});
  });

  it("clears rebound project resources from open and recent tabs while preserving workspace files and remote browser drafts", () => {
    const store = useWorkbenchTabsStore.getState();
    store.open(scope, file);
    store.open(scope, {
      ...file,
      id: "file:report.md",
      filePath: "report.md",
      target: { source: "workspace", root: "project", path: "report.md" },
    });
    store.close(scope, ["file:report.md"]);
    store.open(scope, {
      id: "genui:project",
      kind: "genui",
      title: "Project model",
      target: { source: "workspace", root: "project:/old", path: "model.vtu" },
    });
    store.open(scope, {
      id: "browser:remote",
      kind: "browser",
      title: "Remote",
      browser: {
        pages: [
          { kind: "file", tabPath: "report.md" },
          { kind: "url", url: "https://example.com/" },
          { kind: "file", tabPath: file.filePath! },
        ],
        index: 1,
        input: "remote address draft",
      },
    });
    store.clearProjectTabs(scope);
    const current = useWorkbenchTabsStore.getState().scopes[scope];
    expect(current.tabs.map((tab) => tab.id)).toEqual([
      file.id,
      "browser:remote",
    ]);
    expect(current.recent).toEqual([]);
    expect(current.tabs[1].browser).toEqual({
      pages: [
        { kind: "url", url: "https://example.com/" },
        { kind: "file", tabPath: file.filePath! },
      ],
      index: 0,
      input: "remote address draft",
    });
    expect(current.tabs[1].browserRevision).toBe(1);
  });
});

it("isolates split layouts and promotes or merges panes without stale references on close and rebind", () => {
  useWorkbenchTabsStore.setState({ scopes: {} });
  const store = useWorkbenchTabsStore.getState();
  store.open("split", {
    id: "file",
    kind: "files",
    filePath: "x",
    title: "x",
    target: { source: "workspace", path: "x", root: "project" },
  });
  store.open("split", { id: "browser", kind: "browser", title: "web" });
  store.split("split", "file", "vertical", true);
  expect(useWorkbenchTabsStore.getState().scopes.split).toMatchObject({
    activeId: "browser",
    secondaryId: "file",
    splitAxis: "vertical",
    splitBefore: true,
  });
  store.select("split", "file");
  expect(useWorkbenchTabsStore.getState().scopes.split).toMatchObject({
    activeId: "file",
    secondaryId: "browser",
  });
  store.migrateScope("split", "saved");
  expect(useWorkbenchTabsStore.getState().scopes.saved.secondaryId).toBe(
    "browser",
  );
  store.clearProjectTabs("saved");
  expect(
    useWorkbenchTabsStore.getState().scopes.saved.secondaryId,
  ).toBeUndefined();
  expect(
    useWorkbenchTabsStore.getState().scopes.saved.tabs.map((tab) => tab.id),
  ).toEqual(["browser"]);
});
