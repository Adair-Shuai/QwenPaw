import fs from "node:fs";
import path from "node:path";
import React from "react";
import * as antd from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MemoryRouter } from "react-router-dom";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { routeRegistry } from "./registry/store";

describe.each([
  "plugins/bundle/ugsci/ui/dist/index.js",
  "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
])("expert file workbench in %s", (bundlePath) => {
  const messages = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  let files: Record<string, string>;
  let mounted: string[];
  let writes: {
    url: string;
    agent: string | null;
    body: Record<string, unknown>;
  }[];
  let failWrite: boolean;
  let failMount: boolean;
  let failRead: string;
  let deferredRead: {
    name: string;
    resolve?: (response: Response) => void;
  } | null;
  let deferredWrite: { resolve?: (response: Response) => void } | null;
  let fetchHost: ReturnType<typeof vi.fn>;
  let observeCommit: (() => void) | undefined;
  const response = (value: unknown, status = 200) =>
    new Response(JSON.stringify(value), { status });

  beforeEach(() => {
    observeCommit = undefined;
    routeRegistry.__resetForTests();
    files = {
      "AGENTS.md": "# 行为规则\n\n保留 **规则** 与 `代码`。",
      "SOUL.md": "# 角色\n\n严谨表达。",
    };
    mounted = ["AGENTS.md", "SOUL.md"];
    writes = [];
    failWrite = false;
    failMount = false;
    failRead = "";
    deferredRead = null;
    deferredWrite = null;
    Object.values(messages).forEach((mock) => mock.mockClear());
    fetchHost = vi.fn(async (url: string, options: RequestInit = {}) => {
      const method = options.method || "GET";
      const body = JSON.parse(String(options.body || "{}"));
      const agent = new Headers(options.headers).get("X-Agent-Id");
      if (method !== "GET") writes.push({ url, agent, body });
      if (url === "/agents")
        return response({
          agents: [
            {
              id: "inventory",
              name: "库存评价专家",
              enabled: true,
              description: "库存评价",
            },
            {
              id: "data",
              name: "数据诊断专家",
              enabled: true,
              description: "数据检查",
            },
          ],
        });
      if (/^\/agents\/[^/]+$/.test(url)) {
        if (method === "PUT") {
          if (failMount) return response({ detail: "mount failed" }, 500);
          mounted = body.system_prompt_files;
        }
        return response({
          id: url.split("/")[2],
          system_prompt_files: mounted,
          custom_field: "preserve",
        });
      }
      if (url === "/workspace/files")
        return response(
          Object.entries(files).map(([filename, content]) => ({
            filename,
            size: content.length,
            modified_time: "2026-11-12T12:00:00Z",
          })),
        );
      if (url === "/workspace/system-prompt-files") return response(mounted);
      if (url.startsWith("/workspace/files/")) {
        const name = decodeURIComponent(url.split("/").pop()!);
        if (method === "PUT") {
          if (failWrite) return response({ detail: "write failed" }, 500);
          if (deferredWrite)
            return new Promise<Response>((resolve) => {
              deferredWrite!.resolve = resolve;
            });
          files[name] = body.content;
          return response({ written: true });
        }
        if (failRead === name) return response({ detail: "read failed" }, 500);
        if (deferredRead?.name === name)
          return new Promise<Response>((resolve) => {
            deferredRead!.resolve = resolve;
          });
        return response({ content: files[name] });
      }
      if (url === "/workspace/prompt-files") {
        if (failWrite) return response({ detail: "creation rolled back" }, 500);
        files[body.filename] = body.content;
        mounted = [...mounted, body.filename];
        return response({
          written: true,
          filename: body.filename,
          system_prompt_files: mounted,
        });
      }
      if (url.startsWith("/ugsci/experts/"))
        return response({
          revision: 0,
          display_name: "",
          category: null,
          specialty: "",
          summary: "",
        });
      if (url === "/workspace/language") return response({ language: "zh" });
      if (url === "/config/user-timezone")
        return response({ timezone: "Asia/Shanghai" });
      return response([]);
    });
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: {
          React,
          antd: { ...antd, message: messages },
          ReactMarkdown,
          remarkGfm,
          fetch: fetchHost,
          getApiUrl: (url: string) => `/api${url}`,
          getApiToken: () => "",
        },
        menu: { add: vi.fn() },
        route: routeRegistry,
        sidebar: { registerSimpleModeItems: vi.fn() },
      },
    });
    new Function(
      fs.readFileSync(path.resolve(process.cwd(), "..", bundlePath), "utf8"),
    )();
  });
  afterEach(async () => {
    cleanup();
    antd.Modal.destroyAll();
    await waitFor(() =>
      expect(document.querySelector(".ant-modal-root")).toBeNull(),
    );
    routeRegistry.__resetForTests();
    Reflect.deleteProperty(window, "QwenPaw");
    vi.restoreAllMocks();
  });
  async function openSettings() {
    const Page = routeRegistry
      .snapshot()
      .find((route) => route.id === "ugsci.experts")!.Component;
    render(
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        <antd.App>
          <MemoryRouter>
            <React.Profiler
              id="expert-files"
              onRender={() => observeCommit?.()}
            >
              <Page />
            </React.Profiler>
          </MemoryRouter>
        </antd.App>
      </antd.ConfigProvider>,
    );
    await userEvent.click(
      await screen.findByLabelText("设置 库存评价专家", { selector: "button" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "专家设置" });
    await userEvent.click(
      within(dialog).getByRole("tab", { name: "文件与提示词" }),
    );
    await within(dialog).findByRole("button", { name: "编辑 AGENTS.md" });
    return dialog;
  }
  async function openEditor() {
    const dialog = await openSettings();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "编辑 AGENTS.md" }),
    );
    await within(dialog).findByRole("textbox", { name: "Markdown 源码" });
    return dialog;
  }
  const editor = () => screen.getByRole("textbox", { name: "Markdown 源码" });
  const change = (value: string) =>
    fireEvent.change(editor(), { target: { value } });
  const fileButton = (name: string) =>
    within(screen.getByRole("complementary", { name: "工作区文档" })).getByRole(
      "button",
      { name: new RegExp(name.replace(".", "\\.")) },
    );

  it("expands the existing settings dialog and reuses Markdown source split and preview views", async () => {
    const dialog = await openEditor();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(dialog).toHaveClass("ugsci-files-expanded");
    expect(within(dialog).getByText("库存评价专家")).toBeVisible();
    expect(editor()).toHaveValue(files["AGENTS.md"]);
    expect(
      screen
        .getByRole("article", { name: "Markdown 预览" })
        .querySelector("strong"),
    ).toHaveTextContent("规则");
    await userEvent.click(
      screen.getByText("预览", { selector: ".ant-segmented-item-label" }),
    );
    expect(screen.queryByRole("textbox", { name: "Markdown 源码" })).toBeNull();
    await userEvent.click(
      screen.getByText("源码", { selector: ".ant-segmented-item-label" }),
    );
    expect(editor()).toHaveValue(files["AGENTS.md"]);
    expect(screen.queryByRole("article", { name: "Markdown 预览" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "返回专家设置" }));
    expect(dialog).not.toHaveClass("ugsci-files-expanded");
    expect(within(dialog).getByRole("tab", { name: "基本信息" })).toBeVisible();
    expect(writes).toEqual([]);
  });

  it("switches file workspace content and dialog geometry in the same commit without remounting styles", async () => {
    const dialog = await openSettings();
    const root = dialog.querySelector(".ugsci-expert-files");
    const style = root?.querySelector("style");
    const commits: { expanded: boolean; editor: boolean }[] = [];
    observeCommit = () => {
      commits.push({
        expanded: dialog.classList.contains("ugsci-files-expanded"),
        editor: Boolean(dialog.querySelector('[aria-label="专家文档工作台"]')),
      });
    };
    await userEvent.click(
      within(dialog).getByRole("button", { name: "编辑 AGENTS.md" }),
    );
    await within(dialog).findByRole("textbox", { name: "Markdown 源码" });
    const editorRoot = dialog.querySelector(".ugsci-expert-files");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "返回专家设置" }),
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "新建 Markdown 文档" }),
    );
    expect(within(dialog).getByRole("status")).toHaveTextContent("待创建");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "返回专家设置" }),
    );
    observeCommit = undefined;
    expect(commits).toContainEqual({ expanded: true, editor: true });
    expect(commits).toContainEqual({ expanded: false, editor: false });
    expect(
      commits.filter(({ expanded, editor }) => expanded !== editor),
    ).toEqual([]);
    expect(editorRoot).toBe(root);
    expect(dialog.querySelector(".ugsci-expert-files")).toBe(root);
    expect(root?.querySelector("style")).toBe(style);
    expect(writes).toEqual([]);
  });

  it("keeps independent drafts across files and saves exact Markdown in the current agent scope", async () => {
    await openEditor();
    const content = "# 修改规则\n\n- **原样保留**\n\n```ts\nconst x = 1;\n```";
    change(content);
    await userEvent.click(fileButton("SOUL.md"));
    await waitFor(() => expect(editor()).toHaveValue(files["SOUL.md"]));
    change("# 角色草稿");
    await userEvent.click(fileButton("AGENTS.md"));
    expect(editor()).toHaveValue(content);
    await userEvent.click(screen.getByRole("button", { name: "保存文档" }));
    await waitFor(() =>
      expect(messages.success).toHaveBeenCalledWith("文档已保存"),
    );
    expect(writes).toEqual([
      {
        url: "/workspace/files/AGENTS.md",
        agent: "inventory",
        body: { content },
      },
    ]);
    expect(screen.getByRole("button", { name: "保存文档" })).toBeDisabled();
    await userEvent.click(fileButton("SOUL.md"));
    expect(editor()).toHaveValue("# 角色草稿");
    expect(screen.getByRole("button", { name: "保存文档" })).toBeEnabled();
  });

  it("protects all unsaved file drafts on return and close and resets them on another expert visit", async () => {
    const dialog = await openEditor();
    change("# 未保存");
    await userEvent.click(screen.getByRole("button", { name: "返回专家设置" }));
    const confirmation = (
      await screen.findByText("还有未保存的文档修改", {
        selector: ".ant-modal-confirm-title",
      })
    ).closest<HTMLElement>('[role="dialog"]')!;
    await userEvent.click(
      within(confirmation).getByRole("button", { name: "继续编辑" }),
    );
    expect(editor()).toHaveValue("# 未保存");
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close" }),
    );
    const close = (
      await screen.findByText("还有未保存的修改", {
        selector: ".ant-modal-confirm-title",
      })
    ).closest<HTMLElement>('[role="dialog"]')!;
    await userEvent.click(
      within(close).getByRole("button", { name: "放弃修改" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "专家设置" })).toBeNull(),
    );
    await userEvent.click(
      screen.getByLabelText("设置 数据诊断专家", { selector: "button" }),
    );
    const next = await screen.findByRole("dialog", { name: "专家设置" });
    await userEvent.click(
      within(next).getByRole("tab", { name: "文件与提示词" }),
    );
    await userEvent.click(
      await within(next).findByRole("button", { name: "编辑 AGENTS.md" }),
    );
    await waitFor(() => expect(editor()).toHaveValue(files["AGENTS.md"]));
    expect(writes).toEqual([]);
  });

  it("retries failed reads and ignores the selected file when an earlier read arrives late", async () => {
    const dialog = await openSettings();
    failRead = "AGENTS.md";
    await userEvent.click(
      within(dialog).getByRole("button", { name: "编辑 AGENTS.md" }),
    );
    await screen.findByText(/read failed/);
    expect(screen.getByRole("button", { name: "保存文档" })).toBeDisabled();
    failRead = "";
    deferredRead = { name: "AGENTS.md" };
    await userEvent.click(screen.getByRole("button", { name: "重新读取" }));
    await waitFor(() => expect(deferredRead?.resolve).toBeTypeOf("function"));
    await userEvent.click(fileButton("SOUL.md"));
    await waitFor(() => expect(editor()).toHaveValue(files["SOUL.md"]));
    await act(async () =>
      deferredRead!.resolve!(response({ content: "# 迟到规则" })),
    );
    expect(editor()).toHaveValue(files["SOUL.md"]);
    await userEvent.click(fileButton("AGENTS.md"));
    expect(editor()).toHaveValue("# 迟到规则");
  });

  it("retains failed saves and edits made during an in-flight save without marking them saved", async () => {
    await openEditor();
    change("# 第一版");
    failWrite = true;
    await userEvent.click(screen.getByRole("button", { name: "保存文档" }));
    await screen.findByText(/write failed/);
    expect(editor()).toHaveValue("# 第一版");
    failWrite = false;
    deferredWrite = {};
    await userEvent.click(screen.getByRole("button", { name: "保存文档" }));
    await waitFor(() => expect(deferredWrite?.resolve).toBeTypeOf("function"));
    expect(screen.getByRole("button", { name: "返回专家设置" })).toBeDisabled();
    change("# 第二版");
    await act(async () => deferredWrite!.resolve!(response({ written: true })));
    expect(editor()).toHaveValue("# 第二版");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "保存文档" })).toBeEnabled(),
    );
    expect(writes[writes.length - 1]?.body.content).toBe("# 第一版");
  });

  it("validates new documents and retains drafts after atomic create and mount failure", async () => {
    const dialog = await openSettings();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "新建 Markdown 文档" }),
    );
    expect(within(dialog).getByRole("status")).toHaveTextContent("待创建");
    fireEvent.change(screen.getByLabelText("文件名"), {
      target: { value: "../invalid" },
    });
    change("# 新文档");
    await userEvent.click(screen.getByRole("button", { name: "保存文档" }));
    await screen.findByText("文件名不能包含路径分隔符");
    expect(writes).toEqual([]);
    fireEvent.change(screen.getByLabelText("文件名"), {
      target: { value: "REFERENCE" },
    });
    failWrite = true;
    await userEvent.click(screen.getByRole("button", { name: "保存文档" }));
    await screen.findByText(/creation rolled back/);
    expect(screen.getByLabelText("文件名")).toHaveValue("REFERENCE");
    expect(editor()).toHaveValue("# 新文档");
    failWrite = false;
    await userEvent.click(screen.getByRole("button", { name: "保存文档" }));
    await screen.findByRole("heading", { name: "REFERENCE.md" });
    expect(writes[writes.length - 1]).toEqual({
      url: "/workspace/prompt-files",
      agent: "inventory",
      body: { filename: "REFERENCE.md", content: "# 新文档", enable: true },
    });
    expect(
      screen.getByRole("switch", { name: "挂载 REFERENCE.md" }),
    ).toBeChecked();
    expect(screen.getByRole("button", { name: "保存文档" })).toBeDisabled();
  });

  it("preserves core prompt protection and rolls back failed immediate mount updates", async () => {
    const dialog = await openEditor();
    expect(
      screen.getByRole("switch", { name: "挂载 AGENTS.md" }),
    ).toBeDisabled();
    await userEvent.click(fileButton("SOUL.md"));
    await waitFor(() => expect(editor()).toHaveValue(files["SOUL.md"]));
    failMount = true;
    await userEvent.click(screen.getByRole("switch", { name: "挂载 SOUL.md" }));
    await waitFor(() => expect(messages.error).toHaveBeenCalled());
    expect(screen.getByRole("switch", { name: "挂载 SOUL.md" })).toBeChecked();
    failMount = false;
    await userEvent.click(screen.getByRole("switch", { name: "挂载 SOUL.md" }));
    await waitFor(() =>
      expect(messages.success).toHaveBeenCalledWith("已取消挂载"),
    );
    expect(writes[writes.length - 1]).toMatchObject({
      url: "/agents/inventory",
      body: { system_prompt_files: ["AGENTS.md"], custom_field: "preserve" },
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "返回专家设置" }),
    );
    expect(dialog).not.toHaveClass("ugsci-files-expanded");
  });
});
