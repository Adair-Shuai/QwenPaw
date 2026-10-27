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

const makeIdea = (id: string, extra = {}) => ({
  id,
  title: "灵感 " + id,
  content: "观察 " + id,
  tags: ["储气库"],
  related_experiments: ["实验3"],
  status: "raw",
  created_at: "2026-10-26T01:00:00Z",
  updated_at: "2026-10-26T01:00:00Z",
  ...extra,
});

describe("UIdeas shipped workspace", () => {
  let Component: React.ComponentType;
  let ideas: any[], suggestions: any[], clusters: any[], meta: any;
  let eventSource: any;
  let failLoad = false,
    jobStatus = "running";
  const fetcher = vi.fn();
  const blobs: Blob[] = [];
  beforeEach(() => {
    ideas = [
      makeIdea("a"),
      makeIdea("b", {
        title: "压力异常",
        content: "井口压力出现波动",
        tags: ["压力"],
      }),
    ];
    suggestions = [
      {
        id: "s1",
        title: "开展敏感性实验",
        body: "对比不同渗透率",
        rationale: "识别影响因素",
        source_idea_ids: ["a"],
        status: "new",
      },
    ];
    clusters = [
      {
        id: "c1",
        name: "注采优化",
        description: "研究注采参数",
        idea_ids: ["a"],
      },
    ];
    meta = {
      min_ideas: 1,
      proactive_enabled: false,
      interval_minutes: 60,
      todo_queue: [],
    };
    failLoad = false;
    jobStatus = "running";
    blobs.length = 0;
    vi.stubGlobal(
      "EventSource",
      class {
        onmessage: any;
        onopen: any;
        onerror: any;
        readyState = 0;
        close = vi.fn();
        constructor() {
          eventSource = this;
        }
      },
    );
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      blobs.push(blob as Blob);
      return "blob:test";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    fetcher
      .mockReset()
      .mockImplementation(async (url: string, init: RequestInit = {}) => {
        const route = url.replace("/api/uideas", "").split("?")[0];
        const body = init.body ? JSON.parse(String(init.body)) : null;
        if (failLoad && route === "/ideas" && init.method === "GET")
          return new Response('{"detail":"连接暂时不可用"}', { status: 503 });
        let data: any = {};
        if (route === "/ideas" && init.method === "POST") {
          const idea = makeIdea("new", body);
          ideas.unshift(idea);
          data = { idea };
        } else if (route.startsWith("/ideas/") && init.method === "PATCH") {
          const idea = ideas.find((i) => i.id === route.split("/")[2]);
          if (body.status === "archived")
            idea.status_before_archive = idea.status;
          Object.assign(idea, body);
          data = { idea };
        } else if (route.startsWith("/ideas/") && init.method === "DELETE") {
          ideas = ideas.filter((i) => i.id !== route.split("/")[2]);
        } else if (route === "/ideas") data = { ideas };
        else if (route.startsWith("/suggestions/") && init.method === "PATCH") {
          const suggestion = suggestions.find(
            (s) => s.id === route.split("/")[2],
          );
          suggestion.status = body.status;
          if (body.status === "accepted" && !meta.todo_queue.length)
            meta.todo_queue.push({
              id: "t1",
              title: suggestion.title,
              body: suggestion.body,
              idea_ids: ["a"],
              status: "todo",
            });
          data = { suggestion };
        } else if (route === "/suggestions") data = { suggestions };
        else if (route === "/clusters") data = { clusters };
        else if (route === "/meta") {
          if (body) Object.assign(meta, body);
          data = { meta };
        } else if (route.startsWith("/todos/")) {
          Object.assign(meta.todo_queue[0], body);
          data = { todo: meta.todo_queue[0] };
        } else if (route.startsWith("/jobs/"))
          data = {
            job: {
              id: "j1",
              status: jobStatus,
              error: "模型暂时不可用",
              result: { cluster_count: 1 },
            },
          };
        else if (
          ["/analyze", "/think"].includes(route) ||
          route.startsWith("/expand/")
        )
          data = { job_id: "j1", status: "queued" };
        else throw new Error("Unexpected route " + route);
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
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
        path.resolve(process.cwd(), "../plugins/apps/uideas/ui/index.js"),
        "utf8",
      ),
    )();
  });
  afterEach(() => {
    cleanup();
    antd.Modal.destroyAll();
    antd.message.destroy();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "QwenPaw");
  });
  function mount() {
    render(
      <antd.ConfigProvider theme={{ token: { motion: false } }}>
        <Component />
      </antd.ConfigProvider>,
    );
  }
  async function open() {
    mount();
    await screen.findByRole("heading", { name: /我的灵感/ });
  }
  const panel = () => within(screen.getByRole("tabpanel"));
  async function tab(name: string) {
    await userEvent.click(screen.getByRole("tab", { name: new RegExp(name) }));
  }
  function writes(fragment: string, method = "POST") {
    return fetcher.mock.calls.filter(
      ([u, i]) => u.includes(fragment) && i?.method === method,
    );
  }

  it("captures inline metadata without accidental Enter submission and retains drafts across tabs", async () => {
    await open();
    fireEvent.change(screen.getByLabelText("灵感内容"), {
      target: { value: "新的假设 #数模 @实验8" },
    });
    fireEvent.keyDown(screen.getByLabelText("灵感内容"), {
      key: "Enter",
      isComposing: true,
      ctrlKey: true,
    });
    fireEvent.keyDown(screen.getByLabelText("灵感内容"), { key: "Enter" });
    expect(writes("/ideas")).toHaveLength(0);
    await tab("研究方向");
    await tab("灵感库");
    expect(screen.getByLabelText("灵感内容")).toHaveValue(
      "新的假设 #数模 @实验8",
    );
    fireEvent.keyDown(screen.getByLabelText("灵感内容"), {
      key: "Enter",
      ctrlKey: true,
    });
    await waitFor(() => expect(writes("/ideas")).toHaveLength(1));
    expect(JSON.parse(writes("/ideas")[0][1].body)).toMatchObject({
      content: "新的假设 #数模 @实验8",
      tags: ["数模"],
      related_experiments: ["实验8"],
    });
    await waitFor(() =>
      expect(screen.getByLabelText("灵感内容")).toHaveValue(""),
    );
  });

  it("searches full content and expansion, clears filters, reads full ideas and navigates cluster sources", async () => {
    ideas[0].content = "长记录".repeat(90) + "末尾证据";
    ideas[0].expansion = "扩充检索词";
    await open();
    fireEvent.change(screen.getByLabelText("搜索灵感"), {
      target: { value: "扩充检索词" },
    });
    expect(panel().getByRole("button", { name: "灵感 a" })).toBeVisible();
    expect(panel().queryByRole("button", { name: "压力异常" })).toBeNull();
    await userEvent.click(panel().getByRole("button", { name: "灵感 a" }));
    await waitFor(() =>
      expect(
        within(screen.getByRole("dialog")).getByText(/末尾证据/),
      ).toBeVisible(),
    );
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: /完\s*成/,
      }),
    );
    fireEvent.change(screen.getByLabelText("搜索灵感"), {
      target: { value: "不存在" },
    });
    expect(panel().getByText("没有找到符合条件的灵感")).toBeVisible();
    await userEvent.click(
      panel().getAllByRole("button", { name: "清除筛选" })[0],
    );
    expect(panel().getByRole("button", { name: "压力异常" })).toBeVisible();
    await tab("研究方向");
    await userEvent.click(panel().getByRole("button", { name: "• 灵感 a" }));
    await waitFor(() =>
      expect(
        within(screen.getByRole("dialog")).getByText(/末尾证据/),
      ).toBeVisible(),
    );
  });

  it("preserves edited text during realtime refresh and retains explicit experiment links", async () => {
    await open();
    await userEvent.click(
      panel().getAllByRole("button", { name: /编\s*辑/ })[0],
    );
    fireEvent.change(screen.getByLabelText("编辑内容"), {
      target: { value: "正在编辑的新内容" },
    });
    act(() =>
      eventSource.onmessage({ data: JSON.stringify({ type: "idea:updated" }) }),
    );
    await waitFor(() =>
      expect(
        fetcher.mock.calls.filter(([u]) => u.endsWith("/meta")).length,
      ).toBeGreaterThan(1),
    );
    expect(screen.getByLabelText("编辑内容")).toHaveValue("正在编辑的新内容");
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: /保\s*存/,
      }),
    );
    await waitFor(() => expect(writes("/ideas/a", "PATCH")).toHaveLength(1));
    expect(
      JSON.parse(writes("/ideas/a", "PATCH")[0][1].body).related_experiments,
    ).toEqual(["实验3"]);
  });

  function seedPaginatedLibrary() {
    ideas = Array.from({ length: 14 }, (_, i) =>
      makeIdea(String(i).padStart(2, "0"), {
        tags: [i === 13 ? "专属标签" : "普通标签"],
        updated_at: `2026-10-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
      }),
    );
  }

  it("paginates the real library in descending update order", async () => {
    seedPaginatedLibrary();
    await open();
    expect(panel().getAllByRole("button", { name: /^灵感 \d/ })).toHaveLength(
      12,
    );
    expect(
      panel().getAllByRole("button", { name: /^灵感 \d/ })[0],
    ).toHaveTextContent("灵感 13");
    await userEvent.click(panel().getByRole("button", { name: "下一页" }));
    expect(panel().getAllByRole("button", { name: /^灵感 \d/ })).toHaveLength(
      2,
    );
  });

  it("retains filters across keyboard navigation and restores the first page when cleared", async () => {
    seedPaginatedLibrary();
    await open();
    await userEvent.click(panel().getByRole("button", { name: "下一页" }));
    fireEvent.change(screen.getByLabelText("搜索灵感"), {
      target: { value: "专属标签" },
    });
    expect(panel().getByRole("button", { name: "灵感 13" })).toBeVisible();
    const firstTab = screen.getByRole("tab", { name: /灵感库/ });
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /研究方向/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.keyDown(screen.getByRole("tab", { name: /研究方向/ }), {
      key: "Home",
    });
    expect(screen.getByLabelText("搜索灵感")).toHaveValue("专属标签");
    await userEvent.click(
      panel().getAllByRole("button", { name: "清除筛选" })[0],
    );
    expect(panel().getAllByRole("button", { name: /^灵感 \d/ })).toHaveLength(
      12,
    );
  });

  it("sorts the real library by title and filters by tags", async () => {
    seedPaginatedLibrary();
    await open();
    await userEvent.click(screen.getByRole("combobox", { name: "灵感排序" }));
    await userEvent.click(screen.getByText("标题顺序"));
    expect(
      panel().getAllByRole("button", { name: /^灵感 \d/ })[0],
    ).toHaveTextContent("灵感 00");
    await userEvent.click(
      panel().getAllByRole("button", { name: "筛选标签 普通标签" })[0],
    );
    expect(panel().queryByRole("button", { name: "灵感 13" })).toBeNull();
  });

  it("archives and restores original status from the mounted idea board", async () => {
    await open();
    await userEvent.click(
      panel().getAllByRole("button", { name: /^归\s*档$/ })[0],
    );
    await waitFor(() =>
      expect(panel().queryByRole("button", { name: "灵感 a" })).toBeNull(),
    );
    await userEvent.click(panel().getByRole("button", { name: /^归档\d/ }));
    await userEvent.click(panel().getByRole("button", { name: /恢\s*复/ }));
    await waitFor(() => expect(ideas[0].status).toBe("raw"));
  });

  it("adopts a suggestion then completes and reopens its action without SSE", async () => {
    await open();
    await tab("思考建议");
    await userEvent.click(panel().getByRole("button", { name: "采纳为行动" }));
    await waitFor(() => expect(suggestions[0].status).toBe("accepted"));
    await tab("行动清单");
    await userEvent.click(
      await panel().findByRole("button", { name: "标记完成" }),
    );
    await waitFor(() => expect(meta.todo_queue[0].status).toBe("done"));
    await userEvent.click(panel().getByRole("button", { name: /^已完成/ }));
    await userEvent.click(
      await panel().findByRole("button", { name: "重新打开" }),
    );
    await waitFor(() => expect(meta.todo_queue[0].status).toBe("todo"));
    expect(
      writes("/todos/t1", "PATCH").map(([, i]) => JSON.parse(i.body).status),
    ).toEqual(["done", "todo"]);
  });

  it("keeps queued jobs busy across tabs and polls completion without realtime events", async () => {
    await open();
    await userEvent.click(
      panel().getByRole("button", { name: /整理研究方向/ }),
    );
    await tab("研究方向");
    await userEvent.click(panel().getByRole("button", { name: /重新整理/ }));
    expect(writes("/analyze")).toHaveLength(1);
    expect(screen.getByText("研究方向整理进行中…")).toBeVisible();
    jobStatus = "done";
    await waitFor(
      () => expect(screen.queryByText("研究方向整理进行中…")).toBeNull(),
      { timeout: 5000 },
    );
    expect(fetcher.mock.calls.some(([u]) => u.endsWith("/jobs/j1"))).toBe(true);
  });

  it("shows recoverable task failures and retries from the real page", async () => {
    await open();
    jobStatus = "error";
    await userEvent.click(
      panel().getByRole("button", { name: /整理研究方向/ }),
    );
    await screen.findByText("研究方向整理失败", {}, { timeout: 5000 });
    expect(screen.getByText("模型暂时不可用")).toBeVisible();
    jobStatus = "running";
    await userEvent.click(screen.getByRole("button", { name: "重试任务" }));
    await waitFor(() => expect(writes("/analyze")).toHaveLength(2));
  });

  it("retries loading errors and exports all records including archived ideas", async () => {
    ideas.push(makeIdea("archived", { status: "archived" }));
    failLoad = true;
    mount();
    await screen.findByText("暂时无法加载灵感库");
    failLoad = false;
    await userEvent.click(screen.getByRole("button", { name: "重新加载" }));
    await screen.findByRole("heading", { name: /我的灵感/ });
    fireEvent.change(screen.getByLabelText("搜索灵感"), {
      target: { value: "不存在" },
    });
    await userEvent.click(screen.getByRole("button", { name: "导出笔记" }));
    await userEvent.click(screen.getByRole("button", { name: "JSON 数据" }));
    expect(blobs).toHaveLength(1);
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blobs[0]);
    });
    expect(JSON.parse(text).ideas.map((i: any) => i.id)).toEqual([
      "a",
      "b",
      "archived",
    ]);
    expect(JSON.parse(text).suggestions).toHaveLength(1);
    expect(JSON.parse(text).clusters).toHaveLength(1);
  });
});
