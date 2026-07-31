import { describe, expect, it } from "vitest";
import { resolveWorkspaceMarkdownTarget } from "./workspaceMarkdownLinks";

describe("resolveWorkspaceMarkdownTarget", () => {
  it("resolves paths relative to the Markdown file directory", () => {
    expect(
      resolveWorkspaceMarkdownTarget("images/result.png", "reports/report.md"),
    ).toEqual({ kind: "workspace", path: "reports/images/result.png" });
    expect(
      resolveWorkspaceMarkdownTarget("../data/result.csv", "reports/report.md"),
    ).toEqual({ kind: "workspace", path: "data/result.csv" });
  });

  it("supports workspace-root paths and Windows separators", () => {
    expect(
      resolveWorkspaceMarkdownTarget("/images/result.png", "reports/a.md"),
    ).toEqual({ kind: "workspace", path: "images/result.png" });
    expect(
      resolveWorkspaceMarkdownTarget("..\\data\\result.csv", "reports/a.md"),
    ).toEqual({ kind: "workspace", path: "data/result.csv" });
  });

  it("rejects traversal above the workspace root, including encoded traversal", () => {
    expect(
      resolveWorkspaceMarkdownTarget("../../../etc/passwd", "reports/a.md"),
    ).toEqual({ kind: "invalid" });
    expect(
      resolveWorkspaceMarkdownTarget("%2e%2e/%2e%2e/secret", "reports/a.md"),
    ).toEqual({ kind: "invalid" });
  });

  it("keeps external URLs and in-document anchors separate", () => {
    expect(
      resolveWorkspaceMarkdownTarget("https://example.com/a", "reports/a.md"),
    ).toEqual({ kind: "external", href: "https://example.com/a" });
    expect(
      resolveWorkspaceMarkdownTarget("mailto:test@example.com", "reports/a.md"),
    ).toEqual({ kind: "external", href: "mailto:test@example.com" });
    expect(resolveWorkspaceMarkdownTarget("#results", "reports/a.md")).toEqual({
      kind: "anchor",
      href: "#results",
    });
  });

  it("ignores query and fragment suffixes during filesystem resolution", () => {
    expect(
      resolveWorkspaceMarkdownTarget(
        "../data/result.csv?download=1#rows",
        "reports/a.md",
      ),
    ).toEqual({ kind: "workspace", path: "data/result.csv" });
  });

  it("does not throw on malformed percent encoding", () => {
    expect(resolveWorkspaceMarkdownTarget("bad%2", "reports/a.md")).toEqual({
      kind: "invalid",
    });
  });
});
