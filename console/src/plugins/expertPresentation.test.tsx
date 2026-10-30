import fs from "node:fs";
import path from "node:path";
import React from "react";
import * as antd from "antd";
import { MemoryRouter } from "react-router-dom";
import {
  cleanup,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { routeRegistry } from "./registry/store";

describe.each([
  "plugins/bundle/ugsci/ui/dist/index.js",
  "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
])("expert presentation in %s", (bundlePath) => {
  let fetchHost: ReturnType<typeof vi.fn>;
  let writes: { url: string; body: any }[];
  let stored: Record<string, any>;
  let failSave: boolean;
  const messages = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  const empty = {
    revision: 0,
    display_name: "",
    category: null,
    specialty: "",
    summary: "",
  };
  const agents = [
    {
      id: "inventory",
      name: "库存评价专家",
      enabled: true,
      description:
        "- **名字:** 库存评价 - **Agent ID:** inventory - **定位:** 检查资料与计算结果。 - **风格:** 严谨",
    },
    {
      id: "data",
      name: "数据诊断专家",
      enabled: true,
      description: "检查资料缺失与单位。 | - 名字: 模板",
    },
    {
      id: "app",
      name: "数据应用",
      enabled: true,
      managed_by_app: "data-app",
      available_in_chat: false,
      description: "业务分析",
    },
  ];
  beforeEach(() => {
    routeRegistry.__resetForTests();
    writes = [];
    stored = {};
    failSave = false;
    Object.values(messages).forEach((m) => m.mockClear());
    fetchHost = vi.fn(async (url: string, options: RequestInit = {}) => {
      let data: any = [];
      if (url === "/agents") data = { agents };
      else if (url.startsWith("/ugsci/experts/")) {
        const id = url.split("/")[3];
        if (options.method === "PUT") {
          const body = JSON.parse(String(options.body));
          writes.push({ url, body });
          if (failSave)
            return new Response(
              JSON.stringify({ detail: "revision conflict" }),
              { status: 409 },
            );
          stored[id] = { ...body, revision: body.revision + 1 };
        }
        data = stored[id] || empty;
      } else if (url.startsWith("/agents/") && !url.endsWith("/skills"))
        data = { id: url.split("/")[2], system_prompt_files: ["AGENTS.md"] };
      else if (url.endsWith("/skills"))
        data = [{ name: "computer_use", enabled: true, tags: ["资料检查"] }];
      else if (url === "/config/heartbeat")
        data = {
          enabled: false,
          every: "6h",
          target: "main",
          timeoutSeconds: 300,
        };
      else if (url === "/workspace/running-config")
        data = {
          max_iters: 70,
          loop: {
            iteration: { enabled: true, max_iterations: 70 },
            doom_loop: { enabled: true, stages: [{ sentinel: "preserve" }] },
          },
          light_context_config: { strategy: "scroll", keep: "untouched" },
          custom_running_field: "keep",
        };
      else if (url === "/workspace/language") data = { language: "zh" };
      else if (url === "/config/user-timezone")
        data = { timezone: "Asia/Shanghai" };
      if (
        options.method &&
        options.method !== "GET" &&
        !url.startsWith("/ugsci/experts/")
      )
        writes.push({ url, body: JSON.parse(String(options.body || "{}")) });
      return new Response(JSON.stringify(data));
    });
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: {
          React,
          antd: { ...antd, message: messages },
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
    document.documentElement.removeAttribute("data-interface-style");
    vi.restoreAllMocks();
  });
  function mount() {
    const Page = routeRegistry
      .snapshot()
      .find((r) => r.id === "ugsci.experts")!.Component;
    return render(
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        <antd.App>
          <MemoryRouter>
            <Page />
          </MemoryRouter>
        </antd.App>
      </antd.ConfigProvider>,
    );
  }
  async function settings() {
    await userEvent.click(
      await screen.findByRole("button", { name: "设置 库存评价专家" }),
    );
    return screen.findByRole("dialog", { name: "专家设置" });
  }

  it("filters real cards without exposing prompt metadata and keeps application routing labels", async () => {
    mount();
    const name = await screen.findByRole("button", {
      name: "库存评价专家",
    });
    const card = name.closest<HTMLElement>(".ant-card")!;
    expect(within(card).getByText("检查资料与计算结果。")).toBeVisible();
    expect(card).not.toHaveTextContent("Agent ID");
    await userEvent.click(screen.getByRole("button", { name: /^数据与研究/ }));
    expect(
      screen.queryByRole("button", { name: "库存评价专家" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "数据诊断专家" })).toBeVisible();
    await userEvent.type(
      screen.getByRole("textbox", { name: "搜索专家" }),
      "缺失",
    );
    expect(screen.getByRole("button", { name: "数据诊断专家" })).toBeVisible();
    await userEvent.clear(screen.getByRole("textbox", { name: "搜索专家" }));
    await userEvent.click(screen.getByRole("button", { name: /^应用专家/ }));
    expect(screen.getByText("应用专属专家")).toBeVisible();
    expect(screen.getByRole("button", { name: "打开应用" })).toBeVisible();
    expect(writes).toEqual([]);
  });

  it("preserves drafts across settings tabs and saves only display metadata", async () => {
    mount();
    const dialog = await settings();
    const input = await within(dialog).findByRole("textbox", {
      name: "显示名称",
    });
    await userEvent.type(input, "库存评审");
    await userEvent.click(within(dialog).getByRole("tab", { name: /技能/ }));
    document.documentElement.setAttribute("data-interface-style", "soft-focus");
    await userEvent.click(
      within(dialog).getByRole("tab", { name: "基本信息" }),
    );
    expect(
      within(dialog).getByRole("textbox", { name: "显示名称" }),
    ).toHaveValue("库存评审");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "保存基本信息" }),
    );
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      url: "/ugsci/experts/inventory/presentation",
      body: { display_name: "库存评审", revision: 0 },
    });
    expect(writes[0].body).not.toHaveProperty("system_prompt_files");
    await waitFor(() =>
      expect(messages.success).toHaveBeenCalledWith("专家显示信息已保存"),
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "关闭设置" }),
    );
    expect(
      await screen.findByRole("button", { name: "库存评审" }),
    ).toBeVisible();
  });

  it("preserves advanced drafts and unknown running configuration fields when saving", async () => {
    mount();
    const dialog = await settings();
    await userEvent.click(
      within(dialog).getByRole("tab", { name: "高级运行" }),
    );
    const shell = await within(dialog).findByPlaceholderText(
      "留空使用系统默认",
    );
    await userEvent.type(shell, "pwsh");
    await userEvent.click(
      within(dialog).getByRole("tab", { name: "基本信息" }),
    );
    await userEvent.click(
      within(dialog).getByRole("tab", { name: "高级运行" }),
    );
    expect(within(dialog).getByPlaceholderText("留空使用系统默认")).toHaveValue(
      "pwsh",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "保存运行配置" }),
    );
    await waitFor(() =>
      expect(messages.success).toHaveBeenCalledWith("运行配置已保存"),
    );
    const saved = writes.find((w) => w.url === "/workspace/running-config")!;
    expect(saved.body).toMatchObject({
      shell_command_executable: "pwsh",
      custom_running_field: "keep",
      max_iters: 70,
      loop: { doom_loop: { stages: [{ sentinel: "preserve" }] } },
      light_context_config: { strategy: "scroll", keep: "untouched" },
    });
    expect(writes).toHaveLength(3);
    expect(writes.find((w) => w.url === "/workspace/language")?.body).toEqual({
      language: "zh",
    });
    expect(writes.find((w) => w.url === "/config/user-timezone")?.body).toEqual(
      { timezone: "Asia/Shanghai" },
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "关闭设置" }),
    );
    expect(screen.queryByText("还有未保存的修改")).not.toBeInTheDocument();
  });

  it("retains failed saves and confirms discarding an unsaved draft", async () => {
    mount();
    const dialog = await settings();
    await userEvent.type(
      await within(dialog).findByRole("textbox", { name: "卡片简介" }),
      "需要保留的修改",
    );
    failSave = true;
    await userEvent.click(
      within(dialog).getByRole("button", { name: "保存基本信息" }),
    );
    await waitFor(() => expect(messages.error).toHaveBeenCalled());
    expect(
      within(dialog).getByRole("textbox", { name: "卡片简介" }),
    ).toHaveValue("需要保留的修改");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "关闭设置" }),
    );
    await waitFor(() =>
      expect(
        screen.getByText("关闭后将放弃未保存的内容。已保存的配置不受影响。"),
      ).toBeVisible(),
    );
    await userEvent.click(screen.getByRole("button", { name: "继续编辑" }));
    expect(
      within(dialog).getByRole("textbox", { name: "卡片简介" }),
    ).toHaveValue("需要保留的修改");
  });
});
