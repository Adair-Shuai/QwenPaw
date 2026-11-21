import { Icon } from "./Icon.jsx";
const React = window.QwenPaw.host.React;
const scales = [1, 1.25, 1.5, 2, 3, 4, 6];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function DrawingViewport({ extent, children }) {
  const [level, setLevel] = React.useState(0),
    [center, setCenter] = React.useState([0.5, 0.5]);
  const drag = React.useRef(null),
    suppressClick = React.useRef(false);
  const scale = scales[level],
    half = 0.5 / scale;
  const [x, y, width, height] = extent,
    cx = clamp(center[0], half, 1 - half),
    cy = clamp(center[1], half, 1 - half);
  const viewBox = [
    x + (cx - half) * width,
    y + (cy - half) * height,
    width / scale,
    height / scale,
  ];
  function zoom(next) {
    const index = clamp(next, 0, scales.length - 1),
      bound = 0.5 / scales[index];
    setCenter([clamp(cx, bound, 1 - bound), clamp(cy, bound, 1 - bound)]);
    setLevel(index);
  }
  function start(e) {
    suppressClick.current = false;
    if (!level || !e.isPrimary || e.button !== 0) return;
    const factor = e.currentTarget.getScreenCTM()?.a;
    if (factor)
      drag.current = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        cx,
        cy,
        factor,
      };
  }
  function move(e) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x,
      dy = e.clientY - d.y;
    if (!suppressClick.current && Math.hypot(dx, dy) < 4) return;
    if (!suppressClick.current) e.currentTarget.setPointerCapture(d.id);
    suppressClick.current = true;
    setCenter([
      clamp(d.cx - dx / (d.factor * width), half, 1 - half),
      clamp(d.cy - dy / (d.factor * height), half, 1 - half),
    ]);
  }
  function end(e) {
    if (drag.current?.id === e.pointerId) {
      if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
      drag.current = null;
    }
  }
  function keydown(e) {
    if (e.target !== e.currentTarget) return;
    const offset = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[e.key];
    if (offset && level)
      setCenter([
        clamp(cx + (offset[0] * half) / 3, half, 1 - half),
        clamp(cy + (offset[1] * half) / 3, half, 1 - half),
      ]);
    else if (e.key === "+" || e.key === "=") zoom(level + 1);
    else if (e.key === "-") zoom(level - 1);
    else if (e.key === "Home") zoom(0);
    else return;
    e.preventDefault();
  }
  return (
    <>
      <svg
        className="sn-diagram"
        role="group"
        aria-label="二维管网工艺图"
        tabIndex="0"
        viewBox={viewBox.join(" ")}
        data-zoomed={level > 0}
        onKeyDown={keydown}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={(e) => {
          if (!e.currentTarget.hasPointerCapture?.(e.pointerId))
            drag.current = null;
        }}
        onClickCapture={(e) => {
          if (suppressClick.current && e.detail !== 0) {
            suppressClick.current = false;
            e.stopPropagation();
          }
        }}
      >
        {children}
      </svg>
      <div className="sn-zoom" role="group" aria-label="图面缩放">
        <button
          disabled={level === 0}
          onClick={() => zoom(level - 1)}
          aria-label="缩小一级"
          title="缩小一级"
        >
          <Icon name="minus" />
        </button>
        <button onClick={() => zoom(0)} aria-label="适合图面" title="适合图面">
          {Math.round(scale * 100)}%
        </button>
        <button
          disabled={level === scales.length - 1}
          onClick={() => zoom(level + 1)}
          aria-label="放大一级"
          title="放大一级，可拖动平移"
        >
          <Icon name="plus" />
        </button>
      </div>
    </>
  );
}
