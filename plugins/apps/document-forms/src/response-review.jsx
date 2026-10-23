const Q = window.QwenPaw;
const React = Q.host.React;
const { useState, useEffect } = React;
const STATUS = {
  running: "正在核查",
  completed: "核查完成",
  failed: "未完成",
  interrupted: "已中断",
};
const accept = ".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";

export default function ResponseReview({ project, services, onChanged }) {
  const { request, download, time } = services;
  const [data, setData] = useState(null);
  const [referenceId, setReferenceId] = useState("");
  const [reference, setReference] = useState(null);
  const [responses, setResponses] = useState([]);
  const [focus, setFocus] = useState("");
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true,
      timer;
    let knownRunning = false;
    async function load() {
      try {
        const result = await request(
          `/projects/${project.id}/response-reviews`,
        );
        if (!active) return;
        setData(result);
        setError("");
        const running = result.records.some((r) => r.status === "running");
        if (knownRunning && !running) onChanged();
        knownRunning = running;
        if (running) timer = setTimeout(load, 3000);
      } catch (e) {
        if (active) setError(e.message);
      }
    }
    load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [project.id, refresh]);
  const running = data?.records.some((r) => r.status === "running");
  const record =
    data?.records.find((r) => r.id === selected) || data?.records[0];
  const Markdown = Q.host.ReactMarkdown;
  async function start(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body = new FormData();
      if (referenceId) body.set("reference_id", referenceId);
      else if (reference) body.set("reference", reference);
      for (const file of responses) body.append("responses", file);
      body.set("focus", focus);
      const result = await request(`/projects/${project.id}/response-reviews`, {
        method: "POST",
        body,
      });
      setSelected(result.id);
      setData((current) => ({
        ...current,
        records: [result, ...(current?.records || [])],
      }));
      setRefresh((n) => n + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="df-response-review">
      <p className="df-muted">
        对照谈判文件，逐家检查资质、技术响应、报价、日期与签章附件。核查意见供经办人和专家复核。
      </p>
      {error && (
        <div className="df-alert error" role="alert">
          {error}
          <button onClick={() => setRefresh((n) => n + 1)}>重新加载</button>
        </div>
      )}
      {!data ? (
        <p role="status">正在读取核查记录…</p>
      ) : (
        <>
          <form onSubmit={start}>
            <fieldset disabled={busy || running}>
              <label className="df-field">
                <span>核查依据</span>
                <select
                  aria-label="核查依据"
                  value={referenceId}
                  onChange={(e) => {
                    setReferenceId(e.target.value);
                    setReference(null);
                  }}
                >
                  <option value="">上传正式谈判文件</option>
                  {data.references.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>
              {!referenceId && (
                <label className="df-field">
                  <span>正式谈判文件</span>
                  <input
                    aria-label="上传核查依据"
                    type="file"
                    accept={accept}
                    required
                    onChange={(e) => setReference(e.target.files[0] || null)}
                  />
                </label>
              )}
              <label className="df-field">
                <span>各单位响应材料</span>
                <input
                  aria-label="上传响应材料"
                  type="file"
                  multiple
                  required
                  accept={accept}
                  onChange={(e) => setResponses([...e.target.files])}
                />
              </label>
              {responses.length > 0 && (
                <ul className="df-review-files">
                  {responses.map((f, i) => (
                    <li key={i}>{f.name}</li>
                  ))}
                </ul>
              )}
              <p className="df-muted">
                支持 Word、PDF、Excel 和图片；可一次选择多家材料。每份不超过 15
                MB，每次最多 20 份、合计 100 MB。压缩包请先解压。
              </p>
              <label className="df-field">
                <span>补充关注点（选填）</span>
                <textarea
                  aria-label="补充核查关注点"
                  rows={3}
                  maxLength={3000}
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="例如：重点核对报价大小写、成果交付时间和资质有效期"
                />
              </label>
              <div className="df-actions">
                <button
                  className="df-primary"
                  disabled={
                    busy ||
                    running ||
                    !(referenceId || reference) ||
                    !responses.length
                  }
                >
                  {busy ? "正在提交…" : "开始核查"}
                </button>
                <span className="df-muted">
                  使用“响应文件核查”智能体，沿用软件中的模型配置。
                </span>
              </div>
            </fieldset>
          </form>
          {data.records.length > 0 && (
            <section className="df-review-history">
              <div className="df-section-head">
                <h3>核查记录</h3>
                <button onClick={() => setRefresh((n) => n + 1)}>
                  刷新记录
                </button>
              </div>
              <div className="df-review-records">
                {data.records.map((r) => (
                  <button
                    key={r.id}
                    aria-pressed={record?.id === r.id}
                    onClick={() => setSelected(r.id)}
                  >
                    {time(r.created_at)} · {STATUS[r.status]}
                  </button>
                ))}
              </div>
              {record && (
                <article aria-label="响应文件核查结果">
                  <div className="df-section-head">
                    <div>
                      <b>{STATUS[record.status]}</b>
                      <p className="df-muted">
                        基于项目修订 {record.project_revision} ·{" "}
                        {record.files.length} 份材料；后续材料修改请重新核查。
                      </p>
                    </div>
                    {record.status === "completed" && (
                      <button
                        onClick={async () => {
                          try {
                            await download(
                              `/projects/${project.id}/response-reviews/${record.id}/report`,
                              `${
                                project.name
                              }_响应文件核查记录_${record.id.slice(0, 8)}.md`,
                            );
                          } catch (e) {
                            setError(e.message);
                          }
                        }}
                      >
                        下载核查记录
                      </button>
                    )}
                  </div>
                  <details>
                    <summary>本次核查材料与关注点</summary>
                    <ul>
                      {record.files.map((f, i) => (
                        <li key={i}>
                          {f.role}：{f.name}
                        </li>
                      ))}
                    </ul>
                    <p>{record.focus || "无补充关注点"}</p>
                  </details>
                  {record.status === "running" && (
                    <p role="status" className="df-alert">
                      正在读取并核查材料，可关闭此窗口，稍后回到本项目查看结果。
                    </p>
                  )}
                  {record.error && (
                    <p role="alert" className="df-alert error">
                      {record.error}
                    </p>
                  )}
                  {record.report && (
                    <div className="df-review-report">
                      {Markdown ? (
                        <Markdown
                          remarkPlugins={
                            Q.host.remarkGfm ? [Q.host.remarkGfm] : []
                          }
                          components={{
                            a: ({ children }) => <span>{children}</span>,
                            img: () => null,
                          }}
                        >
                          {record.report}
                        </Markdown>
                      ) : (
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {record.report}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
