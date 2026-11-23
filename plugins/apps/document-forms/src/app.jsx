import OfficeServicePreview, { OfficePrintPreview } from "./office-preview.jsx";
import ProjectWorkspace from "./project-workspace.jsx";
import WorkflowTabs, { fieldTab, negotiationTabs } from "./workflow-tabs.jsx";
import { ToolbarIcon, ToolbarMenu } from "./toolbar.jsx";
import FieldLabel from "./field-label.jsx";
import LinkedOpinion from "./linked-opinion.jsx";
import { refreshLinkedFields } from "./linked-fields.js";
const Q = window.QwenPaw,
  React = Q.host.React;
const { useState, useEffect, useLayoutEffect, useRef } = React;
const API = "/document-forms";
function generatedSelection(caseId, generation, file) {
  return {
    artifact: {
      id: generation.id + file.name,
      title: file.name,
      source: "generated",
      extension: file.name.endsWith(".xlsx") ? "xlsx" : "docx",
      mimeType: file.name.endsWith(".xlsx")
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      binaryUrl: file.preview_url,
      printUrl:
        API +
        `/cases/${caseId}/print/${generation.id}/${encodeURIComponent(
          file.name,
        )}`,
      agentId: Q.host.getSelectedAgentId?.(),
      createdAt: Date.parse(generation.created_at),
    },
    reference: {
      case_id: caseId,
      generation_id: generation.id,
      name: file.name,
    },
  };
}

async function request(path, init) {
  const response = await Q.host.fetch(API + path, init);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(
      typeof data.detail?.message === "string"
        ? data.detail.message
        : typeof data.detail === "string"
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
    error.issues = data.detail?.issues;
    throw error;
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
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
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
const recipientDate = (value) =>
  value?.match(/^\d{4}-\d{2}-\d{2}(?=[T ]|$)/)?.[0];

function recipientDefaults(recipients, previous) {
  const rows = recipients.map((recipient) => ({ ...recipient }));
  for (const [index, row] of rows.entries()) {
    const endWasUnspecified = typeof row.follow_end !== "boolean" && !row.end;
    for (const key of ["start", "end"]) {
      const flag = "follow_" + key;
      row[flag] =
        index > 0 && (typeof row[flag] === "boolean" ? row[flag] : !row[key]);
      row[key] = (row[flag] ? rows[0][key] : row[key]) || "";
    }
    const day = recipientDate(row.start);
    const startChanged = previous && row.start !== previous[index].start;
    const followsFirstClock =
      row.follow_end && row.end && day !== recipientDate(rows[0].start);
    if (
      day &&
      (startChanged || followsFirstClock || (endWasUnspecified && !row.end))
    ) {
      const clock = row.end.match(/[T ](\d{2}:\d{2}(?::\d{2})?)$/)?.[1];
      row.end = day + "T" + (clock || "17:30");
    }
  }
  return rows;
}
function PlanPartnersField({ field, onChange }) {
  const names = ["", "", ""];
  let next = 0;
  for (const line of field.value.split(/\r?\n/)) {
    const numbered = line.match(/^\s*([1-3])[.、．)）]\s?(.*)$/);
    if (numbered) names[Number(numbered[1]) - 1] = numbered[2];
    else if (next < 3) names[next++] = line;
  }
  return (
    <div
      className="df-plan-partners"
      id="df-plan.partners"
      role="group"
      aria-label={field.label}
    >
      <FieldLabel field={field} />
      {names.map((name, index) => (
        <label className="df-field" key={index}>
          <span>单位{index + 1}</span>
          <input
            aria-label={`单位${index + 1}`}
            type="text"
            value={name}
            onChange={(event) => {
              const updated = names.map((value, row) =>
                row === index ? event.target.value : value,
              );
              onChange(
                updated.some((value) => value.trim())
                  ? updated
                      .map((value, row) => `${row + 1}. ${value}`)
                      .join("\n")
                  : "",
              );
            }}
          />
        </label>
      ))}
    </div>
  );
}
function DraftConflicts({ title, issues, onFix }) {
  if (!issues.length) return null;
  return (
    <section className="df-paper" aria-label={title}>
      <h3>{title}</h3>
      <div className="df-checks" aria-live="polite">
        {issues.map(({ label, detail, status, field }, index) => (
          <div key={index} className={"df-check " + status}>
            <span>{status === "missing" ? "待补充" : "冲突"}</span>
            <div>
              <b>{label}</b>
              <p>{detail}</p>
            </div>
            {field && <button onClick={() => onFix(field)}>修改</button>}
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ field, displayValue, onChange, issue }) {
  const inputId = "df-input-" + field.key;
  const validation = issue
    ? {
        "aria-invalid": true,
        "aria-describedby": inputId + "-error",
      }
    : {};
  const multiline = field.key !== "plan.notes" && isParagraph(field);
  const linked = field.linked_template !== undefined;
  const compact = compactParagraph(field) || linked;
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
  if (field.key === "plan.partners")
    return <PlanPartnersField field={field} onChange={onChange} />;
  return (
    <div
      className={
        "df-field" +
        (multiline ? " df-field-paragraph" : "") +
        (compact ? " df-field-compact" : "")
      }
      id={"df-" + field.key}
    >
      <FieldLabel field={field} inputId={inputId} />
      {linked ? (
        <LinkedOpinion field={field} inputId={inputId} onChange={onChange} />
      ) : field.options ? (
        <select
          id={inputId}
          aria-label={field.label}
          aria-required={field.required || undefined}
          {...validation}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">请选择</option>
          {value && !field.options.includes(value) && (
            <option value={value} disabled>
              {value}（请重新选择）
            </option>
          )}
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          id={inputId}
          ref={textarea}
          aria-label={field.label}
          aria-required={field.required || undefined}
          {...validation}
          rows={compact ? 3 : 8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={inputId}
          aria-label={field.label}
          aria-required={field.required || undefined}
          {...validation}
          type={field.key === "plan.notes" ? "text" : field.kind}
          readOnly={!!field.read_only}
          step={field.kind === "number" ? "any" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {issue && (
        <small id={inputId + "-error"} className="df-field-validation">
          {issue.detail}
        </small>
      )}
    </div>
  );
}
function SelectionMembers({ fields, onChange, compact = false }) {
  const members = fields.filter((f) =>
    /^selection\.member\d+_name$/.test(f.key),
  );
  if (!members.length) return null;
  const presets = {
    unit: [
      "地下空间利用研究所",
      ...fields
        .filter((f) =>
          ["contact.department", "project.executing_unit"].includes(f.key),
        )
        .map((f) => f.value),
    ],
    title: [
      "副所长/高工",
      "企业高级专家/高工",
      "部门负责人/高工",
      "一级工程师/高工",
      "高级工程师",
      "工程师",
      "教授",
      "副教授",
    ],
    category: ["主任", "副主任", "科委会成员", "专家", "组长", "成员"],
  };
  return (
    <section className="df-group df-selection-members" aria-label="论证成员">
      {!compact && <h3>论证成员</h3>}
      {!compact && (
        <p className="df-muted">
          每人一行。单位、职务/职称和类别可选择，也可直接输入。
        </p>
      )}
      <div className="df-member-scroll">
        <table className="df-member-table">
          <thead>
            <tr>
              <th scope="col">序号</th>
              <th scope="col">姓名</th>
              <th scope="col">单位</th>
              <th scope="col">职务/职称</th>
              <th scope="col">类别</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => {
              const prefix = member.key.replace(/name$/, "");
              return (
                <tr key={member.key}>
                  <th scope="row">{String(index + 1).padStart(2, "0")}</th>
                  {["name", "unit", "title", "category"].map((column) => {
                    const field = fields.find((f) => f.key === prefix + column);
                    if (!field) return <td key={column} />;
                    const suggestions =
                      column === "name"
                        ? []
                        : [
                            ...new Set(
                              [
                                ...presets[column],
                                ...fields
                                  .filter((f) =>
                                    new RegExp(
                                      `^selection\\.member\\d+_${column}$`,
                                    ).test(f.key),
                                  )
                                  .map((f) => f.value),
                              ].filter(Boolean),
                            ),
                          ];
                    const list = "df-options-" + field.key;
                    return (
                      <td key={column} id={"df-" + field.key}>
                        <input
                          aria-label={field.label}
                          value={field.value}
                          list={suggestions.length ? list : undefined}
                          autoComplete="off"
                          onChange={(e) => onChange(field.key, e.target.value)}
                        />
                        {suggestions.length > 0 && (
                          <datalist id={list}>
                            {suggestions.map((value) => (
                              <option value={value} key={value} />
                            ))}
                          </datalist>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function Workbench({
  project,
  workflowStage,
  initialCaseId,
  initialView,
  editRequest = 0,
  initialDraft,
  onBack,
  onChanged,
  onDirtyChange,
  onBusyChange,
  onViewChange,
  docked = false,
  onPreview,
  nodeTab,
  selectedOutput,
  onAskAboutOutput,
  onStageStatus,
  onEditBasics,
  toolbarTarget,
  onShowForm,
  onDownloadStageMaterials,
}) {
  const [draft, setDraft] = useState(null);
  const [formTab, setFormTab] = useState("");
  const [comparison, setComparison] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [stage, setStage] = useState("import"),
    [dirty, setDirty] = useState(false);
  const [fillingIssues, setFillingIssues] = useState([]);
  const [ruleIssues, setRuleIssues] = useState([]);
  const [agentIssues, setAgentIssues] = useState([]);
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
  const refresh = () => onChanged?.() || Promise.resolve();
  const compact = docked && toolbarTarget && Q.host.ReactDOM?.createPortal;
  useEffect(() => {
    alive.current = true;
    (initialDraft
      ? Promise.resolve(initialDraft)
      : request("/cases/" + initialCaseId)
    )
      .then((data) => {
        if (!alive.current) return;
        receive(data);
        setStage(
          initialView === "files" && data.generations.length ? "files" : "edit",
        );
        if (initialView === "files" && data.generations.length)
          setPreview({
            file: data.generations[0].files[0],
            generation: data.generations[0],
          });
      })
      .catch((e) => alive.current && setError(e.message));
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
    if (editRequest) {
      setStage("edit");
    }
  }, [editRequest]);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty]);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy]);
  useEffect(() => {
    onViewChange?.();
  }, [stage]);
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
      if (alive.current && ticket === seq.current) {
        setError(e.message);
        if (nodeTab !== "generate") onShowForm?.();
      }
    } finally {
      if (alive.current && ticket === seq.current) setBusy("");
    }
  }
  function receive(data, { retainAgent = false } = {}) {
    if (!alive.current) return;
    setDraft({
      ...data,
      recipients: recipientDefaults(data.recipients),
      presentation_sources: Object.fromEntries(
        data.fields.map((f) => [f.key, f.value]),
      ),
    });
    setDirty(false);
    setFillingIssues([]);
    setRuleIssues([]);
    if (!retainAgent) setAgentIssues([]);
  }
  function edit(update) {
    setDraft({ ...update, fields: refreshLinkedFields(update.fields) });
    setDirty(true);
    if (docked) setStage("edit");
    setFillingIssues([]);
    setRuleIssues([]);
    setAgentIssues([]);
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
    edit({
      ...draft,
      recipients: recipientDefaults(
        recipients,
        key === "start" ? draft.recipients : undefined,
      ),
    });
  }
  function draftContent() {
    return {
      revision: draft.revision,
      name: draft.name.trim() || "未命名填报",
      values: Object.fromEntries(draft.fields.map((f) => [f.key, f.value])),
      recipients: draft.recipients,
      opinion_templates: Object.fromEntries(
        draft.fields
          .filter((f) => f.linked_template !== undefined)
          .map((f) => [f.key, f.linked_template]),
      ),
    };
  }
  async function saveDraft() {
    if (!dirty) return draft;
    const data = await request("/cases/" + draft.id, {
      ...json(draftContent()),
      method: "PUT",
    });
    receive(data, { retainAgent: true });
    return data;
  }
  function canLeave() {
    return !dirty || window.confirm("当前有未保存的修改。离开此记录？");
  }
  const isPlan = draft?.stage_id === "plan" && draft?.plan_schema === 1;
  const isSelection =
    draft?.stage_id === "selection" && draft?.selection_schema === 1;
  const isContract = draft?.stage_id === "contract";
  const isNegotiation =
    (workflowStage?.id || draft?.stage_id) === "negotiation";
  const selectionApproval = isNegotiation
    ? project?.stages?.find(
        (item) => item.id === "selection" && item.status === "completed",
      )
    : undefined;
  const selectionApprovalDate = recipientDate(selectionApproval?.approval_date);
  const tabFor = (field) =>
    fieldTab(field, isNegotiation ? "negotiation" : undefined);
  const recipientsTab = isNegotiation ? negotiationTabs[2] : "recipients";
  const hasSharedReferences = isPlan || isSelection || isContract;
  const templateLabel = hasSharedReferences ? "文书模板" : "Word 模板";
  const editableFields = hasSharedReferences
    ? draft.fields.filter((f) => f.scope !== "shared")
    : draft?.fields || [];
  const fieldTabs = [
    ...new Set([
      ...(isNegotiation ? negotiationTabs : []),
      ...editableFields.map(tabFor),
    ]),
  ];
  if (isSelection) {
    const order = [
      "论证安排",
      "候选单位",
      "论证成员",
      "论证意见",
      "非招标方案",
    ];
    fieldTabs.sort((a, b) => {
      const position = (name) => {
        const index = order.indexOf(name);
        return index < 0 ? order.length : index;
      };
      return position(a) - position(b);
    });
  }
  const formTabs = [
    ...fieldTabs.map((label) => ({ id: label, label })),
    ...(!hasSharedReferences && !isNegotiation
      ? [{ id: "recipients", label: "受邀单位" }]
      : []),
    ...(!docked ? [{ id: "generate", label: "模板与生成", align: "end" }] : []),
  ];
  const activeFormTab = formTabs.some((item) => item.id === formTab)
    ? formTab
    : formTabs[0]?.id;
  const templates = draft?.templates || [];
  const outputCount = templates.reduce(
    (n, t) => n + (t.per_recipient ? draft.recipients.length : 1),
    0,
  );
  const isStageGeneration = (generation, form) =>
    (generation.stage_id || form.original_stage_id || form.stage_id) ===
    workflowStage.id;
  const visibleGenerations = (draft?.generations || []).filter(
    (generation) => !docked || isStageGeneration(generation, draft),
  );
  const generation = visibleGenerations[0];
  const historicalForms = docked
    ? project.forms.filter(
        (form) => form.case_id !== (draft?.id || project.form_id),
      )
    : [];
  const batches = [
    ...visibleGenerations.map((batch) => ({ caseId: draft.id, batch })),
    ...historicalForms.flatMap((form) =>
      form.generations
        .filter((batch) => isStageGeneration(batch, form))
        .map((batch) => ({ caseId: form.case_id, batch })),
    ),
  ];
  useEffect(() => {
    if (!draft || busy || stage !== "edit" || (docked && nodeTab !== "form"))
      return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await request("/cases/" + draft.id + "/validate", {
          ...json(draftContent()),
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setFillingIssues(result.issues);
      } catch {
        // Generation validates again even if live validation is unavailable.
        if (!controller.signal.aborted) setFillingIssues([]);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [draft, busy, stage, nodeTab, docked, selectionApprovalDate]);

  function fixableIssues(items) {
    return items.map((issue) => ({
      ...issue,
      field:
        draft.fields.some((f) => f.key === issue.field) ||
        /^recipient-\d+(?:-start|-end)?$/.test(issue.field)
          ? issue.field
          : "",
    }));
  }
  async function importExcel(file) {
    if (!file || !canLeave()) return;
    await run("读取 Excel", async () => {
      const form = new FormData();
      form.append("workbook", file);
      form.append("revision", project.revision);
      form.append("stage_id", workflowStage.id);
      const data = await request(
        `/projects/${project.id}/${
          project.single_form ? "form" : "cases"
        }/import`,
        {
          method: "POST",
          body: form,
        },
      );
      receive(data);
      setPreview(null);
      setFormTab("");
      setStage("edit");
      onShowForm?.();
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
      await refresh();
      setNotice("Word 模板已添加，生成时会保留原有排版。");
    });
  }
  async function checkWithAgent() {
    await run("智能体核查", async () => {
      setAgentIssues([]);
      const result = await request(
        "/cases/" + draft.id + "/agent-check",
        json(draftContent()),
      );
      if (!alive.current) return;
      setAgentIssues(result.issues);
      if (!result.issues.length) setNotice("智能体未发现冲突。");
    });
  }
  async function generate() {
    await run("生成文书", async () => {
      setRuleIssues([]);
      const saved = await saveDraft();
      let data;
      try {
        data = await request(
          "/cases/" + saved.id + "/generate",
          json({ revision: saved.revision }),
        );
      } catch (error) {
        if (!Array.isArray(error.issues)) throw error;
        if (alive.current) setRuleIssues(error.issues);
        return;
      }
      if (!alive.current) return;
      receive(data, { retainAgent: true });
      const batch = data.generations[0];
      const file = batch.files[0];
      if (docked) {
        setStage("edit");
        if (file) onPreview(generatedSelection(data.id, batch, file));
      } else {
        setStage("files");
        setPreview({ file, generation: batch });
      }
      await refresh();
    });
  }
  function focusField(key) {
    const field = draft.fields.find((item) => item.key === key);
    if (field?.scope === "shared" && hasSharedReferences && onEditBasics) {
      onEditBasics();
      return;
    }
    setFormTab(
      field
        ? tabFor(field)
        : key.startsWith("recipient-")
        ? recipientsTab
        : "generate",
    );
    setStage("edit");
    if (field || key.startsWith("recipient-")) onShowForm?.();
    requestAnimationFrame(() => {
      const el = document.getElementById("df-" + key);
      el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      const controls = "input,textarea,select";
      const input = el?.matches(controls) ? el : el?.querySelector(controls);
      input?.focus();
    });
  }
  const filePath = (caseId, batch, filename) =>
    `/cases/${caseId}/outputs/${batch.id}/${encodeURIComponent(filename)}`;
  function downloadBundle(caseId, batch) {
    return run("正在下载压缩包", async () => {
      await download(
        filePath(caseId, batch, "全部文书.zip"),
        batch.bundle_name || (docked ? project.name : draft.name) + "_文书.zip",
      );
      setNotice(`已开始下载该批次的 ${batch.files.length} 份文书压缩包。`);
    });
  }
  const artifact = preview?.file
    ? generatedSelection(draft.id, preview.generation, preview.file).artifact
    : null;
  async function exportExcel() {
    await run("导出 Excel", async () => {
      const data = await saveDraft();
      await download(
        "/cases/" + data.id + "/excel",
        (data.fields.find((f) => f.key === "project.name")?.value || data.name)
          .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
          .slice(0, 80) + "_填写数据.xlsx",
      );
    });
  }
  const templatePanel = (
    <section className="df-paper df-template-panel" aria-label={templateLabel}>
      <div className="df-section-head">
        {!compact && <h2>{templateLabel}</h2>}
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
                    workflowStage.id === "negotiation"
                      ? "已设为本机默认模板，以后新建填报会自动载入。"
                      : "已设为本阶段默认模板，以后新建该阶段表单会自动载入。",
                  );
                })
              }
            >
              {workflowStage.id === "negotiation"
                ? "设为默认模板"
                : "设为本阶段默认模板"}
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
          {!compact && (
            <button onClick={() => wordInput.current.click()}>＋ 添加</button>
          )}
        </div>
      </div>
      {!compact && !templates.length && (
        <p className="df-muted">添加与你的变量表对应的 .docx 或 .xlsx 模板。</p>
      )}
      {templates.map((t) => (
        <div className="df-template" key={t.id}>
          <b>{t.name}</b>
          {t.from_builtin && <small>应用自带模板</small>}
          <span>
            {t.per_recipient ? "按受邀单位分别生成" : "共用文件 · 生成一份"}
          </span>
          {t.print_copies > 1 && (
            <small>
              建议打印 {t.print_copies} 份 · {t.print_note}
            </small>
          )}
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
  );
  const recipientsPanel = draft && !hasSharedReferences && (
    <section
      className={isNegotiation ? "df-recipient-section" : "df-paper"}
      role={isNegotiation ? undefined : "tabpanel"}
      id="df-form-panel-recipients"
      aria-labelledby={`df-form-tab-${recipientsTab}`}
      hidden={activeFormTab !== recipientsTab}
    >
      <div className="df-section-head">
        <div>
          <h2>
            受邀单位 <span className="df-count">{draft.recipients.length}</span>
          </h2>
          <p>按单位文书分别生成，共用项目与落款信息。</p>
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
        <div className="df-recipient" key={i} id={"df-recipient-" + i}>
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
            ].map(([key, label]) => {
              const id = `df-recipient-${i}-${key}`;
              const startDate = recipientDate(r.start);
              const approvalIssue =
                key === "start" &&
                selectionApprovalDate &&
                startDate &&
                startDate <= selectionApprovalDate
                  ? `领取开始日期必须晚于选商论证审批日期（${selectionApprovalDate}）。`
                  : "";
              const issues = fillingIssues
                .filter(
                  (item) =>
                    item.status === "error" &&
                    item.field === `recipient-${i}-${key}` &&
                    item.detail !== approvalIssue,
                )
                .map((item) => item.detail);
              if (approvalIssue) issues.unshift(approvalIssue);
              return (
                <div
                  className={"df-field " + (key === "name" ? "df-span" : "")}
                  key={key}
                >
                  <label htmlFor={id}>{label}</label>
                  <input
                    id={id}
                    aria-label={`第${i + 1}家${label}`}
                    aria-invalid={issues.length ? true : undefined}
                    aria-describedby={issues.length ? id + "-error" : undefined}
                    type={key === "name" ? "text" : "datetime-local"}
                    value={key === "name" ? r[key] : r[key].replace(" ", "T")}
                    onChange={(e) => editRecipient(i, key, e.target.value)}
                  />
                  {issues.length === 1 && (
                    <small id={id + "-error"} className="df-field-validation">
                      {issues[0]}
                    </small>
                  )}
                  {issues.length > 1 && (
                    <ul id={id + "-error"} className="df-field-validation">
                      {issues.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  )}
                  {i > 0 && key !== "name" && (
                    <small className="df-follow-state">
                      {r["follow_" + key]
                        ? key === "end"
                          ? "时刻跟随第1家"
                          : "跟随第1家"
                        : "已单独设置"}
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
                </div>
              );
            })}
          </div>
          {fillingIssues
            .filter(
              (item) =>
                item.status === "error" && item.field === "recipient-" + i,
            )
            .map((item, index) => (
              <p className="df-field-validation" key={index}>
                {item.detail}
              </p>
            ))}
        </div>
      ))}
    </section>
  );
  const toolbarContent = (
    <>
      <div className="df-toolbar-file-actions">
        <ToolbarMenu label="模板" icon="template" disabled={!!busy || !draft}>
          <button
            className="df-toolbar-template-import"
            disabled={!!busy}
            onClick={() => wordInput.current.click()}
          >
            <ToolbarIcon name="import" />
            导入模板
          </button>
          <button
            aria-label="下载配套模板"
            disabled={!!busy}
            onClick={() =>
              run("下载配套模板", () =>
                download("/starter", "文书填报_配套模板.zip"),
              )
            }
          >
            <ToolbarIcon name="download" />
            下载模板
          </button>
          {templatePanel}
        </ToolbarMenu>
        <button
          aria-label="下载本阶段材料"
          title="下载本阶段材料"
          disabled={!!busy}
          onClick={onDownloadStageMaterials}
        >
          <ToolbarIcon name="download" />
          阶段材料
        </button>
        <ToolbarMenu
          label="更多操作"
          icon="more"
          iconOnly
          disabled={!!busy || !draft}
        >
          <label className="df-field">
            <span>表单名称</span>
            <input
              aria-label="表单名称"
              maxLength={120}
              value={draft?.name || ""}
              onChange={(event) => edit({ ...draft, name: event.target.value })}
            />
          </label>
          <button
            disabled={!!busy}
            onClick={() => {
              setComparison("adopt");
              setSelectedKeys([]);
              onShowForm?.();
            }}
          >
            核对项目资料差异
          </button>
          <button
            disabled={!!busy}
            onClick={() => {
              setComparison("publish");
              setSelectedKeys([]);
              onShowForm?.();
            }}
          >
            存入项目底稿
          </button>
        </ToolbarMenu>
      </div>
      <div className="df-toolbar-save">
        {draft && (
          <span
            className={"df-save-state" + (dirty ? " is-dirty" : "")}
            title={
              dirty
                ? "有未保存的修改"
                : "草稿已保存 · " + time(draft.updated_at)
            }
            role="status"
          >
            {dirty ? "未保存" : "已保存"}
          </span>
        )}
        <button
          className="df-toolbar-icon-button"
          title="导入 Excel"
          aria-label="导入 Excel"
          disabled={!!busy || !draft}
          onClick={() => excelInput.current.click()}
        >
          <ToolbarIcon name="import" />
        </button>
        <button
          className="df-toolbar-icon-button"
          title="导出当前 Excel"
          aria-label="导出当前 Excel"
          disabled={!!busy || !draft}
          onClick={exportExcel}
        >
          <ToolbarIcon name="export" />
        </button>
        <button
          className="df-primary df-toolbar-icon-button"
          aria-label="保存草稿"
          title="保存草稿"
          disabled={!!busy || !draft || !dirty}
          onClick={() =>
            run("保存草稿", async () => {
              await saveDraft();
              await refresh();
              setNotice("草稿已保存");
            })
          }
        >
          <ToolbarIcon name="save" />
        </button>
      </div>
    </>
  );
  const generationPlan = draft && (
    <>
      {!compact && templatePanel}
      <DraftConflicts
        title="规则冲突"
        issues={fixableIssues(ruleIssues)}
        onFix={focusField}
      />
      <DraftConflicts
        title="智能体冲突"
        issues={fixableIssues(agentIssues)}
        onFix={focusField}
      />
      <section className="df-paper df-edit-footer" aria-label="文件生成操作">
        <div className="df-generation-plan">
          <p>
            本次计划生成 <b>{outputCount}</b> 份文书
          </p>
        </div>
        <div className="df-actions">
          <button onClick={checkWithAgent}>智能体核查</button>
          <button className="df-primary" onClick={generate}>
            生成文件
          </button>
        </div>
      </section>
    </>
  );
  return (
    <div className="df-app df-embedded-editor" data-theme={theme}>
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
        accept=".docx,.xlsx"
        multiple
        hidden
        aria-label="导入 Word 模板"
        onChange={(e) => {
          importWord(e.target.files);
          e.target.value = "";
        }}
      />
      <section className="df-main">
        {!docked && (
          <div className="df-editor-context">
            <button
              disabled={!!busy}
              onClick={() => {
                if (canLeave()) onBack();
              }}
            >
              ← 返回{workflowStage.title}
            </button>
            <span>
              {project.name} / {workflowStage.title}
            </span>
            {docked && (
              <button
                disabled={!!busy || dirty}
                title={dirty ? "请先保存表单" : "更新当前节点的办理信息"}
                onClick={onStageStatus}
              >
                办理信息与状态
              </button>
            )}
            {draft && (
              <div className="df-actions">
                <button
                  disabled={!!busy}
                  onClick={() => {
                    setComparison("adopt");
                    setSelectedKeys([]);
                  }}
                >
                  核对项目资料差异
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => {
                    setComparison("publish");
                    setSelectedKeys([]);
                  }}
                >
                  存入项目底稿
                </button>
              </div>
            )}
          </div>
        )}
        {!compact && (
          <header className="df-header">
            <div>
              {!docked && (
                <span className="df-eyebrow">
                  {workflowStage.title} / 填写与生成
                </span>
              )}
              <h1>
                {draft ? (docked ? "填写内容" : draft.name) : "填写项目资料"}
              </h1>
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
        )}
        {compact ? (
          Q.host.ReactDOM.createPortal(toolbarContent, toolbarTarget)
        ) : docked ? (
          <div className="df-node-tools" aria-label="表单操作">
            <button
              disabled={!!busy}
              onClick={() => excelInput.current.click()}
            >
              导入 Excel
            </button>
            <details>
              <summary>更多操作</summary>
              <div className="df-actions">
                <button
                  disabled={!!busy}
                  onClick={() => {
                    setComparison("adopt");
                    setSelectedKeys([]);
                  }}
                >
                  核对项目资料差异
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => {
                    setComparison("publish");
                    setSelectedKeys([]);
                  }}
                >
                  存入项目底稿
                </button>
              </div>
            </details>
          </div>
        ) : (
          <div className="df-steps" aria-label="填写流程">
            {[
              ["import", "01", "导入模板"],
              ["edit", "02", "填写资料"],
              ["generate", "03", "文件生成"],
              ["files", "04", "文件预览"],
            ].map(([id, n, label]) => (
              <button
                key={id}
                aria-current={stage === id ? "step" : undefined}
                className={stage === id ? "active" : ""}
                disabled={
                  !!busy ||
                  (!draft && id !== "import") ||
                  (id === "files" && !generation)
                }
                onClick={() => {
                  if (id === "generate") setFormTab("generate");
                  setStage(id === "generate" ? "edit" : id);
                }}
              >
                <span>{n}</span>
                {label}
              </button>
            ))}
          </div>
        )}
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
                    <b>自动载入模板</b>
                    <p>
                      应用自带 5 份标准 Word 模板，使用配套 Excel 即可自动载入；
                      也可添加自己的模板。
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
          {draft && (docked || stage === "edit") && (
            <div
              className="df-edit-layout"
              id={docked ? "df-node-panel-form" : undefined}
              role={docked ? "tabpanel" : undefined}
              aria-labelledby={docked ? "df-node-tab-form" : undefined}
              hidden={docked && nodeTab !== "form"}
            >
              {!compact && (
                <section className="df-paper df-form-heading">
                  <div className="df-section-head">
                    {!docked && <h2>填写信息</h2>}
                    <button
                      onClick={() =>
                        run("导出 Excel", async () => {
                          const data = await saveDraft();
                          await download(
                            `/cases/${data.id}/excel`,
                            (
                              data.fields.find((f) => f.key === "project.name")
                                ?.value || data.name
                            )
                              .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
                              .slice(0, 80) + "_填写数据.xlsx",
                          );
                        })
                      }
                    >
                      导出当前 Excel
                    </button>
                  </div>
                  <label className="df-field df-title-field">
                    <span>表单名称</span>
                    <input
                      aria-label="表单名称"
                      maxLength={120}
                      value={draft.name}
                      onChange={(e) => edit({ ...draft, name: e.target.value })}
                    />
                  </label>
                </section>
              )}
              <WorkflowTabs
                id="df-form"
                label="填写内容分组"
                items={formTabs}
                value={activeFormTab}
                onChange={setFormTab}
              />
              {fieldTabs.map((tab) => (
                <section
                  className="df-paper df-form-panel"
                  key={tab}
                  role="tabpanel"
                  id={`df-form-panel-${tab}`}
                  aria-labelledby={`df-form-tab-${tab}`}
                  hidden={activeFormTab !== tab}
                >
                  {isNegotiation && tab === recipientsTab && recipientsPanel}
                  {[
                    ...new Set(
                      editableFields
                        .filter(
                          (f) =>
                            tabFor(f) === tab &&
                            !/^selection\.member\d+_/.test(f.key),
                        )
                        .map((f) => f.group),
                    ),
                  ].map((group) => (
                    <section className="df-group" key={group}>
                      {!isNegotiation && (!compact || group !== tab) && (
                        <h3>{group}</h3>
                      )}
                      {!compact && group === "日期安排" && (
                        <p className="df-muted">
                          文书统一使用中文日期，例如“2026年10月22日下午14:30”。日期选择器保留原来的填写方式。
                        </p>
                      )}
                      <div className="df-fields">
                        {editableFields
                          .filter(
                            (f) =>
                              f.group === group &&
                              tabFor(f) === tab &&
                              !/^selection\.member\d+_/.test(f.key),
                          )
                          .map((field) => (
                            <Field
                              key={field.key}
                              field={field}
                              issue={fillingIssues.find(
                                (item) =>
                                  item.field === field.key &&
                                  (item.status === "error" ||
                                    draft.presentation_sources?.[field.key] !==
                                      field.value),
                              )}
                              displayValue={
                                draft.presentation_sources?.[field.key] ===
                                field.value
                                  ? draft.document_values?.[field.key]
                                  : undefined
                              }
                              onChange={(value, template) =>
                                edit({
                                  ...draft,
                                  fields: draft.fields.map((f) =>
                                    f.key === field.key
                                      ? {
                                          ...f,
                                          value,
                                          ...(template !== undefined
                                            ? { linked_template: template }
                                            : {}),
                                        }
                                      : f,
                                  ),
                                })
                              }
                            />
                          ))}
                      </div>
                    </section>
                  ))}
                  {tab === "论证成员" && (
                    <SelectionMembers
                      fields={editableFields}
                      compact={!!compact}
                      onChange={(key, value) =>
                        edit({
                          ...draft,
                          fields: draft.fields.map((f) =>
                            f.key === key ? { ...f, value } : f,
                          ),
                        })
                      }
                    />
                  )}
                </section>
              ))}
              {!isNegotiation && recipientsPanel}
              {!docked && (
                <div
                  role="tabpanel"
                  id="df-form-panel-generate"
                  aria-labelledby="df-form-tab-generate"
                  hidden={activeFormTab !== "generate"}
                >
                  {generationPlan}
                </div>
              )}
            </div>
          )}
          {draft && (
            <div
              className={docked ? "df-generation-panel" : undefined}
              id={docked ? "df-node-panel-generate" : undefined}
              role={docked ? "tabpanel" : undefined}
              aria-labelledby={docked ? "df-node-tab-generate" : undefined}
              hidden={docked && nodeTab !== "generate"}
            >
              {docked && stage === "edit" && generationPlan}
              {(docked || (stage === "files" && generation)) && (
                <div
                  className={
                    "df-results" + (docked ? " df-results-docked" : "")
                  }
                >
                  <section
                    className="df-paper df-output-list"
                    aria-label="生成记录"
                  >
                    {docked ? (
                      <h2>生成记录</h2>
                    ) : (
                      <>
                        <span className="df-eyebrow">生成记录</span>
                        <h2>{generation.files.length} 份文件已生成</h2>
                        <p>
                          {time(generation.created_at)} · 修订{" "}
                          {generation.revision}
                        </p>
                      </>
                    )}
                    {!batches.length && (
                      <p className="df-muted">本阶段还没有生成文件。</p>
                    )}
                    {generation && (
                      <p className="df-muted">
                        {isSelection
                          ? "压缩包包含论证意见及签字表、非招标方案、填写数据和核对记录"
                          : isPlan
                          ? "压缩包包含 Word、科研计划表、填写数据和核对记录"
                          : "压缩包包含 Word、填写数据和核对记录"}
                      </p>
                    )}
                    {generation &&
                      (dirty ||
                        (generation.content_digest
                          ? generation.content_digest !== draft.content_digest
                          : generation.revision !== draft.revision)) && (
                        <div className="df-alert">
                          填写内容已有修改，下列文件保留生成时的内容。请重新核对并生成新版。
                        </div>
                      )}
                    {batches.map(({ caseId, batch: g }) => (
                      <div className="df-generation" key={caseId + ":" + g.id}>
                        <div className="df-generation-heading">
                          <h3>
                            {time(g.created_at)} · 修订 {g.revision}
                            {g.date_style !== "zh-CN" && " · 原日期格式"}
                            {g.naming_style !== "formal" && " · 原文件名"}
                          </h3>
                          <button
                            aria-label={`打包下载 ${time(g.created_at)} 修订 ${
                              g.revision
                            }`}
                            onClick={() => downloadBundle(caseId, g)}
                          >
                            打包下载
                          </button>
                        </div>
                        {g.files.map((f) => {
                          const selected = docked
                            ? selectedOutput?.case_id === caseId &&
                              selectedOutput.generation_id === g.id &&
                              selectedOutput.name === f.name
                            : preview?.generation.id === g.id &&
                              preview.file.name === f.name;
                          return (
                            <div
                              className={
                                "df-output" + (selected ? " selected" : "")
                              }
                              key={f.name}
                            >
                              <button
                                onClick={() => {
                                  if (docked)
                                    onPreview(generatedSelection(caseId, g, f));
                                  else setPreview({ file: f, generation: g });
                                }}
                              >
                                <b>{f.name}</b>
                                <small>
                                  {f.recipient} · {(f.size / 1024).toFixed(0)}{" "}
                                  KB
                                  {f.print_copies > 1 &&
                                    ` · 建议打印 ${f.print_copies} 份`}
                                </small>
                              </button>
                              <button
                                aria-label={"下载" + f.name}
                                onClick={() =>
                                  run("下载文件", () =>
                                    download(
                                      filePath(caseId, g, f.name),
                                      f.name,
                                    ),
                                  )
                                }
                              >
                                ↓
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    {docked &&
                      selectedOutput?.case_id &&
                      batches.some(
                        ({ caseId, batch }) =>
                          caseId === selectedOutput.case_id &&
                          batch.id === selectedOutput.generation_id,
                      ) && (
                        <button onClick={onAskAboutOutput}>
                          就此文件提问 →
                        </button>
                      )}
                    {historicalForms.length > 0 && (
                      <details className="df-historical-forms">
                        <summary>历史底稿</summary>
                        {historicalForms.map((form) => (
                          <button
                            key={form.case_id}
                            onClick={() =>
                              run("下载历史底稿", () =>
                                download(
                                  `/cases/${form.case_id}/excel`,
                                  form.name + "_历史底稿.xlsx",
                                ),
                              )
                            }
                          >
                            {form.name} ↓
                          </button>
                        ))}
                      </details>
                    )}
                  </section>
                  {!docked && (
                    <section className="df-paper df-preview">
                      <div className="df-section-head">
                        <h2>{preview ? preview.file.name : "选择文件预览"}</h2>
                        <span>Office 预览</span>
                      </div>
                      <div className="df-preview-body">
                        {artifact && Preview ? (
                          <OfficePrintPreview
                            key={artifact.id}
                            artifact={artifact}
                          >
                            <Preview
                              key={artifact.id}
                              artifact={artifact}
                              readOnly
                              hostControls
                            />
                          </OfficePrintPreview>
                        ) : (
                          <p className="df-muted">
                            {artifact
                              ? "正在打开文件…"
                              : "从左侧选择一份文件。"}
                          </p>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          )}
        </fieldset>
        <footer className="df-footer">
          <span>UGSci · 外协助手</span>
        </footer>
      </section>
      {comparison && draft && (
        <div className="df-dialog-backdrop">
          <section
            className="df-dialog df-paper"
            role="dialog"
            aria-modal="true"
            aria-label="核对共用资料"
          >
            <div className="df-section-head">
              <h2>
                {comparison === "adopt"
                  ? "采用项目底稿中的资料"
                  : "将本表资料存入项目底稿"}
              </h2>
              <button
                disabled={!!busy}
                onClick={() => setComparison(null)}
                aria-label="关闭共用资料核对"
              >
                ×
              </button>
            </div>
            <p className="df-muted">
              只更新勾选项。原生成文件保留，后续生成前需重新核对。
            </p>
            {error && (
              <p role="alert" className="df-alert error">
                {error}
              </p>
            )}
            <div className="df-compare">
              {project.fields
                .filter((common) =>
                  draft.fields.some(
                    (f) => f.key === common.key && f.value !== common.value,
                  ),
                )
                .map((common) => {
                  const own = draft.fields.find((f) => f.key === common.key);
                  return (
                    <label key={common.key}>
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(common.key)}
                        onChange={(e) =>
                          setSelectedKeys(
                            e.target.checked
                              ? [...selectedKeys, common.key]
                              : selectedKeys.filter((k) => k !== common.key),
                          )
                        }
                      />
                      <div>
                        <b>{common.label}</b>
                        <div className="df-compare-values">
                          <p>
                            <small>当前表单</small>
                            {own.value || "空白"}
                          </p>
                          <p>
                            <small>项目底稿</small>
                            {common.value || "空白"}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              {!project.fields.some((common) =>
                draft.fields.some(
                  (f) => f.key === common.key && f.value !== common.value,
                ),
              ) && <p>本表与项目底稿中的共用资料一致。</p>}
            </div>
            <div className="df-actions">
              <button disabled={!!busy} onClick={() => setComparison(null)}>
                取消
              </button>
              <button
                className="df-primary"
                disabled={!!busy || !selectedKeys.length}
                onClick={() =>
                  run("同步共用资料", async () => {
                    const saved = await saveDraft();
                    if (comparison === "adopt") {
                      receive(
                        await request(
                          `/projects/${project.id}/cases/${saved.id}/sync`,
                          json({
                            revision: project.revision,
                            case_revision: saved.revision,
                            keys: selectedKeys,
                          }),
                        ),
                      );
                    } else {
                      const currentValues = Object.fromEntries(
                        saved.fields
                          .filter((f) => selectedKeys.includes(f.key))
                          .map((f) => [f.key, f.value]),
                      );
                      await request(`/projects/${project.id}`, {
                        ...json({
                          revision: project.revision,
                          name: currentValues["project.name"] ?? project.name,
                          code: currentValues["project.code"] ?? project.code,
                          owner: project.owner,
                          values: currentValues,
                        }),
                        method: "PUT",
                      });
                    }
                    await refresh();
                    setComparison(null);
                    setNotice("所选资料已同步，请重新核对后生成新版文书。");
                  })
                }
              >
                {comparison === "adopt"
                  ? "采用所选项目资料"
                  : "保存所选资料到底稿"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
function App() {
  const agent = Q.host.useSelectedAgent?.();
  return (
    <ProjectWorkspace
      key={agent?.id || Q.host.getSelectedAgentId?.() || "default"}
      Editor={Workbench}
      services={{ request, json, download, time, Field }}
    />
  );
}
Q.registerRoutes("document-forms", [
  {
    path: "/apps/document-forms",
    component: App,
    label: "外协助手",
    icon: "▤",
  },
]);
