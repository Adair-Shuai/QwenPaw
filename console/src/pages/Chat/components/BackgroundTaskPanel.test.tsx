import { renderWithProviders } from "@/test/common_setup";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useBackgroundTasksStore } from "../../../stores/backgroundTasksStore";
import BackgroundTaskPanel from "./BackgroundTaskPanel";

describe("BackgroundTaskPanel host options", () => {
  beforeEach(() => {
    useBackgroundTasksStore.setState({ tasks: [] });
  });

  it("preserves the existing empty behavior unless a host empty state is supplied", () => {
    const view = renderWithProviders(
      <BackgroundTaskPanel sessionId="session-1" />,
    );

    expect(view.container.firstElementChild).toBeEmptyDOMElement();

    view.rerender(
      <BackgroundTaskPanel
        sessionId="session-1"
        emptyState={<div>Workbench empty state</div>}
      />,
    );

    expect(screen.getByText("Workbench empty state")).toBeInTheDocument();
  });

  it("can start expanded for a full-height workbench host", () => {
    useBackgroundTasksStore.getState().addTask({
      sessionId: "session-1",
      toolCallId: "tool-1",
      toolName: "Analyze reservoir grid",
      startTime: Date.now(),
    });

    renderWithProviders(
      <BackgroundTaskPanel
        sessionId="session-1"
        defaultCollapsed={false}
        listMaxHeight="none"
      />,
    );

    expect(screen.getByText("Analyze reservoir grid")).toBeInTheDocument();
  });

  it("does not render an inert finished filter when the host controls it", () => {
    useBackgroundTasksStore.getState().addTask({
      sessionId: "session-1",
      toolCallId: "tool-1",
      toolName: "Analyze reservoir grid",
      startTime: Date.now(),
    });

    renderWithProviders(
      <BackgroundTaskPanel
        sessionId="session-1"
        defaultCollapsed={false}
        showFinished
      />,
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
