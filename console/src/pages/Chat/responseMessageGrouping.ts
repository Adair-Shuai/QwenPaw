export interface GroupableResponseMessage {
  id: string;
  type: string;
}

export type ResponseMessageGroup<T extends GroupableResponseMessage> =
  | { kind: "message"; item: T }
  | { kind: "tools"; items: T[]; key: string };

const COLLAPSIBLE_TOOL_TYPES = new Set([
  "plugin_call",
  "plugin_call_output",
  "tool_call",
  "tool_call_output",
  "mcp_call",
  "mcp_call_output",
]);

export function groupResponseMessages<T extends GroupableResponseMessage>(
  messages: T[],
): ResponseMessageGroup<T>[] {
  const groups: ResponseMessageGroup<T>[] = [];
  let toolItems: T[] = [];

  const flushTools = () => {
    if (toolItems.length === 0) return;
    groups.push({
      kind: "tools",
      items: toolItems,
      key: `tools-${toolItems[0].id}`,
    });
    toolItems = [];
  };

  for (const item of messages) {
    if (COLLAPSIBLE_TOOL_TYPES.has(item.type)) {
      toolItems.push(item);
      continue;
    }
    flushTools();
    groups.push({ kind: "message", item });
  }
  flushTools();
  return groups;
}
