import { csvParseRows, csvFormatRows } from "d3-dsv";
export const quantities = {
  pressure: { name: "节点绝压", unit: "MPa(a)", field: "pressureMPa" },
  temperature: { name: "节点温度", unit: "°C", field: "temperatureC" },
  flow: { name: "管段流量", unit: "万标方/日", field: "flow10kSm3d" },
  differential: { name: "管段压差", unit: "MPa" },
};
const fields = [
  "位号",
  "对象",
  "测量量",
  "时间",
  "实测值",
  "单位",
  "质量",
  "用途",
  "气量标况",
];
const tagPattern = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,39}$/;
const instant = (t) =>
  typeof t === "string" &&
  /^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{1,3})?)?(?:Z|[+-]\d\d:\d\d)$/.test(
    t,
  )
    ? Date.parse(t)
    : NaN;
export function checkMeasurements(model) {
  const sensors = model.sensors ?? [];
  if (!Array.isArray(sensors)) throw Error("测点清单须为数组");
  const nodes = new Set(model.nodes.map((n) => n.id)),
    pipes = new Set(model.pipes.map((p) => p.id)),
    ids = new Map();
  for (const s of sensors) {
    if (
      !s ||
      typeof s.tag !== "string" ||
      !tagPattern.test(s.tag) ||
      ids.has(s.tag) ||
      s.tag in Object.prototype ||
      !Object.hasOwn(quantities, s.kind)
    )
      throw Error("测点位号或测量量有误");
    if (
      !(s.kind === "flow" || s.kind === "differential" ? pipes : nodes).has(
        s.target,
      )
    )
      throw Error(s.tag + " 的绑定对象有误");
    if (s.role !== undefined && !["校核", "边界"].includes(s.role))
      throw Error(s.tag + " 的用途有误");
    for (const [coords, length] of [
      [s.diagram, 2],
      [s.enuM, 3],
    ])
      if (
        coords !== undefined &&
        !(
          Array.isArray(coords) &&
          coords.length === length &&
          coords.every(Number.isFinite)
        )
      )
        throw Error(s.tag + " 的测点坐标有误");
    ids.set(s.tag, s);
  }
  for (const c of model.cases) {
    if (c.time !== undefined && !Number.isFinite(instant(c.time)))
      throw Error("工况时间须采用带时区的 ISO 时间");
    if (
      c.observations !== undefined &&
      (!c.time ||
        !c.observations ||
        typeof c.observations !== "object" ||
        Array.isArray(c.observations))
    )
      throw Error("实测记录必须关联带时间的工况");
    for (const [tag, o] of Object.entries(c.observations ?? {})) {
      if (
        !ids.has(tag) ||
        !o ||
        !["有效", "可疑", "无效"].includes(o.quality) ||
        !Number.isFinite(o.value) ||
        (o.source !== undefined && typeof o.source !== "string")
      )
        throw Error("实测值或质量码有误：" + tag);
      if (ids.get(tag).kind === "pressure" && o.value <= 0)
        throw Error(tag + " 的绝压须为正数");
    }
    if (
      c.temperatureC !== undefined &&
      (!c.temperatureC ||
        typeof c.temperatureC !== "object" ||
        Array.isArray(c.temperatureC) ||
        Object.entries(c.temperatureC).some(
          ([id, v]) => !nodes.has(id) || !Number.isFinite(v),
        ))
    )
      throw Error("模型节点温度有误");
  }
}
export function comparison(model, c, s) {
  const measured = c.observations?.[s.tag];
  const pipe =
    s.kind === "differential"
      ? model.pipes.find((p) => p.id === s.target)
      : null;
  const predicted = pipe
    ? c.pressureMPa[pipe.from] - c.pressureMPa[pipe.to]
    : c[quantities[s.kind].field]?.[s.target];
  const status = !measured
    ? "缺实测"
    : !Number.isFinite(predicted)
    ? "缺模型值"
    : measured.quality !== "有效"
    ? measured.quality
    : s.role === "边界"
    ? "边界量"
    : "可比";
  return {
    predicted,
    measured,
    status,
    delta: status === "可比" ? predicted - measured.value : null,
  };
}
export function measurementsCsv(model, results = false) {
  const rows = [
    results
      ? [...fields, "模型值", "偏差（模型−实测）", "状态", "实测来源"]
      : fields,
  ];
  for (const c of model.cases)
    for (const s of model.sensors ?? []) {
      const q = quantities[s.kind],
        r = comparison(model, c, s);
      const row = [
        s.tag,
        s.target,
        q.name,
        c.time ?? "",
        results ? r.measured?.value ?? "" : "",
        q.unit,
        r.measured?.quality ?? "有效",
        s.role ?? "校核",
        s.kind === "flow" ? model.standard : "",
      ];
      rows.push(
        results
          ? [
              ...row,
              r.predicted ?? "",
              r.delta === null ? "" : Number(r.delta.toPrecision(12)),
              r.status,
              r.measured?.source ?? "",
            ]
          : row,
      );
    }
  if (rows.length === 1 && !results) {
    const c = model.cases[0];
    rows.push([
      "PT-001",
      model.nodes[0].id,
      quantities.pressure.name,
      c.time ?? "",
      "",
      "MPa(a)",
      "有效",
      "校核",
      "",
    ]);
  }
  return "\uFEFF" + csvFormatRows(rows);
}
export function mergeMeasurements(model, content, source = "导入 CSV") {
  const [header, ...data] = csvParseRows(content.replace(/^\uFEFF/, ""));
  const idx = fields.map((k) => header?.indexOf(k) ?? -1);
  if (idx.includes(-1)) throw Error("表头不完整，请使用测点模板");
  const cases = model.cases.map((c) => ({
      ...c,
      observations: { ...c.observations },
    })),
    times = new Map();
  for (const c of cases) {
    if (!c.time) continue;
    const t = instant(c.time);
    if (times.has(t)) throw Error("多个工况共用同一时间，请分开导入模型");
    times.set(t, c);
  }
  if (!times.size) throw Error("请先在模型 cases[].time 填写带时区的工况时间");
  const map = new Map((model.sensors ?? []).map((s) => [s.tag, s])),
    seen = new Set();
  let count = 0;
  for (const [i, row] of data.entries()) {
    if (row.every((v) => !v.trim())) continue;
    const [tag, target, name, time, raw, unit, quality, role, standard] =
      idx.map((j) => (row[j] ?? "").trim());
    const bad = (msg) => {
      throw Error("第 " + (i + 2) + " 行：" + msg);
    };
    const kind = Object.keys(quantities).find(
      (k) => quantities[k].name === name,
    );
    if (!kind || quantities[kind].unit !== unit) bad("测量量和单位不匹配");
    if (kind === "flow" && standard !== model.standard)
      bad("气量标况与模型不符");
    const t = instant(time),
      c = times.get(t);
    if (!c) bad("找不到同一时刻的模型工况");
    const key = t + "|" + tag;
    if (seen.has(key)) bad("同一时刻的位号重复");
    seen.add(key);
    const s = { tag, target, kind, role: role || "校核" },
      old = map.get(tag);
    if (
      old &&
      (old.target !== target ||
        old.kind !== kind ||
        (old.role ?? "校核") !== s.role)
    )
      bad("位号已有不同绑定或用途");
    map.set(tag, old ?? s);
    if (raw) {
      if (
        !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(raw) ||
        !Number.isFinite(Number(raw))
      )
        bad("实测值不是有限数字");
      c.observations[tag] = {
        value: Number(raw),
        quality: quality || "有效",
        source,
      };
    }
    count++;
  }
  if (!count) throw Error("文件没有测点记录");
  for (const c of cases)
    if (!Object.keys(c.observations).length) delete c.observations;
  const next = { ...model, sensors: [...map.values()], cases };
  checkMeasurements(next);
  return next;
}
export function sampleMeasurements(sensors, observed, temperatures, cases) {
  const times = ["2026-01-15T08:00:00+08:00", "2026-07-15T08:00:00+08:00"];
  return {
    sensors: sensors.map(([tag, target, kind, role = "校核"]) => ({
      tag,
      target,
      kind,
      role,
    })),
    cases: cases.map((c, i) => ({
      ...c,
      time: times[i],
      temperatureC: temperatures[i],
      observations: Object.fromEntries(
        sensors.map(([tag], j) => [
          tag,
          { value: observed[i][j], quality: "有效", source: "合成示例" },
        ]),
      ),
    })),
  };
}
