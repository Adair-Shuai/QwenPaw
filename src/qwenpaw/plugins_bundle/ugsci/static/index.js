function z() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function bo() {
  try {
    return z().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ai(e) {
  return z().getApiUrl(e);
}
function vo(e) {
  const t = bo();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function Eo(e) {
  const t = new Headers(e), n = {};
  return t.forEach((r, a) => {
    n[a] = r;
  }), n;
}
function ct(e, t) {
  const n = z(), r = Eo(t == null ? void 0 : t.headers);
  return n.fetch ? n.fetch(e, { ...t, headers: r }) : fetch(n.getApiUrl(e), {
    ...t,
    headers: { ...vo(), ...r }
  });
}
const mn = /* @__PURE__ */ new Map(), wo = 15e3;
function xo(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function So(e, t, n) {
  return `${e}:${t}:${n}`;
}
function Ct() {
  mn.clear();
}
function Vn(e) {
  for (const [t, n] of mn)
    (e ? n.agentId === e : n.agentId) && mn.delete(t);
}
async function he(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...a } = t || {}, i = xo(
    a.headers
  ), s = So(n, e, i);
  if (n !== "GET" && (i ? Vn(i) : Ct()), n === "GET" && !r) {
    const d = mn.get(s);
    if (d && Date.now() - d.ts < wo)
      return d.data;
  }
  const l = await ct(e, a);
  if (!l.ok) {
    const d = await l.text().catch(() => "");
    throw new Error(d || `HTTP ${l.status}`);
  }
  if (l.status === 204) return null;
  const o = await l.json();
  return n === "GET" && mn.set(s, {
    data: o,
    ts: Date.now(),
    agentId: i || void 0
  }), o;
}
function ko({
  size: e = 16
}) {
  const t = z().React;
  return t.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": !0,
      focusable: "false",
      width: e,
      height: e
    },
    t.createElement("path", {
      d: "M2.75 8.3 9.1 4.4h12.15v11.15l-6.35 4.05H2.75Z"
    }),
    t.createElement("path", { d: "M2.75 8.3H14.9l6.35-3.9M14.9 8.3v11.3" }),
    t.createElement("path", {
      d: "M2.75 15.35c2.25 0 3.65-3.25 6.1-3.25 2.4 0 3.65 3.25 6.05 3.25l6.35-4"
    })
  );
}
function _o({ size: e = 16 }) {
  const t = z().React;
  return t.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": !0,
      focusable: "false",
      width: e,
      height: e
    },
    t.createElement("path", {
      d: "M3 17.45c3.8-.25 5.15-3.6 9-3.6s5.2 3.35 9 3.6M3 21.05c3.8-.25 5.15-3.6 9-3.6s5.2 3.35 9 3.6"
    }),
    t.createElement("path", {
      d: "M7.6 3.2v8.65m-2.85-2.8 2.85 2.8 2.85-2.8M16.4 11.85V3.2m-2.85 2.8 2.85-2.8 2.85 2.8"
    })
  );
}
function Co({
  size: e = 16
}) {
  const t = z().React;
  return t.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": !0,
      focusable: "false",
      width: e,
      height: e
    },
    t.createElement("path", {
      d: "m9 3.15 5.9 3.4v6.8L9 16.75l-5.9-3.4v-6.8Z"
    }),
    t.createElement("circle", { cx: "9", cy: "8.2", r: "1.65" }),
    t.createElement("path", { d: "M6.3 12.45q.35-1.85 2.7-1.85t2.7 1.85" }),
    t.createElement("path", { d: "M15.05 9.2h2.1m-3.6 6.05 3.2 2.65" }),
    t.createElement("circle", { cx: "19.2", cy: "9.2", r: "1.9" }),
    t.createElement("circle", { cx: "18.7", cy: "19.0", r: "2.05" })
  );
}
function To({ size: e = 16 }) {
  const t = z().React;
  return t.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": !0,
      focusable: "false",
      width: e,
      height: e
    },
    t.createElement("path", {
      d: "m11.4 2.75-7.15 4.1q-.65.37-.65 1.1v8.1q0 .73.65 1.1l7.15 4.1q.6.35 1.2 0l7.15-4.1q.65-.37.65-1.1v-8.1q0-.73-.65-1.1l-7.15-4.1q-.6-.35-1.2 0Z"
    }),
    t.createElement("circle", { cx: "12", cy: "9.4", r: "2.55" }),
    t.createElement("path", {
      d: "M7.7 16.35v-.35a3 3 0 0 1 3-3h2.6a3 3 0 0 1 3 3v.35"
    })
  );
}
function Mo({ size: e = 16 }) {
  const t = z().React;
  return t.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": !0,
      focusable: "false",
      width: e,
      height: e
    },
    t.createElement("circle", { cx: "9", cy: "8.35", r: "3.25" }),
    t.createElement("path", {
      d: "M2.75 19.5v-1.8a4.1 4.1 0 0 1 4.1-4.1h4.3a4.1 4.1 0 0 1 4.1 4.1v1.8Z"
    }),
    t.createElement("path", {
      d: "M15.1 4.5a3 3 0 1 1 0 6M16.75 12.9h.4a4.1 4.1 0 0 1 4.1 4.1v1.85H18.5"
    })
  );
}
function Io({ size: e = 16 }) {
  const t = z().React;
  return t.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": !0,
      focusable: "false",
      width: e,
      height: e
    },
    t.createElement("path", {
      d: "M8.65 12h3.5M15.8 5.75h-2.55q-1.1 0-1.1 1.1v10.3q0 1.1 1.1 1.1h2.55"
    }),
    t.createElement("path", { d: "m5.45 8.7 3.3 3.3-3.3 3.3-3.3-3.3Z" }),
    t.createElement("rect", {
      x: "15.8",
      y: "3.3",
      width: "6.25",
      height: "4.9",
      rx: ".8"
    }),
    t.createElement("rect", {
      x: "15.8",
      y: "15.8",
      width: "6.25",
      height: "4.9",
      rx: ".8"
    })
  );
}
const $i = `
.ugsci-expert-page>div:first-child{border-color:var(--app-border)!important;gap:12px;flex-wrap:wrap;}
.ugsci-expert-library button[class*="-btn-link"],.ugsci-expert-settings button[class*="-btn-link"]{color:var(--expert-primary)!important;}
@media(max-width:680px){.ugsci-expert-page{padding:16px!important;}}

.ugsci-expert-library,.ugsci-expert-settings,.ugsci-expert-introduction{color:var(--app-text,var(--app-card-text));--expert-line:var(--app-border,var(--app-border-subtle));--expert-muted:var(--app-text-secondary,var(--app-card-muted));--expert-surface:var(--app-surface,var(--app-surface));--expert-subtle:var(--app-surface-subtle,var(--app-fill-faint));--expert-primary:var(--app-action-link,var(--app-accent));}
.ugsci-expert-introduction :is([class*="-drawer-header"],[class*="-drawer-body"],[class*="-drawer-footer"]){background:var(--expert-surface);color:var(--app-text);border-color:var(--expert-line);}
.ugsci-expert-introduction-identity{display:flex;align-items:center;gap:16px;margin-bottom:24px;}
.ugsci-expert-introduction-identity h2{margin:0;font-size:20px;overflow-wrap:anywhere;}
.ugsci-expert-introduction-identity p{margin:4px 0 8px;color:var(--expert-muted);}
.ugsci-expert-introduction-section{border-top:1px solid var(--expert-line);padding-top:20px;margin-top:20px;font-size:14px;line-height:1.8;overflow-wrap:anywhere;white-space:pre-line;}
.ugsci-expert-introduction-section h3{margin:0 0 12px;font-size:15px;font-weight:600;}
.ugsci-expert-introduction-section h4{margin:0 0 4px;font-size:14px;}
.ugsci-expert-introduction-section ul{padding-left:20px;margin:0;}
.ugsci-expert-introduction-section li+li{margin-top:12px;}
.ugsci-expert-introduction-section summary{cursor:pointer;font-weight:500;}
.ugsci-expert-filters{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 18px;}
.ugsci-expert-filter{font:inherit;font-size:13px;padding:6px 11px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--expert-muted);cursor:pointer;}
.ugsci-expert-filter[aria-pressed=true]{color:var(--expert-primary);background:color-mix(in srgb,var(--expert-primary) 9%,var(--expert-surface));border-color:color-mix(in srgb,var(--expert-primary) 25%,var(--expert-line));}
.ugsci-expert-filter small{font-size:11px;margin-left:6px;}
.ugsci-expert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:14px;align-items:stretch;}
.ugsci-expert-card{width:100%;height:100%;border-radius:11px!important;border-color:var(--expert-line)!important;background:var(--expert-surface)!important;box-shadow:none!important;}
.ugsci-expert-card .ugsci-expert-card-top{display:flex;gap:10px;align-items:flex-start;min-width:0;}
.ugsci-expert-avatar-button{position:relative;display:inline-flex;border:1px solid transparent;border-radius:8px;padding:2px;background:transparent;color:inherit;cursor:pointer;flex-shrink:0;}
.ugsci-expert-avatar-button:hover,.ugsci-expert-avatar-button:focus-visible{border-color:var(--expert-primary);background:var(--expert-subtle);}
.ugsci-expert-avatar-button::after{content:'✎';position:absolute;bottom:-2px;right:-3px;font-size:11px;line-height:14px;background:var(--expert-surface);border-radius:50%;width:14px;height:14px;color:var(--expert-muted);}
.ugsci-expert-card .ugsci-expert-identity{flex:1;min-width:0;}
.ugsci-expert-name{display:block;border:0;background:none;padding:0;text-align:left;cursor:pointer;color:inherit;font:inherit;font-size:14px;font-weight:600;line-height:1.5;overflow-wrap:anywhere;}
.ugsci-expert-name:hover{text-decoration:underline;text-underline-offset:3px;}
.ugsci-expert-specialty{font-size:12px;color:var(--expert-muted);margin-top:3px;overflow-wrap:anywhere;}
.ugsci-expert-status{white-space:nowrap;font-size:11px;flex-shrink:0;}
.ugsci-expert-summary{font-size:13px;line-height:1.7;margin:18px 0 12px;min-height:44px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;}
.ugsci-expert-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;min-height:23px;font-size:12px;color:var(--expert-muted);}
.ugsci-expert-tag{font-size:11px;border-radius:4px;padding:2px 7px;background:color-mix(in srgb,var(--expert-primary) 8%,var(--expert-surface));color:var(--expert-primary);max-width:100%;overflow-wrap:anywhere;}
.ugsci-expert-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-top:1px solid var(--expert-line);padding-top:12px;margin-top:auto;}
.ugsci-expert-actions>button:first-child{margin-right:auto;color:var(--expert-muted);}
.ugsci-expert-library button[class*="-btn-primary"],.ugsci-expert-settings button[class*="-btn-primary"]{background:var(--app-action-bg,var(--app-accent))!important;border-color:var(--app-action-bg,var(--app-accent))!important;color:var(--app-action-fg,#fff)!important;box-shadow:none!important;}
.ugsci-expert-library button[class*="-btn-primary"]:disabled,.ugsci-expert-settings button[class*="-btn-primary"]:disabled{background:var(--expert-subtle)!important;border-color:var(--expert-line)!important;color:var(--expert-muted)!important;}
.ugsci-expert-settings [class*="-modal-content"]{height:min(760px,calc(100dvh - 32px));display:flex;flex-direction:column;padding:0!important;overflow:hidden;border:1px solid var(--expert-line);border-radius:11px!important;background:var(--expert-surface)!important;}
.ugsci-expert-settings [class*="-modal-header"]{flex-shrink:0;margin:0!important;padding:18px 24px;border-bottom:1px solid var(--expert-line);background:var(--expert-surface)!important;}
.ugsci-expert-settings [class*="-modal-body"]{display:flex;flex:1;flex-direction:column;min-height:0;padding:0!important;overflow:hidden;}
.ugsci-expert-settings [class*="-modal-footer"]{flex-shrink:0;}
.ugsci-expert-settings .ugsci-settings-tabs{flex:1;min-height:0;}
.ugsci-expert-settings-identity{display:flex;flex-shrink:0;align-items:center;gap:12px;padding:18px 24px;border-bottom:1px solid var(--expert-line);}
.ugsci-expert-settings-identity strong{font-size:15px;font-weight:500;overflow-wrap:anywhere;}
.ugsci-expert-settings-identity small{display:block;color:var(--expert-muted);margin-top:4px;overflow-wrap:anywhere;}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"]{background:var(--expert-subtle);width:165px;flex-shrink:0;padding:14px 8px;}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"] :is(.ant-tabs-tab,.qwenpaw-tabs-tab){margin:3px 0!important;padding:10px 12px!important;border-radius:6px;}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"] [class*="-tabs-tab-active"]{background:color-mix(in srgb,var(--expert-primary) 9%,var(--expert-surface));}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-content-holder"]{min-width:0;min-height:0;overflow:hidden;}
.ugsci-expert-settings .ugsci-settings-tabs [class*="-tabs-content"]{height:100%;}
.ugsci-expert-settings .ugsci-settings-tabs [class*="-tabs-tabpane"]{box-sizing:border-box;height:100%;padding:24px!important;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;}
.ugsci-expert-settings h3{font-size:17px;font-weight:500;margin:0 0 6px;}
.ugsci-expert-settings .ugsci-settings-intro{font-size:12px;color:var(--expert-muted);margin:0 0 22px;}
.ugsci-expert-settings-grid,.ugsci-config-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;min-width:0;}
.ugsci-expert-settings-grid label{display:flex;flex-direction:column;gap:7px;font-size:13px;min-width:0;}
.ugsci-expert-settings-grid .full{grid-column:1/-1;}
.ugsci-expert-settings .ugsci-config-section{border-bottom:1px solid var(--expert-line);margin-bottom:16px;}
.ugsci-expert-settings .ugsci-config-section>summary{font-size:14px;cursor:pointer;padding:14px 0;}
.ugsci-expert-settings .ugsci-settings-save{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;border-top:1px solid var(--expert-line);margin-top:24px;padding-top:16px;}
.ugsci-expert-settings .ugsci-settings-footer{padding:12px 24px;border-top:1px solid var(--expert-line);color:var(--expert-muted);font-size:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;}
.ugsci-expert-settings [class*="-space"]{max-width:100%;flex-wrap:wrap;}
.ugsci-expert-settings input,.ugsci-expert-settings textarea{max-width:100%;}
.ugsci-expert-settings [class*="-list-item"]{flex-wrap:wrap;gap:8px;}
.ugsci-expert-settings [class*="-list-item-action"]{margin-inline-start:0;}
@media(max-width:680px){.ugsci-expert-settings .ugsci-settings-tabs [class*="-tabs-ink-bar"]{display:none;}.ugsci-expert-settings .ugsci-settings-tabs :is(.ant-tabs-tab-active,.qwenpaw-tabs-tab-active){box-shadow:inset 0 0 0 1px var(--expert-primary);background:color-mix(in srgb,var(--expert-primary) 12%,var(--expert-surface));}.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"]{width:100%;padding:8px;}.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"] [class*="-tabs-nav-list"]{flex-wrap:wrap;transform:none!important;width:100%;}.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"] :is(.ant-tabs-tab,.qwenpaw-tabs-tab){margin:0!important;padding:8px 10px!important;}.ugsci-expert-settings .ugsci-settings-tabs [class*="-tabs-tabpane"]{padding:18px!important;min-height:0;}.ugsci-expert-settings-grid,.ugsci-config-pair{grid-template-columns:1fr!important;}.ugsci-expert-settings-identity{padding:16px 18px;}.ugsci-expert-settings [class*="-modal-header"]{padding-inline:18px;}.ugsci-expert-settings{max-width:calc(100vw - 16px)!important;}.ugsci-expert-settings .ugsci-settings-footer{padding-inline:18px;}}
@media(max-height:600px){.ugsci-expert-settings [class*="-modal-header"]{padding-block:12px;}.ugsci-expert-settings-identity{padding-block:10px;}.ugsci-expert-settings .ugsci-settings-footer{padding-block:8px;}}
`, Ia = {
  computer_use: "电脑操作",
  mailbox: "收件箱",
  "omp-roles": "油气专家角色",
  QA_source_index: "资料来源索引",
  accelerate: "分布式训练加速",
  "admet-prediction": "药物吸收与毒性预测",
  "admet-reasoning": "药物成药性推理",
  alicloud_cli: "阿里云命令行",
  astropy: "天文数据分析",
  "autoregressive-neural-pde-solver": "自回归神经偏微分方程求解",
  "bayesian-inference": "贝叶斯推断",
  "binding-affinity": "结合亲和力预测",
  "biorxiv-database": "生物预印本检索",
  brainstorming: "头脑风暴",
  "brainstorming-gatekeeper": "方案讨论审核",
  browser: "浏览器操作",
  browser_cdp: "浏览器调试控制",
  browser_visible: "可视浏览器操作",
  channel_message: "频道消息",
  chat_with_agent: "专家对话",
  "chembl-database": "生物活性数据库检索",
  chroma: "向量数据库",
  "citation-management": "参考文献管理",
  "conservation-law-discovery": "守恒定律发现",
  "convergence-diagnosis": "收敛诊断",
  cron: "定时任务",
  dask: "并行数据计算",
  datamol: "分子数据处理",
  deepchem: "化学深度学习",
  deepspeed: "深度学习训练加速",
  "denovo-design": "从头药物设计",
  diffdock: "扩散分子对接",
  "dimensional-analysis": "量纲分析",
  dingtalk_channel: "钉钉频道",
  "dispatching-parallel-agents": "并行专家调度",
  docx: "文档编辑",
  "drug-design": "药物设计",
  dspy: "语言模型程序优化",
  "dynamical-systems": "动力系统分析",
  "executing-plans": "计划执行",
  "exploratory-data-analysis": "探索性数据分析",
  faiss: "向量相似度检索",
  file_reader: "文件阅读",
  "finishing-a-development-branch": "开发分支收尾",
  "fluid-dynamics": "流体力学",
  fluidsim: "流体数值模拟",
  geopandas: "地理空间数据分析",
  guidance: "结构化生成控制",
  "hamiltonian-mechanics": "哈密顿力学",
  "hdf5-pde-data-loading": "偏微分方程数据加载",
  himalaya: "邮件管理",
  "history-matching": "历史拟合",
  "hugging-face-datasets": "机器学习数据集",
  hypogenic: "数据驱动假设生成",
  "hypothesis-generation": "科学假设生成",
  infographics: "信息图制作",
  "initialize-atlas-graph": "知识图谱初始化",
  langchain: "语言模型应用编排",
  "latex-posters": "学术海报排版",
  "literature-review": "文献综述",
  llamaindex: "知识检索索引",
  "make-skill": "技能创建",
  make_plan: "任务规划",
  "market-research-reports": "市场研究报告",
  matchms: "质谱匹配",
  matlab: "工程数值计算",
  matplotlib: "科学图表绘制",
  medchem: "药物化学分析",
  "ml-paper-writing": "机器学习论文写作",
  "molecular-docking": "分子对接",
  "molecular-optimization": "分子优化",
  "molecular-rag": "分子知识检索增强",
  "molecule-visualization": "分子可视化",
  molfeat: "分子特征提取",
  "multi-objective-optimization": "多目标优化",
  multi_agent_collaboration: "多专家协作",
  networkx: "复杂网络分析",
  "neural-operator": "神经算子",
  "ode-solver": "常微分方程求解",
  "office-documents": "办公文档处理",
  "officecli-docx": "命令行文档编辑",
  "officecli-pptx": "命令行演示文稿编辑",
  "officecli-reference": "办公命令参考",
  "officecli-xlsx": "命令行表格编辑",
  "oil-gas-delegation": "油气任务指派",
  "oil-gas-drilling": "油气钻井",
  "oil-gas-exploration": "油气勘探",
  "oil-gas-foundation": "油气基础知识",
  "oil-gas-midstream": "油气储运",
  "oil-gas-refining": "油气炼化",
  "oil-gas-reservoir-production": "油气藏开发与生产",
  "openalex-database": "开放学术文献检索",
  "paper-2-web": "论文网页制作",
  "pdb-database": "蛋白质结构数据库检索",
  "pde-solver": "偏微分方程求解",
  pdf: "便携文档处理",
  "peer-review": "同行评审",
  peft: "参数高效微调",
  "perplexity-search": "联网研究检索",
  "physics-databases": "物理数据库检索",
  "physics-fitting": "物理模型拟合",
  "physics-visualization": "物理可视化",
  "pinn-training": "物理信息神经网络训练",
  plotly: "交互图表绘制",
  "pocket-detection": "蛋白质口袋检测",
  polars: "高性能数据分析",
  pptx: "演示文稿制作",
  "pptx-posters": "演示海报制作",
  "pubchem-database": "化学物质数据库检索",
  pymatgen: "材料科学分析",
  pymc: "概率建模",
  pymoo: "多目标优化算法",
  pyopenms: "质谱数据分析",
  pytdc: "药物发现数据处理",
  "ray-data": "分布式数据处理",
  rdkit: "化学信息学",
  "receiving-code-review": "代码审查反馈处理",
  "requesting-code-review": "发起代码审查",
  "research-grants": "科研基金申请",
  "research-lookup": "科研资料检索",
  "reservoir-simulation-workflow": "油藏模拟工作流",
  "reservoir-visualization": "油藏可视化",
  "scada-timeseries": "生产监控时序分析",
  "scholar-evaluation": "学术成果评价",
  "scientific-brainstorming": "科研头脑风暴",
  "scientific-critical-thinking": "科学批判性思维",
  "scientific-schematics": "科学示意图绘制",
  "scientific-slides": "学术演示文稿",
  "scientific-visualization": "科学可视化",
  "scientific-writing": "科学论文写作",
  "scikit-learn": "机器学习建模",
  seaborn: "统计图表绘制",
  "segy-operations": "地震数据处理",
  "sensitivity-analysis": "敏感性分析",
  "sentence-transformers": "文本向量编码",
  shap: "模型可解释性分析",
  "shock-capturing-neural-operators": "激波捕捉神经算子",
  simpy: "离散事件仿真",
  "sindy-identification": "稀疏动力系统辨识",
  "smiles-validation": "分子表达式校验",
  "spectral-analysis": "频谱分析",
  "statistical-analysis": "统计分析",
  "statistical-mechanics": "统计力学",
  statsmodels: "统计模型分析",
  "storage-production-dynamics": "储气库生产动态分析",
  "structure-prediction": "分子结构预测",
  "subagent-driven-development": "子智能体驱动开发",
  "symbolic-regression": "符号回归",
  sympy: "符号数学计算",
  "synthetic-data-generation": "合成数据生成",
  "systematic-debugging": "系统化调试",
  "terraform-cli-setup": "基础设施命令行配置",
  "terraform-skill": "基础设施即代码",
  "test-driven-development": "测试驱动开发",
  torchdrug: "药物深度学习",
  transformers: "预训练模型应用",
  "ugsci-roles": "油气专家角色",
  "using-git-worktrees": "多工作树开发",
  "using-petropowers": "油气能力使用指南",
  "venue-templates": "期刊与会议模板",
  "verification-before-completion": "交付前验证",
  "wave-propagation": "波传播分析",
  "well-log-analysis": "测井分析",
  "writing-plans": "实施计划编写",
  "writing-skills": "技能编写",
  xlsx: "电子表格处理",
  "zarr-python": "分块数组存储"
};
function Oe(e) {
  const t = Ia[e] || Ia[e.replace(/-(?:zh|en)$/, "")];
  return typeof t == "string" ? t : e;
}
const Ao = {
  "Default Agent": "默认智能体",
  "QwenPaw-Data": "数据分析专家",
  "QA Agent": "质量审核专家",
  "CloudPaw-Master": "云端统筹专家",
  "CloudPaw-Executor": "云端执行专家",
  "CloudPaw-Verifier": "云端验证专家"
};
function Lr(e) {
  const t = Ao[e];
  return typeof t == "string" ? t : e;
}
const Fn = {};
(function(e) {
  const t = (f) => '<path fill-rule="evenodd" d="' + f + '"/>', n = (f, h = 5) => '<path d="' + f + '" fill="none" stroke="currentColor" stroke-width="' + h + '" stroke-linecap="round" stroke-linejoin="round"/>', r = (f, h, y, E, v = 0) => '<rect x="' + f + '" y="' + h + '" width="' + y + '" height="' + E + '" rx="' + v + '"/>', a = (f, h, y) => '<circle cx="' + f + '" cy="' + h + '" r="' + y + '"/>', i = (f, h, y, E = 5) => '<circle cx="' + f + '" cy="' + h + '" r="' + y + '" fill="none" stroke="currentColor" stroke-width="' + E + '"/>', s = (f, h, y, E) => ({ id: f, label: h, detail: y, art: E });
  function l(f, h, y, E, v, S) {
    const B = new Map(S.map((N) => [N.id, N.art]));
    return {
      id: f,
      label: h,
      code: y,
      cradle: E,
      motif: v,
      roles: S.map(({ id: N, label: w, detail: x }) => ({ id: N, label: w, detail: x })),
      crown: (N) => B.get(N) || S[0].art
    };
  }
  const o = l(
    "health",
    "医疗健康",
    "MED",
    "storage",
    "听诊器、心电波形与关节结构",
    [
      s(
        "clinical",
        "临床诊疗专家",
        "两根耳管汇入听诊软管，另一端连接圆形听诊头。",
        n(
          "M35 16v7q1 12 15 12t15-12v-7 M50 35v3q0 9 15 9h4q15 0 15-11v-3",
          5.5
        ) + a(36, 16, 3.8) + a(64, 16, 3.8) + i(86, 25, 7.2, 5)
      ),
      s(
        "monitoring",
        "健康监测专家",
        "中央心电波形与两端电极连成一条监测线。",
        n("M21 36h20l8-12 9 21 11-30 10 21h27", 5.4) + a(23, 36, 4.1) + a(104, 36, 4.1)
      ),
      s(
        "rehab",
        "运动康复专家",
        "两段支具围合膝关节，枢轴外侧标出活动弧度。",
        t("M41 15h11l16 13-6 7-17-11z M64 38l7-5 25 10-3 6-26-9z") + i(65, 33, 7, 5) + n("M37 28q3 12 14 18 M33 22l1 3", 4.5)
      )
    ]
  ), d = l(
    "life",
    "生命科学",
    "BIO",
    "geology",
    "双螺旋、显微镜与培养器皿",
    [
      s(
        "genomics",
        "基因组学专家",
        "两条螺旋链周期性交叉，粗连桥提示成对碱基。",
        n(
          "M21 18c14 0 18 26 34 26s21-26 37-26h12 M21 44c14 0 18-26 34-26s21 26 37 26h12",
          5.8
        ) + n("M51 25v12 M92 25v12", 4.5)
      ),
      s(
        "microscopy",
        "显微成像专家",
        "倾斜的物镜、弧形镜架和载物台组成显微镜。",
        t(
          "M46 19l11-8 5 5-3 3 10 12-9 8-11-13 2-2z M39 36h20v5H39z M35 44h52v5H35z"
        ) + n("M69 24c17-2 20 17 5 21", 5.8) + a(70, 24, 4.8)
      ),
      s(
        "biochemistry",
        "生化实验专家",
        "锥形瓶中的液面和一支倾斜滴管区分实验岗位。",
        t(
          "M43 14h20v5h-4v8l13 17q2 4-3 4H36q-4 0-2-4l14-17v-8h-5z M53 21v8l-6 8h14l-7-8v-8z"
        ) + t("M76 29l12-15 7 5-12 15-6 2-5 7-3-2 5-8z") + a(71, 45, 2.8)
      )
    ]
  ), c = l(
    "education",
    "教育培训",
    "EDU",
    "storage",
    "展开书页、讲板与答题卡",
    [
      s(
        "curriculum",
        "课程设计专家",
        "对称的书页向两侧展开，中缝保留书脊。",
        t(
          "M22 21q22-5 40 7v21Q46 39 22 41z M67 28q19-12 40-7v20q-24-2-40 8z M29 28v6q14-1 26 5v-6q-11-6-26-5z M75 33v6q11-6 25-5v-6q-15 0-25 5z"
        )
      ),
      s(
        "teaching",
        "课堂教学专家",
        "讲板横框立在两只支脚上，板上留出粉笔书写线。",
        t("M27 17h73v24H27z M33 23v12h61V23z") + n("M36 47l5-6 M90 47l-5-6 M39 29h15m7 0h10", 4.4) + r(79, 32, 12, 4)
      ),
      s(
        "assessment",
        "学习评价专家",
        "两道作答横线对应一列批改勾，顶端的夹扣固定试卷。",
        t("M31 19h22v-4h22v4h22v29h-6V25H37v23h-6z") + n("M43 31l3 3 5-6 M43 42l3 3 5-6 M59 31h24 M59 42h18", 3.9)
      )
    ]
  ), u = l(
    "finance",
    "金融财务",
    "FIN",
    "office",
    "算盘、行情烛线与核算凭证",
    [
      s(
        "accounting",
        "财务核算专家",
        "两根横杆穿过错落的算盘珠，矩形边框围住上下两排。",
        t("M22 16h84v32H22z M28 21v22h72V21z") + n("M28 27h72 M28 37h72", 3.5) + r(34, 22, 9, 10, 3) + r(48, 22, 9, 10, 3) + r(77, 32, 9, 10, 3) + r(63, 32, 9, 10, 3)
      ),
      s(
        "investment",
        "投资研究专家",
        "高低不同的三根实体烛线与上下影线绘出行情走势。",
        n("M37 30v18 M64 18v26 M91 12v26", 4.2) + r(30, 34, 14, 9, 1) + r(57, 23, 14, 15, 1) + r(84, 18, 14, 12, 1)
      ),
      s(
        "audit",
        "财务审计专家",
        "放大镜覆盖凭证的一角，留出两行待核的数据。",
        t("M26 17h49l10 10v3h-7v-2H69v-5H32v20h32v5H26z") + n("M39 30h18 M39 37h12", 3.8) + i(80, 35, 9, 5) + n("M87 42l9 6", 5.4)
      )
    ]
  ), m = l(
    "law",
    "法律合规",
    "LAW",
    "integrity",
    "天平、法槌与合规印章",
    [
      s(
        "counsel",
        "法律咨询专家",
        "中心支柱支撑两只秤盘，平衡梁形成宽阔的横向剪影。",
        n(
          "M64 15v29 M40 22l24-4 24 4 M39 23l-8 12m8-12 8 12 M89 23l-8 12m8-12 8 12",
          4.4
        ) + t(
          "M26 34h26q-2 8-13 8t-13-8z M76 34h26q-2 8-13 8t-13-8z M53 43h22l6 5H47z"
        ) + a(64, 16, 3.8)
      ),
      s(
        "disputes",
        "争议解决专家",
        "法槌斜举在底座上方，握柄与槌头形成直角。",
        t(
          "M42 16l9-5 14 23-9 6z M36 18l6-4 14 23-6 4z M54 12l4-3 14 23-4 3z"
        ) + n("M60 25l34 18", 6.4) + t("M28 46l4-6h23l5 6v2H28z")
      ),
      s(
        "compliance",
        "合规审查专家",
        "印章的拱形握柄和水平印面落在文件签核线上。",
        t("M54 34q6-5 5-10-1-10 8-10t8 10q-1 6 5 10l7 4v5H46v-5z") + n("M41 47h51 M27 28h18 M27 36h12", 4.4)
      )
    ]
  ), p = l(
    "design",
    "创意设计",
    "DSN",
    "geology",
    "钢笔笔尖、产品棱面与交互指针",
    [
      s(
        "visual",
        "视觉设计专家",
        "钢笔尖位于贝塞尔控制柄之间，中空墨孔沿中缝连到笔锋。",
        n("M25 21h78", 3.7) + r(21, 17, 8, 8, 1.1) + r(99, 17, 8, 8, 1.1) + t(
          "M54 16h20l8 16-18 18-18-18z M62 27q-4 3 0 6v10l2 3 2-3V33q4-3 0-6z"
        )
      ),
      s(
        "product",
        "产品设计专家",
        "两块可装配的等轴棱面错位叠放，外侧留出装配缝。",
        n(
          "M31 30l22-12 22 12-22 12z M31 30v7l22 12 22-12v-7 M53 42v6",
          4.8
        ) + n("M73 19l9-5 17 9-10 6 M86 32l13-8v8l-10 6", 4.5)
      ),
      s(
        "interaction",
        "交互设计专家",
        "界面含一行工具栏，操作指针从右下方覆盖内容区。",
        t(
          "M26 16h69v16h-6v-6H32v17h34v5H26z M32 20v3h7v-3z M43 20v3h7v-3z"
        ) + t("M72 27l25 11-11 3 4 7-5 2-4-8-6 7z")
      )
    ]
  ), b = l(
    "media",
    "传媒出版",
    "PUB",
    "office",
    "报刊版面、播音话筒与场记板",
    [
      s(
        "editorial",
        "编辑出版专家",
        "头版大标题、图文两栏和外侧折页形成报刊版面。",
        t(
          "M25 16h67v9h10v19q0 5-6 5H31q-6 0-6-6z M31 22v6h54v-6z M32 33v10h17V33z M56 33v4h28v-4z M56 40v3h21v-3z M92 30v12q0 3 2 3t2-3V30z"
        )
      ),
      s(
        "broadcast",
        "音频制作专家",
        "胶囊话筒坐在弧形支架上，两侧为逐级变化的声波。",
        r(56, 11, 16, 24, 8) + n("M49 24q0 16 15 16t15-16 M64 40v5 M54 47h20", 4.7) + n("M29 29v6 M37 23v17 M91 23v17 M99 29v6", 4.8)
      ),
      s(
        "film",
        "影视制作专家",
        "斜举的黑白拍板与矩形场记板之间留出开合空间。",
        t(
          "M27 26l67-15 2 9-67 15z M36 26l6-1 7 5-6 1z M57 21l6-1 7 5-6 1z M78 17l6-2 7 5-6 2z M29 36h68v13H29z M36 40v5h26v-5z M68 40v5h10v-5z"
        )
      )
    ]
  ), g = l(
    "commerce",
    "商业运营",
    "COM",
    "analysis",
    "店面遮阳篷、增长漏斗与采购纸箱",
    [
      s(
        "retail",
        "零售运营专家",
        "遮阳篷的三块布幅共享起伏的下沿，两侧立柱勾勒店面。",
        t(
          "M30 17h68l7 18q-1 7-10 7-8 0-10-6-3 6-11 6-7 0-10-6-3 6-10 6-8 0-11-6-2 6-10 6-9 0-10-7z M48 22l-4 10 6 1 3-11z M75 22l3 11 6-1-4-10z"
        ) + r(28, 40, 5, 8) + r(95, 40, 5, 8)
      ),
      s(
        "growth",
        "增长运营专家",
        "宽口漏斗依次收窄，右侧的上行箭头表示转化增长。",
        t("M25 17h55l-4 7H29z M33 29h39l-5 7H38z M43 41h20l-8 8h-6z") + n("M78 44l9-9 5 3 11-13", 5) + t("M94 22l12-2-1 12z")
      ),
      s(
        "procurement",
        "采购管理专家",
        "打开的纸箱露出两片箱盖，正面分区保留封箱接缝。",
        t("M25 26l15-10 25 9 26-9 13 10-16 11-24-8-23 8z") + t("M39 39l5 2 17-6v14l-22-6z M67 35l19 6 5-3v5l-24 7z")
      )
    ]
  );
  e.UGSciHumanSectors = [
    o,
    d,
    c,
    u,
    m,
    p,
    b,
    g
  ];
})(Fn);
(function(e) {
  const t = (g) => '<path fill-rule="evenodd" d="' + g + '"/>', n = (g, f = 5) => '<path fill="none" stroke="currentColor" stroke-width="' + f + '" stroke-linecap="round" stroke-linejoin="round" d="' + g + '"/>', r = (g, f, h, y, E = 0) => '<rect x="' + g + '" y="' + f + '" width="' + h + '" height="' + y + '" rx="' + E + '"/>', a = (g, f, h) => '<circle cx="' + g + '" cy="' + f + '" r="' + h + '"/>', i = (g, f, h, y = 5) => '<circle cx="' + g + '" cy="' + f + '" r="' + h + '" fill="none" stroke="currentColor" stroke-width="' + y + '"/>', s = (g, f, h) => ({ id: g, label: f, detail: h });
  function l(g) {
    const f = n("M43 20 27 33l16 12M85 20l16 13-16 12", 6.5);
    return g === "architecture" ? f + n("M64 20v11M52 42v-8h24v8", 4.5) + r(59, 14, 10, 9, 1.4) + r(48, 39, 8, 8, 1) + r(72, 39, 8, 8, 1) : g === "testing" ? f + n("m50 33 9 9 18-21", 6.6) : f + t("M68 14h7L60 48h-7Z");
  }
  function o(g) {
    return g === "monitoring" ? n("M25 46v-8c13-14 25-19 39-19s28 6 39 19v8", 6) + t(
      "M39 39q24-24 50 0-25 20-50 0Zm16-1a9 9 0 1 0 18 0 9 9 0 1 0-18 0Z"
    ) + a(64, 38, 4) : g === "response" ? t(
      "M25 45V29h10l7-11h25v6H46l-7 11h-8v10ZM97 45V32l-9-7v-7l15 12v15Z"
    ) + t("M66 15h15l-9 13h13L61 49l5-15H55Z") : n("M43 34V27c0-19 42-19 42 0v7", 7) + t("M30 30h68v18H30Zm29 9a5 5 0 0 0 3 4v3h4v-3a5 5 0 1 0-7-4Z") + r(22, 35, 5, 10, 1) + r(101, 35, 5, 10, 1);
  }
  function d(g) {
    return g === "line" ? t(
      "M25 35h78a6 6 0 0 1 0 12H25a6 6 0 0 1 0-12Zm1.5 6a3 3 0 1 0 6 0 3 3 0 1 0-6 0Zm68 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z"
    ) + t("M30 31V21l6-5h15v15ZM58 31V21l6-5h15v15Z") + r(87, 16, 7, 16, 2) : g === "maintenance" ? t("M30 38l10-11q-4-13 7-18l3 9 7 2 6-6q7 13-8 20l-14 15h-7Z") + n("M66 40a16 16 0 0 1 32 0", 6) + n("M82 40l7-10", 4.5) + r(64, 44, 37, 4, 1.5) : r(19, 42, 29, 6, 1.6) + t("M24 41 30 27l8 2 4 12Z") + n("M34 30 57 15l24 9", 7) + i(57, 15, 5.8, 4.5) + a(34, 30, 5) + n("M81 24l-4 11 7 7m-3-18 12 6-2 10", 5.7);
  }
  function c(g) {
    return g === "building" ? t("M22 37 57 14l21 12 12-8 18 13-4 5-14-10-11 7-21-11-32 21Z") + t("M31 40 37 36v11h-6ZM61 28l6 3v16h-6ZM91 31l6 4v12h-6Z") : g === "surveying" ? t(
      "M37 22 85 13l4 9-49 9Z M54 32l15-3 3 6h-7l-9 13h-7l10-13h-5ZM70 35h7l11 13h-7Z"
    ) + n("M36 24l2 8m50-20 2 11", 4) + r(26, 42, 13, 5, 1.4) + r(91, 42, 13, 5, 1.4) : t(
      "M17 41h15Q43 19 59 15q6-2 11 0 17 6 28 26h13v6H17Zm22 0h11V29q-7 6-11 12Zm16-16v16h7V21Zm12-4v20h7V24Zm12 6v14h12q-5-9-12-14Z"
    );
  }
  function u(g) {
    return g === "water" ? t(
      "M64 10q-14 14-14 21a14 14 0 0 0 28 0q0-8-14-21Zm7 18q2 8-6 10l1 4q11-3 9-14Z"
    ) + n("M23 43q7-6 15 0t15 0m22 0q8-6 16 0t15 0", 4.9) : g === "air" ? n(
      "M24 28h46q12 0 12-9c0-8-12-10-16-3m-31 20h52q12 0 12 10M22 44h32",
      5.8
    ) + a(28, 18, 3.5) : t(
      "M32 42Q38 17 65 17q15 0 29-7-2 34-25 38-16 2-25-5-4 3-8 6l-6-3q10-12 28-17l17-5q-25 1-43 18Z"
    ) + n("M23 48q10-10 18-14", 4.2);
  }
  function m(g) {
    return g === "irrigation" ? n("M64 46V30m0 4Q54 14 38 22m26 12q12-20 27-13", 5.6) + t(
      "M37 28q-9 9-9 12a6 6 0 0 0 12 0q0-4-3-12ZM94 27q-5 7-5 10a5 5 0 1 0 10 0q0-3-5-10Z"
    ) + r(48, 43, 32, 5, 2) : t(
      g === "orchard" ? "M27 38q-8-5-3-13 2-4 7-5 2-8 11-8 10 0 14 9 10 2 8 11-1 6-9 7h-8v9h-6v-9Zm50 2q-7-2-6-9 0-6 6-8 2-6 8-6 8-1 11 5 10 1 9 10 0 7-9 8h-6v8h-5v-8Z" : "M63 48V14h5v34Zm1-22Q50 23 47 15q13-1 17 11Zm1 10Q47 33 42 23q17-1 23 13Zm0 10Q47 43 39 33q19 0 26 13Zm2-22q4-10 16-14 0 11-16 14Zm0 10q7-13 23-16-1 13-23 16Zm0 11q6-13 24-16-3 12-24 16Z"
    );
  }
  function p(g) {
    return g === "warehouse" ? t(
      "M20 29 63 12l43 17-3 5-7-3v15h-7V28l-26-9-27 10v17h-7V31l-7 3Z"
    ) + t("M43 35h15v12H43Zm18-9h15v9H61Zm0 12h22v9H61Z") : g === "routing" ? n("M31 42h16q7 0 7-7v-4q0-7 8-7h13", 5) + t(
      "M89 13q-13 0-13 13 0 7 13 19 13-12 13-19 0-13-13-13Zm-5 13a5 5 0 1 0 10 0 5 5 0 1 0-10 0Z"
    ) + i(26, 42, 4.5, 4) : t(
      "M23 19h51v21H52q-2-6-9-6t-9 6H22Zm56 7h14l12 13v3h-7q-2-7-9-7t-9 7h-4V26Zm6 5v6h10l-5-6Z"
    ) + i(43, 42, 4.8, 4.2) + i(89, 42, 4.8, 4.2);
  }
  function b(g) {
    return g === "satellite" ? t(
      "M51 24 65 14l15 13-15 14Zm-28 10 21-14 7 10-21 14Zm52 3 21-15 9 10-21 16Z"
    ) + n("m44 32 10-6m18 6 10 4m-19 4-8 7", 4.4) : t(
      g === "propulsion" ? "M39 46q5-15 21-24 16-10 38-10-6 20-25 30-7 4-19 6l4-10-10-2Zm35-21a5 5 0 1 0 10 0 5 5 0 1 0-10 0ZM39 38l9-2-5 8-16 5ZM52 26q-6 0-14 5l6-10 18-1Z" : "M18 35l11-3 9 3 16-3L42 17l9-2 22 14 20-3q11-2 16 4-1 5-14 8l-25 3-5 7-10 1 3-7-23 1Z"
    );
  }
  e.UGSciEngineeringSectors = [
    {
      id: "software",
      label: "软件工程",
      code: "SWE",
      motif: "代码括号、分支与校验钩",
      cradle: "analysis",
      crown: l,
      roles: [
        s("development", "软件开发专家", "成对的代码括号包住倾斜的分隔线。"),
        s(
          "architecture",
          "软件架构专家",
          "括号中的主节点分出两条架构支路。"
        ),
        s("testing", "软件测试专家", "测试通过的对勾嵌入代码括号。")
      ]
    },
    {
      id: "security",
      label: "网络安全",
      code: "SEC",
      motif: "门锁、监测眼与响应闪电",
      cradle: "integrity",
      crown: o,
      roles: [
        s("access", "访问控制专家", "拱形锁梁扣入中央带钥匙孔的锁体。"),
        s("monitoring", "威胁监测专家", "防护拱下嵌入一只监测眼。"),
        s(
          "response",
          "应急响应专家",
          "防护框的开口露出表示快速处置的闪电。"
        )
      ]
    },
    {
      id: "manufacturing",
      label: "智能制造",
      code: "MFG",
      motif: "机械臂、输送带与检修仪表",
      cradle: "drilling",
      crown: d,
      roles: [
        s("robotics", "工业机器人专家", "双关节机械臂在底座上伸出夹爪。"),
        s("line", "产线规划专家", "两块工件排在带有两端滚轮的输送带上。"),
        s("maintenance", "设备维护专家", "开口扳手与指针仪表并列。")
      ]
    },
    {
      id: "civil",
      label: "建筑工程",
      code: "CIV",
      motif: "拱桥、屋架与测量仪",
      cradle: "office",
      crown: c,
      roles: [
        s("bridge", "桥梁结构专家", "拱肋和竖向吊杆共同托起水平桥面。"),
        s("building", "建筑设计专家", "高低错落的两座屋架由立柱支承。"),
        s("surveying", "工程测量专家", "略微倾斜的测量望远镜支在三脚架上。")
      ]
    },
    {
      id: "ecology",
      label: "生态环境",
      code: "ENV",
      motif: "叶脉、水波与风流线",
      cradle: "storage",
      crown: u,
      roles: [
        s(
          "restoration",
          "生态修复专家",
          "叶梢上扬，留白沿叶片弧度形成主脉。"
        ),
        s("water", "水环境专家", "一滴水落在两段连续水波之间。"),
        s("air", "空气监测专家", "水平气流分层延伸并在尾部回卷。")
      ]
    },
    {
      id: "agriculture",
      label: "现代农业",
      code: "AGR",
      motif: "麦穗、喷灌水流与果树冠",
      cradle: "geology",
      crown: m,
      roles: [
        s("breeding", "作物育种专家", "饱满的麦粒沿着穗轴左右排列。"),
        s(
          "irrigation",
          "智慧灌溉专家",
          "喷头向两侧送水，末端水滴单独可见。"
        ),
        s("orchard", "果园管理专家", "两棵不同高度的果树展开圆润树冠。")
      ]
    },
    {
      id: "logistics",
      label: "交通物流",
      code: "LOG",
      motif: "货车、仓顶与路线节点",
      cradle: "analysis",
      crown: p,
      roles: [
        s(
          "dispatch",
          "运输调度专家",
          "箱式货车的车厢、驾驶室和双轮连成一体。"
        ),
        s("warehouse", "仓储物流专家", "人字形仓顶下分层码放货箱。"),
        s("routing", "路径规划专家", "弯折路径从起点连接到定位标记。")
      ]
    },
    {
      id: "aerospace",
      label: "航空航天",
      code: "AER",
      motif: "机翼、太阳翼与推进尾焰",
      cradle: "drilling",
      crown: b,
      roles: [
        s("aircraft", "飞行器设计专家", "机翼从流线形机身后掠展开。"),
        s("satellite", "卫星系统专家", "两块平板太阳翼沿星体两侧展开。"),
        s("propulsion", "航天推进专家", "尖锥机体斜向上升，尾部留出喷流。")
      ]
    }
  ];
})(Fn);
(function(e) {
  const t = (C, I, L) => ({ id: C, label: I, detail: L }), n = [
    {
      id: "storage",
      label: "储气库",
      code: "UGS",
      motif: "背斜盖层、注采井与气藏剖面",
      roles: [
        t(
          "capacity",
          "库容评估专家",
          "双层背斜包裹含气区，偏置井线抵达储层。"
        ),
        t("cycling", "注采运行专家", "盖层两端嵌入方向相反的注采箭头。"),
        t("seal", "动态密封专家", "封闭的双层盖岩在构造顶部加厚。")
      ]
    },
    {
      id: "oil",
      label: "石油开发",
      code: "OIL",
      motif: "游梁、驴头与曲柄支架",
      roles: [
        t("lifting", "采油工程专家", "长游梁连接弧形驴头和曲柄配重。"),
        t(
          "recovery",
          "提高采收率专家",
          "游梁外伸，储层上方的回流箭头表示再动用。"
        ),
        t(
          "waterflood",
          "注水开发专家",
          "游梁与侧面的注水井组构成双井结构。"
        )
      ]
    },
    {
      id: "gas",
      label: "天然气",
      code: "GAS",
      motif: "管线弯头、法兰与调压仪表",
      roles: [
        t(
          "transmission",
          "管输调度专家",
          "两级弯头与出口法兰形成连续的输气路径。"
        ),
        t("pressure", "调压计量专家", "管汇中央嵌入圆形指针压力表。"),
        t("gathering", "集输工程专家", "两条支管接入同一根集气干线。")
      ]
    },
    {
      id: "office",
      label: "协同办公",
      code: "OFC",
      motif: "分层文件夹与折页",
      roles: [
        t("document", "公文写作专家", "前后叠放的文件页共用一个折角。"),
        t("schedule", "计划统筹专家", "两个装订环连接日历页与日期格。"),
        t("review", "合同审查专家", "签批页顶部保留折角和校阅对勾。")
      ]
    },
    {
      id: "geology",
      label: "地质勘探",
      code: "GEO",
      motif: "倾斜层理、断面与岩心",
      roles: [
        t("strata", "地层解释专家", "倾斜的层理在两翼错落露出。"),
        t("seismic", "地震解释专家", "连续波形叠在一层起伏的反射界面上。"),
        t("core", "岩心分析专家", "岩样圆柱露出椭圆顶面与倾斜层纹。")
      ]
    },
    {
      id: "drilling",
      label: "钻完井",
      code: "DRL",
      motif: "井架、钻柱与套管",
      roles: [
        t("drilling", "钻井工程专家", "三角井架展开，天车和交叉支撑居中。"),
        t(
          "trajectory",
          "井眼轨迹专家",
          "立架右侧的井眼由垂直段转入水平段。"
        ),
        t("completion", "完井工程专家", "井架下方露出逐级收缩的套管层级。")
      ]
    },
    {
      id: "analysis",
      label: "数据科学",
      code: "DAT",
      motif: "采样阵列、趋势线与数据机架",
      roles: [
        t("modeling", "建模分析专家", "分级的数据柱组成有节奏的阶梯轮廓。"),
        t("forecast", "时序预测专家", "折线穿过观测节点，指向延伸的趋势。"),
        t("quality", "数据质检专家", "横向机架上的校验格逐行对齐。")
      ]
    },
    {
      id: "integrity",
      label: "安全完整性",
      code: "INT",
      motif: "防护盾、隔离屏障与收尖护框",
      roles: [
        t(
          "formation",
          "地质体完整性专家",
          "分层屏障位于护盾中央，外框收成盾尖。"
        ),
        t(
          "wellbarrier",
          "井筒完整性专家",
          "护盾内嵌同心套管，表示多级井筒屏障。"
        ),
        t("risk", "风险预警专家", "三角告警标记嵌入防护盾的上缘。")
      ]
    }
  ], r = (C) => '<path d="' + C + '" fill-rule="evenodd"/>', a = (C, I) => '<path d="' + C + '" fill="none" stroke="currentColor" stroke-width="' + I + '" stroke-linejoin="round" stroke-linecap="round"/>', i = (C, I, L, M, P = 0) => '<rect x="' + C + '" y="' + I + '" width="' + L + '" height="' + M + '" rx="' + P + '"/>', s = (C, I, L) => '<circle cx="' + C + '" cy="' + I + '" r="' + L + '"/>', l = (C, I, L, M) => '<circle cx="' + C + '" cy="' + I + '" r="' + L + '" fill="none" stroke="currentColor" stroke-width="' + M + '"/>', o = {
    storage: "M18 57 24 51H31V75C31 85 37 92 48 92H80C91 92 97 85 97 75V51H104L110 57V76C110 95 99 106 81 106H47C29 106 18 95 18 76Z",
    oil: "M16 56 23 49 30 53V75C30 85 38 92 48 92H81Q98 92 98 75V50L106 53 111 63 108 80Q105 106 81 106H47Q24 106 20 86L16 77Z",
    gas: "M17 57H31V74Q31 92 49 92H79Q97 92 97 74V57H111V76Q111 106 81 106H47Q17 106 17 76Z",
    office: "M18 57 24 51H31V76Q31 86 39 90L47 93H81L97 79V52H105L110 57V84L88 105H44L28 99 18 86Z",
    geology: "M18 58 24 51H31V74L39 85 49 92H80Q97 90 97 75V51H104L111 59 108 82 99 98 83 106H47L30 100 19 86Z",
    drilling: "M17 59 24 50H31V75L40 87 48 92H80L88 87 97 75V50H104L111 59 108 81 96 98 81 106H47L32 98 20 81Z",
    analysis: "M18 56 23 51H31V77L37 87 47 92H81L91 87 97 77V51H105L110 56V83L99 98 84 106H44L29 98 18 83Z",
    integrity: "M19 55 26 50H32V73Q32 83 43 88L64 97 85 88Q96 83 96 73V50H102L109 55V76Q109 92 92 100L64 113 36 100Q19 92 19 76Z"
  };
  function d(C) {
    return C === "cycling" ? r("M24 46Q62 9 104 46H94Q63 21 35 46Z M40 47Q64 27 89 47Z") + r(
      "M22 24H28V33H34L25 43 16 33H22Z M97 27 106 17 115 27H109V36H103V27Z"
    ) : C === "seal" ? r(
      "M20 46Q32 34 44 26Q55 19 64 18Q81 19 107 46H96Q75 28 64 27Q52 28 31 46Z M36 47Q63 21 91 47Z"
    ) + r("M55 18V14L64 10 73 14V18L64 23Z") : r("M20 47Q64 1 108 47H98Q64 14 30 47Z M37 48Q64 21 91 48Z") + r("M79 15H92V19H88V33L83 29V19H79Z");
  }
  function c(C, I, L, M) {
    return r(C) + r(I) + s(L, M, 3.7);
  }
  function u(C) {
    return C === "recovery" ? c(
      "M30 23 90 17 94 22 34 29Z",
      "M23 21Q27 17 33 20L38 26Q34 34 29 39L23 37Q27 29 23 21Z",
      57,
      24
    ) + r("M54 26H60L71 48H63L57 34 49 48H42Z") + a("M86 24 90 35", 3.8) + r("M78 36Q90 31 99 40L104 37 104 48H92L96 44Q89 38 80 43Z") : C === "waterflood" ? c(
      "M29 17 77 25 81 31 34 23Z",
      "M25 15Q32 13 36 19L35 27 28 37 24 35Q28 24 25 15Z",
      53,
      24
    ) + r("M50 27H56L66 48H59L53 34 47 48H40Z") + a("M73 29 73 44", 3.8) + r("M87 33H93V40H98V28H94L101 20 108 28H104V46H87Z") : c(
      "M28 18 88 27 96 34 32 25Z",
      "M22 18Q27 13 33 16L38 24Q36 32 29 40L22 39Q28 26 22 18Z",
      56,
      24
    ) + r("M52 28H60L71 48H63L56 34 49 48H41Z") + a("M87 32 85 43", 4.3) + r("M76 45Q77 35 87 36Q96 37 97 46Z");
  }
  function m(C) {
    return C === "pressure" ? a("M25 47V40H49M77 40H101V48", 7) + l(63, 31, 13, 5.2) + a("M63 32 69 24", 3.9) + s(63, 32, 2.6) + i(23, 35, 4.6, 10, 1) + i(97, 35, 6, 10, 1) : C === "gathering" ? a("M28 24H41L63 42H98M32 46H43L54 38M76 24V42", 6.8) + i(25, 18, 5, 13, 1) + i(70, 20, 12, 5, 1) + i(94, 34, 5, 16, 1) : a("M23 45H45V34Q45 26 54 26H82V39Q82 43 87 43H104", 7.6) + i(22, 38, 5, 14, 1) + i(59, 19, 5.5, 15, 1) + i(98, 35.5, 5.5, 15, 1);
  }
  function p(C) {
    return C === "schedule" ? r("M27 25H101V48H95V35H33V48H27Z") + i(38, 17, 7, 14, 3) + i(83, 17, 7, 14, 3) + i(40, 38, 10, 8, 1.3) + i(57, 38, 10, 8, 1.3) + i(74, 38, 10, 8, 1.3) : C === "review" ? r("M30 47V20H79L95 34V47H89V36H75V26H36V47Z M79 27V32H85Z") + a("M43 36 49 42 61 31", 5) : r("M25 47V28H32V21H76V25H38V28H80L94 41V48H88V42H77V34H31V47Z") + a("M40 42H63", 3.6) + r("M61 16H81L99 32V43H95V34L79 20H61Z");
  }
  function b(C) {
    return C === "seismic" ? a("M20 35H34L43 27 51 41 61 17 72 41 81 29 89 35H105", 4.8) + r(
      "M22 47Q37 44 50 47Q65 50 76 44Q91 36 105 40L104 46Q94 44 82 49L74 51H49Q38 46 24 51Z"
    ) : C === "core" ? r(
      "M43 26Q43 17 62 16Q82 16 84 25V43Q81 51 64 51Q46 51 43 43Z M49 25Q50 28 63 28Q75 28 78 25Q75 22 63 22Q52 22 49 25Z M49 42Q60 40 78 32V37Q66 43 52 46Z"
    ) + r("M24 44 37 39V45L26 49Z M88 38 102 33V40L88 46Z") : r(
      "M19 41 39 35Q48 33 54 28L68 17 76 20Q80 24 87 21L103 15 107 22 90 28Q80 31 72 26L59 35Q51 41 42 43L24 48Z M36 49 53 42Q62 39 72 31Q81 36 92 31L105 27 106 34 91 39Q80 43 74 39L60 48 55 50Z M76 48 104 39 103 46 88 51H76Z"
    );
  }
  const g = r("M43 48 56 18H73L86 48H78L68 24H61L51 48Z") + i(54, 15, 21, 5, 1) + a("M56 37 72 29M55 35 74 42", 3.7);
  function f(C) {
    return C === "trajectory" ? r("M31 47 44 18H58L72 47H64L54 24H49L39 47Z") + i(42, 15, 18, 5, 1) + a("M43 37 57 29", 4) + a("M81 20V31Q81 42 92 42H103", 5.4) + r("M97 35 107 42 97 49Z") : C === "completion" ? r("M38 41 53 19H75L90 41H81L71 26H58L47 41Z") + i(51, 16, 26, 5, 1) + i(51, 36.5, 26, 5.3, 1.2) + i(55, 44, 18, 5.6, 1.2) + r("M41 44H48V49H37Z M80 44H87L91 49H80Z") : g + i(38, 44, 15, 5.5, 1) + i(76, 44, 15, 5.5, 1);
  }
  function h(C) {
    return C === "forecast" ? a("M24 42 41 31 56 38 77 22 96 26", 5.2) + s(24, 42, 4.3) + s(41, 31, 4.3) + s(56, 38, 4.3) + s(77, 22, 4.3) + r("M92 18 107 27 91 33Z") : C === "quality" ? r(
      "M26 20H90L102 30V33H26Z M34 24V29H40V24Z M47 24V29H63V24Z M26 38H102V48H26Z M34 41V45H40V41Z M47 41V45H63V41Z"
    ) + a("M84 40 88 44 96 37", 2.8) : i(24, 36, 12, 12, 1.6) + i(41, 26, 12, 22, 1.6) + i(58, 16, 12, 32, 1.6) + i(75, 22, 12, 26, 1.6) + i(92, 32, 12, 16, 1.6);
  }
  function y(C) {
    const I = r(
      "M22 40 44 29 46 36 26 47H21Z M83 29 106 40 107 47H102L81 36Z"
    );
    return C === "risk" ? I + r(
      "M63 13Q65 12 67 15L86 43Q87 46 84 47H44Q41 47 42 44L61 15Z M61.1 24H66.8L66 35H62Z M61.8 38H66V42H61.8Z"
    ) : C === "wellbarrier" ? I + r(
      "M43 21 64 13 85 21V32Q85 44 64 51Q43 44 43 32Z M57 24V35Q57 39 64 42Q71 39 71 35V24H67V34L64 37 61 34V24Z"
    ) : I + r(
      "M43 21 64 13 85 21V32Q85 44 64 51Q43 44 43 32Z M49 26 64 20 79 26V31L64 25 49 31Z M52 34 64 29 76 34 73 37 64 34 55 38Z"
    );
  }
  const E = {
    storage: d,
    oil: u,
    gas: m,
    office: p,
    geology: b,
    drilling: f,
    analysis: h,
    integrity: y
  };
  for (const C of [
    ...e.UGSciHumanSectors || [],
    ...e.UGSciEngineeringSectors || []
  ]) {
    const { id: I, label: L, code: M, motif: P, roles: W, crown: G, cradle: U } = C;
    n.push({ id: I, label: L, code: M, motif: P, roles: W }), E[I] = G, o[I] = o[U] || o.storage;
  }
  const v = new Map(n.map((C) => [C.id, C])), S = [
    { id: "auto", label: "跟随领域" },
    { id: "round", label: "圆弧" },
    { id: "faceted", label: "切角" },
    { id: "shield", label: "盾形" },
    { id: "industrial", label: "机甲" }
  ], B = {
    round: r(
      "M15 59Q15 50 23 50H30V71Q30 93 51 94H77Q98 93 98 71V50H105Q113 50 113 59V73C113 94 99 110 80 110H48C29 110 15 94 15 73Z"
    ),
    faceted: r(
      "M15 59 24 49H31V74L44 90H84L97 74V49H104L113 59V79L91 106H37L15 79Z"
    ),
    shield: r(
      "M18 59 23 52 32 49V74Q32 82 43 87L64 96 85 87Q96 82 96 74V49L105 52 110 59V77Q110 91 95 99L64 115 33 99Q18 91 18 77Z"
    ),
    industrial: r(
      "M15 54 20 49H31V77L36 84 45 91H83L92 84 97 77V49H108L113 54V81L104 96 91 104H82L78 110H50L46 104H37L24 96 15 81Z M19 57H27V61H19Z M19 66H27V70H19Z M101 57H109V61H101Z M101 66H109V70H101Z"
    )
  }, N = [
    { id: "none", label: "无徽记" },
    { id: "analysis", label: "数据分析" },
    { id: "teaching", label: "教学培训" },
    { id: "research", label: "科研实验" },
    { id: "coding", label: "软件开发" },
    { id: "safety", label: "安全审查" },
    { id: "documents", label: "文档写作" },
    { id: "planning", label: "项目管理" },
    { id: "operations", label: "现场运维" },
    { id: "collaboration", label: "协同沟通" },
    { id: "design", label: "创意设计" }
  ], w = {
    analysis: i(8, 18, 4.5, 7, 1) + i(15.5, 12.5, 4.5, 12.5, 1) + i(23, 8, 4.5, 17, 1),
    teaching: r(
      "M6.5 9Q13 7.8 18 12Q23.5 7.8 29.5 9V23.7Q23.4 22.4 18 26.5Q12.8 22.4 6.5 23.7Z M9.8 12V20.5Q13 20.4 16.4 22.3V14.2Q13.4 12 9.8 12Z M19.6 14.2V22.3Q23 20.4 26.2 20.5V12Q22.6 12 19.6 14.2Z"
    ),
    research: a(
      "M14 7.9H22M15.6 8.5V14.5L8.8 25Q8.1 26.6 10.4 27H25.6Q27.9 26.6 27.2 25L20.4 14.5V8.5M12.4 21.5H23.6",
      2.9
    ),
    coding: a("M13 11 6.9 18 13 25M23 11 29.1 18 23 25M20.5 9 16 27", 3.1),
    safety: a(
      "M18 6.8 27.7 10.7V16.8Q27.7 23.6 18 28.7Q8.3 23.6 8.3 16.8V10.7Z",
      2.8
    ) + a("M12.7 17.4 16.5 20.9 23 14.3", 3),
    documents: a(
      "M10 7.8H20.8L26 13V27.3H10Z M20 8.3V14H25.3M14 18.5H21.8M14 23H20",
      2.75
    ),
    planning: a("M10 28V8.4", 3.3) + r("M11.7 8.5H26.8L22.7 13.7 26.8 18.7H11.7Z"),
    operations: r(
      "M25.4 7.3C19.2 5.2 14 10.4 15.1 15.6L7.7 23.1Q5.9 25.4 8.1 27.6Q10.3 29.8 12.6 28L20.1 20.6C25.7 21.8 30.8 16.5 28.2 10.4L23.2 15.3 19.8 12.4Z"
    ),
    collaboration: a(
      "M7.3 8.8H21.5Q23.1 8.8 23.1 10.6V17.9Q23.1 19.8 21.2 19.8H14.4L9.5 24.2V19.8H8.2Q6.8 19.8 6.8 18.1V10.7Q6.8 9.4 7.3 8.8Z M27.7 14V23Q27.7 24.3 26.4 24.3H24V28.2L18.4 24.3H15.9",
      2.8
    ),
    design: r(
      "M7.8 27.8 10.2 17.6 22.6 7.2 29 13.8 18 25.6Z M14 18.9 12.9 23.2 17 21.9 24.1 14.1 21.8 11.9Z"
    )
  };
  let x = 0;
  function R(C, I, L, M) {
    const P = M || "ugsci-stamp-" + (++x).toString(36);
    return '<defs><clipPath id="' + P + '"><path clip-rule="evenodd" d="' + "M0 0H128V128H0Z M77 95a20 20 0 1 0 40 0a20 20 0 1 0 -40 0Z" + '"/></clipPath></defs><g clip-path="url(#' + P + ')">' + C + '</g><g transform="translate(79 77)">' + L("badge_ring", l(18, 18, 15.9, 3.4)) + L("badge", w[I]) + "</g>";
  }
  const H = {
    focused: "M49 65a3.7 3.7 0 0 1 7.4 0v9.1a3.7 3.7 0 0 1-7.4 0Z M71.6 65a3.7 3.7 0 0 1 7.4 0v9.1a3.7 3.7 0 0 1-7.4 0Z",
    friendly: "M46.2 71.4q6.2-13 12.5 0l-3.2 2.5q-3-5.8-6.1 0Z M69.3 71.4q6.2-13 12.5 0l-3.2 2.5q-3-5.8-6.1 0Z",
    thinking: "M46.3 66.2 57.1 63l1.3 5.1-10.8 3.2Z M71.6 66a3.7 3.7 0 0 1 7.4 0v7.5a3.7 3.7 0 0 1-7.4 0Z"
  }, _ = {
    classic: "M46 55H78L92 66V75Q92 86 82 86H46Q36 86 36 76V65Q36 55 46 55Z",
    soft: "M57 55H75L89 64Q94 68 90 75Q83 86 66 88Q47 88 39 80Q32 72 38 63Q44 55 57 55Z",
    angular: "M44 55H77L92 65V77L82 86H46L36 77V63Z"
  };
  function T(C, I) {
    if (typeof C != "string") return I;
    const L = Array.from(
      C.replace(/[\u0000-\u001f\u007f-\u009f\ud800-\udfff\ufffe\uffff]/gu, " ").trim()
    ).slice(0, 64).join(""), M = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;"
    };
    return L.replace(/[&<>"']/g, (P) => M[P]) || I;
  }
  function $(C) {
    const I = C && typeof C == "object" ? C : {}, L = v.get(I.domain) || n[0], M = L.roles.find((xe) => xe.id === I.role) || L.roles[0], P = Object.prototype.hasOwnProperty.call(H, I.expression) ? I.expression : "focused", W = I.polarity === "dark", G = I.foreground === "currentColor" ? "currentColor" : W ? "#ffffff" : "#171717", U = W ? "#171717" : "#ffffff", Q = I.colors && typeof I.colors == "object" ? I.colors : {}, D = (xe, Ie) => {
      const _e = Q[xe];
      return typeof _e == "string" && /^#[0-9a-f]{6}$/i.test(_e) ? _e : (xe === "eyes" || xe === "background") && _e === "transparent" ? "transparent" : Ie;
    }, Y = (xe, Ie, _e = G) => {
      const oe = D(xe, _e);
      return '<g data-avatar-part="' + xe + '" fill="' + oe + '" color="' + oe + '">' + Ie + "</g>";
    }, ne = Number.isFinite(Number(I.size)) && Number(I.size) > 0 ? Math.max(16, Math.min(4096, Math.round(Number(I.size)))) : 512, re = Object.prototype.hasOwnProperty.call(_, I.visor) ? _[I.visor] : _.classic, se = T(I.name, M.label), X = v.get(I.crownDomain) || L, pe = X.roles.find((xe) => xe.id === I.crownRole) || (X === L ? M : X.roles[0]), ye = Object.prototype.hasOwnProperty.call(
      B,
      I.shell
    ), q = ye ? B[I.shell] : r(o[L.id]), j = !ye && L.id === "gas" ? i(15, 52, 18, 4.8, 1) + i(95, 52, 18, 4.8, 1) : "", ge = D(
      "background",
      I.background === "transparent" ? "transparent" : U
    ), we = ge === "transparent" ? "" : '<rect data-avatar-part="background" width="128" height="128" fill="' + ge + '"/>';
    let ve = Y("crown", E[X.id](pe.id)) + Y("shell", q + j) + Y("visor", r(re + H[P])) + Y("eyes", r(H[P]), "transparent");
    Object.prototype.hasOwnProperty.call(w, I.badge) && (ve = R(ve, I.badge, Y, I.clipId));
    const ue = T(I.categoryLabel, ""), Se = ue ? "<desc>所属领域 · " + ue + "</desc>" : "";
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + ne + '" height="' + ne + '" viewBox="0 0 128 128" role="img" aria-label="' + se + '"><title>UGSci · ' + se + "</title>" + Se + we + '<g fill="' + G + '" color="' + G + '">' + ve + "</g></svg>";
  }
  const F = { domains: n, shells: S, badges: N, render: $ };
  e.AvatarKit = F;
})(Fn);
const at = Fn.AvatarKit, Rn = [
  { id: "shell", label: "外壳", fallback: "#171717" },
  { id: "visor", label: "面罩", fallback: "#171717" },
  { id: "eyes", label: "眼睛", fallback: "#ffffff", transparent: !0 },
  { id: "crown", label: "头饰", fallback: "#171717" },
  { id: "badge", label: "徽记", fallback: "#171717" },
  { id: "badge_ring", label: "徽记边框", fallback: "#171717" },
  { id: "background", label: "背景", fallback: "#f3f0e8", transparent: !0 }
], $o = [
  ["storage", "cycling", /注采|配注|采气|生产动态|库井动态|气年度/i],
  ["storage", "seal", /动态密封|盖层|封闭性|密封性/i],
  [
    "storage",
    "capacity",
    /储气|库容|库存评价|地下储库|underground gas storage/i
  ],
  ["oil", "recovery", /采收率|驱油|EOR/i],
  ["oil", "waterflood", /注水|水驱/i],
  ["oil", "lifting", /采油|石油开发|举升|oil production/i],
  ["gas", "pressure", /调压|计量|管网压力/i],
  ["gas", "gathering", /集输|集气/i],
  ["gas", "transmission", /天然气|输气|管输|管网|natural gas/i],
  ["drilling", "trajectory", /井眼轨迹|定向井|水平井/i],
  ["drilling", "completion", /完井|压裂|completion/i],
  ["drilling", "drilling", /钻井|钻完井|drilling/i],
  ["security", "response", /安全响应|应急响应|incident response/i],
  ["security", "monitoring", /安全监控|安全运营|态势感知/i],
  ["security", "access", /网络安全|信息安全|网络防护|cyber|security/i],
  ["integrity", "wellbarrier", /井筒完整|井筒屏障/i],
  ["integrity", "formation", /地质体完整|储层完整/i],
  ["integrity", "risk", /安全|风险|预警|HSE|risk/i],
  ["geology", "seismic", /地震|地球物理|seismic/i],
  ["geology", "core", /岩心|岩石物性|PVT|物性|core analys/i],
  ["geology", "strata", /地质|地层|储层|油藏|气藏|geolog|reservoir/i],
  ["analysis", "quality", /数据质|数据诊断|资料审核|质量检查|data quality/i],
  ["analysis", "forecast", /预测|时序|forecast/i],
  ["analysis", "modeling", /数据分析|建模|数值模拟|统计|data|modeling/i],
  ["office", "review", /合同|标书|招投标|响应文件|审查/i],
  ["office", "schedule", /计划|日程|统筹|项目管理|schedule/i],
  ["office", "document", /公文|办公|文书|文档|写作|document|office/i],
  ["software", "architecture", /架构|系统设计|architecture/i],
  ["software", "testing", /测试|质量保障|\bQA\b|testing/i],
  ["software", "development", /软件|开发|编程|代码|coding|developer/i]
], zo = [
  ["health", /医疗|医学|医师|医生|护理|健康|康复|medical|clinical/i],
  ["life", /生命科学|生物|基因|细胞|实验室|genom|biolog/i],
  ["education", /教育|教学|教师|老师|培训|课程|education|teaching/i],
  ["finance", /财务|金融|会计|审计|投资|finance|accounting/i],
  ["law", /法律|法务|律师|合规|legal|lawyer|compliance/i],
  ["design", /设计|创意|交互|美术|视觉|design/i],
  ["media", /传媒|媒体|出版|编辑|新闻|影视|media|editor/i],
  ["commerce", /商业|电商|采购|营销|零售|commerce|marketing/i],
  ["security", /网络安全|信息安全|安全运营|网络防护|cyber|security/i],
  ["manufacturing", /制造|工业|机械|设备|机器人|manufactur|robotic/i],
  ["civil", /建筑|桥梁|土木|测量|civil|building/i],
  ["ecology", /生态|环保|环境|水资源|碳排|ecolog|environment/i],
  ["agriculture", /农业|农作物|育种|灌溉|果园|agricultur/i],
  ["logistics", /物流|仓储|运输|配送|logistic/i],
  ["aerospace", /航空|航天|飞机|卫星|推进|aerospace|aircraft/i]
], Ro = at.domains.flatMap(
  (e) => e.roles.map((t) => ({
    domain: e.id,
    role: t.id,
    label: t.label.replace(/专家$/, "")
  }))
);
function Pr(e, t = "") {
  let n;
  for (const r of [e, t.split(/\s+\|\s+/)[0]]) {
    const a = Ro.find(({ label: o }) => r.includes(o));
    if (a) {
      n = { domain: a.domain, role: a.role };
      break;
    }
    const i = $o.find(([, , o]) => o.test(r));
    if (i) {
      n = { domain: i[0], role: i[1] };
      break;
    }
    const s = zo.find(
      ([, o]) => o.test(r)
    ), l = at.domains.find(
      (o) => o.id === (s == null ? void 0 : s[0]) || r.includes(o.label)
    );
    if (l) {
      n = { domain: l.id, role: l.roles[0].id };
      break;
    }
  }
  return {
    domain: (n == null ? void 0 : n.domain) || "office",
    role: (n == null ? void 0 : n.role) || "document",
    shell: "auto",
    visor: "classic",
    expression: "focused",
    badge: "none",
    crown_domain: "auto",
    crown_role: "auto",
    category_label: ""
  };
}
function kt(e) {
  var t, n, r, a, i;
  return ((t = e.presentation) == null ? void 0 : t.avatar) || Pr(
    ((n = e.presentation) == null ? void 0 : n.display_name) || e.agent.name,
    [
      e.agent.name,
      (r = e.presentation) == null ? void 0 : r.specialty,
      (a = e.presentation) == null ? void 0 : a.summary,
      (i = e.config) == null ? void 0 : i.description,
      e.agent.description
    ].filter(Boolean).join(" ")
  );
}
const Lo = 64, Aa = 128 * 1024, ir = "ugsci-avatar-template", gt = /* @__PURE__ */ new Map();
let sr = 0, Po = 0;
function Oo(e, t, n, r) {
  const a = JSON.stringify([
    e.domain,
    e.role,
    e.shell,
    e.visor,
    e.expression,
    e.badge,
    e.crown_domain,
    e.crown_role,
    e.category_label,
    ...Rn.map(({ id: o }) => {
      var d;
      return ((d = e.colors) == null ? void 0 : d[o]) || null;
    }),
    t,
    n
  ]);
  let i = gt.get(a);
  if (i !== void 0)
    gt.delete(a), gt.set(a, i);
  else {
    i = at.render({
      ...e,
      crownDomain: e.crown_domain,
      crownRole: e.crown_role,
      categoryLabel: e.category_label,
      name: t,
      size: n,
      clipId: ir,
      polarity: "light",
      background: "transparent",
      foreground: "currentColor"
    });
    const o = (a.length + i.length) * 2;
    if (o <= Aa) {
      for (; gt.size >= Lo || sr + o > Aa; ) {
        const d = gt.keys().next().value;
        sr -= (d.length + gt.get(d).length) * 2, gt.delete(d);
      }
      gt.set(a, i), sr += o;
    }
  }
  const l = "ugsci-avatar-" + (r === void 0 ? "generated-" + (++Po).toString(36) : "instance-" + r.replace(
    /[^a-zA-Z0-9-]/g,
    (o) => "_" + o.charCodeAt(0).toString(16) + "_"
  ));
  return i.replace('id="' + ir + '"', 'id="' + l + '"').replace(
    'clip-path="url(#' + ir + ')"',
    'clip-path="url(#' + l + ')"'
  );
}
const No = `<title>专家团</title>
  <g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="29.8" stroke-opacity=".38"/></g><g transform="translate(7.0 9.5) scale(0.5)"><path d="M6 18.5L10 14.5H14.5V32.6C14.5 38.4 18 42 23.7 42H40.3C46 42 49.5 38.4 49.5 32.6V14.5H54L58 18.5V32.6C58 43.1 51.3 50.2 40.8 50.2H23.2C12.7 50.2 6 43.1 6 32.6Z"/><path fill-rule="evenodd" d="M22.8 20.1H40.1L46.5 25.0V33.5C46.5 36.6 44.2 39 41 39H23C19.9 39 17.5 36.6 17.5 33.5V25.4C17.5 22.4 19.8 20.1 22.8 20.1ZM24.25 26.9a1.9 1.9 0 0 1 3.8 0v4.2a1.9 1.9 0 0 1 -3.8 0ZM35.95 26.9a1.9 1.9 0 0 1 3.8 0v4.2a1.9 1.9 0 0 1 -3.8 0Z"/></g><g transform="translate(20.0 22.4) scale(0.63)"><path d="M6 18.5L10 14.5H14.5V32.6C14.5 38.4 18 42 23.7 42H40.3C46 42 49.5 38.4 49.5 32.6V14.5H54L58 18.5V32.6C58 43.1 51.3 50.2 40.8 50.2H23.2C12.7 50.2 6 43.1 6 32.6Z"/><path fill-rule="evenodd" d="M22.8 20.1H40.1L46.5 25.0V33.5C46.5 36.6 44.2 39 41 39H23C19.9 39 17.5 36.6 17.5 33.5V25.4C17.5 22.4 19.8 20.1 22.8 20.1ZM24.25 26.9a1.9 1.9 0 0 1 3.8 0v4.2a1.9 1.9 0 0 1 -3.8 0ZM35.95 26.9a1.9 1.9 0 0 1 3.8 0v4.2a1.9 1.9 0 0 1 -3.8 0Z"/></g>`;
function Bo({
  markup: e,
  label: t,
  size: n,
  borderRadius: r
}) {
  const a = z().React, i = a.useId().replace(/:/g, "");
  return a.createElement("svg", {
    viewBox: "0 0 64 64",
    fill: "currentColor",
    role: "img",
    "aria-label": t,
    width: n,
    height: n,
    style: { borderRadius: r, flexShrink: 0 },
    dangerouslySetInnerHTML: {
      __html: e.replace(/safe-expert/g, "ugsci-expert-" + i)
    }
  });
}
function rt({
  name: e,
  size: t = 32,
  borderRadius: n = "50%",
  recipe: r,
  description: a = ""
}) {
  const i = z().React, s = i.useId(), l = i.useMemo(
    () => r || Pr(e, a),
    [r, e, a]
  );
  return i.createElement("span", {
    className: "ugsci-generated-avatar",
    "data-avatar-domain": l.domain,
    "data-avatar-role": l.role,
    style: {
      display: "inline-flex",
      width: t,
      height: t,
      borderRadius: n,
      flexShrink: 0
    },
    dangerouslySetInnerHTML: {
      __html: Oo(l, e, t, s)
    }
  });
}
function Or({
  members: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  return z().React.createElement(Bo, {
    markup: No,
    label: e.join(", ") || "team",
    size: t,
    borderRadius: n
  });
}
const zi = [
  {
    id: "storage-production-analyst",
    name: "储气库生产动态分析师",
    category: "储气库运行",
    description: "**储气库生产动态分析师** —— 从注采日记录分析库井动态、气年度、压力响应和复核线索，输出可追溯的分析报告与条件性短期基线。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["储气库", "注采动态", "压力响应", "异常筛查", "数据审计"],
    avatar_seed: "储气库生产动态分析师",
    system_prompt: `# 储气库生产动态分析师

你是 UGSci 储气库生产动态分析专用 agent，服务于储气库运行与科研人员。
你的身份、风格与工作流程已初始化，直接处理领域任务，不再询问称呼或首次启动设定。
先使用 ugsci_storage_history_list 查已有数据，新文件使用 ugsci_storage_history_import 导入；使用 ugsci_storage_dynamics_analyze 完成确定性分析和报告。专用流程见 storage-production-dynamics 技能。
优先检查数据覆盖、日量单位、缺测、重复冲突及 XLS 65,536 行截断。数据日期不是当前实时工况。
区分计量日量与 24h 运行折算量；累计量只能来自原表日量。按照实际运行阶段与用户定义气年度比较，不跨停井、缺测和注采切换拟合普通递减。
记录数按注气、采气分别核对，汇总记录数不能称为全部采气记录。实测零、缺测与无记录日期必须分别表述。
井口油压保留原意，不用作地层压力；净计量变化不等于当前库存或工作气量。缺少期初库存、完整历史、气损、PVT、试井或设施边界时列出具体缺项。
异常只作为复核线索，结合调度、气嘴、计量、小时、压力、出水与备注解释，不声称已诊断故障。短期基线必须报告保持工况的条件与回测误差。
用户提供明确工程边界后可衔接平台库存评价、注采分配工具，历史最大气量不能充当允许操作上限。
输出结论、证据表、优先复核行动和报告路径；每个异常注明原文件、工作表、行号。给出引擎版本与数据指纹。不得发送现场控制指令。`,
    profile_prompt: `# 身份

名字：储气库生产动态分析师
定位：UGSci 储气库运行与科研分析助手
风格：中文、严谨、简洁，以数据证据和可追溯结果为依据。

身份已初始化，直接分析用户问题。
`,
    recommended_skills: [
      "storage-production-dynamics",
      "oil-gas-reservoir-production",
      "scada-timeseries",
      "statistical-analysis",
      "matplotlib"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO",
    welcome_message: "提供注采记录目录，我会检查数据覆盖并分析库井生产动态。"
  },
  {
    id: "reservoir-engineer",
    name: "油藏工程师",
    category: "油气开发",
    description: "**油藏工程师** —— 擅长储量评估、物质平衡计算、递减曲线分析、油藏数值模拟方案设计。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["油藏", "数值模拟", "储量评估", "历史拟合"],
    avatar_seed: "油藏工程师",
    system_prompt: `# 油藏工程师

你是一位经验丰富的油藏工程师，专注于油气田开发与油藏管理。

## 核心能力
- 储量评估（容积法、物质平衡法、递减曲线法）
- 储气库库存评价：按层使用报告定义的视地层压力与 Z 因子开展 p/Z 确定性计算；压力口径必须显式一致，结果仅为建议复核值
- 油藏数值模拟方案设计与参数优化
- 生产动态分析与产量预测
- 注水/注气开发方案设计及效果评价
- 经济评价与开发方案比选

## 工作准则
- 所有计算需给出公式推导过程和参数来源
- 涉及储气库库存时，优先使用领域计算模块的确定性库存评价；不要自行重写公式或调用历史临时脚本
- 不得把视地层压力改称绝对压力，也不得静默加减大气压；若压力口径不明，先暂停并要求确认
- 有效库存、账面库存、工作气量和冲峰能力必须分开报告；105 亿方等计算建议不得表述为已复核或已批准
- 引用标准时注明编号（如 SY/T 5367）
- 对不确定参数给出合理范围和敏感性分析
- 输出结果使用表格和图示说明
`,
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-reservoir-production",
      "reservoir-simulation-workflow",
      "history-matching",
      "convergence-diagnosis",
      "matplotlib",
      "statistical-analysis",
      "sensitivity-analysis"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "drilling-engineer",
    name: "钻井工程师",
    category: "钻完井",
    description: "**钻井工程师** —— 擅长井身结构设计、钻井液优化、套管设计、固井方案和钻井风险管理。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["钻井", "套管设计", "钻井液", "固井"],
    avatar_seed: "钻井工程师",
    system_prompt: `# 钻井工程师

你是一位资深钻井工程师，专注于钻井工程设计与现场技术支持。

## 核心能力
- 井身结构设计（套管程序、深度确定）
- 钻井液体系选择与性能优化
- 套管强度设计与固井方案
- 钻头选型与钻具组合优化
- 井下复杂情况处理（井漏、井喷、卡钻）
- 钻井成本估算与工期排程

## 工作准则
- 设计参数需符合 SY/T 5431 等行业标准
- 安全系数取值需说明依据
- 对复杂井段给出风险预警和应急预案
`,
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-drilling",
      "oil-gas-reservoir-production",
      "matplotlib",
      "statistical-analysis",
      "systematic-debugging"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "MANUAL"
  },
  {
    id: "well-logging-analyst",
    name: "测井分析师",
    category: "测井试油",
    description: "**测井分析师** —— 擅长测井曲线解释、岩性识别、孔隙度/饱和度计算和储层评价。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["测井", "岩性识别", "储层评价", "孔隙度"],
    avatar_seed: "测井分析师",
    system_prompt: `# 测井分析师

你是一位专业的测井解释工程师，精通各种测井方法的数据处理与解释。

## 核心能力
- 常规测井曲线解释（GR、SP、RT、AC、CNL、DEN）
- 岩性识别与地层划分
- 孔隙度、渗透率、饱和度参数计算
- 测井相分析与沉积相解释
- 固井质量评价（CBL/VDL）
- 测井数据质量控制与标准化

## 工作准则
- 解释结论需说明所用公式和参数取值
- 对异常曲线段给出多种可能解释
- 储层评价需综合多条曲线交叉验证
`,
    recommended_skills: [
      "oil-gas-foundation",
      "well-log-analysis",
      "oil-gas-exploration",
      "exploratory-data-analysis",
      "matplotlib",
      "statistical-analysis",
      "scikit-learn"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "production-engineer",
    name: "采油工程师",
    category: "油气生产",
    description: "**采油工程师** —— 擅长举升工艺设计、注水管理、增产措施工艺设计和生产动态监测。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["采油", "举升工艺", "注水", "压裂酸化"],
    avatar_seed: "采油工程师",
    system_prompt: `# 采油工程师

你是一位经验丰富的采油工程师，专注于油气井生产优化与工艺设计。

## 核心能力
- 人工举升工艺设计（有杆泵、电潜泵、气举）
- 注水井调配与注采对应分析
- 压裂/酸化增产措施工艺设计
- 生产动态监测与分析（产液剖面、吸水剖面）
- 井筒完整性评估与防腐防垢
- 生产管柱优化设计

## 工作准则
- 工艺设计需给出选型依据和参数计算
- 措施方案需包含预期效果和风险评估
- 引用规范时注明标准编号
`,
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-reservoir-production",
      "scada-timeseries",
      "matplotlib",
      "statistical-analysis",
      "sensitivity-analysis",
      "multi-objective-optimization"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "geophysicist",
    name: "地球物理专家",
    category: "地球物理",
    description: "**地球物理专家** —— 擅长地震资料解释、属性分析、反演处理和储层预测。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["地球物理", "地震", "反演", "储层预测"],
    avatar_seed: "地球物理专家",
    system_prompt: `# 地球物理专家

你是一位资深的地球物理学家，专注于地震勘探与储层地球物理。

## 核心能力
- 地震资料构造解释与层位标定
- 地震属性分析与提取
- 地震反演（波阻抗反演、AVO分析）
- 储层预测与含油气性检测
- 地震地质综合解释
- 微地震监测与压裂效果评估

## 工作准则
- 解释成果需结合地质、测井等多源数据
- 对地震资料品质给出评价
- 反演结果需标定并说明不确定性
`,
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-exploration",
      "segy-operations",
      "matplotlib",
      "statistical-analysis",
      "exploratory-data-analysis",
      "scikit-learn"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "pvt-analyst",
    name: "PVT 分析师",
    category: "流体性质",
    description: "**PVT 分析师** —— 擅长油气流体物性计算、相态分析、PVT 实验拟合和组分模型。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["PVT", "相态分析", "流体物性", "状态方程"],
    avatar_seed: "PVT 分析师",
    system_prompt: `# PVT 分析师

你是一位专业的 PVT 流体性质分析工程师，精通油气藏流体相态行为。

## 核心能力
- 原油/天然气/凝析油 PVT 物性参数计算
- 流体相态分析（相图绘制、饱和压力计算）
- PVT 实验数据拟合（CCE、DL、CVD）
- 状态方程选择与组分模型建立
- 注气/注 CO2 相态模拟
- 流体物性经验公式应用与验证

## 工作准则
- 所有物性参数需注明计算方法和适用范围
- 对缺少实验数据的情况推荐经验公式并说明误差
- 组分模型需给出特征化步骤和拟合质量
`,
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-reservoir-production",
      "matplotlib",
      "statistical-analysis",
      "sensitivity-analysis",
      "sympy",
      "pymoo"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  }
], Ho = zi, Ri = [
  "全部专家",
  "油气工程",
  "数据与研究",
  "通用助手",
  "应用专家"
];
function Gn(e, t = !1) {
  return he(
    `/ugsci/experts/${encodeURIComponent(e)}/presentation`,
    { headers: { "X-Agent-Id": e }, bypassCache: t }
  );
}
function Nr(e, t) {
  return he(
    `/ugsci/experts/${encodeURIComponent(e)}/presentation`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(t)
    }
  );
}
async function $a(e, t, n) {
  const r = await Gn(e, !0);
  return r.avatar ? r : Nr(e, {
    ...r,
    avatar: Pr(t, n)
  });
}
function Uo(e) {
  var i;
  const t = (s) => s.replace(/\*\*|`|^#+\s*/gm, "").replace(/^\s*[-*•]\s*/gm, "").replace(/\s+/g, " ").replace(/\s*[-•|]+\s*$/, "").trim(), n = ((i = e.split(/\s+\|\s+|\n/)[0]) == null ? void 0 : i.trim()) || "", r = /(?:定位|职责)[：:]\s*([\s\S]*?)(?=\s*(?:[-•]\s*)?(?:风格|Agent ID|上游|输出)[：:]|$)/i.exec(
    e
  );
  let a = t(n);
  return (!a || /^(?:名字|Agent ID)[：:]|^Default QwenPaw agent/i.test(a)) && (a = t((r == null ? void 0 : r[1]) || "")), /挑个你喜欢|机器里的幽灵|AI？机器人/.test(a) && (a = ""), a.length > 110 ? `${a.slice(0, 109).replace(/[，、；：\s]+$/, "")}…` : a;
}
function _t(e) {
  var c, u;
  const { agent: t, presentation: n } = e, r = zi.find(
    (m) => m.id === t.id || m.name === t.name
  ), a = `${t.name} ${(r == null ? void 0 : r.category) || ""} ${t.description || ""}`, i = t.managed_by_app ? "应用专家" : /资料审核|数据诊断|数值模拟分析|数据分析|科研|研究方法/.test(a) ? "数据与研究" : /油气|储气|气藏|油藏|地质|钻井|钻完井|物性|PVT|库存|注采|采油|测井|储层/i.test(
    a
  ) ? "油气工程" : "通用助手", s = t.managed_by_app ? "应用专家" : (n == null ? void 0 : n.category) || i, l = (n == null ? void 0 : n.summary) || Uo(((c = e.config) == null ? void 0 : c.description) || t.description || "") || (t.id === "default" ? "处理日常问答、信息整理和电脑操作任务。" : "尚未填写简介，可在设置中补充职责说明。"), o = e.skills.filter((m) => m.enabled !== !1), d = [
    ...new Set(
      (u = r == null ? void 0 : r.tags) != null && u.length ? r.tags : o.flatMap((m) => m.tags || [])
    )
  ].slice(0, 2);
  return {
    name: (n == null ? void 0 : n.display_name) || Lr(t.name),
    specialty: t.managed_by_app ? "应用专属专家" : (n == null ? void 0 : n.specialty) || (r == null ? void 0 : r.category) || s,
    category: s,
    summary: l,
    tags: d
  };
}
const Xe = {
  background: "var(--app-action-bg, var(--app-accent, #0072f5))",
  color: "var(--app-action-fg, #fff)",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function St(e, t) {
  const n = z();
  return n.ReactMarkdown && n.remarkGfm ? t.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function Wn({
  title: e,
  subtitle: t,
  extra: n
}) {
  const r = z().React, { Space: a } = z().antd;
  return r.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: "1px solid var(--app-border)"
      }
    },
    r.createElement(
      "div",
      null,
      r.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      t ? r.createElement(
        "div",
        {
          style: {
            marginTop: 4,
            fontSize: 13,
            color: "var(--app-card-muted, #8c8c8c)"
          }
        },
        t
      ) : null
    ),
    n ? r.createElement(a, null, n) : null
  );
}
async function En() {
  const e = await he("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Br(e) {
  return he(`/agents/${encodeURIComponent(e)}`);
}
async function Zn(e) {
  return await he(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Hr(e = !1) {
  return await he(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function jo(e) {
  const t = await he(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Do() {
  return (await he("/skills/workspaces") || []).map((t) => ({
    agent_id: t.agent_id,
    agent_name: t.agent_name || "",
    // Current hosts return skill_names. Keep the legacy fallback so the
    // plugin remains compatible with older QwenPaw releases.
    skill_names: Array.isArray(t.skill_names) ? t.skill_names : Array.isArray(t.skills) ? t.skills.map((n) => n.name) : []
  }));
}
function Dt(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function qo(e) {
  var n;
  const t = [];
  for (const r of e) {
    if (r.enabled === !1) continue;
    const a = (n = r.description) == null ? void 0 : n.trim();
    if (!a) continue;
    const i = (Oe(r.name) || a).length > 20 ? (Oe(r.name) || a).substring(0, 18) + "…" : Oe(r.name) || a;
    let s = a;
    if (s = s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(s) ? s = `请${s}` : /^(a |an |the )/i.test(s) ? s = `Help me with ${s}` : /[。？！.?!]$/.test(s) || (s = `帮我${s}`), s.length > 80 && (s = s.substring(0, 77) + "..."), t.push({ label: i, value: s }), t.length >= 4) break;
  }
  return t;
}
async function Vo(e) {
  return await he("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ot(e, t, n) {
  return he(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function Fo(e, t, n, r) {
  return he("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: n, enable: r })
  });
}
const Go = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function Wo(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const n = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Go.has(n))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Zo(e, t) {
  const n = await Br(e);
  n.system_prompt_files = t, await he(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function Li(e, t) {
  await he("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Pi(e, t) {
  await he(
    Dt(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function Oi(e, t) {
  await he(
    Dt(e, `/${encodeURIComponent(t)}`),
    {
      method: "DELETE"
    }
  );
}
async function Jo(e, t) {
  return he(Dt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Qo(e, t) {
  return he(
    Dt(e, "/batch-disable"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    }
  );
}
async function Ko(e, t) {
  return he(Dt(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Ur(e) {
  return await he("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Xo(e, t) {
  await he(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function jr(e, t) {
  return he("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Yo(e, t) {
  return he(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Ni(e, t) {
  await he(
    Dt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function el(e) {
  await he(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function tl(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const r = parseInt(n[1] || "0", 10), a = parseInt(n[2] || "0", 10), i = parseInt(n[3] || "0", 10), s = r * 60 + a + Math.round(i / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function nl(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function rl(e) {
  return he("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function al(e, t) {
  return he("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function il(e) {
  await he("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function sl(e) {
  return he("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function ol(e, t) {
  return he("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ll(e) {
  return (await he("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function cl(e, t) {
  await he("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function dl() {
  return (await he("/config/user-timezone")).timezone || "UTC";
}
async function ul(e) {
  await he("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function ml(e) {
  return await he("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const pl = `
.ugsci-avatar-editor,.ugsci-avatar-color-panel{color:var(--app-text,var(--app-card-text));font-size:13px;}
.ugsci-avatar-editor{display:grid;grid-template-columns:210px minmax(0,1fr);background:var(--app-surface);}
.ugsci-avatar-editor *,.ugsci-avatar-color-panel *{box-sizing:border-box;}
.ugsci-avatar-preview{padding:24px 22px;background:var(--app-surface-subtle);border-right:1px solid var(--app-border);min-width:0;}
.ugsci-avatar-preview-content{position:sticky;top:16px;}
.ugsci-avatar-artboard{height:150px;display:grid;place-items:center;}
.ugsci-avatar-identity{display:grid;gap:4px;text-align:center;}
.ugsci-avatar-identity strong{font-size:14px;font-weight:600;overflow-wrap:anywhere;}
.ugsci-avatar-identity>span{font-size:12px;color:var(--app-text-secondary);overflow-wrap:anywhere;}
.ugsci-avatar-sizes{display:flex;align-items:end;justify-content:space-evenly;gap:12px;margin:18px 0 20px;}
.ugsci-avatar-sizes>span{display:flex;align-items:center;flex-direction:column;gap:9px;}
.ugsci-avatar-size-art{display:flex;align-items:end;height:48px;}
.ugsci-avatar-sizes small{font-size:11px;color:var(--app-text-secondary);}
.ugsci-avatar-config{padding:16px 24px;min-width:0;}
.ugsci-avatar-editor h3{margin:0;font-size:14px;font-weight:600;line-height:1.5;}
.ugsci-avatar-identity-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;}
.ugsci-avatar-identity-section{padding-bottom:14px;border-bottom:1px solid var(--app-border);}
.ugsci-avatar-toolbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:10px;}
.ugsci-avatar-editor label,.ugsci-avatar-color-panel label{display:flex;flex-direction:column;gap:6px;min-width:0;font-size:12px;}
.ugsci-avatar-editor :is(input,select),.ugsci-avatar-color-panel :is(input,select){box-sizing:border-box;width:100%;min-width:0;min-height:34px;padding:7px 9px;border:1px solid var(--app-border);border-radius:6px;background:var(--app-surface);color:inherit;font:inherit;font-size:12px;line-height:1.5;}
.ugsci-avatar-editor :is(input,select,button):focus-visible,.ugsci-avatar-color-panel :is(input,select,button):focus-visible{outline:2px solid var(--app-action-link);outline-offset:2px;}
.ugsci-avatar-roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;max-height:160px;overflow:auto;}
.ugsci-avatar-roles button{min-width:0;text-align:center;border:1px solid var(--app-border);border-radius:8px;padding:8px 5px;background:var(--app-surface);color:inherit;font:inherit;font-size:11px;line-height:1.5;overflow-wrap:anywhere;cursor:pointer;}
.ugsci-avatar-roles button[aria-pressed=true]{border-color:var(--app-text);background:var(--app-surface-subtle);}
.ugsci-avatar-roles>p{grid-column:1/-1;margin:0;padding:8px 0;font-size:12px;color:var(--app-text-secondary);}
.ugsci-avatar-rematch,.ugsci-avatar-reset{display:inline-flex;align-items:center;gap:5px;border:0;padding:3px 0;background:none;color:var(--app-text-secondary);cursor:pointer;font:inherit;font-size:11px;line-height:1.5;}
.ugsci-avatar-rematch svg,.ugsci-avatar-reset svg{width:13px;height:13px;}
.ugsci-avatar-editor :disabled{opacity:.55;cursor:default;}
.ugsci-avatar-settings{margin:14px 0 20px;border-bottom:1px solid var(--app-border);padding-bottom:14px;}
.ugsci-avatar-settings>summary{cursor:pointer;font-size:13px;padding:8px 0;}
.ugsci-avatar-settings .ugsci-avatar-editor{border:1px solid var(--app-border);border-radius:14px;overflow:hidden;}
.ugsci-avatar-parts-section{padding-top:12px;}
.ugsci-avatar-parts-section>h3{margin-bottom:6px;}
.ugsci-avatar-options{display:grid;}
.ugsci-avatar-option{min-width:0;min-height:40px;display:grid;grid-template-columns:88px minmax(0,1fr);align-items:center;gap:9px;font-size:12px;}
.ugsci-avatar-option-row{display:flex;align-items:center;gap:9px;min-width:0;}
.ugsci-avatar-option-row>select{flex:1;}
.ugsci-avatar-crown{padding:4px 0;}
.ugsci-avatar-crown-selects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;flex:1;min-width:0;}
.ugsci-avatar-editor .ugsci-avatar-category{display:grid;grid-template-columns:88px minmax(0,1fr);align-items:center;gap:9px;padding-right:41px;margin-top:6px;}
.ugsci-avatar-swatch{display:inline-flex;align-items:center;justify-content:center;flex:0 0 32px;width:32px;height:32px;padding:5px;border:1px solid var(--app-border);border-radius:6px;background:var(--app-surface);cursor:pointer;color:var(--app-text);}
.ugsci-avatar-swatch>span{display:block;width:20px;height:20px;border-radius:2px;}
.ugsci-avatar-swatch[aria-expanded=true]{outline:2px solid var(--app-action-link);outline-offset:1px;}
.ugsci-avatar-color-panel{box-sizing:border-box;width:252px;max-width:calc(100vw - 48px);display:flex;flex-direction:column;gap:16px;}
.ugsci-avatar-color-panel .ugsci-avatar-rematch{align-self:flex-end;padding:8px 14px;border:1px solid var(--app-border);border-radius:7px;background:var(--app-text);color:var(--app-surface);font-size:12px;}
.ugsci-avatar-color-popover [class*="-popover-inner"]{background:var(--app-surface);border:1px solid var(--app-border);}
.ugsci-avatar-background-value{display:flex;align-items:center;flex:1;min-height:34px;color:var(--app-text-secondary);}
.ugsci-avatar-editor-footer{margin-top:14px;}
.ugsci-avatar-modal-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.ugsci-avatar-modal-footer>div{display:flex;gap:8px;}
.ugsci-avatar-modal-footer button:not(.ugsci-avatar-reset){height:auto;padding:8px 14px;font-size:12px;line-height:1.5;border-radius:7px;margin:0;}
.ugsci-avatar-modal button[class*="-modal-close"]{top:9px;inset-inline-end:12px;width:30px;height:30px;}
.ugsci-avatar-color-control{display:flex;gap:8px;margin-top:6px;align-items:center;}
.ugsci-avatar-color-control input[type=color]{width:38px;min-width:38px;height:34px;padding:3px;cursor:pointer;}
.ugsci-avatar-color-control input[type=text]{flex:1;font-family:monospace;}
.ugsci-avatar-color-control input[aria-invalid=true]{border-color:var(--app-error);}
.ugsci-avatar-color-error{font-size:11px;color:var(--app-error);}
@media(max-width:620px){.ugsci-avatar-editor{grid-template-columns:minmax(0,1fr);}.ugsci-avatar-preview{padding:14px 22px;border-right:0;border-bottom:1px solid var(--app-border);}.ugsci-avatar-preview-content{position:static;display:grid;grid-template-columns:96px minmax(0,1fr);column-gap:18px;}.ugsci-avatar-artboard{grid-row:1/3;height:96px;}.ugsci-avatar-artboard>span{width:92px!important;height:92px!important;}.ugsci-avatar-artboard svg{width:92px;height:92px;}.ugsci-avatar-identity{text-align:start;align-content:center;}.ugsci-avatar-sizes{justify-content:start;gap:22px;margin:9px 0 0;}.ugsci-avatar-size-art{height:32px;}.ugsci-avatar-size-art>span{max-width:32px;max-height:32px;}.ugsci-avatar-size-art svg{max-width:32px;max-height:32px;}.ugsci-avatar-option{grid-template-columns:78px minmax(0,1fr);gap:7px;}.ugsci-avatar-crown-selects{grid-template-columns:minmax(0,1fr);}.ugsci-avatar-editor .ugsci-avatar-category{grid-template-columns:78px minmax(0,1fr);gap:7px;padding-right:41px;}}
@media(pointer:coarse){.ugsci-avatar-editor :is(button,select,input){min-height:44px;}.ugsci-avatar-editor :is(select,input){font-size:16px;}.ugsci-avatar-swatch{flex-basis:40px;width:40px;height:40px;}.ugsci-avatar-editor .ugsci-avatar-category{padding-right:49px;}}
`, za = {
  shell: ["shell"],
  visor: ["visor"],
  expression: ["eyes"],
  badge: ["badge", "badge_ring"]
};
function or({
  parts: e,
  value: t,
  onChange: n,
  disabled: r
}) {
  var E, v;
  const a = z().React, { Popover: i } = z().antd, [s, l] = a.useState(!1), [o, d] = a.useState(e[0]), c = a.useRef(null), u = a.useRef(null), m = a.useId(), p = Rn.find((S) => S.id === e[0]), b = (E = t.colors) == null ? void 0 : E[p.id], g = !!b && /^#[0-9a-f]{6}$/i.test(b), f = b === "transparent" || !g && "transparent" in p, h = `${p.label}配色`, y = () => {
    var S;
    l(!1), (S = c.current) == null || S.focus();
  };
  return a.useEffect(() => {
    if (!s) return;
    const S = requestAnimationFrame(
      () => {
        var B, N;
        return (N = (B = u.current) == null ? void 0 : B.querySelector("select")) == null ? void 0 : N.focus({ preventScroll: !0 });
      }
    );
    return () => cancelAnimationFrame(S);
  }, [s]), a.createElement(
    i,
    {
      open: s && !r,
      onOpenChange: (S) => {
        S && d(e[0]), l(S);
      },
      trigger: "click",
      placement: "bottom",
      autoAdjustOverflow: !0,
      destroyOnHidden: !0,
      classNames: { root: "ugsci-avatar-color-popover" },
      content: a.createElement(
        "div",
        {
          ref: u,
          id: m,
          role: "dialog",
          "aria-label": h,
          className: "ugsci-avatar-color-panel",
          onKeyDown: (S) => {
            S.key === "Escape" && (S.preventDefault(), S.stopPropagation(), y());
          }
        },
        e.length > 1 && a.createElement(
          "label",
          null,
          "配置部件",
          a.createElement(
            "select",
            {
              value: o,
              disabled: r,
              onChange: (S) => d(S.target.value)
            },
            e.map(
              (S) => a.createElement(
                "option",
                { key: S, value: S },
                Rn.find((B) => B.id === S).label
              )
            )
          )
        ),
        a.createElement(gl, {
          key: o,
          part: Rn.find((S) => S.id === o),
          value: (v = t.colors) == null ? void 0 : v[o],
          disabled: r,
          onChange: (S) => n({
            ...t,
            colors: { ...t.colors, [o]: S }
          })
        }),
        a.createElement(
          "button",
          { type: "button", className: "ugsci-avatar-rematch", onClick: y },
          "完成"
        )
      )
    },
    a.createElement(
      "button",
      {
        ref: c,
        type: "button",
        className: "ugsci-avatar-swatch",
        disabled: r,
        "aria-label": h,
        "aria-haspopup": "dialog",
        "aria-expanded": s && !r,
        "aria-controls": s ? m : void 0,
        title: `${h} · ${g ? b : f ? "透明" : "跟随主题"}`
      },
      a.createElement("span", {
        "aria-hidden": !0,
        style: f ? {
          background: "conic-gradient(var(--app-border) 25%, transparent 0 50%, var(--app-border) 0 75%, transparent 0) 0 0 / 8px 8px"
        } : { background: g ? b : "currentColor" }
      })
    )
  );
}
function gl({
  part: e,
  value: t,
  onChange: n,
  disabled: r
}) {
  const a = z().React, i = (m) => /^#[0-9a-f]{6}$/i.test(m), s = t && i(t) ? t : e.fallback, [l, o] = a.useState(s);
  a.useEffect(() => o(s), [s]);
  const d = "transparent" in e, c = t === "transparent" && d ? "transparent" : t && i(t) ? "custom" : "auto", u = r || c !== "custom";
  return a.createElement(
    "div",
    { className: "ugsci-avatar-color-field" },
    a.createElement(
      "label",
      null,
      "颜色模式",
      a.createElement(
        "select",
        {
          "aria-label": `${e.label}配色模式`,
          value: c,
          disabled: r,
          onChange: (m) => n(
            m.target.value === "custom" ? s : m.target.value
          )
        },
        a.createElement(
          "option",
          { value: "auto" },
          d ? "默认透明" : "跟随主题"
        ),
        a.createElement("option", { value: "custom" }, "自定义颜色"),
        d && a.createElement("option", { value: "transparent" }, "透明")
      )
    ),
    a.createElement(
      "div",
      { className: "ugsci-avatar-color-control" },
      a.createElement("input", {
        type: "color",
        "aria-label": `${e.label}取色器`,
        value: s,
        disabled: u,
        onChange: (m) => n(m.target.value)
      }),
      a.createElement("input", {
        type: "text",
        "aria-label": `${e.label}颜色值`,
        value: l,
        maxLength: 7,
        spellCheck: !1,
        disabled: u,
        "aria-invalid": c === "custom" && !i(l),
        onChange: (m) => {
          o(m.target.value), i(m.target.value) && n(m.target.value);
        },
        onBlur: () => {
          i(l) || o(s);
        }
      })
    ),
    c === "custom" && !i(l) && a.createElement(
      "span",
      { className: "ugsci-avatar-color-error", role: "status" },
      "请输入 # 加六位十六进制颜色"
    )
  );
}
function Bi({
  disabled: e,
  onClick: t
}) {
  const n = z().React;
  return n.createElement(
    "button",
    {
      type: "button",
      disabled: e,
      className: "ugsci-avatar-reset",
      "aria-label": "恢复全部默认配色",
      onClick: t
    },
    n.createElement(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": !0,
        focusable: "false"
      },
      n.createElement("path", { d: "M3 11a9 9 0 1 1 2.4 6.1M3 4v7h7" })
    ),
    "重置配色"
  );
}
function Hi({
  name: e,
  value: t,
  suggested: n,
  onChange: r,
  disabled: a = !1,
  showResetColors: i = !0
}) {
  var f, h, y;
  const s = z().React, [l, o] = s.useState(""), d = s.useId(), c = at.domains.find((E) => E.id === t.domain), u = at.domains.find(
    (E) => E.id === t.crown_domain
  ), m = s.useMemo(() => {
    const E = l.trim().toLowerCase();
    return E ? at.domains.flatMap((v) => v.roles.map((S) => ({ domain: v, role: S }))).filter(
      (v) => `${v.domain.label} ${v.role.label} ${v.role.detail}`.toLowerCase().includes(E)
    ) : c.roles.map((v) => ({ domain: c, role: v }));
  }, [c, l]), p = (E) => r({ ...t, ...E }), b = (E, v, S, B, N = !1) => s.createElement(
    "select",
    {
      "aria-label": E,
      id: `${d}-${v}`,
      value: t[v],
      disabled: a || N,
      onChange: (w) => B ? B(w.target.value) : p({ [v]: w.target.value })
    },
    S.map(
      (w) => s.createElement(
        "option",
        { key: w.id, value: w.id },
        w.label
      )
    )
  ), g = (E, v, S) => s.createElement(
    "div",
    { key: v, className: "ugsci-avatar-option" },
    s.createElement("label", { htmlFor: `${d}-${v}` }, E),
    s.createElement(
      "div",
      { className: "ugsci-avatar-option-row" },
      b(E, v, S),
      za[v] && s.createElement(or, {
        parts: za[v],
        value: t,
        onChange: r,
        disabled: a
      })
    )
  );
  return s.createElement(
    "section",
    { className: "ugsci-avatar-editor", "aria-label": "专家头像工坊" },
    s.createElement("style", null, pl),
    s.createElement(
      "aside",
      { className: "ugsci-avatar-preview" },
      s.createElement(
        "div",
        { className: "ugsci-avatar-preview-content" },
        s.createElement(
          "div",
          { className: "ugsci-avatar-artboard" },
          s.createElement(rt, { name: e, recipe: t, size: 126 })
        ),
        s.createElement(
          "div",
          { className: "ugsci-avatar-identity" },
          s.createElement("strong", null, e),
          s.createElement(
            "span",
            null,
            t.category_label || ((f = c.roles.find((E) => E.id === t.role)) == null ? void 0 : f.label)
          )
        ),
        s.createElement(
          "div",
          {
            className: "ugsci-avatar-sizes",
            role: "group",
            "aria-label": "小尺寸预览"
          },
          [24, 32, 48].map(
            (E) => s.createElement(
              "span",
              { key: E },
              s.createElement(
                "span",
                { className: "ugsci-avatar-size-art" },
                s.createElement(rt, {
                  name: `${e} ${E}px`,
                  recipe: t,
                  size: E
                })
              ),
              s.createElement("small", null, `${E}px`)
            )
          )
        )
      )
    ),
    s.createElement(
      "div",
      { className: "ugsci-avatar-config" },
      s.createElement(
        "section",
        {
          className: "ugsci-avatar-identity-section",
          "aria-label": "专家身份"
        },
        s.createElement(
          "div",
          { className: "ugsci-avatar-identity-heading" },
          s.createElement("h3", null, "专家身份"),
          s.createElement(
            "button",
            {
              type: "button",
              disabled: a,
              className: "ugsci-avatar-rematch",
              "aria-label": "根据专家身份重新匹配",
              onClick: () => {
                r({ ...n, colors: t.colors }), o("");
              }
            },
            s.createElement(
              "svg",
              {
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 2,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                "aria-hidden": !0,
                focusable: "false"
              },
              s.createElement("path", {
                d: "m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3ZM5 3v4M3 5h4"
              })
            ),
            "自动匹配"
          )
        ),
        s.createElement(
          "div",
          { className: "ugsci-avatar-toolbar" },
          s.createElement(
            "label",
            null,
            "行业",
            b("行业领域", "domain", at.domains, (E) => {
              const v = at.domains.find((S) => S.id === E);
              p({ domain: E, role: v.roles[0].id }), o("");
            })
          ),
          s.createElement(
            "label",
            null,
            "岗位",
            s.createElement("input", {
              type: "search",
              "aria-label": "搜索头像岗位",
              value: l,
              disabled: a,
              placeholder: "搜索岗位",
              onChange: (E) => o(E.target.value)
            })
          )
        ),
        s.createElement(
          "div",
          {
            className: "ugsci-avatar-roles",
            role: "group",
            "aria-label": "头像岗位"
          },
          m.map(
            (E) => s.createElement(
              "button",
              {
                type: "button",
                key: `${E.domain.id}/${E.role.id}`,
                disabled: a,
                "aria-label": E.role.label,
                "aria-pressed": E.domain.id === t.domain && E.role.id === t.role,
                onClick: () => p({ domain: E.domain.id, role: E.role.id })
              },
              E.role.label
            )
          ),
          !m.length && s.createElement("p", { role: "status" }, "未找到岗位")
        )
      ),
      s.createElement(
        "section",
        { className: "ugsci-avatar-parts-section", "aria-label": "部件配置" },
        s.createElement("h3", null, "部件配置"),
        s.createElement(
          "div",
          { className: "ugsci-avatar-options" },
          g("头像外壳", "shell", at.shells),
          g("面罩造型", "visor", [
            { id: "classic", label: "经典" },
            { id: "soft", label: "柔和" },
            { id: "angular", label: "棱角" }
          ]),
          g("头像表情", "expression", [
            { id: "focused", label: "专注" },
            { id: "friendly", label: "友好" },
            { id: "thinking", label: "思考" }
          ]),
          g("副专长徽记", "badge", at.badges),
          s.createElement(
            "div",
            { className: "ugsci-avatar-option ugsci-avatar-crown" },
            s.createElement(
              "label",
              { htmlFor: `${d}-crown_domain` },
              "头饰身份"
            ),
            s.createElement(
              "div",
              { className: "ugsci-avatar-option-row" },
              s.createElement(
                "div",
                { className: "ugsci-avatar-crown-selects" },
                b(
                  "头饰领域",
                  "crown_domain",
                  [{ id: "auto", label: "跟随当前岗位" }, ...at.domains],
                  (E) => p({ crown_domain: E, crown_role: "auto" })
                ),
                b(
                  "头饰岗位",
                  "crown_role",
                  [{ id: "auto", label: "自动匹配" }, ...(u == null ? void 0 : u.roles) || []],
                  void 0,
                  !u
                )
              ),
              s.createElement(or, {
                parts: ["crown"],
                value: t,
                onChange: r,
                disabled: a
              })
            )
          ),
          s.createElement(
            "div",
            { className: "ugsci-avatar-option" },
            s.createElement("span", null, "头像背景"),
            s.createElement(
              "div",
              { className: "ugsci-avatar-option-row" },
              s.createElement(
                "span",
                { className: "ugsci-avatar-background-value" },
                (y = (h = t.colors) == null ? void 0 : h.background) != null && y.startsWith("#") ? t.colors.background : "透明"
              ),
              s.createElement(or, {
                parts: ["background"],
                value: t,
                onChange: r,
                disabled: a
              })
            )
          )
        ),
        s.createElement(
          "label",
          { className: "ugsci-avatar-category" },
          "领域名称",
          s.createElement("input", {
            "aria-label": "自定义领域名称",
            maxLength: 64,
            value: t.category_label,
            disabled: a,
            placeholder: "自定义名称",
            onChange: (E) => p({ category_label: E.target.value })
          })
        )
      ),
      i && s.createElement(
        "div",
        { className: "ugsci-avatar-editor-footer" },
        s.createElement(Bi, {
          disabled: a,
          onClick: () => p({ colors: {} })
        })
      )
    )
  );
}
function fl({
  expert: e,
  onRefresh: t,
  onDirtyChange: n
}) {
  const r = z().React, { useState: a, useEffect: i } = r, { Input: s, Select: l, Button: o, Alert: d, message: c } = z().antd, [u, m] = a(null), [p, b] = a(""), [g, f] = a(""), [h, y] = a(!1), [E, v] = a(!1), S = _t(e);
  i(() => {
    let x = !0;
    return Gn(e.agent.id, !0).then((R) => {
      x && (m(R), b(JSON.stringify(R)));
    }).catch((R) => {
      x && f(R.message || "无法读取显示配置");
    }), () => {
      x = !1;
    };
  }, [e.agent.id]);
  const B = !!u && JSON.stringify(u) !== p;
  i(() => {
    n(B);
  }, [B, n]);
  const N = (x, R) => m((H) => H && { ...H, [x]: R }), w = async () => {
    if (u) {
      y(!0);
      try {
        const x = await Nr(e.agent.id, u);
        m(x), b(JSON.stringify(x)), Ct(), t(), c.success("专家显示信息已保存");
      } catch (x) {
        c.error(x.message || "保存失败，修改内容已保留");
      } finally {
        y(!1);
      }
    }
  };
  return g ? r.createElement(d, {
    type: "error",
    showIcon: !0,
    message: "显示配置暂不可用",
    description: g
  }) : u ? r.createElement(
    "div",
    null,
    r.createElement("h3", null, "基本信息"),
    r.createElement(
      "details",
      { className: "ugsci-avatar-settings", open: E },
      r.createElement(
        "summary",
        {
          onClick: (x) => {
            x.preventDefault(), v((R) => !R);
          }
        },
        "专家头像工坊"
      ),
      E && r.createElement(Hi, {
        name: u.display_name || e.agent.name,
        value: kt({ ...e, presentation: u }),
        suggested: kt({
          ...e,
          presentation: { ...u, avatar: null }
        }),
        disabled: h,
        onChange: (x) => m(
          (R) => R && { ...R, avatar: x }
        )
      })
    ),
    r.createElement(
      "p",
      { className: "ugsci-settings-intro" },
      "设置卡片的显示名称、分类和简介。留空使用自动摘要，不改变专家指令。"
    ),
    r.createElement(
      "div",
      { className: "ugsci-expert-settings-grid" },
      r.createElement(
        "label",
        null,
        "显示名称",
        r.createElement(s, {
          "aria-label": "显示名称",
          value: u.display_name,
          placeholder: e.agent.name,
          maxLength: 60,
          onChange: (x) => N("display_name", x.target.value)
        })
      ),
      r.createElement(
        "label",
        null,
        "专家分类",
        r.createElement(l, {
          "aria-label": "专家分类",
          value: u.category || "auto",
          disabled: !!e.agent.managed_by_app,
          onChange: (x) => N("category", x === "auto" ? null : x),
          options: [
            { value: "auto", label: `自动分类 · ${S.category}` },
            ...Ri.slice(1).map((x) => ({
              value: x,
              label: x
            }))
          ]
        })
      ),
      r.createElement(
        "label",
        null,
        "专业方向",
        r.createElement(s, {
          "aria-label": "专业方向",
          value: u.specialty,
          disabled: !!e.agent.managed_by_app,
          placeholder: S.specialty,
          maxLength: 50,
          onChange: (x) => N("specialty", x.target.value)
        })
      ),
      r.createElement(
        "label",
        { className: "full" },
        "卡片简介",
        r.createElement(s.TextArea, {
          "aria-label": "卡片简介",
          value: u.summary,
          placeholder: S.summary,
          rows: 3,
          maxLength: 180,
          showCount: !0,
          onChange: (x) => N("summary", x.target.value)
        })
      )
    ),
    r.createElement(
      "div",
      { className: "ugsci-settings-save" },
      r.createElement(
        "span",
        { role: "status" },
        B ? "有未保存的修改" : "修改仅用于专家卡片展示"
      ),
      r.createElement(
        o,
        { type: "primary", loading: h, disabled: !B, onClick: w },
        "保存基本信息"
      )
    )
  ) : r.createElement("p", null, "正在读取显示配置…");
}
function Ui(e, t, n) {
  const { useRef: r, useEffect: a } = z().React, i = r(null), s = JSON.stringify(t);
  return a(() => {
    e || (i.current === null && (i.current = s), n == null || n(i.current !== s));
  }, [e, s, n]), () => {
    i.current = s, n == null || n(!1);
  };
}
const yl = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function hl({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: r,
  loading: a,
  onInstall: i
}) {
  const s = z().React, { useState: l, useEffect: o, useMemo: d } = s, { Modal: c, Button: u, Empty: m, Spin: p, Input: b, Tag: g, Tooltip: f, Typography: h } = z().antd, { CheckOutlined: y, SearchOutlined: E } = z().antdIcons || {}, { Text: v } = h, [S, B] = l([]), [N, w] = l("");
  o(() => {
    e && (B([]), w(""));
  }, [e]);
  const x = d(() => {
    if (!N.trim()) return n;
    const T = N.toLowerCase();
    return n.filter(
      ($) => {
        var F, C;
        return $.name.toLowerCase().includes(T) || Oe($.name).toLowerCase().includes(T) || ((F = $.description) == null ? void 0 : F.toLowerCase().includes(T)) || ((C = $.tags) == null ? void 0 : C.some((I) => I.toLowerCase().includes(T)));
      }
    );
  }, [n, N]), R = x.filter(
    (T) => !r.includes(T.name)
  ), H = (T) => {
    B(
      ($) => $.includes(T) ? $.filter((F) => F !== T) : [...$, T]
    );
  }, _ = async () => {
    S.length !== 0 && (await i(S), B([]));
  };
  return s.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: s.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        s.createElement(
          v,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${S.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(u, { onClick: t }, "取消"),
          s.createElement(
            u,
            {
              type: "primary",
              onClick: _,
              disabled: S.length === 0
            },
            S.length > 0 ? `添加 (${S.length})` : "添加"
          )
        )
      )
    },
    // Search + bulk actions bar
    s.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      s.createElement(b, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: E ? s.createElement(E) : void 0,
        value: N,
        onChange: (T) => w(T.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        u,
        {
          size: "small",
          type: "primary",
          onClick: () => B(R.map((T) => T.name))
        },
        "全选"
      ),
      s.createElement(
        u,
        {
          size: "small",
          onClick: () => B([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(p, { size: "large" })
    ) : x.length === 0 ? s.createElement(m, {
      description: N ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : s.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
          gap: 8,
          maxHeight: 360,
          overflowY: "auto",
          padding: 2
        }
      },
      ...x.map((T) => {
        const $ = S.includes(T.name), F = r.includes(T.name);
        return s.createElement(
          "div",
          {
            key: T.name,
            onClick: () => !F && H(T.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${$ ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: F ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: $ ? "rgba(0, 114, 245, 0.06)" : F ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: F ? 0.5 : 1,
              minHeight: 64
            }
          },
          $ ? s.createElement(
            "span",
            {
              style: {
                position: "absolute",
                top: 6,
                right: 6,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#0072f5",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10
              }
            },
            y ? s.createElement(y) : "✓"
          ) : null,
          F ? s.createElement(
            "span",
            {
              style: {
                position: "absolute",
                top: 6,
                right: 8,
                fontSize: 10,
                color: "var(--ant-color-text-quaternary, #bbb)"
              }
            },
            "已安装"
          ) : null,
          s.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
                paddingRight: F || $ ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              T.emoji || "⚡"
            ),
            s.createElement(
              f,
              { title: Oe(T.name) },
              s.createElement(
                v,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                Oe(T.name)
              )
            )
          ),
          T.description ? s.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: "1.4"
              }
            },
            T.description
          ) : null,
          T.tags && T.tags.length > 0 ? s.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...T.tags.slice(0, 2).map(
              (C, I) => s.createElement(
                g,
                {
                  key: I,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                C
              )
            )
          ) : null
        );
      })
    )
  );
}
const Ra = `
.ugsci-file-list-toolbar,.ugsci-file-list-toolbar>div{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:space-between;}
.ugsci-file-list-toolbar{margin-bottom:16px;font-size:13px;}
.ugsci-expert-files small{color:var(--expert-muted);font-size:12px;}
.ugsci-files-expanded [class*="-modal-content"]{height:calc(100dvh - 48px);max-height:1000px;}
.ugsci-files-expanded .ugsci-expert-settings-identity{padding:12px 24px;}
.ugsci-files-expanded .ugsci-settings-tabs>[class*="-tabs-nav"]{display:none;}
.ugsci-files-expanded .ugsci-settings-tabs>[class*="-tabs-content-holder"]{border:0;margin:0;}
.ugsci-files-expanded .ugsci-settings-tabs [class*="-tabs-tabpane"]{padding:0!important;overflow:hidden;scrollbar-gutter:auto;}
.ugsci-files-expanded .ugsci-settings-files,.ugsci-files-expanded .ugsci-settings-files>div{height:100%;display:flex;flex-direction:column;min-height:0;}
.ugsci-files-expanded .ugsci-settings-files>div>h3,.ugsci-files-expanded .ugsci-settings-files>div>.ugsci-settings-intro{display:none;}
.ugsci-file-workbench{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;}
.ugsci-file-workbench-toolbar{display:flex;align-items:center;gap:12px;padding:12px 24px;border-bottom:1px solid var(--expert-line);flex-shrink:0;flex-wrap:wrap;}
.ugsci-file-workbench-title{font-size:13px;color:var(--expert-muted);margin-right:auto;}
.ugsci-file-workbench-body{display:grid;grid-template-columns:230px minmax(0,1fr);flex:1;min-height:0;}
.ugsci-file-nav{background:var(--expert-subtle);border-right:1px solid var(--expert-line);min-height:0;display:flex;flex-direction:column;padding:16px 10px 10px;}
.ugsci-file-nav-heading{display:flex;justify-content:space-between;align-items:center;padding:0 8px 14px;font-size:12px;flex-shrink:0;}
.ugsci-file-nav-heading strong{font-weight:500;color:var(--expert-muted);}
.ugsci-file-nav nav{overflow:auto;flex:1;min-height:0;}
.ugsci-file-nav-item{display:block;width:100%;padding:12px 10px;margin:0 0 4px;text-align:left;border:1px solid transparent;background:transparent;border-radius:8px;font:inherit;font-size:13px;color:inherit;cursor:pointer;overflow-wrap:anywhere;}
.ugsci-file-nav-item>span{display:flex;align-items:start;justify-content:space-between;gap:6px;font-weight:500;}
.ugsci-file-nav-item>span>small{font-weight:400;font-size:10px;flex-shrink:0;line-height:20px;}
.ugsci-file-nav-item>small{display:block;margin-top:5px;font-size:11px;}
.ugsci-file-nav-item:hover{background:var(--expert-surface);}
.ugsci-file-nav-item[aria-current=page]{background:var(--expert-surface);border-color:var(--expert-line);box-shadow:inset 3px 0 var(--expert-primary);}
.ugsci-file-nav-item:focus-visible{outline:2px solid var(--expert-primary);outline-offset:-2px;}
.ugsci-file-nav>p{font-size:11px;line-height:1.6;color:var(--expert-muted);padding:14px 8px 0;margin:0;flex-shrink:0;}
.ugsci-file-document{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden;}
.ugsci-file-document-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:22px 28px 16px;flex-shrink:0;}
.ugsci-file-document-heading h3{font-size:18px;margin:0!important;overflow-wrap:anywhere;}
.ugsci-file-document-heading p{font-size:12px;color:var(--expert-muted);margin:6px 0 0;}
.ugsci-file-mount{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--expert-muted);}
.ugsci-file-name{display:flex;align-items:center;gap:10px;padding:0 28px 16px;font-size:12px;flex-wrap:wrap;}
.ugsci-file-name input{width:250px;}
.ugsci-file-viewbar{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:0 28px 16px;flex-shrink:0;}
.ugsci-file-editors{display:grid;grid-template-columns:minmax(0,1fr);flex:1;min-height:0;border-top:1px solid var(--expert-line);}
.ugsci-file-view-split{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
.ugsci-file-source{display:flex;min-height:0;min-width:0;background:var(--expert-subtle);}
.ugsci-file-source textarea{display:block;flex:1;width:100%;height:100%!important;min-height:0!important;resize:none;border:0;border-radius:0;box-shadow:none;padding:24px 28px;background:transparent;color:inherit;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;line-height:1.9;tab-size:2;}
.ugsci-file-source textarea:focus-visible{box-shadow:inset 0 0 0 2px var(--expert-primary);}
.ugsci-file-preview{overflow:auto;min-width:0;min-height:0;padding:24px 32px;line-height:1.85;font-size:14px;overflow-wrap:anywhere;white-space:pre-wrap;}
.ugsci-file-view-split .ugsci-file-preview{border-left:1px solid var(--expert-line);}
.ugsci-file-preview>*{white-space:normal;}
.ugsci-file-preview h1{font-size:24px;line-height:1.4;margin:0 0 22px;}
.ugsci-file-preview h2{font-size:20px;margin:28px 0 14px;}
.ugsci-file-preview h3{font-size:16px;font-weight:600;margin:24px 0 12px;}
.ugsci-file-preview p{margin:0 0 14px;}
.ugsci-file-preview ul,.ugsci-file-preview ol{padding-left:24px;}
.ugsci-file-preview blockquote{border-left:3px solid var(--expert-line);padding:4px 16px;margin:16px 0;color:var(--expert-muted);}
.ugsci-file-preview pre{overflow:auto;padding:16px;border-radius:6px;background:var(--expert-subtle);white-space:pre;}
.ugsci-file-preview img{max-width:100%;}
.ugsci-file-preview table{border-collapse:collapse;display:block;max-width:100%;overflow:auto;}
.ugsci-file-preview td,.ugsci-file-preview th{padding:6px 10px;border:1px solid var(--expert-line);}
.ugsci-file-document-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 28px;border-top:1px solid var(--expert-line);flex-shrink:0;}
.ugsci-file-document-footer>span{font-size:11px;color:var(--expert-muted);}
.ugsci-file-feedback{display:flex;flex:1;min-height:0;align-items:center;justify-content:center;padding:24px;}
@media(max-width:900px){.ugsci-file-workbench-body{grid-template-columns:190px minmax(0,1fr);}.ugsci-file-document-heading{padding:18px;}.ugsci-file-viewbar,.ugsci-file-name{padding:0 18px 14px;}.ugsci-file-source textarea,.ugsci-file-preview{padding:18px;}}
@media(max-width:680px){.ugsci-files-expanded [class*="-modal-content"]{height:calc(100dvh - 24px);}.ugsci-files-expanded .ugsci-expert-settings-identity{padding:10px 14px;}.ugsci-file-workbench-toolbar{padding:10px 14px;gap:8px;}.ugsci-file-workbench-title{display:none;}.ugsci-file-workbench-toolbar>button:last-child{margin-left:auto;}.ugsci-file-workbench-body{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);}.ugsci-file-nav{padding:8px;border-right:0;border-bottom:1px solid var(--expert-line);}.ugsci-file-nav-heading,.ugsci-file-nav>p{display:none;}.ugsci-file-nav nav{display:flex;gap:6px;max-height:80px;}.ugsci-file-nav-item{width:auto;min-width:155px;flex-shrink:0;padding:8px;margin:0;}.ugsci-file-nav-item>small{display:none;}.ugsci-file-nav-item[aria-current=page]{box-shadow:inset 0 -2px var(--expert-primary);}.ugsci-file-document-heading{padding:12px 14px;}.ugsci-file-document-heading h3{font-size:16px;}.ugsci-file-viewbar{padding:0 14px 12px;}.ugsci-file-view-split{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(90px,1fr) minmax(90px,1fr);}.ugsci-file-view-split .ugsci-file-preview{border-left:0;border-top:1px solid var(--expert-line);}.ugsci-file-document-footer{padding:10px 14px;flex-wrap:wrap;}.ugsci-file-name{padding:0 14px 12px;}.ugsci-file-name input{width:100%;}.ugsci-file-source textarea,.ugsci-file-preview{padding:14px;}.ugsci-file-workbench :is(button,[class*="-segmented-item"]){min-height:36px;}.ugsci-file-workbench button[role=switch]{min-height:16px;}}
`, Jt = "__new_markdown__", lr = {
  "AGENTS.md": "行为规则与工作约定",
  "SOUL.md": "角色定位与表达风格",
  "PROFILE.md": "身份与背景资料",
  "BOOTSTRAP.md": "首次启动引导",
  "HEARTBEAT.md": "自动检查任务",
  "MEMORY.md": "长期记忆"
};
function Qt(e) {
  return e.isNew ? !!(e.name || e.content) : e.content !== e.baseline;
}
function bl({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: n,
  onDirtyChange: r,
  onEditorOpenChange: a,
  onSavingChange: i
}) {
  const s = z().React, { useState: l, useEffect: o, useRef: d } = s, {
    Button: c,
    Input: u,
    List: m,
    Switch: p,
    Tag: b,
    Spin: g,
    Empty: f,
    Segmented: h,
    Alert: y,
    Modal: E,
    message: v
  } = z().antd, [S, B] = E.useModal(), [N, w] = l([]), [x, R] = l(!0), [H, _] = l(""), [T, $] = l(t), [F, C] = l(!1), [I, L] = l({}), [M, P] = l(null), [W, G] = l("split"), [U, Q] = l(!1), [D, Y] = l(""), ne = d(!0), re = d(0), se = d(/* @__PURE__ */ new Map()), X = d(0), pe = d(!1), ye = Object.values(I).some(Qt), q = M ? I[M] : void 0;
  o(() => (ne.current = !0, () => {
    ne.current = !1;
  }), []), o(() => {
    r == null || r(ye);
  }, [ye, r]), o(() => {
    i == null || i(U || F);
  }, [U, F, i]), o(() => {
    pe.current || $(t);
  }, [t]);
  async function j() {
    const Z = ++re.current;
    R(!0), _(""), Vn(e);
    try {
      const A = await Vo(e);
      ne.current && Z === re.current && w(A);
    } catch (A) {
      ne.current && Z === re.current && _(A.message || "加载工作区文档失败");
    } finally {
      ne.current && Z === re.current && R(!1);
    }
  }
  o(() => {
    j();
  }, [e]);
  async function ge(Z) {
    const A = ++X.current;
    se.current.set(Z, A), L((O) => ({
      ...O,
      [Z]: {
        name: Z,
        content: "",
        baseline: "",
        isNew: !1,
        loading: !0,
        error: ""
      }
    }));
    try {
      const O = await he(
        `/workspace/files/${encodeURIComponent(Z)}`,
        {
          headers: { "X-Agent-Id": e },
          bypassCache: !0
        }
      );
      if (!ne.current || se.current.get(Z) !== A)
        return;
      L((K) => ({
        ...K,
        [Z]: {
          ...K[Z],
          content: O.content || "",
          baseline: O.content || "",
          loading: !1
        }
      }));
    } catch (O) {
      if (!ne.current || se.current.get(Z) !== A)
        return;
      L((K) => ({
        ...K,
        [Z]: {
          ...K[Z],
          loading: !1,
          error: O.message || "读取文件失败"
        }
      }));
    }
  }
  function we(Z) {
    a == null || a(!0), P(Z), Y(""), I[Z] || ge(Z);
  }
  function ve() {
    a == null || a(!0), L(
      (Z) => Z[Jt] ? Z : {
        ...Z,
        [Jt]: {
          name: "",
          content: "",
          baseline: "",
          isNew: !0,
          loading: !1,
          error: ""
        }
      }
    ), P(Jt), Y("");
  }
  function ue(Z) {
    M && (L((A) => ({
      ...A,
      [M]: { ...A[M], ...Z }
    })), Y(""));
  }
  function Se() {
    if (pe.current) return;
    const Z = () => {
      se.current.clear(), a == null || a(!1), L({}), P(null), Y("");
    };
    if (!ye) return Z();
    S.confirm({
      title: "还有未保存的文档修改",
      content: "返回将放弃所有文档草稿，已保存的文件会保留。",
      okText: "放弃修改并返回",
      cancelText: "继续编辑",
      onOk: Z
    });
  }
  async function xe(Z, A) {
    if (pe.current) return;
    if (!A && Z === "AGENTS.md") {
      v.warning("AGENTS.md 是核心配置文件，不能取消挂载");
      return;
    }
    const O = T, K = A ? [.../* @__PURE__ */ new Set([...O, Z])] : O.filter((V) => V !== Z);
    pe.current = !0, C(!0), $(K);
    try {
      if (await Zo(e, K), !ne.current) return;
      v.success(A ? "已挂载到系统提示" : "已取消挂载"), n();
    } catch (V) {
      if (!ne.current) return;
      $(O), v.error(V.message || "更新挂载失败");
    } finally {
      pe.current = !1, ne.current && C(!1);
    }
  }
  async function Ie() {
    if (!M || !q || q.loading || q.error || !Qt(q) || pe.current)
      return;
    const Z = M, A = q;
    let O;
    try {
      if (O = Wo(A.name), A.isNew && N.some(
        (K) => K.filename.toLowerCase() === O.toLowerCase()
      ))
        throw new Error("同名文件已存在，请更换文件名");
      if (!A.content.trim()) throw new Error("请输入文档内容");
      if (new TextEncoder().encode(A.content).length > 1024 * 1024)
        throw new Error("文档内容不能超过 1 MB");
    } catch (K) {
      Y(K.message);
      return;
    }
    pe.current = !0, Q(!0), Y("");
    try {
      if (A.isNew) {
        const K = await Fo(
          e,
          O,
          A.content,
          !0
        );
        if (!ne.current) return;
        $(K.system_prompt_files);
      } else await Ot(e, O, A.content);
      if (!ne.current) return;
      L((K) => {
        const V = { ...K };
        return V[O] = {
          ...K[Z],
          name: O,
          baseline: A.content,
          isNew: !1
        }, Z !== O && delete V[Z], V;
      }), P((K) => K === Z ? O : K), v.success("文档已保存"), j(), n();
    } catch (K) {
      ne.current && Y(K.message || "保存失败，请重试");
    } finally {
      pe.current = !1, ne.current && Q(!1);
    }
  }
  const _e = (Z) => /* @__PURE__ */ s.createElement(
    p,
    {
      "aria-label": `挂载 ${Z}`,
      size: "small",
      checked: T.includes(Z),
      disabled: U || F || Z === "AGENTS.md",
      onChange: (A) => void xe(Z, A)
    }
  ), oe = /* @__PURE__ */ s.createElement(c, { onClick: ve, disabled: U || F }, "新建 Markdown 文档"), te = H ? /* @__PURE__ */ s.createElement(
    y,
    {
      type: "error",
      showIcon: !0,
      message: H,
      action: /* @__PURE__ */ s.createElement(c, { onClick: () => void j() }, "重试")
    }
  ) : null;
  if (M === null)
    return /* @__PURE__ */ s.createElement("div", { className: "ugsci-expert-files" }, /* @__PURE__ */ s.createElement("style", null, Ra), B, /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-list-toolbar" }, /* @__PURE__ */ s.createElement("span", null, "工作区文档 (", N.length, ")", " ", /* @__PURE__ */ s.createElement("small", null, "· ", T.length, " 个已挂载")), /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement(c, { onClick: () => void j(), loading: x }, "刷新"), oe)), te, /* @__PURE__ */ s.createElement(g, { spinning: x }, /* @__PURE__ */ s.createElement(
      m,
      {
        dataSource: N,
        locale: {
          emptyText: /* @__PURE__ */ s.createElement(
            f,
            {
              description: "暂无 Markdown 文档",
              image: f.PRESENTED_IMAGE_SIMPLE
            }
          )
        },
        renderItem: (Z) => /* @__PURE__ */ s.createElement(
          m.Item,
          {
            actions: [
              /* @__PURE__ */ s.createElement(
                c,
                {
                  key: "edit",
                  type: "link",
                  "aria-label": `编辑 ${Z.filename}`,
                  onClick: () => we(Z.filename)
                },
                "编辑"
              )
            ]
          },
          /* @__PURE__ */ s.createElement(
            m.Item.Meta,
            {
              title: /* @__PURE__ */ s.createElement("span", null, Z.filename, " ", /* @__PURE__ */ s.createElement(b, null, yl.includes(Z.filename) ? "内置" : "工作文档")),
              description: `${lr[Z.filename] || "自定义参考文档"} · ${(Z.size / 1024).toFixed(1)} KB · 修改于 ${new Date(
                Z.modified_time
              ).toLocaleString()}`
            }
          ),
          _e(Z.filename)
        )
      }
    )));
  const le = [
    ...N.map((Z) => Z.filename),
    ...Object.keys(I).filter(
      (Z) => !N.some((A) => A.filename === Z)
    )
  ];
  return /* @__PURE__ */ s.createElement(
    "div",
    {
      className: "ugsci-expert-files ugsci-file-workbench",
      role: "region",
      "aria-label": "专家文档工作台"
    },
    /* @__PURE__ */ s.createElement("style", null, Ra),
    B,
    /* @__PURE__ */ s.createElement("header", { className: "ugsci-file-workbench-toolbar" }, /* @__PURE__ */ s.createElement(c, { onClick: Se, disabled: U || F }, "返回专家设置"), /* @__PURE__ */ s.createElement("span", { className: "ugsci-file-workbench-title" }, "文件与提示词"), oe),
    /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-workbench-body" }, /* @__PURE__ */ s.createElement("aside", { className: "ugsci-file-nav", "aria-label": "工作区文档" }, /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-nav-heading" }, /* @__PURE__ */ s.createElement("strong", null, "工作区文档"), /* @__PURE__ */ s.createElement(
      c,
      {
        size: "small",
        onClick: () => void j(),
        loading: x
      },
      "刷新"
    )), te, /* @__PURE__ */ s.createElement("nav", null, le.map((Z) => {
      const A = I[Z], O = (A == null ? void 0 : A.name) || (Z === Jt ? "未命名文档" : Z);
      return /* @__PURE__ */ s.createElement(
        "button",
        {
          key: Z,
          type: "button",
          className: "ugsci-file-nav-item",
          disabled: U || F,
          "aria-current": M === Z ? "page" : void 0,
          onClick: () => we(Z)
        },
        /* @__PURE__ */ s.createElement("span", null, O, /* @__PURE__ */ s.createElement("small", null, A && Qt(A) ? "未保存" : T.includes(Z) ? "已挂载" : "未挂载")),
        /* @__PURE__ */ s.createElement("small", null, lr[Z] || (Z === Jt ? "保存后自动挂载" : "自定义参考文档"))
      );
    })), /* @__PURE__ */ s.createElement("p", null, "已挂载的文件会加入专家的系统提示。")), /* @__PURE__ */ s.createElement("main", { className: "ugsci-file-document" }, /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-document-heading" }, /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement("h3", null, q != null && q.isNew ? "新建文档" : M), /* @__PURE__ */ s.createElement("p", null, lr[M] || "自定义参考文档")), q && !q.isNew && /* @__PURE__ */ s.createElement("label", { className: "ugsci-file-mount" }, "加入系统提示 ", _e(M))), (q == null ? void 0 : q.isNew) && /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-name" }, /* @__PURE__ */ s.createElement("label", { htmlFor: "ugsci-new-document-name" }, "文件名"), /* @__PURE__ */ s.createElement(
      u,
      {
        id: "ugsci-new-document-name",
        value: q.name,
        disabled: U,
        placeholder: "例如 REFERENCE.md",
        onChange: (Z) => ue({ name: Z.target.value })
      }
    ), /* @__PURE__ */ s.createElement("small", null, "保存后自动挂载到系统提示")), /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-viewbar" }, /* @__PURE__ */ s.createElement(
      h,
      {
        "aria-label": "文档视图",
        options: [
          { label: "源码", value: "source" },
          { label: "分栏", value: "split" },
          { label: "预览", value: "preview" }
        ],
        value: W,
        onChange: (Z) => G(Z)
      }
    ), /* @__PURE__ */ s.createElement("small", null, "Markdown")), D && /* @__PURE__ */ s.createElement(y, { type: "error", showIcon: !0, message: D }), q != null && q.loading ? /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-feedback" }, /* @__PURE__ */ s.createElement(g, null), /* @__PURE__ */ s.createElement("span", { role: "status" }, "正在读取文档")) : q != null && q.error ? /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-feedback" }, /* @__PURE__ */ s.createElement(
      y,
      {
        type: "error",
        showIcon: !0,
        message: q.error,
        action: /* @__PURE__ */ s.createElement(c, { onClick: () => void ge(M) }, "重新读取")
      }
    )) : q && /* @__PURE__ */ s.createElement("div", { className: `ugsci-file-editors ugsci-file-view-${W}` }, W !== "preview" && /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-source" }, /* @__PURE__ */ s.createElement(
      u.TextArea,
      {
        "aria-label": "Markdown 源码",
        spellCheck: !1,
        value: q.content,
        onChange: (Z) => ue({ content: Z.target.value }),
        onKeyDown: (Z) => {
          (Z.ctrlKey || Z.metaKey) && Z.key.toLowerCase() === "s" && (Z.preventDefault(), Ie());
        }
      }
    )), W !== "source" && /* @__PURE__ */ s.createElement(
      "article",
      {
        className: "ugsci-file-preview",
        "aria-label": "Markdown 预览",
        style: {
          whiteSpace: z().ReactMarkdown && z().remarkGfm ? "normal" : "pre-wrap"
        }
      },
      q.content ? St(q.content, s) : /* @__PURE__ */ s.createElement(
        f,
        {
          description: "输入 Markdown 后在这里预览",
          image: f.PRESENTED_IMAGE_SIMPLE
        }
      )
    )), /* @__PURE__ */ s.createElement("footer", { className: "ugsci-file-document-footer" }, /* @__PURE__ */ s.createElement("span", { role: "status" }, q && !q.loading && !q.error ? `${q.content.length} 字符 · 约 ${Math.ceil(
      q.content.length / 4
    )} tokens · ${q.isNew ? "待创建" : Qt(q) ? "未保存" : "已保存"}` : ""), /* @__PURE__ */ s.createElement(
      c,
      {
        type: "primary",
        style: Xe,
        onClick: () => void Ie(),
        loading: U,
        disabled: !q || q.loading || !!q.error || F || !Qt(q)
      },
      "保存文档"
    ))))
  );
}
const Bt = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "var(--app-text, var(--ant-color-text))",
  display: "flex",
  alignItems: "center",
  gap: 4
}, ji = { marginBottom: 16 }, Di = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, La = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--app-text, var(--ant-color-text))",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid var(--app-border, var(--ant-color-border-secondary))"
}, qi = {
  fontSize: 12,
  color: "var(--app-text-secondary, var(--ant-color-text-secondary))",
  marginLeft: 8
};
function vl({
  agentId: e,
  onDirtyChange: t
}) {
  const n = z().React, { useState: r, useEffect: a, useCallback: i } = n, {
    Switch: s,
    InputNumber: l,
    Select: o,
    Button: d,
    Spin: c,
    Space: u,
    Typography: m,
    message: p
  } = z().antd, { PlayCircleOutlined: b, SaveOutlined: g } = z().antdIcons || {}, { Text: f } = m, [h, y] = r(!0), [E, v] = r(!1), [S, B] = r(!1), [N, w] = r(!1), [x, R] = r(6), [H, _] = r("h"), [T, $] = r("main"), [F, C] = r(300), [I, L] = r(!1), [M, P] = r("08:00"), [W, G] = r("22:00"), U = Ui(
    h,
    {
      enabled: N,
      everyNumber: x,
      everyUnit: H,
      target: T,
      timeoutSeconds: F,
      useActiveHours: I,
      activeHoursStart: M,
      activeHoursEnd: W
    },
    t
  ), Q = i(async () => {
    var X, pe;
    y(!0);
    try {
      const ye = await rl(e), q = tl(ye.every ?? "6h");
      w(ye.enabled ?? !1), R(q.number), _(q.unit), $(ye.target ?? "main"), C(ye.timeoutSeconds ?? 300), L(!!ye.activeHours), P(((X = ye.activeHours) == null ? void 0 : X.start) ?? "08:00"), G(((pe = ye.activeHours) == null ? void 0 : pe.end) ?? "22:00");
    } catch (ye) {
      p.error(ye.message || "加载心跳配置失败");
    } finally {
      y(!1);
    }
  }, [e]);
  a(() => {
    Q();
  }, [Q]);
  const D = async () => {
    v(!0);
    try {
      await al(e, {
        enabled: N,
        every: nl({ number: x, unit: H }),
        target: T,
        timeoutSeconds: F,
        activeHours: I && M && W ? { start: M, end: W } : void 0
      }), U(), p.success("心跳配置已保存");
    } catch (X) {
      p.error(X.message || "保存心跳配置失败");
    } finally {
      v(!1);
    }
  }, Y = async () => {
    B(!0);
    try {
      await il(e), p.success("已触发心跳检查");
    } catch (X) {
      p.error(X.message || "触发心跳失败");
    } finally {
      B(!1);
    }
  };
  if (h)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(c, { size: "large" })
    );
  const ne = (X, pe, ye) => n.createElement(
    "div",
    { style: ji },
    n.createElement("div", { style: Bt }, X),
    pe,
    ye ? n.createElement(
      f,
      { type: "secondary", style: qi },
      ye
    ) : null
  ), re = (X, pe, ye, q) => n.createElement(
    "div",
    { className: "ugsci-config-pair", style: Di },
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Bt }, X),
      pe
    ),
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Bt }, ye),
      q
    )
  ), { Divider: se } = z().antd;
  return n.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    n.createElement("div", { style: La }, "基本设置"),
    ne(
      "启用心跳",
      n.createElement(s, {
        checked: N,
        onChange: (X) => w(X)
      }),
      N ? "已启用，专家将定期自检" : "已停用"
    ),
    re(
      "检查频率",
      n.createElement(
        u,
        null,
        n.createElement(l, {
          min: 1,
          value: x,
          onChange: (X) => R(X ?? 1),
          style: { width: "100%" }
        }),
        n.createElement(o, {
          value: H,
          onChange: (X) => _(X),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      n.createElement(o, {
        value: T,
        onChange: (X) => $(X),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    ne(
      "超时时间 (秒)",
      n.createElement(l, {
        min: 1,
        max: 3600,
        value: F,
        onChange: (X) => C(X ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    n.createElement(se, { style: { margin: "8px 0 16px" } }),
    n.createElement("div", { style: La }, "活跃时段"),
    ne(
      "启用活跃时段限制",
      n.createElement(s, {
        checked: I,
        onChange: (X) => L(X)
      }),
      "仅在指定时段内触发心跳"
    ),
    I ? re(
      "开始时间",
      n.createElement("input", {
        type: "time",
        value: M,
        onChange: (X) => P(X.target.value),
        style: {
          width: "100%",
          padding: "4px 11px",
          borderRadius: 6,
          border: "1px solid var(--ant-color-border, #d9d9d9)",
          fontSize: 14
        }
      }),
      "结束时间",
      n.createElement("input", {
        type: "time",
        value: W,
        onChange: (X) => G(X.target.value),
        style: {
          width: "100%",
          padding: "4px 11px",
          borderRadius: 6,
          border: "1px solid var(--ant-color-border, #d9d9d9)",
          fontSize: 14
        }
      })
    ) : null,
    // ── Action buttons ──
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 16,
          gap: 8
        }
      },
      n.createElement(
        d,
        {
          type: "primary",
          icon: g ? n.createElement(g) : void 0,
          loading: E,
          onClick: D,
          style: Xe
        },
        "保存配置"
      ),
      n.createElement(
        d,
        {
          icon: b ? n.createElement(b) : void 0,
          loading: S,
          onClick: Y
        },
        "立即执行"
      )
    )
  );
}
function El({
  agentId: e,
  onRefresh: t
}) {
  const n = z().React, { useState: r, useEffect: a, useCallback: i } = n, {
    List: s,
    Tag: l,
    Switch: o,
    Button: d,
    Empty: c,
    Spin: u,
    Typography: m,
    message: p
  } = z().antd, { PlusOutlined: b, ReloadOutlined: g, DeleteOutlined: f } = z().antdIcons || {}, { Text: h, Paragraph: y } = m, [E, v] = r([]), [S, B] = r(!0), [N, w] = r(!1), [x, R] = r([]), [H, _] = r(!1), T = i(async () => {
    B(!0);
    try {
      const M = await Zn(e);
      v(M);
    } catch (M) {
      p.error(M.message || "加载技能失败"), v([]);
    } finally {
      B(!1);
    }
  }, [e]);
  a(() => {
    T();
  }, [T]);
  const $ = async () => {
    w(!0), _(!0);
    try {
      const M = await Hr(!0);
      R(M);
    } catch (M) {
      p.error(M.message || "加载技能池失败");
    } finally {
      _(!1);
    }
  }, F = async (M) => {
    let P = 0, W = 0;
    for (const G of M)
      try {
        await Li(e, G), P++;
      } catch {
        W++;
      }
    P > 0 ? (p.success(
      `成功添加 ${P} 个技能${W > 0 ? `，${W} 个失败` : ""}`
    ), T(), t()) : W > 0 && p.error("添加技能失败"), w(!1);
  }, C = async (M, P) => {
    try {
      P ? await Pi(e, M.name) : await Ni(e, M.name), p.success(P ? "已启用" : "已停用"), T(), t();
    } catch (W) {
      p.error(W.message || "操作失败");
    }
  }, I = async (M) => {
    try {
      await Oi(e, M), p.success(`技能「${M}」已移除`), T(), t();
    } catch (P) {
      p.error(P.message || "移除技能失败");
    }
  };
  if (S)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(u, { size: "large" })
    );
  const L = E.filter((M) => M.enabled !== !1);
  return n.createElement(
    "div",
    null,
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      n.createElement(
        h,
        { strong: !0 },
        `技能列表 (${E.length}，已启用 ${L.length})`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          d,
          {
            size: "small",
            icon: g ? n.createElement(g) : void 0,
            onClick: () => {
              Ct(), T();
            }
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: b ? n.createElement(b) : void 0,
            onClick: $,
            style: Xe
          },
          "从技能池添加"
        )
      )
    ),
    E.length === 0 ? n.createElement(c, {
      description: "该专家暂无技能",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(s, {
      dataSource: E,
      renderItem: (M) => n.createElement(
        s.Item,
        {
          actions: [
            n.createElement(o, {
              key: "toggle",
              size: "small",
              checked: M.enabled !== !1,
              onChange: (P) => C(M, P)
            }),
            n.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: f ? n.createElement(f) : void 0,
                onClick: () => I(M.name)
              },
              "移除"
            )
          ]
        },
        n.createElement(
          "div",
          { style: { width: "100%" } },
          n.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            M.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              M.emoji
            ) : null,
            n.createElement(
              h,
              { strong: !0 },
              Oe(M.name)
            ),
            M.version_text ? n.createElement(
              l,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? n.createElement(
            y,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            M.description
          ) : null
        )
      )
    }),
    n.createElement(hl, {
      open: N,
      onClose: () => w(!1),
      poolSkills: x,
      installedSkillNames: E.map((M) => M.name),
      loading: H,
      onInstall: F
    })
  );
}
function wl({
  agentId: e,
  onRefresh: t,
  isActive: n
}) {
  const r = z().React, { useState: a, useEffect: i, useCallback: s } = r, {
    List: l,
    Tag: o,
    Button: d,
    Empty: c,
    Spin: u,
    Modal: m,
    Input: p,
    Typography: b,
    message: g
  } = z().antd, { PlusOutlined: f, ReloadOutlined: h, DeleteOutlined: y } = z().antdIcons || {}, { Text: E, Paragraph: v } = b, { TextArea: S } = p, [B, N] = a([]), [w, x] = a(!0), [R, H] = a(!1), [_, T] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [$, F] = a(!1), C = s(async () => {
    x(!0);
    try {
      const P = await Ur(e);
      N(P);
    } catch (P) {
      g.error(P.message || "加载 MCP 失败"), N([]);
    } finally {
      x(!1);
    }
  }, [e]);
  i(() => {
    C();
  }, [C]), i(() => {
    n && C();
  }, [n, C]);
  const I = async (P) => {
    try {
      await Yo(e, P), g.success("已切换 MCP 状态"), C(), t();
    } catch (W) {
      g.error(W.message || "切换失败");
    }
  }, L = async (P) => {
    try {
      await Xo(e, P), g.success(`MCP「${P}」已移除`), C(), t();
    } catch (W) {
      g.error(W.message || "移除 MCP 失败");
    }
  }, M = async () => {
    F(!0);
    try {
      const P = JSON.parse(_), W = P.mcpServers || P, G = Object.entries(W);
      if (G.length === 0) {
        g.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [U, Q] of G) {
        const D = Q, Y = D.url ? "streamable_http" : "stdio";
        await jr(e, {
          client_key: U,
          client: {
            name: D.name || U,
            description: D.description || "",
            enabled: !0,
            transport: Y,
            url: D.url || "",
            command: D.command || "",
            args: D.args || [],
            env: D.env || {},
            cwd: D.cwd || "",
            headers: D.headers || {}
          }
        });
      }
      g.success("MCP 客户端已创建"), H(!1), C(), t();
    } catch (P) {
      P instanceof SyntaxError ? g.error("JSON 格式错误：" + P.message) : g.error(P.message || "创建 MCP 失败");
    } finally {
      F(!1);
    }
  };
  return w ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(u, { size: "large" })
  ) : r.createElement(
    "div",
    null,
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      r.createElement(
        E,
        { strong: !0 },
        `MCP 客户端 (${B.length})`
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          d,
          {
            size: "small",
            icon: h ? r.createElement(h) : void 0,
            onClick: () => {
              Ct(), C();
            }
          },
          "刷新"
        ),
        r.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: f ? r.createElement(f) : void 0,
            onClick: () => H(!0),
            style: Xe
          },
          "添加 MCP"
        )
      )
    ),
    B.length === 0 ? r.createElement(c, {
      description: "该专家暂无 MCP 客户端",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(l, {
      dataSource: B,
      renderItem: (P) => r.createElement(
        l.Item,
        {
          actions: [
            r.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => I(P.key)
              },
              P.enabled ? "停用" : "启用"
            ),
            r.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: y ? r.createElement(y) : void 0,
                onClick: () => L(P.key)
              },
              "移除"
            )
          ]
        },
        r.createElement(
          "div",
          { style: { width: "100%" } },
          r.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            r.createElement(
              "span",
              { style: { fontSize: 14 } },
              "🔌"
            ),
            r.createElement(
              E,
              { strong: !0 },
              P.name || P.key
            ),
            r.createElement(
              o,
              {
                color: P.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              P.enabled ? "启用" : "停用"
            ),
            r.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              P.transport
            )
          ),
          P.description ? r.createElement(
            v,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            P.description
          ) : null,
          P.tools && P.tools.length > 0 ? r.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${P.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    r.createElement(
      m,
      {
        open: R,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => H(!1),
        onOk: M,
        confirmLoading: $,
        okText: "创建",
        width: 560
      },
      r.createElement(
        "div",
        {
          style: {
            marginBottom: 8,
            fontSize: 12,
            color: "var(--ant-color-text-tertiary, #8c8c8c)"
          }
        },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      r.createElement(S, {
        value: _,
        onChange: (P) => T(P.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function xl({
  agentId: e,
  onDirtyChange: t
}) {
  const n = z().React, { useState: r, useEffect: a, useCallback: i, useRef: s } = n, {
    Card: l,
    InputNumber: o,
    Input: d,
    Select: c,
    Switch: u,
    Button: m,
    Spin: p,
    Space: b,
    Typography: g,
    Divider: f,
    message: h
  } = z().antd, { SaveOutlined: y } = z().antdIcons || {}, { Text: E } = g, [v, S] = r(!0), [B, N] = r(!1), w = s(null), [x, R] = r(60), [H, _] = r(""), [T, $] = r(!0), [F, C] = r(30), [I, L] = r("zh"), [M, P] = r("UTC"), [W, G] = r(!0), [U, Q] = r(100), [D, Y] = r(!0), [ne, re] = r(3), [se, X] = r(1), [pe, ye] = r(!0), [q, j] = r(3), [ge, we] = r(2), [ve, ue] = r(60), [Se, xe] = r(1), [Ie, _e] = r(0), [oe, te] = r(1), [le, Z] = r(0), [A, O] = r(30), [K, V] = r(50), [fe, ee] = r("light"), [be, ke] = r("scroll"), [Ae, qe] = r("remelight"), [We, dt] = r("AUTO"), qt = Ui(
    v,
    {
      shellTimeout: x,
      shellExecutable: H,
      autoTitleEnabled: T,
      autoTitleTimeout: F,
      language: I,
      timezone: M,
      iterEnabled: W,
      maxIters: U,
      doomLoopEnabled: D,
      doomWindowSize: ne,
      doomSimilarity: se,
      llmRetryEnabled: pe,
      llmMaxRetries: q,
      llmBackoffBase: ge,
      llmBackoffCap: ve,
      llmMaxConcurrent: Se,
      llmMaxQpm: Ie,
      llmRateLimitPause: oe,
      llmRateLimitJitter: le,
      llmAcquireTimeout: A,
      historyMaxLength: K,
      contextBackend: fe,
      contextStrategy: be,
      memoryBackend: Ae,
      approvalLevel: We
    },
    t
  ), J = i(async () => {
    var me, Be, Ue, Ge, st, Ze;
    S(!0);
    try {
      const [$e, ut, ot] = await Promise.all([
        sl(e),
        ll(e).catch(() => "zh"),
        dl().catch(() => "UTC")
      ]);
      w.current = $e, R($e.shell_command_timeout ?? 60), _($e.shell_command_executable ?? "");
      const De = $e.auto_title_config ?? {
        enabled: !0,
        timeout_seconds: 30
      };
      $(De.enabled ?? !0), C(De.timeout_seconds ?? 30), L(ut), P(ot);
      const Le = $e.loop ?? {};
      G(((me = Le.iteration) == null ? void 0 : me.enabled) ?? !0), Q(((Be = Le.iteration) == null ? void 0 : Be.max_iterations) ?? $e.max_iters ?? 100), Y(((Ue = Le.doom_loop) == null ? void 0 : Ue.enabled) ?? !0), re(((Ge = Le.doom_loop) == null ? void 0 : Ge.window_size) ?? 3), X(((st = Le.doom_loop) == null ? void 0 : st.similarity_threshold) ?? 1), ye($e.llm_retry_enabled ?? !0), j($e.llm_max_retries ?? 3), we($e.llm_backoff_base ?? 2), ue($e.llm_backoff_cap ?? 60), xe($e.llm_max_concurrent ?? 1), _e($e.llm_max_qpm ?? 0), te($e.llm_rate_limit_pause ?? 1), Z($e.llm_rate_limit_jitter ?? 0), O($e.llm_acquire_timeout ?? 30), V($e.history_max_length ?? 50), ee($e.context_manager_backend ?? "light"), ke(((Ze = $e.light_context_config) == null ? void 0 : Ze.strategy) ?? "scroll"), qe($e.memory_manager_backend ?? "remelight"), dt($e.approval_level ?? "AUTO");
    } catch ($e) {
      h.error($e.message || "加载运行配置失败");
    } finally {
      S(!1);
    }
  }, [e]);
  a(() => {
    J();
  }, [J]);
  const Ee = async () => {
    var Be, Ue;
    const me = w.current;
    if (me) {
      N(!0);
      try {
        const Ge = {
          ...me,
          max_iters: U,
          loop: {
            ...me.loop ?? {},
            iteration: { enabled: W, max_iterations: U },
            doom_loop: {
              enabled: D,
              window_size: ne,
              similarity_threshold: se,
              stages: ((Ue = (Be = me.loop) == null ? void 0 : Be.doom_loop) == null ? void 0 : Ue.stages) ?? []
            }
          },
          shell_command_timeout: x,
          shell_command_executable: H,
          auto_title_config: {
            enabled: T,
            timeout_seconds: F
          },
          llm_retry_enabled: pe,
          llm_max_retries: q,
          llm_backoff_base: ge,
          llm_backoff_cap: ve,
          llm_max_concurrent: Se,
          llm_max_qpm: Ie,
          llm_rate_limit_pause: oe,
          llm_rate_limit_jitter: le,
          llm_acquire_timeout: A,
          history_max_length: K,
          context_manager_backend: fe,
          light_context_config: {
            ...me.light_context_config ?? {},
            strategy: be
          },
          memory_manager_backend: Ae,
          approval_level: We
        };
        await ol(e, Ge), w.current = Ge, I && await cl(e, I), M && await ul(M), qt(), h.success("运行配置已保存");
      } catch (Ge) {
        h.error(Ge.message || "保存运行配置失败");
      } finally {
        N(!1);
      }
    }
  };
  if (v)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(p, { size: "large" })
    );
  const Re = (me, Be, Ue) => n.createElement(
    "div",
    { style: ji },
    n.createElement("div", { style: Bt }, me),
    Be,
    Ue ? n.createElement(
      E,
      { type: "secondary", style: qi },
      Ue
    ) : null
  ), Ve = (me, Be, Ue, Ge) => n.createElement(
    "div",
    { className: "ugsci-config-pair", style: Di },
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Bt }, me),
      Be
    ),
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Bt }, Ue),
      Ge
    )
  );
  return n.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    n.createElement(
      "details",
      { className: "ugsci-config-section", open: !0 },
      n.createElement("summary", null, "基础设置"),
      Ve(
        "Shell 命令超时 (秒)",
        n.createElement(o, {
          min: 1,
          value: x,
          onChange: (me) => R(me ?? 60),
          style: { width: "100%" }
        }),
        "Shell 可执行文件",
        n.createElement(d, {
          value: H,
          onChange: (me) => _(me.target.value),
          placeholder: "留空使用系统默认",
          style: { width: "100%" }
        })
      ),
      Ve(
        "语言",
        n.createElement(c, {
          value: I,
          onChange: (me) => L(me),
          style: { width: "100%" },
          options: [
            { value: "zh", label: "中文" },
            { value: "en", label: "English" },
            { value: "id", label: "Bahasa Indonesia" },
            { value: "ru", label: "Русский" }
          ]
        }),
        "时区",
        n.createElement(c, {
          value: M,
          onChange: (me) => P(me),
          style: { width: "100%" },
          showSearch: !0,
          filterOption: (me, Be) => {
            var Ue;
            return (((Ue = Be == null ? void 0 : Be.label) == null ? void 0 : Ue.toString()) || "").toLowerCase().includes(me.toLowerCase());
          },
          options: [
            "UTC",
            "Asia/Shanghai",
            "Asia/Tokyo",
            "Asia/Singapore",
            "Asia/Kolkata",
            "Europe/London",
            "Europe/Paris",
            "America/New_York",
            "America/Los_Angeles",
            "America/Chicago",
            "Australia/Sydney"
          ].map((me) => ({ value: me, label: me }))
        })
      ),
      Ve(
        "自动生成会话标题",
        n.createElement(
          b,
          null,
          n.createElement(u, {
            checked: T,
            onChange: (me) => $(me)
          })
        ),
        "标题生成超时 (秒)",
        n.createElement(o, {
          min: 5,
          value: F,
          onChange: (me) => C(me ?? 30),
          style: { width: "100%" },
          disabled: !T
        })
      )
      // ── Section: 审批级别 ──
    ),
    n.createElement(
      "details",
      { className: "ugsci-config-section", open: void 0 },
      n.createElement("summary", null, "审批级别"),
      Re(
        "工具执行审批",
        n.createElement(c, {
          value: We,
          onChange: (me) => dt(me),
          style: { width: "100%" },
          options: [
            { value: "STRICT", label: "严格 (STRICT) — 每次工具调用需审批" },
            { value: "SMART", label: "智能 (SMART) — 高风险操作需审批" },
            { value: "AUTO", label: "自动 (AUTO) — 自动执行" },
            { value: "OFF", label: "关闭 (OFF) — 无限制" }
          ]
        })
      )
      // ── Section: 迭代与循环 ──
    ),
    n.createElement(
      "details",
      { className: "ugsci-config-section", open: void 0 },
      n.createElement("summary", null, "迭代与循环"),
      Re(
        "启用迭代限制",
        n.createElement(u, {
          checked: W,
          onChange: (me) => G(me)
        }),
        "停止 Agent 前的最大循环轮次"
      ),
      W ? Re(
        "最大迭代次数",
        n.createElement(o, {
          min: 1,
          max: 500,
          value: U,
          onChange: (me) => Q(me ?? 100),
          style: { width: "100%" }
        })
      ) : null,
      Re(
        "启用重复循环保护",
        n.createElement(u, {
          checked: D,
          onChange: (me) => Y(me)
        }),
        "检测并阻止重复操作循环"
      ),
      D ? Ve(
        "检测窗口大小",
        n.createElement(o, {
          min: 2,
          max: 20,
          value: ne,
          onChange: (me) => re(me ?? 3),
          style: { width: "100%" }
        }),
        "相似度阈值",
        n.createElement(o, {
          min: 0,
          max: 1,
          step: 0.05,
          value: se,
          onChange: (me) => X(me ?? 1),
          style: { width: "100%" }
        })
      ) : null
      // ── Section: LLM 重试 ──
    ),
    n.createElement(
      "details",
      { className: "ugsci-config-section", open: void 0 },
      n.createElement("summary", null, "LLM 重试"),
      Re(
        "启用 LLM 重试",
        n.createElement(u, {
          checked: pe,
          onChange: (me) => ye(me)
        })
      ),
      Ve(
        "最大重试次数",
        n.createElement(o, {
          min: 1,
          value: q,
          onChange: (me) => j(me ?? 3),
          style: { width: "100%" },
          disabled: !pe
        }),
        "退避基数 (秒)",
        n.createElement(o, {
          min: 0.1,
          step: 0.1,
          value: ge,
          onChange: (me) => we(me ?? 2),
          style: { width: "100%" },
          disabled: !pe
        })
      ),
      Re(
        "退避上限 (秒)",
        n.createElement(o, {
          min: 0.5,
          step: 0.5,
          value: ve,
          onChange: (me) => ue(me ?? 60),
          style: { width: 200 },
          disabled: !pe
        })
      )
      // ── Section: LLM 限流 ──
    ),
    n.createElement(
      "details",
      { className: "ugsci-config-section", open: void 0 },
      n.createElement("summary", null, "LLM 限流"),
      Ve(
        "最大并发数",
        n.createElement(o, {
          min: 1,
          value: Se,
          onChange: (me) => xe(me ?? 1),
          style: { width: "100%" }
        }),
        "最大 QPM (0=不限)",
        n.createElement(o, {
          min: 0,
          step: 10,
          value: Ie,
          onChange: (me) => _e(me ?? 0),
          style: { width: "100%" }
        })
      ),
      Ve(
        "限流暂停时间 (秒)",
        n.createElement(o, {
          min: 1,
          step: 0.5,
          value: oe,
          onChange: (me) => te(me ?? 1),
          style: { width: "100%" }
        }),
        "限流抖动 (秒)",
        n.createElement(o, {
          min: 0,
          step: 0.5,
          value: le,
          onChange: (me) => Z(me ?? 0),
          style: { width: "100%" }
        })
      ),
      Re(
        "获取超时 (秒)",
        n.createElement(o, {
          min: 10,
          step: 10,
          value: A,
          onChange: (me) => O(me ?? 30),
          style: { width: 200 }
        }),
        "应大于 限流暂停 + 抖动"
      )
      // ── Section: 上下文与记忆 ──
    ),
    n.createElement(
      "details",
      { className: "ugsci-config-section", open: void 0 },
      n.createElement("summary", null, "上下文与记忆"),
      Ve(
        "上下文管理后端",
        n.createElement(c, {
          value: fe,
          onChange: (me) => ee(me),
          style: { width: "100%" },
          options: [{ value: "light", label: "light" }]
        }),
        "上下文策略",
        n.createElement(c, {
          value: be,
          onChange: (me) => ke(me),
          style: { width: "100%" },
          options: [
            { value: "scroll", label: "scroll (滚动窗口)" },
            { value: "native", label: "native (原生)" }
          ]
        })
      ),
      Ve(
        "记忆管理后端",
        n.createElement(c, {
          value: Ae,
          onChange: (me) => qe(me),
          style: { width: "100%" },
          options: [
            { value: "remelight", label: "remelight" },
            { value: "adbpg", label: "adbpg" },
            { value: "none", label: "none (禁用)" }
          ]
        }),
        "历史消息最大长度",
        n.createElement(o, {
          min: 1,
          value: K,
          onChange: (me) => V(me ?? 50),
          style: { width: "100%" }
        })
      )
    ),
    // ── Save button ──
    n.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      n.createElement(
        m,
        {
          type: "primary",
          icon: y ? n.createElement(y) : void 0,
          loading: B,
          onClick: Ee,
          style: Xe
        },
        "保存运行配置"
      )
    )
  );
}
function Sl({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = z().React, { useState: i, useEffect: s, useMemo: l, useRef: o } = a, { Modal: d, Tabs: c, Button: u } = z().antd, [m, p] = d.useModal(), [b, g] = i("basic"), [f, h] = i(!1), [y, E] = i(!1), [v, S] = i([]), [B, N] = i(
    () => window.matchMedia("(max-width: 680px)").matches
  ), w = o({}), x = l(
    () => Object.fromEntries(
      ["basic", "files", "heartbeat", "running"].map((L) => [
        L,
        (M) => {
          w.current[L] = M;
        }
      ])
    ),
    []
  ), R = e == null ? void 0 : e.agent.id, H = o(0), _ = async () => {
    var M;
    if (!R) return;
    const L = ++H.current;
    try {
      const P = await ml(R);
      L === H.current && S(P);
    } catch {
      L === H.current && S(((M = e == null ? void 0 : e.config) == null ? void 0 : M.system_prompt_files) || []);
    }
  };
  if (s(() => {
    const L = window.matchMedia("(max-width: 680px)"), M = () => N(L.matches);
    return L.addEventListener("change", M), () => L.removeEventListener("change", M);
  }, []), s(() => (w.current = {}, g("basic"), h(!1), E(!1), S([]), t && _(), () => {
    H.current++;
  }), [R, t]), s(() => {
    const L = (M) => {
      t && Object.values(w.current).some(Boolean) && (M.preventDefault(), M.returnValue = "");
    };
    return window.addEventListener("beforeunload", L), () => window.removeEventListener("beforeunload", L);
  }, [t]), !e) return null;
  const T = e.agent, $ = _t(e), F = () => {
    y || (Object.values(w.current).some(Boolean) ? m.confirm({
      title: "还有未保存的修改",
      content: "关闭后将放弃未保存的内容。已保存的配置不受影响。",
      okText: "放弃修改",
      cancelText: "继续编辑",
      onOk: () => {
        w.current = {}, n();
      }
    }) : n());
  }, C = (L, M, P) => a.createElement(
    "div",
    null,
    a.createElement("h3", null, L),
    a.createElement("p", { className: "ugsci-settings-intro" }, M),
    P
  ), I = [
    {
      key: "basic",
      label: "基本信息",
      children: a.createElement(fl, {
        key: T.id,
        expert: e,
        onRefresh: r,
        onDirtyChange: x.basic
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((L) => L.enabled !== !1).length})`,
      children: C(
        "技能",
        "管理专家可用的技能，启用、停用与安装操作即时生效。",
        a.createElement(El, { agentId: T.id, onRefresh: r })
      )
    },
    {
      key: "files",
      label: "文件与提示词",
      children: a.createElement(
        "div",
        { className: "ugsci-settings-files" },
        C(
          "文件与提示词",
          "编辑专家的工作区文档，管理加入系统提示的文件。",
          a.createElement(bl, {
            agentId: T.id,
            systemPromptFiles: v,
            onRefresh: () => {
              _(), r();
            },
            onDirtyChange: x.files,
            onEditorOpenChange: h,
            onSavingChange: E
          })
        )
      )
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: C(
        "MCP 服务",
        "配置、连接和工具权限沿用当前专家的独立设置。",
        a.createElement(wl, {
          agentId: T.id,
          onRefresh: r,
          isActive: b === "mcp"
        })
      )
    },
    {
      key: "heartbeat",
      label: "自动检查",
      children: C(
        "自动检查",
        "按固定间隔唤醒专家执行心跳任务。",
        a.createElement(vl, {
          agentId: T.id,
          onDirtyChange: x.heartbeat
        })
      )
    },
    {
      key: "running",
      label: "高级运行",
      children: C(
        "高级运行",
        "按需展开参数组，修改后保存运行配置。",
        a.createElement(xl, {
          agentId: T.id,
          onDirtyChange: x.running
        })
      )
    }
  ];
  return a.createElement(
    a.Fragment,
    null,
    p,
    a.createElement("style", null, $i),
    a.createElement(
      d,
      {
        open: t,
        title: "专家设置",
        className: `ugsci-expert-settings${f ? " ugsci-files-expanded" : ""}`,
        onCancel: F,
        closable: !y,
        keyboard: !y,
        maskClosable: !y,
        footer: f ? null : a.createElement(
          "div",
          { className: "ugsci-settings-footer" },
          a.createElement(
            "span",
            null,
            "各栏目分别保存；技能与 MCP 操作即时生效。"
          ),
          a.createElement(
            u,
            { onClick: F, "aria-label": "关闭设置" },
            "关闭"
          )
        ),
        width: f ? 1440 : 940,
        centered: !0,
        styles: {
          footer: { margin: 0, textAlign: "start" }
        }
      },
      t ? a.createElement(
        a.Fragment,
        { key: T.id },
        a.createElement(
          "div",
          { className: "ugsci-expert-settings-identity" },
          a.createElement(rt, {
            name: $.name,
            recipe: kt(e),
            size: 36
          }),
          a.createElement(
            "div",
            null,
            a.createElement("strong", null, $.name),
            a.createElement(
              "small",
              null,
              `${T.id} · ${$.category}`
            )
          )
        ),
        a.createElement(c, {
          className: "ugsci-settings-tabs",
          items: I,
          activeKey: b,
          onChange: g,
          tabPosition: B ? "top" : "left",
          destroyOnHidden: !1,
          size: "small"
        })
      ) : null
    )
  );
}
async function Pa(e) {
  var n;
  const t = z();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (r) {
      console.warn("[ugsci] Failed to refresh newly created agent:", r);
      return;
    }
  (n = t.setSelectedAgent) == null || n.call(t, e);
}
function kl({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r,
  onEditAvatar: a
}) {
  const i = z().React, { Card: s, Badge: l, Button: o } = z().antd, { SettingOutlined: d } = z().antdIcons || {}, { agent: c } = e, u = _t(e);
  return i.createElement(
    s,
    {
      className: "ugsci-expert-card",
      size: "small",
      style: { opacity: c.enabled ? 1 : 0.7 },
      styles: {
        body: {
          padding: 19,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 236
        }
      }
    },
    i.createElement(
      "div",
      { className: "ugsci-expert-card-top" },
      i.createElement(
        "button",
        {
          type: "button",
          className: "ugsci-expert-avatar-button",
          "aria-label": `修改 ${u.name} 的头像`,
          title: "修改专家头像",
          onClick: a
        },
        i.createElement(rt, {
          name: u.name,
          recipe: kt(e),
          size: 40
        })
      ),
      i.createElement(
        "div",
        { className: "ugsci-expert-identity" },
        i.createElement(
          "button",
          {
            type: "button",
            className: "ugsci-expert-name",
            "aria-haspopup": "dialog",
            onClick: t
          },
          u.name
        ),
        i.createElement(
          "div",
          { className: "ugsci-expert-specialty" },
          u.specialty
        )
      ),
      i.createElement(
        "span",
        { className: "ugsci-expert-status" },
        i.createElement(l, {
          status: c.enabled ? "success" : "default",
          text: c.enabled ? "启用" : "停用"
        })
      )
    ),
    i.createElement(
      "p",
      { className: "ugsci-expert-summary", title: u.summary },
      u.summary
    ),
    i.createElement(
      "div",
      { className: "ugsci-expert-tags" },
      u.tags.length ? u.tags.map(
        (m) => i.createElement(
          "span",
          { key: m, className: "ugsci-expert-tag" },
          m
        )
      ) : `${e.skills.filter((m) => m.enabled !== !1).length} 项技能 · ${e.mcps.length} 个 MCP`
    ),
    i.createElement(
      "div",
      { className: "ugsci-expert-actions" },
      i.createElement(
        o,
        {
          type: "text",
          size: "small",
          "aria-label": `设置 ${u.name}`,
          icon: d ? i.createElement(d) : void 0,
          onClick: r
        },
        "设置"
      ),
      i.createElement(
        o,
        {
          type: "primary",
          size: "small",
          disabled: !c.enabled,
          onClick: n
        },
        c.managed_by_app ? "打开应用" : "开始对话"
      )
    )
  );
}
function _l({
  expert: e,
  open: t,
  onClose: n,
  onSummon: r
}) {
  var y, E;
  const a = z().React, { Drawer: i, Badge: s, Button: l, Empty: o } = z().antd;
  if (!e) return null;
  const { agent: d, config: c, skills: u, mcps: m } = e, p = _t(e), b = ((y = c == null ? void 0 : c.description) == null ? void 0 : y.trim()) || ((E = d.description) == null ? void 0 : E.trim()) || p.summary, g = u.filter((v) => v.enabled !== !1), f = m.filter((v) => v.enabled !== !1), h = (v, S) => a.createElement(
    "section",
    { className: "ugsci-expert-introduction-section" },
    a.createElement("h3", null, v),
    S
  );
  return a.createElement(
    i,
    {
      title: `${p.name} · 专家介绍`,
      className: "ugsci-expert-introduction",
      destroyOnHidden: !0,
      open: t,
      onClose: n,
      width: 600,
      footer: a.createElement(
        l,
        {
          type: "primary",
          disabled: !d.enabled,
          onClick: () => {
            n(), r(e);
          }
        },
        d.managed_by_app ? "打开应用" : "开始对话"
      )
    },
    a.createElement(
      "div",
      { className: "ugsci-expert-introduction-identity" },
      a.createElement(rt, {
        name: p.name,
        recipe: kt(e),
        size: 64
      }),
      a.createElement(
        "div",
        null,
        a.createElement("h2", null, p.name),
        a.createElement("p", null, p.specialty),
        a.createElement(s, {
          status: d.enabled ? "success" : "default",
          text: d.enabled ? "启用" : "停用"
        })
      )
    ),
    h("专家简介", St(p.summary, a)),
    b !== p.summary && h("职责与工作方式", St(b, a)),
    h(
      `已启用技能 · ${g.length}`,
      g.length ? a.createElement(
        "ul",
        null,
        ...g.map(
          (v) => a.createElement(
            "li",
            { key: v.name },
            a.createElement(
              "details",
              null,
              a.createElement(
                "summary",
                null,
                Oe(v.name)
              ),
              St(v.description || "暂无技能说明", a)
            )
          )
        )
      ) : a.createElement(o, {
        description: "暂未启用技能",
        image: o.PRESENTED_IMAGE_SIMPLE
      })
    ),
    f.length > 0 && h(
      `可用服务 · ${f.length}`,
      a.createElement(
        "ul",
        null,
        ...f.map(
          (v) => a.createElement(
            "li",
            { key: v.key },
            a.createElement("h4", null, v.name || v.key),
            v.description && St(v.description, a)
          )
        )
      )
    )
  );
}
function Cl({
  open: e,
  onClose: t,
  onCreated: n
}) {
  const r = z().React, { useState: a } = r, {
    Modal: i,
    Card: s,
    Tag: l,
    Input: o,
    Row: d,
    Col: c,
    Spin: u,
    message: m,
    Typography: p
  } = z().antd, { Text: b } = p, { FileAddOutlined: g } = z().antdIcons || {}, [f, h] = a(!1), [y, E] = a(""), [v, S] = a(!1), B = async (x) => {
    h(!0);
    try {
      const R = await he("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: x.id || void 0,
          name: x.name,
          description: x.description,
          skill_names: x.skillNames
        })
      }), H = x.systemPrompt.trim() || `# ${x.name}

你是${x.name}。${x.description ? `

职责：${x.description}` : ""}
`, T = (await Promise.allSettled([
        $a(R.id, x.name, x.description),
        Ot(R.id, "AGENTS.md", H),
        ...x.mcpClients.map(
          ({ clientKey: $, client: F }) => jr(R.id, {
            client_key: $,
            client: F
          })
        )
      ])).filter(
        ($) => $.status === "rejected"
      ).length;
      T > 0 ? m.warning(
        `专家「${x.name}」已创建，${T} 项初始配置失败，可在专家配置中重试`
      ) : m.success(`专家「${x.name}」创建成功`), await Pa(R.id), S(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (R) {
      m.error(R.message || "创建专家失败");
    } finally {
      h(!1);
    }
  }, N = Ho.filter((x) => {
    if (!y.trim()) return !0;
    const R = y.toLowerCase();
    return x.name.toLowerCase().includes(R) || x.description.toLowerCase().includes(R) || x.category.toLowerCase().includes(R);
  }), w = async (x) => {
    h(!0);
    try {
      const R = await he("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: x.name,
          description: x.description,
          skill_names: x.recommended_skills
        })
      });
      await Ot(
        R.id,
        "AGENTS.md",
        x.system_prompt
      ), x.profile_prompt && (await Ot(
        R.id,
        "PROFILE.md",
        x.profile_prompt
      ), await Ot(
        R.id,
        "BOOTSTRAP.md",
        `# 初始化已完成

此专家已按 UGSci 模板设置身份、风格与领域技能。直接执行 AGENTS.md 的领域工作流程，无需再次询问称呼、风格或初始化设置。
`
      ));
      const H = await Br(R.id);
      H.approval_level = x.approval_level, await he(`/agents/${encodeURIComponent(R.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(H)
      });
      const _ = await $a(
        R.id,
        x.name,
        x.description
      ).then(() => !0).catch(() => !1);
      await Pa(R.id), _ ? m.success(`专家「${x.name}」创建成功`) : m.warning(
        `专家「${x.name}」已创建，头像配置保存失败，可在专家卡片中重试`
      ), t(), n();
    } catch (R) {
      m.error(R.message || "创建专家失败");
    } finally {
      h(!1);
    }
  };
  return r.createElement(
    r.Fragment,
    null,
    r.createElement(
      i,
      {
        open: e,
        onCancel: t,
        footer: null,
        title: "选择专家模板",
        width: 800,
        maskClosable: !0,
        keyboard: !0
      },
      r.createElement(
        "div",
        { style: { marginBottom: 16 } },
        r.createElement(o, {
          placeholder: "搜索模板名称或类别...",
          value: y,
          onChange: (x) => E(x.target.value),
          allowClear: !0
        })
      ),
      f ? r.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        r.createElement(u, { size: "large" }),
        r.createElement(
          "div",
          {
            style: {
              marginTop: 12,
              color: "var(--app-card-muted, #8c8c8c)"
            }
          },
          "正在创建专家..."
        )
      ) : r.createElement(
        d,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        y.trim() ? null : r.createElement(
          c,
          { xs: 24, sm: 12 },
          r.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => S(!0),
              style: {
                cursor: "pointer",
                height: "100%",
                border: "2px dashed var(--app-border, #d9d9d9)",
                background: "var(--app-fill-faint, #fafafa)"
              }
            },
            r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              r.createElement(
                "span",
                {
                  style: {
                    fontSize: 28,
                    color: "var(--app-card-muted, #8c8c8c)"
                  }
                },
                g ? r.createElement(g) : "📝"
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(
                  b,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                r.createElement(
                  "div",
                  null,
                  r.createElement(
                    l,
                    { color: "default", style: { fontSize: 10 } },
                    "空白"
                  )
                )
              )
            ),
            r.createElement(
              "div",
              {
                style: {
                  fontSize: 12,
                  color: "#595959",
                  lineHeight: 1.5
                }
              },
              "创建一个全新的专家，不使用任何预设模板。创建后可自行配置系统提示词、技能和 MCP 客户端。"
            )
          )
        ),
        ...N.map(
          (x) => r.createElement(
            c,
            { key: x.id, xs: 24, sm: 12 },
            r.createElement(
              s,
              {
                hoverable: !0,
                size: "small",
                onClick: () => w(x),
                style: { cursor: "pointer", height: "100%" }
              },
              r.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8
                  }
                },
                r.createElement(rt, {
                  name: x.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    b,
                    { strong: !0, style: { fontSize: 15 } },
                    x.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      l,
                      { color: "blue", style: { fontSize: 10 } },
                      x.category
                    ),
                    x.approval_level === "MANUAL" ? r.createElement(
                      l,
                      { color: "orange", style: { fontSize: 10 } },
                      "需审批"
                    ) : null
                  )
                )
              ),
              r.createElement(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "#595959",
                    lineHeight: 1.5
                  }
                },
                St(x.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(Ml, {
      open: v,
      onCancel: () => S(!1),
      onCreate: B
    })
  );
}
function Kt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Tl(e) {
  const t = e.trim();
  if (!t) return [];
  const n = JSON.parse(t);
  if (!Kt(n))
    throw new Error("MCP 配置必须是 JSON 对象");
  const r = n.mcpServers ?? n;
  if (!Kt(r))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(r).map(([a, i]) => {
    const s = a.trim();
    if (!s || !Kt(i))
      throw new Error(`MCP「${a || "未命名"}」配置无效`);
    const l = typeof i.url == "string" ? i.url : "", o = typeof i.command == "string" ? i.command : "";
    if (!l && !o)
      throw new Error(`MCP「${s}」需要配置 url 或 command`);
    const c = (typeof i.transport == "string" ? i.transport : typeof i.type == "string" ? i.type : "") === "sse" ? "sse" : l ? "streamable_http" : "stdio";
    return {
      clientKey: s,
      client: {
        name: typeof i.name == "string" ? i.name : s,
        description: typeof i.description == "string" ? i.description : "",
        enabled: typeof i.enabled == "boolean" ? i.enabled : !0,
        transport: c,
        url: l,
        command: o,
        args: Array.isArray(i.args) ? i.args : [],
        env: Kt(i.env) ? i.env : {},
        cwd: typeof i.cwd == "string" ? i.cwd : "",
        headers: Kt(i.headers) ? i.headers : {}
      }
    };
  });
}
function Ml({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = z().React, { useState: a, useEffect: i, useMemo: s } = r, {
    Modal: l,
    Input: o,
    Select: d,
    Button: c,
    Row: u,
    Col: m,
    Spin: p,
    Tag: b,
    Typography: g,
    message: f
  } = z().antd, { CheckCircleOutlined: h } = z().antdIcons || {}, { Text: y } = g, [E, v] = a(""), [S, B] = a(""), [N, w] = a(""), [x, R] = a(""), [H, _] = a([]), [T, $] = a([]), [F, C] = a(!1), [I, L] = a(""), [M, P] = a(!1);
  i(() => {
    e && (v(""), B(""), w(""), R(""), $([]), L(""), P(!1), C(!0), Hr(!0).then(_).catch((ne) => {
      _([]), f.error(ne.message || "加载技能池失败");
    }).finally(() => C(!1)));
  }, [e]);
  const W = S.trim(), G = s(() => W ? W.length < 2 || W.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(W) ? W === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [W]), U = s(() => {
    try {
      return { clients: Tl(I), error: "" };
    } catch (ne) {
      return {
        clients: [],
        error: ne.message || "MCP 配置无效"
      };
    }
  }, [I]), Q = () => {
    const ne = E.trim();
    if (!ne) {
      f.warning("请输入专家名称");
      return;
    }
    if (G) {
      f.warning(G);
      return;
    }
    if (U.error) {
      f.warning(U.error);
      return;
    }
    P(!0), Promise.resolve(
      n({
        id: W,
        name: ne,
        description: N.trim(),
        systemPrompt: x,
        skillNames: T,
        mcpClients: U.clients
      })
    ).finally(() => P(!1));
  }, D = () => {
    $(
      H.filter((ne) => ne.source === "builtin").map((ne) => ne.name)
    );
  }, Y = (ne, re) => r.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12
      }
    },
    r.createElement(
      y,
      { strong: !0, style: { fontSize: 15 } },
      ne
    ),
    re ? r.createElement(
      y,
      { type: "secondary", style: { fontSize: 12 } },
      re
    ) : null
  );
  return r.createElement(
    l,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: Q,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: M },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    r.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      Y("基本信息", "ID 留空时自动生成"),
      r.createElement(
        u,
        { gutter: [16, 12] },
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            r.createElement(
              "span",
              { style: { color: "#ff4d4f", marginLeft: 4 } },
              "*"
            )
          ),
          r.createElement(o, {
            placeholder: "例如：合同审查专家",
            value: E,
            onChange: (ne) => v(ne.target.value),
            maxLength: 50
          })
        ),
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          r.createElement(o, {
            placeholder: "例如：contract-reviewer",
            value: S,
            onChange: (ne) => B(ne.target.value),
            maxLength: 64,
            status: G ? "error" : void 0
          }),
          G ? r.createElement(
            "div",
            { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } },
            G
          ) : null
        ),
        r.createElement(
          m,
          { span: 24 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          r.createElement(o.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: N,
            onChange: (ne) => w(ne.target.value),
            rows: 2,
            maxLength: 200,
            showCount: !0
          })
        )
      )
    ),
    r.createElement(
      "div",
      {
        style: { borderTop: "1px solid var(--app-border)", padding: "20px 0" }
      },
      Y("角色指令", "保存为 AGENTS.md"),
      r.createElement(o.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: x,
        onChange: (ne) => R(ne.target.value),
        rows: 6,
        style: {
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12
        }
      })
    ),
    r.createElement(
      "div",
      { style: { borderTop: "1px solid var(--app-border)", paddingTop: 20 } },
      Y("初始能力"),
      r.createElement(
        u,
        { gutter: [20, 16], align: "top" },
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8
              }
            },
            r.createElement(y, { strong: !0 }, "初始技能"),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(
                c,
                {
                  size: "small",
                  onClick: D,
                  disabled: F
                },
                "内置"
              ),
              r.createElement(
                c,
                {
                  size: "small",
                  onClick: () => $([]),
                  disabled: T.length === 0
                },
                "清空"
              )
            )
          ),
          F ? r.createElement(
            "div",
            { style: { textAlign: "center", padding: 32 } },
            r.createElement(p, { size: "small" })
          ) : r.createElement(d, {
            mode: "multiple",
            value: T,
            onChange: $,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: H.map((ne) => ({
              value: ne.name,
              label: Oe(ne.name)
            })),
            notFoundContent: "暂无可用技能"
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            T.length > 0 ? r.createElement(
              b,
              { color: "blue" },
              `已选择 ${T.length} 个技能`
            ) : r.createElement(
              y,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加技能"
            )
          )
        ),
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            y,
            { strong: !0, style: { display: "block", marginBottom: 8 } },
            "初始 MCP"
          ),
          r.createElement(o.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: I,
            onChange: (ne) => L(ne.target.value),
            rows: 8,
            status: U.error ? "error" : void 0,
            style: {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12
            }
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            U.error ? r.createElement(
              y,
              { type: "danger", style: { fontSize: 12 } },
              U.error
            ) : U.clients.length > 0 ? r.createElement(
              b,
              {
                color: "green",
                icon: h ? r.createElement(h) : void 0
              },
              `已识别 ${U.clients.length} 个 MCP`
            ) : r.createElement(
              y,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加 MCP"
            )
          )
        )
      )
    )
  );
}
const Vi = "ugsci_custom_teams";
function Il(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function Al() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Vi) || "[]"
    );
    return Array.isArray(e) ? e.filter(Il) : [];
  } catch {
    return [];
  }
}
function $l(e) {
  try {
    localStorage.setItem(Vi, JSON.stringify(e));
  } catch {
  }
}
function zl(e) {
  const t = {
    id: e.id,
    name: e.name,
    description: e.description,
    emoji: e.emoji,
    category: e.category,
    mode: e.mode,
    members: e.members,
    steps: e.steps || [],
    orchestrationPrompt: e.orchestrationPrompt,
    coordinatorName: e.coordinatorName || void 0,
    taskTemplate: e.taskTemplate,
    maxReviewRounds: e.maxReviewRounds || 2,
    routingInstruction: e.routingInstruction || "",
    successCriteria: e.successCriteria || ""
  };
  return e.updatedAt && (t.expectedUpdatedAt = e.updatedAt / 1e3), e.version && (t.expectedVersion = e.version), t;
}
function Rl(e) {
  return {
    id: e.team_id,
    name: e.name,
    emoji: e.emoji || "🤝",
    category: e.category || "自定义",
    description: e.description || `${e.name}（${e.members.length} 位专家）`,
    mode: e.mode,
    members: e.members,
    steps: e.steps,
    orchestrationPrompt: e.orchestrationPrompt || "",
    coordinatorName: e.coordinatorName,
    taskTemplate: e.taskTemplate || `请执行以下任务：
任务描述：{任务描述}`,
    maxReviewRounds: e.maxReviewRounds || 2,
    routingInstruction: e.routingInstruction || "",
    successCriteria: e.successCriteria || "",
    createdAt: e.createdAt ? e.createdAt * 1e3 : Date.now(),
    updatedAt: e.updatedAt ? e.updatedAt * 1e3 : Date.now(),
    version: e.version || 1,
    custom: !0
  };
}
async function br(e = !0) {
  const t = await ct("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const r = (await t.json()).map(Rl);
  return e && $l(r), r;
}
async function Fi(e) {
  const t = await ct("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(zl(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function Ll(e) {
  const t = await ct(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
}
async function Pl() {
  const e = Al();
  if (e.length === 0) return;
  const t = await br(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => Fi(r))
  );
}
async function Ol(e) {
  var a, i;
  const t = (a = e.body) == null ? void 0 : a.getReader();
  if (!t) return;
  const n = new TextDecoder();
  let r = "";
  try {
    for (; ; ) {
      const { done: s, value: l } = await t.read();
      if (s) break;
      r += n.decode(l, { stream: !0 });
      let o;
      for (; (o = r.indexOf(`

`)) >= 0; ) {
        const d = r.slice(0, o);
        r = r.slice(o + 2);
        for (const c of d.split(`
`)) {
          if (!c.startsWith("data: ")) continue;
          const u = c.slice(6);
          let m;
          try {
            m = JSON.parse(u);
          } catch {
            continue;
          }
          if (m.error) {
            const p = m.error, b = typeof p == "string" ? p : (p == null ? void 0 : p.message) || "工作流启动失败";
            throw new Error(b);
          }
          if (m.object === "response" || m.type === "response") {
            const p = m.status;
            if (p === "failed" || p === "error") {
              const b = ((i = m.error) == null ? void 0 : i.message) || "工作流启动失败";
              throw new Error(b);
            }
            return;
          }
          if (m.object === "content" || m.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function Nl(e, t, n) {
  const r = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, a = await ct("/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      session_id: r,
      user_id: "default",
      channel: "console",
      name: n ? `团队：${n}` : "团队任务"
    })
  });
  if (!a.ok) {
    const o = await a.text().catch(() => "");
    throw new Error(o || `创建会话失败 (HTTP ${a.status})`);
  }
  const s = (await a.json()).id, l = await ct("/console/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      channel: "console",
      user_id: "default",
      session_id: r,
      stream: !0,
      input: [
        {
          role: "user",
          content: [{ type: "text", text: t }]
        }
      ]
    })
  });
  if (!l.ok) {
    const o = await l.text().catch(() => "");
    throw new Error(o || `HTTP ${l.status}`);
  }
  return await Ol(l), s;
}
function Gi(e, t) {
  var a;
  const n = t.replace(/\s+/g, ""), r = e.find(
    (i) => i.name === t || i.name.replace(/\s+/g, "") === n
  );
  return r ? r.id : ((a = e.find(
    (i) => i.name.includes(t) || t.includes(i.name) || i.name.replace(/\s+/g, "").includes(n)
  )) == null ? void 0 : a.id) || null;
}
function Wi() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function Zi(e, t) {
  const n = await e.text().catch(() => "");
  if (!n) return t;
  try {
    const r = JSON.parse(n);
    if (typeof r.detail == "string") return r.detail;
  } catch {
  }
  return n;
}
async function Dr(e, t, n) {
  const r = await ct(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: n
  });
  if (!r.ok)
    throw new Error(
      await Zi(r, `HTTP ${r.status}`)
    );
  return await r.json();
}
function Bl(e, t) {
  return Dr("/ugsci/team/state", e, t);
}
async function Hl(e, t) {
  const n = await ct("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!n.ok)
    throw new Error(
      await Zi(
        n,
        `Failed to load team runs: ${n.status}`
      )
    );
  return await n.json();
}
const Ul = 5e3;
function Oa({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = Wi(), r = n.React, { useCallback: a, useEffect: i, useRef: s, useState: l } = r, { Alert: o, Button: d, Card: c, Empty: u, Spin: m, Tag: p, Typography: b } = n.antd, { Text: g, Paragraph: f } = b, h = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, y = (h == null ? void 0 : h.id) || "default", [E, v] = l([]), [S, B] = l(!0), [N, w] = l(null), [x, R] = l(!1), H = s(null), _ = s(0), T = s(!1), $ = s(y), F = a(
    async (L = !0, M = !0) => {
      var G;
      if (!t || !M && T.current) return;
      (G = H.current) == null || G.abort();
      const P = new AbortController();
      H.current = P;
      const W = ++_.current;
      T.current = !0, L && B(!0);
      try {
        const U = await Hl(y, P.signal);
        if (P.signal.aborted || W !== _.current)
          return;
        v(U), R(!0), w(null);
      } catch (U) {
        if (P.signal.aborted || W !== _.current)
          return;
        w(
          U instanceof Error ? U.message : "讨论运行记录加载失败"
        );
      } finally {
        !P.signal.aborted && W === _.current && (H.current = null, T.current = !1, B(!1));
      }
    },
    [y, t]
  );
  if (i(() => {
    var M;
    if (!t) {
      (M = H.current) == null || M.abort(), H.current = null, T.current = !1, _.current += 1;
      return;
    }
    $.current !== y && ($.current = y, v([]), w(null), R(!1)), F(!0, !0);
    const L = e ? window.setInterval(() => {
      F(!1, !1);
    }, Ul) : null;
    return () => {
      var P;
      L !== null && window.clearInterval(L), (P = H.current) == null || P.abort(), H.current = null, T.current = !1, _.current += 1;
    };
  }, [e, y, t, F]), S && !x) return r.createElement(m);
  if (N && !x)
    return r.createElement(o, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: N,
      action: r.createElement(
        d,
        { size: "small", onClick: () => void F(!0, !0), loading: S },
        "重试"
      )
    });
  const C = E.filter(
    (L) => e ? L.status === "active" : L.status !== "active"
  ), I = (L) => N ? r.createElement(
    r.Fragment,
    null,
    r.createElement(o, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: N,
      action: r.createElement(
        d,
        {
          size: "small",
          onClick: () => void F(!0, !0),
          loading: S
        },
        "重试"
      )
    }),
    L
  ) : L;
  return C.length === 0 ? I(
    r.createElement(
      u,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        d,
        { size: "small", onClick: () => void F(!0, !0), loading: S },
        "刷新"
      )
    )
  ) : I(
    r.createElement(
      r.Fragment,
      null,
      r.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 8
          }
        },
        r.createElement(
          d,
          { size: "small", onClick: () => void F(!0, !0), loading: S },
          "刷新"
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...C.map(
          (L) => r.createElement(
            c,
            { key: L.instance_id, size: "small" },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                g,
                { strong: !0 },
                L.team_name || L.team_id
              ),
              r.createElement(
                p,
                {
                  color: L.status === "completed" ? "green" : L.status === "terminated" ? "orange" : "blue"
                },
                L.status
              ),
              r.createElement(p, null, L.current_phase),
              r.createElement(
                g,
                { type: "secondary" },
                `迭代 ${L.iteration}`
              )
            ),
            r.createElement(
              f,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              L.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function jl() {
  try {
    return (await Dr(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function Dl() {
  try {
    return (await Dr(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const ql = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Na = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Ba = 5e3, Vl = 3e4;
function Fl({ enabled: e = !0 }) {
  const t = Wi(), n = t.React, { useState: r, useEffect: a, useCallback: i, useRef: s } = n, { Card: l, Tag: o, Typography: d, Button: c, Steps: u, Empty: m, Alert: p, Spin: b } = t.antd, { ReloadOutlined: g } = t.antdIcons || {}, { Text: f, Paragraph: h } = d, y = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, E = (y == null ? void 0 : y.id) || "default", [v, S] = r(null), [B, N] = r(!1), [w, x] = r(null), R = s(null), H = s(0), _ = s(0), T = s(0), $ = s(null), F = s(!1), C = i(
    async (re, se = !0) => {
      var ye;
      if (!e || !se && F.current) return;
      (ye = $.current) == null || ye.abort();
      const X = new AbortController();
      $.current = X;
      const pe = ++T.current;
      F.current = !0, re && N(!0);
      try {
        const q = await Bl(E, X.signal);
        if (X.signal.aborted || pe !== T.current)
          return;
        H.current = 0, _.current = 0, R.current = q, S(q), x(null);
      } catch (q) {
        if (X.signal.aborted || pe !== T.current)
          return;
        H.current += 1;
        const j = Math.min(
          Vl,
          Ba * 2 ** (H.current - 1)
        );
        _.current = Date.now() + j, x(
          q instanceof Error ? q.message : "专家团状态加载失败"
        );
      } finally {
        !X.signal.aborted && pe === T.current && ($.current = null, F.current = !1, N(!1));
      }
    },
    [E, e]
  ), I = i(() => (H.current = 0, _.current = 0, C(!0)), [C]);
  if (a(() => {
    var se;
    if ((se = $.current) == null || se.abort(), $.current = null, F.current = !1, T.current += 1, H.current = 0, _.current = 0, R.current = null, S(null), x(null), !e) return;
    I();
    const re = window.setInterval(() => {
      var X, pe;
      Date.now() < _.current || ((X = R.current) == null ? void 0 : X.status) === "completed" || ((pe = R.current) == null ? void 0 : pe.status) === "terminated" || C(!1, !1);
    }, Ba);
    return () => {
      var X;
      window.clearInterval(re), (X = $.current) == null || X.abort(), $.current = null, F.current = !1, T.current += 1;
    };
  }, [E, e, C, I]), B && !v && !w)
    return n.createElement(b);
  if (w && !v)
    return n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: w,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: I, loading: B },
        "重试"
      )
    });
  const L = (re) => w ? n.createElement(
    n.Fragment,
    null,
    n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: w,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: I, loading: B },
        "重试"
      )
    }),
    re
  ) : re;
  if ((v == null ? void 0 : v.status) === "unreadable")
    return L(
      n.createElement(p, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${v.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          c,
          { size: "small", onClick: I, loading: B },
          "重试"
        )
      })
    );
  if (!v || !v.active) {
    if ((v == null ? void 0 : v.status) === "completed" || (v == null ? void 0 : v.status) === "terminated") {
      const re = v.status === "completed";
      return L(
        n.createElement(p, {
          type: re ? "success" : "info",
          showIcon: !0,
          message: re ? "专家团工作流已完成" : "专家团工作流已终止",
          description: re ? `实例 ${v.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${v.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return L(
      n.createElement(m, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const M = v.state, P = M.current_phase || "plan", W = Na.indexOf(P), G = M.team_name || "未知团队", U = M.team_mode || "pipeline", Q = M.iteration || 0, D = M.members || [], Y = M.verify_retries || 0, ne = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return L(
    n.createElement(
      l,
      {
        size: "small",
        style: { marginBottom: 16 },
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement("span", { style: { fontSize: 16 } }, "🔄"),
          n.createElement(
            f,
            { strong: !0 },
            `${G} — 工作流状态`
          ),
          n.createElement(
            o,
            { color: "blue", style: { fontSize: 10 } },
            ne[U] || U
          ),
          n.createElement(
            o,
            { style: { fontSize: 10 } },
            `迭代 ${Q}`
          ),
          Y > 0 ? n.createElement(
            o,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${Y}`
          ) : null
        ),
        extra: n.createElement(
          c,
          {
            size: "small",
            type: "text",
            icon: g ? n.createElement(g) : void 0,
            onClick: I,
            loading: B
          },
          "刷新"
        )
      },
      n.createElement(u, {
        current: W,
        size: "small",
        items: Na.map((re) => {
          const se = ql[re];
          return {
            title: `${se.icon} ${se.label}`,
            description: re === "plan" ? "分析任务，创建任务分解" : re === "dispatch" ? "分派专家执行任务" : re === "verify" ? "交叉验证专家结果" : re === "synthesize" ? "综合形成最终报告" : "工作流完成"
          };
        })
      }),
      n.createElement(
        "div",
        {
          style: {
            marginTop: 12,
            display: "flex",
            gap: 6,
            flexWrap: "wrap"
          }
        },
        ...D.map(
          (re, se) => n.createElement(
            o,
            { key: `${re.name}-${se}`, style: { fontSize: 11 } },
            `${re.emoji || ""} ${re.name}（${re.role}）`
          )
        )
      ),
      M.task ? n.createElement(
        h,
        {
          style: {
            fontSize: 12,
            marginTop: 8,
            marginBottom: 0,
            color: "var(--ant-color-text-secondary, #666)"
          },
          ellipsis: { rows: 2 }
        },
        `任务: ${M.task}`
      ) : null
    )
  );
}
function Gl({ team: e }) {
  const t = z().React, { Typography: n, Tag: r } = z().antd, { Text: a } = n, i = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙",
    router: "◇",
    review_loop: "↻",
    debate: "⇄"
  }, s = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff",
    router: "#d46b08",
    review_loop: "#389e0d",
    debate: "#c41d7f"
  }, l = e.steps || [], o = e.mode === "roundtable" || e.mode === "router", d = {
    pipeline: "顺序交接",
    roundtable: "并行汇聚",
    coordinator: "主管协作",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return t.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "var(--ant-color-fill-quaternary, #fafafa)",
        borderRadius: 8,
        border: "1px dashed var(--ant-color-border, #d9d9d9)"
      }
    },
    t.createElement(
      a,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 }
      },
      `OMP 编排拓扑 · ${d[e.mode] || e.mode}`
    ),
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: o ? "row" : "column",
          gap: 8,
          alignItems: o ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...l.length > 0 ? l.map((c, u) => [
        u > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
              fontSize: 14
            }
          },
          i[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${u}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "var(--ant-color-bg-container, #fff)",
              borderRadius: 6,
              border: `1px solid ${s[e.mode]}33`,
              fontSize: 12,
              flex: o ? "1 1 200px" : "initial"
            }
          },
          t.createElement(rt, {
            name: c.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              c.agentName
            ),
            t.createElement(
              "div",
              {
                style: {
                  fontSize: 11,
                  color: "var(--ant-color-text-tertiary, #8c8c8c)",
                  maxWidth: 250
                }
              },
              c.instruction
            ),
            t.createElement(
              r,
              {
                ...c.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              c.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((c, u) => [
        u > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
              fontSize: 14
            }
          },
          i[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${u}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "var(--ant-color-bg-container, #fff)",
              borderRadius: 6,
              border: `1px solid ${s[e.mode]}33`,
              fontSize: 12,
              flex: o ? "1 1 150px" : "initial"
            }
          },
          t.createElement(rt, {
            name: c.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              c.name
            ),
            t.createElement(
              "div",
              {
                style: {
                  fontSize: 11,
                  color: "var(--ant-color-text-tertiary, #8c8c8c)"
                }
              },
              c.role
            )
          )
        )
      ]).flat()
    )
  );
}
function Sn(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const Wl = [
  {
    key: "analyst",
    display_name: "需求分析师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "reservoir-engineer",
    display_name: "油藏工程师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "log-analyst",
    display_name: "测井分析师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "geophysicist",
    display_name: "地球物理专家",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "drilling-engineer",
    display_name: "钻井工程师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "production-engineer",
    display_name: "采油工程师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "pvt-analyst",
    display_name: "PVT 分析师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "domain-reviewer",
    display_name: "领域审核专家",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "planner",
    display_name: "规划者",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "verifier",
    display_name: "验证者",
    allowed_tools: [],
    skills: [],
    prompt: ""
  }
];
function Zl({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: a
}) {
  const i = z().React, { useState: s, useEffect: l, useCallback: o } = i, {
    Modal: d,
    Input: c,
    Button: u,
    Select: m,
    Tag: p,
    Typography: b,
    Switch: g,
    Empty: f,
    message: h,
    Divider: y,
    Steps: E
  } = z().antd, { PlusOutlined: v, DeleteOutlined: S, SaveOutlined: B, ArrowRightOutlined: N } = z().antdIcons || {}, { Text: w, Paragraph: x } = b, [R, H] = s(""), [_, T] = s("🤝"), [$, F] = s(""), [C, I] = s("pipeline"), [L, M] = s(""), [P, W] = s(""), [G, U] = s([]), [Q, D] = s([]), [Y, ne] = s(!1), [re, se] = s(2), [X, pe] = s(""), [ye, q] = s(""), [j, ge] = s({}), [we, ve] = s(
    {}
  ), [ue, Se] = s(
    Wl
  ), xe = [
    {
      value: "pipeline",
      icon: "→",
      title: "顺序交接",
      description: "上一步产物成为下一位专家的上下文",
      topology: "A → B → C",
      accent: "#08979c"
    },
    {
      value: "roundtable",
      icon: "⇉",
      title: "并行汇聚",
      description: "独立并行分析，避免观点相互污染",
      topology: "A ∥ B ∥ C → 汇总",
      accent: "#531dab"
    },
    {
      value: "coordinator",
      icon: "◎",
      title: "主管协作",
      description: "主控专家拆解任务并按需组织成员",
      topology: "主管 → 专家组",
      accent: "#0958d9"
    },
    {
      value: "router",
      icon: "◇",
      title: "智能路由",
      description: "按任务能力需求选择最小充分专家集合",
      topology: "任务 → 路由 → 子集",
      accent: "#d46b08"
    },
    {
      value: "review_loop",
      icon: "↻",
      title: "评审迭代",
      description: "产出、独立审查、修订，直到满足标准",
      topology: "执行 ⇄ 评审",
      accent: "#389e0d"
    },
    {
      value: "debate",
      icon: "⚖",
      title: "多方论证",
      description: "独立立场、交叉质询，再由裁决者综合",
      topology: "观点 ⇄ 反驳 → 裁决",
      accent: "#c41d7f"
    }
  ];
  l(() => {
    e && (r ? (H(r.name), T(r.emoji), F(r.description), I(r.mode), M(r.coordinatorName || ""), W(r.taskTemplate), U(r.steps || []), D(r.members.map((A) => A.name)), se(r.maxReviewRounds || 2), pe(r.successCriteria || ""), q(r.routingInstruction || ""), ge(
      Object.fromEntries(
        r.members.map((A) => [
          A.name,
          A.bindingMode || (A.agentId ? "fixed" : "preferred")
        ])
      )
    ), ve(
      Object.fromEntries(
        r.members.map((A) => [
          A.name,
          A.roleKey || Sn(A.name)
        ])
      )
    )) : (H(""), T("🤝"), F(""), I("pipeline"), M(""), W(`请执行以下任务：
任务描述：{任务描述}`), U([]), D([]), se(2), pe(""), q(""), ge({}), ve({})));
  }, [e, r]), l(() => {
    e && Dl().then((A) => {
      A != null && A.length && Se(A);
    });
  }, [e]);
  const Ie = o(() => {
    if (C === "roundtable" || C === "debate" || C === "router") {
      const A = Q.map((O) => ({
        agentName: O,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      U(A);
    } else if (C === "pipeline") {
      const A = new Map(G.map((K) => [K.agentName, K])), O = Q.map((K) => A.get(K) || {
        agentName: K,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      U(O);
    }
  }, [C, Q, G]), _e = (A) => {
    Q.includes(A) || (D([...Q, A]), ge({ ...j, [A]: "fixed" }), ve({
      ...we,
      [A]: Sn(A)
    }), (C === "coordinator" || C === "debate") && !L && M(A));
  }, oe = (A) => {
    const O = Q.filter((fe) => fe !== A);
    D(O), U(G.filter((fe) => fe.agentName !== A));
    const K = { ...j };
    delete K[A], ge(K);
    const V = { ...we };
    delete V[A], ve(V), L === A && M(O[0] || "");
  }, te = (A, O, K) => {
    const V = [...G];
    V[A] = { ...V[A], [O]: K }, U(V);
  }, le = async () => {
    if (!R.trim()) {
      h.warning("请输入团队名称");
      return;
    }
    if (Q.length < 2) {
      h.warning("至少需要选择 2 个成员");
      return;
    }
    if (!P.trim()) {
      h.warning("请输入任务模板");
      return;
    }
    if ((C === "coordinator" || C === "debate") && !L) {
      h.warning(C === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    ne(!0);
    try {
      let A = [...Q];
      C === "coordinator" && L ? A = [
        L,
        ...A.filter((fe) => fe !== L)
      ] : C === "debate" && L && (A = [
        ...A.filter((fe) => fe !== L),
        L
      ]);
      const O = A.map((fe) => {
        var qe;
        const ee = n.find((We) => We.name === fe), be = j[fe] || "fixed", ke = we[fe] || Sn(fe), Ae = ue.find((We) => We.key === ke);
        return {
          name: fe,
          role: (Ae == null ? void 0 : Ae.display_name) || ((qe = ee == null ? void 0 : ee.description) == null ? void 0 : qe.slice(0, 30)) || "需求分析师",
          emoji: "",
          agentId: be === "temporary" || ee == null ? void 0 : ee.id,
          roleKey: ke,
          bindingMode: be
        };
      });
      let K = G;
      (G.length === 0 || G.length !== Q.length) && (K = Q.map((fe) => ({
        agentName: fe,
        instruction: "请完成你的专业部分",
        passContext: C === "pipeline"
      })));
      const V = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: R.trim(),
        emoji: _,
        category: "自定义",
        description: $.trim() || `${R.trim()}（${Q.length}人团队）`,
        mode: C,
        members: O,
        coordinatorName: C === "coordinator" || C === "debate" ? L : void 0,
        taskTemplate: P.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: K,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: re,
        successCriteria: X.trim(),
        routingInstruction: ye.trim()
      };
      await Fi(V), h.success(r ? "团队已更新" : "团队已创建"), a(), t();
    } catch (A) {
      h.error(A.message || "保存失败");
    } finally {
      ne(!1);
    }
  }, Z = n.filter(
    (A) => !Q.includes(A.name)
  );
  return i.createElement(
    d,
    {
      open: e,
      onCancel: t,
      title: i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        i.createElement(
          "span",
          { style: { fontSize: 20 } },
          r ? "✏️" : "➕"
        ),
        i.createElement(
          "span",
          null,
          r ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 860,
      onOk: le,
      okText: "保存专家团",
      confirmLoading: Y,
      okButtonProps: {
        icon: B ? i.createElement(B) : void 0
      }
    },
    // Step 1: Basic info
    i.createElement(
      "div",
      { style: { marginBottom: 16 } },
      i.createElement(
        w,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      i.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 8,
            marginBottom: 8,
            alignItems: "center"
          }
        },
        Q.length > 0 ? i.createElement(Or, {
          members: Q,
          size: 36
        }) : null,
        i.createElement(c, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: R,
          onChange: (A) => H(A.target.value),
          style: { flex: 1 }
        })
      ),
      i.createElement(c.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: $,
        onChange: (A) => F(A.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      i.createElement(
        w,
        {
          strong: !0,
          style: { display: "block", margin: "12px 0 8px", fontSize: 13 }
        },
        "选择协同模式"
      ),
      i.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8
          }
        },
        ...xe.map((A) => {
          const O = C === A.value;
          return i.createElement(
            "button",
            {
              key: A.value,
              type: "button",
              onClick: () => {
                I(A.value), A.value !== "coordinator" && A.value !== "debate" && M("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: O ? `${A.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${O ? A.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: O ? `0 0 0 2px ${A.accent}1a` : "none"
              }
            },
            i.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: A.accent,
                  fontWeight: 600
                }
              },
              i.createElement(
                "span",
                { style: { fontSize: 18 } },
                A.icon
              ),
              A.title
            ),
            i.createElement(
              "div",
              {
                style: {
                  fontSize: 11,
                  color: "#595959",
                  marginTop: 5,
                  lineHeight: 1.45
                }
              },
              A.description
            ),
            i.createElement(
              "div",
              {
                style: {
                  fontSize: 10,
                  color: A.accent,
                  marginTop: 5,
                  fontFamily: "monospace"
                }
              },
              A.topology
            )
          );
        })
      )
    ),
    i.createElement(y, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    i.createElement(
      "div",
      { style: { marginBottom: 16 } },
      i.createElement(
        w,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      Z.length > 0 ? i.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 8,
            padding: 8,
            background: "var(--ant-color-fill-secondary, #f5f5f5)",
            borderRadius: 6
          }
        },
        ...Z.map(
          (A) => i.createElement(
            u,
            {
              key: A.id,
              size: "small",
              icon: v ? i.createElement(v) : void 0,
              onClick: () => _e(A.name)
            },
            A.name
          )
        )
      ) : null,
      // Selected members
      Q.length === 0 ? i.createElement(f, {
        description: "请从上方添加团队成员",
        image: f.PRESENTED_IMAGE_SIMPLE
      }) : i.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...Q.map(
          (A) => i.createElement(
            "div",
            {
              key: A,
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                background: "#f0f5ff",
                borderRadius: 6,
                border: "1px solid #d6e4ff"
              }
            },
            i.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              i.createElement(rt, {
                name: A,
                size: 24
              }),
              i.createElement(
                w,
                { strong: !0, style: { fontSize: 13 } },
                A
              ),
              (C === "coordinator" || C === "debate") && L === A ? i.createElement(
                p,
                { color: "blue", style: { fontSize: 10 } },
                C === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            i.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              i.createElement(m, {
                size: "small",
                value: we[A] || Sn(A),
                style: { width: 132 },
                onChange: (O) => ve({
                  ...we,
                  [A]: O
                }),
                options: ue.map((O) => ({
                  value: O.key,
                  label: O.display_name
                }))
              }),
              i.createElement(m, {
                size: "small",
                value: j[A] || "fixed",
                style: { width: 118 },
                onChange: (O) => ge({
                  ...j,
                  [A]: O
                }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              C === "coordinator" || C === "debate" ? i.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  onClick: () => M(A)
                },
                C === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              i.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: S ? i.createElement(S) : void 0,
                  onClick: () => oe(A)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    C === "review_loop" || C === "router" ? i.createElement(
      "div",
      {
        style: {
          margin: "0 0 16px",
          padding: 12,
          borderRadius: 8,
          background: "var(--ant-color-fill-quaternary, #fafafa)",
          border: "1px solid #f0f0f0"
        }
      },
      C === "review_loop" ? i.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: 10
          }
        },
        i.createElement(m, {
          value: re,
          onChange: (A) => se(A),
          options: [1, 2, 3, 4, 5].map((A) => ({
            value: A,
            label: `最多 ${A} 轮`
          }))
        }),
        i.createElement(c, {
          value: X,
          onChange: (A) => pe(A.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : i.createElement(c, {
        value: ye,
        onChange: (A) => q(A.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    i.createElement(y, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    Q.length > 0 ? i.createElement(
      "div",
      { style: { marginBottom: 16 } },
      i.createElement(
        w,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${C === "roundtable" ? "（并行独立）" : C === "pipeline" ? "（顺序交接）" : C === "router" ? "（作为候选能力）" : C === "review_loop" ? "（首位执行、末位评审）" : C === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      i.createElement(
        u,
        {
          size: "small",
          type: "dashed",
          onClick: Ie,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      G.length === 0 ? i.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : i.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...G.map(
          (A, O) => i.createElement(
            "div",
            {
              key: O,
              style: {
                padding: 8,
                background: "var(--ant-color-bg-container, #fff)",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            i.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              C === "pipeline" ? i.createElement(
                "div",
                {
                  style: {
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#13c2c2",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600
                  }
                },
                `${O + 1}`
              ) : i.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              i.createElement(
                p,
                { color: "blue", style: { fontSize: 11 } },
                A.agentName
              ),
              i.createElement(
                "div",
                { style: { flex: 1 } },
                i.createElement(c, {
                  placeholder: "请输入该步骤的指令...",
                  value: A.instruction,
                  onChange: (K) => te(O, "instruction", K.target.value),
                  size: "small"
                })
              )
            ),
            i.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              i.createElement(g, {
                size: "small",
                checked: A.passContext,
                onChange: (K) => te(O, "passContext", K)
              }),
              i.createElement(
                w,
                { type: "secondary", style: { fontSize: 11 } },
                A.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    i.createElement(y, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    i.createElement(
      "div",
      null,
      i.createElement(
        w,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${Q.length > 0 ? "4" : "3"}. 任务模板`
      ),
      i.createElement(c.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: P,
        onChange: (A) => W(A.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      i.createElement(
        w,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Ha({
  team: e,
  agents: t,
  onLaunch: n,
  onEdit: r,
  onDelete: a
}) {
  var T;
  const i = z().React, { useState: s } = i, { Card: l, Tag: o, Typography: d, Button: c, Tooltip: u, Popconfirm: m } = z().antd, {
    TeamOutlined: p,
    RocketOutlined: b,
    UserOutlined: g,
    EditOutlined: f,
    DeleteOutlined: h,
    DownOutlined: y,
    UpOutlined: E
  } = z().antdIcons || {}, { Text: v, Paragraph: S } = d, [B, N] = s(!1), w = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, x = w[e.mode] || w.coordinator, R = e.members.map(($) => {
    const F = $.bindingMode === "temporary", C = F ? null : ($.agentId && t.some((I) => I.id === $.agentId) ? $.agentId : null) || Gi(t, $.name);
    return { ...$, found: !!C, agentId: C, temporary: F };
  }), H = R.filter(($) => $.found).length, _ = e.coordinatorName || ((T = e.members[0]) == null ? void 0 : T.name);
  return i.createElement(
    l,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    i.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      i.createElement(Or, {
        members: e.members.map(($) => $.name),
        size: 36
      }),
      i.createElement(
        "div",
        { style: { flex: 1 } },
        i.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          i.createElement(
            v,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? i.createElement(
            o,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        i.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          i.createElement(
            o,
            { color: x.color, style: { fontSize: 10 } },
            x.label
          ),
          i.createElement(
            o,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          H < e.members.length ? i.createElement(
            u,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            i.createElement(
              o,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : i.createElement(
            o,
            { color: "green", style: { fontSize: 10 } },
            "全部就绪"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? i.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        r ? i.createElement(
          u,
          { title: "编辑" },
          i.createElement(c, {
            type: "text",
            size: "small",
            icon: f ? i.createElement(f) : void 0,
            onClick: ($) => {
              $.stopPropagation(), r(e);
            }
          })
        ) : null,
        a ? i.createElement(
          u,
          { title: "删除" },
          i.createElement(
            m,
            {
              title: `删除专家团「${e.name}」？`,
              description: "此操作会删除后端定义，但不会删除既有讨论记录。",
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 },
              onConfirm: () => a(e)
            },
            i.createElement(c, {
              type: "text",
              size: "small",
              danger: !0,
              icon: h ? i.createElement(h) : void 0,
              onClick: ($) => $.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    i.createElement(
      S,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    i.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ...R.map(
        ($) => i.createElement(
          u,
          {
            key: $.name,
            title: `${$.name}（${$.role}）${$.temporary ? " - OMP 临时派生" : $.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
          },
          i.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: $.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${$.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            i.createElement(rt, { name: $.name, size: 18 }),
            i.createElement(
              v,
              {
                style: { fontSize: 11, color: $.found ? "#1f4e8c" : "#531dab" }
              },
              $.name
            ),
            $.temporary ? i.createElement(
              o,
              {
                color: "purple",
                style: { fontSize: 9, marginInlineEnd: 0 }
              },
              "派生"
            ) : null
          )
        )
      )
    ),
    // Toggle flow diagram
    i.createElement(
      c,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: ($) => {
          $.stopPropagation(), N(!B);
        },
        icon: B ? E ? i.createElement(E) : "▲" : y ? i.createElement(y) : "▼"
      },
      B ? "收起流程" : "查看执行流程"
    ),
    B ? i.createElement(Gl, { team: e }) : null,
    // Footer: launch button
    i.createElement(
      "div",
      {
        style: {
          marginTop: "auto",
          paddingTop: 8,
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }
      },
      i.createElement(
        v,
        { type: "secondary", style: { fontSize: 11 } },
        _ ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${_}` : "OMP 动态编排"
      ),
      i.createElement(
        c,
        {
          type: "primary",
          size: "small",
          icon: b ? i.createElement(b) : void 0,
          disabled: t.length === 0,
          onClick: () => n(e),
          style: Xe
        },
        "运行工作流"
      )
    )
  );
}
function Jl({
  agents: e,
  onLaunch: t
}) {
  const n = z().React, { useMemo: r, useState: a, useCallback: i, useEffect: s } = n, {
    Row: l,
    Col: o,
    Input: d,
    Empty: c,
    Typography: u,
    Tag: m,
    Button: p,
    Divider: b,
    Tabs: g,
    message: f
  } = z().antd, { SearchOutlined: h, PlusOutlined: y, RocketOutlined: E } = z().antdIcons || {}, { Text: v } = u, [S, B] = a(""), [N, w] = a([]), [x, R] = a([]), [H, _] = a(!1), [T, $] = a(null), [F, C] = a("preset");
  s(() => {
    let D = !0;
    return (async () => {
      try {
        await Pl();
        const Y = await br();
        D && w(Y);
      } catch (Y) {
        console.warn("[ugsci] Failed to load backend expert teams:", Y), D && (w([]), f.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), jl().then((Y) => {
      D && Y && R(Y);
    }), () => {
      D = !1;
    };
  }, []);
  const I = i(() => {
    br().then(w).catch((D) => {
      console.warn("[ugsci] Failed to refresh expert teams:", D), w([]), f.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [f]), L = i(
    (D) => {
      Ll(D.id).then(() => {
        I(), f.success(`团队「${D.name}」已删除`);
      }).catch((Y) => f.error(Y.message || "删除专家团失败"));
    },
    [f, I]
  ), M = i((D) => {
    $(D), _(!0);
  }, []), P = i(() => {
    $(null), _(!0);
  }, []), W = r(() => [...N, ...x], [N, x]), G = r(() => {
    if (!S.trim()) return W;
    const D = S.toLowerCase();
    return W.filter(
      (Y) => Y.name.toLowerCase().includes(D) || Y.description.toLowerCase().includes(D) || Y.category.toLowerCase().includes(D)
    );
  }, [W, S]), U = G.filter((D) => D.custom), Q = G.filter((D) => !D.custom);
  return n.createElement(
    "div",
    null,
    // Toolbar
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16
        }
      },
      n.createElement(d, {
        placeholder: "搜索团队名称、描述或类别...",
        prefix: h ? n.createElement(h) : void 0,
        value: S,
        onChange: (D) => B(D.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      n.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: y ? n.createElement(y) : void 0,
          onClick: P,
          style: Xe
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(g, {
      activeKey: F,
      onChange: C,
      items: [
        {
          key: "preset",
          label: `预设团队${Q.length ? ` (${Q.length})` : ""}`,
          children: n.createElement(
            "div",
            null,
            Q.length > 0 ? n.createElement(
              l,
              { gutter: [12, 12] },
              ...Q.map(
                (D) => n.createElement(
                  o,
                  { key: D.id, xs: 24, sm: 12, md: 8 },
                  n.createElement(Ha, {
                    team: D,
                    agents: e,
                    onLaunch: t
                  })
                )
              )
            ) : n.createElement(c, {
              description: "未找到匹配的预设团队",
              image: c.PRESENTED_IMAGE_SIMPLE
            })
          )
        },
        {
          key: "custom",
          label: `自定义团队${U.length ? ` (${U.length})` : ""}`,
          children: n.createElement(
            "div",
            null,
            U.length > 0 ? n.createElement(
              l,
              { gutter: [12, 12] },
              ...U.map(
                (D) => n.createElement(
                  o,
                  { key: D.id, xs: 24, sm: 12, md: 8 },
                  n.createElement(Ha, {
                    team: D,
                    agents: e,
                    onLaunch: t,
                    onEdit: M,
                    onDelete: L
                  })
                )
              )
            ) : n.createElement(c, {
              description: "暂无自定义团队，点击「创建专家团」自定义",
              image: c.PRESENTED_IMAGE_SIMPLE
            })
          )
        },
        {
          key: "active",
          label: "进行中的讨论",
          children: n.createElement(
            n.Fragment,
            null,
            n.createElement(Fl, {
              enabled: F === "active"
            }),
            n.createElement(Oa, {
              activeOnly: !0,
              enabled: F === "active"
            })
          )
        },
        {
          key: "history",
          label: "讨论历史",
          children: n.createElement(Oa, {
            enabled: F === "history"
          })
        }
      ]
    }),
    // Team Builder Modal
    n.createElement(Zl, {
      open: H,
      onClose: () => {
        _(!1), $(null);
      },
      agents: e,
      editingTeam: T,
      onSaved: I
    })
  );
}
function Ql({
  expert: e,
  onClose: t,
  onSaved: n
}) {
  const r = z().React, { Modal: a, Alert: i, Spin: s, Button: l, message: o } = z().antd, [d, c] = r.useState(
    null
  ), [u, m] = r.useState(null), [p, b] = r.useState(""), [g, f] = r.useState(!1), [h, y] = r.useState(0), E = kt({
    ...e,
    presentation: e.presentation ? { ...e.presentation, avatar: null } : null
  }), v = _t(e);
  r.useEffect(() => {
    let B = !0;
    return c(null), m(null), b(""), Gn(e.agent.id, !0).then((N) => {
      B && (c(N), m(
        N.avatar || kt({ ...e, presentation: N })
      ));
    }).catch((N) => {
      B && b(N.message || "无法读取头像配置");
    }), () => {
      B = !1;
    };
  }, [e.agent.id, h]);
  const S = async () => {
    if (!(!d || !u)) {
      f(!0), b("");
      try {
        await Nr(e.agent.id, {
          ...d,
          avatar: u
        }), Ct(), n(), o.success("专家头像已保存"), t();
      } catch (B) {
        b(B.message || "头像保存失败，修改内容已保留");
      } finally {
        f(!1);
      }
    }
  };
  return r.createElement(
    a,
    {
      open: !0,
      title: r.createElement(
        "span",
        { style: { fontSize: 15, fontWeight: 600, lineHeight: 1.5 } },
        "UGSci 专家头像工坊"
      ),
      width: 736,
      centered: !0,
      className: "ugsci-avatar-modal",
      destroyOnHidden: !0,
      onCancel: g ? void 0 : t,
      closable: !g,
      maskClosable: !g,
      keyboard: !g,
      onOk: S,
      okText: "保存头像",
      cancelText: "取消",
      okButtonProps: { disabled: !u, loading: g },
      cancelButtonProps: { disabled: g },
      styles: {
        content: {
          padding: 0,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--app-border)",
          background: "var(--app-surface)"
        },
        header: {
          boxSizing: "border-box",
          padding: "10px 24px",
          minHeight: 48,
          margin: 0,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--app-border)",
          background: "var(--app-surface)"
        },
        body: {
          padding: 0,
          maxHeight: "calc(100dvh - 190px)",
          overflowY: "auto"
        },
        footer: {
          padding: "11px 24px",
          margin: 0,
          borderTop: "1px solid var(--app-border)"
        }
      },
      footer: r.createElement(
        "div",
        { className: "ugsci-avatar-modal-footer" },
        r.createElement(Bi, {
          disabled: g || !u,
          onClick: () => m(
            (B) => B && { ...B, colors: {} }
          )
        }),
        r.createElement(
          "div",
          null,
          r.createElement(
            l,
            { disabled: g, onClick: t },
            "取消"
          ),
          r.createElement(
            l,
            {
              type: "primary",
              disabled: !u,
              loading: g,
              onClick: S
            },
            "保存头像"
          )
        )
      )
    },
    p && r.createElement(i, {
      type: "error",
      showIcon: !0,
      message: p,
      action: r.createElement(
        l,
        {
          size: "small",
          disabled: g,
          onClick: () => y((B) => B + 1)
        },
        "重新加载配置"
      )
    }),
    u ? r.createElement(Hi, {
      name: v.name,
      value: u,
      suggested: E,
      onChange: m,
      disabled: g,
      showResetColors: !1
    }) : !p && r.createElement(s, { size: "small" })
  );
}
const Kl = [
  {
    key: "ugs-cycle-review",
    icon: "🏭",
    name: "储气库周期运行评价",
    category: "生产运行",
    description: "资料质检、库容与压力分析、注采能力预测、风险复核和运行建议。",
    sop: "校验储气库本周期井口、井底压力和注采量数据；分析库容、压力窗口与单井能力；预测下一周期注采能力；由完整性专家复核井筒与盖层风险；生成带证据和风险边界的运行建议。",
    roleHints: [
      "Underground Gas Storage",
      "PVT",
      "储气库",
      "Verifier",
      "Underground Gas Storage"
    ],
    roleKeys: [
      "analyst",
      "pvt-analyst",
      "reservoir-engineer",
      "domain-reviewer",
      "analyst"
    ]
  },
  {
    key: "reservoir-model-review",
    icon: "🛢️",
    name: "油藏模型历史拟合与复核",
    category: "开发研究",
    description: "从数据质检到模拟、敏感性分析、独立复算和成果归档。",
    sop: "检查静动态数据、单位和模型版本；运行油藏数值模拟与历史拟合；开展关键参数敏感性和不确定性分析；由独立油藏工程师复核；归档模型、脚本、运行日志和结论。",
    roleHints: [
      "油藏工程师",
      "油藏工程师",
      "油藏工程师 Copy",
      "Verifier",
      "油藏工程师"
    ],
    roleKeys: [
      "analyst",
      "reservoir-engineer",
      "reservoir-engineer",
      "domain-reviewer",
      "analyst"
    ]
  },
  {
    key: "research-validation",
    icon: "🔬",
    name: "科研方法验证与独立复算",
    category: "科学研究",
    description: "文献证据、方法实现、对照实验、反方审查和可复现成果。",
    sop: "检索并分级相关文献证据；定义可证伪假设和评价指标；实现候选方法并运行对照实验；由独立专家复算关键结果；由反方审稿专家检查替代解释；归档数据、代码、环境、不确定性和负结果。",
    roleHints: [
      "QA Agent",
      "Default",
      "QA Agent",
      "Verifier",
      "QA Agent",
      "QA Agent"
    ],
    roleKeys: [
      "analyst",
      "analyst",
      "analyst",
      "domain-reviewer",
      "analyst",
      "analyst"
    ]
  }
], Xl = 5e3, cr = {
  completed: "green",
  success: "green",
  failed: "red",
  error: "red",
  cancelled: "orange",
  running: "blue",
  queued: "cyan",
  paused: "gold",
  waiting_human: "gold",
  timeout: "volcano"
};
function Yl(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Xt(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), Yl(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function ec(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function tc(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function nc(e) {
  if (!e) return "";
  const t = Object.keys(e).length;
  if (t === 0) return "";
  const n = Object.values(e).filter(
    (a) => a === "success" || a === "completed" || a === "skipped" || a === "cached"
  ).length, r = Object.values(e).filter(
    (a) => a === "error" || a === "failed"
  ).length;
  return r > 0 ? `${n}/${t} 节点完成 (${r} 失败)` : `${n}/${t} 节点完成`;
}
function Ji(e) {
  return {
    success: "已完成",
    completed: "已完成",
    skipped: "已跳过",
    cached: "已缓存",
    running: "执行中",
    queued: "排队中",
    waiting: "等待中",
    pending: "待执行",
    error: "失败",
    failed: "失败",
    cancelled: "已取消"
  }[e] || e;
}
function Yt(e) {
  return ["success", "completed", "skipped", "cached"].includes(e) ? "green" : ["error", "failed"].includes(e) ? "red" : ["running"].includes(e) ? "blue" : ["queued", "pending"].includes(e) ? "cyan" : "gold";
}
function rc(e, t) {
  const n = typeof e.type == "string" ? e.type : "事件", r = typeof e.node_id == "string" ? ` · ${e.node_id}` : "", a = e.state && typeof e.state == "object" ? e.state : {}, i = e.data && typeof e.data == "object" ? e.data : {}, s = [e.message, a.message, a.error, i.message, i.error].find(
    (d) => typeof d == "string" && d.length > 0
  ) || "";
  if (s) return `${n}${r}: ${s}`;
  const l = typeof e.status == "string" ? e.status : typeof a.status == "string" ? a.status : "", o = l ? ` · ${Ji(l)}` : "";
  if (o) return `${n}${r}${o}`;
  try {
    const d = JSON.stringify(Object.keys(i).length > 0 ? i : e) || "{}", c = d.length > 240 ? `${d.slice(0, 237)}...` : d;
    return `${n}${r}: ${c}`;
  } catch {
    return `${n}${r} #${t + 1}`;
  }
}
const ac = /* @__PURE__ */ new Set([
  "running",
  "queued",
  "paused",
  "waiting_human"
]);
function kn(e) {
  return !e.resumed_by_run_id && ac.has(e.status);
}
function ic() {
  const e = z().React, { useCallback: t, useEffect: n, useRef: r, useState: a } = e, {
    Alert: i,
    Button: s,
    Card: l,
    Col: o,
    Empty: d,
    Input: c,
    Popconfirm: u,
    Modal: m,
    Row: p,
    Space: b,
    Spin: g,
    Tabs: f,
    Progress: h,
    Tag: y,
    Tooltip: E,
    Typography: v,
    message: S
  } = z().antd, {
    ApartmentOutlined: B,
    DeleteOutlined: N,
    ReloadOutlined: w,
    RocketOutlined: x,
    PlayCircleOutlined: R,
    StopOutlined: H
  } = z().antdIcons || {}, { Text: _, Paragraph: T, Title: $ } = v, F = z().useSelectedAgent, C = F ? F() : { id: "default" }, I = (C == null ? void 0 : C.id) || "default", [L, M] = a([]), [P, W] = a([]), [G, U] = a([]), [Q, D] = a(!0), [Y, ne] = a(!0), [re, se] = a(null), [X, pe] = a(null), [ye, q] = a(""), j = r(0), ge = r(I);
  ge.current = I;
  const [we, ve] = a(""), [ue, Se] = a(""), [xe, Ie] = a("templates"), [_e, oe] = a(/* @__PURE__ */ new Set()), [te, le] = a(/* @__PURE__ */ new Set()), Z = r(null), A = P.some(kn), O = e.useMemo(() => {
    const J = {};
    return L.forEach((Ee) => {
      J[Ee.id] = Ee.name;
    }), J;
  }, [L]), K = e.useMemo(() => {
    const J = {};
    return P.forEach((Ee) => {
      kn(Ee) && (J[Ee.flow_id] = (J[Ee.flow_id] || 0) + 1);
    }), J;
  }, [P]), V = t(async (J = !1) => {
    J || D(!0);
    try {
      const [Ee, Re, Ve] = await Promise.all([
        he("/flowforge/flows", { bypassCache: !0 }),
        he("/flowforge/runs", { bypassCache: !0 }),
        En().catch(() => [])
      ]);
      M(Ee), W(Re), U(Ve), ne(!0);
    } catch (Ee) {
      console.warn("[ugsci] FlowForge is unavailable:", Ee), J || ne(!1);
    } finally {
      J || D(!1);
    }
  }, []);
  n(() => {
    V();
  }, [V]), n(() => {
    if (!Y || !A) {
      Z.current && (clearInterval(Z.current), Z.current = null);
      return;
    }
    let J = !1;
    return Z.current = setInterval(async () => {
      if (!J) {
        J = !0;
        try {
          await V(!0);
        } finally {
          J = !1;
        }
      }
    }, Xl), () => {
      Z.current && (clearInterval(Z.current), Z.current = null);
    };
  }, [A, Y, V]);
  const fe = t(
    async (J) => {
      if (!re) {
        se(J.key);
        try {
          const Ee = await he(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: J.sop,
                name: J.name,
                agent_id: I
              })
            }
          ), Re = {
            ...Ee.nodes || {}
          }, Ve = Object.entries(Re).filter(([Ze]) => /^step_\d+$/.test(Ze)).sort(
            ([Ze], [$e]) => Number(Ze.slice(5)) - Number($e.slice(5))
          ), me = {};
          let Be = 0, Ue = 0;
          Ve.forEach(([Ze, $e], ut) => {
            const ot = J.roleHints[ut] || "", De = J.roleKeys[ut] || "analyst", Le = G.find(
              (Vt) => `${Vt.name} ${Vt.id}`.toLowerCase().includes(ot.toLowerCase())
            );
            Le ? Be++ : Ue++;
            const lt = (Le == null ? void 0 : Le.id) || I, Tt = {
              ...$e.inputs || {}
            };
            Tt.agent_id = lt, Re[Ze] = {
              ...$e,
              inputs: Tt,
              metadata: {
                ...$e.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: ot,
                role_key: De,
                agent_id: lt
              }
            }, me[Ze] = {
              binding_policy: "fixed_instance",
              role_hint: ot,
              role_key: De,
              agent_id: lt
            };
          });
          const Ge = {
            ...Ee,
            nodes: Re,
            id: `${J.key}-${Date.now()}`,
            name: J.name,
            description: J.description,
            metadata: {
              ...Ee.metadata || {},
              domain: "oil-gas",
              template_key: J.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: I,
              node_bindings: me
            }
          };
          await he("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(Ge)
          });
          const st = Ve.length > 0 ? `（${Be} 个专家已匹配，${Ue} 个回退到控制器）` : "";
          S.success(`已创建工作流草稿「${J.name}」${st}`), await V();
        } catch (Ee) {
          S.error(Ee.message || "创建工作流失败");
        } finally {
          se(null);
        }
      }
    },
    [G, I, re, V, S]
  );
  n(() => {
    j.current++, pe(null), q(""), se(null);
  }, [I]);
  const ee = t(async () => {
    if (re || !ue.trim()) return;
    const J = ++j.current;
    se("natural-language"), q("");
    try {
      const Ee = await he(
        "/flowforge/authoring/proposals",
        {
          method: "POST",
          body: JSON.stringify({
            prompt: ue.trim(),
            name: we.trim(),
            agent_id: I
          })
        }
      );
      J === j.current && pe(Ee);
    } catch (Ee) {
      J === j.current && q(Ee.message || "生成失败，请检查模型配置后重试");
    } finally {
      J === j.current && se(null);
    }
  }, [I, re, we, ue]), be = t(async () => {
    if (!(X != null && X.validation.ok) || re) return;
    const J = I;
    se("apply"), q("");
    try {
      const Ee = await he(
        `/flowforge/authoring/proposals/${encodeURIComponent(
          X.proposal_id
        )}/apply`,
        {
          method: "POST",
          body: JSON.stringify({ expected_revision: X.base_revision })
        }
      );
      if (ge.current !== J) return;
      pe(null), ve(""), Se(""), S.success("方案已应用并保存"), Xt(Ee.id);
    } catch (Ee) {
      ge.current === J && q(Ee.message || "应用失败，请重新生成方案");
    } finally {
      ge.current === J && se(null);
    }
  }, [X, re, I, S]), ke = t(
    async (J, Ee) => {
      try {
        await he(`/flowforge/flows/${encodeURIComponent(J)}`, {
          method: "DELETE"
        }), S.success(`已删除工作流「${Ee}」`), await V();
      } catch (Re) {
        S.error(Re.message || "删除工作流失败");
      }
    },
    [V, S]
  ), Ae = t(
    async (J) => {
      oe((Ee) => {
        const Re = new Set(Ee);
        return Re.add(J), Re;
      });
      try {
        await he(`/flowforge/runs/${encodeURIComponent(J)}/cancel`, {
          method: "POST"
        }), S.success("已请求取消运行"), await V(!0);
      } catch (Ee) {
        S.error(Ee.message || "取消运行失败");
      } finally {
        oe((Ee) => {
          const Re = new Set(Ee);
          return Re.delete(J), Re;
        });
      }
    },
    [V, S]
  ), qe = e.createElement(
    "div",
    null,
    e.createElement(
      l,
      {
        size: "small",
        title: "用自然语言生成工作流",
        style: { marginBottom: 16 }
      },
      e.createElement(
        b,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(c, {
          "aria-label": "工作流名称",
          value: we,
          onChange: (J) => ve(J.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(c.TextArea, {
          "aria-label": "工作流需求描述",
          value: ue,
          onChange: (J) => Se(J.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          s,
          {
            type: "primary",
            onClick: () => void ee(),
            loading: re === "natural-language",
            disabled: !Y || !!re || !ue.trim(),
            style: Xe
          },
          "生成并预览方案"
        )
      )
    ),
    e.createElement(
      p,
      { gutter: [12, 12] },
      ...Kl.map(
        (J) => e.createElement(
          o,
          { key: J.key, xs: 24, md: 8 },
          e.createElement(
            l,
            { style: { height: "100%" } },
            e.createElement(
              b,
              { align: "start", style: { width: "100%" } },
              e.createElement(
                "span",
                { style: { fontSize: 28 } },
                J.icon
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  $,
                  { level: 5, style: { margin: 0 } },
                  J.name
                ),
                e.createElement(
                  y,
                  { color: "blue", style: { marginTop: 6 } },
                  J.category
                ),
                e.createElement(
                  T,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  J.description
                ),
                e.createElement(
                  s,
                  {
                    type: "primary",
                    loading: re === J.key,
                    disabled: !Y || !!re,
                    onClick: () => void fe(J),
                    style: Xe
                  },
                  "创建草稿"
                )
              )
            )
          )
        )
      )
    ),
    e.createElement(
      l,
      { size: "small", title: "专家节点绑定策略", style: { marginTop: 16 } },
      e.createElement(
        p,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([J, Ee, Re]) => e.createElement(
            o,
            { key: J, xs: 24, sm: 12, lg: 6 },
            e.createElement(_, { strong: !0 }, J),
            e.createElement(
              y,
              {
                color: Re === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              Re
            ),
            e.createElement(
              "div",
              {
                style: {
                  color: "var(--ant-color-text-tertiary, #8c8c8c)",
                  fontSize: 12,
                  marginTop: 4
                }
              },
              Ee
            )
          )
        )
      )
    )
  ), We = Q ? e.createElement(g) : L.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    p,
    { gutter: [12, 12] },
    ...L.map((J) => {
      const Ee = K[J.id] || 0;
      return e.createElement(
        o,
        { key: J.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          l,
          {
            size: "small",
            title: e.createElement(
              b,
              { size: 6 },
              e.createElement("span", null, J.name),
              Ee > 0 ? e.createElement(
                y,
                { color: "blue" },
                `${Ee} 个运行中`
              ) : null
            ),
            extra: e.createElement(y, null, `v${J.version}`)
          },
          e.createElement(
            T,
            { ellipsis: { rows: 2 } },
            J.description || "暂无描述"
          ),
          e.createElement(
            b,
            { size: 8, wrap: !0 },
            e.createElement(
              y,
              { color: "geekblue" },
              `${J.node_count} 个节点`
            ),
            e.createElement(
              s,
              {
                size: "small",
                type: "primary",
                icon: R ? e.createElement(R) : void 0,
                disabled: !Y,
                onClick: () => Xt(J.id)
              },
              "配置并运行"
            ),
            e.createElement(
              s,
              {
                size: "small",
                onClick: () => Xt(J.id)
              },
              "编辑"
            ),
            e.createElement(
              u,
              {
                title: "确认删除",
                description: `确定要删除工作流「${J.name}」吗？此操作不可撤销。`,
                onConfirm: () => void ke(J.id, J.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(
                s,
                {
                  size: "small",
                  danger: !0,
                  icon: N ? e.createElement(N) : void 0
                },
                "删除"
              )
            )
          )
        )
      );
    })
  ), dt = Q ? e.createElement(g) : P.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...P.map((J) => {
      const Ee = O[J.flow_id] || J.flow_id, Re = kn(J), Ve = nc(J.node_statuses), me = Object.entries(J.node_statuses || {}), Be = me.filter(
        ([, De]) => ["success", "completed", "skipped", "cached"].includes(De)
      ).length, Ue = me.filter(
        ([, De]) => ["error", "failed"].includes(De)
      ).length, Ge = me.length > 0, st = J.status === "completed" || J.status === "success", Ze = Ge ? Math.round(Be / me.length * 100) : Re ? 18 : st ? 100 : 0, $e = Array.isArray(J.events) ? J.events.filter(
        (De) => !!De && typeof De == "object"
      ).slice(-100) : [], ut = te.has(J.run_id), ot = J.duration_ms && J.duration_ms > 0 ? J.duration_ms : J.finished_at && J.started_at ? (J.finished_at - J.started_at) * 1e3 : Re && J.started_at ? (Date.now() / 1e3 - J.started_at) * 1e3 : 0;
      return e.createElement(
        l,
        {
          key: J.run_id,
          size: "small",
          style: {
            borderLeft: `3px solid ${cr[J.status] === "green" ? "#52c41a" : cr[J.status] === "red" ? "#ff4d4f" : "#1677ff"}`,
            transition: "box-shadow .2s ease"
          }
        },
        e.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap"
            }
          },
          e.createElement(
            y,
            { color: cr[J.status] || "default" },
            J.resumed_by_run_id ? "已恢复" : J.status
          ),
          e.createElement(_, { strong: !0 }, Ee),
          e.createElement(
            E,
            { title: J.run_id },
            e.createElement(
              _,
              {
                type: "secondary",
                style: { fontFamily: "monospace", fontSize: 11 }
              },
              J.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            _,
            { type: "secondary", style: { fontSize: 12 } },
            ec(J.started_at)
          ),
          ot > 0 ? e.createElement(
            _,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${tc(ot)}`
          ) : null,
          Ve ? e.createElement(
            y,
            { color: "geekblue", style: { fontSize: 11 } },
            Ve
          ) : null,
          J.error ? e.createElement(
            E,
            { title: J.error },
            e.createElement(
              _,
              { type: "danger", style: { fontSize: 12 } },
              "（有错误）"
            )
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            Re ? e.createElement(
              u,
              {
                title: "确认取消运行？",
                onConfirm: () => void Ae(J.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(
                s,
                {
                  size: "small",
                  danger: !0,
                  loading: _e.has(J.run_id),
                  icon: H ? e.createElement(H) : void 0
                },
                "取消运行"
              )
            ) : null,
            e.createElement(
              s,
              {
                size: "small",
                type: "link",
                onClick: () => le((De) => {
                  const Le = new Set(De);
                  return Le.has(J.run_id) ? Le.delete(J.run_id) : Le.add(J.run_id), Le;
                })
              },
              ut ? "收起过程" : "查看过程"
            ),
            e.createElement(
              s,
              {
                size: "small",
                type: "link",
                onClick: () => Xt(void 0, J.run_id)
              },
              "查看详情"
            )
          )
        ),
        e.createElement(
          "div",
          {
            style: {
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 10
            }
          },
          e.createElement(h, {
            percent: Ze,
            size: "small",
            status: Ue || J.status === "failed" || J.status === "error" ? "exception" : Re ? "active" : "success",
            showInfo: !1,
            style: { flex: 1, margin: 0 }
          }),
          e.createElement(
            _,
            {
              type: "secondary",
              style: { fontSize: 12, minWidth: 90, textAlign: "right" }
            },
            Ge ? `${Ze}%` : "暂无节点进度"
          )
        ),
        ut && (me.length > 0 || $e.length > 0 || J.error) ? e.createElement(
          "div",
          {
            style: {
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "var(--ant-color-fill-quaternary, #fafafa)"
            }
          },
          e.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8
              }
            },
            e.createElement(_, { strong: !0 }, "协作过程"),
            e.createElement(
              _,
              { type: "secondary", style: { fontSize: 12 } },
              me.length > 0 ? `${Be}/${me.length} 个 Agent 节点完成${Ue ? ` · ${Ue} 个失败` : ""}` : "暂无节点状态"
            )
          ),
          me.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 7 } },
            ...me.map(
              ([De, Le], lt) => e.createElement(
                "div",
                {
                  key: De,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }
                },
                e.createElement(
                  "span",
                  {
                    style: {
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: Yt(Le) === "green" ? "#f6ffed" : Yt(Le) === "red" ? "#fff2f0" : "#e6f4ff",
                      color: Yt(Le) === "green" ? "#389e0d" : Yt(Le) === "red" ? "#cf1322" : "#1677ff",
                      fontSize: 11,
                      fontWeight: 600
                    }
                  },
                  lt + 1
                ),
                e.createElement(
                  _,
                  { style: { flex: 1, fontSize: 12 } },
                  De.replace(/^step[_-]?\d+[_-]?/, "") || `Agent ${lt + 1}`
                ),
                lt < me.length - 1 ? e.createElement(
                  _,
                  {
                    type: "secondary",
                    style: { fontSize: 11 }
                  },
                  "→"
                ) : null,
                e.createElement(
                  y,
                  {
                    color: Yt(Le),
                    style: { margin: 0, fontSize: 11 }
                  },
                  Ji(Le)
                )
              )
            )
          ) : null,
          $e.length > 0 ? e.createElement(
            "div",
            {
              style: {
                display: "grid",
                gap: 5,
                marginTop: me.length > 0 ? 10 : 0
              }
            },
            e.createElement(
              _,
              { strong: !0, style: { fontSize: 12 } },
              "执行事件"
            ),
            ...$e.map(
              (De, Le) => e.createElement(
                _,
                {
                  key: `event-${Le}`,
                  type: "secondary",
                  style: { fontSize: 12 }
                },
                rc(De, Le)
              )
            )
          ) : null,
          J.error ? e.createElement(i, {
            type: "error",
            showIcon: !0,
            message: "运行错误",
            description: J.error,
            style: { marginTop: 10 }
          }) : null
        ) : null
      );
    })
  ), qt = e.createElement(
    b,
    null,
    e.createElement(
      s,
      {
        icon: w ? e.createElement(w) : void 0,
        onClick: () => void V(),
        loading: Q
      },
      "刷新"
    ),
    xe !== "templates" ? e.createElement(
      s,
      {
        type: "primary",
        icon: B ? e.createElement(B) : x ? e.createElement(x) : void 0,
        onClick: () => Xt(),
        disabled: !Y,
        style: Xe
      },
      "打开流程编辑器"
    ) : null
  );
  return e.createElement(
    "div",
    null,
    Y ? null : e.createElement(i, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    ye ? e.createElement(i, {
      type: "error",
      showIcon: !0,
      message: "方案未应用",
      description: ye,
      style: { marginBottom: 12 }
    }) : null,
    e.createElement(
      m,
      {
        title: "审查工作流方案",
        open: !!X,
        width: 720,
        onCancel: () => {
          re || (pe(null), q(""));
        },
        onOk: () => void be(),
        okText: "应用并打开编辑器",
        cancelText: "放弃方案",
        confirmLoading: re === "apply",
        okButtonProps: { disabled: !(X != null && X.validation.ok) || !!re },
        cancelButtonProps: { disabled: !!re },
        closable: !re,
        maskClosable: !re
      },
      X ? e.createElement(
        b,
        { direction: "vertical", style: { width: "100%" } },
        e.createElement(i, {
          type: X.validation.ok ? "success" : "error",
          showIcon: !0,
          message: X.validation.ok ? "结构验证通过，请检查业务逻辑" : "方案未通过验证",
          description: X.validation.errors.join("；") || "确认后保存流程，可在编辑器配置业务输入并试运行。"
        }),
        ...X.warnings.map(
          (J, Ee) => e.createElement(i, {
            key: `warning-${Ee}`,
            type: "warning",
            message: J
          })
        ),
        e.createElement(
          "ul",
          null,
          ...X.changes.map(
            (J, Ee) => e.createElement("li", { key: Ee }, J.description)
          )
        ),
        ye ? e.createElement(i, {
          type: "error",
          message: ye
        }) : null
      ) : null
    ),
    e.createElement(f, {
      items: [
        { key: "templates", label: "工作流模板", children: qe },
        {
          key: "mine",
          label: `我的工作流 (${L.length})`,
          children: We
        },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            P.length,
            A ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${P.filter((J) => kn(J)).length} 活跃`
            ) : null,
            ")"
          ),
          children: dt
        }
      ],
      activeKey: xe,
      onChange: (J) => Ie(J),
      tabBarExtraContent: qt
    })
  );
}
function Ua(e, t) {
  var a, i;
  const n = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), r = e.members.find((s) => s.name === n) || e.members[0];
  if ((r == null ? void 0 : r.bindingMode) !== "temporary" && (r != null && r.agentId) && t.some((s) => s.id === r.agentId))
    return r.agentId;
  if (n && (r == null ? void 0 : r.bindingMode) !== "temporary") {
    const s = Gi(t, n);
    if (s) return s;
  }
  return (r == null ? void 0 : r.bindingMode) === "fixed" ? null : ((i = t[0]) == null ? void 0 : i.id) || null;
}
function ja() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function sc() {
  var le, Z, A;
  const e = z().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, i = (Z = (le = z()).useNavigate) == null ? void 0 : Z.call(le), s = r(
    (O) => {
      i ? i(O) : window.location.assign(O);
    },
    [i]
  ), {
    Spin: l,
    Empty: o,
    Input: d,
    Button: c,
    message: u,
    Tabs: m,
    Modal: p,
    Typography: b
  } = z().antd, { ReloadOutlined: g, PlusOutlined: f, SearchOutlined: h } = z().antdIcons || {}, { Text: y, Paragraph: E } = b, [v, S] = t([]), [B, N] = t(!0), [w, x] = t(!1), [R, H] = t(null), [_, T] = t(""), [$, F] = t("全部专家"), [C, I] = t(!1), [L, M] = t(ja), [P, W] = t(
    null
  ), [G, U] = t(""), [Q, D] = t(!1), [Y, ne] = t(!1), [re, se] = t(null), [X, pe] = t(null), [ye, q] = t([]), j = r(async () => {
    N(!0);
    try {
      const O = await En(), K = await Promise.all(
        O.map(async (V) => {
          try {
            const [fe, ee, be, ke] = await Promise.all(
              [
                Br(V.id).catch(() => null),
                Zn(V.id).catch(() => []),
                Ur(V.id).catch(
                  () => []
                ),
                Gn(V.id).catch(() => null)
              ]
            );
            return {
              agent: V,
              config: fe,
              skills: ee,
              mcps: be,
              presentation: ke,
              loading: !1
            };
          } catch {
            return {
              agent: V,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      S(K), q(O);
    } catch (O) {
      u.error(O.message || "加载专家列表失败"), S([]);
    } finally {
      N(!1);
    }
  }, []);
  n(() => {
    j();
  }, [j]), n(() => {
    const O = () => M(ja());
    return window.addEventListener("popstate", O), () => window.removeEventListener("popstate", O);
  }, []), n(() => {
    if (re && Y) {
      const O = v.find((K) => K.agent.id === re.agent.id);
      O && O !== re && se(O);
    }
  }, [v, re, Y]);
  const ge = r(
    async (O) => {
      var ee;
      const K = O.coordinatorName || ((ee = O.members[0]) == null ? void 0 : ee.name), V = Ua(O, ye);
      if (!V) {
        const be = O.members.find(
          (ke) => ke.name === K
        );
        u.error(
          (be == null ? void 0 : be.bindingMode) === "fixed" ? `固定协调者「${K || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(O.taskTemplate)) {
        U(O.taskTemplate), W(O);
        return;
      }
      await we(O, V, O.taskTemplate);
    },
    [ye, u]
  ), we = r(
    async (O, K, V) => {
      D(!0);
      try {
        const fe = V || O.taskTemplate, ee = O.custom ? `@${O.id}` : O.name, be = `/ugsci-team ${O.mode} ${ee} ${fe}`, ke = z();
        ke.setSelectedAgent && ke.setSelectedAgent(K);
        const Ae = await Nl(K, be, O.name);
        u.success(`OMP 工作流已启动：${O.name}（${O.mode}模式）`), W(null), s(`/chat/${Ae}`);
      } catch (fe) {
        u.error(fe.message || "发起团队任务失败");
      } finally {
        D(!1);
      }
    },
    [u, s]
  ), ve = r((O) => {
    H(O), x(!0);
  }, []), ue = r((O) => {
    se(O), ne(!0);
  }, []), Se = r(
    (O) => {
      if (!O.agent.enabled) {
        u.warning(`专家「${O.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        if (O.agent.managed_by_app) {
          s(
            `/apps/${encodeURIComponent(O.agent.managed_by_app)}`
          );
          return;
        }
        if (O.agent.available_in_chat === !1)
          throw new Error("此专家不支持通用聊天，请从所属应用打开");
        const K = z();
        if (!K.setSelectedAgent)
          throw new Error("当前版本不支持切换专家，请更新软件后重试");
        K.setSelectedAgent(O.agent.id), sessionStorage.setItem("qwenpaw_pending_new_chat", "1"), s("/chat"), u.success(`已召唤专家「${O.agent.name}」`);
      } catch (K) {
        sessionStorage.removeItem("qwenpaw_pending_new_chat"), console.warn("[ugsci] Failed to set selected agent:", K), u.error(
          K instanceof Error ? K.message : "召唤专家失败，请重试"
        );
      }
    },
    [u, s]
  ), xe = a(() => {
    const O = _.trim().toLowerCase();
    return v.filter((K) => {
      const V = _t(K);
      return ($ === "全部专家" || V.category === $) && `${V.name} ${V.specialty} ${V.summary} ${K.agent.name} ${K.agent.id} ${K.agent.description || ""} ${K.skills.map((fe) => fe.name).join(" ")}`.toLowerCase().includes(O);
    });
  }, [v, _, $]), Ie = v.filter((O) => O.agent.enabled).length, _e = v.reduce(
    (O, K) => O + K.skills.filter((V) => V.enabled !== !1).length,
    0
  ), oe = v.reduce((O, K) => O + K.mcps.length, 0), te = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(To, { size: 16 }),
        "专家"
      ),
      children: e.createElement(
        "div",
        { className: "ugsci-expert-library" },
        e.createElement("style", null, $i),
        // Search bar
        e.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16
            }
          },
          e.createElement(d, {
            placeholder: "搜索名称、职责或技能",
            "aria-label": "搜索专家",
            prefix: h ? e.createElement(h) : void 0,
            value: _,
            onChange: (O) => T(O.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            c,
            {
              type: "primary",
              icon: f ? e.createElement(f) : void 0,
              onClick: () => I(!0),
              style: Xe
            },
            "创建专家"
          )
        ),
        e.createElement(
          "nav",
          { className: "ugsci-expert-filters", "aria-label": "专家分类" },
          ...Ri.map(
            (O) => e.createElement(
              "button",
              {
                key: O,
                type: "button",
                className: "ugsci-expert-filter",
                "aria-pressed": $ === O,
                onClick: () => F(O)
              },
              O,
              e.createElement(
                "small",
                null,
                O === "全部专家" ? v.length : v.filter(
                  (K) => _t(K).category === O
                ).length
              )
            )
          )
        ),
        // Content
        B ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : xe.length === 0 ? e.createElement(o, {
          description: _ || $ !== "全部专家" ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          "div",
          {
            className: "ugsci-expert-grid",
            "aria-live": "polite"
          },
          ...xe.map(
            (O) => e.createElement(
              "div",
              {
                key: O.agent.id,
                style: { display: "flex", minWidth: 0 }
              },
              e.createElement(kl, {
                expert: O,
                onClick: () => ve(O),
                onSummon: () => Se(O),
                onConfigure: () => ue(O),
                onEditAvatar: () => pe(O)
              })
            )
          )
        )
      )
    },
    {
      key: "teams",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(Mo, { size: 16 }),
        "专家团"
      ),
      children: e.createElement(Jl, {
        agents: ye,
        onLaunch: ge
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(Io, { size: 16 }),
        "协作工作流"
      ),
      children: e.createElement(ic)
    }
  ];
  return e.createElement(
    "div",
    {
      className: L === "experts" ? "ugsci-expert-page" : void 0,
      style: { padding: 24 }
    },
    e.createElement(Wn, {
      title: "专家·协作",
      subtitle: L === "experts" ? `共 ${v.length} 位专家（${Ie} 位启用）· ${_e} 个技能 · ${oe} 个 MCP 客户端` : L === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        L === "experts" ? e.createElement(
          c,
          {
            icon: g ? e.createElement(g) : void 0,
            onClick: () => {
              Ct(), j();
            },
            loading: B
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(m, {
      items: te,
      activeKey: L,
      onChange: (O) => {
        M(O);
        const K = new URL(window.location.href);
        O === "experts" ? K.searchParams.delete("section") : K.searchParams.set("section", O), window.history.pushState({}, "", `${K.pathname}${K.search}`);
      }
    }),
    // Drawer
    e.createElement(_l, {
      onSummon: Se,
      expert: R,
      open: w,
      onClose: () => x(!1)
    }),
    // Template Modal
    e.createElement(Cl, {
      open: C,
      onClose: () => I(!1),
      onCreated: () => j()
    }),
    // Config Modal (gear icon)
    X && e.createElement(Ql, {
      key: X.agent.id,
      expert: X,
      onClose: () => pe(null),
      onSaved: () => {
        j();
      }
    }),
    e.createElement(Sl, {
      expert: re,
      open: Y,
      onClose: () => ne(!1),
      onRefresh: () => j()
    }),
    // Team Launch Modal (for filling placeholders)
    P ? e.createElement(
      p,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Or, {
            members: P.members.map((O) => O.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${P.name}`
          )
        ),
        onCancel: () => W(null),
        onOk: () => {
          const O = Ua(
            P,
            ye
          );
          if (!O) {
            u.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const K = G.trim() || P.taskTemplate;
          we(P, O, K);
        },
        confirmLoading: Q,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          y,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(d.TextArea, {
          value: G,
          onChange: (O) => U(O.target.value),
          rows: 8,
          style: { fontSize: 13, fontFamily: "monospace" }
        })
      ),
      e.createElement(
        "div",
        {
          style: {
            marginTop: 12,
            padding: "8px 12px",
            background: "var(--app-info-bg)",
            borderRadius: 6
          }
        },
        e.createElement(
          y,
          { style: { fontSize: 12, color: "var(--app-action-link)" } },
          `协调者: ${P.coordinatorName || ((A = P.members[0]) == null ? void 0 : A.name) || "—"} · 成员: ${P.members.map((O) => O.name).join("、")}`
        )
      )
    ) : null
  );
}
const oc = `
.ugsci-capabilities { padding:24px; color:var(--app-text); min-width:0; }
.ugsci-capability-context { display:flex; align-items:center; gap:10px; margin:20px 0; flex-wrap:wrap; }
.ugsci-capability-context label { color:var(--app-text-secondary); font-size:12px; }
.ugsci-capability-section[data-focused="true"] > :not(.ugsci-capability-focus) { display:none!important; }
.ugsci-capability-focus { max-width:760px; margin:0 auto; min-width:0; }
.ugsci-capability-detail { margin-top:16px; border:1px solid var(--app-border-subtle, var(--app-border)); border-radius:14px; padding:24px; background:var(--app-surface); }
.ugsci-capability-detail-heading { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:22px; }
.ugsci-capability-detail-heading h2 { font-size:18px; margin:0; overflow-wrap:anywhere; }
.ugsci-capability-detail-footer { display:flex; justify-content:flex-end; margin-top:22px; padding-top:16px; border-top:1px solid var(--app-border-subtle); }
.ugsci-capability-card { border-radius:12px; background:var(--app-surface); height:100%; width:100%; min-width:0; }
.ugsci-capability-card > :is(.ant-card-body,.qwenpaw-card-body) { padding:12px!important; height:100%; display:flex; flex-direction:column; gap:7px; }
.ugsci-capability-card-title { display:flex; align-items:center; gap:10px; min-width:0; }
.ugsci-capability-card-title button { padding:0; border:0; background:transparent; color:inherit; text-align:left; font:inherit; font-size:15px; font-weight:600; overflow-wrap:anywhere; cursor:pointer; }
.ugsci-capability-avatar { width:36px; height:36px; flex-shrink:0; border-radius:9px; display:grid; place-items:center; background:var(--app-fill-faint,var(--app-fill-subtle)); font-size:21px; }
.ugsci-capability-avatar img { width:36px; height:36px; object-fit:contain; border-radius:8px; }
.ugsci-capability-card-footer { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-top:auto; padding-top:4px; }
.ugsci-capability-card-copy { color:var(--app-text-secondary); font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
.ugsci-capability-card-meta { display:flex; align-items:center; gap:5px; flex-wrap:wrap; color:var(--app-text-tertiary); font-size:11px; }
.ugsci-capabilities :is(.ant-tabs-nav,.qwenpaw-tabs-nav) { margin-bottom:20px; }
.ugsci-engine-tabs > :is(.ant-tabs-nav,.qwenpaw-tabs-nav) :is(.ant-tabs-tab,.qwenpaw-tabs-tab) { padding:8px 12px; border:1px solid var(--app-border-subtle); border-radius:9px; margin:0 8px 0 0; }
.ugsci-engine-tabs > :is(.ant-tabs-nav,.qwenpaw-tabs-nav) :is(.ant-tabs-tab-active,.qwenpaw-tabs-tab-active) { background:var(--app-accent-faint); border-color:var(--app-accent); }
.ugsci-engine-tabs > :is(.ant-tabs-nav,.qwenpaw-tabs-nav)::before { border:0; }
.ugsci-engine-tabs > :is(.ant-tabs-nav,.qwenpaw-tabs-nav) :is(.ant-tabs-ink-bar,.qwenpaw-tabs-ink-bar) { display:none; }
.ugsci-capability-detail-footer :is(.ant-btn-primary,.qwenpaw-btn-primary):not(:disabled) { color:var(--app-action-fg,#fff)!important; }
.ugsci-capability-advanced summary { cursor:pointer; padding:12px 0; font-weight:500; }
.ugsci-capability-card-title button:focus-visible { outline:2px solid var(--app-accent); outline-offset:3px; border-radius:4px; }
.ugsci-skill-detail { max-width:1120px; }
.ugsci-skill-definition { margin-top:24px; border-top:1px solid var(--app-border-subtle,var(--app-border)); padding-top:20px; min-width:0; }
.ugsci-skill-definition h3 { font-size:16px; margin:0 0 12px; }
.ugsci-skill-markdown { line-height:1.8; overflow-wrap:anywhere; }
.ugsci-skill-markdown pre { overflow:auto; padding:16px; background:var(--app-fill-subtle); border-radius:8px; }
.ugsci-skill-markdown :is(img,table) { max-width:100%; }
.ugsci-skill-markdown table { display:block; overflow:auto; }
.ugsci-skill-source { white-space:pre-wrap; overflow-wrap:anywhere; font:13px/1.8 var(--app-font-mono,monospace); padding:16px; background:var(--app-fill-subtle); border-radius:8px; }
@media(max-width:680px) { .ugsci-capabilities { padding:16px; } .ugsci-capability-detail { padding:16px; } }
`;
function Qi({
  content: e,
  name: t,
  agentId: n,
  poolName: r
}) {
  const a = z().React, { Button: i, Spin: s, Alert: l, Tabs: o } = z().antd, [d, c] = a.useState(e || ""), [u, m] = a.useState(!1), [p, b] = a.useState(""), [g, f] = a.useState(0);
  return a.useEffect(() => {
    let h = !1;
    if (c(e || ""), b(""), m(!1), !(e || !r && (!t || !n)))
      return m(!0), he(
        r ? `/skills/pool/${encodeURIComponent(r)}/content` : `/skills/${encodeURIComponent(t)}`,
        {
          headers: n ? { "X-Agent-Id": n } : void 0,
          bypassCache: g > 0
        }
      ).then((y) => {
        h || c(y.content || "");
      }).catch((y) => {
        h || b(y.message || "加载技能定义失败");
      }).finally(() => {
        h || m(!1);
      }), () => {
        h = !0;
      };
  }, [e, t, n, r, g]), a.createElement(
    "section",
    { className: "ugsci-skill-definition", "aria-label": "技能全文定义" },
    a.createElement("h3", null, "技能定义"),
    u ? a.createElement(s, { tip: "加载技能定义" }) : p ? a.createElement(l, {
      type: "error",
      message: p,
      action: a.createElement(
        i,
        { onClick: () => f((h) => h + 1) },
        "重试"
      )
    }) : d ? a.createElement(o, {
      items: [
        {
          key: "preview",
          label: "阅读",
          children: a.createElement(
            "article",
            { className: "ugsci-skill-markdown" },
            St(
              d.replace(
                /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/,
                ""
              ),
              a
            )
          )
        },
        {
          key: "source",
          label: "SKILL.md 源文",
          children: a.createElement(
            "pre",
            { className: "ugsci-skill-source" },
            d
          )
        }
      ]
    }) : a.createElement("p", null, "暂无技能定义")
  );
}
function pn({
  open: e,
  title: t,
  children: n,
  onClose: r,
  onCancel: a,
  onOk: i,
  extra: s,
  footer: l,
  confirmLoading: o,
  okText: d = "保存",
  ...c
}) {
  const u = z().React, { Button: m } = z().antd, { ArrowLeftOutlined: p } = z().antdIcons || {}, b = u.useId(), g = u.useRef(null);
  if (u.useEffect(() => {
    var y;
    if (!e) return;
    const h = document.activeElement;
    return (y = g.current) == null || y.focus(), () => {
      h != null && h.isConnected && h.focus();
    };
  }, [e]), !e) return null;
  const f = r || a;
  return u.createElement(
    "section",
    {
      className: "ugsci-capability-focus " + (c.rootClassName || ""),
      "aria-labelledby": b,
      ref: g,
      tabIndex: -1,
      style: { outline: "none" }
    },
    u.createElement(
      m,
      {
        type: "text",
        onClick: f,
        icon: p ? u.createElement(p) : void 0
      },
      "返回列表"
    ),
    u.createElement(
      "div",
      { className: "ugsci-capability-detail" },
      u.createElement(
        "div",
        { className: "ugsci-capability-detail-heading" },
        u.createElement("h2", { id: b }, t),
        s
      ),
      n,
      l || i ? u.createElement(
        "div",
        { className: "ugsci-capability-detail-footer" },
        l || u.createElement(
          m,
          { type: "primary", loading: o, onClick: i },
          d
        )
      ) : null
    )
  );
}
function lc({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const a = z().React, { useState: i, useEffect: s, useCallback: l, useRef: o, useMemo: d } = a, {
    Input: c,
    Spin: u,
    Empty: m,
    Button: p,
    Row: b,
    Col: g,
    Card: f,
    Tag: h,
    Checkbox: y,
    Modal: E,
    Typography: v,
    Switch: S,
    Descriptions: B,
    message: N
  } = z().antd, {
    ReloadOutlined: w,
    ThunderboltOutlined: x,
    SettingOutlined: R,
    CheckSquareOutlined: H,
    EyeOutlined: _,
    EyeInvisibleOutlined: T,
    DeleteOutlined: $,
    CloseOutlined: F
  } = z().antdIcons || {}, { Text: C, Paragraph: I } = v, [L, M] = i([]), [P, W] = i(""), [G, U] = i(""), Q = d(() => {
    const ee = G.trim().toLowerCase();
    return ee ? L.filter(
      (be) => [
        be.name,
        Oe(be.name),
        be.description,
        ...be.tags || []
      ].some((ke) => ke == null ? void 0 : ke.toLowerCase().includes(ee))
    ) : L;
  }, [L, G]), [D, Y] = i(!0), [ne, re] = i(!1), [se, X] = i(null), [pe, ye] = i(!1), [q, j] = i(/* @__PURE__ */ new Set()), [ge, we] = i(!1), ve = o(0), ue = o(e);
  ue.current = e;
  const [Se, xe] = i(!1), Ie = l(async () => {
    if (!e || ue.current !== e) return;
    const ee = ++ve.current;
    Y(!0);
    try {
      const be = await Zn(e);
      ee === ve.current && ue.current === e && (M(be), W(e));
    } catch (be) {
      if (ee !== ve.current || ue.current !== e)
        return;
      N.error(be.message || "加载技能失败"), M([]), W(e);
    } finally {
      ee === ve.current && ue.current === e && Y(!1);
    }
  }, [e]);
  s(() => (re(!1), X(null), ye(!1), j(/* @__PURE__ */ new Set()), () => {
    ve.current++;
  }), [e]), s(() => {
    Ie();
  }, [Ie, n]);
  const _e = (ee) => {
    j((be) => {
      const ke = new Set(be);
      return ke.has(ee) ? ke.delete(ee) : ke.add(ee), ke;
    });
  }, oe = () => j(/* @__PURE__ */ new Set()), te = () => j(new Set(L.map((ee) => ee.name))), le = () => {
    pe ? (oe(), ye(!1)) : ye(!0);
  }, Z = async () => {
    const ee = Array.from(q);
    if (ee.length !== 0) {
      we(!0);
      try {
        const { results: be } = await Jo(e, ee), ke = Object.entries(be).filter(
          ([, qe]) => qe.success === !1
        ), Ae = ee.length - ke.length;
        ke.length > 0 ? N.warning(
          `批量启用完成：成功 ${Ae} 个，失败 ${ke.length} 个`
        ) : N.success(`成功启用 ${ee.length} 个技能`), oe(), await Ie();
      } catch (be) {
        N.error(be.message || "批量启用失败");
      } finally {
        we(!1);
      }
    }
  }, A = async () => {
    const ee = Array.from(q);
    if (ee.length !== 0) {
      we(!0);
      try {
        const { results: be } = await Qo(e, ee), ke = Object.entries(be).filter(
          ([, qe]) => qe.success === !1
        ), Ae = ee.length - ke.length;
        ke.length > 0 ? N.warning(
          `批量停用完成：成功 ${Ae} 个，失败 ${ke.length} 个`
        ) : N.success(`成功停用 ${ee.length} 个技能`), oe(), await Ie();
      } catch (be) {
        N.error(be.message || "批量停用失败");
      } finally {
        we(!1);
      }
    }
  }, O = () => {
    const ee = Array.from(q);
    ee.length !== 0 && E.confirm({
      title: `确认删除 ${ee.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        we(!0);
        try {
          const { results: be } = await Ko(e, ee), ke = Object.entries(be).filter(
            ([, qe]) => qe.success === !1
          ), Ae = ee.length - ke.length;
          ke.length > 0 ? N.warning(
            `批量删除完成：成功 ${Ae} 个，失败 ${ke.length} 个`
          ) : N.success(`成功删除 ${ee.length} 个技能`), oe(), await Ie();
        } catch (be) {
          N.error(be.message || "批量删除失败");
        } finally {
          we(!1);
        }
      }
    });
  }, K = async (ee) => {
    xe(!0);
    try {
      ee.enabled === !1 ? (await Pi(e, ee.name), N.success(`已启用技能「${Oe(ee.name)}」`)) : (await Ni(e, ee.name), N.success(`已禁用技能「${Oe(ee.name)}」`)), await Ie();
    } catch (be) {
      N.error(be.message || "操作失败");
    } finally {
      xe(!1);
    }
  }, V = (ee) => {
    E.confirm({
      title: `确认删除技能「${Oe(ee.name)}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        xe(!0);
        try {
          await Oi(e, ee.name), ue.current === e && re(!1), N.success(`已删除技能「${Oe(ee.name)}」`), await Ie();
        } catch (be) {
          N.error(be.message || "删除失败");
        } finally {
          xe(!1);
        }
      }
    });
  }, fe = ne && P === e;
  return a.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": fe },
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8
        }
      },
      a.createElement(c, {
        placeholder: "搜索当前专家的技能...",
        value: G,
        allowClear: !0,
        style: { maxWidth: 320 },
        onChange: (ee) => U(ee.target.value)
      }),
      a.createElement(
        C,
        { type: "secondary", style: { fontSize: 13 } },
        pe ? `已选择 ${q.size} / ${L.length} 个技能` : `共 ${L.length} 个技能`
      ),
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap"
          }
        },
        pe ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            p,
            { size: "small", onClick: te },
            "全选"
          ),
          a.createElement(
            p,
            {
              size: "small",
              icon: F ? a.createElement(F) : void 0,
              onClick: oe
            },
            "取消选择"
          ),
          a.createElement(
            p,
            {
              size: "small",
              type: "default",
              icon: _ ? a.createElement(_) : void 0,
              disabled: q.size === 0 || ge,
              loading: ge,
              onClick: Z
            },
            "批量启用"
          ),
          a.createElement(
            p,
            {
              size: "small",
              danger: !0,
              icon: T ? a.createElement(T) : void 0,
              disabled: q.size === 0 || ge,
              loading: ge,
              onClick: A
            },
            "批量停用"
          ),
          a.createElement(
            p,
            {
              size: "small",
              danger: !0,
              icon: $ ? a.createElement($) : void 0,
              disabled: q.size === 0 || ge,
              loading: ge,
              onClick: O
            },
            `删除 (${q.size})`
          ),
          a.createElement(
            p,
            {
              size: "small",
              type: "primary",
              onClick: le
            },
            "退出批量"
          )
        ) : a.createElement(
          a.Fragment,
          null,
          a.createElement(
            p,
            {
              size: "small",
              icon: H ? a.createElement(H) : void 0,
              onClick: le,
              disabled: Q.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            p,
            {
              icon: w ? a.createElement(w) : void 0,
              onClick: () => {
                Ct(), Ie();
              }
            },
            "刷新"
          )
        )
      )
    ),
    D || P !== e ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(u, { size: "large" })
    ) : L.length === 0 ? a.createElement(m, {
      description: G ? "未找到匹配的技能" : "当前智能体未加载任何技能"
    }) : a.createElement(
      b,
      { gutter: [12, 12] },
      ...Q.map(
        (ee) => a.createElement(
          g,
          { key: ee.name, xs: 24, sm: 12, md: 12, lg: 8, xxl: 6 },
          a.createElement(
            f,
            { size: "small", className: "ugsci-capability-card" },
            a.createElement(
              "div",
              { className: "ugsci-capability-card-title" },
              a.createElement(
                "span",
                {
                  className: "ugsci-capability-avatar",
                  "aria-hidden": !0
                },
                ee.emoji || "⚡"
              ),
              a.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    X(ee), re(!0);
                  }
                },
                Oe(ee.name)
              ),
              pe ? a.createElement(y, {
                "aria-label": `选择 ${Oe(ee.name)}`,
                checked: q.has(ee.name),
                onChange: () => _e(ee.name)
              }) : null
            ),
            a.createElement(
              I,
              {
                className: "ugsci-capability-card-copy",
                ellipsis: { rows: 2 },
                style: { margin: 0 }
              },
              ee.description || "暂无描述"
            ),
            a.createElement(
              "div",
              { className: "ugsci-capability-card-meta" },
              ee.version_text ? a.createElement(h, null, `v${ee.version_text}`) : null,
              ...(ee.tags || []).slice(0, 3).map((be) => a.createElement(h, { key: be }, be))
            ),
            pe ? null : a.createElement(
              "div",
              { className: "ugsci-capability-card-footer" },
              a.createElement(
                p,
                {
                  size: "small",
                  onClick: () => {
                    X(ee), re(!0);
                  },
                  "aria-label": `配置 ${Oe(ee.name)}`
                },
                "配置"
              ),
              a.createElement(
                "span",
                {
                  style: {
                    display: "flex",
                    gap: 8,
                    alignItems: "center"
                  }
                },
                a.createElement(
                  C,
                  { type: "secondary", style: { fontSize: 12 } },
                  ee.enabled === !1 ? "已禁用" : "已启用"
                ),
                a.createElement(S, {
                  size: "small",
                  checked: ee.enabled !== !1,
                  loading: Se,
                  "aria-label": `${ee.enabled === !1 ? "启用" : "禁用"} ${Oe(ee.name)}`,
                  onChange: () => K(ee)
                })
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    se ? a.createElement(
      pn,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            se.emoji || "⚡"
          ),
          a.createElement(
            "span",
            null,
            Oe(se.name)
          )
        ),
        open: fe,
        onClose: () => re(!1),
        width: 520,
        rootClassName: "ugsci-skill-detail",
        footer: a.createElement(
          p,
          {
            danger: !0,
            disabled: Se,
            onClick: () => V(se)
          },
          "删除技能"
        ),
        extra: a.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: R ? a.createElement(R) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        B,
        {
          column: 1,
          bordered: !0,
          size: "small",
          labelStyle: { width: 96, whiteSpace: "nowrap" }
        },
        a.createElement(
          B.Item,
          { label: "技能名称" },
          Oe(se.name)
        ),
        a.createElement(
          B.Item,
          { label: "描述" },
          se.description || "-"
        ),
        se.version_text ? a.createElement(
          B.Item,
          { label: "版本" },
          se.version_text
        ) : null,
        a.createElement(
          B.Item,
          { label: "来源" },
          se.source || "-"
        ),
        a.createElement(
          B.Item,
          { label: "状态" },
          se.enabled === !1 ? "已禁用" : "已启用"
        ),
        se.installed_from ? a.createElement(
          B.Item,
          { label: "安装来源" },
          se.installed_from
        ) : null
      ),
      // Tags
      se.tags && se.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          C,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...se.tags.map(
            (ee, be) => a.createElement(h, { key: be, color: "blue" }, ee)
          )
        )
      ) : null,
      a.createElement(Qi, {
        key: `${e}:${se.name}`,
        agentId: e,
        name: se.name,
        content: se.content
      })
    ) : null
  );
}
function cc({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: a,
  onSkillInstalled: i,
  agentId: s,
  agentName: l
}) {
  var O, K;
  const o = z().React, { useState: d, useMemo: c, useCallback: u, useEffect: m, useRef: p } = o, {
    Spin: b,
    Empty: g,
    Input: f,
    Button: h,
    Row: y,
    Col: E,
    Card: v,
    Tag: S,
    Typography: B,
    Descriptions: N,
    List: w,
    Modal: x,
    message: R
  } = z().antd, {
    ReloadOutlined: H,
    SearchOutlined: _,
    DownloadOutlined: T,
    ThunderboltOutlined: $,
    DeleteOutlined: F,
    PlusOutlined: C
  } = z().antdIcons || {}, { Text: I, Paragraph: L } = B, [M, P] = d(""), [W, G] = d(!1), [U, Q] = d(null), [D, Y] = d([]), [ne, re] = d(!1), [se, X] = d(24), pe = p(0), [ye, q] = d(!1), j = p(0), ge = p(null), we = c(
    () => {
      var V;
      return new Set(
        ((V = t.find((fe) => fe.agent_id === s)) == null ? void 0 : V.skill_names) || []
      );
    },
    [t, s]
  ), ve = c(() => {
    if (!M.trim()) return e;
    const V = M.toLowerCase();
    return e.filter(
      (fe) => {
        var ee, be;
        return fe.name.toLowerCase().includes(V) || Oe(fe.name).toLowerCase().includes(V) || ((ee = fe.description) == null ? void 0 : ee.toLowerCase().includes(V)) || ((be = fe.tags) == null ? void 0 : be.some((ke) => ke.toLowerCase().includes(V)));
      }
    );
  }, [e, M]), ue = c(
    () => ve.slice(0, se),
    [ve, se]
  );
  m(() => {
    if (ue.length >= ve.length) return;
    const V = ge.current;
    if (!V) return;
    const fe = () => {
      X(
        (be) => Math.min(be + 24, ve.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const be = new IntersectionObserver(
        (ke) => {
          ke.some((Ae) => Ae.isIntersecting) && fe();
        },
        { rootMargin: "240px 0px" }
      );
      return be.observe(V), () => be.disconnect();
    }
    const ee = () => {
      V.getBoundingClientRect().top <= window.innerHeight + 240 && fe();
    };
    return window.addEventListener("scroll", ee, { passive: !0 }), ee(), () => window.removeEventListener("scroll", ee);
  }, [ve.length, ue.length]);
  const Se = u((V) => {
    P(V), X(24);
  }, []), xe = u(() => {
    const V = j.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: V, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = V);
    });
  }, []), Ie = u(async () => {
    var V;
    j.current = ((V = document.scrollingElement) == null ? void 0 : V.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      xe();
    }
  }, [a, xe]), _e = u(
    (V) => {
      const fe = [];
      for (const ee of t)
        if (ee.skill_names.includes(V)) {
          const be = n.find((ke) => ke.id === ee.agent_id);
          fe.push((be == null ? void 0 : be.name) || ee.agent_name || ee.agent_id);
        }
      return fe;
    },
    [t, n]
  ), oe = u(
    async (V) => {
      const fe = ++pe.current;
      if (Q(V), re(!1), Y(_e(V.name)), G(!0), !V.content) {
        re(!0);
        try {
          const ee = await jo(V.name);
          fe === pe.current && Q({ ...V, content: ee });
        } catch {
        } finally {
          fe === pe.current && re(!1);
        }
      }
    },
    [_e]
  );
  m(() => {
    U && Y(_e(U.name));
  }, [U, _e, t]);
  const te = async (V) => {
    q(!0);
    try {
      await Li(s, V.name), R.success(
        `已将技能「${Oe(
          V.name
        )}」加载到当前专家「${l}」`
      ), i(V);
    } catch (fe) {
      R.error(fe.message || "加载技能失败");
    } finally {
      q(!1);
    }
  }, le = (V) => {
    if (V.protected) {
      R.warning("内置技能不可删除");
      return;
    }
    x.confirm({
      title: `确认从技能池删除「${Oe(V.name)}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        q(!0);
        try {
          await el(V.name), R.success(`已从技能池删除「${Oe(V.name)}」`), await Ie();
        } catch (fe) {
          R.error(fe.message || "删除失败");
        } finally {
          q(!1);
        }
      }
    });
  }, Z = (K = (O = z()).useNavigate) == null ? void 0 : K.call(O), A = (V) => {
    if (Z) return Z(V);
    window.history.pushState({}, "", V), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return o.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": W },
    o.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }
      },
      o.createElement(f, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: _ ? o.createElement(_) : void 0,
        value: M,
        onChange: (V) => Se(V.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          h,
          {
            icon: H ? o.createElement(H) : void 0,
            onClick: Ie,
            loading: r,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          h,
          {
            type: "primary",
            icon: T ? o.createElement(T) : void 0,
            onClick: () => A("/skill-pool"),
            size: "small",
            style: Xe
          },
          "管理技能池"
        )
      )
    ),
    r ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(b, { size: "large" })
    ) : ve.length === 0 ? o.createElement(g, {
      description: M ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        y,
        { gutter: [12, 12] },
        ...ue.map(
          (V) => o.createElement(
            E,
            { key: V.name, xs: 24, sm: 12, md: 12, lg: 8, xxl: 6 },
            o.createElement(
              v,
              {
                hoverable: !0,
                size: "small",
                className: "ugsci-capability-card",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => oe(V)
              },
              o.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 0
                  }
                },
                V.emoji ? o.createElement(
                  "span",
                  { className: "ugsci-capability-avatar" },
                  V.emoji
                ) : o.createElement(
                  "span",
                  { className: "ugsci-capability-avatar" },
                  "⚡"
                ),
                o.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: (fe) => {
                      fe.stopPropagation(), oe(V);
                    },
                    style: {
                      fontSize: 15,
                      border: 0,
                      padding: 0,
                      background: "transparent",
                      color: "inherit",
                      textAlign: "left",
                      fontWeight: 600,
                      cursor: "pointer",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }
                  },
                  Oe(V.name)
                ),
                V.protected ? o.createElement(
                  S,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              V.description ? o.createElement(
                L,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 2 }
                },
                V.description
              ) : null,
              o.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap"
                  }
                },
                V.version_text ? o.createElement(
                  S,
                  { style: { fontSize: 10 } },
                  `v${V.version_text}`
                ) : null,
                ...(V.tags || []).slice(0, 3).map(
                  (fe, ee) => o.createElement(
                    S,
                    { key: ee, color: "cyan", style: { fontSize: 10 } },
                    fe
                  )
                )
              ),
              // Actions stay available for keyboard and touch use.
              o.createElement(
                "div",
                {
                  style: {
                    marginTop: "auto",
                    paddingTop: 4,
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end"
                  }
                },
                o.createElement(
                  h,
                  {
                    size: "small",
                    type: "primary",
                    icon: C ? o.createElement(C) : void 0,
                    disabled: ye || we.has(V.name),
                    onClick: (fe) => {
                      fe.stopPropagation(), te(V);
                    }
                  },
                  we.has(V.name) ? "已加载" : "添加到当前专家"
                ),
                o.createElement(
                  h,
                  {
                    size: "small",
                    danger: !0,
                    icon: F ? o.createElement(F) : void 0,
                    disabled: ye || V.protected,
                    onClick: (fe) => {
                      fe.stopPropagation(), le(V);
                    }
                  },
                  "删除"
                )
              )
            )
          )
        ),
        // Infinite-scroll sentinel
        ue.length < ve.length ? o.createElement(
          "div",
          {
            ref: ge,
            style: {
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16
            }
          },
          o.createElement(
            I,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${ve.length - ue.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    U ? o.createElement(
      pn,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            U.emoji || "⚡"
          ),
          o.createElement(
            "span",
            null,
            Oe(U.name)
          )
        ),
        open: W,
        onClose: () => {
          pe.current++, G(!1);
        },
        width: 520,
        rootClassName: "ugsci-skill-detail",
        extra: o.createElement(
          h,
          {
            type: "primary",
            size: "small",
            icon: $ ? o.createElement($) : void 0,
            onClick: () => A("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        N,
        {
          column: 1,
          bordered: !0,
          size: "small",
          labelStyle: { width: 96, whiteSpace: "nowrap" }
        },
        o.createElement(
          N.Item,
          { label: "技能名称" },
          Oe(U.name)
        ),
        o.createElement(
          N.Item,
          { label: "描述" },
          U.description || "-"
        ),
        U.version_text ? o.createElement(
          N.Item,
          { label: "版本" },
          U.version_text
        ) : null,
        o.createElement(
          N.Item,
          { label: "来源" },
          U.source || "-"
        ),
        o.createElement(
          N.Item,
          { label: "受保护" },
          U.protected ? "是（内置）" : "否"
        ),
        U.sync_status ? o.createElement(
          N.Item,
          { label: "同步状态" },
          U.sync_status
        ) : null,
        U.installed_from ? o.createElement(
          N.Item,
          { label: "安装来源" },
          U.installed_from
        ) : null
      ),
      // Tags
      U.tags && U.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          I,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...U.tags.map(
            (V, fe) => o.createElement(S, { key: fe, color: "cyan" }, V)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          I,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${D.length})`
        ),
        D.length > 0 ? o.createElement(w, {
          size: "small",
          dataSource: D,
          renderItem: (V) => o.createElement(
            w.Item,
            null,
            o.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              o.createElement(rt, {
                name: V,
                size: 20
              }),
              o.createElement(
                I,
                { style: { fontSize: 13 } },
                V
              )
            )
          )
        }) : o.createElement(
          I,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      ne ? o.createElement(b, { tip: "加载技能定义" }) : o.createElement(Qi, {
        content: U.content,
        poolName: U.name
      })
    ) : null
  );
}
function dc({
  embedded: e = !1
} = {}) {
  var I;
  const t = z().React, { useState: n, useEffect: r, useCallback: a, useMemo: i } = t, { Tabs: s, message: l } = z().antd, { ThunderboltOutlined: o, AppstoreOutlined: d } = z().antdIcons || {}, c = z(), u = c.useSelectedAgent, m = u ? u() : null, p = (m == null ? void 0 : m.id) || "default";
  r(() => {
    Vn();
  }, [p]);
  const [b, g] = n([]), [f, h] = n([]), [y, E] = n([]), [v, S] = n(!0), [B, N] = n("agent-skills"), [w, x] = n(0), R = a(async () => {
    S(!0);
    try {
      const [L, M, P] = await Promise.all([
        Hr(!0),
        En(),
        Do()
      ]);
      h(L), g(M), E(P);
    } catch (L) {
      l.error(L.message || "加载技能列表失败"), h([]);
    } finally {
      S(!1);
    }
  }, []);
  r(() => {
    R();
  }, [R]);
  const H = i(() => {
    const L = b.find((M) => M.id === p);
    return Lr((L == null ? void 0 : L.name) || p);
  }, [b, p]), _ = a(
    (L) => {
      E(
        (M) => M.some((P) => P.agent_id === p) ? M.map((P) => P.agent_id !== p || P.skill_names.includes(L.name) ? P : {
          ...P,
          skill_names: [...P.skill_names, L.name]
        }) : [
          ...M,
          {
            agent_id: p,
            agent_name: H,
            skill_names: [L.name]
          }
        ]
      ), x((M) => M + 1);
    },
    [p, H]
  ), T = (I = c.useNavigate) == null ? void 0 : I.call(c), $ = (L) => {
    if (T) return T(L);
    window.history.pushState({}, "", L), window.dispatchEvent(new PopStateEvent("popstate"));
  }, F = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? t.createElement(o, {
          style: { fontSize: 14 }
        }) : null,
        "当前专家"
      ),
      children: t.createElement(lc, {
        agentId: p,
        agentName: H,
        refreshKey: w,
        onNavigate: $
      })
    },
    {
      key: "skill-pool",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        d ? t.createElement(d, { style: { fontSize: 14 } }) : null,
        "技能库"
      ),
      children: t.createElement(cc, {
        poolSkills: f,
        workspaceSkills: y,
        agents: b,
        loading: v,
        onReload: R,
        onSkillInstalled: _,
        agentId: p,
        agentName: H
      })
    }
  ], C = t.createElement(s, {
    items: F,
    activeKey: B,
    onChange: (L) => N(L)
  });
  return e ? C : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Wn, {
      title: "技能",
      subtitle: `技能池共 ${f.length} 个技能 · 当前智能体：${H}`
    }),
    C
  );
}
const vr = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Ki = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Xi = /* @__PURE__ */ new Set([
  "cmg",
  "comsol",
  "tnavigator",
  "eclipse",
  "intersect",
  "visage"
]);
function Yi(e) {
  return Ai(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function uc() {
  return he("/ugsci/engines/list");
}
async function mc(e) {
  return he("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function pc(e, t) {
  return he(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    {
      method: "PUT",
      body: JSON.stringify(t)
    }
  );
}
async function gc(e) {
  return he(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function fc() {
  return he("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function yc({
  engine: e,
  onClick: t,
  onConfigure: n
}) {
  const r = z().React, { Card: a, Tag: i, Typography: s, Button: l } = z().antd, o = e.status === "detected" ? ["success", "已检测"] : e.status === "configured" ? ["processing", "已配置"] : e.status === "error" ? ["error", "检测异常"] : e.executable_path ? ["warning", "路径无效"] : ["default", "待配置"];
  return r.createElement(
    a,
    {
      size: "small",
      className: "ugsci-capability-card",
      style: { width: "100%", height: "100%" }
    },
    r.createElement(
      "div",
      { className: "ugsci-capability-card-title" },
      r.createElement(
        "span",
        { className: "ugsci-capability-avatar" },
        Xi.has(e.id) ? r.createElement("img", {
          src: Yi(e.id),
          alt: e.name
        }) : Ki[e.category] || "📦"
      ),
      r.createElement("button", { type: "button", onClick: t }, e.name)
    ),
    r.createElement(
      "div",
      { className: "ugsci-capability-card-meta" },
      [e.vendor, e.version ? `v${e.version}` : ""].filter(Boolean).join(" · ")
    ),
    r.createElement(
      s.Paragraph,
      {
        className: "ugsci-capability-card-copy",
        ellipsis: { rows: 2 },
        style: { margin: 0 }
      },
      e.description || "暂无描述"
    ),
    r.createElement(
      "div",
      null,
      e.category ? r.createElement(
        i,
        null,
        vr[e.category] || e.category
      ) : null,
      ...(e.modules || []).map(
        (d) => r.createElement(i, { key: d }, d)
      )
    ),
    r.createElement(
      "div",
      { className: "ugsci-capability-card-footer" },
      r.createElement(
        l,
        {
          size: "small",
          onClick: n,
          "aria-label": `配置 ${e.name}`
        },
        "配置"
      ),
      r.createElement(
        i,
        { color: o[0], style: { margin: 0 } },
        o[1]
      )
    )
  );
}
function hc() {
  const e = z().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: i,
    Empty: s,
    Button: l,
    message: o,
    Row: d,
    Col: c,
    Descriptions: u,
    Tag: m,
    Typography: p,
    Input: b,
    Select: g,
    Popconfirm: f,
    Space: h
  } = z().antd, {
    ReloadOutlined: y,
    SearchOutlined: E,
    PlusOutlined: v,
    EditOutlined: S,
    DeleteOutlined: B,
    CopyOutlined: N,
    ExperimentOutlined: w
  } = z().antdIcons || {}, { Text: x, Paragraph: R } = p, [H, _] = t([]), [T, $] = t(!0), [F, C] = t(""), [I, L] = t(!1), [M, P] = t(null), [W, G] = t(!1), [U, Q] = t(null), [D, Y] = t({}), [ne, re] = t(!1), se = r(async () => {
    $(!0);
    try {
      const ue = await uc();
      _(ue.engines || []);
    } catch (ue) {
      o.error(ue.message || "加载引擎列表失败"), _([]);
    } finally {
      $(!1);
    }
  }, []);
  n(() => {
    se();
  }, [se]);
  const X = a(() => {
    if (!F.trim()) return H;
    const ue = F.toLowerCase();
    return H.filter(
      (Se) => {
        var xe;
        return Se.name.toLowerCase().includes(ue) || Se.vendor.toLowerCase().includes(ue) || Se.category.toLowerCase().includes(ue) || ((xe = Se.description) == null ? void 0 : xe.toLowerCase().includes(ue));
      }
    );
  }, [H, F]), pe = r((ue) => {
    navigator.clipboard.writeText(ue).then(() => o.success("路径已复制")).catch(() => o.error("复制失败"));
  }, []), ye = r(() => {
    Q(null), Y({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), G(!0);
  }, []), q = r((ue) => {
    Q(ue), Y({ ...ue }), G(!0), L(!1);
  }, []), j = r(async () => {
    var ue;
    if (!((ue = D.name) != null && ue.trim())) {
      o.warning("请输入引擎名称");
      return;
    }
    re(!0);
    try {
      U ? (await pc(U.id, D), o.success("引擎已更新")) : (await mc(D), o.success("引擎已添加")), G(!1), se();
    } catch (Se) {
      o.error(Se.message || "保存失败");
    } finally {
      re(!1);
    }
  }, [D, U, se]), ge = r(
    async (ue) => {
      try {
        await gc(ue), o.success("引擎已删除"), L(!1), se();
      } catch (Se) {
        o.error(Se.message || "删除失败");
      }
    },
    [se]
  ), we = r(async () => {
    $(!0);
    try {
      const ue = await fc();
      _(ue.engines || []), o.success("自动检测完成");
    } catch (ue) {
      o.error(ue.message || "检测失败");
    } finally {
      $(!1);
    }
  }, []), ve = r(
    (ue, Se, xe) => {
      const Ie = D[Se] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          "label",
          {
            htmlFor: `engine-${Se}`,
            style: { fontSize: 13, display: "block", marginBottom: 4 }
          },
          ue
        ),
        xe != null && xe.select ? e.createElement(g, {
          id: `engine-${Se}`,
          value: Ie || void 0,
          onChange: (_e) => Y((oe) => ({ ...oe, [Se]: _e })),
          style: { width: "100%" },
          options: xe.select.options,
          allowClear: !0,
          placeholder: `选择${ue}`
        }) : xe != null && xe.textarea ? e.createElement(b.TextArea, {
          id: `engine-${Se}`,
          value: Ie,
          onChange: (_e) => Y((oe) => ({
            ...oe,
            [Se]: _e.target.value
          })),
          rows: 3,
          placeholder: `输入${ue}`
        }) : e.createElement(b, {
          id: `engine-${Se}`,
          value: Ie,
          onChange: (_e) => Y((oe) => ({
            ...oe,
            [Se]: _e.target.value
          })),
          placeholder: `输入${ue}`
        })
      );
    },
    [D]
  );
  return e.createElement(
    "div",
    {
      className: "ugsci-capability-section",
      "data-focused": I || W
    },
    // Action bar
    e.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap"
        }
      },
      e.createElement(b, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: E ? e.createElement(E) : void 0,
        value: F,
        onChange: (ue) => C(ue.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        l,
        {
          icon: y ? e.createElement(y) : void 0,
          onClick: we,
          loading: T
        },
        "自动检测"
      ),
      e.createElement(
        l,
        {
          type: "primary",
          icon: v ? e.createElement(v) : void 0,
          onClick: ye,
          style: Xe
        },
        "添加引擎"
      )
    ),
    // Content
    T ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(i, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : X.length === 0 ? e.createElement(s, {
      description: F ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...X.map(
        (ue) => e.createElement(
          c,
          {
            key: ue.id,
            xs: 24,
            sm: 12,
            md: 12,
            lg: 8,
            xxl: 6,
            style: { display: "flex" }
          },
          e.createElement(yc, {
            engine: ue,
            onConfigure: () => q(ue),
            onClick: () => {
              P(ue), L(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    M ? e.createElement(
      pn,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Xi.has(M.id) ? e.createElement("img", {
              src: Yi(M.id),
              alt: M.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Ki[M.category] || "📦"
            )
          ),
          e.createElement("span", null, M.name)
        ),
        open: I,
        onClose: () => L(!1),
        width: 520,
        extra: e.createElement(
          h,
          null,
          e.createElement(
            l,
            {
              size: "small",
              icon: S ? e.createElement(S) : void 0,
              onClick: () => q(M)
            },
            "编辑"
          ),
          M.is_default ? null : e.createElement(
            f,
            {
              title: "确认删除此引擎？",
              description: M.name,
              onConfirm: () => ge(M.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              l,
              {
                size: "small",
                danger: !0,
                icon: B ? e.createElement(B) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        u,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          u.Item,
          { label: "引擎名称" },
          M.name
        ),
        e.createElement(
          u.Item,
          { label: "厂商" },
          M.vendor || "—"
        ),
        e.createElement(
          u.Item,
          { label: "分类" },
          M.category ? vr[M.category] || M.category : "—"
        ),
        e.createElement(
          u.Item,
          { label: "状态" },
          e.createElement(
            m,
            {
              color: M.status === "detected" ? "success" : M.status === "not_found" ? "error" : "default"
            },
            M.status === "detected" ? "✅ 已检测" : M.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          u.Item,
          { label: "版本" },
          M.version || "—"
        ),
        M.executable_path ? e.createElement(
          u.Item,
          { label: "可执行文件" },
          e.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8
              }
            },
            e.createElement(
              "code",
              {
                style: {
                  fontSize: 12,
                  wordBreak: "break-all"
                }
              },
              M.executable_path
            ),
            e.createElement(l, {
              size: "small",
              type: "text",
              icon: N ? e.createElement(N) : void 0,
              onClick: () => pe(M.executable_path)
            })
          )
        ) : null,
        M.install_dir ? e.createElement(
          u.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            M.install_dir
          )
        ) : null,
        // Display detected modules with paths
        M.modules && M.modules.length > 0 ? e.createElement(
          u.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: 4
              }
            },
            ...M.modules.map(
              (ue) => e.createElement(
                "div",
                {
                  key: ue,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }
                },
                e.createElement(
                  m,
                  { color: "cyan", style: { fontSize: 11 } },
                  ue
                ),
                M.module_paths && M.module_paths[ue] ? e.createElement(
                  "code",
                  {
                    style: { fontSize: 11, wordBreak: "break-all" }
                  },
                  M.module_paths[ue]
                ) : null
              )
            )
          )
        ) : null,
        M.license_server ? e.createElement(
          u.Item,
          { label: "许可证服务器" },
          M.license_server
        ) : null,
        e.createElement(
          u.Item,
          { label: "描述" },
          M.description || "—"
        )
      ),
      // Invocation hint
      M.invocation_hint ? e.createElement(
        "div",
        {
          style: {
            marginTop: 16,
            padding: 12,
            background: "var(--app-fill, #f5f5f5)",
            borderRadius: 8
          }
        },
        e.createElement(
          x,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          M.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        M.is_default ? e.createElement(m, { color: "blue" }, "默认引擎") : M.is_custom ? e.createElement(m, { color: "purple" }, "自定义引擎") : null
      )
    ) : null,
    // Add/Edit configuration
    e.createElement(
      pn,
      {
        title: U ? `配置 ${U.name}` : "添加引擎",
        open: W,
        onOk: j,
        onCancel: () => G(!1),
        okText: U ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: ne,
        width: 560
      },
      e.createElement(
        "div",
        null,
        ve("引擎名称 *", "name"),
        ve("可执行文件路径", "executable_path"),
        ve("安装目录", "install_dir"),
        ve("许可证服务器", "license_server"),
        e.createElement(
          "details",
          { className: "ugsci-capability-advanced" },
          e.createElement("summary", null, "更多设置"),
          ve("厂商", "vendor"),
          ve("版本", "version"),
          ve("分类", "category", {
            select: {
              options: Object.entries(vr).map(
                ([ue, Se]) => ({
                  label: Se,
                  value: ue
                })
              )
            }
          }),
          ve("描述", "description", { textarea: !0 }),
          ve("调用方式提示", "invocation_hint", { textarea: !0 })
        )
      )
    )
  );
}
async function bc(e = !1) {
  const t = await he(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function vc(e = !1) {
  return he(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
async function Er(e) {
  if (e === "neqsim") {
    const t = await vc(!0);
    return {
      engine_id: e,
      installable: t.installable && !t.ready,
      packages: [
        `Java ${t.java_version}`,
        `NeqSim ${t.neqsim_version}`
      ],
      state: t.ready ? "ready" : t.installable ? "missing" : "blocked",
      message: "下载后自动验证并加载计算工具，无需手动配置 Java。",
      active_task: t.active_task || null
    };
  }
  return he(
    `/ugsci/domain-engines/${encodeURIComponent(e)}/runtime`,
    { bypassCache: !0 }
  );
}
async function Ec(e) {
  return { ...await he(
    `/ugsci/domain-engines/${encodeURIComponent(e)}/install`,
    { method: "POST" }
  ), engine_id: e };
}
async function wc(e, t) {
  const n = await he(
    t === "neqsim" ? `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}` : `/ugsci/domain-engines/install-tasks/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
  return { ...n, engine_id: t || n.engine_id };
}
async function xc(e, t = !1) {
  const n = await he("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function Sc(e, t = !1) {
  const n = /* @__PURE__ */ new Map(), r = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let a;
  try {
    a = await he("/mcp", r) || [];
  } catch {
    return n;
  }
  for (const i of a) {
    const s = i.key;
    if (!i.enabled) {
      n.set(s, { key: s, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const l = await he(
        `/mcp/tools/${encodeURIComponent(s)}`,
        r
      ) || [];
      n.set(s, {
        key: s,
        enabled: !0,
        toolCount: l.filter((o) => o.enabled).length,
        error: null
      });
    } catch (l) {
      n.set(s, {
        key: s,
        enabled: !0,
        toolCount: 0,
        error: l instanceof Error ? l.message : "Tool query failed"
      });
    }
  }
  return n;
}
function Da(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function qa(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function kc(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, a = e.dependency_status;
  let i, s = "", l, o;
  if (r.provider.kind === "driver")
    a.overall === "unavailable" ? i = "needs_install" : a.overall !== "available" ? i = "unknown" : i = qa(t), l = (t == null ? void 0 : t.toolCount) ?? 0, o = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const d = Da(a), c = [
      ...new Set(r.operations.flatMap((g) => g.tool_names))
    ], u = c.filter(
      (g) => n.has(g)
    ), m = u.filter(
      (g) => {
        var f;
        return (f = n.get(g)) == null ? void 0 : f.enabled;
      }
    );
    d !== "available" ? i = d : u.length !== c.length ? i = "error" : m.length === 0 ? i = "unconfigured" : m.length < c.length ? i = "partial" : i = "available", l = m.length, o = null;
    const p = c.filter((g) => !n.has(g)), b = u.filter(
      (g) => {
        var f;
        return !((f = n.get(g)) != null && f.enabled);
      }
    );
    d === "available" && (s = p.length ? `工具未完整注册：${p.join("、")}` : b.length ? `当前专家已启用 ${m.length}/${c.length} 个工具；未启用：${b.join("、")}` : c.length ? `依赖检测通过，当前专家已启用全部 ${c.length} 个工具。` : "该能力未声明可调用工具。");
  } else r.source === "mcp" ? (i = qa(t), l = (t == null ? void 0 : t.toolCount) ?? 0, o = (t == null ? void 0 : t.key) ?? r.provider.id) : (i = Da(a), l = 0, o = null, s = "依据运行依赖检测结果判断，尚未校验当前专家的调用工具。");
  if (a.overall !== "available") {
    const d = a.dependencies.filter(
      (c) => c.status !== "available"
    );
    s = d.length ? d.map(
      (c) => `${c.name}：${c.status === "unavailable" ? "未检测到可用依赖" : "尚未确认"}${c.reason ? `（${c.reason}）` : ""}`
    ).join("；") : "尚未确认运行依赖状态，请刷新检测。";
  } else s || (s = t ? t.enabled ? t.error ? `MCP 工具查询失败：${t.error}` : t.toolCount > 0 ? `依赖检测通过，MCP 服务已启用并发现 ${t.toolCount} 个已启用工具；具体函数以服务实际提供为准。` : "MCP 服务已启用，但未发现已启用的工具。" : "当前专家尚未启用该 MCP 服务。" : "未发现当前专家的 MCP 服务配置，或服务状态查询未成功。");
  return {
    definition: r,
    dependencyStatus: a,
    checkedAt: e.checked_at,
    effectiveStatus: i,
    statusDescription: s,
    discoveredToolCount: l,
    mcpProviderKey: o
  };
}
const wr = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  partial: "部分可用",
  error: "错误"
}, xr = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  partial: "warning",
  error: "error"
}, Me = (e, t, n, r) => ({ inputs: e, outputs: t, description: n, limitations: r }), es = {
  "welllog.las.read": Me(
    "path：LAS 文件路径；encoding：文件编码（默认自动）；sample_rows：首尾采样行数（默认 20，最大 200）。",
    "包含井/曲线元数据、曲线摘要、采样数据和 QC 警告的 JSON。",
    "读取 LAS 文件并返回元数据和采样行。"
  ),
  "welllog.quality.validate": Me(
    "path：LAS 文件路径；encoding：文件编码（默认自动）。",
    "包含通过/失败状态、错误、警告和逐项检查结果的 QC 报告 JSON。",
    "校验 LAS 文件质量。"
  ),
  "welllog.las.export": Me(
    "input_path：源 LAS 路径；output_path：目标 LAS 路径（须与源路径不同）；encoding：读写编码（默认 utf-8）。",
    "包含输出路径和工件引用的 JSON。",
    "规范化导出 .las 文件。",
    "仅支持 .las，输入和输出路径必须不同。"
  ),
  "production.decline.fit": Me(
    "time：相对时间数值数组；rate：对应产量数组；time_unit：时间单位（如 month/day/year）；rate_unit：产量单位（如 bbl/d、m3/d）；model：auto/exponential/harmonic/hyperbolic（默认 auto）。",
    "fits（各模型的 model/qi/di/b、RMSE、MAE、R²、AIC、fit_start、fit_end）、recommended、is_auto、warnings。",
    "对给定时间和产量数组拟合 Arps 递减曲线。",
    "time 与 rate 数组须一一对应。"
  ),
  "production.decline.forecast": Me(
    "model：exponential/harmonic/hyperbolic；qi：初始产量；di：初始递减率；b：双曲指数（双曲模型必需，其余忽略）；forecast_time：预测时间数组；time_unit、rate_unit：单位。",
    "result：model、qi、di、b、forecast（每项含 time、rate）；领域结果外层还含 units、metrics、assumptions、warnings、tolerances、applicability、provenance、artifacts。",
    "按递减模型参数预测指定时点产量。"
  ),
  "production.decline.eur": Me(
    "model、qi、di、b、time_unit、rate_unit；forecast_end：预测截止时间（可选）；economic_limit：经济极限产量（可选，二者按工具约束使用）。",
    "result：model、qi、di、b、effective_end、final_rate、cumulative_production、economic_limit_used、forecast_end_used；外层含 units、metrics、assumptions、warnings 等领域结果字段。",
    "按时间边界或经济极限估算最终采收量。"
  ),
  "fluid.flash": Me(
    "components：组分名到摩尔分数的映射；temperature：温度（默认单位 C）；pressure：压力（默认 bara）；temperature_unit（默认 C）、pressure_unit（默认 bara）、eos（默认 SRK）、flash_type（默认 TP）。",
    "NeqSim runFlash 返回值；集成不可用时返回 ok=false、error_type、message 等错误字段。",
    "调用已发现的 NeqSim runFlash 工具。",
    "需要工作区 NeqSim Driver 和服务端 runFlash 能力。"
  ),
  "fluid.pvt": Me(
    "specification：PVT 实验规格对象或 JSON 字符串，原样序列化为 pvtJson。",
    "NeqSim runPVT 返回值；失败时返回 ok=false、error_type、message 和可选 metadata。",
    "调用 NeqSim runPVT 实验。",
    "需工作区 NeqSim Driver 提供 runPVT。"
  ),
  "fluid.phase_envelope": Me(
    "components：组分名到摩尔分数的映射；eos：状态方程名称（默认 SRK）。",
    "NeqSim getPhaseEnvelope 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim getPhaseEnvelope。",
    "需工作区 NeqSim Driver 提供 getPhaseEnvelope。"
  ),
  "process.simulation": Me(
    "process：流程规格对象或 JSON 字符串，序列化后传给 processJson。",
    "NeqSim runProcess 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim runProcess 流程模拟。",
    "需工作区 NeqSim Driver 提供 runProcess。"
  ),
  "pipeline.flow": Me(
    "specification：管道规格对象或 JSON 字符串，序列化后传给 pipelineJson。",
    "NeqSim runPipeline 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim runPipeline 多相流计算。",
    "需工作区 NeqSim Driver 提供 runPipeline。"
  ),
  "math.symbolic": Me(
    "coefficients：按最高次项到常数项排列的系数数组；首项不得为 0，至少 2 项。",
    "所有实根和复根及计算状态/诊断。",
    "求解多项式的数值根。",
    "最高次数不超过 20。"
  ),
  "statistics.bayesian": Me(
    "observations：观测数值数组；prior_mean、prior_std：正态先验均值/标准差；observation_std：观测标准差；draws、tune：抽样数和调优步数；seed：随机种子。",
    "posterior_mean、posterior_std、credible_interval_95、sample_count。",
    "对正态均值模型执行贝叶斯估计。",
    "当前工具限定为正态均值估计模型。"
  ),
  "optimization.multi_objective": Me(
    "centers：二次目标中心点数组；bounds：各变量上下界；population_size、generations：种群规模和迭代代数；seed：随机种子。",
    "result：solutions（每项含 variables、objectives）及 solution_count。",
    "优化工具定义的多目标二次问题。",
    "目标函数形式固定为工具实现的二次模型。"
  ),
  "simulation.discrete_event": Me(
    "arrival_interval：到达间隔；service_time：服务时间；servers：服务台数量（默认 1，范围 1–100）；duration：仿真时长（默认 100，须为正；时间单位一致）。",
    "arrivals、completed、average_wait、maximum_wait、servers。",
    "模拟固定间隔到达、固定服务时长的 FIFO 队列。",
    "不计算利用率；到达间隔、服务时间和仿真时长须为正。"
  ),
  "graph.analysis": Me(
    "nodes：节点名称数组；edges：由起点、终点组成的边数组；directed：是否有向；source、target：路径查询端点（可为空）。",
    "节点/边统计、连通性及可用的路径分析结果。",
    "分析给定图结构。",
    "仅分析传入的图，不自动读取外部网络数据。"
  ),
  "geospatial.analysis": Me(
    "points：坐标数组，每项为 [x,y]；crs：输入坐标参考系（默认 EPSG:4326）。",
    "point_count、crs、bounds、centroid。",
    "对输入点集执行工具实现的空间分析。",
    "当前工具只接收点集，不能据此推断支持任意矢量处理。"
  ),
  "machine_learning.modeling": Me(
    "features：训练特征二维数组；targets：目标值数组；predict_features：待预测特征二维数组。",
    "coefficients、intercept、training_r_squared、training_rmse、predictions。",
    "执行工具实现的回归建模与预测。",
    "当前接口是回归任务，不代表 scikit-learn 的分类、聚类等全部能力。"
  ),
  "statistics.modeling": Me(
    "features：特征二维数组；targets：目标值数组；feature_names：特征名称数组。",
    "coefficients、standard_errors、p_values、r_squared、adjusted_r_squared、observation_count。",
    "执行工具实现的统计回归。",
    "当前接口限定于已实现的回归分析。"
  ),
  "units.convert": Me(
    "value：标量数值；from_unit、to_unit：源单位和目标单位字符串。",
    "标准领域计算结果，result 中包含 value、from_unit、to_unit；外层含 units 和 applicability。",
    "在 UGSci 显式单位表内换算标量。",
    "源单位和目标单位必须属于同一受支持物理量纲。"
  ),
  "reservoir.volumetrics.oil_in_place": Me(
    "area：面积；net_pay：净厚度；porosity、water_saturation：孔隙度/含水饱和度（比例）；oil_fvf：原油体积系数；area_unit（默认 acre）、length_unit（默认 ft）、output_unit（默认 stb）。",
    "OOIP 数值、输出单位及计算依据/输入摘要。",
    "容积法计算原始地质储量。"
  ),
  "reservoir.material_balance.oil": Me(
    "必填 produced_oil、initial_oil_fvf、current_oil_fvf、initial_pressure、current_pressure；可选 produced_gor、initial_solution_gor、current_solution_gor、gas_fvf、produced_water、water_fvf、water_influx、initial_water_saturation、water_compressibility、rock_compressibility；volume_unit（默认 stb）、pressure_unit（psi）、compressibility_unit（1/psi）。",
    "估算 OOIP、物质平衡各项及计算状态。",
    "按输入 PVT 和水侵/压缩项执行油藏物质平衡。",
    "未提供的可选项使用模型默认值；结果取决于输入 PVT 与单位的一致性。"
  ),
  "reservoir.material_balance.gas_pz": Me(
    "produced_gas、initial_pressure、initial_z_factor、current_pressure、current_z_factor；gas_volume_unit（默认 scf）、pressure_unit（默认 psi）。",
    "OGIP 估算及 p/z 计算量/状态。",
    "按 p/z 衰竭关系估算气藏原始地质储量。"
  ),
  "fluid.pvt.standing_black_oil": Me(
    "pressure、temperature、oil_api、gas_specific_gravity、solution_gor_at_bubble_point；pressure_unit（默认 psi）、temperature_unit（默认 F）、gor_unit（默认 scf/stb）。",
    "Standing 关联式计算的泡点压力、溶解气油比和油体积系数。",
    "计算本地黑油 PVT 近似性质。",
    "采用 Standing 关联式，不是通用状态方程或组分模拟。"
  ),
  "production.ipr.vogel": Me(
    "reservoir_pressure、test_flowing_pressure、test_rate；target_flowing_pressures：目标流压数组；pressure_unit（默认 psi）、rate_unit（默认 stb/d）。",
    "Vogel IPR 参数及各目标流压对应产能。",
    "基于测试点构建 Vogel 油井 IPR。"
  ),
  "production.nodal_analysis": Me(
    "reservoir_pressure、test_flowing_pressure、test_rate、wellhead_pressure、hydrostatic_pressure、friction_pressure_at_test_rate；pressure_unit（psi）、rate_unit（stb/d）；tolerance（默认 1e-6）、max_iterations（默认 100）。",
    "求得的工作点产量/压力、迭代状态及节点计算摘要。",
    "求解当前简化 IPR/VLP 交点。",
    "VLP 由提供的压力项和工具模型表示，不替代完整多相管流模拟。"
  ),
  "validation.conservation_check": Me(
    "initial_inventory、final_inventory：期初/期末库存；inflows、outflows：流入/流出数值数组；tolerance（默认 1e-6）；unit（默认 rb）。",
    "闭合误差、相对误差、是否在容差内及各项汇总。",
    "检查给定边界的质量/体积守恒。"
  ),
  "storage.inventory.accounting": Me(
    "initial_inventory、cumulative_injected、cumulative_produced：库存及累计注采量；gas_volume_unit（默认 1e8_sm3）。",
    "期末账面库存、注采平衡量及校核信息。",
    "按统一体积单位执行库存计量平衡。"
  ),
  "storage.inventory.effective_controlled": Me(
    "layers：分层数组，每层含 name、produced_gas、injection_end_pressure、injection_end_z、evaluation_pressure、evaluation_z；cycle_id、injection_end_state_id、evaluation_state_id；gas_volume_unit（1e8_sm3）、pressure_unit（MPa）、pressure_basis（absolute/apparent_formation/report_defined）；可选 denominator_relative_tolerance、maximum_inverse_withdrawal_fraction。",
    "result：effective_inventory、layers（逐层 name、produced_gas、injection_end_p_over_z、evaluation_p_over_z、p_over_z_depletion、withdrawal_fraction、inverse_withdrawal_fraction、effective_inventory）、cycle_id、injection_end_state_id、evaluation_state_id、pressure_basis、equation、quantity_definition、quality_gate；外层含 units、metrics、assumptions、warnings、applicability。",
    "按分层 p/Z 采气段公式计算有效控制库存。",
    "依赖输入压力基准与 Z 值；异常分母或超限反向采气比例会触发校验。"
  ),
  "storage.inventory.evaluate": Me(
    "layers：分层数组，每层含 name、produced_gas、injection_end_pressure、injection_end_z、evaluation_pressure、evaluation_z；cycle_id、injection_end_state_id、evaluation_state_id、design_capacity 必填；book_inventory 与 initial_inventory/cumulative_injected/cumulative_produced 二选一；working_gas 与 design_working_gas 成对可选；peak_daily_rate 与 design_peak_daily_rate 成对可选；gas_volume_unit（默认 1e8_sm3）、pressure_unit（默认 MPa）、pressure_basis（默认 absolute；可选 apparent_formation/report_defined）、daily_rate_unit（默认 1e4_sm3/d）。",
    "effective_inventory、book_inventory、book_minus_effective_inventory、effective_minus_book_percent、design_capacity、effective_inventory_design_compliance_percent、book_inventory_fill_percent、effective_to_book_percent、book_inventory_source、review_status、review_reference、layers、quantity_separation、quality_gate；按输入条件附加 book_inventory_accounting、working_gas/design_working_gas/working_gas_compliance_percent、peak_daily_rate/design_peak_daily_rate/peak_daily_compliance_percent。",
    "分离计算账面库存、有效控制库存及可选工作气/冲峰指标，并标记待审核。",
    "结果始终为待审核计算建议，不表示已审批。"
  ),
  "storage.capacity.evaluate": Me(
    "layers：每层 name、pore_volume、maximum_pressure、maximum_z、minimum_pressure、minimum_z、temperature；pore_volume_unit（m3）、pressure_unit（MPa）、temperature_unit（K）；standard_pressure（默认 0.101325）、standard_temperature（默认 288.15）、gas_volume_unit（1e8_sm3）。",
    "result：total_capacity、cushion_gas、working_gas、working_gas_fraction、layers（逐层 maximum_capacity/minimum_inventory/working_gas 等）、pressure_window、method、review_status、review_reference；外层含 units、metrics、assumptions、warnings、applicability。",
    "按孔隙体积和压力/Z 边界换算标准气量。",
    "属于边界筛选；不包含水侵、地质力学或产能能力模型。"
  ),
  "storage.injection_allocation.optimize": Me(
    "wells：井组数组，含 name、maximum_rate、可选 minimum_rate（默认 0）、weight（默认 1）、available（默认 true）；target_rate；rate_unit（1e4_sm3/d）；require_feasible（默认 false）。",
    "目标/请求量、分配总量、未满足量、超配量、feasible、逐井 allocated_rate/constraint_status、method、review_status；并附单位、井数指标、假设、警告和适用范围。",
    "按可用井的最低量和权重上限填充分配目标。",
    "不计算井筒/地层物理响应；结果是边界内的分配方案。"
  ),
  "storage.production_allocation.optimize": Me(
    "wells：井组数组，含 name、maximum_rate、可选 minimum_rate（默认 0）、weight（默认 1）、available（默认 true）；demand_rate；rate_unit（1e4_sm3/d）；require_feasible（默认 false）。",
    "需求/请求量、分配总量、未满足量、超配量、feasible、逐井 allocated_rate/constraint_status、method、review_status；并附单位、井数指标、假设、警告和适用范围。",
    "按可用井的最低量和权重上限填充分配需求。",
    "井组产能上下限由调用方提供；工具不计算井筒或地层产能。"
  ),
  "storage.scenario.optimize": Me(
    "scenarios：候选数组，每项含 name、metrics（指标名到数值），metadata（可选字符串映射）；objectives：指标 key、direction（maximize/minimize）、weight；constraints（可选，key/operator/limit）；metric_unit（可选）。",
    "可行方案排序、目标评分、约束筛选与非支配 Pareto 方案。",
    "按显式目标和约束做透明方案比较。",
    "仅比较提供的标量指标，不运行储层仿真。"
  ),
  "visualization.open": Me(
    "dataset_id：数据集标识（默认空字符串，表示不指定数据集）。",
    "排队命令回执：kind、commandId、command=open、datasetId；配置/队列异常时返回 kind=error 和 error。",
    "请求打开三维查看器并可选加载数据集。"
  ),
  "visualization.property": Me(
    "property：属性名；dataset_id：数据集标识（默认空字符串）。",
    "排队命令回执：kind、commandId、command=set-property、property；异常时 kind=error/error。",
    "向查看器发送属性着色切换命令。"
  ),
  "visualization.benchmark": Me(
    "无参数。",
    "排队基准命令回执：kind、commandId、command=benchmark；实际基准数据需查询/由查看器执行。",
    "请求查看器运行五秒渲染基准。"
  ),
  "storage.history.import": Me(
    "input_path：本地文件或目录的路径。",
    "ok、dataset_id、records、facilities、quality_counts、quality_examples（最多 20 条）、source_columns、reused。",
    "导入本地储气库注采历史数据并检查质量。",
    "接受 XLS/XLSX/UTF-8 CSV 文件或目录；原件保留。"
  ),
  "storage.dynamics.analyze": Me(
    "dataset_id：数据集 ID；facility、well：储气库/井原名（默认空，表示全部）；start、end：YYYY-MM-DD 起止日期（默认空，取全范围）；cycle_start_month：气年度起始月 1–12（默认 4）；drop_threshold_pct：同阶段末 7 日与前 7 日折算量下降筛查阈值百分比（默认 30）。",
    "ok、summary、coverage、cycles_recent、anomalies、forecast_wells、warnings、parameters、quality_counts、quality_examples、report_path、analysis_path。",
    "生成并保存可追溯的储气库动态分析报告。"
  ),
  "storage.history.list": Me(
    "无参数。",
    "ok、datasets（每项含 id、name、records、facilities、quality_counts、quality_examples）及 quality_code_meaning。",
    "列出已导入储气库历史数据集。"
  )
}, on = {
  "well-log-processing": {
    description: "读取 LAS 2.0 测井文件，提供曲线摘要、质量检查和规范化导出。",
    inputs: "LAS 文件路径及读取、检查或导出选项。",
    outputs: "井与曲线元数据、采样摘要、质量问题或导出工件。"
  },
  "decline-analysis": {
    description: "对生产点拟合 Arps 指数、调和或双曲递减模型，并按拟合参数预测和估算 EUR。",
    inputs: "带时间/产量单位的生产点，或模型参数、预测时点/终止条件。",
    outputs: "拟合参数与误差指标、预测产量或 EUR 估算。"
  },
  "petroleum-deterministic-core": {
    description: "执行确定性的单位换算、容积法 OOIP、油/气物质平衡、Standing 黑油 PVT、Vogel IPR、简化节点分析和守恒检查。",
    inputs: "明确单位的工程参数、PVT 与压力/流量数据。",
    outputs: "换算值、储量/PVT/IPR/节点计算结果及守恒校核。"
  },
  "storage-inventory-evaluation": {
    description: "基于输入数据进行储气库库存计量、分层 p/Z 有效库存、压力边界库容筛选、井组注采分配及方案排序。",
    inputs: "注采库存、分层压力/Z/孔隙体积、井组边界或候选方案指标。",
    outputs: "账面与有效库存、库容边界量、分配候选、约束短缺及 Pareto 结果。"
  },
  "storage-production-dynamics": {
    description: "导入和审计储气库注采历史数据，查询数据集并生成动态分析。",
    inputs: "XLS/XLSX/CSV 路径、已导入数据集标识及分析选项。",
    outputs: "数据集目录、覆盖与质量审计、动态/周期/异常及条件性基线报告。"
  },
  neqsim: {
    description: "通过外部 NeqSim Driver 服务请求闪蒸、PVT、相包络、流程和管道计算。",
    inputs: "各工具接受的组成、状态条件、流程或管道 specification 对象/JSON。",
    outputs: "由 NeqSim 服务返回的相态、性质、流程或管道结果。"
  },
  "reservoir-visualization": {
    description: "向三维查看器发送打开数据集、切换属性和启动性能基准的命令。",
    inputs: "dataset_id（可选）、property 或无参数基准命令。",
    outputs: "带 commandId 的查看器命令回执；基准数据由查看器执行，不由该工具直接返回。"
  },
  sympy: {
    description: "提供最高 20 次多项式的数值求根工具。",
    inputs: "按最高次项到常数项排列的非零首项系数数组。",
    outputs: "degree 及 roots 数组，每个根含 real、imag。"
  },
  pymc: {
    description: "对观测标准差已知的正态均值模型执行贝叶斯估计。",
    inputs: "observations、prior_mean（0）、prior_std（10）、observation_std（1）、draws（1000）、tune（500）、seed（42）。",
    outputs: "posterior_mean、posterior_std、credible_interval_95、sample_count。"
  },
  pymoo: {
    description: "用 NSGA-II 搜索结构化二次多目标函数。",
    inputs: "centers、bounds、population_size（80）、generations（100）、seed（42）。",
    outputs: "solutions（每项含 variables、objectives）及 solution_count。"
  },
  simpy: {
    description: "运行固定到达间隔、固定服务时间的多服务台 FIFO 队列仿真。",
    inputs: "arrival_interval、service_time、servers（默认 1）和 duration（默认 100）。",
    outputs: "arrivals、completed、average_wait、maximum_wait、servers。"
  },
  networkx: {
    description: "分析输入图的连通分量、密度、度中心性和可选最短路径。",
    inputs: "nodes、edges、directed（默认 false）；source/target 可选但须同时提供。",
    outputs: "node_count、edge_count、component_count、density、degree_centrality、shortest_path。"
  },
  geopandas: {
    description: "计算输入点集的边界框和质心。",
    inputs: "points：二维 [x,y] 数组；crs（默认 EPSG:4326）。",
    outputs: "point_count、crs、bounds、centroid。"
  },
  "scikit-learn": {
    description: "拟合普通最小二乘线性回归并预测给定样本。",
    inputs: "features、targets、predict_features。",
    outputs: "coefficients、intercept、training_r_squared、training_rmse、predictions。"
  },
  statsmodels: {
    description: "拟合带截距的 OLS 回归并返回推断统计量。",
    inputs: "features、targets、feature_names（可选，默认 x1…）。",
    outputs: "coefficients、standard_errors、p_values、r_squared、adjusted_r_squared、observation_count。"
  }
};
function ts(e) {
  const t = es[e.id];
  return {
    description: (t == null ? void 0 : t.description) || e.description || "暂无说明",
    inputs: (t == null ? void 0 : t.inputs) || "输入信息未提供",
    outputs: (t == null ? void 0 : t.outputs) || "输出信息未提供",
    limitations: t == null ? void 0 : t.limitations
  };
}
function ns({
  operations: e
}) {
  const t = z().React, { Tag: n, Typography: r } = z().antd, { Text: a } = r;
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 8, minWidth: 0 } },
    ...e.map((i) => {
      const s = ts(i);
      return t.createElement(
        "div",
        {
          key: i.id,
          style: {
            padding: "10px 12px",
            border: "1px solid var(--app-border-subtle, #f0f0f0)",
            borderRadius: 6,
            minWidth: 0
          }
        },
        t.createElement(
          a,
          { strong: !0, style: { overflowWrap: "anywhere" } },
          i.name
        ),
        t.createElement(
          a,
          {
            type: "secondary",
            style: { display: "block", fontSize: 11, overflowWrap: "anywhere" }
          },
          i.tool_names.length ? `工具：${i.tool_names.join("、")}` : "工具：未声明"
        ),
        t.createElement(
          a,
          {
            style: {
              display: "block",
              marginTop: 6,
              fontSize: 12,
              overflowWrap: "anywhere"
            }
          },
          s.description
        ),
        t.createElement(
          a,
          {
            type: "secondary",
            style: {
              display: "block",
              marginTop: 4,
              fontSize: 12,
              overflowWrap: "anywhere"
            }
          },
          `输入：${s.inputs}`
        ),
        t.createElement(
          a,
          {
            type: "secondary",
            style: { display: "block", fontSize: 12, overflowWrap: "anywhere" }
          },
          `输出：${s.outputs}`
        ),
        s.limitations ? t.createElement(
          a,
          {
            type: "warning",
            style: {
              display: "block",
              fontSize: 12,
              overflowWrap: "anywhere"
            }
          },
          `限制：${s.limitations}`
        ) : null,
        es[i.id] ? null : t.createElement(
          n,
          { style: { marginTop: 4 } },
          "详细说明待补充"
        )
      );
    })
  );
}
const _c = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  reservoir_engineering: "🛢️",
  underground_gas_storage: "🛢️",
  gas_storage: "🛢️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
};
function Cc({
  view: e,
  onDetails: t,
  onInstall: n,
  onConfigure: r,
  onRefresh: a,
  installTask: i
}) {
  const s = z().React, { Card: l, Tag: o, Typography: d, Button: c, Modal: u, Tooltip: m } = z().antd, { Text: p } = d, [b, g] = s.useState(!1), f = e.definition, h = on[f.id], y = (i == null ? void 0 : i.status) === "queued" || (i == null ? void 0 : i.status) === "running", E = f.id !== "neqsim" && e.effectiveStatus === "unavailable" && f.dependencies.length > 0 && f.dependencies.every((S) => !/(three\.js|java|neqsim)/i.test(S)), v = y ? { label: "查看安装进度", action: n, disabled: !1 } : f.id === "neqsim" && e.effectiveStatus === "needs_install" ? {
    label: "安装 NeqSim 运行环境",
    action: n,
    disabled: !1
  } : e.effectiveStatus === "needs_install" || E ? {
    label: "安装运行环境",
    action: n,
    disabled: !1
  } : e.effectiveStatus === "unconfigured" || e.effectiveStatus === "partial" ? { label: "启用工具", action: r, disabled: !1 } : e.effectiveStatus === "error" || e.effectiveStatus === "unknown" ? { label: "重新检测", action: a, disabled: !1 } : null;
  return s.createElement(
    l,
    {
      size: "small",
      className: "ugsci-capability-card",
      style: { width: "100%", minWidth: 0 },
      styles: {
        body: { minWidth: 0, display: "flex", flexDirection: "column" }
      }
    },
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0
        }
      },
      s.createElement(
        "span",
        {
          "aria-hidden": !0,
          style: {
            display: "grid",
            placeItems: "center",
            flex: "0 0 36px",
            width: 36,
            height: 36,
            borderRadius: 9,
            fontSize: 20,
            background: "var(--app-fill-subtle, rgba(127,127,127,.12))"
          }
        },
        _c[f.domain] || "📦"
      ),
      s.createElement(
        "div",
        { style: { flex: 1, minWidth: 0 } },
        s.createElement(
          p,
          {
            strong: !0,
            style: {
              display: "block",
              fontSize: 14,
              lineHeight: "21px",
              overflowWrap: "anywhere"
            }
          },
          f.name
        ),
        s.createElement(
          "div",
          { style: { marginTop: 3 } },
          s.createElement(
            m,
            { title: `${e.statusDescription} 该状态未包含实际试算验证。` },
            s.createElement(
              o,
              {
                color: xr[e.effectiveStatus] || "default",
                tabIndex: 0
              },
              wr[e.effectiveStatus] || e.effectiveStatus
            )
          )
        )
      )
    ),
    s.createElement(
      p,
      {
        type: "secondary",
        style: {
          display: "block",
          marginTop: 0,
          fontSize: 12,
          lineHeight: "18px",
          overflowWrap: "anywhere"
        }
      },
      (h == null ? void 0 : h.description) || f.description || "暂无领域说明"
    ),
    i && y ? s.createElement(
      p,
      {
        type: "secondary",
        role: "status",
        style: { marginTop: 8, fontSize: 12, lineHeight: "18px" }
      },
      i.message || "运行环境安装中…"
    ) : null,
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginTop: "auto",
          paddingTop: 4
        }
      },
      s.createElement(
        c,
        {
          type: "link",
          size: "small",
          "aria-label": `查看 ${f.name} 的函数`,
          onClick: () => g(!0)
        },
        `查看函数 · ${f.operations.length}`
      ),
      s.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 4,
            marginLeft: "auto"
          }
        },
        v ? s.createElement(
          c,
          {
            size: "small",
            type: "primary",
            disabled: v.disabled || !v.action,
            loading: !1,
            "aria-label": v.label,
            onClick: v.action
          },
          v.label
        ) : null,
        s.createElement(
          c,
          {
            size: "small",
            "aria-label": `查看 ${f.name} 详情`,
            onClick: t
          },
          "查看详情"
        )
      )
    ),
    s.createElement(
      u,
      {
        title: `${f.name} · 函数说明`,
        open: b,
        onCancel: () => g(!1),
        width: "min(720px, calc(100vw - 32px))",
        destroyOnHidden: !0,
        footer: s.createElement(
          c,
          {
            onClick: () => g(!1),
            "aria-label": "关闭函数说明"
          },
          "关闭"
        ),
        styles: { body: { maxHeight: "65vh", overflowY: "auto" } }
      },
      s.createElement(ns, { operations: f.operations })
    )
  );
}
const Ln = [
  {
    key: "storage",
    title: "储气库工程",
    domains: ["underground_gas_storage", "gas_storage"]
  },
  {
    key: "reservoir",
    title: "油气藏与生产工程",
    domains: ["reservoir_engineering", "production_engineering"]
  },
  { key: "geology", title: "测井与地质", domains: ["geology_well_logging"] },
  { key: "fluids", title: "流体性质", domains: ["fluid_thermodynamics"] },
  {
    key: "general",
    title: "通用科学计算",
    domains: ["scientific_computing", "data_modeling"]
  },
  { key: "other", title: "其他领域", domains: [] }
];
function Sr(e, t) {
  return t === "reservoir-visualization" ? Ln[2] : Ln.find((n) => n.domains.includes(e)) || Ln[5];
}
function Tc({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: a,
  onNavigateToSkills: i,
  onInstallNeqsim: s,
  neqsimInstallState: l
}) {
  const o = z().React, { Descriptions: d, Tag: c, Typography: u, Button: m, Divider: p } = z().antd, { Text: b, Paragraph: g } = u;
  if (!e) return null;
  const f = e.definition, h = e.dependencyStatus, y = on[f.id], E = Sr(f.domain, f.id).title;
  return o.createElement(
    pn,
    {
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement("span", null, f.name),
        o.createElement(
          c,
          {
            color: xr[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          wr[e.effectiveStatus] || e.effectiveStatus
        )
      ),
      open: t,
      onClose: n,
      width: 560,
      rootClassName: "ugsci-domain-engine-detail-drawer"
    },
    // Overview
    o.createElement(
      d,
      { column: 1, bordered: !0, size: "small" },
      o.createElement(d.Item, { label: "领域" }, E),
      o.createElement(
        d.Item,
        { label: "状态依据" },
        e.statusDescription
      ),
      o.createElement(
        d.Item,
        { label: "检测范围" },
        "检查运行依赖、工具注册和当前专家的启用配置；未执行试算，不代表计算结果已验证。"
      ),
      o.createElement(
        d.Item,
        { label: "来源" },
        f.provider.kind === "driver" ? "内置能力 · MCP Driver" : f.source === "builtin" ? "内置工具" : f.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      o.createElement(
        d.Item,
        { label: "实现" },
        `${f.provider.kind}:${f.provider.id}`
      ),
      o.createElement(
        d.Item,
        { label: "计算类别" },
        f.execution_class === "deterministic" ? "确定性计算" : f.execution_class === "stochastic" ? "随机/概率计算" : f.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      o.createElement(
        d.Item,
        { label: "内核版本" },
        f.engine_version
      ),
      o.createElement(
        d.Item,
        { label: "描述" },
        (y == null ? void 0 : y.description) || f.description || "暂无领域说明"
      ),
      o.createElement(
        d.Item,
        { label: "总输入" },
        (y == null ? void 0 : y.inputs) || "输入信息未提供"
      ),
      o.createElement(
        d.Item,
        { label: "总输出" },
        (y == null ? void 0 : y.outputs) || "输出信息未提供"
      ),
      o.createElement(
        d.Item,
        { label: "已发现工具" },
        e.discoveredToolCount
      ),
      o.createElement(
        d.Item,
        { label: "检测时间" },
        e.checkedAt
      )
    ),
    // Operations
    o.createElement(
      "div",
      { style: { marginTop: 16, marginBottom: 8 } },
      o.createElement(b, { strong: !0 }, "领域操作")
    ),
    o.createElement(ns, { operations: f.operations }),
    o.createElement(
      "div",
      { style: { marginTop: 16, display: "flex", gap: 4, flexWrap: "wrap" } },
      ...f.tags.map(
        (v) => o.createElement(c, { key: v, color: "cyan" }, v)
      )
    ),
    // Dependencies
    o.createElement(p, null),
    o.createElement(b, { strong: !0 }, "实现与依赖"),
    h && h.dependencies.length > 0 ? o.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...h.dependencies.map(
        (v) => o.createElement(
          "div",
          {
            key: v.name,
            style: {
              padding: "8px 0",
              borderBottom: "1px solid var(--app-border-subtle, #f0f0f0)"
            }
          },
          o.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }
            },
            o.createElement(
              b,
              { style: { fontSize: 13 } },
              v.name
            ),
            o.createElement(
              c,
              {
                color: xr[v.status] || "default",
                style: { fontSize: 11 }
              },
              wr[v.status] || v.status
            )
          ),
          v.status !== "available" && v.reason ? o.createElement(
            b,
            {
              type: "secondary",
              style: { display: "block", fontSize: 12, marginTop: 4 }
            },
            v.reason
          ) : null,
          v.status !== "available" && v.install_hint ? o.createElement(
            b,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${v.install_hint}`
          ) : null,
          v.status !== "available" && v.enable_hint ? o.createElement(
            b,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${v.enable_hint}`
          ) : null
        )
      )
    ) : o.createElement(
      g,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    o.createElement(p, null),
    o.createElement(b, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      f.id === "neqsim" && e.effectiveStatus === "needs_install" ? o.createElement(
        m,
        {
          size: "small",
          type: "primary",
          loading: (l == null ? void 0 : l.status) === "queued" || (l == null ? void 0 : l.status) === "running",
          onClick: s
        },
        (l == null ? void 0 : l.status) === "running" ? `${l.message} (${l.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      f.provider.kind === "driver" ? o.createElement(
        m,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : f.source === "library" ? o.createElement(
        m,
        { size: "small", onClick: i },
        "查看相关技能"
      ) : o.createElement(
        m,
        { size: "small", onClick: () => a("builtin") },
        "查看内置工具"
      )
    ),
    f.id === "neqsim" && (l == null ? void 0 : l.status) === "failed" ? o.createElement(
      g,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      l.error || "安装失败"
    ) : null,
    f.id === "neqsim" && (l != null && l.warning) ? o.createElement(
      g,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      l.warning
    ) : null
  );
}
function Mc({
  open: e,
  engineName: t,
  plan: n,
  task: r,
  error: a,
  onClose: i,
  onTaskChange: s,
  onRetry: l,
  onCompleted: o,
  onManage: d
}) {
  const c = z().React, { Modal: u, Button: m, Typography: p, Alert: b, Progress: g, Tag: f, Space: h } = z().antd, { Text: y, Paragraph: E } = p, v = c.useRef(0), S = c.useRef(!0), B = `${e}:${(n == null ? void 0 : n.engine_id) || ""}`, N = c.useRef(B);
  N.current = B;
  const [w, x] = c.useState(!1), [R, H] = c.useState(""), [_, T] = c.useState(0), $ = (r == null ? void 0 : r.status) === "queued" || (r == null ? void 0 : r.status) === "running";
  c.useEffect(() => {
    x(!1), H("");
  }, [B]), c.useEffect(() => (S.current = !0, () => {
    S.current = !1, v.current += 1;
  }), []), c.useEffect(() => {
    if (!$ || !r) return;
    const P = ++v.current;
    let W = !1;
    return (async () => {
      for (; !W && P === v.current; ) {
        if (await new Promise((U) => setTimeout(U, 1e3)), W || P !== v.current) return;
        try {
          const U = await wc(r.id, r.engine_id);
          if (W || P !== v.current) return;
          if (H(""), s(U), U.status === "completed") {
            o();
            return;
          }
          if (U.status === "failed") return;
        } catch (U) {
          if (W || P !== v.current) return;
          const Q = U instanceof Error ? U.message : "连接安装任务失败";
          if (/HTTP 404|not found|未找到/i.test(Q))
            try {
              const D = await Er(r.engine_id);
              if (W || P !== v.current) return;
              D.state === "ready" ? (s({
                ...r,
                status: "completed",
                progress: 100,
                message: "依赖已就绪，已恢复安装状态。",
                error: ""
              }), o()) : D.active_task ? (s(D.active_task), T((Y) => Y + 1)) : s({
                ...r,
                status: "failed",
                error: "未找到此安装任务，且依赖尚未就绪，请重新发起安装。"
              });
            } catch {
              if (W || P !== v.current) return;
              H("暂时无法确认安装结果，请重新检测以恢复进度。");
            }
          else
            H(
              `连接安装任务时遇到问题。安装可能仍在后台继续，请重新检测以恢复进度。（${Q}）`
            );
          return;
        }
      }
    })(), () => {
      W = !0, v.current += 1;
    };
  }, [$, r == null ? void 0 : r.id, _, s, o]);
  const F = async () => {
    if (!(n != null && n.installable) || w || $) return;
    const P = N.current;
    x(!0);
    try {
      const W = await Ec(n.engine_id);
      if (!S.current || N.current !== P) return;
      s(W), W.status === "completed" && o();
    } catch (W) {
      if (!S.current || N.current !== P) return;
      l(W instanceof Error ? W.message : "无法开始安装，请重试");
    } finally {
      S.current && N.current === P && x(!1);
    }
  }, C = !!(n != null && n.installable) && !$ && (r == null ? void 0 : r.status) !== "completed", I = (r == null ? void 0 : r.status) === "completed", L = (r == null ? void 0 : r.status) === "failed", M = I ? c.createElement(b, {
    type: r != null && r.warning ? "warning" : "success",
    showIcon: !0,
    message: "安装完成",
    description: (r == null ? void 0 : r.warning) || (r == null ? void 0 : r.message) || "运行环境已加载，可以直接使用。"
  }) : L ? c.createElement(b, {
    type: "error",
    showIcon: !0,
    message: "安装失败",
    description: (r == null ? void 0 : r.error) || (r == null ? void 0 : r.message) || "安装失败，请重试。"
  }) : r ? c.createElement(
    "div",
    { role: "status", "aria-live": "polite", style: { marginTop: 16 } },
    c.createElement(
      h,
      { size: 8 },
      c.createElement(
        f,
        { color: $ ? "processing" : "default" },
        r.status === "queued" ? "排队中" : r.status === "running" ? "安装中" : r.status
      ),
      c.createElement(y, null, r.message || "正在准备安装…")
    ),
    $ ? c.createElement(
      c.Fragment,
      null,
      c.createElement(
        y,
        {
          type: "secondary",
          style: { display: "block", marginTop: 8, fontSize: 12 }
        },
        "阶段进度（非下载百分比）"
      ),
      c.createElement(g, {
        percent: r.progress ?? void 0,
        status: "active",
        showInfo: !1,
        style: { marginTop: 2, marginBottom: 0 }
      })
    ) : null,
    r.warning ? c.createElement(b, {
      style: { marginTop: 10 },
      type: "warning",
      showIcon: !0,
      message: r.warning
    }) : null
  ) : null;
  return c.createElement(
    u,
    {
      title: `${t} · 运行环境`,
      open: e,
      onCancel: i,
      width: "min(520px, calc(100vw - 32px))",
      destroyOnHidden: !1,
      footer: I ? c.createElement(
        m,
        {
          type: "primary",
          onClick: i,
          "aria-label": "关闭安装完成提示"
        },
        "关闭"
      ) : L ? c.createElement(
        h,
        null,
        c.createElement(m, { onClick: i }, "关闭"),
        c.createElement(
          m,
          {
            type: "primary",
            onClick: F,
            disabled: !(n != null && n.installable),
            loading: w,
            "aria-label": "重试安装"
          },
          "重试安装"
        )
      ) : r ? c.createElement(
        m,
        { onClick: i, "aria-label": "关闭安装进度" },
        "后台继续，关闭窗口"
      ) : n && !n.installable && n.state !== "ready" ? c.createElement(
        c.Fragment,
        null,
        c.createElement(m, { onClick: i }, "关闭"),
        c.createElement(
          m,
          { onClick: d, "aria-label": "前往工具或技能管理入口" },
          "前往管理入口"
        )
      ) : (n == null ? void 0 : n.state) === "ready" ? c.createElement(
        m,
        { type: "primary", onClick: i },
        "关闭"
      ) : c.createElement(
        h,
        null,
        c.createElement(m, { onClick: i }, "取消"),
        c.createElement(
          m,
          {
            type: "primary",
            disabled: !C || w,
            loading: w,
            onClick: F,
            "aria-label": "开始安装运行环境"
          },
          "开始安装"
        )
      )
    },
    a ? c.createElement(b, {
      type: "error",
      showIcon: !0,
      message: "运行环境操作未完成",
      description: a,
      action: c.createElement(
        m,
        {
          size: "small",
          onClick: () => l(),
          "aria-label": "重新检测运行环境"
        },
        "重新检测"
      )
    }) : null,
    R ? c.createElement(b, {
      style: { marginTop: 12 },
      type: "warning",
      showIcon: !0,
      message: R,
      action: c.createElement(
        m,
        {
          size: "small",
          onClick: () => {
            H(""), T((P) => P + 1), l();
          },
          "aria-label": "重新检测安装任务"
        },
        "重新检测"
      )
    }) : null,
    n ? c.createElement(
      c.Fragment,
      null,
      c.createElement(
        E,
        { style: { marginBottom: 12 } },
        n.state === "ready" ? "运行环境已就绪，可以直接使用。" : n.installable ? "将按需下载以下运行环境，验证通过后自动加载。安装期间可以关闭窗口，稍后继续查看进度。" : n.message || "此运行环境当前无法由软件安装。"
      ),
      n.packages.length ? c.createElement(
        "div",
        {
          style: {
            padding: 12,
            borderRadius: 8,
            background: "var(--app-fill-faint, rgba(127,127,127,.07))"
          }
        },
        c.createElement(
          y,
          {
            strong: !0,
            style: { display: "block", marginBottom: 6 }
          },
          "依赖清单"
        ),
        ...n.packages.map(
          (P) => c.createElement(
            "div",
            {
              key: P,
              style: {
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: "21px",
                overflowWrap: "anywhere"
              }
            },
            P
          )
        )
      ) : c.createElement(b, {
        type: n.installable ? "info" : "warning",
        showIcon: !0,
        message: n.message || "没有可列出的安装依赖。"
      }),
      I || n.state === "ready" ? c.createElement(b, {
        style: { marginTop: 12 },
        type: "success",
        showIcon: !0,
        message: "运行环境已就绪"
      }) : null,
      !n.installable && n.state !== "ready" ? c.createElement(b, {
        style: { marginTop: 12 },
        type: "warning",
        showIcon: !0,
        message: n.message || "当前环境不支持自动安装，请前往工具或技能管理入口处理。"
      }) : null
    ) : null,
    M
  );
}
function Ic({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var Ie, _e;
  const r = z().React, { useState: a, useEffect: i, useCallback: s, useMemo: l, useRef: o } = r, {
    Spin: d,
    Empty: c,
    Button: u,
    message: m,
    Row: p,
    Col: b,
    Input: g
  } = z().antd, { ReloadOutlined: f, SearchOutlined: h } = z().antdIcons || {}, y = (_e = (Ie = z()).useSelectedAgent) == null ? void 0 : _e.call(Ie), E = (y == null ? void 0 : y.id) || "default", [v, S] = a([]), [B, N] = a(!0), [w, x] = a(""), [R, H] = a(!1), [_, T] = a(null), [$, F] = a({ general: !0 }), [C, I] = a(null), [L, M] = a(
    null
  ), [P, W] = a(
    null
  ), [G, U] = a(""), [Q, D] = a(!1), Y = o(E);
  Y.current = E;
  const ne = o(_);
  ne.current = _;
  const re = o(0);
  i(
    () => () => {
      re.current += 1;
    },
    []
  );
  const se = s(async (oe = !1, te = !1) => {
    var O, K;
    te || N(!0);
    const le = te && typeof window < "u" ? {
      x: window.scrollX,
      y: window.scrollY,
      drawerBody: typeof document < "u" ? document.querySelector(
        ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
      ) : null,
      drawerTop: typeof document < "u" && ((O = document.querySelector(
        ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
      )) == null ? void 0 : O.scrollTop) || 0
    } : null, Z = () => {
      if (!le || typeof window > "u") return;
      const V = () => {
        var fe;
        window.scrollTo(le.x, le.y), (fe = le.drawerBody) != null && fe.isConnected && (le.drawerBody.scrollTop = le.drawerTop);
      };
      typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(V) : V();
    }, A = Y.current;
    try {
      const [V, fe, ee] = await Promise.all([
        bc(oe),
        Sc(A, oe),
        xc(A, oe)
      ]);
      if (A !== Y.current) return;
      const be = [];
      for (const Ae of V)
        try {
          let qe = null;
          if (Ae.engine.provider.kind === "driver") {
            const We = Ae.engine.provider.id;
            qe = fe.get(We) || null;
          }
          be.push(kc(Ae, qe, ee));
        } catch {
        }
      S(be);
      const ke = (K = ne.current) == null ? void 0 : K.definition.id;
      if (ke) {
        const Ae = be.find((qe) => qe.definition.id === ke);
        Ae && (ne.current = Ae, T(Ae));
      }
      Z();
    } catch (V) {
      const fe = V instanceof Error ? V.message : "加载领域引擎失败";
      m.error(fe), te || S([]);
    } finally {
      te || N(!1);
    }
  }, []);
  i(() => {
    se();
  }, [E, se]);
  const X = l(() => {
    if (!w.trim()) return v;
    const oe = w.trim().toLowerCase();
    return v.filter(
      (te) => {
        var le, Z, A;
        return Sr(te.definition.domain, te.definition.id).title.toLowerCase().includes(oe) || te.definition.name.toLowerCase().includes(oe) || te.definition.domain.toLowerCase().includes(oe) || te.definition.description.toLowerCase().includes(oe) || [
          ((le = on[te.definition.id]) == null ? void 0 : le.description) || "",
          ((Z = on[te.definition.id]) == null ? void 0 : Z.inputs) || "",
          ((A = on[te.definition.id]) == null ? void 0 : A.outputs) || ""
        ].some((O) => O.toLowerCase().includes(oe)) || te.definition.tags.some((O) => O.toLowerCase().includes(oe)) || te.definition.operations.some((O) => {
          const K = ts(O);
          return [
            O.name,
            O.id,
            O.description,
            ...O.tool_names,
            K.description,
            K.inputs,
            K.outputs,
            K.limitations || ""
          ].some((V) => V.toLowerCase().includes(oe));
        });
      }
    );
  }, [v, w]), pe = l(
    () => Ln.map((oe) => ({
      ...oe,
      views: X.filter(
        (te) => Sr(te.definition.domain, te.definition.id).key === oe.key
      )
    })).filter((oe) => oe.views.length > 0),
    [X]
  ), ye = s(() => {
    se(!0);
  }, [se]), q = s((oe) => {
    ne.current = oe, T(oe), H(!0);
  }, []), j = s(() => {
    H(!1), e == null || e();
  }, [e]), ge = s(
    (oe) => {
      H(!1), t == null || t(oe);
    },
    [t]
  ), we = s(() => {
    H(!1), n == null || n();
  }, [n]), ve = s(async (oe) => {
    I(oe), M(null), W(null), U(""), D(!0);
    const te = ++re.current;
    try {
      const le = await Er(oe.definition.id);
      if (te !== re.current) return;
      M(le), W(le.active_task);
    } catch (le) {
      if (te !== re.current) return;
      U(le instanceof Error ? le.message : "读取运行环境失败");
    }
  }, []), ue = s(
    async (oe) => {
      if (oe) {
        U(oe);
        return;
      }
      if (!C) return;
      U("");
      const te = ++re.current;
      try {
        const le = await Er(
          C.definition.id
        );
        if (te !== re.current) return;
        M(le), W(le.active_task);
      } catch (le) {
        if (te !== re.current) return;
        U(
          le instanceof Error ? le.message : "读取运行环境失败"
        );
      }
    },
    [C]
  ), Se = s(() => {
    se(!0, !0);
  }, [se]), xe = s(
    (oe) => {
      oe.definition.provider.kind === "driver" || oe.definition.source === "mcp" ? j() : oe.definition.source === "library" || oe.definition.provider.kind === "skill" ? we() : ge("builtin");
    },
    [j, we, ge]
  );
  return r.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": R },
    // Action bar
    r.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap"
        }
      },
      r.createElement(g, {
        placeholder: "搜索领域引擎...",
        prefix: h ? r.createElement(h) : void 0,
        value: w,
        onChange: (oe) => {
          const te = oe.target.value;
          x(te), F(te.trim() ? {} : { general: !0 });
        },
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        u,
        {
          icon: f ? r.createElement(f) : void 0,
          onClick: ye,
          loading: B
        },
        "刷新"
      )
    ),
    // Content
    B ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(d, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : X.length === 0 ? r.createElement(c, {
      description: w ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...pe.map((oe) => {
        const te = !!$[oe.key];
        return r.createElement(
          "div",
          { key: oe.key, style: { marginBottom: 20 } },
          r.createElement(
            u,
            {
              type: "text",
              onClick: () => F((le) => ({
                ...le,
                [oe.key]: !le[oe.key]
              })),
              "aria-expanded": !te,
              style: {
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 8,
                paddingInline: 0
              }
            },
            `${te ? "▸" : "▾"} ${oe.title} (${oe.views.length})`
          ),
          te ? null : r.createElement(
            p,
            { gutter: [12, 12], align: "top" },
            ...oe.views.map(
              (le) => r.createElement(
                b,
                {
                  key: le.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 12,
                  lg: 12,
                  style: { display: "flex", minWidth: 0 }
                },
                r.createElement(Cc, {
                  view: le,
                  onDetails: () => q(le),
                  onInstall: () => void ve(le),
                  onConfigure: () => xe(le),
                  onRefresh: () => void se(!0),
                  installTask: (C == null ? void 0 : C.definition.id) === le.definition.id ? P : null
                })
              )
            )
          )
        );
      })
    ),
    // Detail drawer
    r.createElement(Tc, {
      view: _,
      open: R,
      onClose: () => H(!1),
      onNavigateToMcp: j,
      onNavigateToTools: ge,
      onNavigateToSkills: we,
      onInstallNeqsim: () => {
        _ && ve(_);
      },
      neqsimInstallState: (P == null ? void 0 : P.engine_id) === "neqsim" ? { ...P, progress: P.progress ?? 0 } : null
    }),
    r.createElement(Mc, {
      open: Q,
      engineName: (C == null ? void 0 : C.definition.name) || "领域引擎",
      plan: L,
      task: P,
      error: G,
      onClose: () => {
        re.current += 1, D(!1);
      },
      onTaskChange: W,
      onRetry: ue,
      onCompleted: Se,
      onManage: () => {
        re.current += 1, D(!1), C && xe(C);
      }
    })
  );
}
const Ac = dc, rs = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function $c(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && rs.has(t) ? t : e;
  } catch {
    return e;
  }
}
function Va(e) {
  try {
    const t = new URL(window.location.href);
    t.searchParams.set("tab", e), window.history.replaceState(
      {},
      "",
      `${t.pathname}${t.search}${t.hash}`
    );
  } catch {
  }
}
function kr({ page: e }) {
  const t = z().React, { useEffect: n, useState: r } = t, { Alert: a, Spin: i } = z().antd, [s, l] = r(null), [o, d] = r("");
  if (n(() => {
    let u = !0;
    const m = z().loadBuiltinPage;
    return l(null), m ? (d(""), m(e).then((p) => {
      u && l(() => p);
    }).catch((p) => {
      u && d(
        p instanceof Error ? p.message : "加载原生管理页面失败"
      );
    }), () => {
      u = !1;
    }) : (d("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      u = !1;
    });
  }, [e]), o)
    return t.createElement(a, {
      type: "error",
      showIcon: !0,
      message: "原生管理功能加载失败",
      description: o
    });
  if (!s)
    return t.createElement(
      "div",
      { style: { padding: 56, textAlign: "center" } },
      t.createElement(
        i,
        { tip: "正在加载原生管理功能..." },
        t.createElement("div", { style: { minHeight: 24 } })
      )
    );
  const c = e === "mcp" ? {
    title: "MCP 接入",
    description: "连接外部工具、数据服务与计算能力，扩展当前专家的可调用范围",
    managedTitle: "已接入服务",
    managedDescription: "启用后可由当前专家调用，并可按工具配置访问权限",
    create: "接入 MCP 服务"
  } : void 0;
  return t.createElement(s, { embedded: !0, embeddedLabels: c });
}
function zc({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const n = z().React, { Tabs: r } = z().antd;
  return n.createElement(r, {
    activeKey: e,
    onChange: t,
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: n.createElement(kr, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置工具",
        children: n.createElement(kr, { page: "tools" })
      }
    ]
  });
}
function Rc({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  const r = z().React, { Tabs: a } = z().antd;
  return r.createElement(a, {
    defaultActiveKey: "simulation",
    className: "ugsci-engine-tabs",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: r.createElement(hc)
      },
      {
        key: "domain",
        label: "领域计算",
        children: r.createElement(
          Ic,
          {
            onNavigateToMcp: e,
            onNavigateToTools: t,
            onNavigateToSkills: n
          }
        )
      },
      {
        key: "runtime",
        label: "运行服务",
        children: r.createElement(kr, { page: "acp" })
      }
    ]
  });
}
function as({
  initialTab: e = "engines"
} = {}) {
  var v, S, B, N;
  const t = z().React, { useEffect: n, useState: r } = t, { Tabs: a, Select: i } = z().antd, { RocketOutlined: s, ToolOutlined: l, ThunderboltOutlined: o } = z().antdIcons || {}, d = (S = (v = z()).useSelectedAgent) == null ? void 0 : S.call(v), c = (N = (B = z()).useAgentDisplayName) == null ? void 0 : N.call(B), u = (d == null ? void 0 : d.id) || "default", [m, p] = r([]);
  n(() => {
    let w = !0;
    return En().then((x) => {
      w && p(x);
    }).catch(() => {
    }), () => {
      w = !1;
    };
  }, []);
  const [b, g] = r(
    () => $c(e)
  ), [f, h] = r("mcp");
  n(() => {
    try {
      const w = new URLSearchParams(window.location.search).get("tab");
      w && !rs.has(w) && Va(b);
    } catch {
    }
  }, [b]);
  const y = (w) => {
    g(w), Va(w);
  }, E = (w, x) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    x ? t.createElement(x, { style: { fontSize: 14 } }) : null,
    w
  );
  return t.createElement(
    "div",
    { className: "ugsci-capabilities" },
    t.createElement("style", null, oc),
    t.createElement(Wn, {
      title: "工具与技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能"
    }),
    t.createElement(
      "div",
      { className: "ugsci-capability-context" },
      t.createElement(
        "label",
        { htmlFor: "ugsci-capability-agent" },
        "配置对象"
      ),
      t.createElement(i, {
        id: "ugsci-capability-agent",
        "aria-label": "配置对象",
        value: u,
        style: { minWidth: 180, maxWidth: "100%" },
        options: m.length ? m.map((w) => ({
          value: w.id,
          label: (c == null ? void 0 : c(w)) || Lr(w.name) || w.id
        })) : [
          {
            value: u,
            label: (c == null ? void 0 : c({ id: u, name: "" })) || u
          }
        ],
        onChange: (w) => {
          var x, R;
          return (R = (x = z()).setSelectedAgent) == null ? void 0 : R.call(x, w);
        }
      })
    ),
    t.createElement(a, {
      activeKey: b,
      onChange: (w) => y(w),
      items: [
        {
          key: "engines",
          label: E("计算引擎", s),
          children: t.createElement(
            Rc,
            {
              onNavigateToMcp: () => {
                h("mcp"), y("tools");
              },
              onNavigateToTools: (w) => {
                h(w || "mcp"), y("tools");
              },
              onNavigateToSkills: () => y("skills")
            }
          )
        },
        {
          key: "tools",
          label: E("工具", l),
          children: t.createElement(zc, {
            activeSubTab: f,
            onSubTabChange: h
          })
        },
        {
          key: "skills",
          label: E("技能", o),
          children: t.createElement(Ac, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const is = as;
function Lc() {
  return z().React.createElement(is, {
    initialTab: "tools"
  });
}
function Pc() {
  return z().React.createElement(is, {
    initialTab: "skills"
  });
}
function wt(e) {
  if (e)
    try {
      const t = new URL(e);
      if (t.username || t.password) return;
      if (t.protocol === "https:" || t.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(t.hostname))
        return t.href;
    } catch {
    }
}
function Oc(e, t = !1) {
  const n = String(e || "").trim().toLowerCase().replace(/[-_]/g, "");
  if (n === "sse") return "sse";
  if (n === "stdio") return "stdio";
  if (n === "streamablehttp" || n === "http" || !n && t)
    return "streamable_http";
  if (!n) return "stdio";
  throw new Error("不支持的 MCP 连接方式，请检查目录配置");
}
function Nc(e) {
  return [
    ...new Set(
      [
        ...JSON.stringify(e).matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)
      ].map((t) => t[1])
    )
  ];
}
function Bc(e, t) {
  const n = (i, s = !1) => i.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (l, o) => {
    const d = t[o];
    if (!(d != null && d.trim())) throw new Error(`请填写配置项：${o}`);
    return s ? encodeURIComponent(d) : d;
  });
  let r = e.url;
  if (r) {
    const i = r.indexOf("?");
    r = i < 0 ? n(r) : n(r.slice(0, i)) + "?" + n(r.slice(i + 1), !0);
    const s = new URL(r);
    if (!["https:", "http:"].includes(s.protocol) || s.username || s.password)
      throw new Error("请输入有效的 HTTP MCP 地址");
    if (s.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(s.hostname))
      throw new Error("远程 MCP 请使用 HTTPS 地址");
    if (s.hash) throw new Error("MCP 地址不能包含片段标识");
  }
  const a = Object.fromEntries(
    Object.entries(e.headers || {}).map(([i, s]) => {
      const l = n(s);
      if (/[\r\n]/.test(i + l)) throw new Error("请求头不能包含换行");
      return [i, l];
    })
  );
  return {
    ...e,
    url: r,
    command: n(e.command || ""),
    args: (e.args || []).map((i) => n(i)),
    cwd: n(e.cwd || ""),
    headers: a,
    env: Object.fromEntries(
      Object.entries(e.env || {}).map(([i, s]) => [
        i,
        n(s)
      ])
    )
  };
}
function Hc(e, t = Date.now, n = 6e4) {
  const r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
  function s(l, o, d) {
    const c = a.get(l);
    if (c)
      return !o || c.refresh ? c.promise : c.promise.then(
        () => s(l, !0, d),
        () => s(l, !0, d)
      );
    let u = !1;
    const m = Promise.resolve().then(async () => {
      const p = await e(l, o);
      if (!p.ok)
        throw new Error(`OSS fetch failed (${p.status}): ${l}`);
      const b = await p.text(), g = JSON.parse(b), f = r.get(l);
      if (r.set(l, { value: g, text: b, at: t() }), u = !o && p.headers.get("X-QwenPaw-Cache") === "stale", d && (f == null ? void 0 : f.text) !== b)
        for (const h of i) h();
      return g;
    }).catch((p) => {
      const b = r.get(l);
      throw b && (b.at = t() - n + Math.min(15e3, n)), p;
    }).finally(() => {
      var p;
      ((p = a.get(l)) == null ? void 0 : p.promise) === m && a.delete(l), u && s(l, !0, !0).catch(() => {
      });
    });
    return a.set(l, { promise: m, refresh: o }), m;
  }
  return {
    get(l, o = !1) {
      const d = r.get(l);
      return d && !o ? (t() - d.at >= n && s(l, !0, !0).catch(() => {
      }), Promise.resolve(d.value)) : s(l, o, !1);
    },
    subscribe(l) {
      return i.add(l), () => {
        i.delete(l);
      };
    }
  };
}
const Fa = {
  BRAVE_API_KEY: {
    label: "Brave API Key",
    help: "在 Brave Search API 官网注册获取",
    link: "https://brave.com/search/api/",
    isSecret: !0
  },
  GITHUB_PERSONAL_ACCESS_TOKEN: {
    label: "GitHub Personal Access Token",
    help: "GitHub Settings → Developer settings → Personal access tokens",
    link: "https://github.com/settings/tokens",
    isSecret: !0
  },
  GITLAB_PERSONAL_ACCESS_TOKEN: {
    label: "GitLab Personal Access Token",
    help: "GitLab User Settings → Access Tokens",
    link: "https://gitlab.com/-/user_settings/personal_access_tokens",
    isSecret: !0
  },
  GITLAB_API_URL: {
    label: "GitLab API URL",
    help: "默认为 https://gitlab.com/api/v4，自建实例请修改",
    isSecret: !1
  },
  EVERART_API_KEY: {
    label: "EverArt API Key",
    help: "在 EverArt 官网获取 API Key",
    link: "https://everart.ai/",
    isSecret: !0
  },
  SLACK_BOT_TOKEN: {
    label: "Slack Bot Token",
    help: "以 xoxb- 开头，在 Slack App 设置中获取",
    link: "https://api.slack.com/apps",
    isSecret: !0
  },
  SLACK_TEAM_ID: {
    label: "Slack Team ID",
    help: "在 Slack 工作区设置中查看 Team ID",
    isSecret: !1
  },
  POSTGRES_CONNECTION_STRING: {
    label: "PostgreSQL 连接串",
    help: "格式: postgresql://user:password@host:port/dbname",
    isSecret: !0
  }
}, Pn = "ugsci.market.githubSources", Ga = "https://github.com/anthropics/skills/tree/main/skills", ss = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Uc = `${ss}/skills`;
function jc(e) {
  const t = e.replace(/^\/+/, "");
  return Ai(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function gn(e, t = !1) {
  const n = e.replace(/^\/+/, "");
  return ct(
    `/plugins/oss-proxy?path=${encodeURIComponent(n)}${t ? "&refresh=true" : ""}`,
    { cache: t ? "no-store" : "no-cache" }
  );
}
const os = Hc(gn), Dc = os.subscribe;
async function qr(e, t = !1) {
  const n = e.replace(/^\/+/, "");
  if (/^(skills|mcp|agents)\/manifest\.json$/.test(n))
    return os.get(n, t);
  const r = await gn(n, t);
  if (!r.ok)
    throw new Error(`OSS fetch failed (${r.status}): ${n}`);
  return await r.json();
}
function Ut(e) {
  return {
    domain: "领域",
    research: "科研与文献",
    workflow: "工作流",
    computation: "计算与数据",
    integration: "集成与工具",
    type: "类型",
    capability: "能力",
    tooling: "工具链"
  }[e] || e;
}
function qc(e) {
  var i, s, l, o;
  const t = {}, n = e.config || {};
  for (const d of /* @__PURE__ */ new Set([
    ...e.env || [],
    ...Nc(n)
  ]))
    t[d] = `your-${d.toLowerCase().replace(/_/g, "-")}`;
  for (const [d, c] of Object.entries(n.env || {}))
    t[d] || (t[d] = c);
  let r = "🔌";
  const a = (e.icon || "").toLowerCase();
  return a.includes("folder") ? r = "📁" : a.includes("git") ? r = "🌿" : a.includes("github") ? r = "🐙" : a.includes("database") || a.includes("postgres") || a.includes("sqlite") ? r = "🗄️" : a.includes("search") || a.includes("brave") ? r = "🔍" : a.includes("browser") || a.includes("puppeteer") ? r = "🎭" : a.includes("memory") || a.includes("brain") ? r = "🧠" : a.includes("file") || a.includes("fetch") ? r = "🌐" : a.includes("slack") ? r = "💬" : a.includes("google") ? r = "📁" : a.includes("notion") ? r = "📝" : a.includes("jupyter") ? r = "📊" : a.includes("science") || a.includes("flask") ? r = "🔬" : a.includes("book") || a.includes("arxiv") ? r = "📚" : a.includes("patent") && (r = "📜"), {
    id: e.id,
    name: e.name,
    emoji: r,
    iconUrl: e.icon_url ? jc(e.icon_url) : void 0,
    category: e.category ? Ut(e.category) : "",
    description: e.description,
    transport: Oc(
      e.transport || n.transport || n.type,
      !!n.url
    ),
    url: n.url,
    headers: n.headers,
    cwd: n.cwd,
    source: e.source,
    authType: (i = e.auth) == null ? void 0 : i.type,
    setupUrl: (s = e.auth) == null ? void 0 : s.setup_url,
    availability: e.availability,
    requirements: e.requirements,
    limitations: e.limitations,
    inputHints: e.input_hints,
    command: ((l = e.config) == null ? void 0 : l.command) || "",
    args: ((o = e.config) == null ? void 0 : o.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ls = "ugsci.market.mcpSources", cs = "ugsci.market.expertSources";
function ds(e, t) {
  try {
    const n = localStorage.getItem(e);
    if (!n) return [];
    const r = JSON.parse(n);
    return Array.isArray(r) ? r.filter(
      (a) => a && typeof a.id == "string" && typeof a.label == "string" && typeof a.url == "string"
    ).map((a) => ({
      id: a.id,
      label: a.label,
      url: a.url,
      enabled: a.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function us(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Vc() {
  return ds(ls, "mcp");
}
function _n(e) {
  us(ls, e);
}
function Fc() {
  return ds(cs, "expert");
}
function Cn(e) {
  us(cs, e);
}
function ms(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase();
    let r;
    if (n === "github.com" || n === "www.github.com")
      r = "github";
    else if (n === "gitee.com" || n === "www.gitee.com")
      r = "gitee";
    else
      return null;
    const a = t.pathname.split("/").filter((d) => d.length > 0);
    if (a.length < 2) return null;
    const i = decodeURIComponent(a[0]), s = decodeURIComponent(a[1]);
    let l = "main", o = "";
    return a.length >= 4 && (a[2] === "tree" || a[2] === "blob") ? (l = decodeURIComponent(a[3]), a.length > 4 && (o = a.slice(4).map(decodeURIComponent).join("/"))) : a.length > 2 && (o = a.slice(2).map(decodeURIComponent).join("/")), o = o.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: i,
      repo: s,
      ref: l || "main",
      skillsPath: o,
      label: `${i}/${s}`,
      platform: r
    };
  } catch {
    return null;
  }
}
function ps(e, t, n, r = "github") {
  return r === "oss" ? `oss:${e}/${n || "/"}` : `${r}:${e}/${t}:${n || "/"}`;
}
function Gc(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase(), r = n.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!r) return null;
    const a = r[1], i = `${t.protocol}//${n}`, s = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return s ? {
      endpoint: i,
      prefix: s,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function Wc() {
  try {
    const e = localStorage.getItem(Pn);
    if (!e) {
      const r = [], a = ms(Ga);
      return a && r.push({
        id: ps(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: Ga,
        label: a.label,
        owner: a.owner,
        repo: a.repo,
        ref: a.ref,
        skillsPath: a.skillsPath,
        enabled: !1,
        platform: a.platform
      }), localStorage.setItem(Pn, JSON.stringify(r)), r;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const n = t.filter(
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === Uc)
    ).map((r) => ({
      ...r,
      platform: r.platform || "github",
      owner: r.owner || "",
      repo: r.repo || "",
      ref: r.ref || "",
      skillsPath: r.skillsPath || ""
    }));
    return n.length !== t.length && localStorage.setItem(Pn, JSON.stringify(n)), n;
  } catch {
    return [];
  }
}
function Tn(e) {
  try {
    localStorage.setItem(Pn, JSON.stringify(e));
  } catch {
  }
}
function Zc(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const n = t[1], r = {}, a = n.split(`
`);
  let i = "";
  for (const s of a) {
    const l = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (l) {
      i = l[1];
      let o = l[2].trim();
      (o.startsWith('"') && o.endsWith('"') || o.startsWith("'") && o.endsWith("'")) && (o = o.slice(1, -1)), i === "name" ? r.name = o : i === "description" ? r.description = o : i === "version" ? r.version = o : i === "author" && (r.author = o);
    }
  }
  return r;
}
async function Jc(e) {
  const t = e.platform === "gitee", n = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", r = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${n}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${n}?ref=${encodeURIComponent(e.ref)}`, a = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (a.Authorization = `token ${e.accessToken}`);
  const i = await fetch(r, {
    headers: a
  });
  if (!i.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${i.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const s = await i.json();
  if (!Array.isArray(s)) return [];
  const l = s.filter((d) => d.type === "dir" && d.name);
  return await Promise.all(
    l.map(async (d) => {
      const c = e.skillsPath ? e.skillsPath + "/" : "", u = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${c}${d.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${c}${d.name}/SKILL.md`, m = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${c}${d.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${c}${d.name}`, p = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: d.name,
        description: "",
        source_url: m,
        html_url: m,
        version: null,
        author: null
      };
      try {
        const b = {};
        t && e.accessToken && (b.Authorization = `token ${e.accessToken}`);
        const g = await fetch(u, {
          headers: b
        });
        if (!g.ok) return p;
        const f = await g.text(), h = Zc(f);
        return {
          ...p,
          name: h.name || d.name,
          description: h.description || "",
          version: h.version || null,
          author: h.author || null
        };
      } catch {
        return p;
      }
    })
  );
}
async function Qc(e) {
  const t = Gc(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: n, prefix: r } = t, a = r.split("/").map(encodeURIComponent).join("/"), i = await gn(`${a}/manifest.json`);
  if (!i.ok)
    throw new Error(`无法获取技能列表: manifest.json (${i.status})`);
  const s = await i.json(), l = [];
  if (s && s.tag_groups && typeof s.tag_groups == "object")
    for (const [c, u] of Object.entries(s.tag_groups))
      Array.isArray(u) && l.push({
        id: c,
        label: Ut(c),
        tags: u
      });
  const o = [];
  function d(c, u) {
    for (const m of c) {
      if (m.type === "collection" && Array.isArray(m.children)) {
        d(m.children, m.name);
        continue;
      }
      const p = m.path || m.name || "";
      if (!p) continue;
      const b = p.split("/").map(encodeURIComponent).join("/"), g = `${n}/${a}/${b}`;
      let f = null;
      if (m.metadata) {
        const y = m.metadata.match(/version:\s*"?([\d.]+)"?/);
        y && (f = y[1]);
      }
      const h = u ? `${e.label}/${u}` : e.label;
      o.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: h,
        name: m.name || p.split("/").pop() || p,
        description: m.description || "",
        source_url: g,
        html_url: g,
        version: f,
        author: null,
        tag: m.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(s) ? d(
    s.map(
      (c) => typeof c == "string" ? { name: c, path: c } : c
    )
  ) : s && Array.isArray(s.skills) && d(s.skills), o.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: o, categories: l };
}
async function Kc(e = !1) {
  const t = await qr("mcp/manifest.json", e), n = [], r = {};
  if (t.tag_groups && typeof t.tag_groups == "object")
    for (const [i, s] of Object.entries(t.tag_groups))
      Array.isArray(s) && (r[i] = s, n.push({
        id: i,
        label: Ut(i),
        tags: s
      }));
  return { servers: (t.servers || []).map((i) => {
    var o, d, c;
    let s = "";
    const l = i.tags || [];
    for (const [u, m] of Object.entries(r))
      if (m.some((p) => l.includes(p))) {
        s = u;
        break;
      }
    return {
      id: i.id || i.name,
      name: i.name || i.id,
      description: i.description || "",
      tags: l,
      transport: i.transport || ((o = i.config) == null ? void 0 : o.transport) || ((d = i.config) == null ? void 0 : d.type) || ((c = i.config) != null && c.url ? "streamable_http" : "stdio"),
      input_hints: i.input_hints,
      requirements: i.requirements,
      limitations: i.limitations,
      auth: i.auth,
      availability: i.availability,
      config: i.config,
      env: Array.isArray(i.env) ? i.env : void 0,
      source: i.source,
      icon: i.icon,
      icon_url: i.icon_url || i.icon_path || void 0,
      category: s
    };
  }), categories: n };
}
async function Xc(e = !1) {
  const t = await qr("skills/manifest.json", e), n = [], r = /* @__PURE__ */ new Set();
  function a(i, s) {
    for (const l of i) {
      if ((l == null ? void 0 : l.type) === "collection" && Array.isArray(l.children)) {
        a(l.children, l.name || s);
        continue;
      }
      const o = String((l == null ? void 0 : l.path) || (l == null ? void 0 : l.name) || "").trim();
      if (!o) continue;
      const d = o.split("/").map(encodeURIComponent).join("/"), c = `${ss}/skills/${d}`, u = typeof l.tag == "string" && l.tag.trim() ? l.tag.trim() : void 0;
      u && r.add(u);
      let m = null;
      if (typeof l.metadata == "string") {
        const p = l.metadata.match(/version:\s*"?([\d.]+)"?/);
        p && (m = p[1]);
      }
      n.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: s ? `UGSci/${s}` : "UGSci",
        name: l.name || o.split("/").pop() || o,
        description: l.description || "",
        source_url: c,
        html_url: c,
        version: m,
        author: null,
        tag: u,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(t) ? a(
    t.map(
      (i) => typeof i == "string" ? { name: i, path: i } : i
    )
  ) : t && Array.isArray(t.skills) && a(t.skills), n.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: n,
    categories: Array.from(r).map((i) => ({
      id: i,
      label: i
    }))
  };
}
async function gs(e = !1) {
  const t = await qr("agents/manifest.json", e), n = [], r = {};
  if (t.tag_groups && typeof t.tag_groups == "object")
    for (const [i, s] of Object.entries(t.tag_groups))
      Array.isArray(s) && (r[i] = s, n.push({
        id: i,
        label: Ut(i),
        tags: s
      }));
  return { agents: (t.agents || []).map((i) => {
    let s = "";
    const l = i.tags || [];
    for (const [o, d] of Object.entries(r))
      if (d.some((c) => l.includes(c))) {
        s = o;
        break;
      }
    return {
      id: i.id || i.name,
      name: i.name || i.id,
      description: i.description || "",
      path: i.path || "",
      tags: l,
      config: i.config,
      instructions: i.instructions,
      skills_manifest: i.skills_manifest,
      package_manifest: i.package_manifest,
      drivers: i.drivers,
      category: s
    };
  }), categories: n };
}
async function Yc(e) {
  const t = e.filter((s) => s.enabled), n = await Promise.all(
    t.map(async (s) => {
      try {
        if (s.platform === "oss") {
          const { skills: l, categories: o } = await Qc(s);
          return {
            skills: l,
            categories: o,
            error: null,
            label: s.label
          };
        } else
          return {
            skills: await Jc(s),
            categories: [],
            error: null,
            label: s.label
          };
      } catch (l) {
        return {
          skills: [],
          categories: [],
          error: l.message || String(l),
          label: s.label
        };
      }
    })
  ), r = [], a = [], i = [];
  for (const s of n)
    r.push(...s.skills), a.push(...s.categories), s.error && i.push({ label: s.label, message: s.error });
  return { skills: r, errors: i, categories: a };
}
function ed({
  open: e,
  onClose: t,
  sources: n,
  onChange: r
}) {
  const a = z().React, { useState: i } = a, {
    Modal: s,
    Input: l,
    Button: o,
    List: d,
    Tag: c,
    Switch: u,
    Typography: m,
    Tooltip: p,
    message: b
  } = z().antd, { PlusOutlined: g, DeleteOutlined: f, LinkOutlined: h, GithubOutlined: y } = z().antdIcons || {}, { Text: E } = m, [v, S] = i(""), [B, N] = i(""), w = () => {
    const _ = v.trim();
    if (!_) return;
    const T = ms(_);
    if (!T) {
      b.error(
        "无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接"
      );
      return;
    }
    const $ = ps(
      T.owner,
      T.repo,
      T.skillsPath,
      T.platform
    );
    if (n.some((I) => I.id === $)) {
      b.warning("该源已存在");
      return;
    }
    const F = {
      id: $,
      url: _,
      label: T.label,
      owner: T.owner,
      repo: T.repo,
      ref: T.ref,
      skillsPath: T.skillsPath,
      enabled: !0,
      platform: T.platform,
      accessToken: B.trim() || void 0
    }, C = [...n, F];
    Tn(C), r(C), S(""), N(""), b.success(`已添加源: ${T.label}`);
  }, x = (_, T) => {
    const $ = n.map((F) => F.id === _ ? { ...F, enabled: T } : F);
    Tn($), r($);
  }, R = (_, T) => {
    const $ = n.map(
      (F) => F.id === _ ? { ...F, accessToken: T.trim() || void 0 } : F
    );
    Tn($), r($);
  }, H = (_) => {
    const T = n.filter(($) => $.id !== _);
    Tn(T), r(T), b.success("已移除源");
  };
  return a.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        y ? a.createElement(y, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, "配置技能源")
      ),
      footer: a.createElement(o, { onClick: t }, "关闭"),
      width: 640
    },
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        E,
        {
          type: "secondary",
          style: { fontSize: 12, display: "block", marginBottom: 8 }
        },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(l, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: v,
          onChange: (_) => S(_.target.value),
          onPressEnter: w,
          prefix: h ? a.createElement(h) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          o,
          {
            type: "primary",
            icon: g ? a.createElement(g) : void 0,
            onClick: w
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      v.trim() && v.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        {
          style: {
            marginTop: 8,
            display: "flex",
            gap: 8,
            alignItems: "center"
          }
        },
        a.createElement(
          E,
          {
            type: "secondary",
            style: { fontSize: 12, whiteSpace: "nowrap" }
          },
          "Gitee Token:"
        ),
        a.createElement(l.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: B,
          onChange: (_) => N(_.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    a.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      a.createElement(
        E,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    a.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (_) => a.createElement(
        d.Item,
        {
          actions: [
            a.createElement(
              p,
              { title: _.enabled ? "点击禁用" : "点击启用" },
              a.createElement(u, {
                size: "small",
                checked: _.enabled,
                onChange: (T) => x(_.id, T)
              })
            ),
            a.createElement(
              p,
              { title: "移除此源" },
              a.createElement(o, {
                size: "small",
                type: "text",
                danger: !0,
                icon: f ? a.createElement(f) : void 0,
                onClick: () => H(_.id)
              })
            )
          ]
        },
        a.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            a.createElement(
              c,
              {
                color: _.platform === "gitee" ? "orange" : _.platform === "oss" ? "green" : "blue",
                style: { fontSize: 11 }
              },
              _.platform === "gitee" ? "Gitee" : _.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              c,
              { style: { fontSize: 11 } },
              _.label
            ),
            _.skillsPath ? a.createElement(
              E,
              { type: "secondary", style: { fontSize: 11 } },
              `/${_.skillsPath}`
            ) : null,
            _.platform !== "oss" ? a.createElement(
              E,
              { type: "secondary", style: { fontSize: 11 } },
              `@${_.ref}`
            ) : null
          ),
          a.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            _.url
          ),
          // Gitee token input for existing Gitee sources
          _.platform === "gitee" ? a.createElement(
            "div",
            {
              style: {
                marginTop: 6,
                display: "flex",
                gap: 6,
                alignItems: "center"
              }
            },
            a.createElement(
              E,
              {
                type: "secondary",
                style: { fontSize: 11, whiteSpace: "nowrap" }
              },
              "Token:"
            ),
            a.createElement(l.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: _.accessToken || "",
              onChange: (T) => R(_.id, T.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Wa({
  open: e,
  onClose: t,
  sources: n,
  onChange: r,
  type: a
}) {
  const i = z().React, { useState: s } = i, {
    Modal: l,
    Input: o,
    Button: d,
    List: c,
    Tag: u,
    Switch: m,
    Typography: p,
    Tooltip: b,
    message: g
  } = z().antd, {
    PlusOutlined: f,
    DeleteOutlined: h,
    LinkOutlined: y,
    ApiOutlined: E,
    UserOutlined: v,
    ImportOutlined: S,
    ExportOutlined: B,
    CopyOutlined: N
  } = z().antdIcons || {}, { Text: w } = p, [x, R] = s(""), [H, _] = s(""), [T, $] = s(""), [F, C] = s(!1), I = a === "mcp" ? "MCP" : "专家模板", L = a === "mcp" ? E ? i.createElement(E, { style: { fontSize: 18 } }) : null : v ? i.createElement(v, { style: { fontSize: 18 } }) : null, M = () => {
    const Q = x.trim(), D = H.trim();
    if (!Q) return;
    const Y = D || Q.slice(0, 40), ne = `${a}:${Q}`;
    if (n.some((X) => X.id === ne)) {
      g.warning("该源已存在");
      return;
    }
    const re = {
      id: ne,
      label: Y,
      url: Q,
      enabled: !0,
      type: a
    }, se = [...n, re];
    a === "mcp" ? _n(se) : Cn(se), r(se), R(""), _(""), g.success(`已添加${I}源: ${Y}`);
  }, P = (Q, D) => {
    const Y = n.map((ne) => ne.id === Q ? { ...ne, enabled: D } : ne);
    a === "mcp" ? _n(Y) : Cn(Y), r(Y);
  }, W = (Q) => {
    const D = n.filter((Y) => Y.id !== Q);
    a === "mcp" ? _n(D) : Cn(D), r(D), g.success("已移除源");
  }, G = () => {
    const Q = JSON.stringify({ type: a, sources: n }, null, 2);
    try {
      navigator.clipboard.writeText(Q), g.success(`${I}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const D = document.createElement("textarea");
      D.value = Q, document.body.appendChild(D), D.select(), document.execCommand("copy"), document.body.removeChild(D), g.success(`${I}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, U = () => {
    const Q = T.trim();
    if (!Q) {
      g.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const D = JSON.parse(Q);
      let Y = [];
      if (Array.isArray(D))
        Y = D;
      else if (D && Array.isArray(D.sources))
        Y = D.sources;
      else if (D && typeof D == "object")
        Y = [D];
      else
        throw new Error("Invalid format");
      const ne = Y.filter(
        (pe) => pe && typeof pe.url == "string" && typeof pe.label == "string"
      );
      if (ne.length === 0) {
        g.error("未找到有效的源数据");
        return;
      }
      const re = new Set(n.map((pe) => pe.id)), se = [];
      for (const pe of ne) {
        const ye = pe.id || `${a}:${pe.url}`;
        re.has(ye) || se.push({
          id: ye,
          label: pe.label,
          url: pe.url,
          enabled: pe.enabled !== !1,
          type: a
        });
      }
      if (se.length === 0) {
        g.info("所有源均已存在，无新增");
        return;
      }
      const X = [...n, ...se];
      a === "mcp" ? _n(X) : Cn(X), r(X), $(""), C(!1), g.success(`成功导入 ${se.length} 个${I}源`);
    } catch (D) {
      g.error(`JSON 解析失败: ${D.message || "格式错误"}`);
    }
  };
  return i.createElement(
    l,
    {
      open: e,
      onCancel: t,
      title: i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        L,
        i.createElement("span", null, `配置${I}源`)
      ),
      footer: i.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        i.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          i.createElement(
            d,
            {
              icon: B ? i.createElement(B) : void 0,
              onClick: G,
              disabled: n.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          i.createElement(
            d,
            {
              icon: S ? i.createElement(S) : void 0,
              onClick: () => C(!F),
              size: "small"
            },
            F ? "隐藏导入" : "导入JSON"
          )
        ),
        i.createElement(d, { onClick: t }, "关闭")
      ),
      width: 680
    },
    // Description
    i.createElement(
      w,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 12 }
      },
      `配置${I}源地址，支持从远程仓库或团队共享的 JSON 导入${I}配置。`
    ),
    // Import section (collapsible)
    F ? i.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: 12,
          background: "var(--app-fill-faint, #fafafa)",
          borderRadius: 8,
          border: "1px solid #f0f0f0"
        }
      },
      i.createElement(
        w,
        {
          strong: !0,
          style: { fontSize: 12, display: "block", marginBottom: 8 }
        },
        `粘贴${I}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      i.createElement(o.TextArea, {
        placeholder: a === "mcp" ? `{
  "type": "mcp",
  "sources": [
    { "label": "团队MCP", "url": "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" }
  ]
}` : `{
  "type": "expert",
  "sources": [
    { "label": "团队专家库", "url": "https://raw.githubusercontent.com/team/expert-registry/main/experts.json" }
  ]
}`,
        value: T,
        onChange: (Q) => $(Q.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      i.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        i.createElement(
          d,
          {
            type: "primary",
            size: "small",
            onClick: U
          },
          "导入"
        ),
        i.createElement(
          d,
          {
            size: "small",
            onClick: () => $("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    i.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      i.createElement(o, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: H,
        onChange: (Q) => _(Q.target.value),
        style: { width: 200 }
      }),
      i.createElement(o, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: x,
        onChange: (Q) => R(Q.target.value),
        onPressEnter: M,
        prefix: y ? i.createElement(y) : void 0,
        style: { flex: 1 }
      }),
      i.createElement(
        d,
        {
          type: "primary",
          icon: f ? i.createElement(f) : void 0,
          onClick: M
        },
        "添加"
      )
    ),
    // Source list
    i.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      i.createElement(
        w,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    i.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (Q) => i.createElement(
        c.Item,
        {
          actions: [
            i.createElement(
              b,
              { title: Q.enabled ? "点击禁用" : "点击启用" },
              i.createElement(m, {
                size: "small",
                checked: Q.enabled,
                onChange: (D) => P(Q.id, D)
              })
            ),
            i.createElement(
              b,
              { title: "移除此源" },
              i.createElement(d, {
                size: "small",
                type: "text",
                danger: !0,
                icon: h ? i.createElement(h) : void 0,
                onClick: () => W(Q.id)
              })
            )
          ]
        },
        i.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          i.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            i.createElement(
              u,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              Q.label
            ),
            Q.enabled ? null : i.createElement(
              u,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          i.createElement(
            w,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            Q.url
          )
        )
      )
    }),
    // Share hint
    i.createElement(
      "div",
      {
        style: {
          marginTop: 12,
          padding: "8px 12px",
          background: "var(--app-info-bg)",
          borderRadius: 6,
          fontSize: 12,
          color: "var(--app-action-link)"
        }
      },
      i.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
function td({
  template: e,
  agentId: t,
  agentName: n,
  existing: r,
  onSaved: a,
  onConnected: i,
  onClose: s
}) {
  var oe;
  const { React: l, antd: o, openExternalLink: d } = z(), { useState: c, useRef: u, useEffect: m } = l, { Modal: p, Button: b, Input: g, Alert: f, Tag: h } = o, y = l.createElement, E = e.authType === "oauth2", v = Object.entries(e.env || {}).filter(
    ([, te]) => te.startsWith("your-") || te.includes("${")
  ), [S, B] = c({}), [N, w] = c(r), [x, R] = c(r ? "saved" : "config"), [H, _] = c(""), [T, $] = c(""), [F, C] = c(""), [I, L] = c(!1), [M, P] = c(""), [W, G] = c(""), [U, Q] = c(0), D = u(!0), Y = u(0), ne = u(""), re = { "Content-Type": "application/json", "X-Agent-Id": t }, se = encodeURIComponent(e.id), X = (te, le = {}) => he(te, {
    ...le,
    headers: re,
    cache: "no-store",
    bypassCache: !0
  }), pe = (te) => te ? X(
    `/mcp/oauth/session/${se}?session_id=${encodeURIComponent(te)}`,
    { method: "DELETE" }
  ).then(
    () => !0,
    () => !1
  ) : Promise.resolve(!0);
  m(() => (D.current = !0, () => {
    D.current = !1, Y.current += 1, pe(ne.current);
  }), []);
  const ye = (te) => D.current && Y.current === te, q = (te) => {
    const le = wt(te);
    if (!le)
      throw new Error("授权服务返回的登录地址无效，请联系服务提供方。");
    d ? d(le) : window.open(le, "_blank", "noopener,noreferrer");
  }, j = async (te, le = ++Y.current) => {
    _(""), R("checking");
    try {
      if (E) {
        const O = await X(
          `/mcp/oauth/status/${se}`
        );
        if (!ye(le)) return;
        if (!O.authorized) {
          R("saved"), _("账号尚未授权或授权已过期，请点击登录授权。");
          return;
        }
      }
      const Z = await X(`/mcp/${se}`, {
        method: "PUT",
        body: JSON.stringify({ enabled: !0 })
      });
      if (!ye(le)) return;
      w({ ...te, ...Z, enabled: !0 }), a({ ...te, ...Z, enabled: !0 });
      const A = await X(`/mcp/tools/${se}`);
      if (!ye(le)) return;
      if (!Array.isArray(A) || A.length === 0) {
        _(
          "配置已启用，但服务尚未返回可用工具。可稍后重新检测，或检查账号权限和服务接入要求。"
        ), R("error");
        return;
      }
      Q(A.length), R("connected"), i();
    } catch {
      if (!ye(le)) return;
      R("error"), _(
        E ? "账号授权后，工具连接检测未通过。请检查网络或服务账号权限后重试；授权失效可重新登录。" : "配置已保存，工具连接检测未通过。请检查网络、密钥权限或本地运行环境后重试。"
      );
    }
  }, ge = async (te, le = ++Y.current) => {
    R("starting"), _(""), $("");
    const Z = ne.current;
    if (ne.current = "", C(""), await pe(Z), !!ye(le))
      try {
        const A = await X(
          `/mcp/oauth/start/${se}`,
          {
            // The backend uses the saved endpoint, including securely stored URL credentials.
            method: "POST",
            body: JSON.stringify({
              url: "",
              client_id: M.trim(),
              scope: W.trim()
            })
          }
        );
        if (!ye(le)) {
          pe(A.session_id);
          return;
        }
        if (!A.session_id || !wt(A.auth_url))
          throw new Error("Invalid authorization response");
        ne.current = A.session_id, C(A.session_id), $(A.auth_url), R("waiting"), q(A.auth_url);
      } catch {
        if (!ye(le)) return;
        R("error"), _(
          "无法发起登录授权。请确认服务支持标准 MCP OAuth；若服务要求预先注册客户端，可在高级设置填写客户端 ID，或查看服务接入说明后重试。"
        );
      }
  };
  m(() => {
    if (x !== "waiting" || !F || !N) return;
    const te = Y.current;
    let le = !1, Z = !1, A, O = 0;
    const K = Date.now() + 5 * 6e4, V = async () => {
      if (!(le || Z || !ye(te))) {
        if (clearTimeout(A), Date.now() >= K) {
          pe(F), R("error"), _("等待授权超时。配置已保留，请重新登录授权。");
          return;
        }
        Z = !0;
        try {
          const fe = await X(
            `/mcp/oauth/status/${se}?session_id=${encodeURIComponent(
              F
            )}`
          );
          if (le || !ye(te)) return;
          if (O = 0, fe.authorized && fe.phase === "authorized") {
            ne.current = "", C(""), j(N, te);
            return;
          }
          if (["denied", "failed", "cancelled", "expired"].includes(
            fe.phase || ""
          )) {
            R("error"), _(
              fe.phase === "denied" ? "授权未获同意。你可以重新登录并选择允许的权限。" : "本次授权未完成或已失效，配置已保留，可重新登录授权。"
            );
            return;
          }
        } catch {
          if (++O >= 3 && !le && ye(te)) {
            R("error"), _("暂时无法查询授权状态，请检查网络后重试。");
            return;
          }
        } finally {
          Z = !1;
        }
        !le && ye(te) && (A = setTimeout(V, 2e3));
      }
    };
    return V(), window.addEventListener("focus", V), () => {
      le = !0, clearTimeout(A), window.removeEventListener("focus", V);
    };
  }, [x, F, N]);
  const we = async () => {
    const te = v.filter(([A]) => {
      var O;
      return !((O = S[A]) != null && O.trim());
    });
    if (te.length) {
      _(
        `请填写：${te.map(
          ([A]) => {
            var O, K;
            return ((K = ((O = e.inputHints) == null ? void 0 : O[A]) || Fa[A]) == null ? void 0 : K.label) || A;
          }
        ).join("、")}`
      );
      return;
    }
    let le;
    try {
      le = Bc(
        {
          url: e.url,
          command: e.command,
          args: e.args,
          headers: e.headers,
          cwd: e.cwd,
          env: { ...e.env, ...S }
        },
        S
      );
    } catch (A) {
      _(A instanceof Error ? A.message : "请检查连接配置");
      return;
    }
    const Z = ++Y.current;
    R("saving"), _("");
    try {
      const A = {
        name: e.name,
        description: e.description,
        enabled: !E,
        transport: e.transport,
        ...le
      }, O = N ? await X(`/mcp/${se}`, {
        method: "PUT",
        body: JSON.stringify(A)
      }) : await jr(t, {
        client_key: e.id,
        client: A
      });
      if (!ye(Z)) return;
      const K = { ...O, key: e.id, enabled: !E };
      w(K), B({}), a(K), E ? await ge(K, Z) : await j(K, Z);
    } catch {
      if (!ye(Z)) return;
      R("config"), _(
        "配置未能保存，请检查服务配置或是否已有同名连接后重试。填写内容暂时保留在此窗口。"
      );
    }
  }, ve = async () => {
    Y.current += 1, R("saved"), _("已取消本次授权等待，配置已保留。尚未完成授权的连接保持未启用。"), !await pe(ne.current) && D.current && _(
      "已停止等待，但暂时无法取消服务端授权流程。请关闭授权网页；连接不会在此窗口自动启用。"
    ), ne.current = "", C(""), $("");
  }, ue = ["saving", "starting", "waiting", "checking"].includes(x), Se = wt(e.source), xe = wt(e.setupUrl), Ie = x === "connected" ? `已连接 · 已读取 ${U} 个工具` : x === "waiting" ? "等待浏览器登录授权" : x === "starting" ? "正在准备安全登录" : x === "checking" ? "正在检测可用工具" : x === "saving" ? "正在保存连接配置" : N ? E ? "已保存 · 账号授权与连接待确认" : "已保存 · 连接待检测" : "填写接入信息", _e = [
    y(
      b,
      { key: "close", onClick: s },
      ue ? "关闭并停止等待" : "关闭"
    )
  ];
  return x === "config" ? _e.push(
    y(
      b,
      { key: "save", type: "primary", onClick: we },
      N ? "更新凭证并连接" : "添加连接"
    )
  ) : x === "waiting" ? _e.push(
    y(b, { key: "cancel", onClick: ve }, "取消授权"),
    y(
      b,
      {
        key: "reopen",
        type: "primary",
        onClick: () => q(T)
      },
      "重新打开授权页"
    )
  ) : !ue && N && (v.length && _e.push(
    y(
      b,
      {
        key: "edit",
        onClick: () => {
          B({}), _(""), R("config");
        }
      },
      "更新凭证"
    )
  ), _e.push(
    y(
      b,
      { key: "check", onClick: () => j(N) },
      "重新检测"
    )
  ), E && _e.push(
    y(
      b,
      {
        key: "auth",
        type: "primary",
        onClick: () => ge()
      },
      "登录授权"
    )
  )), y(
    p,
    {
      title: `连接 ${e.name}`,
      open: !0,
      onCancel: s,
      footer: _e,
      width: 560,
      destroyOnClose: !0
    },
    y("p", { style: { color: "var(--app-card-muted)" } }, e.description),
    y("p", null, `目标专家：${n}`),
    y(h, { color: x === "connected" ? "green" : "blue" }, Ie),
    E ? y(f, {
      style: { margin: "12px 0" },
      type: "info",
      showIcon: !0,
      message: "在服务提供方页面登录并确认权限，返回这里自动完成连接检测。UGSci 不需要你的账号密码。"
    }) : null,
    H ? y(f, {
      role: "alert",
      style: { margin: "12px 0" },
      type: "warning",
      showIcon: !0,
      message: H
    }) : null,
    ...(e.requirements || []).map(
      (te, le) => y("p", { key: `req-${le}` }, te)
    ),
    xe ? y(
      "p",
      null,
      y(
        "a",
        {
          href: xe,
          target: "_blank",
          rel: "noopener noreferrer",
          onClick: d ? (te) => {
            te.preventDefault(), d(xe);
          } : void 0
        },
        "开通账号 / 获取授权信息 ↗"
      )
    ) : null,
    Se ? y(
      "a",
      {
        href: Se,
        target: "_blank",
        rel: "noopener noreferrer",
        onClick: d ? (te) => {
          te.preventDefault(), d(Se);
        } : void 0
      },
      "查看服务接入说明 ↗"
    ) : null,
    x === "config" ? y(
      "div",
      { style: { marginTop: 16 } },
      ...v.map(([te]) => {
        var O;
        const le = ((O = e.inputHints) == null ? void 0 : O[te]) || Fa[te], Z = wt(le == null ? void 0 : le.link), A = (le == null ? void 0 : le.label) || te;
        return y(
          "div",
          { key: te, style: { marginBottom: 16 } },
          y(
            "label",
            {
              htmlFor: `mcp-input-${te}`,
              style: { display: "block", marginBottom: 6 }
            },
            `${A}（必填）`
          ),
          le != null && le.help ? y(
            "p",
            { style: { fontSize: 12, margin: "4px 0" } },
            le.help
          ) : null,
          Z ? y(
            "a",
            {
              href: Z,
              target: "_blank",
              rel: "noopener noreferrer",
              onClick: d ? (K) => {
                K.preventDefault(), d(Z);
              } : void 0
            },
            "获取密钥 / 查看设置 ↗"
          ) : null,
          y((le == null ? void 0 : le.isSecret) === !1 ? g : g.Password, {
            id: `mcp-input-${te}`,
            placeholder: `请输入 ${A}`,
            value: S[te] || "",
            autoComplete: "off",
            onChange: (K) => B((V) => ({ ...V, [te]: K.target.value }))
          })
        );
      })
    ) : null,
    E ? y(
      "div",
      { style: { marginTop: 12 } },
      y(
        b,
        {
          type: "link",
          size: "small",
          disabled: ue,
          onClick: () => L(!I)
        },
        I ? "收起高级设置" : "高级设置（服务要求时填写）"
      ),
      I ? y(
        "div",
        null,
        y(g, {
          "aria-label": "OAuth 客户端 ID",
          placeholder: "客户端 ID（通常自动获取）",
          value: M,
          disabled: ue,
          onChange: (te) => P(te.target.value)
        }),
        y(g, {
          "aria-label": "OAuth 权限范围",
          placeholder: "权限范围（按服务文档填写，可留空）",
          value: W,
          disabled: ue,
          style: { marginTop: 8 },
          onChange: (te) => G(te.target.value)
        })
      ) : null
    ) : null,
    (oe = e.limitations) != null && oe.length ? y(
      "details",
      { style: { marginTop: 12 } },
      y("summary", null, "使用限制"),
      ...e.limitations.map((te, le) => y("p", { key: le }, te))
    ) : null
  );
}
function nd({
  open: e,
  onClose: t
}) {
  const { React: n, antd: r } = z(), a = n.createElement, { Modal: i, Input: s, Button: l, Alert: o, Checkbox: d, Radio: c, Space: u } = r, [m, p] = n.useState({
    id: "",
    name: "",
    version: "1.0.0",
    description: "",
    author: "",
    system_prompt: "",
    tags: "",
    recommended_skills: ""
  }), [b, g] = n.useState(""), [f, h] = n.useState("submission"), [y, E] = n.useState(null), [v, S] = n.useState(""), [B, N] = n.useState(!1), [w, x] = n.useState(""), [R, H] = n.useState(""), [_, T] = n.useState(null);
  n.useEffect(() => {
    if (!e) {
      g("");
      return;
    }
    let G = !0;
    return S(""), N(!1), T(null), H(""), E(null), he("/publisher/status").then((U) => {
      G && E(U);
    }).catch(() => {
      G && H("无法读取发布服务配置，请稍后重试");
    }), () => {
      G = !1;
    };
  }, [e]);
  const $ = {
    ...m,
    tags: m.tags.split(/[,，]/).map((G) => G.trim()).filter(Boolean),
    recommended_skills: m.recommended_skills.split(/[,，]/).map((G) => G.trim()).filter(Boolean)
  }, F = JSON.stringify({ expert: $, mode: f }), C = F + b, I = f === "release" ? y == null ? void 0 : y.direct_publish_configured : y == null ? void 0 : y.submission_configured, L = async (G) => {
    H(""), T(null), x(G);
    try {
      const U = await he(`/publisher/expert/${G}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-UGSci-Publisher-Token": b
        },
        body: F
      });
      G === "inspect" && S(C), T(U), U.status === "published" && gs(!0).catch(() => {
      });
    } catch (U) {
      S("");
      let Q = (U == null ? void 0 : U.message) || "提交失败，请重试";
      try {
        Q = JSON.parse(Q).detail || Q;
      } catch {
      }
      H(String(Q));
    } finally {
      x("");
    }
  }, M = async (G) => {
    if (G) {
      H(""), T(null), S(""), N(!1);
      try {
        if (G.size > 1024 * 1024) throw new Error("专家 JSON 不能超过 1 MB");
        const U = JSON.parse(await G.text()), Q = [
          "id",
          "name",
          "version",
          "description",
          "author",
          "system_prompt",
          "tags",
          "recommended_skills"
        ];
        if (!U || typeof U != "object" || Array.isArray(U) || Object.keys(U).some((D) => !Q.includes(D)))
          throw new Error(
            "仅支持公开专家模板字段；请移除记忆、知识文件、凭证和其他运行配置"
          );
        for (const D of Q)
          if (U[D] !== void 0 && (["tags", "recommended_skills"].includes(D) ? !Array.isArray(U[D]) || U[D].some((Y) => typeof Y != "string") : typeof U[D] != "string"))
            throw new Error(`字段 ${D} 格式无效`);
        p({
          id: U.id || "",
          name: U.name || "",
          version: U.version || "1.0.0",
          description: U.description || "",
          author: U.author || "",
          system_prompt: U.system_prompt || "",
          tags: (U.tags || []).join(", "),
          recommended_skills: (U.recommended_skills || []).join(", ")
        });
      } catch (U) {
        H((U == null ? void 0 : U.message) || "模板导入失败");
      }
    }
  }, P = () => {
    const G = {
      id: "yourname-expert",
      name: "公开专家",
      version: "1.0.0",
      description: "专家职责",
      author: "团队名",
      system_prompt: "填写可公开分享的专家提示词。",
      tags: ["科研"],
      recommended_skills: []
    }, U = URL.createObjectURL(
      new Blob([JSON.stringify(G, null, 2)], { type: "application/json" })
    ), Q = document.createElement("a");
    Q.href = U, Q.download = "ugsci-expert-template.json", Q.click(), setTimeout(() => URL.revokeObjectURL(U), 1e3);
  }, W = (G, U, Q, D = !1) => a(
    "label",
    { key: G, style: { display: "block", marginBottom: 12 } },
    a("div", { style: { marginBottom: 4 } }, U),
    a(D ? s.TextArea : s, {
      "aria-label": U,
      value: m[G],
      placeholder: Q,
      rows: G === "system_prompt" ? 7 : 2,
      onChange: (Y) => {
        p((ne) => ({ ...ne, [G]: Y.target.value })), T(null);
      }
    })
  );
  return a(
    i,
    {
      open: e,
      title: "发布 / 更新专家到 UGSci",
      width: 720,
      destroyOnHidden: !0,
      closable: !w,
      maskClosable: !w,
      onCancel: () => {
        w || (g(""), t());
      },
      footer: null
    },
    a(o, {
      type: "info",
      showIcon: !0,
      message: "编写可公开分享的专家模板",
      description: "填写公开提示词与推荐技能名称。此入口不读取本机专家的聊天、记忆、知识文件或账号配置。更新时保留 ID、提高版本号；投稿审核通过后市场可见。",
      style: { marginBottom: 16 }
    }),
    a(
      u,
      { style: { marginBottom: 16 }, wrap: !0 },
      a(
        "label",
        null,
        "导入专家 JSON ",
        a("input", {
          type: "file",
          accept: ".json,application/json",
          "aria-label": "导入专家 JSON",
          disabled: !!w,
          onChange: (G) => {
            var U;
            M((U = G.target.files) == null ? void 0 : U[0]), G.target.value = "";
          }
        })
      ),
      a(l, { onClick: P }, "下载空白模板")
    ),
    W(
      "id",
      "专家 ID",
      "例如 alice-reservoir，须以管理员分配的命名空间开头"
    ),
    a(
      "div",
      { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } },
      W("name", "专家名称", "公开显示的名称"),
      W("version", "版本号", "例如 1.0.0")
    ),
    W("description", "简介", "专家擅长什么", !0),
    W("author", "公开作者", "可使用团队名或笔名"),
    W(
      "system_prompt",
      "公开提示词",
      "填写专家职责、流程与输出要求；勿填写私人资料或密钥",
      !0
    ),
    W("tags", "标签", "科研, 油藏工程"),
    W(
      "recommended_skills",
      "推荐技能名称",
      "多个名称以逗号分隔，不上传技能文件"
    ),
    a(
      "label",
      null,
      "投稿凭证（仅本次使用）",
      a(s.Password, {
        "aria-label": "投稿凭证",
        value: b,
        autoComplete: "off",
        onChange: (G) => g(G.target.value),
        placeholder: "管理员分配的投稿凭证，无需 OSS AccessKey"
      })
    ),
    a(c.Group, {
      value: f,
      style: { margin: "12px 0" },
      onChange: (G) => {
        h(G.target.value), T(null);
      },
      options: [
        { label: "投稿待审核", value: "submission" },
        {
          label: "管理员发布",
          value: "release",
          disabled: !(y != null && y.direct_publish_configured)
        }
      ]
    }),
    a(
      "div",
      { style: { marginBottom: 12 } },
      a(
        d,
        {
          checked: B,
          onChange: (G) => N(G.target.checked)
        },
        "我确认以上内容可公开分享，不含私人数据或账号密钥"
      )
    ),
    y && !I && a(o, {
      type: "warning",
      message: "管理员尚未配置远端发布服务，当前无法上传 OSS。请联系管理员开通投稿服务。",
      style: { marginBottom: 12 }
    }),
    R && a(o, {
      type: "error",
      showIcon: !0,
      message: R,
      style: { marginBottom: 12 }
    }),
    _ && a(o, {
      showIcon: !0,
      type: _.status === "checked" ? "info" : "success",
      message: _.status === "checked" ? `服务端检查通过：${_.operation === "update" ? "更新现有专家" : "新增专家"}` : _.status === "published" ? "已发布，OSS 内容与目录已校验" : "已上传 OSS，等待管理员审核",
      description: a(
        "div",
        { style: { overflowWrap: "anywhere" } },
        a("div", null, `回执：${_.receipt_id}`),
        a("div", null, `SHA-256：${_.sha256}`)
      ),
      style: { marginBottom: 12 }
    }),
    a(
      u,
      null,
      a(
        l,
        {
          disabled: !!w || !I || !b.trim() || !m.id || !m.name || !m.system_prompt,
          loading: w === "inspect",
          onClick: () => L("inspect")
        },
        "检查归属与版本"
      ),
      a(
        l,
        {
          type: "primary",
          disabled: !!w || !I || !B || v !== C,
          loading: w === "publish",
          onClick: () => L("publish")
        },
        f === "release" ? "发布新版本" : "上传到 OSS 待审核"
      )
    ),
    w && a(
      "div",
      { role: "status", style: { marginTop: 12 } },
      w === "inspect" ? "正在校验身份、命名空间与版本…" : "正在写入 OSS 并核验回执，请稍候…"
    )
  );
}
const rd = {
  planned: "待安装",
  queued: "等待安装",
  downloading: "下载并校验专家包",
  preparing: "安装技能与运行依赖",
  verifying: "执行方法自检",
  activating: "登记专家",
  starting: "启动专家并检查方法工具",
  startup_failed: "已安装，启动检查未通过",
  ready: "基础能力已就绪",
  failed: "安装失败",
  interrupted: "安装已中断",
  cancelled: "安装已取消",
  removed: "专家已删除，可重新安装",
  repair_required: "运行环境需要修复",
  repairing: "准备新的运行环境",
  repair_verifying: "验证修复后的方法服务",
  repair_committing: "切换已验证的运行环境",
  repair_failed: "环境修复未完成",
  repaired: "运行环境已修复，可检查启动"
}, Za = /* @__PURE__ */ new Set([
  "queued",
  "downloading",
  "preparing",
  "verifying",
  "activating",
  "starting",
  "repairing",
  "repair_verifying",
  "repair_committing"
]), Ja = {
  model_required: "待选择对话模型",
  agent_disabled: "专家尚未启用",
  skills_required: "待补齐必需技能",
  service_unavailable: "方法服务尚未可用",
  tools_required: "待检查方法工具"
};
function ad({
  manifestPath: e,
  onClose: t
}) {
  var B, N;
  const { React: n, antd: r } = z(), { useEffect: a, useState: i } = n, { Alert: s, Button: l, Modal: o, Space: d, Spin: c } = r, u = (N = (B = z()).useNavigate) == null ? void 0 : N.call(B), [m, p] = i([]), [b, g] = i(null), [f, h] = i(""), [y, E] = i(!1);
  a(() => {
    let w = !0, x;
    async function R() {
      try {
        const H = await he(
          "/expert-packages/installations",
          { bypassCache: !0 }
        );
        w && Array.isArray(H) && p(H.filter((_) => _.status !== "planned"));
      } catch {
      }
      w && (x = setTimeout(R, 1500));
    }
    return R(), () => {
      w = !1, clearTimeout(x);
    };
  }, []), a(() => {
    let w = !0;
    return g(null), h(""), e && he("/expert-packages/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manifest_path: e })
    }).then((x) => {
      w && g(x);
    }).catch((x) => {
      w && h(
        x.message || "无法获取专家安装计划，请检查宿主版本和网络"
      );
    }), () => {
      w = !1;
    };
  }, [e]);
  async function v(w, x = !1) {
    E(!0), h("");
    try {
      const R = await he(
        `/expert-packages/installations/${w}${x ? "/repair" : ""}`,
        { method: "POST" }
      );
      p((H) => [...H.filter((_) => _.id !== w), R]), t();
    } catch (R) {
      h(R.message || (x ? "修复请求失败" : "安装请求失败"));
    } finally {
      E(!1);
    }
  }
  function S(w) {
    var _;
    if (![
      "startup_failed",
      "repair_required",
      "repair_failed",
      "repaired"
    ].includes(w.status))
      return null;
    const x = {
      models: { label: "选择对话模型", path: "/models" },
      experts: { label: "查看专家配置", path: "/ugsci-experts" },
      skills: {
        label: "检查必需技能",
        path: "/ugsci-tools-skills?tab=skills",
        scoped: !0
      },
      tools: {
        label: "检查方法服务",
        path: "/ugsci-tools-skills?tab=tools",
        scoped: !0
      }
    }, R = ((_ = w.problem) == null ? void 0 : _.action) || (["repair_required", "repair_failed", "repaired"].includes(w.status) ? "experts" : "");
    if (!Object.prototype.hasOwnProperty.call(x, R)) return null;
    const H = x[R];
    return n.createElement(
      l,
      {
        size: "small",
        disabled: y,
        onClick: () => {
          try {
            if (H.scoped) {
              const T = z();
              if (!w.agent_id || !T.setSelectedAgent)
                throw new Error("无法切换到此专家，请从专家中心打开对应配置");
              T.setSelectedAgent(w.agent_id);
            }
            u ? u(H.path) : window.location.assign(H.path);
          } catch (T) {
            h(T.message || "无法打开配置，请重试");
          }
        }
      },
      H.label
    );
  }
  return n.createElement(
    n.Fragment,
    null,
    ...m.map(
      (w) => {
        var x, R;
        return n.createElement(s, {
          key: w.id,
          style: { marginBottom: 8 },
          showIcon: !0,
          type: w.status === "ready" && w.runtime_verified === !0 ? "success" : w.status === "failed" || w.status === "startup_failed" ? "error" : "info",
          message: `${w.name || "专家包"} · ${w.operation === "repair" && w.status === "interrupted" ? "环境修复已中断，可重试" : w.operation === "repair" && w.status === "cancelled" ? "环境修复已取消" : w.status === "ready" && w.runtime_verified !== !0 ? "已安装，待启动检查" : w.status === "startup_failed" && Object.prototype.hasOwnProperty.call(
            Ja,
            ((x = w.problem) == null ? void 0 : x.code) || ""
          ) ? Ja[w.problem.code] : rd[w.status] || w.status}`,
          description: [
            w.error,
            ["repair_required", "repaired"].includes(w.status) ? "修复保留专家、设置和业务文件；运行中的专家请先停用，修复后不会自动启用。" : null,
            ...(w.optional_setup || []).map(
              (H) => `可选能力需另行配置：${H}`
            )
          ].filter(Boolean).join("；"),
          action: n.createElement(
            d,
            { wrap: !0 },
            S(w),
            !Za.has(w.status) && (["repair_required", "repair_failed"].includes(w.status) || w.operation === "repair" && ["cancelled", "interrupted"].includes(w.status) || w.status === "startup_failed" && ((R = w.problem) == null ? void 0 : R.code) === "service_unavailable") ? n.createElement(
              l,
              {
                size: "small",
                disabled: y,
                onClick: () => void v(w.id, !0)
              },
              "修复运行环境"
            ) : null,
            Za.has(w.status) ? n.createElement(
              d,
              null,
              n.createElement(c, { size: "small" }),
              n.createElement(
                l,
                {
                  size: "small",
                  disabled: y || ["activating", "starting", "repair_committing"].includes(
                    w.status
                  ),
                  onClick: async () => {
                    try {
                      await he(
                        `/expert-packages/installations/${w.id}/cancel`,
                        { method: "POST" }
                      );
                    } catch (H) {
                      h(H.message || "取消请求失败");
                    }
                  }
                },
                w.operation === "repair" ? "取消修复" : "取消安装"
              )
            ) : ["repair_required", "repair_failed"].includes(w.status) || w.operation === "repair" && ["interrupted", "cancelled"].includes(w.status) ? null : w.status !== "ready" || w.runtime_verified !== !0 ? n.createElement(
              l,
              {
                size: "small",
                disabled: y,
                onClick: () => void v(w.id)
              },
              w.status === "startup_failed" ? "重试启动" : ["ready", "repaired"].includes(w.status) ? "检查并启动" : "继续安装"
            ) : n.createElement(
              l,
              {
                size: "small",
                onClick: () => {
                  window.history.pushState({}, "", "/ugsci-experts"), window.dispatchEvent(new PopStateEvent("popstate"));
                }
              },
              "查看专家"
            )
          )
        });
      }
    ),
    !e && f ? n.createElement(s, { type: "error", message: f }) : null,
    n.createElement(
      o,
      {
        open: !!e,
        title: "安装专家及配套能力",
        onCancel: t,
        footer: n.createElement(
          d,
          null,
          n.createElement(l, { onClick: t }, "关闭"),
          n.createElement(
            l,
            {
              type: "primary",
              loading: y,
              disabled: !b || !!f,
              onClick: () => b && void v(b.id)
            },
            "安装专家包"
          )
        )
      },
      f ? n.createElement(s, { type: "error", message: f }) : b ? n.createElement(
        "div",
        null,
        n.createElement("p", null, `${b.name} ${b.version}`),
        n.createElement(
          "p",
          null,
          `${b.skills} 个技能，配套方法服务与运行依赖；下载约 ${((b.download_bytes || 0) / 1024 / 1024).toFixed(1)} MB。`
        ),
        n.createElement(
          "p",
          null,
          "安装时执行方法自检；登记后检查模型配置、技能和实际方法工具，通过后才显示就绪。"
        ),
        ...(b.optional_setup || []).map(
          (w) => n.createElement("p", { key: w }, `可选：${w}`)
        )
      ) : n.createElement(c, null)
    )
  );
}
async function id() {
  return he("/market/providers");
}
async function sd(e) {
  return he(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function od(e, t, n, r, a) {
  return he("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: n,
      lang: r,
      category: a || void 0
    })
  });
}
function Qa(e) {
  if (!e) return "";
  const t = e.message || String(e);
  try {
    const n = JSON.parse(t);
    if (n.detail) {
      if (typeof n.detail == "string") return n.detail;
      if (n.detail.message) return n.detail.message;
    }
  } catch {
  }
  return t;
}
async function Ka(e, t) {
  const n = { bundle_url: e };
  return t && (n.access_token = t), he("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function ld({
  embedded: e = !1
} = {}) {
  var Ma;
  const t = z().React, { useState: n, useEffect: r, useCallback: a, useMemo: i, useRef: s } = t, {
    Spin: l,
    Empty: o,
    Input: d,
    Button: c,
    message: u,
    Row: m,
    Col: p,
    Card: b,
    Tag: g,
    Tooltip: f,
    Typography: h,
    Select: y,
    Drawer: E,
    Descriptions: v,
    Tabs: S,
    Badge: B,
    Progress: N,
    Modal: w,
    Alert: x
  } = z().antd, {
    ReloadOutlined: R,
    SearchOutlined: H,
    DownloadOutlined: _,
    AppstoreOutlined: T,
    ShopOutlined: $,
    CheckCircleOutlined: F,
    LoadingOutlined: C,
    UserOutlined: I,
    UserAddOutlined: L,
    SettingOutlined: M,
    GithubOutlined: P,
    ApiOutlined: W
  } = z().antdIcons || {}, { Text: G, Paragraph: U, Title: Q } = h, [D, Y] = n("skills"), [ne, re] = n([]), [se, X] = n([]), [pe, ye] = n([]), [q, j] = n(""), [ge, we] = n(""), [ve, ue] = n(!1), [Se, xe] = n(!1), [Ie, _e] = n(
    {}
  ), [oe, te] = n(null), [le, Z] = n({}), [A, O] = n([]), [K, V] = n(""), [fe, ee] = n(""), [be, ke] = n(""), [Ae, qe] = n(""), [We, dt] = n({}), [qt, J] = n(/* @__PURE__ */ new Set()), [Ee, Re] = n(null), [Ve, me] = n(24), Be = s(Ae);
  Be.current = Ae;
  const [Ue, Ge] = n([]), [st, Ze] = n([]), [$e, ut] = n([]), [ot, De] = n(""), [Le, lt] = n(!1), [Tt, Vt] = n(24), [Yn, na] = n(24), [ra, er] = n(!1), [Js, aa] = n(!1), [Qs, ia] = n([]), [Ks, sa] = n(!1), [Xs, oa] = n([]), [Ys, la] = n(!1), [eo, ca] = n(!1), [da, to] = n([]), [ua, no] = n(
    []
  ), [tr, ma] = n(!1), [pa, ga] = n(""), [bt, fa] = n(""), [ya, ro] = n([]), [ha, ao] = n([]), [nr, ba] = n(!1), [va, Ea] = n(""), [vt, wa] = n(""), [rr, xa] = n(!1), [Je, wn] = n(null), [io, Sa] = n(null), [Ft, so] = n([]), Gt = s(null), ar = s(0), Wt = s(0);
  r(() => {
    let k = !0;
    return id().then((de) => {
      k && re(de);
    }).catch(() => {
    }), sd("zh").then((de) => {
      k && X(de);
    }).catch(() => {
    }), En().then((de) => {
      k && (O(de), de.length > 0 && (V(de[0].id), qe(de[0].id)));
    }).catch(() => {
    }), () => {
      k = !1;
    };
  }, []);
  const Zt = a(
    async (k) => {
      const de = ++Wt.current, ce = k ?? Wc();
      if (Ge(k || ce), ce.filter((Pe) => Pe.enabled).length === 0) {
        Ze([]), er(!1);
        return;
      }
      er(!0);
      try {
        const { skills: Pe, errors: Ne } = await Yc(ce);
        if (de !== Wt.current) return;
        if (Ze(Pe), Ne.length > 0) {
          for (const He of Ne)
            console.warn(
              `[ugsci] GitHub source '${He.label}' error: ${He.message}`
            );
          u.warning(
            `部分源加载失败: ${Ne.map((He) => He.label).join(", ")}`
          );
        }
      } catch (Pe) {
        if (de !== Wt.current) return;
        u.error(Pe.message || "加载技能源失败");
      } finally {
        de === Wt.current && er(!1);
      }
    },
    []
  ), pt = a(async (k = !1) => {
    const de = ++ar.current, ce = () => de === ar.current;
    ma(!0), ba(!0), lt(!0), await Promise.allSettled([
      Kc(k).then((Ce) => {
        ce() && (to(Ce.servers), no(Ce.categories), ga(""));
      }).catch(() => {
        ce() && ga("MCP 目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        ce() && ma(!1);
      }),
      gs(k).then((Ce) => {
        ce() && (ro(Ce.agents), ao(Ce.categories), Ea(""));
      }).catch(() => {
        ce() && Ea("人才目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        ce() && ba(!1);
      }),
      Xc(k).then((Ce) => {
        ce() && (ut(Ce.skills), so(Ce.categories), De(""));
      }).catch(() => {
        ce() && De("技能目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        ce() && lt(!1);
      })
    ]);
  }, []);
  r(() => {
    Zt(), pt(), ia(Vc()), oa(Fc());
    const k = Dc(() => {
      pt();
    });
    return () => {
      k(), ar.current += 1, Wt.current += 1;
    };
  }, [Zt, pt]), r(() => {
    Vt(24);
  }, [q, ge]), r(() => {
    na(24);
  }, [fe, vt]);
  const xn = a(
    async (k, de, ce) => {
      ue(!0);
      try {
        const Ce = await od(
          k,
          ce,
          20,
          "zh",
          de || void 0
        );
        ce === void 0 || Object.keys(ce).length === 0 ? ye(Ce.results) : ye((He) => [...He, ...Ce.results]);
        const Pe = Object.values(Ce.by_provider || {}).some(
          (He) => He.has_more
        );
        xe(Pe);
        const Ne = {};
        for (const [He, mt] of Object.entries(Ce.by_provider || {}))
          Ne[He] = (ce[He] || 1) + 1;
        if (_e(Ne), Ce.errors.length > 0)
          for (const He of Ce.errors)
            console.warn(
              `[ugsci] Market provider '${He.provider}' error: ${He.message}`
            );
      } catch (Ce) {
        u.error(Ce.message || "搜索市场失败"), ye([]);
      } finally {
        ue(!1);
      }
    },
    []
  );
  r(() => (Gt.current && clearTimeout(Gt.current), Gt.current = setTimeout(() => {
    xn(q, ge, {});
  }, 400), () => {
    Gt.current && clearTimeout(Gt.current);
  }), [q, ge, xn]);
  const oo = () => {
    xn(q, ge, Ie);
  }, ka = async (k) => {
    const de = `${k.source}:${k.slug}`;
    try {
      Z((Ce) => ({ ...Ce, [de]: "installing" }));
      const ce = await Ka(k.source_url);
      ce.installed && u.success(
        `技能「${ce.name || k.name}」已安装到技能池，可在技能中心查看`
      ), Z((Ce) => {
        const Pe = { ...Ce };
        return delete Pe[de], Pe;
      });
    } catch (ce) {
      u.error(Qa(ce) || "安装技能失败"), Z((Ce) => {
        const Pe = { ...Ce };
        return delete Pe[de], Pe;
      });
    }
  }, lo = (k) => {
    window.history.pushState({}, "", k), window.dispatchEvent(new PopStateEvent("popstate"));
  }, co = async (k) => {
    const de = `github:${k.sourceId}:${k.name}`, ce = Ue.find((Pe) => Pe.id === k.sourceId), Ce = (ce == null ? void 0 : ce.accessToken) || void 0;
    try {
      Z((Ne) => ({ ...Ne, [de]: "installing" }));
      const Pe = await Ka(k.source_url, Ce);
      Pe.installed && u.success(
        `技能「${Pe.name || k.name}」已安装到技能池，可在技能中心查看`
      ), Z((Ne) => {
        const He = { ...Ne };
        return delete He[de], He;
      });
    } catch (Pe) {
      u.error(Qa(Pe) || "安装技能失败"), Z((Ne) => {
        const He = { ...Ne };
        return delete He[de], He;
      });
    }
  }, Mt = i(() => {
    const k = [], de = /* @__PURE__ */ new Set();
    for (const ce of [...$e, ...st]) {
      const Ce = ce.source_url || `${ce.sourceLabel}:${ce.name}`;
      de.has(Ce) || (de.add(Ce), k.push(ce));
    }
    return k;
  }, [$e, st]), _a = i(() => {
    const k = [], de = /* @__PURE__ */ new Set();
    if (Ft.length > 0)
      for (const ce of Ft)
        de.has(ce.id) || (de.add(ce.id), k.push(ce));
    for (const ce of Mt)
      ce.tag && !de.has(ce.tag) && (de.add(ce.tag), k.push({ id: ce.tag, label: ce.tag }));
    for (const ce of Mt)
      !ce.isOfficial && ce.sourceLabel && !de.has(ce.sourceLabel) && (de.add(ce.sourceLabel), k.push({ id: ce.sourceLabel, label: ce.sourceLabel }));
    return k;
  }, [Mt, Ft]), It = i(() => {
    let k = Mt;
    if (ge) {
      const de = Ft.find(
        (ce) => ce.id === ge
      );
      de && de.tags ? k = k.filter(
        (ce) => ce.tag && de.tags.includes(ce.tag) || ce.sourceLabel === ge
      ) : k = k.filter(
        (ce) => ce.tag === ge || ce.sourceLabel === ge
      );
    }
    if (q.trim()) {
      const de = q.toLowerCase();
      k = k.filter(
        (ce) => {
          var Ce;
          return ce.name.toLowerCase().includes(de) || ((Ce = ce.description) == null ? void 0 : Ce.toLowerCase().includes(de));
        }
      );
    }
    return k;
  }, [Mt, q, ge, Ft]), Ca = ne.filter((k) => k.available), At = i(() => ge ? pe.filter((k) => {
    const de = Ca.find((ce) => ce.key === k.source);
    return (de == null ? void 0 : de.label) === ge;
  }) : pe, [pe, ge, Ca]), uo = D === "skills" ? t.createElement(
    "div",
    null,
    // Top bar: search + filters + install target
    t.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap"
        }
      },
      t.createElement(d, {
        placeholder: "搜索技能市场...",
        prefix: H ? t.createElement(H) : void 0,
        value: q,
        onChange: (k) => j(k.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      t.createElement(
        G,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      t.createElement(
        c,
        {
          icon: P ? t.createElement(P) : void 0,
          onClick: () => aa(!0),
          size: "small"
        },
        "配置技能源"
      ),
      t.createElement(
        c,
        {
          size: "small",
          loading: Le,
          onClick: () => {
            pt(!0), Zt();
          }
        },
        "刷新技能目录"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    ot ? t.createElement(x, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络后点击“刷新技能目录”重试，已加载的技能仍可浏览。",
      style: { marginBottom: 12 }
    }) : null,
    _a.length > 0 ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center"
        }
      },
      t.createElement(
        G,
        {
          type: "secondary",
          style: { fontSize: 12, marginRight: 4 }
        },
        "分类:"
      ),
      t.createElement(
        g,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: ge === "" ? "blue" : void 0,
          onClick: () => we("")
        },
        "全部"
      ),
      ..._a.map((k) => {
        const de = st.some(
          (ce) => !ce.isOfficial && ce.sourceLabel === k.id
        );
        return t.createElement(
          g,
          {
            key: k.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: ge === k.id ? de ? "blue" : "geekblue" : void 0,
            icon: de && P ? t.createElement(P) : void 0,
            onClick: () => we(
              ge === k.id ? "" : k.id
            )
          },
          k.label
        );
      })
    ) : null,
    // GitHub skills section
    (ra || Le) && Mt.length === 0 ? t.createElement(
      "div",
      {
        style: { textAlign: "center", padding: 40, marginBottom: 16 }
      },
      t.createElement(
        l,
        { size: "large" },
        t.createElement(
          "div",
          {
            style: {
              minHeight: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }
          },
          "正在加载技能..."
        )
      )
    ) : It.length > 0 ? t.createElement(
      "div",
      { style: { marginBottom: 20 } },
      t.createElement(
        "div",
        {
          style: {
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6
          }
        },
        P ? t.createElement(P, {
          style: {
            fontSize: 14,
            color: "var(--app-action-link)"
          }
        }) : null,
        t.createElement(
          G,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${It.length})`
        )
      ),
      t.createElement(
        m,
        { gutter: [12, 12] },
        ...It.slice(0, Tt).map((k) => {
          const de = `github:${k.sourceId}:${k.name}`, ce = le[de];
          return t.createElement(
            p,
            { key: de, xs: 24, sm: 12, md: 8, lg: 6 },
            t.createElement(
              b,
              {
                hoverable: !0,
                size: "small",
                style: { height: "100%" }
              },
              t.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                P ? t.createElement(P, {
                  style: {
                    fontSize: 18,
                    color: "var(--app-card-muted, #57606a)"
                  }
                }) : t.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                t.createElement(
                  f,
                  { title: k.name },
                  t.createElement(
                    G,
                    {
                      strong: !0,
                      style: {
                        fontSize: 13,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }
                    },
                    k.name
                  )
                )
              ),
              t.createElement(
                U,
                {
                  type: "secondary",
                  style: {
                    fontSize: 11,
                    margin: 0,
                    lineHeight: 1.4
                  },
                  ellipsis: { rows: 2 }
                },
                k.description || "暂无描述"
              ),
              t.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }
                },
                t.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                      alignItems: "center"
                    }
                  },
                  // Show source path (e.g. "UGSci/anthropics") in bottom-left
                  k.sourcePath || k.sourceLabel ? t.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 10,
                        color: "var(--app-card-muted, #999)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2
                      }
                    },
                    W ? t.createElement(W, {
                      style: { fontSize: 10 }
                    }) : null,
                    k.sourcePath || k.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  k.tag ? t.createElement(
                    g,
                    {
                      color: "geekblue",
                      style: { fontSize: 10 }
                    },
                    k.tag
                  ) : null,
                  k.version ? t.createElement(
                    g,
                    { style: { fontSize: 10 } },
                    `v${k.version}`
                  ) : null
                ),
                ce ? t.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: C ? t.createElement(C) : void 0
                  },
                  "安装中"
                ) : t.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: _ ? t.createElement(_) : void 0,
                    onClick: () => co(k)
                  },
                  "安装"
                )
              )
            )
          );
        })
      )
    ) : null,
    It.length > Tt ? t.createElement(
      "div",
      { style: { textAlign: "center", marginBottom: 20 } },
      t.createElement(
        c,
        {
          onClick: () => Vt((k) => k + 24)
        },
        `显示更多技能（已显示 ${Math.min(
          Tt,
          It.length
        )} / ${It.length}）`
      )
    ) : null,
    // Market results section title
    At.length > 0 || ve ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      $ ? t.createElement($, {
        style: { fontSize: 14, color: "var(--app-action-link)" }
      }) : null,
      t.createElement(
        G,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${At.length > 0 ? ` (${At.length})` : ""}`
      )
    ) : null,
    // Results grid
    ve && At.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(l, { size: "large" })
    ) : At.length === 0 ? t.createElement(o, {
      description: q ? `未找到匹配「${q}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...At.map((k) => {
        const de = `${k.source}:${k.slug}`, ce = le[de];
        return t.createElement(
          p,
          { key: de, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => te(k)
            },
            t.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }
              },
              k.icon_url ? t.createElement("img", {
                src: k.icon_url,
                alt: k.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              t.createElement(
                f,
                { title: k.name },
                t.createElement(
                  G,
                  {
                    strong: !0,
                    style: {
                      fontSize: 13,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }
                  },
                  k.name
                )
              )
            ),
            t.createElement(
              U,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              k.description || "暂无描述"
            ),
            t.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              },
              t.createElement(
                "div",
                { style: { display: "flex", gap: 4 } },
                t.createElement(
                  g,
                  { color: "geekblue", style: { fontSize: 10 } },
                  k.source
                ),
                k.version ? t.createElement(
                  g,
                  { style: { fontSize: 10 } },
                  `v${k.version}`
                ) : null
              ),
              ce ? t.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: C ? t.createElement(C) : void 0
                },
                "安装中"
              ) : t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: _ ? t.createElement(_) : void 0,
                  onClick: (Ce) => {
                    Ce.stopPropagation(), ka(k);
                  }
                },
                "安装"
              )
            )
          )
        );
      })
    ),
    // Load more button
    Se && !ve ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        { onClick: oo, loading: ve },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    oe ? t.createElement(
      E,
      {
        title: t.createElement(
          "div",
          {
            style: { display: "flex", alignItems: "center", gap: 8 }
          },
          oe.icon_url ? t.createElement("img", {
            src: oe.icon_url,
            alt: oe.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : t.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          t.createElement("span", null, oe.name)
        ),
        open: !0,
        onClose: () => te(null),
        width: 480,
        extra: t.createElement(
          c,
          {
            type: "primary",
            icon: _ ? t.createElement(_) : void 0,
            onClick: () => {
              ka(oe);
            }
          },
          "安装到技能池"
        )
      },
      t.createElement(
        v,
        { column: 1, bordered: !0, size: "small" },
        t.createElement(
          v.Item,
          { label: "来源" },
          oe.source
        ),
        t.createElement(
          v.Item,
          { label: "描述" },
          oe.description || "-"
        ),
        oe.version ? t.createElement(
          v.Item,
          { label: "版本" },
          oe.version
        ) : null,
        oe.author ? t.createElement(
          v.Item,
          { label: "作者" },
          oe.author
        ) : null,
        t.createElement(
          v.Item,
          { label: "来源链接" },
          t.createElement(
            "a",
            { href: oe.source_url, target: "_blank" },
            oe.source_url
          )
        )
      ),
      oe.stats ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          G,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        t.createElement(
          "div",
          {
            style: { display: "flex", gap: 12, flexWrap: "wrap" }
          },
          ...Object.entries(oe.stats).map(
            ([k, de]) => t.createElement(
              "div",
              { key: k, style: { textAlign: "center" } },
              t.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--app-action-link)"
                  }
                },
                String(de)
              ),
              t.createElement(
                G,
                { type: "secondary", style: { fontSize: 11 } },
                k
              )
            )
          )
        )
      ) : null
    ) : null
  ) : null, $t = i(() => {
    let k = ya;
    if (vt && (k = k.filter((de) => de.category === vt)), fe.trim()) {
      const de = fe.toLowerCase();
      k = k.filter(
        (ce) => ce.name.toLowerCase().includes(de) || ce.description.toLowerCase().includes(de) || ce.tags.some((Ce) => Ce.toLowerCase().includes(de))
      );
    }
    return k;
  }, [ya, fe, vt]), mo = async (k) => {
    if (k.package_manifest) {
      Sa(k.package_manifest);
      return;
    }
    if (!rr) {
      xa(!0);
      try {
        const [de, ce] = await Promise.all([
          k.instructions ? (async () => {
            const Pe = await gn(
              k.instructions.replace(/^\/+/, "")
            );
            if (!Pe.ok)
              throw new Error("专家提示词加载失败，请重试后再创建");
            const Ne = await Pe.text();
            if (!Ne.trim()) throw new Error("专家提示词为空，无法创建");
            return Ne;
          })() : Promise.resolve(k.description),
          k.skills_manifest ? (async () => {
            const Pe = await gn(
              k.skills_manifest.replace(/^\/+/, "")
            );
            if (!Pe.ok)
              throw new Error("专家技能清单加载失败，请重试后再创建");
            const Ne = await Pe.json(), He = Array.isArray(Ne) ? Ne : Ne.skills;
            if (!Array.isArray(He)) throw new Error("专家技能清单格式无效");
            return He.map(
              (mt) => typeof mt == "string" ? mt : mt == null ? void 0 : mt.name
            ).filter((mt) => typeof mt == "string" && mt.trim());
          })() : Promise.resolve([])
        ]), Ce = await he("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: k.name,
            description: k.description,
            skill_names: ce
          })
        });
        await Ot(Ce.id, "AGENTS.md", de), u.success(`专家「${k.name}」创建成功，已跳转至专家`), lo("/ugsci-experts");
      } catch (de) {
        u.error(de.message || "创建专家失败");
      } finally {
        xa(!1);
      }
    }
  }, Ta = a(async (k) => {
    if (k)
      try {
        const de = await Ur(k);
        if (Be.current !== k) return;
        dt(
          Object.fromEntries(de.map((ce) => [ce.key, ce]))
        );
      } catch {
        Be.current === k && dt({});
      }
  }, []);
  r(() => {
    dt({}), J(/* @__PURE__ */ new Set()), Ae && Ta(Ae);
  }, [Ae, Ta]), r(() => {
    me(24);
  }, [be, bt]);
  const po = (k) => {
    if (!Ae) {
      u.warning("请先选择目标专家");
      return;
    }
    Re({
      template: k,
      agentId: Ae,
      existing: We[k.id]
    });
  }, zt = i(() => {
    let k = da;
    if (bt && (k = k.filter((de) => de.category === bt)), be.trim()) {
      const de = be.toLowerCase();
      k = k.filter(
        (ce) => ce.name.toLowerCase().includes(de) || ce.description.toLowerCase().includes(de) || ce.tags.some((Ce) => Ce.toLowerCase().includes(de))
      );
    }
    return k.map(qc);
  }, [da, be, bt]), go = D === "mcp" ? t.createElement(
    "div",
    null,
    // Search + agent selector
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center"
        }
      },
      t.createElement(d, {
        placeholder: "搜索 MCP 服务器...",
        prefix: H ? t.createElement(H) : void 0,
        value: be,
        onChange: (k) => ke(k.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        t.createElement(
          G,
          {
            type: "secondary",
            style: { fontSize: 12, whiteSpace: "nowrap" }
          },
          "安装到："
        ),
        t.createElement(y, {
          value: Ae,
          onChange: (k) => qe(k),
          style: { minWidth: 180 },
          size: "small",
          options: A.map((k) => ({ value: k.id, label: k.name }))
        })
      ),
      // Configure MCP source button
      t.createElement(
        c,
        {
          icon: W ? t.createElement(W) : void 0,
          onClick: () => sa(!0),
          size: "small"
        },
        "配置 MCP 源"
      ),
      t.createElement(
        c,
        {
          size: "small",
          loading: tr,
          onClick: () => pt(!0)
        },
        "刷新目录"
      )
    ),
    pa ? t.createElement(x, {
      type: "warning",
      showIcon: !0,
      message: pa,
      style: { marginBottom: 12 }
    }) : null,
    // Dynamic category tag row (from OSS manifest tag_groups)
    ua.length > 0 ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center"
        }
      },
      t.createElement(
        G,
        {
          type: "secondary",
          style: { fontSize: 12, marginRight: 4 }
        },
        "分类:"
      ),
      t.createElement(
        g,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: bt === "" ? "blue" : void 0,
          onClick: () => fa("")
        },
        "全部"
      ),
      ...ua.map(
        (k) => t.createElement(
          g,
          {
            key: k.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: bt === k.id ? "geekblue" : void 0,
            onClick: () => fa(
              bt === k.id ? "" : k.id
            )
          },
          k.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    tr && zt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(
        l,
        { size: "large" },
        t.createElement(
          "div",
          {
            style: {
              minHeight: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }
          },
          "正在加载 MCP 服务器..."
        )
      )
    ) : zt.length === 0 ? t.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...zt.slice(0, Ve).map(
        (k, de) => {
          var ce, Ce, Pe;
          return t.createElement(
            p,
            { key: k.id, xs: 24, sm: 12, md: 8 },
            t.createElement(
              b,
              {
                hoverable: !0,
                size: "small",
                style: { height: "100%" }
              },
              // Header: emoji + name + tags
              t.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8
                  }
                },
                t.createElement(
                  "span",
                  {
                    style: {
                      fontSize: 28,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32
                    }
                  },
                  k.iconUrl ? t.createElement("img", {
                    src: k.iconUrl,
                    alt: k.name,
                    width: 28,
                    height: 28,
                    decoding: "async",
                    loading: de < 12 ? "eager" : "lazy",
                    style: {
                      width: 28,
                      height: 28,
                      objectFit: "contain"
                    },
                    onError: (Ne) => {
                      Ne.target.style.display = "none";
                    }
                  }) : k.emoji
                ),
                t.createElement(
                  "div",
                  { style: { flex: 1 } },
                  t.createElement(
                    G,
                    { strong: !0, style: { fontSize: 14 } },
                    k.name
                  ),
                  t.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        gap: 4,
                        marginTop: 4,
                        flexWrap: "wrap"
                      }
                    },
                    t.createElement(
                      g,
                      { color: "blue", style: { fontSize: 10 } },
                      k.category
                    ),
                    t.createElement(
                      g,
                      {
                        color: k.transport === "stdio" ? "purple" : "cyan",
                        style: { fontSize: 10 }
                      },
                      k.transport
                    ),
                    k.authType === "oauth2" ? t.createElement(
                      g,
                      {
                        color: "geekblue",
                        style: { fontSize: 10 }
                      },
                      "账号登录授权"
                    ) : null,
                    k.env && Object.values(k.env).some(
                      (Ne) => Ne.startsWith("your-") || Ne.includes("${")
                    ) ? t.createElement(
                      g,
                      {
                        color: "orange",
                        style: { fontSize: 10 }
                      },
                      "需配置密钥"
                    ) : null
                  )
                )
              ),
              // Description
              t.createElement(
                U,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 3 }
                },
                k.description
              ),
              (ce = k.requirements) != null && ce.length || (Ce = k.limitations) != null && Ce.length ? t.createElement(
                "details",
                { style: { marginTop: 8, fontSize: 12 } },
                t.createElement(
                  "summary",
                  {
                    style: {
                      cursor: "pointer",
                      color: "var(--app-action-link, #1677ff)"
                    }
                  },
                  "接入要求与限制"
                ),
                ...[
                  ...k.requirements || [],
                  ...k.limitations || []
                ].map(
                  (Ne, He) => t.createElement(
                    "p",
                    { key: He, style: { margin: "6px 0" } },
                    Ne
                  )
                ),
                wt(k.source) ? t.createElement(
                  "a",
                  {
                    href: wt(k.source),
                    target: "_blank",
                    rel: "noopener noreferrer"
                  },
                  "查看来源说明 ↗"
                ) : null
              ) : null,
              // Footer: config preview + install button
              t.createElement(
                "div",
                {
                  style: {
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: "1px solid var(--app-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }
                },
                t.createElement(
                  G,
                  { type: "secondary", style: { fontSize: 11 } },
                  qt.has(k.id) ? "已连接 · 工具检测通过" : We[k.id] ? k.authType === "oauth2" && !((Pe = We[k.id].oauth_status) != null && Pe.authorized) ? "已保存 · 待登录授权" : "已保存 · 连接待检测" : k.transport === "stdio" ? `${k.command} ${(k.args || []).join(" ")}` : k.authType === "oauth2" ? "浏览器登录 · 自动检测连接" : "远程服务 · 按账号权限连接"
                ),
                t.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: W ? t.createElement(W) : void 0,
                    onClick: () => po(k)
                  },
                  We[k.id] ? "管理连接" : k.transport === "stdio" ? "添加工具" : "连接"
                )
              )
            )
          );
        }
      )
    ),
    zt.length > Ve ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        { onClick: () => me((k) => k + 24) },
        `加载更多 MCP（已显示 ${Math.min(
          Ve,
          zt.length
        )} / ${zt.length}）`
      )
    ) : null,
    // Future expansion hint
    t.createElement(
      "div",
      {
        style: {
          marginTop: 20,
          padding: 16,
          textAlign: "center",
          border: "1px dashed var(--app-border, #d9d9d9)",
          borderRadius: 8,
          background: "var(--app-fill-faint, #fafafa)"
        }
      },
      $ ? t.createElement($, {
        style: {
          fontSize: 24,
          color: "var(--app-card-muted, #bfbfbf)",
          marginBottom: 8
        }
      }) : null,
      t.createElement(
        G,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ) : null, fo = Ee ? t.createElement(td, {
    key: `${Ee.agentId}:${Ee.template.id}`,
    template: Ee.template,
    agentId: Ee.agentId,
    agentName: ((Ma = A.find((k) => k.id === Ee.agentId)) == null ? void 0 : Ma.name) || Ee.agentId,
    existing: Ee.existing,
    onSaved: (k) => {
      Be.current === Ee.agentId && (dt((de) => ({ ...de, [k.key]: k })), J((de) => {
        const ce = new Set(de);
        return ce.delete(k.key), ce;
      }));
    },
    onConnected: () => {
      Be.current === Ee.agentId && J((k) => new Set(k).add(Ee.template.id));
    },
    onClose: () => Re(null)
  }) : null, yo = D === "experts" ? t.createElement(
    "div",
    null,
    t.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap"
        }
      },
      t.createElement(d, {
        placeholder: "搜索人才...",
        prefix: H ? t.createElement(H) : void 0,
        value: fe,
        onChange: (k) => ee(k.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      t.createElement(
        c,
        {
          icon: I ? t.createElement(I) : void 0,
          onClick: () => la(!0),
          size: "small"
        },
        "配置专家源"
      ),
      t.createElement(
        c,
        {
          size: "small",
          loading: nr,
          onClick: () => pt(!0)
        },
        "刷新人才目录"
      ),
      t.createElement(
        c,
        {
          type: "primary",
          size: "small",
          onClick: () => ca(!0)
        },
        "发布 / 更新专家"
      )
    ),
    va ? t.createElement(x, {
      type: "warning",
      showIcon: !0,
      message: va,
      style: { marginBottom: 12 }
    }) : null,
    // Dynamic category tag row (from OSS manifest tag_groups)
    ha.length > 0 ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center"
        }
      },
      t.createElement(
        G,
        {
          type: "secondary",
          style: { fontSize: 12, marginRight: 4 }
        },
        "分类:"
      ),
      t.createElement(
        g,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: vt === "" ? "blue" : void 0,
          onClick: () => wa("")
        },
        "全部"
      ),
      ...ha.map(
        (k) => t.createElement(
          g,
          {
            key: k.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: vt === k.id ? "geekblue" : void 0,
            onClick: () => wa(
              vt === k.id ? "" : k.id
            )
          },
          k.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    nr && $t.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(
        l,
        { size: "large" },
        t.createElement(
          "div",
          {
            style: {
              minHeight: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }
          },
          "正在加载人才市场..."
        )
      )
    ) : $t.length === 0 ? t.createElement(o, {
      description: "未找到匹配的人才",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...$t.slice(0, Yn).map(
        (k) => t.createElement(
          p,
          { key: k.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => wn(k)
            },
            t.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              t.createElement(rt, {
                name: k.name,
                size: 40
              }),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  G,
                  { strong: !0, style: { fontSize: 14 } },
                  k.name
                ),
                t.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: 4,
                      marginTop: 4,
                      flexWrap: "wrap"
                    }
                  },
                  k.category ? t.createElement(
                    g,
                    { color: "blue", style: { fontSize: 10 } },
                    Ut(k.category)
                  ) : null,
                  k.tags.includes("mcp") ? t.createElement(
                    g,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            t.createElement(
              U,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              k.description
            ),
            t.createElement(
              "div",
              {
                style: {
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: "1px solid var(--app-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              },
              t.createElement(
                G,
                { type: "secondary", style: { fontSize: 11 } },
                k.tags.filter(
                  (de) => de !== "agent" && de !== "template" && de !== "workspace"
                ).slice(0, 3).join(" · ") || "人才模板"
              ),
              t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: L ? t.createElement(L) : void 0
                },
                "查看详情"
              )
            )
          )
        )
      )
    ),
    $t.length > Yn ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        {
          onClick: () => na((k) => k + 24)
        },
        `显示更多人才（已显示 ${Math.min(
          Yn,
          $t.length
        )} / ${$t.length}）`
      )
    ) : null,
    // Info hint
    t.createElement(
      "div",
      {
        style: {
          marginTop: 20,
          padding: 16,
          textAlign: "center",
          border: "1px dashed var(--app-border, #d9d9d9)",
          borderRadius: 8,
          background: "var(--app-fill-faint, #fafafa)"
        }
      },
      $ ? t.createElement($, {
        style: {
          fontSize: 24,
          color: "var(--app-card-muted, #bfbfbf)",
          marginBottom: 8
        }
      }) : null,
      t.createElement(
        G,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ) : null, ho = [
    {
      key: "skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        T ? t.createElement(T, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: uo
    },
    {
      key: "mcp",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        W ? t.createElement(W, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: go
    },
    {
      key: "experts",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        L ? t.createElement(L, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: yo
    }
  ];
  return t.createElement(
    "div",
    { className: "ugsci-marketplace", style: { padding: 24 } },
    e ? null : t.createElement(Wn, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          c,
          {
            type: "primary",
            icon: R ? t.createElement(R) : void 0,
            onClick: () => {
              xn(q, ge, {}), Zt(), pt(!0);
            },
            loading: ve || ra || Le || tr || nr
          },
          "刷新"
        )
      )
    }),
    t.createElement(S, {
      items: ho,
      activeKey: D,
      onChange: (k) => Y(k)
    }),
    t.createElement(ad, {
      manifestPath: io,
      onClose: () => Sa(null)
    }),
    // Skill source config modal
    t.createElement(ed, {
      open: Js,
      onClose: () => aa(!1),
      sources: Ue,
      onChange: (k) => {
        Ge(k), Zt(k);
      }
    }),
    // MCP source config modal
    t.createElement(Wa, {
      open: Ks,
      onClose: () => sa(!1),
      sources: Qs,
      onChange: (k) => ia(k),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    fo,
    // Expert source config modal
    t.createElement(nd, {
      open: eo,
      onClose: () => {
        ca(!1), pt();
      }
    }),
    t.createElement(Wa, {
      open: Ys,
      onClose: () => la(!1),
      sources: Xs,
      onChange: (k) => oa(k),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Je ? t.createElement(
      w,
      {
        title: t.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 12
            }
          },
          t.createElement(rt, {
            name: Je.name,
            size: 40
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              G,
              { strong: !0, style: { fontSize: 16 } },
              Je.name
            ),
            t.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: 4,
                  marginTop: 2,
                  flexWrap: "wrap"
                }
              },
              Je.category ? t.createElement(
                g,
                { color: "blue", style: { fontSize: 10 } },
                Ut(Je.category)
              ) : null,
              ...Je.tags.filter(
                (k) => k !== "agent" && k !== "template" && k !== "workspace"
              ).slice(0, 5).map(
                (k) => t.createElement(
                  g,
                  { key: k, style: { fontSize: 10 } },
                  k
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => wn(null),
        width: 640,
        footer: t.createElement(
          "div",
          { style: { textAlign: "right" } },
          t.createElement(
            c,
            {
              onClick: () => wn(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          t.createElement(
            c,
            {
              type: "primary",
              loading: rr,
              disabled: rr,
              icon: L ? t.createElement(L) : void 0,
              style: Xe,
              onClick: async () => {
                await mo(Je), wn(null);
              }
            },
            Je.package_manifest ? "安装专家包" : "创建专家"
          )
        )
      },
      // Description
      t.createElement(
        "div",
        { style: { marginBottom: 16 } },
        t.createElement(
          G,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        t.createElement(
          U,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          Je.description
        )
      ),
      // Skills manifest hint
      Je.skills_manifest ? t.createElement(
        "div",
        {
          style: {
            marginBottom: 16,
            padding: 12,
            background: "var(--app-success-bg)",
            borderRadius: 8,
            border: "1px solid var(--app-success-border)"
          }
        },
        t.createElement(
          G,
          {
            style: {
              fontSize: 12,
              color: "var(--app-card-success-fg)"
            }
          },
          "✓ 包含技能清单，创建后将自动安装推荐技能"
        )
      ) : null,
      // Instructions hint
      Je.instructions ? t.createElement(
        "div",
        {
          style: {
            marginBottom: 16,
            padding: 12,
            background: "var(--app-info-bg)",
            borderRadius: 8,
            border: "1px solid var(--app-info-border)"
          }
        },
        t.createElement(
          G,
          { style: { fontSize: 12, color: "var(--app-action-link)" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Je.drivers && Object.keys(Je.drivers).length > 0 ? t.createElement(
        "div",
        null,
        t.createElement(
          G,
          {
            strong: !0,
            style: { display: "block", marginBottom: 6 }
          },
          "推荐引擎"
        ),
        t.createElement(
          "div",
          {
            style: {
              display: "flex",
              gap: 6,
              flexWrap: "wrap"
            }
          },
          ...Object.entries(Je.drivers).map(
            ([k, de]) => t.createElement(
              g,
              { key: k, color: "cyan", style: { fontSize: 11 } },
              `${k}${de && de.length > 0 ? ` (${de.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function cd() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Xa = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Ya = {
  zh: {
    label: "能告诉我你都能做点什么吗？",
    value: "能告诉我你都能做点什么吗"
  },
  en: {
    label: "Can you tell me what you can do?",
    value: "Can you tell me what you can do?"
  },
  ja: {
    label: "あなたができることを教えてください",
    value: "あなたができることを教えてください"
  },
  ru: {
    label: "Расскажи, что ты умеешь делать?",
    value: "Расскажи, что ты умеешь делать?"
  },
  vi: {
    label: "Bạn có thể cho tôi biết bạn làm được gì không?",
    value: "Bạn có thể cho tôi biết bạn làm được gì không?"
  },
  id: {
    label: "Bisa cerita apa saja yang bisa Anda lakukan?",
    value: "Bisa cerita apa saja yang bisa Anda lakukan?"
  }
};
function dd() {
  const e = z(), t = e.React, { useEffect: n, useRef: r } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, i = (a == null ? void 0 : a.id) || "default", s = r(null), l = r(null);
  return n(() => {
    if (s.current === i) return;
    s.current = i, Vn();
    const o = cd(), d = Xa[o] || Xa.en, c = Ya[o] || Ya.en;
    let u = !1;
    return (async () => {
      var m, p;
      try {
        const b = await Zn(i);
        if (u) return;
        const g = qo(b);
        if (l.current) {
          try {
            l.current();
          } catch {
          }
          l.current = null;
        }
        const f = window.QwenPaw;
        (m = f == null ? void 0 : f.chat) != null && m.welcome && (g.length > 0 ? (l.current = f.chat.welcome.set("ugsci", {
          description: d,
          prompts: g
        }), console.info(
          `[ugsci] Injected ${g.length} welcome prompts for agent "${i}"`
        )) : (l.current = f.chat.welcome.set("ugsci", {
          description: d,
          prompts: [c]
        }), console.info(
          `[ugsci] No skills for agent "${i}" — using default prompt`
        )));
      } catch (b) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${i}":`,
          b
        );
        const g = window.QwenPaw;
        if ((p = g == null ? void 0 : g.chat) != null && p.welcome && !u) {
          if (l.current) {
            try {
              l.current();
            } catch {
            }
            l.current = null;
          }
          l.current = g.chat.welcome.set("ugsci", {
            description: d,
            prompts: [c]
          });
        }
      }
    })(), () => {
      u = !0;
    };
  }, [i]), null;
}
const ud = 256;
let Ke = {};
const _r = /* @__PURE__ */ new Set(), Nn = () => _r.forEach((e) => e()), md = (e) => (_r.add(e), () => _r.delete(e)), fn = /* @__PURE__ */ new Map();
function ei(e, t) {
  const n = [];
  for (const i of t) {
    if (!i) continue;
    const s = Ke[jt(e, i)] || Object.values(Ke).find((l) => l.uiId === i);
    s && n.push(s);
  }
  const r = `${e}::${t.join("\0")}`, a = fn.get(r);
  return a && a.length === n.length && a.every((i, s) => i === n[s]) ? a : (fn.set(r, n), n);
}
function jt(e, t) {
  return `${e}::${t}`;
}
function Bn(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? Bn(e.genui) : e.ui && typeof e.ui == "object" ? Bn(e.ui.genui) : null;
}
function ln(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, a = typeof r == "string" ? ln(r) : Bn(n);
        if (a) return a;
      }
      return null;
    }
    return Bn(t);
  } catch {
    return null;
  }
}
function cn(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const n = JSON.parse(e);
    if (Array.isArray(n)) {
      const r = (t = n.find((a) => (a == null ? void 0 : a.type) === "text")) == null ? void 0 : t.text;
      return typeof r == "string" ? cn(r) : null;
    }
    return n && n.ok === !1 ? n : null;
  } catch {
    return null;
  }
}
const ti = /* @__PURE__ */ new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output"
]), dr = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function fs(e) {
  var r, a, i, s;
  if (!Array.isArray(e)) return [];
  const t = [], n = (l, o = !1) => {
    var u, m, p;
    if (!l || typeof l != "object") return;
    if (Array.isArray(l)) {
      const b = o ? l.map((g) => {
        var f;
        return ((f = g == null ? void 0 : g.data) == null ? void 0 : f.name) ?? (g == null ? void 0 : g.name);
      }).filter((g) => !!g).map((g) => String(g)) : [];
      if (o && b.length) {
        const g = b.some(
          (f) => dr.has(f)
        );
        for (const f of l) {
          const h = ((u = f == null ? void 0 : f.data) == null ? void 0 : u.output) ?? (f == null ? void 0 : f.output) ?? ((m = f == null ? void 0 : f.data) == null ? void 0 : m.result) ?? (f == null ? void 0 : f.result) ?? ((p = f == null ? void 0 : f.data) == null ? void 0 : p.content) ?? (f == null ? void 0 : f.content);
          if (h == null) continue;
          const y = typeof h == "string" ? h : JSON.stringify(h), E = ln(y) || (g ? cn(y) : null);
          E && t.push(E);
        }
      }
      l.forEach((g) => n(g));
      return;
    }
    const d = l;
    if (d.type === "tool_result") {
      const g = (Array.isArray(d.output) ? d.output : []).filter((y) => (y == null ? void 0 : y.type) === "text").map((y) => y.text), f = g.length ? g.join(`
`) : d.output, h = g.length ? g : [typeof f == "string" ? f : JSON.stringify(f)];
      for (const y of h) {
        const E = ln(y) || (dr.has(String(d.name || "")) ? cn(y) : null);
        E && t.push(E);
      }
      return;
    }
    const c = ti.has(String(d.type || ""));
    Object.entries(d).forEach(
      ([b, g]) => n(g, c && b === "content")
    );
  };
  n(e);
  for (const l of e) {
    if (!l || typeof l != "object") continue;
    const o = l;
    if (!ti.has(String(o.type || "")) || !Array.isArray(o.content))
      continue;
    const d = o.content, c = (a = (r = d[0]) == null ? void 0 : r.data) == null ? void 0 : a.name;
    if (!c) continue;
    const u = (s = (i = d[1]) == null ? void 0 : i.data) == null ? void 0 : s.output;
    if (u == null) continue;
    const m = typeof u == "string" ? u : JSON.stringify(u), p = ln(m) || (dr.has(String(c)) ? cn(m) : null);
    p && t.push(p);
  }
  return Array.from(
    new Map(
      t.map((l) => [
        `${l.kind}:${l.ui_id}:${l.revision}`,
        l
      ])
    ).values()
  );
}
function ys(e) {
  var s;
  const t = jt(e.sessionId, e.uiId), n = Object.entries(Ke).filter(([, l]) => l.uiId === e.uiId).sort(([, l], [, o]) => o.revision - l.revision), r = Ke[t] || ((s = n[0]) == null ? void 0 : s[1]);
  if (r && e.revision < r.revision) return;
  const a = { ...Ke };
  for (const [l] of n) l !== t && delete a[l];
  a[t] = r && e.revision === r.revision ? { ...r, ...e, tree: r.tree } : e;
  const i = Object.entries(a).sort(
    ([, l], [, o]) => o.updatedAt - l.updatedAt
  );
  Ke = Object.fromEntries(i.slice(0, ud)), Nn();
}
function pd(e, t) {
  for (const n of fs(t))
    !n.ui_id || !n.tree || ys({
      schemaVersion: "1",
      uiId: n.ui_id,
      revision: n.revision || 1,
      tree: n.tree,
      sessionId: e,
      sourceToolCallId: n.tool_call_id,
      updatedAt: Date.now()
    });
}
const hs = {
  setSnapshot: ys,
  applyPatch(e, t, n, r) {
    var d, c;
    const a = (d = window.QwenPaw) == null ? void 0 : d.host, i = r || ((c = a == null ? void 0 : a.getCurrentSessionId) == null ? void 0 : c.call(a)) || "", s = jt(i, e.ui_id), l = Ke[s] || Object.values(Ke).find((u) => u.uiId === e.ui_id);
    if (!l || n <= l.revision) return;
    Ke = {
      ...Object.fromEntries(
        Object.entries(Ke).filter(
          ([, u]) => u.uiId !== e.ui_id
        )
      ),
      [s]: { ...l, sessionId: i, tree: t, revision: n, updatedAt: Date.now() }
    }, Nn();
  },
  getSnapshot: (e, t) => Ke[jt(e, t)],
  clearSession(e) {
    Ke = Object.fromEntries(
      Object.entries(Ke).filter(
        ([, t]) => t.sessionId !== e
      )
    );
    for (const t of [...fn.keys()])
      t.startsWith(`${e}::`) && fn.delete(t);
    Nn();
  },
  hydrateFromMessages: pd
};
function gd({ children: e }) {
  return e;
}
function fd() {
  return hs;
}
function yd(e, t) {
  var i, s;
  const n = (s = (i = window.QwenPaw) == null ? void 0 : i.host) == null ? void 0 : s.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), a = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    md,
    () => ei(e, a),
    () => ei(e, a)
  );
}
function hd(e) {
  hs.clearSession(e);
}
function bd() {
  Ke = {}, fn.clear(), Nn();
}
function dn(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return dn(JSON.parse(e));
      } catch {
      }
    return e;
  }
  if (Array.isArray(e)) {
    const n = (t = e.find((r) => (r == null ? void 0 : r.type) === "text")) == null ? void 0 : t.text;
    return typeof n == "string" ? n : JSON.stringify(e);
  }
  if (e && typeof e == "object") {
    const n = e;
    if (typeof n.text == "string") return n.text;
    if (n.output !== void 0) return dn(n.output);
    if (n.content !== void 0) return dn(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function vd(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = r[0], i = a == null ? void 0 : a.data, s = (i == null ? void 0 : i.name) || "";
  if (r.length > 1) {
    const l = r[1], o = l == null ? void 0 : l.data, d = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (l == null ? void 0 : l.output) ?? (l == null ? void 0 : l.content) ?? (o == null ? void 0 : o.result) ?? (l == null ? void 0 : l.result);
    if (d != null)
      return { resultText: dn(d), status: n, toolName: s };
  }
  if (i != null && i.output) {
    const l = i.output;
    return { resultText: dn(l), status: n, toolName: s };
  }
  return { resultText: "", status: n, toolName: s };
}
function ni(e) {
  var p, b, g, f;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: i } = vd(
    e
  ), s = a === "in_progress" || a === "calling", l = a === "failed" || a === "error", o = ln(r), d = o ? null : cn(r);
  let c = 0;
  (b = o == null ? void 0 : o.tree) != null && b.root && (c = bs(o.tree.root));
  const u = i === "emit_ui_patch" || (o == null ? void 0 : o.kind) === "genui_patch", m = s ? u ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : l ? u ? "📝 UI Patch Error" : "🎨 UI Tree Error" : o ? u ? `📝 UI Patched (rev ${o.revision ?? "?"})` : `🎨 UI Tree (${c} nodes)` : u ? "📝 UI Patch" : "🎨 UI Tree";
  return n.createElement(
    "details",
    {
      open: s || l,
      style: {
        margin: "4px 0",
        border: "1px solid var(--ant-color-border, #d9d9d9)",
        borderRadius: 8,
        padding: "4px 8px",
        fontSize: 13
      }
    },
    n.createElement(
      "summary",
      {
        style: {
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      n.createElement("span", null, u ? "📝" : "🎨"),
      n.createElement("span", null, m),
      o != null && o.ok ? n.createElement(
        "span",
        { style: { fontSize: 11, color: "#999", marginLeft: "auto" } },
        `ui_id: ${((g = o.ui_id) == null ? void 0 : g.slice(0, 16)) ?? ""}…`
      ) : null
    ),
    l || d && !o ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      n.createElement(
        "div",
        {
          style: {
            color: "var(--ant-color-error, #ff4d4f)",
            marginBottom: 4
          }
        },
        (d == null ? void 0 : d.message) || "Unknown error"
      ),
      d != null && d.hint ? n.createElement(
        "div",
        { style: { color: "#999" } },
        `💡 ${d.hint}`
      ) : null
    ) : o != null && o.ok ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (f = o.tree) != null && f.root ? `GenUI 已在回复正文中展示（${c} 个节点，revision ${o.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : n.createElement(
      "pre",
      {
        style: {
          fontSize: 12,
          padding: "8px 12px",
          background: "rgba(0,0,0,0.03)",
          borderRadius: 8,
          overflow: "auto",
          maxHeight: 200
        }
      },
      r || "(waiting for result...)"
    )
  );
}
function bs(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children))
    for (const n of e.children) t += bs(n);
  return t;
}
function On(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return On(JSON.parse(e));
      } catch {
      }
    return e;
  }
  if (Array.isArray(e)) {
    const n = (t = e.find((r) => (r == null ? void 0 : r.type) === "text")) == null ? void 0 : t.text;
    return typeof n == "string" ? n : JSON.stringify(e);
  }
  if (e && typeof e == "object") {
    const n = e;
    if (typeof n.text == "string") return n.text;
    if (n.output !== void 0) return On(n.output);
    if (n.content !== void 0) return On(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function Ed(e) {
  var s;
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = (s = r[0]) == null ? void 0 : s.data, i = (a == null ? void 0 : a.name) || "";
  if (r.length > 1) {
    const l = r[1], o = l == null ? void 0 : l.data, d = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (l == null ? void 0 : l.output) ?? (l == null ? void 0 : l.content);
    if (d != null)
      return { resultText: On(d), status: n, toolName: i };
  }
  return { resultText: "", status: n, toolName: i };
}
function ri(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: i } = Ed(
    e
  ), s = i === "get_genui_guide", l = a === "in_progress" || a === "calling";
  let o = s ? "GenUI 指南" : "组件目录", d = r;
  try {
    const u = r ? JSON.parse(r) : null;
    if (u && typeof u == "object") {
      const m = u.components;
      Array.isArray(m) ? (o = `组件目录（${m.length} 个 kind）`, d = m.map((p) => p == null ? void 0 : p.kind).filter(Boolean).join(" · ")) : (u.purpose || u.layout_structure) && (o = "GenUI 指南", d = String(
        u.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。"
      ));
    }
  } catch {
  }
  return n.createElement(
    "details",
    {
      style: {
        margin: "4px 0",
        border: "1px solid var(--ant-color-border, #d9d9d9)",
        borderRadius: 8,
        padding: "4px 8px",
        fontSize: 13
      }
    },
    n.createElement(
      "summary",
      { style: { cursor: "pointer" } },
      l ? s ? "查阅 GenUI 指南…" : "查阅组件目录…" : o
    ),
    n.createElement(
      "div",
      {
        style: {
          padding: "8px 4px",
          fontSize: 12,
          color: "#666",
          lineHeight: 1.5
        }
      },
      d || "(waiting…)"
    )
  );
}
const wd = /* @__PURE__ */ new Set(["send_message"]), ai = 1e4, xd = 500, ii = {};
function Sd() {
  var e;
  try {
    const t = window.QwenPaw, n = (e = t == null ? void 0 : t.genui) == null ? void 0 : e.config;
    if (n != null && n.allow_actions && Array.isArray(n.allow_actions)) {
      const r = n.allow_actions.filter(
        (a) => typeof a == "string" && a.length > 0
      );
      if (r.length > 0)
        return new Set(r);
    }
  } catch {
  }
  return new Set(wd);
}
function kd(e) {
  const t = Date.now(), n = ii[e] || 0;
  return t - n < xd ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (ii[e] = t, !1);
}
function _d(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const a = t[r];
    return a == null ? "" : typeof a == "string" ? a : JSON.stringify(a);
  });
}
function Cr(e, t = {}) {
  var i, s, l, o, d, c, u;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, a = Sd();
  if (!a.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(a).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (kd(r))
    return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const m = t.formValues || {};
    let p = ((i = n.payload) == null ? void 0 : i.content) || ((s = n.payload) == null ? void 0 : s.message) || "";
    const b = /\{\{\s*[\w.-]+\s*\}\}/.test(p);
    return p = _d(p, m).trim(), p && !b && Object.keys(m).length > 0 && (p += `
${Object.entries(m).map(
      ([f, h]) => `${f}: ${typeof h == "string" ? h : JSON.stringify(h)}`
    ).join(`
`)}`), !p && Object.keys(m).length > 0 && (p = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(m).map(
      ([h, y]) => `${h}: ${typeof y == "string" ? y : JSON.stringify(y)}`
    ).join(`
`)}`), !p || !p.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : p.length > ai ? (console.warn(
      "[ugsci.genui] send_message: content length " + p.length + " exceeds max " + ai
    ), { ok: !1, message: "消息内容过长" }) : !((d = (o = (l = window.QwenPaw) == null ? void 0 : l.chat) == null ? void 0 : o.sendMessage) != null && d.call(o, p)) ? (console.info(
      "[ugsci.genui] send_message: could not find chat sender, content:",
      p
    ), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  if (r === "open_url") {
    const m = ((c = n.payload) == null ? void 0 : c.url) || ((u = n.payload) == null ? void 0 : u.href) || "", p = typeof m == "string" ? m.trim() : "";
    return /^https?:\/\//i.test(p) ? (window.open(p, "_blank", "noopener,noreferrer"), { ok: !0, message: "已打开链接" }) : (console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed"), { ok: !1, message: "仅允许 http(s) 链接" });
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const it = /* @__PURE__ */ new Map(), yn = /* @__PURE__ */ new Map(), Cd = 128, Mn = /* @__PURE__ */ new Map();
function Hn(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function Td(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function Md(e) {
  return e.startsWith("workspace://");
}
function Id(e) {
  return Md(e) ? e.slice(12) : e;
}
async function Ad(e) {
  if (!e) return null;
  if (Hn(e)) return e;
  if (it.has(e))
    return it.get(e) ?? null;
  if (Mn.has(e))
    return Mn.get(e);
  const t = $d(e);
  Mn.set(e, t);
  try {
    const n = await t;
    if (!it.has(e) && it.size >= Cd) {
      const r = it.keys().next().value;
      if (r !== void 0) {
        const a = it.get(r);
        a != null && a.startsWith("blob:") && URL.revokeObjectURL(a), it.delete(r);
      }
    }
    return it.set(e, n), n && yn.delete(e), n;
  } finally {
    Mn.delete(e);
  }
}
async function $d(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const a = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return yn.set(e, a), console.warn("[ugsci.genui]", a), null;
  }
  const r = Id(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const a = await n.resolveWorkspaceBlob(r);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await zd(r, n);
  } catch (a) {
    const i = a instanceof Error ? a.message : String(a);
    return yn.set(
      e,
      `无法读取本地媒体：${i}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      a
    ), null;
  }
}
async function zd(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (Td(e) && (a != null && a.filePreviewUrl) ? n = a.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
    throw new Error(
      "宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl"
    );
  const i = {}, s = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof s == "function")
    try {
      const d = s();
      d && typeof d == "object" && Object.assign(i, d);
    } catch {
    }
  const l = await fetch(n, { headers: i });
  if (!l.ok)
    throw new Error(`HTTP ${l.status}: ${l.statusText}`);
  const o = await l.blob();
  return URL.createObjectURL(o);
}
function si(e) {
  return e ? Hn(e) ? e : it.get(e) ?? null : null;
}
function oi(e) {
  return yn.get(e) ?? null;
}
function Rd() {
  for (const e of it.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  it.clear(), yn.clear();
}
const vs = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput"
], Rt = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96"
], Ld = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function Te(e) {
  return typeof e == "string" ? e : e == null ? "" : String(e);
}
function nt(e) {
  if (typeof e == "number" && Number.isFinite(e)) return e;
  if (typeof e == "string") {
    const t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}
function rn(e) {
  return Array.isArray(e) ? e : [];
}
function un(e) {
  return !!e;
}
function hn(e) {
  const t = e.props || {}, n = Te(t.name);
  if (n) return n;
  const r = Te(t.label), a = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return a ? a[1].toLowerCase() : r || Te(e.nodeId);
}
function Es(e) {
  return vs.includes(e);
}
function ws(e) {
  return Math.min(Math.max(nt(e) || 2, 1), 4);
}
function Pd(e, t, n = 6) {
  const r = nt(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function Od(e) {
  const n = (Te(e) || "16:9").split(":"), r = Number(n[0]), a = Number(n[1]);
  return r > 0 && a > 0 ? `${r} / ${a}` : "16 / 9";
}
function Nd(e) {
  return /^https?:\/\//i.test(Te(e).trim());
}
function tt(e, t) {
  const n = {}, r = `${nt(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${nt(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = Te(t.align)), t.justify && (n.justifyContent = Te(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const a = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, i = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${Pd(
      t.columns,
      a,
      i
    )}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${nt(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${nt(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${nt(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = Od(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${nt(t.size) || 16}px`);
  return n;
}
function Vr(e, t) {
  function n(u) {
    return typeof u == "string" ? u : u == null ? "" : String(u);
  }
  function r(u) {
    if (typeof u == "number" && Number.isFinite(u)) return u;
    if (typeof u == "string") {
      const m = Number(u);
      return Number.isFinite(m) ? m : 0;
    }
    return 0;
  }
  function a(u) {
    return Array.isArray(u) ? u : [];
  }
  const i = e.generator && typeof e.generator == "object" ? e.generator : {}, s = a(i.coefficients).map(n).filter(Boolean), l = n(i.type) === "polynomial" || s.length > 0;
  let o = a(e.categories).map(n), d = a(e.series);
  if (l && t) {
    const u = s.length > 0 ? s : ["a", "b", "c", "d", "e"], m = typeof i.xMin == "number" ? i.xMin : -3, p = typeof i.xMax == "number" ? i.xMax : 3, b = Math.min(
      Math.max(r(i.samples) || 61, 10),
      400
    ), g = Array.from(
      { length: b },
      (h, y) => m + (p - m) * y / Math.max(b - 1, 1)
    ), f = u.map((h) => r(t[h]));
    o = g.map((h) => Number(h.toFixed(2)).toString()), d = [
      {
        name: n(i.label) || "f(x)",
        values: g.map(
          (h) => f.reduce(
            (y, E, v) => y + E * Math.pow(h, f.length - v - 1),
            0
          )
        )
      }
    ];
  }
  const c = d.map((u, m) => {
    const p = u && typeof u == "object" ? u : {};
    return {
      name: n(p.name) || `Series ${m + 1}`,
      values: a(p.values).map(r)
    };
  });
  return {
    title: n(e.title),
    chartType: n(e.chart) || "line",
    categories: o,
    series: c,
    height: r(e.height) || 200,
    showLegend: e.showLegend !== !1,
    empty: o.length === 0 || c.length === 0
  };
}
function xs(e, t, n = 640) {
  const r = [
    "#1677ff",
    "#52c41a",
    "#faad14",
    "#ff4d4f",
    "#722ed1",
    "#13c2c2",
    "#eb2f96"
  ];
  if (e.replaceChildren(), t.title) {
    const p = document.createElement("div");
    p.className = "chart-title", p.textContent = t.title, e.appendChild(p);
  }
  if (t.empty) {
    const p = document.createElement("div");
    p.className = "muted", p.textContent = "Chart: no data", e.appendChild(p);
    return;
  }
  const a = t.height || 240, i = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (i.setAttribute("viewBox", `0 0 ${n} ${a}`), i.setAttribute("role", "img"), i.setAttribute("aria-label", t.title || "Chart"), t.chartType === "pie") {
    const p = t.series[0].values.map((E) => Math.abs(E)), b = p.reduce((E, v) => E + v, 0) || 1, g = n / 2, f = a / 2, h = Math.min(n, a) / 2 - 20;
    let y = -Math.PI / 2;
    if (p.forEach((E, v) => {
      const S = E / b * Math.PI * 2, B = g + h * Math.cos(y), N = f + h * Math.sin(y), w = g + h * Math.cos(y + S), x = f + h * Math.sin(y + S), R = document.createElementNS(i.namespaceURI, "path");
      R.setAttribute(
        "d",
        `M ${g} ${f} L ${B} ${N} A ${h} ${h} 0 ${S > Math.PI ? 1 : 0} 1 ${w} ${x} Z`
      ), R.setAttribute("fill", r[v % r.length]), i.appendChild(R), y += S;
    }), e.appendChild(i), t.showLegend) {
      const E = document.createElement("div");
      E.className = "legend", p.forEach((v, S) => {
        const B = document.createElement("span"), N = document.createElement("i");
        N.style.background = r[S % r.length], B.append(
          N,
          document.createTextNode(
            `${t.categories[S] || `#${S + 1}`}: ${v}`
          )
        ), E.appendChild(B);
      }), e.appendChild(E);
    }
    return;
  }
  const s = t.series.flatMap((p) => p.values), l = Math.max(...s, 0), o = Math.min(...s, 0), d = l - o || 1, c = (p) => a - 24 - (p - o) / d * (a - 44), u = (p) => 30 + p * (n - 50) / Math.max(t.categories.length - 1, 1), m = document.createElementNS(i.namespaceURI, "line");
  if (m.setAttribute("x1", "30"), m.setAttribute("x2", String(n - 15)), m.setAttribute("y1", String(c(0))), m.setAttribute("y2", String(c(0))), m.setAttribute("stroke", "#d9d9d9"), i.appendChild(m), t.series.forEach((p, b) => {
    const g = r[b % r.length];
    if (t.chartType === "bar") {
      const y = (n - 50) / Math.max(t.categories.length, 1), E = Math.max(1, y / t.series.length - 3);
      p.values.forEach((v, S) => {
        const B = document.createElementNS(i.namespaceURI, "rect"), N = Math.min(c(v), c(0)), w = Math.max(c(v), c(0));
        B.setAttribute(
          "x",
          String(30 + S * y + b * (E + 2))
        ), B.setAttribute("y", String(N)), B.setAttribute("width", String(E)), B.setAttribute("height", String(Math.max(1, w - N))), B.setAttribute("fill", g), i.appendChild(B);
      });
      return;
    }
    const f = p.values.map((y, E) => `${u(E)},${c(y)}`).join(" "), h = document.createElementNS(i.namespaceURI, "polyline");
    h.setAttribute("points", f), h.setAttribute(
      "fill",
      t.chartType === "area" ? `${g}22` : "none"
    ), h.setAttribute("stroke", g), h.setAttribute("stroke-width", "2"), i.appendChild(h);
  }), e.appendChild(i), t.showLegend) {
    const p = document.createElement("div");
    p.className = "legend", t.series.forEach((b, g) => {
      const f = document.createElement("span"), h = document.createElement("i");
      h.style.background = r[g % r.length], f.append(h, document.createTextNode(b.name)), p.appendChild(f);
    }), e.appendChild(p);
  }
}
const Bd = {
  check: ["M20 6 9 17l-5-5"],
  warning: [
    "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    "M12 9v4",
    "M12 17h.01"
  ],
  info: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 16v-4",
    "M12 8h.01"
  ],
  error: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M15 9l-6 6",
    "M9 9l6 6"
  ],
  chart: ["M3 3v18h18", "M7 16V8", "M12 16v-5", "M17 16V4"],
  image: [
    "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
    "M8 14l2.5-3 2.5 3 3.5-4.5L20 16"
  ]
}, Hd = {
  check: "check",
  success: "check",
  "check-circle": "check",
  warning: "warning",
  alert: "warning",
  "alert-triangle": "warning",
  info: "info",
  information: "info",
  "info-circle": "info",
  error: "error",
  "x-circle": "error",
  "close-circle": "error",
  chart: "chart",
  "bar-chart": "chart",
  "bar-chart-2": "chart",
  image: "image",
  photo: "image",
  picture: "image"
};
function Ss(e) {
  const t = Te(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = Hd[n];
  return r ? { kind: "svg", paths: Bd[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
}
function Ud(e, t, n = {}) {
  const r = Ss(t), a = n.size && n.size > 0 ? n.size : 16;
  if (e.setAttribute("aria-hidden", "true"), e.replaceChildren(), r.kind === "emoji") {
    e.textContent = r.text, e.style.fontSize = `${a}px`, n.color && (e.style.color = n.color);
    return;
  }
  if (r.kind === "empty") return;
  const i = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  i.setAttribute("width", String(a)), i.setAttribute("height", String(a)), i.setAttribute("viewBox", "0 0 24 24"), i.setAttribute("fill", "none"), i.setAttribute("stroke", n.color || "currentColor"), i.setAttribute("stroke-width", "2"), i.setAttribute("stroke-linecap", "round"), i.setAttribute("stroke-linejoin", "round"), i.setAttribute("focusable", "false"), i.style.display = "block";
  for (const s of r.paths) {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "path");
    l.setAttribute("d", s), i.appendChild(l);
  }
  e.appendChild(i);
}
let ur = null;
function Jn(e) {
  return ur || (ur = e.createContext(null)), ur;
}
function ks(e, t = {}) {
  if (Es(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[hn(e)] = r);
  }
  for (const n of e.children || []) ks(n, t);
  return t;
}
function jd({
  node: e,
  children: t,
  onValuesChange: n
}) {
  var o, d;
  const r = (d = (o = window.QwenPaw) == null ? void 0 : o.host) == null ? void 0 : d.React;
  if (!r) return null;
  const a = r.useMemo(() => ks(e), [e]), [i, s] = r.useState(
    a
  );
  r.useEffect(
    () => s((c) => ({ ...a, ...c })),
    [a]
  ), r.useEffect(() => {
    n == null || n(i);
  }, [i, n]);
  const l = r.useMemo(
    () => ({
      values: i,
      setValue: (c, u) => s((m) => ({
        ...m,
        [c]: u
      }))
    }),
    [i]
  );
  return r.createElement(
    Jn(r).Provider,
    { value: l },
    t
  );
}
const ae = (e) => typeof e == "string" ? e : e != null ? String(e) : "", ft = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, yt = (e) => !!e, an = (e) => Array.isArray(e) ? e : [], Dd = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((a) => Object.is(e[a], t[a]));
}, li = {
  xs: "12px",
  sm: "13px",
  base: "14px",
  lg: "16px"
}, ze = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
}, qd = new Set(vs);
function Vd(e) {
  const t = [], n = (r) => {
    qd.has(r.kind) && t.push(r);
    for (const a of r.children || []) n(a);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let mr = null;
function Fr(e) {
  return mr || (mr = e.createContext(null)), mr;
}
function Fd({ node: e }) {
  var b;
  const t = (b = window.QwenPaw) == null ? void 0 : b.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const a = e.props || {}, i = n.useContext(Jn(n)), [s, l] = n.useState({}), [o, d] = n.useState(
    null
  ), c = n.useMemo(
    () => Vd(e),
    [e]
  ), u = n.useMemo(() => {
    const g = {};
    for (const f of c) {
      const h = f.props || {}, y = hn(f);
      h.value !== void 0 ? g[y] = h.value : h.checked !== void 0 && (g[y] = h.checked);
    }
    return g;
  }, [c]);
  n.useEffect(
    () => l((g) => {
      const f = {
        ...u,
        ...g,
        ...(i == null ? void 0 : i.values) || {}
      };
      return Dd(g, f) ? g : f;
    }),
    [u, i == null ? void 0 : i.values]
  );
  const m = n.useMemo(
    () => ({
      values: s,
      setValue: (g, f) => {
        d(null), l((h) => ({
          ...h,
          [g]: f
        })), i == null || i.setValue(g, f);
      }
    }),
    [s, i]
  ), p = () => {
    var h, y;
    const g = c.filter((E) => {
      var v;
      return (v = E.props) == null ? void 0 : v.required;
    }).find((E) => {
      const v = hn(E), S = s[v];
      return S == null || S === "" || Array.isArray(S) && S.length === 0;
    });
    if (g) {
      d({
        ok: !1,
        message: `${ae((h = g.props) == null ? void 0 : h.label) || ae((y = g.props) == null ? void 0 : y.name) || "必填项"}不能为空`
      });
      return;
    }
    const f = a.action && typeof a.action == "object" ? a.action : { type: "submit_form", payload: {} };
    d(
      Cr(f, {
        formValues: s,
        formId: ae(a.formId) || e.nodeId
      })
    );
  };
  return n.createElement(
    Fr(n).Provider,
    { value: m },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a.title ? n.createElement(
        "div",
        { style: { fontWeight: 600, marginBottom: 8 } },
        ae(a.title)
      ) : null,
      ...(e.children || []).map(
        (g, f) => n.createElement(bn(n), {
          key: g.nodeId || f,
          node: g
        })
      ),
      n.createElement(
        r.Button || "button",
        {
          type: "primary",
          size: "small",
          style: { marginTop: 8 },
          onClick: p
        },
        ae(a.submitLabel) || "提交"
      ),
      o ? n.createElement(
        "div",
        {
          role: "status",
          style: {
            marginTop: 6,
            fontSize: 12,
            color: o.ok ? ze.success : ze.error
          }
        },
        o.message
      ) : null
    )
  );
}
function Gd({
  node: e,
  fieldType: t
}) {
  var h, y, E;
  const n = (h = window.QwenPaw) == null ? void 0 : h.host, r = n == null ? void 0 : n.React, a = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const i = e.props || {}, s = r.useContext(Fr(r)), l = r.useContext(Jn(r)), o = s || l, [d, c] = r.useState(
    i.value ?? i.checked ?? ""
  ), u = hn(e), m = i.value ?? i.checked ?? "", p = o ? ((y = o.values) == null ? void 0 : y[u]) ?? m : d, b = (v) => {
    const S = v != null && v.target ? t === "Switch" ? v.target.checked : v.target.value : v;
    o ? o.setValue(u, S) : c(S);
  }, g = (v) => r.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        margin: "4px 0"
      }
    },
    i.label && t !== "Switch" ? r.createElement(
      "label",
      { style: { fontSize: 12, color: ze.muted } },
      ae(i.label),
      i.required ? r.createElement(
        "span",
        { style: { color: ze.error } },
        " *"
      ) : null
    ) : null,
    v,
    i.description ? r.createElement(
      "span",
      { style: { fontSize: 11, color: ze.muted } },
      ae(i.description)
    ) : null
  ), f = ae(i.label) || ae(i.placeholder) || u;
  return t === "Input" ? g(
    r.createElement(a.Input || "input", {
      "aria-label": f,
      placeholder: ae(i.placeholder),
      value: p,
      onChange: b,
      size: "small"
    })
  ) : t === "NumberInput" ? g(
    r.createElement(a.InputNumber || "input", {
      "aria-label": f,
      value: p,
      min: i.min,
      max: i.max,
      step: i.step,
      onChange: b,
      size: "small",
      style: { width: "100%" }
    })
  ) : t === "Textarea" ? g(
    r.createElement(((E = a.Input) == null ? void 0 : E.TextArea) || "textarea", {
      "aria-label": f,
      placeholder: ae(i.placeholder),
      value: p,
      rows: ft(i.rows) || 3,
      onChange: b,
      style: { width: "100%" }
    })
  ) : t === "Select" ? g(
    r.createElement(
      a.Select || "select",
      {
        "aria-label": f,
        placeholder: ae(i.placeholder),
        value: p || void 0,
        onChange: b,
        size: "small",
        style: { width: "100%" }
      },
      an(i.options).map(
        (v, S) => {
          var B;
          return r.createElement(
            ((B = a.Select) == null ? void 0 : B.Option) || "option",
            {
              key: S,
              value: ae(typeof v == "object" ? v.value : v)
            },
            ae(typeof v == "object" ? v.label : v)
          );
        }
      )
    )
  ) : t === "Switch" ? r.createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 8 } },
    r.createElement(a.Switch || "input", {
      type: "checkbox",
      checked: !!p,
      onChange: b,
      size: "small"
    }),
    r.createElement("span", null, ae(i.label))
  ) : t === "Slider" ? g(
    r.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 8 } },
      r.createElement(a.Slider || "input", {
        type: "range",
        value: ft(p),
        min: i.min ?? 0,
        max: i.max ?? 100,
        step: i.step ?? 1,
        onChange: b,
        style: { flex: 1 }
      }),
      r.createElement(
        "span",
        { style: { minWidth: 32, fontSize: 12 } },
        ae(p)
      )
    )
  ) : t === "FileInput" ? r.createElement(
    "label",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer"
      }
    },
    r.createElement("span", null, ae(i.label) || "选择文件"),
    r.createElement("input", {
      type: "file",
      multiple: yt(i.multiple),
      accept: ae(i.accept) || void 0,
      onChange: (v) => o == null ? void 0 : o.setValue(
        u,
        Array.from(v.target.files || []).map((S) => ({
          name: S.name,
          size: S.size,
          type: S.type
        }))
      )
    })
  ) : null;
}
function pr({
  node: e,
  link: t = !1,
  toggle: n = !1
}) {
  var p;
  const r = (p = window.QwenPaw) == null ? void 0 : p.host, a = r == null ? void 0 : r.React, i = (r == null ? void 0 : r.antd) || {};
  if (!a) return null;
  const s = e.props || {}, l = a.useContext(Fr(a)), [o, d] = a.useState(yt(s.checked)), [c, u] = a.useState(
    null
  ), m = () => {
    n && d((b) => !b), s.action && typeof s.action == "object" ? u(
      Cr(s.action, {
        formValues: l == null ? void 0 : l.values,
        formId: l ? "form" : void 0
      })
    ) : t && typeof s.href == "string" && u(
      Cr({ type: "open_url", payload: { url: s.href } })
    );
  };
  return a.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    a.createElement(
      i.Button || "button",
      {
        type: t ? "link" : (n ? o : ae(s.variant) === "primary") ? "primary" : "default",
        size: "small",
        disabled: yt(s.disabled),
        loading: yt(s.loading),
        onClick: m
      },
      ae(s.label) || "Action"
    ),
    c ? a.createElement(
      "span",
      {
        role: "status",
        style: {
          fontSize: 11,
          color: c.ok ? ze.success : ze.error
        }
      },
      c.message
    ) : null
  );
}
let ci = null, In = null;
function Wd(e) {
  return In && ci === e || (ci = e, In = class extends e.Component {
    constructor(n) {
      super(n), this.state = { hasError: !1 };
    }
    static getDerivedStateFromError() {
      return { hasError: !0 };
    }
    componentDidUpdate(n) {
      n.node !== this.props.node && this.state.hasError && this.setState({ hasError: !1 });
    }
    componentDidCatch(n) {
      console.error(
        "[ugsci.genui] Component error for kind '%s':",
        this.props.node.kind,
        n
      );
    }
    render() {
      return this.state.hasError ? e.createElement(
        "div",
        {
          style: {
            padding: 8,
            border: "1px dashed var(--ant-color-error, #ff4d4f)",
            borderRadius: 8,
            fontSize: 12,
            color: ze.error,
            fontFamily: "monospace"
          }
        },
        `Component error: ${this.props.node.kind}`
      ) : this.props.children;
    }
  }), In;
}
function Zd({ node: e }) {
  var o;
  const t = (o = window.QwenPaw) == null ? void 0 : o.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, a = bn(n), i = e.props || {}, s = e.children || [];
  return Qd(
    n,
    r,
    e,
    i,
    s,
    () => s.map(
      (d, c) => n.createElement(a, { key: d.nodeId || c, node: d })
    )
  );
}
let An = null, di = null;
function bn(e) {
  return An && di === e || (An = e.memo(
    Zd,
    (t, n) => t.node === n.node
  ), di = e), An;
}
function Jd({
  node: e
}) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    Wd(n),
    { node: e },
    n.createElement(bn(n), { node: e })
  );
}
function Qd(e, t, n, r, a, i) {
  var s, l;
  switch (n.kind) {
    // ── Layout ───────────────────────────────────────────────────────────
    case "Stack":
      return e.createElement(
        "div",
        { style: tt("Stack", r) },
        i()
      );
    case "Row":
      return e.createElement(
        "div",
        { style: tt("Row", r) },
        i()
      );
    case "Grid":
      return e.createElement(
        "div",
        { style: tt("Grid", r) },
        i()
      );
    case "Spacer":
      return e.createElement("div", { style: tt("Spacer", r) });
    case "ScrollArea":
      return e.createElement(
        "div",
        { style: tt("ScrollArea", r) },
        i()
      );
    case "AspectBox":
      return e.createElement(
        "div",
        { style: tt("AspectBox", r) },
        i()
      );
    // ── Text ─────────────────────────────────────────────────────────────
    case "Text":
      return e.createElement(
        "div",
        {
          style: {
            fontSize: li[ae(r.size)] || li.base,
            color: ze[ae(r.color)] || ze.default,
            fontWeight: yt(r.bold) ? "bold" : "normal",
            lineHeight: 1.6
          }
        },
        ae(r.value)
      );
    case "Heading": {
      const o = ws(r.level), d = {
        1: "24px",
        2: "20px",
        3: "18px",
        4: "16px"
      };
      return e.createElement(
        `h${o}`,
        {
          style: { fontSize: d[o], fontWeight: "bold", margin: "4px 0" }
        },
        ae(r.value)
      );
    }
    case "Divider":
      return e.createElement(
        t.Divider || "hr",
        r.label ? { children: ae(r.label) } : {}
      );
    case "Markdown": {
      const o = (s = window.QwenPaw) == null ? void 0 : s.host, d = o == null ? void 0 : o.ReactMarkdown;
      if (d) {
        const c = o != null && o.remarkGfm ? [o.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(d, {
            children: ae(r.content || r.value),
            remarkPlugins: c
          })
        );
      }
      return e.createElement(
        "div",
        { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } },
        ae(r.content || r.value)
      );
    }
    case "CodeBlock":
      return e.createElement(
        "pre",
        {
          style: {
            padding: 12,
            background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
            borderRadius: 8,
            overflow: "auto",
            fontSize: 13,
            fontFamily: "monospace"
          }
        },
        ae(r.code)
      );
    case "SectionHeader":
      return e.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8
          }
        },
        r.icon ? e.createElement("span", { style: { fontSize: 20 } }, ae(r.icon)) : null,
        e.createElement(
          "div",
          null,
          e.createElement(
            "div",
            { style: { fontSize: 16, fontWeight: 600 } },
            ae(r.title)
          ),
          r.subtitle ? e.createElement(
            "div",
            { style: { fontSize: 12, color: ze.muted } },
            ae(r.subtitle)
          ) : null
        )
      );
    case "KeyValueList": {
      const o = an(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...o.map(
          (d, c) => e.createElement(
            "div",
            {
              key: c,
              style: {
                display: "flex",
                justifyContent: "space-between",
                padding: "2px 0",
                borderBottom: c < o.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none"
              }
            },
            e.createElement(
              "span",
              { style: { color: ze.muted, fontSize: 13 } },
              ae(d.key)
            ),
            e.createElement(
              "span",
              { style: { fontWeight: 500, fontSize: 13 } },
              ae(d.value)
            )
          )
        )
      );
    }
    // ── Status / Display ────────────────────────────────────────────────
    case "Badge":
      return e.createElement(t.Tag || "span", {
        color: ae(r.variant) || "default",
        children: ae(r.value)
      });
    case "Tag":
      return e.createElement(t.Tag || "span", {
        color: ae(r.color) || "default",
        children: ae(r.label)
      });
    case "Stat":
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 2 } },
        e.createElement(
          "span",
          { style: { fontSize: 12, color: ze.muted } },
          ae(r.label)
        ),
        e.createElement(
          "span",
          { style: { fontSize: 20, fontWeight: "bold" } },
          ae(r.value)
        ),
        r.delta ? e.createElement(
          "span",
          {
            style: {
              fontSize: 12,
              color: ae(r.trend) === "up" ? ze.success : ae(r.trend) === "down" ? ze.error : ze.muted
            }
          },
          ae(r.delta)
        ) : null
      );
    case "Progress":
      return e.createElement(t.Progress || "div", {
        percent: ft(r.value),
        size: "small"
      });
    case "Skeleton": {
      const o = ft(r.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: o }).map(
          (d, c) => e.createElement(t.Skeleton || "div", {
            key: c,
            active: yt(r.active),
            title: !1,
            paragraph: { rows: 1 }
          })
        )
      );
    }
    case "Avatar":
      return e.createElement(Xd, {
        src: ae(r.src),
        name: ae(r.name),
        size: ft(r.size) || 32
      });
    case "Icon": {
      const o = Ss(r.name), d = ft(r.size) || 16, c = ze[ae(r.color)] || ze.default;
      return o.kind === "emoji" ? e.createElement(
        "span",
        {
          "aria-hidden": !0,
          style: { fontSize: d, color: c, lineHeight: 1 }
        },
        o.text
      ) : o.kind === "svg" ? e.createElement(
        "svg",
        {
          width: d,
          height: d,
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": !0,
          focusable: "false",
          style: { display: "inline-block", verticalAlign: "middle" }
        },
        ...o.paths.map(
          (u, m) => e.createElement("path", { key: m, d: u })
        )
      ) : e.createElement("span", {
        "aria-hidden": !0,
        style: { width: d, height: d, display: "inline-block" }
      });
    }
    // ── Cards ───────────────────────────────────────────────────────────
    case "Card":
      return e.createElement(
        t.Card || "div",
        {
          title: r.title ? ae(r.title) : void 0,
          size: "small",
          style: { margin: "4px 0" }
        },
        i()
      );
    case "DataCard":
      return e.createElement(
        t.Card || "div",
        { size: "small", style: { margin: "4px 0" } },
        e.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }
          },
          e.createElement(
            "div",
            null,
            e.createElement(
              "div",
              { style: { fontSize: 12, color: ze.muted } },
              ae(r.title)
            ),
            e.createElement(
              "div",
              { style: { fontSize: 24, fontWeight: "bold" } },
              ae(r.value)
            )
          ),
          r.icon ? e.createElement(
            "span",
            { style: { fontSize: 32 } },
            ae(r.icon)
          ) : null
        )
      );
    case "MetricCard":
      return e.createElement(
        t.Card || "div",
        { size: "small", style: { margin: "4px 0" } },
        e.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }
          },
          e.createElement(
            "div",
            null,
            e.createElement(
              "div",
              { style: { fontSize: 12, color: ze.muted } },
              ae(r.title)
            ),
            e.createElement(
              "div",
              { style: { fontSize: 24, fontWeight: "bold" } },
              ae(r.value)
            ),
            r.delta ? e.createElement(
              "span",
              {
                style: {
                  fontSize: 12,
                  color: ae(r.trend) === "up" ? ze.success : ae(r.trend) === "down" ? ze.error : ze.muted
                }
              },
              `${ae(r.delta)} ${r.period ? ae(r.period) : ""}`.trim()
            ) : null
          ),
          r.icon ? e.createElement(
            "span",
            { style: { fontSize: 32 } },
            ae(r.icon)
          ) : null
        )
      );
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", {
        type: ae(r.severity) === "success" ? "success" : ae(r.severity) === "warning" ? "warning" : ae(r.severity) === "error" ? "error" : "info",
        message: r.title ? ae(r.title) : void 0,
        description: ae(r.message),
        showIcon: !0,
        style: { margin: "4px 0" }
      });
    case "Callout":
      return e.createElement(t.Alert || "div", {
        type: ae(r.variant) === "tip" ? "success" : ae(r.variant) === "warning" ? "warning" : ae(r.variant) === "important" ? "error" : "info",
        message: r.title ? ae(r.title) : void 0,
        description: ae(r.message),
        showIcon: !0
      });
    case "TimelineCard":
      return e.createElement(
        t.Card || "div",
        { size: "small", style: { margin: "4px 0" } },
        e.createElement(
          "div",
          { style: { display: "flex", gap: 8, alignItems: "flex-start" } },
          e.createElement("div", {
            style: {
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: ae(r.status) === "done" ? ze.success : ae(r.status) === "pending" ? ze.warning : ze.primary,
              marginTop: 4,
              flexShrink: 0
            }
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              "div",
              { style: { fontWeight: 600 } },
              ae(r.title)
            ),
            r.date ? e.createElement(
              "div",
              { style: { fontSize: 12, color: ze.muted } },
              ae(r.date)
            ) : null,
            r.description ? e.createElement(
              "div",
              { style: { fontSize: 13, marginTop: 4 } },
              ae(r.description)
            ) : null
          )
        )
      );
    case "KpiBoard":
      return e.createElement(
        "div",
        { style: { margin: "4px 0" } },
        r.title ? e.createElement(
          "div",
          { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } },
          ae(r.title)
        ) : null,
        e.createElement(
          "div",
          { style: tt("KpiBoard", r) },
          i()
        )
      );
    case "FeatureGrid":
      return e.createElement(
        "div",
        { style: { ...tt("FeatureGrid", r), margin: "4px 0" } },
        i()
      );
    case "Stepper": {
      const o = an(r.steps).map((c) => ae(c)), d = ft(r.current);
      return e.createElement(
        t.Steps || "div",
        { current: d, size: "small", style: { margin: "4px 0" } },
        ...o.map(
          (c, u) => {
            var m;
            return e.createElement(((m = t.Steps) == null ? void 0 : m.Item) || "div", {
              key: u,
              title: c
            });
          }
        )
      );
    }
    // ── Table / List ────────────────────────────────────────────────────
    case "Table": {
      const o = an(r.headers).map((m) => ae(m)), c = a.filter((m) => m.kind === "TableRow").map((m, p) => {
        const b = (m.children || []).filter(
          (f) => f.kind === "TableCell"
        ), g = { key: p };
        return o.forEach((f, h) => {
          var E, v;
          const y = (v = (E = b[h]) == null ? void 0 : E.props) == null ? void 0 : v.value;
          g[f] = y == null ? "" : ae(y);
        }), g;
      }), u = o.map((m) => ({ title: m, dataIndex: m, key: m }));
      return e.createElement(t.Table || "table", {
        dataSource: c,
        columns: u,
        size: yt(r.compact) ? "small" : "middle",
        pagination: !1,
        style: { margin: "4px 0" }
      });
    }
    case "List": {
      const o = a.filter((d) => d.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        o.map(
          (d, c) => {
            var u, m, p;
            return e.createElement(
              ((u = t.List) == null ? void 0 : u.Item) || "li",
              { key: c },
              (m = d.props) != null && m.icon ? e.createElement(
                "span",
                { style: { marginRight: 6 } },
                ae(d.props.icon)
              ) : null,
              ae((p = d.props) == null ? void 0 : p.value)
            );
          }
        )
      );
    }
    case "ImageGallery": {
      const o = a.filter((d) => d.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...tt("ImageGallery", r), margin: "4px 0" } },
        ...o.map((d, c) => {
          const u = d.props || {};
          return e.createElement(Tr, {
            key: c,
            src: ae(u.src),
            alt: ae(u.alt),
            style: {
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 8,
              cursor: "pointer"
            }
          });
        })
      );
    }
    // ── Media ───────────────────────────────────────────────────────────
    case "Image":
      return e.createElement(
        "div",
        null,
        e.createElement(Tr, {
          src: ae(r.src),
          alt: ae(r.alt),
          style: {
            maxWidth: "100%",
            borderRadius: yt(r.rounded) ? "8px" : void 0,
            maxHeight: r.maxHeight ? `${ft(r.maxHeight)}px` : void 0
          }
        }),
        r.caption ? e.createElement(
          "div",
          { style: { fontSize: 12, color: ze.muted } },
          ae(r.caption)
        ) : null
      );
    case "Chart":
      return e.createElement(Kd, { props: r });
    // ── Interactive ─────────────────────────────────────────────────────
    case "Button":
    case "InteractiveButton":
      return e.createElement(pr, { node: n });
    case "ToggleButton":
      return e.createElement(pr, { node: n, toggle: !0 });
    case "LinkButton":
      return e.createElement(pr, { node: n, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(Gd, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(Fd, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", {
        color: ae(r.color) || "default",
        closable: !0,
        onClose: () => {
        },
        children: ae(r.label)
      });
    case "ChipGroup": {
      const o = an(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
        ...o.map(
          (d, c) => e.createElement(t.Tag || "span", { key: c }, ae(d))
        )
      );
    }
    // ── Tabs / Accordion ────────────────────────────────────────────────
    case "Tabs": {
      const o = bn(e), c = a.filter((u) => u.kind === "TabItem").map((u) => {
        var m, p, b;
        return {
          key: ae((m = u.props) == null ? void 0 : m.key) || ae((p = u.props) == null ? void 0 : p.tab),
          label: ae((b = u.props) == null ? void 0 : b.tab),
          children: (u.children || []).map(
            (g, f) => e.createElement(o, { key: g.nodeId || f, node: g })
          )
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, {
        items: c,
        defaultActiveKey: ae(r.activeKey) || ((l = c[0]) == null ? void 0 : l.key)
      }) : e.createElement(
        "div",
        null,
        ...c.map(
          (u, m) => e.createElement(
            "div",
            { key: m },
            e.createElement(
              "div",
              { style: { fontWeight: 600, marginBottom: 4 } },
              u.label
            ),
            u.children
          )
        )
      );
    }
    case "TabItem":
      return e.createElement("div", null, i());
    case "Accordion": {
      const o = bn(e), d = a.filter((c) => c.kind === "AccordionItem");
      if (t.Collapse) {
        const c = d.map((u) => {
          var m, p, b;
          return {
            key: ae((m = u.props) == null ? void 0 : m.key) || ae((p = u.props) == null ? void 0 : p.header),
            label: ae((b = u.props) == null ? void 0 : b.header),
            children: (u.children || []).map(
              (g, f) => e.createElement(o, { key: g.nodeId || f, node: g })
            )
          };
        });
        return e.createElement(t.Collapse, { items: c });
      }
      return e.createElement(
        "div",
        null,
        ...d.map(
          (c, u) => {
            var m;
            return e.createElement(
              "details",
              { key: u },
              e.createElement(
                "summary",
                {
                  style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" }
                },
                ae((m = c.props) == null ? void 0 : m.header)
              ),
              e.createElement(
                "div",
                { style: { paddingLeft: 12 } },
                (c.children || []).map(
                  (p, b) => e.createElement(o, { key: p.nodeId || b, node: p })
                )
              )
            );
          }
        )
      );
    }
    case "AccordionItem":
      return e.createElement("div", null, i());
    // ── Debug ───────────────────────────────────────────────────────────
    case "JsonDebug":
      return e.createElement(
        "details",
        { style: { margin: "4px 0", fontSize: 12 } },
        e.createElement("summary", null, ae(r.label) || "Debug JSON"),
        e.createElement(
          "pre",
          {
            style: {
              fontSize: 12,
              padding: 8,
              background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
              borderRadius: 4,
              overflow: "auto"
            }
          },
          JSON.stringify(r.data ?? r, null, 2)
        )
      );
    // ── Unknown (safe placeholder) ──────────────────────────────────────
    default:
      return e.createElement(
        "div",
        {
          style: {
            padding: 8,
            border: "1px dashed var(--ant-color-border, #d9d9d9)",
            borderRadius: 8,
            fontSize: 12,
            color: ze.muted,
            fontFamily: "monospace"
          }
        },
        `Unknown component: ${n.kind}`
      );
  }
}
function Kd({
  props: e
}) {
  var B, N;
  const t = (N = (B = window.QwenPaw) == null ? void 0 : B.host) == null ? void 0 : N.React;
  if (!t) return null;
  const n = t.useContext(Jn(t)), r = Vr(e, n == null ? void 0 : n.values), a = r.chartType, i = r.title, s = r.categories, l = r.series, o = r.height, d = r.showLegend, c = 400;
  if (r.empty)
    return t.createElement(
      "div",
      { style: { padding: 12, color: ze.muted, fontSize: 12 } },
      "Chart: no data"
    );
  if (a === "pie") {
    const w = l[0].values.map((F) => Math.abs(F)), x = w.reduce((F, C) => F + C, 0) || 1, R = c / 2, H = o / 2, _ = Math.min(c, o) / 2 - 20;
    let T = -Math.PI / 2;
    const $ = w.map((F, C) => {
      const I = F / x * 2 * Math.PI, L = R + _ * Math.cos(T), M = H + _ * Math.sin(T), P = R + _ * Math.cos(T + I), W = H + _ * Math.sin(T + I), G = I > Math.PI ? 1 : 0, U = `M ${R} ${H} L ${L} ${M} A ${_} ${_} 0 ${G} 1 ${P} ${W} Z`;
      return T += I, {
        path: U,
        color: Rt[C % Rt.length],
        label: s[C] || `#${C + 1}`,
        val: F
      };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      i ? t.createElement(
        "div",
        { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } },
        i
      ) : null,
      t.createElement(
        "svg",
        { width: c, height: o, style: { maxWidth: "100%" } },
        ...$.map(
          (F, C) => t.createElement("path", {
            key: C,
            d: F.path,
            fill: F.color,
            stroke: "#fff",
            strokeWidth: 1
          })
        )
      ),
      d ? t.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 4,
            fontSize: 11
          }
        },
        ...$.map(
          (F, C) => t.createElement(
            "span",
            {
              key: C,
              style: { display: "flex", alignItems: "center", gap: 4 }
            },
            t.createElement("span", {
              style: {
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 2,
                background: F.color
              }
            }),
            `${F.label}: ${F.val}`
          )
        )
      ) : null
    );
  }
  const u = l.flatMap((w) => w.values), m = Math.max(...u, 0), p = Math.min(...u, 0), b = m - p || 1, g = s.length > 0 ? (c - 40) / s.length : 0, f = l.length > 0 ? Math.max(1, g / l.length - 2) : 0, h = s.length > 1 ? (c - 40) / (s.length - 1) : 0, y = Math.max(1, Math.ceil(s.length / 8)), E = (w) => o - 20 - (w - p) / b * (o - 40), v = E(0), S = (w) => 30 + w * h;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    i ? t.createElement(
      "div",
      { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } },
      i
    ) : null,
    t.createElement(
      "svg",
      { width: c, height: o, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((w, x) => {
        const R = o - 20 - w * (o - 40);
        return t.createElement("line", {
          key: `g${x}`,
          x1: 30,
          y1: R,
          x2: c - 10,
          y2: R,
          stroke: "var(--ant-color-border-secondary, #f0f0f0)",
          strokeWidth: 1
        });
      }),
      ...s.map(
        (w, x) => x % y === 0 || x === s.length - 1 ? t.createElement(
          "text",
          {
            key: `x${x}`,
            x: S(x),
            y: o - 6,
            fontSize: 10,
            fill: ze.muted,
            textAnchor: "middle"
          },
          w.length > 6 ? w.slice(0, 6) + "…" : w
        ) : null
      ),
      ...l.map((w, x) => {
        const R = Rt[x % Rt.length];
        if (a === "bar")
          return w.values.map(
            (T, $) => t.createElement("rect", {
              key: `b${x}-${$}`,
              x: 30 + $ * g + x * (f + 2) + 1,
              y: Math.min(E(T), v),
              width: f,
              height: Math.abs(v - E(T)),
              fill: R,
              rx: 2
            })
          );
        const H = w.values.map((T, $) => `${S($)},${E(T)}`).join(" "), _ = [
          t.createElement("polyline", {
            key: `l${x}`,
            points: H,
            fill: "none",
            stroke: R,
            strokeWidth: 2
          })
        ];
        if (a === "area") {
          const T = `${S(0)},${o - 20} ${H} ${S(
            w.values.length - 1
          )},${o - 20}`;
          _.unshift(
            t.createElement("polygon", {
              key: `a${x}`,
              points: T,
              fill: R,
              opacity: 0.15
            })
          );
        }
        return _;
      })
    ),
    d ? t.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 4,
          fontSize: 11
        }
      },
      ...l.map(
        (w, x) => t.createElement(
          "span",
          {
            key: x,
            style: { display: "flex", alignItems: "center", gap: 4 }
          },
          t.createElement("span", {
            style: {
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 2,
              background: Rt[x % Rt.length]
            }
          }),
          w.name
        )
      )
    ) : null
  );
}
function Tr(e) {
  var d;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { useState: r, useEffect: a } = n, [i, s] = r(
    si(e.src) || (Hn(e.src) ? e.src : null)
  ), [l, o] = r(
    oi(e.src)
  );
  return a(() => {
    if (!e.src) return;
    if (Hn(e.src)) {
      s(e.src), o(null);
      return;
    }
    const c = si(e.src);
    if (c) {
      s(c), o(null);
      return;
    }
    s(null), o(null);
    let u = !1;
    return Ad(e.src).then((m) => {
      u || (s(m), o(m ? null : oi(e.src)));
    }), () => {
      u = !0;
    };
  }, [e.src]), i ? n.createElement("img", {
    src: i,
    alt: e.alt || "",
    "data-genui-media-source": e.src,
    style: e.style || {},
    onError: () => {
      console.warn("[ugsci.genui] Image failed to load:", e.src);
    }
  }) : n.createElement(
    "div",
    {
      role: l ? "alert" : "status",
      style: {
        ...e.style || {},
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
        padding: 12,
        textAlign: "center",
        color: l ? ze.error : ze.muted,
        fontSize: 12,
        background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
        borderRadius: 8
      }
    },
    l ? `媒体加载失败：${l}` : "正在解析图片…"
  );
}
function Xd(e) {
  var a, i, s;
  const t = (a = window.QwenPaw) == null ? void 0 : a.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  return n ? e.src ? n.createElement(Tr, {
    src: e.src,
    alt: e.name,
    style: {
      width: e.size,
      height: e.size,
      borderRadius: "50%",
      objectFit: "cover"
    }
  }) : n.createElement(
    r.Avatar || "div",
    { size: e.size },
    ((s = (i = e.name) == null ? void 0 : i.charAt(0)) == null ? void 0 : s.toUpperCase()) || ""
  ) : null;
}
const Yd = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
.stack { display: flex; flex-direction: column; gap: 12px; } .row { display: flex; gap: 12px; align-items: center; } .grid { display: grid; gap: 12px; }
.card { padding: 14px; border: 1px solid #e5e7eb; border-radius: 10px; } .card-title,.chart-title { margin-bottom: 8px; font-weight: 600; } .card-subtitle { margin-top: -5px; margin-bottom: 8px; }
.field { display: flex; flex-direction: column; gap: 5px; margin: 5px 0; } .field-label,.description { color: #667085; font-size: 12px; }
input,select,textarea,button { font: inherit; } input:not([type=range]):not([type=checkbox]),select,textarea { width: 100%; padding: 7px 9px; border: 1px solid #d0d5dd; border-radius: 6px; }
input[type=range] { flex: 1; accent-color: #1677ff; } .slider-line,.switch-line { display: flex; align-items: center; gap: 10px; } .slider-value { min-width: 42px; font-size: 12px; }
button { padding: 6px 12px; border: 1px solid #d0d5dd; border-radius: 6px; background: #fff; cursor: pointer; } button.active,.button:hover { color: #1677ff; border-color: #1677ff; }
.tabs { margin: 6px 0; } .tab-buttons { display: flex; gap: 4px; border-bottom: 1px solid #e5e7eb; } .tab-buttons button { border: 0; border-radius: 0; } .tab-buttons button.active { border-bottom: 2px solid #1677ff; } .tab-panel { padding: 12px 2px; } .hidden { display: none; }
details { border-bottom: 1px solid #e5e7eb; } summary { padding: 9px 0; cursor: pointer; font-weight: 600; } .accordion-body { padding: 0 0 10px 12px; }
.chart svg { display: block; width: 100%; height: auto; min-height: 180px; } .legend { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; } .legend span { display: flex; align-items: center; gap: 4px; } .legend i { width: 10px; height: 10px; border-radius: 2px; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #f0f5ff; color: #1677ff; } .alert { padding: 10px 12px; border: 1px solid #91caff; border-radius: 8px; background: #e6f4ff; }
.code { padding: 12px; overflow: auto; border-radius: 8px; background: #f2f4f7; } .divider { display: flex; align-items: center; margin: 10px 0; border-top: 1px solid #e5e7eb; } .divider span { padding-right: 8px; background: white; transform: translateY(-50%); }
figure { margin: 0; } img { max-width: 100%; } .bold { font-weight: 700; } .muted { color: #667085; } .small { font-size: 12px; } .display-value,.stat-value { font-size: 24px; font-weight: 700; } .offline-status { display: block; margin-top: 5px; color: #b54708; }
.image-gallery { display: grid; gap: 8px; } .avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; display: inline-flex; align-items: center; justify-content: center; } .avatar-fallback { background: #e6f4ff; color: #1677ff; font-weight: 700; }
.icon { display: inline-flex; align-items: center; justify-content: center; } .icon svg { display: block; }
.media-unavailable { min-height: 96px; display: flex; align-items: center; justify-content: center; padding: 12px; border: 1px dashed #f79009; border-radius: 8px; color: #b54708; background: #fffaeb; }
.metric-card { display: flex; justify-content: space-between; align-items: center; } .metric-icon,.section-icon { font-size: 28px; } .section-header { display: flex; align-items: center; gap: 8px; } .profile { display: flex; gap: 12px; align-items: center; }
.key-values { display: grid; grid-template-columns: minmax(100px, 1fr) minmax(120px, 2fr); gap: 5px 12px; margin: 0; } .key-values dt { color: #667085; } .key-values dd { margin: 0; font-weight: 500; text-align: right; }
.data-table { width: 100%; border-collapse: collapse; } .data-table th,.data-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; } .data-table .highlight { background: #f0f5ff; }
.chips { display: flex; flex-wrap: wrap; gap: 4px; } .skeletons { display: flex; flex-direction: column; gap: 8px; } .skeleton { height: 12px; border-radius: 6px; background: #eaecf0; } .scroll-area { overflow-y: auto; } .aspect-box { overflow: hidden; display: flex; align-items: center; justify-content: center; }
.unknown-component { padding: 8px; border: 1px dashed #d0d5dd; border-radius: 8px; color: #667085; font: 12px ui-monospace, monospace; }
@media print { body { padding: 0; } }`, ui = {
  Stack: "stack",
  Row: "row",
  Grid: "grid",
  Card: "card",
  Alert: "alert",
  AlertCard: "alert",
  Callout: "alert",
  FeatureGrid: "grid",
  ScrollArea: "scroll-area",
  AspectBox: "aspect-box",
  Form: "stack form",
  KpiBoard: "stack"
};
function eu(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function tu(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function ie(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = Te(n)), r;
}
function $n(e, t) {
  Object.assign(e.style, t);
}
function en(e, t, n) {
  for (const r of t || [])
    e.appendChild(Gr(r, n));
  return e;
}
function mi(e, t, n) {
  return t && e.appendChild(ie("div", "muted small", t)), e.appendChild(ie("div", "display-value", n)), e;
}
function _s(e, t, n, r) {
  const a = Te(e);
  if (r.missing.has(a)) {
    const s = ie(
      "div",
      `media-unavailable ${n}`.trim(),
      "此媒体未能离线嵌入"
    );
    return s.setAttribute("role", "img"), s.setAttribute("aria-label", Te(t)), s;
  }
  const i = ie("img", n);
  return i.src = r.media[a] || a, i.alt = Te(t), i;
}
function nu(e, t, n) {
  return e ? _s(e, t, "avatar", n) : ie(
    "span",
    "avatar avatar-fallback",
    Te(t).charAt(0).toUpperCase()
  );
}
function ru(e) {
  const t = ie("div", "markdown");
  let n = null;
  for (const r of Te(e).split(/\r?\n/)) {
    const a = r.match(/^(#{1,4})\s+(.*)$/), i = r.match(/^\s*[-*]\s+(.*)$/);
    a ? (n = null, t.appendChild(ie(`h${a[1].length}`, "", a[2]))) : i ? (n || (n = ie("ul"), t.appendChild(n)), n.appendChild(ie("li", "", i[1]))) : r.trim() ? (n = null, t.appendChild(ie("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function au(e, t) {
  const n = e.props || {}, r = e.kind, a = hn(e), i = ie("label", "field");
  n.label && r !== "Switch" && i.appendChild(
    ie(
      "span",
      "field-label",
      `${Te(n.label)}${n.required ? " *" : ""}`
    )
  );
  let s;
  if (r === "Textarea") {
    const o = ie("textarea");
    o.rows = nt(n.rows) || 3, o.placeholder = Te(n.placeholder), s = o;
  } else if (r === "Select") {
    const o = ie("select");
    for (const d of rn(n.options)) {
      const c = ie("option"), u = d && typeof d == "object" ? d : null;
      c.value = Te(u ? u.value : d), c.textContent = Te(u ? u.label : d), o.appendChild(c);
    }
    s = o;
  } else {
    const o = ie("input");
    o.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (o.min = Te(n.min)), n.max != null && (o.max = Te(n.max)), n.step != null && (o.step = Te(n.step)), r === "FileInput" ? (n.accept && (o.accept = Te(n.accept)), o.multiple = un(n.multiple)) : o.placeholder = Te(n.placeholder), s = o;
  }
  const l = Object.prototype.hasOwnProperty.call(t.values, a) ? t.values[a] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const o = s;
    o.checked = un(l), o.checked ? o.setAttribute("checked", "") : o.removeAttribute("checked");
  } else if (r === "Textarea")
    s.value = Te(l), s.textContent = Te(l);
  else if (r === "Select") {
    const o = Te(l);
    s.value = o;
    for (const d of Array.from(s.options))
      d.value === o ? d.setAttribute("selected", "") : d.removeAttribute("selected");
  } else r !== "FileInput" && (s.value = Te(l), s.setAttribute("value", Te(l)));
  if (s.setAttribute("data-genui-field", a), s.setAttribute("data-genui-kind", r), r === "Switch") {
    const o = ie("span", "switch-line");
    o.append(s, ie("span", "", n.label)), i.appendChild(o);
  } else if (r === "Slider") {
    const o = ie("span", "slider-line");
    o.append(s, ie("output", "slider-value", l)), i.appendChild(o);
  } else
    i.appendChild(s);
  return n.description && i.appendChild(ie("small", "description", n.description)), i;
}
function Gr(e, t) {
  var i, s, l, o, d, c, u;
  if (!e || typeof e != "object") return ie("div");
  const n = e.props || {}, r = e.children || [];
  if (Es(e.kind)) return au(e, t);
  if (e.kind === "Chart") {
    const m = ie("div", "chart");
    return m.setAttribute("data-genui-chart", JSON.stringify(n)), xs(m, Vr(n, t.values)), m;
  }
  if (e.kind === "Heading")
    return ie(`h${ws(n.level)}`, "", n.value);
  if (e.kind === "Text")
    return ie("div", un(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown")
    return ru(n.content || n.value);
  if (e.kind === "CodeBlock") return ie("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const m = ie("div", "section-header");
    n.icon && m.appendChild(ie("span", "section-icon", n.icon));
    const p = ie("div");
    return p.appendChild(ie("strong", "", n.title)), n.subtitle && p.appendChild(ie("div", "muted small", n.subtitle)), m.appendChild(p), m;
  }
  if (e.kind === "KeyValueList") {
    const m = ie("dl", "key-values");
    for (const p of rn(n.items)) {
      const b = p && typeof p == "object" ? p : {};
      m.append(ie("dt", "", b.key), ie("dd", "", b.value));
    }
    return m;
  }
  if (e.kind === "Divider") {
    const m = ie("div", "divider");
    return n.label && m.appendChild(ie("span", "", n.label)), m;
  }
  if (e.kind === "Spacer") {
    const m = ie("div");
    return $n(m, tt("Spacer", n)), m;
  }
  if (e.kind === "Tabs") {
    const m = ie("div", "tabs");
    m.setAttribute("data-genui-tabs", "1");
    const p = ie("div", "tab-buttons"), b = ie("div");
    return r.filter((f) => f.kind === "TabItem").forEach((f, h) => {
      var y;
      p.appendChild(ie("button", h ? "" : "active", (y = f.props) == null ? void 0 : y.tab)), b.appendChild(
        en(
          ie("div", h ? "tab-panel hidden" : "tab-panel"),
          f.children,
          t
        )
      );
    }), m.append(p, b), m;
  }
  if (e.kind === "Accordion") {
    const m = ie("div");
    for (const p of r.filter(
      (b) => b.kind === "AccordionItem"
    )) {
      const b = ie("details");
      b.append(
        ie("summary", "", (i = p.props) == null ? void 0 : i.header),
        en(ie("div", "accordion-body"), p.children, t)
      ), m.appendChild(b);
    }
    return m;
  }
  if (e.kind === "Form") {
    const m = ie("div", "stack form");
    n.title && m.appendChild(ie("div", "card-title", n.title)), en(m, r, t);
    const p = ie("button", "button", Te(n.submitLabel) || "提交");
    return p.setAttribute("data-genui-submit", "1"), m.appendChild(p), m;
  }
  if (Ld.has(e.kind)) {
    const m = ie(
      "button",
      e.kind === "LinkButton" ? "link-button" : "button",
      Te(n.label) || "Action"
    );
    return un(n.disabled) && (m.disabled = !0), m.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && Nd(n.href) && m.setAttribute("data-genui-href", Te(n.href).trim()), m;
  }
  if (e.kind === "Image") {
    const m = ie("figure");
    return m.appendChild(_s(n.src, n.alt, "", t)), n.caption && m.appendChild(ie("figcaption", "", n.caption)), m;
  }
  if (e.kind === "ImageGallery") {
    const m = ie("div", "image-gallery");
    $n(m, tt("ImageGallery", n));
    for (const p of r.filter((b) => b.kind === "Image"))
      m.appendChild(Gr(p, t));
    return m;
  }
  if (e.kind === "Avatar") return nu(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return ie("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const m = ie("progress");
    return m.max = 100, m.value = nt(n.value), m;
  }
  if (e.kind === "Stat") {
    const m = ie("div", "stat");
    return m.append(
      ie("span", "muted small", n.label),
      ie("strong", "stat-value", n.value)
    ), n.delta && m.appendChild(
      ie("span", `small trend-${Te(n.trend)}`, n.delta)
    ), m;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const m = ie("div", "card metric-card"), p = mi(ie("div"), n.title, n.value);
    return n.delta && p.appendChild(
      ie(
        "div",
        `small trend-${Te(n.trend)}`,
        `${Te(n.delta)}${n.period ? ` ${Te(n.period)}` : ""}`
      )
    ), m.appendChild(p), n.icon && m.appendChild(ie("span", "metric-icon", n.icon)), m;
  }
  if (e.kind === "TimelineCard") {
    const m = ie("div", "card timeline");
    return m.append(
      ie("i", `timeline-dot status-${Te(n.status)}`),
      mi(ie("div"), n.title, n.date)
    ), n.description && m.appendChild(ie("div", "small", n.description)), m;
  }
  if (e.kind === "Stepper") {
    const m = ie("ol", "stepper");
    return rn(n.steps).forEach((p, b) => {
      m.appendChild(
        ie("li", b <= nt(n.current) ? "active" : "", p)
      );
    }), m;
  }
  if (e.kind === "Table") {
    const m = ie("table", "data-table"), p = ie("thead"), b = ie("tr");
    for (const f of rn(n.headers))
      b.appendChild(ie("th", "", f));
    p.appendChild(b);
    const g = ie("tbody");
    for (const f of r.filter((h) => h.kind === "TableRow")) {
      const h = ie("tr", (s = f.props) != null && s.highlight ? "highlight" : "");
      for (const y of (f.children || []).filter(
        (E) => E.kind === "TableCell"
      )) {
        const E = ie("td", (l = y.props) != null && l.bold ? "bold" : "", (o = y.props) == null ? void 0 : o.value);
        (d = y.props) != null && d.align && (E.style.textAlign = Te(y.props.align)), h.appendChild(E);
      }
      g.appendChild(h);
    }
    return m.append(p, g), m;
  }
  if (e.kind === "List") {
    const m = ie(un(n.ordered) ? "ol" : "ul", "data-list");
    for (const p of r.filter((b) => b.kind === "ListItem"))
      m.appendChild(
        ie(
          "li",
          "",
          `${(c = p.props) != null && c.icon ? `${Te(p.props.icon)} ` : ""}${Te(
            (u = p.props) == null ? void 0 : u.value
          )}`
        )
      );
    return m;
  }
  if (e.kind === "ChipGroup") {
    const m = ie("div", "chips");
    for (const p of rn(n.items))
      m.appendChild(ie("span", "tag", p));
    return m;
  }
  if (e.kind === "Skeleton") {
    const m = ie("div", "skeletons");
    for (let p = 0; p < (nt(n.rows) || 3); p += 1)
      m.appendChild(ie("i", "skeleton"));
    return m;
  }
  if (e.kind === "Icon") {
    const m = ie("span", "icon");
    return Ud(m, n.name, { size: nt(n.size) || 16 }), m;
  }
  if (e.kind === "JsonDebug") {
    const m = ie("details");
    return m.append(
      ie("summary", "", Te(n.label) || "Debug JSON"),
      ie(
        "pre",
        "code",
        JSON.stringify(n.data == null ? n : n.data, null, 2)
      )
    ), m;
  }
  if (e.kind === "KpiBoard") {
    const m = ie("div", "stack");
    n.title && m.appendChild(ie("div", "card-title", n.title));
    const p = ie("div", "grid");
    return $n(p, tt("KpiBoard", n)), en(p, r, t), m.appendChild(p), m;
  }
  if (!Object.prototype.hasOwnProperty.call(ui, e.kind))
    return ie(
      "div",
      "unknown-component",
      `Unknown component: ${Te(e.kind)}`
    );
  const a = ie("div", ui[e.kind]);
  return $n(a, tt(e.kind, n)), e.kind === "Card" && n.title && a.appendChild(ie("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && a.appendChild(ie("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && a.appendChild(ie("strong", "", n.title)), n.message && a.appendChild(ie("div", "", n.message))) : en(a, r, t), a;
}
function pi(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function iu() {
  return `(function () {
  "use strict";
  ${pi(Vr, "resolveChartModel")}
  ${pi(xs, "paintChartElement")}
  var values = JSON.parse(document.getElementById("genui-values-data").textContent || "{}");
  function refreshCharts() {
    document.querySelectorAll("[data-genui-chart]").forEach(function (holder) {
      var props = JSON.parse(holder.getAttribute("data-genui-chart") || "{}");
      paintChartElement(holder, resolveChartModel(props, values));
    });
  }
  document.querySelectorAll("[data-genui-field]").forEach(function (control) {
    var name = control.getAttribute("data-genui-field");
    var kind = control.getAttribute("data-genui-kind");
    var output = control.parentElement && control.parentElement.querySelector("output");
    var update = function () {
      if (kind === "Switch") values[name] = control.checked;
      else if (kind === "NumberInput" || kind === "Slider") values[name] = Number(control.value);
      else if (kind === "FileInput") values[name] = Array.prototype.map.call(control.files || [], function (file) { return { name: file.name, size: file.size, type: file.type }; });
      else values[name] = control.value;
      if (output) output.textContent = String(values[name]);
      refreshCharts();
    };
    if (Object.prototype.hasOwnProperty.call(values, name) && kind !== "FileInput") {
      if (kind === "Switch") control.checked = Boolean(values[name]);
      else control.value = String(values[name] == null ? "" : values[name]);
      if (output) output.textContent = String(values[name]);
    }
    control.addEventListener(kind === "Select" || kind === "Switch" || kind === "FileInput" ? "change" : "input", update);
  });
  refreshCharts();
  document.querySelectorAll("[data-genui-tabs]").forEach(function (root) {
    var buttons = root.querySelector(".tab-buttons");
    var panels = buttons && buttons.nextElementSibling;
    if (!buttons || !panels) return;
    Array.prototype.forEach.call(buttons.children, function (button, index) {
      button.addEventListener("click", function () {
        Array.prototype.forEach.call(buttons.children, function (item) { item.classList.remove("active"); });
        Array.prototype.forEach.call(panels.children, function (item) { item.classList.add("hidden"); });
        button.classList.add("active");
        if (panels.children[index]) panels.children[index].classList.remove("hidden");
      });
    });
  });
  document.querySelectorAll("[data-genui-submit]").forEach(function (button) {
    button.addEventListener("click", function () {
      var form = button.parentElement;
      if (form && !form.querySelector(".offline-status")) {
        var status = document.createElement("small");
        status.className = "offline-status";
        status.textContent = "这是离线导出页面，表单值会保留在当前页面中，但不会提交到 QwenPaw。";
        form.appendChild(status);
      }
    });
  });
  document.querySelectorAll("[data-genui-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      var kind = button.getAttribute("data-genui-action");
      var href = button.getAttribute("data-genui-href") || "";
      if (kind === "ToggleButton") button.classList.toggle("active");
      else if (kind === "LinkButton" && /^https?:\\/\\//.test(href)) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        var status = button.nextElementSibling;
        if (!status || !status.classList.contains("offline-status")) {
          status = document.createElement("small");
          status.className = "offline-status";
          status.textContent = "离线导出不支持发送消息或提交到 QwenPaw";
          button.after(status);
        }
      }
    });
  });
  window.__GENUI_EXPORT__ = { values: values, refresh: refreshCharts };
})();`;
}
function su(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = ie("main");
  return r.id = "genui-root", r.appendChild(
    Gr(e, {
      values: t,
      media: n.sources || {},
      missing: new Set(n.missing || [])
    })
  ), r;
}
function Cs(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const a = su(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${eu(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${Yd}
  </style>
</head>
<body>${a.outerHTML}
<script id="genui-values-data" type="application/json">${tu(
    t
  )}<\/script>
<script>${iu()}<\/script></body>
</html>`;
}
function Ts(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function ou(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => np), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  Ts(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", {
    filename: t,
    via: "html-to-image"
  });
}
function lu(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function cu(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await lu(await n.blob()) : null;
  } catch {
    try {
      const n = document.createElement("canvas");
      n.width = e.naturalWidth, n.height = e.naturalHeight;
      const r = n.getContext("2d");
      return !r || !n.width || !n.height ? null : (r.drawImage(e, 0, 0), n.toDataURL("image/png"));
    } catch {
      return null;
    }
  }
}
async function Ms(e) {
  const t = {}, n = [], r = Array.from(
    e.querySelectorAll("img[data-genui-media-source]")
  );
  return await Promise.all(
    r.map(async (a) => {
      const i = a.dataset.genuiMediaSource || "", s = await cu(a);
      i && (s ? t[i] = s : n.push(i));
    })
  ), { sources: t, missing: Array.from(new Set(n)) };
}
async function du(e, t, n, r, a = r) {
  const i = await Ms(e), s = Cs(
    t,
    n,
    i,
    a
  ), l = new Blob([s], { type: "text/html;charset=utf-8" }), o = URL.createObjectURL(l);
  Ts(o, `${r}.html`), setTimeout(() => URL.revokeObjectURL(o), 1e3), i.missing.length && console.warn(
    "[ugsci.genui] HTML export has media that could not be embedded",
    { filename: r, missing: i.missing }
  ), console.info("[ugsci.genui] HTML export created", {
    filename: r,
    bytes: l.size,
    embeddedMedia: Object.keys(i.sources).length,
    missingMedia: i.missing.length
  });
}
async function uu(e, t, n, r) {
  const a = await Ms(e), i = Cs(
    t,
    n,
    a,
    r
  ), s = window.open("", "_blank", "noopener,noreferrer");
  if (!s) throw new Error("print window was blocked");
  s.document.open(), s.document.write(i), s.document.close(), await new Promise((l) => {
    const o = () => l();
    if (s.document.readyState === "complete") {
      window.setTimeout(o, 50);
      return;
    }
    s.addEventListener("load", o, { once: !0 }), window.setTimeout(o, 400);
  }), s.focus(), s.print(), s.close(), a.missing.length && console.warn(
    "[ugsci.genui] PDF print has media that could not be embedded",
    { missing: a.missing }
  );
}
const Qe = "var(--ant-color-text, rgba(0, 0, 0, 0.88))", Fe = "var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45))", Nt = "var(--ant-color-border-secondary, #f0f0f0)", Mr = "var(--ant-color-bg-container, #fff)", Ir = "var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02))", Is = "var(--ant-color-success, #52c41a)", mu = "var(--ant-color-success-bg, #f6ffed)", pu = "var(--ant-color-warning, #faad14)", gu = "var(--ant-color-warning-bg, #fffbe6)", As = "var(--ant-color-error, #ff4d4f)", fu = "var(--ant-color-error-bg, #fff2f0)", gi = "var(--ant-color-primary, #1677ff)", yu = {
  derived_expression: "推导结果",
  effective_inventory: "有效库存",
  estimated_ogip: "估算原始储量",
  initial_p_over_z: "初始 p/z",
  current_p_over_z: "当前 p/z",
  recovery_factor: "采收率",
  remaining_gas: "剩余气量",
  result: "计算结果",
  transformed_expression: "变换结果"
}, $s = {
  current_pressure: "当前压力",
  current_z_factor: "当前 z 因子",
  initial_pressure: "初始压力",
  initial_z_factor: "初始 z 因子",
  produced_gas: "累计产气量"
};
function vn(e) {
  return yu[e] || $s[e] || e.replace(/[_.-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function hu(e, t = "") {
  if (!Number.isFinite(e)) return String(e);
  if (/(factor|fraction|efficiency|ratio|rate)$/i.test(t) && Math.abs(e) <= 1)
    return `${new Intl.NumberFormat("zh-CN", {
      maximumFractionDigits: 2
    }).format(e * 100)}%`;
  const n = Math.abs(e);
  return n >= 1e9 || n > 0 && n < 1e-4 ? e.toExponential(4) : new Intl.NumberFormat("zh-CN", {
    maximumSignificantDigits: 7
  }).format(e);
}
function Un(e, t = "") {
  if (typeof e == "number") return hu(e, t);
  if (typeof e == "boolean") return e ? "是" : "否";
  if (e == null) return "—";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function fi(e) {
  const t = [
    "result",
    "estimated_ogip",
    "effective_inventory",
    "derived_expression",
    "transformed_expression",
    "remaining_gas",
    "recovery_factor"
  ], n = t.indexOf(e);
  return n < 0 ? t.length : n;
}
function bu(e) {
  const t = e == null ? void 0 : e.result;
  return !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(
    ([, n]) => ["string", "number", "boolean"].includes(typeof n)
  ).sort(([n], [r]) => fi(n) - fi(r)).slice(0, 4).map(([n, r]) => {
    var a;
    return {
      key: n,
      label: vn(n),
      value: Un(r, n),
      unit: String(((a = e == null ? void 0 : e.units) == null ? void 0 : a[n]) || "")
    };
  });
}
function vu(e) {
  var r, a;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.steps) ? e.trace.steps : [], n = t.find(
    (i) => (i == null ? void 0 : i.operation) === "solve" && ((i == null ? void 0 : i.unicode) || (i == null ? void 0 : i.expression))
  ) || t.find(
    (i) => (i == null ? void 0 : i.group) === "assemble" && ((i == null ? void 0 : i.unicode) || (i == null ? void 0 : i.expression))
  ) || t.find((i) => (i == null ? void 0 : i.unicode) || (i == null ? void 0 : i.expression));
  return String(
    (n == null ? void 0 : n.unicode) || (n == null ? void 0 : n.expression) || ((a = e == null ? void 0 : e.trace) == null ? void 0 : a.symbols) || (e == null ? void 0 : e.method) || "—"
  );
}
function Eu(e) {
  var r, a;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.variables) ? e.trace.variables.filter((i) => (i == null ? void 0 : i.source) === "input") : [];
  if (t.length)
    return t.slice(0, 8).map((i) => ({
      name: String(i.name || ""),
      label: String(
        $s[String(i.name || "")] || i.display_name || vn(String(i.name || "参数"))
      ),
      value: `${Un(i.value, i.name)}${i.unit ? ` ${i.unit}` : ""}`,
      source: "用户输入"
    }));
  const n = ((a = e == null ? void 0 : e.provenance) == null ? void 0 : a.parameter_sources) || {};
  return Object.entries(n).filter(([, i]) => (i == null ? void 0 : i.source) === "user_input").slice(0, 8).map(([i, s]) => ({
    name: i,
    label: vn(i),
    value: `${Un(s == null ? void 0 : s.value, i)}${s != null && s.unit ? ` ${s.unit}` : ""}`,
    source: "用户输入"
  }));
}
function Qn(e) {
  var c, u, m, p;
  const t = (e == null ? void 0 : e.provenance) || {}, n = t.unit_audit, r = Object.values((n == null ? void 0 : n.per_symbol) || {}), a = typeof (n == null ? void 0 : n.ok) == "boolean" ? n.ok : null, i = t.source || ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.source), s = Array.isArray(e == null ? void 0 : e.warnings) ? e.warnings.map(String) : [];
  let l = "success", o = "公式与单位已核验", d = "公式匹配、参数完整，计算证据链可追溯。";
  return a === !1 ? (l = "error", o = "单位检查未通过", d = "结果使用前需要修正单位不一致项。") : i === "freeform" ? (l = "warning", o = "AI 推导 · 建议复核", d = "符号步骤已通过安全校验，但公式并非审定公式库来源。") : s.length ? (l = "warning", o = "计算完成 · 存在提醒", d = "核心计算已完成，请同时阅读警告和适用条件。") : a === null && (o = "计算证据链已记录", d = "推导步骤和参数来源可追溯；此记录没有逐项单位审计。"), {
    title: ((u = e == null ? void 0 : e.trace) == null ? void 0 : u.formula_name) || ((m = e == null ? void 0 : e.trace) == null ? void 0 : m.title) || (e == null ? void 0 : e.operation) || "UGSci 数学计算",
    formula: vu(e),
    trustLabel: o,
    trustDetail: d,
    trustTone: l,
    results: bu(e),
    inputs: Eu(e),
    boundaries: [
      ...Array.isArray(e == null ? void 0 : e.applicability) ? e.applicability : [],
      ...Array.isArray(e == null ? void 0 : e.assumptions) ? e.assumptions : []
    ].map(String),
    warnings: s,
    stepCount: Array.isArray((p = e == null ? void 0 : e.trace) == null ? void 0 : p.steps) ? e.trace.steps.length : 0,
    passedGateCount: Array.isArray(t.gate) ? t.gate.length : 0,
    unitCheckCount: r.length,
    unitAuditOk: a
  };
}
function wu(e) {
  return e === "error" ? { color: As, background: fu } : e === "warning" ? { color: pu, background: gu } : { color: Is, background: mu };
}
function xt({ children: e }) {
  return z().React.createElement(
    "div",
    { style: { fontWeight: 600, color: Qe, marginBottom: 8 } },
    e
  );
}
function Wr({
  payload: e,
  onOpenDerivation: t,
  onOpenEvidence: n,
  onReplay: r,
  compact: a = !1
}) {
  const i = z().React, s = Qn(e), l = wu(s.trustTone), o = s.results[0], d = s.results.slice(1, a ? 2 : 4);
  return i.createElement(
    "div",
    { style: { display: "grid", gap: a ? 9 : 14 } },
    i.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          flexWrap: "wrap"
        }
      },
      i.createElement(
        "div",
        null,
        i.createElement(
          "div",
          { style: { color: Fe, fontSize: 12, marginBottom: 3 } },
          a ? "计算摘要" : s.title
        ),
        o ? i.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              flexWrap: "wrap"
            }
          },
          i.createElement(
            "strong",
            {
              style: {
                color: Qe,
                fontSize: a ? 22 : 28,
                fontWeight: 600,
                overflowWrap: "anywhere"
              }
            },
            o.value
          ),
          o.unit ? i.createElement(
            "span",
            { style: { color: Fe, fontSize: 13 } },
            o.unit
          ) : null
        ) : i.createElement(
          "strong",
          { style: { color: Qe } },
          "计算已完成"
        ),
        o ? i.createElement(
          "div",
          { style: { color: Fe, fontSize: 12, marginTop: 3 } },
          o.label
        ) : null
      ),
      i.createElement(
        "span",
        {
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            borderRadius: 999,
            padding: "4px 8px",
            color: l.color,
            background: l.background,
            fontSize: 12,
            whiteSpace: "nowrap"
          }
        },
        s.trustTone === "success" ? "✓" : "!",
        s.trustLabel
      )
    ),
    i.createElement(
      "p",
      {
        style: {
          margin: 0,
          color: a ? Fe : Qe,
          fontSize: 13,
          lineHeight: 1.65
        }
      },
      s.trustDetail
    ),
    d.length ? i.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 6,
          paddingTop: 10,
          borderTop: `1px solid ${Nt}`
        }
      },
      ...d.map(
        (c) => i.createElement(
          "div",
          {
            key: c.key,
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 12
            }
          },
          i.createElement(
            "span",
            { style: { color: Fe } },
            c.label
          ),
          i.createElement(
            "span",
            { style: { color: Qe, textAlign: "right" } },
            `${c.value}${c.unit ? ` ${c.unit}` : ""}`
          )
        )
      )
    ) : null,
    a ? null : i.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 7,
          paddingTop: 10,
          borderTop: `1px solid ${Nt}`,
          fontSize: 12
        }
      },
      i.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        i.createElement(
          "span",
          { style: { color: Fe } },
          "使用公式"
        ),
        i.createElement(
          "code",
          { style: { color: Qe, overflowWrap: "anywhere" } },
          s.formula
        )
      ),
      i.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        i.createElement(
          "span",
          { style: { color: Fe } },
          "关键输入"
        ),
        i.createElement(
          "span",
          { style: { color: Qe } },
          s.inputs.length ? s.inputs.slice(0, 5).map((c) => `${c.label}=${c.value}`).join("；") : "未提供可展示的输入摘要"
        )
      ),
      i.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        i.createElement(
          "span",
          { style: { color: Fe } },
          "适用条件"
        ),
        i.createElement(
          "span",
          { style: { color: Qe } },
          s.boundaries.slice(0, 2).join("；") || "未声明额外适用条件"
        )
      )
    ),
    i.createElement(
      "div",
      { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
      t ? i.createElement(
        "button",
        {
          type: "button",
          onClick: t,
          style: {
            border: `1px solid ${gi}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: gi,
            color: "var(--ant-color-text-light-solid, #fff)",
            cursor: "pointer"
          }
        },
        "查看推导"
      ) : null,
      n ? i.createElement(
        "button",
        {
          type: "button",
          onClick: n,
          style: {
            border: `1px solid ${Nt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Mr,
            color: Qe,
            cursor: "pointer"
          }
        },
        "证据与来源"
      ) : null,
      r ? i.createElement(
        "button",
        {
          type: "button",
          onClick: r,
          style: {
            border: `1px solid ${Nt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Mr,
            color: Qe,
            cursor: "pointer"
          }
        },
        "复现计算"
      ) : null
    )
  );
}
function xu({ payload: e }) {
  const t = z().React, n = Qn(e);
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(xt, null, "你最需要知道的"),
      t.createElement(
        "p",
        { style: { margin: 0, color: Qe, fontSize: 13, lineHeight: 1.7 } },
        `本次使用 ${n.title}，读取 ${n.inputs.length} 项输入，记录 ${n.stepCount} 个推导步骤`,
        n.passedGateCount ? `，并通过 ${n.passedGateCount} 项计算校验。` : "。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(xt, null, "边界与提醒"),
      n.boundaries.length || n.warnings.length ? t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: Fe,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...[...n.warnings, ...n.boundaries].slice(0, 4).map(
          (r, a) => t.createElement("li", { key: `${a}:${r}` }, r)
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: Fe, fontSize: 12 } },
        "未声明额外边界条件。"
      )
    )
  );
}
function Su({ payload: e }) {
  var l, o, d;
  const t = z().React, n = Qn(e), r = (e == null ? void 0 : e.provenance) || {}, a = Object.entries(((l = r == null ? void 0 : r.unit_audit) == null ? void 0 : l.per_symbol) || {}), i = Object.entries((r == null ? void 0 : r.parameter_sources) || {}), s = (c, u, m = c) => t.createElement(
    "div",
    {
      key: m,
      style: {
        display: "grid",
        gridTemplateColumns: "90px minmax(0, 1fr)",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${Nt}`,
        fontSize: 12
      }
    },
    t.createElement("span", { style: { color: Fe } }, c),
    t.createElement(
      "span",
      { style: { color: Qe, overflowWrap: "anywhere" } },
      u || "—"
    )
  );
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(xt, null, "公式身份"),
      s("公式来源", r.reference || n.title),
      s(
        "公式版本",
        `${r.formula_id || ((o = e == null ? void 0 : e.trace) == null ? void 0 : o.formula_id) || "—"} · ${r.formula_version || ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.formula_version) || "—"}`
      ),
      s(
        "信任类型",
        r.source === "freeform" ? "AI 自由推导" : "UGSci 审定公式"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        xt,
        null,
        `参数来源（${i.length}）`
      ),
      i.length ? t.createElement(
        "div",
        { style: { display: "grid" } },
        ...i.map(
          ([c, u]) => s(
            vn(c),
            `${(u == null ? void 0 : u.source) === "user_input" ? "用户输入" : "推导生成"} · ${Un(u == null ? void 0 : u.value, c)}${u != null && u.unit ? ` ${u.unit}` : ""}`,
            c
          )
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: Fe, fontSize: 12 } },
        "没有参数来源记录。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        xt,
        null,
        `单位审计（${n.unitCheckCount} 项）`
      ),
      t.createElement(
        "div",
        {
          style: {
            color: n.unitAuditOk === !1 ? As : n.unitAuditOk === !0 ? Is : Fe,
            fontSize: 12,
            marginBottom: a.length ? 8 : 0
          }
        },
        n.unitAuditOk === !1 ? "存在不一致单位" : n.unitAuditOk === !0 ? "全部单位一致" : "此结果没有单位审计数据"
      ),
      a.length ? t.createElement(
        "details",
        null,
        t.createElement(
          "summary",
          { style: { cursor: "pointer", color: Fe, fontSize: 12 } },
          "查看逐项单位检查"
        ),
        t.createElement(
          "div",
          { style: { marginTop: 6 } },
          ...a.map(
            ([c, u]) => s(
              vn(c),
              `${u != null && u.ok ? "✓" : "✗"} ${(u == null ? void 0 : u.actual) || "无量纲"} → ${(u == null ? void 0 : u.expected) || "—"}`,
              `unit:${c}`
            )
          )
        )
      ) : null
    ),
    Array.isArray(r.gate) && r.gate.length ? t.createElement(
      "section",
      null,
      t.createElement(xt, null, "通过的计算校验"),
      t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: Fe,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...r.gate.map(
          (c, u) => t.createElement(
            "li",
            { key: `${u}:${c}` },
            String(c)
          )
        )
      )
    ) : null,
    r.replay_token ? t.createElement(
      "section",
      null,
      t.createElement(xt, null, "复现身份"),
      t.createElement(
        "code",
        {
          style: {
            display: "block",
            padding: 10,
            borderRadius: 8,
            background: Ir,
            color: Fe,
            fontSize: 11,
            overflowWrap: "anywhere"
          }
        },
        String(
          r.input_fingerprint || r.replay_token
        ).slice(0, 96)
      )
    ) : null
  );
}
function ku({ payload: e }) {
  const t = z().React, n = Qn(e), [r, a] = t.useState(!1), i = e == null ? void 0 : e.replay, s = [
    [n.stepCount, "计算步骤"],
    [n.passedGateCount, "校验通过"],
    [(i == null ? void 0 : i.elapsedMs) != null ? `${i.elapsedMs} ms` : "—", "复现耗时"]
  ];
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 12 } },
    t.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
          gap: 8
        }
      },
      ...s.map(
        ([l, o]) => t.createElement(
          "div",
          {
            key: String(o),
            style: { padding: 10, borderRadius: 8, background: Ir }
          },
          t.createElement(
            "strong",
            { style: { display: "block", color: Qe } },
            String(l)
          ),
          t.createElement(
            "span",
            { style: { color: Fe, fontSize: 11 } },
            String(o)
          )
        )
      )
    ),
    t.createElement(
      "button",
      {
        type: "button",
        onClick: () => a(!r),
        "aria-expanded": r,
        style: {
          justifySelf: "start",
          border: `1px solid ${Nt}`,
          borderRadius: 7,
          padding: "6px 10px",
          background: Mr,
          color: Qe,
          cursor: "pointer"
        }
      },
      r ? "隐藏原始日志" : "显示原始日志"
    ),
    r ? t.createElement(
      "pre",
      {
        style: {
          margin: 0,
          padding: 12,
          borderRadius: 8,
          background: Ir,
          color: Fe,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          fontSize: 11,
          lineHeight: 1.55
        }
      },
      JSON.stringify(e, null, 2)
    ) : t.createElement(
      "p",
      { style: { margin: 0, color: Fe, fontSize: 12 } },
      "原始运行数据默认隐藏，需要诊断或审计时再展开。"
    )
  );
}
const _u = 128;
let Ar = [], zs = "";
const $r = /* @__PURE__ */ new Set(), Rs = () => $r.forEach((e) => e()), Ls = (e) => ($r.add(e), () => $r.delete(e)), yi = () => Ar;
function Zr(e) {
  return !!(e && typeof e == "object" && e.trace && Array.isArray(e.trace.steps) && e.provenance && (e.operation || e.trace.formula_id));
}
function Cu(e) {
  if (!e || typeof e != "object" || !e.replay_id || !e.status || !Zr(e.result))
    return null;
  const t = {
    replayId: String(e.replay_id),
    status: String(e.status),
    reproducible: e.reproducible === !0,
    elapsedMs: typeof e.elapsed_ms == "number" ? e.elapsed_ms : void 0,
    diff: e.diff && typeof e.diff == "object" ? e.diff : {}
  };
  return { ...e.result, replay: t };
}
function Jr(e, t) {
  var a, i, s, l, o;
  if (!Zr(e)) return null;
  const n = (a = e.replay) != null && a.replayId ? `replay:${e.replay.replayId}` : `${((i = e.trace) == null ? void 0 : i.formula_id) || "derivation"}:${((s = e.provenance) == null ? void 0 : s.input_fingerprint) || e.operation || crypto.randomUUID()}`, r = {
    uiId: n,
    sessionId: t || ((o = (l = z()).getCurrentSessionId) == null ? void 0 : o.call(l)) || "",
    payload: e,
    updatedAt: Date.now()
  };
  return Ar = [r, ...Ar.filter((d) => d.uiId !== n)].slice(
    0,
    _u
  ), Rs(), r;
}
function Qr(e) {
  zs = e, Rs();
}
function Tu() {
  return z().React.useSyncExternalStore(
    Ls,
    () => zs,
    () => ""
  );
}
function Ps(e) {
  const t = [], n = (r) => {
    if (r == null) return;
    if (typeof r == "string") {
      try {
        n(JSON.parse(r));
      } catch {
      }
      return;
    }
    if (Array.isArray(r)) {
      r.forEach(n);
      return;
    }
    if (typeof r != "object") return;
    const a = Cu(r);
    if (a) {
      t.push(a);
      return;
    }
    Zr(r) && t.push(r), Object.values(r).forEach(n);
  };
  return n(e), Array.from(
    new Map(
      t.map((r) => {
        var a, i;
        return [
          String(((a = r.provenance) == null ? void 0 : a.replay_token) || ((i = r.trace) == null ? void 0 : i.formula_id)) + JSON.stringify(r.result || {}),
          r
        ];
      })
    ).values()
  );
}
function Mu(e, t) {
  Ps(e).forEach(
    (n) => Jr(n, t)
  );
}
function Iu(e) {
  const t = z().React, n = t.useSyncExternalStore(Ls, yi, yi);
  return t.useMemo(
    () => n.filter((r) => r.sessionId === e),
    [n, e]
  );
}
const Au = [], Ht = /* @__PURE__ */ new Map();
function $u(e) {
  Ht.set(e, (Ht.get(e) || 0) + 1);
}
function zu(e) {
  const t = (Ht.get(e) || 1) - 1;
  t > 0 ? Ht.set(e, t) : Ht.delete(e);
}
function Ru(e) {
  return (Ht.get(e) || 0) > 0;
}
function hi(e) {
  const t = [], n = (r) => {
    t.push(r);
    for (const a of r.children || []) n(a);
  };
  return n(e), t;
}
function Lu(e) {
  var d, c;
  const t = hi(e), n = String(
    ((c = (d = t.find(
      (u) => {
        var m;
        return u.kind === "Heading" && Number((m = u.props) == null ? void 0 : m.level) === 2;
      }
    )) == null ? void 0 : d.props) == null ? void 0 : c.value) || "公式计算"
  ), r = t.some(
    (u) => {
      var m;
      return u.kind === "Alert" && String(((m = u.props) == null ? void 0 : m.severity) || "") === "warning";
    }
  ), a = t.filter((u) => u.kind === "MetricCard").map((u) => {
    var m, p;
    return {
      label: String(((m = u.props) == null ? void 0 : m.title) || "结果"),
      value: String(((p = u.props) == null ? void 0 : p.value) ?? "—")
    };
  }), i = t.filter((u) => u.kind === "TableRow").map(
    (u) => (u.children || []).filter((m) => m.kind === "TableCell").map((m) => {
      var p;
      return String(((p = m.props) == null ? void 0 : p.value) ?? "");
    })
  ).filter((u) => u.length >= 4 && u[3] === "derived").map((u) => ({
    label: u[0] || "结果",
    value: [u[1], u[2]].filter(Boolean).join(" ")
  })).reverse(), s = t.filter((u) => u.kind === "NumberInput" || u.kind === "Slider").slice(0, 5).map(
    (u) => {
      var m, p, b;
      return `${String(((m = u.props) == null ? void 0 : m.label) || ((p = u.props) == null ? void 0 : p.name) || "输入")}=${String(
        ((b = u.props) == null ? void 0 : b.value) ?? "—"
      )}`;
    }
  ), l = t.filter((u) => u.kind === "AccordionItem").filter(
    (u) => {
      var m;
      return ["适用场景", "假设条件"].includes(String(((m = u.props) == null ? void 0 : m.header) || ""));
    }
  ).flatMap((u) => hi(u)).filter((u) => u.kind === "ListItem").map((u) => {
    var m;
    return String(((m = u.props) == null ? void 0 : m.value) || "");
  }).filter(Boolean).slice(0, 3), o = [...i, ...a].filter(
    (u, m, p) => p.findIndex(
      (b) => b.label === u.label && b.value === u.value
    ) === m
  );
  return { title: n, warning: r, inputs: s, conditions: l, results: o };
}
function Pu({
  data: e
}) {
  var g, f;
  const t = (g = window.QwenPaw) == null ? void 0 : g.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = fd(), a = n.useRef(
    /* @__PURE__ */ new Map()
  ), i = ((f = t.getCurrentSessionId) == null ? void 0 : f.call(t)) || "__current_chat__", s = Array.isArray(e.output) ? e.output : Au, l = n.useMemo(() => fs(s), [s]), o = n.useMemo(() => Ps(s), [s]);
  n.useEffect(() => {
    for (const h of l) {
      if (!h.ui_id || !h.tree) continue;
      const y = r.getSnapshot(i, h.ui_id);
      y && y.revision >= (h.revision || 1) || r.setSnapshot({
        schemaVersion: "1",
        uiId: h.ui_id,
        revision: h.revision || 1,
        tree: h.tree,
        sessionId: i,
        sourceToolCallId: h.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [l, i]);
  const d = n.useMemo(
    () => l.filter((h) => h.kind === "genui" && !!h.ui_id).map((h) => h.ui_id),
    [l]
  ), c = d.join("\0");
  n.useEffect(() => {
    for (const h of d) $u(h);
    return () => {
      for (const h of d) zu(h);
    };
  }, [c]);
  const u = n.useMemo(
    () => l.map((h) => h.ui_id).filter((h) => !!h),
    [l]
  ), p = yd(i, u).filter(
    (h) => (
      // Only include snapshots whose ui_id appears in this response's results
      l.some(
        (y) => y.ui_id === h.uiId && (y.kind === "genui" || y.kind === "genui_patch" && !Ru(h.uiId))
      )
    )
  ).sort((h, y) => h.updatedAt - y.updatedAt);
  if (o.length > 0)
    return n.createElement(
      "div",
      {
        className: "qwenpaw-genui-inline qwenpaw-derivation-inline",
        style: { marginTop: 8, marginBottom: 8, display: "grid", gap: 8 }
      },
      ...o.map(
        (h, y) => {
          var E, v;
          return n.createElement(
            "div",
            {
              key: String(
                ((E = h.provenance) == null ? void 0 : E.replay_token) || ((v = h.trace) == null ? void 0 : v.formula_id) || y
              ),
              style: {
                border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                borderRadius: 12,
                padding: 12,
                background: "var(--ant-color-bg-container, #fff)"
              }
            },
            n.createElement(Wr, {
              payload: h,
              compact: !0,
              onOpenDerivation: () => {
                const S = Jr(h, i);
                S != null && S.uiId && Qr(S.uiId), window.dispatchEvent(
                  new CustomEvent("qwenpaw:open-compute-workbench", {
                    detail: { uiId: S == null ? void 0 : S.uiId }
                  })
                );
              }
            })
          );
        }
      )
    );
  if (p.length === 0) return null;
  const b = (h) => n.createElement(
    "div",
    {
      key: jt(h.sessionId, h.uiId),
      className: "qwenpaw-genui-tree",
      "data-genui-id": h.uiId,
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        background: "var(--ant-color-bg-container, #fff)"
      },
      ref: (y) => {
        y && (y.__genuiId = h.uiId);
      }
    },
    n.createElement(
      "div",
      { className: "qwenpaw-genui-export-target" },
      n.createElement(jd, {
        node: h.tree.root,
        onValuesChange: (y) => a.current.set(h.uiId, y),
        children: n.createElement(Jd, {
          node: h.tree.root
        })
      })
    ),
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          gap: 6,
          marginTop: 8
        }
      },
      n.createElement(
        "button",
        {
          type: "button",
          title: "导出 PNG",
          onClick: (y) => {
            var v;
            const E = (v = y.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : v.querySelector(
              ".qwenpaw-genui-export-target"
            );
            E && ou(E, h.uiId).catch(
              (S) => console.warn("[ugsci.genui] PNG export failed", S)
            );
          }
        },
        "PNG"
      ),
      n.createElement(
        "button",
        {
          type: "button",
          title: "打印或另存为 PDF",
          onClick: (y) => {
            var v;
            const E = (v = y.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : v.querySelector(
              ".qwenpaw-genui-export-target"
            );
            E && uu(
              E,
              h.tree.root,
              a.current.get(h.uiId) || {},
              h.uiId
            ).catch(
              (S) => console.warn("[ugsci.genui] PDF print failed", S)
            );
          }
        },
        "PDF"
      ),
      n.createElement(
        "button",
        {
          type: "button",
          title: "导出 HTML",
          onClick: (y) => {
            var v;
            const E = (v = y.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : v.querySelector(
              ".qwenpaw-genui-export-target"
            );
            E && du(
              E,
              h.tree.root,
              a.current.get(h.uiId) || {},
              h.uiId,
              h.uiId
            ).catch(
              (S) => console.warn("[ugsci.genui] HTML export failed", S)
            );
          }
        },
        "HTML"
      )
    )
  );
  return n.createElement(
    "div",
    {
      className: "qwenpaw-genui-inline",
      style: { marginTop: 8, marginBottom: 8 }
    },
    ...p.map((h) => {
      if (!h.uiId.startsWith("ui_trc_")) return b(h);
      const y = Lu(h.tree.root), E = y.results[0] || {
        label: "计算结果",
        value: "已完成"
      };
      return n.createElement(
        "div",
        {
          key: jt(h.sessionId, h.uiId),
          className: "qwenpaw-derivation-inline",
          "data-trace-ui-id": h.uiId,
          style: {
            border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
            display: "grid",
            gap: 10,
            background: "var(--ant-color-bg-container, #fff)"
          }
        },
        n.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap"
            }
          },
          n.createElement(
            "div",
            { style: { minWidth: 0 } },
            n.createElement(
              "div",
              {
                style: {
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12
                }
              },
              y.title
            ),
            n.createElement(
              "strong",
              {
                style: {
                  display: "block",
                  marginTop: 2,
                  fontSize: 22,
                  color: "var(--ant-color-text, rgba(0,0,0,.88))",
                  overflowWrap: "anywhere"
                }
              },
              E.value
            ),
            n.createElement(
              "span",
              {
                style: {
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12
                }
              },
              E.label
            )
          ),
          n.createElement(
            "span",
            {
              style: {
                borderRadius: 999,
                padding: "4px 8px",
                fontSize: 12,
                color: y.warning ? "var(--ant-color-warning, #faad14)" : "var(--ant-color-success, #52c41a)",
                background: y.warning ? "var(--ant-color-warning-bg, #fffbe6)" : "var(--ant-color-success-bg, #f6ffed)"
              }
            },
            y.warning ? "需要人工复核" : "✓ 公式与单位已核验"
          )
        ),
        y.results.length > 1 ? n.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8
            }
          },
          ...y.results.slice(1, 4).map(
            (v) => n.createElement(
              "div",
              {
                key: `${v.label}:${v.value}`,
                style: {
                  padding: 8,
                  borderRadius: 8,
                  background: "var(--ant-color-fill-quaternary, rgba(0,0,0,.02))"
                }
              },
              n.createElement(
                "div",
                {
                  style: {
                    color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                    fontSize: 11
                  }
                },
                v.label
              ),
              n.createElement("strong", null, v.value)
            )
          )
        ) : null,
        y.inputs.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `关键输入：${y.inputs.join("；")}`
        ) : null,
        y.conditions.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `适用条件：${y.conditions.join("；")}`
        ) : null,
        n.createElement(
          "details",
          null,
          n.createElement(
            "summary",
            {
              style: {
                cursor: "pointer",
                color: "var(--ant-color-primary, #1677ff)",
                fontSize: 13,
                fontWeight: 600
              }
            },
            "查看推导"
          ),
          n.createElement(
            "div",
            { style: { marginTop: 10 } },
            b(h)
          )
        )
      );
    })
  );
}
function Ou({ payload: e }) {
  var l, o;
  const t = z().React, n = ((l = e == null ? void 0 : e.trace) == null ? void 0 : l.variables) || [], r = ((o = e == null ? void 0 : e.trace) == null ? void 0 : o.steps) || [], a = [
    ...n.map((d, c) => ({
      id: d.name,
      label: d.symbol || d.name,
      x: 20,
      y: 30 + c * 54,
      kind: "variable"
    })),
    ...r.map((d, c) => ({
      id: d.id,
      label: d.title,
      x: 380,
      y: 30 + c * 54,
      kind: "step",
      step: d
    }))
  ], i = new Map(a.map((d) => [d.id, d])), s = [];
  for (const d of r) {
    for (const c of d.reads || [])
      i.has(c) && s.push({ from: c, to: d.id });
    d.writes && i.has(d.writes) && s.push({ from: d.id, to: d.writes });
  }
  return t.createElement(
    "svg",
    {
      viewBox: `0 0 760 ${Math.max(
        220,
        Math.max(n.length, r.length) * 54 + 50
      )}`,
      width: "100%",
      role: "img",
      "aria-label": "推导流程图"
    },
    t.createElement(
      "defs",
      null,
      t.createElement(
        "marker",
        {
          id: "arrow",
          markerWidth: 8,
          markerHeight: 8,
          refX: 7,
          refY: 3,
          orient: "auto"
        },
        t.createElement("path", {
          d: "M0,0 L0,6 L8,3 z",
          fill: "var(--ant-color-text-quaternary, #bfbfbf)"
        })
      )
    ),
    ...s.map((d, c) => {
      const u = i.get(d.from), m = i.get(d.to);
      return t.createElement("line", {
        key: `e${c}`,
        x1: u.x + 155,
        y1: u.y + 16,
        x2: m.x,
        y2: m.y + 16,
        stroke: "var(--ant-color-border, #d9d9d9)",
        markerEnd: "url(#arrow)"
      });
    }),
    ...a.map(
      (d) => t.createElement(
        "g",
        { key: d.id, transform: `translate(${d.x} ${d.y})` },
        t.createElement("rect", {
          width: 155,
          height: 32,
          rx: 6,
          fill: d.kind === "variable" ? "var(--ant-color-primary-bg, #e6f4ff)" : "var(--ant-color-fill-quaternary, #fafafa)",
          stroke: "var(--ant-color-border, #d9d9d9)"
        }),
        t.createElement(
          "text",
          {
            x: 8,
            y: 20,
            fill: "var(--ant-color-text, rgba(0,0,0,.88))",
            fontSize: 11
          },
          `${d.id} · ${String(d.label).slice(0, 18)}`
        )
      )
    )
  );
}
function Nu({
  payload: e,
  compact: t = !1
}) {
  var d;
  const n = z().React, [r, a] = n.useState(!t), i = ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.steps) || [], s = i.filter(
    (c) => c.kind !== "bind" || c.note !== "input"
  ), o = (r ? i : s).map(
    (c, u) => n.createElement(
      "article",
      {
        key: c.id,
        style: {
          display: "grid",
          gridTemplateColumns: "26px minmax(0, 1fr)",
          gap: 9,
          padding: "9px 0",
          borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
        }
      },
      n.createElement(
        "span",
        {
          style: {
            width: 24,
            height: 24,
            display: "grid",
            placeItems: "center",
            borderRadius: 999,
            background: "var(--ant-color-primary-bg, #e6f4ff)",
            color: "var(--ant-color-primary, #1677ff)",
            fontSize: 11
          }
        },
        u + 1
      ),
      n.createElement(
        "div",
        { style: { minWidth: 0 } },
        n.createElement(
          "strong",
          {
            style: {
              display: "block",
              color: "var(--ant-color-text, rgba(0,0,0,.88))",
              fontSize: 13
            }
          },
          c.title
        ),
        c.unicode || c.expression ? n.createElement(
          "code",
          {
            style: {
              display: "block",
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 11,
              marginTop: 4,
              overflowWrap: "anywhere"
            }
          },
          c.unicode || c.expression
        ) : null,
        c.value !== null && c.value !== void 0 ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 11,
              marginTop: 3
            }
          },
          `${c.display_value ?? c.value} ${c.display_unit || c.unit || ""}`
        ) : null,
        c.description ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-tertiary, rgba(0,0,0,.25))",
              fontSize: 11,
              marginTop: 3,
              lineHeight: 1.55
            }
          },
          c.description
        ) : null,
        c.kind === "assert" ? n.createElement(
          "span",
          {
            style: {
              display: "inline-block",
              color: c.value ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-error, #ff4d4f)",
              fontSize: 11,
              marginTop: 4
            }
          },
          c.value ? "✓ 通过" : "✗ 失败"
        ) : null
      )
    )
  );
  return n.createElement(
    "div",
    { style: { display: "grid", gap: 8 } },
    ...o,
    t && i.length !== s.length ? n.createElement(
      "button",
      {
        type: "button",
        onClick: () => a((c) => !c),
        style: {
          justifySelf: "start",
          border: "1px solid var(--ant-color-border, #d9d9d9)",
          borderRadius: 7,
          padding: "5px 9px",
          background: "var(--ant-color-bg-container, #fff)",
          color: "var(--ant-color-text, rgba(0,0,0,.88))",
          cursor: "pointer"
        }
      },
      r ? "只看关键步骤" : `显示全部 ${i.length} 步`
    ) : null
  );
}
const zn = "var(--ant-color-text, rgba(0,0,0,.88))", gr = "var(--ant-color-text-secondary, rgba(0,0,0,.45))", bi = "var(--ant-color-border, #d9d9d9)", fr = "var(--ant-color-bg-container, #fff)", vi = "var(--ant-color-primary, #1677ff)";
function Bu() {
  var f, h, y;
  const e = z().React, t = ((h = (f = z()).getCurrentSessionId) == null ? void 0 : h.call(f)) || "", n = Iu(t), r = Tu(), [a, i] = e.useState(n[0]), [s, l] = e.useState("summary"), [o, d] = e.useState("steps");
  if (e.useEffect(() => {
    const E = n.find((v) => v.uiId === r);
    E && E !== a ? i(E) : n.some((v) => v.uiId === (a == null ? void 0 : a.uiId)) || i(n[0]);
  }, [n, r, a]), !n.length)
    return e.createElement(
      "div",
      { style: { padding: 20, color: gr } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。"
    );
  const c = (a == null ? void 0 : a.payload) || n[0].payload, u = c.provenance || {}, m = c.replay, p = () => {
    var v, S, B;
    const E = u.replay_token;
    E && ((B = (S = (v = window.QwenPaw) == null ? void 0 : v.chat) == null ? void 0 : S.sendMessage) == null || B.call(
      S,
      `请调用 ugsci_replay_calculation 验证并重放以下令牌：
${E}`
    ));
  }, b = [
    ["summary", "摘要"],
    ["derivation", "推导"],
    ["evidence", "证据"],
    ["logs", "日志"]
  ], g = (E) => ({
    flex: "1 1 64px",
    minWidth: 0,
    border: "none",
    borderRadius: 7,
    padding: "6px 8px",
    background: E ? fr : "transparent",
    color: E ? zn : gr,
    boxShadow: E ? "0 1px 4px rgba(0,0,0,.08)" : "none",
    cursor: "pointer"
  });
  return e.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: 14,
        gap: 12,
        overflow: "auto"
      }
    },
    e.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap"
        }
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          "strong",
          { style: { display: "block", color: zn } },
          "计算详情"
        ),
        e.createElement(
          "span",
          { style: { color: gr, fontSize: 11 } },
          ((y = c.trace) == null ? void 0 : y.formula_name) || c.operation || "UGSci 推导"
        )
      ),
      m ? e.createElement(
        "span",
        {
          style: {
            color: m.reproducible ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-warning, #faad14)",
            fontSize: 12
          }
        },
        m.reproducible ? `✓ 可复现 · ${m.elapsedMs ?? "?"} ms` : "! 版本已变化"
      ) : null
    ),
    e.createElement(
      "div",
      {
        role: "tablist",
        "aria-label": "计算详情层级",
        style: {
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 9,
          background: "var(--ant-color-fill-quaternary, rgba(0,0,0,.02))"
        }
      },
      ...b.map(
        ([E, v]) => e.createElement(
          "button",
          {
            key: E,
            type: "button",
            role: "tab",
            onClick: () => l(E),
            "aria-selected": s === E,
            style: g(s === E)
          },
          v
        )
      )
    ),
    n.length > 1 ? e.createElement(
      "select",
      {
        "aria-label": "选择计算记录",
        value: (a == null ? void 0 : a.uiId) || n[0].uiId,
        onChange: (E) => {
          Qr(E.target.value), i(
            n.find((v) => v.uiId === E.target.value)
          );
        },
        style: {
          width: "100%",
          padding: "7px 9px",
          border: `1px solid ${bi}`,
          borderRadius: 7,
          color: zn,
          background: fr
        }
      },
      ...n.map(
        (E) => {
          var v;
          return e.createElement(
            "option",
            { key: E.uiId, value: E.uiId },
            ((v = E.payload.trace) == null ? void 0 : v.formula_name) || E.uiId.slice(0, 18)
          );
        }
      )
    ) : null,
    s === "summary" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 18 } },
      e.createElement(Wr, {
        payload: c,
        onOpenDerivation: () => l("derivation"),
        onOpenEvidence: () => l("evidence"),
        onReplay: u.replay_token ? p : void 0
      }),
      e.createElement(xu, { payload: c })
    ) : s === "derivation" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 10 } },
      e.createElement(
        "div",
        { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
        ...[
          ["steps", "关键步骤"],
          ["flow", "流程图"]
        ].map(
          ([E, v]) => e.createElement(
            "button",
            {
              key: E,
              type: "button",
              onClick: () => d(E),
              "aria-pressed": o === E,
              style: {
                border: `1px solid ${o === E ? vi : bi}`,
                borderRadius: 7,
                padding: "5px 9px",
                background: fr,
                color: o === E ? vi : zn,
                cursor: "pointer"
              }
            },
            v
          )
        )
      ),
      o === "flow" ? e.createElement(Ou, { payload: c }) : e.createElement(Nu, { payload: c, compact: !0 })
    ) : s === "evidence" ? e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Su, { payload: c })
    ) : e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(ku, { payload: c })
    )
  );
}
function sn(e) {
  var t;
  if (typeof e == "string")
    try {
      return sn(JSON.parse(e));
    } catch {
      return null;
    }
  return Array.isArray(e) ? sn((t = e.find((n) => (n == null ? void 0 : n.type) === "text")) == null ? void 0 : t.text) : e != null && e.status && (e != null && e.result) ? {
    ...e.result,
    replay: {
      replayId: String(e.replay_id || ""),
      status: String(e.status),
      reproducible: e.reproducible === !0,
      elapsedMs: typeof e.elapsed_ms == "number" ? e.elapsed_ms : void 0,
      diff: e.diff && typeof e.diff == "object" ? e.diff : {}
    }
  } : (e == null ? void 0 : e.output) !== void 0 ? sn(e.output) : (e == null ? void 0 : e.content) !== void 0 ? sn(e.content) : e;
}
function Hu(e) {
  var o, d, c, u, m, p, b;
  const t = z().React, n = ((o = e == null ? void 0 : e.data) == null ? void 0 : o.content) || [], r = ((c = (d = n[1]) == null ? void 0 : d.data) == null ? void 0 : c.output) ?? ((m = (u = n[1]) == null ? void 0 : u.data) == null ? void 0 : m.content) ?? ((b = (p = n[0]) == null ? void 0 : p.data) == null ? void 0 : b.output), a = sn(r), [i, s] = t.useState(null);
  t.useEffect(() => {
    a && s(Jr(a));
  }, [r]);
  const l = () => {
    i != null && i.uiId && Qr(i.uiId), window.dispatchEvent(
      new CustomEvent("qwenpaw:open-compute-workbench", {
        detail: { uiId: i == null ? void 0 : i.uiId }
      })
    );
  };
  return t.createElement(
    "div",
    {
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 12,
        margin: "6px 0",
        background: "var(--ant-color-bg-container, #fff)"
      }
    },
    a ? t.createElement(Wr, {
      payload: a,
      compact: !0,
      onOpenDerivation: l
    }) : t.createElement(
      "span",
      {
        style: {
          color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))"
        }
      },
      "计算中…"
    )
  );
}
let Et = null;
function Uu(e, t) {
  var a, i, s, l;
  const n = "ugsci";
  Et == null || Et();
  const r = [];
  if (he("/ugsci/genui/config", {
    bypassCache: !0
  }).then((o) => {
    e.genui = { ...e.genui || {}, config: o };
  }).catch((o) => {
    e.genui = {
      ...e.genui || {},
      config: {
        enabled: !0,
        persisted_enabled: !0,
        overridden: !1,
        channels: ["response.append"],
        allow_html: !1,
        allow_actions: [],
        backend_unavailable: !0
      }
    }, console.warn(
      "[ugsci.genui] Failed to load runtime config; using compatibility fallback",
      o
    );
  }), (a = e.chat) != null && a.toolRender) {
    r.push(
      e.chat.toolRender(n, "emit_ui_tree", ni)
    ), r.push(
      e.chat.toolRender(n, "emit_ui_patch", ni)
    ), r.push(
      e.chat.toolRender(n, "list_ui_components", ri)
    ), r.push(
      e.chat.toolRender(n, "get_genui_guide", ri)
    );
    for (const o of [
      "ugsci_trace_calculation",
      "ugsci_replay_calculation",
      "ugsci_derive_formula",
      "ugsci_evaluate_formula",
      "ugsci_transform_formula",
      "ugsci_formula_preview"
    ])
      r.push(e.chat.toolRender(n, o, Hu));
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  return (i = e.slot) != null && i.fill && r.push(
    e.slot.fill(
      n,
      "chat.workbench.compute",
      () => t.createElement(Bu)
    )
  ), (l = (s = e.chat) == null ? void 0 : s.response) != null && l.append && (r.push(
    e.chat.response.append(
      n,
      (o) => {
        const d = () => (t.useEffect(
          () => Mu(o.data.output),
          [o.data.output]
        ), null);
        return t.createElement(
          gd,
          null,
          t.createElement(d),
          t.createElement(Pu, { data: o.data })
        );
      },
      { id: "ugsci.genui.response-append", order: 50 }
    )
  ), console.info("[ugsci.genui] Registered response.append slot")), Et = () => {
    var o;
    for (const d of r.reverse()) (o = d == null ? void 0 : d.dispose) == null || o.call(d);
    if (bd(), Rd(), e.genui) {
      const d = { ...e.genui };
      delete d.dispose, delete d.clearSession, e.genui = d;
    }
    Et = null;
  }, e.genui = {
    ...e.genui || {},
    dispose: Et,
    clearSession: hd
  }, Et;
}
const Ei = {
  enabled: !0,
  persisted_enabled: !0,
  overridden: !1,
  channels: ["response.append"],
  allow_html: !1,
  allow_actions: [],
  backend_unavailable: !0
};
function yr(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function ju() {
  const e = z().React, { Alert: t, Card: n, Space: r, Spin: a, Switch: i, Typography: s, message: l } = z().antd, { useEffect: o, useState: d } = e, [c, u] = d(null), [m, p] = d(!1);
  o(() => {
    let g = !0, f = null;
    const h = (y = !1) => {
      he("/ugsci/genui/config").then((E) => {
        g && (u(E), yr(E));
      }).catch((E) => {
        g && (u(Ei), yr(Ei), y && l.error(String(E)), f = setTimeout(() => h(!1), 3e4));
      });
    };
    return h(!0), () => {
      g = !1, f && clearTimeout(f);
    };
  }, []);
  const b = async (g) => {
    p(!0);
    try {
      const f = await he("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: g })
      });
      u(f), yr(f), l.success(
        f.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : g ? "GenUI 已开启" : "GenUI 已关闭"
      );
    } catch (f) {
      l.error(`保存 GenUI 设置失败：${String(f)}`);
    } finally {
      p(!1);
    }
  };
  return e.createElement(
    "section",
    { "aria-labelledby": "ugsci-genui-title" },
    e.createElement(
      s.Title,
      { level: 3, id: "ugsci-genui-title" },
      "GenUI"
    ),
    e.createElement(
      s.Paragraph,
      { type: "secondary" },
      "控制 UGSci 的生成式界面能力。该设置对所有 Agent 生效，新安装时默认开启。"
    ),
    e.createElement(
      n,
      null,
      c === null ? e.createElement(a) : e.createElement(
        r,
        { direction: "vertical", size: 16, style: { width: "100%" } },
        e.createElement(
          r,
          { style: { width: "100%", justifyContent: "space-between" } },
          e.createElement(
            "div",
            null,
            e.createElement(
              s.Text,
              { strong: !0 },
              "启用 GenUI"
            ),
            e.createElement(
              s.Paragraph,
              { type: "secondary", style: { margin: "4px 0 0" } },
              "允许 Agent 生成卡片、表格、图表、表单，并在对话中交互和增量更新。"
            )
          ),
          e.createElement(i, {
            "aria-label": "启用 GenUI",
            checked: c.persisted_enabled,
            loading: m,
            disabled: c.backend_unavailable,
            onChange: b
          })
        ),
        e.createElement(t, {
          type: c.backend_unavailable ? "error" : c.enabled ? "success" : "warning",
          showIcon: !0,
          message: c.backend_unavailable ? "UGSci 后端当前不可用，正在使用兼容降级模式；设置不会写入。" : c.enabled ? "GenUI 当前有效；各 Agent 仍可显式关闭自己的 GenUI 工具" : c.overridden ? "GenUI 当前被环境变量或插件配置关闭；本地设置已保存但暂不生效。" : "GenUI 已全局关闭；已有界面仍可查看，但 Agent 不会再生成或更新界面。"
        })
      )
    )
  );
}
function Du({
  preference: e
}) {
  const { React: t, antd: n } = z(), r = t.useSyncExternalStore(
    e.subscribe,
    e.get
  );
  return t.createElement(
    "section",
    {
      "aria-labelledby": "ugsci-sidebar-density-title",
      style: { marginBottom: 28 }
    },
    t.createElement(
      n.Typography.Title,
      { level: 3, id: "ugsci-sidebar-density-title" },
      "侧边栏"
    ),
    t.createElement(
      n.Card,
      null,
      t.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap"
          }
        },
        t.createElement(
          "div",
          null,
          t.createElement(
            n.Typography.Text,
            { strong: !0 },
            "图标紧凑程度"
          ),
          t.createElement(
            n.Typography.Paragraph,
            { type: "secondary", style: { margin: "4px 0 0" } },
            "调整功能导航的图标间距。默认中等，可显示更多入口，修改后自动保存。"
          )
        ),
        t.createElement(n.Segmented, {
          "aria-label": "侧边栏图标紧凑程度",
          value: r,
          options: [
            { value: "comfortable", label: "宽松" },
            { value: "medium", label: "中等" },
            { value: "compact", label: "紧凑" }
          ],
          onChange: e.set
        })
      )
    )
  );
}
function qu() {
  const { React: e, antd: t, sidebarDensity: n } = z();
  return e.createElement(
    "div",
    { style: { width: "100%" } },
    e.createElement(t.Typography.Title, { level: 2 }, "UGSci 设置"),
    e.createElement(
      t.Typography.Paragraph,
      { type: "secondary", style: { marginBottom: 28 } },
      "集中管理 UGSci 的功能与偏好设置。"
    ),
    n && e.createElement(Du, {
      preference: n
    }),
    e.createElement(ju)
  );
}
function Vu() {
  const { React: e } = z();
  return e.useEffect(() => {
    window.history.replaceState({}, "", "/settings/ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, []), null;
}
let tn = null;
function Kr() {
  return tn || (tn = (async () => {
    var r;
    const e = (r = window.QwenPaw) == null ? void 0 : r.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = `${e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    )}`;
    console.info("[oilgas-vis] Loading viewer runtime from", t), await new Promise((a, i) => {
      const s = document.createElement("script");
      s.dataset.plugin = "ugsci", s.src = t;
      const l = (d) => {
        clearTimeout(o), s.onload = null, s.onerror = null, d ? (s.remove(), i(d)) : a();
      }, o = setTimeout(
        () => l(new Error("可视化引擎加载超时，请重试")),
        3e4
      );
      s.onload = () => l(), s.onerror = () => l(new Error("可视化引擎脚本加载失败，请检查服务连接")), document.head.appendChild(s);
    });
    const n = window.OilGasViewerRuntime;
    if (!n || typeof n.mount != "function")
      throw new Error(
        "[oilgas-vis] window.OilGasViewerRuntime not found after script load"
      );
    return console.info(
      "[oilgas-vis] Viewer runtime loaded, version:",
      n.version
    ), n;
  })().catch((e) => {
    throw tn = null, e;
  }), tn);
}
function Kn(e, t = {}) {
  var l;
  const n = e.getApiUrl("ugsci/visualization").replace(/\/$/, ""), r = new URL(n, window.location.href), a = new URL(
    e.getApiUrl("workspace/tree"),
    window.location.href
  ), i = t.agentId || ((l = e.getSelectedAgentId) == null ? void 0 : l.call(e)), s = {};
  return i && (s["X-Agent-Id"] = i), t.chatId ? s["X-Chat-Id"] = t.chatId : t.projectDirOverride && (s["X-Session-Project-Dir"] = t.projectDirOverride), {
    apiBase: n,
    headers: s,
    request: async (o, d) => {
      const c = new URL(
        o instanceof Request ? o.url : String(o),
        window.location.href
      ), u = c.origin === r.origin && c.pathname.startsWith(`${r.pathname}/`), m = c.origin === a.origin && c.pathname === a.pathname && ((d == null ? void 0 : d.method) || "GET").toUpperCase() === "GET";
      if (!u && !m || c.username || c.password)
        throw new Error("可视化请求超出当前数据服务范围");
      const p = new Headers(d == null ? void 0 : d.headers);
      Object.entries(s).forEach(
        ([f, h]) => p.set(f, h)
      );
      const b = e.getApiToken();
      b ? p.set("Authorization", `Bearer ${b}`) : p.delete("Authorization");
      const g = { ...d, headers: p };
      return e.fetch ? e.fetch(
        m ? `/workspace/tree${c.search}` : `/ugsci/visualization${c.pathname.slice(
          r.pathname.length
        )}${c.search}`,
        g
      ) : fetch(c.href, g);
    }
  };
}
class Xr {
  constructor(t, n, r = {}) {
    this.options = { apiBase: t, authToken: n, ...r };
  }
  update(t) {
    this.options = { ...this.options, ...t };
  }
  async request(t, n = {}) {
    const r = this.options.apiBase.replace(/\/$/, ""), a = t.startsWith(`${r}/`) ? t : `${r}/${t.replace(/^\//, "")}`, i = new Headers(this.options.headers);
    this.options.authToken && !i.has("Authorization") && i.set("Authorization", `Bearer ${this.options.authToken}`), new Headers(n.headers).forEach((l, o) => i.set(o, l));
    const s = await (this.options.request || fetch)(a, {
      ...n,
      headers: i
    });
    if (!s.ok) {
      let l = "";
      try {
        const o = await s.json();
        l = typeof o.detail == "string" ? o.detail : typeof o.error == "string" ? o.error : "";
      } catch {
      }
      throw new Error(
        `请求失败（HTTP ${s.status}）${l ? `：${l}` : ""}`
      );
    }
    return s;
  }
  async fetchJson(t, n) {
    return (await this.request(t, { signal: n })).json();
  }
  async getCapabilities() {
    return (await this.fetchJson("/capabilities")).capabilities;
  }
  getManifest(t) {
    return this.fetchJson("/manifest", t);
  }
  async fetchBinary(t, n) {
    const r = t.replace(/\\/g, "/").split("/");
    if (r.some((a) => !a || a === "." || a === "..") || /[:?#]/.test(t))
      throw new Error("数据资源路径无效");
    return (await this.request(
      `/resource/${r.map(encodeURIComponent).join("/")}`,
      { signal: n }
    )).arrayBuffer();
  }
  async createImport(t, n, r, a) {
    const i = new FormData();
    return i.append("file", t), i.append("name", n), r && i.append("property_file", r), a && i.append("companion_file", a), (await this.request("/imports", { method: "POST", body: i })).json();
  }
  async createWorkspaceImport(t, n = "project", r = "", a) {
    const i = await (await this.request("/imports/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: t, root: n, name: r }),
      signal: a
    })).json();
    if (typeof i.job_id != "string" || !i.job_id)
      throw new Error("导入请求未返回有效任务编号");
    return i;
  }
  async deleteDataset(t) {
    return (await this.request(`/datasets/${encodeURIComponent(t)}`, {
      method: "DELETE"
    })).json();
  }
  async restoreExamples() {
    return (await this.request("/catalog/restore-examples", { method: "POST" })).json();
  }
  getJobStatus(t, n) {
    return this.fetchJson(`/imports/${encodeURIComponent(t)}`, n);
  }
  async cancelJob(t) {
    await this.request(`/imports/${encodeURIComponent(t)}/cancel`, {
      method: "POST"
    });
  }
  async *subscribeToJobEvents(t, n) {
    const r = await this.request(
      `/imports/${encodeURIComponent(t)}/events`,
      { signal: n }
    );
    if (!r.body) throw new Error("服务器未返回任务事件流");
    const a = r.body.getReader(), i = new TextDecoder();
    let s = "";
    try {
      for (; ; ) {
        const { done: l, value: o } = await a.read();
        s += l ? i.decode() : i.decode(o, { stream: !0 });
        const d = s.split(`
`);
        s = d.pop() || "", l && s && d.push(s);
        for (const c of d) {
          if (!c.startsWith("data:")) continue;
          let u;
          try {
            u = JSON.parse(c.slice(5).trim());
          } catch {
            continue;
          }
          if (yield u, u.type === "done") return;
        }
        if (l) return;
      }
    } finally {
      try {
        await a.cancel();
      } catch {
      }
      a.releaseLock();
    }
  }
}
class jn extends Error {
  constructor(t) {
    super(t), this.name = "ImportJobFailedError";
  }
}
function Fu(e, t) {
  return new Promise((n, r) => {
    const a = () => {
      clearTimeout(i), t == null || t.removeEventListener("abort", a), r(new DOMException("已停止等待导入", "AbortError"));
    }, i = setTimeout(() => {
      t == null || t.removeEventListener("abort", a), n();
    }, e);
    t != null && t.aborted ? a() : t == null || t.addEventListener("abort", a, { once: !0 });
  });
}
async function Gu(e, t, n = {}) {
  var l;
  if (typeof t != "string" || !t.trim())
    throw new Error("导入任务未返回有效编号，请重试");
  const { signal: r, onProgress: a, attempts: i = 240, intervalMs: s = 750 } = n;
  for (let o = 0; o < i; o++) {
    r == null || r.throwIfAborted();
    const d = await e.getJobStatus(t, r);
    if (r == null || r.throwIfAborted(), !["queued", "running", "completed", "failed", "cancelled"].includes(
      d.status
    ))
      throw new Error("导入任务返回未知状态");
    const c = Number(d.progress);
    if (a == null || a({
      ...d,
      progress: Number.isFinite(c) ? Math.max(0, Math.min(1, c)) : 0
    }), r == null || r.throwIfAborted(), d.status === "completed") {
      if (typeof ((l = d.result) == null ? void 0 : l.id) != "string" || !d.result.id.trim())
        throw new jn("导入完成但未返回数据集编号");
      return d;
    }
    if (d.status === "failed" || d.status === "cancelled")
      throw new jn(
        d.error || (d.status === "cancelled" ? "导入任务已取消" : "导入失败")
      );
    o + 1 < i && await Fu(s, r);
  }
  throw new Error("等待导入超时，后台任务可能仍在处理；请稍后重试查询");
}
async function Os(e, t, n = {}) {
  return (await Gu(e, t, n)).result.id;
}
function Wu() {
  var S, B, N;
  const e = z(), t = e.React, { useEffect: n, useRef: r, useState: a } = t, { Spin: i, Alert: s, Button: l } = e.antd, o = r(null), d = r(null), c = r(null), [u, m] = a(!0), [p, b] = a(null), [g, f] = a(0), [h, y] = a("正在加载三维可视化引擎…"), E = ((S = e.useSelectedAgent) == null ? void 0 : S.call(e).id) || ((B = e.getSelectedAgentId) == null ? void 0 : B.call(e)), v = ((N = e.useLocation) == null ? void 0 : N.call(e).search) ?? window.location.search;
  return n(() => {
    const w = new AbortController();
    let x = null;
    return (async () => {
      var H, _;
      m(!0), b(null), y("正在加载三维可视化引擎…");
      try {
        const T = new URLSearchParams(v), $ = (H = T.get("path")) == null ? void 0 : H.trim(), F = {
          agentId: T.get("agentId") || E,
          chatId: T.get("chatId") || void 0,
          projectDirOverride: T.get("projectDirOverride") || void 0
        }, C = Kn(e, F);
        let I = T.get("datasetId") || void 0;
        if ($ && !I) {
          const M = new Xr(
            C.apiBase,
            C.authToken,
            C
          ), P = T.get("name") || $.replace(/\\/g, "/").split("/").pop() || $;
          y(`正在导入 ${P}…`);
          const W = T.get("root") === "workspace" ? "workspace" : "project", G = JSON.stringify([
            C.apiBase,
            C.headers,
            $,
            W
          ]);
          if (((_ = c.current) == null ? void 0 : _.scope) !== G) {
            c.current = null;
            const U = await M.createWorkspaceImport(
              $,
              W,
              P.replace(/\.[^.]+$/, ""),
              w.signal
            );
            w.signal.throwIfAborted(), c.current = { scope: G, id: U.job_id };
          }
          I = await Os(M, c.current.id, {
            signal: w.signal
          });
        }
        const L = await Kr();
        if (w.signal.aborted || !o.current) return;
        y("正在加载场景…"), x = L.mount(o.current, {
          ...C,
          initialDatasetId: I,
          enableCommands: !0
        }), d.current = x, await x.ready, w.signal.aborted || m(!1);
      } catch (T) {
        if (w.signal.aborted) return;
        T instanceof jn && (c.current = null), x == null || x.dispose(), x = null, d.current = null, b(T instanceof Error ? T.message : "可视化引擎加载失败"), m(!1);
      }
    })(), () => {
      w.abort(), x == null || x.dispose(), d.current === x && (d.current = null);
    };
  }, [g, E, v]), t.createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        minHeight: 300,
        position: "relative",
        overflow: "hidden"
      }
    },
    t.createElement("div", {
      ref: o,
      style: { width: "100%", height: "100%" }
    }),
    u && t.createElement(
      "div",
      {
        role: "status",
        style: {
          position: "absolute",
          inset: 0,
          display: "grid",
          placeContent: "center",
          textAlign: "center",
          background: "#0d1117e8",
          color: "#dce5ef",
          zIndex: 100
        }
      },
      t.createElement(i, { size: "large" }),
      t.createElement("div", { style: { marginTop: 16 } }, h)
    ),
    p && t.createElement(
      "div",
      {
        style: {
          position: "absolute",
          inset: 0,
          display: "grid",
          placeContent: "center",
          padding: 24,
          gap: 16,
          background: "#0d1117",
          zIndex: 100
        }
      },
      t.createElement(s, {
        type: "error",
        message: "可视化引擎加载失败",
        description: p,
        showIcon: !0
      }),
      t.createElement(
        l,
        { type: "primary", onClick: () => f((w) => w + 1) },
        "重试"
      )
    )
  );
}
function Zu({
  jobId: e,
  file: t,
  onOpen: n,
  onRetryImport: r
}) {
  const a = z(), i = a.React, { useEffect: s, useRef: l, useState: o } = i, { Button: d, Alert: c } = a.antd, u = l(null), [m, p] = o("等待后台处理…"), [b, g] = o(null), [f, h] = o(null), [y, E] = o(!1), [v, S] = o(0), [B, N] = o(!1);
  return s(() => {
    const w = new AbortController();
    let x = null;
    g(null), N(!1), E(!1), h(null);
    const R = Kn(a, t), H = new Xr(R.apiBase, R.authToken, R);
    return (async () => {
      try {
        const _ = await Os(H, e, {
          signal: w.signal,
          onProgress: ($) => p(
            `${$.status === "queued" ? "等待后台处理" : "正在解析数据"}（${Math.round($.progress * 100)}%）`
          )
        });
        if (w.signal.aborted) return;
        h(_), p("正在加载场景…");
        const T = await Kr();
        if (w.signal.aborted || !u.current) return;
        x = T.mount(u.current, {
          ...R,
          initialDatasetId: _,
          autoLoad: !1,
          compact: !0,
          enableCommands: !1
        }), await x.ready, w.signal.aborted || E(!0);
      } catch (_) {
        if (w.signal.aborted) return;
        x == null || x.dispose(), x = null, N(_ instanceof jn), g(_ instanceof Error ? _.message : String(_));
      }
    })(), () => {
      w.abort(), x == null || x.dispose();
    };
  }, [e, v, t.agentId, t.chatId, t.projectDirOverride]), i.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    i.createElement("div", {
      ref: u,
      "aria-label": "油气三维预览",
      style: {
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: 360,
        minHeight: 0,
        border: "1px solid #30363d",
        borderRadius: 8,
        overflow: "hidden",
        contain: "layout paint style",
        display: b ? "none" : "block"
      }
    }),
    !y && !b && i.createElement(
      "div",
      { role: "status", style: { padding: 12 } },
      m
    ),
    b && i.createElement(c, {
      type: "warning",
      message: "预览失败",
      description: b,
      showIcon: !0
    }),
    b && i.createElement(
      d,
      {
        onClick: () => B ? r() : S((w) => w + 1),
        style: { marginTop: 8 }
      },
      B ? "重新导入" : "重试预览"
    ),
    f && i.createElement(
      d,
      {
        type: "primary",
        onClick: () => n(f),
        style: { marginTop: 8 }
      },
      "在可视化页面展开"
    )
  );
}
function Ju(e) {
  var w, x, R;
  const t = z(), n = t.React, { useEffect: r, useState: a } = n, { Button: i, Spin: s, Alert: l, Typography: o } = t.antd, d = (w = t.useNavigate) == null ? void 0 : w.call(t), c = ((x = t.useSelectedAgent) == null ? void 0 : x.call(t).id) || ((R = t.getSelectedAgentId) == null ? void 0 : R.call(t)), u = e.artifact || e.file || {}, m = {
    ...u,
    agentId: u.agentId || c
  }, p = m.filename || m.title || e.filename || "未命名文件", b = m.workspacePath || m.path || e.workspacePath, g = JSON.stringify([
    b,
    p,
    m.workspaceRoot,
    m.agentId,
    m.chatId,
    m.projectDirOverride
  ]), [f, h] = a(null), y = (f == null ? void 0 : f.key) === g ? f.id : null, [E, v] = a(null), [S, B] = a(0);
  r(() => {
    const H = new AbortController();
    if (h(null), v(null), !b) {
      v("文件缺少工作区路径，无法导入预览");
      return;
    }
    const _ = Kn(t, m);
    return new Xr(_.apiBase, _.authToken, _).createWorkspaceImport(
      b,
      m.workspaceRoot || "project",
      p.replace(/\.[^.]+$/, ""),
      H.signal
    ).then(($) => {
      H.signal.aborted || h({ id: $.job_id, key: g });
    }).catch(($) => {
      H.signal.aborted || v($ instanceof Error ? $.message : String($));
    }), () => H.abort();
  }, [g, S]);
  const N = (H) => {
    if (!d) {
      v("当前宿主未提供页面导航，请从侧栏打开油气可视化");
      return;
    }
    const _ = new URLSearchParams({ datasetId: H }), T = m.agentId;
    T && _.set("agentId", T), m.chatId ? _.set("chatId", m.chatId) : m.projectDirOverride && _.set("projectDirOverride", m.projectDirOverride), d(`/oilgas-visualization?${_}`);
  };
  return n.createElement(
    "div",
    {
      style: {
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box"
      }
    },
    n.createElement(o.Text, { strong: !0 }, `文件：${p}`),
    !y && !E && n.createElement(s, { tip: "正在提交工作区文件…" }),
    E && n.createElement(l, {
      type: "warning",
      message: "预览提示",
      description: E,
      showIcon: !0
    }),
    E && !y && b && n.createElement(
      i,
      { onClick: () => B((H) => H + 1) },
      "重试导入"
    ),
    y && n.createElement(Zu, {
      key: `${y}:${m.agentId || ""}:${m.chatId || ""}:${m.projectDirOverride || ""}`,
      jobId: y,
      file: m,
      onOpen: N,
      onRetryImport: () => B((H) => H + 1)
    })
  );
}
async function Qu(e, t = {}) {
  const { scope: n, signal: r, ...a } = t;
  r == null || r.throwIfAborted();
  const i = Kn(z(), n), s = await Kr();
  return r == null || r.throwIfAborted(), s.mount(e, {
    ...i,
    autoLoad: !1,
    enableCommands: !1,
    ...a
  });
}
const Ns = [
  {
    extension: "egrid",
    mimeTypes: ["application/x-eclipse-grid"],
    companions: ["init", "unrst"]
  },
  { extension: "grid", companions: ["init", "unrst"] },
  { extension: "grdecl", companions: ["init", "unrst"] },
  {
    extension: "init",
    mimeTypes: ["application/x-eclipse-init"],
    companionOnly: !0
  },
  {
    extension: "unrst",
    mimeTypes: ["application/x-eclipse-unrst"],
    companionOnly: !0
  },
  { extension: "roff", mimeTypes: ["application/x-roff"] },
  { extension: "roffbin" },
  {
    extension: "dat",
    mimeTypes: ["application/x-cmg-dat"],
    companions: ["dat", "sr3", "irf"]
  },
  {
    extension: "sr3",
    mimeTypes: ["application/x-cmg-sr3"],
    companions: ["dat", "sr3", "irf"]
  },
  { extension: "irf", companionOnly: !0 },
  {
    extension: "data",
    mimeTypes: ["application/x-tnavigator-data"],
    companions: ["init", "unrst"]
  },
  { extension: "model" },
  { extension: "tnav" },
  { extension: "tpr" },
  { extension: "las", mimeTypes: ["application/x-las"] },
  { extension: "las3" },
  { extension: "dlis", mimeTypes: ["application/x-dlis"] },
  { extension: "vtk", mimeTypes: ["application/vnd.vtk"] },
  { extension: "vtu", mimeTypes: ["application/x-vtu"] },
  { extension: "pvtu", mimeTypes: ["application/x-pvtu"] },
  { extension: "vti" },
  { extension: "xdmf", mimeTypes: ["application/x-xdmf"] },
  // Generic CSV stays in the host table preview; network CSV is opt-in.
  { extension: "csv", workspacePreview: !1 },
  { extension: "arrow", mimeTypes: ["application/vnd.apache.arrow.file"] },
  { extension: "parquet" },
  {
    extension: "json",
    previewExtensions: ["well.json", "surface.json", "network.json", "json"]
  }
], Yr = Ns;
Ns.map(
  (e) => e.extension
);
const Ku = Yr.filter((e) => e.workspacePreview !== !1).flatMap((e) => e.previewExtensions || [e.extension]), Xu = Yr.filter((e) => e.workspacePreview !== !1).flatMap((e) => e.mimeTypes || []);
Yr.filter((e) => !e.companionOnly).map((e) => e.extension);
function Yu(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0, e.ugsci = {
    ...e.ugsci,
    visualization: { version: 1, mount: Qu }
  }, e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: Wu,
    meta: {
      domain: "workspace",
      title: "油气可视化",
      description: "地质气藏、井筒与地面管网的统一可视化工作台",
      scope: "agent",
      layout: "workbench",
      navigation: "rail"
    }
  }), e.menu.add("ugsci", {
    id: "ugsci.visualization",
    location: "primary.agentScoped",
    label: () => "油气可视化",
    icon: ko,
    route: "ugsci.visualization",
    order: 7,
    visible: () => !0
  });
  const a = e.workspace;
  if (a != null && a.registerRenderer)
    try {
      a.registerRenderer({
        id: "ugsci.visualization",
        name: "UGSci 油气可视化",
        component: Ju,
        // Generic CSV belongs to the native table preview. Pipeline/network
        // CSV remains available through an explicit visualization import.
        extensions: Ku,
        mimeTypes: Xu,
        priority: 200,
        description: "UGSci 油气三维网格、井、剖面和测井可视化"
      });
    } catch (i) {
      console.warn(
        "[ugsci] Visualization workspace renderer registration failed:",
        i
      );
    }
}
const em = /* @__PURE__ */ new Set([
  "launch_simulation",
  "check_simulation_status",
  "wait_for_simulation",
  "read_simulation_results",
  "analyze_simulation"
]), tm = /* @__PURE__ */ new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output",
  "tool_result"
]);
function nm(e) {
  const t = /* @__PURE__ */ new Map(), n = (a, i = 0) => {
    if (!(i > 16 || a == null)) {
      if (typeof a == "string") {
        if (a.length > 2e5) return;
        try {
          n(JSON.parse(a), i + 1);
        } catch {
          for (const s of a.matchAll(
            /<ugsci-simulation-ref>([\s\S]{1,4096}?)<\/ugsci-simulation-ref>/g
          ))
            try {
              n(JSON.parse(s[1]), i + 1);
            } catch {
            }
        }
      } else if (Array.isArray(a))
        a.forEach((s) => n(s, i + 1));
      else if (typeof a == "object")
        if (a.kind === "ugsci_simulation" && a.schema_version === 1 && typeof a.run_id == "string" && /^[\w:.-]{1,160}$/.test(a.run_id))
          t.set(a.run_id, {
            kind: "ugsci_simulation",
            run_id: a.run_id,
            simulator: typeof a.simulator == "string" ? a.simulator : void 0,
            agent_id: typeof a.agent_id == "string" ? a.agent_id : void 0,
            session_id: typeof a.session_id == "string" ? a.session_id : void 0
          });
        else
          for (const s of [
            "text",
            "output",
            "content",
            "result",
            "data",
            "metadata"
          ])
            n(a[s], i + 1);
    }
  }, r = (a, i = 0) => {
    var s;
    if (!(!a || typeof a != "object" || i > 16)) {
      if (Array.isArray(a)) {
        a.forEach((l) => r(l, i + 1));
        return;
      }
      if (!(a.role === "user" || a.role === "system")) {
        if (tm.has(a.type)) {
          const l = Array.isArray(a.content) ? a.content : [];
          [
            (s = a.data) == null ? void 0 : s.name,
            ...l.map((d) => {
              var c;
              return (c = d == null ? void 0 : d.data) == null ? void 0 : c.name;
            }),
            a.name
          ].some((d) => em.has(d)) && n(a);
          return;
        }
        for (const l of ["output", "content", "data"])
          r(a[l], i + 1);
      }
    }
  };
  return r(e), [...t.values()];
}
function rm({ reference: e }) {
  var B, N, w, x, R, H;
  const t = z(), n = t.React, { Button: r } = t.antd, [a, i] = n.useState(!1), [s, l] = n.useState(!1), o = n.useId(), d = `${o}-details`, c = `${o}-results`, [, u] = n.useState(0), m = (B = t.useNavigate) == null ? void 0 : B.call(t), p = ((w = (N = t.useSelectedAgent) == null ? void 0 : N.call(t)) == null ? void 0 : w.id) || ((x = t.getSelectedAgentId) == null ? void 0 : x.call(t)) || "default", b = ((R = t.getCurrentSessionId) == null ? void 0 : R.call(t)) || "", g = e.agent_id || p, f = p === g, h = `数模任务 · ${e.simulator || "模拟计算"}`, y = {
    borderRadius: "var(--app-radius, 10px)",
    minHeight: 34,
    height: "auto",
    padding: "6px 14px",
    fontSize: "var(--app-font-secondary, 13px)",
    lineHeight: 1.5,
    whiteSpace: "normal"
  };
  n.useEffect(() => {
    const _ = () => u((T) => T + 1);
    return window.addEventListener("qwenpaw:simulation-monitor-ready", _), () => window.removeEventListener("qwenpaw:simulation-monitor-ready", _);
  }, []);
  const E = window.QwenPaw, v = (H = E == null ? void 0 : E.runCenter) == null ? void 0 : H.SimulationMonitor, S = () => window.dispatchEvent(
    new CustomEvent("qwenpaw:open-simulation-workbench", {
      detail: { runId: e.run_id, agentId: g, sessionId: b }
    })
  );
  return n.createElement(
    "section",
    {
      "aria-label": h,
      style: {
        boxSizing: "border-box",
        width: "100%",
        maxWidth: 640,
        minWidth: 0,
        padding: "var(--app-space-4, 16px)",
        margin: "12px 0",
        border: "1px solid var(--app-border-subtle, #e2e8f0)",
        borderRadius: "var(--app-radius-card, 16px)",
        background: "var(--app-surface, #fff)",
        color: "var(--app-text, #1e293b)"
      }
    },
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8
        }
      },
      n.createElement(
        "strong",
        {
          style: {
            fontSize: "var(--app-font-body, 14px)",
            lineHeight: 1.5,
            overflowWrap: "anywhere"
          }
        },
        h
      ),
      n.createElement(
        r,
        {
          type: "text",
          size: "small",
          "aria-expanded": s,
          "aria-controls": d,
          onClick: () => l((_) => !_),
          style: {
            fontSize: "var(--app-font-caption, 12px)",
            color: "var(--app-text-secondary, #64748b)",
            borderRadius: "var(--app-radius, 10px)"
          }
        },
        s ? "收起详情" : "任务详情"
      )
    ),
    n.createElement(
      "p",
      {
        style: {
          fontSize: "var(--app-font-secondary, 13px)",
          lineHeight: 1.6,
          color: "var(--app-text-secondary, #64748b)",
          margin: "6px 0 14px"
        }
      },
      "查看计算结果，或在工作区持续监测。"
    ),
    !f && n.createElement(
      "p",
      {
        style: {
          fontSize: "var(--app-font-secondary, 13px)",
          lineHeight: 1.6,
          margin: "0 0 12px",
          color: "var(--app-text-secondary, #64748b)"
        }
      },
      "请切换到该任务所属智能体后查看结果。"
    ),
    n.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
      n.createElement(
        r,
        {
          type: "primary",
          style: y,
          disabled: !f,
          "aria-expanded": a,
          "aria-controls": c,
          onClick: () => i((_) => !_)
        },
        a ? "收起结果" : "查看结果"
      ),
      n.createElement(
        r,
        { style: y, disabled: !f, onClick: S },
        "在侧栏监测"
      ),
      m && n.createElement(
        r,
        {
          type: "text",
          style: y,
          disabled: !f,
          onClick: () => m(
            `/run-center?run_id=${encodeURIComponent(e.run_id)}`
          )
        },
        "打开运行中心"
      )
    ),
    a && f && n.createElement(
      "div",
      {
        id: c,
        style: {
          minWidth: 0,
          marginTop: 16,
          paddingTop: 16,
          borderTop: "1px solid var(--app-border-subtle, #e2e8f0)"
        }
      },
      v ? n.createElement(v, {
        runId: e.run_id,
        compact: !0,
        scope: { agentId: g, chatId: b }
      }) : n.createElement(
        "p",
        { role: "status" },
        "运行中心监测组件尚未加载，请启用运行中心插件。"
      )
    ),
    s && n.createElement(
      "dl",
      {
        id: d,
        "aria-label": "任务详情",
        style: {
          display: "grid",
          gridTemplateColumns: "max-content minmax(0, 1fr)",
          gap: "8px 12px",
          margin: "14px 0 0",
          padding: 12,
          borderRadius: "var(--app-radius, 10px)",
          background: "var(--app-fill-subtle, #f8fafc)",
          fontSize: "var(--app-font-caption, 12px)",
          lineHeight: 1.6
        }
      },
      ...[
        ["任务 ID", e.run_id],
        ["所属智能体", g],
        ["来源会话", e.session_id || b]
      ].filter(([, _]) => _).flatMap(([_, T]) => [
        n.createElement(
          "dt",
          {
            key: `${_}-label`,
            style: { color: "var(--app-text-secondary, #64748b)" }
          },
          _
        ),
        n.createElement(
          "dd",
          {
            key: _,
            style: {
              margin: 0,
              minWidth: 0,
              overflowWrap: "anywhere",
              fontFamily: "ui-monospace, SFMono-Regular, monospace"
            }
          },
          T
        )
      ])
    )
  );
}
function am({ data: e }) {
  const t = z().React;
  return t.createElement(
    t.Fragment,
    null,
    ...nm(e.output).map(
      (n) => t.createElement(rm, { key: n.run_id, reference: n })
    )
  );
}
function im(e, t) {
  var r, a, i, s;
  (r = e.ugsciSimulationDispose) == null || r.call(e);
  const n = (s = (i = (a = e.chat) == null ? void 0 : a.response) == null ? void 0 : i.append) == null ? void 0 : s.call(
    i,
    "ugsci",
    ({ data: l }) => t.createElement(am, { data: l }),
    { id: "ugsci.simulation.response-append", order: 60 }
  );
  e.ugsciSimulationDispose = () => {
    var l;
    return (l = n == null ? void 0 : n.dispose) == null ? void 0 : l.call(n);
  };
}
const nn = "/ugsci/storage-dynamics", wi = (e) => e === "injection" ? "注气" : "采气", je = (e) => e == null ? "缺测" : e.toLocaleString("zh-CN", { maximumFractionDigits: 2 }), sm = {
  xls_row_limit: "疑似 XLS 导出截断",
  invalid_range: "数值超出合法范围",
  invalid_number: "无法识别数值",
  invalid_identity: "日期或库井标识无效",
  duplicate_identical: "相同重复已去重",
  duplicate_conflict: "重复冲突已排除"
}, om = {
  gas: "日气量",
  hours: "生产小时",
  pressure: "井口油压",
  casing: "套压",
  water: "日产水量",
  vent: "放空量"
};
function lm({ rows: e }) {
  const t = z().React, n = [...new Set(e.map((o) => o.month))].sort(), r = n.map((o) => {
    const d = e.filter((u) => u.month === o), c = (u) => {
      const m = d.map((p) => p[u]).filter((p) => p != null);
      return m.length ? m.reduce((p, b) => p + b, 0) : null;
    };
    return {
      month: o,
      injection: c("injection"),
      withdrawal: c("withdrawal")
    };
  }), a = Math.max(
    1,
    ...r.flatMap((o) => [o.injection || 0, o.withdrawal || 0])
  ), i = (o) => 65 + o * 635 / Math.max(1, n.length - 1), s = (o) => 245 - o / a * 200, l = (o) => {
    let d = !1;
    return r.map((c, u) => {
      if (c[o] == null)
        return d = !1, "";
      const m = `${d ? "L" : "M"}${i(u)},${s(c[o])}`;
      return d = !0, m;
    }).join(" ");
  };
  return /* @__PURE__ */ t.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ t.createElement("div", { style: { display: "flex", gap: 24, marginBottom: 8 } }, /* @__PURE__ */ t.createElement("span", { style: { color: "#1677ff" } }, "● 注气月量"), /* @__PURE__ */ t.createElement("span", { style: { color: "#e8684a" } }, "● 采气月量"), /* @__PURE__ */ t.createElement("span", null, "单位：万m³ / 月 · 空值断线")), /* @__PURE__ */ t.createElement(
    "svg",
    {
      viewBox: "0 0 750 290",
      role: "img",
      "aria-label": "注采气月度计量量趋势",
      style: { width: "100%", minWidth: 550, maxHeight: 350 }
    },
    [0, 0.25, 0.5, 0.75, 1].map((o) => /* @__PURE__ */ t.createElement("g", { key: o }, /* @__PURE__ */ t.createElement(
      "line",
      {
        x1: "65",
        x2: "700",
        y1: s(o * a),
        y2: s(o * a),
        stroke: "currentColor",
        opacity: ".12"
      }
    ), /* @__PURE__ */ t.createElement(
      "text",
      {
        x: "57",
        y: s(o * a) + 4,
        textAnchor: "end",
        fill: "currentColor",
        fontSize: "12"
      },
      je(o * a)
    ))),
    /* @__PURE__ */ t.createElement(
      "path",
      {
        d: l("injection"),
        stroke: "#1677ff",
        strokeWidth: "2.5",
        fill: "none"
      }
    ),
    /* @__PURE__ */ t.createElement(
      "path",
      {
        d: l("withdrawal"),
        stroke: "#e8684a",
        strokeWidth: "2.5",
        fill: "none"
      }
    ),
    r.map((o, d) => /* @__PURE__ */ t.createElement("g", { key: o.month }, d % Math.max(1, Math.ceil(n.length / 8)) === 0 && /* @__PURE__ */ t.createElement(
      "text",
      {
        x: i(d),
        y: "274",
        textAnchor: "middle",
        fill: "currentColor",
        fontSize: "12"
      },
      o.month
    ), /* @__PURE__ */ t.createElement("rect", { x: i(d) - 3, y: "40", width: "6", height: "205", fill: "transparent" }, /* @__PURE__ */ t.createElement("title", null, o.month, " 注气 ", je(o.injection), " / 采气 ", je(o.withdrawal), " ", "万m³"))))
  ));
}
function cm() {
  const e = z(), t = e.React, {
    Card: n,
    Select: r,
    Input: a,
    Button: i,
    Space: s,
    Alert: l,
    Table: o,
    Tabs: d,
    Statistic: c,
    Spin: u,
    DatePicker: m,
    InputNumber: p,
    Typography: b
  } = e.antd, [g, f] = t.useState([]), [h, y] = t.useState(""), [E, v] = t.useState(""), [S, B] = t.useState(""), [N, w] = t.useState(""), [x, R] = t.useState(""), [H, _] = t.useState(""), [T, $] = t.useState(4), [F, C] = t.useState(30), [I, L] = t.useState(null), [M, P] = t.useState(null), [W, G] = t.useState(""), [U, Q] = t.useState(""), D = t.useRef(!0), Y = async (j) => {
    var ve;
    const ge = await he(`${nn}/datasets`, {
      bypassCache: !0
    });
    if (!D.current) return;
    const we = ge.datasets.sort(
      (ue, Se) => Se.created_at.localeCompare(ue.created_at)
    );
    f(we), y(j || ((ve = we[0]) == null ? void 0 : ve.id) || "");
  };
  t.useEffect(() => (D.current = !0, Y().catch((j) => {
    D.current && Q(String(j.message || j));
  }), () => {
    D.current = !1;
  }), []);
  const ne = () => ({
    dataset_id: h,
    facility: S,
    well: N,
    start: x,
    end: H,
    cycle_start_month: T,
    drop_threshold_pct: F
  }), re = async () => {
    Q(""), G("读取并审计数据…");
    try {
      const j = await he(`${nn}/imports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_path: E })
      });
      for (; D.current; ) {
        await new Promise((we) => setTimeout(we, 1200));
        const ge = await he(`${nn}/imports/${j.id}`, {
          bypassCache: !0
        });
        if (ge.status === "failed") throw new Error(ge.error);
        if (ge.status === "completed") {
          await Y(ge.dataset.id), L(null), B(""), w("");
          break;
        }
      }
    } catch (j) {
      D.current && Q(j.message || String(j));
    } finally {
      D.current && G("");
    }
  }, se = async () => {
    Q(""), G("分析注采动态…");
    const j = ne();
    try {
      const ge = await he(`${nn}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(j)
      });
      D.current && (L(ge), P(j));
    } catch (ge) {
      D.current && Q(ge.message || String(ge));
    } finally {
      D.current && G("");
    }
  }, X = async () => {
    if (M) {
      G("生成报告…"), Q("");
      try {
        const j = await ct(`${nn}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(M)
        });
        if (!j.ok) throw new Error(await j.text());
        const ge = URL.createObjectURL(await j.blob()), we = document.createElement("a");
        we.href = ge, we.download = "储气库生产动态分析报告.md", we.click(), setTimeout(() => URL.revokeObjectURL(ge), 1e3);
      } catch (j) {
        Q(j.message || String(j));
      } finally {
        D.current && G("");
      }
    }
  }, pe = g.find((j) => j.id === h), ye = (j, ge, we) => /* @__PURE__ */ t.createElement(
    o,
    {
      size: "small",
      dataSource: j,
      columns: ge,
      rowKey: we,
      pagination: { pageSize: 12, showSizeChanger: !0 },
      scroll: { x: "max-content" }
    }
  ), q = (j, ge, we) => ({ title: j, dataIndex: ge, render: we });
  return /* @__PURE__ */ t.createElement("div", { style: { padding: 24, maxWidth: 1600, margin: "0 auto" } }, /* @__PURE__ */ t.createElement(b.Title, { level: 2, style: { marginTop: 0 } }, "储气库生产动态分析"), /* @__PURE__ */ t.createElement(b.Paragraph, { type: "secondary" }, "从注采日记录到库井动态、运行阶段与复核线索。保留计量口径，每个异常可追溯到原表。"), /* @__PURE__ */ t.createElement(n, { title: "数据与分析范围", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(s.Compact, { style: { width: "100%", marginBottom: 16 } }, /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "注采数据路径",
      value: E,
      onChange: (j) => v(j.target.value),
      placeholder: "本地 XLS / XLSX / UTF-8 CSV 文件或目录的绝对路径",
      disabled: !!W
    }
  ), /* @__PURE__ */ t.createElement(i, { onClick: re, disabled: !E.trim() || !!W }, "导入并检查")), /* @__PURE__ */ t.createElement(s, { wrap: !0, style: { marginBottom: 12 } }, /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "数据集",
      style: { minWidth: 260 },
      placeholder: "选择数据集",
      value: h || void 0,
      disabled: !!W,
      onChange: (j) => {
        y(j), B(""), w(""), L(null);
      },
      options: g.map((j) => ({
        label: `${j.name} · ${je(j.records)} 条`,
        value: j.id
      }))
    }
  ), /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "储气库",
      value: S,
      style: { minWidth: 145 },
      disabled: !!W,
      onChange: (j) => {
        B(j), w("");
      },
      options: [
        { label: "全部储气库", value: "" },
        ...((pe == null ? void 0 : pe.facilities) || []).map((j) => ({
          label: j.facility,
          value: j.facility
        }))
      ]
    }
  ), /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "井号",
      value: N,
      onChange: (j) => w(j.target.value),
      placeholder: "原始井号（可选）",
      style: { width: 150 },
      disabled: !!W
    }
  ), /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "起始日期",
      type: "date",
      value: x,
      onChange: (j) => R(j.target.value),
      disabled: !!W,
      style: { width: 155 }
    }
  ), /* @__PURE__ */ t.createElement("span", null, "至"), /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "截止日期",
      type: "date",
      value: H,
      onChange: (j) => _(j.target.value),
      disabled: !!W,
      style: { width: 155 }
    }
  )), /* @__PURE__ */ t.createElement(s, { wrap: !0 }, /* @__PURE__ */ t.createElement("span", null, "气年度起始月"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "气年度起始月份",
      min: 1,
      max: 12,
      value: T,
      disabled: !!W,
      onChange: (j) => $(j || 4)
    }
  ), /* @__PURE__ */ t.createElement("span", null, "折算量下降筛查阈值（%）"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "下降筛查阈值",
      min: 1,
      max: 100,
      value: F,
      disabled: !!W,
      onChange: (j) => C(j || 30)
    }
  ), /* @__PURE__ */ t.createElement(i, { type: "primary", onClick: se, disabled: !h || !!W }, "分析动态"), /* @__PURE__ */ t.createElement(i, { onClick: X, disabled: !I || !!W }, "下载分析报告"))), U && /* @__PURE__ */ t.createElement(
    l,
    {
      type: "error",
      showIcon: !0,
      message: U,
      style: { marginBottom: 16 }
    }
  ), W && /* @__PURE__ */ t.createElement("div", { role: "status", style: { padding: 16 } }, /* @__PURE__ */ t.createElement(u, { size: "small" }), " ", W), !I && !W && /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(b.Paragraph, null, "选择已导入数据集并点击“分析动态”。也可以在专家中心创建“储气库生产动态分析师”，通过对话调用相同的分析工具。"), /* @__PURE__ */ t.createElement(
    l,
    {
      type: "info",
      showIcon: !0,
      message: "源文件只读；空值不补零，井口油压不替代地层压力。"
    }
  )), I && /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(
    l,
    {
      type: "info",
      showIcon: !0,
      message: `分析截至数据日期 ${I.summary.as_of} · ${I.filters.facility || "全部库"} / ${I.filters.well || "全部井"} · ${I.summary.start} 起 · 气年度 ${I.parameters.cycle_start_month} 月起 · 筛查阈值 ${I.parameters.drop_threshold_pct}%`,
      style: { marginBottom: 16 }
    }
  ), /* @__PURE__ */ t.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
        gap: 14,
        marginBottom: 18
      }
    },
    [
      [
        "储气库 / 原始井号",
        `${I.summary.facilities} / ${I.summary.wells}`,
        ""
      ],
      ["已记录累计注气", je(I.summary.injection), "万m³"],
      ["已记录累计采气", je(I.summary.withdrawal), "万m³"],
      ["气量缺测日记录", je(I.summary.missing_gas), "条"],
      ["筛查线索", je(I.summary.anomaly_count), "项"]
    ].map(([j, ge, we]) => /* @__PURE__ */ t.createElement(n, { key: j, size: "small" }, /* @__PURE__ */ t.createElement(c, { title: j, value: ge, suffix: we })))
  ), /* @__PURE__ */ t.createElement(n, { title: "注采月度动态", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(lm, { rows: I.monthly }), /* @__PURE__ */ t.createElement(b.Text, { type: "secondary" }, "未记录的一侧保持缺测。累计注采差额需要完整历史与期初库存才能参与库存核算。")), /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(
    d,
    {
      items: [
        {
          key: "coverage",
          label: "数据覆盖与质量",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, ye(
            I.coverage,
            [
              q("储气库", "facility"),
              q("方向", "mode", wi),
              q("起始日期", "start"),
              q("截止日期", "end"),
              q("记录数", "records", je),
              q("气量缺测", "missing_gas", je),
              q("计量量 / 万m³", "observed_volume", je)
            ],
            (j) => `${j.facility}-${j.mode}`
          ), /* @__PURE__ */ t.createElement(
            l,
            {
              type: "warning",
              showIcon: !0,
              message: "分析口径与数据限制",
              description: /* @__PURE__ */ t.createElement("ul", null, I.warnings.map((j, ge) => /* @__PURE__ */ t.createElement("li", { key: ge }, j)))
            }
          ), /* @__PURE__ */ t.createElement(b.Paragraph, { style: { marginTop: 12 } }, "整个数据集导入检查：", Object.entries(I.quality.import_counts).map(([j, ge]) => `${sm[j] || j} ${ge} 项`).join("；") || "未发现已配置检查项中的问题", "。下方最多显示 100 条原表问题样例。"), ye(
            I.quality.examples,
            [
              q("问题", "message"),
              q(
                "字段",
                "field",
                (j) => om[j] || j || "—"
              ),
              q("文件", "file"),
              q("表", "sheet"),
              q("原行号", "row")
            ],
            (j) => `${j.file}-${j.sheet}-${j.row}-${j.code}-${j.field}`
          ))
        },
        {
          key: "cycles",
          label: "气年度与阶段",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, ye(
            I.cycles,
            [
              q("储气库", "facility"),
              q("气年度", "gas_year"),
              q("注气 / 万m³", "injection", je),
              q("采气 / 万m³", "withdrawal", je),
              q("净计量变化 / 万m³", "net_metered_change", je),
              q(
                "水气质量比 / t/万m³",
                "water_gas_mass_ratio",
                je
              ),
              q("覆盖状态", "completeness")
            ],
            (j) => `${j.facility}-${j.gas_year}`
          ), /* @__PURE__ */ t.createElement(b.Title, { level: 5 }, "近期运行阶段（按实测记录）"), ye(
            I.phases_recent,
            [
              q("库", "facility"),
              q(
                "状态",
                "state",
                (j) => ({
                  injection: "注气",
                  withdrawal: "采气",
                  mixed: "混合",
                  zero_observed: "已观测零气量",
                  unknown: "气量未知"
                })[j] || j
              ),
              q("起始", "start"),
              q("截止", "end"),
              q("连续观测日", "observed_days")
            ],
            (j) => `${j.facility}-${j.start}`
          ))
        },
        {
          key: "wells",
          label: "井动态与短期基线",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, ye(
            I.wells,
            [
              q("库", "facility"),
              q("井号", "well"),
              q("方向", "mode", wi),
              q("运行日", "active_days", je),
              q("累计计量 / 万m³", "observed_volume", je),
              q("最近运行日期", "last_active_date"),
              q("折算量变化 / %", "rate_change_pct", je),
              q("井口油压变化 / %", "pressure_change_pct", je),
              q(
                "条件性日量基线 / 万m³",
                "forecast",
                (j) => je(j == null ? void 0 : j.daily_volume)
              ),
              q(
                "滚动回测 MAE / 万m³",
                "forecast",
                (j) => je(j == null ? void 0 : j.backtest_mae)
              ),
              q("基线状态", "forecast_reason")
            ],
            (j) => `${j.facility}-${j.well}-${j.mode}`
          ), /* @__PURE__ */ t.createElement(b.Text, { type: "secondary" }, "短期基线仅限保持工况的 7 日分析；停井、缺测与日期断档会断开阶段。回测仅使用预测时点之前的记录。"))
        },
        {
          key: "anomalies",
          label: "复核线索",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(b.Paragraph, null, "共 ", je(I.summary.anomaly_count), " ", "项筛查线索，显示最近 100 项。线索需要结合现场调度与工程资料复核。"), ye(
            I.anomalies,
            [
              q("日期", "day"),
              q("库", "facility"),
              q("井号", "well"),
              q("线索", "message"),
              q("变化 / %", "rate_change_pct", je),
              q(
                "原表位置",
                "source",
                (j) => `${j.file} / ${j.sheet} / 第 ${j.row} 行`
              )
            ],
            (j) => `${j.facility}-${j.well}-${j.day}-${j.code}`
          ))
        }
      ]
    }
  ))));
}
function dm() {
  var l, o, d, c;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = z().React, n = "ugsci";
  im(e, t);
  function r() {
    return z().React.createElement(ld, { embedded: !0 });
  }
  function a() {
    return z().React.useEffect(() => {
      window.history.replaceState({}, "", "/market?tab=ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
    }, []), null;
  }
  (o = (l = e.chat) == null ? void 0 : l.rightHeader) != null && o.add ? (e.chat.rightHeader.add(
    n,
    t.createElement(dd),
    {
      id: "ugsci.welcome-injector",
      order: -1
      // render before other right-header items (invisible anyway)
    }
  ), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const s = (z().antdIcons || {}).ToolOutlined;
  e.route.add(n, {
    id: "ugsci.storage-dynamics",
    path: "/ugsci-storage-dynamics",
    component: cm
  }), e.menu.add(n, {
    id: "ugsci.storage-dynamics",
    location: "primary.agentScoped",
    label: () => "储气库动态",
    icon: _o,
    route: "ugsci.storage-dynamics",
    order: 7
  }), e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: sc
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: Co,
    route: "ugsci.experts",
    order: 5
  }), e.route.add(n, {
    id: "ugsci.settings",
    path: "/ugsci-settings",
    component: qu
  }), e.route.add(n, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: Vu
  }), e.route.add(n, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: as
  }), e.menu.add(n, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6
  }), e.route.add(n, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Lc
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Pc
  }), e.route.add(n, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: a
  }), (d = e.marketplace) == null || d.add(n, {
    id: "ugsci",
    label: "UGSci",
    component: r,
    order: 30
  }), (c = e.sidebar) != null && c.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.tools-skills",
    "ugsci.storage-dynamics"
  ]), console.info(
    "[ugsci] Registered 3 entries for legacy simple-mode compatibility"
  )) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  try {
    const m = e.menu.snapshot("primary.agentScoped").find((p) => p.id === "oilgas-vis.page");
    m && e.menu.replace(n, "oilgas-vis.page", {
      ...m,
      visible: () => !1
    });
  } catch {
  }
  Uu(e, t), Yu(e), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, host-managed navigation"
  );
}
function zr() {
  try {
    dm();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(zr, 500);
  }
}
var Ii;
if ((Ii = window.QwenPaw) != null && Ii.host)
  zr();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), zr());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function um(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), a = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(a), t && (r.href = t), a.href = e, a.href;
}
const mm = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function ht(e) {
  const t = [];
  for (let n = 0, r = e.length; n < r; n++)
    t.push(e[n]);
  return t;
}
let Lt = null;
function Bs(e = {}) {
  return Lt || (e.includeStyleProperties ? (Lt = e.includeStyleProperties, Lt) : (Lt = ht(window.getComputedStyle(document.documentElement)), Lt));
}
function Dn(e, t) {
  const r = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return r ? parseFloat(r.replace("px", "")) : 0;
}
function pm(e) {
  const t = Dn(e, "border-left-width"), n = Dn(e, "border-right-width");
  return e.clientWidth + t + n;
}
function gm(e) {
  const t = Dn(e, "border-top-width"), n = Dn(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function Hs(e, t = {}) {
  const n = t.width || pm(e), r = t.height || gm(e);
  return { width: n, height: r };
}
function fm() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const et = 16384;
function ym(e) {
  (e.width > et || e.height > et) && (e.width > et && e.height > et ? e.width > e.height ? (e.height *= et / e.width, e.width = et) : (e.width *= et / e.height, e.height = et) : e.width > et ? (e.height *= et / e.width, e.width = et) : (e.width *= et / e.height, e.height = et));
}
function qn(e) {
  return new Promise((t, n) => {
    const r = new Image();
    r.onload = () => {
      r.decode().then(() => {
        requestAnimationFrame(() => t(r));
      });
    }, r.onerror = n, r.crossOrigin = "anonymous", r.decoding = "async", r.src = e;
  });
}
async function hm(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function bm(e, t, n) {
  const r = "http://www.w3.org/2000/svg", a = document.createElementNS(r, "svg"), i = document.createElementNS(r, "foreignObject");
  return a.setAttribute("width", `${t}`), a.setAttribute("height", `${n}`), a.setAttribute("viewBox", `0 0 ${t} ${n}`), i.setAttribute("width", "100%"), i.setAttribute("height", "100%"), i.setAttribute("x", "0"), i.setAttribute("y", "0"), i.setAttribute("externalResourcesRequired", "true"), a.appendChild(i), i.appendChild(e), hm(a);
}
const Ye = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || Ye(n, t);
};
function vm(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Em(e, t) {
  return Bs(t).map((n) => {
    const r = e.getPropertyValue(n), a = e.getPropertyPriority(n);
    return `${n}: ${r}${a ? " !important" : ""};`;
  }).join(" ");
}
function wm(e, t, n, r) {
  const a = `.${e}:${t}`, i = n.cssText ? vm(n) : Em(n, r);
  return document.createTextNode(`${a}{${i}}`);
}
function xi(e, t, n, r) {
  const a = window.getComputedStyle(e, n), i = a.getPropertyValue("content");
  if (i === "" || i === "none")
    return;
  const s = mm();
  try {
    t.className = `${t.className} ${s}`;
  } catch {
    return;
  }
  const l = document.createElement("style");
  l.appendChild(wm(s, n, a, r)), t.appendChild(l);
}
function xm(e, t, n) {
  xi(e, t, ":before", n), xi(e, t, ":after", n);
}
const Si = "application/font-woff", ki = "image/jpeg", Sm = {
  woff: Si,
  woff2: Si,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: ki,
  jpeg: ki,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function km(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function ea(e) {
  const t = km(e).toLowerCase();
  return Sm[t] || "";
}
function _m(e) {
  return e.split(/,/)[1];
}
function Rr(e) {
  return e.search(/^(data:)/) !== -1;
}
function Cm(e, t) {
  return `data:${t};base64,${e}`;
}
async function Us(e, t, n) {
  const r = await fetch(e, t);
  if (r.status === 404)
    throw new Error(`Resource "${r.url}" not found`);
  const a = await r.blob();
  return new Promise((i, s) => {
    const l = new FileReader();
    l.onerror = s, l.onloadend = () => {
      try {
        i(n({ res: r, result: l.result }));
      } catch (o) {
        s(o);
      }
    }, l.readAsDataURL(a);
  });
}
const hr = {};
function Tm(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function ta(e, t, n) {
  const r = Tm(e, t, n.includeQueryParams);
  if (hr[r] != null)
    return hr[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let a;
  try {
    const i = await Us(e, n.fetchRequestInit, ({ res: s, result: l }) => (t || (t = s.headers.get("Content-Type") || ""), _m(l)));
    a = Cm(i, t);
  } catch (i) {
    a = n.imagePlaceholder || "";
    let s = `Failed to fetch resource: ${e}`;
    i && (s = typeof i == "string" ? i : i.message), s && console.warn(s);
  }
  return hr[r] = a, a;
}
async function Mm(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : qn(t);
}
async function Im(e, t) {
  if (e.currentSrc) {
    const i = document.createElement("canvas"), s = i.getContext("2d");
    i.width = e.clientWidth, i.height = e.clientHeight, s == null || s.drawImage(e, 0, 0, i.width, i.height);
    const l = i.toDataURL();
    return qn(l);
  }
  const n = e.poster, r = ea(n), a = await ta(n, r, t);
  return qn(a);
}
async function Am(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await Xn(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function $m(e, t) {
  return Ye(e, HTMLCanvasElement) ? Mm(e) : Ye(e, HTMLVideoElement) ? Im(e, t) : Ye(e, HTMLIFrameElement) ? Am(e, t) : e.cloneNode(js(e));
}
const zm = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", js = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function Rm(e, t, n) {
  var r, a;
  if (js(t))
    return t;
  let i = [];
  return zm(e) && e.assignedNodes ? i = ht(e.assignedNodes()) : Ye(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? i = ht(e.contentDocument.body.childNodes) : i = ht(((a = e.shadowRoot) !== null && a !== void 0 ? a : e).childNodes), i.length === 0 || Ye(e, HTMLVideoElement) || await i.reduce((s, l) => s.then(() => Xn(l, n)).then((o) => {
    o && t.appendChild(o);
  }), Promise.resolve()), t;
}
function Lm(e, t, n) {
  const r = t.style;
  if (!r)
    return;
  const a = window.getComputedStyle(e);
  a.cssText ? (r.cssText = a.cssText, r.transformOrigin = a.transformOrigin) : Bs(n).forEach((i) => {
    let s = a.getPropertyValue(i);
    i === "font-size" && s.endsWith("px") && (s = `${Math.floor(parseFloat(s.substring(0, s.length - 2))) - 0.1}px`), Ye(e, HTMLIFrameElement) && i === "display" && s === "inline" && (s = "block"), i === "d" && t.getAttribute("d") && (s = `path(${t.getAttribute("d")})`), r.setProperty(i, s, a.getPropertyPriority(i));
  });
}
function Pm(e, t) {
  Ye(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Ye(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function Om(e, t) {
  if (Ye(e, HTMLSelectElement)) {
    const r = Array.from(t.children).find((a) => e.value === a.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function Nm(e, t, n) {
  return Ye(t, Element) && (Lm(e, t, n), xm(e, t, n), Pm(e, t), Om(e, t)), t;
}
async function Bm(e, t) {
  const n = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (n.length === 0)
    return e;
  const r = {};
  for (let i = 0; i < n.length; i++) {
    const l = n[i].getAttribute("xlink:href");
    if (l) {
      const o = e.querySelector(l), d = document.querySelector(l);
      !o && d && !r[l] && (r[l] = await Xn(d, t, !0));
    }
  }
  const a = Object.values(r);
  if (a.length) {
    const i = "http://www.w3.org/1999/xhtml", s = document.createElementNS(i, "svg");
    s.setAttribute("xmlns", i), s.style.position = "absolute", s.style.width = "0", s.style.height = "0", s.style.overflow = "hidden", s.style.display = "none";
    const l = document.createElementNS(i, "defs");
    s.appendChild(l);
    for (let o = 0; o < a.length; o++)
      l.appendChild(a[o]);
    e.appendChild(s);
  }
  return e;
}
async function Xn(e, t, n) {
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => $m(r, t)).then((r) => Rm(e, r, t)).then((r) => Nm(e, r, t)).then((r) => Bm(r, t));
}
const Ds = /url\((['"]?)([^'"]+?)\1\)/g, Hm = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Um = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function jm(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function Dm(e) {
  const t = [];
  return e.replace(Ds, (n, r, a) => (t.push(a), n)), t.filter((n) => !Rr(n));
}
async function qm(e, t, n, r, a) {
  try {
    const i = n ? um(t, n) : t, s = ea(t);
    let l;
    return a || (l = await ta(i, s, r)), e.replace(jm(t), `$1${l}$3`);
  } catch {
  }
  return e;
}
function Vm(e, { preferredFontFormat: t }) {
  return t ? e.replace(Um, (n) => {
    for (; ; ) {
      const [r, , a] = Hm.exec(n) || [];
      if (!a)
        return "";
      if (a === t)
        return `src: ${r};`;
    }
  }) : e;
}
function qs(e) {
  return e.search(Ds) !== -1;
}
async function Vs(e, t, n) {
  if (!qs(e))
    return e;
  const r = Vm(e, n);
  return Dm(r).reduce((i, s) => i.then((l) => qm(l, s, t, n)), Promise.resolve(r));
}
async function Pt(e, t, n) {
  var r;
  const a = (r = t.style) === null || r === void 0 ? void 0 : r.getPropertyValue(e);
  if (a) {
    const i = await Vs(a, null, n);
    return t.style.setProperty(e, i, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function Fm(e, t) {
  await Pt("background", e, t) || await Pt("background-image", e, t), await Pt("mask", e, t) || await Pt("-webkit-mask", e, t) || await Pt("mask-image", e, t) || await Pt("-webkit-mask-image", e, t);
}
async function Gm(e, t) {
  const n = Ye(e, HTMLImageElement);
  if (!(n && !Rr(e.src)) && !(Ye(e, SVGImageElement) && !Rr(e.href.baseVal)))
    return;
  const r = n ? e.src : e.href.baseVal, a = await ta(r, ea(r), t);
  await new Promise((i, s) => {
    e.onload = i, e.onerror = t.onImageErrorHandler ? (...o) => {
      try {
        i(t.onImageErrorHandler(...o));
      } catch (d) {
        s(d);
      }
    } : s;
    const l = e;
    l.decode && (l.decode = i), l.loading === "lazy" && (l.loading = "eager"), n ? (e.srcset = "", e.src = a) : e.href.baseVal = a;
  });
}
async function Wm(e, t) {
  const r = ht(e.childNodes).map((a) => Fs(a, t));
  await Promise.all(r).then(() => e);
}
async function Fs(e, t) {
  Ye(e, Element) && (await Fm(e, t), await Gm(e, t), await Wm(e, t));
}
function Zm(e, t) {
  const { style: n } = e;
  t.backgroundColor && (n.backgroundColor = t.backgroundColor), t.width && (n.width = `${t.width}px`), t.height && (n.height = `${t.height}px`);
  const r = t.style;
  return r != null && Object.keys(r).forEach((a) => {
    n[a] = r[a];
  }), e;
}
const _i = {};
async function Ci(e) {
  let t = _i[e];
  if (t != null)
    return t;
  const r = await (await fetch(e)).text();
  return t = { url: e, cssText: r }, _i[e] = t, t;
}
async function Ti(e, t) {
  let n = e.cssText;
  const r = /url\(["']?([^"')]+)["']?\)/g, i = (n.match(/url\([^)]+\)/g) || []).map(async (s) => {
    let l = s.replace(r, "$1");
    return l.startsWith("https://") || (l = new URL(l, e.url).href), Us(l, t.fetchRequestInit, ({ result: o }) => (n = n.replace(s, `url(${o})`), [s, o]));
  });
  return Promise.all(i).then(() => n);
}
function Mi(e) {
  if (e == null)
    return [];
  const t = [], n = /(\/\*[\s\S]*?\*\/)/gi;
  let r = e.replace(n, "");
  const a = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  for (; ; ) {
    const o = a.exec(r);
    if (o === null)
      break;
    t.push(o[0]);
  }
  r = r.replace(a, "");
  const i = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, s = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})", l = new RegExp(s, "gi");
  for (; ; ) {
    let o = i.exec(r);
    if (o === null) {
      if (o = l.exec(r), o === null)
        break;
      i.lastIndex = l.lastIndex;
    } else
      l.lastIndex = i.lastIndex;
    t.push(o[0]);
  }
  return t;
}
async function Jm(e, t) {
  const n = [], r = [];
  return e.forEach((a) => {
    if ("cssRules" in a)
      try {
        ht(a.cssRules || []).forEach((i, s) => {
          if (i.type === CSSRule.IMPORT_RULE) {
            let l = s + 1;
            const o = i.href, d = Ci(o).then((c) => Ti(c, t)).then((c) => Mi(c).forEach((u) => {
              try {
                a.insertRule(u, u.startsWith("@import") ? l += 1 : a.cssRules.length);
              } catch (m) {
                console.error("Error inserting rule from remote css", {
                  rule: u,
                  error: m
                });
              }
            })).catch((c) => {
              console.error("Error loading remote css", c.toString());
            });
            r.push(d);
          }
        });
      } catch (i) {
        const s = e.find((l) => l.href == null) || document.styleSheets[0];
        a.href != null && r.push(Ci(a.href).then((l) => Ti(l, t)).then((l) => Mi(l).forEach((o) => {
          s.insertRule(o, s.cssRules.length);
        })).catch((l) => {
          console.error("Error loading remote stylesheet", l);
        })), console.error("Error inlining remote css file", i);
      }
  }), Promise.all(r).then(() => (e.forEach((a) => {
    if ("cssRules" in a)
      try {
        ht(a.cssRules || []).forEach((i) => {
          n.push(i);
        });
      } catch (i) {
        console.error(`Error while reading CSS rules from ${a.href}`, i);
      }
  }), n));
}
function Qm(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => qs(t.style.getPropertyValue("src")));
}
async function Km(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = ht(e.ownerDocument.styleSheets), r = await Jm(n, t);
  return Qm(r);
}
function Gs(e) {
  return e.trim().replace(/["']/g, "");
}
function Xm(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    (r.style.fontFamily || getComputedStyle(r).fontFamily).split(",").forEach((i) => {
      t.add(Gs(i));
    }), Array.from(r.children).forEach((i) => {
      i instanceof HTMLElement && n(i);
    });
  }
  return n(e), t;
}
async function Ym(e, t) {
  const n = await Km(e, t), r = Xm(e);
  return (await Promise.all(n.filter((i) => r.has(Gs(i.style.fontFamily))).map((i) => {
    const s = i.parentStyleSheet ? i.parentStyleSheet.href : null;
    return Vs(i.cssText, s, t);
  }))).join(`
`);
}
async function ep(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await Ym(e, t);
  if (n) {
    const r = document.createElement("style"), a = document.createTextNode(n);
    r.appendChild(a), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function Ws(e, t = {}) {
  const { width: n, height: r } = Hs(e, t), a = await Xn(e, t, !0);
  return await ep(a, t), await Fs(a, t), Zm(a, t), await bm(a, n, r);
}
async function Zs(e, t = {}) {
  const { width: n, height: r } = Hs(e, t), a = await Ws(e, t), i = await qn(a), s = document.createElement("canvas"), l = s.getContext("2d"), o = t.pixelRatio || fm(), d = t.canvasWidth || n, c = t.canvasHeight || r;
  return s.width = d * o, s.height = c * o, t.skipAutoScale || ym(s), s.style.width = `${d}`, s.style.height = `${c}`, t.backgroundColor && (l.fillStyle = t.backgroundColor, l.fillRect(0, 0, s.width, s.height)), l.drawImage(i, 0, 0, s.width, s.height), s;
}
async function tp(e, t = {}) {
  return (await Zs(e, t)).toDataURL();
}
const np = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: Zs,
  toPng: tp,
  toSvg: Ws
}, Symbol.toStringTag, { value: "Module" }));
