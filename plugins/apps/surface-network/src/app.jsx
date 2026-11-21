import { EzWorkspace } from "./EzWorkspace.jsx";
import { DataTables } from "./MeasurementPanel.jsx";
import { Inspector } from "./Inspector.jsx";
import { Register } from "./Register.jsx";
import { Icon } from "./Icon.jsx";
import { stationPlan } from "./stationPlan.js";
import { demo, validate, scale, palette, csv } from "./model.js";
import { Diagram } from "./Diagram.jsx";
import { Spatial } from "./Spatial.jsx";
import css from "./style.css";
import drawingStyles from "./drawing.css";
const Q = window.QwenPaw,
  React = Q.host.React;
function download(name, body, type) {
  const url = URL.createObjectURL(new Blob([body], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function App() {
  const agentId = Q.host.useSelectedAgent?.()?.id ?? "default";
  return <Workbench key={agentId} agentId={agentId} />;
}
function Workbench({ agentId }) {
  const [model, setModel] = React.useState(demo),
    [view, setView] = React.useState("2D"),
    [ci, setCi] = React.useState(0);
  const [metric, setMetric] = React.useState("pressure"),
    [selected, setSelected] = React.useState("P-05"),
    [error, setError] = React.useState("");
  const [sensorTag, setSensorTag] = React.useState(null),
    [showSensors, setShowSensors] = React.useState(true);
  const [section, setSection] = React.useState(
      Q.host.fetch ? "opening" : "plan",
    ),
    [project, setProject] = React.useState(undefined),
    [registerType, setRegisterType] = React.useState("well"),
    [imported, setImported] = React.useState(null);
  const [ezFiles, setEzFiles] = React.useState([]),
    [focused, setFocused] = React.useState(false);
  const original = React.useRef(demo),
    revisions = React.useRef(new Map()),
    file = React.useRef(null),
    importSequence = React.useRef(0),
    importedRevision = React.useRef(0),
    focusButton = React.useRef(null),
    content = React.useRef(null);
  React.useEffect(() => {
    if (!Q.host.fetch) return;
    let active = true;
    async function restoreProject() {
      try {
        const r = await Q.host.fetch(
          "/surface-network/ezwalker?agent_id=" + encodeURIComponent(agentId),
        );
        if (!r.ok) throw Error("无法读取本机工区");
        const saved = await r.json();
        if (!active) return;
        setProject((current) => (current === undefined ? saved : current));
        setSection((current) =>
          current === "opening" ? (saved ? "overview" : "plan") : current,
        );
      } catch {
        if (active)
          setSection((current) =>
            current === "opening" ? "overview" : current,
          );
      }
    }
    restoreProject();
    return () => {
      active = false;
    };
  }, [agentId]);
  const pick = React.useCallback((id) => {
    setSelected(id);
    setSensorTag(null);
  }, []);
  const pickSensor = React.useCallback((s) => {
    setSelected(s.target);
    setSensorTag(s.tag);
    setShowSensors(true);
  }, []);
  function applyReadings(next) {
    revisions.current.set(original.current, next);
    setModel(next);
  }
  const navigate = React.useCallback((next) => {
    setSection(next);
    setFocused(false);
    setError("");
    if (content.current) content.current.scrollTop = 0;
  }, []);
  const changeProjectPage = React.useCallback(
    (page) => {
      navigate(page === "objects" ? "ez" : "overview");
    },
    [navigate],
  );
  function changeDrawing(next) {
    navigate("plan");
    if (original.current === next) return;
    original.current = next;
    setModel(revisions.current.get(next) ?? next);
    setCi(0);
    pick(next === demo ? "P-05" : next.pipes[0].id);
  }
  React.useEffect(() => {
    if (!focused) return;
    function escape(e) {
      if (
        e.key !== "Escape" ||
        (e.target !== window &&
          e.target !== document.body &&
          !content.current?.contains(e.target))
      )
        return;
      // Consume Escape inside the expanded drawing before the app center closes the app.
      e.preventDefault();
      e.stopImmediatePropagation();
      setFocused(false);
      focusButton.current?.focus();
    }
    window.addEventListener("keydown", escape, true);
    return () => window.removeEventListener("keydown", escape, true);
  }, [focused]);
  async function open(e) {
    const files = Array.from(e.target.files),
      f = files[0];
    e.target.value = "";
    if (!f) return;
    const seq = ++importSequence.current;
    if (files.some((v) => /\.(wlkx|wlp|db|package)$/i.test(v.name))) {
      setEzFiles(files);
      navigate("ez");
      return;
    }
    try {
      if (files.length !== 1) throw Error("请选择一个 JSON 模型");
      if (f.size > 5 * 1024 * 1024) throw Error("文件超过 5 MB");
      const next = validate(JSON.parse(await f.text()));
      if (seq !== importSequence.current) return;
      if (imported) revisions.current.delete(imported);
      importedRevision.current++;
      setImported(next);
      changeDrawing(next);
    } catch (err) {
      if (seq === importSequence.current) setError("导入失败 · " + err.message);
    }
  }
  const drawings = [
    [demo, "井场集输", "field"],
    [stationPlan, "站内工艺", "station"],
    ...(imported ? [[imported, "导入图纸", "file"]] : []),
  ];
  const drawing = drawings.find(([m]) => m === original.current);
  const drawingKey =
    original.current === imported
      ? "import-" + importedRevision.current
      : drawing[1];
  const c = model.cases[ci],
    colors = scale(model, c, metric),
    View = view === "2D" ? Diagram : Spatial;
  const plotActions = (
    <button
      ref={focusButton}
      className="sn-icon-button"
      title={focused ? "还原工作台（Esc）" : "放大图面"}
      aria-label={focused ? "还原工作台" : "放大图面"}
      aria-pressed={focused}
      onClick={() => {
        setFocused((v) => !v);
        if (content.current) content.current.scrollTop = 0;
      }}
    >
      <Icon name={focused ? "collapse" : "expand"} />
    </button>
  );
  const plan = section === "plan";
  const projectPage = section === "overview" || section === "ez";
  return (
    <main className="sn-app" aria-label="地面管网">
      <style>{css + drawingStyles}</style>
      <div className="sn-layout" data-focus={focused}>
        <div className="sn-rail">
          <div className="sn-brand">
            <span className="sn-brand-mark">
              <Icon name="network" />
            </span>
            <h1>地面管网</h1>
          </div>
          <nav className="sn-nav" aria-label="工程导航">
            <div className="sn-nav-group">
              <h2>工程图纸</h2>
              {project && (
                <button
                  aria-pressed={section === "overview"}
                  onClick={() => navigate("overview")}
                >
                  <Icon name="network" />
                  工区总图
                </button>
              )}
              {drawings.map(([m, title, icon]) => (
                <button
                  key={title}
                  aria-pressed={plan && original.current === m}
                  onClick={() => changeDrawing(m)}
                >
                  <Icon name={icon} />
                  {title}
                </button>
              ))}
            </div>
            <div className="sn-nav-group">
              <h2>工程资料</h2>
              <button
                aria-pressed={section === "ez"}
                onClick={() => navigate("ez")}
              >
                <Icon name="folder" />
                eZWalker 工区
              </button>
              <button
                aria-pressed={section === "register"}
                onClick={() => navigate("register")}
              >
                <Icon name="register" />
                设备图册
              </button>
            </div>
          </nav>
          <div className="sn-files">
            <h2>模型文件</h2>
            <input
              type="file"
              multiple
              hidden
              accept=".json,.wlkx,.wlp,.db,.package"
              aria-label="管网模型文件"
              ref={file}
              onChange={open}
            />
            <button onClick={() => file.current.click()}>
              <Icon name="upload" />
              导入模型
            </button>
            <button
              disabled={projectPage || section === "opening"}
              onClick={() =>
                download(
                  "管网模型.json",
                  JSON.stringify(model, null, 2),
                  "application/json",
                )
              }
            >
              <Icon name="download" />
              导出模型
            </button>
            <button
              disabled={projectPage || section === "opening"}
              onClick={() =>
                download(
                  c.name + "-管段.csv",
                  csv(model, c),
                  "text/csv;charset=utf-8",
                )
              }
            >
              <Icon name="table" />
              导出工况 CSV
            </button>
          </div>
        </div>
        <div className="sn-content" ref={content}>
          {error && (
            <p className="sn-notice sn-error" role="alert">
              {error}
            </p>
          )}
          {(projectPage || project) && (
            <EzWorkspace
              visible={projectPage}
              plotActions={plotActions}
              initialInfo={project}
              page={section === "ez" ? "objects" : "overview"}
              onPageChange={changeProjectPage}
              onProjectChange={setProject}
              files={ezFiles}
              onFiles={setEzFiles}
              agentId={agentId}
              model={model}
              apply={applyReadings}
            />
          )}
          {section === "opening" ? (
            <p className="sn-empty" role="status">
              正在打开本机工区…
            </p>
          ) : projectPage ? null : section === "register" ? (
            <Register initial={registerType} />
          ) : (
            <>
              <header className="sn-page-head sn-summary">
                <div>
                  <div className="sn-context">
                    <Icon name="folder" />
                    <span>{model.name}</span>
                    <span className="sn-source">{model.source}</span>
                  </div>
                  <h2>{drawing[1]}</h2>
                </div>
                <label className="sn-case">
                  运行工况
                  <select value={ci} onChange={(e) => setCi(+e.target.value)}>
                    {model.cases.map((s, i) => (
                      <option value={i} key={i}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
              </header>
              <div className="sn-grid">
                <section className="sn-panel sn-plot" aria-label="管网视图">
                  <header className="sn-plot-head">
                    <div className="sn-tabs" role="group" aria-label="图纸视图">
                      {[
                        ["2D", "二维工艺图", "diagram"],
                        ["3D", "三维空间图", "cube"],
                      ].map(([v, t, icon]) => (
                        <button
                          key={v}
                          aria-pressed={v === view}
                          onClick={() => setView(v)}
                        >
                          <Icon name={icon} />
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="sn-plot-tools">
                      <label className="sn-meas-toggle">
                        <input
                          type="checkbox"
                          checked={showSensors}
                          onChange={(e) => setShowSensors(e.target.checked)}
                        />
                        测点位号
                      </label>
                      <select
                        aria-label="管段着色"
                        value={metric}
                        onChange={(e) => setMetric(e.target.value)}
                      >
                        <option value="pressure">平均端压</option>
                        <option value="flow">流量绝对值</option>
                      </select>
                      {plotActions}
                    </div>
                  </header>
                  <div className="sn-canvas">
                    <View
                      key={drawingKey}
                      {...{
                        model,
                        c,
                        colors,
                        selected,
                        onPick: pick,
                        showSensors,
                        sensorTag,
                        onSensor: pickSensor,
                      }}
                    />
                  </div>
                  <div className="sn-legend">
                    <div>
                      <span>
                        {metric === "pressure"
                          ? "平均端压 / MPa(a)"
                          : "流量 / 万标方·日⁻¹"}
                      </span>
                      <b>{colors.lo.toFixed(2)}</b>
                      <i>
                        {palette.map((v) => (
                          <u key={v} style={{ background: v }} />
                        ))}
                      </i>
                      <b>{colors.hi.toFixed(2)}</b>
                    </div>
                    <span>
                      {view === "2D"
                        ? "箭头示流向 · 虚线示停流"
                        : "局部 ENU（m） · 拖动旋转 / 滚轮缩放"}
                    </span>
                  </div>
                </section>
                <Inspector
                  {...{ model, c, selected, sensorTag, pick }}
                  openRegister={(type) => {
                    setRegisterType(type);
                    navigate("register");
                  }}
                />
              </div>
              <DataTables
                key={drawingKey}
                {...{
                  model,
                  c,
                  selected,
                  onPick: pick,
                  sensorTag,
                  onSensor: pickSensor,
                  apply: applyReadings,
                  download,
                }}
              />
              <footer className="sn-sheet-footer">
                <span>
                  {model.nodes.length} 个节点 · {model.pipes.length} 条管段
                </span>
                <span>气量标况　{model.standard}</span>
              </footer>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
Q.registerRoutes("surface-network", [
  {
    path: "/apps/surface-network",
    component: App,
    label: "地面管网",
    icon: "◇",
  },
]);
