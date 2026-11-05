// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { menuRegistry, slotRegistry, routeRegistry } from "./registry/store";
import {
  loadAllPlugins,
  loadPawApp,
  reloadPawApp,
  unloadFrontendPlugin,
  resetPawAppLoaderForTests,
} from "./usePluginLoader";

const originalCreateObjectUrl = URL.createObjectURL;
const originalRevokeObjectUrl = URL.revokeObjectURL;

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function plugin(id: string, type: string) {
  return {
    id,
    name: id,
    plugin_type: type,
    frontend_entry: "dist/index.js",
  };
}

describe("frontend plugin loader", () => {
  beforeEach(() => {
    resetPawAppLoaderForTests();
    routeRegistry.__resetForTests();
    menuRegistry.__resetForTests();
    slotRegistry.__resetForTests();
    vi.restoreAllMocks();
    URL.createObjectURL = vi.fn(
      () => `data:text/javascript,${encodeURIComponent("export default true")}`,
    );
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectUrl;
    URL.revokeObjectURL = originalRevokeObjectUrl;
    delete (globalThis as typeof globalThis & { __registerNotes?: () => void })
      .__registerNotes;
  });

  it("loads every installed frontend plugin during startup", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse([
          plugin("global-tools", "frontend"),
          plugin("notes", "app"),
        ]),
      )
      .mockImplementation(async () => new Response("export default true"));

    await expect(loadAllPlugins()).resolves.toEqual({
      loaded: 2,
      failed: [],
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("prefetches plugin scripts while host setup is pending", async () => {
    let releaseHost!: () => void;
    const hostReady = new Promise<void>((resolve) => {
      releaseHost = resolve;
    });
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockResolvedValueOnce(jsonResponse([plugin("notes", "app")]))
      .mockResolvedValueOnce(new Response("export default true"));

    const loading = loadAllPlugins(hostReady);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    let completed = false;
    void loading.then(() => {
      completed = true;
    });
    expect(completed).toBe(false);

    releaseHost();
    await expect(loading).resolves.toEqual({ loaded: 1, failed: [] });
    expect(completed).toBe(true);
  });

  it("removes frontend registrations when a plugin is disabled or removed", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockResolvedValueOnce(jsonResponse([plugin("notes", "app")]))
      .mockResolvedValueOnce(new Response("export default true"))
      .mockResolvedValueOnce(jsonResponse([]));

    await loadAllPlugins();
    routeRegistry.add("notes", {
      id: "notes.page",
      path: "/apps/notes",
      component: () => null,
    });
    expect(routeRegistry.snapshot()).toHaveLength(1);

    await expect(loadAllPlugins()).resolves.toEqual({ loaded: 0, failed: [] });
    expect(routeRegistry.snapshot()).toHaveLength(0);
  });

  it("does not hot-load a disabled PawApp", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([{ ...plugin("notes", "app"), enabled: false }]),
    );

    await expect(loadPawApp("notes")).rejects.toThrow(
      "PawApp frontend plugin not found",
    );
  });

  it("loads a newly installed PawApp and exposes its route immediately", async () => {
    const runtimeGlobal = globalThis as typeof globalThis & {
      __registerNotes?: () => void;
    };
    runtimeGlobal.__registerNotes = () => {
      routeRegistry.add("notes", {
        id: "notes.page",
        path: "/apps/notes",
        component: () => null,
      });
    };
    URL.createObjectURL = vi.fn(
      () =>
        `data:text/javascript,${encodeURIComponent(
          "globalThis.__registerNotes()",
        )}`,
    );
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockResolvedValueOnce(jsonResponse([plugin("notes", "app")]))
      .mockResolvedValueOnce(new Response("globalThis.__registerNotes()"));

    await expect(loadPawApp("notes")).resolves.toBeUndefined();
    expect(routeRegistry.snapshot()).toMatchObject([
      { id: "notes.page", path: "/apps/notes", source: "notes" },
    ]);
  });

  it("deduplicates concurrent loads and allows retry after failure", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockResolvedValueOnce(jsonResponse([plugin("notes", "app")]))
      .mockResolvedValueOnce(new Response("missing", { status: 503 }));

    const first = loadPawApp("notes");
    expect(loadPawApp("notes")).toBe(first);
    await expect(first).rejects.toThrow("HTTP 503");

    fetchMock
      .mockResolvedValueOnce(jsonResponse([plugin("notes", "app")]))
      .mockImplementationOnce(async () => {
        routeRegistry.add("notes", {
          id: "notes.page",
          path: "/apps/notes",
          component: () => null,
        });
        return new Response("export default true");
      });

    await expect(loadPawApp("notes")).resolves.toBeUndefined();
  });

  it("force reloads an already registered PawApp route", async () => {
    const oldComponent = () => null;
    const newComponent = () => null;
    routeRegistry.add("notes", {
      id: "notes.page",
      path: "/apps/notes",
      component: oldComponent,
    });
    const runtimeGlobal = globalThis as typeof globalThis & {
      __registerUpdatedNotes?: () => void;
    };
    runtimeGlobal.__registerUpdatedNotes = () => {
      routeRegistry.add("notes", {
        id: "notes.page",
        path: "/apps/notes",
        component: newComponent,
      });
    };
    URL.createObjectURL = vi.fn(
      () =>
        `data:text/javascript,${encodeURIComponent(
          "globalThis.__registerUpdatedNotes()",
        )}`,
    );
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockResolvedValueOnce(jsonResponse([plugin("notes", "app")]))
      .mockResolvedValueOnce(new Response("updated"));

    await expect(reloadPawApp("notes")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(routeRegistry.snapshot()[0].Component).toBe(newComponent);
    expect(routeRegistry.snapshot()[0].Component).not.toBe(oldComponent);
  });
  it("cleans partial registrations after evaluation failure without executing fallback", async () => {
    let executions = 0;
    const runtime = globalThis as typeof globalThis & {
      __partialPlugin?: () => void;
    };
    runtime.__partialPlugin = () => {
      executions += 1;
      routeRegistry.add("broken", {
        id: "broken.page",
        path: "/apps/broken",
        component: () => null,
      });
      menuRegistry.add("broken", { id: "broken.menu", label: "Broken" });
      slotRegistry.fill("broken", "header.left", () => null);
      throw new Error("registration failed midway");
    };
    URL.createObjectURL = vi.fn(
      () =>
        `data:text/javascript,${encodeURIComponent(
          "globalThis.__partialPlugin()",
        )}`,
    );
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (url) =>
        String(url).endsWith("/frontend_plugin")
          ? jsonResponse([plugin("broken", "app")])
          : new Response("bundle"),
      );
    try {
      const summary = await loadAllPlugins();
      expect(summary.failed).toEqual([
        expect.stringContaining("registration failed midway"),
      ]);
      expect(summary.loaded).toBe(0);
      expect(executions).toBe(1);
      expect(menuRegistry.snapshot()).toEqual([]);
      expect(slotRegistry.snapshot("header.left")).toEqual([]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(routeRegistry.snapshot()).toEqual([]);
      runtime.__partialPlugin = () => {
        executions += 1;
        routeRegistry.add("broken", {
          id: "broken.page",
          path: "/apps/broken",
          component: () => null,
        });
      };
      URL.createObjectURL = vi.fn(
        () =>
          `data:text/javascript,${encodeURIComponent(
            "globalThis.__partialPlugin(); // retry",
          )}`,
      );
      await expect(loadPawApp("broken")).resolves.toBeUndefined();
      expect(routeRegistry.snapshot()).toHaveLength(1);
      expect(executions).toBe(2);
    } finally {
      delete runtime.__partialPlugin;
    }
  });

  it("serializes startup and deduplicates concurrent forced reloads", async () => {
    let executions = 0;
    let ready!: () => void;
    const hostReady = new Promise<void>((resolve) => {
      ready = resolve;
    });
    const runtime = globalThis as typeof globalThis & {
      __queuedPlugin?: () => void;
    };
    runtime.__queuedPlugin = () => {
      executions += 1;
      routeRegistry.add("notes", {
        id: "notes.page",
        path: "/apps/notes",
        component: () => null,
      });
    };
    let blob = 0;
    URL.createObjectURL = vi.fn(
      () =>
        `data:text/javascript,${encodeURIComponent(
          `globalThis.__queuedPlugin(); // ${++blob}`,
        )}`,
    );
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) =>
      String(url).endsWith("/frontend_plugin")
        ? jsonResponse([plugin("notes", "app")])
        : new Response("bundle"),
    );
    try {
      const startup = loadAllPlugins(hostReady);
      await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
      const first = reloadPawApp("notes");
      expect(reloadPawApp("notes")).toBe(first);
      expect(executions).toBe(0);
      ready();
      await Promise.all([startup, first]);
      expect(executions).toBe(2);
      expect(routeRegistry.snapshot()).toHaveLength(1);
      await loadPawApp("notes");
      expect(executions).toBe(2);
    } finally {
      delete runtime.__queuedPlugin;
    }
  });

  it("removes a disabled plugin after an in-flight startup and rejects stale manifests", async () => {
    let ready!: () => void;
    const hostReady = new Promise<void>((resolve) => {
      ready = resolve;
    });
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockResolvedValueOnce(jsonResponse([plugin("notes", "app")]))
      .mockResolvedValueOnce(new Response("bundle"))
      .mockResolvedValueOnce(jsonResponse([]));
    const old = loadAllPlugins(hostReady);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const latest = loadAllPlugins();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    ready();
    await Promise.all([old, latest]);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(routeRegistry.snapshot()).toEqual([]);
  });
  it("does not remove a newly loaded app when an older manifest arrives late", async () => {
    let oldManifest!: (response: Response) => void;
    const runtime = globalThis as typeof globalThis & {
      __freshApp?: () => void;
    };
    runtime.__freshApp = () =>
      routeRegistry.add("notes", {
        id: "notes.page",
        path: "/apps/notes",
        component: () => null,
      });
    URL.createObjectURL = vi.fn(
      () =>
        `data:text/javascript,${encodeURIComponent("globalThis.__freshApp()")}`,
    );
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockReturnValueOnce(
        new Promise((resolve) => {
          oldManifest = resolve;
        }),
      )
      .mockResolvedValueOnce(jsonResponse([plugin("notes", "app")]))
      .mockResolvedValueOnce(new Response("bundle"));
    try {
      const startup = loadAllPlugins();
      await loadPawApp("notes");
      oldManifest(jsonResponse([]));
      await startup;
      expect(routeRegistry.snapshot()).toHaveLength(1);
    } finally {
      delete runtime.__freshApp;
    }
  });
  it("preserves a new load requested after an intervening unload", async () => {
    let release!: (response: Response) => void;
    const runtime = globalThis as typeof globalThis & {
      __lifecycleApp?: () => void;
    };
    let executions = 0;
    runtime.__lifecycleApp = () => {
      executions += 1;
      routeRegistry.add("notes", {
        id: "notes.page",
        path: "/apps/notes",
        component: () => null,
      });
    };
    let blob = 0;
    URL.createObjectURL = vi.fn(
      () =>
        `data:text/javascript,${encodeURIComponent(
          `globalThis.__lifecycleApp(); // ${++blob}`,
        )}`,
    );
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValueOnce(
        new Promise((resolve) => {
          release = resolve;
        }),
      )
      .mockImplementation(async (url) =>
        String(url).endsWith("/frontend_plugin")
          ? jsonResponse([plugin("notes", "app")])
          : new Response("bundle"),
      );
    try {
      const initial = loadPawApp("notes");
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      const removal = unloadFrontendPlugin("notes");
      const latest = loadPawApp("notes");
      expect(latest).not.toBe(initial);
      release(jsonResponse([plugin("notes", "app")]));
      await Promise.all([initial, removal, latest]);
      expect(executions).toBe(2);
      expect(routeRegistry.snapshot()).toMatchObject([
        { source: "notes", path: "/apps/notes" },
      ]);
    } finally {
      delete runtime.__lifecycleApp;
    }
  });
});
