import { describe, expect, it } from "vitest";
import {
  buildGenUiHtmlDocument,
  escapeHtml,
  renderExportTree,
  scriptJson,
} from "@genui-src/lib/genUiHtmlRender";
import type { GenUiNode } from "@genui-src/types/genUi";

const polyTree: GenUiNode = {
  nodeId: "root",
  kind: "Stack",
  props: {},
  children: [
    {
      nodeId: "a",
      kind: "Slider",
      props: { name: "a", label: "a", value: 1, min: -2, max: 2 },
      children: [],
    },
    {
      nodeId: "chart",
      kind: "Chart",
      props: {
        chart: "line",
        title: "f(x)",
        generator: {
          type: "polynomial",
          coefficients: ["a", "b", "c", "d", "e"],
          xMin: -1,
          xMax: 1,
          samples: 5,
        },
      },
      children: [],
    },
    {
      nodeId: "go",
      kind: "LinkButton",
      props: { label: "bad", href: "javascript:alert(1)" },
      children: [],
    },
    {
      nodeId: "ok",
      kind: "LinkButton",
      props: { label: "ok", href: "https://example.com/x" },
      children: [],
    },
  ],
};

describe("genUiHtmlRender", () => {
  it("escapes titles and JSON so markup cannot break out of the document", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toContain("&lt;img");
    expect(scriptJson({ note: "</script><script>alert(1)" })).toContain("\\u003c/script>");
    const html = buildGenUiHtmlDocument(
      polyTree,
      { a: 1 },
      { sources: {}, missing: [] },
      "x</title><script>alert(1)</script>",
    );
    expect(html).toContain("&lt;/title&gt;");
    expect(html).not.toMatch(/<title>x<\/title>/);
  });

  it("walks the shared tree into fields, charts, and safe link buttons", () => {
    const root = renderExportTree(polyTree, { a: 1, b: 0, c: 0, d: 0, e: 0 });
    const slider = root.querySelector("[data-genui-field='a']") as HTMLInputElement;
    expect(slider).toBeTruthy();
    expect(slider.type).toBe("range");
    expect(root.querySelector("[data-genui-chart]")).toBeTruthy();
    expect(root.querySelector("svg")).toBeTruthy();
    expect(root.querySelector("[data-genui-href='https://example.com/x']")).toBeTruthy();
    expect(root.querySelector("[data-genui-href^='javascript']")).toBeNull();
  });

  it("embeds the shared chart functions so offline sliders can refresh the SVG", () => {
    const html = buildGenUiHtmlDocument(
      polyTree,
      { a: 1, b: 0, c: 0, d: 0, e: 0 },
      { sources: {}, missing: [] },
      "poly",
    );
    expect(html).toContain("var resolveChartModel");
    expect(html).toContain("var paintChartElement");
    expect(html).toContain("data-genui-field");
    expect(html).toContain("<svg");
    expect(html).toMatch(/data-genui-field="a"[^>]*value="1"|value="1"[^>]*data-genui-field="a"/);
    const snapshot = new DOMParser().parseFromString(html, "text/html");
    expect((snapshot.querySelector("[data-genui-field='a']") as HTMLInputElement).value).toBe("1");

    const parsed = new DOMParser().parseFromString(html, "text/html");
    document.body.replaceChildren();
    for (const child of Array.from(parsed.body.childNodes)) {
      if (child.nodeName === "SCRIPT") continue;
      document.body.appendChild(document.importNode(child, true));
    }
    const valuesNode = parsed.getElementById("genui-values-data");
    if (valuesNode) document.body.appendChild(document.importNode(valuesNode, true));
    const scripts = Array.from(parsed.querySelectorAll("script"));
    const runtime = scripts[scripts.length - 1]?.textContent || "";
    expect(runtime).toContain("refreshCharts");
    (0, eval)(runtime);

    const slider = document.querySelector("[data-genui-field='a']") as HTMLInputElement;
    const before = document.querySelector("polyline")?.getAttribute("points");
    slider.value = "-1";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    const after = document.querySelector("polyline")?.getAttribute("points");
    expect(before).toBeTruthy();
    expect(after).not.toBe(before);
    expect((window as any).__GENUI_EXPORT__.values.a).toBe(-1);
  });

  it("paints allowlisted icons as SVG and omits Lucide names", () => {
    const root = renderExportTree({
      nodeId: "root",
      kind: "Stack",
      props: {},
      children: [
        { nodeId: "ok", kind: "Icon", props: { name: "warning" }, children: [] },
        { nodeId: "bad", kind: "Icon", props: { name: "sparkles" }, children: [] },
      ],
    });
    expect(root.querySelector("svg")).toBeTruthy();
    expect(root.textContent).not.toContain("warning");
    expect(root.textContent).not.toContain("sparkles");
  });
});
