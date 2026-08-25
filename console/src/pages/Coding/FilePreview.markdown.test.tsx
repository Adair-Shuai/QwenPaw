import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const useAuthenticatedWorkspaceBlob = vi.fn<
  (
    filePath: string | null,
    agentId?: string,
  ) => {
    status: "ready";
    url: string;
    error: null;
    retry: () => void;
  }
>(() => ({
  status: "ready",
  url: "blob:workspace-image",
  error: null,
  retry: vi.fn(),
}));
const openExternalLink = vi.fn();

vi.mock("@/hooks/useAuthenticatedWorkspaceBlob", () => ({
  useAuthenticatedWorkspaceBlob: (filePath: string | null, agentId?: string) =>
    useAuthenticatedWorkspaceBlob(filePath, agentId),
}));
vi.mock("@/utils/openExternalLink", () => ({
  openExternalLink: (href: string) => openExternalLink(href),
}));

import "../../components/Workspace/renderers/MarkdownRenderer";
import FilePreview from "./FilePreview";

const LAZY_RENDER_TIMEOUT = 12_000;

describe("FilePreview Markdown workspace resources", () => {
  beforeEach(() => {
    useAuthenticatedWorkspaceBlob.mockClear();
    openExternalLink.mockClear();
  });

  it("loads relative images from the Markdown file directory", async () => {
    render(
      <FilePreview
        filePath="reports/report.md"
        content="![result](images/result.png)"
      />,
    );

    expect(
      await screen.findByAltText(
        "result",
        {},
        { timeout: LAZY_RENDER_TIMEOUT },
      ),
    ).toHaveAttribute(
      "src",
      "blob:workspace-image",
    );
    expect(useAuthenticatedWorkspaceBlob).toHaveBeenCalledWith(
      "reports/images/result.png",
      "default",
    );
  });

  it("opens relative files through the workspace callback", async () => {
    const onOpenWorkspaceFile = vi.fn();
    render(
      <FilePreview
        filePath="reports/report.md"
        content="[data](../data/result.csv)"
        onOpenWorkspaceFile={onOpenWorkspaceFile}
      />,
    );

    fireEvent.click(
      await screen.findByText("data", {}, { timeout: LAZY_RENDER_TIMEOUT }),
    );
    expect(onOpenWorkspaceFile).toHaveBeenCalledWith("data/result.csv");
  });

  it("keeps external links on the safe external-link path", async () => {
    render(
      <FilePreview
        filePath="reports/report.md"
        content="[source](https://example.com/source)"
      />,
    );

    fireEvent.click(
      await screen.findByText("source", {}, { timeout: LAZY_RENDER_TIMEOUT }),
    );
    expect(openExternalLink).toHaveBeenCalledWith("https://example.com/source");
  });

  it("renders escaping paths as inert text", async () => {
    const onOpenWorkspaceFile = vi.fn();
    render(
      <FilePreview
        filePath="reports/report.md"
        content="[secret](../../../etc/passwd)"
        onOpenWorkspaceFile={onOpenWorkspaceFile}
      />,
    );

    const secret = await screen.findByText(
      "secret",
      {},
      { timeout: LAZY_RENDER_TIMEOUT },
    );
    expect(secret.tagName).toBe("SPAN");
    fireEvent.click(secret);
    expect(onOpenWorkspaceFile).not.toHaveBeenCalled();
  });
});
