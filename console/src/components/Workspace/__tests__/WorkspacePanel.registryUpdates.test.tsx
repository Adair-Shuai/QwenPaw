import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { buildAuthHeaders, downloadFileFromUrl } = vi.hoisted(() => ({
  buildAuthHeaders: vi.fn((agentId?: string) => ({
    "X-Agent-Id": agentId ?? "current",
  })),
  downloadFileFromUrl: vi.fn(() => Promise.resolve()),
}));

vi.mock("antd", () => ({
  Button: ({
    children,
    onClick,
  }: React.PropsWithChildren<{
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }>) => <button onClick={onClick}>{children}</button>,
  Dropdown: ({ children }: React.PropsWithChildren) => <>{children}</>,
  Tooltip: ({ children }: React.PropsWithChildren) => <>{children}</>,
  Space: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  ConfigProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  message: { error: vi.fn() },
}));

vi.mock("@ant-design/icons", () => ({
  CloseOutlined: () => <span />,
  CloseCircleOutlined: () => <span />,
  PushpinOutlined: () => <span />,
  PushpinFilled: () => <span />,
  CompressOutlined: () => <span />,
  ExpandOutlined: () => <span />,
  FileTextOutlined: () => <span />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock("../../../contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: false }),
}));

vi.mock("../store/builtinRenderers", () => ({
  registerBuiltinRenderers: vi.fn(),
}));

vi.mock("../../../api/authHeaders", () => ({ buildAuthHeaders }));
vi.mock("../../../utils/downloadFileFromUrl", () => ({
  DownloadCancelledError: class DownloadCancelledError extends Error {},
  downloadFileFromUrl,
}));

import WorkspacePanel from "../WorkspacePanel";
import { rendererRegistry } from "../store/rendererRegistry";
import { useWorkspaceStore } from "../store/workspaceStore";
import type { WorkspaceArtifact } from "../types";

const artifact: WorkspaceArtifact = {
  id: "dynamic-artifact",
  title: "sample.las",
  source: "tool_call",
  mimeType: "application/x-las",
  extension: "las",
};

describe("WorkspacePanel renderer registry updates", () => {
  beforeEach(() => {
    rendererRegistry.__resetForTests();
    buildAuthHeaders.mockClear();
    downloadFileFromUrl.mockClear();
    useWorkspaceStore.setState({
      artifacts: { [artifact.id]: artifact },
      tabsBySession: { default: [artifact.id] },
      currentSessionId: "default",
      tabs: [
        {
          artifactId: artifact.id,
          title: artifact.title,
          openedAt: Date.now(),
        },
      ],
      activeTabId: artifact.id,
      panelOpen: true,
      panelWidth: 480,
      isFullscreen: false,
    });
  });

  it("rematches the active artifact when a renderer is registered or removed", () => {
    rendererRegistry.register({
      id: "fallback",
      name: "Fallback",
      component: () => <div>fallback renderer</div>,
    });

    render(<WorkspacePanel />);
    expect(screen.getByText("fallback renderer")).toBeInTheDocument();

    let registration!: { dispose: () => void };
    act(() => {
      registration = rendererRegistry.register({
        id: "las",
        name: "LAS",
        extensions: ["las"],
        priority: 100,
        component: () => <div>LAS renderer</div>,
      });
    });
    expect(screen.getByText("LAS renderer")).toBeInTheDocument();

    act(() => registration.dispose());
    expect(screen.getByText("fallback renderer")).toBeInTheDocument();
  });

  it("downloads with the Artifact's owning Agent headers", async () => {
    useWorkspaceStore.setState((state) => ({
      artifacts: {
        ...state.artifacts,
        [artifact.id]: {
          ...artifact,
          agentId: "agent-b",
          binaryUrl: "/api/workspace/binary-files/sample.las",
        },
      },
    }));
    rendererRegistry.register({
      id: "download-test",
      name: "Download test",
      extensions: ["las"],
      component: ({ artifact: current, workspace }) => (
        <button onClick={() => workspace.download?.(current)}>
          download artifact
        </button>
      ),
    });

    render(<WorkspacePanel />);
    fireEvent.click(screen.getByText("download artifact"));

    await waitFor(() =>
      expect(downloadFileFromUrl).toHaveBeenCalledWith(
        "/api/workspace/binary-files/sample.las",
        "sample.las",
        expect.objectContaining({
          headers: { "X-Agent-Id": "agent-b" },
        }),
      ),
    );
    expect(buildAuthHeaders).toHaveBeenCalledWith("agent-b");
  });
});
