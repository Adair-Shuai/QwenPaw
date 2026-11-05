// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { Modal } from "antd";
import { renderWithProviders } from "@/test/common_setup";
import { routeRegistry } from "@/plugins/registry/store";
import { resetPawAppLoaderForTests } from "@/plugins/usePluginLoader";
import { notifyPluginChange } from "@/utils/pluginChangeEvents";
import AppCenterPage from "./index";

const catalog = vi.hoisted(() => vi.fn());
vi.mock("@/api/modules/plugin", async () => ({
  ...(await vi.importActual<typeof import("@/api/modules/plugin")>(
    "@/api/modules/plugin",
  )),
  fetchQwenPawPluginCatalog: catalog,
}));
vi.mock("@/plugins/pawapp-sdk/browserSession", () => ({
  prepareBrowserSession: vi.fn().mockResolvedValue(null),
}));
vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: vi.fn() },
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
const runtime = globalThis as typeof globalThis & { __updatedApp?: () => void };
const oldCreate = URL.createObjectURL;
const oldRevoke = URL.revokeObjectURL;
let version: string;
let available: boolean;
let frontendLoads: number;
let requireDependency = false;
let dependencyAction = "";
const dependency = {
  id: "app-dependency-update",
  plugin_id: "demo",
  status: "needs_confirmation",
  changes: [
    { name: "shared-package", current_version: "1", target_version: "2" },
  ],
  affected_instances: [],
  requires_restart: false,
  message: "Approve shared-package update",
};
let bundleNumber = 0;
function app() {
  return {
    id: "demo",
    name: "Demo",
    version,
    description: "Demo application",
    category: "tools",
    entry_page: "/apps/demo",
    status: available ? "active" : "failed",
    enabled: true,
    loaded: available,
    diagnostics: available ? [] : ["Dependency could not start"],
  };
}

describe("AppCenter update lifecycle", () => {
  beforeAll(async () => {
    await import("./AppMarket");
  });
  beforeEach(() => {
    // jsdom does not run CSS animations; keep the actual dialog and handlers.
    const confirm = Modal.confirm;
    vi.spyOn(Modal, "confirm").mockImplementation((config) =>
      confirm({ ...config, transitionName: "", maskTransitionName: "" }),
    );
    version = "1.0.0";
    requireDependency = false;
    dependencyAction = "";
    localStorage.clear();
    available = true;
    frontendLoads = 0;
    resetPawAppLoaderForTests();
    routeRegistry.__resetForTests();
    routeRegistry.add("demo", {
      id: "demo.page",
      path: "/apps/demo",
      component: () => <div>Old app UI</div>,
    });
    runtime.__updatedApp = () => {
      frontendLoads += 1;
      routeRegistry.add("demo", {
        id: "demo.page",
        path: "/apps/demo",
        component: () => <div>Updated app UI</div>,
      });
    };
    URL.createObjectURL = vi.fn(
      () =>
        `data:text/javascript,${encodeURIComponent(
          `globalThis.__updatedApp(); // ${++bundleNumber}`,
        )}`,
    );
    URL.revokeObjectURL = vi.fn();
    catalog.mockImplementation(async () => ({
      plugins: [
        {
          id: "demo-2.0.0",
          plugin_id: "demo",
          name: "Demo",
          version: "2.0.0",
          description: "Demo application",
          author: "dev",
          kind: "apps",
          install_url: "/bundled/apps/demo",
          installed: true,
          installed_version: version,
          upgrade_available: version !== "2.0.0",
        },
      ],
    }));
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith("/pawapps")) return json({ apps: [app()], total: 1 });
      if (url.endsWith("/version")) return json({ version: "2.3.0" });
      if (url.includes("/plugins/dependency-upgrades/app-dependency-update")) {
        dependencyAction = init?.method || "GET";
        if (init?.method === "DELETE")
          return json({ ...dependency, status: "cancelled" });
        if (init?.method === "POST") {
          version = "2.0.0";
          return json({
            ...dependency,
            status: "succeeded",
            result: {
              id: "demo",
              name: "Demo",
              version,
              loaded: available,
              description: "Demo application",
              message: "Updated",
            },
          });
        }
      }
      if (url.endsWith("/plugins/replace") && init?.method === "POST") {
        if (requireDependency)
          return json(
            {
              detail: {
                code: "DEPENDENCY_UPGRADE_REQUIRED",
                message: dependency.message,
                operation: dependency,
              },
            },
            409,
          );
        version = "2.0.0";
        return json({
          id: "demo",
          name: "Demo",
          version,
          loaded: available,
          restart_required: false,
        });
      }
      if (url.endsWith("/frontend_plugin"))
        return json([
          {
            id: "demo",
            name: "Demo",
            plugin_type: "app",
            frontend_entry: "index.js",
            version,
            enabled: available,
          },
        ]);
      if (url.includes("/frontend_plugin/demo/files/"))
        return new Response("bundle");
      throw new Error(`Unexpected request: ${url}`);
    });
    window.history.replaceState({}, "", "/apps");
  });
  afterEach(() => {
    URL.createObjectURL = oldCreate;
    URL.revokeObjectURL = oldRevoke;
    delete runtime.__updatedApp;
    Modal.destroyAll();
    vi.restoreAllMocks();
  });

  it("updates through the real market and replacement API and opens the new registered UI", async () => {
    renderWithProviders(<AppCenterPage />, {
      initialEntries: ["/apps?view=official"],
    });
    const update = await screen.findByRole(
      "button",
      { name: "appCenter.update" },
      { timeout: 10000 },
    );
    await waitFor(() => expect(update).toBeEnabled());
    fireEvent.click(update);
    await waitFor(() => expect(frontendLoads).toBe(1));
    fireEvent.click(screen.getByRole("tab", { name: /appCenter.myApps/ }));
    expect(await screen.findByText("v2.0.0")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "appCenter.openApp" }));
    expect(await screen.findByText("Updated app UI")).toBeVisible();
    expect(screen.queryByText("Old app UI")).not.toBeInTheDocument();
    expect(frontendLoads).toBe(1);
    available = false;
    act(() => notifyPluginChange());
    expect(await screen.findByText("Dependency could not start")).toBeVisible();
    expect(screen.queryByText("Updated app UI")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "appCenter.openApp" }),
    ).toBeDisabled();
  });

  it("keeps unavailable installed apps visible and never mounts their stale route", async () => {
    available = false;
    renderWithProviders(<AppCenterPage />, { initialEntries: ["/apps"] });
    expect(await screen.findByText("Dependency could not start")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Demo" }));
    fireEvent.keyDown(screen.getByRole("button", { name: "Demo" }), {
      key: "Enter",
    });
    expect(
      screen.getByRole("button", { name: "appCenter.openApp" }),
    ).toBeDisabled();
    expect(screen.queryByText("Old app UI")).not.toBeInTheDocument();
    expect(frontendLoads).toBe(0);
    await waitFor(() => expect(routeRegistry.snapshot()).toHaveLength(0));
    expect(
      screen.getByRole("button", { name: "appCenter.moreActions" }),
    ).toBeEnabled();
  });
  it.each([true, false])(
    "follows dependency confirmation from the app market (apply=%s)",
    async (apply) => {
      requireDependency = true;
      renderWithProviders(<AppCenterPage />, {
        initialEntries: ["/apps?view=official"],
      });
      const update = await screen.findByRole(
        "button",
        { name: "appCenter.update" },
        { timeout: 10000 },
      );
      await waitFor(() => expect(update).toBeEnabled());
      fireEvent.click(update);
      const confirmationName = apply
        ? "pluginManager.dependencyUpgrade.confirm"
        : "common.cancel";
      await waitFor(
        () =>
          expect(
            screen.getByRole("button", { name: confirmationName }),
          ).toBeVisible(),
        { timeout: 5000 },
      );
      expect(screen.getByText("Approve shared-package update")).toBeVisible();
      expect(version).toBe("1.0.0");
      expect(frontendLoads).toBe(0);
      fireEvent.click(screen.getByRole("button", { name: confirmationName }));
      await waitFor(
        () => expect(dependencyAction).toBe(apply ? "POST" : "DELETE"),
        { timeout: 5000 },
      );
      if (apply) {
        await waitFor(() => expect(frontendLoads).toBe(1));
        expect(version).toBe("2.0.0");
        fireEvent.click(screen.getByRole("tab", { name: /appCenter.myApps/ }));
        fireEvent.click(
          await screen.findByRole("button", { name: "appCenter.openApp" }),
        );
        expect(await screen.findByText("Updated app UI")).toBeVisible();
      } else {
        await waitFor(() => expect(update).toBeEnabled());
        expect(version).toBe("1.0.0");
        expect(frontendLoads).toBe(0);
        expect(routeRegistry.snapshot()).toHaveLength(1);
        expect(routeRegistry.snapshot()[0].source).toBe("demo");
      }
    },
  );

  it("updates an unavailable app without falsely activating its frontend", async () => {
    available = false;
    renderWithProviders(<AppCenterPage />, {
      initialEntries: ["/apps?view=official"],
    });
    const update = await screen.findByRole(
      "button",
      { name: "appCenter.update" },
      { timeout: 10000 },
    );
    await waitFor(() => expect(update).toBeEnabled());
    fireEvent.click(update);
    await waitFor(() => expect(version).toBe("2.0.0"));
    fireEvent.click(screen.getByRole("tab", { name: /appCenter.myApps/ }));
    expect(await screen.findByText("v2.0.0")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "appCenter.openApp" }),
    ).toBeDisabled();
    expect(frontendLoads).toBe(0);
  });
});
