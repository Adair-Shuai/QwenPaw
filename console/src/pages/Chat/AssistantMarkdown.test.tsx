import React, { useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AssistantMarkdown } from "./AssistantMarkdown";
import { chatExtensions } from "../../plugins/registry/chatExtensions";
import type { ChatCodeBlockProps } from "../../plugins/types/qwenpaw";
import { getAnswerSelection } from "./components/AnswerQuoteComposer";
import { TurnFilesScopeProvider } from "../../features/files-workspace/TurnFilesScope";

vi.mock("@agentscope-ai/design", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  ConfigProvider: Object.assign(() => null, {
    ConfigContext: React.createContext({
      getPrefixCls: (name: string) => name,
    }),
  }),
}));

vi.mock("../../contexts/FontSizeContext", () => ({
  useEffectiveFontSize: () => 14,
}));
vi.mock("../../plugins/hostSdk/hooks", () => ({
  useHostSelectedAgent: () => ({ id: "agent-a" }),
  useHostCurrentSession: () => ({ id: "session-a" }),
}));
vi.mock("../../components/RenderableCodeBlock/RenderableCodeBlock", () => ({
  RenderableCodeBlock: ({ children }: { children: React.ReactNode }) => (
    <code>{children}</code>
  ),
}));

afterEach(() => {
  cleanup();
  chatExtensions.__resetForTests();
});

describe("assistant code block plugins", () => {
  it("does not rerender unchanged answer plugins during unrelated composer updates", () => {
    const seen = vi.fn();
    chatExtensions.addCodeBlock("performance", "custom-ui", (props) => {
      seen(props.source);
      return <span>{props.source}</span>;
    });
    function Chat() {
      const [draft, setDraft] = useState("");
      const [source, setSource] = useState("first");
      return (
        <>
          <input
            aria-label="draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button onClick={() => setSource("second")}>next delta</button>
          <AssistantMarkdown
            messageId="stable"
            cursor={false}
            content={`\`\`\`custom-ui\n${source}\n\`\`\``}
          />
        </>
      );
    }
    render(<Chat />);
    expect(screen.getByText("first")).toBeInTheDocument();
    seen.mockClear();
    for (let i = 0; i < 30; i++) {
      fireEvent.change(screen.getByLabelText("draft"), {
        target: { value: `draft ${i}` },
      });
    }
    expect(seen).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("next delta"));
    expect(screen.getByText("second")).toBeInTheDocument();
    expect(seen).toHaveBeenCalled();
    act(() => {
      chatExtensions.addCodeBlock("performance", "custom-ui", () => (
        <span>reloaded plugin</span>
      ));
    });
    expect(screen.getByText("reloaded plugin")).toBeInTheDocument();
  });

  it.each([false, true])(
    "keeps slash-separated prose literal beside real file and directory references with plugins=%s",
    (plugins) => {
      if (plugins)
        chatExtensions.addCodeBlock("test", "custom-ui", () => <span>UI</span>);
      const path = String.raw`C:\Users\shuai\.qwenpaw\workspaces\default`;
      const view = render(
        <AssistantMarkdown
          messageId="prose-path-boundary"
          cursor={false}
          content={`折腾点代码/脚本，**代码**/脚本，\`代码\`/脚本。\n\n工作目录是\`${path}\`，档案是\`PROFILE.md\`，源文件 [实现](src/app.ts#L12)。`}
        />,
      );
      expect(view.container.textContent?.match(/代码\/脚本/g)).toHaveLength(3);
      expect(
        view.container.querySelector('a[data-directory-reference="/脚本"]'),
      ).toBeNull();
      expect(screen.getAllByRole("link")).toHaveLength(3);
      expect(screen.getByRole("link", { name: path })).toHaveAttribute(
        "data-directory-reference",
        path.replace(/\\/g, "/"),
      );
      expect(screen.getByRole("link", { name: "PROFILE.md" })).toHaveAttribute(
        "data-file-reference",
        "PROFILE.md",
      );
      expect(screen.getByRole("link", { name: "实现 L12" })).toHaveAttribute(
        "data-file-reference",
        "src/app.ts",
      );
    },
  );

  it.each([false, true])(
    "opens inline directory locations in the file manager with original scope and plugins=%s",
    (plugins) => {
      if (plugins)
        chatExtensions.addCodeBlock("test", "custom-ui", () => <span>UI</span>);
      const reveal = vi.fn();
      const preview = vi.fn();
      window.addEventListener("qwenpaw:reveal-file", reveal);
      window.addEventListener("qwenpaw:open-file-preview", preview);
      const path = String.raw`C:\Users\shuai\.qwenpaw\workspaces\default`;
      try {
        render(
          <AssistantMarkdown
            messageId="directory-mentions"
            cursor={false}
            content={`工作目录在 \`${path}\`。也可打开 ${path}。查看 [输出目录](docs/)，构建用 [构建文件](C:/Work/Makefile)。`}
          />,
        );
        const links = screen.getAllByRole("link", { name: path });
        expect(links).toHaveLength(2);
        for (const link of links) {
          expect(link).toHaveAttribute(
            "data-directory-reference",
            path.replace(/\\/g, "/"),
          );
          expect(link.querySelector(".lucide-folder-open")).toBeInTheDocument();
          fireEvent.click(link);
        }
        expect(reveal).toHaveBeenCalledTimes(2);
        expect(reveal.mock.calls[0][0].detail).toMatchObject({
          agentId: "agent-a",
          sessionId: "session-a",
          target: { source: "workspace", path: path.replace(/\\/g, "/") },
        });
        fireEvent.click(screen.getByRole("link", { name: "输出目录" }));
        expect(reveal.mock.calls[2][0].detail.target.path).toBe("docs/");
        expect(preview).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("link", { name: "构建文件" }));
        expect(preview.mock.calls[0][0].detail.target).toMatchObject({
          source: "workspace",
          path: "C:/Work/Makefile",
        });
        expect(reveal).toHaveBeenCalledTimes(3);
      } finally {
        window.removeEventListener("qwenpaw:reveal-file", reveal);
        window.removeEventListener("qwenpaw:open-file-preview", preview);
      }
    },
  );

  it.each([false, true])(
    "opens inline and plain filenames from historical answers with plugins=%s",
    (plugins) => {
      if (plugins)
        chatExtensions.addCodeBlock("test", "custom-ui", () => <span>UI</span>);
      const open = vi.fn();
      window.addEventListener("qwenpaw:open-file-preview", open);
      try {
        const view = render(
          <AssistantMarkdown
            messageId="file-mentions"
            cursor={false}
            content={
              "当前的实情是：`PROFILE.md` 仍为空。写进 PROFILE.md 后继续。查看 src/app.ts:12-18、`./PROFILE.md` 和 `docs/PROFILE.md`，身份是 `default`。\n\n```python\nprint('PROFILE.md')\n```\n\n[`PROFILE.md`](https://example.com) 和 [项目档案](PROFILE.md)"
            }
          />,
        );
        const profiles = screen
          .getAllByRole("link", { name: "PROFILE.md" })
          .filter(
            (link) => link.getAttribute("data-file-reference") === "PROFILE.md",
          );
        expect(profiles).toHaveLength(3);
        fireEvent.click(profiles[0]);
        expect(open.mock.calls[0][0].detail).toMatchObject({
          agentId: "agent-a",
          sessionId: "session-a",
          target: { source: "profile", path: "PROFILE.md" },
        });
        fireEvent.click(profiles[1]);
        expect(open.mock.calls[1][0].detail.target.source).toBe("profile");
        fireEvent.click(profiles[2]);
        expect(open.mock.calls[2][0].detail.target).toMatchObject({
          source: "workspace",
          path: "PROFILE.md",
        });
        fireEvent.click(screen.getByRole("link", { name: "app.ts L12–18" }));
        expect(open.mock.calls[3][0].detail.target).toMatchObject({
          source: "workspace",
          path: "src/app.ts",
          line: 12,
          endLine: 18,
        });
        fireEvent.click(
          view.container.querySelector(
            '[data-file-reference="docs/PROFILE.md"]',
          )!,
        );
        expect(open.mock.calls[4][0].detail.target).toMatchObject({
          source: "workspace",
          path: "docs/PROFILE.md",
        });
        fireEvent.click(screen.getByRole("link", { name: "项目档案" }));
        expect(open.mock.calls[5][0].detail.target).toMatchObject({
          source: "workspace",
          path: "PROFILE.md",
        });
        expect(view.container.querySelector("code")).toHaveTextContent(
          "default",
        );
        expect(
          view.container.querySelector('a[href="https://example.com"]'),
        ).toHaveTextContent("PROFILE.md");
        expect(
          view.container.querySelector('a[href="https://example.com"] a'),
        ).toBeNull();
      } finally {
        window.removeEventListener("qwenpaw:open-file-preview", open);
      }
    },
  );

  it("keeps file mention routing when a streamed filename finishes and is restored from history", () => {
    const view = render(
      <AssistantMarkdown
        messageId="streamed-mention"
        cursor={false}
        content="写进 `PROFILE.m"
      />,
    );
    view.rerender(
      <AssistantMarkdown
        messageId="streamed-mention"
        cursor={false}
        content="写进 `PROFILE.md`"
      />,
    );
    expect(screen.getByRole("link", { name: "PROFILE.md" })).toHaveAttribute(
      "data-file-reference",
      "PROFILE.md",
    );
    view.unmount();
    render(
      <AssistantMarkdown
        messageId="history-mention"
        cursor={false}
        content="写进 `PROFILE.md`"
      />,
    );
    expect(screen.getByRole("link", { name: "PROFILE.md" })).toHaveAttribute(
      "data-file-reference",
      "PROFILE.md",
    );
  });

  it("adopts a newly allocated session and keeps references bound to it across later navigation", () => {
    const open = vi.fn();
    window.addEventListener("qwenpaw:open-file-preview", open);
    const response = (
      <AssistantMarkdown
        messageId="allocation"
        cursor={false}
        content="[source](src/app.ts#L12)"
      />
    );
    const scope = {
      kind: "session" as const,
      agentId: "agent-a",
      sessionId: "new",
    };
    try {
      const view = render(
        <TurnFilesScopeProvider value={scope}>
          {response}
        </TurnFilesScopeProvider>,
      );
      view.rerender(
        <TurnFilesScopeProvider
          value={{ ...scope, sessionId: "allocated", chatId: "chat-a" }}
        >
          {response}
        </TurnFilesScopeProvider>,
      );
      fireEvent.click(screen.getByRole("link", { name: "source L12" }));
      expect(open.mock.calls[0][0].detail).toMatchObject({
        agentId: "agent-a",
        sessionId: "allocated",
        chatId: "chat-a",
      });
      view.rerender(
        <TurnFilesScopeProvider
          value={{ ...scope, sessionId: "other", chatId: "chat-b" }}
        >
          {response}
        </TurnFilesScopeProvider>,
      );
      fireEvent.click(screen.getByRole("link", { name: "source L12" }));
      expect(open.mock.calls[1][0].detail).toMatchObject({
        sessionId: "allocated",
        chatId: "chat-a",
      });
    } finally {
      window.removeEventListener("qwenpaw:open-file-preview", open);
    }
  });
  it.each([false, true])(
    "opens file references through the real Markdown renderer with plugins=%s",
    (plugins) => {
      if (plugins)
        chatExtensions.addCodeBlock("test", "custom-ui", () => <span>UI</span>);
      const open = vi.fn();
      window.addEventListener("qwenpaw:open-file-preview", open);
      try {
        render(
          <AssistantMarkdown
            messageId="file-references"
            cursor={false}
            content={
              "See [implementation](C:/Work/src/app.ts:12-18), [notes](<docs/research notes.md#L8>) and [website](https://example.com)."
            }
          />,
        );
        const reference = screen.getByRole("link", {
          name: "implementation L12–18",
        });
        expect(reference).toHaveAttribute(
          "title",
          "C:/Work/src/app.ts · L12–18",
        );
        fireEvent.click(reference);
        expect(open.mock.calls[0][0].detail).toMatchObject({
          agentId: "agent-a",
          sessionId: "session-a",
          target: {
            source: "workspace",
            path: "C:/Work/src/app.ts",
            line: 12,
            endLine: 18,
          },
        });
        fireEvent.click(screen.getByRole("link", { name: "notes L8" }));
        expect(open.mock.calls[1][0].detail.target).toMatchObject({
          path: "docs/research notes.md",
          line: 8,
        });
        expect(screen.getByRole("link", { name: "website" })).toHaveAttribute(
          "href",
          "https://example.com",
        );
      } finally {
        window.removeEventListener("qwenpaw:open-file-preview", open);
      }
    },
  );

  it("keeps streamed file references and history on the same original destination", () => {
    const view = render(
      <AssistantMarkdown
        messageId="stream-file"
        cursor={false}
        content="See [source](src/app.ts#L"
      />,
    );
    view.rerender(
      <AssistantMarkdown
        messageId="stream-file"
        cursor={false}
        content="See [source](src/app.ts#L12C4)"
      />,
    );
    expect(screen.getByRole("link", { name: "source L12 C4" })).toHaveAttribute(
      "title",
      "src/app.ts · L12 C4",
    );
    expect(view.container.textContent).toContain("See");
  });

  it("keeps answer text selectable for quoting across a file reference", () => {
    const view = render(
      <div data-answer-quote-source="answer:0">
        <AssistantMarkdown
          messageId="answer"
          cursor={false}
          content="Read [source](src/app.ts#L12) for details."
        />
      </div>,
    );
    const source = view.container.querySelector("[data-answer-quote-source]")!;
    const range = document.createRange();
    range.selectNodeContents(source);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    expect(getAnswerSelection(view.container, selection)).toMatchObject({
      messageId: "answer:0",
    });
    selection.removeAllRanges();
  });

  it("normalizes registration and fence languages and restores an earlier renderer", () => {
    chatExtensions.addCodeBlock("test", " My-UI ", ({ language }) => (
      <span>first renderer: {language}</span>
    ));
    const latest = chatExtensions.addCodeBlock("test", "my-ui", () => (
      <span>latest renderer</span>
    ));
    const view = render(
      <AssistantMarkdown
        messageId="case"
        content={'```MY-UI title="Example"\nsource\n```'}
        cursor={false}
      />,
    );
    expect(screen.getByText("latest renderer")).toBeInTheDocument();
    act(() => latest.dispose());
    expect(screen.getByText("first renderer: my-ui")).toBeInTheDocument();
    act(() => chatExtensions.disposeAll("test"));
    expect(screen.queryByText("first renderer: my-ui")).not.toBeInTheDocument();
    expect(view.container.querySelector("code")).toHaveTextContent("source");
  });

  it.each(["openui-lang", "custom-ui"])(
    "keeps streamed %s source inside its renderer across token boundaries",
    (language) => {
      chatExtensions.addCodeBlock("test", language, () => (
        <span>Interactive content</span>
      ));
      const content = `Before\n\n\`\`\`${language} title="Demo"\nroot = Stack([privateDefinition])\n\`\`\`\n\nAfter`;
      const view = render(
        <AssistantMarkdown
          messageId="source"
          content=""
          cursor={false}
          isStreaming
        />,
      );
      for (let i = 1; i <= content.length; i++) {
        view.rerender(
          <AssistantMarkdown
            messageId="source"
            content={content.slice(0, i)}
            cursor={false}
            isStreaming
          />,
        );
        expect(
          view.container.querySelector("code")?.textContent?.trim() ?? "",
        ).toBe("");
        expect(view.container.textContent).not.toContain("root =");
      }
      expect(view.container.textContent).toMatch(
        /Before[\s\S]*Interactive content[\s\S]*After/,
      );
    },
  );

  it("does not finalize an open fence between native deltas with no text cursor", () => {
    const seen: ChatCodeBlockProps[] = [];
    chatExtensions.addCodeBlock("test", "openui-lang", (props) => {
      seen.push(props);
      return <span>{props.isStreaming ? "Generating UI" : "Final UI"}</span>;
    });
    const content = 'Before\n\n```openui-lang\nroot = TextContent("hello")';
    const view = render(
      <AssistantMarkdown
        messageId="native"
        content=""
        cursor={false}
        isStreaming
      />,
    );
    for (let i = 1; i <= content.length; i++) {
      view.rerender(
        <AssistantMarkdown
          messageId="native"
          content={content.slice(0, i)}
          cursor={false}
          isStreaming
        />,
      );
    }
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((props) => props.isStreaming)).toBe(true);
    expect(screen.queryByText("Final UI")).not.toBeInTheDocument();
    // A closing fence can finish this block while the message continues.
    view.rerender(
      <AssistantMarkdown
        messageId="native"
        content={content + "\n```"}
        cursor={false}
        isStreaming
      />,
    );
    expect(screen.getByText("Final UI")).toBeInTheDocument();
    // A response ending without a closing fence must still leave the placeholder.
    view.rerender(
      <AssistantMarkdown
        messageId="native"
        content={content}
        cursor={false}
        isStreaming={false}
      />,
    );
    expect(screen.getByText("Final UI")).toBeInTheDocument();
  });

  it("streams original source and preserves local state as later blocks arrive", () => {
    const seen: ChatCodeBlockProps[] = [];
    function UI(props: ChatCodeBlockProps) {
      seen.push(props);
      const [value, setValue] = useState(5);
      return (
        <button disabled={props.isStreaming} onClick={() => setValue(8)}>
          {value}
        </button>
      );
    }
    const registration = chatExtensions.addCodeBlock("test", "openui-lang", UI);
    const start = 'Before\n\n```openui-lang\nroot = TextContent("hello")';
    const view = render(
      <AssistantMarkdown messageId="m1" content={start} cursor />,
    );
    expect(seen[seen.length - 1]?.source).toBe('root = TextContent("hello")\n');
    expect(seen[seen.length - 1]?.isStreaming).toBe(true);
    const blockId = seen[seen.length - 1]?.blockId;
    const closed = start + "\n```\n\nAfter";
    view.rerender(<AssistantMarkdown messageId="m1" content={closed} cursor />);
    expect(seen[seen.length - 1]?.isStreaming).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(screen.getByRole("button", { name: "8" })).toBeEnabled();
    const withSecond =
      closed + '\n\n```openui-lang\nroot = TextContent("second")';
    view.rerender(
      <AssistantMarkdown messageId="m1" content={withSecond} cursor />,
    );
    expect(screen.getByRole("button", { name: "8" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "5" })).toBeDisabled();
    view.rerender(
      <AssistantMarkdown
        messageId="m1"
        content={withSecond + "\n```"}
        cursor={false}
      />,
    );
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "8",
      "5",
    ]);
    expect(
      seen
        .slice()
        .reverse()
        .find((p) => p.source.includes("hello"))?.blockId,
    ).toBe(blockId);
    expect(view.container.textContent).toMatch(/Before\s*8\s*After\s*5/);
    act(() => registration.dispose());
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(view.container.querySelectorAll("code")).toHaveLength(2);
  });

  it("renders ordinary and escaped examples as code; restores an earlier registration", () => {
    chatExtensions.addCodeBlock("a", "openui-lang", () => (
      <span>first plugin</span>
    ));
    const second = chatExtensions.addCodeBlock("b", "openui-lang", () => (
      <span>second plugin</span>
    ));
    const content =
      '```js\nalert(1)\n```\n\n````text\n```openui-lang\nroot = TextContent("example")\n```\n````\n\n```openui-lang\nroot = TextContent("live")\n```';
    const view = render(
      <AssistantMarkdown content={content} cursor={false} messageId="m2" />,
    );
    expect(screen.getByText("second plugin")).toBeInTheDocument();
    expect(view.container.querySelectorAll("code")).toHaveLength(2);
    act(() => second.dispose());
    expect(screen.getByText("first plugin")).toBeInTheDocument();
  });

  it("handles a mixed response split at every character boundary", () => {
    const sources: string[] = [];
    chatExtensions.addCodeBlock("test", "openui-lang", (props) => {
      sources.push(props.source);
      return <span data-testid="inline">{props.source}</span>;
    });
    const content =
      'Before\n\n```openui-lang\nroot = TextContent("hello")\n```\n\nAfter';
    const view = render(
      <AssistantMarkdown messageId="chunked" content="" cursor />,
    );
    for (let i = 1; i <= content.length; i++) {
      view.rerender(
        <AssistantMarkdown
          messageId="chunked"
          content={content.slice(0, i)}
          cursor
        />,
      );
    }
    view.rerender(
      <AssistantMarkdown
        messageId="chunked"
        content={content}
        cursor={false}
      />,
    );
    expect(screen.getAllByTestId("inline")).toHaveLength(1);
    expect(sources[sources.length - 1]).toBe('root = TextContent("hello")\n');
    expect(sources.every((source) => !source.includes(":dot:"))).toBe(true);
    expect(view.container.textContent).toMatch(
      /Before[\s\S]*hello[\s\S]*After/,
    );
  });

  it("preserves identical UI blocks and their state when late references restructure Markdown", () => {
    const seen: string[] = [];
    let mounts = 0;
    chatExtensions.addCodeBlock("test", "openui-lang", (props) => {
      const [value, setValue] = useState(5);
      React.useEffect(() => {
        mounts++;
      }, []);
      seen.push(props.blockId);
      return <button onClick={() => setValue(8)}>{value}</button>;
    });
    const block = "```openui-lang\nsame source\n```";
    const content = `[reference][ref]\n\n${block}\n\n> ${block
      .split("\n")
      .join("\n> ")}`;
    const view = render(
      <AssistantMarkdown messageId="refs" content={content} cursor />,
    );
    const ids = [...new Set(seen)];
    expect(ids).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button")[0]);
    const button = screen.getByRole("button", { name: "8" });
    view.rerender(
      <AssistantMarkdown
        messageId="refs"
        content={content + "\n\n[ref]: https://example.com"}
        cursor={false}
      />,
    );
    expect(screen.getByRole("link", { name: "reference" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "8",
      "5",
    ]);
    expect(screen.getByRole("button", { name: "8" })).toBe(button);
    expect([...new Set(seen)]).toEqual(ids);
    expect(mounts).toBe(2);
  });

  it.each(["openui-lang", "my-ui"])(
    "keeps a %s footnote form separate when a new body block moves it",
    (language) => {
      const submissions: { blockId: string; value: string }[] = [];
      let mounts = 0;
      chatExtensions.addCodeBlock("test", language, ({ blockId }) => {
        const [value, setValue] = useState("");
        React.useEffect(() => {
          mounts++;
        }, []);
        return (
          <div>
            <input
              aria-label="Name"
              data-block-id={blockId}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <button onClick={() => submissions.push({ blockId, value })}>
              Submit
            </button>
          </div>
        );
      });
      const block = "```" + language + "\nsame source\n```";
      const content =
        "Details[^note].\n\n[^note]:\n    " + block.split("\n").join("\n    ");
      const view = render(
        <AssistantMarkdown messageId="footnote" content={content} cursor />,
      );
      const note = screen.getByRole("textbox");
      const noteId = note.getAttribute("data-block-id");
      note.focus();
      fireEvent.change(note, { target: { value: "edited note" } });
      const tail = "\n\nNew body form:\n\n" + block;
      for (let i = 1; i <= tail.length; i++) {
        view.rerender(
          <AssistantMarkdown
            messageId="footnote"
            content={content + tail.slice(0, i)}
            cursor
          />,
        );
        expect(view.container.querySelector("[data-footnotes] input")).toBe(
          note,
        );
        expect(note).toHaveValue("edited note");
        expect(note).toHaveAttribute("data-block-id", noteId);
        expect(note).toHaveFocus();
      }
      const [body, afterNote] = screen.getAllByRole("textbox");
      expect(afterNote).toBe(note);
      expect(body).toHaveValue("");
      expect(body.getAttribute("data-block-id")).not.toBe(noteId);
      expect(mounts).toBe(2);
      fireEvent.change(body, { target: { value: "edited body" } });
      const buttons = screen.getAllByRole("button", { name: "Submit" });
      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[1]);
      expect(submissions).toEqual([
        { blockId: body.getAttribute("data-block-id"), value: "edited body" },
        { blockId: noteId, value: "edited note" },
      ]);
    },
  );

  it("keeps multiple blocks in a footnote when an earlier footnote reference resolves", () => {
    chatExtensions.addCodeBlock("test", "custom-ui", ({ blockId }) => (
      <input aria-label="Name" data-block-id={blockId} defaultValue="" />
    ));
    const block = "```custom-ui\nsame source\n```";
    const content =
      "See[^early] and[^late].\n\n[^late]:\n    " +
      (block + "\n\n" + block).split("\n").join("\n    ");
    const view = render(
      <AssistantMarkdown messageId="notes" content={content} cursor />,
    );
    const [first, second] = screen.getAllByRole("textbox");
    fireEvent.change(first, { target: { value: "first note" } });
    fireEvent.change(second, { target: { value: "second note" } });
    const ids = [first, second].map((input) =>
      input.getAttribute("data-block-id"),
    );
    view.rerender(
      <AssistantMarkdown
        messageId="notes"
        content={
          content + "\n\n[^early]:\n    " + block.split("\n").join("\n    ")
        }
        cursor={false}
      />,
    );
    const [early, ...late] = screen.getAllByRole("textbox");
    expect(early).toHaveValue("");
    expect(late).toEqual([first, second]);
    expect(first).toHaveValue("first note");
    expect(second).toHaveValue("second note");
    expect(late.map((input) => input.getAttribute("data-block-id"))).toEqual(
      ids,
    );
    expect(new Set([early.getAttribute("data-block-id"), ...ids]).size).toBe(3);
  });

  it.each(["openui-lang", "my-ui"])(
    "matches %s fences with metadata",
    (language) => {
      const seen: ChatCodeBlockProps[] = [];
      chatExtensions.addCodeBlock("custom", language, (props) => {
        seen.push(props);
        return <button>Custom UI</button>;
      });
      render(
        <AssistantMarkdown
          messageId="metadata"
          content={
            "```" + language.toUpperCase() + ' title="Demo"\nsource\n```'
          }
          cursor={false}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Custom UI" }),
      ).toBeInTheDocument();
      expect(seen[seen.length - 1]).toMatchObject({
        language,
        source: "source\n",
        isStreaming: false,
      });
    },
  );

  it("keeps editable fields focused across stream updates and late reference resolution", () => {
    chatExtensions.addCodeBlock("test", "openui-lang", () => (
      <input aria-label="Name" defaultValue="" />
    ));
    const content = "[reference][ref]\n\n```openui-lang\nform\n```";
    const view = render(
      <React.StrictMode>
        <AssistantMarkdown messageId="form" content={content} cursor />
      </React.StrictMode>,
    );
    const input = screen.getByRole("textbox");
    input.focus();
    fireEvent.change(input, { target: { value: "Alice" } });
    for (const tail of [
      "\n\nMore text",
      "\n\nMore text\n\n[ref]: https://example.com",
    ]) {
      view.rerender(
        <React.StrictMode>
          <AssistantMarkdown messageId="form" content={content + tail} cursor />
        </React.StrictMode>,
      );
      expect(screen.getByRole("textbox")).toBe(input);
      expect(input).toHaveValue("Alice");
      expect(input).toHaveFocus();
    }
    view.rerender(
      <React.StrictMode>
        <AssistantMarkdown
          messageId="new-message"
          content={content}
          cursor={false}
        />
      </React.StrictMode>,
    );
    expect(screen.getByRole("textbox")).not.toBe(input);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("keeps ordinary Markdown and unregistered languages on the default path", () => {
    const view = render(
      <AssistantMarkdown
        messageId="plain"
        content={
          '[reference][ref]\n\n```openui-lang title="Example"\nsource\n```\n\n[ref]: https://example.com'
        }
        cursor={false}
      />,
    );
    expect(screen.getByRole("link", { name: "reference" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(view.container.querySelector("code")).toHaveTextContent("source");
    expect(
      view.container.querySelector('span[style="display: contents;"]'),
    ).toBeNull();
  });

  it("isolates a throwing plugin to the original code fallback", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    chatExtensions.addCodeBlock("bad", "openui-lang", () => {
      throw new Error("broken");
    });
    const view = render(
      <AssistantMarkdown
        content={"Before\n\n```openui-lang\ninvalid\n```\n\nAfter"}
        cursor={false}
        messageId="m3"
      />,
    );
    expect(view.container.querySelector("code")?.textContent).toContain(
      "invalid",
    );
    expect(view.container.textContent).toContain("After");
    log.mockRestore();
  });
});
