// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RendererContext, WorkspaceArtifact } from "../../types";

const editorSpy = vi.fn();

vi.mock("@monaco-editor/react", () => ({
  default: (props: Record<string, unknown>) => {
    editorSpy(props);
    return (
      <button
        type="button"
        data-testid="monaco-editor"
        data-language={String(props.language)}
        data-readonly={String(
          (props.options as { readOnly?: boolean } | undefined)?.readOnly,
        )}
        onClick={() =>
          (props.onChange as ((value: string) => void) | undefined)?.(
            '{"updated":true}',
          )
        }
      >
        Monaco
      </button>
    );
  },
}));

import CodeRenderer from "../CodeRenderer";

function makeContext(
  artifact: WorkspaceArtifact,
  readOnly = true,
): RendererContext {
  return {
    artifact,
    readOnly,
    theme: "light",
    locale: "zh-CN",
    workspace: {
      updateArtifact: vi.fn(),
      closeTab: vi.fn(),
      openArtifact: vi.fn(),
      download: vi.fn(),
      fullscreen: vi.fn(),
    },
  };
}

describe("CodeRenderer upstream Monaco adapter", () => {
  it("uses the upstream language mapping for JSON source", () => {
    const context = makeContext({
      id: "json-source",
      title: "result.json",
      source: "generated",
      mimeType: "application/json",
      textContent: '{"ok":true}',
    });

    render(<CodeRenderer {...context} />);

    expect(screen.getByTestId("monaco-editor")).toHaveAttribute(
      "data-language",
      "json",
    );
    expect(screen.getByTestId("monaco-editor")).toHaveAttribute(
      "data-readonly",
      "true",
    );
  });

  it("updates editable artifacts through the workspace adapter", () => {
    const context = makeContext(
      {
        id: "typescript-source",
        title: "app.ts",
        source: "generated",
        mimeType: "text/typescript",
        textContent: "const value = 1;",
      },
      false,
    );

    render(<CodeRenderer {...context} />);
    fireEvent.click(screen.getByTestId("monaco-editor"));

    expect(context.workspace.updateArtifact).toHaveBeenCalledWith(
      "typescript-source",
      { textContent: '{"updated":true}' },
    );
  });
});
