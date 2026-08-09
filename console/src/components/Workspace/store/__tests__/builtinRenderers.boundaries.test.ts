import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  registerBuiltinRenderers,
  unregisterBuiltinRenderers,
} from "../builtinRenderers";
import { rendererRegistry } from "../rendererRegistry";
import type { WorkspaceArtifact } from "../../types";

function match(extension: string, mimeType: string): string | undefined {
  const artifact: WorkspaceArtifact = {
    id: extension,
    title: `file.${extension}`,
    source: "generated",
    mimeType,
    extension,
  };
  return rendererRegistry.match(artifact)?.renderer.id;
}

describe("builtin renderer integration boundaries", () => {
  beforeEach(() => {
    unregisterBuiltinRenderers();
    rendererRegistry.__resetForTests();
    registerBuiltinRenderers();
  });

  afterEach(() => {
    unregisterBuiltinRenderers();
    rendererRegistry.__resetForTests();
  });

  it("routes Markdown, code and JSON through their workspace adapters", () => {
    expect(match("md", "text/markdown")).toBe("markdown");
    expect(match("ts", "text/typescript")).toBe("code");
    expect(match("json", "application/json")).toBe("json");
  });

  it("keeps standalone Mermaid, PDF and Office renderers isolated", () => {
    expect(match("mmd", "text/x-mermaid")).toBe("mermaid");
    expect(match("pdf", "application/pdf")).toBe("pdf");
    expect(
      match(
        "docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe("office-doc");
    expect(
      match(
        "xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ),
    ).toBe("office-doc");
    expect(
      match(
        "pptx",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ),
    ).toBe("office-doc");
  });

  it.each([
    ["html", "text/html", "html"],
    ["csv", "text/csv", "csv"],
    ["tsv", "text/tab-separated-values", "csv"],
    ["png", "image/png", "image"],
    ["jpg", "image/jpeg", "image"],
    ["svg", "image/svg+xml", "image"],
    ["webp", "image/webp", "image"],
    ["mp4", "video/mp4", "media"],
    ["webm", "video/webm", "media"],
    ["mp3", "audio/mpeg", "media"],
    ["wav", "audio/wav", "media"],
    ["bin", "application/octet-stream", "fallback"],
  ])("routes .%s (%s) to the %s renderer", (extension, mimeType, renderer) => {
    expect(match(extension, mimeType)).toBe(renderer);
  });
});
