import { sampleMeasurements } from "./measurements.js";
// Reference drawing of two parallel station trains. Coordinates and snapshots are illustrative.
const sites = [
  ["WH-01", "井场汇管", "manifold", 70, 185, 0, 80, 126],
  ["XV-01", "采气切断", "esd", 180, 90, 160, 160, 126],
  ["V-01", "气液分离", "separator", 317, 90, 310, 160, 126],
  ["T-01", "脱水塔", "dehydrator", 454, 90, 405, 160, 126],
  ["PCV-01", "外输调压", "regulator", 591, 90, 505, 145, 126],
  ["FE-01", "双向计量", "meter", 737, 185, 690, 92, 126],
  ["BL-01", "站界接口", "flange", 859, 185, 815, 92, 126],
  ["CV-01", "注气止回", "check", 180, 275, 155, 0, 126],
  ["AC-01", "排气空冷", "cooler", 317, 275, 281, 12, 126],
  ["K-01", "注气压缩", "compressor", 454, 275, 405, 0, 126],
  ["F-01", "吸气过滤", "filter", 591, 275, 543, 12, 126],
];
const circuits = [
  ["WH-01", "XV-01"],
  ["XV-01", "V-01"],
  ["V-01", "T-01"],
  ["T-01", "PCV-01"],
  ["PCV-01", "FE-01"],
  ["FE-01", "BL-01"],
  ["FE-01", "F-01"],
  ["F-01", "K-01"],
  ["K-01", "AC-01"],
  ["AC-01", "CV-01"],
  ["CV-01", "WH-01"],
];
const nodes = sites.map(([id, name, type, x, y, e, n, z]) => ({
  id,
  name,
  type,
  diagram: [x, y],
  enuM: [e, n, z],
}));
const pipes = circuits.map(([from, to], i) => ({
  id: "L-" + String(i + 1).padStart(2, "0"),
  from,
  to,
  dn: i === 5 ? 350 : 250,
}));
function operating(name, pressures, rates) {
  return {
    name,
    pressureMPa: Object.fromEntries(nodes.map((n, i) => [n.id, pressures[i]])),
    flow10kSm3d: Object.fromEntries(pipes.map((p, i) => [p.id, rates[i]])),
  };
}
const baseStation = {
  version: 1,
  name: "集注站工艺流程",
  source: "示例工况",
  standard: "20 °C · 101.325 kPa(a)",
  nodes,
  pipes,
  cases: [
    operating(
      "冬季采气",
      [8.45, 8.44, 8.4, 8.33, 7.7, 7.68, 7.64, 8.45, 8.45, 8.45, 7.68],
      [92, 92, 92, 92, 92, 92, 0, 0, 0, 0, 0],
    ),
    operating(
      "夏季注气",
      [9.42, 9.42, 9.42, 9.42, 7.69, 7.69, 7.73, 9.46, 9.49, 9.54, 7.66],
      [0, 0, 0, 0, 0, -67, 67, 67, 67, 67, 67],
    ),
  ],
};

export const stationPlan = {
  ...baseStation,
  ...sampleMeasurements(
    [
      ["PT-411", "V-01", "pressure"],
      ["FT-401", "L-06", "flow"],
      ["TT-412", "AC-01", "temperature"],
      ["PDT-413", "L-03", "differential"],
    ],
    [
      [8.38, 91.7, 16.1, 0.08],
      [9.4, -67.3, 29.8, 0],
    ],
    [{ "AC-01": 16 }, { "AC-01": 30.2 }],
    baseStation.cases,
  ),
};
