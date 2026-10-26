import { init, use } from "echarts/core";
import { LineChart } from "echarts/charts";
import { DataZoomComponent, GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

use([LineChart, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent, SVGRenderer]);

export function mountChart(element: HTMLElement) {
  const chart = init(element, undefined, { renderer: "svg", width: element.clientWidth || 480, height: element.clientHeight || 280 });
  return {
    update(series: any[], compact: boolean) {
      const units = [...new Set(series.map((item) => item.unit || "单位未标注"))];
      const axisName = [...new Set(series.map((item) => item.time_unit || "时间（单位未标注）"))].join(" / ");
      chart.setOption({
        animation: false,
        color: ["#2563eb", "#0d9488", "#db2777", "#d97706", "#7c3aed", "#475569"],
        grid: { top: compact ? 24 : 44, left: 58, right: units.length > 1 ? 58 : 24, bottom: compact ? 34 : 68 },
        tooltip: { trigger: "axis", confine: true },
        legend: { show: !compact, type: "scroll", top: 4, data: series.map((item) => item.label) },
        xAxis: { type: "value", name: axisName, nameLocation: "middle", nameGap: 24 },
        yAxis: units.map((unit, index) => ({ type: "value", name: unit, position: index === 0 ? "left" : "right", offset: Math.max(0, index - 1) * 45, scale: true })),
        dataZoom: compact ? [] : [{ type: "inside", filterMode: "none" }, { type: "slider", bottom: 4, height: 18, filterMode: "none" }],
        series: series.map((item) => ({
          id: item.id, name: item.label, type: "line", showSymbol: false, connectNulls: false,
          yAxisIndex: units.indexOf(item.unit || "单位未标注"),
          data: item.points.map((point: any) => [point.time, point.value]),
        })),
      }, { replaceMerge: ["series", "yAxis"] });
    },
    resize() { chart.resize({ width: element.clientWidth || 480 }); },
    dispose() { chart.dispose(); },
  };
}
