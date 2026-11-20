// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DiffEditorProps } from "@monaco-editor/react";

vi.mock("../../monacoSetup", () => ({}));
vi.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: false }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@monaco-editor/react", () => ({
  DiffEditor: ({ original, modified, options }: DiffEditorProps) => (
    <output data-testid="editor" data-options={JSON.stringify(options)}>
      {original} → {modified}
    </output>
  ),
}));

import TurnFileDiffViewer from "./TurnFileDiffViewer";

afterEach(cleanup);

describe("TurnFileDiffViewer", () => {
  it("switches unified and split views and wrapping while keeping both archived versions read only", () => {
    render(
      <TurnFileDiffViewer
        diff={{
          before: "original archived line",
          after: "delivered archived line",
          truncated: false,
        }}
      />,
    );
    const options = () =>
      JSON.parse(screen.getByTestId("editor").getAttribute("data-options")!);
    const split = screen.getByRole("button", { name: "turnFiles.diffSplit" });
    const unified = screen.getByRole("button", {
      name: "turnFiles.diffUnified",
    });
    expect(screen.getByTestId("editor")).toHaveTextContent(
      "original archived line → delivered archived line",
    );
    expect(unified).toHaveAttribute("aria-pressed", "true");
    expect(options()).toMatchObject({
      readOnly: true,
      originalEditable: false,
      renderSideBySide: false,
      wordWrap: "on",
    });
    fireEvent.click(split);
    expect(split).toHaveAttribute("aria-pressed", "true");
    expect(unified).toHaveAttribute("aria-pressed", "false");
    expect(options()).toMatchObject({
      readOnly: true,
      originalEditable: false,
      renderSideBySide: true,
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "turnFiles.diffWrap" }),
    );
    expect(options().wordWrap).toBe("off");
    fireEvent.click(unified);
    expect(options()).toMatchObject({
      renderSideBySide: false,
      wordWrap: "off",
      readOnly: true,
      originalEditable: false,
    });
  });
});

it("renders the review header's controlled split and wrap state without a second toolbar", () => {
  const diff = { before: "old", after: "new", truncated: false };
  const view = render(
    <TurnFileDiffViewer diff={diff} sideBySide wrapLines={false} hideToolbar />,
  );
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(
    JSON.parse(screen.getByTestId("editor").getAttribute("data-options")!),
  ).toMatchObject({ readOnly: true, renderSideBySide: true, wordWrap: "off" });
  view.rerender(
    <TurnFileDiffViewer diff={diff} sideBySide={false} wrapLines hideToolbar />,
  );
  expect(
    JSON.parse(screen.getByTestId("editor").getAttribute("data-options")!),
  ).toMatchObject({ readOnly: true, renderSideBySide: false, wordWrap: "on" });
});
