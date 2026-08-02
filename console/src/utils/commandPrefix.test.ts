import { describe, expect, it } from "vitest";
import {
  isCommandInput,
  LOCALIZED_COMMAND_PREFIX,
  normalizeCommandPrefix,
} from "./commandPrefix";

describe("commandPrefix", () => {
  it("normalizes a leading Chinese dunhao to slash", () => {
    expect(normalizeCommandPrefix("、compact now")).toBe("/compact now");
    expect(isCommandInput(`${LOCALIZED_COMMAND_PREFIX}skills`)).toBe(true);
  });

  it("does not rewrite dunhao inside ordinary Chinese text", () => {
    expect(normalizeCommandPrefix("请比较甲、乙两项")).toBe("请比较甲、乙两项");
    expect(isCommandInput("请比较甲、乙两项")).toBe(false);
  });
});
