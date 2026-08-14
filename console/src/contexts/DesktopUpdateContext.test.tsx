import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkCachedUpdate: vi.fn(),
  checkDesktopUpdate: vi.fn(),
  onUpdateEvent: vi.fn(),
  checkComponentUpdates: vi.fn(),
}));

vi.mock("../tauri/backendRuntime", () => ({
  isDesktopApp: () => true,
}));

vi.mock("../tauri/desktopUpdate", () => ({
  checkCachedUpdate: mocks.checkCachedUpdate,
  checkDesktopUpdate: mocks.checkDesktopUpdate,
  downloadDesktopUpdate: vi.fn(),
  installDesktopUpdate: vi.fn(),
  installDownloadedUpdate: vi.fn(),
  onUpdateEvent: mocks.onUpdateEvent,
}));

vi.mock("../api", () => ({
  default: {
    checkComponentUpdates: mocks.checkComponentUpdates,
    queueAllComponentUpdates: vi.fn(),
  },
}));

import {
  DesktopUpdateProvider,
  useDesktopUpdate,
} from "./DesktopUpdateContext";

function UpdateProbe() {
  const updates = useDesktopUpdate();
  return (
    <button type="button" onClick={() => void updates.refreshUpdates()}>
      refresh
    </button>
  );
}

describe("DesktopUpdateProvider", () => {
  beforeEach(() => {
    mocks.checkCachedUpdate.mockReset().mockResolvedValue(null);
    mocks.checkDesktopUpdate.mockReset().mockResolvedValue(null);
    mocks.checkComponentUpdates.mockReset().mockResolvedValue({ updates: [] });
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
});
