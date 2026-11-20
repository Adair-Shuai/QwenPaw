(() => {
  // plugins/apps/research-agenda/src/style.css
  var style_default = '.ra-app {\n  height: 100%;\n  display: flex;\n  background: var(--app-bg);\n  color: var(--app-text);\n  font-size: var(--app-font-body, 14px);\n  overflow: auto;\n}\n.ra-app * {\n  box-sizing: border-box;\n}\n.ra-app h1,\n.ra-app h2,\n.ra-app h3,\n.ra-app p {\n  margin: 0;\n}\n.ra-app button {\n  font: inherit;\n}\n.ra-nav {\n  width: 176px;\n  flex-shrink: 0;\n  padding: 28px 12px;\n  border-right: 1px solid var(--app-border);\n  display: flex;\n  flex-direction: column;\n  background: var(--app-shell-bg);\n}\n.ra-brand {\n  font-weight: 600;\n  font-size: 16px;\n  padding: 0 14px 28px;\n}\n.ra-nav nav {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.ra-nav nav button {\n  border: 0;\n  background: transparent;\n  color: var(--app-text-secondary);\n  text-align: left;\n  padding: 10px 14px;\n  border-radius: 8px;\n  cursor: pointer;\n  display: flex;\n  justify-content: space-between;\n}\n.ra-nav nav button:hover {\n  background: var(--app-fill-subtle);\n}\n.ra-nav nav button.is-active {\n  background: var(--app-accent-soft);\n  color: var(--app-accent-text);\n  font-weight: 500;\n}\n.ra-nav nav button span {\n  font-size: 12px;\n}\n.ra-nav-foot {\n  margin-top: auto;\n  padding: 40px 12px 4px;\n  color: var(--app-text-tertiary);\n  font-size: 12px;\n  line-height: 1.9;\n}\n.ra-main {\n  flex: 1;\n  min-width: 0;\n  max-width: 1560px;\n  padding: 28px 32px;\n  margin: 0 auto;\n}\n.ra-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n  margin-bottom: 24px;\n}\n.ra-caption {\n  font-size: 12px;\n  color: var(--app-text-tertiary);\n  margin-bottom: 6px;\n}\n.ra-header h1 {\n  font-size: 24px;\n  line-height: 1.4;\n  font-weight: 600;\n  letter-spacing: -0.5px;\n}\n.ra-actions {\n  display: flex;\n  gap: 8px;\n}\n.ra-main > .ant-alert {\n  margin-bottom: 16px;\n}\n.ra-layout {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) 300px;\n  gap: 24px;\n  align-items: start;\n}\n.ra-content {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n.ra-capture,\n.ra-attention,\n.ra-list,\n.ra-day {\n  background: var(--app-surface);\n  border: 1px solid var(--app-border);\n  border-radius: var(--app-radius-card, 16px);\n  padding: 20px;\n}\n.ra-section-head {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 16px;\n}\n.ra-section-head h2 {\n  font-size: 16px;\n  font-weight: 600;\n}\n.ra-capture textarea {\n  border: 0 !important;\n  box-shadow: none !important;\n  padding: 0;\n  font-size: 14px;\n  line-height: 1.8;\n  resize: none;\n  background: transparent !important;\n}\n.ra-capture-context {\n  display: grid;\n  grid-template-columns: 1fr 150px 1fr;\n  gap: 12px;\n  border-top: 1px solid var(--app-border);\n  padding-top: 16px;\n  margin-top: 12px;\n}\n.ra-capture label,\n.ra-fields label {\n  font-size: 12px;\n  color: var(--app-text-secondary);\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.ra-capture input[type="date"],\n.ra-fields input[type="date"],\n.ra-fields input[type="time"],\n.ra-fields input[type="number"],\n.ra-day input {\n  height: 32px;\n  border: 1px solid var(--app-border);\n  border-radius: 6px;\n  padding: 4px 8px;\n  background: var(--app-surface);\n  color: var(--app-text);\n  font: inherit;\n  min-width: 0;\n}\n.ra-capture-footer {\n  margin-top: 16px;\n  margin-bottom: 8px;\n}\n.ra-hint {\n  font-size: 12px;\n  color: var(--app-text-tertiary);\n  line-height: 1.7;\n}\n.ra-capture-footer .ra-hint {\n  margin-left: 10px;\n}\n.ra-images {\n  display: flex;\n  gap: 12px;\n  flex-wrap: wrap;\n  margin: 12px 0;\n}\n.ra-images > div {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.ra-images img {\n  height: 64px;\n  width: 64px;\n  object-fit: cover;\n  border-radius: 6px;\n  border: 1px solid var(--app-border);\n}\n.ra-attention {\n  padding-bottom: 16px;\n}\n.ra-attention .ra-section-head {\n  margin-bottom: 8px;\n}\n.ra-summary {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 12px;\n}\n.ra-summary button {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  background: none;\n  border: 0;\n  color: var(--app-text);\n  text-align: left;\n  cursor: pointer;\n  padding: 8px 0;\n}\n.ra-summary b {\n  font-size: 24px;\n  font-weight: 550;\n  line-height: 1.3;\n  font-variant-numeric: tabular-nums;\n}\n.ra-summary span {\n  font-size: 12px;\n  color: var(--app-text-secondary);\n}\n.ra-warning {\n  color: var(--app-warning-text) !important;\n}\n.ra-attention > p {\n  font-size: 12px;\n  padding-top: 12px;\n  border-top: 1px solid var(--app-border);\n  margin-top: 8px;\n}\n.ra-count {\n  font-size: 12px;\n  font-weight: 400;\n  color: var(--app-text-tertiary);\n  margin-left: 10px;\n}\n.ra-search {\n  width: 220px;\n}\n.ra-filters {\n  display: flex;\n  gap: 6px;\n  margin-bottom: 8px;\n}\n.ra-filters button {\n  background: transparent;\n  border: 0;\n  color: var(--app-text-secondary);\n  border-radius: 6px;\n  padding: 4px 12px;\n  cursor: pointer;\n  font-size: 13px;\n}\n.ra-filters button[aria-pressed="true"] {\n  background: var(--app-fill-subtle);\n  color: var(--app-text);\n}\n.ra-task {\n  display: flex;\n  gap: 12px;\n  padding: 18px 0;\n  border-top: 1px solid var(--app-border-subtle, var(--app-border));\n  align-items: flex-start;\n}\n.ra-task > .ant-checkbox-wrapper {\n  margin-top: 3px;\n}\n.ra-task-body {\n  min-width: 0;\n  flex: 1;\n}\n.ra-task-title {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: var(--app-text);\n  font-size: 14px;\n  line-height: 1.6;\n  text-align: left;\n  cursor: pointer;\n  overflow-wrap: anywhere;\n  font-weight: 500;\n}\n.ra-task-meta {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n  color: var(--app-text-tertiary);\n  font-size: 12px;\n  margin-top: 7px;\n  align-items: center;\n}\n.ra-kind {\n  padding: 1px 6px;\n  border-radius: 4px;\n  background: var(--app-fill-subtle);\n  color: var(--app-text-secondary);\n}\n.ra-kind-\u79D1\u7814 {\n  background: var(--app-accent-soft);\n  color: var(--app-accent-text);\n}\n.ra-task-body > p {\n  font-size: 12px;\n  color: var(--app-text-secondary);\n  margin-top: 8px;\n}\n.ra-task-tools {\n  display: flex;\n  gap: 4px;\n  flex-wrap: wrap;\n  margin-left: -7px;\n  margin-top: 7px;\n}\n.ra-task-tools .ant-btn {\n  font-size: 12px;\n  color: var(--app-text-tertiary);\n}\n.ra-duration {\n  font-size: 12px;\n  color: var(--app-text-tertiary);\n  white-space: nowrap;\n  padding-top: 4px;\n}\n.ra-day .ra-section-head {\n  flex-wrap: wrap;\n  margin-bottom: 10px;\n}\n.ra-day .ra-section-head input {\n  max-width: 160px;\n  font-size: 12px;\n}\n.ra-day > p {\n  font-size: 12px;\n  color: var(--app-text-tertiary);\n  margin-bottom: 16px;\n}\n.ra-day-empty {\n  padding: 40px 0;\n  text-align: center;\n  color: var(--app-text-tertiary);\n  font-size: 13px;\n  line-height: 1.8;\n}\n.ra-calendar-mark {\n  display: grid;\n  place-items: center;\n  width: 46px;\n  height: 48px;\n  border: 1px solid var(--app-border);\n  border-top: 6px solid var(--app-accent-border);\n  border-radius: 8px;\n  margin: 0 auto 14px;\n  font-size: 22px;\n  color: var(--app-text-secondary);\n  font-variant-numeric: tabular-nums;\n}\n.ra-day-note {\n  padding-top: 20px;\n  margin-top: 16px;\n  border-top: 1px solid var(--app-border);\n}\n.ra-day-note h3 {\n  font-size: 13px;\n  font-weight: 500;\n  margin-bottom: 12px;\n}\n.ra-day-note > p {\n  font-size: 12px;\n  color: var(--app-text-tertiary);\n}\n.ra-day-note button {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  border: 0;\n  background: none;\n  text-align: left;\n  color: var(--app-text-secondary);\n  padding: 8px 0;\n  cursor: pointer;\n  font-size: 12px;\n}\n.ra-day-note button span {\n  color: var(--app-text);\n  font-size: 13px;\n}\n.ra-timeline {\n  margin: 24px 0;\n}\n.ra-block {\n  display: flex;\n  gap: 12px;\n  padding-bottom: 24px;\n}\n.ra-block time {\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n  color: var(--app-text-secondary);\n  width: 40px;\n  flex-shrink: 0;\n}\n.ra-block time span {\n  display: block;\n  color: var(--app-text-tertiary);\n  margin-top: 4px;\n}\n.ra-block > div {\n  padding: 10px 12px;\n  flex: 1;\n  border-left: 2px solid var(--app-accent-border);\n  background: var(--app-fill-subtle);\n  border-radius: 0 8px 8px 0;\n}\n.ra-block strong {\n  font-size: 13px;\n  font-weight: 500;\n}\n.ra-block p {\n  font-size: 12px;\n  color: var(--app-text-tertiary);\n  margin-top: 6px;\n}\n.ra-day .ant-alert {\n  margin-bottom: 12px;\n}\n.ra-source-row {\n  display: flex;\n  justify-content: space-between;\n  gap: 16px;\n  width: 100%;\n  text-align: left;\n  padding: 18px 0;\n  border: 0;\n  border-top: 1px solid var(--app-border);\n  background: none;\n  color: var(--app-text);\n  cursor: pointer;\n}\n.ra-source-row strong {\n  font-size: 14px;\n  font-weight: 500;\n}\n.ra-source-row p {\n  font-size: 13px;\n  color: var(--app-text-secondary);\n  margin: 8px 0;\n  line-height: 1.7;\n}\n.ra-source-row .ant-tag {\n  align-self: flex-start;\n}\n.ra-fields {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 14px;\n  margin-top: 16px;\n}\n.ra-wide {\n  grid-column: 1/-1;\n}\n.ra-fields .ant-select {\n  width: 100%;\n}\n.ra-review {\n  display: grid;\n  grid-template-columns: 1.1fr 1fr;\n  gap: 24px;\n  max-height: 68vh;\n  overflow: auto;\n}\n.ra-review-results > p {\n  color: var(--app-text-secondary);\n  line-height: 1.7;\n  margin: 0 0 16px;\n}\n.ra-candidate {\n  border: 1px solid var(--app-border);\n  border-radius: 12px;\n  padding: 16px;\n  margin-top: 16px;\n}\n.ra-candidate .ra-section-head {\n  align-items: flex-start;\n  margin-bottom: 8px;\n}\n.ra-candidate blockquote {\n  font-size: 12px;\n  line-height: 1.8;\n  margin: 12px 0;\n  padding: 8px 12px;\n  border-left: 2px solid var(--app-border);\n  color: var(--app-text-secondary);\n  background: var(--app-fill-subtle);\n  white-space: pre-wrap;\n}\n.ra-candidate > p {\n  font-size: 12px;\n}\n.ra-candidate summary,\n.ra-original summary {\n  font-size: 12px;\n  color: var(--app-text-secondary);\n  cursor: pointer;\n  margin-top: 12px;\n}\n.ra-original {\n  background: var(--app-fill-subtle);\n  border-radius: 12px;\n  padding: 20px;\n  min-width: 0;\n}\n.ra-original h3 {\n  font-size: 14px;\n  margin: 0 0 8px;\n}\n.ra-original pre {\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n  font-family: inherit;\n  font-size: 13px;\n  line-height: 1.9;\n  margin: 16px 0;\n}\n.ra-original img {\n  width: 100%;\n  border-radius: 8px;\n  margin-top: 16px;\n}\n.ra-app button:focus-visible {\n  outline: 2px solid var(--app-focus-ring, var(--app-accent));\n  outline-offset: 2px;\n}\n@media (max-width: 1200px) {\n  .ra-nav {\n    width: 145px;\n  }\n  .ra-main {\n    padding: 24px;\n  }\n  .ra-layout {\n    grid-template-columns: minmax(0, 1fr) 260px;\n  }\n  .ra-capture-context {\n    grid-template-columns: 1fr 1fr;\n  }\n  .ra-capture-context label:last-child {\n    grid-column: 1/-1;\n  }\n  .ra-capture-footer {\n    align-items: flex-end;\n  }\n  .ra-capture-footer .ra-hint {\n    display: block;\n    margin: 6px 0 0;\n  }\n}\n@media (max-width: 940px) {\n  .ra-layout {\n    grid-template-columns: 1fr;\n  }\n  .ra-day {\n    order: 2;\n  }\n  .ra-nav {\n    width: 135px;\n  }\n  .ra-review {\n    grid-template-columns: 1fr;\n  }\n}\n@media (max-width: 600px) {\n  .ra-app {\n    flex-direction: column;\n  }\n  .ra-nav {\n    width: auto;\n    padding: 12px;\n    border-right: 0;\n    border-bottom: 1px solid var(--app-border);\n  }\n  .ra-brand,\n  .ra-nav-foot {\n    display: none;\n  }\n  .ra-nav nav {\n    flex-direction: row;\n    overflow: auto;\n  }\n  .ra-nav nav button {\n    white-space: nowrap;\n    gap: 6px;\n    padding: 8px 12px;\n  }\n  .ra-main {\n    padding: 20px 12px;\n  }\n  .ra-header {\n    gap: 8px;\n  }\n  .ra-header h1 {\n    font-size: 20px;\n  }\n  .ra-header .ant-btn {\n    padding-inline: 10px;\n  }\n  .ra-capture,\n  .ra-list,\n  .ra-day,\n  .ra-attention {\n    padding: 16px;\n  }\n  .ra-section-head {\n    flex-wrap: wrap;\n  }\n  .ra-search {\n    width: 100%;\n  }\n  .ra-summary {\n    gap: 6px;\n  }\n  .ra-summary b {\n    font-size: 22px;\n  }\n  .ra-summary span {\n    font-size: 11px;\n  }\n  .ra-duration {\n    display: none;\n  }\n  .ra-fields {\n    grid-template-columns: 1fr;\n  }\n  .ra-capture-context {\n    grid-template-columns: 1fr;\n  }\n  .ra-capture-context label:last-child {\n    grid-column: auto;\n  }\n  .ra-review-modal .ant-modal-body {\n    padding: 0;\n  }\n  .ra-capture-footer .ra-hint {\n    display: none;\n  }\n}\n.ra-date-navigation {\n  display: flex;\n  gap: 6px;\n  margin: 0 0 14px;\n}\n.ra-date-navigation .ant-btn {\n  font-size: 12px;\n}\n';

  // plugins/apps/research-agenda/src/app.jsx
  var { host } = window.QwenPaw;
  var { React, antd } = host;
  var { useState, useEffect, useRef } = React;
  var { Button, Input, Select, Modal, Checkbox, Alert, Spin, Empty, Tag } = antd;
  var { TextArea } = Input;
  var today = () => (/* @__PURE__ */ new Date()).toLocaleDateString("sv-SE");
  var priorityNames = { normal: "\u666E\u901A", high: "\u91CD\u8981", urgent: "\u7D27\u6025" };
  var statusNames = {
    todo: "\u5F85\u529E",
    waiting: "\u7B49\u5F85\u53CD\u9988",
    done: "\u5DF2\u5B8C\u6210",
    cancelled: "\u5DF2\u53D6\u6D88"
  };
  var relationNames = {
    mine: "\u6211\u8D1F\u8D23",
    waiting: "\u7B49\u5F85\u53CD\u9988",
    unclear: "\u5F52\u5C5E\u5F85\u786E\u8BA4",
    others: "\u4ED6\u4EBA\u8D1F\u8D23"
  };
  var emptyTask = () => ({
    title: "",
    kind: "\u79D1\u7814",
    project: "",
    assignee: "",
    due_date: null,
    planned_date: today(),
    start: "",
    duration: 60,
    priority: "normal",
    status: "todo",
    waiting_for: "",
    notes: ""
  });
  function TaskEditor({ value, onChange }) {
    const set = (key, next) => onChange({ ...value, [key]: next });
    return /* @__PURE__ */ React.createElement("div", { className: "ra-fields" }, /* @__PURE__ */ React.createElement("label", { className: "ra-wide" }, "\u4E8B\u9879\u540D\u79F0", /* @__PURE__ */ React.createElement(
      Input,
      {
        "aria-label": "\u4E8B\u9879\u540D\u79F0",
        value: value.title,
        maxLength: 240,
        onChange: (event) => set("title", event.target.value)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u7C7B\u578B", /* @__PURE__ */ React.createElement(
      Select,
      {
        "aria-label": "\u7C7B\u578B",
        value: value.kind,
        options: ["\u79D1\u7814", "\u9879\u76EE", "\u4E8B\u52A1", "\u534F\u8C03"].map((value2) => ({
          value: value2,
          label: value2
        })),
        onChange: (value2) => set("kind", value2)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u9879\u76EE\u6216\u7814\u7A76\u4E3B\u9898", /* @__PURE__ */ React.createElement(
      Input,
      {
        "aria-label": "\u9879\u76EE\u6216\u7814\u7A76\u4E3B\u9898",
        value: value.project,
        onChange: (event) => set("project", event.target.value)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u8D1F\u8D23\u4EBA", /* @__PURE__ */ React.createElement(
      Input,
      {
        "aria-label": "\u8D1F\u8D23\u4EBA",
        value: value.assignee,
        onChange: (event) => set("assignee", event.target.value)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u4E0E\u6211\u7684\u5173\u7CFB", /* @__PURE__ */ React.createElement(
      Select,
      {
        "aria-label": "\u4E0E\u6211\u7684\u5173\u7CFB",
        value: value.relation || "mine",
        options: Object.entries(relationNames).map(([value2, label]) => ({
          value: value2,
          label
        })),
        onChange: (value2) => set("relation", value2)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u622A\u6B62\u65E5\u671F", /* @__PURE__ */ React.createElement(
      "input",
      {
        "aria-label": "\u622A\u6B62\u65E5\u671F",
        type: "date",
        value: value.due_date || "",
        onChange: (event) => set("due_date", event.target.value || null)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u8BA1\u5212\u65E5\u671F", /* @__PURE__ */ React.createElement(
      "input",
      {
        "aria-label": "\u8BA1\u5212\u65E5\u671F",
        type: "date",
        value: value.planned_date || "",
        onChange: (event) => set("planned_date", event.target.value || null)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u56FA\u5B9A\u5F00\u59CB\u65F6\u95F4", /* @__PURE__ */ React.createElement(
      "input",
      {
        "aria-label": "\u56FA\u5B9A\u5F00\u59CB\u65F6\u95F4",
        type: "time",
        value: value.start || "",
        onChange: (event) => set("start", event.target.value)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u9884\u8BA1\u7528\u65F6\uFF08\u5206\u949F\uFF09", /* @__PURE__ */ React.createElement(
      "input",
      {
        "aria-label": "\u9884\u8BA1\u7528\u65F6",
        type: "number",
        min: "15",
        max: "480",
        step: "15",
        value: value.duration,
        onChange: (event) => set("duration", Number(event.target.value))
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u4F18\u5148\u7EA7", /* @__PURE__ */ React.createElement(
      Select,
      {
        "aria-label": "\u4F18\u5148\u7EA7",
        value: value.priority,
        options: Object.entries(priorityNames).map(([value2, label]) => ({
          value: value2,
          label
        })),
        onChange: (value2) => set("priority", value2)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u72B6\u6001", /* @__PURE__ */ React.createElement(
      Select,
      {
        "aria-label": "\u72B6\u6001",
        value: value.status,
        options: Object.entries(statusNames).map(([value2, label]) => ({
          value: value2,
          label
        })),
        onChange: (value2) => set("status", value2)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "\u7B49\u5F85\u8C01\u53CD\u9988", /* @__PURE__ */ React.createElement(
      Input,
      {
        "aria-label": "\u7B49\u5F85\u8C01\u53CD\u9988",
        value: value.waiting_for,
        onChange: (event) => set("waiting_for", event.target.value)
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "ra-wide" }, "\u8865\u5145\u8BF4\u660E", /* @__PURE__ */ React.createElement(
      TextArea,
      {
        "aria-label": "\u8865\u5145\u8BF4\u660E",
        rows: 2,
        value: value.notes,
        onChange: (event) => set("notes", event.target.value)
      }
    )));
  }
  function Agenda({ agentId }) {
    const [data, setData] = useState({ tasks: [], sources: [] });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const [view, setView] = useState("\u4ECA\u65E5");
    const [day, setDay] = useState(today());
    const [query, setQuery] = useState("");
    const [kind, setKind] = useState("\u5168\u90E8");
    const [text, setText] = useState("");
    const [images, setImages] = useState([]);
    const [identity, setIdentity] = useState(
      () => localStorage.getItem(`research-agenda.identity.${agentId}`) || ""
    );
    const [sourceName, setSourceName] = useState("");
    const [referenceDate, setReferenceDate] = useState(today());
    const [source, setSource] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [editor, setEditor] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [notice, setNotice] = useState("");
    const alive = useRef(true);
    const controllers = useRef(/* @__PURE__ */ new Set());
    const sourceSequence = useRef(0);
    const fileInput = useRef(null);
    async function api(path, method = "GET", body) {
      const controller = new AbortController();
      controllers.current.add(controller);
      const token = host.getApiToken?.();
      try {
        const response = await fetch(
          host.getApiUrl(
            `/research-agenda${path}${path.includes("?") ? "&" : "?"}agent_id=${encodeURIComponent(agentId)}`
          ),
          {
            method,
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              ...token ? { Authorization: `Bearer ${token}` } : {}
            },
            body: body === void 0 ? void 0 : JSON.stringify(body)
          }
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            typeof result.detail === "string" ? result.detail : "\u8BF7\u6C42\u672A\u5B8C\u6210\uFF0C\u8BF7\u68C0\u67E5\u8F93\u5165\u5185\u5BB9\u540E\u91CD\u8BD5"
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
      refresh().catch((error2) => {
        if (alive.current) setError(error2.message);
      }).finally(() => {
        if (alive.current) setLoading(false);
      });
      const timer = setInterval(() => {
        refresh().catch(() => {
        });
      }, 6e4);
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
      } catch (error2) {
        if (alive.current && error2.name !== "AbortError") setError(error2.message);
      } finally {
        if (alive.current) setBusy("");
      }
    }
    async function addFiles(files) {
      const picked = [...files];
      if (picked.length + images.length > 4) {
        setError("\u4E00\u6B21\u6700\u591A\u653E\u5165 4 \u5F20\u622A\u56FE");
        return;
      }
      if (picked.some(
        (file) => !["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024
      )) {
        setError("\u8BF7\u9009\u62E9 PNG\u3001JPEG \u6216 WebP \u56FE\u7247\uFF0C\u5355\u5F20\u4E0D\u8D85\u8FC7 4MB");
        return;
      }
      await run("files", async () => {
        const added = await Promise.all(
          picked.map(
            (file) => new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = () => reject(new Error("\u56FE\u7247\u8BFB\u53D6\u5931\u8D25\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9"));
              reader.onload = () => resolve({ name: file.name, data_url: reader.result });
              reader.readAsDataURL(file);
            })
          )
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
            (item) => item.candidate_id === candidate.candidate_id
          );
          return {
            ...candidate,
            selected: value.status === "applied" ? !!accepted : ["mine", "waiting"].includes(candidate.relation),
            fields: { ...candidate, ...accepted?.fields }
          };
        })
      );
    }
    async function extract() {
      await run("extract", async () => {
        const result = await api("/extract", "POST", {
          text,
          images,
          identity,
          reference_date: referenceDate,
          source_name: sourceName || "\u804A\u5929\u4E0E\u5DE5\u4F5C\u8BB0\u5F55"
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
          candidates: (skipAll ? [] : candidates).filter((candidate) => candidate.selected).map((candidate) => ({
            candidate_id: candidate.candidate_id,
            fields: candidate.fields
          }))
        });
        if (!alive.current) return;
        setData({ tasks: result.tasks, sources: result.sources });
        setSource(null);
        setSchedule(null);
        setNotice(
          result.ids.length ? `\u5DF2\u4FDD\u5B58 ${result.ids.length} \u9879\u5DE5\u4F5C` : "\u6750\u6599\u5DF2\u5904\u7406\uFF0C\u672A\u65B0\u589E\u4E8B\u9879"
        );
        setView("\u5168\u90E8\u4E8B\u9879");
      });
    }
    async function update(task, fields) {
      await api(`/tasks/${task.id}`, "PUT", {
        revision: task.revision,
        fields: { ...task, ...fields }
      });
      await refresh();
      if (alive.current) setSchedule(null);
    }
    function sample() {
      setIdentity("\u5F20\u8001\u5E08");
      setSourceName("\u9879\u76EE\u7FA4\u8BB0\u5F55");
      setText(
        "\u738B\u8001\u5E08\uFF1A\u5F20\u8001\u5E08\uFF0C\u5468\u4E94\u4E4B\u524D\u628A\u57FA\u91D1\u7533\u8BF7\u7684\u7814\u7A76\u65B9\u6848\u6539\u4E00\u4E0B\u3002\u9884\u7B97\u627E\u5C0F\u674E\u6838\u5BF9\uFF0C\u660E\u5929\u4E0B\u5348\u4E09\u70B9\u6211\u4EEC\u78B0\u4E00\u4E0B\u3002\n\u5F20\u8001\u5E08\uFF1A\u597D\u7684\uFF0C\u6211\u5148\u6539\u65B9\u6848\u3002\n\u5C0F\u674E\uFF1A\u9884\u7B97\u8868\u6211\u660E\u5929\u4E0A\u5348\u53D1\u7ED9\u5F20\u8001\u5E08\u3002"
      );
    }
    function moveDay(amount) {
      const next = /* @__PURE__ */ new Date(`${day}T12:00:00`);
      next.setDate(next.getDate() + amount);
      setDay(next.toLocaleDateString("sv-SE"));
      setSchedule(null);
    }
    const active = data.tasks.filter(
      (task) => !["done", "cancelled"].includes(task.status)
    );
    const overdue = active.filter(
      (task) => task.due_date && task.due_date < today()
    );
    const dueToday = active.filter((task) => task.due_date === today());
    const waiting = active.filter((task) => task.status === "waiting");
    const uncertain = active.filter(
      (task) => ["unclear", "others"].includes(task.relation)
    );
    const pending = data.sources.filter((source2) => source2.status === "review");
    const filtered = data.tasks.filter((task) => {
      const matchesView = view === "\u5168\u90E8\u4E8B\u9879" ? !["done", "cancelled"].includes(task.status) : view === "\u4ECA\u65E5" ? task.status === "todo" && (task.planned_date || today()) <= day : view === "\u7B49\u5F85\u53CD\u9988" ? task.status === "waiting" : view === "\u5F85\u786E\u8BA4" ? ["unclear", "others"].includes(task.relation) && task.status === "todo" : view === "\u5DF2\u7ED3\u675F" ? ["done", "cancelled"].includes(task.status) : false;
      return matchesView && (kind === "\u5168\u90E8" || kind === task.kind) && `${task.title} ${task.project} ${task.assignee}`.toLowerCase().includes(query.toLowerCase());
    }).sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"));
    return /* @__PURE__ */ React.createElement("div", { className: "ra-app" }, /* @__PURE__ */ React.createElement("style", null, style_default), /* @__PURE__ */ React.createElement("aside", { className: "ra-nav" }, /* @__PURE__ */ React.createElement("div", { className: "ra-brand" }, "\u5DE5\u4F5C\u65E5\u7A0B"), /* @__PURE__ */ React.createElement("nav", { "aria-label": "\u5DE5\u4F5C\u65E5\u7A0B\u89C6\u56FE" }, ["\u4ECA\u65E5", "\u5168\u90E8\u4E8B\u9879", "\u7B49\u5F85\u53CD\u9988", "\u5F85\u786E\u8BA4", "\u6750\u6599\u8BB0\u5F55", "\u5DF2\u7ED3\u675F"].map(
      (label) => /* @__PURE__ */ React.createElement(
        "button",
        {
          key: label,
          className: view === label ? "is-active" : "",
          onClick: () => {
            setView(label);
            if (label === "\u4ECA\u65E5") {
              setDay(today());
              setSchedule(null);
            }
          }
        },
        label,
        /* @__PURE__ */ React.createElement("span", null, label === "\u7B49\u5F85\u53CD\u9988" ? waiting.length : label === "\u5F85\u786E\u8BA4" ? uncertain.length + pending.length : "")
      )
    )), /* @__PURE__ */ React.createElement("div", { className: "ra-nav-foot" }, "\u5F53\u524D\u4E13\u5BB6\u72EC\u7ACB\u4FDD\u5B58", /* @__PURE__ */ React.createElement("br", null), "\u6BCF\u5206\u949F\u66F4\u65B0\u4E8B\u9879\u72B6\u6001")), /* @__PURE__ */ React.createElement("div", { className: "ra-main" }, /* @__PURE__ */ React.createElement("header", { className: "ra-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ra-caption" }, "\u5E94\u7528"), /* @__PURE__ */ React.createElement("h1", null, view === "\u4ECA\u65E5" ? day === today() ? "\u4ECA\u5929\u7684\u5DE5\u4F5C" : `${day} \u7684\u5DE5\u4F5C` : view)), /* @__PURE__ */ React.createElement("div", { className: "ra-actions" }, /* @__PURE__ */ React.createElement(
      Button,
      {
        onClick: () => run("export", async () => {
          const result = await api("/export");
          const url = URL.createObjectURL(
            new Blob([JSON.stringify(result, null, 2)], {
              type: "application/json"
            })
          );
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `\u5DE5\u4F5C\u65E5\u7A0B-${today()}.json`;
          anchor.click();
          setTimeout(() => URL.revokeObjectURL(url), 1e3);
        })
      },
      "\u5BFC\u51FA"
    ), /* @__PURE__ */ React.createElement(Button, { disabled: !!busy, onClick: () => setEditor(emptyTask()) }, "\u65B0\u5EFA\u4E8B\u9879"))), error && /* @__PURE__ */ React.createElement(
      Alert,
      {
        type: "error",
        showIcon: true,
        closable: true,
        onClose: () => setError(""),
        message: error
      }
    ), notice && /* @__PURE__ */ React.createElement(
      Alert,
      {
        type: "success",
        closable: true,
        onClose: () => setNotice(""),
        message: notice
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "ra-layout" }, /* @__PURE__ */ React.createElement("div", { className: "ra-content" }, /* @__PURE__ */ React.createElement(
      "section",
      {
        className: "ra-capture",
        "aria-label": "\u6574\u7406\u5DE5\u4F5C\u6750\u6599",
        onDragOver: (event) => event.preventDefault(),
        onDrop: (event) => {
          event.preventDefault();
          if (!busy) addFiles(event.dataTransfer.files);
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "ra-section-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u628A\u5DE5\u4F5C\u8BB0\u5F55\u653E\u8FDB\u6765"), /* @__PURE__ */ React.createElement(
        Button,
        {
          type: "text",
          size: "small",
          onClick: sample,
          disabled: !!busy
        },
        "\u8BD5\u7528\u4E00\u6BB5\u793A\u4F8B"
      )),
      /* @__PURE__ */ React.createElement(
        TextArea,
        {
          "aria-label": "\u804A\u5929\u8BB0\u5F55\u6216\u4F1A\u8BAE\u7EAA\u8981",
          placeholder: "\u7C98\u8D34\u804A\u5929\u8BB0\u5F55\u3001\u4F1A\u8BAE\u7EAA\u8981\uFF0C\u6216\u62D6\u5165\u622A\u56FE\u2026",
          autoSize: { minRows: 4, maxRows: 10 },
          value: text,
          maxLength: 5e4,
          disabled: !!busy,
          onChange: (event) => setText(event.target.value),
          onPaste: (event) => {
            const files = [...event.clipboardData.items].filter((item) => item.kind === "file").map((item) => item.getAsFile()).filter(Boolean);
            if (files.length) {
              event.preventDefault();
              if (!busy) addFiles(files);
            }
          }
        }
      ),
      !!images.length && /* @__PURE__ */ React.createElement("div", { className: "ra-images" }, images.map((image, index) => /* @__PURE__ */ React.createElement("div", { key: index }, /* @__PURE__ */ React.createElement("img", { src: image.data_url, alt: image.name }), /* @__PURE__ */ React.createElement(
        Button,
        {
          "aria-label": `\u79FB\u9664 ${image.name}`,
          size: "small",
          disabled: !!busy,
          onClick: () => setImages(
            images.filter((_, position) => position !== index)
          )
        },
        "\u79FB\u9664"
      )))),
      /* @__PURE__ */ React.createElement("div", { className: "ra-capture-context" }, /* @__PURE__ */ React.createElement("label", null, "\u8BB0\u5F55\u4E2D\u7684\u6211", /* @__PURE__ */ React.createElement(
        Input,
        {
          "aria-label": "\u8BB0\u5F55\u4E2D\u7684\u6211",
          placeholder: "\u59D3\u540D\u3001\u7FA4\u6635\u79F0\u6216\u79F0\u547C",
          value: identity,
          disabled: !!busy,
          onChange: (event) => setIdentity(event.target.value)
        }
      )), /* @__PURE__ */ React.createElement("label", null, "\u8BB0\u5F55\u65E5\u671F", /* @__PURE__ */ React.createElement(
        "input",
        {
          "aria-label": "\u8BB0\u5F55\u65E5\u671F",
          type: "date",
          value: referenceDate,
          disabled: !!busy,
          onChange: (event) => setReferenceDate(event.target.value)
        }
      )), /* @__PURE__ */ React.createElement("label", null, "\u6750\u6599\u540D\u79F0", /* @__PURE__ */ React.createElement(
        Input,
        {
          "aria-label": "\u6750\u6599\u540D\u79F0",
          placeholder: "\u5982 \u9879\u76EE\u7FA4 / \u7EC4\u4F1A",
          value: sourceName,
          disabled: !!busy,
          onChange: (event) => setSourceName(event.target.value)
        }
      ))),
      /* @__PURE__ */ React.createElement("div", { className: "ra-section-head ra-capture-footer" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
        "input",
        {
          ref: fileInput,
          type: "file",
          hidden: true,
          multiple: true,
          accept: "image/png,image/jpeg,image/webp",
          onChange: (event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }
        }
      ), /* @__PURE__ */ React.createElement(
        Button,
        {
          disabled: !!busy,
          onClick: () => fileInput.current.click()
        },
        "\u6DFB\u52A0\u622A\u56FE"
      ), /* @__PURE__ */ React.createElement("span", { className: "ra-hint" }, "\u6700\u591A 4 \u5F20 \xB7 \u5355\u5F20 4MB")), /* @__PURE__ */ React.createElement(
        Button,
        {
          type: "primary",
          "aria-label": "\u6574\u7406\u6210\u5F85\u529E",
          loading: busy === "extract",
          disabled: !!busy || !identity.trim() || !text.trim() && !images.length || !referenceDate,
          onClick: extract
        },
        "\u6574\u7406\u6210\u5F85\u529E"
      )),
      /* @__PURE__ */ React.createElement("div", { className: "ra-hint" }, "\u6587\u5B57\u4E0E\u622A\u56FE\u4F1A\u4EA4\u7ED9\u5F53\u524D\u4E13\u5BB6\u914D\u7F6E\u7684\u6A21\u578B\u3002\u8BC6\u522B\u540E\u53EF\u6838\u5BF9\u539F\u6587\u3001\u4FEE\u6539\u5E76\u9009\u62E9\u8981\u4FDD\u5B58\u7684\u4E8B\u9879\u3002")
    ), /* @__PURE__ */ React.createElement("section", { className: "ra-attention" }, /* @__PURE__ */ React.createElement("div", { className: "ra-section-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u9700\u8981\u7559\u610F"), /* @__PURE__ */ React.createElement("span", { className: "ra-hint" }, "\u6309\u5F53\u524D\u65E5\u671F\u68C0\u67E5")), /* @__PURE__ */ React.createElement("div", { className: "ra-summary" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setView("\u5168\u90E8\u4E8B\u9879");
          setQuery("");
        }
      },
      /* @__PURE__ */ React.createElement("b", null, overdue.length),
      /* @__PURE__ */ React.createElement("span", null, "\u5DF2\u8FC7\u622A\u6B62\u65E5")
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => setView("\u4ECA\u65E5") }, /* @__PURE__ */ React.createElement("b", null, dueToday.length), /* @__PURE__ */ React.createElement("span", null, "\u4ECA\u5929\u622A\u6B62")), /* @__PURE__ */ React.createElement("button", { onClick: () => setView("\u7B49\u5F85\u53CD\u9988") }, /* @__PURE__ */ React.createElement("b", null, waiting.length), /* @__PURE__ */ React.createElement("span", null, "\u7B49\u5F85\u53CD\u9988")), /* @__PURE__ */ React.createElement("button", { onClick: () => setView("\u6750\u6599\u8BB0\u5F55") }, /* @__PURE__ */ React.createElement("b", null, pending.length), /* @__PURE__ */ React.createElement("span", null, "\u6750\u6599\u5F85\u786E\u8BA4"))), overdue.length > 0 && /* @__PURE__ */ React.createElement("p", { className: "ra-warning" }, "\u4F18\u5148\u6838\u5BF9", " ", overdue.slice(0, 2).map((task) => `\u300C${task.title}\u300D`).join("\u3001"), " ", "\u7684\u8FDB\u5EA6\u3002")), /* @__PURE__ */ React.createElement("section", { className: "ra-list" }, /* @__PURE__ */ React.createElement("div", { className: "ra-section-head" }, /* @__PURE__ */ React.createElement("h2", null, view === "\u4ECA\u65E5" ? "\u5F85\u5904\u7406\u4E8B\u9879" : view, /* @__PURE__ */ React.createElement("span", { className: "ra-count" }, view === "\u6750\u6599\u8BB0\u5F55" ? data.sources.length : filtered.length + (view === "\u5F85\u786E\u8BA4" ? pending.length : 0))), /* @__PURE__ */ React.createElement(
      Input,
      {
        "aria-label": "\u641C\u7D22\u4E8B\u9879",
        placeholder: "\u641C\u7D22\u4E8B\u9879\u3001\u9879\u76EE\u3001\u8D1F\u8D23\u4EBA",
        value: query,
        onChange: (event) => setQuery(event.target.value),
        allowClear: true,
        className: "ra-search"
      }
    )), view !== "\u6750\u6599\u8BB0\u5F55" && /* @__PURE__ */ React.createElement("div", { className: "ra-filters" }, ["\u5168\u90E8", "\u79D1\u7814", "\u9879\u76EE", "\u4E8B\u52A1", "\u534F\u8C03"].map((label) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: label,
        "aria-pressed": kind === label,
        onClick: () => setKind(label)
      },
      label
    ))), view === "\u5F85\u786E\u8BA4" && pending.map((item) => /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "ra-source-row",
        key: item.id,
        disabled: !!busy,
        onClick: () => openSource(item.id)
      },
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, item.source_name), /* @__PURE__ */ React.createElement("p", null, item.summary)),
      /* @__PURE__ */ React.createElement(Tag, null, "\u6838\u5BF9\u6574\u7406\u7ED3\u679C")
    )), loading ? /* @__PURE__ */ React.createElement(Spin, null) : view === "\u6750\u6599\u8BB0\u5F55" ? data.sources.map((item) => /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "ra-source-row",
        key: item.id,
        onClick: () => openSource(item.id)
      },
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, item.source_name), /* @__PURE__ */ React.createElement("p", null, item.summary || "\u67E5\u770B\u6574\u7406\u7ED3\u679C\u548C\u539F\u59CB\u6750\u6599"), /* @__PURE__ */ React.createElement("span", { className: "ra-hint" }, item.reference_date, " \xB7 ", item.candidates.length, " ", "\u9879\u8BC6\u522B\u7ED3\u679C")),
      /* @__PURE__ */ React.createElement(Tag, null, item.status === "review" ? "\u5F85\u786E\u8BA4" : "\u5DF2\u5904\u7406")
    )) : filtered.map((task) => /* @__PURE__ */ React.createElement("article", { className: "ra-task", key: task.id }, /* @__PURE__ */ React.createElement(
      Checkbox,
      {
        "aria-label": `\u5B8C\u6210 ${task.title}`,
        disabled: !!busy,
        checked: task.status === "done",
        onChange: (event) => run(
          "task",
          () => update(task, {
            status: event.target.checked ? "done" : "todo"
          })
        )
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "ra-task-body" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "ra-task-title",
        onClick: () => setEditor(task)
      },
      task.title
    ), /* @__PURE__ */ React.createElement("div", { className: "ra-task-meta" }, /* @__PURE__ */ React.createElement("span", { className: `ra-kind ra-kind-${task.kind}` }, task.kind), task.project && /* @__PURE__ */ React.createElement("span", null, task.project), task.assignee && /* @__PURE__ */ React.createElement("span", null, task.assignee), task.due_date ? /* @__PURE__ */ React.createElement(
      "span",
      {
        className: task.due_date < today() && task.status !== "done" ? "ra-warning" : ""
      },
      task.due_date,
      " \u622A\u6B62"
    ) : /* @__PURE__ */ React.createElement("span", null, "\u622A\u6B62\u65E5\u5F85\u5B9A"), task.priority !== "normal" && /* @__PURE__ */ React.createElement("span", null, priorityNames[task.priority])), task.status === "waiting" && /* @__PURE__ */ React.createElement("p", null, "\u7B49\u5F85 ", task.waiting_for || "\u8054\u7CFB\u4EBA\u5F85\u8865\u5145", Date.now() - new Date(task.updated_at).getTime() > 3 * 864e5 ? " \xB7 \u5DF2\u8D85\u8FC7 3 \u5929\u672A\u66F4\u65B0" : ""), task.relation === "unclear" && /* @__PURE__ */ React.createElement("p", null, "\u5F52\u5C5E\u5F85\u786E\u8BA4\uFF0C\u8BF7\u6838\u5BF9\u8D1F\u8D23\u4EBA\u3002"), /* @__PURE__ */ React.createElement("div", { className: "ra-task-tools" }, task.source_id && /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "small",
        type: "text",
        onClick: () => openSource(task.source_id)
      },
      "\u67E5\u770B\u6765\u6E90"
    ), task.status === "waiting" && /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "small",
        type: "text",
        disabled: !!busy,
        onClick: () => run(
          "task",
          () => update(task, {
            status: "todo",
            waiting_for: ""
          })
        )
      },
      "\u5DF2\u6536\u5230\u53CD\u9988"
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "small",
        type: "text",
        onClick: () => run("copy", async () => {
          await navigator.clipboard.writeText(
            `${task.waiting_for || task.assignee || "\u60A8\u597D"}\uFF0C\u60F3\u8DDF\u8FDB\u4E00\u4E0B\u300C${task.title}\u300D${task.due_date ? `\uFF0C\u539F\u5B9A ${task.due_date} \u5B8C\u6210` : ""}\u3002\u76EE\u524D\u8FDB\u5C55\u5982\u4F55\uFF1F\u5982\u9700\u6211\u914D\u5408\uFF0C\u8BF7\u544A\u8BC9\u6211\u3002`
          );
          setNotice("\u8DDF\u8FDB\u8349\u7A3F\u5DF2\u590D\u5236\uFF0C\u53EF\u4FEE\u6539\u540E\u53D1\u9001");
        })
      },
      "\u590D\u5236\u8DDF\u8FDB\u8349\u7A3F"
    ))), /* @__PURE__ */ React.createElement("span", { className: "ra-duration" }, task.duration, " \u5206\u949F"))), !loading && (view === "\u6750\u6599\u8BB0\u5F55" ? !data.sources.length : !filtered.length && (view !== "\u5F85\u786E\u8BA4" || !pending.length)) && /* @__PURE__ */ React.createElement(
      Empty,
      {
        image: Empty.PRESENTED_IMAGE_SIMPLE,
        description: view === "\u6750\u6599\u8BB0\u5F55" ? "\u6574\u7406\u8FC7\u7684\u6750\u6599\u4F1A\u4FDD\u5B58\u5728\u8FD9\u91CC\uFF0C\u53EF\u968F\u65F6\u56DE\u770B\u6765\u6E90" : "\u6682\u65E0\u4E8B\u9879\u3002\u653E\u5165\u804A\u5929\u8BB0\u5F55\u6216\u622A\u56FE\uFF0C\u5F00\u59CB\u6574\u7406\u3002"
      }
    ))), /* @__PURE__ */ React.createElement("aside", { className: "ra-day" }, /* @__PURE__ */ React.createElement("div", { className: "ra-section-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u65E5\u7A0B"), /* @__PURE__ */ React.createElement(
      "input",
      {
        "aria-label": "\u65E5\u7A0B\u65E5\u671F",
        disabled: !!busy,
        type: "date",
        value: day,
        onChange: (event) => {
          setDay(event.target.value || today());
          setSchedule(null);
        }
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "ra-date-navigation" }, /* @__PURE__ */ React.createElement(
      Button,
      {
        "aria-label": "\u524D\u4E00\u5929",
        size: "small",
        disabled: !!busy,
        onClick: () => moveDay(-1)
      },
      "\u2039"
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        size: "small",
        disabled: !!busy,
        onClick: () => {
          setDay(today());
          setSchedule(null);
        }
      },
      "\u4ECA\u5929"
    ), /* @__PURE__ */ React.createElement(
      Button,
      {
        "aria-label": "\u540E\u4E00\u5929",
        size: "small",
        disabled: !!busy,
        onClick: () => moveDay(1)
      },
      "\u203A"
    )), /* @__PURE__ */ React.createElement("p", null, "09:00\u201418:00 \xB7 \u5348\u4F11 12:00\u201413:30"), /* @__PURE__ */ React.createElement(
      Button,
      {
        block: true,
        loading: busy === "plan",
        disabled: !!busy,
        onClick: () => run("plan", async () => {
          const result = await api(`/plan?day=${day}`);
          if (alive.current) setSchedule(result);
        })
      },
      "\u5B89\u6392\u5F53\u5929\u5DE5\u4F5C"
    ), schedule ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "ra-timeline" }, schedule.blocks.map((block) => /* @__PURE__ */ React.createElement("div", { key: block.task_id, className: "ra-block" }, /* @__PURE__ */ React.createElement("time", null, block.start, /* @__PURE__ */ React.createElement("span", null, block.end)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, block.title), /* @__PURE__ */ React.createElement("p", null, block.kind, " \xB7 ", block.fixed ? "\u56FA\u5B9A\u6D3B\u52A8" : "\u5EFA\u8BAE\u65F6\u95F4"))))), !schedule.blocks.length && /* @__PURE__ */ React.createElement("p", { className: "ra-hint" }, "\u5F53\u5929\u6682\u65E0\u53EF\u5B89\u6392\u7684\u4E8B\u9879\u3002"), !!schedule.conflicts.length && /* @__PURE__ */ React.createElement(
      Alert,
      {
        type: "warning",
        message: "\u56FA\u5B9A\u6D3B\u52A8\u5B58\u5728\u65F6\u95F4\u51B2\u7A81\uFF0C\u8BF7\u7F16\u8F91\u4E8B\u9879\u8C03\u6574"
      }
    ), !!schedule.unplanned.length && /* @__PURE__ */ React.createElement(
      Alert,
      {
        type: "warning",
        message: `${schedule.unplanned.length} \u9879\u5DE5\u4F5C\u672A\u6392\u5165\uFF0C\u8BF7\u8C03\u6574\u8BA1\u5212\u65E5\u671F\u6216\u7528\u65F6`
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "ra-hint" }, "\u6B64\u5904\u4E3A\u6392\u671F\u9884\u89C8\uFF0C\u91CD\u65B0\u5B89\u6392\u4F1A\u6839\u636E\u6700\u65B0\u4E8B\u9879\u8BA1\u7B97\u3002")) : /* @__PURE__ */ React.createElement("div", { className: "ra-day-empty" }, /* @__PURE__ */ React.createElement("div", { className: "ra-calendar-mark" }, Number(day.slice(-2))), /* @__PURE__ */ React.createElement("p", null, "\u6574\u7406\u5E76\u786E\u8BA4\u4E8B\u9879\u540E\uFF0C", /* @__PURE__ */ React.createElement("br", null), "\u6309\u9884\u8BA1\u7528\u65F6\u5B89\u6392\u5230\u7A7A\u6863\u3002")), /* @__PURE__ */ React.createElement("div", { className: "ra-day-note" }, /* @__PURE__ */ React.createElement("h3", null, "\u5F85\u53CD\u9988\u4E8B\u9879"), waiting.slice(0, 4).map((task) => /* @__PURE__ */ React.createElement("button", { key: task.id, onClick: () => setEditor(task) }, /* @__PURE__ */ React.createElement("span", null, task.waiting_for || "\u5F85\u8865\u5145\u8054\u7CFB\u4EBA"), task.title)), !waiting.length && /* @__PURE__ */ React.createElement("p", null, "\u6682\u65E0\u7B49\u5F85\u4E2D\u7684\u53CD\u9988"))))), /* @__PURE__ */ React.createElement(
      Modal,
      {
        title: editor?.id ? "\u7F16\u8F91\u4E8B\u9879" : "\u65B0\u5EFA\u4E8B\u9879",
        open: !!editor,
        onCancel: () => !busy && setEditor(null),
        confirmLoading: busy === "save",
        okButtonProps: { disabled: !!busy && busy !== "save" },
        okText: "\u4FDD\u5B58\u4E8B\u9879",
        cancelText: "\u53D6\u6D88",
        onOk: () => run("save", async () => {
          if (!editor.title.trim()) throw new Error("\u8BF7\u586B\u5199\u4E8B\u9879\u540D\u79F0");
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
      },
      editor && /* @__PURE__ */ React.createElement(TaskEditor, { value: editor, onChange: setEditor })
    ), /* @__PURE__ */ React.createElement(
      Modal,
      {
        className: "ra-review-modal",
        title: source?.status === "applied" ? "\u6750\u6599\u4E0E\u6765\u6E90" : "\u6838\u5BF9\u6574\u7406\u7ED3\u679C",
        open: !!source,
        width: 1120,
        onCancel: () => {
          if (!busy) {
            ++sourceSequence.current;
            setSource(null);
          }
        },
        footer: source?.status === "applied" ? /* @__PURE__ */ React.createElement(Button, { onClick: () => setSource(null) }, "\u5173\u95ED") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { disabled: !!busy, onClick: () => setSource(null) }, "\u7A0D\u540E\u5904\u7406"), /* @__PURE__ */ React.createElement(Button, { disabled: !!busy, onClick: () => apply(true) }, "\u65E0\u9700\u65B0\u589E\u4E8B\u9879"), /* @__PURE__ */ React.createElement(
          Button,
          {
            type: "primary",
            loading: busy === "apply",
            disabled: !!busy || !candidates.some((candidate) => candidate.selected),
            onClick: () => apply()
          },
          "\u4FDD\u5B58\u9009\u4E2D\u7684",
          " ",
          candidates.filter((candidate) => candidate.selected).length,
          " \u9879"
        ))
      },
      source && /* @__PURE__ */ React.createElement("div", { className: "ra-review" }, /* @__PURE__ */ React.createElement("div", { className: "ra-review-results" }, /* @__PURE__ */ React.createElement("p", null, source.summary), !!source.questions.length && /* @__PURE__ */ React.createElement(
        Alert,
        {
          type: "warning",
          message: "\u9700\u8981\u6838\u5BF9",
          description: source.questions.map((question, index) => /* @__PURE__ */ React.createElement("div", { key: index }, question))
        }
      ), !candidates.length && /* @__PURE__ */ React.createElement(Empty, { description: "\u672A\u8BC6\u522B\u5230\u9700\u8981\u65B0\u589E\u6216\u53D8\u66F4\u7684\u5DE5\u4F5C\u4E8B\u9879" }), candidates.map((candidate, index) => /* @__PURE__ */ React.createElement("article", { className: "ra-candidate", key: candidate.candidate_id }, /* @__PURE__ */ React.createElement("div", { className: "ra-section-head" }, /* @__PURE__ */ React.createElement(
        Checkbox,
        {
          disabled: source.status === "applied" || !!busy,
          checked: candidate.selected,
          onChange: (event) => setCandidates(
            candidates.map(
              (item, position) => position === index ? { ...item, selected: event.target.checked } : item
            )
          )
        },
        candidate.fields.title
      ), /* @__PURE__ */ React.createElement(Tag, null, candidate.action === "update" ? "\u53D8\u66F4" : candidate.action === "cancel" ? "\u53D6\u6D88" : relationNames[candidate.relation])), /* @__PURE__ */ React.createElement("div", { className: "ra-task-meta" }, /* @__PURE__ */ React.createElement("span", null, candidate.fields.assignee || "\u8D1F\u8D23\u4EBA\u5F85\u786E\u8BA4"), /* @__PURE__ */ React.createElement("span", null, candidate.fields.due_date ? `${candidate.fields.due_date} \u622A\u6B62` : "\u622A\u6B62\u65E5\u672A\u5B9A"), candidate.fields.planned_date && /* @__PURE__ */ React.createElement("span", null, candidate.fields.planned_date, " ", candidate.fields.start), /* @__PURE__ */ React.createElement("span", null, "\u9884\u8BA1 ", candidate.fields.duration, " \u5206\u949F")), /* @__PURE__ */ React.createElement("blockquote", null, candidate.evidence), !!candidate.questions.length && /* @__PURE__ */ React.createElement("p", { className: "ra-warning" }, candidate.questions.join("\uFF1B")), source.status === "review" ? /* @__PURE__ */ React.createElement("details", null, /* @__PURE__ */ React.createElement("summary", null, "\u6838\u5BF9\u6216\u4FEE\u6539\u5B57\u6BB5"), /* @__PURE__ */ React.createElement(
        TaskEditor,
        {
          value: candidate.fields,
          onChange: (fields) => setCandidates(
            candidates.map(
              (item, position) => position === index ? { ...item, fields } : item
            )
          )
        }
      )) : /* @__PURE__ */ React.createElement("p", null, candidate.due_date || "\u622A\u6B62\u65E5\u672A\u5B9A", " \xB7", " ", candidate.assignee || "\u8D1F\u8D23\u4EBA\u672A\u5B9A")))), /* @__PURE__ */ React.createElement("aside", { className: "ra-original" }, /* @__PURE__ */ React.createElement("h3", null, source.source_name), /* @__PURE__ */ React.createElement("div", { className: "ra-hint" }, "\u8BB0\u5F55\u65E5\u671F ", source.reference_date, " \xB7 \u6211\u662F ", source.identity), source.text && /* @__PURE__ */ React.createElement("pre", null, source.text), source.images?.map((image, index) => /* @__PURE__ */ React.createElement(
        "a",
        {
          key: index,
          href: image.data_url,
          target: "_blank",
          rel: "noreferrer"
        },
        /* @__PURE__ */ React.createElement("img", { src: image.data_url, alt: image.name })
      )), source.transcript && /* @__PURE__ */ React.createElement("details", null, /* @__PURE__ */ React.createElement("summary", null, "\u622A\u56FE\u8BC6\u522B\u6587\u5B57"), /* @__PURE__ */ React.createElement("pre", null, source.transcript))))
    ));
  }
  function AppRoot() {
    const agent = host.useSelectedAgent ? host.useSelectedAgent() : { id: "default" };
    return /* @__PURE__ */ React.createElement(Agenda, { key: agent.id, agentId: agent.id });
  }
  window.QwenPaw.registerRoutes("research-agenda", [
    {
      path: "/apps/research-agenda",
      component: AppRoot,
      label: "\u5DE5\u4F5C\u65E5\u7A0B",
      icon: "\u{1F4C5}"
    }
  ]);
})();
