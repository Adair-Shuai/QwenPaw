import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

vi.mock("../contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, setThemeMode: vi.fn() }),
}));

vi.mock("../contexts/DesktopUpdateContext", () => ({
  useDesktopUpdate: () => ({
    phase: "idle",
    isBackground: false,
    hasCoreUpdate: false,
    componentUpdateCount: 0,
    supportsLaterInstall: false,
    version: "",
    body: "",
    downloaded: 0,
    total: null,
    throughputBps: 0,
    error: null,
    checkWarning: null,
    refreshUpdates: vi.fn().mockResolvedValue(false),
    queueComponentUpdates: vi.fn().mockResolvedValue(false),
    startInstall: vi.fn(),
    startBackgroundDownload: vi.fn(),
    installDownloaded: vi.fn(),
  }),
}));

vi.mock("../tauri/backendRuntime", () => ({ isDesktopApp: () => false }));
vi.mock("../tauri/desktopUpdate", () => ({
  restartForComponentUpdates: vi.fn(),
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

import Header from "./Header";

describe("Header update entry", () => {
  it("always renders the unified update button next to the version", async () => {
    render(<Header />);

    const button = screen.getByRole("button", {
      name: "sidebar.updateModal.checkUpdates",
    });
    const version = await screen.findByText("v2.1.1b7");

    expect(button).toBeVisible();
    expect(
      button.querySelector(".anticon-cloud-download"),
    ).toBeInTheDocument();
    expect(version).toBeVisible();
    expect(version.nextElementSibling).toContainElement(button);
  });
});
