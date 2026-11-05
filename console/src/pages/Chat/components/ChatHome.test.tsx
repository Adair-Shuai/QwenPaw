import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import ChatHome from "./ChatHome";
import { useSessionListStore } from "@/stores/sessionListStore";

const context = vi.hoisted(() => ({ approvals: [] as any[] }));
vi.mock("@/contexts/ApprovalContext", () => ({
  useApprovalContext: () => context,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}
beforeEach(() => {
  context.approvals = [];
  useSessionListStore.setState({ sessions: [] });
});

describe("ChatHome", () => {
  it("resumes real recent sessions and updates scoped approval and running states", () => {
    useSessionListStore.setState({
      sessions: [
        {
          id: "older",
          messages: [],
          name: "Older work",
          updatedAt: "2026-10-29",
        },
        {
          id: "running",
          messages: [],
          realId: "real-running",
          name: "Running work",
          status: "running",
          updatedAt: "2026-10-30",
        },
        {
          id: "pending",
          messages: [],
          name: "Pending work",
          sessionId: "backend-session",
          updatedAt: "2026-10-31",
        },
        {
          id: "archived",
          messages: [],
          name: "Archived",
          archived: true,
          updatedAt: "2026-11-01",
        },
        {
          id: "child",
          messages: [],
          name: "Child",
          source: "subagent",
          updatedAt: "2026-11-02",
        },
      ],
    });
    context.approvals = [
      {
        owner_agent_id: "agent",
        agent_id: "child",
        root_session_id: "backend-session",
      },
    ];
    render(
      <MemoryRouter>
        <ChatHome agentId="agent" onSubmit={vi.fn()} />
        <Location />
      </MemoryRouter>,
    );
    expect(screen.getByText("chat.home.status.approval")).toBeVisible();
    expect(screen.getByText("chat.home.status.running")).toBeVisible();
    expect(screen.queryByText("Older work")).toBeNull();
    expect(screen.queryByText("Archived")).toBeNull();
    expect(screen.queryByText("Child")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Running work/ }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/chat/real-running",
    );
    act(() => useSessionListStore.setState({ sessions: [] }));
    expect(
      screen.queryByRole("region", { name: "chat.home.resume" }),
    ).toBeNull();
  });

  it("inserts common tasks into the current composer without sending or replacing its draft", () => {
    const submit = vi.fn();
    const changed = vi.fn();
    render(
      <MemoryRouter>
        <div data-chat-home-host>
          <ChatHome agentId="agent" onSubmit={submit} />
          <div className="qwenpaw-sender">
            <textarea defaultValue="Existing draft" onChange={changed} />
          </div>
        </div>
      </MemoryRouter>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "chat.home.actions.check" }),
    );
    expect(screen.getByRole("textbox")).toHaveValue(
      "Existing draft\nchat.home.prompts.check",
    );
    expect(screen.getByRole("textbox")).toHaveFocus();
    expect(changed).toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it("keeps plugin greetings and original capability commands while hiding recents inside a session", () => {
    const submit = vi.fn();
    useSessionListStore.setState({
      sessions: [{ id: "other", messages: [], name: "Other work" }],
    });
    render(
      <MemoryRouter>
        <ChatHome
          agentId="agent"
          currentSessionId="current"
          customGreeting
          greeting="Plugin welcome"
          prompts={[
            { value: "computer_use" },
            { label: "Custom action", value: "/custom command" },
          ]}
          onSubmit={submit}
        />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Plugin welcome" }),
    ).toBeVisible();
    expect(screen.queryByText("Other work")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "chat.home.desktop" }));
    expect(submit).toHaveBeenLastCalledWith({ query: "computer_use" });
    fireEvent.click(screen.getByRole("button", { name: "Custom action" }));
    expect(submit).toHaveBeenLastCalledWith({ query: "/custom command" });
  });
});
