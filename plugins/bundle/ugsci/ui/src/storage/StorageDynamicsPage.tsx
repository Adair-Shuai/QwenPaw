import { apiFetch, getHost, hostFetch } from "../core/runtime";

type Row = Record<string, any>;
const base = "/ugsci/storage-dynamics";
const direction = (mode: string) => (mode === "injection" ? "注气" : "采气");
const num = (n: number | null | undefined) =>
  n == null ? "缺测" : n.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
const qualityNames: Record<string, string> = {
  xls_row_limit: "疑似 XLS 导出截断",
  invalid_range: "数值超出合法范围",
  invalid_number: "无法识别数值",
  invalid_identity: "日期或库井标识无效",
  duplicate_identical: "相同重复已去重",
  duplicate_conflict: "重复冲突已排除",
};
const qualityFields: Record<string, string> = {
  gas: "日气量",
  hours: "生产小时",
  pressure: "井口油压",
  casing: "套压",
  water: "日产水量",
  vent: "放空量",
};

function VolumeChart({ rows }: { rows: Row[] }) {
  const React = getHost().React;
  const months = [...new Set(rows.map((r) => r.month))].sort();
  const grouped = months.map((month) => {
    const subset = rows.filter((r) => r.month === month);
    const sum = (key: string) => {
      const values = subset.map((r) => r[key]).filter((v) => v != null);
      return values.length ? values.reduce((a, b) => a + b, 0) : null;
    };
    return {
      month,
      injection: sum("injection"),
      withdrawal: sum("withdrawal"),
    };
  });
  const maximum = Math.max(
    1,
    ...grouped.flatMap((r) => [r.injection || 0, r.withdrawal || 0]),
  );
  const x = (i: number) => 65 + (i * 635) / Math.max(1, months.length - 1);
  const y = (n: number) => 245 - (n / maximum) * 200;
  const path = (key: string) => {
    let pen = false;
    return grouped
      .map((r: Row, i) => {
        if (r[key] == null) {
          pen = false;
          return "";
        }
        const part = `${pen ? "L" : "M"}${x(i)},${y(r[key])}`;
        pen = true;
        return part;
      })
      .join(" ");
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
        <span style={{ color: "#1677ff" }}>● 注气月量</span>
        <span style={{ color: "#e8684a" }}>● 采气月量</span>
        <span>单位：万m³ / 月 · 空值断线</span>
      </div>
      <svg
        viewBox="0 0 750 290"
        role="img"
        aria-label="注采气月度计量量趋势"
        style={{ width: "100%", minWidth: 550, maxHeight: 350 }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line
              x1="65"
              x2="700"
              y1={y(v * maximum)}
              y2={y(v * maximum)}
              stroke="currentColor"
              opacity=".12"
            />
            <text
              x="57"
              y={y(v * maximum) + 4}
              textAnchor="end"
              fill="currentColor"
              fontSize="12"
            >
              {num(v * maximum)}
            </text>
          </g>
        ))}
        <path
          d={path("injection")}
          stroke="#1677ff"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d={path("withdrawal")}
          stroke="#e8684a"
          strokeWidth="2.5"
          fill="none"
        />
        {grouped.map((r, i) => (
          <g key={r.month}>
            {i % Math.max(1, Math.ceil(months.length / 8)) === 0 && (
              <text
                x={x(i)}
                y="274"
                textAnchor="middle"
                fill="currentColor"
                fontSize="12"
              >
                {r.month}
              </text>
            )}
            <rect x={x(i) - 3} y="40" width="6" height="205" fill="transparent">
              <title>
                {r.month} 注气 {num(r.injection)} / 采气 {num(r.withdrawal)}{" "}
                万m³
              </title>
            </rect>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function StorageDynamicsPage() {
  const host = getHost();
  const React = host.React;
  const {
    Card,
    Select,
    Input,
    Button,
    Space,
    Alert,
    Table,
    Tabs,
    Statistic,
    Spin,
    DatePicker,
    InputNumber,
    Typography,
  } = host.antd;
  const [datasets, setDatasets] = React.useState<Row[]>([]);
  const [datasetId, setDatasetId] = React.useState("");
  const [inputPath, setInputPath] = React.useState("");
  const [facility, setFacility] = React.useState("");
  const [well, setWell] = React.useState("");
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [cycleMonth, setCycleMonth] = React.useState(4);
  const [dropThreshold, setDropThreshold] = React.useState(30);
  const [result, setResult] = React.useState<Row | null>(null);
  const [lastRequest, setLastRequest] = React.useState<Row | null>(null);
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");
  const alive = React.useRef(true);
  const load = async (selectId?: string) => {
    const data = await apiFetch<{ datasets: Row[] }>(`${base}/datasets`, {
      bypassCache: true,
    });
    if (!alive.current) return;
    const items = data.datasets.sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
    setDatasets(items);
    setDatasetId(selectId || items[0]?.id || "");
  };
  React.useEffect(() => {
    alive.current = true;
    load().catch((e) => {
      if (alive.current) setError(String(e.message || e));
    });
    return () => {
      alive.current = false;
    };
  }, []);
  const body = () => ({
    dataset_id: datasetId,
    facility,
    well,
    start,
    end,
    cycle_start_month: cycleMonth,
    drop_threshold_pct: dropThreshold,
  });
  const importData = async () => {
    setError("");
    setBusy("读取并审计数据…");
    try {
      const job = await apiFetch<Row>(`${base}/imports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_path: inputPath }),
      });
      while (alive.current) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const status = await apiFetch<Row>(`${base}/imports/${job.id}`, {
          bypassCache: true,
        });
        if (status.status === "failed") throw new Error(status.error);
        if (status.status === "completed") {
          await load(status.dataset.id);
          setResult(null);
          setFacility("");
          setWell("");
          break;
        }
      }
    } catch (e: any) {
      if (alive.current) setError(e.message || String(e));
    } finally {
      if (alive.current) setBusy("");
    }
  };
  const run = async () => {
    setError("");
    setBusy("分析注采动态…");
    const request = body();
    try {
      const data = await apiFetch<Row>(`${base}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (alive.current) {
        setResult(data);
        setLastRequest(request);
      }
    } catch (e: any) {
      if (alive.current) setError(e.message || String(e));
    } finally {
      if (alive.current) setBusy("");
    }
  };
  const download = async () => {
    if (!lastRequest) return;
    setBusy("生成报告…");
    setError("");
    try {
      const response = await hostFetch(`${base}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastRequest),
      });
      if (!response.ok) throw new Error(await response.text());
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "储气库生产动态分析报告.md";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      if (alive.current) setBusy("");
    }
  };
  const selected = datasets.find((d) => d.id === datasetId);
  const table = (data: Row[], columns: Row[], key: (r: Row) => string) => (
    <Table
      size="small"
      dataSource={data}
      columns={columns}
      rowKey={key}
      pagination={{ pageSize: 12, showSizeChanger: true }}
      scroll={{ x: "max-content" }}
    />
  );
  const col = (
    title: string,
    dataIndex: string,
    render?: (v: any, r: Row) => any,
  ) => ({ title, dataIndex, render });
  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: "0 auto" }}>
      <Typography.Title level={2} style={{ marginTop: 0 }}>
        储气库生产动态分析
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        从注采日记录到库井动态、运行阶段与复核线索。保留计量口径，每个异常可追溯到原表。
      </Typography.Paragraph>
      <Card title="数据与分析范围" style={{ marginBottom: 18 }}>
        <Space.Compact style={{ width: "100%", marginBottom: 16 }}>
          <Input
            aria-label="注采数据路径"
            value={inputPath}
            onChange={(e: any) => setInputPath(e.target.value)}
            placeholder="本地 XLS / XLSX / UTF-8 CSV 文件或目录的绝对路径"
            disabled={!!busy}
          />
          <Button onClick={importData} disabled={!inputPath.trim() || !!busy}>
            导入并检查
          </Button>
        </Space.Compact>
        <Space wrap style={{ marginBottom: 12 }}>
          <Select
            aria-label="数据集"
            style={{ minWidth: 260 }}
            placeholder="选择数据集"
            value={datasetId || undefined}
            disabled={!!busy}
            onChange={(v: string) => {
              setDatasetId(v);
              setFacility("");
              setWell("");
              setResult(null);
            }}
            options={datasets.map((d) => ({
              label: `${d.name} · ${num(d.records)} 条`,
              value: d.id,
            }))}
          />
          <Select
            aria-label="储气库"
            value={facility}
            style={{ minWidth: 145 }}
            disabled={!!busy}
            onChange={(v: string) => {
              setFacility(v);
              setWell("");
            }}
            options={[
              { label: "全部储气库", value: "" },
              ...(selected?.facilities || []).map((f: Row) => ({
                label: f.facility,
                value: f.facility,
              })),
            ]}
          />
          <Input
            aria-label="井号"
            value={well}
            onChange={(e: any) => setWell(e.target.value)}
            placeholder="原始井号（可选）"
            style={{ width: 150 }}
            disabled={!!busy}
          />
          <Input
            aria-label="起始日期"
            type="date"
            value={start}
            onChange={(e: any) => setStart(e.target.value)}
            disabled={!!busy}
            style={{ width: 155 }}
          />
          <span>至</span>
          <Input
            aria-label="截止日期"
            type="date"
            value={end}
            onChange={(e: any) => setEnd(e.target.value)}
            disabled={!!busy}
            style={{ width: 155 }}
          />
        </Space>
        <Space wrap>
          <span>气年度起始月</span>
          <InputNumber
            aria-label="气年度起始月份"
            min={1}
            max={12}
            value={cycleMonth}
            disabled={!!busy}
            onChange={(v: number | null) => setCycleMonth(v || 4)}
          />
          <span>折算量下降筛查阈值（%）</span>
          <InputNumber
            aria-label="下降筛查阈值"
            min={1}
            max={100}
            value={dropThreshold}
            disabled={!!busy}
            onChange={(v: number | null) => setDropThreshold(v || 30)}
          />
          <Button type="primary" onClick={run} disabled={!datasetId || !!busy}>
            分析动态
          </Button>
          <Button onClick={download} disabled={!result || !!busy}>
            下载分析报告
          </Button>
        </Space>
      </Card>
      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 16 }}
        />
      )}
      {busy && (
        <div role="status" style={{ padding: 16 }}>
          <Spin size="small" /> {busy}
        </div>
      )}
      {!result && !busy && (
        <Card>
          <Typography.Paragraph>
            选择已导入数据集并点击“分析动态”。也可以在专家中心创建“储气库生产动态分析师”，通过对话调用相同的分析工具。
          </Typography.Paragraph>
          <Alert
            type="info"
            showIcon
            message="源文件只读；空值不补零，井口油压不替代地层压力。"
          />
        </Card>
      )}
      {result && (
        <>
          <Alert
            type="info"
            showIcon
            message={`分析截至数据日期 ${result.summary.as_of} · ${
              result.filters.facility || "全部库"
            } / ${result.filters.well || "全部井"} · ${
              result.summary.start
            } 起 · 气年度 ${
              result.parameters.cycle_start_month
            } 月起 · 筛查阈值 ${result.parameters.drop_threshold_pct}%`}
            style={{ marginBottom: 16 }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 14,
              marginBottom: 18,
            }}
          >
            {[
              [
                "储气库 / 原始井号",
                `${result.summary.facilities} / ${result.summary.wells}`,
                "",
              ],
              ["已记录累计注气", num(result.summary.injection), "万m³"],
              ["已记录累计采气", num(result.summary.withdrawal), "万m³"],
              ["气量缺测日记录", num(result.summary.missing_gas), "条"],
              ["筛查线索", num(result.summary.anomaly_count), "项"],
            ].map(([title, value, suffix]) => (
              <Card key={title} size="small">
                <Statistic title={title} value={value} suffix={suffix} />
              </Card>
            ))}
          </div>
          <Card title="注采月度动态" style={{ marginBottom: 18 }}>
            <VolumeChart rows={result.monthly} />
            <Typography.Text type="secondary">
              未记录的一侧保持缺测。累计注采差额需要完整历史与期初库存才能参与库存核算。
            </Typography.Text>
          </Card>
          <Card>
            <Tabs
              items={[
                {
                  key: "coverage",
                  label: "数据覆盖与质量",
                  children: (
                    <>
                      {table(
                        result.coverage,
                        [
                          col("储气库", "facility"),
                          col("方向", "mode", direction),
                          col("起始日期", "start"),
                          col("截止日期", "end"),
                          col("记录数", "records", num),
                          col("气量缺测", "missing_gas", num),
                          col("计量量 / 万m³", "observed_volume", num),
                        ],
                        (r) => `${r.facility}-${r.mode}`,
                      )}
                      <Alert
                        type="warning"
                        showIcon
                        message="分析口径与数据限制"
                        description={
                          <ul>
                            {result.warnings.map((w: string, i: number) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        }
                      />
                      <Typography.Paragraph style={{ marginTop: 12 }}>
                        整个数据集导入检查：
                        {Object.entries(result.quality.import_counts)
                          .map(([k, v]) => `${qualityNames[k] || k} ${v} 项`)
                          .join("；") || "未发现已配置检查项中的问题"}
                        。下方最多显示 100 条原表问题样例。
                      </Typography.Paragraph>
                      {table(
                        result.quality.examples,
                        [
                          col("问题", "message"),
                          col(
                            "字段",
                            "field",
                            (v: string) => qualityFields[v] || v || "—",
                          ),
                          col("文件", "file"),
                          col("表", "sheet"),
                          col("原行号", "row"),
                        ],
                        (r) =>
                          `${r.file}-${r.sheet}-${r.row}-${r.code}-${r.field}`,
                      )}
                    </>
                  ),
                },
                {
                  key: "cycles",
                  label: "气年度与阶段",
                  children: (
                    <>
                      {table(
                        result.cycles,
                        [
                          col("储气库", "facility"),
                          col("气年度", "gas_year"),
                          col("注气 / 万m³", "injection", num),
                          col("采气 / 万m³", "withdrawal", num),
                          col("净计量变化 / 万m³", "net_metered_change", num),
                          col(
                            "水气质量比 / t/万m³",
                            "water_gas_mass_ratio",
                            num,
                          ),
                          col("覆盖状态", "completeness"),
                        ],
                        (r) => `${r.facility}-${r.gas_year}`,
                      )}
                      <Typography.Title level={5}>
                        近期运行阶段（按实测记录）
                      </Typography.Title>
                      {table(
                        result.phases_recent,
                        [
                          col("库", "facility"),
                          col(
                            "状态",
                            "state",
                            (v: string) =>
                              ({
                                injection: "注气",
                                withdrawal: "采气",
                                mixed: "混合",
                                zero_observed: "已观测零气量",
                                unknown: "气量未知",
                              })[v] || v,
                          ),
                          col("起始", "start"),
                          col("截止", "end"),
                          col("连续观测日", "observed_days"),
                        ],
                        (r) => `${r.facility}-${r.start}`,
                      )}
                    </>
                  ),
                },
                {
                  key: "wells",
                  label: "井动态与短期基线",
                  children: (
                    <>
                      {table(
                        result.wells,
                        [
                          col("库", "facility"),
                          col("井号", "well"),
                          col("方向", "mode", direction),
                          col("运行日", "active_days", num),
                          col("累计计量 / 万m³", "observed_volume", num),
                          col("最近运行日期", "last_active_date"),
                          col("折算量变化 / %", "rate_change_pct", num),
                          col("井口油压变化 / %", "pressure_change_pct", num),
                          col(
                            "条件性日量基线 / 万m³",
                            "forecast",
                            (f: Row | null) => num(f?.daily_volume),
                          ),
                          col(
                            "滚动回测 MAE / 万m³",
                            "forecast",
                            (f: Row | null) => num(f?.backtest_mae),
                          ),
                          col("基线状态", "forecast_reason"),
                        ],
                        (r) => `${r.facility}-${r.well}-${r.mode}`,
                      )}
                      <Typography.Text type="secondary">
                        短期基线仅限保持工况的 7
                        日分析；停井、缺测与日期断档会断开阶段。回测仅使用预测时点之前的记录。
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  key: "anomalies",
                  label: "复核线索",
                  children: (
                    <>
                      <Typography.Paragraph>
                        共 {num(result.summary.anomaly_count)}{" "}
                        项筛查线索，显示最近 100
                        项。线索需要结合现场调度与工程资料复核。
                      </Typography.Paragraph>
                      {table(
                        result.anomalies,
                        [
                          col("日期", "day"),
                          col("库", "facility"),
                          col("井号", "well"),
                          col("线索", "message"),
                          col("变化 / %", "rate_change_pct", num),
                          col(
                            "原表位置",
                            "source",
                            (s: Row) =>
                              `${s.file} / ${s.sheet} / 第 ${s.row} 行`,
                          ),
                        ],
                        (r) => `${r.facility}-${r.well}-${r.day}-${r.code}`,
                      )}
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}
