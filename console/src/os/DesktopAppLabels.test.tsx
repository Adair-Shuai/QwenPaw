import fs from "node:fs";
import path from "node:path";
import { App } from "antd";
import { I18nextProvider } from "react-i18next";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n, { i18nReady } from "../i18n";
import { installHostExternals } from "../plugins/hostExternals";
import { menuRegistry, routeRegistry } from "../plugins/registry/store";
import { useAgentStore } from "../stores/agentStore";
import DesktopOS from "./DesktopOS";
import { useOsDock } from "./osDockStore";
import { useOsWindows } from "./osWindowStore";

// Keep the desktop, registries, launcher, Dock and window chrome real; only
// isolate background services and app authentication from a running backend.
vi.mock("./DesktopPollingServices", () => ({ default: () => null }));
vi.mock("../stores/useSyncCodingMode", () => ({ useSyncCodingMode: () => {} }));
vi.mock("../plugins/pawapp-sdk/browserSession", () => ({
  prepareBrowserSession: async () => null,
}));

let previousLanguage: string;
const refreshAgents = useAgentStore.getState().refreshAgents;

beforeEach(async () => {
  await i18nReady;
  previousLanguage = i18n.language;
  await i18n.changeLanguage("zh");
  Reflect.deleteProperty(window, "QwenPaw");
  routeRegistry.__resetForTests();
  menuRegistry.__resetForTests();
  installHostExternals();
  useAgentStore.setState({
    selectedAgent: "default",
    agents: [],
    refreshAgents: vi.fn().mockResolvedValue(undefined),
  });
  useOsWindows.setState({
    windows: {},
    order: [],
    activeId: null,
    zCounter: 100,
    launcherOpen: false,
    missionControlOpen: false,
    spaceId: "default",
    saved: {},
  });
  useOsDock.setState({ pinned: [] });
  window.sessionStorage.setItem("qwenpaw.os.booted", "1");
});

afterEach(async () => {
  cleanup();
  routeRegistry.__resetForTests();
  menuRegistry.__resetForTests();
  useAgentStore.setState({ refreshAgents });
  Reflect.deleteProperty(window, "QwenPaw");
  await i18n.changeLanguage(previousLanguage);
});

function desktop() {
  return render(
    <I18nextProvider i18n={i18n}>
      <App>
        <DesktopOS />
      </App>
    </I18nextProvider>,
  );
}

function expectOpenAppName(name: string) {
  const frame = screen.getByRole("group", { name });
  expect(within(frame).getByTitle(name)).toHaveTextContent(name);
  const dock = document.querySelector<HTMLElement>("[data-os-dock-dropzone]")!;
  expect(within(dock).getByRole("button", { name })).toBeInTheDocument();
  // Desktop icon, window title and active app in the menu bar all agree.
  expect(screen.getAllByText(name).length).toBeGreaterThanOrEqual(3);
  return frame;
}

describe("desktop application labels", () => {
  it("keeps the published document forms Chinese name across desktop surfaces without a sidebar menu", async () => {
    window.QwenPaw.host.fetch = vi.fn(async () => new Response("[]"));
    new Function(
      "window",
      "URL",
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "../plugins/apps/document-forms/ui/index.js",
        ),
        "utf8",
      ),
    )(window, URL);
    const route = routeRegistry
      .snapshot()
      .find((r) => r.source === "document-forms")!;
    expect(route).toBeDefined();
    expect(menuRegistry.snapshot().some((m) => m.route === route.id)).toBe(
      false,
    );
    desktop();
    fireEvent.doubleClick(screen.getByTitle("外协助手"));
    await screen.findByRole("group", { name: "外协助手" });
    expectOpenAppName("外协助手");
    expect(screen.queryByText("Document Forms")).not.toBeInTheDocument();
    act(() => useOsWindows.getState().setLauncher(true));
    const launcher = screen.getByRole("dialog");
    fireEvent.change(within(launcher).getByRole("textbox"), {
      target: { value: "外协" },
    });
    expect(
      within(launcher).getByRole("button", { name: "外协助手" }),
    ).toBeInTheDocument();
  });

  it("updates localized route names and launcher search without remounting an open app", async () => {
    window.QwenPaw.registerRoutes!("localized-app", [
      {
        path: "/apps/localized-app",
        label: (locale) =>
          locale.startsWith("zh") ? "科研工作台" : "Research Desk",
        title: "Separate page title",
        component: () => <input aria-label="app draft" defaultValue="" />,
      },
    ]);
    desktop();
    fireEvent.doubleClick(screen.getByTitle("科研工作台"));
    const frame = expectOpenAppName("科研工作台");
    const draft = await screen.findByRole("textbox", { name: "app draft" });
    fireEvent.change(draft, { target: { value: "保留草稿" } });
    const routes = routeRegistry.snapshot();
    await act(() => i18n.changeLanguage("en"));
    expect(expectOpenAppName("Research Desk")).toBe(frame);
    expect(screen.getByRole("textbox", { name: "app draft" })).toBe(draft);
    expect(draft).toHaveValue("保留草稿");
    expect(routeRegistry.snapshot()).toBe(routes);
    act(() => useOsWindows.getState().setLauncher(true));
    const launcher = screen.getByRole("dialog");
    const search = within(launcher).getByRole("textbox");
    fireEvent.change(search, { target: { value: "科研" } });
    expect(
      within(launcher).queryByRole("button", { name: "Research Desk" }),
    ).not.toBeInTheDocument();
    await act(() => i18n.changeLanguage("zh"));
    expect(
      within(launcher).getByRole("button", { name: "科研工作台" }),
    ).toBeInTheDocument();
    expect(expectOpenAppName("科研工作台")).toBe(frame);
  });

  it("keeps live menu callback names and unnamed plugin fallbacks on the real desktop", async () => {
    window.QwenPaw.route!.add("run-center", {
      id: "run-center.main",
      path: "/apps/run-center",
      component: () => <div>app</div>,
    });
    window.QwenPaw.menu!.add("run-center", {
      id: "run-center.menu",
      location: "primary.agentScoped",
      route: "run-center.main",
      label: () => (
        <span>
          {i18n.resolvedLanguage?.startsWith("zh") ? "运行中心" : "Run Center"}
        </span>
      ),
    });
    window.QwenPaw.route!.add("no-label", {
      id: "no-label.main",
      path: "/apps/no-label",
      component: () => null,
    });
    desktop();
    expect(screen.getByTitle("No Label")).toBeInTheDocument();
    fireEvent.doubleClick(screen.getByTitle("运行中心"));
    expectOpenAppName("运行中心");
    await act(() => i18n.changeLanguage("en"));
    expectOpenAppName("Run Center");
    act(() => useOsWindows.getState().setMissionControl(true));
    expect(screen.getAllByText("Run Center").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByTitle("No Label")).toBeInTheDocument();
  });
});
