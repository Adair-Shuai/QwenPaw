// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Upload } from "antd";
import { renderWithProviders } from "@/test/common_setup";
import i18n, { i18nReady } from "@/i18n";
import ComposerAddMenu from "./ComposerAddMenu";

const commands = [
  { command: "/new", value: "new" },
  { command: "/compact", value: "compact", description: "Compact context" },
  { command: "/team", value: "team", description: "Team collaboration" },
];

beforeEach(async () => {
  await i18nReady;
  await i18n.changeLanguage("en");
});

describe("ComposerAddMenu", () => {
  it("delegates file selection to the original Upload without opening it for menu navigation", async () => {
    const request = vi.fn((options: any) => {
      options.onSuccess?.({ url: "test.pdf" });
    });
    const view = renderWithProviders(
      <div className="qwenpaw-sender">
        <textarea aria-label="Draft" />
        <Upload customRequest={request} multiple showUploadList={false}>
          <ComposerAddMenu commands={commands} allowAgent uploadEnabled />
        </Upload>
      </div>,
    );
    const fileInput =
      view.container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const picker = vi.spyOn(fileInput, "click");
    fireEvent.click(screen.getByRole("button", { name: "Add content" }));
    expect(picker).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Attach files" }));
    expect(picker).toHaveBeenCalledTimes(1);
    const file = new File(["Synthetic upload fixture"], "test.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ file }),
        expect.anything(),
      ),
    );
    picker.mockRestore();
  });

  it("keeps drafts while inserting available commands and mentions and restores focus on Escape", async () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    renderWithProviders(
      <form className="qwenpaw-sender" onSubmit={submit}>
        <textarea aria-label="Draft" defaultValue="Unsent notes" />
        <ComposerAddMenu commands={commands} allowAgent />
      </form>,
    );
    const trigger = screen.getByRole("button", {
      name: "Add content",
    });
    fireEvent.click(trigger);
    expect(
      screen.queryByRole("button", { name: "/goal" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "/compact" }));
    expect(screen.getByRole("textbox", { name: "Draft" })).toHaveValue(
      "/compact Unsent notes",
    );
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Assign Agent" }));
    expect(screen.getByRole("textbox", { name: "Draft" })).toHaveValue(
      "/compact Unsent notes @",
    );
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: /All commands/ }));
    fireEvent.click(screen.getByRole("button", { name: "/team" }));
    expect(screen.getByRole("textbox", { name: "Draft" })).toHaveValue(
      "/team Unsent notes @",
    );
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Add content" }), {
      key: "Escape",
    });
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
    expect(trigger).toHaveFocus();
    expect(submit).not.toHaveBeenCalled();
  });
});
