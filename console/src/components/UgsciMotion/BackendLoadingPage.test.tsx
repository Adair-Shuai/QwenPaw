import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BackendLoadingPage from "../../tauri/BackendLoadingPage";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: unknown) =>
      typeof fallback === "string" ? fallback : "Startup timed out",
  }),
}));

describe("UGSci startup motion", () => {
  it("uses the startup mark with actual progress and stops on failure while preserving retry", () => {
    const onRetry = vi.fn();
    const view = render(
      <BackendLoadingPage
        status="checking"
        elapsed={12}
        totalSec={60}
        startup={{
          ready: false,
          stage: "tools",
          progress: 35,
          message: "Starting tools",
        }}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole("img", { name: "UGSci" })).toHaveAttribute(
      "data-ugsci-motion",
      "startup",
    );
    expect(screen.getByText("Starting tools")).toBeInTheDocument();
    expect(screen.getByText("12s")).toBeInTheDocument();
    view.rerender(
      <BackendLoadingPage
        status="error"
        elapsed={13}
        totalSec={60}
        errorMessage="Backend unavailable"
        onRetry={onRetry}
      />,
    );
    expect(
      screen.getByRole("img", { name: "UGSci" }).getAttribute("src"),
    ).toContain("startup-static.svg");
    expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
