import { describe, expect, it } from "vitest";
import { normalizeArtifactUrl } from "./openFilePreview";

describe("normalizeArtifactUrl", () => {
  it("converts file URLs into backend preview URLs", () => {
    const normalized = normalizeArtifactUrl(
      "file:///Users/lzw/Documents/generated/%E5%82%A8%E5%B1%82%E6%95%B0%E6%8D%AE%E8%A1%A8.xlsx",
    );

    expect(normalized).not.toMatch(/^file:/);
    expect(normalized).toContain("/files/preview/");
  });

  it("preserves existing API URLs", () => {
    const url = "/api/files/preview/%2FUsers/report.xlsx";
    expect(normalizeArtifactUrl(url)).toBe(url);
  });
});
