// @vitest-environment jsdom
import { execFileSync } from "node:child_process";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as antd from "antd";
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

const buildOptions = {
  stdin: {
    resolveDir: process.cwd(),
    contents: [
      'export {RunHistory, RunMonitor} from "../src/qwenpaw/plugins_bundle/flowforge/ui/src/RunPanels";',
      'export {RunComparison, valueDifferences} from "../src/qwenpaw/plugins_bundle/flowforge/ui/src/RunComparison";',
      'export {useWorkflowIdentity} from "../src/qwenpaw/plugins_bundle/flowforge/ui/src/useWorkflowIdentity";',
    ].join("\n"),
  },
  bundle: true,
  write: false,
  format: "cjs",
  platform: "browser",
  jsx: "transform",
  external: ["react"],
  loader: { ".css": "empty" },
};
const code = execFileSync(
  process.execPath,
  [
    "--input-type=module",
    "-e",
    `import {buildSync} from "esbuild"; process.stdout.write(buildSync(${JSON.stringify(
      buildOptions,
    )}).outputFiles[0].text);`,
  ],
  { cwd: process.cwd(), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
);
const module = { exports: {} as Record<string, any> };
new Function("require", "module", "exports", code)(
  (name: string) => {
    if (name === "react") return React;
    if (name === "react/jsx-runtime") return jsxRuntime;
    throw new Error(`Unexpected dependency ${name}`);
  },
  module,
  module.exports,
);
const {
  RunComparison,
  RunHistory,
  RunMonitor,
  valueDifferences,
  useWorkflowIdentity,
} = module.exports;

function record(id: string, revision = 1) {
  return {
    run_id: id,
    flow_id: "flow-中文",
    status: "completed",
    started_at: revision * 1000,
    duration_ms: 0,
    flow_revision: revision,
    agent_id: "expert-a",
    node_statuses: { stats: "success" },
    node_details: {
      stats: {
        id: "stats",
        label: "统计 English",
        status: "success",
        inputs_available: true,
        inputs: { text: "中英文", zero: 0, enabled: false },
        outputs: [{ count: revision - 1, api_key: "private-node-key" }],
        duration_ms: 0,
        metadata: {
          provider: "fixture",
          model: "model-a",
          usage: { total_tokens: 0 },
        },
        configuration: {
          inputs: { temperature: revision === 1 ? 0 : 0.5 },
          control: {},
        },
      },
    },
    outputs: { result: revision - 1, secret: "private-output-key" },
    errors: [],
    events: [],
  };
}

let language = "zh";
beforeEach(() => {
  language = "zh";
  (window as any).QwenPaw = { host: { useLocale: () => language } };
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(new ReadableStream({ start() {} }))),
  );
});
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "QwenPaw");
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("FlowForge recorded run comparison and debug panel", () => {
  it("compares immutable run inputs outputs and configuration while retaining zero and masking credentials", async () => {
    const left = record("run-before", 1),
      right = record("run-after", 2);
    const api = vi.fn(async (path: string, _options?: RequestInit) =>
      path.endsWith("run-before") ? left : right,
    );
    render(
      <RunComparison
        runIds={[left.run_id, right.run_id]}
        flowId={left.flow_id}
        agentId="expert-a"
        api={api}
        antd={antd}
      />,
    );
    expect(
      await screen.findByRole("region", { name: "运行比较" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Expand row/ }));
    expect(
      await screen.findByText("/configuration/inputs/temperature"),
    ).toBeVisible();
    expect(screen.getByText("/outputs/0/count")).toBeVisible();
    expect(document.body.textContent).not.toContain("private-node-key");
    expect(document.body.textContent).not.toContain("private-output-key");
    expect(document.body.textContent).toContain("0 ms");
    expect(api.mock.calls[0][1]).toMatchObject({
      headers: { "X-Agent-Id": "expert-a" },
    });
    expect(
      valueDifferences(
        { value: null, zero: 0, enabled: false },
        { zero: 0, enabled: false },
      ),
    ).toEqual([
      {
        path: "/value",
        before: null,
        after: undefined,
        beforePresent: true,
        afterPresent: false,
      },
    ]);
    expect(valueDifferences({ "a/b~c": 0 }, { "a/b~c": false })[0].path).toBe(
      "/a~1b~0c",
    );
  });

  it("rejects unrelated workflow snapshots and ignores a late comparison across run and agent scope", async () => {
    let resolveOld!: (value: unknown) => void;
    const old = new Promise((resolve) => {
      resolveOld = resolve;
    });
    const api = vi.fn(async (path: string, _options?: RequestInit) =>
      path.includes("old") ? old : record(path.split("/").pop()!, 2),
    );
    const view = render(
      <RunComparison
        runIds={["old-left", "old-right"]}
        flowId="flow-中文"
        agentId="expert-a"
        api={api}
        antd={antd}
      />,
    );
    const oldSignal = api.mock.calls[0][1]?.signal as AbortSignal;
    view.rerender(
      <RunComparison
        runIds={["new-left", "new-right"]}
        flowId="flow-中文"
        agentId="expert-b"
        api={api}
        antd={antd}
      />,
    );
    expect(
      await screen.findByRole("region", { name: "运行比较" }),
    ).toHaveTextContent("new-left");
    expect(oldSignal.aborted).toBe(true);
    await act(async () =>
      resolveOld({ ...record("old-left"), flow_id: "unrelated" }),
    );
    expect(
      screen.getByRole("region", { name: "运行比较" }),
    ).not.toHaveTextContent("old-left");
    view.rerender(
      <RunComparison
        runIds={["new-left", "new-right"]}
        flowId="other-flow"
        agentId="expert-b"
        api={api}
        antd={antd}
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "只能比较同一工作流",
    );
  });

  it("filters real run history and compares two selected saved runs", async () => {
    const records = [record("run-before", 1), record("run-after", 2)];
    const api = vi.fn(async (path: string, _options?: RequestInit) =>
      path === "/flowforge/runs"
        ? records
        : records.find((item) => path.endsWith(item.run_id)),
    );
    render(
      <RunHistory
        open
        flowId="flow-中文"
        onClose={vi.fn()}
        onSelect={vi.fn()}
        api={api}
        antd={antd}
        agentId="expert-a"
      />,
    );
    const first = await screen.findByRole("row", { name: /run-befo/ });
    const second = screen.getByRole("row", { name: /run-afte/ });
    fireEvent.click(within(first).getByRole("checkbox"));
    fireEvent.click(within(second).getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "比较所选运行" }));
    expect(
      await screen.findByRole("region", { name: "运行比较" }),
    ).toBeVisible();
    fireEvent.change(screen.getByRole("textbox", { name: "修订筛选" }), {
      target: { value: "2" },
    });
    expect(screen.queryByRole("row", { name: /run-befo/ })).toBeNull();
    expect(screen.getByRole("row", { name: /run-afte/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "重置筛选" }));
    expect(screen.getByRole("row", { name: /run-befo/ })).toBeVisible();
  });

  it("clears an aborted comparison spinner and retains nodes whose only difference is duration", async () => {
    const api = vi.fn(async (path: string) => {
      if (path.includes("pending")) return new Promise(() => {});
      const item = record(path.split("/").pop()!, 1);
      item.node_details.stats.duration_ms = path.endsWith("right") ? 15 : 0;
      return item;
    });
    const view = render(
      <RunComparison
        runIds={["pending-left", "pending-right"]}
        flowId="flow-中文"
        api={api}
        antd={antd}
      />,
    );
    view.rerender(
      <RunComparison
        runIds={["left"]}
        flowId="flow-中文"
        api={api}
        antd={antd}
      />,
    );
    expect(await screen.findByText("请选择两次运行进行比较")).toBeVisible();
    view.rerender(
      <RunComparison
        runIds={["left", "right"]}
        flowId="flow-中文"
        api={api}
        antd={antd}
      />,
    );
    expect(
      await screen.findByRole("row", { name: /统计 English/ }),
    ).toBeVisible();
    expect(screen.getByRole("cell", { name: "15 ms" })).toBeVisible();
  });

  it("keeps docked monitoring and actual record callbacks alive while collapsed and switches its interface language", async () => {
    const item = record("run-current");
    const onRecord = vi.fn();
    const api = vi.fn(async (path: string, _options?: RequestInit) =>
      path === "/flowforge/runs" ? [] : item,
    );
    const props = {
      runId: item.run_id,
      onClose: vi.fn(),
      onStatusUpdate: vi.fn(),
      onResumed: vi.fn(),
      onRecord,
      api,
      antd,
      streamUrl: (path: string) => path,
      headers: () => ({}),
      docked: true,
      agentId: "expert-a",
    };
    const view = render(<RunMonitor {...props} />);
    expect(
      await screen.findByRole("region", { name: "节点详情 统计 English" }),
    ).toBeVisible();
    expect(onRecord).toHaveBeenCalledWith(item);
    expect(vi.mocked(fetch).mock.calls[0][1]?.headers).toMatchObject({
      "X-Agent-Id": "expert-a",
    });
    fireEvent.click(screen.getByRole("button", { name: "收起调试栏" }));
    expect(screen.getByRole("region", { name: "工作流调试栏" })).toBeVisible();
    expect(
      screen.queryByRole("region", { name: "节点详情 统计 English" }),
    ).toBeNull();
    language = "en";
    view.rerender(<RunMonitor {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Expand debug panel" }));
    expect(
      screen.getByRole("region", { name: "Node details 统计 English" }),
    ).toBeVisible();
    expect(screen.getByText("Actual inputs")).toBeVisible();
    expect(document.body.textContent).toContain("中英文");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

function IdentityProbe({ api }: { api: any }) {
  const { identity, error } = useWorkflowIdentity(api);
  return <output>{identity ?? error ?? "pending"}</output>;
}
describe("workflow account scope", () => {
  it("keeps draft identity stable across token refresh and isolates a late account response", async () => {
    let name = "甲";
    const api = vi.fn(async (path: string, _options?: RequestInit) =>
      path === "/auth/status"
        ? { enabled: true }
        : { valid: true, username: name },
    );
    render(<IdentityProbe api={api} />);
    expect(await screen.findByText("account:甲")).toBeVisible();
    act(() => window.dispatchEvent(new Event("qwenpaw:auth-changed")));
    expect(await screen.findByText("account:甲")).toBeVisible();
    let resolveOld!: (value: { valid: boolean; username: string }) => void;
    const oldAccount = new Promise<{ valid: boolean; username: string }>(
      (resolve) => {
        resolveOld = resolve;
      },
    );
    let verification = 0;
    api.mockImplementation(async (path: string) =>
      path === "/auth/status"
        ? { enabled: true }
        : ++verification === 1
        ? oldAccount
        : { valid: true, username: "乙" },
    );
    act(() => window.dispatchEvent(new Event("qwenpaw:auth-changed")));
    await waitFor(() => expect(verification).toBe(1));
    const oldSignal = api.mock.calls[api.mock.calls.length - 1][1]?.signal;
    act(() => window.dispatchEvent(new Event("qwenpaw:auth-changed")));
    expect(await screen.findByText("account:乙")).toBeVisible();
    expect(oldSignal?.aborted).toBe(true);
    await act(async () => resolveOld({ valid: true, username: "甲" }));
    expect(screen.getByText("account:乙")).toBeVisible();
    expect(screen.queryByText("account:甲")).toBeNull();
  });
});
