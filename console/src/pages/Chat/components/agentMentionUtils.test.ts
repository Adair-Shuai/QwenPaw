import { describe, expect, it } from "vitest";
import type { AgentSummary } from "../../../api/types/agents";
import {
  buildMultiAgentOrchestrationPrompt,
  extractAgentMention,
  extractAgentMentions,
  removeAgentMention,
  withAgentCoordinationContext,
} from "./agentMentionUtils";

const reviewer: AgentSummary = {
  id: "reviewer.v2",
  name: "Code Reviewer (v2)",
  description: "",
  workspace_dir: "/tmp/reviewer",
  enabled: true,
  backend: "qwenpaw",
};

const displayName = (agent: AgentSummary) => agent.name;

describe("agentMentionUtils", () => {
  it("marks multi-Agent requests for request-scoped coordination", () => {
    expect(withAgentCoordinationContext({ keep: "value" })).toEqual({
      keep: "value",
      agent_coordination_requested: true,
    });
  });

  it("matches display names containing spaces and regexp characters", () => {
    expect(
      extractAgentMention(
        "please @Code Reviewer (v2) check this",
        [reviewer],
        displayName,
      ),
    ).toEqual({
      agentId: "reviewer.v2",
      cleanedText: "please check this",
    });
  });

  it("matches ids without treating dots as wildcards", () => {
    expect(
      removeAgentMention("@reviewer.v2 inspect", reviewer, displayName),
    ).toEqual({ found: true, text: "inspect" });
    expect(
      removeAgentMention("@reviewerXv2 inspect", reviewer, displayName),
    ).toEqual({ found: false, text: "@reviewerXv2 inspect" });
  });

  it("returns distinct agents in textual order and removes every mention", () => {
    const writer = { ...reviewer, id: "writer", name: "Writer" };
    expect(
      extractAgentMentions(
        "@Writer compare with @Code Reviewer (v2) and ask @Writer again",
        [reviewer, writer],
        displayName,
      ),
    ).toEqual({
      agentIds: ["writer", "reviewer.v2"],
      cleanedText: "compare with and ask again",
    });
  });

  it("allows repeated mentions of the same agent as one target", () => {
    expect(
      extractAgentMentions(
        "@Code Reviewer (v2) check, then @reviewer.v2 summarize",
        [reviewer],
        displayName,
      ),
    ).toEqual({
      agentIds: ["reviewer.v2"],
      cleanedText: "check, then summarize",
    });
  });

  it("builds an ordered coordinator prompt for dependent assignments", () => {
    const pvt = { ...reviewer, id: "pvt", name: "PVT专家" };
    const reservoir = { ...reviewer, id: "reservoir", name: "气藏工程专家" };
    const inventory = { ...reviewer, id: "inventory", name: "库存评估专家" };
    const text =
      "我要评估库容，@PVT专家 计算流体物性，然后@气藏工程专家 使用物质平衡法，最后，@库存评估专家 校验并出报告";

    const result = buildMultiAgentOrchestrationPrompt(
      text,
      [inventory, reservoir, pvt],
      displayName,
    );

    expect(result.assignments.map((item) => item.agentId)).toEqual([
      "pvt",
      "reservoir",
      "inventory",
    ]);
    expect(result.assignments[0].task).toContain("计算流体物性");
    expect(result.assignments[1].task).toContain("物质平衡法");
    expect(result.prompt).toContain("必须使用 chat_with_agent");
    expect(result.prompt).toContain("必须传入必要的前序结果");
  });
});
