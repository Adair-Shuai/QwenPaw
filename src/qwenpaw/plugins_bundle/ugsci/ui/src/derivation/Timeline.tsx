import { getHost } from "../core/runtime";
export function Timeline({ payload }: { payload: any }) {
  const React = getHost().React;
  const steps = (payload?.trace?.steps || []).map((step: any) =>
    React.createElement(
      "article",
      {
        key: step.id,
        style: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 },
      },
      React.createElement("strong", null, step.title),
      React.createElement(
        "div",
        { style: { fontFamily: "monospace", margin: "5px 0" } },
        step.unicode || step.expression,
      ),
      step.value !== null && step.value !== undefined
        ? React.createElement(
            "div",
            null,
            `${step.display_value ?? step.value} ${
              step.display_unit || step.unit || ""
            }`,
          )
        : null,
      step.kind === "assert"
        ? React.createElement(
            "span",
            { style: { color: step.value ? "#16a34a" : "#dc2626" } },
            step.value ? "✓ 通过" : "✗ 失败",
          )
        : null,
    ),
  );
  return React.createElement(
    "div",
    { style: { display: "grid", gap: 8 } },
    ...steps,
  );
}
