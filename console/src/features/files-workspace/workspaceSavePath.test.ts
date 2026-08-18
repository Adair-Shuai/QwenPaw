import { describe, expect, it } from "vitest";
import {
  isInlineGeneratedTab,
  sanitizeWorkspaceSavePath,
} from "./workspaceSavePath";

describe("sanitizeWorkspaceSavePath", () => {
  it("keeps a relative markdown path", () => {
    expect(sanitizeWorkspaceSavePath("AI 回复.md")).toBe("AI 回复.md");
  });

  it("adds .md when the name has no extension", () => {
    expect(sanitizeWorkspaceSavePath("notes/reply")).toBe("notes/reply.md");
  });

  it("rejects parent segments and absolute paths", () => {
    expect(sanitizeWorkspaceSavePath("../secret.md")).toBeNull();
    expect(sanitizeWorkspaceSavePath("/etc/passwd")).toBeNull();
    expect(sanitizeWorkspaceSavePath("C:\\Work\\a.md")).toBeNull();
  });
});

describe("isInlineGeneratedTab", () => {
  it("matches in-memory artifacts without a download URL", () => {
    expect(isInlineGeneratedTab({ source: "artifact" })).toBe(true);
    expect(
      isInlineGeneratedTab({ source: "artifact", artifactUrl: "/api/file" }),
    ).toBe(false);
    expect(isInlineGeneratedTab({ source: "workspace" })).toBe(false);
  });
});
