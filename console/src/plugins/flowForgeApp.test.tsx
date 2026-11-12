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
class WorkflowPointerEvent extends MouseEvent {
  readonly pointerId: number;
  readonly pointerType: string;
  constructor(type: string, options: PointerEventInit = {}) {
    super(type, options);
    this.pointerId = options.pointerId ?? 1;
    this.pointerType = options.pointerType ?? "mouse";
  }
}
beforeEach(() => {
  localStorage.clear();
  language = "zh";
  agentId = "expert-a";
  vi.stubGlobal("PointerEvent", WorkflowPointerEvent);
  vi.stubGlobal("innerHeight", 1000);
  window.history.replaceState({ idx: 3 }, "", "/flowforge");
  (window as unknown as { QwenPaw: Record<string, unknown> }).QwenPaw = {
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

async function renderDock() {
  window.history.replaceState(
    { idx: 3 },
    "",
    "/flowforge?flow=app-flow&run=run-deep",
  );
  const view = renderApp();
  const panel = await screen.findByRole("region", { name: "工作流调试栏" });
  await within(panel).findByRole("region", { name: "节点详情 中英文节点" });
  return { view, panel };
}

function resizeHandle(name = "调整调试栏高度") {
  const handle = screen.getByRole("separator", { name });
  let captured = false;
  Object.assign(handle, {
    setPointerCapture: vi.fn(() => {
      captured = true;
    }),
    hasPointerCapture: vi.fn(() => captured),
    releasePointerCapture: vi.fn(() => {
      captured = false;
    }),
  });
  return handle;
}

describe("FlowForge real application entry", () => {
  it("resizes the mounted debug dock with mouse and touch while preserving bilingual run content", async () => {
    const { view, panel } = await renderDock();
    const handle = resizeHandle();
    expect(within(panel).queryByRole("slider")).toBeNull();
    expect(handle).toHaveAttribute("aria-orientation", "horizontal");
    expect(panel).toHaveStyle({ height: "340px" });
    fireEvent.pointerDown(handle, { button: 2, pointerId: 1, clientY: 600 });
    expect(handle.setPointerCapture).not.toHaveBeenCalled();
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientY: 600 });
    expect(handle.setPointerCapture).toHaveBeenCalledWith(1);
    fireEvent.pointerMove(handle, { pointerId: 2, clientY: 200 });
    expect(panel).toHaveStyle({ height: "340px" });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 500 });
    expect(panel).toHaveStyle({ height: "440px" });
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 520 });
    expect(panel).toHaveStyle({ height: "420px" });
    expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 100 });
    expect(panel).toHaveStyle({ height: "420px" });
    language = "en";
    view.rerender(<App />);
    expect(screen.getByRole("separator", { name: "Resize debug panel" })).toBe(
      handle,
    );
    fireEvent.pointerDown(handle, {
      button: 0,
      pointerId: 3,
      pointerType: "touch",
      clientY: 500,
    });
    fireEvent.pointerMove(handle, {
      pointerId: 3,
      pointerType: "touch",
      clientY: 600,
    });
    fireEvent.pointerUp(handle, {
      pointerId: 3,
      pointerType: "touch",
      clientY: 600,
    });
    expect(panel).toHaveStyle({ height: "320px" });
    expect(handle).toHaveAttribute("aria-valuenow", "320");
    expect(
      within(panel).getByRole("region", { name: "Node details 中英文节点" }),
    ).toBeVisible();
    expect(
      within(panel).getByRole("button", { name: "Collapse debug panel" }),
    ).toBeVisible();
    expect(
      within(panel).getByRole("button", { name: "Close debug panel" }),
    ).toBeVisible();
    expect(within(panel).queryByRole("slider")).toBeNull();
    expect(
      fetchMock.mock.calls.some(([, options]) => options?.method === "POST"),
    ).toBe(false);
  });

  it("clamps dragged and keyboard dock heights to the real available workspace", async () => {
    const { panel } = await renderDock();
    const handle = resizeHandle();
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientY: 600 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: -1000 });
    expect(panel).toHaveStyle({ height: "700px" });
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 2000 });
    expect(panel).toHaveStyle({ height: "180px" });
    fireEvent.keyDown(handle, { key: "ArrowUp" });
    expect(handle).toHaveAttribute("aria-valuenow", "200");
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(handle).toHaveAttribute("aria-valuenow", "180");
    fireEvent.keyDown(handle, { key: "End" });
    expect(panel).toHaveStyle({ height: "700px" });
    fireEvent.keyDown(handle, { key: "Home" });
    expect(panel).toHaveStyle({ height: "180px" });
    fireEvent.keyDown(handle, { key: "End" });
    const shell = panel.parentElement!;
    const geometry = vi.spyOn(shell, "getBoundingClientRect");
    geometry.mockReturnValue({ height: 400 } as DOMRect);
    act(() => window.dispatchEvent(new Event("resize")));
    expect(panel).toHaveStyle({ height: "300px" });
    expect(handle).toHaveAttribute("aria-valuemax", "300");
    const observers = vi.mocked(ResizeObserver);
    const index = observers.mock.results.findIndex(
      (result) =>
        result.type === "return" &&
        vi
          .mocked(result.value.observe)
          .mock.calls.some(([target]) => target === shell),
    );
    expect(index).toBeGreaterThanOrEqual(0);
    geometry.mockReturnValue({ height: 160 } as DOMRect);
    act(() =>
      observers.mock.calls[index][0]([], observers.mock.results[index].value),
    );
    expect(panel).toHaveStyle({ height: "120px" });
    expect(handle).toHaveAttribute("aria-valuemin", "120");
    expect(handle).toHaveAttribute("aria-valuemax", "120");
    geometry.mockRestore();
  });

  it("releases dock resize capture on cancellation blur collapse close and unmount", async () => {
    const { view, panel } = await renderDock();
    let handle = resizeHandle();
    const begin = (id: number) =>
      fireEvent.pointerDown(handle, { button: 0, pointerId: id, clientY: 600 });
    begin(1);
    fireEvent.pointerCancel(handle, { pointerId: 2 });
    expect(handle.releasePointerCapture).not.toHaveBeenCalled();
    fireEvent.pointerCancel(handle, { pointerId: 1 });
    expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
    begin(2);
    act(() => window.dispatchEvent(new Event("blur")));
    expect(handle.releasePointerCapture).toHaveBeenCalledWith(2);
    begin(3);
    fireEvent.click(within(panel).getByRole("button", { name: "收起调试栏" }));
    expect(handle.releasePointerCapture).toHaveBeenCalledWith(3);
    expect(
      screen.queryByRole("separator", { name: "调整调试栏高度" }),
    ).toBeNull();
    fireEvent.click(within(panel).getByRole("button", { name: "展开调试栏" }));
    handle = resizeHandle();
    begin(4);
    fireEvent.click(within(panel).getByRole("button", { name: "关闭调试栏" }));
    expect(handle.releasePointerCapture).toHaveBeenCalledWith(4);
    expect(screen.queryByRole("region", { name: "工作流调试栏" })).toBeNull();
    view.unmount();
    const reopened = await renderDock();
    handle = resizeHandle();
    begin(5);
    reopened.view.unmount();
    expect(handle.releasePointerCapture).toHaveBeenCalledWith(5);
  });

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
    fireEvent.click(screen.getByRole("button", { name: "返回工作流列表" }));
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
