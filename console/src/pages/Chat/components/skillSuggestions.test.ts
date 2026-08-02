import { describe, expect, it } from "vitest";
import type { SkillSpec } from "../../../api/types/skill";
import {
  buildSkillSuggestions,
  extractLeadingCommandName,
  extractPotentialSkillName,
  normalizeCommandName,
} from "./skillSuggestions";

const skills: SkillSpec[] = [
  {
    name: "reservoir-analysis",
    content: "",
    source: "workspace",
    enabled: true,
    channels: ["console"],
  },
  {
    name: "disabled-skill",
    content: "",
    source: "workspace",
    enabled: false,
    channels: ["console"],
  },
];

describe("buildSkillSuggestions", () => {
  it("normalizes slash, dunhao, case, and bracketed names", () => {
    expect(normalizeCommandName("/Compact now")).toBe("compact");
    expect(normalizeCommandName("、Skills")).toBe("skills");
    expect(extractLeadingCommandName("  /[My Skill] do it")).toBe("my skill");
    expect(extractLeadingCommandName("ordinary text")).toBeNull();
    expect(extractPotentialSkillName("/compact now", ["compact"])).toBeNull();
    expect(extractPotentialSkillName("、PVT @expert", ["compact"])).toBe("pvt");
  });

  it("keeps enabled console skills in the slash menu", () => {
    expect(buildSkillSuggestions(skills, new Set(), new Set())).toEqual([
      {
        command: "/reservoir-analysis",
        value: "reservoir-analysis",
        description: "",
      },
    ]);
  });

  it("does not duplicate names reserved by commands or loop modes", () => {
    expect(
      buildSkillSuggestions(skills, new Set(["reservoir-analysis"]), new Set()),
    ).toEqual([]);
  });

  it("filters command collisions case-insensitively", () => {
    const collidingSkill: SkillSpec = {
      name: "Compact",
      content: "",
      source: "workspace",
      enabled: true,
      channels: ["console"],
    };
    const result = buildSkillSuggestions(
      [...skills, collidingSkill],
      new Set(["compact"]),
      new Set(),
    );
    expect(result.map((item) => item.value)).not.toContain("Compact");
  });
});
