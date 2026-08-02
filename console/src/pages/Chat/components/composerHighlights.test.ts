import { describe, expect, it } from "vitest";
import type { AgentSummary } from "../../../api/types/agents";
import { extractComposerHighlights } from "./composerHighlights";

const agents: AgentSummary[] = [
  {
    id: "pvt",
    name: "PVT专家",
    description: "",
    workspace_dir: "/tmp/pvt",
    enabled: true,
    backend: "qwenpaw",
  },
];

describe("extractComposerHighlights", () => {
  it("extracts an Agent assigned in the middle of Chinese prose", () => {
    const result = extractComposerHighlights(
      "请先计算，然后@PVT专家 负责物性",
      agents,
      [],
      [],
      (agent) => agent.name,
    );
    expect(result).toMatchObject([
      { kind: "agent", label: "PVT专家", start: 7 },
    ]);
  });

  it("distinguishes skills and commands with slash or dunhao prefixes", () => {
    expect(
      extractComposerHighlights(
        "、reservoir-analysis 参数",
        agents,
        ["reservoir-analysis"],
        ["compact"],
        (agent) => agent.name,
      )[0],
    ).toMatchObject({ kind: "skill", label: "、reservoir-analysis" });
    expect(
      extractComposerHighlights(
        "/compact",
        agents,
        ["reservoir-analysis"],
        ["compact"],
        (agent) => agent.name,
      )[0],
    ).toMatchObject({ kind: "command", label: "/compact" });
  });

  it("does not highlight unknown slash text", () => {
    expect(
      extractComposerHighlights(
        "/not-registered",
        agents,
        [],
        ["compact"],
        (agent) => agent.name,
      ),
    ).toEqual([]);
  });

  it("normalizes plugin command values and lets commands win collisions", () => {
    expect(
      extractComposerHighlights(
        "/PLUGIN-COMMAND 参数",
        agents,
        ["plugin-command"],
        ["/plugin-command"],
        (agent) => agent.name,
      )[0],
    ).toMatchObject({ kind: "command", label: "/PLUGIN-COMMAND" });
  });
});
