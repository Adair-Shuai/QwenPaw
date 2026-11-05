import { useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import ComposedProvider from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/ChatAnywhere/ComposedProvider";
import ResponseTool from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Tool";
import {
  AgentScopeRuntimeContentType,
  AgentScopeRuntimeMessageType,
  AgentScopeRuntimeRunStatus,
  type IAgentScopeRuntimeMessage,
} from "@agentscope-ai/chat";
import { ToolCallTurnEndedContext } from "@/components/Chat/ToolCards/shared/ToolCallTurnContext";
import zh from "@/locales/zh.json";
import en from "@/locales/en.json";
import ExecutionProcess from "./ExecutionProcess";

afterEach(cleanup);

function tool(id: string, state = "done"): IAgentScopeRuntimeMessage {
  return {
    id,
    type: AgentScopeRuntimeMessageType.FUNCTION_CALL,
    role: "assistant",
    status: AgentScopeRuntimeRunStatus.Completed,
    content: [
      {
        type: AgentScopeRuntimeContentType.DATA,
        status: AgentScopeRuntimeRunStatus.Completed,
        data: {
          name: "read_file",
          call_id: id,
          arguments: { path: "demo.csv" },
        },
      },
      {
        type: AgentScopeRuntimeContentType.DATA,
        status: AgentScopeRuntimeRunStatus.Completed,
        data: { call_id: id, state, output: "synthetic file content" },
      },
    ],
  };
}

async function fixture(messages: IAgentScopeRuntimeMessage[] = [tool("read")]) {
  const i18n = createInstance();
  await i18n.init({
    lng: "zh",
    resources: { zh: { translation: zh }, en: { translation: en } },
    interpolation: { escapeValue: false },
  });
  const action = vi.fn();
  function NativePluginCard({ data }: { data: IAgentScopeRuntimeMessage }) {
    const [draft, setDraft] = useState("");
    const result = data.content[1];
    const output =
      result && "data" in result && typeof result.data === "object"
        ? result.data?.output
        : undefined;
    return (
      <div>
        <span>{String(output ?? "")}</span>
        <input
          aria-label="工具记录备注"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="button" onClick={() => action(data.id)}>
          插件原有操作
        </button>
      </div>
    );
  }
  const view = (items = messages, ended = true) => (
    <I18nextProvider i18n={i18n}>
      <ComposedProvider
        options={{
          api: {},
          customToolRenderConfig: { read_file: NativePluginCard },
          session: {
            currentSessionId: undefined,
            api: {
              getSessionList: async () => [],
              getSession: async (id) => ({ id, name: id, messages: [] }),
              createSession: async () => ({
                sessions: [],
                session: { id: "test", name: "test", messages: [] },
              }),
              updateSession: async () => [],
              removeSession: async () => [],
            },
          },
        }}
        cards={{}}
      >
        <ToolCallTurnEndedContext.Provider value={ended}>
          <ExecutionProcess
            messages={items}
            status={ended ? "finished" : "generating"}
            defaultOpen={false}
            renderMessage={(message) => <ResponseTool data={message} />}
          />
        </ToolCallTurnEndedContext.Provider>
      </ComposedProvider>
    </I18nextProvider>
  );
  const rendered = render(view());
  await act(async () => {});
  return { ...rendered, view, action, i18n };
}

describe("lightweight inline execution process", () => {
  it("lazily opens real native plugin records and preserves their live props and actions", async () => {
    const { rerender, view, action, i18n } = await fixture();
    expect(
      screen.queryByText("synthetic file content"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "执行完成 1 个步骤" }));
    fireEvent.click(screen.getByRole("button", { name: "读取文件 工具" }));
    expect(
      screen.queryByText("synthetic file content"),
    ).not.toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByText("查看原始记录")));
    expect(await screen.findByText("synthetic file content")).toBeVisible();
    const input = screen.getByRole("textbox", { name: "工具记录备注" });
    fireEvent.change(input, { target: { value: "keep my draft" } });
    const updated = tool("read");
    updated.content[1] = {
      type: AgentScopeRuntimeContentType.DATA,
      status: AgentScopeRuntimeRunStatus.Completed,
      data: { output: "new native output" },
    };
    rerender(view([updated]));
    expect(screen.getByText("new native output")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "工具记录备注" })).toBe(input);
    expect(input).toHaveValue("keep my draft");
    await act(async () => i18n.changeLanguage("en"));
    expect(
      screen.getByRole("button", { name: "Read file Tool" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveValue("keep my draft");
    fireEvent.click(screen.getByRole("button", { name: "插件原有操作" }));
    expect(action).toHaveBeenCalledWith("read");
    fireEvent.click(
      screen.getByRole("button", { name: "Execution complete 1 steps" }),
    );
    expect(
      screen.queryByRole("textbox", { name: "工具记录备注" }),
    ).not.toBeInTheDocument();
  });

  it("keeps a failed call visible after a later successful call and focuses its real record", async () => {
    await fixture([tool("failed", "error"), tool("succeeded")]);
    expect(
      screen.getByRole("button", { name: "执行完成 2 个步骤" }),
    ).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(
      screen.getByRole("button", { name: "1 个步骤失败，查看记录" }),
    );
    const failure = screen.getByRole("button", { name: "读取文件 执行失败" });
    expect(failure).toHaveFocus();
    expect(failure).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "读取文件 工具" })).toBeVisible();
    expect(screen.queryByText(/已自动恢复/)).not.toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByText("查看原始记录")));
    expect(
      await screen.findByRole("button", { name: "插件原有操作" }),
    ).toBeVisible();
  });

  it("supports keyboard disclosure and never counts delivered arguments as completed execution", async () => {
    const pending = tool("pending");
    pending.content = pending.content.slice(0, 1);
    const { rerender, view, container } = await fixture([pending]);
    rerender(view([pending], false));
    const user = userEvent.setup();
    const header = screen.getByRole("button", {
      name: "正在读取文件 已完成 0 步",
    });
    header.focus();
    await user.keyboard("{Enter}");
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(
      container.querySelector('[data-execution-state="running"]'),
    ).toBeTruthy();
    await user.keyboard(" ");
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("list", { name: "执行过程" }),
    ).not.toBeInTheDocument();
    rerender(view([pending], true));
    fireEvent.click(
      screen.getByRole("button", { name: "1 个步骤中断，查看记录" }),
    );
    expect(
      container.querySelector('[data-execution-state="running"]'),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "读取文件 已中断" }),
    ).toBeVisible();
  });
});
