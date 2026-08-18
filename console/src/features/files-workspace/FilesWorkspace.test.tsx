import { act, render, screen, waitFor } from "@testing-library/react";
import { message } from "antd";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FilesWorkspace from "./FilesWorkspace";
import { notifyProjectDirectoryChanged } from "../project-directory/projectDirectoryChangeEvent";
import { UPDATE_FILE_PREVIEW_EVENT } from "./openFilePreview";

type ConfirmSaveOptions = {
  onOk?: () => unknown;
  onCancel?: () => void;
  content?: {
    props?: {
      onChange?: (event: { target: { value: string } }) => void;
    };
  };
};

const lifecycle = vi.hoisted(() => ({
  clearProjectTabs: vi.fn(),
  closeTab: vi.fn(),
  editorMounted: vi.fn(),
  editorUnmounted: vi.fn(),
  navigatorMounted: vi.fn(),
  navigatorUnmounted: vi.fn(),
  navigatorProps: null as {
    onShowMemoryGraph: (root: "wiki" | "procedure" | "personal") => void;
    onShowFiles: () => void;
  } | null,
  memoryGraphProps: null as {
    onOpenFile: (section: "daily" | "digest", path: string) => void;
  } | null,
  openTab: vi.fn(),
  saveFileContent: vi.fn(),
  setTabContent: vi.fn(),
  setTabEtag: vi.fn(),
  setActiveTab: vi.fn(),
  tabs: [] as Array<{
    path: string;
    displayPath?: string;
    content: string;
    dirty: boolean;
    source?: "workspace" | "artifact";
    etag?: string;
  }>,
  activeTabPath: "",
  editorProps: null as {
    onCloseOtherTabs: (path: string) => void;
    onTabClose?: (path: string) => void;
    onSaveFile: (path: string, content: string) => Promise<void>;
  } | null,
  confirmSave: vi.fn((options: ConfirmSaveOptions) => {
    void options.onOk?.();
  }),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    message: {
      ...actual.message,
      success: vi.fn(),
      error: vi.fn(),
    },
    Modal: {
      ...actual.Modal,
      confirm: (options: ConfirmSaveOptions) => lifecycle.confirmSave(options),
    },
  };
});

vi.mock("../../stores/codingModeStore", () => ({
  useCodingMode: () => ({ codingMode: false }),
}));

vi.mock("../../stores/codingTabsStore", () => ({
  useTabsForScope: () => lifecycle.tabs,
  useActiveTabPathForScope: () => lifecycle.activeTabPath,
  useCodingTabsStore: () => ({
    clearProjectTabs: lifecycle.clearProjectTabs,
    closeTab: lifecycle.closeTab,
    openTab: lifecycle.openTab,
    setActiveTab: lifecycle.setActiveTab,
    setTabContent: lifecycle.setTabContent,
    setTabDirty: vi.fn(),
    setTabEtag: lifecycle.setTabEtag,
  }),
}));

vi.mock("../../api/modules/workspace", () => ({
  workspaceApi: {
    saveFileContent: lifecycle.saveFileContent,
  },
}));

vi.mock("../../api/modules/projectDirectory", () => ({
  projectDirectoryApi: {
    get: vi.fn().mockRejectedValue(new Error("not mapped")),
  },
}));

vi.mock("./FilesNavigator", () => ({
  default: function MockFilesNavigator(props: {
    onShowMemoryGraph: (root: "wiki" | "procedure" | "personal") => void;
    onShowFiles: () => void;
  }) {
    lifecycle.navigatorProps = props;
    useEffect(() => {
      lifecycle.navigatorMounted();
      return () => lifecycle.navigatorUnmounted();
    }, []);
    return <div>navigator</div>;
  },
}));

vi.mock("./MemoryGraphView", () => ({
  default: (props: {
    agentId: string;
    root: string;
    onOpenFile: (section: "daily" | "digest", path: string) => void;
  }) => {
    lifecycle.memoryGraphProps = props;
    return (
      <div>
        memory-graph:{props.agentId}:{props.root}
      </div>
    );
  },
}));

vi.mock("../../pages/Coding/TabbedEditor", () => ({
  default: function MockTabbedEditor(props: {
    onCloseOtherTabs: (path: string) => void;
    onTabClose?: (path: string) => void;
    onSaveFile: (path: string, content: string) => Promise<void>;
  }) {
    lifecycle.editorProps = props;
    useEffect(() => {
      lifecycle.editorMounted();
      return () => lifecycle.editorUnmounted();
    }, []);
    return <div>editor</div>;
  },
}));

vi.mock("../../pages/Coding/GitPanel", () => ({
  default: () => <div>git</div>,
}));

describe("FilesWorkspace directory changes", () => {
  afterEach(() => vi.unstubAllGlobals());

  beforeEach(() => {
    vi.clearAllMocks();
    lifecycle.confirmSave.mockImplementation((options: ConfirmSaveOptions) => {
      void options.onOk?.();
    });
    lifecycle.tabs = [];
    lifecycle.activeTabPath = "";
    lifecycle.editorProps = null;
    lifecycle.navigatorProps = null;
    lifecycle.memoryGraphProps = null;
  });

  it("rebuilds the Session navigator and editor watch host", () => {
    const scope = {
      kind: "session" as const,
      agentId: "agent-a",
      sessionId: "session-a",
      chatId: "chat-a",
    };
    render(<FilesWorkspace scope={scope} />);

    expect(lifecycle.navigatorMounted).toHaveBeenCalledTimes(1);
    expect(lifecycle.editorMounted).toHaveBeenCalledTimes(1);

    act(() => notifyProjectDirectoryChanged(scope));

    expect(lifecycle.clearProjectTabs).toHaveBeenCalledWith(
      "session:agent-a:session-a",
    );
    expect(lifecycle.navigatorUnmounted).toHaveBeenCalledTimes(1);
    expect(lifecycle.navigatorMounted).toHaveBeenCalledTimes(2);
    expect(lifecycle.editorUnmounted).toHaveBeenCalledTimes(1);
    expect(lifecycle.editorMounted).toHaveBeenCalledTimes(2);
  });

  it("saves with the loaded ETag and stores the returned version", async () => {
    lifecycle.tabs = [
      {
        path: "notes.md",
        displayPath: "notes.md",
        content: "before",
        dirty: true,
        source: "workspace",
        etag: "v1",
      },
    ];
    lifecycle.activeTabPath = "notes.md";
    lifecycle.saveFileContent.mockResolvedValue({
      path: "notes.md",
      size: 5,
      etag: "v2",
    });

    render(<FilesWorkspace scope={{ kind: "agent", agentId: "agent-a" }} />);
    await act(async () => {
      await lifecycle.editorProps?.onSaveFile("notes.md", "after");
    });

    expect(lifecycle.saveFileContent).toHaveBeenCalledWith(
      "notes.md",
      "after",
      "v1",
      undefined,
      undefined,
      undefined,
    );
    expect(lifecycle.setTabEtag).toHaveBeenCalledWith(
      "agent:agent-a",
      "notes.md",
      "v2",
    );
  });

  it("closes every other tab and activates the tab used for the action", () => {
    lifecycle.tabs = [
      { path: "one.md", content: "", dirty: false },
      { path: "two.md", content: "", dirty: false },
      { path: "three.md", content: "", dirty: false },
    ];
    lifecycle.activeTabPath = "one.md";

    render(<FilesWorkspace scope={{ kind: "agent", agentId: "agent-a" }} />);
    act(() => lifecycle.editorProps?.onCloseOtherTabs("two.md"));

    expect(lifecycle.closeTab.mock.calls).toEqual([
      ["agent:agent-a", "one.md"],
      ["agent:agent-a", "three.md"],
    ]);
    expect(lifecycle.setActiveTab).toHaveBeenCalledWith(
      "agent:agent-a",
      "two.md",
    );
  });

  it("hides the file tree in compact Chat preview", () => {
    render(
      <FilesWorkspace
        compact
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
        }}
      />,
    );

    expect(lifecycle.navigatorMounted).not.toHaveBeenCalled();
    expect(lifecycle.editorMounted).toHaveBeenCalled();
  });

  it("closes the Chat preview when the last tab closes", () => {
    const onClose = vi.fn();
    lifecycle.tabs = [{ path: "notes.md", content: "", dirty: false }];
    lifecycle.activeTabPath = "notes.md";

    render(
      <FilesWorkspace
        compact
        onClose={onClose}
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
        }}
      />,
    );
    act(() => lifecycle.editorProps?.onTabClose?.("notes.md"));

    expect(lifecycle.closeTab).toHaveBeenCalledWith(
      "session:agent-a:session-a",
      "notes.md",
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the preview open when another tab remains", () => {
    const onClose = vi.fn();
    lifecycle.tabs = [
      { path: "one.md", content: "", dirty: false },
      { path: "two.md", content: "", dirty: false },
    ];
    lifecycle.activeTabPath = "one.md";

    render(
      <FilesWorkspace
        compact
        onClose={onClose}
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
        }}
      />,
    );
    act(() => lifecycle.editorProps?.onTabClose?.("one.md"));

    expect(onClose).not.toHaveBeenCalled();
    expect(lifecycle.setActiveTab).toHaveBeenCalledWith(
      "session:agent-a:session-a",
      "two.md",
    );
  });

  it("switches between the editor and the memory graph", () => {
    render(<FilesWorkspace scope={{ kind: "agent", agentId: "agent-a" }} />);

    act(() => lifecycle.navigatorProps?.onShowMemoryGraph("wiki"));
    expect(screen.getByText("memory-graph:agent-a:wiki")).toBeInTheDocument();
    expect(screen.queryByText("editor")).not.toBeInTheDocument();

    act(() => lifecycle.navigatorProps?.onShowFiles());
    expect(screen.getByText("editor")).toBeInTheDocument();
  });

  it("opens the section-relative path supplied by the memory graph", async () => {
    lifecycle.tabs = [{ path: "daily::a.md", content: "", dirty: false }];
    render(<FilesWorkspace scope={{ kind: "agent", agentId: "agent-a" }} />);

    act(() => lifecycle.navigatorProps?.onShowMemoryGraph("wiki"));
    await act(async () => {
      lifecycle.memoryGraphProps?.onOpenFile("daily", "a.md");
    });

    expect(screen.getByText("editor")).toBeInTheDocument();
    await waitFor(() =>
      expect(lifecycle.setActiveTab).toHaveBeenCalledWith(
        "agent:agent-a",
        "daily::a.md",
      ),
    );
  });

  it("opens inline generated markdown without fetching a preview URL", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FilesWorkspace
        initialTarget={{
          source: "artifact",
          path: "AI 回复.md",
          artifact: {
            id: "response-default:new",
            title: "AI 回复",
            source: "generated",
            mimeType: "text/markdown",
            extension: "md",
            textContent: "# Hello from chat",
          },
        }}
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
          chatId: "chat-a",
        }}
      />,
    );

    await waitFor(() =>
      expect(lifecycle.openTab).toHaveBeenCalledWith(
        "session:agent-a:session-a",
        expect.objectContaining({
          path: "artifact::AI 回复.md",
          displayPath: "AI 回复.md",
          content: "# Hello from chat",
          previewKind: "text",
          readOnly: false,
        }),
      ),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("applies streaming artifact updates to the open generated tab", async () => {
    render(
      <FilesWorkspace
        initialTarget={{
          source: "artifact",
          path: "AI 回复.md",
          artifact: {
            id: "response-default:new",
            title: "AI 回复",
            source: "generated",
            mimeType: "text/markdown",
            extension: "md",
            textContent: "# Hello from chat",
          },
        }}
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
          chatId: "chat-a",
        }}
      />,
    );

    await waitFor(() => expect(lifecycle.openTab).toHaveBeenCalled());

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent(UPDATE_FILE_PREVIEW_EVENT, {
          detail: {
            id: "response-default:new",
            patch: { textContent: "# streamed" },
          },
        }),
      );
    });

    expect(lifecycle.setTabContent).toHaveBeenCalledWith(
      "session:agent-a:session-a",
      "artifact::AI 回复.md",
      "# streamed",
    );
  });

  it("refreshes an already-open inline artifact tab instead of fetching", async () => {
    lifecycle.tabs = [
      {
        path: "artifact::AI 回复.md",
        displayPath: "AI 回复.md",
        content: "# Old",
        dirty: false,
      },
    ];

    render(
      <FilesWorkspace
        initialTarget={{
          source: "artifact",
          path: "AI 回复.md",
          artifact: {
            id: "response-default:new",
            title: "AI 回复",
            source: "generated",
            mimeType: "text/markdown",
            extension: "md",
            textContent: "# Updated reply",
          },
        }}
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
          chatId: "chat-a",
        }}
      />,
    );

    await waitFor(() =>
      expect(lifecycle.setTabContent).toHaveBeenCalledWith(
        "session:agent-a:session-a",
        "artifact::AI 回复.md",
        "# Updated reply",
      ),
    );
    expect(lifecycle.openTab).not.toHaveBeenCalled();
    expect(lifecycle.setActiveTab).toHaveBeenCalledWith(
      "session:agent-a:session-a",
      "artifact::AI 回复.md",
    );
  });

  it("saves an inline generated reply into the project workspace", async () => {
    lifecycle.tabs = [
      {
        path: "artifact::AI 回复.md",
        displayPath: "AI 回复.md",
        content: "# Hello from chat",
        dirty: false,
        source: "artifact",
      },
    ];
    lifecycle.saveFileContent.mockResolvedValue({
      path: "AI 回复.md",
      size: 18,
      etag: "v1",
    });

    render(
      <FilesWorkspace
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
          chatId: "chat-a",
        }}
      />,
    );

    await act(async () => {
      await lifecycle.editorProps?.onSaveFile(
        "artifact::AI 回复.md",
        "# Hello from chat",
      );
    });

    expect(lifecycle.saveFileContent).toHaveBeenCalledWith(
      "AI 回复.md",
      "# Hello from chat",
      undefined,
      "chat-a",
      "project",
      undefined,
    );
    expect(lifecycle.closeTab).toHaveBeenCalledWith(
      "session:agent-a:session-a",
      "artifact::AI 回复.md",
    );
    expect(lifecycle.openTab).toHaveBeenCalledWith(
      "session:agent-a:session-a",
      expect.objectContaining({
        path: "AI 回复.md",
        source: "workspace",
        content: "# Hello from chat",
        readOnly: false,
        etag: "v1",
      }),
    );
  });

  it("cancels saving an inline generated reply without writing a file", async () => {
    lifecycle.tabs = [
      {
        path: "artifact::AI 回复.md",
        displayPath: "AI 回复.md",
        content: "# Hello from chat",
        dirty: false,
        source: "artifact",
      },
    ];
    lifecycle.confirmSave.mockImplementation((options: ConfirmSaveOptions) => {
      options.onCancel?.();
    });

    render(
      <FilesWorkspace
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
          chatId: "chat-a",
        }}
      />,
    );

    await act(async () => {
      await lifecycle.editorProps?.onSaveFile(
        "artifact::AI 回复.md",
        "# Hello from chat",
      );
    });

    expect(lifecycle.saveFileContent).not.toHaveBeenCalled();
    expect(lifecycle.closeTab).not.toHaveBeenCalled();
    expect(lifecycle.openTab).not.toHaveBeenCalled();
  });

  it("rejects an invalid save path and leaves the generated tab open", async () => {
    lifecycle.tabs = [
      {
        path: "artifact::AI 回复.md",
        displayPath: "AI 回复.md",
        content: "# Hello from chat",
        dirty: false,
        source: "artifact",
      },
    ];
    lifecycle.confirmSave.mockImplementation((options: ConfirmSaveOptions) => {
      options.content?.props?.onChange?.({
        target: { value: "../secret.md" },
      });
      const result = options.onOk?.();
      options.onCancel?.();
      return result;
    });

    render(
      <FilesWorkspace
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
          chatId: "chat-a",
        }}
      />,
    );

    await act(async () => {
      await lifecycle.editorProps?.onSaveFile(
        "artifact::AI 回复.md",
        "# Hello from chat",
      );
    });

    expect(message.error).toHaveBeenCalled();
    expect(lifecycle.saveFileContent).not.toHaveBeenCalled();
    expect(lifecycle.closeTab).not.toHaveBeenCalled();
  });

  it("keeps the generated tab when saving to the workspace returns 409", async () => {
    lifecycle.tabs = [
      {
        path: "artifact::AI 回复.md",
        displayPath: "AI 回复.md",
        content: "# Hello from chat",
        dirty: false,
        source: "artifact",
      },
    ];
    lifecycle.saveFileContent.mockRejectedValue(
      Object.assign(new Error("conflict"), { status: 409 }),
    );

    render(
      <FilesWorkspace
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
          chatId: "chat-a",
        }}
      />,
    );

    await act(async () => {
      await lifecycle.editorProps?.onSaveFile(
        "artifact::AI 回复.md",
        "# Hello from chat",
      );
    });

    expect(lifecycle.saveFileContent).toHaveBeenCalled();
    expect(message.error).toHaveBeenCalled();
    expect(lifecycle.closeTab).not.toHaveBeenCalled();
    expect(lifecycle.openTab).not.toHaveBeenCalled();
  });

  it("loads expanded attachments with the same Session scope", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("const value = 1;", {
        status: 200,
        headers: { "Content-Type": "text/typescript" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FilesWorkspace
        initialTarget={{
          source: "attachment",
          path: "src/result.ts",
          artifactUrl: "/api/files/preview/src/result.ts",
        }}
        scope={{
          kind: "session",
          agentId: "agent-a",
          sessionId: "session-a",
          chatId: "chat-a",
        }}
      />,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      "X-Agent-Id": "agent-a",
      "X-Chat-Id": "chat-a",
    });
    await waitFor(() =>
      expect(lifecycle.openTab).toHaveBeenCalledWith(
        "session:agent-a:session-a",
        expect.objectContaining({
          path: "attachment::src/result.ts",
          content: "const value = 1;",
          readOnly: true,
        }),
      ),
    );
  });
});
