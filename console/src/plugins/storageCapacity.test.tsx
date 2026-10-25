import fs from "node:fs";
import path from "node:path";
import React from "react";
import {
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const blank = () => ({
  schema_version: 2,
  case_name: "新建库容评估",
  cycle_id: "",
  purpose: "cycle",
  storage_type: "depleted_gas",
  rock_type: "sandstone",
  pressure_basis: "",
  standard: { temperature: null, pressure: null, z: null, source: "" },
  start_state: "",
  end_state: "",
  book_inventory: null,
  book_state: "start",
  sources: {},
  ledger: {},
  design: {},
  units: [],
  documents: [],
  history: [],
  comparison_tolerance_percent: 5,
  review_notes: "",
});
const unit = {
  name: "评估单元 1",
  source: "",
  method: "pz",
  parameters: {},
  conditions: {
    water_drive: "unknown",
    fluid: "unknown",
    interference: "unknown",
    pressure_representative: false,
    closed_during_segment: false,
  },
  series: [],
  pvt: [],
  wells: [],
  schedule: [],
  external: {},
};
const catalog = {
  storage_types: [
    { value: "depleted_gas", label: "枯竭气藏" },
    { value: "salt_cavern", label: "盐穴" },
  ],
  standards: [],
  terms: [
    {
      key: "effective_inventory",
      name: "有效库存量",
      definition: "现有井网可动用库存",
    },
  ],
  fields: { produced_gas: { label: "阶段采气量 Qp", unit: "亿m³" } },
  methods: [
    {
      id: "pz",
      name: "两点 p/Z 物质平衡",
      mode: "calculation",
      fields: ["produced_gas"],
      required: ["produced_gas"],
      condition: "近似定容",
      formula: "Grm = Qp × Pin/Zin / Δ(p/Z)",
      reference: "方法依据",
    },
    {
      id: "volumetric",
      name: "体积与压力窗口计算",
      mode: "calculation",
      fields: [],
      required: [],
      condition: "绝压与净腔体积",
      formula: "状态方程",
      reference: "方法依据",
    },
  ],
  mapping_fields: { units: ["name", "produced_gas"] },
  unit_template: unit,
};

describe("storage capacity packaged workbench", () => {
  let Component: React.ComponentType;
  let record: any;
  let result: any;
  const hostFetch = vi.fn();
  beforeEach(() => {
    record = {
      id: "a".repeat(32),
      revision: 1,
      case: blank(),
      latest_run: null,
    };
    result = null;
    hostFetch
      .mockReset()
      .mockImplementation(async (url: string, init?: RequestInit) => {
        const body =
          typeof init?.body === "string" ? JSON.parse(init.body) : null;
        let data: any = {};
        if (url.endsWith("/catalog")) data = catalog;
        else if (url.endsWith("/cases") && init?.method === "POST")
          data = record;
        else if (url.endsWith("/cases")) data = { cases: [] };
        else if (url.includes("/workflow?"))
          data = { nodes: record.nodeRuns || [] };
        else if (url.includes("/nodes/pvt/run")) {
          record.nodeRuns = [
            {
              id: "pvt",
              status: "calculated",
              run: {
                status: "calculated",
                values: { injection_end_z: 0.9 },
                steps: ["实验表插值"],
                rows: [],
                input_hash: "abc",
                created_at: "2026-10-25T00:00:00Z",
              },
            },
          ];
          data = record.nodeRuns[0].run;
        } else if (url.endsWith("/assistant/undo")) {
          record.case.units[0].parameters.produced_gas = 25;
          record.revision += 1;
          delete record.last_edit;
          data = record;
        } else if (url.endsWith("/assistant")) {
          record.case.units[0].parameters.produced_gas = 30;
          record.revision += 1;
          record.messages = [
            { role: "user", text: body.message },
            { role: "assistant", text: "已识别本周期采气量", applied: 1 },
          ];
          record.last_edit = { ids: ["p1"] };
          data = record;
        } else if (url.endsWith("/evaluate")) {
          result = {
            case: structuredClone(record.case),
            fingerprint: "f".repeat(64),
            run_id: "r",
            status: "calculated",
            summary: "计算建议值，待复核。",
            metrics: [
              {
                key: "effective_inventory",
                label: "有效库存量",
                value: 100,
                unit: "亿m³",
                source: "分单元计算",
              },
            ],
            checks: [],
            units: [],
            created_at: "2026-10-24T00:00:00Z",
            engine_version: "2.0.0",
            duration_ms: 1,
          };
          data = result;
        } else if (url.endsWith("/review"))
          return new Response(
            JSON.stringify({
              detail: "库存评价智能体未完成审查；计算结果仍可使用。",
            }),
            { status: 503 },
          );
        else if (url.includes("/report?format=html"))
          return new Response("<h1>库容评估报告</h1><p>待复核</p>", {
            headers: { "Content-Type": "text/html" },
          });
        else if (url.endsWith("/documents") && init?.method === "POST") {
          record = {
            ...record,
            revision: record.revision + 1,
            case: {
              ...record.case,
              documents: [
                {
                  id: "d1",
                  name: "input.csv",
                  tables: [{ id: "0" }],
                  pages: [],
                  status: "extracted",
                },
              ],
            },
          };
          data = record;
        } else if (url.endsWith("/documents/d1"))
          data = {
            id: "d1",
            name: "input.csv",
            tables: [
              {
                id: "0",
                label: "input.csv",
                rows: [
                  ["层名", "Qp"],
                  ["A", "25"],
                ],
                locations: ["行1", "行2"],
              },
            ],
            pages: [],
            warnings: [],
          };
        else if (url.endsWith("/documents/d1/map"))
          data = {
            kind: "units",
            records: [
              {
                ...unit,
                name: "A",
                source: "input.csv R2",
                parameters: { produced_gas: 25 },
              },
            ],
            errors: [],
          };
        else if (init?.method === "PUT") {
          record = {
            ...record,
            revision: record.revision + 1,
            case: body.case,
          };
          data = record;
        } else data = { ...record, evaluation: result };
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      });
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: { React, fetch: hostFetch },
        registerRoutes: (_id: string, routes: any[]) => {
          Component = routes[0].component;
        },
      },
    });
    new Function(
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "../plugins/apps/storage-capacity/ui/index.js",
        ),
        "utf8",
      ),
    )();
  });
  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(window, "QwenPaw");
    document.getElementById("storage-capacity-styles")?.remove();
    vi.restoreAllMocks();
  });
  async function create() {
    render(<Component />);
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: "新建评估" })[0],
      ).toBeEnabled(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: "新建评估" })[0],
    );
    await screen.findByLabelText("储气库／项目名称");
    await userEvent.selectOptions(
      screen.getByLabelText("新单元方法偏好"),
      "pz",
    );
  }

  it("runs the mounted page from editable parameters to report and invalidates stale exports", async () => {
    await create();
    await userEvent.clear(screen.getByLabelText("储气库／项目名称"));
    await userEvent.type(screen.getByLabelText("储气库／项目名称"), "合成项目");
    await userEvent.click(screen.getByRole("button", { name: "添加单元" }));
    await userEvent.click(screen.getByRole("tab", { name: /有效库存/ }));
    await userEvent.type(
      screen.getByLabelText("阶段采气量 Qp（亿m³） *"),
      "25",
    );
    await userEvent.click(screen.getByRole("button", { name: "运行计算" }));
    await screen.findByRole("heading", { name: "计算结果" });
    const save = hostFetch.mock.calls.find(([, i]) => i?.method === "PUT");
    expect(
      JSON.parse(save![1].body).case.units[0].parameters.produced_gas,
    ).toBe(25);
    expect(hostFetch.mock.calls.some(([u]) => u.endsWith("/review"))).toBe(
      false,
    );
    await userEvent.click(screen.getByRole("tab", { name: /报告与归档/ }));
    expect(screen.getByRole("button", { name: "导出 Word" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "预览报告" }));
    expect(await screen.findByTitle("库容评估报告预览")).toHaveAttribute(
      "sandbox",
      "",
    );
    await userEvent.type(screen.getByLabelText("项目复核意见"), "补充依据");
    expect(screen.getByRole("button", { name: "导出 Word" })).toBeDisabled();
    expect(screen.queryByTitle("库容评估报告预览")).not.toBeInTheDocument();
  });

  it("maps uploaded evidence into real unit inputs without overwriting existing units", async () => {
    await create();
    await userEvent.click(screen.getByRole("tab", { name: /资料整理/ }));
    fireEvent.change(screen.getByLabelText("上传评估资料"), {
      target: {
        files: [new File(["层名,Qp\nA,25"], "input.csv", { type: "text/csv" })],
      },
    });
    await userEvent.click(
      await screen.findByRole("button", { name: "查看与映射" }),
    );
    await userEvent.selectOptions(
      await screen.findByLabelText("单元／井名"),
      "0",
    );
    await userEvent.selectOptions(screen.getByLabelText("阶段采气量 Qp"), "1");
    await userEvent.click(screen.getByRole("button", { name: "导入所选字段" }));
    await userEvent.click(screen.getByRole("tab", { name: /有效库存/ }));
    expect(screen.getByLabelText("阶段采气量 Qp（亿m³） *")).toHaveValue(25);
    await userEvent.click(screen.getByRole("tab", { name: /特征与方法/ }));
    expect(screen.getByLabelText("参数与适用性依据")).toHaveValue(
      "input.csv R2",
    );
  });

  it("keeps deterministic results available when optional agent review fails", async () => {
    await create();
    await userEvent.click(screen.getByRole("button", { name: "运行计算" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "方法审查" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "库存评价智能体未完成审查",
    );
    expect(screen.getByRole("heading", { name: "计算结果" })).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: /报告与归档/ }));
    expect(screen.getByRole("button", { name: "导出 Word" })).toBeEnabled();
  });

  it("runs an independent PVT node and retains the editable form beside its result", async () => {
    await create();
    await userEvent.click(screen.getByRole("button", { name: "添加单元" }));
    await userEvent.click(screen.getByRole("tab", { name: /流体与 PVT/ }));
    await userEvent.selectOptions(
      screen.getByLabelText("物性取值方式"),
      "table",
    );
    await userEvent.type(screen.getByLabelText("PVT 表温度（K）"), "320");
    await userEvent.click(screen.getByRole("button", { name: "运行本节点" }));
    expect(await screen.findByText("实验表插值")).toBeVisible();
    expect(screen.getByLabelText("PVT 表温度（K）")).toHaveValue(320);
    expect(hostFetch.mock.calls.some(([u]) => u.endsWith("/evaluate"))).toBe(
      false,
    );
    const call = hostFetch.mock.calls.find(([u]) =>
      u.endsWith("/nodes/pvt/run"),
    );
    expect(JSON.parse(call![1].body).unit_index).toBe(0);
    await userEvent.click(screen.getByRole("tab", { name: "参数资料" }));
    expect(screen.getByLabelText("PVT 表温度（K）")).toBeVisible();
    await userEvent.clear(screen.getByLabelText("PVT 表温度（K）"));
    await userEvent.type(screen.getByLabelText("PVT 表温度（K）"), "330");
    await userEvent.click(screen.getByRole("tab", { name: "图表结果" }));
    expect(screen.getByText("输入已改变，需重算")).toBeVisible();
  });

  it("fills the mounted form through conversation and supports undo and adjustable assistant", async () => {
    await create();
    await userEvent.click(screen.getByRole("button", { name: "添加单元" }));
    await userEvent.click(screen.getByRole("tab", { name: /有效库存/ }));
    await userEvent.type(
      screen.getByLabelText("阶段采气量 Qp（亿m³） *"),
      "25",
    );
    const separator = screen.getByRole("separator", {
      name: "调整评估助手宽度",
    });
    const originalWidth = Number(separator.getAttribute("aria-valuenow"));
    fireEvent.keyDown(separator, { key: "ArrowLeft" });
    expect(separator).toHaveAttribute(
      "aria-valuenow",
      String(originalWidth + 20),
    );
    await userEvent.type(
      screen.getByLabelText("与评估助手对话"),
      "阶段采气量改为30",
    );
    await userEvent.click(screen.getByRole("button", { name: "发送" }));
    await screen.findByText("已识别本周期采气量");
    expect(screen.getByLabelText("阶段采气量 Qp（亿m³） *")).toHaveValue(30);
    await userEvent.click(
      screen.getByRole("button", { name: "撤销最近一次对话填表" }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("阶段采气量 Qp（亿m³） *")).toHaveValue(25),
    );
    await userEvent.click(screen.getByRole("button", { name: "收起评估助手" }));
    expect(screen.queryByLabelText("与评估助手对话")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "展开评估助手" }));
    expect(screen.getByLabelText("与评估助手对话")).toBeVisible();
  });

  it("uploads conversation attachments before sending their evidence IDs to the assistant", async () => {
    await create();
    await userEvent.click(screen.getByRole("button", { name: "添加单元" }));
    fireEvent.change(screen.getByLabelText("对话投喂资料"), {
      target: {
        files: [new File(["Qp,30"], "input.csv", { type: "text/csv" })],
      },
    });
    await userEvent.click(screen.getByRole("button", { name: "发送" }));
    await screen.findByText("已识别本周期采气量");
    const uploadIndex = hostFetch.mock.calls.findIndex(
      ([u, i]) => u.endsWith("/documents") && i?.method === "POST",
    );
    const chatIndex = hostFetch.mock.calls.findIndex(([u]) =>
      u.endsWith("/assistant"),
    );
    expect(uploadIndex).toBeLessThan(chatIndex);
    expect(
      JSON.parse(hostFetch.mock.calls[chatIndex][1].body).document_ids,
    ).toEqual(["d1"]);
    await userEvent.click(screen.getByRole("tab", { name: /有效库存/ }));
    expect(screen.getByLabelText("阶段采气量 Qp（亿m³） *")).toHaveValue(30);
  });
  it("opens independent result windows and preserves snapshots while moving resizing and editing", async () => {
    await create();
    await userEvent.click(screen.getByRole("button", { name: "添加单元" }));
    record.nodeRuns = [
      {
        id: "pvt",
        name: "流体与 PVT",
        status: "calculated",
        run: {
          run_id: "pvt-run",
          input_hash: "original-hash",
          created_at: "2026-10-25T00:00:00Z",
          status: "calculated",
          values: {},
          chart_context: {
            project: {},
            unit: {
              pvt: [
                { pressure: 10, z: 0.85 },
                { pressure: 20, z: 0.95 },
              ],
            },
          },
          rows: [
            {
              状态: "起始",
              "压力 MPa": 20,
              Z: 0.95,
              "Bg 地层m³/标准m³": 0.005,
            },
            { 状态: "末期", "压力 MPa": 10, Z: 0.85, "Bg 地层m³/标准m³": 0.01 },
          ],
        },
      },
    ];
    await userEvent.click(screen.getByRole("button", { name: "保存" }));
    await userEvent.click(screen.getByRole("tab", { name: /流体与 PVT/ }));
    expect(screen.getByLabelText("PVT 表温度（K）")).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: "图表结果" }));
    expect(screen.getByLabelText("PVT 表温度（K）")).not.toBeVisible();
    await screen.findByRole("img", { name: "压力—Z 因子" });
    await userEvent.click(
      screen.getByRole("button", { name: "在结果视窗打开" }),
    );
    const first = await screen.findByRole("article", {
      name: /结果视窗：压力—Z 因子/,
    });
    expect(
      within(first).getByRole("img", { name: "压力—Z 因子" }),
    ).toBeVisible();
    expect(screen.getByRole("tab", { name: "参数资料" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByLabelText("PVT 表温度（K）")).toBeVisible();
    const x = parseFloat(first.style.left),
      width = parseFloat(first.style.width);
    fireEvent.keyDown(within(first).getByLabelText("移动视窗 压力—Z 因子"), {
      key: "ArrowRight",
    });
    expect(parseFloat(first.style.left)).toBe(x + 10);
    fireEvent.keyDown(
      within(first).getByLabelText("调整视窗大小 压力—Z 因子"),
      { key: "ArrowLeft" },
    );
    expect(parseFloat(first.style.width)).toBe(width - 10);
    await userEvent.click(screen.getByRole("tab", { name: "图表结果" }));
    await userEvent.click(
      screen.getByRole("tab", { name: "压力—气体体积系数" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "在结果视窗打开" }),
    );
    expect(screen.getAllByRole("article", { name: /结果视窗/ })).toHaveLength(
      2,
    );
    await userEvent.click(screen.getByRole("button", { name: "平铺" }));
    expect(first.style.left).toBe("12px");
    await userEvent.click(
      within(first).getByRole("button", { name: "最小化 压力—Z 因子" }),
    );
    expect(first).not.toBeVisible();
    await userEvent.click(
      screen.getByRole("button", {
        name: "压力—Z 因子 · 评估单元 1",
      }),
    );
    expect(first).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "放大工作区" }));
    expect(screen.getByRole("button", { name: "返回表单布局" })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "返回表单布局" }));
    await userEvent.click(screen.getByRole("button", { name: "放大工作区" }));
    await userEvent.click(screen.getByRole("tab", { name: /地层压力/ }));
    expect(screen.getByRole("button", { name: "放大工作区" })).toBeVisible();
    expect(first).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: /流体与 PVT/ }));
    await userEvent.type(screen.getByLabelText("PVT 表温度（K）"), "330");
    expect(within(first).getByRole("status")).toHaveTextContent("历史快照");
    expect(
      within(first).getByRole("img").querySelectorAll("circle"),
    ).toHaveLength(4);
    await userEvent.click(
      within(first).getByRole("button", { name: "数据表" }),
    );
    expect(within(first).getAllByText("0.85").length).toBeGreaterThan(0);
    record = { ...record, id: "b".repeat(32), case: blank(), nodeRuns: [] };
    await userEvent.click(screen.getByRole("button", { name: "新建评估" }));
    expect(
      screen.queryByRole("article", { name: /结果视窗/ }),
    ).not.toBeInTheDocument();
  });

  it("plots source data without converting missing observations into zero or inventing map results", async () => {
    record.case.units = [structuredClone(unit)];
    record.case.units[0].external = {
      match_metric: "地层压力",
      match_unit: "MPa",
      history_match: [
        { observed: 20, simulated: 19 },
        { observed: 15, simulated: 15 },
        { observed: 10, simulated: 11 },
      ],
    };
    record.nodeRuns = [
      {
        id: "inventory",
        status: "calculated",
        run: {
          status: "calculated",
          chart_context: {
            project: {},
            unit: structuredClone(record.case.units[0]),
          },
          values: {},
          plot: [
            { x: 0, y: 20, fitted: 19 },
            { x: 25, y: 15, fitted: 15 },
            { x: 50, y: 10, fitted: 11 },
          ],
        },
      },
    ];
    record.case.units[0].connectivity = {
      source: "合成监测",
      series: [
        { time: 0, x: 12, y: 13 },
        { time: 1, x: null, y: 14 },
        { time: 2, x: 15, y: 16 },
      ],
    };
    await create();
    await userEvent.click(screen.getByRole("tab", { name: /连通性与单元/ }));
    await userEvent.click(screen.getByRole("tab", { name: "图表结果" }));
    const graph = await screen.findByRole("img", { name: "井间同步压力响应" });
    expect(graph.querySelectorAll("circle")).toHaveLength(5);
    expect(screen.getByText(/输入资料预览/)).toBeVisible();
    expect(
      screen.getByText(/无井位坐标和网格时不绘制压力场/, { selector: "p" }),
    ).toBeVisible();
    const gallery = screen.getByLabelText("节点图表");
    await userEvent.click(
      within(gallery).getByRole("button", { name: "井 A" }),
    );
    expect(graph.querySelectorAll("circle")).toHaveLength(3);
    await userEvent.click(
      within(gallery).getByRole("button", { name: "数据表" }),
    );
    expect(within(gallery).getByText("—")).toBeVisible();
    await userEvent.click(screen.getByRole("tab", { name: /有效库存/ }));
    await userEvent.click(screen.getByRole("tab", { name: "图表结果" }));
    await userEvent.click(screen.getByRole("tab", { name: "回归残差" }));
    expect(
      within(gallery)
        .getByRole("img", { name: "回归残差" })
        .querySelectorAll("circle"),
    ).toHaveLength(3);
    await userEvent.click(
      within(gallery).getByRole("button", { name: "数据表" }),
    );
    expect(within(gallery).getByText("-1")).toBeVisible();
    await userEvent.click(
      screen.getByRole("tab", { name: "外部成果历史拟合" }),
    );
    expect(
      within(gallery).getByRole("img", { name: "外部成果历史拟合" }),
    ).toHaveTextContent("MPa");
    await userEvent.click(screen.getByRole("button", { name: "运行计算" }));
    await userEvent.click(screen.getByRole("tab", { name: "图表结果" }));
    const summary = screen.getByLabelText("节点图表");
    expect(
      within(summary).getByRole("img", { name: "评估指标 · 亿m³" }),
    ).toBeVisible();
  });
});
