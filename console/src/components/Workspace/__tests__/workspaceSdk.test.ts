/**
 * workspaceSdk.test.ts — 工作区插件 SDK 接口测试
 */
import { describe, it, expect, beforeEach } from "vitest";
import { createWorkspaceNamespace } from "../workspaceSdk";
import { rendererRegistry } from "../store/rendererRegistry";
import { useWorkspaceStore } from "../store/workspaceStore";
import type { WorkspaceArtifact } from "../types";

beforeEach(() => {
  rendererRegistry.__resetForTests();
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
    id: `artifact-${Math.random()}`,
    title: "Test",
    source: "tool_call",
    mimeType: "text/markdown",
    textContent: "# Test",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("Workspace SDK", () => {
  const sdk = createWorkspaceNamespace();

  describe("registerRenderer", () => {
    it("registers a renderer visible in listRenderers", () => {
      const d = sdk.registerRenderer({
        id: "custom",
        name: "Custom Renderer",
        component: () => null,
        mimeTypes: ["application/x-custom"],
        extensions: ["custom"],
      });

      const list = sdk.listRenderers();
      expect(list.find((r) => r.id === "custom")).toBeDefined();
      expect(list.find((r) => r.id === "custom")?.name).toBe("Custom Renderer");

      d.dispose();
      expect(
        sdk.listRenderers().find((r) => r.id === "custom"),
      ).toBeUndefined();
    });

    it("hasRenderer returns true for registered MIME type", () => {
      sdk.registerRenderer({
        id: "test",
        name: "Test",
        component: () => null,
        mimeTypes: ["application/x-test"],
      });
      expect(sdk.hasRenderer("application/x-test")).toBe(true);
      expect(sdk.hasRenderer("unknown/type")).toBe(false);
    });
  });

  describe("openArtifact", () => {
    it("opens an artifact in the workspace store", () => {
      const artifact = makeArtifact({ id: "sdk-1", title: "SDK Test" });
      sdk.openArtifact(artifact);

      const state = useWorkspaceStore.getState();
      expect(state.tabs).toHaveLength(1);
      expect(state.activeTabId).toBe("sdk-1");
      expect(state.panelOpen).toBe(true);
    });
  });

  describe("closeTab", () => {
    it("closes a tab via SDK", () => {
      const artifact = makeArtifact({ id: "sdk-2" });
      sdk.openArtifact(artifact);
      expect(useWorkspaceStore.getState().tabs).toHaveLength(1);

      sdk.closeTab("sdk-2");
      expect(useWorkspaceStore.getState().tabs).toHaveLength(0);
    });
  });

  describe("updateArtifact", () => {
    it("updates artifact content via SDK", () => {
      const artifact = makeArtifact({ id: "sdk-3", textContent: "original" });
      sdk.openArtifact(artifact);

      sdk.updateArtifact("sdk-3", { textContent: "updated" });
      expect(
        useWorkspaceStore.getState().getArtifact("sdk-3")?.textContent,
      ).toBe("updated");
    });
  });

  describe("getActiveArtifact", () => {
    it("returns the active artifact via SDK", () => {
      const artifact = makeArtifact({ id: "sdk-4", title: "Active" });
      sdk.openArtifact(artifact);

      expect(sdk.getActiveArtifact()?.id).toBe("sdk-4");
    });
  });

  describe("togglePanel / setPanelOpen", () => {
    it("toggles panel via SDK", () => {
      sdk.togglePanel();
      expect(useWorkspaceStore.getState().panelOpen).toBe(true);
      sdk.togglePanel();
      expect(useWorkspaceStore.getState().panelOpen).toBe(false);
    });

    it("sets panel open state via SDK", () => {
      sdk.setPanelOpen(true);
      expect(useWorkspaceStore.getState().panelOpen).toBe(true);
      sdk.setPanelOpen(false);
      expect(useWorkspaceStore.getState().panelOpen).toBe(false);
    });
  });
});
