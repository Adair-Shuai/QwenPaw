import fs from "node:fs";
import path from "node:path";
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  screen,
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
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "QwenPaw");
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
      const hostFetch = vi.fn(async (url: string, init?: RequestInit) => {
        let result: any;
        const body =
          typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
        calls.push({ url, body });
        if (url.includes("/print/")) {
          return new Response(new Blob(["png"], { type: "image/png" }), {
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
          fs.readFileSync(
            path.resolve(
              process.cwd(),
              "../plugins/apps/document-forms/ui/index.js",
            ),
            "utf8",
          ),
        )();
      });
      renderWithProviders(<Page />);
      expect(screen.getByText("从 Excel 变量表开始")).toBeInTheDocument();
      await user.upload(
        screen.getByLabelText("导入 Excel 变量表"),
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
      expect(
        await screen.findByRole("img", { name: /打印版式/ }),
      ).toHaveAttribute("src", "blob:print-pages");
      expect(screen.getByText("共 2 页")).toBeInTheDocument();
      await user.selectOptions(screen.getByLabelText("预览比例"), "150");
      expect(screen.getByRole("img", { name: /打印版式/ })).toHaveStyle({
        width: "150%",
      });
      expect(calls.some((call) => call.url.includes("/print/g1/"))).toBe(true);
      await user.click(
        screen.getByRole("button", { name: "文字预览" }),
      );
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
    });
  },
);
