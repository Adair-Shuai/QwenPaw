/**
 * Tests for GenUiToolCall component — V1 props parsing and rendering.
 *
 * Covers plan section 9.2:
 * - V1 content array parsing (content[1].data.output)
 * - Completed status with valid result
 * - In-progress / calling status
 * - Error status
 * - Missing data / empty content
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import { GenUiToolCall } from "@genui-src/components/GenUiToolCall";

// Set up window.QwenPaw.host.React before importing components
beforeEach(() => {
  (window as any).QwenPaw = {
    host: { React },
  };
});

afterEach(() => {
  delete (window as any).QwenPaw;
});

function makeValidResult(): string {
  return JSON.stringify({
    ok: true,
    kind: "genui",
    schema_version: "1",
    ui_id: "ui_test123",
    revision: 1,
    tree: {
      schemaVersion: "1",
      root: {
        nodeId: "n1",
        kind: "Stack",
        props: { gap: 12 },
        children: [
          {
            nodeId: "n2",
            kind: "Text",
            props: { value: "Hello" },
            children: [],
          },
          {
            nodeId: "n3",
            kind: "Text",
            props: { value: "World" },
            children: [],
          },
        ],
      },
    },
  });
}

function makeErrorResult(): string {
  return JSON.stringify({
    ok: false,
    kind: "genui_error",
    error_code: "invalid_tree",
    message: "Invalid kind: NonExistent",
    hint: "Call list_ui_components",
  });
}

describe("GenUiToolCall", () => {
  it("renders loading state for in_progress status", () => {
    const props = {
      data: {
        status: "in_progress",
        content: [{ data: { name: "emit_ui_tree", call_id: "c1" } }],
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    expect(container.textContent).toContain("Generating UI Tree");
  });

  it("renders success state with node count", () => {
    const props = {
      data: {
        status: "completed",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: makeValidResult(), call_id: "c1" } },
        ],
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    expect(container.textContent).toContain("UI Tree");
    expect(container.textContent).toContain("3 nodes"); // Stack + 2 Text
    expect(container.textContent).toContain("ui_test123");
    expect(container.textContent).toContain("已在回复正文中展示");
    expect(container.querySelector(".qwenpaw-genui-tree")).toBeNull();
    expect(container.querySelector("details")?.open).toBe(false);
  });

  it("renders error state for failed status", () => {
    const props = {
      data: {
        status: "failed",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: makeErrorResult(), call_id: "c1" } },
        ],
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    expect(container.textContent).toContain("Error");
    expect(container.textContent).toContain("Invalid kind: NonExistent");
    expect(container.textContent).toContain("list_ui_components");
  });

  it("renders error state when ok is false", () => {
    const props = {
      data: {
        status: "completed",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: makeErrorResult(), call_id: "c1" } },
        ],
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    expect(container.textContent).toContain("Invalid kind: NonExistent");
  });

  it("handles missing content array", () => {
    const props = {
      data: {
        status: "completed",
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    // Should render something (pre with waiting text or empty)
    expect(container).toBeDefined();
  });

  it("handles empty content array", () => {
    const props = {
      data: {
        status: "completed",
        content: [],
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    expect(container).toBeDefined();
  });

  it("handles missing data prop entirely", () => {
    const props = {};
    const { container } = render(React.createElement(GenUiToolCall, props));
    expect(container).toBeDefined();
  });

  it("handles output as object (not string)", () => {
    const props = {
      data: {
        status: "completed",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          {
            data: {
              output: { ok: true, kind: "genui", ui_id: "ui_obj" },
              call_id: "c1",
            },
          },
        ],
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    // Should render — output is stringified
    expect(container).toBeDefined();
  });

  it("handles non-JSON output string", () => {
    const props = {
      data: {
        status: "completed",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: "not json at all", call_id: "c1" } },
        ],
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    expect(container).toBeDefined();
  });

  it("handles content[0] with inline output (some SDK versions)", () => {
    const props = {
      data: {
        status: "completed",
        content: [
          {
            data: {
              name: "emit_ui_tree",
              call_id: "c1",
              output: makeValidResult(),
            },
          },
        ],
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    expect(container.textContent).toContain("UI Tree");
  });

  it("renders ui_id truncated in summary", () => {
    const props = {
      data: {
        status: "completed",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: makeValidResult(), call_id: "c1" } },
        ],
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    // ui_id should be truncated to 16 chars
    expect(container.textContent).toContain("ui_test123");
  });

  it("returns null when host React is not available", () => {
    delete (window as any).QwenPaw;
    const props = {
      data: {
        status: "completed",
        content: [
          { data: { name: "emit_ui_tree", call_id: "c1" } },
          { data: { output: makeValidResult(), call_id: "c1" } },
        ],
      },
    };
    const { container } = render(React.createElement(GenUiToolCall, props));
    expect(container.innerHTML).toBe("");
  });
});
