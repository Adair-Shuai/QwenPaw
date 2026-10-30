// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ArtifactsWorkspace from "./ArtifactsWorkspace";
import {
  setResponseArtifactGroup,
  type ResponseArtifactScope,
} from "./responseArtifactRegistry";
import type { FileTarget } from "./types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));
const scope: ResponseArtifactScope = {
  kind: "session",
  agentId: "agent-a",
  sessionId: "session-a",
};

describe("ArtifactsWorkspace session deliveries", () => {
  it("offers loading and retry controls for older result pages", () => {
    const loadMore = vi.fn();
    const props = {
      scope,
      onSelect: vi.fn(),
      hasMore: true,
      onLoadMore: loadMore,
    };
    const { rerender } = render(
      <ArtifactsWorkspace {...props} loading loadingMore />,
    );
    expect(
      screen.getByRole("button", { name: "正在加载历史成果…" }),
    ).toBeDisabled();
    rerender(
      <ArtifactsWorkspace {...props} moreError error="历史成果加载失败" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("历史成果加载失败");
    fireEvent.click(screen.getByRole("button", { name: "重试加载历史成果" }));
    expect(loadMore).toHaveBeenCalledOnce();
  });
  it("shows only explicitly associated session files and preserves root identity", () => {
    const selected: FileTarget = {
      source: "workspace",
      root: "project",
      path: "report.md",
    };
    const workspace: FileTarget = { ...selected, root: "workspace" };
    const cleanup = setResponseArtifactGroup(
      "local-deliveries",
      [workspace],
      scope,
    );
    const other = setResponseArtifactGroup(
      "other-deliveries",
      [{ ...selected, path: "other-chat.md" }],
      { ...scope, sessionId: "session-b" },
    );
    const onSelect = vi.fn();
    try {
      render(
        <ArtifactsWorkspace
          scope={scope}
          persistedArtifacts={[selected]}
          target={selected}
          onSelect={onSelect}
        />,
      );
      const shelf = screen.getByRole("complementary", { name: "会话成果" });
      expect(within(shelf).getAllByRole("button")).toHaveLength(2);
      expect(
        within(shelf).queryByText("other-chat.md"),
      ).not.toBeInTheDocument();
      const projectButton = within(shelf).getByRole("button", {
        pressed: true,
      });
      expect(projectButton).toHaveAttribute("title", "project: report.md");
      fireEvent.click(within(shelf).getByRole("button", { pressed: false }));
      expect(onSelect).toHaveBeenCalledWith(workspace);
    } finally {
      act(cleanup);
      act(other);
    }
  });

  it("does not classify an arbitrary selected file as a delivery", () => {
    render(
      <ArtifactsWorkspace
        scope={scope}
        target={{ source: "workspace", path: "input.md" }}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(
      screen.getByText("本会话生成和交付的文件会显示在这里。"),
    ).toBeInTheDocument();
  });

  it("keeps archived versions distinct and removes the duplicate live path", () => {
    const release = setResponseArtifactGroup(
      "live-report",
      [{ source: "workspace", root: "project", path: "report.md" }],
      scope,
    );
    const archived = (id: string): FileTarget => ({
      source: "artifact",
      root: "project",
      path: "report.md",
      artifact: {
        id,
        source: "tool_call",
        title: "report.md",
        mimeType: "text/markdown",
        meta: {
          finishedAt:
            id === "first" ? "2026-10-29T10:00:00Z" : "2026-10-30T10:00:00Z",
        },
      },
    });
    try {
      render(
        <ArtifactsWorkspace
          scope={scope}
          persistedArtifacts={[archived("first"), archived("second")]}
          onSelect={vi.fn()}
        />,
      );
      expect(screen.getAllByRole("button")).toHaveLength(2);
      expect(
        screen.getByText(new Date("2026-10-29T10:00:00Z").toLocaleString()),
      ).toBeInTheDocument();
      expect(
        screen.getByText(new Date("2026-10-30T10:00:00Z").toLocaleString()),
      ).toBeInTheDocument();
    } finally {
      act(release);
    }
  });

  it("keeps existing results on refresh errors and offers retry", () => {
    const refresh = vi.fn();
    const props = {
      scope,
      persistedArtifacts: [{ source: "workspace" as const, path: "report.md" }],
      onSelect: vi.fn(),
      onRefresh: refresh,
    };
    const { rerender } = render(<ArtifactsWorkspace {...props} loading />);
    expect(screen.getByRole("button", { name: "刷新会话成果" })).toBeDisabled();
    rerender(<ArtifactsWorkspace {...props} error="加载失败，请重试" />);
    expect(
      screen.getByText("report.md", { selector: "span" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("加载失败，请重试");
    fireEvent.click(screen.getByRole("button", { name: "刷新会话成果" }));
    expect(refresh).toHaveBeenCalledOnce();
  });
});
