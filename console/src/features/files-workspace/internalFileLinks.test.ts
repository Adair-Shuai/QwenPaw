import { describe, expect, it } from "vitest";
import {
  parseInternalFileLink,
  filePathFromPreviewUrl,
  rootForFileReference,
  toProjectRelativePath,
} from "./internalFileLinks";

describe("parseInternalFileLink", () => {
  it("opts into directory roots and trailing separators without weakening file parsing", () => {
    for (const [href, path] of [
      ["C:/", "C:/"],
      ["/", "/"],
      ["file:///C:/", "C:/"],
      ["file:///home/demo/", "/home/demo/"],
      ["docs/", "docs/"],
      ["C:\\Work\\项目\\", "C:/Work/项目/"],
    ]) {
      expect(parseInternalFileLink(href, true)).toBeNull();
      expect(parseInternalFileLink(href, true, true)).toMatchObject({
        source: "workspace",
        path,
      });
    }
    for (const href of [
      "docs//",
      "C:/Work/../",
      "//server/share/",
      "C://Work/",
    ]) {
      expect(parseInternalFileLink(href, true, true)).toBeNull();
    }
  });

  it.each([
    ["src/app.ts:12", "src/app.ts", 12, undefined, undefined],
    ["src/app.ts:12-18", "src/app.ts", 12, 18, undefined],
    ["src/app.ts:12:4", "src/app.ts", 12, undefined, 4],
    ["src/app.ts#L12-L18", "src/app.ts", 12, 18, undefined],
    ["C:/Work/项目/app.ts:12", "C:/Work/项目/app.ts", 12, undefined, undefined],
    [
      "/work/research%20notes.md#L8",
      "/work/research notes.md",
      8,
      undefined,
      undefined,
    ],
    ["file:///C:/Work/app.ts#L9", "C:/Work/app.ts", 9, undefined, undefined],
  ])("parses answer reference %s", (href, path, line, endLine, column) => {
    expect(parseInternalFileLink(href as string, true)).toMatchObject({
      path,
      line,
      column,
    });
    expect(parseInternalFileLink(href as string, true)?.endLine).toBe(endLine);
  });

  it.each([
    "javascript:alert(1)",
    "https://example.com/a.ts:12",
    "#section",
    "src/app.ts#L0",
    "src/app.ts#L8-L2",
    "src/app.ts#L9007199254740992",
    "/work/../secret.txt",
    "src/%2e%2e/secret.txt",
    "file://server/share/a.ts",
    "src/app.ts#L12C0",
    "src/%00file.ts",
    "//server/share/a.ts",
  ])("rejects invalid answer reference %s", (href) => {
    expect(parseInternalFileLink(href, true)).toBeNull();
  });

  it("parses relative paths and line locations", () => {
    expect(parseInternalFileLink("src/app.py#L120C4")).toEqual({
      source: "workspace",
      path: "src/app.py",
      line: 120,
      column: 4,
    });
  });

  it.each([
    "https://example.com/file.py",
    "mailto:team@example.com",
    "/etc/passwd",
    "../secret",
    "src/../secret",
    "C:/secret",
    "\\\\server\\share",
  ])("leaves unsafe or external target untouched: %s", (href) => {
    expect(parseInternalFileLink(href)).toBeNull();
  });

  it("maps absolute project files to safe relative paths", () => {
    expect(
      toProjectRelativePath(
        "C:/Work/Project/docs/file%20#notes.md",
        "C:/Work/Project",
      ),
    ).toBe("docs/file%20#notes.md");
    expect(
      toProjectRelativePath(
        "/Users/demo/project/src/app.ts",
        "/Users/demo/project",
      ),
    ).toBe("src/app.ts");
    expect(
      toProjectRelativePath(
        "C:\\Work\\Project\\src\\app.ts",
        "c:\\work\\project",
      ),
    ).toBe("src/app.ts");
  });

  it("does not map files outside the selected project", () => {
    expect(
      toProjectRelativePath("/Users/demo/other/app.ts", "/Users/demo/project"),
    ).toBeNull();
  });

  it("distinguishes encoded absolute paths from relative preview paths", () => {
    expect(
      filePathFromPreviewUrl(
        "/api/files/preview/%2FUsers/demo/project/hello.txt?token=test",
      ),
    ).toBe("/Users/demo/project/hello.txt");
    expect(
      filePathFromPreviewUrl("/api/files/preview/C%3A/Work/Project/hello.txt"),
    ).toBe("C:/Work/Project/hello.txt");
    expect(filePathFromPreviewUrl("/api/files/preview/reports/hello.txt")).toBe(
      "reports/hello.txt",
    );
  });

  it("uses a known absolute tool path for legacy preview URLs", () => {
    expect(
      filePathFromPreviewUrl(
        "/api/files/preview/Users/demo/project/hello.txt",
        "/Users/demo/project/hello.txt",
      ),
    ).toBe("/Users/demo/project/hello.txt");
  });

  it("resolves absolute references against project and workspace roots", () => {
    expect(
      rootForFileReference(
        "/Users/demo/project/src/app.ts",
        "/Users/demo/project",
        "/Users/demo/workspace",
      ),
    ).toBe("project");
    expect(
      rootForFileReference(
        "/Users/demo/workspace/PROFILE.md",
        "/Users/demo/project",
        "/Users/demo/workspace",
      ),
    ).toBe("workspace");
    expect(
      rootForFileReference(
        "C:\\Users\\demo\\workspace\\PROFILE.md",
        "C:\\Users\\demo\\project",
        "c:\\users\\demo\\workspace",
      ),
    ).toBe("workspace");
    expect(
      rootForFileReference(
        "src/app.ts",
        "/Users/demo/project",
        "/Users/demo/workspace",
      ),
    ).toBe("project");
  });
});
