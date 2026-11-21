import { sampleMeasurements, checkMeasurements } from "./measurements.js";
import { equipment } from "./equipment.js";
export const kinds = Object.fromEntries(
  Object.entries(equipment).map(([type, item]) => [type, item.name]),
);
const sites = [
  ["W01", "北一井", "well", 100, 80, 0, 1300, 156],
  ["W02", "北二井", "well", 100, 175, 630, 950, 138],
  ["W03", "南一井", "well", 100, 300, 50, 350, 124],
  ["W04", "南二井", "well", 100, 395, 440, 0, 117],
  ["V01", "北区阀组", "manifold", 340, 124, 1020, 1080, 131],
  ["V02", "南区阀组", "manifold", 340, 345, 1120, 340, 120],
  ["CS01", "中心集注站", "station", 575, 235, 1910, 760, 126],
  ["M01", "外输计量站", "terminal", 808, 235, 2680, 590, 119],
];
const links = [
  ["P-01", "W01", "V01", 150],
  ["P-02", "W02", "V01", 150],
  ["P-03", "W03", "V02", 150],
  ["P-04", "W04", "V02", 150],
  ["P-05", "V01", "CS01", 250],
  ["P-06", "V02", "CS01", 250],
  ["P-07", "CS01", "M01", 350],
];
function snapshot(name, p, q) {
  return {
    name,
    pressureMPa: Object.fromEntries(sites.map(([id], i) => [id, p[i]])),
    flow10kSm3d: Object.fromEntries(links.map(([id], i) => [id, q[i]])),
  };
}
const baseDemo = {
  version: 1,
  name: "青岚储气库",
  source: "合成示例",
  standard: "20 °C · 101.325 kPa(a)",
  nodes: sites.map(([id, name, type, x, y, e, n, z]) => ({
    id,
    name,
    type,
    diagram: [x, y],
    enuM: [e, n, z],
  })),
  pipes: links.map(([id, from, to, dn], i) => ({
    id,
    from,
    to,
    dn,
    viaM: [
      [
        [360, 1350, 149],
        [720, 1170, 137],
      ],
      [[810, 950, 136]],
      [
        [430, 420, 129],
        [830, 420, 126],
      ],
      [[680, 90, 120]],
      [
        [1310, 1080, 131],
        [1530, 870, 128],
      ],
      [
        [1380, 345, 123],
        [1660, 590, 125],
      ],
      [
        [2130, 760, 125],
        [2450, 595, 121],
      ],
    ][i],
  })),
  cases: [
    snapshot(
      "冬季采气",
      [8.64, 8.58, 8.51, 8.47, 8.43, 8.36, 8.12, 8.06],
      [28, 24, 22, 18, 52, 40, 92],
    ),
    snapshot(
      "夏季注气",
      [9.05, 9.1, 9.14, 9.18, 9.3, 9.34, 9.57, 9.64],
      [-20, -17, -16, -14, -37, -30, -67],
    ),
  ],
};
export const demo = {
  ...baseDemo,
  ...sampleMeasurements(
    [
      ["PT-101", "W01", "pressure"],
      ["PT-201", "V01", "pressure"],
      ["FT-201", "P-05", "flow", "边界"],
      ["PDT-301", "P-07", "differential"],
      ["TT-301", "CS01", "temperature"],
    ],
    [
      [8.6, 8.47, 52, 0.07, 18.7],
      [9.02, 9.34, -37, -0.09, 23.8],
    ],
    [{ CS01: 18.4 }, { CS01: 24.1 }],
    baseDemo.cases,
  ),
};
const finite = Number.isFinite;
export function validate(model) {
  const fail = (msg) => {
    throw new Error(msg);
  };
  if (
    model?.version !== 1 ||
    ![model.name, model.standard, model.source].every(
      (v) => typeof v === "string" && v.trim(),
    )
  )
    fail("请填写版本、项目名、来源和气量标准状态");
  if (
    ![model.nodes, model.pipes, model.cases].every(
      (a) => Array.isArray(a) && a.length,
    )
  )
    fail("缺少节点、管段或工况");
  const ids = new Set(),
    nodeIds = new Set();
  const idOk = (id) =>
    typeof id === "string" &&
    /^[A-Za-z0-9][\w.-]{0,63}$/.test(id) &&
    !Object.hasOwn(Object.prototype, id) &&
    !ids.has(id);
  for (const n of model.nodes) {
    if (
      !n ||
      !idOk(n.id) ||
      !Object.hasOwn(kinds, n.type) ||
      typeof n.name !== "string" ||
      !n.name.trim()
    )
      fail("节点编号重复或节点属性有误");
    if (
      ![
        [n.diagram, 2],
        [n.enuM, 3],
      ].every(
        ([a, len]) => Array.isArray(a) && a.length === len && a.every(finite),
      )
    )
      fail(n.id + " 坐标有误");
    ids.add(n.id);
    nodeIds.add(n.id);
  }
  for (const p of model.pipes) {
    if (
      !p ||
      !idOk(p.id) ||
      !nodeIds.has(p.from) ||
      !nodeIds.has(p.to) ||
      p.from === p.to ||
      !finite(p.dn) ||
      p.dn <= 0
    )
      fail("管段编号、端点或公称直径有误");
    if (
      p.viaM !== undefined &&
      !(
        Array.isArray(p.viaM) &&
        p.viaM.every(
          (v) => Array.isArray(v) && v.length === 3 && v.every(finite),
        )
      )
    )
      fail(p.id + " 管段转折点坐标有误");
    ids.add(p.id);
  }
  for (const c of model.cases) {
    if (
      !c ||
      typeof c.name !== "string" ||
      !c.name.trim() ||
      !model.nodes.every(
        (n) => finite(c.pressureMPa?.[n.id]) && c.pressureMPa[n.id] > 0,
      ) ||
      !model.pipes.every((p) => finite(c.flow10kSm3d?.[p.id]))
    )
      fail("工况缺少有效绝压或有符号流量");
  }
  checkMeasurements(model);
  return model;
}
export function valueOf(p, c, metric) {
  return metric === "pressure"
    ? (c.pressureMPa[p.from] + c.pressureMPa[p.to]) / 2
    : Math.abs(c.flow10kSm3d[p.id]);
}
export const palette = ["#3679ad", "#18899a", "#23967d", "#b38537"];
export function scale(model, c, metric) {
  const values = model.pipes.map((p) => valueOf(p, c, metric));
  const lo = Math.min(...values),
    hi = Math.max(...values);
  return {
    lo,
    hi,
    color: (p) =>
      palette[
        hi === lo
          ? 0
          : Math.min(
              3,
              Math.floor((4 * (valueOf(p, c, metric) - lo)) / (hi - lo)),
            )
      ],
  };
}
export function bounds(points) {
  return [0, 1, 2].map((k) => {
    const v = points.map((p) => p[k] ?? 0);
    return [Math.min(...v), Math.max(...v)];
  });
}
export function flowEnds(pipe, c) {
  return c.flow10kSm3d[pipe.id] < 0
    ? [pipe.to, pipe.from]
    : [pipe.from, pipe.to];
}
export function csv(model, c) {
  const quote = (v) => '"' + String(v).replaceAll('"', '""') + '"';
  const rows = [
    [
      "工况",
      "管段",
      "参考起点",
      "参考终点",
      "起点绝压_MPa",
      "终点绝压_MPa",
      "有符号流量_万标方每天",
      "气量标准状态",
    ],
    ...model.pipes.map((p) => [
      c.name,
      p.id,
      p.from,
      p.to,
      c.pressureMPa[p.from],
      c.pressureMPa[p.to],
      c.flow10kSm3d[p.id],
      model.standard,
    ]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(quote).join(",")).join("\r\n");
}
