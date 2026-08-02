import { describe, expect, it } from "vitest";
import { groupResponseMessages } from "./responseMessageGrouping";

function message(id: string, type: string) {
  return { id, type };
}

describe("groupResponseMessages", () => {
  it("groups consecutive tool calls and keeps normal messages separate", () => {
    const groups = groupResponseMessages([
      message("text-1", "message"),
      message("tool-1", "tool_call"),
      message("tool-2", "mcp_call_output"),
      message("text-2", "message"),
      message("tool-3", "plugin_call_output"),
    ]);

    expect(groups.map((group) => group.kind)).toEqual([
      "message",
      "tools",
      "message",
      "tools",
    ]);
    expect(groups[1]).toMatchObject({
      kind: "tools",
      items: [{ id: "tool-1" }, { id: "tool-2" }],
    });
  });

  it("does not hide approval requests inside an execution group", () => {
    const groups = groupResponseMessages([
      message("tool-1", "tool_call"),
      message("approval", "mcp_approval_request"),
      message("tool-2", "tool_call_output"),
    ]);

    expect(groups.map((group) => group.kind)).toEqual([
      "tools",
      "message",
      "tools",
    ]);
    expect(groups[1]).toMatchObject({
      kind: "message",
      item: { id: "approval" },
    });
  });
});
