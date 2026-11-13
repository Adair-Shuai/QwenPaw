// @vitest-environment jsdom
import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PluginProvider, usePlugins } from "./PluginContext";
import { usePluginUpdateSync } from "./usePluginUpdateSync";
import { resetPawAppLoaderForTests } from "./usePluginLoader";
import { menuRegistry, routeRegistry, slotRegistry } from "./registry/store";

vi.mock("./hostSdk/install", () => ({ installHostSdk: vi.fn() }));
vi.mock("../components/Chat/ToolCards/registerBuiltinCards", () => ({
  registerBuiltinCards: vi.fn(),
}));
vi.mock("../tauri/uiVerification", () => ({
  reportPluginUiVerification: vi.fn(),
}));

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
let version: string;
let enabled: boolean;
let online: boolean;
let executions: string[];
type TestGlobal = typeof globalThis & {
  __registerAutomaticApp?: (version: string) => void;
};

function ActiveApplication() {
  const { pluginRoutes } = usePlugins();
  const View = pluginRoutes[0]?.component;
  return View ? <View /> : <span>应用未加载</span>;
}

describe("background plugin UI synchronization", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
    resetPawAppLoaderForTests();
    routeRegistry.__resetForTests();
    menuRegistry.__resetForTests();
    slotRegistry.__resetForTests();
    version = "1.0.0";
    enabled = true;
    online = true;
    executions = [];
    (globalThis as TestGlobal).__registerAutomaticApp = (loadedVersion) => {
      executions.push(loadedVersion);
      routeRegistry.add("live-app", {
        id: "live-app.page",
        path: "/apps/live-app",
        component: () => <div>应用版本 {loadedVersion}</div>,
      });
      menuRegistry.add("live-app", {
        id: "live-app.menu",
        label: loadedVersion,
      });
    };
    URL.createObjectURL = vi.fn(
      () =>
        `data:text/javascript,${encodeURIComponent(
          `globalThis.__registerAutomaticApp(${JSON.stringify(
            version,
          )}); // ${Math.random()}`,
        )}`,
    );
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (!online) throw new Error("offline");
      const url = String(input);
      if (url.endsWith("/frontend_plugin")) {
        return Response.json(
          enabled
            ? [
                {
                  id: "live-app",
                  name: "Live",
                  version,
                  frontend_revision: version,
                  plugin_type: "app",
                  frontend_entry: "index.js",
                },
              ]
            : [],
        );
      }
      if (url.includes("/bundled/status"))
        return Response.json({ state: "ready", loaded_count: 1 });
      return new Response("export default true");
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    delete (globalThis as TestGlobal).__registerAutomaticApp;
  });

  it("loads background app updates through the mounted provider without restarting the page", async () => {
    render(
      <PluginProvider>
        <ActiveApplication />
      </PluginProvider>,
    );
    await vi.waitFor(() =>
      expect(screen.getByText("应用版本 1.0.0")).toBeInTheDocument(),
    );
    version = "2.0.0";
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    await vi.waitFor(() =>
      expect(screen.getByText("应用版本 2.0.0")).toBeInTheDocument(),
    );
    expect(routeRegistry.snapshot()).toHaveLength(1);
    expect(menuRegistry.snapshot()).toHaveLength(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(executions).toEqual(["1.0.0", "2.0.0"]);
  });

  it("keeps the current app during network failure and synchronizes after reconnect", async () => {
    render(
      <PluginProvider>
        <ActiveApplication />
      </PluginProvider>,
    );
    await vi.waitFor(() =>
      expect(screen.getByText("应用版本 1.0.0")).toBeInTheDocument(),
    );
    online = false;
    version = "2.0.0";
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    expect(screen.getByText("应用版本 1.0.0")).toBeInTheDocument();
    online = true;
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    await vi.waitFor(() =>
      expect(screen.getByText("应用版本 2.0.0")).toBeInTheDocument(),
    );
    enabled = false;
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    await vi.waitFor(() =>
      expect(screen.getByText("应用未加载")).toBeInTheDocument(),
    );
    expect(routeRegistry.snapshot()).toHaveLength(0);
    expect(menuRegistry.snapshot()).toHaveLength(0);
  });

  it("waits for initial readiness and releases polling on unmount", async () => {
    const { rerender, unmount } = renderHook(
      ({ ready }) => usePluginUpdateSync(ready),
      { initialProps: { ready: false } },
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(fetch).not.toHaveBeenCalled();
    rerender({ ready: true });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    await vi.waitFor(() => expect(executions).toEqual(["1.0.0"]));
    unmount();
    vi.mocked(fetch).mockClear();
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("online"));
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
