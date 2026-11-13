// @vitest-environment jsdom
/**
 * Sidebar render tests — regression family: session state × navigation
 * combos (bug_insights top cluster) and cross-agent switch isolation.
 * The existing Sidebar.test.tsx only covers menu data; these tests render
 * the full component with mocked registries/child panels.
 */
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";
import {
  act,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/common_setup";
import { useLocation } from "react-router-dom";
import { pickSelectedKey } from "./MainLayout/routeSelection";
import en from "../locales/en.json";
import zh from "../locales/zh.json";
import type { PageStyle } from "../utils/pageStyle";
import type { InterfaceStyle } from "../utils/interfaceStyle";

// ---- Hoisted mocks ---------------------------------------------------------

vi.hoisted(() => vi.stubEnv("VITE_CONSOLE_BASENAME", "/qwenpaw"));
afterAll(() => vi.unstubAllEnvs());

const mocks = vi.hoisted(() => ({
  sidebar: {
    railItemIds: [] as string[],
    setRailItemIds: vi.fn(),
    focusItemIds: ["core.workspace", "core.models"] as string[],
    hiddenPluginItemIds: [] as string[],
  },
  menuItems: [] as unknown[],
  routes: [] as unknown[],
  authStatus: { enabled: false, mode: "normal" },
  inboxEvents: [] as unknown[],
  approvals: [] as Array<{ request_id: string }>,
  getInboxEvents: vi.fn(),
  getPushMessages: vi.fn(),
  sessionList: [] as unknown[],
  isSessionSwitching: false,
  getEffectiveSessionId: vi.fn(
    (id: string, realId?: string | null) => realId ?? `real-${id}`,
  ),
  startNewSwitch: vi.fn(() => new AbortController()),
  preloadSession: vi.fn().mockResolvedValue({ realId: "real-s-1" }),
  finishSessionSwitch: vi.fn(),
  updateProfile: vi.fn().mockResolvedValue({}),
  changePassword: vi.fn().mockResolvedValue({}),
  restartRuntime: vi.fn().mockResolvedValue({}),
  setSelectedAgent: vi.fn(),
  refreshAgents: vi.fn().mockResolvedValue(undefined),
  language: "en",
  renderActualSettingsPanel: false,
  interfaceStyle: "classic" as InterfaceStyle,
  pageStyle: "classic" as PageStyle,
}));
vi.mock("./useSidebarAppEntries", () => ({
  useSidebarAppEntries: () => ({
    entries: [
      { key: "pawapp:notes", label: "Notes", path: "/apps/notes", icon: null },
    ],
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) =>
      key === "sidebar.dualSidebar.workflows"
        ? (mocks.language.startsWith("zh") ? zh : en).sidebar.dualSidebar
            .workflows
        : fallback ?? key,
    i18n: {
      get language() {
        return mocks.language;
      },
      get resolvedLanguage() {
        return mocks.language;
      },
    },
  }),
}));

vi.mock("../contexts/ThemeContext", () => ({
  useTheme: () => ({
    isDark: false,
    interfaceStyle: mocks.interfaceStyle,
    pageStyle: mocks.pageStyle,
    themeMode: "light",
    setThemeMode: vi.fn(),
  }),
}));

vi.mock("../stores/sidebarStore", () => ({
  useSidebarStore: () => mocks.sidebar,
}));

vi.mock("../stores/agentStore", () => ({
  useAgentStore: () => ({
    selectedAgent: "agent-1",
    agents: [
      {
        id: "agent-1",
        name: "Primary",
        enabled: true,
        backend: "qwenpaw",
        backend_capabilities: { workspace_ui: true },
      },
    ],
    setSelectedAgent: mocks.setSelectedAgent,
    refreshAgents: mocks.refreshAgents,
  }),
}));

vi.mock("../plugins/registry/hooks", () => ({
  useMenuItems: (location: string) =>
    mocks.menuItems.filter(
      (item) =>
        ((item as { location?: string }).location ?? "primary.settings") ===
        location,
    ),
  useRoutes: () => mocks.routes,
}));

vi.mock("../plugins/registry/Slot", () => ({
  Slot: ({ name }: { name: string }) => (
    <input aria-label={`Plugin ${name}`} defaultValue="plugin state" />
  ),
}));

vi.mock("../hooks/useInboxWobble", () => ({
  useInboxWobble: () => [true, vi.fn()],
}));

vi.mock("../contexts/ApprovalContext", () => ({
  useApprovalContext: () => ({
    approvals: mocks.approvals,
    setApprovals: vi.fn(),
  }),
}));

vi.mock("../hooks/useAppMessage", () => ({
  useAppMessage: () => ({
    message: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
  }),
}));

vi.mock("../api", () => ({
  default: {
    getVersion: () => Promise.resolve({ version: "2.2.0b3" }),
    getInboxEvents: (...args: unknown[]) => mocks.getInboxEvents(...args),
    getPushMessages: (...args: unknown[]) => mocks.getPushMessages(...args),
    getUserTimezone: () => Promise.resolve({ timezone: "UTC" }),
  },
}));

vi.mock("../api/config", () => ({
  clearAuthToken: vi.fn(),
}));

vi.mock("../api/modules/auth", () => ({
  authApi: {
    getStatus: () => Promise.resolve(mocks.authStatus),
    getCurrentUser: () => Promise.resolve({ username: "testuser" }),
    updateProfile: (...args: unknown[]) => mocks.updateProfile(...args),
  },
}));

vi.mock("../api/modules/hub", () => ({
  hubApi: {
    me: () => Promise.resolve({ role: "admin", username: "hubuser" }),
    changePassword: (...args: unknown[]) => mocks.changePassword(...args),
    restartOwnRuntime: (...args: unknown[]) => mocks.restartRuntime(...args),
  },
}));

vi.mock("../pages/Chat/sessionApi", () => ({
  default: {
    getSessionList: () => Promise.resolve(mocks.sessionList),
    get isSessionSwitching() {
      return mocks.isSessionSwitching;
    },
    getEffectiveSessionId: (...args: [string, string?]) =>
      mocks.getEffectiveSessionId(...args),
    startNewSwitch: () => mocks.startNewSwitch(),
    preloadSession: (...args: unknown[]) => mocks.preloadSession(...args),
    finishSessionSwitch: () => mocks.finishSessionSwitch(),
  },
}));

vi.mock("../stores/sessionListStore", () => ({
  syncSessionsGlobal: vi.fn(),
}));

vi.mock("../components/AgentSelector", () => ({
  default: () => <div data-testid="agent-selector" />,
}));

vi.mock("./AppBrand", () => ({
  default: ({
    action,
    hidden,
  }: {
    action?: React.ReactNode;
    hidden?: boolean;
  }) => (
    <div data-testid="app-brand" hidden={hidden}>
      {action}
    </div>
  ),
}));

vi.mock("./SidebarSessionList", () => ({
  default: ({
    onNewChat,
    onSessionClick,
  }: {
    onNewChat?: () => void;
    onSessionClick?: (id: string) => void;
  }) => (
    <div data-testid="session-list">
      <input aria-label="Conversation filter" defaultValue="" />
      <button data-testid="sl-new-chat" onClick={onNewChat}>
        new
      </button>
      <button data-testid="sl-click" onClick={() => onSessionClick?.("s-1")}>
        open
      </button>
    </div>
  ),
}));

vi.mock("./SidebarSettingsPanel", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("./SidebarSettingsPanel")
  >();
  return {
    default: (props: React.ComponentProps<typeof actual.default>) => {
      if (mocks.renderActualSettingsPanel) {
        return React.createElement(actual.default, props);
      }
      return (
        <div data-testid="settings-panel">
          <button onClick={props.onOpenAccount}>account.title</button>
          <button onClick={props.onLogout}>login.logout</button>
        </div>
      );
    },
  };
});

const iconStubs = vi.hoisted(() => {
  const make = (name: string) => {
    function Icon() {
      return null;
    }
    Icon.displayName = name;
    return Icon;
  };
  return {
    SparkChatTabFill: make("chat"),
    SparkExitFullscreenLine: make("exit"),
    SparkSearchUserLine: make("search-user"),
    SparkMenuExpandLine: make("expand"),
    SparkMenuFoldLine: make("fold"),
    SparkEmailLine: make("email"),
    SparkSettingLine: make("setting"),
    SparkAgentLine: make("agent"),
    SparkNewChatLine: make("new-chat"),
    SparkOperateLeftLine: make("operate-left"),
    SparkOperateRightLine: make("operate-right"),
  };
});

vi.mock("@agentscope-ai/icons", () => iconStubs);

vi.mock("lucide-react", async () => {
  const actual = await vi.importActual<object>("lucide-react");
  const stub = ({ size }: { size?: number }) =>
    React.createElement(
      "span",
      { "aria-hidden": true, "data-testid": "lucide-icon" },
      size ?? 16,
    );
  return {
    ...actual,
    Check: stub,
    ChevronDown: stub,
    History: stub,
    MessageSquareText: stub,
    RotateCw: stub,
    Settings: stub,
    ShieldCheck: stub,
  };
});

import Sidebar from "./Sidebar";
import DesktopWindowFrame from "../tauri/DesktopWindowFrame";
import { clearAuthToken } from "../api/config";
import { MarketplaceHeader } from "../pages/Market/components/MarketplaceHeader";
import { marketplaceExtensionRegistry } from "../pages/Market/marketplaceRegistry";

/** Renders the location so navigation can be asserted. */
function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="probe-path">
      {location.pathname}
      {location.search}
    </div>
  );
}

function SettingsReturnProbe() {
  const location = useLocation();
  return (
    <output data-testid="settings-return">
      {location.state?.settingsReturnTo}
    </output>
  );
}

// The feature rail reserves its own width beside the conversation pane.
function conversationWidth(width: string) {
  return mocks.pageStyle === "dual-sidebar"
    ? `${Math.max(0, parseInt(width) - 66)}px`
    : width;
}
function queryRailExpand() {
  const rail = screen.queryByRole("navigation", { name: "Feature navigation" });
  return rail
    ? within(rail).queryByRole("button", { name: "Expand conversation pane" })
    : null;
}

function renderSidebar(
  props: { selectedKey?: string; hubMode?: boolean } = {},
) {
  return renderWithProviders(
    <>
      <Sidebar
        selectedKey={props.selectedKey ?? "core.workspace"}
        hubMode={props.hubMode}
      />
      <LocationProbe />
    </>,
  );
}

function RoutedSidebar() {
  const location = useLocation();
  return (
    <>
      <Sidebar
        selectedKey={pickSelectedKey(
          location.pathname,
          mocks.routes as Array<{ id: string; path: string }>,
        )}
      />
      <LocationProbe />
    </>
  );
}

/**
 * Mutable viewport state so a test can resize the window and notify the
 * media-query listener the sidebar subscribes to on mount.
 */
const viewportState = {
  matches: false,
  listeners: [] as Array<() => void>,
};

class ResizePointerEvent extends MouseEvent {
  pointerId: number;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
  }
}

function mockMobileViewport(matches: boolean) {
  viewportState.matches = matches;
  viewportState.listeners = [];
  vi.mocked(window.matchMedia).mockImplementation(
    (query) =>
      ({
        get matches() {
          return viewportState.matches && query === "(max-width: 768px)";
        },
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (_type: string, listener: () => void) => {
          viewportState.listeners.push(listener);
        },
        removeEventListener: (_type: string, listener: () => void) => {
          viewportState.listeners = viewportState.listeners.filter(
            (current) => current !== listener,
          );
        },
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

/** Resize the viewport and fire the sidebar's media-query change event. */
function resizeViewport(matches: boolean) {
  viewportState.matches = matches;
  act(() => {
    for (const listener of [...viewportState.listeners]) {
      listener();
    }
  });
}

async function openAccountModal() {
  const settingsButtons = await screen.findAllByRole("button", {
    name: "Settings",
  });
  fireEvent.click(settingsButtons[settingsButtons.length - 1]);
  fireEvent.click(await screen.findByText("account.title"));
}

const inboxItem = {
  id: "core.inbox",
  location: "primary.agentScoped",
  label: "Inbox",
  route: "core.inbox",
};
const workspaceItem = {
  id: "core.workspace",
  location: "primary.agentScoped",
  label: "Workspace",
  route: "core.workspace",
};
const marketplaceItem = {
  id: "core.marketplace",
  location: "primary.agentScoped",
  label: "Marketplace",
  route: "core.marketplace",
};
const modelsItem = {
  id: "core.models",
  location: "primary.settings",
  label: "Models",
  route: "core.models",
};

describe("Sidebar", () => {
  it("keeps the mounted feature navigation and account stable across docking and titlebar collapse", async () => {
    mocks.pageStyle = "dual-sidebar";
    renderWithProviders(
      <DesktopWindowFrame>
        <Sidebar selectedKey="core.chat" />
      </DesktopWindowFrame>,
    );
    const rail = screen.getByRole("navigation", { name: "Feature navigation" });
    const home = within(rail).getByRole("button", { name: "Home" });
    const account = within(rail).getByRole("button", {
      name: "Account and appearance",
    });
    const filter = screen.getByRole("textbox", { name: "Conversation filter" });
    fireEvent.change(filter, { target: { value: "retained across docking" } });
    for (const edge of ["bottom", "right", "floating", "left"]) {
      fireEvent.click(
        screen.getByRole("button", { name: "sidebar.dock.handle" }),
      );
      fireEvent.click(
        await screen.findByRole("menuitem", { name: `sidebar.dock.${edge}` }),
      );
      expect(document.querySelector("[data-navigation-dock]")).toHaveAttribute(
        "data-navigation-dock",
        edge,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Collapse conversation pane" }),
      );
      expect(filter).not.toBeVisible();
      expect(within(rail).getByRole("button", { name: "Home" })).toBe(home);
      expect(
        within(rail).getByRole("button", { name: "Account and appearance" }),
      ).toBe(account);
      expect(
        within(rail).queryByRole("button", { name: "globalSearch.title" }),
      ).toBeNull();
      fireEvent.click(
        screen.getByRole("button", { name: "Expand conversation pane" }),
      );
      expect(screen.getByRole("textbox", { name: "Conversation filter" })).toBe(
        filter,
      );
      expect(filter).toHaveValue("retained across docking");
    }
    fireEvent.click(account);

    expect(account).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByRole("dialog", { name: "Settings" }),
    ).toContainElement(screen.getByTestId("settings-panel"));
  });
  it("opens deferred quick settings without deprecated Tooltip props", async () => {
    mocks.renderActualSettingsPanel = true;
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      renderWithProviders(<Sidebar selectedKey="core.chat" />);
      fireEvent.click(screen.getByRole("button", { name: "Settings" }));
      expect(
        await screen.findByRole("button", { name: "Appearance" }),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(
          consoleError.mock.calls.filter(([message]) =>
            String(message).includes(
              "[antd: Tooltip] `overlayClassName` is deprecated",
            ),
          ),
        ).toHaveLength(0);
      });
    } finally {
      consoleError.mockRestore();
    }
  });

  it("shows a local identity capsule when authentication is disabled", () => {
    renderWithProviders(<Sidebar selectedKey="core.chat" />);
    const label = screen.getByText("sidebar.localWorkspace");
    expect(label.closest("button")).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.getByText("sidebar.localMode")).toBeInTheDocument();
  });

  beforeEach(() => {
    localStorage.removeItem("ugsci_navigation_dock_v1");
    mockMobileViewport(false);
    mocks.interfaceStyle = "classic";
    mocks.pageStyle = "classic";
    mocks.sidebar.railItemIds = [];
    for (const style of [
      "warm-minimal",
      "cool-workspace",
      "soft-focus",
      "deepseek",
      "openai",
      "dual-sidebar",
    ]) {
      localStorage.removeItem(`qwenpaw_sidebar_collapsed:${style}`);
      localStorage.removeItem(`qwenpaw_sidebar_width:${style}`);
    }
    localStorage.removeItem("qwenpaw_sidebar_width");
    localStorage.removeItem("qwenpaw_sidebar_collapsed");
    localStorage.setItem("qwenpaw_sidebar_tools_mode", "2");
    mocks.sidebar.focusItemIds = ["core.workspace", "core.models"];
    mocks.sidebar.hiddenPluginItemIds = [];
    mocks.menuItems = [workspaceItem, inboxItem, modelsItem];
    mocks.routes = [
      { id: "core.workspace", path: "/workspace" },
      { id: "core.inbox", path: "/inbox" },
      { id: "core.models", path: "/models" },
      { id: "core.chat", path: "/chat" },
    ];
    mocks.authStatus = { enabled: false, mode: "normal" };
    mocks.inboxEvents = [];
    mocks.approvals = [];
    mocks.getInboxEvents
      .mockReset()
      .mockImplementation(() => Promise.resolve({ events: mocks.inboxEvents }));
    mocks.getPushMessages.mockReset().mockResolvedValue({
      pending_approvals: [],
    });
    mocks.sessionList = [];
    mocks.isSessionSwitching = false;
    mocks.getEffectiveSessionId.mockClear();
    mocks.startNewSwitch.mockClear();
    mocks.preloadSession.mockReset().mockResolvedValue({ realId: "real-s-1" });
    mocks.finishSessionSwitch.mockClear();
    mocks.updateProfile.mockClear().mockResolvedValue({});
    mocks.changePassword.mockClear().mockResolvedValue({});
    mocks.restartRuntime.mockClear().mockResolvedValue({});
    mocks.setSelectedAgent.mockClear();
    mocks.refreshAgents.mockClear().mockResolvedValue(undefined);
    mocks.language = "en";
    mocks.renderActualSettingsPanel = false;
  });

  it("keeps plugin fills and navigation alive through floating and docking", async () => {
    renderSidebar();
    const slot = screen.getByRole("textbox", { name: "Plugin sider.top" });
    fireEvent.change(slot, { target: { value: "unsaved plugin input" } });
    const handle = screen.getByRole("button", {
      name: "Drag sidebar to float; Enter to toggle docking",
    });
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(
      document.querySelector('[data-sidebar-placement="floating"]'),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Workspace" }));
    expect(
      screen.getByRole("button", { name: "Collapse tools" }),
    ).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(
      screen.getByRole("button", { name: "Return sidebar to left edge" }),
    );
    expect(screen.getByRole("textbox", { name: "Plugin sider.top" })).toBe(
      slot,
    );
    expect(slot).toHaveValue("unsaved plugin input");
    expect(
      screen.getAllByRole("textbox", { name: "Plugin sider.bottom" }),
    ).toHaveLength(1);
  });

  it("preserves sidebar plugin drafts and expansion while changing interface styles", () => {
    // An explicit per-style expansion overrides each style's default layout.
    localStorage.setItem("qwenpaw_sidebar_collapsed:soft-focus", "false");
    const view = renderSidebar();
    const slot = screen.getByRole("textbox", { name: "Plugin sider.top" });
    fireEvent.change(slot, { target: { value: "unsaved research note" } });
    for (const style of [
      "warm-minimal",
      "cool-workspace",
      "soft-focus",
      "classic",
    ] as InterfaceStyle[]) {
      mocks.interfaceStyle = style;
      view.rerender(
        <>
          <Sidebar selectedKey="core.workspace" />
          <LocationProbe />
        </>,
      );
      expect(screen.getByRole("textbox", { name: "Plugin sider.top" })).toBe(
        slot,
      );
      expect(slot).toHaveValue("unsaved research note");
      expect(screen.getByRole("button", { name: "Workspace" })).toBeVisible();
      expect(localStorage.getItem("qwenpaw_sidebar_collapsed")).toBeNull();
    }
  });

  it("switches style layouts and restores independent sidebar choices without remounting plugins", () => {
    const view = renderSidebar();
    const slot = screen.getByRole("textbox", { name: "Plugin sider.top" });
    fireEvent.change(slot, { target: { value: "keep this plugin draft" } });
    const switchStyle = (style: PageStyle) => {
      mocks.pageStyle = style;
      view.rerender(
        <>
          <Sidebar selectedKey="core.workspace" />
          <LocationProbe />
        </>,
      );
    };
    switchStyle("deepseek");
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("208px"),
    });
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("66px"),
    });
    expect(slot).toBeInTheDocument();
    expect(slot).not.toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(slot).toBeVisible();
    fireEvent.keyDown(
      screen.getByRole("separator", { name: "Resize sidebar" }),
      { key: "End" },
    );
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("480px"),
    });
    switchStyle("classic");
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("280px"),
    });
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    switchStyle("deepseek");
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("480px"),
    });
    expect(screen.getByRole("textbox", { name: "Plugin sider.top" })).toBe(
      slot,
    );
    expect(slot).toHaveValue("keep this plugin draft");
    switchStyle("classic");
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("72px"),
    });
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("280px"),
    });
    expect(localStorage.getItem("qwenpaw_sidebar_collapsed")).toBeNull();
    expect(localStorage.getItem("qwenpaw_sidebar_width")).toBeNull();
  });

  it("connects Dual sidebar Home schedules experts workspace and plugin shortcuts through registered routes", async () => {
    mocks.pageStyle = "dual-sidebar";
    for (const [id, path, label] of [
      ["core.files", "/files", "Files"],
      ["core.app-center", "/apps", "Apps"],
      ["core.cron-jobs", "/cron-jobs", "Scheduled tasks"],
      ["ugsci.experts", "/ugsci-experts", "Experts"],
      ["core.run-center", "/run-center", "Runs"],
      ["plugin.other", "/other", "Other extension"],
    ]) {
      mocks.routes.push({ id, path });
      mocks.menuItems.push({
        id,
        label,
        route: id,
        location: "primary.agentScoped",
      });
    }
    renderSidebar({ selectedKey: "core.chat" });
    const rail = within(
      screen.getByRole("navigation", { name: "Feature navigation" }),
    );
    fireEvent.click(rail.getByRole("button", { name: "Home" }));
    expect(screen.getByTestId("probe-path")).toHaveTextContent("/chat");
    for (const [label, path] of [
      ["Scheduled tasks", "/cron-jobs"],
      ["Experts", "/ugsci-experts"],
      ["Apps", "/apps"],
      ["Runs", "/run-center"],
    ]) {
      fireEvent.click(rail.getByRole("button", { name: label }));
      expect(screen.getByTestId("probe-path")).toHaveTextContent(path);
    }
    const onWorkspace = vi.fn();
    window.addEventListener("qwenpaw:toggle-files-workspace", onWorkspace);
    try {
      fireEvent.click(rail.getByRole("button", { name: "Workspace" }));
      expect(onWorkspace).not.toHaveBeenCalled();
      expect(screen.getByTestId("probe-path")).toHaveTextContent("/files");
    } finally {
      window.removeEventListener("qwenpaw:toggle-files-workspace", onWorkspace);
    }
    fireEvent.click(rail.getByRole("button", { name: "More" }));
    const more = await screen.findByRole("dialog", { name: "More" });
    expect(more).toBeInTheDocument();
    expect(within(more).queryByRole("button", { name: "Files" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Models" }));
    expect(screen.getByTestId("probe-path")).toHaveTextContent("/models");
    fireEvent.click(rail.getByRole("button", { name: "Open settings" }));
    expect(screen.getByTestId("probe-path")).toHaveTextContent(
      "/settings/general",
    );
  });

  it.each(["en", "zh"])(
    "opens Workflows below Experts with a full workspace and restores conversation state in %s",
    async (language) => {
      mocks.pageStyle = "dual-sidebar";
      mocks.language = language;
      const workflowLabel = (language === "zh" ? zh : en).sidebar.dualSidebar
        .workflows;
      for (const [id, path, label] of [
        ["ugsci.experts", "/ugsci-experts", "Experts"],
        ["flowforge.editor", "/flowforge", workflowLabel],
      ]) {
        mocks.routes.push({ id, path });
        mocks.menuItems.push({
          id,
          label,
          route: id,
          location: "primary.agentScoped",
        });
      }
      renderWithProviders(<RoutedSidebar />);
      const filter = screen.getByRole("textbox", {
        name: "Conversation filter",
      });
      const plugin = screen.getByRole("textbox", { name: "Plugin sider.top" });
      fireEvent.change(filter, { target: { value: "中文 English" } });
      fireEvent.change(plugin, { target: { value: "未保存 draft" } });
      const rail = within(
        screen.getByRole("navigation", { name: "Feature navigation" }),
      );
      const workflow = rail.getByRole("button", { name: workflowLabel });
      expect(
        rail.getByRole("button", { name: "Experts" }).nextElementSibling,
      ).toBe(workflow);
      fireEvent.click(workflow);
      expect(screen.getByTestId("probe-path")).toHaveTextContent("/flowforge");
      expect(workflow).toHaveAttribute("aria-current", "page");
      expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
        width: conversationWidth("66px"),
      });
      expect(filter).not.toBeVisible();
      expect(plugin).not.toBeVisible();
      expect(queryRailExpand()).toBeNull();
      expect(
        screen.queryByRole("separator", { name: "Resize sidebar" }),
      ).toBeNull();
      expect(
        localStorage.getItem("qwenpaw_sidebar_collapsed:dual-sidebar"),
      ).toBeNull();
      fireEvent.click(rail.getByRole("button", { name: "More" }));
      const more = await screen.findByRole("dialog", { name: "More" });
      expect(
        within(more).queryByRole("button", { name: workflowLabel }),
      ).toBeNull();
      fireEvent.click(rail.getByRole("button", { name: "Home" }));
      expect(screen.getByTestId("probe-path")).toHaveTextContent("/chat");
      expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
        width: conversationWidth("308px"),
      });
      expect(screen.getByRole("textbox", { name: "Conversation filter" })).toBe(
        filter,
      );
      expect(filter).toHaveValue("中文 English");
      expect(screen.getByRole("textbox", { name: "Plugin sider.top" })).toBe(
        plugin,
      );
      expect(plugin).toHaveValue("未保存 draft");
    },
  );

  it.each([false, true])(
    "keeps direct workflow links full width with saved conversation collapse %s",
    (savedCollapsed) => {
      mocks.pageStyle = "dual-sidebar";
      localStorage.setItem(
        "qwenpaw_sidebar_collapsed:dual-sidebar",
        String(savedCollapsed),
      );
      mocks.routes.push({ id: "flowforge.editor", path: "/flowforge" });
      mocks.menuItems.push({
        id: "flowforge.editor",
        label: "Workflows",
        route: "flowforge.editor",
        location: "primary.agentScoped",
      });
      renderWithProviders(<RoutedSidebar />, {
        initialEntries: ["/flowforge?flow=中文-English#canvas"],
      });
      expect(screen.getByRole("button", { name: "Workflows" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
        width: conversationWidth("66px"),
      });
      expect(screen.getByTestId("session-list")).not.toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: "Home" }));
      expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
        width: conversationWidth(savedCollapsed ? "66px" : "308px"),
      });
      expect(
        localStorage.getItem("qwenpaw_sidebar_collapsed:dual-sidebar"),
      ).toBe(String(savedCollapsed));
    },
  );

  it.each(
    (["classic", "deepseek", "dual-sidebar"] as const).flatMap((pageStyle) =>
      [false, true].map((savedCollapsed) => ({ pageStyle, savedCollapsed })),
    ),
  )(
    "keeps visualization full width through late registration and restores the saved sidebar in $pageStyle with collapse $savedCollapsed",
    ({ pageStyle, savedCollapsed }) => {
      mocks.pageStyle = pageStyle;
      const preferenceKey =
        pageStyle === "classic"
          ? "qwenpaw_sidebar_collapsed"
          : `qwenpaw_sidebar_collapsed:${pageStyle}`;
      localStorage.setItem(preferenceKey, String(savedCollapsed));
      const view = renderWithProviders(<RoutedSidebar />, {
        initialEntries: ["/OILGAS-Visualization/?datasetId=中文-grid#scene"],
      });
      const width = conversationWidth(
        pageStyle === "classic" ? "72px" : "66px",
      );
      const filter = screen.getByLabelText("Conversation filter");
      expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
        width,
      });
      expect(filter).not.toBeVisible();
      mocks.routes.push({
        id: "ugsci.visualization",
        path: "/oilgas-visualization",
      });
      view.rerender(<RoutedSidebar />);
      expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
        width,
      });
      expect(screen.getByLabelText("Conversation filter")).toBe(filter);
      expect(filter).not.toBeVisible();
      expect(
        screen.queryByRole("separator", { name: "Resize sidebar" }),
      ).toBeNull();
      expect(queryRailExpand()).toBeNull();
      fireEvent.click(
        screen.getByRole("button", {
          name: pageStyle === "dual-sidebar" ? "Home" : "New task",
        }),
      );
      expect(screen.getByTestId("probe-path")).toHaveTextContent("/chat");
      expect(
        screen.queryByRole("textbox", { name: "Conversation filter" }),
      ).toBe(savedCollapsed ? null : filter);
      expect(localStorage.getItem(preferenceKey)).toBe(String(savedCollapsed));
    },
  );

  it("opens visualization from the rail and restores mounted conversation and plugin drafts on return", () => {
    mocks.pageStyle = "dual-sidebar";
    mocks.sidebar.railItemIds = ["ugsci.visualization"];
    mocks.routes.push({
      id: "ugsci.visualization",
      path: "/oilgas-visualization",
    });
    mocks.menuItems.push({
      id: "ugsci.visualization",
      route: "ugsci.visualization",
      label: "Visualization",
      location: "primary.agentScoped",
    });
    renderWithProviders(<RoutedSidebar />);
    const filter = screen.getByRole("textbox", { name: "Conversation filter" });
    const plugin = screen.getByRole("textbox", { name: "Plugin sider.top" });
    fireEvent.change(filter, { target: { value: "保留筛选" } });
    fireEvent.change(plugin, { target: { value: "未保存草稿" } });
    fireEvent.click(screen.getByRole("button", { name: "Visualization" }));
    expect(screen.getByTestId("probe-path")).toHaveTextContent(
      "/oilgas-visualization",
    );
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("66px"),
    });
    expect(filter).not.toBeVisible();
    expect(plugin).not.toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("308px"),
    });
    expect(screen.getByRole("textbox", { name: "Conversation filter" })).toBe(
      filter,
    );
    expect(filter).toHaveValue("保留筛选");
    expect(screen.getByRole("textbox", { name: "Plugin sider.top" })).toBe(
      plugin,
    );
    expect(plugin).toHaveValue("未保存草稿");
    expect(
      localStorage.getItem("qwenpaw_sidebar_collapsed:dual-sidebar"),
    ).toBeNull();
  });

  it.each(
    (["classic", "deepseek", "dual-sidebar"] as const).flatMap((pageStyle) =>
      [
        "/files/?root=中文",
        "/apps",
        "/apps/example-app?view=详情",
        "/market",
        "/market?tab=plugins",
        "/market?tab=skills&target=pool",
        "/market?tab=ugsci",
        "/MARKET/?tab=other-extension",
      ].flatMap((path) =>
        [false, true].map((savedCollapsed) => ({
          pageStyle,
          path,
          savedCollapsed,
        })),
      ),
    ),
  )(
    "keeps workspace and app links full width in $pageStyle at $path with saved collapse $savedCollapsed",
    ({ pageStyle, path, savedCollapsed }) => {
      mocks.pageStyle = pageStyle;
      const preferenceKey =
        pageStyle === "classic"
          ? "qwenpaw_sidebar_collapsed"
          : `qwenpaw_sidebar_collapsed:${pageStyle}`;
      localStorage.setItem(preferenceKey, String(savedCollapsed));
      renderWithProviders(<RoutedSidebar />, { initialEntries: [path] });
      const width = conversationWidth(
        pageStyle === "classic" ? "72px" : "66px",
      );
      expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
        width,
      });
      expect(screen.queryByTestId("session-list")).not.toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Expand sidebar" }),
      ).toBeNull();
      expect(queryRailExpand()).toBeNull();
      expect(
        screen.queryByRole("button", { name: "chat.chatHistoryTooltip" }),
      ).toBeNull();
      expect(
        screen.queryByRole("separator", { name: "Resize sidebar" }),
      ).toBeNull();
      expect(localStorage.getItem(preferenceKey)).toBe(String(savedCollapsed));
    },
  );

  it("keeps the full extension area on the rail across real marketplace tab navigation", () => {
    mocks.pageStyle = "dual-sidebar";
    mocks.routes.push(
      { id: "core.app-center", path: "/apps" },
      { id: "core.marketplace", path: "/market" },
    );
    const registration = marketplaceExtensionRegistry.add(
      "sidebar-layout-test",
      {
        id: "ugsci",
        label: "UGSci",
        component: () => null,
      },
    );
    function MarketplaceSidebar() {
      const location = useLocation();
      return (
        <>
          <RoutedSidebar />
          {location.pathname !== "/chat" && (
            <MarketplaceHeader
              activeSection={
                new URLSearchParams(location.search).get("tab") ?? "apps"
              }
            />
          )}
        </>
      );
    }
    try {
      renderWithProviders(<MarketplaceSidebar />);
      const filter = screen.getByRole("textbox", {
        name: "Conversation filter",
      });
      const plugin = screen.getByRole("textbox", { name: "Plugin sider.top" });
      fireEvent.change(filter, { target: { value: "保留筛选" } });
      fireEvent.change(plugin, { target: { value: "保留草稿" } });
      const rail = within(
        screen.getByRole("navigation", { name: "Feature navigation" }),
      );
      fireEvent.click(rail.getByRole("button", { name: "Apps" }));
      for (const [label, path] of [
        ["Plugins", "/market?tab=plugins"],
        ["Skills", "/market?tab=skills"],
        ["UGSci", "/market?tab=ugsci"],
        ["Apps", "/market"],
      ]) {
        const header = within(
          document.querySelector<HTMLElement>("[data-page-header]")!,
        );
        fireEvent.click(header.getByText(label, { exact: true }));
        expect(screen.getByTestId("probe-path").textContent).toBe(path);
        expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
          width: conversationWidth("66px"),
        });
        expect(filter).not.toBeVisible();
        expect(plugin).not.toBeVisible();
        expect(rail.getByRole("button", { name: "Apps" })).toHaveAttribute(
          "aria-current",
          "page",
        );
        expect(queryRailExpand()).toBeNull();
      }
      fireEvent.click(rail.getByRole("button", { name: "Home" }));
      expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
        width: conversationWidth("308px"),
      });
      expect(screen.getByRole("textbox", { name: "Conversation filter" })).toBe(
        filter,
      );
      expect(filter).toHaveValue("保留筛选");
      expect(screen.getByRole("textbox", { name: "Plugin sider.top" })).toBe(
        plugin,
      );
      expect(plugin).toHaveValue("保留草稿");
      expect(
        localStorage.getItem("qwenpaw_sidebar_collapsed:dual-sidebar"),
      ).toBeNull();
    } finally {
      act(() => registration.dispose());
    }
  });

  it.each(["deepseek", "dual-sidebar"] as const)(
    "opens workspace and apps full width from chat and restores drafts in %s",
    (pageStyle) => {
      mocks.pageStyle = pageStyle;
      for (const [id, path, label] of [
        ["core.files", "/files", "Files"],
        ["core.app-center", "/apps", "Apps"],
      ]) {
        mocks.routes.push({ id, path });
        mocks.menuItems.push({
          id,
          route: id,
          label,
          location: "primary.agentScoped",
        });
      }
      renderWithProviders(<RoutedSidebar />);
      const filter = screen.getByRole("textbox", {
        name: "Conversation filter",
      });
      const plugin = screen.getByRole("textbox", { name: "Plugin sider.top" });
      fireEvent.change(filter, { target: { value: "对话筛选" } });
      fireEvent.change(plugin, { target: { value: "未保存草稿" } });
      for (const [label, path] of [
        ["Workspace", "/files"],
        ["Apps", "/apps"],
      ]) {
        fireEvent.click(screen.getByRole("button", { name: label }));
        expect(screen.getByTestId("probe-path")).toHaveTextContent(path);
        expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
          width: conversationWidth("66px"),
        });
        expect(filter).not.toBeVisible();
        expect(plugin).not.toBeVisible();
        fireEvent.click(
          screen.getByRole("button", {
            name: pageStyle === "dual-sidebar" ? "Home" : "New task",
          }),
        );
        expect(screen.getByTestId("probe-path")).toHaveTextContent("/chat");
        expect(
          screen.getByRole("textbox", { name: "Conversation filter" }),
        ).toBe(filter);
        expect(filter).toHaveValue("对话筛选");
        expect(screen.getByRole("textbox", { name: "Plugin sider.top" })).toBe(
          plugin,
        );
        expect(plugin).toHaveValue("未保存草稿");
      }
      expect(
        localStorage.getItem(`qwenpaw_sidebar_collapsed:${pageStyle}`),
      ).toBeNull();
    },
  );

  it.each(["classic", "deepseek", "dual-sidebar"] as const)(
    "uses the navigation rail for direct workflow pages in %s",
    (pageStyle) => {
      mocks.pageStyle = pageStyle;
      mocks.routes.push({ id: "flowforge.editor", path: "/flowforge" });
      mocks.menuItems.push({
        id: "flowforge.editor",
        label: "Workflows",
        route: "flowforge.editor",
        location: "primary.agentScoped",
      });
      renderWithProviders(<RoutedSidebar />, {
        initialEntries: ["/flowforge"],
      });
      expect(screen.getByRole("button", { name: "Workflows" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
        width: conversationWidth(pageStyle === "classic" ? "72px" : "66px"),
      });
      expect(screen.getByTestId("session-list")).not.toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Expand sidebar" }),
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: "chat.chatHistoryTooltip" }),
      ).toBeNull();
      expect(
        screen.queryByRole("separator", { name: "Resize sidebar" }),
      ).toBeNull();
    },
  );

  it("renders the default tools and visualization below the divider after plugins register", () => {
    mocks.pageStyle = "dual-sidebar";
    mocks.sidebar.railItemIds = ["ugsci.tools-skills", "ugsci.visualization"];
    const view = renderWithProviders(<RoutedSidebar />);
    const rail = screen.getByRole("navigation", { name: "Feature navigation" });
    const shortcuts = within(rail).getByRole("group", {
      name: "Custom shortcuts",
    });
    expect(within(shortcuts).queryAllByRole("button")).toHaveLength(0);
    for (const [id, label, path] of [
      ["ugsci.tools-skills", "Tools and skills", "/ugsci-tools-skills"],
      [
        "ugsci.visualization",
        "Oil and gas visualization",
        "/oilgas-visualization",
      ],
    ]) {
      mocks.routes.push({ id, path });
      mocks.menuItems.push({
        id,
        route: id,
        label,
        location: "primary.agentScoped",
      });
    }
    view.rerender(<RoutedSidebar />);
    expect(shortcuts.previousElementSibling?.tagName).toBe("HR");
    expect(
      within(shortcuts)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Tools and skills", "Oil and gas visualization"]);
    fireEvent.click(
      within(shortcuts).getByRole("button", { name: "Tools and skills" }),
    );
    expect(screen.getByTestId("probe-path")).toHaveTextContent(
      "/ugsci-tools-skills",
    );
    fireEvent.click(
      within(shortcuts).getByRole("button", {
        name: "Oil and gas visualization",
      }),
    );
    expect(screen.getByTestId("probe-path")).toHaveTextContent(
      "/oilgas-visualization",
    );
    expect(
      within(shortcuts).getByRole("button", {
        name: "Oil and gas visualization",
      }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("renders ordered custom apps and modules below More and follows their real routes", () => {
    mocks.pageStyle = "dual-sidebar";
    mocks.sidebar.railItemIds = [
      "pawapp:notes",
      "core.models",
      "core.files",
      "missing.plugin",
    ];
    renderWithProviders(<RoutedSidebar />);
    const rail = screen.getByRole("navigation", { name: "Feature navigation" });
    const custom = within(rail).getByRole("group", {
      name: "Custom shortcuts",
    });
    expect(
      within(custom)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Notes", "Models"]);
    expect(custom.previousElementSibling?.tagName).toBe("HR");
    fireEvent.click(within(custom).getByRole("button", { name: "Notes" }));
    expect(screen.getByTestId("probe-path")).toHaveTextContent("/apps/notes");
    expect(
      within(custom).getByRole("button", { name: "Notes" }),
    ).toHaveAttribute("aria-current", "page");
    fireEvent.click(within(custom).getByRole("button", { name: "Models" }));
    expect(screen.getByTestId("probe-path")).toHaveTextContent("/models");
    mocks.sidebar.railItemIds = [];
  });

  it("pins More entries and installed apps through the existing sidebar preference", async () => {
    mocks.pageStyle = "dual-sidebar";
    mocks.sidebar.railItemIds = [];
    mocks.sidebar.setRailItemIds.mockImplementation((ids: string[]) => {
      mocks.sidebar.railItemIds = ids;
    });
    const view = renderWithProviders(<RoutedSidebar />);
    const rail = screen.getByRole("navigation", { name: "Feature navigation" });
    fireEvent.click(within(rail).getByRole("button", { name: "More" }));
    let dialog = await screen.findByRole("dialog", { name: "More" });
    expect(
      within(dialog).getByRole("button", { name: "Notes" }),
    ).toBeInTheDocument();
    const models = within(dialog).getByRole("button", { name: "Models" });
    const pin =
      models.parentElement!.querySelector<HTMLButtonElement>("button[title]")!;
    fireEvent.click(pin);
    expect(mocks.sidebar.setRailItemIds).toHaveBeenLastCalledWith([
      "core.models",
    ]);
    view.rerender(<RoutedSidebar />);
    dialog = screen.getByRole("dialog", { name: "More" });
    expect(within(dialog).queryByRole("button", { name: "Models" })).toBeNull();
    expect(within(rail).getByRole("button", { name: "Models" })).toBeVisible();
    const notes = within(dialog).getByRole("button", { name: "Notes" });
    fireEvent.click(
      notes.parentElement!.querySelector<HTMLButtonElement>("button[title]")!,
    );
    expect(mocks.sidebar.setRailItemIds).toHaveBeenLastCalledWith([
      "core.models",
      "pawapp:notes",
    ]);
    view.rerender(<RoutedSidebar />);
    expect(within(dialog).queryByRole("button", { name: "Notes" })).toBeNull();
    fireEvent.click(within(rail).getByRole("button", { name: "Notes" }));
    expect(screen.getByTestId("probe-path")).toHaveTextContent("/apps/notes");
    mocks.sidebar.setRailItemIds.mockReset();
  });

  it("keeps only the feature rail in settings and restores conversation state on return", () => {
    mocks.pageStyle = "dual-sidebar";
    const view = renderWithProviders(<Sidebar selectedKey="core.chat" />);
    const filter = screen.getByLabelText("Conversation filter");
    fireEvent.change(filter, { target: { value: "saved search" } });
    const plugin = screen.getByLabelText("Plugin sider.top");
    fireEvent.change(plugin, { target: { value: "saved plugin draft" } });

    view.rerender(<Sidebar selectedKey="example.settings" settingsActive />);
    expect(
      screen.getByRole("navigation", { name: "Feature navigation" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Open settings" }),
    ).toHaveAttribute("aria-current", "page");
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("66px"),
    });
    expect(filter).not.toBeVisible();
    expect(queryRailExpand()).toBeNull();
    expect(
      localStorage.getItem("qwenpaw_sidebar_collapsed:dual-sidebar"),
    ).toBeNull();

    view.rerender(<Sidebar selectedKey="core.chat" />);
    expect(screen.getByLabelText("Conversation filter")).toBe(filter);
    expect(filter).toBeVisible();
    expect(filter).toHaveValue("saved search");
    expect(screen.getByLabelText("Plugin sider.top")).toBe(plugin);
    expect(plugin).toHaveValue("saved plugin draft");
  });

  it.each([false, true])(
    "preserves the app return target when reopening settings from the rail (plugin %s)",
    (plugin) => {
      mocks.pageStyle = "dual-sidebar";
      const returnTo = "/chat?session=1#messages";
      renderWithProviders(
        <>
          <Sidebar selectedKey="example.settings" settingsActive />
          <SettingsReturnProbe />
        </>,
        {
          initialEntries: [
            {
              pathname: "/example-settings",
              state: plugin
                ? {
                    settingsPluginContext: {
                      source: "example",
                      routeId: "example.settings",
                      returnTo,
                    },
                  }
                : { settingsReturnTo: returnTo },
            },
          ],
        },
      );
      fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
      expect(screen.getByTestId("settings-return")).toHaveTextContent(returnTo);
    },
  );

  it("hides conversations before the workflow plugin finishes registering its route", () => {
    mocks.pageStyle = "dual-sidebar";
    const view = renderWithProviders(<RoutedSidebar />, {
      initialEntries: ["/FlowForge/?flow=中文-English"],
    });
    const filter = screen.getByLabelText("Conversation filter");
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("66px"),
    });
    expect(filter).not.toBeVisible();
    mocks.routes.push({ id: "flowforge.editor", path: "/flowforge" });
    mocks.menuItems.push({
      id: "flowforge.editor",
      label: "Workflows",
      route: "flowforge.editor",
      location: "primary.agentScoped",
    });
    view.rerender(<RoutedSidebar />);
    expect(screen.getByRole("button", { name: "Workflows" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByLabelText("Conversation filter")).toBe(filter);
    expect(filter).not.toBeVisible();
    expect(
      localStorage.getItem("qwenpaw_sidebar_collapsed:dual-sidebar"),
    ).toBeNull();
  });

  it("keeps the workflow rail compact across mobile and desktop viewports", () => {
    mocks.pageStyle = "dual-sidebar";
    mockMobileViewport(true);
    mocks.routes.push({ id: "flowforge.editor", path: "/flowforge" });
    mocks.menuItems.push({
      id: "flowforge.editor",
      label: "Workflows",
      route: "flowforge.editor",
      location: "primary.agentScoped",
    });
    renderWithProviders(<RoutedSidebar />, { initialEntries: ["/flowforge"] });
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("56px"),
    });
    expect(screen.getByTestId("session-list")).not.toBeVisible();
    act(() => {
      viewportState.matches = false;
      viewportState.listeners.forEach((listener) => listener());
    });
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("66px"),
    });
    expect(screen.getByTestId("session-list")).not.toBeVisible();
    expect(
      localStorage.getItem("qwenpaw_sidebar_collapsed:dual-sidebar"),
    ).toBeNull();
  });

  it("hides the workflow shortcut when its route is unavailable or explicitly hidden", () => {
    mocks.pageStyle = "dual-sidebar";
    mocks.menuItems.push({
      id: "flowforge.editor",
      label: "Workflows",
      route: "flowforge.editor",
      location: "primary.agentScoped",
    });
    const view = renderWithProviders(<RoutedSidebar />);
    expect(screen.queryByRole("button", { name: "Workflows" })).toBeNull();
    mocks.routes.push({ id: "flowforge.editor", path: "/flowforge" });
    view.rerender(<RoutedSidebar />);
    expect(screen.getByRole("button", { name: "Workflows" })).toBeVisible();
    mocks.sidebar.hiddenPluginItemIds = ["flowforge.editor"];
    view.rerender(<RoutedSidebar />);
    expect(screen.queryByRole("button", { name: "Workflows" })).toBeNull();
  });

  it("keeps Dual sidebar conversation and plugin drafts mounted while its second pane collapses and styles switch", () => {
    mocks.pageStyle = "dual-sidebar";
    const view = renderSidebar();
    const filter = screen.getByRole("textbox", { name: "Conversation filter" });
    const plugin = screen.getByRole("textbox", { name: "Plugin sider.top" });
    fireEvent.change(filter, { target: { value: "retained search" } });
    fireEvent.change(plugin, { target: { value: "retained plugin draft" } });
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("308px"),
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Collapse conversation pane" }),
    );
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("66px"),
    });
    expect(filter).not.toBeVisible();
    expect(plugin).not.toBeVisible();
    expect(screen.getByRole("button", { name: "Home" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "globalSearch.title" }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Expand conversation pane" }),
    );
    expect(screen.getByRole("textbox", { name: "Conversation filter" })).toBe(
      filter,
    );
    expect(filter).toHaveValue("retained search");
    fireEvent.keyDown(
      screen.getByRole("separator", { name: "Resize sidebar" }),
      { key: "End" },
    );
    expect(localStorage.getItem("qwenpaw_sidebar_width:dual-sidebar")).toBe(
      "480",
    );
    mocks.pageStyle = "deepseek";
    view.rerender(
      <>
        <Sidebar selectedKey="core.workspace" />
        <LocationProbe />
      </>,
    );
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("208px"),
    });
    mocks.pageStyle = "dual-sidebar";
    view.rerender(
      <>
        <Sidebar selectedKey="core.workspace" />
        <LocationProbe />
      </>,
    );
    expect(document.querySelector(".ant-layout-sider")).toHaveStyle({
      width: conversationWidth("480px"),
    });
    expect(screen.getByRole("textbox", { name: "Conversation filter" })).toBe(
      filter,
    );
    expect(screen.getByRole("textbox", { name: "Plugin sider.top" })).toBe(
      plugin,
    );
    expect(plugin).toHaveValue("retained plugin draft");
  });

  it("keeps prototype navigation connected to registered apps, automation, workspace and plugin shortcuts", () => {
    mocks.pageStyle = "deepseek";
    mocks.menuItems.push({
      id: "core.files",
      location: "primary.agentScoped",
      route: "core.files",
      label: "Files",
    });
    mocks.menuItems.push({
      id: "core.cron-jobs",
      location: "primary.agentScoped",
      route: "core.cron-jobs",
      label: "Automation",
    });
    mocks.routes.push(
      { id: "core.files", path: "/files" },
      { id: "core.app-center", path: "/apps" },
      { id: "core.cron-jobs", path: "/cron-jobs" },
    );
    const onWorkspace = vi.fn();
    window.addEventListener("qwenpaw:toggle-files-workspace", onWorkspace);
    try {
      renderSidebar({ selectedKey: "core.chat" });
      fireEvent.click(screen.getByRole("button", { name: "Apps" }));
      expect(screen.getByTestId("probe-path")).toHaveTextContent("/apps");
      fireEvent.click(screen.getByRole("button", { name: "New task" }));
      fireEvent.click(screen.getByRole("button", { name: "Automation" }));
      expect(screen.getByTestId("probe-path")).toHaveTextContent("/cron-jobs");
      fireEvent.click(screen.getByRole("button", { name: "Workspace" }));
      expect(onWorkspace).not.toHaveBeenCalled();
      expect(screen.getByTestId("probe-path")).toHaveTextContent("/files");
      fireEvent.click(screen.getByRole("button", { name: "New task" }));
      fireEvent.click(screen.getByRole("button", { name: "More" }));
      fireEvent.click(screen.getByRole("button", { name: "Models" }));
      expect(screen.getByTestId("probe-path")).toHaveTextContent("/models");
    } finally {
      window.removeEventListener("qwenpaw:toggle-files-workspace", onWorkspace);
    }
  });

  it.each(["deepseek", "dual-sidebar"] as const)(
    "focuses the More panel without highlighting the first shortcut in %s",
    async (pageStyle) => {
      mocks.pageStyle = pageStyle;
      mocks.sidebar.focusItemIds = ["core.agent-config", "core.models"];
      mocks.menuItems.push({
        id: "core.agent-config",
        location: "primary.agentScoped",
        label: "Runtime configuration",
        route: "core.agent-config",
      });
      mocks.routes.push({ id: "core.agent-config", path: "/agent-config" });
      const user = userEvent.setup();
      renderSidebar({ selectedKey: "core.models" });
      const more = screen.getByRole("button", { name: "More" });

      for (let attempt = 0; attempt < 2; attempt += 1) {
        await user.click(more);
        const panel = await screen.findByRole("dialog", { name: "More" });
        await waitFor(() => expect(panel).toHaveFocus());
        expect(
          within(panel).getByRole("button", { name: "Runtime configuration" }),
        ).not.toHaveAttribute("aria-current");
        expect(
          within(panel).getByRole("button", { name: "Models" }),
        ).toHaveAttribute("aria-current", "page");
        await user.tab();
        expect(within(panel).getAllByRole("button")[0]).toHaveFocus();
        await user.keyboard("{Escape}");
        expect(more).toHaveFocus();
        expect(more).toHaveAttribute("aria-expanded", "false");
      }

      await user.keyboard("{Enter}");
      const panel = await screen.findByRole("dialog", { name: "More" });
      await waitFor(() => expect(panel).toHaveFocus());
      await user.click(
        within(panel).getByRole("button", { name: "Runtime configuration" }),
      );
      expect(screen.getByTestId("probe-path")).toHaveTextContent(
        "/agent-config",
      );
      expect(more).toHaveAttribute("aria-expanded", "false");
    },
  );

  it("groups More shortcuts and keeps settings in the account menu", async () => {
    mocks.pageStyle = "deepseek";
    mocks.renderActualSettingsPanel = true;
    mocks.menuItems.push(inboxItem, {
      id: "plugin.tools",
      location: "primary.agentScoped",
      route: "plugin.tools",
      label: "Tools and skills",
    });
    mocks.routes.push(
      { id: "core.inbox", path: "/inbox" },
      { id: "plugin.tools", path: "/tools" },
    );
    mocks.approvals = [{ request_id: "pending-1" }];
    renderSidebar({ selectedKey: "core.chat" });
    expect(screen.getAllByRole("button", { name: "Settings" })).toHaveLength(1);
    const more = screen.getByRole("button", { name: "More" });
    fireEvent.click(more);
    const panel = screen.getByRole("dialog", { name: "More" });
    expect(
      screen.getByRole("region", { name: "Work & notifications" }),
    ).toHaveTextContent("Inbox");
    expect(
      screen.getByRole("region", { name: "Configuration" }),
    ).toHaveTextContent("Models");
    expect(
      screen.getByRole("region", { name: "Extensions" }),
    ).toHaveTextContent("Tools and skills");
    expect(panel).not.toHaveTextContent("Settings");
    fireEvent.keyDown(panel, { key: "Escape" });
    expect(more).toHaveFocus();
    expect(more).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(more);
    fireEvent.click(screen.getByRole("button", { name: /Inbox/ }));
    expect(screen.getByTestId("probe-path")).toHaveTextContent(
      "/inbox?tab=approvals",
    );
    expect(more).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    const account = await screen.findByRole("dialog", { name: "Settings" });
    expect(account).toHaveTextContent("Settings");
  });

  it("cycles collapsed, compact and detailed tools without folding on navigation", () => {
    localStorage.removeItem("qwenpaw_sidebar_tools_mode");
    renderSidebar();
    expect(
      screen.queryByRole("button", { name: "Workspace" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Compact tools" }));
    fireEvent.click(screen.getByRole("button", { name: "Workspace" }));
    expect(
      screen.getByRole("button", { name: "Detailed tools" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(localStorage.getItem("qwenpaw_sidebar_tools_mode")).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: "Detailed tools" }));
    expect(localStorage.getItem("qwenpaw_sidebar_tools_mode")).toBe("2");
    fireEvent.click(screen.getByTestId("tool-header-toggle"));
    expect(localStorage.getItem("qwenpaw_sidebar_tools_mode")).toBe("0");
    expect(
      screen.queryByRole("button", { name: "Pin tools" }),
    ).not.toBeInTheDocument();
  });

  it("shows navigation labels as tooltips in compact tools mode", async () => {
    localStorage.setItem("qwenpaw_sidebar_tools_mode", "1");
    renderSidebar();

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Workspace" }));

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Workspace");
  });

  it("keeps compact navigation tooltips from blocking adjacent items", async () => {
    localStorage.setItem("qwenpaw_sidebar_tools_mode", "1");
    mocks.sidebar.focusItemIds = ["core.marketplace", "core.inbox"];
    mocks.menuItems = [marketplaceItem, inboxItem, modelsItem];
    mocks.routes = [
      { id: "core.marketplace", path: "/market" },
      { id: "core.inbox", path: "/inbox" },
      { id: "core.models", path: "/models" },
      { id: "core.chat", path: "/chat" },
    ];
    renderSidebar({ selectedKey: "core.marketplace" });

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Marketplace" }));
    expect(await screen.findByRole("tooltip")).toHaveStyle({
      pointerEvents: "none",
    });

    fireEvent.click(screen.getByRole("button", { name: "Inbox" }));
    expect(screen.getByTestId("probe-path")).toHaveTextContent("/inbox");
  });

  it("collapses tools when the open header blank area is clicked", async () => {
    localStorage.setItem("qwenpaw_sidebar_tools_mode", "1");
    renderSidebar();

    fireEvent.click(screen.getByTestId("tool-header-toggle"));

    expect(localStorage.getItem("qwenpaw_sidebar_tools_mode")).toBe("0");
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Workspace" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Compact tools" })).toBeVisible();
  });

  it("restores the previous detailed mode after a header collapse", async () => {
    localStorage.setItem("qwenpaw_sidebar_tools_mode", "2");
    renderSidebar();

    fireEvent.click(screen.getByTestId("tool-header-toggle"));

    expect(localStorage.getItem("qwenpaw_sidebar_tools_mode")).toBe("0");
    expect(localStorage.getItem("qwenpaw_sidebar_tools_last_open_mode")).toBe(
      "2",
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Workspace" }),
      ).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTestId("tool-header-toggle"));

    expect(localStorage.getItem("qwenpaw_sidebar_tools_mode")).toBe("2");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Workspace" })).toBeVisible(),
    );
  });

  it("renders the unified desktop sidebar with agent and settings menus", async () => {
    renderSidebar();
    await waitFor(() => {
      expect(screen.getByTestId("agent-selector")).toBeTruthy();
    });
    expect(screen.getByTestId("session-list")).toBeTruthy();
    // Menu labels resolve from the mocked menu registry
    expect(screen.getByText("Workspace")).toBeTruthy();
    expect(screen.getByText("Models")).toBeTruthy();
  });

  it("resolves menu labels again when the language changes", async () => {
    mocks.menuItems = [
      {
        ...workspaceItem,
        label: () => (mocks.language === "ja" ? "ワークスペース" : "Workspace"),
      },
    ];

    const view = renderSidebar();
    expect(await screen.findByText("Workspace")).toBeVisible();

    mocks.language = "ja";
    view.rerender(
      <>
        <Sidebar selectedKey="core.workspace" />
        <LocationProbe />
      </>,
    );

    expect(await screen.findByText("ワークスペース")).toBeVisible();
    expect(screen.queryByText("Workspace")).not.toBeInTheDocument();
  });

  it("refreshes collapsed menu labels when the language changes", async () => {
    mockMobileViewport(true);
    mocks.menuItems = [
      {
        ...workspaceItem,
        label: () => (mocks.language === "ja" ? "ワークスペース" : "Workspace"),
      },
    ];

    const view = renderSidebar();
    expect(
      await screen.findByRole("button", { name: "Workspace" }),
    ).toBeVisible();

    mocks.language = "ja";
    view.rerender(
      <>
        <Sidebar selectedKey="core.workspace" />
        <LocationProbe />
      </>,
    );

    expect(
      await screen.findByRole("button", { name: "ワークスペース" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Workspace" }),
    ).not.toBeInTheDocument();
  });

  it("distinguishes full settings navigation from quick settings", async () => {
    renderSidebar();

    expect(
      await screen.findByRole("button", { name: "More settings" }),
    ).toBeVisible();
    const quickSettings = screen.getByRole("button", { name: "Settings" });
    expect(quickSettings).toHaveAttribute("aria-haspopup", "dialog");
    expect(quickSettings).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(quickSettings);

    expect(quickSettings).toHaveAttribute("aria-expanded", "true");
  });

  it("handles session clicks by navigating to the resolved session path", async () => {
    mocks.preloadSession.mockResolvedValueOnce({ realId: "uuid-1" });
    renderSidebar();
    const openBtn = await screen.findByTestId("sl-click");
    fireEvent.click(openBtn);
    expect(mocks.startNewSwitch).toHaveBeenCalled();
    expect(mocks.preloadSession).toHaveBeenCalledWith(
      "s-1",
      expect.any(AbortSignal),
    );
    await waitFor(() => {
      expect(screen.getByTestId("probe-path").textContent).toContain("uuid-1");
    });
    expect(mocks.getEffectiveSessionId).toHaveBeenCalledWith("s-1", "uuid-1");
    expect(mocks.finishSessionSwitch).toHaveBeenCalled();
  });

  it("clears the sidebar switch on an identity abort without navigating", async () => {
    mocks.preloadSession.mockRejectedValueOnce(
      new DOMException("Identity changed", "AbortError"),
    );
    const onDone = vi.fn();
    window.addEventListener("qwenpaw:sidebar-switch-done", onDone);
    renderSidebar();
    const pathBefore = screen.getByTestId("probe-path").textContent;
    fireEvent.click(await screen.findByTestId("sl-click"));

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(screen.getByTestId("probe-path").textContent).toBe(pathBefore);
    expect(mocks.finishSessionSwitch).toHaveBeenCalledOnce();
    window.removeEventListener("qwenpaw:sidebar-switch-done", onDone);
  });

  it("navigates to the effective id when preload fails", async () => {
    mocks.preloadSession.mockRejectedValueOnce(new Error("Preload failed"));
    renderSidebar();
    fireEvent.click(await screen.findByTestId("sl-click"));

    await waitFor(() => {
      expect(screen.getByTestId("probe-path").textContent).toContain(
        "real-s-1",
      );
    });
    expect(mocks.getEffectiveSessionId).toHaveBeenCalledWith("s-1");
    expect(mocks.finishSessionSwitch).toHaveBeenCalledOnce();
  });

  it("dispatches the new-chat flow from the session list", async () => {
    renderSidebar();
    const btns = screen.getAllByTestId("sl-new-chat");
    // Route starts with /chat → dispatches the DOM event
    let fired = false;
    const listener = () => {
      fired = true;
    };
    window.addEventListener("qwenpaw:sidebar-new-chat", listener);
    fireEvent.click(btns[0]);
    expect(fired).toBe(true);
    window.removeEventListener("qwenpaw:sidebar-new-chat", listener);
  });

  it("cancels an in-flight sidebar switch before opening a new task", async () => {
    const controller = new AbortController();
    let completePreload!: (value: { realId: string }) => void;
    const pending = new Promise<{ realId: string }>((resolve) => {
      completePreload = resolve;
    });
    mocks.startNewSwitch.mockReturnValueOnce(controller);
    mocks.preloadSession.mockReturnValueOnce(pending);
    mocks.finishSessionSwitch.mockImplementationOnce(() => {
      controller.abort();
      mocks.isSessionSwitching = false;
    });
    const onDone = vi.fn();
    window.addEventListener("qwenpaw:sidebar-switch-done", onDone);
    renderWithProviders(
      <>
        <Sidebar selectedKey="core.workspace" />
        <LocationProbe />
      </>,
      { initialEntries: ["/workspace"] },
    );

    fireEvent.click(await screen.findByTestId("sl-click"));
    mocks.isSessionSwitching = true;
    fireEvent.click(screen.getByRole("button", { name: "New task" }));
    expect(controller.signal.aborted).toBe(true);
    expect(onDone).toHaveBeenCalledOnce();
    expect(screen.getByTestId("probe-path").textContent).toBe("/chat");

    await act(async () => {
      completePreload({ realId: "old-session" });
      await pending;
    });
    expect(screen.getByTestId("probe-path").textContent).toBe("/chat");
    window.removeEventListener("qwenpaw:sidebar-switch-done", onDone);
    sessionStorage.removeItem("qwenpaw_pending_new_chat");
  });

  it("collapses into the icon nav and expands back", async () => {
    renderSidebar();
    await waitFor(() => {
      expect(screen.getByText("Workspace")).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    await waitFor(() => {
      // Collapsed nav has no menu labels, only tooltips/buttons
      expect(screen.queryByText("Workspace")).toBeNull();
    });
    expect(screen.getByRole("button", { name: "Workspace" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByTestId("app-brand")).not.toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    await waitFor(() => {
      expect(screen.getByText("Workspace")).toBeTruthy();
    });
    expect(screen.getByTestId("app-brand")).toBeVisible();
  });

  it("restores the main branch sidebar widths on mobile", async () => {
    mockMobileViewport(true);

    renderSidebar();
    const sider = document.querySelector<HTMLElement>(".ant-layout-sider");

    expect(sider).toHaveStyle({
      width: conversationWidth("56px"),
      minWidth: "56px",
    });
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(sider).toHaveStyle({
      width: conversationWidth("240px"),
      minWidth: "240px",
    });
  });

  it("opens session history in a popover while collapsed", async () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    const historyButton = await screen.findByRole("button", {
      name: "chat.chatHistoryTooltip",
    });
    expect(historyButton).not.toHaveAttribute("aria-haspopup");
    expect(historyButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(historyButton);
    expect(historyButton).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(await screen.findByTestId("sl-click"));

    await waitFor(() => {
      expect(screen.getByTestId("probe-path").textContent).toContain(
        "real-s-1",
      );
    });
  });

  it("switches agents from the collapsed popover", async () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    const agentButton = await screen.findByRole("button", {
      name: "agent.selectAgent",
    });
    expect(agentButton).not.toHaveAttribute("aria-haspopup");
    expect(agentButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(agentButton);
    expect(agentButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(await screen.findByRole("button", { name: /Primary/ }));

    expect(mocks.setSelectedAgent).toHaveBeenCalledWith("agent-1");
  });

  it("separates agent selection from the menu header hit area", () => {
    renderSidebar();
    const agent = screen.getByTestId("agent-selector");
    const header = agent.parentElement!.parentElement!;
    const background = header.querySelector<HTMLButtonElement>(
      'button[aria-hidden="true"]',
    )!;
    const toggle =
      header.querySelector<HTMLButtonElement>("button[data-mode]")!;
    const initial = Number(toggle.dataset.mode);
    fireEvent.click(agent);
    expect(Number(toggle.dataset.mode)).toBe(initial);
    fireEvent.click(background);
    expect(Number(toggle.dataset.mode)).toBe((initial + 1) % 3);
    fireEvent.click(toggle);
    expect(Number(toggle.dataset.mode)).toBe((initial + 2) % 3);
  });

  it("keeps external plugin links working while floating", () => {
    mocks.menuItems.push({
      id: "plugin.docs",
      location: "primary.settings",
      label: "Plugin docs",
      href: "https://example.com/plugin-docs",
    });
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    renderSidebar();
    fireEvent.keyDown(
      screen.getByRole("button", {
        name: "Drag sidebar to float; Enter to toggle docking",
      }),
      { key: "Enter" },
    );
    fireEvent.click(screen.getByRole("button", { name: "Plugin docs" }));
    expect(open).toHaveBeenCalledWith(
      "https://example.com/plugin-docs",
      "_blank",
      "noopener,noreferrer",
    );
    expect(
      screen.getByRole("button", { name: "Collapse tools" }),
    ).toHaveAttribute("aria-expanded", "true");
    open.mockRestore();
  });

  it("renders registered plugin shortcuts unless the user hides them", async () => {
    const pluginItem = {
      id: "plugin.cloud.dashboard",
      location: "primary.settings",
      label: "Cloud dashboard",
      route: "plugin.cloud.dashboard",
    };
    mocks.menuItems = [...mocks.menuItems, pluginItem];
    mocks.routes = [
      ...mocks.routes,
      { id: "plugin.cloud.dashboard", path: "/cloud-dashboard" },
    ];

    const view = renderSidebar();
    expect(await screen.findByText("Cloud dashboard")).toBeVisible();

    view.unmount();
    mocks.sidebar.hiddenPluginItemIds = ["plugin.cloud.dashboard"];
    renderSidebar();
    expect(screen.queryByText("Cloud dashboard")).not.toBeInTheDocument();
  });

  it("opens the account modal when auth is enabled and warns on empty update", async () => {
    mocks.authStatus = { enabled: true, mode: "normal" };
    renderSidebar();
    await openAccountModal();
    // Modal form renders; submit with only the current password filled
    fireEvent.change(screen.getByLabelText("account.currentPassword"), {
      target: { value: "current-pw" },
    });
    const submitBtn = screen.getByText("account.save");
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(mocks.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe("authentication navigation", () => {
    const originalLocation = Object.getOwnPropertyDescriptor(
      window,
      "location",
    )!;
    let location: { pathname: string; href: string };

    beforeEach(() => {
      mocks.authStatus = { enabled: true, mode: "normal" };
      vi.mocked(clearAuthToken).mockClear();
      location = { pathname: "/qwenpaw/chat", href: "" };
      Object.defineProperty(window, "location", {
        configurable: true,
        value: location,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, "location", originalLocation);
    });

    it.each([
      ["/chat", "/login"],
      ["/qwenpaw/chat", "/qwenpaw/login"],
    ])(
      "logs out from %s without losing the deployment prefix",
      async (pathname, target) => {
        location.pathname = pathname;
        renderSidebar();
        const username = await screen.findByText("testuser");
        fireEvent.click(username.closest("button")!);
        fireEvent.click(
          await screen.findByRole("button", { name: "login.logout" }),
        );

        expect(clearAuthToken).toHaveBeenCalledOnce();
        expect(location.href).toBe(target);
      },
    );

    it.each([false, true])(
      "preserves the deployment prefix after an account update (Hub: %s)",
      async (hubMode) => {
        renderSidebar({ hubMode });
        await openAccountModal();
        if (!hubMode) {
          fireEvent.change(screen.getByLabelText("account.currentPassword"), {
            target: { value: "current-pw" },
          });
        }
        fireEvent.change(screen.getByLabelText("account.newPassword"), {
          target: { value: "new-password" },
        });
        fireEvent.change(screen.getByLabelText("account.confirmPassword"), {
          target: { value: "new-password" },
        });
        fireEvent.click(screen.getByText("account.save"));

        await waitFor(() => expect(location.href).toBe("/qwenpaw/login"));
        expect(clearAuthToken).toHaveBeenCalledOnce();
        if (hubMode) {
          expect(mocks.changePassword).toHaveBeenCalledWith("new-password");
        } else {
          expect(mocks.updateProfile).toHaveBeenCalledWith(
            "current-pw",
            undefined,
            "new-password",
          );
        }
      },
    );
  });

  it("opens quick settings from the authenticated user area", async () => {
    mocks.authStatus = { enabled: true, mode: "normal" };
    renderSidebar();

    const username = await screen.findByText("testuser");
    fireEvent.click(username.closest("button")!);

    const settingsPanel = await screen.findByTestId("settings-panel");
    expect(settingsPanel.closest(".ant-popover")).not.toHaveClass(
      "ant-popover-hidden",
    );
  });

  it("returns focus to the quick settings trigger on Escape", async () => {
    mocks.renderActualSettingsPanel = true;
    renderSidebar();
    const trigger = await screen.findByRole("button", {
      name: "Settings",
    });
    fireEvent.click(trigger);

    const panel = await screen.findByRole("dialog", { name: "Settings" });
    fireEvent.keyDown(panel, { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("flags a whitespace-only new password", async () => {
    mocks.authStatus = { enabled: true, mode: "normal" };
    renderSidebar();
    await openAccountModal();
    fireEvent.change(screen.getByLabelText("account.currentPassword"), {
      target: { value: "current-pw" },
    });
    fireEvent.change(screen.getByLabelText("account.newPassword"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByText("account.save"));
    // newPassword present but empty → early error, no API call
    await waitFor(() => {
      expect(mocks.updateProfile).not.toHaveBeenCalled();
    });
  });

  it("maps backend errors to localized messages", async () => {
    mocks.authStatus = { enabled: true, mode: "normal" };
    mocks.updateProfile.mockRejectedValue(new Error("password is incorrect"));
    renderSidebar();
    await openAccountModal();
    fireEvent.change(screen.getByLabelText("account.currentPassword"), {
      target: { value: "current-pw" },
    });
    fireEvent.change(screen.getByLabelText("account.newUsername"), {
      target: { value: "new-user" },
    });
    fireEvent.click(screen.getByText("account.save"));
    await waitFor(() => {
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        "current-pw",
        "new-user",
        undefined,
      );
    });
  });

  it("requires a password in hub mode", async () => {
    mocks.authStatus = { enabled: true, mode: "hub" };
    renderSidebar({ hubMode: true });
    await openAccountModal();
    // Hub mode shows the username identity
    await waitFor(() => {
      expect(screen.getAllByText("hubuser").length).toBeGreaterThan(0);
    });
    // Submit with an empty password → passwordRequired warning, no call
    fireEvent.click(screen.getByText("account.save"));
    await waitFor(() => {
      expect(mocks.changePassword).not.toHaveBeenCalled();
    });
  });

  it("reports restart failures in hub mode", async () => {
    mocks.authStatus = { enabled: true, mode: "hub" };
    mocks.restartRuntime.mockRejectedValue(new Error("restart refused"));
    renderSidebar({ hubMode: true });
    await openAccountModal();
    // The restart confirm lives behind a Popconfirm; invoking the handler
    // directly via the rendered button is flaky with antd Popconfirm in
    // jsdom, so assert the modal content is present instead.
    await waitFor(() => {
      expect(screen.getByText("account.runtimeTitle")).toBeTruthy();
    });
  });

  it("lights the inbox badge when there are pending approvals", async () => {
    mocks.approvals = [{ request_id: "req-1" }];
    renderSidebar();
    await waitFor(() => {
      expect(screen.getByText("Workspace")).toBeTruthy();
    });
    // The inbox label is wrapped in a Badge span with a ref callback
    const inboxSpans = screen.getAllByText("Inbox");
    expect(inboxSpans.length).toBeGreaterThan(0);
  });

  it("polls inbox events without starting a second push-message chain", async () => {
    renderSidebar();

    await waitFor(() => {
      expect(mocks.getInboxEvents).toHaveBeenCalledWith({
        unread_only: true,
        limit: 1,
      });
    });
    expect(mocks.getPushMessages).not.toHaveBeenCalled();
  });

  it("slows inbox polling and refreshes when the tab becomes visible", async () => {
    vi.useFakeTimers();
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const view = renderSidebar();
    try {
      await act(() => vi.advanceTimersByTimeAsync(0));
      expect(mocks.getInboxEvents).toHaveBeenCalledTimes(1);

      await act(() => vi.advanceTimersByTimeAsync(14999));
      expect(mocks.getInboxEvents).toHaveBeenCalledTimes(1);
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(mocks.getInboxEvents).toHaveBeenCalledTimes(2);

      hidden.mockReturnValue(true);
      await act(() => vi.advanceTimersByTimeAsync(30000));
      expect(mocks.getInboxEvents).toHaveBeenCalledTimes(2);

      hidden.mockReturnValue(false);
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(mocks.getInboxEvents).toHaveBeenCalledTimes(3);
    } finally {
      view.unmount();
      hidden.mockRestore();
      vi.useRealTimers();
    }
  });

  it.each([
    { collapsed: false, pending: false },
    { collapsed: false, pending: true },
    { collapsed: true, pending: false },
    { collapsed: true, pending: true },
  ])(
    "opens the inbox destination (collapsed=$collapsed, pending=$pending)",
    async ({ collapsed, pending }) => {
      if (collapsed) {
        localStorage.setItem("qwenpaw_sidebar_collapsed", "true");
      }
      mocks.approvals = pending ? [{ request_id: "req-1" }] : [];
      await act(async () => {
        renderSidebar();
      });

      fireEvent.click(screen.getByRole("button", { name: "Inbox" }));

      expect(screen.getByTestId("probe-path").textContent).toBe(
        pending ? "/inbox?tab=approvals" : "/inbox",
      );
    },
  );

  // TC-CON-01 checkpoint 3: the collapsed/expanded state must survive a
  // page reload through localStorage.
  describe("collapsed state persistence", () => {
    function renderedSider() {
      return document.querySelector<HTMLElement>(".ant-layout-sider");
    }

    it("resizes the mounted sidebar by dragging and preserves its width and plugin state", async () => {
      vi.stubGlobal("PointerEvent", ResizePointerEvent);
      try {
        const view = renderSidebar();
        const plugin = screen.getByRole("textbox", {
          name: "Plugin sider.top",
        });
        fireEvent.change(plugin, { target: { value: "Unsaved draft" } });
        const handle = screen.getByRole("separator", {
          name: "Resize sidebar",
        });
        handle.setPointerCapture = vi.fn();
        handle.hasPointerCapture = vi.fn(() => true);
        handle.releasePointerCapture = vi.fn();
        expect(
          fireEvent.pointerDown(handle, {
            pointerId: 7,
            button: 0,
            clientX: 280,
          }),
        ).toBe(true);
        fireEvent.pointerMove(handle, { pointerId: 7, clientX: 360 });
        fireEvent.pointerUp(handle, { pointerId: 7, clientX: 360 });
        expect(renderedSider()).toHaveStyle({
          width: conversationWidth("360px"),
        });
        expect(localStorage.getItem("qwenpaw_sidebar_width")).toBe("360");
        expect(screen.getByRole("textbox", { name: "Plugin sider.top" })).toBe(
          plugin,
        );
        expect(plugin).toHaveValue("Unsaved draft");
        fireEvent.click(
          screen.getByRole("button", { name: "Collapse sidebar" }),
        );
        expect(screen.queryByRole("separator")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
        expect(renderedSider()).toHaveStyle({
          width: conversationWidth("360px"),
        });
        view.unmount();
        renderSidebar();
        expect(renderedSider()).toHaveStyle({
          width: conversationWidth("360px"),
        });
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it.each(["move", "release"])(
      "collapses a narrow sidebar on pointer %s and restores its previous width after reopening",
      (stage) => {
        vi.stubGlobal("PointerEvent", ResizePointerEvent);
        try {
          localStorage.setItem("qwenpaw_sidebar_width", "360");
          const view = renderSidebar();
          expect(
            screen
              .getByRole("button", { name: "Collapse sidebar" })
              .querySelector("svg.lucide-panel-left-close"),
          ).toBeInTheDocument();
          const handle = screen.getByRole("separator", {
            name: "Resize sidebar",
          });
          handle.setPointerCapture = vi.fn();
          handle.hasPointerCapture = vi.fn(() => true);
          handle.releasePointerCapture = vi.fn();
          fireEvent.pointerDown(handle, {
            pointerId: 7,
            button: 0,
            clientX: 360,
          });
          fireEvent.pointerMove(handle, { pointerId: 7, clientX: 200 });
          expect(renderedSider()).toHaveStyle({
            width: conversationWidth("220px"),
          });
          expect(localStorage.getItem("qwenpaw_sidebar_collapsed")).toBeNull();
          if (stage === "move")
            fireEvent.pointerMove(handle, { pointerId: 7, clientX: 160 });
          else fireEvent.pointerUp(handle, { pointerId: 7, clientX: 160 });
          expect(renderedSider()).toHaveStyle({
            width: conversationWidth("72px"),
          });
          expect(handle.releasePointerCapture).toHaveBeenCalledWith(7);
          expect(localStorage.getItem("qwenpaw_sidebar_width")).toBe("360");
          expect(localStorage.getItem("qwenpaw_sidebar_collapsed")).toBe(
            "true",
          );
          view.unmount();
          renderSidebar();
          expect(renderedSider()).toHaveStyle({
            width: conversationWidth("72px"),
          });
          const expand = screen.getByRole("button", { name: "Expand sidebar" });
          expect(
            expand.querySelector("svg.lucide-panel-left-open"),
          ).toBeInTheDocument();
          fireEvent.click(expand);
          expect(renderedSider()).toHaveStyle({
            width: conversationWidth("360px"),
          });
        } finally {
          vi.unstubAllGlobals();
        }
      },
    );

    it("cancels a narrow resize without persisting a collapsed sidebar", () => {
      vi.stubGlobal("PointerEvent", ResizePointerEvent);
      try {
        localStorage.setItem("qwenpaw_sidebar_width", "360");
        renderSidebar();
        const handle = screen.getByRole("separator", {
          name: "Resize sidebar",
        });
        handle.setPointerCapture = vi.fn();
        handle.hasPointerCapture = vi.fn(() => true);
        handle.releasePointerCapture = vi.fn();
        fireEvent.pointerDown(handle, {
          pointerId: 7,
          button: 0,
          clientX: 360,
        });
        fireEvent.pointerMove(handle, { pointerId: 7, clientX: 200 });
        fireEvent.keyDown(window, { key: "Escape" });
        expect(renderedSider()).toHaveStyle({
          width: conversationWidth("360px"),
        });
        expect(localStorage.getItem("qwenpaw_sidebar_width")).toBe("360");
        expect(localStorage.getItem("qwenpaw_sidebar_collapsed")).toBeNull();
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it("supports width limits, keyboard resizing and double-click reset on the mounted sidebar", () => {
      renderSidebar();
      const handle = screen.getByRole("separator", { name: "Resize sidebar" });
      fireEvent.keyDown(handle, { key: "ArrowRight" });
      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("296px"),
      });
      fireEvent.keyDown(handle, { key: "Home" });
      fireEvent.keyDown(handle, { key: "ArrowLeft" });
      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("220px"),
      });
      fireEvent.keyDown(handle, { key: "End" });
      fireEvent.keyDown(handle, { key: "ArrowRight" });
      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("480px"),
      });
      fireEvent.doubleClick(handle);
      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("280px"),
      });
      expect(localStorage.getItem("qwenpaw_sidebar_width")).toBeNull();
    });

    it("preserves the custom desktop width through the mobile overlay", async () => {
      localStorage.setItem("qwenpaw_sidebar_width", "360");
      mockMobileViewport(true);
      renderSidebar();
      expect(renderedSider()).toHaveStyle({ width: conversationWidth("56px") });
      fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("240px"),
      });
      expect(screen.queryByRole("separator")).not.toBeInTheDocument();
      resizeViewport(false);
      await waitFor(() =>
        expect(renderedSider()).toHaveStyle({
          width: conversationWidth("360px"),
        }),
      );
      expect(localStorage.getItem("qwenpaw_sidebar_width")).toBe("360");
    });

    it("restores the collapsed state after a reload", async () => {
      const view = renderSidebar();
      await waitFor(() => {
        expect(screen.getByText("Workspace")).toBeTruthy();
      });

      fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
      await waitFor(() => {
        expect(screen.queryByText("Workspace")).toBeNull();
      });
      expect(localStorage.getItem("qwenpaw_sidebar_collapsed")).toBe("true");
      view.unmount();

      // Remount simulates the reload: it must start collapsed (72px).
      renderSidebar();
      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("72px"),
        minWidth: "72px",
      });
      expect(screen.queryByText("Workspace")).toBeNull();
      expect(screen.getByTestId("app-brand")).not.toBeVisible();
    });

    it("restores the expanded state after a reload", async () => {
      localStorage.setItem("qwenpaw_sidebar_collapsed", "true");
      const view = renderSidebar();
      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("72px"),
        minWidth: "72px",
      });

      fireEvent.click(
        await screen.findByRole("button", { name: "Expand sidebar" }),
      );
      await waitFor(() => {
        expect(screen.getByText("Workspace")).toBeTruthy();
      });
      expect(localStorage.getItem("qwenpaw_sidebar_collapsed")).toBeNull();
      view.unmount();

      // Remount simulates the reload: it must start expanded (280px).
      renderSidebar();
      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("280px"),
        minWidth: "280px",
      });
      expect(screen.getByText("Workspace")).toBeTruthy();
    });

    it("keeps the mobile collapse transient so desktop is not pinned", async () => {
      mockMobileViewport(true);
      renderSidebar();

      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("56px"),
        minWidth: "56px",
      });
      // A viewport-driven collapse must not write the user preference.
      expect(localStorage.getItem("qwenpaw_sidebar_collapsed")).toBeNull();
    });

    it("does not override the stored preference on mobile", async () => {
      localStorage.setItem("qwenpaw_sidebar_collapsed", "true");
      mockMobileViewport(true);
      renderSidebar();

      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("56px"),
        minWidth: "56px",
      });
      expect(localStorage.getItem("qwenpaw_sidebar_collapsed")).toBe("true");
    });

    it("restores the stored collapsed preference when back on desktop", async () => {
      localStorage.setItem("qwenpaw_sidebar_collapsed", "true");
      renderSidebar();
      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("72px"),
        minWidth: "72px",
      });

      resizeViewport(true);
      await waitFor(() => {
        expect(renderedSider()).toHaveStyle({
          width: conversationWidth("56px"),
          minWidth: "56px",
        });
      });

      resizeViewport(false);
      await waitFor(() => {
        expect(renderedSider()).toHaveStyle({
          width: conversationWidth("72px"),
          minWidth: "72px",
        });
      });
    });

    it("re-expands on desktop when no collapsed preference is stored", async () => {
      renderSidebar();
      expect(renderedSider()).toHaveStyle({
        width: conversationWidth("280px"),
        minWidth: "280px",
      });

      resizeViewport(true);
      await waitFor(() => {
        expect(renderedSider()).toHaveStyle({
          width: conversationWidth("56px"),
          minWidth: "56px",
        });
      });
      // The viewport override must stay transient.
      expect(localStorage.getItem("qwenpaw_sidebar_collapsed")).toBeNull();

      resizeViewport(false);
      await waitFor(() => {
        expect(renderedSider()).toHaveStyle({
          width: conversationWidth("280px"),
          minWidth: "280px",
        });
      });
    });
  });
});
