vi.mock("../../plugins/pawapp-sdk/browserSession", () => ({
  prepareBrowserSession: vi.fn().mockResolvedValue(null),
}));
// @vitest-environment jsdom
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Modal } from "antd";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { renderWithProviders } from "@/test/common_setup";
import AppCenterPage from "./index";
import { NavigationGuard } from "../../layouts/MainLayout/NavigationGuard";
import { notifyPluginChange } from "@/utils/pluginChangeEvents";

const hoisted = vi.hoisted(() => ({
  listApps: vi.fn(),
  uninstall: vi.fn(),
  fetchMarketPlugins: vi.fn(),
  fetchQwenPawPluginCatalog: vi.fn(),
  fetchUGSciPluginCatalog: vi.fn(),
  installPlugin: vi.fn(),
  loadPawApp: vi.fn(),
  reloadPawApp: vi.fn(),
  routeSnapshot: vi.fn(),
  removePluginAppState: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  // Required by src/i18n.ts, pulled in through ChunkErrorBoundary.
  initReactI18next: { type: "3rdParty", init: vi.fn() },
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/components/PageHeader", () => ({
  PageHeader: ({ current }: { current: string }) => <div>{current}</div>,
}));

vi.mock("@/hooks/useAppMessage", () => ({
  useAppMessage: () => ({
    message: { loading: vi.fn(), success: vi.fn(), error: vi.fn() },
  }),
}));

vi.mock("@/api/modules/pawapp", () => ({
  pawappApi: {
    list: hoisted.listApps,
    uninstall: hoisted.uninstall,
  },
}));

vi.mock("@/plugins/registry/hooks", () => ({
  useRoutes: () => hoisted.routeSnapshot(),
}));

vi.mock("@/plugins/usePluginLoader", () => ({
  loadPawApp: hoisted.loadPawApp,
  reloadPawApp: hoisted.reloadPawApp,
  unloadFrontendPlugin: vi.fn().mockResolvedValue(undefined),
  reloadFrontendPlugin: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/os/osCleanup", () => ({
  removePluginAppState: hoisted.removePluginAppState,
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
}));

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{location.pathname + location.search}</div>
  );
}

function makeApp(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name: id,
    version: "1.0.0",
    description: `${id} description`,
    author: "dev",
    category: "tools",
    icon: "",
    status: "active",
    home_page: null,
    entry_page: `/apps/${id}`,
    launch_scope: "page",
    dir: `/tmp/${id}`,
    settings: [],
    permissions: {},
    backends: {},
    ...overrides,
  };
}

function makeMarketApp(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    display_name: id,
    developer: "dev",
    owner: "dev",
    version: "1.0.0",
    logo_url: null,
    downloads: 1,
    view_count: 1,
    details_url: null,
    locales: { en: { description: id, category: "app" } },
    is_featured: false,
    ...overrides,
  };
}

function renderPage(initialEntries: string[] = ["/market"]) {
  return renderWithProviders(
    <>
      <AppCenterPage />
      <LocationProbe />
    </>,
    { initialEntries },
  );
}

describe("AppCenterPage", () => {
  beforeEach(() => {
    hoisted.listApps.mockReset();
    hoisted.uninstall.mockReset();
    hoisted.fetchMarketPlugins.mockReset();
    hoisted.fetchQwenPawPluginCatalog.mockReset();
    hoisted.fetchUGSciPluginCatalog.mockReset();
    hoisted.installPlugin.mockReset();
    hoisted.loadPawApp.mockReset();
    hoisted.reloadPawApp.mockReset();
    hoisted.routeSnapshot.mockReset();
    hoisted.removePluginAppState.mockReset();
    hoisted.routeSnapshot.mockReturnValue([]);
    hoisted.loadPawApp.mockResolvedValue(undefined);
    hoisted.reloadPawApp.mockResolvedValue(undefined);
    hoisted.listApps.mockResolvedValue({
      apps: [makeApp("alpha-app"), makeApp("beta-app", { category: "games" })],
      total: 2,
    });
    hoisted.fetchMarketPlugins.mockResolvedValue({ plugins: [], total: 0 });
    hoisted.fetchQwenPawPluginCatalog.mockResolvedValue({
      updated_at: null,
      plugins: [],
    });
    hoisted.fetchUGSciPluginCatalog.mockResolvedValue({
      updated_at: null,
      plugins: [],
    });
    window.history.replaceState({}, "", "/apps");
  });

  it("renders installed apps by default without mounting external views", async () => {
    renderPage();

    expect(await screen.findByText("alpha-app")).toBeInTheDocument();
    expect(screen.getByText("beta-app")).toBeInTheDocument();

    // The market view must not load on the default tab.
    expect(
      screen.queryByLabelText("appCenter.searchMarket"),
    ).not.toBeInTheDocument();
    expect(hoisted.fetchMarketPlugins).not.toHaveBeenCalled();
  });

  it("refreshes installed apps after external changes and ignores older responses", async () => {
    let resolveOld!: (value: {
      apps: ReturnType<typeof makeApp>[];
      total: number;
    }) => void;
    hoisted.listApps.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
    );
    renderPage();
    await waitFor(() => expect(hoisted.listApps).toHaveBeenCalledTimes(1));
    hoisted.listApps.mockResolvedValue({
      apps: [makeApp("new-app")],
      total: 1,
    });
    act(() => notifyPluginChange());
    expect(await screen.findByText("new-app")).toBeVisible();
    await act(async () => resolveOld({ apps: [makeApp("old-app")], total: 1 }));
    expect(screen.getByText("new-app")).toBeVisible();
    expect(screen.queryByText("old-app")).not.toBeInTheDocument();
  });

  it("enters the official view and loads featured apps lazily", async () => {
    hoisted.fetchQwenPawPluginCatalog.mockResolvedValue({
      plugins: [
        {
          id: "agent-kanban-0.1.0",
          plugin_id: "agent-kanban",
          name: "Agent Kanban",
          description: "Kanban",
          description_i18n: { en: "Kanban" },
          version: "0.1.0",
          author: "QwenPaw Team",
          kind: "apps",
          size: "1 KB",
          sha256: "abc",
          install_url: "https://download.qwenpaw.agentscope.io/app.zip",
          installed: false,
          upgrade_available: false,
        },
      ],
      updated_at: null,
    });
    renderPage();
    await screen.findByText("alpha-app");

    fireEvent.click(
      screen.getByRole("tab", { name: /appCenter.officialApps/ }),
    );

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/market?view=official",
    );
    expect(
      await screen.findByText("Agent Kanban", {}, { timeout: 10_000 }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(hoisted.fetchQwenPawPluginCatalog).toHaveBeenCalledTimes(1),
    );
    expect(hoisted.fetchMarketPlugins).not.toHaveBeenCalled();
    expect(screen.queryByText("alpha-app")).not.toBeInTheDocument();
  });

  it("shows the official view when visiting /apps?view=official directly", async () => {
    renderPage(["/apps?view=official"]);

    expect(
      await screen.findByLabelText("appCenter.searchOfficial"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(hoisted.fetchQwenPawPluginCatalog).toHaveBeenCalledTimes(1),
    );
  });

  it("falls back to installed apps for unknown view values", async () => {
    renderPage(["/market?view=bogus"]);

    expect(await screen.findByText("alpha-app")).toBeInTheDocument();
    expect(hoisted.fetchMarketPlugins).not.toHaveBeenCalled();
  });

  it("enters the market view via ?view=market and mounts the market lazily", async () => {
    renderPage();
    await screen.findByText("alpha-app");

    fireEvent.click(screen.getByRole("tab", { name: /appCenter.appMarket/ }));

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/market?view=market",
    );
    expect(
      await screen.findByLabelText("appCenter.searchMarket"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(hoisted.fetchMarketPlugins).toHaveBeenCalledTimes(1),
    );
    expect(screen.queryByText("alpha-app")).not.toBeInTheDocument();
  });

  it("shows the market when visiting /market?view=market directly", async () => {
    renderPage(["/market?view=market"]);

    expect(
      await screen.findByLabelText("appCenter.searchMarket"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(hoisted.fetchMarketPlugins).toHaveBeenCalledTimes(1),
    );
  });

  it("marks an installed app as installed in the market", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeMarketApp("alpha-app")],
      total: 1,
    });
    renderPage(["/market?view=market"]);

    expect(
      await screen.findByRole("button", {
        name: "appCenter.installedStatus",
      }),
    ).toBeDisabled();
    expect(screen.queryByText("appCenter.install")).not.toBeInTheDocument();
  });

  it("loads a newly installed market app without reloading", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeMarketApp("new-app")],
      total: 1,
    });
    hoisted.installPlugin.mockResolvedValue({
      id: "new-app",
      name: "New App",
    });
    renderPage(["/market?view=market"]);

    fireEvent.click(await screen.findByText("appCenter.install"));

    await waitFor(() =>
      expect(hoisted.loadPawApp).toHaveBeenCalledWith("new-app"),
    );
  });

  it("does not reinstall an installed market app at the same version", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeMarketApp("alpha-app")],
      total: 1,
    });
    renderPage(["/market?view=market"]);
    await waitFor(() => expect(hoisted.listApps).toHaveBeenCalledTimes(1));

    const installedButton = await screen.findByRole("button", {
      name: "appCenter.installedStatus",
    });
    expect(installedButton).toBeDisabled();
    fireEvent.click(installedButton);
    expect(hoisted.installPlugin).not.toHaveBeenCalled();
    expect(hoisted.loadPawApp).not.toHaveBeenCalled();
  });

  it("offers an update for an installed market app with a newer version", async () => {
    hoisted.fetchMarketPlugins.mockResolvedValue({
      plugins: [makeMarketApp("alpha-app", { version: "2.0.0" })],
      total: 1,
    });
    hoisted.installPlugin.mockResolvedValue({
      id: "alpha-app",
      name: "Alpha App",
    });
    renderPage(["/market?view=market"]);
    await waitFor(() => expect(hoisted.listApps).toHaveBeenCalledTimes(1));

    const updateButton = await screen.findByRole("button", {
      name: "appCenter.update",
    });
    expect(updateButton).toBeEnabled();
    fireEvent.click(updateButton);
    await waitFor(() => expect(hoisted.installPlugin).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(hoisted.reloadPawApp).toHaveBeenCalledWith("alpha-app"),
    );
    expect(hoisted.listApps).toHaveBeenCalledTimes(2);
  });

  it("returns to installed apps and preserves unrelated query params", async () => {
    renderPage(["/market?foo=1"]);
    await screen.findByText("alpha-app");

    fireEvent.click(screen.getByRole("tab", { name: /appCenter.appMarket/ }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/market?foo=1&view=market",
    );

    fireEvent.click(screen.getByRole("tab", { name: /appCenter.myApps/ }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      /\/market\?foo=1$/,
    );
    expect(await screen.findByText("alpha-app")).toBeInTheDocument();
  });

  it("offers official apps and the app market when no apps are installed", async () => {
    hoisted.listApps.mockResolvedValue({ apps: [], total: 0 });
    renderPage();

    const goToOfficial = await screen.findByRole("button", {
      name: /appCenter.browseOfficialApps/,
    });
    expect(
      screen.getByRole("button", { name: /appCenter.browseMarket/ }),
    ).toBeInTheDocument();

    fireEvent.click(goToOfficial);

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/market?view=official",
    );
    expect(
      await screen.findByText("appCenter.officialAppsEmpty"),
    ).toBeInTheDocument();
    expect(hoisted.fetchQwenPawPluginCatalog).toHaveBeenCalledTimes(1);
  });

  it("filters installed apps by search and offers to clear filters", async () => {
    renderPage();
    await screen.findByText("alpha-app");

    const searchInput = screen.getByLabelText("appCenter.search");
    fireEvent.change(searchInput, { target: { value: "alpha" } });

    expect(screen.getByText("alpha-app")).toBeInTheDocument();
    expect(screen.queryByText("beta-app")).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "no-such-app" } });
    expect(screen.queryByText("alpha-app")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /appCenter.clearFilters/ }),
    );
    expect(screen.getByText("alpha-app")).toBeInTheDocument();
    expect(screen.getByText("beta-app")).toBeInTheDocument();
  });

  it("recovers from a load failure via the retry button", async () => {
    hoisted.listApps
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({ apps: [makeApp("alpha-app")], total: 1 });
    renderPage();

    const retryBtn = await screen.findByRole("button", {
      name: /common.retry/,
    });
    fireEvent.click(retryBtn);

    expect(await screen.findByText("alpha-app")).toBeInTheDocument();
  });

  it("loads an installed app on demand on card click", async () => {
    const AppPage = () => <div>Loaded PawApp</div>;
    hoisted.loadPawApp.mockImplementationOnce(async () => {
      hoisted.routeSnapshot.mockReturnValue([
        {
          id: "alpha.page",
          path: "/apps/alpha-app",
          source: "alpha-app",
          Component: AppPage,
        },
      ]);
    });
    renderPage();
    await screen.findByText("alpha-app");

    fireEvent.click(screen.getByText("alpha-app"));

    await waitFor(() =>
      expect(hoisted.loadPawApp).toHaveBeenCalledWith(
        "alpha-app",
        "/apps/alpha-app",
      ),
    );
    expect(await screen.findByText("Loaded PawApp")).toBeInTheDocument();
  });

  it("returns to the previous non-OS history entry when closing an app", async () => {
    const AppPage = () => <div>Loaded PawApp</div>;
    hoisted.loadPawApp.mockImplementationOnce(async () => {
      hoisted.routeSnapshot.mockReturnValue([
        {
          id: "alpha.page",
          path: "/apps/alpha-app",
          source: "alpha-app",
          Component: AppPage,
        },
      ]);
    });
    window.history.replaceState({}, "", "/chat");
    window.history.pushState({}, "", "/market");
    renderPage();
    await screen.findByText("alpha-app");

    fireEvent.click(screen.getByText("alpha-app"));

    expect(await screen.findByText("Loaded PawApp")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/apps/alpha-app");
    expect(window.history.state).toEqual({ pawappInline: true });

    fireEvent.click(screen.getByTitle("appCenter.backToListHint"));

    await waitFor(() => expect(window.location.pathname).toBe("/market"));
    expect(await screen.findByText("alpha-app")).toBeInTheDocument();
    expect(window.history.state).toEqual({});

    window.history.back();
    await waitFor(() => expect(window.location.pathname).toBe("/chat"));
    expect(screen.queryByText("Loaded PawApp")).not.toBeInTheDocument();
  });

  it.each(["button", "escape", "refresh"])(
    "returns sidebar-launched apps to their exact origin via %s",
    async (action) => {
      hoisted.routeSnapshot.mockReturnValue([
        {
          id: "alpha.page",
          path: "/apps/alpha-app",
          source: "alpha-app",
          Component: () => <div>Loaded PawApp</div>,
        },
      ]);
      window.history.replaceState(
        { idx: 0, key: "origin" },
        "",
        "/chat?session=original#message-7",
      );
      function Origin() {
        const navigate = useNavigate();
        return (
          <button onClick={() => navigate("/apps/alpha-app")}>
            Open sidebar app
          </button>
        );
      }
      function BrowserView() {
        return (
          <BrowserRouter>
            <Routes>
              <Route path="/chat" element={<Origin />} />
              <Route path="/apps/:appId" element={<AppCenterPage />} />
            </Routes>
            <LocationProbe />
          </BrowserRouter>
        );
      }
      let mounted = render(<BrowserView />);
      fireEvent.click(screen.getByRole("button", { name: "Open sidebar app" }));
      expect(await screen.findByText("Loaded PawApp")).toBeVisible();
      if (action === "refresh") {
        mounted.unmount();
        mounted = render(<BrowserView />);
        expect(await screen.findByText("Loaded PawApp")).toBeVisible();
      }
      if (action === "escape") fireEvent.keyDown(window, { key: "Escape" });
      else fireEvent.click(screen.getByTitle("appCenter.backToListHint"));
      await waitFor(() =>
        expect(screen.getByTestId("location").textContent).toBe(
          "/chat?session=original",
        ),
      );
      expect(window.location.hash).toBe("#message-7");
      expect(
        screen.getByRole("button", { name: "Open sidebar app" }),
      ).toBeVisible();
      mounted.unmount();
    },
  );

  it("keeps slow app entry inside its own shell without mounting the catalog", async () => {
    let resolveApps!: (data: {
      apps: ReturnType<typeof makeApp>[];
      total: number;
    }) => void;
    hoisted.listApps.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveApps = resolve;
      }),
    );
    hoisted.routeSnapshot.mockReturnValue([
      {
        id: "alpha.page",
        path: "/apps/alpha-app",
        source: "alpha-app",
        Component: () => <div>Loaded PawApp</div>,
      },
    ]);
    window.history.replaceState({ idx: 0 }, "", "/apps/alpha-app");
    const mounted = render(
      <BrowserRouter>
        <Routes>
          <Route path="/apps/:appId" element={<AppCenterPage />} />
          <Route path="/chat" element={<div>Chat home</div>} />
        </Routes>
      </BrowserRouter>,
    );
    expect(
      document.querySelector('[data-pawapp-view="alpha-app"]'),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.getByTitle("appCenter.backToListHint")).toBeVisible();
    await act(async () =>
      resolveApps({ apps: [makeApp("alpha-app")], total: 1 }),
    );
    expect(await screen.findByText("Loaded PawApp")).toBeVisible();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    mounted.unmount();
  });

  it("never mounts the catalog while returning from a router-launched app", async () => {
    hoisted.routeSnapshot.mockReturnValue([
      {
        id: "alpha.page",
        path: "/apps/alpha-app",
        source: "alpha-app",
        Component: () => <div>Loaded PawApp</div>,
      },
    ]);
    window.history.replaceState({ idx: 0 }, "", "/chat");
    function Origin() {
      const navigate = useNavigate();
      return (
        <button onClick={() => navigate("/apps/alpha-app")}>
          Open sidebar app
        </button>
      );
    }
    const mounted = render(
      <BrowserRouter>
        <NavigationGuard />
        <Routes>
          <Route path="/chat" element={<Origin />} />
          <Route path="/apps/:appId" element={<AppCenterPage />} />
        </Routes>
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByText("Open sidebar app"));
    expect(await screen.findByText("Loaded PawApp")).toBeVisible();
    let catalogMounted = false;
    const observer = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes) {
          if (
            node instanceof Element &&
            (node.matches('[role="tablist"]') ||
              node.querySelector('[role="tablist"]'))
          )
            catalogMounted = true;
        }
    });
    observer.observe(mounted.container, { childList: true, subtree: true });
    let resume!: () => void;
    const defer = (event: Event) => {
      event.preventDefault();
      resume = (event as CustomEvent<{ retry: () => void }>).detail.retry;
    };
    window.addEventListener("qwenpaw:before-navigate", defer, { once: true });
    fireEvent.click(screen.getByTitle("appCenter.backToListHint"));
    expect(screen.getByText("Loaded PawApp")).toBeVisible();
    act(() => resume());
    expect(await screen.findByText("Open sidebar app")).toBeVisible();
    await act(async () => {});
    observer.disconnect();
    expect(catalogMounted).toBe(false);
    mounted.unmount();
  });

  it("keeps failed app entry in its shell and retries the real app list", async () => {
    hoisted.listApps.mockRejectedValueOnce(new Error("App list unavailable"));
    hoisted.routeSnapshot.mockReturnValue([
      {
        id: "alpha.page",
        path: "/apps/alpha-app",
        source: "alpha-app",
        Component: () => <div>Loaded PawApp</div>,
      },
    ]);
    window.history.replaceState({ idx: 0 }, "", "/apps/alpha-app");
    const mounted = render(
      <BrowserRouter>
        <Routes>
          <Route path="/apps/:appId" element={<AppCenterPage />} />
        </Routes>
      </BrowserRouter>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "common.retry" }),
    );
    expect(await screen.findByText("Loaded PawApp")).toBeVisible();
    expect(hoisted.listApps).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    mounted.unmount();
  });

  it("closes a fresh app deep link to the chat home", async () => {
    hoisted.routeSnapshot.mockReturnValue([
      {
        id: "alpha.page",
        path: "/apps/alpha-app",
        source: "alpha-app",
        Component: () => <div>Loaded PawApp</div>,
      },
    ]);
    window.history.replaceState({ idx: 0 }, "", "/apps/alpha-app");
    const mounted = render(
      <BrowserRouter>
        <Routes>
          <Route path="/apps/:appId" element={<AppCenterPage />} />
          <Route path="/chat" element={<div>Chat home</div>} />
        </Routes>
      </BrowserRouter>,
    );
    expect(await screen.findByText("Loaded PawApp")).toBeVisible();
    fireEvent.click(screen.getByTitle("appCenter.backToListHint"));
    expect(await screen.findByText("Chat home")).toBeVisible();
    expect(window.location.pathname).toBe("/chat");
    mounted.unmount();
  });

  it("cleans the loaded PawApp runtime after uninstall", async () => {
    hoisted.uninstall.mockResolvedValue(undefined);
    hoisted.listApps
      .mockResolvedValueOnce({ apps: [makeApp("alpha-app")], total: 1 })
      .mockResolvedValueOnce({ apps: [], total: 0 });
    vi.spyOn(Modal, "confirm").mockImplementation((options) => {
      void options.onOk?.();
      return { destroy: vi.fn(), update: vi.fn() };
    });
    renderPage();
    await screen.findByText("alpha-app");

    fireEvent.click(
      screen.getByRole("button", { name: "appCenter.moreActions" }),
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /appCenter.uninstall/ }),
    );

    await waitFor(() =>
      expect(hoisted.uninstall).toHaveBeenCalledWith("alpha-app"),
    );
    expect(hoisted.removePluginAppState).toHaveBeenCalledWith("alpha-app");
  });

  it("restores an OS PawApp when navigating back and forward", async () => {
    hoisted.routeSnapshot.mockReturnValue([
      {
        id: "alpha.page",
        path: "/apps/alpha-app",
        source: "alpha-app",
        Component: () => <div>Loaded PawApp</div>,
      },
    ]);
    window.history.replaceState({ osApp: "core.app-center" }, "", "/os");
    renderPage();
    await screen.findByText("alpha-app");

    fireEvent.click(screen.getByText("alpha-app"));

    await waitFor(() =>
      expect(window.history.state).toEqual({
        osApp: "core.app-center",
        osPawAppId: "alpha-app",
      }),
    );
    expect(window.location.pathname).toBe("/os");
    expect(await screen.findByText("Loaded PawApp")).toBeInTheDocument();

    window.history.back();
    await waitFor(() => {
      expect(screen.getByText("alpha-app")).toBeInTheDocument();
    });

    window.history.forward();
    expect(await screen.findByText("Loaded PawApp")).toBeInTheDocument();
  });
});
