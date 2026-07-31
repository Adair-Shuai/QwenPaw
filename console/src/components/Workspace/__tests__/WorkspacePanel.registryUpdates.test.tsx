import React from "react";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("antd", () => ({
  Button: ({ children }: React.PropsWithChildren) => (
    <button>{children}</button>
  ),
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
});
