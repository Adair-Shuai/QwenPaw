import css from "./style.css";

const { host } = window.QwenPaw;
const { React, antd } = host;
const { useState, useEffect, useRef } = React;
const { Button, Input, Select, Modal, Checkbox, Alert, Spin, Empty, Tag } =
  antd;
const { TextArea } = Input;
const today = () => new Date().toLocaleDateString("sv-SE");
const priorityNames = { normal: "普通", high: "重要", urgent: "紧急" };
const statusNames = {
  todo: "待办",
  waiting: "等待反馈",
  done: "已完成",
  cancelled: "已取消",
};
const relationNames = {
  mine: "我负责",
  waiting: "等待反馈",
  unclear: "归属待确认",
  others: "他人负责",
};
const emptyTask = () => ({
  title: "",
  kind: "科研",
  project: "",
  assignee: "",
  due_date: null,
  planned_date: today(),
  start: "",
  duration: 60,
  priority: "normal",
  status: "todo",
  waiting_for: "",
  notes: "",
});

function TaskEditor({ value, onChange }) {
  const set = (key, next) => onChange({ ...value, [key]: next });
  return (
    <div className="ra-fields">
      <label className="ra-wide">
        事项名称
        <Input
          aria-label="事项名称"
          value={value.title}
          maxLength={240}
          onChange={(event) => set("title", event.target.value)}
        />
      </label>
      <label>
        类型
        <Select
          aria-label="类型"
          value={value.kind}
          options={["科研", "项目", "事务", "协调"].map((value) => ({
            value,
            label: value,
          }))}
          onChange={(value) => set("kind", value)}
        />
      </label>
      <label>
        项目或研究主题
        <Input
          aria-label="项目或研究主题"
          value={value.project}
          onChange={(event) => set("project", event.target.value)}
        />
      </label>
      <label>
        负责人
        <Input
          aria-label="负责人"
          value={value.assignee}
          onChange={(event) => set("assignee", event.target.value)}
        />
      </label>
      <label>
        与我的关系
        <Select
          aria-label="与我的关系"
          value={value.relation || "mine"}
          options={Object.entries(relationNames).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(value) => set("relation", value)}
        />
      </label>
      <label>
        截止日期
        <input
          aria-label="截止日期"
          type="date"
          value={value.due_date || ""}
          onChange={(event) => set("due_date", event.target.value || null)}
        />
      </label>
      <label>
        计划日期
        <input
          aria-label="计划日期"
          type="date"
          value={value.planned_date || ""}
          onChange={(event) => set("planned_date", event.target.value || null)}
        />
      </label>
      <label>
        固定开始时间
        <input
          aria-label="固定开始时间"
          type="time"
          value={value.start || ""}
          onChange={(event) => set("start", event.target.value)}
        />
      </label>
      <label>
        预计用时（分钟）
        <input
          aria-label="预计用时"
          type="number"
          min="15"
          max="480"
          step="15"
          value={value.duration}
          onChange={(event) => set("duration", Number(event.target.value))}
        />
      </label>
      <label>
        优先级
        <Select
          aria-label="优先级"
          value={value.priority}
          options={Object.entries(priorityNames).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(value) => set("priority", value)}
        />
      </label>
      <label>
        状态
        <Select
          aria-label="状态"
          value={value.status}
          options={Object.entries(statusNames).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(value) => set("status", value)}
        />
      </label>
      <label>
        等待谁反馈
        <Input
          aria-label="等待谁反馈"
          value={value.waiting_for}
          onChange={(event) => set("waiting_for", event.target.value)}
        />
      </label>
      <label className="ra-wide">
        补充说明
        <TextArea
          aria-label="补充说明"
          rows={2}
          value={value.notes}
          onChange={(event) => set("notes", event.target.value)}
        />
      </label>
    </div>
  );
}

function Agenda({ agentId }) {
  const [data, setData] = useState({ tasks: [], sources: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState("今日");
  const [day, setDay] = useState(today());
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("全部");
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [identity, setIdentity] = useState(
    () => localStorage.getItem(`research-agenda.identity.${agentId}`) || "",
  );
  const [sourceName, setSourceName] = useState("");
  const [referenceDate, setReferenceDate] = useState(today());
  const [source, setSource] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [editor, setEditor] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [notice, setNotice] = useState("");
  const alive = useRef(true);
  const controllers = useRef(new Set());
  const sourceSequence = useRef(0);
  const fileInput = useRef(null);

  async function api(path, method = "GET", body) {
    const controller = new AbortController();
    controllers.current.add(controller);
    const token = host.getApiToken?.();
    try {
      const response = await fetch(
        host.getApiUrl(
          `/research-agenda${path}${
            path.includes("?") ? "&" : "?"
          }agent_id=${encodeURIComponent(agentId)}`,
        ),
        {
          method,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "请求未完成，请检查输入内容后重试",
        );
      return result;
    } finally {
      controllers.current.delete(controller);
    }
  }

  async function refresh() {
    const result = await api("/state");
    if (alive.current) setData(result);
  }

  useEffect(() => {
    alive.current = true;
    refresh()
      .catch((error) => {
        if (alive.current) setError(error.message);
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });
    const timer = setInterval(() => {
      refresh().catch(() => {});
    }, 60000);
    return () => {
      alive.current = false;
      clearInterval(timer);
      controllers.current.forEach((controller) => controller.abort());
    };
  }, []);

  async function run(name, action) {
    if (busy) return;
    setBusy(name);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (error) {
      if (alive.current && error.name !== "AbortError") setError(error.message);
    } finally {
      if (alive.current) setBusy("");
    }
  }

  async function addFiles(files) {
    const picked = [...files];
    if (picked.length + images.length > 4) {
      setError("一次最多放入 4 张截图");
      return;
    }
    if (
      picked.some(
        (file) =>
          !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
          file.size > 4 * 1024 * 1024,
      )
    ) {
      setError("请选择 PNG、JPEG 或 WebP 图片，单张不超过 4MB");
      return;
    }
    await run("files", async () => {
      const added = await Promise.all(
        picked.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = () =>
                reject(new Error("图片读取失败，请重新选择"));
              reader.onload = () =>
                resolve({ name: file.name, data_url: reader.result });
              reader.readAsDataURL(file);
            }),
        ),
      );
      if (alive.current)
        setImages((current) => [...current, ...added].slice(0, 4));
    });
  }

  function showSource(value) {
    setSource(value);
    setCandidates(
      value.candidates.map((candidate) => {
        const accepted = value.accepted_candidates?.find(
          (item) => item.candidate_id === candidate.candidate_id,
        );
        return {
          ...candidate,
          selected:
            value.status === "applied"
              ? !!accepted
              : ["mine", "waiting"].includes(candidate.relation),
          fields: { ...candidate, ...accepted?.fields },
        };
      }),
    );
  }

  async function extract() {
    await run("extract", async () => {
      const result = await api("/extract", "POST", {
        text,
        images,
        identity,
        reference_date: referenceDate,
        source_name: sourceName || "聊天与工作记录",
      });
      if (!alive.current) return;
      localStorage.setItem(`research-agenda.identity.${agentId}`, identity);
      showSource(result);
      setText("");
      setImages([]);
      setSourceName("");
      await refresh();
    });
  }

  async function openSource(id) {
    const sequence = ++sourceSequence.current;
    await run("source", async () => {
      const result = await api(`/sources/${id}`);
      if (alive.current && sequence === sourceSequence.current)
        showSource(result);
    });
  }

  async function apply(skipAll = false) {
    await run("apply", async () => {
      const result = await api(`/sources/${source.id}/apply`, "POST", {
        candidates: (skipAll ? [] : candidates)
          .filter((candidate) => candidate.selected)
          .map((candidate) => ({
            candidate_id: candidate.candidate_id,
            fields: candidate.fields,
          })),
      });
      if (!alive.current) return;
      setData({ tasks: result.tasks, sources: result.sources });
      setSource(null);
      setSchedule(null);
      setNotice(
        result.ids.length
          ? `已保存 ${result.ids.length} 项工作`
          : "材料已处理，未新增事项",
      );
      setView("全部事项");
    });
  }

  async function update(task, fields) {
    await api(`/tasks/${task.id}`, "PUT", {
      revision: task.revision,
      fields: { ...task, ...fields },
    });
    await refresh();
    if (alive.current) setSchedule(null);
  }

  function sample() {
    setIdentity("张老师");
    setSourceName("项目群记录");
    setText(
      "王老师：张老师，周五之前把基金申请的研究方案改一下。预算找小李核对，明天下午三点我们碰一下。\n张老师：好的，我先改方案。\n小李：预算表我明天上午发给张老师。",
    );
  }

  function moveDay(amount) {
    const next = new Date(`${day}T12:00:00`);
    next.setDate(next.getDate() + amount);
    setDay(next.toLocaleDateString("sv-SE"));
    setSchedule(null);
  }

  const active = data.tasks.filter(
    (task) => !["done", "cancelled"].includes(task.status),
  );
  const overdue = active.filter(
    (task) => task.due_date && task.due_date < today(),
  );
  const dueToday = active.filter((task) => task.due_date === today());
  const waiting = active.filter((task) => task.status === "waiting");
  const uncertain = active.filter((task) =>
    ["unclear", "others"].includes(task.relation),
  );
  const pending = data.sources.filter((source) => source.status === "review");
  const filtered = data.tasks
    .filter((task) => {
      const matchesView =
        view === "全部事项"
          ? !["done", "cancelled"].includes(task.status)
          : view === "今日"
          ? task.status === "todo" && (task.planned_date || today()) <= day
          : view === "等待反馈"
          ? task.status === "waiting"
          : view === "待确认"
          ? ["unclear", "others"].includes(task.relation) &&
            task.status === "todo"
          : view === "已结束"
          ? ["done", "cancelled"].includes(task.status)
          : false;
      return (
        matchesView &&
        (kind === "全部" || kind === task.kind) &&
        `${task.title} ${task.project} ${task.assignee}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    })
    .sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"));

  return (
    <div className="ra-app">
      <style>{css}</style>
      <aside className="ra-nav">
        <div className="ra-brand">工作日程</div>
        <nav aria-label="工作日程视图">
          {["今日", "全部事项", "等待反馈", "待确认", "材料记录", "已结束"].map(
            (label) => (
              <button
                key={label}
                className={view === label ? "is-active" : ""}
                onClick={() => {
                  setView(label);
                  if (label === "今日") {
                    setDay(today());
                    setSchedule(null);
                  }
                }}
              >
                {label}
                <span>
                  {label === "等待反馈"
                    ? waiting.length
                    : label === "待确认"
                    ? uncertain.length + pending.length
                    : ""}
                </span>
              </button>
            ),
          )}
        </nav>
        <div className="ra-nav-foot">
          当前专家独立保存
          <br />
          每分钟更新事项状态
        </div>
      </aside>
      <div className="ra-main">
        <header className="ra-header">
          <div>
            <div className="ra-caption">应用</div>
            <h1>
              {view === "今日"
                ? day === today()
                  ? "今天的工作"
                  : `${day} 的工作`
                : view}
            </h1>
          </div>
          <div className="ra-actions">
            <Button
              onClick={() =>
                run("export", async () => {
                  const result = await api("/export");
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(result, null, 2)], {
                      type: "application/json",
                    }),
                  );
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = `工作日程-${today()}.json`;
                  anchor.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                })
              }
            >
              导出
            </Button>
            <Button disabled={!!busy} onClick={() => setEditor(emptyTask())}>
              新建事项
            </Button>
          </div>
        </header>
        {error && (
          <Alert
            type="error"
            showIcon
            closable
            onClose={() => setError("")}
            message={error}
          />
        )}
        {notice && (
          <Alert
            type="success"
            closable
            onClose={() => setNotice("")}
            message={notice}
          />
        )}
        <div className="ra-layout">
          <div className="ra-content">
            <section
              className="ra-capture"
              aria-label="整理工作材料"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (!busy) addFiles(event.dataTransfer.files);
              }}
            >
              <div className="ra-section-head">
                <h2>把工作记录放进来</h2>
                <Button
                  type="text"
                  size="small"
                  onClick={sample}
                  disabled={!!busy}
                >
                  试用一段示例
                </Button>
              </div>
              <TextArea
                aria-label="聊天记录或会议纪要"
                placeholder="粘贴聊天记录、会议纪要，或拖入截图…"
                autoSize={{ minRows: 4, maxRows: 10 }}
                value={text}
                maxLength={50000}
                disabled={!!busy}
                onChange={(event) => setText(event.target.value)}
                onPaste={(event) => {
                  const files = [...event.clipboardData.items]
                    .filter((item) => item.kind === "file")
                    .map((item) => item.getAsFile())
                    .filter(Boolean);
                  if (files.length) {
                    event.preventDefault();
                    if (!busy) addFiles(files);
                  }
                }}
              />
              {!!images.length && (
                <div className="ra-images">
                  {images.map((image, index) => (
                    <div key={index}>
                      <img src={image.data_url} alt={image.name} />
                      <Button
                        aria-label={`移除 ${image.name}`}
                        size="small"
                        disabled={!!busy}
                        onClick={() =>
                          setImages(
                            images.filter((_, position) => position !== index),
                          )
                        }
                      >
                        移除
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="ra-capture-context">
                <label>
                  记录中的我
                  <Input
                    aria-label="记录中的我"
                    placeholder="姓名、群昵称或称呼"
                    value={identity}
                    disabled={!!busy}
                    onChange={(event) => setIdentity(event.target.value)}
                  />
                </label>
                <label>
                  记录日期
                  <input
                    aria-label="记录日期"
                    type="date"
                    value={referenceDate}
                    disabled={!!busy}
                    onChange={(event) => setReferenceDate(event.target.value)}
                  />
                </label>
                <label>
                  材料名称
                  <Input
                    aria-label="材料名称"
                    placeholder="如 项目群 / 组会"
                    value={sourceName}
                    disabled={!!busy}
                    onChange={(event) => setSourceName(event.target.value)}
                  />
                </label>
              </div>
              <div className="ra-section-head ra-capture-footer">
                <div>
                  <input
                    ref={fileInput}
                    type="file"
                    hidden
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => {
                      addFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <Button
                    disabled={!!busy}
                    onClick={() => fileInput.current.click()}
                  >
                    添加截图
                  </Button>
                  <span className="ra-hint">最多 4 张 · 单张 4MB</span>
                </div>
                <Button
                  type="primary"
                  aria-label="整理成待办"
                  loading={busy === "extract"}
                  disabled={
                    !!busy ||
                    !identity.trim() ||
                    (!text.trim() && !images.length) ||
                    !referenceDate
                  }
                  onClick={extract}
                >
                  整理成待办
                </Button>
              </div>
              <div className="ra-hint">
                文字与截图会交给当前专家配置的模型。识别后可核对原文、修改并选择要保存的事项。
              </div>
            </section>
            <section className="ra-attention">
              <div className="ra-section-head">
                <h2>需要留意</h2>
                <span className="ra-hint">按当前日期检查</span>
              </div>
              <div className="ra-summary">
                <button
                  onClick={() => {
                    setView("全部事项");
                    setQuery("");
                  }}
                >
                  <b>{overdue.length}</b>
                  <span>已过截止日</span>
                </button>
                <button onClick={() => setView("今日")}>
                  <b>{dueToday.length}</b>
                  <span>今天截止</span>
                </button>
                <button onClick={() => setView("等待反馈")}>
                  <b>{waiting.length}</b>
                  <span>等待反馈</span>
                </button>
                <button onClick={() => setView("材料记录")}>
                  <b>{pending.length}</b>
                  <span>材料待确认</span>
                </button>
              </div>
              {overdue.length > 0 && (
                <p className="ra-warning">
                  优先核对{" "}
                  {overdue
                    .slice(0, 2)
                    .map((task) => `「${task.title}」`)
                    .join("、")}{" "}
                  的进度。
                </p>
              )}
            </section>
            <section className="ra-list">
              <div className="ra-section-head">
                <h2>
                  {view === "今日" ? "待处理事项" : view}
                  <span className="ra-count">
                    {view === "材料记录"
                      ? data.sources.length
                      : filtered.length +
                        (view === "待确认" ? pending.length : 0)}
                  </span>
                </h2>
                <Input
                  aria-label="搜索事项"
                  placeholder="搜索事项、项目、负责人"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  allowClear
                  className="ra-search"
                />
              </div>
              {view !== "材料记录" && (
                <div className="ra-filters">
                  {["全部", "科研", "项目", "事务", "协调"].map((label) => (
                    <button
                      key={label}
                      aria-pressed={kind === label}
                      onClick={() => setKind(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {view === "待确认" &&
                pending.map((item) => (
                  <button
                    className="ra-source-row"
                    key={item.id}
                    disabled={!!busy}
                    onClick={() => openSource(item.id)}
                  >
                    <div>
                      <strong>{item.source_name}</strong>
                      <p>{item.summary}</p>
                    </div>
                    <Tag>核对整理结果</Tag>
                  </button>
                ))}
              {loading ? (
                <Spin />
              ) : view === "材料记录" ? (
                data.sources.map((item) => (
                  <button
                    className="ra-source-row"
                    key={item.id}
                    onClick={() => openSource(item.id)}
                  >
                    <div>
                      <strong>{item.source_name}</strong>
                      <p>{item.summary || "查看整理结果和原始材料"}</p>
                      <span className="ra-hint">
                        {item.reference_date} · {item.candidates.length}{" "}
                        项识别结果
                      </span>
                    </div>
                    <Tag>{item.status === "review" ? "待确认" : "已处理"}</Tag>
                  </button>
                ))
              ) : (
                filtered.map((task) => (
                  <article className="ra-task" key={task.id}>
                    <Checkbox
                      aria-label={`完成 ${task.title}`}
                      disabled={!!busy}
                      checked={task.status === "done"}
                      onChange={(event) =>
                        run("task", () =>
                          update(task, {
                            status: event.target.checked ? "done" : "todo",
                          }),
                        )
                      }
                    />
                    <div className="ra-task-body">
                      <button
                        className="ra-task-title"
                        onClick={() => setEditor(task)}
                      >
                        {task.title}
                      </button>
                      <div className="ra-task-meta">
                        <span className={`ra-kind ra-kind-${task.kind}`}>
                          {task.kind}
                        </span>
                        {task.project && <span>{task.project}</span>}
                        {task.assignee && <span>{task.assignee}</span>}
                        {task.due_date ? (
                          <span
                            className={
                              task.due_date < today() && task.status !== "done"
                                ? "ra-warning"
                                : ""
                            }
                          >
                            {task.due_date} 截止
                          </span>
                        ) : (
                          <span>截止日待定</span>
                        )}
                        {task.priority !== "normal" && (
                          <span>{priorityNames[task.priority]}</span>
                        )}
                      </div>
                      {task.status === "waiting" && (
                        <p>
                          等待 {task.waiting_for || "联系人待补充"}
                          {Date.now() - new Date(task.updated_at).getTime() >
                          3 * 86400000
                            ? " · 已超过 3 天未更新"
                            : ""}
                        </p>
                      )}
                      {task.relation === "unclear" && (
                        <p>归属待确认，请核对负责人。</p>
                      )}
                      <div className="ra-task-tools">
                        {task.source_id && (
                          <Button
                            size="small"
                            type="text"
                            onClick={() => openSource(task.source_id)}
                          >
                            查看来源
                          </Button>
                        )}
                        {task.status === "waiting" && (
                          <Button
                            size="small"
                            type="text"
                            disabled={!!busy}
                            onClick={() =>
                              run("task", () =>
                                update(task, {
                                  status: "todo",
                                  waiting_for: "",
                                }),
                              )
                            }
                          >
                            已收到反馈
                          </Button>
                        )}
                        <Button
                          size="small"
                          type="text"
                          onClick={() =>
                            run("copy", async () => {
                              await navigator.clipboard.writeText(
                                `${
                                  task.waiting_for || task.assignee || "您好"
                                }，想跟进一下「${task.title}」${
                                  task.due_date
                                    ? `，原定 ${task.due_date} 完成`
                                    : ""
                                }。目前进展如何？如需我配合，请告诉我。`,
                              );
                              setNotice("跟进草稿已复制，可修改后发送");
                            })
                          }
                        >
                          复制跟进草稿
                        </Button>
                      </div>
                    </div>
                    <span className="ra-duration">{task.duration} 分钟</span>
                  </article>
                ))
              )}
              {!loading &&
                (view === "材料记录"
                  ? !data.sources.length
                  : !filtered.length &&
                    (view !== "待确认" || !pending.length)) && (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      view === "材料记录"
                        ? "整理过的材料会保存在这里，可随时回看来源"
                        : "暂无事项。放入聊天记录或截图，开始整理。"
                    }
                  />
                )}
            </section>
          </div>
          <aside className="ra-day">
            <div className="ra-section-head">
              <h2>日程</h2>
              <input
                aria-label="日程日期"
                disabled={!!busy}
                type="date"
                value={day}
                onChange={(event) => {
                  setDay(event.target.value || today());
                  setSchedule(null);
                }}
              />
            </div>
            <div className="ra-date-navigation">
              <Button
                aria-label="前一天"
                size="small"
                disabled={!!busy}
                onClick={() => moveDay(-1)}
              >
                ‹
              </Button>
              <Button
                size="small"
                disabled={!!busy}
                onClick={() => {
                  setDay(today());
                  setSchedule(null);
                }}
              >
                今天
              </Button>
              <Button
                aria-label="后一天"
                size="small"
                disabled={!!busy}
                onClick={() => moveDay(1)}
              >
                ›
              </Button>
            </div>
            <p>09:00—18:00 · 午休 12:00—13:30</p>
            <Button
              block
              loading={busy === "plan"}
              disabled={!!busy}
              onClick={() =>
                run("plan", async () => {
                  const result = await api(`/plan?day=${day}`);
                  if (alive.current) setSchedule(result);
                })
              }
            >
              安排当天工作
            </Button>
            {schedule ? (
              <>
                <div className="ra-timeline">
                  {schedule.blocks.map((block) => (
                    <div key={block.task_id} className="ra-block">
                      <time>
                        {block.start}
                        <span>{block.end}</span>
                      </time>
                      <div>
                        <strong>{block.title}</strong>
                        <p>
                          {block.kind} · {block.fixed ? "固定活动" : "建议时间"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {!schedule.blocks.length && (
                  <p className="ra-hint">当天暂无可安排的事项。</p>
                )}
                {!!schedule.conflicts.length && (
                  <Alert
                    type="warning"
                    message="固定活动存在时间冲突，请编辑事项调整"
                  />
                )}
                {!!schedule.unplanned.length && (
                  <Alert
                    type="warning"
                    message={`${schedule.unplanned.length} 项工作未排入，请调整计划日期或用时`}
                  />
                )}
                <div className="ra-hint">
                  此处为排期预览，重新安排会根据最新事项计算。
                </div>
              </>
            ) : (
              <div className="ra-day-empty">
                <div className="ra-calendar-mark">{Number(day.slice(-2))}</div>
                <p>
                  整理并确认事项后，
                  <br />
                  按预计用时安排到空档。
                </p>
              </div>
            )}
            <div className="ra-day-note">
              <h3>待反馈事项</h3>
              {waiting.slice(0, 4).map((task) => (
                <button key={task.id} onClick={() => setEditor(task)}>
                  <span>{task.waiting_for || "待补充联系人"}</span>
                  {task.title}
                </button>
              ))}
              {!waiting.length && <p>暂无等待中的反馈</p>}
            </div>
          </aside>
        </div>
      </div>
      <Modal
        title={editor?.id ? "编辑事项" : "新建事项"}
        open={!!editor}
        onCancel={() => !busy && setEditor(null)}
        confirmLoading={busy === "save"}
        okButtonProps={{ disabled: !!busy && busy !== "save" }}
        okText="保存事项"
        cancelText="取消"
        onOk={() =>
          run("save", async () => {
            if (!editor.title.trim()) throw new Error("请填写事项名称");
            if (editor.id) await update(editor, editor);
            else {
              await api("/tasks", "POST", editor);
              await refresh();
            }
            if (alive.current) {
              setEditor(null);
              setSchedule(null);
            }
          })
        }
      >
        {editor && <TaskEditor value={editor} onChange={setEditor} />}
      </Modal>
      <Modal
        className="ra-review-modal"
        title={source?.status === "applied" ? "材料与来源" : "核对整理结果"}
        open={!!source}
        width={1120}
        onCancel={() => {
          if (!busy) {
            ++sourceSequence.current;
            setSource(null);
          }
        }}
        footer={
          source?.status === "applied" ? (
            <Button onClick={() => setSource(null)}>关闭</Button>
          ) : (
            <>
              <Button disabled={!!busy} onClick={() => setSource(null)}>
                稍后处理
              </Button>
              <Button disabled={!!busy} onClick={() => apply(true)}>
                无需新增事项
              </Button>
              <Button
                type="primary"
                loading={busy === "apply"}
                disabled={
                  !!busy || !candidates.some((candidate) => candidate.selected)
                }
                onClick={() => apply()}
              >
                保存选中的{" "}
                {candidates.filter((candidate) => candidate.selected).length} 项
              </Button>
            </>
          )
        }
      >
        {source && (
          <div className="ra-review">
            <div className="ra-review-results">
              <p>{source.summary}</p>
              {!!source.questions.length && (
                <Alert
                  type="warning"
                  message="需要核对"
                  description={source.questions.map((question, index) => (
                    <div key={index}>{question}</div>
                  ))}
                />
              )}
              {!candidates.length && (
                <Empty description="未识别到需要新增或变更的工作事项" />
              )}
              {candidates.map((candidate, index) => (
                <article className="ra-candidate" key={candidate.candidate_id}>
                  <div className="ra-section-head">
                    <Checkbox
                      disabled={source.status === "applied" || !!busy}
                      checked={candidate.selected}
                      onChange={(event) =>
                        setCandidates(
                          candidates.map((item, position) =>
                            position === index
                              ? { ...item, selected: event.target.checked }
                              : item,
                          ),
                        )
                      }
                    >
                      {candidate.fields.title}
                    </Checkbox>
                    <Tag>
                      {candidate.action === "update"
                        ? "变更"
                        : candidate.action === "cancel"
                        ? "取消"
                        : relationNames[candidate.relation]}
                    </Tag>
                  </div>
                  <div className="ra-task-meta">
                    <span>{candidate.fields.assignee || "负责人待确认"}</span>
                    <span>
                      {candidate.fields.due_date
                        ? `${candidate.fields.due_date} 截止`
                        : "截止日未定"}
                    </span>
                    {candidate.fields.planned_date && (
                      <span>
                        {candidate.fields.planned_date} {candidate.fields.start}
                      </span>
                    )}
                    <span>预计 {candidate.fields.duration} 分钟</span>
                  </div>
                  <blockquote>{candidate.evidence}</blockquote>
                  {!!candidate.questions.length && (
                    <p className="ra-warning">
                      {candidate.questions.join("；")}
                    </p>
                  )}
                  {source.status === "review" ? (
                    <details>
                      <summary>核对或修改字段</summary>
                      <TaskEditor
                        value={candidate.fields}
                        onChange={(fields) =>
                          setCandidates(
                            candidates.map((item, position) =>
                              position === index ? { ...item, fields } : item,
                            ),
                          )
                        }
                      />
                    </details>
                  ) : (
                    <p>
                      {candidate.due_date || "截止日未定"} ·{" "}
                      {candidate.assignee || "负责人未定"}
                    </p>
                  )}
                </article>
              ))}
            </div>
            <aside className="ra-original">
              <h3>{source.source_name}</h3>
              <div className="ra-hint">
                记录日期 {source.reference_date} · 我是 {source.identity}
              </div>
              {source.text && <pre>{source.text}</pre>}
              {source.images?.map((image, index) => (
                <a
                  key={index}
                  href={image.data_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={image.data_url} alt={image.name} />
                </a>
              ))}
              {source.transcript && (
                <details>
                  <summary>截图识别文字</summary>
                  <pre>{source.transcript}</pre>
                </details>
              )}
            </aside>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AppRoot() {
  const agent = host.useSelectedAgent
    ? host.useSelectedAgent()
    : { id: "default" };
  return <Agenda key={agent.id} agentId={agent.id} />;
}

window.QwenPaw.registerRoutes("research-agenda", [
  {
    path: "/apps/research-agenda",
    component: AppRoot,
    label: "工作日程",
    icon: "📅",
  },
]);
