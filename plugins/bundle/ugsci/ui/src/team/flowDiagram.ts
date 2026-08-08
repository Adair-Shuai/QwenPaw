import { ExpertAvatar } from "../components/avatars";
import { getHost } from "../core/runtime";
import type { ExpertTeam } from "./model";

export function TeamFlowDiagram({ team }: { team: ExpertTeam }) {
  const React = getHost().React;
  const { Typography, Tag } = getHost().antd;
  const { Text } = Typography;
  const modeIcons: Record<string, string> = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙",
    router: "◇",
    review_loop: "↻",
    debate: "⇄",
  };
  const modeColors: Record<string, string> = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff",
    router: "#d46b08",
    review_loop: "#389e0d",
    debate: "#c41d7f",
  };
  const steps = team.steps || [];
  const parallel = team.mode === "roundtable" || team.mode === "router";
  const modeNames: Record<string, string> = {
    pipeline: "顺序交接",
    roundtable: "并行汇聚",
    coordinator: "主管协作",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证",
  };

  return React.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "var(--ant-color-fill-quaternary, #fafafa)",
        borderRadius: 8,
        border: "1px dashed var(--ant-color-border, #d9d9d9)",
      },
    },
    React.createElement(
      Text,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 },
      },
      `OMP 编排拓扑 · ${modeNames[team.mode] || team.mode}`,
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: parallel ? "row" : "column",
          gap: 8,
          alignItems: parallel ? "flex-start" : "stretch",
          flexWrap: "wrap",
        },
      },
      ...(steps.length > 0
        ? steps
            .map((step, index) => [
              index > 0 && !parallel
                ? React.createElement(
                    "div",
                    {
                      key: `arrow-${index}`,
                      style: {
                        textAlign: "center",
                        color: modeColors[team.mode],
                        fontSize: 14,
                      },
                    },
                    modeIcons[team.mode],
                  )
                : null,
              React.createElement(
                "div",
                {
                  key: `step-${index}`,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    background: "var(--ant-color-bg-container, #fff)",
                    borderRadius: 6,
                    border: `1px solid ${modeColors[team.mode]}33`,
                    fontSize: 12,
                    flex: parallel ? "1 1 200px" : "initial",
                  },
                },
                React.createElement(ExpertAvatar, {
                  name: step.agentName,
                  size: 24,
                }),
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    Text,
                    { strong: true, style: { fontSize: 12 } },
                    step.agentName,
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 11,
                        color: "var(--ant-color-text-tertiary, #8c8c8c)",
                        maxWidth: 250,
                      },
                    },
                    step.instruction,
                  ),
                  React.createElement(
                    Tag,
                    {
                      ...(step.passContext ? { color: "blue" } : {}),
                      style: { fontSize: 9, marginTop: 2 },
                    },
                    step.passContext ? "传递上下文" : "独立",
                  ),
                ),
              ),
            ])
            .flat()
        : team.members
            .map((member, index) => [
              index > 0 && !parallel
                ? React.createElement(
                    "div",
                    {
                      key: `arrow-${index}`,
                      style: {
                        textAlign: "center",
                        color: modeColors[team.mode],
                        fontSize: 14,
                      },
                    },
                    modeIcons[team.mode],
                  )
                : null,
              React.createElement(
                "div",
                {
                  key: `member-${index}`,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    background: "var(--ant-color-bg-container, #fff)",
                    borderRadius: 6,
                    border: `1px solid ${modeColors[team.mode]}33`,
                    fontSize: 12,
                    flex: parallel ? "1 1 150px" : "initial",
                  },
                },
                React.createElement(ExpertAvatar, {
                  name: member.name,
                  size: 24,
                }),
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    Text,
                    { strong: true, style: { fontSize: 12 } },
                    member.name,
                  ),
                  React.createElement(
                    "div",
                    { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
                    member.role,
                  ),
                ),
              ),
            ])
            .flat()),
    ),
  );
}
