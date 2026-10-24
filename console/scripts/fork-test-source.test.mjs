import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectForkTestSource } from "./fork-test-source.mjs";

test("accepts real parameterized integration registrations", () => {
  const source = `describe.each([1, 2])('page', () => { it.each(['zh', 'en'])('real %s', () => { expect(page()).toBeTruthy(); }); });`;
  assert.ok(
    inspectForkTestSource("page.test.tsx", source, ["real %s"]).has("real %s"),
  );
});
test("comments and text cannot replace a required integration test", () => {
  for (const fake of [
    `// it('required', () => expect(true).toBe(true));`,
    `const example = "it('required', () => {})";`,
  ]) {
    assert.throws(
      () =>
        inspectForkTestSource(
          "page.test.tsx",
          `it('other', () => check());\n${fake}`,
          ["required"],
        ),
      /missing/,
    );
  }
});
test("rejects skipped, conditional, focused and expected-failure tests including suites", () => {
  for (const modifier of ["skip", "todo", "only", "skipIf", "runIf", "fails"]) {
    for (const root of ["it", "test", "describe"]) {
      assert.throws(
        () =>
          inspectForkTestSource(
            "page.test.tsx",
            `${root}.${modifier}('required', () => check());`,
          ),
        /cannot use/,
      );
    }
  }
  assert.throws(
    () =>
      inspectForkTestSource(
        "page.test.tsx",
        `it['skip']('required', () => check());`,
      ),
    /cannot use/,
  );
});
test("rejects empty callbacks and empty suites", () => {
  assert.throws(
    () =>
      inspectForkTestSource(
        "page.test.tsx",
        `it('required', () => { /* removed */ });`,
      ),
    /Empty/,
  );
  assert.throws(
    () => inspectForkTestSource("page.test.tsx", `describe('page', () => {});`),
    /No executable/,
  );
});
test("does not mistake incidental skip text for test modifiers", () => {
  inspectForkTestSource(
    "page.test.tsx",
    `it('skip documentation', () => { expect(model.skip).toBe(false); });`,
    ["skip documentation"],
  );
});
