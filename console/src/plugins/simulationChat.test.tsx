import React from "react";
import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "antd";
import { extractSimulationRuns } from "../../../plugins/bundle/ugsci/ui/src/simulation";
import { WorkbenchSimulationPanel } from "../features/files-workspace/WorkbenchPanels";

const reference = {
  kind: "ugsci_simulation",
  schema_version: 1,
  run_id: "sim_case",
  simulator: "eclipse",
  agent_id: "default",
};
// Actual live SDK envelope: TextBlocks are joined, name="assistant" is the
// outer message author, while tool identity remains in the data content.
const output = [
  {
    role: "tool",
    type: "plugin_call_output",
    name: "assistant",
    content: [
      {
        type: "data",
        data: {
          name: "launch_simulation",
          output: `Simulation queued\n<ugsci-simulation-ref>${JSON.stringify(
            reference,
          )}</ugsci-simulation-ref>\n`,
        },
      },
    ],
  },
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (window as any).QwenPaw;
});

it("only accepts simulation tool references from live and historical messages", () => {
  expect(extractSimulationRuns(output)).toHaveLength(1);
  const live = [
    {
      type: "plugin_call_output",
      name: "assistant",
      content: [
        { data: { name: "read_simulation_results" } },
        {
          data: {
            output: JSON.stringify([
              { type: "text", text: JSON.stringify(reference) },
            ]),
          },
        },
      ],
    },
  ];
  expect(extractSimulationRuns(live)[0].run_id).toBe("sim_case");
  expect(
    extractSimulationRuns([
      {
        type: "tool_result",
        name: "launch_simulation",
        output: [
          { type: "text", text: "Simulation queued" },
          { type: "text", text: JSON.stringify(reference) },
        ],
      },
    ]),
  ).toHaveLength(1);
  expect(extractSimulationRuns([{ role: "user", content: output }])).toEqual(
    [],
  );
  expect(
    extractSimulationRuns([
      {
        role: "assistant",
        content: [{ type: "text", text: JSON.stringify(reference) }],
      },
    ]),
  ).toEqual([]);
  expect(
    extractSimulationRuns([
      { type: "tool_result", name: "other_tool", output: reference },
    ]),
  ).toEqual([]);
});

function loadSimulationCard(bundle: string) {
  let append: any;
  let selectedAgent = "default";
  const navigate = vi.fn();
  const monitor = vi.fn((props: any) => (
    <div data-testid="monitor">{props.runId}</div>
  ));
  (window as any).QwenPaw = {
    host: {
      React,
      antd: { Button },
      antdIcons: {},
      getApiUrl: (s: string) => `/api${s}`,
      getApiToken: () => "",
      getSelectedAgentId: () => selectedAgent,
      getCurrentSessionId: () => "chat-one",
      useNavigate: () => navigate,
      fetch: async () => new Response(JSON.stringify({ enabled: true })),
    },
    menu: { add: vi.fn(), snapshot: () => [] },
    route: { add: vi.fn() },
    chat: {
      response: {
        append: (_plugin: string, renderFn: any, options: any) => {
          if (options.id === "ugsci.simulation.response-append")
            append = renderFn;
          return { dispose() {} };
        },
      },
    },
    runCenter: { SimulationMonitor: monitor },
  };
  const source = fs.readFileSync(path.resolve(process.cwd(), bundle), "utf8");
  new Function(source)();
  expect(append).toBeTypeOf("function");
  return {
    append,
    navigate,
    monitor,
    selectAgent: (agentId: string) => {
      selectedAgent = agentId;
    },
  };
}

describe.each([
  "../plugins/bundle/ugsci/ui/dist/index.js",
  "../src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
])("simulation chat from published %s", (bundle) => {
  it("registers a real chat card that opens a scoped monitor without automatically subscribing", () => {
    const { append, navigate, monitor } = loadSimulationCard(bundle);
    const eventSpy = vi.fn();
    window.addEventListener("qwenpaw:open-simulation-workbench", eventSpy);
    const view = render(append({ data: { output } }));
    expect(screen.getByText("数模任务 · eclipse")).toBeInTheDocument();
    expect(monitor).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "在侧栏监测" }));
    expect(eventSpy.mock.calls[0][0].detail).toEqual({
      runId: "sim_case",
      agentId: "default",
      sessionId: "chat-one",
    });
    fireEvent.click(screen.getByRole("button", { name: "打开运行中心" }));
    expect(navigate).toHaveBeenCalledWith("/run-center?run_id=sim_case");
    fireEvent.click(screen.getByRole("button", { name: "查看结果" }));
    expect(screen.getByTestId("monitor")).toBeInTheDocument();
    view.unmount();
    window.removeEventListener("qwenpaw:open-simulation-workbench", eventSpy);
  });

  it("keeps technical identifiers in toggled details and makes results the primary action", () => {
    const { append, monitor } = loadSimulationCard(bundle);
    render(append({ data: { output } }));
    expect(screen.queryByText("sim_case")).not.toBeInTheDocument();
    const results = screen.getByRole("button", { name: "查看结果" });
    expect(results.className).toMatch(/(?:ant|qwenpaw)-btn-primary/);
    fireEvent.click(screen.getByRole("button", { name: "任务详情" }));
    expect(screen.getByText("sim_case")).toBeVisible();
    expect(screen.getByText("所属智能体")).toBeVisible();
    expect(screen.getByText("chat-one")).toBeVisible();
    expect(monitor).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "收起详情" }));
    expect(screen.queryByText("sim_case")).not.toBeInTheDocument();
    fireEvent.click(results);
    expect(monitor.mock.calls[0][0]).toMatchObject({
      runId: "sim_case",
      compact: true,
      scope: { agentId: "default", chatId: "chat-one" },
    });
    fireEvent.click(screen.getByRole("button", { name: "收起结果" }));
    expect(screen.queryByTestId("monitor")).not.toBeInTheDocument();
  });

  it("keeps run actions scoped to the owning agent and releases results on an agent switch", () => {
    const { append, selectAgent, monitor, navigate } =
      loadSimulationCard(bundle);
    selectAgent("other-agent");
    const view = render(append({ data: { output } }));
    const dispatch = vi.spyOn(window, "dispatchEvent");
    for (const name of ["查看结果", "在侧栏监测", "打开运行中心"]) {
      const button = screen.getByRole("button", { name });
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(monitor).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(
      dispatch.mock.calls.filter(
        ([event]) => event.type === "qwenpaw:open-simulation-workbench",
      ),
    ).toHaveLength(0);
    expect(
      screen.getByText("请切换到该任务所属智能体后查看结果。"),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "任务详情" }));
    expect(screen.getByText("sim_case")).toBeVisible();
    selectAgent("default");
    view.rerender(append({ data: { output } }));
    fireEvent.click(screen.getByRole("button", { name: "查看结果" }));
    expect(screen.getByTestId("monitor")).toBeInTheDocument();
    selectAgent("other-agent");
    view.rerender(append({ data: { output } }));
    expect(screen.queryByTestId("monitor")).not.toBeInTheDocument();
  });
});

it("mounts the shared sidebar monitor with session scope and handles late plugin loading", () => {
  (window as any).QwenPaw = {};
  const scope = {
    kind: "session" as const,
    agentId: "owner",
    sessionId: "s1",
    chatId: "backend1",
  };
  const view = render(
    <WorkbenchSimulationPanel runId="sim_one" scope={scope} />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("尚未加载");
  const monitor = vi.fn(({ runId }: any) => <div>{runId}</div>);
  act(() => {
    (window as any).QwenPaw.runCenter = { SimulationMonitor: monitor };
    window.dispatchEvent(new Event("qwenpaw:simulation-monitor-ready"));
  });
  expect(screen.getByText("sim_one")).toBeInTheDocument();
  expect(monitor.mock.calls[0][0]).toMatchObject({
    runId: "sim_one",
    scope: { agentId: "owner", chatId: "backend1" },
  });
  view.rerender(
    <WorkbenchSimulationPanel scope={{ ...scope, sessionId: "s2" }} />,
  );
  expect(screen.queryByText("sim_one")).not.toBeInTheDocument();
});
