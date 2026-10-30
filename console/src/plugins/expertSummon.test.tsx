import fs from "node:fs";
import path from "node:path";
import React from "react";
import * as antd from "antd";
import * as antdIcons from "@ant-design/icons";
import {
  BrowserRouter,
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routeRegistry } from "./registry/store";
import { useAgentStore } from "../stores/agentStore";

describe.each([
  "plugins/bundle/ugsci/ui/dist/index.js",
  "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
])("packaged expert summon: %s", (bundlePath) => {
  const select = vi.fn();
  const messages = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  let brokenNavigation = false;
  beforeEach(() => {
    sessionStorage.clear();
    routeRegistry.__resetForTests();
    brokenNavigation = false;
    Object.values(messages).forEach((mock) => mock.mockClear());
    select
      .mockReset()
      .mockImplementation((id) =>
        useAgentStore.getState().setSelectedAgent(id),
      );
    useAgentStore.setState({
      selectedAgent: "default",
      lastChatIdByAgent: { default: "old-chat" },
    });
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: {
          React,
          antd: { ...antd, message: messages },
          antdIcons,
          getApiUrl: (url: string) => `/api${url}`,
          getApiToken: () => "",
          setSelectedAgent: select,
          useNavigate: () => {
            const navigate = useNavigate();
            return (target: string) => {
              if (brokenNavigation) throw new Error("Navigation unavailable");
              navigate(target);
            };
          },
          fetch: vi.fn(
            async (url: string) =>
              new Response(
                JSON.stringify(
                  url === "/agents"
                    ? {
                        agents: [
                          {
                            id: "default",
                            name: "Fixture default",
                            enabled: true,
                          },
                          {
                            id: "expert-a",
                            name: "Fixture expert",
                            enabled: true,
                          },
                          {
                            id: "disabled",
                            name: "Disabled expert",
                            enabled: false,
                          },
                          {
                            id: "datapaw",
                            name: "Fixture Data A",
                            enabled: true,
                            managed_by_app: "datapaw",
                            available_in_chat: false,
                          },
                          {
                            id: "qwenpaw-data",
                            name: "Fixture Data B",
                            enabled: true,
                            managed_by_app: "qwenpaw-data",
                            available_in_chat: false,
                          },
                          {
                            id: "restricted",
                            name: "Fixture restricted",
                            enabled: true,
                            available_in_chat: false,
                          },
                        ],
                      }
                    : url.startsWith("/agents/") && !url.endsWith("/skills")
                    ? { profile: {} }
                    : [],
                ),
              ),
          ),
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
  afterEach(() => {
    cleanup();
    antd.message.destroy();
    routeRegistry.__resetForTests();
    Reflect.deleteProperty(window, "QwenPaw");
    sessionStorage.clear();
    vi.restoreAllMocks();
  });
  function ChatTarget() {
    const id = useAgentStore((state) => state.selectedAgent);
    return (
      <div data-testid="chat-target">
        {id}:{sessionStorage.getItem("qwenpaw_pending_new_chat")}
      </div>
    );
  }
  function mount(browser = false) {
    const Page = routeRegistry
      .snapshot()
      .find((route) => route.id === "ugsci.experts")!.Component;
    const routes = (
      <Routes>
        <Route path="/ugsci-experts" element={<Page />} />
        <Route path="/chat" element={<ChatTarget />} />
        <Route
          path="/apps/:appId"
          element={<div data-testid="app-target">Application</div>}
        />
      </Routes>
    );
    return render(
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        <antd.App>
          {browser ? (
            <BrowserRouter basename="/console">{routes}</BrowserRouter>
          ) : (
            <MemoryRouter initialEntries={["/ugsci-experts"]}>
              {routes}
            </MemoryRouter>
          )}
        </antd.App>
      </antd.ConfigProvider>,
    );
  }
  async function summon(name: string) {
    const label = await screen.findByText(name, { exact: true });
    const card = label.closest<HTMLElement>(".ant-card")!;
    await userEvent.click(
      within(card).getByRole("button", { name: /开始对话/ }),
    );
  }
  it.each([
    ["Fixture default", "default"],
    ["Fixture expert", "expert-a"],
  ])("opens a fresh chat for %s through the page router", async (name, id) => {
    mount();
    await summon(name);
    expect(await screen.findByTestId("chat-target")).toHaveTextContent(
      `${id}:1`,
    );
    expect(select).toHaveBeenCalledWith(id);
    expect(useAgentStore.getState().lastChatIdByAgent.default).toBe("old-chat");
  });
  it("preserves the host basename when summoning", async () => {
    window.history.replaceState({}, "", "/console/ugsci-experts");
    mount(true);
    await summon("Fixture expert");
    expect(await screen.findByTestId("chat-target")).toHaveTextContent(
      "expert-a:1",
    );
    expect(window.location.pathname).toBe("/console/chat");
  });
  it.each([
    ["Fixture Data A", "datapaw", false],
    ["Fixture Data B", "qwenpaw-data", false],
    ["Fixture Data A", "datapaw", true],
    ["Fixture Data B", "qwenpaw-data", true],
  ])("opens the owning app for %s, drawer=%s", async (name, appId, drawer) => {
    window.history.replaceState({}, "", "/console/ugsci-experts");
    mount(true);
    const label = await screen.findByText(name as string, { exact: true });
    const card = label.closest<HTMLElement>(".ant-card")!;
    expect(within(card).getByText("应用专属专家")).toBeVisible();
    if (drawer) {
      await userEvent.click(
        within(card).getByRole("button", { name: "查看详情" }),
      );
      await userEvent.click(
        within(await screen.findByRole("dialog")).getByRole("button", {
          name: /打开应用/,
        }),
      );
    } else {
      await userEvent.click(
        within(card).getByRole("button", { name: /打开应用/ }),
      );
    }
    expect(await screen.findByTestId("app-target")).toBeVisible();
    expect(window.location.pathname).toBe(`/console/apps/${appId}`);
    expect(select).not.toHaveBeenCalled();
    expect(useAgentStore.getState().selectedAgent).toBe("default");
    expect(sessionStorage.getItem("qwenpaw_pending_new_chat")).toBeNull();
    expect(screen.queryByTestId("chat-target")).not.toBeInTheDocument();
  });
  it("does not send a restricted expert without an owning app to Chat", async () => {
    mount();
    await summon("Fixture restricted");
    expect(messages.error).toHaveBeenCalledWith(
      "此专家不支持通用聊天，请从所属应用打开",
    );
    expect(select).not.toHaveBeenCalled();
    expect(messages.success).not.toHaveBeenCalled();
  });
  it.each(["selection", "navigation"])(
    "reports %s failure without claiming success",
    async (failure) => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      if (failure === "selection")
        select.mockImplementation(() => {
          throw new Error("Selection unavailable");
        });
      else brokenNavigation = true;
      mount();
      await summon("Fixture expert");
      expect(messages.error).toHaveBeenCalledWith(
        failure === "selection"
          ? "Selection unavailable"
          : "Navigation unavailable",
      );
      expect(screen.queryByTestId("chat-target")).not.toBeInTheDocument();
      expect(messages.success).not.toHaveBeenCalled();
      expect(sessionStorage.getItem("qwenpaw_pending_new_chat")).toBeNull();
    },
  );
  it("keeps disabled experts unavailable", async () => {
    mount();
    const label = await screen.findByText("Disabled expert", { exact: true });
    expect(
      within(label.closest<HTMLElement>(".ant-card")!).getByRole("button", {
        name: /开始对话/,
      }),
    ).toBeDisabled();
    expect(select).not.toHaveBeenCalled();
  });
});
