import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../../components/Workspace/renderers/HtmlRenderer";
import "../../components/Workspace/renderers/MarkdownRenderer";
import FilePreview from "./FilePreview";

const LAZY_RENDER_TIMEOUT = 12_000;

describe("FilePreview", () => {
  it("leaves shared preview controls to the files workspace host", async () => {
    const { container } = render(
      <FilePreview filePath="index.html" content="<h1>Preview</h1>" />,
    );

    expect(
      await screen.findByTitle("index.html", {}, { timeout: LAZY_RENDER_TIMEOUT }),
    ).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeInTheDocument();
    expect(container.querySelector(".ant-segmented")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows YAML frontmatter as metadata while preserving the body", async () => {
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

    const frontmatter = within(
      await screen.findByLabelText(
        "Front matter",
        {},
        { timeout: LAZY_RENDER_TIMEOUT },
      ),
    );
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
