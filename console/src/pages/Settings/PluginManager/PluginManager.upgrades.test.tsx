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
let queueResponse: { status: number; body: unknown };

beforeEach(() => {
  vi.clearAllMocks();
  requests = [];
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
          data: { plugins: [], total: 0 },
        });
      if (path === "/api/components/probe/install") {
        return Response.json(queueResponse.body, {
          status: queueResponse.status,
        });
      }
      if (path === "/api/plugins/replace") {
        installed = installed.map((p) => ({
          ...p,
          version: "1.0.1",
          loaded: true,
          status: "active",
        }));
        catalog = [];
        return Response.json({ id: "probe", name: "Probe", version: "1.0.1" });
      }
      throw new Error(`Unexpected request: ${path}`);
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

async function mountAndUpdate(all = false) {
  render(
    <MemoryRouter>
      <PluginManagerPage />
    </MemoryRouter>,
  );
  const card = await screen.findByRole("article", { name: "Probe" });
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
  it("queues signed upgrades from the real page and shows restart state", async () => {
    const card = await mountAndUpdate();
    await waitFor(() =>
      expect(
        within(card).getByText("appCenter.updateQueued"),
      ).toBeInTheDocument(),
    );
    expect(
      requests.some((r) => r.path === "/api/components/probe/install"),
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
