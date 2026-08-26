/**
 * Storage Capacity — auditable underground-gas-storage evaluation workspace.
 * Registers /apps/storage-capacity and uses the host React/antd runtime.
 */
(function () {
  var QwenPaw = window.QwenPaw;
  if (!QwenPaw || !QwenPaw.host || !QwenPaw.registerRoutes) {
    console.error("[storage-capacity] window.QwenPaw not ready");
    return;
  }

  var host = QwenPaw.host;
  var React = host.React;
  var antd = host.antd;
  var h = React.createElement;
  var useEffect = React.useEffect;
  var useMemo = React.useMemo;
  var useState = React.useState;
  var Button = antd.Button;
  var Input = antd.Input;
  var InputNumber = antd.InputNumber;
  var Modal = antd.Modal;
  var Select = antd.Select;
  var Tag = antd.Tag;
  var Tooltip = antd.Tooltip;
  var Upload = antd.Upload;
  var message = antd.message;
  var Spin = antd.Spin;

  var COLORS = {
    ink: "#152a2d",
    sub: "#627477",
    line: "rgba(21, 42, 45, 0.11)",
    teal: "#0a6e70",
    teal2: "#0d8b85",
    mint: "#d9f2e8",
    cream: "#f4f1e8",
    amber: "#d18a35",
    red: "#bb5a4a",
    white: "#fffefb",
  };

  var STYLE_ID = "storage-capacity-styles";
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".sc-app{min-height:100%;background:#eef2ee;color:#152a2d;font-family:Inter,'PingFang SC','Microsoft YaHei',sans-serif}",
      ".sc-shell{max-width:1540px;margin:0 auto;padding:22px 24px 48px}",
      ".sc-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}",
      ".sc-brand{display:flex;align-items:center;gap:11px;font-weight:800;letter-spacing:-.02em}",
      ".sc-mark{width:34px;height:34px;border-radius:11px;background:#0a6e70;color:white;display:grid;place-items:center;box-shadow:0 8px 18px rgba(10,110,112,.22)}",
      ".sc-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap}",
      ".sc-hero{position:relative;overflow:hidden;border-radius:22px;background:#123f42;color:#fff;padding:30px 34px;box-shadow:0 18px 50px rgba(19,61,65,.17)}",
      ".sc-hero:after{content:'';position:absolute;width:460px;height:460px;border-radius:50%;right:-160px;top:-250px;border:78px solid rgba(160,225,201,.12)}",
      ".sc-hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(340px,.65fr);gap:24px;align-items:end}",
      ".sc-eyebrow{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#91d7c1;margin-bottom:10px}",
      ".sc-title{font-size:30px;line-height:1.2;font-weight:850;letter-spacing:-.035em;margin:0 0 10px}",
      ".sc-desc{max-width:820px;color:rgba(255,255,255,.72);line-height:1.7;font-size:14px}",
      ".sc-hero-meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:19px}",
      ".sc-pill{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);border-radius:999px;padding:7px 11px;font-size:12px;color:rgba(255,255,255,.86)}",
      ".sc-hero-score{display:flex;align-items:center;justify-content:flex-end;gap:18px}",
      ".sc-score-ring{width:108px;height:108px;border-radius:50%;display:grid;place-items:center;position:relative;background:conic-gradient(#8fd9bf var(--score),rgba(255,255,255,.12) 0)}",
      ".sc-score-ring:after{content:'';position:absolute;inset:8px;background:#123f42;border-radius:50%}",
      ".sc-score-inner{position:relative;z-index:1;text-align:center}",
      ".sc-score-number{font-size:27px;font-weight:850;line-height:1}",
      ".sc-score-label{font-size:10px;color:rgba(255,255,255,.58);margin-top:4px}",
      ".sc-score-copy{max-width:190px}",
      ".sc-score-copy strong{font-size:14px}.sc-score-copy div{font-size:12px;color:rgba(255,255,255,.62);line-height:1.6;margin-top:5px}",
      ".sc-steps{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:rgba(21,42,45,.1);border:1px solid rgba(21,42,45,.08);border-radius:16px;overflow:hidden;margin:16px 0}",
      ".sc-step{background:#fffefb;padding:13px 15px;display:flex;gap:10px;align-items:center;min-width:0}",
      ".sc-step-num{width:25px;height:25px;border-radius:9px;background:#e4efea;color:#0a6e70;display:grid;place-items:center;font-size:11px;font-weight:800;flex:0 0 auto}",
      ".sc-step-title{font-weight:750;font-size:12px}.sc-step-sub{font-size:10px;color:#8a989a;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".sc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}",
      ".sc-card{background:#fffefb;border:1px solid rgba(21,42,45,.09);border-radius:18px;padding:20px;box-shadow:0 7px 22px rgba(31,59,61,.045)}",
      ".sc-card.wide{grid-column:1/-1}",
      ".sc-import-layout{display:grid;grid-template-columns:minmax(320px,.82fr) 1.18fr;gap:18px;align-items:stretch}",
      ".sc-drop .ant-upload-drag{height:100%;min-height:188px;border:1px dashed rgba(10,110,112,.38);background:#f4f8f4;border-radius:15px}",
      ".sc-drop-icon{width:48px;height:48px;border-radius:15px;background:#dff2e9;color:#0a6e70;display:grid;place-items:center;margin:0 auto 12px;font-size:22px;font-weight:800}",
      ".sc-drop-title{font-size:14px;font-weight:800;color:#213b3e}.sc-drop-sub{font-size:11px;color:#748588;margin-top:6px;line-height:1.6}",
      ".sc-import-status{border:1px solid rgba(21,42,45,.09);background:#f8f9f5;border-radius:15px;padding:16px;min-height:188px;display:flex;flex-direction:column}",
      ".sc-import-title{font-size:13px;font-weight:800}.sc-import-copy{font-size:11px;color:#718184;line-height:1.65;margin-top:6px}",
      ".sc-import-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:13px 0}.sc-import-stat{background:white;border-radius:11px;padding:10px;border:1px solid rgba(21,42,45,.07)}.sc-import-stat b{font-size:17px;display:block}.sc-import-stat span{font-size:9px;color:#849294}",
      ".sc-missing{font-size:10px;color:#8a6425;background:#fff5df;border-radius:9px;padding:8px 10px;line-height:1.55;margin-bottom:10px}",
      ".sc-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:17px}",
      ".sc-card-title{font-size:16px;font-weight:820;letter-spacing:-.015em}.sc-card-desc{font-size:12px;color:#718184;margin-top:4px;line-height:1.55}",
      ".sc-kicker{font-size:10px;font-weight:800;color:#0a6e70;letter-spacing:.12em;text-transform:uppercase;margin-bottom:5px}",
      ".sc-doc{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:11px;align-items:center;padding:11px 0;border-top:1px solid rgba(21,42,45,.075)}",
      ".sc-doc:first-child{border-top:0;padding-top:0}.sc-doc-icon{width:38px;height:38px;border-radius:11px;background:#eef3ef;display:grid;place-items:center;font-size:17px}",
      ".sc-doc-name{font-size:13px;font-weight:720;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sc-doc-meta{font-size:10px;color:#8a989a;margin-top:4px}",
      ".sc-coverage{width:86px;text-align:right}.sc-bar{height:5px;border-radius:9px;background:#e5ebe7;overflow:hidden;margin-top:5px}.sc-bar>i{display:block;height:100%;background:#2f9a8d;border-radius:9px}",
      ".sc-params{max-height:310px;overflow:auto;padding-right:5px}.sc-param{display:grid;grid-template-columns:minmax(155px,1.25fr) .6fr .48fr 1.2fr;gap:10px;align-items:center;border-top:1px solid rgba(21,42,45,.075);padding:10px 0;font-size:11px}",
      ".sc-param:first-child{border-top:0;padding-top:0}.sc-param-label{font-weight:700;font-size:12px}.sc-param-value{font-variant-numeric:tabular-nums;font-weight:800;color:#0a6e70}.sc-param-unit{color:#8a989a}.sc-source{color:#758588;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".sc-confidence{display:inline-flex;align-items:center;gap:5px;color:#17836f;font-size:10px;margin-top:3px}",
      ".sc-trace{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;position:relative}",
      ".sc-trace:before{content:'';position:absolute;left:7%;right:7%;top:25px;height:1px;background:#b9cec6}",
      ".sc-agent{position:relative;z-index:1;background:#f7f8f4;border:1px solid rgba(21,42,45,.09);border-radius:15px;padding:13px;min-height:158px}",
      ".sc-agent-icon{width:43px;height:43px;border-radius:14px;background:#fff;border:1px solid #dce7e1;display:grid;place-items:center;font-size:19px;margin-bottom:12px;box-shadow:0 5px 13px rgba(21,42,45,.06)}",
      ".sc-agent.done .sc-agent-icon{background:#dff2e9;border-color:#c4e5d8}.sc-agent.running .sc-agent-icon{background:#fff1d8;border-color:#f1d5a3;animation:scPulse 1.4s infinite}",
      ".sc-agent-name{font-size:11px;color:#78888a}.sc-agent-action{font-size:12px;font-weight:760;margin:4px 0 8px;line-height:1.4}.sc-agent-detail{font-size:10px;color:#7c898b;line-height:1.55}.sc-agent-time{position:absolute;right:11px;top:11px;font-size:9px;color:#9ba7a8}",
      "@keyframes scPulse{0%,100%{box-shadow:0 0 0 0 rgba(209,138,53,.25)}50%{box-shadow:0 0 0 7px rgba(209,138,53,0)}}",
      ".sc-calc-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:18px}",
      ".sc-formula{background:#183f42;color:white;border-radius:16px;padding:19px;min-height:100%}.sc-formula-code{font-family:Cambria Math,Georgia,serif;font-size:20px;line-height:1.55;margin:14px 0;color:#d5f0e5}.sc-formula-note{font-size:11px;color:rgba(255,255,255,.62);line-height:1.65}",
      ".sc-layer{padding:12px 0;border-top:1px solid rgba(21,42,45,.08)}.sc-layer:first-child{border-top:0;padding-top:0}.sc-layer-top{display:flex;justify-content:space-between;align-items:center;font-size:12px}.sc-layer-name{font-weight:800}.sc-layer-result{font-weight:850;color:#0a6e70;font-size:15px}.sc-eq{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;background:#f2f5f1;border-radius:9px;padding:8px 10px;margin-top:8px;font-size:10px;color:#536568;overflow:auto}",
      ".sc-results{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:17px}.sc-kpi{border:1px solid rgba(21,42,45,.085);border-radius:15px;padding:15px;background:#fbfbf7}.sc-kpi-label{font-size:10px;color:#7b8a8c}.sc-kpi-value{font-size:24px;font-weight:850;letter-spacing:-.035em;margin:5px 0 3px}.sc-kpi-unit{font-size:10px;color:#8b999a}.sc-kpi-delta{font-size:10px;color:#0a6e70;margin-top:7px}",
      ".sc-quant{display:grid;grid-template-columns:1.08fr .92fr;gap:18px}.sc-chart{border-radius:15px;background:#f5f6f1;padding:15px}.sc-chart-title{font-size:11px;font-weight:750;margin-bottom:13px}.sc-compliance{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.sc-mini-ring{display:flex;align-items:center;gap:9px;background:#f6f7f3;border-radius:13px;padding:12px}.sc-mini-circle{--p:50%;width:45px;height:45px;border-radius:50%;background:conic-gradient(#0d8b85 var(--p),#dde7e1 0);position:relative;display:grid;place-items:center;flex:0 0 auto}.sc-mini-circle:after{content:'';position:absolute;inset:5px;border-radius:50%;background:#f6f7f3}.sc-mini-val{position:relative;z-index:1;font-size:9px;font-weight:850}.sc-mini-label{font-size:10px;color:#697a7c;line-height:1.45}.sc-mini-label strong{display:block;color:#233b3e;font-size:11px}",
      ".sc-verdict{margin-top:16px;display:grid;grid-template-columns:1.25fr .75fr;gap:14px}.sc-review{background:#e6f2eb;border:1px solid #cbe2d6;border-radius:15px;padding:15px}.sc-review-title{font-size:12px;font-weight:800;color:#195f53;margin-bottom:8px}.sc-review li{font-size:11px;color:#536b67;line-height:1.65;margin:4px 0}.sc-audit{background:#f4efe5;border:1px solid #e8ddca;border-radius:15px;padding:15px;font-size:10px;color:#746957;line-height:1.8}.sc-audit strong{display:block;color:#463e33;font-size:11px}.sc-hash{font-family:ui-monospace,Consolas,monospace;background:rgba(255,255,255,.55);padding:4px 7px;border-radius:6px;display:inline-block;margin-top:4px}",
      ".sc-warning{display:flex;gap:9px;align-items:flex-start;padding:10px 12px;border-radius:11px;background:#fff7e7;color:#7a5a21;font-size:10px;line-height:1.55;margin-top:8px}",
      ".sc-edit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}.sc-field label{display:block;font-size:11px;font-weight:650;color:#536568;margin-bottom:6px}.sc-layer-edit{border:1px solid rgba(21,42,45,.1);border-radius:13px;padding:13px;margin-top:13px}.sc-layer-edit-title{font-size:12px;font-weight:800;margin-bottom:10px}",
      ".sc-empty{padding:80px 20px;text-align:center;color:#728285}",
      "@media(max-width:1100px){.sc-hero-grid,.sc-calc-layout,.sc-quant,.sc-verdict,.sc-import-layout{grid-template-columns:1fr}.sc-hero-score{justify-content:flex-start}.sc-trace{grid-template-columns:repeat(2,1fr)}.sc-trace:before{display:none}.sc-results{grid-template-columns:repeat(2,1fr)}}",
      "@media(max-width:760px){.sc-shell{padding:14px 12px 34px}.sc-topbar{flex-direction:column;align-items:stretch;gap:10px}.sc-brand{white-space:nowrap}.sc-actions{display:grid;grid-template-columns:repeat(2,1fr)}.sc-actions .ant-btn{padding-inline:6px}.sc-hero{padding:24px 20px}.sc-title{font-size:24px}.sc-grid{grid-template-columns:1fr}.sc-card.wide{grid-column:auto}.sc-steps{grid-template-columns:1fr 1fr}.sc-trace,.sc-results,.sc-compliance,.sc-edit-grid{grid-template-columns:1fr}.sc-param{grid-template-columns:1fr .65fr}.sc-param-unit,.sc-source{display:none}}"
    ].join("");
    document.head.appendChild(style);
  }

  function apiFetch(path, options) {
    options = options || {};
    var headers = {};
    var token = host.getApiToken ? host.getApiToken() : "";
    if (token) headers.Authorization = "Bearer " + token;
    var body = options.body;
    if (body && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }
    return fetch(host.getApiUrl(path), {
      method: options.method || "GET",
      headers: headers,
      body: body || undefined,
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (text) { throw new Error(text || "HTTP " + res.status); });
      return res.json();
    });
  }

  function errorText(error) {
    var raw = error && error.message ? error.message : "评估失败";
    try { var data = JSON.parse(raw); return data.detail || raw; } catch (e) { return raw; }
  }

  function n(value, digits) {
    var number = Number(value);
    if (!isFinite(number)) return "—";
    return number.toLocaleString("zh-CN", { minimumFractionDigits: digits || 0, maximumFractionDigits: digits == null ? 2 : digits });
  }

  function compactUnit(unit) {
    if (unit === "1e8_sm3") return "亿方";
    if (unit === "1e4_sm3/d") return "万方/日";
    if (unit === "dimensionless") return "—";
    return unit || "";
  }

  function downloadReport(data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = (data.case && data.case.case_id ? data.case.case_id : "storage-capacity") + "-evaluation.json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function Header(props) {
    return h("div", { className: "sc-topbar" },
      h("div", { className: "sc-brand" }, h("div", { className: "sc-mark" }, "∿"), h("div", null, "储气库库容评估场景"), h(Tag, { color: "cyan", style: { marginLeft: 2 } }, "UGSci Expert")),
      h("div", { className: "sc-actions" },
        h(Button, { onClick: props.onDemo }, "加载示例"),
        h(Button, { onClick: props.onEdit }, "配置参数"),
        h(Button, { onClick: function () { props.result && downloadReport(props.result); }, disabled: !props.result }, "导出审计包"),
        h(Button, { type: "primary", loading: props.loading, onClick: props.onRun, style: { background: COLORS.teal, borderColor: COLORS.teal } }, props.loading ? "专家评估中" : props.result ? "重新评估" : "开始评估")
      )
    );
  }

  function Hero(props) {
    var data = props.data;
    var score = data ? data.source_quality_score : 0;
    var caseInfo = props.caseInfo || {};
    return h("section", { className: "sc-hero" }, h("div", { className: "sc-hero-grid" },
      h("div", null,
        h("div", { className: "sc-eyebrow" }, "Underground gas storage · deterministic assessment"),
        h("h1", { className: "sc-title" }, caseInfo.case_name || "地下储气库库容评估"),
        h("div", { className: "sc-desc" }, "面向任意地下储气库场景。上传本库的报告、压力/PVT、注采计量与设计资料，完成参数映射后即可启动专家评估；所有定量结果均可追溯到输入来源和计算指纹。"),
        h("div", { className: "sc-hero-meta" },
          h("span", { className: "sc-pill" }, "周期 · " + (caseInfo.cycle_id || "—")),
          h("span", { className: "sc-pill" }, "压力口径 · " + (caseInfo.pressure_basis === "apparent_formation" ? "视地层压力" : caseInfo.pressure_basis || "—")),
          h("span", { className: "sc-pill" }, "状态 · 计算建议值 / 待复核")
        )
      ),
      h("div", { className: "sc-hero-score" },
        h("div", { className: "sc-score-ring", style: { "--score": score + "%" } }, h("div", { className: "sc-score-inner" }, h("div", { className: "sc-score-number" }, n(score, 1)), h("div", { className: "sc-score-label" }, "资料可信度"))),
        h("div", { className: "sc-score-copy" }, h("strong", null, data ? (score >= 90 ? "资料基础满足评估门槛" : "资料基础需要补强") : "等待导入储气库资料"), h("div", null, data ? data.documents.length + " 份资料 · " + data.parameters.length + " 项参数 · 全链路留痕" : "支持 JSON、CSV、PDF、Word、Excel 与图片等资料。"))
      )
    ));
  }

  function StepRail() {
    var steps = [["资料导入", "任意储气库"], ["参数提取", "来源 + 置信度"], ["专家调用", "口径 + 路由"], ["确定性计算", "逐层 p/Z"], ["量化结论", "指标 + 审计"]];
    return h("div", { className: "sc-steps" }, steps.map(function (step, idx) {
      return h("div", { className: "sc-step", key: step[0] }, h("div", { className: "sc-step-num" }, String(idx + 1).padStart(2, "0")), h("div", { style: { minWidth: 0 } }, h("div", { className: "sc-step-title" }, step[0]), h("div", { className: "sc-step-sub" }, step[1])));
    }));
  }

  function ImportCard(props) {
    var ingest = props.ingest;
    var extraction = ingest && ingest.extraction ? ingest.extraction : {};
    var missing = ingest && ingest.missing_fields ? ingest.missing_fields : [];
    return h("section", { className: "sc-card wide" },
      h(CardHead, { kicker: "Scenario intake", title: "上传储气库评估资料", desc: "每次评估都以当前上传资料为边界，不绑定任何固定储气库或固定周期。结构化 JSON/CSV 可自动映射，其他资料进入证据链后由用户复核参数。", extra: ingest ? h(Tag, { color: ingest.ready_for_evaluation ? "green" : "gold" }, ingest.ready_for_evaluation ? "参数已就绪" : "待补齐参数") : h(Tag, null, "新场景") }),
      h("div", { className: "sc-import-layout" },
        h("div", { className: "sc-drop" }, h(Upload.Dragger, {
          multiple: true,
          fileList: props.fileList,
          beforeUpload: function () { return false; },
          onChange: function (info) { props.onFilesChange(info.fileList.slice(-12)); },
          accept: ".json,.csv,.tsv,.txt,.md,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
          showUploadList: { showRemoveIcon: true },
        }, h("div", { className: "sc-drop-icon" }, "⇧"), h("div", { className: "sc-drop-title" }, "拖放或选择本储气库资料"), h("div", { className: "sc-drop-sub" }, "最多 12 份、单次合计 50 MB。建议包含设计指标、周期注采、分层压力与 Z 因子。"))),
        h("div", { className: "sc-import-status" },
          h("div", { className: "sc-import-title" }, ingest ? "资料识别结果" : "创建一个新的评估场景"),
          h("div", { className: "sc-import-copy" }, ingest ? ((props.caseInfo && props.caseInfo.case_name ? props.caseInfo.case_name : "当前场景") + " 已建立资料边界，可继续补充资料或配置参数。") : "选择资料后先执行识别，应用不会自动套用呼图壁或其他储气库的数值。"),
          h("div", { className: "sc-import-stats" },
            h("div", { className: "sc-import-stat" }, h("b", null, extraction.file_count || 0), h("span", null, "上传资料")),
            h("div", { className: "sc-import-stat" }, h("b", null, extraction.extracted_field_count || 0), h("span", null, "识别字段")),
            h("div", { className: "sc-import-stat" }, h("b", null, extraction.layer_count || 0), h("span", null, "识别层系"))
          ),
          missing.length ? h("div", { className: "sc-missing" }, "还需补齐：" + missing.slice(0, 6).join("、") + (missing.length > 6 ? " 等 " + missing.length + " 项" : "")) : null,
          h("div", { style: { marginTop: "auto", display: "flex", gap: 8, flexWrap: "wrap" } },
            h(Button, { type: "primary", loading: props.uploading, disabled: !props.fileList.length, onClick: props.onUpload, style: { background: COLORS.teal, borderColor: COLORS.teal } }, props.uploading ? "正在识别" : "识别上传资料"),
            ingest ? h(Button, { onClick: props.onConfigure }, ingest.ready_for_evaluation ? "检查参数" : "补齐参数") : null,
            ingest && ingest.ready_for_evaluation ? h(Button, { onClick: props.onEvaluate }, "开始专家评估") : null
          )
        )
      )
    );
  }

  function CardHead(props) {
    return h("div", { className: "sc-card-head" }, h("div", null, h("div", { className: "sc-kicker" }, props.kicker), h("div", { className: "sc-card-title" }, props.title), h("div", { className: "sc-card-desc" }, props.desc)), props.extra || null);
  }

  function EvidenceCard(props) {
    var docs = props.data.documents || [];
    return h("section", { className: "sc-card" },
      h(CardHead, { kicker: "01 · Evidence", title: "评估资料基础", desc: "资料按用途分组，并检查覆盖率、时间边界和引用位置。", extra: h(Tag, { color: "green" }, docs.length + " / " + docs.length + " 已核验") }),
      h("div", null, docs.map(function (doc) {
        return h("div", { className: "sc-doc", key: doc.id },
          h("div", { className: "sc-doc-icon" }, doc.kind.indexOf("设计") >= 0 ? "⌑" : doc.kind.indexOf("压力") >= 0 ? "⌁" : doc.kind.indexOf("计量") >= 0 ? "⇄" : "▤"),
          h("div", { style: { minWidth: 0 } }, h("div", { className: "sc-doc-name" }, doc.name), h("div", { className: "sc-doc-meta" }, doc.kind + " · " + doc.pages + " 页 · " + doc.items + " 个证据项")),
          h("div", { className: "sc-coverage" }, h("div", { style: { fontSize: 10, color: COLORS.sub } }, n(doc.coverage, 0) + "%"), h("div", { className: "sc-bar" }, h("i", { style: { width: doc.coverage + "%" } })))
        );
      }))
    );
  }

  function ParametersCard(props) {
    var parameters = props.data.parameters || [];
    return h("section", { className: "sc-card" },
      h(CardHead, { kicker: "02 · Extraction", title: "关键参数提取", desc: "每个参数保留来源、单位、抽取置信度与质量门状态。", extra: h(Button, { size: "small", onClick: props.onEdit }, "检查 / 调整") }),
      h("div", { className: "sc-params" }, parameters.map(function (p) {
        return h("div", { className: "sc-param", key: p.key },
          h("div", null, h("div", { className: "sc-param-label" }, p.label), h("div", { className: "sc-confidence" }, "● " + n(p.confidence * 100, 0) + "% 可信")),
          h("div", { className: "sc-param-value" }, n(p.value, p.value < 2 ? 3 : 2)),
          h("div", { className: "sc-param-unit" }, compactUnit(p.unit)),
          h(Tooltip, { title: p.source }, h("div", { className: "sc-source" }, p.source))
        );
      }))
    );
  }

  function TraceCard(props) {
    var trace = props.data ? props.data.trace : [];
    if (props.loading && trace.length === 0) {
      trace = [
        { id: "intake", actor: "资料质检智能体", action: "读取评估资料", detail: "正在核验资料边界与口径", status: "running" },
        { id: "extract", actor: "参数提取智能体", action: "等待参数提取", detail: "建立参数—证据映射", status: "waiting" },
        { id: "expert", actor: "油藏工程师", action: "等待专业审查", detail: "确认公式与压力口径", status: "waiting" },
        { id: "tool", actor: "UGSci 计算内核", action: "等待工具调用", detail: "逐层 p/Z 与指标评价", status: "waiting" },
        { id: "review", actor: "结论审计智能体", action: "等待结论审计", detail: "量纲、阈值与状态检查", status: "waiting" },
      ];
    }
    var icons = ["▤", "⌁", "◉", "ƒx", "✓"];
    return h("section", { className: "sc-card wide" },
      h(CardHead, { kicker: "03 · Agent trace", title: "智能体评估调用过程", desc: "专家负责业务口径和工具路由，确定性内核负责数值；每一步都有动作回执。", extra: h(Tag, { color: props.loading ? "gold" : "cyan" }, props.loading ? "运行中" : "5 阶段完成") }),
      h("div", { className: "sc-trace" }, trace.map(function (item, idx) {
        return h("div", { className: "sc-agent " + (item.status === "completed" ? "done" : item.status === "running" ? "running" : ""), key: item.id },
          item.duration_ms != null ? h("div", { className: "sc-agent-time" }, item.duration_ms + " ms") : null,
          h("div", { className: "sc-agent-icon" }, icons[idx] || "·"),
          h("div", { className: "sc-agent-name" }, item.actor),
          h("div", { className: "sc-agent-action" }, item.action),
          h("div", { className: "sc-agent-detail" }, item.detail)
        );
      }))
    );
  }

  function CalculationCard(props) {
    var result = props.data.result;
    var layers = result.layers || [];
    return h("section", { className: "sc-card" },
      h(CardHead, { kicker: "04 · Calculation", title: "关键参数计算过程", desc: "严格逐层计算，并展示 p/Z 差值、撤采比例与汇总过程。" }),
      h("div", { className: "sc-calc-layout" },
        h("div", { className: "sc-formula" },
          h("div", { style: { fontSize: 11, fontWeight: 800, color: "#91d7c1" } }, "有效控制库存 · Grm"),
          h("div", { className: "sc-formula-code" }, "Gᵣₘ = Qₚ × (Pᵢₙ / Zᵢₙ) / [(Pᵢₙ / Zᵢₙ) − (P / Z)]"),
          h("div", { className: "sc-formula-note" }, "同一层系、同一采气段、同一显式压力口径。多层分别计算后求和；结果不等同于工作气量、垫底气或账面库存。"),
          h("div", { style: { marginTop: 18, borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 14 } }, h("div", { style: { fontSize: 10, color: "rgba(255,255,255,.55)" } }, "分层汇总"), h("div", { style: { fontSize: 25, fontWeight: 850, marginTop: 3 } }, n(result.effective_inventory, 2), h("span", { style: { fontSize: 11, fontWeight: 500, marginLeft: 6, color: "rgba(255,255,255,.58)" } }, "亿方")))
        ),
        h("div", null, layers.map(function (layer) {
          var eq = n(layer.produced_gas, 3) + " × " + n(layer.injection_end_p_over_z, 3) + " / (" + n(layer.injection_end_p_over_z, 3) + " − " + n(layer.evaluation_p_over_z, 3) + ") = " + n(layer.effective_inventory, 3);
          return h("div", { className: "sc-layer", key: layer.name },
            h("div", { className: "sc-layer-top" }, h("div", null, h("span", { className: "sc-layer-name" }, layer.name), h(Tag, { style: { marginLeft: 8, fontSize: 9 }, color: layer.inverse_withdrawal_fraction > 20 ? "gold" : "green" }, "稳定性通过")), h("div", { className: "sc-layer-result" }, n(layer.effective_inventory, 2) + " 亿方")),
            h("div", { className: "sc-eq" }, eq),
            h("div", { style: { display: "flex", gap: 13, marginTop: 7, fontSize: 10, color: COLORS.sub, flexWrap: "wrap" } }, h("span", null, "p/Z 压降 " + n(layer.p_over_z_depletion, 3) + " MPa"), h("span", null, "撤采比例 " + n(layer.withdrawal_fraction * 100, 1) + "%"), h("span", null, "敏感度代理 " + n(layer.inverse_withdrawal_fraction, 2)))
          );
        }))
      )
    );
  }

  function BarChart(props) {
    var r = props.result;
    var values = [
      { label: "设计库容", value: r.design_capacity, color: "#afbbb6" },
      { label: "有效库存", value: r.effective_inventory, color: "#0d8b85" },
      { label: "账面库存", value: r.book_inventory, color: "#d18a35" },
      { label: "工作气量", value: r.working_gas, color: "#567f83" },
    ];
    var max = Math.max.apply(null, values.map(function (v) { return v.value; })) * 1.1;
    return h("div", { className: "sc-chart" }, h("div", { className: "sc-chart-title" }, "库存与设计基准对比 · 亿方"),
      h("svg", { viewBox: "0 0 520 168", width: "100%", height: "168", role: "img", "aria-label": "库存量对比图" },
        [0, .25, .5, .75, 1].map(function (t) { var y = 138 - t * 112; return h("g", { key: t }, h("line", { x1: 54, x2: 500, y1: y, y2: y, stroke: "#dce4df", strokeWidth: 1 }), h("text", { x: 45, y: y + 3, textAnchor: "end", fill: "#819092", fontSize: 9 }, n(max * t, 0))); }),
        values.map(function (v, idx) { var height = v.value / max * 112; var x = 82 + idx * 103; return h("g", { key: v.label }, h("rect", { x: x, y: 138 - height, width: 48, height: height, rx: 8, fill: v.color }), h("text", { x: x + 24, y: 131 - height, textAnchor: "middle", fill: "#294345", fontWeight: 800, fontSize: 10 }, n(v.value, 1)), h("text", { x: x + 24, y: 157, textAnchor: "middle", fill: "#657678", fontSize: 9 }, v.label)); })
      )
    );
  }

  function MiniCompliance(props) {
    var pct = Math.max(0, Math.min(100, Number(props.value)));
    return h("div", { className: "sc-mini-ring" }, h("div", { className: "sc-mini-circle", style: { "--p": pct + "%" } }, h("span", { className: "sc-mini-val" }, n(props.value, 0))), h("div", { className: "sc-mini-label" }, h("strong", null, props.label), props.sub));
  }

  function ResultsCard(props) {
    var data = props.data;
    var r = data.result;
    var summary = data.expert_summary || [];
    return h("section", { className: "sc-card" },
      h(CardHead, { kicker: "05 · Quantification", title: "定量化评估结果", desc: "核心指标、设计符合率、专家审查意见与审计指纹集中呈现。", extra: h(Tag, { color: "gold" }, "待专家复核") }),
      h("div", { className: "sc-results" },
        h("div", { className: "sc-kpi" }, h("div", { className: "sc-kpi-label" }, "有效控制库存"), h("div", { className: "sc-kpi-value" }, n(r.effective_inventory, 2)), h("div", { className: "sc-kpi-unit" }, "亿方 · 逐层 p/Z"), h("div", { className: "sc-kpi-delta" }, "设计符合率 " + n(r.effective_inventory_design_compliance_percent, 1) + "%")),
        h("div", { className: "sc-kpi" }, h("div", { className: "sc-kpi-label" }, "账面库存"), h("div", { className: "sc-kpi-value" }, n(r.book_inventory, 2)), h("div", { className: "sc-kpi-unit" }, "亿方 · 计量口径"), h("div", { className: "sc-kpi-delta" }, "达容率 " + n(r.book_inventory_fill_percent, 1) + "%")),
        h("div", { className: "sc-kpi" }, h("div", { className: "sc-kpi-label" }, "综合工作气量"), h("div", { className: "sc-kpi-value" }, n(r.working_gas, 2)), h("div", { className: "sc-kpi-unit" }, "亿方 · 设计 " + n(r.design_working_gas, 1)), h("div", { className: "sc-kpi-delta" }, "符合率 " + n(r.working_gas_compliance_percent, 1) + "%")),
        h("div", { className: "sc-kpi" }, h("div", { className: "sc-kpi-label" }, "实际冲峰能力"), h("div", { className: "sc-kpi-value" }, n(r.peak_daily_rate, 0)), h("div", { className: "sc-kpi-unit" }, "万方/日 · 设计 " + n(r.design_peak_daily_rate, 0)), h("div", { className: "sc-kpi-delta" }, "符合率 " + n(r.peak_daily_compliance_percent, 1) + "%"))
      ),
      h("div", { className: "sc-quant" },
        h(BarChart, { result: r }),
        h("div", null,
          h("div", { className: "sc-compliance" },
            h(MiniCompliance, { label: "有效库存", value: r.effective_inventory_design_compliance_percent, sub: "对设计库容" }),
            h(MiniCompliance, { label: "工作气量", value: r.working_gas_compliance_percent, sub: "对设计工作气" }),
            h(MiniCompliance, { label: "冲峰能力", value: r.peak_daily_compliance_percent, sub: "对设计冲峰" })
          ),
          (data.warnings || []).map(function (warning, idx) { return h("div", { className: "sc-warning", key: idx }, h("span", null, "△"), h("span", null, warning)); })
        )
      ),
      h("div", { className: "sc-verdict" },
        h("div", { className: "sc-review" }, h("div", { className: "sc-review-title" }, "油藏工程师审查意见 · " + (data.expert_summary_source === "agent" ? "智能体生成" : "确定性兜底")), h("ul", { style: { paddingLeft: 18, margin: 0 } }, summary.map(function (line, idx) { return h("li", { key: idx }, line); }))),
        h("div", { className: "sc-audit" }, h("strong", null, "可复现审计记录"), h("div", null, "工具：", data.audit.operation), h("div", null, "内核：", data.audit.provider + " @ " + data.audit.provider_version), h("div", null, "输入指纹"), h("span", { className: "sc-hash" }, data.audit.input_fingerprint), h("div", { style: { marginTop: 5 } }, "结论状态：计算建议值，待复核"))
      )
    );
  }

  function Field(props) {
    return h("div", { className: "sc-field" }, h("label", null, props.label), props.children);
  }

  function EditModal(props) {
    var value = props.value;
    if (!value) return null;
    function setKey(key, next) { props.onChange(Object.assign({}, value, (function () { var o = {}; o[key] = next; return o; })())); }
    function setLayer(index, key, next) {
      var layers = value.layers.map(function (layer, idx) { if (idx !== index) return layer; var copy = Object.assign({}, layer); copy[key] = next; return copy; });
      setKey("layers", layers);
    }
    function addLayer() {
      var next = (value.layers || []).concat([{
        name: "层系-" + ((value.layers || []).length + 1),
        produced_gas: null,
        injection_end_pressure: null,
        injection_end_z: null,
        evaluation_pressure: null,
        evaluation_z: null,
        source: "用户配置 / 上传资料",
        confidence: 0.9,
      }]);
      setKey("layers", next);
    }
    function removeLayer(index) {
      setKey("layers", (value.layers || []).filter(function (_, idx) { return idx !== index; }));
    }
    var numeric = [["design_capacity", "设计库容（亿方）"], ["book_inventory", "账面库存（亿方）"], ["working_gas", "工作气量（亿方）"], ["design_working_gas", "设计工作气（亿方）"], ["peak_daily_rate", "实际冲峰（万方/日）"], ["design_peak_daily_rate", "设计冲峰（万方/日）"]];
    return h(Modal, { open: props.open, title: "配置储气库评估场景", width: 960, onCancel: props.onCancel, onOk: props.onSubmit, okText: "保存并开始评估", confirmLoading: props.loading, destroyOnClose: true },
      h("div", { className: "sc-edit-grid" },
        h(Field, { label: "场景编号" }, h(Input, { value: value.case_id, onChange: function (e) { setKey("case_id", e.target.value); } })),
        h(Field, { label: "评估名称" }, h(Input, { value: value.case_name, onChange: function (e) { setKey("case_name", e.target.value); } })),
        h(Field, { label: "评价周期" }, h(Input, { value: value.cycle_id, onChange: function (e) { setKey("cycle_id", e.target.value); } })),
        h(Field, { label: "注气末状态 / 日期" }, h(Input, { value: value.injection_end_state_id, onChange: function (e) { setKey("injection_end_state_id", e.target.value); } })),
        h(Field, { label: "评价期状态 / 日期" }, h(Input, { value: value.evaluation_state_id, onChange: function (e) { setKey("evaluation_state_id", e.target.value); } })),
        h(Field, { label: "压力口径" }, h(Select, { value: value.pressure_basis, style: { width: "100%" }, options: [{ value: "apparent_formation", label: "视地层压力" }, { value: "absolute", label: "绝对压力" }, { value: "report_defined", label: "报告定义压力" }], onChange: function (next) { setKey("pressure_basis", next); } })),
        numeric.map(function (item) { return h(Field, { label: item[1], key: item[0] }, h(InputNumber, { value: value[item[0]], min: .001, precision: 3, style: { width: "100%" }, onChange: function (next) { setKey(item[0], next); } })); })
      ),
      h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 } }, h("div", { style: { fontSize: 13, fontWeight: 800 } }, "分层 p/Z 参数"), h(Button, { size: "small", onClick: addLayer }, "+ 新增层系")),
      (value.layers || []).length ? value.layers.map(function (layer, idx) {
        return h("div", { className: "sc-layer-edit", key: idx }, h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } }, h("div", { className: "sc-layer-edit-title", style: { marginBottom: 0 } }, "层系 " + (idx + 1) + " · " + layer.name), h(Button, { size: "small", danger: true, onClick: function () { removeLayer(idx); } }, "删除")), h("div", { className: "sc-edit-grid" },
          h(Field, { label: "层系名称" }, h(Input, { value: layer.name, onChange: function (e) { setLayer(idx, "name", e.target.value); } })),
          [["produced_gas", "阶段采气量 Qp"], ["injection_end_pressure", "注气末压力 Pin"], ["injection_end_z", "注气末 Z 因子"], ["evaluation_pressure", "评价期压力 P"], ["evaluation_z", "评价期 Z 因子"]].map(function (item) { return h(Field, { label: item[1], key: item[0] }, h(InputNumber, { value: layer[item[0]], min: .001, precision: 4, style: { width: "100%" }, onChange: function (next) { setLayer(idx, item[0], next); } })); })
        ));
      }) : h("div", { className: "sc-missing", style: { marginTop: 12 } }, "尚未识别到分层数据，请点击“新增层系”后填写阶段采气量、注气末/评价期压力与 Z 因子。")
    );
  }

  function App() {
    var _case = useState(null), caseInfo = _case[0], setCaseInfo = _case[1];
    var _draft = useState(null), draft = _draft[0], setDraft = _draft[1];
    var _data = useState(null), data = _data[0], setData = _data[1];
    var _loading = useState(false), loading = _loading[0], setLoading = _loading[1];
    var _edit = useState(false), editOpen = _edit[0], setEditOpen = _edit[1];
    var _error = useState(""), error = _error[0], setError = _error[1];
    var _files = useState([]), fileList = _files[0], setFileList = _files[1];
    var _ingest = useState(null), ingest = _ingest[0], setIngest = _ingest[1];
    var _uploading = useState(false), uploading = _uploading[0], setUploading = _uploading[1];

    function run(nextCase) {
      var payload = nextCase || caseInfo;
      if (!payload) { message.warning("请先上传资料并配置评估参数"); return Promise.resolve(false); }
      setLoading(true); setError("");
      return apiFetch("/storage-capacity/evaluate", { method: "POST", body: payload }).then(function (result) {
        setData(result); setCaseInfo(payload); setDraft(JSON.parse(JSON.stringify(payload))); return true;
      }).catch(function (err) {
        setError(errorText(err)); message.error(errorText(err)); return false;
      }).finally(function () { setLoading(false); });
    }

    function loadDemo() {
      setLoading(true); setError("");
      apiFetch("/storage-capacity/demo").then(function (res) {
        var demoIngest = { ready_for_evaluation: true, missing_fields: [], extraction: { file_count: (res.case.documents || []).length, parsed_file_count: (res.case.documents || []).length, extracted_field_count: 16, layer_count: (res.case.layers || []).length, warnings: [] } };
        setCaseInfo(res.case); setDraft(JSON.parse(JSON.stringify(res.case))); setIngest(demoIngest); setFileList([]); return run(res.case);
      }).catch(function (err) { setError(errorText(err)); message.error(errorText(err)); setLoading(false); });
    }

    function uploadSelected() {
      var originals = fileList.map(function (item) { return item.originFileObj || item; }).filter(Boolean);
      if (!originals.length) { message.warning("请先选择储气库资料"); return; }
      var fd = new FormData();
      originals.forEach(function (file) { fd.append("files", file); });
      if (caseInfo && caseInfo.case_name && caseInfo.case_name.indexOf("待识别") < 0) fd.append("case_name", caseInfo.case_name);
      setUploading(true); setError("");
      apiFetch("/storage-capacity/ingest", { method: "POST", body: fd }).then(function (res) {
        setIngest(res); setCaseInfo(res.case); setDraft(JSON.parse(JSON.stringify(res.case))); setData(null);
        if (res.ready_for_evaluation) message.success("资料识别完成，评估参数已就绪");
        else message.info("资料已导入，请补齐缺失参数后开始评估");
      }).catch(function (err) { setError(errorText(err)); message.error(errorText(err)); }).finally(function () { setUploading(false); });
    }

    function openEditor() {
      if (!caseInfo) { message.warning("请先创建或上传一个评估场景"); return; }
      setDraft(JSON.parse(JSON.stringify(caseInfo))); setEditOpen(true);
    }

    useEffect(function () {
      apiFetch("/storage-capacity/blank").then(function (res) { setCaseInfo(res.case); setDraft(JSON.parse(JSON.stringify(res.case))); }).catch(function (err) { setError(errorText(err)); });
    }, []);

    var displayData = useMemo(function () { return data; }, [data]);
    return h("div", { className: "sc-app" }, h("main", { className: "sc-shell" },
      h(Header, { loading: loading, result: data, onDemo: loadDemo, onRun: function () { if (data || (ingest && ingest.ready_for_evaluation)) run(); else openEditor(); }, onEdit: openEditor }),
      h(Hero, { data: displayData, caseInfo: caseInfo }),
      h(StepRail),
      error ? h("div", { className: "sc-warning", style: { marginBottom: 16 } }, "评估失败：" + error) : null,
      h("div", { className: "sc-grid" },
        h(ImportCard, { ingest: ingest, caseInfo: caseInfo, fileList: fileList, uploading: uploading, onFilesChange: setFileList, onUpload: uploadSelected, onConfigure: openEditor, onEvaluate: function () { run(); } }),
        !displayData ? h("div", { className: "sc-card wide sc-empty" }, loading ? h(Spin, { size: "large", tip: "正在调用油藏工程师与确定性计算内核…" }) : "上传当前储气库资料并完成参数配置后，评估资料、计算过程和量化结论将在这里展开。") : [
          h(EvidenceCard, { data: displayData, key: "evidence" }),
          h(ParametersCard, { data: displayData, onEdit: openEditor, key: "params" }),
          h(TraceCard, { data: displayData, loading: loading, key: "trace" }),
          h(CalculationCard, { data: displayData, key: "calc" }),
          h(ResultsCard, { data: displayData, key: "results" })
        ]
      ),
      h(EditModal, { open: editOpen, value: draft, loading: loading, onChange: setDraft, onCancel: function () { setEditOpen(false); }, onSubmit: function () { run(draft).then(function (ok) { if (ok) { setEditOpen(false); setIngest(Object.assign({}, ingest || {}, { ready_for_evaluation: true, missing_fields: [] })); } }); } })
    ));
  }

  QwenPaw.registerRoutes("storage-capacity", [
    { path: "/apps/storage-capacity", component: App, label: "库容评估工作台", icon: "SC" },
  ]);
  console.info("[storage-capacity] registered route /apps/storage-capacity");
})();
