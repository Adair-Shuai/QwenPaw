// Display-only chart models. Engineering calculations stay in the backend.
export const metricLabels = {
  effective_inventory: "有效库存",
  book_inventory: "账面库存",
  inactive_inventory: "未动用库存",
  geological_swing: "地层调峰气量",
  movable_cushion: "可动垫气",
  working_gas: "工作气量",
  capacity: "上限库容量",
  effective_capacity: "有效库容量",
  cushion: "下限气量",
  deliverable_swing: "综合调峰能力",
  peak_rate: "冲峰能力",
};
export const numeric = (v) =>
  v !== null &&
  v !== undefined &&
  v !== "" &&
  typeof v !== "boolean" &&
  Number.isFinite(Number(v))
    ? Number(v)
    : null;
const series = (name, rows, x, y, extra = {}) => ({
  name,
  points: rows.map((r, i) => ({
    x: numeric(x(r, i)),
    y: numeric(y(r, i)),
    label: r.name || r.状态 || "",
  })),
  ...extra,
});
const bar = (id, title, labels, sets, unit, note = "") => ({
  id,
  title,
  type: "bar",
  labels,
  series: sets,
  xLabel: "",
  yLabel: unit,
  note,
});
const line = (id, title, sets, xLabel, yLabel, note = "") => ({
  id,
  title,
  type: "line",
  series: sets,
  xLabel,
  yLabel,
  note,
});
const table = (id, title, columns, rows, note = "") => ({
  id,
  title,
  type: "table",
  columns,
  rows,
  note,
});
const bars = (name, vals) => ({
  name,
  points: vals.map((y, x) => ({ x, y: numeric(y) })),
});
const finiteCount = (chart) =>
  chart.type === "table"
    ? chart.rows.length
    : chart.series.reduce(
        (n, s) =>
          n + s.points.filter((p) => p.x !== null && p.y !== null).length,
        0,
      );
const counts = (d, key) => (Array.isArray(d[key]) ? d[key].length : null);

export function buildCharts({ node, project, unit, run, evaluation, cat }) {
  const c = project || {},
    u = unit || {},
    r = run || {},
    p = r.resolved_parameters || u.parameters || {},
    values = r.values || {},
    rows = r.rows || [],
    charts = [];
  const add = (chart) => {
    if (finiteCount(chart)) charts.push(chart);
  };
  const label = (k) => metricLabels[k] || cat?.fields?.[k]?.label || k;
  const totals = (vals, prefix = "指标") => {
    const gas = Object.entries(vals).filter(
      ([k, v]) => k in metricLabels && k !== "peak_rate" && numeric(v) !== null,
    );
    if (gas.length)
      add(
        bar(
          "volumes",
          prefix + "对比",
          gas.map(([k]) => label(k)),
          [
            bars(
              "气量",
              gas.map(([, v]) => v),
            ),
          ],
          "亿标准 m³",
          "指标对应的状态与约束不同，不作堆叠或相加。",
        ),
      );
    if (numeric(vals.peak_rate) !== null)
      add(
        bar(
          "peak",
          "冲峰能力",
          ["本次工况"],
          [bars("日采气能力", [vals.peak_rate])],
          "万标准 m³/d",
        ),
      );
  };
  if (node === "scope") {
    add(
      table(
        "boundary",
        "评估单元与方法",
        ["单元", "主方法", "边界依据"],
        (c.units || []).map((a) => [
          a.name,
          cat?.methods?.find((m) => m.id === a.method)?.name || "待判断",
          a.source || "待填写",
        ]),
        "按层系、连通区或独立盐穴划分；本表不代替地质平面图。",
      ),
    );
  } else if (node === "data") {
    const docs = c.documents || [];
    add(
      bar(
        "sources",
        "资料提取概况",
        docs.map((d) => d.name),
        [
          bars(
            "表格",
            docs.map((d) => counts(d, "tables")),
          ),
          bars(
            "文本段",
            docs.map((d) => counts(d, "pages")),
          ),
        ],
        "数量",
        "提取数量不代表资料质量，扫描图片与公式仍需核对原件。",
      ),
    );
  } else if (node === "accounting") {
    const l = c.ledger || {},
      keys = [
        "initial_inventory",
        "injected",
        "withdrawn",
        "metered_loss",
        "equivalent_gas",
      ];
    if (c.book_inventory == null && keys.every((k) => numeric(l[k]) !== null)) {
      add(
        bar(
          "ledger",
          "计量收支分项",
          ["期初库存", "注气", "采气扣减", "损耗扣减", "当量气扣减"],
          [
            bars(
              "计量分项",
              keys.map((k, i) => (i < 2 ? 1 : -1) * Number(l[k])),
            ),
          ],
          "亿标准 m³",
          "正值为增加，负值为扣减；账面库存采用计量节点结果。",
        ),
      );
    }
    totals(values, "账面库存");
  } else if (node === "pvt") {
    const measured = [...(u.pvt || [])].sort(
      (a, b) => Number(a.pressure) - Number(b.pressure),
    );
    add(
      line(
        "pz-property",
        "压力—Z 因子",
        [
          series(
            "实验表",
            measured,
            (a) => a.pressure,
            (a) => a.z,
          ),
          series(
            "状态采用值",
            rows,
            (a) => a["压力 MPa"],
            (a) => a.Z,
            { scatter: true },
          ),
        ],
        "压力（MPa）",
        "Z（无量纲）",
        "参考呼图壁汇报第 45 页的物性对照；仅显示同温样品的数据，不外推。",
      ),
    );
    add(
      line(
        "bg",
        "压力—气体体积系数",
        [
          series(
            "状态换算",
            rows,
            (a) => a["压力 MPa"],
            (a) => a["Bg 地层m³/标准m³"],
            { scatter: true },
          ),
        ],
        "绝对压力（MPa）",
        "Bg（地层 m³/标准 m³）",
      ),
    );
  } else if (node === "pressure") {
    const actual = rows.length
      ? rows
      : [
          ...(u.start_pressures || []).map((a) => ({
            ...a,
            状态: "起始",
            井: a.name,
            "原始压力 MPa": a.pressure,
          })),
          ...(u.end_pressures || []).map((a) => ({
            ...a,
            状态: "末期",
            井: a.name,
            "原始压力 MPa": a.pressure,
          })),
        ];
    add(
      bar(
        "well-pressure",
        "测压与采用压力",
        actual.map((a) => `${a.井 || "单元"}·${a.状态}`),
        [
          bars(
            "实测值",
            actual.map((a) => a["原始压力 MPa"]),
          ),
          bars(
            "处理后采用值",
            actual.map((a) => a["采用压力 MPa"]),
          ),
        ],
        "压力（MPa）",
        "参考呼图壁第 41–44 页。实测、解释与加权值分开；短关井值不等于平衡压力。",
      ),
    );
    add(
      bar(
        "representative",
        "单元代表压力",
        ["起始", "末期"],
        [
          bars("代表压力", [
            values.injection_end_pressure,
            values.evaluation_pressure,
          ]),
        ],
        "压力（MPa）",
      ),
    );
  } else if (node === "connectivity") {
    const observations = u.connectivity?.series || [];
    add(
      line(
        "response",
        "井间同步压力响应",
        [
          series(
            "井 A",
            observations,
            (a) => a.time,
            (a) => a.x,
          ),
          series(
            "井 B",
            observations,
            (a) => a.time,
            (a) => a.y,
          ),
        ],
        "相对时间（原资料单位）",
        "压力（MPa）",
        "参考呼图壁第 16、41 页。无井位坐标和网格时不绘制压力场。",
      ),
    );
    add(
      line(
        "lag",
        "滞后相关诊断",
        [
          series(
            "相关系数",
            rows,
            (a) => a.滞后时间,
            (a) => a.相关系数,
          ),
        ],
        "滞后时间（原资料单位）",
        "相关系数",
        "相关性不能单独证明地质连通；须结合地质和试井解释。",
      ),
    );
  } else if (node === "methods") {
    add(
      table(
        "applicability",
        "方法适用性对照",
        ["方法", "条件检查"],
        rows.map((a) => [a.方法, a.适用检查]),
        "只展示明确条件，不生成任意评分或置信度。",
      ),
    );
  } else if (node === "inventory") {
    if (r.plot?.length) {
      add(
        line(
          "material-balance",
          "p/Z—累采量",
          [
            series(
              "观测",
              r.plot,
              (a) => a.x,
              (a) => a.y,
              { scatter: true },
            ),
            series(
              "回归",
              r.plot,
              (a) => a.x,
              (a) => a.fitted,
            ),
          ],
          "本段累采量（亿标准 m³）",
          "p/Z（MPa）",
          "拟合来自计算节点；不跨注采段连线。",
        ),
      );
      add(
        line(
          "residual",
          "回归残差",
          [
            series(
              "观测减拟合",
              r.plot,
              (a) => a.x,
              (a) =>
                numeric(a.y) !== null && numeric(a.fitted) !== null
                  ? a.y - a.fitted
                  : null,
            ),
          ],
          "本段累采量（亿标准 m³）",
          "残差（MPa）",
        ),
      );
    } else if (
      numeric(r.diagnostics?.start_pz) !== null &&
      numeric(p.produced_gas) !== null
    ) {
      add(
        line(
          "material-balance",
          "两状态 p/Z—累采量",
          [
            {
              name: "评估状态",
              points: [
                { x: 0, y: r.diagnostics.start_pz, label: "起始" },
                {
                  x: Number(p.produced_gas),
                  y: numeric(r.diagnostics.end_pz),
                  label: "末期",
                },
              ],
            },
          ],
          "本段累采量（亿标准 m³）",
          "p/Z（MPa）",
          "两点连线仅展示两状态关系，不作为多点拟合质量证据。",
        ),
      );
    }
    totals(values, "有效库存");
    if (r.sensitivity?.rows)
      add(
        bar(
          "sensitivity",
          "输入敏感性",
          r.sensitivity.rows.map((a) => a.parameter),
          [
            bars(
              `−${r.sensitivity.percent}%`,
              r.sensitivity.rows.map((a) => a.minus),
            ),
            bars(
              `+${r.sensitivity.percent}%`,
              r.sensitivity.rows.map((a) => a.plus),
            ),
          ],
          "有效库存（亿标准 m³）",
          "单因素扰动，非概率置信区间。",
        ),
      );
    const history = u.external?.history_match || [];
    add(
      line(
        "history-match",
        "外部成果历史拟合",
        [
          series(
            "观测",
            history,
            (_, i) => i + 1,
            (a) => a.observed,
          ),
          series(
            "模拟",
            history,
            (_, i) => i + 1,
            (a) => a.simulated,
          ),
        ],
        "原成果样本序号",
        u.external?.match_unit || "原成果单位（待核对）",
        "仅展示导入的专业软件成果，不代表工作台运行了模拟器。",
      ),
    );
  } else if (node === "window") {
    add(
      bar(
        "pressure-limits",
        "运行压力与评估状态",
        ["下限", "末期", "起始", "上限"],
        [
          bars("压力", [
            p.minimum_pressure,
            p.evaluation_pressure,
            p.injection_end_pressure,
            p.maximum_pressure,
          ]),
        ],
        "压力（MPa）",
        "压力顺序和口径以采用参数为准，不把视地层压力转换为绝压。",
      ),
    );
    totals(values, "压力窗口指标");
  } else if (node === "deliverability") {
    const dynamic = rows.filter((a) => a.日 !== undefined);
    if (dynamic.length) {
      add(
        line(
          "rate",
          "采气能力预测",
          [
            series(
              "日均采气量",
              dynamic,
              (a) => a.日,
              (a) => a["日均量 万m³/d"],
            ),
          ],
          "采气时间（d）",
          "万标准 m³/d",
          "参考呼图壁第 34 页；采用节点日步长计算，均值不等于瞬时冲峰能力。",
        ),
      );
      add(
        line(
          "forecast-pressure",
          "采气期地层压力",
          [
            series(
              "地层压力",
              dynamic,
              (a) => a.日,
              (a) => a["末期压力 MPa"],
            ),
          ],
          "采气时间（d）",
          "绝对压力（MPa）",
        ),
      );
      add(
        line(
          "cumulative",
          "累计采气与剩余库存",
          [
            series(
              "累计采气",
              dynamic,
              (a) => a.日,
              (a) => a["累计采气 亿m³"],
            ),
            series(
              "剩余有效库存",
              dynamic,
              (a) => a.日,
              (a) => a["剩余有效库存 亿m³"],
            ),
          ],
          "采气时间（d）",
          "亿标准 m³",
        ),
      );
    } else {
      add(
        line(
          "rate",
          "导入采气预测",
          [
            series(
              "区间平均日量",
              u.schedule || [],
              (a) => a.day,
              (a) => a.rate,
              { scatter: true },
            ),
          ],
          "区间结束日（d）",
          "万标准 m³/d",
          "各点是区间平均量，不按瞬时值连线积分。",
        ),
      );
      add(
        bar(
          "wells",
          "单井产能",
          (r.well_results || []).map((a) => a.name),
          [
            bars(
              "产能",
              (r.well_results || []).map((a) => a.rate),
            ),
          ],
          "万标准 m³/d",
        ),
      );
    }
  } else if (node === "results" || node === "report") {
    const metrics =
      evaluation?.metrics ||
      rows.map((a) => ({ label: a.指标, value: a.值, unit: a.单位 }));
    const groups = new Map();
    metrics.forEach((m) => {
      const unit = m.unit || "未注明单位";
      if (!groups.has(unit)) groups.set(unit, []);
      groups.get(unit).push(m);
    });
    groups.forEach((items, unit) =>
      add(
        bar(
          "summary-" + unit,
          "评估指标 · " + unit,
          items.map((m) => m.label),
          [
            bars(
              "本次结果",
              items.map((m) => m.value),
            ),
          ],
          unit,
          "各指标按状态分别解释；不同量纲分图展示。",
        ),
      ),
    );
    const history = c.history || [];
    add({
      ...line(
        "cycles",
        "多周期库存与调峰",
        [
          series(
            "账面库存",
            history,
            (_, i) => i,
            (a) => a.book_inventory,
          ),
          series(
            "有效库存",
            history,
            (_, i) => i,
            (a) => a.effective_inventory,
          ),
          series(
            "综合调峰能力",
            history,
            (_, i) => i,
            (a) => a.deliverable_swing,
          ),
        ],
        "评估周期",
        "亿标准 m³",
        "参考呼图壁第 35 页及板中北周期诊断；历史成果未重新计算。",
      ),
      labels: history.map((a) => a.cycle_id),
    });
    if (node === "report")
      add(
        table(
          "report-register",
          "报告图表与依据",
          ["内容", "本次状态"],
          [
            ["评价周期", c.cycle_id || "未填写"],
            ["计算版本", evaluation?.engine_version || "节点结果"],
            ["报告状态", evaluation ? "已形成计算快照" : "请运行整库计算"],
            ["原始资料", `${(c.documents || []).length} 份`],
          ],
          "报告仍由原有预览与导出入口生成；图表可另存 SVG 和 CSV。",
        ),
      );
  }
  return charts;
}

export function makeViewModel({
  record,
  node,
  index,
  state,
  evaluation,
  cat,
  dirty,
}) {
  const r = state?.run,
    global = ["scope", "data", "accounting", "results", "report"].includes(
      node,
    );
  const currentUnit = record?.case.units[index];
  const snapshot = r?.chart_context;
  const isOld = dirty || state?.status === "stale";
  const whole = ["results", "report"].includes(node) && evaluation;
  const fallback = !r || !isOld ? record?.case : null;
  const project = whole ? evaluation.case : snapshot?.project || fallback;
  const unit = whole
    ? null
    : snapshot?.unit || (!r || !isOld ? currentUnit : null);
  const run = r?.status === "blocked" ? null : r;
  return {
    projectId: record?.id,
    node,
    index: global ? null : index,
    title: state?.name || node,
    scope: global
      ? "全项目"
      : snapshot?.unit?.name || currentUnit?.name || "待选单元",
    revision: record?.revision,
    inputHash: whole ? evaluation.fingerprint : r?.input_hash,
    runId: whole ? evaluation.run_id : r?.run_id,
    createdAt: whole ? evaluation.created_at : r?.created_at,
    basis: whole
      ? "整库计算结果"
      : r?.status === "blocked"
      ? "输入资料预览 · 节点未通过"
      : r
      ? "节点计算快照"
      : "输入资料预览",
    stale: whole ? !!(dirty || record?.stale) : !!r && !!isOld,
    charts: buildCharts({
      node,
      project,
      unit,
      run,
      evaluation: whole ? evaluation : null,
      cat,
    }),
    missing:
      r?.errors?.join("；") ||
      "当前资料不足以绘图。补充本节点数据并运行后显示图表；缺测不会填成零。",
  };
}

export function csvForChart(chart) {
  const quote = (v) => {
    const s = String(v ?? "");
    return (
      '"' +
      (/^[=+@\-]/.test(s) && typeof v !== "number" ? "'" : "") +
      s.replaceAll('"', '""') +
      '"'
    );
  };
  const rows =
    chart.type === "table"
      ? [chart.columns, ...chart.rows]
      : [
          ["系列", chart.xLabel || "类别", chart.yLabel || "值"],
          ...chart.series.flatMap((s) =>
            s.points.map((p) => [s.name, chart.labels?.[p.x] ?? p.x, p.y]),
          ),
        ];
  return "\ufeff" + rows.map((row) => row.map(quote).join(",")).join("\r\n");
}
