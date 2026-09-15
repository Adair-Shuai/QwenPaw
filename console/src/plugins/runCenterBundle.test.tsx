import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("qwenpaw-run-center frontend bundle", () => {
  const globalWindow = window as unknown as Record<string, unknown>;
  let routeDefinition: { component: React.ComponentType; path: string } | null;
  let menuDefinition: Record<string, unknown> | null;
  let simpleModeIds: string[];

  beforeEach(() => {
    routeDefinition = null;
    menuDefinition = null;
    simpleModeIds = [];
    delete globalWindow.__qwenpawRunCenterRegistered;
    globalWindow.QwenPaw = {
      host: {
        React,
        antdIcons: {},
        getApiUrl: (apiPath: string) => `/api${apiPath}`,
        getApiToken: () => "",
      },
      route: {
        add: (_pluginId: string, definition: typeof routeDefinition) => {
          routeDefinition = definition;
        },
      },
      menu: {
        add: (_pluginId: string, definition: Record<string, unknown>) => {
          menuDefinition = definition;
        },
      },
      sidebar: {
        registerSimpleModeItems: (ids: string[]) => {
          simpleModeIds = ids;
        },
      },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/events")) {
          return new Response(
            JSON.stringify({
              events: [
                {
                  sequence: 1,
                  type: "log.line",
                  data: { message: "legacy import completed" },
                },
              ],
            }),
          );
        }
        if (url.includes("/runs/")) {
          return new Response(
            JSON.stringify({
              run_id: "ugsci:sim-1",
              operation: "simulation.run",
              status: "succeeded",
              source: "ugsci-legacy",
            }),
          );
        }
        return new Response(
          JSON.stringify({
            runs: [
              {
                run_id: "ugsci:sim-1",
                operation: "simulation.run",
                status: "succeeded",
                phase: "done",
                progress: 1,
              },
            ],
          }),
        );
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete globalWindow.QwenPaw;
    delete globalWindow.__qwenpawRunCenterRegistered;
  });

  it("registers the route and Simple Mode menu, then renders run details", async () => {
    const bundlePath = path.resolve(
      process.cwd(),
      "../plugins/bundle/qwenpaw-run-center/ui/dist/index.js",
    );
    const source = fs.readFileSync(bundlePath, "utf8");
    new Function(source)();

    expect(routeDefinition?.path).toBe("/run-center");
    expect(menuDefinition).toMatchObject({
      id: "core.run-center",
      location: "primary.settings",
      route: "qwenpaw-run-center.run-center",
    });
    expect(simpleModeIds).toEqual(["core.run-center"]);

    const Component = routeDefinition!.component;
    render(<Component />);
    expect(
      screen.getByRole("heading", { name: "运行中心" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("simulation.run")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText("simulation.run"));
    await waitFor(() =>
      expect(screen.getByText("ugsci:sim-1")).toBeInTheDocument(),
    );
    expect(screen.getByText(/legacy import completed/)).toBeInTheDocument();
    expect(
      screen.getByText(/兼容运行记录，控制操作请在原任务入口执行/),
    ).toBeInTheDocument();
  });

  it("controls a native run, renders logs, and configures background refresh", async () => {
    let status = "running";
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/pause") && init?.method === "POST") {
        status = "paused";
        return new Response(
          JSON.stringify({
            run_id: "native-1",
            operation: "simulation.run",
            status,
            source: "run-center",
            progress: 0.4,
          }),
        );
      }
      if (url.endsWith("/events")) {
        return new Response(
          JSON.stringify({
            events: [
              {
                sequence: 2,
                type: "log.line",
                created_at: "2026-09-05T12:00:00Z",
                data: { message: "solver iteration 12" },
              },
              {
                sequence: 3,
                type: "stage.progress",
                data: { progress: 0.4 },
              },
            ],
          }),
        );
      }
      if (url.includes("/runs/native-1")) {
        return new Response(
          JSON.stringify({
            run_id: "native-1",
            operation: "simulation.run",
            status,
            source: "run-center",
            phase: status === "paused" ? "paused" : "solve",
            progress: 0.4,
          }),
        );
      }
      return new Response(
        JSON.stringify({
          runs: [
            {
              run_id: "native-1",
              operation: "simulation.run",
              status,
              phase: status === "paused" ? "paused" : "solve",
              progress: 0.4,
            },
          ],
        }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const intervalSpy = vi.spyOn(window, "setInterval");

    const bundlePath = path.resolve(
      process.cwd(),
      "../plugins/bundle/qwenpaw-run-center/ui/dist/index.js",
    );
    new Function(fs.readFileSync(bundlePath, "utf8"))();
    render(React.createElement(routeDefinition!.component));

    await waitFor(() =>
      expect(screen.getByText("simulation.run")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText("simulation.run"));
    await waitFor(() =>
      expect(screen.getByText("solver iteration 12")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "暂停" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "取消" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "克隆" })).toBeInTheDocument();
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 3000);

    fireEvent.click(screen.getByRole("button", { name: "暂停" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "恢复" })).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/run-center/runs/native-1/pause",
      expect.objectContaining({ method: "POST" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("已暂停");
  });

  it("loads the package mirror bundle with the same host contract", async () => {
    const bundlePath = path.resolve(
      process.cwd(),
      "../src/qwenpaw/plugins_bundle/qwenpaw-run-center/ui/dist/index.js",
    );
    const source = fs.readFileSync(bundlePath, "utf8");
    new Function(source)();
    expect(routeDefinition?.path).toBe("/run-center");
    expect(menuDefinition?.id).toBe("core.run-center");
    expect(simpleModeIds).toEqual(["core.run-center"]);
  });

  it("exposes lightweight model, research, and comparison views", async () => {
    const bundlePath = path.resolve(
      process.cwd(),
      "../plugins/bundle/qwenpaw-run-center/ui/dist/index.js",
    );
    new Function(fs.readFileSync(bundlePath, "utf8"))();
    render(React.createElement(routeDefinition!.component));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "模型" })).toBeInTheDocument(),
    );
    expect(screen.getByText(/运行控制 ·/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "模型" }));
    expect(screen.getByText("模型与版本")).toBeInTheDocument();
    expect(screen.getByText(/暂无模型版本/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "研究" }));
    expect(screen.getByText("研究与 DOE")).toBeInTheDocument();
    expect(screen.getByText(/暂无 Study/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "比较" }));
    expect(screen.getByText("多方案比较")).toBeInTheDocument();
    expect(screen.getByText(/选择一个 Study 后/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "生成比较" })).toBeDisabled();
  });
});
