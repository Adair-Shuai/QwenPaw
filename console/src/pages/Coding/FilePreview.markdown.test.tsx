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

import FilePreview from "./FilePreview";

describe("FilePreview Markdown workspace resources", () => {
  beforeEach(() => {
    useAuthenticatedWorkspaceBlob.mockClear();
    openExternalLink.mockClear();
  });

  it("loads relative images from the Markdown file directory", () => {
    render(
      <FilePreview
        filePath="reports/report.md"
        content="![result](images/result.png)"
      />,
    );

    expect(screen.getByAltText("result")).toHaveAttribute(
      "src",
      "blob:workspace-image",
    );
    expect(useAuthenticatedWorkspaceBlob).toHaveBeenCalledWith(
      "reports/images/result.png",
      "default",
    );
  });

  it("opens relative files through the workspace callback", () => {
    const onOpenWorkspaceFile = vi.fn();
    render(
      <FilePreview
        filePath="reports/report.md"
        content="[data](../data/result.csv)"
        onOpenWorkspaceFile={onOpenWorkspaceFile}
      />,
    );

    fireEvent.click(screen.getByText("data"));
    expect(onOpenWorkspaceFile).toHaveBeenCalledWith("data/result.csv");
  });

  it("keeps external links on the safe external-link path", () => {
    render(
      <FilePreview
        filePath="reports/report.md"
        content="[source](https://example.com/source)"
      />,
    );

    fireEvent.click(screen.getByText("source"));
    expect(openExternalLink).toHaveBeenCalledWith("https://example.com/source");
  });

  it("renders escaping paths as inert text", () => {
    const onOpenWorkspaceFile = vi.fn();
    render(
      <FilePreview
        filePath="reports/report.md"
        content="[secret](../../../etc/passwd)"
        onOpenWorkspaceFile={onOpenWorkspaceFile}
      />,
    );

    expect(screen.getByText("secret").tagName).toBe("SPAN");
    fireEvent.click(screen.getByText("secret"));
    expect(onOpenWorkspaceFile).not.toHaveBeenCalled();
  });
});
