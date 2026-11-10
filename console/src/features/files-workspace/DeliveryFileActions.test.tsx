import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createInstance } from "i18next";
import { ConfigProvider } from "antd";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import type { SessionFilesScope } from "../../api/modules/turnFiles";
import zh from "../../locales/zh.json";
import type { FileTarget } from "./types";
import type {
  DeliveryApplications,
  DeliveryNativeOptions,
} from "./deliveryFileNative";

const mocks = vi.hoisted(() => ({
  available: vi.fn(),
  list: vi.fn(),
  open: vi.fn(),
  reveal: vi.fn(),
  error: vi.fn(),
}));
vi.mock("./deliveryFileNative", () => ({
  isDeliveryNativeAvailable: mocks.available,
  listDeliveryApplications: mocks.list,
  openDeliveryFile: mocks.open,
  revealDeliveryFile: mocks.reveal,
}));
vi.mock("../../hooks/useAppMessage", () => ({
  useAppMessage: () => ({ message: { error: mocks.error } }),
}));

import DeliveryFileActions from "./DeliveryFileActions";

const scope: SessionFilesScope = {
  kind: "session",
  agentId: "agent-a",
  sessionId: "session-a",
  chatId: "chat-a",
};
const file: FileTarget = {
  source: "artifact",
  path: "output/report.docx",
  root: "project",
  artifactUrl: "/api/archive/turn-a/file-a?version=before",
  artifact: {
    id: "turn-file:before",
    title: "report.docx",
    source: "tool_call",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    binaryUrl: "/api/archive/turn-a/file-a?version=before",
    agentId: "agent-a",
    sessionId: "session-a",
    chatId: "chat-a",
    meta: {
      turnFileArchive: true,
      turnId: "turn-a",
      fileId: "file-a",
      version: "before",
    },
  },
};
const listing: DeliveryApplications = {
  applications: [
    {
      id: "wps-writer",
      name: "WPS Writer",
      isDefault: true,
      iconDataUrl: "data:image/png;base64,aWNvbg==",
    },
    {
      id: "microsoft-word",
      name: "Microsoft Word",
      isDefault: false,
      iconDataUrl: "data:image/png;base64,d29yZA==",
    },
  ],
  canOpenDefault: true,
  canChooseApplication: true,
};
const i18n = createInstance();
await i18n.init({
  lng: "zh",
  fallbackLng: "zh",
  resources: { zh: { translation: zh } },
  interpolation: { escapeValue: false },
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
type Props = ComponentProps<typeof DeliveryFileActions>;
function mount(patch: Partial<Props> = {}) {
  const onPreview = vi.fn();
  const props: Props = {
    name: "report.docx",
    target: file,
    scope,
    onPreview,
    ...patch,
  };
  const ui = (values: Props) => (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <DeliveryFileActions {...values} />
      </ConfigProvider>
    </I18nextProvider>
  );
  const rendered = render(ui(props));
  return {
    ...rendered,
    onPreview,
    props,
    rerenderProps: (values: Partial<Props>) =>
      rendered.rerender(ui({ ...props, ...values })),
  };
}
async function openMenu() {
  const trigger = screen.getByRole("button", { name: "打开方式 report.docx" });
  fireEvent.click(trigger);
  const menu = await screen.findByRole("menu");
  await waitFor(() => expect(menu).toBeVisible());
  return { trigger, menu };
}
async function defaultButton() {
  return screen.findByRole("button", {
    name: "使用 WPS Writer 打开 report.docx",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.available.mockReturnValue(true);
  mocks.list.mockResolvedValue(listing);
  mocks.open.mockResolvedValue(undefined);
  mocks.reveal.mockResolvedValue(undefined);
});
afterEach(cleanup);

describe("DeliveryFileActions with real Ant Design menu", () => {
  it("uses built-in preview in browsers and exposes no native application or location actions", async () => {
    mocks.available.mockReturnValue(false);
    const download = vi.fn();
    const { onPreview } = mount({
      moreActions: [
        { key: "download", label: "下载本轮版本", onSelect: download },
      ],
    });
    const primary = screen.getByRole("button", { name: "打开 report.docx" });
    fireEvent.click(primary);
    expect(onPreview).toHaveBeenCalledWith(primary);
    const { menu } = await openMenu();
    expect(menu.closest(".ant-dropdown")).toHaveStyle({
      width: "248px",
      maxWidth: "calc(100vw - 24px)",
    });
    expect(
      within(menu).getByRole("menuitem", { name: "内置预览" }),
    ).toBeVisible();
    expect(
      within(menu).getByRole("menuitem", { name: "下载本轮版本" }),
    ).toBeVisible();
    expect(within(menu).queryByText("显示文件位置")).not.toBeInTheDocument();
    expect(within(menu).queryByText("WPS Writer")).not.toBeInTheDocument();
    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.open).not.toHaveBeenCalled();
    expect(mocks.reveal).not.toHaveBeenCalled();
  });

  it("shows the actual default application icon and directly opens the archived target with its scope", async () => {
    const { onPreview } = mount();
    const primary = await defaultButton();
    expect(primary.querySelector("img")).toHaveAttribute(
      "src",
      listing.applications[0].iconDataUrl,
    );
    fireEvent.click(primary);
    await waitFor(() => expect(mocks.open).toHaveBeenCalledTimes(1));
    expect(mocks.open).toHaveBeenCalledWith(file, scope, undefined, {
      isCurrent: expect.any(Function),
    });
    expect(mocks.open.mock.calls[0][0].artifact.meta.version).toBe("before");
    expect(mocks.open.mock.calls[0][3].isCurrent()).toBe(true);
    expect(onPreview).not.toHaveBeenCalled();
  });

  it("opens a chosen Word application once without changing the system default shown on the primary button", async () => {
    mount();
    await defaultButton();
    const { menu } = await openMenu();
    expect(
      within(menu).getByRole("menuitem", { name: "WPS Writer（默认）" }),
    ).toBeVisible();
    fireEvent.click(
      within(menu).getByRole("menuitem", { name: "Microsoft Word" }),
    );
    await waitFor(() =>
      expect(mocks.open).toHaveBeenCalledWith(file, scope, "microsoft-word", {
        isCurrent: expect.any(Function),
      }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "使用 WPS Writer 打开 report.docx",
        }),
      ).toBeEnabled(),
    );
    expect(mocks.open).toHaveBeenCalledTimes(1);
    expect(mocks.list).toHaveBeenCalledTimes(1);
  });

  it("reveals the same archive version and scope while filtering the legacy workspace location action", async () => {
    const legacyLocation = vi.fn();
    mount({
      moreActions: [
        {
          key: "legacy-location",
          label: "旧工作区定位",
          onSelect: legacyLocation,
        },
      ],
    });
    await defaultButton();
    const { menu } = await openMenu();
    expect(within(menu).queryByText("旧工作区定位")).not.toBeInTheDocument();
    fireEvent.click(
      within(menu).getByRole("menuitem", { name: "显示文件位置" }),
    );
    await waitFor(() =>
      expect(mocks.reveal).toHaveBeenCalledWith(file, scope, {
        isCurrent: expect.any(Function),
      }),
    );
    expect(mocks.reveal.mock.calls[0][0].artifactUrl).toContain(
      "version=before",
    );
    expect(legacyLocation).not.toHaveBeenCalled();
    expect(mocks.open).not.toHaveBeenCalled();
  });

  it("offers built-in preview after association enumeration fails and retries the real menu request", async () => {
    mocks.list.mockRejectedValueOnce(new Error("association unavailable"));
    const { onPreview } = mount();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "打开 report.docx" }),
      ).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "打开 report.docx" }));
    expect(onPreview).toHaveBeenCalledTimes(1);
    const { menu } = await openMenu();
    expect(
      within(menu).getByRole("menuitem", { name: "暂时无法读取系统应用" }),
    ).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(
      within(menu).getByRole("menuitem", { name: "重新读取打开方式" }),
    );
    await defaultButton();
    expect(mocks.list).toHaveBeenCalledTimes(2);
    expect(mocks.error).not.toHaveBeenCalled();
  });

  it("keeps unavailable archive actions disabled while allowing an explicit current-workspace extra action", async () => {
    const current = vi.fn();
    const { onPreview } = mount({
      disabled: true,
      moreActions: [
        { key: "current", label: "打开工作区当前文件", onSelect: current },
      ],
    });
    const primary = screen.getByRole("button", { name: "打开 report.docx" });
    expect(primary).toBeDisabled();
    fireEvent.click(primary);
    const { trigger, menu } = await openMenu();
    expect(
      within(menu).getByRole("menuitem", { name: "内置预览" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      within(menu).getByRole("menuitem", { name: "显示文件位置" }),
    ).toHaveAttribute("aria-disabled", "true");
    const currentItem = within(menu).getByRole("menuitem", {
      name: "打开工作区当前文件",
    });
    expect(currentItem).not.toHaveAttribute("aria-disabled", "true");
    fireEvent.click(currentItem);
    expect(current).toHaveBeenCalledWith(trigger);
    expect(onPreview).not.toHaveBeenCalled();
    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.open).not.toHaveBeenCalled();
  });

  it("invalidates an in-flight native action when navigation changes scope and ignores its late failure", async () => {
    const pending = deferred<void>();
    mocks.open.mockReturnValueOnce(pending.promise);
    const { rerenderProps } = mount();
    fireEvent.click(await defaultButton());
    const options = mocks.open.mock.calls[0][3] as DeliveryNativeOptions;
    expect(options.isCurrent!()).toBe(true);
    const nextScope = {
      ...scope,
      agentId: "agent-b",
      sessionId: "session-b",
      chatId: "chat-b",
    };
    const nextTarget = {
      ...file,
      artifact: {
        ...file.artifact!,
        agentId: "agent-b",
        sessionId: "session-b",
        chatId: "chat-b",
      },
    };
    rerenderProps({ scope: nextScope, target: nextTarget });
    expect(options.isCurrent!()).toBe(false);
    await act(async () => {
      pending.reject(new Error("old action failed"));
    });
    expect(mocks.error).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "使用 WPS Writer 打开 report.docx",
        }),
      ).toBeEnabled(),
    );
    fireEvent.click(await defaultButton());
    expect(mocks.open).toHaveBeenLastCalledWith(
      nextTarget,
      nextScope,
      undefined,
      { isCurrent: expect.any(Function) },
    );
  });

  it("invalidates callbacks on unmount and ignores a native action's later rejection", async () => {
    const pending = deferred<void>();
    mocks.open.mockReturnValueOnce(pending.promise);
    const { unmount } = mount();
    fireEvent.click(await defaultButton());
    const options = mocks.open.mock.calls[0][3] as DeliveryNativeOptions;
    expect(options.isCurrent!()).toBe(true);
    unmount();
    expect(options.isCurrent!()).toBe(false);
    await act(async () => {
      pending.reject(new Error("late open failure"));
    });
    expect(mocks.error).not.toHaveBeenCalled();
  });

  it("discards an old association response after navigation and keeps the new file's default application", async () => {
    const pending = deferred<DeliveryApplications>();
    mocks.list.mockReturnValueOnce(pending.promise);
    const { rerenderProps } = mount();
    rerenderProps({
      target: { ...file, artifactUrl: "/api/archive/new-version" },
    });
    await defaultButton();
    await act(async () => {
      pending.resolve({
        applications: [{ id: "old-app", name: "Old App", isDefault: true }],
        canOpenDefault: true,
        canChooseApplication: true,
      });
    });
    expect(
      screen.getByRole("button", { name: "使用 WPS Writer 打开 report.docx" }),
    ).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: /Old App/ }),
    ).not.toBeInTheDocument();
  });

  it("closes the actual dropdown on Escape and restores focus to its trigger", async () => {
    mount();
    await defaultButton();
    const { trigger, menu } = await openMenu();
    // rc-dropdown waits three animation frames before focusing the menu.
    // Begin keyboard interaction after that actual focus transition.
    await waitFor(() =>
      expect(menu.contains(document.activeElement)).toBe(true),
    );
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(
      within(menu).getByRole("menuitem", { name: "Microsoft Word" }),
      { key: "Escape", code: "Escape" },
    );
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
    expect(trigger).toHaveFocus();
    await waitFor(() => expect(menu).not.toBeVisible());
  });

  it("reports an active native failure once and allows an explicit retry", async () => {
    mocks.open.mockRejectedValueOnce(new Error("native open failed"));
    mount();
    fireEvent.click(await defaultButton());
    await waitFor(() =>
      expect(mocks.error).toHaveBeenCalledWith(
        "文件未能打开，请重试或下载后打开",
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "使用 WPS Writer 打开 report.docx",
        }),
      ).toBeEnabled(),
    );
    fireEvent.click(await defaultButton());
    await waitFor(() => expect(mocks.open).toHaveBeenCalledTimes(2));
    expect(mocks.error).toHaveBeenCalledTimes(1);
  });
});
