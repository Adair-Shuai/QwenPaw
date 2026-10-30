import fs from "node:fs";
import path from "node:path";
import React from "react";
import * as antd from "antd";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routeRegistry } from "./registry/store";

describe.each([
  "plugins/bundle/ugsci/ui/dist/index.js",
  "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
])("packaged capability workspace: %s", (bundlePath) => {
  const fetchHost = vi.fn();
  const loadBuiltinPage = vi.fn();
  let selectedAgent: string;
  const listeners = new Set<() => void>();
  let enabled: boolean;
  let rejectSave: boolean;
  let poolInstalled: boolean;
  let engine: Record<string, unknown>;
  let resolveOldSkills: ((response: Response) => void) | undefined;
  const json = (value: unknown, status = 200) =>
    new Response(JSON.stringify(value), { status });
  const skill = (name: string) => ({
    name,
    description: "专业报告技能",
    emoji: "📄",
    enabled,
    source: "custom",
    content: "# 保留技能内容",
    tags: ["文档"],
  });
  const changeAgent = (id: string) => {
    selectedAgent = id;
    listeners.forEach((listener) => listener());
  };
  beforeEach(() => {
    routeRegistry.__resetForTests();
    window.history.replaceState({}, "", "/ugsci-tools-skills?tab=engines");
    selectedAgent = "expert-a";
    enabled = true;
    rejectSave = false;
    poolInstalled = false;
    resolveOldSkills = undefined;
    engine = {
      id: "eclipse",
      name: "Eclipse",
      vendor: "SLB",
      version: "2022",
      category: "reservoir_simulation",
      description: "油藏模拟",
      executable_path: "C:/Eclipse/eclipse.exe",
      install_dir: "C:/Eclipse",
      license_server: "27000@license",
      status: "detected",
      is_default: true,
      is_custom: false,
      modules: ["E100"],
      module_paths: { E100: "C:/Eclipse/e100.exe" },
      extra_paths: ["C:/Eclipse/lib"],
    };
    fetchHost
      .mockReset()
      .mockImplementation(async (url: string, init?: RequestInit) => {
        if (url === "/ugsci/genui/config") return json({ enabled: false });
        if (url === "/agents")
          return json({
            agents: [
              { id: "expert-a", name: "专家 A" },
              { id: "expert-b", name: "专家 B" },
            ],
          });
        if (url === "/ugsci/engines/list") return json({ engines: [engine] });
        if (url === "/ugsci/engines/eclipse" && init?.method === "PUT") {
          if (rejectSave) return json({ detail: "许可证配置保存失败" }, 500);
          engine = { ...engine, ...JSON.parse(String(init.body)) };
          return json(engine);
        }
        if (url === "/skills/pool?summary=true")
          return json([
            { ...skill("pool-report"), content: "", protected: false },
          ]);
        if (url === "/skills/workspaces")
          return json(
            poolInstalled
              ? [{ agent_id: "expert-a", skill_names: ["pool-report"] }]
              : [],
          );
        if (url === "/skills/pool/pool-report/content")
          return json({ name: "pool-report", content: "# 技能库完整内容" });
        if (url === "/skills/pool/download" && init?.method === "POST") {
          poolInstalled = true;
          return json({ success: true });
        }
        if (url === "/agents/expert-a/skills") {
          if (resolveOldSkills)
            return new Promise<Response>((resolve) => {
              resolveOldSkills = resolve;
            });
          return json([
            skill("报告技能 A"),
            ...(poolInstalled ? [skill("pool-report")] : []),
          ]);
        }
        if (url === "/agents/expert-b/skills")
          return json([skill("报告技能 B")]);
        if (
          url === "/agents/expert-a/skills/报告技能%20A/disable" ||
          url ===
            "/agents/expert-a/skills/%E6%8A%A5%E5%91%8A%E6%8A%80%E8%83%BD%20A/disable"
        ) {
          enabled = false;
          return json({ success: true });
        }
        throw new Error(`Unexpected request: ${url}`);
      });
    loadBuiltinPage
      .mockReset()
      .mockImplementation(
        async (page: string) =>
          ({ embedded }: { embedded?: boolean }) => (
            <div>
              {page} native page {String(embedded)}
            </div>
          ),
      );
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: {
          React,
          antd,
          antdIcons: {},
          fetch: fetchHost,
          getApiUrl: (value: string) => `/api${value}`,
          getApiToken: () => "",
          loadBuiltinPage,
          setSelectedAgent: changeAgent,
          useSelectedAgent: () => ({
            id: React.useSyncExternalStore(
              (listener) => {
                listeners.add(listener);
                return () => {
                  listeners.delete(listener);
                };
              },
              () => selectedAgent,
            ),
          }),
        },
        menu: { add: vi.fn() },
        route: routeRegistry,
        sidebar: { registerSimpleModeItems: vi.fn() },
      },
    });
  });
  afterEach(() => {
    cleanup();
    antd.message.destroy();
    listeners.clear();
    routeRegistry.__resetForTests();
    Reflect.deleteProperty(window, "QwenPaw");
  });
  async function mountPage(tab = "engines") {
    window.history.replaceState({}, "", `/ugsci-tools-skills?tab=${tab}`);
    await act(async () => {
      new Function(
        fs.readFileSync(path.resolve(process.cwd(), "..", bundlePath), "utf8"),
      )();
    });
    const Page = routeRegistry
      .snapshot()
      .find((route) => route.id === "ugsci.tools-skills")!.Component;
    render(
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        <antd.App>
          <Page />
        </antd.App>
      </antd.ConfigProvider>,
    );
  }

  it("configures a real engine from its compact icon card and preserves advanced values after a failed save", async () => {
    await mountPage();
    const configure = await screen.findByRole(
      "button",
      {
        name: "配置 Eclipse",
      },
      { timeout: 5000 },
    );
    const card = configure.closest(".ant-card")!;
    expect(
      within(card as HTMLElement).getByRole("img", { name: "Eclipse" }),
    ).toHaveAttribute("src", "/api/ugsci/engines/icon/eclipse");
    await userEvent.click(configure);
    const detail = await screen.findByRole("region", { name: "配置 Eclipse" });
    expect(configure).not.toBeVisible();
    fireEvent.change(within(detail).getByLabelText("可执行文件路径"), {
      target: { value: "D:/Sim/eclipse.exe" },
    });
    rejectSave = true;
    await userEvent.click(
      within(detail).getByRole("button", { name: /^保\s*存$/ }),
    );
    await waitFor(() =>
      expect(fetchHost).toHaveBeenCalledWith(
        "/ugsci/engines/eclipse",
        expect.objectContaining({ method: "PUT" }),
      ),
    );
    expect(
      (await screen.findAllByText(/许可证配置保存失败/)).length,
    ).toBeGreaterThan(0);
    expect(within(detail).getByLabelText("可执行文件路径")).toHaveValue(
      "D:/Sim/eclipse.exe",
    );
    rejectSave = false;
    await userEvent.click(
      within(detail).getByRole("button", { name: /^保\s*存$/ }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("region", { name: "配置 Eclipse" }),
      ).not.toBeInTheDocument(),
    );
    expect(engine).toMatchObject({
      executable_path: "D:/Sim/eclipse.exe",
      license_server: "27000@license",
      modules: ["E100"],
      module_paths: { E100: "C:/Eclipse/e100.exe" },
      extra_paths: ["C:/Eclipse/lib"],
    });
    expect(
      await screen.findByRole("button", { name: "配置 Eclipse" }),
    ).toBeVisible();
  });

  it("keeps built-in tools separate and embeds the original MCP and runtime managers", async () => {
    await mountPage();
    await userEvent.click(screen.getByRole("tab", { name: "运行服务" }));
    expect(await screen.findByText("acp native page true")).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: "工具" }));
    expect(await screen.findByText("mcp native page true")).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: "平台内置工具" }));
    expect(await screen.findByText("tools native page true")).toBeVisible();
    expect(loadBuiltinPage.mock.calls.map(([page]) => page)).toEqual(
      expect.arrayContaining(["acp", "mcp", "tools"]),
    );
  });

  it("shows skill controls without hovering and returns from focused details to the updated agent card", async () => {
    await mountPage("skills");
    await userEvent.click(
      await screen.findByRole("switch", { name: "禁用 报告技能 A" }),
    );
    expect(
      await screen.findByRole("switch", { name: "启用 报告技能 A" }),
    ).not.toBeChecked();
    expect(fetchHost).toHaveBeenCalledWith(
      "/agents/expert-a/skills/%E6%8A%A5%E5%91%8A%E6%8A%80%E8%83%BD%20A/disable",
      expect.objectContaining({ method: "POST" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "配置 报告技能 A" }),
    );
    const detail = await screen.findByRole("region", { name: /报告技能 A/ });
    expect(within(detail).getByText("# 保留技能内容")).toBeVisible();
    await userEvent.click(
      within(detail).getByRole("button", { name: "返回列表" }),
    );
    expect(
      screen.getByRole("switch", { name: "启用 报告技能 A" }),
    ).toBeVisible();
  });

  it("ignores an old skill response after the configuration agent changes", async () => {
    resolveOldSkills = () => {};
    await mountPage("skills");
    await waitFor(() =>
      expect(fetchHost).toHaveBeenCalledWith(
        "/agents/expert-a/skills",
        expect.anything(),
      ),
    );
    const resolve = resolveOldSkills!;
    await act(async () => changeAgent("expert-b"));
    expect(
      await screen.findByRole("button", { name: "配置 报告技能 B" }),
    ).toBeVisible();
    await act(async () => resolve(json([skill("迟到的旧技能 A")])));
    expect(screen.queryByText("迟到的旧技能 A")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "配置 报告技能 B" }),
    ).toBeVisible();
  });
  it("installs from the visible skill-pool card and refreshes the current expert without a page reload", async () => {
    await mountPage("skills");
    await userEvent.click(screen.getByRole("tab", { name: "技能库" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "pool-report" }),
    );
    const detail = await screen.findByRole("region", { name: /pool-report/ });
    expect(await within(detail).findByText(/技能库完整内容/)).toBeVisible();
    await userEvent.click(
      within(detail).getByRole("button", { name: "返回列表" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /添加到当前专家/ }),
    );
    await waitFor(() => expect(poolInstalled).toBe(true));
    expect(fetchHost).toHaveBeenCalledWith(
      "/skills/pool/download",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          skill_name: "pool-report",
          targets: [{ workspace_id: "expert-a" }],
          overwrite: false,
        }),
      }),
    );
    expect(
      await screen.findByRole("button", { name: "已加载" }),
    ).toBeDisabled();
    await userEvent.click(screen.getByRole("tab", { name: "当前专家" }));
    expect(
      await screen.findByRole("button", { name: "配置 pool-report" }),
    ).toBeVisible();
  });
});
