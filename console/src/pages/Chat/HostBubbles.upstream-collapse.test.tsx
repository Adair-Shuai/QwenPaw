import { useState, type FC, type ReactNode } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import ComposedProvider from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/ChatAnywhere/ComposedProvider";
import {
  AgentScopeRuntimeContentType,
  AgentScopeRuntimeMessageType,
  AgentScopeRuntimeRunStatus,
  type IAgentScopeRuntimeMessage,
} from "@agentscope-ai/chat";
import { HostResponseCard } from "./HostBubbles";
import { adaptCardForV1 } from "../../components/Chat/ToolCards/adapters/v1Adapter";
import ReadFileCard from "../../components/Chat/ToolCards/cards/ReadFileCard";
import GenericToolCard from "../../components/Chat/ToolCards/cards/GenericToolCard";
import {
  setAssistantMessageDisplayPreference,
  setShowThinkingPreference,
} from "../../utils/chatDisplayPreference";
import zh from "../../locales/zh.json";
import en from "../../locales/en.json";

// Keep the real response builder, Accordion, Reasoning, Tool dispatcher,
// v1 adapter, and tool shell. These leaves are unrelated to disclosure.
vi.mock("../../plugins/registry/useChatExtensions", () => ({
  useChatScalarSnapshot: () => ({}),
  useChatListSnapshot: () => new Proxy({}, { get: () => [] }),
}));
vi.mock("./AssistantMarkdown", () => ({
  AssistantMarkdown: ({ content }: { content: string }) => <p>{content}</p>,
}));
vi.mock("../../components/RenderableCodeBlock", () => ({
  renderableCodeComponents: {},
}));
vi.mock("../../features/files-workspace/ResponseArtifactList", () => ({
  default: () => null,
}));
vi.mock("../../components/Chat/MediaDownload", () => ({
  DownloadableAudios: () => null,
}));
vi.mock(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Actions",
  () => ({ default: () => null }),
);
// Approval's dispatch/status UI has its own integration regressions. Keep its
// real Tool path here and isolate only that visual leaf from SDK form state.
vi.mock(
  "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Approval",
  () => ({
    default: () => <button type="button">批准合成操作</button>,
  }),
);
// The shared lightweight design alias omits ConfigContext. Supply the real
// React context contract required by SDK primitives without stubbing them.
vi.mock("@agentscope-ai/design", async (importOriginal) => {
  const design = await importOriginal<Record<string, unknown>>();
  const { createContext } = await import("react");
  const ConfigContext = createContext({
    getPrefixCls: (suffix?: string) =>
      suffix ? `test-chat-${suffix}` : "test-chat",
  });
  return {
    ...design,
    ConfigProvider: Object.assign(
      ({ children }: { children?: ReactNode }) => <>{children}</>,
      { ConfigContext },
    ),
  };
});
vi.mock("@agentscope-ai/icons", async (importOriginal) => {
  const icons = await importOriginal<Record<string, unknown>>();
  const placeholder = () => <span />;
  return new Proxy(icons, {
    has: (target, key) =>
      Reflect.has(target, key) || String(key).startsWith("Spark"),
    get: (target, key) =>
      Reflect.get(target, key) ??
      (String(key).startsWith("Spark") ? placeholder : undefined),
  });
});

const HEADER_SELECTOR =
  '[class*="-accordion-group-header-open"], [class*="-accordion-group-header-close"]';
const toolRenderers = {
  read_file: adaptCardForV1(ReadFileCard),
  inspect_synthetic: adaptCardForV1(GenericToolCard),
  approval_tool: adaptCardForV1(GenericToolCard),
};
let i18n: ReturnType<typeof createInstance>;

beforeEach(async () => {
  localStorage.clear();
  i18n = createInstance();
  await i18n.init({
    lng: "zh",
    resources: { zh: { translation: zh }, en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});
afterEach(() => {
  cleanup();
  localStorage.clear();
});

function text(id: string, value: string): IAgentScopeRuntimeMessage {
  return {
    id,
    type: AgentScopeRuntimeMessageType.MESSAGE,
    role: "assistant",
    status: AgentScopeRuntimeRunStatus.Completed,
    content: [
      {
        type: AgentScopeRuntimeContentType.TEXT,
        status: AgentScopeRuntimeRunStatus.Completed,
        text: value,
      },
    ],
  };
}

function reasoning(): IAgentScopeRuntimeMessage {
  return {
    id: "reasoning",
    type: AgentScopeRuntimeMessageType.REASONING,
    role: "assistant",
    status: AgentScopeRuntimeRunStatus.Completed,
    content: [
      {
        type: AgentScopeRuntimeContentType.TEXT,
        status: AgentScopeRuntimeRunStatus.Completed,
        text: "合成思考内容",
      },
    ],
  };
}

function call(id = "read", name = "read_file"): IAgentScopeRuntimeMessage {
  return {
    id: `call-${id}`,
    type: AgentScopeRuntimeMessageType.FUNCTION_CALL,
    role: "assistant",
    // Delivery of the arguments is complete, while execution has no result.
    status: AgentScopeRuntimeRunStatus.Completed,
    content: [
      {
        type: AgentScopeRuntimeContentType.DATA,
        status: AgentScopeRuntimeRunStatus.Completed,
        data: { call_id: id, name, arguments: { path: "synthetic.txt" } },
      },
    ],
  };
}

function result(
  id = "read",
  output = "合成工具输出",
): IAgentScopeRuntimeMessage {
  return {
    id: `result-${id}`,
    type: AgentScopeRuntimeMessageType.FUNCTION_CALL_OUTPUT,
    role: "tool",
    status: AgentScopeRuntimeRunStatus.Completed,
    content: [
      {
        type: AgentScopeRuntimeContentType.DATA,
        status: AgentScopeRuntimeRunStatus.Completed,
        data: { call_id: id, state: "done", output },
      },
    ],
  };
}

function response(
  output: IAgentScopeRuntimeMessage[],
  status = AgentScopeRuntimeRunStatus.Completed,
  customToolRenderConfig: Record<
    string,
    FC<{ data: IAgentScopeRuntimeMessage }>
  > = toolRenderers,
) {
  return (
    <I18nextProvider i18n={i18n}>
      <ComposedProvider
        options={{
          api: {},
          customToolRenderConfig,
          session: {
            currentSessionId: undefined,
            api: {
              getSessionList: async () => [],
              getSession: async (id) => ({ id, name: id, messages: [] }),
              createSession: async () => ({
                sessions: [],
                session: { id: "fixture", name: "fixture", messages: [] },
              }),
              updateSession: async () => [],
              removeSession: async () => [],
            },
          },
        }}
        cards={{}}
      >
        <HostResponseCard
          id="upstream-response"
          data={{ id: "upstream-response", status, output }}
          isLast
        />
      </ComposedProvider>
    </I18nextProvider>
  );
}

function outerHeader(container: HTMLElement, title: string) {
  const header = within(container)
    .getByText(title)
    .closest<HTMLElement>(HEADER_SELECTOR);
  expect(header).not.toBeNull();
  return header!;
}

function stepsTitle(key: string, count: number) {
  return i18n.t(`chat.messageDisplay.${key}`, { count });
}

function openNativeDetails(container: HTMLElement) {
  const details = container.querySelector<HTMLDetailsElement>("details");
  expect(details).not.toBeNull();
  // jsdom does not consistently emit the native toggle event after clicking
  // summary. Dispatch the native state/event pair used by the real shell.
  details!.open = true;
  fireEvent(details!, new Event("toggle"));
  return details!;
}

describe("upstream collapse in the real host response", () => {
  it("opens the current process while running and remounts it closed around the final answer", () => {
    const { container, rerender } = render(
      response(
        [text("first", "阶段说明"), reasoning(), call()],
        AgentScopeRuntimeRunStatus.InProgress,
      ),
    );
    expect(screen.getByText("阶段说明")).toBeVisible();
    const running = outerHeader(container, stepsTitle("stepsRunning", 2));
    expect(running.className).toContain("-header-open");
    expect(screen.getByText("Thinking")).toBeInTheDocument();
    const runningDetails = container.querySelector("details");
    expect(runningDetails?.className).toMatch(/toolCallCompactLoading/);
    expect(screen.getByText(/处理中/)).toBeInTheDocument();
    expect(container.querySelector('[class*="lineReadBadge"]')).toBeNull();

    rerender(
      response([
        text("first", "阶段说明"),
        reasoning(),
        call(),
        result(),
        text("answer", "最终答复"),
      ]),
    );
    const completed = outerHeader(container, stepsTitle("stepsCompleted", 2));
    expect(completed).not.toBe(running);
    expect(completed.className).toContain("-header-close");
    expect(screen.getByText("最终答复")).toBeVisible();
    expect(screen.queryByText("阶段说明")).not.toBeInTheDocument();
    expect(screen.queryByText("Thinking")).not.toBeInTheDocument();
    expect(container.querySelector("details")).toBeNull();
    const disclosure = screen.getByRole("button", {
      name: stepsTitle("stepsCompleted", 2),
    });
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(
      document.getElementById(disclosure.getAttribute("aria-controls")!),
    ).toHaveAttribute("hidden");

    fireEvent.click(completed);
    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("region", { name: stepsTitle("stepsCompleted", 2) }),
    ).toBeVisible();
    expect(screen.getByText("阶段说明")).toBeVisible();
    expect(container.querySelectorAll("details")).toHaveLength(1);
    expect(container.querySelector("details")?.className).not.toMatch(
      /toolCallCompactLoading/,
    );
    expect(container.querySelector('[class*="lineReadBadge"]')).toBeTruthy();
    openNativeDetails(container);
    expect(screen.getByText("合成工具输出")).toBeVisible();
  });

  it.each([
    ["result-collapsed", false, true],
    ["process-collapsed", true, true],
    ["expanded", true, false],
  ] as const)(
    "applies %s to intermediate text and native process groups",
    (preference, intermediateVisible, hasOuterGroup) => {
      setAssistantMessageDisplayPreference(preference);
      const { container } = render(
        response([
          text("first", "阶段说明"),
          reasoning(),
          call(),
          result(),
          text("answer", "最终答复"),
        ]),
      );
      expect(Boolean(screen.queryByText("阶段说明"))).toBe(intermediateVisible);
      expect(screen.getByText("最终答复")).toBeVisible();
      expect(container.querySelectorAll(HEADER_SELECTOR)).toHaveLength(
        hasOuterGroup ? 1 : 0,
      );
      if (hasOuterGroup) {
        const header = outerHeader(container, stepsTitle("stepsCompleted", 2));
        expect(header.className).toContain("-header-close");
        expect(container.querySelector("details")).toBeNull();
        fireEvent.click(header);
      }
      expect(screen.getByText("阶段说明")).toBeVisible();
      expect(screen.getByText("Thinking")).toBeVisible();
      expect(container.querySelector("details")).not.toHaveAttribute("open");
    },
  );

  it.each([
    [AgentScopeRuntimeRunStatus.Canceled, "stepsCanceled"],
    [AgentScopeRuntimeRunStatus.Failed, "stepsFailed"],
  ] as const)(
    "closes a %s turn and exposes a dangling native tool as interrupted",
    (status, titleKey) => {
      const { container, rerender } = render(
        response([call()], AgentScopeRuntimeRunStatus.InProgress),
      );
      expect(container.querySelector("details")?.className).toMatch(
        /toolCallCompactLoading/,
      );
      rerender(response([call()], status));
      const header = outerHeader(container, stepsTitle(titleKey, 1));
      expect(header.className).toContain("-header-close");
      expect(container.querySelector("details")).toBeNull();
      fireEvent.click(header);
      expect(container.querySelector("details")?.className).toMatch(
        /toolCallCompactError/,
      );
      expect(container.querySelector("details")?.className).not.toMatch(
        /toolCallCompactLoading/,
      );
      openNativeDetails(container);
      expect(screen.getByText(i18n.t("tool.interrupted"))).toBeVisible();
      expect(container.querySelector('[class*="lineReadBadge"]')).toBeNull();
    },
  );

  it("keeps native thinking and tool disclosure independent inside the outer group", () => {
    setAssistantMessageDisplayPreference("process-collapsed");
    const { container } = render(
      response([
        reasoning(),
        call("inspect", "inspect_synthetic"),
        result("inspect"),
        text("answer", "最终答复"),
      ]),
    );
    const outer = outerHeader(container, stepsTitle("stepsCompleted", 2));
    fireEvent.click(outer);
    const thinking = screen
      .getByText("Thinking")
      .closest<HTMLElement>('[class*="-operate-card-header"]')!;
    expect(screen.queryByText("合成思考内容")).not.toBeInTheDocument();
    expect(screen.queryByText("合成工具输出")).not.toBeInTheDocument();

    fireEvent.click(thinking);
    expect(screen.getByText("合成思考内容")).toBeVisible();
    expect(outer.className).toContain("-header-open");
    const details = openNativeDetails(container);
    // GenericToolCard also has its original Output disclosure inside details.
    expect(screen.queryByText("合成工具输出")).not.toBeInTheDocument();
    fireEvent.click(within(details).getByText("Output"));
    expect(screen.getByText("合成工具输出")).toBeVisible();
    fireEvent.click(thinking);
    expect(screen.queryByText("合成思考内容")).not.toBeInTheDocument();
    expect(details).toHaveAttribute("open");
    expect(screen.getByText("合成工具输出")).toBeVisible();

    expect(outer.className).toContain("-header-open");
  });

  it("hides thinking live without removing the native tool or final answer in expanded mode", async () => {
    setAssistantMessageDisplayPreference("expanded");
    const { container } = render(
      response([
        reasoning(),
        call("inspect", "inspect_synthetic"),
        result("inspect"),
        text("answer", "最终答复"),
      ]),
    );
    const details = openNativeDetails(container);
    fireEvent.click(within(details).getByText("Output"));
    expect(screen.getByText("Thinking")).toBeVisible();
    await act(async () => setShowThinkingPreference(false));
    expect(screen.queryByText("Thinking")).not.toBeInTheDocument();
    expect(container.querySelector("details")).toBe(details);
    expect(details).toHaveAttribute("open");
    expect(screen.getByText("合成工具输出")).toBeVisible();
    expect(screen.getByText("最终答复")).toBeVisible();
  });

  it("lazily mounts a real plugin record and preserves its draft, updates, and actions while open", async () => {
    const mounted = vi.fn();
    const action = vi.fn();
    function PluginRecord({ data }: { data: IAgentScopeRuntimeMessage }) {
      const [draft, setDraft] = useState("");
      mounted();
      const output = data.content[1];
      const outputText =
        output?.type === AgentScopeRuntimeContentType.DATA &&
        typeof output.data.output === "string"
          ? output.data.output
          : "";
      return (
        <div>
          <p>{outputText}</p>
          <input
            aria-label="插件记录备注"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="button" onClick={() => action(data.id)}>
            插件原有操作
          </button>
        </div>
      );
    }
    const tools = { ...toolRenderers, plugin_record: PluginRecord };
    const output = (value: string) => [
      call("plugin", "plugin_record"),
      result("plugin", value),
      text("answer", "最终答复"),
    ];
    const { container, rerender } = render(
      response(output("首个插件输出"), undefined, tools),
    );
    expect(mounted).not.toHaveBeenCalled();
    fireEvent.click(outerHeader(container, stepsTitle("stepsCompleted", 1)));
    expect(screen.getByText("首个插件输出")).toBeVisible();
    const input = screen.getByRole("textbox", { name: "插件记录备注" });
    fireEvent.change(input, { target: { value: "保留草稿" } });
    rerender(response(output("更新后的插件输出"), undefined, tools));
    expect(screen.getByText("更新后的插件输出")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "插件记录备注" })).toBe(input);
    expect(input).toHaveValue("保留草稿");
    await act(async () => i18n.changeLanguage("en"));
    expect(screen.getByRole("textbox", { name: "插件记录备注" })).toBe(input);
    expect(input).toHaveValue("保留草稿");
    fireEvent.click(screen.getByRole("button", { name: "插件原有操作" }));
    expect(action).toHaveBeenCalledWith("result-plugin");
    fireEvent.click(outerHeader(container, stepsTitle("stepsCompleted", 1)));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("最终答复")).toBeVisible();
  });

  it.each(["result-collapsed", "process-collapsed", "expanded"] as const)(
    "keeps approval requests visible outside process groups in %s",
    (preference) => {
      setAssistantMessageDisplayPreference(preference);
      const approval: IAgentScopeRuntimeMessage = {
        id: "approval",
        type: AgentScopeRuntimeMessageType.MCP_APPROVAL_REQUEST,
        role: "assistant",
        status: AgentScopeRuntimeRunStatus.Completed,
        content: [
          {
            type: AgentScopeRuntimeContentType.DATA,
            status: AgentScopeRuntimeRunStatus.Completed,
            data: {
              id: "approval-request",
              name: "approval_tool",
              arguments: { action: "synthetic" },
            },
          },
        ],
      };
      const { container } = render(
        response([
          reasoning(),
          call(),
          result(),
          approval,
          text("answer", "最终答复"),
        ]),
      );
      const approve = screen.getByRole("button", { name: "批准合成操作" });
      expect(approve).toBeVisible();
      expect(approve.closest('[class*="-accordion-group"]')).toBeNull();
      for (const header of container.querySelectorAll(HEADER_SELECTOR)) {
        fireEvent.click(header);
        expect(approve).toBeVisible();
        fireEvent.click(header);
        expect(approve).toBeVisible();
      }
    },
  );
});
