/**
 * workspaceSdk.test.ts — 工作区插件 SDK 接口测试
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createWorkspaceNamespace,
  openArtifactFromToolCall,
} from "../workspaceSdk";
import { rendererRegistry } from "../store/rendererRegistry";
import { useWorkspaceStore } from "../store/workspaceStore";
import type { WorkspaceArtifact } from "../types";
import { useAgentStore } from "../../../stores/agentStore";
import {
  OPEN_FILE_PREVIEW_EVENT,
  UPDATE_FILE_PREVIEW_EVENT,
  type OpenFilePreviewDetail,
  type UpdateFilePreviewDetail,
} from "../../../features/files-workspace/openFilePreview";

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
  useAgentStore.setState({ selectedAgent: "default" });
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
    const opened: OpenFilePreviewDetail[] = [];
    const handleOpen = (event: Event) => {
      opened.push((event as CustomEvent<OpenFilePreviewDetail>).detail);
    };

    beforeEach(() => {
      opened.length = 0;
      window.addEventListener(OPEN_FILE_PREVIEW_EVENT, handleOpen);
    });

    afterEach(() => {
      window.removeEventListener(OPEN_FILE_PREVIEW_EVENT, handleOpen);
    });

    it("opens an artifact through the file preview chain", () => {
      const artifact = makeArtifact({
        id: "sdk-1",
        title: "SDK Test",
        extension: "md",
      });
      sdk.openArtifact(artifact);

      expect(opened).toHaveLength(1);
      expect(opened[0]?.target).toMatchObject({
        source: "artifact",
        path: "SDK Test.md",
      });
      expect(useWorkspaceStore.getState().tabs).toHaveLength(0);
      expect(useWorkspaceStore.getState().panelOpen).toBe(false);
    });
  });

  describe("closeTab", () => {
    it("closes a tab via SDK", () => {
      const artifact = makeArtifact({ id: "sdk-2" });
      useWorkspaceStore.getState().openArtifact(artifact);
      expect(useWorkspaceStore.getState().tabs).toHaveLength(1);

      sdk.closeTab("sdk-2");
      expect(useWorkspaceStore.getState().tabs).toHaveLength(0);
    });
  });

  describe("updateArtifact", () => {
    it("updates the file preview instead of the unused workspace store", () => {
      const updates: UpdateFilePreviewDetail[] = [];
      const handleUpdate = (event: Event) => {
        updates.push(
          (event as CustomEvent<UpdateFilePreviewDetail>).detail,
        );
      };
      window.addEventListener(UPDATE_FILE_PREVIEW_EVENT, handleUpdate);
      try {
        sdk.updateArtifact("sdk-3", { textContent: "updated" });
        expect(updates).toEqual([
          { id: "sdk-3", patch: { textContent: "updated" } },
        ]);
        expect(useWorkspaceStore.getState().getArtifact("sdk-3")).toBeUndefined();
      } finally {
        window.removeEventListener(UPDATE_FILE_PREVIEW_EVENT, handleUpdate);
      }
    });
  });

  describe("getActiveArtifact", () => {
    it("returns the active artifact via SDK", () => {
      const artifact = makeArtifact({ id: "sdk-4", title: "Active" });
      useWorkspaceStore.getState().openArtifact(artifact);

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

  describe("openArtifactFromToolCall", () => {
    it("uses Agent, session, message, and tool identity in Artifact IDs", () => {
      useAgentStore.setState({ selectedAgent: "agent-a" });
      const first = openArtifactFromToolCall({
        toolName: "write_file",
        result: {},
        sessionId: "session-1",
        messageId: "message-1",
      });
      useAgentStore.setState({ selectedAgent: "agent-b" });
      const second = openArtifactFromToolCall({
        toolName: "write_file",
        result: {},
        sessionId: "session-1",
        messageId: "message-1",
      });

      expect(first).not.toBe(second);
      expect(first).toContain("agent-a:session-1");
      expect(second).toContain("agent-b:session-1");
    });
  });
});
