import fs from "node:fs";
import path from "node:path";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => Reflect.deleteProperty(window, "QwenPaw"));

describe.each([
  "plugins/bundle/ugsci_research/ui/dist/index.js",
  "src/qwenpaw/plugins_bundle/ugsci_research/ui/dist/index.js",
])("retired research entry: %s", (bundle) => {
  it.each([true, false])(
    "does not expose mode or settings controls with slots available: %s",
    (hasSlots) => {
      const fill = vi.fn();
      const rightHeader = vi.fn();
      const addRoute = vi.fn();
      const registerToolRender = vi.fn();
      Object.defineProperty(window, "QwenPaw", {
        configurable: true,
        value: {
          host: { React, antd: {}, antdIcons: {} },
          route: { add: addRoute },
          slot: hasSlots ? { fill } : undefined,
          chat: { rightHeader: { add: rightHeader } },
          registerToolRender,
        },
      });
      new Function(
        fs.readFileSync(path.resolve(process.cwd(), "..", bundle), "utf8"),
      )();
      expect(rightHeader).not.toHaveBeenCalled();
      expect(addRoute).not.toHaveBeenCalled();
      expect(
        fill.mock.calls.every((call) => call[1] === "chat.rightPanel"),
      ).toBe(true);
      if (hasSlots)
        expect(fill).toHaveBeenCalledWith(
          "ugsci_research",
          "chat.rightPanel",
          expect.any(Function),
          { id: "research-artifact-panel" },
        );
      expect(registerToolRender).toHaveBeenCalledWith(
        "ugsci_research",
        expect.objectContaining({
          literature_search: expect.any(Function),
          research_web_search: expect.any(Function),
          web_search: expect.any(Function),
          data_analysis: expect.any(Function),
        }),
      );
    },
  );
});
