/**
 * Chat message Markdown action -> qwenpaw:open-file-preview.
 *
 * ChatPage.test.tsx is excluded from vitest (worker crash / stale mocks).
 * This file covers the same user path with a thinner render surface.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/common_setup";
import {
  OPEN_FILE_PREVIEW_EVENT,
  type OpenFilePreviewDetail,
} from "@/features/files-workspace/openFilePreview";
import { useFilesSurfaceStore } from "@/stores/filesSurfaceStore";
import { chatExtensions } from "@/plugins/registry/chatExtensions";

let capturedOptions: any = null;

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
vi.mock("./components/ChatActionGroup", () => ({ default: () => null }));
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
  AgentScopeRuntimeWebUI: vi.fn((props: any) => {
    capturedOptions = props.options;
    return <div data-testid="chat-ui" />;
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
  const useAgentStore = Object.assign(vi.fn(() => state()), {
    getState: state,
    setState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  });
  return { useAgentStore };
});

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: vi.fn(() => ({ isDark: false })),
}));

vi.mock("./sessionApi", () => ({
  default: {
    onSessionIdResolved: null,
    onSessionRemoved: null,
    onSessionSelected: null,
    onSessionCreated: null,
    getRealIdForSession: vi.fn(() => null),
    setLastUserMessage: vi.fn(),
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
    capturedOptions = null;
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

  it("dispatches open-file-preview when the message Markdown action is clicked", async () => {
    const previews: OpenFilePreviewDetail[] = [];
    const onPreview = (event: Event) => {
      previews.push((event as CustomEvent<OpenFilePreviewDetail>).detail);
    };
    window.addEventListener(OPEN_FILE_PREVIEW_EVENT, onPreview);

    try {
      renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
      await screen.findByTestId("chat-ui");
      previews.length = 0;

      act(() => {
        capturedOptions.actions.list[1].onClick({
          data: {
            output: [{ role: "assistant", content: "hello from reply" }],
          },
        });
      });

      expect(previews).toHaveLength(1);
      expect(previews[0].target.source).toBe("artifact");
      expect(previews[0].target.path).toMatch(/\.md$/i);
      expect(previews[0].target.artifactUrl).toBeUndefined();
      expect(previews[0].target.artifact).toMatchObject({
        textContent: "hello from reply",
        mimeType: "text/markdown",
        extension: "md",
      });
    } finally {
      window.removeEventListener(OPEN_FILE_PREVIEW_EVENT, onPreview);
    }
  });
});
