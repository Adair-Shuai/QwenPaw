import styles from "./workbench.css";
const Q = window.QwenPaw,
  React = Q.host.React;
const { useState, useEffect, useRef, useId } = React;
const API = "/storage-capacity";
const style = document.createElement("style");
style.id = "storage-capacity-styles";
style.textContent = styles;
document.getElementById(style.id)?.remove();
document.head.appendChild(style);
const clone = (v) => JSON.parse(JSON.stringify(v));
function normalizeCase(c, template) {
  if (c?.schema_version !== 2 || !Array.isArray(c.units))
    throw Error("请使用第 2 版评估数据格式");
  const result = {
    ...c,
    documents: c.documents || [],
    history: c.history || [],
    benchmarks: c.benchmarks || [],
  };
  for (const k of ["standard", "design", "ledger", "sources"]) {
    if (
      c[k] !== undefined &&
      (!c[k] || Array.isArray(c[k]) || typeof c[k] !== "object")
    )
      throw Error(`${k} 格式无效`);
    result[k] = c[k] || {};
  }
  result.units = c.units.map((u) => {
    if (!u || typeof u !== "object" || Array.isArray(u))
      throw Error("单元格式无效");
    const n = { ...clone(template), ...u };
    for (const k of ["parameters", "conditions", "external", "evidence"]) {
      if (
        u[k] !== undefined &&
        (!u[k] || Array.isArray(u[k]) || typeof u[k] !== "object")
      )
        throw Error(`${k} 格式无效`);
      n[k] = { ...template[k], ...u[k] };
    }
    for (const k of [
      "series",
      "pvt",
      "wells",
      "schedule",
      "start_pressures",
      "end_pressures",
    ]) {
      n[k] = u[k] || [];
      if (!Array.isArray(n[k])) throw Error(`${k} 格式无效`);
    }
    return n;
  });
  return result;
}
const json = (body, method = "POST") => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
async function request(path, init, raw = false) {
  const r = await Q.host.fetch(API + path, init);
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw Error(
      typeof d.detail === "string" ? d.detail : `操作未完成（${r.status}）`,
    );
  }
  return raw ? r : r.json();
}
async function download(path, name) {
  const r = await request(path, undefined, true),
    url = URL.createObjectURL(await r.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const num = (v) =>
  v === null || v === undefined || v === ""
    ? "未计算"
    : Number(v).toLocaleString("zh-CN", { maximumFractionDigits: 4 });
const fieldNames = {
  name: "单元／井名",
  weight: "权重",
  source: "来源",
  pressure: "压力（MPa）",
  z: "Z 因子",
  cumulative_produced: "本段累采量（亿m³）",
  phase: "阶段 withdrawal",
  day: "区间结束日",
  rate: "区间平均日量（万m³/d）",
  a: "系数 A",
  b: "系数 B",
  reservoir_pressure: "地层绝压（MPa）",
  bottomhole_pressure: "井底绝压（MPa）",
  observed: "观测值",
  simulated: "模拟值",
  cycle_id: "周期",
  book_inventory: "账面库存",
  effective_inventory: "有效库存",
  geological_swing: "地层调峰气量",
  deliverable_swing: "综合调峰能力",
  peak_rate: "冲峰能力",
};
const tabs = [
  ["scope", "评估范围"],
  ["data", "资料与参数"],
  ["methods", "方法与计算"],
  ["results", "结果复核"],
  ["report", "评估报告"],
];

function Field({
  label,
  value,
  onChange,
  type = "text",
  options,
  help,
  wide = false,
  disabled = false,
}) {
  const id = useId();
  return (
    <label className={"sc-field" + (wide ? " sc-span" : "")} htmlFor={id}>
      <span>{label}</span>
      {options ? (
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map((o) => (
            <option key={o.value ?? o[0]} value={o.value ?? o[0]}>
              {o.label ?? o[1]}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <input
          id={id}
          type={type}
          step={type === "number" ? "any" : undefined}
          value={value ?? ""}
          onChange={(e) =>
            onChange(
              type === "number"
                ? e.target.value === ""
                  ? null
                  : Number(e.target.value)
                : e.target.value,
            )
          }
          disabled={disabled}
        />
      )}
      {help && <small>{help}</small>}
    </label>
  );
}
function Check({ label, value, onChange }) {
  return (
    <label className="sc-check">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
function TableEditor({ title, columns, rows, onChange }) {
  return (
    <div>
      <div className="sc-section-head">
        <h4>{title}</h4>
        <button onClick={() => onChange([...rows, {}])}>添加记录</button>
      </div>
      {rows.length > 0 && (
        <div className="sc-table-wrap">
          <table className="sc-table">
            <thead>
              <tr>
                {columns.map((k) => (
                  <th key={k}>{fieldNames[k] || k}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {columns.map((k) => (
                    <td key={k}>
                      <input
                        aria-label={`${title} 第${i + 1}行 ${
                          fieldNames[k] || k
                        }`}
                        type={
                          ["name", "cycle_id", "phase", "source"].includes(k)
                            ? "text"
                            : "number"
                        }
                        step="any"
                        value={r[k] ?? ""}
                        onChange={(e) =>
                          onChange(
                            rows.map((v, j) =>
                              j === i
                                ? {
                                    ...v,
                                    [k]: [
                                      "name",
                                      "cycle_id",
                                      "phase",
                                      "source",
                                    ].includes(k)
                                      ? e.target.value
                                      : e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  }
                                : v,
                            ),
                          )
                        }
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      className="sc-link"
                      onClick={() => onChange(rows.filter((_, j) => i !== j))}
                      aria-label={`删除${title}第${i + 1}行`}
                    >
                      移除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
function Plot({ points, xlabel = "累采量（亿m³）", ylabel = "p/Z（MPa）" }) {
  if (points.length < 2) return null;
  const width = 720,
    height = 230,
    xs = points.map((p) => p.x),
    ys = points.flatMap((p) => [p.y, p.fitted ?? p.y]),
    minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const x = (v) => 58 + ((v - minX) / (maxX - minX || 1)) * 630,
    y = (v) => 180 - ((v - minY) / (maxY - minY || 1)) * 145;
  return (
    <svg
      className="sc-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${xlabel}与${ylabel}关系曲线`}
    >
      <path d="M58 25V180H690" fill="none" stroke="#adb6c3" />
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <text x="48" y={y(minY + t * (maxY - minY)) + 4} textAnchor="end">
            {num(minY + t * (maxY - minY))}
          </text>
          <text x={x(minX + t * (maxX - minX))} y="200" textAnchor="middle">
            {num(minX + t * (maxX - minX))}
          </text>
        </g>
      ))}
      <polyline
        points={points.map((p) => `${x(p.x)},${y(p.fitted ?? p.y)}`).join(" ")}
        stroke="#0d76fd"
        strokeWidth="1.5"
        fill="none"
      />
      {points.map((p, i) => (
        <circle key={i} cx={x(p.x)} cy={y(p.y)} r="3" fill="#0d76fd" />
      ))}
      <text x="70" y="17">
        {ylabel}
      </text>
      <text x="380" y="224" textAnchor="middle">
        {xlabel}
      </text>
    </svg>
  );
}

function SourcePanel({ doc, cat, record, apply, run }) {
  const [tableId, setTable] = useState(doc.tables[0]?.id || ""),
    [kind, setKind] = useState("units"),
    [header, setHeader] = useState(1),
    [end, setEnd] = useState(doc.tables[0]?.rows.length || 1),
    [mapping, setMapping] = useState({}),
    [factors, setFactors] = useState({}),
    [unit, setUnit] = useState(0),
    [errors, setErrors] = useState([]);
  const table = doc.tables.find((t) => t.id === tableId);
  const headers = table?.rows[header - 1] || [];
  const doMap = () =>
    run(async () => {
      const data = await request(
        `/cases/${record.id}/documents/${doc.id}/map`,
        json({
          table_id: tableId,
          kind,
          start_row: header,
          end_row: end,
          mapping,
          factors,
        }),
      );
      setErrors(data.errors);
      if (!data.errors.length) apply(kind, data.records, Number(unit));
    });
  return (
    <div className="sc-source">
      <div className="sc-section-head">
        <h3>{doc.name}</h3>
        <button
          onClick={() =>
            run(() =>
              download(
                `/cases/${record.id}/documents/${doc.id}/original`,
                doc.name,
              ),
            )
          }
        >
          下载原件
        </button>
      </div>
      {doc.warnings.map((w, i) => (
        <p key={i} className="sc-note">
          {w}
        </p>
      ))}
      {doc.case_candidate && (
        <div className="sc-note">
          包含完整评估参数。导入将替换当前填写内容，原始资料保留。
          <button onClick={() => apply("case", doc.case_candidate)}>
            采用该评估参数
          </button>
        </div>
      )}
      {table && (
        <>
          <div className="sc-grid">
            <Field
              label="工作表／表格"
              value={tableId}
              options={doc.tables.map((t) => [t.id, t.label])}
              onChange={(v) => {
                setTable(v);
                setEnd(doc.tables.find((t) => t.id === v).rows.length);
                setMapping({});
              }}
            />
            <Field
              label="表头行号"
              type="number"
              value={header}
              onChange={(v) => {
                setHeader(Math.max(1, v || 1));
                setMapping({});
              }}
            />
            <Field
              label="数据结束行号（含）"
              type="number"
              value={end}
              onChange={setEnd}
            />
          </div>
          <div className="sc-table-wrap">
            <table className="sc-table">
              <tbody>
                {table.rows
                  .slice(Math.max(0, header - 1), Math.min(end, header + 11))
                  .map((r, i) => (
                    <tr key={i}>
                      <th>{header + i}</th>
                      {r.map((v, j) => (
                        <td key={j}>{String(v ?? "")}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="sc-muted">
            预览前 12
            行；映射使用所选完整行范围。表头之后为数据行。合并表格需选择含字段名称的行。
          </p>
          <div className="sc-grid">
            <Field
              label="资料用途"
              value={kind}
              onChange={(v) => {
                setKind(v);
                setMapping({});
                setFactors({});
              }}
              options={Object.keys(cat.mapping_fields).map((k) => [
                k,
                {
                  units: "分单元参数",
                  series: "p/Z 采气序列",
                  pvt: "压力与 Z 因子表",
                  wells: "二项式产能参数",
                  schedule: "采气预测曲线",
                  history: "多周期成果",
                  history_match: "历史拟合数据",
                }[k],
              ])}
            />
            {!["units", "history"].includes(kind) && (
              <Field
                label="应用到评估单元"
                value={unit}
                onChange={setUnit}
                options={record.case.units.map((u, i) => [i, u.name])}
              />
            )}
          </div>
          <details open>
            <summary>字段对应与单位换算</summary>
            <div className="sc-map-grid">
              {cat.mapping_fields[kind].map((k) => (
                <div className="sc-map-field" key={k}>
                  <Field
                    label={cat.fields[k]?.label || fieldNames[k] || k}
                    value={mapping[k] ?? ""}
                    options={[
                      ["", "不导入"],
                      ...headers.map((v, i) => [
                        i,
                        `第 ${i + 1} 列 · ${String(v ?? "空")}`,
                      ]),
                    ]}
                    onChange={(v) =>
                      setMapping((old) => {
                        const n = { ...old };
                        if (v === "") delete n[k];
                        else n[k] = Number(v);
                        return n;
                      })
                    }
                  />
                  <Field
                    label="乘数"
                    value={factors[k] ?? 1}
                    options={[
                      [1, "×1"],
                      [0.0001, "万→亿"],
                      [1e-8, "m³→亿"],
                      [0.001, "kPa→MPa"],
                      [0.01, "bar→MPa"],
                      [1e4, "万→m³"],
                      [1e8, "亿→m³"],
                    ]}
                    onChange={(v) => setFactors({ ...factors, [k]: Number(v) })}
                  />
                </div>
              ))}
            </div>
            <p className="sc-note">
              目标气量单位为亿标准 m³、压力为 MPa。水侵和腔体体积为
              m³，产能流量为万 m³/d。标准状态与压力基准需在评估范围中单独核对。
            </p>
            <button
              className="sc-primary"
              onClick={doMap}
              disabled={
                !Object.keys(mapping).length ||
                (!["units", "history"].includes(kind) &&
                  !record.case.units.length)
              }
            >
              导入所选字段
            </button>
            {errors.map((e, i) => (
              <p className="sc-error" key={i}>
                {e}
              </p>
            ))}
          </details>
        </>
      )}
      {doc.pages.length > 0 && (
        <details open={!table}>
          <summary>提取的原文（{doc.pages.length} 段）</summary>
          {doc.pages.map((p, i) => (
            <details key={i}>
              <summary>{p.label}</summary>
              <pre>{p.text || "未取得文字，请查看原件"}</pre>
            </details>
          ))}
        </details>
      )}
    </div>
  );
}

function Scope({ data, edit, cat }) {
  return (
    <section>
      <div className="sc-section">
        <h3>储气库与评估边界</h3>
        <div className="sc-grid">
          <Field
            label="储气库／项目名称"
            value={data.case_name}
            onChange={(v) => edit({ case_name: v })}
          />
          <Field
            label="评估周期"
            value={data.cycle_id}
            onChange={(v) => edit({ cycle_id: v })}
            help="例如 2025–2026，不能用文件上传时间代替"
          />
          <Field
            label="评估任务"
            value={data.purpose}
            options={[
              ["cycle", "周期评估"],
              ["calibration", "阶段标定"],
              ["design_review", "设计复核"],
            ]}
            onChange={(v) => edit({ purpose: v })}
          />
          <Field
            label="建库类型"
            value={data.storage_type}
            options={cat.storage_types}
            onChange={(v) => edit({ storage_type: v })}
          />
          <Field
            label="储集体"
            value={data.rock_type}
            options={[
              ["sandstone", "砂岩"],
              ["carbonate", "碳酸盐岩"],
              ["fractured", "裂缝／洞穴"],
              ["salt", "盐岩"],
              ["other", "其他"],
            ]}
            onChange={(v) => edit({ rock_type: v })}
          />
          <Field
            label="压力口径"
            value={data.pressure_basis}
            options={[
              ["", "请选择"],
              ["absolute", "绝对压力"],
              ["apparent_formation", "视地层压力"],
              ["report_defined", "报告定义口径"],
            ]}
            onChange={(v) => edit({ pressure_basis: v })}
          />
          <Field
            label="采气段起始状态"
            value={data.start_state}
            onChange={(v) => edit({ start_state: v })}
            help="日期或明确的状态编号"
          />
          <Field
            label="采气段末期状态"
            value={data.end_state}
            onChange={(v) => edit({ end_state: v })}
          />
        </div>
      </div>
      <div className="sc-section">
        <h3>标准状态与计量边界</h3>
        <Field
          label="气量口径确认方式"
          value={data.standard.mode || "verified"}
          options={[
            ["verified", "按计量文件确认标准温压"],
            ["reported", "沿用同一报告气量口径，标准温压待核实"],
          ]}
          onChange={(v) => edit({ standard: { ...data.standard, mode: v } })}
          help="报告口径仅支持物质平衡的条件复算；状态方程和跨来源气量比较必须核实标准温压。"
        />
        <div className="sc-grid">
          {[
            ["temperature", "标准温度（K）"],
            ["pressure", "标准绝压（MPa）"],
            ["z", "标准状态 Z 因子"],
          ].map(([k, l]) => (
            <Field
              key={k}
              label={l}
              type="number"
              value={data.standard[k]}
              onChange={(v) => edit({ standard: { ...data.standard, [k]: v } })}
            />
          ))}
          <Field
            label="标准状态依据"
            value={data.standard.source}
            onChange={(v) =>
              edit({ standard: { ...data.standard, source: v } })
            }
            wide
            help="按计量文件填写；温标、体积基准或组分不同的资料先换算再比较"
          />
        </div>
      </div>
      <div className="sc-section">
        <div className="sc-section-head">
          <h3>评估单元</h3>
          <button
            onClick={() =>
              edit({
                units: [
                  ...data.units,
                  {
                    ...clone(cat.unit_template),
                    name: `评估单元 ${data.units.length + 1}`,
                  },
                ],
              })
            }
          >
            添加单元
          </button>
        </div>
        <p className="sc-muted">
          按层系、连通区、井控范围或独立盐穴划分。一个单元可采用一种主方法，其他成果用于交叉比较。
        </p>
        {data.units.map((u, i) => (
          <div key={i} className="sc-unit">
            <div className="sc-grid">
              <Field
                label={`单元 ${i + 1} 名称`}
                value={u.name}
                onChange={(v) =>
                  edit({
                    units: data.units.map((r, j) =>
                      j === i ? { ...r, name: v } : r,
                    ),
                  })
                }
              />
              <Field
                label="范围与参数来源"
                value={u.source}
                onChange={(v) =>
                  edit({
                    units: data.units.map((r, j) =>
                      j === i ? { ...r, source: v } : r,
                    ),
                  })
                }
              />
              <button
                onClick={() =>
                  edit({ units: data.units.filter((_, j) => j !== i) })
                }
              >
                移除单元
              </button>
            </div>
          </div>
        ))}
        {data.units.length === 0 && (
          <p className="sc-note">
            先添加一个评估单元，或在资料页导入分单元参数表。
          </p>
        )}
        {data.units.length > 1 && (
          <Check
            label="各单元范围不重叠，气量采用一致标准状态和时间边界"
            value={data.non_overlapping}
            onChange={(v) => edit({ non_overlapping: v })}
          />
        )}
      </div>
      <details>
        <summary>标准与术语</summary>
        <div className="sc-help">
          {cat.standards.map((s) => (
            <p key={s.id}>
              <strong>
                {s.id} {s.name}
              </strong>
              <br />
              {s.basis}
              {s.url && (
                <>
                  {" "}
                  <a href={s.url} target="_blank" rel="noreferrer">
                    标准目录
                  </a>
                </>
              )}
            </p>
          ))}
          {cat.terms.map((t) => (
            <p key={t.key}>
              <strong>{t.name}</strong>　{t.definition}
            </p>
          ))}
        </div>
      </details>
    </section>
  );
}

function Accounting({ data, edit }) {
  const [mode, setMode] = useState(
    Object.keys(data.ledger || {}).length ? "ledger" : "direct",
  );
  return (
    <div className="sc-section">
      <h3>全库计量与设计指标</h3>
      <div className="sc-grid">
        <Field
          label="账面库存来源"
          value={mode}
          options={[
            ["direct", "直接录入已核实值"],
            ["ledger", "从计量平衡计算"],
          ]}
          onChange={(v) => {
            setMode(v);
            edit({ book_inventory: null, ledger: {} });
          }}
        />
        {mode === "direct" ? (
          <>
            <Field
              label="起始状态账面库存（亿m³）"
              value={data.book_inventory}
              type="number"
              onChange={(v) => edit({ book_inventory: v })}
            />
            <Field
              label="账面库存依据"
              value={data.sources?.book_inventory}
              onChange={(v) =>
                edit({ sources: { ...data.sources, book_inventory: v } })
              }
            />
          </>
        ) : (
          <>
            {[
              ["initial_inventory", "期初库存"],
              ["injected", "累计注气"],
              ["withdrawn", "累计采气"],
              ["metered_loss", "已核实损耗"],
              ["equivalent_gas", "液体当量气采出量"],
            ].map(([k, l]) => (
              <Field
                key={k}
                label={l + "（亿m³）"}
                value={data.ledger?.[k]}
                type="number"
                onChange={(v) => edit({ ledger: { ...data.ledger, [k]: v } })}
              />
            ))}
            <Field
              label="计量区间与来源"
              value={data.ledger?.source}
              onChange={(v) => edit({ ledger: { ...data.ledger, source: v } })}
              wide
            />
          </>
        )}
        <Field
          label="设计库容量（亿m³）"
          value={data.design.capacity}
          type="number"
          onChange={(v) => edit({ design: { ...data.design, capacity: v } })}
        />
        <Field
          label="设计工作气量（亿m³）"
          value={data.design.working_gas}
          type="number"
          onChange={(v) => edit({ design: { ...data.design, working_gas: v } })}
        />
        <Field
          label="设计冲峰能力（万m³/d）"
          value={data.design.peak_rate}
          type="number"
          onChange={(v) => edit({ design: { ...data.design, peak_rate: v } })}
        />
        <Field
          label="设计依据"
          value={data.design.source}
          onChange={(v) => edit({ design: { ...data.design, source: v } })}
          wide
        />
      </div>
      <p className="sc-note">
        计量平衡应结束于本次采气段起始状态。损耗、液体当量气需显式填写核实值或零；它们与未动用库存分开计算。
      </p>
    </div>
  );
}

function Methods({ data, edit, cat }) {
  const change = (i, patch) =>
    edit({
      units: data.units.map((u, j) => (i === j ? { ...u, ...patch } : u)),
    });
  return (
    <section>
      {!data.units.length && (
        <p className="sc-note">请先在评估范围中添加单元。</p>
      )}
      {data.units.map((u, i) => {
        const m = cat.methods.find((m) => m.id === u.method) || cat.methods[0];
        const cond = (k, v) =>
          change(i, { conditions: { ...u.conditions, [k]: v } });
        const param = (k, v) =>
          change(i, {
            parameters: { ...u.parameters, [k]: v },
            evidence: {
              ...u.evidence,
              ...(u.evidence?.[k]
                ? {
                    [k]: {
                      ...u.evidence[k],
                      edited: true,
                      location:
                        "手工修改；原始定位：" +
                        (u.evidence[k].original_location ||
                          u.evidence[k].location),
                      original_location:
                        u.evidence[k].original_location ||
                        u.evidence[k].location,
                    },
                  }
                : {}),
            },
          });
        const ext = (k, v) =>
          change(i, { external: { ...u.external, [k]: v } });
        return (
          <div className="sc-unit" key={i}>
            <div className="sc-unit-top">
              <h3>{u.name}</h3>
              <span className="sc-muted">
                {m.mode === "external" ? "真实外部成果复核" : "确定性计算"}
              </span>
            </div>
            <div className="sc-grid">
              <Field
                label="主评估方法"
                value={u.method}
                options={cat.methods.map((m) => [m.id, m.name])}
                onChange={(v) => change(i, { method: v })}
              />
              <Field
                label="水体影响"
                value={u.conditions.water_drive}
                options={[
                  ["unknown", "尚未判断"],
                  ["none", "无水侵"],
                  ["weak", "弱水侵，已论证可忽略"],
                  ["moderate", "中等水侵"],
                  ["strong", "强水侵"],
                ]}
                onChange={(v) => cond("water_drive", v)}
              />
              <Field
                label="流体与相态"
                value={u.conditions.fluid}
                options={[
                  ["unknown", "尚未判断"],
                  ["dry_gas", "干气，气相为主"],
                  ["stable_gas", "油环／凝析影响已论证可忽略"],
                  ["oil", "油环或油气水传质显著"],
                  ["condensate", "凝析影响显著"],
                ]}
                onChange={(v) => cond("fluid", v)}
              />
              <Field
                label="井间干扰"
                value={u.conditions.interference}
                options={[
                  ["unknown", "尚未判断"],
                  ["none", "无明显干扰"],
                  ["weak", "弱干扰、井控范围不重叠"],
                  ["strong", "强干扰"],
                ]}
                onChange={(v) => cond("interference", v)}
              />
              <Field
                label="参数与适用性依据"
                value={u.source}
                onChange={(v) => change(i, { source: v })}
                wide
              />
              <Field
                label="适用条件确认方式"
                value={u.condition_basis || "verified"}
                options={[
                  ["verified", "经资料核查确认"],
                  ["reported", "沿用原报告前提，作条件复算"],
                ]}
                onChange={(v) => change(i, { condition_basis: v })}
              />
            </div>
            <Check
              label="已核实本单元压力／体积的代表性、单元边界及取值依据"
              value={u.conditions.pressure_representative}
              onChange={(v) => cond("pressure_representative", v)}
            />
            {["pz", "pz_regression", "water_mbe"].includes(u.method) && (
              <Check
                label="本段内无同期注气，孔隙体积可近似不变；两状态压力使用相同口径"
                value={u.conditions.closed_during_segment}
                onChange={(v) => cond("closed_during_segment", v)}
              />
            )}
            {u.method === "water_mbe" && (
              <Check
                label="水侵量、产水量与水体积系数已有独立核实依据"
                value={u.conditions.water_volume_verified}
                onChange={(v) => cond("water_volume_verified", v)}
              />
            )}
            <p className="sc-note">
              {m.condition}
              <br />
              {m.reference}
            </p>
            <div className="sc-formula">{m.formula}</div>
            <div className="sc-grid">
              {m.fields.map((k) => (
                <Field
                  key={k}
                  label={`${cat.fields[k].label}（${cat.fields[k].unit}）${
                    m.required.includes(k) ? " *" : ""
                  }`}
                  type="number"
                  value={u.parameters[k]}
                  onChange={(v) => param(k, v)}
                />
              ))}
            </div>
            {u.method === "pz_regression" && (
              <TableEditor
                title="同一采气段 p/Z 序列"
                columns={["cumulative_produced", "pressure", "z"]}
                rows={u.series || []}
                onChange={(v) => change(i, { series: v })}
              />
            )}
            {m.mode === "external" && (
              <>
                <div className="sc-grid">
                  {[
                    ["software", "解释／模拟软件"],
                    ["model_version", "模型版本"],
                    ["run_id", "运行编号"],
                    ["input_reference", "输入版本／校验摘要"],
                    ["source", "成果文件与位置"],
                    ["cycle_id", "成果周期"],
                    ["state", "成果起始状态"],
                    ["match_metric", "历史拟合指标"],
                    ["match_unit", "拟合指标单位"],
                  ].map(([k, l]) => (
                    <Field
                      key={k}
                      label={l}
                      value={u.external?.[k]}
                      onChange={(v) => ext(k, v)}
                    />
                  ))}
                  {[
                    "effective_inventory",
                    "geological_swing",
                    "deliverable_swing",
                    "movable_cushion",
                    "capacity",
                    "working_gas",
                  ].map((k) => (
                    <Field
                      key={k}
                      label={
                        (cat.terms.find((t) => t.key === k)?.name || k) +
                        "（亿m³）"
                      }
                      value={u.external?.[k]}
                      type="number"
                      onChange={(v) => ext(k, v)}
                    />
                  ))}
                </div>
                <Check
                  label="外部气量已换算为亿标准 m³，且标准状态与当前评估一致"
                  value={
                    u.external?.gas_volume_unit === "1e8_sm3" &&
                    JSON.stringify(u.external?.standard) ===
                      JSON.stringify(data.standard)
                  }
                  onChange={(v) =>
                    change(i, {
                      external: {
                        ...u.external,
                        gas_volume_unit: v ? "1e8_sm3" : "",
                        standard: v ? clone(data.standard) : null,
                      },
                    })
                  }
                />
                <TableEditor
                  title="历史拟合记录"
                  columns={["observed", "simulated"]}
                  rows={u.external?.history_match || []}
                  onChange={(v) => ext("history_match", v)}
                />
              </>
            )}
            {["pz", "pz_regression", "volumetric"].includes(u.method) && (
              <details>
                <summary>PVT 数据与插值</summary>
                <p className="sc-muted">
                  对应 Z
                  未填写时，使用下表线性插值。保留压力和温度条件，不外推。
                </p>
                <TableEditor
                  title="PVT 表"
                  columns={["pressure", "z"]}
                  rows={u.pvt || []}
                  onChange={(v) => change(i, { pvt: v })}
                />
              </details>
            )}
            {u.method === "pz" && (
              <details>
                <summary>测压加权计算</summary>
                <p className="sc-muted">
                  填入记录后，以加权结果替代本单元相应压力。只合并同一状态、同一压力基准且具有代表性的井；权重应有独立依据，不能跨连通单元平均。
                </p>
                <div className="sc-grid">
                  <Field
                    label="权重依据"
                    value={u.pressure_weight_basis}
                    onChange={(v) => change(i, { pressure_weight_basis: v })}
                  />
                  <Field
                    label="测压状态与来源"
                    value={u.pressure_source}
                    onChange={(v) => change(i, { pressure_source: v })}
                  />
                </div>
                <TableEditor
                  title="起始状态测压"
                  columns={["name", "pressure", "weight"]}
                  rows={u.start_pressures || []}
                  onChange={(v) => change(i, { start_pressures: v })}
                />
                <TableEditor
                  title="末期状态测压"
                  columns={["name", "pressure", "weight"]}
                  rows={u.end_pressures || []}
                  onChange={(v) => change(i, { end_pressures: v })}
                />
              </details>
            )}
            {u.method === "pz" && (
              <details>
                <summary>输入敏感性</summary>
                <Field
                  label="单因素扰动幅度（%，不大于 10）"
                  type="number"
                  value={u.sensitivity_percent}
                  onChange={(v) => change(i, { sensitivity_percent: v })}
                />
                <p className="sc-muted">
                  逐项扰动采气量、压力和 Z，显示结果变化；不作为概率置信区间。
                </p>
              </details>
            )}
            <details>
              <summary>综合调峰与冲峰约束</summary>
              <div className="sc-grid">
                <Field
                  label="方案采气期（天）"
                  value={u.withdrawal_days}
                  type="number"
                  onChange={(v) => change(i, { withdrawal_days: v })}
                />
                <Field
                  label="单元地面处理限额（万m³/d）"
                  value={u.surface_limit}
                  type="number"
                  onChange={(v) => change(i, { surface_limit: v })}
                />
                <Field
                  label="预测曲线依据与外输条件"
                  value={u.schedule_source}
                  onChange={(v) => change(i, { schedule_source: v })}
                />
              </div>
              <p className="sc-note">
                曲线输入为各时间段平均日采气量，必须覆盖完整采气期。算法分段积分并施加地面上限，再与地层调峰气量取小值。井底压力需来自井筒／管网计算，不以井口压力替代。
              </p>
              <TableEditor
                title="采气预测"
                columns={["day", "rate"]}
                rows={u.schedule || []}
                onChange={(v) => change(i, { schedule: v })}
              />
              <TableEditor
                title="二项式产能"
                columns={[
                  "name",
                  "a",
                  "b",
                  "reservoir_pressure",
                  "bottomhole_pressure",
                ]}
                rows={u.wells || []}
                onChange={(v) => change(i, { wells: v })}
              />
            </details>
          </div>
        );
      })}
      {data.units.length > 1 && (
        <Check
          label="各单元地面设施及外输通道完全独立，可按同周期成果汇总综合调峰能力"
          value={data.independent_surface}
          onChange={(v) => edit({ independent_surface: v })}
        />
      )}
      <Field
        label="项目假设与待确认事项"
        type="textarea"
        value={data.assumptions}
        onChange={(v) => edit({ assumptions: v })}
      />
      {data.units.length > 1 && (
        <Field
          label="全库共用地面处理能力（万m³/d）"
          type="number"
          value={data.site_surface_limit}
          onChange={(v) => edit({ site_surface_limit: v })}
        />
      )}
      <p className="sc-note">
        保存后运行计算。条件不满足或资料不齐全时，展示具体缺项，其他单元可独立完成；全库指标只在完整范围具备同口径结果时汇总。
      </p>
    </section>
  );
}

function Results({ evaluation, review, cat, stale, busy, onReview }) {
  if (!evaluation)
    return (
      <div className="sc-empty">
        <h2>尚未计算</h2>
        <p>
          确认评估范围和输入参数后，运行计算即可查看分单元结果、缺项与方法建议。
        </p>
      </div>
    );
  const e = evaluation;
  return (
    <section>
      <div className="sc-results-head">
        <div>
          <h3>{e.status === "calculated" ? "计算结果" : "待补充资料与条件"}</h3>
          <p className="sc-muted">{e.summary}</p>
        </div>
        <button disabled={stale || busy} onClick={onReview}>
          方法审查
        </button>
      </div>
      {stale && (
        <p className="sc-note">
          输入已修改，以下为上次计算快照。重新计算后才能生成当前报告。
        </p>
      )}
      {e.metrics.length > 0 && (
        <div className="sc-metrics">
          {e.metrics
            .filter((m) =>
              [
                "book_inventory",
                "effective_inventory",
                "deliverable_swing",
                "capacity",
                "working_gas",
              ].includes(m.key),
            )
            .slice(0, 3)
            .map((m) => (
              <div className="sc-metric" key={m.key}>
                <span>{m.label}</span>
                <strong>
                  {num(m.value)}
                  <small>{m.unit}</small>
                </strong>
              </div>
            ))}
        </div>
      )}
      <div className="sc-table-wrap">
        <table className="sc-table">
          <thead>
            <tr>
              <th>指标</th>
              <th>结果</th>
              <th>单位</th>
              <th>依据</th>
            </tr>
          </thead>
          <tbody>
            {e.metrics.map((m) => (
              <tr key={m.key}>
                <td>{m.label}</td>
                <td className="sc-number">{num(m.value)}</td>
                <td>{m.unit}</td>
                <td>{m.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sc-section">
        <h3>资料与口径检查</h3>
        <div className="sc-table-wrap">
          <table className="sc-table">
            <tbody>
              {e.checks.map((c, i) => (
                <tr key={i}>
                  <td>{c.label}</td>
                  <td
                    className={
                      "sc-" + (c.status === "passed" ? "ok" : c.status)
                    }
                  >
                    {
                      { passed: "通过", warning: "需复核", error: "待补充" }[
                        c.status
                      ]
                    }
                  </td>
                  <td>{c.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {e.comparisons?.length > 0 && (
        <div className="sc-section">
          <h3>交叉校验</h3>
          <div className="sc-table-wrap">
            <table className="sc-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>计算值</th>
                  <th>对比值</th>
                  <th>偏差</th>
                  <th>依据</th>
                </tr>
              </thead>
              <tbody>
                {e.comparisons.map((r, i) => (
                  <tr key={i}>
                    <td>
                      {cat.terms.find((t) => t.key === r.metric)?.name ||
                        r.metric}
                    </td>
                    <td>{num(r.calculated)}</td>
                    <td>{num(r.value)}</td>
                    <td>{num(r.difference_percent)}%</td>
                    <td>{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {e.units.map((u, i) => (
        <div className="sc-unit" key={i}>
          <div className="sc-unit-top">
            <h3>{u.name}</h3>
            <span className="sc-muted">
              {cat.methods.find((m) => m.id === u.method)?.name} ·{" "}
              {u.status === "calculated" ? "已计算" : "待补充"}
            </span>
          </div>
          {u.errors.map((v, j) => (
            <p className="sc-error" key={j}>
              {v}
            </p>
          ))}
          <p className="sc-note">
            方法建议：
            {cat.methods.find((m) => m.id === u.recommendation.method)?.name}。
            {u.recommendation.reason}
          </p>
          {u.warnings?.map((v, j) => (
            <p className="sc-warning" key={j}>
              {v}
            </p>
          ))}
          {u.steps?.map((v, j) => (
            <div className="sc-formula" key={j}>
              {v}
            </div>
          ))}
          {u.plot && <Plot points={u.plot} />}
          <div className="sc-table-wrap">
            <table className="sc-table">
              <tbody>
                {Object.entries(u.values || {}).map(([k, v]) => (
                  <tr key={k}>
                    <td>
                      {cat.terms.find((t) => t.key === k)?.name ||
                        {
                          cushion: "压力窗口下限气量",
                          effective_capacity: "有效库容量",
                        }[k] ||
                        k}
                    </td>
                    <td className="sc-number">{num(v)}</td>
                    <td>{k === "peak_rate" ? "万m³/d" : "亿m³"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {u.diagnostics && (
            <details>
              <summary>拟合与计算诊断</summary>
              <div className="sc-table-wrap">
                <table className="sc-table">
                  <tbody>
                    {Object.entries(u.diagnostics)
                      .filter(([k]) => k !== "residuals")
                      .map(([k, v]) => (
                        <tr key={k}>
                          <td>
                            {{
                              start_pz: "起始 p/Z",
                              end_pz: "末期 p/Z",
                              inverse_withdrawal_fraction: "撤采比例倒数",
                              intercept: "回归截距",
                              slope: "回归斜率",
                              r_squared: "拟合优度 R²",
                              rmse: "均方根误差",
                              mae: "平均绝对误差",
                              n: "样本数",
                              metric: "指标",
                              unit: "单位",
                              schedule_integral: "采气曲线积分（亿m³）",
                              net_water_reservoir_m3: "净水侵量（地层m³）",
                              bg_depletion: "体积系数变化",
                            }[k] || k}
                          </td>
                          <td>{typeof v === "number" ? num(v) : String(v)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
          {u.sensitivity && (
            <details>
              <summary>输入扰动 ±{u.sensitivity.percent}%</summary>
              <p className="sc-muted">{u.sensitivity.label}</p>
              <table className="sc-table">
                <thead>
                  <tr>
                    <th>输入</th>
                    <th>负向扰动结果</th>
                    <th>正向扰动结果</th>
                  </tr>
                </thead>
                <tbody>
                  {u.sensitivity.rows.map((r) => (
                    <tr key={r.parameter}>
                      <td>{r.parameter}</td>
                      <td>{num(r.minus)}</td>
                      <td>{num(r.plus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
        </div>
      ))}
      <div className="sc-section">
        <h3>工程方法审查</h3>
        <div className="sc-prose">
          {review?.status === "completed"
            ? review.text
            : "尚未调用库存评价智能体。需要判断方法、压力代表性或差异原因时，点击“方法审查”。计算结果不依赖智能体可用性。"}
        </div>
      </div>
      <details>
        <summary>计算记录</summary>
        <p className="sc-muted">
          版本 {e.engine_version}，实际计算耗时 {e.duration_ms} ms，
          {new Date(e.created_at).toLocaleString("zh-CN")}
        </p>
        <p className="sc-prose">输入 SHA-256：{e.fingerprint}</p>
      </details>
    </section>
  );
}

function App() {
  const [cat, setCat] = useState(null),
    [cases, setCases] = useState([]),
    [record, setRecord] = useState(null),
    [tab, setTab] = useState("scope"),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [evaluation, setEvaluation] = useState(null),
    [review, setReview] = useState(null),
    [doc, setDoc] = useState(null),
    [preview, setPreview] = useState("");
  const fileRef = useRef(),
    generation = useRef(0);
  const data = record?.case;
  const run = async (action) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      return await action();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const refresh = async () => setCases((await request("/cases")).cases);
  useEffect(() => {
    let active = true;
    Promise.all([request("/catalog"), request("/cases")])
      .then(([c, r]) => {
        if (active) {
          setCat(c);
          setCases(r.cases);
        }
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
      generation.current++;
    };
  }, []);
  const edit = (patch) => {
    if (busy) return;
    setRecord((r) => ({ ...r, case: { ...r.case, ...patch }, stale: true }));
    setDirty(true);
    setPreview("");
  };
  const accept = (r) => {
    setRecord(r);
    setDirty(false);
    setEvaluation(r.evaluation || null);
    setReview(r.review || null);
    setDoc(null);
    setPreview("");
  };
  const save = async () => {
    if (!dirty) return record;
    const r = await request(
      `/cases/${record.id}`,
      json({ revision: record.revision, case: record.case }, "PUT"),
    );
    setRecord(r);
    setDirty(false);
    await refresh();
    return r;
  };
  const open = (id) =>
    run(async () => {
      if (record && dirty) await save();
      const ticket = ++generation.current,
        r = await request(`/cases/${id}`);
      if (ticket === generation.current) {
        accept(r);
        setTab("scope");
      }
    });
  const create = () =>
    run(async () => {
      if (record && dirty) await save();
      accept(await request("/cases", json({})));
      setTab("scope");
      await refresh();
    });
  const calculate = () =>
    run(async () => {
      const r = await save();
      const e = await request(
        `/cases/${r.id}/evaluate`,
        json({ revision: r.revision }),
      );
      setEvaluation(e);
      setReview(null);
      setRecord({ ...r, latest_run: e.run_id, stale: false });
      setPreview("");
      setTab("results");
    });
  const upload = (files) =>
    run(async () => {
      if (!files.length) return;
      const r = await save(),
        fd = new FormData();
      fd.append("revision", r.revision);
      Array.from(files).forEach((f) => fd.append("files", f));
      const next = await request(`/cases/${r.id}/documents`, {
        method: "POST",
        body: fd,
      });
      setRecord({ ...next, stale: true });
      setPreview("");
      await refresh();
    });
  const apply = (kind, records, index) => {
    if (kind === "case") {
      edit({
        ...normalizeCase(records, cat.unit_template),
        documents: data.documents,
      });
      setTab("scope");
      return;
    }
    if (kind === "units") {
      const names = new Set(data.units.map((u) => u.name));
      if (
        records.some((r) => names.has(r.name)) ||
        new Set(records.map((r) => r.name)).size !== records.length
      ) {
        setError("单元名称重复，请先核对范围或修改名称。现有单元未覆盖。");
        return;
      }
      edit({ units: [...data.units, ...records] });
    } else if (kind === "history") edit({ history: records });
    else {
      const units = clone(data.units);
      if (!units[index]) {
        setError("请先创建目标评估单元");
        return;
      }
      if (kind === "history_match")
        units[index].external.history_match = records;
      else units[index][kind] = records;
      edit({ units });
    }
    setDoc(null);
    setError("");
  };
  const stale = dirty || record?.stale || !evaluation;
  return (
    <div className="sc-app">
      <aside className="sc-sidebar">
        <div>
          <h1>库容评估</h1>
          <span className="sc-muted">UGSci 工程应用</span>
        </div>
        <button className="sc-primary" disabled={busy || !cat} onClick={create}>
          新建评估
        </button>
        <div>
          <p className="sc-muted">评估项目</p>
          <nav className="sc-projects" aria-label="评估项目">
            {cases.map((c) => (
              <button
                key={c.id}
                disabled={busy}
                aria-current={record?.id === c.id ? "page" : undefined}
                onClick={() => open(c.id)}
              >
                <strong>{c.name}</strong>
                <span>{c.cycle || "周期待填写"}</span>
              </button>
            ))}
          </nav>
          {!cases.length && <p className="sc-muted">尚无评估项目</p>}
        </div>
        <footer>
          按单元计算，按周期留存
          <br />
          SY/T 7686-2023
        </footer>
      </aside>
      <main className="sc-main">
        <header className="sc-header">
          <div>
            <h2>{data?.case_name || "库容评估工作台"}</h2>
            <span className="sc-muted">
              {record
                ? `${data.cycle_id || "评估周期待填写"}　${
                    busy ? "正在处理…" : dirty ? "有未保存修改" : "已保存"
                  }`
                : "建立评估项目，整理资料并形成报告"}
            </span>
          </div>
          {record && (
            <div className="sc-actions">
              <button disabled={busy || !dirty} onClick={() => run(save)}>
                保存
              </button>
              <button
                className="sc-primary"
                disabled={busy}
                onClick={calculate}
              >
                运行计算
              </button>
            </div>
          )}
        </header>
        {record && (
          <nav className="sc-tabs" role="tablist" aria-label="评估步骤">
            {tabs.map(([key, title], i) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                disabled={busy}
                onClick={() => setTab(key)}
              >
                {i + 1}. {title}
              </button>
            ))}
          </nav>
        )}
        {error && (
          <div role="alert" className="sc-alert">
            <span>{error}</span>
            <button className="sc-link" onClick={() => setError("")}>
              关闭
            </button>
          </div>
        )}
        <div className="sc-body" aria-busy={busy}>
          {!cat ? (
            <p className="sc-muted">正在读取工作台…</p>
          ) : !record ? (
            <div className="sc-empty">
              <h2>从一份评估项目开始</h2>
              <p>
                按储气库类型与资料条件选择方法。支持
                Excel、CSV、报告及外部模拟成果，保留输入依据和计算过程，生成可复核的库容评估报告。
              </p>
              <button className="sc-primary" onClick={create} disabled={busy}>
                新建评估
              </button>
            </div>
          ) : (
            <>
              {tab === "scope" && <Scope data={data} edit={edit} cat={cat} />}
              {tab === "data" && (
                <section>
                  <div className="sc-section">
                    <div className="sc-upload">
                      <div>
                        <strong>导入评估资料</strong>
                        <p>
                          Excel、CSV、JSON、PPTX、PDF、Word。保留原件，选择字段后应用。
                        </p>
                      </div>
                      <button
                        disabled={busy}
                        onClick={() => fileRef.current.click()}
                      >
                        选择文件
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        multiple
                        accept=".xlsx,.csv,.tsv,.json,.pptx,.pdf,.docx,.txt,.md"
                        hidden
                        aria-label="上传评估资料"
                        onChange={(e) => {
                          upload(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <div className="sc-table-wrap">
                      <table className="sc-table">
                        <tbody>
                          {data.documents.map((d) => (
                            <tr key={d.id}>
                              <td>{d.name}</td>
                              <td>
                                {d.tables.length} 张表 / {d.pages.length} 段文字
                              </td>
                              <td>
                                {d.status === "manual_review"
                                  ? "待人工读取"
                                  : "已读取，待核对"}
                              </td>
                              <td>
                                <button
                                  className="sc-link"
                                  disabled={busy}
                                  onClick={() =>
                                    run(async () =>
                                      setDoc(
                                        await request(
                                          `/cases/${record.id}/documents/${d.id}`,
                                        ),
                                      ),
                                    )
                                  }
                                >
                                  查看与映射
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {doc && (
                      <SourcePanel
                        key={doc.id}
                        doc={doc}
                        cat={cat}
                        record={record}
                        apply={apply}
                        run={run}
                      />
                    )}
                  </div>
                  <Accounting data={data} edit={edit} />
                  <details>
                    <summary>多周期成果</summary>
                    <p className="sc-muted">
                      可从表格映射导入或填写历史成果，单位为亿m³；冲峰能力为万m³/d。历史成果不自动替代本次计算。
                    </p>
                    <TableEditor
                      title="历史指标"
                      columns={[
                        "cycle_id",
                        "book_inventory",
                        "effective_inventory",
                        "deliverable_swing",
                        "peak_rate",
                        "source",
                      ]}
                      rows={data.history || []}
                      onChange={(v) => edit({ history: v })}
                    />
                  </details>
                </section>
              )}
              {tab === "methods" && (
                <Methods data={data} edit={edit} cat={cat} />
              )}
              {tab === "results" && (
                <>
                  <Results
                    evaluation={evaluation}
                    review={review}
                    cat={cat}
                    stale={stale}
                    busy={busy}
                    onReview={() =>
                      run(async () =>
                        setReview(
                          await request(
                            `/cases/${record.id}/review`,
                            json({ revision: record.revision }),
                          ),
                        ),
                      )
                    }
                  />
                  <details>
                    <summary>对比成果与项目提示阈值</summary>
                    <Field
                      label="偏差提示阈值（%，项目设置，非行业标准）"
                      value={data.comparison_tolerance_percent}
                      type="number"
                      onChange={(v) =>
                        edit({ comparison_tolerance_percent: v })
                      }
                    />
                    {(data.benchmarks || []).map((b, i) => (
                      <div className="sc-unit" key={i}>
                        <div className="sc-grid">
                          {[
                            ["metric", "指标"],
                            ["value", "报告／其他方法值"],
                            ["source", "成果来源"],
                            ["cycle_id", "周期"],
                            ["state", "状态"],
                          ].map(([k, l]) => (
                            <Field
                              key={k}
                              label={l}
                              type={k === "value" ? "number" : "text"}
                              value={b[k]}
                              options={
                                k === "metric"
                                  ? cat.terms
                                      .filter((t) =>
                                        [
                                          "effective_inventory",
                                          "geological_swing",
                                          "deliverable_swing",
                                          "capacity",
                                          "working_gas",
                                          "peak_rate",
                                        ].includes(t.key),
                                      )
                                      .map((t) => [t.key, t.name])
                                  : undefined
                              }
                              onChange={(v) =>
                                edit({
                                  benchmarks: data.benchmarks.map((r, j) =>
                                    j === i ? { ...r, [k]: v } : r,
                                  ),
                                })
                              }
                            />
                          ))}
                        </div>
                        <button
                          className="sc-link"
                          onClick={() =>
                            edit({
                              benchmarks: data.benchmarks.filter(
                                (_, j) => j !== i,
                              ),
                            })
                          }
                        >
                          移除对比成果
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        edit({
                          benchmarks: [
                            ...(data.benchmarks || []),
                            {
                              metric: "effective_inventory",
                              value: null,
                              source: "",
                              cycle_id: data.cycle_id,
                              state: data.start_state,
                            },
                          ],
                        })
                      }
                    >
                      添加对比成果
                    </button>
                  </details>
                </>
              )}
              {tab === "report" && (
                <section>
                  <div className="sc-section">
                    <h3>库容评估报告</h3>
                    <p className="sc-muted">
                      报告包含范围、数据来源、适用条件、分单元计算、交叉校验、资料缺项与复核状态。资料不齐时导出带缺项的阶段报告。
                    </p>
                    <Field
                      label="项目复核意见"
                      type="textarea"
                      value={data.review_notes}
                      onChange={(v) => edit({ review_notes: v })}
                      wide
                    />
                    <p className="sc-note">
                      {stale
                        ? "尚无当前输入的计算结果。请保存并重新计算。"
                        : "当前报告绑定本次计算快照；更改输入后需重新计算。"}
                    </p>
                    <div className="sc-actions">
                      <button
                        disabled={busy || stale}
                        onClick={() =>
                          run(async () =>
                            setPreview(
                              await (
                                await request(
                                  `/cases/${record.id}/report?format=html`,
                                  undefined,
                                  true,
                                )
                              ).text(),
                            ),
                          )
                        }
                      >
                        预览报告
                      </button>
                      {[
                        ["docx", "导出 Word"],
                        ["html", "导出打印版"],
                        ["zip", "下载复算包"],
                        ["json", "导出计算记录"],
                      ].map(([format, label]) => (
                        <button
                          key={format}
                          disabled={busy || stale}
                          onClick={() =>
                            run(() =>
                              download(
                                `/cases/${record.id}/report?format=${format}`,
                                `${data.case_name}-库容评估报告.${format}`,
                              ),
                            )
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {preview && (
                    <iframe
                      title="库容评估报告预览"
                      className="sc-report-preview"
                      sandbox=""
                      srcDoc={preview}
                    />
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Legacy API paths remain available for existing clients: /storage-capacity/evaluate,
// /storage-capacity/ingest (ready_for_evaluation). This page uses durable v2 cases.
function ScopedApp() {
  const selected = Q.host.useSelectedAgent?.();
  return <App key={selected?.id || "default"} />;
}
Q.registerRoutes("storage-capacity", [
  {
    path: "/apps/storage-capacity",
    component: ScopedApp,
    label: "库容评估工作台",
    icon: "SC",
  },
]);
