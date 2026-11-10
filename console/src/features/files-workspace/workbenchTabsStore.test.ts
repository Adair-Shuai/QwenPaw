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
