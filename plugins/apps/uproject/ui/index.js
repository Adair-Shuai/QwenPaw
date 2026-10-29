/** UProject — research delivery workbench, using the host React/antd runtime. */
(function () {
  "use strict";
  var QwenPaw = window.QwenPaw;
  if (!QwenPaw || !QwenPaw.host || !QwenPaw.registerRoutes) return;
  var host = QwenPaw.host,
    React = host.React,
    antd = host.antd;
  var h = React.createElement,
    useState = React.useState,
    useEffect = React.useEffect,
    useRef = React.useRef;
  var Button = antd.Button,
    Input = antd.Input,
    Modal = antd.Modal,
    Select = antd.Select;
  var Tabs = antd.Tabs,
    Popconfirm = antd.Popconfirm,
    Spin = antd.Spin,
    message = antd.message;

  var PROJECT_STATUS = {
    intake: { label: "立项", tone: "neutral" },
    aligning: { label: "对接中", tone: "accent" },
    executing: { label: "执行中", tone: "info" },
    acceptance: { label: "待验收", tone: "warning" },
    closed: { label: "已关闭", tone: "success" },
  };
  var ITEM_STATUS = {
    open: { label: "未对齐", tone: "neutral" },
    proposed: { label: "已提议", tone: "info" },
    blocked: { label: "阻塞", tone: "error" },
    agreed: { label: "已对齐", tone: "success" },
    deferred: { label: "暂缓", tone: "neutral" },
  };
  var ITEM_KIND = {
    scope: "范围",
    milestone: "里程碑",
    deliverable: "交付物",
    data: "资料",
    interface: "接口",
    acceptance: "验收",
    change: "变更",
    risk: "风险",
  };
  var SIDE = { client: "甲方", vendor: "乙方", both: "双方" };
  var PRIORITY = {
    urgent: { label: "紧急", tone: "error", rank: 0 },
    high: { label: "高", tone: "warning", rank: 1 },
    normal: { label: "普通", tone: "neutral", rank: 2 },
    low: { label: "低", tone: "neutral", rank: 3 },
  };
  var BRIEF_KIND = {
    agenda: "对齐议程",
    weekly: "项目周报",
    minutes: "纪要拆解",
  };
  var CSS = `
    .up-workbench{height:100%;overflow:auto;background:var(--app-bg);color:var(--app-text);font-size:var(--app-font-body,14px);container-type:inline-size}
    .up-workbench *{box-sizing:border-box}.up-shell{max-width:1480px;margin:0 auto;padding:28px 32px 40px;display:flex;flex-direction:column;gap:24px;min-width:0}
    .up-row{display:flex;align-items:center;gap:10px;min-width:0}.up-wrap{flex-wrap:wrap}.up-between{justify-content:space-between}.up-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.up-grow{flex:1;min-width:0}
    .up-kicker{font-size:var(--app-font-caption,12px);letter-spacing:1.6px;color:var(--app-text-tertiary);font-weight:600}.up-title{font-size:calc(27px * var(--app-font-scale,1));line-height:1.35;letter-spacing:-.7px;font-weight:650;margin:6px 0 7px}.up-sub{color:var(--app-text-secondary);font-size:var(--app-font-secondary,13px);line-height:1.7}.up-muted{color:var(--app-text-tertiary);font-size:var(--app-font-caption,12px)}
    .up-icon{display:inline-block;flex-shrink:0;vertical-align:-3px}.up-brand-icon{width:44px;height:44px;border:1px solid var(--app-accent-border);background:var(--app-accent-soft);border-radius:14px;color:var(--app-accent-text);display:grid;place-items:center}
    .up-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--app-border);background:var(--app-surface);border-radius:var(--app-radius-card,16px);overflow:hidden}
    .up-stat{padding:18px 20px;min-width:0}.up-stat+.up-stat{border-left:1px solid var(--app-border)}.up-stat-label{display:flex;gap:8px;align-items:center;color:var(--app-text-secondary);font-size:var(--app-font-caption,12px)}.up-stat-value{font-size:calc(28px * var(--app-font-scale,1));font-weight:650;line-height:1.3;margin:9px 0 3px;font-variant-numeric:tabular-nums}.up-stat-note{font-size:var(--app-font-caption,12px);color:var(--app-text-tertiary)}
    .up-section-title{font-size:var(--app-font-subtitle,16px);font-weight:600;margin:0}.up-count{font-size:var(--app-font-caption,12px);font-weight:500;background:var(--app-fill-subtle);color:var(--app-text-secondary);border-radius:6px;padding:2px 7px;margin-left:8px}
    .up-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:16px 0}.up-search{width:280px;max-width:100%}.up-switch{display:inline-flex;gap:3px;padding:3px;background:var(--app-fill-subtle);border-radius:9px}.up-switch button{border:0;background:transparent;color:var(--app-text-secondary);border-radius:6px;padding:5px 10px;cursor:pointer;display:flex;gap:5px;align-items:center;font:inherit;font-size:var(--app-font-caption,12px)}.up-switch button[aria-pressed=true]{background:var(--app-surface);color:var(--app-text);box-shadow:var(--app-shadow-sm)}
    .up-projects{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr));gap:16px}.up-project-card{display:flex;flex-direction:column;gap:16px;text-align:left;width:100%;padding:20px;border:1px solid var(--app-border);border-radius:var(--app-radius-card,16px);background:var(--app-surface);color:var(--app-text);font:inherit;cursor:pointer;transition:border-color var(--app-motion-fast,120ms),box-shadow var(--app-motion-fast,120ms)}.up-project-card:hover{border-color:var(--app-accent-border);box-shadow:var(--app-shadow-sm)}.up-project-card:focus-visible,.up-item:focus-visible,.up-switch button:focus-visible,.up-link:focus-visible{outline:2px solid var(--app-focus-ring);outline-offset:3px}.up-project-name{font-size:var(--app-font-subtitle,16px);font-weight:600;line-height:1.55;overflow-wrap:anywhere}.up-project-code{font-size:var(--app-font-caption,12px);color:var(--app-text-tertiary);margin-top:4px}.up-clamp{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}.up-project-sow{min-height:42px;line-height:1.7;color:var(--app-text-secondary);font-size:var(--app-font-secondary,13px)}
    .up-party-line{display:flex;gap:7px;align-items:baseline;font-size:var(--app-font-caption,12px);color:var(--app-text-secondary);line-height:1.9}.up-party-line b{font-weight:400;flex-shrink:0;color:var(--app-text-tertiary)}.up-party-line span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.up-card-footer{border-top:1px solid var(--app-border-subtle);padding-top:12px;display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:auto}
    .up-chip{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;border-radius:6px;padding:3px 7px;font-size:var(--app-font-caption,12px);line-height:1.4;font-weight:500;color:var(--app-text-secondary);background:var(--app-fill-subtle)}.up-chip:before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor}.up-tone-accent{color:var(--app-accent-text);background:var(--app-accent-soft)}.up-tone-info{color:var(--app-info-text);background:var(--app-info-bg)}.up-tone-warning{color:var(--app-warning-text);background:var(--app-warning-bg)}.up-tone-error{color:var(--app-error-text);background:var(--app-error-bg)}.up-tone-success{color:var(--app-success-text);background:var(--app-success-bg)}.up-error-text{color:var(--app-error-text)}.up-accent-text{color:var(--app-accent-text)}
    .up-progress{height:5px;background:var(--app-fill-subtle);border-radius:6px;overflow:hidden;margin-top:8px}.up-progress>span{display:block;height:100%;background:var(--app-accent);border-radius:6px}.up-progress.complete>span{background:var(--app-success)}
    .up-panel{border:1px solid var(--app-border);border-radius:var(--app-radius-card,16px);background:var(--app-surface);padding:20px;min-width:0}.up-panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:18px}.up-two-col{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,1fr);gap:18px;align-items:start}.up-stack{display:flex;flex-direction:column;gap:16px;min-width:0}.up-detail-title{overflow-wrap:anywhere;margin:5px 0 7px}.up-detail-tabs .ant-tabs-nav{margin:0}.up-detail-tabs .ant-tabs-tab{padding-top:6px;padding-bottom:14px}
    .up-meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.up-label{display:block;font-size:var(--app-font-caption,12px);color:var(--app-text-secondary);margin-bottom:7px}.up-value{line-height:1.65;overflow-wrap:anywhere}.up-sow{white-space:pre-wrap;line-height:1.8;font-size:var(--app-font-secondary,13px);color:var(--app-text-secondary);overflow-wrap:anywhere}.up-callout{border:1px solid var(--app-accent-border);border-radius:12px;background:var(--app-accent-faint);padding:14px 16px;font-size:var(--app-font-secondary,13px);line-height:1.7}.up-warning-callout{border-color:var(--app-warning-border);background:var(--app-warning-bg);color:var(--app-warning-text)}
    .up-board-scroll{overflow-x:auto;padding-bottom:8px}.up-board{display:grid;grid-template-columns:repeat(5,minmax(215px,1fr));gap:12px;align-items:start}.up-column{background:var(--app-surface-subtle);border:1px solid var(--app-border-subtle);border-radius:12px;padding:12px;min-height:240px}.up-column-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;font-size:var(--app-font-secondary,13px)}.up-column-title{display:flex;gap:7px;align-items:center;font-weight:600}.up-status-dot{width:7px;height:7px;background:var(--app-text-tertiary);border-radius:50%}.up-status-dot.info{background:var(--app-info-text)}.up-status-dot.error{background:var(--app-error)}.up-status-dot.success{background:var(--app-success)}
    .up-item{display:flex;flex-direction:column;gap:10px;width:100%;text-align:left;border:1px solid var(--app-border);background:var(--app-surface);color:var(--app-text);border-radius:10px;padding:12px;font:inherit;cursor:pointer;margin-bottom:10px}.up-item:hover{border-color:var(--app-accent-border)}.up-item-title{font-size:var(--app-font-secondary,13px);font-weight:600;line-height:1.6;overflow-wrap:anywhere}.up-item-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:var(--app-font-caption,12px);color:var(--app-text-secondary)}.up-avatar{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--app-accent-soft);color:var(--app-accent-text);font-size:11px;flex-shrink:0}.up-column-empty{text-align:center;color:var(--app-text-tertiary);font-size:var(--app-font-caption,12px);padding:25px 0}
    .up-table-wrap{width:100%;overflow:auto;background:var(--app-surface);border:1px solid var(--app-border);border-radius:12px}.up-table{width:100%;border-collapse:collapse;min-width:760px;text-align:left;font-size:var(--app-font-secondary,13px)}.up-table th{font-size:var(--app-font-caption,12px);font-weight:500;color:var(--app-text-secondary);background:var(--app-surface-subtle);padding:12px 16px;border-bottom:1px solid var(--app-border)}.up-table td{padding:13px 16px;border-bottom:1px solid var(--app-border-subtle);vertical-align:middle}.up-table tbody tr:last-child td{border-bottom:none}.up-table tbody tr:hover{background:var(--app-fill-faint)}.up-link{background:none;border:0;color:var(--app-text);padding:0;text-align:left;font:inherit;font-weight:500;cursor:pointer;line-height:1.6;overflow-wrap:anywhere}.up-link:hover{color:var(--app-accent-text)}
    .up-timeline-row{position:relative;display:flex;gap:14px;padding:0 0 22px;min-width:0}.up-timeline-row:before{content:"";position:absolute;left:11px;top:26px;bottom:2px;width:1px;background:var(--app-border)}.up-timeline-row:last-child{padding-bottom:0}.up-timeline-row:last-child:before{display:none}.up-timeline-dot{display:grid;place-items:center;width:24px;height:24px;border:1px solid var(--app-border-strong);background:var(--app-surface);border-radius:50%;color:var(--app-text-tertiary);flex-shrink:0}.up-timeline-dot.done{background:var(--app-success-bg);color:var(--app-success-text);border-color:var(--app-success-border)}.up-ms-body{flex:1;min-width:0;padding:0 0 5px}.up-ms-title{font-size:var(--app-font-secondary,13px);font-weight:600;line-height:1.7}.up-ms-controls{margin-top:10px;display:flex;gap:6px;flex-wrap:wrap}.up-timeline-date{font-size:var(--app-font-caption,12px);color:var(--app-text-tertiary);margin-top:5px}
    .up-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;min-height:210px;padding:28px 20px;border:1px dashed var(--app-border-strong);border-radius:14px;color:var(--app-text-secondary)}.up-empty-icon{width:46px;height:46px;display:grid;place-items:center;background:var(--app-fill-subtle);color:var(--app-text-tertiary);border-radius:14px}.up-empty strong{color:var(--app-text);font-size:var(--app-font-body,14px);font-weight:500}.up-empty p{margin:0;font-size:var(--app-font-secondary,13px);line-height:1.7}.up-loading{padding:80px 24px;text-align:center;color:var(--app-text-secondary)}
    .up-form{display:flex;flex-direction:column;gap:18px;padding:12px 0}.up-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.up-form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.up-field{display:block;min-width:0}.up-field>.ant-select{width:100%}.up-field-title{font-size:13px;display:block;margin-bottom:7px;color:var(--app-text-secondary)}.up-field-hint{font-size:12px;line-height:1.6;color:var(--app-text-tertiary);margin-top:6px}.up-form-heading{font-size:13px;font-weight:600;padding-bottom:8px;border-bottom:1px solid var(--app-border-subtle);margin-bottom:12px}.up-modal .ant-modal-body{max-height:70vh;overflow:auto;padding-right:4px}.up-modal .up-callout{font-size:12px}.up-modal-foot{display:flex;justify-content:space-between;gap:10px;align-items:center}.up-modal-foot .up-actions{margin-left:auto}
    .up-brief{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.85;font-size:var(--app-font-secondary,13px);color:var(--app-text-secondary);margin:0}.up-brief-history{margin-top:8px}.up-brief-history details{border-top:1px solid var(--app-border-subtle);padding:14px 0}.up-brief-history summary{cursor:pointer;line-height:1.7;font-size:var(--app-font-secondary,13px)}.up-brief-history .up-brief{margin-top:14px;padding:16px;background:var(--app-surface-subtle);border-radius:10px}.up-ai-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px}.up-ai-action{background:var(--app-surface);border:1px solid var(--app-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;align-items:flex-start;gap:10px}.up-note{background:var(--app-surface-subtle);border-radius:10px;padding:14px;margin-top:12px}.up-meeting-title{font-weight:600;font-size:var(--app-font-subtitle,16px)}.up-divider{height:1px;background:var(--app-border-subtle);margin:16px 0}.up-activity-time{font-size:var(--app-font-caption,12px);color:var(--app-text-tertiary);margin-top:4px}.up-filter-summary{font-size:var(--app-font-caption,12px);color:var(--app-text-tertiary);margin-bottom:12px}
    @container(max-width:900px){.up-shell{padding:24px 20px}.up-two-col{grid-template-columns:1fr}.up-stats .up-stat{padding:16px}.up-toolbar{gap:8px}.up-search{width:240px}.up-title{font-size:24px}.up-stat-value{font-size:25px}}
    @container(max-width:580px){.up-shell{padding:18px 14px;gap:18px}.up-page-head{align-items:flex-start;flex-direction:column;gap:14px}.up-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.up-stat:nth-child(3){border-left:0;border-top:1px solid var(--app-border)}.up-stat:nth-child(4){border-top:1px solid var(--app-border)}.up-ai-actions{grid-template-columns:1fr}.up-search{width:100%}.up-toolbar .up-grow{display:none}.up-project-card{padding:16px}.up-panel{padding:16px}.up-meta-grid{gap:14px}.up-card-footer{flex-wrap:wrap}}
    @media(max-width:600px){.up-form-grid.three,.up-form-grid{grid-template-columns:1fr}.up-modal .ant-modal-body{max-height:65vh}}
    @media(prefers-reduced-motion:reduce){.up-project-card{transition:none}}
  `;

  function Icon(props) {
    var paths = {
      grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
      list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
      project: "M3 7h6l2 2h10v11H3zM3 7V4h6l2 3h10v2",
      search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
      clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
      check: "M5 12l4 4L19 6",
      arrow: "M19 12H5m6-6-6 6 6 6",
      plus: "M12 5v14M5 12h14",
      flag: "M5 21V3m0 1h14l-3 4 3 4H5",
      alert: "M12 8v5m0 3h.01M12 3 2 21h20z",
      activity: "M3 12h4l3-8 4 16 3-8h4",
      spark: "m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6z",
      download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
      refresh:
        "M20 7V3m0 4h-4M4 17v4m0-4h4M5 8a8 8 0 0 1 14-2l1 1M4 17l1 1a8 8 0 0 0 14-2",
      calendar: "M4 5h16v16H4zM8 3v4M16 3v4M4 10h16",
      people:
        "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M16 3a4 4 0 0 1 0 8m2 4a4 4 0 0 1 4 4v2",
    };
    return h(
      "svg",
      {
        className: "up-icon",
        width: props.size || 16,
        height: props.size || 16,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.7,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
      },
      h("path", { d: paths[props.name] || paths.project }),
    );
  }
  function options(dict) {
    return Object.keys(dict).map(function (key) {
      return { value: key, label: dict[key].label || dict[key] };
    });
  }
  function Chip(props) {
    return h(
      "span",
      { className: "up-chip up-tone-" + (props.tone || "neutral") },
      props.children,
    );
  }
  function Status(props) {
    var meta = (props.item ? ITEM_STATUS : PROJECT_STATUS)[props.value] || {
      label: props.value,
      tone: "neutral",
    };
    return h(Chip, { tone: meta.tone }, meta.label);
  }
  function Priority(props) {
    var meta = PRIORITY[props.value] || PRIORITY.normal;
    return h(Chip, { tone: meta.tone }, meta.label + "优先级");
  }
  function today() {
    var d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }
  function isOverdue(item) {
    return (
      item.status !== "agreed" &&
      item.status !== "deferred" &&
      !!item.due_date &&
      item.due_date < today()
    );
  }
  function dateText(value) {
    return value ? String(value).slice(0, 10).replace(/-/g, "/") : "未设置";
  }
  function timeText(value) {
    if (!value) return "";
    var d = new Date(value);
    return isNaN(d.getTime())
      ? value
      : d.toLocaleString("zh-CN", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
  }
  function projectStats(project) {
    var s = Object.assign({}, project, project.stats || {});
    var total =
      s.item_count == null
        ? (s.open_count || 0) +
          (s.proposed_count || 0) +
          (s.blocked_count || 0) +
          (s.agreed_count || 0) +
          (s.deferred_count || 0)
        : s.item_count;
    return {
      total: total,
      agreed: s.agreed_count || 0,
      blocked: s.blocked_count || 0,
      overdue: s.overdue_count || 0,
      high: s.high_priority_count || 0,
      percent:
        s.completion_percent == null
          ? total
            ? Math.round(((s.agreed_count || 0) / total) * 100)
            : 0
          : s.completion_percent,
    };
  }
  function Progress(props) {
    var value = Math.max(0, Math.min(100, props.value || 0));
    return h(
      "div",
      {
        className: "up-progress" + (value === 100 ? " complete" : ""),
        role: "progressbar",
        "aria-label": props.label || "事项对齐进度",
        "aria-valuenow": value,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
      },
      h("span", { style: { width: value + "%" } }),
    );
  }
  function Stat(props) {
    return h(
      "div",
      { className: "up-stat" },
      h(
        "div",
        { className: "up-stat-label" },
        h(Icon, { name: props.icon }),
        props.label,
      ),
      h(
        "div",
        { className: "up-stat-value" + (props.alert ? " up-error-text" : "") },
        props.value,
      ),
      h("div", { className: "up-stat-note" }, props.note),
    );
  }
  function EmptyState(props) {
    return h(
      "div",
      { className: "up-empty" },
      h(
        "span",
        { className: "up-empty-icon" },
        h(Icon, { name: props.icon || "project", size: 23 }),
      ),
      h("strong", null, props.title),
      h("p", null, props.description),
      props.action,
    );
  }
  function Field(props) {
    return h(
      "label",
      { className: "up-field" },
      h(
        "span",
        { className: "up-field-title" },
        props.label,
        props.required ? " *" : "",
      ),
      props.children,
      props.hint ? h("div", { className: "up-field-hint" }, props.hint) : null,
    );
  }
  function SwitchView(props) {
    return h(
      "div",
      { className: "up-switch", role: "group", "aria-label": props.label },
      props.options.map(function (opt) {
        return h(
          "button",
          {
            key: opt.value,
            type: "button",
            "aria-label": opt.label,
            "aria-pressed": props.value === opt.value,
            onClick: function () {
              props.onChange(opt.value);
            },
          },
          h(Icon, { name: opt.icon }),
          opt.label,
        );
      }),
    );
  }

  function apiFetch(path, opts) {
    opts = opts || {};
    var headers = { "Content-Type": "application/json" },
      token = host.getApiToken ? host.getApiToken() : "";
    if (token) headers.Authorization = "Bearer " + token;
    return fetch(host.getApiUrl(path), {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    }).then(function (res) {
      if (!res.ok)
        return res.text().then(function (body) {
          throw new Error(body || "请求失败（" + res.status + "）");
        });
      return res.status === 204 ? null : res.json();
    });
  }
  var api = {
    list: function () {
      return apiFetch("/uproject/projects");
    },
    get: function (id) {
      return apiFetch("/uproject/projects/" + encodeURIComponent(id));
    },
    create: function (body) {
      return apiFetch("/uproject/projects", { method: "POST", body: body });
    },
    patch: function (id, body) {
      return apiFetch("/uproject/projects/" + encodeURIComponent(id), {
        method: "PATCH",
        body: body,
      });
    },
    remove: function (id) {
      return apiFetch("/uproject/projects/" + encodeURIComponent(id), {
        method: "DELETE",
      });
    },
    addChild: function (project, type, body) {
      return apiFetch(
        "/uproject/projects/" + encodeURIComponent(project) + "/" + type,
        { method: "POST", body: body },
      );
    },
    patchChild: function (type, id, body) {
      return apiFetch("/uproject/" + type + "/" + encodeURIComponent(id), {
        method: "PATCH",
        body: body,
      });
    },
    deleteChild: function (type, id) {
      return apiFetch("/uproject/" + type + "/" + encodeURIComponent(id), {
        method: "DELETE",
      });
    },
    ai: function (id, kind, body) {
      return apiFetch(
        "/uproject/projects/" + encodeURIComponent(id) + "/ai/" + kind,
        { method: "POST", body: body },
      );
    },
    reset: function () {
      return apiFetch("/uproject/demo/reset", { method: "POST" });
    },
  };
  function errText(error) {
    var text = error && error.message ? error.message : "操作失败，请重试";
    try {
      var parsed = JSON.parse(text);
      if (typeof parsed.detail === "string") return parsed.detail;
      if (Array.isArray(parsed.detail))
        return parsed.detail
          .map(function (d) {
            return (d.loc || []).slice(1).join(" / ") + "：" + d.msg;
          })
          .join("；");
    } catch (_) {}
    return text;
  }
  function download(name, content, type) {
    var url = URL.createObjectURL(new Blob([content], { type: type })),
      link = document.createElement("a");
    link.href = url;
    link.download = name.replace(/[\\/:*?"<>|]/g, "_");
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }
  function exportCsv(project, items, milestones) {
    var ms = {};
    (milestones || []).forEach(function (m) {
      ms[m.id] = m.title;
    });
    var titles = {};
    items.forEach(function (i) {
      titles[i.id] = i.title;
    });
    var rows = [
      [
        "事项标题",
        "详情",
        "状态",
        "优先级",
        "类型",
        "责任方",
        "负责人",
        "截止日期",
        "关联里程碑",
        "前置事项",
      ],
    ].concat(
      items.map(function (i) {
        return [
          i.title,
          i.detail,
          (ITEM_STATUS[i.status] || {}).label || i.status,
          (PRIORITY[i.priority] || PRIORITY.normal).label,
          ITEM_KIND[i.kind],
          SIDE[i.owner_side],
          i.assignee,
          i.due_date,
          ms[i.milestone_id] || "",
          (i.depends_on || [])
            .map(function (id) {
              return titles[id] || id;
            })
            .join("；"),
        ];
      }),
    );
    download(
      project.name + "-对齐事项.csv",
      "\uFEFF" +
        rows
          .map(function (row) {
            return row
              .map(function (value) {
                var text = String(value == null ? "" : value);
                if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
                return '"' + text.replace(/"/g, '""') + '"';
              })
              .join(",");
          })
          .join("\r\n"),
      "text/csv;charset=utf-8",
    );
  }
  function emptyParty() {
    return { org: "", contact: "", role: "", email: "" };
  }
  function emptyProject() {
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
      notes: "",
    };
  }
  function projectForm(project) {
    var result = emptyProject();
    Object.keys(result).forEach(function (key) {
      if (project[key] !== undefined) result[key] = project[key];
    });
    result.client = Object.assign(emptyParty(), project.client);
    result.vendor = Object.assign(emptyParty(), project.vendor);
    return result;
  }
  function emptyItem(status) {
    return {
      title: "",
      detail: "",
      kind: "scope",
      owner_side: "both",
      status: status || "open",
      priority: "normal",
      assignee: "",
      due_date: "",
      milestone_id: null,
      depends_on: [],
    };
  }
  function itemForm(item) {
    var form = emptyItem();
    Object.keys(form).forEach(function (key) {
      if (item[key] !== undefined) form[key] = item[key];
    });
    return form;
  }
  function PartyFields(props) {
    return h(
      "div",
      null,
      h("div", { className: "up-form-heading" }, props.label + "信息"),
      h(
        "div",
        { className: "up-form-grid" },
        [
          ["org", "单位"],
          ["contact", "对接人"],
          ["role", "角色"],
          ["email", "邮箱"],
        ].map(function (pair) {
          return h(
            Field,
            { key: pair[0], label: props.label + pair[1] },
            h(Input, {
              disabled: props.saving,
              "aria-label": props.label + pair[1],
              value: props.value[pair[0]] || "",
              placeholder: "填写" + pair[1],
              onChange: function (event) {
                var next = Object.assign({}, props.value);
                next[pair[0]] = event.target.value;
                props.onChange(next);
              },
            }),
          );
        }),
      ),
    );
  }
  function ProjectFormModal(props) {
    var form = props.form;
    function set(key, value) {
      var next = Object.assign({}, form);
      next[key] = value;
      props.setForm(next);
    }
    return h(
      Modal,
      {
        open: true,
        className: "up-modal",
        title: props.editing ? "编辑项目" : "新建科研项目",
        width: 720,
        okText: "保存项目",
        cancelText: "取消",
        confirmLoading: props.saving,
        closable: !props.saving,
        maskClosable: false,
        cancelButtonProps: { disabled: props.saving },
        onCancel: props.onCancel,
        onOk: props.onOk,
      },
      h(
        "div",
        { className: "up-form" },
        h(
          Field,
          { label: "项目名称", required: true },
          h(Input, {
            disabled: props.saving,
            "aria-label": "项目名称",
            maxLength: 200,
            value: form.name,
            placeholder: "如：储气库数值模拟与方案优化",
            onChange: function (e) {
              set("name", e.target.value);
            },
          }),
        ),
        h(
          "div",
          { className: "up-form-grid three" },
          h(
            Field,
            { label: "项目编号" },
            h(Input, {
              disabled: props.saving,
              "aria-label": "项目编号",
              value: form.code,
              placeholder: "如 UGS-2026-001",
              onChange: function (e) {
                set("code", e.target.value);
              },
            }),
          ),
          h(
            Field,
            { label: "研究领域" },
            h(Input, {
              disabled: props.saving,
              "aria-label": "研究领域",
              value: form.domain,
              placeholder: "如：储气库工程",
              onChange: function (e) {
                set("domain", e.target.value);
              },
            }),
          ),
          h(
            Field,
            { label: "项目阶段" },
            h(Select, {
              disabled: props.saving,
              "aria-label": "项目阶段",
              value: form.status,
              options: options(PROJECT_STATUS),
              onChange: function (v) {
                set("status", v);
              },
            }),
          ),
        ),
        h(PartyFields, {
          saving: props.saving,
          label: "甲方",
          value: form.client,
          onChange: function (v) {
            set("client", v);
          },
        }),
        h(PartyFields, {
          saving: props.saving,
          label: "乙方",
          value: form.vendor,
          onChange: function (v) {
            set("vendor", v);
          },
        }),
        h(
          "div",
          { className: "up-form-grid three" },
          [
            ["start_date", "项目开始日期"],
            ["end_date", "项目结束日期"],
            ["next_align_at", "下次对齐日期"],
          ].map(function (pair) {
            return h(
              Field,
              { key: pair[0], label: pair[1] },
              h(Input, {
                disabled: props.saving,
                type: "date",
                "aria-label": pair[1],
                value: (form[pair[0]] || "").slice(0, 10),
                onChange: function (e) {
                  set(pair[0], e.target.value);
                },
              }),
            );
          }),
        ),
        h(
          Field,
          { label: "工作范围与交付目标" },
          h(Input.TextArea, {
            disabled: props.saving,
            "aria-label": "工作范围与交付目标",
            rows: 3,
            value: form.sow,
            placeholder: "描述研究范围、预期成果与验收边界",
            onChange: function (e) {
              set("sow", e.target.value);
            },
          }),
        ),
        h(
          Field,
          { label: "项目备注" },
          h(Input.TextArea, {
            disabled: props.saving,
            "aria-label": "项目备注",
            rows: 2,
            value: form.notes,
            onChange: function (e) {
              set("notes", e.target.value);
            },
          }),
        ),
      ),
    );
  }
  function ProjectCard(props) {
    var p = props.project,
      stats = projectStats(p);
    return h(
      "button",
      {
        type: "button",
        className: "up-project-card",
        onClick: props.onOpen,
        "aria-label": "打开项目：" + p.name,
      },
      h(
        "div",
        { className: "up-row up-between", style: { alignItems: "flex-start" } },
        h(
          "div",
          { className: "up-grow" },
          h("div", { className: "up-project-name" }, p.name),
          h(
            "div",
            { className: "up-project-code" },
            [p.code || "未设编号", p.domain].filter(Boolean).join(" · "),
          ),
        ),
        h(Status, { value: p.status }),
      ),
      h(
        "div",
        { className: "up-project-sow up-clamp" },
        p.sow || "尚未填写工作范围，打开项目补充研究目标与交付计划。",
      ),
      h(
        "div",
        null,
        h(
          "div",
          { className: "up-party-line" },
          h("b", null, "甲方"),
          h(
            "span",
            null,
            (p.client || {}).org || "待填写",
            (p.client || {}).contact ? " · " + p.client.contact : "",
          ),
        ),
        h(
          "div",
          { className: "up-party-line" },
          h("b", null, "乙方"),
          h(
            "span",
            null,
            (p.vendor || {}).org || "待填写",
            (p.vendor || {}).contact ? " · " + p.vendor.contact : "",
          ),
        ),
      ),
      h(
        "div",
        null,
        h(
          "div",
          { className: "up-row up-between up-muted" },
          h("span", null, "事项对齐进度"),
          h(
            "span",
            null,
            stats.agreed + " / " + stats.total + " · " + stats.percent + "%",
          ),
        ),
        h(Progress, { value: stats.percent }),
      ),
      h(
        "div",
        { className: "up-card-footer" },
        h(
          "span",
          { className: "up-muted up-row", style: { gap: 5 } },
          h(Icon, { name: "calendar", size: 14 }),
          p.next_align_at
            ? "下次对齐 " + dateText(p.next_align_at)
            : "对齐日期待定",
        ),
        stats.overdue
          ? h(Chip, { tone: "error" }, stats.overdue + " 项逾期")
          : stats.blocked
          ? h(Chip, { tone: "warning" }, stats.blocked + " 项阻塞")
          : h(
              "span",
              { className: "up-muted" },
              stats.total ? "持续推进" : "待拆解事项",
            ),
      ),
    );
  }
  function ProjectTable(props) {
    return h(
      "div",
      { className: "up-table-wrap" },
      h(
        "table",
        { className: "up-table", "aria-label": "项目列表" },
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            [
              "项目",
              "阶段",
              "甲方 / 乙方",
              "事项进度",
              "下次对齐",
              "需关注",
            ].map(function (s) {
              return h("th", { key: s }, s);
            }),
          ),
        ),
        h(
          "tbody",
          null,
          props.projects.map(function (p) {
            var stats = projectStats(p);
            return h(
              "tr",
              { key: p.id },
              h(
                "td",
                null,
                h(
                  "button",
                  {
                    className: "up-link",
                    "aria-label": "打开项目：" + p.name,
                    onClick: function () {
                      props.onOpen(p.id);
                    },
                  },
                  p.name,
                ),
                h("div", { className: "up-muted" }, p.code || "未设编号"),
              ),
              h("td", null, h(Status, { value: p.status })),
              h(
                "td",
                null,
                h("div", null, (p.client || {}).org || "未填写甲方"),
                h(
                  "div",
                  { className: "up-muted" },
                  (p.vendor || {}).org || "未填写乙方",
                ),
              ),
              h(
                "td",
                { style: { minWidth: 130 } },
                stats.percent + "% · " + stats.agreed + "/" + stats.total,
                h(Progress, { value: stats.percent }),
              ),
              h("td", null, dateText(p.next_align_at)),
              h(
                "td",
                null,
                stats.overdue
                  ? h(Chip, { tone: "error" }, stats.overdue + " 项逾期")
                  : stats.blocked
                  ? h(Chip, { tone: "warning" }, stats.blocked + " 项阻塞")
                  : h("span", { className: "up-muted" }, "—"),
              ),
            );
          }),
        ),
      ),
    );
  }

  function ItemModal(props) {
    var form = props.form;
    function set(key, value) {
      var next = Object.assign({}, form);
      next[key] = value;
      props.setForm(next);
    }
    var unmet = (form.depends_on || [])
      .map(function (id) {
        return props.items.find(function (i) {
          return i.id === id;
        });
      })
      .filter(function (i) {
        return i && i.status !== "agreed";
      });
    var footer = h(
      "div",
      { className: "up-modal-foot" },
      props.editing
        ? h(
            Popconfirm,
            {
              title: "删除这条事项？",
              description: "前置依赖中的引用将同步移除，此操作无法撤销。",
              okText: "确认删除",
              cancelText: "取消",
              onConfirm: props.onDelete,
              disabled: props.saving,
            },
            h(Button, { danger: true, disabled: props.saving }, "删除事项"),
          )
        : null,
      h(
        "div",
        { className: "up-actions" },
        h(Button, { onClick: props.onCancel, disabled: props.saving }, "取消"),
        h(
          Button,
          { type: "primary", onClick: props.onOk, loading: props.saving },
          "保存事项",
        ),
      ),
    );
    return h(
      Modal,
      {
        open: true,
        className: "up-modal",
        title: props.editing ? "编辑对齐事项" : "新建对齐事项",
        width: 680,
        footer: footer,
        maskClosable: false,
        closable: !props.saving,
        onCancel: props.onCancel,
      },
      h(
        "div",
        { className: "up-form" },
        h(
          Field,
          { label: "事项标题", required: true },
          h(Input, {
            disabled: props.saving,
            "aria-label": "事项标题",
            maxLength: 200,
            value: form.title,
            placeholder: "清晰描述需要推进或共同确认的事项",
            onChange: function (e) {
              set("title", e.target.value);
            },
          }),
        ),
        h(
          Field,
          { label: "事项详情" },
          h(Input.TextArea, {
            disabled: props.saving,
            "aria-label": "事项详情",
            rows: 3,
            value: form.detail,
            placeholder: "补充背景、交付要求与验收标准",
            onChange: function (e) {
              set("detail", e.target.value);
            },
          }),
        ),
        h(
          "div",
          { className: "up-form-grid three" },
          h(
            Field,
            { label: "事项状态" },
            h(Select, {
              disabled: props.saving,
              "aria-label": "事项状态",
              value: form.status,
              options: options(ITEM_STATUS),
              onChange: function (v) {
                set("status", v);
              },
            }),
          ),
          h(
            Field,
            { label: "事项优先级" },
            h(Select, {
              disabled: props.saving,
              "aria-label": "事项优先级",
              value: form.priority,
              options: options(PRIORITY),
              onChange: function (v) {
                set("priority", v);
              },
            }),
          ),
          h(
            Field,
            { label: "事项类型" },
            h(Select, {
              disabled: props.saving,
              "aria-label": "事项类型",
              value: form.kind,
              options: options(ITEM_KIND),
              onChange: function (v) {
                set("kind", v);
              },
            }),
          ),
        ),
        h(
          "div",
          { className: "up-form-grid three" },
          h(
            Field,
            { label: "责任方" },
            h(Select, {
              disabled: props.saving,
              "aria-label": "责任方",
              value: form.owner_side,
              options: options(SIDE),
              onChange: function (v) {
                set("owner_side", v);
              },
            }),
          ),
          h(
            Field,
            { label: "事项负责人" },
            h(Input, {
              disabled: props.saving,
              "aria-label": "事项负责人",
              value: form.assignee,
              placeholder: "填写姓名",
              onChange: function (e) {
                set("assignee", e.target.value);
              },
            }),
          ),
          h(
            Field,
            { label: "事项截止日期" },
            h(Input, {
              disabled: props.saving,
              "aria-label": "事项截止日期",
              type: "date",
              value: form.due_date,
              onChange: function (e) {
                set("due_date", e.target.value);
              },
            }),
          ),
        ),
        h(
          Field,
          { label: "关联里程碑" },
          h(Select, {
            disabled: props.saving,
            "aria-label": "关联里程碑",
            allowClear: true,
            placeholder: "选择交付阶段（可选）",
            value: form.milestone_id || undefined,
            options: props.milestones.map(function (m) {
              return { value: m.id, label: m.title };
            }),
            onChange: function (v) {
              set("milestone_id", v || null);
            },
          }),
        ),
        h(
          Field,
          {
            label: "前置事项",
            hint: "前置事项全部已对齐后，才能将当前事项标记为已对齐。",
          },
          h(Select, {
            disabled: props.saving,
            "aria-label": "前置事项",
            mode: "multiple",
            allowClear: true,
            optionFilterProp: "label",
            placeholder: "选择需要先完成的事项",
            value: form.depends_on || [],
            options: props.items
              .filter(function (i) {
                return i.id !== props.editing;
              })
              .map(function (i) {
                return {
                  value: i.id,
                  label:
                    i.title +
                    "（" +
                    (ITEM_STATUS[i.status] || ITEM_STATUS.open).label +
                    "）",
                };
              }),
            onChange: function (v) {
              set("depends_on", v);
            },
          }),
        ),
        unmet.length
          ? h(
              "div",
              { className: "up-callout up-warning-callout", role: "note" },
              "尚有 " +
                unmet.length +
                " 条前置事项未对齐：" +
                unmet
                  .map(function (i) {
                    return i.title;
                  })
                  .join("、"),
            )
          : null,
      ),
    );
  }
  function ItemCard(props) {
    var item = props.item,
      dependencies = item.depends_on || [];
    return h(
      "button",
      {
        type: "button",
        className: "up-item",
        "aria-label": "编辑事项：" + item.title,
        onClick: function () {
          props.onEdit(item);
        },
      },
      h(
        "div",
        { className: "up-row up-between" },
        h("span", { className: "up-muted" }, ITEM_KIND[item.kind] || "事项"),
        h(Priority, { value: item.priority }),
      ),
      h("div", { className: "up-item-title" }, item.title),
      item.detail
        ? h(
            "div",
            { className: "up-muted up-clamp", style: { lineHeight: 1.7 } },
            item.detail,
          )
        : null,
      h(
        "div",
        { className: "up-item-meta" },
        h(
          "span",
          { className: "up-avatar", "aria-hidden": "true" },
          item.assignee
            ? item.assignee.slice(-1)
            : (SIDE[item.owner_side] || "双").slice(0, 1),
        ),
        h("span", null, item.assignee || SIDE[item.owner_side] || "未分配"),
        item.assignee
          ? h(
              "span",
              { className: "up-muted" },
              "· " + (SIDE[item.owner_side] || "双方"),
            )
          : null,
      ),
      item.due_date || dependencies.length
        ? h(
            "div",
            { className: "up-row up-between up-muted" },
            item.due_date
              ? h(
                  "span",
                  { className: isOverdue(item) ? "up-error-text" : "" },
                  dateText(item.due_date) +
                    (isOverdue(item) ? " · 已逾期" : " 截止"),
                )
              : h("span", null),
            dependencies.length
              ? h("span", null, dependencies.length + " 个前置")
              : null,
          )
        : null,
    );
  }
  function ItemBoard(props) {
    return h(
      "div",
      { className: "up-board-scroll" },
      h(
        "div",
        { className: "up-board", "aria-label": "事项看板" },
        Object.keys(ITEM_STATUS).map(function (status) {
          var meta = ITEM_STATUS[status],
            items = props.items.filter(function (i) {
              return i.status === status;
            });
          return h(
            "section",
            {
              className: "up-column",
              key: status,
              "aria-label": meta.label + "事项",
            },
            h(
              "div",
              { className: "up-column-head" },
              h(
                "span",
                { className: "up-column-title" },
                h("span", { className: "up-status-dot " + meta.tone }),
                meta.label,
                h("span", { className: "up-muted" }, items.length),
              ),
              h(Button, {
                type: "text",
                size: "small",
                "aria-label": "新增" + meta.label + "事项",
                icon: h(Icon, { name: "plus", size: 14 }),
                onClick: function () {
                  props.onAdd(status);
                },
              }),
            ),
            items.length
              ? items.map(function (i) {
                  return h(ItemCard, {
                    key: i.id,
                    item: i,
                    onEdit: props.onEdit,
                  });
                })
              : h("div", { className: "up-column-empty" }, "暂无事项"),
          );
        }),
      ),
    );
  }
  function ItemTable(props) {
    return h(
      "div",
      { className: "up-table-wrap" },
      h(
        "table",
        { className: "up-table", "aria-label": "事项列表" },
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            [
              "事项",
              "状态",
              "优先级",
              "负责人 / 责任方",
              "截止日期",
              "操作",
            ].map(function (label) {
              return h("th", { key: label }, label);
            }),
          ),
        ),
        h(
          "tbody",
          null,
          props.items.map(function (i) {
            return h(
              "tr",
              { key: i.id },
              h(
                "td",
                { style: { maxWidth: 350 } },
                h(
                  "button",
                  {
                    className: "up-link",
                    "aria-label": "编辑事项：" + i.title,
                    onClick: function () {
                      props.onEdit(i);
                    },
                  },
                  i.title,
                ),
                h(
                  "div",
                  { className: "up-muted" },
                  ITEM_KIND[i.kind],
                  (i.depends_on || []).length
                    ? " · " + i.depends_on.length + " 个前置事项"
                    : "",
                ),
              ),
              h("td", null, h(Status, { item: true, value: i.status })),
              h("td", null, h(Priority, { value: i.priority })),
              h(
                "td",
                null,
                i.assignee || "未分配",
                h("div", { className: "up-muted" }, SIDE[i.owner_side]),
              ),
              h(
                "td",
                { className: isOverdue(i) ? "up-error-text" : "" },
                dateText(i.due_date),
                isOverdue(i)
                  ? h("div", { className: "up-muted up-error-text" }, "已逾期")
                  : null,
              ),
              h(
                "td",
                null,
                h(
                  Button,
                  {
                    size: "small",
                    disabled: props.busy,
                    onClick: function () {
                      props.onStatus(
                        i,
                        i.status === "agreed" ? "open" : "agreed",
                      );
                    },
                  },
                  i.status === "agreed" ? "重新打开" : "标记已对齐",
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  function ProjectDetail(props) {
    var bundle = props.bundle,
      project = bundle.project,
      items = bundle.items || [],
      milestones = bundle.milestones || [],
      meetings = bundle.meetings || [],
      briefs = bundle.briefs || [],
      activity = bundle.activity || [];
    var tabState = useState("overview"),
      tab = tabState[0],
      setTab = tabState[1];
    var viewState = useState("board"),
      view = viewState[0],
      setView = viewState[1];
    var queryState = useState(""),
      query = queryState[0],
      setQuery = queryState[1];
    var filterState = useState({
        status: "",
        priority: "",
        assignee: "",
        due: "",
      }),
      filters = filterState[0],
      setFilters = filterState[1];
    var itemState = useState(null),
      itemEditor = itemState[0],
      setItemEditor = itemState[1];
    var projectState = useState(null),
      projectEditor = projectState[0],
      setProjectEditor = projectState[1];
    var msState = useState(null),
      msEditor = msState[0],
      setMsEditor = msState[1];
    var meetingState = useState(null),
      meetingEditor = meetingState[0],
      setMeetingEditor = meetingState[1];
    var busyState = useState(""),
      busy = busyState[0],
      setBusy = busyState[1],
      lock = useRef(false),
      mounted = useRef(true);
    var aiState = useState(null),
      ai = aiState[0],
      setAi = aiState[1];
    var minutesState = useState(""),
      minutes = minutesState[0],
      setMinutes = minutesState[1];
    useEffect(function () {
      mounted.current = true;
      return function () {
        mounted.current = false;
      };
    }, []);
    function mutate(key, action, done) {
      if (lock.current) return Promise.resolve();
      lock.current = true;
      setBusy(key);
      return Promise.resolve()
        .then(action)
        .then(function (result) {
          if (!mounted.current) return;
          if (done) done(result);
          return props.onReload();
        })
        .catch(function (e) {
          if (mounted.current) message.error(errText(e));
        })
        .finally(function () {
          lock.current = false;
          if (mounted.current) setBusy("");
        });
    }
    function setFilter(key, value) {
      var next = Object.assign({}, filters);
      next[key] = value || "";
      setFilters(next);
    }
    function openItem(item) {
      setItemEditor({ id: item.id || null, form: itemForm(item) });
    }
    function addItem(status) {
      setItemEditor({ id: null, form: emptyItem(status) });
    }
    function checkDependencies(item, status) {
      var pending = (item.depends_on || []).filter(function (id) {
        var target = items.find(function (i) {
          return i.id === id;
        });
        return !target || target.status !== "agreed";
      });
      if (status === "agreed" && pending.length) {
        message.warning("请先完成前置事项，再标记为已对齐");
        return false;
      }
      return true;
    }
    function saveItem() {
      if (!itemEditor.form.title.trim())
        return message.warning("请填写事项标题");
      if (!checkDependencies(itemEditor.form, itemEditor.form.status)) return;
      return mutate(
        "item",
        function () {
          return itemEditor.id
            ? api.patchChild("items", itemEditor.id, itemEditor.form)
            : api.addChild(project.id, "items", itemEditor.form);
        },
        function () {
          setItemEditor(null);
          message.success("事项已保存");
        },
      );
    }
    function itemStatus(item, status) {
      if (!checkDependencies(item, status)) return;
      return mutate(
        "status",
        function () {
          return api.patchChild("items", item.id, { status: status });
        },
        function () {
          message.success(
            status === "agreed" ? "事项已对齐" : "事项已重新打开",
          );
        },
      );
    }
    function runAi(kind) {
      if (kind === "minutes" && !minutes.trim())
        return message.warning("请先粘贴会议纪要");
      return mutate(
        "ai-" + kind,
        function () {
          return api.ai(
            project.id,
            kind,
            kind === "minutes" ? { notes: minutes, apply: true } : undefined,
          );
        },
        function (data) {
          setAi(Object.assign({ kind: kind }, data));
          if (kind === "minutes")
            message.success(
              "已创建 " +
                (data.items || []).length +
                " 条对齐事项，请核对负责人和截止日期",
            );
        },
      );
    }
    function projectSave() {
      if (!projectEditor.name.trim()) return message.warning("请填写项目名称");
      if (
        projectEditor.start_date &&
        projectEditor.end_date &&
        projectEditor.end_date < projectEditor.start_date
      )
        return message.warning("项目结束日期不能早于开始日期");
      return mutate(
        "project",
        function () {
          return api.patch(project.id, projectEditor);
        },
        function () {
          setProjectEditor(null);
          message.success("项目已更新");
        },
      );
    }
    function openMilestone(ms) {
      setMsEditor({
        id: ms ? ms.id : null,
        form: ms
          ? {
              title: ms.title,
              due_date: ms.due_date || "",
              owner_side: ms.owner_side,
              status: ms.status,
            }
          : {
              title: "",
              due_date: "",
              owner_side: "vendor",
              status: "pending",
            },
      });
    }
    function openMeeting(meeting) {
      setMeetingEditor({
        id: meeting ? meeting.id : null,
        form: {
          title: meeting ? meeting.title : "",
          held_at: meeting ? (meeting.held_at || "").slice(0, 10) : today(),
          attendees_client: meeting ? meeting.attendees_client || "" : "",
          attendees_vendor: meeting ? meeting.attendees_vendor || "" : "",
          agenda: meeting ? meeting.agenda || "" : "",
          notes: meeting ? meeting.notes || "" : "",
          decisions: meeting ? meeting.decisions || "" : "",
        },
      });
    }
    var sortedMilestones = milestones.slice().sort(function (a, b) {
      return (a.due_date || "9999").localeCompare(b.due_date || "9999");
    });
    var nextMilestone = sortedMilestones.find(function (m) {
      return m.status !== "done";
    });
    var overdue = items.filter(isOverdue),
      blocked = items.filter(function (i) {
        return i.status === "blocked";
      }),
      agreed = items.filter(function (i) {
        return i.status === "agreed";
      }).length;
    var percent = items.length ? Math.round((agreed / items.length) * 100) : 0;
    var urgent = items
      .filter(function (i) {
        return (
          i.status !== "agreed" &&
          i.status !== "deferred" &&
          (isOverdue(i) ||
            i.status === "blocked" ||
            i.priority === "urgent" ||
            i.priority === "high")
        );
      })
      .sort(function (a, b) {
        return (
          Number(isOverdue(b)) - Number(isOverdue(a)) ||
          (PRIORITY[a.priority] || PRIORITY.normal).rank -
            (PRIORITY[b.priority] || PRIORITY.normal).rank
        );
      });
    var shownItems = items
      .filter(function (i) {
        var text = [i.title, i.detail, i.assignee, ITEM_KIND[i.kind]]
          .join(" ")
          .toLowerCase();
        return (
          (!query || text.indexOf(query.toLowerCase().trim()) >= 0) &&
          (!filters.status || i.status === filters.status) &&
          (!filters.priority ||
            (i.priority || "normal") === filters.priority) &&
          (!filters.assignee ||
            (filters.assignee === "__unassigned__"
              ? !i.assignee
              : i.assignee === filters.assignee)) &&
          (!filters.due ||
            (filters.due === "overdue"
              ? isOverdue(i)
              : filters.due === "today"
              ? i.due_date === today() &&
                i.status !== "agreed" &&
                i.status !== "deferred"
              : !i.due_date))
        );
      })
      .sort(function (a, b) {
        return (
          (PRIORITY[a.priority] || PRIORITY.normal).rank -
            (PRIORITY[b.priority] || PRIORITY.normal).rank ||
          (a.due_date || "9999").localeCompare(b.due_date || "9999")
        );
      });
    var assignees = Array.from(
      new Set(
        items
          .map(function (i) {
            return i.assignee;
          })
          .filter(Boolean),
      ),
    ).sort();

    function milestoneRows(list, compact) {
      return list.map(function (ms) {
        var linked = items.filter(function (i) {
            return i.milestone_id === ms.id;
          }),
          done = linked.filter(function (i) {
            return i.status === "agreed";
          }).length;
        var late = ms.status !== "done" && ms.due_date && ms.due_date < today();
        return h(
          "div",
          { className: "up-timeline-row", key: ms.id },
          h(
            "span",
            {
              className:
                "up-timeline-dot" + (ms.status === "done" ? " done" : ""),
            },
            h(Icon, {
              name: ms.status === "done" ? "check" : "flag",
              size: 13,
            }),
          ),
          h(
            "div",
            { className: "up-ms-body" },
            h(
              "div",
              { className: "up-row up-between up-wrap" },
              h("div", { className: "up-ms-title" }, ms.title),
              h(
                Chip,
                {
                  tone:
                    ms.status === "done"
                      ? "success"
                      : ms.status === "risk" || late
                      ? "error"
                      : "neutral",
                },
                ms.status === "done"
                  ? "已完成"
                  : ms.status === "risk"
                  ? "有风险"
                  : late
                  ? "已逾期"
                  : "待完成",
              ),
            ),
            h(
              "div",
              { className: "up-timeline-date" },
              dateText(ms.due_date) +
                " · " +
                (SIDE[ms.owner_side] || "双方") +
                (linked.length
                  ? " · " + done + "/" + linked.length + " 项已对齐"
                  : ""),
            ),
            linked.length
              ? h(Progress, {
                  value: Math.round((done / linked.length) * 100),
                  label: ms.title + "关联事项进度",
                })
              : null,
            !compact
              ? h(
                  "div",
                  { className: "up-ms-controls" },
                  h(
                    Button,
                    {
                      size: "small",
                      disabled: !!busy,
                      onClick: function () {
                        mutate("milestone-status", function () {
                          return api.patchChild("milestones", ms.id, {
                            status: ms.status === "done" ? "pending" : "done",
                          });
                        });
                      },
                    },
                    ms.status === "done" ? "重新打开里程碑" : "完成里程碑",
                  ),
                  h(
                    Button,
                    {
                      size: "small",
                      type: "text",
                      onClick: function () {
                        openMilestone(ms);
                      },
                    },
                    "编辑",
                  ),
                  h(
                    Popconfirm,
                    {
                      title: "删除这个里程碑？",
                      description: "相关事项将保留并解除关联。",
                      okText: "确认删除",
                      cancelText: "取消",
                      disabled: !!busy,
                      onConfirm: function () {
                        return mutate("milestone-delete", function () {
                          return api.deleteChild("milestones", ms.id);
                        });
                      },
                    },
                    h(
                      Button,
                      {
                        size: "small",
                        type: "text",
                        danger: true,
                        disabled: !!busy,
                      },
                      "删除",
                    ),
                  ),
                )
              : null,
          ),
        );
      });
    }
    function activityRows(rows) {
      return rows.map(function (entry) {
        return h(
          "div",
          { className: "up-timeline-row", key: entry.id },
          h(
            "span",
            { className: "up-timeline-dot" },
            h(Icon, { name: "activity", size: 13 }),
          ),
          h(
            "div",
            { className: "up-grow" },
            h(
              "div",
              {
                className: "up-value",
                style: { fontSize: "var(--app-font-secondary,13px)" },
              },
              entry.summary || "项目内容已更新",
            ),
            h(
              "div",
              { className: "up-activity-time" },
              timeText(entry.created_at),
            ),
          ),
        );
      });
    }
    function overview() {
      return h(
        "div",
        { className: "up-two-col" },
        h(
          "div",
          { className: "up-stack" },
          h(
            "section",
            { className: "up-panel" },
            h(
              "div",
              { className: "up-panel-head" },
              h(
                "h2",
                { className: "up-section-title" },
                "需要关注",
                h("span", { className: "up-count" }, urgent.length),
              ),
              h(
                Button,
                {
                  type: "text",
                  size: "small",
                  onClick: function () {
                    setTab("items");
                    setFilter("due", "overdue");
                  },
                },
                "查看逾期事项",
              ),
            ),
            urgent.length
              ? h(
                  "div",
                  { className: "up-stack", style: { gap: 0 } },
                  urgent.slice(0, 5).map(function (i) {
                    return h(
                      "div",
                      {
                        key: i.id,
                        className: "up-row up-between",
                        style: {
                          padding: "11px 0",
                          borderBottom: "1px solid var(--app-border-subtle)",
                        },
                      },
                      h(
                        "div",
                        { className: "up-grow" },
                        h(
                          "button",
                          {
                            className: "up-link",
                            onClick: function () {
                              openItem(i);
                            },
                          },
                          i.title,
                        ),
                        h(
                          "div",
                          { className: "up-muted", style: { marginTop: 4 } },
                          (i.assignee || SIDE[i.owner_side] || "未分配") +
                            " · " +
                            dateText(i.due_date),
                        ),
                      ),
                      h(
                        Chip,
                        {
                          tone:
                            isOverdue(i) || i.status === "blocked"
                              ? "error"
                              : "warning",
                        },
                        isOverdue(i)
                          ? "已逾期"
                          : i.status === "blocked"
                          ? "阻塞"
                          : (PRIORITY[i.priority] || PRIORITY.normal).label,
                      ),
                    );
                  }),
                )
              : h(
                  "div",
                  { className: "up-callout" },
                  h("strong", null, "当前没有需优先处理的事项"),
                  h(
                    "div",
                    { className: "up-sub" },
                    "逾期、阻塞及高优先级事项会汇集在这里。",
                  ),
                ),
          ),
          h(
            "section",
            { className: "up-panel" },
            h(
              "div",
              { className: "up-panel-head" },
              h("h2", { className: "up-section-title" }, "工作范围与交付目标"),
              h(
                Button,
                {
                  type: "text",
                  size: "small",
                  onClick: function () {
                    setProjectEditor(projectForm(project));
                  },
                },
                "编辑",
              ),
            ),
            h(
              "div",
              { className: "up-sow" },
              project.sow ||
                "暂未填写工作范围，建议明确研究目标、交付物与验收标准。",
            ),
            h("div", { className: "up-divider" }),
            h(
              "div",
              { className: "up-meta-grid" },
              h(
                "div",
                null,
                h("span", { className: "up-label" }, "项目周期"),
                h(
                  "div",
                  { className: "up-value" },
                  dateText(project.start_date) +
                    " — " +
                    dateText(project.end_date),
                ),
              ),
              h(
                "div",
                null,
                h("span", { className: "up-label" }, "下次对齐"),
                h(
                  "div",
                  { className: "up-value" },
                  dateText(project.next_align_at),
                ),
              ),
            ),
            project.notes
              ? h(
                  "div",
                  { className: "up-note" },
                  h("span", { className: "up-label" }, "项目备注"),
                  h("div", { className: "up-sow" }, project.notes),
                )
              : null,
          ),
          h(
            "section",
            { className: "up-panel" },
            h(
              "div",
              { className: "up-panel-head" },
              h("h2", { className: "up-section-title" }, "近期活动"),
              h(
                Button,
                {
                  type: "text",
                  size: "small",
                  onClick: function () {
                    setTab("activity");
                  },
                },
                "查看全部",
              ),
            ),
            activity.length
              ? activityRows(activity.slice(0, 4))
              : h(
                  "div",
                  { className: "up-sub" },
                  "后续的事项、会议与里程碑变更会记录在这里。",
                ),
          ),
        ),
        h(
          "aside",
          { className: "up-stack" },
          h(
            "section",
            { className: "up-panel" },
            h(
              "div",
              { className: "up-panel-head" },
              h("h2", { className: "up-section-title" }, "协作双方"),
              h(Icon, { name: "people" }),
            ),
            ["client", "vendor"].map(function (side, index) {
              var party = project[side] || {};
              return h(
                "div",
                {
                  key: side,
                  style: index
                    ? {
                        marginTop: 18,
                        paddingTop: 18,
                        borderTop: "1px solid var(--app-border-subtle)",
                      }
                    : {},
                },
                h("span", { className: "up-label" }, SIDE[side]),
                h(
                  "div",
                  { className: "up-value", style: { fontWeight: 600 } },
                  party.org || "未填写单位",
                ),
                h(
                  "div",
                  { className: "up-sub" },
                  [party.contact, party.role].filter(Boolean).join(" · ") ||
                    "未填写对接人",
                ),
                party.email
                  ? h(
                      "div",
                      {
                        className: "up-muted",
                        style: { marginTop: 5, overflowWrap: "anywhere" },
                      },
                      party.email,
                    )
                  : null,
              );
            }),
          ),
          h(
            "section",
            { className: "up-panel" },
            h(
              "div",
              { className: "up-panel-head" },
              h("h2", { className: "up-section-title" }, "交付节点"),
              h(
                Button,
                {
                  type: "text",
                  size: "small",
                  onClick: function () {
                    setTab("milestones");
                  },
                },
                "全部节点",
              ),
            ),
            sortedMilestones.length
              ? milestoneRows(sortedMilestones.slice(0, 4), true)
              : h(
                  "div",
                  { className: "up-sub" },
                  "添加里程碑，将研究阶段与交付时间对应起来。",
                ),
          ),
          h(
            "div",
            { className: "up-callout" },
            h(
              "div",
              {
                className: "up-row",
                style: { marginBottom: 6, fontWeight: 600 },
              },
              h(Icon, { name: "spark" }),
              "让每次对齐都有下一步",
            ),
            h(
              "div",
              { className: "up-sub" },
              "基于当前项目生成会议议程、进展周报，或从纪要拆出待办。",
            ),
            h(
              Button,
              {
                type: "text",
                style: {
                  padding: 0,
                  marginTop: 5,
                  color: "var(--app-accent-text)",
                },
                onClick: function () {
                  setTab("ai");
                },
              },
              "打开 AI 简报 →",
            ),
          ),
        ),
      );
    }
    function itemsView() {
      return h(
        "section",
        null,
        h(
          "div",
          { className: "up-row up-between up-wrap" },
          h(
            "h2",
            { className: "up-section-title" },
            "对齐事项",
            h("span", { className: "up-count" }, items.length),
          ),
          h(
            "div",
            { className: "up-actions" },
            h(
              Button,
              {
                icon: h(Icon, { name: "download" }),
                disabled: !items.length,
                onClick: function () {
                  exportCsv(project, items, milestones);
                },
              },
              "导出事项 CSV",
            ),
            h(
              Button,
              {
                type: "primary",
                icon: h(Icon, { name: "plus" }),
                onClick: function () {
                  addItem();
                },
              },
              "新建事项",
            ),
          ),
        ),
        h(
          "div",
          { className: "up-toolbar" },
          h(Input, {
            className: "up-search",
            "aria-label": "搜索事项",
            prefix: h(Icon, { name: "search" }),
            placeholder: "搜索事项、详情或负责人",
            allowClear: true,
            value: query,
            onChange: function (e) {
              setQuery(e.target.value);
            },
          }),
          h(Select, {
            "aria-label": "事项状态筛选",
            style: { width: 118 },
            value: filters.status,
            options: [{ value: "", label: "全部状态" }].concat(
              options(ITEM_STATUS),
            ),
            onChange: function (v) {
              setFilter("status", v);
            },
          }),
          h(Select, {
            "aria-label": "事项优先级筛选",
            style: { width: 124 },
            value: filters.priority,
            options: [{ value: "", label: "全部优先级" }].concat(
              options(PRIORITY),
            ),
            onChange: function (v) {
              setFilter("priority", v);
            },
          }),
          h(Select, {
            "aria-label": "事项负责人筛选",
            style: { width: 134 },
            value: filters.assignee,
            options: [
              { value: "", label: "全部负责人" },
              { value: "__unassigned__", label: "未分配" },
            ].concat(
              assignees.map(function (name) {
                return { value: name, label: name };
              }),
            ),
            onChange: function (v) {
              setFilter("assignee", v);
            },
          }),
          h(Select, {
            "aria-label": "事项日期筛选",
            style: { width: 124 },
            value: filters.due,
            options: [
              { value: "", label: "全部日期" },
              { value: "overdue", label: "已逾期" },
              { value: "today", label: "今天到期" },
              { value: "unset", label: "未设日期" },
            ],
            onChange: function (v) {
              setFilter("due", v);
            },
          }),
          h("span", { className: "up-grow" }),
          h(SwitchView, {
            label: "事项视图",
            value: view,
            onChange: setView,
            options: [
              { value: "board", label: "看板", icon: "grid" },
              { value: "list", label: "事项列表", icon: "list" },
            ],
          }),
        ),
        h(
          "div",
          { className: "up-filter-summary" },
          "显示 " +
            shownItems.length +
            " / " +
            items.length +
            " 项 · 按优先级与截止日期排序",
          query || Object.values(filters).some(Boolean)
            ? h(
                Button,
                {
                  type: "link",
                  size: "small",
                  onClick: function () {
                    setQuery("");
                    setFilters({
                      status: "",
                      priority: "",
                      assignee: "",
                      due: "",
                    });
                  },
                },
                "清除筛选",
              )
            : null,
        ),
        view === "board"
          ? h(ItemBoard, {
              items: shownItems,
              onAdd: addItem,
              onEdit: openItem,
            })
          : shownItems.length
          ? h(ItemTable, {
              items: shownItems,
              onEdit: openItem,
              onStatus: itemStatus,
              busy: !!busy,
            })
          : h(EmptyState, {
              title: "没有匹配的事项",
              description: "调整筛选条件，或添加第一条需要对齐的事项。",
              action: h(
                Button,
                {
                  onClick: function () {
                    addItem();
                  },
                },
                "添加事项",
              ),
            }),
      );
    }
    function milestonesView() {
      return h(
        "section",
        { className: "up-panel" },
        h(
          "div",
          { className: "up-panel-head" },
          h(
            "div",
            null,
            h("h2", { className: "up-section-title" }, "里程碑时间线"),
            h(
              "div",
              { className: "up-sub", style: { marginTop: 5 } },
              "按截止日期排列 · " +
                milestones.filter(function (m) {
                  return m.status === "done";
                }).length +
                " / " +
                milestones.length +
                " 个节点已完成",
            ),
          ),
          h(
            Button,
            {
              type: "primary",
              icon: h(Icon, { name: "plus" }),
              onClick: function () {
                openMilestone();
              },
            },
            "新建里程碑",
          ),
        ),
        sortedMilestones.length
          ? milestoneRows(sortedMilestones, false)
          : h(EmptyState, {
              icon: "flag",
              title: "把目标拆成可交付的节点",
              description:
                "从资料准备、中期汇报到最终验收，让每个阶段都有明确日期。",
            }),
      );
    }
    function meetingsView() {
      return h(
        "section",
        { className: "up-stack" },
        h(
          "div",
          { className: "up-row up-between up-wrap" },
          h(
            "h2",
            { className: "up-section-title" },
            "对齐会议",
            h("span", { className: "up-count" }, meetings.length),
          ),
          h(
            Button,
            {
              type: "primary",
              icon: h(Icon, { name: "plus" }),
              onClick: function () {
                openMeeting();
              },
            },
            "记录会议",
          ),
        ),
        meetings.length
          ? meetings
              .slice()
              .sort(function (a, b) {
                return (b.held_at || b.created_at || "").localeCompare(
                  a.held_at || a.created_at || "",
                );
              })
              .map(function (meeting) {
                return h(
                  "article",
                  { className: "up-panel", key: meeting.id },
                  h(
                    "div",
                    { className: "up-row up-between up-wrap" },
                    h(
                      "div",
                      null,
                      h(
                        "div",
                        { className: "up-meeting-title" },
                        meeting.title,
                      ),
                      h(
                        "div",
                        { className: "up-muted", style: { marginTop: 6 } },
                        dateText(meeting.held_at),
                      ),
                    ),
                    h(
                      "div",
                      { className: "up-actions" },
                      h(
                        Button,
                        {
                          size: "small",
                          "aria-label": "编辑会议：" + meeting.title,
                          onClick: function () {
                            openMeeting(meeting);
                          },
                        },
                        "编辑会议",
                      ),
                      h(
                        Popconfirm,
                        {
                          title: "删除这条会议记录？",
                          okText: "确认删除",
                          cancelText: "取消",
                          disabled: !!busy,
                          onConfirm: function () {
                            return mutate("meeting-delete", function () {
                              return api.deleteChild("meetings", meeting.id);
                            });
                          },
                        },
                        h(
                          Button,
                          {
                            size: "small",
                            type: "text",
                            danger: true,
                            disabled: !!busy,
                          },
                          "删除会议",
                        ),
                      ),
                    ),
                  ),
                  h(
                    "div",
                    { className: "up-sub", style: { marginTop: 12 } },
                    "甲方：" +
                      (meeting.attendees_client || "未填写") +
                      "　·　乙方：" +
                      (meeting.attendees_vendor || "未填写"),
                  ),
                  [
                    ["agenda", "会议议程"],
                    ["notes", "会议纪要"],
                    ["decisions", "确认结论"],
                  ].map(function (pair) {
                    return meeting[pair[0]]
                      ? h(
                          "div",
                          { key: pair[0], className: "up-note" },
                          h("span", { className: "up-label" }, pair[1]),
                          h("div", { className: "up-sow" }, meeting[pair[0]]),
                        )
                      : null;
                  }),
                  meeting.notes
                    ? h(
                        Button,
                        {
                          type: "text",
                          style: {
                            marginTop: 12,
                            color: "var(--app-accent-text)",
                          },
                          icon: h(Icon, { name: "spark" }),
                          onClick: function () {
                            setMinutes(meeting.notes);
                            setTab("ai");
                          },
                        },
                        "用这份纪要拆解事项",
                      )
                    : null,
                );
              })
          : h(EmptyState, {
              icon: "people",
              title: "记录讨论，也记录共识",
              description:
                "集中保留双方参会人、会议纪要和确认结论，方便后续追溯。",
            }),
      );
    }
    function sourceLabel(source) {
      return source === "fallback"
        ? "规则生成 · AI 暂不可用，内容请核对"
        : source === "agent"
        ? "AI 生成 · 请核对后使用"
        : "生成内容 · 请核对后使用";
    }
    function aiView() {
      return h(
        "section",
        { className: "up-stack" },
        h(
          "div",
          { className: "up-ai-actions" },
          [
            [
              "agenda",
              "生成对齐议程",
              "围绕未决事项、阻塞与交付节点，准备下一次讨论。",
            ],
            [
              "weekly",
              "生成项目周报",
              "汇总项目进展、风险和下一步计划，面向甲方沟通。",
            ],
          ].map(function (entry) {
            return h(
              "div",
              { className: "up-ai-action", key: entry[0] },
              h(
                "div",
                { className: "up-row up-accent-text" },
                h(Icon, {
                  name: entry[0] === "agenda" ? "calendar" : "spark",
                  size: 19,
                }),
                h("strong", null, BRIEF_KIND[entry[0]]),
              ),
              h("div", { className: "up-sub" }, entry[2]),
              h(
                Button,
                {
                  disabled: !!busy,
                  loading: busy === "ai-" + entry[0],
                  onClick: function () {
                    runAi(entry[0]);
                  },
                },
                entry[1],
              ),
            );
          }),
        ),
        h(
          "div",
          { className: "up-panel" },
          h(
            "div",
            { className: "up-panel-head" },
            h("h2", { className: "up-section-title" }, "从会议纪要到执行事项"),
          ),
          h(Input.TextArea, {
            "aria-label": "待拆解会议纪要",
            rows: 5,
            value: minutes,
            placeholder: "粘贴会议记录，提取双方需要推进与确认的具体事项…",
            onChange: function (e) {
              setMinutes(e.target.value);
            },
          }),
          h(
            "div",
            {
              className: "up-row up-between up-wrap",
              style: { marginTop: 12 },
            },
            h(
              "span",
              { className: "up-muted" },
              "将直接创建事项；请核对结果并补齐负责人、日期及依赖。",
            ),
            h(
              Button,
              {
                type: "primary",
                disabled: !!busy || !minutes.trim(),
                loading: busy === "ai-minutes",
                icon: h(Icon, { name: "spark" }),
                onClick: function () {
                  runAi("minutes");
                },
              },
              "拆解并创建事项",
            ),
          ),
        ),
        busy.indexOf("ai-") === 0
          ? h(
              "div",
              { className: "up-callout", role: "status" },
              h(Spin, { size: "small" }),
              " 正在整理当前项目，请稍候…",
            )
          : null,
        ai
          ? h(
              "article",
              { className: "up-panel" },
              h(
                "div",
                { className: "up-panel-head up-wrap" },
                h(
                  "div",
                  null,
                  h(
                    "h2",
                    { className: "up-section-title" },
                    BRIEF_KIND[ai.kind] || "最新简报",
                  ),
                  h(
                    "div",
                    { className: "up-muted", style: { marginTop: 5 } },
                    sourceLabel(ai.source),
                  ),
                ),
                h(
                  Button,
                  {
                    size: "small",
                    icon: h(Icon, { name: "download" }),
                    onClick: function () {
                      download(
                        project.name +
                          "-" +
                          (BRIEF_KIND[ai.kind] || "简报") +
                          ".md",
                        ai.content || "",
                        "text/markdown;charset=utf-8",
                      );
                    },
                  },
                  "导出 Markdown",
                ),
              ),
              h(
                "pre",
                { className: "up-brief" },
                ai.content ||
                  "本次未提取到可执行事项，请补充更具体的会议内容。",
              ),
            )
          : null,
        h(
          "div",
          { className: "up-panel" },
          h(
            "h2",
            { className: "up-section-title" },
            "历史简报",
            h("span", { className: "up-count" }, briefs.length),
          ),
          briefs.length
            ? h(
                "div",
                { className: "up-brief-history" },
                briefs.map(function (brief) {
                  return h(
                    "details",
                    { key: brief.id },
                    h(
                      "summary",
                      null,
                      BRIEF_KIND[brief.kind] || "项目简报",
                      " · ",
                      timeText(brief.created_at),
                      h(
                        "span",
                        { className: "up-muted", style: { marginLeft: 10 } },
                        sourceLabel(brief.source),
                      ),
                    ),
                    h(
                      "pre",
                      { className: "up-brief" },
                      brief.content || "无正文",
                    ),
                  );
                }),
              )
            : h(
                "p",
                { className: "up-sub" },
                "生成的议程、周报与纪要拆解会保存在这里，重新打开项目也可查看。",
              ),
        ),
      );
    }
    return h(
      "div",
      { className: "up-shell" },
      h(
        "div",
        { className: "up-row up-between up-wrap" },
        h(
          Button,
          {
            type: "text",
            icon: h(Icon, { name: "arrow" }),
            style: { paddingLeft: 0, color: "var(--app-text-secondary)" },
            onClick: props.onBack,
          },
          "返回项目台",
        ),
        h(
          "div",
          { className: "up-actions" },
          h(
            Button,
            {
              icon: h(Icon, { name: "download" }),
              onClick: function () {
                download(
                  project.name + ".json",
                  JSON.stringify(
                    { exported_at: new Date().toISOString(), bundle: bundle },
                    null,
                    2,
                  ),
                  "application/json;charset=utf-8",
                );
              },
            },
            "导出项目",
          ),
          h(
            Button,
            {
              onClick: function () {
                setProjectEditor(projectForm(project));
              },
            },
            "编辑项目",
          ),
          h(
            Popconfirm,
            {
              title: "删除整个项目？",
              description:
                "项目及其全部事项、里程碑、会议和简报将被删除，无法撤销。",
              okText: "确认删除项目",
              cancelText: "取消",
              disabled: !!busy,
              onConfirm: function () {
                return mutate(
                  "project-delete",
                  function () {
                    return api.remove(project.id);
                  },
                  props.onDeleted,
                );
              },
            },
            h(
              Button,
              { danger: true, type: "text", disabled: !!busy },
              "删除项目",
            ),
          ),
        ),
      ),
      h(
        "header",
        { className: "up-row up-between up-page-head" },
        h(
          "div",
          { className: "up-grow" },
          h(
            "div",
            { className: "up-kicker" },
            [project.code || "RESEARCH PROJECT", project.domain]
              .filter(Boolean)
              .join(" / "),
          ),
          h("h1", { className: "up-title up-detail-title" }, project.name),
          h(
            "div",
            { className: "up-sub" },
            nextMilestone
              ? "下一交付节点：" +
                  nextMilestone.title +
                  " · " +
                  dateText(nextMilestone.due_date)
              : "从事项共识到科研交付，保持双方进度同步。",
          ),
        ),
        h(Select, {
          "aria-label": "修改项目阶段",
          style: { width: 125 },
          value: project.status,
          disabled: !!busy,
          options: options(PROJECT_STATUS),
          onChange: function (value) {
            mutate("project-status", function () {
              return api.patch(project.id, { status: value });
            });
          },
        }),
      ),
      h(
        "div",
        { className: "up-stats" },
        h(Stat, {
          label: "事项对齐",
          value: percent + "%",
          note: agreed + " / " + items.length + " 项已达成共识",
          icon: "check",
        }),
        h(Stat, {
          label: "逾期事项",
          value: overdue.length,
          note: "到期仍未对齐，需要跟进",
          icon: "clock",
          alert: overdue.length > 0,
        }),
        h(Stat, {
          label: "阻塞事项",
          value: blocked.length,
          note: "等待决策或前置条件",
          icon: "alert",
          alert: blocked.length > 0,
        }),
        h(Stat, {
          label: "交付节点",
          value:
            milestones.filter(function (m) {
              return m.status === "done";
            }).length +
            " / " +
            milestones.length,
          note: "已完成 / 全部里程碑",
          icon: "flag",
        }),
      ),
      h(Tabs, {
        className: "up-detail-tabs",
        activeKey: tab,
        onChange: setTab,
        items: [
          { key: "overview", label: "概览" },
          { key: "items", label: "对齐事项" },
          { key: "milestones", label: "里程碑" },
          { key: "meetings", label: "对齐会议" },
          { key: "ai", label: "AI 简报" },
          { key: "activity", label: "活动记录" },
        ],
      }),
      tab === "overview"
        ? overview()
        : tab === "items"
        ? itemsView()
        : tab === "milestones"
        ? milestonesView()
        : tab === "meetings"
        ? meetingsView()
        : tab === "ai"
        ? aiView()
        : h(
            "section",
            { className: "up-panel" },
            h(
              "div",
              { className: "up-panel-head" },
              h("h2", { className: "up-section-title" }, "项目活动记录"),
              h("span", { className: "up-muted" }, "最新变更在前"),
            ),
            activity.length
              ? activityRows(activity)
              : h(EmptyState, {
                  icon: "activity",
                  title: "还没有变更记录",
                  description:
                    "新增与更新的项目、事项、里程碑及会议会显示在这里。",
                }),
          ),
      itemEditor
        ? h(ItemModal, {
            editing: itemEditor.id,
            form: itemEditor.form,
            items: items,
            milestones: milestones,
            saving: !!busy,
            setForm: function (form) {
              setItemEditor({ id: itemEditor.id, form: form });
            },
            onCancel: function () {
              if (!busy) setItemEditor(null);
            },
            onOk: saveItem,
            onDelete: function () {
              return mutate(
                "item-delete",
                function () {
                  return api.deleteChild("items", itemEditor.id);
                },
                function () {
                  setItemEditor(null);
                },
              );
            },
          })
        : null,
      projectEditor
        ? h(ProjectFormModal, {
            editing: true,
            form: projectEditor,
            setForm: setProjectEditor,
            saving: !!busy,
            onCancel: function () {
              if (!busy) setProjectEditor(null);
            },
            onOk: projectSave,
          })
        : null,
      msEditor
        ? h(
            Modal,
            {
              open: true,
              className: "up-modal",
              title: msEditor.id ? "编辑里程碑" : "新建里程碑",
              okText: "保存里程碑",
              cancelText: "取消",
              confirmLoading: !!busy,
              cancelButtonProps: { disabled: !!busy },
              closable: !busy,
              maskClosable: false,
              onCancel: function () {
                if (!busy) setMsEditor(null);
              },
              onOk: function () {
                if (!msEditor.form.title.trim())
                  return message.warning("请填写里程碑名称");
                return mutate(
                  "milestone",
                  function () {
                    return msEditor.id
                      ? api.patchChild("milestones", msEditor.id, msEditor.form)
                      : api.addChild(project.id, "milestones", msEditor.form);
                  },
                  function () {
                    setMsEditor(null);
                    message.success("里程碑已保存");
                  },
                );
              },
            },
            h(
              "div",
              { className: "up-form" },
              h(
                Field,
                { label: "里程碑名称", required: true },
                h(Input, {
                  disabled: !!busy,
                  "aria-label": "里程碑名称",
                  value: msEditor.form.title,
                  maxLength: 200,
                  onChange: function (e) {
                    setMsEditor({
                      id: msEditor.id,
                      form: Object.assign({}, msEditor.form, {
                        title: e.target.value,
                      }),
                    });
                  },
                }),
              ),
              h(
                Field,
                { label: "里程碑截止日期" },
                h(Input, {
                  disabled: !!busy,
                  type: "date",
                  "aria-label": "里程碑截止日期",
                  value: msEditor.form.due_date,
                  onChange: function (e) {
                    setMsEditor({
                      id: msEditor.id,
                      form: Object.assign({}, msEditor.form, {
                        due_date: e.target.value,
                      }),
                    });
                  },
                }),
              ),
              h(
                Field,
                { label: "里程碑责任方" },
                h(Select, {
                  disabled: !!busy,
                  "aria-label": "里程碑责任方",
                  options: options(SIDE),
                  value: msEditor.form.owner_side,
                  onChange: function (v) {
                    setMsEditor({
                      id: msEditor.id,
                      form: Object.assign({}, msEditor.form, { owner_side: v }),
                    });
                  },
                }),
              ),
              h(
                Field,
                { label: "里程碑状态" },
                h(Select, {
                  disabled: !!busy,
                  "aria-label": "里程碑状态",
                  options: [
                    { value: "pending", label: "待完成" },
                    { value: "done", label: "已完成" },
                  ],
                  value: msEditor.form.status,
                  onChange: function (v) {
                    setMsEditor({
                      id: msEditor.id,
                      form: Object.assign({}, msEditor.form, { status: v }),
                    });
                  },
                }),
              ),
            ),
          )
        : null,
      meetingEditor
        ? h(
            Modal,
            {
              open: true,
              className: "up-modal",
              width: 680,
              title: meetingEditor.id ? "编辑会议" : "记录对齐会议",
              okText: "保存会议",
              cancelText: "取消",
              confirmLoading: !!busy,
              cancelButtonProps: { disabled: !!busy },
              closable: !busy,
              maskClosable: false,
              onCancel: function () {
                if (!busy) setMeetingEditor(null);
              },
              onOk: function () {
                if (!meetingEditor.form.title.trim())
                  return message.warning("请填写会议主题");
                return mutate(
                  "meeting",
                  function () {
                    return meetingEditor.id
                      ? api.patchChild(
                          "meetings",
                          meetingEditor.id,
                          meetingEditor.form,
                        )
                      : api.addChild(
                          project.id,
                          "meetings",
                          meetingEditor.form,
                        );
                  },
                  function () {
                    setMeetingEditor(null);
                    message.success("会议已保存");
                  },
                );
              },
            },
            h(
              "div",
              { className: "up-form" },
              [
                ["title", "会议主题", "text"],
                ["held_at", "会议日期", "date"],
                ["attendees_client", "甲方参会人", "text"],
                ["attendees_vendor", "乙方参会人", "text"],
                ["agenda", "会议议程", "area"],
                ["notes", "会议纪要", "area"],
                ["decisions", "确认结论", "area"],
              ].map(function (entry) {
                return h(
                  Field,
                  {
                    key: entry[0],
                    label: entry[1],
                    required: entry[0] === "title",
                  },
                  h(entry[2] === "area" ? Input.TextArea : Input, {
                    disabled: !!busy,
                    "aria-label": entry[1],
                    type: entry[2] === "date" ? "date" : undefined,
                    rows: entry[0] === "notes" ? 4 : 2,
                    value: meetingEditor.form[entry[0]],
                    onChange: function (e) {
                      var form = Object.assign({}, meetingEditor.form);
                      form[entry[0]] = e.target.value;
                      setMeetingEditor({ id: meetingEditor.id, form: form });
                    },
                  }),
                );
              }),
            ),
          )
        : null,
    );
  }

  function AppRoot() {
    var projectState = useState([]),
      projects = projectState[0],
      setProjects = projectState[1];
    var selectedState = useState(null),
      selected = selectedState[0],
      setSelected = selectedState[1],
      selectedRef = useRef(null);
    var bundleState = useState(null),
      bundle = bundleState[0],
      setBundle = bundleState[1];
    var loadingState = useState(true),
      loading = loadingState[0],
      setLoading = loadingState[1];
    var detailLoadingState = useState(false),
      detailLoading = detailLoadingState[0],
      setDetailLoading = detailLoadingState[1];
    var errorState = useState(""),
      error = errorState[0],
      setError = errorState[1];
    var detailErrorState = useState(""),
      detailError = detailErrorState[0],
      setDetailError = detailErrorState[1];
    var queryState = useState(""),
      query = queryState[0],
      setQuery = queryState[1];
    var statusState = useState(""),
      status = statusState[0],
      setStatus = statusState[1];
    var attentionState = useState(""),
      attention = attentionState[0],
      setAttention = attentionState[1];
    var sortState = useState("updated"),
      sort = sortState[0],
      setSort = sortState[1];
    var viewState = useState("cards"),
      view = viewState[0],
      setView = viewState[1];
    var formState = useState(null),
      form = formState[0],
      setForm = formState[1];
    var busyState = useState(""),
      busy = busyState[0],
      setBusy = busyState[1],
      actionLock = useRef(false),
      listSeq = useRef(0),
      detailSeq = useRef(0),
      mounted = useRef(true);
    function loadList() {
      var seq = ++listSeq.current;
      setLoading(true);
      setError("");
      return api
        .list()
        .then(function (data) {
          if (mounted.current && seq === listSeq.current)
            setProjects(data.projects || []);
        })
        .catch(function (e) {
          if (mounted.current && seq === listSeq.current) setError(errText(e));
        })
        .finally(function () {
          if (mounted.current && seq === listSeq.current) setLoading(false);
        });
    }
    function loadBundle(id, refresh) {
      if (refresh && selectedRef.current !== id) return Promise.resolve();
      var seq = ++detailSeq.current;
      if (!refresh) {
        selectedRef.current = id;
        setSelected(id);
        setBundle(null);
        setDetailLoading(true);
      }
      setDetailError("");
      return api
        .get(id)
        .then(function (data) {
          if (
            mounted.current &&
            seq === detailSeq.current &&
            selectedRef.current === id
          )
            setBundle(data);
        })
        .catch(function (e) {
          if (
            mounted.current &&
            seq === detailSeq.current &&
            selectedRef.current === id
          ) {
            if (refresh) message.error("保存成功，但刷新失败：" + errText(e));
            else setDetailError(errText(e));
          }
        })
        .finally(function () {
          if (mounted.current && seq === detailSeq.current)
            setDetailLoading(false);
        });
    }
    function back() {
      ++detailSeq.current;
      selectedRef.current = null;
      setSelected(null);
      setBundle(null);
      setDetailLoading(false);
      setDetailError("");
      loadList();
    }
    useEffect(function () {
      mounted.current = true;
      loadList();
      return function () {
        mounted.current = false;
        ++listSeq.current;
        ++detailSeq.current;
      };
    }, []);
    function action(key, job, done) {
      if (actionLock.current) return Promise.resolve();
      actionLock.current = true;
      setBusy(key);
      return Promise.resolve()
        .then(job)
        .then(function (data) {
          if (mounted.current && done) return done(data);
        })
        .catch(function (e) {
          if (mounted.current) message.error(errText(e));
        })
        .finally(function () {
          actionLock.current = false;
          if (mounted.current) setBusy("");
        });
    }
    function createProject() {
      if (!form.name.trim()) return message.warning("请填写项目名称");
      if (form.start_date && form.end_date && form.end_date < form.start_date)
        return message.warning("项目结束日期不能早于开始日期");
      return action(
        "create",
        function () {
          return api.create(form);
        },
        function (data) {
          setForm(null);
          message.success("项目已创建");
          loadList();
          if (data.project) return loadBundle(data.project.id);
        },
      );
    }
    function exportAll() {
      return action(
        "export",
        function () {
          return Promise.all(
            projects.map(function (p) {
              return api.get(p.id);
            }),
          );
        },
        function (bundles) {
          download(
            "科研项目台账-" + today() + ".json",
            JSON.stringify(
              {
                version: 1,
                exported_at: new Date().toISOString(),
                projects: bundles,
              },
              null,
              2,
            ),
            "application/json;charset=utf-8",
          );
          message.success("已导出全部 " + bundles.length + " 个项目");
        },
      );
    }
    var shown = projects
      .filter(function (p) {
        var s = projectStats(p),
          text = [
            p.name,
            p.code,
            p.domain,
            p.sow,
            (p.client || {}).org,
            (p.client || {}).contact,
            (p.vendor || {}).org,
            (p.vendor || {}).contact,
          ]
            .join(" ")
            .toLowerCase();
        return (
          (!query || text.indexOf(query.trim().toLowerCase()) >= 0) &&
          (!status || p.status === status) &&
          (!attention ||
            (attention === "overdue"
              ? s.overdue > 0
              : attention === "blocked"
              ? s.blocked > 0
              : attention === "high"
              ? s.high > 0
              : p.status !== "closed"))
        );
      })
      .sort(function (a, b) {
        return sort === "name"
          ? a.name.localeCompare(b.name, "zh-CN")
          : sort === "alignment"
          ? (a.next_align_at || "9999").localeCompare(b.next_align_at || "9999")
          : sort === "progress"
          ? projectStats(b).percent - projectStats(a).percent
          : (b.updated_at || "").localeCompare(a.updated_at || "");
      });
    var active = projects.filter(function (p) {
      return p.status !== "closed";
    }).length;
    var totalItems = projects.reduce(function (total, p) {
        return total + projectStats(p).total;
      }, 0),
      totalAgreed = projects.reduce(function (total, p) {
        return total + projectStats(p).agreed;
      }, 0),
      totalOverdue = projects.reduce(function (total, p) {
        return total + projectStats(p).overdue;
      }, 0),
      totalBlocked = projects.reduce(function (total, p) {
        return total + projectStats(p).blocked;
      }, 0);
    return h(
      "main",
      { className: "up-workbench", "aria-label": "科研项目工作台" },
      h("style", null, CSS),
      selected
        ? detailLoading
          ? h(
              "div",
              { className: "up-shell" },
              h(
                Button,
                { style: { alignSelf: "flex-start" }, onClick: back },
                "返回项目台",
              ),
              h(
                "div",
                { className: "up-loading", role: "status" },
                h(Spin),
                h("p", null, "正在打开项目…"),
              ),
            )
          : detailError
          ? h(
              "div",
              { className: "up-shell" },
              h(
                Button,
                { style: { alignSelf: "flex-start" }, onClick: back },
                "返回项目台",
              ),
              h(EmptyState, {
                icon: "alert",
                title: "暂时无法打开项目",
                description: detailError,
                action: h(
                  Button,
                  {
                    onClick: function () {
                      loadBundle(selected);
                    },
                  },
                  "重试",
                ),
              }),
            )
          : bundle
          ? h(ProjectDetail, {
              key: selected,
              bundle: bundle,
              onBack: back,
              onReload: function () {
                return loadBundle(selected, true);
              },
              onDeleted: back,
            })
          : null
        : h(
            "div",
            { className: "up-shell" },
            h(
              "header",
              { className: "up-row up-between up-page-head" },
              h(
                "div",
                { className: "up-row", style: { gap: 14 } },
                h(
                  "div",
                  { className: "up-brand-icon" },
                  h(Icon, { name: "project", size: 23 }),
                ),
                h(
                  "div",
                  null,
                  h("div", { className: "up-kicker" }, "UPROJECT / 科研协作"),
                  h("h1", { className: "up-title" }, "科研项目工作台"),
                  h(
                    "div",
                    { className: "up-sub" },
                    "把研究目标、双方共识与交付进度，放在同一张工作台。",
                  ),
                ),
              ),
              h(
                "div",
                { className: "up-actions" },
                h(
                  Button,
                  {
                    icon: h(Icon, { name: "refresh" }),
                    "aria-label": "刷新项目",
                    loading: loading,
                    disabled: !!busy,
                    onClick: loadList,
                  },
                  "刷新",
                ),
                h(
                  Button,
                  {
                    type: "primary",
                    icon: h(Icon, { name: "plus" }),
                    disabled: !!busy,
                    onClick: function () {
                      setForm(emptyProject());
                    },
                  },
                  "新建项目",
                ),
              ),
            ),
            h(
              "div",
              { className: "up-stats" },
              h(Stat, {
                label: "进行中项目",
                value: active,
                note:
                  "共 " +
                  projects.length +
                  " 个项目 · " +
                  (projects.length - active) +
                  " 个已关闭",
                icon: "project",
              }),
              h(Stat, {
                label: "已达成共识",
                value: totalAgreed + " / " + totalItems,
                note: "已对齐事项 / 全部事项",
                icon: "check",
              }),
              h(Stat, {
                label: "逾期待跟进",
                value: totalOverdue,
                note: "明确下一步，避免交付延误",
                icon: "clock",
                alert: totalOverdue > 0,
              }),
              h(Stat, {
                label: "当前阻塞",
                value: totalBlocked,
                note: "需要双方协调解决",
                icon: "alert",
                alert: totalBlocked > 0,
              }),
            ),
            h(
              "section",
              null,
              h(
                "div",
                { className: "up-row up-between up-wrap" },
                h(
                  "h2",
                  { className: "up-section-title" },
                  "项目空间",
                  h("span", { className: "up-count" }, projects.length),
                ),
                h(
                  "div",
                  { className: "up-actions" },
                  h(
                    Button,
                    {
                      type: "text",
                      icon: h(Icon, { name: "download" }),
                      disabled: !!busy || !projects.length,
                      loading: busy === "export",
                      onClick: exportAll,
                    },
                    "导出全部",
                  ),
                  h(
                    Popconfirm,
                    {
                      title: "清空现有数据并恢复演示？",
                      description:
                        "全部项目、事项、会议、里程碑和简报都会被替换。建议先导出全部项目。此操作无法撤销。",
                      okText: "确认清空并恢复",
                      cancelText: "取消",
                      disabled: !!busy,
                      onConfirm: function () {
                        return action("reset", api.reset, function () {
                          message.success("已恢复演示场景");
                          return loadList();
                        });
                      },
                    },
                    h(
                      Button,
                      {
                        type: "text",
                        disabled: !!busy,
                        loading: busy === "reset",
                        style: { color: "var(--app-text-tertiary)" },
                      },
                      "恢复演示",
                    ),
                  ),
                ),
              ),
              h(
                "div",
                { className: "up-toolbar" },
                h(Input, {
                  className: "up-search",
                  "aria-label": "搜索项目",
                  prefix: h(Icon, { name: "search" }),
                  placeholder: "搜索项目、编号或合作单位",
                  allowClear: true,
                  value: query,
                  onChange: function (e) {
                    setQuery(e.target.value);
                  },
                }),
                h(Select, {
                  "aria-label": "项目状态筛选",
                  value: status,
                  style: { width: 125 },
                  options: [{ value: "", label: "全部阶段" }].concat(
                    options(PROJECT_STATUS),
                  ),
                  onChange: setStatus,
                }),
                h(Select, {
                  "aria-label": "项目关注筛选",
                  value: attention,
                  style: { width: 138 },
                  options: [
                    { value: "", label: "全部项目" },
                    { value: "active", label: "进行中" },
                    { value: "overdue", label: "有逾期事项" },
                    { value: "blocked", label: "有阻塞事项" },
                    { value: "high", label: "有高优先级" },
                  ],
                  onChange: setAttention,
                }),
                h("span", { className: "up-grow" }),
                h(Select, {
                  "aria-label": "项目排序",
                  value: sort,
                  style: { width: 124 },
                  options: [
                    { value: "updated", label: "最近更新" },
                    { value: "alignment", label: "对齐日期" },
                    { value: "progress", label: "对齐进度" },
                    { value: "name", label: "项目名称" },
                  ],
                  onChange: setSort,
                }),
                h(SwitchView, {
                  label: "项目视图",
                  value: view,
                  onChange: setView,
                  options: [
                    { value: "cards", label: "卡片", icon: "grid" },
                    { value: "list", label: "项目列表", icon: "list" },
                  ],
                }),
              ),
              query || status || attention
                ? h(
                    "div",
                    { className: "up-filter-summary" },
                    "找到 " + shown.length + " 个项目",
                    h(
                      Button,
                      {
                        type: "link",
                        size: "small",
                        onClick: function () {
                          setQuery("");
                          setStatus("");
                          setAttention("");
                        },
                      },
                      "清除筛选",
                    ),
                  )
                : null,
              loading && !projects.length
                ? h(
                    "div",
                    { className: "up-loading", role: "status" },
                    h(Spin),
                    h("p", null, "正在加载项目台账…"),
                  )
                : error
                ? h(EmptyState, {
                    icon: "alert",
                    title: "项目加载失败",
                    description: error,
                    action: h(Button, { onClick: loadList }, "重新加载"),
                  })
                : shown.length
                ? view === "cards"
                  ? h(
                      "div",
                      { className: "up-projects" },
                      shown.map(function (p) {
                        return h(ProjectCard, {
                          key: p.id,
                          project: p,
                          onOpen: function () {
                            loadBundle(p.id);
                          },
                        });
                      }),
                    )
                  : h(ProjectTable, { projects: shown, onOpen: loadBundle })
                : h(EmptyState, {
                    title: projects.length
                      ? "没有匹配的项目"
                      : "从第一个科研项目开始",
                    description: projects.length
                      ? "换个关键词，或清除筛选条件再试试。"
                      : "建立协作关系、拆解研究任务，逐步推进到交付验收。",
                    action: projects.length
                      ? h(
                          Button,
                          {
                            onClick: function () {
                              setQuery("");
                              setStatus("");
                              setAttention("");
                            },
                          },
                          "清除筛选",
                        )
                      : h(
                          Button,
                          {
                            type: "primary",
                            onClick: function () {
                              setForm(emptyProject());
                            },
                          },
                          "创建第一个项目",
                        ),
                  }),
            ),
          ),
      form
        ? h(ProjectFormModal, {
            form: form,
            setForm: setForm,
            saving: busy === "create",
            onCancel: function () {
              if (!busy) setForm(null);
            },
            onOk: createProject,
          })
        : null,
    );
  }
  QwenPaw.registerRoutes("uproject", [
    {
      path: "/apps/uproject",
      component: AppRoot,
      label: "科研项目工作台",
      icon: "UP",
    },
  ]);
})();
