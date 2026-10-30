import React, { useState } from "react";
import ReactDOM from "react-dom";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import type {
  InteractionField,
  InteractionFormProps,
  InteractionValues,
} from "../src/interactions/types";

const nativeRequire = createRequire(import.meta.url);
const loadShippedBundle = nativeRequire("./loadShippedBundle.cjs") as (
  url: string,
  guard: typeof Function,
) => Promise<unknown>;
let Form: React.ComponentType<InteractionFormProps>;
// These cases load the complete release CSS/runtime. Leave room for concurrent
// repository checks while retaining all real controls and business assertions.
const BUNDLE_DOM_TIMEOUT = 30_000;
beforeAll(async () => {
  const host = {
    host: {
      React,
      ReactDOM,
      useTheme: () => "dark",
      useLocale: () => "en",
      openExternalLink: vi.fn(),
    },
    chat: {
      disposeAll: vi.fn(),
      submit: vi.fn(),
      codeBlock: vi.fn(() => ({ dispose: vi.fn() })),
      requestPayload: { add: vi.fn(() => ({ dispose: vi.fn() })) },
    },
    openui: undefined as
      | undefined
      | { version: number; InteractionForm: typeof Form; TaskLayout: unknown },
  };
  Object.assign(window, { QwenPaw: host });
  // Load the actual shipped module with host React, including the real official
  // Renderer, Card and Stack. There are no runtime or component catalog mocks.
  await loadShippedBundle(
    pathToFileURL(nativeRequire.resolve("../../dist/index.js")).href,
    globalThis.Function,
  );
  expect(host.openui?.version).toBe(1);
  expect(host.openui?.TaskLayout).toBeTruthy();
  Form = host.openui!.InteractionForm;
  expect(Form).toBeTypeOf("function");
}, BUNDLE_DOM_TIMEOUT);
afterEach(cleanup);

const fields: InteractionField[] = [
  {
    name: "pressure",
    label: "Pressure",
    type: "number",
    required: true,
    minimum: 0,
    maximum: 100,
    unit: "MPa",
    description: "Use absolute pressure.",
  },
  {
    name: "count",
    label: "Samples",
    type: "integer",
    required: true,
    minimum: 1,
    maximum: 10,
  },
  {
    name: "corrected",
    label: "Apply correction",
    type: "boolean",
    required: true,
  },
  {
    name: "method",
    label: "Method",
    type: "select",
    required: true,
    options: [
      { label: "Standard", value: "standard" },
      { label: "Detailed", value: "detailed" },
    ],
  },
  {
    name: "outputs",
    label: "Outputs",
    type: "multiselect",
    required: true,
    options: [
      { label: "Table", value: "table" },
      { label: "Curve", value: "curve" },
    ],
  },
  { name: "note", label: "Notes", type: "string" },
];

it(
  "shipped interaction form preserves typed numbers, false and selections, validates constraints and submits controlled values",
  () => {
    const submitted = vi.fn();
    const changed = vi.fn();
    function Harness() {
      const [values, setValues] = useState<InteractionValues>({});
      return (
        <Form
          requestId="request-a"
          title="Confirm calculation inputs"
          fields={fields}
          values={values}
          onChange={(next) => {
            changed(next);
            setValues(next);
          }}
          onSubmit={() => submitted(values)}
        />
      );
    }
    const view = render(<Harness />);
    expect(screen.queryByRole("alert")).toBeNull();
    // Official Card's CSS class proves the layout is actually rendered by OpenUI.
    expect(
      view.container.querySelector('[class*="openui-card"]'),
    ).not.toBeNull();
    const form = screen.getByRole("form");
    const submitButton = screen.getByRole("button", {
      name: "Confirm and continue",
    });
    // Native label queries avoid repeatedly computing every vendor CSS rule for
    // all controls, and still verify the actual accessible label/control wiring.
    const pressure = screen.getByLabelText(
      /Pressure\s*\(MPa\)/,
    ) as HTMLInputElement;
    expect(pressure.getAttribute("aria-describedby")).toBeTruthy();
    fireEvent.change(pressure, { target: { value: "101" } });
    expect(pressure.validity.rangeOverflow).toBe(true);
    fireEvent.submit(form);
    expect(submitted).not.toHaveBeenCalled();
    fireEvent.change(pressure, { target: { value: "0" } });
    const count = screen.getByLabelText(/^Samples/) as HTMLInputElement;
    fireEvent.change(count, { target: { value: "1.5" } });
    expect(count.validity.stepMismatch).toBe(true);
    fireEvent.change(count, { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/^Apply correction/), {
      target: { value: "false" },
    });
    fireEvent.change(screen.getByLabelText(/^Method/), {
      target: { value: "detailed" },
    });
    const outputs = screen.getByLabelText(/^Outputs/) as HTMLSelectElement;
    for (const option of outputs.options) option.selected = true;
    fireEvent.change(outputs);
    fireEvent.change(screen.getByLabelText("Notes"), {
      target: { value: "Check source A" },
    });
    fireEvent.click(submitButton);
    expect(submitted).toHaveBeenCalledExactlyOnceWith({
      pressure: 0,
      count: 2,
      corrected: false,
      method: "detailed",
      outputs: ["table", "curve"],
      note: "Check source A",
    });
    fireEvent.change(pressure, { target: { value: "" } });
    expect(changed.mock.lastCall?.[0].pressure).toBe("");
    expect(pressure.validity.valueMissing).toBe(true);
    fireEvent.click(submitButton);
    expect(submitted).toHaveBeenCalledTimes(1);
  },
  BUNDLE_DOM_TIMEOUT,
);

it(
  "shipped interaction form keeps input identity on metadata and draft updates, displays errors, and disables submitted requests",
  () => {
    const changed = vi.fn();
    const submitted = vi.fn();
    const cancelled = vi.fn();
    const props: InteractionFormProps = {
      requestId: "request-b",
      title: "Original",
      fields,
      values: {
        pressure: 0,
        count: 2,
        corrected: false,
        method: "standard",
        outputs: ["table"],
        note: "Draft",
      },
      onChange: changed,
      onSubmit: submitted,
      onCancel: cancelled,
      preview: [{ label: "Source", value: "report.xlsx / Sheet 1" }],
    };
    const view = render(<Form {...props} />);
    const note = screen.getByLabelText("Notes") as HTMLInputElement;
    const form = screen.getByRole("form");
    const cancelButton = screen.getByRole("button", { name: "Cancel request" });
    note.focus();
    note.setSelectionRange(2, 2);
    view.rerender(
      <Form
        {...props}
        title="Updated title"
        description="Confirm this revised explanation."
        fields={[...fields].reverse()}
        preview={[{ label: "Source", value: "verified report" }]}
        error="Please verify the units."
      />,
    );
    expect(screen.getByLabelText("Notes")).toBe(note);
    expect(document.activeElement).toBe(note);
    expect(note.selectionStart).toBe(2);
    expect(note.value).toBe("Draft");
    expect(screen.getByRole("alert").textContent).toBe(
      "Please verify the units.",
    );
    expect(screen.getByText("verified report")).toBeTruthy();
    fireEvent.click(cancelButton);
    expect(cancelled).toHaveBeenCalledTimes(1);
    view.rerender(
      <Form
        {...props}
        values={{ ...props.values, note: "Saved answer" }}
        disabled
        submitLabel="Submitted"
      />,
    );
    expect(note.value).toBe("Saved answer");
    expect(note.disabled).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Submitted" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.change(note, { target: { value: "Cannot edit" } });
    fireEvent.submit(form);
    fireEvent.click(cancelButton);
    expect(changed).not.toHaveBeenCalled();
    expect(submitted).not.toHaveBeenCalled();
    expect(cancelled).toHaveBeenCalledTimes(1);
  },
  BUNDLE_DOM_TIMEOUT,
);

it(
  "shipped interaction form renders untrusted labels and preview as text and never adds them to executable source",
  () => {
    const text = '" ); root = Button("unexpected") <script>alert(1)</script>';
    const view = render(
      <Form
        requestId="request-c"
        title="Review"
        description={text}
        fields={[{ name: "safe", label: text, type: "string" }]}
        values={{ safe: text }}
        preview={[{ label: "Evidence", value: text }]}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(text)).toBeTruthy();
    expect(view.container.querySelector("script")).toBeNull();
    expect(screen.queryByRole("button", { name: "unexpected" })).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  },
  BUNDLE_DOM_TIMEOUT,
);
