import fs from "node:fs";
import path from "node:path";
import React from "react";
import * as antd from "antd";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routeRegistry } from "./registry/store";
import { marketplaceExtensionRegistry } from "../pages/Market/marketplaceRegistry";

describe.each([
  "plugins/bundle/ugsci/ui/dist/index.js",
  "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
])("market loading in shipped bundle: %s", (bundlePath) => {
  const fetchHost = vi.fn();
  let finishExperts: (response: Response) => void;
  let failRefresh = false;
  const skills = Array.from({ length: 61 }, (_, i) => ({
    name: `快速技能-${i + 1}`,
    path: `fast-${i + 1}`,
    description: "目录渲染测试",
    tag: "科研",
  }));

  beforeEach(() => {
    failRefresh = false;
    localStorage.clear();
    routeRegistry.__resetForTests();
    marketplaceExtensionRegistry.removeBySource("ugsci");
    const experts = new Promise<Response>((resolve) => {
      finishExperts = resolve;
    });
    fetchHost.mockReset().mockImplementation(async (url: string) => {
      if (url.includes("oss-proxy")) {
        if (url.includes("refresh=true") && failRefresh)
          return new Response("offline", { status: 502 });
        const decoded = decodeURIComponent(url);
        if (decoded.includes("skills/manifest.json"))
          return Response.json({ skills });
        if (decoded.includes("agents/manifest.json"))
          return experts.then((response) => response.clone());
        if (decoded.includes("mcp/manifest.json"))
          return Response.json({
            servers: [
              {
                id: "fast-mcp",
                name: "即时 MCP",
                tags: [],
                transport: "http",
                config: { url: "https://example.com/mcp" },
              },
            ],
          });
      }
      if (url === "/agents")
        return Response.json({
          agents: [{ id: "researcher", name: "科研专家" }],
        });
      if (url.startsWith("/market/search"))
        return Response.json({ results: [], by_provider: {}, errors: [] });
      if (
        url === "/market/providers" ||
        url.startsWith("/skills") ||
        url === "/mcp"
      )
        return Response.json([]);
      return Response.json({});
    });
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: {
          React,
          antd,
          antdIcons: {},
          getApiUrl: (v: string) => `/api${v}`,
          getApiToken: () => "",
          fetch: fetchHost,
          useSelectedAgent: () => ({ id: "researcher" }),
        },
        menu: { add: vi.fn() },
        route: routeRegistry,
        marketplace: marketplaceExtensionRegistry,
        sidebar: { registerSimpleModeItems: vi.fn() },
      },
    });
  });
  afterEach(() => {
    cleanup();
    routeRegistry.__resetForTests();
    marketplaceExtensionRegistry.removeBySource("ugsci");
    Reflect.deleteProperty(window, "QwenPaw");
    vi.restoreAllMocks();
  });
  async function openMarket() {
    await act(async () => {
      new Function(
        fs.readFileSync(path.resolve(process.cwd(), "..", bundlePath), "utf8"),
      )();
    });
    const Page = marketplaceExtensionRegistry.get("ugsci")!.component;
    return render(
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        <antd.App>
          <Page />
        </antd.App>
      </antd.ConfigProvider>,
    );
  }

  it("paints skills and MCP before a slow expert catalog and limits initial cards", async () => {
    await openMarket();
    expect(await screen.findByText("快速技能-1")).toBeVisible();
    expect(screen.queryByText("快速技能-25")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^安\s*装$/ })).toHaveLength(
      24,
    );
    await userEvent.click(screen.getByRole("tab", { name: /MCP 市场/ }));
    expect(await screen.findByText("即时 MCP")).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: /人才市场/ }));
    expect(screen.getByText("正在加载人才市场...")).toBeVisible();
    await act(async () => {
      finishExperts(
        Response.json({
          agents: [
            {
              id: "expert",
              name: "迟到专家",
              tags: [],
              description: "独立到达",
            },
          ],
        }),
      );
    });
    expect(await screen.findByText("迟到专家")).toBeVisible();
  });

  it("searches the whole catalog beyond the first batch and keeps cards on refresh failure", async () => {
    await openMarket();
    await screen.findByText("快速技能-1");
    await userEvent.click(screen.getByRole("button", { name: /显示更多技能/ }));
    expect(screen.getByText("快速技能-48")).toBeVisible();
    expect(screen.queryByText("快速技能-49")).not.toBeInTheDocument();
    await userEvent.type(
      screen.getByPlaceholderText("搜索技能市场..."),
      "快速技能-61",
    );
    expect(await screen.findByText("快速技能-61")).toBeVisible();
    expect(screen.queryByText("快速技能-1")).not.toBeInTheDocument();
    await act(async () => {
      finishExperts(Response.json({ agents: [] }));
    });
    failRefresh = true;
    await userEvent.click(screen.getByRole("button", { name: "刷新技能目录" }));
    await waitFor(() =>
      expect(
        fetchHost.mock.calls.some(
          ([url]) =>
            url.includes("skills%2Fmanifest.json") &&
            url.includes("refresh=true"),
        ),
      ).toBe(true),
    );
    expect(
      await screen.findByText("UGSci 官方 OSS 技能库加载失败"),
    ).toBeVisible();
    expect(screen.getByText("快速技能-61")).toBeVisible();
  });

  it("opens the expert publisher from the real market and blocks unconfigured OSS uploads", async () => {
    await openMarket();
    await userEvent.click(screen.getByRole("tab", { name: /人才市场/ }));
    await userEvent.click(
      screen.getByRole("button", { name: "发布 / 更新专家" }),
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
    expect(await screen.findByText(/管理员尚未配置远端发布服务/)).toBeVisible();
    expect(screen.getByLabelText("导入专家 JSON")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "上传到 OSS 待审核" }),
    ).toBeDisabled();
    expect(
      fetchHost.mock.calls.some(([url]) =>
        url.includes("/publisher/expert/publish"),
      ),
    ).toBe(false);
  });

  it("installs a signed expert package through the mounted market and resumes a failed job", async () => {
    const fallback = fetchHost.getMockImplementation()!;
    let status = "planned";
    let attempts = 0;
    const job = () => ({
      id: "a".repeat(64),
      name: "方法专家",
      status,
      runtime_verified: status === "ready",
      optional_setup: ["商业模拟器"],
    });
    fetchHost.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === "/expert-packages/plan")
        return Response.json({
          ...job(),
          version: "1.0.0",
          skills: 2,
          download_bytes: 1024,
        });
      if (url === "/expert-packages/installations")
        return Response.json(status === "planned" ? [] : [job()]);
      if (
        url.startsWith("/expert-packages/installations/") &&
        init?.method === "POST"
      ) {
        attempts += 1;
        status = attempts === 1 ? "failed" : "verifying";
        return Response.json({
          ...job(),
          error: status === "failed" ? "下载中断" : undefined,
        });
      }
      return fallback(url, init);
    });
    await openMarket();
    finishExperts(
      Response.json({
        agents: [
          {
            id: "methods",
            name: "方法专家",
            description: "带方法库",
            tags: [],
            package_manifest: "expert-packages/manifests/test.json",
          },
        ],
      }),
    );
    await userEvent.click(screen.getByRole("tab", { name: /人才市场/ }));
    await userEvent.click(await screen.findByText("方法专家"));
    await userEvent.click(screen.getByRole("button", { name: "安装专家包" }));
    await waitFor(() =>
      expect(
        screen.getByText(/2 个技能，配套方法服务与运行依赖/),
      ).toBeVisible(),
    );
    await userEvent.click(screen.getByRole("button", { name: "安装专家包" }));
    expect(await screen.findByText("方法专家 · 安装失败")).toBeVisible();
    expect(
      screen.queryByText("方法专家 · 基础能力已就绪"),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "继续安装" }));
    expect(await screen.findByText("方法专家 · 执行方法自检")).toBeVisible();
    status = "starting";
    expect(
      await screen.findByText(
        "方法专家 · 启动专家并检查方法工具",
        {},
        { timeout: 4000 },
      ),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "取消安装" })).toBeDisabled();
    status = "startup_failed";
    expect(
      await screen.findByText(
        "方法专家 · 已安装，启动检查未通过",
        {},
        { timeout: 4000 },
      ),
    ).toBeVisible();
    expect(
      screen.queryByText("方法专家 · 基础能力已就绪"),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "重试启动" }));
    status = "ready";
    expect(
      await screen.findByText(
        "方法专家 · 基础能力已就绪",
        {},
        { timeout: 4000 },
      ),
    ).toBeVisible();
    expect(screen.getByText(/可选能力需另行配置：商业模拟器/)).toBeVisible();
    expect(
      fetchHost.mock.calls.some(
        ([url, init]) => url === "/agents" && init?.method === "POST",
      ),
    ).toBe(false);
    expect(attempts).toBe(3);
  });

  it("opens scoped expert recovery actions and rejects unknown destinations", async () => {
    const host = (window as any).QwenPaw.host;
    let selected = "researcher";
    const events: string[] = [];
    host.setSelectedAgent = vi.fn((id: string) => {
      selected = id;
      events.push(`select:${id}`);
    });
    const navigate = vi.fn((route: string) =>
      events.push(`navigate:${selected}:${route}`),
    );
    host.useNavigate = () => navigate;
    const fallback = fetchHost.getMockImplementation()!;
    fetchHost.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === "/expert-packages/installations")
        return Response.json([
          ...["models", "skills", "tools", "https://untrusted.example"].map(
            (action, index) => ({
              id: String(index).repeat(64),
              agent_id: `expert-${action}`,
              name: action,
              status: "startup_failed",
              error: "请完成配置后重试",
              problem: {
                code:
                  action === "models"
                    ? "model_required"
                    : action === "skills"
                    ? "skills_required"
                    : action === "tools"
                    ? "service_unavailable"
                    : "required",
                action,
              },
            }),
          ),
          {
            id: "e".repeat(64),
            name: "旧版环境",
            status: "repair_required",
            error: "运行环境需要修复",
          },
        ]);
      return fallback(url, init);
    });
    await openMarket();
    await userEvent.click(
      await screen.findByRole("button", { name: "选择对话模型" }),
    );
    expect(navigate).toHaveBeenLastCalledWith("/models");
    expect(host.setSelectedAgent).not.toHaveBeenCalled();
    expect(screen.getByText("models · 待选择对话模型")).toBeVisible();
    expect(screen.getByText("skills · 待补齐必需技能")).toBeVisible();
    expect(screen.getByText("tools · 方法服务尚未可用")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "检查必需技能" }));
    await userEvent.click(screen.getByRole("button", { name: "检查方法服务" }));
    expect(events).toEqual([
      "navigate:researcher:/models",
      "select:expert-skills",
      "navigate:expert-skills:/ugsci-tools-skills?tab=skills",
      "select:expert-tools",
      "navigate:expert-tools:/ugsci-tools-skills?tab=tools",
    ]);
    await userEvent.click(screen.getByRole("button", { name: "查看专家配置" }));
    expect(navigate).toHaveBeenLastCalledWith("/ugsci-experts");
    expect(
      screen.queryByRole("button", { name: "继续安装" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "重试启动" })).toHaveLength(4);
    delete host.setSelectedAgent;
    await userEvent.click(screen.getByRole("button", { name: "检查必需技能" }));
    expect(await screen.findByText(/无法切换到此专家/)).toBeVisible();
    expect(navigate).toHaveBeenCalledTimes(4);
  });

  it("repairs an installed expert through the mounted market without recreating it", async () => {
    const id = "f".repeat(64);
    let status = "repair_required";
    let rejectRepair = true;
    const fallback = fetchHost.getMockImplementation()!;
    const state = () => ({
      id,
      name: "待修复专家",
      agent_id: "existing-expert",
      status,
      operation: "repair",
      runtime_verified: false,
      ...(status === "startup_failed"
        ? { problem: { code: "agent_disabled", action: "experts" } }
        : {}),
    });
    fetchHost.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === "/expert-packages/installations")
        return Response.json([state()]);
      if (url === `/expert-packages/installations/${id}/repair`) {
        if (rejectRepair)
          return Response.json({ detail: "请先停用专家" }, { status: 409 });
        status = "repairing";
        return Response.json(state());
      }
      if (url === `/expert-packages/installations/${id}`) {
        status = "startup_failed";
        return Response.json(state());
      }
      return fallback(url, init);
    });
    await openMarket();
    await userEvent.click(
      await screen.findByRole("button", { name: "修复运行环境" }),
    );
    expect(await screen.findByText(/请先停用专家/)).toBeVisible();
    rejectRepair = false;
    await userEvent.click(screen.getByRole("button", { name: "修复运行环境" }));
    expect(
      await screen.findByText("待修复专家 · 准备新的运行环境"),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "取消修复" })).toBeEnabled();
    status = "repair_committing";
    await waitFor(
      () =>
        expect(screen.getByRole("button", { name: "取消修复" })).toBeDisabled(),
      { timeout: 4000 },
    );
    status = "repair_failed";
    await userEvent.click(
      await screen.findByRole(
        "button",
        { name: "修复运行环境" },
        { timeout: 4000 },
      ),
    );
    for (const [next, label] of [
      ["interrupted", "环境修复已中断，可重试"],
      ["cancelled", "环境修复已取消"],
    ]) {
      status = next;
      expect(
        await screen.findByText(`待修复专家 · ${label}`, {}, { timeout: 4000 }),
      ).toBeVisible();
      await userEvent.click(
        screen.getByRole("button", { name: "修复运行环境" }),
      );
    }
    status = "repaired";
    const start = await screen.findByRole(
      "button",
      { name: "检查并启动" },
      { timeout: 4000 },
    );
    expect(
      screen
        .getByText("待修复专家 · 运行环境已修复，可检查启动")
        .closest(".ant-alert"),
    ).not.toHaveClass("ant-alert-success");
    await userEvent.click(start);
    expect(await screen.findByText("待修复专家 · 专家尚未启用")).toBeVisible();
    const writes = fetchHost.mock.calls
      .filter(([, init]) => init?.method === "POST")
      .map(([url]) => url);
    expect(writes).toEqual([
      "/market/search",
      ...Array(5).fill(`/expert-packages/installations/${id}/repair`),
      `/expert-packages/installations/${id}`,
    ]);
    expect(
      fetchHost.mock.calls.some(([, init]) => init?.method === "DELETE"),
    ).toBe(false);
  });

  it("blocks expert package creation when the signed installation plan is rejected", async () => {
    const fallback = fetchHost.getMockImplementation()!;
    fetchHost.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === "/expert-packages/plan")
        return Response.json({ detail: "专家包签名校验失败" }, { status: 400 });
      return fallback(url, init);
    });
    await openMarket();
    finishExperts(
      Response.json({
        agents: [
          {
            id: "bad",
            name: "待验证专家",
            description: "签名包",
            tags: [],
            package_manifest: "expert-packages/manifests/bad.json",
          },
        ],
      }),
    );
    await userEvent.click(screen.getByRole("tab", { name: /人才市场/ }));
    await userEvent.click(await screen.findByText("待验证专家"));
    await userEvent.click(screen.getByRole("button", { name: "安装专家包" }));
    await waitFor(() =>
      expect(screen.getByText(/专家包签名校验失败/)).toBeVisible(),
    );
    expect(screen.getByRole("button", { name: "安装专家包" })).toBeDisabled();
    expect(
      fetchHost.mock.calls.some(
        ([url, init]) => url === "/agents" && init?.method === "POST",
      ),
    ).toBe(false);
  });
});
