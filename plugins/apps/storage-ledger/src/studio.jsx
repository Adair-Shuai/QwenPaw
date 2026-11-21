import { Icon, names, fmt, Table, useLoad } from "./common.jsx";
import { saveFile } from "./projects.jsx";
import { RecordManager, Documents } from "./records.jsx";
import { FieldMap } from "./fieldMap.jsx";
import { WellDocument } from "./wellDocument.jsx";
import { Operations } from "./operations.jsx";
import { Surface } from "./surface.jsx";
import { Explorer, Inspector } from "./docks.jsx";
const React = window.QwenPaw.host.React;
const initial = { type: "map", key: "map" },
  empty = { wells: [], stations: [], pipes: [] };
const tools = ["map", "surface", "balance", "quality", "data", "files"];
const keyOf = (o) =>
  o.type === "pipe"
    ? JSON.stringify([o.type, o.src, o.row_no])
    : o.type === "well" || o.type === "station"
    ? JSON.stringify([o.type, o.name])
    : o.type;
export function Studio({ project, apiHost, close, css }) {
  const api = React.useCallback(
    (path, options = {}) =>
      apiHost(path, {
        ...options,
        headers: { ...options.headers, "X-Ledger-Project": project.id },
      }),
    [project.id, apiHost],
  );
  const [tabs, setTabs] = React.useState([initial]),
    [active, activate] = React.useState(initial.key),
    [src, version] = React.useState(""),
    [revision, revise] = React.useState(0);
  const [left, leftPanel] = React.useState(null),
    [right, rightPanel] = React.useState(null),
    [width, resize] = React.useState(1200),
    [full, focus] = React.useState(false);
  const [picks, setPicks] = React.useState({}),
    [message, say] = React.useState(""),
    [error, fail] = React.useState(""),
    [busy, spin] = React.useState(false);
  const root = React.useRef(null),
    file = React.useRef(null),
    tabsBar = React.useRef(null);
  const baseState = useLoad(
      api,
      "/workspace?" + (src ? "src=" + src : ""),
      revision,
    ),
    base = baseState.data;
  const index = useLoad(
      api,
      base ? "/objects" + (base.src ? "?src=" + base.src : "") : "",
      revision,
    ),
    objects = index.data || empty;
  const doc = tabs.find((t) => t.key === active) || initial;
  const showLeft = left ?? width >= 680,
    showRight = right ?? width >= 1090;
  const selected =
    picks[active] ||
    (["well", "station", "pipe"].includes(doc.type)
      ? doc
      : { type: "project" });
  React.useEffect(() => {
    if (!root.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) =>
      resize(entries[0].contentRect.width),
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  React.useEffect(() => {
    if (!full) return;
    function exit(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        focus(false);
      }
    }
    window.addEventListener("keydown", exit, true);
    return () => window.removeEventListener("keydown", exit, true);
  }, [full]);
  React.useEffect(() => {
    const tab = tabsBar.current?.querySelector('[aria-selected="true"]');
    tab?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [active]);
  function open(spec) {
    const key = keyOf(spec),
      hasTarget = spec.day || spec.date;
    setTabs((prev) => {
      const old = prev.find((d) => d.key === key);
      if (!old) return [...prev, { ...spec, key }];
      return hasTarget
        ? prev.map((d) =>
            d.key === key ? { ...d, ...spec, jump: (d.jump || 0) + 1 } : d,
          )
        : prev;
    });
    if (["well", "station", "pipe"].includes(spec.type))
      setPicks((p) => ({ ...p, [key]: spec }));
    if (spec.well && spec.type === "quality")
      setPicks((p) => ({ ...p, [key]: { type: "well", name: spec.well } }));
    activate(key);
    if (width < 680) leftPanel(false);
    if (width < 960) rightPanel(false);
  }
  function remove(d) {
    const remaining = tabs.filter((t) => t.key !== d.key);
    if (d.key === active)
      activate(remaining[Math.max(0, tabs.indexOf(d) - 1)]?.key || initial.key);
    setTabs(remaining.length ? remaining : [initial]);
    setPicks((p) => {
      const next = { ...p };
      delete next[d.key];
      return next;
    });
  }
  function inspect(s) {
    setPicks((p) => ({ ...p, [active]: s }));
    rightPanel(true);
    if (width < 680) leftPanel(false);
  }
  function update(changes) {
    setTabs((prev) =>
      prev.map((d) => (d.key === active ? { ...d, ...changes } : d)),
    );
  }
  const refresh = () => revise((n) => n + 1);
  async function download(s) {
    try {
      await saveFile(await api(s.id ? "/sources/" + s.id : "/sample"), s.name);
    } catch (e) {
      fail(e.message);
    }
  }
  async function upload(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    spin(true);
    fail("");
    say("");
    try {
      const body = new FormData();
      body.append("file", f);
      const r = await (await api("/imports", { method: "POST", body })).json();
      say(
        r.duplicate
          ? "该版本已经入库。"
          : f.name + " · 已导入 " + fmt(r.count) + " 条记录",
      );
      if (r.kind === "production") version(String(r.id));
      refresh();
    } catch (e) {
      fail(e.message);
    } finally {
      spin(false);
    }
  }
  function changeVersion(value) {
    version(value);
    setPicks({});
    setTabs((items) =>
      items.map((d) => ({ ...d, well: d.type === "quality" ? "" : d.well })),
    );
  }
  const fileChange = () => {
    version("");
    refresh();
  };
  function tabKeys(e) {
    const pos = tabs.findIndex((t) => t.key === active);
    const step = {
      ArrowLeft: (pos - 1 + tabs.length) % tabs.length,
      ArrowRight: (pos + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    activate(tabs[step].key);
    tabsBar.current.querySelectorAll('[role="tab"]')[step].focus();
  }
  const tabTools = (t) => ({
    doc: t,
    project,
    api,
    base,
    objects,
    revision,
    open,
    inspect,
    download,
    onChange: refresh,
    update,
  });
  function renderDoc(t) {
    const props = tabTools(t);
    if (t.type === "map")
      return (
        <FieldMap
          {...props}
          selected={picks[t.key]}
          importFile={() => file.current.click()}
          readOnly={project.archived > 0}
        />
      );
    if (t.type === "well")
      return (
        <WellDocument
          {...props}
          well={objects.wells.find((w) => w.name === t.name)}
        />
      );
    if (["surface", "pipe", "station"].includes(t.type))
      return <Surface {...props} />;
    if (["balance", "quality"].includes(t.type))
      return <Operations {...props} />;
    if (t.type === "data")
      return (
        <div className="se-paper">
          <RecordManager
            api={api}
            sources={base.sources}
            generation={revision}
            readOnly={project.archived}
            onChange={refresh}
            inspect={inspect}
          />
        </div>
      );
    return (
      <div className="se-paper">
        <Documents
          api={api}
          sources={base.sources}
          readOnly={project.archived}
          onChange={fileChange}
          download={download}
          Table={Table}
        />
      </div>
    );
  }
  const issueCount = base?.issues?.filter((i) => i.selected == null).length;
  const production =
    base?.sources.filter((s) => s.kind === "production" && !s.archived) || [];
  return (
    <main
      ref={root}
      className={"sl-app se-studio" + (full ? " se-focus" : "")}
      aria-label="储气库工程项目"
    >
      <style>{css}</style>
      <header className="se-titlebar">
        <div className="se-appmark">
          <Icon name="well" />
        </div>
        <div className="se-titletext">
          <small>储气库数据管理</small>
          <h1>{project.name}</h1>
        </div>
        <div className="se-title-actions">
          <button onClick={close}>
            <Icon name="project" /> 项目库
          </button>
          <button
            title={full ? "退出专注视图（Esc）" : "专注视图"}
            aria-label={full ? "退出专注视图" : "专注视图"}
            aria-pressed={full}
            onClick={() => focus(!full)}
          >
            <Icon name="focus" />
          </button>
        </div>
      </header>
      <div className="se-ribbon" aria-label="工程命令">
        <div className="se-command-group">
          <button
            className="se-import"
            disabled={busy || project.archived > 0}
            onClick={() => file.current.click()}
          >
            <Icon name="import" />
            {busy ? "导入中…" : "导入工作簿"}
          </button>
        </div>
        <div className="se-command-group">
          {tools.map((t) => (
            <button
              key={t}
              onClick={() => open({ type: t })}
              className={doc.type === t ? "selected" : ""}
            >
              <Icon name={t} />
              {names[t]}
            </button>
          ))}
        </div>
        <div className="se-command-group se-dock-tools">
          <button
            aria-label="项目浏览器开关"
            title="项目浏览器"
            aria-pressed={showLeft}
            onClick={() => {
              leftPanel(!showLeft);
              if (width < 680) rightPanel(false);
            }}
          >
            <Icon name="panel" />
          </button>
          <button
            aria-label="属性窗格开关"
            title="属性与来源"
            aria-pressed={showRight}
            onClick={() => {
              rightPanel(!showRight);
              if (width < 680) leftPanel(false);
            }}
          >
            <Icon name="inspector" />
          </button>
        </div>
      </div>
      <input
        type="file"
        ref={file}
        hidden
        aria-label="导入工作簿文件"
        accept=".xls,.xlsx"
        onChange={upload}
      />
      {(error || baseState.error || index.error) && (
        <div className="sl-alert se-notice" role="alert">
          {error || baseState.error || index.error}
          <button
            onClick={() => {
              fail("");
              refresh();
            }}
          >
            刷新
          </button>
        </div>
      )}
      {message && (
        <div className="se-notice" role="status">
          {message}
          <button aria-label="关闭提示" onClick={() => say("")}>
            ×
          </button>
        </div>
      )}
      <div
        className={
          "se-workarea" +
          (showLeft ? " has-tree" : "") +
          (showRight ? " has-props" : "")
        }
      >
        {showLeft && (
          <Explorer objects={objects} open={open} selected={selected} />
        )}
        <section className="se-editor">
          <div
            className="se-tabbar"
            ref={tabsBar}
            role="tablist"
            aria-label="已打开的工程文档"
          >
            {tabs.map((t) => (
              <span key={t.key} className={t.key === active ? "active" : ""}>
                <button
                  role="tab"
                  tabIndex={t.key === active ? 0 : -1}
                  aria-selected={t.key === active}
                  onKeyDown={tabKeys}
                  onClick={() => activate(t.key)}
                >
                  <Icon name={t.type} />
                  {t.name || names[t.type]}
                </button>
                {(tabs.length > 1 || t.type !== "map") && (
                  <button
                    className="se-close"
                    aria-label={"关闭 " + (t.name || names[t.type])}
                    onClick={() => remove(t)}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {base ? (
            tabs.map((t) => (
              <div
                key={t.key}
                className="se-document"
                role="tabpanel"
                aria-label={t.name || names[t.type]}
                hidden={t.key !== active}
              >
                {!index.data &&
                !index.error &&
                ["map", "well", "surface", "pipe", "station"].includes(
                  t.type,
                ) ? (
                  <div className="se-loading">正在读取工程对象…</div>
                ) : (
                  renderDoc(t)
                )}
              </div>
            ))
          ) : (
            <div className="se-loading">
              {baseState.error ? "工程数据读取失败" : "正在打开工程数据库…"}
            </div>
          )}
        </section>
        {showRight && base && (
          <Inspector
            selected={selected}
            objects={objects}
            base={base}
            api={api}
            revision={revision}
            project={project}
            inspect={inspect}
            open={open}
            download={download}
            close={() => rightPanel(false)}
          />
        )}
      </div>
      <footer className="se-status">
        <strong>
          <i />
          {project.archived ? "归档只读" : "项目已打开"}
        </strong>
        <label>
          生产版本{" "}
          <select
            aria-label="生产数据版本"
            value={base?.src || ""}
            disabled={!production.length || busy}
            onChange={(e) => changeVersion(e.target.value)}
          >
            {!production.length && <option value="">尚无日报</option>}
            {production.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <span>{issueCount == null ? "" : issueCount + " 组待复核"}</span>
      </footer>
    </main>
  );
}
