import { Icon } from "./Icon.jsx";
import { numberText } from "./MeasurementPanel.jsx";
import { comparison, quantities } from "./measurements.js";
import { kinds, flowEnds } from "./model.js";
const React = window.QwenPaw.host.React;

function Row({ label, children }) {
  return (
    <div className="sn-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
export function Inspector({
  model,
  c,
  selected,
  sensorTag,
  pick,
  openRegister,
}) {
  const pipe = model.pipes.find((p) => p.id === selected);
  const byId = new Map(model.nodes.map((n) => [n.id, n]));
  const node = byId.get(selected);
  const sensor = model.sensors?.find((s) => s.tag === sensorTag);
  const reading = sensor && comparison(model, c, sensor);
  const q = pipe && c.flow10kSm3d[pipe.id];
  const links = pipe
    ? [pipe.from, pipe.to]
    : model.pipes
        .filter((p) => p.from === selected || p.to === selected)
        .map((p) => p.id);
  return (
    <aside className="sn-panel sn-inspector" aria-label="对象属性">
      <header className="sn-pane-head">
        <h2>
          <Icon name="properties" />
          对象属性
        </h2>
        <small>{pipe ? "管段" : kinds[node.type]}</small>
      </header>
      <div className="sn-detail" aria-live="polite">
        <code className="sn-code">{selected}</code>
        <h3>
          {pipe
            ? byId.get(pipe.from).name + " — " + byId.get(pipe.to).name
            : node.name}
        </h3>
        {sensor && (
          <section className="sn-instrument">
            <h4>
              测点校核 <code>{sensor.tag}</code>
            </h4>
            <dl>
              <Row label="测量量">{quantities[sensor.kind].name}</Row>
              <Row label="实测值">
                {numberText(reading.measured?.value)}{" "}
                {quantities[sensor.kind].unit}
              </Row>
              <Row label="模型值">
                {numberText(reading.predicted)} {quantities[sensor.kind].unit}
              </Row>
              <Row label="偏差">
                {numberText(reading.delta)}{" "}
                {sensor.kind === "pressure"
                  ? "MPa"
                  : quantities[sensor.kind].unit}
              </Row>
              <Row label="状态">{reading.status}</Row>
              <Row label="实测来源">{reading.measured?.source ?? "—"}</Row>
            </dl>
          </section>
        )}
        <div className="sn-reading">
          <small>{pipe ? "管段流量" : "节点绝压"}</small>
          <strong>
            {pipe ? Math.abs(q).toFixed(1) : c.pressureMPa[node.id].toFixed(2)}{" "}
            <em>{pipe ? "万标方/日" : "MPa(a)"}</em>
          </strong>
        </div>
        <dl>
          {pipe ? (
            <>
              <Row label="流动方向">
                {q ? flowEnds(pipe, c).join(" → ") : "停流"}
              </Row>
              <Row label="公称直径">DN {pipe.dn}</Row>
              <Row label="参考起点绝压">
                {c.pressureMPa[pipe.from].toFixed(2)} MPa(a)
              </Row>
              <Row label="参考终点绝压">
                {c.pressureMPa[pipe.to].toFixed(2)} MPa(a)
              </Row>
              <Row label="起点减终点">
                {(c.pressureMPa[pipe.from] - c.pressureMPa[pipe.to]).toFixed(2)}{" "}
                MPa
              </Row>
            </>
          ) : (
            ["东向坐标", "北向坐标", "高程"].map((label, i) => (
              <Row key={label} label={label}>
                {node.enuM[i]} m
              </Row>
            ))
          )}
        </dl>
        <h4 className="sn-link-title">{pipe ? "关联节点" : "相连管段"}</h4>
        <div className="sn-chips">
          {links.map((id) => (
            <button key={id} aria-label={id + " ↗"} onClick={() => pick(id)}>
              <code>{id}</code>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
        {node && (
          <button className="sn-manual" onClick={() => openRegister(node.type)}>
            <Icon name="register" />
            查看设备图例
          </button>
        )}
      </div>
    </aside>
  );
}
