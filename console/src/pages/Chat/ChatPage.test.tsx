/**
 * Chat/index.tsx behavior tests
 *
 * Strategy (following the openclaw chat.test.ts pattern):
 * - Mock AgentScopeRuntimeWebUI as a spy component that captures the options prop
 * - Directly invoke callbacks like options.api.fetch and
 *   options.sender.attachments.customRequest to test ChatPage logic
 *   without depending on a real WebSocket runtime
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/common_setup";
import ChatPage from "./index";
import { chatExtensions } from "@/plugins/registry/chatExtensions";
import { useFilesSurfaceStore } from "@/stores/filesSurfaceStore";
import { useUploadLimitStore } from "@/stores/uploadLimitStore";

// ---------------------------------------------------------------------------
// Capture AgentScopeRuntimeWebUI options
// ---------------------------------------------------------------------------
let capturedOptions: any = null;

const {
  mockListProviders,
  mockGetActiveModels,
  mockLoadSessionModel,
  mockUploadFile,
  mockFilePreviewUrl,
  mockGetApiUrl,
  mockSelectedAgent,
  mockSetSelectedAgent,
  mockGetTranscriptionProviderType,
} = vi.hoisted(() => ({
  mockListProviders: vi.fn(),
  mockGetActiveModels: vi.fn(),
  mockLoadSessionModel: vi.fn(),
  mockUploadFile: vi.fn(),
  mockFilePreviewUrl: vi.fn((f: string) => `/preview/${f}`),
  mockGetApiUrl: vi.fn((p: string) => `/api${p}`),
  mockSelectedAgent: vi.fn(() => "default"),
  mockSetSelectedAgent: vi.fn(),
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

vi.mock("../../features/files-workspace/FilesDrawer", () => ({
  default: () => null,
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
  // render rightHeader so child components appear in the DOM
  AgentScopeRuntimeWebUI: vi.fn((props: any) => {
    capturedOptions = props.options;
    return <div data-testid="chat-ui">{props.options?.theme?.rightHeader}</div>;
  }),
  useChatAnywhereSessionsState: vi.fn(() => ({
    sessions: [],
    currentSessionId: null,
    setCurrentSessionId: vi.fn(),
    setSessions: vi.fn(),
  })),
  useChatAnywhereSessions: vi.fn(() => ({ createSession: vi.fn() })),
  useChatAnywhereI18n: vi.fn((selector: (state: any) => unknown) =>
    selector({ setLocale: vi.fn() }),
  ),
  useChatAnywhereInput: vi.fn((selector?: (state: any) => unknown) => {
    const state = {
      setLoading: vi.fn(),
      getLoading: vi.fn(),
      setDisabled: vi.fn(),
      getDisabled: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/ChatAnywhereI18nContext",
  () => ({
    useChatAnywhereI18n: (selector: (state: any) => unknown) =>
      selector({ setLocale: vi.fn() }),
  }),
);

vi.mock("@/api/modules/provider", () => ({
  providerApi: {
    listProviders: mockListProviders,
    getActiveModels: mockGetActiveModels,
  },
}));

vi.mock("@/features/session-settings/sessionModel", () => ({
  loadSessionModel: mockLoadSessionModel,
  readPendingModel: vi.fn(() => null),
  withPendingModel: (payload: unknown) => payload,
}));

vi.mock("@/api/modules/chat", () => ({
  chatApi: {
    uploadFile: mockUploadFile,
    filePreviewUrl: mockFilePreviewUrl,
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
    // Modal: do not render when open=false, avoids CSS animation leaving content in the DOM
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
  getApiUrl: mockGetApiUrl,
  getApiToken: vi.fn(() => ""),
}));

vi.mock("@/stores/agentStore", () => {
  const state = () => ({
    selectedAgent: mockSelectedAgent(),
    setSelectedAgent: mockSetSelectedAgent,
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
    getRealIdForSession: vi.fn(() => null),
    getBackendSessionId: vi.fn(() => "test-session"),
    getSessionIdentity: vi.fn(() => ({
      sessionId: "test-session",
      userId: "test-user",
      channel: "console",
    })),
    isUnresolvedLocalSession: vi.fn(() => false),
    setLastUserMessage: vi.fn(),
    discardLastUserMessage: vi.fn(),
    setVisibleSession: vi.fn(),
    getSession: vi.fn(async (id: string) => ({ id, messages: [] })),
    invalidateSessionCreation: vi.fn(),
    activateCreatedSession: vi.fn(),
    lastActiveChatId: null,
  },
}));

vi.mock("./OptionsPanel/defaultConfig", () => ({
  default: {
    theme: {
      leftHeader: {},
      bubbleList: {
        userMessageAnchors: {},
        assistantMessageAnchors: {},
      },
    },
    api: {},
  },
  getDefaultConfig: vi.fn(() => ({
    theme: {
      leftHeader: {},
      bubbleList: {
        userMessageAnchors: {},
        assistantMessageAnchors: {},
      },
    },
    welcome: {},
    sender: {},
  })),
}));

vi.mock("./ModelSelector", () => ({
  default: () => <div data-testid="model-selector" />,
}));

vi.mock("./components/ChatActionGroup", () => ({
  default: () => <div data-testid="action-group" />,
}));

vi.mock("./components/ChatHeaderTitle", () => ({
  default: () => <div data-testid="header-title" />,
}));

vi.mock("./components/ChatSessionDrawer", () => ({
  default: () => null,
}));

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const mockActiveModel = {
  active_llm: { provider_id: "openai", model: "gpt-4" },
};
const mockProviders = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      {
        id: "gpt-4",
        name: "GPT-4",
        supports_multimodal: true,
        supports_image: true,
        supports_video: false,
      },
    ],
    extra_models: [],
  },
];

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------
describe("ChatPage", () => {
  beforeEach(() => {
    chatExtensions.__resetForTests();
    capturedOptions = null;
    mockListProviders.mockResolvedValue(mockProviders);
    mockGetActiveModels.mockResolvedValue(mockActiveModel);
    mockLoadSessionModel.mockResolvedValue(mockActiveModel);
    useUploadLimitStore.setState({ uploadMaxSizeMb: 10 });
    mockUploadFile.mockResolvedValue({
      url: "uploaded.png",
      file_name: "uploaded.png",
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

  // ── basic rendering ───────────────────────────────────────────────────────

  it("renders AgentScopeRuntimeWebUI", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    expect(await screen.findByTestId("chat-ui")).toBeInTheDocument();
  });

  it("renders child components ModelSelector / ChatActionGroup / ChatHeaderTitle", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");
    // The model selector now lives in the settings panel, outside this header.
    expect(screen.getByTestId("action-group")).toBeInTheDocument();
    expect(screen.getByTestId("header-title")).toBeInTheDocument();
  });

  // ── customFetch: model not configured → show modal ────────────────────────

  it("customFetch returns 400 and shows modal when model is not configured", async () => {
    mockLoadSessionModel.mockResolvedValue({ active_llm: undefined });
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    // directly invoke capturedOptions.api.fetch (openclaw pattern)
    const response = await capturedOptions.api.fetch({
      input: [{ role: "user", content: "hello" }],
      signal: undefined,
    });
    expect(response.status).toBe(400);
    expect(
      await screen.findByText(/LLM Model Required/),
    ).toBeInTheDocument();
  });

  it("shows model config modal when provider API throws", async () => {
    mockLoadSessionModel.mockRejectedValue(new Error("network"));
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    const response = await capturedOptions.api.fetch({
      input: [{ role: "user", content: "hello" }],
      signal: undefined,
    });
    expect(response.status).toBe(400);
    expect(
      await screen.findByText(/LLM Model Required/),
    ).toBeInTheDocument();
  });

  // ── modal interaction ─────────────────────────────────────────────────────

  it("clicking Skip button closes the modal", async () => {
    mockLoadSessionModel.mockResolvedValue({ active_llm: undefined });
    const user = userEvent.setup();
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    await capturedOptions.api.fetch({ input: [{ role: "user", content: "hello" }], signal: undefined });
    await screen.findByText(/LLM Model Required/);

    await user.click(screen.getByText("Skip"));
    // antd Modal has animations; wait for DOM removal
    await waitFor(
      () =>
        expect(
          screen.queryByText("Skip"),
        ).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  // ── customFetch: normal send ──────────────────────────────────────────────

  it("customFetch calls /api/console/chat when model is configured", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200 } as Response);
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    await capturedOptions.api.fetch({
      input: [{ role: "user", content: "hello" }],
      signal: undefined,
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/console/chat",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("customFetch applies request payload transforms before sending", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200 } as Response);
    chatExtensions.addRequestPayloadTransform("plugin-a", {
      id: "plugin-a.request-context",
      order: 10,
      transform: ({ payload, sessionId, selectedAgent }) => ({
        ...payload,
        request_context: {
          session_id: sessionId,
          agent_id: selectedAgent,
          datasource_id: "ds-123",
        },
      }),
    });

    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    await capturedOptions.api.fetch({
      input: [
        {
          role: "user",
          content: "hello",
          session: { session_id: "session-1" },
        },
      ],
      signal: undefined,
    });

    const chatCall = vi.mocked(fetch).mock.calls.find(
      ([url, init]) =>
        String(url) === "/api/console/chat" && init?.method === "POST",
    );
    expect(chatCall).toBeDefined();
    const init = chatCall![1] as RequestInit;
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.request_context).toEqual(expect.objectContaining({
      session_id: "test-session",
      agent_id: "default",
      datasource_id: "ds-123",
    }));
  });

  it("renders fallback metadata as an in-chat system message", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    const parsed = capturedOptions.api.responseParser(
      JSON.stringify({
        object: "response",
        status: "completed",
        metadata: {
          qwenpaw_model_fallbacks: [
            {
              type: "model_fallback",
              from_provider_id: "openai",
              from_model_id: "gpt-primary",
              to_provider_id: "anthropic",
              to_model_id: "claude-fallback",
              reason_kind: "rate_limited",
            },
          ],
        },
        output: [
          {
            type: "message",
            role: "assistant",
            content: [{ type: "text", text: "answer" }],
          },
        ],
      }),
    );

    expect(parsed.output[0]).toMatchObject({
      type: "message",
      role: "system",
      metadata: {
        qwenpaw_model_fallbacks: [
          expect.objectContaining({
            from_model_id: "gpt-primary",
            to_model_id: "claude-fallback",
            reason_kind: "rate_limited",
          }),
        ],
      },
    });
    expect(parsed.output[0].content[0].text).toContain("openai:gpt-primary");
    expect(parsed.output[0].content[0].text).toContain(
      "anthropic:claude-fallback",
    );
    expect(parsed.output[1].role).toBe("assistant");
  });

  it("deduplicates repeated fallback metadata across stream chunks", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");
    const event = {
      type: "model_fallback",
      from_provider_id: "openai",
      from_model_id: "gpt-primary",
      to_provider_id: "anthropic",
      to_model_id: "claude-fallback",
      reason_kind: "rate_limited",
    };

    capturedOptions.api.responseParser(
      JSON.stringify({
        object: "response.delta",
        metadata: { qwenpaw_model_fallbacks: [event] },
      }),
    );
    const parsed = capturedOptions.api.responseParser(
      JSON.stringify({
        object: "response",
        status: "completed",
        metadata: { qwenpaw_model_fallbacks: [event] },
        output: [],
      }),
    );

    expect(parsed.output[0].metadata.qwenpaw_model_fallbacks).toHaveLength(1);
  });

  // ── handleFileUpload ──────────────────────────────────────────────────────

  it("calls onError and skips upload when file exceeds 10MB", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    const bigFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "big.bin", {
      type: "application/octet-stream",
    });
    const onError = vi.fn();
    const onSuccess = vi.fn();

    await capturedOptions.sender.attachments.customRequest({
      file: bigFile,
      onSuccess,
      onError,
    });

    expect(onError).toHaveBeenCalledOnce();
    expect(mockUploadFile).not.toHaveBeenCalled();
  });

  it("uploads successfully and calls onSuccess when file is within size limit", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    const smallFile = new File(["content"], "img.png", { type: "image/png" });
    const onSuccess = vi.fn();
    const onError = vi.fn();

    await capturedOptions.sender.attachments.customRequest({
      file: smallFile,
      onSuccess,
      onError,
      onProgress: vi.fn(),
    });

    expect(mockUploadFile).toHaveBeenCalledWith(smallFile);
    expect(onSuccess).toHaveBeenCalledWith({ url: "/preview/uploaded.png" });
    expect(onError).not.toHaveBeenCalled();
  });

  // ── voice input mode ───────────────────────────────────────────────────────

  it("does not enable browser speech before transcription provider type loads", async () => {
    let resolveProviderType!: (value: {
      transcription_provider_type: string;
    }) => void;
    mockGetTranscriptionProviderType.mockReturnValue(
      new Promise((resolve) => {
        resolveProviderType = resolve;
      }),
    );

    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    expect(capturedOptions.sender.allowSpeech).toBe(false);
    expect(capturedOptions.sender.prefix).toBeTruthy();

    act(() => {
      resolveProviderType({ transcription_provider_type: "disabled" });
    });
  });

  it("uses Whisper speech button and disables browser speech when transcription provider is enabled", async () => {
    mockGetTranscriptionProviderType.mockResolvedValue({
      transcription_provider_type: "whisper_api",
    });

    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    await waitFor(() => {
      expect(capturedOptions.sender.allowSpeech).toBe(false);
      expect(capturedOptions.sender.prefix).toBeTruthy();
    });
  });

  it("keeps browser speech enabled when transcription provider is disabled", async () => {
    mockGetTranscriptionProviderType.mockResolvedValue({
      transcription_provider_type: "disabled",
    });

    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    await waitFor(() => {
      expect(capturedOptions.sender.allowSpeech).toBe(true);
      expect(capturedOptions.sender.prefix).toBeTruthy();
    });
  });

  // ── multimodal caps ───────────────────────────────────────────────────────

  it("calls providerApi on mount to fetch multimodal capabilities", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");
    await waitFor(() => expect(mockLoadSessionModel).toHaveBeenCalled());
    expect(mockListProviders).toHaveBeenCalled();
  });

  it("model-switched event triggers re-fetch of multimodal capabilities", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");
    // wait for initial mount calls to settle
    await waitFor(() => expect(mockLoadSessionModel).toHaveBeenCalled());
    const callsBefore = mockLoadSessionModel.mock.calls.length;

    act(() => {
      window.dispatchEvent(new CustomEvent("model-switched"));
    });

    await waitFor(() =>
      expect(mockLoadSessionModel.mock.calls.length).toBeGreaterThan(
        callsBefore,
      ),
    );
  });

  it("shows copy and timestamp actions for responses", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");
    expect(capturedOptions.actions.list[0].onClick).toEqual(expect.any(Function));
    expect(capturedOptions.actions.list[1].render).toEqual(expect.any(Function));
  });
});
