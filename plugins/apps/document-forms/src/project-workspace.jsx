import CSS from "./workbench.css";
import OfficeServicePreview from "./office-preview.jsx";
import ResponseReview from "./response-review.jsx";
import RightWorkspace from "./right-workspace.jsx";

const Q = window.QwenPaw;
const React = Q.host.React;
const { useState, useEffect, useRef } = React;
const STATUS = {
  pending: "未开始",
  in_progress: "进行中",
  submitted: "已提交",
  completed: "已完成",
};
const MATERIAL = {
  pending: "待准备",
  preparing: "整理中",
  ready: "待提交",
  submitted: "已提交",
  done: "已完成",
  na: "不适用",
};
const labels = [
  "上报计划",
  "选商论证",
  "商务谈判",
  "开题论证",
  "合同审查",
  "结题验收",
  "归档付款",
];
const stamp = (value) =>
  value
    ? new Date(value).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

function Dialog({ title, children, onClose, error, busy = false }) {
  const panel = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    panel.current?.querySelector("input,select,textarea,button")?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div className="df-dialog-backdrop">
      <section
        ref={panel}
        className="df-dialog df-paper"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) {
            event.stopPropagation();
            onClose();
          }
          if (event.key === "Tab") {
            const items = [
              ...panel.current.querySelectorAll(
                "button,input,textarea,select,a[href]",
              ),
            ].filter((el) => !el.disabled);
            if (event.shiftKey && document.activeElement === items[0]) {
              event.preventDefault();
              items.at(-1)?.focus();
            }
            if (!event.shiftKey && document.activeElement === items.at(-1)) {
              event.preventDefault();
              items[0]?.focus();
            }
          }
        }}
      >
        <div className="df-section-head">
          <h2>{title}</h2>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label={"关闭" + title}
          >
            ×
          </button>
        </div>
        {error && (
          <p role="alert" className="df-alert error">
            {error}
          </p>
        )}
        {children}
      </section>
    </div>
  );
}

function AttachmentPreview({
  file,
  projectId,
  download,
  onClose,
  embedded = false,
}) {
  const [Preview, setPreview] = useState(null);
  const [blob, setBlob] = useState("");
  const [error, setError] = useState("");
  const extension = file.name.split(".").pop().toLowerCase();
  const simple =
    ["pdf", "png", "jpg", "jpeg"].includes(extension) &&
    !Q.workspace?.loadPreview;
  useEffect(() => {
    let active = true,
      objectUrl;
    if (simple) {
      Q.host
        .fetch(`/document-forms/projects/${projectId}/files/${file.id}`)
        .then(async (response) => {
          if (!response.ok) throw new Error("预览未能打开，请下载查看");
          const content = await response.blob();
          if (active) {
            objectUrl = URL.createObjectURL(
              new Blob([content], { type: file.mime }),
            );
            setBlob(objectUrl);
          }
        })
        .catch((e) => active && setError(e.message));
    } else if (
      Q.workspace?.loadPreview ||
      ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)
    ) {
      (Q.workspace?.loadPreview
        ? Q.workspace.loadPreview()
        : Promise.resolve(OfficeServicePreview)
      )
        .then((component) => active && setPreview(() => component))
        .catch(() => active && setPreview(() => OfficeServicePreview));
    } else setError("此格式请下载后查看。");
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.id]);
  const artifact = {
    id: file.id,
    title: file.name,
    source: "uploaded",
    extension,
    mimeType: file.mime,
    binaryUrl: file.preview_url,
    agentId: Q.host.getSelectedAgentId?.(),
    createdAt: Date.parse(file.uploaded_at),
  };
  const Wrapper = embedded ? "section" : Dialog;
  return (
    <Wrapper
      {...(embedded
        ? { className: "df-dock-preview", "aria-label": "文件预览" }
        : { title: file.name, onClose })}
    >
      {embedded && <h3>{file.name}</h3>}
      <div className="df-attachment-preview">
        {error ? (
          <p role="alert">{error}</p>
        ) : simple && blob ? (
          extension === "pdf" ? (
            <iframe title={file.name} src={blob} sandbox="allow-same-origin" />
          ) : (
            <img src={blob} alt={file.name} />
          )
        ) : Preview ? (
          <Preview artifact={artifact} readOnly hostControls />
        ) : (
          <p role="status">正在打开预览…</p>
        )}
      </div>
      <div className="df-actions">
        <button
          onClick={() =>
            download(`/projects/${projectId}/files/${file.id}`, file.name)
          }
        >
          下载原文件
        </button>
        <button onClick={onClose}>关闭预览</button>
      </div>
    </Wrapper>
  );
}

function localDay() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")}`;
}
function deadline(stage, today) {
  if (stage.status === "completed")
    return {
      kind: "done",
      text: stage.due_date ? `计划日期 ${stage.due_date} · 已办结` : "已办结",
    };
  if (!stage.due_date) return { kind: "unset", text: "未设置计划日期" };
  const days = Math.round(
    (Date.parse(stage.due_date) - Date.parse(today)) / 86400000,
  );
  if (!Number.isFinite(days)) return { kind: "unset", text: "请检查计划日期" };
  return {
    kind: days < 0 ? "overdue" : days <= 3 ? "soon" : "scheduled",
    text: `${stage.due_date} · ${
      days < 0
        ? `已逾期 ${-days} 天`
        : days === 0
        ? "今天到期"
        : days <= 3
        ? `${days} 天后到期`
        : `剩余 ${days} 天`
    }`,
  };
}

export default function ProjectWorkspace({ Editor, services }) {
  const { request, json, download, Field } = services;
  const [today, setToday] = useState(localDay);
  useEffect(() => {
    const refreshDay = () => setToday(localDay());
    const timer = setInterval(refreshDay, 60000);
    window.addEventListener("focus", refreshDay);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refreshDay);
    };
  }, []);
  const [projects, setProjects] = useState([]),
    [project, setProject] = useState(null);
  const [tab, setTab] = useState("overview"),
    [query, setQuery] = useState("");
  const [editor, setEditor] = useState(null),
    [editorDirty, setEditorDirty] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);
  const [editorBusy, setEditorBusy] = useState("");
  const [editRequest, setEditRequest] = useState(0);
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState(null),
    [form, setForm] = useState({});
  const [approvalKeys, setApprovalKeys] = useState([]);
  const [preview, setPreview] = useState(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false),
    [rightCollapsed, setRightCollapsed] = useState(false);
  const [rightWidth, setRightWidth] = useState(() => {
    try {
      const saved = Number(
        window.localStorage.getItem("ugsci.document-forms.right-width"),
      );
      return Number.isFinite(saved) && saved >= 300 && saved <= 3000
        ? saved
        : 500;
    } catch {
      return 500;
    }
  });
  const [rightMax, setRightMax] = useState(1200);
  const layout = useRef(null);
  useEffect(() => {
    const element = layout.current;
    if (!element || !project?.single_form) return;
    const measure = () => {
      const width = element.getBoundingClientRect().width;
      if (width <= 850) return;
      const left = element
        .querySelector(".df-project-sidebar")
        .getBoundingClientRect().width;
      const maximum = Math.max(
        300,
        Math.floor(width - left - (window.innerWidth <= 1050 ? 380 : 440)),
      );
      setRightMax(maximum);
      setRightWidth((value) => Math.min(maximum, Math.max(300, value)));
    };
    measure();
    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [leftCollapsed, project?.single_form]);
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "ugsci.document-forms.right-width",
        String(rightWidth),
      );
    } catch {
      /* Storage can be unavailable in private windows. */
    }
  }, [rightWidth]);
  const resizeRight = (width) =>
    setRightWidth(Math.min(rightMax, Math.max(300, Math.round(width))));
  const [selection, setSelection] = useState(null),
    [dockMode, setDockMode] = useState("assistant");
  const alive = useRef(true),
    serial = useRef(0),
    excel = useRef(null),
    attachment = useRef(null),
    uploadTarget = useRef("");
  const mainScroll = useRef(null);
  const activeProject = useRef(null);
  activeProject.current = project?.id;
  useEffect(() => {
    mainScroll.current?.scrollTo?.({ top: 0 });
  }, [project?.id, tab, editor?.id]);
  const theme = Q.host.useTheme?.() || "light";
  const stage = project?.stages.find((s) => s.id === tab);
  const forms = project?.forms.filter((f) => f.stage_id === tab) || [];
  const planApprovals =
    project?.stages
      .find((item) => item.id === "plan")
      ?.materials.flatMap((material) => material.files)
      .filter((file) => file.approval_review) || [];
  const latestApproval = planApprovals.at(-1);
  const planApprovalMaterial = project?.stages
    .find((item) => item.id === "plan")
    ?.materials.find((material) => /批复|审批|回执/.test(material.name));
  const canLeave = () =>
    (!editorDirty && !profileDirty) ||
    window.confirm("资料有未保存的修改，是否放弃这些修改并离开？");
  async function list() {
    const result = await request("/projects");
    if (alive.current) setProjects(result);
    return result;
  }
  async function reload(id = project?.id, navigation = false) {
    const result = id ? await request("/projects/" + id) : null;
    if (
      alive.current &&
      result &&
      (navigation || !activeProject.current || activeProject.current === id)
    ) {
      if (activeProject.current !== result.id) {
        setPreview(null);
        setSelection(null);
        setDockMode("assistant");
      }
      activeProject.current = result.id;
      setProject((current) =>
        current?.id === result.id && current.revision > result.revision
          ? current
          : result,
      );
    }
    await list();
    return result;
  }
  useEffect(() => {
    alive.current = true;
    setBusy("载入项目");
    list()
      .then(async (items) => {
        if (items.length && alive.current) {
          const p = await request("/projects/" + items[0].id);
          if (alive.current) setProject(p);
        }
      })
      .catch((e) => alive.current && setError(e.message))
      .finally(() => alive.current && setBusy(""));
    return () => {
      alive.current = false;
      serial.current++;
    };
  }, []);
  useEffect(() => {
    const handler = (e) => {
      if (editorDirty || profileDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [editorDirty, profileDirty]);
  async function run(label, action) {
    if (busy) return;
    const token = ++serial.current;
    setBusy(label);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (e) {
      if (alive.current && token === serial.current) setError(e.message);
    } finally {
      if (alive.current && token === serial.current) setBusy("");
    }
  }
  async function selectProject(id) {
    if (!canLeave()) return;
    await run("打开项目", async () => {
      setEditor(null);
      setEditorDirty(false);
      setProfileDirty(false);
      setTab("overview");
      await reload(id, true);
      setEditor(null);
      setEditorDirty(false);
      setProfileDirty(false);
      setPreview(null);
      setSelection(null);
      setDockMode("assistant");
      setTab("overview");
    });
  }
  async function changeTab(id) {
    if (!canLeave()) return;
    setTab(id);
    setEditor(null);
    setEditorDirty(false);
    setProfileDirty(false);
    setNotice("");
    setError("");
    if (project.single_form && project.stages.some((s) => s.id === id)) {
      await run("打开项目表单", async () => {
        const result = await request(
          `/projects/${project.id}/form`,
          json({ revision: project.revision, stage_id: id }),
        );
        await reload();
        setEditor({
          id: result.id,
          view: "edit",
          revision: result.revision,
          initialDraft: result,
        });
      });
    }
  }
  function openDialog(kind, initial) {
    setForm(initial);
    setDialog(kind);
    setError("");
  }
  async function apply(path, body, method = "POST") {
    const result = await request(path, {
      ...json({ ...body, revision: project.revision }),
      method,
    });
    if (alive.current) {
      setProject(result);
      setDialog(null);
    }
    await list();
    return result;
  }
  function createForm(file) {
    return run(file ? "读取阶段 Excel" : "准备谈判表单", async () => {
      let result;
      if (file) {
        const data = new FormData();
        data.append("revision", project.revision);
        data.append("stage_id", tab);
        data.append("workbook", file);
        result = await request(
          `/projects/${project.id}/${
            project.single_form ? "form" : "cases"
          }/import`,
          {
            method: "POST",
            body: data,
          },
        );
      } else
        result = await request(
          `/projects/${project.id}/${project.single_form ? "form" : "cases"}`,
          json({ revision: project.revision, stage_id: tab }),
        );
      await reload();
      setEditor({
        id: result.id,
        view: "edit",
        revision: result.revision,
        initialDraft: project.single_form ? result : undefined,
      });
      setEditorDirty(false);
      if (file)
        setNotice(
          result.templates.length
            ? "已读取变量配置，并载入默认 Word 模板。"
            : "已读取本阶段变量配置，请添加对应的 Word 模板。",
        );
    });
  }
  function uploadAttachment(file) {
    if (!file) return;
    const materialId = uploadTarget.current;
    return run("保存材料", async () => {
      const data = new FormData();
      data.append("revision", project.revision);
      data.append("file", file);
      const result = await request(
        `/projects/${project.id}/stages/${tab}/materials/${materialId}/files`,
        { method: "POST", body: data },
      );
      setProject(result);
      await list();
      const uploaded = result.stages
        .find((item) => item.id === tab)
        ?.materials.flatMap((material) => material.files)
        .find((item) => item.name === file.name);
      setNotice(
        uploaded?.approval_review?.status === "ready"
          ? `审批文件已保存，并识别出 ${uploaded.approval_review.fields.length} 项审批结果。`
          : "材料已保存，原有版本继续保留。请核对后更新材料状态。",
      );
    });
  }
  const base = project ? `/projects/${project.id}` : "";
  const saveMaterial = (e) => {
    e.preventDefault();
    run("保存材料信息", () =>
      apply(
        `${base}/stages/${tab}/materials${form.id ? "/" + form.id : ""}`,
        form,
        form.id ? "PUT" : "POST",
      ),
    );
  };
  const bundledDownload = (stageId) =>
    run("整理下载包", () =>
      download(
        base + "/bundle" + (stageId ? "?stage_id=" + stageId : ""),
        `${project.name}_${stageId ? stage.title : "全流程材料"}.zip`,
      ),
    );
  return (
    <main
      ref={layout}
      style={{ "--df-dock-size": rightWidth + "px" }}
      className={
        "df-app df-project-app" +
        (project?.single_form ? " df-three-column" : "") +
        (leftCollapsed ? " df-left-collapsed" : "") +
        (rightCollapsed ? " df-right-collapsed" : "")
      }
      data-theme={theme}
    >
      <style>{CSS}</style>
      <input
        ref={excel}
        type="file"
        accept=".xlsx"
        hidden
        aria-label="导入阶段 Excel"
        onChange={(e) => {
          const file = e.target.files[0];
          e.target.value = "";
          if (file) createForm(file);
        }}
      />
      <input
        ref={attachment}
        type="file"
        accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv"
        hidden
        aria-label="上传阶段材料"
        onChange={(e) => {
          const file = e.target.files[0];
          e.target.value = "";
          uploadAttachment(file);
        }}
      />
      <aside
        className={
          "df-sidebar df-project-sidebar" +
          (leftCollapsed ? " df-pane-collapsed" : "")
        }
        aria-label="项目选择"
      >
        <button
          className="df-pane-toggle"
          aria-label={leftCollapsed ? "展开项目栏" : "收起项目栏"}
          aria-expanded={!leftCollapsed}
          title={leftCollapsed ? "展开项目栏" : "收起项目栏"}
          onClick={() => setLeftCollapsed((value) => !value)}
        >
          <span aria-hidden="true">{leftCollapsed ? "›" : "‹"}</span>
          <span>{leftCollapsed ? "项目" : "收起"}</span>
        </button>
        <div className="df-brand">外协助手</div>
        <button
          className="df-primary df-new"
          disabled={!!busy || !!editorBusy}
          onClick={() => {
            if (canLeave())
              openDialog("create", { name: "", code: "", owner: "" });
          }}
        >
          ＋ 新建项目
        </button>
        <label className="df-project-search">
          <span className="df-sr-only">搜索项目</span>
          <input
            aria-label="搜索项目"
            placeholder="搜索项目名称或编号"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="df-caption">
          我的项目 <span>{projects.length}</span>
        </div>
        <nav aria-label="项目列表">
          {projects
            .filter((p) =>
              (p.name + " " + p.code)
                .toLowerCase()
                .includes(query.trim().toLowerCase()),
            )
            .map((p) => (
              <button
                key={p.id}
                disabled={!!busy || !!editorBusy}
                aria-current={project?.id === p.id ? "page" : undefined}
                onClick={() => selectProject(p.id)}
              >
                <b>{p.name}</b>
                <small>
                  {p.code || "未设编号"} · {p.completed}/7 阶段完成
                </small>
              </button>
            ))}
        </nav>
        {query.trim() &&
          !projects.some((p) =>
            (p.name + " " + p.code)
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
          ) && (
            <div className="df-search-empty" role="status">
              <p>未找到项目</p>
              <button onClick={() => setQuery("")}>清除搜索</button>
            </div>
          )}
        <div className="df-sidebar-foot">
          <button
            disabled={!!busy || !!editorBusy}
            onClick={() =>
              run("下载配套模板", () =>
                download("/starter", "文书填报_配套模板.zip"),
              )
            }
          >
            下载配套模板 ↗
          </button>
        </div>
      </aside>
      <section className="df-main df-project-main" ref={mainScroll}>
        <header className="df-header">
          <div>
            <h1>{project?.name || "项目工作台"}</h1>
            <p>
              {project
                ? [
                    project.code || "未设项目编号",
                    project.owner && "经办人：" + project.owner,
                  ]
                    .filter(Boolean)
                    .join("　·　")
                : "管理外协项目、阶段材料与办理进度。"}
            </p>
          </div>
          {project && (
            <div className="df-actions">
              <button
                disabled={!!busy || !!editorBusy}
                onClick={() => changeTab("profile")}
              >
                基础信息填报
              </button>
              <button
                disabled={!!busy || !!editorBusy}
                onClick={() => bundledDownload()}
              >
                下载项目材料
              </button>
            </div>
          )}
        </header>
        {error && (
          <div role="alert" className="df-alert error">
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
        {!project ? (
          <section className="df-paper df-project-welcome">
            <h2>先建一个项目</h2>
            <p>填写基础信息后，选择阶段办理。</p>
            <div className="df-welcome-stages">
              {labels.map((label, i) => (
                <span key={label}>
                  <small>{String(i + 1).padStart(2, "0")}</small>
                  {label}
                </span>
              ))}
            </div>
            <button
              className="df-primary"
              onClick={() =>
                openDialog("create", { name: "", code: "", owner: "" })
              }
            >
              建立第一个项目
            </button>
          </section>
        ) : (
          <>
            <nav className="df-project-tabs" aria-label="项目阶段">
              <button
                className={tab === "overview" ? "active" : ""}
                disabled={!!busy || !!editorBusy}
                onClick={() => changeTab("overview")}
              >
                项目总览
              </button>
              {project.stages.map((s, i) => (
                <button
                  key={s.id}
                  aria-current={tab === s.id ? "step" : undefined}
                  className={tab === s.id ? "active" : ""}
                  disabled={!!busy || !!editorBusy}
                  onClick={() => changeTab(s.id)}
                >
                  <small>{String(i + 1).padStart(2, "0")}</small> {s.title}
                  <span className={"df-state df-state-" + s.status}>
                    {s.upstream_changed.length || s.documents_changed
                      ? "待复核"
                      : STATUS[s.status]}
                  </span>
                </button>
              ))}
            </nav>
            <fieldset className="df-content" disabled={!!busy || !!editorBusy}>
              {tab === "overview" && (
                <>
                  {project.migrated && (
                    <p className="df-muted df-migration-note">
                      历史填报已按项目名称或编号归入商务谈判阶段，原表单、生成批次和文件均保留。
                    </p>
                  )}
                  <section className="df-project-metrics">
                    <div>
                      <b>
                        {
                          project.stages.filter((s) => s.status === "completed")
                            .length
                        }
                        <small>/ {project.stages.length}</small>
                      </b>
                      <span>已完成阶段</span>
                    </div>
                    <div>
                      <b>
                        {project.stages.reduce(
                          (n, s) =>
                            n +
                            s.materials.filter(
                              (m) => !["done", "na"].includes(m.status),
                            ).length,
                          0,
                        )}
                      </b>
                      <span>待整理材料</span>
                    </div>
                    <div>
                      <b>{project.forms.reduce((n, f) => n + f.outputs, 0)}</b>
                      <span>已生成文件</span>
                    </div>
                    <div>
                      <b>
                        {
                          project.stages.filter(
                            (s) =>
                              s.upstream_changed.length || s.documents_changed,
                          ).length
                        }
                      </b>
                      <span>待复核阶段</span>
                    </div>
                  </section>
                  <div className="df-project-stage-grid">
                    {project.stages.map((s, i) => (
                      <button
                        className="df-paper df-stage-card"
                        key={s.id}
                        onClick={() => changeTab(s.id)}
                      >
                        <div className="df-section-head">
                          <small>阶段 {String(i + 1).padStart(2, "0")}</small>
                          <span className={"df-state df-state-" + s.status}>
                            {s.upstream_changed.length || s.documents_changed
                              ? "待复核"
                              : STATUS[s.status]}
                          </span>
                        </div>
                        <h2>{s.title}</h2>
                        <p>{s.purpose}</p>
                        <span
                          className={"df-deadline " + deadline(s, today).kind}
                        >
                          {deadline(s, today).text}
                        </span>
                        <footer>
                          <span>
                            {
                              s.materials.filter((m) =>
                                ["done", "na"].includes(m.status),
                              ).length
                            }
                            /{s.materials.length} 项材料已处理
                          </span>
                          <span>
                            {s.upstream_changed.length || s.documents_changed
                              ? "有变更待复核"
                              : s.due_date
                              ? "计划 " + s.due_date
                              : "进入阶段 →"}
                          </span>
                        </footer>
                      </button>
                    ))}
                  </div>
                  <section className="df-paper df-project-hint">
                    <h2>一份项目底稿，贯穿各阶段</h2>
                    <p>
                      项目名称、研究内容、成果指标和预算等可在“基础信息填报”统一维护。阶段表单从底稿取值，后续变更会提醒核对；已有生成文件保留原样。
                    </p>
                    <button onClick={() => changeTab("profile")}>
                      填写基础信息
                    </button>
                  </section>
                </>
              )}
              {tab === "profile" && (
                <ProjectProfile
                  onDirtyChange={setProfileDirty}
                  key={project.id + ":" + project.revision}
                  project={project}
                  Field={Field}
                  onSave={(data) =>
                    run("保存基础信息", async () => {
                      await apply(base, data, "PUT");
                      setNotice(
                        "基础信息已更新。已有表单可逐项核对后同步，原生成文件不变。",
                      );
                    })
                  }
                />
              )}
              {stage && (
                <>
                  <section className="df-paper df-stage-header">
                    <div>
                      <h2>{stage.title}</h2>
                      <div className="df-node-status" aria-label="节点办理概况">
                        <span className={"df-state df-state-" + stage.status}>
                          {STATUS[stage.status]}
                        </span>
                        <span
                          className={
                            "df-deadline " + deadline(stage, today).kind
                          }
                        >
                          {deadline(stage, today).text}
                        </span>
                        <span>
                          审批资料{" "}
                          {stage.materials.filter((m) => m.files.length).length}
                          /{stage.materials.length}
                        </span>
                      </div>
                      {!project.single_form && (
                        <details className="df-stage-help">
                          <summary>本阶段办理说明</summary>
                          <p>
                            {project.single_form && stage.id === "plan"
                              ? "已接入科研计划填报表与外协必要性说明，可直接填写并生成。"
                              : stage.id === "selection"
                              ? "已接入论证意见及签字表与非招标方案填报表，可先准备论证材料，论证结束后核对系统填报信息。"
                              : stage.id === "negotiation"
                              ? "五份标准模板已接入，可直接填写，也可导入现有 Excel。"
                              : "统一模板待补充，可上传阶段材料，或导入 Excel 与 Word 模板。"}
                          </p>
                        </details>
                      )}
                    </div>
                    <div className="df-actions">
                      {editor && (
                        <button
                          onClick={() => {
                            setEditRequest((value) => value + 1);
                            document
                              .getElementById("df-node-form")
                              ?.scrollIntoView?.({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                        >
                          填写内容
                        </button>
                      )}
                      <button
                        onClick={() =>
                          document
                            .getElementById("df-node-materials")
                            ?.scrollIntoView?.({
                              behavior: "smooth",
                              block: "start",
                            })
                        }
                      >
                        审批资料
                      </button>
                      <button onClick={() => bundledDownload(stage.id)}>
                        下载本阶段材料
                      </button>
                      <button
                        disabled={editorDirty}
                        title={
                          editorDirty
                            ? "请先保存填写内容，再更新办理状态"
                            : undefined
                        }
                        onClick={() =>
                          openDialog("stage", { ...stage, confirmed: false })
                        }
                      >
                        办理信息与状态
                      </button>
                    </div>
                  </section>
                  {(stage.upstream_changed.length > 0 ||
                    stage.documents_changed) && (
                    <div className="df-alert df-stage-warning">
                      <div>
                        <b>本阶段有资料需要复核</b>
                        <p>
                          {stage.upstream_changed.length > 0 &&
                            "前序阶段已更新：" +
                              stage.upstream_changed.join("、") +
                              "。"}
                          {stage.documents_changed &&
                            "本阶段表单或生成文件有更新。"}
                          请核对已提交的材料是否需要调整。
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          run("记录复核", () =>
                            apply(`${base}/stages/${stage.id}/acknowledge`, {}),
                          )
                        }
                      >
                        已核对变更
                      </button>
                    </div>
                  )}
                  {(stage.system_name ||
                    stage.submission_ref ||
                    stage.notes) && (
                    <section className="df-paper df-stage-details">
                      <dl>
                        <div>
                          <dt>办理系统</dt>
                          <dd>
                            {stage.system_url ? (
                              <a
                                href={stage.system_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {stage.system_name || "打开办理系统"} ↗
                              </a>
                            ) : (
                              stage.system_name || "未记录"
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>提交编号 / 回执</dt>
                          <dd>{stage.submission_ref || "未记录"}</dd>
                        </div>
                      </dl>
                      {stage.notes && <p>{stage.notes}</p>}
                    </section>
                  )}
                  <div id="df-node-form">
                    {editor && (
                      <Editor
                        key={
                          project.id +
                          ":" +
                          editor.id +
                          ":" +
                          tab +
                          ":" +
                          (editor.revision || "")
                        }
                        project={project}
                        workflowStage={stage}
                        initialCaseId={editor.id}
                        initialView={editor.view}
                        editRequest={editRequest}
                        initialDraft={editor.initialDraft}
                        onDirtyChange={setEditorDirty}
                        onBusyChange={setEditorBusy}
                        onViewChange={() =>
                          document
                            .getElementById("df-node-form")
                            ?.scrollIntoView?.({ block: "start" })
                        }
                        onBack={() => {
                          setEditor(null);
                          setEditorDirty(false);
                          reload().catch((e) => setError(e.message));
                        }}
                        onChanged={() => reload()}
                        docked={project.single_form}
                        onEditBasics={() => {
                          setEditor(null);
                          setEditorDirty(false);
                          setEditorBusy("");
                          setTab("profile");
                        }}
                        onStageStatus={() =>
                          openDialog("stage", { ...stage, confirmed: false })
                        }
                        onPreview={(item) => {
                          setSelection(item);
                          setPreview(null);
                          setDockMode("preview");
                        }}
                      />
                    )}
                  </div>
                  {!editor && (
                    <section className="df-paper df-stage-forms">
                      <div className="df-section-head">
                        <div>
                          <h2>
                            {project.single_form ? "项目表单" : "填写与生成"}
                          </h2>
                          <p className="df-muted">
                            表单沿用项目底稿，核对后生成。已有批次保留生成时的内容。
                          </p>
                        </div>
                        <div className="df-actions">
                          {(stage.id === "negotiation" ||
                            project.single_form) && (
                            <button
                              className="df-primary"
                              onClick={() => createForm()}
                            >
                              {project.single_form
                                ? "打开项目表单"
                                : "填写谈判材料"}
                            </button>
                          )}
                          <button onClick={() => excel.current.click()}>
                            导入 Excel 表单
                          </button>
                        </div>
                      </div>
                      {project.single_form ? (
                        <p className="df-muted">
                          每个项目共用一份表单，七个阶段各办理一次。已有文书与历史底稿可在右侧查看。
                        </p>
                      ) : forms.length ? (
                        <div className="df-project-forms">
                          {forms.map((f) => (
                            <div key={f.case_id}>
                              <div>
                                <b>{f.name}</b>
                                <small>
                                  {stamp(f.updated_at)} ·{" "}
                                  {f.outputs ? f.outputs + " 份文件" : "填写中"}
                                  {f.shared_changes.length > 0 &&
                                    " · 基础信息有更新"}
                                </small>
                              </div>
                              <div className="df-actions">
                                <button
                                  onClick={() =>
                                    setEditor({ id: f.case_id, view: "edit" })
                                  }
                                >
                                  打开表单
                                </button>
                                {f.outputs > 0 && (
                                  <button
                                    onClick={() =>
                                      setEditor({
                                        id: f.case_id,
                                        view: "files",
                                      })
                                    }
                                  >
                                    查看生成文件
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="df-empty">
                          本阶段还没有表单。已有成品文件可直接上传到下面的材料清单。
                        </p>
                      )}
                    </section>
                  )}
                  {stage.id === "negotiation" && (
                    <section className="df-paper df-review-entry">
                      <div>
                        <h2>响应文件核查</h2>
                        <p className="df-muted">
                          对照正式谈判文件，检查各单位响应材料，汇总问题、依据和待确认事项。
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          project.single_form
                            ? setDockMode("review")
                            : openDialog("response-review", {})
                        }
                      >
                        打开核查智能体 →
                      </button>
                    </section>
                  )}
                  {stage.id === "plan" && (
                    <section className="df-paper df-approval-entry">
                      <div className="df-section-head">
                        <div>
                          <h2>计划审批结果核对</h2>
                          <p className="df-muted">
                            上传正式审批 PDF
                            后，按明确字段与当前资料比对。更正前会逐项确认。
                          </p>
                        </div>
                        <div className="df-actions">
                          {latestApproval?.approval_review?.status ===
                            "ready" && (
                            <button
                              onClick={() => {
                                const changed =
                                  latestApproval.approval_review.fields
                                    .filter((item) => item.changed)
                                    .map((item) => item.key);
                                setApprovalKeys(changed);
                                setDialog("approval");
                              }}
                            >
                              查看比对结果 →
                            </button>
                          )}
                          <button
                            disabled={!planApprovalMaterial}
                            onClick={() => {
                              uploadTarget.current = planApprovalMaterial.id;
                              attachment.current.click();
                            }}
                          >
                            上传审批文件
                          </button>
                        </div>
                      </div>
                      {!latestApproval ? (
                        <p>请在下方“计划批复或系统回执”中上传审批文件。</p>
                      ) : latestApproval.approval_review.status === "ready" ? (
                        <p>
                          批复日期 {latestApproval.approval_review.approved_at}{" "}
                          · 已识别{" "}
                          {latestApproval.approval_review.fields.length} 项 ·
                          {latestApproval.approval_review.change_count
                            ? `发现 ${latestApproval.approval_review.change_count} 项差异`
                            : "与当前资料一致"}
                        </p>
                      ) : (
                        <p role="status">
                          {latestApproval.approval_review.message}
                        </p>
                      )}
                    </section>
                  )}
                  <section
                    className="df-paper df-material-panel"
                    id="df-node-materials"
                  >
                    <div className="df-section-head">
                      <div>
                        <h2>
                          {project.single_form ? "审批资料与附件" : "材料清单"}{" "}
                          <small>{stage.materials.length}</small>
                        </h2>
                        <p className="df-muted">
                          上传审批件、签章件和回执；文件仅归档，不自动修改表单。
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          openDialog("material", {
                            name: "",
                            status: "pending",
                            required: false,
                            note: "",
                          })
                        }
                      >
                        ＋ 添加材料
                      </button>
                    </div>
                    <div className="df-materials">
                      {stage.materials.map((m) => {
                        const generated = forms.reduce(
                          (n, f) =>
                            n +
                            (f.generations[0]?.files.filter((file) =>
                              file.name.includes(m.name),
                            ).length || 0),
                          0,
                        );
                        return (
                          <article className="df-material-row" key={m.id}>
                            <div className="df-material-name">
                              <b>{m.name}</b>
                              {m.required && (
                                <span className="df-required-tag">必备</span>
                              )}
                              <span
                                className={
                                  "df-state df-material-state-" + m.status
                                }
                              >
                                {MATERIAL[m.status]}
                              </span>
                              {generated > 0 && (
                                <small>
                                  已有 {generated} 份生成稿 · 在上方表单查看
                                </small>
                              )}
                              {m.note && <p>{m.note}</p>}
                            </div>
                            <div className="df-material-files">
                              {m.files.length > 0 ? (
                                <details>
                                  <summary>
                                    {m.files.length} 份文件 / 版本 · 最新：
                                    {m.files[m.files.length - 1].name}
                                  </summary>
                                  {[...m.files].reverse().map((file, index) => (
                                    <div
                                      className="df-material-file"
                                      key={file.id}
                                    >
                                      <div>
                                        <b>
                                          V{m.files.length - index} ·{" "}
                                          {file.name}
                                        </b>
                                        <small>
                                          {stamp(file.uploaded_at)} ·{" "}
                                          {Math.max(
                                            1,
                                            Math.round(file.size / 1024),
                                          )}{" "}
                                          KB
                                        </small>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setPreview(file);
                                          setSelection({
                                            artifact: { title: file.name },
                                            reference: { file_id: file.id },
                                          });
                                          setDockMode("preview");
                                        }}
                                      >
                                        预览
                                      </button>
                                      <button
                                        aria-label={
                                          "下载" +
                                          file.name +
                                          "版本" +
                                          (m.files.length - index)
                                        }
                                        onClick={() =>
                                          run("下载材料", () =>
                                            download(
                                              `${base}/files/${file.id}`,
                                              file.name,
                                            ),
                                          )
                                        }
                                      >
                                        下载
                                      </button>
                                    </div>
                                  ))}
                                </details>
                              ) : (
                                <span className="df-muted">尚未上传文件</span>
                              )}
                            </div>
                            <div className="df-actions">
                              <button
                                aria-label={"上传" + m.name}
                                onClick={() => {
                                  uploadTarget.current = m.id;
                                  attachment.current.click();
                                }}
                              >
                                上传文件
                              </button>
                              <button
                                aria-label={"编辑" + m.name}
                                onClick={() => openDialog("material", { ...m })}
                              >
                                编辑
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                  {!project.single_form && (
                    <div className="df-stage-tail">
                      <p>
                        各阶段可并行准备；前序资料变化后，后续阶段会提示复核。阶段完成由经办人确认。
                      </p>
                      <button
                        onClick={() =>
                          openDialog("stage", { ...stage, confirmed: false })
                        }
                      >
                        更新办理状态
                      </button>
                    </div>
                  )}
                </>
              )}
            </fieldset>
          </>
        )}
      </section>
      {project?.single_form && (
        <RightWorkspace
          key={project.id}
          collapsed={rightCollapsed}
          width={rightWidth}
          maxWidth={rightMax}
          onResize={resizeRight}
          onToggle={() => setRightCollapsed((value) => !value)}
          project={project}
          stageId={tab}
          services={services}
          mode={dockMode}
          onMode={setDockMode}
          selection={selection}
          attachment={preview}
          AttachmentPreview={AttachmentPreview}
          dirty={editorDirty}
          onSelect={(item) => {
            setSelection(item);
            setPreview(null);
            setDockMode("preview");
          }}
          onChanged={() => reload().catch((e) => setError(e.message))}
        />
      )}
      {dialog === "response-review" && (
        <Dialog
          title="响应文件核查"
          onClose={() => {
            setDialog(null);
            reload().catch((e) => setError(e.message));
          }}
        >
          <ResponseReview
            project={project}
            services={services}
            onChanged={() => reload().catch((e) => setError(e.message))}
          />
        </Dialog>
      )}
      {dialog === "approval" && latestApproval && (
        <Dialog
          title="核对计划审批结果"
          busy={!!busy}
          error={error}
          onClose={() => setDialog(null)}
        >
          <p className="df-muted">
            来源：{latestApproval.name} · 批复日期{" "}
            {latestApproval.approval_review.approved_at}
            。仅勾选的差异会写回项目资料和上报计划表单。
          </p>
          <div className="df-compare df-approval-compare">
            {latestApproval.approval_review.fields.map((item) => (
              <label key={item.key}>
                <input
                  type="checkbox"
                  aria-label={"采用审批结果：" + item.label}
                  disabled={!item.changed}
                  checked={approvalKeys.includes(item.key)}
                  onChange={(e) =>
                    setApprovalKeys(
                      e.target.checked
                        ? [...approvalKeys, item.key]
                        : approvalKeys.filter((key) => key !== item.key),
                    )
                  }
                />
                <div>
                  <b>
                    {item.label}
                    {!item.changed && <small> 一致</small>}
                  </b>
                  <div className="df-compare-values">
                    <p>
                      <small>当前资料</small>
                      {item.current || "空白"}
                    </p>
                    <p>
                      <small>审批结果</small>
                      {item.value || "空白"}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {editorDirty && (
            <p role="status">请先保存填写内容，再采用审批结果。</p>
          )}
          <div className="df-actions">
            <button disabled={!!busy} onClick={() => setDialog(null)}>
              取消
            </button>
            <button
              className="df-primary"
              disabled={
                !!busy || !!editorBusy || editorDirty || !approvalKeys.length
              }
              onClick={() =>
                run("采用审批结果", async () => {
                  const result = await request(
                    `${base}/stages/plan/approval/apply`,
                    json({
                      revision: project.revision,
                      file_id: latestApproval.id,
                      keys: approvalKeys,
                    }),
                  );
                  setProject(result);
                  if (editor) {
                    const updated = await request(`/cases/${editor.id}`);
                    setEditor({
                      ...editor,
                      initialDraft: updated,
                      revision: updated.revision,
                    });
                  }
                  setDialog(null);
                  setApprovalKeys([]);
                  await list();
                  setNotice(
                    "已采用所选审批结果。后续阶段会提示重新核对受影响资料。",
                  );
                })
              }
            >
              采用所选 {approvalKeys.length} 项
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "create" && (
        <Dialog
          title="新建项目"
          busy={!!busy}
          error={error}
          onClose={() => setDialog(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run("建立项目", async () => {
                const p = await request("/projects", json(form));
                setPreview(null);
                setSelection(null);
                setDockMode("assistant");
                setProject(p);
                setTab("overview");
                setEditor(null);
                setEditorDirty(false);
                setDialog(null);
                await list();
              });
            }}
          >
            <label className="df-field">
              <span>项目名称</span>
              <input
                aria-label="新项目名称"
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <div className="df-fields">
              <label className="df-field">
                <span>项目编号</span>
                <input
                  aria-label="新项目编号"
                  maxLength={100}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </label>
              <label className="df-field">
                <span>经办人</span>
                <input
                  aria-label="新项目经办人"
                  maxLength={100}
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                />
              </label>
            </div>
            <p className="df-muted">
              建立项目后，可整理共用资料，再按七个阶段准备材料。
            </p>
            <div className="df-actions">
              <button
                type="button"
                disabled={!!busy || !!editorBusy}
                onClick={() => setDialog(null)}
              >
                取消
              </button>
              <button
                className="df-primary"
                disabled={!!busy || !form.name?.trim()}
                type="submit"
              >
                建立项目
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {dialog === "material" && (
        <Dialog
          title="材料信息"
          busy={!!busy}
          error={error}
          onClose={() => setDialog(null)}
        >
          <form onSubmit={saveMaterial}>
            <label className="df-field">
              <span>材料名称</span>
              <input
                aria-label="材料名称"
                required
                maxLength={150}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="df-field">
              <span>材料状态</span>
              <select
                aria-label="材料状态"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {Object.entries(MATERIAL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="df-checkbox">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) =>
                  setForm({ ...form, required: e.target.checked })
                }
              />
              本项目的必备材料，阶段完成前需确认已完成或不适用
            </label>
            <label className="df-field">
              <span>材料说明</span>
              <textarea
                aria-label="材料说明"
                rows={3}
                maxLength={3000}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </label>
            <div className="df-actions">
              <button
                type="button"
                onClick={() => setDialog(null)}
                disabled={!!busy || !!editorBusy}
              >
                取消
              </button>
              <button
                className="df-primary"
                disabled={!!busy || !!editorBusy}
                type="submit"
              >
                保存材料信息
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {dialog === "stage" && (
        <Dialog
          title={stage.title + "办理信息"}
          busy={!!busy}
          error={error}
          onClose={() => setDialog(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run("保存办理信息", () =>
                apply(`${base}/stages/${tab}`, form, "PUT"),
              );
            }}
          >
            <div className="df-fields">
              <label className="df-field">
                <span>阶段状态</span>
                <select
                  aria-label="阶段状态"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {Object.entries(STATUS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="df-field">
                <span>计划日期</span>
                <input
                  aria-label="阶段计划日期"
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm({ ...form, due_date: e.target.value })
                  }
                />
              </label>
              <label className="df-field">
                <span>办理系统</span>
                <input
                  aria-label="办理系统"
                  maxLength={150}
                  value={form.system_name}
                  onChange={(e) =>
                    setForm({ ...form, system_name: e.target.value })
                  }
                />
              </label>
              <label className="df-field">
                <span>系统地址</span>
                <input
                  aria-label="系统地址"
                  type="url"
                  placeholder="https://"
                  maxLength={1000}
                  value={form.system_url}
                  onChange={(e) =>
                    setForm({ ...form, system_url: e.target.value })
                  }
                />
              </label>
            </div>
            <label className="df-field">
              <span>提交编号 / 回执信息</span>
              <input
                aria-label="提交编号"
                maxLength={500}
                value={form.submission_ref}
                onChange={(e) =>
                  setForm({ ...form, submission_ref: e.target.value })
                }
              />
            </label>
            <label className="df-field">
              <span>办理说明</span>
              <textarea
                aria-label="办理说明"
                rows={4}
                maxLength={5000}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            <p className="df-muted">
              记录线下或业务系统的实际办理结果，回执文件可上传到材料清单。
            </p>
            {form.status === "completed" && (
              <>
                <p className="df-muted">
                  {stage.missing_required.length > 0
                    ? "尚未办结的必备材料：" + stage.missing_required.join("、")
                    : "请确认阶段材料和前序变更已核对。"}
                </p>
                <label className="df-checkbox">
                  <input
                    aria-label="确认本阶段已办结"
                    type="checkbox"
                    checked={form.confirmed}
                    onChange={(e) =>
                      setForm({ ...form, confirmed: e.target.checked })
                    }
                  />
                  已核对本阶段材料及前序变更，确认本阶段已办结
                </label>
              </>
            )}
            <div className="df-actions">
              <button
                type="button"
                onClick={() => setDialog(null)}
                disabled={!!busy || !!editorBusy}
              >
                取消
              </button>
              <button
                className="df-primary"
                disabled={
                  !!busy || (form.status === "completed" && !form.confirmed)
                }
                type="submit"
              >
                保存办理信息
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {preview && !project.single_form && (
        <AttachmentPreview
          key={preview.id}
          file={preview}
          projectId={project.id}
          download={(path, name) =>
            run("下载原文件", () => download(path, name))
          }
          onClose={() => setPreview(null)}
        />
      )}
    </main>
  );
}

function ProjectProfile({ project, Field, onSave, onDirtyChange }) {
  const [fields, setFields] = useState(project.fields);
  const [info, setInfo] = useState({
    name: project.name,
    code: project.code,
    owner: project.owner,
  });
  useEffect(() => {
    onDirtyChange(
      JSON.stringify(fields) !== JSON.stringify(project.fields) ||
        info.name !== project.name ||
        info.code !== project.code ||
        info.owner !== project.owner,
    );
  }, [fields, info]);
  return (
    <form
      className="df-paper df-project-profile"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...info,
          values: Object.fromEntries(fields.map((f) => [f.key, f.value])),
        });
      }}
    >
      <div className="df-section-head">
        <div>
          <h2>基础信息填报</h2>
          <p className="df-muted">
            各阶段表单复用这里的资料；阶段日期、评审分数和付款结果分别记录。
          </p>
        </div>
        <button className="df-primary" type="submit">
          保存基础信息
        </button>
      </div>
      <div className="df-fields">
        <label className="df-field">
          <span>项目名称</span>
          <input
            aria-label="项目名称"
            required
            value={info.name}
            maxLength={120}
            onChange={(e) => setInfo({ ...info, name: e.target.value })}
          />
        </label>
        <label className="df-field">
          <span>项目编号</span>
          <input
            aria-label="项目编号"
            value={info.code}
            maxLength={100}
            onChange={(e) => setInfo({ ...info, code: e.target.value })}
          />
        </label>
        <label className="df-field">
          <span>经办人</span>
          <input
            aria-label="经办人"
            value={info.owner}
            maxLength={100}
            onChange={(e) => setInfo({ ...info, owner: e.target.value })}
          />
        </label>
      </div>
      {[
        ...new Set(
          fields
            .filter((f) => !["project.name", "project.code"].includes(f.key))
            .map((f) => f.group),
        ),
      ].map((group) => (
        <section className="df-group" key={group}>
          <h3>{group}</h3>
          <div className="df-fields">
            {fields
              .filter(
                (f) =>
                  f.group === group &&
                  !["project.name", "project.code"].includes(f.key),
              )
              .map((field) => (
                <Field
                  key={field.key}
                  field={{ ...field, required: false }}
                  onChange={(value) =>
                    setFields(
                      fields.map((f) =>
                        f.key === field.key ? { ...f, value } : f,
                      ),
                    )
                  }
                />
              ))}
          </div>
        </section>
      ))}
      <div className="df-actions">
        <button className="df-primary" type="submit">
          保存基础信息
        </button>
      </div>
    </form>
  );
}
