import { fmt } from "./ui-utils.mjs";
import { buildTrajectory, trajectoryAt } from "./survey.mjs";
import { sectionAtDepth } from "./structure.mjs";
import { download } from "./export.mjs";
const React = window.QwenPaw.host.React;
const { useMemo, useState, useRef } = React;
const palette = ["#2d78b7", "#259b98", "#7f8db5", "#bd8b55"];
function pressureAt(result, md) {
  let lo = 0,
    hi = result.rows.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (result.rows[mid][0] < md) lo = mid + 1;
    else hi = mid;
  }
  if (!lo) return result.rows[0][1];
  const a = result.rows[lo - 1],
    b = result.rows[lo],
    t = (md - a[0]) / (b[0] - a[0]);
  return a[1] + t * (b[1] - a[1]);
}
function pathPoints(result) {
  const step = Math.max(1, Math.ceil(result.trajectory.length / 850));
  const fixed = new Set([
    ...result.survey.map((s) => s.md),
    ...result.segments.map((s) => s.end),
  ]);
  return result.trajectory.filter(
    (p, i, a) => fixed.has(p.md) || i % step === 0 || i === a.length - 1,
  );
}
export function TrajectoryMini({ result }) {
  const points = pathPoints(result),
    end = points.at(-1),
    bearing = Math.atan2(end.east, end.north);
  const horizontal = (p) =>
    p.north * Math.cos(bearing) + p.east * Math.sin(bearing);
  const xs = points.map(horizontal),
    zs = points.map((p) => p.tvd),
    minX = Math.min(0, ...xs),
    maxX = Math.max(1, ...xs),
    minZ = Math.min(0, ...zs),
    maxZ = Math.max(1, ...zs);
  const scale = Math.min(112 / (maxX - minX), 390 / (maxZ - minZ));
  const x = (p) =>
      18 + (112 - (maxX - minX) * scale) / 2 + (horizontal(p) - minX) * scale,
    y = (p) => 40 + (p.tvd - minZ) * scale;
  return (
    <aside className="wp-schematic" aria-label="井轨迹剖面预览">
      <h3>井轨迹剖面</h3>
      <div className="wp-sub">最小曲率 · 等比例</div>
      <svg
        viewBox="0 0 150 490"
        role="img"
        aria-label="由测斜数据生成的井轨迹剖面"
      >
        <rect width="150" height="490" fill="#fbfdff" />
        <line
          x1={x(points[0])}
          x2={x(points[0])}
          y1="32"
          y2="448"
          stroke="#dbe5ee"
          strokeDasharray="3 3"
        />
        {points.slice(1).map((p, i) => (
          <line
            key={i}
            x1={x(points[i])}
            y1={y(points[i])}
            x2={x(p)}
            y2={y(p)}
            stroke={
              palette[
                sectionAtDepth(result.segments, (p.md + points[i].md) / 2) % 4
              ]
            }
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
        <circle cx={x(points[0])} cy={y(points[0])} r="4" fill="#2d78b7" />
        <text
          x={x(points[0])}
          y={y(points[0]) - 12}
          fontSize="10"
          textAnchor="middle"
          fill="#71899f"
        >
          井口
        </text>
        <circle cx={x(end)} cy={y(end)} r="4" fill="#d39a56" />
        <text x="75" y="466" textAnchor="middle" fontSize="10" fill="#6f8ba1">
          垂深 {fmt(end.tvd, 1)} m
        </text>
      </svg>
      <div className="wp-schematic-note">
        MD {fmt(end.md, 0)} m<br />
        投影方位 {fmt(((bearing * 180) / Math.PI + 360) % 360, 1)}°<br />
        颜色区分流动井段。
      </div>
    </aside>
  );
}
export default function TrajectoryView({
  result,
  disabled,
  onImport,
  pending,
  onCompute,
}) {
  const [view, setView] = useState("3d"),
    [yaw, setYaw] = useState(35),
    [tilt, setTilt] = useState(30),
    [color, setColor] = useState("structure"),
    [md, setMD] = useState(0);
  const ref = useRef(null);
  const geometry = useMemo(
    () => (result.survey ? buildTrajectory(result.survey) : null),
    [result.survey],
  );
  if (!geometry)
    return (
      <div className="wp-table-empty">
        <strong>
          {pending
            ? "井斜数据已导入，点击计算生成轨迹"
            : "导入井斜数据，重建井轨迹"}
        </strong>
        <p>测深MD(m) · 井斜角Inc(°) · 方位角Azi(°)</p>
        <p>支持CSV、TSV、JSON和Excel .xlsx；井斜角从垂直向下计。</p>
        <button onClick={pending ? onCompute : onImport}>
          {pending ? "计算井筒压力" : "导入井斜数据"}
        </button>
      </div>
    );
  const points = pathPoints(result),
    end = points.at(-1),
    active = trajectoryAt(geometry, Math.min(md, geometry.depth));
  const W = 840,
    H = 490,
    P = 55,
    angle = (yaw * Math.PI) / 180,
    elevation = (tilt * Math.PI) / 180;
  const project = (p) =>
    view === "plan"
      ? [p.east, -p.north]
      : view === "section"
      ? [p.north * Math.cos(angle) + p.east * Math.sin(angle), p.tvd]
      : [
          p.east * Math.cos(angle) - p.north * Math.sin(angle),
          p.tvd * Math.cos(elevation) -
            (p.east * Math.sin(angle) + p.north * Math.cos(angle)) *
              Math.sin(elevation),
        ];
  const extent = Math.max(100, geometry.depth * 0.18),
    origin = { north: 0, east: 0, tvd: 0 };
  const axes =
    view === "3d"
      ? [
          [{ north: extent, east: 0, tvd: 0 }, "N"],
          [{ north: 0, east: extent, tvd: 0 }, "E"],
          [{ north: 0, east: 0, tvd: extent }, "TVD"],
        ]
      : view === "plan"
      ? [
          [{ north: extent, east: 0, tvd: 0 }, "N"],
          [{ north: 0, east: extent, tvd: 0 }, "E"],
        ]
      : [
          [
            {
              north: extent * Math.cos(angle),
              east: extent * Math.sin(angle),
              tvd: 0,
            },
            "水平",
          ],
          [{ north: 0, east: 0, tvd: extent }, "TVD"],
        ];
  const raw = [
      ...points.map(project),
      project(origin),
      ...axes.map(([p]) => project(p)),
    ],
    xs = raw.map((p) => p[0]),
    ys = raw.map((p) => p[1]);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys),
    scale = Math.min(
      (W - 2 * P) / Math.max(maxX - minX, 1),
      (H - 2 * P) / Math.max(maxY - minY, 1),
    );
  const screen = (p) => {
    const [x, y] = project(p);
    return [
      W / 2 + (x - (minX + maxX) / 2) * scale,
      H / 2 + (y - (minY + maxY) / 2) * scale,
    ];
  };
  const o = screen(origin),
    selected = screen(active),
    pressures = result.rows.map((r) => r[1]),
    pmin = Math.min(...pressures),
    pmax = Math.max(...pressures);
  function stroke(p, from = p) {
    if (color === "structure")
      return palette[sectionAtDepth(result.segments, (p.md + from.md) / 2) % 4];
    const t = (pressureAt(result, p.md) - pmin) / Math.max(pmax - pmin, 1e-12);
    return `rgb(${Math.round(39 + 178 * t)},${Math.round(
      112 + 22 * t,
    )},${Math.round(179 - 95 * t)})`;
  }
  function exportSVG() {
    const svg = ref.current.cloneNode(true);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    download(
      new XMLSerializer().serializeToString(svg),
      `井轨迹_${view}.svg`,
      "image/svg+xml;charset=utf-8",
    );
  }
  function hover(e) {
    if (e.pointerType === "touch") return;
    const matrix = e.currentTarget.getScreenCTM();
    if (!matrix) return;
    const cursor = e.currentTarget.createSVGPoint();
    cursor.x = e.clientX;
    cursor.y = e.clientY;
    const s = cursor.matrixTransform(matrix.inverse());
    let nearest = points[0],
      distance = Infinity;
    for (const p of points) {
      const q = screen(p),
        d = (q[0] - s.x) ** 2 + (q[1] - s.y) ** 2;
      if (d < distance) {
        distance = d;
        nearest = p;
      }
    }
    setMD(nearest.md);
  }
  return (
    <div className="wp-trajectory">
      <div className="wp-trajectory-tools">
        <div className="wp-modes" aria-label="轨迹投影方式">
          {[
            ["3d", "三维轨迹"],
            ["section", "垂直剖面"],
            ["plan", "平面轨迹"],
          ].map(([v, l]) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="wp-toolbar">
          <select
            className="wp-head-select"
            aria-label="轨迹着色"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option value="structure">按井段着色</option>
            <option value="pressure">按压力着色</option>
          </select>
          <button disabled={disabled} onClick={exportSVG}>
            导出轨迹SVG
          </button>
        </div>
      </div>
      <div className="wp-trajectory-caption">
        最小曲率法 · 井口为局部坐标原点 · {result.survey.length} 个测点 ·
        末点垂深 {fmt(end.tvd, 1)} m · 水平位移{" "}
        {fmt(Math.hypot(end.north, end.east), 1)} m
      </div>
      <svg
        ref={ref}
        className="wp-trajectory-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={
          view === "3d"
            ? "测斜数据三维井轨迹"
            : view === "plan"
            ? "井轨迹平面图"
            : "井轨迹垂直剖面图"
        }
        onPointerMove={hover}
      >
        <rect width={W} height={H} fill="white" />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <line
              x1={P}
              x2={W - P}
              y1={P + (i * (H - 2 * P)) / 6}
              y2={P + (i * (H - 2 * P)) / 6}
              stroke="#f0f4f8"
            />
            <line
              x1={P + (i * (W - 2 * P)) / 6}
              x2={P + (i * (W - 2 * P)) / 6}
              y1={P}
              y2={H - P}
              stroke="#f4f7fa"
            />
          </g>
        ))}
        {axes.map(([p, label]) => {
          const q = screen(p);
          return (
            <g key={label}>
              <line
                x1={o[0]}
                y1={o[1]}
                x2={q[0]}
                y2={q[1]}
                stroke="#b2c4d4"
                strokeWidth="1.4"
              />
              <text x={q[0] + 7} y={q[1] + 3} fontSize="11" fill="#8298ab">
                {label}
              </text>
            </g>
          );
        })}
        {points.slice(1).map((p, i) => {
          const a = screen(points[i]),
            b = screen(p);
          return (
            <line
              key={i}
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              stroke={stroke(p, points[i])}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          );
        })}
        <circle
          cx={o[0]}
          cy={o[1]}
          r="5"
          fill="#214f79"
          stroke="white"
          strokeWidth="2"
        />
        <text x={o[0] + 9} y={o[1] - 9} fontSize="11" fill="#56728a">
          井口
        </text>
        <circle
          cx={screen(end)[0]}
          cy={screen(end)[1]}
          r="5"
          fill="#cf9652"
          stroke="white"
          strokeWidth="2"
        />
        <text
          x={screen(end)[0] + 9}
          y={screen(end)[1] + 14}
          fontSize="11"
          fill="#7c8fa0"
        >
          井底 MD {fmt(end.md, 0)} m
        </text>
        <circle
          cx={selected[0]}
          cy={selected[1]}
          r="7"
          fill="white"
          stroke="#1c78b4"
          strokeWidth="2.5"
        />
        <text x={P} y="24" fontSize="11" fill="#69859b">
          {view === "3d"
            ? "三维投影（等比例）"
            : view === "plan"
            ? "E向右，N向上 · 单位m"
            : `剖面方位 ${yaw}° · 水平位移与垂深（m）`}
        </text>
        <line
          x1={W - 180}
          x2={W - 60}
          y1={H - 20}
          y2={H - 20}
          stroke="#8299ad"
        />
        <text
          x={W - 120}
          y={H - 28}
          textAnchor="middle"
          fontSize="10"
          fill="#8299ad"
        >
          {fmt(120 / scale, 0)} m
        </text>
      </svg>
      <div className="wp-trajectory-controls">
        {view !== "plan" && (
          <label>
            {view === "section" ? "剖面方位角" : "水平旋转"} {yaw}°
            <input
              aria-label="轨迹水平旋转"
              type="range"
              min="0"
              max="360"
              value={yaw}
              onChange={(e) => setYaw(Number(e.target.value))}
            />
          </label>
        )}
        {view === "3d" && (
          <label>
            俯视角 {tilt}°
            <input
              aria-label="轨迹俯视角"
              type="range"
              min="10"
              max="80"
              value={tilt}
              onChange={(e) => setTilt(Number(e.target.value))}
            />
          </label>
        )}
        <label>
          查询测深 {fmt(md, 1)} m
          <input
            aria-label="轨迹查询测深"
            type="range"
            min="0"
            max={geometry.depth}
            step={geometry.depth / 1000}
            value={md}
            onChange={(e) => setMD(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="wp-coordinate-card">
        <span>
          MD <b>{fmt(active.md, 1)}</b> m
        </span>
        <span>
          TVD <b>{fmt(active.tvd, 1)}</b> m
        </span>
        <span>
          N <b>{fmt(active.north, 1)}</b> m
        </span>
        <span>
          E <b>{fmt(active.east, 1)}</b> m
        </span>
        <span>
          Inc <b>{fmt(active.inc, 1)}</b>°
        </span>
        <span>
          Azi <b>{fmt(active.azi, 1)}</b>°
        </span>
        <span>
          压力 <b>{fmt(pressureAt(result, active.md))}</b> MPa
        </span>
      </div>
      <div className="wp-trajectory-legend">
        {color === "structure" ? (
          result.segments.map((s, i) => (
            <span key={i}>
              <i style={{ background: palette[i % 4] }} />
              {s.name}
            </span>
          ))
        ) : (
          <span>
            <i className="wp-pressure-gradient" />
            {fmt(pmin)} ～ {fmt(pmax)} MPa
          </span>
        )}
      </div>
    </div>
  );
}
