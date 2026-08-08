// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { WorkspaceArtifact } from "../../components/Workspace/types";

vi.mock("../../api/modules/chat", () => ({
  chatApi: {
    filePreviewUrl: (path: string) => `/preview/${path}`,
  },
}));

vi.mock("../../components/Workspace/ArtifactPreview", () => ({
  default: ({ artifact }: { artifact: WorkspaceArtifact }) => (
    <div
      data-testid="artifact"
      data-chat-id={artifact.chatId}
      data-root={artifact.workspaceRoot}
      data-project-dir={artifact.projectDirOverride}
      data-binary-url={artifact.binaryUrl}
    />
  ),
}));

import FilePreview from "./FilePreview";

const imageArtifact: WorkspaceArtifact = {
  id: "generated-image",
  title: "测试图片.png",
  source: "tool_call",
  mimeType: "image/png",
  extension: "png",
  workspacePath: "Documents/文件预览测试/测试图片.png",
};

describe("FilePreview artifact workspace scope", () => {
  it("does not force the project root onto a generated binary artifact", () => {
    render(
      <FilePreview
        filePath={imageArtifact.workspacePath!}
        content=""
        chatId="chat-1"
        projectDirOverride="/Users/lzw/Documents/QwenPaw"
        artifact={imageArtifact}
      />,
    );

    const rendered = screen.getByTestId("artifact");
    expect(rendered).toHaveAttribute("data-chat-id", "chat-1");
    expect(rendered).not.toHaveAttribute("data-root");
    expect(rendered).toHaveAttribute(
      "data-project-dir",
      "/Users/lzw/Documents/QwenPaw",
    );
    expect(rendered).toHaveAttribute(
      "data-binary-url",
      "/preview/Documents/文件预览测试/测试图片.png",
    );
  });

  it("keeps the session project scope for workspace-backed artifacts", () => {
    render(
      <FilePreview
        filePath="assets/测试图片.png"
        content=""
        chatId="chat-1"
        projectDirOverride="/Users/lzw/Documents/QwenPaw"
        workspaceBacked
        artifact={{
          ...imageArtifact,
          workspacePath: "assets/测试图片.png",
        }}
      />,
    );

    const rendered = screen.getByTestId("artifact");
    expect(rendered).toHaveAttribute("data-chat-id", "chat-1");
    expect(rendered).toHaveAttribute("data-root", "project");
    expect(rendered).toHaveAttribute(
      "data-project-dir",
      "/Users/lzw/Documents/QwenPaw",
    );
  });

  it("keeps project scope for inline text artifacts with workspace links", () => {
    render(
      <FilePreview
        filePath="reports/report.md"
        content="# Report"
        chatId="chat-1"
        projectDirOverride="/Users/lzw/Documents/QwenPaw"
        artifact={{
          id: "generated-markdown",
          title: "report.md",
          source: "tool_call",
          mimeType: "text/markdown",
          extension: "md",
          textContent: "# Report",
          workspacePath: "reports/report.md",
        }}
      />,
    );

    const rendered = screen.getByTestId("artifact");
    expect(rendered).toHaveAttribute("data-chat-id", "chat-1");
    expect(rendered).toHaveAttribute("data-root", "project");
    expect(rendered).toHaveAttribute(
      "data-project-dir",
      "/Users/lzw/Documents/QwenPaw",
    );
  });
});
