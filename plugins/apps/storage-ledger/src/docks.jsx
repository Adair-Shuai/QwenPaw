import { fmt, Icon, names, useLoad } from "./common.jsx";
import { pipeKey, related } from "./surface.jsx";
const React = window.QwenPaw.host.React;
export function Explorer({ objects, open, selected }) {
  const [q, find] = React.useState(""),
    [expanded, setExpanded] = React.useState({ well: true });
  const groups = [
    [
      "well",
      "井",
      objects.wells.map((w) => ({
        type: "well",
        name: w.name,
        detail: w.pending ? String(w.pending) : "",
      })),
    ],
    [
      "station",
      "站场",
      objects.stations.map((name) => ({ type: "station", name })),
    ],
    [
      "pipe",
      "管线",
      objects.pipes.map((p) => ({
        ...pipeKey(p),
        alias: [p.name, p.start, p.end].join(" "),
      })),
    ],
  ];
  const term = q.trim().toLowerCase(),
    match = (o) =>
      [o.name, o.alias || ""].join(" ").toLowerCase().includes(term);
  return (
    <aside className="se-explorer" aria-label="项目浏览器">
      <div className="se-dock-title">
        <Icon name="panel" />
        <b>项目浏览器</b>
      </div>
      <label className="se-search">
        <Icon name="search" />
        <input
          type="search"
          aria-label="搜索工程对象"
          placeholder="查找井、站或管线"
          value={q}
          onChange={(e) => find(e.target.value)}
        />
      </label>
      <div className="se-tree">
        <div className="se-tree-root">
          <Icon name="project" /> 工程对象
        </div>
        {groups.map(([type, label, all]) => {
          const items = all.filter(match),
            show = term || expanded[type];
          if (term && !items.length) return null;
          return (
            <div key={type}>
              <button
                className="se-branch"
                aria-expanded={!!show}
                onClick={() =>
                  setExpanded({ ...expanded, [type]: !expanded[type] })
                }
              >
                <span>{show ? "▾" : "▸"}</span>
                <Icon name={type} />
                {label}
                <em>{items.length}</em>
              </button>
              {show && (
                <div className="se-leaves">
                  {items.map((o) => (
                    <button
                      key={type === "pipe" ? o.src + ":" + o.row_no : o.name}
                      className={
                        selected?.type === type &&
                        (type === "pipe"
                          ? selected.src === o.src &&
                            selected.row_no === o.row_no
                          : selected?.name === o.name)
                          ? "current"
                          : ""
                      }
                      aria-label={"打开" + names[type] + " " + o.name}
                      onClick={() => open(o)}
                    >
                      <Icon name={type} />
                      <span>{o.name}</span>
                      {o.detail && <em title="待复核井日">{o.detail}</em>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {term && !groups.some((g) => g[2].some(match)) && <p>未找到工程对象</p>}
      </div>
    </aside>
  );
}
function Props({ items }) {
  return (
    <dl className="se-properties">
      {items.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt>{k}</dt>
          <dd>{v === 0 ? "0" : v || "—"}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
const rawField = {
  inj: "日注气量104m3",
  prod: "日采气量104m3",
  hours: "生产时间h",
  tubing: "油压mpa",
  casing: "套压mpa",
};
const areaName = {
  daily: "单井日报",
  block: "区块日报",
  master: "井档",
  pipe: "管线",
  casing: "完井卡片",
};
function Trace({ s, api, revision, open, download }) {
  const qs = new URLSearchParams({ src: s.src, row_no: s.row_no });
  if (s.sheet) qs.set("sheet", s.sheet);
  const state = useLoad(api, "/trace/" + s.area + "?" + qs, revision),
    d = state.data;
  if (!d)
    return (
      <p role={state.error ? "alert" : "status"}>
        {state.error || "正在定位来源行…"}
      </p>
    );
  const well = d.row.well,
    day = d.row.day;
  return (
    <>
      <h3>{areaName[s.area]}来源</h3>
      <Props
        items={[
          ["资料名称", d.source.name],
          ["工作表", d.line > 0 ? d.sheet : "手工录入"],
          ["原表行", d.line > 0 ? d.line : "手工录入"],
          ...(s.src !== d.source.id ? [["汇编行", s.row_no]] : []),
        ]}
      />
      {d.line > 0 && d.source.has_original > 0 && (
        <button onClick={() => download(d.source)}>
          <Icon name="import" />
          下载来源原件
        </button>
      )}
      <h4>当前台账值</h4>
      <Props
        items={Object.entries(d.fields).map(([key, name]) => [
          name,
          d.raw[rawField[key]] ?? fmt(d.row[key]),
        ])}
      />
      {d.changes.length > 0 && (
        <>
          <h4>修订记录</h4>
          {d.changes.map((c, i) => (
            <p key={i}>
              {c.created} UTC
              <br />
              {c.reason}
            </p>
          ))}
        </>
      )}
      <div className="se-prop-actions">
        {well && (
          <button onClick={() => open({ type: "well", name: well, date: day })}>
            打开单井档案
          </button>
        )}
        {day && (
          <button onClick={() => open({ type: "balance", day })}>
            查看当日对账
          </button>
        )}
      </div>
    </>
  );
}
export function Inspector({
  selected: s,
  objects,
  base,
  api,
  revision,
  project,
  inspect,
  open,
  download,
  close,
}) {
  const well =
      s?.type === "well" && objects.wells.find((w) => w.name === s.name),
    pipe =
      s?.type === "pipe" &&
      objects.pipes.find((p) => p.src === s.src && p.row_no === s.row_no);
  const source = base.sources.find((x) => x.id === base.src);
  const link = (text, fn) => (
    <button className="sl-link" onClick={fn}>
      {text}
    </button>
  );
  const issue =
    well && base.issues.find((i) => i.well === well.name && i.selected == null);
  const trace = (area, row) =>
    inspect({
      type: "record",
      area,
      src: row.src,
      row_no: row.row_no,
      sheet: row.sheet,
    });
  return (
    <aside className="se-inspector" aria-label="属性与来源">
      <div className="se-dock-title">
        <Icon name="inspector" />
        <b>属性与来源</b>
        <button className="se-x" aria-label="收起属性" onClick={close}>
          ×
        </button>
      </div>
      <div className="se-prop-body">
        {s?.type === "record" ? (
          <Trace
            s={s}
            api={api}
            revision={revision}
            open={open}
            download={download}
          />
        ) : s?.type === "issue" ? (
          <>
            <small>重复井日</small>
            <h3>{s.name}</h3>
            <Props
              items={[
                ["生产日", s.day],
                ["状态", "待复核"],
              ]}
            />
            {s.rows.map((n) => (
              <div key={n}>
                {link("来源行 " + n, () =>
                  trace("daily", { src: s.src, row_no: n }),
                )}
              </div>
            ))}
            {link("打开复核", () =>
              open({ type: "quality", well: s.name, day: s.day }),
            )}
          </>
        ) : well ? (
          <>
            <small>单井属性</small>
            <h3>{well.name}</h3>
            <Props
              items={[
                ["井别", well.masters[0]?.kind],
                ["井 ID", well.masters[0]?.external_id],
                ["井口 X", fmt(well.xy?.[0])],
                ["井口 Y", fmt(well.xy?.[1])],
                ["首个生产日", well.first],
                ["末个生产日", well.last],
                ["井筒记录", well.strings.length],
                ["待复核井日", well.pending],
              ]}
            />
            {well.coordinate_conflict && (
              <p>同名井有多组井口坐标，需核对井档。</p>
            )}
            <div className="se-prop-actions">
              <button onClick={() => open({ type: "well", name: well.name })}>
                打开单井档案
              </button>
              {issue && (
                <button
                  onClick={() =>
                    open({ type: "quality", day: issue.day, well: well.name })
                  }
                >
                  定位待复核井日
                </button>
              )}
            </div>
            <h4>基础资料来源</h4>
            {well.masters.length ? (
              well.masters.map((r) => (
                <div key={r.row_no}>
                  {link(
                    "井档 · " +
                      (r.row_no > 0 ? "第 " + r.row_no + " 行" : "手工记录"),
                    () => trace("master", r),
                  )}
                </div>
              ))
            ) : (
              <p>暂无单井基础记录</p>
            )}
            <h4>关联管线</h4>
            {related(objects.pipes, s).map((p) => (
              <div key={p.row_no}>
                {link(p.name || p.code, () => open(pipeKey(p)))}
              </div>
            ))}
          </>
        ) : pipe ? (
          <>
            <small>地面管线</small>
            <h3>{pipe.code || pipe.name}</h3>
            <Props
              items={[
                ["管道名称", pipe.name],
                ["起点", pipe.start],
                ["终点", pipe.end],
                ["长度 / km", fmt(pipe.length)],
                ["外径 / mm", fmt(pipe.diameter)],
                ["设计压力 / MPa", fmt(pipe.pressure)],
              ]}
            />
            {link("定位管线来源行", () => trace("pipe", pipe))}
          </>
        ) : s?.type === "station" ? (
          <>
            <small>站场属性</small>
            <h3>{s.name}</h3>
            <Props items={[["相连管线", related(objects.pipes, s).length]]} />
            <h4>关联管线</h4>
            {related(objects.pipes, s).map((p) => (
              <div key={p.row_no}>
                {link(p.name || p.code, () => open(pipeKey(p)))}
              </div>
            ))}
          </>
        ) : (
          <>
            <small>项目属性</small>
            <h3>{project.name}</h3>
            <Props
              items={[
                ["所在地区", project.region],
                ["运营单位", project.operator],
                ["使用状态", project.archived ? "已归档" : "使用中"],
                ["井", objects.wells.length],
                ["站场", objects.stations.length],
                ["管线", objects.pipes.length],
              ]}
            />
            <h4>生产数据范围</h4>
            <Props
              items={[
                ["版本", source?.name],
                ["起始日", base.period?.first],
                ["截止日", base.period?.last],
                ["覆盖天数", fmt(base.period?.days)],
              ]}
            />
            {source?.has_original > 0 &&
              link("下载生产原件", () => download(source))}
          </>
        )}
      </div>
    </aside>
  );
}
