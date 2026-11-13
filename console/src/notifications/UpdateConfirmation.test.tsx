import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UpdateEventHandlers } from "../tauri/desktopUpdate";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  onUpdateEvent: vi.fn(),
  isDark: false,
}));
vi.mock("@tauri-apps/api/core", () => ({ invoke: mocks.invoke }));
vi.mock("../tauri/backendRuntime", () => ({ isDesktopApp: () => true }));
vi.mock("../tauri/desktopUpdate", () => ({
  checkCachedUpdate: async () => null,
  checkDesktopUpdate: vi.fn(),
  downloadDesktopUpdate: vi.fn(),
  installDesktopUpdate: vi.fn(),
  installDownloadedUpdate: vi.fn(),
  onUpdateEvent: mocks.onUpdateEvent,
}));
vi.mock("../api", () => ({ default: {} }));
vi.mock("../contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: mocks.isDark }),
}));

import {
  DesktopUpdateProvider,
  useDesktopUpdate,
} from "../contexts/DesktopUpdateContext";

const locales = Object.entries(
  import.meta.glob<Record<string, unknown>>("../locales/*.json", {
    eager: true,
    import: "default",
  }),
).map(([path, resource]) => [path.split("/").pop()!, resource] as const);
let handlers: UpdateEventHandlers;

function Workspace() {
  const { phase } = useDesktopUpdate();
  return <output aria-label="Workspace update phase">{phase}</output>;
}

async function requestUpdate(language = "zh.json", otherWindows = 2) {
  const resource = locales.find(([name]) => name === language)![1];
  const locale = language.replace(".json", "");
  const i18n = createInstance();
  await i18n.init({
    lng: locale,
    fallbackLng: false,
    resources: { [locale]: { translation: resource } },
    interpolation: { escapeValue: false },
  });
  render(
    <I18nextProvider i18n={i18n}>
      <DesktopUpdateProvider>
        <Workspace />
      </DesktopUpdateProvider>
    </I18nextProvider>,
  );
  await act(async () => {
    handlers.onConfirmation?.({ requestId: "ugsci-update-1", otherWindows });
  });
  return i18n;
}

describe("UGSci desktop update confirmation", () => {
  beforeEach(() => {
    mocks.invoke.mockReset().mockResolvedValue(undefined);
    mocks.isDark = false;
    handlers = {};
    mocks.onUpdateEvent.mockImplementation((next: UpdateEventHandlers) => {
      handlers = next;
      return Promise.resolve(() => {});
    });
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it.each(locales)(
    "shows the UGSci update confirmation through the desktop provider in %s",
    async (language, resource) => {
      await requestUpdate(language);
      const dialog = screen.getByRole("dialog", { name: /UGSci/ });
      expect(dialog).not.toHaveTextContent("QwenPaw");
      expect(screen.getByRole("button", { name: /UGSci/ })).toBeEnabled();
      expect(dialog).toHaveAccessibleDescription(/2/);
      expect(screen.getByRole("img", { name: "UGSci" })).toHaveAttribute(
        "src",
        "/ugsci-mono/brand/lockup-black.svg",
      );
      expect(screen.getByLabelText("Workspace update phase")).toHaveTextContent(
        "downloaded",
      );
      const sidebar = resource.sidebar as { updateModal?: unknown };
      expect(JSON.stringify(sidebar?.updateModal ?? {})).not.toContain(
        "QwenPaw",
      );
      expect(mocks.invoke).not.toHaveBeenCalled();
    },
  );

  it("keeps cancellation available without starting installation", async () => {
    const i18n = await requestUpdate("zh.json", 0);
    const cancelButtons = screen.getAllByRole("button", {
      name: i18n.t("common.cancel"),
    });
    expect(cancelButtons[cancelButtons.length - 1]).toHaveFocus();
    const dialog = screen.getByRole("dialog", { name: "更新 UGSci？" });
    expect(dialog).not.toHaveTextContent("还有");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenCalledWith("confirm_desktop_update", {
        requestId: "ugsci-update-1",
        confirmed: false,
      }),
    );
    act(() => handlers.onCancelled?.());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Workspace update phase")).toHaveTextContent(
      "downloaded",
    );
  });

  it.each(["common.cancel", "dismiss"])("cancels using %s", async (action) => {
    const i18n = await requestUpdate();
    const buttons = screen.getAllByRole("button", {
      name: i18n.t("common.cancel"),
    });
    fireEvent.click(buttons[action === "dismiss" ? 0 : 1]);
    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenCalledWith("confirm_desktop_update", {
        requestId: "ugsci-update-1",
        confirmed: false,
      }),
    );
  });

  it("submits confirmation once and keeps the dialog busy until installation starts", async () => {
    await requestUpdate();
    const confirm = screen.getByRole("button", { name: "关闭并更新 UGSci" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
    expect(mocks.invoke).toHaveBeenCalledWith("confirm_desktop_update", {
      requestId: "ugsci-update-1",
      confirmed: true,
    });
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    screen.getAllByRole("button").forEach((button) => {
      expect(button).toBeDisabled();
    });
    await act(async () => handlers.onInstallStart?.());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Workspace update phase")).toHaveTextContent(
      "installing",
    );
  });

  it("allows retry after a failed confirmation", async () => {
    mocks.invoke.mockRejectedValueOnce(new Error("Cannot close shared window"));
    await requestUpdate();
    fireEvent.click(screen.getByRole("button", { name: "关闭并更新 UGSci" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cannot close shared window",
    );
    const confirm = screen.getByRole("button", { name: "关闭并更新 UGSci" });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("uses the light brand asset on dark surfaces", async () => {
    mocks.isDark = true;
    await requestUpdate("en.json", 1);
    expect(screen.getByRole("img", { name: "UGSci" })).toHaveAttribute(
      "src",
      "/ugsci-mono/brand/lockup-white.svg",
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      /1 other window is open/,
    );
  });
});
