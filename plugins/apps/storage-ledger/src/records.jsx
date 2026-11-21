import { json, saveFile } from "./projects.jsx";
const React = window.QwenPaw.host.React;
const { useState, useEffect, useRef } = React;
const areas = {
  daily: ["单井日报", "production"],
  block: ["区块日报", "production"],
  master: ["井基础档案", "master"],
  casing: ["完井套管", "casing"],
  pipe: ["地面管线", "pipe"],
};
const actions = { add: "新增", edit: "修订", remove: "移除", undo: "撤销" };
const noteFields = {
  inj: "日注气量104m3",
  prod: "日采气量104m3",
  hours: "生产时间h",
  tubing: "油压mpa",
  casing: "套压mpa",
};
function displayed(row, key) {
  return row.raw?.[noteFields[key]] ?? row[key] ?? "";
}
export function RecordManager({
  api,
  sources,
  readOnly,
  onChange,
  inspect,
  generation,
}) {
  const [area, setArea] = useState("daily"),
    [src, version] = useState(""),
    [query, setQuery] = useState(""),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [page, setPage] = useState(0),
    [state, data] = useState(null),
    [revision, reload] = useState(0),
    [form, edit] = useState(null),
    [values, setValues] = useState({}),
    [reason, explain] = useState(""),
    [error, fail] = useState(""),
    [busy, spin] = useState(false),
    [loading, load] = useState(true),
    [history, setHistory] = useState(false);
  const params = new URLSearchParams({ search: query, page, start, end });
  if (src) params.set("src", src);
  const qs = params.toString();
  useEffect(() => {
    let live = true;
    load(true);
    fail("");
    api("/records/" + area + "?" + qs)
      .then((r) => r.json())
      .then((r) => {
        if (live) data(r);
      })
      .catch((e) => {
        if (live) {
          fail(e.message);
          data(null);
        }
      })
      .finally(() => {
        if (live) load(false);
      });
    return () => {
      live = false;
    };
  }, [area, qs, revision, generation, api]);
  function filter(fn, value) {
    fn(value);
    setPage(0);
    edit(null);
  }
  function begin(action, row) {
    edit({ action, record_id: row?.record_id, revision: row?.revision || 0 });
    setValues(
      Object.fromEntries(
        Object.keys(state.fields).map((k) => [k, row ? displayed(row, k) : ""]),
      ),
    );
    explain("");
    fail("");
  }
  async function apply(e) {
    e.preventDefault();
    spin(true);
    fail("");
    try {
      await api(
        "/records/" + area,
        json("POST", { ...form, src: state.src, values, reason }),
      );
      edit(null);
      reload((v) => v + 1);
      onChange();
    } catch (err) {
      fail(err.message);
    } finally {
      spin(false);
    }
  }
  const selectDisabled = busy || !!form;
  return (
    <section className="sl-records">
      <div className="sl-section">
        <h2>数据管理</h2>
        <div className="sl-actions">
          <button
            disabled={!state || loading || busy}
            onClick={async () => {
              try {
                await saveFile(
                  await api("/exports/" + area + "?" + qs),
                  areas[area][0] + ".csv",
                );
              } catch (e) {
                fail(e.message);
              }
            }}
          >
            导出筛选结果
          </button>
          <button
            className="sl-primary"
            disabled={readOnly || !state || loading || busy}
            onClick={() => begin("add")}
          >
            新增记录
          </button>
        </div>
      </div>
      <div className="sl-controls">
        <label>
          数据表
          <select
            disabled={selectDisabled}
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              version("");
              setQuery("");
              setStart("");
              setEnd("");
              setPage(0);
              setHistory(false);
            }}
          >
            {Object.entries(areas).map(([k, [v]]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          资料版本
          <select
            disabled={selectDisabled}
            value={src}
            onChange={(e) => filter(version, e.target.value)}
          >
            <option value="">最新版本</option>
            {sources
              .filter((s) => s.kind === areas[area][1] && !s.archived)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </label>
        <input
          disabled={selectDisabled}
          type="search"
          aria-label="筛选数据记录"
          placeholder="井号、名称或关键字"
          value={query}
          onChange={(e) => filter(setQuery, e.target.value)}
        />
        {["daily", "block"].includes(area) && (
          <>
            <label>
              起始日
              <input
                disabled={selectDisabled}
                type="date"
                value={start}
                max={end || undefined}
                onChange={(e) => filter(setStart, e.target.value)}
              />
            </label>
            <label>
              截止日
              <input
                disabled={selectDisabled}
                type="date"
                value={end}
                min={start || undefined}
                onChange={(e) => filter(setEnd, e.target.value)}
              />
            </label>
          </>
        )}
      </div>
      {error && (
        <p className="sl-alert" role="alert">
          {error}
        </p>
      )}
      {form && state && (
        <form className="sl-form" onSubmit={apply}>
          <h3>
            {actions[form.action]}
            {areas[area][0]}记录
          </h3>
          {["add", "edit"].includes(form.action) && (
            <div className="sl-fields">
              {Object.entries(state.fields).map(([k, name]) => (
                <label key={k}>
                  {name}
                  <input
                    type={k === "day" ? "date" : "text"}
                    required={state.required.includes(k)}
                    value={values[k] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [k]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
          )}
          <label>
            变更原因
            <input
              required
              maxLength={500}
              value={reason}
              onChange={(e) => explain(e.target.value)}
            />
          </label>
          <div className="sl-actions">
            <button className="sl-primary" disabled={busy || !reason.trim()}>
              {busy ? "正在保存…" : "确认" + actions[form.action]}
            </button>
            <button type="button" disabled={busy} onClick={() => edit(null)}>
              取消
            </button>
          </div>
        </form>
      )}
      {state && (
        <>
          <div className="sl-section">
            <p>
              {loading ? "正在查询…" : state.count.toLocaleString() + " 条记录"}
            </p>
            <button onClick={() => setHistory(!history)}>
              {history ? "返回记录" : "变更历史"}
            </button>
          </div>
          {history ? (
            <div className="sl-log">
              {!state.history.length && <p>暂无变更</p>}
              {state.history.map((c) => {
                const before = c.prior ? JSON.parse(c.prior) : {},
                  after = c.current ? JSON.parse(c.current) : {};
                const changed = Object.keys(state.fields).filter(
                  (k) =>
                    String(displayed(before, k)) !==
                    String(displayed(after, k)),
                );
                return (
                  <article key={c.id}>
                    <strong>
                      {actions[c.action]} ·{" "}
                      {after.well ||
                        before.well ||
                        after.name ||
                        before.name ||
                        areas[area][0]}
                    </strong>{" "}
                    <small>{c.created} UTC</small>
                    <p>{c.reason}</p>
                    <p>
                      {changed
                        .map(
                          (k) =>
                            state.fields[k] +
                            " " +
                            (displayed(before, k) === ""
                              ? "—"
                              : displayed(before, k)) +
                            " → " +
                            (displayed(after, k) === ""
                              ? "—"
                              : displayed(after, k)),
                        )
                        .join("　")}
                    </p>
                    {!readOnly &&
                      c.action !== "undo" &&
                      state.history.find((h) => h.record_id === c.record_id)
                        ?.id === c.id && (
                        <button
                          disabled={busy || loading}
                          onClick={() =>
                            begin("undo", {
                              record_id: c.record_id,
                              revision: c.id,
                            })
                          }
                        >
                          撤销此项
                        </button>
                      )}
                  </article>
                );
              })}
            </div>
          ) : (
            <>
              <div className="sl-table">
                <table>
                  <thead>
                    <tr>
                      <th>来源行</th>
                      {Object.values(state.fields).map((f) => (
                        <th key={f}>{f}</th>
                      ))}
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.rows.map((r) => (
                      <tr key={r.record_id}>
                        <td>
                          <button
                            className="sl-link"
                            onClick={() =>
                              inspect({
                                type: "record",
                                area,
                                src: state.src,
                                row_no: r.row_no,
                                sheet: r.sheet,
                              })
                            }
                          >
                            {r.origin || (r.row_no > 0 ? r.row_no : "手工")}
                          </button>
                          {r.revision > 0 ? " · 已修改" : ""}
                        </td>
                        {Object.keys(state.fields).map((k) => (
                          <td key={k}>
                            {displayed(r, k) === "" ? "—" : displayed(r, k)}
                          </td>
                        ))}
                        <td>
                          <button
                            disabled={readOnly || selectDisabled || loading}
                            onClick={() => begin("edit", r)}
                          >
                            编辑
                          </button>{" "}
                          <button
                            disabled={readOnly || selectDisabled || loading}
                            onClick={() => begin("remove", r)}
                          >
                            移除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!state.rows.length && <p>暂无符合条件的记录</p>}
              </div>
              <div className="sl-pager">
                <button
                  disabled={selectDisabled || loading || state.page === 0}
                  onClick={() => setPage(state.page - 1)}
                >
                  上一页
                </button>
                <span>
                  {state.page + 1} / {Math.max(1, Math.ceil(state.count / 50))}
                </span>
                <button
                  disabled={
                    selectDisabled ||
                    loading ||
                    (state.page + 1) * 50 >= state.count
                  }
                  onClick={() => setPage(state.page + 1)}
                >
                  下一页
                </button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

export function Documents({
  api,
  sources,
  readOnly,
  onChange,
  download,
  Table,
}) {
  const [edition, setEdition] = useState(null),
    [title, setTitle] = useState("");
  const candidates = sources.filter(
    (s) => s.kind === "production" && !s.archived,
  );
  const [filter, setFilter] = useState(""),
    [well, setWell] = useState(""),
    [kind, setKind] = useState("工程报告"),
    [file, pick] = useState(null),
    [busy, spin] = useState(false),
    [message, say] = useState("");
  const input = useRef(null);
  async function upload(e) {
    e.preventDefault();
    spin(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("well", well);
      body.append("category", kind);
      const r = await (
        await api("/attachments", { method: "POST", body })
      ).json();
      say(r.duplicate ? "此原件已存在" : "资料已归档");
      pick(null);
      input.current.value = "";
      onChange();
    } catch (err) {
      say(err.message);
    } finally {
      spin(false);
    }
  }
  const names = {
    attachment: "附件",
    production: "生产日报",
    master: "井基础档案",
    pipe: "地面管道",
    casing: "完井卡片",
  };
  return (
    <section>
      <div className="sl-section">
        <h2>项目资料库</h2>
        <input
          value={filter}
          type="search"
          aria-label="搜索资料"
          placeholder="文件名、井号或类别"
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <details>
        <summary>汇编生产版本</summary>
        <form
          className="sl-form"
          onSubmit={async (e) => {
            e.preventDefault();
            spin(true);
            try {
              await api(
                "/editions",
                json("POST", { sources: edition, name: title }),
              );
              onChange();
              setEdition([]);
              setTitle("");
              say("汇编版本已保存");
            } catch (err) {
              say(err.message);
            } finally {
              spin(false);
            }
          }}
        >
          <p>
            勾选至少两份生产资料。同一口井同一日期采用较晚导入版本的全部记录，区块日报按日期采用较晚版本。其他井日一并保留。
          </p>
          <div className="sl-fields">
            {candidates.map((s) => (
              <label key={s.id}>
                <span>
                  <input
                    type="checkbox"
                    checked={!!edition?.includes(s.id)}
                    onChange={(e) =>
                      setEdition(
                        e.target.checked
                          ? [...(edition || []), s.id]
                          : edition.filter((i) => i !== s.id),
                      )
                    }
                  />{" "}
                  {s.name}
                </span>
              </label>
            ))}
          </div>
          <label>
            汇编名称
            <input
              value={title}
              required
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>{" "}
          <button
            disabled={
              busy || readOnly || !title.trim() || !(edition?.length >= 2)
            }
          >
            生成汇编版本
          </button>
        </form>
      </details>
      <form className="sl-form sl-attachment" onSubmit={upload}>
        <label>
          附件类别
          <select
            disabled={readOnly}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {["工程报告", "井筒资料", "地面图纸", "化验资料", "其他资料"].map(
              (v) => (
                <option key={v}>{v}</option>
              ),
            )}
          </select>
        </label>
        <label>
          关联井号
          <input
            placeholder="可留空"
            value={well}
            disabled={readOnly}
            onChange={(e) => setWell(e.target.value)}
          />
        </label>
        <input
          type="file"
          aria-label="选择资料附件"
          ref={input}
          disabled={readOnly}
          onChange={(e) => pick(e.target.files[0])}
        />
        <button disabled={readOnly || busy || !file}>归档附件</button>
      </form>
      {message && <p role="status">{message}</p>}
      <Table
        rows={sources.filter((s) =>
          [s.name, s.well, s.category, names[s.kind]]
            .join(" ")
            .toLowerCase()
            .includes(filter.trim().toLowerCase()),
        )}
        cols={[
          ["文件名", "name"],
          ["类型", (s) => s.category || names[s.kind]],
          ["关联井号", "well"],
          ["工作表", "sheets"],
          ["当前记录", "rows_count"],
          ["状态", (s) => (s.archived ? "已收起" : "在用")],
          ["入库时间 / UTC", "imported"],
          [
            "原件",
            (s) =>
              s.has_original === 0 ? (
                "手工录入"
              ) : (
                <button onClick={() => download(s)}>下载原件</button>
              ),
          ],
          [
            "管理",
            (s) => (
              <button
                disabled={readOnly || busy}
                onClick={async () => {
                  spin(true);
                  try {
                    await api(
                      "/sources/" + s.id,
                      json("PATCH", { archived: !s.archived }),
                    );
                    onChange();
                    say(
                      s.archived ? "资料已恢复" : "资料已收起，原件与历史保留",
                    );
                  } catch (e) {
                    say(e.message);
                  } finally {
                    spin(false);
                  }
                }}
              >
                {s.archived ? "恢复资料" : "收起资料"}
              </button>
            ),
          ],
        ]}
      />
    </section>
  );
}
