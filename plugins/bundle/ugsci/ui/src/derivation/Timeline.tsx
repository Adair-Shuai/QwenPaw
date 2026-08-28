import { getHost } from "../core/runtime";

export function Timeline({
  payload,
  compact = false,
}: {
  payload: any;
  compact?: boolean;
}) {
  const React = getHost().React as any;
  const [showAll, setShowAll] = React.useState(!compact);
  const allSteps = payload?.trace?.steps || [];
  const keySteps = allSteps.filter(
    (step: any) => step.kind !== "bind" || step.note !== "input",
  );
  const visibleSteps = showAll ? allSteps : keySteps;
  const steps = visibleSteps.map((step: any, index: number) =>
    React.createElement(
      "article",
      {
        key: step.id,
        style: {
          display: "grid",
          gridTemplateColumns: "26px minmax(0, 1fr)",
          gap: 9,
          padding: "9px 0",
          borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        },
      },
      React.createElement(
        "span",
        {
          style: {
            width: 24,
            height: 24,
            display: "grid",
            placeItems: "center",
            borderRadius: 999,
            background: "var(--ant-color-primary-bg, #e6f4ff)",
            color: "var(--ant-color-primary, #1677ff)",
            fontSize: 11,
          },
        },
        index + 1,
      ),
      React.createElement(
        "div",
        { style: { minWidth: 0 } },
        React.createElement(
          "strong",
          {
            style: {
              display: "block",
              color: "var(--ant-color-text, rgba(0,0,0,.88))",
              fontSize: 13,
            },
          },
          step.title,
        ),
        step.unicode || step.expression
          ? React.createElement(
              "code",
              {
                style: {
                  display: "block",
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 11,
                  marginTop: 4,
                  overflowWrap: "anywhere",
                },
              },
              step.unicode || step.expression,
            )
          : null,
        step.value !== null && step.value !== undefined
          ? React.createElement(
              "div",
              {
                style: {
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 11,
                  marginTop: 3,
                },
              },
              `${step.display_value ?? step.value} ${
                step.display_unit || step.unit || ""
              }`,
            )
          : null,
        step.description
          ? React.createElement(
              "div",
              {
                style: {
                  color: "var(--ant-color-text-tertiary, rgba(0,0,0,.25))",
                  fontSize: 11,
                  marginTop: 3,
                  lineHeight: 1.55,
                },
              },
              step.description,
            )
          : null,
        step.kind === "assert"
          ? React.createElement(
              "span",
              {
                style: {
                  display: "inline-block",
                  color: step.value
                    ? "var(--ant-color-success, #52c41a)"
                    : "var(--ant-color-error, #ff4d4f)",
                  fontSize: 11,
                  marginTop: 4,
                },
              },
              step.value ? "✓ 通过" : "✗ 失败",
            )
          : null,
      ),
    ),
  );
  return React.createElement(
    "div",
    { style: { display: "grid", gap: 8 } },
    ...steps,
    compact && allSteps.length !== keySteps.length
      ? React.createElement(
          "button",
          {
            type: "button",
            onClick: () => setShowAll((current: boolean) => !current),
            style: {
              justifySelf: "start",
              border: "1px solid var(--ant-color-border, #d9d9d9)",
              borderRadius: 7,
              padding: "5px 9px",
              background: "var(--ant-color-bg-container, #fff)",
              color: "var(--ant-color-text, rgba(0,0,0,.88))",
              cursor: "pointer",
            },
          },
          showAll ? "只看关键步骤" : `显示全部 ${allSteps.length} 步`,
        )
      : null,
  );
}
