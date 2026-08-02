/**
 * ULit 文研 — frontend (runtime-loaded plugin module).
 *
 * Loaded by the host via usePluginLoader (same-origin Blob URL + dynamic
 * import). Self-registers a React route at /apps/ulit. React and antd
 * come from window.QwenPaw.host (no bundler in this context).
 *
 * Features:
 * - Project management (create, list, detail)
 * - Paper library (import PDF/BibTeX/DOI, list, search, edit metadata)
 * - PDF reader (iframe-based) with annotation list
 * - AI Q&A with evidence-grounded answers and source references
 * - Evidence cards with verification workflow
 * - Notes (create, edit, generate from annotations)
 * - Export (Markdown, BibTeX, JSON, CSV)
 * - Job center (progress tracking via SSE)
 */
(function () {
  var QwenPaw = window.QwenPaw;
  if (!QwenPaw || !QwenPaw.host || !QwenPaw.registerRoutes) {
    console.error("[ulit] window.QwenPaw not ready — cannot register.");
    return;
  }

  var host = QwenPaw.host;
  var React = host.React;
  var antd = host.antd;
  var h = React.createElement;
  var ReactMarkdown = host.ReactMarkdown;
  var remarkGfm = host.remarkGfm;

  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;
  var useCallback = React.useCallback;

  var Button = antd.Button;
  var Input = antd.Input;
  var Modal = antd.Modal;
  var Select = antd.Select;
  var Table = antd.Table;
  var Tag = antd.Tag;
  var Tabs = antd.Tabs;
  var Card = antd.Card;
  var Space = antd.Space;
  var Tooltip = antd.Tooltip;
  var Upload = antd.Upload;
  var message = antd.message;
  var Empty = antd.Empty;
  var Progress = antd.Progress;
  var Spin = antd.Spin;
  var Popconfirm = antd.Popconfirm;
  var TextArea = Input.TextArea;
  var Typography = antd.Typography;
  var Divider = antd.Divider;
  var Badge = antd.Badge;
  var List = antd.List;
  var Form = antd.Form;
  var Drawer = antd.Drawer;
  var Collapse = antd.Collapse;
  var Statistic = antd.Statistic;
  var Alert = antd.Alert;
  var Switch = antd.Switch;
  var Radio = antd.Radio;

  // ── Colors ──────────────────────────────────────────────────────
  var C = {
    primary: "#7c3aed",
    bg: "#faf9fc",
    cardBg: "#ffffff",
    border: "rgba(15,23,42,0.08)",
    text: "#1f2937",
    sub: "#6b7280",
    muted: "#9ca3af",
    highlight: "#fbbf24",
    evidence: "#10b981",
    ai: "#3b82f6",
    danger: "#ef4444",
  };

  var STATUS_COLORS = {
    unread: "#9ca3af",
    skimming: "#f59e0b",
    reading: "#3b82f6",
    read: "#22c55e",
    shelved: "#6b7280",
  };

  var STATUS_LABELS = {
    unread: "未读",
    skimming: "略读",
    reading: "精读中",
    read: "已读",
    shelved: "搁置",
  };

  var EVIDENCE_KIND_LABELS = {
    support: "支持",
    refute: "反驳",
    background: "背景",
    method: "方法",
    data: "数据",
  };

  var VERIFY_LABELS = {
    pending: "待确认",
    confirmed: "已确认",
    rejected: "已驳回",
    grounded: "已证实",
    partially_grounded: "部分证实",
    ungrounded: "未证实",
  };

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
    var ct = resp.headers.get("content-type") || "";
    if (ct.indexOf("json") >= 0) return resp.json();
    return resp.text();
  }

  function fileContentUrl(fileId) {
    return apiUrl("/ulit/files/" + fileId + "/content") +
      (authToken() ? "?token=" + encodeURIComponent(authToken()) : "");
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
    // Projects
    listProjects: function () { return apiFetch("/ulit/projects"); },
    createProject: function (data) { return apiFetch("/ulit/projects", { method: "POST", body: data }); },
    getProject: function (id) { return apiFetch("/ulit/projects/" + id); },
    updateProject: function (id, data) { return apiFetch("/ulit/projects/" + id, { method: "PATCH", body: data }); },
    deleteProject: function (id) { return apiFetch("/ulit/projects/" + id, { method: "DELETE" }); },
    getProjectPapers: function (id) { return apiFetch("/ulit/projects/" + id + "/papers"); },
    addPaperToProject: function (pid, paperId) { return apiFetch("/ulit/projects/" + pid + "/papers", { method: "POST", body: { paper_id: paperId } }); },
    removePaperFromProject: function (pid, paperId) { return apiFetch("/ulit/projects/" + pid + "/papers/" + paperId, { method: "DELETE" }); },

    // Papers
    listPapers: function (params) {
      var qs = new URLSearchParams(params).toString();
      return apiFetch("/ulit/papers" + (qs ? "?" + qs : ""));
    },
    searchPapers: function (data) { return apiFetch("/ulit/search", { method: "POST", body: data }); },
    getPaper: function (id) { return apiFetch("/ulit/papers/" + id); },
    updatePaper: function (id, data) { return apiFetch("/ulit/papers/" + id, { method: "PATCH", body: data }); },
    deletePaper: function (id) { return apiFetch("/ulit/papers/" + id, { method: "DELETE" }); },
    restorePaper: function (id) { return apiFetch("/ulit/papers/" + id + "/restore", { method: "POST" }); },
    mergePapers: function (data) { return apiFetch("/ulit/papers/merge", { method: "POST", body: data }); },

    // Import
    uploadFiles: function (files, projectId) {
      var fd = new FormData();
      files.forEach(function (f) { fd.append("files", f); });
      var path = "/ulit/imports/files";
      if (projectId) path += "?project_id=" + encodeURIComponent(projectId);
      return apiFetch(path, { method: "POST", body: fd });
    },
    importIdentifiers: function (data) { return apiFetch("/ulit/imports/identifiers", { method: "POST", body: data }); },
    importBibliography: function (data) { return apiFetch("/ulit/imports/bibliography", { method: "POST", body: data }); },

    // Files
    getPaperFiles: function (pid) { return apiFetch("/ulit/papers/" + pid + "/files"); },
    getFileDocument: function (fid) { return apiFetch("/ulit/files/" + fid + "/document"); },
    reparseFile: function (fid) { return apiFetch("/ulit/files/" + fid + "/reparse", { method: "POST" }); },

    // Annotations
    listAnnotations: function (fid) { return apiFetch("/ulit/files/" + fid + "/annotations"); },
    createAnnotation: function (fid, data) { return apiFetch("/ulit/files/" + fid + "/annotations", { method: "POST", body: data }); },
    updateAnnotation: function (aid, data) { return apiFetch("/ulit/annotations/" + aid, { method: "PATCH", body: data }); },
    deleteAnnotation: function (aid) { return apiFetch("/ulit/annotations/" + aid, { method: "DELETE" }); },

    // Notes
    listNotes: function (params) {
      var qs = new URLSearchParams(params).toString();
      return apiFetch("/ulit/notes" + (qs ? "?" + qs : ""));
    },
    createNote: function (data) { return apiFetch("/ulit/notes", { method: "POST", body: data }); },
    getNote: function (id) { return apiFetch("/ulit/notes/" + id); },
    updateNote: function (id, data) { return apiFetch("/ulit/notes/" + id, { method: "PATCH", body: data }); },
    deleteNote: function (id) { return apiFetch("/ulit/notes/" + id, { method: "DELETE" }); },
    noteFromAnnotations: function (data) { return apiFetch("/ulit/notes/from-annotations", { method: "POST", body: data }); },

    // Evidence
    listEvidence: function (pid) { return apiFetch("/ulit/projects/" + pid + "/evidence"); },
    createEvidence: function (pid, data) { return apiFetch("/ulit/projects/" + pid + "/evidence", { method: "POST", body: data }); },
    verifyEvidence: function (eid, data) { return apiFetch("/ulit/evidence/" + eid + "/verify", { method: "PATCH", body: data }); },

    // AI
    generateReadingCard: function (pid) { return apiFetch("/ulit/papers/" + pid + "/reading-card", { method: "POST" }); },
    askPaper: function (pid, data) { return apiFetch("/ulit/papers/" + pid + "/ask", { method: "POST", body: data }); },
    askPaperAsync: function (pid, data) { return apiFetch("/ulit/papers/" + pid + "/ask-async", { method: "POST", body: data }); },
    getAIRun: function (rid) { return apiFetch("/ulit/ai/runs/" + rid); },

    // Jobs
    listJobs: function (params) {
      var qs = new URLSearchParams(params).toString();
      return apiFetch("/ulit/jobs" + (qs ? "?" + qs : ""));
    },
    getJob: function (id) { return apiFetch("/ulit/jobs/" + id); },
    cancelJob: function (id) { return apiFetch("/ulit/jobs/" + id + "/cancel", { method: "POST" }); },
    retryJob: function (id) { return apiFetch("/ulit/jobs/" + id + "/retry", { method: "POST" }); },

    // Export
    exportData: function (data) { return apiFetch("/ulit/export", { method: "POST", body: data }); },

    // Health
    health: function () { return apiFetch("/ulit/health"); },
  };

  // ── Helper: format date ──────────────────────────────────────────
  function fmtDate(s) {
    if (!s) return "";
    try {
      var d = new Date(s);
      return d.toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) { return s; }
  }

  // ── Import Modal ─────────────────────────────────────────────────
  function ImportModal(props) {
    var _useState = useState("upload");
    var tab = _useState[0];
    var setTab = _useState[1];

    var _useState2 = useState("");
    var doiText = _useState2[0];
    var setDoiText = _useState2[1];

    var _useState3 = useState("");
    var bibText = _useState3[0];
    var setBibText = _useState3[1];

    var _useState4 = useState("bibtex");
    var bibFormat = _useState4[0];
    var setBibFormat = _useState4[1];

    var _useState5 = useState(false);
    var loading = _useState5[0];
    var setLoading = _useState5[1];

    var handleUpload = useCallback(async function (info) {
      if (info.file.status === "done" || info.file.status === "error" || !info.file.status) {
        setLoading(true);
        try {
          var result = await API.uploadFiles([info.file.originFileObj || info.file], props.projectId);
          if (result.results) {
            var ok = result.results.filter(function (r) { return r.status === "imported"; });
            var fail = result.results.filter(function (r) { return r.status === "failed"; });
            if (ok.length) message.success(ok.length + " 篇文献导入成功");
            if (fail.length) message.error(fail.length + " 篇导入失败");
          }
          props.onClose();
          props.onRefresh();
        } catch (e) {
          message.error("导入失败: " + e.message);
        } finally {
          setLoading(false);
        }
      }
    }, [props.projectId, props.onClose, props.onRefresh]);

    var handleImportDOI = useCallback(async function () {
      if (!doiText.trim()) { message.warning("请输入 DOI"); return; }
      setLoading(true);
      try {
        var ids = doiText.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
        var result = await API.importIdentifiers({ identifiers: ids, project_id: props.projectId });
        message.success((result.papers || []).length + " 篇文献已导入");
        setDoiText("");
        props.onClose();
        props.onRefresh();
      } catch (e) {
        message.error("导入失败: " + e.message);
      } finally {
        setLoading(false);
      }
    }, [doiText, props.projectId, props.onClose, props.onRefresh]);

    var handleImportBib = useCallback(async function () {
      if (!bibText.trim()) { message.warning("请输入文献内容"); return; }
      setLoading(true);
      try {
        var result = await API.importBibliography({ content: bibText, format: bibFormat, project_id: props.projectId });
        message.success((result.papers || []).length + " 篇文献已导入");
        setBibText("");
        props.onClose();
        props.onRefresh();
      } catch (e) {
        message.error("导入失败: " + e.message);
      } finally {
        setLoading(false);
      }
    }, [bibText, bibFormat, props.projectId, props.onClose, props.onRefresh]);

    return h(Modal, {
      open: props.open,
      onCancel: props.onClose,
      title: "导入文献",
      footer: null,
      width: 600,
    },
      h(Tabs, {
        activeKey: tab,
        onChange: setTab,
        items: [
          {
            key: "upload",
            label: "上传 PDF",
            children: h("div", { style: { padding: "16px 0" } },
              h(Upload.Dragger, {
                accept: ".pdf",
                multiple: true,
                customRequest: handleUpload,
                showUploadList: false,
                disabled: loading,
              },
                h("p", { style: { fontSize: 40, color: C.primary, marginBottom: 8 } }, "📄"),
                h("p", { style: { color: C.text, fontWeight: 500 } }, "点击或拖拽 PDF 文件到此处"),
                h("p", { style: { color: C.sub, fontSize: 12 } }, "支持单个或批量上传，单个文件最大 200MB")
              ),
              loading && h("div", { style: { textAlign: "center", marginTop: 16 } },
                h(Spin, { tip: "正在导入..." })
              )
            )
          },
          {
            key: "doi",
            label: "DOI 导入",
            children: h("div", { style: { padding: "16px 0" } },
              h(TextArea, {
                value: doiText,
                onChange: function (e) { setDoiText(e.target.value); },
                placeholder: "每行一个 DOI，例如:\n10.1145/3292500.3330701\n10.1038/s41586-021-03819-2",
                rows: 6,
              }),
              h("div", { style: { textAlign: "right", marginTop: 12 } },
                h(Button, {
                  type: "primary",
                  loading: loading,
                  onClick: handleImportDOI,
                  style: { background: C.primary, borderColor: C.primary },
                }, "导入")
              )
            )
          },
          {
            key: "bib",
            label: "文献库导入",
            children: h("div", { style: { padding: "16px 0" } },
              h(Select, {
                value: bibFormat,
                onChange: setBibFormat,
                style: { width: 200, marginBottom: 12 },
                options: [
                  { value: "bibtex", label: "BibTeX" },
                  { value: "ris", label: "RIS" },
                  { value: "csl_json", label: "CSL-JSON" },
                ]
              }),
              h(TextArea, {
                value: bibText,
                onChange: function (e) { setBibText(e.target.value); },
                placeholder: "粘贴 " + bibFormat.toUpperCase() + " 格式内容...",
                rows: 8,
              }),
              h("div", { style: { textAlign: "right", marginTop: 12 } },
                h(Button, {
                  type: "primary",
                  loading: loading,
                  onClick: handleImportBib,
                  style: { background: C.primary, borderColor: C.primary },
                }, "导入")
              )
            )
          }
        ]
      })
    );
  }

  // ── Project List View ────────────────────────────────────────────
  function ProjectListView(props) {
    var _useState6 = useState([]);
    var projects = _useState6[0];
    var setProjects = _useState6[1];

    var _useState7 = useState(false);
    var loading = _useState7[0];
    var setLoading = _useState7[1];

    var _useState8 = useState(false);
    var showCreate = _useState8[0];
    var setShowCreate = _useState8[1];

    var _useState9 = useState({ name: "", question: "", description: "" });
    var newProj = _useState9[0];
    var setNewProj = _useState9[1];

    var load = useCallback(async function () {
      setLoading(true);
      try {
        var data = await API.listProjects();
        setProjects(data.projects || []);
      } catch (e) {
        message.error("加载项目失败: " + e.message);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(function () { load(); }, [load]);

    var handleCreate = useCallback(async function () {
      if (!newProj.name.trim()) { message.warning("请输入项目名称"); return; }
      try {
        await API.createProject(newProj);
        message.success("项目创建成功");
        setShowCreate(false);
        setNewProj({ name: "", question: "", description: "" });
        load();
      } catch (e) {
        message.error("创建失败: " + e.message);
      }
    }, [newProj, load]);

    var handleDelete = useCallback(async function (id) {
      try {
        await API.deleteProject(id);
        message.success("项目已删除");
        load();
      } catch (e) {
        message.error("删除失败: " + e.message);
      }
    }, [load]);

    return h("div", { style: { padding: 24 } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } },
        h(Typography.Title, { level: 4, style: { margin: 0 } }, "研究项目"),
        h(Button, {
          type: "primary",
          onClick: function () { setShowCreate(true); },
          style: { background: C.primary, borderColor: C.primary },
        }, "+ 新建项目")
      ),
      loading ? h(Spin, { style: { display: "block", margin: "40px auto" } }) :
        projects.length === 0 ? h(Empty, { description: "暂无项目，点击右上角创建" }) :
          h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 } },
            projects.map(function (p) {
              return h(Card, {
                key: p.id,
                hoverable: true,
                onClick: function () { props.onOpenProject(p.id); },
                style: { borderRadius: 12, border: "1px solid " + C.border },
                styles: { body: { padding: 20 } },
              },
                h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "start" } },
                  h("div", { style: { flex: 1 } },
                    h(Typography.Text, { strong: true, style: { fontSize: 16 } }, p.name),
                    h("br"),
                    p.question && h(Typography.Text, { type: "secondary", style: { fontSize: 13 } }, "📋 ", p.question),
                  ),
                  h(Popconfirm, {
                    title: "确认删除此项目？",
                    onConfirm: function (e) { e.stopPropagation(); handleDelete(p.id); },
                  },
                    h(Button, {
                      type: "text",
                      size: "small",
                      danger: true,
                      onClick: function (e) { e.stopPropagation(); },
                    }, "🗑")
                  )
                ),
                h("div", { style: { marginTop: 12, display: "flex", gap: 16 } },
                  h(Statistic, { title: "文献数", value: p.paper_count || 0, valueStyle: { fontSize: 18, color: C.primary } }),
                  h(Statistic, { title: "状态", value: p.status === "active" ? "活跃" : p.status, valueStyle: { fontSize: 14 } }),
                ),
                h("div", { style: { marginTop: 8, color: C.muted, fontSize: 12 } }, "更新于 " + fmtDate(p.updated_at))
              );
            })
          ),
      h(Modal, {
        open: showCreate,
        onCancel: function () { setShowCreate(false); },
        title: "新建研究项目",
        onOk: handleCreate,
        okButtonProps: { style: { background: C.primary, borderColor: C.primary } },
      },
        h(Space, { direction: "vertical", style: { width: "100%" } },
          h("div", null,
            h(Typography.Text, { type: "secondary" }, "项目名称"),
            h(Input, {
              value: newProj.name,
              onChange: function (e) { setNewProj(Object.assign({}, newProj, { name: e.target.value })); },
              placeholder: "例如：大语言模型安全性研究",
            })
          ),
          h("div", null,
            h(Typography.Text, { type: "secondary" }, "研究问题"),
            h(Input, {
              value: newProj.question,
              onChange: function (e) { setNewProj(Object.assign({}, newProj, { question: e.target.value })); },
              placeholder: "你想回答什么研究问题？",
            })
          ),
          h("div", null,
            h(Typography.Text, { type: "secondary" }, "描述"),
            h(TextArea, {
              value: newProj.description,
              onChange: function (e) { setNewProj(Object.assign({}, newProj, { description: e.target.value })); },
              placeholder: "项目描述...",
              rows: 3,
            })
          )
        )
      )
    );
  }

  // ── Paper Library View ───────────────────────────────────────────
  function PaperLibraryView(props) {
    var _s1 = useState([]);
    var papers = _s1[0]; var setPapers = _s1[1];
    var _s2 = useState(false); var loading = _s2[0]; var setLoading = _s2[1];
    var _s3 = useState(""); var searchQuery = _s3[0]; var setSearchQuery = _s3[1];
    var _s4 = useState(false); var showImport = _s4[0]; var setShowImport = _s4[1];

    var load = useCallback(async function () {
      setLoading(true);
      try {
        var data;
        if (searchQuery.trim()) {
          data = await API.searchPapers({ query: searchQuery, limit: 200 });
        } else {
          data = await API.listPapers({ limit: 200 });
        }
        setPapers(data.papers || []);
      } catch (e) {
        message.error("加载文献失败: " + e.message);
      } finally {
        setLoading(false);
      }
    }, [searchQuery]);

    useEffect(function () { load(); }, [load]);

    var columns = [
      {
        title: "标题",
        dataIndex: "title",
        key: "title",
        render: function (text, record) {
          return h("a", {
            onClick: function () { props.onOpenPaper(record.id); },
            style: { color: C.primary, fontWeight: 500 }
          }, text || "(未命名)");
        }
      },
      { title: "年份", dataIndex: "year", key: "year", width: 80 },
      { title: "来源", dataIndex: "venue", key: "venue", width: 180, ellipsis: true },
      {
        title: "状态", dataIndex: "status", key: "status", width: 100,
        render: function (s) { return h(Tag, { color: STATUS_COLORS[s] || C.muted }, STATUS_LABELS[s] || s); }
      },
      {
        title: "PDF", dataIndex: "has_pdf", key: "has_pdf", width: 60,
        render: function (v) { return v ? h(Tag, { color: "blue" }, "有") : h(Tag, null, "无"); }
      },
      {
        title: "标签", dataIndex: "tags", key: "tags", width: 150,
        render: function (tags) { return (tags || []).map(function (t) { return h(Tag, { key: t, size: "small" }, t); }); }
      },
      {
        title: "操作", key: "action", width: 120,
        render: function (_, record) {
          return h(Space, { size: "small" },
            h(Button, { size: "small", type: "link", onClick: function () { props.onOpenPaper(record.id); } }, "打开"),
            h(Popconfirm, {
              title: "确认删除此文献？",
              onConfirm: async function () {
                try { await API.deletePaper(record.id); message.success("已删除"); load(); }
                catch (e) { message.error("删除失败"); }
              }
            },
              h(Button, { size: "small", type: "link", danger: true }, "删除")
            )
          );
        }
      },
    ];

    return h("div", { style: { padding: 24 } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } },
        h(Typography.Title, { level: 4, style: { margin: 0 } }, "全部文献"),
        h(Space, null,
          h(Input.Search, {
            placeholder: "搜索标题、DOI...",
            value: searchQuery,
            onChange: function (e) { setSearchQuery(e.target.value); },
            onSearch: load,
            style: { width: 250 },
            allowClear: true,
          }),
          h(Button, {
            type: "primary",
            onClick: function () { setShowImport(true); },
            style: { background: C.primary, borderColor: C.primary },
          }, "+ 导入文献")
        )
      ),
      loading ? h(Spin, { style: { display: "block", margin: "40px auto" } }) :
        h(Table, {
          columns: columns,
          dataSource: papers,
          rowKey: "id",
          pagination: { pageSize: 20, showSizeChanger: true },
          size: "middle",
        }),
      h(ImportModal, {
        open: showImport,
        onClose: function () { setShowImport(false); },
        onRefresh: load,
        projectId: null,
      })
    );
  }

  // ── Paper Detail / Reader View ───────────────────────────────────
  function PaperDetailView(props) {
    var paperId = props.paperId;
    var _s1 = useState(null); var paper = _s1[0]; var setPaper = _s1[1];
    var _s2 = useState([]); var annotations = _s2[0]; var setAnnotations = _s2[1];
    var _s3 = useState(false); var loading = _s3[0]; var setLoading = _s3[1];
    var _s4 = useState("reader"); var activeTab = _s4[0]; var setActiveTab = _s4[1];
    var _s5 = useState(""); var aiQuestion = _s5[0]; var setAiQuestion = _s5[1];
    var _s6 = useState(null); var aiResult = _s6[0]; var setAiResult = _s6[1];
    var _s7 = useState(false); var aiLoading = _s7[0]; var setAiLoading = _s7[1];
    var _s8 = useState(null); var readingCard = _s8[0]; var setReadingCard = _s8[1];
    var _s9 = useState(false); var cardLoading = _s9[0]; var setCardLoading = _s9[1];

    var fileId = paper && paper.files && paper.files[0] ? paper.files[0].id : null;

    var load = useCallback(async function () {
      setLoading(true);
      try {
        var data = await API.getPaper(paperId);
        setPaper(data);
        if (data.files && data.files[0]) {
          var annos = await API.listAnnotations(data.files[0].id);
          setAnnotations(annos.annotations || []);
        }
      } catch (e) {
        message.error("加载文献失败: " + e.message);
      } finally {
        setLoading(false);
      }
    }, [paperId]);

    useEffect(function () { load(); }, [load]);

    var handleAsk = useCallback(async function () {
      if (!aiQuestion.trim()) return;
      setAiLoading(true);
      setAiResult(null);
      try {
        var result = await API.askPaper(paperId, { question: aiQuestion, scope: "paper" });
        setAiResult(result);
      } catch (e) {
        message.error("AI 回答失败: " + e.message);
      } finally {
        setAiLoading(false);
      }
    }, [paperId, aiQuestion]);

    var handleReadingCard = useCallback(async function () {
      setCardLoading(true);
      try {
        var result = await API.generateReadingCard(paperId);
        setReadingCard(result.card || {});
      } catch (e) {
        message.error("阅读卡生成失败: " + e.message);
      } finally {
        setCardLoading(false);
      }
    }, [paperId]);

    var handleAddAnnotation = useCallback(async function () {
      if (!fileId) { message.warning("此文獻没有PDF附件"); return; }
      try {
        await API.createAnnotation(fileId, {
          file_id: fileId,
          page_index: 0,
          type: "note",
          comment: "新批注",
          selected_text: "",
        });
        message.success("批注已添加");
        var annos = await API.listAnnotations(fileId);
        setAnnotations(annos.annotations || []);
      } catch (e) {
        message.error("添加失败: " + e.message);
      }
    }, [fileId]);

    if (loading) return h(Spin, { style: { display: "block", margin: "60px auto" } });
    if (!paper) return h(Empty, { description: "文献不存在" });

    return h("div", { style: { height: "100%", display: "flex", flexDirection: "column" } },
      // Header bar
      h("div", { style: { padding: "12px 24px", borderBottom: "1px solid " + C.border, background: C.cardBg, display: "flex", alignItems: "center", gap: 12 } },
        h(Button, { type: "text", onClick: props.onBack }, "← 返回"),
        h("div", { style: { flex: 1 } },
          h(Typography.Text, { strong: true, style: { fontSize: 16 } }, paper.title || "(未命名)"),
          paper.year && h(Typography.Text, { type: "secondary", style: { marginLeft: 8 } }, "(" + paper.year + ")")
        ),
        h(Tag, { color: STATUS_COLORS[paper.status] || C.muted }, STATUS_LABELS[paper.status] || paper.status),
      ),
      // Tab bar
      h(Tabs, {
        activeKey: activeTab,
        onChange: setActiveTab,
        style: { padding: "0 24px", background: C.cardBg, borderBottom: "1px solid " + C.border },
        items: [
          { key: "reader", label: "📄 阅读" },
          { key: "annotations", label: "🖍 标注 (" + annotations.length + ")" },
          { key: "ai", label: "🤖 AI 助手" },
          { key: "metadata", label: "ℹ️ 信息" },
        ]
      }),
      // Content area
      h("div", { style: { flex: 1, overflow: "auto", background: C.bg } },
        activeTab === "reader" && h("div", { style: { height: "100%" } },
          fileId ?
            h("iframe", {
              src: fileContentUrl(fileId),
              style: { width: "100%", height: "100%", border: 0 },
              title: "PDF Reader",
            }) :
            h("div", { style: { padding: 40, textAlign: "center" } },
              h(Empty, { description: "此文献暂无 PDF 附件" })
            )
        ),
        activeTab === "annotations" && h("div", { style: { padding: 24 } },
          h("div", { style: { marginBottom: 16 } },
            h(Button, {
              type: "primary",
              size: "small",
              onClick: handleAddAnnotation,
              style: { background: C.primary, borderColor: C.primary },
            }, "+ 添加批注")
          ),
          annotations.length === 0 ? h(Empty, { description: "暂无标注" }) :
            h(List, {
              dataSource: annotations,
              renderItem: function (a) {
                return h(List.Item, {
                  actions: [
                    h(Popconfirm, {
                      title: "删除此标注？",
                      onConfirm: async function () {
                        await API.deleteAnnotation(a.id);
                        message.success("已删除");
                        if (fileId) {
                          var annos = await API.listAnnotations(fileId);
                          setAnnotations(annos.annotations || []);
                        }
                      }
                    }, h(Button, { size: "small", type: "link", danger: true }, "删除"))
                  ]
                },
                  h(List.Item.Meta, {
                    title: h(Space, null,
                      h(Tag, { color: a.type === "highlight" ? "gold" : a.type === "note" ? "blue" : "default" }, a.type),
                      h(Typography.Text, { type: "secondary", style: { fontSize: 12 } }, "第 " + (a.page_index + 1) + " 页")
                    ),
                    description: h("div", null,
                      a.selected_text && h("blockquote", { style: { borderLeft: "3px solid " + C.primary, paddingLeft: 12, margin: "4px 0", color: C.sub } }, a.selected_text.substring(0, 200)),
                      a.comment && h("div", { style: { marginTop: 4 } }, h(Typography.Text, null, "📝 " + a.comment))
                    )
                  })
                );
              }
            })
        ),
        activeTab === "ai" && h("div", { style: { padding: 24, maxWidth: 900, margin: "0 auto" } },
          // Reading card section
          h(Card, { title: "快捷阅读卡", size: "small", style: { marginBottom: 16, borderRadius: 8 } },
            !readingCard || Object.keys(readingCard).length === 0 ?
              h(Button, { loading: cardLoading, onClick: handleReadingCard, type: "primary", style: { background: C.primary, borderColor: C.primary } }, "生成阅读卡") :
              h("div", { style: { fontSize: 13, lineHeight: 1.8 } },
                readingCard.one_liner && h("div", null, h(Typography.Text, { strong: true }, "一句话判断: "), readingCard.one_liner),
                readingCard.contributions && h("div", null, h(Typography.Text, { strong: true }, "核心贡献: "), readingCard.contributions),
                readingCard.methodology && h("div", null, h(Typography.Text, { strong: true }, "方法: "), readingCard.methodology),
                readingCard.experiments && h("div", null, h(Typography.Text, { strong: true }, "实验: "), readingCard.experiments),
                readingCard.conclusions && h("div", null, h(Typography.Text, { strong: true }, "结论: "), readingCard.conclusions),
                readingCard.limitations && h("div", null, h(Typography.Text, { strong: true }, "局限: "), readingCard.limitations),
                readingCard.raw_text && h("div", null, h(Typography.Text, { type: "secondary" }, readingCard.raw_text.substring(0, 500))),
                h(Button, { size: "small", type: "link", onClick: handleReadingCard, style: { marginTop: 8 } }, "重新生成")
              )
          ),
          // Q&A section
          h(Card, { title: "向文献提问", size: "small", style: { borderRadius: 8 } },
            h(Space.Compact, { style: { width: "100%", marginBottom: 12 } },
              h(Input, {
                value: aiQuestion,
                onChange: function (e) { setAiQuestion(e.target.value); },
                placeholder: "例如：这篇论文的主要贡献是什么？",
                onPressEnter: handleAsk,
                disabled: aiLoading,
              }),
              h(Button, {
                type: "primary",
                loading: aiLoading,
                onClick: handleAsk,
                style: { background: C.ai, borderColor: C.ai },
              }, "提问")
            ),
            aiLoading && h(Spin, { tip: "AI 正在分析文献...", style: { display: "block", padding: 20 } }),
            aiResult && h("div", { style: { marginTop: 16 } },
              aiResult.grounding_status && h(Alert, {
                type: aiResult.grounding_status === "grounded" ? "success" :
                  aiResult.grounding_status === "partially_grounded" ? "warning" : "info",
                message: "证据状态: " + (VERIFY_LABELS[aiResult.grounding_status] || aiResult.grounding_status),
                style: { marginBottom: 12 }
              }),
              aiResult.answer_markdown && (ReactMarkdown ?
                h(ReactMarkdown, { remarkPlugins: remarkGfm ? [remarkGfm] : [] }, aiResult.answer_markdown) :
                h("div", { style: { whiteSpace: "pre-wrap" } }, aiResult.answer_markdown)
              ),
              aiResult.claims && aiResult.claims.length > 0 && h(Divider),
              aiResult.claims && aiResult.claims.length > 0 && h("div", null,
                h(Typography.Text, { strong: true }, "证据声明:"),
                aiResult.claims.map(function (claim, i) {
                  return h(Card, {
                    key: i, size: "small", style: { marginTop: 8, borderRadius: 6, background: "#f8f9fa" }
                  },
                    h("div", null,
                      h(Typography.Text, null, claim.claim),
                      h(Space, { style: { marginLeft: 8 } },
                        claim.confidence && h(Tag, {
                          color: claim.confidence === "high" ? "green" : claim.confidence === "medium" ? "gold" : "default",
                          size: "small"
                        }, claim.confidence),
                        claim.verified === false && h(Tag, { color: "red", size: "small" }, "引文未验证")
                      )
                    ),
                    claim.quotes && claim.quotes.length > 0 && h("div", { style: { marginTop: 4, color: C.sub, fontSize: 12 } },
                      claim.quotes.map(function (q, j) { return h("div", { key: j, style: { fontStyle: "italic" } }, '"' + q.substring(0, 150) + '"'); })
                    )
                  );
                })
              ),
              aiResult.uncertainties && aiResult.uncertainties.length > 0 && h("div", { style: { marginTop: 12 } },
                h(Typography.Text, { type: "secondary" }, "⚠️ 不确定项: " + aiResult.uncertainties.join("; "))
              )
            )
          )
        ),
        activeTab === "metadata" && h("div", { style: { padding: 24, maxWidth: 700 } },
          h(Card, { title: "文献信息", style: { borderRadius: 8 } },
            h("dl", { style: { lineHeight: 2.2 } },
              h("dt", null, h(Typography.Text, { strong: true }, "标题")),
              h("dd", null, paper.title || "-"),
              h("dt", null, h(Typography.Text, { strong: true }, "年份")),
              h("dd", null, paper.year || "-"),
              h("dt", null, h(Typography.Text, { strong: true }, "来源")),
              h("dd", null, paper.venue || "-"),
              h("dt", null, h(Typography.Text, { strong: true }, "DOI")),
              h("dd", null, paper.doi || "-"),
              h("dt", null, h(Typography.Text, { strong: true }, "语言")),
              h("dd", null, paper.language || "-"),
              h("dt", null, h(Typography.Text, { strong: true }, "摘要")),
              h("dd", { style: { whiteSpace: "pre-wrap" } }, paper.abstract || "-"),
              paper.tags && paper.tags.length > 0 && h("dt", null, h(Typography.Text, { strong: true }, "标签")),
              paper.tags && paper.tags.length > 0 && h("dd", null, paper.tags.map(function (t) { return h(Tag, { key: t }, t); })),
              paper.identifiers && paper.identifiers.length > 0 && h("dt", null, h(Typography.Text, { strong: true }, "标识符")),
              paper.identifiers && paper.identifiers.length > 0 && h("dd", null, paper.identifiers.map(function (i) { return h(Tag, { key: i.scheme + ":" + i.value, size: "small" }, i.scheme + ": " + i.value); }))
            )
          )
        )
      )
    );
  }

  // ── Job Center View ──────────────────────────────────────────────
  function JobCenterView(props) {
    var _s1 = useState([]); var jobs = _s1[0]; var setJobs = _s1[1];
    var _s2 = useState(false); var loading = _s2[0]; var setLoading = _s2[1];
    var _s3 = useState({}); var sseSources = _s3[0]; var setSseSources = _s3[1];

    var load = useCallback(async function () {
      setLoading(true);
      try {
        var data = await API.listJobs({ limit: 50 });
        setJobs(data.jobs || []);
      } catch (e) {
        message.error("加载任务失败: " + e.message);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(function () {
      load();
      var timer = setInterval(load, 5000);
      return function () { clearInterval(timer); };
    }, [load]);

    var columns = [
      { title: "类型", dataIndex: "type", key: "type", width: 160, render: function (t) { return h(Tag, null, t); } },
      {
        title: "状态", dataIndex: "state", key: "state", width: 120,
        render: function (s) {
          var colors = { queued: "default", running: "processing", succeeded: "success", failed: "error", cancelled: "default", interrupted: "warning" };
          var labels = { queued: "排队中", running: "运行中", succeeded: "已完成", failed: "失败", cancelled: "已取消", interrupted: "已中断" };
          return h(Badge, { status: colors[s] || "default", text: labels[s] || s });
        }
      },
      {
        title: "进度", dataIndex: "progress", key: "progress", width: 180,
        render: function (p, record) {
          return h(Progress, {
            percent: Math.round((p || 0) * 100),
            size: "small",
            status: record.state === "failed" ? "exception" : record.state === "succeeded" ? "success" : "active"
          });
        }
      },
      { title: "创建时间", dataIndex: "created_at", key: "created_at", width: 180, render: fmtDate },
      {
        title: "操作", key: "action", width: 140,
        render: function (_, record) {
          return h(Space, { size: "small" },
            (record.state === "running" || record.state === "queued") &&
            h(Button, { size: "small", type: "link", danger: true, onClick: async function () {
              await API.cancelJob(record.id); message.success("已取消"); load();
            } }, "取消"),
            (record.state === "failed" || record.state === "interrupted") &&
            h(Button, { size: "small", type: "link", onClick: async function () {
              await API.retryJob(record.id); message.success("已重试"); load();
            } }, "重试"),
          );
        }
      },
    ];

    return h("div", { style: { padding: 24 } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } },
        h(Typography.Title, { level: 4, style: { margin: 0 } }, "任务中心"),
        h(Button, { onClick: load }, "刷新")
      ),
      loading ? h(Spin, { style: { display: "block", margin: "40px auto" } }) :
        h(Table, {
          columns: columns,
          dataSource: jobs,
          rowKey: "id",
          pagination: { pageSize: 15 },
          size: "middle",
        })
    );
  }

  // ── Export Modal ─────────────────────────────────────────────────
  function ExportModal(props) {
    var _s1 = useState("markdown"); var format = _s1[0]; var setFormat = _s1[1];
    var _s2 = useState(true); var includeAnnos = _s2[0]; var setIncludeAnnos = _s2[1];
    var _s3 = useState(true); var includeEvidence = _s3[0]; var setIncludeEvidence = _s3[1];
    var _s4 = useState(false); var loading = _s4[0]; var setLoading = _s4[1];
    var _s5 = useState(""); var result = _s5[0]; var setResult = _s5[1];

    var handleExport = useCallback(async function () {
      setLoading(true);
      setResult("");
      try {
        var content = await API.exportData({
          project_id: props.projectId,
          format: format,
          include_annotations: includeAnnos,
          include_evidence: includeEvidence,
        });
        setResult(content);
        message.success("导出成功");
      } catch (e) {
        message.error("导出失败: " + e.message);
      } finally {
        setLoading(false);
      }
    }, [props.projectId, format, includeAnnos, includeEvidence]);

    var handleDownload = useCallback(function () {
      var blob = new Blob([result], { type: "text/plain" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      var ext = format === "bibtex" ? "bib" : format === "json" ? "json" : format === "csv" ? "csv" : "md";
      a.download = "ulit-export." + ext;
      a.click();
      URL.revokeObjectURL(url);
    }, [result, format]);

    return h(Modal, {
      open: props.open,
      onCancel: props.onClose,
      title: "导出",
      width: 700,
      footer: null,
    },
      h(Space, { direction: "vertical", style: { width: "100%" } },
        h(Radio.Group, { value: format, onChange: function (e) { setFormat(e.target.value); } },
          h(Radio.Button, { value: "markdown" }, "Markdown"),
          h(Radio.Button, { value: "bibtex" }, "BibTeX"),
          h(Radio.Button, { value: "json" }, "JSON"),
          h(Radio.Button, { value: "csv" }, "CSV"),
        ),
        format !== "bibtex" && h(Space, null,
          h(Switch, { checked: includeAnnos, onChange: setIncludeAnnos, size: "small" }),
          h(Typography.Text, null, "包含标注"),
          h(Switch, { checked: includeEvidence, onChange: setIncludeEvidence, size: "small" }),
          h(Typography.Text, null, "包含证据卡"),
        ),
        h(Button, { type: "primary", loading: loading, onClick: handleExport, style: { background: C.primary, borderColor: C.primary } }, "生成导出"),
        result && h("div", null,
          h(Divider, null),
          h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 } },
            h(Typography.Text, { strong: true }, "导出结果 (" + result.length + " 字符)"),
            h(Button, { size: "small", type: "link", onClick: handleDownload }, "下载文件")
          ),
          h(TextArea, { value: result.substring(0, 5000), rows: 10, readOnly: true, style: { fontFamily: "monospace", fontSize: 12 } })
        )
      )
    );
  }

  // ── Main App Component ───────────────────────────────────────────
  function ULitApp() {
    var _s1 = useState("projects"); var view = _s1[0]; var setView = _s1[1];
    var _s2 = useState(null); var currentProjectId = _s2[0]; var setCurrentProjectId = _s2[1];
    var _s3 = useState(null); var currentPaperId = _s3[0]; var setCurrentPaperId = _s3[1];
    var _s4 = useState(null); var projectData = _s4[0]; var setProjectData = _s4[1];
    var _s5 = useState(false); var showImport = _s5[0]; var setShowImport = _s5[1];
    var _s6 = useState(false); var showExport = _s6[0]; var setShowExport = _s6[1];
    var _s7 = useState(false); var showCreateEvidence = _s7[0]; var setShowCreateEvidence = _s7[1];
    var _s8 = useState([]); var evidence = _s8[0]; var setEvidence = _s8[1];
    var _s9 = useState([]); var notes = _s9[0]; var setNotes = _s9[1];

    var openPaper = useCallback(function (pid) {
      setCurrentPaperId(pid);
    }, []);

    var openProject = useCallback(function (pid) {
      setCurrentProjectId(pid);
      setView("project_detail");
    }, []);

    // Load project detail
    useEffect(function () {
      if (view === "project_detail" && currentProjectId) {
        (async function () {
          try {
            var data = await API.getProject(currentProjectId);
            setProjectData(data);
            var ev = await API.listEvidence(currentProjectId);
            setEvidence(ev.evidence || []);
            var nt = await API.listNotes({ project_id: currentProjectId });
            setNotes(nt.notes || []);
          } catch (e) {
            message.error("加载项目失败: " + e.message);
          }
        })();
      }
    }, [view, currentProjectId]);

    var navItems = [
      { key: "projects", label: "📁 项目", },
      { key: "library", label: "📚 文献库", },
      { key: "jobs", label: "⚙️ 任务中心", },
    ];

    // If a paper is selected, show paper detail full screen
    if (currentPaperId) {
      return h("div", { style: { height: "100%", display: "flex", flexDirection: "column" } },
        h(PaperDetailView, {
          paperId: currentPaperId,
          onBack: function () { setCurrentPaperId(null); },
        })
      );
    }

    return h("div", { style: { height: "100%", display: "flex", flexDirection: "column", background: C.bg } },
      // Top nav bar
      h("div", {
        style: {
          padding: "0 24px", height: 52, background: "#fff",
          borderBottom: "1px solid " + C.border,
          display: "flex", alignItems: "center", gap: 24, flexShrink: 0,
        }
      },
        h("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
          h("span", { style: { fontSize: 20 } }, "📚"),
          h(Typography.Text, { strong: true, style: { fontSize: 16 } }, "ULit 文研")
        ),
        h("div", { style: { display: "flex", gap: 4 } },
          navItems.map(function (item) {
            return h(Button, {
              key: item.key,
              type: view === item.key ? "primary" : "text",
              size: "small",
              onClick: function () { setView(item.key); setCurrentProjectId(null); },
              style: view === item.key ? { background: C.primary, borderColor: C.primary } : {},
            }, item.label);
          })
        ),
        h("div", { style: { flex: 1 } }),
        h(Button, {
          onClick: function () { setShowExport(true); },
          size: "small",
        }, "📤 导出")
      ),
      // Content area
      h("div", { style: { flex: 1, overflow: "auto" } },
        view === "projects" && h(ProjectListView, { onOpenProject: openProject }),
        view === "library" && h(PaperLibraryView, { onOpenPaper: openPaper }),
        view === "jobs" && h(JobCenterView),
        view === "project_detail" && currentProjectId && h(ProjectDetailView, {
          projectId: currentProjectId,
          onBack: function () { setView("projects"); setCurrentProjectId(null); },
          onOpenPaper: openPaper,
          onRefresh: function () {
            // trigger reload
            setView("project_detail");
          },
        }),
      ),
      h(ExportModal, {
        open: showExport,
        onClose: function () { setShowExport(false); },
        projectId: currentProjectId,
      }),
      showCreateEvidence && h(EvidenceCreateModal, {
        open: showCreateEvidence,
        onClose: function () { setShowCreateEvidence(false); },
        projectId: currentProjectId,
        onRefresh: async function () {
          var ev = await API.listEvidence(currentProjectId);
          setEvidence(ev.evidence || []);
        }
      })
    );
  }

  // ── Project Detail View ──────────────────────────────────────────
  function ProjectDetailView(props) {
    var projectId = props.projectId;
    var _s1 = useState(null); var project = _s1[0]; var setProject = _s1[1];
    var _s2 = useState([]); var papers = _s2[0]; var setPapers = _s2[1];
    var _s3 = useState([]); var evidence = _s3[0]; var setEvidence = _s3[1];
    var _s4 = useState([]); var notes = _s4[0]; var setNotes = _s4[1];
    var _s5 = useState("papers"); var tab = _s5[0]; var setTab = _s5[1];
    var _s6 = useState(false); var showImport = _s6[0]; var setShowImport = _s6[1];
    var _s7 = useState(false); var showExport = _s7[0]; var setShowExport = _s7[1];
    var _s8 = useState(false); var showEvidence = _s8[0]; var setShowEvidence = _s8[1];
    var _s9 = useState(false); var loading = _s9[0]; var setLoading = _s9[1];

    var load = useCallback(async function () {
      setLoading(true);
      try {
        var data = await API.getProject(projectId);
        setProject(data);
        setPapers(data.papers || []);
        var ev = await API.listEvidence(projectId);
        setEvidence(ev.evidence || []);
        var nt = await API.listNotes({ project_id: projectId });
        setNotes(nt.notes || []);
      } catch (e) {
        message.error("加载失败: " + e.message);
      } finally {
        setLoading(false);
      }
    }, [projectId]);

    useEffect(function () { load(); }, [load]);

    return h("div", { style: { padding: 24 } },
      h("div", { style: { display: "flex", alignItems: "center", marginBottom: 16 } },
        h(Button, { type: "text", onClick: props.onBack }, "← 返回项目列表"),
        h(Typography.Title, { level: 4, style: { margin: "0 0 0 16px" } }, project ? project.name : "加载中..."),
      ),
      project && project.question && h(Alert, {
        type: "info", message: "研究问题", description: project.question,
        style: { marginBottom: 16, borderRadius: 8 }
      }),
      h(Tabs, {
        activeKey: tab,
        onChange: setTab,
        tabBarExtraContent: h(Space, null,
          h(Button, {
            type: "primary", size: "small",
            onClick: function () { setShowImport(true); },
            style: { background: C.primary, borderColor: C.primary },
          }, "+ 导入文献"),
          h(Button, { size: "small", onClick: function () { setShowExport(true); } }, "📤 导出")
        ),
        items: [
          {
            key: "papers", label: "文献 (" + papers.length + ")",
            children: loading ? h(Spin, { style: { display: "block", margin: 40 } }) :
              papers.length === 0 ? h(Empty, { description: "暂无文献，点击右上角导入" }) :
                h(Table, {
                  columns: [
                    { title: "标题", dataIndex: "title", key: "title", render: function (t, r) { return h("a", { onClick: function () { props.onOpenPaper(r.id); }, style: { color: C.primary } }, t || "(未命名)"); } },
                    { title: "年份", dataIndex: "year", key: "year", width: 80 },
                    { title: "状态", dataIndex: "reading_status", key: "reading_status", width: 100, render: function (s) { return h(Tag, { color: STATUS_COLORS[s] || C.muted }, STATUS_LABELS[s] || s); } },
                    { title: "PDF", dataIndex: "has_pdf", key: "has_pdf", width: 60, render: function (v) { return v ? "✓" : "—"; } },
                    {
                      title: "", key: "action", width: 80,
                      render: function (_, r) {
                        return h(Popconfirm, {
                          title: "从项目移除？",
                          onConfirm: async function () {
                            await API.removePaperFromProject(projectId, r.id);
                            message.success("已移除");
                            load();
                          }
                        }, h(Button, { size: "small", type: "link", danger: true }, "移除"));
                      }
                    },
                  ],
                  dataSource: papers, rowKey: "id", size: "middle", pagination: { pageSize: 15 }
                })
          },
          {
            key: "evidence", label: "证据卡 (" + evidence.length + ")",
            children: h("div", null,
              h("div", { style: { marginBottom: 12 } },
                h(Button, { type: "primary", size: "small", onClick: function () { setShowEvidence(true); }, style: { background: C.evidence, borderColor: C.evidence } }, "+ 新建证据卡")
              ),
              evidence.length === 0 ? h(Empty, { description: "暂无证据卡" }) :
                h(List, {
                  dataSource: evidence,
                  renderItem: function (e) {
                    return h(List.Item, {},
                      h(Card, { size: "small", style: { width: "100%", borderRadius: 8 } },
                        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "start" } },
                          h("div", { style: { flex: 1 } },
                            h(Space, { size: "small" },
                              h(Tag, { color: C.evidence }, EVIDENCE_KIND_LABELS[e.kind] || e.kind),
                              h(Tag, { color: e.verification_status === "confirmed" ? "success" : e.verification_status === "rejected" ? "error" : "warning" }, VERIFY_LABELS[e.verification_status] || e.verification_status),
                              e.page_index != null && h(Typography.Text, { type: "secondary", style: { fontSize: 12 } }, "p." + (e.page_index + 1)),
                            ),
                            h("div", { style: { marginTop: 6 } }, h(Typography.Text, { strong: true }, e.claim)),
                            e.quote && h("blockquote", { style: { borderLeft: "3px solid " + C.evidence, paddingLeft: 10, margin: "6px 0", color: C.sub, fontSize: 13 } }, e.quote.substring(0, 200)),
                            h(Typography.Text, { type: "secondary", style: { fontSize: 11 } }, "来源: " + (e.created_by === "human" ? "人工" : "AI") + " · " + fmtDate(e.created_at)),
                          ),
                          e.verification_status !== "confirmed" && e.verification_status !== "rejected" &&
                          h(Button, {
                            size: "small", type: "link",
                            onClick: async function () {
                              await API.verifyEvidence(e.id, { verification_status: "confirmed" });
                              message.success("已确认");
                              load();
                            }
                          }, "✓ 确认"),
                          e.verification_status !== "rejected" &&
                          h(Button, {
                            size: "small", type: "link", danger: true,
                            onClick: async function () {
                              await API.verifyEvidence(e.id, { verification_status: "rejected" });
                              message.success("已驳回");
                              load();
                            }
                          }, "✗ 驳回"),
                        )
                      )
                    );
                  }
                })
            )
          },
          {
            key: "notes", label: "笔记 (" + notes.length + ")",
            children: h(NoteList, { notes: notes, projectId: projectId, onRefresh: load })
          },
        ]
      }),
      h(ImportModal, {
        open: showImport,
        onClose: function () { setShowImport(false); },
        onRefresh: load,
        projectId: projectId,
      }),
      h(ExportModal, {
        open: showExport,
        onClose: function () { setShowExport(false); },
        projectId: projectId,
      }),
      showEvidence && h(EvidenceCreateModal, {
        open: showEvidence,
        onClose: function () { setShowEvidence(false); },
        projectId: projectId,
        papers: papers,
        onRefresh: load,
      })
    );
  }

  // ── Note List Component ──────────────────────────────────────────
  function NoteList(props) {
    var _s1 = useState(false); var showCreate = _s1[0]; var setShowCreate = _s1[1];
    var _s2 = useState({ title: "", content_markdown: "" }); var newNote = _s2[0]; var setNewNote = _s2[1];
    var _s3 = useState(null); var editNote = _s3[0]; var setEditNote = _s3[1];

    var handleCreate = useCallback(async function () {
      if (!newNote.title.trim()) { message.warning("请输入标题"); return; }
      try {
        await API.createNote(Object.assign({}, newNote, { project_id: props.projectId }));
        message.success("笔记已创建");
        setShowCreate(false);
        setNewNote({ title: "", content_markdown: "" });
        props.onRefresh();
      } catch (e) {
        message.error("创建失败: " + e.message);
      }
    }, [newNote, props.projectId, props.onRefresh]);

    var handleUpdate = useCallback(async function (id, data) {
      try {
        await API.updateNote(id, data);
        message.success("已保存");
        props.onRefresh();
      } catch (e) {
        message.error("保存失败: " + e.message);
      }
    }, [props.onRefresh]);

    return h("div", null,
      h("div", { style: { marginBottom: 12 } },
        h(Button, { type: "primary", size: "small", onClick: function () { setShowCreate(true); }, style: { background: C.primary, borderColor: C.primary } }, "+ 新建笔记")
      ),
      props.notes.length === 0 ? h(Empty, { description: "暂无笔记" }) :
        h(List, {
          dataSource: props.notes,
          renderItem: function (n) {
            return h(List.Item, {},
              h(Card, {
                size: "small", style: { width: "100%", borderRadius: 8 },
                title: n.title || "(未命名)",
                extra: h(Space, null,
                  h(Button, { size: "small", type: "link", onClick: function () { setEditNote(n); } }, "编辑"),
                  h(Popconfirm, {
                    title: "删除此笔记？",
                    onConfirm: async function () { await API.deleteNote(n.id); message.success("已删除"); props.onRefresh(); }
                  }, h(Button, { size: "small", type: "link", danger: true }, "删除"))
                )
              },
                h(Typography.Text, { type: "secondary", style: { fontSize: 12 } }, fmtDate(n.updated_at)),
                n.content_markdown && h("div", { style: { marginTop: 8, maxHeight: 200, overflow: "auto" } },
                  ReactMarkdown ?
                    h(ReactMarkdown, { remarkPlugins: remarkGfm ? [remarkGfm] : [] }, n.content_markdown) :
                    h("div", { style: { whiteSpace: "pre-wrap" } }, n.content_markdown)
                )
              )
            );
          }
        }),
      // Create modal
      h(Modal, {
        open: showCreate, onCancel: function () { setShowCreate(false); },
        title: "新建笔记", onOk: handleCreate,
        okButtonProps: { style: { background: C.primary, borderColor: C.primary } },
      },
        h(Space, { direction: "vertical", style: { width: "100%" } },
          h(Input, { value: newNote.title, onChange: function (e) { setNewNote(Object.assign({}, newNote, { title: e.target.value })); }, placeholder: "标题" }),
          h(TextArea, { value: newNote.content_markdown, onChange: function (e) { setNewNote(Object.assign({}, newNote, { content_markdown: e.target.value })); }, placeholder: "内容 (Markdown)", rows: 8 })
        )
      ),
      // Edit modal
      h(Modal, {
        open: !!editNote, onCancel: function () { setEditNote(null); },
        title: "编辑笔记",
        onOk: function () { if (editNote) handleUpdate(editNote.id, { title: editNote.title, content_markdown: editNote.content_markdown }); setEditNote(null); },
        okButtonProps: { style: { background: C.primary, borderColor: C.primary } },
      },
        editNote && h(Space, { direction: "vertical", style: { width: "100%" } },
          h(Input, { value: editNote.title, onChange: function (e) { setEditNote(Object.assign({}, editNote, { title: e.target.value })); }, placeholder: "标题" }),
          h(TextArea, { value: editNote.content_markdown, onChange: function (e) { setEditNote(Object.assign({}, editNote, { content_markdown: e.target.value })); }, placeholder: "内容 (Markdown)", rows: 10 })
        )
      )
    );
  }

  // ── Evidence Create Modal ────────────────────────────────────────
  function EvidenceCreateModal(props) {
    var _s1 = useState({ claim: "", quote: "", kind: "background", paper_id: null, page_index: null });
    var form = _s1[0]; var setForm = _s1[1];

    var handleCreate = useCallback(async function () {
      if (!form.claim.trim()) { message.warning("请输入结论/发现"); return; }
      try {
        await API.createEvidence(props.projectId, form);
        message.success("证据卡已创建");
        setForm({ claim: "", quote: "", kind: "background", paper_id: null, page_index: null });
        props.onClose();
        props.onRefresh();
      } catch (e) {
        message.error("创建失败: " + e.message);
      }
    }, [form, props.projectId, props.onClose, props.onRefresh]);

    return h(Modal, {
      open: props.open, onCancel: props.onClose,
      title: "新建证据卡", onOk: handleCreate,
      okButtonProps: { style: { background: C.evidence, borderColor: C.evidence } },
    },
      h(Space, { direction: "vertical", style: { width: "100%" } },
        h(Select, {
          value: form.kind, onChange: function (v) { setForm(Object.assign({}, form, { kind: v })); },
          style: { width: "100%" },
          options: Object.keys(EVIDENCE_KIND_LABELS).map(function (k) { return { value: k, label: EVIDENCE_KIND_LABELS[k] }; })
        }),
        props.papers && props.papers.length > 0 && h(Select, {
          value: form.paper_id, onChange: function (v) { setForm(Object.assign({}, form, { paper_id: v })); },
          style: { width: "100%" },
          placeholder: "关联文献 (可选)",
          allowClear: true,
          options: props.papers.map(function (p) { return { value: p.id, label: p.title }; })
        }),
        h(TextArea, {
          value: form.claim, onChange: function (e) { setForm(Object.assign({}, form, { claim: e.target.value })); },
          placeholder: "结论/发现...", rows: 3
        }),
        h(TextArea, {
          value: form.quote, onChange: function (e) { setForm(Object.assign({}, form, { quote: e.target.value })); },
          placeholder: "原文引文 (可选)...", rows: 3
        }),
        h(Input, {
          type: "number", value: form.page_index,
          onChange: function (e) { setForm(Object.assign({}, form, { page_index: e.target.value ? parseInt(e.target.value) : null })); },
          placeholder: "页码 (可选)"
        })
      )
    );
  }

  // ── Self-register PawApp route ───────────────────────────────────
  QwenPaw.registerRoutes("ulit", [
    {
      path: "/apps/ulit",
      component: ULitApp,
      label: "ULit 文研",
      icon: "📚",
    },
  ]);

  console.info("[ulit] registered route /apps/ulit");
})();
