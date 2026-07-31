import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Components } from "react-markdown";
import type { RendererContext, WorkspaceArtifact } from "../../types";

const { loadCodeFile, useAuthenticatedWorkspaceBlob } = vi.hoisted(() => ({
  loadCodeFile: vi.fn(() =>
    Promise.resolve({ path: "data/result.csv", content: "x,y\n1,2" }),
  ),
  useAuthenticatedWorkspaceBlob: vi.fn(() => ({
    status: "ready",
    url: "blob:workspace-image",
    error: null,
    retry: vi.fn(),
  })),
}));

vi.mock("@/api/modules/workspace", () => ({
  workspaceApi: {
    loadCodeFile,
    getBinaryFileUrl: (path: string) => `/binary/${path}`,
  },
}));
vi.mock("@/hooks/useAuthenticatedWorkspaceBlob", () => ({
  useAuthenticatedWorkspaceBlob,
}));
vi.mock("@agentscope-ai/chat", async () => {
  const { default: ReactMarkdown } = await import("react-markdown");
  return {
    Markdown: ({
      content,
      components,
    }: {
      content: string;
      components: Components;
    }) => <ReactMarkdown components={components}>{content}</ReactMarkdown>,
  };
});

import MarkdownRenderer from "../MarkdownRenderer";

function makeContext(): RendererContext {
  const artifact: WorkspaceArtifact = {
    id: "report",
    title: "report.md",
    source: "tool_call",
    mimeType: "text/markdown",
    textContent: "![result](images/result.png)\n\n[data](../data/result.csv)",
    workspacePath: "reports/report.md",
    agentId: "agent-b",
  };
  return {
    artifact,
    readOnly: true,
    theme: "light",
    locale: "zh-CN",
    workspace: {
      updateArtifact: vi.fn(),
      closeTab: vi.fn(),
      openArtifact: vi.fn(),
      download: vi.fn(),
      fullscreen: vi.fn(),
    },
  };
}

describe("MarkdownRenderer workspace resources", () => {
  it("resolves authenticated images and opens relative text artifacts", async () => {
    const context = makeContext();
    render(<MarkdownRenderer {...context} />);

    expect(await screen.findByAltText("result")).toHaveAttribute(
      "src",
      "blob:workspace-image",
    );
    expect(useAuthenticatedWorkspaceBlob).toHaveBeenCalledWith(
      "reports/images/result.png",
      "agent-b",
    );

    fireEvent.click(screen.getByText("data"));
    await waitFor(() =>
      expect(loadCodeFile).toHaveBeenCalledWith("data/result.csv", {
        agentId: "agent-b",
        projectRoot: undefined,
      }),
    );
    expect(context.workspace.openArtifact).toHaveBeenCalledWith(
      expect.objectContaining({
        mimeType: "text/csv",
        workspacePath: "data/result.csv",
        agentId: "agent-b",
        isStreaming: true,
      }),
    );
    expect(context.workspace.updateArtifact).toHaveBeenCalledWith(
      "report:workspace-file:data/result.csv",
      { textContent: "x,y\n1,2", isStreaming: false },
    );
  });
});
