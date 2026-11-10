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
  let fetchHost: ReturnType<
    typeof vi.fn<(url: string, options?: RequestInit) => Promise<Response>>
  >;
  let writes: { url: string; body: unknown }[];
  let stored: Record<string, unknown>;
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
  let currentAgents: typeof agents;
  beforeEach(() => {
    routeRegistry.__resetForTests();
    writes = [];
    stored = {};
    failSave = false;
    currentAgents = [...agents];
    Object.values(messages).forEach((m) => m.mockClear());
    fetchHost = vi.fn(async (url: string, options: RequestInit = {}) => {
      let data: unknown = [];
      if (url === "/agents") {
        if (options.method === "POST") {
          const body = JSON.parse(String(options.body));
          currentAgents.push({
            id: "created-expert",
            name: body.name,
            description: body.description,
            enabled: true,
          });
          data = { id: "created-expert" };
        } else data = { agents: currentAgents };
      } else if (url.startsWith("/ugsci/experts/")) {
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
  function modalFooter(dialog: HTMLElement) {
    return within(dialog.querySelector<HTMLElement>(".ant-modal-footer")!);
  }
  function activeSettingsPanel(dialog: HTMLElement) {
    return within(
      dialog.querySelector<HTMLElement>(".ant-tabs-tabpane-active")!,
    );
  }
  function settingsTab(dialog: HTMLElement, name: string | RegExp) {
    return within(
      dialog.querySelector<HTMLElement>('[role="tablist"]')!,
    ).getByText(name, { selector: '[role="tab"]' });
  }
  function settingsAction(dialog: HTMLElement, name: string) {
    return activeSettingsPanel(dialog).getByText(name).closest("button")!;
  }
  async function openColorPanel(scope: HTMLElement, label: string) {
    await userEvent.click(
      within(scope).getByLabelText(`${label}配色`, { selector: "button" }),
    );
    return screen.findByRole("dialog", { name: `${label}配色` });
  }
  async function settings() {
    await userEvent.click(
      await screen.findByLabelText("设置 库存评价专家", { selector: "button" }),
    );
    return screen.findByRole("dialog", { name: "专家设置" });
  }

  it("assigns and persists an identity-matched avatar through actual blank expert creation", async () => {
    mount();
    await screen.findByRole("button", { name: "库存评价专家" });
    await userEvent.click(screen.getByRole("button", { name: "创建专家" }));
    const templates = await screen.findByRole("dialog", {
      name: "选择专家模板",
    });
    await userEvent.click(within(templates).getByText("从空白模版开始创建"));
    const nameInput = await screen.findByPlaceholderText("例如：合同审查专家");
    await waitFor(() => expect(nameInput).toBeVisible());
    const creation = nameInput.closest<HTMLElement>('[role="dialog"]')!;
    await userEvent.type(nameInput, "注采运行专家");
    await userEvent.click(
      within(creation).getByRole("button", { name: "创建专家" }),
    );
    const card = await screen.findByLabelText("修改 注采运行专家 的头像", {
      selector: "button",
    });
    expect(card.querySelector("[data-avatar-role]")).toHaveAttribute(
      "data-avatar-role",
      "cycling",
    );
    expect(stored["created-expert"]).toMatchObject({
      avatar: { domain: "storage", role: "cycling" },
    });
    expect(writes.find((write) => write.url === "/agents")).toMatchObject({
      body: { name: "注采运行专家" },
    });
  });

  it("discards a late avatar load after closing a card and opening a different expert", async () => {
    mount();
    const inventory = await screen.findByLabelText("修改 库存评价专家 的头像", {
      selector: "button",
    });
    const original = fetchHost.getMockImplementation()!;
    let resolveOld!: (response: Response) => void;
    fetchHost.mockImplementation(
      async (url: string, options: RequestInit = {}) => {
        if (url === "/ugsci/experts/inventory/presentation" && !options.method)
          return new Promise<Response>((resolve) => {
            resolveOld = resolve;
          });
        return original(url, options);
      },
    );
    await userEvent.click(inventory);
    const oldStudio = await screen.findByRole("dialog", {
      name: "UGSci 专家头像工坊",
    });
    await waitFor(() => expect(resolveOld).toBeTypeOf("function"));
    await userEvent.click(
      modalFooter(oldStudio).getByRole("button", { name: /取\s*消/ }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "UGSci 专家头像工坊" }),
      ).toBeNull(),
    );
    await userEvent.click(
      screen.getByLabelText("修改 数据诊断专家 的头像", { selector: "button" }),
    );
    const current = await screen.findByRole("dialog", {
      name: "UGSci 专家头像工坊",
    });
    const industry = await within(current).findByLabelText("行业领域");
    expect(industry).toHaveValue("analysis");
    resolveOld(
      new Response(
        JSON.stringify({
          ...empty,
          avatar: { domain: "gas", role: "pressure" },
        }),
      ),
    );
    await waitFor(() => expect(industry).toHaveValue("analysis"));
    expect(writes).toEqual([]);
  });

  it("assigns an identity-matched avatar when creating an expert from a template", async () => {
    mount();
    await screen.findByRole("button", { name: "库存评价专家" });
    await userEvent.click(screen.getByRole("button", { name: "创建专家" }));
    const templates = await screen.findByRole("dialog", {
      name: "选择专家模板",
    });
    await userEvent.click(
      within(templates).getByText("储气库生产动态分析师", { exact: true }),
    );
    const card = await screen.findByLabelText(
      "修改 储气库生产动态分析师 的头像",
      { selector: "button" },
    );
    expect(card.querySelector("[data-avatar-role]")).toHaveAttribute(
      "data-avatar-role",
      "cycling",
    );
    expect(stored["created-expert"]).toMatchObject({
      avatar: { domain: "storage", role: "cycling" },
    });
  });

  it("matches legacy expert identities and opens the local avatar studio from the actual card", async () => {
    mount();
    const inventory = await screen.findByLabelText("修改 库存评价专家 的头像", {
      selector: "button",
    });
    expect(inventory.querySelector("[data-avatar-domain]")).toHaveAttribute(
      "data-avatar-domain",
      "storage",
    );
    expect(
      screen
        .getByRole("button", { name: "修改 数据诊断专家 的头像" })
        .querySelector("[data-avatar-role]"),
    ).toHaveAttribute("data-avatar-role", "quality");
    await userEvent.click(inventory);
    const studio = await screen.findByRole("dialog", {
      name: "UGSci 专家头像工坊",
    });
    const domain = await within(studio).findByLabelText("行业领域");
    expect(within(domain).getAllByRole("option")).toHaveLength(24);
    expect(domain).toHaveValue("storage");
    expect(
      within(studio).getByRole("group", { name: "小尺寸预览" }),
    ).toBeVisible();
    await userEvent.click(
      modalFooter(studio).getByRole("button", { name: /取\s*消/ }),
    );
    expect(writes).toEqual([]);
  });

  it("persists composed avatar recipes from cards and restores them after remount without overwriting display metadata", async () => {
    stored.inventory = { ...empty, revision: 3, summary: "保留的卡片简介" };
    const view = mount();
    await userEvent.click(
      await screen.findByLabelText("修改 库存评价专家 的头像", {
        selector: "button",
      }),
    );
    const studio = await screen.findByRole("dialog", {
      name: "UGSci 专家头像工坊",
    });
    await userEvent.selectOptions(
      await within(studio).findByLabelText("行业领域"),
      "gas",
    );
    await userEvent.click(
      within(studio).getByLabelText("调压计量专家", { selector: "button" }),
    );
    await userEvent.selectOptions(
      within(studio).getByLabelText("头像外壳"),
      "shield",
    );
    await userEvent.selectOptions(
      within(studio).getByLabelText("头饰领域"),
      "law",
    );
    await userEvent.selectOptions(
      within(studio).getByLabelText("头饰岗位"),
      "counsel",
    );
    await userEvent.selectOptions(
      within(studio).getByLabelText("副专长徽记"),
      "analysis",
    );
    const colors = {
      shell: "#e07842",
      visor: "#171717",
      eyes: "#9de7df",
      crown: "#356c89",
      badge: "#a86b35",
      badge_ring: "#748058",
      background: "#f3f0e8",
    };
    for (const [label, part] of [
      ["外壳", "shell"],
      ["面罩", "visor"],
      ["眼睛", "eyes"],
      ["头饰", "crown"],
      ["徽记", "badge"],
      ["徽记边框", "badge_ring"],
      ["背景", "background"],
    ] as const) {
      const panel = await openColorPanel(
        studio,
        part === "badge_ring" ? "徽记" : label,
      );
      if (part === "badge_ring") {
        await userEvent.selectOptions(
          within(panel).getByLabelText("配置部件"),
          "badge_ring",
        );
      }
      await userEvent.selectOptions(
        within(panel).getByLabelText(`${label}配色模式`),
        "custom",
      );
      const field = within(panel).getByLabelText(`${label}颜色值`);
      await userEvent.clear(field);
      await userEvent.type(field, colors[part]);
      expect(
        studio.querySelector(
          `.ugsci-avatar-preview [data-avatar-part="${part}"]`,
        ),
      ).toHaveAttribute("fill", colors[part]);
      await userEvent.click(
        within(panel).getByText("完成", { selector: "button" }),
      );
    }
    await userEvent.click(
      modalFooter(studio).getByRole("button", { name: "保存头像" }),
    );
    await waitFor(() =>
      expect(messages.success).toHaveBeenCalledWith("专家头像已保存"),
    );
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatchObject({
      url: "/ugsci/experts/inventory/presentation",
      body: {
        revision: 3,
        summary: "保留的卡片简介",
        avatar: {
          domain: "gas",
          role: "pressure",
          shell: "shield",
          crown_domain: "law",
          crown_role: "counsel",
          badge: "analysis",
          colors,
        },
      },
    });
    expect(stored.data).toBeUndefined();
    view.unmount();
    mount();
    const card = await screen.findByLabelText("修改 库存评价专家 的头像", {
      selector: "button",
    });
    expect(card.querySelector("[data-avatar-domain]")).toHaveAttribute(
      "data-avatar-domain",
      "gas",
    );
    await userEvent.click(card);
    const reopened = await screen.findByRole("dialog", {
      name: "UGSci 专家头像工坊",
    });
    expect(await within(reopened).findByLabelText("头像外壳")).toHaveValue(
      "shield",
    );
    expect(within(reopened).getByLabelText("头饰岗位")).toHaveValue("counsel");
    const restoredPalette = await openColorPanel(reopened, "外壳");
    expect(within(restoredPalette).getByLabelText("外壳颜色值")).toHaveValue(
      colors.shell,
    );
    expect(card.querySelector('[data-avatar-part="crown"]')).toHaveAttribute(
      "fill",
      colors.crown,
    );
  }, 30000);

  it("renders the approved compact single-page avatar workshop without duplicate role previews", async () => {
    mount();
    await userEvent.click(
      await screen.findByLabelText("修改 库存评价专家 的头像", {
        selector: "button",
      }),
    );
    const studio = await screen.findByRole("dialog", {
      name: "UGSci 专家头像工坊",
    });
    const industry = await within(studio).findByLabelText("行业领域");
    const editor = studio.querySelector<HTMLElement>(".ugsci-avatar-editor")!;
    expect(within(editor).queryByRole("tab")).toBeNull();
    expect(
      within(editor).getByRole("region", { name: "专家身份" }),
    ).toBeVisible();
    expect(
      within(editor).getByRole("region", { name: "部件配置" }),
    ).toBeVisible();
    expect(editor.querySelectorAll("[data-avatar-domain]")).toHaveLength(4);
    expect(editor.querySelector(".ugsci-avatar-roles svg")).toBeNull();
    expect(studio).not.toHaveTextContent("24 个行业 · 72 个岗位 · 自由组合");
    const header = studio.querySelector<HTMLElement>(".ant-modal-header")!;
    expect(header.style.minHeight).toBe("48px");
    expect(header.style.padding).toBe("10px 24px");
    expect(studio.style.width).toBe("736px");
    const crownRow = editor.querySelector(".ugsci-avatar-crown-selects")!;
    expect(crownRow.querySelectorAll("select")).toHaveLength(2);
    expect(editor.querySelectorAll(".ugsci-avatar-swatch")).toHaveLength(6);
    const reset = within(studio).getByLabelText("恢复全部默认配色", {
      selector: "button",
    });
    expect(reset.closest(".ant-modal-footer")).toBeTruthy();
    expect(
      within(editor).queryByRole("button", { name: "恢复全部默认配色" }),
    ).toBeNull();

    const preview = editor.querySelector(".ugsci-avatar-artboard svg");
    const search = within(editor).getByLabelText("搜索头像岗位");
    await userEvent.type(search, "临床");
    expect(editor.querySelector(".ugsci-avatar-artboard svg")).toBe(preview);
    await userEvent.click(
      within(editor).getByLabelText("临床诊疗专家", { selector: "button" }),
    );
    expect(industry).toHaveValue("health");
    expect(editor.querySelector("[data-avatar-domain]")).toHaveAttribute(
      "data-avatar-domain",
      "health",
    );
    await userEvent.clear(search);
    await userEvent.type(search, "未匹配岗位xyz");
    expect(within(editor).getByRole("status")).toHaveTextContent("未找到岗位");
    await userEvent.click(
      within(editor).getByLabelText("根据专家身份重新匹配", {
        selector: "button",
      }),
    );
    expect(search).toHaveValue("");
    expect(industry).toHaveValue("storage");
    await userEvent.click(
      modalFooter(studio).getByRole("button", { name: /取\s*消/ }),
    );
    expect(writes).toEqual([]);
  });

  it("retains inline avatar colors across expert settings tabs and resets the palette independently", async () => {
    mount();
    const dialog = await settings();
    expect(dialog.querySelector(".ugsci-avatar-editor")).toBeNull();
    await userEvent.click(
      within(dialog).getByText("专家头像工坊", { exact: true }),
    );
    expect(dialog.querySelector(".ugsci-avatar-editor")).toBeTruthy();
    expect(
      within(dialog).queryByRole("combobox", { name: "外壳配色模式" }),
    ).toBeNull();
    const swatch = activeSettingsPanel(dialog).getByLabelText("外壳配色", {
      selector: "button",
    });
    expect(
      swatch.parentElement?.querySelector('select[aria-label="头像外壳"]'),
    ).toBeTruthy();
    const panel = await openColorPanel(dialog, "外壳");
    await userEvent.selectOptions(
      within(panel).getByLabelText("外壳配色模式"),
      "custom",
    );
    const field = within(panel).getByLabelText("外壳颜色值");
    await userEvent.clear(field);
    await userEvent.type(field, "#356c89");
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(swatch).toHaveAttribute("aria-expanded", "false"),
    );
    expect(swatch).toHaveFocus();
    expect(screen.getByRole("dialog", { name: "专家设置" })).toBe(dialog);
    await userEvent.click(
      within(dialog).getByText("专家头像工坊", { exact: true }),
    );
    expect(dialog.querySelector(".ugsci-avatar-editor")).toBeNull();
    await userEvent.click(
      within(dialog).getByText("专家头像工坊", { exact: true }),
    );
    const reopened = await openColorPanel(dialog, "外壳");
    expect(within(reopened).getByLabelText("外壳颜色值")).toHaveValue(
      "#356c89",
    );
    await userEvent.click(
      within(reopened).getByText("完成", { selector: "button" }),
    );
    await userEvent.click(settingsTab(dialog, /技能/));
    await userEvent.click(settingsTab(dialog, "基本信息"));
    const restored = await openColorPanel(dialog, "外壳");
    expect(within(restored).getByLabelText("外壳颜色值")).toHaveValue(
      "#356c89",
    );
    await userEvent.click(
      within(restored).getByText("完成", { selector: "button" }),
    );
    await userEvent.click(
      activeSettingsPanel(dialog).getByLabelText("根据专家身份重新匹配", {
        selector: "button",
      }),
    );
    const rematched = await openColorPanel(dialog, "外壳");
    expect(within(rematched).getByLabelText("外壳颜色值")).toHaveValue(
      "#356c89",
    );
    await userEvent.click(
      within(rematched).getByText("完成", { selector: "button" }),
    );
    await userEvent.click(
      activeSettingsPanel(dialog).getByLabelText("恢复全部默认配色", {
        selector: "button",
      }),
    );
    const reset = await openColorPanel(dialog, "外壳");
    expect(within(reset).getByLabelText("外壳配色模式")).toHaveValue("auto");
    expect(
      dialog.querySelector('.ugsci-avatar-preview [data-avatar-part="shell"]'),
    ).toHaveAttribute("fill", "currentColor");
    expect(
      dialog.querySelector(
        '.ugsci-avatar-preview [data-avatar-part="background"]',
      ),
    ).toBeNull();
    expect(writes).toEqual([]);
  }, 30000);

  it("retains avatar edits on conflicts and supports retry and identity rematching", async () => {
    mount();
    await userEvent.click(
      await screen.findByLabelText("修改 库存评价专家 的头像", {
        selector: "button",
      }),
    );
    const studio = await screen.findByRole("dialog", {
      name: "UGSci 专家头像工坊",
    });
    const visor = await within(studio).findByLabelText("面罩造型");
    await userEvent.selectOptions(visor, "angular");
    failSave = true;
    await userEvent.click(
      modalFooter(studio).getByRole("button", { name: "保存头像" }),
    );
    expect(await within(studio).findByRole("alert")).toHaveTextContent(
      "revision conflict",
    );
    expect(visor).toHaveValue("angular");
    await userEvent.click(
      within(studio).getByLabelText("根据专家身份重新匹配", {
        selector: "button",
      }),
    );
    expect(visor).toHaveValue("classic");
    failSave = false;
    await userEvent.click(
      modalFooter(studio).getByRole("button", { name: "保存头像" }),
    );
    await waitFor(() =>
      expect(messages.success).toHaveBeenCalledWith("专家头像已保存"),
    );
    expect(stored.inventory).toMatchObject({
      avatar: { domain: "storage", role: "capacity" },
    });
  });

  it("filters real cards without exposing prompt metadata and keeps application routing labels", async () => {
    mount();
    const name = await screen.findByText("库存评价专家", {
      selector: "button.ugsci-expert-name",
    });
    const card = name.closest<HTMLElement>(".ant-card")!;
    const filters = within(
      screen.getByLabelText("专家分类", { selector: "nav" }),
    );
    expect(within(card).getByText("检查资料与计算结果。")).toBeVisible();
    expect(card).not.toHaveTextContent("Agent ID");
    await userEvent.click(
      filters.getByText(/^数据与研究/, { selector: "button" }),
    );
    expect(
      screen.queryByText("库存评价专家", {
        selector: "button.ugsci-expert-name",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("数据诊断专家", {
        selector: "button.ugsci-expert-name",
      }),
    ).toBeVisible();
    await userEvent.type(screen.getByLabelText("搜索专家"), "缺失");
    expect(
      screen.getByText("数据诊断专家", {
        selector: "button.ugsci-expert-name",
      }),
    ).toBeVisible();
    await userEvent.clear(screen.getByLabelText("搜索专家"));
    await userEvent.click(
      filters.getByText(/^应用专家/, { selector: "button" }),
    );
    const application = screen.getByText("应用专属专家");
    expect(application).toBeVisible();
    const appCard = application.closest<HTMLElement>(".ant-card")!;
    expect(
      within(appCard).getByText("打开应用").closest("button"),
    ).toBeVisible();
    expect(writes).toEqual([]);
  });

  it("opens a read-only full introduction from the expert name and keeps configuration in settings", async () => {
    const fullDescription =
      "负责库存资料核验。".repeat(25) +
      "逐项解释单位换算和异常数据的判断依据。";
    currentAgents[0] = { ...agents[0], description: fullDescription };
    stored.inventory = {
      ...empty,
      display_name: "库存评审",
      summary: "核验库存资料并整理判断依据。",
    };
    mount();
    const name = await screen.findByRole("button", {
      name: "库存评审",
    });
    const card = name.closest<HTMLElement>(".ant-card")!;
    expect(within(card).queryByRole("button", { name: "查看详情" })).toBeNull();
    await userEvent.click(name);
    const introduction = await screen.findByRole("dialog", {
      name: "库存评审 · 专家介绍",
    });
    expect(within(introduction).getByText(fullDescription)).toBeVisible();
    expect(
      within(introduction).getByText("核验库存资料并整理判断依据。"),
    ).toBeVisible();
    expect(within(introduction).getByText("computer_use")).toBeVisible();
    expect(within(introduction).queryByRole("tab")).toBeNull();
    expect(within(introduction).queryByRole("textbox")).toBeNull();
    expect(
      within(introduction).queryByRole("button", {
        name: /编辑|添加|保存|删除/,
      }),
    ).toBeNull();
    expect(
      fetchHost.mock.calls.filter(
        ([, options]) => options?.method && options.method !== "GET",
      ),
    ).toEqual([]);
    await userEvent.click(
      within(introduction).getByRole("button", { name: /close|关闭/i }),
    );
    await waitFor(() => expect(introduction).not.toBeInTheDocument());
    await userEvent.click(
      screen.getByLabelText("设置 库存评审", { selector: "button" }),
    );
    const settingsDialog = await screen.findByRole("dialog", {
      name: "专家设置",
    });
    expect(
      await activeSettingsPanel(settingsDialog).findByLabelText("显示名称"),
    ).toHaveValue("库存评审");
    expect(writes).toEqual([]);
  });

  it("preserves drafts across settings tabs and saves only display metadata", async () => {
    mount();
    const dialog = await settings();
    const input = await activeSettingsPanel(dialog).findByLabelText("显示名称");
    await userEvent.type(input, "库存评审");
    await userEvent.click(settingsTab(dialog, /技能/));
    document.documentElement.setAttribute("data-interface-style", "soft-focus");
    await userEvent.click(settingsTab(dialog, "基本信息"));
    expect(activeSettingsPanel(dialog).getByLabelText("显示名称")).toHaveValue(
      "库存评审",
    );
    await userEvent.click(settingsAction(dialog, "保存基本信息"));
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
      within(dialog).getByLabelText("关闭设置", { selector: "button" }),
    );
    expect(
      await screen.findByRole("button", { name: "库存评审" }),
    ).toBeVisible();
  });

  it("preserves advanced drafts and unknown running configuration fields when saving", async () => {
    mount();
    const dialog = await settings();
    await userEvent.click(settingsTab(dialog, "高级运行"));
    const shell = await activeSettingsPanel(dialog).findByPlaceholderText(
      "留空使用系统默认",
    );
    await userEvent.type(shell, "pwsh");
    await userEvent.click(settingsTab(dialog, "基本信息"));
    await userEvent.click(settingsTab(dialog, "高级运行"));
    expect(
      activeSettingsPanel(dialog).getByPlaceholderText("留空使用系统默认"),
    ).toHaveValue("pwsh");
    await userEvent.click(settingsAction(dialog, "保存运行配置"));
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
      within(dialog).getByLabelText("关闭设置", { selector: "button" }),
    );
    expect(screen.queryByText("还有未保存的修改")).not.toBeInTheDocument();
  });

  it("retains failed saves and confirms discarding an unsaved draft", async () => {
    mount();
    const dialog = await settings();
    await userEvent.type(
      await activeSettingsPanel(dialog).findByLabelText("卡片简介"),
      "需要保留的修改",
    );
    failSave = true;
    await userEvent.click(settingsAction(dialog, "保存基本信息"));
    await waitFor(() => expect(messages.error).toHaveBeenCalled());
    expect(activeSettingsPanel(dialog).getByLabelText("卡片简介")).toHaveValue(
      "需要保留的修改",
    );
    await userEvent.click(
      within(dialog).getByLabelText("关闭设置", { selector: "button" }),
    );
    await waitFor(() =>
      expect(
        screen.getByText("关闭后将放弃未保存的内容。已保存的配置不受影响。"),
      ).toBeVisible(),
    );
    await userEvent.click(screen.getByRole("button", { name: "继续编辑" }));
    expect(activeSettingsPanel(dialog).getByLabelText("卡片简介")).toHaveValue(
      "需要保留的修改",
    );
  });
});
