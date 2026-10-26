import type { DatasetInfo } from "../contracts/types";

const controls: Record<string, string> = {
  dataset: "数据集", property: "着色属性", timeStep: "时间步", play: "动态播放",
  colorRamp: "色带", opacity: "不透明度", wireframe: "网格边线", filterIJK: "网格范围",
  propertyRange: "属性范围", excludeRange: "排除范围", isolateK: "单层显示", kLayer: "K 层",
  zScale: "垂向放大", orthographic: "正交投影", clipPlane: "水平裁切", clipDepth: "裁切位置",
  polyline: "剖面折线", zRange: "高程范围", intersection: "生成剖面", wellSection: "井剖面",
  slice: "切片位置", extractSlice: "提取切片", capture: "场景截图", stats: "属性统计",
  exportCsv: "导出数据", exportScene: "导出场景", importFile: "本地导入", importWorkspace: "工作区导入",
  deleteObject: "移除对象", axes: "坐标轴", floorGrid: "参考网格", wellLabels: "井名标签",
  legend: "色带图例", histogram: "属性分布", wellMap: "井位平面图", compass: "指北针", background: "背景颜色",
};
const properties: Record<string, string> = {
  porosity: "孔隙度", poro: "孔隙度", permeability: "渗透率", permi: "I 向渗透率", permj: "J 向渗透率", permk: "K 向渗透率", permx: "X 向渗透率", permy: "Y 向渗透率", permz: "Z 向渗透率",
  facies: "岩相", pressure: "压力", pres: "压力", temperature: "温度", flow_rate: "流量", diameter: "管径",
  velocity: "流速", mass_flow: "质量流量", density: "密度", sgas: "含气饱和度", swat: "含水饱和度", soil: "含油饱和度",
  depth: "深度", md: "测深", gr: "自然伽马", gk: "自然伽马", rhob: "密度测井", nphi: "中子孔隙度",
};
export function controlLabel(name: string): string { return controls[name] || name; }
export function propertyLabel(name: string, dataset?: DatasetInfo | null): string {
  const descriptor = dataset?.properties?.[name];
  const label = descriptor?.label || properties[name.toLowerCase()] || name;
  return descriptor?.unit ? `${label}（${descriptor.unit}）` : label;
}
export function colorMapLabel(name: string): string {
  return ({ viridis: "蓝绿黄", plasma: "紫红黄", turbo: "高对比彩色", rainbow: "彩虹", gray: "灰度" } as Record<string, string>)[name] || name;
}
