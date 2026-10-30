import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FilesWorkspace from "./FilesWorkspace";
import { useCodingTabsStore } from "../../stores/codingTabsStore";
import type { FileTarget } from "./types";
import { updateArtifactPreview } from "./openFilePreview";

const api = vi.hoisted(() => ({
  metadata: vi.fn(),
  text: vi.fn(),
  upload: vi.fn(),
  save: vi.fn(),
  copy: vi.fn().mockResolvedValue(undefined),
  deliveries: vi.fn(),
}));
vi.mock("../../api/modules/turnFiles", () => ({
  TURN_FILES_UPDATED_EVENT: "qwenpaw:turn-files-updated",
  turnFilesApi: {
    list: api.deliveries,
    fileUrl: (_scope: unknown, turnId: string, fileId: string) =>
      `/archive/${turnId}/${fileId}`,
  },
}));
vi.mock("../../monacoSetup", () => ({}));
vi.mock("../../utils/clipboard", () => ({ copyText: api.copy }));
vi.mock("../../stores/codingModeStore", () => ({
  useCodingMode: () => ({ codingMode: true }),
}));
vi.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: false }),
}));
vi.mock("../../hooks/useAppMessage", () => ({
  useAppMessage: () => ({ message: { error: vi.fn(), success: vi.fn() } }),
}));
vi.mock("../../hooks/useWorkspaceWatch", () => ({
  useWorkspaceWatch: vi.fn(),
}));
vi.mock("../../api/modules/workspace", () => ({
  workspaceApi: {
    getFileMetadata: api.metadata,
    loadFileText: api.text,
    uploadFiles: api.upload,
    saveFileContent: api.save,
  },
}));
vi.mock("./FilesNavigator", () => ({
  default: () => <div>file navigator</div>,
}));
vi.mock("./MemoryGraphView", () => ({ default: () => null }));
vi.mock("../../pages/Coding/GitPanel", () => ({
  default: () => <div>git panel</div>,
}));
vi.mock("../../pages/Coding/FilePreview", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="preview-content">{content}</div>
  ),
  isPreviewable: () => true,
}));
vi.mock("@monaco-editor/react", () => ({
  default: ({ value }: { value: string }) => (
    <div data-testid="editor-content">{value}</div>
  ),
  DiffEditor: () => <div>diff editor</div>,
}));

const scope = {
  kind: "session" as const,
  agentId: "agent-a",
  sessionId: "session-a",
  chatId: "chat-a",
};
const key = "session:agent-a:session-a";
const artifact = (id: string, content: string): FileTarget => ({
  source: "artifact",
  path: "reply.md",
  artifact: {
    id,
    title: "reply.md",
    source: "generated",
    mimeType: "text/markdown",
    textContent: content,
  },
});
const currentTabs = () => useCodingTabsStore.getState().tabsByAgent[key] ?? [];
const activeTab = () =>
  currentTabs().find(
    (tab) => tab.path === useCodingTabsStore.getState().activeTabByAgent[key],
  );
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}
const fileText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(file);
  });
async function openSave() {
  fireEvent.click(
    await screen.findByRole("button", { name: /saveToWorkspace|保存到工作区/ }),
  );
  return screen.findByRole("dialog");
}

describe("FilesWorkspace native editor integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    useCodingTabsStore.setState({
      tabsByAgent: {},
      activeTabByAgent: {},
      diffsByAgent: {},
    });
    api.metadata
      .mockReset()
      .mockResolvedValue({ preview_kind: "text", etag: "v1" });
    api.text.mockReset().mockImplementation(async (path: string) => ({
      content: `disk:${path}`,
      etag: "v1",
    }));
    api.upload.mockReset();
    api.deliveries.mockReset().mockResolvedValue({ turns: [] });
  });

  it("opens persistent delivered versions through the native editor without losing workspace drafts", async () => {
    api.deliveries.mockResolvedValue({
      turns: ["turn-a", "turn-b"].map((id) => ({
        id,
        session_id: "runtime-session-a",
        files: [
          {
            id: "report",
            path: "report.md",
            name: "report.md",
            root: "project",
            status: "created",
            size: 10,
            delivered: true,
            after_available: true,
          },
        ],
      })),
    });
    const fetchArchive = vi.spyOn(globalThis, "fetch").mockImplementation(
      async (url) =>
        new Response(`archived:${url}`, {
          status: 200,
          headers: { "Content-Type": "text/markdown" },
        }),
    );
    try {
      render(
        <FilesWorkspace
          scope={scope}
          initialTarget={{
            source: "workspace",
            root: "project",
            path: "report.md",
          }}
        />,
      );
      await waitFor(() => expect(currentTabs()).toHaveLength(1));
      const draftPath = activeTab()!.path;
      act(() => {
        useCodingTabsStore
          .getState()
          .setTabContent(key, draftPath, "unsaved draft");
        useCodingTabsStore.getState().setTabDirty(key, draftPath, true);
      });
      fireEvent.click(
        screen.getByRole("button", {
          name: /^(会话成果|Session deliverables|Deliverables|files.deliverables)$/,
        }),
      );
      const shelf = await screen.findByRole("complementary", {
        name: /会话成果|deliverables|Deliverables/,
      });
      await waitFor(() =>
        expect(
          within(shelf).getAllByRole("button", { name: /report.md/ }),
        ).toHaveLength(2),
      );
      fireEvent.click(
        within(shelf).getAllByRole("button", { name: /report.md/ })[0],
      );
      await waitFor(() =>
        expect(activeTab()?.artifact?.meta?.turnId).toBe("turn-a"),
      );
      expect(activeTab()?.content).toBe("archived:/archive/turn-a/report");
      expect(activeTab()?.readOnly).toBe(true);
      fireEvent.click(
        within(shelf).getAllByRole("button", { name: /report.md/ })[1],
      );
      await waitFor(() =>
        expect(activeTab()?.artifact?.meta?.turnId).toBe("turn-b"),
      );
      expect(currentTabs()).toHaveLength(3);
      expect(currentTabs().find((tab) => tab.path === draftPath)).toMatchObject(
        { dirty: true, content: "unsaved draft" },
      );
      fireEvent.click(
        screen.getByRole("button", {
          name: /^(文件导航|File navigator|files.navigator)$/,
        }),
      );
      expect(currentTabs().find((tab) => tab.path === draftPath)).toMatchObject(
        { dirty: true, content: "unsaved draft" },
      );
      expect(api.metadata).toHaveBeenCalledTimes(1);
    } finally {
      fetchArchive.mockRestore();
    }
  });

  it("opens text decks in the native editor and preserves explicit preview intent", async () => {
    const { rerender } = render(
      <FilesWorkspace
        scope={scope}
        initialTarget={{ source: "workspace", path: "case.DATA" }}
      />,
    );
    expect(await screen.findByTestId("editor-content")).toHaveTextContent(
      "disk:case.DATA",
    );
    expect(activeTab()?.preferredView).toBe("text");
    rerender(
      <FilesWorkspace
        scope={scope}
        initialTarget={{
          source: "workspace",
          path: "another.DATA",
          preferredView: "visualization",
        }}
      />,
    );
    expect(await screen.findByTestId("preview-content")).toHaveTextContent(
      "disk:another.DATA",
    );
    expect(activeTab()?.preferredView).toBe("visualization");
  });

  it("keeps different same-name artifacts in independent tabs", async () => {
    const { rerender } = render(
      <FilesWorkspace
        scope={scope}
        initialTarget={artifact("response-1", "first result")}
      />,
    );
    expect(await screen.findByTestId("preview-content")).toHaveTextContent(
      "first result",
    );
    rerender(
      <FilesWorkspace
        scope={scope}
        initialTarget={artifact("response-2", "second result")}
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId("preview-content")).toHaveTextContent(
        "second result",
      ),
    );
    expect(currentTabs()).toHaveLength(2);
    expect(currentTabs().map((tab) => tab.content)).toEqual([
      "first result",
      "second result",
    ]);
    expect(new Set(currentTabs().map((tab) => tab.path)).size).toBe(2);
    rerender(
      <FilesWorkspace
        scope={scope}
        initialTarget={artifact("response-1", "first result")}
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId("preview-content")).toHaveTextContent(
        "first result",
      ),
    );
    expect(currentTabs()).toHaveLength(2);
  });

  it("keeps streamed artifact previews, copy and saved bytes on the same current content", async () => {
    const first = artifact("response-1", "initial draft");
    first.artifact!.sessionId = "agent-a:session-a";
    const otherKey = "session:agent-a:other";
    useCodingTabsStore.setState({
      tabsByAgent: {
        [otherKey]: [
          {
            path: "other-artifact",
            source: "artifact",
            content: "other session",
            dirty: false,
            artifact: { ...first.artifact!, textContent: "other session" },
          },
        ],
      },
    });
    const view = render(<FilesWorkspace scope={scope} initialTarget={first} />);
    expect(await screen.findByTestId("preview-content")).toHaveTextContent(
      "initial draft",
    );
    view.rerender(
      <FilesWorkspace
        scope={scope}
        initialTarget={artifact("response-2", "second artifact")}
      />,
    );
    await waitFor(() => expect(currentTabs()).toHaveLength(2));
    view.rerender(<FilesWorkspace scope={scope} initialTarget={first} />);
    await waitFor(() => expect(activeTab()?.artifact?.id).toBe("response-1"));
    act(() =>
      updateArtifactPreview("response-1", {
        textContent: "最终稿 final result",
        isStreaming: false,
        streamProgress: 100,
        sessionId: "agent-a:session-a",
      }),
    );
    await waitFor(() =>
      expect(screen.getByTestId("preview-content")).toHaveTextContent(
        "最终稿 final result",
      ),
    );
    expect(activeTab()?.artifact).toMatchObject({
      textContent: "最终稿 final result",
      isStreaming: false,
      streamProgress: 100,
    });
    expect(
      currentTabs().find((tab) => tab.artifact?.id === "response-2")?.content,
    ).toBe("second artifact");
    expect(useCodingTabsStore.getState().tabsByAgent[otherKey][0].content).toBe(
      "other session",
    );
    fireEvent.click(
      screen.getByRole("button", { name: /copyFileToChat|复制/ }),
    );
    await waitFor(() =>
      expect(api.copy).toHaveBeenLastCalledWith("最终稿 final result"),
    );

    // An older message's initial target cannot roll the shared state back.
    view.unmount();
    render(<FilesWorkspace scope={scope} initialTarget={first} />);
    expect(await screen.findByTestId("preview-content")).toHaveTextContent(
      "最终稿 final result",
    );
    api.upload.mockResolvedValue({
      files: [{ path: "reply.md", status: "uploaded" }],
    });
    const dialog = await openSave();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.save" }),
    );
    await waitFor(() => expect(api.upload).toHaveBeenCalledOnce());
    expect(await fileText(api.upload.mock.calls[0][0][0])).toBe(
      "最终稿 final result",
    );
  });

  it("rejects foreign-scope artifact updates and preserves unsaved buffers", async () => {
    render(
      <FilesWorkspace
        scope={scope}
        initialTarget={artifact("response-1", "initial draft")}
      />,
    );
    expect(await screen.findByTestId("preview-content")).toHaveTextContent(
      "initial draft",
    );
    act(() =>
      updateArtifactPreview("response-1", {
        textContent: "wrong session",
        chatId: "chat-other",
      }),
    );
    expect(screen.getByTestId("preview-content")).toHaveTextContent(
      "initial draft",
    );
    const pendingDiff = {
      original: "initial draft",
      modified: "pending proposal",
    };
    act(() => {
      useCodingTabsStore
        .getState()
        .setDiff(key, activeTab()!.path, pendingDiff);
      updateArtifactPreview("response-1", {
        textContent: "late source result",
        isStreaming: false,
      });
    });
    expect(activeTab()).toMatchObject({
      content: "initial draft",
      artifact: { textContent: "initial draft" },
    });
    expect(
      useCodingTabsStore.getState().diffsByAgent[key][activeTab()!.path],
    ).toBe(pendingDiff);
    act(() => useCodingTabsStore.getState().removeDiff(key, activeTab()!.path));
    act(() => {
      const path = activeTab()!.path;
      useCodingTabsStore
        .getState()
        .setTabContent(key, path, "unsaved local change");
      useCodingTabsStore.getState().setTabDirty(key, path, true);
      updateArtifactPreview("response-1", {
        textContent: "new source result",
        isStreaming: false,
      });
    });
    expect(activeTab()).toMatchObject({
      content: "unsaved local change",
      dirty: true,
      artifact: { textContent: "unsaved local change", isStreaming: false },
    });
    expect(screen.getByTestId("preview-content")).toHaveTextContent(
      "unsaved local change",
    );
  });

  it("releases a hidden file preview while preserving its tab and unsaved buffer", async () => {
    const target = { source: "workspace" as const, path: "notes.md" };
    const { rerender } = render(
      <FilesWorkspace scope={scope} initialTarget={target} />,
    );
    expect(await screen.findByTestId("preview-content")).toHaveTextContent(
      "disk:notes.md",
    );
    act(() => {
      useCodingTabsStore
        .getState()
        .setTabContent(key, "notes.md", "unsaved buffer");
      useCodingTabsStore.getState().setTabDirty(key, "notes.md", true);
    });
    const before = activeTab();
    rerender(
      <FilesWorkspace scope={scope} initialTarget={target} active={false} />,
    );
    expect(screen.queryByTestId("preview-content")).not.toBeInTheDocument();
    expect(activeTab()).toBe(before);
    rerender(<FilesWorkspace scope={scope} initialTarget={target} active />);
    expect(await screen.findByTestId("preview-content")).toHaveTextContent(
      "unsaved buffer",
    );
    expect(activeTab()).toMatchObject({
      content: "unsaved buffer",
      dirty: true,
    });
  });

  it("saves actual artifact bytes with session and root scope and opens the returned conflict-renamed path", async () => {
    const upload = deferred<{ files: { path: string; status: string }[] }>();
    api.upload.mockReturnValue(upload.promise);
    render(
      <FilesWorkspace
        scope={scope}
        initialTarget={{
          ...artifact("response-1", "# saved result"),
          root: "project:C:/extra",
        }}
      />,
    );
    const dialog = await openSave();
    const input = within(dialog).getByRole("textbox");
    fireEvent.change(input, { target: { value: "../secret.md" } });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.save" }),
    );
    expect(await within(dialog).findByRole("alert")).toBeInTheDocument();
    expect(api.upload).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "reports/reply" } });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.save" }),
    );
    await waitFor(() => expect(api.upload).toHaveBeenCalledOnce());
    const [files, directory, conflict, chatId, root, override] =
      api.upload.mock.calls[0];
    expect([directory, conflict, chatId, root, override]).toEqual([
      "reports",
      "rename",
      "chat-a",
      "project:C:/extra",
      undefined,
    ]);
    expect(files[0].name).toBe("reply.md");
    expect(await fileText(files[0])).toBe("# saved result");
    expect(activeTab()?.source).toBe("artifact");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await act(async () =>
      upload.resolve({
        files: [{ path: "reports/reply (1).md", status: "uploaded" }],
      }),
    );
    await waitFor(() =>
      expect(activeTab()).toMatchObject({
        displayPath: "reports/reply (1).md",
        source: "workspace",
        workspaceRoot: "project:C:/extra",
        etag: "v1",
      }),
    );
    expect(api.text).toHaveBeenCalledWith(
      "reports/reply (1).md",
      "chat-a",
      "project:C:/extra",
      undefined,
    );
    expect(currentTabs()[0].content).toBe("# saved result");
    expect(api.save).not.toHaveBeenCalled();
  });

  it("keeps the artifact and retries a failed save using a new session's pending project directory", async () => {
    api.upload
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        files: [{ path: "reply.md", status: "uploaded" }],
      });
    const pendingScope = {
      kind: "session" as const,
      agentId: "agent-a",
      sessionId: "session-a",
      projectDirOverride: "C:/pending",
    };
    render(
      <FilesWorkspace
        scope={pendingScope}
        initialTarget={artifact("response-1", "original result")}
      />,
    );
    const dialog = await openSave();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.save" }),
    );
    expect(await within(dialog).findByRole("alert")).toBeInTheDocument();
    expect(activeTab()).toMatchObject({
      content: "original result",
      source: "artifact",
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: /common.save/ }),
    );
    await waitFor(() => expect(activeTab()?.source).toBe("workspace"));
    expect(api.upload).toHaveBeenLastCalledWith(
      expect.any(Array),
      "",
      "rename",
      undefined,
      "project",
      "C:/pending",
    );
  });

  it("cancels save-as without writing or changing the artifact", async () => {
    render(
      <FilesWorkspace
        scope={scope}
        initialTarget={artifact("response-1", "original result")}
      />,
    );
    const dialog = await openSave();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.cancel" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(api.upload).not.toHaveBeenCalled();
    expect(activeTab()).toMatchObject({
      content: "original result",
      source: "artifact",
    });
  });

  it("keeps a later existing tab selected while the saved file is still loading", async () => {
    const metadata = deferred<{ preview_kind: string; etag: string }>();
    api.upload.mockResolvedValue({
      files: [{ path: "saved.md", status: "uploaded" }],
    });
    api.metadata.mockImplementation((path: string) =>
      path === "saved.md"
        ? metadata.promise
        : Promise.resolve({ preview_kind: "text", etag: "v1" }),
    );
    useCodingTabsStore.setState({
      tabsByAgent: {
        [key]: [
          {
            path: "existing.txt",
            displayPath: "existing.txt",
            content: "unsaved draft",
            dirty: true,
            source: "workspace",
          },
        ],
      },
    });
    render(
      <FilesWorkspace
        scope={scope}
        initialTarget={artifact("response-1", "original result")}
      />,
    );
    const dialog = await openSave();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.save" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(api.metadata).toHaveBeenCalledWith(
        "saved.md",
        "chat-a",
        "project",
        undefined,
      ),
    );
    fireEvent.click(screen.getByRole("tab", { name: /existing.txt/ }));
    await act(async () =>
      metadata.resolve({ preview_kind: "text", etag: "v2" }),
    );
    expect(activeTab()).toMatchObject({
      path: "existing.txt",
      content: "unsaved draft",
      dirty: true,
    });
    expect(currentTabs().some((tab) => tab.displayPath === "saved.md")).toBe(
      false,
    );
  });

  it("reports source byte sizes to the drawer for files and inline artifacts", async () => {
    const changed = vi.fn();
    api.metadata.mockResolvedValue({
      preview_kind: "text",
      etag: "v1",
      size: 123,
    });
    const { rerender } = render(
      <FilesWorkspace
        scope={scope}
        initialTarget={{ source: "workspace", path: "notes.md" }}
        onActiveTargetChange={changed}
      />,
    );
    await waitFor(() =>
      expect(changed).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: "notes.md", size: 123 }),
      ),
    );
    rerender(
      <FilesWorkspace
        scope={scope}
        initialTarget={artifact("response-1", "中文")}
        onActiveTargetChange={changed}
      />,
    );
    await waitFor(() =>
      expect(changed).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: "reply.md", size: 6 }),
      ),
    );
  });

  it("refreshes byte sizes when restoring, reloading and reselecting a file", async () => {
    const changed = vi.fn();
    useCodingTabsStore.setState({
      tabsByAgent: {
        [key]: [
          {
            path: "notes.md",
            displayPath: "notes.md",
            content: "",
            dirty: false,
            source: "workspace",
            previewKind: "text",
          },
        ],
      },
      activeTabByAgent: { [key]: "notes.md" },
    });
    api.metadata.mockResolvedValue({
      preview_kind: "text",
      etag: "v1",
      size: 10,
    });
    render(<FilesWorkspace scope={scope} onActiveTargetChange={changed} />);
    await waitFor(() =>
      expect(changed).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: "notes.md", size: 10 }),
      ),
    );

    // A changed size must propagate even when the text/ETag are unchanged.
    api.metadata.mockResolvedValue({
      preview_kind: "text",
      etag: "v1",
      size: 20,
    });
    fireEvent.click(
      screen.getByRole("button", { name: /workspace.reload|刷新/ }),
    );
    await waitFor(() =>
      expect(changed).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: "notes.md", size: 20 }),
      ),
    );

    api.metadata.mockResolvedValue({
      preview_kind: "text",
      etag: "v1",
      size: 30,
    });
    fireEvent.click(screen.getByRole("tab", { name: /notes.md/ }));
    await waitFor(() =>
      expect(changed).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: "notes.md", size: 30 }),
      ),
    );
    expect(activeTab()).toMatchObject({
      content: "disk:notes.md",
      size: 30,
      dirty: false,
    });
  });

  it("does not reopen a saved file after the workspace switches to another session", async () => {
    const upload = deferred<{ files: { path: string; status: string }[] }>();
    api.upload.mockReturnValue(upload.promise);
    const { rerender } = render(
      <FilesWorkspace
        scope={scope}
        initialTarget={artifact("response-1", "original result")}
      />,
    );
    const dialog = await openSave();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "common.save" }),
    );
    await waitFor(() => expect(api.upload).toHaveBeenCalledOnce());
    rerender(
      <FilesWorkspace
        scope={{ ...scope, sessionId: "session-b", chatId: "chat-b" }}
      />,
    );
    await act(async () =>
      upload.resolve({ files: [{ path: "reply.md", status: "uploaded" }] }),
    );
    expect(api.text).not.toHaveBeenCalled();
    expect(
      useCodingTabsStore.getState().tabsByAgent["session:agent-a:session-b"] ??
        [],
    ).toHaveLength(0);
  });

  it("keeps preview-only document content visible with no route to a hidden navigator", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    const { container, rerender } = render(
      <FilesWorkspace scope={scope} hideNavigator />,
    );
    expect(container.querySelector("[data-mobile-pane]")).toHaveAttribute(
      "data-mobile-pane",
      "document",
    );
    expect(screen.queryByLabelText("files.navigator")).not.toBeInTheDocument();
    expect(screen.queryByText("file navigator")).not.toBeInTheDocument();
    rerender(
      <FilesWorkspace
        scope={scope}
        hideNavigator
        initialTarget={artifact("response-1", "visible result")}
      />,
    );
    expect(await screen.findByTestId("preview-content")).toHaveTextContent(
      "visible result",
    );
    rerender(<FilesWorkspace scope={scope} />);
    expect(screen.getByText("file navigator")).toBeInTheDocument();
    fireEvent.click(
      within(screen.getByRole("main")).getByLabelText("files.navigator"),
    );
    expect(container.querySelector("[data-mobile-pane]")).toHaveAttribute(
      "data-mobile-pane",
      "navigator",
    );
    rerender(<FilesWorkspace scope={scope} hideNavigator />);
    expect(container.querySelector("[data-mobile-pane]")).toHaveAttribute(
      "data-mobile-pane",
      "document",
    );
    expect(screen.getByTestId("preview-content")).toHaveTextContent(
      "visible result",
    );
  });
});
