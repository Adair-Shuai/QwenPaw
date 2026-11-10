// @vitest-environment jsdom
import { execFileSync } from "node:child_process";
import React from "react";
import * as ReactDOM from "react-dom";
import * as jsxRuntime from "react/jsx-runtime";
import * as antd from "antd";
import * as icons from "@ant-design/icons";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const options = {
  entryPoints: ["../src/qwenpaw/plugins_bundle/flowforge/ui/src/index.ts"],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "browser",
  jsx: "transform",
  external: ["react", "react-dom"],
  loader: { ".css": "empty" },
};
const code = execFileSync(
  process.execPath,
  [
    "--input-type=module",
    "-e",
    `import {buildSync} from "esbuild"; process.stdout.write(buildSync(${JSON.stringify(
      options,
    )}).outputFiles[0].text);`,
  ],
  { cwd: process.cwd(), encoding: "utf8", maxBuffer: 12 * 1024 * 1024 },
);
const flow = {
  id: "app-flow",
  name: "中英文 App flow",
  description: "",
  version: "1.0",
  revision: 6,
  inputs: [],
  outputs: ["echo"],
  edges: [],
  start_id: null,
  metadata: {},
  nodes: {
    echo: {
      class_type: "ScriptNode",
      label: "中英文节点",
      inputs: { source: "result = inputs", payload: {} },
    },
  },
};
const spec = {
  class_type: "ScriptNode",
  display_name: "脚本计算",
  description: "",
  category: "workflow/code",
  icon: "",
  control_schema: [],
  inputs_schema: [
    { name: "source", type: "string", required: true },
    { name: "payload", type: "object", default: {} },
  ],
  outputs_schema: [{ name: "result", type: "any" }],
};
let App: React.ComponentType;
let language = "zh",
  agentId = "expert-a";
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  localStorage.clear();
  language = "zh";
  agentId = "expert-a";
  window.history.replaceState({ idx: 3 }, "", "/flowforge");
  (window as any).QwenPaw = {
    host: {
      React,
      ReactDOM,
      antd,
      antdIcons: icons,
      getApiUrl: (path: string) => `/api${path}`,
      getApiToken: () => "",
      getSelectedAgentId: () => agentId,
      useSelectedAgent: () => ({ id: agentId, name: "测试专家" }),
      useLocale: () => language,
    },
    route: {
      add: (_plugin: string, route: { component: React.ComponentType }) => {
        App = route.component;
      },
    },
  };
  fetchMock = vi.fn(async (url: string) => {
    const path = url.replace(/^\/api/, "");
    if (path === "/auth/status") return Response.json({ enabled: false });
    if (path === "/flowforge/node-types") return Response.json([spec]);
    if (path === "/flowforge/flows")
      return Response.json([{ ...flow, node_count: 1, updated_at: 1 }]);
    if (path === "/flowforge/flows/app-flow") return Response.json(flow);
    if (path === "/flowforge/runs") return Response.json([]);
    if (path.endsWith("/events"))
      return new Response(new ReadableStream({ start() {} }));
    if (path === "/flowforge/runs/run-deep")
      return Response.json({
        run_id: "run-deep",
        flow_id: flow.id,
        agent_id: agentId,
        status: "completed",
        started_at: 1,
        duration_ms: 0,
        flow_revision: 6,
        node_statuses: { echo: "success" },
        node_details: {
          echo: {
            id: "echo",
            label: "中英文节点",
            status: "success",
            inputs_available: true,
            inputs: {},
            outputs: [{ count: 0 }],
          },
        },
        outputs: { echo: { count: 0 } },
        errors: [],
        events: [],
      });
    throw new Error(`Unexpected API ${path}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  new Function("require", "module", "exports", code)(
    (name: string) => {
      if (name === "react") return React;
      if (name === "react-dom") return ReactDOM;
      if (name === "react/jsx-runtime") return jsxRuntime;
      throw new Error(`Unexpected dependency ${name}`);
    },
    { exports: {} },
    {},
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "QwenPaw");
  localStorage.clear();
});

const renderApp = () =>
  render(<App />, {
    wrapper: ({ children }) => (
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        {children}
      </antd.ConfigProvider>
    ),
  });

describe("FlowForge real application entry", () => {
  it("opens the actual editor from the workflow list and preserves router history state", async () => {
    renderApp();
    expect(
      await screen.findByText("中英文 App flow", {}, { timeout: 5000 }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "编 辑" }));
    expect(await screen.findByRole("button", { name: "试运行" })).toBeVisible();
    expect(window.location.search).toBe("?flow=app-flow");
    expect(window.history.state.idx).toBe(3);
    expect(screen.getByRole("button", { name: "调试与变量" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "← 返回" }));
    expect(
      await screen.findByText("中英文 App flow", {}, { timeout: 5000 }),
    ).toBeVisible();
    expect(window.location.search).toBe("");
    expect(window.history.state.idx).toBe(3);
  });

  it("mounts a deep-linked run in the bottom debugger and clears it when the selected agent changes", async () => {
    window.history.replaceState(
      { idx: 3 },
      "",
      "/flowforge?flow=app-flow&run=run-deep",
    );
    const view = renderApp();
    expect(
      await screen.findByRole("region", { name: "工作流调试栏" }),
    ).toBeVisible();
    expect(
      await screen.findByRole("region", { name: "节点详情 中英文节点" }),
    ).toBeVisible();
    agentId = "expert-b";
    view.rerender(<App />);
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "工作流调试栏" })).toBeNull(),
    );
    expect(new URLSearchParams(window.location.search).get("run")).toBeNull();
    const lastCatalogueCall = fetchMock.mock.calls
      .filter(([url]) => String(url).endsWith("/node-types"))
      .slice(-1)[0];
    expect(lastCatalogueCall?.[1]?.headers).toMatchObject({
      "X-Agent-Id": "expert-b",
    });
  });

  it("switches the real workflow list to English while preserving names and revision values", async () => {
    const view = renderApp();
    expect(
      await screen.findByText("中英文 App flow", {}, { timeout: 5000 }),
    ).toBeVisible();
    language = "en";
    view.rerender(<App />);
    expect(
      screen.getByRole("button", { name: /plus\s*New workflow/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Revision" }),
    ).toBeVisible();
    expect(screen.getByRole("cell", { name: /^6$/ })).toBeVisible();
    expect(screen.getByText("中英文 App flow")).toBeVisible();
  });

  it("keeps the latest requested run inputs and rejects a late response after opening another workflow", async () => {
    const other = { ...flow, id: "other-flow", name: "Other workflow" };
    let resolveFirst!: (value: Response) => void;
    const delayed = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    const normalFetch = fetchMock.getMockImplementation() as (
      url: string,
    ) => Promise<Response>;
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith("/flowforge/flows"))
        return Response.json([
          { ...flow, node_count: 1 },
          { ...other, node_count: 1 },
        ]);
      if (url.endsWith("/flowforge/flows/app-flow")) return delayed;
      if (url.endsWith("/flowforge/flows/other-flow"))
        return Response.json(other);
      return normalFetch(url);
    });
    renderApp();
    const first = await screen.findByRole("row", { name: /app-flow/ });
    const second = screen.getByRole("row", { name: /other-flow/ });
    fireEvent.click(within(first).getByRole("button", { name: "运 行" }));
    fireEvent.click(within(second).getByRole("button", { name: "运 行" }));
    await waitFor(
      () =>
        expect(
          screen.getByRole("dialog", { name: "试运行 · Other workflow" }),
        ).toBeVisible(),
      { timeout: 5000 },
    );
    await act(async () => resolveFirst(Response.json(flow)));
    expect(
      screen.getByRole("dialog", { name: "试运行 · Other workflow" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "取 消" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    let resolveAgain!: (value: Response) => void;
    const delayedAgain = new Promise<Response>((resolve) => {
      resolveAgain = resolve;
    });
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith("/flowforge/flows/app-flow")
        ? delayedAgain
        : url.endsWith("/flowforge/flows/other-flow")
        ? Response.json(other)
        : normalFetch(url),
    );
    fireEvent.click(within(first).getByRole("button", { name: "运 行" }));
    fireEvent.click(within(second).getByRole("button", { name: "编 辑" }));
    expect(
      await screen.findByRole("button", { name: "调试与变量" }),
    ).toBeVisible();
    await act(async () => resolveAgain(Response.json(flow)));
    expect(screen.queryByRole("dialog", { name: /试运行/ })).toBeNull();
  });

  it("isolates an admitted run dialog and its late failure after changing the execution agent", async () => {
    let rejectOld!: (error: Error) => void;
    const oldAdmission = new Promise<Response>((_resolve, reject) => {
      rejectOld = reject;
    });
    const normalFetch = fetchMock.getMockImplementation() as (
      url: string,
    ) => Promise<Response>;
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith("/flowforge/flows/app-flow/run")
        ? oldAdmission
        : normalFetch(url),
    );
    const view = renderApp();
    await screen.findByText("中英文 App flow", {}, { timeout: 5000 });
    fireEvent.click(screen.getByRole("button", { name: "运 行" }));
    const start = await screen.findByRole("button", { name: "开始运行" });
    fireEvent.click(start);
    expect(start).toHaveClass("ant-btn-loading");
    agentId = "expert-b";
    view.rerender(<App />);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "运 行" }));
    const nextStart = await screen.findByRole("button", { name: "开始运行" });
    expect(nextStart).not.toHaveClass("ant-btn-loading");
    await act(async () => rejectOld(new Error("Old agent admission failed")));
    expect(screen.queryByText("Old agent admission failed")).toBeNull();
    expect(nextStart).not.toHaveClass("ant-btn-loading");
  });

  it("follows run query changes through browser history and clears an externally removed run", async () => {
    window.history.replaceState(
      { idx: 3 },
      "",
      "/flowforge?flow=app-flow&run=run-deep",
    );
    const normalFetch = fetchMock.getMockImplementation() as (
      url: string,
    ) => Promise<Response>;
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith("/flowforge/runs/run-next")
        ? Response.json({
            run_id: "run-next",
            flow_id: flow.id,
            agent_id: agentId,
            status: "completed",
            node_statuses: { echo: "success" },
            node_details: {
              echo: {
                id: "echo",
                label: "Next run English",
                status: "success",
                inputs_available: true,
                inputs: {},
                outputs: [0],
              },
            },
            outputs: {},
            errors: [],
            events: [],
          })
        : normalFetch(url),
    );
    renderApp();
    expect(
      await screen.findByRole("region", { name: "节点详情 中英文节点" }),
    ).toBeVisible();
    act(() => {
      window.history.replaceState(
        { idx: 4 },
        "",
        "/flowforge?flow=app-flow&run=run-next",
      );
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: { idx: 4 } }),
      );
    });
    expect(
      await screen.findByRole("region", { name: "节点详情 Next run English" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("region", { name: "节点详情 中英文节点" }),
    ).toBeNull();
    act(() => {
      window.history.replaceState({ idx: 5 }, "", "/flowforge?flow=app-flow");
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: { idx: 5 } }),
      );
    });
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "工作流调试栏" })).toBeNull(),
    );
  });

  it("writes the admitted run into its URL and clears it when monitoring closes", async () => {
    window.history.replaceState({ idx: 3 }, "", "/flowforge?flow=app-flow");
    const normalFetch = fetchMock.getMockImplementation() as (
      url: string,
    ) => Promise<Response>;
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith("/validate")
        ? Response.json({ ok: true, errors: [], diagnostics: [] })
        : url.endsWith("/flowforge/flows/app-flow/run")
        ? Response.json({ run_id: "run-deep" })
        : normalFetch(url),
    );
    renderApp();
    fireEvent.click(await screen.findByRole("button", { name: "试运行" }));
    fireEvent.click(await screen.findByRole("button", { name: "开始运行" }));
    expect(
      await screen.findByRole("region", { name: "工作流调试栏" }),
    ).toBeVisible();
    expect(new URLSearchParams(window.location.search).get("run")).toBe(
      "run-deep",
    );
    expect(window.history.state.idx).toBe(3);
    fireEvent.click(screen.getByRole("button", { name: "关闭调试栏" }));
    expect(new URLSearchParams(window.location.search).get("run")).toBeNull();
    expect(new URLSearchParams(window.location.search).get("flow")).toBe(
      "app-flow",
    );
    expect(window.history.state.idx).toBe(3);
  });
});
