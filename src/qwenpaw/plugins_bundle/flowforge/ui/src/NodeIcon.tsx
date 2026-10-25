import React from "react";

/** Inline icons stay legible in desktop WebViews without an emoji font. */
export function NodeIcon({
  classType,
  icon,
}: {
  classType: string;
  icon?: string;
}) {
  let kind = "tool";
  if (/Input|Start/.test(classType)) kind = "input";
  else if (/Output|End|Export/.test(classType)) kind = "output";
  else if (/Human|Review/.test(classType)) kind = "review";
  else if (/Condition|Control/.test(classType)) kind = "condition";
  else if (/Parallel/.test(classType)) kind = "parallel";
  else if (/Quality|Gate/.test(classType)) kind = "quality";
  else if (/Iterative|Refine|Wait/.test(classType)) kind = "loop";
  else if (/Script|Code|Coding/.test(classType)) kind = "code";
  else if (/LLM|Model/.test(classType)) kind = "model";
  else if (/Agent|agent/.test(classType)) kind = "agent";
  else if (/Subworkflow/.test(classType)) kind = "subflow";
  else if (/Transform/.test(classType)) kind = "transform";
  else if (icon && icon !== "🔧" && !/Tool|tool/.test(classType))
    return <span aria-hidden="true">{icon}</span>;
  const paths: Record<string, string> = {
    input: "M13 4h6v16h-6 M3 12h12 M10 7l5 5-5 5",
    output: "M9 4H3v16h6 M9 12h12 M16 7l5 5-5 5",
    agent:
      "M8 4h8 M12 4V2 M5 7h14v13H5z M2 11v5 M22 11v5 M8 12h1 M15 12h1 M9 16h6",
    tool: "M14 6a5 5 0 0 0-6 6L3 17a2.8 2.8 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-3 3-4-4 3-3z",
    condition: "M12 2l5 5-5 5-5-5 5-5z M12 12v4 M12 16H5v5 M12 16h7v5",
    parallel:
      "M12 2v4 M4 10V6h16v4 M4 14v4h16v-4 M12 18v4 M2 10h4v4H2z M10 10h4v4h-4z M18 10h4v4h-4z",
    review:
      "M10 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M3 21v-3a5 5 0 0 1 10-1 M15 18l2 2 5-6",
    quality: "M12 2l8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5l8-3z M8 12l3 3 5-6",
    loop: "M20 8A8 8 0 0 0 6 5L3 8 M3 3v5h5 M4 16a8 8 0 0 0 14 3l3-3 M21 21v-5h-5",
    code: "M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18",
    model: "M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z",
    subflow: "M3 3h7v7H3z M14 14h7v7h-7z M10 6h7v8 M6 10v7h8",
    transform: "M3 7h17 M16 3l4 4-4 4 M21 17H4 M8 13l-4 4 4 4",
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, verticalAlign: "middle" }}
    >
      <path d={paths[kind]} />
    </svg>
  );
}
