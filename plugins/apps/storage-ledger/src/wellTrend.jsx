import { fmt } from "./common.jsx";
const React = window.QwenPaw.host.React;
export const measures = {
  inj: ["日注气", "万方"],
  prod: ["日采气", "万方"],
  tubing: ["油压", "MPa"],
  casing: ["套压", "MPa"],
};
const colors = ["#047969", "#cb762e", "#3a66af", "#8f5399"];
const millis = 86400000;
const toDay = (d) => Date.parse(d + "T00:00:00Z") / millis;
const toISO = (t) =>
  new Date(Math.round(t) * millis).toISOString().slice(0, 10);
function curve(pts, field, px, py) {
  let last = null,
    length = 0,
    prev = null,
    path = "";
  const dots = [];
  for (const p of pts) {
    const t = toDay(p.day);
    if (p[field] == null || last === null || t !== last + 1) {
      if (length === 1) dots.push(prev);
      length = 0;
    }
    if (p[field] != null) {
      prev = [px(t), py(p[field])];
      path += (length ? "L" : "M") + prev.map((n) => n.toFixed(2)).join(" ");
      length++;
    }
    last = t;
  }
  if (length === 1) dots.push(prev);
  return { path, dots };
}
function makePlot(data, names, metric) {
  const keys = metric === "gas" ? ["inj", "prod"] : ["tubing", "casing"];
  const days = new Set(),
    series = [];
  let min = 0,
    max = 0,
    n = 0;
  for (const [i, name] of names.entries()) {
    const points = data.series[name] || [];
    const byDate = new Map(points.map((p) => [p.day, p]));
    for (const day of byDate.keys()) days.add(day);
    for (const [j, key] of keys.entries()) {
      for (const p of points)
        if (p[key] != null) {
          min = Math.min(min, p[key]);
          max = Math.max(max, p[key]);
          n++;
        }
      series.push({ name, key, color: colors[2 * i + j], points, byDate });
    }
  }
  if (max === min) max = min + 1;
  const t0 = toDay(data.start),
    t1 = toDay(data.end);
  const px = (t) => 56 + (t1 > t0 ? (t - t0) / (t1 - t0) : 0.5) * 668,
    py = (v) => 213 - ((v - min) / (max - min)) * 178;
  const rows = series.map((s) => ({
    ...s,
    geometry: curve(s.points, s.key, px, py),
  }));
  return { min, max, n, t0, t1, px, py, rows, dates: [...days].sort(), keys };
}
export function WellTrend({ data, wells, metric, cursor, select }) {
  const ref = React.useRef(null);
  const [first, second] = wells;
  const { min, max, n, t0, t1, px, py, rows, dates, keys } = React.useMemo(
    () => makePlot(data, second ? [first, second] : [first], metric),
    [data, first, second, metric],
  );
  const [hover, track] = React.useState("");
  if (!dates.length)
    return (
      <div className="sl-empty">
        所选时段没有井日报。可更改截止日或查看全时段。
      </div>
    );
  function nearest(e) {
    const svg = ref.current,
      p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const t =
      t0 +
      ((p.matrixTransform(svg.getScreenCTM().inverse()).x - 56) / 668) *
        (t1 - t0);
    let lo = 0,
      hi = dates.length - 1;
    while (lo < hi) {
      const m = Math.floor((lo + hi) / 2);
      if (toDay(dates[m]) < t) lo = m + 1;
      else hi = m;
    }
    return lo > 0 &&
      Math.abs(toDay(dates[lo - 1]) - t) < Math.abs(toDay(dates[lo]) - t)
      ? dates[lo - 1]
      : dates[lo];
  }
  const active = hover || cursor,
    within = active && active >= data.start && active <= data.end;
  return (
    <div className="se-curve">
      <div className="se-series-legend">
        {rows.map((s) => (
          <span key={s.name + s.key}>
            <i style={{ background: s.color }} />
            {s.name} · {measures[s.key][0]}
          </span>
        ))}
      </div>
      <svg
        viewBox="0 0 758 245"
        ref={ref}
        aria-label={(metric === "gas" ? "注采气量" : "油套压力") + "历史曲线"}
        role="img"
        onPointerMove={(e) => track(nearest(e))}
        onPointerLeave={() => track("")}
        onClick={(e) => select(nearest(e))}
      >
        <text className="se-axis" x="16" y="18">
          {measures[keys[0]][1]}
        </text>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = min + ((max - min) * i) / 4;
          return (
            <g key={i}>
              <line
                className="se-grid"
                x1="56"
                x2="724"
                y1={py(y)}
                y2={py(y)}
              />
              <text className="se-axis" x="48" y={py(y) + 4} textAnchor="end">
                {fmt(Number(y.toPrecision(4)))}
              </text>
            </g>
          );
        })}
        {(t0 === t1 ? [0.5] : [0, 0.25, 0.5, 0.75, 1]).map((f, i) => (
          <g key={i}>
            <line
              className="se-grid"
              x1={56 + 668 * f}
              x2={56 + 668 * f}
              y1="35"
              y2="213"
            />
            <text
              className="se-axis"
              x={56 + 668 * f}
              y="234"
              textAnchor="middle"
            >
              {toISO(t0 + f * (t1 - t0))}
            </text>
          </g>
        ))}
        {rows.map((s) => {
          const c = s.geometry;
          return (
            <g key={s.name + s.key} fill={s.color}>
              <path d={c.path} stroke={s.color} strokeWidth="1.8" fill="none" />
              {c.dots.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={2.2} />
              ))}
            </g>
          );
        })}
        {within && (
          <line
            x1={px(toDay(active))}
            x2={px(toDay(active))}
            y1="30"
            y2="215"
            stroke="#455365"
            strokeDasharray="4 3"
          />
        )}
      </svg>
      {!n && <p>当前曲线通道没有可采用的数值。</p>}
      <div className="se-readout">
        <strong>{within ? active : "读数"}</strong>
        {within ? (
          rows.map((s) => {
            const p = s.byDate.get(active);
            return (
              <span key={s.name + s.key} style={{ borderColor: s.color }}>
                {s.name} {measures[s.key][0]}{" "}
                {p?.row_no == null && p?.candidates.length
                  ? "待复核"
                  : fmt(p?.[s.key])}
              </span>
            );
          })
        ) : (
          <span>移动指针读取数值，单击日期查看来源行。</span>
        )}
      </div>
    </div>
  );
}
