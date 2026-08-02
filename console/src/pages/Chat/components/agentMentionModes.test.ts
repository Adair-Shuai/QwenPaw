import { beforeEach, describe, expect, it } from "vitest";
import type { AgentSummary } from "../../../api/types/agents";
import {
  clearAgentMentionModes,
  buildAgentMentionDispatch,
  captureAgentMentionModesForSubmit,
  getAgentMentionMode,
  consumeAgentMentionModesForSubmit,
  setAgentMentionMode,
  shouldCoordinateAgentMentions,
  syncAgentMentionModes,
} from "./agentMentionModes";

const agents: AgentSummary[] = [
  {
    id: "pvt",
    name: "PVT专家",
    description: "",
    workspace_dir: "/tmp/pvt",
    enabled: true,
    backend: "qwenpaw",
  },
  {
    id: "reservoir",
    name: "气藏工程专家",
    description: "",
    workspace_dir: "/tmp/reservoir",
    enabled: true,
    backend: "qwenpaw",
  },
];

describe("agentMentionModes", () => {
  beforeEach(clearAgentMentionModes);

  it("defaults typed mentions to direct delegation and removes stale modes", () => {
    expect(
      syncAgentMentionModes("请 @PVT专家 计算", agents, (agent) => agent.name),
    ).toEqual(["pvt"]);
    expect(getAgentMentionMode("pvt")).toBe("delegate");

    syncAgentMentionModes("普通文本", agents, (agent) => agent.name);
    expect(getAgentMentionMode("pvt")).toBe("delegate");
  });

  it("coordinates one collaborative mention or multiple mentions", () => {
    setAgentMentionMode("pvt", "collaborate");
    expect(shouldCoordinateAgentMentions(["pvt"])).toBe(true);
    expect(shouldCoordinateAgentMentions(["pvt", "reservoir"])).toBe(true);
    expect(shouldCoordinateAgentMentions(["reservoir"])).toBe(false);
  });

  it("builds direct and collaborative request payloads", () => {
    expect(
      buildAgentMentionDispatch(
        "请 @PVT专家 计算",
        agents,
        (agent) => agent.name,
        { pvt: "delegate" },
      ),
    ).toMatchObject({
      requestText: "请 计算",
      targetAgentId: "pvt",
      coordinationRequested: false,
    });
    expect(
      buildAgentMentionDispatch(
        "请与 @PVT专家 一起计算",
        agents,
        (agent) => agent.name,
        { pvt: "collaborate" },
      ),
    ).toMatchObject({ coordinationRequested: true });
  });

  it("keeps submit modes stable if the textarea is cleared before fetch", () => {
    setAgentMentionMode("pvt", "collaborate");
    captureAgentMentionModesForSubmit();
    clearAgentMentionModes();

    expect(consumeAgentMentionModesForSubmit()).toEqual({
      pvt: "collaborate",
    });
  });
});
