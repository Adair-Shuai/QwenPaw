import { renderWithProviders } from "@/test/common_setup";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FilesDrawer from "./FilesDrawer";
import { workspaceApi } from "../../api/modules/workspace";
import type { FileTarget } from "./types";
import { useBackgroundTasksStore } from "../../stores/backgroundTasksStore";
import { useCodingTabsStore } from "../../stores/codingTabsStore";
import type { FilesDrawerState } from "./types";
import { createRef, useEffect } from "react";
import { slotRegistry } from "../../plugins/registry/store";
import { ThemeProvider, useTheme } from "../../contexts/ThemeContext";
import { PAGE_STYLES } from "../../utils/pageStyle";

vi.mock("../../monacoSetup", () => ({}));
vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    language,
    options,
    onChange,
  }: {
    value: string;
    language?: string;
    options?: { readOnly?: boolean };
    onChange?: (value: string) => void;
  }) => (
    <textarea
      data-testid="monaco-editor"
      aria-label="Code editor"
      data-language={language}
      readOnly={options?.readOnly}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
  DiffEditor: () => <div />,
}));
vi.mock("../../hooks/useWorkspaceWatch", () => ({
  useWorkspaceWatch: vi.fn(),
}));
vi.mock("./FilesNavigator", () => ({
  default: () => <div data-testid="file-navigator">File navigator</div>,
}));

const clipboardMocks = vi.hoisted(() => ({
  copyText: vi.fn().mockResolvedValue(undefined),
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock("../../utils/clipboard", () => ({
  copyText: clipboardMocks.copyText,
}));

vi.mock("../../hooks/useAppMessage", () => ({
  useAppMessage: () => ({
    message: {
      error: clipboardMocks.error,
      success: clipboardMocks.success,
    },
  }),
}));

vi.mock("../../api/modules/workspace", () => ({
  workspaceApi: {
    listDirectory: vi.fn().mockResolvedValue({
      directory: "output",
      entries: [
        {
          name: "report.docx",
          path: "output/report.docx",
          kind: "file",
          size: 42,
          modified_at: "",
          preview_kind: "binary",
        },
      ],
      next_cursor: null,
      has_more: false,
    }),
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
    getFileDownloadUrl: vi.fn((path: string) => `/api/files/download/${path}`),
    loadFile: vi.fn().mockResolvedValue({
      content: "profile content",
    }),
    revealInFileManager: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../utils/downloadFileFromUrl", () => ({
  downloadFileFromUrl: vi.fn(),
}));

describe("FilesDrawer", () => {
  const interactionScope = {
    kind: "session" as const,
    agentId: "default",
    sessionId: "interactions",
  };

  it("exposes its DOM element to the open and close animation container", () => {
    const ref = createRef<HTMLElement>();
    renderWithProviders(
      <FilesDrawer
        ref={ref}
        state={{ kind: "workspace", trigger: null }}
        dispatch={vi.fn()}
        scope={interactionScope}
      />,
    );
    expect(ref.current).toBe(
      screen.getByRole("region", { name: /files|文件/i }),
    );
  });

  it("collapses a header-opened workspace using the actual active file", async () => {
    const target: FileTarget = {
      source: "workspace",
      path: "selected.txt",
      root: "project",
    };
    useCodingTabsStore.getState().openTab("session:default:interactions", {
      ...target,
      workspaceRoot: target.root,
      content: "kept",
      dirty: true,
    });
    useCodingTabsStore
      .getState()
      .setActiveTab("session:default:interactions", target.path);
    const dispatch = vi.fn();
    renderWithProviders(
      <FilesDrawer
        state={{ kind: "workspace", trigger: null }}
        dispatch={dispatch}
        scope={interactionScope}
      />,
    );
    await screen.findByRole(
      "tab",
      { name: /selected.txt/ },
      { timeout: 10000 },
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: /backToPreview|返回预览|Back to Preview/i,
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "COLLAPSE_TO_PREVIEW",
      target: expect.objectContaining(target),
    });
  });

  it("does not close for Escape in chat, inputs, composition or a child overlay", async () => {
    const dispatch = vi.fn();
    renderWithProviders(
      <>
        <textarea aria-label="Chat input" />
        <FilesDrawer
          state={{ kind: "workspace", trigger: null }}
          dispatch={dispatch}
          scope={interactionScope}
        />
      </>,
    );
    const drawer = screen.getByRole("region", { name: /files|文件/i });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Chat input" }), {
      key: "Escape",
    });
    fireEvent.keyDown(drawer, { key: "Escape", isComposing: true });
    const consumed = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    consumed.preventDefault();
    fireEvent(drawer, consumed);
    fireEvent.click(screen.getByRole("button", { name: "浏览器" }));
    fireEvent.keyDown(
      screen.getByRole("textbox", { name: /浏览器地址|Browser address/ }),
      { key: "Escape" },
    );
    expect(dispatch).not.toHaveBeenCalled();
    fireEvent.keyDown(drawer, { key: "Escape" });
    expect(dispatch).toHaveBeenCalledWith({ type: "CLOSE" });
  });

  it("does not move focus when a second file is requested", async () => {
    const dispatch = vi.fn();
    const { rerender } = renderWithProviders(
      <>
        <textarea aria-label="Chat input" />
        <FilesDrawer
          state={{
            kind: "preview",
            target: { source: "workspace", path: "one.txt" },
            trigger: null,
          }}
          dispatch={dispatch}
          scope={interactionScope}
        />
      </>,
    );
    await screen.findByRole("tab", { name: /one.txt/ });
    screen.getByRole("textbox", { name: "Chat input" }).focus();
    rerender(
      <>
        <textarea aria-label="Chat input" />
        <FilesDrawer
          state={{
            kind: "preview",
            target: { source: "workspace", path: "two.txt" },
            trigger: null,
          }}
          dispatch={dispatch}
          scope={interactionScope}
        />
      </>,
    );
    await screen.findByRole("tab", { name: /two.txt/ });
    expect(screen.getByRole("textbox", { name: "Chat input" })).toHaveFocus();
  });

  it("keeps an explicit compute request visible while file tabs hydrate", async () => {
    useCodingTabsStore.getState().openTab("session:default:interactions", {
      path: "restored.txt",
      source: "workspace",
      content: "",
      dirty: false,
    });
    useCodingTabsStore
      .getState()
      .setActiveTab("session:default:interactions", "restored.txt");
    renderWithProviders(
      <FilesDrawer
        state={{ kind: "workspace", mode: "compute", trigger: null }}
        dispatch={vi.fn()}
        scope={interactionScope}
      />,
    );
    await waitFor(() => expect(workspaceApi.loadFileText).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "计算轨道" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("replaces the current tool immediately when a file is opened", async () => {
    const scope = interactionScope;
    const dispatch = vi.fn();
    const { rerender } = renderWithProviders(
      <FilesDrawer
        state={{ kind: "workspace", trigger: null }}
        dispatch={dispatch}
        scope={scope}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "浏览器" }));
    vi.mocked(workspaceApi.loadFileText).mockImplementationOnce(
      () => new Promise(() => {}),
    );
    rerender(
      <FilesDrawer
        state={{
          kind: "workspace",
          target: { source: "workspace", path: "slow.txt" },
          trigger: null,
        }}
        dispatch={dispatch}
        scope={scope}
      />,
    );
    expect(screen.getByRole("button", { name: "文件与预览" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await waitFor(() =>
      expect(workspaceApi.loadFileText).toHaveBeenCalledWith(
        "slow.txt",
        undefined,
        undefined,
        undefined,
      ),
    );
  });

  it("does not carry a previous session's active file into an empty workspace", async () => {
    const dispatch = vi.fn();
    const state: Exclude<FilesDrawerState, { kind: "closed" }> = {
      kind: "workspace",
      target: { source: "workspace", path: "only-a.txt" },
      trigger: null,
    };
    const { rerender } = renderWithProviders(
      <FilesDrawer
        state={state}
        dispatch={dispatch}
        scope={interactionScope}
      />,
    );
    await screen.findByRole("tab", { name: /only-a.txt/ });
    rerender(
      <FilesDrawer
        state={{ kind: "workspace", trigger: null }}
        dispatch={dispatch}
        scope={{ ...interactionScope, sessionId: "another-session" }}
      />,
    );
    expect(
      screen.queryByRole("tab", { name: /only-a.txt/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("only-a.txt")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /backToPreview|返回预览|Back to Preview/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("clears closed file actions instead of falling back to the opening request", async () => {
    renderWithProviders(
      <FilesDrawer
        state={{
          kind: "preview",
          target: { source: "workspace", path: "closed.txt" },
          trigger: null,
        }}
        dispatch={vi.fn()}
        scope={interactionScope}
      />,
    );
    await screen.findByRole("tab", { name: /closed.txt/ });
    fireEvent.click(
      screen.getByRole("button", { name: /(?:close|关闭).*closed.txt/i }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("tab", { name: /closed.txt/ }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByText("closed.txt")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /mentionInChat|在聊天中引用|Mention in chat/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /expandWorkspace|展开工作区|Expand workspace/i,
      }),
    ).toBeEnabled();
  });

  it("retains browser history, address drafts and the iframe across tool switches", async () => {
    const props = {
      state: { kind: "workspace" as const, trigger: null },
      dispatch: vi.fn(),
      scope: interactionScope,
    };
    const { rerender } = renderWithProviders(<FilesDrawer {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "浏览器" }));
    const address = screen.getByRole("textbox", {
      name: /浏览器地址|Browser address/,
    });
    for (const url of [
      "https://example.com/first",
      "https://example.com/second",
    ]) {
      fireEvent.change(address, { target: { value: url } });
      fireEvent.keyDown(address, { key: "Enter" });
    }
    const frame = screen.getByTitle(/工作台浏览器|Workbench browser/);
    fireEvent.change(address, { target: { value: "unfinished address" } });
    fireEvent.click(screen.getByRole("button", { name: "文件与预览" }));
    expect(frame).not.toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "浏览器" }));
    expect(screen.getByTitle(/工作台浏览器|Workbench browser/)).toBe(frame);
    expect(address).toHaveValue("unfinished address");
    fireEvent.click(screen.getByRole("button", { name: /^(后退|Back)$/ }));
    expect(screen.getByTitle(/工作台浏览器|Workbench browser/)).toHaveAttribute(
      "src",
      "https://example.com/first",
    );
    rerender(
      <FilesDrawer
        {...props}
        scope={{ ...interactionScope, sessionId: "other-browser-session" }}
      />,
    );
    expect(frame).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^(后退|Back)$/ }),
    ).toBeDisabled();
  });

  it("retains unsaved edits across closing and reopening the workspace", async () => {
    const props = {
      state: {
        kind: "preview" as const,
        target: { source: "workspace" as const, path: "draft.py" },
        trigger: null,
      },
      scope: interactionScope,
      dispatch: vi.fn(),
    };
    const { rerender } = renderWithProviders(<FilesDrawer {...props} />);
    await screen.findByTestId("monaco-editor");
    fireEvent.click(
      screen.getByRole("button", { name: /^(Edit|编辑|files\.edit)$/i }),
    );
    fireEvent.change(screen.getByTestId("monaco-editor"), {
      target: { value: "unsaved draft" },
    });
    rerender(<></>);
    rerender(<FilesDrawer {...props} />);
    expect(await screen.findByTestId("monaco-editor")).toHaveValue(
      "unsaved draft",
    );
  });

  it("restores per-style file widths without replacing the active editor or its unsaved draft", async () => {
    localStorage.setItem("qwenpaw-files-preview-width", "480");
    localStorage.setItem("qwenpaw-files-preview-width:openai", "600");
    function Controls() {
      const { setPageStyle } = useTheme();
      return (
        <>
          {PAGE_STYLES.map(({ id }) => (
            <button key={id} onClick={() => setPageStyle(id)}>
              {id}
            </button>
          ))}
        </>
      );
    }
    renderWithProviders(
      <ThemeProvider syncRemote={false}>
        <Controls />
        <FilesDrawer
          state={{
            kind: "preview",
            target: { source: "workspace", path: "draft.py" },
            trigger: null,
          }}
          dispatch={vi.fn()}
          scope={interactionScope}
        />
      </ThemeProvider>,
    );
    await screen.findByTestId("monaco-editor");
    fireEvent.click(
      screen.getByRole("button", { name: /^(Edit|编辑|files\.edit)$/i }),
    );
    const editing = screen.getByTestId("monaco-editor");
    fireEvent.change(editing, {
      target: { value: "style-independent unsaved draft" },
    });
    const drawer = screen.getByRole("region", { name: /files|文件/i });
    expect(drawer).toHaveStyle({ width: "480px" });
    fireEvent.click(screen.getByRole("button", { name: "openai" }));
    expect(drawer).toHaveStyle({ width: "600px" });
    fireEvent.click(screen.getByRole("button", { name: "deepseek" }));
    expect(drawer.style.width).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "classic" }));
    expect(drawer).toHaveStyle({ width: "480px" });
    expect(screen.getByTestId("monaco-editor")).toBe(editing);
    expect(editing).toHaveValue("style-independent unsaved draft");
  });

  it("keeps native files usable after a compute plugin is removed", async () => {
    const registration = slotRegistry.fill(
      "workspace-test",
      "chat.workbench.compute",
      () => <div>Registered computation</div>,
    );
    try {
      renderWithProviders(
        <FilesDrawer
          scope={interactionScope}
          dispatch={vi.fn()}
          state={{ kind: "workspace", mode: "compute", trigger: null }}
        />,
      );
      await waitFor(() =>
        expect(screen.getByText("Registered computation")).toBeVisible(),
      );
      act(() => registration.dispose());
      expect(
        screen.queryByText("Registered computation"),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/暂无推导记录/)).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: "文件与预览" }));
      expect(await screen.findByTestId("file-navigator")).toBeVisible();
    } finally {
      act(() => registration.dispose());
    }
  });

  it("releases the simulation view on hide and reflects provider removal", async () => {
    const namespace = ((
      window as unknown as {
        QwenPaw?: { runCenter?: { SimulationMonitor?: () => React.ReactNode } };
      }
    ).QwenPaw ??= {});
    const previous = namespace.runCenter;
    const released = vi.fn();
    function Monitor() {
      useEffect(() => released, []);
      return <div>Live simulation view</div>;
    }
    namespace.runCenter = { SimulationMonitor: Monitor };
    try {
      renderWithProviders(
        <FilesDrawer
          scope={interactionScope}
          dispatch={vi.fn()}
          state={{
            kind: "workspace",
            mode: "simulation",
            simulationRunId: "sim_smoke",
            trigger: null,
          }}
        />,
      );
      await waitFor(() =>
        expect(screen.getByText("Live simulation view")).toBeVisible(),
      );
      fireEvent.click(screen.getByRole("button", { name: "文件与预览" }));
      expect(released).toHaveBeenCalledOnce();
      fireEvent.click(screen.getByRole("button", { name: "数模监测" }));
      await waitFor(() =>
        expect(screen.getByText("Live simulation view")).toBeVisible(),
      );
      act(() => {
        delete namespace.runCenter;
        window.dispatchEvent(new Event("qwenpaw:simulation-monitor-ready"));
      });
      expect(
        screen.queryByText("Live simulation view"),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("尚未加载");
      expect(released).toHaveBeenCalledTimes(2);
    } finally {
      namespace.runCenter = previous;
    }
  });

  it("shows native file size and keeps expansion available after a load failure", async () => {
    const { rerender } = renderWithProviders(
      <FilesDrawer
        scope={interactionScope}
        dispatch={vi.fn()}
        state={{
          kind: "preview",
          target: { source: "workspace", path: "size.txt" },
          trigger: null,
        }}
      />,
    );
    await screen.findByRole("tab", { name: /size.txt/ });
    await waitFor(() =>
      expect(
        screen.getByText(/(?:预览|Preview).*5.*(?:字节|bytes)/i),
      ).toBeVisible(),
    );
    vi.mocked(workspaceApi.loadFileText).mockRejectedValueOnce(
      new Error("missing"),
    );
    rerender(
      <FilesDrawer
        scope={{ ...interactionScope, sessionId: "missing" }}
        dispatch={vi.fn()}
        state={{
          kind: "preview",
          target: { source: "workspace", path: "missing.txt" },
          trigger: null,
        }}
      />,
    );
    await screen.findByRole("alert");
    expect(
      screen.getByRole("button", {
        name: /expandWorkspace|展开工作区|Expand workspace/i,
      }),
    ).toBeEnabled();
  });

  it("restores focus to its connected opener when closed", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    try {
      const dispatch = vi.fn();
      renderWithProviders(
        <FilesDrawer
          state={{ kind: "workspace", trigger }}
          dispatch={dispatch}
          scope={interactionScope}
        />,
      );
      fireEvent.click(
        screen.getByRole("button", { name: /^(Close|关闭|common.close)$/i }),
      );
      await waitFor(() => expect(trigger).toHaveFocus());
      expect(dispatch).toHaveBeenCalledWith({ type: "CLOSE" });
    } finally {
      trigger.remove();
    }
  });

  it("removes global pointer listeners when closed during resizing", async () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderWithProviders(
      <FilesDrawer
        state={{ kind: "workspace", trigger: null }}
        dispatch={vi.fn()}
        scope={interactionScope}
      />,
    );
    fireEvent.pointerDown(screen.getByRole("separator"), { clientX: 500 });
    unmount();
    expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("pointerup", expect.any(Function));
    act(() => {
      fireEvent.pointerMove(window, { clientX: 200 });
    });
    expect(localStorage.getItem("qwenpaw-files-workspace-width")).toBeNull();
  });
  // Keep this at the drawer boundary: replacing FilesWorkspace with a single
  // preview must fail even if TabbedEditor's own unit tests still pass.
  it.each([
    ["example.py", "python"],
    ["example.ts", "typescript"],
    ["example.js", "javascript"],
  ])(
    "uses the built-in code surface and preserves edits across preview toggles: %s",
    async (path, language) => {
      renderWithProviders(
        <FilesDrawer
          state={{
            kind: "preview",
            target: { source: "workspace", path, root: "project" },
            trigger: null,
          }}
          dispatch={vi.fn()}
          scope={{
            kind: "session",
            agentId: "default",
            sessionId: "code-session",
          }}
        />,
      );
      await waitFor(() =>
        expect(screen.getByTestId("monaco-editor")).toHaveAttribute("readonly"),
      );
      const preview = screen.getByTestId("monaco-editor");
      expect(preview).toHaveAttribute("readonly");
      expect(preview).toHaveAttribute("data-language", language);
      expect(preview).toHaveValue("hello");
      fireEvent.click(
        screen.getByRole("button", { name: /^(Edit|编辑|files\.edit)$/i }),
      );
      const editor = await screen.findByTestId("monaco-editor");
      expect(editor).not.toHaveAttribute("readonly");
      fireEvent.change(editor, { target: { value: "updated code" } });
      fireEvent.click(
        screen.getByRole("button", {
          name: /^(Preview|预览|files\.preview)$/i,
        }),
      );
      await waitFor(() =>
        expect(screen.getByTestId("monaco-editor")).toHaveAttribute("readonly"),
      );
      expect(screen.getByTestId("monaco-editor")).toHaveValue("updated code");
      fireEvent.click(
        screen.getByRole("button", { name: /^(Edit|编辑|files\.edit)$/i }),
      );
      expect(screen.getByTestId("monaco-editor")).toHaveValue("updated code");
    },
  );

  it("retains file tabs across preview expansion and reveals the active file", async () => {
    const dispatch = vi.fn();
    const scope = {
      kind: "session" as const,
      agentId: "default",
      sessionId: "tabs-session",
      chatId: "tabs-chat",
    };
    const first = {
      source: "workspace" as const,
      path: "first.txt",
      root: "project" as const,
    };
    const second = { ...first, path: "second.txt" };
    const { rerender } = renderWithProviders(
      <FilesDrawer
        state={{ kind: "preview", target: first, trigger: null }}
        dispatch={dispatch}
        scope={scope}
      />,
    );
    await screen.findByRole("tab", { name: /first.txt/ });
    expect(screen.queryByTestId("file-navigator")).not.toBeInTheDocument();
    rerender(
      <FilesDrawer
        state={{ kind: "preview", target: second, trigger: null }}
        dispatch={dispatch}
        scope={scope}
      />,
    );
    await screen.findByRole("tab", { name: /second.txt/ });
    expect(screen.getByRole("tab", { name: /first.txt/ })).toBeInTheDocument();
    rerender(
      <FilesDrawer
        state={{ kind: "workspace", target: second, trigger: null }}
        dispatch={dispatch}
        scope={scope}
      />,
    );
    await screen.findByTestId("file-navigator");
    fireEvent.click(screen.getByRole("tab", { name: /first.txt/ }));
    rerender(
      <FilesDrawer
        state={{ kind: "preview", target: second, trigger: null }}
        dispatch={dispatch}
        scope={scope}
      />,
    );
    expect(screen.getByRole("tab", { name: /first.txt/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: /second.txt/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "浏览器" }));
    fireEvent.click(screen.getByRole("button", { name: "文件与预览" }));
    expect(screen.getByRole("tab", { name: /first.txt/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /在文件夹中打开|Reveal in Folder|revealInFolder/i,
      }),
    );
    await waitFor(() =>
      expect(workspaceApi.revealInFileManager).toHaveBeenCalledWith(
        "first.txt",
        "tabs-chat",
        "project",
        undefined,
      ),
    );
  });

  beforeEach(() => {
    useCodingTabsStore.setState({
      tabsByAgent: {},
      activeTabByAgent: {},
      diffsByAgent: {},
    });
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useBackgroundTasksStore.setState({ tasks: [] });
  });

  it("shows the backend session's agent trace in the right workbench", async () => {
    useBackgroundTasksStore.getState().addTask(
      {
        sessionId: "backend-session",
        toolCallId: "agent-call",
        toolName: "Agent · research",
        agentId: "research",
        taskSummary: "研究报告",
        startTime: Date.now(),
      },
      { kind: "agent" },
    );
    renderWithProviders(
      <FilesDrawer
        state={{ kind: "workspace", trigger: null }}
        dispatch={vi.fn()}
        scope={{
          kind: "session",
          agentId: "default",
          sessionId: "local-session",
        }}
        runtimeSessionId="backend-session"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "智能体进程" }));
    expect((await screen.findAllByText("研究报告")).length).toBeGreaterThan(0);
  });

  it("copies the complete text file content", async () => {
    clipboardMocks.copyText.mockClear();
    clipboardMocks.success.mockClear();
    const user = userEvent.setup();

    renderWithProviders(
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
        dispatch={vi.fn()}
        scope={{
          kind: "session",
          agentId: "default",
          sessionId: "session-1",
        }}
      />,
    );

    const copyButton = await screen.findByRole("button", {
      name: /copy|复制/i,
    });
    const downloadButton = screen.getByRole("button", {
      name: /download|下载/i,
    });

    expect(
      copyButton.compareDocumentPosition(downloadButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await user.click(copyButton);

    await waitFor(() => {
      expect(clipboardMocks.copyText).toHaveBeenCalledWith("hello");
      expect(clipboardMocks.success).toHaveBeenCalled();
    });
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

    expect(await screen.findByTestId("file-navigator")).toBeInTheDocument();
    expect(
      screen.queryByText((content) =>
        ["工作区", "Workspace", "files.workspace"].includes(content),
      ),
    ).not.toBeInTheDocument();
  });

  it("restores the directory navigator in expanded workspace", async () => {
    const dispatch = vi.fn();
    renderWithProviders(
      <FilesDrawer
        state={{ kind: "workspace", trigger: null }}
        dispatch={dispatch}
        scope={{ kind: "session", agentId: "default", sessionId: "session-1" }}
      />,
    );

    expect(await screen.findByTestId("file-navigator")).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("keeps Preview open after inserting a file reference", async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
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

    await user.click(
      await screen.findByRole("button", {
        name: /mentionInChat|Mention in Chat|在聊天中引用/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "" })).toHaveValue(
        "@ hello.txt ",
      );
    });
    expect(dispatch).not.toHaveBeenCalledWith({ type: "CLOSE" });
    expect(
      screen.getByRole("button", {
        name: /mentionInChat|Mention in Chat|在聊天中引用/i,
      }),
    ).toBeInTheDocument();
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

    const drawer = screen.getByRole("region", { name: /files|文件/i });
    const separator = screen.getByRole("separator");
    vi.spyOn(drawer, "getBoundingClientRect")
      .mockReturnValueOnce({ width: 500 } as DOMRect)
      .mockReturnValue({ width: 600 } as DOMRect);
    vi.spyOn(drawer.parentElement!, "getBoundingClientRect").mockReturnValue({
      width: 1200,
    } as DOMRect);
    fireEvent.pointerDown(separator, { clientX: 420 });
    expect(drawer.className).toContain("drawerResizing");

    fireEvent.pointerMove(window, { clientX: 320 });
    fireEvent.pointerUp(window);
    await waitFor(() => {
      expect(drawer.className).not.toContain("drawerResizing");
    });
    expect(drawer).toHaveStyle({ width: "600px" });
    expect(localStorage.getItem("qwenpaw-files-workspace-width")).toBe("600");
  });

  it("uses left and right arrow keys from the right-side resize edge", async () => {
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

    const drawer = screen.getByRole("region", { name: /files|文件/i });
    const separator = screen.getByRole("separator");
    vi.spyOn(drawer.parentElement!, "getBoundingClientRect").mockReturnValue({
      width: 1200,
    } as DOMRect);

    fireEvent.keyDown(separator, { key: "ArrowLeft" });
    await waitFor(() => {
      expect(drawer).toHaveStyle({ width: "664px" });
    });

    fireEvent.keyDown(separator, { key: "ArrowRight" });
    await waitFor(() => {
      expect(drawer).toHaveStyle({ width: "640px" });
    });
  });

  it("applies persisted widths when the drawer mode changes", () => {
    localStorage.setItem("qwenpaw-files-preview-width", "480");
    localStorage.setItem("qwenpaw-files-workspace-width", "720");
    const dispatch = vi.fn();
    const scope = {
      kind: "session" as const,
      agentId: "default",
      sessionId: "session-1",
    };
    const target = {
      source: "workspace",
      path: "hello.txt",
      root: "project",
    } satisfies FileTarget;
    const { rerender } = renderWithProviders(
      <FilesDrawer
        state={{ kind: "preview", target, trigger: null }}
        dispatch={dispatch}
        scope={scope}
      />,
    );

    expect(screen.getByRole("region", { name: /files|文件/i })).toHaveStyle({
      width: "480px",
    });

    rerender(
      <FilesDrawer
        state={{ kind: "workspace", target, trigger: null }}
        dispatch={dispatch}
        scope={scope}
      />,
    );

    expect(screen.getByRole("region", { name: /files|文件/i })).toHaveStyle({
      width: "720px",
    });
  });

  // -------------------------------------------------------------------------
  // Download button — regression for #4670
  // Clicking the download button in the preview header must trigger the
  // downloadFileFromUrl helper with the correct URL and filename.
  // -------------------------------------------------------------------------
  it("download button triggers downloadFileFromUrl on click (#4670)", async () => {
    const { downloadFileFromUrl } = await import(
      "../../utils/downloadFileFromUrl"
    );
    const user = userEvent.setup();

    renderWithProviders(
      <FilesDrawer
        state={{
          kind: "preview",
          target: {
            source: "workspace",
            path: "docs/readme.md",
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

    const downloadBtn = await screen.findByRole("button", {
      name: /files\.download|Download|下载/i,
    });
    expect(downloadBtn).toBeInTheDocument();

    await user.click(downloadBtn);

    await waitFor(() => {
      expect(downloadFileFromUrl).toHaveBeenCalledOnce();
    });
    // Verify the URL and filename passed to the download helper
    expect(downloadFileFromUrl).toHaveBeenCalledWith(
      expect.stringContaining("readme.md"),
      "readme.md",
      expect.objectContaining({
        headers: expect.any(Object),
      }),
    );
  });

  it("supports exporting a profile tab through the restored editor", async () => {
    renderWithProviders(
      <FilesDrawer
        state={{
          kind: "preview",
          target: {
            source: "profile",
            path: "config.yaml",
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

    await waitFor(() =>
      expect(workspaceApi.loadFile).toHaveBeenCalledWith(
        "config.yaml",
        "default",
      ),
    );

    expect(
      await screen.findByRole("button", {
        name: /files\.download|Download|下载/i,
      }),
    ).toBeInTheDocument();
  });
});
