import { describe, expect, it } from "vitest";
import {
  aspectRatioCss,
  clampColumns,
  clampHeadingLevel,
  fieldName,
  isHttpUrl,
  layoutBoxStyle,
  resolveChartModel,
  resolveGenUiIcon,
} from "@genui-src/lib/genUiModel";

describe("genUiModel", () => {
  it("resolves a polynomial from slider values and stays static without a generator", () => {
    const generated = resolveChartModel(
      {
        chart: "line",
        generator: {
          type: "polynomial",
          coefficients: ["a", "b", "c", "d", "e"],
          xMin: 0,
          xMax: 10,
          samples: 11,
        },
      },
      { a: 0, b: 0, c: 0, d: 1, e: 0 },
    );
    expect(generated.empty).toBe(false);
    expect(generated.series[0].values).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const staticChart = resolveChartModel(
      {
        chart: "line",
        categories: ["x", "y"],
        series: [{ name: "s", values: [1, 3] }],
      },
      { a: 9, b: 9, c: 9, d: 9, e: 9 },
    );
    expect(staticChart.series[0].values).toEqual([1, 3]);
    expect(staticChart.categories).toEqual(["x", "y"]);
  });

  it("does not generate a polynomial unless values are provided", () => {
    const model = resolveChartModel({
      generator: { type: "polynomial" },
      categories: ["a"],
      series: [{ name: "s", values: [4] }],
    });
    expect(model.series[0].values).toEqual([4]);
  });

  it("reuses field, heading, and layout helpers", () => {
    expect(fieldName({ props: { label: "a（二次项）" } })).toBe("a");
    expect(fieldName({ props: { name: "coef" }, nodeId: "n1" })).toBe("coef");
    expect(clampHeadingLevel(9)).toBe(4);
    expect(clampHeadingLevel("nope")).toBe(2);
    expect(clampColumns(8, 2, 6)).toBe(6);
    expect(aspectRatioCss("4:3")).toBe("4 / 3");
    expect(aspectRatioCss("bad")).toBe("16 / 9");
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("https://example.com")).toBe(true);
    expect(layoutBoxStyle("AspectBox", { ratio: "16:9" }).aspectRatio).toBe("16 / 9");
    expect(layoutBoxStyle("Grid", { columns: 3 }).gridTemplateColumns).toContain("3");
  });

  it("maps Icon names to SVG paths and hides Lucide identifiers", () => {
    expect(resolveGenUiIcon("check").kind).toBe("svg");
    expect(resolveGenUiIcon("alert-triangle").kind).toBe("svg");
    expect(resolveGenUiIcon("sparkles").kind).toBe("empty");
    expect(resolveGenUiIcon("🔥").kind).toBe("emoji");
  });
});
