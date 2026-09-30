// @vitest-environment jsdom
import {
  act,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { Modal } from "antd";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MarketPluginEntry } from "@/api/modules/pluginMarket";
import { invoke, isTauri } from "@/test/tauri-mock";
import { AppMarket } from "./AppMarket";

const hoisted = vi.hoisted(() => ({
  fetchMarketPlugins: vi.fn(),
  fetchQwenPawPluginCatalog: vi.fn(),
  fetchUGSciPluginCatalog: vi.fn(),
  installPlugin: vi.fn(),
  replaceInstalledPlugin: vi.fn(),
  upgradeInstalledUGSciPlugin: vi.fn(),
  getVersion: vi.fn(),
}));

interface MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[];
}

let intersectionObservers: MockIntersectionObserver[] = [];

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/hooks/useAppMessage", () => ({
  useAppMessage: () => ({
    message: {
      loading: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
    },
  }),
}));

vi.mock("@/api/modules/pluginMarket", async () => {
  const actual = await vi.importActual<
    typeof import("@/api/modules/pluginMarket")
  >("@/api/modules/pluginMarket");
  return {
    ...actual,
    fetchMarketPlugins: hoisted.fetchMarketPlugins,
  };
});

vi.mock("@/api/modules/plugin", () => ({
  installPlugin: hoisted.installPlugin,
  fetchQwenPawPluginCatalog: hoisted.fetchQwenPawPluginCatalog,
  fetchUGSciPluginCatalog: hoisted.fetchUGSciPluginCatalog,
  replaceInstalledPlugin: hoisted.replaceInstalledPlugin,
  upgradeInstalledUGSciPlugin: hoisted.upgradeInstalledUGSciPlugin,
}));

vi.mock("@/api/modules/root", () => ({
  rootApi: { getVersion: hoisted.getVersion },
}));

function makeEntry(
  id: string,
  overrides: Partial<MarketPluginEntry> = {},
): MarketPluginEntry {
  return {
    id,
    display_name: id,
    developer: "dev",
    owner: "owner",
    version: "1.0.0",
    logo_url: null,
    downloads: 42,
    view_count: 10,
    details_url: null,
    locales: { en: { description: `${id} description`, category: "app" } },
    ...overrides,
  };
}

describe("AppMarket", () => {
  const windowOpen = vi.fn();

  beforeEach(() => {
    intersectionObservers = [];
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        private record: MockIntersectionObserver;

        constructor(callback: IntersectionObserverCallback) {
          this.record = { callback, elements: [] };
          intersectionObservers.push(this.record);
        }

        observe(element: Element) {
          this.record.elements.push(element);
        }
        disconnect() {}
      },
    );
    hoisted.fetchMarketPlugins.mockReset();
    hoisted.installPlugin.mockReset();
    hoisted.fetchQwenPawPluginCatalog.mockReset();
    hoisted.fetchUGSciPluginCatalog.mockReset();
    hoisted.replaceInstalledPlugin.mockReset();
    hoisted.upgradeInstalledUGSciPlugin.mockReset();
    hoisted.getVersion.mockReset();
    invoke.mockReset();
    invoke.mockResolvedValue(undefined);
    isTauri.mockReturnValue(false);
    windowOpen.mockReset();
    vi.spyOn(window, "open").mockImplementation(windowOpen);
    delete (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    hoisted.fetchMarketPlugins.mockResolvedValue({ plugins: [], total: 0 });
    hoisted.getVersion.mockResolvedValue({ version: "2.1.0" });
    hoisted.fetchQwenPawPluginCatalog.mockResolvedValue({
      updated_at: null,
      plugins: [],
    });
    hoisted.fetchUGSciPluginCatalog.mockResolvedValue({
      updated_at: null,
      plugins: [],
    });
  });

  it("uses signed catalog installation state for QwenPaw app upgrades", async () => {
    hoisted.fetchQwenPawPluginCatalog.mockResolvedValue({
      updated_at: "2026-09-16T00:00:00Z",
      plugins: [
        {
          id: "qwenpaw-creator-1.3.0",
          plugin_id: "qwenpaw-creator",
          name: "QwenPaw Creator",
          description: "Creator",
          version: "1.3.0",
          author: "QwenPaw Creator Team",
          kind: "apps",
          size: "1 MB",
          sha256: "a".repeat(64),
          install_url: "https://cdn.example/creator.zip",
          installed: true,
          installed_version: "1.2.0",
          upgrade_available: true,
        },
      ],
    });
    hoisted.replaceInstalledPlugin.mockResolvedValue({ version: "1.3.0" });
    const onInstalled = vi.fn();

    render(<AppMarket channel="qwenpaw" onInstalled={onInstalled} />);

    expect(await screen.findByText("appCenter.officialRoute")).toBeVisible();
    const update = await screen.findByRole("button", {
      name: "appCenter.update",
    });
    await waitFor(() => expect(update).toBeEnabled());
    fireEvent.click(update);

    await waitFor(() =>
      expect(hoisted.replaceInstalledPlugin).toHaveBeenCalledWith({
        source: "https://cdn.example/creator.zip",
        pluginId: "qwenpaw-creator",
        version: "1.3.0",
        sha256: "a".repeat(64),
      }),
    );
    expect(onInstalled).toHaveBeenCalled();
  });

  it("requests featured apps for the official channel", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeEntry("official-app", { is_featured: true })],
      total: 1,
    });

    render(<AppMarket channel="official" onInstalled={vi.fn()} />);

    expect(await screen.findByText("official-app")).toBeInTheDocument();
    expect(hoisted.fetchMarketPlugins).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "app",
        is_featured: true,
        page_number: 1,
        page_size: 20,
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(
      screen.queryByRole("button", { name: "appCenter.filterAll" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "common.refresh" }),
    ).not.toBeInTheDocument();
    expect(hoisted.fetchMarketPlugins.mock.calls[0][0]).not.toHaveProperty(
      "sort_by",
    );
    expect(hoisted.fetchMarketPlugins.mock.calls[0][0]).toHaveProperty(
      "is_featured",
      true,
    );
    expect(screen.getByText("appCenter.featured")).toBeInTheDocument();
  });

  it("shows all community apps and marks featured entries", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [
        makeEntry("agent-kanban", { is_featured: true }),
        makeEntry("zalo-channel", { is_featured: false }),
        makeEntry("mahjong4"),
      ],
      total: 3,
    });

    render(<AppMarket onInstalled={vi.fn()} />);

    expect(await screen.findByText("zalo-channel")).toBeInTheDocument();
    expect(screen.getByText("mahjong4")).toBeInTheDocument();
    expect(screen.getByText("agent-kanban")).toBeInTheDocument();
    expect(screen.getAllByText("appCenter.featured")).not.toHaveLength(0);

    const initialParams = hoisted.fetchMarketPlugins.mock.calls[0][0];
    expect(initialParams).not.toHaveProperty("sort_by");
    expect(initialParams).not.toHaveProperty("is_featured");
    expect(initialParams).not.toHaveProperty("is_trending");
  });

  it("exposes the community filter controls", async () => {
    render(<AppMarket onInstalled={vi.fn()} />);
    await screen.findByText("appCenter.marketEmpty");

    expect(
      screen.queryByRole("button", { name: "appCenter.featured" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "appCenter.trending" }),
    ).toBeInTheDocument();
  });

  it("refreshes the community catalog on demand", async () => {
    render(<AppMarket onInstalled={vi.fn()} />);
    await screen.findByText("appCenter.marketEmpty");

    fireEvent.click(screen.getByRole("button", { name: "common.refresh" }));
    await waitFor(() =>
      expect(hoisted.fetchMarketPlugins).toHaveBeenCalledTimes(2),
    );
  });

  it("loads community catalog pages incrementally", async () => {
    const firstPage = Array.from({ length: 20 }, (_, index) =>
      makeEntry(`community-${index}`),
    );
    hoisted.fetchMarketPlugins.mockImplementation(({ page_number }) =>
      Promise.resolve(
        page_number === 1
          ? { plugins: firstPage, total: 21 }
          : {
              plugins: [makeEntry("community-page-two")],
              total: 21,
            },
      ),
    );

    render(<AppMarket onInstalled={vi.fn()} />);

    expect(await screen.findByText("community-0")).toBeInTheDocument();
    expect(hoisted.fetchMarketPlugins).toHaveBeenCalledTimes(1);
    expect(hoisted.fetchMarketPlugins).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page_number: 1,
        page_size: 20,
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    const observer = intersectionObservers[intersectionObservers.length - 1];
    expect(observer).toBeDefined();
    await act(async () => {
      observer?.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(await screen.findByText("community-page-two")).toBeInTheDocument();
    expect(screen.getByText("community-0")).toBeInTheDocument();
    expect(hoisted.fetchMarketPlugins).toHaveBeenCalledTimes(2);
    expect(hoisted.fetchMarketPlugins).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page_number: 2,
        page_size: 20,
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(hoisted.fetchMarketPlugins.mock.calls[1][0]).not.toHaveProperty(
      "sort_by",
    );
  });

  it("aborts an obsolete request when a new search starts", async () => {
    let staleSignal: AbortSignal | undefined;
    hoisted.fetchMarketPlugins
      .mockResolvedValueOnce({ plugins: [], total: 0 })
      .mockImplementationOnce((_params, options) => {
        staleSignal = options?.signal;
        return new Promise((_resolve, reject) => {
          staleSignal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        });
      })
      .mockResolvedValueOnce({
        plugins: [makeEntry("latest-result")],
        total: 1,
      });

    render(<AppMarket onInstalled={vi.fn()} />);
    await waitFor(() =>
      expect(hoisted.fetchMarketPlugins).toHaveBeenCalledTimes(1),
    );

    const search = screen.getByRole("textbox", {
      name: "appCenter.searchMarket",
    });
    fireEvent.change(search, { target: { value: "stale" } });
    fireEvent.keyDown(search, { key: "Enter" });
    await waitFor(() => expect(staleSignal).toBeDefined());

    fireEvent.change(search, { target: { value: "" } });

    expect(await screen.findByText("latest-result")).toBeInTheDocument();
    expect(staleSignal?.aborted).toBe(true);
  });

  it("renders community apps in a single grid", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [
        makeEntry("regular-app"),
        makeEntry("another-app", { is_featured: false }),
      ],
      total: 2,
    });

    const { container } = render(<AppMarket onInstalled={vi.fn()} />);

    await screen.findByText("regular-app");
    const grids = container.querySelectorAll("[class*='grid']");
    expect(grids).toHaveLength(1);

    const titles = Array.from(
      container.querySelectorAll("[class*='cardTitle']"),
    ).map((el) => el.textContent);
    expect(titles).toEqual(["regular-app", "another-app"]);
  });

  it("does not render the emoji download glyph", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeEntry("some-app")],
      total: 1,
    });

    render(<AppMarket onInstalled={vi.fn()} />);

    await screen.findByText("some-app");
    expect(document.body.textContent).not.toContain("⬇");
  });

  it("marks an exactly matching installed app as installed", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeEntry("installed-app")],
      total: 1,
    });

    render(
      <AppMarket
        installedAppVersions={new Map([["installed-app", "1.0.0"]])}
        onInstalled={vi.fn()}
      />,
    );

    const installedButton = await screen.findByRole("button", {
      name: "appCenter.installedStatus",
    });
    expect(installedButton).toBeDisabled();
    expect(screen.queryByText("appCenter.install")).not.toBeInTheDocument();
  });

  it("matches an installed app by its unscoped PawApp ID", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeEntry("@owner/installed-app")],
      total: 1,
    });

    render(
      <AppMarket
        installedAppVersions={new Map([["installed-app", "1.0.0"]])}
        onInstalled={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole("button", {
        name: "appCenter.installedStatus",
      }),
    ).toBeDisabled();
  });

  it("matches official entries by their bundled app id", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeEntry("@owner/installed-app")],
      total: 1,
    });

    render(
      <AppMarket
        channel="official"
        installedAppVersions={new Map([["installed-app", "1.0.0"]])}
        onInstalled={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole("button", {
        name: "appCenter.installedStatus",
      }),
    ).toBeDisabled();
  });

  it("matches official apps when the local author differs from the market owner", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [
        makeEntry("@agentscope/qwenpaw-creator", {
          owner: "agentscope",
          developer: "ScopeMaster",
          version: "1.2.0",
        }),
      ],
      total: 1,
    });

    render(
      <AppMarket
        channel="official"
        installedAppVersions={new Map([["qwenpaw-creator", "1.2.0"]])}
        installedApps={[
          {
            id: "qwenpaw-creator",
            author: "QwenPaw Creator Team",
            version: "1.2.0",
          },
        ]}
        onInstalled={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole("button", {
        name: "appCenter.installedStatus",
      }),
    ).toBeDisabled();
  });

  it("matches app-market apps when the local author differs from the market owner", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [
        makeEntry("@zhijianma/agent-kanban", {
          owner: "zhijianma",
          developer: "zhijianma",
          version: "0.1.1",
        }),
      ],
      total: 1,
    });

    render(
      <AppMarket
        installedAppVersions={new Map([["agent-kanban", "0.1.1"]])}
        installedApps={[
          { id: "agent-kanban", author: "QwenPaw Team", version: "0.1.1" },
        ]}
        onInstalled={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole("button", {
        name: "appCenter.installedStatus",
      }),
    ).toBeDisabled();
  });

  it("offers an update for an official app when versions differ", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [
        makeEntry("@agentscope/qwenpaw-creator", {
          owner: "agentscope",
          developer: "ScopeMaster",
          version: "1.3.0",
        }),
      ],
      total: 1,
    });

    render(
      <AppMarket
        channel="official"
        installedAppVersions={new Map([["qwenpaw-creator", "1.2.0"]])}
        installedApps={[
          {
            id: "qwenpaw-creator",
            author: "QwenPaw Creator Team",
            version: "1.2.0",
          },
        ]}
        onInstalled={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "appCenter.update" }),
    ).toBeEnabled();
  });

  it("does not force-overwrite an installed app from the unsigned market", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [
        makeEntry("installed-app", {
          version: "2.0.0",
          installed: true,
          installed_version: "1.0.0",
        }),
      ],
      total: 1,
    });
    hoisted.installPlugin.mockResolvedValue({
      id: "installed-app",
      name: "installed-app",
    });

    render(
      <AppMarket
        installedAppVersions={new Map([["installed-app", "1.0.0"]])}
        onInstalled={vi.fn()}
      />,
    );

    const installedButton = await screen.findByRole("button", {
      name: "appCenter.installedStatus",
    });
    expect(installedButton).toBeDisabled();
    expect(hoisted.installPlugin).not.toHaveBeenCalled();
  });

  it("installs an app and notifies the parent to refresh", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeEntry("installable")],
      total: 1,
    });
    const installResult = { id: "installable", name: "installable" };
    hoisted.installPlugin.mockResolvedValue(installResult);
    const onInstalled = vi.fn();

    render(<AppMarket onInstalled={onInstalled} />);

    fireEvent.click(await screen.findByText("appCenter.install"));

    await waitFor(() =>
      expect(onInstalled).toHaveBeenCalledWith(installResult),
    );
    expect(hoisted.installPlugin).toHaveBeenCalledTimes(1);
    expect(hoisted.installPlugin).toHaveBeenCalledWith(
      expect.stringContaining("archive/zip/master"),
    );
  });

  it("disables repeat installs while an install is in flight", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeEntry("slow-install")],
      total: 1,
    });
    hoisted.installPlugin.mockReturnValue(new Promise(() => {}));

    render(<AppMarket onInstalled={vi.fn()} />);

    const installBtn = await screen.findByText("appCenter.install");
    fireEvent.click(installBtn);
    await screen.findByText("appCenter.installing");
    fireEvent.click(screen.getByText("appCenter.installing"));

    expect(hoisted.installPlugin).toHaveBeenCalledTimes(1);
  });

  it("disables other apps while an install is in flight", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeEntry("first-app"), makeEntry("second-app")],
      total: 2,
    });
    hoisted.installPlugin.mockReturnValue(new Promise(() => {}));

    render(<AppMarket onInstalled={vi.fn()} />);

    const installButtons = await screen.findAllByRole("button", {
      name: "appCenter.install",
    });
    fireEvent.click(installButtons[0]);

    await waitFor(() => expect(installButtons[1]).toBeDisabled());
    fireEvent.click(installButtons[1]);
    expect(hoisted.installPlugin).toHaveBeenCalledTimes(1);
  });

  it("asks for confirmation before installing an incompatible app", async () => {
    hoisted.getVersion.mockResolvedValue({ version: "1.9.0" });
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeEntry("future-app", { qwenpaw_compat_labels: ["2.x"] })],
      total: 1,
    });
    hoisted.installPlugin.mockResolvedValue({ name: "future-app" });
    const confirmSpy = vi
      .spyOn(Modal, "confirm")
      .mockReturnValue({ destroy: vi.fn(), update: vi.fn() });

    render(<AppMarket onInstalled={vi.fn()} />);

    await waitFor(() => expect(hoisted.getVersion).toHaveBeenCalled());
    fireEvent.click(
      await screen.findByRole("button", { name: "appCenter.install" }),
    );

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(hoisted.installPlugin).not.toHaveBeenCalled();

    const confirmOptions = confirmSpy.mock.calls[0][0];
    await confirmOptions.onOk?.();
    await waitFor(() => expect(hoisted.installPlugin).toHaveBeenCalledTimes(1));
  });

  it("previews the full description without installing or leaving the page", async () => {
    const description =
      "Full application description with configuration and usage details.";
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [
        makeEntry("preview-app", {
          locales: { en: { description, category: "app" } },
        }),
      ],
      total: 1,
    });
    render(<AppMarket onInstalled={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "preview-app" }));
    const dialog = await screen.findByRole("dialog", { name: "preview-app" });
    expect(within(dialog).getByText(description)).toBeVisible();
    expect(
      within(dialog).getByRole("button", { name: "appCenter.install" }),
    ).toBeVisible();
    expect(hoisted.installPlugin).not.toHaveBeenCalled();
    expect(windowOpen).not.toHaveBeenCalled();
  });

  it("opens details through the shared external-link guard", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [
        makeEntry("with-details", {
          details_url: "https://platform.agentscope.io/apps/demo",
        }),
      ],
      total: 1,
    });

    render(<AppMarket onInstalled={vi.fn()} />);

    fireEvent.click(await screen.findByText("appCenter.details"));

    expect(windowOpen).toHaveBeenCalledWith(
      "https://platform.agentscope.io/apps/demo",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("does not open unsupported details URL schemes", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [
        makeEntry("evil-details", { details_url: "javascript:alert(1)" }),
      ],
      total: 1,
    });

    render(<AppMarket onInstalled={vi.fn()} />);

    fireEvent.click(await screen.findByText("appCenter.details"));

    expect(windowOpen).not.toHaveBeenCalled();
    expect(invoke).not.toHaveBeenCalled();
  });

  it("shows the market error inside the market view", async () => {
    hoisted.fetchMarketPlugins.mockRejectedValue(new Error("boom"));

    render(<AppMarket onInstalled={vi.fn()} />);

    expect(
      await screen.findByText("pluginManager.marketUnavailable"),
    ).toBeInTheDocument();
  });
});
