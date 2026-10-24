import { useState } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MCPAccessModal } from "./MCPAccessModal";
import type { MCPClientInfo } from "@/api/types";

const t = (key: string) => key;
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t }) }));
const feedback = vi.hoisted(() => ({
  error: vi.fn(),
  warning: vi.fn(),
  destroy: vi.fn(),
}));
vi.mock("@/hooks/useAppMessage", () => ({
  useAppMessage: () => ({ message: feedback, modal: { confirm: vi.fn() } }),
}));
vi.mock("@/api", () => ({
  default: {
    getMCPPolicy: vi.fn().mockResolvedValue({
      default_effect: "deny",
      client_overrides: [],
      tool_defaults: [],
      tool_overrides: [],
    }),
    listChannelTypes: vi.fn().mockResolvedValue([]),
    listMCPAccessPrincipals: vi.fn().mockResolvedValue([]),
    listMCPTools: vi.fn().mockResolvedValue(
      Array.from({ length: 500 }, (_, i) => ({
        name: `tool_${String(i).padStart(3, "0")}`,
        description: `Description ${i}`,
        input_schema: {
          type: "object",
          properties: { content: { type: "string" } },
        },
      })),
    ),
  },
}));

describe("MCP access with large remote tool catalogs", () => {
  it("bounds mounted editors, searches all tools, lazily shows schemas and closes the real modal", async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    function Editor() {
      const [open, setOpen] = useState(true);
      return (
        <MCPAccessModal
          client={
            {
              key: "large",
              name: "Large service",
              enabled: true,
            } as MCPClientInfo
          }
          open={open}
          onSave={onSave}
          onClose={() => {
            onClose();
            setOpen(false);
          }}
        />
      );
    }
    render(<Editor />);
    await screen.findByText("tool_000");
    expect(screen.queryByText("tool_020")).not.toBeInTheDocument();
    expect(screen.getAllByText("mcp.access.addRule")).toHaveLength(21);
    expect(document.querySelectorAll("pre")).toHaveLength(0);
    const search = screen.getByRole("textbox", { name: "tools.search" });
    fireEvent.change(search, { target: { value: "tool_499" } });
    expect(await screen.findByText("tool_499")).toBeInTheDocument();
    expect(screen.queryByText("tool_000")).not.toBeInTheDocument();
    const details = screen.getByText("mcp.toolSchema").closest("details")!;
    details.open = true;
    fireEvent(details, new Event("toggle"));
    await waitFor(() =>
      expect(document.querySelectorAll("pre")).toHaveLength(1),
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(onSave).not.toHaveBeenCalled();
  });
});
