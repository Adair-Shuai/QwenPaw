import { describe, expect, it } from "vitest";
import {
  parseInternalFileLink,
  filePathFromPreviewUrl,
  rootForFileReference,
  toProjectRelativePath,
} from "./internalFileLinks";

describe("parseInternalFileLink", () => {
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
