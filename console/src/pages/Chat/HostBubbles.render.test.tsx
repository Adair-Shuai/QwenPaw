import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import ComposedProvider from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/ChatAnywhere/ComposedProvider";
import {
  AgentScopeRuntimeMessageType,
  AgentScopeRuntimeRunStatus,
} from "@agentscope-ai/chat";
import { HostRequestCard, HostResponseCard } from "./HostBubbles";
import { TurnFilesScopeProvider } from "../../features/files-workspace/TurnFilesScope";
import { turnFilesApi } from "../../api/modules/turnFiles";
import * as assistantMarkdown from "./AssistantMarkdown";
import { ChatScalar, ChatList } from "../../plugins/registry/slotKeys";
import {
  setAssistantMessageDisplayPreference,
  setShowThinkingPreference,
} from "../../utils/chatDisplayPreference";

const extensions = vi.hoisted(() => ({
  scalar: {} as Record<string, unknown>,
  lists: {} as Record<string, unknown[]>,
}));
vi.mock("../../plugins/registry/useChatExtensions", () => ({
  useChatScalarSnapshot: () => extensions.scalar,
  useChatListSnapshot: () =>
    new Proxy(extensions.lists, {
      get: (target, key: string) => target[key] ?? [],
    }),
}));
vi.mock("../../components/RenderableCodeBlock", () => ({
  renderableCodeComponents: {},
}));
vi.mock("../../features/files-workspace/ResponseArtifactList", () => ({
  default: () => null,
}));
vi.mock("../../components/Chat/MediaDownload", () => ({
  DownloadableAudios: () => null,
}));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));
// Keep the real vendor Request/Card and SDK contexts. Only visual leaves are
// stubbed: the shared test design alias omits vendor ConfigProvider internals.
vi.mock("@agentscope-ai/icons", async (importOriginal) => {
  const icons = await importOriginal<Record<string, unknown>>();
  const placeholder = () => <span />;
  return new Proxy(icons, {
    has: (target, key) =>
      Reflect.has(target, key) || String(key).startsWith("Spark"),
    get: (target, key) =>
      Reflect.get(target, key) ??
      (String(key).startsWith("Spark") ? placeholder : undefined),
  });
});
vi.mock("@agentscope-ai/chat/lib/Bubble", () => ({
  default: Object.assign(
    ({ cards }: { cards?: Array<{ data: { content?: string } }> }) => (
      <div>
        {cards?.map((card, index) => (
          <span key={index}>{card.data.content}</span>
        ))}
      </div>
    ),
    {
      Spin: () => <span>loading</span>,
      Interrupted: () => <span>interrupted</span>,
    },
  ),
}));
vi.mock(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Request/Actions",
  () => ({ default: () => <span>request-actions</span> }),
);
vi.mock(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Reasoning",
  () => ({ default: () => <span>reasoning content</span> }),
);
vi.mock(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Tool",
  () => ({ default: () => <span>tool content</span> }),
);
vi.mock(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Actions",
  () => ({
    default: ({ messageId }: { messageId: string }) => (
      <span data-testid="response-actions">{messageId}</span>
    ),
  }),
);
vi.mock("./LazyAccordion", () => ({
  default: ({
    renderChildren,
    defaultOpen,
  }: {
    renderChildren: () => ReactNode;
    defaultOpen: boolean;
  }) => (
    <section data-testid="steps" data-open={String(defaultOpen)}>
      {renderChildren()}
    </section>
  ),
}));

function provider(children: ReactNode, nick?: string) {
  return (
    <ComposedProvider
      options={{
        api: {},
        ...(nick ? { welcome: { nick, avatar: "/qwenpaw.png" } } : {}),
        session: {
          currentSessionId: undefined,
          api: {
            getSessionList: async () => [],
            getSession: async (id) => ({ id, name: id, messages: [] }),
            createSession: async (draft) => {
              const session = {
                id: "fixture-session",
                name: draft.name || "",
                messages: [],
              };
              return { sessions: [session], session };
            },
            updateSession: async () => [],
            removeSession: async () => [],
          },
        },
      }}
      cards={{}}
    >
      {children}
    </ComposedProvider>
  );
}

beforeEach(() => {
  extensions.scalar = {};
  extensions.lists = {};
  localStorage.clear();
});

it("mounts the persisted turn file summary in the real response and opens an immutable scoped version", async () => {
  const scope = {
    kind: "session" as const,
    agentId: "agent",
    sessionId: "session",
    chatId: "chat",
  };
  const list = vi.spyOn(turnFilesApi, "list").mockResolvedValue({
    turns: [
      {
        id: "turn",
        response_id: "response_archive",
        session_id: "session",
        agent_id: "agent",
        started_at: "2026-10-30T00:00:00Z",
        finished_at: "2026-10-30T00:00:01Z",
        status: "completed",
        incomplete: false,
        warnings: [],
        overlap: false,
        files: [
          {
            id: "report",
            root: "workspace",
            path: "output/report.txt",
            name: "report.txt",
            status: "created",
            size: 6,
            binary: false,
            additions: 1,
            deletions: 0,
            before_available: false,
            after_available: true,
            delivered: true,
          },
        ],
      },
    ],
  });
  const open = vi.fn();
  window.addEventListener("qwenpaw:open-file-preview", open);
  try {
    render(
      provider(
        <TurnFilesScopeProvider value={scope}>
          <HostResponseCard
            id="host"
            data={{
              id: "response_archive",
              status: AgentScopeRuntimeRunStatus.Completed,
              output: [],
            }}
            isLast
          />
        </TurnFilesScopeProvider>,
      ),
    );
    const report = await screen.findByRole("button", {
      name: "turnFiles.openArchive report.txt",
    });
    await act(async () => report.click());
    expect(list).toHaveBeenCalledWith(scope, expect.anything());
    expect(open).toHaveBeenCalledOnce();
    const detail = (open.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toMatchObject({
      agentId: "agent",
      sessionId: "session",
      chatId: "chat",
      target: { source: "artifact" },
    });
    expect(detail.target.artifact.meta).toMatchObject({
      turnFileArchive: true,
      turnId: "turn",
      fileId: "report",
    });
    expect(detail.target.artifactUrl).toContain(
      "/agents/agent/workspace/turn-files/turn/files/report",
    );
  } finally {
    window.removeEventListener("qwenpaw:open-file-preview", open);
    list.mockRestore();
  }
});

it.each([
  AgentScopeRuntimeRunStatus.InProgress,
  AgentScopeRuntimeRunStatus.Completed,
])(
  "renders the configured agent signature for response status %s",
  (status) => {
    const markdown = vi
      .spyOn(assistantMarkdown, "AssistantMarkdown")
      .mockImplementation(() => <span>A test reply</span>);
    try {
      render(
        provider(
          <HostResponseCard
            id="named-response"
            data={{
              id: "response",
              status,
              output: [
                {
                  id: "message",
                  type: AgentScopeRuntimeMessageType.MESSAGE,
                  role: "assistant",
                  status,
                  content: [{ type: "text", text: "A test reply", status }],
                },
              ],
            }}
            isLast
          />,
          "储气库专家",
        ),
      );
      expect(screen.getByText("储气库专家")).toBeInTheDocument();
      expect(screen.queryByText("QwenPaw")).not.toBeInTheDocument();
    } finally {
      markdown.mockRestore();
    }
  },
);
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("merged host bubbles behavior", () => {
  it.each([
    [undefined, AgentScopeRuntimeRunStatus.InProgress, true],
    [null, AgentScopeRuntimeRunStatus.InProgress, true],
    [undefined, AgentScopeRuntimeRunStatus.Completed, false],
    [
      AgentScopeRuntimeRunStatus.Completed,
      AgentScopeRuntimeRunStatus.InProgress,
      false,
    ],
  ])(
    "uses message status when text status is %s (message %s)",
    async (status, messageStatus, isStreaming) => {
      const markdown = vi
        .spyOn(assistantMarkdown, "AssistantMarkdown")
        .mockImplementation(() => <></>);
      try {
        setAssistantMessageDisplayPreference("expanded");
        render(
          provider(
            <HostResponseCard
              id="sdk-message"
              data={{
                id: "response",
                status: messageStatus,
                output: [
                  {
                    id: "text-message",
                    type: AgentScopeRuntimeMessageType.MESSAGE,
                    role: "assistant",
                    status: messageStatus,
                    content: [
                      { type: "text", text: "```openui-lang\nroot =", status },
                    ],
                  },
                ],
              }}
              isLast
            />,
          ),
        );
        await act(async () => {});
        const props = markdown.mock.calls[markdown.mock.calls.length - 1][0];
        expect({
          isStreaming: props.isStreaming,
          cursor: props.cursor,
        }).toEqual({
          isStreaming,
          // Preserve the existing vendor cursor behavior for users without plugins.
          cursor: false,
        });
      } finally {
        markdown.mockRestore();
      }
    },
  );

  it("delegates response actions without injecting regenerate", async () => {
    setAssistantMessageDisplayPreference("expanded");
    const output = [
      {
        id: "reason",
        type: AgentScopeRuntimeMessageType.REASONING,
        role: "assistant",
        status: AgentScopeRuntimeRunStatus.Completed,
        content: [],
      },
      {
        id: "tool",
        type: AgentScopeRuntimeMessageType.FUNCTION_CALL,
        role: "assistant",
        status: AgentScopeRuntimeRunStatus.Completed,
        content: [],
      },
    ];
    render(
      provider(
        <HostResponseCard
          id="sdk-message-id"
          data={{
            id: "runtime-response-id",
            status: AgentScopeRuntimeRunStatus.Completed,
            output,
          }}
          isLast
        />,
      ),
    );
    expect(screen.getByText("reasoning content")).toBeInTheDocument();
    expect(screen.getByText("tool content")).toBeInTheDocument();
    expect(screen.queryByTestId("steps")).not.toBeInTheDocument();
    await act(async () => {
      setShowThinkingPreference(false);
    });
    expect(screen.queryByText("reasoning content")).not.toBeInTheDocument();
    await act(async () => {
      setAssistantMessageDisplayPreference("process-collapsed");
    });
    expect(screen.getByTestId("steps")).toHaveAttribute("data-open", "false");
    expect(screen.getByTestId("response-actions")).toHaveTextContent(
      "sdk-message-id",
    );
    expect(
      screen.queryByRole("button", { name: "chat.regenerate" }),
    ).not.toBeInTheDocument();
  });

  it("retains the original request card's content and ordered prepend/append fallback", () => {
    extensions.lists[ChatList.requestPrepend] = [
      {
        pluginId: "test",
        item: {
          id: "late",
          order: 20,
          render: () => <span>prepend-late</span>,
        },
      },
      {
        pluginId: "test",
        item: {
          id: "early",
          order: 10,
          render: () => <span>prepend-early</span>,
        },
      },
    ];
    extensions.lists[ChatList.requestAppend] = [
      {
        pluginId: "test",
        item: { id: "append", render: () => <span>append-content</span> },
      },
    ];
    extensions.scalar[ChatScalar.requestRender] = {
      pluginId: "test",
      value: ({ fallback }: { fallback: () => ReactNode }) => (
        <div data-testid="plugin-request">{fallback()}</div>
      ),
    };
    const { container } = render(
      provider(
        <HostRequestCard
          data={{
            input: [
              {
                role: "user",
                content: [{ type: "text", text: "original request content" }],
              },
            ],
          }}
        />,
      ),
    );
    expect(screen.getByTestId("plugin-request")).toBeInTheDocument();
    expect(container.textContent).toMatch(
      /prepend-early[\s\S]*prepend-late[\s\S]*original request content[\s\S]*append-content[\s\S]*request-actions/,
    );
  });
});
