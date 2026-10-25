import React from "react";
import * as antd from "antd";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CollaborationWorkflowSection } from "../../../../plugins/bundle/ugsci/ui/src/workflow/CollaborationWorkflowSection";

const api = vi.hoisted(() => vi.fn());
let agentId = "expert-a";
vi.mock("../../../../plugins/bundle/ugsci/ui/src/core/runtime", () => ({
  apiFetch: api,
  getHost: () => ({
    React,
    antd,
    antdIcons: {},
    useSelectedAgent: () => ({ id: agentId }),
  }),
}));
vi.mock("../../../../plugins/bundle/ugsci/ui/src/core/api", () => ({
  fetchAgents: async () => [],
}));
const proposal = {
  proposal_id: "proposal-1",
  base_revision: 0,
  flow: { id: "inventory" },
  changes: [{ description: "新增库存偏差复核" }],
  validation: { ok: true, errors: [] },
  warnings: [],
};
beforeEach(() => {
  agentId = "expert-a";
  api.mockReset();
  api.mockImplementation(async (path: string) =>
    path.includes("proposals") ? proposal : [],
  );
  const computed = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element) =>
    computed(element),
  );
  window.history.replaceState({}, "", "/");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
async function generate() {
  fireEvent.change(screen.getByLabelText("工作流需求描述"), {
    target: { value: "核验库存偏差，超限后人工审批" },
  });
  await waitFor(() =>
    expect(
      screen.getByText("生成并预览方案").closest("button"),
    ).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByText("生成并预览方案"));
}
describe("UGSci reviewed natural language authoring", () => {
  it("previews without saving and applies explicitly for the selected expert", async () => {
    render(<CollaborationWorkflowSection />);
    await generate();
    await screen.findByText("新增库存偏差复核");
    expect(api.mock.calls.some(([path]) => path.endsWith("/apply"))).toBe(
      false,
    );
    const call = api.mock.calls.find(([path]) => path.endsWith("/proposals"))!;
    expect(JSON.parse(call[1].body).agent_id).toBe("expert-a");
    api.mockImplementation(async (path: string) =>
      path.endsWith("/apply") ? { id: "inventory" } : [],
    );
    fireEvent.click(screen.getByText("应用并打开编辑器"));
    await waitFor(() => expect(window.location.pathname).toBe("/flowforge"));
    expect(window.location.search).toBe("?flow=inventory");
    expect(
      JSON.parse(
        api.mock.calls.find(([path]) => path.endsWith("/apply"))![1].body,
      ),
    ).toEqual({ expected_revision: 0 });
  });
  it("blocks invalid proposals and retains the prompt after discard", async () => {
    api.mockImplementation(async (path: string) =>
      path.includes("proposals")
        ? { ...proposal, validation: { ok: false, errors: ["未知工具"] } }
        : [],
    );
    render(<CollaborationWorkflowSection />);
    await generate();
    await screen.findByText("未知工具");
    expect(
      screen.getByText("应用并打开编辑器").closest("button"),
    ).toBeDisabled();
    fireEvent.click(screen.getByText("放弃方案"));
    expect(screen.getByLabelText("工作流需求描述")).toHaveValue(
      "核验库存偏差，超限后人工审批",
    );
    expect(api.mock.calls.some(([path]) => path.endsWith("/apply"))).toBe(
      false,
    );
  });
  it("discards a late proposal when the selected expert changes", async () => {
    let release!: (value: typeof proposal) => void;
    api.mockImplementation(async (path: string) =>
      path.includes("proposals")
        ? new Promise((resolve) => {
            release = resolve;
          })
        : [],
    );
    const view = render(<CollaborationWorkflowSection />);
    await generate();
    agentId = "expert-b";
    view.rerender(<CollaborationWorkflowSection />);
    await act(async () => release(proposal));
    expect(screen.queryByText("新增库存偏差复核")).toBeNull();
    expect(api.mock.calls.some(([path]) => path.endsWith("/apply"))).toBe(
      false,
    );
  });
  it("continues polling and does not overlap slow poll requests", async () => {
    vi.useFakeTimers();
    let release!: () => void;
    let count = 0;
    api.mockImplementation(async (path: string) => {
      if (path !== "/flowforge/runs") return [];
      count++;
      if (count === 2)
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      return [
        { run_id: "r1", flow_id: "f1", status: "running", started_at: 1 },
      ];
    });
    render(<CollaborationWorkflowSection />);
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    expect(count).toBe(2);
    await act(async () => {
      release();
      await Promise.resolve();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(count).toBe(3);
  });
});
