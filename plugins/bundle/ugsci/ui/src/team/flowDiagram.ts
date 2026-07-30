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
  };
  const modeColors: Record<string, string> = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff",
  };
  const steps = team.steps || [];

  return React.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "#fafafa",
        borderRadius: 8,
        border: "1px dashed #d9d9d9",
      },
    },
    React.createElement(
      Text,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 },
      },
      `执行流程 (${
        team.mode === "pipeline"
          ? "流水线"
          : team.mode === "roundtable"
          ? "圆桌讨论"
          : "协调者模式"
      })`,
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: team.mode === "roundtable" ? "row" : "column",
          gap: 8,
          alignItems: team.mode === "roundtable" ? "flex-start" : "stretch",
          flexWrap: "wrap",
        },
      },
      ...(steps.length > 0
        ? steps
            .map((step, index) => [
              index > 0 && team.mode !== "roundtable"
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
                    background: "#fff",
                    borderRadius: 6,
                    border: `1px solid ${modeColors[team.mode]}33`,
                    fontSize: 12,
                    flex: team.mode === "roundtable" ? "1 1 200px" : "initial",
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
                        color: "#8c8c8c",
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
              index > 0 && team.mode !== "roundtable"
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
                    background: "#fff",
                    borderRadius: 6,
                    border: `1px solid ${modeColors[team.mode]}33`,
                    fontSize: 12,
                    flex: team.mode === "roundtable" ? "1 1 150px" : "initial",
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
                    { style: { fontSize: 11, color: "#8c8c8c" } },
                    member.role,
                  ),
                ),
              ),
            ])
            .flat()),
    ),
  );
}
