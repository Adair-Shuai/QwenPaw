import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const desktop = {
    phase: "idle" as string,
    isBackground: false,
    hasCoreUpdate: false,
    componentUpdateCount: 0,
    supportsLaterInstall: false,
    version: "",
    body: "",
    downloaded: 0,
    total: null as number | null,
    throughputBps: 0,
    error: null,
    checkWarning: null as string | null,
    refreshUpdates: vi.fn(),
    queueComponentUpdates: vi.fn(),
    startInstall: vi.fn(),
    startBackgroundDownload: vi.fn(),
    installDownloaded: vi.fn(),
  };
  return {
    isDesktop: false,
    language: "zh",
    desktop,
    restartForComponentUpdates: vi.fn(),
  };
});

vi.mock("react-i18next", () => {
  const t = (key: string, options?: { version?: string }) =>
    options?.version ? `${key}:${options.version}` : key;
  return {
    useTranslation: () => ({
      t,
      i18n: { language: mocks.language, changeLanguage: vi.fn() },
    }),
  };
});

vi.mock("../contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, setThemeMode: vi.fn() }),
}));

vi.mock("../contexts/DesktopUpdateContext", () => ({
  useDesktopUpdate: () => mocks.desktop,
}));

vi.mock("../tauri/backendRuntime", () => ({
  isDesktopApp: () => mocks.isDesktop,
}));
vi.mock("../tauri/desktopUpdate", () => ({
  restartForComponentUpdates: (...args: unknown[]) =>
    mocks.restartForComponentUpdates(...args),
}));
vi.mock("../api", () => ({
  default: {
    getVersion: vi.fn().mockResolvedValue({ version: "2.1.1b7" }),
    getLatestDesktopVersion: vi.fn().mockResolvedValue({
      version: "2.1.1b7",
    }),
    getLatestCoreVersion: vi.fn().mockResolvedValue({
      version: "2.1.1b7",
    }),
  },
}));
vi.mock("../plugins/registry/Slot", () => ({
  Slot: ({ children }: { children?: ReactNode }) => children ?? null,
}));
vi.mock("../components/LanguageSwitcher/index", () => ({
  default: () => null,
  LANGUAGE_LIST: [],
}));
vi.mock("../components/ThemeToggleButton", () => ({ default: () => null }));

vi.mock("@agentscope-ai/design", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@agentscope-ai/design")>();
  return {
    ...actual,
    Modal: ({
      open,
      footer,
      children,
    }: {
      open?: boolean;
      footer?: ReactNode;
      children?: ReactNode;
    }) =>
      open ? (
        <div role="dialog">
          {children}
          {footer}
        </div>
      ) : null,
  };
});

import AppBrand from "./AppBrand";
import {
  clearResumeComponentUpdatesAfterCore,
  RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY,
  RESUME_COMPONENT_UPDATES_RETRY_MS,
} from "./updateResume";

function updateEntryButton() {
  return screen.getByRole("button", {
    name: /sidebar\.updateModal\.(checkUpdates|updateAvailable|guideTitle)/,
  });
}

function emptyRefreshResult() {
  return {
    available: false,
    hasCoreUpdate: false,
    componentsChecked: true,
    componentCount: 0,
    components: [],
    version: "",
    body: "",
  };
}

function componentRefreshResult(count = 1) {
  return {
    available: count > 0,
    hasCoreUpdate: false,
    componentsChecked: true,
    componentCount: count,
    components: count
      ? [{ component: "demo", from_version: "1.0.0", target_version: "2.0.0" }]
      : [],
    version: "",
    body: "",
  };
}

describe("Header update entry", () => {
  beforeEach(() => {
    mocks.isDesktop = false;
    mocks.language = "zh";
    mocks.desktop.phase = "idle";
    mocks.desktop.isBackground = false;
    mocks.desktop.supportsLaterInstall = false;
    mocks.desktop.hasCoreUpdate = false;
    mocks.desktop.componentUpdateCount = 0;
    mocks.desktop.version = "";
    mocks.desktop.body = "";
    mocks.desktop.checkWarning = null;
    mocks.desktop.refreshUpdates.mockReset().mockImplementation(async () =>
      mocks.desktop.hasCoreUpdate
        ? {
            ...emptyRefreshResult(),
            available: true,
            hasCoreUpdate: true,
            componentsChecked: false,
            version: mocks.desktop.version,
            body: mocks.desktop.body,
          }
        : componentRefreshResult(mocks.desktop.componentUpdateCount),
    );
    mocks.desktop.queueComponentUpdates.mockReset().mockResolvedValue(false);
    mocks.desktop.startInstall.mockReset().mockResolvedValue(undefined);
    mocks.desktop.installDownloaded.mockReset().mockResolvedValue(undefined);
    mocks.restartForComponentUpdates.mockReset().mockResolvedValue(undefined);
    clearResumeComponentUpdatesAfterCore();
  });

  it("always renders the unified update button next to the version", async () => {
    render(<AppBrand />);

    const button = screen.getByRole("button", {
      name: "sidebar.updateModal.guideTitle",
    });
    const version = await screen.findByText("v2.1.1b7");

    expect(button).toBeVisible();
    expect(
      button.querySelector("svg.lucide-cloud-download"),
    ).toBeInTheDocument();
    expect(version).toBeVisible();
    expect(version.closest("[class*='appBrandVersionArea']")).toContainElement(
      button,
    );
  });

  it.each([
    ["zh", "UGSci 桌面端更新", "现在更新", "当前已是最新版本"],
    ["en", "Updating UGSci Desktop", "Update now", "You're up to date"],
    [
      "ru",
      "Обновление UGSci для компьютера",
      "Обновить сейчас",
      "последняя версия",
    ],
  ])(
    "shows desktop-only update instructions without upstream links in %s",
    async (language, heading, installLabel, upToDate) => {
      mocks.language = language;
      render(<AppBrand version="2.2.2" />);
      fireEvent.click(updateEntryButton());
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toHaveTextContent("sidebar.updateModal.guideTitle");
      expect(dialog).toHaveTextContent(
        "sidebar.updateModal.currentVersion:2.2.2",
      );
      expect(dialog).not.toHaveTextContent("sidebar.updateModal.title");
      expect(screen.getByRole("heading", { name: heading })).toBeVisible();
      expect(dialog).toHaveTextContent(installLabel);
      expect(dialog).toHaveTextContent(upToDate);
      expect(dialog).not.toHaveTextContent(
        /源码|仓库|source install|git pull|pip|npm|QWENPAW_|исходник/i,
      );
      expect(dialog.querySelector("pre, code, a")).toBeNull();
      expect(
        screen.queryByRole("button", {
          name: "sidebar.updateModal.viewReleases",
        }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", {
          name: "sidebar.updateModal.installUpdate",
        }),
      ).not.toBeInTheDocument();
      expect(mocks.desktop.refreshUpdates).not.toHaveBeenCalled();
    },
  );

  it("rechecks an existing update badge and does not reopen stale notes when current", async () => {
    mocks.isDesktop = true;
    mocks.desktop.hasCoreUpdate = true;
    mocks.desktop.version = "2.2.2";
    mocks.desktop.body = "Obsolete release notes";
    mocks.desktop.refreshUpdates.mockResolvedValue(emptyRefreshResult());
    render(<AppBrand version="2.2.2" />);
    fireEvent.click(updateEntryButton());
    await waitFor(() =>
      expect(mocks.desktop.refreshUpdates).toHaveBeenCalledTimes(1),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Obsolete release notes"),
    ).not.toBeInTheDocument();
    expect(mocks.desktop.startInstall).not.toHaveBeenCalled();
  });

  it("opens the version and notes returned by the current check", async () => {
    mocks.isDesktop = true;
    mocks.desktop.hasCoreUpdate = true;
    mocks.desktop.version = "2.3.0";
    mocks.desktop.body = "Obsolete notes";
    mocks.desktop.refreshUpdates.mockResolvedValue({
      ...emptyRefreshResult(),
      available: true,
      hasCoreUpdate: true,
      version: "2.4.0",
      body: "Current release notes",
    });
    render(<AppBrand />);
    fireEvent.click(updateEntryButton());
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("sidebar.updateModal.title:2.4.0");
    expect(dialog).toHaveTextContent("Current release notes");
    expect(dialog).not.toHaveTextContent("Obsolete notes");
  });

  it("labels component-only updates separately and shows their actual versions", async () => {
    mocks.isDesktop = true;
    mocks.desktop.componentUpdateCount = 1;
    mocks.desktop.body = "Old desktop changelog";
    mocks.desktop.refreshUpdates.mockResolvedValue(componentRefreshResult(1));
    render(<AppBrand version="2.2.2" />);
    fireEvent.click(updateEntryButton());
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("sidebar.updateModal.componentsTitle");
    expect(dialog).toHaveTextContent("demo 1.0.0 → 2.0.0");
    expect(dialog).not.toHaveTextContent("sidebar.updateModal.title");
    expect(dialog).not.toHaveTextContent("Old desktop changelog");
  });

  it("does not treat a failed refresh of an old badge as an update", async () => {
    mocks.isDesktop = true;
    mocks.desktop.hasCoreUpdate = true;
    mocks.desktop.refreshUpdates.mockRejectedValue(
      new Error("Network unavailable"),
    );
    render(<AppBrand />);
    fireEvent.click(updateEntryButton());
    await waitFor(() =>
      expect(mocks.desktop.refreshUpdates).toHaveBeenCalledTimes(1),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mocks.desktop.startInstall).not.toHaveBeenCalled();
  });

  it("installs the desktop core without queuing components first", async () => {
    mocks.isDesktop = true;
    mocks.desktop.hasCoreUpdate = true;
    mocks.desktop.version = "2.1.1-beta.12";

    render(<AppBrand />);

    fireEvent.click(updateEntryButton());
    fireEvent.click(
      await screen.findByRole("button", {
        name: "sidebar.updateModal.installUpdate",
      }),
    );

    await waitFor(() =>
      expect(mocks.desktop.startInstall).toHaveBeenCalledTimes(1),
    );
    expect(mocks.desktop.queueComponentUpdates).not.toHaveBeenCalled();
    expect(mocks.restartForComponentUpdates).not.toHaveBeenCalled();
    expect(
      window.localStorage.getItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY),
    ).toBe("1");
  });

  it("queues component updates only when the desktop core is current", async () => {
    mocks.isDesktop = true;
    mocks.desktop.hasCoreUpdate = false;
    mocks.desktop.componentUpdateCount = 1;
    mocks.desktop.queueComponentUpdates.mockResolvedValue(true);

    render(<AppBrand />);

    fireEvent.click(updateEntryButton());
    fireEvent.click(
      await screen.findByRole("button", {
        name: "sidebar.updateModal.installUpdate",
      }),
    );

    await waitFor(() =>
      expect(mocks.desktop.queueComponentUpdates).toHaveBeenCalledTimes(1),
    );
    expect(mocks.restartForComponentUpdates).toHaveBeenCalledTimes(1);
    expect(mocks.desktop.startInstall).not.toHaveBeenCalled();
  });

  it("resumes component discovery after a core-install restart", async () => {
    mocks.isDesktop = true;
    window.localStorage.setItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY, "1");
    mocks.desktop.refreshUpdates.mockResolvedValue(componentRefreshResult(1));

    render(<AppBrand />);

    await waitFor(() =>
      expect(mocks.desktop.refreshUpdates).toHaveBeenCalledWith("components"),
    );
    expect(
      await screen.findByRole("button", {
        name: "sidebar.updateModal.installUpdate",
      }),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        window.localStorage.getItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY),
      ).toBeNull(),
    );
  });

  it("keeps the resume marker when the backend is not ready yet", async () => {
    mocks.isDesktop = true;
    window.localStorage.setItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY, "1");
    mocks.desktop.refreshUpdates.mockRejectedValue(
      new Error("Desktop backend is not ready"),
    );

    render(<AppBrand />);

    await waitFor(() =>
      expect(mocks.desktop.refreshUpdates).toHaveBeenCalledWith("components"),
    );
    expect(
      window.localStorage.getItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY),
    ).toBe("1");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("retries resume after a not-ready backend later becomes usable", async () => {
    vi.useFakeTimers();
    mocks.isDesktop = true;
    window.localStorage.setItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY, "1");
    mocks.desktop.refreshUpdates
      .mockRejectedValueOnce(new Error("Desktop backend is not ready"))
      .mockResolvedValueOnce(componentRefreshResult(1));

    try {
      render(<AppBrand />);
      await act(async () => {
        await Promise.resolve();
      });
      expect(mocks.desktop.refreshUpdates).toHaveBeenCalledTimes(1);
      expect(
        window.localStorage.getItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY),
      ).toBe("1");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(RESUME_COMPONENT_UPDATES_RETRY_MS);
      });

      expect(mocks.desktop.refreshUpdates).toHaveBeenCalledTimes(2);
      expect(
        screen.getByRole("button", {
          name: "sidebar.updateModal.installUpdate",
        }),
      ).toBeVisible();
      expect(
        window.localStorage.getItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY),
      ).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not consume the resume marker until components have been checked", async () => {
    mocks.isDesktop = true;
    window.localStorage.setItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY, "1");
    mocks.desktop.refreshUpdates.mockResolvedValue({
      available: true,
      hasCoreUpdate: true,
      componentsChecked: false,
      componentCount: 0,
      version: "2.1.1-beta.12",
      body: "desktop core",
    });

    render(<AppBrand />);

    await waitFor(() =>
      expect(mocks.desktop.refreshUpdates).toHaveBeenCalledWith("components"),
    );
    expect(
      window.localStorage.getItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY),
    ).toBe("1");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clears the resume marker when the new core has no component updates", async () => {
    mocks.isDesktop = true;
    window.localStorage.setItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY, "1");
    mocks.desktop.refreshUpdates.mockResolvedValue(componentRefreshResult(0));

    render(<AppBrand />);

    await waitFor(() =>
      expect(
        window.localStorage.getItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY),
      ).toBeNull(),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not treat a structured empty refresh as an available update", async () => {
    mocks.isDesktop = true;
    mocks.desktop.refreshUpdates.mockResolvedValue(emptyRefreshResult());

    render(<AppBrand />);
    fireEvent.click(updateEntryButton());

    await waitFor(() =>
      expect(mocks.desktop.refreshUpdates).toHaveBeenCalled(),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
