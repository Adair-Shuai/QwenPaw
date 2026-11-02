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
import { I18nextProvider } from "react-i18next";
import ComposedProvider from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/ChatAnywhere/ComposedProvider";
import SdkInput from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Chat/Input";
import type { IAgentScopeRuntimeWebUIOptions } from "@agentscope-ai/chat";
import type { ComponentProps } from "react";
import i18n, { i18nReady } from "../../../i18n";
import {
  MAX_QUEUE_SIZE,
  useMessageQueueStore,
} from "../../../stores/messageQueueStore";
import { LongTextPasteInput, LongTextPasteProvider } from "../LongTextPaste";
import defaultConfig from "../OptionsPanel/defaultConfig";
import { useMessageEditResend } from "../hooks/useMessageEditResend";

// Input/Sender and the editing hook/store are real. Only the shared test design
// alias's ConfigContext and missing icon leaves need compatibility shims.
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

const queueKey = "chat-keyboard";
const visit = {};
const identity = {
  sdkSessionId: queueKey,
  chatId: queueKey,
  sessionId: "runtime-keyboard",
  userId: "keyboard-user",
  channel: "console",
};
const historicalRequest = {
  input: [
    {
      role: "user",
      content: [{ type: "text", text: "原始问题" }],
      metadata: { qwenpaw_client_message_id: "historical-keyboard" },
    },
  ],
};
type BeforeSubmit = NonNullable<
  NonNullable<IAgentScopeRuntimeWebUIOptions["sender"]>["beforeSubmit"]
>;
type Submit = ComponentProps<typeof SdkInput>["onSubmit"];

function Fixture({
  beforeSubmit,
  submit,
}: {
  beforeSubmit: BeforeSubmit;
  submit: Submit;
}) {
  const editing = useMessageEditResend({
    visit,
    queueKey,
    agentId: "keyboard-agent",
    enabled: true,
    supportsAttachments: true,
    agents: [],
    displayName: (agent) => agent.name,
    isReady: () => true,
    getIdentity: () => identity,
    prepareQuery: (text) => text,
    captureContext: () => ({ approval_level: "STRICT" }),
  });
  return (
    <LongTextPasteProvider enabled={false} scopeKey={queueKey}>
      <ComposedProvider
        cards={{}}
        options={{
          api: {},
          session: {},
          sender: {
            ...defaultConfig.sender,
            attachments: undefined,
            placeholder: "Main composer",
            beforeSubmit,
            components: { input: LongTextPasteInput },
          },
        }}
      >
        <section aria-label="Historical message">
          {editing.renderRequest({
            data: historicalRequest,
            fallback: () => <p>原始问题</p>,
          })}
          {editing.renderAction({ data: historicalRequest })}
        </section>
        <SdkInput onCancel={vi.fn()} onSubmit={submit} />
      </ComposedProvider>
    </LongTextPasteProvider>
  );
}

function setup() {
  const beforeSubmit = vi.fn<BeforeSubmit>(async () => true);
  const submit = vi.fn<Submit>();
  render(
    <I18nextProvider i18n={i18n}>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <App>
          <Fixture beforeSubmit={beforeSubmit} submit={submit} />
        </App>
      </ConfigProvider>
    </I18nextProvider>,
  );
  return {
    beforeSubmit,
    submit,
    composer: screen.getByPlaceholderText(
      "Main composer",
    ) as HTMLTextAreaElement,
  };
}

async function openEditor() {
  const trigger = screen.getByRole("button", {
    name: i18n.t("chat.editResend.action"),
  });
  fireEvent.click(trigger);
  const group = await screen.findByRole("group", {
    name: i18n.t("chat.editResend.action"),
  });
  return {
    trigger,
    group,
    editor: within(group).getByRole("textbox") as HTMLTextAreaElement,
  };
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
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  useMessageQueueStore.setState({
    queues: {},
    runStates: {},
    currentSendingId: null,
  });
});

describe("composer keyboard integration with the installed SDK", () => {
  it("never admits or submits a composing Chinese Enter and submits the committed text on the next Enter", async () => {
    const { composer, beforeSubmit, submit } = setup();
    fireEvent.change(composer, { target: { value: "组合中的中文" } });
    fireEvent.compositionStart(composer);
    fireEvent.keyDown(composer, {
      key: "Enter",
      code: "Enter",
      isComposing: true,
      keyCode: 229,
    });
    await act(async () => {});
    expect(beforeSubmit).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
    expect(composer).toHaveValue("组合中的中文");
    expect(useMessageQueueStore.getState().getQueue(queueKey)).toEqual([]);

    fireEvent.compositionEnd(composer, { data: "中文" });
    fireEvent.keyDown(composer, {
      key: "Enter",
      code: "Enter",
      isComposing: false,
    });
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(beforeSubmit).toHaveBeenCalledTimes(1);
    expect(submit.mock.calls[0][0].query).toBe("组合中的中文");
  });

  it("keeps Shift Enter as an editable newline and sends the complete multiline draft only on plain Enter", async () => {
    const user = userEvent.setup();
    const { composer, beforeSubmit, submit } = setup();
    await user.click(composer);
    await user.type(composer, "前文");
    await user.keyboard("{Shift>}{Enter}{/Shift}后文");
    expect(composer).toHaveValue("前文\n后文");
    expect(beforeSubmit).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(submit.mock.calls[0][0].query).toBe("前文\n后文");
  });

  it("retains an inline Chinese edit during composing Enter and Escape, then cancels without queuing and restores action focus", async () => {
    const { composer, beforeSubmit, submit } = setup();
    fireEvent.change(composer, { target: { value: "独立主输入草稿" } });
    const { editor, group, trigger } = await openEditor();
    fireEvent.change(editor, { target: { value: "正在编辑中文" } });
    fireEvent.compositionStart(editor);
    fireEvent.keyDown(editor, {
      key: "Enter",
      ctrlKey: true,
      isComposing: true,
    });
    fireEvent.keyDown(editor, { key: "Escape", isComposing: true });
    await act(async () => {});
    expect(group).toBeVisible();
    expect(editor).toHaveValue("正在编辑中文");
    expect(useMessageQueueStore.getState().getQueue(queueKey)).toEqual([]);
    expect(beforeSubmit).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
    fireEvent.compositionEnd(editor);
    fireEvent.keyDown(editor, { key: "Escape", isComposing: false });
    await waitFor(() => expect(group).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.getByText("原始问题")).toBeVisible();
    expect(composer).toHaveValue("独立主输入草稿");
    expect(useMessageQueueStore.getState().getQueue(queueKey)).toEqual([]);
  });

  it.each(["ctrlKey", "metaKey"] as const)(
    "keeps a full-queue inline draft on %s Enter and enqueues exactly once after capacity returns without clearing the main input",
    async (modifier) => {
      const store = useMessageQueueStore.getState();
      for (let index = 0; index < MAX_QUEUE_SIZE; index++)
        store.enqueue(queueKey, { text: `queued-${index}` });
      store.setRunState(queueKey, "paused");
      const { composer, submit, beforeSubmit } = setup();
      fireEvent.change(composer, { target: { value: "不要清空主输入" } });
      const { editor, group } = await openEditor();
      fireEvent.change(editor, { target: { value: "修订后问题" } });
      fireEvent.keyDown(editor, { key: "Enter", [modifier]: true });
      expect(within(group).getByRole("alert")).toHaveTextContent(
        i18n.t("chat.queue.queueFull", { max: MAX_QUEUE_SIZE }),
      );
      expect(editor).toHaveValue("修订后问题");
      expect(store.getQueue(queueKey)).toHaveLength(MAX_QUEUE_SIZE);
      expect(store.getRunState(queueKey)).toBe("paused");
      store.remove(queueKey, store.getQueue(queueKey)[0].id);
      fireEvent.keyDown(editor, { key: "Enter", [modifier]: true });
      fireEvent.keyDown(editor, { key: "Enter", [modifier]: true });
      await waitFor(() => expect(group).not.toBeInTheDocument());
      expect(store.getQueue(queueKey)).toHaveLength(MAX_QUEUE_SIZE);
      expect(
        store.getQueue(queueKey).filter((item) => item.text === "修订后问题"),
      ).toHaveLength(1);
      expect(store.getRunState(queueKey)).toBe("paused");
      expect(composer).toHaveValue("不要清空主输入");
      expect(submit).not.toHaveBeenCalled();
      expect(beforeSubmit).not.toHaveBeenCalled();
    },
  );

  it("appends an inline keyboard resend without resolving or replacing an unconfirmed steering item", async () => {
    const store = useMessageQueueStore.getState();
    store.enqueue(queueKey, { text: "待确认补充" });
    const claimed = store.getQueue(queueKey)[0];
    expect(store.beginSteering(queueKey, claimed.id, "current-run")).toBe(true);
    store.setRunState(queueKey, "paused");
    const { composer, submit, beforeSubmit } = setup();
    fireEvent.change(composer, { target: { value: "保持主输入" } });
    const { editor, group } = await openEditor();
    fireEvent.change(editor, { target: { value: "后续独立消息" } });
    fireEvent.keyDown(editor, { key: "Enter", ctrlKey: true });
    await waitFor(() => expect(group).not.toBeInTheDocument());
    expect(store.getQueue(queueKey)).toEqual([
      expect.objectContaining({
        id: claimed.id,
        status: "steering",
        steering: expect.objectContaining({ runId: "current-run" }),
        text: "待确认补充",
      }),
      expect.objectContaining({ status: "pending", text: "后续独立消息" }),
    ]);
    expect(store.getRunState(queueKey)).toBe("paused");
    expect(composer).toHaveValue("保持主输入");
    expect(beforeSubmit).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });
});
