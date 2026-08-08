// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RendererContext } from "../../types";

vi.mock("../CodeRenderer", () => ({
  default: ({ artifact }: RendererContext) => (
    <div data-testid="monaco-json-source">{artifact.textContent}</div>
  ),
}));

import JsonRenderer from "../JsonRenderer";

describe("JsonRenderer", () => {
  it("keeps tree preview and delegates raw source to Monaco", () => {
    const context: RendererContext = {
      artifact: {
        id: "json-tree",
        title: "result.json",
        source: "generated",
        mimeType: "application/json",
        textContent: '{"name":"QwenPaw","enabled":true}',
      },
      readOnly: true,
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

    const { container } = render(<JsonRenderer {...context} />);

    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.queryByTestId("monaco-json-source")).not.toBeInTheDocument();

    const modes = container.querySelectorAll(".ant-segmented-item");
    expect(modes).toHaveLength(2);
    fireEvent.click(modes[1]);

    expect(screen.getByTestId("monaco-json-source")).toHaveTextContent(
      '"name": "QwenPaw"',
    );
  });
});
