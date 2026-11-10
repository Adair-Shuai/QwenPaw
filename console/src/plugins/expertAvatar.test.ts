import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { ExpertAvatar } from "../../../plugins/bundle/ugsci/ui/src/components/avatars";
import fs from "node:fs";
import path from "node:path";
import { avatarKit } from "../../../plugins/bundle/ugsci/ui/src/expert/avatar/avatarArtwork";
import {
  matchExpertAvatar,
  renderExpertAvatar,
} from "../../../plugins/bundle/ugsci/ui/src/expert/avatar/expertAvatar";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("UGSci expert avatar artwork", () => {
  it("reuses bounded SVG templates and invalidates every rendered recipe input", () => {
    const spy = vi.spyOn(avatarKit, "render");
    const recipe = {
      ...matchExpertAvatar("缓存测试"),
      badge: "research",
      colors: { shell: "#123456", eyes: "#ffffff" },
    };
    const first = renderExpertAvatar(recipe, "缓存测试", 39, "first");
    const second = renderExpertAvatar(
      { ...recipe, colors: { eyes: "#ffffff", shell: "#123456" } },
      "缓存测试",
      39,
      "second",
    );
    expect(spy).toHaveBeenCalledTimes(1);
    expect(renderExpertAvatar(recipe, "缓存测试", 39, "first")).toBe(first);
    expect(first).not.toBe(second);
    const parse = (svg: string) =>
      new DOMParser().parseFromString(svg, "image/svg+xml");
    expect(parse(first).querySelector("clipPath")?.id).not.toBe(
      parse(second).querySelector("clipPath")?.id,
    );
    expect(
      parse(second).querySelector("[clip-path]")?.getAttribute("clip-path"),
    ).toBe("url(#" + parse(second).querySelector("clipPath")?.id + ")");
    const changes = {
      domain: "storage",
      role: "schedule",
      shell: "shield",
      visor: "soft",
      expression: "friendly",
      badge: "none",
      crown_domain: "law",
      crown_role: "counsel",
      category_label: "自定义",
    };
    for (const [field, value] of Object.entries(changes)) {
      const before = spy.mock.calls.length;
      renderExpertAvatar(
        { ...recipe, [field]: value },
        "缓存测试",
        39,
        "first",
      );
      expect(spy.mock.calls.length).toBe(before + 1);
    }
    for (const part of [
      "shell",
      "visor",
      "eyes",
      "crown",
      "badge",
      "badge_ring",
      "background",
    ]) {
      const before = spy.mock.calls.length;
      renderExpertAvatar(
        { ...recipe, colors: { ...recipe.colors, [part]: "#abcdef" } },
        "缓存测试",
        39,
        "first",
      );
      expect(spy.mock.calls.length).toBe(before + 1);
    }
    const before = spy.mock.calls.length;
    renderExpertAvatar(recipe, "缓存改名", 39);
    renderExpertAvatar(recipe, "缓存测试", 40);
    expect(spy.mock.calls.length).toBe(before + 2);
  });

  it("evicts old templates by count and text budget and bypasses oversized entries", () => {
    const spy = vi.spyOn(avatarKit, "render");
    const recipe = matchExpertAvatar("缓存容量");
    renderExpertAvatar(recipe, "待淘汰", 32);
    for (let index = 0; index < 80; index++)
      renderExpertAvatar(recipe, "容量" + index, 32);
    let before = spy.mock.calls.length;
    renderExpertAvatar(recipe, "容量79", 32);
    expect(spy.mock.calls.length).toBe(before);
    renderExpertAvatar(recipe, "待淘汰", 32);
    expect(spy.mock.calls.length).toBe(before + 1);
    renderExpertAvatar(recipe, "文本预算首项", 32);
    for (let index = 0; index < 12; index++)
      renderExpertAvatar(recipe, "x".repeat(8000) + index, 32);
    before = spy.mock.calls.length;
    renderExpertAvatar(recipe, "文本预算首项", 32);
    expect(spy.mock.calls.length).toBe(before + 1);
    before = spy.mock.calls.length;
    renderExpertAvatar(recipe, "z".repeat(70000), 32);
    renderExpertAvatar(recipe, "z".repeat(70000), 32);
    renderExpertAvatar(recipe, "文本预算首项", 32);
    expect(spy.mock.calls.length).toBe(before + 2);
  });

  it("preserves mounted SVG nodes during unrelated updates and refreshes changed colors", () => {
    const previous = window.QwenPaw;
    window.QwenPaw = { host: { React } } as typeof window.QwenPaw;
    try {
      const spy = vi.spyOn(avatarKit, "render");
      const recipe = { ...matchExpertAvatar("挂载缓存"), badge: "research" };
      const view = render(
        React.createElement(ExpertAvatar, {
          recipe,
          name: "挂载缓存",
          size: 37,
        }),
      );
      const svg = view.container.querySelector("svg");
      const calls = spy.mock.calls.length;
      view.rerender(
        React.createElement(ExpertAvatar, {
          recipe: { ...recipe },
          name: "挂载缓存",
          size: 37,
          borderRadius: 8,
        }),
      );
      expect(spy.mock.calls.length).toBe(calls);
      expect(view.container.querySelector("svg")).toBe(svg);
      view.rerender(
        React.createElement(ExpertAvatar, {
          recipe: { ...recipe, colors: { shell: "#abcdef" } },
          name: "挂载缓存",
          size: 37,
        }),
      );
      expect(
        view.container.querySelector('[data-avatar-part="shell"]'),
      ).toHaveAttribute("fill", "#abcdef");
      expect(spy.mock.calls.length).toBe(calls + 1);
    } finally {
      window.QwenPaw = previous;
    }
  });

  it("renders all 72 original roles and maps their identities to the same valid recipes", () => {
    expect(avatarKit.domains).toHaveLength(24);
    expect(avatarKit.domains.flatMap((domain) => domain.roles)).toHaveLength(
      72,
    );
    const catalog = JSON.parse(
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          "../plugins/bundle/ugsci/avatar_catalog.json",
        ),
        "utf8",
      ),
    );
    expect(catalog).toEqual(
      Object.fromEntries(
        avatarKit.domains.map((domain) => [
          domain.id,
          domain.roles.map((role) => role.id),
        ]),
      ),
    );
    for (const domain of avatarKit.domains) {
      for (const role of domain.roles) {
        const recipe = matchExpertAvatar(role.label);
        expect(recipe).toMatchObject({ domain: domain.id, role: role.id });
        const svg = renderExpertAvatar(recipe, role.label, 32);
        const document = new DOMParser().parseFromString(svg, "image/svg+xml");
        expect(document.querySelector("parsererror")).toBeNull();
        expect(document.documentElement.getAttribute("viewBox")).toBe(
          "0 0 128 128",
        );
        expect(document.querySelectorAll("path").length).toBeGreaterThan(0);
        expect(svg).not.toMatch(/undefined|NaN/);
        expect(svg).toContain('fill="currentColor"');
      }
    }
  });

  it.each([
    ["储气库生产动态分析师", "storage", "cycling"],
    ["库存评价专家", "storage", "capacity"],
    ["钻井工程师", "drilling", "drilling"],
    ["数据诊断专家", "analysis", "quality"],
    ["外科医生", "health", "clinical"],
    ["法务顾问", "law", "counsel"],
    ["网络安全专家", "security", "access"],
    ["未知自定义角色", "office", "document"],
  ])("matches %s to %s/%s without invoking a model", (name, domain, role) => {
    expect(matchExpertAvatar(name)).toMatchObject({ domain, role });
  });

  it("escapes custom labels and keeps composed badge clip paths distinct", () => {
    const recipe = {
      ...matchExpertAvatar("库容评估专家"),
      badge: "research",
      category_label: '<img src=x onerror="alert(1)">',
    };
    const first = renderExpertAvatar(recipe, "<script>alert(1)</script>", 48);
    const second = renderExpertAvatar(recipe, "另一个专家", 48);
    const parse = (svg: string) =>
      new DOMParser().parseFromString(svg, "image/svg+xml");
    expect(parse(first).querySelector("script,img")).toBeNull();
    expect(parse(first).querySelector("desc")?.textContent).toContain("<img");
    expect(parse(first).querySelector("clipPath")?.id).not.toBe(
      parse(second).querySelector("clipPath")?.id,
    );
  });

  it("prioritizes the expert name and ignores boilerplate identity trailers", () => {
    expect(matchExpertAvatar("法务顾问", "整理办公文档")).toMatchObject({
      domain: "law",
      role: "counsel",
    });
    expect(
      matchExpertAvatar(
        "Default Agent",
        "Default QwenPaw agent | 定位：AI？机器人？使魔？",
      ),
    ).toMatchObject({ domain: "office", role: "document" });
  });

  it("colors every composed part independently across all roles while preserving theme defaults and transparent cutouts", () => {
    const colors = {
      shell: "#e07842",
      visor: "#171717",
      eyes: "#9de7df",
      crown: "#356c89",
      badge: "#a86b35",
      badge_ring: "#748058",
      background: "#f3f0e8",
    };
    for (const domain of avatarKit.domains) {
      for (const role of domain.roles) {
        const recipe = {
          ...matchExpertAvatar(role.label),
          badge: "research",
          colors,
        };
        const document = new DOMParser().parseFromString(
          renderExpertAvatar(recipe, role.label, 48),
          "image/svg+xml",
        );
        expect(document.querySelector("parsererror")).toBeNull();
        for (const [part, color] of Object.entries(colors)) {
          expect(
            document
              .querySelector(`[data-avatar-part="${part}"]`)
              ?.getAttribute("fill"),
          ).toBe(color);
        }
      }
    }
    const monochrome = new DOMParser().parseFromString(
      renderExpertAvatar(matchExpertAvatar("库存评价专家"), "默认", 32),
      "image/svg+xml",
    );
    expect(
      monochrome
        .querySelector('[data-avatar-part="shell"]')
        ?.getAttribute("fill"),
    ).toBe("currentColor");
    expect(
      monochrome
        .querySelector('[data-avatar-part="eyes"]')
        ?.getAttribute("fill"),
    ).toBe("transparent");
    expect(
      monochrome.querySelector('[data-avatar-part="background"]'),
    ).toBeNull();
    const invalid = avatarKit.render({
      colors: {
        shell: 'red" onload="alert(1)',
        background: "url(https://example.com/evil.svg)",
      },
    });
    expect(invalid).not.toMatch(/onload|https:\/\/example/);
  });
});
