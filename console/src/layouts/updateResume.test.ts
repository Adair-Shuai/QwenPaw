import { afterEach, describe, expect, it } from "vitest";
import {
  clearResumeComponentUpdatesAfterCore,
  decideResumeComponentUpdates,
  hasResumeComponentUpdatesAfterCore,
  markResumeComponentUpdatesAfterCore,
  RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY,
} from "./updateResume";

describe("updateResume", () => {
  afterEach(() => {
    clearResumeComponentUpdatesAfterCore();
  });

  it("hides the durable flag from the same runtime that queued the core install", () => {
    markResumeComponentUpdatesAfterCore();
    expect(
      window.localStorage.getItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY),
    ).toBe("1");
    expect(hasResumeComponentUpdatesAfterCore()).toBe(false);
  });

  it("retries when the backend is not ready or components were not checked", () => {
    expect(decideResumeComponentUpdates({ ok: false })).toBe("retry");
    expect(
      decideResumeComponentUpdates({
        ok: true,
        componentsChecked: false,
        componentCount: 3,
      }),
    ).toBe("retry");
  });

  it("opens only after a successful component probe finds updates", () => {
    expect(
      decideResumeComponentUpdates({
        ok: true,
        componentsChecked: true,
        componentCount: 2,
      }),
    ).toBe("open");
    expect(
      decideResumeComponentUpdates({
        ok: true,
        componentsChecked: true,
        componentCount: 0,
      }),
    ).toBe("done");
  });
});
