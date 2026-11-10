import { useRef } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { App, ConfigProvider } from "antd";
import { I18nextProvider } from "react-i18next";
import ComposedProvider from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/ChatAnywhere/ComposedProvider";
import NativeRequestCard from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Request/Card";
import i18n, { i18nReady } from "../../../i18n";
import { AnswerQuoteComposer } from "./AnswerQuoteComposer";
import { renderQuotedRequest } from "./AnswerQuoteRequest";
import { applyAnswerQuotePayload, readAnswerQuotes } from "../answerQuotes";

vi.mock("@agentscope-ai/design", async (original) => ({
  ...(await original<Record<string, unknown>>()),
  ConfigProvider: (await import("antd")).ConfigProvider,
}));
beforeAll(async () => {
  await i18nReady;
  await i18n.changeLanguage("en");
});
afterEach(() => {
  cleanup();
  window.getSelection()?.removeAllRanges();
  vi.restoreAllMocks();
});
function Fixture({
  scope,
  enabled = true,
}: {
  scope: string;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref}>
      <section data-answer-quote-source="m1">
        <p>First answer passage</p>
        <pre>
          <code>print(42)</code>
        </pre>
        <button>Do not quote controls</button>
      </section>
      <section data-answer-quote-source="m2">
        <table>
          <tbody>
            <tr>
              <td>Rendered OpenUI cell</td>
            </tr>
          </tbody>
        </table>
        <input aria-label="Plugin draft" defaultValue="preserved" />
      </section>
      <p>User message outside assistant</p>
      <div className="sender">
        <textarea
          data-sender-input="true"
          aria-label="Question"
          defaultValue="Keep my question"
        />
      </div>
      <AnswerQuoteComposer scope={scope} rootRef={ref} enabled={enabled} />
    </div>
  );
}
function tree(scope: string, enabled = true) {
  return (
    <I18nextProvider i18n={i18n}>
      <App>
        <Fixture scope={scope} enabled={enabled} />
      </App>
    </I18nextProvider>
  );
}
function select(node: Node, end = node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  if (end !== node) range.setEndAfter(end);
  Object.defineProperty(range, "getBoundingClientRect", {
    value: () => ({ left: 40, top: 80, bottom: 100 }),
  });
  act(() => {
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));
  });
}
describe("compact answer quote composer", () => {
  it("quotes rendered text and code independently while preserving draft and plugin inputs", async () => {
    const scope = crypto.randomUUID();
    const view = render(tree(scope));
    select(screen.getByText("First answer passage"));
    fireEvent.click(screen.getByRole("button", { name: "Quote" }));
    select(screen.getByText("print(42)"));
    fireEvent.click(screen.getByRole("button", { name: "Quote" }));
    select(screen.getByText("Rendered OpenUI cell"));
    fireEvent.click(screen.getByRole("button", { name: "Quote" }));
    expect(readAnswerQuotes(scope).map((q) => q.text)).toEqual([
      "First answer passage",
      "print(42)",
      "Rendered OpenUI cell",
    ]);
    expect(screen.getByLabelText("Question")).toHaveValue("Keep my question");
    expect(screen.getByLabelText("Plugin draft")).toHaveValue("preserved");
    fireEvent.click(
      screen.getByRole("button", { name: "View quote: print(42)" }),
    );
    expect(await screen.findByRole("tooltip")).toHaveTextContent("print(42)");
    fireEvent.click(
      screen.getByRole("button", { name: "Remove quote: print(42)" }),
    );
    expect(readAnswerQuotes(scope)).toHaveLength(2);
    view.rerender(tree(scope + "-other"));
    expect(screen.queryByLabelText("Selected quotes")).not.toBeInTheDocument();
    view.rerender(tree(scope));
    expect(screen.getByLabelText("Selected quotes")).toHaveTextContent(
      "First answer passage",
    );
  });
  it("rejects non-answer, cross-message and interactive selections and dismisses stale menus", () => {
    const view = render(tree(crypto.randomUUID()));
    select(screen.getByText("User message outside assistant"));
    expect(
      screen.queryByRole("button", { name: "Quote" }),
    ).not.toBeInTheDocument();
    select(
      screen.getByText("First answer passage"),
      screen.getByText("Rendered OpenUI cell"),
    );
    expect(
      screen.queryByRole("button", { name: "Quote" }),
    ).not.toBeInTheDocument();
    select(screen.getByText("Do not quote controls"));
    expect(
      screen.queryByRole("button", { name: "Quote" }),
    ).not.toBeInTheDocument();
    select(screen.getByText("First answer passage"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("button", { name: "Quote" }),
    ).not.toBeInTheDocument();
    select(screen.getByText("First answer passage"));
    view.rerender(tree("disabled", false));
    expect(
      screen.queryByRole("button", { name: "Quote" }),
    ).not.toBeInTheDocument();
  });
  it("renders stored quotes collapsed with the real SDK card and retains media and actions", () => {
    const quotes = [{ id: "a", messageId: "reply", text: "Detailed quote" }];
    const payload = applyAnswerQuotePayload(
      {
        input: [
          {
            role: "user",
            type: "message",
            content: [
              { type: "text", text: "My question" },
              { type: "file", file_url: "/file.csv", file_name: "file.csv" },
            ],
          },
        ],
      },
      quotes,
    );
    const action = vi.fn();
    render(
      <I18nextProvider i18n={i18n}>
        <ConfigProvider>
          <App>
            <ComposedProvider
              options={{
                api: {},
                request: {
                  render: ({ data, fallback }) =>
                    renderQuotedRequest(data, fallback()),
                },
                requestActions: {
                  list: [
                    {
                      render: () => (
                        <button onClick={action}>Original action</button>
                      ),
                    },
                  ],
                },
                session: {
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
              cards={{
                Text: ({ data }) => <span>{data.content}</span>,
                Files: () => <span>file.csv</span>,
              }}
            >
              <NativeRequestCard
                data={
                  payload as unknown as import("react").ComponentProps<
                    typeof NativeRequestCard
                  >["data"]
                }
              />
            </ComposedProvider>
          </App>
        </ConfigProvider>
      </I18nextProvider>,
    );
    expect(screen.getByText("My question")).toBeVisible();
    expect(screen.getByText("file.csv")).toBeVisible();
    expect(screen.getByText("1 quote").closest("details")).not.toHaveAttribute(
      "open",
    );
    expect(screen.queryByText(/Quoted passages/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("1 quote"));
    expect(screen.getByText("Detailed quote")).toBeVisible();
    fireEvent.click(screen.getByText("Original action"));
    expect(action).toHaveBeenCalledOnce();
  });
});
