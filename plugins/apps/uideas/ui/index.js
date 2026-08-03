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
  var useCallback = React.useCallback;

  var Button = antd.Button;
  var Input = antd.Input;
  var Modal = antd.Modal;
  var Tag = antd.Tag;
  var Card = antd.Card;
  var Space = antd.Space;
  var Tooltip = antd.Tooltip;
  var message = antd.message;
  var Empty = antd.Empty;
  var Spin = antd.Spin;
  var Popconfirm = antd.Popconfirm;
  var Switch = antd.Switch;
  var InputNumber = antd.InputNumber;
  var Select = antd.Select;
  var Tabs = antd.Tabs;
  var Badge = antd.Badge;
  var Popover = antd.Popover;
  var Alert = antd.Alert;

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
    if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.body);
    }
    var resp = await fetch(url, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body,
    });
    if (!resp.ok) {
      var text = await resp.text().catch(function () { return ""; });
      throw new Error(text || "HTTP " + resp.status);
    }
    if (resp.status === 204) return null;
    return resp.json();
  }

  function sseUrl(path) {
    var url = apiUrl(path);
    var token = authToken();
    if (token) {
      url += (url.indexOf("?") >= 0 ? "&" : "?") + "token=" + encodeURIComponent(token);
    }
    return url;
  }

  // ── API wrapper ──────────────────────────────────────────────────
  var API = {
    listIdeas: function (params) {
      var qs = new URLSearchParams(params || {}).toString();
      return apiFetch("/uideas/ideas" + (qs ? "?" + qs : ""));
    },
    createIdea: function (data) { return apiFetch("/uideas/ideas", { method: "POST", body: data }); },
    updateIdea: function (id, data) { return apiFetch("/uideas/ideas/" + id, { method: "PATCH", body: data }); },
    deleteIdea: function (id) { return apiFetch("/uideas/ideas/" + id, { method: "DELETE" }); },
    organize: function () { return apiFetch("/uideas/analyze", { method: "POST" }); },
    expand: function (id) { return apiFetch("/uideas/expand/" + id, { method: "POST" }); },
    think: function () { return apiFetch("/uideas/think", { method: "POST" }); },
    listSuggestions: function (params) {
      var qs = new URLSearchParams(params || {}).toString();
      return apiFetch("/uideas/suggestions" + (qs ? "?" + qs : ""));
    },
    updateSuggestion: function (id, data) { return apiFetch("/uideas/suggestions/" + id, { method: "PATCH", body: data }); },
    listClusters: function () { return apiFetch("/uideas/clusters"); },
    getMeta: function () { return apiFetch("/uideas/meta"); },
    updateMeta: function (data) { return apiFetch("/uideas/meta", { method: "PATCH", body: data }); },
  };

  // ── Helpers ──────────────────────────────────────────────────────
  var IDEA_STATUS = {
    raw: { label: "原始", color: "default" },
    organized: { label: "已整理", color: "blue" },
    expanded: { label: "已扩充", color: "purple" },
    archived: { label: "已归档", color: "green" },
  };
  var IDEA_STATUS_FILTERS = [
    { value: "", label: "全部" },
    { value: "raw", label: "原始" },
    { value: "organized", label: "已整理" },
    { value: "expanded", label: "已扩充" },
    { value: "archived", label: "已归档" },
  ];
  var SUG_STATUS = {
    new: { label: "新建议", color: "gold" },
    accepted: { label: "已采纳", color: "green" },
    dismissed: { label: "已忽略", color: "default" },
  };

  function fmtDate(s) {
    if (!s) return "";
    try {
      var d = new Date(s);
      var now = new Date();
      var diff = now.getTime() - d.getTime();
      if (diff < 60 * 1000) return "刚刚";
      if (diff < 3600 * 1000) return Math.floor(diff / 60000) + " 分钟前";
      if (diff < 86400 * 1000 && now.getDate() === d.getDate()) {
        return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      }
      return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) + " " +
        d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    } catch (e) { return ""; }
  }

  function splitTags(v) {
    return (v || "").split(/[,，、;；\s]+/).map(function (t) { return t.trim(); }).filter(Boolean);
  }

  function ideaTitle(idea) {
    return idea.title || (idea.content || "").slice(0, 40) + ((idea.content || "").length > 40 ? "…" : "");
  }

  function renderPlain(text) {
    if (!text) return null;
    return text.split("\n").map(function (line, i) {
      return h("div", {
        key: "l" + i,
        style: { whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7 },
      }, line || "\u00a0");
    });
  }

  // ── IdeaComposer: 新建灵感 ──────────────────────────────────────
  function IdeaComposer(props) {
    var onCreated = props.onCreated;
    var [form, setForm] = useState({ title: "", content: "", tags: "" });
    var [submitting, setSubmitting] = useState(false);

    function submit() {
      if (!form.content.trim() && !form.title.trim()) {
        message.warning("请先写下灵感内容");
        return;
      }
      setSubmitting(true);
      API.createIdea({
        title: form.title.trim(),
        content: form.content.trim(),
        tags: splitTags(form.tags),
      })
        .then(function () {
          message.success("灵感已记录");
          setForm({ title: "", content: "", tags: "" });
          if (onCreated) onCreated();
        })
        .catch(function (e) { message.error("记录失败：" + (e.message || "unknown")); })
        .finally(function () { setSubmitting(false); });
    }

    return h(Card, {
      style: { borderRadius: 12, marginBottom: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
      bodyStyle: { padding: 16 },
    },
      h("div", { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        h("div", { style: { fontSize: 20, lineHeight: 1 } }, "💡"),
        h(Input, {
          value: form.title,
          onChange: function (e) { setForm(Object.assign({}, form, { title: e.target.value })); },
          placeholder: "灵感标题（可选，留空则取内容开头）",
          maxLength: 80,
          style: { flex: 1 },
        })
      ),
      h(Input.TextArea, {
        value: form.content,
        onChange: function (e) { setForm(Object.assign({}, form, { content: e.target.value })); },
        placeholder: "写下你的研究灵感…\n例如：储气库注采过程中可用数字孪生对井口压力做实时校正",
        rows: 3,
        maxLength: 2000,
        style: { marginBottom: 8 },
      }),
      h("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
        h(Input, {
          value: form.tags,
          onChange: function (e) { setForm(Object.assign({}, form, { tags: e.target.value })); },
          placeholder: "标签，逗号分隔（可选）：储气库, 历史拟合",
          style: { flex: 1 },
        }),
        h(Button, { type: "primary", onClick: submit, loading: submitting }, "记录灵感")
      )
    );
  }

  // ── IdeaCard: 灵感卡片 ──────────────────────────────────────────
  function IdeaCard(props) {
    var idea = props.idea;
    var onChanged = props.onChanged;
    var onExpanded = props.onExpanded;
    var [expanding, setExpanding] = useState(false);
    var [editOpen, setEditOpen] = useState(false);
    var [showExpansion, setShowExpansion] = useState(!!idea.expansion);
    var status = IDEA_STATUS[idea.status] || IDEA_STATUS.raw;

    function toggleArchive() {
      API.updateIdea(idea.id, {
        status: idea.status === "archived" ? "organized" : "archived",
      })
        .then(function () { message.success(idea.status === "archived" ? "已恢复" : "已归档"); if (onChanged) onChanged(); })
        .catch(function (e) { message.error(e.message || "操作失败"); });
    }

    function remove() {
      API.deleteIdea(idea.id)
        .then(function () { message.success("已删除"); if (onChanged) onChanged(); })
        .catch(function (e) { message.error(e.message || "删除失败"); });
    }

    function doExpand() {
      setExpanding(true);
      API.expand(idea.id)
        .then(function () { message.success("扩充完成，已进入 L2 研究方向扩展"); if (onExpanded) onExpanded(); })
        .catch(function (e) { message.error("扩充失败：" + (e.message || "unknown")); })
        .finally(function () { setExpanding(false); });
    }

    var actions = [];
    if (idea.status !== "expanded") {
      actions.push(
        h(Tooltip, { key: "expand", title: "L2：由 Agent 扩展为可执行的研究方向" },
          h(Button, { type: "text", size: "small", loading: expanding, onClick: doExpand }, "扩充")
        )
      );
    }
    if (idea.expansion) {
      actions.push(
        h(Button, {
          key: "toggle-exp", type: "text", size: "small",
          onClick: function () { setShowExpansion(!showExpansion); },
        }, showExpansion ? "收起" : "展开")
      );
    }
    actions.push(
      h(Button, { key: "edit", type: "text", size: "small", onClick: function () { setEditOpen(true); } }, "编辑")
    );
    actions.push(
      h(Button, {
        key: "archive", type: "text", size: "small",
        style: { color: idea.status === "archived" ? "#52c41a" : undefined },
        onClick: toggleArchive,
      }, idea.status === "archived" ? "恢复" : "归档")
    );
    actions.push(
      h(Popconfirm, {
        key: "del", title: "确定删除这条灵感吗？", okText: "删除", cancelText: "取消",
        okButtonProps: { danger: true }, onConfirm: remove,
      },
        h(Button, { type: "text", size: "small", danger: true }, "删除")
      )
    );

    return h(Card, {
      size: "small",
      style: {
        borderRadius: 10,
        opacity: idea.status === "archived" ? 0.72 : 1,
        marginBottom: 12,
      },
      actions: actions,
    },
      h("div", { style: { marginBottom: 6 } },
        h(Tag, { color: status.color }, status.label),
        h("span", { style: { fontSize: 12, color: "rgba(0,0,0,0.45)", marginLeft: 8 } },
          fmtDate(idea.updated_at || idea.created_at))
      ),
      h("div", { style: { fontSize: 15, fontWeight: 600, marginBottom: 6, wordBreak: "break-word" } }, ideaTitle(idea)),
      h("div", { style: { color: "rgba(0,0,0,0.75)", fontSize: 13, marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7 } },
        (idea.content || "").length > 160 ? idea.content.slice(0, 160) + "…" : idea.content
      ),
      (idea.tags && idea.tags.length
        ? h("div", { style: { marginBottom: 4 } },
            idea.tags.map(function (t) { return h(Tag, { key: t, style: { marginBottom: 4 } }, t); })
          )
        : null),
      (idea.expansion && showExpansion
        ? h("div", {
            style: {
              marginTop: 8, padding: 10, borderRadius: 8,
              background: "rgba(114,46,209,0.06)", border: "1px solid rgba(114,46,209,0.2)",
            },
          },
            h("div", { style: { fontSize: 12, color: "#722ed1", fontWeight: 600, marginBottom: 4 } }, "✨ L2 扩充 · 研究方向"),
            renderPlain(idea.expansion)
          )
        : null),
      h(EditIdeaModal, {
        idea: idea, open: editOpen,
        onClose: function () { setEditOpen(false); }, onSaved: onChanged,
      })
    );
  }

  // ── EditIdeaModal ───────────────────────────────────────────────
  function EditIdeaModal(props) {
    var idea = props.idea;
    var [form, setForm] = useState({ title: "", content: "", tags: "" });
    var [saving, setSaving] = useState(false);

    useEffect(function () {
      if (props.open && idea) {
        setForm({
          title: idea.title || "",
          content: idea.content || "",
          tags: (idea.tags || []).join(", "),
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.open, idea]);

    function save() {
      setSaving(true);
      API.updateIdea(idea.id, {
        title: form.title.trim(),
        content: form.content.trim(),
        tags: splitTags(form.tags),
      })
        .then(function () { message.success("已保存"); props.onClose(); if (props.onSaved) props.onSaved(); })
        .catch(function (e) { message.error(e.message || "保存失败"); })
        .finally(function () { setSaving(false); });
    }

    return h(Modal, {
      open: props.open, title: "编辑灵感", okText: "保存", cancelText: "取消",
      onCancel: props.onClose, onOk: save, confirmLoading: saving, width: 560,
    },
      h(Input, {
        value: form.title, onChange: function (e) { setForm(Object.assign({}, form, { title: e.target.value })); },
        placeholder: "标题", style: { marginBottom: 8 },
      }),
      h(Input.TextArea, {
        value: form.content, onChange: function (e) { setForm(Object.assign({}, form, { content: e.target.value })); },
        placeholder: "内容", rows: 4, style: { marginBottom: 8 },
      }),
      h(Input, {
        value: form.tags, onChange: function (e) { setForm(Object.assign({}, form, { tags: e.target.value })); },
        placeholder: "标签，逗号分隔",
      })
    );
  }

  // ── IdeaBoard: 灵感板视图 ───────────────────────────────────────
  function IdeaBoard(props) {
    var refreshKey = props.refreshKey;
    var onDataVersion = props.onDataVersion;
    var [ideas, setIdeas] = useState([]);
    var [loading, setLoading] = useState(false);
    var [filter, setFilter] = useState("");
    var [organizing, setOrganizing] = useState(false);
    var mounted = useRef(true);

    useEffect(function () {
      mounted.current = true;
      return function () { mounted.current = false; };
    }, []);

    var load = useCallback(function () {
      setLoading(true);
      API.listIdeas(filter ? { status: filter } : {})
        .then(function (res) { if (mounted.current) setIdeas((res && res.ideas) || []); })
        .catch(function (e) { if (mounted.current) message.error("加载灵感失败：" + (e.message || "unknown")); })
        .finally(function () { if (mounted.current) setLoading(false); });
    }, [filter]);

    useEffect(function () { load(); }, [load, refreshKey]);

    function organize() {
      setOrganizing(true);
      message.loading({ key: "organize", content: "Agent 正在整理聚类…", duration: 0 });
      API.organize()
        .then(function (res) {
          message.destroy("organize");
          var n = (res && res.cluster_count) || 0;
          var tagged = (res && res.tagged) || 0;
          message.success(
            "整理完成" + (n ? "，新发现 " + n + " 个聚类方向" : "") +
            (tagged ? "，标注 " + tagged + " 条灵感" : "")
          );
          if (onDataVersion) onDataVersion();
        })
        .catch(function (e) {
          message.destroy("organize");
          message.error("整理失败：" + (e.message || "unknown"));
        })
        .finally(function () { setOrganizing(false); });
    }

    var rawCount = ideas.filter(function (i) { return i.status === "raw"; }).length;
    var total = ideas.length;

    return h("div", null,
      h("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" } },
        IDEA_STATUS_FILTERS.map(function (f) {
          return h(Button, {
            key: f.value || "all",
            type: filter === f.value ? "primary" : "default",
            size: "small",
            onClick: function () { setFilter(f.value); },
          }, f.label);
        }),
        h("div", { style: { flex: 1 } }),
        h(Badge, { count: rawCount, size: "small", overflowCount: 99 },
          h(Button, { loading: organizing, onClick: organize }, "L1 一键整理")
        )
      ),
      h(IdeaComposer, { onCreated: load }),
      h("div", { style: { marginBottom: 8, color: "rgba(0,0,0,0.45)", fontSize: 12 } },
        "共 " + total + " 条灵感" + (rawCount ? " · " + rawCount + " 条待整理" : "")
      ),
      (loading
        ? h("div", { style: { textAlign: "center", padding: 40 } }, h(Spin, null))
        : (ideas.length === 0
          ? h(Empty, { description: filter ? "该状态下暂无灵感" : "还没有灵感，从上方写下第一条吧" })
          : ideas.map(function (idea) {
              return h(IdeaCard, {
                key: idea.id, idea: idea,
                onChanged: load,
                onExpanded: function () { if (onDataVersion) onDataVersion(); },
              });
            })
          )
      )
    );
  }

  // ── SuggestionCard ──────────────────────────────────────────────
  function SuggestionCard(props) {
    var sug = props.suggestion;
    var ideaMap = props.ideaMap || {};
    var onChanged = props.onChanged;
    var st = SUG_STATUS[sug.status] || SUG_STATUS.new;

    function setStatus(status) {
      API.updateSuggestion(sug.id, { status: status })
        .then(function () {
          message.success(status === "accepted" ? "已采纳，转化为研究行动" : "已忽略");
          if (onChanged) onChanged();
        })
        .catch(function (e) { message.error(e.message || "操作失败"); });
    }

    var sourceIdeas = (sug.source_idea_ids || []).map(function (id) { return ideaMap[id]; }).filter(Boolean);

    return h(Card, {
      size: "small",
      style: {
        borderRadius: 10, marginBottom: 12,
        borderColor: sug.status === "new" ? "rgba(250,173,20,0.45)" : undefined,
      },
    },
      h("div", { style: { display: "flex", alignItems: "center", marginBottom: 6 } },
        h(Tag, { color: st.color }, st.label),
        h("span", { style: { fontSize: 12, color: "rgba(0,0,0,0.45)" } }, fmtDate(sug.created_at))
      ),
      h("div", { style: { fontSize: 15, fontWeight: 600, marginBottom: 6, wordBreak: "break-word" } }, sug.title),
      h("div", { style: { fontSize: 13, color: "rgba(0,0,0,0.75)", marginBottom: 6, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7 } },
        sug.body
      ),
      (sug.rationale
        ? h("div", { style: { fontSize: 12, color: "rgba(0,0,0,0.55)", marginBottom: 8, lineHeight: 1.7 } },
            "为什么：", sug.rationale
          )
        : null),
      (sourceIdeas.length
        ? h("div", { style: { marginBottom: 8 } },
            h("span", { style: { fontSize: 12, color: "rgba(0,0,0,0.45)", marginRight: 6 } }, "来源灵感："),
            sourceIdeas.map(function (idea) {
              return h(Tag, { key: idea.id, color: "blue", style: { marginBottom: 4 } }, ideaTitle(idea).slice(0, 24));
            })
          )
        : null),
      h("div", { style: { marginTop: 4 } },
        (sug.status === "new"
          ? h(Space, null,
              h(Button, { type: "primary", size: "small", onClick: function () { setStatus("accepted"); } }, "采纳为行动"),
              h(Button, { size: "small", onClick: function () { setStatus("dismissed"); } }, "忽略")
            )
          : null),
        (sug.status === "accepted" ? h(Tag, { color: "success" }, "✓ 已转化为研究行动") : null)
      )
    );
  }

  // ── ThinkPanel: 思考面板视图 ────────────────────────────────────
  function ThinkPanel(props) {
    var refreshKey = props.refreshKey;
    var meta = props.meta;
    var onDataVersion = props.onDataVersion;
    var [sugs, setSugs] = useState([]);
    var [ideas, setIdeas] = useState([]);
    var [loading, setLoading] = useState(false);
    var [thinking, setThinking] = useState(false);
    var [filter, setFilter] = useState("");
    var mounted = useRef(true);

    useEffect(function () {
      mounted.current = true;
      return function () { mounted.current = false; };
    }, []);

    var load = useCallback(function () {
      setLoading(true);
      Promise.all([
        API.listSuggestions(filter ? { status: filter } : {}),
        API.listIdeas({}),
      ])
        .then(function (res) {
          if (!mounted.current) return;
          setSugs((res[0] && res[0].suggestions) || []);
          setIdeas((res[1] && res[1].ideas) || []);
        })
        .catch(function (e) { if (mounted.current) message.error("加载失败：" + (e.message || "unknown")); })
        .finally(function () { if (mounted.current) setLoading(false); });
    }, [filter]);

    useEffect(function () { load(); }, [load, refreshKey]);

    function doThink() {
      setThinking(true);
      API.think()
        .then(function (res) {
          if (res && res.skipped) {
            message.info("暂时没有可主动建议的灵感：" + (res.reason || ""));
          } else if (res && res.created && res.created.length) {
            message.success("已完成一次主动思考，生成 " + res.created.length + " 条建议");
            if (onDataVersion) onDataVersion();
          } else {
            message.info("思考完成，暂无新建议");
          }
        })
        .catch(function (e) { message.error("思考失败：" + (e.message || "unknown")); })
        .finally(function () { setThinking(false); });
    }

    var ideaMap = {};
    ideas.forEach(function (i) { ideaMap[i.id] = i; });
    var activeCount = sugs.filter(function (s) { return s.status === "new"; }).length;

    return h("div", null,
      h("div", { style: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, alignItems: "center" } },
        h(Button, { type: "primary", loading: thinking, onClick: doThink }, "🧠 立即思考"),
        h("span", { style: { fontSize: 12, color: "rgba(0,0,0,0.45)" } },
          meta && meta.proactive_enabled
            ? "主动思考已开启，每 " + (meta.interval_minutes || 60) + " 分钟自动运行"
            : "主动思考已关闭，可手动触发"
        ),
        h("div", { style: { flex: 1 } }),
        h(Select, {
          value: filter, style: { width: 110 },
          onChange: function (v) { setFilter(v); },
          options: [
            { value: "", label: "全部建议" },
            { value: "new", label: "新建议" },
            { value: "accepted", label: "已采纳" },
            { value: "dismissed", label: "已忽略" },
          ],
        })
      ),
      (loading
        ? h("div", { style: { textAlign: "center", padding: 40 } }, h(Spin, null))
        : (sugs.length === 0
          ? h(Empty, { description: "还没有建议。积累几条灵感后点击「立即思考」，AI 会结合灵感与对话记忆主动提出研究建议" })
          : sugs.map(function (sug) {
              return h(SuggestionCard, {
                key: sug.id, suggestion: sug, ideaMap: ideaMap,
                onChanged: load,
              });
            })
          )
      )
    );
  }

  // ── ClusterCard ─────────────────────────────────────────────────
  function ClusterCard(props) {
    var cluster = props.cluster;
    var ideaMap = props.ideaMap || {};
    var ideas = (cluster.idea_ids || []).map(function (id) { return ideaMap[id]; }).filter(Boolean);

    return h(Card, {
      size: "small",
      style: { borderRadius: 10, marginBottom: 12 },
    },
      h("div", { style: { display: "flex", alignItems: "center", marginBottom: 6 } },
        h(Tag, { color: "blue" }, "研究方向"),
        h("span", { style: { fontSize: 12, color: "rgba(0,0,0,0.45)" } }, ideas.length + " 条灵感")
      ),
      h("div", { style: { fontSize: 15, fontWeight: 600, marginBottom: 6 } }, cluster.name),
      (cluster.description
        ? h("div", { style: { fontSize: 13, color: "rgba(0,0,0,0.75)", marginBottom: 8, lineHeight: 1.7 } }, cluster.description)
        : null),
      (ideas.length
        ? h("div", null,
            ideas.map(function (idea) {
              return h("div", { key: idea.id, style: { fontSize: 12, color: "rgba(0,0,0,0.55)", padding: "2px 0" } },
                "• " + ideaTitle(idea)
              );
            })
          )
        : null)
    );
  }

  // ── ClusterView: 聚类方向视图 ───────────────────────────────────
  function ClusterView(props) {
    var refreshKey = props.refreshKey;
    var [clusters, setClusters] = useState([]);
    var [ideas, setIdeas] = useState([]);
    var [loading, setLoading] = useState(false);
    var mounted = useRef(true);

    useEffect(function () {
      mounted.current = true;
      return function () { mounted.current = false; };
    }, []);

    var load = useCallback(function () {
      setLoading(true);
      Promise.all([API.listClusters(), API.listIdeas({})])
        .then(function (res) {
          if (!mounted.current) return;
          setClusters((res[0] && res[0].clusters) || []);
          setIdeas((res[1] && res[1].ideas) || []);
        })
        .catch(function (e) { if (mounted.current) message.error("加载失败：" + (e.message || "unknown")); })
        .finally(function () { if (mounted.current) setLoading(false); });
    }, []);

    useEffect(function () { load(); }, [load, refreshKey]);

    var ideaMap = {};
    ideas.forEach(function (i) { ideaMap[i.id] = i; });

    return h("div", null,
      h("div", { style: { marginBottom: 12, fontSize: 12, color: "rgba(0,0,0,0.45)" } },
        "L1 整理会把内容相近的灵感自动聚成研究方向，供后续扩充与主动建议引用"
      ),
      (loading
        ? h("div", { style: { textAlign: "center", padding: 40 } }, h(Spin, null))
        : (clusters.length === 0
          ? h(Empty, { description: "还没有聚类。在灵感板点击「L1 一键整理」生成研究方向" })
          : clusters.map(function (c) {
              return h(ClusterCard, { key: c.id, cluster: c, ideaMap: ideaMap });
            })
          )
      )
    );
  }

  // ── SettingsModal ───────────────────────────────────────────────
  function SettingsModal(props) {
    var meta = props.meta;
    var [form, setForm] = useState(null);
    var [saving, setSaving] = useState(false);

    useEffect(function () {
      if (props.open && meta) {
        setForm({
          proactive_enabled: !!meta.proactive_enabled,
          interval_minutes: meta.interval_minutes || 60,
          min_ideas: meta.min_ideas || 3,
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.open, meta]);

    function save() {
      if (!form) return;
      setSaving(true);
      API.updateMeta({
        proactive_enabled: !!form.proactive_enabled,
        interval_minutes: Math.max(10, Math.min(720, form.interval_minutes || 60)),
        min_ideas: Math.max(1, Math.min(20, form.min_ideas || 3)),
      })
        .then(function () {
          message.success("设置已保存");
          props.onClose();
          if (props.onSaved) props.onSaved();
        })
        .catch(function (e) { message.error(e.message || "保存失败"); })
        .finally(function () { setSaving(false); });
    }

    return h(Modal, {
      open: props.open, title: "思考设置", okText: "保存", cancelText: "取消",
      onCancel: props.onClose, onOk: save, confirmLoading: saving, width: 520,
    },
      (form === null
        ? null
        : h("div", null,
            h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 } },
              h("div", null,
                h("div", { style: { fontWeight: 600 } }, "主动思考"),
                h("div", { style: { fontSize: 12, color: "rgba(0,0,0,0.45)" } }, "后台定时结合灵感与对话记忆生成建议")
              ),
              h(Switch, {
                checked: form.proactive_enabled,
                onChange: function (v) { setForm(Object.assign({}, form, { proactive_enabled: v })); },
              })
            ),
            h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 } },
              h("div", { style: { fontWeight: 600 } }, "思考间隔（分钟）"),
              h(InputNumber, {
                min: 10, max: 720, value: form.interval_minutes,
                onChange: function (v) { setForm(Object.assign({}, form, { interval_minutes: v })); },
              })
            ),
            h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
              h("div", { style: { fontWeight: 600 } }, "触发最低灵感数"),
              h(InputNumber, {
                min: 1, max: 20, value: form.min_ideas,
                onChange: function (v) { setForm(Object.assign({}, form, { min_ideas: v })); },
              })
            )
          )
      )
    );
  }

  // ── UIdeasApp: 主组件 ───────────────────────────────────────────
  function UIdeasApp() {
    var [tab, setTab] = useState("ideas");
    var [meta, setMeta] = useState(null);
    var [dataVersion, setDataVersion] = useState(0);
    var [settingsOpen, setSettingsOpen] = useState(false);
    var [sseState, setSseState] = useState("connecting"); // connecting | live | closed
    var esRef = useRef(null);
    var dataVersionRef = useRef(0);

    function bumpDataVersion() {
      dataVersionRef.current += 1;
      setDataVersion(dataVersionRef.current);
    }

    // 加载 meta
    useEffect(function () {
      API.getMeta()
        .then(function (res) { setMeta((res && res.meta) || {}); })
        .catch(function () { /* 非致命 */ });
    }, [dataVersion]);

    // SSE 实时事件（网络抖动自动重连）
    useEffect(function () {
      var timer = null;

      function connect() {
        var es = new EventSource(sseUrl("/uideas/stream"));
        esRef.current = es;

        es.onopen = function () {
          setSseState("live");
          if (timer) { clearTimeout(timer); timer = null; }
        };
        es.onmessage = function (ev) {
          var data;
          try { data = JSON.parse(ev.data); } catch (e) { return; }
          if (!data || !data.type) return;
          if (data.type === "suggestion" && data.suggestions && data.suggestions.length) {
            message.info("收到 " + data.suggestions.length + " 条新的主动建议");
          }
          bumpDataVersion();
        };
        es.onerror = function () {
          // onerror 也会由网络抖动/服务端重启触发，标记重连中并自动重连
          setSseState("connecting");
          es.close();
          esRef.current = null;
          if (!timer) timer = setTimeout(connect, 3000);
        };
      }

      connect();
      return function () {
        if (timer) { clearTimeout(timer); timer = null; }
        if (esRef.current) { esRef.current.close(); esRef.current = null; }
      };
    }, []);

    var ideasCount = (meta && meta.idea_count) || 0;
    var activeSuggestionsCount = (meta && meta.active_suggestion_count) || 0;

    var headerStyle = {
      display: "flex", alignItems: "center", gap: 10,
      padding: "14px 20px", marginBottom: 16,
      background: "linear-gradient(120deg, #722ed1 0%, #2f54eb 100%)",
      borderRadius: 14, color: "#fff",
    };

    var tabs = [
      { key: "ideas", label: "💡 灵感板", title: "灵感板" },
      { key: "think", label: "🧠 思考面板", title: "思考面板" },
      { key: "clusters", label: "🗂️ 聚类方向", title: "聚类方向" },
    ];

    var content;
    if (tab === "ideas") {
      content = h(IdeaBoard, {
        refreshKey: dataVersion,
        onDataVersion: bumpDataVersion,
      });
    } else if (tab === "think") {
      content = h(ThinkPanel, {
        refreshKey: dataVersion, meta: meta,
        onDataVersion: bumpDataVersion,
      });
    } else {
      content = h(ClusterView, { refreshKey: dataVersion });
    }

    return h("div", null,
      h("div", { style: headerStyle },
        h("div", { style: { fontSize: 24, lineHeight: 1 } }, "💡"),
        h("div", { style: { flex: 1 } },
          h("div", { style: { fontSize: 18, fontWeight: 700 } }, "UIdeas · 科研灵感管理"),
          h("div", { style: { fontSize: 12, opacity: 0.85 } },
            "记录 → 整理(L1) → 扩充(L2) → 主动建议(L3)"
          )
        ),
        h(Tag, { style: { background: "rgba(255,255,255,0.18)", color: "#fff", border: "none" } },
          ideasCount + " 条灵感"
        ),
        h(Tag, { style: { background: "rgba(255,255,255,0.18)", color: "#fff", border: "none" } },
          activeSuggestionsCount + " 条建议"
        ),
        h(Tag, { style: { background: "rgba(255,255,255,0.18)", color: "#fff", border: "none" } },
          sseState === "live" ? "实时连接" : "离线"
        ),
        h(Button, {
          size: "small", style: { background: "rgba(255,255,255,0.18)", color: "#fff", border: "none" },
          onClick: function () { setSettingsOpen(true); },
        }, "⚙ 设置")
      ),
      h("div", { style: { display: "flex", gap: 8, marginBottom: 16 } },
        tabs.map(function (t) {
          return h(Button, {
            key: t.key,
            type: tab === t.key ? "primary" : "default",
            onClick: function () { setTab(t.key); },
          }, t.label);
        })
      ),
      content,
      h(SettingsModal, {
        open: settingsOpen, meta: meta,
        onClose: function () { setSettingsOpen(false); },
        onSaved: bumpDataVersion,
      })
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
