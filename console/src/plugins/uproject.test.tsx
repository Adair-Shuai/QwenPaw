import fs from "node:fs";
import path from "node:path";
import React from "react";
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
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const stamp = "2026-10-28T01:00:00Z";
const project = (id: string, extra = {}) => ({
  id,
  name: id === "p1" ? "储气库方案研究" : "压裂效果评价",
  code: id === "p1" ? "UG-101" : "UG-202",
  domain: id === "p1" ? "储气库" : "非常规",
  status: id === "p1" ? "aligning" : "executing",
  client: {
    org: "研究院",
    contact: "李明",
    role: "项目经理",
    email: "li@example.test",
  },
  vendor: {
    org: "联合实验室",
    contact: "王倩",
    role: "研究负责人",
    email: "wang@example.test",
  },
  start_date: "2026-01-01",
  end_date: "2099-12-31",
  next_align_at: "2099-11-01",
  sow: "建立可复现模型并完成成果评审",
  notes: "保留的项目备注",
  created_at: stamp,
  updated_at: stamp,
  ...extra,
});

const item = (id: string, extra = {}) => ({
  id,
  project_id: "p1",
  title: "确认数据口径",
  detail: "书面确认采集方法和数据时间范围",
  kind: "data",
  owner_side: "client",
  status: "open",
  priority: "normal",
  assignee: "李明",
  due_date: "2099-11-15",
  milestone_id: "",
  depends_on: [],
  created_at: stamp,
  updated_at: stamp,
  ...extra,
});

describe("UProject shipped workspace", () => {
  let Component: React.ComponentType;
  let projects: any[],
    items: any[],
    milestones: any[],
    meetings: any[],
    briefs: any[];
  let failWrite: string;
  let intercept:
    | ((route: string, init: RequestInit) => Promise<Response> | undefined)
    | undefined;
  const fetcher = vi.fn();
  const response = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  function annotated(p: any) {
    const children = items.filter((i) => i.project_id === p.id);
    const open = children.filter(
      (i) => !["agreed", "deferred"].includes(i.status),
    );
    return {
      ...p,
      item_count: children.length,
      open_count: children.filter((i) => i.status === "open").length,
      proposed_count: children.filter((i) => i.status === "proposed").length,
      agreed_count: children.filter((i) => i.status === "agreed").length,
      blocked_count: children.filter((i) => i.status === "blocked").length,
      overdue_count: open.filter((i) => i.due_date && i.due_date < "2026-10-28")
        .length,
      high_priority_count: open.filter((i) =>
        ["high", "urgent"].includes(i.priority),
      ).length,
      completion_percent: children.length
        ? Math.round(
            (100 * children.filter((i) => i.status === "agreed").length) /
              children.length,
          )
        : 0,
      pending_milestones: milestones.filter(
        (m) => m.project_id === p.id && m.status !== "done",
      ).length,
      overdue_milestones: 0,
    };
  }

  function bundle(id: string) {
    return {
      project: annotated(projects.find((p) => p.id === id)),
      items: items.filter((i) => i.project_id === id),
      milestones: milestones.filter((m) => m.project_id === id),
      meetings: meetings.filter((m) => m.project_id === id),
      briefs: briefs.filter((b) => b.project_id === id),
      activity: [
        {
          id: "event1",
          project_id: id,
          entity_type: "project",
          entity_id: id,
          action: "update",
          summary: "更新项目研究范围",
          created_at: stamp,
        },
      ],
    };
  }

  beforeEach(() => {
    projects = [project("p1"), project("p2")];
    items = [
      item("i1"),
      item("i2", {
        title: "完成模型初版",
        kind: "deliverable",
        owner_side: "vendor",
        status: "blocked",
        priority: "high",
        assignee: "王倩",
        due_date: "2000-01-01",
      }),
      item("i3", { title: "签署范围说明", status: "agreed", assignee: "赵敏" }),
    ];
    milestones = [
      {
        id: "m1",
        project_id: "p1",
        title: "模型初版评审",
        due_date: "2099-12-01",
        owner_side: "vendor",
        status: "pending",
      },
    ];
    meetings = [
      {
        id: "meeting1",
        project_id: "p1",
        title: "范围澄清会",
        held_at: "2026-10-20",
        attendees_client: "李明",
        attendees_vendor: "王倩",
        agenda: "确认范围和验收口径",
        notes: "先补齐资料",
        decisions: "下周提交模型边界",
        created_at: stamp,
      },
    ];
    briefs = [
      {
        id: "brief1",
        project_id: "p1",
        kind: "weekly",
        content: "历史周报：资料已经交接",
        source: "template",
        created_at: stamp,
      },
    ];
    failWrite = "";
    intercept = undefined;
    fetcher
      .mockReset()
      .mockImplementation(async (url: string, init: RequestInit = {}) => {
        const route = url.replace("/api/uproject", "").split("?")[0];
        const intercepted = intercept?.(route, init);
        if (intercepted) return intercepted;
        const method = init.method || "GET";
        const body = init.body ? JSON.parse(String(init.body)) : {};
        if (route === failWrite && method !== "GET")
          return response({ detail: "服务器暂时拒绝保存，请重试" }, 503);
        if (route === "/projects" && method === "GET")
          return response({ projects: projects.map(annotated) });
        if (route === "/projects" && method === "POST") {
          const created = project("created", body);
          projects.push(created);
          return response({ project: annotated(created) });
        }
        const projectRoute = /^\/projects\/([^/]+)$/.exec(route);
        if (projectRoute) {
          const id = projectRoute[1];
          if (method === "PATCH")
            Object.assign(
              projects.find((p) => p.id === id),
              body,
            );
          if (method === "DELETE") {
            projects = projects.filter((p) => p.id !== id);
            return response({ ok: true });
          }
          return response(
            method === "GET"
              ? bundle(id)
              : { project: annotated(projects.find((p) => p.id === id)) },
          );
        }
        const addRoute =
          /^\/projects\/([^/]+)\/(items|milestones|meetings)$/.exec(route);
        if (addRoute && method === "POST") {
          const [, id, kind] = addRoute;
          const collection =
            kind === "items"
              ? items
              : kind === "milestones"
              ? milestones
              : meetings;
          const created = {
            id: `new-${kind}`,
            project_id: id,
            status: kind === "milestones" ? "pending" : "open",
            created_at: stamp,
            ...body,
          };
          collection.push(created);
          return response({
            [kind === "items"
              ? "item"
              : kind === "milestones"
              ? "milestone"
              : "meeting"]: created,
          });
        }
        const childRoute = /^\/(items|milestones|meetings)\/([^/]+)$/.exec(
          route,
        );
        if (childRoute) {
          const [, kind, id] = childRoute;
          const collection =
            kind === "items"
              ? items
              : kind === "milestones"
              ? milestones
              : meetings;
          const row = collection.find((r) => r.id === id);
          if (method === "DELETE")
            collection.splice(collection.indexOf(row), 1);
          else Object.assign(row, body);
          return response({
            [kind === "items"
              ? "item"
              : kind === "milestones"
              ? "milestone"
              : "meeting"]: row,
          });
        }
        const aiRoute =
          /^\/projects\/([^/]+)\/ai\/(agenda|weekly|minutes)$/.exec(route);
        if (aiRoute) {
          const [, id, kind] = aiRoute;
          const content = {
            agenda: "本次议程：核对风险与交付安排",
            weekly: "本周进展：模型准备完成",
            minutes: "纪要提取：补充试验数据",
          }[kind as "agenda" | "weekly" | "minutes"];
          const brief = {
            id: `brief-${kind}`,
            project_id: id,
            kind,
            content,
            source: "template",
            created_at: stamp,
          };
          briefs.push(brief);
          const generated =
            kind === "minutes"
              ? [
                  item("from-minutes", {
                    title: "补充试验数据",
                    project_id: id,
                  }),
                ]
              : [];
          if (body.apply) items.push(...generated);
          return response({
            kind,
            content,
            source: "template",
            brief,
            items: generated,
          });
        }
        if (route === "/demo/reset")
          return response({ ok: true, project_count: projects.length });
        throw new Error(`Unexpected ${method} ${route}`);
      });
    vi.stubGlobal("fetch", fetcher);
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: {
          React,
          antd,
          getApiUrl: (p: string) => "/api" + p,
          getApiToken: () => "",
          useTheme: () => "light",
        },
        registerRoutes: (_id: string, routes: any[]) => {
          Component = routes[0].component;
        },
      },
    });
    new Function(
      fs.readFileSync(
        path.resolve(process.cwd(), "../plugins/apps/uproject/ui/index.js"),
        "utf8",
      ),
    )();
  });

  afterEach(async () => {
    cleanup();
    await act(async () => {
      antd.Modal.destroyAll();
      antd.message.destroy();
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "QwenPaw");
  });

  async function open() {
    render(
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        <Component />
      </antd.ConfigProvider>,
    );
    await screen.findByRole("button", { name: "打开项目：储气库方案研究" });
  }
  async function detail() {
    await open();
    await userEvent.click(
      screen.getByRole("button", { name: "打开项目：储气库方案研究" }),
    );
    await screen.findByRole("tab", { name: "对齐事项" });
  }
  async function tab(name: string) {
    await userEvent.click(screen.getByRole("tab", { name }));
  }
  function change(label: string, value: string) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  async function select(label: string, option: string) {
    fireEvent.mouseDown(screen.getByRole("combobox", { name: label }));
    await userEvent.click(await screen.findByTitle(option));
  }
  function writes(route: string, method = "POST") {
    return fetcher.mock.calls.filter(
      ([url, init]) =>
        url === "/api/uproject" + route && init.method === method,
    );
  }

  it("searches and filters actual project cards while keeping portfolio totals", async () => {
    await open();
    change("搜索项目", "UG-202");
    expect(
      screen.queryByRole("button", { name: "打开项目：储气库方案研究" }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "打开项目：压裂效果评价" }),
    ).toBeVisible();
    change("搜索项目", "");
    await select("项目状态筛选", "对接中");
    expect(
      screen.getByRole("button", { name: "打开项目：储气库方案研究" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "打开项目：压裂效果评价" }),
    ).toBeNull();
    expect(screen.getByText("共 2 个项目 · 0 个已关闭")).toBeVisible();
    await select("项目状态筛选", "全部阶段");
    expect(screen.getAllByRole("button", { name: /^打开项目：/ })).toHaveLength(
      2,
    );
  });

  it("saves complete project fields and preserves a rejected creation draft", async () => {
    await open();
    await userEvent.click(screen.getByRole("button", { name: "新建项目" }));
    change("项目名称", "注采优化研究");
    change("项目编号", "UG-303");
    change("研究领域", "储气库数模");
    change("项目开始日期", "2026-10-01");
    change("项目结束日期", "2027-09-30");
    change("下次对齐日期", "2026-11-06");
    change("甲方单位", "研究中心");
    change("甲方对接人", "张工");
    change("甲方角色", "技术负责人");
    change("甲方邮箱", "zhang@example.test");
    change("乙方单位", "数模团队");
    change("乙方对接人", "陈工");
    change("乙方角色", "项目经理");
    change("乙方邮箱", "chen@example.test");
    change("工作范围与交付目标", "完成三套方案对比及可复现算例");
    change("项目备注", "每周五核对进度");
    await select("项目阶段", "执行中");
    failWrite = "/projects";
    await userEvent.click(screen.getByRole("button", { name: "保存项目" }));
    await waitFor(() => expect(writes("/projects")).toHaveLength(1));
    await screen.findAllByText("服务器暂时拒绝保存，请重试");
    expect(screen.getByLabelText("项目名称")).toHaveValue("注采优化研究");
    expect(screen.getByLabelText("项目结束日期")).toHaveValue("2027-09-30");
    failWrite = "";
    await userEvent.click(screen.getByRole("button", { name: "保存项目" }));
    await waitFor(() => expect(projects).toHaveLength(3));
    expect(JSON.parse(writes("/projects")[1][1].body)).toMatchObject({
      name: "注采优化研究",
      code: "UG-303",
      domain: "储气库数模",
      start_date: "2026-10-01",
      end_date: "2027-09-30",
      next_align_at: "2026-11-06",
      status: "executing",
      client: {
        org: "研究中心",
        contact: "张工",
        role: "技术负责人",
        email: "zhang@example.test",
      },
      vendor: {
        org: "数模团队",
        contact: "陈工",
        role: "项目经理",
        email: "chen@example.test",
      },
      sow: "完成三套方案对比及可复现算例",
      notes: "每周五核对进度",
    });
    await screen.findByRole("tab", { name: "对齐事项" });
  });

  it("edits task ownership scheduling and dependencies from the real board without losing a rejected draft", async () => {
    await detail();
    await tab("对齐事项");
    await userEvent.click(
      screen.getByRole("button", { name: "编辑事项：确认数据口径" }),
    );
    change("事项标题", "核实日度数据口径");
    change("事项负责人", "赵敏");
    change("事项截止日期", "2026-11-12");
    await select("事项优先级", "紧急");
    await select("关联里程碑", "模型初版评审");
    await select("前置事项", "签署范围说明（已对齐）");
    failWrite = "/items/i1";
    await userEvent.click(screen.getByRole("button", { name: "保存事项" }));
    await waitFor(() => expect(writes("/items/i1", "PATCH")).toHaveLength(1));
    await screen.findAllByText("服务器暂时拒绝保存，请重试");
    expect(screen.getByLabelText("事项标题")).toHaveValue("核实日度数据口径");
    expect(screen.getByLabelText("事项负责人")).toHaveValue("赵敏");
    failWrite = "";
    await userEvent.click(screen.getByRole("button", { name: "保存事项" }));
    await waitFor(() => expect(items[0].title).toBe("核实日度数据口径"));
    expect(JSON.parse(writes("/items/i1", "PATCH")[1][1].body)).toMatchObject({
      priority: "urgent",
      assignee: "赵敏",
      due_date: "2026-11-12",
      milestone_id: "m1",
      depends_on: ["i3"],
      kind: "data",
      owner_side: "client",
      status: "open",
    });
    await screen.findByRole("button", { name: "编辑事项：核实日度数据口径" });
  });

  it("completes milestones and preserves the existing meeting fields through editing", async () => {
    await detail();
    await tab("里程碑");
    await userEvent.click(screen.getByRole("button", { name: "完成里程碑" }));
    await waitFor(() => expect(milestones[0].status).toBe("done"));
    expect(JSON.parse(writes("/milestones/m1", "PATCH")[0][1].body)).toEqual({
      status: "done",
    });
    await tab("对齐会议");
    expect(screen.getByText("范围澄清会")).toBeVisible();
    expect(screen.getByText("下周提交模型边界")).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "编辑会议：范围澄清会" }),
    );
    change("会议主题", "范围与交付澄清会");
    await userEvent.click(screen.getByRole("button", { name: "保存会议" }));
    await waitFor(() => expect(meetings[0].title).toBe("范围与交付澄清会"));
    expect(
      JSON.parse(writes("/meetings/meeting1", "PATCH")[0][1].body),
    ).toMatchObject({
      held_at: "2026-10-20",
      attendees_client: "李明",
      attendees_vendor: "王倩",
      agenda: "确认范围和验收口径",
      notes: "先补齐资料",
      decisions: "下周提交模型边界",
    });
  });

  it("generates agenda weekly and minutes while retaining persisted brief history and activity", async () => {
    await detail();
    await tab("AI 简报");
    await userEvent.click(
      screen
        .getByText("历史周报：资料已经交接")
        .closest("details")!
        .querySelector("summary")!,
    );
    expect(screen.getByText("历史周报：资料已经交接")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "生成对齐议程" }));
    await waitFor(() =>
      expect(
        within(screen.getByRole("article")).getByText(
          "本次议程：核对风险与交付安排",
        ),
      ).toBeVisible(),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "生成项目周报" }),
      ).toBeEnabled(),
    );
    await userEvent.click(screen.getByRole("button", { name: "生成项目周报" }));
    await waitFor(() =>
      expect(
        within(screen.getByRole("article")).getByText("本周进展：模型准备完成"),
      ).toBeVisible(),
    );
    change("待拆解会议纪要", "双方确认补充试验数据，下周提交。");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "拆解并创建事项" }),
      ).toBeEnabled(),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "拆解并创建事项" }),
    );
    await waitFor(() =>
      expect(
        within(screen.getByRole("article")).getByText("纪要提取：补充试验数据"),
      ).toBeVisible(),
    );
    expect(JSON.parse(writes("/projects/p1/ai/minutes")[0][1].body)).toEqual({
      notes: "双方确认补充试验数据，下周提交。",
      apply: true,
    });
    await tab("对齐事项");
    expect(
      await screen.findByRole("button", { name: "编辑事项：补充试验数据" }),
    ).toBeVisible();
    await tab("AI 简报");
    await userEvent.click(
      screen
        .getByText("历史周报：资料已经交接")
        .closest("details")!
        .querySelector("summary")!,
    );
    expect(screen.getByText("历史周报：资料已经交接")).toBeVisible();
    expect(
      screen.getAllByText("本次议程：核对风险与交付安排").length,
    ).toBeGreaterThan(0);
    await tab("活动记录");
    expect(screen.getByText("更新项目研究范围")).toBeVisible();
  });

  it("switches board and list views with combined search priority owner and deadline filters", async () => {
    await detail();
    await tab("对齐事项");
    expect(screen.getByLabelText("事项看板")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "事项列表" }));
    const list = () => within(screen.getByRole("table", { name: "事项列表" }));
    expect(list().getAllByRole("button", { name: /^编辑事项：/ })).toHaveLength(
      3,
    );
    await select("事项优先级筛选", "高");
    await select("事项负责人筛选", "王倩");
    await select("事项日期筛选", "已逾期");
    expect(list().getAllByRole("button", { name: /^编辑事项：/ })).toHaveLength(
      1,
    );
    expect(
      list().getByRole("button", { name: "编辑事项：完成模型初版" }),
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "看板" }));
    expect(screen.getAllByRole("button", { name: /^编辑事项：/ })).toHaveLength(
      1,
    );
    change("搜索事项", "没有这个事项");
    expect(screen.queryByRole("button", { name: /^编辑事项：/ })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "清除筛选" }));
    expect(screen.getAllByRole("button", { name: /^编辑事项：/ })).toHaveLength(
      3,
    );
    change("搜索事项", "书面确认");
    expect(screen.getAllByRole("button", { name: /^编辑事项：/ })).toHaveLength(
      3,
    );
  });

  it("does not let a late project response replace the project opened after returning", async () => {
    await open();
    let finish!: (res: Response) => void;
    const oldBundle = bundle("p1");
    intercept = (route, init) =>
      route === "/projects/p1" && init.method === "GET"
        ? new Promise((resolve) => {
            finish = resolve;
          })
        : undefined;
    await userEvent.click(
      screen.getByRole("button", { name: "打开项目：储气库方案研究" }),
    );
    expect(await screen.findByText("正在打开项目…")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "返回项目台" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "打开项目：压裂效果评价" }),
    );
    expect(
      await screen.findByRole("heading", { name: "压裂效果评价" }),
    ).toBeVisible();
    await act(async () => {
      finish(response(oldBundle));
    });
    expect(screen.getByRole("heading", { name: "压裂效果评价" })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "储气库方案研究" }),
    ).toBeNull();
    await tab("对齐事项");
    expect(screen.queryByRole("button", { name: /^编辑事项：/ })).toBeNull();
  });

  it("blocks alignment until predecessors are agreed and then completes the real list workflow", async () => {
    items[0].depends_on = ["i2"];
    await detail();
    await tab("对齐事项");
    await userEvent.click(screen.getByRole("button", { name: "事项列表" }));
    const row = (title: string) =>
      within(
        screen
          .getByRole("button", { name: "编辑事项：" + title })
          .closest("tr")!,
      );
    await userEvent.click(
      row("确认数据口径").getByRole("button", { name: "标记已对齐" }),
    );
    await screen.findByText("请先完成前置事项，再标记为已对齐");
    expect(writes("/items/i1", "PATCH")).toHaveLength(0);
    await userEvent.click(
      row("完成模型初版").getByRole("button", { name: "标记已对齐" }),
    );
    await waitFor(() =>
      expect(
        row("完成模型初版").getByRole("button", { name: "重新打开" }),
      ).toBeEnabled(),
    );
    await userEvent.click(
      row("确认数据口径").getByRole("button", { name: "标记已对齐" }),
    );
    await waitFor(() =>
      expect(
        row("确认数据口径").getByRole("button", { name: "重新打开" }),
      ).toBeEnabled(),
    );
    expect(items[0]).toMatchObject({
      status: "agreed",
      depends_on: ["i2"],
      assignee: "李明",
      due_date: "2099-11-15",
    });
    expect(JSON.parse(writes("/items/i1", "PATCH")[0][1].body)).toEqual({
      status: "agreed",
    });
    await userEvent.click(
      row("确认数据口径").getByRole("button", { name: "重新打开" }),
    );
    await waitFor(() => expect(items[0].status).toBe("open"));
  });

  it("exports complete project bundles even when the project portfolio is filtered", async () => {
    const blobs: Blob[] = [];
    const filenames: string[] = [];
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      blobs.push(blob as Blob);
      return "blob:uproject-test";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      filenames.push(this.download);
    });
    await open();
    change("搜索项目", "压裂");
    expect(screen.getAllByRole("button", { name: /^打开项目：/ })).toHaveLength(
      1,
    );
    await userEvent.click(screen.getByRole("button", { name: "导出全部" }));
    await waitFor(() => expect(blobs).toHaveLength(1));
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blobs[0]);
    });
    const exported = JSON.parse(text);
    expect(exported.projects.map((b: any) => b.project.id)).toEqual([
      "p1",
      "p2",
    ]);
    expect(exported.projects[0].items).toHaveLength(3);
    expect(exported.projects[0].meetings[0].decisions).toBe("下周提交模型边界");
    expect(exported.projects[0].briefs[0].content).toBe(
      "历史周报：资料已经交接",
    );
    expect(filenames[0]).toMatch(/^科研项目台账-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it("requires explicit confirmation before restoring demo projects", async () => {
    await open();
    await userEvent.click(screen.getByRole("button", { name: "恢复演示" }));
    expect(writes("/demo/reset")).toHaveLength(0);
    await userEvent.click(
      await screen.findByRole("button", { name: /取\s*消/ }),
    );
    expect(writes("/demo/reset")).toHaveLength(0);
    await userEvent.click(screen.getByRole("button", { name: "恢复演示" }));
    await userEvent.click(
      screen.getByRole("button", { name: "确认清空并恢复" }),
    );
    await waitFor(() => expect(writes("/demo/reset")).toHaveLength(1));
  });
});
