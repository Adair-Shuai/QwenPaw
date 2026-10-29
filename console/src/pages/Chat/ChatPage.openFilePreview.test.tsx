/**
 * File preview events open the chat page's preview drawer.
 *
 * ChatPage.test.tsx is excluded from vitest (worker crash / stale mocks).
 * This file covers the same user path with a thinner render surface.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { Children, isValidElement } from "react";
import ChatActionGroup from "./components/ChatActionGroup";
import { renderWithProviders } from "@/test/common_setup";
import { openFilePreview } from "@/features/files-workspace/openFilePreview";
import { useFilesSurfaceStore } from "@/stores/filesSurfaceStore";
import { chatExtensions } from "@/plugins/registry/chatExtensions";
import { toolCallsApi } from "@/api/modules/toolCalls";
import sessionApi from "./sessionApi";

const {
  mockListProviders,
  mockGetActiveModels,
  mockGetTranscriptionProviderType,
} = vi.hoisted(() => ({
  mockListProviders: vi.fn(),
  mockGetActiveModels: vi.fn(),
  mockGetTranscriptionProviderType: vi.fn(),
}));

vi.mock("../../hooks/useAppMessage", () => ({
  useAppMessage: () => ({
    message: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
  }),
}));

vi.mock("../../contexts/ApprovalContext", () => ({
  useApprovalContext: () => ({
    approvals: [] as any[],
    setApprovals: vi.fn(),
  }),
}));

vi.mock("../../plugins/PluginContext", () => ({
  usePlugins: () => ({
    plugins: [],
    registerPlugin: vi.fn(),
    toolRenderConfig: {},
  }),
  PluginContext: { Provider: ({ children }: any) => children },
}));

vi.mock("./components/ChatSessionInitializer", () => ({
  default: () => null,
}));
vi.mock("./components/ChatSessionDrawer", () => ({ default: () => null }));
vi.mock("./components/ChatHeaderTitle", () => ({ default: () => null }));
vi.mock("./ModelSelector", () => ({ default: () => null }));
vi.mock("../../features/files-workspace/FilesDrawer", () => ({
  default: () => null,
}));
vi.mock("../../components/Workspace", () => ({
  WorkspacePanel: () => null,
}));
vi.mock("../../features/project-directory/SessionProjectDirectory", () => ({
  default: () => null,
}));
vi.mock("./components/AgentMentionController", () => ({
  default: () => null,
}));
vi.mock("./components/ChatSenderTabsPanel", () => ({ default: () => null }));
vi.mock("./RichFileReferenceInput", () => ({
  RichFileReferenceInputProvider: ({ children }: any) => children,
}));

vi.mock("@agentscope-ai/chat", () => ({
  AgentScopeRuntimeMessageType: {
    MESSAGE: "message",
    REASONING: "reasoning",
    ERROR: "error",
    HEARTBEAT: "heartbeat",
    MCP_APPROVAL_REQUEST: "mcp_approval_request",
    TOOL_CALL: "tool_call",
    TOOL_CALL_OUTPUT: "tool_call_output",
    FUNCTION_CALL: "function_call",
    FUNCTION_CALL_OUTPUT: "function_call_output",
    PLUGIN_CALL: "plugin_call",
    PLUGIN_CALL_OUTPUT: "plugin_call_output",
    COMPONENT_CALL: "component_call",
    COMPONENT_CALL_OUTPUT: "component_call_output",
    MCP_CALL: "mcp_call",
    MCP_CALL_OUTPUT: "mcp_call_output",
  },
  AgentScopeRuntimeWebUI: vi.fn((props: any) => {
    const actions = Children.toArray(
      props.options.theme.rightHeader.props.children,
    ).filter(
      (child) => isValidElement(child) && child.type === ChatActionGroup,
    );
    return <div data-testid="chat-ui">{actions}</div>;
  }),
  useChatAnywhereSessionsState: vi.fn(() => ({
    sessions: [],
    currentSessionId: null,
    setCurrentSessionId: vi.fn(),
    setSessions: vi.fn(),
  })),
  useChatAnywhereSessions: vi.fn(() => ({ createSession: vi.fn() })),
  useChatAnywhereInput: vi.fn(() => ({
    setLoading: vi.fn(),
    getLoading: vi.fn(),
  })),
}));

vi.mock("@/api/modules/provider", () => ({
  providerApi: {
    listProviders: mockListProviders,
    getActiveModels: mockGetActiveModels,
  },
}));

vi.mock("@/api/modules/chat", () => ({
  chatApi: {
    uploadFile: vi.fn(),
    filePreviewUrl: vi.fn((f: string) => `/preview/${f}`),
    stopChat: vi.fn(),
  },
  sessionApi: {
    getRealIdForSession: vi.fn(() => null),
    setLastUserMessage: vi.fn(),
    getSessionList: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock("@/api/modules/agent", () => ({
  agentApi: {
    getTranscriptionProviderType: mockGetTranscriptionProviderType,
  },
  TranscriptionError: class TranscriptionError extends Error {},
}));

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    Modal: ({
      open,
      children,
    }: {
      open: boolean;
      children: React.ReactNode;
    }) => (open ? <div data-testid="modal">{children}</div> : null),
  };
});

vi.mock("@/api/config", () => ({
  getApiUrl: vi.fn((p: string) => `/api${p}`),
  getApiToken: vi.fn(() => ""),
}));

vi.mock("@/stores/agentStore", () => {
  const state = () => ({
    selectedAgent: "default",
    setSelectedAgent: vi.fn(),
    agents: [{ id: "default", backend: "qwenpaw" }],
    setLastChatId: vi.fn(),
    getLastChatId: vi.fn(),
    removeLastChatId: vi.fn(),
  });
  const useAgentStore = Object.assign(
    vi.fn(() => state()),
    {
      getState: state,
      setState: vi.fn(),
      subscribe: vi.fn(() => vi.fn()),
    },
  );
  return { useAgentStore };
});

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: vi.fn(() => ({ isDark: false })),
}));

vi.mock("./sessionApi", () => ({
  default: {
    bindToOwner: vi.fn(() => ({
      getSession: vi.fn(async (id: string) => ({ id, name: id, messages: [] })),
      getSessionList: vi.fn(async () => []),
      createSession: vi.fn(),
      updateSession: vi.fn(),
      removeSession: vi.fn(),
    })),
    onSessionIdResolved: null,
    onSessionRemoved: null,
    onSessionSelected: null,
    onSessionCreated: null,
    invalidateSessionCreation: vi.fn(),
    activateCreatedSession: vi.fn(),
    getRealIdForSession: vi.fn(() => null),
    getBackendSessionId: vi.fn(() => "test-session"),
    setLastUserMessage: vi.fn(),
    discardLastUserMessage: vi.fn(),
    setVisibleSession: vi.fn(),
    getSession: vi.fn(async (id: string) => ({ id, messages: [] })),
    getSessionIdentity: vi.fn((id) => ({
      sdkSessionId: id,
      chatId: id,
      sessionId: id,
    })),
    getRouteResolutionVersion: vi.fn(() => 0),
    clearRouteRemoval: vi.fn(),
    trackNavigatedSession: vi.fn(),
    isUnresolvedLocalSession: vi.fn(() => false),
    lastActiveChatId: null,
  },
}));

vi.mock("./OptionsPanel/defaultConfig", () => ({
  default: {
    theme: {
      leftHeader: {},
      bubbleList: { userMessageAnchors: { variant: "navigator" } },
    },
    api: {},
  },
  getDefaultConfig: vi.fn(() => ({
    theme: {
      leftHeader: {},
      bubbleList: { userMessageAnchors: { variant: "navigator" } },
    },
    welcome: {},
    sender: {},
  })),
}));

import ChatPage from "./index";

describe("ChatPage message Markdown action", () => {
  beforeEach(() => {
    chatExtensions.__resetForTests();
    mockListProviders.mockResolvedValue([]);
    mockGetActiveModels.mockResolvedValue({
      active_llm: { provider_id: "openai", model: "gpt-4" },
    });
    mockGetTranscriptionProviderType.mockResolvedValue({
      transcription_provider_type: "disabled",
    });
  });

  afterEach(() => {
    chatExtensions.__resetForTests();
    useFilesSurfaceStore.setState({ sessionDrawers: {} });
    vi.clearAllMocks();
  });

  it("opens a preview drawer when a file preview event arrives", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    act(() => {
      openFilePreview({
        source: "artifact",
        path: "reply.md",
        artifact: {
          id: "reply",
          title: "reply.md",
          source: "generated",
          textContent: "hello from reply",
          mimeType: "text/markdown",
          extension: "md",
        },
      });
    });

    expect(
      Object.values(useFilesSurfaceStore.getState().sessionDrawers),
    ).toContainEqual(
      expect.objectContaining({
        kind: "preview",
        target: expect.objectContaining({
          source: "artifact",
          path: "reply.md",
          artifact: expect.objectContaining({
            textContent: "hello from reply",
          }),
        }),
      }),
    );
  });

  it("UGSci workspace: the real header opens, expands and closes the current session panel", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    const open = await screen.findByRole("button", {
      name: /^(打开工作区|Open Workspace|files.openWorkspace)$/i,
    });
    expect(open.querySelector(".lucide-layout-grid")).toBeInTheDocument();
    fireEvent.click(open);
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).toMatchObject({ kind: "workspace" });
    const opened =
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"];
    expect(opened.kind !== "closed" && opened.trigger === open).toBe(true);
    fireEvent.click(
      screen.getByRole("button", {
        name: /^(关闭工作区|Close Workspace|files.closeWorkspace)$/i,
      }),
    );
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).toEqual({ kind: "closed" });
    const target = { source: "workspace" as const, path: "picked.txt" };
    act(() => openFilePreview(target));
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).toMatchObject({ kind: "preview", target });
    fireEvent.click(
      screen.getByRole("button", {
        name: /^(打开工作区|Open Workspace|files.openWorkspace)$/i,
      }),
    );
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).toMatchObject({ kind: "workspace", target });
    const next = { ...target, path: "another.txt" };
    act(() => openFilePreview(next));
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).toMatchObject({ kind: "workspace", target: next });
  });

  it("UGSci workspace: compute opens atomically and a later file request takes priority", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");
    act(() =>
      window.dispatchEvent(new CustomEvent("qwenpaw:open-compute-workbench")),
    );
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).toMatchObject({ kind: "workspace", mode: "compute" });
    const target = { source: "workspace" as const, path: "next.txt" };
    act(() => openFilePreview(target));
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).toMatchObject({ kind: "workspace", target });
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).not.toHaveProperty("mode");
  });

  it("UGSci workspace: inactive chat ignores global file and compute requests", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/ugsci-storage-dynamics"],
    });
    await screen.findByTestId("chat-ui");
    act(() => {
      openFilePreview({ source: "workspace", path: "ignored.txt" });
      window.dispatchEvent(new CustomEvent("qwenpaw:open-compute-workbench"));
    });
    expect(useFilesSurfaceStore.getState().sessionDrawers).toEqual({});
  });

  it("UGSci simulation: the real chat opens the requested run and rejects another agent or session", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");
    act(() =>
      window.dispatchEvent(
        new CustomEvent("qwenpaw:open-simulation-workbench", {
          detail: { runId: "sim_demo", agentId: "default", sessionId: "new" },
        }),
      ),
    );
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).toMatchObject({
      kind: "workspace",
      mode: "simulation",
      simulationRunId: "sim_demo",
    });
    act(() => {
      window.dispatchEvent(
        new CustomEvent("qwenpaw:open-simulation-workbench", {
          detail: { runId: "wrong_agent", agentId: "other", sessionId: "new" },
        }),
      );
      window.dispatchEvent(
        new CustomEvent("qwenpaw:open-simulation-workbench", {
          detail: {
            runId: "wrong_session",
            agentId: "default",
            sessionId: "other",
          },
        }),
      );
    });
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).toMatchObject({ simulationRunId: "sim_demo" });
    act(() => openFilePreview({ source: "workspace", path: "after.txt" }));
    expect(
      useFilesSurfaceStore.getState().sessionDrawers["session:default:new"],
    ).not.toHaveProperty("simulationRunId");
  });

  it("UGSci simulation: accepts the current runtime session when its Chat UUID differs", async () => {
    const chatId = "12345678-1234-4234-8234-123456789012";
    const runtimeSessionId = "console-runtime-session-42";
    const getIdentity = vi.mocked(sessionApi.getSessionIdentity);
    const originalIdentity = getIdentity.getMockImplementation()!;
    getIdentity.mockImplementation((id) => ({
      ...originalIdentity(id),
      sessionId:
        id === chatId ? runtimeSessionId : originalIdentity(id).sessionId,
    }));
    const backgroundTasks = vi
      .spyOn(toolCallsApi, "list")
      .mockResolvedValue({ items: [], total: 0 });
    const view = renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${chatId}`],
    });
    try {
      await screen.findByTestId("chat-ui");
      const key = `session:default:${chatId}`;
      act(() =>
        window.dispatchEvent(
          new CustomEvent("qwenpaw:open-simulation-workbench", {
            detail: {
              runId: "sim_backend_session",
              agentId: "default",
              sessionId: runtimeSessionId,
            },
          }),
        ),
      );
      expect(useFilesSurfaceStore.getState().sessionDrawers[key]).toMatchObject(
        {
          kind: "workspace",
          mode: "simulation",
          simulationRunId: "sim_backend_session",
        },
      );
      act(() => {
        window.dispatchEvent(
          new CustomEvent("qwenpaw:open-simulation-workbench", {
            detail: {
              runId: "wrong_agent",
              agentId: "other",
              sessionId: runtimeSessionId,
            },
          }),
        );
        window.dispatchEvent(
          new CustomEvent("qwenpaw:open-simulation-workbench", {
            detail: {
              runId: "wrong_runtime_session",
              agentId: "default",
              sessionId: "unrelated-runtime-session",
            },
          }),
        );
      });
      expect(useFilesSurfaceStore.getState().sessionDrawers[key]).toMatchObject(
        { simulationRunId: "sim_backend_session" },
      );
    } finally {
      view.unmount();
      getIdentity.mockImplementation(originalIdentity);
      backgroundTasks.mockRestore();
    }
  });
});
