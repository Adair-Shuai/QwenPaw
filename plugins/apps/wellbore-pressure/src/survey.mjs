import { csvRows } from "./structure.mjs";
const rad = Math.PI / 180;
const clamp = (v) => Math.max(-1, Math.min(1, v));
const clean = (n) => (Math.abs(n) < 1e-10 ? 0 : n);
export const SURVEY_HEADERS = ["MD_m", "Inc_deg", "Azi_deg"];
const keys = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[\s_()（）°\[\]【】]/g, "");
const ALIASES = [
  [
    "md",
    "mdm",
    "measureddepth",
    "measureddepthm",
    "测深",
    "测深m",
    "井深",
    "井深m",
  ],
  [
    "inc",
    "incdeg",
    "inclination",
    "inclinationdeg",
    "井斜",
    "井斜角",
    "井斜角deg",
    "井斜角度",
  ],
  [
    "azi",
    "azideg",
    "azimuth",
    "azimuthdeg",
    "方位",
    "方位角",
    "方位角deg",
    "方位角度",
  ],
];
function numeric(v) {
  if (v && typeof v === "object" && v.formula)
    throw new Error("测深、井斜角或方位角列含公式，请先粘贴为数值后导入。");
  if (typeof v === "number") return v;
  const text = String(v ?? "").trim();
  return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text)
    ? Number(text)
    : NaN;
}
export function surveyFromRows(rows) {
  const nonempty = rows.filter((row) =>
    row.some((v) => String(v ?? "").trim()),
  );
  if (nonempty.length < 3 || nonempty.length > 2002)
    throw new Error("井斜表须含表头及2～2001个测点。");
  const header = nonempty[0].map(keys);
  const indices = ALIASES.map((list) => {
    const matches = header
      .map((h, i) => (list.includes(h) ? i : -1))
      .filter((i) => i >= 0);
    if (matches.length !== 1)
      throw new Error(
        "须有唯一的测深MD(m)、井斜角Inc(°)、方位角Azi(°)列，请使用井斜模板。",
      );
    return matches[0];
  });
  return normalizeSurvey(
    nonempty.slice(1).map((row) => ({
      md: numeric(row[indices[0]]),
      inc: numeric(row[indices[1]]),
      azi: numeric(row[indices[2]]),
    })),
  );
}
export function parseSurvey(text) {
  text = text.replace(/^\uFEFF/, "").trim();
  if (text.startsWith("{") || text.startsWith("[")) {
    const data = JSON.parse(text),
      list = Array.isArray(data) ? data : data.stations;
    if (!Array.isArray(list) || !list.length)
      throw new Error("JSON须包含stations测点数组。");
    const headers = Object.keys(list[0]);
    return surveyFromRows([
      headers,
      ...list.map((row) => headers.map((h) => row[h])),
    ]);
  }
  return surveyFromRows(
    csvRows(text, text.split("\n")[0].includes("\t") ? "\t" : ","),
  );
}
export function normalizeSurvey(stations) {
  if (!Array.isArray(stations) || stations.length < 2 || stations.length > 2001)
    throw new Error("井斜数据须包含2～2001个测点。");
  const result = stations.map((s, i) => {
    if (
      !s ||
      ["md", "inc", "azi"].some(
        (k) => typeof s[k] !== "number" || !Number.isFinite(s[k]),
      )
    )
      throw new Error(`第${i + 1}测点存在空值或无效数值。`);
    if (s.md < 0 || s.md > 10000 || (i && s.md - stations[i - 1].md < 0.001))
      throw new Error(
        `第${i + 1}测点测深须递增且间距不少于0.001 m，最大10000 m。`,
      );
    if (s.inc < 0 || s.inc > 180 || s.azi < 0 || s.azi > 360)
      throw new Error(`第${i + 1}测点井斜角须为0～180°，方位角须为0～360°。`);
    return {
      md: i === 0 && Math.abs(s.md) < 1e-8 ? 0 : s.md,
      inc: s.inc,
      azi: s.azi === 360 ? 0 : s.azi,
    };
  });
  if (result[0].md !== 0)
    throw new Error(
      "首测点须为井口MD=0 m；请补充井口测点，不自动推测缺失轨迹。",
    );
  if (result.at(-1).md < 1) throw new Error("末测点测深须不少于1 m。");
  return result;
}
function vector(s) {
  return [
    Math.sin(s.inc * rad) * Math.cos(s.azi * rad),
    Math.sin(s.inc * rad) * Math.sin(s.azi * rad),
    Math.cos(s.inc * rad),
  ];
}
function ratio(b) {
  return b < 1e-5 ? 1 + (b * b) / 12 + b ** 4 / 120 : (2 * Math.tan(b / 2)) / b;
}
function tangent(interval, fraction) {
  const { a, b, beta } = interval;
  if (beta < 1e-8) return a;
  const s = Math.sin(beta);
  return a.map(
    (v, i) =>
      (Math.sin((1 - fraction) * beta) * v + Math.sin(fraction * beta) * b[i]) /
      s,
  );
}
function offset(interval, fraction) {
  const t = tangent(interval, fraction),
    weight =
      ((interval.length * fraction) / 2) * ratio(interval.beta * fraction);
  return interval.a.map((v, i) => weight * (v + t[i]));
}
export function buildTrajectory(input) {
  const survey = normalizeSurvey(input),
    stations = [],
    intervals = [];
  let position = [0, 0, 0];
  stations.push({ ...survey[0], north: 0, east: 0, tvd: 0, dls: 0 });
  for (let i = 1; i < survey.length; i++) {
    const first = survey[i - 1],
      last = survey[i],
      a = vector(first),
      b = vector(last);
    const beta = Math.acos(clamp(a.reduce((sum, v, j) => sum + v * b[j], 0)));
    if (beta > Math.PI - 1e-5)
      throw new Error(
        `第${i}～${i + 1}测点方向近乎相反，请补充中间测点以确定弯曲方向。`,
      );
    const interval = {
      start: first.md,
      end: last.md,
      length: last.md - first.md,
      a,
      b,
      beta,
      position: [...position],
      azi: first.azi,
    };
    intervals.push(interval);
    const delta = offset(interval, 1);
    position = position.map((v, j) => clean(v + delta[j]));
    stations.push({
      ...last,
      north: position[0],
      east: position[1],
      tvd: position[2],
      dls: (beta / rad / interval.length) * 30,
    });
  }
  return { survey, stations, intervals, depth: survey.at(-1).md };
}
export function trajectoryAt(trajectory, md) {
  if (!Number.isFinite(md) || md < -1e-8 || md > trajectory.depth + 1e-8)
    throw new Error("查询测深超出井斜数据覆盖范围。");
  let lo = 0,
    hi = trajectory.intervals.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (trajectory.intervals[mid].end < md) lo = mid + 1;
    else hi = mid;
  }
  const interval = trajectory.intervals[lo],
    f = Math.max(0, Math.min(1, (md - interval.start) / interval.length));
  const t = tangent(interval, f),
    d = offset(interval, f),
    p = interval.position.map((v, j) => clean(v + d[j]));
  return {
    md,
    north: p[0],
    east: p[1],
    tvd: p[2],
    inc: Math.acos(clamp(t[2])) / rad,
    azi:
      Math.hypot(t[0], t[1]) < 1e-10
        ? interval.azi
        : (Math.atan2(t[1], t[0]) / rad + 360) % 360,
    vertical: t[2],
  };
}
export function trajectoryPlot(trajectory, extraDepths = []) {
  const depths = new Set(trajectory.survey.map((s) => s.md));
  for (const depth of extraDepths) depths.add(depth);
  for (let i = 0; i <= 600; i++) depths.add((trajectory.depth * i) / 600);
  return [...depths]
    .sort((a, b) => a - b)
    .map((md) => trajectoryAt(trajectory, md));
}
export function surveyCSV(stations) {
  return (
    "\uFEFF" +
    [SURVEY_HEADERS, ...stations.map((s) => [s.md, s.inc, s.azi])]
      .map((r) => r.join(","))
      .join("\r\n")
  );
}
export const EXAMPLE_SURVEY = [
  { md: 0, inc: 0, azi: 0 },
  { md: 200, inc: 0, azi: 0 },
  { md: 400, inc: 20, azi: 30 },
  { md: 600, inc: 40, azi: 45 },
  { md: 800, inc: 60, azi: 65 },
  { md: 1000, inc: 75, azi: 85 },
];
