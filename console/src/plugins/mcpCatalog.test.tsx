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
import { marketplaceExtensionRegistry } from "../pages/Market/marketplaceRegistry";
import {
  normalizeMcpTransport,
  resolveMcpConnection,
} from "../../../plugins/bundle/ugsci/ui/src/market/mcpConnection";

it("normalizes remote transport aliases and rejects unsupported connections", () => {
  for (const value of [
    "streamable-http",
    "streamableHttp",
    "streamable_http",
    "http",
  ])
    expect(normalizeMcpTransport(value)).toBe("streamable_http");
  expect(normalizeMcpTransport(undefined, true)).toBe("streamable_http");
  expect(() => normalizeMcpTransport("websocket")).toThrow();
});

it("resolves query tokens safely without changing authorization prefixes", () => {
  const original = {
    url: "https://example.com/mcp?apikey=${KEY}",
    headers: { Authorization: "Bearer ${KEY}" },
    args: ["${PATH}"],
    env: { FIXED: "user" },
  };
  const resolved = resolveMcpConnection(original, {
    KEY: "a+b&c=d",
    PATH: "C:\\My Research\\server.js",
  });
  expect(new URL(resolved.url).searchParams.get("apikey")).toBe("a+b&c=d");
  expect(resolved.headers.Authorization).toBe("Bearer a+b&c=d");
  expect(resolved.args).toEqual(["C:\\My Research\\server.js"]);
  expect(original.url).toContain("${KEY}");
  expect(() => resolveMcpConnection(original, {})).toThrow();
  expect(() =>
    resolveMcpConnection(
      { headers: { Authorization: "${KEY}" } },
      { KEY: "bad\r\ninjected: true" },
    ),
  ).toThrow();
  expect(() =>
    resolveMcpConnection(
      { url: "${URL}" },
      { URL: "http://remote.example/mcp" },
    ),
  ).toThrow();
});

describe.each([
  "plugins/bundle/ugsci/ui/dist/index.js",
  "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
])("packaged MCP catalog: %s", (bundlePath) => {
  const fetchHost = vi.fn();
  const openExternalLink = vi.fn();
  let posts: any[];
  let updates: any[];
  let oauthPhase: string;
  let toolsFail: boolean;
  let savedClients: any[];
  let oauth: boolean;
  beforeEach(() => {
    posts = [];
    updates = [];
    oauthPhase = "pending";
    toolsFail = false;
    savedClients = [];
    openExternalLink.mockReset();
    oauth = false;
    localStorage.clear();
    routeRegistry.__resetForTests();
    marketplaceExtensionRegistry.removeBySource("ugsci");
    fetchHost
      .mockReset()
      .mockImplementation(async (url: string, init?: RequestInit) => {
        if (
          url.includes("oss-proxy") &&
          decodeURIComponent(url).includes("mcp/manifest.json")
        )
          return new Response(
            JSON.stringify({
              tag_groups: { research: ["research"] },
              servers: [
                {
                  id: "fixture-cloud",
                  name: "科研云连接",
                  description: "科研资料读取",
                  tags: ["research"],
                  transport: "streamable-http",
                  config: {
                    url: "https://example.com/mcp?apikey=${LAB_KEY}",
                    headers: { Authorization: "${LAB_KEY}" },
                  },
                  env: ["LAB_KEY"],
                  auth: oauth ? { type: "oauth2" } : undefined,
                  requirements: ["需要研究机构授权"],
                  limitations: ["尚未执行实际查询"],
                  input_hints: {
                    LAB_KEY: {
                      label: "研究平台密钥",
                      help: "在平台账号中获取",
                      isSecret: true,
                    },
                  },
                },
              ],
            }),
          );
        if (url.includes("oss-proxy"))
          return new Response(JSON.stringify({ agents: [], skills: [] }));
        if (url === "/agents")
          return new Response(
            JSON.stringify({
              agents: [{ id: "researcher", name: "科研专家" }],
            }),
          );
        if (url === "/mcp" && init?.method === "POST") {
          const body = JSON.parse(init.body as string);
          posts.push(body);
          const saved = { ...body.client, key: "fixture-cloud", url: "https://example.com/mcp?apikey=***", headers: { Authorization: "***" } };
          savedClients = [saved];
          return new Response(JSON.stringify(saved));
        }
        if (url === "/mcp") return new Response(JSON.stringify(savedClients));
        if (url.startsWith("/mcp/oauth/start/")) return new Response(JSON.stringify({ auth_url: "https://auth.example.com/authorize?state=fixture", session_id: "session-fixture" }));
        if (url.startsWith("/mcp/oauth/status/")) return new Response(JSON.stringify({ authorized: true, phase: url.includes("session_id=") ? oauthPhase : undefined }));
        if (url.startsWith("/mcp/oauth/session/") && init?.method === "DELETE") return new Response(JSON.stringify({ message: "cancelled" }));
        if (url === "/mcp/fixture-cloud" && init?.method === "PUT") {
          const body = JSON.parse(init.body as string);
          updates.push(body);
          savedClients = [{ ...savedClients[0], ...body }];
          return new Response(JSON.stringify(savedClients[0]));
        }
        if (url.startsWith("/mcp/tools/")) return toolsFail ? new Response("upstream-secret-do-not-display", { status: 502 }) : new Response(JSON.stringify([{ name: "research_search" }]));
        if (url === "/market/providers" || url.startsWith("/skills"))
          return new Response("[]");
        if (url.startsWith("/market/search"))
          return new Response(JSON.stringify({ results: [], by_provider: {} }));
        return new Response(JSON.stringify({}));
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
          openExternalLink,
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
    render(
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        <antd.App>
          <Page />
        </antd.App>
      </antd.ConfigProvider>,
    );
    await userEvent.click(await screen.findByRole("tab", { name: /MCP/ }));
    await screen.findByText("科研云连接");
  }
  it("imports the actual market remote URL headers and user credential after confirmation", async () => {
    await openMarket();
    await userEvent.click(screen.getByRole("button", { name: /^连\s*接$/ }));
    const dialog = await screen.findByRole("dialog");
    expect(posts).toHaveLength(0);
    await waitFor(() =>
      expect(within(dialog).getByText("需要研究机构授权")).toBeVisible(),
    );
    await userEvent.type(
      within(dialog).getByPlaceholderText("请输入 研究平台密钥"),
      "a+b&c=d",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "添加连接" }),
    );
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0].client.transport).toBe("streamable_http");
    expect(new URL(posts[0].client.url).searchParams.get("apikey")).toBe(
      "a+b&c=d",
    );
    expect(posts[0].client.headers.Authorization).toBe("a+b&c=d");
    expect(posts[0].client.enabled).toBe(true);
  });
  it("keeps OAuth catalog connections disabled until the user authorizes them", async () => {
    oauth = true;
    await openMarket();
    await userEvent.click(screen.getByRole("button", { name: /^连\s*接$/ }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(
      within(dialog).getByPlaceholderText("请输入 研究平台密钥"),
      "company-code",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "添加连接" }),
    );
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0].client.enabled).toBe(false);
  });
  it("refreshes the OSS catalog explicitly without relying on the browser cache", async () => {
    await openMarket();
    await userEvent.click(screen.getByRole("button", { name: "刷新目录" }));
    await waitFor(() =>
      expect(
        fetchHost.mock.calls.some(
          ([url, init]) =>
            url.includes("mcp%2Fmanifest.json") &&
            url.includes("refresh=true") &&
            init?.cache === "no-store",
        ),
      ).toBe(true),
    );
  });

  it("authorizes from the actual marketplace and verifies tools before reporting connected", async () => {
    oauth = true;
    await openMarket();
    await userEvent.click(screen.getByRole("button", { name: /^连\s*接$/ }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(within(dialog).getByPlaceholderText("请输入 研究平台密钥"), "account-code");
    await userEvent.click(within(dialog).getByRole("button", { name: "添加连接" }));
    await within(dialog).findByText("等待浏览器登录授权");
    expect(posts[0].client.enabled).toBe(false);
    expect(updates).toHaveLength(0);
    expect(openExternalLink).toHaveBeenCalledWith("https://auth.example.com/authorize?state=fixture");
    const start = fetchHost.mock.calls.find(([url]) => url.startsWith("/mcp/oauth/start/"));
    expect(JSON.parse(start![1].body as string).url).toBe("");
    expect(start![1].headers["x-agent-id"]).toBe("researcher");
    expect(within(dialog).queryByText(/已连接/)).toBeNull();
    oauthPhase = "authorized";
    await act(async () => { window.dispatchEvent(new Event("focus")); });
    await within(dialog).findByText("已连接 · 已读取 1 个工具", {}, { timeout: 5000 });
    expect(updates).toEqual([{ enabled: true }]);
    expect(posts).toHaveLength(1);
    expect(fetchHost.mock.calls.find(([url]) => url.startsWith("/mcp/tools/"))![1].headers["x-agent-id"]).toBe("researcher");
  });

  it("retries denied marketplace authorization and cancels without enabling or duplicating clients", async () => {
    oauth = true;
    oauthPhase = "denied";
    await openMarket();
    await userEvent.click(screen.getByRole("button", { name: /^连\s*接$/ }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(within(dialog).getByPlaceholderText("请输入 研究平台密钥"), "account-code");
    await userEvent.click(within(dialog).getByRole("button", { name: "添加连接" }));
    await within(dialog).findByText(/授权未获同意/);
    expect(updates).toHaveLength(0);
    oauthPhase = "pending";
    await userEvent.click(within(dialog).getByRole("button", { name: "登录授权" }));
    await within(dialog).findByText("等待浏览器登录授权");
    await userEvent.click(within(dialog).getByRole("button", { name: "重新打开授权页" }));
    expect(openExternalLink).toHaveBeenCalledTimes(3);
    await userEvent.click(within(dialog).getByRole("button", { name: "取消授权" }));
    await within(dialog).findByText(/已取消本次授权等待/);
    expect(fetchHost.mock.calls.some(([url, init]) => url.includes("/oauth/session/") && init?.method === "DELETE")).toBe(true);
    oauthPhase = "authorized";
    await act(async () => { window.dispatchEvent(new Event("focus")); });
    expect(updates).toHaveLength(0);
    expect(posts).toHaveLength(1);
    await userEvent.click(within(dialog).getByRole("button", { name: /^关\s*闭$/ }));
    await userEvent.click(await screen.findByRole("button", { name: "管理连接" }));
    expect(posts).toHaveLength(1);
    await waitFor(() => expect(screen.getByText("已保存 · 账号授权与连接待确认")).toBeVisible());
  });

  it("keeps saved token connections retryable without displaying upstream credentials", async () => {
    toolsFail = true;
    await openMarket();
    await userEvent.click(screen.getByRole("button", { name: /^连\s*接$/ }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(within(dialog).getByPlaceholderText("请输入 研究平台密钥"), "secret-value");
    await userEvent.click(within(dialog).getByRole("button", { name: "添加连接" }));
    await within(dialog).findByText(/配置已保存，工具连接检测未通过/);
    expect(within(dialog).queryByText(/已连接/)).toBeNull();
    expect(document.body.textContent).not.toContain("upstream-secret-do-not-display");
    toolsFail = false;
    await userEvent.click(within(dialog).getByRole("button", { name: "重新检测" }));
    await within(dialog).findByText("已连接 · 已读取 1 个工具");
    expect(posts).toHaveLength(1);
    await userEvent.click(within(dialog).getByRole("button", { name: "更新凭证" }));
    expect(within(dialog).getByPlaceholderText("请输入 研究平台密钥")).toHaveValue("");
  });
});
