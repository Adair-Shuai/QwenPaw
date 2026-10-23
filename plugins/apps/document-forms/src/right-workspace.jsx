import OfficeServicePreview, { OfficePrintPreview } from "./office-preview.jsx";
import ResponseReview from "./response-review.jsx";
const Q = window.QwenPaw,
  React = Q.host.React;
const { useState, useEffect, useRef } = React;

export function generatedSelection(form, generation, file) {
  return {
    artifact: {
      id: generation.id + file.name,
      title: file.name,
      source: "generated",
      extension: "docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      binaryUrl: file.preview_url,
      printUrl: `/document-forms/cases/${form.case_id}/print/${
        generation.id
      }/${encodeURIComponent(file.name)}`,
      agentId: Q.host.getSelectedAgentId?.(),
      createdAt: Date.parse(generation.created_at),
    },
    reference: {
      case_id: form.case_id,
      generation_id: generation.id,
      name: file.name,
    },
  };
}

function ProjectChat({ project, stageId, selection, services }) {
  const { request, json, time } = services;
  const [messages, setMessages] = useState([]),
    [text, setText] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const end = useRef(null);
  useEffect(() => {
    let active = true,
      timer;
    async function load() {
      try {
        const data = await request(`/projects/${project.id}/assistant`);
        if (!active) return;
        setMessages(data.messages);
        setError("");
        if (data.messages.some((m) => m.status === "running"))
          timer = setTimeout(load, 2500);
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
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: "nearest" });
  }, [messages.length, messages.at(-1)?.status]);
  const waiting = busy || messages.some((m) => m.status === "running");
  const Markdown = Q.host.ReactMarkdown;
  async function send(event) {
    event.preventDefault();
    if (!text.trim() || waiting) return;
    setBusy(true);
    setError("");
    try {
      const result = await request(
        `/projects/${project.id}/assistant`,
        json({
          message: text.trim(),
          stage_id: stageId || "overview",
          file: selection?.reference || {},
        }),
      );
      setMessages((items) => [...items, result]);
      setText("");
      setRefresh((n) => n + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="df-project-chat" aria-label="项目智能体问答">
      <p className="df-muted">
        结合已保存的项目资料和当前预览回答，问答随项目保留。
      </p>
      <div className="df-chat-messages" aria-live="polite">
        {!messages.length && (
          <div className="df-chat-welcome">
            <h3>围绕当前项目提问</h3>
            <p>可以梳理本阶段还需准备的材料，或对照预览文件核实内容。</p>
            {[
              "本阶段还需要准备哪些材料？",
              "帮我核对当前文件中的日期和金额。",
            ].map((q) => (
              <button key={q} onClick={() => setText(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((m) => (
          <article className="df-chat-turn" key={m.id}>
            <div className="df-chat-question">
              <small>我 · {time(m.created_at)}</small>
              <p>{m.message}</p>
              {m.file_name && <small>参考文件：{m.file_name}</small>}
            </div>
            {m.reply && (
              <div className="df-chat-answer">
                <small>项目助手</small>
                {Markdown ? (
                  <Markdown
                    remarkPlugins={Q.host.remarkGfm ? [Q.host.remarkGfm] : []}
                    components={{
                      img: () => null,
                      a: ({ children }) => <span>{children}</span>,
                    }}
                  >
                    {m.reply}
                  </Markdown>
                ) : (
                  <p style={{ whiteSpace: "pre-wrap" }}>{m.reply}</p>
                )}
              </div>
            )}
            {m.status === "running" && (
              <p role="status" className="df-muted">
                正在结合项目资料整理回答…
              </p>
            )}
            {m.error && (
              <p role="alert" className="df-alert error">
                {m.error}
              </p>
            )}
          </article>
        ))}
        <div ref={end} />
      </div>
      {error && (
        <p role="alert" className="df-alert error">
          {error}
          <button onClick={() => setRefresh((n) => n + 1)}>重新加载</button>
        </p>
      )}
      <form className="df-chat-composer" onSubmit={send}>
        {selection && (
          <small className="df-chat-context">
            参考文件：{selection.artifact.title}
          </small>
        )}
        <textarea
          aria-label="向项目智能体提问"
          placeholder="输入当前项目的问题…"
          rows={3}
          maxLength={4000}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="df-actions">
          <button className="df-primary" disabled={waiting || !text.trim()}>
            {waiting ? "正在回答…" : "发送问题"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function RightWorkspace({
  collapsed = false,
  width,
  maxWidth,
  onResize,
  onToggle,
  project,
  stageId,
  services,
  mode,
  onMode,
  selection,
  onSelect,
  attachment,
  AttachmentPreview,
  onChanged,
  dirty = false,
}) {
  const drag = useRef(null);
  const [resizing, setResizing] = useState(false);
  const finishResize = () => {
    drag.current = null;
    setResizing(false);
  };
  const [Preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  async function safeDownload(path, name) {
    try {
      setError("");
      await services.download(path, name);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    let active = true;
    (Q.workspace?.loadPreview
      ? Q.workspace.loadPreview()
      : Promise.resolve(OfficeServicePreview)
    )
      .then((component) => active && setPreview(() => component))
      .catch(() => active && setPreview(() => OfficeServicePreview));
    return () => {
      active = false;
    };
  }, []);
  const files = project.forms.flatMap((f) =>
    f.generations.flatMap((g) =>
      stageId &&
      stageId !== "overview" &&
      stageId !== "profile" &&
      (g.stage_id || f.original_stage_id || f.stage_id) !== stageId
        ? []
        : [{ form: f, generation: g }],
    ),
  );
  return (
    <aside
      className={
        "df-right-workspace" +
        (collapsed ? " df-pane-collapsed" : "") +
        (resizing ? " df-resizing" : "")
      }
      aria-label="项目智能体与文件预览"
    >
      <div
        className="df-dock-resizer"
        role="separator"
        aria-label="调整问答与预览栏宽度"
        aria-orientation="vertical"
        aria-valuemin={300}
        aria-valuemax={maxWidth}
        aria-valuenow={width}
        aria-valuetext={width + " 像素"}
        tabIndex={0}
        title="左右拖动调整宽度；双击恢复默认宽度"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          drag.current = { x: event.clientX, width, pointer: event.pointerId };
          event.currentTarget.setPointerCapture?.(event.pointerId);
          setResizing(true);
        }}
        onPointerMove={(event) => {
          if (drag.current && drag.current.pointer === event.pointerId)
            onResize(drag.current.width + drag.current.x - event.clientX);
        }}
        onPointerUp={finishResize}
        onPointerCancel={finishResize}
        onLostPointerCapture={finishResize}
        onDoubleClick={() => onResize(500)}
        onKeyDown={(event) => {
          const next = {
            ArrowLeft: width + 24,
            ArrowRight: width - 24,
            Home: 300,
            End: maxWidth,
          }[event.key];
          if (next === undefined) return;
          event.preventDefault();
          onResize(next);
        }}
      />
      <button
        className="df-pane-toggle"
        aria-label={collapsed ? "展开问答与预览栏" : "收起问答与预览栏"}
        aria-expanded={!collapsed}
        title={collapsed ? "展开问答与预览栏" : "收起问答与预览栏"}
        onClick={onToggle}
      >
        <span aria-hidden="true">{collapsed ? "‹" : "›"}</span>
        <span>{collapsed ? "问答与预览" : "收起"}</span>
      </button>
      <header>
        <div>
          <span className="df-eyebrow">项目工作区</span>
          <h2>
            {mode === "preview"
              ? "文件预览"
              : mode === "review"
              ? "响应文件核查"
              : "智能体问答"}
          </h2>
        </div>
        <div className="df-dock-tabs" role="tablist" aria-label="右侧工作区">
          <button
            role="tab"
            aria-selected={mode === "assistant"}
            onClick={() => onMode("assistant")}
          >
            问答
          </button>
          <button
            role="tab"
            aria-selected={mode === "preview"}
            onClick={() => onMode("preview")}
          >
            预览
          </button>
        </div>
      </header>
      {error && (
        <p role="alert" className="df-alert error">
          {error}
        </p>
      )}
      <div className="df-right-body" hidden={mode !== "assistant"}>
        <ProjectChat
          project={project}
          stageId={
            ["overview", "profile"].includes(stageId) ? "overview" : stageId
          }
          selection={selection}
          services={services}
        />
        {stageId === "negotiation" && (
          <button className="df-open-review" onClick={() => onMode("review")}>
            响应文件核查 →
          </button>
        )}
      </div>
      <div className="df-right-body" hidden={mode !== "review"}>
        <button className="df-back-link" onClick={() => onMode("assistant")}>
          ← 返回问答
        </button>
        {mode === "review" && (
          <ResponseReview
            key={project.id}
            project={project}
            services={services}
            onChanged={onChanged}
          />
        )}
      </div>
      <div className="df-right-body df-dock-files" hidden={mode !== "preview"}>
        {dirty && (
          <p className="df-alert">
            中间表单有未保存的修改，预览文件保留生成时的内容。
          </p>
        )}
        <details open={!selection && !attachment} className="df-dock-file-list">
          <summary>
            本阶段文件 ·{" "}
            {files.reduce((n, item) => n + item.generation.files.length, 0)} 份
          </summary>
          {files.map(({ form, generation }) => (
            <section className="df-generation" key={generation.id}>
              <div className="df-generation-heading">
                <h3>
                  {services.time(generation.created_at)} · 修订{" "}
                  {generation.revision}
                  {generation.date_style !== "zh-CN" && " · 原日期格式"}
                  {generation.naming_style !== "formal" && " · 原文件名"}
                </h3>
                <button
                  onClick={() =>
                    safeDownload(
                      `/cases/${form.case_id}/outputs/${generation.id}/全部文书.zip`,
                      generation.bundle_name || project.name + "_文书.zip",
                    )
                  }
                >
                  打包下载
                </button>
              </div>
              {generation.files.map((file) => (
                <div className="df-dock-file-row" key={file.name}>
                  <button
                    className="df-dock-file"
                    aria-label={file.name}
                    onClick={() =>
                      onSelect(generatedSelection(form, generation, file))
                    }
                  >
                    {file.name}
                    <small>
                      {file.recipient} · {(file.size / 1024).toFixed(0)} KB
                      {file.print_copies > 1 &&
                        ` · 建议打印 ${file.print_copies} 份`}
                    </small>
                  </button>
                  <button
                    aria-label={"下载" + file.name}
                    onClick={() =>
                      safeDownload(
                        `/cases/${form.case_id}/outputs/${
                          generation.id
                        }/${encodeURIComponent(file.name)}`,
                        file.name,
                      )
                    }
                  >
                    ↓
                  </button>
                </div>
              ))}
            </section>
          ))}
          {!files.length && (
            <p className="df-muted">
              生成文书或从中间的材料清单选择文件后，在这里预览。
            </p>
          )}
          {project.forms
            .filter((f) => f.case_id !== project.form_id)
            .map((f) => (
              <button
                className="df-dock-file"
                key={f.case_id}
                onClick={() =>
                  safeDownload(
                    `/cases/${f.case_id}/excel`,
                    f.name + "_历史底稿.xlsx",
                  )
                }
              >
                历史底稿：{f.name} ↓
              </button>
            ))}
        </details>
        {files.length > 0 && (
          <p className="df-muted">
            文件保留各批次生成时的内容，修改表单后请重新核对生成。
          </p>
        )}
        {attachment ? (
          <AttachmentPreview
            key={attachment.id}
            file={attachment}
            projectId={project.id}
            download={safeDownload}
            embedded
            onClose={() => onSelect(null)}
          />
        ) : selection ? (
          <section className="df-dock-preview" aria-label="文件预览">
            <h3>{selection.artifact.title}</h3>
            {Preview ? (
              <OfficePrintPreview
                key={selection.artifact.id}
                artifact={selection.artifact}
              >
                <Preview artifact={selection.artifact} readOnly hostControls />
              </OfficePrintPreview>
            ) : (
              <p role="status">正在打开预览…</p>
            )}
            <button className="df-dock-ask" onClick={() => onMode("assistant")}>
              就此文件提问 →
            </button>
            <button
              className="df-dock-ask"
              onClick={() =>
                safeDownload(
                  `/cases/${selection.reference.case_id}/outputs/${
                    selection.reference.generation_id
                  }/${encodeURIComponent(selection.reference.name)}`,
                  selection.artifact.title,
                )
              }
            >
              下载当前文件
            </button>
          </section>
        ) : (
          <p className="df-dock-empty">
            选择一份文件，填写与预览可以同时进行。
          </p>
        )}
      </div>
    </aside>
  );
}
