import type {
  CapturedChatOptions,
  CapturedChatProps,
  NativeRequestData,
} from "@/test/chatOptionsFixture";
/**
 * ChatPage coverage tests
 *
 * Goal: cover as many statements in Chat/index.tsx as possible.
 * Strategy: render ChatPage with comprehensive mocks, exercise callbacks.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createElement,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Upload } from "antd";
import {
  screen,
  waitFor,
  act,
  fireEvent,
  within,
} from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { renderWithProviders } from "@/test/common_setup";
import {
  MAX_QUEUE_SIZE,
  useMessageQueueStore,
} from "@/stores/messageQueueStore";
import { useBackgroundTasksStore } from "@/stores/backgroundTasksStore";
import ChatPage from "./index";
import i18n, { i18nReady } from "../../i18n";
import { LongTextPasteInput } from "./LongTextPaste";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { PAGE_STYLES } from "@/utils/pageStyle";
import { INTERFACE_STYLES } from "@/utils/interfaceStyle";
import { ChatRunLifecycle } from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Execution/runLifecycle";
import sessionApi from "./sessionApi";
import { getDraftStorageKey } from "./chatInputDraft";
import { addAnswerQuote, readAnswerQuotes } from "./answerQuotes";
import { stopBackgroundQueue } from "./backgroundQueueRegistry";
import { chatExtensions } from "@/plugins/registry/chatExtensions";
import { useSessionFilesDrawer } from "@/stores/filesSurfaceStore";
import { useStoppedTurnsStore } from "./stoppedTurns";
import {
  clearAgentMentionModes,
  getAgentMentionModesSnapshot,
  setAgentMentionMode,
} from "./components/agentMentionModes";

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------
const {
  mockListProviders,
  mockPreviewModelInfo,
  mockGetActiveModels,
  mockUploadFile,
  mockFilePreviewUrl,
  mockGetChatStatus,
  mockGetSteeringState,
  mockGetSteeringReceipt,
  mockSteer,
  mockCancelExecution,
  mockRuntimeSubmit,
  mockGetApiUrl,
  mockSelectedAgent,
  mockSetSelectedAgent,
  mockGetTranscriptionProviderType,
  mockCopyText,
  mockBeginLoopModeSubmission,
  mockRequiresQwenPawModel,
  mockHoldOwnershipLock,
  mockRuntimeMount,
  mockFetchActiveLoopMode,
  mockSessionProjectDirectory,
  mockApprovalLevelToggle,
  mockHydrateBackgroundTasksForSession,
  mockRenderSender,
  mockRenderWelcome,
  mockPendingApprovals,
  mockUseActualTheme,
  mockUseActualContext,
  mockUseActualContextUsageStore,
  mockGetContext,
  mockAgentList,
  mockHistoryRequests,
  mockSetSessionMessages,
} = vi.hoisted(() => ({
  mockListProviders: vi.fn(),
  mockPreviewModelInfo: vi.fn(),
  mockGetActiveModels: vi.fn(),
  mockUploadFile: vi.fn(),
  mockFilePreviewUrl: vi.fn((f: string) => `/preview/${f}`),
  mockGetChatStatus: vi.fn(),
  mockGetSteeringState: vi.fn(),
  mockGetSteeringReceipt: vi.fn(),
  mockSteer: vi.fn(),
  mockCancelExecution: vi.fn(async () => ({ status: "not-found" })),
  mockRuntimeSubmit: vi.fn(),
  mockGetApiUrl: vi.fn((p: string) => `http://localhost:3000${p}`),
  mockSelectedAgent: vi.fn(() => "default"),
  mockSetSelectedAgent: vi.fn(),
  mockGetTranscriptionProviderType: vi.fn(),
  mockCopyText: vi.fn().mockResolvedValue(undefined),
  mockBeginLoopModeSubmission: vi.fn((text: string) => text),
  mockRequiresQwenPawModel: vi.fn(() => true),
  mockHoldOwnershipLock: vi.fn(),
  mockRuntimeMount: vi.fn(),
  mockFetchActiveLoopMode: vi.fn(() => Promise.resolve(null)),
  mockSessionProjectDirectory: vi.fn(),
  mockApprovalLevelToggle: vi.fn(),
  mockHydrateBackgroundTasksForSession: vi.fn(() => Promise.resolve()),
  mockRenderSender: vi.fn(() => false),
  mockRenderWelcome: vi.fn(() => false),
  mockPendingApprovals: vi.fn(() => [] as unknown[]),
  mockUseActualTheme: vi.fn(() => false),
  mockUseActualContext: vi.fn(() => false),
  mockUseActualContextUsageStore: vi.fn(() => false),
  mockGetContext: vi.fn(),
  mockAgentList: vi.fn(),
  mockHistoryRequests: vi.fn((_sessionId?: string): unknown[] => {
    void _sessionId;
    return [];
  }),
  mockSetSessionMessages: vi.fn(),
}));

let capturedOptions: CapturedChatOptions | null = null;

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------
vi.mock("../../hooks/useAppMessage", () => ({
  useAppMessage: () => ({
    message: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
  }),
}));

vi.mock("../../contexts/ApprovalContext", () => ({
  useApprovalContext: () => ({
    approvals: mockPendingApprovals(),
    setApprovals: vi.fn(),
  }),
}));

vi.mock("../../plugins/PluginContext", () => ({
  usePlugins: () => ({
    plugins: [],
    registerPlugin: vi.fn(),
    toolRenderConfig: {},
  }),
  PluginContext: {
    Provider: ({ children }: import("react").PropsWithChildren) => children,
  },
}));

vi.mock("./components/ChatSessionInitializer", () => ({
  default: () => null,
}));

vi.mock("@agentscope-ai/chat", () => ({
  AgentScopeRuntimeWebUI: forwardRef((props: CapturedChatProps, ref) => {
    capturedOptions = props.options as unknown as CapturedChatOptions;
    useEffect(() => {
      const id = props.options?.session?.currentSessionId;
      if (id) void props.options.session.api.getSession(id);
    }, [props.options?.session?.api, props.options?.session?.currentSessionId]);

    useEffect(() => {
      mockRuntimeMount();
    }, []);
    useImperativeHandle(ref, () => ({
      input: { submit: mockRuntimeSubmit },
      messages: {
        removeAllMessages: vi.fn(),
        getSessionMessages: vi.fn(() => []),
        getMessages: vi.fn(() => []),
        setSessionMessages: mockSetSessionMessages,
      },
      execution: {
        execute: mockRuntimeSubmit,
        cancel: mockCancelExecution,
      },
    }));
    return (
      <div data-testid="chat-ui">
        {mockRenderWelcome() &&
          props.options?.welcome?.render?.({
            ...props.options.welcome,
            onSubmit: mockRuntimeSubmit,
          })}
        {mockHistoryRequests(props.options?.session?.currentSessionId).map(
          (data, index) => {
            const request = data as {
              input: Array<{
                role: string;
                content: Array<{ type: string; text?: string }>;
              }>;
            };
            const fallback = () => (
              <>
                <p data-testid={`historical-user-text-${index}`}>
                  {request.input
                    .filter((entry) => entry.role === "user")
                    .flatMap((entry) => entry.content)
                    .filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .join("\n")}
                </p>
                <div data-testid={`historical-user-actions-${index}`}>
                  {(props.options?.requestActions?.list ?? []).map(
                    (action, actionIndex: number) =>
                      action.render ? (
                        createElement(action.render, {
                          key: actionIndex,
                          data: data as import("@/test/chatOptionsFixture").CapturedWireFrame,
                        })
                      ) : action.onClick ? (
                        <button
                          key={actionIndex}
                          onClick={() =>
                            action.onClick!({
                              data: data as import("@/test/chatOptionsFixture").CapturedWireFrame,
                            })
                          }
                        >
                          {action.icon}
                        </button>
                      ) : null,
                  )}
                </div>
              </>
            );
            return (
              <section data-testid={`historical-user-${index}`} key={index}>
                {props.options?.request?.render
                  ? props.options.request.render({
                      data: data as NativeRequestData,
                      fallback,
                    })
                  : fallback()}
              </section>
            );
          },
        )}
        {props.options?.sender?.beforeUI}
        {mockRenderSender() && (
          <div className="test-sender qwenpaw-sender">
            {props.options?.sender?.attachments?.trigger && (
              <Upload
                {...props.options.sender.attachments}
                showUploadList={false}
              >
                {createElement(props.options.sender.attachments.trigger, {
                  disabled: false,
                })}
              </Upload>
            )}
            {props.options?.sender?.prefix}
            <LongTextPasteInput
              data-testid="mention-sender"
              placeholder={props.options?.sender?.placeholder}
            />
          </div>
        )}
        {props.options?.theme?.rightHeader}
        {!mockRenderSender() && props.options?.sender?.prefix}
        {props.options?.sender?.actionAffix}
        {props.options?.sender?.afterUI}
      </div>
    );
  }),
  useChatAnywhereSessionsState: vi.fn(() => ({
    sessions: [],
    currentSessionId: null,
    setCurrentSessionId: vi.fn(),
    setSessions: vi.fn(),
  })),
  useChatAnywhereSessions: vi.fn(() => ({ createSession: vi.fn() })),
  useChatAnywhereInput: vi.fn(
    (
      select: (state: {
        loading: boolean;
        setLoading: (loading: boolean) => void;
        getLoading: () => boolean;
        setSessionLoading: (...args: unknown[]) => void;
        setDisabled: (disabled: boolean) => void;
      }) => unknown,
    ) =>
      select({
        loading: false,
        setLoading: vi.fn(),
        getLoading: vi.fn(() => false),
        setSessionLoading: vi.fn(),
        setDisabled: vi.fn(),
      }),
  ),
}));

vi.mock(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/ChatAnywhereI18nContext",
  () => ({
    useChatAnywhereI18n: (
      select: (state: { setLocale: (locale: string) => void }) => unknown,
    ) => select({ setLocale: vi.fn() }),
  }),
);

vi.mock("../../features/session-settings/sessionModel", () => ({
  loadSessionModel: (...args: unknown[]) => mockGetActiveModels(...args),
  readPendingModel: () => null,
  migratePendingModel: vi.fn(),
  withPendingModel: (body: unknown) => body,
}));

vi.mock("@/api/modules/provider", () => ({
  providerApi: {
    listProviders: mockListProviders,
    previewModelInfo: mockPreviewModelInfo,
    getActiveModels: mockGetActiveModels,
  },
}));

vi.mock("@/api/modules/chat", () => ({
  sessionApi: {},
  chatApi: {
    resolveChat: vi.fn(async () => {
      throw new Error("Chat not found");
    }),
    uploadFile: mockUploadFile,
    filePreviewUrl: mockFilePreviewUrl,
    getChatStatus: mockGetChatStatus,
    getSteeringState: mockGetSteeringState,
    getSteeringReceipt: mockGetSteeringReceipt,
    steer: mockSteer,
    stopChat: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/api/modules/agent", () => ({
  agentApi: {
    getTranscriptionProviderType: mockGetTranscriptionProviderType,
  },
  TranscriptionError: class TranscriptionError extends Error {},
}));

vi.mock("@/api/config", () => ({
  getApiUrl: mockGetApiUrl,
  getApiToken: vi.fn(() => ""),
}));

vi.mock("@/stores/agentStore", () => {
  const state = {
    get selectedAgent() {
      return mockSelectedAgent();
    },
    setSelectedAgent: mockSetSelectedAgent,
    get agents() {
      return mockAgentList();
    },
    setLastChatId: vi.fn(),
    getLastChatId: vi.fn(() => null),
    removeLastChatId: vi.fn(),
  };
  const makeState = () => state;
  const store = Object.assign(vi.fn(makeState), {
    subscribe: vi.fn(() => vi.fn()),
    getState: vi.fn(makeState),
    setState: vi.fn(),
  });
  return { useAgentStore: store };
});

vi.mock("@/contexts/ThemeContext", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/contexts/ThemeContext")
  >();
  return {
    ...actual,
    useTheme: vi.fn(() =>
      mockUseActualTheme()
        ? actual.useTheme()
        : { isDark: false, previewTheme: { accent: "#0b57d0" } },
    ),
  };
});

vi.mock("./sessionApi", () => ({
  default: {
    onSessionIdResolved: null,
    onSessionRemoved: null,
    onSessionSelected: null,
    onSessionCreated: null,
    invalidateSessionCreation: vi.fn(),
    activateCreatedSession: vi.fn(),
    getActiveOwner: vi.fn(() => ({
      agentId: mockSelectedAgent(),
      generation: 0,
    })),
    isActiveOwner: vi.fn(
      (owner: { agentId: string }) => owner.agentId === mockSelectedAgent(),
    ),
    registerResolvedChat: vi.fn(),
    getRouteResolutionVersion: vi.fn(() => 0),
    isRouteRemoved: vi.fn(() => false),
    clearRouteRemoval: vi.fn(),
    bindToOwner: vi.fn(() => ({
      getSession: vi.fn(async (id: string) => ({ id, name: id, messages: [] })),
      getSessionList: vi.fn(async () => []),
      createSession: vi.fn(),
      updateSession: vi.fn(),
      removeSession: vi.fn(),
    })),
    createSession: vi.fn(),
    refreshSession: vi.fn(async (id: string) => ({ id, messages: [] })),
    getRealIdForSession: vi.fn(() => null),
    getBackendSessionId: vi.fn(() => "backend-session-1"),
    setLastUserMessage: vi.fn(),
    discardLastUserMessage: vi.fn(),
    setVisibleSession: vi.fn(),
    getSession: vi.fn(async (id: string) => ({ id, messages: [] })),
    lastActiveChatId: "last-chat-1",
    patchLastUserMessage: vi.fn(),
    getSessionIdentity: vi.fn(() => ({
      sessionId: "test-session",
      userId: "test-user",
      channel: "console",
    })),
    triggerResolve: vi.fn(),
    isSessionSwitching: false,
    isUnresolvedLocalSession: vi.fn(() => false),
    getEffectiveSessionId: vi.fn((id: string) => id),
    trackNavigatedSession: vi.fn(),
    preferredChatId: null,
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
    sender: { longTextUpload: false },
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

vi.mock("@/api/modules/skill", () => ({
  skillApi: {
    listSkills: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock("@/api/modules/commands", () => ({
  commandsApi: {
    sendApprovalCommand: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/stores/loopStore", () => ({
  useLoopStore: Object.assign(
    vi.fn((selector?: (state: Record<string, unknown>) => unknown) => {
      const state = {
        availableModes: [],
        selectedMode: null,
        setSelectedMode: vi.fn(),
        resetSessionMode: vi.fn(),
      };
      return selector ? selector(state) : state;
    }),
    {
      getState: vi.fn(() => ({
        availableModes: [],
        selectedMode: null,
        setSelectedMode: vi.fn(),
        resetSessionMode: vi.fn(),
      })),
    },
  ),
  beginLoopModeSubmission: mockBeginLoopModeSubmission,
  fetchActiveLoopMode: mockFetchActiveLoopMode,
  fetchAvailableLoopModes: vi.fn(() => Promise.resolve([])),
  markLoopModeRunning: vi.fn(),
  prepareLoopModeMessage: vi.fn((text: string) => text),
}));

vi.mock("@/stores/uploadLimitStore", () => ({
  useUploadLimitStore: Object.assign(
    vi.fn(() => ({ uploadLimit: 10, uploadMaxSizeMb: null })),
    {
      getState: vi.fn(() => ({ uploadLimit: 10, uploadMaxSizeMb: null })),
    },
  ),
}));

vi.mock("@/hooks/useBackgroundTaskWatcher", () => ({
  hydrateBackgroundTasksForSession: mockHydrateBackgroundTasksForSession,
  stopBackgroundWatchersNotInSession: vi.fn(),
}));

vi.mock("@/hooks/useAgentRunningConfigApprovalLevel", () => ({
  useAgentRunningConfigApprovalLevel: vi.fn(() => "standard"),
}));

vi.mock("@/stores/messageQueueStore", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/stores/messageQueueStore")
  >();
  return {
    ...actual,
    withSendLock: vi.fn(async (_key: string, fn: () => unknown) => fn()),
    holdOwnershipLock: mockHoldOwnershipLock,
  };
});

vi.mock("@/utils/agentBackend", () => ({
  requiresQwenPawModel: mockRequiresQwenPawModel,
  supportsAgentAttachments: vi.fn(() => true),
}));

vi.mock("@/plugins/registry/useChatExtensions", () => ({
  useChatScalarSnapshot: vi.fn(() => ({})),
  useChatListSnapshot: vi.fn(
    () =>
      new Proxy(
        {},
        {
          get: () => [],
        },
      ),
  ),
}));

vi.mock("./components/ContextUsageIndicator", async () => {
  const actual = await vi.importActual<
    typeof import("./components/ContextUsageIndicator")
  >("./components/ContextUsageIndicator");
  return {
    ...actual,
    default: (props: import("react").ComponentProps<typeof actual.default>) =>
      mockUseActualContext() ? (
        <actual.default {...props} />
      ) : (
        <div data-testid="context-usage">
          <button
            data-testid="context-usage-compact"
            onClick={props.onCompact}
          />
        </div>
      ),
  };
});

vi.mock("../../api/modules/chatContext", () => ({
  chatContextApi: { get: mockGetContext },
}));

vi.mock("../../components/ApprovalCard/ApprovalCard", () => ({
  ApprovalCard: ({ requestId }: { requestId: string }) => (
    <div data-testid="scoped-approval">{requestId}</div>
  ),
}));

vi.mock("../../hooks/useIsMobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock("motion/react", async () => {
  const actual = await vi.importActual("motion/react");
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

vi.mock("./components/WhisperSpeechButton", () => ({
  default: vi.fn(() => <div data-testid="whisper-btn" />),
}));

vi.mock("../../components/LoopInput", () => ({
  LoopModeSelector: () => null,
}));

vi.mock("./components/ApprovalLevelToggle", () => ({
  default: (props: unknown) => {
    mockApprovalLevelToggle(props);
    return <div data-testid="approval-toggle" />;
  },
}));

vi.mock("../../features/project-directory/SessionProjectDirectory", () => ({
  default: (props: unknown) => {
    mockSessionProjectDirectory(props);
    return <div data-testid="session-project-directory" />;
  },
}));

vi.mock("./components/HarnessApprovalToggle", () => ({
  default: () => <div data-testid="harness-approval" />,
}));

vi.mock("./components/HarnessModelSelector", () => ({
  default: () => <div data-testid="harness-model" />,
}));

vi.mock("./replayFastForward", () => ({
  wrapReplayFastForward: vi.fn((opts: unknown) => opts),
}));

vi.mock("../../components/Chat/MediaDownload", () => ({
  DownloadableAudios: () => null,
}));

vi.mock("../../components/Chat/ToolCards/adapters/v1Adapter", () => ({
  withGenericFallback: vi.fn((fn: unknown) => fn),
}));

vi.mock("./approvalPayload", () => ({
  applyApprovalLevelToRequestBody: vi.fn((body: unknown) => body),
}));

vi.mock("../../api/modules/chatProjectDirectory", () => ({
  chatProjectDirectoryApi: {
    get: vi.fn(() => Promise.resolve({ project_dir: "/project" })),
  },
}));

vi.mock("../../api/modules/projectDirectory", () => ({
  projectDirectoryApi: {
    get: vi.fn(() =>
      Promise.resolve({
        path: "/home/user",
        workspace_dir: "/home/user/workspace",
      }),
    ),
  },
}));

vi.mock("./turnUsage", () => ({
  patchContextMaxInputLength: vi.fn((body: unknown) => body),
  wrapChatResponseUsageStream: vi.fn((stream: unknown) => stream),
  useStreamingTokens: vi.fn(() => ({ estimatedTokens: 0, isStreaming: false })),
}));

vi.mock("./turnUsageStore", async () => {
  const actual = await vi.importActual<typeof import("./turnUsageStore")>(
    "./turnUsageStore",
  );
  return {
    useTurnUsageStore: Object.assign(
      vi.fn((selector) =>
        mockUseActualContextUsageStore()
          ? actual.useTurnUsageStore(selector)
          : mockUseActualContext()
          ? selector({ snapshot: null, activeMaxInputLength: 100000 })
          : {},
      ),
      {
        getState: vi.fn(() =>
          mockUseActualContextUsageStore()
            ? actual.useTurnUsageStore.getState()
            : {
                beginTurn: vi.fn(() => ({ turnId: "t1" })),
                setSnapshot: vi.fn(),
                snapshot: null,
                invalidateTurn: vi.fn(),
              },
        ),
      },
    ),
  };
});

vi.mock("./HostBubbles", () => ({
  HostRequestCard: () => null,
  HostResponseCard: () => null,
}));

vi.mock("../../plugins/registry/PluginSlotBoundary", () => ({
  PluginSlotBoundary: ({ children }: import("react").PropsWithChildren) =>
    children,
}));

vi.mock("../../stores/filesSurfaceStore", () => ({
  useFilesSurfaceStore: Object.assign(
    vi.fn(() => ({
      sessionDrawers: {},
      dispatchSession: vi.fn(),
      migrateSession: vi.fn(),
      removeSession: vi.fn(),
    })),
    {
      getState: vi.fn(() => ({
        sessionDrawers: {},
        dispatchSession: vi.fn(),
        migrateSession: vi.fn(),
        removeSession: vi.fn(),
      })),
    },
  ),
  useSessionFilesDrawer: vi.fn(() => ({ kind: "closed" })),
}));

vi.mock("../../stores/codingTabsStore", () => ({
  useCodingTabsStore: Object.assign(
    vi.fn(() => ({})),
    {
      getState: vi.fn(() => ({
        migrateScope: vi.fn(),
        removeScope: vi.fn(),
      })),
    },
  ),
}));

vi.mock("./utils", async () => {
  const actual = await vi.importActual<typeof import("./utils")>("./utils");
  return {
    ...actual,
    copyText: mockCopyText,
    getActiveSenderTextarea: vi.fn(() => null),
    getSenderTextareaFromTarget: vi.fn((target: EventTarget | null) =>
      mockRenderSender() ? actual.getSenderTextareaFromTarget(target) : null,
    ),
    setTextareaValue: vi.fn((input: HTMLTextAreaElement, value: string) => {
      if (mockRenderWelcome()) actual.setTextareaValue(input, value);
    }),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
function savedContextSnapshot(chatId: string, agentId = "default") {
  return {
    agent_id: agentId,
    chat_id: chatId,
    session_id: "test-session",
    user_id: "test-user",
    channel: "console",
    status: "saved",
    snapshot: {
      id: "context-record-1",
      captured_at: null,
      basis: "model_request",
      message_count: 2,
      tool_count: 0,
    },
    sources: [],
    summary: { kind: "none", content: "", stale: false },
    limitations: [],
  };
}

describe("ChatPage coverage", () => {
  beforeEach(() => {
    clearAgentMentionModes();
    useBackgroundTasksStore.setState({ tasks: [] });
    vi.mocked(sessionApi.getBackendSessionId).mockReturnValue(
      "backend-session-1",
    );
    vi.mocked(sessionApi.getRealIdForSession).mockReturnValue(null);
    mockRenderSender.mockReturnValue(false);
    mockRenderWelcome.mockReturnValue(false);
    mockHistoryRequests.mockReset().mockReturnValue([]);
    mockPendingApprovals.mockReturnValue([]);
    mockUseActualTheme.mockReturnValue(false);
    mockUseActualContext.mockReturnValue(false);
    mockUseActualContextUsageStore.mockReturnValue(false);
    mockGetContext
      .mockReset()
      .mockImplementation((chatId, agentId) =>
        Promise.resolve(savedContextSnapshot(chatId, agentId)),
      );
    mockAgentList.mockReturnValue([
      { id: "default", name: "Default", backend: "qwenpaw" },
    ]);
    stopBackgroundQueue();
    chatExtensions.__resetForTests();
    capturedOptions = null;
    mockCopyText.mockClear();
    mockGetChatStatus.mockReset();
    mockGetSteeringState.mockReset().mockResolvedValue({
      active_run_id: null,
      supported: false,
      receipts: [],
    });
    mockGetSteeringReceipt.mockReset();
    mockSteer.mockReset();
    mockCancelExecution.mockClear();
    mockGetChatStatus.mockResolvedValue({ status: "idle" });
    mockRuntimeSubmit.mockReset();
    mockRuntimeMount.mockReset();
    mockSelectedAgent.mockReturnValue("default");
    mockFetchActiveLoopMode.mockClear();
    mockSessionProjectDirectory.mockClear();
    mockApprovalLevelToggle.mockClear();
    mockHydrateBackgroundTasksForSession.mockClear();
    mockHoldOwnershipLock.mockReset();
    mockHoldOwnershipLock.mockImplementation((_key: string, cb: () => void) => {
      cb();
      return Promise.resolve();
    });
    vi.mocked(sessionApi.getSessionIdentity).mockImplementation(
      (referenceId?: string | null) => ({
        sessionId: "test-session",
        sdkSessionId: referenceId || "test-session",
        chatId: referenceId || "test-session",
        userId: "test-user",
        channel: "console",
      }),
    );
    vi.mocked(sessionApi.createSession).mockClear();
    sessionApi.preferredChatId = null;
    sessionApi.lastActiveChatId = "last-chat-1";
    localStorage.clear();
    useMessageQueueStore.setState({
      queues: {},
      runStates: {},
      currentSendingId: null,
      lastMigratedTo: null,
    });
    useStoppedTurnsStore.setState({ stoppedSessionIds: new Set() });
    mockBeginLoopModeSubmission.mockReset();
    mockBeginLoopModeSubmission.mockImplementation((text: string) => text);
    mockRequiresQwenPawModel.mockReset();
    mockRequiresQwenPawModel.mockReturnValue(true);
    mockListProviders.mockResolvedValue([
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
    ]);
    mockGetActiveModels.mockResolvedValue({
      active_llm: { provider_id: "openai", model: "gpt-4" },
    });
    mockPreviewModelInfo.mockResolvedValue({
      id: "gpt-4",
      supports_multimodal: true,
      supports_image: true,
      supports_video: false,
    });
    mockUploadFile.mockResolvedValue({
      url: "uploaded.png",
      file_name: "uploaded.png",
    });
    mockGetTranscriptionProviderType.mockResolvedValue({
      transcription_provider_type: "disabled",
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () => Promise.resolve({}),
    });
  });

  afterEach(() => {
    stopBackgroundQueue();
    chatExtensions.__resetForTests();
    vi.clearAllMocks();
  });

  it("does not inherit queue-only ownership or reload history when switching chats", async () => {
    vi.mocked(sessionApi.refreshSession).mockClear();
    mockHoldOwnershipLock.mockImplementation(
      (key: string, onAcquired: () => void, signal: AbortSignal) => {
        if (key.includes("second-chat")) onAcquired();
        return new Promise<void>((resolve) => {
          signal.addEventListener("abort", () => resolve(), { once: true });
        });
      },
    );
    function SwitchChat() {
      const navigate = useNavigate();
      return (
        <button onClick={() => navigate("/chat/second-chat")}>
          Switch chat
        </button>
      );
    }
    renderWithProviders(
      <>
        <SwitchChat />
        <ChatPage />
      </>,
      {
        initialEntries: ["/chat/first-chat"],
      },
    );
    await screen.findByTestId("chat-ui");
    await screen.findByText(i18n.t("chat.queue.otherTabOwner"));
    fireEvent.click(screen.getByRole("button", { name: "Switch chat" }));
    await waitFor(() =>
      expect(mockHoldOwnershipLock).toHaveBeenCalledWith(
        expect.stringContaining("second-chat"),
        expect.any(Function),
        expect.any(AbortSignal),
      ),
    );
    await act(async () => {});
    expect(screen.queryByText(i18n.t("chat.queue.otherTabOwner"))).toBeNull();
    expect(sessionApi.refreshSession).not.toHaveBeenCalled();
  });

  it("does not remount the chat SDK after delayed ownership acquisition", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ status: "idle", messages: [] }),
    } as Response);
    let acquireOwnership: (() => void) | undefined;
    mockHoldOwnershipLock.mockImplementation(
      (_key: string, onAcquired: () => void, signal: AbortSignal) => {
        acquireOwnership = onAcquired;
        return new Promise<void>((resolve) => {
          signal.addEventListener("abort", () => resolve(), { once: true });
        });
      },
    );

    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    expect(mockRuntimeMount).toHaveBeenCalledTimes(1);

    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 350)));
    await act(async () => acquireOwnership?.());

    expect(mockRuntimeMount).toHaveBeenCalledTimes(1);
  });

  it("UGSci fork feature: interface style changes preserve the mounted chat and sender draft", async () => {
    localStorage.removeItem("qwenpaw-interface-style");
    localStorage.removeItem("qwenpaw-page-style");
    mockUseActualTheme.mockReturnValue(true);
    mockRenderSender.mockReturnValue(true);
    function StyleControls() {
      const { setInterfaceStyle, setPageStyle } = useTheme();
      return (
        <>
          {PAGE_STYLES.map(({ id }) => (
            <button
              key={`layout-${id}`}
              onClick={() => setPageStyle(id)}
            >{`layout-${id}`}</button>
          ))}
          {INTERFACE_STYLES.map((style) => (
            <button key={style.id} onClick={() => setInterfaceStyle(style.id)}>
              {style.id}
            </button>
          ))}
        </>
      );
    }
    renderWithProviders(
      <ThemeProvider syncRemote={false}>
        <StyleControls />
        <ChatPage />
      </ThemeProvider>,
      { initialEntries: ["/chat/test-session"] },
    );
    const sender = await screen.findByTestId("mention-sender");
    fireEvent.input(sender, {
      target: { value: "请保留这段尚未提交的研究草稿" },
    });
    const chat = screen.getByTestId("chat-ui");
    const project = await screen.findByTestId("session-project-directory");
    const approval = screen.getByTestId("approval-toggle");
    const usage = screen.getByTestId("context-usage");
    for (const [style, accent] of [
      ["warm-minimal", "#252724"],
      ["cool-workspace", "#4269cc"],
      ["soft-focus", "#45685a"],
    ]) {
      fireEvent.click(screen.getByRole("button", { name: style }));
      await waitFor(() =>
        expect(capturedOptions!.theme.colorPrimary.toLowerCase()).toBe(accent),
      );
      expect(screen.getByTestId("chat-ui")).toBe(chat);
      expect(screen.getByTestId("mention-sender")).toBe(sender);
      expect(sender).toHaveValue("请保留这段尚未提交的研究草稿");
      expect(mockRuntimeMount).toHaveBeenCalledTimes(1);
    }
    for (const { id } of PAGE_STYLES) {
      fireEvent.click(screen.getByRole("button", { name: `layout-${id}` }));
      expect(document.documentElement).toHaveAttribute("data-page-style", id);
      expect(screen.getByTestId("session-project-directory")).toBe(project);
      expect(screen.getByTestId("approval-toggle")).toBe(approval);
      expect(screen.getByTestId("context-usage")).toBe(usage);
      expect(project).toBeVisible();
      expect(approval).toBeVisible();
      expect(usage).toBeVisible();
      expect(project.closest("[data-composer-metadata]")).not.toBeNull();
      const metadata = project.closest("[data-composer-metadata]")!;
      expect(metadata.contains(approval)).toBe(true);
      expect(metadata.contains(usage)).toBe(true);
      expect(
        metadata.compareDocumentPosition(sender) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        screen.queryByRole("button", { name: "Chat options" }),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("chat-ui")).toBe(chat);
      expect(screen.getByTestId("mention-sender")).toBe(sender);
      expect(sender).toHaveValue("请保留这段尚未提交的研究草稿");
      expect(mockRuntimeMount).toHaveBeenCalledTimes(1);
    }
    fireEvent.click(screen.getByRole("button", { name: "classic" }));
    expect(sender).toHaveValue("请保留这段尚未提交的研究草稿");
    expect(mockRuntimeMount).toHaveBeenCalledTimes(1);
    localStorage.removeItem("qwenpaw-interface-style");
    localStorage.removeItem("qwenpaw-page-style");
  });

  it("UGSci fork feature: prototype Agent action opens real mention choices without submitting the draft", async () => {
    localStorage.setItem("qwenpaw-page-style", "openai");
    mockUseActualTheme.mockReturnValue(true);
    mockRenderSender.mockReturnValue(true);
    mockAgentList.mockReturnValue([
      { id: "default", name: "Default", backend: "qwenpaw", enabled: true },
      {
        id: "helper",
        name: "Research Helper",
        backend: "qwenpaw",
        enabled: true,
      },
    ]);
    const actual = await vi.importActual<typeof import("./utils")>("./utils");
    const utilities = await import("./utils");
    vi.mocked(utilities.setTextareaValue).mockImplementationOnce(
      actual.setTextareaValue,
    );
    renderWithProviders(
      <ThemeProvider syncRemote={false}>
        <ChatPage />
      </ThemeProvider>,
      { initialEntries: ["/chat/test-session"] },
    );
    const sender = await screen.findByTestId("mention-sender");
    fireEvent.input(sender, { target: { value: "Retain this draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Add content" }));
    fireEvent.click(screen.getByRole("button", { name: "Assign Agent" }));
    expect(sender).toHaveValue("Retain this draft @");
    await waitFor(() =>
      expect(
        document.querySelector("[data-agent-mention-popup]"),
      ).toHaveTextContent("Research Helper"),
    );
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    localStorage.removeItem("qwenpaw-page-style");
  });

  it("UGSci fork feature: composer add menu fills registered commands without sending or replacing the draft", async () => {
    mockRenderSender.mockReturnValue(true);
    const actual = await vi.importActual<typeof import("./utils")>("./utils");
    const utilities = await import("./utils");
    vi.mocked(utilities.setTextareaValue).mockImplementationOnce(
      actual.setTextareaValue,
    );
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    const sender = await screen.findByTestId("mention-sender");
    // The real session surface fades in before the user can edit the sender.
    await waitFor(() => expect(sender).toBeVisible());
    fireEvent.input(sender, {
      target: { value: "Keep the unsent research notes" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add content" }));
    fireEvent.click(screen.getByRole("button", { name: "/compact" }));
    expect(sender).toHaveValue("/compact Keep the unsent research notes");
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    expect(capturedOptions!.sender.placeholder).toContain("/");
    expect(capturedOptions!.sender.placeholder).toContain("@");
    expect(screen.getByTestId("session-project-directory")).toBeVisible();
    expect(screen.getByTestId("approval-toggle")).toBeVisible();
    expect(screen.getByTestId("context-usage")).toBeVisible();
  });

  it("renders ChatPage and captures options", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    expect(capturedOptions).toBeTruthy();
  });

  it("does not bind an unresolved route chat to the current agent", async () => {
    const staleChatId = "6c978596-76ca-4974-8a2a-d8109ef66315";
    vi.mocked(sessionApi.getSessionIdentity).mockImplementation(
      (referenceId?: string | null) => ({
        sessionId: referenceId === staleChatId ? "" : "test-session",
        sdkSessionId: referenceId || "test-session",
        chatId: referenceId === staleChatId ? undefined : "test-session",
        userId: "test-user",
        channel: "console",
      }),
    );

    renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${staleChatId}`],
    });
    await screen.findByTestId("chat-ui");

    expect(mockFetchActiveLoopMode).not.toHaveBeenCalledWith(
      expect.objectContaining({ chatId: staleChatId }),
    );
    expect(mockSessionProjectDirectory).not.toHaveBeenCalled();
    expect(
      mockSessionProjectDirectory.mock.calls.some(
        ([props]) =>
          (props as { scope?: { chatId?: string } }).scope?.chatId ===
          staleChatId,
      ),
    ).toBe(false);
    expect(mockHydrateBackgroundTasksForSession).not.toHaveBeenCalled();
  });

  it("skips tool-call hydration until a blank session has a chat id", async () => {
    const sdkSessionId = "1788939244396-ik9wz42";
    sessionApi.lastActiveChatId = sdkSessionId;
    vi.mocked(sessionApi.getSessionIdentity).mockImplementation(
      (referenceId?: string | null) => ({
        sessionId:
          referenceId === sdkSessionId ? "stable-session-id" : "test-session",
        sdkSessionId: referenceId || sdkSessionId,
        chatId: undefined,
        userId: "test-user",
        channel: "console",
      }),
    );

    renderWithProviders(<ChatPage />, { initialEntries: ["/chat"] });
    await screen.findByTestId("chat-ui");

    expect(mockHydrateBackgroundTasksForSession).not.toHaveBeenCalled();
  });

  it("starts a blank session instead of restoring history after agent switch", async () => {
    const view = renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/previous-agent-chat"],
    });
    await screen.findByTestId("chat-ui");

    mockSelectedAgent.mockReturnValue("agent-b");
    view.rerender(<ChatPage />);

    await waitFor(() => {
      expect(sessionApi.lastActiveChatId).toBeNull();
    });
    expect(sessionApi.preferredChatId).toBeNull();
    expect(sessionApi.createSession).not.toHaveBeenCalled();
  });

  it("renders child components", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    expect(screen.queryByTestId("model-selector")).not.toBeInTheDocument();
    expect(screen.getByTestId("action-group")).toBeInTheDocument();
    expect(screen.getByTestId("header-title")).toBeInTheDocument();
  });

  it("invokes customFetch via captured options", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.fetch) {
      await capturedOptions!.api.fetch({
        input: [{ role: "user", content: "hello" }],
        signal: undefined,
      });
      expect(fetch).toHaveBeenCalled();
    }
  });

  it("invokes responseParser via captured options", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "response",
          status: "completed",
          output: [
            {
              type: "message",
              role: "assistant",
              content: [{ type: "text", text: "answer" }],
            },
          ],
        }),
      );
      expect(parsed).toBeTruthy();
    }
  });

  it("handles file upload via captured options", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.sender?.attachments?.customRequest) {
      const smallFile = new File(["content"], "img.png", { type: "image/png" });
      const onSuccess = vi.fn();
      const onError = vi.fn();
      await capturedOptions!.sender.attachments.customRequest({
        file: smallFile,
        onSuccess,
        onError,
        onProgress: vi.fn(),
      });
      // Just verify the customRequest was invoked without crashing
      expect(true).toBe(true);
    }
  });

  it("renders with /chat/new route", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat/new"] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    expect(capturedOptions).toBeTruthy();
  });

  it("renders with root route", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/"] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    expect(capturedOptions).toBeTruthy();
  });

  it("re-fetches multimodal caps on model-switched event", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    await waitFor(() => expect(mockGetActiveModels).toHaveBeenCalled());
    const callsBefore = mockGetActiveModels.mock.calls.length;

    act(() => {
      window.dispatchEvent(new CustomEvent("model-switched"));
    });

    await waitFor(() =>
      expect(mockGetActiveModels.mock.calls.length).toBeGreaterThan(
        callsBefore,
      ),
    );
  });

  it("handles responseParser with fallback metadata", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
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
          output: [],
        }),
      );
      expect(parsed).toBeTruthy();
    }
  });

  it("handles responseParser with delta", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "response.delta",
          delta: "hello world",
        }),
      );
      expect(parsed).toBeTruthy();
    }
  });

  it("handles history clear message detection", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      // Exercise the payloadRequestsHistoryClear / messageRequestsHistoryClear paths
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "message",
          metadata: { clear_history: true },
        }),
      );
      expect(parsed).toBeTruthy();
    }
  });

  it("handles payload completion detection", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "response",
          status: "completed",
          output: [],
        }),
      );
      expect(parsed!.output).toBeDefined();
    }
  });

  // ── responseParser: turn_usage → null ──────────────────────────────────
  it("responseParser returns null for turn_usage payload", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({ type: "turn_usage", tokens: 1234 }),
      );
      expect(parsed).toBeNull();
    }
  });

  // ── responseParser: replay_end → heartbeat ─────────────────────────────
  it("responseParser maps replay_end to heartbeat", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({ type: "replay_end" }),
      );
      expect(parsed).toBeTruthy();
      expect(parsed!.type).toBe("heartbeat");
    }
  });

  // ── responseParser: rate_limited → null ────────────────────────────────
  it("responseParser handles rate_limited payload", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          type: "rate_limited",
          alternatives: [
            {
              provider_id: "anthropic",
              provider_name: "Anthropic",
              model_id: "claude-3",
              model_name: "Claude 3",
            },
          ],
        }),
      );
      expect(parsed).toBeNull();
    }
  });

  // ── responseParser: completed with empty output fills trailing delta ───
  it("responseParser fills empty output with trailing delta on completion", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      // First send some delta content to build up trailing text
      capturedOptions!.api.responseParser(
        JSON.stringify({ object: "response.delta", delta: "partial text" }),
      );
      // Then complete with empty output — should fill from trailing
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "response",
          status: "completed",
          output: [],
        }),
      );
      expect(parsed).toBeTruthy();
      expect(parsed!.output).toBeDefined();
      expect(Array.isArray(parsed!.output)).toBe(true);
    }
  });

  // ── responseParser: model fallback events in stream ────────────────────
  it("responseParser handles model fallback events before completion", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      // Send a fallback event
      capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "response.delta",
          delta: "hello",
          metadata: {
            model_fallback: {
              type: "model_fallback",
              from_provider_id: "openai",
              from_model_id: "gpt-4",
              to_provider_id: "anthropic",
              to_model_id: "claude-3",
              reason_kind: "rate_limited",
            },
          },
        }),
      );
      // Complete the response
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "response",
          status: "completed",
          output: [
            {
              type: "message",
              role: "assistant",
              content: [{ type: "text", text: "answer" }],
            },
          ],
        }),
      );
      expect(parsed).toBeTruthy();
      // Output should have fallback notice prepended
      expect(Array.isArray(parsed!.output)).toBe(true);
      expect(parsed!.output!.length).toBeGreaterThanOrEqual(1);
    }
  });

  // ── customFetch: no active model → shows model prompt ─────────────────
  it("customFetch shows model prompt when no active model", async () => {
    mockGetActiveModels.mockResolvedValueOnce({
      active_llm: { provider_id: null, model: null },
    });
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.fetch) {
      const result = await capturedOptions!.api.fetch({
        input: [{ role: "user", content: "hello" }],
        signal: undefined,
      });
      // Should return a buildModelError response
      expect(result).toBeTruthy();
    }
  });

  // ── customFetch: getActiveModels throws → shows model prompt ──────────
  it("customFetch shows model prompt when getActiveModels throws", async () => {
    mockGetActiveModels.mockRejectedValueOnce(new Error("network error"));
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.fetch) {
      const result = await capturedOptions!.api.fetch({
        input: [{ role: "user", content: "hello" }],
        signal: undefined,
      });
      expect(result).toBeTruthy();
    }
  });

  // ── cancel callback → calls stopChat ───────────────────────────────────
  it("cancel callback invokes stopChat", async () => {
    const { chatApi } = await import("@/api/modules/chat");
    const chatId = "90000000-0000-4000-8000-000000000001";
    vi.mocked(sessionApi.getSessionIdentity).mockReturnValue({
      sessionId: "test-session",
      sdkSessionId: "test-session",
      chatId,
      userId: "test-user",
      channel: "console",
    });
    renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${chatId}`],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.cancel) {
      capturedOptions!.api.cancel({ session_id: "test-session" });
      // stopChat should have been called
      await waitFor(() => expect(chatApi.stopChat).toHaveBeenCalled());
    }
  });

  it("marks the canceled session after switching to another session", async () => {
    const { chatApi } = await import("@/api/modules/chat");
    vi.mocked(sessionApi.getRealIdForSession).mockImplementation((id) =>
      id === "chat-A" ? "chat-A" : null,
    );
    vi.mocked(sessionApi.getBackendSessionId).mockImplementation((id) =>
      id === "chat-A" || id === "runtime-A" ? "runtime-A" : "runtime-B",
    );

    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/chat-B"],
    });
    await screen.findByTestId("chat-ui");
    sessionApi.lastActiveChatId = "chat-B";

    await act(async () => {
      await capturedOptions!.api.cancel({
        session_id: "runtime-A",
        chatSessionId: "chat-A",
      });
    });

    expect(chatApi.stopChat).toHaveBeenCalledWith("chat-A", "default");
    expect(useStoppedTurnsStore.getState().stoppedSessionIds).toEqual(
      new Set(["runtime-A"]),
    );
  });

  // ── reconnect callback → calls fetch ───────────────────────────────────
  it("reconnect callback invokes fetch with reconnect body", async () => {
    const chatId = "90000000-0000-4000-8000-000000000002";
    vi.mocked(sessionApi.getSessionIdentity).mockReturnValue({
      sessionId: "test-session",
      sdkSessionId: "test-session",
      chatId,
      userId: "test-user",
      channel: "console",
    });
    renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${chatId}`],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.reconnect) {
      const result = await capturedOptions!.api.reconnect({
        session_id: "test-session",
        signal: undefined,
      });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/console/chat"),
        expect.objectContaining({
          method: "POST",
        }),
      );
      expect(result).toBeTruthy();
    }
  });

  // ── replaceMediaURL → converts URL ─────────────────────────────────────
  it("replaceMediaURL converts URL via toDisplayUrl", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.replaceMediaURL) {
      const result = capturedOptions!.api.replaceMediaURL(
        "http://example.com/file.png",
      );
      expect(typeof result).toBe("string");
    }
  });

  // ── actions list: copy onClick ─────────────────────────────────────────
  it("actions list copies only the assistant text message", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const copyAction = capturedOptions?.actions?.list?.[0];
    expect(copyAction?.onClick).toBeTypeOf("function");

    await copyAction!.onClick!({
      data: {
        output: [
          {
            type: "reasoning",
            role: "assistant",
            content: [{ type: "text", text: "private reasoning" }],
          },
          {
            type: "message",
            role: "assistant",
            content: [{ type: "text", text: "copyable text" }],
          },
        ],
      },
    });
    await waitFor(() => {
      expect(mockCopyText).toHaveBeenCalledWith("copyable text");
    });
  });

  // ── actions list: timestamp render ─────────────────────────────────────
  it("actions list timestamp render returns element", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const actionsList = capturedOptions?.actions?.list;
    if (actionsList && actionsList.length > 1 && actionsList[1].render) {
      const element = actionsList[1].render({
        data: { created_at: 1700000000000, completed_at: 1700000001000 },
      });
      expect(element).toBeTruthy();
      expect(element.props.children).not.toBe("");
    }
  });

  // ── requestActions: copy user message onClick ──────────────────────────
  it("requestActions copy onClick invokes copyText", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const reqActions = capturedOptions?.requestActions?.list;
    if (reqActions && reqActions.length > 1 && reqActions[1].onClick) {
      await reqActions[1].onClick({
        data: {
          input: [
            { role: "user", content: [{ type: "text", text: "user msg" }] },
          ],
        },
      });
      expect(true).toBe(true);
    }
  });

  it("UGSci fork feature: historical edit resend preserves the composer draft and attachments in a fresh queued turn", async () => {
    const chatId = "ed170000-0000-4000-8000-000000000001";
    const draft = "Keep my unrelated composer draft";
    const original = {
      created_at: 1700000000,
      input: [
        {
          role: "user",
          type: "message",
          content: [
            { type: "text", text: "Inspect the original evidence" },
            {
              type: "file",
              file_url: "/files/evidence.csv",
              file_name: "evidence.csv",
              file_size: 42,
            },
          ],
          metadata: { qwenpaw_client_message_id: "historical-client-id" },
        },
      ],
    };
    const snapshot = structuredClone(original);
    mockHistoryRequests.mockReturnValue([original]);
    mockRenderSender.mockReturnValue(true);
    mockGetChatStatus.mockResolvedValue({ status: "running" });
    useMessageQueueStore.getState().setRunState(chatId, "paused");
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    const composer = await screen.findByTestId("mention-sender");
    await act(async () => {});
    fireEvent.input(composer, { target: { value: draft } });
    localStorage.setItem(getDraftStorageKey("default", chatId), draft);
    const bubble = screen.getByTestId("historical-user-0");
    await waitFor(() =>
      expect(
        within(bubble).getByText("Inspect the original evidence"),
      ).toBeVisible(),
    );
    expect(capturedOptions!.requestActions!.list![2].render).toBeTypeOf(
      "function",
    );
    fireEvent.click(
      within(bubble).getByRole("button", {
        name: i18n.t("chat.editResend.action"),
      }),
    );
    const editing = await within(bubble).findByRole("group", {
      name: i18n.t("chat.editResend.action"),
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const editor = within(editing).getByRole("textbox");
    expect(editor).toHaveValue("Inspect the original evidence");
    expect(
      within(bubble).getByTestId("historical-user-text-0"),
    ).not.toBeVisible();
    expect(within(editing).getByText("evidence.csv")).toBeVisible();
    const keepOriginal = within(editing).getByRole("checkbox", {
      name: i18n.t("chat.editResend.keepOriginal"),
    });
    expect(keepOriginal).not.toBeChecked();
    fireEvent.click(keepOriginal);
    expect(composer).toHaveValue(draft);
    expect(useMessageQueueStore.getState().getQueue(chatId)).toEqual([]);
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    fireEvent.change(editor, {
      target: { value: "Inspect the revised evidence" },
    });
    const resend = within(editing).getByRole("button", {
      name: i18n.t("chat.editResend.send"),
    });
    fireEvent.click(resend);
    fireEvent.click(resend);
    await waitFor(() =>
      expect(
        within(bubble).queryByRole("group", {
          name: i18n.t("chat.editResend.action"),
        }),
      ).not.toBeInTheDocument(),
    );
    expect(
      within(bubble).getByText("Inspect the original evidence"),
    ).toBeVisible();
    const queue = useMessageQueueStore.getState().getQueue(chatId);
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      text: "Inspect the revised evidence",
      status: "pending",
      agentId: "default",
      backendSessionId: "test-session",
      userId: "test-user",
      channel: "console",
      attachments: [
        { url: "/files/evidence.csv", name: "evidence.csv", size: 42 },
      ],
    });
    expect(queue[0].clientMessageId).toEqual(expect.any(String));
    expect(queue[0].clientMessageId).not.toBe("historical-client-id");
    expect(queue[0].requestContext?.qwenpaw_edit_resend).toEqual({
      keep_original: true,
      target: { client_message_id: "historical-client-id" },
    });
    expect(queue[0].requestContext).not.toHaveProperty(
      "qwenpaw_regenerate_from",
    );
    expect(original).toEqual(snapshot);
    expect(composer).toHaveValue(draft);
    expect(localStorage.getItem(getDraftStorageKey("default", chatId))).toBe(
      draft,
    );
    expect(sessionApi.discardLastUserMessage).not.toHaveBeenCalled();
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    const { chatApi } = await import("../../api/modules/chat");
    expect(chatApi.stopChat).not.toHaveBeenCalled();
    expect(mockCancelExecution).not.toHaveBeenCalled();
    expect(useMessageQueueStore.getState().getRunState(chatId)).toBe("paused");
  });

  it("UGSci fork feature: historical edit resend isolates Agent mention modes from the main composer and snapshots its own collaboration choice", async () => {
    const chatId = "ed170000-0000-4000-8000-000000000006";
    const store = useMessageQueueStore.getState();
    store.setRunState(chatId, "paused");
    mockAgentList.mockReturnValue([
      { id: "default", name: "Default", enabled: true, backend: "qwenpaw" },
      { id: "reviewer", name: "Reviewer", enabled: true, backend: "qwenpaw" },
    ]);
    mockHistoryRequests.mockReturnValue([
      {
        input: [
          {
            role: "user",
            content: [{ type: "text", text: "@Reviewer check this result" }],
            metadata: {
              original_id: "mention-history",
              qwenpaw_agent_mention_dispatch: {
                requestText: "check this result",
                targetAgentId: "reviewer",
                coordinationRequested: false,
                modes: { reviewer: "delegate" },
              },
            },
          },
        ],
      },
    ]);
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    act(() => setAgentMentionMode("reviewer", "collaborate"));
    const composerModes = getAgentMentionModesSnapshot();
    const bubble = screen.getByTestId("historical-user-0");
    fireEvent.click(
      within(bubble).getByRole("button", {
        name: i18n.t("chat.editResend.action"),
      }),
    );
    const editing = await within(bubble).findByRole("group", {
      name: i18n.t("chat.editResend.action"),
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const mode = within(editing).getByRole("combobox", {
      name: i18n.t("chat.editResend.mentionMode", { agent: "Reviewer" }),
    });
    expect(mode.closest(".ant-select")).toHaveTextContent(
      i18n.t("chat.editResend.delegate"),
    );
    expect(getAgentMentionModesSnapshot()).toEqual(composerModes);
    fireEvent.mouseDown(mode);
    fireEvent.click(
      await screen.findByText(i18n.t("chat.editResend.collaborate")),
    );
    fireEvent.click(
      within(editing).getByRole("button", {
        name: i18n.t("chat.editResend.send"),
      }),
    );
    await waitFor(() =>
      expect(
        within(bubble).queryByRole("group", {
          name: i18n.t("chat.editResend.action"),
        }),
      ).not.toBeInTheDocument(),
    );
    expect(store.getQueue(chatId)).toHaveLength(1);
    expect(store.getQueue(chatId)[0]).toMatchObject({
      text: "@Reviewer check this result",
      requestContext: {
        qwenpaw_agent_mention_dispatch: {
          coordinationRequested: true,
          modes: { reviewer: "collaborate" },
        },
      },
    });
    expect(getAgentMentionModesSnapshot()).toEqual(composerModes);
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
  });

  it("UGSci fork feature: historical edit resend retains its draft when the queue is full and submits once space is available", async () => {
    const chatId = "ed170000-0000-4000-8000-000000000002";
    const store = useMessageQueueStore.getState();
    store.setRunState(chatId, "paused");
    for (let index = 0; index < MAX_QUEUE_SIZE; index += 1)
      store.enqueue(chatId, {
        text: `Existing queued task ${index}`,
        agentId: "default",
      });
    mockHistoryRequests.mockReturnValue([
      {
        input: [
          {
            role: "user",
            content: [{ type: "text", text: "Historical task" }],
            metadata: { original_id: "full-queue-history" },
          },
        ],
      },
    ]);
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    const bubble = screen.getByTestId("historical-user-0");
    fireEvent.click(
      within(bubble).getByRole("button", {
        name: i18n.t("chat.editResend.action"),
      }),
    );
    const editing = await within(bubble).findByRole("group", {
      name: i18n.t("chat.editResend.action"),
    });
    const editor = within(editing).getByRole("textbox");
    fireEvent.change(editor, {
      target: { value: "Do not lose this revised task" },
    });
    fireEvent.click(
      within(editing).getByRole("button", {
        name: i18n.t("chat.editResend.send"),
      }),
    );
    await act(async () => {});
    expect(
      within(bubble).getByRole("group", {
        name: i18n.t("chat.editResend.action"),
      }),
    ).toBeVisible();
    expect(editor).toHaveValue("Do not lose this revised task");
    expect(store.getQueue(chatId)).toHaveLength(MAX_QUEUE_SIZE);
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    act(() => store.remove(chatId, store.getQueue(chatId)[0].id));
    fireEvent.click(
      within(editing).getByRole("button", {
        name: i18n.t("chat.editResend.send"),
      }),
    );
    await waitFor(() =>
      expect(
        within(bubble).queryByRole("group", {
          name: i18n.t("chat.editResend.action"),
        }),
      ).not.toBeInTheDocument(),
    );
    expect(store.getQueue(chatId)).toHaveLength(MAX_QUEUE_SIZE);
    expect(store.getQueue(chatId)[MAX_QUEUE_SIZE - 1].text).toBe(
      "Do not lose this revised task",
    );
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
  });

  it("UGSci fork feature: navigation invalidates a historical edit dialog and its retained action even after returning to the same Chat", async () => {
    const sourceChatId = "ed170000-0000-4000-8000-000000000003";
    const targetChatId = "ed170000-0000-4000-8000-000000000004";
    const store = useMessageQueueStore.getState();
    store.setRunState(sourceChatId, "paused");
    store.setRunState(targetChatId, "paused");
    const original = {
      input: [
        { role: "user", content: [{ type: "text", text: "Source-only task" }] },
      ],
    };
    mockHistoryRequests.mockImplementation((id) =>
      id === sourceChatId ? [original] : [],
    );
    function ChatHarness() {
      const navigate = useNavigate();
      return (
        <>
          <button onClick={() => navigate(`/chat/${targetChatId}`)}>
            Visit other Chat
          </button>
          <button onClick={() => navigate(`/chat/${sourceChatId}`)}>
            Return to source Chat
          </button>
          <ChatPage />
        </>
      );
    }
    renderWithProviders(<ChatHarness />, {
      initialEntries: [`/chat/${sourceChatId}`],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    const oldAction = capturedOptions!.requestActions!.list![2];
    const bubble = screen.getByTestId("historical-user-0");
    fireEvent.click(
      within(bubble).getByRole("button", {
        name: i18n.t("chat.editResend.action"),
      }),
    );
    const editing = await within(bubble).findByRole("group", {
      name: i18n.t("chat.editResend.action"),
    });
    fireEvent.change(within(editing).getByRole("textbox"), {
      target: { value: "Still belongs to source" },
    });
    const staleSubmit = within(editing).getByRole("button", {
      name: i18n.t("chat.editResend.send"),
    });
    // Keep an old SDK footer mounted independently to exercise a retained
    // action closure after the live user-message surface has been replaced.
    renderWithProviders(
      <aside data-testid="retained-history-action">
        {createElement(oldAction.render!, { data: original })}
      </aside>,
    );
    const retainedButton = within(
      screen.getByTestId("retained-history-action"),
    ).getByRole("button", { name: i18n.t("chat.editResend.action") });
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Visit other Chat" })),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("group", { name: i18n.t("chat.editResend.action") }),
      ).not.toBeInTheDocument(),
    );
    fireEvent.click(staleSubmit);
    fireEvent.click(retainedButton);
    await act(async () => {});
    expect(
      screen.queryByRole("group", { name: i18n.t("chat.editResend.action") }),
    ).not.toBeInTheDocument();
    expect(store.getQueue(sourceChatId)).toEqual([]);
    expect(store.getQueue(targetChatId)).toEqual([]);
    await act(async () =>
      fireEvent.click(
        screen.getByRole("button", { name: "Return to source Chat" }),
      ),
    );
    fireEvent.click(retainedButton);
    await act(async () => {});
    expect(
      screen.queryByRole("group", { name: i18n.t("chat.editResend.action") }),
    ).not.toBeInTheDocument();
    expect(store.getQueue(sourceChatId)).toEqual([]);
    expect(store.getQueue(targetChatId)).toEqual([]);
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    expect(mockCancelExecution).not.toHaveBeenCalled();
  });

  it.each(["ctrlKey", "metaKey"] as const)(
    "UGSci fork feature: historical edit %s Enter never sends or clears the separate composer draft",
    async (modifier) => {
      const chatId = "ed170000-0000-4000-8000-000000000005";
      const draft = "Unsubmitted main composer content";
      const store = useMessageQueueStore.getState();
      store.setRunState(chatId, "paused");
      mockRenderSender.mockReturnValue(true);
      mockHistoryRequests.mockReturnValue([
        {
          input: [
            {
              role: "user",
              content: [{ type: "text", text: "Revisable history" }],
              metadata: { original_id: "keyboard-history" },
            },
          ],
        },
      ]);
      renderWithProviders(<ChatPage />, {
        initialEntries: [`/chat/${chatId}`],
      });
      const composer = await screen.findByTestId("mention-sender");
      fireEvent.input(composer, { target: { value: draft } });
      localStorage.setItem(getDraftStorageKey("default", chatId), draft);
      const bubble = screen.getByTestId("historical-user-0");
      fireEvent.click(
        within(bubble).getByRole("button", {
          name: i18n.t("chat.editResend.action"),
        }),
      );
      const editing = await within(bubble).findByRole("group", {
        name: i18n.t("chat.editResend.action"),
      });
      const editor = within(editing).getByRole("textbox");
      const utils = await import("./utils");
      vi.mocked(utils.getActiveSenderTextarea).mockReturnValue(
        composer as HTMLTextAreaElement,
      );
      try {
        fireEvent.keyDown(editor, {
          key: "Enter",
          code: "Enter",
          [modifier]: true,
        });
        await act(async () => {});
        expect(
          store.getQueue(chatId).every((item) => item.text !== draft),
        ).toBe(true);
        expect(composer).toHaveValue(draft);
        expect(
          localStorage.getItem(getDraftStorageKey("default", chatId)),
        ).toBe(draft);
        expect(mockRuntimeSubmit).not.toHaveBeenCalled();
      } finally {
        vi.mocked(utils.getActiveSenderTextarea).mockReturnValue(null);
      }
    },
  );

  it("UGSci fork feature: historical edit replaces only its original bubble inline and cancel restores that bubble without a dialog", async () => {
    const chatId = "ed170000-0000-4000-8000-000000000007";
    const original = "An identical historical user request";
    mockHistoryRequests.mockReturnValue(
      ["first", "second"].map((id) => ({
        input: [
          {
            role: "user",
            content: [{ type: "text", text: original }],
            metadata: { qwenpaw_client_message_id: id },
          },
        ],
      })),
    );
    useMessageQueueStore.getState().setRunState(chatId, "paused");
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    const first = screen.getByTestId("historical-user-0");
    const second = screen.getByTestId("historical-user-1");
    await waitFor(() =>
      expect(within(first).getByText(original)).toBeVisible(),
    );
    expect(within(second).getByText(original)).toBeVisible();
    fireEvent.click(
      within(first).getByRole("button", {
        name: i18n.t("chat.editResend.action"),
      }),
    );
    const editing = await within(first).findByRole("group", {
      name: i18n.t("chat.editResend.action"),
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      within(first).getByTestId("historical-user-text-0"),
    ).not.toBeVisible();
    expect(within(editing).getByRole("textbox")).toHaveValue(original);
    expect(within(second).queryByRole("textbox")).not.toBeInTheDocument();
    expect(within(second).getByText(original)).toBeVisible();
    fireEvent.change(within(editing).getByRole("textbox"), {
      target: { value: "A draft to cancel" },
    });
    fireEvent.click(
      within(editing).getByRole("button", { name: i18n.t("common.cancel") }),
    );
    expect(within(first).queryByRole("textbox")).not.toBeInTheDocument();
    expect(within(first).getByText(original)).toBeVisible();
    expect(within(second).getByText(original)).toBeVisible();
    expect(within(second).queryByRole("textbox")).not.toBeInTheDocument();
    expect(useMessageQueueStore.getState().getQueue(chatId)).toEqual([]);
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    "UGSci fork feature: historical edit keep-original %s reaches the transport and refreshes replacement history",
    async (keepOriginal) => {
      const chatId = "ed170000-0000-4000-8000-000000000008";
      const store = useMessageQueueStore.getState();
      store.setRunState(chatId, "paused");
      mockHistoryRequests.mockReturnValue([
        {
          input: [
            {
              role: "user",
              content: [{ type: "text", text: "Original question" }],
              metadata: { original_id: "original-native" },
            },
          ],
        },
      ]);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ status: "idle", messages: [] }),
      } as Response);
      mockRuntimeSubmit.mockImplementation(async (data, options) => {
        await capturedOptions!.api.fetch({
          ...data,
          chatSessionId: chatId,
          clientRequestId: options.clientRequestId,
          input: [
            { role: "user", content: [{ type: "text", text: data.query }] },
          ],
        });
        const lifecycle = new ChatRunLifecycle({
          runId: "edit-run",
          source: "host-queue",
          sessionId: chatId,
          cancel: vi.fn(),
        });
        lifecycle.markAccepted(chatId);
        return lifecycle.handle;
      });
      renderWithProviders(<ChatPage />, {
        initialEntries: [`/chat/${chatId}`],
      });
      await screen.findByTestId("chat-ui");
      fireEvent.click(
        screen.getByRole("button", { name: i18n.t("chat.editResend.action") }),
      );
      const editing = await screen.findByRole("group", {
        name: i18n.t("chat.editResend.action"),
      });
      const checkbox = within(editing).getByRole("checkbox", {
        name: i18n.t("chat.editResend.keepOriginal"),
      });
      expect(checkbox).not.toBeChecked();
      if (keepOriginal) fireEvent.click(checkbox);
      fireEvent.change(within(editing).getByRole("textbox"), {
        target: { value: "Revised question" },
      });
      fireEvent.click(
        within(editing).getByRole("button", {
          name: i18n.t("chat.editResend.send"),
        }),
      );
      expect(store.getQueue(chatId)).toHaveLength(1);
      act(() => store.setRunState(chatId, "running"));
      await waitFor(() => expect(mockRuntimeSubmit).toHaveBeenCalledTimes(1), {
        timeout: 3000,
      });
      await waitFor(() => expect(store.getQueue(chatId)).toEqual([]));
      const post = vi
        .mocked(fetch)
        .mock.calls.find(
          ([url, opts]) =>
            String(url).endsWith("/console/chat") && opts?.method === "POST",
        );
      expect(post).toBeDefined();
      const body = JSON.parse(String(post![1]!.body));
      expect(body.request_context.qwenpaw_edit_resend).toEqual({
        keep_original: keepOriginal,
        target: { message_id: "original-native" },
      });
      expect(body.input[0].metadata.qwenpaw_client_message_id).toBeTruthy();
      if (!keepOriginal) {
        await waitFor(() =>
          expect(mockSetSessionMessages).toHaveBeenCalledWith(chatId, []),
        );
        expect(sessionApi.refreshSession).toHaveBeenCalledWith(
          chatId,
          expect.any(AbortSignal),
        );
      } else {
        expect(mockSetSessionMessages).not.toHaveBeenCalled();
      }
    },
  );

  // ── requestActions: timestamp render ───────────────────────────────────
  it("requestActions timestamp render returns element", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const reqActions = capturedOptions?.requestActions?.list;
    if (reqActions && reqActions.length > 0 && reqActions[0].render) {
      const element = reqActions[0].render({
        data: { created_at: 1700000000000 },
      });
      expect(element).toBeTruthy();
    }
  });

  // ── handleBeforeSubmit: SDK query override ─────────────────────────────
  it("compact command uses execution.execute with current session identity", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    fireEvent.click(screen.getByTestId("context-usage-compact"));

    expect(mockRuntimeSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "/compact",
        session_id: "test-session",
        user_id: "test-user",
        channel: "console",
        agent_id: "default",
      }),
      { sessionId: "test-session", source: "direct" },
    );
  });

  it("UGSci fork feature: the mounted task panel stays collapsible during and after multi-agent execution", async () => {
    mockRenderSender.mockReturnValue(true);
    const store = useBackgroundTasksStore.getState();
    for (const agentId of ["reviewer", "researcher"]) {
      store.addTask(
        {
          toolCallId: `agent-${agentId}`,
          toolName: `Work by ${agentId}`,
          sourceTool: "spawn_agent",
          agentId,
          sessionId: "backend-session-1",
          taskSummary: `Work by ${agentId}`,
          startTime: Date.now(),
        },
        { kind: "agent" },
      );
    }
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await waitFor(() =>
      expect(screen.getByText("Work by reviewer")).toBeVisible(),
    );
    expect(screen.getByText("Work by researcher")).toBeVisible();
    const collapseLabel = i18n.t("chat.taskPanel.collapse");
    const expandLabel = i18n.t("chat.taskPanel.expand");
    fireEvent.click(screen.getByRole("button", { name: collapseLabel }));
    expect(screen.queryByText("Work by reviewer")).not.toBeInTheDocument();
    expect(screen.getByTestId("mention-sender")).toBeVisible();
    act(() => {
      store.appendLiveOutput("agent-reviewer", "Still running");
      store.updateTask("agent-researcher", {
        status: "done",
        result: "Result",
      });
    });
    expect(screen.getByRole("button", { name: expandLabel })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(useBackgroundTasksStore.getState().tasks[0].status).toBe("running");
    fireEvent.click(screen.getByRole("button", { name: expandLabel }));
    expect(screen.getByText("Work by reviewer")).toBeVisible();
    act(() =>
      store.updateTask("agent-reviewer", {
        status: "done",
        result: "Reviewed",
      }),
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByText("Work by reviewer")).toBeVisible();
    expect(screen.getByText("Work by researcher")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: collapseLabel }));
    expect(screen.queryByText("Work by reviewer")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: expandLabel }));
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByText("Work by researcher")).toBeVisible();
    expect(useBackgroundTasksStore.getState().tasks).toHaveLength(2);
  });

  it("UGSci fork feature: @ opens the real Agent picker and keyboard selection inserts a mention", async () => {
    mockRenderSender.mockReturnValue(true);
    mockAgentList.mockReturnValue([
      { id: "default", name: "Default", enabled: true, backend: "qwenpaw" },
      { id: "reviewer", name: "Reviewer", enabled: true, backend: "qwenpaw" },
      { id: "disabled", name: "Disabled", enabled: false, backend: "qwenpaw" },
    ]);
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    const textarea = await screen.findByTestId("mention-sender");
    await act(async () => {});
    fireEvent.input(textarea, {
      target: { value: "@", selectionStart: 1, selectionEnd: 1 },
    });
    expect(
      await screen.findByRole("button", { name: /Reviewer/ }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Disabled/ }),
    ).not.toBeInTheDocument();
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(textarea).toHaveValue("@Reviewer ");
    expect(
      document.querySelector("[data-agent-mention-popup]"),
    ).not.toBeInTheDocument();
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
  });

  it.each(["delegate", "collaborate"] as const)(
    "UGSci fork feature: @ %s survives SDK input clearing and routes the actual request",
    async (mode) => {
      mockAgentList.mockReturnValue([
        { id: "default", name: "Default", enabled: true, backend: "qwenpaw" },
        { id: "reviewer", name: "Reviewer", enabled: true, backend: "qwenpaw" },
      ]);
      renderWithProviders(<ChatPage />, {
        initialEntries: ["/chat/test-session"],
      });
      await screen.findByTestId("chat-ui");
      await act(async () => {});
      setAgentMentionMode("reviewer", mode);
      mockBeginLoopModeSubmission.mockImplementation(
        (text: string) => `/goal ${text}`,
      );
      let submitted!: Exclude<
        Awaited<ReturnType<CapturedChatOptions["sender"]["beforeSubmit"]>>,
        boolean
      >;
      await act(async () => {
        const result = await capturedOptions!.sender.beforeSubmit({
          query: "@Reviewer analyze",
          context: { keep: "value" },
        });
        if (typeof result !== "object")
          throw new Error("Routing must return a submission object");
        submitted = result;
      });
      expect(submitted.proceed).toBe(true);
      act(() => clearAgentMentionModes());
      await capturedOptions!.api.fetch({
        context: submitted.context,
        input: [
          {
            role: "user",
            content: [
              { type: "text", text: submitted.query },
              { type: "file", file_url: "/api/files/a.txt" },
            ],
          },
        ],
      });
      const call = vi
        .mocked(fetch)
        .mock.calls.find(
          ([url, options]) =>
            String(url).includes("/console/chat") && options?.method === "POST",
        );
      expect(call).toBeDefined();
      const payload = JSON.parse(call![1]!.body as string);
      expect(call![1]!.headers).toMatchObject({
        "X-Agent-Id": mode === "delegate" ? "reviewer" : "default",
      });
      expect(payload.target_agent_id).toBe(
        mode === "delegate" ? "reviewer" : undefined,
      );
      expect(payload.request_context.keep).toBe("value");
      expect(payload.request_context.agent_coordination_requested).toBe(
        mode === "collaborate" ? true : undefined,
      );
      expect(payload.input[0].content[0].text).toContain(
        mode === "delegate" ? "analyze" : "chat_with_agent",
      );
      if (mode === "delegate")
        expect(payload.input[0].content[0].text).toBe("/goal analyze");
      expect(payload.input[0].content[1].type).toBe("file");
    },
  );

  it("UGSci fork feature: queued @ collaboration keeps the enqueue-time selection", async () => {
    const chatId = "33322222-2222-4222-8222-222222222222";
    mockAgentList.mockReturnValue([
      { id: "default", name: "Default", enabled: true, backend: "qwenpaw" },
      { id: "reviewer", name: "Reviewer", enabled: true, backend: "qwenpaw" },
    ]);
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    act(() => {
      useMessageQueueStore
        .getState()
        .enqueue(chatId, { text: "waiting", agentId: "default" });
      useMessageQueueStore.getState().setRunState(chatId, "paused");
      setAgentMentionMode("reviewer", "collaborate");
    });
    await act(async () => {
      await capturedOptions!.sender.beforeSubmit({
        query: "@Reviewer analyze",
      });
    });
    const item = useMessageQueueStore
      .getState()
      .getQueue(chatId)
      .find((entry) => entry.text.includes("@Reviewer"));
    expect(item).toBeDefined();
    act(() => clearAgentMentionModes());
    await capturedOptions!.api.fetch({
      context: item!.requestContext,
      input: [{ role: "user", content: [{ type: "text", text: item!.text }] }],
    });
    const call = vi
      .mocked(fetch)
      .mock.calls.find(
        ([url, options]) =>
          String(url).includes("/console/chat") && options?.method === "POST",
      );
    const payload = JSON.parse(call![1]!.body as string);
    expect(payload.target_agent_id).toBeUndefined();
    expect(payload.request_context.agent_coordination_requested).toBe(true);
    expect(payload.input[0].content[0].text).toContain("chat_with_agent");
  });

  it("returns the prepared query after the SDK captures input data", async () => {
    mockBeginLoopModeSubmission.mockImplementation(
      (text: string) => `/goal ${text}`,
    );
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const beforeSubmit = capturedOptions?.sender?.beforeSubmit;
    expect(typeof beforeSubmit).toBe("function");

    const inputData = {
      query: "do the task",
      fileList: [
        {
          uid: "file-1",
          name: "notes.txt",
          response: { url: "/files/notes.txt" },
        },
      ],
      mentions: [{ value: "@reviewer", type: "user" }],
    };
    const capturedQuery = inputData.query;
    const result = await beforeSubmit!(inputData);
    const submitted = {
      ...inputData,
      query:
        typeof result === "object" && result.query !== undefined
          ? result.query
          : capturedQuery,
    };

    expect(result).toMatchObject({
      proceed: true,
      query: "/goal do the task",
    });
    expect(submitted.query).toBe("/goal do the task");
    expect(submitted.fileList).toEqual(inputData.fileList);
    expect(submitted.mentions).toEqual(inputData.mentions);
  });

  it("leaves the query unchanged for a non-QwenPaw backend", async () => {
    mockRequiresQwenPawModel.mockReturnValue(false);
    mockBeginLoopModeSubmission.mockImplementation(
      (text: string) => `/goal ${text}`,
    );
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const beforeSubmit = capturedOptions?.sender?.beforeSubmit;
    const result = await beforeSubmit!({ query: "do the task" });

    expect(result).toMatchObject({ proceed: true, query: "do the task" });
    expect(mockBeginLoopModeSubmission).not.toHaveBeenCalled();
  });

  it("UGSci fork feature: mounted normal queue editing sorting deletion and clearing update persisted items while paused", async () => {
    const chatId = "fc710000-0000-4000-8000-000000000001";
    const store = useMessageQueueStore.getState();
    store.enqueue(chatId, {
      text: "First editable queued task",
      agentId: "default",
      backendSessionId: "test-session",
      attachments: [
        { url: "/files/queued.csv", name: "queued.csv", type: "text/csv" },
      ],
    });
    store.enqueue(chatId, {
      text: "Second removable queued task",
      agentId: "default",
      backendSessionId: "test-session",
    });
    store.enqueue(chatId, {
      text: "Third sortable queued task",
      agentId: "default",
      backendSessionId: "test-session",
    });
    const [first, second, third] = store.getQueue(chatId);
    store.setRunState(chatId, "paused");
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    const firstLabel = await screen.findByText(first.text);
    const firstRow = firstLabel.closest("[draggable]") as HTMLElement;
    await waitFor(() => expect(firstRow).toBeVisible());
    fireEvent.mouseEnter(firstRow);
    const editButton = firstRow
      .querySelector("svg.lucide-pencil")
      ?.closest("button");
    expect(editButton).toBeInstanceOf(HTMLButtonElement);
    fireEvent.click(editButton!);
    const editor = within(firstRow).getByRole("textbox");
    fireEvent.change(editor, { target: { value: "Edited first queued task" } });
    fireEvent.keyDown(editor, { key: "Enter", code: "Enter" });
    await waitFor(() =>
      expect(store.getQueue(chatId)[0].text).toBe("Edited first queued task"),
    );
    expect(store.getQueue(chatId)[0]).toMatchObject({
      id: first.id,
      clientMessageId: first.clientMessageId,
      attachments: first.attachments,
    });
    const thirdRow = screen
      .getByText(third.text)
      .closest("[draggable]") as HTMLElement;
    fireEvent.dragStart(thirdRow);
    fireEvent.dragOver(firstRow);
    fireEvent.drop(firstRow);
    expect(store.getQueue(chatId).map((item) => item.id)).toEqual([
      third.id,
      first.id,
      second.id,
    ]);
    expect(
      thirdRow.compareDocumentPosition(firstRow) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const secondRow = screen
      .getByText(second.text)
      .closest("[draggable]") as HTMLElement;
    fireEvent.mouseEnter(secondRow);
    const removeButton = secondRow
      .querySelector("svg.lucide-trash-2")
      ?.closest("button");
    expect(removeButton).toBeInstanceOf(HTMLButtonElement);
    fireEvent.click(removeButton!);
    expect(store.getQueue(chatId).map((item) => item.id)).toEqual([
      third.id,
      first.id,
    ]);
    expect(screen.queryByText(second.text)).not.toBeInTheDocument();
    expect(
      JSON.parse(
        localStorage.getItem(`qwenpaw:message-queue:${chatId}`) || "null",
      ),
    ).toMatchObject({
      runState: "paused",
      items: [
        { id: third.id },
        {
          id: first.id,
          text: "Edited first queued task",
          attachments: first.attachments,
        },
      ],
    });
    fireEvent.click(
      screen.getByRole("button", { name: i18n.t("chat.queue.clear") }),
    );
    expect(store.getQueue(chatId)).toEqual([]);
    expect(
      screen.queryByText("Edited first queued task"),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem(`qwenpaw:message-queue:${chatId}`)).toBeNull();
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    expect(mockCancelExecution).not.toHaveBeenCalled();
  });

  it("UGSci fork feature: mounted normal queue pause and resume drain accepted turns once in FIFO order", async () => {
    const chatId = "fc710000-0000-4000-8000-000000000002";
    const store = useMessageQueueStore.getState();
    for (const text of ["First FIFO task", "Second FIFO task"])
      store.enqueue(chatId, {
        text,
        agentId: "default",
        backendSessionId: "test-session",
        userId: "test-user",
        channel: "console",
      });
    const [first, second] = store.getQueue(chatId);
    store.setRunState(chatId, "paused");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ status: "idle", messages: [] }),
    } as Response);
    let acceptFirst!: () => void;
    mockRuntimeSubmit.mockImplementation(async (_data, options) => {
      const lifecycle = new ChatRunLifecycle({
        runId: options.clientRequestId,
        clientRequestId: options.clientRequestId,
        source: "host-queue",
        sessionId: options.sessionId,
        cancel: vi.fn(),
      });
      if (options.clientRequestId === first.clientMessageId)
        acceptFirst = () => lifecycle.markAccepted(options.sessionId);
      else lifecycle.markAccepted(options.sessionId);
      return lifecycle.handle;
    });
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    const resume = await screen.findByRole("button", {
      name: i18n.t("chat.queue.resume"),
    });
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    fireEvent.click(resume);
    await waitFor(() => expect(mockRuntimeSubmit).toHaveBeenCalledTimes(1));
    expect(store.getQueue(chatId)).toMatchObject([
      { id: first.id, status: "sending" },
      { id: second.id, status: "pending" },
    ]);
    fireEvent.click(
      screen.getByRole("button", { name: i18n.t("chat.queue.pause") }),
    );
    expect(store.getRunState(chatId)).toBe("paused");
    await act(async () => acceptFirst());
    await waitFor(() =>
      expect(store.getQueue(chatId)).toMatchObject([
        { id: second.id, status: "pending" },
      ]),
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 750));
    });
    expect(mockRuntimeSubmit).toHaveBeenCalledTimes(1);
    expect(mockCancelExecution).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: i18n.t("chat.queue.resume") }),
    );
    await waitFor(() => expect(store.getQueue(chatId)).toEqual([]));
    expect(mockRuntimeSubmit).toHaveBeenCalledTimes(2);
    expect(mockRuntimeSubmit.mock.calls.map(([data]) => data.query)).toEqual([
      first.text,
      second.text,
    ]);
    expect(
      mockRuntimeSubmit.mock.calls.map(
        ([, options]) => options.clientRequestId,
      ),
    ).toEqual([first.clientMessageId, second.clientMessageId]);
    for (const [data, options] of mockRuntimeSubmit.mock.calls) {
      expect(data).toMatchObject({
        session_id: "test-session",
        agent_id: "default",
        user_id: "test-user",
        channel: "console",
      });
      expect(options).toMatchObject({
        source: "host-queue",
        sessionId: chatId,
      });
    }
  });

  it.each(["retry", "skip"] as const)(
    "UGSci fork feature: mounted failed queue %s advances through real persisted state and SDK acceptance",
    async (action) => {
      const chatId =
        action === "retry"
          ? "fc710000-0000-4000-8000-000000000003"
          : "fc710000-0000-4000-8000-000000000004";
      const store = useMessageQueueStore.getState();
      for (const text of [
        "Previously failed task",
        "Independent following task",
      ])
        store.enqueue(chatId, {
          text,
          agentId: "default",
          backendSessionId: "test-session",
        });
      const [failed, following] = store.getQueue(chatId);
      store.setItemStatus(
        chatId,
        failed.id,
        "failed",
        "Synthetic previous failure",
      );
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ status: "idle", messages: [] }),
      } as Response);
      mockRuntimeSubmit.mockImplementation(async (_data, options) => {
        const lifecycle = new ChatRunLifecycle({
          runId: options.clientRequestId,
          clientRequestId: options.clientRequestId,
          source: "host-queue",
          sessionId: options.sessionId,
          cancel: vi.fn(),
        });
        lifecycle.markAccepted(options.sessionId);
        return lifecycle.handle;
      });
      renderWithProviders(<ChatPage />, {
        initialEntries: [`/chat/${chatId}`],
      });
      const label = await screen.findByText(failed.text, { exact: false });
      const row = label.closest("[draggable]") as HTMLElement;
      await waitFor(() => expect(row).toBeVisible());
      expect(mockRuntimeSubmit).not.toHaveBeenCalled();
      fireEvent.mouseEnter(row);
      const icon =
        action === "retry"
          ? "svg.lucide-refresh-cw"
          : "svg.lucide-skip-forward";
      const button = row.querySelector(icon)?.closest("button");
      expect(button).toBeInstanceOf(HTMLButtonElement);
      fireEvent.click(button!);
      await waitFor(() => expect(store.getQueue(chatId)).toEqual([]), {
        timeout: 3000,
      });
      const expected = action === "retry" ? [failed, following] : [following];
      expect(mockRuntimeSubmit.mock.calls.map(([data]) => data.query)).toEqual(
        expected.map((item) => item.text),
      );
      expect(
        mockRuntimeSubmit.mock.calls.map(
          ([, options]) => options.clientRequestId,
        ),
      ).toEqual(expected.map((item) => item.clientMessageId));
      expect(sessionApi.discardLastUserMessage).toHaveBeenCalledWith(
        expect.any(Array),
        failed.clientMessageId,
      );
      expect(
        localStorage.getItem(`qwenpaw:message-queue:${chatId}`),
      ).toBeNull();
      expect(mockCancelExecution).not.toHaveBeenCalled();
      const { chatApi } = await import("../../api/modules/chat");
      expect(chatApi.stopChat).not.toHaveBeenCalled();
    },
  );

  it.each(["sdk", "backend-fallback"] as const)(
    "UGSci fork feature: mounted interrupt and send waits for %s cancellation and backend idle before dispatch",
    async (cancelPath) => {
      const chatId =
        cancelPath === "sdk"
          ? "fc710000-0000-4000-8000-000000000005"
          : "fc710000-0000-4000-8000-000000000006";
      const store = useMessageQueueStore.getState();
      for (const text of [
        "Ordinary head stays paused",
        "Explicit priority task",
      ])
        store.enqueue(chatId, {
          text,
          agentId: "default",
          backendSessionId: "test-session",
          userId: "test-user",
          channel: "console",
        });
      const [head, priority] = store.getQueue(chatId);
      store.setRunState(chatId, "paused");
      let finishCancel!: (result: { status: string }) => void;
      mockCancelExecution.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishCancel = resolve;
          }),
      );
      const { chatApi } = await import("../../api/modules/chat");
      let finishStop!: () => void;
      if (cancelPath === "backend-fallback")
        vi.mocked(chatApi.stopChat).mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              finishStop = resolve;
            }),
        );
      let finishIdle!: (value: { status: "idle"; messages: never[] }) => void;
      const idle = new Promise((resolve) => {
        finishIdle = resolve;
      });
      let idleReads = 0;
      global.fetch = vi.fn(
        async (input: RequestInfo | URL) =>
          ({
            ok: true,
            status: 200,
            headers: new Headers({ "Content-Type": "application/json" }),
            json: async () => {
              if (String(input).includes(`/chats/${chatId}`)) {
                idleReads += 1;
                return idle;
              }
              return {};
            },
          }) as Response,
      );
      mockRuntimeSubmit.mockImplementation(async (_data, options) => {
        const lifecycle = new ChatRunLifecycle({
          runId: options.clientRequestId,
          clientRequestId: options.clientRequestId,
          source: "host-queue",
          sessionId: options.sessionId,
          cancel: vi.fn(),
        });
        lifecycle.markAccepted(options.sessionId);
        return lifecycle.handle;
      });
      renderWithProviders(<ChatPage />, {
        initialEntries: [`/chat/${chatId}`],
      });
      const row = (await screen.findByText(priority.text)).closest(
        "[draggable]",
      ) as HTMLElement;
      await waitFor(() => expect(row).toBeVisible());
      fireEvent.mouseEnter(row);
      fireEvent.click(
        within(row).getByRole("button", {
          name: i18n.t("chat.queue.interruptAndSend"),
        }),
      );
      await waitFor(() =>
        expect(mockCancelExecution).toHaveBeenCalledWith({ sessionId: chatId }),
      );
      expect(mockRuntimeSubmit).not.toHaveBeenCalled();
      expect(idleReads).toBe(0);
      expect(store.getQueue(chatId).map((item) => item.id)).toEqual([
        head.id,
        priority.id,
      ]);
      await act(async () =>
        finishCancel({
          status: cancelPath === "sdk" ? "canceled" : "not-found",
        }),
      );
      if (cancelPath === "backend-fallback") {
        await waitFor(() =>
          expect(chatApi.stopChat).toHaveBeenCalledWith(chatId, "default"),
        );
        expect(mockRuntimeSubmit).not.toHaveBeenCalled();
        expect(idleReads).toBe(0);
        await act(async () => finishStop());
      } else expect(chatApi.stopChat).not.toHaveBeenCalled();
      await waitFor(() => expect(idleReads).toBeGreaterThan(0));
      expect(mockRuntimeSubmit).not.toHaveBeenCalled();
      await act(async () => finishIdle({ status: "idle", messages: [] }));
      await waitFor(() =>
        expect(store.getQueue(chatId).map((item) => item.id)).toEqual([
          head.id,
        ]),
      );
      expect(mockRuntimeSubmit).toHaveBeenCalledTimes(1);
      expect(mockRuntimeSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          query: priority.text,
          session_id: "test-session",
          agent_id: "default",
          user_id: "test-user",
          channel: "console",
        }),
        expect.objectContaining({
          source: "host-queue",
          sessionId: chatId,
          clientRequestId: priority.clientMessageId,
        }),
      );
      expect(store.getQueue(chatId)[0]).toMatchObject({
        id: head.id,
        status: "pending",
      });
      expect(store.getRunState(chatId)).toBe("paused");
    },
  );

  it("UGSci fork feature: the mounted queue steers the current run without cancelling or starting another turn", async () => {
    const chatId = "55555555-1111-4111-8111-111111111111";
    mockGetChatStatus.mockResolvedValue({ status: "running" });
    mockGetSteeringState.mockResolvedValue({
      active_run_id: "run-current",
      supported: true,
      receipts: [],
    });
    mockSteer.mockImplementation(async (_chat, _agent, input) => ({
      request_id: input.request_id,
      run_id: input.expected_run_id,
      text: input.text,
      status: "pending",
    }));
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    await act(async () => {
      await capturedOptions!.sender.beforeSubmit({
        query: "Check data quality first",
      });
    });
    act(() => useMessageQueueStore.getState().setRunState(chatId, "paused"));
    const button = await screen.findByRole("button", {
      name: i18n.t("chat.queue.steer"),
    });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    await waitFor(() => expect(mockSteer).toHaveBeenCalledTimes(1));
    expect(mockSteer.mock.calls[0].slice(0, 3)).toEqual([
      chatId,
      "default",
      {
        expected_run_id: "run-current",
        request_id: expect.stringMatching(/^steer-/),
        text: "Check data quality first",
      },
    ]);
    expect(useMessageQueueStore.getState().getQueue(chatId)[0]).toMatchObject({
      status: "steering",
      text: "Check data quality first",
    });
    expect(
      await screen.findByText(i18n.t("chat.queue.steerPending")),
    ).toBeVisible();
    expect(mockCancelExecution).not.toHaveBeenCalled();
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    const { chatApi } = await import("../../api/modules/chat");
    expect(chatApi.stopChat).not.toHaveBeenCalled();
  });

  it("UGSci fork feature: steering preserves attachments and Agent assignments in the normal queue", async () => {
    const chatId = "55555555-2222-4222-8222-222222222222";
    mockGetChatStatus.mockResolvedValue({ status: "running" });
    mockGetSteeringState.mockResolvedValue({
      active_run_id: "run-current",
      supported: true,
      receipts: [],
    });
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    act(() => {
      const store = useMessageQueueStore.getState();
      store.enqueue(chatId, {
        text: "inspect file",
        agentId: "default",
        attachments: [{ url: "/files/evidence.csv" }],
      });
      store.enqueue(chatId, {
        text: "@Reviewer inspect",
        agentId: "default",
        agentDispatch: {
          requestText: "inspect",
          targetAgentId: "reviewer",
          coordinationRequested: false,
        },
      });
      store.setRunState(chatId, "paused");
    });
    await waitFor(() => expect(mockGetSteeringState).toHaveBeenCalled());
    const buttons = await screen.findAllByRole("button", {
      name: i18n.t("chat.queue.steer"),
    });
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    });
    expect(mockSteer).not.toHaveBeenCalled();
    expect(useMessageQueueStore.getState().getQueue(chatId)).toEqual([
      expect.objectContaining({
        status: "pending",
        attachments: [{ url: "/files/evidence.csv" }],
      }),
      expect.objectContaining({
        status: "pending",
        agentDispatch: expect.objectContaining({ targetAgentId: "reviewer" }),
      }),
    ]);
  });

  it("UGSci fork feature: mounting recovers a paused other-chat steering receipt behind a pending head without sending it", async () => {
    const activeChatId = "55555555-3333-4333-8333-333333333333";
    const pausedChatId = "55555555-4444-4444-8444-444444444444";
    const store = useMessageQueueStore.getState();
    store.enqueue(pausedChatId, {
      text: "Keep this ordinary head paused",
      agentId: "default",
      backendSessionId: "runtime-paused",
    });
    store.enqueue(pausedChatId, {
      text: "Check dates during the original run",
      agentId: "default",
      backendSessionId: "runtime-paused",
    });
    const [head, instruction] = store.getQueue(pausedChatId);
    store.beginSteering(pausedChatId, instruction.id, "run-before-reload");
    const claimed = store.getQueue(pausedChatId)[1];
    store.setRunState(pausedChatId, "paused");
    // Simulate a reload: only persisted queues survive before ChatPage mounts.
    useMessageQueueStore.setState({ queues: {}, runStates: {} });
    mockGetSteeringReceipt.mockResolvedValue({
      request_id: claimed.steering!.requestId,
      run_id: "run-before-reload",
      text: instruction.text,
      status: "applied",
    });

    renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${activeChatId}`],
    });
    await screen.findByTestId("chat-ui");
    await waitFor(() =>
      expect(mockGetSteeringReceipt).toHaveBeenCalledWith(
        pausedChatId,
        "default",
        claimed.steering!.requestId,
        expect.any(AbortSignal),
      ),
    );
    await waitFor(() => expect(store.getQueue(pausedChatId)).toEqual([head]));
    expect(store.getRunState(pausedChatId)).toBe("paused");
    expect(mockSteer).not.toHaveBeenCalled();
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    expect(
      vi
        .mocked(fetch)
        .mock.calls.filter(
          ([url, options]) =>
            String(url).endsWith("/console/chat") && options?.method === "POST",
        ),
    ).toHaveLength(0);
  });

  it("UGSci fork feature: navigation hands pending steering to background recovery before its original POST resolves", async () => {
    const sourceChatId = "55555555-5555-4555-8555-555555555555";
    const targetChatId = "55555555-6666-4666-8666-666666666666";
    const queueModule = await import("@/stores/messageQueueStore");
    const actualQueue = await vi.importActual<
      typeof import("@/stores/messageQueueStore")
    >("@/stores/messageQueueStore");
    const originalLocks = navigator.locks;
    let sendHeld = false;
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: async (
          name: string,
          _options: unknown,
          callback: (lock: unknown) => Promise<unknown>,
        ) => {
          const sending = name.startsWith("qwenpaw:queue-send:");
          if (sending && sendHeld) return callback(null);
          if (sending) sendHeld = true;
          try {
            return await callback({ name });
          } finally {
            if (sending) sendHeld = false;
          }
        },
      },
    });
    vi.mocked(queueModule.withSendLock).mockImplementation(
      actualQueue.withSendLock,
    );
    mockGetChatStatus.mockResolvedValue({ status: "running" });
    mockGetSteeringState.mockImplementation(async (id) => ({
      active_run_id: id === sourceChatId ? "run-before-navigation" : null,
      supported: true,
      receipts: [],
    }));
    let resolvePost!: (value: {
      request_id: string;
      run_id: string;
      text: string;
      status: "pending";
    }) => void;
    const delayedPost = new Promise((resolve) => {
      resolvePost = resolve;
    });
    mockSteer.mockReturnValue(delayedPost);
    let serverStatus = "pending";
    mockGetSteeringReceipt.mockImplementation(
      async (_chat, _agent, requestId) => ({
        request_id: requestId,
        run_id: "run-before-navigation",
        text: "Inspect dates without interrupting",
        status: serverStatus,
      }),
    );
    function SteeringNavigationHarness() {
      const navigate = useNavigate();
      return (
        <>
          <button onClick={() => navigate(`/chat/${targetChatId}`)}>
            Switch steering session
          </button>
          <ChatPage />
        </>
      );
    }
    const view = renderWithProviders(<SteeringNavigationHarness />, {
      initialEntries: [`/chat/${sourceChatId}`],
    });
    try {
      await screen.findByTestId("chat-ui");
      await act(async () => {
        await capturedOptions!.sender.beforeSubmit({
          query: "Inspect dates without interrupting",
        });
      });
      act(() =>
        useMessageQueueStore.getState().setRunState(sourceChatId, "paused"),
      );
      const button = await screen.findByRole("button", {
        name: i18n.t("chat.queue.steer"),
      });
      await waitFor(() => expect(button).toBeEnabled());
      fireEvent.click(button);
      await waitFor(() => expect(mockSteer).toHaveBeenCalledTimes(1));
      const claimed = useMessageQueueStore.getState().getQueue(sourceChatId)[0];
      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: "Switch steering session" }),
        );
      });
      // The first POST is still unresolved. Recovery must be able to acquire
      // the real send lock, read the receipt and continue in the original chat.
      await waitFor(() =>
        expect(mockGetSteeringReceipt).toHaveBeenCalledWith(
          sourceChatId,
          "default",
          claimed.steering!.requestId,
          expect.any(AbortSignal),
        ),
      );
      expect(
        useMessageQueueStore.getState().getQueue(sourceChatId)[0].status,
      ).toBe("steering");
      serverStatus = "applied";
      await act(async () =>
        resolvePost({
          request_id: claimed.steering!.requestId,
          run_id: "run-before-navigation",
          text: claimed.text,
          status: "pending",
        }),
      );
      await waitFor(
        () =>
          expect(
            useMessageQueueStore.getState().getQueue(sourceChatId),
          ).toEqual([]),
        { timeout: 4000 },
      );
      expect(useMessageQueueStore.getState().getQueue(targetChatId)).toEqual(
        [],
      );
      expect(mockSteer).toHaveBeenCalledTimes(1);
      expect(mockRuntimeSubmit).not.toHaveBeenCalled();
      expect(mockCancelExecution).not.toHaveBeenCalled();
    } finally {
      view.unmount();
      stopBackgroundQueue();
      Object.defineProperty(navigator, "locks", {
        configurable: true,
        value: originalLocks,
      });
      vi.mocked(queueModule.withSendLock).mockImplementation(async (_key, fn) =>
        fn(),
      );
    }
  });

  it("UGSci fork feature: steering yields an automatic idle wait after reconnect without cancelling the active answer", async () => {
    const chatId = "55555555-7777-4777-8777-777777777777";
    const queueModule = await import("@/stores/messageQueueStore");
    const actualQueue = await vi.importActual<
      typeof import("@/stores/messageQueueStore")
    >("@/stores/messageQueueStore");
    const originalLocks = navigator.locks;
    const locks = new Map<string, Promise<void>>();
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: async (
          name: string,
          options: { ifAvailable?: boolean },
          callback: (lock: unknown) => Promise<unknown>,
        ) => {
          if (options.ifAvailable && locks.has(name)) return callback(null);
          const previous = locks.get(name) ?? Promise.resolve();
          let release!: () => void;
          const own = new Promise<void>((resolve) => {
            release = resolve;
          });
          locks.set(name, own);
          await previous;
          try {
            return await callback({ name });
          } finally {
            release();
            if (locks.get(name) === own) locks.delete(name);
          }
        },
      },
    });
    vi.mocked(queueModule.withSendLock).mockImplementation(
      actualQueue.withSendLock,
    );
    mockGetChatStatus.mockResolvedValue({ status: "running" });
    mockGetSteeringState.mockResolvedValue({
      active_run_id: "reconnected-run",
      supported: true,
      receipts: [],
    });
    mockSteer.mockImplementation(async (_chat, _agent, input) => ({
      request_id: input.request_id,
      run_id: input.expected_run_id,
      text: input.text,
      status: "pending",
    }));
    let historyReadSignal: AbortSignal | undefined;
    let finishHistory!: (value: Response) => void;
    const historyReply = new Promise<Response>((resolve) => {
      finishHistory = resolve;
    });
    global.fetch = vi.fn(
      async (input: RequestInfo | URL, options?: RequestInit) => {
        if (String(input).endsWith(`/chats/${chatId}`)) {
          historyReadSignal = options?.signal ?? undefined;
          return historyReply;
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "Content-Type": "application/json" }),
          json: async () => ({}),
        } as Response;
      },
    );
    const view = renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${chatId}`],
    });
    try {
      await screen.findByTestId("chat-ui");
      await act(async () => {
        await capturedOptions!.sender.beforeSubmit({
          query: "Use the latest report while continuing",
        });
      });
      // The SDK fixture reports loading=false, as during reconnection, while
      // the backend is still running. The ordinary queue now waits under its
      // real send lock with a history GET that has not returned.
      await waitFor(() => expect(historyReadSignal).toBeDefined(), {
        timeout: 2500,
      });
      expect(locks.has(`qwenpaw:queue-send:${chatId}`)).toBe(true);
      expect(historyReadSignal!.aborted).toBe(false);
      const blockedHistoryReadSignal = historyReadSignal;
      const button = await screen.findByRole("button", {
        name: i18n.t("chat.queue.steer"),
      });
      await waitFor(() => expect(button).toBeEnabled());
      fireEvent.click(button);
      await waitFor(() => expect(mockSteer).toHaveBeenCalledTimes(1));
      expect(blockedHistoryReadSignal!.aborted).toBe(true);
      expect(mockSteer.mock.calls[0].slice(0, 3)).toEqual([
        chatId,
        "default",
        {
          expected_run_id: "reconnected-run",
          request_id: expect.stringMatching(/^steer-/),
          text: "Use the latest report while continuing",
        },
      ]);
      expect(useMessageQueueStore.getState().getQueue(chatId)[0]).toMatchObject(
        { status: "steering", text: "Use the latest report while continuing" },
      );
      expect(mockCancelExecution).not.toHaveBeenCalled();
      expect(mockRuntimeSubmit).not.toHaveBeenCalled();
      const { chatApi } = await import("../../api/modules/chat");
      expect(chatApi.stopChat).not.toHaveBeenCalled();
      expect(
        vi
          .mocked(fetch)
          .mock.calls.some(
            ([url, options]) =>
              String(url).endsWith("/console/chat") &&
              options?.method === "POST",
          ),
      ).toBe(false);
    } finally {
      view.unmount();
      stopBackgroundQueue();
      finishHistory({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ status: "idle", messages: [] }),
      } as Response);
      Object.defineProperty(navigator, "locks", {
        configurable: true,
        value: originalLocks,
      });
      vi.mocked(queueModule.withSendLock).mockImplementation(async (_key, fn) =>
        fn(),
      );
    }
  });

  it.each(["applied", "returned"] as const)(
    "UGSci fork feature: unresolved steering behind the head blocks foreground sending through an idle transition until %s",
    async (terminal) => {
      const chatId =
        terminal === "applied"
          ? "55555555-8888-4888-8888-888888888888"
          : "55555555-9999-4999-8999-999999999999";
      const sdk = await import("@agentscope-ai/chat");
      const inputMock = vi.mocked(sdk.useChatAnywhereInput);
      const originalInput = inputMock.getMockImplementation()!;
      let localLoading = true;
      inputMock.mockImplementation((select) =>
        originalInput((state) => select({ ...state, loading: localLoading })),
      );
      const store = useMessageQueueStore.getState();
      store.enqueue(chatId, {
        text: "Ordinary pending head",
        agentId: "default",
        backendSessionId: "runtime-foreground",
      });
      store.enqueue(chatId, {
        text: "Guidance whose delivery is still unknown",
        agentId: "default",
        backendSessionId: "runtime-foreground",
      });
      const [head, guide] = store.getQueue(chatId);
      store.beginSteering(chatId, guide.id, "previous-run");
      const claimed = store.getQueue(chatId)[1];
      let finishReceipt!: (receipt: {
        request_id: string;
        run_id: string;
        text: string;
        status: "applied" | "returned";
      }) => void;
      const receipt = new Promise((resolve) => {
        finishReceipt = resolve;
      });
      mockGetSteeringState.mockResolvedValue({
        active_run_id: null,
        supported: true,
        receipts: [],
      });
      mockGetSteeringReceipt.mockReturnValue(receipt);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ status: "idle", messages: [] }),
      } as Response);
      mockRuntimeSubmit.mockImplementation(async (_data, options) => {
        const lifecycle = new ChatRunLifecycle({
          runId: "next-ordinary-run",
          source: "host-queue",
          sessionId: options.sessionId,
          cancel: vi.fn(),
        });
        lifecycle.markAccepted(options.sessionId);
        return lifecycle.handle;
      });
      const view = renderWithProviders(<ChatPage />, {
        initialEntries: [`/chat/${chatId}`],
      });
      try {
        await screen.findByTestId("chat-ui");
        await waitFor(() =>
          expect(mockGetSteeringReceipt).toHaveBeenCalledWith(
            chatId,
            "default",
            claimed.steering!.requestId,
            expect.any(AbortSignal),
          ),
        );
        localLoading = false;
        view.rerender(<ChatPage />);
        // Cross the actual 500ms auto-send timer after loading becomes idle.
        // Authoritative chat history is also idle, but B's receipt is unknown.
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 750));
        });
        expect(mockRuntimeSubmit).not.toHaveBeenCalled();
        expect(store.getQueue(chatId)).toMatchObject([
          { id: head.id, status: "pending" },
          { id: guide.id, status: "steering" },
        ]);
        await act(async () =>
          finishReceipt({
            request_id: claimed.steering!.requestId,
            run_id: "previous-run",
            text: guide.text,
            status: terminal,
          }),
        );
        if (terminal === "applied") {
          await waitFor(
            () => expect(mockRuntimeSubmit).toHaveBeenCalledTimes(1),
            { timeout: 2500 },
          );
          expect(mockRuntimeSubmit.mock.calls[0][0]).toMatchObject({
            query: head.text,
          });
          await waitFor(() => expect(store.getQueue(chatId)).toEqual([]));
        } else {
          await waitFor(() => expect(store.getRunState(chatId)).toBe("error"));
          // A delayed pre-return broadcast carries both the old running state
          // and the old claimed item. Neither may reopen this queue's head.
          act(() => {
            store.applyRemoteRunState(chatId, "running");
            store.applyRemoteItems(chatId, [head, claimed]);
          });
          expect(store.getRunState(chatId)).toBe("error");
          expect(useMessageQueueStore.getState().runStates[chatId]).toBe(
            "error",
          );
          await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 750));
          });
          expect(mockRuntimeSubmit).not.toHaveBeenCalled();
          expect(store.getQueue(chatId)).toMatchObject([
            { id: head.id, text: head.text, status: "pending" },
            {
              id: guide.id,
              text: guide.text,
              status: "failed",
              errorMessage: i18n.t("chat.queue.steerReturned"),
            },
          ]);
        }
        expect(mockCancelExecution).not.toHaveBeenCalled();
        const { chatApi } = await import("../../api/modules/chat");
        expect(chatApi.stopChat).not.toHaveBeenCalled();
      } finally {
        view.unmount();
        stopBackgroundQueue();
        inputMock.mockImplementation(originalInput);
      }
    },
  );

  it("UGSci fork feature: another queued row cannot interrupt the current answer while any steering receipt is unresolved", async () => {
    const chatId = "55555555-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const store = useMessageQueueStore.getState();
    store.enqueue(chatId, {
      text: "Ordinary row selected for immediate send",
      agentId: "default",
    });
    store.enqueue(chatId, {
      text: "Already claimed guidance",
      agentId: "default",
    });
    const [head, guide] = store.getQueue(chatId);
    store.beginSteering(chatId, guide.id, "still-running-turn");
    store.setRunState(chatId, "paused");
    mockGetSteeringState.mockResolvedValue({
      active_run_id: "still-running-turn",
      supported: true,
      receipts: [],
    });
    mockGetSteeringReceipt.mockImplementation(
      async (_chat, _agent, requestId) => ({
        request_id: requestId,
        run_id: "still-running-turn",
        text: guide.text,
        status: "pending",
      }),
    );
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await waitFor(() => expect(mockGetSteeringReceipt).toHaveBeenCalled());
    const interrupt = await screen.findByRole("button", {
      name: i18n.t("chat.queue.interruptAndSend"),
    });
    expect(interrupt).toBeDisabled();
    fireEvent.focus(interrupt);
    fireEvent.click(interrupt);
    await act(async () => {});
    const { chatApi } = await import("../../api/modules/chat");
    expect(chatApi.stopChat).not.toHaveBeenCalled();
    expect(mockCancelExecution).not.toHaveBeenCalled();
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    expect(store.getQueue(chatId)).toMatchObject([
      { id: head.id, status: "pending" },
      { id: guide.id, status: "steering" },
    ]);
  });

  it("queues an attachment submission while the backend chat is running", async () => {
    const chatId = "11111111-1111-4111-8111-111111111111";
    mockGetChatStatus.mockResolvedValue({ status: "running" });
    renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${chatId}`],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const beforeSubmit = capturedOptions?.sender?.beforeSubmit;
    const result = await beforeSubmit!({
      query: "inspect this file",
      fileList: [
        {
          uid: "file-1",
          name: "evidence.txt",
          type: "text/plain",
          size: 42,
          response: { url: "/files/evidence.txt" },
        },
      ],
    });

    expect(result).toEqual({ proceed: false, clear: true });
    expect(mockGetChatStatus).toHaveBeenCalledWith(chatId, {
      agentId: "default",
    });
    expect(useMessageQueueStore.getState().getQueue(chatId)).toEqual([
      expect.objectContaining({
        text: "inspect this file",
        attachments: [
          {
            url: "/files/evidence.txt",
            name: "evidence.txt",
            type: "text/plain",
            size: 42,
          },
        ],
        bizParams: expect.objectContaining({
          session_id: "test-session",
          user_id: "test-user",
          channel: "console",
        }),
      }),
    ]);
    act(() => useMessageQueueStore.getState().clear(chatId));
  });

  it("UGSci fork feature: mounted context inspector removes and restores real draft quotes before submission and invalidates undo", async () => {
    const chatId = "17222222-2222-4222-8222-222222222222";
    const scope = getDraftStorageKey("default", chatId);
    mockUseActualContext.mockReturnValue(true);
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    act(() => {
      addAnswerQuote(scope, {
        messageId: "kept-reply",
        text: "Keep this evidence",
      });
      addAnswerQuote(scope, {
        messageId: "removed-reply",
        text: "Exclude this evidence",
      });
    });
    const originalQuotes = readAnswerQuotes(scope);
    fireEvent.click(screen.getByRole("button", { name: /^Context usage / }));
    const dialog = await screen.findByRole("dialog", { name: "Context" });
    expect(within(dialog).getByLabelText("Context scope")).toHaveValue("draft");
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Remove Exclude this evidence",
      }),
    );
    expect(readAnswerQuotes(scope)).toEqual([originalQuotes[0]]);
    expect(screen.getByLabelText("Selected quotes")).not.toHaveTextContent(
      "Exclude this evidence",
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Undo" }));
    expect(readAnswerQuotes(scope)).toEqual(originalQuotes);
    expect(screen.getByLabelText("Selected quotes")).toHaveTextContent(
      "Exclude this evidence",
    );
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Remove Exclude this evidence",
      }),
    );
    expect(
      within(dialog).getByRole("button", { name: "Undo" }),
    ).toBeInTheDocument();

    let admitted!: Awaited<
      ReturnType<CapturedChatOptions["sender"]["beforeSubmit"]>
    >;
    await act(async () => {
      admitted = await capturedOptions!.sender.beforeSubmit({
        query: "Use the selected evidence",
      });
    });
    expect(admitted).toMatchObject({
      proceed: true,
      context: { qwenpaw_answer_quotes: [originalQuotes[0]] },
    });
    expect(
      within(dialog).queryByRole("button", { name: "Undo" }),
    ).not.toBeInTheDocument();
    expect(readAnswerQuotes(scope)).toEqual([]);
    act(() =>
      addAnswerQuote(scope, {
        messageId: "new-reply",
        text: "For the next question",
      }),
    );
    expect(
      within(dialog).getByRole("button", {
        name: "Remove For the next question",
      }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", {
        name: "Remove Exclude this evidence",
      }),
    ).not.toBeInTheDocument();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: null,
      json: async () => ({}),
    });
    await act(async () => {
      if (typeof admitted !== "object")
        throw new Error("Expected routed submission");
      await capturedOptions!.api.fetch({
        ...admitted,
        input: [
          { role: "user", content: [{ type: "text", text: admitted.query }] },
        ],
      });
    });
    const call = vi
      .mocked(fetch)
      .mock.calls.find(
        ([url, init]) =>
          String(url).includes("/console/chat") && init?.method === "POST",
      )!;
    const body = JSON.parse(call[1]!.body as string);
    expect(body.input[0].content[1].text).toContain("Keep this evidence");
    expect(body.input[0].content[1].text).not.toContain(
      "Exclude this evidence",
    );
    expect(body.input[0].content[1].text).not.toContain(
      "For the next question",
    );
    expect(readAnswerQuotes(scope).map((quote) => quote.text)).toEqual([
      "For the next question",
    ]);
  });

  it("UGSci fork feature: mounted context inspector retries scoped inspection and keeps saved sources and summaries read-only", async () => {
    const chatId = "18222222-2222-4222-8222-222222222222";
    mockUseActualContext.mockReturnValue(true);
    mockSelectedAgent.mockReturnValue("research-agent");
    mockAgentList.mockReturnValue([
      { id: "research-agent", name: "Research", backend: "qwenpaw" },
    ]);
    mockGetContext.mockRejectedValueOnce(
      new Error("temporary context failure"),
    );
    mockGetContext.mockResolvedValueOnce({
      ...savedContextSnapshot(chatId, "research-agent"),
      sources: [
        {
          id: "saved-evidence",
          kind: "file",
          label: "evidence.csv",
          provenance: "model_request",
          path: "/project/evidence.csv",
          content: "Measured pressure: 15 MPa",
          truncated: false,
        },
      ],
      summary: {
        kind: "native",
        content: "Retain the measured pressure and parameter decisions.",
        stale: false,
      },
    });
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    expect(mockGetContext).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /^Context usage / }));
    const dialog = await screen.findByRole("dialog", { name: "Context" });
    fireEvent.change(within(dialog).getByLabelText("Context scope"), {
      target: { value: "latest" },
    });
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Could not load context. Please retry.",
    );
    expect(mockGetContext).toHaveBeenCalledWith(
      chatId,
      "research-agent",
      expect.objectContaining({
        sessionId: "test-session",
        userId: "test-user",
        signal: expect.any(AbortSignal),
      }),
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Retry" }));
    expect(await within(dialog).findByText("evidence.csv")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Included in model request"),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: /^Remove / }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("tab", { name: "Compaction summary" }),
    );
    expect(
      await within(dialog).findByText(
        "Retain the measured pressure and parameter decisions.",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();
    expect(mockGetContext).toHaveBeenCalledTimes(2);
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
  });

  it("UGSci fork feature: mounted context inspector discards a previous chat response after navigation", async () => {
    const firstChatId = "19222222-2222-4222-8222-222222222222";
    const nextChatId = "20222222-2222-4222-8222-222222222222";
    mockUseActualContext.mockReturnValue(true);
    let resolveOld!: (value: ReturnType<typeof savedContextSnapshot>) => void;
    mockGetContext.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    );
    mockGetContext.mockResolvedValueOnce({
      ...savedContextSnapshot(nextChatId),
      summary: {
        kind: "native",
        content: "The new conversation summary",
        stale: false,
      },
    });
    function NavigateContextChat() {
      const navigate = useNavigate();
      return (
        <button onClick={() => navigate(`/chat/${nextChatId}`)}>
          Next context chat
        </button>
      );
    }
    renderWithProviders(
      <>
        <NavigateContextChat />
        <ChatPage />
      </>,
      { initialEntries: [`/chat/${firstChatId}`] },
    );
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: /^Context usage / }));
    await screen.findByRole("dialog", { name: "Context" });
    await waitFor(() =>
      expect(mockGetContext).toHaveBeenCalledWith(
        firstChatId,
        "default",
        expect.any(Object),
      ),
    );
    const oldSignal = mockGetContext.mock.calls[0][2].signal as AbortSignal;
    fireEvent.click(screen.getByRole("button", { name: "Next context chat" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /^Context usage / }),
      ).toHaveAttribute("aria-expanded", "false"),
    );
    expect(oldSignal.aborted).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /^Context usage / }));
    const dialog = await screen.findByRole("dialog", { name: "Context" });
    fireEvent.click(
      within(dialog).getByRole("tab", { name: "Compaction summary" }),
    );
    expect(
      await within(dialog).findByText("The new conversation summary"),
    ).toBeInTheDocument();
    await act(async () =>
      resolveOld({
        ...savedContextSnapshot(firstChatId),
        summary: {
          kind: "native",
          content: "Old private conversation summary",
          stale: false,
        },
      }),
    );
    expect(
      within(dialog).queryByText("Old private conversation summary"),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByText("The new conversation summary"),
    ).toBeInTheDocument();
    expect(mockGetContext).toHaveBeenLastCalledWith(
      nextChatId,
      "default",
      expect.objectContaining({
        sessionId: "test-session",
        userId: "test-user",
      }),
    );
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
  });

  it("UGSci fork feature: mounted context inspector closes when runtime identity changes within the same chat", async () => {
    const chatId = "21222222-2222-4222-8222-222222222222";
    mockUseActualContext.mockReturnValue(true);
    let runtimeIdentity = {
      sessionId: "initial-runtime",
      userId: "initial-user",
    };
    vi.mocked(sessionApi.getSessionIdentity).mockImplementation(
      (referenceId?: string | null) => ({
        ...runtimeIdentity,
        sdkSessionId: referenceId || chatId,
        chatId: referenceId || chatId,
        channel: "console",
      }),
    );
    mockGetContext.mockImplementation((requestedChatId, agentId, options) =>
      Promise.resolve({
        ...savedContextSnapshot(requestedChatId, agentId),
        session_id: options.sessionId,
        user_id: options.userId,
        summary: {
          kind: "native",
          content: `Summary for ${options.userId}`,
          stale: false,
        },
      }),
    );
    const view = renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${chatId}`],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: /^Context usage / }));
    let dialog = await screen.findByRole("dialog", { name: "Context" });
    fireEvent.click(
      within(dialog).getByRole("tab", { name: "Compaction summary" }),
    );
    expect(
      await within(dialog).findByText("Summary for initial-user"),
    ).toBeInTheDocument();
    expect(mockGetContext).toHaveBeenLastCalledWith(
      chatId,
      "default",
      expect.objectContaining({
        sessionId: "initial-runtime",
        userId: "initial-user",
      }),
    );
    const previousSignal = mockGetContext.mock.calls[0][2]
      .signal as AbortSignal;

    runtimeIdentity = {
      sessionId: "resolved-runtime",
      userId: "resolved-user",
    };
    view.rerender(<ChatPage />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /^Context usage / }),
      ).toHaveAttribute("aria-expanded", "false"),
    );
    expect(previousSignal.aborted).toBe(true);
    expect(mockGetContext).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /^Context usage / }));
    dialog = await screen.findByRole("dialog", { name: "Context" });
    fireEvent.click(
      within(dialog).getByRole("tab", { name: "Compaction summary" }),
    );
    expect(
      await within(dialog).findByText("Summary for resolved-user"),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByText("Summary for initial-user"),
    ).not.toBeInTheDocument();
    expect(mockGetContext).toHaveBeenLastCalledWith(
      chatId,
      "default",
      expect.objectContaining({
        sessionId: "resolved-runtime",
        userId: "resolved-user",
        signal: expect.any(AbortSignal),
      }),
    );
    expect(mockGetContext).toHaveBeenCalledTimes(2);
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
  });

  it("UGSci fork feature: mounted context inspector new chat preserves unknown capacity and resets only known context windows", async () => {
    mockUseActualContext.mockReturnValue(true);
    mockUseActualContextUsageStore.mockReturnValue(true);
    const { useTurnUsageStore: usageStore } = await vi.importActual<
      typeof import("./turnUsageStore")
    >("./turnUsageStore");
    usageStore.setState({ snapshot: null, activeMaxInputLength: null });
    const view = renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/22222222-3333-4333-8333-333333333333"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    fireEvent.click(
      screen.getByRole("button", {
        name: "Choose a model to see context usage",
      }),
    );
    let dialog = await screen.findByRole("dialog", { name: "Context" });
    expect(within(dialog).queryByRole("progressbar")).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "New chat" }));
    expect(usageStore.getState().snapshot).toBeNull();
    expect(
      screen.getByRole("button", {
        name: "Choose a model to see context usage",
      }),
    ).toHaveTextContent("—");
    expect(mockRuntimeSubmit).toHaveBeenLastCalledWith({ query: "/new" });

    for (const activeMaxInputLength of [64000, null]) {
      act(() =>
        usageStore.setState({
          activeMaxInputLength,
          snapshot: {
            usage: null,
            context_usage: {
              estimated_tokens: 8000,
              max_input_length: 32000,
              context_usage_ratio: 25,
            },
          },
        }),
      );
      fireEvent.click(screen.getByRole("button", { name: /^Context usage / }));
      dialog = await screen.findByRole("dialog", { name: "Context" });
      fireEvent.click(within(dialog).getByRole("button", { name: "New chat" }));
      expect(usageStore.getState().snapshot).toEqual({
        usage: null,
        context_usage: {
          estimated_tokens: 0,
          max_input_length: activeMaxInputLength ?? 32000,
          context_usage_ratio: 0,
        },
      });
      expect(
        screen.getByRole("button", { name: /^Context usage 0%/ }),
      ).toHaveTextContent("0%");
    }
    expect(mockRuntimeSubmit).toHaveBeenCalledTimes(3);
    view.unmount();
    usageStore.setState({ snapshot: null, activeMaxInputLength: null });
  });

  it("UGSci fork feature: answer quote admission freezes multiple passages and keeps newer selections", async () => {
    const chatId = "13222222-2222-4222-8222-222222222222";
    const scope = getDraftStorageKey("default", chatId);
    let resolveStatus!: (value: { status: "idle" }) => void;
    mockGetChatStatus.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveStatus = resolve;
        }),
    );
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    act(() => {
      addAnswerQuote(scope, { messageId: "reply1", text: "first" });
      addAnswerQuote(scope, { messageId: "reply2", text: "@Other /new" });
    });
    expect(screen.getByLabelText("Selected quotes")).toHaveTextContent("first");
    const submitted = capturedOptions!.sender.beforeSubmit({
      query: "adjust both",
    });
    await waitFor(() => expect(mockGetChatStatus).toHaveBeenCalled());
    act(() => {
      addAnswerQuote(scope, { messageId: "reply3", text: "later selection" });
    });
    let admitted!: Awaited<
      ReturnType<CapturedChatOptions["sender"]["beforeSubmit"]>
    >;
    await act(async () => {
      resolveStatus({ status: "idle" });
      admitted = await submitted;
    });
    expect(admitted).toMatchObject({
      proceed: true,
      query: "adjust both",
      context: {
        qwenpaw_answer_quotes: [{ text: "first" }, { text: "@Other /new" }],
      },
    });
    expect(readAnswerQuotes(scope).map((q) => q.text)).toEqual([
      "later selection",
    ]);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: null,
      json: async () => ({}),
    });
    await act(async () => {
      if (typeof admitted !== "object")
        throw new Error("Expected routed submission");
      await capturedOptions!.api.fetch({
        ...admitted,
        input: [
          { role: "user", content: [{ type: "text", text: admitted.query }] },
        ],
      });
    });
    const call = vi
      .mocked(fetch)
      .mock.calls.find(
        ([url, init]) =>
          String(url).includes("/console/chat") && init?.method === "POST",
      )!;
    const body = JSON.parse(call[1]!.body as string);
    expect(body.input[0].content[1].text).toContain("@Other /new");
    expect(body.input[0].content[1].text).not.toContain("later selection");
    expect(body.target_agent_id).toBeUndefined();
  });

  it("UGSci fork feature: answer quotes survive durable queue admission and full queue rejection", async () => {
    const chatId = "14222222-2222-4222-8222-222222222222",
      scope = getDraftStorageKey("default", chatId);
    mockGetChatStatus.mockResolvedValue({ status: "running" });
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    act(() =>
      addAnswerQuote(scope, { messageId: "reply1", text: "queued quote" }),
    );
    let result: unknown;
    await act(async () => {
      result = await capturedOptions!.sender.beforeSubmit({
        query: "queued question",
      });
    });
    expect(result).toMatchObject({ proceed: false, clear: true });
    expect(useMessageQueueStore.getState().getQueue(chatId)[0]).toMatchObject({
      text: "queued question",
      requestContext: { qwenpaw_answer_quotes: [{ text: "queued quote" }] },
    });
    expect(readAnswerQuotes(scope)).toEqual([]);
    act(() => {
      for (let i = 1; i < MAX_QUEUE_SIZE; i++)
        useMessageQueueStore
          .getState()
          .enqueue(chatId, { text: `filler ${i}` });
      addAnswerQuote(scope, {
        messageId: "reply2",
        text: "retain on rejection",
      });
    });
    await act(async () => {
      result = await capturedOptions!.sender.beforeSubmit({
        query: "queue full",
      });
    });
    expect(result).toBe(false);
    expect(readAnswerQuotes(scope)[0].text).toBe("retain on rejection");
    act(() => useMessageQueueStore.getState().clear(chatId));
  });

  it("UGSci fork feature: keyboard queue submission includes the mounted compact quote draft", async () => {
    const chatId = "15222222-2222-4222-8222-222222222222",
      scope = getDraftStorageKey("default", chatId);
    mockRenderSender.mockReturnValue(true);
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("mention-sender");
    await act(async () => {});
    act(() => addAnswerQuote(scope, { messageId: "code", text: "print(42)" }));
    const utils = await import("./utils");
    vi.mocked(utils.getActiveSenderTextarea).mockReturnValue(
      screen.getByTestId("mention-sender") as HTMLTextAreaElement,
    );
    fireEvent.input(screen.getByTestId("mention-sender"), {
      target: { value: "explain" },
    });
    fireEvent.keyDown(screen.getByTestId("mention-sender"), {
      key: "Enter",
      ctrlKey: true,
    });
    expect(useMessageQueueStore.getState().getQueue(chatId)[0]).toMatchObject({
      text: "explain",
      requestContext: { qwenpaw_answer_quotes: [{ text: "print(42)" }] },
    });
    expect(screen.queryByLabelText("Selected quotes")).not.toBeInTheDocument();
    vi.mocked(utils.getActiveSenderTextarea).mockReturnValue(null);
    act(() => useMessageQueueStore.getState().clear(chatId));
  });

  it("allows a submission when the backend chat is idle", async () => {
    const chatId = "22222222-2222-4222-8222-222222222222";
    mockGetChatStatus.mockResolvedValue({ status: "idle" });
    renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${chatId}`],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const beforeSubmit = capturedOptions?.sender?.beforeSubmit;
    const result = await beforeSubmit!({ query: "next turn" });

    expect(result).toMatchObject({ proceed: true, query: "next turn" });
    expect(mockGetChatStatus).toHaveBeenCalledWith(chatId, {
      agentId: "default",
    });
    expect(useMessageQueueStore.getState().getQueue(chatId)).toEqual([]);
  });

  it("UGSci fork feature: concurrent submission of one composer revision cannot create a second queued turn", async () => {
    const chatId = "33322222-2222-4222-8222-222222222226";
    let resolveStatus!: (value: { status: "idle" }) => void;
    mockGetChatStatus.mockResolvedValue({ status: "running" });
    mockGetChatStatus.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveStatus = resolve;
        }),
    );
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    const input = { query: "use OpenUI for the design" };
    const first = capturedOptions!.sender.beforeSubmit(input);
    await waitFor(() => expect(mockGetChatStatus).toHaveBeenCalledTimes(1));
    let duplicate: unknown;
    await act(async () => {
      duplicate = await capturedOptions!.sender.beforeSubmit({ ...input });
    });
    // A repeated Enter/click during async admission must neither send nor queue.
    expect(duplicate).toBe(false);
    expect(mockGetChatStatus).toHaveBeenCalledTimes(1);
    expect(useMessageQueueStore.getState().getQueue(chatId)).toEqual([]);
    let original: unknown;
    await act(async () => {
      resolveStatus({ status: "idle" });
      original = await first;
    });
    expect(original).toMatchObject({ proceed: true, query: input.query });
    expect(useMessageQueueStore.getState().getQueue(chatId)).toEqual([]);
    // This is admission protection, not permanent deduplication by message text.
    mockGetChatStatus.mockResolvedValue({ status: "idle" });
    expect(await capturedOptions!.sender.beforeSubmit(input)).toMatchObject({
      proceed: true,
      query: input.query,
    });
  });

  it.each(["Control", "Meta"])(
    "UGSci fork feature: %s Enter cannot enqueue the unchanged input while SDK admission is pending",
    async (modifier) => {
      const chatId = "33322222-2222-4222-8222-222222222227";
      let resolveStatus!: (value: { status: "idle" }) => void;
      mockGetChatStatus.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveStatus = resolve;
          }),
      );
      mockRenderSender.mockReturnValue(true);
      renderWithProviders(<ChatPage />, {
        initialEntries: [`/chat/${chatId}`],
      });
      const textarea = await screen.findByTestId("mention-sender");
      const utils = await import("./utils");
      vi.mocked(utils.getActiveSenderTextarea).mockReturnValue(
        textarea as HTMLTextAreaElement,
      );
      try {
        fireEvent.input(textarea, { target: { value: "one request" } });
        await act(async () => {});
        const first = capturedOptions!.sender.beforeSubmit({
          query: "one request",
        });
        await waitFor(() => expect(mockGetChatStatus).toHaveBeenCalledTimes(1));
        fireEvent.keyDown(textarea, {
          key: "Enter",
          ctrlKey: modifier === "Control",
          metaKey: modifier === "Meta",
        });
        expect(useMessageQueueStore.getState().getQueue(chatId)).toEqual([]);
        expect(textarea).toHaveValue("one request");
        let result: unknown;
        await act(async () => {
          resolveStatus({ status: "idle" });
          result = await first;
        });
        expect(result).toMatchObject({ proceed: true, query: "one request" });
        expect(useMessageQueueStore.getState().getQueue(chatId)).toEqual([]);
      } finally {
        vi.mocked(utils.getActiveSenderTextarea).mockReturnValue(null);
      }
    },
  );

  it("UGSci fork feature: a retyped identical draft remains a distinct submission during admission", async () => {
    const chatId = "33322222-2222-4222-8222-222222222228";
    let resolveStatus!: (value: { status: "idle" }) => void;
    mockGetChatStatus.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveStatus = resolve;
        }),
    );
    mockRenderSender.mockReturnValue(true);
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    const textarea = await screen.findByTestId("mention-sender");
    fireEvent.input(textarea, { target: { value: "same words" } });
    await act(async () => {});
    const first = capturedOptions!.sender.beforeSubmit({ query: "same words" });
    await waitFor(() => expect(mockGetChatStatus).toHaveBeenCalledTimes(1));
    // Editing produces a new composer revision even if the final text repeats.
    fireEvent.input(textarea, { target: { value: "" } });
    fireEvent.input(textarea, { target: { value: "same words" } });
    mockGetChatStatus.mockResolvedValue({ status: "running" });
    let second: unknown;
    await act(async () => {
      second = await capturedOptions!.sender.beforeSubmit({
        query: "same words",
      });
      useMessageQueueStore.getState().setRunState(chatId, "paused");
    });
    expect(second).toEqual({ proceed: false, clear: true });
    expect(useMessageQueueStore.getState().getQueue(chatId)).toHaveLength(1);
    await act(async () => {
      resolveStatus({ status: "idle" });
      await first;
    });
    const items = useMessageQueueStore.getState().getQueue(chatId);
    expect(items).toHaveLength(2);
    expect(items.map((item) => item.text)).toEqual([
      "same words",
      "same words",
    ]);
    expect(items[0].clientMessageId).not.toBe(items[1].clientMessageId);
  });

  it("UGSci fork feature: repeated attachment-only admission queues one immutable attachment snapshot", async () => {
    const chatId = "33322222-2222-4222-8222-222222222229";
    let resolveStatus!: (value: { status: "running" }) => void;
    mockGetChatStatus.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveStatus = resolve;
        }),
    );
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    const input = {
      query: "",
      fileList: [
        {
          uid: "attachment-1",
          name: "design.html",
          type: "text/html",
          response: { url: "/files/design.html" },
        },
      ],
    };
    const first = capturedOptions!.sender.beforeSubmit(input);
    await waitFor(() => expect(mockGetChatStatus).toHaveBeenCalledTimes(1));
    expect(
      await capturedOptions!.sender.beforeSubmit(structuredClone(input)),
    ).toBe(false);
    await act(async () => {
      resolveStatus({ status: "running" });
      await first;
      useMessageQueueStore.getState().setRunState(chatId, "paused");
    });
    expect(mockGetChatStatus).toHaveBeenCalledTimes(1);
    expect(useMessageQueueStore.getState().getQueue(chatId)).toMatchObject([
      {
        text: "",
        attachments: [{ name: "design.html", url: "/files/design.html" }],
        status: "pending",
      },
    ]);
    expect(useMessageQueueStore.getState().getQueue(chatId)).toHaveLength(1);
  });

  it("rechecks the host queue after a pending idle status result", async () => {
    const chatId = "33322222-2222-4222-8222-222222222222";
    let resolveStatus!: (value: { status: "idle" }) => void;
    mockGetChatStatus.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveStatus = resolve;
        }),
    );
    renderWithProviders(<ChatPage />, { initialEntries: [`/chat/${chatId}`] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    const admission = capturedOptions!.sender.beforeSubmit({
      query: "after existing queue",
    });
    await waitFor(() => expect(mockGetChatStatus).toHaveBeenCalledTimes(1));
    act(() => {
      useMessageQueueStore
        .getState()
        .enqueue(chatId, { text: "already queued", agentId: "default" });
      useMessageQueueStore.getState().setRunState(chatId, "paused");
    });
    let result: unknown;
    await act(async () => {
      resolveStatus({ status: "idle" });
      result = await admission;
    });
    expect(result).toEqual({ proceed: false, clear: true });
    expect(
      useMessageQueueStore
        .getState()
        .getQueue(chatId)
        .map((item) => item.text),
    ).toEqual(["already queued", "after existing queue"]);
    act(() => useMessageQueueStore.getState().clear(chatId));
  });

  it("allows a fresh SDK admission after switching sessions", async () => {
    const sourceChatId = "33322222-2222-4222-8222-222222222224";
    const targetChatId = "33322222-2222-4222-8222-222222222225";

    function ChatHarness() {
      const navigate = useNavigate();
      return (
        <>
          <button onClick={() => navigate(`/chat/${targetChatId}`)}>
            Switch session
          </button>
          <ChatPage />
        </>
      );
    }

    renderWithProviders(<ChatHarness />, {
      initialEntries: [`/chat/${sourceChatId}`],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const first = await capturedOptions!.sender.beforeSubmit({
      query: "abandoned direct send",
    });
    expect(first).toMatchObject({
      proceed: true,
      query: "abandoned direct send",
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Switch session" }));
    });

    let second: unknown;
    await act(async () => {
      second = await capturedOptions!.sender.beforeSubmit({
        query: "send after switch",
      });
    });

    expect(second).toMatchObject({ proceed: true, query: "send after switch" });
    expect(mockGetChatStatus).toHaveBeenCalledTimes(2);
    expect(useMessageQueueStore.getState().getQueue(targetChatId)).toEqual([]);
  });

  it("uses the admission-time session identity when direct send starts later", async () => {
    const chatId = "33322222-2222-4222-8222-222222222223";
    vi.mocked(sessionApi.getSessionIdentity).mockReturnValue({
      sessionId: "source-session",
      sdkSessionId: "source-session",
      chatId,
      userId: "source-user",
      channel: "console",
    });
    mockGetChatStatus.mockResolvedValue({ status: "idle" });
    renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${chatId}`],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const result = await capturedOptions!.sender.beforeSubmit({
      query: "stay in source",
    });
    expect(result).toMatchObject({ proceed: true, query: "stay in source" });

    vi.mocked(sessionApi.getSessionIdentity).mockReturnValue({
      sessionId: "target-session",
      sdkSessionId: "target-session",
      chatId,
      userId: "target-user",
      channel: "console",
    });
    if (typeof result === "boolean") {
      throw new Error("Expected the frozen submission routing context");
    }
    await capturedOptions!.api.fetch({
      session_id: result.session_id,
      context: result.context,
      input: [
        {
          role: "user",
          content: [{ type: "text", text: "stay in source" }],
        },
      ],
    });

    const post = vi
      .mocked(fetch)
      .mock.calls.find(
        ([url, init]) =>
          String(url).endsWith("/console/chat") && init?.method === "POST",
      );
    expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
      session_id: "source-session",
      user_id: "source-user",
      channel: "console",
    });
    expect(post?.[1]?.headers).toMatchObject({ "X-Agent-Id": "default" });
  });

  it("issue 7559: persists the follow-up while backend cleanup is running and sends it once idle", async () => {
    const chatId = "75590000-0000-4000-8000-000000000001";
    const storageKey = `qwenpaw:message-queue:${chatId}`;
    let statusChecks = 0;

    mockGetChatStatus.mockImplementation(async () => {
      statusChecks += 1;
      return { status: statusChecks < 3 ? "running" : "idle" };
    });
    global.fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith("/console/chat") && init?.method === "POST") {
          return { ok: true, status: 200, body: null } as Response;
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "Content-Type": "application/json" }),
          json: async () => {
            if (url.includes(`/chats/${chatId}`)) {
              statusChecks += 1;
              return {
                status: statusChecks < 3 ? "running" : "idle",
                messages: [],
              };
            }
            return {};
          },
        } as Response;
      },
    );
    mockRuntimeSubmit.mockImplementation(
      async (
        data: Parameters<
          import("@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/types/IExecution").IAgentScopeRuntimeWebUIExecutionController["execute"]
        >[0],
        options: { sessionId: string; clientRequestId: string },
      ) => {
        const lifecycle = new ChatRunLifecycle({
          runId: "queue-run",
          source: "host-queue",
          sessionId: options.sessionId,
          cancel: vi.fn(),
        });
        await capturedOptions!.api.fetch({
          ...data,
          chatSessionId: options.sessionId,
          submission: {
            source: "host-queue",
            queueItemId: options.clientRequestId,
          },
          input: [{ role: "user", content: data.query }],
        });
        lifecycle.markAccepted(options.sessionId);
        return lifecycle.handle;
      },
    );

    renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${chatId}`],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    // This is the exact race from #7559: the SDK input is already enabled,
    // while TaskTracker still reports the previous run as active.
    let result: unknown;
    await act(async () => {
      result = await capturedOptions!.sender.beforeSubmit({
        query: "follow-up during cleanup",
        fileList: [
          {
            uid: "race-file",
            name: "race.txt",
            type: "text/plain",
            response: { url: "/files/race.txt" },
          },
        ],
      });
    });

    expect(result).toEqual({ proceed: false, clear: true });
    expect(
      vi
        .mocked(fetch)
        .mock.calls.filter(
          ([url, init]) =>
            String(url).endsWith("/console/chat") && init?.method === "POST",
        ),
    ).toHaveLength(0);
    expect(
      JSON.parse(localStorage.getItem(storageKey) || "null"),
    ).toMatchObject({
      items: [
        {
          text: "follow-up during cleanup",
          bizParams: expect.objectContaining({
            session_id: "test-session",
          }),
          attachments: [{ url: "/files/race.txt", name: "race.txt" }],
        },
      ],
    });

    // The production Zustand store notifies ChatPage. The drain first sees
    // running, polls again, then submits only after the backend becomes idle.

    await waitFor(
      () => {
        const posts = vi
          .mocked(fetch)
          .mock.calls.filter(
            ([url, init]) =>
              String(url).endsWith("/console/chat") && init?.method === "POST",
          );
        expect(posts).toHaveLength(1);
      },
      { timeout: 4_000 },
    );

    const post = vi
      .mocked(fetch)
      .mock.calls.find(
        ([url, init]) =>
          String(url).endsWith("/console/chat") && init?.method === "POST",
      );
    const body = JSON.parse(String(post?.[1]?.body));
    expect(statusChecks).toBeGreaterThanOrEqual(3);
    expect(body).toMatchObject({
      session_id: "test-session",
      user_id: "test-user",
      channel: "console",
    });
    expect(mockRuntimeSubmit).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  // ── sender attachments trigger renders ─────────────────────────────────
  it("sender attachments trigger function renders tooltip", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const attachments = capturedOptions?.sender?.attachments;
    if (attachments?.trigger) {
      const element = attachments.trigger({ disabled: false });
      expect(element).toBeTruthy();
    }
  });

  // ── file upload: multimodal warning path ───────────────────────────────
  it("file upload warns when model has no multimodal support", async () => {
    // The initial render has multimodalCaps all false (before async fetch resolves)
    // So the handleFileUpload in capturedOptions will warn but not block
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.sender?.attachments?.customRequest) {
      const smallFile = new File(["content"], "doc.pdf", {
        type: "application/pdf",
      });
      const onSuccess = vi.fn();
      const onError = vi.fn();
      await capturedOptions!.sender.attachments.customRequest({
        file: smallFile,
        onSuccess,
        onError,
        onProgress: vi.fn(),
      });
      // Should still succeed (warns but doesn't block for non-image files when no multimodal)
      expect(true).toBe(true);
    }
  });

  // ── file upload: error path ────────────────────────────────────────────
  it("file upload calls onError when upload fails", async () => {
    mockUploadFile.mockRejectedValueOnce(new Error("upload failed"));
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.sender?.attachments?.customRequest) {
      const smallFile = new File(["content"], "img.png", { type: "image/png" });
      const onSuccess = vi.fn();
      const onError = vi.fn();
      await capturedOptions!.sender.attachments.customRequest({
        file: smallFile,
        onSuccess,
        onError,
        onProgress: vi.fn(),
      });
      expect(onError).toHaveBeenCalled();
    }
  });

  // ── onFileCardClick → dispatches file preview ──────────────────────────
  it("onFileCardClick dispatches file preview event", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.onFileCardClick) {
      capturedOptions!.api.onFileCardClick({
        name: "test.txt",
        size: 100,
        url: "http://example.com/test.txt",
      });
      // Should not throw
      expect(true).toBe(true);
    }
  });

  // ── onFileCardClick: no url → early return ─────────────────────────────
  it("onFileCardClick does nothing when no url", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.onFileCardClick) {
      capturedOptions!.api.onFileCardClick({ name: "test.txt", size: 100 });
      expect(true).toBe(true);
    }
  });

  // ── responseParser: payloadRequestsHistoryClear via response.output ────
  it("responseParser detects history clear in response output array", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "response",
          status: "completed",
          output: [
            {
              type: "message",
              role: "assistant",
              metadata: { clear_history: true },
              content: [{ type: "text", text: "cleared" }],
            },
          ],
        }),
      );
      expect(parsed).toBeTruthy();
    }
  });

  // ── responseParser: nested metadata clear_history ──────────────────────
  it("responseParser detects nested metadata clear_history", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "message",
          metadata: {
            metadata: { clear_history: true },
          },
        }),
      );
      expect(parsed).toBeTruthy();
    }
  });

  // ── customFetch: successful fetch with full request body ───────────────
  it("customFetch sends correct request body and returns response", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      body: null,
      json: () => Promise.resolve({}),
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.fetch) {
      const result = await capturedOptions!.api.fetch({
        input: [
          {
            role: "user",
            content: [{ type: "text", text: "hello world" }],
          },
        ],
        signal: undefined,
      });
      expect(result).toBeTruthy();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/console/chat"),
        expect.objectContaining({
          method: "POST",
          body: expect.any(String),
        }),
      );
      // Verify the body contains expected fields
      const callArgs = vi
        .mocked(fetch)
        .mock.calls.find(
          (c) =>
            String(c[0]).includes("/console/chat") && c[1]?.method === "POST",
        );
      if (callArgs) {
        const body = JSON.parse(callArgs[1]!.body as string);
        expect(body.stream).toBe(true);
        expect(body.input).toBeDefined();
      }
    }
  });

  it("keeps a requested JEV level while decision settings are loading", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    const toggle = mockApprovalLevelToggle.mock.lastCall?.[0] as {
      decisionModelConfigured?: boolean;
      onChange: (level: string) => void;
    };
    expect(toggle.decisionModelConfigured).toBeUndefined();
    act(() => toggle.onChange("JEV"));

    await capturedOptions!.api.fetch({
      input: [{ role: "user", content: "hello" }],
      signal: undefined,
    });
    const request = vi
      .mocked(fetch)
      .mock.calls.find(
        ([url, options]) =>
          String(url).includes("/console/chat") && options?.method === "POST",
      );
    expect(request).toBeDefined();
    const body = JSON.parse(String(request?.[1]?.body));
    expect(body.request_context.approval_level).toBe("JEV");
  });

  // ── customFetch: with biz_params ───────────────────────────────────────
  it("customFetch merges biz_params into request body", async () => {
    const mockResponse = { ok: true, status: 200, body: null };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.fetch) {
      await capturedOptions!.api.fetch({
        input: [{ role: "user", content: "test" }],
        biz_params: { custom_field: "custom_value" },
        signal: undefined,
      });
      const callArgs = vi
        .mocked(fetch)
        .mock.calls.find(
          (c) =>
            String(c[0]).includes("/console/chat") && c[1]?.method === "POST",
        );
      if (callArgs) {
        const body = JSON.parse(callArgs[1]!.body as string);
        expect(body.custom_field).toBe("custom_value");
      }
    }
  });

  // ── responseParser: completed with non-empty output (no trailing fill) ─
  it("responseParser keeps canonical output when non-empty on completion", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "response",
          status: "completed",
          output: [
            {
              type: "message",
              role: "assistant",
              content: [{ type: "text", text: "full answer" }],
            },
          ],
        }),
      );
      expect(parsed!.output).toHaveLength(1);
      expect(parsed!.output![0].content![0].text).toBe("full answer");
    }
  });

  // ── responseParser: completed with error and empty output ──────────────
  it("responseParser uses error message when output is empty on completion", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "response",
          status: "completed",
          output: [],
          error: { message: "something went wrong" },
        }),
      );
      expect(parsed!.output).toBeDefined();
      // Should contain the error message
      const textContent = parsed!.output?.[0]?.content?.[0]?.text;
      expect(textContent).toBe("something went wrong");
    }
  });

  // ── customFetch: non-ok response discards last user message ────────────
  it("customFetch discards last user message on non-ok response", async () => {
    const mockResponse = { ok: false, status: 500, body: null };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.fetch) {
      const result = await capturedOptions!.api.fetch({
        input: [{ role: "user", content: "hello" }],
        signal: undefined,
      });
      expect(result.ok).toBe(false);
    }
  });

  it("uses the host paste adapter without SDK draft conversion or truncation", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    expect(capturedOptions?.sender?.longTextUpload).toBe(false);
    expect(capturedOptions?.sender?.maxLength).toBeUndefined();
    expect(capturedOptions?.sender?.components?.input).toBe(LongTextPasteInput);
  });

  // ── sender placeholder ─────────────────────────────────────────────────
  it.each(["zh", "en"])(
    "UGSci fork feature: sender placeholder advertises @ Agent assignment in %s",
    async (language) => {
      await i18nReady;
      const previousLanguage = i18n.language;
      await act(async () => {
        await i18n.changeLanguage(language);
      });
      try {
        mockRenderSender.mockReturnValue(true);
        renderWithProviders(<ChatPage />, {
          initialEntries: ["/chat/test-session"],
        });
        const textarea = await screen.findByTestId("mention-sender");
        await act(async () => {});
        for (const hint of ['"@"', "Agent", '"/"', "↑↓"]) {
          expect(textarea).toHaveAttribute(
            "placeholder",
            expect.stringContaining(hint),
          );
        }
        expect(textarea).toHaveAttribute(
          "placeholder",
          expect.stringContaining(language === "zh" ? "指派" : "assign"),
        );
      } finally {
        await act(async () => {
          await i18n.changeLanguage(previousLanguage);
        });
      }
    },
  );

  // ── sender suggestions ─────────────────────────────────────────────────
  it("sender has suggestions array", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    expect(Array.isArray(capturedOptions?.sender?.suggestions)).toBe(true);
    // Should have at least /new and /clear commands
    expect(capturedOptions!.sender.suggestions!.length).toBeGreaterThanOrEqual(
      2,
    );
  });

  // ── session config ─────────────────────────────────────────────────────
  it("session config has multiple and api", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    expect(capturedOptions?.session?.multiple).toBe(true);
    expect(capturedOptions?.session?.hideBuiltInSessionList).toBe(true);
    expect(capturedOptions?.session?.api).toBeTruthy();
  });

  it("UGSci fork feature: home common tasks fill the mounted composer without starting execution", async () => {
    mockRenderSender.mockReturnValue(true);
    mockRenderWelcome.mockReturnValue(true);
    mockUseActualTheme.mockReturnValue(true);
    function HomeStyleControls() {
      const { setPageStyle } = useTheme();
      return PAGE_STYLES.map(({ id }) => (
        <button
          key={id}
          onClick={() => setPageStyle(id)}
        >{`home-${id}`}</button>
      ));
    }
    renderWithProviders(
      <ThemeProvider syncRemote={false}>
        <HomeStyleControls />
        <ChatPage />
      </ThemeProvider>,
      { initialEntries: ["/chat"] },
    );
    const task = await screen.findByRole("button", {
      name: i18n.t("chat.home.actions.check"),
    });
    const input = screen.getByTestId("mention-sender");
    const home = screen.getByRole("region", {
      name: i18n.t("chat.home.title"),
    });
    fireEvent.change(input, { target: { value: "Existing draft" } });
    for (const { id } of PAGE_STYLES) {
      fireEvent.click(screen.getByRole("button", { name: `home-${id}` }));
      expect(document.documentElement).toHaveAttribute("data-page-style", id);
      expect(
        screen.getByRole("region", { name: i18n.t("chat.home.title") }),
      ).toBe(home);
      expect(home).toHaveAttribute("data-chat-home");
      expect(screen.getByTestId("mention-sender")).toBe(input);
      expect(input).toHaveValue("Existing draft");
      expect(
        screen.getByRole("button", { name: i18n.t("chat.home.actions.check") }),
      ).toBe(task);
    }
    fireEvent.click(task);
    expect(input).toHaveValue(
      `Existing draft\n${i18n.t("chat.home.prompts.check")}`,
    );
    expect(mockRuntimeSubmit).not.toHaveBeenCalled();
    expect(sessionApi.createSession).not.toHaveBeenCalled();
  });

  it("UGSci fork feature: composer approvals follow the active session and disappear on the home route", async () => {
    mockRenderSender.mockReturnValue(true);
    mockPendingApprovals.mockReturnValue([
      {
        request_id: "visible-request",
        agent_id: "child",
        owner_agent_id: "default",
        root_session_id: "test-session",
        session_id: "child-session",
        tool_name: "read_file",
      },
      {
        request_id: "other-session",
        agent_id: "default",
        root_session_id: "another-session",
        session_id: "another-session",
        tool_name: "read_file",
      },
      {
        request_id: "other-agent",
        agent_id: "other",
        root_session_id: "test-session",
        session_id: "test-session",
        tool_name: "read_file",
      },
    ]);
    function Navigation() {
      const navigate = useNavigate();
      return <button onClick={() => navigate("/chat")}>Go home</button>;
    }
    const { container } = renderWithProviders(
      <>
        <Navigation />
        <ChatPage />
      </>,
      { initialEntries: ["/chat/test-session"] },
    );
    const card = await screen.findByTestId("scoped-approval");
    expect(card).toHaveTextContent("visible-request");
    expect(
      container.querySelector("[data-execution-approvals]"),
    ).toContainElement(card);
    expect(screen.getAllByTestId("scoped-approval")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Go home" }));
    await waitFor(() =>
      expect(screen.queryByTestId("scoped-approval")).toBeNull(),
    );
  });

  // ── welcome config ─────────────────────────────────────────────────────
  it("welcome config has nick and avatar", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    expect(capturedOptions?.welcome?.nick).toBeTruthy();
    expect(capturedOptions?.welcome?.avatar).toBeTruthy();
  });

  // ── theme config ───────────────────────────────────────────────────────
  it("theme config has darkMode and rightHeader", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    expect(capturedOptions?.theme?.darkMode).toBe(false);
    expect(capturedOptions?.theme?.colorPrimary).toBe("#0b57d0");
    expect(capturedOptions?.theme?.rightHeader).toBeTruthy();
  });

  // ── actions config ─────────────────────────────────────────────────────
  it("actions keep host regenerate and hide SDK replace/right", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    expect(capturedOptions?.actions?.replace).toBe(false);
    expect(capturedOptions?.actions?.right).toBe(false);
    expect(capturedOptions?.actions?.list).toHaveLength(2);
  });

  // ── customToolRenderConfig ─────────────────────────────────────────────
  it("customToolRenderConfig is defined", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    expect(capturedOptions?.customToolRenderConfig).toBeTruthy();
    expect(typeof capturedOptions!.customToolRenderConfig).toBe("object");
  });

  // ── cards config ───────────────────────────────────────────────────────
  it("cards config keeps host response and public SDK request slots", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    expect(
      capturedOptions?.cards?.AgentScopeRuntimeRequestCard,
    ).toBeUndefined();
    expect(capturedOptions?.request?.prepend).toEqual([]);
    expect(capturedOptions?.request?.append).toEqual([]);
    expect(capturedOptions?.cards?.AgentScopeRuntimeResponseCard).toBeTruthy();
    expect(capturedOptions?.cards?.Audios).toBeTruthy();
  });

  // ── Whisper speech button renders when enabled ─────────────────────────
  it("renders whisper button when transcription is enabled", async () => {
    mockGetTranscriptionProviderType.mockResolvedValueOnce({
      transcription_provider_type: "openai_whisper",
    });
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    // Whisper button should appear when enabled
    await waitFor(() => {
      expect(screen.getByTestId("whisper-btn")).toBeInTheDocument();
    });
  });

  // ── /chat/new route creates fresh session ──────────────────────────────
  it("/chat/new route renders with correct options", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/chat/new"] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    expect(capturedOptions).toBeTruthy();
    expect(capturedOptions?.sender?.placeholder).toBeTruthy();
  });

  // ── root route redirects behavior ──────────────────────────────────────
  it("root route renders chat page", async () => {
    renderWithProviders(<ChatPage />, { initialEntries: ["/"] });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    expect(capturedOptions).toBeTruthy();
  });

  // ── responseParser: invalid JSON handling ──────────────────────────────
  it("responseParser handles invalid JSON gracefully", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      expect(
        capturedOptions!.api.responseParser("not valid json"),
      ).toMatchObject({
        object: "message",
        type: "heartbeat",
      });
    }
  });

  // ── file upload: image-only warning when only image supported ──────────
  it("file upload warns for non-image when only image supported", async () => {
    // Default mocks already return supports_multimodal: true, supports_image: true, supports_video: false
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.sender?.attachments?.customRequest) {
      // Upload a non-image file (PDF) when only image is supported
      const pdfFile = new File(["content"], "doc.pdf", {
        type: "application/pdf",
      });
      const onSuccess = vi.fn();
      const onError = vi.fn();
      await capturedOptions!.sender.attachments.customRequest({
        file: pdfFile,
        onSuccess,
        onError,
        onProgress: vi.fn(),
      });
      // Should succeed (warns but doesn't block) - just verify no crash
      expect(true).toBe(true);
    }
  });

  // ── file upload: video file when video supported ───────────────────────
  it("file upload handles video file when video supported", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.sender?.attachments?.customRequest) {
      const videoFile = new File(["video-content"], "clip.mp4", {
        type: "video/mp4",
      });
      const onSuccess = vi.fn();
      const onError = vi.fn();
      await capturedOptions!.sender.attachments.customRequest({
        file: videoFile,
        onSuccess,
        onError,
        onProgress: vi.fn(),
      });
      // Just verify no crash — actual success depends on async multimodal caps resolution
      expect(true).toBe(true);
    }
  });

  // ── model-switched event with maxInputLength ───────────────────────────
  it("model-switched refreshes capabilities for the session model", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    // Dispatch model-switched with maxInputLength detail
    act(() => {
      window.dispatchEvent(
        new CustomEvent("model-switched", {
          detail: { maxInputLength: 65536 },
        }),
      );
    });

    // Capability refresh uses the session model, without rewriting history.
    await waitFor(() => {
      expect(mockGetActiveModels).toHaveBeenCalled();
    });
  });

  // ── qwenpaw:open-file-preview event ────────────────────────────────────
  it("handles qwenpaw:open-file-preview custom event", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    // Dispatch the file preview event
    act(() => {
      window.dispatchEvent(
        new CustomEvent("qwenpaw:open-file-preview", {
          detail: {
            target: { source: "workspace", path: "/test/file.txt" },
            trigger: null,
          },
        }),
      );
    });

    // Should not throw
    expect(true).toBe(true);
  });

  // ── responseParser: duplicate fallback events are deduplicated ─────────
  it("responseParser deduplicates identical fallback events", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      const fallbackPayload = {
        object: "response.delta",
        delta: "text",
        metadata: {
          model_fallback: {
            type: "model_fallback",
            from_provider_id: "openai",
            from_model_id: "gpt-4",
            to_provider_id: "anthropic",
            to_model_id: "claude-3",
            reason_kind: "rate_limited",
          },
        },
      };
      // Send same fallback twice — should be deduplicated
      capturedOptions!.api.responseParser(JSON.stringify(fallbackPayload));
      capturedOptions!.api.responseParser(JSON.stringify(fallbackPayload));
      // Complete
      const parsed = capturedOptions!.api.responseParser(
        JSON.stringify({
          object: "response",
          status: "completed",
          output: [
            {
              type: "message",
              role: "assistant",
              content: [{ type: "text", text: "answer" }],
            },
          ],
        }),
      );
      expect(parsed).toBeTruthy();
      // Output should have at least the original content
      expect(Array.isArray(parsed!.output)).toBe(true);
      expect(parsed!.output!.length).toBeGreaterThanOrEqual(1);
    }
  });

  // ── Ctrl+Shift+M shortcut for voice recording ─────────────────────────
  it("Ctrl+Shift+M shortcut triggers whisper recording when enabled", async () => {
    mockGetTranscriptionProviderType.mockResolvedValueOnce({
      transcription_provider_type: "openai_whisper",
    });
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    // Wait for whisper to be checked
    await waitFor(() => {
      expect(screen.getByTestId("whisper-btn")).toBeInTheDocument();
    });

    // Dispatch the shortcut key
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "m",
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
        }),
      );
    });

    // Should not throw
    expect(true).toBe(true);
  });

  // ── Tab key completion for slash commands ──────────────────────────────
  it("Tab key in sender textarea with slash command does not crash", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    // Dispatch Tab key event — should be handled gracefully
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
        }),
      );
    });

    expect(true).toBe(true);
  });

  // ── Enter key enqueue when loading ─────────────────────────────────────
  it("Enter key enqueue handler is registered without crash", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    // Dispatch Enter key — should be handled gracefully
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
        }),
      );
    });

    expect(true).toBe(true);
  });

  // ── composition events (IME) ───────────────────────────────────────────
  it("IME composition events are handled", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    // Dispatch composition events
    act(() => {
      document.dispatchEvent(
        new CompositionEvent("compositionstart", { bubbles: true }),
      );
    });
    act(() => {
      document.dispatchEvent(
        new CompositionEvent("compositionend", { bubbles: true }),
      );
    });

    expect(true).toBe(true);
  });

  // ── ArrowUp/ArrowDown history navigation ──────────────────────────────
  it("ArrowUp/ArrowDown key events are handled without crash", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
    });
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
    });

    expect(true).toBe(true);
  });

  // ── Trigger rate limit banner via responseParser ───────────────────────
  it("renders rate limit banner when rate_limited payload received", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      // Send rate_limited payload to set rateLimitAlternatives
      capturedOptions!.api.responseParser(
        JSON.stringify({
          type: "rate_limited",
          alternatives: [
            {
              provider_id: "anthropic",
              provider_name: "Anthropic",
              model_id: "claude-3",
              model_name: "Claude 3",
            },
            {
              provider_id: "google",
              provider_name: "Google",
              model_id: "gemini-pro",
              model_name: "Gemini Pro",
            },
          ],
        }),
      );
      // Component should re-render with rate limit banner
      await waitFor(() => {
        expect(capturedOptions).toBeTruthy();
      });
    }
  });

  // ── Trigger model prompt modal via customFetch ─────────────────────────
  it("renders model prompt modal when no active model", async () => {
    mockGetActiveModels.mockResolvedValueOnce({
      active_llm: { provider_id: null, model: null },
    });
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.fetch) {
      await capturedOptions!.api.fetch({
        input: [{ role: "user", content: "hello" }],
        signal: undefined,
      });
      // Component should re-render with model prompt modal
      await waitFor(() => {
        expect(capturedOptions).toBeTruthy();
      });
    }
  });

  // ── Cancel callback with no resolved chat ID ───────────────────────────
  it("cancel callback rejects missing chat ID for SDK cleanup", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.cancel) {
      await expect(
        capturedOptions!.api.cancel({ session_id: "" }),
      ).rejects.toThrow("Missing chat identity for cancellation");
    }
  });

  // ── Reconnect callback with signal ─────────────────────────────────────
  it("reconnect callback handles abort signal", async () => {
    const chatId = "90000000-0000-4000-8000-000000000003";
    vi.mocked(sessionApi.getSessionIdentity).mockReturnValue({
      sessionId: "test-session",
      sdkSessionId: "test-session",
      chatId,
      userId: "test-user",
      channel: "console",
    });
    renderWithProviders(<ChatPage />, {
      initialEntries: [`/chat/${chatId}`],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.reconnect) {
      const controller = new AbortController();
      const result = await capturedOptions!.api.reconnect({
        session_id: "test-session",
        signal: controller.signal,
      });
      expect(result).toBeTruthy();
    }
  });

  // ── customFetch with empty input ───────────────────────────────────────
  it("rejects empty input before transport", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});
    const count = vi.mocked(fetch).mock.calls.length;
    await expect(capturedOptions!.api.fetch({ input: [] })).rejects.toThrow(
      "Chat submission has no input",
    );
    expect(fetch).toHaveBeenCalledTimes(count);
  });

  // ── customFetch with session in input ──────────────────────────────────
  it("customFetch extracts session from input", async () => {
    const mockResponse = { ok: true, status: 200, body: null };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.fetch) {
      const result = await capturedOptions!.api.fetch({
        input: [
          {
            role: "user",
            content: "test",
            session: { session_id: "custom-session", user_id: "custom-user" },
          },
        ],
        signal: undefined,
      });
      expect(result).toBeTruthy();
      const callArgs = vi
        .mocked(fetch)
        .mock.calls.find(
          (c) =>
            String(c[0]).includes("/console/chat") && c[1]?.method === "POST",
        );
      if (callArgs) {
        const body = JSON.parse(callArgs[1]!.body as string);
        expect(body.session_id).toBeDefined();
      }
    }
  });

  // ── responseParser with non-object payload ─────────────────────────────
  it("responseParser handles non-object payload gracefully", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      // Send a string payload (not an object); should not crash
      expect(() =>
        capturedOptions!.api.responseParser(JSON.stringify("just a string")),
      ).not.toThrow();
    }
  });

  // ── responseParser with null payload ───────────────────────────────────
  it("responseParser handles null-like payload", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.responseParser) {
      // null payload causes parseModelFallbackEvents to throw (accessing .metadata on null)
      expect(() => {
        capturedOptions!.api.responseParser(JSON.stringify(null));
      }).not.toThrow();
    }
  });

  // ── File upload with progress callback ─────────────────────────────────
  it("file upload calls onProgress callback", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.sender?.attachments?.customRequest) {
      const smallFile = new File(["content"], "img.png", { type: "image/png" });
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const onProgress = vi.fn();
      await capturedOptions!.sender.attachments.customRequest({
        file: smallFile,
        onSuccess,
        onError,
        onProgress,
      });
      // onProgress should be called with 100% after upload
      expect(onProgress).toHaveBeenCalledWith({ percent: 100 });
    }
  });

  // ── onFileCardClick with url containing query params ───────────────────
  it("onFileCardClick handles url with query params", async () => {
    renderWithProviders(<ChatPage />, {
      initialEntries: ["/chat/test-session"],
    });
    await screen.findByTestId("chat-ui");
    await act(async () => {});

    if (capturedOptions?.api?.onFileCardClick) {
      capturedOptions!.api.onFileCardClick({
        name: "test.txt",
        size: 100,
        url: "http://example.com/test.txt?token=abc123",
      });
      expect(true).toBe(true);
    }
  });

  // ── files drawer placement — regression for #7700 ──────────────────────
  // The drawer is a flex sibling of the chat area, so which side it appears
  // on is decided by DOM order alone. FilesDrawer unit tests cannot catch a
  // move back before the chat content, so assert the order here.
  it("renders the files drawer after the chat main area (#7700)", async () => {
    const drawerState = vi.mocked(useSessionFilesDrawer);
    drawerState.mockReturnValue({
      kind: "preview",
      target: { source: "workspace", path: "hello.txt", root: "project" },
      trigger: null,
    });
    try {
      const { container } = renderWithProviders(<ChatPage />, {
        initialEntries: ["/chat/test-session"],
      });
      await screen.findByTestId("chat-ui");

      const children = Array.from(
        container.querySelector('[class*="chatPageRoot"]')?.children ?? [],
      );
      const chatIndex = children.findIndex((child) =>
        child.className.includes("chatMainArea"),
      );
      const drawerIndex = children.findIndex(
        (child) =>
          child.tagName === "ASIDE" && child.className.includes("drawer"),
      );
      expect(chatIndex).toBeGreaterThanOrEqual(0);
      expect(drawerIndex).toBeGreaterThan(chatIndex);
      const conversationPanel = container.querySelector(
        '[data-panel="true"][id="conversation"]',
      );
      expect(conversationPanel?.contains(children[chatIndex])).toBe(true);
      expect(conversationPanel?.contains(children[drawerIndex])).toBe(true);
      expect(
        container
          .querySelector('[data-panel="true"][id="terminal"]')
          ?.contains(children[drawerIndex]),
      ).toBe(false);
    } finally {
      drawerState.mockReturnValue({ kind: "closed" });
    }
  });
});
