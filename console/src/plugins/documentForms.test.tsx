import fs from "node:fs";
import path from "node:path";
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/common_setup";
import { createWorkspaceNamespace } from "@/components/Workspace/workspaceSdk";
// Resolve the renderer during module setup; cold Windows transforms must not
// consume the form interaction timeout or leave an unfinished act() scope.
import "@/components/Workspace/renderers/OfficeDocRenderer";

vi.mock("react-i18next", () => {
  const t = (key: string, fallback?: string) => fallback || key;
  return { useTranslation: () => ({ t, i18n: { language: "zh-CN" } }) };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "QwenPaw");
});

const stageNames = [
  "上报计划",
  "选商论证",
  "商务谈判",
  "开题论证",
  "结题验收",
  "归档付款",
];
const stageIds = [
  "plan",
  "selection",
  "negotiation",
  "kickoff",
  "acceptance",
  "payment",
];
const reply = (value: unknown) =>
  new Response(JSON.stringify(structuredClone(value)), {
    headers: { "Content-Type": "application/json" },
  });

function formProjectApi(getCase: () => any) {
  let imported = false;
  return (url: string, init?: RequestInit) => {
    const state = getCase();
    if (url === "/document-forms/projects")
      return reply([
        {
          id: "p1",
          name: "测试项目",
          code: "P001",
          completed: 0,
          forms: imported ? 1 : 0,
        },
      ]);
    if (url === "/document-forms/projects/p1/cases/import") {
      imported = true;
      return reply(state);
    }
    if (url === `/document-forms/cases/${state.id}` && !init?.method)
      return reply(state);
    if (url === "/document-forms/projects/p1")
      return reply({
        id: "p1",
        name: "测试项目",
        code: "P001",
        owner: "经办人",
        revision: 1,
        fields: state.fields.filter((f: any) =>
          /^(project|research|org|contact)\./.test(f.key),
        ),
        forms: imported
          ? [
              {
                case_id: state.id,
                stage_id: "negotiation",
                name: state.name,
                revision: state.revision,
                updated_at: state.updated_at,
                outputs: 0,
                shared_changes: [],
                generations: state.generations,
              },
            ]
          : [],
        stages: stageIds.map((id, i) => ({
          id,
          title: stageNames[i],
          purpose: "阶段材料",
          status: "pending",
          materials: [],
          upstream_changed: [],
          missing_required: [],
          notes: "",
          due_date: "",
          system_url: "",
          system_name: "",
          submission_ref: "",
        })),
      });
    return null;
  };
}

it("organizes projects into six stages and keeps material versions and submission details on the packaged page", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  let project: any = null;
  const calls: Array<{ url: string; body: any }> = [];
  const downloads: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    downloads.push(this.download);
  });
  vi.stubGlobal(
    "URL",
    Object.assign(class extends URL {}, {
      createObjectURL: () => "blob:project-material",
      revokeObjectURL: vi.fn(),
    }),
  );
  const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
    const body =
      typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
    calls.push({ url, body });
    if (url === "/workspace/convert-office")
      return reply({
        engine: "officecli",
        html: "<html><body>计划材料预览</body></html>",
      });
    if (url === "/document-forms/projects" && init?.method === "POST") {
      project = {
        id: "project-new",
        ...body,
        revision: 1,
        fields: [
          {
            key: "project.name",
            label: "项目名称",
            group: "项目资料",
            kind: "text",
            value: body.name,
          },
        ],
        forms: [],
        stages: stageIds.map((id, i) => ({
          id,
          title: stageNames[i],
          purpose: "阶段说明",
          status: "pending",
          due_date: "",
          notes: "",
          system_name: "",
          system_url: "",
          submission_ref: "",
          upstream_changed: [],
          missing_required: [],
          materials: [
            {
              id: "m-" + id,
              name: stageNames[i] + "材料",
              required: false,
              status: "pending",
              note: "",
              files: [],
            },
          ],
        })),
      };
      return reply(project);
    }
    if (url === "/document-forms/projects")
      return reply(project ? [{ ...project, completed: 0, forms: 0 }] : []);
    if (url.endsWith("/project-new") && !init?.method) return reply(project);
    if (url.includes("/materials/") && url.endsWith("/files")) {
      const file = (body as FormData).get("file") as File;
      const material = project.stages[0].materials[0];
      material.files.push({
        id: "f" + material.files.length,
        name: file.name,
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: file.size,
        uploaded_at: "2026-10-22T10:00:00Z",
        preview_url: "/api/files/preview/plan.docx",
      });
      material.status = "preparing";
      project.revision++;
      return reply(project);
    }
    if (url.endsWith("/materials/m-plan") && init?.method === "PUT") {
      Object.assign(project.stages[0].materials[0], body);
      project.revision++;
      return reply(project);
    }
    if (url.endsWith("/stages/plan") && init?.method === "PUT") {
      Object.assign(project.stages[0], body);
      project.revision++;
      return reply(project);
    }
    if (url.includes("/bundle"))
      return new Response("PK-project-archive", {
        headers: { "Content-Type": "application/zip" },
      });
    throw new Error("Unexpected project request: " + url);
  });
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {},
      registerRoutes: (_id: string, routes: any[]) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    new Function(
      "window",
      "URL",
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "../plugins/apps/document-forms/ui/index.js",
        ),
        "utf8",
      ),
    )(window, URL);
  });
  renderWithProviders(<Page />);
  await waitFor(() =>
    expect(screen.queryByText("载入项目…")).not.toBeInTheDocument(),
  );
  await user.click(screen.getByRole("button", { name: "＋ 新建项目" }));
  await user.type(screen.getByLabelText("新项目名称"), "储气库项目");
  await user.type(screen.getByLabelText("新项目编号"), "P-2026-01");
  await user.type(screen.getByLabelText("新项目经办人"), "测试经办人");
  await user.click(screen.getByRole("button", { name: "建立项目" }));
  await screen.findByRole("heading", { name: "储气库项目" });
  expect(
    screen.queryByRole("navigation", { name: "填报记录" }),
  ).not.toBeInTheDocument();
  const nav = screen.getByRole("navigation", { name: "项目阶段" });
  for (const label of stageNames)
    expect(
      within(nav).getByRole("button", { name: new RegExp(label) }),
    ).toBeInTheDocument();
  await user.click(within(nav).getByRole("button", { name: /上报计划/ }));
  await screen.findByRole("heading", { name: "材料清单 1" });
  expect(screen.getByText(/统一模板待补充/)).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "填写谈判材料" }),
  ).not.toBeInTheDocument();
  const upload = screen.getByLabelText("上传阶段材料");
  await user.click(screen.getByRole("button", { name: "上传上报计划材料" }));
  await user.upload(
    upload,
    new File(["v1"], "计划材料.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
  );
  await screen.findByText(/1 份文件.*最新/);
  await user.click(screen.getByRole("button", { name: "上传上报计划材料" }));
  await user.upload(
    upload,
    new File(["v2"], "计划材料.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
  );
  await user.click(await screen.findByText(/2 份文件.*最新/));
  expect(screen.getByText("V2 · 计划材料.docx")).toBeInTheDocument();
  expect(screen.getByText("V1 · 计划材料.docx")).toBeInTheDocument();
  await user.click(screen.getAllByRole("button", { name: "预览" })[0]);
  await screen.findByRole("dialog", { name: "计划材料.docx" });
  await waitFor(() =>
    expect(
      hostFetch.mock.calls.some(([url]) => url === "/workspace/convert-office"),
    ).toBe(true),
  );
  await user.click(screen.getByRole("button", { name: "关闭预览" }));
  await user.click(screen.getByRole("button", { name: "编辑上报计划材料" }));
  await user.selectOptions(screen.getByLabelText("材料状态"), "done");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "保存材料信息" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await user.click(screen.getByRole("button", { name: "办理信息与状态" }));
  await user.selectOptions(screen.getByLabelText("阶段状态"), "completed");
  await user.type(screen.getByLabelText("办理系统"), "计划管理系统");
  await user.type(
    screen.getByLabelText("系统地址"),
    "https://example.com/plan",
  );
  await user.type(screen.getByLabelText("提交编号"), "PLAN-001");
  await user.type(screen.getByLabelText("办理说明"), "已取得计划批复");
  expect(screen.getByRole("button", { name: "保存办理信息" })).toBeDisabled();
  expect(
    calls.some(
      (call) =>
        call.url.endsWith("/stages/plan") && call.body.status === "completed",
    ),
  ).toBe(false);
  await user.click(screen.getByLabelText("确认本阶段已办结"));
  await user.click(screen.getByRole("button", { name: "保存办理信息" }));
  await screen.findByRole("link", { name: "计划管理系统 ↗" });
  expect(screen.getByText("PLAN-001")).toBeInTheDocument();
  expect(
    calls.find((call) => call.url.endsWith("/stages/plan"))?.body.confirmed,
  ).toBe(true);
  await user.click(screen.getByRole("button", { name: "下载本阶段材料" }));
  await waitFor(() => expect(downloads).toContain("储气库项目_上报计划.zip"));
  expect(calls.some((call) => call.url.endsWith("/bundle?stage_id=plan"))).toBe(
    true,
  );
}, 30000);

it("opens the response review agent only in negotiation and starts with explicitly selected project files", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  let record: any = null;
  let attempts = 0;
  const submissions: FormData[] = [];
  const downloads: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    downloads.push(this.download);
  });
  vi.stubGlobal(
    "URL",
    Object.assign(class extends URL {}, {
      createObjectURL: () => "blob:review",
      revokeObjectURL: vi.fn(),
    }),
  );
  const api = formProjectApi(() => ({
    id: "case-review",
    name: "测试项目",
    fields: [],
    generations: [],
    updated_at: "2026-10-22T10:00:00Z",
  }));
  const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
    const result = api(url, init);
    if (result) return result;
    if (url.endsWith("/response-reviews") && init?.method === "POST") {
      submissions.push(init.body as FormData);
      attempts++;
      if (attempts === 1)
        return new Response(
          JSON.stringify({ detail: "暂时无法启动，请重试" }),
          { status: 503 },
        );
      record = {
        id: "review-1",
        project_revision: 1,
        created_at: "2026-10-22T10:00:00Z",
        status: "completed",
        report: "甲单位：请核对报价含税口径，见响应文件第 2 节。",
        focus: "报价与资质",
        files: [
          { name: "正式谈判文件.docx", role: "谈判文件" },
          { name: "甲单位响应.pdf", role: "响应材料" },
        ],
      };
      return reply(record);
    }
    if (url.endsWith("/response-reviews"))
      return reply({
        references: [
          { id: "case-1:gen-1:0", label: "正式谈判文件.docx · 2026-10-22" },
        ],
        records: record ? [record] : [],
      });
    if (url.endsWith("/report")) return new Response("核查记录");
    throw new Error("Unexpected review request: " + url);
  });
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      registerRoutes: (_id: string, routes: any[]) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    new Function(
      "window",
      "URL",
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "../plugins/apps/document-forms/ui/index.js",
        ),
        "utf8",
      ),
    )(window, URL);
  });
  renderWithProviders(<Page />);
  const nav = await screen.findByRole("navigation", { name: "项目阶段" });
  await user.click(within(nav).getByRole("button", { name: /上报计划/ }));
  expect(
    screen.queryByRole("button", { name: /打开核查智能体/ }),
  ).not.toBeInTheDocument();
  await user.click(within(nav).getByRole("button", { name: /商务谈判/ }));
  await user.click(screen.getByRole("button", { name: /打开核查智能体/ }));
  let dialog = await screen.findByRole("dialog", { name: "响应文件核查" });
  await within(dialog).findByLabelText("核查依据");
  expect(submissions).toHaveLength(0);
  expect(
    within(dialog).getByRole("button", { name: "开始核查" }),
  ).toBeDisabled();
  await user.selectOptions(
    within(dialog).getByLabelText("核查依据"),
    "case-1:gen-1:0",
  );
  expect(
    within(dialog).queryByLabelText("上传核查依据"),
  ).not.toBeInTheDocument();
  await user.upload(
    within(dialog).getByLabelText("上传响应材料"),
    new File(["response"], "甲单位响应.pdf", { type: "application/pdf" }),
  );
  await user.type(
    within(dialog).getByLabelText("补充核查关注点"),
    "报价与资质",
  );
  // JSDOM does not update native required-file validity after user.upload.
  // Submit the actual mounted form after checking its enabled entry button.
  expect(
    within(dialog).getByRole("button", { name: "开始核查" }),
  ).toBeEnabled();
  fireEvent.submit(
    within(dialog).getByRole("button", { name: "开始核查" }).closest("form")!,
  );
  await within(dialog).findByText("暂时无法启动，请重试");
  fireEvent.submit(
    within(dialog).getByRole("button", { name: "开始核查" }).closest("form")!,
  );
  await within(dialog).findByText(/甲单位：请核对报价含税口径/);
  expect(submissions).toHaveLength(2);
  expect(submissions[1].get("reference_id")).toBe("case-1:gen-1:0");
  expect((submissions[1].getAll("responses")[0] as File).name).toBe(
    "甲单位响应.pdf",
  );
  expect(submissions[1].get("focus")).toBe("报价与资质");
  await user.click(
    within(dialog).getByRole("button", { name: "下载核查记录" }),
  );
  expect(downloads).toContain("测试项目_响应文件核查记录_review-1.md");
  await user.click(
    within(dialog).getByRole("button", { name: "关闭响应文件核查" }),
  );
  await user.click(
    await screen.findByRole("button", { name: /打开核查智能体/ }),
  );
  dialog = await screen.findByRole("dialog", { name: "响应文件核查" });
  await within(dialog).findByText(/甲单位：请核对报价含税口径/);
  expect(submissions).toHaveLength(2);
}, 30000);

it("reviews shared project differences before selectively updating a stage form and protects unsaved edits", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  let state: any = {
    id: "case-shared",
    name: "谈判资料",
    revision: 1,
    updated_at: "2026-10-22T10:00:00Z",
    fields: [
      {
        key: "project.name",
        label: "项目名称",
        kind: "text",
        group: "项目资料",
        value: "旧项目名称",
        required: true,
      },
      {
        key: "research.contents",
        label: "研究内容",
        kind: "textarea",
        group: "研究内容",
        value: "原有研究内容",
        required: true,
      },
    ],
    recipients: [],
    templates: [],
    generations: [],
    document_values: {},
  };
  const common = [
    { ...state.fields[0], value: "项目统一名称" },
    { ...state.fields[1], value: "项目统一研究内容" },
  ];
  const project = () => ({
    id: "p-shared",
    name: "项目统一名称",
    code: "P1",
    owner: "经办人",
    revision: 1,
    fields: common,
    forms: [
      {
        case_id: state.id,
        name: state.name,
        stage_id: "negotiation",
        outputs: 0,
        revision: state.revision,
        shared_changes: ["project.name", "research.contents"],
        generations: [],
        updated_at: state.updated_at,
      },
    ],
    stages: stageIds.map((id, i) => ({
      id,
      title: stageNames[i],
      purpose: "材料",
      status: "in_progress",
      materials: [],
      upstream_changed: [],
      missing_required: [],
      notes: "",
      system_url: "",
      system_name: "",
      submission_ref: "",
      due_date: "",
    })),
  });
  const calls: Array<{ url: string; body: any }> = [];
  const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : null;
    calls.push({ url, body });
    if (url === "/document-forms/projects")
      return reply([
        {
          id: "p-shared",
          name: "项目统一名称",
          code: "P1",
          completed: 0,
          forms: 1,
        },
      ]);
    if (url === "/document-forms/projects/p-shared") return reply(project());
    if (url.endsWith("/case-shared/sync")) {
      expect(body.keys).toEqual(["project.name"]);
      expect(body.case_revision).toBe(2);
      state = {
        ...state,
        revision: state.revision + 1,
        fields: state.fields.map((f: any) =>
          body.keys.includes(f.key)
            ? { ...f, value: common.find((p) => p.key === f.key)!.value }
            : f,
        ),
      };
      return reply(state);
    }
    if (url === "/document-forms/cases/case-shared") {
      if (init?.method === "PUT")
        state = {
          ...state,
          revision: state.revision + 1,
          fields: state.fields.map((f: any) => ({
            ...f,
            value: body.values[f.key],
          })),
        };
      return reply(state);
    }
    throw new Error("Unexpected shared request: " + url);
  });
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {},
      registerRoutes: (_id: string, routes: any[]) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    new Function(
      "window",
      "URL",
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "../plugins/apps/document-forms/ui/index.js",
        ),
        "utf8",
      ),
    )(window, URL);
  });
  renderWithProviders(<Page />);
  await user.click(
    await screen.findByRole("button", { name: /^03.*商务谈判/ }),
  );
  await user.click(screen.getByRole("button", { name: "打开表单" }));
  const name = await screen.findByLabelText("项目名称");
  await user.clear(name);
  await user.type(name, "用户未保存的名称");
  await user.click(screen.getByRole("button", { name: /^05.*结题验收/ }));
  expect(confirm).toHaveBeenCalled();
  expect(name).toHaveValue("用户未保存的名称");
  await user.click(screen.getByRole("button", { name: "核对项目资料差异" }));
  const dialog = screen.getByRole("dialog", { name: "核对共用资料" });
  expect(within(dialog).getByText("用户未保存的名称")).toBeInTheDocument();
  expect(within(dialog).getByText("项目统一名称")).toBeInTheDocument();
  expect(
    within(dialog).getByRole("button", { name: "采用所选项目资料" }),
  ).toBeDisabled();
  expect(calls.some((call) => call.url.endsWith("/sync"))).toBe(false);
  await user.click(within(dialog).getByRole("checkbox", { name: /^项目名称/ }));
  await user.click(
    within(dialog).getByRole("button", { name: "采用所选项目资料" }),
  );
  await screen.findByText("所选资料已同步，请重新核对后生成新版文书。");
  expect(screen.getByLabelText("项目名称")).toHaveValue("项目统一名称");
  expect(screen.getByLabelText("研究内容")).toHaveValue("原有研究内容");
  expect(calls.filter((call) => call.url.endsWith("/sync"))).toHaveLength(1);
}, 30000);

it("automatically loads the five bundled templates and downloads their blank Excel kit", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  const appRoot = path.resolve(process.cwd(), "../plugins/apps/document-forms");
  const fields = JSON.parse(
    fs.readFileSync(path.join(appRoot, "templates/variables.json"), "utf8"),
  );
  const entries = JSON.parse(
    fs.readFileSync(path.join(appRoot, "templates/index.json"), "utf8"),
  );
  const state = {
    id: "bundled-case",
    name: "新填报",
    revision: 1,
    updated_at: "2026-10-22T00:00:00Z",
    fields: fields.map((field: any) => ({ ...field, value: "" })),
    recipients: [{ name: "", start: "", end: "" }],
    rules: [],
    generations: [],
    templates: entries.map((entry: any, index: number) => ({
      ...entry,
      id: `builtin-${index}`,
      from_default: true,
      from_builtin: true,
      per_recipient: index === 1 || index === 2,
      keys: ["project.name"],
    })),
  };
  const projectApi = formProjectApi(() => state);
  const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
    const managed = projectApi(url, init);
    if (managed) return managed;
    if (url === "/document-forms/starter")
      return new Response("PK-standard-kit", {
        headers: { "Content-Type": "application/zip" },
      });
    if (url === "/document-forms/cases")
      return new Response(
        JSON.stringify(init?.method === "POST" ? state : []),
        { headers: { "Content-Type": "application/json" } },
      );
    throw new Error("Unexpected request: " + url);
  });
  const downloads: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    downloads.push(this.download);
  });
  vi.stubGlobal(
    "URL",
    Object.assign(class extends URL {}, {
      createObjectURL: () => "blob:standard-kit",
      revokeObjectURL: vi.fn(),
    }),
  );
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {},
      registerRoutes: (_id: string, routes: any[]) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    new Function(
      "window",
      "URL",
      fs.readFileSync(path.join(appRoot, "ui/index.js"), "utf8"),
    )(window, URL);
  });
  renderWithProviders(<Page />);
  await user.click(screen.getByRole("button", { name: /下载配套模板/ }));
  await waitFor(() => expect(downloads).toEqual(["文书填报_配套模板.zip"]));
  await user.click(
    await screen.findByRole("button", { name: /^03.*商务谈判/ }),
  );
  await user.upload(
    screen.getByLabelText("导入阶段 Excel"),
    new File(["xlsx"], "配套.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  await screen.findByLabelText("项目名称");
  for (const entry of entries)
    expect(screen.getByText(entry.name)).toBeInTheDocument();
  expect(screen.getAllByText("应用自带模板")).toHaveLength(5);
  expect(screen.getByLabelText("项目背景").tagName).toBe("TEXTAREA");
  expect(screen.getByLabelText("项目名称")).toHaveValue("");
  expect(
    screen.getByText("已读取变量配置，并载入默认 Word 模板。"),
  ).toBeInTheDocument();
  expect(hostFetch.mock.calls.some(([url]) => url.endsWith("/defaults"))).toBe(
    false,
  );
});

describe.each(["embedded", "compatible"])(
  "UGSci document forms packaged page (%s)",
  (previewMode) => {
    it("imports Excel, edits the real form, requires review and confirmation, then previews generated Word with the host Office component", async () => {
      const user = userEvent.setup();
      let Page: React.ComponentType = () => null;
      let state: any = {
        id: "case-1",
        name: "商务文书",
        revision: 1,
        updated_at: "2026-10-18T08:00:00Z",
        fields: [
          {
            key: "project.name",
            label: "项目名称",
            value: "原项目",
            group: "项目资料",
            kind: "text",
            required: true,
          },
          {
            key: "research.contents",
            label: "研究内容（整段）",
            value: "第一项\n第二项",
            group: "研究内容",
            kind: "text",
            required: true,
          },
          {
            key: "dates.issue",
            label: "落款日期",
            value: "2026-09-30",
            group: "日期安排",
            kind: "date",
            required: true,
          },
          {
            key: "events.negotiation_time",
            label: "谈判时段",
            value: "2026-10-22 14:30 ~ 2026-10-22 17:30",
            group: "日期安排",
            kind: "text",
            required: true,
          },
        ],
        document_values: {
          "dates.issue": "2026年9月30日",
          "events.negotiation_time": "2026年10月22日下午14:30至17:30",
        },
        recipients: [
          {
            name: "甲单位",
            start: "2026-11-02T09:00",
            end: "2026-11-02T12:00",
          },
        ],
        templates: [],
        generations: [],
        rules: [],
      };
      const calls: Array<{ url: string; body: any }> = [];
      let zipFails = false;
      const downloadClicks: Array<{ name: string; attached: boolean }> = [];
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
        function (this: HTMLAnchorElement) {
          downloadClicks.push({
            name: this.download,
            attached: this.isConnected,
          });
        },
      );
      const projectApi = formProjectApi(() => state);
      const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
        let result: any;
        const body =
          typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
        calls.push({ url, body });
        const managed = projectApi(url, init);
        if (managed) return managed;
        if (url.includes("/outputs/"))
          return new Response(zipFails ? "unavailable" : "PK-test-bundle", {
            status: zipFails ? 503 : 200,
            headers: { "Content-Type": "application/zip" },
          });
        if (url.includes("/print/")) {
          if (url.endsWith("?pages=true"))
            return new Response(JSON.stringify({ pages: 2 }), {
              headers: { "Content-Type": "application/json" },
            });
          return new Response(Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10), {
            headers: { "Content-Type": "image/png", "X-Total-Pages": "2" },
          });
        }
        if (url === "/workspace/convert-office")
          result = {
            engine: "officecli",
            html: "<html><body>新项目 · 甲单位</body></html>",
          };
        else if (url.endsWith("/cases") && !init?.method) result = [];
        else if (url.endsWith("/cases") && init?.method === "POST")
          result = state;
        else if (url.endsWith("/templates")) {
          expect((body as FormData).getAll("files")).toHaveLength(2);
          state = {
            ...state,
            revision: state.revision + 1,
            templates: [
              {
                id: "t1",
                name: "01_谈判邀请函_模板.docx",
                keys: ["project.name", "invitation.recipient"],
                per_recipient: true,
              },
              {
                id: "t2",
                name: "02_综合评分表_模板.docx",
                keys: ["project.name", "participant_groups"],
                per_recipient: false,
                print_copies: 7,
                print_note: "每位专家一份，得分及签字现场填写",
              },
            ],
          };
          result = state;
        } else if (url.endsWith("/defaults"))
          result = { count: state.templates.length };
        else if (init?.method === "PUT") {
          state = {
            ...state,
            name: body.name,
            revision: state.revision + 1,
            fields: state.fields.map((f: any) => ({
              ...f,
              value: body.values[f.key],
            })),
            recipients: body.recipients,
          };
          result = state;
        } else if (url.endsWith("/review"))
          result = {
            can_generate: true,
            checks: [],
            review_token: "review-1",
            revision: state.revision,
          };
        else if (url.endsWith("/generate")) {
          expect(body.confirmed).toBe(true);
          expect(body.review_token).toBe("review-1");
          state = {
            ...state,
            generations: [
              {
                id: "g1",
                revision: state.revision,
                created_at: "2026-10-18T08:05:00Z",
                bundle_name: "新项目_谈判材料_20261018_160500_abcdef.zip",
                files: [
                  {
                    name: "01_谈判邀请函_新项目_01_甲单位.docx",
                    recipient: "甲单位",
                    size: 42000,
                    preview_url: "/api/files/preview/output.docx",
                  },
                  {
                    name: "02_综合评分表_新项目.docx",
                    recipient: "共用文件",
                    size: 42000,
                    print_copies: 7,
                    print_note: "每位专家一份，得分及签字现场填写",
                    preview_url: "/api/files/preview/score.docx",
                  },
                ],
              },
            ],
          };
          state.generations.push({
            ...state.generations[0],
            id: "g0",
            revision: 0,
            created_at: "2026-10-17T08:05:00Z",
            bundle_name: "新项目_历史批次.zip",
            files: [
              { ...state.generations[0].files[0], name: "旧版邀请函.docx" },
            ],
          });
          result = state;
        } else throw new Error("Unexpected request: " + url);
        return new Response(JSON.stringify(structuredClone(result)), {
          headers: { "Content-Type": "application/json" },
        });
      });
      const converter = vi.fn(async (url: string) =>
        url.endsWith("/office-screenshot")
          ? new Response("", { status: 404 })
          : new Response(
              JSON.stringify({
                engine: "officecli",
                html: "<html><body>新项目 · 甲单位</body></html>",
              }),
            ),
      );
      vi.stubGlobal("fetch", converter);
      const createUrl = vi.fn(() => "blob:print-pages");
      const revokeUrl = vi.fn();
      vi.stubGlobal(
        "URL",
        Object.assign(class extends URL {}, {
          createObjectURL: createUrl,
          revokeObjectURL: revokeUrl,
        }),
      );
      Object.defineProperty(window, "QwenPaw", {
        configurable: true,
        value: {
          host: {
            React,
            fetch: hostFetch,
            useTheme: () => "light",
            useSelectedAgent: () => ({ id: "default" }),
            getSelectedAgentId: () => "default",
          },
          workspace:
            previewMode === "embedded" ? createWorkspaceNamespace() : {},
          registerRoutes: (_id: string, routes: any[]) => {
            Page = routes[0].component;
          },
        },
      });
      await act(async () => {
        new Function(
          "window",
          "URL",
          fs.readFileSync(
            path.resolve(
              process.cwd(),
              "../plugins/apps/document-forms/ui/index.js",
            ),
            "utf8",
          ),
        )(window, URL);
      });
      renderWithProviders(<Page />);
      await user.click(
        await screen.findByRole("button", { name: /^03.*商务谈判/ }),
      );
      expect(
        screen.getByText(
          "五份标准模板已接入，可直接填写，也可导入现有 Excel。",
        ),
      ).toBeInTheDocument();
      await user.upload(
        screen.getByLabelText("导入阶段 Excel"),
        new File(["xlsx"], "变量表.xlsx", {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      await screen.findByLabelText("项目名称");
      expect(screen.getByLabelText("落款日期")).toHaveValue("2026-09-30");
      expect(screen.getByLabelText("谈判时段")).toHaveValue(
        "2026年10月22日下午14:30至17:30",
      );
      const paragraphs = screen.getByRole("textbox", {
        name: "研究内容（整段）",
      });
      expect(paragraphs.tagName).toBe("TEXTAREA");
      expect(paragraphs).toHaveValue("第一项\n第二项");
      expect(paragraphs).toHaveAttribute("rows", "3");
      await user.type(paragraphs, "\n第三项");
      await user.click(screen.getByRole("button", { name: "＋ 添加单位" }));
      await user.click(screen.getByRole("button", { name: "＋ 添加单位" }));
      expect(screen.getByLabelText("第2家领取开始时间")).toHaveValue(
        "2026-11-02T09:00",
      );
      expect(screen.getByLabelText("第3家领取结束时间")).toHaveValue(
        "2026-11-02T12:00",
      );
      fireEvent.change(screen.getByLabelText("第2家领取开始时间"), {
        target: { value: "2026-11-02T10:00" },
      });
      fireEvent.change(screen.getByLabelText("第1家领取开始时间"), {
        target: { value: "2026-11-02T09:30" },
      });
      fireEvent.change(screen.getByLabelText("第1家领取结束时间"), {
        target: { value: "2026-11-02T13:00" },
      });
      expect(screen.getByLabelText("第2家领取开始时间")).toHaveValue(
        "2026-11-02T10:00",
      );
      expect(screen.getByLabelText("第2家领取结束时间")).toHaveValue(
        "2026-11-02T13:00",
      );
      expect(screen.getByLabelText("第3家领取开始时间")).toHaveValue(
        "2026-11-02T09:30",
      );
      await user.click(
        screen.getByRole("button", { name: "第2家领取开始时间恢复跟随" }),
      );
      expect(screen.getByLabelText("第2家领取开始时间")).toHaveValue(
        "2026-11-02T09:30",
      );
      fireEvent.change(screen.getByLabelText("第2家领取结束时间"), {
        target: { value: "" },
      });
      fireEvent.change(screen.getByLabelText("第1家领取结束时间"), {
        target: { value: "2026-11-02T14:00" },
      });
      expect(screen.getByLabelText("第2家领取结束时间")).toHaveValue("");
      expect(screen.getByLabelText("第3家领取结束时间")).toHaveValue(
        "2026-11-02T14:00",
      );
      await user.upload(screen.getByLabelText("导入 Word 模板"), [
        new File(["docx"], "邀请函.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        new File(["docx"], "综合评分打分表.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      ]);
      await screen.findByText("按受邀单位分别生成");
      expect(screen.getByText("02_综合评分表_模板.docx")).toBeInTheDocument();
      expect(
        screen.getByText(/建议打印 7 份 · 每位专家一份/),
      ).toBeInTheDocument();
      expect(state.recipients[1].follow_start).toBe(true);
      expect(state.recipients[1].follow_end).toBe(false);
      await user.click(screen.getByRole("button", { name: "设为默认模板" }));
      await screen.findByText("已设为本机默认模板，以后新建填报会自动载入。");
      await user.click(screen.getByRole("button", { name: "移除第3家单位" }));
      await user.click(screen.getByRole("button", { name: "移除第2家单位" }));
      const generationFooter = screen.getByRole("region", {
        name: "核对与生成",
      });
      expect(generationFooter.parentElement?.lastElementChild).toBe(
        generationFooter,
      );
      expect(generationFooter).toContainElement(
        screen.getByRole("button", { name: "核对填写内容 →" }),
      );
      expect(
        screen
          .getByRole("region", { name: "Word 模板" })
          .compareDocumentPosition(generationFooter) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      await user.clear(screen.getByLabelText("项目名称"));
      await user.type(screen.getByLabelText("项目名称"), "新项目");
      await user.click(screen.getByRole("button", { name: "核对填写内容 →" }));
      await screen.findByText("资料已齐备，请确认本次内容。");
      expect(
        screen.getByRole("button", { name: "确认并生成 2 份文书" }),
      ).toBeDisabled();
      expect(calls.filter((c) => c.url.endsWith("/generate"))).toHaveLength(0);
      expect(state.fields[0].value).toBe("新项目");
      expect(state.fields[1].value).toBe("第一项\n第二项\n第三项");
      expect(state.fields[3].value).toBe("2026-10-22 14:30 ~ 2026-10-22 17:30");
      expect(screen.getByText("2026年9月30日")).toBeInTheDocument();
      expect(
        screen.getByText("2026年10月22日下午14:30至17:30"),
      ).toBeInTheDocument();
      await user.click(screen.getByRole("checkbox"));
      await user.click(
        screen.getByRole("button", { name: "确认并生成 2 份文书" }),
      );
      await screen.findByText("2 份文件已生成");
      expect(
        screen.getByText(/共用文件 · 41 KB · 建议打印 7 份/),
      ).toBeInTheDocument();
      await waitFor(
        () => {
          const feedback = screen.queryByRole("alert")?.textContent;
          expect(
            createUrl,
            feedback || "Native print pages must finish loading",
          ).toHaveBeenCalled();
          expect(screen.getAllByRole("img", { name: /打印版式/ })).toHaveLength(
            2,
          );
          for (const image of screen.getAllByRole("img", { name: /打印版式/ }))
            expect(image).toHaveAttribute("src", "blob:print-pages");
        },
        { timeout: 10000 },
      );
      expect(screen.getByText("共 2 页")).toBeInTheDocument();
      await user.selectOptions(screen.getByLabelText("预览比例"), "150");
      expect(
        screen.getByText("第 1 页").parentElement?.parentElement,
      ).toHaveStyle({
        width: "150%",
      });
      expect(screen.getByText("第 2 页")).toBeInTheDocument();
      expect(calls.some((call) => call.url.endsWith("?page=1"))).toBe(true);
      expect(calls.some((call) => call.url.endsWith("?page=2"))).toBe(true);
      expect(calls.some((call) => call.url.includes("/print/g1/"))).toBe(true);
      await user.click(screen.getByRole("button", { name: "文字预览" }));
      await waitFor(
        () =>
          expect(
            screen.getByTitle("01_谈判邀请函_新项目_01_甲单位.docx"),
          ).toHaveAttribute(
            "srcdoc",
            expect.stringContaining("新项目 · 甲单位"),
          ),
        { timeout: 10000 },
      );
      expect(
        previewMode === "embedded" ? converter : hostFetch,
      ).toHaveBeenCalledWith(
        previewMode === "embedded"
          ? "/api/workspace/convert-office"
          : "/workspace/convert-office",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("/api/files/preview/output.docx"),
        }),
      );
      await user.click(screen.getByRole("button", { name: /02\s*填写资料/ }));
      await user.type(screen.getByLabelText("项目名称"), "（修改）");
      await user.click(screen.getByRole("button", { name: /04\s*文件预览/ }));
      expect(screen.getByText(/填写内容已有修改/)).toBeInTheDocument();
      expect(createUrl).toHaveBeenCalled();
      expect(revokeUrl).toHaveBeenCalledWith("blob:print-pages");
      const generationCount = calls.filter((call) =>
        call.url.endsWith("/generate"),
      ).length;
      expect(
        screen.queryByRole("region", { name: "整套文书下载" }),
      ).not.toBeInTheDocument();
      const latestBundle = () =>
        screen.getByRole("button", {
          name: new RegExp(`打包下载.*修订 ${state.generations[0].revision}$`),
        });
      for (const button of screen.getAllByRole("button", {
        name: /^打包下载 /,
      })) {
        expect(button.closest(".df-generation-heading")).not.toBeNull();
        expect(button).toHaveTextContent("打包下载");
      }
      await user.click(latestBundle());
      await screen.findByText("已开始下载该批次的 2 份文书压缩包。");
      expect(downloadClicks[downloadClicks.length - 1]).toEqual({
        name: "新项目_谈判材料_20261018_160500_abcdef.zip",
        attached: true,
      });
      expect(calls[calls.length - 1]?.url).toBe(
        "/document-forms/cases/case-1/outputs/g1/" +
          encodeURIComponent("全部文书.zip"),
      );
      await user.click(
        screen.getByRole("button", { name: /打包下载.*修订 0$/ }),
      );
      await screen.findByText("已开始下载该批次的 1 份文书压缩包。");
      expect(downloadClicks[downloadClicks.length - 1]?.name).toBe(
        "新项目_历史批次.zip",
      );
      expect(calls[calls.length - 1]?.url).toBe(
        "/document-forms/cases/case-1/outputs/g0/" +
          encodeURIComponent("全部文书.zip"),
      );
      zipFails = true;
      await user.click(latestBundle());
      await screen.findByText("文件下载失败，请稍后重试");
      expect(downloadClicks).toHaveLength(2);
      zipFails = false;
      await user.click(latestBundle());
      await screen.findByText("已开始下载该批次的 2 份文书压缩包。");
      expect(downloadClicks).toHaveLength(3);
      expect(
        calls.filter((call) => call.url.endsWith("/generate")),
      ).toHaveLength(generationCount);
    });
  },
);
