import {
  comparison,
  quantities,
  mergeMeasurements,
  measurementsCsv,
} from "./measurements.js";
import { Icon } from "./Icon.jsx";
const React = window.QwenPaw.host.React;
export function numberText(v) {
  return Number.isFinite(v) ? Number(v.toFixed(5)).toString() : "—";
}
function PipeTable({ model, c, selected, onPick }) {
  const nodes = new Map(model.nodes.map((n) => [n.id, n.name]));
  return (
    <div className="sn-scroll">
      <table className="sn-pipe-table" aria-label="管段明细">
        <thead>
          <tr>
            {[
              "管段",
              "参考起点 → 终点",
              "公称直径",
              "起点绝压 / MPa(a)",
              "终点绝压 / MPa(a)",
              "有符号流量 / 万标方·日⁻¹",
            ].map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {model.pipes.map((p) => (
            <tr
              key={p.id}
              className={selected === p.id ? "sel" : ""}
              onClick={() => onPick(p.id)}
            >
              <td>
                <button
                  className="sn-table-link"
                  aria-label={"定位管段 " + p.id}
                >
                  {p.id}
                </button>
              </td>
              <td>
                {nodes.get(p.from)} → {nodes.get(p.to)}
              </td>
              <td>DN {p.dn}</td>
              <td>{c.pressureMPa[p.from].toFixed(2)}</td>
              <td>{c.pressureMPa[p.to].toFixed(2)}</td>
              <td>{c.flow10kSm3d[p.id].toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function SensorTable({ model, c, sensorTag, onSensor }) {
  return (
    <div className="sn-scroll">
      <table className="sn-sensor-table" aria-label="工况测点记录">
        <thead>
          <tr>
            {[
              "位号",
              "绑定对象",
              "测量量",
              "单位",
              "实测值",
              "模型值",
              "偏差",
              "状态",
              "实测来源",
            ].map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {model.sensors.map((s) => {
            const r = comparison(model, c, s),
              unit = quantities[s.kind];
            return (
              <tr
                key={s.tag}
                className={sensorTag === s.tag ? "sel" : ""}
                onClick={() => onSensor(s)}
              >
                <td>
                  <button
                    className="sn-table-link"
                    aria-label={"定位测点 " + s.tag}
                  >
                    {s.tag}
                  </button>
                </td>
                <td>
                  <code>{s.target}</code>
                </td>
                <td>{unit.name}</td>
                <td>{unit.unit}</td>
                <td>{numberText(r.measured?.value)}</td>
                <td>{numberText(r.predicted)}</td>
                <td>{numberText(r.delta)}</td>
                <td>
                  <span
                    className="sn-status"
                    data-comparable={r.status === "可比"}
                  >
                    {r.status}
                  </span>
                </td>
                <td>{r.measured?.source ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export function DataTables({
  model,
  c,
  selected,
  onPick,
  sensorTag,
  onSensor,
  apply,
  download,
}) {
  const [tab, setTab] = React.useState("sensors"),
    [message, setMessage] = React.useState("");
  const uid = React.useId(),
    input = React.useRef(null),
    seq = React.useRef(0);
  React.useEffect(
    () => () => {
      seq.current++;
    },
    [model],
  );
  async function load(e) {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const n = ++seq.current;
    try {
      if (f.size > 5 * 1024 * 1024) throw Error("文件超过 5 MB");
      const source = await f.text();
      if (seq.current !== n) return;
      apply(mergeMeasurements(model, source, f.name));
      setMessage("已导入 " + f.name + "。导出模型可保存本次记录。");
    } catch (err) {
      if (n === seq.current) setMessage("导入失败 · " + err.message);
    }
  }
  const tabs = [
    ["sensors", "测点对比", model.sensors?.length ?? 0],
    ["pipes", "管段明细", model.pipes.length],
  ];
  function tabKey(e, i) {
    const next = { ArrowRight: 1 - i, ArrowLeft: 1 - i, Home: 0, End: 1 }[
      e.key
    ];
    if (next === undefined) return;
    e.preventDefault();
    setTab(tabs[next][0]);
    e.currentTarget.parentElement
      .querySelectorAll('[role="tab"]')
      [next].focus();
  }
  return (
    <section className="sn-panel sn-dock" aria-label="工况数据表">
      <header className="sn-dock-head">
        <div className="sn-data-tabs" role="tablist" aria-label="数据表">
          {tabs.map(([id, title, count], i) => (
            <button
              key={id}
              id={uid + id}
              role="tab"
              aria-label={title}
              aria-selected={tab === id}
              aria-controls={uid + id + "-panel"}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(e) => tabKey(e, i)}
            >
              {title}
              <span>{count}</span>
            </button>
          ))}
        </div>
        <div className="sn-actions" hidden={tab !== "sensors"}>
          <button
            onClick={() =>
              download(
                "测点模板.csv",
                measurementsCsv(model),
                "text/csv;charset=utf-8",
              )
            }
          >
            测点模板
          </button>
          <button onClick={() => input.current.click()}>
            <Icon name="upload" />
            导入实测 CSV
          </button>
          <input
            type="file"
            hidden
            aria-label="实测 CSV 文件"
            accept=".csv"
            ref={input}
            onChange={load}
          />
          <button
            disabled={!model.sensors?.length}
            onClick={() =>
              download(
                "测点对比.csv",
                measurementsCsv(model, true),
                "text/csv;charset=utf-8",
              )
            }
          >
            <Icon name="download" />
            导出对比
          </button>
        </div>
      </header>
      <div
        role="tabpanel"
        id={uid + "sensors-panel"}
        aria-labelledby={uid + "sensors"}
        hidden={tab !== "sensors"}
      >
        <section className="sn-measurements" aria-label="测点对比">
          <div className="sn-meas-time">
            <span>
              <Icon name="time" />
              {c.name}{" "}
              <time dateTime={c.time ?? undefined}>
                {c.time?.replace("T", " ") ?? "工况未设置时间"}
              </time>
            </span>
            <span>偏差 = 模型值 − 实测值</span>
          </div>
          {message && (
            <p className="sn-notice" role="status">
              {message}
            </p>
          )}
          {model.sensors?.length ? (
            <SensorTable {...{ model, c, sensorTag, onSensor }} />
          ) : (
            <p className="sn-empty">
              本图尚未登记测点。可用测点模板填写位号与绑定对象。
            </p>
          )}
        </section>
      </div>
      <div
        role="tabpanel"
        id={uid + "pipes-panel"}
        aria-labelledby={uid + "pipes"}
        hidden={tab !== "pipes"}
      >
        <div className="sn-meas-time">
          <span>
            <Icon name="time" />
            {c.name}
          </span>
          <span>正流量沿参考起点至终点</span>
        </div>
        <PipeTable {...{ model, c, selected, onPick }} />
      </div>
    </section>
  );
}
