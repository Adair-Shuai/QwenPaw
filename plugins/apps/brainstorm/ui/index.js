/** 头脑风暴 PawApp. React, Ant Design and Markdown come from the console. */
(function () {
  "use strict";
  const app = window.QwenPaw;
  if (!app || !app.host || !app.registerRoutes) return;
  const host = app.host;
  const { createElement: h, useState, useEffect, useRef } = host.React;
  const { Button, Input } = host.antd;
  const TOPIC_LIMIT = 240;
  const MATERIAL_LIMIT = 24000;
  const ANSWER_LIMIT = 6000;

  const MODES = {
    start: "开场提问",
    deepen: "继续追问",
    reframe: "换个视角",
    diverge: "自由发散",
  };
  const STARTERS = [
    ["产品设计", "怎样让第一次打开我们产品的人，在五分钟内获得价值？"],
    ["个人选择", "我想换一个工作方向，该先做什么小实验来验证想法？"],
    ["研究选题", "如果只能收集一种新数据，哪一种最能挑战我现在的假设？"],
  ];

  const css = `
.brainstorm-app{container-type:inline-size;height:100%;overflow:auto;background:var(--app-bg);color:var(--app-text);font-size:var(--app-font-body,14px)}
.brainstorm-app *{box-sizing:border-box}.bs-shell{max-width:1250px;margin:0 auto;padding:32px clamp(18px,3.5vw,54px) 64px}
.bs-header,.bs-row,.bs-actions,.bs-panel-head,.bs-star-group,.bs-attach{display:flex;align-items:center;gap:10px}.bs-header{gap:14px;padding-bottom:22px;margin-bottom:28px;border-bottom:1px solid var(--app-border)}
.bs-brand-icon{width:44px;height:44px;flex:none;display:grid;place-items:center;background:var(--app-accent-soft);border:1px solid var(--app-accent-border);color:var(--app-accent-text);border-radius:13px;font-size:22px}
.brainstorm-app :is(h1,h2,h3,p,ol){margin:0}.brainstorm-app h1{font-size:calc(23px * var(--app-font-scale,1));font-weight:650;letter-spacing:-.04em;line-height:1.4}
.brainstorm-app h2{font-size:var(--app-font-subtitle,16px);font-weight:650}.bs-sub,.bs-muted{color:var(--app-text-secondary);font-size:var(--app-font-secondary,13px);line-height:1.7}.bs-sub{margin-top:3px!important}
.bs-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(200px,260px);align-items:start;gap:clamp(20px,3vw,36px)}.bs-main{min-width:0;display:grid;gap:18px}
.bs-panel,.bs-aside{min-width:0;border:1px solid var(--app-border);border-radius:var(--app-radius-card,16px);background:var(--app-surface)}.bs-panel{padding:clamp(18px,2.2vw,32px)}.bs-aside{overflow:hidden}.bs-aside-head{padding:18px 16px 12px}.bs-panel-head{justify-content:space-between;gap:12px}
.bs-label{display:block;margin:0 0 9px;font-weight:600}.bs-topic{font-size:calc(21px * var(--app-font-scale,1));font-weight:640;line-height:1.6;overflow-wrap:anywhere;white-space:pre-wrap}.bs-question{font-size:calc(22px * var(--app-font-scale,1));font-weight:620;line-height:1.65;overflow-wrap:anywhere;white-space:pre-wrap}
.bs-round{display:flex;flex-wrap:wrap;align-items:center;gap:9px;color:var(--app-accent-text);font-size:var(--app-font-caption,12px);font-weight:600;margin-bottom:12px}.bs-round i{display:block;width:16px;height:2px;background:currentColor}
.bs-question-panel{border-top:3px solid var(--app-accent-border)}.bs-question-panel .bs-label{margin-top:24px}.bs-row,.bs-actions,.bs-star-group,.bs-attach{flex-wrap:wrap}
.bs-actions{justify-content:space-between;border-top:1px solid var(--app-border-subtle);padding-top:16px;margin-top:18px}.bs-start{margin-left:auto}.bs-star-group{gap:6px 8px;margin-top:12px}.bs-star-group span{font-size:var(--app-font-caption,12px);color:var(--app-text-secondary)}
.bs-suggestion,.bs-link{font:inherit;font-size:var(--app-font-caption,12px);cursor:pointer}.bs-suggestion{border:1px solid var(--app-border);border-radius:20px;background:var(--app-surface);padding:3px 10px;color:var(--app-text-secondary)}.bs-suggestion:hover,.bs-history-item:hover{background:var(--app-fill-subtle)}
.bs-link{padding:4px 0;color:var(--app-accent-text);border:0;background:none}.brainstorm-app button:focus-visible,.brainstorm-app summary:focus-visible{outline:2px solid var(--app-focus-ring);outline-offset:2px}.brainstorm-app button:disabled{cursor:not-allowed;opacity:.6}
.bs-materials{margin-top:20px}.bs-materials summary{width:fit-content;cursor:pointer;color:var(--app-text-secondary);font-size:var(--app-font-secondary,13px);line-height:2}.bs-materials[open] summary{margin-bottom:8px}
.bs-attach{justify-content:space-between;margin-top:8px}.bs-attach small,.bs-meta,.bs-history-empty{color:var(--app-text-secondary);font-size:var(--app-font-caption,12px);line-height:1.7}
.bs-history-list{list-style:none;padding:0 6px 8px;max-height:65vh;overflow:auto}.bs-history-item{width:100%;font:inherit;cursor:pointer;border:1px solid transparent;background:none;color:inherit;border-radius:8px;display:block;padding:10px;text-align:left}.bs-history-item[aria-current=true]{background:var(--app-accent-soft);border-color:var(--app-accent-border)}
.bs-history-topic{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-weight:550;line-height:1.6;overflow-wrap:anywhere}.bs-history-empty{padding:0 16px 18px}.bs-history-item .bs-meta{display:block;margin-top:3px}
.bs-readout,.bs-markdown{line-height:1.85;overflow-wrap:anywhere}.bs-readout{white-space:pre-wrap}.bs-markdown :is(h1,h2,h3){font-size:1.05em;line-height:1.7;margin:.9em 0 .35em}.bs-markdown :is(ol,ul){padding-left:1.6em}.bs-markdown p+p{margin-top:.6em}.bs-markdown pre,.bs-markdown table{max-width:100%;overflow:auto;display:block}
.bs-discussion{list-style:none;padding:0!important}.bs-discussion li{padding:16px 0;border-bottom:1px solid var(--app-border-subtle)}.bs-discussion li:last-child{padding-bottom:0;border-bottom:0}.bs-past-question{font-weight:600;line-height:1.7;overflow-wrap:anywhere;white-space:pre-wrap;margin-top:4px!important}.bs-answer{margin-top:9px;padding-left:12px;border-left:2px solid var(--app-border);color:var(--app-text-secondary)}
.bs-summary h2{margin-bottom:8px}.bs-alert{color:var(--app-error-text);background:var(--app-error-bg);padding:10px 14px;border-radius:9px;overflow-wrap:anywhere}.bs-aside .bs-alert{margin:4px 10px 12px}
@container(max-width:780px){.bs-shell{padding:20px 16px 40px}.bs-header{margin-bottom:18px}.bs-grid{grid-template-columns:1fr}.bs-history-list{max-height:280px}.bs-aside-head{padding-top:14px}}
@container(max-width:460px){.bs-shell{padding:14px 10px 32px}.bs-panel{padding:16px}.bs-header{gap:9px}.bs-actions{align-items:stretch}.bs-question{font-size:18px}.bs-actions .bs-row{gap:6px}}
`;

  function icon(name) {
    const component = host.antdIcons && host.antdIcons[name];
    return component ? h(component, { "aria-hidden": true }) : null;
  }

  async function send(agentId, path, options) {
    const url = path + "?agent_id=" + encodeURIComponent(agentId);
    let response;
    if (host.fetch) response = await host.fetch(url, options);
    else {
      const token = host.getApiToken && host.getApiToken();
      if (token)
        options.headers = {
          ...options.headers,
          Authorization: "Bearer " + token,
        };
      response = await fetch(host.getApiUrl(url), options);
    }
    if (response.ok) return response.json();
    const data = await response.json().catch(() => ({}));
    const message =
      typeof data.detail === "string"
        ? data.detail
        : "请求失败（" + response.status + "）";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  function request(agentId, path, body) {
    return send(
      agentId,
      "/brainstorm/sessions" + path,
      body === undefined
        ? {}
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
    );
  }

  function requestId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }

  // A history read may finish after a user has already submitted a new turn.
  function mergeHistory(known, incoming) {
    const rows = new Map(known.map((item) => [item.id, item]));
    for (const item of incoming) {
      if (!rows.has(item.id) || item.revision >= rows.get(item.id).revision) {
        rows.set(item.id, item);
      }
    }
    return [...rows.values()].sort((a, b) =>
      String(b.updated_at).localeCompare(String(a.updated_at)),
    );
  }

  function markdown(value) {
    if (!host.ReactMarkdown)
      return h("div", { className: "bs-readout" }, value);
    return h(
      "div",
      { className: "bs-markdown" },
      h(
        host.ReactMarkdown,
        {
          remarkPlugins: host.remarkGfm ? [host.remarkGfm] : [],
          skipHtml: true,
          disallowedElements: ["img"],
        },
        value,
      ),
    );
  }

  function History({
    sessions,
    current,
    busy,
    error,
    loading,
    onOpen,
    onReload,
    onNew,
  }) {
    return h(
      "aside",
      { className: "bs-aside", "aria-label": "历史讨论" },
      h(
        "div",
        { className: "bs-panel-head bs-aside-head" },
        h("h2", null, "历史讨论"),
        h(
          Button,
          {
            size: "small",
            disabled: busy || !current,
            icon: icon("PlusOutlined"),
            onClick: onNew,
          },
          "新建讨论",
        ),
      ),
      error &&
        h(
          "div",
          { className: "bs-alert", role: "alert" },
          error,
          " ",
          h("button", { className: "bs-link", onClick: onReload }, "重试"),
        ),
      !sessions.length &&
        !error &&
        h(
          "p",
          { className: "bs-history-empty" },
          loading ? "正在读取历史…" : "开始讨论后，可以在这里回看和继续。",
        ),
      h(
        "ol",
        { className: "bs-history-list" },
        sessions.map((session) =>
          h(
            "li",
            { key: session.id },
            h(
              "button",
              {
                type: "button",
                className: "bs-history-item",
                disabled: Boolean(busy),
                "aria-current": current === session.id,
                onClick: () => onOpen(session.id),
              },
              h("span", { className: "bs-history-topic" }, session.topic),
              h(
                "span",
                { className: "bs-meta" },
                [
                  formatDate(session.updated_at),
                  session.turn_count + " 轮",
                  session.has_summary ? "已总结" : "",
                ]
                  .filter(Boolean)
                  .join(" · "),
              ),
            ),
          ),
        ),
      ),
    );
  }

  function NewDiscussion({
    agentId,
    topic,
    onTopic,
    materials,
    onMaterials,
    busy,
    onStart,
  }) {
    const fileInput = useRef(null);
    const [reading, setReading] = useState(false);
    const [fileError, setFileError] = useState("");
    const [fileNote, setFileNote] = useState("");
    const mounted = useRef(false);
    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);
    const disabled = Boolean(busy) || reading;
    async function readFile(event) {
      const file = event.target.files[0];
      event.target.value = "";
      if (!file) return;
      setFileError("");
      setFileNote("");
      const isText = /\.(md|txt)$/i.test(file.name);
      if (!isText && !/\.(pdf|docx|pptx)$/i.test(file.name)) {
        setFileError(
          "支持 TXT、Markdown、PDF、Word（.docx）和 PowerPoint（.pptx）。",
        );
        return;
      }
      if (file.size > (isText ? 96 * 1024 : 8 * 1024 * 1024)) {
        setFileError(
          isText
            ? "文本文件超过 96 KB，请摘取需要的内容。"
            : "文稿超过 8 MB，请选择较小的文件。",
        );
        return;
      }
      setReading(true);
      try {
        let value,
          truncated = false;
        if (isText) {
          value = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () =>
              reject(new Error("文件读取失败，可以直接粘贴材料。"));
            reader.readAsText(file, "utf-8");
          });
        } else {
          const form = new FormData();
          form.append("file", file);
          const result = await send(agentId, "/brainstorm/materials/extract", {
            method: "POST",
            body: form,
          });
          value = result.text;
          truncated = result.truncated;
        }
        if (!mounted.current) return;
        const joined = [materials, value].filter(Boolean).join("\n\n");
        if (joined.length > MATERIAL_LIMIT)
          setFileError("材料超过 24000 字，请摘取相关片段后粘贴。");
        else {
          onMaterials(joined);
          setFileNote(
            truncated
              ? "已导入文稿节选，超出提取上限的内容已截断。可以在材料框内调整。"
              : "已导入 " + file.name,
          );
        }
      } catch (e) {
        if (mounted.current)
          setFileError(e.message || "文件读取失败，可以直接粘贴材料。");
      } finally {
        if (mounted.current) setReading(false);
      }
    }
    return h(
      "section",
      { className: "bs-panel" },
      h("label", { htmlFor: "bs-topic", className: "bs-label" }, "讨论主题"),
      h(Input.TextArea, {
        id: "bs-topic",
        value: topic,
        rows: 3,
        maxLength: TOPIC_LIMIT,
        placeholder: "写下一个问题、尚未成形的想法，或你面临的选择…",
        disabled,
        onChange: (e) => onTopic(e.target.value),
      }),
      h(
        "div",
        { className: "bs-star-group" },
        h("span", null, "试试这些问题"),
        STARTERS.map(([label, example]) =>
          h(
            "button",
            {
              type: "button",
              className: "bs-suggestion",
              key: label,
              title: example,
              disabled,
              onClick: () => onTopic(example),
            },
            label,
          ),
        ),
      ),
      h(
        "details",
        { className: "bs-materials" },
        h("summary", null, "补充材料（可选）"),
        h(Input.TextArea, {
          "aria-label": "补充材料",
          value: materials,
          rows: 5,
          maxLength: MATERIAL_LIMIT,
          disabled,
          onChange: (e) => {
            onMaterials(e.target.value);
            setFileError("");
            setFileNote("");
          },
          placeholder: "粘贴希望讨论时参考的原文或背景资料",
        }),
        h(
          "div",
          { className: "bs-attach" },
          h(
            Button,
            {
              size: "small",
              disabled,
              icon: icon("PaperClipOutlined"),
              onClick: () => fileInput.current.click(),
            },
            reading ? "正在读取…" : "导入文件",
          ),
          h(
            "small",
            null,
            "TXT / MD / PDF / DOCX / PPTX · " +
              materials.length +
              " / " +
              MATERIAL_LIMIT +
              " 字",
          ),
        ),
        h("input", {
          type: "file",
          accept: ".txt,.md,.pdf,.docx,.pptx",
          hidden: true,
          ref: fileInput,
          "aria-label": "选择材料文件",
          onChange: readFile,
        }),
        fileNote && h("p", { role: "status", className: "bs-muted" }, fileNote),
        fileError &&
          h("p", { role: "alert", className: "bs-alert" }, fileError),
      ),
      h(
        "div",
        { className: "bs-actions" },
        h(
          Button,
          {
            className: "bs-start",
            type: "primary",
            disabled: disabled || !topic.trim(),
            loading: busy === "start",
            "aria-label": "开始讨论",
            onClick: onStart,
            icon: icon("ArrowRightOutlined"),
          },
          "开始讨论",
        ),
      ),
    );
  }

  function Discussion({ session, answer, onAnswer, busy, onAction }) {
    const turns = session.turns;
    const current = turns[turns.length - 1];
    const disabled = Boolean(busy);
    return h(
      host.React.Fragment,
      null,
      h(
        "section",
        { className: "bs-panel" },
        h("div", { className: "bs-meta" }, "讨论主题"),
        h(
          "h2",
          {
            className: "bs-topic",
            style: { fontSize: "calc(21px * var(--app-font-scale,1))" },
          },
          session.topic,
        ),
        session.materials &&
          h(
            "details",
            { className: "bs-materials" },
            h("summary", null, "查看补充材料"),
            h("div", { className: "bs-readout" }, session.materials),
          ),
      ),
      session.summary &&
        h(
          "section",
          { className: "bs-panel bs-summary" },
          h("h2", null, "讨论总结"),
          markdown(session.summary),
        ),
      current &&
        h(
          "section",
          { className: "bs-panel bs-question-panel", "aria-label": "当前提问" },
          h(
            "div",
            { className: "bs-round" },
            h("i", { "aria-hidden": true }),
            "第 " + turns.length + " 轮 · " + MODES[current.mode],
          ),
          h("p", { className: "bs-question" }, current.question),
          current.answer &&
            h("div", { className: "bs-answer bs-readout" }, current.answer),
          h(
            "label",
            { className: "bs-label", htmlFor: "bs-answer" },
            "你的想法",
          ),
          h(Input.TextArea, {
            id: "bs-answer",
            rows: 3,
            value: answer,
            maxLength: ANSWER_LIMIT,
            disabled,
            onChange: (e) => onAnswer(e.target.value),
            placeholder: current.answer
              ? "也可以在已有回答上补充…"
              : "写下你的回答，也可以直接换个视角或自由发散…",
          }),
          h(
            "div",
            { className: "bs-actions" },
            h(
              "div",
              { className: "bs-row" },
              ["deepen", "reframe", "diverge"].map((mode) =>
                h(
                  Button,
                  {
                    key: mode,
                    "aria-label": MODES[mode],
                    type: mode === "deepen" ? "primary" : "default",
                    disabled:
                      disabled ||
                      (mode === "deepen" && !(answer.trim() || current.answer)),
                    loading: busy === mode,
                    onClick: () => onAction(mode),
                  },
                  MODES[mode],
                ),
              ),
            ),
            h(
              Button,
              {
                type: "text",
                disabled:
                  disabled || Boolean(session.summary && !answer.trim()),
                loading: busy === "summary",
                "aria-label": "生成总结",
                onClick: () => onAction("summary"),
                icon: icon("FileTextOutlined"),
              },
              "生成总结",
            ),
          ),
        ),
      turns.length > 1 &&
        h(
          "section",
          { className: "bs-panel" },
          h("h2", null, "讨论记录"),
          h(
            "ol",
            { className: "bs-discussion" },
            turns
              .slice(0, -1)
              .map((turn, index) =>
                h(
                  "li",
                  { key: index },
                  h(
                    "div",
                    { className: "bs-meta" },
                    "第 " + (index + 1) + " 轮 · " + MODES[turn.mode],
                  ),
                  h("p", { className: "bs-past-question" }, turn.question),
                  h(
                    "div",
                    { className: "bs-answer bs-readout" },
                    turn.answer || "本轮未作答",
                  ),
                ),
              ),
          ),
        ),
    );
  }

  function Workbench({ agentId }) {
    const [sessions, setSessions] = useState([]);
    const [session, setSession] = useState(null);
    const [topic, setTopic] = useState("");
    const [materials, setMaterials] = useState("");
    const [drafts, setDrafts] = useState({});
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const [listError, setListError] = useState("");
    const [listLoading, setListLoading] = useState(true);
    const listSeq = useRef(0);
    const working = useRef(false);
    const retry = useRef(null);
    const answer = session ? drafts[session.id] || "" : "";

    async function reload() {
      const seq = ++listSeq.current;
      setListLoading(true);
      setListError("");
      try {
        const data = await request(agentId, "");
        if (listSeq.current === seq)
          setSessions((old) => mergeHistory(old, data.sessions));
      } catch (e) {
        if (listSeq.current === seq) setListError(e.message);
      } finally {
        if (listSeq.current === seq) setListLoading(false);
      }
    }
    useEffect(() => {
      reload();
      return () => {
        listSeq.current++;
      };
    }, []);

    function updateSession(next) {
      setSession(next);
      const row = {
        id: next.id,
        topic: next.topic,
        updated_at: next.updated_at,
        revision: next.revision,
        turn_count: next.turns.length,
        has_summary: Boolean(next.summary),
      };
      setSessions((old) => mergeHistory(old, [row]));
    }

    async function open(id) {
      if (working.current || session?.id === id) return;
      working.current = true;
      setBusy("open");
      setError("");
      try {
        setSession(await request(agentId, "/" + encodeURIComponent(id)));
      } catch (e) {
        setError(e.message);
      } finally {
        working.current = false;
        setBusy("");
      }
    }

    function onAnswer(value) {
      setDrafts((old) => ({ ...old, [session.id]: value }));
    }

    async function action(mode) {
      if (working.current) return;
      working.current = true;
      setBusy(mode);
      setError("");
      try {
        const start = mode === "start";
        const path = start
          ? ""
          : "/" +
            encodeURIComponent(session.id) +
            (mode === "summary" ? "/summary" : "/turns");
        const body = start
          ? { topic: topic.trim(), materials: materials.trim() }
          : {
              revision: session.revision,
              answer: answer.trim(),
              ...(mode === "summary" ? {} : { mode }),
            };
        const key = JSON.stringify([path, body]);
        if (retry.current?.key !== key)
          retry.current = { key, id: requestId() };
        const next = await request(agentId, path, {
          ...body,
          request_id: retry.current.id,
        });
        retry.current = null;
        updateSession(next);
        if (start) {
          setTopic("");
          setMaterials("");
        } else onAnswer("");
      } catch (e) {
        if (e.status === 409 && session) {
          try {
            updateSession(
              await request(agentId, "/" + encodeURIComponent(session.id)),
            );
            setError("讨论已有更新，已载入最新记录。请核对后继续。");
          } catch (reloadError) {
            setError(reloadError.message);
          }
        } else setError(e.message);
      } finally {
        working.current = false;
        setBusy("");
      }
    }

    return h(
      "main",
      { className: "brainstorm-app" },
      h("style", null, css),
      h(
        "div",
        { className: "bs-shell" },
        h(
          "header",
          { className: "bs-header" },
          h(
            "span",
            { className: "bs-brand-icon", "aria-hidden": true },
            icon("BranchesOutlined") || "✳",
          ),
          h(
            "div",
            null,
            h("h1", null, "头脑风暴"),
            h(
              "p",
              { className: "bs-sub" },
              "从一个问题开始，每轮沿着你的回答继续追问，也可以随时换个角度。",
            ),
          ),
        ),
        h(
          "div",
          { className: "bs-grid" },
          h(
            "div",
            { className: "bs-main", "aria-busy": Boolean(busy) },
            error && h("div", { role: "alert", className: "bs-alert" }, error),
            session
              ? h(Discussion, {
                  session,
                  answer,
                  onAnswer,
                  busy,
                  onAction: action,
                })
              : h(NewDiscussion, {
                  agentId,
                  topic,
                  onTopic: setTopic,
                  materials,
                  onMaterials: setMaterials,
                  busy,
                  onStart: () => action("start"),
                }),
          ),
          h(History, {
            sessions,
            current: session?.id,
            busy,
            error: listError,
            loading: listLoading,
            onOpen: open,
            onReload: reload,
            onNew: () => {
              setSession(null);
              setError("");
            },
          }),
        ),
      ),
    );
  }

  function AppRoot() {
    const agent = host.useSelectedAgent ? host.useSelectedAgent() : null;
    const agentId = agent?.id || host.getSelectedAgentId?.() || "default";
    return h(Workbench, { key: agentId, agentId });
  }

  app.registerRoutes("brainstorm", [
    {
      path: "/apps/brainstorm",
      component: AppRoot,
      label: "头脑风暴",
      title: "头脑风暴",
      icon: "✳",
    },
  ]);
})();
