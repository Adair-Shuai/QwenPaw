import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MCPClientInfo } from "@/api/types";
import { CapabilityWorkspace } from "@/components/interaction/CapabilityWorkspace";
import { MCPClientCard } from "./MCPClientCard";
import type { ReactNode } from "react";

const confirm = vi.hoisted(() => vi.fn());
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@agentscope-ai/design", async () => vi.importActual("antd"));
vi.mock("@/hooks/useAppMessage", () => ({
  useAppMessage: () => ({
    message: { destroy: vi.fn(), error: vi.fn() },
    modal: { confirm },
  }),
}));
vi.mock("@/components/interaction/ServiceCard", () => ({
  ServiceCard: ({
    onConfigure,
    actions,
    metadata,
  }: {
    onConfigure: () => void;
    actions: ReactNode;
    metadata?: ReactNode;
  }) => (
    <>
      <button onClick={onConfigure}>Configure connection</button>
      {metadata}
      {actions}
    </>
  ),
}));
vi.mock("./MCPAccessModal", () => ({ MCPAccessModal: () => null }));
vi.mock("./MCPOAuthSection", () => ({ MCPOAuthSection: () => null }));

const client: MCPClientInfo = {
  key: "filesystem",
  name: "Filesystem",
  description: "",
  enabled: false,
  transport: "stdio",
  url: "",
  headers: {},
  command: "node",
  args: [],
  env: {},
  cwd: "",
  http_timeout: null,
  tools: null,
  oauth_status: null,
  access_summary: { default_effect: "deny", overrides_count: 0 },
};

describe("MCP connection draft dismissal", () => {
  it.each(["Authorization", "authorization"])(
    "uses static %s credentials without offering an OAuth flow",
    (header) => {
      render(
        <MCPClientCard
          client={{
            ...client,
            transport: "streamable_http",
            headers: { [header]: "********" },
          }}
          onToggle={vi.fn()}
          onDelete={vi.fn()}
          onUpdate={vi.fn()}
          onUpdatePolicy={vi.fn()}
        />,
      );
      expect(screen.getByText("mcp.headerAuth")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "mcp.oauth.manage" }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "mcp.tools" }),
      ).toBeInTheDocument();
    },
  );

  it.each([
    null,
    { authorized: true, expires_at: 9999999999, scope: "", client_id: "test" },
  ])(
    "retains OAuth for unconfigured or existing OAuth connections: %j",
    (status) => {
      render(
        <MCPClientCard
          client={{
            ...client,
            transport: "streamable_http",
            headers: status ? { Authorization: "********" } : {},
            oauth_status: status,
          }}
          onToggle={vi.fn()}
          onDelete={vi.fn()}
          onUpdate={vi.fn()}
          onUpdatePolicy={vi.fn()}
        />,
      );
      expect(
        screen.getByRole("button", { name: "mcp.oauth.manage" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("mcp.headerAuth")).not.toBeInTheDocument();
    },
  );

  it("can discard invalid JSON and reopen the saved connection", async () => {
    const onUpdate = vi.fn().mockResolvedValue(true);
    render(
      <MCPClientCard
        client={client}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={onUpdate}
        onUpdatePolicy={vi.fn().mockResolvedValue(true)}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Configure connection" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "common.advancedSettings" }),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "JSON" }), {
      target: { value: "{" },
    });
    fireEvent.click(screen.getByRole("button", { name: "common.close" }));
    await waitFor(() => expect(confirm).toHaveBeenCalledOnce());
    expect(onUpdate).not.toHaveBeenCalled();
    await act(async () => confirm.mock.calls[0][0].onCancel());
    expect(screen.getByRole("textbox", { name: "JSON" })).toHaveValue("{");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(2));
    await act(async () => confirm.mock.calls[1][0].onOk());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(
      screen.getByRole("button", { name: "Configure connection" }),
    );
    expect(screen.getByLabelText("mcp.form.name")).toHaveValue(client.name);
    expect(screen.getByLabelText("mcp.form.command")).toHaveValue(
      client.command,
    );
    expect(onUpdate).not.toHaveBeenCalled();
  });
  it("keeps embedded MCP validation and saves through the original editor before returning to its card", async () => {
    confirm.mockClear();
    const onUpdate = vi.fn().mockResolvedValue(true);
    render(
      <CapabilityWorkspace enabled>
        <MCPClientCard
          client={client}
          onToggle={vi.fn()}
          onDelete={vi.fn()}
          onUpdate={onUpdate}
          onUpdatePolicy={vi.fn()}
        />
      </CapabilityWorkspace>,
    );
    const configure = screen.getByRole("button", {
      name: "Configure connection",
    });
    fireEvent.click(configure);
    expect(configure).not.toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("mcp.form.command"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "common.back" }));
    await waitFor(() => expect(confirm).toHaveBeenCalledOnce());
    expect(onUpdate).not.toHaveBeenCalled();
    await act(async () => confirm.mock.calls[0][0].onCancel());
    expect(screen.getByLabelText("mcp.form.command")).toHaveValue("");
    fireEvent.change(screen.getByLabelText("mcp.form.command"), {
      target: { value: "updated-node" },
    });
    fireEvent.click(screen.getByRole("button", { name: "common.back" }));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        client.key,
        expect.objectContaining({ command: "updated-node" }),
      ),
    );
    await waitFor(() => expect(configure).toBeVisible());
  });
});
