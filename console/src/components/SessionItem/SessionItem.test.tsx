import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SessionItem from ".";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("SessionItem status indicator", () => {
  it.each([
    {
      name: "running takes priority",
      props: { chatStatus: "running" as const, unseenResult: true },
      label: "chat.statusInProgress",
    },
    {
      name: "completed but unseen",
      props: { chatStatus: "idle" as const, unseenResult: true },
      label: "chat.statusUnseenResult",
    },
    {
      name: "idle and seen",
      props: { chatStatus: "idle" as const, unseenResult: false },
      label: "chat.statusIdle",
    },
  ])("renders $name", ({ props, label }) => {
    render(
      <SessionItem
        variant="drawer"
        sessionId="chat-1"
        name="Chat"
        {...props}
      />,
    );

    expect(screen.getByRole("img", { name: label })).toBeInTheDocument();
  });

  it("keeps an idle sidebar title flush without a leading status dot", () => {
    render(
      <SessionItem
        variant="sidebar"
        sessionId="chat-1"
        name="Chat"
        chatStatus="idle"
      />,
    );

    expect(
      screen.queryByRole("img", { name: "chat.statusIdle" }),
    ).not.toBeInTheDocument();
  });

  it("keeps active sidebar status after the title", () => {
    render(
      <SessionItem
        variant="sidebar"
        sessionId="chat-1"
        name="Chat"
        chatStatus="running"
      />,
    );

    const item = screen.getByRole("button", { name: /Chat/ });
    const title = screen.getByText("Chat");
    const status = screen.getByRole("img", {
      name: "chat.statusInProgress",
    });

    expect(item.firstElementChild).toBe(title.parentElement);
    expect(title.parentElement?.nextElementSibling).toContainElement(status);
  });
});
