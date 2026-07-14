/**
 * workspaceStore.test.ts — 工作区标签页状态管理测试
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useWorkspaceStore } from "../workspaceStore";
import type { WorkspaceArtifact } from "../../types";

beforeEach(() => {
  // Reset store to clean state
  useWorkspaceStore.setState({
    artifacts: {},
    tabsBySession: {},
    currentSessionId: "default",
    tabs: [],
    activeTabId: null,
    panelOpen: false,
    panelWidth: 480,
    isFullscreen: false,
  });
});

function makeArtifact(
  overrides: Partial<WorkspaceArtifact> = {},
): WorkspaceArtifact {
  return {
    id: `artifact-${Date.now()}-${Math.random()}`,
    title: "Test Artifact",
    source: "tool_call",
    mimeType: "text/markdown",
    textContent: "# Hello",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("WorkspaceStore.openArtifact", () => {
  it("opens an artifact and activates its tab", () => {
    const artifact = makeArtifact({ id: "a1", title: "Doc 1" });
    useWorkspaceStore.getState().openArtifact(artifact);

    const state = useWorkspaceStore.getState();
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0].artifactId).toBe("a1");
    expect(state.tabs[0].title).toBe("Doc 1");
    expect(state.activeTabId).toBe("a1");
    expect(state.panelOpen).toBe(true);
    expect(state.artifacts["a1"]).toBe(artifact);
  });

  it("opens multiple artifacts as separate tabs", () => {
    const a1 = makeArtifact({ id: "a1", title: "Doc 1" });
    const a2 = makeArtifact({ id: "a2", title: "Doc 2" });
    const a3 = makeArtifact({ id: "a3", title: "Doc 3" });

    useWorkspaceStore.getState().openArtifact(a1);
    useWorkspaceStore.getState().openArtifact(a2);
    useWorkspaceStore.getState().openArtifact(a3);

    const state = useWorkspaceStore.getState();
    expect(state.tabs).toHaveLength(3);
    expect(state.activeTabId).toBe("a3");
  });

  it("does not duplicate tab when opening same artifact", () => {
    const a1 = makeArtifact({ id: "a1", title: "Doc 1" });
    useWorkspaceStore.getState().openArtifact(a1);
    useWorkspaceStore.getState().openArtifact(a1);

    const state = useWorkspaceStore.getState();
    expect(state.tabs).toHaveLength(1);
  });
});

describe("WorkspaceStore.closeTab", () => {
  it("closes a tab and switches to the last remaining tab", () => {
    const a1 = makeArtifact({ id: "a1", title: "Doc 1" });
    const a2 = makeArtifact({ id: "a2", title: "Doc 2" });
    useWorkspaceStore.getState().openArtifact(a1);
    useWorkspaceStore.getState().openArtifact(a2);

    // Close the active tab (a2)
    useWorkspaceStore.getState().closeTab("a2");

    const state = useWorkspaceStore.getState();
    expect(state.tabs).toHaveLength(1);
    expect(state.activeTabId).toBe("a1");
  });

  it("closes the last tab and closes panel", () => {
    const a1 = makeArtifact({ id: "a1", title: "Doc 1" });
    useWorkspaceStore.getState().openArtifact(a1);

    useWorkspaceStore.getState().closeTab("a1");

    const state = useWorkspaceStore.getState();
    expect(state.tabs).toHaveLength(0);
    expect(state.activeTabId).toBeNull();
    expect(state.panelOpen).toBe(false);
  });
});

describe("WorkspaceStore.setActiveTab", () => {
  it("switches active tab", () => {
    const a1 = makeArtifact({ id: "a1", title: "Doc 1" });
    const a2 = makeArtifact({ id: "a2", title: "Doc 2" });
    useWorkspaceStore.getState().openArtifact(a1);
    useWorkspaceStore.getState().openArtifact(a2);

    useWorkspaceStore.getState().setActiveTab("a1");
    expect(useWorkspaceStore.getState().activeTabId).toBe("a1");

    useWorkspaceStore.getState().setActiveTab("a2");
    expect(useWorkspaceStore.getState().activeTabId).toBe("a2");
  });
});

describe("WorkspaceStore.updateArtifact", () => {
  it("updates artifact content", () => {
    const a1 = makeArtifact({ id: "a1", textContent: "original" });
    useWorkspaceStore.getState().openArtifact(a1);

    useWorkspaceStore.getState().updateArtifact("a1", {
      textContent: "updated",
      isStreaming: false,
    });

    const artifact = useWorkspaceStore.getState().getArtifact("a1");
    expect(artifact?.textContent).toBe("updated");
    expect(artifact?.isStreaming).toBe(false);
  });

  it("updates tab title when artifact title changes", () => {
    const a1 = makeArtifact({ id: "a1", title: "Original Title" });
    useWorkspaceStore.getState().openArtifact(a1);

    useWorkspaceStore.getState().updateArtifact("a1", {
      title: "New Title",
    });

    const tab = useWorkspaceStore
      .getState()
      .tabs.find((t) => t.artifactId === "a1");
    expect(tab?.title).toBe("New Title");
  });

  it("is a no-op for non-existent artifact", () => {
    const stateBefore = useWorkspaceStore.getState();
    useWorkspaceStore.getState().updateArtifact("nonexistent", {
      textContent: "test",
    });
    expect(useWorkspaceStore.getState()).toBe(stateBefore);
  });
});

describe("WorkspaceStore.closeOtherTabs", () => {
  it("keeps only the specified tab", () => {
    const a1 = makeArtifact({ id: "a1", title: "Doc 1" });
    const a2 = makeArtifact({ id: "a2", title: "Doc 2" });
    const a3 = makeArtifact({ id: "a3", title: "Doc 3" });
    useWorkspaceStore.getState().openArtifact(a1);
    useWorkspaceStore.getState().openArtifact(a2);
    useWorkspaceStore.getState().openArtifact(a3);

    useWorkspaceStore.getState().closeOtherTabs("a2");

    const state = useWorkspaceStore.getState();
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0].artifactId).toBe("a2");
    expect(state.activeTabId).toBe("a2");
  });
});

describe("WorkspaceStore.closeAllTabs", () => {
  it("removes all tabs and closes panel", () => {
    useWorkspaceStore.getState().openArtifact(makeArtifact({ id: "a1" }));
    useWorkspaceStore.getState().openArtifact(makeArtifact({ id: "a2" }));

    useWorkspaceStore.getState().closeAllTabs();

    const state = useWorkspaceStore.getState();
    expect(state.tabs).toHaveLength(0);
    expect(state.activeTabId).toBeNull();
    expect(state.panelOpen).toBe(false);
  });
});

describe("WorkspaceStore.panel operations", () => {
  it("togglePanel toggles panel open state", () => {
    expect(useWorkspaceStore.getState().panelOpen).toBe(false);
    useWorkspaceStore.getState().togglePanel();
    expect(useWorkspaceStore.getState().panelOpen).toBe(true);
    useWorkspaceStore.getState().togglePanel();
    expect(useWorkspaceStore.getState().panelOpen).toBe(false);
  });

  it("setPanelWidth clamps to min/max", () => {
    useWorkspaceStore.getState().setPanelWidth(100);
    expect(useWorkspaceStore.getState().panelWidth).toBe(320); // MIN

    useWorkspaceStore.getState().setPanelWidth(9999);
    expect(useWorkspaceStore.getState().panelWidth).toBe(800); // MAX

    useWorkspaceStore.getState().setPanelWidth(500);
    expect(useWorkspaceStore.getState().panelWidth).toBe(500);
  });

  it("toggleFullscreen toggles fullscreen state", () => {
    expect(useWorkspaceStore.getState().isFullscreen).toBe(false);
    useWorkspaceStore.getState().toggleFullscreen();
    expect(useWorkspaceStore.getState().isFullscreen).toBe(true);
  });
});

describe("WorkspaceStore.pin/unpin", () => {
  it("pins and unpins a tab", () => {
    const a1 = makeArtifact({ id: "a1" });
    useWorkspaceStore.getState().openArtifact(a1);

    useWorkspaceStore.getState().pinTab("a1");
    expect(
      useWorkspaceStore.getState().tabs.find((t) => t.artifactId === "a1")
        ?.pinned,
    ).toBe(true);

    useWorkspaceStore.getState().unpinTab("a1");
    expect(
      useWorkspaceStore.getState().tabs.find((t) => t.artifactId === "a1")
        ?.pinned,
    ).toBe(false);
  });
});

describe("WorkspaceStore.renameTab", () => {
  it("renames a tab", () => {
    const a1 = makeArtifact({ id: "a1", title: "Original" });
    useWorkspaceStore.getState().openArtifact(a1);

    useWorkspaceStore.getState().renameTab("a1", "Renamed");
    expect(
      useWorkspaceStore.getState().tabs.find((t) => t.artifactId === "a1")
        ?.title,
    ).toBe("Renamed");
  });
});

describe("WorkspaceStore.getActiveArtifact", () => {
  it("returns the active artifact", () => {
    const a1 = makeArtifact({ id: "a1", title: "Active" });
    useWorkspaceStore.getState().openArtifact(a1);

    const active = useWorkspaceStore.getState().getActiveArtifact();
    expect(active?.id).toBe("a1");
  });

  it("returns undefined when no active tab", () => {
    expect(useWorkspaceStore.getState().getActiveArtifact()).toBeUndefined();
  });
});
