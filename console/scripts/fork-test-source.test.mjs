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

test("rejects placeholder callbacks that retain only a title or return value", () => {
  for (const callback of [
    `() => { return; }`,
    `() => { 'feature removed'; }`,
    `() => { 'feature removed'; return true; }`,
    `async () => { return Promise.resolve(); }`,
    `() => true`,
    `() => undefined`,
  ]) {
    assert.throws(
      () =>
        inspectForkTestSource("page.test.tsx", `it('required', ${callback});`),
      /Empty/,
      callback,
    );
  }
});

test("rejects runtime skips inside protected callbacks", () => {
  for (const callback of [
    `({ skip }) => { skip(); expect(page()).toBeTruthy(); }`,
    `(context) => { context.skip(); expect(page()).toBeTruthy(); }`,
    `({ skip: omit }) => { omit(); expect(page()).toBeTruthy(); }`,
  ]) {
    assert.throws(
      () =>
        inspectForkTestSource("page.test.tsx", `it('required', ${callback});`),
      /cannot.*skip/i,
    );
  }
});

test("rejects literal empty parameter tables for tests and containing suites", () => {
  for (const source of [
    `it.each([])('required', () => check());`,
    `describe.each([])('page', () => { it('required', () => check()); });`,
  ]) {
    assert.throws(
      () => inspectForkTestSource("page.test.tsx", source, ["required"]),
      /Empty.*parameter/,
    );
  }
});

test("accepts concise assertions and helper-backed callbacks without banning application skip methods", () => {
  inspectForkTestSource(
    "page.test.tsx",
    `it('concise', () => expect(page()).toBeTruthy());
     it('helper', () => { return verifyPage(); });
     it('application', () => { model.skip(); expect(model.done).toBe(true); });`,
    ["concise", "helper", "application"],
  );
});
