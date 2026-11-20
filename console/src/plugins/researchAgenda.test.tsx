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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const task = {
  title: "修改研究方案",
  kind: "科研",
  project: "基金申请",
  assignee: "张老师",
  due_date: "2026-11-20",
  planned_date: null,
  start: "",
  duration: 60,
  priority: "high",
  status: "todo",
  waiting_for: "",
  notes: "预计用时",
  relation: "mine",
};
const candidate = {
  ...task,
  candidate_id: "candidate-1",
  action: "create",
  evidence: "周五之前修改研究方案",
  questions: [],
};
const source = {
  id: "source-1",
  source_name: "项目群",
  identity: "张老师",
  reference_date: "2026-11-17",
  text: "周五之前修改研究方案",
  images: [],
  transcript: "",
  summary: "有一项工作需要推进",
  status: "review",
  questions: [],
  candidates: [candidate],
};
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("Research agenda installed application", () => {
  let Component: React.ComponentType;
  let selectedAgent: string;
  let tasks: Array<Record<string, unknown>>;
  let sources: Array<typeof source>;
  let failExtract: boolean;
  let intercept: ((url: string) => Promise<Response> | undefined) | undefined;
  const fetcher = vi.fn();

  beforeEach(() => {
    tasks = [];
    sources = [];
    selectedAgent = "default";
    failExtract = false;
    intercept = undefined;
    localStorage.clear();
    fetcher
      .mockReset()
      .mockImplementation(async (url: string, options: RequestInit = {}) => {
        const held = intercept?.(url);
        if (held) return held;
        if (url.includes("/state")) return response({ tasks, sources });
        if (url.includes("/extract")) {
          if (failExtract) return response({ detail: "模型暂时不可用" }, 503);
          sources = [source];
          return response(source);
        }
        if (url.includes("/apply")) {
          const body = JSON.parse(options.body as string);
          tasks = body.candidates.map((item: { fields: object }) => ({
            ...item.fields,
            id: "task-1",
            revision: 1,
            source_id: source.id,
            evidence: candidate.evidence,
          }));
          sources = [{ ...source, status: "applied" }];
          return response({ ids: ["task-1"], tasks, sources });
        }
        if (url.includes("/sources/")) return response(source);
        if (url.includes("/plan"))
          return response({
            blocks: [
              {
                task_id: "task-1",
                title: tasks[0]?.title,
                start: "09:00",
                end: "10:00",
                kind: "科研",
              },
            ],
            unplanned: [],
            conflicts: [],
          });
        throw new Error(`Unexpected route ${url}`);
      });
    vi.stubGlobal("fetch", fetcher);
    Object.defineProperty(window, "QwenPaw", {
      configurable: true,
      value: {
        host: {
          React,
          antd,
          getApiUrl: (path: string) => "/api" + path,
          getApiToken: () => "",
          useSelectedAgent: () => ({ id: selectedAgent }),
        },
        registerRoutes: (
          id: string,
          routes: Array<{ component: React.ComponentType; path: string }>,
        ) => {
          expect(id).toBe("research-agenda");
          expect(routes[0].path).toBe("/apps/research-agenda");
          Component = routes[0].component;
        },
      },
    });
    new Function(
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "../plugins/apps/research-agenda/ui/index.js",
        ),
        "utf8",
      ),
    )();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("imports material, reviews source evidence, edits the proposal and schedules confirmed work", async () => {
    render(<Component />);
    await screen.findByText("暂无事项。放入聊天记录或截图，开始整理。");
    fireEvent.click(screen.getByRole("button", { name: "试用一段示例" }));
    fireEvent.click(screen.getByRole("button", { name: "整理成待办" }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(candidate.evidence, { selector: "blockquote" }),
    ).toBeInTheDocument();
    expect(tasks).toHaveLength(0);
    fireEvent.click(within(dialog).getByText("核对或修改字段"));
    fireEvent.change(within(dialog).getByLabelText("事项名称"), {
      target: { value: "完成研究方案修订稿" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "保存选中的 1 项" }),
    );
    await screen.findByRole("button", { name: "完成研究方案修订稿" });
    expect(tasks[0].title).toBe("完成研究方案修订稿");
    fireEvent.click(screen.getByRole("button", { name: "安排当天工作" }));
    await screen.findByText("09:00");
    expect(
      screen.getByRole("button", { name: "查看来源" }),
    ).toBeInTheDocument();
  });

  it("retains pasted input after model failure and permits retry without creating tasks", async () => {
    failExtract = true;
    render(<Component />);
    fireEvent.click(screen.getByRole("button", { name: "试用一段示例" }));
    const original = (
      screen.getByLabelText("聊天记录或会议纪要") as HTMLTextAreaElement
    ).value;
    fireEvent.click(screen.getByRole("button", { name: "整理成待办" }));
    await screen.findByText("模型暂时不可用");
    expect(screen.getByLabelText("聊天记录或会议纪要")).toHaveValue(original);
    expect(tasks).toHaveLength(0);
    failExtract = false;
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "整理成待办" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "整理成待办" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("accepts screenshot files and submits their image bytes with the selected identity", async () => {
    const rendered = render(<Component />);
    fireEvent.change(screen.getByLabelText("记录中的我"), {
      target: { value: "张老师" },
    });
    const input = rendered.container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: {
        files: [new File(["image bytes"], "chat.png", { type: "image/png" })],
      },
    });
    await screen.findByAltText("chat.png");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "整理成待办" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "整理成待办" }));
    await screen.findByRole("dialog");
    const request = fetcher.mock.calls.find(([url]) =>
      url.includes("/extract"),
    );
    const body = JSON.parse(request![1].body);
    expect(body.identity).toBe("张老师");
    expect(body.text).toBe("");
    expect(body.images).toEqual([
      { name: "chat.png", data_url: "data:image/png;base64,aW1hZ2UgYnl0ZXM=" },
    ]);
  });

  it("reopens saved pending material from the confirmation view", async () => {
    sources = [source];
    render(<Component />);
    const navigation = within(
      screen.getByRole("navigation", { name: "工作日程视图" }),
    );
    await waitFor(() =>
      expect(
        navigation.getByRole("button", { name: /待确认/ }),
      ).toHaveTextContent("1"),
    );
    fireEvent.click(navigation.getByRole("button", { name: /待确认/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /项目群.*核对整理结果/ }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(candidate.evidence, { selector: "blockquote" }),
    ).toBeInTheDocument();
    expect(tasks).toHaveLength(0);
  });

  it("discards a late extraction when the selected agent changes", async () => {
    let resolve: (value: Response) => void = () => {};
    intercept = (url) =>
      url.includes("/extract")
        ? new Promise<Response>((done) => {
            resolve = done;
          })
        : undefined;
    const rendered = render(<Component />);
    fireEvent.click(screen.getByRole("button", { name: "试用一段示例" }));
    fireEvent.click(screen.getByRole("button", { name: "整理成待办" }));
    await waitFor(() =>
      expect(fetcher.mock.calls.some(([url]) => url.includes("/extract"))).toBe(
        true,
      ),
    );
    selectedAgent = "other-agent";
    rendered.rerender(<Component />);
    await act(async () => {
      resolve(response(source));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("聊天记录或会议纪要")).toHaveValue("");
    await waitFor(() =>
      expect(
        fetcher.mock.calls.some(([url]) =>
          url.includes("agent_id=other-agent"),
        ),
      ).toBe(true),
    );
  });
});
