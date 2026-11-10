import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App, ConfigProvider } from "antd";
import type { ComponentProps } from "react";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ComposedProvider from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/ChatAnywhere/ComposedProvider";
import SdkInput from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Chat/Input";
import type { IAgentScopeRuntimeWebUIOptions } from "@agentscope-ai/chat";
import i18n, { i18nReady } from "../../i18n";
import { getDraftStorageKey, useChatInputDraft } from "./chatInputDraft";
import { LongTextPasteInput, LongTextPasteProvider } from "./LongTextPaste";
import defaultConfig from "./OptionsPanel/defaultConfig";
import { useMessageQueueStore } from "../../stores/messageQueueStore";

vi.mock("@agentscope-ai/design", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  ConfigProvider: (await import("antd")).ConfigProvider,
}));

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

const agent = "draft-sdk-agent";
const chat = "draft-sdk-chat";
const submitted = vi.fn<ComponentProps<typeof SdkInput>["onSubmit"]>();
type BeforeSubmit = NonNullable<
  NonNullable<IAgentScopeRuntimeWebUIOptions["sender"]>["beforeSubmit"]
>;

function Fixture({
  mounted = true,
  agentId = agent,
  sessionId = chat,
  beforeSubmit,
}: {
  mounted?: boolean;
  agentId?: string;
  sessionId?: string;
  beforeSubmit?: BeforeSubmit;
}) {
  useChatInputDraft(true, agentId, sessionId);
  const [version, setVersion] = useState(0);
  return (
    <>
      <button onClick={() => setVersion((value) => value + 1)}>
        Remount composer
      </button>
      {mounted && (
        <LongTextPasteProvider
          enabled={false}
          scopeKey={`${agentId}:${sessionId}`}
        >
          <ComposedProvider
            key={version}
            cards={{}}
            options={{
              api: {},
              session: {},
              sender: {
                ...defaultConfig.sender,
                attachments: undefined,
                placeholder: "Draft SDK composer",
                components: { input: LongTextPasteInput },
                beforeSubmit,
                // Match the actual host beforeUI order. These toolbar classes precede
                // the SDK sender, contain "sender", and do not contain a textarea.
                beforeUI: (
                  <div data-composer-metadata>
                    <span className="index-module__senderProjectControl__fixture">
                      Workspace
                    </span>
                    <span className="index-module__senderContextAffix__fixture">
                      Context
                    </span>
                    <span className="index-module__senderApprovalControl__fixture">
                      Approval
                    </span>
                  </div>
                ),
              },
            }}
          >
            <SdkInput onCancel={vi.fn()} onSubmit={submitted} />
          </ComposedProvider>
        </LongTextPasteProvider>
      )}
    </>
  );
}

function tree(props: ComponentProps<typeof Fixture> = {}) {
  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <App>
          <Fixture {...props} />
        </App>
      </ConfigProvider>
    </I18nextProvider>
  );
}

function composer() {
  return screen.getByPlaceholderText(
    "Draft SDK composer",
  ) as HTMLTextAreaElement;
}
async function settled() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

beforeEach(async () => {
  await i18nReady;
  await i18n.changeLanguage("en");
  localStorage.clear();
  sessionStorage.clear();
  submitted.mockClear();
  useMessageQueueStore.setState({
    queues: {},
    runStates: {},
    currentSendingId: null,
  });
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  useMessageQueueStore.setState({
    queues: {},
    runStates: {},
    currentSendingId: null,
  });
});

describe("persisted drafts with the installed SDK sender", () => {
  it("restores a typed draft and its selection after a complete remount with the real metadata toolbar before the sender", async () => {
    const user = userEvent.setup();
    const view = render(tree());
    await user.click(composer());
    await user.type(composer(), "reload draft verification 20261101");
    composer().setSelectionRange(7, 12);
    fireEvent.input(composer());
    const saved = localStorage.getItem(getDraftStorageKey(agent, chat));
    expect(saved).toContain("reload draft verification 20261101");
    view.unmount();
    const restored = render(tree());
    await waitFor(() =>
      expect(composer()).toHaveValue("reload draft verification 20261101"),
    );
    await waitFor(() =>
      expect([composer().selectionStart, composer().selectionEnd]).toEqual([
        7, 12,
      ]),
    );
    expect(submitted).not.toHaveBeenCalled();
    expect(
      JSON.parse(localStorage.getItem(getDraftStorageKey(agent, chat))!),
    ).toMatchObject({ selectionStart: 7, selectionEnd: 12 });
    restored.unmount();
    render(tree());
    await waitFor(() =>
      expect([
        composer().value,
        composer().selectionStart,
        composer().selectionEnd,
      ]).toEqual(["reload draft verification 20261101", 7, 12]),
    );
  });

  it("restores after a sender mounts beyond the old polling window without repeatedly rewriting an already mounted input", async () => {
    localStorage.setItem(
      getDraftStorageKey(agent, chat),
      JSON.stringify({
        value: "slow initialization draft",
        selectionStart: 4,
        selectionEnd: 8,
      }),
    );
    const view = render(tree({ mounted: false }));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2100));
    });
    view.rerender(tree());
    await waitFor(() =>
      expect(composer()).toHaveValue("slow initialization draft"),
    );
    fireEvent.change(composer(), {
      target: { value: "new user input takes priority" },
    });
    await settled();
    view.rerender(tree());
    await settled();
    expect(composer()).toHaveValue("new user input takes priority");
    expect(submitted).not.toHaveBeenCalled();
  });

  it("restores the latest user revision into a replaced SDK sender and never resurrects a deliberately cleared draft", async () => {
    const view = render(tree());
    const user = userEvent.setup();
    await user.type(composer(), "latest revision");
    await settled();
    const oldInput = composer();
    fireEvent.click(screen.getByRole("button", { name: "Remount composer" }));
    await waitFor(() => expect(composer()).not.toBe(oldInput));
    await waitFor(() => expect(composer()).toHaveValue("latest revision"));
    await user.clear(composer());
    expect(localStorage.getItem(getDraftStorageKey(agent, chat))).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Remount composer" }));
    await settled();
    expect(composer()).toHaveValue("");
    view.unmount();
    render(tree());
    await settled();
    expect(composer()).toHaveValue("");
  });

  it.each(["sent", "queued"] as const)(
    "does not resurrect a %s draft when host admission clears storage without a native input event",
    async (mode) => {
      const beforeSubmit = vi.fn<BeforeSubmit>(async (data) => {
        if (mode === "queued")
          useMessageQueueStore.getState().enqueue(chat, { text: data.query });
        localStorage.removeItem(getDraftStorageKey(agent, chat));
        return { proceed: mode === "sent", clear: true };
      });
      render(tree({ beforeSubmit }));
      const user = userEvent.setup();
      await user.type(composer(), "accepted input must not return");
      expect(localStorage.getItem(getDraftStorageKey(agent, chat))).toContain(
        "accepted input must not return",
      );
      await user.keyboard("{Enter}");
      await waitFor(() => expect(composer()).toHaveValue(""));
      expect(beforeSubmit).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem(getDraftStorageKey(agent, chat))).toBeNull();
      expect(submitted).toHaveBeenCalledTimes(mode === "sent" ? 1 : 0);
      if (mode === "queued")
        expect(useMessageQueueStore.getState().getQueue(chat)).toEqual([
          expect.objectContaining({
            text: "accepted input must not return",
            status: "pending",
          }),
        ]);
      const oldInput = composer();
      fireEvent.click(screen.getByRole("button", { name: "Remount composer" }));
      await waitFor(() => expect(composer()).not.toBe(oldInput));
      await settled();
      expect(composer()).toHaveValue("");
      expect(localStorage.getItem(getDraftStorageKey(agent, chat))).toBeNull();
    },
  );

  it("avoids document scans during answer mutations and still restores a replaced real sender", async () => {
    render(tree());
    await userEvent.setup().type(composer(), "keep my draft");
    await settled();
    const answer = document.createElement("div");
    document.body.append(answer);
    const query = vi.spyOn(document, "querySelector");
    try {
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          answer.textContent = `stream delta ${i}`;
        });
      }
      expect(
        query.mock.calls.filter(([selector]) => selector.includes("textarea")),
      ).toHaveLength(0);
      expect(composer()).toHaveValue("keep my draft");
      fireEvent.click(screen.getByRole("button", { name: "Remount composer" }));
      await waitFor(() => expect(composer()).toHaveValue("keep my draft"));
      expect(
        query.mock.calls.some(([selector]) => selector.includes("textarea")),
      ).toBe(true);
      expect(submitted).not.toHaveBeenCalled();
    } finally {
      query.mockRestore();
      answer.remove();
    }
  });

  it("uses the current stored revision for a replacement without rewriting the input still being edited", async () => {
    render(tree());
    const user = userEvent.setup();
    await user.type(composer(), "current mounted revision");
    localStorage.setItem(
      getDraftStorageKey(agent, chat),
      JSON.stringify({
        value: "newer stored revision",
        selectionStart: 3,
        selectionEnd: 8,
      }),
    );
    await settled();
    expect(composer()).toHaveValue("current mounted revision");
    fireEvent.click(screen.getByRole("button", { name: "Remount composer" }));
    await waitFor(() =>
      expect(composer()).toHaveValue("newer stored revision"),
    );
    await waitFor(() =>
      expect([composer().selectionStart, composer().selectionEnd]).toEqual([
        3, 8,
      ]),
    );
    expect(
      JSON.parse(localStorage.getItem(getDraftStorageKey(agent, chat))!).value,
    ).toBe("newer stored revision");
    expect(submitted).not.toHaveBeenCalled();
  });
});
