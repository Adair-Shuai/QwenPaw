import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/common_setup";
import i18n from "../../i18n";
import FilesDrawer from "../files-workspace/FilesDrawer";
import { useWorkbenchTabsStore } from "../files-workspace/workbenchTabsStore";
import { useCodingTabsStore } from "../../stores/codingTabsStore";
import { useTerminalSurfaceStore } from "../../stores/terminalSurfaceStore";
import { terminalGroup } from "./terminalIdentity";
import type { TerminalInfo } from "./terminalApi";

const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("../../api/request", async (original) => ({
  ...(await original<typeof import("../../api/request")>()),
  request: transport.request,
}));
vi.mock("../../monacoSetup", () => ({}));
vi.mock("@monaco-editor/react", () => ({
  default: () => null,
  DiffEditor: () => null,
}));
vi.mock("../../hooks/useWorkspaceWatch", () => ({
  useWorkspaceWatch: vi.fn(),
}));
vi.mock("../files-workspace/FilesNavigator", () => ({ default: () => null }));
// The native xterm canvas is tested by TerminalView.test.tsx. Keep the real
// workspace, capability check, session panel, terminal API and lifetime here.
vi.mock("./TerminalView", () => ({
  default: ({ terminal }: { terminal: TerminalInfo }) => (
    <div data-testid="terminal-screen" data-terminal-id={terminal.id}>
      {terminal.title}
    </div>
  ),
}));

const scope = {
  kind: "session" as const,
  agentId: "expert-a",
  sessionId: "new",
};
const scopeKey = "session:expert-a:new";
const state = { kind: "workspace" as const, trigger: null };
let enabled = true;
let sessions: Map<string, TerminalInfo[]>;

function requests(method: string) {
  return transport.request.mock.calls.filter(
    ([path, options]) =>
      path.startsWith("/terminals/") &&
      path !== "/terminals/status" &&
      (options?.method ?? "GET") === method,
  );
}

async function openFromNewTab() {
  fireEvent.click(
    screen.getByRole("button", { name: i18n.t("workbench.tabs.addTab") }),
  );
  const page = screen.getByRole("region", {
    name: i18n.t("workbench.tabs.newTab"),
  });
  fireEvent.click(
    within(page).getByRole("button", {
      name: i18n.t("workbench.start.openView", {
        name: i18n.t("workbench.activity.terminal"),
      }),
    }),
  );
}

describe("terminal inside the real workspace", () => {
  beforeEach(() => {
    enabled = true;
    sessions = new Map();
    sessionStorage.clear();
    useTerminalSurfaceStore.setState({ openSessions: {} });
    useWorkbenchTabsStore.setState({ scopes: {} });
    useCodingTabsStore.setState({
      tabsByAgent: {},
      activeTabByAgent: {},
      diffsByAgent: {},
    });
    transport.request
      .mockReset()
      .mockImplementation(async (path: string, options = {}) => {
        if (path === "/terminals/status") return { enabled };
        if (!path.startsWith("/terminals/")) return [];
        const base = path.split("/").slice(0, 3).join("/");
        const tabs = sessions.get(base) ?? [];
        const method = (options as { method?: string }).method ?? "GET";
        if (method === "POST" && path === base) {
          const tab: TerminalInfo = {
            id: `${base.split("/").pop()}-${tabs.length + 1}`,
            title: `PowerShell ${tabs.length + 1}`,
            cwd: "C:/test-project",
            exited: false,
            exit_code: null,
          };
          sessions.set(base, [...tabs, tab]);
          return tab;
        }
        if (method === "DELETE") {
          sessions.set(
            base,
            tabs.filter((tab) => !path.endsWith(`/${tab.id}`)),
          );
          return undefined;
        }
        return tabs;
      });
  });

  it("opens a scoped terminal from the mounted new tab and restores its process after closing only the view", async () => {
    renderWithProviders(
      <FilesDrawer state={state} dispatch={vi.fn()} scope={scope} />,
    );
    await openFromNewTab();
    expect(screen.getAllByRole("tab")).toHaveLength(1);
    const view = await screen.findByTestId(
      "terminal-screen",
      {},
      { timeout: 12_000 },
    );
    const terminalId = view.getAttribute("data-terminal-id");
    expect(requests("POST")).toHaveLength(1);
    expect(requests("POST")[0]).toEqual([
      `/terminals/${terminalGroup(scope.agentId, scope.sessionId)}`,
      expect.objectContaining({
        headers: { "X-Agent-Id": scope.agentId },
        method: "POST",
      }),
    ]);
    fireEvent.click(
      screen.getByRole("button", {
        name: `${i18n.t("workbench.tabs.close")} ${i18n.t(
          "workbench.activity.terminal",
        )}`,
      }),
    );
    expect(screen.queryByTestId("terminal-screen")).not.toBeInTheDocument();
    expect(requests("DELETE")).toHaveLength(0);
    const page = screen.getByRole("region", {
      name: i18n.t("workbench.empty.label"),
    });
    const recent = within(page).getByRole("region", {
      name: i18n.t("workbench.empty.recent"),
    });
    fireEvent.click(
      within(recent).getByRole("button", {
        name: new RegExp(i18n.t("workbench.activity.terminal")),
      }),
    );
    expect(await screen.findByTestId("terminal-screen")).toHaveAttribute(
      "data-terminal-id",
      terminalId,
    );
    expect(requests("POST")).toHaveLength(1);
  });

  it("moves the same terminal between the workspace and bottom panel with only one active rendering surface", async () => {
    useTerminalSurfaceStore.getState().setSessionOpen(scopeKey, true);
    renderWithProviders(
      <FilesDrawer state={state} dispatch={vi.fn()} scope={scope} />,
    );
    await openFromNewTab();
    const view = await screen.findByTestId(
      "terminal-screen",
      {},
      { timeout: 12_000 },
    );
    const terminalId = view.getAttribute("data-terminal-id");
    expect(
      useTerminalSurfaceStore.getState().openSessions[scopeKey],
    ).toBeUndefined();
    act(() =>
      useTerminalSurfaceStore.getState().setSessionOpen(scopeKey, true),
    );
    await waitFor(() =>
      expect(screen.getByText(i18n.t("terminal.inBottomPanel"))).toBeVisible(),
    );
    expect(screen.queryByTestId("terminal-screen")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: i18n.t("terminal.moveToWorkspace") }),
    );
    expect(await screen.findByTestId("terminal-screen")).toHaveAttribute(
      "data-terminal-id",
      terminalId,
    );
    expect(requests("POST")).toHaveLength(1);
    expect(requests("DELETE")).toHaveLength(0);
  });

  it("keeps the existing terminal authentication requirement and never creates a process when capability is disabled", async () => {
    enabled = false;
    renderWithProviders(
      <FilesDrawer state={state} dispatch={vi.fn()} scope={scope} />,
    );
    await openFromNewTab();
    await waitFor(() =>
      expect(screen.getByText(i18n.t("terminal.authRequired"))).toBeVisible(),
    );
    expect(screen.queryByTestId("terminal-screen")).not.toBeInTheDocument();
    expect(requests("POST")).toHaveLength(0);
    expect(requests("GET")).toHaveLength(0);
  });

  it("keeps terminal ownership separate when the mounted workspace changes experts", async () => {
    const { rerender } = renderWithProviders(
      <FilesDrawer state={state} dispatch={vi.fn()} scope={scope} />,
    );
    await openFromNewTab();
    const first = await screen.findByTestId(
      "terminal-screen",
      {},
      { timeout: 12_000 },
    );
    const firstId = first.getAttribute("data-terminal-id");
    const other = { ...scope, agentId: "expert-b" };
    rerender(<FilesDrawer state={state} dispatch={vi.fn()} scope={other} />);
    await openFromNewTab();
    await waitFor(
      () =>
        expect(screen.getByTestId("terminal-screen")).not.toHaveAttribute(
          "data-terminal-id",
          firstId,
        ),
      { timeout: 12_000 },
    );
    expect(requests("POST")).toHaveLength(2);
    expect(requests("POST")[1]).toEqual([
      `/terminals/${terminalGroup(other.agentId, other.sessionId)}`,
      expect.objectContaining({
        headers: { "X-Agent-Id": other.agentId },
        method: "POST",
      }),
    ]);
    expect(requests("DELETE")).toHaveLength(0);
  });
});
