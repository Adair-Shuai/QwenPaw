import { fmt, Table, useLoad } from "./common.jsx";
import { json } from "./projects.jsx";
const React = window.QwenPaw.host.React;
const { useState, useEffect } = React;
function Figure({ rows }) {
  if (!rows.length) return null;
  const max = Math.max(1, ...rows.flatMap((r) => [r.inj || 0, r.prod || 0]));
  const width = 900 / rows.length;
  return (
    <figure className="sl-figure">
      <figcaption>
        <strong>区块注采趋势</strong>
        <span>
          <i />
          注气　
          <i />
          采气　·　万方
        </span>
      </figcaption>
      <svg
        viewBox="0 0 900 100"
        preserveAspectRatio="none"
        role="img"
        aria-label="最近九十条区块日报注采气量"
      >
        {[25, 50, 75, 99].map((y) => (
          <line
            key={y}
            x1="0"
            x2="900"
            y1={y}
            y2={y}
            stroke="currentColor"
            opacity=".1"
          />
        ))}
        {rows.map((r, i) =>
          ["inj", "prod"].map(
            (key, j) =>
              r[key] > 0 && (
                <rect
                  key={r.day + key}
                  x={(i + j * 0.48) * width}
                  y={98 - (r[key] / max) * 94}
                  width={Math.max(0.8, width * 0.46)}
                  height={(r[key] / max) * 94}
                  fill={j ? "#bd753c" : "#198576"}
                >
                  <title>
                    {r.day} · {j ? "采气" : "注气"} {fmt(r[key])} 万方
                  </title>
                </rect>
              ),
          ),
        )}
      </svg>
      <footer>
        <span>{rows[0].day}</span>
        <span>{rows.at(-1).day}</span>
      </footer>
    </figure>
  );
}
const diff = (a, b) => (a == null || b == null ? null : a - b);
export function Operations({
  doc,
  api,
  base,
  revision,
  onChange,
  open,
  update,
  inspect,
  project,
  download,
}) {
  const audit = doc.type === "quality";
  const [page, setPage] = useState(0),
    [choice, setChoice] = useState(""),
    [reason, setReason] = useState(""),
    [busy, spin] = useState(false),
    [error, fail] = useState(""),
    [message, say] = useState("");
  const focus = doc.well || "";
  const params = new URLSearchParams();
  if (base.src) params.set("src", base.src);
  if (doc.day) params.set("day", doc.day);
  if (page) params.set("notes_page", page);
  const query = { notes_page: page };
  const specific = Boolean((doc.day && doc.day !== base.day) || page);
  const state = useLoad(api, specific ? "/workspace?" + params : "", revision);
  const d = specific ? state.data : base;
  const day = d?.day || "",
    bal = d?.balance;
  const scopeDisabled = busy || !d;
  useEffect(() => {
    setChoice("");
    setReason("");
    fail("");
    say("");
  }, [doc.day, focus, base.src]);
  function navigate(changes) {
    if ("notes_page" in changes) setPage(changes.notes_page);
    else update({ day: changes.day, well: "" });
  }
  function openDay(day, well = "") {
    if (well) {
      update({ day, well });
      inspect({ type: "well", name: well });
    } else open({ type: "balance", day });
  }
  function pickWell(name) {
    open({ type: "well", name, date: day });
  }
  const btn = (text, click) => (
    <button className="sl-link" onClick={click}>
      {text}
    </button>
  );
  const issue = d?.issues.find((i) => i.well === focus && i.day === day);
  async function save() {
    if (!issue || !choice || !reason.trim()) return;
    spin(true);
    fail("");
    try {
      await api(
        "/reviews",
        json("POST", {
          src: d.src,
          day,
          well: focus,
          row_no: Number(choice),
          note: reason.trim(),
          previous: issue.selected,
        }),
      );
      setReason("");
      setChoice("");
      say("已保存复核意见并重新计算当日对账");
      onChange();
    } catch (e) {
      fail(e.message);
    } finally {
      spin(false);
    }
  }
  const rowLabel = (r) =>
    !r.contested
      ? "单条记录"
      : r.selected == null
      ? "待复核"
      : r.selected === r.row_no
      ? "已采用"
      : "保留原行";
  const recordCols = [
    [
      "来源行",
      (r) =>
        btn(r.row_no > 0 ? String(r.row_no) : "手工", () =>
          inspect({
            type: "record",
            area: "daily",
            src: d.src,
            row_no: r.row_no,
          }),
        ),
    ],
    ...[
      ["日注气 / 万方", "inj", "日注气量104m3"],
      ["日采气 / 万方", "prod", "日采气量104m3"],
      ["生产 / h", "hours", "生产时间h"],
      ["油压 / MPa", "tubing", "油压mpa"],
      ["套压 / MPa", "casing", "套压mpa"],
    ].map(([heading, key, field]) => [
      heading,
      (r) => d.text_values?.[r.row_no]?.[field] ?? fmt(r[key]),
    ]),
  ];
  return (
    <div className="se-paper">
      <header className="se-doc-head">
        <div>
          <small>生产管理</small>
          <h2>{audit ? "质控复核" : "生产对账"}</h2>
        </div>
        <label>
          生产日{" "}
          <input
            type="date"
            value={doc.day || base.day || ""}
            min={base.period?.first || undefined}
            max={base.period?.last || undefined}
            onChange={(e) => navigate({ day: e.target.value })}
          />
        </label>
      </header>
      {(error || state.error) && (
        <p className="sl-alert" role="alert">
          {error || state.error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {!d && !state.error && <p>正在读取日报…</p>}
      {d && (
        <>
          {" "}
          {!audit &&
            (!d.src ? (
              <div className="sl-empty">
                <h2>导入第一份注采日报</h2>
                <p>
                  选择含“区块”和“单井”工作表的汇总文件，即可查看注采趋势与单井明细。
                </p>
                {btn("下载合成示例", () =>
                  download({ name: "合成注采日报.xlsx" }),
                )}
              </div>
            ) : (
              <>
                <div className="sl-metrics">
                  {[
                    ["区块日注气", bal?.block_inj, "万方"],
                    ["区块日采气", bal?.block_prod, "万方"],
                    [
                      "当日报表井数",
                      new Set(d.daily.map((r) => r.well)).size,
                      "口",
                    ],
                    ["当日待复核", bal?.pending, "组"],
                  ].map(([k, v, u]) => (
                    <article key={k}>
                      <span>{k}</span>
                      <div>
                        {fmt(v)} <small>{u}</small>
                      </div>
                    </article>
                  ))}
                </div>
                <Figure rows={d.trend} />
                <div className="se-section-head">
                  <h2>当日气量对账</h2>
                  {d.block_row != null &&
                    btn("查看区块日报来源行", () =>
                      inspect({
                        type: "record",
                        area: "block",
                        src: d.src,
                        row_no: d.block_row,
                      }),
                    )}
                </div>
                <Table
                  cols={[
                    ["方向", "kind"],
                    ["区块日报 / 万方", "block"],
                    ["已采用井量合计 / 万方", "sum"],
                    [
                      "区块减井量 / 万方",
                      (r) =>
                        bal?.pending ? "待复核" : fmt(diff(r.block, r.sum)),
                    ],
                  ]}
                  rows={
                    bal
                      ? [
                          {
                            kind: "注气",
                            block: bal.block_inj,
                            sum: bal.inj,
                          },
                          {
                            kind: "采气",
                            block: bal.block_prod,
                            sum: bal.prod,
                          },
                        ]
                      : []
                  }
                />
                <h2>单井明细</h2>
                <Table
                  cols={[
                    ["井号", (r) => btn(r.well, () => pickWell(r.well))],
                    ...recordCols,
                    ["记录状态", rowLabel],
                    ["备注", "memo"],
                  ]}
                  rows={d.daily}
                />
              </>
            ))}
          {audit && (
            <>
              <h2>
                重复井日记录{" "}
                <small>
                  {d.issues.filter((i) => i.selected == null).length} 组待复核
                </small>
              </h2>
              {issue && (
                <div className="sl-review">
                  <h3>
                    {focus} · {day}
                  </h3>
                  <div className="se-tools">
                    {btn("打开单井曲线", () => pickWell(focus))}
                    {btn("查看当日对账", () => openDay(day))}
                  </div>
                  <Table
                    rows={d.daily.filter((r) => r.well === focus)}
                    cols={[
                      [
                        "采用",
                        (r) => (
                          <input
                            type="radio"
                            name="candidate"
                            aria-label={"采用第 " + r.row_no + " 行"}
                            checked={choice === String(r.row_no)}
                            onChange={() => setChoice(String(r.row_no))}
                          />
                        ),
                      ],
                      ...recordCols,
                      ["备注", "memo"],
                      ["状态", rowLabel],
                    ]}
                  />
                  <label>
                    复核依据{" "}
                    <input
                      value={reason}
                      maxLength="500"
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="填写采用该行的依据"
                    />
                  </label>{" "}
                  <button
                    className="sl-primary"
                    disabled={
                      scopeDisabled ||
                      project.archived ||
                      !choice ||
                      !reason.trim()
                    }
                    onClick={save}
                  >
                    保存并重算
                  </button>
                  {d.audit
                    .filter((a) => a.well === focus)
                    .map((a, i) => (
                      <p key={i}>
                        {a.reviewed} UTC · 第 {a.row_no} 行 · {a.note}
                      </p>
                    ))}
                </div>
              )}
              <Table
                rows={d.issues}
                cols={[
                  ["生产日", "day"],
                  ["井号", (r) => btn(r.well, () => openDay(r.day, r.well))],
                  ["原始行数", "candidates"],
                  [
                    "复核结果",
                    (r) =>
                      r.selected == null
                        ? "待复核"
                        : "采用第 " + r.selected + " 行",
                  ],
                  ["依据", "note"],
                ]}
              />
              <h2>井量与区块日报差额</h2>
              <p>
                两侧有读数、且井日冲突已处理时比较，绝对差达到 0.0001 万方列出。
              </p>
              <Table
                rows={d.gaps}
                cols={[
                  ["生产日", (r) => btn(r.day, () => openDay(r.day))],
                  ["注气差 / 万方", (r) => fmt(diff(r.block_inj, r.inj))],
                  ["采气差 / 万方", (r) => fmt(diff(r.block_prod, r.prod))],
                ]}
              />
              <div className="sl-section">
                <h2>
                  非标数值原文 <small>{fmt(d.notes_count)} 项</small>
                </h2>
                {d.notes_count > 100 && (
                  <div>
                    <button
                      disabled={scopeDisabled || !Number(query.notes_page)}
                      onClick={() =>
                        navigate({ notes_page: Number(query.notes_page) - 1 })
                      }
                    >
                      上一页
                    </button>
                    <span>
                      　{Number(query.notes_page || 0) + 1} /{" "}
                      {Math.ceil(d.notes_count / 100)}　
                    </span>
                    <button
                      disabled={
                        scopeDisabled ||
                        (Number(query.notes_page || 0) + 1) * 100 >=
                          d.notes_count
                      }
                      onClick={() =>
                        navigate({
                          notes_page: Number(query.notes_page || 0) + 1,
                        })
                      }
                    >
                      下一页
                    </button>
                  </div>
                )}
              </div>
              <Table
                rows={d.reading_notes}
                cols={[
                  ["工作表", "sheet"],
                  [
                    "原表行",
                    (r) =>
                      btn(r.row_no, () =>
                        inspect({
                          type: "record",
                          area: r.sheet === "区块" ? "block" : "daily",
                          src: d.src,
                          row_no: r.row_no,
                        }),
                      ),
                  ],
                  ["字段", "field"],
                  ["原文", "value"],
                ]}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
