import { useEffect, useState, type ReactNode } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App, ConfigProvider } from "antd";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ComposedProvider from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/ChatAnywhere/ComposedProvider";
import NativeRequestCard from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Request/Card";
import type { IAgentScopeRuntimeWebUIOptions } from "@agentscope-ai/chat";
import { I18nextProvider } from "react-i18next";
import i18n, { i18nReady } from "../../../i18n";
import { useMessageQueueStore } from "../../../stores/messageQueueStore";
import { extractClientMessageId } from "../../../utils/clientMessageId";
import { useMessageEditResend } from "../hooks/useMessageEditResend";

// Preserve the actual Request/Card, native action dispatcher, Bubble and SDK
// contexts. The shared design alias only needs Ant's real ConfigContext so
// those installed SDK components can consume their normal prefix context.
vi.mock("@agentscope-ai/design", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  ConfigProvider: (await import("antd")).ConfigProvider,
}));

type RequestData = Parameters<typeof NativeRequestCard>[0]["data"];
type Row = { id: string; data: RequestData };
const visit = {};
const identity = {
  sdkSessionId: "chat-inline",
  chatId: "chat-inline",
  sessionId: "runtime-inline",
  userId: "user-inline",
  channel: "console",
};
const copied = vi.fn();
const mounted = vi.fn();
const unmounted = vi.fn();

function request(clientId?: string, file = false): RequestData {
  return {
    created_at: 1793490000,
    input: [
      {
        role: "user",
        type: "message",
        content: [
          { type: "text", text: "Identical original question" },
          ...(file
            ? [
                {
                  type: "file",
                  file_url: "/synthetic.csv",
                  file_name: "synthetic.csv",
                  file_size: 12,
                },
              ]
            : []),
        ],
        ...(clientId
          ? { metadata: { qwenpaw_client_message_id: clientId } }
          : {}),
      },
    ],
  } as unknown as RequestData;
}

function requestLabel(data: RequestData): string {
  const first = data.input[0] as (typeof data.input)[number] & {
    metadata?: unknown;
  };
  return extractClientMessageId(first.metadata) ?? "legacy";
}

function OriginalPlugin({
  data,
  children,
}: {
  data: RequestData;
  children: ReactNode;
}) {
  const [note, setNote] = useState("");
  const label = requestLabel(data);
  useEffect(() => {
    mounted(label);
    return () => {
      unmounted(label);
    };
  }, [label]);
  return (
    <div data-testid={`plugin-${label}`}>
      <input
        aria-label={`Plugin note ${label}`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      {children}
    </div>
  );
}

function CopyAction({ data }: { data: RequestData }) {
  return (
    <button
      type="button"
      aria-label={`Copy ${requestLabel(data)}`}
      onClick={() => copied(data)}
    >
      Copy
    </button>
  );
}

function NativeTextLeaf({ data }: { data: { content: string } }) {
  return <span>{data.content}</span>;
}

function NativeFileLeaf() {
  return <span>synthetic.csv</span>;
}

function Fixture({ rows }: { rows: Row[] }) {
  const edit = useMessageEditResend({
    visit,
    queueKey: "chat-inline",
    agentId: "agent-inline",
    enabled: true,
    supportsAttachments: true,
    agents: [],
    displayName: (agent) => agent.name,
    isReady: () => true,
    getIdentity: () => identity,
    prepareQuery: (text) => text,
    captureContext: () => ({ approval_level: "STRICT" }),
  });
  const options: IAgentScopeRuntimeWebUIOptions = {
    api: {},
    request: {
      render: ({ data, fallback }) =>
        edit.renderRequest({
          data,
          fallback: () => (
            <OriginalPlugin data={data}>{fallback()}</OriginalPlugin>
          ),
        }),
      prepend: [
        {
          id: "original-prepend",
          render: ({ data }) => (
            <span data-testid={`prepend-${requestLabel(data)}`}>
              Plugin prepend
            </span>
          ),
        },
      ],
      append: [
        {
          id: "original-append",
          render: ({ data }) => (
            <span data-testid={`append-${requestLabel(data)}`}>
              Plugin append
            </span>
          ),
        },
      ],
    },
    requestActions: {
      list: [{ render: CopyAction }, { render: edit.renderAction }],
    },
    session: {
      currentSessionId: undefined,
      api: {
        getSessionList: async () => [],
        getSession: async (id) => ({ id, name: id, messages: [] }),
        createSession: async () => ({
          sessions: [],
          session: { id: "chat-inline", name: "inline", messages: [] },
        }),
        updateSession: async () => [],
        removeSession: async () => [],
      },
    },
  };
  return (
    <ComposedProvider
      options={options}
      cards={{ Text: NativeTextLeaf, Files: NativeFileLeaf }}
    >
      <input
        aria-label="Unrelated composer draft"
        defaultValue="Keep this draft"
      />
      {rows.map((row) => (
        <section key={row.id} data-testid={`row-${row.id}`}>
          <NativeRequestCard data={row.data} />
        </section>
      ))}
    </ComposedProvider>
  );
}

function tree(rows: Row[]) {
  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <App>
          <Fixture rows={rows} />
        </App>
      </ConfigProvider>
    </I18nextProvider>
  );
}

beforeEach(async () => {
  await i18nReady;
  await i18n.changeLanguage("en");
  localStorage.clear();
  useMessageQueueStore.setState({
    queues: {},
    runStates: {},
    currentSendingId: null,
  });
  copied.mockClear();
  mounted.mockClear();
  unmounted.mockClear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("inline message editing through the installed SDK request card", () => {
  it("edits at the original bubble while retaining plugin fallback, slots and footer instances through cancellation", async () => {
    const source = request("one", true);
    render(tree([{ id: "one", data: source }]));
    const row = screen.getByTestId("row-one");
    const plugin = screen.getByTestId("plugin-one");
    const note = screen.getByRole("textbox", { name: "Plugin note one" });
    const copy = screen.getByRole("button", { name: "Copy one" });
    fireEvent.change(note, { target: { value: "Keep plugin draft" } });
    fireEvent.click(copy);
    expect(copied).toHaveBeenCalledExactlyOnceWith(source);

    fireEvent.click(
      within(row).getByRole("button", { name: "Edit and resend" }),
    );

    const editor = screen.getByRole("textbox", {
      name: "Edit message content",
    });
    expect(row).toContainElement(editor);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("prepend-one")).toBeVisible();
    expect(screen.getByTestId("append-one")).toBeVisible();
    expect(plugin).not.toBeVisible();
    expect(plugin.isConnected).toBe(true);
    expect(copy.isConnected).toBe(true);
    expect(note).toHaveValue("Keep plugin draft");
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(unmounted).not.toHaveBeenCalled();
    fireEvent.change(editor, { target: { value: "Unsent edit" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByRole("textbox", { name: "Edit message content" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("plugin-one")).toBe(plugin);
    expect(screen.getByRole("textbox", { name: "Plugin note one" })).toBe(note);
    expect(screen.getByRole("button", { name: "Copy one" })).toBe(copy);
    expect(plugin).toBeVisible();
    expect(note).toHaveValue("Keep plugin draft");
    expect(within(row).getByText("Identical original question")).toBeVisible();
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(unmounted).not.toHaveBeenCalled();
    expect(useMessageQueueStore.getState().getQueue("chat-inline")).toEqual([]);
  });

  it("keeps one focused textarea while typing and edits only the selected identity among identical messages", async () => {
    const user = userEvent.setup();
    const first = request("first");
    const second = request("second", true);
    useMessageQueueStore.getState().setRunState("chat-inline", "paused");
    render(
      tree([
        { id: "first", data: first },
        { id: "second", data: second },
      ]),
    );
    const composer = screen.getByRole("textbox", {
      name: "Unrelated composer draft",
    });
    const firstRow = screen.getByTestId("row-first");
    const secondRow = screen.getByTestId("row-second");
    await user.click(
      within(secondRow).getByRole("button", { name: "Edit and resend" }),
    );
    const editor = screen.getByRole("textbox", {
      name: "Edit message content",
    });
    expect(editor).toHaveFocus();
    expect(secondRow).toContainElement(editor);
    expect(
      within(firstRow).queryByRole("group", { name: "Edit and resend" }),
    ).not.toBeInTheDocument();
    for (const character of " revised") {
      await user.type(editor, character);
      expect(
        screen.getByRole("textbox", { name: "Edit message content" }),
      ).toBe(editor);
      expect(editor).toHaveFocus();
    }
    expect(editor).toHaveValue("Identical original question revised");
    fireEvent.click(screen.getByRole("button", { name: "Resend" }));

    const queued = useMessageQueueStore.getState().getQueue("chat-inline");
    expect(queued).toHaveLength(1);
    expect(queued[0]).toMatchObject({
      text: "Identical original question revised",
      status: "pending",
      agentId: "agent-inline",
      backendSessionId: "runtime-inline",
      requestContext: { approval_level: "STRICT" },
      attachments: [{ url: "/synthetic.csv", name: "synthetic.csv", size: 12 }],
    });
    expect(queued[0].clientMessageId).not.toBe("second");
    expect(useMessageQueueStore.getState().getRunState("chat-inline")).toBe(
      "paused",
    );
    expect(composer).toHaveValue("Keep this draft");
    expect(
      within(firstRow).getByText("Identical original question"),
    ).toBeVisible();
    expect(
      within(secondRow).getByText("Identical original question"),
    ).toBeVisible();
    expect(first.input[0].content).toEqual([
      { type: "text", text: "Identical original question" },
    ]);
    expect(second.input[0].content).toHaveLength(2);
  });

  it("retains a draft across durable-identity refreshes and cancels a vanished legacy editor instead of moving it", async () => {
    const source = request("durable");
    const view = render(tree([{ id: "persisted", data: source }]));
    fireEvent.click(screen.getByRole("button", { name: "Edit and resend" }));
    const editor = screen.getByRole("textbox", {
      name: "Edit message content",
    });
    fireEvent.change(editor, { target: { value: "Keep durable edit" } });

    view.rerender(tree([{ id: "persisted", data: structuredClone(source) }]));
    expect(screen.getByRole("textbox", { name: "Edit message content" })).toBe(
      editor,
    );
    expect(editor).toHaveValue("Keep durable edit");
    // History can replace the entire outer SDK row in the same commit.
    view.rerender(
      tree([{ id: "refreshed-row", data: structuredClone(source) }]),
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      screen.getByRole("textbox", { name: "Edit message content" }),
    ).toHaveValue("Keep durable edit");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    const legacy = request();
    view.rerender(tree([{ id: "legacy-row", data: legacy }]));
    fireEvent.click(screen.getByRole("button", { name: "Edit and resend" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "Edit message content" }),
      { target: { value: "Do not move this edit" } },
    );
    // Equal content and timestamps cannot identify a different ID-less object.
    view.rerender(tree([{ id: "legacy-row", data: request() }]));
    await waitFor(() =>
      expect(
        screen.queryByRole("textbox", { name: "Edit message content" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Identical original question")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Edit and resend" }));
    expect(
      screen.getByRole("textbox", { name: "Edit message content" }),
    ).toHaveValue("Identical original question");
    expect(useMessageQueueStore.getState().getQueue("chat-inline")).toEqual([]);
  });
});
