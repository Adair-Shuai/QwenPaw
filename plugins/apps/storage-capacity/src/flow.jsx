import { Icon } from "./icons.jsx";
const React = window.QwenPaw.host.React;
const { useState, useRef, useEffect } = React;
export const FLOW = [
  ["scope", "评估范围", "准备"],
  ["data", "资料整理", "准备"],
  ["accounting", "计量与账面库存", "准备"],
  ["pvt", "流体与 PVT", "分析"],
  ["pressure", "地层压力", "分析"],
  ["connectivity", "连通性与单元", "分析"],
  ["methods", "特征与方法", "分析"],
  ["inventory", "有效库存", "计算"],
  ["window", "压力窗口与库容", "计算"],
  ["deliverability", "注采与调峰能力", "计算"],
  ["results", "校验与结果采用", "成果"],
  ["report", "报告与归档", "成果"],
];
const STATUS = {
  ready: "可检查",
  missing: "待单元",
  calculated: "已计算",
  blocked: "缺资料",
  review: "待复核",
  stale: "需重算",
  not_applicable: "不适用",
};
const GLOBAL = new Set(["scope", "data", "accounting", "results", "report"]);
const choices = {
  sandstone: "砂岩",
  carbonate: "碳酸盐岩",
  fractured: "裂缝性储层",
  salt: "盐岩",
  auto: "根据资料判断",
  unknown: "待判断",
  depleted_gas: "枯竭气藏",
  depleted_oil: "枯竭油藏",
  aquifer: "含水层",
  salt_cavern: "盐穴",
  pz: "两点 p/Z",
  pz_regression: "多点 p/Z",
  volumetric: "体积与压力窗口",
  numerical: "数值模拟成果复核",
  rta: "RTA 成果复核",
};
const choiceLabel = (v) => choices[v] || String(v);
const display = (v) =>
  v == null
    ? "—"
    : typeof v === "number"
    ? v.toLocaleString("zh-CN", { maximumFractionDigits: 6 })
    : String(v);
export function FlowNav({ active, select, nodes, dirty, busy }) {
  return (
    <nav
      className="sc-flow-nav"
      role="tablist"
      aria-label="评估步骤"
      aria-orientation="vertical"
    >
      {FLOW.map(([id, name, group], i) => {
        const state = nodes?.find((n) => n.id === id);
        return (
          <React.Fragment key={id}>
            {(!i || FLOW[i - 1][2] !== group) && (
              <div className="sc-flow-group">{group}</div>
            )}
            <button
              role="tab"
              aria-selected={active === id}
              data-status={dirty ? "stale" : state?.status}
              disabled={busy}
              onClick={() => select(id)}
            >
              <span className="sc-step-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="sc-step-text">
                {name}
                <small>
                  {dirty ? "修改待保存" : STATUS[state?.status] || "待处理"}
                </small>
              </span>
              {state?.status === "calculated" && !dirty && (
                <span className="sc-step-done" aria-label="已计算">
                  ✓
                </span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function NodeInputs({
  node,
  data,
  index,
  edit,
  cat,
  Field,
  Check,
  TableEditor,
}) {
  const u = data.units[index];
  if (!u)
    return (
      <p className="sc-note">请在评估范围中添加评估单元，再开始此节点。</p>
    );
  const change = (patch) =>
    edit({
      units: data.units.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    });
  const param = (k, v) => change({ parameters: { ...u.parameters, [k]: v } });
  const group = (g, k, v) => change({ [g]: { ...u[g], [k]: v } });
  const paramField = (k) => (
    <Field
      key={k}
      label={`${cat.fields[k]?.label || k}（${cat.fields[k]?.unit || ""}）`}
      type="number"
      value={u.parameters[k]}
      onChange={(v) => param(k, v)}
    />
  );
  if (node === "pvt")
    return (
      <section className="sc-section">
        <h3>实验物性与状态参数</h3>
        <p className="sc-muted">
          填写实验或专业物性软件成果。选择表插值后，下游使用同一温度、样品的表内计算值；原始手填值仍保留。
        </p>
        <div className="sc-grid">
          <Field
            label="物性取值方式"
            value={u.pvt_config?.mode || "missing"}
            options={[
              ["missing", "采用已填 Z，缺项时查表"],
              ["table", "统一使用实验表插值"],
            ]}
            onChange={(v) => group("pvt_config", "mode", v)}
          />
          <Field
            label="PVT 样品／组分版本"
            value={u.pvt_config?.sample}
            onChange={(v) => group("pvt_config", "sample", v)}
          />
          <Field
            label="PVT 表温度（K）"
            type="number"
            value={u.pvt_config?.temperature}
            onChange={(v) => group("pvt_config", "temperature", v)}
          />
          {paramField("temperature")}
          <Field
            label="物性来源与适用范围"
            value={u.pvt_config?.source}
            onChange={(v) => group("pvt_config", "source", v)}
            wide
          />
        </div>
        <TableEditor
          title="实验 PVT 表"
          columns={["pressure", "z"]}
          rows={u.pvt || []}
          onChange={(v) => change({ pvt: v })}
        />
        <div className="sc-grid">
          {["injection_end", "evaluation", "minimum", "maximum"].flatMap(
            (p) => [paramField(p + "_pressure"), paramField(p + "_z")],
          )}
        </div>
        <p className="sc-note">
          运行本节点得到各状态 Z；绝压、绝温和标准状态齐全时同时计算
          Bg。复杂相态使用有依据的外部成果。
        </p>
      </section>
    );
  if (node === "pressure")
    return (
      <section className="sc-section">
        <h3>原始测压、解释值与采用值</h3>
        <div className="sc-grid">
          <Field
            label="压力处理方式"
            value={u.pressure_config?.mode || "adopted"}
            options={[
              ["adopted", "已统一基准／采用解释压力"],
              ["datum", "按已知梯度折算基准深度"],
            ]}
            onChange={(v) => group("pressure_config", "mode", v)}
          />
          <Field
            label="原始测压基准"
            value={u.pressure_config?.reference || "declared"}
            options={[
              ["declared", "沿用项目已声明口径"],
              ["gauge", "表压，显式加当地大气压"],
            ]}
            onChange={(v) => group("pressure_config", "reference", v)}
          />
          {u.pressure_config?.reference === "gauge" && (
            <Field
              label="当地大气压（MPa）"
              type="number"
              value={u.pressure_config.atmospheric_pressure}
              onChange={(v) =>
                group("pressure_config", "atmospheric_pressure", v)
              }
            />
          )}
          {u.pressure_config?.mode === "datum" && (
            <>
              <Field
                label="基准垂深（m，向下为正）"
                type="number"
                value={u.pressure_config.datum_depth}
                onChange={(v) => group("pressure_config", "datum_depth", v)}
              />
              <Field
                label="已知压力梯度（MPa/m）"
                type="number"
                value={u.pressure_config.gradient}
                onChange={(v) => group("pressure_config", "gradient", v)}
              />
            </>
          )}
          <Field
            label="权重依据"
            value={u.pressure_weight_basis}
            onChange={(v) => change({ pressure_weight_basis: v })}
          />
          <Field
            label="测压状态与来源"
            value={u.pressure_source}
            onChange={(v) => change({ pressure_source: v })}
          />
        </div>
        <p className="sc-note">
          解释压力填写后须有逐井来源。关井时长保留作代表性检查，不自动加减历史压差。
        </p>
        {["start_pressures", "end_pressures"].map((k, i) => (
          <TableEditor
            key={k}
            title={i ? "末期状态测压" : "起始状态测压"}
            columns={[
              "name",
              "pressure",
              "interpreted_pressure",
              "weight",
              "depth",
              "shut_in_days",
              "source",
            ]}
            rows={u[k] || []}
            onChange={(v) => change({ [k]: v })}
          />
        ))}
        <details>
          <summary>直接采用代表压力</summary>
          <div className="sc-grid">
            {paramField("injection_end_pressure")}
            {paramField("evaluation_pressure")}
          </div>
          <p>有测压记录时按记录处理并加权，结果传递至库存节点。</p>
        </details>
      </section>
    );
  if (node === "connectivity")
    return (
      <section className="sc-section">
        <h3>井间响应与评价边界</h3>
        {data.storage_type === "salt_cavern" ? (
          <p className="sc-note">
            盐穴按独立腔体评价，本节点标记不适用。腔体净容积在压力窗口节点录入。
          </p>
        ) : (
          <>
            <Field
              label="井对、观测时段与资料来源"
              value={u.connectivity?.source}
              onChange={(v) => group("connectivity", "source", v)}
              wide
            />
            <div className="sc-grid">
              <Field
                label="最大滞后点数"
                type="number"
                value={u.connectivity?.max_lag ?? 2}
                onChange={(v) => group("connectivity", "max_lag", v)}
              />
              <Check
                label="先对压力序列作一阶差分"
                value={u.connectivity?.difference !== false}
                onChange={(v) => group("connectivity", "difference", v)}
              />
            </div>
            <TableEditor
              title="同步压力响应"
              columns={["time", "x", "y"]}
              rows={u.connectivity?.series || []}
              onChange={(v) => group("connectivity", "series", v)}
            />
            <Field
              label="地质、试井证据与分区解释"
              type="textarea"
              value={u.connectivity?.interpretation}
              onChange={(v) => group("connectivity", "interpretation", v)}
              wide
            />
            <p className="sc-note">
              需要至少5个等间隔同步观测点。相关性和滞后只作响应证据，分区须结合地质、试井与计量边界。
            </p>
          </>
        )}
        <Field
          label="本单元范围与参数来源"
          value={u.source}
          onChange={(v) => change({ source: v })}
          wide
        />
        <Check
          label="各单元范围不重叠，气量采用一致标准状态和时间边界"
          value={data.non_overlapping}
          onChange={(v) => edit({ non_overlapping: v })}
        />
      </section>
    );
  return null;
}

export function NodeResult({ result, dirty, cat, onMethod }) {
  if (!result?.run)
    return (
      <div className="sc-node-empty">
        填写本节点所需资料后，点击“运行本节点”。其他节点缺项不会阻止本节点运行。
      </div>
    );
  const r = result.run;
  const stale = dirty || result.status === "stale";
  const rows = r.rows || [];
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const labels = {
    ...Object.fromEntries((cat?.terms || []).map((t) => [t.key, t.name])),
    ...Object.fromEntries(
      Object.entries(cat?.fields || {}).map(([k, v]) => [k, v.label]),
    ),
    response_correlation: "响应相关系数",
    response_lag: "响应滞后时间",
    effective_capacity: "有效库容量",
    cushion: "下限气量",
  };
  return (
    <section className="sc-node-result" aria-label="节点计算结果">
      <div className="sc-section-head">
        <h3>本节点结果</h3>
        <span className={stale ? "sc-warning" : "sc-muted"}>
          {stale ? "输入已改变，需重算" : STATUS[r.status]}
        </span>
      </div>
      {r.errors?.map((s, i) => (
        <p className="sc-alert" key={i}>
          {s}
        </p>
      ))}
      {!!Object.keys(r.values || {}).length && (
        <dl className="sc-node-values">
          {Object.entries(r.values).map(([k, v]) => (
            <div key={k}>
              <dt>{labels[k] || k}</dt>
              <dd>
                {display(v)}
                <small>
                  {cat?.fields?.[k]?.unit ||
                    (k.endsWith("_inventory") ||
                    [
                      "geological_swing",
                      "working_gas",
                      "capacity",
                      "effective_capacity",
                      "movable_cushion",
                      "deliverable_swing",
                      "cushion",
                    ].includes(k)
                      ? "亿m³"
                      : k === "peak_rate"
                      ? "万m³/d"
                      : "")}
                </small>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {r.recommendation && (
        <div className="sc-note">
          推荐：
          {cat.methods.find((m) => m.id === r.recommendation.method)?.name}。
          {r.recommendation.reason}
          <button
            disabled={stale}
            onClick={() => onMethod(r.recommendation.method)}
          >
            采用推荐方法
          </button>
        </div>
      )}
      {r.steps?.map((s, i) => (
        <p key={i}>{s}</p>
      ))}
      {r.warnings?.map((s, i) => (
        <p key={i} className="sc-muted">
          {s}
        </p>
      ))}
      {rows.length > 0 && (
        <details open={rows.length < 20}>
          <summary>明细记录（{rows.length}）</summary>
          <div className="sc-table-wrap sc-result-table">
            <table className="sc-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c}>{display(row[c])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      <small className="sc-muted">
        计算时间 {r.created_at?.replace("T", " ").slice(0, 19)} UTC · 输入版本{" "}
        {r.input_hash?.slice(0, 12)}
      </small>
    </section>
  );
}

function initialWidth() {
  try {
    return Math.max(
      280,
      Math.min(640, Number(localStorage.getItem("sc-assistant-width")) || 350),
    );
  } catch {
    return 350;
  }
}
export function AssistantPanel({
  record,
  node,
  index,
  busy,
  send,
  upload,
  adopt,
  undo,
  hidden,
  close,
  cat,
}) {
  const [width, setWidth] = useState(initialWidth);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [chosen, setChosen] = useState([]);
  const [showSources, setShowSources] = useState(false);
  const input = useRef(),
    scroll = useRef(),
    drag = useRef(null);
  useEffect(() => {
    scroll.current?.scrollIntoView?.({ block: "nearest" });
  }, [record?.messages?.length, busy]);
  useEffect(() => {
    setMessage("");
    setFiles([]);
    setChosen([]);
  }, [record?.id]);
  if (!record || hidden) return null;
  const pending = (record.proposals || []).filter(
    (p) => p.status === "pending",
  );
  const fieldLabel = (path) => {
    const leaf = path.split(".").at(-1);
    return (
      cat?.fields?.[leaf]?.label ||
      {
        storage_type: "建库类型",
        method: "主评估方法",
        rock_type: "岩性",
        new_unit: "新建单元",
        pressure_representative: "压力代表性",
        water_drive: "水体影响",
      }[leaf] ||
      path
    );
  };
  return (
    <aside className="sc-assistant" style={{ width }} aria-label="评估助手">
      <div
        className="sc-resizer"
        role="separator"
        tabIndex={0}
        aria-label="调整评估助手宽度"
        aria-orientation="vertical"
        aria-valuemin={280}
        aria-valuemax={640}
        aria-valuenow={width}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, width };
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current)
            setWidth(
              Math.max(
                280,
                Math.min(640, drag.current.width + drag.current.x - e.clientX),
              ),
            );
        }}
        onPointerUp={() => {
          drag.current = null;
          try {
            localStorage.setItem("sc-assistant-width", String(width));
          } catch {}
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={(e) => {
          if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
            const v = Math.max(
              280,
              Math.min(640, width + (e.key === "ArrowLeft" ? 20 : -20)),
            );
            setWidth(v);
            try {
              localStorage.setItem("sc-assistant-width", String(v));
            } catch {}
          }
        }}
      />
      <header>
        <div>
          <strong>评估助手</strong>
          <small>
            {FLOW.find((n) => n[0] === node)?.[1]}
            {!GLOBAL.has(node) &&
              ` · ${record.case.units[index]?.name || "待选单元"}`}
          </small>
        </div>
        <button
          className="sc-icon-button"
          onClick={close}
          aria-label="收起评估助手"
          title="收起评估助手"
        >
          <Icon name="panel" />
        </button>
      </header>
      <div className="sc-chat-history" aria-live="polite">
        {!record.messages?.length && (
          <div className="sc-chat-welcome">
            <p>可以上传资料，或告诉我需要填写、核对的内容。</p>
            <button
              disabled={busy}
              onClick={() =>
                setMessage("检查当前节点还缺哪些资料，并说明取值依据。")
              }
            >
              检查当前节点缺项
            </button>
            <button
              disabled={busy}
              onClick={() =>
                setMessage(
                  "根据已有资料判断建库类型、岩性与方法，列出依据和待确认项。",
                )
              }
            >
              判断类型与方法
            </button>
          </div>
        )}
        {(record.messages || []).map((m, i) => (
          <article key={i} className={`sc-message sc-message-${m.role}`}>
            <small>{m.role === "user" ? "你" : "评估助手"}</small>
            {m.role === "assistant" && (m.applied > 0 || m.pending > 0) ? (
              <>
                <div>
                  {m.applied > 0
                    ? `已填写 ${m.applied} 项数据。`
                    : "已整理候选取值，请核对来源后采用。"}
                </div>
                <details>
                  <summary>查看资料识别说明</summary>
                  <div>{m.text}</div>
                </details>
              </>
            ) : (
              <div>{m.text}</div>
            )}
            {m.applied > 0 && (
              <small>已填写 {m.applied} 项，相关结果需更新</small>
            )}
            {m.pending > 0 && <small>有 {m.pending} 项候选，见下方</small>}
            {m.rejected?.map((e, j) => (
              <small key={j} className="sc-warning">
                未采用：{e}
              </small>
            ))}
          </article>
        ))}
        {pending.length > 0 && (
          <section className="sc-proposals">
            <strong>候选取值（{pending.length}）</strong>
            {pending.map((p) => (
              <div key={p.id}>
                <b>{fieldLabel(p.path)}</b>
                <p>
                  {typeof p.value === "object"
                    ? `${p.value.length} 条记录`
                    : choiceLabel(p.value)}
                </p>
                {p.previous != null && (
                  <small>
                    原值：
                    {typeof p.previous === "object"
                      ? "已有记录"
                      : choiceLabel(p.previous)}
                  </small>
                )}
                <small>{p.reason}</small>
                <details>
                  <summary>查看来源</summary>
                  <p>
                    {p.source.location}：{p.source.quote}
                  </p>
                </details>
                <button disabled={busy} onClick={() => adopt([p.id])}>
                  采用此项
                </button>
              </div>
            ))}
            <button
              disabled={busy}
              onClick={() => adopt(pending.map((p) => p.id))}
            >
              采用以上候选
            </button>
          </section>
        )}
        {record.last_edit && (
          <button className="sc-link" disabled={busy} onClick={undo}>
            撤销最近一次对话填表
          </button>
        )}
        {busy && (
          <p className="sc-muted" role="status">
            正在处理，请稍候…
          </p>
        )}
        <div ref={scroll} />
      </div>
      <div className="sc-chat-compose">
        <button className="sc-link" onClick={() => setShowSources((v) => !v)}>
          参考项目资料（{chosen.length}）
        </button>
        {showSources && (
          <div className="sc-chat-sources">
            {record.case.documents?.map((d) => (
              <label key={d.id}>
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={chosen.includes(d.id)}
                  onChange={(e) =>
                    setChosen((v) =>
                      e.target.checked
                        ? [...v, d.id].slice(0, 20)
                        : v.filter((id) => id !== d.id),
                    )
                  }
                />
                {d.name}
              </label>
            ))}
            {!record.case.documents?.length && (
              <small>可从下方上传资料。</small>
            )}
          </div>
        )}
        {files.length > 0 && (
          <div className="sc-attachments">
            {files.map((f, i) => (
              <span key={i}>
                {f.name}
                <button
                  disabled={busy}
                  onClick={() => setFiles((v) => v.filter((_, j) => j !== i))}
                  aria-label={`移除附件${f.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="sc-compose-box">
          <textarea
            aria-label="与评估助手对话"
            placeholder="描述问题、填写数值，或附上资料…"
            value={message}
            disabled={busy}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                e.currentTarget.parentElement
                  .querySelector("button.sc-primary")
                  ?.click();
              }
            }}
          />
          <div className="sc-actions">
            <button disabled={busy} onClick={() => input.current.click()}>
              <Icon name="plus" />
              添加文件
            </button>
            <input
              ref={input}
              hidden
              type="file"
              multiple
              aria-label="对话投喂资料"
              accept=".xlsx,.csv,.tsv,.json,.pptx,.pdf,.docx,.txt,.md"
              onChange={(e) => {
                setFiles((v) =>
                  [...v, ...Array.from(e.target.files)].slice(0, 20),
                );
                e.target.value = "";
              }}
            />
            <button
              className="sc-primary"
              disabled={busy || (!message.trim() && !files.length)}
              onClick={async () => {
                const ok = await send(
                  message.trim() ||
                    "读取本次附件，将本周期有明确依据的数据填入对应表单，类型和方法给出候选。",
                  files,
                  chosen,
                );
                if (ok) {
                  setMessage("");
                  setFiles([]);
                }
              }}
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
