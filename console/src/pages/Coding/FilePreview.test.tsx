import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FilePreview from "./FilePreview";

describe("FilePreview", () => {
  it("leaves shared preview controls to the files workspace host", () => {
    const { container } = render(
      <FilePreview filePath="index.html" content="<h1>Preview</h1>" />,
    );

    expect(container.querySelector("iframe")).toBeInTheDocument();
    expect(container.querySelector(".ant-segmented")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows YAML frontmatter as metadata while preserving the body", () => {
    render(
      <FilePreview
        filePath="memory-search.md"
        content={[
          "---",
          "description: Memory Search query guidance",
          "name: memory-search-query-best-practices",
          "---",
          "",
          "## When to Use",
          "",
          "Use this when searching memory.",
        ].join("\n")}
      />,
    );

    const frontmatter = within(screen.getByLabelText("Front matter"));
    expect(frontmatter.getByText("description")).toBeInTheDocument();
    expect(
      frontmatter.getByText("Memory Search query guidance"),
    ).toBeInTheDocument();
    expect(frontmatter.getByText("name")).toBeInTheDocument();
    expect(
      frontmatter.getByText("memory-search-query-best-practices"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "When to Use" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Use this when searching memory."),
    ).toBeInTheDocument();
  });
});
