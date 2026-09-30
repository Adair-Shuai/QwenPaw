// @vitest-environment jsdom
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { afterEach, expect, it } from "vitest";

afterEach(() => {
  delete (window as unknown as Record<string, unknown>).QwenPaw;
});

it("registers the FlowForge route from the built plugin bundle", () => {
  const routes: Array<{ id: string; path: string }> = [];
  (window as unknown as Record<string, unknown>).QwenPaw = {
    host: { React, ReactDOM: {} },
    route: {
      add: (_pluginId: string, route: { id: string; path: string }) => {
        routes.push(route);
      },
    },
  };

  const sourceBundlePath = path.resolve(
    process.cwd(),
    "../plugins/bundle/flowforge/ui/dist/index.js",
  );
  const mirrorBundlePath = path.resolve(
    process.cwd(),
    "../src/qwenpaw/plugins_bundle/flowforge/ui/dist/index.js",
  );
  const source = fs.readFileSync(sourceBundlePath, "utf8");
  expect(fs.readFileSync(mirrorBundlePath, "utf8")).toBe(source);
  new Function(source)();

  expect(routes).toMatchObject([
    { id: "flowforge.editor", path: "/flowforge" },
  ]);
});
