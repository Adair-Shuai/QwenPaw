import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkCachedUpdate: vi.fn(),
  checkDesktopUpdate: vi.fn(),
  installDesktopUpdate: vi.fn(),
  installDownloadedUpdate: vi.fn(),
  onUpdateEvent: vi.fn(),
  checkComponentUpdates: vi.fn(),
  queueAllComponentUpdates: vi.fn(),
}));

vi.mock("../tauri/backendRuntime", () => ({
  isDesktopApp: () => true,
}));

vi.mock("../tauri/desktopUpdate", () => ({
  checkCachedUpdate: mocks.checkCachedUpdate,
  checkDesktopUpdate: mocks.checkDesktopUpdate,
  downloadDesktopUpdate: vi.fn(),
  installDesktopUpdate: mocks.installDesktopUpdate,
  installDownloadedUpdate: mocks.installDownloadedUpdate,
  onUpdateEvent: mocks.onUpdateEvent,
}));

vi.mock("../api", () => ({
  default: {
    checkComponentUpdates: mocks.checkComponentUpdates,
    queueAllComponentUpdates: mocks.queueAllComponentUpdates,
  },
}));

import {
  DesktopUpdateProvider,
  useDesktopUpdate,
} from "./DesktopUpdateContext";

function UpdateProbe() {
  const updates = useDesktopUpdate();
  const [result, setResult] = useState("idle");
  return (
    <>
      <button
        type="button"
        onClick={() =>
          void updates
            .refreshUpdates()
            .then((available) => setResult(available ? "available" : "current"))
            .catch(() => setResult("failed"))
        }
      >
        refresh
      </button>
      <button
        type="button"
        onClick={() =>
          void updates
            .startInstall()
            .then(() => setResult("installed"))
            .catch(() => setResult("install-failed"))
        }
      >
        install
      </button>
      <output>{result}</output>
      <output data-testid="check-warning">{updates.checkWarning ?? ""}</output>
    </>
  );
}

describe("DesktopUpdateProvider", () => {
  beforeEach(() => {
    mocks.checkCachedUpdate.mockReset().mockResolvedValue(null);
    mocks.checkDesktopUpdate.mockReset().mockResolvedValue(null);
    mocks.installDesktopUpdate.mockReset().mockResolvedValue(undefined);
    mocks.installDownloadedUpdate.mockReset().mockResolvedValue(undefined);
    mocks.checkComponentUpdates.mockReset().mockResolvedValue({ updates: [] });
    mocks.queueAllComponentUpdates
      .mockReset()
      .mockResolvedValue({ queued: [] });
    mocks.onUpdateEvent.mockReset().mockResolvedValue(() => {});
  });

  it("checks only the local cache on mount and waits for a button action", async () => {
    render(
      <DesktopUpdateProvider>
        <UpdateProbe />
      </DesktopUpdateProvider>,
    );

    await waitFor(() => expect(mocks.checkCachedUpdate).toHaveBeenCalled());
    expect(mocks.checkDesktopUpdate).not.toHaveBeenCalled();
    expect(mocks.checkComponentUpdates).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "refresh" }));

    await waitFor(() => expect(mocks.checkDesktopUpdate).toHaveBeenCalled());
    expect(mocks.checkComponentUpdates).toHaveBeenCalledTimes(1);
  });

  it("does not report current when one update source fails", async () => {
    mocks.checkComponentUpdates.mockRejectedValueOnce(
      new Error("component manifest unavailable"),
    );

    render(
      <DesktopUpdateProvider>
        <UpdateProbe />
      </DesktopUpdateProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "refresh" }));

    await waitFor(() => expect(screen.getByText("failed")).toBeInTheDocument());
  });

  it("reports partial source failure while keeping a valid core update", async () => {
    mocks.checkDesktopUpdate.mockResolvedValueOnce({
      version: "2.1.1-beta.8",
      body: "update",
      supportsLaterInstall: true,
    });
    mocks.checkComponentUpdates.mockRejectedValueOnce(
      new Error("component manifest unavailable"),
    );

    render(
      <DesktopUpdateProvider>
        <UpdateProbe />
      </DesktopUpdateProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "refresh" }));

    await waitFor(() =>
      expect(screen.getByText("available")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("check-warning")).toHaveTextContent(
      "Components: component manifest unavailable",
    );
  });

  it("rethrows immediate install failures to the update button", async () => {
    mocks.installDesktopUpdate.mockRejectedValueOnce(
      new Error("desktop install failed"),
    );

    render(
      <DesktopUpdateProvider>
        <UpdateProbe />
      </DesktopUpdateProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "install" }));

    await waitFor(() =>
      expect(screen.getByText("install-failed")).toBeInTheDocument(),
    );
  });
});
