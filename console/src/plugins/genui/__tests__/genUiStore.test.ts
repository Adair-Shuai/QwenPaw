/**
 * Tests for GenUI store pure functions: parseGenUiResult, extractGenUiResults,
 * genUiSnapshotKey.
 *
 * Covers plan section 9.2:
 * - parseGenUiResult: valid result, invalid result, non-JSON
 * - extractGenUiResults: V1 format with content[1].data.output, streaming (no result),
 *   non-emit_ui_tree tools, multiple results
 * - genUiSnapshotKey: format
 */

import { describe, it, expect } from "vitest";
import {
  parseGenUiResult,
  extractGenUiResults,
  genUiSnapshotKey,
} from "@genui-src/stores/genUi";
import type { GenUiTreeResult } from "@genui-src/types/genUi";

// ─── genUiSnapshotKey ───────────────────────────────────────────────────────

describe("genUiSnapshotKey", () => {
  it("formats key as sessionId::uiId", () => {
    expect(genUiSnapshotKey("sess1", "ui_abc")).toBe("sess1::ui_abc");
  });

  it("handles empty strings", () => {
    expect(genUiSnapshotKey("", "")).toBe("::");
  });

  it("handles special characters", () => {
    expect(genUiSnapshotKey("s-1_2", "ui_xyz123")).toBe("s-1_2::ui_xyz123");
  });
});

// ─── parseGenUiResult ───────────────────────────────────────────────────────

describe("parseGenUiResult", () => {
  const validResult: GenUiTreeResult = {
    ok: true,
    kind: "genui",
    schema_version: "1",
    ui_id: "ui_abc123",
    revision: 1,
    tree: {
      schemaVersion: "1",
      root: { nodeId: "n1", kind: "Stack", props: {}, children: [] },
    },
  };

  it("parses a valid genui result", () => {
    const result = parseGenUiResult(JSON.stringify(validResult));
    expect(result).not.toBeNull();
    expect(result!.ok).toBe(true);
    expect(result!.kind).toBe("genui");
    expect(result!.ui_id).toBe("ui_abc123");
    expect(result!.revision).toBe(1);
    expect(result!.tree).toBeDefined();
  });

  it("returns null for non-JSON string", () => {
    expect(parseGenUiResult("not json")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseGenUiResult("")).toBeNull();
  });

  it("returns null when ok is false", () => {
    const errorResult = {
      ok: false,
      kind: "genui_error",
      error_code: "test",
      message: "err",
    };
    expect(parseGenUiResult(JSON.stringify(errorResult))).toBeNull();
  });

  it("returns null when kind is not genui", () => {
    const wrongKind = { ok: true, kind: "other", ui_id: "x" };
    expect(parseGenUiResult(JSON.stringify(wrongKind))).toBeNull();
  });

  it("returns null for non-object JSON", () => {
    expect(parseGenUiResult('"just a string"')).toBeNull();
    expect(parseGenUiResult("42")).toBeNull();
    expect(parseGenUiResult("[1,2,3]")).toBeNull();
  });
});

// ─── extractGenUiResults ────────────────────────────────────────────────────

describe("extractGenUiResults", () => {
  const validOutput = JSON.stringify({
    ok: true,
    kind: "genui",
    schema_version: "1",
    ui_id: "ui_test123",
    revision: 1,
    tree: {
      schemaVersion: "1",
      root: { nodeId: "n1", kind: "Stack", props: {}, children: [] },
    },
  });

  it("extracts from V1 format with content[1].data.output", () => {
    const output = [
      {
        type: "plugin_call_output",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1", arguments: "{}" } },
          { data: { output: validOutput, call_id: "c1" } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(1);
    expect(results[0].ok).toBe(true);
    expect(results[0].ui_id).toBe("ui_test123");
  });

  it("extracts from a nested V1 envelope with TextBlock-wrapped output", () => {
    const output = [
      {
        wrapper: {
          type: "plugin_call_output",
          content: [
            { data: { name: "emit_ui_tree", call_id: "c1" } },
            {
              data: {
                output: JSON.stringify([{ type: "text", text: validOutput }]),
              },
            },
          ],
        },
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(1);
    expect(results[0].ui_id).toBe("ui_test123");
  });

  it("extracts AgentScope tool_result blocks from replayed responses", () => {
    const output = [
      {
        role: "assistant",
        content: [
          {
            type: "tool_result",
            id: "c1",
            name: "emit_ui_tree",
            output: [{ type: "text", text: validOutput }],
            state: "success",
          },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(1);
    expect(results[0].ui_id).toBe("ui_test123");
  });

  it("returns empty for streaming (no content[1])", () => {
    const output = [
      {
        type: "plugin_call_output",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1", arguments: "{}" } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(0);
  });

  it("returns empty for non-emit_ui_tree tools", () => {
    const output = [
      {
        type: "plugin_call_output",
        content: [
          { data: { name: "other_tool", call_id: "c1" } },
          { data: { output: '{"result": "ok"}', call_id: "c1" } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(0);
  });

  it("handles multiple emit_ui_tree calls", () => {
    const output = [
      {
        type: "plugin_call_output",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: validOutput, call_id: "c1" } },
        ],
      },
      {
        type: "plugin_call_output",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c2" } },
          {
            data: {
              output: JSON.stringify({
                ok: true,
                kind: "genui",
                ui_id: "ui_second",
                revision: 1,
                tree: {
                  schemaVersion: "1",
                  root: {
                    nodeId: "n1",
                    kind: "Text",
                    props: { value: "hi" },
                    children: [],
                  },
                },
              }),
              call_id: "c2",
            },
          },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(2);
    expect(results[0].ui_id).toBe("ui_test123");
    expect(results[1].ui_id).toBe("ui_second");
  });

  it("handles function_call_output type", () => {
    const output = [
      {
        type: "function_call_output",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: validOutput, call_id: "c1" } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(1);
  });

  it("handles tool_call_output type", () => {
    const output = [
      {
        type: "tool_call_output",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: validOutput, call_id: "c1" } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(1);
  });

  it("returns empty for non-array input", () => {
    expect(extractGenUiResults(null)).toHaveLength(0);
    expect(extractGenUiResults(undefined)).toHaveLength(0);
    expect(extractGenUiResults("string")).toHaveLength(0);
    expect(extractGenUiResults({})).toHaveLength(0);
  });

  it("returns empty for empty array", () => {
    expect(extractGenUiResults([])).toHaveLength(0);
  });

  it("skips messages without type", () => {
    const output = [{ content: [{ data: { name: "emit_ui_tree" } }] }];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(0);
  });

  it("skips messages with unknown type", () => {
    const output = [
      {
        type: "text_message",
        content: [
          { data: { name: "emit_ui_tree" } },
          { data: { output: validOutput } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(0);
  });

  it("skips messages with empty content", () => {
    const output = [{ type: "plugin_call_output", content: [] }];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(0);
  });

  it("skips messages with non-array content", () => {
    const output = [{ type: "plugin_call_output", content: "not array" }];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(0);
  });

  it("handles invalid output string (not JSON)", () => {
    const output = [
      {
        type: "plugin_call_output",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: "not valid json", call_id: "c1" } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(0);
  });

  it("handles output that is an object (not string)", () => {
    const output = [
      {
        type: "plugin_call_output",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: { ok: true, kind: "genui" }, call_id: "c1" } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    // output is an object — the implementation stringifies it for parsing.
    // { ok: true, kind: "genui" } passes parseGenUiResult, so 1 result.
    expect(results).toHaveLength(1);
    expect(results[0].ok).toBe(true);
    expect(results[0].kind).toBe("genui");
  });

  it("handles mcp_call_output type", () => {
    const output = [
      {
        type: "mcp_call_output",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: validOutput, call_id: "c1" } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(1);
  });

  it("handles component_call_output type", () => {
    const output = [
      {
        type: "component_call_output",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: validOutput, call_id: "c1" } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(1);
  });

  it("skips messages where content[0] has no data", () => {
    const output = [
      {
        type: "plugin_call_output",
        content: [{ other: "no data key" }, { data: { output: validOutput } }],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(0);
  });

  it("skips messages where content[0].data has no name", () => {
    const output = [
      {
        type: "plugin_call_output",
        content: [
          { data: { call_id: "c1" } },
          { data: { output: validOutput } },
        ],
      },
    ];
    const results = extractGenUiResults(output);
    expect(results).toHaveLength(0);
  });
});
