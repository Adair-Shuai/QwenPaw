import { fmt, Table, useLoad } from "./common.jsx";
const React = window.QwenPaw.host.React;
import { measures, WellTrend } from "./wellTrend.jsx";
function Casing({ well, trace }) {
  const rows = well.strings;
  function numeric(s) {
    return typeof s === "number" ||
      (typeof s === "string" && /^\s*\d+(\.\d+)?\s*$/.test(s))
      ? Number(s)
      : null;
  }
  const measured = rows
    .map((r) => ({ ...r, z: numeric(r.depth) }))
    .filter((r) => r.z != null && r.z >= 0);
  const deepest = Math.max(1, ...measured.map((r) => r.z)),
    y = (z) => 32 + (198 * z) / deepest;
  return (
    <>
      <h3>套管鞋深度</h3>
      {measured.length > 0 && (
        <div className="se-casing-scroll">
          <svg
            viewBox={
              "0 0 " + Math.max(560, 125 + measured.length * 108) + " 273"
            }
            role="img"
            aria-label={well.name + "套管鞋下深示意图"}
          >
            <text x="7" y="17" className="se-axis">
              下深 / m
            </text>
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <g key={f}>
                <line
                  x1="65"
                  x2={110 + measured.length * 105}
                  y1={y(f * deepest)}
                  y2={y(f * deepest)}
                  className="se-grid"
                />
                <text
                  className="se-axis"
                  x="58"
                  y={y(f * deepest) + 3}
                  textAnchor="end"
                >
                  {fmt(Math.round(f * deepest))}
                </text>
              </g>
            ))}
            {measured.map((r, i) => {
              const x = 116 + 105 * i,
                depth = y(r.z);
              return (
                <g
                  key={r.sheet + r.row_no}
                  tabIndex={0}
                  role="button"
                  aria-label={r.name + " 第 " + r.row_no + " 行"}
                  onClick={() => trace("casing", r)}
                  onKeyDown={(e) => e.key === "Enter" && trace("casing", r)}
                >
                  <line
                    x1={x}
                    x2={x}
                    y1="32"
                    y2="232"
                    stroke="#a9b9c3"
                    strokeDasharray="2 5"
                  />
                  <path
                    d={"M" + (x - 12) + " " + (depth - 8) + "v8h24v-8"}
                    stroke="#147c76"
                    strokeWidth="3"
                    fill="none"
                  />
                  <text x={x + 16} y={depth + 3} className="se-axis">
                    {fmt(r.z)}
                  </text>
                  <text x={x} y="252" textAnchor="middle">
                    {r.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
      <Table
        rows={rows}
        cols={[
          ["套管名称", "name"],
          ["外径 / mm", "diameter"],
          ["下深 / m", "depth"],
          ["水泥返深（原文）", "cement"],
          ["固井质量", "quality"],
          [
            "来源行",
            (r) => (
              <button className="sl-link" onClick={() => trace("casing", r)}>
                {r.sheet} · {r.row_no}
              </button>
            ),
          ],
        ]}
        empty="当前井没有完井套管记录"
      />
    </>
  );
}
export function WellDocument({
  doc,
  well,
  objects,
  base,
  api,
  revision,
  open,
  inspect,
  download,
}) {
  const [mode, setMode] = React.useState("曲线与日报"),
    [other, compare] = React.useState(""),
    [period, span] = React.useState(365),
    [metric, channel] = React.useState("gas"),
    [end, cut] = React.useState(doc.date || base.day || ""),
    [cursor, locate] = React.useState(doc.date || ""),
    [page, paginate] = React.useState(0);
  React.useEffect(() => {
    if (doc.date) {
      cut(doc.date);
      locate(doc.date);
      span(90);
      setMode("曲线与日报");
    }
  }, [doc.date, doc.jump]);
  const dates = doc.type === "well" && mode === "曲线与日报";
  const qs = new URLSearchParams({ well: doc.name, span: period, end });
  if (base.src) qs.set("src", base.src);
  if (other) qs.append("well", other);
  const state = useLoad(
      api,
      dates && base.src ? "/series?" + qs : "",
      revision,
    ),
    data = state.data;
  function trace(area, r) {
    inspect({
      type: "record",
      area,
      src: r.src,
      row_no: r.row_no,
      sheet: r.sheet,
    });
  }
  function select(day) {
    locate(day);
    const p =
      data?.series[doc.name]?.find((r) => r.day === day) ||
      data?.series[other]?.find((r) => r.day === day);
    if (p?.row_no != null) trace("daily", { src: data.src, row_no: p.row_no });
    else if (p?.candidates.length)
      inspect({
        type: "issue",
        name: data?.series[doc.name]?.includes(p) ? doc.name : other,
        day,
        rows: p.candidates,
        src: data.src,
      });
  }
  const main = data?.series[doc.name] || [],
    details = [doc.name, other]
      .filter(Boolean)
      .map((name) => ({
        name,
        point: data?.series[name]?.find((p) => p.day === cursor),
      }))
      .filter((item) => item.point),
    ordered = React.useMemo(() => main.slice().reverse(), [main]);
  const issues = (base.issues || []).filter(
    (i) => i.well === doc.name && i.selected == null,
  );
  React.useEffect(() => paginate(0), [period, end, base.src, doc.name]);
  const startPage = Math.min(
    page,
    Math.max(0, Math.ceil(main.length / 40) - 1),
  );
  if (!well)
    return <div className="sl-empty">当前版本中没有这口井的资料。</div>;
  return (
    <div className="se-paper">
      <header className="se-doc-head">
        <div>
          <small>单井工程档案</small>
          <h2>{well.name}</h2>
        </div>
        <span className="se-meta">
          {well.masters[0]?.kind || "单井"} · {fmt(well.days)} 个生产日
        </span>
      </header>
      <div className="se-subtabs">
        {["曲线与日报", "井筒结构", "井档资料"].map((m) => (
          <button key={m} aria-pressed={m === mode} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>
      {mode === "井筒结构" && <Casing well={well} trace={trace} />}
      {mode === "井档资料" && (
        <>
          <h3>单井基础数据</h3>
          <Table
            rows={well.masters}
            cols={[
              ["井号", "well"],
              ["井 ID", "external_id"],
              ["井别", "kind"],
              ["站库", "station"],
              ["管线", "line"],
              ["井口 X", (r) => fmt(r.xy?.[0])],
              ["井口 Y", (r) => fmt(r.xy?.[1])],
              [
                "来源行",
                (r) => (
                  <button
                    className="sl-link"
                    onClick={() => trace("master", r)}
                  >
                    {r.row_no}
                  </button>
                ),
              ],
            ]}
          />
          <h3>关联井资料</h3>
          <Table
            rows={base.sources.filter(
              (s) => s.well === well.name && !s.archived,
            )}
            cols={[
              ["文件", "name"],
              ["类别", "category"],
              [
                "原件",
                (s) => (
                  <button className="sl-link" onClick={() => download(s)}>
                    下载原件
                  </button>
                ),
              ],
            ]}
          />
        </>
      )}
      {dates && (
        <>
          <div className="se-filter-grid">
            <label>
              曲线通道
              <select value={metric} onChange={(e) => channel(e.target.value)}>
                <option value="gas">注气 / 采气量</option>
                <option value="pressure">油压 / 套压</option>
              </select>
            </label>
            <label>
              对比井
              <select value={other} onChange={(e) => compare(e.target.value)}>
                <option value="">仅当前井</option>
                {objects.wells
                  .filter((w) => w.name !== well.name && w.days)
                  .map((w) => (
                    <option key={w.name}>{w.name}</option>
                  ))}
              </select>
            </label>
            <label>
              时段
              <select
                value={period}
                onChange={(e) => span(Number(e.target.value))}
              >
                {[
                  [30, "30 天"],
                  [90, "90 天"],
                  [365, "一年"],
                  [0, "全时段"],
                ].map(([p, n]) => (
                  <option key={p} value={p}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label>
              截止日
              <input
                type="date"
                value={end}
                onChange={(e) => cut(e.target.value)}
                max={base.period?.last || undefined}
              />
            </label>
          </div>
          {state.error && (
            <p role="alert" className="sl-alert">
              {state.error}
            </p>
          )}
          {data ? (
            <WellTrend
              data={data}
              wells={[well.name, ...(other ? [other] : [])]}
              metric={metric}
              cursor={cursor}
              select={select}
            />
          ) : (
            <p>
              {base.src
                ? !state.error
                  ? "正在读取曲线…"
                  : ""
                : "当前项目尚无生产日报。"}
            </p>
          )}
          {details.map(({ name, point }) => (
            <div key={name} className="se-tools se-picked">
              <strong>
                {cursor} · {name}
              </strong>
              {point.candidates.length > 1 && (
                <button
                  onClick={() =>
                    open({ type: "quality", well: name, day: cursor })
                  }
                >
                  打开该井日复核
                </button>
              )}
              {(point.candidates.length
                ? point.candidates
                : [point.row_no]
              ).map((n) => (
                <button
                  key={n}
                  onClick={() => trace("daily", { src: data.src, row_no: n })}
                >
                  {n > 0 ? "查看第 " + n + " 行" : "查看手工记录"}
                </button>
              ))}
            </div>
          ))}
          <div className="se-section-head">
            <h3>
              单井日报 <small>{fmt(main.length)} 个井日</small>
            </h3>
            {issues.length > 0 && (
              <button
                className="sl-link"
                onClick={() =>
                  open({ type: "quality", well: well.name, day: issues[0].day })
                }
              >
                待复核 {issues.length} 组 ›
              </button>
            )}
          </div>
          <Table
            rows={ordered.slice(startPage * 40, startPage * 40 + 40)}
            cols={[
              [
                "生产日",
                (r) => (
                  <button className="sl-link" onClick={() => select(r.day)}>
                    {r.day}
                  </button>
                ),
              ],
              ...Object.entries(measures).map(([key, [label, unit]]) => [
                label + " / " + unit,
                key,
              ]),
              [
                "来源行",
                (r) =>
                  r.row_no == null ? (
                    <button
                      className="se-warning"
                      onClick={() =>
                        open({ type: "quality", well: well.name, day: r.day })
                      }
                    >
                      待复核 · {r.candidates.length} 行
                    </button>
                  ) : (
                    <button
                      className="sl-link"
                      onClick={() =>
                        trace("daily", { src: base.src, row_no: r.row_no })
                      }
                    >
                      {r.row_no > 0 ? r.row_no : "手工"}
                    </button>
                  ),
              ],
            ]}
            empty="此时段没有单井日报"
          />
          {main.length > 40 && (
            <div className="se-pager">
              <button
                disabled={startPage === 0}
                onClick={() => paginate(startPage - 1)}
              >
                上一页
              </button>
              {startPage + 1} / {Math.ceil(main.length / 40)}
              <button
                disabled={(startPage + 1) * 40 >= main.length}
                onClick={() => paginate(startPage + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
