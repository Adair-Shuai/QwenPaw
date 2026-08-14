import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  isTauriRuntime: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({ invoke: mocks.invoke }));
vi.mock("../tauri/backendRuntime", () => ({
  isTauriRuntime: mocks.isTauriRuntime,
}));

import { menuRegistry, routeRegistry, slotRegistry } from "./registry/store";
import { reportPluginUiVerification } from "../tauri/uiVerification";

describe("native plugin UI verification report", () => {
  beforeEach(() => {
    mocks.invoke.mockReset();
    mocks.isTauriRuntime.mockReset();
    menuRegistry.__resetForTests();
    routeRegistry.__resetForTests();
    slotRegistry.__resetForTests();
  });

  it("is inert outside the Tauri runtime", async () => {
    mocks.isTauriRuntime.mockReturnValue(false);

    await reportPluginUiVerification();

    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it("reports serialisable menu, route, and slot registrations", async () => {
    mocks.isTauriRuntime.mockReturnValue(true);
    for (const id of ["ugsci.experts", "ugsci.tools-skills", "ugsci.market"]) {
      menuRegistry.add("ugsci", { id, label: id });
    }
    routeRegistry.add("flowforge", {
      id: "flowforge",
      path: "/flowforge",
      component: () => null,
    });
    slotRegistry.fill("ugsci_research", "header.left", () => null, {
      id: "research-mode-toggle",
      order: 5,
    });

    await reportPluginUiVerification();

    expect(mocks.invoke).toHaveBeenCalledWith("report_ui_verification", {
      snapshot: {
        menus: [
          { id: "ugsci.experts" },
          { id: "ugsci.tools-skills" },
          { id: "ugsci.market" },
        ],
        routes: [{ id: "flowforge", path: "/flowforge", source: "flowforge" }],
        slots: [
          {
            name: "header.left",
            kind: "fill",
            source: "ugsci_research",
            id: "research-mode-toggle",
            order: 5,
          },
        ],
      },
    });
  });
});
