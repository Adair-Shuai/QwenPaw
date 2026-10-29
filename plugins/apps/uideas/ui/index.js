/**
 * UIdeas — 科研灵感管理（UGSci 内置 PawApp）
 *
 * 主动思考型记忆体：记录 → 整理(L1) → 扩充(L2) → 主动建议(L3)
 *
 * React / antd 来自 window.QwenPaw.host（无 bundler）。自注册路由
 * /apps/uideas。数据与后端 /api/uideas/* 交互，实时事件经 SSE
 * /uideas/stream 推送。
 */
(function () {
  var QwenPaw = window.QwenPaw;
  if (!QwenPaw || !QwenPaw.host || !QwenPaw.registerRoutes) {
    console.error("[uideas] window.QwenPaw not ready — cannot register.");
    return;
  }

  var host = QwenPaw.host;
  var React = host.React;
  var antd = host.antd;
  var h = React.createElement;

  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;

  var Button = antd.Button;
  var Input = antd.Input;
  var Modal = antd.Modal;
  var Tag = antd.Tag;
  var Card = antd.Card;
  var Space = antd.Space;
  var Tooltip = antd.Tooltip;
  var message = antd.message;
  var Spin = antd.Spin;
  var Popconfirm = antd.Popconfirm;
  var Switch = antd.Switch;
  var InputNumber = antd.InputNumber;
  var Select = antd.Select;
  var Alert = antd.Alert;

  // Self-contained stylesheet: the host loads this single shipped entry.
  var WORKSPACE_CSS = `
.uideas{--ui-accent:#227563;--ui-soft:#edf5f1;--ui-ink:#243c35;--ui-muted:#728078;--ui-line:#e2e8e2;--ui-paper:#fff;--ui-bg:#f6f7f3;color:var(--ui-ink);background:var(--ui-bg);min-height:calc(100vh - 32px);border-radius:18px;padding:30px 34px 36px;box-sizing:border-box;container-type:inline-size}
.uideas *{box-sizing:border-box}.uideas h1,.uideas h2,.uideas h3,.uideas p{margin:0}.uideas button{cursor:pointer;font-family:inherit}.uideas button:disabled{cursor:not-allowed}.uideas button:focus-visible{outline:3px solid #75bfa9;outline-offset:3px}
.uideas-head{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:32px;padding-right:64px}.uideas-brand{display:flex;gap:12px;align-items:center}.uideas-logo{width:42px;height:42px;border-radius:14px;background:var(--ui-accent);color:white;display:grid;place-items:center;font-size:25px}.uideas-wordmark{font-size:22px;letter-spacing:-.6px;font-weight:750}.uideas-subbrand{font-size:11px;letter-spacing:2px;color:var(--ui-muted)}.uideas-head-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.uideas-live{font-size:12px;color:var(--ui-muted);margin-right:10px}.uideas-live:before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#65a28c;margin-right:7px}.uideas-live.off:before{background:#c28c44}
.uideas-intro{margin-bottom:27px}.uideas-eyebrow{font-size:11px;letter-spacing:2px;color:var(--ui-accent);font-weight:650;margin-bottom:10px}.uideas h1{text-wrap:balance;font-size:30px;font-weight:650;letter-spacing:-1px;line-height:1.4}.uideas-intro p{font-size:13px;color:var(--ui-muted);margin-top:9px;line-height:1.8}.uideas-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:24px}.uideas-stat{background:var(--ui-paper);border:1px solid var(--ui-line);border-radius:12px;padding:17px 19px;text-align:left;color:var(--ui-ink)}.uideas-stat:hover{border-color:var(--ui-accent)}.uideas-stat-label{display:flex;justify-content:space-between;color:var(--ui-muted);font-size:12px}.uideas-stat-value{font-size:29px;line-height:1.5;font-weight:600;margin-top:4px}.uideas-stat-value small{font-size:11px;font-weight:400;margin-left:7px;color:var(--ui-muted)}
.uideas-nav{display:flex;gap:24px;border-bottom:1px solid var(--ui-line);margin-bottom:24px;overflow:auto}.uideas-nav button{background:none;border:0;border-bottom:2px solid transparent;padding:12px 1px 14px;color:var(--ui-muted);font-size:14px;white-space:nowrap}.uideas-nav button[aria-selected=true]{color:var(--ui-accent);font-weight:650;border-color:var(--ui-accent)}.uideas-nav-count{font-size:10px;padding:2px 6px;background:var(--ui-soft);border-radius:5px;margin-left:7px}.uideas-workspace{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:24px;align-items:start}.uideas-main{min-width:0}.uideas-panel{background:var(--ui-paper);border:1px solid var(--ui-line);border-radius:14px;padding:20px}.uideas-composer{margin-bottom:26px;border-color:#ccdcd2}.uideas-composer-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:12px}.uideas h2{font-size:16px;font-weight:650}.uideas-composer textarea.ant-input{line-height:1.8;background:transparent;border:0;padding:0;box-shadow:none!important}.uideas-compose-bottom{border-top:1px solid var(--ui-line);padding-top:13px;margin-top:14px;display:flex;gap:12px;justify-content:space-between;align-items:center;flex-wrap:wrap}.uideas-hint{font-size:12px;color:var(--ui-muted);line-height:1.8}.uideas-link{background:none;border:0;padding:0;color:var(--ui-accent);font-size:12px;text-align:left}.uideas-link:hover{text-decoration:underline}
.uideas-section-head{display:flex;align-items:center;gap:12px;justify-content:space-between;margin-bottom:16px}.uideas-section-head p{color:var(--ui-muted);font-size:12px;line-height:1.7;margin-top:5px}.uideas-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:13px}.uideas-search{flex:1;min-width:160px}.uideas-filters{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:17px}.uideas-filter{border:1px solid transparent;background:transparent;border-radius:7px;color:var(--ui-muted);padding:5px 10px;font-size:12px}.uideas-filter[aria-pressed=true]{color:var(--ui-accent);background:var(--ui-soft);border-color:#d1e3d8}.uideas-filter small{font-size:10px;margin-left:6px;opacity:.75}.uideas-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}.uideas-grid.list{grid-template-columns:1fr}.uideas .ant-btn-link{height:auto;max-width:100%;white-space:normal;text-align:left}.uideas .ant-card{background:var(--ui-paper);border-color:var(--ui-line)}.uideas-card{min-width:0;height:100%}.uideas-card .ant-card-body{padding:18px}.uideas-card .ant-card-actions{background:transparent}.uideas-card .ant-card-actions>li{margin:6px 0}.uideas-card .ant-card-actions .ant-btn{font-size:12px;padding:0 4px}.uideas-title{color:var(--ui-ink);background:none;border:0;padding:0;font-size:15px;font-weight:650;line-height:1.7;text-align:left;overflow-wrap:anywhere}.uideas-title:hover{color:var(--ui-accent)}.uideas-readout{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.9;font-size:14px}
.uideas-aside{display:grid;gap:16px}.uideas-aside h3{font-size:13px;font-weight:650;margin-bottom:16px}.uideas-step{display:flex;gap:12px;margin-bottom:19px}.uideas-step:last-child{margin-bottom:0}.uideas-step-index{border:1px solid var(--ui-line);border-radius:50%;width:24px;height:24px;flex:none;display:grid;place-items:center;font-size:10px;color:var(--ui-accent);background:var(--ui-soft)}.uideas-step strong{font-size:12px;font-weight:600}.uideas-step p{font-size:11px;line-height:1.8;color:var(--ui-muted);margin-top:3px}.uideas-note{background:var(--ui-soft);border-color:transparent}.uideas-note p{color:var(--ui-muted);font-size:12px;line-height:1.9}.uideas-aside-row{display:flex;justify-content:space-between;gap:12px;font-size:12px;margin:13px 0}.uideas-aside-row span{color:var(--ui-muted)}.uideas-aside-row strong{font-weight:500}
.uideas-empty{border:1px dashed var(--ui-line);border-radius:14px;text-align:center;padding:34px 20px;background:var(--ui-paper)}.uideas-empty-icon{width:46px;height:46px;margin:0 auto 14px;display:grid;place-items:center;border-radius:14px;background:var(--ui-soft);color:var(--ui-accent);font-size:23px}.uideas-empty h3{font-size:15px;margin-bottom:8px}.uideas-empty p{font-size:12px;color:var(--ui-muted);line-height:1.9;max-width:360px;margin:0 auto 18px}.uideas-starters{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.uideas-starters button{border:1px solid var(--ui-line);background:var(--ui-bg);border-radius:8px;padding:8px 12px;font-size:12px;color:var(--ui-accent)}.uideas-pager{display:flex;justify-content:center;align-items:center;gap:14px;margin-top:22px;color:var(--ui-muted);font-size:12px}.uideas-cluster-member{display:block;width:100%;border:0;border-top:1px solid var(--ui-line);background:none;padding:11px 0;color:var(--ui-ink);font-size:12px;text-align:left;line-height:1.7}.uideas-todo{display:flex;gap:14px;align-items:start;margin-bottom:12px}.uideas-todo-content{flex:1;min-width:0}.uideas-todo h3{font-size:14px;line-height:1.8;margin-bottom:6px}.uideas-todo.done h3{text-decoration:line-through;color:var(--ui-muted)}.uideas-job{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;padding:11px 14px;margin-bottom:10px;border-radius:8px;background:var(--ui-soft);font-size:12px}.uideas-modal .ant-modal-body{max-height:70vh;overflow:auto;padding-right:4px}
.uideas[data-dark=true]{--ui-accent:#87c9b3;--ui-soft:#263c34;--ui-ink:#e4ece7;--ui-muted:#9baea4;--ui-line:#34463d;--ui-paper:#1d2c25;--ui-bg:#17231d}.uideas[data-dark=true] .uideas-logo{color:#17231d}
@container (max-width:950px){.uideas-workspace{grid-template-columns:minmax(0,1fr) 225px;gap:18px}.uideas-grid{grid-template-columns:1fr}.uideas-stat{padding:14px}.uideas-head{padding-right:40px}}
@container (max-width:720px){.uideas-workspace{grid-template-columns:1fr}.uideas-aside{grid-template-columns:repeat(2,minmax(0,1fr))}.uideas-aside .uideas-note{display:none}.uideas-head{align-items:start;padding-right:0}.uideas-head-actions{justify-content:end}.uideas-live{display:none}.uideas h1{font-size:25px}.uideas-stat-value{font-size:24px}}
@container (max-width:500px){.uideas-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.uideas-grid,.uideas-aside{grid-template-columns:1fr}.uideas-head{flex-direction:column;gap:16px;margin-bottom:24px}.uideas-nav{gap:0;justify-content:space-between}.uideas-nav button{font-size:13px}.uideas-nav-count{margin-left:4px}.uideas-tools .ant-select{flex:1;min-width:120px}.uideas-search{flex-basis:100%}.uideas-todo{flex-wrap:wrap}}
@media(max-width:700px){.uideas{padding:20px 16px;border-radius:10px}}
`;

  // ── API helpers ──────────────────────────────────────────────────
  function apiUrl(path) {
    return host.getApiUrl(path);
  }

  function authToken() {
    return host.getApiToken ? host.getApiToken() : "";
  }

  function authHeaders() {
    var headers = {};
    var token = authToken();
    if (token) headers["Authorization"] = "Bearer " + token;
    return headers;
  }

  async function apiFetch(path, opts) {
    opts = opts || {};
    var url = apiUrl(path);
    var headers = Object.assign({}, authHeaders(), opts.headers || {});
    if (
      opts.body &&
      typeof opts.body === "object" &&
      !(opts.body instanceof FormData)
    ) {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.body);
    }
    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, 25000);
    var resp;
    try {
      resp = await fetch(url, {
        method: opts.method || "GET",
        headers: headers,
        body: opts.body,
        signal: controller.signal,
      });
    } catch (e) {
      if (e.name === "AbortError")
        throw new Error("请求超时，请检查连接后重试");
      throw e;
    } finally {
      clearTimeout(timer);
    }
    if (!resp.ok) {
      var text = await resp.text().catch(function () {
        return "";
      });
      throw new Error(text || "HTTP " + resp.status);
    }
    if (resp.status === 204) return null;
    return resp.json();
  }

  function sseUrl(path) {
    var url = apiUrl(path);
    var token = authToken();
    if (token) {
      url +=
        (url.indexOf("?") >= 0 ? "&" : "?") +
        "token=" +
        encodeURIComponent(token);
    }
    return url;
  }

  // ── API wrapper ──────────────────────────────────────────────────
  var API = {
    listIdeas: function (params) {
      var qs = new URLSearchParams(params || {}).toString();
      return apiFetch("/uideas/ideas" + (qs ? "?" + qs : ""));
    },
    createIdea: function (data) {
      return apiFetch("/uideas/ideas", { method: "POST", body: data });
    },
    updateIdea: function (id, data) {
      return apiFetch("/uideas/ideas/" + id, { method: "PATCH", body: data });
    },
    deleteIdea: function (id) {
      return apiFetch("/uideas/ideas/" + id, { method: "DELETE" });
    },
    organize: function () {
      return apiFetch("/uideas/analyze", { method: "POST" });
    },
    expand: function (id) {
      return apiFetch("/uideas/expand/" + id, { method: "POST" });
    },
    think: function () {
      return apiFetch("/uideas/think", { method: "POST" });
    },
    listSuggestions: function (params) {
      var qs = new URLSearchParams(params || {}).toString();
      return apiFetch("/uideas/suggestions" + (qs ? "?" + qs : ""));
    },
    updateSuggestion: function (id, data) {
      return apiFetch("/uideas/suggestions/" + id, {
        method: "PATCH",
        body: data,
      });
    },
    listClusters: function () {
      return apiFetch("/uideas/clusters");
    },
    getMeta: function () {
      return apiFetch("/uideas/meta");
    },
    updateMeta: function (data) {
      return apiFetch("/uideas/meta", { method: "PATCH", body: data });
    },
  };

  // ── Helpers ──────────────────────────────────────────────────────
  var IDEA_STATUS = {
    raw: { label: "待整理", color: "gold" },
    organized: { label: "已整理", color: "blue" },
    expanded: { label: "已扩充", color: "purple" },
    archived: { label: "已归档", color: "green" },
  };
  var SUG_STATUS = {
    new: { label: "新建议", color: "gold" },
    accepted: { label: "已采纳", color: "green" },
    dismissed: { label: "已忽略", color: "default" },
  };

  function fmtDate(s) {
    if (!s) return "";
    try {
      var d = new Date(s);
      if (!Number.isFinite(d.getTime())) return "时间未知";
      var now = new Date();
      var diff = now.getTime() - d.getTime();
      if (diff < 60 * 1000) return "刚刚";
      if (diff < 3600 * 1000) return Math.floor(diff / 60000) + " 分钟前";
      if (diff < 86400 * 1000 && now.getDate() === d.getDate()) {
        return d.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return (
        d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) +
        " " +
        d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      );
    } catch (e) {
      return "";
    }
  }

  function splitTags(v) {
    return (v || "")
      .split(/[,，、;；\s]+/)
      .map(function (t) {
        return t.trim();
      })
      .filter(Boolean);
  }

  function parseInlineMarkers(text) {
    var tags = [];
    var experiments = [];
    var tagRe = /(^|[^\w])#([^\s#@，。；;,.!?！？]+)/g;
    var expRe = /(^|[^\w])@([^\s#@，。；;,.!?！？]+)/g;
    var match;
    while ((match = tagRe.exec(text || ""))) tags.push(match[2]);
    while ((match = expRe.exec(text || ""))) experiments.push(match[2]);
    return {
      tags: Array.from(new Set(tags)),
      experiments: Array.from(new Set(experiments)),
    };
  }

  function errorText(error, fallback) {
    var text = error && error.message ? error.message : "";
    try {
      var parsed = JSON.parse(text);
      if (parsed && parsed.detail)
        return typeof parsed.detail === "string"
          ? parsed.detail
          : "输入格式有误，请检查后重试";
    } catch (e) {
      /* keep original text */
    }
    return text || fallback || "操作失败";
  }

  function ideaTitle(idea) {
    return (
      idea.title ||
      (idea.content || "").slice(0, 40) +
        ((idea.content || "").length > 40 ? "…" : "")
    );
  }

  function renderPlain(text) {
    if (!text) return null;
    return text.split("\n").map(function (line, i) {
      return h(
        "div",
        {
          key: "l" + i,
          style: {
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.7,
          },
        },
        line || "\u00a0",
      );
    });
  }

  function EmptyState(props) {
    return h(
      "div",
      { className: "uideas-empty" },
      h(
        "div",
        { className: "uideas-empty-icon", "aria-hidden": true },
        props.icon || "✧",
      ),
      h("h3", null, props.title),
      h("p", null, props.body),
      props.children,
    );
  }
  function IdeaComposer(props) {
    var form = props.draft,
      setForm = props.setDraft;
    var [details, setDetails] = useState(false),
      [submitting, setSubmitting] = useState(false);
    var lock = useRef(false),
      input = useRef(null);
    useEffect(
      function () {
        if (props.focusKey && input.current) input.current.focus();
      },
      [props.focusKey],
    );
    function change(key, value) {
      setForm(function (old) {
        return Object.assign({}, old, { [key]: value });
      });
    }
    async function submit() {
      if (lock.current || (!form.title.trim() && !form.content.trim())) return;
      lock.current = true;
      setSubmitting(true);
      var markers = parseInlineMarkers(form.title + "\n" + form.content);
      try {
        await API.createIdea({
          title: form.title.trim(),
          content: form.content.trim(),
          tags: Array.from(new Set(splitTags(form.tags).concat(markers.tags))),
          related_experiments: markers.experiments,
        });
        setForm({ title: "", content: "", tags: "" });
        props.onCreated();
        message.success("灵感已记录");
      } catch (e) {
        message.error("记录失败：" + errorText(e));
      } finally {
        lock.current = false;
        setSubmitting(false);
      }
    }
    return h(
      "section",
      { className: "uideas-panel uideas-composer", "aria-label": "记录灵感" },
      h(
        "div",
        { className: "uideas-composer-head" },
        h("h2", null, "此刻，有什么新想法？"),
        h("span", { className: "uideas-hint" }, "随手记下，慢慢成形"),
      ),
      h(Input.TextArea, {
        ref: input,
        "aria-label": "灵感内容",
        placeholder: "一个观察、一个疑问，或一个值得验证的假设…",
        value: form.content,
        disabled: submitting,
        autoSize: { minRows: 3, maxRows: 9 },
        maxLength: 10000,
        onChange: function (e) {
          change("content", e.target.value);
        },
        onKeyDown: function (e) {
          if (
            e.key === "Enter" &&
            (e.ctrlKey || e.metaKey) &&
            !e.nativeEvent.isComposing
          ) {
            e.preventDefault();
            submit();
          }
        },
      }),
      details
        ? h(
            "div",
            { style: { display: "grid", gap: 10, marginTop: 12 } },
            h(Input, {
              "aria-label": "灵感标题",
              placeholder: "标题（可选）",
              value: form.title,
              maxLength: 200,
              disabled: submitting,
              onChange: function (e) {
                change("title", e.target.value);
              },
            }),
            h(Input, {
              "aria-label": "灵感标签",
              placeholder: "标签，以逗号分隔（可选）",
              value: form.tags,
              disabled: submitting,
              onChange: function (e) {
                change("tags", e.target.value);
              },
            }),
          )
        : null,
      h(
        "div",
        { className: "uideas-compose-bottom" },
        h(
          "div",
          null,
          h(
            "button",
            {
              type: "button",
              className: "uideas-link",
              onClick: function () {
                setDetails(!details);
              },
            },
            details ? "收起标题与标签" : "＋ 标题与标签",
          ),
          h(
            "div",
            { className: "uideas-hint", style: { marginTop: 4 } },
            "支持 #标签、@实验编号 · Enter 换行",
          ),
        ),
        h(
          Button,
          {
            type: "primary",
            loading: submitting,
            disabled: !form.content.trim() && !form.title.trim(),
            onClick: submit,
          },
          "记录灵感 · Ctrl/⌘ ↵",
        ),
      ),
    );
  }

  // ── IdeaCard: 灵感卡片 ──────────────────────────────────────────
  function IdeaCard(props) {
    var idea = props.idea;
    var onChanged = props.onChanged;
    var expanding = !!props.busy["expand:" + idea.id];
    var [editOpen, setEditOpen] = useState(false);
    var [showExpansion, setShowExpansion] = useState(false);
    var status = IDEA_STATUS[idea.status] || IDEA_STATUS.raw;

    function toggleArchive() {
      API.updateIdea(idea.id, {
        status:
          idea.status === "archived"
            ? idea.status_before_archive || "raw"
            : "archived",
      })
        .then(function () {
          message.success(idea.status === "archived" ? "已恢复" : "已归档");
          if (onChanged) onChanged();
        })
        .catch(function (e) {
          message.error(errorText(e, "操作失败"));
        });
    }

    function remove() {
      API.deleteIdea(idea.id)
        .then(function () {
          message.success("已删除");
          if (onChanged) onChanged();
        })
        .catch(function (e) {
          message.error(errorText(e, "删除失败"));
        });
    }

    function doExpand() {
      props.onJob("expand", idea.id);
    }

    var actions = [];
    if (idea.status !== "archived") {
      actions.push(
        h(
          Tooltip,
          { key: "expand", title: "结合现有想法，补充研究方法与验证思路" },
          h(
            Button,
            {
              type: "text",
              size: "small",
              loading: expanding,
              onClick: doExpand,
            },
            idea.expansion ? "再扩充" : "扩充",
          ),
        ),
      );
    }
    if (idea.expansion) {
      actions.push(
        h(
          Button,
          {
            key: "toggle-exp",
            type: "text",
            size: "small",
            onClick: function () {
              setShowExpansion(!showExpansion);
            },
          },
          showExpansion ? "收起" : "展开",
        ),
      );
    }
    actions.push(
      h(
        Button,
        {
          key: "edit",
          type: "text",
          size: "small",
          onClick: function () {
            setEditOpen(true);
          },
        },
        "编辑",
      ),
    );
    actions.push(
      h(
        Button,
        {
          key: "archive",
          type: "text",
          size: "small",
          style: { color: idea.status === "archived" ? "#52c41a" : undefined },
          onClick: toggleArchive,
        },
        idea.status === "archived" ? "恢复" : "归档",
      ),
    );
    actions.push(
      h(
        Popconfirm,
        {
          key: "del",
          title: "确定删除这条灵感吗？",
          okText: "删除",
          cancelText: "取消",
          okButtonProps: { danger: true },
          onConfirm: remove,
        },
        h(Button, { type: "text", size: "small", danger: true }, "删除"),
      ),
    );

    return h(
      Card,
      {
        className: "uideas-card",
        size: "small",
        style: {
          borderRadius: 10,
          opacity: idea.status === "archived" ? 0.72 : 1,
          marginBottom: 12,
        },
        actions: actions,
      },
      h(
        "div",
        { style: { marginBottom: 6 } },
        h(Tag, { color: status.color }, status.label),
        h(
          "span",
          {
            style: {
              fontSize: 12,
              color: "var(--ui-muted, currentColor)",
              marginLeft: 8,
            },
          },
          fmtDate(idea.updated_at || idea.created_at),
        ),
      ),
      h(
        "button",
        {
          type: "button",
          className: "uideas-title",
          onClick: function () {
            props.onOpen(idea.id);
          },
        },
        ideaTitle(idea),
      ),
      h(
        "div",
        {
          style: {
            color: "var(--ui-ink, currentColor)",
            fontSize: 13,
            marginBottom: 8,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.7,
          },
        },
        (idea.content || "").length > 160
          ? idea.content.slice(0, 160) + "…"
          : idea.content,
      ),
      idea.tags && idea.tags.length
        ? h(
            "div",
            { style: { marginBottom: 4 } },
            idea.tags.map(function (t) {
              return h(
                "button",
                {
                  type: "button",
                  className: "uideas-filter",
                  key: t,
                  onClick: function () {
                    props.onTag(t);
                  },
                  "aria-label": "筛选标签 " + t,
                },
                "#" + t,
              );
            }),
          )
        : null,
      idea.related_experiments && idea.related_experiments.length
        ? h(
            "div",
            { style: { marginBottom: 4 } },
            h(
              "span",
              {
                style: {
                  fontSize: 12,
                  color: "var(--ui-muted, currentColor)",
                  marginRight: 6,
                },
              },
              "关联实验",
            ),
            idea.related_experiments.map(function (exp) {
              return h(
                Tag,
                { key: exp, color: "cyan", style: { marginBottom: 4 } },
                "@" + exp,
              );
            }),
          )
        : null,
      idea.expansion && showExpansion
        ? h(
            "div",
            {
              style: {
                marginTop: 8,
                padding: 10,
                borderRadius: 8,
                background: "rgba(114,46,209,0.06)",
                border: "1px solid rgba(114,46,209,0.2)",
              },
            },
            h(
              "div",
              { style: { fontSize: 12, fontWeight: 600, marginBottom: 4 } },
              "研究扩充 · 第 " + (idea.expansion_version || 1) + " 版",
            ),
            renderPlain(idea.expansion),
          )
        : null,
      h(EditIdeaModal, {
        idea: idea,
        open: editOpen,
        onClose: function () {
          setEditOpen(false);
        },
        onSaved: onChanged,
      }),
    );
  }

  // ── EditIdeaModal ───────────────────────────────────────────────
  function EditIdeaModal(props) {
    var idea = props.idea;
    var [form, setForm] = useState({
      title: "",
      content: "",
      tags: "",
      experiments: "",
    });
    var [saving, setSaving] = useState(false);

    useEffect(
      function () {
        if (props.open && idea) {
          setForm({
            title: idea.title || "",
            content: idea.content || "",
            tags: (idea.tags || []).join(", "),
            experiments: (idea.related_experiments || []).join(", "),
          });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [props.open, idea.id],
    );

    function save() {
      if (saving) return;
      if (!form.title.trim() && !form.content.trim()) {
        message.warning("请保留标题或内容");
        return;
      }
      var markers = parseInlineMarkers(form.title + "\n" + form.content);
      setSaving(true);
      API.updateIdea(idea.id, {
        title: form.title.trim(),
        content: form.content.trim(),
        tags: Array.from(new Set(splitTags(form.tags).concat(markers.tags))),
        related_experiments: Array.from(
          new Set(
            splitTags(form.experiments)
              .map(function (e) {
                return e.replace(/^@/, "");
              })
              .concat(markers.experiments),
          ),
        ),
      })
        .then(function () {
          message.success("已保存");
          props.onClose();
          if (props.onSaved) props.onSaved();
        })
        .catch(function (e) {
          message.error(errorText(e, "保存失败"));
        })
        .finally(function () {
          setSaving(false);
        });
    }

    function close() {
      if (saving) return;
      var dirty =
        form.title !== (idea.title || "") ||
        form.content !== (idea.content || "") ||
        form.tags !== (idea.tags || []).join(", ") ||
        form.experiments !== (idea.related_experiments || []).join(", ");
      if (dirty)
        Modal.confirm({
          title: "放弃未保存的修改？",
          okText: "放弃修改",
          cancelText: "继续编辑",
          onOk: props.onClose,
        });
      else props.onClose();
    }
    return h(
      Modal,
      {
        open: props.open,
        title: "编辑灵感",
        okText: "保存",
        cancelText: "取消",
        onCancel: close,
        onOk: save,
        confirmLoading: saving,
        width: 560,
        maskClosable: false,
      },
      h(Input, {
        value: form.title,
        onChange: function (e) {
          setForm(Object.assign({}, form, { title: e.target.value }));
        },
        "aria-label": "编辑标题",
        disabled: saving,
        maxLength: 200,
        placeholder: "标题",
        style: { marginBottom: 8 },
      }),
      h(Input.TextArea, {
        value: form.content,
        onChange: function (e) {
          setForm(Object.assign({}, form, { content: e.target.value }));
        },
        "aria-label": "编辑内容",
        disabled: saving,
        maxLength: 10000,
        placeholder: "内容",
        rows: 4,
        style: { marginBottom: 8 },
      }),
      h(Input, {
        value: form.tags,
        onChange: function (e) {
          setForm(Object.assign({}, form, { tags: e.target.value }));
        },
        "aria-label": "编辑标签",
        disabled: saving,
        placeholder: "标签，逗号分隔",
        style: { marginBottom: 8 },
      }),
      h(Input, {
        "aria-label": "关联实验",
        disabled: saving,
        value: form.experiments,
        onChange: function (e) {
          setForm(Object.assign({}, form, { experiments: e.target.value }));
        },
        placeholder: "关联实验，逗号分隔",
      }),
    );
  }

  function IdeaBoard(props) {
    var ideas = props.ideas,
      filter = props.filter;
    var [query, setQuery] = useState(""),
      [tag, setTag] = useState(""),
      [sort, setSort] = useState("updated"),
      [view, setView] = useState("grid"),
      [page, setPage] = useState(1);
    var filters = [
      ["active", "全部灵感"],
      ["raw", "待整理"],
      ["organized", "已整理"],
      ["expanded", "已扩充"],
      ["archived", "归档"],
    ];
    var tags = Array.from(
      new Set(
        ideas.flatMap(function (i) {
          return i.tags || [];
        }),
      ),
    ).sort();
    var filtered = ideas
      .filter(function (i) {
        var match =
          filter === "active" ? i.status !== "archived" : i.status === filter;
        var text = [i.title, i.content, i.expansion]
          .concat(i.tags || [], i.related_experiments || [])
          .join(" ")
          .toLocaleLowerCase();
        return (
          match &&
          (!tag || (i.tags || []).includes(tag)) &&
          text.includes(query.trim().toLocaleLowerCase())
        );
      })
      .sort(function (a, b) {
        return sort === "title"
          ? ideaTitle(a).localeCompare(ideaTitle(b), "zh-CN")
          : (
              b[sort === "created" ? "created_at" : "updated_at"] || ""
            ).localeCompare(
              a[sort === "created" ? "created_at" : "updated_at"] || "",
            );
      });
    useEffect(
      function () {
        setPage(1);
      },
      [query, tag, sort, filter],
    );
    var pages = Math.max(1, Math.ceil(filtered.length / 12)),
      current = Math.min(page, pages);
    function clear() {
      setQuery("");
      setTag("");
      props.setFilter("active");
    }
    return h(
      "div",
      null,
      h(IdeaComposer, {
        draft: props.draft,
        setDraft: props.setDraft,
        focusKey: props.focusKey,
        onCreated: function () {
          clear();
          props.onChanged();
        },
      }),
      h(
        "div",
        { className: "uideas-section-head" },
        h(
          "h2",
          null,
          filter === "archived" ? "灵感归档" : "我的灵感",
          h(
            "span",
            {
              className: "uideas-hint",
              style: { marginLeft: 10 },
              "aria-live": "polite",
            },
            filtered.length + " 条",
          ),
        ),
        h(
          Button,
          {
            disabled: !ideas.some(function (i) {
              return i.status !== "archived";
            }),
            loading: !!props.busy.analyze,
            onClick: function () {
              props.onJob("analyze");
            },
          },
          "✧ 整理研究方向",
        ),
      ),
      h(
        "div",
        { className: "uideas-tools" },
        h(Input, {
          className: "uideas-search",
          "aria-label": "搜索灵感",
          placeholder: "搜索内容、标签或实验…",
          prefix: "⌕",
          value: query,
          allowClear: true,
          onChange: function (e) {
            setQuery(e.target.value);
          },
        }),
        h(Select, {
          "aria-label": "按标签筛选",
          placeholder: "所有标签",
          allowClear: true,
          value: tag || undefined,
          style: { width: 130 },
          options: tags.map(function (t) {
            return { value: t, label: "#" + t };
          }),
          onChange: function (v) {
            setTag(v || "");
          },
        }),
        h(Select, {
          "aria-label": "灵感排序",
          value: sort,
          style: { width: 130 },
          options: [
            { value: "updated", label: "最近更新" },
            { value: "created", label: "最近记录" },
            { value: "title", label: "标题顺序" },
          ],
          onChange: setSort,
        }),
        h(
          Button,
          {
            "aria-label": view === "grid" ? "切换列表视图" : "切换卡片视图",
            onClick: function () {
              setView(view === "grid" ? "list" : "grid");
            },
          },
          view === "grid" ? "☷" : "▦",
        ),
      ),
      h(
        "div",
        { className: "uideas-filters" },
        filters.map(function (f) {
          return h(
            "button",
            {
              type: "button",
              key: f[0],
              className: "uideas-filter",
              "aria-pressed": filter === f[0],
              onClick: function () {
                props.setFilter(f[0]);
              },
            },
            f[1],
            h(
              "small",
              null,
              ideas.filter(function (i) {
                return f[0] === "active"
                  ? i.status !== "archived"
                  : i.status === f[0];
              }).length,
            ),
          );
        }),
        query || tag || filter !== "active"
          ? h(
              "button",
              { className: "uideas-link", onClick: clear },
              "清除筛选",
            )
          : null,
      ),
      !filtered.length
        ? h(
            EmptyState,
            {
              title: ideas.length
                ? "没有找到符合条件的灵感"
                : "好研究，从一个小小的疑问开始",
              body: ideas.length
                ? "试试其他关键词，或清除筛选查看全部未归档灵感。"
                : "不必先有完整方案。记下刚刚读到、观察到，或想验证的事情。",
            },
            ideas.length
              ? h(Button, { onClick: clear }, "清除筛选")
              : h(
                  "div",
                  { className: "uideas-starters" },
                  [
                    ["记录一个观察", "我观察到的现象是：\n可能的原因是："],
                    ["提出一个问题", "我想弄清楚：\n这个问题的重要性在于："],
                    ["构思一个实验", "我的假设是：\n可以通过这个实验验证："],
                  ].map(function (s) {
                    return h(
                      "button",
                      {
                        type: "button",
                        key: s[0],
                        onClick: function () {
                          props.onStarter(s[1]);
                        },
                      },
                      s[0],
                    );
                  }),
                ),
          )
        : h(
            "div",
            { className: "uideas-grid" + (view === "list" ? " list" : "") },
            filtered
              .slice((current - 1) * 12, current * 12)
              .map(function (idea) {
                return h(IdeaCard, {
                  key: idea.id,
                  idea: idea,
                  onChanged: props.onChanged,
                  onOpen: props.onOpen,
                  onTag: setTag,
                  onJob: props.onJob,
                  busy: props.busy,
                });
              }),
          ),
      pages > 1
        ? h(
            "div",
            { className: "uideas-pager" },
            h(
              Button,
              {
                disabled: current <= 1,
                onClick: function () {
                  setPage(current - 1);
                },
              },
              "上一页",
            ),
            h("span", null, current + " / " + pages),
            h(
              Button,
              {
                disabled: current >= pages,
                onClick: function () {
                  setPage(current + 1);
                },
              },
              "下一页",
            ),
          )
        : null,
    );
  }

  // ── SuggestionCard ──────────────────────────────────────────────
  function SuggestionCard(props) {
    var sug = props.suggestion;
    var ideaMap = props.ideaMap || {};
    var onChanged = props.onChanged;
    var st = SUG_STATUS[sug.status] || SUG_STATUS.new;
    var [pending, setPending] = useState(false);

    function setStatus(status) {
      if (pending) return;
      setPending(true);
      API.updateSuggestion(sug.id, { status: status })
        .then(function () {
          message.success(
            status === "accepted"
              ? "已采纳，并加入行动清单"
              : status === "new"
              ? "已恢复为待处理"
              : "已忽略",
          );
          if (onChanged) onChanged();
        })
        .catch(function (e) {
          message.error(errorText(e, "操作失败"));
        })
        .finally(function () {
          setPending(false);
        });
    }

    var sourceIdeas = (sug.source_idea_ids || [])
      .map(function (id) {
        return ideaMap[id];
      })
      .filter(Boolean);

    return h(
      Card,
      {
        size: "small",
        style: {
          borderRadius: 10,
          marginBottom: 12,
          borderColor:
            sug.status === "new" ? "rgba(250,173,20,0.45)" : undefined,
        },
      },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", marginBottom: 6 } },
        h(Tag, { color: st.color }, st.label),
        h(
          "span",
          { style: { fontSize: 12, color: "var(--ui-muted, currentColor)" } },
          fmtDate(sug.created_at),
        ),
      ),
      h(
        "div",
        {
          style: {
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 6,
            wordBreak: "break-word",
          },
        },
        sug.title,
      ),
      h(
        "div",
        {
          style: {
            fontSize: 13,
            color: "var(--ui-ink, currentColor)",
            marginBottom: 6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.7,
          },
        },
        sug.body,
      ),
      sug.rationale
        ? h(
            "div",
            {
              style: {
                fontSize: 12,
                color: "var(--ui-muted, currentColor)",
                marginBottom: 8,
                lineHeight: 1.7,
              },
            },
            "为什么：",
            sug.rationale,
          )
        : null,
      sourceIdeas.length
        ? h(
            "div",
            { style: { marginBottom: 8 } },
            h(
              "span",
              {
                style: {
                  fontSize: 12,
                  color: "var(--ui-muted, currentColor)",
                  marginRight: 6,
                },
              },
              "来源灵感：",
            ),
            sourceIdeas.map(function (idea) {
              return h(
                Button,
                {
                  key: idea.id,
                  type: "link",
                  size: "small",
                  onClick: function () {
                    props.onOpen(idea.id);
                  },
                },
                ideaTitle(idea).slice(0, 24),
              );
            }),
          )
        : null,
      h(
        "div",
        { style: { marginTop: 4 } },
        sug.status === "new"
          ? h(
              Space,
              null,
              h(
                Button,
                {
                  type: "primary",
                  size: "small",
                  loading: pending,
                  onClick: function () {
                    setStatus("accepted");
                  },
                },
                "采纳为行动",
              ),
              h(
                Button,
                {
                  size: "small",
                  disabled: pending,
                  onClick: function () {
                    setStatus("dismissed");
                  },
                },
                "忽略",
              ),
            )
          : null,
        sug.status === "accepted"
          ? h(Button, { onClick: props.onTodos }, "查看行动清单 →")
          : null,
        sug.status === "dismissed"
          ? h(
              Button,
              {
                loading: pending,
                onClick: function () {
                  setStatus("new");
                },
              },
              "恢复为待处理",
            )
          : null,
      ),
    );
  }

  function ThinkPanel(props) {
    var [filter, setFilter] = useState("new");
    var active = props.ideas.filter(function (i) {
      return i.status !== "archived";
    }).length;
    var minimum = props.meta.min_ideas || 3;
    var rows = props.suggestions.filter(function (s) {
      return !filter || s.status === filter;
    });
    var ideaMap = {};
    props.ideas.forEach(function (i) {
      ideaMap[i.id] = i;
    });
    return h(
      "section",
      null,
      h(
        "div",
        { className: "uideas-section-head" },
        h(
          "div",
          null,
          h("h2", null, "让想法，多走一步"),
          h(
            "p",
            null,
            active < minimum
              ? "再记录 " +
                  (minimum - active) +
                  " 条未归档灵感，即可生成研究建议。"
              : "结合灵感与已有对话记忆，寻找值得推进的下一步。",
          ),
        ),
        h(
          Button,
          {
            type: "primary",
            disabled: active < minimum,
            loading: !!props.busy.think,
            onClick: function () {
              props.onJob("think");
            },
          },
          "✧ 立即思考",
        ),
      ),
      h(
        "div",
        { className: "uideas-filters" },
        [
          ["new", "待处理"],
          ["accepted", "已采纳"],
          ["dismissed", "已忽略"],
          ["", "全部建议"],
        ].map(function (f) {
          return h(
            "button",
            {
              type: "button",
              className: "uideas-filter",
              key: f[0],
              "aria-pressed": filter === f[0],
              onClick: function () {
                setFilter(f[0]);
              },
            },
            f[1],
            h(
              "small",
              null,
              props.suggestions.filter(function (s) {
                return !f[0] || s.status === f[0];
              }).length,
            ),
          );
        }),
      ),
      !rows.length
        ? h(
            EmptyState,
            {
              title: "暂时没有" + (filter === "new" ? "待处理的" : "") + "建议",
              body: "积累灵感后点击「立即思考」。采纳的建议会进入行动清单，便于跟进和完成。",
            },
            h(Button, { onClick: props.onIdeas }, "回到灵感库"),
          )
        : rows.map(function (s) {
            return h(SuggestionCard, {
              key: s.id,
              suggestion: s,
              ideaMap: ideaMap,
              onChanged: props.onChanged,
              onOpen: props.onOpen,
              onTodos: props.onTodos,
            });
          }),
    );
  }

  function TodoPanel(props) {
    var [filter, setFilter] = useState("todo"),
      [pending, setPending] = useState("");
    var todos = props.meta.todo_queue || [],
      rows = todos.filter(function (t) {
        return t.status === filter;
      });
    async function toggle(item) {
      if (pending) return;
      setPending(item.id);
      try {
        await apiFetch("/uideas/todos/" + item.id, {
          method: "PATCH",
          body: { status: item.status === "done" ? "todo" : "done" },
        });
        props.onChanged();
      } catch (e) {
        message.error(errorText(e));
      } finally {
        setPending("");
      }
    }
    return h(
      "section",
      null,
      h(
        "div",
        { className: "uideas-section-head" },
        h(
          "div",
          null,
          h("h2", null, "把灵感，变成进展"),
          h("p", null, "完成的行动保留记录和来源，也可以随时重新打开。"),
        ),
      ),
      h(
        "div",
        { className: "uideas-filters" },
        [
          ["todo", "待完成"],
          ["done", "已完成"],
        ].map(function (f) {
          return h(
            "button",
            {
              type: "button",
              className: "uideas-filter",
              key: f[0],
              "aria-pressed": filter === f[0],
              onClick: function () {
                setFilter(f[0]);
              },
            },
            f[1],
            h(
              "small",
              null,
              todos.filter(function (t) {
                return t.status === f[0];
              }).length,
            ),
          );
        }),
      ),
      !rows.length
        ? h(
            EmptyState,
            {
              icon: "✓",
              title:
                filter === "todo"
                  ? "当前没有待完成的行动"
                  : "还没有已完成的行动",
              body: "在思考建议中点击「采纳为行动」，让有价值的想法进入研究日程。",
            },
            h(Button, { onClick: props.onThink }, "查看思考建议"),
          )
        : rows.map(function (item) {
            return h(
              "article",
              {
                key: item.id,
                className:
                  "uideas-panel uideas-todo" +
                  (item.status === "done" ? " done" : ""),
              },
              h(
                "div",
                { className: "uideas-todo-content" },
                h("h3", null, item.title),
                h("div", { className: "uideas-readout" }, item.body),
                h(
                  "div",
                  { style: { marginTop: 12 } },
                  (item.idea_ids || []).map(function (id) {
                    var idea = props.ideas.find(function (i) {
                      return i.id === id;
                    });
                    return idea
                      ? h(
                          Button,
                          {
                            key: id,
                            type: "link",
                            size: "small",
                            onClick: function () {
                              props.onOpen(id);
                            },
                          },
                          "来源：" + ideaTitle(idea),
                        )
                      : null;
                  }),
                ),
                h(
                  "p",
                  { className: "uideas-hint" },
                  (item.status === "done" ? "完成于 " : "创建于 ") +
                    fmtDate(item.completed_at || item.created_at),
                ),
              ),
              h(
                Button,
                {
                  loading: pending === item.id,
                  disabled: !!pending,
                  onClick: function () {
                    toggle(item);
                  },
                },
                item.status === "done" ? "重新打开" : "标记完成",
              ),
            );
          }),
    );
  }

  // ── ClusterCard ─────────────────────────────────────────────────
  function ClusterCard(props) {
    var cluster = props.cluster;
    var ideaMap = props.ideaMap || {};
    var ideas = (cluster.idea_ids || [])
      .map(function (id) {
        return ideaMap[id];
      })
      .filter(Boolean);

    return h(
      Card,
      {
        size: "small",
        style: { borderRadius: 10, marginBottom: 12 },
      },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", marginBottom: 6 } },
        h(Tag, { color: "blue" }, "研究方向"),
        h(
          "span",
          { style: { fontSize: 12, color: "var(--ui-muted, currentColor)" } },
          ideas.length + " 条灵感",
        ),
      ),
      h(
        "div",
        { style: { fontSize: 15, fontWeight: 600, marginBottom: 6 } },
        cluster.name,
      ),
      cluster.description
        ? h(
            "div",
            {
              style: {
                fontSize: 13,
                color: "var(--ui-ink, currentColor)",
                marginBottom: 8,
                lineHeight: 1.7,
              },
            },
            cluster.description,
          )
        : null,
      ideas.length
        ? h(
            "div",
            null,
            ideas.map(function (idea) {
              return h(
                "button",
                {
                  type: "button",
                  className: "uideas-cluster-member",
                  key: idea.id,
                  onClick: function () {
                    props.onOpen(idea.id);
                  },
                },
                "• " + ideaTitle(idea),
              );
            }),
          )
        : null,
    );
  }

  function ClusterView(props) {
    var ideaMap = {};
    props.ideas.forEach(function (i) {
      ideaMap[i.id] = i;
    });
    return h(
      "section",
      null,
      h(
        "div",
        { className: "uideas-section-head" },
        h(
          "div",
          null,
          h("h2", null, "找到想法之间的联系"),
          h("p", null, "相近的灵感归入同一研究方向。点击条目可阅读原始记录。"),
        ),
        h(
          Button,
          {
            loading: !!props.busy.analyze,
            disabled: !props.ideas.some(function (i) {
              return i.status !== "archived";
            }),
            onClick: function () {
              props.onJob("analyze");
            },
          },
          "✧ 重新整理",
        ),
      ),
      !props.clusters.length
        ? h(
            EmptyState,
            {
              icon: "⌘",
              title: "让零散想法，汇成研究方向",
              body: "记录几条灵感后，点击「整理研究方向」，AI 会归纳共同主题，同时保留每条原始记录。",
            },
            h(Button, { onClick: props.onIdeas }, "回到灵感库"),
          )
        : h(
            "div",
            { className: "uideas-grid" },
            props.clusters.map(function (c) {
              return h(ClusterCard, {
                key: c.id,
                cluster: c,
                ideaMap: ideaMap,
                onOpen: props.onOpen,
              });
            }),
          ),
    );
  }

  // ── SettingsModal ───────────────────────────────────────────────
  function SettingsModal(props) {
    var meta = props.meta;
    var [form, setForm] = useState(null);
    var [saving, setSaving] = useState(false);

    useEffect(
      function () {
        if (props.open && meta) {
          setForm({
            proactive_enabled: !!meta.proactive_enabled,
            interval_minutes: meta.interval_minutes || 60,
            min_ideas: meta.min_ideas || 3,
          });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [props.open],
    );

    function save() {
      if (!form) return;
      setSaving(true);
      API.updateMeta({
        proactive_enabled: !!form.proactive_enabled,
        interval_minutes: Math.max(
          10,
          Math.min(720, form.interval_minutes || 60),
        ),
        min_ideas: Math.max(1, Math.min(100, form.min_ideas || 3)),
      })
        .then(function () {
          message.success("设置已保存");
          props.onClose();
          if (props.onSaved) props.onSaved();
        })
        .catch(function (e) {
          message.error(e.message || "保存失败");
        })
        .finally(function () {
          setSaving(false);
        });
    }

    return h(
      Modal,
      {
        open: props.open,
        title: "思考设置",
        okText: "保存",
        cancelText: "取消",
        onCancel: props.onClose,
        onOk: save,
        confirmLoading: saving,
        width: 520,
      },
      form === null
        ? null
        : h(
            "div",
            null,
            h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                },
              },
              h(
                "div",
                null,
                h("div", { style: { fontWeight: 600 } }, "主动思考"),
                h(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      color: "var(--ui-muted, currentColor)",
                    },
                  },
                  "后台定时结合灵感与对话记忆生成建议",
                ),
              ),
              h(Switch, {
                checked: form.proactive_enabled,
                onChange: function (v) {
                  setForm(Object.assign({}, form, { proactive_enabled: v }));
                },
              }),
            ),
            h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                },
              },
              h("div", { style: { fontWeight: 600 } }, "思考间隔（分钟）"),
              h(InputNumber, {
                min: 10,
                max: 720,
                value: form.interval_minutes,
                onChange: function (v) {
                  setForm(Object.assign({}, form, { interval_minutes: v }));
                },
              }),
            ),
            h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              },
              h("div", { style: { fontWeight: 600 } }, "触发最低灵感数"),
              h(InputNumber, {
                min: 1,
                max: 100,
                value: form.min_ideas,
                onChange: function (v) {
                  setForm(Object.assign({}, form, { min_ideas: v }));
                },
              }),
            ),
          ),
    );
  }

  function UIdeasApp() {
    var theme = host.useTheme ? host.useTheme() : "light";
    var [tab, setTab] = useState("ideas"),
      [filter, setFilter] = useState("active");
    var [data, setData] = useState({
      ideas: [],
      suggestions: [],
      clusters: [],
      meta: {},
    });
    var [loaded, setLoaded] = useState(false),
      [loading, setLoading] = useState(false),
      [error, setError] = useState("");
    var [draft, setDraft] = useState({ title: "", content: "", tags: "" }),
      [focusKey, setFocusKey] = useState(0);
    var [detail, setDetail] = useState(null),
      [settings, setSettings] = useState(false),
      [exportOpen, setExportOpen] = useState(false);
    var [live, setLive] = useState(false),
      [busy, setBusy] = useState({}),
      [jobError, setJobError] = useState(null);
    var alive = useRef(true),
      sequence = useRef(0),
      jobs = useRef({}),
      refreshTimer = useRef(null),
      draftRef = useRef(draft);
    draftRef.current = draft;
    async function refresh() {
      var version = ++sequence.current;
      setLoading(true);
      try {
        var result = await Promise.all([
          API.listIdeas(),
          API.listSuggestions(),
          API.listClusters(),
          API.getMeta(),
        ]);
        if (!alive.current || version !== sequence.current) return;
        setData({
          ideas: result[0].ideas || [],
          suggestions: result[1].suggestions || [],
          clusters: result[2].clusters || [],
          meta: result[3].meta || {},
        });
        setError("");
        setLoaded(true);
      } catch (e) {
        if (alive.current && version === sequence.current)
          setError(errorText(e));
      } finally {
        if (alive.current && version === sequence.current) setLoading(false);
      }
    }
    function scheduleRefresh() {
      if (!refreshTimer.current)
        refreshTimer.current = setTimeout(function () {
          refreshTimer.current = null;
          if (alive.current) refresh();
        }, 180);
    }
    function jobLabel(kind) {
      return kind === "analyze"
        ? "研究方向整理"
        : kind === "expand"
        ? "灵感扩充"
        : "主动思考";
    }
    function finish(key, job) {
      var item = jobs.current[key];
      if (!item || !job || !["done", "error", "cancelled"].includes(job.status))
        return;
      delete jobs.current[key];
      setBusy(Object.assign({}, jobs.current));
      if (job.status === "done") {
        var result = job.result || {};
        if (result.warning) message.warning("分析结果不完整，已保留原有内容");
        else
          message.success(
            jobLabel(item.kind) +
              "完成" +
              (item.kind === "think" &&
              !(result.created_count || (result.created || []).length)
                ? "，暂无新建议"
                : ""),
          );
      } else
        setJobError({
          kind: item.kind,
          id: item.ideaId,
          message: job.error || job.message || "任务已中断，请重新发起",
        });
      refresh();
    }
    async function startJob(kind, id) {
      var key = kind === "expand" ? kind + ":" + id : kind;
      if (jobs.current[key]) return;
      jobs.current[key] = { kind: kind, ideaId: id, id: null };
      setBusy(Object.assign({}, jobs.current));
      setJobError(null);
      try {
        var result = await (kind === "expand"
          ? API.expand(id)
          : kind === "analyze"
          ? API.organize()
          : API.think());
        if (!alive.current) return;
        if (result.job_id) {
          jobs.current[key].id = result.job_id;
          setBusy(Object.assign({}, jobs.current));
        } else {
          delete jobs.current[key];
          setBusy(Object.assign({}, jobs.current));
          if (result.skipped)
            message.info("未满足运行条件，请先补充未归档灵感");
          else refresh();
        }
      } catch (e) {
        if (!alive.current) return;
        delete jobs.current[key];
        setBusy(Object.assign({}, jobs.current));
        setJobError({ kind: kind, id: id, message: errorText(e) });
      }
    }
    useEffect(function () {
      alive.current = true;
      refresh();
      var source = null,
        reconnect = null,
        disposed = false,
        pollRunning = false;
      var connectedAt = Date.now(),
        notified = new Set();
      function connect() {
        if (disposed || typeof EventSource === "undefined") return;
        source = new EventSource(sseUrl("/uideas/stream"));
        source.onopen = function () {
          if (!disposed) {
            connectedAt = Date.now();
            setLive(true);
            scheduleRefresh();
          }
        };
        source.onmessage = function (event) {
          if (disposed) return;
          var ev;
          try {
            ev = JSON.parse(event.data);
          } catch (_) {
            return;
          }
          if (!ev.type) return;
          if (
            ev.type === "suggestion" &&
            Array.isArray(ev.suggestions) &&
            new Date(ev.ts).getTime() >= connectedAt
          ) {
            var fresh = ev.suggestions.filter(function (s) {
              return !notified.has(s.id);
            });
            fresh.forEach(function (s) {
              notified.add(s.id);
            });
            if (fresh.length)
              message.info("收到 " + fresh.length + " 条新的研究建议");
          }
          if (ev.type === "job:done" || ev.type === "job:error")
            Object.keys(jobs.current).forEach(function (key) {
              if (jobs.current[key].id === ev.job_id)
                finish(
                  key,
                  Object.assign({}, ev, {
                    status: ev.type === "job:done" ? "done" : "error",
                  }),
                );
            });
          if (ev.type !== "job:started") scheduleRefresh();
        };
        source.onerror = function () {
          if (disposed) return;
          setLive(false);
          source.close();
          reconnect = setTimeout(connect, 5000);
        };
      }
      connect();
      var polling = setInterval(async function () {
        if (pollRunning) return;
        pollRunning = true;
        try {
          await Promise.all(
            Object.keys(jobs.current).map(async function (key) {
              var item = jobs.current[key];
              if (!item || !item.id) return;
              try {
                var result = await apiFetch("/uideas/jobs/" + item.id);
                if (!disposed) {
                  item.connectionError = false;
                  finish(key, result.job);
                }
              } catch (e) {
                if (!disposed) {
                  item.connectionError = true;
                  if (/job not found|404/.test(e.message))
                    finish(key, {
                      status: "error",
                      message: "任务记录已失效，请重试",
                    });
                  else setBusy(Object.assign({}, jobs.current));
                }
              }
            }),
          );
        } finally {
          pollRunning = false;
        }
      }, 2000);
      var fallback = setInterval(function () {
        if (!source || source.readyState !== 1) refresh();
      }, 30000);
      function beforeUnload(event) {
        var d = draftRef.current;
        if (d.title.trim() || d.content.trim() || d.tags.trim()) {
          event.preventDefault();
          event.returnValue = "";
        }
      }
      window.addEventListener("beforeunload", beforeUnload);
      return function () {
        disposed = true;
        alive.current = false;
        sequence.current++;
        if (source) source.close();
        clearTimeout(reconnect);
        clearTimeout(refreshTimer.current);
        clearInterval(polling);
        clearInterval(fallback);
        window.removeEventListener("beforeunload", beforeUnload);
      };
    }, []);
    function openIdea(id) {
      setDetail(id);
    }
    function starter(text) {
      setDraft(function (d) {
        return Object.assign({}, d, {
          content: d.content ? d.content + "\n\n" + text : text,
        });
      });
      setFocusKey(function (v) {
        return v + 1;
      });
    }
    function exportData(format) {
      var contents, extension, mime;
      if (format === "json") {
        contents = JSON.stringify(
          {
            schema_version: 1,
            exported_at: new Date().toISOString(),
            ideas: data.ideas,
            clusters: data.clusters,
            suggestions: data.suggestions,
            actions: data.meta.todo_queue || [],
          },
          null,
          2,
        );
        extension = "json";
        mime = "application/json";
      } else {
        var lines = [
          "# UIdeas 研究笔记",
          "",
          "导出时间：" + new Date().toLocaleString("zh-CN"),
          "",
          "## 灵感库",
          "",
        ];
        data.ideas.forEach(function (i) {
          lines.push(
            "### " + ideaTitle(i),
            "",
            "状态：" + (IDEA_STATUS[i.status] || IDEA_STATUS.raw).label,
            "标签：" + (i.tags || []).join("、"),
            "关联实验：" + (i.related_experiments || []).join("、"),
            "",
            i.content || "",
            "",
            i.expansion ? "#### 研究扩充\n\n" + i.expansion : "",
            "",
          );
        });
        lines.push("## 研究方向", "");
        data.clusters.forEach(function (c) {
          lines.push(
            "### " + c.name,
            "",
            c.description || "",
            "",
            (c.idea_ids || [])
              .map(function (id) {
                var idea = data.ideas.find(function (i) {
                  return i.id === id;
                });
                return "- " + (idea ? ideaTitle(idea) : id);
              })
              .join("\n"),
            "",
          );
        });
        lines.push("## 思考建议", "");
        data.suggestions.forEach(function (s) {
          lines.push(
            "### " + s.title,
            "",
            "状态：" + (SUG_STATUS[s.status] || SUG_STATUS.new).label,
            "",
            s.body || "",
            "",
            s.rationale || "",
            "",
          );
        });
        lines.push("## 行动清单", "");
        (data.meta.todo_queue || []).forEach(function (t) {
          lines.push(
            "- [" + (t.status === "done" ? "x" : " ") + "] " + t.title,
            "",
            t.body || "",
            "",
          );
        });
        contents = lines.join("\n");
        extension = "md";
        mime = "text/markdown";
      }
      var url = URL.createObjectURL(
          new Blob([contents], { type: mime + ";charset=utf-8" }),
        ),
        link = document.createElement("a");
      link.href = url;
      link.download =
        "uideas-" + new Date().toISOString().slice(0, 10) + "." + extension;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
      setExportOpen(false);
    }
    var active = data.ideas.filter(function (i) {
      return i.status !== "archived";
    }).length;
    var raw = data.ideas.filter(function (i) {
      return i.status === "raw";
    }).length;
    var suggestions = data.suggestions.filter(function (s) {
      return s.status === "new";
    }).length;
    var todos = (data.meta.todo_queue || []).filter(function (t) {
      return t.status === "todo";
    }).length;
    var selected =
      detail &&
      data.ideas.find(function (i) {
        return i.id === detail;
      });
    var common = Object.assign({}, data, {
      busy: busy,
      onJob: startJob,
      onChanged: refresh,
      onOpen: openIdea,
      onIdeas: function () {
        setTab("ideas");
      },
      onThink: function () {
        setTab("think");
      },
      onTodos: function () {
        setTab("todos");
      },
    });
    return h(
      antd.ConfigProvider,
      {
        theme: {
          token: {
            colorPrimary: theme === "dark" ? "#72bca3" : "#227563",
            borderRadius: 8,
          },
        },
      },
      h(
        "main",
        {
          className: "uideas",
          "data-dark": theme === "dark",
          "aria-label": "UIdeas 科研灵感工作台",
        },
        h("style", null, WORKSPACE_CSS),
        h(
          "header",
          { className: "uideas-head" },
          h(
            "div",
            { className: "uideas-brand" },
            h("span", { className: "uideas-logo", "aria-hidden": true }, "✧"),
            h(
              "div",
              null,
              h("div", { className: "uideas-wordmark" }, "UIdeas"),
              h("div", { className: "uideas-subbrand" }, "科研灵感实验室"),
            ),
          ),
          h(
            "div",
            { className: "uideas-head-actions" },
            h(
              "span",
              {
                className: "uideas-live" + (live ? "" : " off"),
                role: "status",
              },
              live ? "实时同步" : "连接恢复中",
            ),
            h(
              Button,
              {
                disabled: !loaded || loading || !!error,
                onClick: function () {
                  setExportOpen(true);
                },
              },
              "导出笔记",
            ),
            h(
              Button,
              {
                disabled: !loaded,
                onClick: function () {
                  setSettings(true);
                },
              },
              "思考设置",
            ),
          ),
        ),
        h(
          "section",
          { className: "uideas-intro" },
          h("div", { className: "uideas-eyebrow" }, "从灵光一现，到值得探索"),
          h("h1", null, "给每一个好想法，生长的空间。"),
          h("p", null, "捕捉研究灵感，发现彼此联系，把下一步变得清晰。"),
        ),
        h(
          "section",
          { className: "uideas-stats", "aria-label": "研究概览" },
          [
            ["灵感积累", active, "条未归档", "ideas"],
            ["研究方向", data.clusters.length, "个主题", "clusters"],
            ["待处理建议", suggestions, "条建议", "think"],
            ["待完成行动", todos, "个行动", "todos"],
          ].map(function (s) {
            return h(
              "button",
              {
                type: "button",
                className: "uideas-stat",
                key: s[0],
                onClick: function () {
                  if (s[3] === "ideas") setFilter("active");
                  setTab(s[3]);
                },
              },
              h(
                "span",
                { className: "uideas-stat-label" },
                s[0],
                h("span", { "aria-hidden": true }, "↗"),
              ),
              h(
                "div",
                { className: "uideas-stat-value" },
                loaded ? s[1] : "—",
                h("small", null, s[2]),
              ),
            );
          }),
        ),
        h(
          "nav",
          {
            className: "uideas-nav",
            role: "tablist",
            "aria-label": "工作台导航",
          },
          [
            ["ideas", "灵感库", active],
            ["clusters", "研究方向", data.clusters.length],
            ["think", "思考建议", suggestions],
            ["todos", "行动清单", todos],
          ].map(function (t) {
            return h(
              "button",
              {
                type: "button",
                role: "tab",
                id: "uideas-tab-" + t[0],
                "aria-controls": "uideas-panel-" + t[0],
                "aria-selected": tab === t[0],
                tabIndex: tab === t[0] ? 0 : -1,
                onKeyDown: function (event) {
                  var keys = ["ideas", "clusters", "think", "todos"];
                  var index = keys.indexOf(t[0]);
                  if (event.key === "ArrowRight")
                    index = (index + 1) % keys.length;
                  else if (event.key === "ArrowLeft")
                    index = (index + keys.length - 1) % keys.length;
                  else if (event.key === "Home") index = 0;
                  else if (event.key === "End") index = keys.length - 1;
                  else return;
                  event.preventDefault();
                  setTab(keys[index]);
                  document.getElementById("uideas-tab-" + keys[index]).focus();
                },
                key: t[0],
                onClick: function () {
                  setTab(t[0]);
                },
              },
              t[1],
              h("span", { className: "uideas-nav-count" }, loaded ? t[2] : "—"),
            );
          }),
        ),
        error
          ? h(Alert, {
              style: { marginBottom: 18 },
              type: "error",
              showIcon: true,
              message: loaded
                ? "同步失败，当前显示上次成功加载的记录"
                : "暂时无法加载灵感库",
              description: error,
              action: h(
                Button,
                { loading: loading, onClick: refresh },
                "重新加载",
              ),
            })
          : null,
        jobError
          ? h(Alert, {
              style: { marginBottom: 18 },
              type: "error",
              showIcon: true,
              closable: true,
              onClose: function () {
                setJobError(null);
              },
              message: jobLabel(jobError.kind) + "失败",
              description: jobError.message,
              action: h(
                Button,
                {
                  onClick: function () {
                    startJob(jobError.kind, jobError.id);
                  },
                },
                "重试任务",
              ),
            })
          : null,
        Object.keys(busy).map(function (key) {
          var job = busy[key];
          return h(
            "div",
            { className: "uideas-job", key: key, role: "status" },
            h(
              "span",
              null,
              h(Spin, { size: "small", style: { marginRight: 9 } }),
              jobLabel(job.kind) +
                (job.connectionError ? " · 正在恢复任务连接" : "进行中…"),
            ),
            h("span", { className: "uideas-hint" }, "可以继续记录和浏览灵感"),
          );
        }),
        !loaded
          ? loading
            ? h(
                "div",
                { style: { padding: 50, textAlign: "center" } },
                h(Spin, null),
              )
            : null
          : h(
              "div",
              { className: "uideas-workspace" },
              h(
                "div",
                { className: "uideas-main" },
                h(
                  "section",
                  {
                    hidden: tab !== "ideas",
                    role: "tabpanel",
                    id: "uideas-panel-ideas",
                    "aria-labelledby": "uideas-tab-ideas",
                  },
                  h(
                    IdeaBoard,
                    Object.assign({}, common, {
                      draft: draft,
                      setDraft: setDraft,
                      focusKey: focusKey,
                      filter: filter,
                      setFilter: setFilter,
                      onStarter: starter,
                    }),
                  ),
                ),
                h(
                  "section",
                  {
                    hidden: tab !== "clusters",
                    role: "tabpanel",
                    id: "uideas-panel-clusters",
                    "aria-labelledby": "uideas-tab-clusters",
                  },
                  h(ClusterView, common),
                ),
                h(
                  "section",
                  {
                    hidden: tab !== "think",
                    role: "tabpanel",
                    id: "uideas-panel-think",
                    "aria-labelledby": "uideas-tab-think",
                  },
                  h(ThinkPanel, common),
                ),
                h(
                  "section",
                  {
                    hidden: tab !== "todos",
                    role: "tabpanel",
                    id: "uideas-panel-todos",
                    "aria-labelledby": "uideas-tab-todos",
                  },
                  h(TodoPanel, common),
                ),
              ),
              h(
                "aside",
                { className: "uideas-aside", "aria-label": "研究助手" },
                h(
                  "section",
                  { className: "uideas-panel" },
                  h("h3", null, "一条灵感的生长路径"),
                  [
                    ["01", "捕捉灵感", "先记录，不急着下结论。"],
                    ["02", "发现联系", "整理主题，扩充研究方法。"],
                    ["03", "推进研究", "采纳建议，跟进每一个行动。"],
                  ].map(function (step) {
                    return h(
                      "div",
                      { className: "uideas-step", key: step[0] },
                      h("span", { className: "uideas-step-index" }, step[0]),
                      h(
                        "div",
                        null,
                        h("strong", null, step[1]),
                        h("p", null, step[2]),
                      ),
                    );
                  }),
                ),
                h(
                  "section",
                  { className: "uideas-panel" },
                  h("h3", null, "研究动态"),
                  h(
                    "div",
                    { className: "uideas-aside-row" },
                    h("span", null, "待整理灵感"),
                    h("strong", null, raw + " 条"),
                  ),
                  h(
                    "div",
                    { className: "uideas-aside-row" },
                    h("span", null, "主动思考"),
                    h(
                      "strong",
                      null,
                      data.meta.proactive_enabled ? "已开启" : "手动触发",
                    ),
                  ),
                  h(
                    "div",
                    { className: "uideas-aside-row" },
                    h("span", null, "最近思考"),
                    h(
                      "strong",
                      null,
                      fmtDate(data.meta.last_think_at) || "尚未运行",
                    ),
                  ),
                  h(
                    "p",
                    { className: "uideas-hint", style: { marginTop: 16 } },
                    active < (data.meta.min_ideas || 3)
                      ? "再积累 " +
                          ((data.meta.min_ideas || 3) - active) +
                          " 条灵感，即可开始主动思考。"
                      : "已有足够素材，可以尝试生成下一步建议。",
                  ),
                ),
                h(
                  "section",
                  { className: "uideas-panel uideas-note" },
                  h("h3", null, "让记录更有线索"),
                  h(
                    "p",
                    null,
                    "用 #标签 连接同一主题，用 @实验编号 标记实验线索。一个具体的观察，比一个完美的标题更有价值。",
                  ),
                ),
              ),
            ),
        h(
          Modal,
          {
            open: !!selected,
            className: "uideas-modal",
            title: selected ? ideaTitle(selected) : "",
            width: 720,
            onCancel: function () {
              setDetail(null);
            },
            footer: h(
              Button,
              {
                type: "primary",
                onClick: function () {
                  setDetail(null);
                },
              },
              "完成",
            ),
          },
          selected
            ? h(
                "div",
                null,
                h(
                  "div",
                  { className: "uideas-readout" },
                  selected.content || selected.title,
                ),
                h(
                  "div",
                  { style: { marginTop: 18 } },
                  (selected.tags || []).map(function (t) {
                    return h(Tag, { key: t }, "#" + t);
                  }),
                  (selected.related_experiments || []).map(function (t) {
                    return h(Tag, { key: "@" + t, color: "cyan" }, "@" + t);
                  }),
                ),
                selected.expansion
                  ? h(
                      "section",
                      {
                        style: {
                          marginTop: 24,
                          padding: 18,
                          background: "rgba(34,117,99,.07)",
                          borderRadius: 10,
                        },
                      },
                      h(
                        "h3",
                        null,
                        "研究扩充 · 第 " +
                          (selected.expansion_version || 1) +
                          " 版",
                      ),
                      h(
                        "div",
                        {
                          className: "uideas-readout",
                          style: { marginTop: 12 },
                        },
                        selected.expansion,
                      ),
                    )
                  : null,
              )
            : null,
        ),
        settings
          ? h(SettingsModal, {
              open: true,
              meta: data.meta,
              onClose: function () {
                setSettings(false);
              },
              onSaved: refresh,
            })
          : null,
        h(
          Modal,
          {
            open: exportOpen,
            title: "导出研究笔记",
            onCancel: function () {
              setExportOpen(false);
            },
            footer: null,
            width: 460,
          },
          h(
            "p",
            { style: { lineHeight: 1.8, marginBottom: 20 } },
            "导出全部灵感（含归档）、研究方向、建议和行动清单。筛选条件不会影响导出范围。",
          ),
          h(
            "div",
            { style: { display: "flex", gap: 10 } },
            h(
              Button,
              {
                type: "primary",
                onClick: function () {
                  exportData("md");
                },
              },
              "Markdown 笔记",
            ),
            h(
              Button,
              {
                onClick: function () {
                  exportData("json");
                },
              },
              "JSON 数据",
            ),
          ),
        ),
      ),
    );
  }

  // ── Self-register PawApp route ───────────────────────────────────
  QwenPaw.registerRoutes("uideas", [
    {
      path: "/apps/uideas",
      component: UIdeasApp,
      label: "UIdeas 灵感",
      icon: "💡",
    },
  ]);

  console.info("[uideas] registered route /apps/uideas");
})();
