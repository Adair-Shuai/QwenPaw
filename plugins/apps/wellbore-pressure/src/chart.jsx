import { download } from "./export.mjs";
import { fmt } from "./ui-utils.mjs";
const React = window.QwenPaw.host.React;
const { useState, useRef } = React;
export default function Chart({
  result,
  comparison,
  compare,
  metric,
  interval,
  disabled,
}) {
  const [hover, setHover] = useState(0);
  const chartRef = useRef(null);
  const index = { pressure: 1, temperature: 2, velocity: 4 }[metric],
    label = {
      pressure: "压力 / MPa",
      temperature: "温度 / K",
      velocity: "流速 / m·s⁻¹",
    }[metric];
  const all = [...result.rows, ...(compare ? comparison.rows : [])].map(
    (r) => r[index],
  );
  const lo = Math.min(...all),
    hi = Math.max(...all),
    pad = Math.max((hi - lo) * 0.12, 0.01),
    min = lo - pad,
    max = hi + pad;
  const W = 640,
    H = 620,
    L = 78,
    R = 28,
    T = 44,
    B = 38,
    x = (v) => L + ((v - min) / (max - min)) * (W - L - R),
    y = (d) => T + (d / result.params.depth) * (H - T - B);
  const path = (rows) =>
    rows
      .filter(
        (_, i) =>
          i % Math.max(1, Math.floor(rows.length / 700)) === 0 ||
          i === rows.length - 1,
      )
      .map(
        (r, i) =>
          `${i ? "L" : "M"}${x(r[index]).toFixed(3)},${y(r[0]).toFixed(3)}`,
      )
      .join(" ");
  function point(e) {
    const svg = e.currentTarget;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const py = p.matrixTransform(matrix.inverse()).y;
    const depth = Math.max(
      0,
      Math.min(
        result.params.depth,
        ((py - T) / (H - T - B)) * result.params.depth,
      ),
    );
    let low = 0,
      high = result.rows.length - 1;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (result.rows[mid][0] < depth) low = mid + 1;
      else high = mid;
    }
    setHover(
      low > 0 && depth - result.rows[low - 1][0] < result.rows[low][0] - depth
        ? low - 1
        : low,
    );
  }
  function exportChart() {
    const svg = chartRef.current.cloneNode(true);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    const title = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "title",
    );
    title.textContent = `${result.model} · ${label} · 井深${result.params.depth}m`;
    svg.prepend(title);
    download(
      new XMLSerializer().serializeToString(svg),
      `井筒剖面_${metric}_${result.model}.svg`,
      "image/svg+xml;charset=utf-8",
    );
  }
  const active = hover == null ? null : result.rows[hover];
  return (
    <>
      <svg
        ref={chartRef}
        className="wp-chart"
        data-testid="pressure-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${label}与井深曲线，井深向下增加`}
        onPointerMove={point}
      >
        <rect width={W} height={H} fill="white" />
        {Array.from({ length: 6 }, (_, i) => {
          const d = (result.params.depth * i) / 5,
            v = min + ((max - min) * i) / 5;
          return (
            <g
              key={i}
              fontFamily="Microsoft YaHei, sans-serif"
              fontSize="11"
              fill="#7b8d9f"
            >
              <line x1={L} x2={W - R} y1={y(d)} y2={y(d)} stroke="#e9eff4" />
              <text x={L - 12} y={y(d) + 4} textAnchor="end">
                {fmt(d, 0)}
              </text>
              <line x1={x(v)} x2={x(v)} y1={T} y2={H - B} stroke="#edf2f6" />
              <text x={x(v)} y={T - 13} textAnchor="middle">
                {fmt(v, 2)}
              </text>
            </g>
          );
        })}
        <text
          x={(L + W - R) / 2}
          y="13"
          textAnchor="middle"
          fontSize="11"
          fill="#6d8298"
        >
          {label}
        </text>
        <text
          x="18"
          y="255"
          transform="rotate(-90 18 255)"
          textAnchor="middle"
          fontSize="11"
          fill="#6d8298"
        >
          井深 / m
        </text>
        {result.segments?.slice(0, -1).map((s, i) => (
          <g key={`section-${i}`}>
            <line
              x1={L}
              x2={W - R}
              y1={y(s.end)}
              y2={y(s.end)}
              stroke="#b6c8d7"
              strokeDasharray="5 4"
            />
            <text
              x={W - R - 3}
              y={y(s.end) - 5}
              textAnchor="end"
              fontSize="10"
              fill="#718a9f"
            >
              井段界面 {fmt(s.end, 0)} m
            </text>
          </g>
        ))}
        {compare && (
          <path
            d={path(comparison.rows)}
            fill="none"
            stroke="#278b89"
            strokeWidth="2.5"
            strokeDasharray="7 5"
          />
        )}
        <path
          d={path(result.rows)}
          fill="none"
          stroke="#2365a4"
          strokeWidth="3"
        />
        {result.samples.length < 60 &&
          result.samples.map((r, i) => (
            <circle
              key={i}
              cx={x(r[index])}
              cy={y(r[0])}
              r="3"
              fill="white"
              stroke="#2365a4"
              strokeWidth="1.7"
            />
          ))}
        {active && (
          <g>
            <line
              x1={L}
              x2={W - R}
              y1={y(active[0])}
              y2={y(active[0])}
              stroke="#a8b8c6"
              strokeDasharray="3 3"
            />
            <circle
              cx={x(active[index])}
              cy={y(active[0])}
              r="5"
              fill="#2365a4"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        )}
        <text x={W - R} y={H - 7} textAnchor="end" fontSize="10" fill="#90a0ad">
          井深向下增加 · 单气相采气
        </text>
      </svg>
      <div className="wp-legend">
        <span>
          <i className="wp-key" />
          {result.model}
        </span>
        {compare && (
          <span>
            <i className="wp-key alt" />
            {comparison.model}
          </span>
        )}
        <span>○ {interval} m 采样点</span>
      </div>
      <div className="wp-chart-status">
        {active
          ? `井深 ${fmt(active[0], 1)} m · ${label.split(" / ")[0]} ${fmt(
              active[index],
            )}${compare ? ` · 对比 ${fmt(comparison.rows[hover][index])}` : ""}`
          : "选择井深查看计算值"}
      </div>
      <div className="wp-probe">
        <label>
          查询井深 / m
          <input
            aria-label="查询井深"
            type="range"
            min="0"
            max={result.steps}
            step="1"
            value={hover ?? 0}
            onChange={(e) => setHover(Number(e.target.value))}
          />
        </label>
        <span>{fmt(active?.[0] ?? 0, 1)} m</span>
        <button disabled={disabled} onClick={exportChart}>
          导出曲线 SVG
        </button>
      </div>
    </>
  );
}
