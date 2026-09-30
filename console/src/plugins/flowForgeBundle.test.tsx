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

  const bundlePath = path.resolve(
    process.cwd(),
    "../src/qwenpaw/plugins_bundle/flowforge/ui/dist/index.js",
  );
  new Function(fs.readFileSync(bundlePath, "utf8"))();

  expect(routes).toMatchObject([
    { id: "flowforge.editor", path: "/flowforge" },
  ]);
});
