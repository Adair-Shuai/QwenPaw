/**
 * rendererRegistry.test.ts — 渲染器注册中心测试
 */
import { describe, it, expect, beforeEach } from "vitest";
import { rendererRegistry, MimeTypes } from "../rendererRegistry";
import type { RendererRegistration, WorkspaceArtifact } from "../../types";

beforeEach(() => {
  rendererRegistry.__resetForTests();
});

function makeArtifact(
  overrides: Partial<WorkspaceArtifact> = {},
): WorkspaceArtifact {
  return {
    id: "test-1",
    title: "Test",
    source: "tool_call",
    mimeType: "text/plain",
    ...overrides,
  };
}

describe("RendererRegistry.register", () => {
  it("registers a renderer and retrieves it by id", () => {
    const r: RendererRegistration = {
      id: "test",
      name: "Test Renderer",
      component: () => null,
    };
    rendererRegistry.register(r);
    expect(rendererRegistry.get("test")).toBe(r);
  });

  it("dispose removes the renderer", () => {
    const d = rendererRegistry.register({
      id: "test",
      name: "Test",
      component: () => null,
    });
    expect(rendererRegistry.get("test")).toBeDefined();
    d.dispose();
    expect(rendererRegistry.get("test")).toBeUndefined();
  });

  it("registerAll registers multiple renderers", () => {
    const d = rendererRegistry.registerAll([
      { id: "a", name: "A", component: () => null },
      { id: "b", name: "B", component: () => null },
    ]);
    expect(rendererRegistry.get("a")).toBeDefined();
    expect(rendererRegistry.get("b")).toBeDefined();
    d.dispose();
    expect(rendererRegistry.get("a")).toBeUndefined();
    expect(rendererRegistry.get("b")).toBeUndefined();
  });
});

describe("RendererRegistry.match", () => {
  it("matches by MIME type", () => {
    rendererRegistry.register({
      id: "md",
      name: "Markdown",
      component: () => null,
      mimeTypes: [MimeTypes.MARKDOWN],
      priority: 10,
    });

    const artifact = makeArtifact({ mimeType: MimeTypes.MARKDOWN });
    const match = rendererRegistry.match(artifact);
    expect(match).not.toBeNull();
    expect(match!.renderer.id).toBe("md");
    expect(match!.matchedBy).toBe("mimeType");
  });

  it("matches by extension when MIME type doesn't match", () => {
    rendererRegistry.register({
      id: "md",
      name: "Markdown",
      component: () => null,
      extensions: ["md", "markdown"],
      priority: 10,
    });

    const artifact = makeArtifact({
      mimeType: "application/octet-stream",
      extension: "md",
    });
    const match = rendererRegistry.match(artifact);
    expect(match).not.toBeNull();
    expect(match!.renderer.id).toBe("md");
    expect(match!.matchedBy).toBe("extension");
  });

  it("matches higher priority renderer when multiple match", () => {
    rendererRegistry.register({
      id: "low-priority",
      name: "Low",
      component: () => null,
      mimeTypes: [MimeTypes.MARKDOWN],
      priority: 1,
    });
    rendererRegistry.register({
      id: "high-priority",
      name: "High",
      component: () => null,
      mimeTypes: [MimeTypes.MARKDOWN],
      priority: 100,
    });

    const artifact = makeArtifact({ mimeType: MimeTypes.MARKDOWN });
    const match = rendererRegistry.match(artifact);
    expect(match!.renderer.id).toBe("high-priority");
  });

  it("matches by source when no MIME/extension match", () => {
    rendererRegistry.register({
      id: "tool-only",
      name: "Tool Only",
      component: () => null,
      sources: ["tool_call"],
      priority: 5,
    });

    const artifact = makeArtifact({
      mimeType: "unknown/custom",
      source: "tool_call",
    });
    const match = rendererRegistry.match(artifact);
    expect(match).not.toBeNull();
    expect(match!.renderer.id).toBe("tool-only");
    expect(match!.matchedBy).toBe("source");
  });

  it("falls back to fallback renderer", () => {
    rendererRegistry.register({
      id: "fallback",
      name: "Fallback",
      component: () => null,
    });

    const artifact = makeArtifact({ mimeType: "unknown/type" });
    const match = rendererRegistry.match(artifact);
    expect(match).not.toBeNull();
    expect(match!.renderer.id).toBe("fallback");
    expect(match!.matchedBy).toBe("fallback");
  });

  it("returns null when no match and no fallback", () => {
    const artifact = makeArtifact({ mimeType: "unknown/type" });
    const match = rendererRegistry.match(artifact);
    expect(match).toBeNull();
  });

  it("respects source filter when matching by MIME type", () => {
    rendererRegistry.register({
      id: "tool-md",
      name: "Tool Markdown",
      component: () => null,
      mimeTypes: [MimeTypes.MARKDOWN],
      sources: ["tool_call"],
      priority: 10,
    });

    // Should match for tool_call source
    const toolArtifact = makeArtifact({
      mimeType: MimeTypes.MARKDOWN,
      source: "tool_call",
    });
    expect(rendererRegistry.match(toolArtifact)?.renderer.id).toBe("tool-md");

    // Should NOT match for file_upload source
    const fileArtifact = makeArtifact({
      mimeType: MimeTypes.MARKDOWN,
      source: "file_upload",
    });
    expect(rendererRegistry.match(fileArtifact)).toBeNull();
  });
});

describe("RendererRegistry.supports", () => {
  it("returns true when a renderer supports the MIME type", () => {
    rendererRegistry.register({
      id: "pdf",
      name: "PDF",
      component: () => null,
      mimeTypes: [MimeTypes.PDF],
    });
    expect(rendererRegistry.supports(MimeTypes.PDF)).toBe(true);
    expect(rendererRegistry.supports("unknown/type")).toBe(false);
  });

  it("returns true when a renderer supports the extension", () => {
    rendererRegistry.register({
      id: "md",
      name: "Markdown",
      component: () => null,
      extensions: ["md"],
    });
    expect(rendererRegistry.supports("unknown", "md")).toBe(true);
    expect(rendererRegistry.supports("unknown", "xyz")).toBe(false);
  });
});
