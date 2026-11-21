import { fmt, Icon, Table } from "./common.jsx";
const React = window.QwenPaw.host.React;
const frame = { x: 77, y: 25, w: 672, h: 290 };
const labelWidth = (s) =>
  Array.from(s).reduce((n, c) => n + (c.charCodeAt(0) > 255 ? 12 : 7), 0);
function autoView(wells) {
  const xs = wells.map((w) => w.xy[0]),
    ys = wells.map((w) => w.xy[1]);
  const x1 = Math.min(...xs),
    x2 = Math.max(...xs),
    y1 = Math.min(...ys),
    y2 = Math.max(...ys);
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
    scale: Math.max((x2 - x1) / frame.w, (y2 - y1) / frame.h, 0.01) * 1.15,
  };
}
function ticks(min, max, count) {
  const rough = (max - min) / count,
    base = 10 ** Math.floor(Math.log10(rough));
  const step = ([1, 2, 5, 10].find((v) => v * base >= rough) || 10) * base;
  const result = [];
  for (let i = Math.ceil(min / step); i <= Math.floor(max / step); i++)
    result.push(i * step);
  return result;
}
export function FieldMap({
  objects,
  selected,
  inspect,
  open,
  base,
  importFile,
  readOnly,
}) {
  const [view, move] = React.useState(null),
    [labels, setLabels] = React.useState(true),
    [qc, setQc] = React.useState(true),
    [list, setList] = React.useState("quality"),
    [listPage, setListPage] = React.useState(0);
  const svg = React.useRef(null),
    drag = React.useRef(null);
  const wells = objects.wells,
    located = wells.filter((w) => w.xy);
  const frameId = React.useId().replace(/:/g, "");
  const extent = React.useMemo(
    () => (located.length ? autoView(located) : null),
    [objects],
  );
  React.useEffect(
    () => move(null),
    [objects.src, extent?.x, extent?.y, extent?.scale],
  );
  const v = view || extent,
    chosen =
      selected?.type === "well" && wells.find((w) => w.name === selected.name);
  function zoom(factor) {
    if (!v) return;
    move({
      ...v,
      scale: Math.max(
        extent.scale / 128,
        Math.min(extent.scale * 4, v.scale * factor),
      ),
    });
  }
  function coord(e) {
    const p = svg.current.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const matrix = svg.current.getScreenCTM();
    return matrix ? p.matrixTransform(matrix.inverse()) : p;
  }
  const left = v ? v.x - (frame.w * v.scale) / 2 : 0,
    bottom = v ? v.y - (frame.h * v.scale) / 2 : 0;
  const px = (x) => frame.x + (x - left) / v.scale,
    py = (y) => frame.y + frame.h - (y - bottom) / v.scale;
  const visible = located
    .filter((w) => {
      const x = px(w.xy[0]),
        y = py(w.xy[1]);
      return (
        x >= frame.x &&
        x <= frame.x + frame.w &&
        y >= frame.y &&
        y <= frame.y + frame.h
      );
    })
    .sort(
      (a, b) =>
        Number(b.name === chosen?.name) - Number(a.name === chosen?.name) ||
        Number(b.pending > 0) - Number(a.pending > 0),
    );
  const boxes = [];
  function labelSpot(x, y, title, force) {
    if (!labels && !force) return null;
    const width = labelWidth(title);
    for (const [dx, dy] of [
      [8, -8],
      [8, 15],
      [-width - 8, -8],
      [-width - 8, 15],
    ]) {
      const x1 = x + dx,
        y1 = y + dy - 12,
        x2 = x1 + width,
        y2 = y1 + 14;
      if (
        x1 < frame.x ||
        x2 > frame.x + frame.w ||
        y1 < frame.y ||
        y2 > frame.y + frame.h
      )
        continue;
      if (
        !boxes.some(
          (b) =>
            x1 < b[2] + 4 && x2 > b[0] - 4 && y1 < b[3] + 2 && y2 > b[1] - 2,
        )
      ) {
        boxes.push([x1, y1, x2, y2]);
        return [x1, y2 - 2];
      }
    }
    return force ? [x + 8, y - 7] : null;
  }
  const pending = (base.issues || []).filter((r) => r.selected == null);
  const rows = list === "quality" ? pending : wells;
  const pages = Math.max(1, Math.ceil(rows.length / 6)),
    page = Math.min(listPage, pages - 1);
  const labelsToDraw = new Map(
    visible.map((w) => [
      w.name,
      labelSpot(px(w.xy[0]), py(w.xy[1]), w.name, w.name === chosen?.name),
    ]),
  );
  return (
    <div className="se-mapdoc">
      <header className="se-doc-head">
        <div>
          <small>库区工程图件</small>
          <h2>库区井位图</h2>
        </div>
        <span className="se-meta">
          {located.length} / {wells.length} 口井有井位
        </span>
      </header>
      <div className="se-canvas-tools">
        <span>
          <Icon name="map" /> 井口坐标
        </span>
        <div className="se-tools">
          <label>
            <input
              type="checkbox"
              aria-label="显示井号标签"
              checked={labels}
              onChange={(e) => setLabels(e.target.checked)}
            />
            井号
          </label>
          <label>
            <input
              type="checkbox"
              checked={qc}
              onChange={(e) => setQc(e.target.checked)}
            />
            待复核标记
          </label>
          <button
            aria-label="缩小井位图"
            disabled={!v}
            onClick={() => zoom(1.5)}
          >
            −
          </button>
          <button
            aria-label="放大井位图"
            disabled={!v}
            onClick={() => zoom(1 / 1.5)}
          >
            ＋
          </button>
          <button onClick={() => move(null)} disabled={!v}>
            全图
          </button>
        </div>
      </div>
      {v ? (
        <div className="se-map-plane">
          <svg
            ref={svg}
            viewBox="0 0 780 351"
            role="group"
            aria-label="井口坐标平面图"
            onPointerDown={(e) => {
              if (e.button !== 0 || e.target.closest("[data-well]")) return;
              const p = coord(e);
              drag.current = { p, v };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              const t = drag.current;
              if (!t) return;
              const p = coord(e);
              move({
                ...t.v,
                x: t.v.x - (p.x - t.p.x) * t.v.scale,
                y: t.v.y + (p.y - t.p.y) * t.v.scale,
              });
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            <defs>
              <clipPath id={frameId}>
                <rect
                  x={frame.x}
                  y={frame.y}
                  width={frame.w}
                  height={frame.h}
                />
              </clipPath>
            </defs>
            <rect
              className="se-plot-bg"
              x={frame.x}
              y={frame.y}
              width={frame.w}
              height={frame.h}
            />
            {ticks(left, left + frame.w * v.scale, 6).map((x) => (
              <g key={x}>
                <line
                  className="se-grid"
                  x1={px(x)}
                  x2={px(x)}
                  y1={frame.y}
                  y2={frame.y + frame.h}
                />
                <text
                  className="se-axis"
                  x={px(x)}
                  y={frame.y + frame.h + 19}
                  textAnchor="middle"
                >
                  {Number(x.toFixed(4))}
                </text>
              </g>
            ))}
            {ticks(bottom, bottom + frame.h * v.scale, 5).map((y) => (
              <g key={y}>
                <line
                  className="se-grid"
                  x1={frame.x}
                  x2={frame.x + frame.w}
                  y1={py(y)}
                  y2={py(y)}
                />
                <text
                  className="se-axis"
                  x={frame.x - 8}
                  y={py(y) + 4}
                  textAnchor="end"
                >
                  {Number(y.toFixed(4))}
                </text>
              </g>
            ))}
            <text
              className="se-axis"
              x={frame.x - 8}
              y={frame.y - 9}
              textAnchor="end"
            >
              Y
            </text>
            <text
              className="se-axis"
              x={frame.x + frame.w + 8}
              y={frame.y + frame.h + 19}
            >
              X
            </text>
            <g clipPath={"url(#" + frameId + ")"}>
              {visible
                .slice()
                .reverse()
                .map((w) => {
                  const isSelected = w.name === chosen?.name,
                    x = px(w.xy[0]),
                    y = py(w.xy[1]),
                    spot = labelsToDraw.get(w.name);
                  const action = () => inspect({ type: "well", name: w.name });
                  return (
                    <g
                      data-well={w.name}
                      key={w.name}
                      className={
                        "se-wellpoint" + (isSelected ? " selected" : "")
                      }
                      role="button"
                      tabIndex={0}
                      aria-label={"井位 " + w.name}
                      onClick={action}
                      onDoubleClick={() => open({ type: "well", name: w.name })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          open({ type: "well", name: w.name });
                        if (e.key === " ") {
                          e.preventDefault();
                          action();
                        }
                      }}
                    >
                      <title>
                        {w.name +
                          " · " +
                          (w.days ? "有生产日报" : "基础资料") +
                          (w.pending ? " · " + w.pending + " 组待复核" : "")}
                      </title>
                      {(isSelected || (qc && w.pending > 0)) && (
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 9 : 6.4}
                          fill="none"
                          stroke={isSelected ? "#194c9a" : "#b66a24"}
                          strokeWidth={isSelected ? 2.5 : 1.4}
                        />
                      )}
                      <circle
                        className="se-hit"
                        cx={x}
                        cy={y}
                        r="7"
                        fill="transparent"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={3.25}
                        fill={w.days ? "#087366" : "white"}
                        stroke={w.days ? "#065d52" : "#647a8c"}
                        strokeWidth="1.5"
                      />
                      {spot && (
                        <text
                          className="se-point-label"
                          x={spot[0]}
                          y={spot[1]}
                        >
                          {w.name}
                        </text>
                      )}
                    </g>
                  );
                })}
            </g>
          </svg>
        </div>
      ) : (
        <div className="se-no-map">
          <Icon name="map" />
          <h3>
            {wells.length
              ? "当前井档缺少可定位的井口坐标"
              : "项目中尚无井位资料"}
          </h3>
          <p>导入含井号、井口坐标 X 和 Y 的单井基础工作簿。</p>
          <button disabled={readOnly} onClick={importFile}>
            导入井档
          </button>
        </div>
      )}
      <div className="se-legend">
        <span>
          <i className="producing" />
          有生产日报
        </span>
        <span>
          <i />
          仅井档或完井资料
        </span>
        {qc && (
          <span>
            <i className="flagged" />
            待复核井
          </span>
        )}
        <span className="se-muted">原表 X / Y 坐标</span>
      </div>
      <div className="se-map-index">
        <div className="se-section-head">
          <div className="se-index-tabs">
            {[
              ["quality", "待复核井日", pending.length],
              ["wells", "井位明细", wells.length],
            ].map(([id, title, n]) => (
              <button
                key={id}
                aria-pressed={list === id}
                onClick={() => {
                  setList(id);
                  setListPage(0);
                }}
              >
                {title} <small>{n}</small>
              </button>
            ))}
          </div>
          <div className="se-tools">
            <button
              aria-label="明细上一页"
              disabled={!page}
              onClick={() => setListPage(page - 1)}
            >
              ‹
            </button>
            <span>
              {page + 1} / {pages}
            </span>
            <button
              aria-label="明细下一页"
              disabled={page >= pages - 1}
              onClick={() => setListPage(page + 1)}
            >
              ›
            </button>
          </div>
        </div>
        <Table
          rows={rows.slice(page * 6, page * 6 + 6)}
          empty={
            list === "quality" ? "当前生产版本没有待复核井日" : "项目中尚无井档"
          }
          cols={
            list === "quality"
              ? [
                  [
                    "井号",
                    (r) => (
                      <button
                        className="sl-link"
                        onClick={() =>
                          open({ type: "well", name: r.well, date: r.day })
                        }
                      >
                        {r.well}
                      </button>
                    ),
                  ],
                  ["生产日", "day"],
                  ["候选行数", "candidates"],
                  [
                    "复核",
                    (r) => (
                      <button
                        className="sl-link"
                        onClick={() =>
                          open({ type: "quality", well: r.well, day: r.day })
                        }
                      >
                        核对来源行 ›
                      </button>
                    ),
                  ],
                ]
              : [
                  [
                    "井号",
                    (w) => (
                      <button
                        className="sl-link"
                        onClick={() => inspect({ type: "well", name: w.name })}
                      >
                        {w.name}
                      </button>
                    ),
                  ],
                  ["井口 X", (w) => fmt(w.xy?.[0])],
                  ["井口 Y", (w) => fmt(w.xy?.[1])],
                  [
                    "井档",
                    (w) => (
                      <button
                        className="sl-link"
                        onClick={() => open({ type: "well", name: w.name })}
                      >
                        打开档案 ›
                      </button>
                    ),
                  ],
                ]
          }
        />
      </div>
    </div>
  );
}
