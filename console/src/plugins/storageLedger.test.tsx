import fs from "node:fs";
import path from "node:path";
import React from "react";
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const initialUrl = window.location.href;
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", initialUrl);
  vi.unstubAllGlobals();
});

it("opens a duplicate well day and saves its source row and review reason", async () => {
  const day = "2025-01-01";
  let saved = false;
  const source = { id: 1, kind: "production", name: "测试日报.xlsx" };
  const fetch = vi.fn(async (url: string, opts?: RequestInit) => {
    if (url.endsWith("/projects")) {
      return new Response(
        JSON.stringify([
          {
            id: "legacy",
            name: "合成项目",
            sources: 1,
            records: 4,
            archived: 0,
          },
        ]),
      );
    }
    if (url.endsWith("/reviews")) {
      expect(JSON.parse(String(opts?.body))).toEqual({
        src: 1,
        day,
        well: "A",
        row_no: 3,
        note: "对照记录",
        previous: null,
      });
      saved = true;
      return new Response("{}");
    }
    if (url.includes("/objects"))
      return Response.json({
        wells: [
          {
            name: "A",
            days: 1,
            pending: saved ? 0 : 1,
            masters: [],
            strings: [],
          },
        ],
        pipes: [],
        stations: [],
        src: 1,
      });
    return new Response(
      JSON.stringify({
        src: 1,
        day,
        sources: [source],
        period: { first: day, last: day },
        wells: ["A"],
        archive_wells: [],
        balance: { pending: saved ? 0 : 1 },
        trend: [],
        daily: [2, 3].map((row_no) => ({
          day,
          well: "A",
          row_no,
          contested: true,
          selected: saved ? 3 : null,
        })),
        issues: [{ day, well: "A", candidates: 2, selected: saved ? 3 : null }],
        history: [],
        pipes: [],
        gaps: [],
        casing: [],
        master: [],
        reading_notes: [],
        audit: [],
      }),
    );
  });
  let Page: React.ComponentType = () => null;
  vi.stubGlobal("QwenPaw", {
    host: { React, fetch },
    registerRoutes: (
      id: string,
      routes: { path: string; component: React.ComponentType }[],
    ) => {
      expect(id).toBe("storage-ledger");
      expect(routes[0].path).toBe("/apps/storage-ledger");
      Page = routes[0].component;
    },
  });
  new Function(
    fs.readFileSync(
      path.resolve("../plugins/apps/storage-ledger/ui/index.js"),
      "utf8",
    ),
  )();
  render(<Page />);
  fireEvent.click(await screen.findByRole("button", { name: "进入项目" }));
  fireEvent.click(await screen.findByRole("button", { name: "生产对账" }));
  await screen.findByText("当日气量对账");
  fireEvent.click(screen.getByRole("button", { name: "质控复核" }));
  fireEvent.click(screen.getByRole("button", { name: "A" }));
  fireEvent.click(await screen.findByRole("radio", { name: "采用第 3 行" }));
  fireEvent.change(screen.getByLabelText("复核依据"), {
    target: { value: "对照记录" },
  });
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "保存并重算" }),
    ).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "保存并重算" }));
  await screen.findByText("采用第 3 行");
  expect(saved).toBe(true);
});

it("creates a project from the library and records data in its own scope", async () => {
  let created = false,
    added = false;
  const project = {
    id: "new-project",
    name: "试验储气库",
    region: "",
    operator: "",
    description: "",
    archived: 0,
    revision: 1,
    sources: 0,
    records: 0,
  };
  const snapshot = {
    src: null,
    day: null,
    sources: [],
    period: {},
    wells: [],
    issues: [],
    archive_wells: [],
    balance: null,
    trend: [],
    daily: [],
    history: [],
    pipes: [],
    gaps: [],
    casing: [],
    master: [],
    reading_notes: [],
    audit: [],
  };
  const call = vi.fn(async (url: string, opts?: RequestInit) => {
    if (url.endsWith("/projects")) {
      if (opts?.method === "POST") {
        expect(JSON.parse(String(opts.body)).name).toBe(project.name);
        created = true;
        return Response.json(project);
      }
      return Response.json(created ? [project] : []);
    }
    expect(new Headers(opts?.headers).get("X-Ledger-Project")).toBe(project.id);
    if (url.includes("/objects"))
      return Response.json({ wells: [], pipes: [], stations: [], src: null });
    if (url.includes("/workspace")) return Response.json(snapshot);
    if (url.includes("/records/daily")) {
      if (opts?.method === "POST") {
        expect(JSON.parse(String(opts.body)).values.well).toBe("W7");
        added = true;
        return Response.json({ src: 1 });
      }
      return Response.json({
        fields: { day: "生产日", well: "井号" },
        required: ["day", "well"],
        src: added ? 1 : null,
        page: 0,
        count: added ? 1 : 0,
        rows: added
          ? [{ record_id: 1, row_no: -1, day: "2026-01-10", well: "W7" }]
          : [],
        history: [],
      });
    }
    throw Error(url);
  });
  let Page: React.ComponentType = () => null;
  vi.stubGlobal("QwenPaw", {
    host: { React, fetch: call },
    registerRoutes: (_id: string, r: { component: React.ComponentType }[]) => {
      Page = r[0].component;
    },
  });
  new Function(
    fs.readFileSync(
      path.resolve("../plugins/apps/storage-ledger/ui/index.js"),
      "utf8",
    ),
  )();
  render(<Page />);
  fireEvent.click(await screen.findByRole("button", { name: /新建项目/ }));
  fireEvent.change(screen.getByLabelText("项目名称"), {
    target: { value: project.name },
  });
  fireEvent.click(screen.getByRole("button", { name: "创建并打开" }));
  await screen.findByRole("heading", { level: 1, name: project.name });
  fireEvent.click(screen.getByRole("button", { name: "数据管理" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "新增记录" })).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "新增记录" }));
  const form = screen
    .getByRole("heading", { name: "新增单井日报记录" })
    .closest("form")!;
  const day = form.querySelector('input[type="date"]')!;
  fireEvent.change(day, { target: { value: "2026-01-10" } });
  fireEvent.change(within(form).getByLabelText("井号", { exact: true }), {
    target: { value: "W7" },
  });
  fireEvent.change(screen.getByLabelText("变更原因"), {
    target: { value: "新增井日数据" },
  });
  fireEvent.click(screen.getByRole("button", { name: "确认新增" }));
  await screen.findByRole("cell", { name: "W7" });
  fireEvent.click(screen.getByRole("button", { name: /项目库/ }));
  await screen.findByRole("button", { name: project.name });
});

it("links a map well, comparison, casing source and pending day across independent documents", async () => {
  const day = "2025-01-02";
  const wells = ["W1", "W2"].map((name, i) => ({
    name,
    xy: [120 + i, 32 + i],
    days: 2,
    pending: i ? 0 : 1,
    masters: [],
    strings: [
      {
        src: 2,
        sheet: name,
        row_no: 7,
        name: "表层套管",
        depth: "500",
        diameter: "244.5",
      },
    ],
  }));
  const sources = [
    { id: 1, kind: "production", name: "日报.xlsx" },
    { id: 2, kind: "casing", name: "完井.xls" },
  ];
  const base = {
    sources,
    src: 1,
    day,
    period: { first: "2025-01-01", last: day },
    issues: [{ well: "W1", day, candidates: 2, selected: null }],
    daily: [2, 3].map((row_no) => ({
      well: "W1",
      row_no,
      day,
      contested: true,
    })),
    audit: [],
    gaps: [],
    reading_notes: [],
    trend: [],
  };
  let compared = false;
  const call = vi.fn(async (url: string, opts?: RequestInit) => {
    if (url.endsWith("/projects"))
      return Response.json([
        { id: "test", name: "测试工程", sources: 2, records: 6 },
      ]);
    expect(new Headers(opts?.headers).get("X-Ledger-Project")).toBe("test");
    if (url.includes("/workspace")) return Response.json(base);
    if (url.includes("/objects"))
      return Response.json({ src: 1, wells, stations: [], pipes: [] });
    if (url.includes("/series")) {
      const params = new URL(url, "http://test").searchParams,
        requested = params.getAll("well");
      if (requested.join(",") === "W1,W2") compared = true;
      return Response.json({
        src: 1,
        start: "2025-01-01",
        end: day,
        series: Object.fromEntries(
          requested.map((name) => [
            name,
            [
              {
                day: "2025-01-01",
                row_no: 4,
                candidates: [],
                prod: 4,
                inj: 0,
                tubing: 12,
                casing: 10,
              },
              {
                day,
                row_no: name === "W1" ? null : 5,
                candidates: name === "W1" ? [2, 3] : [],
                prod: name === "W1" ? null : 8,
              },
            ],
          ]),
        ),
      });
    }
    if (url.includes("/trace/casing")) {
      expect(new URL(url, "http://test").searchParams.get("sheet")).toBe("W1");
      return Response.json({
        row: { well: "W1", depth: "500" },
        fields: { depth: "下深" },
        source: { name: "完井.xls", id: 2, has_original: 1 },
        line: 7,
        sheet: "W1",
        changes: [],
        raw: {},
      });
    }
    throw Error(url);
  });
  let Page: React.ComponentType = () => null;
  vi.stubGlobal("QwenPaw", {
    host: { React, fetch: call },
    registerRoutes: (_: string, r: { component: React.ComponentType }[]) => {
      Page = r[0].component;
    },
  });
  new Function(
    fs.readFileSync(
      path.resolve("../plugins/apps/storage-ledger/ui/index.js"),
      "utf8",
    ),
  )();
  render(<Page />);
  fireEvent.click(await screen.findByRole("button", { name: "进入项目" }));
  fireEvent.click(await screen.findByRole("button", { name: "井位 W1" }));
  const props = screen.getByRole("complementary", { name: "属性与来源" });
  fireEvent.click(within(props).getByRole("button", { name: "打开单井档案" }));
  const panel = await screen.findByRole("tabpanel", { name: "W1" });
  fireEvent.change(within(panel).getByLabelText("对比井"), {
    target: { value: "W2" },
  });
  await within(panel).findByText("W2 · 日注气");
  expect(compared).toBe(true);
  fireEvent.change(within(panel).getByLabelText("曲线通道"), {
    target: { value: "pressure" },
  });
  await within(panel).findByRole("img", { name: "油套压力历史曲线" });
  fireEvent.click(screen.getByRole("button", { name: "打开单井 W2" }));
  fireEvent.click(screen.getByRole("tab", { name: "W1" }));
  expect(within(panel).getByLabelText("对比井")).toHaveValue("W2");
  fireEvent.click(within(panel).getByRole("button", { name: "井筒结构" }));
  await within(panel).findByRole("img", { name: "W1套管鞋下深示意图" });
  fireEvent.click(within(panel).getByRole("button", { name: "W1 · 7" }));
  await within(props).findByText("完井.xls");
  fireEvent.click(within(panel).getByRole("button", { name: "曲线与日报" }));
  fireEvent.click(
    await within(panel).findByRole("button", { name: "待复核 · 2 行" }),
  );
  const qc = screen.getByRole("tabpanel", { name: "质控复核" });
  await within(qc).findByRole("radio", { name: "采用第 3 行" });
  fireEvent.click(within(qc).getByRole("button", { name: "查看当日对账" }));
  await within(screen.getByRole("tabpanel", { name: "生产对账" })).findByText(
    "当日气量对账",
  );
  fireEvent.click(screen.getByRole("tab", { name: "质控复核" }));
  expect(within(qc).getByRole("radio", { name: "采用第 3 行" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "关闭 W2" }));
  expect(screen.queryByRole("tab", { name: "W2" })).toBeNull();
});
