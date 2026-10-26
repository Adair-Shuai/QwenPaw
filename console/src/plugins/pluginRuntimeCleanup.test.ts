// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { installHostExternals, pluginSystem } from "./hostExternals";
import { removePluginRuntime } from "./pluginRuntimeCleanup";
import { chatExtensions } from "./registry/chatExtensions";
import { menuRegistry, routeRegistry, slotRegistry } from "./registry/store";
import { marketplaceExtensionRegistry } from "../pages/Market/marketplaceRegistry";

const PLUGIN_ID = "cleanup-test";

beforeEach(() => {
  installHostExternals();
  removePluginRuntime(PLUGIN_ID);
  menuRegistry.__resetForTests();
  routeRegistry.__resetForTests();
  slotRegistry.__resetForTests();
  chatExtensions.__resetForTests();
  marketplaceExtensionRegistry.removeBySource(PLUGIN_ID);
});

function registerEverySurface(): void {
  menuRegistry.add(PLUGIN_ID, { id: "plugin.menu", label: "Plugin" });
  routeRegistry.add(PLUGIN_ID, {
    id: "plugin.route",
    path: "/plugin",
    component: () => null,
  });
  slotRegistry.fill(PLUGIN_ID, "header.left", () => null);
  pluginSystem.addRoutes(PLUGIN_ID, [
    { path: "/legacy", component: () => null, label: "Legacy" },
  ]);
  chatExtensions.setScalar(PLUGIN_ID, "sender.placeholder", "Plugin input");
  marketplaceExtensionRegistry.add(PLUGIN_ID, {
    id: "plugin.marketplace",
    label: "Plugin Market",
    component: () => null,
  });
}

function expectPluginRegistrationCount(expected: number): void {
  expect(
    menuRegistry.snapshot().filter((item) => item.id === "plugin.menu"),
  ).toHaveLength(expected);
  expect(
    routeRegistry.snapshot().filter((route) => route.source === PLUGIN_ID),
  ).toHaveLength(expected);
  expect(
    slotRegistry.snapshotAll().filter((slot) => slot.source === PLUGIN_ID),
  ).toHaveLength(expected);
  expect(
    pluginSystem.getRoutes().filter((route) => route.path === "/legacy"),
  ).toHaveLength(expected);
  const chatPluginId =
    chatExtensions.getScalarSnapshot()["sender.placeholder"]?.pluginId;
  if (expected === 1) expect(chatPluginId).toBe(PLUGIN_ID);
  else expect(chatPluginId).toBeUndefined();
  if (expected === 1) {
    expect(
      marketplaceExtensionRegistry.get("plugin.marketplace"),
    ).toBeDefined();
  } else {
    expect(
      marketplaceExtensionRegistry.get("plugin.marketplace"),
    ).toBeUndefined();
  }
}

describe("plugin runtime cleanup", () => {
  it("removes all host-managed registrations", () => {
    registerEverySurface();

    removePluginRuntime(PLUGIN_ID);

    expectPluginRegistrationCount(0);
  });

  it("revokes the shared OpenUI renderer when its owner is removed", () => {
    const namespace = window.QwenPaw as typeof window.QwenPaw & {
      openui?: { dispose: () => void; TaskLayout: () => null };
    };
    const dispose = vi.fn();
    const changed = vi.fn();
    namespace.openui = { dispose, TaskLayout: () => null };
    window.addEventListener("qwenpaw:openui-task-layout-ready", changed);
    try {
      removePluginRuntime(PLUGIN_ID);
      expect(namespace.openui).toBeDefined();
      expect(dispose).not.toHaveBeenCalled();
      removePluginRuntime("qwenpaw-openui");
      expect(dispose).toHaveBeenCalledOnce();
      expect(namespace.openui).toBeUndefined();
      expect(changed).toHaveBeenCalledOnce();
      removePluginRuntime("qwenpaw-openui");
      expect(dispose).toHaveBeenCalledOnce();
    } finally {
      delete namespace.openui;
      window.removeEventListener("qwenpaw:openui-task-layout-ready", changed);
    }
  });

  it("still removes registrations and stale OpenUI capability after a cleanup error", () => {
    const namespace = window.QwenPaw as typeof window.QwenPaw & {
      openui?: { dispose: () => void };
    };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    namespace.openui = { dispose: () => { throw new Error("fixture cleanup failure"); } };
    routeRegistry.add("qwenpaw-openui", { id: "openui.fixture", path: "/fixture", component: () => null });
    try {
      removePluginRuntime("qwenpaw-openui");
      expect(namespace.openui).toBeUndefined();
      expect(routeRegistry.snapshot().some((route) => route.source === "qwenpaw-openui")).toBe(false);
      expect(warn).toHaveBeenCalledOnce();
    } finally {
      delete namespace.openui;
      warn.mockRestore();
    }
  });
});
