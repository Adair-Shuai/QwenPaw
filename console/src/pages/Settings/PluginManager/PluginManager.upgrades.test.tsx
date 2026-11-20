// @vitest-environment jsdom
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PluginManagerPage from "./index";

const h = vi.hoisted(() => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  reload: vi.fn(),
  t: (key: string) => key,
}));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({ t: h.t }),
}));
vi.mock("@/hooks/useAppMessage", () => ({
  useAppMessage: () => ({ message: h.message }),
}));
vi.mock("@/hooks/useIsMobile", () => ({ useIsMobile: () => false }));
vi.mock("@/pages/Market/components/MarketplaceHeader", () => ({
  MarketplaceHeader: ({ extra }: { extra: React.ReactNode }) => (
    <div>{extra}</div>
  ),
}));
vi.mock("@/plugins/usePluginLoader", () => ({
  reloadFrontendPlugin: h.reload,
  reloadPawApp: h.reload,
}));

let requests: { path: string; body?: Record<string, unknown> }[];
let installed: Record<string, unknown>[];
let catalog: Record<string, unknown>[];
let market: Record<string, unknown>[];
let queueResponse: { status: number; body: unknown };
let dependencyOperation: Record<string, unknown> | null;

beforeEach(() => {
  vi.clearAllMocks();
  requests = [];
  dependencyOperation = null;
  installed = [
    {
      id: "probe",
      name: "Probe",
      version: "1.0.0",
      description: "",
      plugin_type: "app",
      frontend_entry: "index.js",
      status: "failed",
      loaded: false,
      enabled: false,
      diagnostics: ["requires QwenPaw <2.3.0"],
    },
  ];
  catalog = [
    {
      plugin_id: "probe",
      name: "Probe",
      version: "1.0.1",
      channel: "ugsci",
      install_url:
        "https://ugsci-download.oss-cn-beijing.aliyuncs.com/probe.zip",
      sha256: "a".repeat(64),
      upgrade_available: true,
    },
  ];
  market = [];
  queueResponse = { status: 200, body: { queued: true, component: "probe" } };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = new URL(String(input), "http://localhost").pathname;
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      requests.push({ path, body });
      if (path === "/api/plugins") return Response.json(installed);
      if (path === "/api/plugins/catalog")
        return Response.json({ plugins: catalog });
      if (path === "/api/plugins/market/search")
        return Response.json({
          success: true,
          data: { plugins: market, total: market.length },
        });
      if (path === `/api/components/${installed[0].id}/update`) {
        return Response.json(queueResponse.body, {
          status: queueResponse.status,
        });
      }
      if (
        path.startsWith("/api/plugins/dependency-upgrades/") &&
        dependencyOperation
      ) {
        if (path.endsWith("/apply")) {
          dependencyOperation = {
            ...dependencyOperation,
            status: "succeeded",
            result: {
              id: "probe",
              name: "Probe",
              version: "1.0.1",
              loaded: true,
            },
          };
          installed = installed.map((plugin) => ({
            ...plugin,
            version: "1.0.1",
            loaded: true,
            status: "active",
          }));
          catalog = [];
        } else if (init?.method === "DELETE") {
          dependencyOperation = { ...dependencyOperation, status: "cancelled" };
        }
        return Response.json(dependencyOperation);
      }
      if (path === "/api/plugins/replace") {
        installed = installed.map((p) =>
          p.id === body.plugin_id
            ? { ...p, version: body.version, loaded: true, status: "active" }
            : p,
        );
        catalog = [];
        market = [];
        return Response.json({ id: body.plugin_id, version: body.version });
      }
      throw new Error(`Unexpected request: ${path}`);
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

async function mountAndUpdate(all = false, name = "Probe") {
  render(
    <MemoryRouter>
      <PluginManagerPage />
    </MemoryRouter>,
  );
  const card = await screen.findByRole("article", { name });
  await waitFor(() =>
    expect(
      within(card).getByRole("button", { name: "pluginManager.update" }),
    ).toBeEnabled(),
  );
  fireEvent.click(
    all
      ? screen.getByRole("button", { name: /pluginManager.updateAll/ })
      : within(card).getByRole("button", { name: "pluginManager.update" }),
  );
  return card;
}

describe("installed plugin page upgrade contract", () => {
  it.each(["catalog", "community"])(
    "updates installed Matrix dev1 to dev2 from the real %s page action",
    async (source) => {
      installed = [
        {
          id: "matrix",
          name: "Matrix",
          version: "0.1.0.dev1",
          plugin_type: "channel",
          status: "active",
          loaded: true,
          enabled: true,
          market_id: "@qwenpaw/matrix",
        },
      ];
      const catalogUrl =
        "https://ugsci-download.oss-cn-beijing.aliyuncs.com/files/plugins/channel/matrix/matrix-0.1.0.dev2.zip";
      const marketUrl =
        "https://platform.agentscope.io/plugins/qwenpaw/matrix/archive/zip/master";
      catalog =
        source === "catalog"
          ? [
              {
                plugin_id: "matrix",
                name: "Matrix",
                version: "0.1.0.dev2",
                channel: "ugsci",
                install_url: catalogUrl,
                sha256: "b".repeat(64),
                upgrade_available: true,
              },
            ]
          : [];
      market =
        source === "community"
          ? [
              {
                id: "@qwenpaw/matrix",
                display_name: "Matrix",
                owner: "qwenpaw",
                developer: "qwenpaw",
                version: "0.1.0.dev2",
                locales: {},
              },
            ]
          : [];
      queueResponse = {
        status: 409,
        body: { detail: { reason: "not_managed", message: "not managed" } },
      };
      const card = await mountAndUpdate(false, "Matrix");
      await waitFor(() =>
        expect(within(card).getByText("v0.1.0.dev2")).toBeInTheDocument(),
      );
      expect(
        requests.find((request) => request.path === "/api/plugins/replace")
          ?.body,
      ).toEqual({
        plugin_id: "matrix",
        defer_if_needed: true,
        version: "0.1.0.dev2",
        source: source === "catalog" ? catalogUrl : marketUrl,
        ...(source === "catalog" ? { sha256: "b".repeat(64) } : {}),
      });
      expect(h.reload).not.toHaveBeenCalled();
      expect(
        requests.some((request) => request.path === "/api/plugins/install"),
      ).toBe(false);
    },
  );

  it("queues signed upgrades from the real page and shows restart state", async () => {
    const card = await mountAndUpdate();
    await waitFor(() =>
      expect(
        within(card).getByText("appCenter.updateQueued"),
      ).toBeInTheDocument(),
    );
    expect(
      requests.some((r) => r.path === "/api/components/probe/update"),
    ).toBe(true);
    expect(
      requests.some(
        (r) =>
          /\/(install|replace)$/.test(r.path) &&
          r.path.startsWith("/api/plugins"),
      ),
    ).toBe(false);
    expect(h.reload).not.toHaveBeenCalled();
    expect(h.message.success).toHaveBeenCalledWith(
      "pluginManager.ugsciUpgradeQueued",
    );
    expect(
      within(card).getByText("pluginManager.statusError").closest(".ant-tag"),
    ).toHaveAttribute("title", "requires QwenPaw <2.3.0");
  });

  it("replaces unmanaged catalog upgrades with their version and digest", async () => {
    queueResponse = {
      status: 409,
      body: { detail: { reason: "not_managed", message: "not managed" } },
    };
    const card = await mountAndUpdate(true);
    await waitFor(() => expect(h.reload).toHaveBeenCalledWith("probe"));
    expect(
      requests.find((r) => r.path === "/api/plugins/replace")?.body,
    ).toEqual({
      plugin_id: "probe",
      defer_if_needed: true,
      version: "1.0.1",
      sha256: "a".repeat(64),
      source:
        catalog[0]?.install_url ??
        "https://ugsci-download.oss-cn-beijing.aliyuncs.com/probe.zip",
    });
    await waitFor(() =>
      expect(
        within(card).getByText("pluginManager.statusLoaded"),
      ).toBeInTheDocument(),
    );
    expect(requests.some((r) => r.path === "/api/plugins/install")).toBe(false);
  });

  it("keeps core incompatibility blocked without attempting replacement", async () => {
    queueResponse = {
      status: 409,
      body: {
        detail: {
          reason: "core_below_minimum",
          message: "core version is below minimum",
        },
      },
    };
    await mountAndUpdate();
    await waitFor(() =>
      expect(h.message.warning).toHaveBeenCalledWith(
        "pluginManager.coreUpdateRequired",
      ),
    );
    expect(requests.some((r) => r.path === "/api/plugins/replace")).toBe(false);
    expect(h.reload).not.toHaveBeenCalled();
  });
});

it("shows a restart activation message after a manual hot update requires restart", async () => {
  queueResponse = {
    status: 200,
    body: {
      component: "probe",
      queued: false,
      updated: true,
      version: "1.0.1",
      loaded: true,
      restart_required: true,
    },
  };
  await mountAndUpdate();
  await waitFor(() => expect(h.reload).toHaveBeenCalledWith("probe"));
  expect(h.message.success).toHaveBeenCalledWith(
    "pluginManager.updateRestartRequired",
  );
  expect(h.message.success).not.toHaveBeenCalledWith(
    "pluginManager.updateSuccess",
  );
});

it.each([true, false])(
  "keeps signed shared-dependency confirmation on the real page (apply=%s)",
  async (apply) => {
    installed = installed.map((plugin) => ({
      ...plugin,
      enabled: true,
      loaded: true,
      status: "active",
    }));
    dependencyOperation = {
      id: (apply ? "e" : "f").repeat(32),
      plugin_id: "probe",
      status: "needs_confirmation",
      requires_restart: true,
      message: `Review shared dependencies ${apply ? "apply" : "cancel"}`,
      changes: [
        { name: "fixture", current_version: "1.0", target_version: "2.0" },
      ],
      affected_instances: [],
    };
    queueResponse = {
      status: 202,
      body: {
        component: "probe",
        queued: false,
        dependency_operation: dependencyOperation,
      },
    };
    await mountAndUpdate();
    const impact = await screen.findByText(
      `Review shared dependencies ${apply ? "apply" : "cancel"}`,
    );
    const dialog = impact.closest('[role="dialog"]') as HTMLElement;
    expect(dialog).toHaveAccessibleName(
      "pluginManager.dependencyUpgrade.title",
    );
    expect(h.reload).not.toHaveBeenCalled();
    expect(requests.some((request) => request.path.endsWith("/apply"))).toBe(
      false,
    );
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: apply
          ? "pluginManager.dependencyUpgrade.confirm"
          : "common.cancel",
      }),
    );
    if (apply) {
      await waitFor(() => expect(h.reload).toHaveBeenCalledWith("probe"));
      expect(dependencyOperation?.status).toBe("succeeded");
    } else {
      await waitFor(() =>
        expect(dependencyOperation?.status).toBe("cancelled"),
      );
      expect(h.reload).not.toHaveBeenCalled();
      expect(installed[0].version).toBe("1.0.0");
    }
  },
);

it("offers cached shared-dependency review when catalog discovery fails", async () => {
  installed = installed.map((plugin) => ({
    ...plugin,
    pending_update: {
      version: "1.0.1",
      source: "https://download.qwenpaw.agentscope.io/probe.zip",
      sha256: "a".repeat(64),
      confirmation: "dependencies",
    },
  }));
  catalog = [];
  market = [];
  render(
    <MemoryRouter>
      <PluginManagerPage />
    </MemoryRouter>,
  );
  const review = await screen.findByRole("button", {
    name: "pluginManager.confirmDependencyUpdate",
  });
  expect(review).toBeEnabled();
  expect(requests.some((request) => request.path.endsWith("/apply"))).toBe(
    false,
  );
  expect(h.reload).not.toHaveBeenCalled();
});
