import { render, screen, within, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import FilePreview, { getPreviewType, isPreviewable } from "./FilePreview";

const LAZY_RENDER_TIMEOUT = 12_000;
const blobResource = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useAuthenticatedWorkspaceBlob", () => ({
  useAuthenticatedWorkspaceBlob: (...args: unknown[]) => blobResource(...args),
}));

describe("FilePreview", () => {
  it("renders math code blocks in the markdown preview", async () => {
    render(
      <FilePreview
        filePath="formula.md"
        content={["```math", "x^2 + y^2 = z^2", "```"].join("\n")}
      />,
    );

    expect(
      await screen.findByText(
        /x\^2 \+ y\^2 = z\^2/,
        {},
        { timeout: LAZY_RENDER_TIMEOUT },
      ),
    ).toBeInTheDocument();
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

// ---------------------------------------------------------------------------
// getPreviewType / isPreviewable — regression for #5863
// (Coding session images were not displayed because image files did not
// enable preview mode; the file-type decision must be covered by tests)
// ---------------------------------------------------------------------------
describe("getPreviewType (#5863)", () => {
  it.each([
    ["photo.png", "image"],
    ["photo.jpg", "image"],
    ["photo.JPEG", "image"], // case-insensitive extension
    ["anim.gif", "image"],
    ["pic.webp", "image"],
    ["icon.svg", "image"],
    ["favicon.ico", "image"],
    ["bitmap.bmp", "image"],
  ])("detects image type for %s", (path, expected) => {
    expect(getPreviewType(path)).toBe(expected);
  });

  it("detects pdf / markdown / html / csv types", () => {
    expect(getPreviewType("doc.pdf")).toBe("pdf");
    expect(getPreviewType("README.md")).toBe("markdown");
    expect(getPreviewType("notes.mdx")).toBe("markdown");
    expect(getPreviewType("page.html")).toBe("html");
    expect(getPreviewType("page.htm")).toBe("html");
    expect(getPreviewType("data.csv")).toBe("csv");
  });

  it("delegates other supported formats to the rich renderer", () => {
    expect(getPreviewType("script.py")).toBe("rich");
    expect(getPreviewType("archive.zip")).toBe("none");
    expect(getPreviewType("Makefile")).toBe("rich");
  });

  it("uses only the last extension segment", () => {
    // "notes.md.bak" must NOT be treated as markdown
    expect(getPreviewType("notes.md.bak")).toBe("none");
    expect(getPreviewType("photo.png.tmp")).toBe("none");
  });
});

describe("isPreviewable (#5863)", () => {
  it("returns true for direct and rich previewable types", () => {
    expect(isPreviewable("photo.png")).toBe(true);
    expect(isPreviewable("README.md")).toBe(true);
    expect(isPreviewable("script.py")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Image preview rendering — regression for A#82584296 (image preview not working)
// When a file has an image extension, FilePreview must render an <img>
// element (after blob loading) rather than falling through to null.
// ---------------------------------------------------------------------------

// Mock dependencies for image preview tests
vi.mock("@/stores/agentStore", () => ({
  useAgentStore: vi.fn((selector?: (s: any) => any) =>
    selector
      ? selector({ selectedAgent: "default" })
      : { selectedAgent: "default" },
  ),
}));
vi.mock("@/api/authHeaders", () => ({
  buildAuthHeaders: () => ({}),
}));
vi.mock("@/api/modules/workspace", () => ({
  workspaceApi: {
    getFileDownloadUrl: (path: string) => `/api/files/${path}`,
    getBinaryFileUrl: (path: string) => `/api/files/${path}`,
    loadFileChunk: vi.fn(),
  },
}));

describe("FilePreview image rendering (A#82584296)", () => {
  const mockBlobUrl = "blob:http://localhost/fake-blob-id";

  beforeEach(() => {
    blobResource.mockReset().mockReturnValue({
      status: "ready",
      url: mockBlobUrl,
      error: null,
      retry: vi.fn(),
    });
  });

  it("renders an <img> element for PNG files after loading", async () => {
    const { container } = render(
      <FilePreview filePath="screenshot.png" content="" workspaceBacked />,
    );

    await waitFor(
      () => {
        const img = container.querySelector("img");
        expect(img).toBeInTheDocument();
        expect(img?.getAttribute("src")).toBe(mockBlobUrl);
      },
      { timeout: LAZY_RENDER_TIMEOUT },
    );
  });

  it("sets alt text from the filename", async () => {
    const { container } = render(
      <FilePreview filePath="photos/vacation.jpg" content="" workspaceBacked />,
    );

    await waitFor(
      () => {
        const img = container.querySelector("img");
        expect(img?.getAttribute("alt")).toBe("vacation.jpg");
      },
      { timeout: LAZY_RENDER_TIMEOUT },
    );
  });

  it("shows error state when blob fetch fails", async () => {
    blobResource.mockReturnValue({
      status: "error",
      url: null,
      error: new Error("404"),
      retry: vi.fn(),
    });

    const { container } = render(
      <FilePreview filePath="missing.png" content="" workspaceBacked />,
    );

    // After fetch fails, should not render an <img>
    await waitFor(
      () => {
        expect(blobResource).toHaveBeenCalled();
        expect(container.querySelector("img")).not.toBeInTheDocument();
      },
      { timeout: LAZY_RENDER_TIMEOUT },
    );
  });
});
