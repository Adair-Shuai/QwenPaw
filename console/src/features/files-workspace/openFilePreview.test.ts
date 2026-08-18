import { describe, expect, it } from "vitest";
import { artifactToFileTarget, normalizeArtifactUrl } from "./openFilePreview";

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

describe("artifactToFileTarget", () => {
  it("adds the markdown extension so FilePreview uses preview mode", () => {
    const target = artifactToFileTarget({
      id: "response-default:new",
      title: "默认文件名太容易撞",
      source: "generated",
      mimeType: "text/markdown",
      extension: "md",
      textContent: "# Hello",
    });

    expect(target).toMatchObject({
      source: "artifact",
      path: "默认文件名太容易撞.md",
      artifact: {
        textContent: "# Hello",
        mimeType: "text/markdown",
      },
    });
  });
});
