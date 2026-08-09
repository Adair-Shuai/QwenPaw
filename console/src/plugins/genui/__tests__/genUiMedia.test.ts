import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the module to access internal state
import {
  isDirectUrl,
  isAbsoluteLocalPath,
  isWorkspaceScheme,
  stripWorkspaceScheme,
  resolveMediaUrl,
  getCachedMediaUrl,
  preloadMediaUrl,
  clearMediaCache,
} from "@genui-src/lib/genUiMedia";

describe("genUiMedia", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset window.QwenPaw
    (global as any).window = {
      QwenPaw: {
        host: {
          React: global.React,
          workspaceApi: {
            getBinaryFileUrl: (path: string) => `/binary/${path}`,
          },
          chatApi: {
            filePreviewUrl: (path: string) =>
              `/preview/${encodeURIComponent(path)}`,
          },
          buildAuthHeaders: () => ({ Authorization: "Bearer test" }),
        },
      },
    };
    clearMediaCache();
  });

  afterEach(() => {
    (global as any).window = originalWindow;
    vi.restoreAllMocks();
  });

  // ── isDirectUrl ──────────────────────────────────────────────────────────

  describe("isDirectUrl", () => {
    it("returns true for http URLs", () => {
      expect(isDirectUrl("http://example.com/img.png")).toBe(true);
    });

    it("returns true for https URLs", () => {
      expect(isDirectUrl("https://example.com/img.png")).toBe(true);
    });

    it("returns true for data URLs", () => {
      expect(isDirectUrl("data:image/png;base64,abc123")).toBe(true);
    });

    it("returns true for blob URLs", () => {
      expect(isDirectUrl("blob:abc-123")).toBe(true);
    });

    it("returns false for relative paths", () => {
      expect(isDirectUrl("images/chart.png")).toBe(false);
    });

    it("returns false for absolute local paths", () => {
      expect(isDirectUrl("/Users/test/image.png")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isDirectUrl("")).toBe(false);
    });
  });

  // ── isAbsoluteLocalPath ──────────────────────────────────────────────────

  describe("isAbsoluteLocalPath", () => {
    it("returns true for Unix absolute paths", () => {
      expect(isAbsoluteLocalPath("/Users/test/image.png")).toBe(true);
      expect(isAbsoluteLocalPath("/home/user/file.txt")).toBe(true);
    });

    it("returns true for Windows drive paths", () => {
      expect(isAbsoluteLocalPath("C:\\Users\\test\\image.png")).toBe(true);
      expect(isAbsoluteLocalPath("D:/data/file.txt")).toBe(true);
    });

    it("returns true for UNC paths", () => {
      expect(isAbsoluteLocalPath("\\\\server\\share\\file.txt")).toBe(true);
    });

    it("returns false for relative paths", () => {
      expect(isAbsoluteLocalPath("images/chart.png")).toBe(false);
      expect(isAbsoluteLocalPath("./data/file.txt")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isAbsoluteLocalPath("")).toBe(false);
    });
  });

  // ── isWorkspaceScheme ────────────────────────────────────────────────────

  describe("isWorkspaceScheme", () => {
    it("returns true for workspace:// URLs", () => {
      expect(isWorkspaceScheme("workspace://images/chart.png")).toBe(true);
    });

    it("returns false for regular paths", () => {
      expect(isWorkspaceScheme("images/chart.png")).toBe(false);
    });

    it("returns false for http URLs", () => {
      expect(isWorkspaceScheme("https://example.com/img.png")).toBe(false);
    });
  });

  // ── stripWorkspaceScheme ─────────────────────────────────────────────────

  describe("stripWorkspaceScheme", () => {
    it("strips workspace:// prefix", () => {
      expect(stripWorkspaceScheme("workspace://images/chart.png")).toBe(
        "images/chart.png",
      );
    });

    it("returns path unchanged when no scheme", () => {
      expect(stripWorkspaceScheme("images/chart.png")).toBe("images/chart.png");
    });
  });

  // ── resolveMediaUrl ──────────────────────────────────────────────────────

  describe("resolveMediaUrl", () => {
    it("returns direct URLs immediately", async () => {
      const url = "https://example.com/image.png";
      const result = await resolveMediaUrl(url);
      expect(result).toBe(url);
    });

    it("returns data URLs immediately", async () => {
      const url = "data:image/png;base64,abc123";
      const result = await resolveMediaUrl(url);
      expect(result).toBe(url);
    });

    it("returns null for empty string", async () => {
      const result = await resolveMediaUrl("");
      expect(result).toBeNull();
    });

    it("resolves workspace paths via authenticated fetch", async () => {
      const blob = new Blob(["image-data"], { type: "image/png" });
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(blob),
      });
      vi.stubGlobal("fetch", fetchMock);
      vi.stubGlobal("URL", {
        ...URL,
        createObjectURL: vi.fn(() => "blob:resolved-url"),
        revokeObjectURL: vi.fn(),
      });

      const result = await resolveMediaUrl("images/chart.png");
      expect(result).toBe("blob:resolved-url");
      expect(fetchMock).toHaveBeenCalledWith(
        "/binary/images/chart.png",
        expect.objectContaining({
          headers: { Authorization: "Bearer test" },
        }),
      );
    });

    it("resolves absolute local paths via file preview API", async () => {
      const blob = new Blob(["image-data"], { type: "image/png" });
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(blob),
      });
      vi.stubGlobal("fetch", fetchMock);
      vi.stubGlobal("URL", {
        ...URL,
        createObjectURL: vi.fn(() => "blob:local-resolved"),
        revokeObjectURL: vi.fn(),
      });

      const absPath = "/Users/test/image.png";
      const result = await resolveMediaUrl(absPath);
      expect(result).toBe("blob:local-resolved");
      expect(fetchMock).toHaveBeenCalledWith(
        `/preview/${encodeURIComponent(absPath)}`,
        expect.objectContaining({
          headers: { Authorization: "Bearer test" },
        }),
      );
    });

    it("caches resolved URLs", async () => {
      const blob = new Blob(["image-data"]);
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(blob),
      });
      vi.stubGlobal("fetch", fetchMock);
      vi.stubGlobal("URL", {
        ...URL,
        createObjectURL: vi.fn(() => "blob:cached-url"),
        revokeObjectURL: vi.fn(),
      });

      const path = "images/cached.png";
      const result1 = await resolveMediaUrl(path);
      const result2 = await resolveMediaUrl(path);

      expect(result1).toBe("blob:cached-url");
      expect(result2).toBe("blob:cached-url");
      // fetch should only be called once due to caching
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("deduplicates concurrent requests", async () => {
      const blob = new Blob(["image-data"]);
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(blob),
      });
      vi.stubGlobal("fetch", fetchMock);
      vi.stubGlobal("URL", {
        ...URL,
        createObjectURL: vi.fn(() => "blob:dedup-url"),
        revokeObjectURL: vi.fn(),
      });

      const path = "images/dedup.png";
      // Clear cache to test dedup
      clearMediaCache();

      const [result1, result2] = await Promise.all([
        resolveMediaUrl(path),
        resolveMediaUrl(path),
      ]);

      expect(result1).toBe("blob:dedup-url");
      expect(result2).toBe("blob:dedup-url");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("returns null when fetch fails", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });
      vi.stubGlobal("fetch", fetchMock);

      clearMediaCache();
      const result = await resolveMediaUrl("images/missing.png");
      expect(result).toBeNull();
    });

    it("handles workspace:// scheme", async () => {
      const blob = new Blob(["image-data"]);
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(blob),
      });
      vi.stubGlobal("fetch", fetchMock);
      vi.stubGlobal("URL", {
        ...URL,
        createObjectURL: vi.fn(() => "blob:workspace-resolved"),
        revokeObjectURL: vi.fn(),
      });

      clearMediaCache();
      const result = await resolveMediaUrl("workspace://data/chart.png");
      expect(result).toBe("blob:workspace-resolved");
      // Should have stripped the workspace:// prefix
      expect(fetchMock).toHaveBeenCalledWith(
        "/binary/data/chart.png",
        expect.any(Object),
      );
    });
  });

  // ── getCachedMediaUrl ────────────────────────────────────────────────────

  describe("getCachedMediaUrl", () => {
    it("returns direct URLs immediately", () => {
      expect(getCachedMediaUrl("https://example.com/img.png")).toBe(
        "https://example.com/img.png",
      );
    });

    it("returns null for uncached workspace paths", () => {
      expect(getCachedMediaUrl("images/uncached.png")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(getCachedMediaUrl("")).toBeNull();
    });
  });

  // ── preloadMediaUrl ──────────────────────────────────────────────────────

  describe("preloadMediaUrl", () => {
    it("does nothing for direct URLs", () => {
      // Should not throw
      preloadMediaUrl("https://example.com/img.png");
    });

    it("does nothing for empty string", () => {
      preloadMediaUrl("");
    });
  });

  // ── clearMediaCache ──────────────────────────────────────────────────────

  describe("clearMediaCache", () => {
    it("clears cache without throwing", () => {
      expect(() => clearMediaCache()).not.toThrow();
    });
  });
});
