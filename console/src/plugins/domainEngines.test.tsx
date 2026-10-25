import fs from "node:fs";
import path from "node:path";
import React from "react";
import * as antd from "antd";
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routeRegistry } from "./registry/store";

const operation = (id: string, name: string, tool: string) => ({
  id,
  name,
  description: `说明 ${name}`,
  tool_names: [tool],
  driver_tool_names: [],
});
const engine = (
  id: string,
  name: string,
  domain: string,
  operations: ReturnType<typeof operation>[],
  dependencyStatus: {
    overall: string;
    dependencies: { name: string; status: string; reason: string }[];
  } = { overall: "available", dependencies: [] },
) => ({
  schema_version: 1,
  engine: {
    schema_version: 1,
    id,
    name,
    description: `原始说明 ${name}`,
    domain,
    source: "builtin",
    provider: { kind: "builtin", id },
    operations,
    dependencies: id === "sympy" ? ["sympy"] : [],
    tags: [],
    execution_class: "deterministic",
    engine_version: "1",
  },
  dependency_status: dependencyStatus,
  checked_at: "2026-01-01T00:00:00Z",
});

describe.each([
  "plugins/bundle/ugsci/ui/dist/index.js",
  "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
])("UGSci packaged domain engines: %s", (bundlePath) => {
  const fetchHost = vi.fn();
  let toolsResponse: { name: string; enabled: boolean }[];
  let dependencyOverall: "available" | "unavailable";
  let installOutcome: "completed" | "failed";
  let installStarts: number;
  let runtimeBlocked: boolean;
  let holdInstall: boolean;
  let missingTaskReceipt: boolean;
  beforeEach(() => {
    routeRegistry.__resetForTests();
    toolsResponse = [];
    dependencyOverall = "available";
    installOutcome = "completed";
    installStarts = 0;
    runtimeBlocked = false;
    holdInstall = false;
    missingTaskReceipt = false;
    fetchHost
      .mockReset()
      .mockImplementation(async (url: string, init?: RequestInit) => {
        if (url === "/ugsci/domain-engines/sympy/runtime") {
          return new Response(
            JSON.stringify({
              engine_id: "sympy",
              installable: !runtimeBlocked,
              packages: ["sympy>=1.12"],
              state: runtimeBlocked
                ? "blocked"
                : dependencyOverall === "available"
                ? "ready"
                : "missing",
              message: runtimeBlocked
                ? "当前环境由管理员管理"
                : "安装到软件使用的 Python 环境",
              active_task:
                holdInstall && installStarts > 0
                  ? {
                      id: "install-test",
                      engine_id: "sympy",
                      status: "running",
                      progress: 20,
                      message: "正在安装依赖",
                      error: "",
                    }
                  : null,
            }),
          );
        }
        if (
          url === "/ugsci/domain-engines/sympy/install" &&
          init?.method === "POST"
        ) {
          installStarts += 1;
          return new Response(
            JSON.stringify({
              id: "install-test",
              engine_id: "sympy",
              status: "running",
              progress: 20,
              message: "正在安装依赖",
              error: "",
            }),
            { status: 202 },
          );
        }
        if (url === "/ugsci/domain-engines/install-tasks/install-test") {
          if (missingTaskReceipt) {
            dependencyOverall = "available";
            return new Response(
              JSON.stringify({ detail: "未找到依赖安装任务" }),
              { status: 404 },
            );
          }
          if (holdInstall)
            return new Response(
              JSON.stringify({
                id: "install-test",
                engine_id: "sympy",
                status: "running",
                progress: 20,
                message: "正在安装依赖",
                error: "",
              }),
            );
          if (installOutcome === "completed") dependencyOverall = "available";
          return new Response(
            JSON.stringify({
              id: "install-test",
              engine_id: "sympy",
              status: installOutcome,
              progress: installOutcome === "completed" ? 100 : 20,
              message: installOutcome === "completed" ? "安装完成" : "安装失败",
              error: installOutcome === "failed" ? "下载失败，请重试" : "",
            }),
          );
        }
        if (url === "/ugsci/domain-engines/list")
          return new Response(
            JSON.stringify({
              engines: [
                engine(
                  "storage-inventory-evaluation",
                  "储气库库存评价",
                  "gas_storage",
                  [
                    operation(
                      "storage.inventory.evaluate",
                      "库存评价",
                      "ugsci_storage_inventory_evaluate",
                    ),
                  ],
                ),
                engine(
                  "storage-production-dynamics",
                  "储气库动态分析",
                  "gas_storage",
                  [
                    operation(
                      "storage.dynamics.analyze",
                      "动态分析",
                      "ugsci_storage_dynamics_analyze",
                    ),
                  ],
                ),
                engine(
                  "sympy",
                  "符号多项式计算",
                  "scientific_computing",
                  [
                    operation(
                      "math.symbolic",
                      "多项式求根",
                      "ugsci_symbolic_polynomial_roots",
                    ),
                    operation("fixture.unknown", "未知操作", "unknown_tool"),
                  ],
                  {
                    overall: dependencyOverall,
                    dependencies:
                      dependencyOverall === "unavailable"
                        ? [
                            {
                              name: "Python",
                              status: "unavailable",
                              reason: "未安装",
                            },
                          ]
                        : ([] as {
                            name: string;
                            status: string;
                            reason: string;
                          }[]),
                  },
                ),
              ],
            }),
          );
        if (url === "/mcp") return new Response(JSON.stringify([]));
        if (url === "/tools")
          return new Response(JSON.stringify(toolsResponse));
        return new Response(
          JSON.stringify({ ready: false, installable: false, missing: [] }),
        );
      });
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: {
          React,
          antd,
          antdIcons: {},
          getApiUrl: (value: string) => `/api${value}`,
          getApiToken: () => "",
          fetch: fetchHost,
          useSelectedAgent: () => ({ id: "fixture-agent" }),
          loadBuiltinPage: async () => () => <div>平台内置工具管理</div>,
        },
        menu: { add: vi.fn() },
        route: routeRegistry,
        sidebar: { registerSimpleModeItems: vi.fn() },
      },
    });
  });
  afterEach(() => {
    cleanup();
    routeRegistry.__resetForTests();
    Reflect.deleteProperty(window, "QwenPaw");
    vi.restoreAllMocks();
  });

  async function renderPage() {
    await act(async () => {
      new Function(
        fs.readFileSync(path.resolve(process.cwd(), "..", bundlePath), "utf8"),
      )();
    });
    const component = routeRegistry
      .snapshot()
      .find((route) => route.id === "ugsci.tools-skills")?.Component;
    expect(component).toBeTruthy();
    const Page = component!;
    render(
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        <antd.App>
          <Page />
        </antd.App>
      </antd.ConfigProvider>,
    );
    await userEvent.click(await screen.findByRole("tab", { name: "引擎" }));
    await userEvent.click(screen.getByRole("tab", { name: "领域计算" }));
    await screen.findByText("储气库库存评价");
  }

  it("keeps domain grouping, collapsed search, function details, and the management entry on the packaged page", async () => {
    await renderPage();
    expect(
      screen.getByRole("button", { name: /储气库工程 \(2\)/ }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("储气库库存评价")).toBeVisible();
    expect(screen.getByText("储气库动态分析")).toBeVisible();
    const generalGroup = screen.getByRole("button", { name: /通用科学计算/ });
    expect(generalGroup).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("符号多项式计算")).not.toBeInTheDocument();
    const search = screen.getByPlaceholderText("搜索领域引擎...");
    await userEvent.type(search, "多项式求根");
    expect(await screen.findByText("符号多项式计算")).toBeVisible();
    const scienceCard = screen
      .getByText("符号多项式计算")
      .closest<HTMLElement>(".ant-card")!;
    await userEvent.click(
      within(scienceCard).getByRole("button", { name: /查看.*函数/ }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "符号多项式计算 · 函数说明",
    });
    expect(within(dialog).getByText("多项式求根")).toBeInTheDocument();
    expect(
      within(dialog).getByText(/工具：ugsci_symbolic_polynomial_roots/),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/输入：coefficients/)).toBeInTheDocument();
    expect(
      within(dialog).getByText(/输出：所有实根和复根及计算状态/),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("详细说明待补充")).toBeInTheDocument();
    expect(
      within(scienceCard).queryByText("多项式求根"),
    ).not.toBeInTheDocument();
    expect(
      within(scienceCard).queryByText(/工具：ugsci_symbolic_polynomial_roots/),
    ).not.toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole("button", { name: /关闭函数说明|关\s*闭/ }),
    );
    expect(await screen.findByText("符号多项式计算")).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    await userEvent.click(
      within(scienceCard).getByRole("button", { name: /查看.*详情/ }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "查看内置工具" }),
    );
    expect(
      (await screen.findAllByText("平台内置工具管理")).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole("tab", { name: "平台内置" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(fetchHost).toHaveBeenCalledWith(
      "/ugsci/domain-engines/list",
      expect.anything(),
    );
  });

  it.each([
    {
      label: "all enabled",
      tools: [
        { name: "ugsci_symbolic_polynomial_roots", enabled: true },
        { name: "unknown_tool", enabled: true },
      ],
      dependency: "available" as const,
      status: "可用",
      reason: "当前专家已启用全部 2 个工具",
    },
    {
      label: "partially enabled",
      tools: [
        { name: "ugsci_symbolic_polynomial_roots", enabled: true },
        { name: "unknown_tool", enabled: false },
      ],
      dependency: "available" as const,
      status: "部分可用",
      reason: "当前专家已启用 1/2 个工具",
    },
    {
      label: "not enabled",
      tools: [
        { name: "ugsci_symbolic_polynomial_roots", enabled: false },
        { name: "unknown_tool", enabled: false },
      ],
      dependency: "available" as const,
      status: "未配置",
      reason: "当前专家已启用 0/2 个工具",
    },
    {
      label: "tool missing",
      tools: [{ name: "ugsci_symbolic_polynomial_roots", enabled: true }],
      dependency: "available" as const,
      status: "错误",
      reason: "工具未完整注册：unknown_tool",
    },
    {
      label: "dependency unavailable",
      tools: [],
      dependency: "unavailable" as const,
      status: "不可用",
      reason: "Python：未检测到可用依赖（未安装）",
    },
  ])(
    "shows status evidence for $label on the packaged detail page",
    async (scenario) => {
      toolsResponse = scenario.tools;
      dependencyOverall = scenario.dependency;
      await renderPage();
      await userEvent.type(
        screen.getByPlaceholderText("搜索领域引擎..."),
        "多项式求根",
      );
      const scienceCard = screen
        .getByText("符号多项式计算")
        .closest<HTMLElement>(".ant-card")!;
      await userEvent.click(
        within(scienceCard).getByRole("button", { name: /查看.*详情/ }),
      );
      const detail = await screen.findByRole("dialog", {
        name: /符号多项式计算/,
      });
      expect(
        within(detail).getAllByText(scenario.status).length,
      ).toBeGreaterThan(0);
      expect(
        within(detail).getByText(scenario.reason, { exact: false }),
      ).toBeVisible();
      expect(within(detail).getByText(/未执行试算/)).toBeVisible();
    },
  );

  it("installs a missing runtime from its real card only after confirmation and refreshes tool availability", async () => {
    dependencyOverall = "unavailable";
    toolsResponse = [
      { name: "ugsci_symbolic_polynomial_roots", enabled: true },
      { name: "unknown_tool", enabled: true },
    ];
    await renderPage();
    await userEvent.type(
      screen.getByPlaceholderText("搜索领域引擎..."),
      "多项式求根",
    );
    const card = screen
      .getByText("符号多项式计算")
      .closest<HTMLElement>(".ant-card")!;
    await userEvent.click(
      within(card).getByRole("button", { name: "安装运行环境" }),
    );
    const dialog = await screen.findByRole("dialog", { name: /运行环境/ });
    await waitFor(() =>
      expect(within(dialog).getByText(/sympy>=1.12/)).toBeVisible(),
    );
    expect(installStarts).toBe(0);
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^开始安装/ }),
    );
    await waitFor(() => expect(installStarts).toBe(1));
    await waitFor(() => expect(dependencyOverall).toBe("available"), {
      timeout: 6000,
    });
    await waitFor(() =>
      expect(screen.getAllByText(/安装完成/).length).toBeGreaterThan(0),
    );
    await waitFor(() => expect(within(card).getByText("可用")).toBeVisible());
    expect(fetchHost).toHaveBeenCalledWith(
      "/ugsci/domain-engines/install-tasks/install-test",
      expect.anything(),
    );
  });

  it("keeps failed runtime installs actionable and retries from the real dialog", async () => {
    dependencyOverall = "unavailable";
    installOutcome = "failed";
    await renderPage();
    await userEvent.type(
      screen.getByPlaceholderText("搜索领域引擎..."),
      "多项式求根",
    );
    const card = screen
      .getByText("符号多项式计算")
      .closest<HTMLElement>(".ant-card")!;
    await userEvent.click(
      within(card).getByRole("button", { name: "安装运行环境" }),
    );
    const dialog = await screen.findByRole("dialog", { name: /运行环境/ });
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^开始安装/ }),
    );
    expect(
      await within(dialog).findByText(
        /下载失败，请重试/,
        {},
        { timeout: 6000 },
      ),
    ).toBeVisible();
    expect(dependencyOverall).toBe("unavailable");
    installOutcome = "completed";
    await userEvent.click(
      within(dialog).getByRole("button", { name: /重试安装|重新安装/ }),
    );
    await waitFor(() => expect(installStarts).toBe(2));
    await waitFor(() => expect(dependencyOverall).toBe("available"), {
      timeout: 6000,
    });
    await waitFor(() => expect(within(card).getByText("错误")).toBeVisible());
  });

  it("explains managed runtime restrictions before starting any installation", async () => {
    dependencyOverall = "unavailable";
    runtimeBlocked = true;
    await renderPage();
    await userEvent.type(
      screen.getByPlaceholderText("搜索领域引擎..."),
      "多项式求根",
    );
    const card = screen
      .getByText("符号多项式计算")
      .closest<HTMLElement>(".ant-card")!;
    await userEvent.click(
      within(card).getByRole("button", { name: "安装运行环境" }),
    );
    const dialog = await screen.findByRole("dialog", { name: /运行环境/ });
    expect(
      (await within(dialog).findAllByText(/当前环境由管理员管理/)).length,
    ).toBeGreaterThan(0);
    expect(
      within(dialog).queryByRole("button", { name: /^开始安装/ }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "前往工具或技能管理入口" }),
      ).toBeVisible(),
    );
    expect(installStarts).toBe(0);
  });

  it("takes an installed but disabled capability to the current expert tool settings", async () => {
    toolsResponse = [
      { name: "ugsci_symbolic_polynomial_roots", enabled: false },
      { name: "unknown_tool", enabled: false },
    ];
    await renderPage();
    await userEvent.type(
      screen.getByPlaceholderText("搜索领域引擎..."),
      "多项式求根",
    );
    const card = screen
      .getByText("符号多项式计算")
      .closest<HTMLElement>(".ant-card")!;
    await userEvent.click(
      within(card).getByRole("button", { name: "启用工具" }),
    );
    expect(
      await screen.findByRole("tab", { name: "平台内置", selected: true }),
    ).toBeVisible();
    expect(installStarts).toBe(0);
  });

  it("resumes a background installation from the card without starting another download", async () => {
    dependencyOverall = "unavailable";
    holdInstall = true;
    await renderPage();
    await userEvent.type(
      screen.getByPlaceholderText("搜索领域引擎..."),
      "多项式求根",
    );
    const card = screen
      .getByText("符号多项式计算")
      .closest<HTMLElement>(".ant-card")!;
    await userEvent.click(
      within(card).getByRole("button", { name: "安装运行环境" }),
    );
    let dialog = await screen.findByRole("dialog", { name: /运行环境/ });
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^开始安装/ }),
    );
    await userEvent.click(
      await within(dialog).findByRole("button", { name: "关闭安装进度" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await userEvent.click(
      within(card).getByRole("button", { name: "查看安装进度" }),
    );
    dialog = await screen.findByRole("dialog", { name: /运行环境/ });
    expect(installStarts).toBe(1);
    await waitFor(() =>
      expect(within(dialog).getByText("正在安装依赖")).toBeVisible(),
    );
    holdInstall = false;
    await waitFor(() => expect(dependencyOverall).toBe("available"), {
      timeout: 6000,
    });
    expect(installStarts).toBe(1);
  });

  it("recovers a missing install receipt by checking the actual runtime before reporting failure", async () => {
    dependencyOverall = "unavailable";
    missingTaskReceipt = true;
    toolsResponse = [
      { name: "ugsci_symbolic_polynomial_roots", enabled: true },
      { name: "unknown_tool", enabled: true },
    ];
    await renderPage();
    await userEvent.type(
      screen.getByPlaceholderText("搜索领域引擎..."),
      "多项式求根",
    );
    const card = screen
      .getByText("符号多项式计算")
      .closest<HTMLElement>(".ant-card")!;
    await userEvent.click(
      within(card).getByRole("button", { name: "安装运行环境" }),
    );
    const dialog = await screen.findByRole("dialog", { name: /运行环境/ });
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^开始安装/ }),
    );
    expect(
      await within(dialog).findByText(
        "依赖已就绪，已恢复安装状态。",
        {},
        { timeout: 6000 },
      ),
    ).toBeVisible();
    expect(within(dialog).queryByText("安装失败")).not.toBeInTheDocument();
    await waitFor(() => expect(within(card).getByText("可用")).toBeVisible());
    expect(installStarts).toBe(1);
  });
});
