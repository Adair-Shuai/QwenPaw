import { describe, expect, it } from "vitest";
import {
  isRenderableActionNode,
  normalizeChatActions,
} from "./chatActionSafety";

describe("chat action compatibility", () => {
  it("accepts arrays and legacy nested list configs", () => {
    const action = { id: "copy" };
    expect(normalizeChatActions([action])).toEqual([action]);
    expect(normalizeChatActions({ list: [action] })).toEqual([action]);
  });

  it("drops malformed action containers and React children", () => {
    expect(normalizeChatActions({ id: "not-a-list" })).toEqual([]);
    expect(isRenderableActionNode({})).toBe(false);
    expect(isRenderableActionNode("ok")).toBe(true);
  });
});
