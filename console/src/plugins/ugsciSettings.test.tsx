import fs from "node:fs";
import path from "node:path";
import React from "react";
import * as antd from "antd";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/common_setup";
import SettingsCenter from "@/pages/SettingsCenter";
import { menuRegistry, routeRegistry } from "./registry/store";

vi.mock("@/plugins/PluginContext", () => ({
  usePlugins: () => ({ loading: false }),
}));

vi.mock("@number-flow/react", () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>,
}));

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

describe.each([
  "plugins/bundle/ugsci/ui/dist/index.js",
  "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
])("UGSci packaged settings: %s", (bundlePath) => {
  let config: {
    enabled: boolean;
    persisted_enabled: boolean;
    overridden: boolean;
    channels: string[];
    allow_html: boolean;
    allow_actions: string[];
  };
  let unavailable: boolean;
  const hostFetch = vi.fn();
  const feedback = { error: vi.fn(), success: vi.fn() };
  const originalPath = window.location.pathname;

  beforeEach(() => {
    menuRegistry.__resetForTests();
    routeRegistry.__resetForTests();
    localStorage.clear();
    unavailable = false;
    config = {
      enabled: true,
      persisted_enabled: true,
      overridden: false,
      channels: ["response.append"],
      allow_html: false,
      allow_actions: [],
    };
    hostFetch.mockReset().mockImplementation(async (_url, init) => {
      if (unavailable) throw new Error("backend unavailable");
      if (init?.method === "PUT") {
        const { enabled } = JSON.parse(init.body);
        config = { ...config, enabled, persisted_enabled: enabled };
      }
      return new Response(JSON.stringify(config));
    });
    feedback.error.mockClear();
    feedback.success.mockClear();
    Reflect.deleteProperty(window, "__ugsciVisualizationFrontendRegistered");
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: {
          React,
          antd: { ...antd, message: feedback },
          antdIcons: {},
          getApiUrl: (value: string) => `/api${value}`,
          getApiToken: () => "",
          fetch: hostFetch,
        },
        menu: menuRegistry,
        route: routeRegistry,
        sidebar: { registerSimpleModeItems: vi.fn() },
      },
    });
  });

  async function loadPlugin() {
    await act(async () => {
      new Function(
        fs.readFileSync(path.resolve(process.cwd(), "..", bundlePath), "utf8"),
      )();
    });
  }

  afterEach(() => {
    cleanup();
    menuRegistry.__resetForTests();
    routeRegistry.__resetForTests();
    Reflect.deleteProperty(window, "QwenPaw");
    Reflect.deleteProperty(window, "__ugsciVisualizationFrontendRegistered");
    window.history.replaceState({}, "", originalPath);
    vi.restoreAllMocks();
  });

  it("opens packaged UGSci settings in Settings Center and persists the GenUI switch", async () => {
    await loadPlugin();
    const view = renderWithProviders(
      <>
        <SettingsCenter />
        <LocationProbe />
      </>,
      { initialEntries: ["/settings/general"] },
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Search settings" }),
      "GenUI",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "UGSci settings" }),
    );
    expect(screen.getByRole("heading", { name: "UGSci 设置" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "GenUI" })).toBeVisible();
    const toggle = await screen.findByRole("switch", { name: "启用 GenUI" });
    expect(toggle).toBeChecked();
    expect(screen.getByTestId("location")).toHaveTextContent("/settings/ugsci");
    expect(menuRegistry.snapshot().map((entry) => entry.id)).not.toContain(
      "ugsci.genui-settings",
    );
    expect(menuRegistry.snapshot().map((entry) => entry.id)).not.toContain(
      "ugsci.settings",
    );

    await userEvent.click(toggle);
    await waitFor(() =>
      expect(hostFetch).toHaveBeenCalledWith(
        "/ugsci/genui/config",
        expect.objectContaining({ method: "PUT", body: '{"enabled":false}' }),
      ),
    );
    expect(toggle).not.toBeChecked();
    expect(await screen.findByText(/GenUI 已全局关闭/)).toBeVisible();
    const published = Reflect.get(Reflect.get(window, "QwenPaw"), "genui");
    expect(published.config.persisted_enabled).toBe(false);
    view.unmount();
    renderWithProviders(<SettingsCenter />, {
      initialEntries: ["/settings/ugsci"],
    });
    expect(
      await screen.findByRole("switch", { name: "启用 GenUI" }),
    ).not.toBeChecked();
  });

  it("redirects the old GenUI address into UGSci settings", async () => {
    await loadPlugin();
    const LegacyPage = routeRegistry
      .snapshot()
      .find((route) => route.id === "ugsci.genui-settings")!.Component;
    window.history.replaceState({}, "", "/ugsci-genui-settings");
    render(
      <antd.App>
        <BrowserRouter>
          <Routes>
            <Route path="/ugsci-genui-settings" element={<LegacyPage />} />
            <Route path="/settings/*" element={<SettingsCenter />} />
          </Routes>
          <LocationProbe />
        </BrowserRouter>
      </antd.App>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/settings/ugsci",
      ),
    );
    expect(
      await screen.findByRole("switch", { name: "启用 GenUI" }),
    ).toBeChecked();
    expect(screen.getByRole("heading", { name: "UGSci 设置" })).toBeVisible();
  });

  it("keeps GenUI settings disabled when the backend is unavailable", async () => {
    unavailable = true;
    await loadPlugin();
    renderWithProviders(<SettingsCenter />, {
      initialEntries: ["/settings/ugsci"],
    });
    expect(
      await screen.findByRole("switch", { name: "启用 GenUI" }),
    ).toBeDisabled();
    expect(screen.getByText(/UGSci 后端当前不可用/)).toBeVisible();
    expect(
      hostFetch.mock.calls.some(([, init]) => init?.method === "PUT"),
    ).toBe(false);
  });

  it("hides the UGSci settings entry when the plugin is absent", async () => {
    await loadPlugin();
    routeRegistry.__resetForTests();
    renderWithProviders(<SettingsCenter />, {
      initialEntries: ["/settings/general"],
    });
    expect(
      screen.queryByRole("button", { name: "UGSci settings" }),
    ).not.toBeInTheDocument();
  });
});
