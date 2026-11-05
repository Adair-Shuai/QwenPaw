import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  purgeAppState,
  purgePluginAppState,
  removePluginAppState,
  purgeAgentSpace,
} from "./osCleanup";
import { useOsWindows } from "./osWindowStore";
import { useOsIcons } from "./osIconStore";
import { useOsRoute } from "./osRouteStore";
import { useOsDock } from "./osDockStore";
import { routeRegistry } from "../plugins/registry/store";
import {
  loadPawApp,
  resetPawAppLoaderForTests,
} from "../plugins/usePluginLoader";
import type { Disposable } from "../plugins/registry/types";

let disposables: Disposable[] = [];

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", {
    value: 1920,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: 1080,
    configurable: true,
    writable: true,
  });
  useOsWindows.setState({
    windows: {},
    order: [],
    activeId: null,
    zCounter: 100,
    launcherOpen: false,
    spaceId: "default",
    saved: {},
    missionControlOpen: false,
  });
  useOsIcons.setState({ positions: {} });
  useOsRoute.setState({ targets: {} });
  useOsDock.setState({ pinned: ["core.chat", "core.inbox", "os.store"] });
});

afterEach(() => {
  for (const d of disposables) d.dispose();
  disposables = [];
});

const w = () => useOsWindows.getState();

describe("osCleanup (transactional)", () => {
  it("purgeAppState removes windows, icons and deep-links for the ids only", () => {
    w().open("core.chat");
    w().open("gone.app");
    useOsIcons.getState().setPosition("gone.app", 10, 10);
    useOsIcons.getState().setPosition("core.chat", 20, 20);
    useOsDock.getState().pin("gone.app");
    useOsRoute.setState({
      targets: {
        "gone.app": { path: "/x", nonce: 1 },
        "core.chat": { path: "/chat", nonce: 1 },
      },
    });

    purgeAppState(["gone.app"]);

    expect(w().windows["gone.app"]).toBeUndefined();
    expect(w().order).toEqual(["core.chat"]);
    expect(useOsIcons.getState().positions).toEqual({
      "core.chat": { x: 20, y: 20 },
    });
    expect(useOsRoute.getState().targets["gone.app"]).toBeUndefined();
    expect(useOsRoute.getState().targets["core.chat"]).toBeDefined();
    expect(useOsDock.getState().pinned).toEqual([
      "core.chat",
      "core.inbox",
      "os.store",
    ]);
  });

  it("purgePluginAppState maps a confirmed source to its bundle app", () => {
    disposables.push(
      routeRegistry.add("office", {
        id: "plugin.office",
        path: "/apps/office",
        component: () => null,
      }),
    );
    w().open("plugin.office");
    w().open("core.chat");

    purgePluginAppState("office");

    expect(w().windows["plugin.office"]).toBeUndefined();
    expect(w().order).toEqual(["core.chat"]);
  });

  it("removePluginAppState also removes the live PawApp route", async () => {
    routeRegistry.add("office", {
      id: "plugin.office",
      path: "/apps/office",
      component: () => null,
    });
    w().open("plugin.office");

    await removePluginAppState("office");

    expect(w().windows["plugin.office"]).toBeUndefined();
    expect(
      routeRegistry.snapshot().some((route) => route.source === "office"),
    ).toBe(false);
  });

  it("purgeAgentSpace drops only the deleted agent's space", () => {
    w().open("core.chat");
    w().switchSpace("agent-b"); // saves default
    w().open("core.inbox");
    w().switchSpace("agent-c"); // saves agent-b

    purgeAgentSpace("agent-b");

    expect(w().saved["agent-b"]).toBeUndefined();
    expect(w().saved["default"]).toBeDefined();
  });

  it("state survives when nothing is confirmed removed", () => {
    // Regression guard for the snapshot-based lifecycle this replaced:
    // a window for an app that is temporarily missing from the registry
    // (partial plugin load failure, cached/failed agent list) must stay
    // untouched until an explicit purge for it arrives.
    w().open("not.in.registry");
    w().switchSpace("agent-b");

    purgeAppState([]); // e.g. an uninstall of a source with no apps
    purgePluginAppState("unknown-source");

    expect(w().saved["default"].windows["not.in.registry"]).toBeDefined();
  });
  it("awaits an in-flight bundle and removes its late route and desktop state", async () => {
    resetPawAppLoaderForTests();
    let release!: (response: Response) => void;
    const runtime = globalThis as typeof globalThis & {
      __lateOffice?: () => void;
    };
    const create = URL.createObjectURL;
    const revoke = URL.revokeObjectURL;
    runtime.__lateOffice = () => {
      routeRegistry.add("late-office", {
        id: "late-office.page",
        path: "/apps/late-office",
        component: () => null,
      });
      w().open("late-office.page");
      useOsDock.getState().pin("late-office.page");
    };
    URL.createObjectURL = () =>
      `data:text/javascript,${encodeURIComponent("globalThis.__lateOffice()")}`;
    URL.revokeObjectURL = vi.fn();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: "late-office",
              plugin_type: "app",
              frontend_entry: "index.js",
            },
          ]),
        ),
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          release = resolve;
        }),
      );
    try {
      const loading = loadPawApp("late-office");
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      const removing = removePluginAppState("late-office");
      release(new Response("bundle"));
      await Promise.all([loading, removing]);
      expect(
        routeRegistry
          .snapshot()
          .some((route) => route.source === "late-office"),
      ).toBe(false);
      expect(w().windows["late-office.page"]).toBeUndefined();
      expect(useOsDock.getState().pinned).not.toContain("late-office.page");
    } finally {
      fetchMock.mockRestore();
      URL.createObjectURL = create;
      URL.revokeObjectURL = revoke;
      delete runtime.__lateOffice;
    }
  });
});
