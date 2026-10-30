// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createPortal } from "react-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/common_setup";
import { ComposerOptionRow, ComposerOptions } from "./ComposerOptions";

describe("ComposerOptions", () => {
  it("retains a control draft across dismissal and layout changes", async () => {
    const controls = (
      <ComposerOptionRow label="Project">
        <input aria-label="Project directory" defaultValue="original" />
      </ComposerOptionRow>
    );
    const { rerender } = renderWithProviders(
      <ComposerOptions enabled>{controls}</ComposerOptions>,
    );
    const trigger = screen.getByRole("button", {
      name: /Chat options|聊天选项/,
    });
    fireEvent.click(trigger);
    const panel = screen.getByRole("dialog", { name: /Chat options|聊天选项/ });
    const input = screen.getByRole("textbox", { name: "Project directory" });
    fireEvent.change(input, { target: { value: "unsaved/project" } });
    fireEvent.keyDown(panel, { key: "Escape" });
    expect(input).not.toBeVisible();
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    expect(screen.getByRole("textbox", { name: "Project directory" })).toBe(
      input,
    );
    fireEvent.pointerDown(document.body);
    expect(input).not.toBeVisible();
    rerender(<ComposerOptions enabled={false}>{controls}</ComposerOptions>);
    expect(screen.getByRole("textbox", { name: "Project directory" })).toBe(
      input,
    );
    expect(input).toHaveValue("unsaved/project");
    expect(
      screen.queryByRole("button", { name: /Chat options|聊天选项/ }),
    ).not.toBeInTheDocument();
    rerender(<ComposerOptions enabled>{controls}</ComposerOptions>);
    expect(input).not.toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: /Chat options|聊天选项/ }),
    );
    expect(input).toHaveValue("unsaved/project");
  });

  it("keeps portaled picker interaction open and closes on an outside pointer", async () => {
    renderWithProviders(
      <>
        <ComposerOptions enabled>
          <ComposerOptionRow label="Approval">
            <button>Current approval</button>
          </ComposerOptionRow>
        </ComposerOptions>
        {createPortal(
          <div className="ant-dropdown">
            <button>Picker entry</button>
          </div>,
          document.body,
        )}
      </>,
    );
    const trigger = screen.getByRole("button", {
      name: /Chat options|聊天选项/,
    });
    fireEvent.click(trigger);
    const panel = screen.getByRole("dialog", { name: /Chat options|聊天选项/ });
    await waitFor(() => expect(panel).toHaveFocus());
    fireEvent.pointerDown(screen.getByRole("button", { name: "Picker entry" }));
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toBeVisible();
  });
});
