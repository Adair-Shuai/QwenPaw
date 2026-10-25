import { csvForChart, numeric } from "./charts.js";
import { Icon } from "./icons.jsx";
const React = window.QwenPaw.host.React;
const { useState, useEffect, useRef } = React;
const palette = ["#3478ad", "#bf884f", "#428e7b", "#8875ac", "#ae6576"];
const fmt = (n) =>
  numeric(n) === null
    ? "—"
    : Math.abs(n) > 0 && Math.abs(n) < 0.001
    ? Number(n).toExponential(2)
    : Number(n).toLocaleString("zh-CN", { maximumFractionDigits: 4 });
const copy = (v) => JSON.parse(JSON.stringify(v));
function downloadText(text, name, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name.replace(/[<>:"/\\|?*]/g, "_");
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Figure({ chart, context, exportable = true }) {
  const exportName = [context?.scope, chart.title].filter(Boolean).join(" · ");
  const [hidden, setHidden] = useState([]),
    [mode, setMode] = useState("chart");
  const svg = useRef();
  const container = useRef();
  const [size, setSize] = useState({ width: 740, height: 315 });
  useEffect(() => {
    const element = container.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const body = element.closest(".sc-window-body");
    const read = () => {
      if (!element.clientWidth) return;
      const next = {
        width: Math.max(280, element.clientWidth),
        height: body
          ? Math.max(180, Math.min(520, body.clientHeight - 100))
          : 315,
      };
      setSize((old) =>
        old.width === next.width && old.height === next.height ? old : next,
      );
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(element);
    if (body) observer.observe(body);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setHidden([]);
    setMode("chart");
  }, [chart.id]);
  const sets = (chart.series || [])
    .map((s, i) => ({ ...s, color: palette[i % palette.length] }))
    .filter((s) => !hidden.includes(s.name));
  const valid = sets
    .flatMap((s) => s.points)
    .filter((p) => numeric(p.x) !== null && numeric(p.y) !== null);
  const isTable = chart.type === "table" || mode === "table";
  const columns =
    chart.type === "table"
      ? chart.columns
      : ["系列", chart.xLabel || "类别", chart.yLabel];
  const tableRows =
    chart.type === "table"
      ? chart.rows
      : (chart.series || []).flatMap((s) =>
          s.points.map((p) => [
            s.name,
            chart.labels?.[p.x] ?? fmt(p.x),
            fmt(p.y),
          ]),
        );
  const [page, setPage] = useState(0),
    pageSize = 60;
  useEffect(() => setPage(0), [chart.id, chart.rows, chart.series]);
  const pageCount = Math.max(1, Math.ceil(tableRows.length / pageSize));
  let xmin = 0,
    xmax = 1,
    ymin = 0,
    ymax = 1;
  if (valid.length) {
    xmin = Math.min(...valid.map((p) => p.x));
    xmax = Math.max(...valid.map((p) => p.x));
    ymin = Math.min(...valid.map((p) => p.y));
    ymax = Math.max(...valid.map((p) => p.y));
    if (chart.type === "bar") {
      ymin = Math.min(0, ymin);
      ymax = Math.max(0, ymax);
    }
    if (xmin === xmax) {
      xmin -= 0.5;
      xmax += 0.5;
    }
    if (ymin === ymax) {
      const d = Math.abs(ymin) * 0.1 || 1;
      ymin -= d;
      ymax += d;
    }
    const pad = (ymax - ymin) * 0.08;
    ymax += pad;
    if (chart.type !== "bar") ymin -= pad;
  }
  const W = size.width,
    H = size.height,
    L = 82,
    R = 22,
    T = 28,
    B = 62;
  const plotW = W - L - R,
    plotH = H - T - B;
  const x = (v) => L + ((v - xmin) / (xmax - xmin)) * plotW;
  const y = (v) => H - B - ((v - ymin) / (ymax - ymin)) * plotH;
  const categories = chart.labels || [];
  const band = plotW / Math.max(1, categories.length);
  const tickEvery = Math.max(
    1,
    Math.ceil(categories.length / Math.max(2, Math.floor(plotW / 75))),
  );
  const saveSvg = () => {
    const node = svg.current?.cloneNode(true);
    if (!node) return;
    const ns = "http://www.w3.org/2000/svg";
    const exported = document.createElementNS(ns, "svg");
    const legendColumns = Math.max(1, Math.floor((W - 52) / 200));
    const header = 84 + Math.ceil(sets.length / legendColumns) * 22;
    exported.setAttribute("xmlns", ns);
    exported.setAttribute("viewBox", `0 0 ${W} ${H + header}`);
    exported.setAttribute("width", W);
    exported.setAttribute("height", H + header);
    exported.style.fontFamily = "Microsoft YaHei, sans-serif";
    const add = (tag, attributes, value) => {
      const el = document.createElementNS(ns, tag);
      Object.entries(attributes).forEach(([key, v]) => el.setAttribute(key, v));
      if (value !== undefined) el.textContent = value;
      exported.appendChild(el);
    };
    add("rect", { width: W, height: H + header, fill: "white" });
    add("text", { x: 26, y: 30, fill: "#293444", "font-size": 18 }, exportName);
    add(
      "text",
      { x: 26, y: 51, fill: "#536278", "font-size": 10 },
      [context?.basis, context?.createdAt, context?.inputHash?.slice(0, 12)]
        .filter(Boolean)
        .join(" · "),
    );
    sets.forEach((s, i) => {
      const x = 26 + (i % legendColumns) * ((W - 52) / legendColumns),
        y = 77 + Math.floor(i / legendColumns) * 22;
      add("rect", { x, y: y - 8, width: 12, height: 8, fill: s.color });
      add("text", { x: x + 19, y, fill: "#536278", "font-size": 12 }, s.name);
    });
    node.setAttribute("y", header);
    node.setAttribute("width", W);
    node.setAttribute("height", H);
    exported.appendChild(node);
    downloadText(
      new XMLSerializer().serializeToString(exported),
      exportName + ".svg",
      "image/svg+xml;charset=utf-8",
    );
  };
  return (
    <div ref={container} className="sc-figure" aria-label={chart.title}>
      <div className="sc-figure-tools">
        {chart.type !== "table" && (
          <div className="sc-chart-legend">
            {(chart.series || []).map((s, i) => (
              <button
                key={s.name}
                aria-pressed={!hidden.includes(s.name)}
                onClick={() =>
                  setHidden((old) =>
                    old.includes(s.name)
                      ? old.filter((n) => n !== s.name)
                      : [...old, s.name],
                  )
                }
              >
                <i style={{ background: palette[i % palette.length] }} />
                {s.name}
              </button>
            ))}
          </div>
        )}
        <div className="sc-actions">
          {chart.type !== "table" && (
            <button
              onClick={() =>
                setMode((m) => (m === "chart" ? "table" : "chart"))
              }
            >
              <Icon name={mode === "chart" ? "table" : "chart"} size={14} />
              {mode === "chart" ? "数据表" : "图形"}
            </button>
          )}
          {exportable && (
            <>
              <button
                className="sc-icon-button"
                aria-label="导出数据"
                title="导出数据 · CSV"
                onClick={() =>
                  downloadText(
                    csvForChart(chart),
                    exportName + ".csv",
                    "text/csv;charset=utf-8",
                  )
                }
              >
                <Icon name="download" />
              </button>
              {chart.type !== "table" && (
                <button
                  className="sc-icon-button"
                  aria-label="保存图形"
                  title="保存图形 · SVG"
                  disabled={isTable || !valid.length}
                  onClick={saveSvg}
                >
                  <Icon name="image" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {isTable ? (
        <div className="sc-chart-table">
          <table className="sc-table">
            <thead>
              <tr>
                {columns.map((c, i) => (
                  <th key={i}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows
                .slice(page * pageSize, (page + 1) * pageSize)
                .map((row, i) => (
                  <tr key={i}>
                    {row.map((v, j) => (
                      <td key={j}>{v ?? "—"}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
          {pageCount > 1 && (
            <div className="sc-actions">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                上一页
              </button>
              <span>
                {page + 1} / {pageCount} · 共 {tableRows.length} 行
              </span>
              <button
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      ) : !valid.length ? (
        <div className="sc-chart-empty">未选择可显示的数据系列。</div>
      ) : (
        <svg
          ref={svg}
          className="sc-chart-svg"
          viewBox={`0 0 ${W} ${H}`}
          height={H}
          role="img"
          aria-label={chart.title}
          style={{
            background: "white",
            fontFamily: "Microsoft YaHei, sans-serif",
            fontSize: 11,
            color: "#293444",
          }}
        >
          <title>{chart.title}</title>
          <desc>
            {chart.note} 横轴：{chart.xLabel}；纵轴：{chart.yLabel}
          </desc>
          <rect width={W} height={H} fill="white" />
          <text x={L} y={15} fill="#536278">
            {chart.yLabel}
          </text>
          {Array.from({ length: 5 }, (_, i) => {
            const v = ymin + ((ymax - ymin) * i) / 4;
            return (
              <g key={i}>
                <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} stroke="#e5eaf0" />
                <text x={L - 9} y={y(v) + 4} textAnchor="end" fill="#536278">
                  {fmt(v)}
                </text>
              </g>
            );
          })}
          {chart.type === "bar"
            ? categories.map(
                (label, i) =>
                  i % tickEvery === 0 && (
                    <text
                      key={i}
                      x={L + band * (i + 0.5)}
                      y={H - B + 20}
                      textAnchor="middle"
                      fill="#536278"
                    >
                      <title>{label}</title>
                      {String(label).length > 10
                        ? String(label).slice(0, 9) + "…"
                        : label}
                    </text>
                  ),
              )
            : Array.from(
                { length: categories.length ? categories.length : 5 },
                (_, i) => {
                  if (categories.length && i % tickEvery) return null;
                  const v = categories.length
                    ? i
                    : xmin + ((xmax - xmin) * i) / 4;
                  return (
                    <text
                      key={i}
                      x={x(v)}
                      y={H - B + 20}
                      textAnchor="middle"
                      fill="#536278"
                    >
                      {categories[i] || fmt(v)}
                    </text>
                  );
                },
              )}
          <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="#94a3b8" />
          <line x1={L} y1={T} x2={L} y2={H - B} stroke="#94a3b8" />
          {ymin < 0 && ymax > 0 && (
            <line
              x1={L}
              y1={y(0)}
              x2={W - R}
              y2={y(0)}
              stroke="#94a3b8"
              strokeDasharray="4 3"
            />
          )}
          {sets.map((s, si) => (
            <g key={s.name}>
              {chart.type !== "bar" && !s.scatter && (
                <path
                  d={
                    s.points.reduce(
                      (a, p) => {
                        if (numeric(p.x) === null || numeric(p.y) === null)
                          return { path: a.path, pen: false };
                        return {
                          path:
                            a.path + `${a.pen ? "L" : "M"}${x(p.x)},${y(p.y)} `,
                          pen: true,
                        };
                      },
                      { path: "", pen: false },
                    ).path
                  }
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                />
              )}
              {s.points.map((p, i) =>
                numeric(p.x) === null ||
                numeric(p.y) === null ? null : chart.type === "bar" ? (
                  <rect
                    key={i}
                    x={
                      L +
                      band * p.x +
                      band * 0.15 +
                      (si * band * 0.7) / sets.length
                    }
                    y={Math.min(y(0), y(p.y))}
                    width={Math.max(0.5, (band * 0.7) / sets.length - 2)}
                    height={Math.max(0.7, Math.abs(y(p.y) - y(0)))}
                    fill={s.color}
                  >
                    <title>
                      {s.name} · {categories[p.x]}：{fmt(p.y)} {chart.yLabel}
                    </title>
                  </rect>
                ) : (
                  <circle
                    key={i}
                    cx={x(p.x)}
                    cy={y(p.y)}
                    r={s.scatter ? 4 : s.points.length > 150 ? 1.5 : 3}
                    fill={s.color}
                  >
                    <title>
                      {s.name} · {p.label || fmt(p.x)}：{fmt(p.y)}{" "}
                      {chart.yLabel}
                    </title>
                  </circle>
                ),
              )}
            </g>
          ))}
          <text x={L + plotW / 2} y={H - 10} textAnchor="middle" fill="#536278">
            {chart.xLabel}
          </text>
        </svg>
      )}
      {chart.note && <p className="sc-chart-note">{chart.note}</p>}
    </div>
  );
}

export function NodeFigures({ model, open }) {
  const [selected, setSelected] = useState(0);
  useEffect(() => setSelected(0), [model.node, model.scope]);
  const chart = model.charts[Math.min(selected, model.charts.length - 1)];
  return (
    <section className="sc-node-figures" aria-label="节点图表">
      <div className="sc-section-head">
        <div>
          <h3>{chart?.title || "节点图表"}</h3>
          <small>
            {model.basis}
            {model.stale ? " · 输入已改变，当前显示旧成果" : ""}
          </small>
        </div>
        {chart && (
          <button className="sc-open-figure" onClick={() => open(model, chart)}>
            <Icon name="open" />
            在结果视窗打开
          </button>
        )}
      </div>
      {chart ? (
        <>
          <div className="sc-figure-tabs" role="tablist" aria-label="图表选择">
            {model.charts.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={chart.id === c.id}
                onClick={() => setSelected(i)}
              >
                {c.title}
              </button>
            ))}
          </div>
          <Figure key={chart.id} chart={chart} context={model} />
        </>
      ) : (
        <div className="sc-chart-empty">{model.missing}</div>
      )}
    </section>
  );
}

function dependency(record, model) {
  if (!record) return "";
  if (model.index === null) return JSON.stringify(record.case);
  const c = record.case;
  return JSON.stringify({
    unit: c.units[model.index],
    cycle: c.cycle_id,
    start: c.start_state,
    end: c.end_state,
    pressure: c.pressure_basis,
    standard: c.standard,
    storage: c.storage_type,
  });
}
const clamp = (v, low, high) => Math.max(low, Math.min(Math.max(low, high), v));

export function ResultsWorkspace({
  record,
  openRequest,
  visible,
  hide,
  expanded,
  setExpanded,
}) {
  const [windows, setWindows] = useState([]),
    [height, setHeight] = useState(450),
    [worldHeight, setWorldHeight] = useState(350);
  const canvas = useRef(),
    [bounds, setBounds] = useState({ width: 900, height: 350 });
  const drag = useRef(),
    serial = useRef(0),
    processed = useRef();
  useEffect(() => {
    if (!canvas.current || !visible) return;
    const read = () => {
      const rect = canvas.current.getBoundingClientRect();
      if (rect.width > 0) setBounds({ width: rect.width, height: rect.height });
    };
    read();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read);
    observer?.observe(canvas.current);
    return () => observer?.disconnect();
  }, [visible, expanded, worldHeight, height]);
  useEffect(() => {
    if (
      !openRequest ||
      processed.current === openRequest.token ||
      openRequest.model.projectId !== record.id
    )
      return;
    processed.current = openRequest.token;
    setWindows((old) => {
      if (old.length >= 12) return old;
      const i = ++serial.current;
      return [
        ...old,
        {
          id: i,
          model: copy(openRequest.model),
          chart: copy(openRequest.chart),
          dependency: dependency(record, openRequest.model),
          x: 16 + (old.length % 4) * 24,
          y: 12 + (old.length % 4) * 24,
          width: Math.min(600, bounds.width - 32),
          height: 350,
          z: i,
          minimized: false,
        },
      ];
    });
  }, [openRequest, record.id]);
  const update = (id, patch) =>
    setWindows((old) => old.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  const focus = (id) =>
    setWindows((old) =>
      old.map((w) =>
        w.id === id ? { ...w, z: Math.max(0, ...old.map((a) => a.z)) + 1 } : w,
      ),
    );
  const start = (event, w, mode) => {
    if (mode === "move" && event.target.closest("button")) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    focus(w.id);
    drag.current = { id: w.id, x: event.clientX, y: event.clientY, w, mode };
  };
  const move = (event) => {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.x,
      dy = event.clientY - d.y;
    if (d.mode === "panel") {
      setHeight(clamp(d.w.height - dy, 240, 780));
      return;
    }
    if (d.mode === "move")
      update(d.id, {
        x: clamp(
          d.w.x + dx,
          0,
          bounds.width - Math.min(d.w.width, bounds.width),
        ),
        y: clamp(
          d.w.y + dy,
          0,
          bounds.height - Math.min(d.w.height, bounds.height),
        ),
      });
    else
      update(d.id, {
        width: clamp(
          d.w.width + dx,
          Math.min(300, bounds.width),
          bounds.width - d.w.x,
        ),
        height: clamp(d.w.height + dy, 220, bounds.height - d.w.y),
      });
  };
  const tile = () => {
    if (canvas.current?.parentElement)
      canvas.current.parentElement.scrollTop = 0;
    const list = windows.filter((w) => !w.minimized),
      cols = bounds.width >= 720 && list.length > 1 ? 2 : 1,
      rows = Math.max(1, Math.ceil(list.length / cols)),
      availableHeight =
        canvas.current?.parentElement?.clientHeight || bounds.height,
      cellH = clamp((availableHeight - 12) / rows - 12, 300, 560);
    const cellW = (bounds.width - 24) / cols;
    setWorldHeight(
      Math.max(350, Math.ceil(list.length / cols) * (cellH + 12) + 12),
    );
    setWindows((old) =>
      old.map((w) => {
        const i = list.findIndex((a) => a.id === w.id);
        return i < 0
          ? w
          : {
              ...w,
              maximized: false,
              x: 12 + (i % cols) * cellW,
              y: 12 + Math.floor(i / cols) * (cellH + 12),
              width: cellW - 12,
              height: cellH,
            };
      }),
    );
  };
  const keyboard = (event, w, resize = false) => {
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault();
    const d = event.shiftKey ? 40 : 10,
      dx = event.key === "ArrowRight" ? d : event.key === "ArrowLeft" ? -d : 0,
      dy = event.key === "ArrowDown" ? d : event.key === "ArrowUp" ? -d : 0;
    update(
      w.id,
      resize
        ? {
            width: clamp(
              w.width + dx,
              Math.min(300, bounds.width),
              bounds.width - w.x,
            ),
            height: clamp(w.height + dy, 220, bounds.height - w.y),
          }
        : {
            x: clamp(
              w.x + dx,
              0,
              bounds.width - Math.min(w.width, bounds.width),
            ),
            y: clamp(
              w.y + dy,
              0,
              bounds.height - Math.min(w.height, bounds.height),
            ),
          },
    );
  };
  return (
    <section
      className={`sc-results-workspace${expanded ? " expanded" : ""}`}
      style={{
        display: visible ? "flex" : "none",
        height: expanded ? "100%" : height,
      }}
      aria-label="结果工作区"
    >
      {!expanded && (
        <div
          role="separator"
          tabIndex={0}
          aria-label="调整结果工作区高度"
          aria-orientation="horizontal"
          aria-valuenow={height}
          aria-valuemin={240}
          aria-valuemax={780}
          className="sc-dock-resizer"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            drag.current = {
              mode: "panel",
              y: e.clientY,
              x: e.clientX,
              w: { height },
            };
          }}
          onPointerMove={move}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onKeyDown={(e) => {
            if (["ArrowUp", "ArrowDown"].includes(e.key)) {
              e.preventDefault();
              setHeight((h) =>
                clamp(h + (e.key === "ArrowUp" ? 20 : -20), 240, 780),
              );
            }
          }}
        />
      )}
      <header className="sc-results-header">
        <strong>
          <Icon name="layers" />
          结果工作区 <small>{windows.length}</small>
        </strong>
        <div className="sc-actions">
          <button disabled={!windows.length} onClick={tile}>
            <Icon name="grid" size={14} />
            平铺
          </button>
          <button
            disabled={!windows.length}
            onClick={() => {
              if (canvas.current?.parentElement)
                canvas.current.parentElement.scrollTop = 0;
              setWorldHeight(450);
              setWindows((old) =>
                old.map((w, i) => ({
                  ...w,
                  maximized: false,
                  minimized: false,
                  x: 12 + (i % 5) * 24,
                  y: 12 + (i % 5) * 24,
                  width: Math.min(600, bounds.width - 120),
                  height: 300,
                })),
              );
            }}
          >
            <Icon name="layers" size={14} />
            层叠
          </button>
          <button onClick={() => setExpanded(!expanded)}>
            <Icon name={expanded ? "collapse" : "expand"} size={14} />
            {expanded ? "返回表单布局" : "放大工作区"}
          </button>
          <button
            className="sc-icon-button"
            aria-label="收起结果区"
            title="收起结果区"
            onClick={hide}
          >
            <Icon name="minus" />
          </button>
        </div>
      </header>
      <div className="sc-result-window-strip">
        {windows.map((w) => (
          <button
            key={w.id}
            aria-pressed={!w.minimized}
            title={w.chart.title + " · " + w.model.scope}
            onClick={() => {
              update(w.id, { minimized: false });
              focus(w.id);
            }}
          >
            {w.chart.title} · {w.model.scope}
          </button>
        ))}
        {!windows.length && (
          <span>
            从各节点的“图表”打开视窗，可同时对照不同节点、单元与计算版本。
          </span>
        )}
        {windows.length >= 12 && (
          <span>已达 12 个视窗，请关闭不再使用的窗口后再打开。</span>
        )}
      </div>
      <div className="sc-result-canvas-scroll">
        <div
          ref={canvas}
          className="sc-result-canvas"
          style={{ minHeight: worldHeight }}
        >
          {windows.map((w) => {
            const width = Math.min(w.width, bounds.width),
              x = clamp(w.x, 0, bounds.width - width);
            const old =
              w.model.stale || dependency(record, w.model) !== w.dependency;
            return (
              <article
                key={w.id}
                className="sc-result-window"
                aria-label={`结果视窗：${w.chart.title} · ${w.model.scope}`}
                onPointerDown={() => focus(w.id)}
                style={{
                  display: w.minimized ? "none" : "flex",
                  left: w.maximized ? 0 : x,
                  top: w.maximized ? 0 : w.y,
                  width: w.maximized ? "100%" : width,
                  height: w.maximized ? Math.max(350, bounds.height) : w.height,
                  zIndex: w.z,
                }}
              >
                <div
                  className="sc-result-titlebar"
                  tabIndex={0}
                  aria-label={`移动视窗 ${w.chart.title}`}
                  onPointerDown={(e) => !w.maximized && start(e, w, "move")}
                  onPointerMove={move}
                  onPointerUp={() => {
                    drag.current = null;
                  }}
                  onPointerCancel={() => {
                    drag.current = null;
                  }}
                  onKeyDown={(e) => !w.maximized && keyboard(e, w)}
                >
                  <strong title={w.chart.title + " · " + w.model.scope}>
                    {w.chart.title}
                    <small>{w.model.scope}</small>
                  </strong>
                  <div className="sc-actions">
                    <button
                      aria-label={`最小化 ${w.chart.title}`}
                      onClick={() => update(w.id, { minimized: true })}
                    >
                      <Icon name="minus" size={14} />
                    </button>
                    <button
                      aria-label={`${w.maximized ? "还原" : "最大化"} ${
                        w.chart.title
                      }`}
                      onClick={() => update(w.id, { maximized: !w.maximized })}
                    >
                      <Icon
                        name={w.maximized ? "collapse" : "expand"}
                        size={14}
                      />
                    </button>
                    <button
                      aria-label={`关闭 ${w.chart.title}`}
                      onClick={() =>
                        setWindows((old) => old.filter((a) => a.id !== w.id))
                      }
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                </div>
                <div className="sc-window-body">
                  <Figure chart={w.chart} context={w.model} />
                </div>
                <footer
                  title={
                    w.model.inputHash
                      ? `窗口 #${w.id} · 输入 ${w.model.inputHash}`
                      : "输入资料预览，不作为计算结论"
                  }
                >
                  <span role="status" className={old ? "outdated" : ""}>
                    {old
                      ? "历史快照 · 输入已有变化，请重算后另开视窗"
                      : w.model.basis}
                  </span>
                  <time>
                    {w.model.createdAt
                      ? new Date(w.model.createdAt).toLocaleString("zh-CN")
                      : "未运行"}
                  </time>
                </footer>
                {!w.maximized && (
                  <button
                    className="sc-window-resizer"
                    aria-label={`调整视窗大小 ${w.chart.title}`}
                    onPointerDown={(e) => start(e, w, "resize")}
                    onPointerMove={move}
                    onPointerUp={() => {
                      drag.current = null;
                    }}
                    onPointerCancel={() => {
                      drag.current = null;
                    }}
                    onKeyDown={(e) => keyboard(e, w, true)}
                  >
                    ◢
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
