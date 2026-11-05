import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import FilePreview from "./FilePreview";
import { resolveMarkdownFilePath } from "./markdownFileReferences";
import { workspaceApi } from "../../api/modules/workspace";
import { openExternalLink } from "../../utils/openExternalLink";

vi.mock("../../stores/agentStore", () => ({
  useAgentStore: (selector: (state: { selectedAgent: string }) => unknown) =>
    selector({ selectedAgent: "default" }),
}));
vi.mock("../../api/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api/config")>()),
  getApiToken: () => "test-token",
}));
vi.mock("../../api/modules/workspace", () => ({
  workspaceApi: {
    getFileDownloadUrl: vi.fn((path: string) => `/api/files/${path}`),
    getBinaryFileUrl: vi.fn((path: string) => `/api/files/${path}`),
    loadFileText: vi.fn().mockResolvedValue({ content: "# Linked document" }),
  },
}));
vi.mock("../../utils/openExternalLink", () => ({
  openExternalLink: vi.fn(),
  isDesktopTauriRuntime: () => false,
}));

describe("Markdown document-relative paths (#8528)", () => {
  beforeEach(() => vi.clearAllMocks());
  it.each([
    ["docs/a.md", "./b.md", "docs/b.md"],
    ["docs/a.md", "b.md", "docs/b.md"],
    ["docs/nested/a.md", "../b.md", "docs/b.md"],
    ["a.md", "./b.md", "b.md"],
    ["docs\\nested\\a.md", "..\\b.md", "docs/b.md"],
    ["docs/a.md", "./%E5%9B%BE%20%E7%89%87.png", "docs/图 片.png"],
    ["docs/a.md", "./b.md?raw=1#section", "docs/b.md"],
  ])("resolves %s + %s to %s", (filePath, href, expected) => {
    expect(resolveMarkdownFilePath(filePath, href)).toBe(expected);
  });

  it.each([
    "https://example.com/b.md",
    "mailto:team@example.com",
    "/docs/b.md",
    "//example.com/image.png",
    "#section",
    "?raw=1",
    "./invalid%name.md",
    "../../b.md",
  ])("does not resolve %s as a document-relative file", (href) => {
    expect(resolveMarkdownFilePath("docs/a.md", href)).toBeNull();
  });

  it("opens both relative link forms in the current file preview", async () => {
    const onOpenFile = vi.fn();
    render(
      <FilePreview
        filePath="docs/a.md"
        content={"[dot](./b.md)\n\n[bare](b.md)"}
        root="workspace"
        workspaceBacked
        onOpenFile={onOpenFile}
      />,
    );

    await screen.findByRole("link", { name: "dot" }, { timeout: 12_000 });
    for (const name of ["dot", "bare"]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", "/api/files/docs/b.md");
      fireEvent.click(link);
    }
    expect(onOpenFile.mock.calls).toEqual([["docs/b.md"], ["docs/b.md"]]);
    expect(workspaceApi.getFileDownloadUrl).toHaveBeenCalledWith(
      "docs/b.md",
      "workspace",
    );
  });

  it("retains non-relative URLs and the external link opener", async () => {
    const onOpenFile = vi.fn();
    render(
      <FilePreview
        filePath="docs/a.md"
        content={
          "[external](https://example.com)\n\n[absolute](/docs/b.md)\n\n" +
          "[anchor](#section)\n\n[query](?raw=1)"
        }
        workspaceBacked
        onOpenFile={onOpenFile}
      />,
    );
    await screen.findByRole("link", { name: "absolute" }, { timeout: 12_000 });
    expect(screen.getByRole("link", { name: "absolute" })).toHaveAttribute(
      "href",
      "/api/files/docs/b.md",
    );
    expect(screen.getByRole("link", { name: "anchor" })).toHaveAttribute(
      "href",
      "#section",
    );
    expect(screen.getByRole("link", { name: "query" })).toHaveAttribute(
      "href",
      "?raw=1",
    );
    fireEvent.click(screen.getByRole("link", { name: "external" }));
    expect(openExternalLink).toHaveBeenCalledWith("https://example.com");
    expect(onOpenFile).not.toHaveBeenCalled();
  });

  it("does not reinterpret historical artifact paths as workspace files", async () => {
    const onOpenFile = vi.fn();
    render(
      <FilePreview
        filePath="docs/a.md"
        content="[next](./b.md)"
        binaryUrl="/api/files/preview/historical/a.md"
        workspaceBacked
        onOpenFile={onOpenFile}
      />,
    );
    fireEvent.click(
      await screen.findByRole("link", { name: "next" }, { timeout: 12_000 }),
    );
    expect(onOpenFile).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "next" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(workspaceApi.loadFileText).not.toHaveBeenCalled();
  });
});

describe("Markdown relative images (#8528)", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let nextBlob: number;

  beforeEach(() => {
    vi.clearAllMocks();
    nextBlob = 0;
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["image"], { type: "image/png" }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    vi.spyOn(URL, "createObjectURL").mockImplementation(
      () => `blob:markdown-image-${++nextBlob}`,
    );
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each([
    "![diagram](./image.png)\n\n[next](./b.md)",
    "[![diagram](./image.png)](./b.md)",
  ])(
    "keeps loaded images when the link callback changes: %s",
    async (content) => {
      const firstOpenFile = vi.fn();
      const nextOpenFile = vi.fn();
      const { rerender } = render(
        <FilePreview
          filePath="docs/a.md"
          content={content}
          workspaceBacked
          onOpenFile={firstOpenFile}
        />,
      );
      await waitFor(() =>
        expect(screen.getByRole("img", { name: "diagram" })).toHaveAttribute(
          "src",
          "blob:markdown-image-1",
        ),
      );
      const image = screen.getByRole("img", { name: "diagram" });
      const signal = fetchSpy.mock.calls[0][1].signal;

      rerender(
        <FilePreview
          filePath="docs/a.md"
          content={content}
          workspaceBacked
          onOpenFile={nextOpenFile}
        />,
      );

      expect(fetchSpy).toHaveBeenCalledOnce();
      expect(screen.getByRole("img", { name: "diagram" })).toBe(image);
      expect(image).toHaveAttribute("src", "blob:markdown-image-1");
      expect(signal.aborted).toBe(false);
      expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(
        "blob:markdown-image-1",
      );
      fireEvent.click(screen.getByRole("link"));
      expect(nextOpenFile).toHaveBeenCalledExactlyOnceWith("docs/b.md");
      expect(firstOpenFile).not.toHaveBeenCalled();
    },
  );

  it("loads relative images with the file's root and chat headers", async () => {
    render(
      <FilePreview
        filePath="docs/a.md"
        content={'![diagram](./image.png "Diagram")'}
        root="project:/secondary"
        chatId="chat-1"
        projectDirOverride="/ignored-with-chat"
        workspaceBacked
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("img", { name: "diagram" })).toHaveAttribute(
        "src",
        "blob:markdown-image-1",
      ),
    );
    expect(workspaceApi.getFileDownloadUrl).toHaveBeenCalledWith(
      "docs/image.png",
      "project:/secondary",
    );
    expect(fetchSpy).toHaveBeenCalledWith("/api/files/docs/image.png", {
      headers: {
        Authorization: "Bearer test-token",
        "X-Agent-Id": "default",
        "X-Chat-Id": "chat-1",
      },
      signal: expect.any(AbortSignal),
    });
    expect(screen.getByRole("img", { name: "diagram" })).toHaveAttribute(
      "title",
      "Diagram",
    );
  });

  it("carries a pending chat's project directory when no chat ID exists", async () => {
    render(
      <FilePreview
        filePath="docs/a.md"
        content="![diagram](./image.png)"
        projectDirOverride={"C:\\Projects\\demo"}
        workspaceBacked
      />,
    );
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    expect(fetchSpy.mock.calls[0][1].headers).toEqual({
      Authorization: "Bearer test-token",
      "X-Agent-Id": "default",
      "X-Session-Project-Dir": "C:\\Projects\\demo",
    });
  });

  it("releases image blobs and cancels requests on replacement and unmount", async () => {
    const { rerender, unmount } = render(
      <FilePreview
        filePath="docs/a.md"
        content="![diagram](./first.png)"
        workspaceBacked
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "blob:markdown-image-1",
      ),
    );
    const firstSignal = fetchSpy.mock.calls[0][1].signal;
    rerender(
      <FilePreview
        filePath="docs/a.md"
        content="![diagram](./second.png)"
        workspaceBacked
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "blob:markdown-image-2",
      ),
    );
    expect(firstSignal.aborted).toBe(true);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:markdown-image-1");
    unmount();
    expect(fetchSpy.mock.calls[1][1].signal.aborted).toBe(true);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:markdown-image-2");
  });

  it("keeps remote images external and scopes root-relative workspace images", async () => {
    render(
      <FilePreview
        filePath="docs/a.md"
        content="![remote](https://example.com/image.png)\n\n![site](/image.png)"
        workspaceBacked
      />,
    );
    await screen.findByRole("img", { name: "site" }, { timeout: 12_000 });
    await waitFor(() =>
      expect(screen.getByRole("img", { name: "site" })).toHaveAttribute(
        "src",
        "blob:markdown-image-1",
      ),
    );
    expect(screen.getByRole("img", { name: "remote" })).toHaveAttribute(
      "src",
      "https://example.com/image.png",
    );
    expect(screen.getByRole("img", { name: "site" })).toHaveAttribute(
      "src",
      "blob:markdown-image-1",
    );
    expect(workspaceApi.getFileDownloadUrl).toHaveBeenCalledWith(
      "image.png",
      "project",
    );
    expect(fetchSpy).toHaveBeenCalledOnce();
  });
});
