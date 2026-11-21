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
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hostFetch } from "./hostSdk/fetch";

const topic = "怎样让邻里更愿意交换闲置工具？";
const idea = "先找三户常修家具的家庭试试。";
const firstQuestion = "谁最需要借工具？";
const secondQuestion = "怎样验证他们是否愿意借？";
const summary = "访谈三户家庭，记录顾虑再调整试点。";
const opened = {
  id: "discussion-1",
  topic,
  materials: "",
  created_at: "2026-01-15T10:00:00Z",
  updated_at: "2026-01-15T10:00:00Z",
  revision: 1,
  turns: [{ question: firstQuestion, answer: null, mode: "start" }],
  summary: null,
};
const followed = {
  ...opened,
  revision: 2,
  turns: [
    { question: firstQuestion, answer: idea, mode: "start" },
    { question: secondQuestion, answer: null, mode: "deepen" },
  ],
};
const completed = { ...followed, revision: 3, summary };
const request = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("installed brainstorm application", () => {
  let Page: React.ComponentType;
  let agent: string;
  let history: boolean;
  let handlePost: (route: string, options: RequestInit) => Promise<Response>;
  const fetcher = vi.fn();
  const sessions = "/api/brainstorm/sessions";

  beforeEach(() => {
    localStorage.clear();
    agent = "researcher";
    history = false;
    handlePost = async (route) => {
      if (route === sessions) return request(opened);
      if (route === sessions + "/discussion-1/turns") return request(followed);
      if (route === sessions + "/discussion-1/summary")
        return request(completed);
      throw Error("Unexpected POST " + route);
    };
    fetcher.mockReset().mockImplementation(async (url, options = {}) => {
      const route = new URL(url, window.location.origin).pathname;
      if (options.method === "POST") return handlePost(route, options);
      if (route === sessions)
        return request({
          sessions: history
            ? [{ ...completed, turn_count: 2, has_summary: true }]
            : [],
        });
      if (route === sessions + "/discussion-1") return request(completed);
      throw Error("Unexpected GET " + route);
    });
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("QwenPaw", {
      host: {
        React,
        antd,
        fetch: hostFetch,
        useSelectedAgent: () => ({ id: agent }),
      },
      registerRoutes(
        id: string,
        routes: Array<{ path: string; component: React.ComponentType }>,
      ) {
        expect(id).toBe("brainstorm");
        expect(routes[0].path).toBe("/apps/brainstorm");
        Page = routes[0].component;
      },
    });
    new Function(
      fs.readFileSync(
        path.resolve(process.cwd(), "../plugins/apps/brainstorm/ui/index.js"),
        "utf8",
      ),
    )();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function begin() {
    fireEvent.change(screen.getByRole("textbox", { name: /讨论主题/ }), {
      target: { value: topic },
    });
    fireEvent.click(screen.getByRole("button", { name: "开始讨论" }));
  }

  it("starts an open topic, follows the answer and summarizes the current draft", async () => {
    render(<Page />);
    begin();
    await screen.findByText(firstQuestion);
    const answer = screen.getByRole("textbox", { name: /你的想法/ });
    fireEvent.change(answer, { target: { value: idea } });
    fireEvent.click(screen.getByRole("button", { name: "继续追问" }));
    await screen.findByText(secondQuestion);
    const draft = "下一步先约访，周三记录结果。";
    fireEvent.change(screen.getByRole("textbox", { name: /你的想法/ }), {
      target: { value: draft },
    });
    fireEvent.click(screen.getByRole("button", { name: "生成总结" }));
    await screen.findByText(summary);
    const writes = fetcher.mock.calls.filter(
      ([, options]) => options?.method === "POST",
    );
    expect(writes).toHaveLength(3);
    const bodies = writes.map(([, options]) => JSON.parse(options.body));
    expect(bodies[0]).toMatchObject({ topic, request_id: expect.any(String) });
    expect(bodies[1]).toMatchObject({
      answer: idea,
      mode: "deepen",
      revision: 1,
    });
    expect(bodies[2]).toMatchObject({ answer: draft, revision: 2 });
    expect(
      writes.every(
        ([url]) =>
          new URL(url, window.location.origin).searchParams.get("agent_id") ===
          "researcher",
      ),
    ).toBe(true);
  });

  it("imports a document excerpt and uses the edited material in the opening question", async () => {
    const excerpt = "受访家庭愿意分享电钻。";
    const revised = "受访的三户家庭愿意分享电钻。";
    const file = new File(["sample content"], "访谈.docx");
    let imported: File | undefined;
    let submitted = "";
    handlePost = async (route, options) => {
      if (route === "/api/brainstorm/materials/extract") {
        imported = (options.body as FormData).get("file") as File;
        return request({ text: excerpt, truncated: false });
      }
      if (route === sessions) {
        submitted = JSON.parse(options.body as string).materials;
        return request({ ...opened, materials: submitted });
      }
      throw Error("Unexpected POST " + route);
    };
    render(<Page />);
    fireEvent.click(screen.getByText("补充材料（可选）"));
    fireEvent.change(screen.getByLabelText("选择材料文件"), {
      target: { files: [file] },
    });
    const material = screen.getByRole("textbox", { name: "补充材料" });
    await waitFor(() => expect(material).toHaveValue(excerpt));
    expect(imported?.name).toBe(file.name);
    fireEvent.change(material, { target: { value: revised } });
    begin();
    await screen.findByText(firstQuestion);
    expect(submitted).toBe(revised);
  });

  it.each([
    ["换个视角", "reframe"],
    ["自由发散", "diverge"],
  ])(
    "can choose %s when the current question has no answer",
    async (label, mode) => {
      let advanced: unknown;
      handlePost = async (route, options) => {
        if (route === sessions) return request(opened);
        advanced = JSON.parse(options.body as string);
        return request({
          ...followed,
          turns: [
            ...opened.turns,
            { question: secondQuestion, answer: null, mode },
          ],
        });
      };
      render(<Page />);
      begin();
      await screen.findByText(firstQuestion);
      fireEvent.click(screen.getByRole("button", { name: label }));
      await screen.findByText(secondQuestion);
      expect(advanced).toMatchObject({ answer: "", mode, revision: 1 });
      expect(screen.getByText("本轮未作答")).toBeInTheDocument();
    },
  );

  it("preserves an answer on model failure and can retry from the same question", async () => {
    let fail = true;
    handlePost = async (route) => {
      if (route === sessions) return request(opened);
      return fail
        ? request({ detail: "模型暂时不可用" }, 503)
        : request(followed);
    };
    render(<Page />);
    begin();
    await screen.findByText(firstQuestion);
    const answer = screen.getByRole("textbox", { name: /你的想法/ });
    fireEvent.change(answer, { target: { value: idea } });
    fireEvent.click(screen.getByRole("button", { name: "继续追问" }));
    await screen.findByText("模型暂时不可用");
    expect(answer).toHaveValue(idea);
    expect(screen.queryByText(secondQuestion)).not.toBeInTheDocument();
    fail = false;
    fireEvent.click(screen.getByRole("button", { name: "继续追问" }));
    await screen.findByText(secondQuestion);
  });

  it("opens a saved discussion with its summary from history", async () => {
    history = true;
    render(<Page />);
    fireEvent.click(
      await screen.findByRole("button", { name: new RegExp(topic) }),
    );
    await screen.findByText(summary);
    expect(screen.getByText(secondQuestion)).toBeInTheDocument();
    expect(
      fetcher.mock.calls.some(([url]) =>
        url.includes("/sessions/discussion-1"),
      ),
    ).toBe(true);
  });

  it("discards a late model reply after the selected expert changes", async () => {
    let release!: (value: Response) => void;
    handlePost = () =>
      new Promise<Response>((resolve) => {
        release = resolve;
      });
    const view = render(<Page />);
    begin();
    await waitFor(() => expect(release).toBeDefined());
    agent = "another-agent";
    view.rerender(<Page />);
    await act(async () => release(request(opened)));
    await waitFor(() =>
      expect(
        fetcher.mock.calls.some(([url]) =>
          url.includes("agent_id=another-agent"),
        ),
      ).toBe(true),
    );
    expect(screen.queryByText(firstQuestion)).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /讨论主题/ })).toHaveValue("");
  });
});
