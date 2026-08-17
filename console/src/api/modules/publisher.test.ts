import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../config", () => ({
  getApiUrl: vi.fn((path: string) => `http://test${path}`),
}));
vi.mock("../authHeaders", () => ({
  buildAuthHeaders: vi.fn(() => ({ Authorization: "Bearer test" })),
}));

import {
  fetchPublisherStatus,
  inspectInstalledAsset,
  uploadPublishArchive,
} from "./publisher";

describe("publisher API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    );
  });

  it("uses the production backend for status", async () => {
    await fetchPublisherStatus();
    expect(fetch).toHaveBeenCalledWith("http://test/publisher/status", {
      cache: "no-store",
      headers: { Authorization: "Bearer test" },
    });
  });

  it("sends installed asset inspection to the backend", async () => {
    await inspectInstalledAsset({ pluginId: "demo", kind: "plugin" });
    expect(fetch).toHaveBeenCalledWith("http://test/publisher/inspect", {
      method: "POST",
      headers: {
        Authorization: "Bearer test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pluginId: "demo", kind: "plugin" }),
    });
  });

  it("uploads the raw zip with authenticated publish headers", async () => {
    const file = new File(["zip"], "demo.zip", { type: "application/zip" });
    await uploadPublishArchive({ file, kind: "plugin", mode: "submission" });
    expect(fetch).toHaveBeenCalledWith("http://test/publisher/upload", {
      method: "POST",
      headers: {
        Authorization: "Bearer test",
        "Content-Type": "application/zip",
        "X-UGSci-Filename": "demo.zip",
        "X-UGSci-Asset-Kind": "plugin",
        "X-UGSci-Publish-Mode": "submission",
      },
      body: file,
    });
  });
});
