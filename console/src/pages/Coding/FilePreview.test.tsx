import {
  render,
  screen,
  within,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import FilePreview, { getPreviewType, isPreviewable } from "./FilePreview";
// Keep cold module transformation outside the real renderer assertions.
import "../../components/Workspace/renderers/HtmlRenderer";
import { openHtmlFile } from "../../utils/openHtmlFile";
import { rendererRegistry } from "../../components/Workspace/store/rendererRegistry";
import {
  turnFilesApi,
  type TurnFileManifest,
} from "../../api/modules/turnFiles";
import { turnFileTarget } from "../../features/files-workspace/turnFileTarget";

vi.mock("../Chat/sessionApi", () => ({
  default: { getSessionIdentity: (id: string) => ({ sessionId: id }) },
}));

vi.mock("../../utils/openHtmlFile", () => ({
  openHtmlFile: vi.fn(),
}));

const LAZY_RENDER_TIMEOUT = 12_000;
const blobResource = vi.hoisted(() => vi.fn());

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

vi.mock("@/hooks/useAuthenticatedWorkspaceBlob", () => ({
  useAuthenticatedWorkspaceBlob: (...args: unknown[]) => blobResource(...args),
}));

describe("FilePreview renderer isolation", () => {
  const silenceFixtureError = (event: ErrorEvent) => {
    if (
      ["Renderer failed", "Renderer unavailable"].includes(event.error?.message)
    ) {
      event.preventDefault();
    }
  };
  beforeEach(() => window.addEventListener("error", silenceFixtureError));
  afterEach(() => window.removeEventListener("error", silenceFixtureError));
  it("contains renderer failures, exposes original text and recovers for another file", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const registration = rendererRegistry.register({
      id: "test-failing-markdown",
      name: "Failing Markdown",
      mimeTypes: ["text/markdown"],
      priority: 1000,
      component: ({ artifact }) => {
        if (artifact.title === "broken.md") throw new Error("Renderer failed");
        return <div>{artifact.textContent}</div>;
      },
    });
    const original = "# Original source\n\n<script>untrusted()</script>";
    const view = render(
      <FilePreview filePath="broken.md" content={original} />,
    );
    try {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      fireEvent.click(
        screen.getByRole("button", {
          name: /showOriginalText|查看原始文本/i,
        }),
      );
      expect(view.container.querySelector("pre")?.textContent).toBe(original);
      expect(view.container.querySelector("script")).not.toBeInTheDocument();

      view.rerender(
        <FilePreview filePath="healthy.md" content="Another file is usable" />,
      );
      expect(
        await screen.findByText("Another file is usable"),
      ).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    } finally {
      view.unmount();
      registration.dispose();
    }
  });

  it("retries a failed renderer without replacing the current file", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    let available = false;
    const registration = rendererRegistry.register({
      id: "test-retry-markdown",
      name: "Retry Markdown",
      mimeTypes: ["text/markdown"],
      priority: 1000,
      component: ({ artifact }) => {
        if (!available) throw new Error("Renderer unavailable");
        return <div>{artifact.textContent}</div>;
      },
    });
    const view = render(
      <FilePreview filePath="retry.md" content="Recovered original content" />,
    );
    try {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      available = true;
      fireEvent.click(screen.getByRole("button", { name: /retry|重试/i }));
      expect(
        await screen.findByText("Recovered original content"),
      ).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    } finally {
      view.unmount();
      registration.dispose();
    }
  });
});

vi.mock("../../utils/openExternalLink", () => ({
  openExternalLink: vi.fn(),
}));

describe("FilePreview", () => {
  it.each([
    '"memory_tags": [Orion, Vega]',
    "'memory_tags': [Orion, Vega]",
    "defaults: &defaults\n  memory_tags: [Orion, Vega]\n<<: *defaults",
    "memory_tags: [Old]\nmemory_tags: [Orion, Vega]",
  ])(
    "renders one clickable tag row from resolved YAML: %s",
    async (frontmatter) => {
      const onTagClick = vi.fn();
      render(
        <FilePreview
          filePath="memory.md"
          content={`---\n${frontmatter}\n---\nBody`}
          onMemoryTagClick={onTagClick}
        />,
      );
      const tags = await screen.findAllByRole(
        "button",
        {},
        { timeout: LAZY_RENDER_TIMEOUT },
      );
      expect(tags.map((tag) => tag.textContent)).toEqual(["Orion", "Vega"]);
      fireEvent.click(tags[0]);
      expect(onTagClick).toHaveBeenCalledExactlyOnceWith("Orion");
    },
  );
  it("renders individual tags and sends the clicked tag to the workspace", async () => {
    const onTagClick = vi.fn();
    render(
      <FilePreview
        filePath="memory.md"
        content={'---\nmemory_tags: ["赵六", "Orion"]\n---\n# Memory'}
        onMemoryTagClick={onTagClick}
      />,
    );
    const tag = await screen.findByText(
      "Orion",
      {},
      { timeout: LAZY_RENDER_TIMEOUT },
    );
    expect(tag.tagName).toBe("BUTTON");
    fireEvent.click(tag);
    expect(onTagClick).toHaveBeenCalledExactlyOnceWith("Orion");
    expect(screen.getByRole("heading", { name: "Memory" })).toBeInTheDocument();
  });

  it("keeps tags readable without a memory navigation context", async () => {
    render(
      <FilePreview
        filePath="attachment.md"
        content={"---\nmemory_tags: [Orion]\n---\nText"}
      />,
    );
    expect(
      (await screen.findByText("Orion", {}, { timeout: LAZY_RENDER_TIMEOUT }))
        .tagName,
    ).toBe("SPAN");
  });

  it("shows memory tags written as a YAML block list", async () => {
    render(
      <FilePreview
        filePath="memory.md"
        content={
          "---\nmemory_tags:\n- 赵六\n- 上海示例科技有限公司\n---\n# Memory"
        }
      />,
    );
    const frontmatter = await screen.findByLabelText(
      "Front matter",
      {},
      { timeout: LAZY_RENDER_TIMEOUT },
    );
    expect(frontmatter).toHaveTextContent("赵六");
    expect(frontmatter).toHaveTextContent("上海示例科技有限公司");
  });

  it("keeps math code blocks in the renderable code block controls", async () => {
    const { container } = render(
      <FilePreview
        filePath="formula.md"
        content={["```math", "x^2 + y^2 = z^2", "```"].join("\n")}
      />,
    );

    const tabs = await screen.findAllByRole(
      "tab",
      { hidden: true },
      { timeout: LAZY_RENDER_TIMEOUT },
    );
    expect(tabs).toHaveLength(2);
    expect(screen.getByLabelText("common.copy")).toBeInTheDocument();
    expect(screen.getByLabelText("common.download")).toBeInTheDocument();
    expect(container.querySelector(".katex")).toBeInTheDocument();

    fireEvent.click(tabs[1]);
    expect(screen.getByRole("tabpanel", { hidden: true })).toHaveTextContent(
      "x^2 + y^2 = z^2",
    );
    fireEvent.click(tabs[0]);
    expect(container.querySelector(".katex")).toBeInTheDocument();
  });

  it("renders inline and display math through the registered Markdown renderer", async () => {
    const { container } = render(
      <FilePreview
        filePath="research.md"
        content={"Inline $x^2$.\n\n$$\n\\int_0^1 x^2 dx\n$$"}
      />,
    );
    await waitFor(
      () => expect(container.querySelectorAll(".katex")).toHaveLength(2),
      { timeout: LAZY_RENDER_TIMEOUT },
    );
    expect(container.querySelector(".katex-display")).toBeInTheDocument();
    expect(container.querySelectorAll("math")).toHaveLength(2);
    expect(container.querySelector(".katex-error")).not.toBeInTheDocument();
  });

  it("copies and downloads the original fenced code from Markdown preview", async () => {
    const source = "const answer = 42;\n";
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("isSecureContext", true);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:markdown-source");
    const downloads: Array<{ href: string; filename: string }> = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push({ href: this.href, filename: this.download });
    });
    const { container } = render(
      <FilePreview
        filePath="example.md"
        content={`\`\`\`typescript\n${source}\`\`\``}
      />,
    );
    const copy = await screen.findByRole(
      "button",
      { name: "common.copy" },
      { timeout: LAZY_RENDER_TIMEOUT },
    );
    expect(
      container.querySelector('[data-language="typescript"]'),
    ).toHaveTextContent("const answer = 42;");
    fireEvent.click(copy);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(source));
    fireEvent.click(screen.getByRole("button", { name: "common.download" }));
    expect(downloads).toEqual([
      { href: "blob:markdown-source", filename: "block.ts" },
    ]);
    const downloadedSource = createObjectURL.mock.calls[0][0] as Blob;
    expect(await downloadedSource.text()).toBe(source);
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

// The fork's unified renderer already executes interactive HTML inside an
// opaque-origin sandbox. Keep it while adding upstream's external opener.
describe("FilePreview interactive HTML", () => {
  const dynamicContent = '<div id="root"></div><script>draw()</script>';

  it("resolves scoped sibling stylesheets without giving credentials to HTML", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(".app { display: grid; color: green }"));
    vi.stubGlobal("fetch", fetcher);
    render(
      <FilePreview
        filePath="designs/chat/index.html"
        chatId="chat-design"
        root="workspace"
        workspaceBacked
        content={
          '<!doctype html><html><head><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="https://example.org/theme.css"></head><body><div class="app">Styled</div></body></html>'
        }
      />,
    );
    const frame = await screen.findByTitle(
      "index.html",
      {},
      { timeout: LAZY_RENDER_TIMEOUT },
    );
    const doc = new DOMParser().parseFromString(
      frame.getAttribute("srcdoc")!,
      "text/html",
    );
    const local = doc.querySelector("link")!.getAttribute("href")!;
    expect(local).toMatch(/^data:text\/css/);
    expect(atob(local.split(",")[1])).toContain("display: grid");
    expect(doc.querySelectorAll("link")[1].getAttribute("href")).toBe(
      "https://example.org/theme.css",
    );
    expect(fetcher).toHaveBeenCalledOnce();
    expect(String(fetcher.mock.calls[0][0])).toBe(
      "/api/files/designs/chat/styles.css",
    );
    expect(fetcher.mock.calls[0][1].headers).toMatchObject({
      "X-Chat-Id": "chat-design",
    });
    expect(frame).toHaveAttribute("sandbox", "allow-scripts");
    expect(frame.getAttribute("srcdoc")).not.toContain("token=");
  });

  it("does not read nonasset local dependencies requested by HTML", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    render(
      <FilePreview
        filePath="design/index.html"
        root="workspace"
        workspaceBacked
        content={
          '<link rel="stylesheet" href="config.json"><img src="../.env"><script src="secret.py"></script>'
        }
      />,
    );
    const frame = await screen.findByTitle(
      "index.html",
      {},
      { timeout: LAZY_RENDER_TIMEOUT },
    );
    expect(frame).toHaveAttribute("sandbox", "allow-scripts");
    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("config.json");
    expect(screen.getByRole("status")).toHaveTextContent(".env");
    expect(screen.getByRole("status")).toHaveTextContent("secret.py");
  });

  it.each([true, false])(
    "keeps archived HTML dependencies immutable when captured=%s",
    async (available) => {
      const scope = {
        kind: "session" as const,
        agentId: "owner",
        sessionId: "runtime",
        chatId: "chat",
      };
      const html = {
        id: "html",
        name: "index.html",
        path: "design/index.html",
        root: "workspace" as const,
        status: "created" as const,
        delivered: true,
        size: 80,
        binary: false,
        before_available: false,
        after_available: true,
      };
      const turn: TurnFileManifest = {
        id: "saved-turn",
        session_id: "runtime",
        agent_id: "owner",
        status: "completed",
        started_at: "2026-11-01",
        incomplete: !available,
        overlap: false,
        warnings: [],
        files: [
          html,
          {
            ...html,
            id: "css",
            name: "styles.css",
            path: "design/styles.css",
            delivered: false,
            after_available: available,
          },
        ],
      };
      vi.spyOn(turnFilesApi, "get").mockResolvedValue(turn);
      const fetcher = vi
        .fn()
        .mockResolvedValue(new Response("body { color: purple }"));
      vi.stubGlobal("fetch", fetcher);
      const target = turnFileTarget(scope, turn, html);
      render(
        <FilePreview
          filePath={html.path}
          content={'<link rel="stylesheet" href="styles.css"><h1>Archived</h1>'}
          artifact={target.artifact}
        />,
      );
      const frame = await screen.findByTitle(
        "index.html",
        {},
        { timeout: LAZY_RENDER_TIMEOUT },
      );
      expect(frame).toHaveAttribute("sandbox", "allow-scripts");
      if (available) {
        expect(fetcher).toHaveBeenCalledOnce();
        expect(String(fetcher.mock.calls[0][0])).toContain(
          "saved-turn/files/css",
        );
        expect(fetcher.mock.calls[0][1].headers).toMatchObject({
          "X-Agent-Id": "owner",
          "X-Chat-Id": "chat",
        });
        const href = new DOMParser()
          .parseFromString(frame.getAttribute("srcdoc")!, "text/html")
          .querySelector("link")!
          .getAttribute("href")!;
        expect(atob(href.split(",")[1])).toContain("purple");
      } else {
        expect(fetcher).not.toHaveBeenCalled();
        expect(screen.getByRole("status")).toHaveTextContent(
          "部分页面资源无法加载",
        );
        expect(frame.getAttribute("srcdoc")).toContain('href="data:text/css,"');
      }
    },
  );

  it.each(["scene.html", "scene.htm"])(
    "preserves script-generated %s in the unified renderer",
    async (filePath) => {
      render(<FilePreview filePath={filePath} content={dynamicContent} />);
      const frame = await screen.findByTitle(
        filePath,
        {},
        { timeout: LAZY_RENDER_TIMEOUT },
      );
      expect(frame).toHaveAttribute("sandbox", "allow-scripts");
      expect(frame.getAttribute("srcdoc")).toContain("<script>draw()</script>");
      expect(frame.getAttribute("srcdoc")).toContain("makeStorage");
      expect(
        screen.getByRole("button", { name: "files.openHtmlInBrowser" }),
      ).toBeInTheDocument();
    },
  );

  it("opens original HTML with the workspace context", async () => {
    const options = {
      filePath: "scene.html",
      content: dynamicContent,
      chatId: "chat-1",
      projectDirOverride: "/project",
      root: "workspace" as const,
      workspaceBacked: true,
    };
    render(<FilePreview {...options} />);
    fireEvent.click(
      screen.getByRole("button", { name: "files.openHtmlInBrowser" }),
    );
    expect(openHtmlFile).toHaveBeenCalledWith(expect.objectContaining(options));
    expect(openHtmlFile).toHaveBeenCalledWith(
      expect.objectContaining({
        artifact: expect.objectContaining({ workspacePath: "scene.html" }),
      }),
    );
  });

  it("updates HTML without losing interactive controls", async () => {
    const { rerender } = render(
      <FilePreview filePath="scene.html" content="<h1>Static</h1>" />,
    );
    expect(
      (await screen.findByTitle("scene.html")).getAttribute("srcdoc"),
    ).toContain("Static");
    rerender(<FilePreview filePath="scene.html" content={dynamicContent} />);
    await waitFor(() =>
      expect(screen.getByTitle("scene.html").getAttribute("srcdoc")).toContain(
        "draw()",
      ),
    );
    expect(screen.getByTitle("scene.html")).toHaveAttribute(
      "sandbox",
      "allow-scripts",
    );
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
  useAgentStore: vi.fn(
    (selector?: (state: { selectedAgent: string }) => unknown) =>
      selector
        ? selector({ selectedAgent: "default" })
        : { selectedAgent: "default" },
  ),
}));

vi.mock("@/api/modules/workspace", () => ({
  workspaceApi: {
    getFileDownloadUrl: vi.fn((path: string) => `/api/files/${path}`),
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

  it("renders ICO through the registered image renderer after authenticated loading", async () => {
    render(
      <FilePreview
        filePath="assets/favicon.ico"
        content=""
        workspaceBacked
        chatId="icon-chat"
        root="workspace"
      />,
    );
    const img = await screen.findByAltText(
      "favicon.ico",
      {},
      { timeout: LAZY_RENDER_TIMEOUT },
    );
    expect(img).toHaveAttribute("src", mockBlobUrl);
    expect(blobResource).toHaveBeenCalledWith(
      "assets/favicon.ico",
      expect.objectContaining({ chatId: "icon-chat", root: "workspace" }),
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
