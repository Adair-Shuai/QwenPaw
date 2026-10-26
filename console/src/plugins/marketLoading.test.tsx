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
    name: `快速技能-${i + 1}`, path: `fast-${i + 1}`, description: "目录渲染测试", tag: "科研",
  }));

  beforeEach(() => {
    failRefresh = false;
    localStorage.clear();
    routeRegistry.__resetForTests();
    marketplaceExtensionRegistry.removeBySource("ugsci");
    const experts = new Promise<Response>((resolve) => { finishExperts = resolve; });
    fetchHost.mockReset().mockImplementation(async (url: string) => {
      if (url.includes("oss-proxy")) {
        if (url.includes("refresh=true") && failRefresh) return new Response("offline", { status: 502 });
        const decoded = decodeURIComponent(url);
        if (decoded.includes("skills/manifest.json")) return Response.json({ skills });
        if (decoded.includes("agents/manifest.json")) return experts.then((response) => response.clone());
        if (decoded.includes("mcp/manifest.json")) return Response.json({ servers: [{ id: "fast-mcp", name: "即时 MCP", tags: [], transport: "http", config: { url: "https://example.com/mcp" } }] });
      }
      if (url === "/agents") return Response.json({ agents: [{ id: "researcher", name: "科研专家" }] });
      if (url.startsWith("/market/search")) return Response.json({ results: [], by_provider: {}, errors: [] });
      if (url === "/market/providers" || url.startsWith("/skills") || url === "/mcp") return Response.json([]);
      return Response.json({});
    });
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: { React, antd, antdIcons: {}, getApiUrl: (v: string) => `/api${v}`, getApiToken: () => "", fetch: fetchHost, useSelectedAgent: () => ({ id: "researcher" }) },
        menu: { add: vi.fn() }, route: routeRegistry, marketplace: marketplaceExtensionRegistry,
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
    await act(async () => { new Function(fs.readFileSync(path.resolve(process.cwd(), "..", bundlePath), "utf8"))(); });
    const Page = marketplaceExtensionRegistry.get("ugsci")!.component;
    return render(<antd.ConfigProvider theme={{ token: { motion: false } }}><antd.App><Page /></antd.App></antd.ConfigProvider>);
  }

  it("paints skills and MCP before a slow expert catalog and limits initial cards", async () => {
    await openMarket();
    expect(await screen.findByText("快速技能-1")).toBeVisible();
    expect(screen.queryByText("快速技能-25")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^安\s*装$/ })).toHaveLength(24);
    await userEvent.click(screen.getByRole("tab", { name: /MCP 市场/ }));
    expect(await screen.findByText("即时 MCP")).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: /人才市场/ }));
    expect(screen.getByText("正在加载人才市场...")).toBeVisible();
    await act(async () => { finishExperts(Response.json({ agents: [{ id: "expert", name: "迟到专家", tags: [], description: "独立到达" }] })); });
    expect(await screen.findByText("迟到专家")).toBeVisible();
  });

  it("searches the whole catalog beyond the first batch and keeps cards on refresh failure", async () => {
    await openMarket();
    await screen.findByText("快速技能-1");
    await userEvent.click(screen.getByRole("button", { name: /显示更多技能/ }));
    expect(screen.getByText("快速技能-48")).toBeVisible();
    expect(screen.queryByText("快速技能-49")).not.toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText("搜索技能市场..."), "快速技能-61");
    expect(await screen.findByText("快速技能-61")).toBeVisible();
    expect(screen.queryByText("快速技能-1")).not.toBeInTheDocument();
    await act(async () => { finishExperts(Response.json({ agents: [] })); });
    failRefresh = true;
    await userEvent.click(screen.getByRole("button", { name: "刷新技能目录" }));
    await waitFor(() => expect(fetchHost.mock.calls.some(([url]) => url.includes("skills%2Fmanifest.json") && url.includes("refresh=true"))).toBe(true));
    expect(await screen.findByText("UGSci 官方 OSS 技能库加载失败")).toBeVisible();
    expect(screen.getByText("快速技能-61")).toBeVisible();
  });

  it("opens the expert publisher from the real market and blocks unconfigured OSS uploads", async () => {
    await openMarket();
    await userEvent.click(screen.getByRole("tab", { name: /人才市场/ }));
    await userEvent.click(screen.getByRole("button", { name: "发布 / 更新专家" }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
    expect(await screen.findByText(/管理员尚未配置远端发布服务/)).toBeVisible();
    expect(screen.getByLabelText("导入专家 JSON")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上传到 OSS 待审核" })).toBeDisabled();
    expect(fetchHost.mock.calls.some(([url]) => url.includes("/publisher/expert/publish"))).toBe(false);
  });
});
