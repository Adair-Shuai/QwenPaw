import fs from "node:fs";
import path from "node:path";
import React from "react";
import { act, cleanup, screen, waitFor } from "@testing-library/react";
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
        ],
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
        if (url === "/workspace/convert-office")
          result = {
            engine: "officecli",
            html: "<html><body>新项目 · 甲单位</body></html>",
          };
        else if (url.endsWith("/cases") && !init?.method) result = [];
        else if (url.endsWith("/cases") && init?.method === "POST")
          result = state;
        else if (url.endsWith("/templates")) {
          expect((body as FormData).getAll("files")).toHaveLength(1);
          state = {
            ...state,
            revision: state.revision + 1,
            templates: [
              {
                id: "t1",
                name: "邀请函.docx",
                keys: ["project.name", "invitation.recipient"],
                per_recipient: true,
              },
            ],
          };
          result = state;
        } else if (init?.method === "PUT") {
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
                files: [
                  {
                    name: "邀请函_甲单位.docx",
                    recipient: "甲单位",
                    size: 42000,
                    preview_url: "/api/files/preview/output.docx",
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
      const paragraphs = screen.getByRole("textbox", {
        name: "研究内容（整段）",
      });
      expect(paragraphs.tagName).toBe("TEXTAREA");
      expect(paragraphs).toHaveValue("第一项\n第二项");
      await user.type(paragraphs, "\n第三项");
      await user.upload(
        screen.getByLabelText("导入 Word 模板"),
        new File(["docx"], "邀请函.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      );
      await screen.findByText("按受邀单位分别生成");
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
        screen.getByRole("button", { name: "确认并生成 1 份文书" }),
      ).toBeDisabled();
      expect(calls.filter((c) => c.url.endsWith("/generate"))).toHaveLength(0);
      expect(state.fields[0].value).toBe("新项目");
      expect(state.fields[1].value).toBe("第一项\n第二项\n第三项");
      await user.click(screen.getByRole("checkbox"));
      await user.click(
        screen.getByRole("button", { name: "确认并生成 1 份文书" }),
      );
      await screen.findByText("1 份文件已生成");
      await waitFor(
        () =>
          expect(screen.getByTitle("邀请函_甲单位.docx")).toHaveAttribute(
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
    });
  },
);
