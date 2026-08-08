/**
 * Tests for the Coding editor's extension → Monaco language mapping.
 */

import { describe, expect, it } from "vitest";

import { getLanguage } from "./getLanguage";

describe("getLanguage", () => {
  it("maps RobotFramework extensions", () => {
    expect(getLanguage("tests/login.robot")).toBe("robotframework");
    expect(getLanguage("resources/common.resource")).toBe("robotframework");
    expect(getLanguage("SUITE.ROBOT")).toBe("robotframework");
  });

  it("keeps existing mappings intact", () => {
    expect(getLanguage("main.py")).toBe("python");
    expect(getLanguage("app.tsx")).toBe("typescript");
    expect(getLanguage("unknown.xyz")).toBe("plaintext");
  });

  it("covers workspace configuration and structured text files", () => {
    expect(getLanguage("data.json")).toBe("json");
    expect(getLanguage("data.jsonc")).toBe("json");
    expect(getLanguage("config.yaml")).toBe("yaml");
    expect(getLanguage("settings.toml")).toBe("ini");
    expect(getLanguage("diagram.mmd")).toBe("markdown");
    expect(getLanguage("Dockerfile")).toBe("dockerfile");
    expect(getLanguage("Makefile")).toBe("makefile");
  });
});
