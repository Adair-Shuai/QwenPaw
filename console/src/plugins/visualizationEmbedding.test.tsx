import fs from "node:fs";
import path from "node:path";
import React from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/api/client";
import { hostViewerOptions } from "../../../plugins/bundle/ugsci/ui/src/visualization/hostAdapter";
import { waitForWorkspaceImport } from "../../../plugins/bundle/ugsci/ui/src/visualization/workspaceImport";
import { ViewerCommandBridge } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/commands/commandBridge";

const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
const originalLocation = window.location.href;
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); window.history.replaceState(null, "", originalLocation); Reflect.deleteProperty(window, "QwenPaw"); Reflect.deleteProperty(window, "OilGasViewerRuntime"); Reflect.deleteProperty(window, "__ugsciVisualizationFrontendRegistered"); document.querySelectorAll('script[data-plugin="ugsci"]').forEach((node) => node.remove()); });

function fixture(bundle: string) {
  let page: React.ComponentType = () => null;
  let workspace: React.ComponentType<any> = () => null;
  const navigate = vi.fn();
  const dispose = vi.fn();
  const mount = vi.fn((_container: HTMLElement, _options: Record<string, unknown>) => ({ ready: Promise.resolve(), dispose, update: vi.fn(), executeCommand: vi.fn() }));
  const request = vi.fn(async (url: string, _init?: RequestInit) => {
    if (url.endsWith("/imports/workspace")) return response({ job_id: "job-1" });
    if (url.endsWith("/imports/job-1")) return response({ status: "completed", result: { id: "well-1" }, progress: 1 });
    return response({ enabled: true });
  });
  const host = {
    React,
    antd: {
      Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
      Alert: ({ message, description }: any) => <div role="alert">{message}{description}</div>,
      Spin: ({ tip }: any) => <div>{tip || "加载中"}</div>,
      Typography: { Text: ({ children }: any) => <span>{children}</span> },
    },
    antdIcons: {}, getApiUrl: (value: string) => `/prefix/api/${value.replace(/^\//, "")}`,
    getApiToken: () => "token", getSelectedAgentId: () => "agent-a", useNavigate: () => navigate, fetch: request,
  };
  Object.defineProperty(window, "QwenPaw", { configurable: true, value: {
    host, route: { add: (_plugin: string, route: any) => { if (route.id === "ugsci.visualization") page = route.component; } },
    workspace: { registerRenderer: (item: any) => { if (item.id === "ugsci.visualization") workspace = item.component; } },
    menu: { add: vi.fn(), snapshot: () => [] }, sidebar: { registerSimpleModeItems: vi.fn() },
  } });
  Object.defineProperty(window, "OilGasViewerRuntime", { configurable: true, value: { mount, version: "0.4.0" } });
  new Function(fs.readFileSync(path.resolve(process.cwd(), "..", bundle), "utf8"))();
  const append = document.head.appendChild.bind(document.head);
  vi.spyOn(document.head, "appendChild").mockImplementation(((node: Node) => {
    const result = append(node);
    if (node instanceof HTMLScriptElement) queueMicrotask(() => node.dispatchEvent(new Event("load")));
    return result;
  }) as typeof document.head.appendChild);
  return { Page: page, Workspace: workspace, navigate, dispose, mount, request, host };
}

describe.each(["plugins/bundle/ugsci/ui/dist/index.js", "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js"])("visualization embedding: %s", (bundle) => {
  it("exposes a reusable lazy application mount with independent command handling", async () => {
    const { mount, dispose } = fixture(bundle);
    const api = (window as any).QwenPaw.ugsci.visualization;
    expect(api.version).toBe(1);
    const container = document.createElement("div");
    const onSelection = vi.fn();
    const handle = await api.mount(container, { scope: { agentId: "app-agent", chatId: "app-chat" }, initialDatasetId: "well-1", onSelection });
    await handle.ready;
    expect(mount).toHaveBeenCalledWith(container, expect.objectContaining({ initialDatasetId: "well-1", autoLoad: false, enableCommands: false, onSelection, headers: { "X-Agent-Id": "app-agent", "X-Chat-Id": "app-chat" } }));
    handle.dispose();
    expect(dispose).toHaveBeenCalledOnce();
    const abort = new AbortController();
    abort.abort();
    await expect(api.mount(container, { signal: abort.signal })).rejects.toThrow();
    expect(mount).toHaveBeenCalledOnce();
  });
  it("mounts the registered page and disposes its own viewer without reloading the host", async () => {
    const { Page, mount, dispose } = fixture(bundle);
    const result = render(<Page />);
    await waitFor(() => expect(mount).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(mount.mock.calls[0][1]).toMatchObject({ apiBase: "/prefix/api/ugsci/visualization", headers: { "X-Agent-Id": "agent-a" } });
    result.unmount();
    expect(dispose).toHaveBeenCalledOnce();
  });
  it("opens the imported dataset with captured workspace scope through host navigation", async () => {
    const { Workspace, mount, navigate, request } = fixture(bundle);
    render(<Workspace artifact={{ workspacePath: "synthetic.well.json", agentId: "agent-b", chatId: "chat-b", workspaceRoot: "project" }} />);
    await waitFor(() => expect(mount).toHaveBeenCalledOnce());
    expect(mount.mock.calls[0][1]).toMatchObject({ initialDatasetId: "well-1", autoLoad: false, compact: true, headers: { "X-Agent-Id": "agent-b", "X-Chat-Id": "chat-b" } });
    const imports = request.mock.calls.filter(([url]) => url.endsWith("/imports/workspace"));
    expect(imports).toHaveLength(1);
    expect(new Headers(imports[0][1]?.headers).get("X-Agent-Id")).toBe("agent-b");
    fireEvent.click(screen.getByText("在可视化页面展开"));
    expect(navigate).toHaveBeenCalledWith("/oilgas-visualization?datasetId=well-1&agentId=agent-b&chatId=chat-b");
  });
  it("shows missing workspace paths and retries failed imports locally", async () => {
    const { Workspace, request, mount } = fixture(bundle);
    const view = render(<Workspace />);
    expect(await screen.findByRole("alert")).toHaveTextContent("文件缺少工作区路径");
    request.mockImplementationOnce(async () => response({ detail: "文件不存在" }, 404));
    view.rerender(<Workspace workspacePath="synthetic.egrid" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("文件不存在");
    fireEvent.click(screen.getByText("重试导入"));
    await waitFor(() => expect(mount).toHaveBeenCalledOnce());
  });
});

it("preserves scope while credentials refresh and aborts timed out import polling", async () => {
  let token = "first";
  const request = vi.fn(async (_url: string, _init?: RequestInit) => response({ status: "running", progress: 0.2 }));
  const options = hostViewerOptions({ React, antd: {}, antdIcons: {}, getApiUrl: (p) => `/api/${p}`, getApiToken: () => token, getSelectedAgentId: () => "captured", fetch: request }, { chatId: "chat" });
  const client = new ApiClient(options.apiBase, undefined, options);
  await client.getJobStatus("job/id"); token = "second";
  await expect(waitForWorkspaceImport(client, "job/id", { attempts: 1 })).rejects.toThrow("等待导入超时");
  expect(request.mock.calls[0][0]).toBe("/ugsci/visualization/imports/job%2Fid");
  expect(new Headers(request.mock.calls[1][1]?.headers).get("Authorization")).toBe("Bearer second");
  expect(new Headers(request.mock.calls[1][1]?.headers).get("X-Agent-Id")).toBe("captured");
  const abort = new AbortController(); abort.abort();
  await expect(waitForWorkspaceImport(client, "job", { signal: abort.signal })).rejects.toThrow();
  expect(request).toHaveBeenCalledTimes(2);
});

it("does not execute a late command after the viewer is disposed", async () => {
  let resolve!: (response: Response) => void;
  const execute = vi.fn();
  const request = vi.fn(() => new Promise<Response>((done) => { resolve = done; }));
  const bridge = new ViewerCommandBridge({ apiBase: "/api/vis", viewerId: "viewer", request, execute });
  bridge.start(); bridge.dispose();
  await act(async () => resolve(response({ commands: [{ commandId: "late", command: "open", args: { datasetId: "x" } }] })));
  expect(execute).not.toHaveBeenCalled();
  expect(request).toHaveBeenCalledTimes(1);
});

it("allows scoped workspace listing while rejecting path traversal and unrelated service writes", async () => {
  const request = vi.fn(async (_url: string, _init?: RequestInit) => response({ entries: [] }));
  const options = hostViewerOptions({ React, antd: {}, antdIcons: {}, getApiUrl: (p) => `/prefix/api/${p}`, getApiToken: () => "token", getSelectedAgentId: () => "chosen", fetch: request }, { chatId: "chat" });
  await options.request!("/prefix/api/workspace/tree?root=project", { headers: { "X-Agent-Id": "wrong" } });
  expect(request.mock.calls[0][0]).toBe("/workspace/tree?root=project");
  expect(new Headers(request.mock.calls[0][1]?.headers).get("X-Agent-Id")).toBe("chosen");
  await expect(options.request!("/prefix/api/workspace/tree", { method: "POST" })).rejects.toThrow("超出当前数据服务范围");
  await expect(options.request!("/prefix/api/ugsci/visualization/../../settings")).rejects.toThrow("超出当前数据服务范围");
  await expect(options.request!("https://example.org/prefix/api/ugsci/visualization/manifest")).rejects.toThrow("超出当前数据服务范围");
  expect(request).toHaveBeenCalledTimes(1);
});

it("executes the complete delivered command batch and retries ACKs without repeating execution", async () => {
  vi.useFakeTimers();
  vi.spyOn(console, "debug").mockImplementation(() => undefined);
  let delivered = false;
  let firstAcknowledgements = 0;
  const execute = vi.fn().mockResolvedValue({ ok: true });
  const request = vi.fn(async (url: RequestInfo | URL) => {
    const path = String(url);
    if (path.endsWith("/first/ack")) {
      firstAcknowledgements++;
      if (firstAcknowledgements === 1) throw new Error("暂时离线");
      return response({ status: "completed" });
    }
    if (path.endsWith("/second/ack")) return response({ status: "completed" });
    if (delivered) return response({ commands: [] });
    delivered = true;
    return response({ commands: [{ commandId: "first", command: "select" }, { commandId: "second", command: "focus" }] });
  });
  const bridge = new ViewerCommandBridge({ apiBase: "/api/vis", viewerId: "viewer", request, execute });
  try {
    bridge.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(execute.mock.calls).toEqual([["select", {}], ["focus", {}]]);
    expect(firstAcknowledgements).toBe(1);
    await vi.advanceTimersByTimeAsync(750);
    expect(firstAcknowledgements).toBe(2);
    expect(execute).toHaveBeenCalledTimes(2);
  } finally { bridge.dispose(); }
});

async function sourceFixture() {
  vi.resetModules();
  const context = fixture("plugins/bundle/ugsci/ui/dist/index.js");
  const [{ OilGasPluginPage }, { OilGasWorkspaceRenderer }] = await Promise.all([
    import("../../../plugins/bundle/ugsci/ui/src/visualization/PluginPage"),
    import("../../../plugins/bundle/ugsci/ui/src/visualization/WorkspaceRenderer"),
  ]);
  return { ...context, Page: OilGasPluginPage, Workspace: OilGasWorkspaceRenderer };
}

describe("visualization embedding review regressions", () => {
  it("replaces the dataset on same-page router navigation and disposes the previous scene", async () => {
    const { Page, host, mount, dispose } = await sourceFixture();
    Object.assign(host, { useLocation });
    function Go() { const navigate = useNavigate(); return <button onClick={() => navigate("/oilgas-visualization?datasetId=second")}>切换数据集</button>; }
    render(<MemoryRouter initialEntries={["/oilgas-visualization?datasetId=first"]}><Page /><Go /></MemoryRouter>);
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
    expect(mount.mock.calls[0][1]).toMatchObject({ initialDatasetId: "first" });
    fireEvent.click(screen.getByText("切换数据集"));
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(2));
    expect(mount.mock.calls[1][1]).toMatchObject({ initialDatasetId: "second" });
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("reimports after terminal conversion failure instead of polling the failed job forever", async () => {
    const { Workspace, request, mount } = await sourceFixture();
    let submissions = 0;
    request.mockImplementation(async (url) => {
      if (url.endsWith("/imports/workspace")) { submissions++; return response({ job_id: `job-${submissions}` }); }
      if (url.endsWith("/imports/job-1")) return response({ status: "failed", error: "原文件解析失败" });
      return response({ status: "completed", result: { id: "recovered" }, progress: 1 });
    });
    render(<Workspace workspacePath="source.egrid" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("原文件解析失败");
    fireEvent.click(screen.getByText("重新导入"));
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
    expect(submissions).toBe(2);
    expect(mount.mock.calls[0][1]).toMatchObject({ initialDatasetId: "recovered" });
  });

  it("never polls the previous workspace job with the replacement Agent scope", async () => {
    const { Workspace, request, mount, host } = await sourceFixture();
    let agent = "first-agent";
    host.getSelectedAgentId = () => agent;
    request.mockImplementation(async (url, init) => {
      const scope = new Headers(init?.headers).get("X-Agent-Id");
      if (url.endsWith("/imports/workspace")) return response({ job_id: `job-${scope}` });
      return response({ status: "completed", result: { id: `dataset-${scope}` }, progress: 1 });
    });
    const view = render(<Workspace workspacePath="source.egrid" />);
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
    agent = "second-agent";
    view.rerender(<Workspace workspacePath="source.egrid" />);
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(2));
    expect(mount.mock.calls[1][1]).toMatchObject({ initialDatasetId: "dataset-second-agent", headers: { "X-Agent-Id": "second-agent" } });
    expect(request.mock.calls.some(([url, init]) => url.endsWith("/job-first-agent") && new Headers(init?.headers).get("X-Agent-Id") === "second-agent")).toBe(false);
  });

  it("binds page import jobs to the selected Agent instead of reusing an old scoped task", async () => {
    const { Page, request, mount, host } = await sourceFixture();
    window.history.replaceState(null, "", "/oilgas-visualization?path=source.egrid");
    let agent = "first-agent";
    host.getSelectedAgentId = () => agent;
    request.mockImplementation(async (url, init) => {
      const scope = new Headers(init?.headers).get("X-Agent-Id");
      if (url.endsWith("/imports/workspace")) return response({ job_id: `job-${scope}` });
      return response({ status: "completed", result: { id: `dataset-${scope}` }, progress: 1 });
    });
    const view = render(<Page />);
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
    agent = "second-agent";
    view.rerender(<Page />);
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(2));
    expect(request.mock.calls.filter(([url]) => url.endsWith("/imports/workspace"))).toHaveLength(2);
    expect(mount.mock.calls[1][1]).toMatchObject({ initialDatasetId: "dataset-second-agent" });
  });
});
