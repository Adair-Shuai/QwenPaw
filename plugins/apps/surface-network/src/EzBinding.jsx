import { quantities, checkMeasurements } from "./measurements.js";
const React = window.QwenPaw.host.React;
const sensorKinds = {
  压力表: "pressure",
  压力变送器: "pressure",
  温度计: "temperature",
  温度变送器: "temperature",
  差压变送器: "differential",
  流量计: "flow",
  流量变送器: "flow",
};
export function EzBinding({ fields, source, model, apply }) {
  const kind = sensorKinds[fields.TYPE ?? fields["类型"]],
    pipe = (fields.TYPE ?? fields["类型"]) === "站内管线";
  const dn = /^DN\s*(\d+(?:\.\d+)?)$/i.exec((fields["管径"] ?? "").trim());
  const [target, setTarget] = React.useState(""),
    [message, setMessage] = React.useState(""),
    [tag, setTag] = React.useState(fields["位号"] ?? "");
  if (!kind && !(pipe && dn && Number(dn[1]) > 0)) return null;
  const options =
    pipe || kind === "flow" || kind === "differential"
      ? model.pipes
      : model.nodes;
  function bind() {
    if (!target) return;
    try {
      if (pipe) {
        apply({
          ...model,
          pipes: model.pipes.map((p) =>
            p.id === target ? { ...p, dn: Number(dn[1]), ezwalker: source } : p,
          ),
        });
      } else {
        const prior = (model.sensors ?? []).find((s) => s.tag === tag);
        if (prior && (prior.target !== target || prior.kind !== kind))
          throw Error("该位号已绑定到其他位置或测量量");
        const sensor = {
          ...prior,
          tag,
          target,
          kind,
          role: prior?.role ?? "校核",
          ezwalker: source,
        };
        const next = {
          ...model,
          sensors: [
            ...(model.sensors ?? []).filter((s) => s.tag !== tag),
            sensor,
          ],
        };
        checkMeasurements(next);
        apply(next);
      }
      setMessage("已应用到 " + target + "，可从管网图页导出模型保存。");
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <details>
      <summary>{pipe ? "引用源管径" : "绑定到测点对比"}</summary>
      <p>
        目标管网　{model.name}　{pipe ? "DN " + dn[1] : quantities[kind].name}
      </p>
      <div className="sn-ez-controls">
        {!pipe && (
          <input
            aria-label="拟合测点位号"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
        )}
        <select
          aria-label="目标管网对象"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        >
          <option value="">选择对应对象</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id}　{o.name ?? o.from + " → " + o.to}
            </option>
          ))}
        </select>
        <button disabled={!target} onClick={bind}>
          {pipe ? "采用管径" : "登记测点"}
        </button>
      </div>
      {message && <p role="status">{message}</p>}
    </details>
  );
}
