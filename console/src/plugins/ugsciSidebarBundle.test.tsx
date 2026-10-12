import fs from "node:fs";
import path from "node:path";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { menuRegistry } from "./registry/store";
import { filterSidebarMenuItems } from "../layouts/registry/sidebarEntries";
import { buildPluginUiVerificationSnapshot } from "../tauri/uiVerification";

const entryIds = [
  "ugsci.experts",
  "ugsci.tools-skills",
  "ugsci.storage-dynamics",
  "ugsci.visualization",
];

describe.each([
  "plugins/bundle/ugsci/ui/dist/index.js",
  "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
])("UGSci packaged sidebar: %s", (bundlePath) => {
  beforeEach(() => {
    localStorage.clear();
    menuRegistry.__resetForTests();
    vi.useFakeTimers();
    Reflect.deleteProperty(window, "__ugsciVisualizationFrontendRegistered");
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: {
          React,
          antd: {},
          antdIcons: {},
          getApiUrl: (value: string) => `/api${value}`,
          getApiToken: () => "",
          fetch: vi.fn(
            async () => new Response(JSON.stringify({ enabled: true })),
          ),
        },
        menu: menuRegistry,
        route: { add: vi.fn() },
        sidebar: { registerSimpleModeItems: vi.fn() },
      },
    });
  });

  afterEach(() => {
    menuRegistry.__resetForTests();
    localStorage.clear();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "QwenPaw");
    Reflect.deleteProperty(window, "__ugsciVisualizationFrontendRegistered");
  });

  it.each([null, "full", "simple"])(
    "shows plugin entries with legacy preference %s and respects explicit hiding",
    (legacyMode) => {
      if (legacyMode !== null)
        localStorage.setItem("qwenpaw_sidebar_mode", legacyMode);
      menuRegistry.add("core", {
        id: "core.agent-config",
        label: "Config",
        location: "primary.agentScoped",
      });
      const errors = vi.spyOn(console, "error");
      new Function(
        fs.readFileSync(path.resolve(process.cwd(), "..", bundlePath), "utf8"),
      )();
      expect(errors).not.toHaveBeenCalled();

      const visible = menuRegistry.snapshot("primary.agentScoped");
      const sidebar = filterSidebarMenuItems(
        visible,
        new Set(["core.agent-config"]),
        new Set(),
      );
      expect(sidebar.map((item) => item.id)).toEqual(
        expect.arrayContaining([...entryIds, "core.agent-config"]),
      );
      expect(
        buildPluginUiVerificationSnapshot().menus.map((item) => item.id),
      ).toEqual(expect.arrayContaining(entryIds));

      const hidden = filterSidebarMenuItems(
        visible,
        new Set(),
        new Set(["ugsci.experts"]),
      );
      expect(hidden.map((item) => item.id)).not.toContain("ugsci.experts");
      expect(hidden.map((item) => item.id)).toContain("ugsci.tools-skills");
    },
  );
});

it("does not certify registered-but-hidden menus in the native release report", () => {
  menuRegistry.__resetForTests();
  const registration = menuRegistry.add("ugsci", {
    id: "ugsci.experts",
    label: "Experts",
    visible: () => false,
  });
  try {
    expect(buildPluginUiVerificationSnapshot().menus).not.toContainEqual({
      id: "ugsci.experts",
    });
  } finally {
    registration.dispose();
  }
});
