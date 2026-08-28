import { renderWithProviders } from "@/test/common_setup";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FilesDrawer from "./FilesDrawer";

interface CapturedWorkspaceProps {
  compact?: boolean;
  initialTarget?: { path: string; source?: string };
  scope?: { agentId: string; chatId?: string; sessionId: string };
  onExpand?: () => void;
  onClose?: () => void;
}

const workspaceProps = vi.hoisted(() => ({
  current: null as CapturedWorkspaceProps | null,
}));

vi.mock("../../api/modules/workspace", () => ({
  workspaceApi: {
    getFileMetadata: vi.fn().mockResolvedValue({
      path: "hello.txt",
      size: 5,
      modified_at: "",
      preview_kind: "text",
      etag: "etag",
    }),
    loadFileText: vi.fn().mockResolvedValue({
      content: "hello",
      etag: "etag",
    }),
  },
}));

vi.mock("./FilesWorkspace", () => ({
  default: (props: CapturedWorkspaceProps) => {
    workspaceProps.current = props;
    return <div data-testid="files-workspace" />;
  },
}));

describe("FilesDrawer", () => {
  afterEach(() => {
    workspaceProps.current = null;
    vi.unstubAllGlobals();
  });

  it("does not repeat the Workspace label in the expanded header", async () => {
    renderWithProviders(
      <FilesDrawer
        state={{
          kind: "workspace",
          target: {
            source: "workspace",
            path: "hello.txt",
            root: "project",
          },
          trigger: null,
        }}
        dispatch={vi.fn()}
        scope={{
          kind: "session",
          agentId: "default",
          sessionId: "session-1",
        }}
      />,
    );

    expect(await screen.findByTestId("files-workspace")).toBeInTheDocument();
    expect(
      screen.queryByText((content) =>
        ["工作区", "Workspace", "files.workspace"].includes(content),
      ),
    ).not.toBeInTheDocument();
  });

  it("renders Preview as the compact shared workspace", async () => {
    const dispatch = vi.fn();
    renderWithProviders(
      <>
        <div className="sender">
          <textarea />
        </div>
        <FilesDrawer
          state={{
            kind: "preview",
            target: {
              source: "workspace",
              path: "hello.txt",
              root: "project",
            },
            trigger: null,
          }}
          dispatch={dispatch}
          scope={{
            kind: "session",
            agentId: "default",
            sessionId: "session-1",
          }}
        />
      </>,
    );

    await screen.findByTestId("files-workspace");
    expect(workspaceProps.current).toMatchObject({
      compact: true,
      initialTarget: { path: "hello.txt" },
    });
    expect(workspaceProps.current?.onExpand).toBeUndefined();
    expect(typeof workspaceProps.current?.onClose).toBe("function");
    expect(dispatch).not.toHaveBeenCalledWith({ type: "CLOSE" });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("keeps an opened workspace as the same preview-only Chat pane", async () => {
    renderWithProviders(
      <FilesDrawer
        state={{
          kind: "workspace",
          target: {
            source: "workspace",
            path: "hello.txt",
            root: "project",
          },
          trigger: null,
        }}
        dispatch={vi.fn()}
        scope={{
          kind: "session",
          agentId: "default",
          sessionId: "session-1",
        }}
      />,
    );

    await screen.findByTestId("files-workspace");
    expect(workspaceProps.current).toMatchObject({
      compact: true,
      initialTarget: { path: "hello.txt" },
    });
    expect(workspaceProps.current?.onExpand).toBeUndefined();
    expect(screen.getByRole("region").className).toContain("drawerPreview");
  });

  it("keeps pointer resizing direct until the gesture ends", async () => {
    renderWithProviders(
      <FilesDrawer
        state={{
          kind: "workspace",
          trigger: null,
        }}
        dispatch={vi.fn()}
        scope={{
          kind: "session",
          agentId: "default",
          sessionId: "session-1",
        }}
      />,
    );

    const drawer = screen.getByRole("region");
    const separator = screen.getByRole("separator");
    fireEvent.pointerDown(separator, { clientX: 420 });
    expect(drawer.className).toContain("drawerResizing");

    fireEvent.pointerMove(window, { clientX: 520 });
    fireEvent.pointerUp(window);
    await waitFor(() => {
      expect(drawer.className).not.toContain("drawerResizing");
    });
  });

  it("delegates attachment loading to the shared Session workspace", async () => {
    renderWithProviders(
      <FilesDrawer
        state={{
          kind: "preview",
          target: {
            source: "attachment",
            path: "reports/report.md",
            artifactUrl: "/api/files/preview/reports/report.md",
          },
          trigger: null,
        }}
        dispatch={vi.fn()}
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
          chatId: "chat-a",
        }}
      />,
    );

    await screen.findByTestId("files-workspace");
    expect(workspaceProps.current).toMatchObject({
      compact: true,
      scope: {
        agentId: "agent-a",
        chatId: "chat-a",
        sessionId: "session-a",
      },
      initialTarget: {
        source: "attachment",
        path: "reports/report.md",
      },
    });
  });

  it("routes an explicit visualization target into the GenUI workbench", async () => {
    renderWithProviders(
      <FilesDrawer
        state={{
          kind: "preview",
          target: {
            source: "workspace",
            path: "models/SMOKE.DATA",
            root: "project",
            preferredView: "visualization",
          },
          trigger: null,
        }}
        dispatch={vi.fn()}
        scope={{
          kind: "session",
          agentId: "default",
          sessionId: "session-1",
          chatId: "chat-1",
        }}
      />,
    );

    expect(await screen.findByText("三维网格预览")).toBeInTheDocument();
    expect(screen.getByText("SMOKE.DATA")).toBeInTheDocument();
  });

  it("opens the dedicated computation track from its activity button", async () => {
    renderWithProviders(
      <FilesDrawer
        state={{ kind: "workspace", trigger: null }}
        dispatch={vi.fn()}
        scope={{ kind: "session", agentId: "default", sessionId: "session-1" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "计算轨道" }));
    expect(
      screen.getByText("暂无推导记录。运行 UGSci 公式后可在此查看。"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "计算轨道" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("accepts the plugin event that selects the computation track", async () => {
    renderWithProviders(
      <FilesDrawer
        state={{ kind: "workspace", trigger: null }}
        dispatch={vi.fn()}
        scope={{ kind: "session", agentId: "default", sessionId: "session-1" }}
      />,
    );

    window.dispatchEvent(
      new CustomEvent("qwenpaw:select-workbench-mode", {
        detail: { mode: "compute" },
      }),
    );
    expect(
      await screen.findByText("暂无推导记录。运行 UGSci 公式后可在此查看。"),
    ).toBeInTheDocument();
  });
});
