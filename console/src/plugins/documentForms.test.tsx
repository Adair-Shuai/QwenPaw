import type { RendererContext } from "@/components/Workspace/types";

type FormFieldFixture = {
  key: string;
  value?: unknown;
  linked_template?: string;
  [key: string]: unknown;
};
type FormRecipientFixture = {
  name: string;
  start?: string;
  end?: string;
  [key: string]: unknown;
};
type FormProjectSummary = {
  id: string;
  name: string;
  revision?: number;
  updated_at?: string;
  fields: FormFieldFixture[];
  generations?: unknown[];
  [key: string]: unknown;
};
type FormGenerationFixture = {
  files: Array<{ name: string; [key: string]: unknown }>;
  [key: string]: unknown;
};
type FormCaseFixture = FormProjectSummary & {
  revision: number;
  generations: FormGenerationFixture[];
  recipients: FormRecipientFixture[];
  templates: unknown[];
};
type FormSaveFixture = {
  values: Record<string, unknown>;
  recipients?: FormRecipientFixture[];
  [key: string]: unknown;
};
type MaterialFileFixture = {
  id: string;
  name: string;
  size: number;
  uploaded_at: string;
  mime?: string;
  preview_url?: string;
  approval_review?: {
    status: string;
    approved_at: string;
    fields: Array<{
      key: string;
      label: string;
      current: unknown;
      value: unknown;
      changed: boolean;
    }>;
    change_count: number;
  };
};
type FormProjectFixture = {
  id: string;
  name: string;
  revision: number;
  fields: FormFieldFixture[];
  forms: unknown[];
  stages: Array<{
    id: string;
    materials: Array<{
      id: string;
      files: MaterialFileFixture[];
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

import fs from "node:fs";
import path from "node:path";
import React from "react";
import ReactDOM from "react-dom";
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

function detachedFormStyles() {
  return Array.from(document.styleSheets)
    .map((sheet) => sheet.ownerNode)
    .filter(
      (owner): owner is HTMLStyleElement =>
        owner instanceof HTMLStyleElement &&
        owner.parentElement?.classList.contains("df-app") === true &&
        !document.contains(owner),
    );
}

afterEach(() => {
  cleanup();
  // jsdom 29 can retain a sheet when React removes its styled ancestor.
  // Reattach only detached form-owned styles, then remove each owner directly
  // so jsdom unregisters it. The mounted page keeps its real CSS throughout.
  for (const owner of detachedFormStyles()) {
    document.head.append(owner);
    owner.remove();
  }
  expect(
    Array.from(document.styleSheets).every(
      (sheet) => !sheet.ownerNode || document.contains(sheet.ownerNode),
    ),
  ).toBe(true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "QwenPaw");
});

const stageNames = [
  "上报计划",
  "选商论证",
  "商务谈判",
  "开题论证",
  "合同审查",
  "结题验收",
  "归档付款",
];
const stageIds = [
  "plan",
  "selection",
  "negotiation",
  "kickoff",
  "contract",
  "acceptance",
  "payment",
];
const reply = (value: unknown) =>
  new Response(JSON.stringify(structuredClone(value)), {
    headers: { "Content-Type": "application/json" },
  });

// Compile the shipped bundle once, then execute it against each test's fresh
// host. Recompiling identical dynamic scripts per case makes V8 coverage retain
// a separate instrumented bundle for every page registration.
const registerPackedDocumentForms = new Function(
  "window",
  "URL",
  fs.readFileSync(
    path.resolve(process.cwd(), "../plugins/apps/document-forms/ui/index.js"),
    "utf8",
  ),
);

async function exerciseWorkflowTabs(
  stageId: string,
  exerciseToolbar = false,
  exerciseReturn = false,
) {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  const state = {
    id: "tabbed-form",
    name: "流程表单",
    revision: 1,
    stage_id: stageId,
    plan_schema: 1,
    selection_schema: 1,
    updated_at: "2026-10-31T10:00:00Z",
    fields: [
      {
        key: "step.first",
        label: "流程字段一",
        group: "第一项",
        kind: "text",
        value: "初始内容",
        required: true,
        help: "填写当前阶段的第一项内容，其他标签页的草稿会保留。",
      },
      {
        key: "step.second",
        label: "流程字段二",
        group: "第二项",
        kind: "textarea",
        value: "",
        required: true,
      },
      {
        key: "project.name",
        label: "共用项目名称",
        group: "共用资料",
        kind: "text",
        value: "标签页测试项目",
        scope: "shared",
      },
    ],
    recipients: [],
    generations: [],
    rules: [],
    document_values: {},
    templates: [
      { id: "t1", name: "阶段模板.docx", keys: [], per_recipient: false },
    ],
  };
  const material = {
    id: "approval",
    name: "审批回执",
    required: false,
    status: "pending",
    note: "",
    files: [] as MaterialFileFixture[],
  };
  const project = {
    id: "tabs-project",
    name: "标签页测试项目",
    revision: 1,
    code: "TAB",
    single_form: true,
    form_id: state.id,
    fields: [],
    forms: [],
    stages: stageIds.map((id, index) => ({
      id,
      title: stageNames[index],
      status: "pending",
      purpose: "阶段材料",
      materials: id === stageId ? [material] : [],
      upstream_changed: [],
      missing_required: [],
      notes: "",
      due_date: "",
      system_url: "",
      system_name: "",
      submission_ref: "",
    })),
  };
  const saves: FormSaveFixture[] = [];
  const downloads: string[] = [];
  const createToolbarUrl = vi.fn((_blob: Blob) => {
    void _blob;
    return "blob:toolbar-download";
  });
  const excelImports: FormData[] = [];
  const templateImports: File[][] = [];
  const defaultRevisions: number[] = [];
  let exportFails = exerciseToolbar;
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    downloads.push(this.download);
  });
  vi.stubGlobal(
    "URL",
    Object.assign(class extends URL {}, {
      createObjectURL: createToolbarUrl,
      revokeObjectURL: vi.fn(),
    }),
  );
  let failSave = true;
  const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/document-forms/projects") return reply([project]);
    if (url === "/document-forms/projects/tabs-project") return reply(project);
    if (url.endsWith("/assistant")) return reply({ messages: [] });
    if (url.endsWith("/form")) return reply(state);
    if (url.endsWith("/materials/approval/files")) {
      const file = (init?.body as FormData).get("file") as File;
      material.files.push({
        id: "uploaded",
        name: file.name,
        size: file.size,
        uploaded_at: state.updated_at,
      });
      project.revision++;
      return reply(project);
    }
    if (url === "/document-forms/starter") return new Response("template-kit");
    if (url.endsWith("/excel")) {
      if (exportFails) {
        exportFails = false;
        return new Response("retry", { status: 503 });
      }
      return new Response("saved-excel-data");
    }
    if (url.endsWith("/form/import")) {
      const data = init?.body as FormData;
      expect(data.get("stage_id")).toBe(stageId);
      expect(String(data.get("revision"))).toBe(String(project.revision));
      excelImports.push(data);
      state.fields[0].value = "Excel 导入内容";
      state.fields[1].value = "Excel 完整内容";
      state.revision++;
      return reply(state);
    }
    if (url === "/document-forms/cases/tabbed-form/templates") {
      const data = init?.body as FormData;
      const files = data.getAll("files") as File[];
      templateImports.push(files);
      state.templates.push(
        ...files.map((file, index) => ({
          id: "imported-" + index,
          name: file.name,
          keys: [],
          per_recipient: false,
        })),
      );
      state.revision++;
      return reply(state);
    }
    if (url.includes("/templates/") && init?.method === "DELETE") {
      const id = url.split("/templates/")[1].split("?")[0];
      state.templates = state.templates.filter((item) => item.id !== id);
      state.revision++;
      return reply(state);
    }
    if (url.endsWith("/defaults")) {
      const data = JSON.parse(String(init?.body));
      expect(data.revision).toBe(state.revision);
      defaultRevisions.push(data.revision);
      return reply({ ok: true });
    }
    if (url.endsWith("/defaults/apply")) {
      state.templates = [
        {
          id: "restored",
          name: "恢复的默认模板.docx",
          keys: [],
          per_recipient: false,
        },
      ];
      state.revision++;
      return reply(state);
    }
    if (url === "/document-forms/cases/tabbed-form") {
      if (init?.method === "PUT") {
        const body = JSON.parse(String(init.body));
        saves.push(body);
        state.name = body.name;
        if (failSave) {
          failSave = false;
          return new Response(JSON.stringify({ detail: "保存失败，请重试" }), {
            status: 503,
          });
        }
        state.fields = state.fields.map((field) => ({
          ...field,
          value: body.values[field.key],
        }));
        state.revision++;
      }
      return reply(state);
    }
    if (url.endsWith("/review"))
      return reply({
        checks: state.fields[1].value
          ? []
          : [
              {
                field: "step.second",
                label: "流程字段二",
                status: "missing",
                detail: "请填写流程字段二",
              },
            ],
        can_generate: !!state.fields[1].value,
        review_token: "toolbar-review",
        revision: state.revision,
      });
    throw new Error("Unexpected workflow request: " + url);
  });
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        ReactDOM,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {},
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    registerPackedDocumentForms(window, URL);
  });
  renderWithProviders(<Page />);
  await user.click(
    await screen.findByRole("button", {
      name: new RegExp(
        `^0${stageIds.indexOf(stageId) + 1} ${
          stageNames[stageIds.indexOf(stageId)]
        }`,
      ),
    }),
  );
  if (stageId === "negotiation")
    await user.click(await screen.findByRole("tab", { name: "第一项" }));
  const first = await screen.findByLabelText("流程字段一");
  expect(first).toBeVisible();
  expect(first).toHaveAttribute("aria-required", "true");
  if (exerciseToolbar) {
    const help = screen.getByRole("button", { name: "流程字段一：填写说明" });
    expect(help.closest(".df-field-label")).toBeTruthy();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await user.hover(help);
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "填写当前阶段的第一项内容",
    );
    await user.hover(screen.getByRole("tooltip"));
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.unhover(screen.getByRole("tooltip"));
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
    await user.click(help);
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "填写当前阶段的第一项内容，其他标签页的草稿会保留。",
    );
    expect(first).toHaveValue("初始内容");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(help).toHaveFocus();
    await user.click(help);
    await user.click(first);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await user.click(help);
    await user.tab();
    expect(first).toHaveFocus();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  }
  const toolbar = screen.getByRole("toolbar", { name: "阶段工具栏" });
  const stageHeader = toolbar.closest(".df-stage-header") as HTMLElement;
  expect(stageHeader).toBeTruthy();
  expect(toolbar.closest(".df-stage-top-row")).toBeTruthy();
  for (const name of [
    "导入 Excel",
    "导出当前 Excel",
    "保存草稿",
    "下载本阶段材料",
  ]) {
    expect(within(toolbar).getByRole("button", { name })).toBeInTheDocument();
  }
  const statusButton = within(stageHeader).getByRole("button", {
    name: "办理信息与状态",
  });
  expect(statusButton.closest(".df-stage-bottom-row")).toBeTruthy();
  expect(statusButton).toHaveTextContent("未开始");
  for (const name of ["导入 Excel", "导出当前 Excel", "保存草稿"]) {
    const action = within(toolbar).getByRole("button", { name });
    expect(action.closest(".df-toolbar-save")).toBeTruthy();
    expect(action).not.toHaveTextContent(/导入|导出|保存/);
  }
  expect(
    within(toolbar)
      .getByRole("button", { name: "下载本阶段材料" })
      .closest(".df-toolbar-file-actions"),
  ).toBeTruthy();
  if (exerciseToolbar) {
    await user.click(statusButton);
    const statusDialog = screen.getByRole("dialog", {
      name: stageNames[stageIds.indexOf(stageId)] + "办理信息",
    });
    expect(statusDialog).toBeVisible();
    expect(within(statusDialog).getByLabelText("阶段状态")).toHaveValue(
      "pending",
    );
    await user.click(
      within(statusDialog).getByRole("button", { name: "取消" }),
    );
  }
  expect(within(toolbar).getByLabelText("模板")).toBeInTheDocument();
  expect(document.querySelector(".df-node-tools")).toBeNull();
  expect(document.querySelector(".df-form-heading")).toBeNull();
  expect(
    screen.queryByRole("heading", { name: "填写内容" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "第一项" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText("引用的基础信息")).not.toBeInTheDocument();
  expect(screen.queryByText("合同审查引用资料")).not.toBeInTheDocument();
  expect(screen.queryByText("查看引用的项目资料")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: /^审批资料$/ }),
  ).not.toBeInTheDocument();
  if (exerciseReturn) {
    const stageName = stageNames[stageIds.indexOf(stageId)];
    for (const destination of ["项目总览", "基础信息填报", "项目总览"]) {
      const previousHeader = screen
        .getByRole("toolbar", { name: "阶段工具栏" })
        .closest(".df-stage-header");
      await user.click(screen.getByRole("button", { name: destination }));
      expect(previousHeader?.isConnected).toBe(false);
      expect(
        screen.queryByRole("toolbar", { name: "阶段工具栏" }),
      ).not.toBeInTheDocument();
      await user.click(
        screen.getByRole("button", {
          name: new RegExp(
            "^0" + (stageIds.indexOf(stageId) + 1) + " " + stageName,
          ),
        }),
      );
      expect(await screen.findByLabelText("流程字段一")).toHaveValue(
        "初始内容",
      );
      const currentToolbar = screen.getByRole("toolbar", {
        name: "阶段工具栏",
      });
      const currentHeader = currentToolbar.closest(
        ".df-stage-header",
      ) as HTMLElement;
      expect(currentHeader).not.toBe(previousHeader);
      expect(currentHeader).toBeVisible();
      expect(
        within(currentHeader).getByRole("heading", { name: stageName }),
      ).toBeVisible();
      expect(
        within(currentHeader).getByRole("tab", { name: "内容填写" }),
      ).toBeVisible();
      expect(
        within(currentHeader).getByRole("button", { name: "办理信息与状态" }),
      ).toBeVisible();
      expect(
        getComputedStyle(currentHeader).getPropertyValue("container-type"),
      ).toBe("normal");
      expect(
        getComputedStyle(
          currentHeader.closest(".df-project-main") as Element,
        ).getPropertyValue("container-type"),
      ).toBe("inline-size");
      for (const name of ["导入 Excel", "导出当前 Excel", "保存草稿"]) {
        expect(
          within(currentToolbar).getAllByRole("button", { name }),
        ).toHaveLength(1);
      }
      const input = screen.getByLabelText("导入 Excel 变量表");
      const picker = vi.spyOn(input, "click");
      await user.click(
        within(currentToolbar).getByRole("button", { name: "导入 Excel" }),
      );
      expect(picker).toHaveBeenCalledOnce();
      picker.mockRestore();
      await user.click(screen.getByRole("tab", { name: "审批资料" }));
      expect(currentToolbar).toBeVisible();
      await user.click(screen.getByRole("tab", { name: "内容填写" }));
      expect(screen.getByLabelText("流程字段一")).toHaveValue("初始内容");
    }
    return;
  }
  await user.clear(first);
  await user.type(first, "跨标签保留的草稿");
  expect(statusButton).toBeDisabled();
  const groupTabs = screen.getByRole("tablist", { name: "填写内容分组" });
  await user.click(within(groupTabs).getByRole("tab", { name: "第二项" }));
  expect(first).not.toBeVisible();
  const second = screen.getByLabelText("流程字段二");
  expect(second).toHaveAttribute("aria-required", "true");
  await user.type(second, "第二页草稿");
  await user.click(screen.getByRole("tab", { name: "审批资料" }));
  expect(second).not.toBeVisible();
  expect(screen.getByRole("heading", { name: /^审批资料$/ })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "上传审批回执" }));
  await user.upload(
    screen.getByLabelText("上传阶段材料"),
    new File(["approval"], "审批回执.pdf", { type: "application/pdf" }),
  );
  await screen.findByText(/材料已保存，原有版本继续保留/);
  await user.click(screen.getByRole("tab", { name: "内容填写" }));
  expect(screen.getByLabelText("流程字段二")).toBe(second);
  expect(second).toBeVisible();
  expect(second).toHaveValue("第二页草稿");
  await user.clear(second);
  await user.click(screen.getByRole("button", { name: "保存草稿" }));
  await screen.findByRole("alert");
  expect(first).toHaveValue("跨标签保留的草稿");
  expect(screen.getByRole("button", { name: "保存草稿" })).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "保存草稿" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "保存草稿" })).toBeDisabled(),
  );
  expect(saves).toHaveLength(2);
  expect(statusButton).toBeEnabled();
  expect(saves[1].values["step.first"]).toBe("跨标签保留的草稿");
  await user.click(within(groupTabs).getByRole("tab", { name: "第一项" }));
  await user.keyboard("{End}");
  expect(
    within(groupTabs).getByRole("tab", { name: /^(模板与生成|文件生成)$/ }),
  ).toHaveFocus();
  expect(screen.getByRole("region", { name: "核对与生成" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "核对填写内容 →" }));
  await screen.findByText("请填写流程字段二");
  await user.click(screen.getByRole("button", { name: "修改" }));
  await waitFor(() =>
    expect(screen.getByLabelText("流程字段二")).toHaveFocus(),
  );
  expect(screen.getByRole("tab", { name: "第二项" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByLabelText("流程字段一")).toHaveValue("跨标签保留的草稿");
  expect(confirm).not.toHaveBeenCalled();
  if (exerciseToolbar) {
    const templateMenu = within(toolbar).getByLabelText("模板");
    const moreMenu = within(toolbar).getByLabelText("更多操作");
    await user.type(screen.getByLabelText("流程字段二"), "工具栏当前草稿");
    await user.click(moreMenu);
    await user.clear(screen.getByLabelText("表单名称"));
    await user.type(screen.getByLabelText("表单名称"), "工具栏表单");
    await user.keyboard("{Escape}");
    expect(moreMenu).toHaveFocus();
    expect(moreMenu.parentElement).not.toHaveAttribute("open");
    for (const action of ["核对项目资料差异", "存入项目底稿"]) {
      await user.click(screen.getByRole("tab", { name: "审批资料" }));
      await user.click(moreMenu);
      await user.click(within(toolbar).getByRole("button", { name: action }));
      const comparison = screen.getByRole("dialog", { name: "核对共用资料" });
      expect(comparison).toBeVisible();
      expect(screen.getByRole("tab", { name: "内容填写" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByLabelText("流程字段二")).toHaveValue("工具栏当前草稿");
      await user.click(
        within(comparison).getByRole("button", { name: "取消" }),
      );
    }
    const exportButton = within(toolbar).getByRole("button", {
      name: "导出当前 Excel",
    });
    await user.click(screen.getByRole("tab", { name: "审批资料" }));
    await user.click(exportButton);
    expect(await screen.findByRole("alert")).toBeVisible();
    expect(screen.getByRole("tab", { name: "内容填写" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(downloads).toHaveLength(0);
    expect(saves[saves.length - 1].values["step.second"]).toBe(
      "工具栏当前草稿",
    );
    expect(saves[saves.length - 1].name).toBe("工具栏表单");
    await waitFor(() => expect(exportButton).toBeEnabled());
    await user.click(exportButton);
    await waitFor(() =>
      expect(downloads).toContain("标签页测试项目_填写数据.xlsx"),
    );
    expect(await (createToolbarUrl.mock.calls[0][0] as Blob).text()).toBe(
      "saved-excel-data",
    );
    async function openTemplates() {
      await waitFor(() =>
        expect(templateMenu).not.toHaveAttribute("aria-disabled", "true"),
      );
      if (!templateMenu.parentElement?.hasAttribute("open"))
        await user.click(templateMenu);
    }
    await openTemplates();
    expect(screen.getByText("阶段模板.docx")).toBeVisible();
    const picker = screen.getByLabelText("导入 Word 模板");
    const pickFiles = vi.spyOn(picker, "click");
    await user.click(within(toolbar).getByRole("button", { name: "导入模板" }));
    expect(pickFiles).toHaveBeenCalledOnce();
    await user.upload(picker, [
      new File(["docx"], "额外模板.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
      new File(["xlsx"], "额外表格.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    ]);
    await screen.findByText("Word 模板已添加，生成时会保留原有排版。");
    expect(templateImports[0].map((file) => file.name)).toEqual([
      "额外模板.docx",
      "额外表格.xlsx",
    ]);
    expect(picker).toHaveValue("");
    await openTemplates();
    expect(screen.getByText("额外模板.docx")).toBeVisible();
    expect(screen.getByText("额外表格.xlsx")).toBeVisible();
    await user.click(
      within(toolbar).getByRole("button", { name: "设为本阶段默认模板" }),
    );
    await waitFor(() => expect(defaultRevisions).toHaveLength(1));
    for (const name of ["阶段模板.docx", "额外模板.docx", "额外表格.xlsx"]) {
      await openTemplates();
      await user.click(
        within(toolbar).getByRole("button", { name: "移除模板" + name }),
      );
      await waitFor(() =>
        expect(screen.queryByText(name)).not.toBeInTheDocument(),
      );
    }
    await openTemplates();
    await user.click(
      within(toolbar).getByRole("button", { name: "使用默认模板" }),
    );
    await screen.findByText("已载入默认 Word 模板。");
    await openTemplates();
    expect(screen.getByText("恢复的默认模板.docx")).toBeVisible();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("tab", { name: "文件生成" }));
    await user.click(screen.getByRole("button", { name: "核对填写内容 →" }));
    await user.click(await screen.findByRole("checkbox", { name: /我已核对/ }));
    await openTemplates();
    await user.upload(
      picker,
      new File(["docx"], "核对后模板.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    );
    await screen.findByText("Word 模板已添加，生成时会保留原有排版。");
    expect(
      screen.queryByRole("checkbox", { name: /我已核对/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "核对与生成" })).toBeVisible();
    await openTemplates();
    await user.click(
      within(toolbar).getByRole("button", { name: "下载配套模板" }),
    );
    await waitFor(() => expect(downloads).toContain("文书填报_配套模板.zip"));
    await user.keyboard("{Escape}");
    await openTemplates();
    await user.click(screen.getByRole("tab", { name: "第二项" }));
    expect(templateMenu.parentElement).not.toHaveAttribute("open");
    await user.type(screen.getByLabelText("流程字段二"), "尚未保存");
    await user.click(screen.getByRole("tab", { name: "审批资料" }));
    expect(exportButton).toBeVisible();
    const importButton = within(toolbar).getByRole("button", {
      name: "导入 Excel",
    });
    const excelPicker = screen.getByLabelText("导入 Excel 变量表");
    const pickExcel = vi.spyOn(excelPicker, "click");
    await user.click(importButton);
    expect(pickExcel).toHaveBeenCalledOnce();
    const workbook = new File(["xlsx"], "阶段数据.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    await user.upload(excelPicker, workbook);
    expect(confirm).toHaveBeenCalled();
    expect(excelImports).toHaveLength(0);
    expect(screen.getByLabelText("流程字段二")).toHaveValue(
      "工具栏当前草稿尚未保存",
    );
    confirm.mockReturnValueOnce(true);
    await user.upload(excelPicker, workbook);
    await waitFor(() => expect(excelImports).toHaveLength(1));
    await waitFor(() =>
      expect(screen.getByLabelText("流程字段一")).toBeVisible(),
    );
    expect(screen.getByLabelText("流程字段一")).toHaveValue("Excel 导入内容");
    expect(screen.getByLabelText("流程字段二")).toHaveValue("Excel 完整内容");
    expect(excelPicker).toHaveValue("");
  }
}

it.each(stageIds)(
  "uses workflow tabs in %s without shared reference blocks and preserves drafts through validation and attachments",
  async (stageId) => {
    await exerciseWorkflowTabs(stageId);
  },
  30000,
);
it("keeps template management, Excel transfers and saving in the live stage toolbar without losing drafts", async () => {
  await exerciseWorkflowTabs("plan", true);
}, 45000);

it("restores the live stage header and its actions after returning from overview and basic information", async () => {
  await exerciseWorkflowTabs("plan", false, true);
}, 30000);

function formProjectApi(getCase: () => FormProjectSummary) {
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
        fields: state.fields.filter((f) =>
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

it("organizes projects into seven stages and keeps material versions and submission details on the packaged page", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  let project: FormProjectFixture | null = null;
  const calls: Array<{ url: string; body: unknown }> = [];
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
            key: "project!.name",
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
              name:
                id === "plan" ? "计划批复或系统回执" : stageNames[i] + "材料",
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
      const material = project!.stages[0].materials[0];
      const uploaded: MaterialFileFixture = {
        id: "f" + material.files.length,
        name: file.name,
        mime: file.type,
        size: file.size,
        uploaded_at: "2026-10-22T10:00:00Z",
        preview_url: "/api/files/preview/" + file.name,
      };
      if (file.name.endsWith(".pdf"))
        uploaded.approval_review = {
          status: "ready",
          approved_at: "2026-08-06",
          fields: [
            {
              key: "project!.name",
              label: "项目名称",
              current: project!.name,
              value: "批复项目名称",
              changed: true,
            },
            {
              key: "plan.budget_wan",
              label: "外协项目经费（万元）",
              current: "47",
              value: "45",
              changed: true,
            },
          ],
          change_count: 2,
        };
      material.files.push(uploaded);
      material.status = uploaded.approval_review ? "done" : "preparing";
      if (uploaded.approval_review) {
        Object.assign(project!.stages[0], {
          status: "completed",
          approval_date: uploaded.approval_review.approved_at,
          completion_file_id: uploaded.id,
        });
      }
      project!.revision++;
      return reply(project);
    }
    if (url.startsWith("/document-forms/projects/project-new/files/"))
      return new Response("%PDF-1.4 approval", {
        headers: { "Content-Type": "application/pdf" },
      });
    if (url.endsWith("/stages/plan/approval/apply")) {
      project!.name = "批复项目名称";
      project!.fields[0].value = project!.name;
      const approval = project!.stages[0].materials[0].files.slice(-1)[0];
      for (const field of approval.approval_review!.fields) {
        if (body.keys.includes(field.key)) {
          field.current = field.value;
          field.changed = false;
        }
      }
      approval.approval_review!.change_count = 0;
      project!.revision++;
      return reply(project);
    }
    if (url.endsWith("/materials/m-plan") && init?.method === "PUT") {
      Object.assign(project!.stages[0].materials[0], body);
      project!.revision++;
      return reply(project);
    }
    if (url.endsWith("/stages/plan") && init?.method === "PUT") {
      Object.assign(project!.stages[0], body);
      project!.revision++;
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
        ReactDOM,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {},
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    registerPackedDocumentForms(window, URL);
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
    screen.getByText("外协助手", { selector: ".df-brand" }),
  ).toBeInTheDocument();
  const projectSearch = screen.getByRole("textbox", { name: "搜索项目" });
  await user.type(projectSearch, "不存在的项目");
  expect(screen.getByText("未找到项目")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "清除搜索" }));
  expect(projectSearch).toHaveValue("");
  expect(
    within(screen.getByRole("navigation", { name: "项目列表" })).getByRole(
      "button",
      { name: /储气库项目/ },
    ),
  ).toBeInTheDocument();

  expect(
    screen.queryByRole("navigation", { name: "填报记录" }),
  ).not.toBeInTheDocument();
  const nav = screen.getByRole("navigation", { name: "项目阶段" });
  for (const label of stageNames)
    expect(
      within(nav).getByRole("button", { name: new RegExp(label) }),
    ).toBeInTheDocument();
  await user.click(within(nav).getByRole("button", { name: /上报计划/ }));
  await user.click(screen.getByRole("tab", { name: "审批资料" }));
  await screen.findByRole("heading", { name: "审批资料" });
  expect(screen.getByText(/统一模板待补充/)).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "填写谈判材料" }),
  ).not.toBeInTheDocument();
  const upload = screen.getByLabelText("上传阶段材料");
  await user.click(
    screen.getByRole("button", { name: "上传计划批复或系统回执" }),
  );
  await user.upload(
    upload,
    new File(["v1"], "计划材料.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
  );
  await screen.findByText(/1 份文件.*最新/);
  await user.click(
    screen.getByRole("button", { name: "上传计划批复或系统回执" }),
  );
  await user.upload(
    upload,
    new File(["v2"], "计划材料.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
  );
  await screen.findByText(/2 份文件.*最新/);
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
  await user.click(
    screen.getByRole("button", { name: "上传计划批复或系统回执" }),
  );
  await user.upload(
    upload,
    new File(["approval"], "计划审批单.pdf", {
      type: "application/pdf",
    }),
  );
  await screen.findByText(/发现 2 项差异/);
  expect(
    screen.getByRole("button", { name: "办理信息与状态" }),
  ).toHaveTextContent("已完成");
  expect(
    within(nav).getByRole("button", { name: /上报计划/ }),
  ).toHaveTextContent("已完成");
  expect(
    within(document.querySelector(".df-stage-header") as HTMLElement).getByText(
      "批复日期 2026-08-06",
    ),
  ).toBeInTheDocument();
  expect(
    await screen.findByText(/本阶段已自动标记为已完成，批复日期 2026-08-06/),
  ).toBeInTheDocument();
  expect(
    calls.some(
      (call) =>
        call.url.endsWith("/stages/plan") &&
        (call.body as { status?: unknown })?.status === "completed",
    ),
  ).toBe(false);
  expect(project!.name).toBe("储气库项目");
  await user.click(screen.getByRole("button", { name: /查看比对结果/ }));
  const approval = await screen.findByRole("dialog", {
    name: "核对计划审批结果",
  });
  expect(within(approval).getByText("批复项目名称")).toBeInTheDocument();
  await user.click(
    within(approval).getByRole("button", { name: "采用所选 2 项" }),
  );
  await screen.findByRole("heading", { name: "批复项目名称" });
  await user.click(
    screen.getByRole("button", { name: "编辑计划批复或系统回执" }),
  );
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
        call.url.endsWith("/stages/plan") &&
        (call.body as { status?: unknown }).status === "completed",
    ),
  ).toBe(false);
  await user.click(screen.getByLabelText("确认本阶段已办结"));
  await user.click(screen.getByRole("button", { name: "保存办理信息" }));
  await screen.findByRole("link", { name: "计划管理系统 ↗" });
  expect(screen.getByText("PLAN-001")).toBeInTheDocument();
  expect(
    (
      calls.find((call) => call.url.endsWith("/stages/plan")) as
        | { body: { confirmed?: unknown } }
        | undefined
    )?.body.confirmed,
  ).toBe(true);
  await user.click(screen.getByRole("button", { name: "下载本阶段材料" }));
  await waitFor(() => expect(downloads).toContain("批复项目名称_上报计划.zip"));
  expect(calls.some((call) => call.url.endsWith("/bundle?stage_id=plan"))).toBe(
    true,
  );
}, 30000);

it("opens the response review agent only in negotiation and starts with explicitly selected project files", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  let record: unknown = null;
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
        ReactDOM,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    registerPackedDocumentForms(window, URL);
  });
  renderWithProviders(<Page />);
  const nav = await screen.findByRole("navigation", { name: "项目阶段" });
  await user.click(within(nav).getByRole("button", { name: /上报计划/ }));
  expect(
    screen.queryByRole("button", { name: /打开核查智能体/ }),
  ).not.toBeInTheDocument();
  await user.click(within(nav).getByRole("button", { name: /商务谈判/ }));
  await user.click(screen.getByRole("tab", { name: "响应文件核查" }));
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

it("keeps a single project form in the middle while questions and Office preview stay in the right column", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
  const filename = "01_商务谈判文件_三栏测试.docx";
  const generation = {
    id: "g1",
    date_style: "zh-CN",
    naming_style: "formal",
    created_at: "2026-10-23T01:00:00Z",
    revision: 1,
    stage_id: "negotiation",
    files: [
      {
        name: filename,
        size: 1024,
        print_copies: 7,
        recipient: "共用文件",
        preview_url: "/api/files/preview/fixture.docx",
      },
    ],
  };
  const state = {
    id: "project-form",
    name: "项目表单",
    stage_id: "negotiation",
    original_stage_id: "negotiation",
    revision: 1,
    updated_at: "2026-10-23T01:00:00Z",
    fields: [
      {
        key: "project.name",
        label: "项目名称",
        group: "项目资料",
        kind: "text",
        required: true,
        value: "三栏测试项目",
      },
      {
        key: "research.contents",
        label: "主要研究内容（整段）",
        group: "研究内容",
        kind: "textarea",
        required: false,
        value: "已保存内容",
      },
    ],
    recipients: [],
    rules: [],
    templates: [],
    generations: [generation],
  };
  let stageId = "negotiation",
    projectRevision = 1;
  const messages: unknown[] = [],
    opens: string[] = [],
    questions: Record<string, unknown>[] = [];
  const downloaded: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    downloaded.push(this.download);
  });
  const today = new Date();
  const localDate = (offset: number) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + offset,
    );
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const materialFiles: MaterialFileFixture[] = [];
  const project = (id = "p1") => ({
    id,
    name: id === "p1" ? "三栏测试项目" : "另一个项目",
    code: "P001",
    owner: "经办人",
    revision: projectRevision,
    single_form: true,
    form_id: state.id,
    fields: structuredClone(state.fields),
    forms:
      id === "p1"
        ? [
            {
              case_id: state.id,
              stage_id: stageId,
              original_stage_id: "negotiation",
              name: state.name,
              revision: state.revision,
              updated_at: state.updated_at,
              outputs: 1,
              generations: [generation],
              shared_changes: [],
            },
          ]
        : [],
    stages: stageIds.map((id, i) => ({
      id,
      title: stageNames[i],
      purpose: "阶段材料",
      status: id === "payment" ? "completed" : "pending",
      materials:
        id === "negotiation"
          ? [
              {
                id: "approval",
                name: "审批回执",
                status: "pending",
                required: true,
                note: "",
                files: materialFiles,
              },
            ]
          : [],
      upstream_changed: [],
      missing_required: [],
      notes: "",
      due_date:
        id === "negotiation"
          ? localDate(0)
          : id === "plan" || id === "payment"
          ? localDate(-2)
          : id === "selection"
          ? localDate(2)
          : "",
      system_url: "",
      system_name: "",
      submission_ref: "",
    })),
  });
  const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/document-forms/projects")
      return reply([project(), project("p2")]);
    if (url === "/document-forms/projects/p1") return reply(project());
    if (url === "/document-forms/projects/p2") return reply(project("p2"));
    if (url === "/document-forms/projects/p1/form") {
      const body = JSON.parse(String(init?.body));
      stageId = body.stage_id;
      state.stage_id = stageId;
      opens.push(state.id);
      projectRevision++;
      return reply(state);
    }
    if (
      url ===
      "/document-forms/projects/p1/stages/negotiation/materials/approval/files"
    ) {
      const body = init?.body as FormData;
      expect(body.get("revision")).toBe(String(projectRevision));
      const file = body.get("file") as File;
      materialFiles.push({
        id: "approval-file",
        name: file.name,
        size: file.size,
        uploaded_at: new Date().toISOString(),
        mime: "application/pdf",
      });
      projectRevision++;
      return reply(project());
    }
    if (url === "/document-forms/cases/project-form") return reply(state);
    if (url.endsWith("/assistant") && init?.method === "POST") {
      const body = JSON.parse(String(init.body));
      questions.push(body);
      const result = {
        id: "q" + questions.length,
        message: body.message,
        created_at: "2026-10-23T01:00:00Z",
        status: "completed",
        reply: "请核对本阶段材料清单。",
        error: "",
      };
      messages.push(result);
      return reply(result);
    }
    if (url.endsWith("/assistant"))
      return reply({ messages: url.includes("/p1/") ? messages : [] });
    if (url.includes("/print/"))
      return url.endsWith("?pages=1")
        ? reply({ pages: 1 })
        : new Response(new Blob(["png"], { type: "image/png" }));
    if (url.includes("/outputs/")) return new Response("fixture-download");
    throw new Error("Unexpected three-column request: " + url);
  });
  vi.stubGlobal(
    "URL",
    Object.assign(class extends URL {}, {
      createObjectURL: () => "blob:three-column",
      revokeObjectURL: vi.fn(),
    }),
  );
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        ReactDOM,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {
        loadPreview:
          async () =>
          ({ artifact }: Pick<RendererContext, "artifact">) => (
            <div data-testid="right-office-preview">{artifact.title}</div>
          ),
      },
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    registerPackedDocumentForms(window, URL);
  });
  renderWithProviders(<Page />);
  const nav = await screen.findByRole("navigation", { name: "项目阶段" });
  const right = await screen.findByRole("complementary", {
    name: "项目智能体与文件预览",
  });
  expect(right.closest(".df-three-column")).toBeTruthy();
  await user.click(within(nav).getByRole("button", { name: /商务谈判/ }));
  const field = await screen.findByLabelText("主要研究内容（整段）");
  expect(screen.queryByLabelText("填写流程")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "打开项目表单" }),
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText("节点办理概况")).toHaveTextContent("今天到期");
  expect(
    screen.queryByRole("heading", { name: /^审批资料$/ }),
  ).not.toBeInTheDocument();

  await user.clear(field);
  await user.type(field, "正在填写的内容");
  await user.click(screen.getByRole("tab", { name: "审批资料" }));
  await user.click(screen.getByRole("button", { name: "上传审批回执" }));
  await user.upload(
    screen.getByLabelText("上传阶段材料"),
    new File(["approval"], "批复.pdf", { type: "application/pdf" }),
  );
  await screen.findByText(/材料已保存，原有版本继续保留/);
  expect(field).toHaveValue("正在填写的内容");
  expect(state.fields[1].value).toBe("已保存内容");
  expect(screen.getByLabelText("节点办理概况")).toHaveTextContent(
    "审批资料 1/1",
  );
  await user.click(screen.getByRole("tab", { name: "内容填写" }));

  await user.type(
    within(right).getByLabelText("向项目智能体提问"),
    "有哪些材料？",
  );
  await user.click(screen.getByRole("button", { name: "收起项目栏" }));
  expect(screen.getByRole("button", { name: "展开项目栏" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(
    screen.queryByRole("navigation", { name: "项目列表" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "收起问答与预览栏" }));
  expect(right.closest(".df-right-collapsed")).toBeTruthy();
  expect(screen.queryByLabelText("向项目智能体提问")).not.toBeVisible();
  await user.click(screen.getByRole("button", { name: "展开问答与预览栏" }));
  const resizer = within(right).getByRole("separator", {
    name: "调整问答与预览栏宽度",
  });
  const initialWidth = Number(resizer.getAttribute("aria-valuenow"));
  fireEvent(
    resizer,
    new MouseEvent("pointerdown", { bubbles: true, button: 0, clientX: 600 }),
  );
  fireEvent(
    resizer,
    new MouseEvent("pointermove", { bubbles: true, clientX: 520 }),
  );
  fireEvent(resizer, new MouseEvent("pointerup", { bubbles: true }));
  expect(resizer).toHaveAttribute("aria-valuenow", String(initialWidth + 80));
  fireEvent.keyDown(resizer, { key: "ArrowRight" });
  expect(resizer).toHaveAttribute("aria-valuenow", String(initialWidth + 56));
  fireEvent.keyDown(resizer, { key: "Home" });
  expect(resizer).toHaveAttribute("aria-valuenow", "300");
  fireEvent.keyDown(resizer, { key: "End" });
  expect(resizer).toHaveAttribute(
    "aria-valuenow",
    resizer.getAttribute("aria-valuemax"),
  );
  fireEvent.doubleClick(resizer);
  expect(resizer).toHaveAttribute("aria-valuenow", "500");
  expect(window.localStorage.getItem("ugsci.document-forms.right-width")).toBe(
    "500",
  );
  expect(within(right).getByLabelText("向项目智能体提问")).toHaveValue(
    "有哪些材料？",
  );
  await user.click(screen.getByRole("button", { name: "收起问答与预览栏" }));
  expect(field).toHaveValue("正在填写的内容");
  await user.click(screen.getByRole("button", { name: "展开项目栏" }));
  await user.click(screen.getByRole("button", { name: "展开问答与预览栏" }));
  expect(screen.getByRole("navigation", { name: "项目列表" })).toBeVisible();
  expect(within(right).getByLabelText("向项目智能体提问")).toHaveValue(
    "有哪些材料？",
  );

  await user.click(within(right).getByRole("button", { name: "发送问题" }));
  await within(right).findByText("请核对本阶段材料清单。");
  expect(field).toHaveValue("正在填写的内容");
  await user.click(within(right).getByRole("tab", { name: "预览" }));
  expect(within(right).getByText(/建议打印 7 份/)).toBeVisible();
  await user.click(
    within(right).getByRole("button", { name: "下载" + filename }),
  );
  await waitFor(() => expect(downloaded).toContain(filename));
  await user.click(within(right).getByRole("button", { name: "打包下载" }));
  await waitFor(() => expect(downloaded).toContain("三栏测试项目_文书.zip"));
  await user.click(within(right).getByRole("button", { name: filename }));
  await within(right).findByRole("button", { name: "文字预览" });
  await user.click(within(right).getByRole("button", { name: "文字预览" }));
  await within(right).findByTestId("right-office-preview");
  const officePreview = within(right).getByTestId("right-office-preview");
  await user.click(screen.getByRole("button", { name: "收起问答与预览栏" }));
  expect(officePreview).not.toBeVisible();
  await user.click(screen.getByRole("button", { name: "展开问答与预览栏" }));
  expect(officePreview).toBeVisible();

  expect(field).toHaveValue("正在填写的内容");
  await user.click(within(right).getByRole("button", { name: /就此文件提问/ }));
  expect(within(right).getByText("参考文件：" + filename)).toBeVisible();
  await user.type(
    within(right).getByLabelText("向项目智能体提问"),
    "核对该文件",
  );
  await user.click(within(right).getByRole("button", { name: "发送问题" }));
  await waitFor(() => expect(questions).toHaveLength(2));
  expect(questions[1].file).toEqual({
    case_id: state.id,
    generation_id: "g1",
    name: filename,
  });
  confirm.mockReturnValueOnce(false);
  await user.click(screen.getByRole("button", { name: "基础信息填报" }));
  expect(confirm).toHaveBeenCalled();
  expect(field).toHaveValue("正在填写的内容");
  await user.click(within(nav).getByRole("button", { name: /上报计划/ }));
  await screen.findByLabelText("主要研究内容（整段）");
  expect(confirm).toHaveBeenCalled();
  await user.click(within(nav).getByRole("button", { name: /商务谈判/ }));
  await screen.findByLabelText("主要研究内容（整段）");
  expect(screen.getByLabelText("节点办理概况")).toHaveTextContent("今天到期");
  await user.click(within(nav).getByRole("button", { name: /上报计划/ }));
  await screen.findByLabelText("主要研究内容（整段）");
  expect(screen.getByLabelText("节点办理概况")).toHaveTextContent(
    "已逾期 2 天",
  );
  await user.click(within(nav).getByRole("button", { name: /选商论证/ }));
  await screen.findByLabelText("主要研究内容（整段）");
  expect(screen.getByLabelText("节点办理概况")).toHaveTextContent("2 天后到期");
  await user.click(within(nav).getByRole("button", { name: /归档付款/ }));
  await screen.findByLabelText("主要研究内容（整段）");
  expect(screen.getByLabelText("节点办理概况")).toHaveTextContent("已办结");
  expect(screen.getByLabelText("节点办理概况")).not.toHaveTextContent("逾期");
  expect(new Set(opens)).toEqual(new Set(["project-form"]));
  expect(
    hostFetch.mock.calls.some(
      ([url]) => url.endsWith("/cases") || url.endsWith("/cases/import"),
    ),
  ).toBe(false);
  await user.click(screen.getByRole("button", { name: /另一个项目.*P001/ }));
  await screen.findByRole("heading", { name: "另一个项目" });
  expect(screen.queryByText("请核对本阶段材料清单。")).not.toBeInTheDocument();
}, 30000);

it("fills plan-specific information, keeps common fields in the basic profile and previews generated Excel through Office", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  const common = [
    {
      key: "project.name",
      label: "项目名称",
      group: "基本信息",
      kind: "text",
      required: true,
      value: "上报测试项目",
      scope: "shared",
    },
    {
      key: "research.contents",
      label: "研究内容",
      group: "研究内容",
      kind: "textarea",
      required: true,
      value: "基础信息中的研究内容",
      scope: "shared",
    },
  ];
  const state: FormCaseFixture = {
    id: "plan-single",
    name: "项目表单",
    revision: 1,
    stage_id: "plan",
    plan_schema: 1,
    updated_at: "2026-10-23T01:00:00Z",
    fields: [
      ...structuredClone(common),
      {
        key: "plan.name",
        label: "本次申报计划名称",
        group: "申报信息",
        kind: "text",
        required: true,
        value: "上报名称",
      },
      {
        key: "plan.budget_wan",
        label: "本次申报外协经费（万元）",
        group: "申报信息",
        kind: "number",
        required: true,
        value: "47",
      },
      {
        key: "plan.necessity",
        label: "外协必要性说明",
        group: "外协必要性",
        kind: "textarea",
        required: true,
        value: "完整背景与外协理由，由这一段直接生成。",
        help: "填写外协必要性说明的完整段落，生成文件时直接使用，不拼接项目背景。",
      },
      {
        key: "plan.partners",
        label: "本次计划拟合作单位",
        group: "拟合作单位",
        kind: "textarea",
        required: true,
        value: "1. 计划甲单位\n2. 计划乙单位\n3. 计划丙单位",
      },
      {
        key: "plan.notes",
        label: "申报备注",
        group: "申报信息",
        kind: "textarea",
        required: false,
        value: "",
      },
    ],
    recipients: [],
    rules: [],
    generations: [],
    templates: [
      {
        id: "w1",
        title: "外协必要性说明",
        name: "01_外协必要性说明_模板.docx",
        keys: [],
        per_recipient: false,
      },
      {
        id: "x1",
        title: "科研计划填报",
        name: "02_科研计划填报_模板.xlsx",
        keys: [],
        per_recipient: false,
      },
    ],
  };
  const project = () => ({
    id: "p-plan",
    name: "上报测试项目",
    code: "P-01",
    owner: "经办人",
    revision: 1,
    shared_revision: 1,
    single_form: true,
    form_id: state.id,
    fields: structuredClone(common),
    forms: [
      {
        case_id: state.id,
        name: state.name,
        stage_id: "plan",
        revision: state.revision,
        updated_at: state.updated_at,
        outputs: state.generations.length * 2,
        generations: state.generations,
        shared_changes: [],
      },
    ],
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
  const saved: FormSaveFixture[] = [],
    previews: RendererContext["artifact"][] = [];
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/document-forms/projects") return reply([project()]);
    if (url === "/document-forms/projects/p-plan") return reply(project());
    if (url.endsWith("/assistant")) return reply({ messages: [] });
    if (url === "/document-forms/projects/p-plan/form") return reply(state);
    if (url === "/document-forms/cases/plan-single") {
      if (init?.method === "PUT") {
        const body = JSON.parse(String(init.body));
        saved.push(body);
        state.fields = state.fields.map((f) => ({
          ...f,
          value: body.values[f.key],
        }));
        state.revision++;
      }
      return reply(state);
    }
    if (url.endsWith("/review"))
      return reply({
        checks: [{ label: "填写信息", status: "ok", detail: "已填写" }],
        can_generate: true,
        review_token: "plan-token",
        revision: state.revision,
      });
    if (url.endsWith("/generate")) {
      expect(JSON.parse(String(init?.body))).toMatchObject({
        confirmed: true,
        review_token: "plan-token",
      });
      state.generations = [
        {
          id: "plan-g1",
          stage_id: "plan",
          revision: state.revision,
          date_style: "zh-CN",
          naming_style: "formal",
          created_at: state.updated_at,
          files: [
            {
              name: "01_外协必要性说明_上报测试项目.docx",
              size: 1024,
              recipient: "共用文件",
              preview_url: "/api/files/preview/plan.docx",
            },
            {
              name: "02_科研计划填报_上报测试项目.xlsx",
              size: 2048,
              recipient: "共用文件",
              preview_url: "/api/files/preview/plan.xlsx",
            },
          ],
        },
      ];
      return reply(state);
    }
    if (url.includes("/print/") && url.includes(".docx"))
      return url.includes("pages=true")
        ? reply({ pages: 1 })
        : new Response(new Blob(["png"], { type: "image/png" }));
    throw new Error("Unexpected plan request: " + url);
  });
  vi.stubGlobal(
    "URL",
    Object.assign(class extends URL {}, {
      createObjectURL: () => "blob:plan-test",
      revokeObjectURL: vi.fn(),
    }),
  );
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        ReactDOM,
        fetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {
        loadPreview:
          async () =>
          ({ artifact }: Pick<RendererContext, "artifact">) => {
            previews.push(artifact);
            return (
              <div data-testid="plan-office-preview">
                {artifact.extension}: {artifact.title}
              </div>
            );
          },
      },
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    registerPackedDocumentForms(window, URL);
  });
  renderWithProviders(<Page />);
  await user.click(await screen.findByRole("button", { name: /01 上报计划/ }));
  const amount = await screen.findByLabelText("本次申报外协经费（万元）");
  await user.click(screen.getByRole("tab", { name: "外协必要性" }));
  expect(screen.getByLabelText("外协必要性说明")).toHaveValue(
    "完整背景与外协理由，由这一段直接生成。",
  );
  await user.click(
    screen.getByRole("button", { name: "外协必要性说明：填写说明" }),
  );
  expect(screen.getByRole("tooltip")).toHaveTextContent(
    /填写外协必要性说明的完整段落/,
  );
  await user.keyboard("{Escape}");
  expect(screen.getByLabelText("申报备注").tagName).toBe("INPUT");
  expect(screen.getByLabelText("单位1")).toHaveValue("计划甲单位");
  expect(screen.getByLabelText("单位2")).toHaveValue("计划乙单位");
  expect(screen.getByLabelText("单位3")).toHaveValue("计划丙单位");
  await user.click(screen.getByRole("tab", { name: "拟合作单位" }));
  await user.clear(screen.getByLabelText("单位1"));
  await user.clear(screen.getByLabelText("单位2"));
  await user.type(screen.getByLabelText("单位2"), "计划乙单位（修改）");
  await user.click(screen.getByRole("tab", { name: "申报信息" }));
  await user.type(screen.getByLabelText("申报备注"), "按计划申报");
  expect(screen.queryByLabelText("研究内容")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: /^受邀单位/ }),
  ).not.toBeInTheDocument();
  await user.clear(amount);
  await user.type(amount, "48.5");
  await user.click(screen.getByRole("button", { name: "保存草稿" }));
  await waitFor(() => expect(saved).toHaveLength(1));
  await user.click(screen.getByRole("button", { name: "基础信息填报" }));
  await screen.findByRole("heading", { name: "基础信息填报" });
  expect(saved[0].values["plan.budget_wan"]).toBe("48.5");
  expect(saved[0].values["plan.partners"]).toBe(
    "1. \n2. 计划乙单位（修改）\n3. 计划丙单位",
  );
  expect(saved[0].values["plan.notes"]).toBe("按计划申报");
  expect(screen.getByLabelText("研究内容")).toHaveValue("基础信息中的研究内容");
  await user.click(screen.getByRole("button", { name: /01 上报计划/ }));
  expect(await screen.findByLabelText("本次申报外协经费（万元）")).toHaveValue(
    48.5,
  );
  expect(screen.getByLabelText("单位1")).toHaveValue("");
  expect(screen.getByLabelText("单位2")).toHaveValue("计划乙单位（修改）");
  expect(screen.getByLabelText("单位3")).toHaveValue("计划丙单位");
  expect(screen.getByLabelText("申报备注")).toHaveValue("按计划申报");
  await user.click(screen.getByRole("tab", { name: "拟合作单位" }));
  await user.type(screen.getByLabelText("单位1"), "计划甲单位");
  await user.click(
    screen.getByRole("tab", { name: /^(模板与生成|文件生成)$/ }),
  );
  expect(
    within(screen.getByRole("region", { name: "核对与生成" })).getByText(
      /本次计划生成/,
    ),
  ).toBeInTheDocument();
  expect(screen.queryByText(/0 类按单位文书/)).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "核对填写内容 →" }));
  await user.click(await screen.findByRole("checkbox", { name: /我已核对/ }));
  await user.click(screen.getByRole("tab", { name: "审批资料" }));
  await user.click(screen.getByRole("tab", { name: "内容填写" }));
  expect(screen.getByRole("checkbox", { name: /我已核对/ })).toBeChecked();
  await user.click(screen.getByRole("button", { name: "确认并生成 2 份文书" }));
  const dock = screen.getByRole("complementary", {
    name: "项目智能体与文件预览",
  });
  await within(dock).findByRole("heading", {
    name: "01_外协必要性说明_上报测试项目.docx",
  });
  const fileList = document.querySelector(".df-results-docked") as HTMLElement;
  expect(fileList).toBeInTheDocument();
  expect(screen.queryByLabelText("申报备注")).not.toBeInTheDocument();
  expect(
    within(fileList).getByRole("button", { name: /打包下载/ }),
  ).toBeInTheDocument();
  await user.click(
    within(fileList).getByRole("button", {
      name: /^02_科研计划填报_上报测试项目\.xlsx/,
    }),
  );
  expect(
    await within(dock).findByTestId("plan-office-preview"),
  ).toHaveTextContent("xlsx:");
  expect(
    within(dock).getByTestId("plan-office-preview").closest(".df-dock-office"),
  ).toBeInTheDocument();
  expect(previews[previews.length - 1]).toMatchObject({
    extension: "xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  expect(
    fetch.mock.calls.some(
      ([url]) => url.includes("/print/") && url.includes(".xlsx"),
    ),
  ).toBe(false);
}, 30000);

it("reviews shared project differences before selectively updating a stage form and protects unsaved edits", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  let state = {
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
  const calls: Array<{ url: string; body: unknown }> = [];
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
        fields: state.fields.map((f) =>
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
          fields: state.fields.map((f) => ({
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
        ReactDOM,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {},
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    registerPackedDocumentForms(window, URL);
  });
  renderWithProviders(<Page />);
  await user.click(
    await screen.findByRole("button", { name: /^03.*商务谈判/ }),
  );
  await user.click(screen.getByRole("button", { name: "打开表单" }));
  const name = await screen.findByLabelText("项目名称");
  await user.clear(name);
  await user.type(name, "用户未保存的名称");
  await user.click(screen.getByRole("button", { name: /^06.*结题验收/ }));
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
  await user.click(screen.getByRole("tab", { name: "项目研究内容" }));
  expect(screen.getByRole("textbox", { name: "研究内容" })).toHaveValue(
    "原有研究内容",
  );
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
  ).filter((entry: { name: string }) =>
    /商务谈判文件|谈判邀请函|投标报价一览表|综合评分表|综合评分汇总表/.test(
      entry.name,
    ),
  );
  const state = {
    id: "bundled-case",
    name: "新填报",
    revision: 1,
    updated_at: "2026-10-22T00:00:00Z",
    fields: fields.map((field: FormFieldFixture) => ({ ...field, value: "" })),
    recipients: [{ name: "", start: "", end: "" }],
    rules: [],
    generations: [],
    templates: entries.map((entry: Record<string, unknown>, index: number) => ({
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
        ReactDOM,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {},
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    registerPackedDocumentForms(window, URL);
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
      let state: FormCaseFixture = {
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
      const calls: Array<{ url: string; body: unknown }> = [];
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
        let result: unknown;
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
            fields: state.fields.map((f) => ({
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
            ReactDOM,
            fetch: hostFetch,
            useTheme: () => "light",
            useSelectedAgent: () => ({ id: "default" }),
            getSelectedAgentId: () => "default",
          },
          workspace:
            previewMode === "embedded" ? createWorkspaceNamespace() : {},
          registerRoutes: (
            _id: string,
            routes: Array<{ component: React.ComponentType }>,
          ) => {
            Page = routes[0].component;
          },
        },
      });
      await act(async () => {
        registerPackedDocumentForms(window, URL);
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
      await user.click(screen.getByRole("tab", { name: "项目研究内容" }));
      const paragraphs = screen.getByRole("textbox", {
        name: "研究内容（整段）",
      });
      expect(paragraphs.tagName).toBe("TEXTAREA");
      expect(paragraphs).toHaveValue("第一项\n第二项");
      expect(paragraphs).toHaveAttribute("rows", "3");
      await user.type(paragraphs, "\n第三项");
      await user.click(screen.getByRole("tab", { name: "受邀单位与资格要求" }));
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
      await user.click(
        screen.getByRole("tab", { name: /^(模板与生成|文件生成)$/ }),
      );
      await screen.findByText("按受邀单位分别生成");
      expect(screen.getByText("02_综合评分表_模板.docx")).toBeInTheDocument();
      expect(
        screen.getByText(/建议打印 7 份 · 每位专家一份/),
      ).toBeInTheDocument();
      expect(state.recipients[1].follow_start).toBe(true);
      expect(state.recipients[1].follow_end).toBe(false);
      await user.click(screen.getByRole("button", { name: "设为默认模板" }));
      await screen.findByText("已设为本机默认模板，以后新建填报会自动载入。");
      await user.click(screen.getByRole("tab", { name: "受邀单位与资格要求" }));
      await user.click(screen.getByRole("button", { name: "移除第3家单位" }));
      await user.click(screen.getByRole("button", { name: "移除第2家单位" }));
      await user.click(
        screen.getByRole("tab", { name: /^(模板与生成|文件生成)$/ }),
      );
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
      await user.click(screen.getByRole("tab", { name: "项目研究内容" }));
      await user.clear(screen.getByLabelText("项目名称"));
      await user.type(screen.getByLabelText("项目名称"), "新项目");
      await user.click(
        screen.getByRole("tab", { name: /^(模板与生成|文件生成)$/ }),
      );
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
    }, 45000);
  },
);
async function exerciseSelectionPage(linked = false, paste = false) {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  const common = [
    {
      key: "project.name",
      label: "项目名称",
      group: "基本信息",
      kind: "text",
      value: "论证测试项目",
      required: true,
      scope: "shared",
    },
  ];
  const state: FormCaseFixture = {
    id: "selection-case",
    name: "项目表单",
    revision: 1,
    stage_id: "selection",
    selection_schema: 1,
    updated_at: "2026-10-23T01:00:00Z",
    fields: [
      ...common,
      {
        key: "selection.plan_type",
        label: "依托计划类型",
        group: "非招标方案",
        kind: "text",
        value: "委托研发/技术服务计划",
        required: true,
        options: [
          "科研设备购置计划",
          "委托研发/技术服务计划",
          "测试化验加工计划",
          "资料出版翻译计划",
          "租赁维护维修计划",
          "大宗材料购置计划",
          "内部测试分析计划",
          "其他",
        ],
      },
      {
        key: "selection.funding_source",
        label: "本次方案经费来源",
        group: "非招标方案",
        kind: "text",
        value: "股份",
        required: true,
        options: ["股份", "集团"],
      },
      {
        key: "selection.overview",
        label: "项目概况",
        group: "论证意见",
        kind: "textarea",
        value: "项目概况原文",
        required: true,
      },
      {
        key: "selection.partner3_name",
        label: "单位3",
        group: "候选单位 3",
        kind: "text",
        value: "论证第三家",
        required: true,
      },
      {
        read_only: true,
        key: "selection.budget_wan",
        label: "本次论证预算（万元）",
        group: "非招标方案",
        kind: "number",
        value: "45",
        required: true,
      },
    ],
    recipients: [],
    rules: [],
    generations: [],
    document_values: {},
    templates: [
      {
        id: "opinion",
        name: "01_论证意见及签字表_模板.docx",
        per_recipient: false,
        keys: [],
        from_builtin: true,
      },
      {
        id: "upload",
        name: "02_非招标方案填报_模板.xlsx",
        per_recipient: false,
        keys: [],
        from_builtin: true,
      },
    ],
  };
  const savedValues: Record<string, unknown>[] = [];
  const reliabilityPrefix =
    "《论证测试项目》为2026年审查通过的技术服务实施计划，计划金额为45万元。依托《依托主项目》，WBS编码WBS-001，依托项目经费为200万元，";
  const reliabilityTemplate =
    "《【project.name】》为2026年审查通过的技术服务实施计划，计划金额为【selection.budget_wan】万元。依托《【funding.project_name】》，WBS编码【funding.wbs】，依托项目经费为【funding.amount_wan】万元，可靠性保留意见。";
  const candidateTemplate =
    "通过调研优选三家单位，分别为【selection.partner1_name】、【selection.partner2_name】、【selection.partner3_name】。需补充资质证据。";
  const linkedVariables = {
    "project.name": "论证测试项目",
    "selection.budget_wan": "45",
    "funding.project_name": "依托主项目",
    "funding.wbs": "WBS-001",
    "funding.amount_wan": "200",
    "selection.partner1_name": "候选甲",
    "selection.partner2_name": "候选乙",
    "selection.partner3_name": "论证第三家",
  };
  const makeLinkedParts = (
    template: string,
    variables: Record<string, string>,
  ) =>
    template.split(/【([^】]+)】/g).map((text, index) =>
      index % 2
        ? {
            field: text,
            label: text === "project.name" ? "项目名称" : "引用资料",
            value: variables[text],
          }
        : text,
    );
  if (linked) {
    state.fields.push(
      ...[1, 2].map((index) => ({
        key: "selection.partner" + index + "_name",
        label: "单位" + index,
        group: "候选单位 " + index,
        kind: "text",
        value: index === 1 ? "候选甲" : "候选乙",
        required: true,
      })),
      {
        key: "selection.reliability",
        label: "计划和依托项目的可靠性",
        group: "论证意见",
        kind: "textarea",
        required: true,
        linked_parts: makeLinkedParts(reliabilityTemplate, linkedVariables),
        linked_template: reliabilityTemplate,
        linked_variables: linkedVariables,
        value: reliabilityPrefix + "可靠性保留意见。",
      },
      {
        key: "selection.qualification_review",
        label: "候选单位调研与资质审查意见",
        group: "论证意见",
        kind: "textarea",
        required: true,
        linked_parts: makeLinkedParts(candidateTemplate, linkedVariables),
        linked_template: candidateTemplate,
        linked_variables: linkedVariables,
        value:
          "通过调研优选三家单位，分别为候选甲、候选乙、论证第三家。需补充资质证据。",
      },
    );
  }
  for (let index = 1; index <= 5; index++) {
    for (const [column, label, value] of [
      ["name", "姓名", "测试成员"],
      ["unit", "单位", "原单位"],
      ["title", "职务/职称", "高工"],
      ["category", "人员类别", "科委会成员"],
    ]) {
      state.fields.push({
        key: `selection.member${index}_${column}`,
        label: `成员${index}${label}`,
        group: `论证成员 ${index}`,
        kind: "text",
        required: true,
        value,
      });
    }
  }
  const project = () => ({
    id: "p-selection",
    name: "论证测试项目",
    code: "S1",
    owner: "经办人",
    revision: 1,
    single_form: true,
    form_id: state.id,
    fields: common,
    forms: [
      {
        case_id: state.id,
        stage_id: "selection",
        name: state.name,
        revision: state.revision,
        updated_at: state.updated_at,
        generations: state.generations,
        outputs: state.generations.length * 2,
        shared_changes: [],
      },
    ],
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
  const previews: RendererContext["artifact"][] = [];
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/document-forms/projects") return reply([project()]);
    if (url === "/document-forms/projects/p-selection") return reply(project());
    if (url.endsWith("/assistant")) return reply({ messages: [] });
    if (url.endsWith("/form")) return reply(state);
    if (url === "/document-forms/cases/selection-case") {
      if (init?.method === "PUT") {
        const body = JSON.parse(String(init.body));
        savedValues.push(body.values);
        state.fields = state.fields.map((f) => ({
          ...f,
          value: body.values[f.key],
        }));
        if (linked) {
          for (const field of state.fields.filter((f) => f.linked_template)) {
            expect(body.opinion_templates[field.key]).toBeDefined();
            field.linked_template = body.opinion_templates[field.key];
            field.linked_parts = makeLinkedParts(field.linked_template!, {
              ...linkedVariables,
              "selection.partner3_name": "新第三家",
            });
          }
        }
        state.revision++;
      }
      return reply(state);
    }
    if (url.endsWith("/review")) {
      const memberName = state.fields.find(
        (f) => f.key === "selection.member1_name",
      )!.value;
      return reply({
        checks: memberName
          ? []
          : [
              {
                status: "missing",
                field: "selection.member1_name",
                label: "成员1姓名",
                detail: "请补充成员姓名",
              },
            ],
        can_generate: !!memberName,
        review_token: "selection-token",
        revision: state.revision,
      });
    }
    if (url.endsWith("/generate")) {
      expect(JSON.parse(String(init?.body))).toMatchObject({
        confirmed: true,
        review_token: "selection-token",
      });
      state.generations = [
        {
          id: "selection-g1",
          stage_id: "selection",
          revision: state.revision,
          date_style: "zh-CN",
          naming_style: "formal",
          created_at: state.updated_at,
          files: [
            {
              name: "01_论证意见及签字表_论证测试项目.docx",
              size: 1024,
              recipient: "共用文件",
              preview_url: "/api/files/preview/opinion.docx",
            },
            {
              name: "02_非招标方案填报_论证测试项目.xlsx",
              size: 2048,
              recipient: "共用文件",
              preview_url: "/api/files/preview/upload.xlsx",
            },
          ],
        },
      ];
      return reply(state);
    }
    if (url.includes("/print/"))
      return url.includes("pages=true")
        ? reply({ pages: 1 })
        : new Response(new Blob(["png"], { type: "image/png" }));
    throw new Error("Unexpected selection request: " + url);
  });
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        ReactDOM,
        fetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {
        loadPreview:
          async () =>
          ({ artifact }: Pick<RendererContext, "artifact">) => {
            previews.push(artifact);
            return <div data-testid="selection-office">{artifact.title}</div>;
          },
      },
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    registerPackedDocumentForms(window, URL);
  });
  renderWithProviders(<Page />);
  await user.click(await screen.findByRole("button", { name: /02 选商论证/ }));
  expect(await screen.findByLabelText("本次论证预算（万元）")).toHaveValue(45);
  expect(screen.getByLabelText("单位3")).toHaveValue("论证第三家");
  if (linked) {
    await user.click(screen.getByRole("tab", { name: "候选单位" }));
    await user.clear(screen.getByLabelText("单位3"));
    await user.type(screen.getByLabelText("单位3"), "新第三家");
    await user.click(screen.getByRole("tab", { name: "论证意见" }));
    const reliability = screen.getByRole("textbox", {
      name: "计划和依托项目的可靠性",
    });
    expect(reliability).toHaveTextContent(
      "《【论证测试项目】》为2026年审查通过的技术服务实施计划，计划金额为【45】万元。",
    );
    expect(reliability).toHaveTextContent("可靠性保留意见。");
    expect(
      screen.queryByLabelText("计划和依托项目的可靠性引用资料"),
    ).not.toBeInTheDocument();
    expect(
      within(reliability).getByLabelText("项目名称：论证测试项目"),
    ).toHaveAttribute("contenteditable", "false");
    const opinion = screen.getByRole("textbox", {
      name: "候选单位调研与资质审查意见",
    });
    expect(opinion).toHaveTextContent(
      "通过调研优选三家单位，分别为【候选甲】、【候选乙】、【新第三家】。需补充资质证据。",
    );
    await user.click(opinion);
    const caret = document.createRange();
    caret.setStart(opinion.lastChild!, opinion.lastChild!.textContent!.length);
    caret.collapse(true);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(caret);
    await user.keyboard("另需确认授权。");
    expect(opinion).toHaveTextContent("需补充资质证据。另需确认授权。");
  }

  await user.click(screen.getByRole("tab", { name: "论证成员" }));
  const memberTable = screen.getByRole("table");
  expect(within(memberTable).getAllByRole("row")).toHaveLength(6);
  expect(
    screen.queryByRole("heading", { name: "论证成员 1" }),
  ).not.toBeInTheDocument();
  const unit = within(memberTable).getByRole("combobox", { name: "成员1单位" });
  expect(unit).toHaveAttribute("list", "df-options-selection.member1_unit");
  await user.clear(unit);
  await user.type(unit, "自填单位");
  await user.clear(within(memberTable).getByLabelText("成员1姓名"));
  await user.click(screen.getByRole("tab", { name: "非招标方案" }));
  expect(screen.getByLabelText("本次论证预算（万元）")).toHaveAttribute(
    "readonly",
  );
  const planType = screen.getByRole("combobox", { name: "依托计划类型" });
  expect(
    within(planType)
      .getAllByRole("option")
      .map((o) => o.textContent),
  ).toEqual([
    "请选择",
    "科研设备购置计划",
    "委托研发/技术服务计划",
    "测试化验加工计划",
    "资料出版翻译计划",
    "租赁维护维修计划",
    "大宗材料购置计划",
    "内部测试分析计划",
    "其他",
  ]);
  const fundingSource = screen.getByRole("combobox", {
    name: "本次方案经费来源",
  });
  expect(
    within(fundingSource)
      .getAllByRole("option")
      .map((o) => o.textContent),
  ).toEqual(["请选择", "股份", "集团"]);
  await user.selectOptions(planType, "科研设备购置计划");
  await user.selectOptions(fundingSource, "集团");

  expect(
    screen.queryByRole("heading", { name: /受邀单位/ }),
  ).not.toBeInTheDocument();
  expect(screen.queryByLabelText("项目名称")).not.toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "论证意见" }));
  await user.clear(screen.getByLabelText("项目概况"));
  await user.type(screen.getByLabelText("项目概况"), "核对后的项目概况");
  await user.click(
    screen.getByRole("tab", { name: /^(模板与生成|文件生成)$/ }),
  );
  await user.click(screen.getByRole("button", { name: "核对填写内容 →" }));
  await screen.findByText("请补充成员姓名");
  await user.click(screen.getByRole("button", { name: "修改" }));
  await waitFor(() => expect(screen.getByLabelText("成员1姓名")).toHaveFocus());
  expect(screen.getByRole("tab", { name: "论证成员" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await user.type(screen.getByLabelText("成员1姓名"), "测试成员");
  await user.click(
    screen.getByRole("tab", { name: /^(模板与生成|文件生成)$/ }),
  );
  await user.click(screen.getByRole("button", { name: "核对填写内容 →" }));
  expect(
    screen.getByRole("button", { name: "确认并生成 2 份文书" }),
  ).toBeDisabled();
  await user.click(
    screen.getByRole("checkbox", {
      name: "我已核对论证意见、候选单位、成员与系统填报信息",
    }),
  );
  await user.click(screen.getByRole("button", { name: "确认并生成 2 份文书" }));
  const list = document.querySelector(".df-results-docked") as HTMLElement;
  await waitFor(() => expect(list).toBeInTheDocument());
  expect(screen.queryByLabelText("项目概况")).not.toBeInTheDocument();
  await user.click(
    within(list).getByRole("button", { name: /^02_非招标方案填报/ }),
  );
  const dock = screen.getByRole("complementary", {
    name: "项目智能体与文件预览",
  });
  expect(await within(dock).findByTestId("selection-office")).toHaveTextContent(
    "非招标方案填报",
  );
  expect(previews[previews.length - 1]).toMatchObject({ extension: "xlsx" });
  await user.click(screen.getByRole("tab", { name: "内容填写" }));
  await user.click(screen.getByRole("tab", { name: "非招标方案" }));
  expect(screen.getByLabelText("项目概况")).toHaveValue("核对后的项目概况");
  expect(screen.getByLabelText("成员1单位")).toHaveValue("自填单位");
  expect(screen.getByRole("combobox", { name: "依托计划类型" })).toHaveValue(
    "科研设备购置计划",
  );
  expect(
    screen.getByRole("combobox", { name: "本次方案经费来源" }),
  ).toHaveValue("集团");

  expect(
    screen.queryByRole("button", { name: "← 返回选商论证" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByLabelText("填写流程")).not.toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "审批资料" }));
  expect(screen.getByRole("heading", { name: /^审批资料$/ })).toBeVisible();
  await user.click(screen.getByRole("tab", { name: "内容填写" }));
  expect(screen.getByLabelText("项目概况")).toHaveValue("核对后的项目概况");
  if (linked) {
    expect(savedValues[0]["selection.reliability"]).toBe(
      reliabilityPrefix + "可靠性保留意见。",
    );
    expect(savedValues[0]["selection.qualification_review"]).toBe(
      "通过调研优选三家单位，分别为候选甲、候选乙、新第三家。需补充资质证据。另需确认授权。",
    );
    await user.click(screen.getByRole("tab", { name: "论证意见" }));
    expect(
      screen.getByRole("textbox", { name: "候选单位调研与资质审查意见" }),
    ).toHaveTextContent(
      "通过调研优选三家单位，分别为【候选甲】、【候选乙】、【新第三家】。需补充资质证据。另需确认授权。",
    );
    expect(
      state.fields.find((f) => f.key === "selection.budget_wan")!.value,
    ).toBe("45");
    if (paste) {
      const editor = screen.getByRole("textbox", {
        name: "候选单位调研与资质审查意见",
      });
      await user.click(editor);
      const selected = document.createRange();
      selected.selectNodeContents(editor);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(selected);
      await user.paste(
        "保留我的原句。\n<img src=x onerror=alert(1)>仅作为文字。",
      );
      expect(editor.textContent).toBe(
        "保留我的原句。\n<img src=x onerror=alert(1)>仅作为文字。",
      );
      expect(editor.querySelector("img")).toBeNull();
      await user.click(screen.getByRole("button", { name: "保存草稿" }));
      expect(
        savedValues[savedValues.length - 1]["selection.qualification_review"],
      ).toBe("保留我的原句。\n<img src=x onerror=alert(1)>仅作为文字。");
    }
  }
}

it("fills selection opinion and upload fields with shared project references and previews generated files", async () => {
  await exerciseSelectionPage();
}, 30000);
it("links selection opinion facts to approval and candidate fields while preserving authored findings", async () => {
  await exerciseSelectionPage(true);
}, 30000);
// This runs the full selection/generation workflow before testing inline
// editing, plain-text paste and saving; individual waits retain their budgets.
it("edits inline opinion prose and pastes plain text without detached reference blocks or HTML", async () => {
  await exerciseSelectionPage(true, true);
}, 45000);

it("imports shared information from the existing Excel template into a reviewed profile draft and preserves blank and unselected values", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  const project = {
    id: "profile-import",
    name: "原项目",
    code: "P001",
    owner: "经办人",
    revision: 1,
    fields: [
      {
        key: "project.name",
        label: "项目名称",
        group: "项目资料",
        kind: "text",
        value: "原项目",
      },
      {
        key: "project.code",
        label: "项目编号",
        group: "项目资料",
        kind: "text",
        value: "P001",
      },
      {
        key: "contact.name",
        label: "项目联系人",
        group: "单位与联系",
        kind: "text",
        value: "原联系人",
      },
      {
        key: "contact.phone",
        label: "办公电话",
        group: "单位与联系",
        kind: "text",
        value: "010-12345678",
      },
    ],
    stages: [],
    forms: [],
    single_form: true,
  };
  let fail = true;
  const saves: FormSaveFixture[] = [];
  const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/document-forms/projects") return reply([project]);
    if (url.endsWith("/assistant")) return reply({ messages: [] });
    if (url === "/document-forms/projects/profile-import/profile/import") {
      expect(init?.body).toBeInstanceOf(FormData);
      expect((init?.body as FormData).get("revision")).toBe("1");
      expect(((init?.body as FormData).get("workbook") as File).name).toBe(
        "之前的模板.xlsx",
      );
      if (fail) {
        fail = false;
        return new Response(JSON.stringify({ detail: "Excel 缺少变量配置" }), {
          status: 422,
        });
      }
      return reply({
        revision: 1,
        fields: [
          { ...project.fields[0], value: "Excel 项目" },
          { ...project.fields[2], value: "Excel 联系人" },
        ],
      });
    }
    if (url === "/document-forms/projects/profile-import") {
      if (init?.method === "PUT") {
        const body = JSON.parse(String(init.body));
        saves.push(body);
        project.name = body.name;
        project.code = body.code;
        project.owner = body.owner;
        project.fields = project.fields.map((f) => ({
          ...f,
          value: body.values[f.key],
        }));
        project.revision++;
      }
      return reply(project);
    }
    throw new Error("Unexpected profile import request: " + url);
  });
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        ReactDOM,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {},
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => {
    registerPackedDocumentForms(window, URL);
  });
  renderWithProviders(<Page />);
  await user.click(await screen.findByRole("button", { name: "基础信息填报" }));
  const phone = screen.getByLabelText("办公电话");
  await user.clear(phone);
  await user.type(phone, "010-87654321");
  const file = new File(["xlsx"], "之前的模板.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await user.upload(screen.getByLabelText("导入基础信息 Excel"), file);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Excel 缺少变量配置",
  );
  expect(phone).toHaveValue("010-87654321");
  await user.upload(screen.getByLabelText("导入基础信息 Excel"), file);
  const preview = await screen.findByRole("dialog", { name: "导入基础信息" });
  expect(preview).toHaveTextContent("Excel 项目");
  expect(saves).toHaveLength(0);
  await user.click(within(preview).getByRole("button", { name: "取消" }));
  expect(screen.getByLabelText("项目名称")).toHaveValue("原项目");
  await user.upload(screen.getByLabelText("导入基础信息 Excel"), file);
  const dialog = await screen.findByRole("dialog", { name: "导入基础信息" });
  await user.click(
    within(dialog).getByRole("checkbox", { name: "导入项目联系人" }),
  );
  await user.click(
    within(dialog).getByRole("button", { name: "应用到基础信息" }),
  );
  expect(screen.getByLabelText("项目名称")).toHaveValue("Excel 项目");
  expect(screen.getByLabelText("项目联系人")).toHaveValue("原联系人");
  expect(phone).toHaveValue("010-87654321");
  expect(saves).toHaveLength(0);
  await user.click(screen.getAllByRole("button", { name: "保存基础信息" })[0]);
  await waitFor(() => expect(saves).toHaveLength(1));
  expect(saves[0]).toMatchObject({
    name: "Excel 项目",
    code: "P001",
    owner: "经办人",
    values: { "contact.name": "原联系人", "contact.phone": "010-87654321" },
  });
}, 30000);

async function exerciseApprovalViewer(deleting = false) {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  const files: Array<MaterialFileFixture & { version?: number }> = [
    {
      id: "approval-pdf",
      name: "批复.pdf",
      mime: "application/pdf",
      size: 10,
      uploaded_at: "2026-11-02T00:00:00Z",
    },
    {
      id: "approval-image",
      name: "签章.png",
      mime: "image/png",
      size: 10,
      uploaded_at: "2026-11-02T01:00:00Z",
    },
  ];
  files.forEach((file, index) => Object.assign(file, { version: index + 1 }));
  const project = {
    id: "approval-project",
    name: "审批预览项目",
    code: "",
    owner: "",
    revision: 1,
    fields: [],
    forms: [],
    stages: [
      {
        id: "plan",
        title: "上报计划",
        status: "pending",
        upstream_changed: [],
        missing_required: [],
        due_date: "",
        notes: "",
        system_name: "",
        system_url: "",
        submission_ref: "",
        materials: [
          {
            id: "approval",
            name: "计划批复或系统回执",
            required: false,
            status: "preparing",
            note: "",
            files,
          },
          {
            id: "other",
            name: "科研计划填报表",
            required: false,
            status: "preparing",
            note: "",
            files: [
              {
                id: "other-excel",
                name: "计划填报.xlsx",
                mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                size: 10,
                uploaded_at: "2026-11-02T00:00:00Z",
              },
            ],
          },
        ],
      },
    ],
  };
  let failPdf = true;
  const loadPreview = vi.fn();
  const loadPdfPreview = vi.fn(async () => ({ url }: { url: string }) => (
    <div data-testid="inline-pdf-reader">{url}</div>
  ));
  const binaryCalls: string[] = [];
  let deleteCalls = 0,
    restoreCalls = 0;
  const trash = new Map<string, (typeof files)[number]>();
  const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/document-forms/projects") return reply([project]);
    if (url === "/document-forms/projects/approval-project")
      return reply(project);
    if (url.endsWith("/assistant")) return reply({ messages: [] });
    if (init?.method === "DELETE") {
      deleteCalls++;
      expect(JSON.parse(String(init.body)).revision).toBe(project.revision);
      if (deleteCalls === 1)
        return new Response(JSON.stringify({ detail: "删除失败，请重试" }), {
          status: 503,
        });
      const id = url.split("/").slice(-1)[0] as string;
      const material = project.stages[0].materials[0];
      const file = material.files.find((f) => f.id === id);
      expect(file).toBeTruthy();
      trash.set(id, file!);
      material.files = material.files.filter((f) => f.id !== id);
      if (!material.files.length) material.status = "pending";
      project.revision++;
      return reply(project);
    }
    if (url.endsWith("/restore")) {
      restoreCalls++;
      expect(JSON.parse(String(init?.body)).revision).toBe(project.revision);
      if (restoreCalls === 1)
        return new Response(JSON.stringify({ detail: "恢复失败，请重试" }), {
          status: 503,
        });
      const id = url.split("/").slice(-2)[0] as string;
      const material = project.stages[0].materials[0];
      material.files.push(trash.get(id)!);
      trash.delete(id);
      material.files.sort((a, b) => a.version! - b.version!);
      project.revision++;
      return reply(project);
    }
    if (url.includes("/files/")) {
      expect(init?.headers).toEqual({ "X-Agent-Id": "default" });
      expect(init?.signal).toBeInstanceOf(AbortSignal);
      binaryCalls.push(url);
      if (url.endsWith("approval-pdf") && failPdf) {
        failPdf = false;
        return new Response("retry", { status: 503 });
      }
      return new Response("bytes", {
        headers: {
          "Content-Type": url.endsWith("approval-pdf")
            ? "application/pdf"
            : "image/png",
        },
      });
    }
    throw new Error("Unexpected approval viewer request: " + url);
  });
  let created = 0;
  const revoke = vi.fn();
  vi.stubGlobal(
    "URL",
    Object.assign(class extends URL {}, {
      createObjectURL: () => "blob:approval-" + ++created,
      revokeObjectURL: revoke,
    }),
  );
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        ReactDOM,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: { loadPreview, loadPdfPreview },
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => registerPackedDocumentForms(window, URL));
  const view = renderWithProviders(<Page />);
  await user.click(await screen.findByRole("button", { name: /01 上报计划/ }));
  expect(binaryCalls).toHaveLength(0);
  await user.click(screen.getByRole("tab", { name: "审批资料" }));
  expect(await screen.findByRole("img", { name: "签章.png" })).toBeVisible();
  expect(binaryCalls).toEqual([
    "/document-forms/projects/approval-project/files/approval-image",
  ]);
  expect(loadPreview).not.toHaveBeenCalled();
  expect(screen.queryByText("科研计划填报表")).not.toBeVisible();
  await user.click(screen.getByRole("tab", { name: "其他附件" }));
  expect(screen.getByRole("heading", { name: "其他附件 1" })).toBeVisible();
  expect(screen.getByText("科研计划填报表")).toBeVisible();
  expect(
    screen.queryByRole("img", { name: "签章.png" }),
  ).not.toBeInTheDocument();
  expect(binaryCalls).toHaveLength(1);
  await user.click(screen.getByRole("tab", { name: "审批资料" }));
  expect(screen.getByRole("img", { name: "签章.png" })).toBeVisible();
  expect(binaryCalls).toHaveLength(1);
  await user.selectOptions(
    screen.getByRole("combobox", { name: "审批文件版本" }),
    "approval-pdf",
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("文件未能打开");
  await user.click(screen.getByRole("button", { name: "重新加载审批文件" }));
  expect(await screen.findByTestId("inline-pdf-reader")).toHaveTextContent(
    "blob:approval-2",
  );
  expect(loadPdfPreview).toHaveBeenCalledTimes(1);
  expect(typeof (await createWorkspaceNamespace().loadPdfPreview())).toBe(
    "function",
  );
  await user.selectOptions(
    screen.getByRole("combobox", { name: "审批文件版本" }),
    "approval-image",
  );
  expect(screen.getByRole("img", { name: "签章.png" })).toHaveAttribute(
    "src",
    "blob:approval-1",
  );
  expect(binaryCalls).toHaveLength(3);
  expect(loadPreview).not.toHaveBeenCalled();
  if (deleting) {
    await user.selectOptions(
      screen.getByRole("combobox", { name: "审批文件版本" }),
      "approval-pdf",
    );
    await user.click(screen.getByRole("button", { name: "删除批复.pdf版本1" }));
    let dialog = screen.getByRole("dialog", { name: "删除审批文件" });
    expect(dialog).toHaveTextContent("V1 · 批复.pdf");
    expect(deleteCalls).toBe(0);
    await user.click(within(dialog).getByRole("button", { name: "取消" }));
    expect(deleteCalls).toBe(0);
    expect(screen.getByTestId("inline-pdf-reader")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "删除批复.pdf版本1" }));
    dialog = screen.getByRole("dialog", { name: "删除审批文件" });
    await user.click(within(dialog).getByRole("button", { name: "确认删除" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "删除失败，请重试",
    );
    expect(screen.getByTestId("inline-pdf-reader")).toBeInTheDocument();
    expect(revoke).not.toHaveBeenCalledWith("blob:approval-2");
    await user.click(within(dialog).getByRole("button", { name: "确认删除" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("img", { name: "签章.png" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "审批文件版本" })).toHaveValue(
      "approval-image",
    );
    expect(
      screen.getByRole("option", { name: "V2 · 签章.png" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "V1 · 批复.pdf" }),
    ).not.toBeInTheDocument();
    expect(revoke).toHaveBeenCalledWith("blob:approval-2");
    await user.click(screen.getByRole("button", { name: "撤销删除" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "恢复失败，请重试",
    );
    expect(screen.getByRole("button", { name: "撤销删除" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "撤销删除" }));
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "V1 · 批复.pdf" }),
      ).toBeInTheDocument(),
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "审批文件版本" }),
      "approval-pdf",
    );
    expect(await screen.findByTestId("inline-pdf-reader")).toHaveTextContent(
      "blob:approval-3",
    );
    expect(binaryCalls).toHaveLength(4);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "审批文件版本" }),
      "approval-image",
    );
    await user.click(screen.getByRole("button", { name: "删除签章.png版本2" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "删除审批文件" })).getByRole(
        "button",
        { name: "确认删除" },
      ),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "删除批复.pdf版本1" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "删除审批文件" })).getByRole(
        "button",
        { name: "确认删除" },
      ),
    );
    expect(await screen.findByText("尚未上传审批文件")).toBeVisible();
    expect(
      screen.queryByRole("combobox", { name: "审批文件版本" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("inline-pdf-reader")).not.toBeInTheDocument();
    expect(revoke).toHaveBeenCalledWith("blob:approval-3");
    await user.click(screen.getByRole("button", { name: "撤销删除" }));
    expect(await screen.findByTestId("inline-pdf-reader")).toHaveTextContent(
      "blob:approval-4",
    );
    expect(
      screen.getByRole("option", { name: "V1 · 批复.pdf" }),
    ).toBeInTheDocument();
    expect(deleteCalls).toBe(4);
  }
  view.unmount();
  expect(revoke).toHaveBeenCalledWith("blob:approval-1");
  expect(revoke).toHaveBeenCalledWith("blob:approval-2");
}

it("separates approval documents from other attachments and lazily reuses direct PDF and image previews with retry", async () => {
  await exerciseApprovalViewer();
}, 30000);
it("deletes only the confirmed approval version, preserves numbering and preview state, and supports retry and undo", async () => {
  await exerciseApprovalViewer(true);
}, 30000);

it("groups negotiation content into five ordered tabs without duplicating fields and keeps recipients, drafts and issue navigation", async () => {
  const user = userEvent.setup();
  let Page: React.ComponentType = () => null;
  const definitions = [
    ["project.name", "项目名称", "项目资料"],
    ["project.background", "项目背景", "项目资料"],
    ["project.task", "项目任务", "项目资料"],
    ["research.contents", "研究内容", "研究内容"],
    ["research.technical_requirements", "技术要求", "研究内容"],
    ["deliverables.results", "预期成果", "成果与考核"],
    ["metrics.criteria", "考核指标", "成果与考核"],
    ["workload.items", "实物工作量", "研究内容"],
    ["milestones.schedule", "进度安排", "进度安排"],
    ["qualification.start_year", "资质起始年份", "资格要求"],
    ["events.negotiation_time", "谈判时间", "日期安排"],
    ["place.negotiation", "谈判地点", "地点安排"],
    ["contact.name", "联系人", "单位与联系"],
    ["budget.ceiling_number", "最高限价", "费用信息"],
    ["implementation.year", "实施年度", "服务选商实施方案"],
  ];
  const state = {
    id: "grouped-case",
    name: "商务谈判",
    stage_id: "negotiation",
    revision: 1,
    updated_at: "2026-11-02T10:00:00Z",
    fields: definitions.map(([key, label, group]) => ({
      key,
      label,
      group,
      kind: "text",
      value: key === "qualification.start_year" ? "2020" : label + "原文",
      required: true,
    })),
    recipients: [
      { name: "甲单位", start: "2026-11-03T09:00", end: "2026-11-03T10:00" },
    ],
    templates: [
      { id: "t", name: "谈判模板.docx", keys: [], per_recipient: false },
    ],
    generations: [],
    rules: [],
  };
  const project = {
    id: "grouped-project",
    name: "分组项目",
    code: "",
    owner: "",
    revision: 1,
    single_form: true,
    form_id: state.id,
    fields: [],
    forms: [],
    stages: stageIds.map((id, i) => ({
      id,
      title: stageNames[i],
      status: "pending",
      purpose: "",
      materials: [],
      upstream_changed: [],
      missing_required: [],
      due_date: "",
      notes: "",
      system_name: "",
      system_url: "",
      submission_ref: "",
    })),
  };
  const saves: FormSaveFixture[] = [];
  const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/document-forms/projects") return reply([project]);
    if (url === "/document-forms/projects/grouped-project")
      return reply(project);
    if (url.endsWith("/assistant")) return reply({ messages: [] });
    if (url.endsWith("/form")) return reply(state);
    if (url === "/document-forms/cases/grouped-case") {
      if (init?.method === "PUT") {
        const body = JSON.parse(String(init.body));
        saves.push(body);
        state.fields = state.fields.map((f) => ({
          ...f,
          value: body.values[f.key],
        }));
        state.recipients = body.recipients;
        state.revision++;
      }
      return reply(state);
    }
    if (url.endsWith("/review"))
      return reply({
        checks: [
          {
            field: "workload.items",
            label: "实物工作量",
            status: "missing",
            detail: "请补充实物工作量",
          },
        ],
        can_generate: false,
      });
    throw new Error("Unexpected grouping request: " + url);
  });
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        ReactDOM,
        fetch: hostFetch,
        useTheme: () => "light",
        getSelectedAgentId: () => "default",
      },
      workspace: {},
      registerRoutes: (
        _id: string,
        routes: Array<{ component: React.ComponentType }>,
      ) => {
        Page = routes[0].component;
      },
    },
  });
  await act(async () => registerPackedDocumentForms(window, URL));
  renderWithProviders(<Page />);
  await user.click(await screen.findByRole("button", { name: /03 商务谈判/ }));
  const tabs = await screen.findByRole("tablist", { name: "填写内容分组" });
  expect(
    within(tabs)
      .getAllByRole("tab")
      .map((t) => t.textContent),
  ).toEqual([
    "项目研究内容",
    "考核指标与进度安排",
    "受邀单位与资格要求",
    "谈判要求",
    "实施方案",
    "文件生成",
  ]);
  const expected = [
    ["项目研究内容", definitions.slice(0, 5)],
    ["考核指标与进度安排", definitions.slice(5, 9)],
    ["受邀单位与资格要求", definitions.slice(9, 10)],
    ["谈判要求", definitions.slice(10, 14)],
    ["实施方案", definitions.slice(14)],
  ] as const;
  const controls = new Map(
    definitions.map(([key, label]) => {
      const matches = screen.getAllByLabelText(label, { exact: true });
      expect(matches).toHaveLength(1);
      return [key, matches[0]];
    }),
  );
  for (const [tab, fields] of expected) {
    fireEvent.click(within(tabs).getByRole("tab", { name: tab }));
    const panel = screen.getByRole("tabpanel", { name: tab });
    expect(panel).toBeVisible();
    for (const [key] of definitions) {
      expect(panel.contains(controls.get(key)!)).toBe(
        fields.some((f) => f[0] === key),
      );
    }
    if (tab === "受邀单位与资格要求") {
      expect(screen.getByLabelText("第1家单位名称")).toBeVisible();
      fireEvent.change(screen.getByLabelText("第1家单位名称"), {
        target: { value: "甲单位（保留）" },
      });
      await user.click(screen.getByRole("button", { name: "＋ 添加单位" }));
      fireEvent.change(screen.getByLabelText("第2家单位名称"), {
        target: { value: "乙单位" },
      });
    }
  }
  await user.click(within(tabs).getByRole("tab", { name: "项目研究内容" }));
  fireEvent.change(screen.getByLabelText("项目背景"), {
    target: { value: "项目背景原文追加原句。" },
  });
  await user.click(
    within(screen.getByRole("tablist", { name: "填写内容分组" })).getByRole(
      "tab",
      { name: "考核指标与进度安排" },
    ),
  );
  fireEvent.change(screen.getByLabelText("实物工作量"), {
    target: { value: "实物工作量原文新增工作量。" },
  });
  await user.click(screen.getByRole("tab", { name: "审批资料" }));
  await user.click(screen.getByRole("tab", { name: "内容填写" }));
  expect(screen.getByLabelText("实物工作量")).toBeVisible();
  expect(screen.getByLabelText("实物工作量")).toHaveValue(
    "实物工作量原文新增工作量。",
  );
  await user.click(within(tabs).getByRole("tab", { name: "文件生成" }));
  await user.click(screen.getByRole("button", { name: "核对填写内容 →" }));
  await screen.findByText("请补充实物工作量");
  expect(saves).toHaveLength(1);
  expect(saves[0].values["project.background"]).toBe("项目背景原文追加原句。");
  expect(saves[0].values["workload.items"]).toBe("实物工作量原文新增工作量。");
  expect(saves[0].recipients!.map((r) => r.name)).toEqual([
    "甲单位（保留）",
    "乙单位",
  ]);
  await user.click(screen.getByRole("button", { name: "修改" }));
  expect(
    within(screen.getByRole("tablist", { name: "填写内容分组" })).getByRole(
      "tab",
      { name: "考核指标与进度安排" },
    ),
  ).toHaveAttribute("aria-selected", "true");
  await waitFor(() =>
    expect(screen.getByLabelText("实物工作量")).toHaveFocus(),
  );
}, 30000);
