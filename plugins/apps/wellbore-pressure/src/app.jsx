import { DEFAULTS, FIELDS, MODELS, parameterErrors } from "./model.mjs";
import { workbook, download } from "./export.mjs";
import {
  VERSION,
  INTERVALS,
  computeScenario,
  sampledScenario,
  encodeScenario,
  decodeScenario,
  changedFields,
} from "./scenario.mjs";
import {
  uniformStructure,
  normalizeStructure,
  parseStructure,
  structureCSV,
  verticalDepth,
  sectionAtDepth,
} from "./structure.mjs";
import { fmt } from "./ui-utils.mjs";
import Chart from "./chart.jsx";
import CSS from "./workbench.css";
import {
  buildTrajectory,
  trajectoryAt,
  EXAMPLE_SURVEY,
  surveyCSV,
} from "./survey.mjs";
import { readSurveyFile } from "./survey-file.mjs";
import TrajectoryView, { TrajectoryMini } from "./trajectory-view.jsx";
const Q = window.QwenPaw,
  React = Q.host.React;
const { useState, useRef, useMemo } = React;
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function Numeric({
  label,
  unit,
  value,
  onChange,
  error,
  name,
  scale = 1,
  ...attrs
}) {
  const shown =
    typeof value === "number" && Number.isFinite(value)
      ? Number((value * scale).toPrecision(12))
      : value;
  return (
    <label className="wp-field">
      <span className="wp-field-title">
        {label}
        <span className="wp-unit">{unit}</span>
      </span>
      <input
        type="number"
        step="any"
        name={name}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? `wp-error-${name}` : undefined}
        value={shown}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value) / scale)
        }
        {...attrs}
      />
      {error && (
        <span id={`wp-error-${name}`} className="wp-field-error">
          {error}
        </span>
      )}
    </label>
  );
}
function Schematic({ segments, depth }) {
  let start = 0;
  const maxD = Math.max(...segments.map((s) => s.diameter));
  const colors = ["#377db6", "#278d98", "#7198b7", "#5787a6"];
  return (
    <aside className="wp-schematic" aria-label="井身结构示意">
      <h3>井身结构</h3>
      <div className="wp-sub">{segments.length} 个井段 · MD</div>
      <svg
        viewBox="0 0 150 490"
        role="img"
        aria-label="按内径缩放的井身结构展开图"
      >
        <rect x="0" y="0" width="150" height="490" fill="#fbfdff" />
        <line
          x1="65"
          x2="65"
          y1="30"
          y2="440"
          stroke="#d9e4ed"
          strokeDasharray="3 3"
        />
        <text x="65" y="17" textAnchor="middle" fill="#8296a8" fontSize="10">
          井口 · 0 m
        </text>
        {segments.map((s, i) => {
          const from = start;
          start = s.end;
          const y = 30 + (from / depth) * 410,
            h = ((s.end - from) / depth) * 410,
            w = 28 + (54 * s.diameter) / maxD;
          return (
            <g key={i}>
              <title>
                {s.name}：{from}～{s.end} m，内径 {s.diameter * 1000} mm，夹角{" "}
                {s.angle}°
              </title>
              <rect
                x={65 - w / 2}
                y={y}
                width={w}
                height={Math.max(h, 1)}
                fill={colors[i % 4]}
                fillOpacity=".13"
                stroke={colors[i % 4]}
                strokeWidth="1.7"
              />
              <line
                x1={65 - w / 2 + 4}
                x2={65 - w / 2 + 4}
                y1={y}
                y2={y + h}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x="65"
                y={y + h / 2 - 2}
                textAnchor="middle"
                fill={colors[i % 4]}
                fontSize="11"
                fontWeight="600"
              >
                Ø {fmt(s.diameter * 1000, 0)}
              </text>
              {h > 55 && (
                <text
                  x="65"
                  y={y + h / 2 + 14}
                  textAnchor="middle"
                  fill="#7a93a7"
                  fontSize="9"
                >
                  {fmt(s.angle, 0)}°
                </text>
              )}
              <line x1="110" x2="117" y1={y + h} y2={y + h} stroke="#9bb0c1" />
              <text x="120" y={y + h + 3} fill="#8ba1b3" fontSize="8">
                {fmt(s.end, 0)}
              </text>
            </g>
          );
        })}
        <text x="65" y="463" textAnchor="middle" fill="#61849d" fontSize="10">
          井底 {fmt(depth, 0)} m
        </text>
        <text x="65" y="480" textAnchor="middle" fill="#91a5b5" fontSize="9">
          内径 / mm
        </text>
      </svg>
      <div className="wp-schematic-note">
        沿测深展开，横向放大。
        <br />
        垂深约 {fmt(verticalDepth(segments), 1)} m<br />
        不表示实际井眼轨迹。
      </div>
    </aside>
  );
}
function Table({ headers, rows }) {
  return (
    <div className="wp-table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function App() {
  const [params, setParams] = useState({ ...DEFAULTS }),
    [model, setModel] = useState(MODELS[0]),
    [gridFactor, setGridFactor] = useState(1),
    [interval, setInterval] = useState(100);
  const [mode, setMode] = useState("uniform"),
    [segments, setSegments] = useState(() => uniformStructure(DEFAULTS));
  const [survey, setSurvey] = useState(null),
    [temperatureBasis, setTemperatureBasis] = useState("tvd"),
    [readingSurvey, setReadingSurvey] = useState(false);
  const surveyRef = useRef(null);
  const [snapshot, setSnapshot] = useState(() =>
    computeScenario(DEFAULTS, MODELS[0]),
  );
  const [view, setView] = useState("chart"),
    [metric, setMetric] = useState("pressure"),
    [table, setTable] = useState("profile"),
    [compare, setCompare] = useState(true),
    [baseline, setBaseline] = useState(null);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [showErrors, setShowErrors] = useState(false),
    [exporting, setExporting] = useState(false);
  const fileRef = useRef(null),
    structureRef = useRef(null),
    formRef = useRef(null);
  const displayed = useMemo(
    () => sampledScenario(snapshot, interval),
    [snapshot, interval],
  );
  const { result, comparison, quality } = displayed;
  const resultGeometry = useMemo(
    () => (result.survey ? buildTrajectory(result.survey) : null),
    [result.survey],
  );
  const structure = mode === "segmented" ? segments : null;
  const stale =
    FIELDS.some(([k]) => params[k] !== result.params[k]) ||
    model !== result.model ||
    gridFactor !== snapshot.gridFactor ||
    !equal(structure, snapshot.structure) ||
    !equal(survey, snapshot.survey) ||
    (survey && temperatureBasis !== snapshot.temperatureBasis);
  const errors = showErrors ? parameterErrors(params) : {};
  const clear = () => {
    setError("");
    setNotice("");
  };
  function update(k, v) {
    setParams((p) => ({ ...p, [k]: v }));
    clear();
  }
  function run(e) {
    e?.preventDefault();
    setShowErrors(true);
    try {
      const next = computeScenario(
        params,
        model,
        gridFactor,
        structure,
        survey,
        temperatureBasis,
      );
      setSnapshot(next);
      setParams(next.result.params);
      if (next.structure) setSegments(next.structure);
      setError("");
      setNotice("计算完成，井身结构与结果已同步。");
    } catch (e) {
      setError(e.message);
      setNotice("");
      const k = Object.keys(parameterErrors(params))[0];
      if (k)
        formRef.current
          ?.closest(".wp-app")
          ?.querySelector(`[name="${k}"]`)
          ?.focus();
    }
  }
  function reset() {
    setParams({ ...DEFAULTS });
    setModel(MODELS[0]);
    setGridFactor(1);
    setInterval(100);
    setMode("uniform");
    setSegments(uniformStructure(DEFAULTS));
    setSnapshot(computeScenario(DEFAULTS, MODELS[0]));
    setBaseline(null);
    setSurvey(null);
    setTemperatureBasis("tvd");
    setShowErrors(false);
    setError("");
    setNotice("已恢复单井段示例。");
  }
  function switchMode(next) {
    if (next === mode) return;
    if (next === "segmented") setSegments(uniformStructure(params));
    else {
      const s = segments[0];
      setParams((p) => ({
        ...p,
        diameter: s.diameter,
        angle: s.angle,
        roughness: s.roughness,
      }));
    }
    setMode(next);
    clear();
  }
  function editSegment(i, k, v) {
    setSegments((s) => s.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
    clear();
  }
  function addSegment() {
    try {
      const list = normalizeStructure(segments, params.depth),
        last = list.at(-1),
        start = list.length > 1 ? list.at(-2).end : 0;
      if (list.length >= 30) throw new Error("最多支持30个井段。");
      if (last.end - start < 0.2)
        throw new Error("最后井段过短，无法继续拆分。");
      setSegments([
        ...list.slice(0, -1),
        { ...last, end: Math.round(((start + last.end) / 2) * 10000) / 10000 },
        { ...last, name: `井段 ${list.length + 1}` },
      ]);
      clear();
    } catch (e) {
      setError(e.message);
    }
  }
  function removeSegment(i) {
    if (segments.length === 1) return;
    setSegments((list) => {
      const next = list.filter((_, j) => i !== j).map((s) => ({ ...s }));
      if (i === list.length - 1) next.at(-1).end = params.depth;
      return next;
    });
    clear();
  }
  function example() {
    const d = Number(params.depth);
    if (!(d >= 1 && d <= 10000)) {
      setError("请先设置有效的总井深。");
      return;
    }
    setMode("segmented");
    setSegments([
      {
        name: "上部井段",
        end: d * 0.3,
        diameter: 0.114,
        angle: 90,
        roughness: 1e-5,
      },
      {
        name: "中部井段",
        end: d * 0.7,
        diameter: 0.089,
        angle: 75,
        roughness: 1e-5,
      },
      { name: "下部井段", end: d, diameter: 0.076, angle: 60, roughness: 1e-5 },
    ]);
    setNotice("已填入三段示例，点击计算应用新结构。");
    setError("");
  }
  function applySurvey(stations) {
    const trajectory = buildTrajectory(stations),
      depth = trajectory.depth;
    if (mode === "segmented") {
      const adjusted = segments.map((s, i) =>
        i === segments.length - 1 ? { ...s, end: depth } : s,
      );
      normalizeStructure(adjusted, depth);
      setSegments(adjusted);
    }
    setSurvey(trajectory.survey);
    setParams((p) => ({ ...p, depth }));
    setTemperatureBasis("tvd");
    setError("");
    setView("trajectory");
    setNotice(
      `已导入${stations.length}个测点，总测深同步为${depth} m；点击计算生成轨迹和压力。`,
    );
  }
  async function importSurvey(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setReadingSurvey(true);
    try {
      applySurvey(await readSurveyFile(file));
    } catch (error) {
      setError("井斜导入失败：" + error.message);
    } finally {
      setReadingSurvey(false);
    }
  }
  function surveyExample() {
    try {
      applySurvey(EXAMPLE_SURVEY);
    } catch (e) {
      setError(e.message);
    }
  }
  function surveyTemplate() {
    download(
      surveyCSV(EXAMPLE_SURVEY),
      "井斜数据模板.csv",
      "text/csv;charset=utf-8",
    );
    setNotice(
      "模板已下载：MD为米，Inc从垂直向下计，Azi从数据北向顺时针计，角度单位为度。",
    );
  }
  async function load(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      if (f.size > 100000) throw new Error("方案文件超过100 KB。");
      const d = decodeScenario(JSON.parse(await f.text()));
      const next = computeScenario(
        d.parameters,
        d.model,
        d.gridFactor,
        d.structure || null,
        d.survey || null,
        d.temperatureBasis || "md",
      );
      setParams(next.result.params);
      setSurvey(d.survey || null);
      setTemperatureBasis(d.temperatureBasis || "md");
      setModel(d.model);
      setGridFactor(d.gridFactor);
      setInterval(d.interval);
      setMode(d.structure ? "segmented" : "uniform");
      setSegments(d.structure || uniformStructure(d.parameters));
      setSnapshot(next);
      setError("");
      setShowErrors(false);
      setNotice("方案已载入并重新计算。");
    } catch (e) {
      setError("载入失败：" + e.message);
    }
  }
  async function importStructure(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      if (f.size > 100000) throw new Error("结构文件超过100 KB。");
      const list = parseStructure(await f.text(), params.depth);
      setSegments(list);
      setMode("segmented");
      setError("");
      setNotice(`已导入 ${list.length} 个井段，点击计算应用结构。`);
    } catch (e) {
      setError("结构导入失败：" + e.message);
    }
  }
  function template() {
    try {
      const list = normalizeStructure(
        mode === "segmented" ? segments : uniformStructure(params),
        params.depth,
      );
      download(
        structureCSV(list),
        "井身结构模板.csv",
        "text/csv;charset=utf-8",
      );
      setNotice("结构模板已导出：测深m、内径mm、夹角度、粗糙度mm。");
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  async function excel() {
    setExporting(true);
    try {
      download(
        await workbook(result, comparison, { interval, quality, baseline }),
        "井筒压力_" + result.model + ".xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      setNotice("Excel已导出，包含井身结构、完整剖面和计算检查。");
    } catch (e) {
      setError("导出失败：" + e.message);
    } finally {
      setExporting(false);
    }
  }
  function csv() {
    if (table === "structure") {
      download(
        structureCSV(result.segments),
        "井身结构.csv",
        "text/csv;charset=utf-8",
      );
      setNotice("井身结构CSV已导出，可重新导入。");
      return;
    }
    if (table === "survey") {
      if (!result.survey) return;
      download(
        surveyCSV(result.survey),
        "井斜数据.csv",
        "text/csv;charset=utf-8",
      );
      setNotice("原始井斜测点CSV已导出，可重新导入。");
      return;
    }
    if (table === "trajectory") {
      if (!result.survey) return;
      const geometry = buildTrajectory(result.survey);
      const rows = [
        [
          "MD_m",
          "TVD_m",
          "North_m",
          "East_m",
          "Inc_deg",
          "Azi_deg",
          "Pressure_MPa",
        ],
        ...result.samples.map((r) => {
          const p = trajectoryAt(geometry, r[0]);
          return [r[0], p.tvd, p.north, p.east, p.inc, p.azi, r[1]];
        }),
      ];
      download(
        "\uFEFF" + rows.map((r) => r.join(",")).join("\r\n"),
        "井轨迹压力剖面.csv",
        "text/csv;charset=utf-8",
      );
      setNotice("井轨迹与压力数据已导出。");
      return;
    }
    if (table === "baseline" && !baseline) return;
    const rows =
      table === "baseline"
        ? [
            ["比较项目", "固定基准", "当前结果"],
            ["井底压力_MPa", baseline.bottom, result.bottom],
            ["摩阻压差_MPa", baseline.friction, result.friction],
            ["模型", baseline.model, result.model],
            ["井段数", baseline.segments.length, result.segments.length],
            ...FIELDS.map(([k, l]) => [
              l,
              baseline.params[k],
              result.params[k],
            ]),
          ]
        : [
            profileHeaders,
            ...result.samples.map((r) => [
              r[0],
              result.segments[sectionAtDepth(result.segments, r[0])].name,
              ...r.slice(1),
            ]),
          ];
    download(
      "\uFEFF" +
        rows
          .map((r) =>
            r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
          )
          .join("\r\n"),
      table === "baseline" ? "井筒工况对比.csv" : `井筒压力_${interval}m.csv`,
      "text/csv;charset=utf-8",
    );
    setNotice("当前数据表CSV已导出。");
  }
  function save() {
    download(
      JSON.stringify(encodeScenario(snapshot, interval), null, 2),
      "井筒压力_计算方案.json",
      "application/json",
    );
    setNotice("方案已保存，含井身结构、网格和采样设置。");
  }
  function pin() {
    setBaseline(result);
    setNotice("已固定当前结果，修改参数或井身结构并计算后可比较。");
  }
  const delta = result.bottom - result.params.pressure;
  const changes = baseline ? changedFields(baseline.params, result.params) : [];
  const structureChanged =
    baseline && !equal(baseline.segments, result.segments);
  const geometryFields = [
    ["diameter", "油管内径", "mm", 1000],
    ["angle", "与水平面夹角", "°", 1],
    ["roughness", "管壁粗糙度", "mm", 1000],
  ];
  const profileHeaders = [
    "井深 / m",
    "井段",
    "压力 / MPa",
    "温度 / K",
    "密度 / kg·m⁻³",
    "流速 / m·s⁻¹",
    "摩阻 / kPa·m⁻¹",
    "重力 / kPa·m⁻¹",
  ];
  let from = 0;
  const sectionRows = result.segments.map((s) => {
    const r = [
      s.name,
      fmt(from, 1),
      fmt(s.end, 1),
      fmt(s.diameter * 1000, 2),
      fmt(s.angle, 1),
      fmt(s.roughness * 1000, 4),
    ];
    from = s.end;
    return r;
  });
  return (
    <main className="wp-app">
      <style>{CSS}</style>
      <div className="wp-shell">
        <header className="wp-top">
          <div className="wp-brand">
            <div className="wp-logo" aria-hidden="true">
              ↧
            </div>
            <div>
              <div className="wp-eyebrow">UGSCI · WELLBORE WORKBENCH</div>
              <h1>井筒压力计算</h1>
              <div className="wp-sub">
                配置井筒与井身结构，查看沿井深的流动变化
              </div>
            </div>
          </div>
          <div className="wp-toolbar">
            <span className="wp-badge">本地计算</span>
            <button onClick={() => fileRef.current.click()}>载入方案</button>
            <button disabled={stale} onClick={save}>
              保存方案
            </button>
            <input
              className="wp-hidden"
              type="file"
              ref={fileRef}
              accept=".json,application/json"
              onChange={load}
              aria-label="载入计算方案文件"
            />
          </div>
        </header>
        {(error || notice || stale) && (
          <div
            className={`wp-notice ${
              error ? "wp-error" : stale ? "wp-stale" : ""
            }`}
            role={error ? "alert" : "status"}
          >
            {error ||
              (stale
                ? "参数、结构或井斜已修改，右侧保留上次结果。点击计算更新。"
                : notice)}
          </div>
        )}
        <div className="wp-layout">
          <aside className="wp-left">
            <section className="wp-panel" aria-label="井筒参数设置">
              <div className="wp-panel-head">
                <h2>
                  <span className="wp-index">01 / </span>井筒参数
                </h2>
                <button className="wp-link" onClick={reset}>
                  恢复示例
                </button>
              </div>
              <form ref={formRef} className="wp-form" onSubmit={run} noValidate>
                <label className="wp-field">
                  <span className="wp-field-title">计算模型</span>
                  <select
                    aria-label="计算模型"
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value);
                      clear();
                    }}
                  >
                    {MODELS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <label className="wp-field">
                  <span className="wp-field-title">计算精度</span>
                  <select
                    aria-label="网格模式"
                    value={gridFactor}
                    onChange={(e) => {
                      setGridFactor(Number(e.target.value));
                      clear();
                    }}
                  >
                    <option value="1">标准网格</option>
                    <option value="2">加密网格（2倍）</option>
                  </select>
                </label>
                {FIELDS.filter(
                  ([k]) => !["diameter", "roughness", "angle"].includes(k),
                ).map(([k, l, u, min, max]) => (
                  <Numeric
                    key={k}
                    label={k === "depth" ? "总井深（测深）" : l}
                    unit={u}
                    name={k}
                    value={params[k]}
                    error={errors[k]}
                    min={min}
                    max={max}
                    onChange={(v) => update(k, v)}
                  />
                ))}
                {survey ? (
                  <label className="wp-field">
                    <span className="wp-field-title">地温梯度基准</span>
                    <select
                      aria-label="地温梯度基准"
                      value={temperatureBasis}
                      onChange={(e) => {
                        setTemperatureBasis(e.target.value);
                        clear();
                      }}
                    >
                      <option value="tvd">按垂深TVD</option>
                      <option value="md">按测深MD（旧版）</option>
                    </select>
                  </label>
                ) : (
                  <div className="wp-field">
                    <div className="wp-field-title">
                      温度换算<span className="wp-unit">°C</span>
                    </div>
                    <div style={{ padding: "7px 0", color: "#7b91a6" }}>
                      {Number.isFinite(params.temperature)
                        ? fmt(params.temperature - 273.15, 2)
                        : "—"}{" "}
                      °C
                    </div>
                  </div>
                )}
                <div className="wp-wide wp-calc-footer">
                  <span className="wp-hint">
                    绝对压力 · 单气相采气
                    <br />
                    每次计算同时执行网格加密检查
                  </span>
                  <button type="submit" className="wp-primary">
                    计算井筒压力 <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            </section>
            <section
              className="wp-panel wp-structure"
              aria-label="井身结构设置"
            >
              <div className="wp-panel-head">
                <h2>
                  <span className="wp-index">02 / </span>井身结构
                </h2>
                <span className="wp-sub">
                  {mode === "segmented" ? segments.length : 1} 个井段
                </span>
              </div>
              <div className="wp-structure-tools">
                <div className="wp-modes" aria-label="井身结构模式">
                  <button
                    aria-pressed={mode === "uniform"}
                    onClick={() => switchMode("uniform")}
                  >
                    统一井筒
                  </button>
                  <button
                    aria-pressed={mode === "segmented"}
                    onClick={() => switchMode("segmented")}
                  >
                    分段结构
                  </button>
                </div>
                <div className="wp-toolbar">
                  <button
                    className="wp-import"
                    onClick={() => structureRef.current.click()}
                  >
                    导入结构
                  </button>
                  <button className="wp-link" onClick={template}>
                    CSV模板
                  </button>
                </div>
                <input
                  className="wp-hidden"
                  type="file"
                  ref={structureRef}
                  accept=".csv,.json,text/csv,application/json"
                  onChange={importStructure}
                  aria-label="导入井身结构文件"
                />
              </div>
              <div className="wp-survey-box">
                <div className="wp-survey-heading">
                  <strong>井斜数据</strong>
                  <div className="wp-toolbar">
                    <button
                      disabled={readingSurvey}
                      className="wp-import"
                      onClick={() => surveyRef.current.click()}
                    >
                      {readingSurvey ? "读取中…" : "导入井斜"}
                    </button>
                    <button className="wp-link" onClick={surveyTemplate}>
                      井斜模板
                    </button>
                    <button className="wp-link" onClick={surveyExample}>
                      示例
                    </button>
                  </div>
                </div>
                <input
                  ref={surveyRef}
                  className="wp-hidden"
                  type="file"
                  accept=".csv,.tsv,.json,.xlsx,.xls"
                  onChange={importSurvey}
                  aria-label="导入井斜数据文件"
                />
                {survey ? (
                  <div className="wp-survey-loaded">
                    <span>
                      {survey.length}测点 · MD {fmt(survey.at(-1).md, 0)} m ·
                      最大Inc {fmt(Math.max(...survey.map((s) => s.inc)), 1)}°
                    </span>
                    <button
                      className="wp-link"
                      onClick={() => {
                        setSurvey(null);
                        clear();
                      }}
                    >
                      清除井斜
                    </button>
                  </div>
                ) : (
                  <p className="wp-hint">
                    CSV / JSON / XLSX · MD(m)、Inc(°)、Azi(°)
                  </p>
                )}
                <p className="wp-hint">
                  {survey
                    ? "倾角使用井斜数据；下方结构设置内径与粗糙度。"
                    : "Inc从垂直向下计（0°垂直、90°水平）。"}{" "}
                  首点MD=0，位置以井口为原点。
                </p>
              </div>
              <div className="wp-structure-content">
                {mode === "uniform" ? (
                  <>
                    <div className="wp-form">
                      {geometryFields
                        .filter(([k]) => !(survey && k === "angle"))
                        .map(([k, l, u, scale]) => (
                          <Numeric
                            key={k}
                            label={l}
                            unit={u}
                            name={k}
                            value={params[k]}
                            scale={scale}
                            error={errors[k]}
                            onChange={(v) => update(k, v)}
                          />
                        ))}
                    </div>
                    <p className="wp-hint" style={{ marginTop: 12 }}>
                      {survey
                        ? "全井采用统一内径与粗糙度；倾角随导入井轨迹变化。"
                        : "全井采用相同内径和倾角。夹角相对水平面，垂直井为90°。切换“分段结构”可设置不同井段。"}
                    </p>
                  </>
                ) : (
                  <>
                    {segments.map((s, i) => (
                      <div className="wp-segment" key={i}>
                        <div className="wp-segment-head">
                          <span className="wp-index">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <input
                            aria-label={`第${i + 1}段名称`}
                            maxLength={30}
                            value={s.name}
                            onChange={(e) =>
                              editSegment(i, "name", e.target.value)
                            }
                          />
                          <span className="wp-unit">
                            {fmt(i ? segments[i - 1].end : 0, 1)} m 起
                          </span>
                          <button
                            disabled={segments.length === 1}
                            aria-label={`删除第${i + 1}段`}
                            onClick={() => removeSegment(i)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="wp-segment-grid">
                          <Numeric
                            label={`第${i + 1}段终点井深`}
                            unit="m"
                            value={s.end}
                            onChange={(v) => editSegment(i, "end", v)}
                          />
                          <Numeric
                            label={`第${i + 1}段内径`}
                            unit="mm"
                            scale={1000}
                            value={s.diameter}
                            onChange={(v) => editSegment(i, "diameter", v)}
                          />
                          {survey ? (
                            <div className="wp-hint">
                              井段倾角
                              <br />
                              由井斜数据确定
                            </div>
                          ) : (
                            <Numeric
                              label={`第${i + 1}段夹角`}
                              unit="°"
                              value={s.angle}
                              onChange={(v) => editSegment(i, "angle", v)}
                            />
                          )}
                          <Numeric
                            label={`第${i + 1}段粗糙度`}
                            unit="mm"
                            scale={1000}
                            value={s.roughness}
                            onChange={(v) => editSegment(i, "roughness", v)}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      className="wp-add"
                      onClick={addSegment}
                      disabled={segments.length >= 30}
                    >
                      ＋ 添加井段
                    </button>
                    <p className="wp-hint" style={{ marginTop: 9 }}>
                      按测深从浅到深连续排列，最后终点等于总井深。结构改变后请重新计算。
                    </p>
                  </>
                )}
              </div>
              <div className="wp-structure-footer">
                <span className="wp-small">CSV / JSON · 最多30段</span>
                <button className="wp-link" onClick={example}>
                  填入三段示例
                </button>
              </div>
            </section>
          </aside>
          <section className="wp-panel wp-visual" aria-label="井筒可视化视图">
            <div className="wp-visual-head">
              <div>
                <h2>井筒可视化</h2>
                <div className="wp-sub">
                  {result.model} · {result.segments.length} 个井段 ·{" "}
                  {result.steps.toLocaleString()} 个网格
                </div>
              </div>
              <div className="wp-toolbar">
                <span className={`wp-badge ${stale ? "wp-stale" : ""}`}>
                  <i className="wp-live" />
                  {stale ? "待更新" : "计算已同步"}
                </span>
                <button disabled={stale || exporting} onClick={excel}>
                  {exporting ? "正在导出…" : "导出 Excel"}
                </button>
              </div>
            </div>
            <div className="wp-summary">
              <div className="wp-stat">
                <div className="wp-stat-label">井底流压</div>
                <div className="wp-stat-value" data-testid="bottom-pressure">
                  {fmt(result.bottom)}
                  <span className="wp-stat-unit">MPa</span>
                </div>
                <div className="wp-stat-note">
                  MD {fmt(result.params.depth, 0)} m{" "}
                  {result.survey &&
                    ` · TVD ${fmt(result.stations.at(-1).tvd, 1)} m`}
                </div>
              </div>
              <div className="wp-stat">
                <div className="wp-stat-label">井底－井口压差</div>
                <div className="wp-stat-value">
                  {fmt(delta)}
                  <span className="wp-stat-unit">MPa</span>
                </div>
                <div className="wp-stat-note">
                  井口 {fmt(result.params.pressure, 2)} MPa
                </div>
              </div>
              <div className="wp-stat">
                <div className="wp-stat-label">摩阻 / 总压差</div>
                <div className="wp-stat-value">
                  {fmt(
                    (result.friction / (result.friction + result.gravity)) *
                      100,
                    1,
                  )}
                  <span className="wp-stat-unit">%</span>
                </div>
                <div className="wp-stat-note">
                  摩阻 {fmt(result.friction, 3)} MPa
                </div>
              </div>
            </div>
            <div className="wp-tabs-row">
              <div
                className="wp-tabs"
                role="tablist"
                aria-label="可视化视图切换"
              >
                <button
                  id="wp-chart-tab"
                  className="wp-tab"
                  role="tab"
                  aria-selected={view === "chart"}
                  aria-controls="wp-result-view"
                  onClick={() => setView("chart")}
                >
                  图表视图
                </button>
                <button
                  id="wp-trajectory-tab"
                  className="wp-tab"
                  role="tab"
                  aria-selected={view === "trajectory"}
                  aria-controls="wp-result-view"
                  onClick={() => setView("trajectory")}
                >
                  井轨迹
                </button>
                <button
                  id="wp-table-tab"
                  className="wp-tab"
                  role="tab"
                  aria-selected={view === "table"}
                  aria-controls="wp-result-view"
                  onClick={() => setView("table")}
                >
                  数据表
                </button>
              </div>
              <div className="wp-toolbar">
                {view === "chart" ? (
                  <>
                    <label className="wp-check">
                      <input
                        type="checkbox"
                        checked={compare}
                        onChange={(e) => setCompare(e.target.checked)}
                      />
                      模型对比
                    </label>
                    <select
                      className="wp-head-select"
                      aria-label="曲线指标"
                      value={metric}
                      onChange={(e) => setMetric(e.target.value)}
                    >
                      <option value="pressure">压力 / MPa</option>
                      <option value="temperature">温度 / K</option>
                      <option value="velocity">流速 / m·s⁻¹</option>
                    </select>
                  </>
                ) : view === "table" ? (
                  <>
                    <select
                      className="wp-head-select"
                      aria-label="数据表类型"
                      value={table}
                      onChange={(e) => setTable(e.target.value)}
                    >
                      <option value="profile">沿井深剖面</option>
                      <option value="structure">井段参数</option>
                      <option value="baseline">工况对比</option>
                      <option value="survey" disabled={!result.survey}>
                        井斜测点
                      </option>
                      <option value="trajectory" disabled={!result.survey}>
                        井轨迹与压力
                      </option>
                    </select>
                    <button
                      disabled={stale || (table === "baseline" && !baseline)}
                      onClick={csv}
                    >
                      导出CSV
                    </button>
                  </>
                ) : (
                  <span className="wp-small">测斜重建 · 局部坐标</span>
                )}
                <select
                  className="wp-head-select"
                  aria-label="采样间隔"
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                >
                  {INTERVALS.map((v) => (
                    <option key={v} value={v}>
                      {v} m采样
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              id="wp-result-view"
              className="wp-content"
              role="tabpanel"
              aria-labelledby={
                view === "chart"
                  ? "wp-chart-tab"
                  : view === "trajectory"
                  ? "wp-trajectory-tab"
                  : "wp-table-tab"
              }
            >
              {view === "chart" ? (
                <div className="wp-graph">
                  {result.survey ? (
                    <TrajectoryMini result={result} />
                  ) : (
                    <Schematic
                      segments={result.segments}
                      depth={result.params.depth}
                    />
                  )}
                  <div className="wp-plot">
                    <Chart
                      key={
                        JSON.stringify(result.params) +
                        JSON.stringify(result.segments) +
                        result.steps +
                        metric +
                        result.model
                      }
                      {...{ result, comparison, compare, metric, interval }}
                      disabled={stale}
                    />
                  </div>
                </div>
              ) : view === "trajectory" ? (
                <TrajectoryView
                  result={result}
                  disabled={stale}
                  onImport={() => surveyRef.current.click()}
                  pending={!!survey}
                  onCompute={run}
                />
              ) : table === "survey" ? (
                result.survey ? (
                  <Table
                    headers={[
                      "MD / m",
                      "Inc / °",
                      "Azi / °",
                      "TVD / m",
                      "N / m",
                      "E / m",
                      "狗腿度 °/30m",
                    ]}
                    rows={result.stations.map((p) => [
                      fmt(p.md, 1),
                      fmt(p.inc, 2),
                      fmt(p.azi, 2),
                      fmt(p.tvd, 2),
                      fmt(p.north, 2),
                      fmt(p.east, 2),
                      fmt(p.dls, 3),
                    ])}
                  />
                ) : (
                  <div className="wp-table-empty">请先导入井斜并计算。</div>
                )
              ) : table === "trajectory" ? (
                result.survey ? (
                  <Table
                    headers={[
                      "MD / m",
                      "TVD / m",
                      "N / m",
                      "E / m",
                      "Inc / °",
                      "Azi / °",
                      "压力 / MPa",
                    ]}
                    rows={result.samples.map((r) => {
                      const p = trajectoryAt(resultGeometry, r[0]);
                      return [
                        fmt(r[0], 1),
                        fmt(p.tvd, 2),
                        fmt(p.north, 2),
                        fmt(p.east, 2),
                        fmt(p.inc, 2),
                        fmt(p.azi, 2),
                        fmt(r[1]),
                      ];
                    })}
                  />
                ) : (
                  <div className="wp-table-empty">请先导入井斜并计算。</div>
                )
              ) : table === "profile" ? (
                <Table
                  headers={profileHeaders}
                  rows={result.samples.map((r) => [
                    fmt(r[0], 1),
                    result.segments[sectionAtDepth(result.segments, r[0])].name,
                    ...r.slice(1).map((v, j) => fmt(v, j === 1 ? 2 : 4)),
                  ])}
                />
              ) : table === "structure" ? (
                <Table
                  headers={[
                    "井段",
                    "起点 / m",
                    "终点 / m",
                    "内径 / mm",
                    result.survey ? "结构夹角（已覆盖）" : "夹角 / °",
                    "粗糙度 / mm",
                  ]}
                  rows={sectionRows}
                />
              ) : baseline ? (
                <Table
                  headers={["比较项目", "固定基准", "当前结果", "变化"]}
                  rows={[
                    [
                      "井底压力 / MPa",
                      fmt(baseline.bottom),
                      fmt(result.bottom),
                      fmt(result.bottom - baseline.bottom),
                    ],
                    [
                      "摩阻压差 / MPa",
                      fmt(baseline.friction),
                      fmt(result.friction),
                      fmt(result.friction - baseline.friction),
                    ],
                    ["模型", baseline.model, result.model, "—"],
                    [
                      "轨迹与温度基准",
                      baseline.survey
                        ? `${baseline.survey.length}测点 / ${
                            baseline.temperatureBasis === "tvd"
                              ? "垂深"
                              : "测深"
                          }`
                        : "结构角度 / MD",
                      result.survey
                        ? `${result.survey.length}测点 / ${
                            result.temperatureBasis === "tvd" ? "垂深" : "测深"
                          }`
                        : "结构角度 / MD",
                      equal(baseline.survey, result.survey) &&
                      baseline.temperatureBasis === result.temperatureBasis
                        ? "相同"
                        : "已改变",
                    ],
                    [
                      "井身结构",
                      `${baseline.segments.length} 段`,
                      `${result.segments.length} 段`,
                      structureChanged ? "已改变" : "相同",
                    ],
                    [
                      "网格数",
                      baseline.steps,
                      result.steps,
                      result.steps - baseline.steps,
                    ],
                    ...changes.map((v) => [
                      v.label + " / " + v.unit,
                      fmt(v.before),
                      fmt(v.after),
                      fmt(v.after - v.before),
                    ]),
                  ]}
                />
              ) : (
                <div className="wp-table-empty">
                  <strong>尚未固定对比工况</strong>
                  <p>先固定当前结果，再修改参数或井身结构并计算。</p>
                  <button disabled={stale} onClick={pin}>
                    固定当前工况
                  </button>
                </div>
              )}
            </div>
            <div className="wp-visual-footer">
              <div className="wp-quality-line">
                <span>
                  {quality.relativePercent <= 0.1
                    ? "✓ 网格差异较小"
                    : "△ 建议加密网格"}{" "}
                  · 压力差 {fmt(quality.difference, 6)} MPa{" "}
                  <span className="wp-unit">
                    {" "}
                    / {fmt(quality.relativePercent, 4)}%
                  </span>
                </span>
                <div className="wp-toolbar">
                  <button disabled={stale} onClick={pin}>
                    {baseline ? "替换对比基准" : "固定当前工况"}
                  </button>
                  {baseline && (
                    <button onClick={() => setBaseline(null)}>清除基准</button>
                  )}
                </div>
              </div>
              <details className="wp-details">
                <summary>计算检查与适用范围</summary>
                <p>
                  加密至{quality.refinedSteps.toLocaleString()}个网格，井底压力
                  {fmt(quality.refinedBottom)} MPa。最大计算流速
                  {fmt(result.maxVelocity, 3)}{" "}
                  m/s。网格检查衡量离散误差，0.1%为加密提示阈值。
                  {compare &&
                    `${comparison.model}井底压力${fmt(
                      comparison.bottom,
                    )} MPa。`}
                </p>
                <p>
                  {result.survey &&
                    `井轨迹采用最小曲率法；井斜角从垂直向下计，方位角沿导入数据北向顺时针。未做磁偏角、井口海拔或地理坐标换算。重力使用实际垂深增量，摩阻使用沿井测深增量，地温梯度按${
                      result.temperatureBasis === "tvd" ? "垂深" : "测深"
                    }0.025 K/m。`}
                  沿用原程序单气相采气简化模型：重力与Darcy摩阻；分段内径、倾角和粗糙度逐段参与积分，井段界面为网格节点。井深为测深，倾角相对水平；温度按测深0.025
                  K/m递增；摩尔质量0.018 kg/mol，常Z，标况101325 Pa / 293.15
                  K。Beggs-Brill为原程序的简化摩阻修正。未计多相流、加速项、管径突变局部损失或注气方向。未导入井斜时结构图展示流动通道内径。基准保留于当前页面，Excel包含两组结构。
                </p>
              </details>
            </div>
          </section>
        </div>
        <footer className="wp-foot">
          <span>UGSci / 井筒压力计算 · v{VERSION}</span>
          <span>参数与井身结构 → 分段计算 → 可视化分析 · 全部在本机完成</span>
        </footer>
      </div>
    </main>
  );
}
Q.registerRoutes("wellbore-pressure", [
  {
    path: "/apps/wellbore-pressure",
    component: App,
    label: "井筒压力计算",
    icon: "↧",
  },
]);
