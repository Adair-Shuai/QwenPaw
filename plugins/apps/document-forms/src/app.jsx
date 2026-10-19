import CSS from "./workbench.css";
import OfficeServicePreview from "./office-preview.jsx";
const Q = window.QwenPaw,
  React = Q.host.React;
const { useState, useEffect, useLayoutEffect, useRef } = React;
const API = "/document-forms";
const MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
async function request(path, init) {
  const response = await Q.host.fetch(API + path, init);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
        ? data.detail
            .map(
              (item) =>
                `${item.loc?.slice(1).join(".") || "资料"}：${item.msg}`,
            )
            .join("；")
        : `操作未完成（${response.status}），请检查填写内容`,
    );
  }
  return response.json();
}
async function download(path, name) {
  const response = await Q.host.fetch(API + path);
  if (!response.ok) throw new Error("文件下载失败，请稍后重试");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const json = (body) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const time = (value) =>
  new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
const isParagraph = (field) =>
  field.kind === "textarea" ||
  field.value.length > 100 ||
  field.value.includes("\n") ||
  field.label.includes("整段");
const compactParagraph = (field) =>
  /^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(
    field.key,
  ) || /主要研究内容|预期成果|考核指标|进度安排/.test(field.label);
function recipientDefaults(recipients) {
  return recipients.map((recipient, index) => {
    const result = { ...recipient };
    for (const key of ["start", "end"]) {
      const flag = "follow_" + key;
      result[flag] =
        index > 0 &&
        (typeof result[flag] === "boolean" ? result[flag] : !result[key]);
      if (result[flag]) result[key] = recipients[0][key];
    }
    return result;
  });
}
function Field({ field, displayValue, onChange }) {
  const multiline = isParagraph(field);
  const compact = compactParagraph(field);
  const value = ["date", "datetime-local"].includes(field.kind)
    ? field.value
    : displayValue ?? field.value;
  const textarea = useRef(null);
  useLayoutEffect(() => {
    if (!textarea.current) return;
    const scrollTop = textarea.current.scrollTop;
    textarea.current.style.height = "auto";
    textarea.current.style.height =
      Math.max(compact ? 104 : 192, textarea.current.scrollHeight) + "px";
    textarea.current.scrollTop = scrollTop;
  }, [value, multiline, compact]);
  return (
    <label
      className={
        "df-field" +
        (multiline ? " df-field-paragraph" : "") +
        (compact ? " df-field-compact" : "")
      }
      id={"df-" + field.key}
    >
      <span>
        {field.label}
        {field.required && <em>必填</em>}
      </span>
      {multiline ? (
        <textarea
          ref={textarea}
          aria-label={field.label}
          rows={compact ? 3 : 8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          aria-label={field.label}
          type={field.kind}
          step={field.kind === "number" ? "any" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <small>{field.key}</small>
    </label>
  );
}
function Workbench() {
  const [records, setRecords] = useState([]),
    [draft, setDraft] = useState(null);
  const [stage, setStage] = useState("import"),
    [dirty, setDirty] = useState(false);
  const [review, setReview] = useState(null),
    [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(null),
    [Preview, setPreviewComponent] = useState(null);
  const excelInput = useRef(null),
    wordInput = useRef(null);
  const seq = useRef(0),
    alive = useRef(true);
  const theme = Q.host.useTheme?.() || "light";
  const refresh = () =>
    request("/cases").then((data) => {
      if (alive.current) setRecords(data);
    });
  useEffect(() => {
    alive.current = true;
    refresh().catch((e) => setError(e.message));
    (Q.workspace?.loadPreview
      ? Q.workspace.loadPreview()
      : Promise.resolve(OfficeServicePreview)
    )
      .then((component) => {
        if (alive.current) setPreviewComponent(() => component);
      })
      .catch((e) => {
        if (alive.current) setPreviewComponent(() => OfficeServicePreview);
      });
    return () => {
      alive.current = false;
      seq.current++;
    };
  }, []);
  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  async function run(label, action) {
    if (busy) return;
    const ticket = ++seq.current;
    setBusy(label);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (e) {
      if (alive.current && ticket === seq.current) setError(e.message);
    } finally {
      if (alive.current && ticket === seq.current) setBusy("");
    }
  }
  function receive(data) {
    if (!alive.current) return;
    setDraft({
      ...data,
      recipients: recipientDefaults(data.recipients),
      presentation_sources: Object.fromEntries(
        data.fields.map((f) => [f.key, f.value]),
      ),
    });
    setDirty(false);
    setReview(null);
    setConfirmed(false);
  }
  function edit(update) {
    setDraft(update);
    setDirty(true);
    setReview(null);
    setConfirmed(false);
    setNotice("");
  }
  function editRecipient(index, key, value, follow = false) {
    const recipients = draft.recipients.map((recipient, row) =>
      row === index
        ? {
            ...recipient,
            [key]: value,
            ...(key !== "name" ? { ["follow_" + key]: follow } : {}),
          }
        : recipient,
    );
    edit({ ...draft, recipients: recipientDefaults(recipients) });
  }
  async function saveDraft() {
    if (!dirty) return draft;
    const body = {
      revision: draft.revision,
      name: draft.name.trim() || "未命名填报",
      values: Object.fromEntries(draft.fields.map((f) => [f.key, f.value])),
      recipients: draft.recipients,
    };
    const data = await request("/cases/" + draft.id, {
      ...json(body),
      method: "PUT",
    });
    receive(data);
    return data;
  }
  function canLeave() {
    return !dirty || window.confirm("当前有未保存的修改。离开此记录？");
  }
  const templates = draft?.templates || [];
  const outputCount = templates.reduce(
    (n, t) => n + (t.per_recipient ? draft.recipients.length : 1),
    0,
  );
  const generation = draft?.generations[0];
  const issues = review?.checks.filter((r) => r.status !== "ok") || [];
  async function openRecord(id) {
    if (!canLeave()) return;
    await run("打开记录", async () => {
      receive(await request("/cases/" + id));
      setPreview(null);
      setStage("edit");
    });
  }
  async function importExcel(file) {
    if (!file || !canLeave()) return;
    await run("读取 Excel", async () => {
      const form = new FormData();
      form.append("workbook", file);
      const data = await request("/cases", { method: "POST", body: form });
      receive(data);
      setPreview(null);
      setStage("edit");
      await refresh();
      setNotice(
        data.templates.length
          ? "已读取变量配置，并载入默认 Word 模板。"
          : data.template_notice || "已读取变量配置。请添加对应的 Word 模板。",
      );
    });
  }
  async function importWord(files) {
    // FileList is live in Chromium. Snapshot it before saving the draft or
    // clearing the file input, otherwise the upload loses all selected files.
    files = Array.from(files);
    if (!files.length) return;
    await run("读取 Word 模板", async () => {
      const saved = await saveDraft();
      const form = new FormData();
      form.append("revision", String(saved.revision));
      Array.from(files).forEach((f) => form.append("files", f));
      receive(
        await request("/cases/" + saved.id + "/templates", {
          method: "POST",
          body: form,
        }),
      );
      setNotice("Word 模板已添加，生成时会保留原有排版。");
    });
  }
  async function reviewDraft() {
    await run("核对资料", async () => {
      const saved = await saveDraft();
      const result = await request(
        "/cases/" + saved.id + "/review",
        json({ revision: saved.revision }),
      );
      if (!alive.current) return;
      setReview(result);
      setConfirmed(false);
      setStage("review");
      await refresh();
    });
  }
  async function generate() {
    await run("生成文书", async () => {
      const data = await request(
        "/cases/" + draft.id + "/generate",
        json({
          revision: draft.revision,
          review_token: review.review_token,
          confirmed,
        }),
      );
      receive(data);
      setStage("files");
      setPreview({
        file: data.generations[0].files[0],
        generation: data.generations[0],
      });
      await refresh();
    });
  }
  function focusField(key) {
    setStage("edit");
    requestAnimationFrame(() => {
      const el = document.getElementById("df-" + key);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector("input,textarea")?.focus();
    });
  }
  const filePath = (g, f) =>
    `/cases/${draft.id}/outputs/${g.id}/${encodeURIComponent(f)}`;
  const artifact = preview
    ? {
        id: preview.generation.id + preview.file.name,
        title: preview.file.name,
        source: "generated",
        mimeType: MIME,
        extension: "docx",
        binaryUrl: preview.file.preview_url,
        agentId: Q.host.getSelectedAgentId?.(),
        createdAt: Date.parse(preview.generation.created_at),
      }
    : null;
  return (
    <main className="df-app" data-theme={theme}>
      <style>{CSS}</style>
      <input
        ref={excelInput}
        type="file"
        accept=".xlsx"
        hidden
        aria-label="导入 Excel 变量表"
        onChange={(e) => {
          importExcel(e.target.files[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={wordInput}
        type="file"
        accept=".docx"
        multiple
        hidden
        aria-label="导入 Word 模板"
        onChange={(e) => {
          importWord(e.target.files);
          e.target.value = "";
        }}
      />
      <aside className="df-sidebar">
        <div className="df-brand">
          UGSci <span>文书填报</span>
        </div>
        <button
          className="df-primary df-new"
          disabled={!!busy}
          onClick={() => excelInput.current.click()}
        >
          ＋ 新建填报
        </button>
        <div className="df-caption">
          填报记录 <span>{records.length}</span>
        </div>
        <nav aria-label="填报记录">
          {records.map((r) => (
            <button
              key={r.id}
              aria-current={draft?.id === r.id ? "page" : undefined}
              disabled={!!busy}
              onClick={() => openRecord(r.id)}
            >
              <b>{r.name}</b>
              <small>
                {time(r.updated_at)} ·{" "}
                {r.outputs ? `${r.outputs} 份文件` : "草稿"}
              </small>
            </button>
          ))}
        </nav>
        <div className="df-sidebar-foot">
          <b>模板准备</b>
          <p>Excel 管理数据，Word 保留版式。同一组数据可填写多份文书。</p>
          <button
            disabled={!!busy}
            onClick={() =>
              run("下载示例", () =>
                download("/starter", "文书填报_入门模板.zip"),
              )
            }
          >
            下载入门模板 ↗
          </button>
          <small>通用示例，不含业务条款</small>
        </div>
      </aside>
      <section className="df-main">
        <header className="df-header">
          <div>
            <span className="df-eyebrow">DOCUMENTS / 文书填报</span>
            <h1>{draft ? draft.name : "把重复填写的资料，整理成一张表。"}</h1>
            <p>
              {draft
                ? dirty
                  ? "有未保存的修改"
                  : `草稿已保存 · ${time(draft.updated_at)}`
                : "导入变量表与 Word 模板，填写、核对，再生成文书。"}
            </p>
          </div>
          {draft && (
            <button
              disabled={!!busy || !dirty}
              onClick={() =>
                run("保存草稿", async () => {
                  await saveDraft();
                  await refresh();
                  setNotice("草稿已保存");
                })
              }
            >
              保存草稿
            </button>
          )}
        </header>
        <div className="df-steps" aria-label="填写流程">
          {[
            ["import", "01", "导入模板"],
            ["edit", "02", "填写资料"],
            ["review", "03", "核对生成"],
            ["files", "04", "文件预览"],
          ].map(([id, n, label]) => (
            <button
              key={id}
              className={stage === id ? "active" : ""}
              disabled={
                !!busy ||
                (!draft && id !== "import") ||
                (id === "files" && !generation)
              }
              onClick={() => (id === "review" ? reviewDraft() : setStage(id))}
            >
              <span>{n}</span>
              {label}
            </button>
          ))}
        </div>
        {error && (
          <div className="df-alert error" role="alert">
            {error}
            <button aria-label="关闭错误提示" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}
        {notice && (
          <div className="df-alert" role="status">
            {notice}
          </div>
        )}
        {busy && (
          <div className="df-progress" role="status">
            {busy}…
          </div>
        )}
        <fieldset className="df-content" disabled={!!busy}>
          {stage === "import" && (
            <div className="df-import">
              <section className="df-paper df-drop">
                <div className="df-file-mark">XLSX</div>
                <h2>从 Excel 变量表开始</h2>
                <p>
                  “变量配置”工作表保留三列：
                  <br />
                  <b>变量名称　中文名称　值</b>
                </p>
                <button
                  className="df-primary"
                  onClick={() => excelInput.current.click()}
                >
                  选择 Excel 变量表
                </button>
                <small>支持 .xlsx · 单个文件不超过 15 MB</small>
              </section>
              <section className="df-paper df-import-note">
                <span className="df-eyebrow">如何准备</span>
                <h2>一份数据，多份文书</h2>
                <ol>
                  <li>
                    <b>整理变量</b>
                    <p>
                      例如 project.name / 项目名称 /
                      实际名称。支持分组、类型和必填列。
                    </p>
                  </li>
                  <li>
                    <b>添加 Word 模板</b>
                    <p>
                      使用 {"{{ project.name }}"}{" "}
                      引用变量，段落、表格及页眉页脚沿用模板。
                    </p>
                  </li>
                  <li>
                    <b>分别生成邀请函</b>
                    <p>
                      在“受邀单位”表记录单位名称、领取开始时间和领取结束时间。
                    </p>
                  </li>
                </ol>
                <p className="df-muted">
                  “日期校核”表中的旧结果不会作为判断依据；应用会根据当前填写内容重新核对。“校核规则”表可补充自定义先后关系。
                </p>
              </section>
            </div>
          )}
          {draft && stage === "edit" && (
            <div className="df-edit-layout">
              <section className="df-paper">
                <div className="df-section-head">
                  <h2>填写信息</h2>
                  <button
                    onClick={() =>
                      run("导出 Excel", async () => {
                        const data = await saveDraft();
                        await download(
                          `/cases/${data.id}/excel`,
                          data.name + ".xlsx",
                        );
                      })
                    }
                  >
                    导出当前 Excel
                  </button>
                </div>
                <label className="df-field df-title-field">
                  <span>填报名称</span>
                  <input
                    aria-label="填报名称"
                    maxLength={120}
                    value={draft.name}
                    onChange={(e) => edit({ ...draft, name: e.target.value })}
                  />
                </label>
                {[...new Set(draft.fields.map((f) => f.group))].map((group) => (
                  <section className="df-group" key={group}>
                    <h3>{group}</h3>
                    {group === "日期安排" && (
                      <p className="df-muted">
                        文书统一使用中文日期，例如“2026年10月22日下午14:30”。日期选择器保留原来的填写方式。
                      </p>
                    )}
                    <div className="df-fields">
                      {draft.fields
                        .filter((f) => f.group === group)
                        .map((field) => (
                          <Field
                            key={field.key}
                            field={field}
                            displayValue={
                              draft.presentation_sources?.[field.key] ===
                              field.value
                                ? draft.document_values?.[field.key]
                                : undefined
                            }
                            onChange={(value) =>
                              edit({
                                ...draft,
                                fields: draft.fields.map((f) =>
                                  f.key === field.key ? { ...f, value } : f,
                                ),
                              })
                            }
                          />
                        ))}
                    </div>
                  </section>
                ))}
              </section>
              <section className="df-paper">
                <div className="df-section-head">
                  <div>
                    <h2>
                      受邀单位{" "}
                      <span className="df-count">
                        {draft.recipients.length}
                      </span>
                    </h2>
                    <p>每家单位单独生成邀请函，共用项目与落款信息。</p>
                  </div>
                  <button
                    onClick={() =>
                      edit({
                        ...draft,
                        recipients: recipientDefaults([
                          ...draft.recipients,
                          { name: "", start: "", end: "" },
                        ]),
                      })
                    }
                    disabled={draft.recipients.length >= 200}
                  >
                    ＋ 添加单位
                  </button>
                </div>
                {draft.recipients.map((r, i) => (
                  <div
                    className="df-recipient"
                    key={i}
                    id={"df-recipient-" + i}
                  >
                    <div className="df-recipient-title">
                      <b>{String(i + 1).padStart(2, "0")}</b>
                      <button
                        aria-label={`移除第${i + 1}家单位`}
                        onClick={() =>
                          edit({
                            ...draft,
                            recipients: recipientDefaults(
                              draft.recipients.filter((_, j) => j !== i),
                            ),
                          })
                        }
                      >
                        移除
                      </button>
                    </div>
                    <div className="df-fields">
                      {[
                        ["name", "单位名称"],
                        ["start", "领取开始时间"],
                        ["end", "领取结束时间"],
                      ].map(([key, label]) => (
                        <label
                          className={
                            "df-field " + (key === "name" ? "df-span" : "")
                          }
                          key={key}
                        >
                          <span>{label}</span>
                          <input
                            aria-label={`第${i + 1}家${label}`}
                            type={key === "name" ? "text" : "datetime-local"}
                            value={
                              key === "name" ? r[key] : r[key].replace(" ", "T")
                            }
                            onChange={(e) =>
                              editRecipient(i, key, e.target.value)
                            }
                          />
                          {i > 0 && key !== "name" && (
                            <small className="df-follow-state">
                              {r["follow_" + key] ? "跟随第1家" : "已单独设置"}
                              {!r["follow_" + key] && (
                                <button
                                  type="button"
                                  aria-label={`第${i + 1}家${label}恢复跟随`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    editRecipient(
                                      i,
                                      key,
                                      draft.recipients[0][key],
                                      true,
                                    );
                                  }}
                                >
                                  恢复跟随
                                </button>
                              )}
                            </small>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
              <section
                className="df-paper df-template-panel"
                aria-label="Word 模板"
              >
                <div className="df-section-head">
                  <h2>Word 模板</h2>
                  <div className="df-template-actions">
                    {templates.length > 0 ? (
                      <button
                        onClick={() =>
                          run("保存默认模板", async () => {
                            const data = await saveDraft();
                            await request(
                              `/cases/${data.id}/defaults`,
                              json({ revision: data.revision }),
                            );
                            setNotice(
                              "已设为本机默认模板，以后新建填报会自动载入。",
                            );
                          })
                        }
                      >
                        设为默认模板
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          run("载入默认模板", async () => {
                            const data = await saveDraft();
                            receive(
                              await request(
                                `/cases/${data.id}/defaults/apply`,
                                json({ revision: data.revision }),
                              ),
                            );
                            setNotice("已载入默认 Word 模板。");
                          })
                        }
                      >
                        使用默认模板
                      </button>
                    )}
                    <button onClick={() => wordInput.current.click()}>
                      ＋ 添加
                    </button>
                  </div>
                </div>
                {!templates.length && (
                  <p className="df-muted">
                    添加与你的变量表对应的 .docx 模板。
                  </p>
                )}
                {templates.map((t) => (
                  <div className="df-template" key={t.id}>
                    <b>{t.name}</b>
                    <span>
                      {t.per_recipient
                        ? "按受邀单位分别生成"
                        : "共用文件 · 生成一份"}
                    </span>
                    <small>{t.keys.length} 个引用变量</small>
                    <button
                      aria-label={"移除模板" + t.name}
                      onClick={() =>
                        run("移除模板", async () => {
                          const data = await saveDraft();
                          receive(
                            await request(
                              `/cases/${data.id}/templates/${t.id}?revision=${data.revision}`,
                              { method: "DELETE" },
                            ),
                          );
                        })
                      }
                    >
                      移除
                    </button>
                  </div>
                ))}
              </section>
              <section
                className="df-paper df-edit-footer"
                aria-label="核对与生成"
              >
                <div className="df-generation-plan">
                  <h2>核对与生成</h2>
                  <p>
                    本次计划生成 <b>{outputCount}</b> 份文书
                  </p>
                  <small>
                    {templates.filter((t) => !t.per_recipient).length}{" "}
                    份共用文件 ·{" "}
                    {templates.filter((t) => t.per_recipient).length} 套邀请函 ×{" "}
                    {draft.recipients.length} 家单位
                  </small>
                </div>
                <div className="df-next-action">
                  <button className="df-primary" onClick={reviewDraft}>
                    核对填写内容 →
                  </button>
                  <small>先核对缺项与日期，再确认生成</small>
                </div>
              </section>
            </div>
          )}
          {draft && stage === "review" && review && (
            <div className="df-review">
              <section className="df-paper">
                <span className="df-eyebrow">填写核对</span>
                <h2>
                  {review.can_generate
                    ? "资料已齐备，请确认本次内容。"
                    : `还有 ${issues.length} 项需要处理`}
                </h2>
                <p>
                  本次使用修订 {draft.revision} 的数据，计划生成 {outputCount}{" "}
                  份文书。
                </p>
                {issues.length > 0 && (
                  <div className="df-checks">
                    {issues.map((r, i) => (
                      <div key={i} className={"df-check " + r.status}>
                        <span>
                          {r.status === "ok"
                            ? "通过"
                            : r.status === "missing"
                            ? "待补充"
                            : "冲突"}
                        </span>
                        <div>
                          <b>{r.label}</b>
                          <p>{r.detail}</p>
                        </div>
                        {r.status !== "ok" && r.field && (
                          <button onClick={() => focusField(r.field)}>
                            修改
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {review.checks.some((r) => r.status === "ok") && (
                  <details className="df-passed">
                    <summary>
                      {review.checks.filter((r) => r.status === "ok").length}{" "}
                      项日期校核通过 · 查看明细
                    </summary>
                    {review.checks
                      .filter((r) => r.status === "ok")
                      .map((r, i) => (
                        <p key={i}>
                          <b>{r.label}</b>
                          <br />
                          {r.detail.replaceAll("T", " ")}
                        </p>
                      ))}
                  </details>
                )}
                <div className="df-review-data">
                  <h3>共用信息</h3>
                  <dl>
                    {draft.fields.map((f) => (
                      <div
                        key={f.key}
                        className={isParagraph(f) ? "df-span" : undefined}
                      >
                        <dt>{f.label}</dt>
                        <dd>
                          {(draft.document_values?.[f.key] ?? f.value) ||
                            "尚未填写"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {draft.recipients.length > 0 && (
                    <>
                      <h3>受邀单位</h3>
                      {draft.recipients.map((r, i) => (
                        <p key={i}>
                          {i + 1}. {r.name || "尚未填写"}　
                          {draft.recipient_document_times?.[i] ??
                            `${r.start.replace("T", " ")} — ${r.end.replace(
                              "T",
                              " ",
                            )}`}
                        </p>
                      ))}
                    </>
                  )}
                </div>
                <div className="df-review-data">
                  <h3>输出清单</h3>
                  {templates.map((t) => (
                    <p key={t.id}>
                      {t.name} ·{" "}
                      {t.per_recipient
                        ? draft.recipients
                            .map((r) => r.name || "待填单位")
                            .join("、")
                        : "共用文件"}
                    </p>
                  ))}
                </div>
                <div className="df-confirm">
                  <label>
                    <input
                      type="checkbox"
                      checked={confirmed}
                      disabled={!review.can_generate}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    我已核对填写内容、受邀单位和日期安排
                  </label>
                  <p>
                    校核检查资料完整性及时间顺序。业务条款与 Word
                    模板请由经办人复核。
                  </p>
                  <div>
                    <button
                      onClick={() => {
                        setStage("edit");
                        setConfirmed(false);
                      }}
                    >
                      返回修改
                    </button>
                    <button
                      className="df-primary"
                      disabled={!review.can_generate || !confirmed}
                      onClick={generate}
                    >
                      确认并生成 {outputCount} 份文书
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
          {draft && stage === "files" && generation && (
            <div className="df-results">
              <section className="df-paper df-output-list">
                <span className="df-eyebrow">生成记录</span>
                <h2>{generation.files.length} 份文件已生成</h2>
                <p>
                  {time(generation.created_at)} · 修订 {generation.revision}
                </p>
                {(dirty || generation.revision !== draft.revision) && (
                  <div className="df-alert">
                    填写内容已有修改，下列文件保留生成时的内容。请重新核对并生成新版。
                  </div>
                )}
                <button
                  className="df-primary"
                  onClick={() =>
                    run("下载全部文书", () =>
                      download(
                        filePath(generation, "全部文书.zip"),
                        draft.name + "_文书.zip",
                      ),
                    )
                  }
                >
                  下载全部文书
                </button>
                <p className="df-muted">包含 Word、填写数据和核对记录</p>
                {draft.generations.map((g) => (
                  <div className="df-generation" key={g.id}>
                    <h3>
                      {time(g.created_at)} · 修订 {g.revision}
                      {g.date_style !== "zh-CN" && " · 原日期格式"}
                    </h3>
                    {g.files.map((f) => (
                      <div
                        className={
                          "df-output " +
                          (preview?.file.name === f.name &&
                          preview?.generation.id === g.id
                            ? "selected"
                            : "")
                        }
                        key={f.name}
                      >
                        <button
                          onClick={() => setPreview({ file: f, generation: g })}
                        >
                          <b>{f.name}</b>
                          <small>
                            {f.recipient} · {(f.size / 1024).toFixed(0)} KB
                          </small>
                        </button>
                        <button
                          aria-label={"下载" + f.name}
                          onClick={() =>
                            run("下载文件", () =>
                              download(filePath(g, f.name), f.name),
                            )
                          }
                        >
                          ↓
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </section>
              <section className="df-paper df-preview">
                <div className="df-section-head">
                  <h2>{preview ? preview.file.name : "选择文件预览"}</h2>
                  <span>Office 预览</span>
                </div>
                <div className="df-preview-body">
                  {artifact && Preview ? (
                    <Preview
                      key={artifact.id}
                      artifact={artifact}
                      readOnly
                      hostControls
                    />
                  ) : (
                    <p className="df-muted">
                      {artifact ? "正在打开文件…" : "从左侧选择一份文件。"}
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
        </fieldset>
        <footer className="df-footer">
          <span>UGSci · 文书填报</span>
          <span>数据与文书保存在当前服务端 · 无需模型服务</span>
        </footer>
      </section>
    </main>
  );
}
function App() {
  const agent = Q.host.useSelectedAgent?.();
  return (
    <Workbench key={agent?.id || Q.host.getSelectedAgentId?.() || "default"} />
  );
}
Q.registerRoutes("document-forms", [
  {
    path: "/apps/document-forms",
    component: App,
    label: "文书填报",
    icon: "▤",
  },
]);
