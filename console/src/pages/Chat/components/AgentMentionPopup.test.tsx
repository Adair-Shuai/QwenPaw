import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AgentSummary } from "../../../api/types/agents";
import AgentMentionPopup from "./AgentMentionPopup";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

const agent: AgentSummary = {
  id: "pvt",
  name: "PVT专家",
  description: "流体物性计算",
  workspace_dir: "/tmp/pvt",
  enabled: true,
  backend: "qwenpaw",
};

describe("AgentMentionPopup", () => {
  it("switches single-Agent mode and selects an Agent", () => {
    const onModeChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <AgentMentionPopup
        visible
        agents={[agent]}
        activeIndex={0}
        mode="delegate"
        collaborationLocked={false}
        selectedCount={0}
        theme="light"
        onModeChange={onModeChange}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "共同协作" }));
    fireEvent.click(screen.getByRole("button", { name: /PVT专家/ }));
    expect(onModeChange).toHaveBeenCalledWith("collaborate");
    expect(onSelect).toHaveBeenCalledWith(agent);
  });

  it("disables direct assignment after an Agent is already selected", () => {
    render(
      <AgentMentionPopup
        visible
        agents={[agent]}
        activeIndex={0}
        mode="collaborate"
        collaborationLocked
        selectedCount={1}
        theme="light"
        onModeChange={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "直接指派" })).toBeDisabled();
  });
});
