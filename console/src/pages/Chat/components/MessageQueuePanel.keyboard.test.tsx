import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { App, ConfigProvider } from "antd";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n, { i18nReady } from "../../../i18n";
import {
  useMessageQueueStore,
  type QueueItem,
} from "../../../stores/messageQueueStore";
import MessageQueuePanel from "./MessageQueuePanel";

// Keep Ant's installed Input/rc-input and Tooltip intact; the shared design
// button is a leaf and has no role in composition or editing behavior.
vi.mock("@agentscope-ai/design", () => ({
  IconButton: ({
    icon,
    onClick,
    disabled,
    "aria-label": ariaLabel,
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: ReactNode;
    bordered?: boolean;
    size?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  ),
}));

const queueKey = "queue-keyboard";
const edit = vi.fn();
const emptyItems: QueueItem[] = [];
const attachment = {
  url: "/synthetic.csv",
  name: "synthetic.csv",
  type: "text/csv",
};

function Fixture() {
  const items = useMessageQueueStore(
    (state) => state.queues[queueKey] ?? emptyItems,
  );
  const runState = useMessageQueueStore(
    (state) => state.runStates[queueKey] ?? "idle",
  );
  return (
    <MessageQueuePanel
      items={items}
      runState={runState}
      onEdit={(id, text) => {
        edit(id, text);
        useMessageQueueStore.getState().edit(queueKey, id, text);
      }}
      onRemove={(id) => useMessageQueueStore.getState().remove(queueKey, id)}
      onReorder={(next) =>
        useMessageQueueStore.getState().reorder(queueKey, next)
      }
      onClear={() => useMessageQueueStore.getState().clear(queueKey)}
      onInterruptAndSend={vi.fn()}
      onPauseResume={vi.fn()}
      onRetry={vi.fn()}
      onSkip={vi.fn()}
    />
  );
}

async function setupEditor() {
  const store = useMessageQueueStore.getState();
  store.enqueue(queueKey, {
    text: "未编辑的原始队列内容",
    attachments: [{ ...attachment }],
  });
  store.setRunState(queueKey, "paused");
  render(
    <I18nextProvider i18n={i18n}>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <App>
          <Fixture />
        </App>
      </ConfigProvider>
    </I18nextProvider>,
  );
  const button = screen.getByRole("button", {
    name: i18n.t("chat.queue.edit"),
  });
  fireEvent.click(button);
  const input = (await screen.findByRole("textbox")) as HTMLInputElement;
  expect(input.tagName).toBe("INPUT");
  return { input, store, originalId: store.getQueue(queueKey)[0].id };
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
  edit.mockClear();
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

describe("queue editor keyboard with installed Ant Input and real store", () => {
  it.each([
    ["native composing flag", { isComposing: true }],
    ["IME key code 229", { keyCode: 229 }],
  ])(
    "keeps candidate confirmation Enter in the queue editor (%s) and saves only the committed legitimate Enter",
    async (_label, keyboardFlags) => {
      const { input, store, originalId } = await setupEditor();
      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: "候选中的中文" } });
      fireEvent.keyDown(input, {
        key: "Enter",
        code: "Enter",
        ...keyboardFlags,
      });
      await act(async () => {});
      expect.soft(edit).not.toHaveBeenCalled();
      expect.soft(store.getQueue(queueKey)[0]).toMatchObject({
        id: originalId,
        text: "未编辑的原始队列内容",
        status: "pending",
      });
      expect(screen.queryByRole("textbox")).toBe(input);
      expect(input).toHaveValue("候选中的中文");

      fireEvent.keyUp(input, { key: "Enter", ...keyboardFlags });
      fireEvent.compositionEnd(input, { data: "中文" });
      fireEvent.change(input, { target: { value: "已提交的中文" } });
      fireEvent.keyDown(input, {
        key: "Enter",
        code: "Enter",
        isComposing: false,
        keyCode: 13,
      });
      await waitFor(() =>
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument(),
      );
      expect(edit).toHaveBeenCalledExactlyOnceWith(originalId, "已提交的中文");
      expect(store.getQueue(queueKey)[0]).toMatchObject({
        id: originalId,
        text: "已提交的中文",
        status: "pending",
      });
      expect(store.getRunState(queueKey)).toBe("paused");
    },
  );

  it("keeps the editor during composing Escape and cancels only a legitimate Escape without persisting its draft", async () => {
    const { input, store } = await setupEditor();
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "不应取消的候选中文" } });
    fireEvent.keyDown(input, {
      key: "Escape",
      isComposing: true,
      keyCode: 229,
    });
    await act(async () => {});
    expect(screen.queryByRole("textbox")).toBe(input);
    expect(input).toHaveValue("不应取消的候选中文");
    expect(edit).not.toHaveBeenCalled();
    expect(store.getQueue(queueKey)[0].text).toBe("未编辑的原始队列内容");
    fireEvent.compositionEnd(input, { data: "中文" });
    fireEvent.keyDown(input, {
      key: "Escape",
      isComposing: false,
      keyCode: 27,
    });
    await waitFor(() =>
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument(),
    );
    expect(edit).not.toHaveBeenCalled();
    expect(store.getQueue(queueKey)[0].text).toBe("未编辑的原始队列内容");
    expect(store.getRunState(queueKey)).toBe("paused");
  });

  it("saves one ordinary Enter edit without changing identity, attachments or pause state", async () => {
    const { input, store, originalId } = await setupEditor();
    fireEvent.change(input, { target: { value: "  正常修改  " } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", keyCode: 13 });
    await waitFor(() =>
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument(),
    );
    expect(edit).toHaveBeenCalledExactlyOnceWith(originalId, "正常修改");
    expect(store.getQueue(queueKey)).toEqual([
      expect.objectContaining({
        id: originalId,
        text: "正常修改",
        status: "pending",
        attachments: [attachment],
      }),
    ]);
    expect(store.getRunState(queueKey)).toBe("paused");
  });

  it("gives every queue action a localized accessible button name and updates pause or resume with its run state", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue(queueKey, { text: "待发送" });
    store.enqueue(queueKey, { text: "发送失败" });
    store.setItemStatus(queueKey, store.getQueue(queueKey)[1].id, "failed");
    store.setRunState(queueKey, "paused");
    render(
      <I18nextProvider i18n={i18n}>
        <ConfigProvider theme={{ token: { motion: false } }}>
          <App>
            <Fixture />
          </App>
        </ConfigProvider>
      </I18nextProvider>,
    );
    for (const key of ["resume", "clear", "retry", "skip"]) {
      expect(
        screen.getByRole("button", { name: i18n.t(`chat.queue.${key}`) }),
      ).toBeInTheDocument();
    }
    for (const key of ["edit", "delete", "interruptAndSend"]) {
      expect(
        screen.getAllByRole("button", { name: i18n.t(`chat.queue.${key}`) }),
      ).toHaveLength(2);
    }
    act(() => store.setRunState(queueKey, "running"));
    expect(
      screen.getByRole("button", { name: i18n.t("chat.queue.pause") }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: i18n.t("chat.queue.resume") }),
    ).not.toBeInTheDocument();
  });

  it("preserves explicit blur saving and resets composition state before the next edit", async () => {
    const { input, store, originalId } = await setupEditor();
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "明确移出编辑框后的内容" } });
    fireEvent.blur(input);
    await waitFor(() =>
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument(),
    );
    expect(edit).toHaveBeenCalledExactlyOnceWith(
      originalId,
      "明确移出编辑框后的内容",
    );
    expect(store.getQueue(queueKey)[0].text).toBe("明确移出编辑框后的内容");
    fireEvent.click(
      screen.getByRole("button", { name: i18n.t("chat.queue.edit") }),
    );
    const nextInput = await screen.findByRole("textbox");
    fireEvent.change(nextInput, { target: { value: "下一次正常编辑" } });
    fireEvent.keyDown(nextInput, { key: "Enter", keyCode: 13 });
    await waitFor(() =>
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument(),
    );
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenLastCalledWith(originalId, "下一次正常编辑");
    expect(store.getRunState(queueKey)).toBe("paused");
  });
});
