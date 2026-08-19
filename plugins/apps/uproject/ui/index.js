/**
 * UProject alignment desk. Registers /apps/uproject.
 */
(function () {
  var QwenPaw = window.QwenPaw;
  if (!QwenPaw || !QwenPaw.host || !QwenPaw.registerRoutes) {
    console.error("[uproject] window.QwenPaw not ready");
    return;
  }

  var host = QwenPaw.host;
  var React = host.React;
  var antd = host.antd;
  var h = React.createElement;
  var useState = React.useState;
  var useEffect = React.useEffect;

  var Button = antd.Button;
  var Input = antd.Input;
  var Modal = antd.Modal;
  var Tag = antd.Tag;
  var Empty = antd.Empty;
  var Select = antd.Select;
  var Tabs = antd.Tabs;
  var message = antd.message;
  var Popconfirm = antd.Popconfirm;
  var Spin = antd.Spin;

  var C = {
    text: "#1f2937",
    sub: "#6b7280",
    muted: "#9ca3af",
    line: "rgba(15,23,42,0.08)",
    bg: "#f6f7f9",
    card: "#ffffff",
  };

  var PROJECT_STATUS = {
    intake: { label: "\u7acb\u9879", color: "default" },
    aligning: { label: "\u5bf9\u63a5\u4e2d", color: "gold" },
    executing: { label: "\u6267\u884c\u4e2d", color: "blue" },
    acceptance: { label: "\u5f85\u9a8c\u6536", color: "purple" },
    closed: { label: "\u5df2\u5173\u95ed", color: "green" },
  };
  var ITEM_STATUS = {
    open: { label: "\u672a\u5bf9\u9f50", color: "gold", tint: "rgba(245,158,11,0.14)" },
    proposed: { label: "\u5df2\u63d0\u8bae", color: "blue", tint: "rgba(59,130,246,0.12)" },
    agreed: { label: "\u5df2\u5bf9\u9f50", color: "green", tint: "rgba(34,197,94,0.12)" },
    blocked: { label: "\u963b\u585e", color: "red", tint: "rgba(239,68,68,0.12)" },
    deferred: { label: "\u6682\u7f13", color: "default", tint: "rgba(148,163,184,0.12)" },
  };
  var ITEM_KIND = {
    scope: "\u8303\u56f4",
    milestone: "\u91cc\u7a0b\u7891",
    deliverable: "\u4ea4\u4ed8\u7269",
    data: "\u8d44\u6599",
    interface: "\u63a5\u53e3",
    acceptance: "\u9a8c\u6536",
    change: "\u53d8\u66f4",
    risk: "\u98ce\u9669",
  };
  var SIDE = { client: "\u7532\u65b9", vendor: "\u4e59\u65b9", both: "\u53cc\u65b9" };

  function apiFetch(path, opts) {
    opts = opts || {};
    var headers = { "Content-Type": "application/json" };
    var token = host.getApiToken ? host.getApiToken() : "";
    if (token) headers.Authorization = "Bearer " + token;
    return fetch(host.getApiUrl(path), {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (text) {
          throw new Error(text || "HTTP " + res.status);
        });
      }
      return res.status === 204 ? null : res.json();
    });
  }

  var api = {
    list: function () { return apiFetch("/uproject/projects"); },
    get: function (id) { return apiFetch("/uproject/projects/" + id); },
    create: function (body) { return apiFetch("/uproject/projects", { method: "POST", body: body }); },
    patch: function (id, body) { return apiFetch("/uproject/projects/" + id, { method: "PATCH", body: body }); },
    remove: function (id) { return apiFetch("/uproject/projects/" + id, { method: "DELETE" }); },
    addItem: function (id, body) { return apiFetch("/uproject/projects/" + id + "/items", { method: "POST", body: body }); },
    patchItem: function (id, body) { return apiFetch("/uproject/items/" + id, { method: "PATCH", body: body }); },
    deleteItem: function (id) { return apiFetch("/uproject/items/" + id, { method: "DELETE" }); },
    addMs: function (id, body) { return apiFetch("/uproject/projects/" + id + "/milestones", { method: "POST", body: body }); },
    patchMs: function (id, body) { return apiFetch("/uproject/milestones/" + id, { method: "PATCH", body: body }); },
    deleteMs: function (id) { return apiFetch("/uproject/milestones/" + id, { method: "DELETE" }); },
    addMeeting: function (id, body) { return apiFetch("/uproject/projects/" + id + "/meetings", { method: "POST", body: body }); },
    deleteMeeting: function (id) { return apiFetch("/uproject/meetings/" + id, { method: "DELETE" }); },
    agenda: function (id) { return apiFetch("/uproject/projects/" + id + "/ai/agenda", { method: "POST" }); },
    weekly: function (id) { return apiFetch("/uproject/projects/" + id + "/ai/weekly", { method: "POST" }); },
    minutes: function (id, notes) {
      return apiFetch("/uproject/projects/" + id + "/ai/minutes", {
        method: "POST",
        body: { notes: notes, apply: true },
      });
    },
    reset: function () { return apiFetch("/uproject/demo/reset", { method: "POST" }); },
  };

  function errText(error, fallback) {
    var text = error && error.message ? error.message : "";
    try {
      var parsed = JSON.parse(text);
      if (parsed && parsed.detail) {
        return typeof parsed.detail === "string" ? parsed.detail : fallback;
      }
    } catch (e) {}
    return text || fallback || "failed";
  }

  function emptyParty() {
    return { org: "", contact: "", role: "", email: "" };
  }

  function emptyProjectForm() {
    return {
      name: "",
      code: "",
      domain: "",
      status: "intake",
      client: emptyParty(),
      vendor: emptyParty(),
      start_date: "",
      end_date: "",
      next_align_at: "",
      sow: "",
    };
  }

  function PartyFields(props) {
    var value = props.value || emptyParty();
    function set(key, next) {
      var copy = Object.assign({}, value);
      copy[key] = next;
      props.onChange(copy);
    }
    return h(
      "div",
      { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } },
      h("div", { style: { fontSize: 12, color: C.sub, gridColumn: "1 / -1", fontWeight: 600 } }, props.label),
      h(Input, { placeholder: "\u5355\u4f4d", value: value.org, onChange: function (e) { set("org", e.target.value); } }),
      h(Input, { placeholder: "\u5bf9\u63a5\u4eba", value: value.contact, onChange: function (e) { set("contact", e.target.value); } }),
      h(Input, { placeholder: "\u89d2\u8272", value: value.role, onChange: function (e) { set("role", e.target.value); } }),
      h(Input, { placeholder: "\u90ae\u7bb1", value: value.email, onChange: function (e) { set("email", e.target.value); } })
    );
  }

  function StatChip(props) {
    return h(
      "span",
      {
        style: {
          fontSize: 12,
          color: props.color || C.sub,
          background: props.bg || "#f1f5f9",
          borderRadius: 999,
          padding: "2px 8px",
        },
      },
      props.children
    );
  }

  function ProjectCard(props) {
    var p = props.project;
    var st = PROJECT_STATUS[p.status] || PROJECT_STATUS.intake;
    var client = p.client || {};
    var vendor = p.vendor || {};
    return h(
      "div",
      {
        onClick: props.onOpen,
        style: {
          background: C.card,
          border: "1px solid " + C.line,
          borderRadius: 14,
          padding: 16,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        },
      },
      h("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 } },
        h("div", { style: { fontWeight: 700, fontSize: 16, color: C.text } }, p.name),
        h(Tag, { color: st.color }, st.label)
      ),
      h("div", { style: { fontSize: 12, color: C.muted } }, (p.code || "-") + (p.domain ? " · " + p.domain : "")),
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 } },
        h("div", null, h("div", { style: { color: C.muted, fontSize: 12 } }, SIDE.client), client.org || "-", h("div", { style: { color: C.sub } }, client.contact || "")),
        h("div", null, h("div", { style: { color: C.muted, fontSize: 12 } }, SIDE.vendor), vendor.org || "-", h("div", { style: { color: C.sub } }, vendor.contact || ""))
      ),
      h("div", { style: { fontSize: 13, color: C.sub, lineHeight: 1.5 } }, p.sow || ""),
      h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" } },
        h(StatChip, { color: "#b45309", bg: "#fffbeb" }, (p.open_count || 0) + " " + ITEM_STATUS.open.label),
        h(StatChip, { color: "#b91c1c", bg: "#fef2f2" }, (p.blocked_count || 0) + " " + ITEM_STATUS.blocked.label),
        h(StatChip, { color: "#15803d", bg: "#f0fdf4" }, (p.agreed_count || 0) + " " + ITEM_STATUS.agreed.label),
        h("span", { style: { marginLeft: "auto", fontSize: 12, color: C.muted } }, (p.next_align_at || "-"))
      )
    );
  }

  function ProjectFormModal(props) {
    var form = props.form;
    var setForm = props.setForm;
    function setField(key, value) {
      var copy = Object.assign({}, form);
      copy[key] = value;
      setForm(copy);
    }
    return h(
      Modal,
      { open: true, title: props.title, okText: "OK", cancelText: "Cancel", onOk: props.onOk, onCancel: props.onCancel, width: 640 },
      h("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
        h(Input, { placeholder: "name", value: form.name, onChange: function (e) { setField("name", e.target.value); } }),
        h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 } },
          h(Input, { placeholder: "code", value: form.code, onChange: function (e) { setField("code", e.target.value); } }),
          h(Input, { placeholder: "domain", value: form.domain, onChange: function (e) { setField("domain", e.target.value); } }),
          h(Select, {
            value: form.status,
            options: Object.keys(PROJECT_STATUS).map(function (k) { return { value: k, label: PROJECT_STATUS[k].label }; }),
            onChange: function (v) { setField("status", v); },
          })
        ),
        h(PartyFields, { label: SIDE.client, value: form.client, onChange: function (v) { setField("client", v); } }),
        h(PartyFields, { label: SIDE.vendor, value: form.vendor, onChange: function (v) { setField("vendor", v); } }),
        h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 } },
          h(Input, { placeholder: "start YYYY-MM-DD", value: form.start_date, onChange: function (e) { setField("start_date", e.target.value); } }),
          h(Input, { placeholder: "end", value: form.end_date, onChange: function (e) { setField("end_date", e.target.value); } }),
          h(Input, { placeholder: "next align", value: form.next_align_at, onChange: function (e) { setField("next_align_at", e.target.value); } })
        ),
        h(Input.TextArea, { rows: 3, placeholder: "SOW", value: form.sow, onChange: function (e) { setField("sow", e.target.value); } })
      )
    );
  }

  function ItemModal(props) {
    var form = props.form;
    var setForm = props.setForm;
    function setField(key, value) {
      var copy = Object.assign({}, form);
      copy[key] = value;
      setForm(copy);
    }
    return h(
      Modal,
      { open: true, title: props.title, okText: "OK", cancelText: "Cancel", onOk: props.onOk, onCancel: props.onCancel },
      h("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
        h(Input, { placeholder: "title", value: form.title, onChange: function (e) { setField("title", e.target.value); } }),
        h(Input.TextArea, { rows: 3, placeholder: "detail", value: form.detail, onChange: function (e) { setField("detail", e.target.value); } }),
        h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 } },
          h(Select, { value: form.kind, options: Object.keys(ITEM_KIND).map(function (k) { return { value: k, label: ITEM_KIND[k] }; }), onChange: function (v) { setField("kind", v); } }),
          h(Select, { value: form.owner_side, options: Object.keys(SIDE).map(function (k) { return { value: k, label: SIDE[k] }; }), onChange: function (v) { setField("owner_side", v); } }),
          h(Select, { value: form.status, options: Object.keys(ITEM_STATUS).map(function (k) { return { value: k, label: ITEM_STATUS[k].label }; }), onChange: function (v) { setField("status", v); } })
        )
      )
    );
  }

  function AlignmentBoard(props) {
    var columns = ["open", "proposed", "blocked", "agreed"];
    return h(
      "div",
      { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(180px, 1fr))", gap: 10, alignItems: "start" } },
      columns.map(function (key) {
        var meta = ITEM_STATUS[key];
        var list = (props.items || []).filter(function (i) { return i.status === key; });
        return h(
          "div",
          {
            key: key,
            style: {
              background: "linear-gradient(180deg, " + meta.tint + " 0%, #fff 46%)",
              border: "1px solid " + C.line,
              borderRadius: 12,
              padding: 10,
              minHeight: 220,
            },
          },
          h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8, fontWeight: 600 } },
            h("span", null, meta.label + " " + list.length),
            key === "open" ? h(Button, { size: "small", type: "text", onClick: props.onAdd }, "+") : null
          ),
          list.map(function (item) {
            return h(
              "div",
              {
                key: item.id,
                onClick: function () { props.onEdit(item); },
                style: {
                  background: "#fff",
                  border: "1px solid " + C.line,
                  borderRadius: 10,
                  padding: "8px 10px",
                  marginBottom: 8,
                  cursor: "pointer",
                },
              },
              h("div", { style: { fontWeight: 600, fontSize: 13, color: C.text } }, item.title),
              h("div", { style: { fontSize: 12, color: C.sub, margin: "4px 0 6px" } }, item.detail || ""),
              h("div", { style: { display: "flex", gap: 4 } },
                h(Tag, null, ITEM_KIND[item.kind] || item.kind),
                h(Tag, { color: item.owner_side === "client" ? "orange" : item.owner_side === "vendor" ? "blue" : "default" }, SIDE[item.owner_side] || item.owner_side)
              )
            );
          })
        );
      })
    );
  }

  function ProjectDetail(props) {
    var bundle = props.bundle;
    var project = bundle.project;
    var st = PROJECT_STATUS[project.status] || PROJECT_STATUS.intake;
    var client = project.client || {};
    var vendor = project.vendor || {};
    var tabState = useState("items");
    var tab = tabState[0];
    var setTab = tabState[1];
    var itemModalState = useState(null);
    var itemModal = itemModalState[0];
    var setItemModal = itemModalState[1];
    var itemFormState = useState({ title: "", detail: "", kind: "scope", owner_side: "both", status: "open" });
    var itemForm = itemFormState[0];
    var setItemForm = itemFormState[1];
    var meetingFormState = useState({ title: "", held_at: "", attendees_client: "", attendees_vendor: "", notes: "" });
    var meetingForm = meetingFormState[0];
    var setMeetingForm = meetingFormState[1];
    var meetingOpenState = useState(false);
    var meetingOpen = meetingOpenState[0];
    var setMeetingOpen = meetingOpenState[1];
    var msFormState = useState({ title: "", due_date: "", owner_side: "vendor" });
    var msForm = msFormState[0];
    var setMsForm = msFormState[1];
    var aiState = useState({ loading: false, kind: "", content: "", source: "" });
    var ai = aiState[0];
    var setAi = aiState[1];
    var minutesState = useState("");
    var minutes = minutesState[0];
    var setMinutes = minutesState[1];

    function reload() { props.onReload(); }

    function saveItem() {
      if (!itemForm.title.trim()) {
        message.warning("title required");
        return;
      }
      var req = itemModal && itemModal.id
        ? api.patchItem(itemModal.id, itemForm)
        : api.addItem(project.id, itemForm);
      req.then(function () {
        setItemModal(null);
        reload();
      }).catch(function (e) { message.error(errText(e)); });
    }

    function runAi(kind) {
      setAi({ loading: true, kind: kind, content: "", source: "" });
      var job = kind === "agenda" ? api.agenda(project.id) : api.weekly(project.id);
      job.then(function (data) {
        setAi({ loading: false, kind: kind, content: data.content || "", source: data.source || "" });
      }).catch(function (e) {
        setAi({ loading: false, kind: kind, content: "", source: "" });
        message.error(errText(e));
      });
    }

    function extractMinutes() {
      if (!minutes.trim()) {
        message.warning("paste notes first");
        return;
      }
      setAi({ loading: true, kind: "minutes", content: "", source: "" });
      api.minutes(project.id, minutes).then(function (data) {
        setAi({ loading: false, kind: "minutes", content: data.content || "", source: data.source || "" });
        message.success(String((data.items || []).length));
        reload();
      }).catch(function (e) {
        setAi({ loading: false, kind: "minutes", content: "", source: "" });
        message.error(errText(e));
      });
    }

    return h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 14, height: "100%", overflow: "auto" } },
      h("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
        h(Button, { onClick: props.onBack }, "\u8fd4\u56de\u9879\u76ee\u53f0"),
        h("div", { style: { fontSize: 20, fontWeight: 700, flex: 1 } }, project.name),
        h(Select, {
          style: { width: 130 },
          value: project.status,
          options: Object.keys(PROJECT_STATUS).map(function (k) { return { value: k, label: PROJECT_STATUS[k].label }; }),
          onChange: function (v) { api.patch(project.id, { status: v }).then(reload); },
        }),
        h(Popconfirm, { title: "Delete?", onConfirm: function () { api.remove(project.id).then(props.onDeleted); } },
          h(Button, { danger: true }, "\u5220\u9664"))
      ),
      h("div", { style: { color: C.muted, fontSize: 13 } }, (project.code || "-") + " · " + st.label + " · " + (project.next_align_at || "-")),
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 10 } },
        h("div", { style: { background: "#fff", border: "1px solid " + C.line, borderRadius: 12, padding: 12 } },
          h("div", { style: { fontSize: 12, color: C.muted } }, SIDE.client),
          h("div", { style: { fontWeight: 700 } }, client.org || "-"),
          h("div", { style: { color: C.sub } }, (client.contact || "") + (client.role ? " · " + client.role : ""))
        ),
        h("div", { style: { background: "#fff", border: "1px solid " + C.line, borderRadius: 12, padding: 12 } },
          h("div", { style: { fontSize: 12, color: C.muted } }, SIDE.vendor),
          h("div", { style: { fontWeight: 700 } }, vendor.org || "-"),
          h("div", { style: { color: C.sub } }, (vendor.contact || "") + (vendor.role ? " · " + vendor.role : ""))
        ),
        h("div", { style: { background: "#fff", border: "1px solid " + C.line, borderRadius: 12, padding: 12 } },
          h("div", { style: { fontSize: 12, color: C.muted } }, "SOW"),
          h("div", { style: { color: C.text, lineHeight: 1.6 } }, project.sow || "")
        )
      ),
      h(Tabs, {
        activeKey: tab,
        onChange: setTab,
        items: [
          { key: "items", label: "\u5bf9\u9f50\u9879" },
          { key: "milestones", label: ITEM_KIND.milestone },
          { key: "meetings", label: "\u5bf9\u9f50\u4f1a" },
          { key: "ai", label: "\u4e00\u952e\u5bf9\u9f50" },
        ],
      }),
      tab === "items"
        ? h(AlignmentBoard, {
            items: bundle.items,
            onAdd: function () {
              setItemForm({ title: "", detail: "", kind: "scope", owner_side: "both", status: "open" });
              setItemModal({ id: null });
            },
            onEdit: function (item) {
              setItemForm({ title: item.title, detail: item.detail || "", kind: item.kind, owner_side: item.owner_side, status: item.status });
              setItemModal(item);
            },
          })
        : null,
      tab === "milestones"
        ? h("div", { style: { background: "#fff", border: "1px solid " + C.line, borderRadius: 12, padding: 12 } },
            (bundle.milestones || []).map(function (ms) {
              return h("div", { key: ms.id, style: { display: "flex", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" } },
                h("div", { style: { flex: 1, fontWeight: 600 } }, ms.title),
                h(Tag, null, SIDE[ms.owner_side] || ms.owner_side),
                h("span", { style: { color: C.sub, fontSize: 12 } }, ms.due_date || "-"),
                h(Button, {
                  size: "small",
                  type: ms.status === "done" ? "default" : "primary",
                  onClick: function () { api.patchMs(ms.id, { status: ms.status === "done" ? "pending" : "done" }).then(reload); },
                }, ms.status === "done" ? "done" : "done?"),
                h(Button, { size: "small", danger: true, type: "text", onClick: function () { api.deleteMs(ms.id).then(reload); } }, "x")
              );
            }),
            h("div", { style: { display: "flex", gap: 8, marginTop: 10 } },
              h(Input, { placeholder: "milestone", value: msForm.title, onChange: function (e) { setMsForm(Object.assign({}, msForm, { title: e.target.value })); } }),
              h(Input, { placeholder: "due", style: { width: 140 }, value: msForm.due_date, onChange: function (e) { setMsForm(Object.assign({}, msForm, { due_date: e.target.value })); } }),
              h(Select, { style: { width: 100 }, value: msForm.owner_side, options: Object.keys(SIDE).map(function (k) { return { value: k, label: SIDE[k] }; }), onChange: function (v) { setMsForm(Object.assign({}, msForm, { owner_side: v })); } }),
              h(Button, {
                type: "primary",
                onClick: function () {
                  if (!msForm.title.trim()) return;
                  api.addMs(project.id, msForm).then(function () {
                    setMsForm({ title: "", due_date: "", owner_side: "vendor" });
                    reload();
                  });
                },
              }, "+")
            )
          )
        : null,
      tab === "meetings"
        ? h("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
            h(Button, { type: "primary", style: { alignSelf: "flex-start" }, onClick: function () { setMeetingOpen(true); } }, "+ meeting"),
            (bundle.meetings || []).slice().reverse().map(function (mt) {
              return h("div", { key: mt.id, style: { background: "#fff", border: "1px solid " + C.line, borderRadius: 12, padding: 12 } },
                h("div", { style: { fontWeight: 700 } }, mt.title + " · " + (mt.held_at || "")),
                h("div", { style: { fontSize: 12, color: C.sub, margin: "4px 0" } }, SIDE.client + " " + (mt.attendees_client || "-") + " | " + SIDE.vendor + " " + (mt.attendees_vendor || "-")),
                h("div", { style: { whiteSpace: "pre-wrap", color: C.text } }, mt.notes || mt.decisions || ""),
                h(Button, { size: "small", danger: true, type: "text", onClick: function () { api.deleteMeeting(mt.id).then(reload); } }, "x")
              );
            })
          )
        : null,
      tab === "ai"
        ? h("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
            h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
              h(Button, { type: "primary", size: "large", loading: ai.loading && ai.kind === "agenda", onClick: function () { runAi("agenda"); } }, "\u751f\u6210\u672c\u6b21\u5bf9\u9f50\u8bae\u7a0b"),
              h(Button, { size: "large", loading: ai.loading && ai.kind === "weekly", onClick: function () { runAi("weekly"); } }, "\u5199\u7ed9\u7532\u65b9\u7684\u5468\u62a5")
            ),
            h(Input.TextArea, { rows: 5, placeholder: "\u7c98\u8d34\u5bf9\u9f50\u4f1a\u7eaa\u8981", value: minutes, onChange: function (e) { setMinutes(e.target.value); } }),
            h(Button, { loading: ai.loading && ai.kind === "minutes", onClick: extractMinutes }, "\u6839\u636e\u7eaa\u8981\u62c6\u5bf9\u9f50\u9879"),
            ai.loading ? h(Spin) : null,
            ai.content
              ? h("div", { style: { background: "#fff", border: "1px solid " + C.line, borderRadius: 12, padding: 14, whiteSpace: "pre-wrap", lineHeight: 1.7 } },
                  h("div", { style: { fontSize: 12, color: C.muted, marginBottom: 8 } }, ai.source),
                  ai.content
                )
              : null
          )
        : null,
      itemModal
        ? h(ItemModal, {
            title: itemModal.id ? "edit" : "new",
            form: itemForm,
            setForm: setItemForm,
            onOk: saveItem,
            onCancel: function () { setItemModal(null); },
          })
        : null,
      meetingOpen
        ? h(Modal, {
            open: true,
            title: "meeting",
            okText: "OK",
            cancelText: "Cancel",
            onCancel: function () { setMeetingOpen(false); },
            onOk: function () {
              if (!meetingForm.title.trim()) return;
              api.addMeeting(project.id, meetingForm).then(function () {
                setMeetingOpen(false);
                setMeetingForm({ title: "", held_at: "", attendees_client: "", attendees_vendor: "", notes: "" });
                reload();
              });
            },
          }, h("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
            h(Input, { placeholder: "title", value: meetingForm.title, onChange: function (e) { setMeetingForm(Object.assign({}, meetingForm, { title: e.target.value })); } }),
            h(Input, { placeholder: "YYYY-MM-DD", value: meetingForm.held_at, onChange: function (e) { setMeetingForm(Object.assign({}, meetingForm, { held_at: e.target.value })); } }),
            h(Input, { placeholder: SIDE.client, value: meetingForm.attendees_client, onChange: function (e) { setMeetingForm(Object.assign({}, meetingForm, { attendees_client: e.target.value })); } }),
            h(Input, { placeholder: SIDE.vendor, value: meetingForm.attendees_vendor, onChange: function (e) { setMeetingForm(Object.assign({}, meetingForm, { attendees_vendor: e.target.value })); } }),
            h(Input.TextArea, { rows: 4, placeholder: "notes", value: meetingForm.notes, onChange: function (e) { setMeetingForm(Object.assign({}, meetingForm, { notes: e.target.value })); } })
          ))
        : null
    );
  }

  function AppRoot() {
    var listState = useState([]);
    var projects = listState[0];
    var setProjects = listState[1];
    var filterState = useState("");
    var filter = filterState[0];
    var setFilter = filterState[1];
    var selectedState = useState(null);
    var selected = selectedState[0];
    var setSelected = selectedState[1];
    var bundleState = useState(null);
    var bundle = bundleState[0];
    var setBundle = bundleState[1];
    var creatingState = useState(false);
    var creating = creatingState[0];
    var setCreating = creatingState[1];
    var formState = useState(emptyProjectForm());
    var form = formState[0];
    var setForm = formState[1];

    function loadList() {
      api.list().then(function (data) {
        setProjects((data && data.projects) || []);
      }).catch(function (e) { message.error(errText(e)); });
    }

    function loadBundle(id) {
      api.get(id).then(function (data) {
        setBundle(data);
        setSelected(id);
      }).catch(function (e) { message.error(errText(e)); });
    }

    useEffect(function () { loadList(); }, []);

    var shown = projects.filter(function (p) { return !filter || p.status === filter; });

    return h(
      "div",
      { style: { height: "100%", background: C.bg, color: C.text, padding: 18, boxSizing: "border-box", overflow: "auto" } },
      selected && bundle
        ? h(ProjectDetail, {
            bundle: bundle,
            onBack: function () { setSelected(null); setBundle(null); loadList(); },
            onReload: function () { loadBundle(selected); },
            onDeleted: function () { setSelected(null); setBundle(null); loadList(); },
          })
        : h("div", { style: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 1100, margin: "0 auto" } },
            h("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
              h("div", { style: { fontSize: 22, fontWeight: 750 } }, "\u79d1\u7814\u9879\u76ee\u5bf9\u9f50"),
              h("span", { style: { color: C.sub, fontSize: 13 } }, SIDE.client + " / " + SIDE.vendor + " \u5bf9\u63a5\u53f0"),
              h("div", { style: { marginLeft: "auto", display: "flex", gap: 8 } },
                h(Button, { onClick: loadList }, "\u5237\u65b0"),
                h(Button, { onClick: function () { api.reset().then(function () { message.success("\u5df2\u6062\u590d\u6f14\u793a\u573a\u666f"); loadList(); }); } }, "\u6062\u590d\u6f14\u793a"),
                h(Button, { type: "primary", onClick: function () { setForm(emptyProjectForm()); setCreating(true); } }, "\u65b0\u5efa\u9879\u76ee")
              )
            ),
            h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
              [{ key: "", label: "\u5168\u90e8" }].concat(Object.keys(PROJECT_STATUS).map(function (k) {
                return { key: k, label: PROJECT_STATUS[k].label };
              })).map(function (opt) {
                var active = filter === opt.key;
                return h(Button, { key: opt.key || "all", type: active ? "primary" : "default", size: "small", onClick: function () { setFilter(opt.key); } }, opt.label);
              })
            ),
            shown.length
              ? h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 } },
                  shown.map(function (p) {
                    return h(ProjectCard, { key: p.id, project: p, onOpen: function () { loadBundle(p.id); } });
                  })
                )
              : h(Empty)
          ),
      creating
        ? h(ProjectFormModal, {
            title: "\u65b0\u5efa\u79d1\u7814\u9879\u76ee",
            form: form,
            setForm: setForm,
            onCancel: function () { setCreating(false); },
            onOk: function () {
              if (!form.name.trim()) return;
              api.create(form).then(function (data) {
                setCreating(false);
                loadList();
                if (data && data.project) loadBundle(data.project.id);
              }).catch(function (e) { message.error(errText(e)); });
            },
          })
        : null
    );
  }

  QwenPaw.registerRoutes("uproject", [
    { path: "/apps/uproject", component: AppRoot, label: "\u79d1\u7814\u9879\u76ee\u5bf9\u9f50", icon: "UP" },
  ]);
  console.info("[uproject] registered route /apps/uproject");
})();
