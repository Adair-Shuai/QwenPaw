import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RendererContext, WorkspaceArtifact } from "../../types";

const {
  useAuthenticatedWorkspaceBlob,
  buildAuthenticatedMediaUrl,
  buildAuthHeaders,
} = vi.hoisted(() => ({
  useAuthenticatedWorkspaceBlob: vi.fn(),
  buildAuthenticatedMediaUrl: vi.fn(
    (url: string, agentId?: string) => `${url}?auth=${agentId}`,
  ),
  buildAuthHeaders: vi.fn((agentId?: string) => ({
    Authorization: "Bearer token",
    "X-Agent-Id": agentId,
  })),
}));

vi.mock("@/hooks/useAuthenticatedWorkspaceBlob", () => ({
  useAuthenticatedWorkspaceBlob,
}));
vi.mock("@/api/authHeaders", () => ({
  buildAuthenticatedMediaUrl,
  buildAuthHeaders,
}));
vi.mock("@/api/modules/workspace", () => ({
  workspaceApi: {
    getBinaryFileUrl: (path: string) => `/api/workspace/binary-files/${path}`,
  },
}));
vi.mock("../LightweightPdfViewer", () => ({
  default: ({
    url,
    headers,
  }: {
    url: string;
    headers?: Record<string, string>;
  }) => (
    <div
      data-testid="pdf-viewer"
      data-url={url}
      data-agent={headers?.["X-Agent-Id"]}
    />
  ),
}));

import ImageRenderer from "../ImageRenderer";
import MediaRenderer from "../MediaRenderer";
import PdfRenderer from "../PdfRenderer";

function makeContext(overrides: Partial<WorkspaceArtifact>): RendererContext {
  return {
    artifact: {
      id: "artifact",
      title: "result.png",
      source: "tool_call",
      mimeType: "image/png",
      workspacePath: "reports/result.png",
      agentId: "agent-b",
      binaryUrl: "/api/workspace/binary-files/reports/result.png",
      ...overrides,
    },
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

describe("authenticated Workspace binary renderers", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useAuthenticatedWorkspaceBlob.mockReturnValue({
      status: "ready",
      url: "blob:authenticated",
      error: null,
      retry: vi.fn(),
    });
    buildAuthenticatedMediaUrl.mockClear();
    buildAuthHeaders.mockClear();
  });

  it("loads images with the Artifact workspace path and Agent", () => {
    render(<ImageRenderer {...makeContext({})} />);

    expect(useAuthenticatedWorkspaceBlob).toHaveBeenCalledWith(
      "reports/result.png",
      "agent-b",
    );
    expect(screen.getByAltText("result.png")).toHaveAttribute(
      "src",
      "blob:authenticated",
    );
  });

  it("passes a stable authenticated Range request to the PDF.js viewer", () => {
    render(
      <PdfRenderer
        {...makeContext({
          title: "report.pdf",
          mimeType: "application/pdf",
          extension: "pdf",
          workspacePath: "reports/report.pdf",
        })}
      />,
    );

    expect(buildAuthHeaders).toHaveBeenCalledWith("agent-b");
    expect(screen.getByTestId("pdf-viewer")).toHaveAttribute(
      "data-url",
      "/api/workspace/binary-files/reports/report.pdf",
    );
    expect(screen.getByTestId("pdf-viewer")).toHaveAttribute(
      "data-agent",
      "agent-b",
    );
  });

  it("shows HTTP errors with retry and download actions", () => {
    const retry = vi.fn();
    const context = makeContext({});
    useAuthenticatedWorkspaceBlob.mockReturnValue({
      status: "error",
      url: null,
      error: new Error("401: Invalid token"),
      retry,
    });

    render(<ImageRenderer {...context} />);
    expect(screen.getByText("401: Invalid token")).toBeInTheDocument();
    fireEvent.click(screen.getByText("重试"));
    fireEvent.click(screen.getByText("下载"));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(context.workspace.download).toHaveBeenCalledWith(context.artifact);
  });

  it.each([
    ["video", "clip.mp4", "video/mp4"],
    ["audio", "clip.mp3", "audio/mpeg"],
  ])(
    "uses an authenticated Range-capable URL for %s",
    (kind, title, mimeType) => {
      const extension = title.split(".").pop();
      const { container } = render(
        <MediaRenderer
          {...makeContext({
            title,
            mimeType,
            extension,
            workspacePath: `media/${title}`,
          })}
        />,
      );

      expect(buildAuthenticatedMediaUrl).toHaveBeenCalledWith(
        `/api/workspace/binary-files/media/${title}`,
        "agent-b",
      );
      const media = container.querySelector(kind);
      expect(media).toHaveAttribute(
        "src",
        `/api/workspace/binary-files/media/${title}?auth=agent-b`,
      );
      expect(media).toHaveAttribute("preload", "metadata");
    },
  );

  it("does not append workspace credentials to an external media URL", () => {
    const { container } = render(
      <MediaRenderer
        {...makeContext({
          title: "external.mp4",
          mimeType: "video/mp4",
          extension: "mp4",
          workspacePath: undefined,
          binaryUrl: "https://example.com/external.mp4",
        })}
      />,
    );

    expect(buildAuthenticatedMediaUrl).not.toHaveBeenCalled();
    expect(container.querySelector("video")).toHaveAttribute(
      "src",
      "https://example.com/external.mp4",
    );
  });
});
