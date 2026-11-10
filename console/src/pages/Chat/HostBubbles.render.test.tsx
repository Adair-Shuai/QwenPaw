import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
vi.mock("@agentscope-ai/design", async (importOriginal) => {
  const design = await importOriginal<Record<string, unknown>>();
  const { createContext } = await import("react");
  const ConfigContext = createContext({
    getPrefixCls: (suffix?: string) =>
      suffix ? `test-chat-${suffix}` : "test-chat",
  });
  return {
    ...design,
    ConfigProvider: Object.assign(
      ({ children }: { children?: ReactNode }) => <>{children}</>,
      { ConfigContext },
    ),
  };
});
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
      Interrupted: ({ desc }: { desc?: ReactNode }) => (
        <span>interrupted{desc && <span>{desc}</span>}</span>
      ),
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

function provider(children: ReactNode, nick?: string, avatar = "/qwenpaw.png") {
  return (
    <ComposedProvider
      options={{
        api: {},
        ...(nick ? { welcome: { nick, avatar } } : {}),
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

it("turns a historical inline PROFILE.md mention in the real assistant response into a scoped configuration link", async () => {
  const scope = {
    kind: "session" as const,
    agentId: "agent",
    sessionId: "session",
    chatId: "chat",
  };
  const open = vi.fn();
  window.addEventListener("qwenpaw:open-file-preview", open);
  try {
    const view = render(
      provider(
        <TurnFilesScopeProvider value={scope}>
          <HostResponseCard
            id="profile-host"
            data={{
              id: "profile-response",
              status: AgentScopeRuntimeRunStatus.Completed,
              output: [
                {
                  id: "profile-message",
                  type: AgentScopeRuntimeMessageType.MESSAGE,
                  role: "assistant",
                  status: AgentScopeRuntimeRunStatus.Completed,
                  content: [
                    {
                      type: "text",
                      text: "当前的实情是：`PROFILE.md` 仍为空。定完我就写进 PROFILE.md，身份是 `default`。",
                      status: AgentScopeRuntimeRunStatus.Completed,
                    },
                  ],
                },
              ],
            }}
            isLast
          />
        </TurnFilesScopeProvider>,
      ),
    );
    const links = await screen.findAllByRole("link", { name: "PROFILE.md" });
    expect(links).toHaveLength(2);
    fireEvent.click(links[0]);
    expect(open.mock.calls[0][0].detail).toMatchObject({
      agentId: "agent",
      sessionId: "session",
      chatId: "chat",
      target: { source: "profile", path: "PROFILE.md" },
    });
    expect(links[0].closest("[data-answer-quote-source]")).toHaveAttribute(
      "data-answer-quote-source",
      "profile-message:0",
    );
    expect(view.container.querySelector("code")).toHaveTextContent("default");
  } finally {
    window.removeEventListener("qwenpaw:open-file-preview", open);
  }
});

it("opens a file citation from the actual assistant response with its original session and line range", async () => {
  const scope = {
    kind: "session" as const,
    agentId: "agent",
    sessionId: "session",
    chatId: "chat",
  };
  const open = vi.fn();
  window.addEventListener("qwenpaw:open-file-preview", open);
  try {
    render(
      provider(
        <TurnFilesScopeProvider value={scope}>
          <HostResponseCard
            id="host-reference"
            data={{
              id: "response-reference",
              status: AgentScopeRuntimeRunStatus.Completed,
              output: [
                {
                  id: "reference-message",
                  type: AgentScopeRuntimeMessageType.MESSAGE,
                  role: "assistant",
                  status: AgentScopeRuntimeRunStatus.Completed,
                  content: [
                    {
                      type: "text",
                      text: "See [implementation](src/app.ts#L12-L18)",
                      status: AgentScopeRuntimeRunStatus.Completed,
                    },
                  ],
                },
              ],
            }}
            isLast
          />
        </TurnFilesScopeProvider>,
      ),
    );
    fireEvent.click(
      await screen.findByRole("link", { name: "implementation L12–18" }),
    );
    expect(open.mock.calls[0][0].detail).toMatchObject({
      agentId: "agent",
      sessionId: "session",
      chatId: "chat",
      target: {
        source: "workspace",
        path: "src/app.ts",
        line: 12,
        endLine: 18,
      },
    });
  } finally {
    window.removeEventListener("qwenpaw:open-file-preview", open);
  }
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
          {
            id: "image",
            root: "workspace",
            path: "output/preview.png",
            name: "preview.png",
            status: "created",
            size: 100,
            binary: true,
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
    expect(report.closest("[data-global-search-message]")).toHaveAttribute(
      "data-global-search-message",
      "response_archive",
    );
    expect(screen.getByRole("img", { name: "preview.png" })).toHaveAttribute(
      "src",
      expect.stringContaining("turn/files/image"),
    );
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
      expect(
        screen.getByText("A test reply").closest("[data-answer-quote-source]"),
      ).toHaveAttribute("data-answer-quote-source", "message:0");
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
    expect(
      screen.queryByRole("list", { name: "chat.execution.title" }),
    ).not.toBeInTheDocument();
    await act(async () => {
      setShowThinkingPreference(false);
    });
    expect(screen.queryByText("reasoning content")).not.toBeInTheDocument();
    await act(async () => {
      setAssistantMessageDisplayPreference("process-collapsed");
    });
    const collapsedHeader = screen
      .getByText("chat.messageDisplay.stepsCompleted")
      .closest('[class*="-accordion-group-header-close"]');
    expect(collapsedHeader).not.toBeNull();
    expect(screen.queryByText("tool content")).not.toBeInTheDocument();
    fireEvent.click(collapsedHeader!);
    expect(screen.getByText("tool content")).toBeVisible();
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

it("shows real execution transitions in the mounted response without mistaking delivered arguments for completion", async () => {
  setAssistantMessageDisplayPreference("result-collapsed");
  const call = {
    id: "call-message",
    type: AgentScopeRuntimeMessageType.FUNCTION_CALL,
    role: "assistant",
    status: AgentScopeRuntimeRunStatus.Completed,
    content: [
      {
        type: "data",
        data: {
          name: "read_file",
          call_id: "call-1",
          arguments: { path: "test.txt" },
        },
      },
    ],
  };
  const output = {
    id: "result-message",
    type: AgentScopeRuntimeMessageType.FUNCTION_CALL_OUTPUT,
    role: "tool",
    status: AgentScopeRuntimeRunStatus.Completed,
    content: [
      { type: "data", data: { call_id: "call-1", output: "File content" } },
    ],
  };
  const view = (status: unknown, messages: unknown[]) =>
    provider(
      <HostResponseCard
        id="response"
        isLast
        data={{ id: "response", status, output: messages }}
      />,
    );
  const { container, rerender } = render(
    view(AgentScopeRuntimeRunStatus.InProgress, [call]),
  );
  const header = (title: string) =>
    screen
      .getByText(title)
      .closest<HTMLElement>(
        '[class*="-accordion-group-header-open"], [class*="-accordion-group-header-close"]',
      )!;
  expect(header("chat.messageDisplay.stepsRunning").className).toContain(
    "-header-open",
  );
  expect(screen.getByText("tool content")).toBeVisible();
  const answer = {
    id: "final-message",
    type: AgentScopeRuntimeMessageType.MESSAGE,
    role: "assistant",
    status: AgentScopeRuntimeRunStatus.Completed,
    content: [{ type: "text", text: "Final answer remains visible" }],
  };
  rerender(view(AgentScopeRuntimeRunStatus.Completed, [call, output, answer]));
  const complete = header("chat.messageDisplay.stepsCompleted");
  expect(complete.className).toContain("-header-close");
  expect(screen.queryByText("tool content")).not.toBeInTheDocument();
  expect(screen.getByText("Final answer remains visible")).toBeVisible();
  fireEvent.click(complete);
  expect(screen.getAllByText("tool content")).toHaveLength(1);
  expect(complete.className).toContain("-header-open");
  rerender(
    view(AgentScopeRuntimeRunStatus.Failed, [
      call,
      {
        ...output,
        content: [
          {
            type: "data",
            data: { call_id: "call-1", state: "error", output: "Failed" },
          },
        ],
      },
    ]),
  );
  const failed = header("chat.messageDisplay.stepsFailed");
  expect(failed.className).toContain("-header-close");
  expect(screen.queryByText("tool content")).not.toBeInTheDocument();
  fireEvent.click(failed);
  expect(screen.getByText("tool content")).toBeVisible();
  rerender(view(AgentScopeRuntimeRunStatus.Canceled, [call]));
  const canceled = header("chat.messageDisplay.stepsCanceled");
  expect(canceled.className).toContain("-header-close");
  expect(screen.queryByText("tool content")).not.toBeInTheDocument();
  fireEvent.click(canceled);
  expect(screen.getByText("tool content")).toBeVisible();
  expect(container.querySelector("[data-execution-process]")).toBeNull();
});

it("uses supplied assistant motion for active tools and static results after the turn ends", () => {
  const avatar = "/ugsci-mono/avatars/assistant-256.png";
  const call = {
    id: "mono-call",
    type: AgentScopeRuntimeMessageType.FUNCTION_CALL,
    role: "assistant",
    status: AgentScopeRuntimeRunStatus.Completed,
    content: [
      {
        type: "data",
        data: {
          name: "read_file",
          call_id: "mono",
          arguments: { path: "sample.txt" },
        },
      },
    ],
  };
  const view = (status: unknown, output: unknown[]) =>
    provider(
      <HostResponseCard
        id="mono-response"
        data={{ id: "mono-response", status, output }}
      />,
      "UGSci",
      avatar,
    );
  const { container, rerender } = render(
    view(AgentScopeRuntimeRunStatus.InProgress, []),
  );
  expect(container.querySelector("[data-assistant-state]")).toHaveAttribute(
    "data-assistant-state",
    "thinking",
  );
  rerender(view(AgentScopeRuntimeRunStatus.InProgress, [call]));
  expect(container.querySelector("[data-assistant-state]")).toHaveAttribute(
    "data-assistant-state",
    "tool-running",
  );
  rerender(view(AgentScopeRuntimeRunStatus.Completed, [call]));
  expect(container.querySelector("[data-assistant-state]")).toHaveAttribute(
    "data-assistant-state",
    "completed",
  );
  rerender(view(AgentScopeRuntimeRunStatus.Failed, [call]));
  expect(container.querySelector("[data-assistant-state]")).toHaveAttribute(
    "data-assistant-state",
    "failed",
  );
  rerender(view(AgentScopeRuntimeRunStatus.Canceled, [call]));
  expect(container.querySelector("[data-assistant-state]")).toHaveAttribute(
    "data-assistant-state",
    "ready",
  );
});

it("keeps an errored provisional response terminal after a later response completes", () => {
  const avatar = "/ugsci-mono/avatars/assistant-256.png";
  const failed = (
    <HostResponseCard
      id="failed"
      data={{
        id: "failed",
        status: AgentScopeRuntimeRunStatus.InProgress,
        output: [],
        error: { code: 400, message: "Model not configured" },
      }}
    />
  );
  const { container, rerender } = render(provider(failed, "UGSci", avatar));
  expect(container.querySelector("[data-assistant-state]")).toHaveAttribute(
    "data-assistant-state",
    "failed",
  );
  expect(screen.getByText("Model not configured")).toBeVisible();
  expect(
    container.querySelector('[data-assistant-state="thinking"]'),
  ).toBeNull();
  rerender(
    provider(
      <>
        {failed}
        <HostResponseCard
          id="later"
          data={{
            id: "later",
            status: AgentScopeRuntimeRunStatus.Completed,
            output: [],
          }}
        />
      </>,
      "UGSci",
      avatar,
    ),
  );
  expect(
    container.querySelector(
      '[data-global-search-message="failed"] [data-assistant-state]',
    ),
  ).toHaveAttribute("data-assistant-state", "failed");
  expect(
    container.querySelector('[data-assistant-state="thinking"]'),
  ).toBeNull();
});

it("does not attribute legacy ambient files or snapshot warnings to a saved greeting without tools", async () => {
  const file = {
    id: "ambient",
    root: "workspace" as const,
    path: "BAI6_run/bai6_sch.inc",
    name: "bai6_sch.inc",
    status: "modified" as const,
    size: 120563,
    binary: true,
    before_available: true,
    after_available: false,
    delivered: false,
  };
  const list = vi.spyOn(turnFilesApi, "list").mockResolvedValue({
    turns: [
      {
        id: "greeting-turn",
        response_id: "greeting",
        session_id: "session",
        agent_id: "agent",
        status: "completed",
        started_at: "2026-11-09",
        incomplete: true,
        overlap: false,
        warnings: ["Snapshot byte budget reached; some contents unavailable"],
        files: [
          file,
          {
            ...file,
            id: "wal",
            name: "history.db-wal",
            path: "history.db-wal",
          },
        ],
      },
    ],
  });
  const updated = vi.fn();
  window.addEventListener("qwenpaw:turn-files-updated", updated);
  try {
    render(
      provider(
        <TurnFilesScopeProvider
          value={{
            kind: "session",
            agentId: "agent",
            sessionId: "session",
            chatId: "chat",
          }}
        >
          <HostResponseCard
            id="greeting"
            data={{
              id: "greeting",
              status: AgentScopeRuntimeRunStatus.Completed,
              output: [
                {
                  id: "answer",
                  type: AgentScopeRuntimeMessageType.MESSAGE,
                  role: "assistant",
                  status: AgentScopeRuntimeRunStatus.Completed,
                  content: [{ type: "text", text: "Hello without tools" }],
                },
              ],
            }}
          />
        </TurnFilesScopeProvider>,
      ),
    );
    await waitFor(() => expect(updated).toHaveBeenCalled());
    expect(list).toHaveBeenCalled();
    expect(screen.getByText("Hello without tools")).toBeVisible();
    expect(screen.queryByText("bai6_sch.inc")).toBeNull();
    expect(screen.queryByText("history.db-wal")).toBeNull();
    expect(screen.queryByText("turnFiles.incomplete")).toBeNull();
  } finally {
    window.removeEventListener("qwenpaw:turn-files-updated", updated);
  }
});
