import { DrawingViewport } from "./DrawingViewport.jsx";
import { equipment } from "./equipment.js";
import { bounds, kinds } from "./model.js";
const React = window.QwenPaw.host.React;
export function SymbolMark({ type }) {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d={equipment[type].path} />
    </g>
  );
}
export function Diagram({
  model,
  c,
  colors,
  selected,
  onPick,
  showSensors,
  sensorTag,
  onSensor,
}) {
  const byId = new Map(model.nodes.map((n) => [n.id, n]));
  const [[x0, x1], [y0, y1]] = bounds([
    ...model.nodes.map((n) => n.diagram),
    ...(showSensors
      ? (model.sensors ?? []).map((s) => s.diagram).filter(Boolean)
      : []),
  ]);
  const pipes = new Map(model.pipes.map((p) => [p.id, p])),
    counts = new Map();
  const badges = (showSensors ? model.sensors ?? [] : []).map((s) => {
    const p = pipes.get(s.target);
    const xy =
      s.diagram ??
      byId.get(s.target)?.diagram ??
      [0, 1].map(
        (k) => (byId.get(p.from).diagram[k] + byId.get(p.to).diagram[k]) / 2,
      );
    const offset = counts.get(s.target) ?? 0;
    counts.set(s.target, offset + 1);
    return {
      s,
      xy,
      y: -36 - offset * 21,
      w: Math.max(46, s.tag.length * 7.2 + 10),
    };
  });
  const right = badges.reduce(
    (max, b) => Math.max(max, b.xy[0] + b.w + 28),
    x1 + 72,
  );
  const top = badges.reduce(
    (min, b) => Math.min(min, b.xy[1] + b.y - 10),
    y0 - 57,
  );
  const activate = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPick(id);
    }
  };
  return (
    <DrawingViewport extent={[x0 - 72, top, right - x0 + 72, y1 + 70 - top]}>
      {model.pipes.map((p) => {
        const [x, y] = byId.get(p.from).diagram,
          [a, b] = byId.get(p.to).diagram;
        const dx = a - x,
          dy = b - y,
          portY = b - Math.sign(dy) * 7,
          mx = (x + a) / 2,
          my = (y + portY) / 2;
        const path = `M ${x} ${y} L ${x + dx * 0.31} ${y} L ${
          x + dx * 0.69
        } ${portY} L ${a} ${portY}`;
        const angle =
          (Math.atan2(dy, dx * 0.38) * 180) / Math.PI +
          (c.flow10kSm3d[p.id] < 0 ? 180 : 0);
        return (
          <g
            key={p.id}
            role="button"
            tabIndex="0"
            aria-label={p.id}
            aria-pressed={selected === p.id}
            onKeyDown={(e) => activate(e, p.id)}
            onClick={() => onPick(p.id)}
            className="sn-hit"
          >
            {selected === p.id && (
              <path
                d={path}
                fill="none"
                className="sn-pipe-halo"
                strokeWidth="15"
              />
            )}
            <path
              d={path}
              fill="none"
              stroke={colors.color(p)}
              strokeWidth={1.5 + p.dn / 220}
              strokeDasharray={c.flow10kSm3d[p.id] === 0 ? "5 3" : undefined}
              strokeLinejoin="round"
            />
            <path d={path} fill="none" stroke="transparent" strokeWidth="18" />
            {c.flow10kSm3d[p.id] !== 0 && (
              <path
                d="M-5 -5L5 0L-5 5"
                transform={`translate(${mx} ${my}) rotate(${angle})`}
                fill={colors.color(p)}
                stroke="var(--sn-sheet)"
                strokeWidth="1"
              />
            )}
            <text x={mx} y={my - 12} textAnchor="middle" className="sn-pipe-id">
              {p.id}
            </text>
          </g>
        );
      })}
      {model.nodes.map((n) => (
        <g
          key={n.id}
          className="sn-hit"
          transform={`translate(${n.diagram.join(" ")})`}
          role="button"
          tabIndex="0"
          aria-label={n.name}
          aria-pressed={n.id === selected}
          onKeyDown={(e) => activate(e, n.id)}
          onClick={() => onPick(n.id)}
        >
          <title>
            {n.name} · {kinds[n.type]} · {c.pressureMPa[n.id]} MPa(a)
          </title>
          <rect
            x="-20"
            y="-19"
            width="40"
            height="38"
            rx="3"
            className="sn-node-back"
            strokeWidth="1"
          />
          <SymbolMark type={n.type} />
          <text textAnchor="middle" y="37" className="sn-node-name">
            {n.name}
          </text>
          <text textAnchor="middle" y="52" className="sn-pipe-id">
            {n.id}
          </text>
        </g>
      ))}
      {badges.map(({ s, xy, y, w }) => {
        return (
          <g
            key={s.tag}
            transform={`translate(${xy.join(" ")})`}
            role="button"
            tabIndex="0"
            aria-label={"测点 " + s.tag}
            aria-pressed={sensorTag === s.tag}
            className="sn-instrument-tag"
            onClick={() => onSensor(s)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSensor(s);
              }
            }}
          >
            <circle r="2" />
            <path d={`M0 0 l10 ${y + 8} h11`} fill="none" strokeWidth=".8" />
            <rect x="21" y={y - 4} width={w} height="18" rx="2" />
            <text x="25" y={y + 9}>
              {s.tag}
            </text>
          </g>
        );
      })}
    </DrawingViewport>
  );
}
