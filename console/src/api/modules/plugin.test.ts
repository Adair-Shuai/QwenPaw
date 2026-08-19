import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const hoisted = vi.hoisted(() => ({
  queueComponentUpdate: vi.fn(),
}));

vi.mock("../config", () => ({
  getApiUrl: vi.fn((p: string) => "http://test" + p),
}));
vi.mock("../authHeaders", () => ({
  buildAuthHeaders: vi.fn(() => ({})),
}));
vi.mock("./components", () => ({
  componentsApi: { queueComponentUpdate: hoisted.queueComponentUpdate },
}));

import {
  fetchPlugins,
  fetchPluginCatalog,
  fetchUGSciPluginCatalog,
  installPlugin,
  replaceInstalledPlugin,
  upgradeInstalledUGSciPlugin,
  uploadPlugin,
  uninstallPlugin,
  fetchPluginStatus,
} from "./plugin";
import { getApiUrl } from "../config";
import { buildAuthHeaders } from "../authHeaders";
import { ApiError } from "../request";

interface MockResponseOptions {
  ok: boolean;
  status: number;
  json?: unknown;
  text?: string;
}

function mockResponse({
  ok,
  status,
  json,
  text,
}: MockResponseOptions): Response {
  return {
    ok,
    status,
    json: async () => json,
    text: async () => text ?? "",
  } as unknown as Response;
}

describe("plugin module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetchPlugins returns parsed list on success", async () => {
    const plugins = [{ id: "p1", name: "Plugin One" }];
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        mockResponse({ ok: true, status: 200, json: plugins }),
      );

    const result = await fetchPlugins();

    expect(result).toEqual(plugins);
    expect(fetch).toHaveBeenCalledWith("http://test/plugins", {
      headers: {},
    });
  });

  it("fetchPlugins returns empty array on failure and does not throw", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    global.fetch = vi
      .fn()
      .mockResolvedValue(mockResponse({ ok: false, status: 500, json: {} }));

    const result = await fetchPlugins();

    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      "[plugin] Failed to fetch plugin list:",
      500,
    );
  });

  it("fetchPluginCatalog returns parsed catalog on success", async () => {
    const catalog = { updated_at: null, plugins: [] };
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        mockResponse({ ok: true, status: 200, json: catalog }),
      );

    const result = await fetchPluginCatalog();

    expect(result).toEqual(catalog);
    expect(getApiUrl).toHaveBeenCalledWith("/plugins/catalog");
  });

  it("fetchPluginCatalog throws with body.detail on failure", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 502,
        json: { detail: "Upstream down" },
      }),
    );

    await expect(fetchPluginCatalog()).rejects.toThrow("Upstream down");
  });

  it("fetchUGSciPluginCatalog keeps channel or UGSci-author rows", async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (String(url).endsWith("/plugins/catalog")) {
        return mockResponse({
          ok: true,
          status: 200,
          json: {
            updated_at: null,
            plugins: [
              {
                plugin_id: "ulit",
                version: "1.0.0",
                channel: "ugsci",
                author: "QwenPaw Team",
              },
              {
                plugin_id: "ugsci",
                version: "2.0.0",
                author: "UGSci Team",
              },
              {
                plugin_id: "other",
                version: "1.0.0",
                author: "Someone Else",
              },
              {
                plugin_id: "community-app",
                version: "1.0.0",
                channel: "community",
                author: "UGSci Team",
              },
            ],
          },
        });
      }
      return mockResponse({ ok: true, status: 200, json: [] });
    });

    const result = await fetchUGSciPluginCatalog();
    expect(result.plugins.map((entry) => entry.plugin_id)).toEqual([
      "ulit",
      "ugsci",
    ]);
  });

  it("fetchPluginCatalog throws fallback message when body has no detail", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(mockResponse({ ok: false, status: 503, json: {} }));

    await expect(fetchPluginCatalog()).rejects.toThrow(
      "Failed to load plugin catalog (503)",
    );
  });

  it("installPlugin posts JSON with force defaulting to false", async () => {
    const res = { id: "p1", name: "n", message: "ok" };
    global.fetch = vi
      .fn()
      .mockResolvedValue(mockResponse({ ok: true, status: 200, json: res }));

    const result = await installPlugin("/local/path");

    expect(result).toEqual(res);
    expect(fetch).toHaveBeenCalledWith("http://test/plugins/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "/local/path", force: false }),
    });
  });

  it("installPlugin forwards force when provided and throws detail on failure", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 400,
        json: { detail: "Already installed" },
      }),
    );

    await expect(installPlugin("http://x/y", { force: true })).rejects.toThrow(
      "Already installed",
    );
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(init.body as string)).toEqual({
      source: "http://x/y",
      force: true,
    });
  });

  it("replaceInstalledPlugin uses the authenticated backend route", async () => {
    const res = {
      id: "p1",
      name: "Plugin One",
      version: "2.0.0",
      restart_required: true,
    };
    global.fetch = vi
      .fn()
      .mockResolvedValue(mockResponse({ ok: true, status: 200, json: res }));

    await expect(
      replaceInstalledPlugin({
        source: "https://download.qwenpaw.agentscope.io/p1.zip",
        pluginId: "p1",
        version: "2.0.0",
        sha256: "a".repeat(64),
      }),
    ).resolves.toEqual(res);

    expect(fetch).toHaveBeenCalledWith("http://test/plugins/replace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "https://download.qwenpaw.agentscope.io/p1.zip",
        plugin_id: "p1",
        version: "2.0.0",
        sha256: "a".repeat(64),
      }),
    });
  });

  it("upgradeInstalledUGSciPlugin prefers the signed component updater", async () => {
    hoisted.queueComponentUpdate.mockResolvedValue({
      component: "ugsci",
      queued: true,
    });
    global.fetch = vi.fn();

    await expect(
      upgradeInstalledUGSciPlugin({
        plugin_id: "ugsci",
        version: "2.0.0",
        install_url: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
        upgrade_available: true,
      }),
    ).resolves.toEqual({ method: "queued" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("upgradeInstalledUGSciPlugin falls back to verified replace when not managed", async () => {
    hoisted.queueComponentUpdate.mockRejectedValue(
      new ApiError("component ugsci is not managed", 409),
    );
    global.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        json: {
          id: "ugsci",
          name: "UGSci",
          version: "2.0.0",
          restart_required: true,
        },
      }),
    );

    await expect(
      upgradeInstalledUGSciPlugin({
        plugin_id: "ugsci",
        version: "2.0.0",
        install_url: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
        sha256: "b".repeat(64),
        upgrade_available: true,
      }),
    ).resolves.toEqual({ method: "replaced", version: "2.0.0" });

    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("http://test/plugins/replace");
    expect(JSON.parse(init.body as string)).toEqual({
      source: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
      plugin_id: "ugsci",
      version: "2.0.0",
      sha256: "b".repeat(64),
    });
  });

  it("upgradeInstalledUGSciPlugin reports up-to-date without a catalog upgrade", async () => {
    hoisted.queueComponentUpdate.mockResolvedValue({
      component: "ugsci",
      queued: false,
      reason: "up-to-date",
    });
    global.fetch = vi.fn();

    await expect(
      upgradeInstalledUGSciPlugin({
        plugin_id: "ugsci",
        version: "1.0.0",
        install_url: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
        upgrade_available: false,
      }),
    ).resolves.toEqual({ method: "up-to-date" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("upgradeInstalledUGSciPlugin does not replace when signed path is up-to-date", async () => {
    hoisted.queueComponentUpdate.mockResolvedValue({
      component: "ugsci",
      queued: false,
      reason: "up-to-date",
    });
    global.fetch = vi.fn();

    await expect(
      upgradeInstalledUGSciPlugin({
        plugin_id: "ugsci",
        version: "2.0.0",
        install_url: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
        sha256: "b".repeat(64),
        upgrade_available: true,
      }),
    ).resolves.toEqual({ method: "up-to-date" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("upgradeInstalledUGSciPlugin does not fall back on queue 502", async () => {
    hoisted.queueComponentUpdate.mockRejectedValue(
      new ApiError("Component update queue failed", 502),
    );
    global.fetch = vi.fn();

    await expect(
      upgradeInstalledUGSciPlugin({
        plugin_id: "ugsci",
        version: "2.0.0",
        install_url: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
        sha256: "b".repeat(64),
        upgrade_available: true,
      }),
    ).rejects.toMatchObject({ status: 502 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("upgradeInstalledUGSciPlugin falls back on structured not_managed reason", async () => {
    hoisted.queueComponentUpdate.mockRejectedValue(
      new ApiError("component unavailable", 409, "not_managed"),
    );
    global.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        json: {
          id: "ugsci",
          name: "UGSci",
          version: "2.0.0",
          restart_required: true,
        },
      }),
    );

    await expect(
      upgradeInstalledUGSciPlugin({
        plugin_id: "ugsci",
        version: "2.0.0",
        install_url: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
        sha256: "b".repeat(64),
        upgrade_available: true,
      }),
    ).resolves.toEqual({ method: "replaced", version: "2.0.0" });
  });

  it("upgradeInstalledUGSciPlugin maps core_below_minimum to core-update-required", async () => {
    hoisted.queueComponentUpdate.mockRejectedValue(
      new ApiError(
        "core version is below component minimum; install the desktop update first",
        409,
        "core_below_minimum",
      ),
    );
    global.fetch = vi.fn();

    await expect(
      upgradeInstalledUGSciPlugin({
        plugin_id: "ugsci",
        version: "2.0.0",
        install_url: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
        sha256: "a".repeat(64),
        upgrade_available: true,
      }),
    ).resolves.toEqual({ method: "core-update-required" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("upgradeInstalledUGSciPlugin detects legacy core-minimum messages without reason", async () => {
    hoisted.queueComponentUpdate.mockRejectedValue(
      new ApiError(
        "Component update check failed: core version is below component minimum",
        409,
      ),
    );
    global.fetch = vi.fn();

    await expect(
      upgradeInstalledUGSciPlugin({
        plugin_id: "ugsci",
        version: "2.0.0",
        install_url: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
        sha256: "a".repeat(64),
        upgrade_available: true,
      }),
    ).resolves.toEqual({ method: "core-update-required" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("upgradeInstalledUGSciPlugin does not fall back on other 409 reasons", async () => {
    hoisted.queueComponentUpdate.mockRejectedValue(
      new ApiError("component updates are not configured", 409, "conflict"),
    );
    global.fetch = vi.fn();

    await expect(
      upgradeInstalledUGSciPlugin({
        plugin_id: "ugsci",
        version: "2.0.0",
        install_url: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
        sha256: "b".repeat(64),
        upgrade_available: true,
      }),
    ).rejects.toMatchObject({ status: 409, reason: "conflict" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("upgradeInstalledUGSciPlugin requires sha256 on replace fallback", async () => {
    hoisted.queueComponentUpdate.mockRejectedValue(
      new ApiError("component ugsci is not managed", 409, "not_managed"),
    );
    global.fetch = vi.fn();

    await expect(
      upgradeInstalledUGSciPlugin({
        plugin_id: "ugsci",
        version: "2.0.0",
        install_url: "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
        upgrade_available: true,
      }),
    ).rejects.toThrow("missing a SHA-256 digest");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uploadPlugin posts FormData and returns json on success", async () => {
    const res = { id: "p1", name: "n" };
    global.fetch = vi
      .fn()
      .mockResolvedValue(mockResponse({ ok: true, status: 200, json: res }));

    const file = new File(["zip"], "p.zip", { type: "application/zip" });
    const result = await uploadPlugin(file);

    expect(result).toEqual(res);
    expect(buildAuthHeaders).toHaveBeenCalled();
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("http://test/plugins/upload");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("file")).toBe(file);
  });

  it("uninstallPlugin resolves void on success and DELETEs by id", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(mockResponse({ ok: true, status: 204, json: null }));

    await expect(uninstallPlugin("p1")).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("http://test/plugins/p1", {
      method: "DELETE",
      headers: {},
    });
  });

  it("uninstallPlugin throws fallback message on failure", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(mockResponse({ ok: false, status: 500, json: {} }));

    await expect(uninstallPlugin("p1")).rejects.toThrow(
      "Uninstall failed (500)",
    );
  });

  it("fetchPluginStatus throws Status fetch failed on non-ok", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(mockResponse({ ok: false, status: 404, json: {} }));

    await expect(fetchPluginStatus("missing")).rejects.toThrow(
      "Status fetch failed (404)",
    );
    expect(getApiUrl).toHaveBeenCalledWith("/plugins/missing/status");
  });
});
