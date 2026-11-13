function L() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function go() {
  try {
    return L().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ti(e) {
  return L().getApiUrl(e);
}
function fo(e) {
  const t = go();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function yo(e) {
  const t = new Headers(e), n = {};
  return t.forEach((r, a) => {
    n[a] = r;
  }), n;
}
function ut(e, t) {
  const n = L(), r = yo(t == null ? void 0 : t.headers);
  return n.fetch ? n.fetch(e, { ...t, headers: r }) : fetch(n.getApiUrl(e), {
    ...t,
    headers: { ...fo(), ...r }
  });
}
const mn = /* @__PURE__ */ new Map(), ho = 15e3;
function bo(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function vo(e, t, n) {
  return `${e}:${t}:${n}`;
}
function Tt() {
  mn.clear();
}
function qn(e) {
  for (const [t, n] of mn)
    (e ? n.agentId === e : n.agentId) && mn.delete(t);
}
async function ge(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...a } = t || {}, i = bo(
    a.headers
  ), s = vo(n, e, i);
  if (n !== "GET" && (i ? qn(i) : Tt()), n === "GET" && !r) {
    const d = mn.get(s);
    if (d && Date.now() - d.ts < ho)
      return d.data;
  }
  const l = await ut(e, a);
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
function Eo({
  size: e = 16
}) {
  const t = L().React;
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
function wo({ size: e = 16 }) {
  const t = L().React;
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
function xo({
  size: e = 16
}) {
  const t = L().React;
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
function So({ size: e = 16 }) {
  const t = L().React;
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
function ko({ size: e = 16 }) {
  const t = L().React;
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
function _o({ size: e = 16 }) {
  const t = L().React;
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
const Mi = `
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
`, Ma = {
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
  const t = Ma[e] || Ma[e.replace(/-(?:zh|en)$/, "")];
  return typeof t == "string" ? t : e;
}
const Co = {
  "Default Agent": "默认智能体",
  "QwenPaw-Data": "数据分析专家",
  "QA Agent": "质量审核专家",
  "CloudPaw-Master": "云端统筹专家",
  "CloudPaw-Executor": "云端执行专家",
  "CloudPaw-Verifier": "云端验证专家"
};
function Lr(e) {
  const t = Co[e];
  return typeof t == "string" ? t : e;
}
const Fn = {};
(function(e) {
  const t = (f) => '<path fill-rule="evenodd" d="' + f + '"/>', n = (f, h = 5) => '<path d="' + f + '" fill="none" stroke="currentColor" stroke-width="' + h + '" stroke-linecap="round" stroke-linejoin="round"/>', r = (f, h, y, E, b = 0) => '<rect x="' + f + '" y="' + h + '" width="' + y + '" height="' + E + '" rx="' + b + '"/>', a = (f, h, y) => '<circle cx="' + f + '" cy="' + h + '" r="' + y + '"/>', i = (f, h, y, E = 5) => '<circle cx="' + f + '" cy="' + h + '" r="' + y + '" fill="none" stroke="currentColor" stroke-width="' + E + '"/>', s = (f, h, y, E) => ({ id: f, label: h, detail: y, art: E });
  function l(f, h, y, E, b, x) {
    const j = new Map(x.map((O) => [O.id, O.art]));
    return {
      id: f,
      label: h,
      code: y,
      cradle: E,
      motif: b,
      roles: x.map(({ id: O, label: M, detail: S }) => ({ id: O, label: M, detail: S })),
      crown: (O) => j.get(O) || x[0].art
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
  ), m = l(
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
  ), u = l(
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
  ), v = l(
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
    m,
    u,
    p,
    v,
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
  function m(g) {
    return g === "water" ? t(
      "M64 10q-14 14-14 21a14 14 0 0 0 28 0q0-8-14-21Zm7 18q2 8-6 10l1 4q11-3 9-14Z"
    ) + n("M23 43q7-6 15 0t15 0m22 0q8-6 16 0t15 0", 4.9) : g === "air" ? n(
      "M24 28h46q12 0 12-9c0-8-12-10-16-3m-31 20h52q12 0 12 10M22 44h32",
      5.8
    ) + a(28, 18, 3.5) : t(
      "M32 42Q38 17 65 17q15 0 29-7-2 34-25 38-16 2-25-5-4 3-8 6l-6-3q10-12 28-17l17-5q-25 1-43 18Z"
    ) + n("M23 48q10-10 18-14", 4.2);
  }
  function u(g) {
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
  function v(g) {
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
      crown: m,
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
      crown: u,
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
      crown: v,
      roles: [
        s("aircraft", "飞行器设计专家", "机翼从流线形机身后掠展开。"),
        s("satellite", "卫星系统专家", "两块平板太阳翼沿星体两侧展开。"),
        s("propulsion", "航天推进专家", "尖锥机体斜向上升，尾部留出喷流。")
      ]
    }
  ];
})(Fn);
(function(e) {
  const t = (_, $, z) => ({ id: _, label: $, detail: z }), n = [
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
  ], r = (_) => '<path d="' + _ + '" fill-rule="evenodd"/>', a = (_, $) => '<path d="' + _ + '" fill="none" stroke="currentColor" stroke-width="' + $ + '" stroke-linejoin="round" stroke-linecap="round"/>', i = (_, $, z, A, P = 0) => '<rect x="' + _ + '" y="' + $ + '" width="' + z + '" height="' + A + '" rx="' + P + '"/>', s = (_, $, z) => '<circle cx="' + _ + '" cy="' + $ + '" r="' + z + '"/>', l = (_, $, z, A) => '<circle cx="' + _ + '" cy="' + $ + '" r="' + z + '" fill="none" stroke="currentColor" stroke-width="' + A + '"/>', o = {
    storage: "M18 57 24 51H31V75C31 85 37 92 48 92H80C91 92 97 85 97 75V51H104L110 57V76C110 95 99 106 81 106H47C29 106 18 95 18 76Z",
    oil: "M16 56 23 49 30 53V75C30 85 38 92 48 92H81Q98 92 98 75V50L106 53 111 63 108 80Q105 106 81 106H47Q24 106 20 86L16 77Z",
    gas: "M17 57H31V74Q31 92 49 92H79Q97 92 97 74V57H111V76Q111 106 81 106H47Q17 106 17 76Z",
    office: "M18 57 24 51H31V76Q31 86 39 90L47 93H81L97 79V52H105L110 57V84L88 105H44L28 99 18 86Z",
    geology: "M18 58 24 51H31V74L39 85 49 92H80Q97 90 97 75V51H104L111 59 108 82 99 98 83 106H47L30 100 19 86Z",
    drilling: "M17 59 24 50H31V75L40 87 48 92H80L88 87 97 75V50H104L111 59 108 81 96 98 81 106H47L32 98 20 81Z",
    analysis: "M18 56 23 51H31V77L37 87 47 92H81L91 87 97 77V51H105L110 56V83L99 98 84 106H44L29 98 18 83Z",
    integrity: "M19 55 26 50H32V73Q32 83 43 88L64 97 85 88Q96 83 96 73V50H102L109 55V76Q109 92 92 100L64 113 36 100Q19 92 19 76Z"
  };
  function d(_) {
    return _ === "cycling" ? r("M24 46Q62 9 104 46H94Q63 21 35 46Z M40 47Q64 27 89 47Z") + r(
      "M22 24H28V33H34L25 43 16 33H22Z M97 27 106 17 115 27H109V36H103V27Z"
    ) : _ === "seal" ? r(
      "M20 46Q32 34 44 26Q55 19 64 18Q81 19 107 46H96Q75 28 64 27Q52 28 31 46Z M36 47Q63 21 91 47Z"
    ) + r("M55 18V14L64 10 73 14V18L64 23Z") : r("M20 47Q64 1 108 47H98Q64 14 30 47Z M37 48Q64 21 91 48Z") + r("M79 15H92V19H88V33L83 29V19H79Z");
  }
  function c(_, $, z, A) {
    return r(_) + r($) + s(z, A, 3.7);
  }
  function m(_) {
    return _ === "recovery" ? c(
      "M30 23 90 17 94 22 34 29Z",
      "M23 21Q27 17 33 20L38 26Q34 34 29 39L23 37Q27 29 23 21Z",
      57,
      24
    ) + r("M54 26H60L71 48H63L57 34 49 48H42Z") + a("M86 24 90 35", 3.8) + r("M78 36Q90 31 99 40L104 37 104 48H92L96 44Q89 38 80 43Z") : _ === "waterflood" ? c(
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
  function u(_) {
    return _ === "pressure" ? a("M25 47V40H49M77 40H101V48", 7) + l(63, 31, 13, 5.2) + a("M63 32 69 24", 3.9) + s(63, 32, 2.6) + i(23, 35, 4.6, 10, 1) + i(97, 35, 6, 10, 1) : _ === "gathering" ? a("M28 24H41L63 42H98M32 46H43L54 38M76 24V42", 6.8) + i(25, 18, 5, 13, 1) + i(70, 20, 12, 5, 1) + i(94, 34, 5, 16, 1) : a("M23 45H45V34Q45 26 54 26H82V39Q82 43 87 43H104", 7.6) + i(22, 38, 5, 14, 1) + i(59, 19, 5.5, 15, 1) + i(98, 35.5, 5.5, 15, 1);
  }
  function p(_) {
    return _ === "schedule" ? r("M27 25H101V48H95V35H33V48H27Z") + i(38, 17, 7, 14, 3) + i(83, 17, 7, 14, 3) + i(40, 38, 10, 8, 1.3) + i(57, 38, 10, 8, 1.3) + i(74, 38, 10, 8, 1.3) : _ === "review" ? r("M30 47V20H79L95 34V47H89V36H75V26H36V47Z M79 27V32H85Z") + a("M43 36 49 42 61 31", 5) : r("M25 47V28H32V21H76V25H38V28H80L94 41V48H88V42H77V34H31V47Z") + a("M40 42H63", 3.6) + r("M61 16H81L99 32V43H95V34L79 20H61Z");
  }
  function v(_) {
    return _ === "seismic" ? a("M20 35H34L43 27 51 41 61 17 72 41 81 29 89 35H105", 4.8) + r(
      "M22 47Q37 44 50 47Q65 50 76 44Q91 36 105 40L104 46Q94 44 82 49L74 51H49Q38 46 24 51Z"
    ) : _ === "core" ? r(
      "M43 26Q43 17 62 16Q82 16 84 25V43Q81 51 64 51Q46 51 43 43Z M49 25Q50 28 63 28Q75 28 78 25Q75 22 63 22Q52 22 49 25Z M49 42Q60 40 78 32V37Q66 43 52 46Z"
    ) + r("M24 44 37 39V45L26 49Z M88 38 102 33V40L88 46Z") : r(
      "M19 41 39 35Q48 33 54 28L68 17 76 20Q80 24 87 21L103 15 107 22 90 28Q80 31 72 26L59 35Q51 41 42 43L24 48Z M36 49 53 42Q62 39 72 31Q81 36 92 31L105 27 106 34 91 39Q80 43 74 39L60 48 55 50Z M76 48 104 39 103 46 88 51H76Z"
    );
  }
  const g = r("M43 48 56 18H73L86 48H78L68 24H61L51 48Z") + i(54, 15, 21, 5, 1) + a("M56 37 72 29M55 35 74 42", 3.7);
  function f(_) {
    return _ === "trajectory" ? r("M31 47 44 18H58L72 47H64L54 24H49L39 47Z") + i(42, 15, 18, 5, 1) + a("M43 37 57 29", 4) + a("M81 20V31Q81 42 92 42H103", 5.4) + r("M97 35 107 42 97 49Z") : _ === "completion" ? r("M38 41 53 19H75L90 41H81L71 26H58L47 41Z") + i(51, 16, 26, 5, 1) + i(51, 36.5, 26, 5.3, 1.2) + i(55, 44, 18, 5.6, 1.2) + r("M41 44H48V49H37Z M80 44H87L91 49H80Z") : g + i(38, 44, 15, 5.5, 1) + i(76, 44, 15, 5.5, 1);
  }
  function h(_) {
    return _ === "forecast" ? a("M24 42 41 31 56 38 77 22 96 26", 5.2) + s(24, 42, 4.3) + s(41, 31, 4.3) + s(56, 38, 4.3) + s(77, 22, 4.3) + r("M92 18 107 27 91 33Z") : _ === "quality" ? r(
      "M26 20H90L102 30V33H26Z M34 24V29H40V24Z M47 24V29H63V24Z M26 38H102V48H26Z M34 41V45H40V41Z M47 41V45H63V41Z"
    ) + a("M84 40 88 44 96 37", 2.8) : i(24, 36, 12, 12, 1.6) + i(41, 26, 12, 22, 1.6) + i(58, 16, 12, 32, 1.6) + i(75, 22, 12, 26, 1.6) + i(92, 32, 12, 16, 1.6);
  }
  function y(_) {
    const $ = r(
      "M22 40 44 29 46 36 26 47H21Z M83 29 106 40 107 47H102L81 36Z"
    );
    return _ === "risk" ? $ + r(
      "M63 13Q65 12 67 15L86 43Q87 46 84 47H44Q41 47 42 44L61 15Z M61.1 24H66.8L66 35H62Z M61.8 38H66V42H61.8Z"
    ) : _ === "wellbarrier" ? $ + r(
      "M43 21 64 13 85 21V32Q85 44 64 51Q43 44 43 32Z M57 24V35Q57 39 64 42Q71 39 71 35V24H67V34L64 37 61 34V24Z"
    ) : $ + r(
      "M43 21 64 13 85 21V32Q85 44 64 51Q43 44 43 32Z M49 26 64 20 79 26V31L64 25 49 31Z M52 34 64 29 76 34 73 37 64 34 55 38Z"
    );
  }
  const E = {
    storage: d,
    oil: m,
    gas: u,
    office: p,
    geology: v,
    drilling: f,
    analysis: h,
    integrity: y
  };
  for (const _ of [
    ...e.UGSciHumanSectors || [],
    ...e.UGSciEngineeringSectors || []
  ]) {
    const { id: $, label: z, code: A, motif: P, roles: Z, crown: G, cradle: B } = _;
    n.push({ id: $, label: z, code: A, motif: P, roles: Z }), E[$] = G, o[$] = o[B] || o.storage;
  }
  const b = new Map(n.map((_) => [_.id, _])), x = [
    { id: "auto", label: "跟随领域" },
    { id: "round", label: "圆弧" },
    { id: "faceted", label: "切角" },
    { id: "shield", label: "盾形" },
    { id: "industrial", label: "机甲" }
  ], j = {
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
  }, O = [
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
  ], M = {
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
  let S = 0;
  function N(_, $, z, A) {
    const P = A || "ugsci-stamp-" + (++S).toString(36);
    return '<defs><clipPath id="' + P + '"><path clip-rule="evenodd" d="' + "M0 0H128V128H0Z M77 95a20 20 0 1 0 40 0a20 20 0 1 0 -40 0Z" + '"/></clipPath></defs><g clip-path="url(#' + P + ')">' + _ + '</g><g transform="translate(79 77)">' + z("badge_ring", l(18, 18, 15.9, 3.4)) + z("badge", M[$]) + "</g>";
  }
  const V = {
    focused: "M49 65a3.7 3.7 0 0 1 7.4 0v9.1a3.7 3.7 0 0 1-7.4 0Z M71.6 65a3.7 3.7 0 0 1 7.4 0v9.1a3.7 3.7 0 0 1-7.4 0Z",
    friendly: "M46.2 71.4q6.2-13 12.5 0l-3.2 2.5q-3-5.8-6.1 0Z M69.3 71.4q6.2-13 12.5 0l-3.2 2.5q-3-5.8-6.1 0Z",
    thinking: "M46.3 66.2 57.1 63l1.3 5.1-10.8 3.2Z M71.6 66a3.7 3.7 0 0 1 7.4 0v7.5a3.7 3.7 0 0 1-7.4 0Z"
  }, C = {
    classic: "M46 55H78L92 66V75Q92 86 82 86H46Q36 86 36 76V65Q36 55 46 55Z",
    soft: "M57 55H75L89 64Q94 68 90 75Q83 86 66 88Q47 88 39 80Q32 72 38 63Q44 55 57 55Z",
    angular: "M44 55H77L92 65V77L82 86H46L36 77V63Z"
  };
  function I(_, $) {
    if (typeof _ != "string") return $;
    const z = Array.from(
      _.replace(/[\u0000-\u001f\u007f-\u009f\ud800-\udfff\ufffe\uffff]/gu, " ").trim()
    ).slice(0, 64).join(""), A = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;"
    };
    return z.replace(/[&<>"']/g, (P) => A[P]) || $;
  }
  function R(_) {
    const $ = _ && typeof _ == "object" ? _ : {}, z = b.get($.domain) || n[0], A = z.roles.find((ke) => ke.id === $.role) || z.roles[0], P = Object.prototype.hasOwnProperty.call(V, $.expression) ? $.expression : "focused", Z = $.polarity === "dark", G = $.foreground === "currentColor" ? "currentColor" : Z ? "#ffffff" : "#171717", B = Z ? "#171717" : "#ffffff", K = $.colors && typeof $.colors == "object" ? $.colors : {}, D = (ke, Ie) => {
      const Te = K[ke];
      return typeof Te == "string" && /^#[0-9a-f]{6}$/i.test(Te) ? Te : (ke === "eyes" || ke === "background") && Te === "transparent" ? "transparent" : Ie;
    }, ee = (ke, Ie, Te = G) => {
      const we = D(ke, Te);
      return '<g data-avatar-part="' + ke + '" fill="' + we + '" color="' + we + '">' + Ie + "</g>";
    }, te = Number.isFinite(Number($.size)) && Number($.size) > 0 ? Math.max(16, Math.min(4096, Math.round(Number($.size)))) : 512, se = Object.prototype.hasOwnProperty.call(C, $.visor) ? C[$.visor] : C.classic, ae = I($.name, A.label), Y = b.get($.crownDomain) || z, ie = Y.roles.find((ke) => ke.id === $.crownRole) || (Y === z ? A : Y.roles[0]), de = Object.prototype.hasOwnProperty.call(
      j,
      $.shell
    ), q = de ? j[$.shell] : r(o[z.id]), U = !de && z.id === "gas" ? i(15, 52, 18, 4.8, 1) + i(95, 52, 18, 4.8, 1) : "", pe = D(
      "background",
      $.background === "transparent" ? "transparent" : B
    ), Ee = pe === "transparent" ? "" : '<rect data-avatar-part="background" width="128" height="128" fill="' + pe + '"/>';
    let be = ee("crown", E[Y.id](ie.id)) + ee("shell", q + U) + ee("visor", r(se + V[P])) + ee("eyes", r(V[P]), "transparent");
    Object.prototype.hasOwnProperty.call(M, $.badge) && (be = N(be, $.badge, ee, $.clipId));
    const oe = I($.categoryLabel, ""), Se = oe ? "<desc>所属领域 · " + oe + "</desc>" : "";
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + te + '" height="' + te + '" viewBox="0 0 128 128" role="img" aria-label="' + ae + '"><title>UGSci · ' + ae + "</title>" + Se + Ee + '<g fill="' + G + '" color="' + G + '">' + be + "</g></svg>";
  }
  const W = { domains: n, shells: x, badges: O, render: R };
  e.AvatarKit = W;
})(Fn);
const st = Fn.AvatarKit, Rn = [
  { id: "shell", label: "外壳", fallback: "#171717" },
  { id: "visor", label: "面罩", fallback: "#171717" },
  { id: "eyes", label: "眼睛", fallback: "#ffffff", transparent: !0 },
  { id: "crown", label: "头饰", fallback: "#171717" },
  { id: "badge", label: "徽记", fallback: "#171717" },
  { id: "badge_ring", label: "徽记边框", fallback: "#171717" },
  { id: "background", label: "背景", fallback: "#f3f0e8", transparent: !0 }
], To = [
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
], Mo = [
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
], Io = st.domains.flatMap(
  (e) => e.roles.map((t) => ({
    domain: e.id,
    role: t.id,
    label: t.label.replace(/专家$/, "")
  }))
);
function Pr(e, t = "") {
  let n;
  for (const r of [e, t.split(/\s+\|\s+/)[0]]) {
    const a = Io.find(({ label: o }) => r.includes(o));
    if (a) {
      n = { domain: a.domain, role: a.role };
      break;
    }
    const i = To.find(([, , o]) => o.test(r));
    if (i) {
      n = { domain: i[0], role: i[1] };
      break;
    }
    const s = Mo.find(
      ([, o]) => o.test(r)
    ), l = st.domains.find(
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
function _t(e) {
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
const Ao = 64, Ia = 128 * 1024, ir = "ugsci-avatar-template", ft = /* @__PURE__ */ new Map();
let sr = 0, $o = 0;
function zo(e, t, n, r) {
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
  let i = ft.get(a);
  if (i !== void 0)
    ft.delete(a), ft.set(a, i);
  else {
    i = st.render({
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
    if (o <= Ia) {
      for (; ft.size >= Ao || sr + o > Ia; ) {
        const d = ft.keys().next().value;
        sr -= (d.length + ft.get(d).length) * 2, ft.delete(d);
      }
      ft.set(a, i), sr += o;
    }
  }
  const l = "ugsci-avatar-" + (r === void 0 ? "generated-" + (++$o).toString(36) : "instance-" + r.replace(
    /[^a-zA-Z0-9-]/g,
    (o) => "_" + o.charCodeAt(0).toString(16) + "_"
  ));
  return i.replace('id="' + ir + '"', 'id="' + l + '"').replace(
    'clip-path="url(#' + ir + ')"',
    'clip-path="url(#' + l + ')"'
  );
}
const Ro = `<title>专家团</title>
  <g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="29.8" stroke-opacity=".38"/></g><g transform="translate(7.0 9.5) scale(0.5)"><path d="M6 18.5L10 14.5H14.5V32.6C14.5 38.4 18 42 23.7 42H40.3C46 42 49.5 38.4 49.5 32.6V14.5H54L58 18.5V32.6C58 43.1 51.3 50.2 40.8 50.2H23.2C12.7 50.2 6 43.1 6 32.6Z"/><path fill-rule="evenodd" d="M22.8 20.1H40.1L46.5 25.0V33.5C46.5 36.6 44.2 39 41 39H23C19.9 39 17.5 36.6 17.5 33.5V25.4C17.5 22.4 19.8 20.1 22.8 20.1ZM24.25 26.9a1.9 1.9 0 0 1 3.8 0v4.2a1.9 1.9 0 0 1 -3.8 0ZM35.95 26.9a1.9 1.9 0 0 1 3.8 0v4.2a1.9 1.9 0 0 1 -3.8 0Z"/></g><g transform="translate(20.0 22.4) scale(0.63)"><path d="M6 18.5L10 14.5H14.5V32.6C14.5 38.4 18 42 23.7 42H40.3C46 42 49.5 38.4 49.5 32.6V14.5H54L58 18.5V32.6C58 43.1 51.3 50.2 40.8 50.2H23.2C12.7 50.2 6 43.1 6 32.6Z"/><path fill-rule="evenodd" d="M22.8 20.1H40.1L46.5 25.0V33.5C46.5 36.6 44.2 39 41 39H23C19.9 39 17.5 36.6 17.5 33.5V25.4C17.5 22.4 19.8 20.1 22.8 20.1ZM24.25 26.9a1.9 1.9 0 0 1 3.8 0v4.2a1.9 1.9 0 0 1 -3.8 0ZM35.95 26.9a1.9 1.9 0 0 1 3.8 0v4.2a1.9 1.9 0 0 1 -3.8 0Z"/></g>`;
function Lo({
  markup: e,
  label: t,
  size: n,
  borderRadius: r
}) {
  const a = L().React, i = a.useId().replace(/:/g, "");
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
function at({
  name: e,
  size: t = 32,
  borderRadius: n = "50%",
  recipe: r,
  description: a = ""
}) {
  const i = L().React, s = i.useId(), l = i.useMemo(
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
      __html: zo(l, e, t, s)
    }
  });
}
function Or({
  members: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  return L().React.createElement(Lo, {
    markup: Ro,
    label: e.join(", ") || "team",
    size: t,
    borderRadius: n
  });
}
const Ii = [
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
], Po = Ii, Ai = [
  "全部专家",
  "油气工程",
  "数据与研究",
  "通用助手",
  "应用专家"
];
function Gn(e, t = !1) {
  return ge(
    `/ugsci/experts/${encodeURIComponent(e)}/presentation`,
    { headers: { "X-Agent-Id": e }, bypassCache: t }
  );
}
function Nr(e, t) {
  return ge(
    `/ugsci/experts/${encodeURIComponent(e)}/presentation`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(t)
    }
  );
}
async function Aa(e, t, n) {
  const r = await Gn(e, !0);
  return r.avatar ? r : Nr(e, {
    ...r,
    avatar: Pr(t, n)
  });
}
function Oo(e) {
  var i;
  const t = (s) => s.replace(/\*\*|`|^#+\s*/gm, "").replace(/^\s*[-*•]\s*/gm, "").replace(/\s+/g, " ").replace(/\s*[-•|]+\s*$/, "").trim(), n = ((i = e.split(/\s+\|\s+|\n/)[0]) == null ? void 0 : i.trim()) || "", r = /(?:定位|职责)[：:]\s*([\s\S]*?)(?=\s*(?:[-•]\s*)?(?:风格|Agent ID|上游|输出)[：:]|$)/i.exec(
    e
  );
  let a = t(n);
  return (!a || /^(?:名字|Agent ID)[：:]|^Default QwenPaw agent/i.test(a)) && (a = t((r == null ? void 0 : r[1]) || "")), /挑个你喜欢|机器里的幽灵|AI？机器人/.test(a) && (a = ""), a.length > 110 ? `${a.slice(0, 109).replace(/[，、；：\s]+$/, "")}…` : a;
}
function Ct(e) {
  var c, m;
  const { agent: t, presentation: n } = e, r = Ii.find(
    (u) => u.id === t.id || u.name === t.name
  ), a = `${t.name} ${(r == null ? void 0 : r.category) || ""} ${t.description || ""}`, i = t.managed_by_app ? "应用专家" : /资料审核|数据诊断|数值模拟分析|数据分析|科研|研究方法/.test(a) ? "数据与研究" : /油气|储气|气藏|油藏|地质|钻井|钻完井|物性|PVT|库存|注采|采油|测井|储层/i.test(
    a
  ) ? "油气工程" : "通用助手", s = t.managed_by_app ? "应用专家" : (n == null ? void 0 : n.category) || i, l = (n == null ? void 0 : n.summary) || Oo(((c = e.config) == null ? void 0 : c.description) || t.description || "") || (t.id === "default" ? "处理日常问答、信息整理和电脑操作任务。" : "尚未填写简介，可在设置中补充职责说明。"), o = e.skills.filter((u) => u.enabled !== !1), d = [
    ...new Set(
      (m = r == null ? void 0 : r.tags) != null && m.length ? r.tags : o.flatMap((u) => u.tags || [])
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
const Ke = {
  background: "var(--app-action-bg, var(--app-accent, #0072f5))",
  color: "var(--app-action-fg, #fff)",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function kt(e, t) {
  const n = L();
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
  const r = L().React, { Space: a } = L().antd;
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
  const e = await ge("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function jr(e) {
  return ge(`/agents/${encodeURIComponent(e)}`);
}
async function Zn(e) {
  return await ge(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Br(e = !1) {
  return await ge(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function No(e) {
  const t = await ge(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function jo() {
  return (await ge("/skills/workspaces") || []).map((t) => ({
    agent_id: t.agent_id,
    agent_name: t.agent_name || "",
    // Current hosts return skill_names. Keep the legacy fallback so the
    // plugin remains compatible with older QwenPaw releases.
    skill_names: Array.isArray(t.skill_names) ? t.skill_names : Array.isArray(t.skills) ? t.skills.map((n) => n.name) : []
  }));
}
function Vt(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function Bo(e) {
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
async function Ho(e) {
  return await ge("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Nt(e, t, n) {
  return ge(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function Uo(e, t, n, r) {
  return ge("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: n, enable: r })
  });
}
const Do = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function Vo(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const n = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Do.has(n))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function qo(e, t) {
  const n = await jr(e);
  n.system_prompt_files = t, await ge(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function $i(e, t) {
  await ge("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function zi(e, t) {
  await ge(
    Vt(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function Ri(e, t) {
  await ge(
    Vt(e, `/${encodeURIComponent(t)}`),
    {
      method: "DELETE"
    }
  );
}
async function Fo(e, t) {
  return ge(Vt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Go(e, t) {
  return ge(
    Vt(e, "/batch-disable"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    }
  );
}
async function Wo(e, t) {
  return ge(Vt(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Hr(e) {
  return await ge("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Zo(e, t) {
  await ge(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ur(e, t) {
  return ge("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Jo(e, t) {
  return ge(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Li(e, t) {
  await ge(
    Vt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Qo(e) {
  await ge(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Ko(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const r = parseInt(n[1] || "0", 10), a = parseInt(n[2] || "0", 10), i = parseInt(n[3] || "0", 10), s = r * 60 + a + Math.round(i / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function Xo(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Yo(e) {
  return ge("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function el(e, t) {
  return ge("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function tl(e) {
  await ge("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function nl(e) {
  return ge("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function rl(e, t) {
  return ge("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function al(e) {
  return (await ge("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function il(e, t) {
  await ge("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function sl() {
  return (await ge("/config/user-timezone")).timezone || "UTC";
}
async function ol(e) {
  await ge("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function ll(e) {
  return await ge("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const cl = `
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
`, $a = {
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
  var E, b;
  const a = L().React, { Popover: i } = L().antd, [s, l] = a.useState(!1), [o, d] = a.useState(e[0]), c = a.useRef(null), m = a.useRef(null), u = a.useId(), p = Rn.find((x) => x.id === e[0]), v = (E = t.colors) == null ? void 0 : E[p.id], g = !!v && /^#[0-9a-f]{6}$/i.test(v), f = v === "transparent" || !g && "transparent" in p, h = `${p.label}配色`, y = () => {
    var x;
    l(!1), (x = c.current) == null || x.focus();
  };
  return a.useEffect(() => {
    if (!s) return;
    const x = requestAnimationFrame(
      () => {
        var j, O;
        return (O = (j = m.current) == null ? void 0 : j.querySelector("select")) == null ? void 0 : O.focus({ preventScroll: !0 });
      }
    );
    return () => cancelAnimationFrame(x);
  }, [s]), a.createElement(
    i,
    {
      open: s && !r,
      onOpenChange: (x) => {
        x && d(e[0]), l(x);
      },
      trigger: "click",
      placement: "bottom",
      autoAdjustOverflow: !0,
      destroyOnHidden: !0,
      classNames: { root: "ugsci-avatar-color-popover" },
      content: a.createElement(
        "div",
        {
          ref: m,
          id: u,
          role: "dialog",
          "aria-label": h,
          className: "ugsci-avatar-color-panel",
          onKeyDown: (x) => {
            x.key === "Escape" && (x.preventDefault(), x.stopPropagation(), y());
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
              onChange: (x) => d(x.target.value)
            },
            e.map(
              (x) => a.createElement(
                "option",
                { key: x, value: x },
                Rn.find((j) => j.id === x).label
              )
            )
          )
        ),
        a.createElement(dl, {
          key: o,
          part: Rn.find((x) => x.id === o),
          value: (b = t.colors) == null ? void 0 : b[o],
          disabled: r,
          onChange: (x) => n({
            ...t,
            colors: { ...t.colors, [o]: x }
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
        "aria-controls": s ? u : void 0,
        title: `${h} · ${g ? v : f ? "透明" : "跟随主题"}`
      },
      a.createElement("span", {
        "aria-hidden": !0,
        style: f ? {
          background: "conic-gradient(var(--app-border) 25%, transparent 0 50%, var(--app-border) 0 75%, transparent 0) 0 0 / 8px 8px"
        } : { background: g ? v : "currentColor" }
      })
    )
  );
}
function dl({
  part: e,
  value: t,
  onChange: n,
  disabled: r
}) {
  const a = L().React, i = (u) => /^#[0-9a-f]{6}$/i.test(u), s = t && i(t) ? t : e.fallback, [l, o] = a.useState(s);
  a.useEffect(() => o(s), [s]);
  const d = "transparent" in e, c = t === "transparent" && d ? "transparent" : t && i(t) ? "custom" : "auto", m = r || c !== "custom";
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
          onChange: (u) => n(
            u.target.value === "custom" ? s : u.target.value
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
        disabled: m,
        onChange: (u) => n(u.target.value)
      }),
      a.createElement("input", {
        type: "text",
        "aria-label": `${e.label}颜色值`,
        value: l,
        maxLength: 7,
        spellCheck: !1,
        disabled: m,
        "aria-invalid": c === "custom" && !i(l),
        onChange: (u) => {
          o(u.target.value), i(u.target.value) && n(u.target.value);
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
function Pi({
  disabled: e,
  onClick: t
}) {
  const n = L().React;
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
function Oi({
  name: e,
  value: t,
  suggested: n,
  onChange: r,
  disabled: a = !1,
  showResetColors: i = !0
}) {
  var f, h, y;
  const s = L().React, [l, o] = s.useState(""), d = s.useId(), c = st.domains.find((E) => E.id === t.domain), m = st.domains.find(
    (E) => E.id === t.crown_domain
  ), u = s.useMemo(() => {
    const E = l.trim().toLowerCase();
    return E ? st.domains.flatMap((b) => b.roles.map((x) => ({ domain: b, role: x }))).filter(
      (b) => `${b.domain.label} ${b.role.label} ${b.role.detail}`.toLowerCase().includes(E)
    ) : c.roles.map((b) => ({ domain: c, role: b }));
  }, [c, l]), p = (E) => r({ ...t, ...E }), v = (E, b, x, j, O = !1) => s.createElement(
    "select",
    {
      "aria-label": E,
      id: `${d}-${b}`,
      value: t[b],
      disabled: a || O,
      onChange: (M) => j ? j(M.target.value) : p({ [b]: M.target.value })
    },
    x.map(
      (M) => s.createElement(
        "option",
        { key: M.id, value: M.id },
        M.label
      )
    )
  ), g = (E, b, x) => s.createElement(
    "div",
    { key: b, className: "ugsci-avatar-option" },
    s.createElement("label", { htmlFor: `${d}-${b}` }, E),
    s.createElement(
      "div",
      { className: "ugsci-avatar-option-row" },
      v(E, b, x),
      $a[b] && s.createElement(or, {
        parts: $a[b],
        value: t,
        onChange: r,
        disabled: a
      })
    )
  );
  return s.createElement(
    "section",
    { className: "ugsci-avatar-editor", "aria-label": "专家头像工坊" },
    s.createElement("style", null, cl),
    s.createElement(
      "aside",
      { className: "ugsci-avatar-preview" },
      s.createElement(
        "div",
        { className: "ugsci-avatar-preview-content" },
        s.createElement(
          "div",
          { className: "ugsci-avatar-artboard" },
          s.createElement(at, { name: e, recipe: t, size: 126 })
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
                s.createElement(at, {
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
            v("行业领域", "domain", st.domains, (E) => {
              const b = st.domains.find((x) => x.id === E);
              p({ domain: E, role: b.roles[0].id }), o("");
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
          u.map(
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
          !u.length && s.createElement("p", { role: "status" }, "未找到岗位")
        )
      ),
      s.createElement(
        "section",
        { className: "ugsci-avatar-parts-section", "aria-label": "部件配置" },
        s.createElement("h3", null, "部件配置"),
        s.createElement(
          "div",
          { className: "ugsci-avatar-options" },
          g("头像外壳", "shell", st.shells),
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
          g("副专长徽记", "badge", st.badges),
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
                v(
                  "头饰领域",
                  "crown_domain",
                  [{ id: "auto", label: "跟随当前岗位" }, ...st.domains],
                  (E) => p({ crown_domain: E, crown_role: "auto" })
                ),
                v(
                  "头饰岗位",
                  "crown_role",
                  [{ id: "auto", label: "自动匹配" }, ...(m == null ? void 0 : m.roles) || []],
                  void 0,
                  !m
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
        s.createElement(Pi, {
          disabled: a,
          onClick: () => p({ colors: {} })
        })
      )
    )
  );
}
function ul({
  expert: e,
  onRefresh: t,
  onDirtyChange: n
}) {
  const r = L().React, { useState: a, useEffect: i } = r, { Input: s, Select: l, Button: o, Alert: d, message: c } = L().antd, [m, u] = a(null), [p, v] = a(""), [g, f] = a(""), [h, y] = a(!1), [E, b] = a(!1), x = Ct(e);
  i(() => {
    let S = !0;
    return Gn(e.agent.id, !0).then((N) => {
      S && (u(N), v(JSON.stringify(N)));
    }).catch((N) => {
      S && f(N.message || "无法读取显示配置");
    }), () => {
      S = !1;
    };
  }, [e.agent.id]);
  const j = !!m && JSON.stringify(m) !== p;
  i(() => {
    n(j);
  }, [j, n]);
  const O = (S, N) => u((V) => V && { ...V, [S]: N }), M = async () => {
    if (m) {
      y(!0);
      try {
        const S = await Nr(e.agent.id, m);
        u(S), v(JSON.stringify(S)), Tt(), t(), c.success("专家显示信息已保存");
      } catch (S) {
        c.error(S.message || "保存失败，修改内容已保留");
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
  }) : m ? r.createElement(
    "div",
    null,
    r.createElement("h3", null, "基本信息"),
    r.createElement(
      "details",
      { className: "ugsci-avatar-settings", open: E },
      r.createElement(
        "summary",
        {
          onClick: (S) => {
            S.preventDefault(), b((N) => !N);
          }
        },
        "专家头像工坊"
      ),
      E && r.createElement(Oi, {
        name: m.display_name || e.agent.name,
        value: _t({ ...e, presentation: m }),
        suggested: _t({
          ...e,
          presentation: { ...m, avatar: null }
        }),
        disabled: h,
        onChange: (S) => u(
          (N) => N && { ...N, avatar: S }
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
          value: m.display_name,
          placeholder: e.agent.name,
          maxLength: 60,
          onChange: (S) => O("display_name", S.target.value)
        })
      ),
      r.createElement(
        "label",
        null,
        "专家分类",
        r.createElement(l, {
          "aria-label": "专家分类",
          value: m.category || "auto",
          disabled: !!e.agent.managed_by_app,
          onChange: (S) => O("category", S === "auto" ? null : S),
          options: [
            { value: "auto", label: `自动分类 · ${x.category}` },
            ...Ai.slice(1).map((S) => ({
              value: S,
              label: S
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
          value: m.specialty,
          disabled: !!e.agent.managed_by_app,
          placeholder: x.specialty,
          maxLength: 50,
          onChange: (S) => O("specialty", S.target.value)
        })
      ),
      r.createElement(
        "label",
        { className: "full" },
        "卡片简介",
        r.createElement(s.TextArea, {
          "aria-label": "卡片简介",
          value: m.summary,
          placeholder: x.summary,
          rows: 3,
          maxLength: 180,
          showCount: !0,
          onChange: (S) => O("summary", S.target.value)
        })
      )
    ),
    r.createElement(
      "div",
      { className: "ugsci-settings-save" },
      r.createElement(
        "span",
        { role: "status" },
        j ? "有未保存的修改" : "修改仅用于专家卡片展示"
      ),
      r.createElement(
        o,
        { type: "primary", loading: h, disabled: !j, onClick: M },
        "保存基本信息"
      )
    )
  ) : r.createElement("p", null, "正在读取显示配置…");
}
function Ni(e, t, n) {
  const { useRef: r, useEffect: a } = L().React, i = r(null), s = JSON.stringify(t);
  return a(() => {
    e || (i.current === null && (i.current = s), n == null || n(i.current !== s));
  }, [e, s, n]), () => {
    i.current = s, n == null || n(!1);
  };
}
const ml = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function pl({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: r,
  loading: a,
  onInstall: i
}) {
  const s = L().React, { useState: l, useEffect: o, useMemo: d } = s, { Modal: c, Button: m, Empty: u, Spin: p, Input: v, Tag: g, Tooltip: f, Typography: h } = L().antd, { CheckOutlined: y, SearchOutlined: E } = L().antdIcons || {}, { Text: b } = h, [x, j] = l([]), [O, M] = l("");
  o(() => {
    e && (j([]), M(""));
  }, [e]);
  const S = d(() => {
    if (!O.trim()) return n;
    const I = O.toLowerCase();
    return n.filter(
      (R) => {
        var W, _;
        return R.name.toLowerCase().includes(I) || Oe(R.name).toLowerCase().includes(I) || ((W = R.description) == null ? void 0 : W.toLowerCase().includes(I)) || ((_ = R.tags) == null ? void 0 : _.some(($) => $.toLowerCase().includes(I)));
      }
    );
  }, [n, O]), N = S.filter(
    (I) => !r.includes(I.name)
  ), V = (I) => {
    j(
      (R) => R.includes(I) ? R.filter((W) => W !== I) : [...R, I]
    );
  }, C = async () => {
    x.length !== 0 && (await i(x), j([]));
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
          b,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${x.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(m, { onClick: t }, "取消"),
          s.createElement(
            m,
            {
              type: "primary",
              onClick: C,
              disabled: x.length === 0
            },
            x.length > 0 ? `添加 (${x.length})` : "添加"
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
      s.createElement(v, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: E ? s.createElement(E) : void 0,
        value: O,
        onChange: (I) => M(I.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        m,
        {
          size: "small",
          type: "primary",
          onClick: () => j(N.map((I) => I.name))
        },
        "全选"
      ),
      s.createElement(
        m,
        {
          size: "small",
          onClick: () => j([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(p, { size: "large" })
    ) : S.length === 0 ? s.createElement(u, {
      description: O ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: u.PRESENTED_IMAGE_SIMPLE
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
      ...S.map((I) => {
        const R = x.includes(I.name), W = r.includes(I.name);
        return s.createElement(
          "div",
          {
            key: I.name,
            onClick: () => !W && V(I.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${R ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: W ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: R ? "rgba(0, 114, 245, 0.06)" : W ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: W ? 0.5 : 1,
              minHeight: 64
            }
          },
          R ? s.createElement(
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
          W ? s.createElement(
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
                paddingRight: W || R ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              I.emoji || "⚡"
            ),
            s.createElement(
              f,
              { title: Oe(I.name) },
              s.createElement(
                b,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                Oe(I.name)
              )
            )
          ),
          I.description ? s.createElement(
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
            I.description
          ) : null,
          I.tags && I.tags.length > 0 ? s.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...I.tags.slice(0, 2).map(
              (_, $) => s.createElement(
                g,
                {
                  key: $,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                _
              )
            )
          ) : null
        );
      })
    )
  );
}
const za = `
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
function gl({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: n,
  onDirtyChange: r,
  onEditorOpenChange: a,
  onSavingChange: i
}) {
  const s = L().React, { useState: l, useEffect: o, useRef: d } = s, {
    Button: c,
    Input: m,
    List: u,
    Switch: p,
    Tag: v,
    Spin: g,
    Empty: f,
    Segmented: h,
    Alert: y,
    Modal: E,
    message: b
  } = L().antd, [x, j] = E.useModal(), [O, M] = l([]), [S, N] = l(!0), [V, C] = l(""), [I, R] = l(t), [W, _] = l(!1), [$, z] = l({}), [A, P] = l(null), [Z, G] = l("split"), [B, K] = l(!1), [D, ee] = l(""), te = d(!0), se = d(0), ae = d(/* @__PURE__ */ new Map()), Y = d(0), ie = d(!1), de = Object.values($).some(Qt), q = A ? $[A] : void 0;
  o(() => (te.current = !0, () => {
    te.current = !1;
  }), []), o(() => {
    r == null || r(de);
  }, [de, r]), o(() => {
    i == null || i(B || W);
  }, [B, W, i]), o(() => {
    ie.current || R(t);
  }, [t]);
  async function U() {
    const Q = ++se.current;
    N(!0), C(""), qn(e);
    try {
      const w = await Ho(e);
      te.current && Q === se.current && M(w);
    } catch (w) {
      te.current && Q === se.current && C(w.message || "加载工作区文档失败");
    } finally {
      te.current && Q === se.current && N(!1);
    }
  }
  o(() => {
    U();
  }, [e]);
  async function pe(Q) {
    const w = ++Y.current;
    ae.current.set(Q, w), z((T) => ({
      ...T,
      [Q]: {
        name: Q,
        content: "",
        baseline: "",
        isNew: !1,
        loading: !0,
        error: ""
      }
    }));
    try {
      const T = await ge(
        `/workspace/files/${encodeURIComponent(Q)}`,
        {
          headers: { "X-Agent-Id": e },
          bypassCache: !0
        }
      );
      if (!te.current || ae.current.get(Q) !== w)
        return;
      z((H) => ({
        ...H,
        [Q]: {
          ...H[Q],
          content: T.content || "",
          baseline: T.content || "",
          loading: !1
        }
      }));
    } catch (T) {
      if (!te.current || ae.current.get(Q) !== w)
        return;
      z((H) => ({
        ...H,
        [Q]: {
          ...H[Q],
          loading: !1,
          error: T.message || "读取文件失败"
        }
      }));
    }
  }
  function Ee(Q) {
    a == null || a(!0), P(Q), ee(""), $[Q] || pe(Q);
  }
  function be() {
    a == null || a(!0), z(
      (Q) => Q[Jt] ? Q : {
        ...Q,
        [Jt]: {
          name: "",
          content: "",
          baseline: "",
          isNew: !0,
          loading: !1,
          error: ""
        }
      }
    ), P(Jt), ee("");
  }
  function oe(Q) {
    A && (z((w) => ({
      ...w,
      [A]: { ...w[A], ...Q }
    })), ee(""));
  }
  function Se() {
    if (ie.current) return;
    const Q = () => {
      ae.current.clear(), a == null || a(!1), z({}), P(null), ee("");
    };
    if (!de) return Q();
    x.confirm({
      title: "还有未保存的文档修改",
      content: "返回将放弃所有文档草稿，已保存的文件会保留。",
      okText: "放弃修改并返回",
      cancelText: "继续编辑",
      onOk: Q
    });
  }
  async function ke(Q, w) {
    if (ie.current) return;
    if (!w && Q === "AGENTS.md") {
      b.warning("AGENTS.md 是核心配置文件，不能取消挂载");
      return;
    }
    const T = I, H = w ? [.../* @__PURE__ */ new Set([...T, Q])] : T.filter((F) => F !== Q);
    ie.current = !0, _(!0), R(H);
    try {
      if (await qo(e, H), !te.current) return;
      b.success(w ? "已挂载到系统提示" : "已取消挂载"), n();
    } catch (F) {
      if (!te.current) return;
      R(T), b.error(F.message || "更新挂载失败");
    } finally {
      ie.current = !1, te.current && _(!1);
    }
  }
  async function Ie() {
    if (!A || !q || q.loading || q.error || !Qt(q) || ie.current)
      return;
    const Q = A, w = q;
    let T;
    try {
      if (T = Vo(w.name), w.isNew && O.some(
        (H) => H.filename.toLowerCase() === T.toLowerCase()
      ))
        throw new Error("同名文件已存在，请更换文件名");
      if (!w.content.trim()) throw new Error("请输入文档内容");
      if (new TextEncoder().encode(w.content).length > 1024 * 1024)
        throw new Error("文档内容不能超过 1 MB");
    } catch (H) {
      ee(H.message);
      return;
    }
    ie.current = !0, K(!0), ee("");
    try {
      if (w.isNew) {
        const H = await Uo(
          e,
          T,
          w.content,
          !0
        );
        if (!te.current) return;
        R(H.system_prompt_files);
      } else await Nt(e, T, w.content);
      if (!te.current) return;
      z((H) => {
        const F = { ...H };
        return F[T] = {
          ...H[Q],
          name: T,
          baseline: w.content,
          isNew: !1
        }, Q !== T && delete F[Q], F;
      }), P((H) => H === Q ? T : H), b.success("文档已保存"), U(), n();
    } catch (H) {
      te.current && ee(H.message || "保存失败，请重试");
    } finally {
      ie.current = !1, te.current && K(!1);
    }
  }
  const Te = (Q) => /* @__PURE__ */ s.createElement(
    p,
    {
      "aria-label": `挂载 ${Q}`,
      size: "small",
      checked: I.includes(Q),
      disabled: B || W || Q === "AGENTS.md",
      onChange: (w) => void ke(Q, w)
    }
  ), we = /* @__PURE__ */ s.createElement(c, { onClick: be, disabled: B || W }, "新建 Markdown 文档"), ye = V ? /* @__PURE__ */ s.createElement(
    y,
    {
      type: "error",
      showIcon: !0,
      message: V,
      action: /* @__PURE__ */ s.createElement(c, { onClick: () => void U() }, "重试")
    }
  ) : null;
  if (A === null)
    return /* @__PURE__ */ s.createElement("div", { className: "ugsci-expert-files" }, /* @__PURE__ */ s.createElement("style", null, za), j, /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-list-toolbar" }, /* @__PURE__ */ s.createElement("span", null, "工作区文档 (", O.length, ")", " ", /* @__PURE__ */ s.createElement("small", null, "· ", I.length, " 个已挂载")), /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement(c, { onClick: () => void U(), loading: S }, "刷新"), we)), ye, /* @__PURE__ */ s.createElement(g, { spinning: S }, /* @__PURE__ */ s.createElement(
      u,
      {
        dataSource: O,
        locale: {
          emptyText: /* @__PURE__ */ s.createElement(
            f,
            {
              description: "暂无 Markdown 文档",
              image: f.PRESENTED_IMAGE_SIMPLE
            }
          )
        },
        renderItem: (Q) => /* @__PURE__ */ s.createElement(
          u.Item,
          {
            actions: [
              /* @__PURE__ */ s.createElement(
                c,
                {
                  key: "edit",
                  type: "link",
                  "aria-label": `编辑 ${Q.filename}`,
                  onClick: () => Ee(Q.filename)
                },
                "编辑"
              )
            ]
          },
          /* @__PURE__ */ s.createElement(
            u.Item.Meta,
            {
              title: /* @__PURE__ */ s.createElement("span", null, Q.filename, " ", /* @__PURE__ */ s.createElement(v, null, ml.includes(Q.filename) ? "内置" : "工作文档")),
              description: `${lr[Q.filename] || "自定义参考文档"} · ${(Q.size / 1024).toFixed(1)} KB · 修改于 ${new Date(
                Q.modified_time
              ).toLocaleString()}`
            }
          ),
          Te(Q.filename)
        )
      }
    )));
  const he = [
    ...O.map((Q) => Q.filename),
    ...Object.keys($).filter(
      (Q) => !O.some((w) => w.filename === Q)
    )
  ];
  return /* @__PURE__ */ s.createElement(
    "div",
    {
      className: "ugsci-expert-files ugsci-file-workbench",
      role: "region",
      "aria-label": "专家文档工作台"
    },
    /* @__PURE__ */ s.createElement("style", null, za),
    j,
    /* @__PURE__ */ s.createElement("header", { className: "ugsci-file-workbench-toolbar" }, /* @__PURE__ */ s.createElement(c, { onClick: Se, disabled: B || W }, "返回专家设置"), /* @__PURE__ */ s.createElement("span", { className: "ugsci-file-workbench-title" }, "文件与提示词"), we),
    /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-workbench-body" }, /* @__PURE__ */ s.createElement("aside", { className: "ugsci-file-nav", "aria-label": "工作区文档" }, /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-nav-heading" }, /* @__PURE__ */ s.createElement("strong", null, "工作区文档"), /* @__PURE__ */ s.createElement(
      c,
      {
        size: "small",
        onClick: () => void U(),
        loading: S
      },
      "刷新"
    )), ye, /* @__PURE__ */ s.createElement("nav", null, he.map((Q) => {
      const w = $[Q], T = (w == null ? void 0 : w.name) || (Q === Jt ? "未命名文档" : Q);
      return /* @__PURE__ */ s.createElement(
        "button",
        {
          key: Q,
          type: "button",
          className: "ugsci-file-nav-item",
          disabled: B || W,
          "aria-current": A === Q ? "page" : void 0,
          onClick: () => Ee(Q)
        },
        /* @__PURE__ */ s.createElement("span", null, T, /* @__PURE__ */ s.createElement("small", null, w && Qt(w) ? "未保存" : I.includes(Q) ? "已挂载" : "未挂载")),
        /* @__PURE__ */ s.createElement("small", null, lr[Q] || (Q === Jt ? "保存后自动挂载" : "自定义参考文档"))
      );
    })), /* @__PURE__ */ s.createElement("p", null, "已挂载的文件会加入专家的系统提示。")), /* @__PURE__ */ s.createElement("main", { className: "ugsci-file-document" }, /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-document-heading" }, /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement("h3", null, q != null && q.isNew ? "新建文档" : A), /* @__PURE__ */ s.createElement("p", null, lr[A] || "自定义参考文档")), q && !q.isNew && /* @__PURE__ */ s.createElement("label", { className: "ugsci-file-mount" }, "加入系统提示 ", Te(A))), (q == null ? void 0 : q.isNew) && /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-name" }, /* @__PURE__ */ s.createElement("label", { htmlFor: "ugsci-new-document-name" }, "文件名"), /* @__PURE__ */ s.createElement(
      m,
      {
        id: "ugsci-new-document-name",
        value: q.name,
        disabled: B,
        placeholder: "例如 REFERENCE.md",
        onChange: (Q) => oe({ name: Q.target.value })
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
        value: Z,
        onChange: (Q) => G(Q)
      }
    ), /* @__PURE__ */ s.createElement("small", null, "Markdown")), D && /* @__PURE__ */ s.createElement(y, { type: "error", showIcon: !0, message: D }), q != null && q.loading ? /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-feedback" }, /* @__PURE__ */ s.createElement(g, null), /* @__PURE__ */ s.createElement("span", { role: "status" }, "正在读取文档")) : q != null && q.error ? /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-feedback" }, /* @__PURE__ */ s.createElement(
      y,
      {
        type: "error",
        showIcon: !0,
        message: q.error,
        action: /* @__PURE__ */ s.createElement(c, { onClick: () => void pe(A) }, "重新读取")
      }
    )) : q && /* @__PURE__ */ s.createElement("div", { className: `ugsci-file-editors ugsci-file-view-${Z}` }, Z !== "preview" && /* @__PURE__ */ s.createElement("div", { className: "ugsci-file-source" }, /* @__PURE__ */ s.createElement(
      m.TextArea,
      {
        "aria-label": "Markdown 源码",
        spellCheck: !1,
        value: q.content,
        onChange: (Q) => oe({ content: Q.target.value }),
        onKeyDown: (Q) => {
          (Q.ctrlKey || Q.metaKey) && Q.key.toLowerCase() === "s" && (Q.preventDefault(), Ie());
        }
      }
    )), Z !== "source" && /* @__PURE__ */ s.createElement(
      "article",
      {
        className: "ugsci-file-preview",
        "aria-label": "Markdown 预览",
        style: {
          whiteSpace: L().ReactMarkdown && L().remarkGfm ? "normal" : "pre-wrap"
        }
      },
      q.content ? kt(q.content, s) : /* @__PURE__ */ s.createElement(
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
        style: Ke,
        onClick: () => void Ie(),
        loading: B,
        disabled: !q || q.loading || !!q.error || W || !Qt(q)
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
}, ji = { marginBottom: 16 }, Bi = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, Ra = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--app-text, var(--ant-color-text))",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid var(--app-border, var(--ant-color-border-secondary))"
}, Hi = {
  fontSize: 12,
  color: "var(--app-text-secondary, var(--ant-color-text-secondary))",
  marginLeft: 8
};
function fl({
  agentId: e,
  onDirtyChange: t
}) {
  const n = L().React, { useState: r, useEffect: a, useCallback: i } = n, {
    Switch: s,
    InputNumber: l,
    Select: o,
    Button: d,
    Spin: c,
    Space: m,
    Typography: u,
    message: p
  } = L().antd, { PlayCircleOutlined: v, SaveOutlined: g } = L().antdIcons || {}, { Text: f } = u, [h, y] = r(!0), [E, b] = r(!1), [x, j] = r(!1), [O, M] = r(!1), [S, N] = r(6), [V, C] = r("h"), [I, R] = r("main"), [W, _] = r(300), [$, z] = r(!1), [A, P] = r("08:00"), [Z, G] = r("22:00"), B = Ni(
    h,
    {
      enabled: O,
      everyNumber: S,
      everyUnit: V,
      target: I,
      timeoutSeconds: W,
      useActiveHours: $,
      activeHoursStart: A,
      activeHoursEnd: Z
    },
    t
  ), K = i(async () => {
    var Y, ie;
    y(!0);
    try {
      const de = await Yo(e), q = Ko(de.every ?? "6h");
      M(de.enabled ?? !1), N(q.number), C(q.unit), R(de.target ?? "main"), _(de.timeoutSeconds ?? 300), z(!!de.activeHours), P(((Y = de.activeHours) == null ? void 0 : Y.start) ?? "08:00"), G(((ie = de.activeHours) == null ? void 0 : ie.end) ?? "22:00");
    } catch (de) {
      p.error(de.message || "加载心跳配置失败");
    } finally {
      y(!1);
    }
  }, [e]);
  a(() => {
    K();
  }, [K]);
  const D = async () => {
    b(!0);
    try {
      await el(e, {
        enabled: O,
        every: Xo({ number: S, unit: V }),
        target: I,
        timeoutSeconds: W,
        activeHours: $ && A && Z ? { start: A, end: Z } : void 0
      }), B(), p.success("心跳配置已保存");
    } catch (Y) {
      p.error(Y.message || "保存心跳配置失败");
    } finally {
      b(!1);
    }
  }, ee = async () => {
    j(!0);
    try {
      await tl(e), p.success("已触发心跳检查");
    } catch (Y) {
      p.error(Y.message || "触发心跳失败");
    } finally {
      j(!1);
    }
  };
  if (h)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(c, { size: "large" })
    );
  const te = (Y, ie, de) => n.createElement(
    "div",
    { style: ji },
    n.createElement("div", { style: Bt }, Y),
    ie,
    de ? n.createElement(
      f,
      { type: "secondary", style: Hi },
      de
    ) : null
  ), se = (Y, ie, de, q) => n.createElement(
    "div",
    { className: "ugsci-config-pair", style: Bi },
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Bt }, Y),
      ie
    ),
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Bt }, de),
      q
    )
  ), { Divider: ae } = L().antd;
  return n.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    n.createElement("div", { style: Ra }, "基本设置"),
    te(
      "启用心跳",
      n.createElement(s, {
        checked: O,
        onChange: (Y) => M(Y)
      }),
      O ? "已启用，专家将定期自检" : "已停用"
    ),
    se(
      "检查频率",
      n.createElement(
        m,
        null,
        n.createElement(l, {
          min: 1,
          value: S,
          onChange: (Y) => N(Y ?? 1),
          style: { width: "100%" }
        }),
        n.createElement(o, {
          value: V,
          onChange: (Y) => C(Y),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      n.createElement(o, {
        value: I,
        onChange: (Y) => R(Y),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    te(
      "超时时间 (秒)",
      n.createElement(l, {
        min: 1,
        max: 3600,
        value: W,
        onChange: (Y) => _(Y ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    n.createElement(ae, { style: { margin: "8px 0 16px" } }),
    n.createElement("div", { style: Ra }, "活跃时段"),
    te(
      "启用活跃时段限制",
      n.createElement(s, {
        checked: $,
        onChange: (Y) => z(Y)
      }),
      "仅在指定时段内触发心跳"
    ),
    $ ? se(
      "开始时间",
      n.createElement("input", {
        type: "time",
        value: A,
        onChange: (Y) => P(Y.target.value),
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
        value: Z,
        onChange: (Y) => G(Y.target.value),
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
          style: Ke
        },
        "保存配置"
      ),
      n.createElement(
        d,
        {
          icon: v ? n.createElement(v) : void 0,
          loading: x,
          onClick: ee
        },
        "立即执行"
      )
    )
  );
}
function yl({
  agentId: e,
  onRefresh: t
}) {
  const n = L().React, { useState: r, useEffect: a, useCallback: i } = n, {
    List: s,
    Tag: l,
    Switch: o,
    Button: d,
    Empty: c,
    Spin: m,
    Typography: u,
    message: p
  } = L().antd, { PlusOutlined: v, ReloadOutlined: g, DeleteOutlined: f } = L().antdIcons || {}, { Text: h, Paragraph: y } = u, [E, b] = r([]), [x, j] = r(!0), [O, M] = r(!1), [S, N] = r([]), [V, C] = r(!1), I = i(async () => {
    j(!0);
    try {
      const A = await Zn(e);
      b(A);
    } catch (A) {
      p.error(A.message || "加载技能失败"), b([]);
    } finally {
      j(!1);
    }
  }, [e]);
  a(() => {
    I();
  }, [I]);
  const R = async () => {
    M(!0), C(!0);
    try {
      const A = await Br(!0);
      N(A);
    } catch (A) {
      p.error(A.message || "加载技能池失败");
    } finally {
      C(!1);
    }
  }, W = async (A) => {
    let P = 0, Z = 0;
    for (const G of A)
      try {
        await $i(e, G), P++;
      } catch {
        Z++;
      }
    P > 0 ? (p.success(
      `成功添加 ${P} 个技能${Z > 0 ? `，${Z} 个失败` : ""}`
    ), I(), t()) : Z > 0 && p.error("添加技能失败"), M(!1);
  }, _ = async (A, P) => {
    try {
      P ? await zi(e, A.name) : await Li(e, A.name), p.success(P ? "已启用" : "已停用"), I(), t();
    } catch (Z) {
      p.error(Z.message || "操作失败");
    }
  }, $ = async (A) => {
    try {
      await Ri(e, A), p.success(`技能「${A}」已移除`), I(), t();
    } catch (P) {
      p.error(P.message || "移除技能失败");
    }
  };
  if (x)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(m, { size: "large" })
    );
  const z = E.filter((A) => A.enabled !== !1);
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
        `技能列表 (${E.length}，已启用 ${z.length})`
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
              Tt(), I();
            }
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: v ? n.createElement(v) : void 0,
            onClick: R,
            style: Ke
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
      renderItem: (A) => n.createElement(
        s.Item,
        {
          actions: [
            n.createElement(o, {
              key: "toggle",
              size: "small",
              checked: A.enabled !== !1,
              onChange: (P) => _(A, P)
            }),
            n.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: f ? n.createElement(f) : void 0,
                onClick: () => $(A.name)
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
            A.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              A.emoji
            ) : null,
            n.createElement(
              h,
              { strong: !0 },
              Oe(A.name)
            ),
            A.version_text ? n.createElement(
              l,
              { style: { fontSize: 10 } },
              `v${A.version_text}`
            ) : null
          ),
          A.description ? n.createElement(
            y,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            A.description
          ) : null
        )
      )
    }),
    n.createElement(pl, {
      open: O,
      onClose: () => M(!1),
      poolSkills: S,
      installedSkillNames: E.map((A) => A.name),
      loading: V,
      onInstall: W
    })
  );
}
function hl({
  agentId: e,
  onRefresh: t,
  isActive: n
}) {
  const r = L().React, { useState: a, useEffect: i, useCallback: s } = r, {
    List: l,
    Tag: o,
    Button: d,
    Empty: c,
    Spin: m,
    Modal: u,
    Input: p,
    Typography: v,
    message: g
  } = L().antd, { PlusOutlined: f, ReloadOutlined: h, DeleteOutlined: y } = L().antdIcons || {}, { Text: E, Paragraph: b } = v, { TextArea: x } = p, [j, O] = a([]), [M, S] = a(!0), [N, V] = a(!1), [C, I] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [R, W] = a(!1), _ = s(async () => {
    S(!0);
    try {
      const P = await Hr(e);
      O(P);
    } catch (P) {
      g.error(P.message || "加载 MCP 失败"), O([]);
    } finally {
      S(!1);
    }
  }, [e]);
  i(() => {
    _();
  }, [_]), i(() => {
    n && _();
  }, [n, _]);
  const $ = async (P) => {
    try {
      await Jo(e, P), g.success("已切换 MCP 状态"), _(), t();
    } catch (Z) {
      g.error(Z.message || "切换失败");
    }
  }, z = async (P) => {
    try {
      await Zo(e, P), g.success(`MCP「${P}」已移除`), _(), t();
    } catch (Z) {
      g.error(Z.message || "移除 MCP 失败");
    }
  }, A = async () => {
    W(!0);
    try {
      const P = JSON.parse(C), Z = P.mcpServers || P, G = Object.entries(Z);
      if (G.length === 0) {
        g.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [B, K] of G) {
        const D = K, ee = D.url ? "streamable_http" : "stdio";
        await Ur(e, {
          client_key: B,
          client: {
            name: D.name || B,
            description: D.description || "",
            enabled: !0,
            transport: ee,
            url: D.url || "",
            command: D.command || "",
            args: D.args || [],
            env: D.env || {},
            cwd: D.cwd || "",
            headers: D.headers || {}
          }
        });
      }
      g.success("MCP 客户端已创建"), V(!1), _(), t();
    } catch (P) {
      P instanceof SyntaxError ? g.error("JSON 格式错误：" + P.message) : g.error(P.message || "创建 MCP 失败");
    } finally {
      W(!1);
    }
  };
  return M ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(m, { size: "large" })
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
        `MCP 客户端 (${j.length})`
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
              Tt(), _();
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
            onClick: () => V(!0),
            style: Ke
          },
          "添加 MCP"
        )
      )
    ),
    j.length === 0 ? r.createElement(c, {
      description: "该专家暂无 MCP 客户端",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(l, {
      dataSource: j,
      renderItem: (P) => r.createElement(
        l.Item,
        {
          actions: [
            r.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => $(P.key)
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
                onClick: () => z(P.key)
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
            b,
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
      u,
      {
        open: N,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => V(!1),
        onOk: A,
        confirmLoading: R,
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
      r.createElement(x, {
        value: C,
        onChange: (P) => I(P.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function bl({
  agentId: e,
  onDirtyChange: t
}) {
  const n = L().React, { useState: r, useEffect: a, useCallback: i, useRef: s } = n, {
    Card: l,
    InputNumber: o,
    Input: d,
    Select: c,
    Switch: m,
    Button: u,
    Spin: p,
    Space: v,
    Typography: g,
    Divider: f,
    message: h
  } = L().antd, { SaveOutlined: y } = L().antdIcons || {}, { Text: E } = g, [b, x] = r(!0), [j, O] = r(!1), M = s(null), [S, N] = r(60), [V, C] = r(""), [I, R] = r(!0), [W, _] = r(30), [$, z] = r("zh"), [A, P] = r("UTC"), [Z, G] = r(!0), [B, K] = r(100), [D, ee] = r(!0), [te, se] = r(3), [ae, Y] = r(1), [ie, de] = r(!0), [q, U] = r(3), [pe, Ee] = r(2), [be, oe] = r(60), [Se, ke] = r(1), [Ie, Te] = r(0), [we, ye] = r(1), [he, Q] = r(0), [w, T] = r(30), [H, F] = r(50), [ue, X] = r("light"), [fe, xe] = r("scroll"), [Ae, Fe] = r("remelight"), [Ge, it] = r("AUTO"), Ye = Ni(
    b,
    {
      shellTimeout: S,
      shellExecutable: V,
      autoTitleEnabled: I,
      autoTitleTimeout: W,
      language: $,
      timezone: A,
      iterEnabled: Z,
      maxIters: B,
      doomLoopEnabled: D,
      doomWindowSize: te,
      doomSimilarity: ae,
      llmRetryEnabled: ie,
      llmMaxRetries: q,
      llmBackoffBase: pe,
      llmBackoffCap: be,
      llmMaxConcurrent: Se,
      llmMaxQpm: Ie,
      llmRateLimitPause: we,
      llmRateLimitJitter: he,
      llmAcquireTimeout: w,
      historyMaxLength: H,
      contextBackend: ue,
      contextStrategy: fe,
      memoryBackend: Ae,
      approvalLevel: Ge
    },
    t
  ), J = i(async () => {
    var me, je, He, We, lt, Ze;
    x(!0);
    try {
      const [$e, mt, ct] = await Promise.all([
        nl(e),
        al(e).catch(() => "zh"),
        sl().catch(() => "UTC")
      ]);
      M.current = $e, N($e.shell_command_timeout ?? 60), C($e.shell_command_executable ?? "");
      const De = $e.auto_title_config ?? {
        enabled: !0,
        timeout_seconds: 30
      };
      R(De.enabled ?? !0), _(De.timeout_seconds ?? 30), z(mt), P(ct);
      const Le = $e.loop ?? {};
      G(((me = Le.iteration) == null ? void 0 : me.enabled) ?? !0), K(((je = Le.iteration) == null ? void 0 : je.max_iterations) ?? $e.max_iters ?? 100), ee(((He = Le.doom_loop) == null ? void 0 : He.enabled) ?? !0), se(((We = Le.doom_loop) == null ? void 0 : We.window_size) ?? 3), Y(((lt = Le.doom_loop) == null ? void 0 : lt.similarity_threshold) ?? 1), de($e.llm_retry_enabled ?? !0), U($e.llm_max_retries ?? 3), Ee($e.llm_backoff_base ?? 2), oe($e.llm_backoff_cap ?? 60), ke($e.llm_max_concurrent ?? 1), Te($e.llm_max_qpm ?? 0), ye($e.llm_rate_limit_pause ?? 1), Q($e.llm_rate_limit_jitter ?? 0), T($e.llm_acquire_timeout ?? 30), F($e.history_max_length ?? 50), X($e.context_manager_backend ?? "light"), xe(((Ze = $e.light_context_config) == null ? void 0 : Ze.strategy) ?? "scroll"), Fe($e.memory_manager_backend ?? "remelight"), it($e.approval_level ?? "AUTO");
    } catch ($e) {
      h.error($e.message || "加载运行配置失败");
    } finally {
      x(!1);
    }
  }, [e]);
  a(() => {
    J();
  }, [J]);
  const ve = async () => {
    var je, He;
    const me = M.current;
    if (me) {
      O(!0);
      try {
        const We = {
          ...me,
          max_iters: B,
          loop: {
            ...me.loop ?? {},
            iteration: { enabled: Z, max_iterations: B },
            doom_loop: {
              enabled: D,
              window_size: te,
              similarity_threshold: ae,
              stages: ((He = (je = me.loop) == null ? void 0 : je.doom_loop) == null ? void 0 : He.stages) ?? []
            }
          },
          shell_command_timeout: S,
          shell_command_executable: V,
          auto_title_config: {
            enabled: I,
            timeout_seconds: W
          },
          llm_retry_enabled: ie,
          llm_max_retries: q,
          llm_backoff_base: pe,
          llm_backoff_cap: be,
          llm_max_concurrent: Se,
          llm_max_qpm: Ie,
          llm_rate_limit_pause: we,
          llm_rate_limit_jitter: he,
          llm_acquire_timeout: w,
          history_max_length: H,
          context_manager_backend: ue,
          light_context_config: {
            ...me.light_context_config ?? {},
            strategy: fe
          },
          memory_manager_backend: Ae,
          approval_level: Ge
        };
        await rl(e, We), M.current = We, $ && await il(e, $), A && await ol(A), Ye(), h.success("运行配置已保存");
      } catch (We) {
        h.error(We.message || "保存运行配置失败");
      } finally {
        O(!1);
      }
    }
  };
  if (b)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(p, { size: "large" })
    );
  const Re = (me, je, He) => n.createElement(
    "div",
    { style: ji },
    n.createElement("div", { style: Bt }, me),
    je,
    He ? n.createElement(
      E,
      { type: "secondary", style: Hi },
      He
    ) : null
  ), Ve = (me, je, He, We) => n.createElement(
    "div",
    { className: "ugsci-config-pair", style: Bi },
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Bt }, me),
      je
    ),
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Bt }, He),
      We
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
          value: S,
          onChange: (me) => N(me ?? 60),
          style: { width: "100%" }
        }),
        "Shell 可执行文件",
        n.createElement(d, {
          value: V,
          onChange: (me) => C(me.target.value),
          placeholder: "留空使用系统默认",
          style: { width: "100%" }
        })
      ),
      Ve(
        "语言",
        n.createElement(c, {
          value: $,
          onChange: (me) => z(me),
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
          value: A,
          onChange: (me) => P(me),
          style: { width: "100%" },
          showSearch: !0,
          filterOption: (me, je) => {
            var He;
            return (((He = je == null ? void 0 : je.label) == null ? void 0 : He.toString()) || "").toLowerCase().includes(me.toLowerCase());
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
          v,
          null,
          n.createElement(m, {
            checked: I,
            onChange: (me) => R(me)
          })
        ),
        "标题生成超时 (秒)",
        n.createElement(o, {
          min: 5,
          value: W,
          onChange: (me) => _(me ?? 30),
          style: { width: "100%" },
          disabled: !I
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
          value: Ge,
          onChange: (me) => it(me),
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
        n.createElement(m, {
          checked: Z,
          onChange: (me) => G(me)
        }),
        "停止 Agent 前的最大循环轮次"
      ),
      Z ? Re(
        "最大迭代次数",
        n.createElement(o, {
          min: 1,
          max: 500,
          value: B,
          onChange: (me) => K(me ?? 100),
          style: { width: "100%" }
        })
      ) : null,
      Re(
        "启用重复循环保护",
        n.createElement(m, {
          checked: D,
          onChange: (me) => ee(me)
        }),
        "检测并阻止重复操作循环"
      ),
      D ? Ve(
        "检测窗口大小",
        n.createElement(o, {
          min: 2,
          max: 20,
          value: te,
          onChange: (me) => se(me ?? 3),
          style: { width: "100%" }
        }),
        "相似度阈值",
        n.createElement(o, {
          min: 0,
          max: 1,
          step: 0.05,
          value: ae,
          onChange: (me) => Y(me ?? 1),
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
        n.createElement(m, {
          checked: ie,
          onChange: (me) => de(me)
        })
      ),
      Ve(
        "最大重试次数",
        n.createElement(o, {
          min: 1,
          value: q,
          onChange: (me) => U(me ?? 3),
          style: { width: "100%" },
          disabled: !ie
        }),
        "退避基数 (秒)",
        n.createElement(o, {
          min: 0.1,
          step: 0.1,
          value: pe,
          onChange: (me) => Ee(me ?? 2),
          style: { width: "100%" },
          disabled: !ie
        })
      ),
      Re(
        "退避上限 (秒)",
        n.createElement(o, {
          min: 0.5,
          step: 0.5,
          value: be,
          onChange: (me) => oe(me ?? 60),
          style: { width: 200 },
          disabled: !ie
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
          onChange: (me) => ke(me ?? 1),
          style: { width: "100%" }
        }),
        "最大 QPM (0=不限)",
        n.createElement(o, {
          min: 0,
          step: 10,
          value: Ie,
          onChange: (me) => Te(me ?? 0),
          style: { width: "100%" }
        })
      ),
      Ve(
        "限流暂停时间 (秒)",
        n.createElement(o, {
          min: 1,
          step: 0.5,
          value: we,
          onChange: (me) => ye(me ?? 1),
          style: { width: "100%" }
        }),
        "限流抖动 (秒)",
        n.createElement(o, {
          min: 0,
          step: 0.5,
          value: he,
          onChange: (me) => Q(me ?? 0),
          style: { width: "100%" }
        })
      ),
      Re(
        "获取超时 (秒)",
        n.createElement(o, {
          min: 10,
          step: 10,
          value: w,
          onChange: (me) => T(me ?? 30),
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
          value: ue,
          onChange: (me) => X(me),
          style: { width: "100%" },
          options: [{ value: "light", label: "light" }]
        }),
        "上下文策略",
        n.createElement(c, {
          value: fe,
          onChange: (me) => xe(me),
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
          onChange: (me) => Fe(me),
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
          value: H,
          onChange: (me) => F(me ?? 50),
          style: { width: "100%" }
        })
      )
    ),
    // ── Save button ──
    n.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      n.createElement(
        u,
        {
          type: "primary",
          icon: y ? n.createElement(y) : void 0,
          loading: j,
          onClick: ve,
          style: Ke
        },
        "保存运行配置"
      )
    )
  );
}
function vl({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = L().React, { useState: i, useEffect: s, useMemo: l, useRef: o } = a, { Modal: d, Tabs: c, Button: m } = L().antd, [u, p] = d.useModal(), [v, g] = i("basic"), [f, h] = i(!1), [y, E] = i(!1), [b, x] = i([]), [j, O] = i(
    () => window.matchMedia("(max-width: 680px)").matches
  ), M = o({}), S = l(
    () => Object.fromEntries(
      ["basic", "files", "heartbeat", "running"].map((z) => [
        z,
        (A) => {
          M.current[z] = A;
        }
      ])
    ),
    []
  ), N = e == null ? void 0 : e.agent.id, V = o(0), C = async () => {
    var A;
    if (!N) return;
    const z = ++V.current;
    try {
      const P = await ll(N);
      z === V.current && x(P);
    } catch {
      z === V.current && x(((A = e == null ? void 0 : e.config) == null ? void 0 : A.system_prompt_files) || []);
    }
  };
  if (s(() => {
    const z = window.matchMedia("(max-width: 680px)"), A = () => O(z.matches);
    return z.addEventListener("change", A), () => z.removeEventListener("change", A);
  }, []), s(() => (M.current = {}, g("basic"), h(!1), E(!1), x([]), t && C(), () => {
    V.current++;
  }), [N, t]), s(() => {
    const z = (A) => {
      t && Object.values(M.current).some(Boolean) && (A.preventDefault(), A.returnValue = "");
    };
    return window.addEventListener("beforeunload", z), () => window.removeEventListener("beforeunload", z);
  }, [t]), !e) return null;
  const I = e.agent, R = Ct(e), W = () => {
    y || (Object.values(M.current).some(Boolean) ? u.confirm({
      title: "还有未保存的修改",
      content: "关闭后将放弃未保存的内容。已保存的配置不受影响。",
      okText: "放弃修改",
      cancelText: "继续编辑",
      onOk: () => {
        M.current = {}, n();
      }
    }) : n());
  }, _ = (z, A, P) => a.createElement(
    "div",
    null,
    a.createElement("h3", null, z),
    a.createElement("p", { className: "ugsci-settings-intro" }, A),
    P
  ), $ = [
    {
      key: "basic",
      label: "基本信息",
      children: a.createElement(ul, {
        key: I.id,
        expert: e,
        onRefresh: r,
        onDirtyChange: S.basic
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((z) => z.enabled !== !1).length})`,
      children: _(
        "技能",
        "管理专家可用的技能，启用、停用与安装操作即时生效。",
        a.createElement(yl, { agentId: I.id, onRefresh: r })
      )
    },
    {
      key: "files",
      label: "文件与提示词",
      children: a.createElement(
        "div",
        { className: "ugsci-settings-files" },
        _(
          "文件与提示词",
          "编辑专家的工作区文档，管理加入系统提示的文件。",
          a.createElement(gl, {
            agentId: I.id,
            systemPromptFiles: b,
            onRefresh: () => {
              C(), r();
            },
            onDirtyChange: S.files,
            onEditorOpenChange: h,
            onSavingChange: E
          })
        )
      )
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: _(
        "MCP 服务",
        "配置、连接和工具权限沿用当前专家的独立设置。",
        a.createElement(hl, {
          agentId: I.id,
          onRefresh: r,
          isActive: v === "mcp"
        })
      )
    },
    {
      key: "heartbeat",
      label: "自动检查",
      children: _(
        "自动检查",
        "按固定间隔唤醒专家执行心跳任务。",
        a.createElement(fl, {
          agentId: I.id,
          onDirtyChange: S.heartbeat
        })
      )
    },
    {
      key: "running",
      label: "高级运行",
      children: _(
        "高级运行",
        "按需展开参数组，修改后保存运行配置。",
        a.createElement(bl, {
          agentId: I.id,
          onDirtyChange: S.running
        })
      )
    }
  ];
  return a.createElement(
    a.Fragment,
    null,
    p,
    a.createElement("style", null, Mi),
    a.createElement(
      d,
      {
        open: t,
        title: "专家设置",
        className: `ugsci-expert-settings${f ? " ugsci-files-expanded" : ""}`,
        onCancel: W,
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
            m,
            { onClick: W, "aria-label": "关闭设置" },
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
        { key: I.id },
        a.createElement(
          "div",
          { className: "ugsci-expert-settings-identity" },
          a.createElement(at, {
            name: R.name,
            recipe: _t(e),
            size: 36
          }),
          a.createElement(
            "div",
            null,
            a.createElement("strong", null, R.name),
            a.createElement(
              "small",
              null,
              `${I.id} · ${R.category}`
            )
          )
        ),
        a.createElement(c, {
          className: "ugsci-settings-tabs",
          items: $,
          activeKey: v,
          onChange: g,
          tabPosition: j ? "top" : "left",
          destroyOnHidden: !1,
          size: "small"
        })
      ) : null
    )
  );
}
async function La(e) {
  var n;
  const t = L();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (r) {
      console.warn("[ugsci] Failed to refresh newly created agent:", r);
      return;
    }
  (n = t.setSelectedAgent) == null || n.call(t, e);
}
function El({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r,
  onEditAvatar: a
}) {
  const i = L().React, { Card: s, Badge: l, Button: o } = L().antd, { SettingOutlined: d } = L().antdIcons || {}, { agent: c } = e, m = Ct(e);
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
          "aria-label": `修改 ${m.name} 的头像`,
          title: "修改专家头像",
          onClick: a
        },
        i.createElement(at, {
          name: m.name,
          recipe: _t(e),
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
          m.name
        ),
        i.createElement(
          "div",
          { className: "ugsci-expert-specialty" },
          m.specialty
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
      { className: "ugsci-expert-summary", title: m.summary },
      m.summary
    ),
    i.createElement(
      "div",
      { className: "ugsci-expert-tags" },
      m.tags.length ? m.tags.map(
        (u) => i.createElement(
          "span",
          { key: u, className: "ugsci-expert-tag" },
          u
        )
      ) : `${e.skills.filter((u) => u.enabled !== !1).length} 项技能 · ${e.mcps.length} 个 MCP`
    ),
    i.createElement(
      "div",
      { className: "ugsci-expert-actions" },
      i.createElement(
        o,
        {
          type: "text",
          size: "small",
          "aria-label": `设置 ${m.name}`,
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
function wl({
  expert: e,
  open: t,
  onClose: n,
  onSummon: r
}) {
  var y, E;
  const a = L().React, { Drawer: i, Badge: s, Button: l, Empty: o } = L().antd;
  if (!e) return null;
  const { agent: d, config: c, skills: m, mcps: u } = e, p = Ct(e), v = ((y = c == null ? void 0 : c.description) == null ? void 0 : y.trim()) || ((E = d.description) == null ? void 0 : E.trim()) || p.summary, g = m.filter((b) => b.enabled !== !1), f = u.filter((b) => b.enabled !== !1), h = (b, x) => a.createElement(
    "section",
    { className: "ugsci-expert-introduction-section" },
    a.createElement("h3", null, b),
    x
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
      a.createElement(at, {
        name: p.name,
        recipe: _t(e),
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
    h("专家简介", kt(p.summary, a)),
    v !== p.summary && h("职责与工作方式", kt(v, a)),
    h(
      `已启用技能 · ${g.length}`,
      g.length ? a.createElement(
        "ul",
        null,
        ...g.map(
          (b) => a.createElement(
            "li",
            { key: b.name },
            a.createElement(
              "details",
              null,
              a.createElement(
                "summary",
                null,
                Oe(b.name)
              ),
              kt(b.description || "暂无技能说明", a)
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
          (b) => a.createElement(
            "li",
            { key: b.key },
            a.createElement("h4", null, b.name || b.key),
            b.description && kt(b.description, a)
          )
        )
      )
    )
  );
}
function xl({
  open: e,
  onClose: t,
  onCreated: n
}) {
  const r = L().React, { useState: a } = r, {
    Modal: i,
    Card: s,
    Tag: l,
    Input: o,
    Row: d,
    Col: c,
    Spin: m,
    message: u,
    Typography: p
  } = L().antd, { Text: v } = p, { FileAddOutlined: g } = L().antdIcons || {}, [f, h] = a(!1), [y, E] = a(""), [b, x] = a(!1), j = async (S) => {
    h(!0);
    try {
      const N = await ge("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: S.id || void 0,
          name: S.name,
          description: S.description,
          skill_names: S.skillNames
        })
      }), V = S.systemPrompt.trim() || `# ${S.name}

你是${S.name}。${S.description ? `

职责：${S.description}` : ""}
`, I = (await Promise.allSettled([
        Aa(N.id, S.name, S.description),
        Nt(N.id, "AGENTS.md", V),
        ...S.mcpClients.map(
          ({ clientKey: R, client: W }) => Ur(N.id, {
            client_key: R,
            client: W
          })
        )
      ])).filter(
        (R) => R.status === "rejected"
      ).length;
      I > 0 ? u.warning(
        `专家「${S.name}」已创建，${I} 项初始配置失败，可在专家配置中重试`
      ) : u.success(`专家「${S.name}」创建成功`), await La(N.id), x(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (N) {
      u.error(N.message || "创建专家失败");
    } finally {
      h(!1);
    }
  }, O = Po.filter((S) => {
    if (!y.trim()) return !0;
    const N = y.toLowerCase();
    return S.name.toLowerCase().includes(N) || S.description.toLowerCase().includes(N) || S.category.toLowerCase().includes(N);
  }), M = async (S) => {
    h(!0);
    try {
      const N = await ge("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: S.name,
          description: S.description,
          skill_names: S.recommended_skills
        })
      });
      await Nt(
        N.id,
        "AGENTS.md",
        S.system_prompt
      ), S.profile_prompt && (await Nt(
        N.id,
        "PROFILE.md",
        S.profile_prompt
      ), await Nt(
        N.id,
        "BOOTSTRAP.md",
        `# 初始化已完成

此专家已按 UGSci 模板设置身份、风格与领域技能。直接执行 AGENTS.md 的领域工作流程，无需再次询问称呼、风格或初始化设置。
`
      ));
      const V = await jr(N.id);
      V.approval_level = S.approval_level, await ge(`/agents/${encodeURIComponent(N.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(V)
      });
      const C = await Aa(
        N.id,
        S.name,
        S.description
      ).then(() => !0).catch(() => !1);
      await La(N.id), C ? u.success(`专家「${S.name}」创建成功`) : u.warning(
        `专家「${S.name}」已创建，头像配置保存失败，可在专家卡片中重试`
      ), t(), n();
    } catch (N) {
      u.error(N.message || "创建专家失败");
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
          onChange: (S) => E(S.target.value),
          allowClear: !0
        })
      ),
      f ? r.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        r.createElement(m, { size: "large" }),
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
              onClick: () => x(!0),
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
                  v,
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
        ...O.map(
          (S) => r.createElement(
            c,
            { key: S.id, xs: 24, sm: 12 },
            r.createElement(
              s,
              {
                hoverable: !0,
                size: "small",
                onClick: () => M(S),
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
                r.createElement(at, {
                  name: S.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    v,
                    { strong: !0, style: { fontSize: 15 } },
                    S.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      l,
                      { color: "blue", style: { fontSize: 10 } },
                      S.category
                    ),
                    S.approval_level === "MANUAL" ? r.createElement(
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
                kt(S.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(kl, {
      open: b,
      onCancel: () => x(!1),
      onCreate: j
    })
  );
}
function Kt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Sl(e) {
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
function kl({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = L().React, { useState: a, useEffect: i, useMemo: s } = r, {
    Modal: l,
    Input: o,
    Select: d,
    Button: c,
    Row: m,
    Col: u,
    Spin: p,
    Tag: v,
    Typography: g,
    message: f
  } = L().antd, { CheckCircleOutlined: h } = L().antdIcons || {}, { Text: y } = g, [E, b] = a(""), [x, j] = a(""), [O, M] = a(""), [S, N] = a(""), [V, C] = a([]), [I, R] = a([]), [W, _] = a(!1), [$, z] = a(""), [A, P] = a(!1);
  i(() => {
    e && (b(""), j(""), M(""), N(""), R([]), z(""), P(!1), _(!0), Br(!0).then(C).catch((te) => {
      C([]), f.error(te.message || "加载技能池失败");
    }).finally(() => _(!1)));
  }, [e]);
  const Z = x.trim(), G = s(() => Z ? Z.length < 2 || Z.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(Z) ? Z === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [Z]), B = s(() => {
    try {
      return { clients: Sl($), error: "" };
    } catch (te) {
      return {
        clients: [],
        error: te.message || "MCP 配置无效"
      };
    }
  }, [$]), K = () => {
    const te = E.trim();
    if (!te) {
      f.warning("请输入专家名称");
      return;
    }
    if (G) {
      f.warning(G);
      return;
    }
    if (B.error) {
      f.warning(B.error);
      return;
    }
    P(!0), Promise.resolve(
      n({
        id: Z,
        name: te,
        description: O.trim(),
        systemPrompt: S,
        skillNames: I,
        mcpClients: B.clients
      })
    ).finally(() => P(!1));
  }, D = () => {
    R(
      V.filter((te) => te.source === "builtin").map((te) => te.name)
    );
  }, ee = (te, se) => r.createElement(
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
      te
    ),
    se ? r.createElement(
      y,
      { type: "secondary", style: { fontSize: 12 } },
      se
    ) : null
  );
  return r.createElement(
    l,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: K,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: A },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    r.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      ee("基本信息", "ID 留空时自动生成"),
      r.createElement(
        m,
        { gutter: [16, 12] },
        r.createElement(
          u,
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
            onChange: (te) => b(te.target.value),
            maxLength: 50
          })
        ),
        r.createElement(
          u,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          r.createElement(o, {
            placeholder: "例如：contract-reviewer",
            value: x,
            onChange: (te) => j(te.target.value),
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
          u,
          { span: 24 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          r.createElement(o.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: O,
            onChange: (te) => M(te.target.value),
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
      ee("角色指令", "保存为 AGENTS.md"),
      r.createElement(o.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: S,
        onChange: (te) => N(te.target.value),
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
      ee("初始能力"),
      r.createElement(
        m,
        { gutter: [20, 16], align: "top" },
        r.createElement(
          u,
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
                  disabled: W
                },
                "内置"
              ),
              r.createElement(
                c,
                {
                  size: "small",
                  onClick: () => R([]),
                  disabled: I.length === 0
                },
                "清空"
              )
            )
          ),
          W ? r.createElement(
            "div",
            { style: { textAlign: "center", padding: 32 } },
            r.createElement(p, { size: "small" })
          ) : r.createElement(d, {
            mode: "multiple",
            value: I,
            onChange: R,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: V.map((te) => ({
              value: te.name,
              label: Oe(te.name)
            })),
            notFoundContent: "暂无可用技能"
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            I.length > 0 ? r.createElement(
              v,
              { color: "blue" },
              `已选择 ${I.length} 个技能`
            ) : r.createElement(
              y,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加技能"
            )
          )
        ),
        r.createElement(
          u,
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
            value: $,
            onChange: (te) => z(te.target.value),
            rows: 8,
            status: B.error ? "error" : void 0,
            style: {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12
            }
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            B.error ? r.createElement(
              y,
              { type: "danger", style: { fontSize: 12 } },
              B.error
            ) : B.clients.length > 0 ? r.createElement(
              v,
              {
                color: "green",
                icon: h ? r.createElement(h) : void 0
              },
              `已识别 ${B.clients.length} 个 MCP`
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
const Ui = "ugsci_custom_teams";
function _l(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function Cl() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Ui) || "[]"
    );
    return Array.isArray(e) ? e.filter(_l) : [];
  } catch {
    return [];
  }
}
function Tl(e) {
  try {
    localStorage.setItem(Ui, JSON.stringify(e));
  } catch {
  }
}
function Ml(e) {
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
function Il(e) {
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
  const t = await ut("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const r = (await t.json()).map(Il);
  return e && Tl(r), r;
}
async function Di(e) {
  const t = await ut("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Ml(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function Al(e) {
  const t = await ut(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
}
async function $l() {
  const e = Cl();
  if (e.length === 0) return;
  const t = await br(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => Di(r))
  );
}
async function zl(e) {
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
          const m = c.slice(6);
          let u;
          try {
            u = JSON.parse(m);
          } catch {
            continue;
          }
          if (u.error) {
            const p = u.error, v = typeof p == "string" ? p : (p == null ? void 0 : p.message) || "工作流启动失败";
            throw new Error(v);
          }
          if (u.object === "response" || u.type === "response") {
            const p = u.status;
            if (p === "failed" || p === "error") {
              const v = ((i = u.error) == null ? void 0 : i.message) || "工作流启动失败";
              throw new Error(v);
            }
            return;
          }
          if (u.object === "content" || u.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function Rl(e, t, n) {
  const r = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, a = await ut("/chats", {
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
  const s = (await a.json()).id, l = await ut("/console/chat", {
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
  return await zl(l), s;
}
function Vi(e, t) {
  var a;
  const n = t.replace(/\s+/g, ""), r = e.find(
    (i) => i.name === t || i.name.replace(/\s+/g, "") === n
  );
  return r ? r.id : ((a = e.find(
    (i) => i.name.includes(t) || t.includes(i.name) || i.name.replace(/\s+/g, "").includes(n)
  )) == null ? void 0 : a.id) || null;
}
function qi() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function Fi(e, t) {
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
  const r = await ut(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: n
  });
  if (!r.ok)
    throw new Error(
      await Fi(r, `HTTP ${r.status}`)
    );
  return await r.json();
}
function Ll(e, t) {
  return Dr("/ugsci/team/state", e, t);
}
async function Pl(e, t) {
  const n = await ut("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!n.ok)
    throw new Error(
      await Fi(
        n,
        `Failed to load team runs: ${n.status}`
      )
    );
  return await n.json();
}
const Ol = 5e3;
function Pa({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = qi(), r = n.React, { useCallback: a, useEffect: i, useRef: s, useState: l } = r, { Alert: o, Button: d, Card: c, Empty: m, Spin: u, Tag: p, Typography: v } = n.antd, { Text: g, Paragraph: f } = v, h = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, y = (h == null ? void 0 : h.id) || "default", [E, b] = l([]), [x, j] = l(!0), [O, M] = l(null), [S, N] = l(!1), V = s(null), C = s(0), I = s(!1), R = s(y), W = a(
    async (z = !0, A = !0) => {
      var G;
      if (!t || !A && I.current) return;
      (G = V.current) == null || G.abort();
      const P = new AbortController();
      V.current = P;
      const Z = ++C.current;
      I.current = !0, z && j(!0);
      try {
        const B = await Pl(y, P.signal);
        if (P.signal.aborted || Z !== C.current)
          return;
        b(B), N(!0), M(null);
      } catch (B) {
        if (P.signal.aborted || Z !== C.current)
          return;
        M(
          B instanceof Error ? B.message : "讨论运行记录加载失败"
        );
      } finally {
        !P.signal.aborted && Z === C.current && (V.current = null, I.current = !1, j(!1));
      }
    },
    [y, t]
  );
  if (i(() => {
    var A;
    if (!t) {
      (A = V.current) == null || A.abort(), V.current = null, I.current = !1, C.current += 1;
      return;
    }
    R.current !== y && (R.current = y, b([]), M(null), N(!1)), W(!0, !0);
    const z = e ? window.setInterval(() => {
      W(!1, !1);
    }, Ol) : null;
    return () => {
      var P;
      z !== null && window.clearInterval(z), (P = V.current) == null || P.abort(), V.current = null, I.current = !1, C.current += 1;
    };
  }, [e, y, t, W]), x && !S) return r.createElement(u);
  if (O && !S)
    return r.createElement(o, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: O,
      action: r.createElement(
        d,
        { size: "small", onClick: () => void W(!0, !0), loading: x },
        "重试"
      )
    });
  const _ = E.filter(
    (z) => e ? z.status === "active" : z.status !== "active"
  ), $ = (z) => O ? r.createElement(
    r.Fragment,
    null,
    r.createElement(o, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: O,
      action: r.createElement(
        d,
        {
          size: "small",
          onClick: () => void W(!0, !0),
          loading: x
        },
        "重试"
      )
    }),
    z
  ) : z;
  return _.length === 0 ? $(
    r.createElement(
      m,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        d,
        { size: "small", onClick: () => void W(!0, !0), loading: x },
        "刷新"
      )
    )
  ) : $(
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
          { size: "small", onClick: () => void W(!0, !0), loading: x },
          "刷新"
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ..._.map(
          (z) => r.createElement(
            c,
            { key: z.instance_id, size: "small" },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                g,
                { strong: !0 },
                z.team_name || z.team_id
              ),
              r.createElement(
                p,
                {
                  color: z.status === "completed" ? "green" : z.status === "terminated" ? "orange" : "blue"
                },
                z.status
              ),
              r.createElement(p, null, z.current_phase),
              r.createElement(
                g,
                { type: "secondary" },
                `迭代 ${z.iteration}`
              )
            ),
            r.createElement(
              f,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              z.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function Nl() {
  try {
    return (await Dr(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function jl() {
  try {
    return (await Dr(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const Bl = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Oa = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Na = 5e3, Hl = 3e4;
function Ul({ enabled: e = !0 }) {
  const t = qi(), n = t.React, { useState: r, useEffect: a, useCallback: i, useRef: s } = n, { Card: l, Tag: o, Typography: d, Button: c, Steps: m, Empty: u, Alert: p, Spin: v } = t.antd, { ReloadOutlined: g } = t.antdIcons || {}, { Text: f, Paragraph: h } = d, y = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, E = (y == null ? void 0 : y.id) || "default", [b, x] = r(null), [j, O] = r(!1), [M, S] = r(null), N = s(null), V = s(0), C = s(0), I = s(0), R = s(null), W = s(!1), _ = i(
    async (se, ae = !0) => {
      var de;
      if (!e || !ae && W.current) return;
      (de = R.current) == null || de.abort();
      const Y = new AbortController();
      R.current = Y;
      const ie = ++I.current;
      W.current = !0, se && O(!0);
      try {
        const q = await Ll(E, Y.signal);
        if (Y.signal.aborted || ie !== I.current)
          return;
        V.current = 0, C.current = 0, N.current = q, x(q), S(null);
      } catch (q) {
        if (Y.signal.aborted || ie !== I.current)
          return;
        V.current += 1;
        const U = Math.min(
          Hl,
          Na * 2 ** (V.current - 1)
        );
        C.current = Date.now() + U, S(
          q instanceof Error ? q.message : "专家团状态加载失败"
        );
      } finally {
        !Y.signal.aborted && ie === I.current && (R.current = null, W.current = !1, O(!1));
      }
    },
    [E, e]
  ), $ = i(() => (V.current = 0, C.current = 0, _(!0)), [_]);
  if (a(() => {
    var ae;
    if ((ae = R.current) == null || ae.abort(), R.current = null, W.current = !1, I.current += 1, V.current = 0, C.current = 0, N.current = null, x(null), S(null), !e) return;
    $();
    const se = window.setInterval(() => {
      var Y, ie;
      Date.now() < C.current || ((Y = N.current) == null ? void 0 : Y.status) === "completed" || ((ie = N.current) == null ? void 0 : ie.status) === "terminated" || _(!1, !1);
    }, Na);
    return () => {
      var Y;
      window.clearInterval(se), (Y = R.current) == null || Y.abort(), R.current = null, W.current = !1, I.current += 1;
    };
  }, [E, e, _, $]), j && !b && !M)
    return n.createElement(v);
  if (M && !b)
    return n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: M,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: $, loading: j },
        "重试"
      )
    });
  const z = (se) => M ? n.createElement(
    n.Fragment,
    null,
    n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: M,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: $, loading: j },
        "重试"
      )
    }),
    se
  ) : se;
  if ((b == null ? void 0 : b.status) === "unreadable")
    return z(
      n.createElement(p, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${b.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          c,
          { size: "small", onClick: $, loading: j },
          "重试"
        )
      })
    );
  if (!b || !b.active) {
    if ((b == null ? void 0 : b.status) === "completed" || (b == null ? void 0 : b.status) === "terminated") {
      const se = b.status === "completed";
      return z(
        n.createElement(p, {
          type: se ? "success" : "info",
          showIcon: !0,
          message: se ? "专家团工作流已完成" : "专家团工作流已终止",
          description: se ? `实例 ${b.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${b.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return z(
      n.createElement(u, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const A = b.state, P = A.current_phase || "plan", Z = Oa.indexOf(P), G = A.team_name || "未知团队", B = A.team_mode || "pipeline", K = A.iteration || 0, D = A.members || [], ee = A.verify_retries || 0, te = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return z(
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
            te[B] || B
          ),
          n.createElement(
            o,
            { style: { fontSize: 10 } },
            `迭代 ${K}`
          ),
          ee > 0 ? n.createElement(
            o,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${ee}`
          ) : null
        ),
        extra: n.createElement(
          c,
          {
            size: "small",
            type: "text",
            icon: g ? n.createElement(g) : void 0,
            onClick: $,
            loading: j
          },
          "刷新"
        )
      },
      n.createElement(m, {
        current: Z,
        size: "small",
        items: Oa.map((se) => {
          const ae = Bl[se];
          return {
            title: `${ae.icon} ${ae.label}`,
            description: se === "plan" ? "分析任务，创建任务分解" : se === "dispatch" ? "分派专家执行任务" : se === "verify" ? "交叉验证专家结果" : se === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
          (se, ae) => n.createElement(
            o,
            { key: `${se.name}-${ae}`, style: { fontSize: 11 } },
            `${se.emoji || ""} ${se.name}（${se.role}）`
          )
        )
      ),
      A.task ? n.createElement(
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
        `任务: ${A.task}`
      ) : null
    )
  );
}
function Dl({ team: e }) {
  const t = L().React, { Typography: n, Tag: r } = L().antd, { Text: a } = n, i = {
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
      ...l.length > 0 ? l.map((c, m) => [
        m > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${m}`,
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
            key: `step-${m}`,
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
          t.createElement(at, {
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
      ]).flat() : e.members.map((c, m) => [
        m > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${m}`,
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
            key: `member-${m}`,
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
          t.createElement(at, {
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
const Vl = [
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
function ql({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: a
}) {
  const i = L().React, { useState: s, useEffect: l, useCallback: o } = i, {
    Modal: d,
    Input: c,
    Button: m,
    Select: u,
    Tag: p,
    Typography: v,
    Switch: g,
    Empty: f,
    message: h,
    Divider: y,
    Steps: E
  } = L().antd, { PlusOutlined: b, DeleteOutlined: x, SaveOutlined: j, ArrowRightOutlined: O } = L().antdIcons || {}, { Text: M, Paragraph: S } = v, [N, V] = s(""), [C, I] = s("🤝"), [R, W] = s(""), [_, $] = s("pipeline"), [z, A] = s(""), [P, Z] = s(""), [G, B] = s([]), [K, D] = s([]), [ee, te] = s(!1), [se, ae] = s(2), [Y, ie] = s(""), [de, q] = s(""), [U, pe] = s({}), [Ee, be] = s(
    {}
  ), [oe, Se] = s(
    Vl
  ), ke = [
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
    e && (r ? (V(r.name), I(r.emoji), W(r.description), $(r.mode), A(r.coordinatorName || ""), Z(r.taskTemplate), B(r.steps || []), D(r.members.map((w) => w.name)), ae(r.maxReviewRounds || 2), ie(r.successCriteria || ""), q(r.routingInstruction || ""), pe(
      Object.fromEntries(
        r.members.map((w) => [
          w.name,
          w.bindingMode || (w.agentId ? "fixed" : "preferred")
        ])
      )
    ), be(
      Object.fromEntries(
        r.members.map((w) => [
          w.name,
          w.roleKey || Sn(w.name)
        ])
      )
    )) : (V(""), I("🤝"), W(""), $("pipeline"), A(""), Z(`请执行以下任务：
任务描述：{任务描述}`), B([]), D([]), ae(2), ie(""), q(""), pe({}), be({})));
  }, [e, r]), l(() => {
    e && jl().then((w) => {
      w != null && w.length && Se(w);
    });
  }, [e]);
  const Ie = o(() => {
    if (_ === "roundtable" || _ === "debate" || _ === "router") {
      const w = K.map((T) => ({
        agentName: T,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      B(w);
    } else if (_ === "pipeline") {
      const w = new Map(G.map((H) => [H.agentName, H])), T = K.map((H) => w.get(H) || {
        agentName: H,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      B(T);
    }
  }, [_, K, G]), Te = (w) => {
    K.includes(w) || (D([...K, w]), pe({ ...U, [w]: "fixed" }), be({
      ...Ee,
      [w]: Sn(w)
    }), (_ === "coordinator" || _ === "debate") && !z && A(w));
  }, we = (w) => {
    const T = K.filter((ue) => ue !== w);
    D(T), B(G.filter((ue) => ue.agentName !== w));
    const H = { ...U };
    delete H[w], pe(H);
    const F = { ...Ee };
    delete F[w], be(F), z === w && A(T[0] || "");
  }, ye = (w, T, H) => {
    const F = [...G];
    F[w] = { ...F[w], [T]: H }, B(F);
  }, he = async () => {
    if (!N.trim()) {
      h.warning("请输入团队名称");
      return;
    }
    if (K.length < 2) {
      h.warning("至少需要选择 2 个成员");
      return;
    }
    if (!P.trim()) {
      h.warning("请输入任务模板");
      return;
    }
    if ((_ === "coordinator" || _ === "debate") && !z) {
      h.warning(_ === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    te(!0);
    try {
      let w = [...K];
      _ === "coordinator" && z ? w = [
        z,
        ...w.filter((ue) => ue !== z)
      ] : _ === "debate" && z && (w = [
        ...w.filter((ue) => ue !== z),
        z
      ]);
      const T = w.map((ue) => {
        var Fe;
        const X = n.find((Ge) => Ge.name === ue), fe = U[ue] || "fixed", xe = Ee[ue] || Sn(ue), Ae = oe.find((Ge) => Ge.key === xe);
        return {
          name: ue,
          role: (Ae == null ? void 0 : Ae.display_name) || ((Fe = X == null ? void 0 : X.description) == null ? void 0 : Fe.slice(0, 30)) || "需求分析师",
          emoji: "",
          agentId: fe === "temporary" || X == null ? void 0 : X.id,
          roleKey: xe,
          bindingMode: fe
        };
      });
      let H = G;
      (G.length === 0 || G.length !== K.length) && (H = K.map((ue) => ({
        agentName: ue,
        instruction: "请完成你的专业部分",
        passContext: _ === "pipeline"
      })));
      const F = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: N.trim(),
        emoji: C,
        category: "自定义",
        description: R.trim() || `${N.trim()}（${K.length}人团队）`,
        mode: _,
        members: T,
        coordinatorName: _ === "coordinator" || _ === "debate" ? z : void 0,
        taskTemplate: P.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: H,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: se,
        successCriteria: Y.trim(),
        routingInstruction: de.trim()
      };
      await Di(F), h.success(r ? "团队已更新" : "团队已创建"), a(), t();
    } catch (w) {
      h.error(w.message || "保存失败");
    } finally {
      te(!1);
    }
  }, Q = n.filter(
    (w) => !K.includes(w.name)
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
      onOk: he,
      okText: "保存专家团",
      confirmLoading: ee,
      okButtonProps: {
        icon: j ? i.createElement(j) : void 0
      }
    },
    // Step 1: Basic info
    i.createElement(
      "div",
      { style: { marginBottom: 16 } },
      i.createElement(
        M,
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
        K.length > 0 ? i.createElement(Or, {
          members: K,
          size: 36
        }) : null,
        i.createElement(c, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: N,
          onChange: (w) => V(w.target.value),
          style: { flex: 1 }
        })
      ),
      i.createElement(c.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: R,
        onChange: (w) => W(w.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      i.createElement(
        M,
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
        ...ke.map((w) => {
          const T = _ === w.value;
          return i.createElement(
            "button",
            {
              key: w.value,
              type: "button",
              onClick: () => {
                $(w.value), w.value !== "coordinator" && w.value !== "debate" && A("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: T ? `${w.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${T ? w.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: T ? `0 0 0 2px ${w.accent}1a` : "none"
              }
            },
            i.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: w.accent,
                  fontWeight: 600
                }
              },
              i.createElement(
                "span",
                { style: { fontSize: 18 } },
                w.icon
              ),
              w.title
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
              w.description
            ),
            i.createElement(
              "div",
              {
                style: {
                  fontSize: 10,
                  color: w.accent,
                  marginTop: 5,
                  fontFamily: "monospace"
                }
              },
              w.topology
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
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      Q.length > 0 ? i.createElement(
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
        ...Q.map(
          (w) => i.createElement(
            m,
            {
              key: w.id,
              size: "small",
              icon: b ? i.createElement(b) : void 0,
              onClick: () => Te(w.name)
            },
            w.name
          )
        )
      ) : null,
      // Selected members
      K.length === 0 ? i.createElement(f, {
        description: "请从上方添加团队成员",
        image: f.PRESENTED_IMAGE_SIMPLE
      }) : i.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...K.map(
          (w) => i.createElement(
            "div",
            {
              key: w,
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
              i.createElement(at, {
                name: w,
                size: 24
              }),
              i.createElement(
                M,
                { strong: !0, style: { fontSize: 13 } },
                w
              ),
              (_ === "coordinator" || _ === "debate") && z === w ? i.createElement(
                p,
                { color: "blue", style: { fontSize: 10 } },
                _ === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            i.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              i.createElement(u, {
                size: "small",
                value: Ee[w] || Sn(w),
                style: { width: 132 },
                onChange: (T) => be({
                  ...Ee,
                  [w]: T
                }),
                options: oe.map((T) => ({
                  value: T.key,
                  label: T.display_name
                }))
              }),
              i.createElement(u, {
                size: "small",
                value: U[w] || "fixed",
                style: { width: 118 },
                onChange: (T) => pe({
                  ...U,
                  [w]: T
                }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              _ === "coordinator" || _ === "debate" ? i.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  onClick: () => A(w)
                },
                _ === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              i.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: x ? i.createElement(x) : void 0,
                  onClick: () => we(w)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    _ === "review_loop" || _ === "router" ? i.createElement(
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
      _ === "review_loop" ? i.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: 10
          }
        },
        i.createElement(u, {
          value: se,
          onChange: (w) => ae(w),
          options: [1, 2, 3, 4, 5].map((w) => ({
            value: w,
            label: `最多 ${w} 轮`
          }))
        }),
        i.createElement(c, {
          value: Y,
          onChange: (w) => ie(w.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : i.createElement(c, {
        value: de,
        onChange: (w) => q(w.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    i.createElement(y, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    K.length > 0 ? i.createElement(
      "div",
      { style: { marginBottom: 16 } },
      i.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${_ === "roundtable" ? "（并行独立）" : _ === "pipeline" ? "（顺序交接）" : _ === "router" ? "（作为候选能力）" : _ === "review_loop" ? "（首位执行、末位评审）" : _ === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      i.createElement(
        m,
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
        M,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : i.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...G.map(
          (w, T) => i.createElement(
            "div",
            {
              key: T,
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
              _ === "pipeline" ? i.createElement(
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
                `${T + 1}`
              ) : i.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              i.createElement(
                p,
                { color: "blue", style: { fontSize: 11 } },
                w.agentName
              ),
              i.createElement(
                "div",
                { style: { flex: 1 } },
                i.createElement(c, {
                  placeholder: "请输入该步骤的指令...",
                  value: w.instruction,
                  onChange: (H) => ye(T, "instruction", H.target.value),
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
                checked: w.passContext,
                onChange: (H) => ye(T, "passContext", H)
              }),
              i.createElement(
                M,
                { type: "secondary", style: { fontSize: 11 } },
                w.passContext ? "传递上一步结果作为上下文" : "独立执行"
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
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${K.length > 0 ? "4" : "3"}. 任务模板`
      ),
      i.createElement(c.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: P,
        onChange: (w) => Z(w.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      i.createElement(
        M,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function ja({
  team: e,
  agents: t,
  onLaunch: n,
  onEdit: r,
  onDelete: a
}) {
  var I;
  const i = L().React, { useState: s } = i, { Card: l, Tag: o, Typography: d, Button: c, Tooltip: m, Popconfirm: u } = L().antd, {
    TeamOutlined: p,
    RocketOutlined: v,
    UserOutlined: g,
    EditOutlined: f,
    DeleteOutlined: h,
    DownOutlined: y,
    UpOutlined: E
  } = L().antdIcons || {}, { Text: b, Paragraph: x } = d, [j, O] = s(!1), M = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, S = M[e.mode] || M.coordinator, N = e.members.map((R) => {
    const W = R.bindingMode === "temporary", _ = W ? null : (R.agentId && t.some(($) => $.id === R.agentId) ? R.agentId : null) || Vi(t, R.name);
    return { ...R, found: !!_, agentId: _, temporary: W };
  }), V = N.filter((R) => R.found).length, C = e.coordinatorName || ((I = e.members[0]) == null ? void 0 : I.name);
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
        members: e.members.map((R) => R.name),
        size: 36
      }),
      i.createElement(
        "div",
        { style: { flex: 1 } },
        i.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          i.createElement(
            b,
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
            { color: S.color, style: { fontSize: 10 } },
            S.label
          ),
          i.createElement(
            o,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          V < e.members.length ? i.createElement(
            m,
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
          m,
          { title: "编辑" },
          i.createElement(c, {
            type: "text",
            size: "small",
            icon: f ? i.createElement(f) : void 0,
            onClick: (R) => {
              R.stopPropagation(), r(e);
            }
          })
        ) : null,
        a ? i.createElement(
          m,
          { title: "删除" },
          i.createElement(
            u,
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
              onClick: (R) => R.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    i.createElement(
      x,
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
      ...N.map(
        (R) => i.createElement(
          m,
          {
            key: R.name,
            title: `${R.name}（${R.role}）${R.temporary ? " - OMP 临时派生" : R.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
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
                background: R.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${R.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            i.createElement(at, { name: R.name, size: 18 }),
            i.createElement(
              b,
              {
                style: { fontSize: 11, color: R.found ? "#1f4e8c" : "#531dab" }
              },
              R.name
            ),
            R.temporary ? i.createElement(
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
        onClick: (R) => {
          R.stopPropagation(), O(!j);
        },
        icon: j ? E ? i.createElement(E) : "▲" : y ? i.createElement(y) : "▼"
      },
      j ? "收起流程" : "查看执行流程"
    ),
    j ? i.createElement(Dl, { team: e }) : null,
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
        b,
        { type: "secondary", style: { fontSize: 11 } },
        C ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${C}` : "OMP 动态编排"
      ),
      i.createElement(
        c,
        {
          type: "primary",
          size: "small",
          icon: v ? i.createElement(v) : void 0,
          disabled: t.length === 0,
          onClick: () => n(e),
          style: Ke
        },
        "运行工作流"
      )
    )
  );
}
function Fl({
  agents: e,
  onLaunch: t
}) {
  const n = L().React, { useMemo: r, useState: a, useCallback: i, useEffect: s } = n, {
    Row: l,
    Col: o,
    Input: d,
    Empty: c,
    Typography: m,
    Tag: u,
    Button: p,
    Divider: v,
    Tabs: g,
    message: f
  } = L().antd, { SearchOutlined: h, PlusOutlined: y, RocketOutlined: E } = L().antdIcons || {}, { Text: b } = m, [x, j] = a(""), [O, M] = a([]), [S, N] = a([]), [V, C] = a(!1), [I, R] = a(null), [W, _] = a("preset");
  s(() => {
    let D = !0;
    return (async () => {
      try {
        await $l();
        const ee = await br();
        D && M(ee);
      } catch (ee) {
        console.warn("[ugsci] Failed to load backend expert teams:", ee), D && (M([]), f.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), Nl().then((ee) => {
      D && ee && N(ee);
    }), () => {
      D = !1;
    };
  }, []);
  const $ = i(() => {
    br().then(M).catch((D) => {
      console.warn("[ugsci] Failed to refresh expert teams:", D), M([]), f.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [f]), z = i(
    (D) => {
      Al(D.id).then(() => {
        $(), f.success(`团队「${D.name}」已删除`);
      }).catch((ee) => f.error(ee.message || "删除专家团失败"));
    },
    [f, $]
  ), A = i((D) => {
    R(D), C(!0);
  }, []), P = i(() => {
    R(null), C(!0);
  }, []), Z = r(() => [...O, ...S], [O, S]), G = r(() => {
    if (!x.trim()) return Z;
    const D = x.toLowerCase();
    return Z.filter(
      (ee) => ee.name.toLowerCase().includes(D) || ee.description.toLowerCase().includes(D) || ee.category.toLowerCase().includes(D)
    );
  }, [Z, x]), B = G.filter((D) => D.custom), K = G.filter((D) => !D.custom);
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
        value: x,
        onChange: (D) => j(D.target.value),
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
          style: Ke
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(g, {
      activeKey: W,
      onChange: _,
      items: [
        {
          key: "preset",
          label: `预设团队${K.length ? ` (${K.length})` : ""}`,
          children: n.createElement(
            "div",
            null,
            K.length > 0 ? n.createElement(
              l,
              { gutter: [12, 12] },
              ...K.map(
                (D) => n.createElement(
                  o,
                  { key: D.id, xs: 24, sm: 12, md: 8 },
                  n.createElement(ja, {
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
          label: `自定义团队${B.length ? ` (${B.length})` : ""}`,
          children: n.createElement(
            "div",
            null,
            B.length > 0 ? n.createElement(
              l,
              { gutter: [12, 12] },
              ...B.map(
                (D) => n.createElement(
                  o,
                  { key: D.id, xs: 24, sm: 12, md: 8 },
                  n.createElement(ja, {
                    team: D,
                    agents: e,
                    onLaunch: t,
                    onEdit: A,
                    onDelete: z
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
            n.createElement(Ul, {
              enabled: W === "active"
            }),
            n.createElement(Pa, {
              activeOnly: !0,
              enabled: W === "active"
            })
          )
        },
        {
          key: "history",
          label: "讨论历史",
          children: n.createElement(Pa, {
            enabled: W === "history"
          })
        }
      ]
    }),
    // Team Builder Modal
    n.createElement(ql, {
      open: V,
      onClose: () => {
        C(!1), R(null);
      },
      agents: e,
      editingTeam: I,
      onSaved: $
    })
  );
}
function Gl({
  expert: e,
  onClose: t,
  onSaved: n
}) {
  const r = L().React, { Modal: a, Alert: i, Spin: s, Button: l, message: o } = L().antd, [d, c] = r.useState(
    null
  ), [m, u] = r.useState(null), [p, v] = r.useState(""), [g, f] = r.useState(!1), [h, y] = r.useState(0), E = _t({
    ...e,
    presentation: e.presentation ? { ...e.presentation, avatar: null } : null
  }), b = Ct(e);
  r.useEffect(() => {
    let j = !0;
    return c(null), u(null), v(""), Gn(e.agent.id, !0).then((O) => {
      j && (c(O), u(
        O.avatar || _t({ ...e, presentation: O })
      ));
    }).catch((O) => {
      j && v(O.message || "无法读取头像配置");
    }), () => {
      j = !1;
    };
  }, [e.agent.id, h]);
  const x = async () => {
    if (!(!d || !m)) {
      f(!0), v("");
      try {
        await Nr(e.agent.id, {
          ...d,
          avatar: m
        }), Tt(), n(), o.success("专家头像已保存"), t();
      } catch (j) {
        v(j.message || "头像保存失败，修改内容已保留");
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
      onOk: x,
      okText: "保存头像",
      cancelText: "取消",
      okButtonProps: { disabled: !m, loading: g },
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
        r.createElement(Pi, {
          disabled: g || !m,
          onClick: () => u(
            (j) => j && { ...j, colors: {} }
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
              disabled: !m,
              loading: g,
              onClick: x
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
          onClick: () => y((j) => j + 1)
        },
        "重新加载配置"
      )
    }),
    m ? r.createElement(Oi, {
      name: b.name,
      value: m,
      suggested: E,
      onChange: u,
      disabled: g,
      showResetColors: !1
    }) : !p && r.createElement(s, { size: "small" })
  );
}
const Wl = [
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
], Zl = 5e3, cr = {
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
function Jl(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Xt(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), Jl(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function Ql(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Kl(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function Xl(e) {
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
function Gi(e) {
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
function Yl(e, t) {
  const n = typeof e.type == "string" ? e.type : "事件", r = typeof e.node_id == "string" ? ` · ${e.node_id}` : "", a = e.state && typeof e.state == "object" ? e.state : {}, i = e.data && typeof e.data == "object" ? e.data : {}, s = [e.message, a.message, a.error, i.message, i.error].find(
    (d) => typeof d == "string" && d.length > 0
  ) || "";
  if (s) return `${n}${r}: ${s}`;
  const l = typeof e.status == "string" ? e.status : typeof a.status == "string" ? a.status : "", o = l ? ` · ${Gi(l)}` : "";
  if (o) return `${n}${r}${o}`;
  try {
    const d = JSON.stringify(Object.keys(i).length > 0 ? i : e) || "{}", c = d.length > 240 ? `${d.slice(0, 237)}...` : d;
    return `${n}${r}: ${c}`;
  } catch {
    return `${n}${r} #${t + 1}`;
  }
}
const ec = /* @__PURE__ */ new Set([
  "running",
  "queued",
  "paused",
  "waiting_human"
]);
function kn(e) {
  return !e.resumed_by_run_id && ec.has(e.status);
}
function tc() {
  const e = L().React, { useCallback: t, useEffect: n, useRef: r, useState: a } = e, {
    Alert: i,
    Button: s,
    Card: l,
    Col: o,
    Empty: d,
    Input: c,
    Popconfirm: m,
    Modal: u,
    Row: p,
    Space: v,
    Spin: g,
    Tabs: f,
    Progress: h,
    Tag: y,
    Tooltip: E,
    Typography: b,
    message: x
  } = L().antd, {
    ApartmentOutlined: j,
    DeleteOutlined: O,
    ReloadOutlined: M,
    RocketOutlined: S,
    PlayCircleOutlined: N,
    StopOutlined: V
  } = L().antdIcons || {}, { Text: C, Paragraph: I, Title: R } = b, W = L().useSelectedAgent, _ = W ? W() : { id: "default" }, $ = (_ == null ? void 0 : _.id) || "default", [z, A] = a([]), [P, Z] = a([]), [G, B] = a([]), [K, D] = a(!0), [ee, te] = a(!0), [se, ae] = a(null), [Y, ie] = a(null), [de, q] = a(""), U = r(0), pe = r($);
  pe.current = $;
  const [Ee, be] = a(""), [oe, Se] = a(""), [ke, Ie] = a("templates"), [Te, we] = a(/* @__PURE__ */ new Set()), [ye, he] = a(/* @__PURE__ */ new Set()), Q = r(null), w = P.some(kn), T = e.useMemo(() => {
    const J = {};
    return z.forEach((ve) => {
      J[ve.id] = ve.name;
    }), J;
  }, [z]), H = e.useMemo(() => {
    const J = {};
    return P.forEach((ve) => {
      kn(ve) && (J[ve.flow_id] = (J[ve.flow_id] || 0) + 1);
    }), J;
  }, [P]), F = t(async (J = !1) => {
    J || D(!0);
    try {
      const [ve, Re, Ve] = await Promise.all([
        ge("/flowforge/flows", { bypassCache: !0 }),
        ge("/flowforge/runs", { bypassCache: !0 }),
        En().catch(() => [])
      ]);
      A(ve), Z(Re), B(Ve), te(!0);
    } catch (ve) {
      console.warn("[ugsci] FlowForge is unavailable:", ve), J || te(!1);
    } finally {
      J || D(!1);
    }
  }, []);
  n(() => {
    F();
  }, [F]), n(() => {
    if (!ee || !w) {
      Q.current && (clearInterval(Q.current), Q.current = null);
      return;
    }
    let J = !1;
    return Q.current = setInterval(async () => {
      if (!J) {
        J = !0;
        try {
          await F(!0);
        } finally {
          J = !1;
        }
      }
    }, Zl), () => {
      Q.current && (clearInterval(Q.current), Q.current = null);
    };
  }, [w, ee, F]);
  const ue = t(
    async (J) => {
      if (!se) {
        ae(J.key);
        try {
          const ve = await ge(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: J.sop,
                name: J.name,
                agent_id: $
              })
            }
          ), Re = {
            ...ve.nodes || {}
          }, Ve = Object.entries(Re).filter(([Ze]) => /^step_\d+$/.test(Ze)).sort(
            ([Ze], [$e]) => Number(Ze.slice(5)) - Number($e.slice(5))
          ), me = {};
          let je = 0, He = 0;
          Ve.forEach(([Ze, $e], mt) => {
            const ct = J.roleHints[mt] || "", De = J.roleKeys[mt] || "analyst", Le = G.find(
              (qt) => `${qt.name} ${qt.id}`.toLowerCase().includes(ct.toLowerCase())
            );
            Le ? je++ : He++;
            const dt = (Le == null ? void 0 : Le.id) || $, Mt = {
              ...$e.inputs || {}
            };
            Mt.agent_id = dt, Re[Ze] = {
              ...$e,
              inputs: Mt,
              metadata: {
                ...$e.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: ct,
                role_key: De,
                agent_id: dt
              }
            }, me[Ze] = {
              binding_policy: "fixed_instance",
              role_hint: ct,
              role_key: De,
              agent_id: dt
            };
          });
          const We = {
            ...ve,
            nodes: Re,
            id: `${J.key}-${Date.now()}`,
            name: J.name,
            description: J.description,
            metadata: {
              ...ve.metadata || {},
              domain: "oil-gas",
              template_key: J.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: $,
              node_bindings: me
            }
          };
          await ge("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(We)
          });
          const lt = Ve.length > 0 ? `（${je} 个专家已匹配，${He} 个回退到控制器）` : "";
          x.success(`已创建工作流草稿「${J.name}」${lt}`), await F();
        } catch (ve) {
          x.error(ve.message || "创建工作流失败");
        } finally {
          ae(null);
        }
      }
    },
    [G, $, se, F, x]
  );
  n(() => {
    U.current++, ie(null), q(""), ae(null);
  }, [$]);
  const X = t(async () => {
    if (se || !oe.trim()) return;
    const J = ++U.current;
    ae("natural-language"), q("");
    try {
      const ve = await ge(
        "/flowforge/authoring/proposals",
        {
          method: "POST",
          body: JSON.stringify({
            prompt: oe.trim(),
            name: Ee.trim(),
            agent_id: $
          })
        }
      );
      J === U.current && ie(ve);
    } catch (ve) {
      J === U.current && q(ve.message || "生成失败，请检查模型配置后重试");
    } finally {
      J === U.current && ae(null);
    }
  }, [$, se, Ee, oe]), fe = t(async () => {
    if (!(Y != null && Y.validation.ok) || se) return;
    const J = $;
    ae("apply"), q("");
    try {
      const ve = await ge(
        `/flowforge/authoring/proposals/${encodeURIComponent(
          Y.proposal_id
        )}/apply`,
        {
          method: "POST",
          body: JSON.stringify({ expected_revision: Y.base_revision })
        }
      );
      if (pe.current !== J) return;
      ie(null), be(""), Se(""), x.success("方案已应用并保存"), Xt(ve.id);
    } catch (ve) {
      pe.current === J && q(ve.message || "应用失败，请重新生成方案");
    } finally {
      pe.current === J && ae(null);
    }
  }, [Y, se, $, x]), xe = t(
    async (J, ve) => {
      try {
        await ge(`/flowforge/flows/${encodeURIComponent(J)}`, {
          method: "DELETE"
        }), x.success(`已删除工作流「${ve}」`), await F();
      } catch (Re) {
        x.error(Re.message || "删除工作流失败");
      }
    },
    [F, x]
  ), Ae = t(
    async (J) => {
      we((ve) => {
        const Re = new Set(ve);
        return Re.add(J), Re;
      });
      try {
        await ge(`/flowforge/runs/${encodeURIComponent(J)}/cancel`, {
          method: "POST"
        }), x.success("已请求取消运行"), await F(!0);
      } catch (ve) {
        x.error(ve.message || "取消运行失败");
      } finally {
        we((ve) => {
          const Re = new Set(ve);
          return Re.delete(J), Re;
        });
      }
    },
    [F, x]
  ), Fe = e.createElement(
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
        v,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(c, {
          "aria-label": "工作流名称",
          value: Ee,
          onChange: (J) => be(J.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(c.TextArea, {
          "aria-label": "工作流需求描述",
          value: oe,
          onChange: (J) => Se(J.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          s,
          {
            type: "primary",
            onClick: () => void X(),
            loading: se === "natural-language",
            disabled: !ee || !!se || !oe.trim(),
            style: Ke
          },
          "生成并预览方案"
        )
      )
    ),
    e.createElement(
      p,
      { gutter: [12, 12] },
      ...Wl.map(
        (J) => e.createElement(
          o,
          { key: J.key, xs: 24, md: 8 },
          e.createElement(
            l,
            { style: { height: "100%" } },
            e.createElement(
              v,
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
                  R,
                  { level: 5, style: { margin: 0 } },
                  J.name
                ),
                e.createElement(
                  y,
                  { color: "blue", style: { marginTop: 6 } },
                  J.category
                ),
                e.createElement(
                  I,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  J.description
                ),
                e.createElement(
                  s,
                  {
                    type: "primary",
                    loading: se === J.key,
                    disabled: !ee || !!se,
                    onClick: () => void ue(J),
                    style: Ke
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
          ([J, ve, Re]) => e.createElement(
            o,
            { key: J, xs: 24, sm: 12, lg: 6 },
            e.createElement(C, { strong: !0 }, J),
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
              ve
            )
          )
        )
      )
    )
  ), Ge = K ? e.createElement(g) : z.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    p,
    { gutter: [12, 12] },
    ...z.map((J) => {
      const ve = H[J.id] || 0;
      return e.createElement(
        o,
        { key: J.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          l,
          {
            size: "small",
            title: e.createElement(
              v,
              { size: 6 },
              e.createElement("span", null, J.name),
              ve > 0 ? e.createElement(
                y,
                { color: "blue" },
                `${ve} 个运行中`
              ) : null
            ),
            extra: e.createElement(y, null, `v${J.version}`)
          },
          e.createElement(
            I,
            { ellipsis: { rows: 2 } },
            J.description || "暂无描述"
          ),
          e.createElement(
            v,
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
                icon: N ? e.createElement(N) : void 0,
                disabled: !ee,
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
              m,
              {
                title: "确认删除",
                description: `确定要删除工作流「${J.name}」吗？此操作不可撤销。`,
                onConfirm: () => void xe(J.id, J.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(
                s,
                {
                  size: "small",
                  danger: !0,
                  icon: O ? e.createElement(O) : void 0
                },
                "删除"
              )
            )
          )
        )
      );
    })
  ), it = K ? e.createElement(g) : P.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...P.map((J) => {
      const ve = T[J.flow_id] || J.flow_id, Re = kn(J), Ve = Xl(J.node_statuses), me = Object.entries(J.node_statuses || {}), je = me.filter(
        ([, De]) => ["success", "completed", "skipped", "cached"].includes(De)
      ).length, He = me.filter(
        ([, De]) => ["error", "failed"].includes(De)
      ).length, We = me.length > 0, lt = J.status === "completed" || J.status === "success", Ze = We ? Math.round(je / me.length * 100) : Re ? 18 : lt ? 100 : 0, $e = Array.isArray(J.events) ? J.events.filter(
        (De) => !!De && typeof De == "object"
      ).slice(-100) : [], mt = ye.has(J.run_id), ct = J.duration_ms && J.duration_ms > 0 ? J.duration_ms : J.finished_at && J.started_at ? (J.finished_at - J.started_at) * 1e3 : Re && J.started_at ? (Date.now() / 1e3 - J.started_at) * 1e3 : 0;
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
          e.createElement(C, { strong: !0 }, ve),
          e.createElement(
            E,
            { title: J.run_id },
            e.createElement(
              C,
              {
                type: "secondary",
                style: { fontFamily: "monospace", fontSize: 11 }
              },
              J.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            C,
            { type: "secondary", style: { fontSize: 12 } },
            Ql(J.started_at)
          ),
          ct > 0 ? e.createElement(
            C,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Kl(ct)}`
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
              C,
              { type: "danger", style: { fontSize: 12 } },
              "（有错误）"
            )
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            Re ? e.createElement(
              m,
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
                  loading: Te.has(J.run_id),
                  icon: V ? e.createElement(V) : void 0
                },
                "取消运行"
              )
            ) : null,
            e.createElement(
              s,
              {
                size: "small",
                type: "link",
                onClick: () => he((De) => {
                  const Le = new Set(De);
                  return Le.has(J.run_id) ? Le.delete(J.run_id) : Le.add(J.run_id), Le;
                })
              },
              mt ? "收起过程" : "查看过程"
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
            status: He || J.status === "failed" || J.status === "error" ? "exception" : Re ? "active" : "success",
            showInfo: !1,
            style: { flex: 1, margin: 0 }
          }),
          e.createElement(
            C,
            {
              type: "secondary",
              style: { fontSize: 12, minWidth: 90, textAlign: "right" }
            },
            We ? `${Ze}%` : "暂无节点进度"
          )
        ),
        mt && (me.length > 0 || $e.length > 0 || J.error) ? e.createElement(
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
            e.createElement(C, { strong: !0 }, "协作过程"),
            e.createElement(
              C,
              { type: "secondary", style: { fontSize: 12 } },
              me.length > 0 ? `${je}/${me.length} 个 Agent 节点完成${He ? ` · ${He} 个失败` : ""}` : "暂无节点状态"
            )
          ),
          me.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 7 } },
            ...me.map(
              ([De, Le], dt) => e.createElement(
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
                  dt + 1
                ),
                e.createElement(
                  C,
                  { style: { flex: 1, fontSize: 12 } },
                  De.replace(/^step[_-]?\d+[_-]?/, "") || `Agent ${dt + 1}`
                ),
                dt < me.length - 1 ? e.createElement(
                  C,
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
                  Gi(Le)
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
              C,
              { strong: !0, style: { fontSize: 12 } },
              "执行事件"
            ),
            ...$e.map(
              (De, Le) => e.createElement(
                C,
                {
                  key: `event-${Le}`,
                  type: "secondary",
                  style: { fontSize: 12 }
                },
                Yl(De, Le)
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
  ), Ye = e.createElement(
    v,
    null,
    e.createElement(
      s,
      {
        icon: M ? e.createElement(M) : void 0,
        onClick: () => void F(),
        loading: K
      },
      "刷新"
    ),
    ke !== "templates" ? e.createElement(
      s,
      {
        type: "primary",
        icon: j ? e.createElement(j) : S ? e.createElement(S) : void 0,
        onClick: () => Xt(),
        disabled: !ee,
        style: Ke
      },
      "打开流程编辑器"
    ) : null
  );
  return e.createElement(
    "div",
    null,
    ee ? null : e.createElement(i, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    de ? e.createElement(i, {
      type: "error",
      showIcon: !0,
      message: "方案未应用",
      description: de,
      style: { marginBottom: 12 }
    }) : null,
    e.createElement(
      u,
      {
        title: "审查工作流方案",
        open: !!Y,
        width: 720,
        onCancel: () => {
          se || (ie(null), q(""));
        },
        onOk: () => void fe(),
        okText: "应用并打开编辑器",
        cancelText: "放弃方案",
        confirmLoading: se === "apply",
        okButtonProps: { disabled: !(Y != null && Y.validation.ok) || !!se },
        cancelButtonProps: { disabled: !!se },
        closable: !se,
        maskClosable: !se
      },
      Y ? e.createElement(
        v,
        { direction: "vertical", style: { width: "100%" } },
        e.createElement(i, {
          type: Y.validation.ok ? "success" : "error",
          showIcon: !0,
          message: Y.validation.ok ? "结构验证通过，请检查业务逻辑" : "方案未通过验证",
          description: Y.validation.errors.join("；") || "确认后保存流程，可在编辑器配置业务输入并试运行。"
        }),
        ...Y.warnings.map(
          (J, ve) => e.createElement(i, {
            key: `warning-${ve}`,
            type: "warning",
            message: J
          })
        ),
        e.createElement(
          "ul",
          null,
          ...Y.changes.map(
            (J, ve) => e.createElement("li", { key: ve }, J.description)
          )
        ),
        de ? e.createElement(i, {
          type: "error",
          message: de
        }) : null
      ) : null
    ),
    e.createElement(f, {
      items: [
        { key: "templates", label: "工作流模板", children: Fe },
        {
          key: "mine",
          label: `我的工作流 (${z.length})`,
          children: Ge
        },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            P.length,
            w ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${P.filter((J) => kn(J)).length} 活跃`
            ) : null,
            ")"
          ),
          children: it
        }
      ],
      activeKey: ke,
      onChange: (J) => Ie(J),
      tabBarExtraContent: Ye
    })
  );
}
function Ba(e, t) {
  var a, i;
  const n = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), r = e.members.find((s) => s.name === n) || e.members[0];
  if ((r == null ? void 0 : r.bindingMode) !== "temporary" && (r != null && r.agentId) && t.some((s) => s.id === r.agentId))
    return r.agentId;
  if (n && (r == null ? void 0 : r.bindingMode) !== "temporary") {
    const s = Vi(t, n);
    if (s) return s;
  }
  return (r == null ? void 0 : r.bindingMode) === "fixed" ? null : ((i = t[0]) == null ? void 0 : i.id) || null;
}
function Ha() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function nc() {
  var he, Q, w;
  const e = L().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, i = (Q = (he = L()).useNavigate) == null ? void 0 : Q.call(he), s = r(
    (T) => {
      i ? i(T) : window.location.assign(T);
    },
    [i]
  ), {
    Spin: l,
    Empty: o,
    Input: d,
    Button: c,
    message: m,
    Tabs: u,
    Modal: p,
    Typography: v
  } = L().antd, { ReloadOutlined: g, PlusOutlined: f, SearchOutlined: h } = L().antdIcons || {}, { Text: y, Paragraph: E } = v, [b, x] = t([]), [j, O] = t(!0), [M, S] = t(!1), [N, V] = t(null), [C, I] = t(""), [R, W] = t("全部专家"), [_, $] = t(!1), [z, A] = t(Ha), [P, Z] = t(
    null
  ), [G, B] = t(""), [K, D] = t(!1), [ee, te] = t(!1), [se, ae] = t(null), [Y, ie] = t(null), [de, q] = t([]), U = r(async () => {
    O(!0);
    try {
      const T = await En(), H = await Promise.all(
        T.map(async (F) => {
          try {
            const [ue, X, fe, xe] = await Promise.all(
              [
                jr(F.id).catch(() => null),
                Zn(F.id).catch(() => []),
                Hr(F.id).catch(
                  () => []
                ),
                Gn(F.id).catch(() => null)
              ]
            );
            return {
              agent: F,
              config: ue,
              skills: X,
              mcps: fe,
              presentation: xe,
              loading: !1
            };
          } catch {
            return {
              agent: F,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      x(H), q(T);
    } catch (T) {
      m.error(T.message || "加载专家列表失败"), x([]);
    } finally {
      O(!1);
    }
  }, []);
  n(() => {
    U();
  }, [U]), n(() => {
    const T = () => A(Ha());
    return window.addEventListener("popstate", T), () => window.removeEventListener("popstate", T);
  }, []), n(() => {
    if (se && ee) {
      const T = b.find((H) => H.agent.id === se.agent.id);
      T && T !== se && ae(T);
    }
  }, [b, se, ee]);
  const pe = r(
    async (T) => {
      var X;
      const H = T.coordinatorName || ((X = T.members[0]) == null ? void 0 : X.name), F = Ba(T, de);
      if (!F) {
        const fe = T.members.find(
          (xe) => xe.name === H
        );
        m.error(
          (fe == null ? void 0 : fe.bindingMode) === "fixed" ? `固定协调者「${H || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(T.taskTemplate)) {
        B(T.taskTemplate), Z(T);
        return;
      }
      await Ee(T, F, T.taskTemplate);
    },
    [de, m]
  ), Ee = r(
    async (T, H, F) => {
      D(!0);
      try {
        const ue = F || T.taskTemplate, X = T.custom ? `@${T.id}` : T.name, fe = `/ugsci-team ${T.mode} ${X} ${ue}`, xe = L();
        xe.setSelectedAgent && xe.setSelectedAgent(H);
        const Ae = await Rl(H, fe, T.name);
        m.success(`OMP 工作流已启动：${T.name}（${T.mode}模式）`), Z(null), s(`/chat/${Ae}`);
      } catch (ue) {
        m.error(ue.message || "发起团队任务失败");
      } finally {
        D(!1);
      }
    },
    [m, s]
  ), be = r((T) => {
    V(T), S(!0);
  }, []), oe = r((T) => {
    ae(T), te(!0);
  }, []), Se = r(
    (T) => {
      if (!T.agent.enabled) {
        m.warning(`专家「${T.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        if (T.agent.managed_by_app) {
          s(
            `/apps/${encodeURIComponent(T.agent.managed_by_app)}`
          );
          return;
        }
        if (T.agent.available_in_chat === !1)
          throw new Error("此专家不支持通用聊天，请从所属应用打开");
        const H = L();
        if (!H.setSelectedAgent)
          throw new Error("当前版本不支持切换专家，请更新软件后重试");
        H.setSelectedAgent(T.agent.id), sessionStorage.setItem("qwenpaw_pending_new_chat", "1"), s("/chat"), m.success(`已召唤专家「${T.agent.name}」`);
      } catch (H) {
        sessionStorage.removeItem("qwenpaw_pending_new_chat"), console.warn("[ugsci] Failed to set selected agent:", H), m.error(
          H instanceof Error ? H.message : "召唤专家失败，请重试"
        );
      }
    },
    [m, s]
  ), ke = a(() => {
    const T = C.trim().toLowerCase();
    return b.filter((H) => {
      const F = Ct(H);
      return (R === "全部专家" || F.category === R) && `${F.name} ${F.specialty} ${F.summary} ${H.agent.name} ${H.agent.id} ${H.agent.description || ""} ${H.skills.map((ue) => ue.name).join(" ")}`.toLowerCase().includes(T);
    });
  }, [b, C, R]), Ie = b.filter((T) => T.agent.enabled).length, Te = b.reduce(
    (T, H) => T + H.skills.filter((F) => F.enabled !== !1).length,
    0
  ), we = b.reduce((T, H) => T + H.mcps.length, 0), ye = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(So, { size: 16 }),
        "专家"
      ),
      children: e.createElement(
        "div",
        { className: "ugsci-expert-library" },
        e.createElement("style", null, Mi),
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
            value: C,
            onChange: (T) => I(T.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            c,
            {
              type: "primary",
              icon: f ? e.createElement(f) : void 0,
              onClick: () => $(!0),
              style: Ke
            },
            "创建专家"
          )
        ),
        e.createElement(
          "nav",
          { className: "ugsci-expert-filters", "aria-label": "专家分类" },
          ...Ai.map(
            (T) => e.createElement(
              "button",
              {
                key: T,
                type: "button",
                className: "ugsci-expert-filter",
                "aria-pressed": R === T,
                onClick: () => W(T)
              },
              T,
              e.createElement(
                "small",
                null,
                T === "全部专家" ? b.length : b.filter(
                  (H) => Ct(H).category === T
                ).length
              )
            )
          )
        ),
        // Content
        j ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : ke.length === 0 ? e.createElement(o, {
          description: C || R !== "全部专家" ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          "div",
          {
            className: "ugsci-expert-grid",
            "aria-live": "polite"
          },
          ...ke.map(
            (T) => e.createElement(
              "div",
              {
                key: T.agent.id,
                style: { display: "flex", minWidth: 0 }
              },
              e.createElement(El, {
                expert: T,
                onClick: () => be(T),
                onSummon: () => Se(T),
                onConfigure: () => oe(T),
                onEditAvatar: () => ie(T)
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
        e.createElement(ko, { size: 16 }),
        "专家团"
      ),
      children: e.createElement(Fl, {
        agents: de,
        onLaunch: pe
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(_o, { size: 16 }),
        "协作工作流"
      ),
      children: e.createElement(tc)
    }
  ];
  return e.createElement(
    "div",
    {
      className: z === "experts" ? "ugsci-expert-page" : void 0,
      style: { padding: 24 }
    },
    e.createElement(Wn, {
      title: "专家·协作",
      subtitle: z === "experts" ? `共 ${b.length} 位专家（${Ie} 位启用）· ${Te} 个技能 · ${we} 个 MCP 客户端` : z === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        z === "experts" ? e.createElement(
          c,
          {
            icon: g ? e.createElement(g) : void 0,
            onClick: () => {
              Tt(), U();
            },
            loading: j
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(u, {
      items: ye,
      activeKey: z,
      onChange: (T) => {
        A(T);
        const H = new URL(window.location.href);
        T === "experts" ? H.searchParams.delete("section") : H.searchParams.set("section", T), window.history.pushState({}, "", `${H.pathname}${H.search}`);
      }
    }),
    // Drawer
    e.createElement(wl, {
      onSummon: Se,
      expert: N,
      open: M,
      onClose: () => S(!1)
    }),
    // Template Modal
    e.createElement(xl, {
      open: _,
      onClose: () => $(!1),
      onCreated: () => U()
    }),
    // Config Modal (gear icon)
    Y && e.createElement(Gl, {
      key: Y.agent.id,
      expert: Y,
      onClose: () => ie(null),
      onSaved: () => {
        U();
      }
    }),
    e.createElement(vl, {
      expert: se,
      open: ee,
      onClose: () => te(!1),
      onRefresh: () => U()
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
            members: P.members.map((T) => T.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${P.name}`
          )
        ),
        onCancel: () => Z(null),
        onOk: () => {
          const T = Ba(
            P,
            de
          );
          if (!T) {
            m.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const H = G.trim() || P.taskTemplate;
          Ee(P, T, H);
        },
        confirmLoading: K,
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
          onChange: (T) => B(T.target.value),
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
          `协调者: ${P.coordinatorName || ((w = P.members[0]) == null ? void 0 : w.name) || "—"} · 成员: ${P.members.map((T) => T.name).join("、")}`
        )
      )
    ) : null
  );
}
const rc = `
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
function Wi({
  content: e,
  name: t,
  agentId: n,
  poolName: r
}) {
  const a = L().React, { Button: i, Spin: s, Alert: l, Tabs: o } = L().antd, [d, c] = a.useState(e || ""), [m, u] = a.useState(!1), [p, v] = a.useState(""), [g, f] = a.useState(0);
  return a.useEffect(() => {
    let h = !1;
    if (c(e || ""), v(""), u(!1), !(e || !r && (!t || !n)))
      return u(!0), ge(
        r ? `/skills/pool/${encodeURIComponent(r)}/content` : `/skills/${encodeURIComponent(t)}`,
        {
          headers: n ? { "X-Agent-Id": n } : void 0,
          bypassCache: g > 0
        }
      ).then((y) => {
        h || c(y.content || "");
      }).catch((y) => {
        h || v(y.message || "加载技能定义失败");
      }).finally(() => {
        h || u(!1);
      }), () => {
        h = !0;
      };
  }, [e, t, n, r, g]), a.createElement(
    "section",
    { className: "ugsci-skill-definition", "aria-label": "技能全文定义" },
    a.createElement("h3", null, "技能定义"),
    m ? a.createElement(s, { tip: "加载技能定义" }) : p ? a.createElement(l, {
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
            kt(
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
  const m = L().React, { Button: u } = L().antd, { ArrowLeftOutlined: p } = L().antdIcons || {}, v = m.useId(), g = m.useRef(null);
  if (m.useEffect(() => {
    var y;
    if (!e) return;
    const h = document.activeElement;
    return (y = g.current) == null || y.focus(), () => {
      h != null && h.isConnected && h.focus();
    };
  }, [e]), !e) return null;
  const f = r || a;
  return m.createElement(
    "section",
    {
      className: "ugsci-capability-focus " + (c.rootClassName || ""),
      "aria-labelledby": v,
      ref: g,
      tabIndex: -1,
      style: { outline: "none" }
    },
    m.createElement(
      u,
      {
        type: "text",
        onClick: f,
        icon: p ? m.createElement(p) : void 0
      },
      "返回列表"
    ),
    m.createElement(
      "div",
      { className: "ugsci-capability-detail" },
      m.createElement(
        "div",
        { className: "ugsci-capability-detail-heading" },
        m.createElement("h2", { id: v }, t),
        s
      ),
      n,
      l || i ? m.createElement(
        "div",
        { className: "ugsci-capability-detail-footer" },
        l || m.createElement(
          u,
          { type: "primary", loading: o, onClick: i },
          d
        )
      ) : null
    )
  );
}
function ac({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const a = L().React, { useState: i, useEffect: s, useCallback: l, useRef: o, useMemo: d } = a, {
    Input: c,
    Spin: m,
    Empty: u,
    Button: p,
    Row: v,
    Col: g,
    Card: f,
    Tag: h,
    Checkbox: y,
    Modal: E,
    Typography: b,
    Switch: x,
    Descriptions: j,
    message: O
  } = L().antd, {
    ReloadOutlined: M,
    ThunderboltOutlined: S,
    SettingOutlined: N,
    CheckSquareOutlined: V,
    EyeOutlined: C,
    EyeInvisibleOutlined: I,
    DeleteOutlined: R,
    CloseOutlined: W
  } = L().antdIcons || {}, { Text: _, Paragraph: $ } = b, [z, A] = i([]), [P, Z] = i(""), [G, B] = i(""), K = d(() => {
    const X = G.trim().toLowerCase();
    return X ? z.filter(
      (fe) => [
        fe.name,
        Oe(fe.name),
        fe.description,
        ...fe.tags || []
      ].some((xe) => xe == null ? void 0 : xe.toLowerCase().includes(X))
    ) : z;
  }, [z, G]), [D, ee] = i(!0), [te, se] = i(!1), [ae, Y] = i(null), [ie, de] = i(!1), [q, U] = i(/* @__PURE__ */ new Set()), [pe, Ee] = i(!1), be = o(0), oe = o(e);
  oe.current = e;
  const [Se, ke] = i(!1), Ie = l(async () => {
    if (!e || oe.current !== e) return;
    const X = ++be.current;
    ee(!0);
    try {
      const fe = await Zn(e);
      X === be.current && oe.current === e && (A(fe), Z(e));
    } catch (fe) {
      if (X !== be.current || oe.current !== e)
        return;
      O.error(fe.message || "加载技能失败"), A([]), Z(e);
    } finally {
      X === be.current && oe.current === e && ee(!1);
    }
  }, [e]);
  s(() => (se(!1), Y(null), de(!1), U(/* @__PURE__ */ new Set()), () => {
    be.current++;
  }), [e]), s(() => {
    Ie();
  }, [Ie, n]);
  const Te = (X) => {
    U((fe) => {
      const xe = new Set(fe);
      return xe.has(X) ? xe.delete(X) : xe.add(X), xe;
    });
  }, we = () => U(/* @__PURE__ */ new Set()), ye = () => U(new Set(z.map((X) => X.name))), he = () => {
    ie ? (we(), de(!1)) : de(!0);
  }, Q = async () => {
    const X = Array.from(q);
    if (X.length !== 0) {
      Ee(!0);
      try {
        const { results: fe } = await Fo(e, X), xe = Object.entries(fe).filter(
          ([, Fe]) => Fe.success === !1
        ), Ae = X.length - xe.length;
        xe.length > 0 ? O.warning(
          `批量启用完成：成功 ${Ae} 个，失败 ${xe.length} 个`
        ) : O.success(`成功启用 ${X.length} 个技能`), we(), await Ie();
      } catch (fe) {
        O.error(fe.message || "批量启用失败");
      } finally {
        Ee(!1);
      }
    }
  }, w = async () => {
    const X = Array.from(q);
    if (X.length !== 0) {
      Ee(!0);
      try {
        const { results: fe } = await Go(e, X), xe = Object.entries(fe).filter(
          ([, Fe]) => Fe.success === !1
        ), Ae = X.length - xe.length;
        xe.length > 0 ? O.warning(
          `批量停用完成：成功 ${Ae} 个，失败 ${xe.length} 个`
        ) : O.success(`成功停用 ${X.length} 个技能`), we(), await Ie();
      } catch (fe) {
        O.error(fe.message || "批量停用失败");
      } finally {
        Ee(!1);
      }
    }
  }, T = () => {
    const X = Array.from(q);
    X.length !== 0 && E.confirm({
      title: `确认删除 ${X.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        Ee(!0);
        try {
          const { results: fe } = await Wo(e, X), xe = Object.entries(fe).filter(
            ([, Fe]) => Fe.success === !1
          ), Ae = X.length - xe.length;
          xe.length > 0 ? O.warning(
            `批量删除完成：成功 ${Ae} 个，失败 ${xe.length} 个`
          ) : O.success(`成功删除 ${X.length} 个技能`), we(), await Ie();
        } catch (fe) {
          O.error(fe.message || "批量删除失败");
        } finally {
          Ee(!1);
        }
      }
    });
  }, H = async (X) => {
    ke(!0);
    try {
      X.enabled === !1 ? (await zi(e, X.name), O.success(`已启用技能「${Oe(X.name)}」`)) : (await Li(e, X.name), O.success(`已禁用技能「${Oe(X.name)}」`)), await Ie();
    } catch (fe) {
      O.error(fe.message || "操作失败");
    } finally {
      ke(!1);
    }
  }, F = (X) => {
    E.confirm({
      title: `确认删除技能「${Oe(X.name)}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ke(!0);
        try {
          await Ri(e, X.name), oe.current === e && se(!1), O.success(`已删除技能「${Oe(X.name)}」`), await Ie();
        } catch (fe) {
          O.error(fe.message || "删除失败");
        } finally {
          ke(!1);
        }
      }
    });
  }, ue = te && P === e;
  return a.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": ue },
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
        onChange: (X) => B(X.target.value)
      }),
      a.createElement(
        _,
        { type: "secondary", style: { fontSize: 13 } },
        ie ? `已选择 ${q.size} / ${z.length} 个技能` : `共 ${z.length} 个技能`
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
        ie ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            p,
            { size: "small", onClick: ye },
            "全选"
          ),
          a.createElement(
            p,
            {
              size: "small",
              icon: W ? a.createElement(W) : void 0,
              onClick: we
            },
            "取消选择"
          ),
          a.createElement(
            p,
            {
              size: "small",
              type: "default",
              icon: C ? a.createElement(C) : void 0,
              disabled: q.size === 0 || pe,
              loading: pe,
              onClick: Q
            },
            "批量启用"
          ),
          a.createElement(
            p,
            {
              size: "small",
              danger: !0,
              icon: I ? a.createElement(I) : void 0,
              disabled: q.size === 0 || pe,
              loading: pe,
              onClick: w
            },
            "批量停用"
          ),
          a.createElement(
            p,
            {
              size: "small",
              danger: !0,
              icon: R ? a.createElement(R) : void 0,
              disabled: q.size === 0 || pe,
              loading: pe,
              onClick: T
            },
            `删除 (${q.size})`
          ),
          a.createElement(
            p,
            {
              size: "small",
              type: "primary",
              onClick: he
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
              icon: V ? a.createElement(V) : void 0,
              onClick: he,
              disabled: K.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            p,
            {
              icon: M ? a.createElement(M) : void 0,
              onClick: () => {
                Tt(), Ie();
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
      a.createElement(m, { size: "large" })
    ) : z.length === 0 ? a.createElement(u, {
      description: G ? "未找到匹配的技能" : "当前智能体未加载任何技能"
    }) : a.createElement(
      v,
      { gutter: [12, 12] },
      ...K.map(
        (X) => a.createElement(
          g,
          { key: X.name, xs: 24, sm: 12, md: 12, lg: 8, xxl: 6 },
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
                X.emoji || "⚡"
              ),
              a.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    Y(X), se(!0);
                  }
                },
                Oe(X.name)
              ),
              ie ? a.createElement(y, {
                "aria-label": `选择 ${Oe(X.name)}`,
                checked: q.has(X.name),
                onChange: () => Te(X.name)
              }) : null
            ),
            a.createElement(
              $,
              {
                className: "ugsci-capability-card-copy",
                ellipsis: { rows: 2 },
                style: { margin: 0 }
              },
              X.description || "暂无描述"
            ),
            a.createElement(
              "div",
              { className: "ugsci-capability-card-meta" },
              X.version_text ? a.createElement(h, null, `v${X.version_text}`) : null,
              ...(X.tags || []).slice(0, 3).map((fe) => a.createElement(h, { key: fe }, fe))
            ),
            ie ? null : a.createElement(
              "div",
              { className: "ugsci-capability-card-footer" },
              a.createElement(
                p,
                {
                  size: "small",
                  onClick: () => {
                    Y(X), se(!0);
                  },
                  "aria-label": `配置 ${Oe(X.name)}`
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
                  _,
                  { type: "secondary", style: { fontSize: 12 } },
                  X.enabled === !1 ? "已禁用" : "已启用"
                ),
                a.createElement(x, {
                  size: "small",
                  checked: X.enabled !== !1,
                  loading: Se,
                  "aria-label": `${X.enabled === !1 ? "启用" : "禁用"} ${Oe(X.name)}`,
                  onChange: () => H(X)
                })
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    ae ? a.createElement(
      pn,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            ae.emoji || "⚡"
          ),
          a.createElement(
            "span",
            null,
            Oe(ae.name)
          )
        ),
        open: ue,
        onClose: () => se(!1),
        width: 520,
        rootClassName: "ugsci-skill-detail",
        footer: a.createElement(
          p,
          {
            danger: !0,
            disabled: Se,
            onClick: () => F(ae)
          },
          "删除技能"
        ),
        extra: a.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: N ? a.createElement(N) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        j,
        {
          column: 1,
          bordered: !0,
          size: "small",
          labelStyle: { width: 96, whiteSpace: "nowrap" }
        },
        a.createElement(
          j.Item,
          { label: "技能名称" },
          Oe(ae.name)
        ),
        a.createElement(
          j.Item,
          { label: "描述" },
          ae.description || "-"
        ),
        ae.version_text ? a.createElement(
          j.Item,
          { label: "版本" },
          ae.version_text
        ) : null,
        a.createElement(
          j.Item,
          { label: "来源" },
          ae.source || "-"
        ),
        a.createElement(
          j.Item,
          { label: "状态" },
          ae.enabled === !1 ? "已禁用" : "已启用"
        ),
        ae.installed_from ? a.createElement(
          j.Item,
          { label: "安装来源" },
          ae.installed_from
        ) : null
      ),
      // Tags
      ae.tags && ae.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          _,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...ae.tags.map(
            (X, fe) => a.createElement(h, { key: fe, color: "blue" }, X)
          )
        )
      ) : null,
      a.createElement(Wi, {
        key: `${e}:${ae.name}`,
        agentId: e,
        name: ae.name,
        content: ae.content
      })
    ) : null
  );
}
function ic({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: a,
  onSkillInstalled: i,
  agentId: s,
  agentName: l
}) {
  var T, H;
  const o = L().React, { useState: d, useMemo: c, useCallback: m, useEffect: u, useRef: p } = o, {
    Spin: v,
    Empty: g,
    Input: f,
    Button: h,
    Row: y,
    Col: E,
    Card: b,
    Tag: x,
    Typography: j,
    Descriptions: O,
    List: M,
    Modal: S,
    message: N
  } = L().antd, {
    ReloadOutlined: V,
    SearchOutlined: C,
    DownloadOutlined: I,
    ThunderboltOutlined: R,
    DeleteOutlined: W,
    PlusOutlined: _
  } = L().antdIcons || {}, { Text: $, Paragraph: z } = j, [A, P] = d(""), [Z, G] = d(!1), [B, K] = d(null), [D, ee] = d([]), [te, se] = d(!1), [ae, Y] = d(24), ie = p(0), [de, q] = d(!1), U = p(0), pe = p(null), Ee = c(
    () => {
      var F;
      return new Set(
        ((F = t.find((ue) => ue.agent_id === s)) == null ? void 0 : F.skill_names) || []
      );
    },
    [t, s]
  ), be = c(() => {
    if (!A.trim()) return e;
    const F = A.toLowerCase();
    return e.filter(
      (ue) => {
        var X, fe;
        return ue.name.toLowerCase().includes(F) || Oe(ue.name).toLowerCase().includes(F) || ((X = ue.description) == null ? void 0 : X.toLowerCase().includes(F)) || ((fe = ue.tags) == null ? void 0 : fe.some((xe) => xe.toLowerCase().includes(F)));
      }
    );
  }, [e, A]), oe = c(
    () => be.slice(0, ae),
    [be, ae]
  );
  u(() => {
    if (oe.length >= be.length) return;
    const F = pe.current;
    if (!F) return;
    const ue = () => {
      Y(
        (fe) => Math.min(fe + 24, be.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const fe = new IntersectionObserver(
        (xe) => {
          xe.some((Ae) => Ae.isIntersecting) && ue();
        },
        { rootMargin: "240px 0px" }
      );
      return fe.observe(F), () => fe.disconnect();
    }
    const X = () => {
      F.getBoundingClientRect().top <= window.innerHeight + 240 && ue();
    };
    return window.addEventListener("scroll", X, { passive: !0 }), X(), () => window.removeEventListener("scroll", X);
  }, [be.length, oe.length]);
  const Se = m((F) => {
    P(F), Y(24);
  }, []), ke = m(() => {
    const F = U.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: F, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = F);
    });
  }, []), Ie = m(async () => {
    var F;
    U.current = ((F = document.scrollingElement) == null ? void 0 : F.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      ke();
    }
  }, [a, ke]), Te = m(
    (F) => {
      const ue = [];
      for (const X of t)
        if (X.skill_names.includes(F)) {
          const fe = n.find((xe) => xe.id === X.agent_id);
          ue.push((fe == null ? void 0 : fe.name) || X.agent_name || X.agent_id);
        }
      return ue;
    },
    [t, n]
  ), we = m(
    async (F) => {
      const ue = ++ie.current;
      if (K(F), se(!1), ee(Te(F.name)), G(!0), !F.content) {
        se(!0);
        try {
          const X = await No(F.name);
          ue === ie.current && K({ ...F, content: X });
        } catch {
        } finally {
          ue === ie.current && se(!1);
        }
      }
    },
    [Te]
  );
  u(() => {
    B && ee(Te(B.name));
  }, [B, Te, t]);
  const ye = async (F) => {
    q(!0);
    try {
      await $i(s, F.name), N.success(
        `已将技能「${Oe(
          F.name
        )}」加载到当前专家「${l}」`
      ), i(F);
    } catch (ue) {
      N.error(ue.message || "加载技能失败");
    } finally {
      q(!1);
    }
  }, he = (F) => {
    if (F.protected) {
      N.warning("内置技能不可删除");
      return;
    }
    S.confirm({
      title: `确认从技能池删除「${Oe(F.name)}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        q(!0);
        try {
          await Qo(F.name), N.success(`已从技能池删除「${Oe(F.name)}」`), await Ie();
        } catch (ue) {
          N.error(ue.message || "删除失败");
        } finally {
          q(!1);
        }
      }
    });
  }, Q = (H = (T = L()).useNavigate) == null ? void 0 : H.call(T), w = (F) => {
    if (Q) return Q(F);
    window.history.pushState({}, "", F), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return o.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": Z },
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
        prefix: C ? o.createElement(C) : void 0,
        value: A,
        onChange: (F) => Se(F.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          h,
          {
            icon: V ? o.createElement(V) : void 0,
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
            icon: I ? o.createElement(I) : void 0,
            onClick: () => w("/skill-pool"),
            size: "small",
            style: Ke
          },
          "管理技能池"
        )
      )
    ),
    r ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(v, { size: "large" })
    ) : be.length === 0 ? o.createElement(g, {
      description: A ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        y,
        { gutter: [12, 12] },
        ...oe.map(
          (F) => o.createElement(
            E,
            { key: F.name, xs: 24, sm: 12, md: 12, lg: 8, xxl: 6 },
            o.createElement(
              b,
              {
                hoverable: !0,
                size: "small",
                className: "ugsci-capability-card",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => we(F)
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
                F.emoji ? o.createElement(
                  "span",
                  { className: "ugsci-capability-avatar" },
                  F.emoji
                ) : o.createElement(
                  "span",
                  { className: "ugsci-capability-avatar" },
                  "⚡"
                ),
                o.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: (ue) => {
                      ue.stopPropagation(), we(F);
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
                  Oe(F.name)
                ),
                F.protected ? o.createElement(
                  x,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              F.description ? o.createElement(
                z,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 2 }
                },
                F.description
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
                F.version_text ? o.createElement(
                  x,
                  { style: { fontSize: 10 } },
                  `v${F.version_text}`
                ) : null,
                ...(F.tags || []).slice(0, 3).map(
                  (ue, X) => o.createElement(
                    x,
                    { key: X, color: "cyan", style: { fontSize: 10 } },
                    ue
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
                    icon: _ ? o.createElement(_) : void 0,
                    disabled: de || Ee.has(F.name),
                    onClick: (ue) => {
                      ue.stopPropagation(), ye(F);
                    }
                  },
                  Ee.has(F.name) ? "已加载" : "添加到当前专家"
                ),
                o.createElement(
                  h,
                  {
                    size: "small",
                    danger: !0,
                    icon: W ? o.createElement(W) : void 0,
                    disabled: de || F.protected,
                    onClick: (ue) => {
                      ue.stopPropagation(), he(F);
                    }
                  },
                  "删除"
                )
              )
            )
          )
        ),
        // Infinite-scroll sentinel
        oe.length < be.length ? o.createElement(
          "div",
          {
            ref: pe,
            style: {
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16
            }
          },
          o.createElement(
            $,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${be.length - oe.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    B ? o.createElement(
      pn,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            B.emoji || "⚡"
          ),
          o.createElement(
            "span",
            null,
            Oe(B.name)
          )
        ),
        open: Z,
        onClose: () => {
          ie.current++, G(!1);
        },
        width: 520,
        rootClassName: "ugsci-skill-detail",
        extra: o.createElement(
          h,
          {
            type: "primary",
            size: "small",
            icon: R ? o.createElement(R) : void 0,
            onClick: () => w("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        O,
        {
          column: 1,
          bordered: !0,
          size: "small",
          labelStyle: { width: 96, whiteSpace: "nowrap" }
        },
        o.createElement(
          O.Item,
          { label: "技能名称" },
          Oe(B.name)
        ),
        o.createElement(
          O.Item,
          { label: "描述" },
          B.description || "-"
        ),
        B.version_text ? o.createElement(
          O.Item,
          { label: "版本" },
          B.version_text
        ) : null,
        o.createElement(
          O.Item,
          { label: "来源" },
          B.source || "-"
        ),
        o.createElement(
          O.Item,
          { label: "受保护" },
          B.protected ? "是（内置）" : "否"
        ),
        B.sync_status ? o.createElement(
          O.Item,
          { label: "同步状态" },
          B.sync_status
        ) : null,
        B.installed_from ? o.createElement(
          O.Item,
          { label: "安装来源" },
          B.installed_from
        ) : null
      ),
      // Tags
      B.tags && B.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          $,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...B.tags.map(
            (F, ue) => o.createElement(x, { key: ue, color: "cyan" }, F)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          $,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${D.length})`
        ),
        D.length > 0 ? o.createElement(M, {
          size: "small",
          dataSource: D,
          renderItem: (F) => o.createElement(
            M.Item,
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
              o.createElement(at, {
                name: F,
                size: 20
              }),
              o.createElement(
                $,
                { style: { fontSize: 13 } },
                F
              )
            )
          )
        }) : o.createElement(
          $,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      te ? o.createElement(v, { tip: "加载技能定义" }) : o.createElement(Wi, {
        content: B.content,
        poolName: B.name
      })
    ) : null
  );
}
function sc({
  embedded: e = !1
} = {}) {
  var $;
  const t = L().React, { useState: n, useEffect: r, useCallback: a, useMemo: i } = t, { Tabs: s, message: l } = L().antd, { ThunderboltOutlined: o, AppstoreOutlined: d } = L().antdIcons || {}, c = L(), m = c.useSelectedAgent, u = m ? m() : null, p = (u == null ? void 0 : u.id) || "default";
  r(() => {
    qn();
  }, [p]);
  const [v, g] = n([]), [f, h] = n([]), [y, E] = n([]), [b, x] = n(!0), [j, O] = n("agent-skills"), [M, S] = n(0), N = a(async () => {
    x(!0);
    try {
      const [z, A, P] = await Promise.all([
        Br(!0),
        En(),
        jo()
      ]);
      h(z), g(A), E(P);
    } catch (z) {
      l.error(z.message || "加载技能列表失败"), h([]);
    } finally {
      x(!1);
    }
  }, []);
  r(() => {
    N();
  }, [N]);
  const V = i(() => {
    const z = v.find((A) => A.id === p);
    return Lr((z == null ? void 0 : z.name) || p);
  }, [v, p]), C = a(
    (z) => {
      E(
        (A) => A.some((P) => P.agent_id === p) ? A.map((P) => P.agent_id !== p || P.skill_names.includes(z.name) ? P : {
          ...P,
          skill_names: [...P.skill_names, z.name]
        }) : [
          ...A,
          {
            agent_id: p,
            agent_name: V,
            skill_names: [z.name]
          }
        ]
      ), S((A) => A + 1);
    },
    [p, V]
  ), I = ($ = c.useNavigate) == null ? void 0 : $.call(c), R = (z) => {
    if (I) return I(z);
    window.history.pushState({}, "", z), window.dispatchEvent(new PopStateEvent("popstate"));
  }, W = [
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
      children: t.createElement(ac, {
        agentId: p,
        agentName: V,
        refreshKey: M,
        onNavigate: R
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
      children: t.createElement(ic, {
        poolSkills: f,
        workspaceSkills: y,
        agents: v,
        loading: b,
        onReload: N,
        onSkillInstalled: C,
        agentId: p,
        agentName: V
      })
    }
  ], _ = t.createElement(s, {
    items: W,
    activeKey: j,
    onChange: (z) => O(z)
  });
  return e ? _ : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Wn, {
      title: "技能",
      subtitle: `技能池共 ${f.length} 个技能 · 当前智能体：${V}`
    }),
    _
  );
}
const vr = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Zi = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Ji = /* @__PURE__ */ new Set([
  "cmg",
  "comsol",
  "tnavigator",
  "eclipse",
  "intersect",
  "visage"
]);
function Qi(e) {
  return Ti(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function oc() {
  return ge("/ugsci/engines/list");
}
async function lc(e) {
  return ge("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function cc(e, t) {
  return ge(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    {
      method: "PUT",
      body: JSON.stringify(t)
    }
  );
}
async function dc(e) {
  return ge(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function uc() {
  return ge("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function mc({
  engine: e,
  onClick: t,
  onConfigure: n
}) {
  const r = L().React, { Card: a, Tag: i, Typography: s, Button: l } = L().antd, o = e.status === "detected" ? ["success", "已检测"] : e.status === "configured" ? ["processing", "已配置"] : e.status === "error" ? ["error", "检测异常"] : e.executable_path ? ["warning", "路径无效"] : ["default", "待配置"];
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
        Ji.has(e.id) ? r.createElement("img", {
          src: Qi(e.id),
          alt: e.name
        }) : Zi[e.category] || "📦"
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
function pc() {
  const e = L().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: i,
    Empty: s,
    Button: l,
    message: o,
    Row: d,
    Col: c,
    Descriptions: m,
    Tag: u,
    Typography: p,
    Input: v,
    Select: g,
    Popconfirm: f,
    Space: h
  } = L().antd, {
    ReloadOutlined: y,
    SearchOutlined: E,
    PlusOutlined: b,
    EditOutlined: x,
    DeleteOutlined: j,
    CopyOutlined: O,
    ExperimentOutlined: M
  } = L().antdIcons || {}, { Text: S, Paragraph: N } = p, [V, C] = t([]), [I, R] = t(!0), [W, _] = t(""), [$, z] = t(!1), [A, P] = t(null), [Z, G] = t(!1), [B, K] = t(null), [D, ee] = t({}), [te, se] = t(!1), ae = r(async () => {
    R(!0);
    try {
      const oe = await oc();
      C(oe.engines || []);
    } catch (oe) {
      o.error(oe.message || "加载引擎列表失败"), C([]);
    } finally {
      R(!1);
    }
  }, []);
  n(() => {
    ae();
  }, [ae]);
  const Y = a(() => {
    if (!W.trim()) return V;
    const oe = W.toLowerCase();
    return V.filter(
      (Se) => {
        var ke;
        return Se.name.toLowerCase().includes(oe) || Se.vendor.toLowerCase().includes(oe) || Se.category.toLowerCase().includes(oe) || ((ke = Se.description) == null ? void 0 : ke.toLowerCase().includes(oe));
      }
    );
  }, [V, W]), ie = r((oe) => {
    navigator.clipboard.writeText(oe).then(() => o.success("路径已复制")).catch(() => o.error("复制失败"));
  }, []), de = r(() => {
    K(null), ee({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), G(!0);
  }, []), q = r((oe) => {
    K(oe), ee({ ...oe }), G(!0), z(!1);
  }, []), U = r(async () => {
    var oe;
    if (!((oe = D.name) != null && oe.trim())) {
      o.warning("请输入引擎名称");
      return;
    }
    se(!0);
    try {
      B ? (await cc(B.id, D), o.success("引擎已更新")) : (await lc(D), o.success("引擎已添加")), G(!1), ae();
    } catch (Se) {
      o.error(Se.message || "保存失败");
    } finally {
      se(!1);
    }
  }, [D, B, ae]), pe = r(
    async (oe) => {
      try {
        await dc(oe), o.success("引擎已删除"), z(!1), ae();
      } catch (Se) {
        o.error(Se.message || "删除失败");
      }
    },
    [ae]
  ), Ee = r(async () => {
    R(!0);
    try {
      const oe = await uc();
      C(oe.engines || []), o.success("自动检测完成");
    } catch (oe) {
      o.error(oe.message || "检测失败");
    } finally {
      R(!1);
    }
  }, []), be = r(
    (oe, Se, ke) => {
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
          oe
        ),
        ke != null && ke.select ? e.createElement(g, {
          id: `engine-${Se}`,
          value: Ie || void 0,
          onChange: (Te) => ee((we) => ({ ...we, [Se]: Te })),
          style: { width: "100%" },
          options: ke.select.options,
          allowClear: !0,
          placeholder: `选择${oe}`
        }) : ke != null && ke.textarea ? e.createElement(v.TextArea, {
          id: `engine-${Se}`,
          value: Ie,
          onChange: (Te) => ee((we) => ({
            ...we,
            [Se]: Te.target.value
          })),
          rows: 3,
          placeholder: `输入${oe}`
        }) : e.createElement(v, {
          id: `engine-${Se}`,
          value: Ie,
          onChange: (Te) => ee((we) => ({
            ...we,
            [Se]: Te.target.value
          })),
          placeholder: `输入${oe}`
        })
      );
    },
    [D]
  );
  return e.createElement(
    "div",
    {
      className: "ugsci-capability-section",
      "data-focused": $ || Z
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
      e.createElement(v, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: E ? e.createElement(E) : void 0,
        value: W,
        onChange: (oe) => _(oe.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        l,
        {
          icon: y ? e.createElement(y) : void 0,
          onClick: Ee,
          loading: I
        },
        "自动检测"
      ),
      e.createElement(
        l,
        {
          type: "primary",
          icon: b ? e.createElement(b) : void 0,
          onClick: de,
          style: Ke
        },
        "添加引擎"
      )
    ),
    // Content
    I ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(i, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : Y.length === 0 ? e.createElement(s, {
      description: W ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...Y.map(
        (oe) => e.createElement(
          c,
          {
            key: oe.id,
            xs: 24,
            sm: 12,
            md: 12,
            lg: 8,
            xxl: 6,
            style: { display: "flex" }
          },
          e.createElement(mc, {
            engine: oe,
            onConfigure: () => q(oe),
            onClick: () => {
              P(oe), z(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    A ? e.createElement(
      pn,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Ji.has(A.id) ? e.createElement("img", {
              src: Qi(A.id),
              alt: A.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Zi[A.category] || "📦"
            )
          ),
          e.createElement("span", null, A.name)
        ),
        open: $,
        onClose: () => z(!1),
        width: 520,
        extra: e.createElement(
          h,
          null,
          e.createElement(
            l,
            {
              size: "small",
              icon: x ? e.createElement(x) : void 0,
              onClick: () => q(A)
            },
            "编辑"
          ),
          A.is_default ? null : e.createElement(
            f,
            {
              title: "确认删除此引擎？",
              description: A.name,
              onConfirm: () => pe(A.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              l,
              {
                size: "small",
                danger: !0,
                icon: j ? e.createElement(j) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        m,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          m.Item,
          { label: "引擎名称" },
          A.name
        ),
        e.createElement(
          m.Item,
          { label: "厂商" },
          A.vendor || "—"
        ),
        e.createElement(
          m.Item,
          { label: "分类" },
          A.category ? vr[A.category] || A.category : "—"
        ),
        e.createElement(
          m.Item,
          { label: "状态" },
          e.createElement(
            u,
            {
              color: A.status === "detected" ? "success" : A.status === "not_found" ? "error" : "default"
            },
            A.status === "detected" ? "✅ 已检测" : A.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          m.Item,
          { label: "版本" },
          A.version || "—"
        ),
        A.executable_path ? e.createElement(
          m.Item,
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
              A.executable_path
            ),
            e.createElement(l, {
              size: "small",
              type: "text",
              icon: O ? e.createElement(O) : void 0,
              onClick: () => ie(A.executable_path)
            })
          )
        ) : null,
        A.install_dir ? e.createElement(
          m.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            A.install_dir
          )
        ) : null,
        // Display detected modules with paths
        A.modules && A.modules.length > 0 ? e.createElement(
          m.Item,
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
            ...A.modules.map(
              (oe) => e.createElement(
                "div",
                {
                  key: oe,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }
                },
                e.createElement(
                  u,
                  { color: "cyan", style: { fontSize: 11 } },
                  oe
                ),
                A.module_paths && A.module_paths[oe] ? e.createElement(
                  "code",
                  {
                    style: { fontSize: 11, wordBreak: "break-all" }
                  },
                  A.module_paths[oe]
                ) : null
              )
            )
          )
        ) : null,
        A.license_server ? e.createElement(
          m.Item,
          { label: "许可证服务器" },
          A.license_server
        ) : null,
        e.createElement(
          m.Item,
          { label: "描述" },
          A.description || "—"
        )
      ),
      // Invocation hint
      A.invocation_hint ? e.createElement(
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
          S,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          A.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        A.is_default ? e.createElement(u, { color: "blue" }, "默认引擎") : A.is_custom ? e.createElement(u, { color: "purple" }, "自定义引擎") : null
      )
    ) : null,
    // Add/Edit configuration
    e.createElement(
      pn,
      {
        title: B ? `配置 ${B.name}` : "添加引擎",
        open: Z,
        onOk: U,
        onCancel: () => G(!1),
        okText: B ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: te,
        width: 560
      },
      e.createElement(
        "div",
        null,
        be("引擎名称 *", "name"),
        be("可执行文件路径", "executable_path"),
        be("安装目录", "install_dir"),
        be("许可证服务器", "license_server"),
        e.createElement(
          "details",
          { className: "ugsci-capability-advanced" },
          e.createElement("summary", null, "更多设置"),
          be("厂商", "vendor"),
          be("版本", "version"),
          be("分类", "category", {
            select: {
              options: Object.entries(vr).map(
                ([oe, Se]) => ({
                  label: Se,
                  value: oe
                })
              )
            }
          }),
          be("描述", "description", { textarea: !0 }),
          be("调用方式提示", "invocation_hint", { textarea: !0 })
        )
      )
    )
  );
}
async function gc(e = !1) {
  const t = await ge(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function fc(e = !1) {
  return ge(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function yc() {
  return ge("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function hc(e) {
  return ge(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
function Er(e) {
  return ge(
    `/ugsci/domain-engines/${encodeURIComponent(e)}/runtime`,
    { bypassCache: !0 }
  );
}
function bc(e) {
  return ge(
    `/ugsci/domain-engines/${encodeURIComponent(e)}/install`,
    { method: "POST" }
  );
}
function vc(e) {
  return ge(
    `/ugsci/domain-engines/install-tasks/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function Ec(e, t = !1) {
  const n = await ge("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function wc(e, t = !1) {
  const n = /* @__PURE__ */ new Map(), r = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let a;
  try {
    a = await ge("/mcp", r) || [];
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
      const l = await ge(
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
function Ua(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function Da(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function xc(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, a = e.dependency_status;
  let i, s = "", l, o;
  if (r.provider.kind === "driver")
    a.overall === "unavailable" ? i = "needs_install" : a.overall !== "available" ? i = "unknown" : i = Da(t), l = (t == null ? void 0 : t.toolCount) ?? 0, o = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const d = Ua(a), c = [
      ...new Set(r.operations.flatMap((g) => g.tool_names))
    ], m = c.filter(
      (g) => n.has(g)
    ), u = m.filter(
      (g) => {
        var f;
        return (f = n.get(g)) == null ? void 0 : f.enabled;
      }
    );
    d !== "available" ? i = d : m.length !== c.length ? i = "error" : u.length === 0 ? i = "unconfigured" : u.length < c.length ? i = "partial" : i = "available", l = u.length, o = null;
    const p = c.filter((g) => !n.has(g)), v = m.filter(
      (g) => {
        var f;
        return !((f = n.get(g)) != null && f.enabled);
      }
    );
    d === "available" && (s = p.length ? `工具未完整注册：${p.join("、")}` : v.length ? `当前专家已启用 ${u.length}/${c.length} 个工具；未启用：${v.join("、")}` : c.length ? `依赖检测通过，当前专家已启用全部 ${c.length} 个工具。` : "该能力未声明可调用工具。");
  } else r.source === "mcp" ? (i = Da(t), l = (t == null ? void 0 : t.toolCount) ?? 0, o = (t == null ? void 0 : t.key) ?? r.provider.id) : (i = Ua(a), l = 0, o = null, s = "依据运行依赖检测结果判断，尚未校验当前专家的调用工具。");
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
}, Me = (e, t, n, r) => ({ inputs: e, outputs: t, description: n, limitations: r }), Ki = {
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
function Xi(e) {
  const t = Ki[e.id];
  return {
    description: (t == null ? void 0 : t.description) || e.description || "暂无说明",
    inputs: (t == null ? void 0 : t.inputs) || "输入信息未提供",
    outputs: (t == null ? void 0 : t.outputs) || "输出信息未提供",
    limitations: t == null ? void 0 : t.limitations
  };
}
function Yi({
  operations: e
}) {
  const t = L().React, { Tag: n, Typography: r } = L().antd, { Text: a } = r;
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 8, minWidth: 0 } },
    ...e.map((i) => {
      const s = Xi(i);
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
        Ki[i.id] ? null : t.createElement(
          n,
          { style: { marginTop: 4 } },
          "详细说明待补充"
        )
      );
    })
  );
}
const Sc = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  reservoir_engineering: "🛢️",
  underground_gas_storage: "🛢️",
  gas_storage: "🛢️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
};
function kc({
  view: e,
  onDetails: t,
  onInstall: n,
  onConfigure: r,
  onRefresh: a,
  installTask: i
}) {
  const s = L().React, { Card: l, Tag: o, Typography: d, Button: c, Modal: m, Tooltip: u } = L().antd, { Text: p } = d, [v, g] = s.useState(!1), f = e.definition, h = on[f.id], y = (i == null ? void 0 : i.status) === "queued" || (i == null ? void 0 : i.status) === "running", E = f.id !== "neqsim" && e.effectiveStatus === "unavailable" && f.dependencies.length > 0 && f.dependencies.every((x) => !/(three\.js|java|neqsim)/i.test(x)), b = y ? { label: "查看安装进度", action: n, disabled: !1 } : f.id === "neqsim" && e.effectiveStatus === "needs_install" ? {
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
        Sc[f.domain] || "📦"
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
            u,
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
        b ? s.createElement(
          c,
          {
            size: "small",
            type: "primary",
            disabled: b.disabled || !b.action,
            loading: !1,
            "aria-label": b.label,
            onClick: b.action
          },
          b.label
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
      m,
      {
        title: `${f.name} · 函数说明`,
        open: v,
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
      s.createElement(Yi, { operations: f.operations })
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
function _c({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: a,
  onNavigateToSkills: i,
  onInstallNeqsim: s,
  neqsimInstallState: l
}) {
  const o = L().React, { Descriptions: d, Tag: c, Typography: m, Button: u, Divider: p } = L().antd, { Text: v, Paragraph: g } = m;
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
      o.createElement(v, { strong: !0 }, "领域操作")
    ),
    o.createElement(Yi, { operations: f.operations }),
    o.createElement(
      "div",
      { style: { marginTop: 16, display: "flex", gap: 4, flexWrap: "wrap" } },
      ...f.tags.map(
        (b) => o.createElement(c, { key: b, color: "cyan" }, b)
      )
    ),
    // Dependencies
    o.createElement(p, null),
    o.createElement(v, { strong: !0 }, "实现与依赖"),
    h && h.dependencies.length > 0 ? o.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...h.dependencies.map(
        (b) => o.createElement(
          "div",
          {
            key: b.name,
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
              v,
              { style: { fontSize: 13 } },
              b.name
            ),
            o.createElement(
              c,
              {
                color: xr[b.status] || "default",
                style: { fontSize: 11 }
              },
              wr[b.status] || b.status
            )
          ),
          b.status !== "available" && b.reason ? o.createElement(
            v,
            {
              type: "secondary",
              style: { display: "block", fontSize: 12, marginTop: 4 }
            },
            b.reason
          ) : null,
          b.status !== "available" && b.install_hint ? o.createElement(
            v,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${b.install_hint}`
          ) : null,
          b.status !== "available" && b.enable_hint ? o.createElement(
            v,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${b.enable_hint}`
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
    o.createElement(v, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      f.id === "neqsim" && e.effectiveStatus === "needs_install" ? o.createElement(
        u,
        {
          size: "small",
          type: "primary",
          loading: (l == null ? void 0 : l.status) === "queued" || (l == null ? void 0 : l.status) === "running",
          onClick: s
        },
        (l == null ? void 0 : l.status) === "running" ? `${l.message} (${l.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      f.provider.kind === "driver" ? o.createElement(
        u,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : f.source === "library" ? o.createElement(
        u,
        { size: "small", onClick: i },
        "查看相关技能"
      ) : o.createElement(
        u,
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
function Cc({
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
  const c = L().React, { Modal: m, Button: u, Typography: p, Alert: v, Progress: g, Tag: f, Space: h } = L().antd, { Text: y, Paragraph: E } = p, b = c.useRef(0), x = c.useRef(!0), j = `${e}:${(n == null ? void 0 : n.engine_id) || ""}`, O = c.useRef(j);
  O.current = j;
  const [M, S] = c.useState(!1), [N, V] = c.useState(""), [C, I] = c.useState(0), R = (r == null ? void 0 : r.status) === "queued" || (r == null ? void 0 : r.status) === "running";
  c.useEffect(() => {
    S(!1), V("");
  }, [j]), c.useEffect(() => (x.current = !0, () => {
    x.current = !1, b.current += 1;
  }), []), c.useEffect(() => {
    if (!e || !R || !r) return;
    const P = ++b.current;
    let Z = !1;
    return (async () => {
      for (; !Z && P === b.current; ) {
        if (await new Promise((B) => setTimeout(B, 1e3)), Z || P !== b.current) return;
        try {
          const B = await vc(r.id);
          if (Z || P !== b.current) return;
          if (V(""), s(B), B.status === "completed") {
            o();
            return;
          }
          if (B.status === "failed") return;
        } catch (B) {
          if (Z || P !== b.current) return;
          const K = B instanceof Error ? B.message : "连接安装任务失败";
          if (/HTTP 404|not found|未找到/i.test(K))
            try {
              const D = await Er(r.engine_id);
              if (Z || P !== b.current) return;
              D.state === "ready" ? (s({
                ...r,
                status: "completed",
                progress: 100,
                message: "依赖已就绪，已恢复安装状态。",
                error: ""
              }), o()) : D.active_task ? (s(D.active_task), I((ee) => ee + 1)) : s({
                ...r,
                status: "failed",
                error: "未找到此安装任务，且依赖尚未就绪，请重新发起安装。"
              });
            } catch {
              if (Z || P !== b.current) return;
              V("暂时无法确认安装结果，请重新检测以恢复进度。");
            }
          else
            V(
              `连接安装任务时遇到问题。安装可能仍在后台继续，请重新检测以恢复进度。（${K}）`
            );
          return;
        }
      }
    })(), () => {
      Z = !0, b.current += 1;
    };
  }, [e, R, r == null ? void 0 : r.id, C, s, o]);
  const W = async () => {
    if (!(n != null && n.installable) || M || R) return;
    const P = O.current;
    S(!0);
    try {
      const Z = await bc(n.engine_id);
      if (!x.current || O.current !== P) return;
      s(Z), Z.status === "completed" && o();
    } catch (Z) {
      if (!x.current || O.current !== P) return;
      l(Z instanceof Error ? Z.message : "无法开始安装，请重试");
    } finally {
      x.current && O.current === P && S(!1);
    }
  }, _ = !!(n != null && n.installable) && !R && (r == null ? void 0 : r.status) !== "completed", $ = (r == null ? void 0 : r.status) === "completed", z = (r == null ? void 0 : r.status) === "failed", A = $ ? c.createElement(v, {
    type: "success",
    showIcon: !0,
    message: "安装完成",
    description: (r == null ? void 0 : r.message) || "运行环境安装完成。请关闭弹窗查看刷新后的工具状态。"
  }) : z ? c.createElement(v, {
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
        { color: R ? "processing" : "default" },
        r.status === "queued" ? "排队中" : r.status === "running" ? "安装中" : r.status
      ),
      c.createElement(y, null, r.message || "正在准备安装…")
    ),
    R ? c.createElement(
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
    r.warning ? c.createElement(v, {
      style: { marginTop: 10 },
      type: "warning",
      showIcon: !0,
      message: r.warning
    }) : null
  ) : null;
  return c.createElement(
    m,
    {
      title: `${t} · 运行环境`,
      open: e,
      onCancel: i,
      width: "min(520px, calc(100vw - 32px))",
      destroyOnHidden: !1,
      footer: $ ? c.createElement(
        u,
        {
          type: "primary",
          onClick: i,
          "aria-label": "关闭安装完成提示"
        },
        "关闭"
      ) : z ? c.createElement(
        h,
        null,
        c.createElement(u, { onClick: i }, "关闭"),
        c.createElement(
          u,
          {
            type: "primary",
            onClick: W,
            disabled: !(n != null && n.installable),
            loading: M,
            "aria-label": "重试安装"
          },
          "重试安装"
        )
      ) : r ? c.createElement(
        u,
        { onClick: i, "aria-label": "关闭安装进度" },
        "后台继续，关闭窗口"
      ) : n && !n.installable && n.state !== "ready" ? c.createElement(
        c.Fragment,
        null,
        c.createElement(u, { onClick: i }, "关闭"),
        c.createElement(
          u,
          { onClick: d, "aria-label": "前往工具或技能管理入口" },
          "前往管理入口"
        )
      ) : (n == null ? void 0 : n.state) === "ready" ? c.createElement(
        u,
        { type: "primary", onClick: i },
        "关闭"
      ) : c.createElement(
        h,
        null,
        c.createElement(u, { onClick: i }, "取消"),
        c.createElement(
          u,
          {
            type: "primary",
            disabled: !_ || M,
            loading: M,
            onClick: W,
            "aria-label": "开始安装运行环境"
          },
          "开始安装"
        )
      )
    },
    a ? c.createElement(v, {
      type: "error",
      showIcon: !0,
      message: "运行环境操作未完成",
      description: a,
      action: c.createElement(
        u,
        {
          size: "small",
          onClick: () => l(),
          "aria-label": "重新检测运行环境"
        },
        "重新检测"
      )
    }) : null,
    N ? c.createElement(v, {
      style: { marginTop: 12 },
      type: "warning",
      showIcon: !0,
      message: N,
      action: c.createElement(
        u,
        {
          size: "small",
          onClick: () => {
            V(""), I((P) => P + 1), l();
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
        n.state === "ready" ? "运行依赖已就绪。你可以关闭窗口并刷新状态。" : n.installable ? "将把以下依赖安装到 QwenPaw 软件使用的 Python 环境中。安装耗时和下载量取决于所需依赖。" : n.message || "此运行环境当前无法由软件安装。"
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
      ) : c.createElement(v, {
        type: n.installable ? "info" : "warning",
        showIcon: !0,
        message: n.message || "没有可列出的安装依赖。"
      }),
      $ || n.state === "ready" ? c.createElement(v, {
        style: { marginTop: 12 },
        type: "success",
        showIcon: !0,
        message: "运行环境已就绪"
      }) : null,
      !n.installable && n.state !== "ready" ? c.createElement(v, {
        style: { marginTop: 12 },
        type: "warning",
        showIcon: !0,
        message: n.message || "当前环境不支持自动安装，请前往工具或技能管理入口处理。"
      }) : null
    ) : null,
    A
  );
}
function Tc(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function Mc({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var he, Q;
  const r = L().React, { useState: a, useEffect: i, useCallback: s, useMemo: l, useRef: o } = r, {
    Spin: d,
    Empty: c,
    Button: m,
    message: u,
    Row: p,
    Col: v,
    Input: g
  } = L().antd, { ReloadOutlined: f, SearchOutlined: h } = L().antdIcons || {}, y = (Q = (he = L()).useSelectedAgent) == null ? void 0 : Q.call(he), E = (y == null ? void 0 : y.id) || "default", [b, x] = a([]), [j, O] = a(!0), [M, S] = a(""), [N, V] = a(!1), [C, I] = a(null), [R, W] = a({ general: !0 }), [_, $] = a(null), [z, A] = a(null), [P, Z] = a(
    null
  ), [G, B] = a(
    null
  ), [K, D] = a(""), [ee, te] = a(!1), se = o(E);
  se.current = E;
  const ae = o(C);
  ae.current = C;
  const Y = o(0), ie = o(0);
  i(
    () => () => {
      Y.current += 1, ie.current += 1;
    },
    []
  );
  const de = s(async (w = !1, T = !1) => {
    var X, fe;
    T || O(!0);
    const H = T && typeof window < "u" ? {
      x: window.scrollX,
      y: window.scrollY,
      drawerBody: typeof document < "u" ? document.querySelector(
        ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
      ) : null,
      drawerTop: typeof document < "u" && ((X = document.querySelector(
        ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
      )) == null ? void 0 : X.scrollTop) || 0
    } : null, F = () => {
      if (!H || typeof window > "u") return;
      const xe = () => {
        var Ae;
        window.scrollTo(H.x, H.y), (Ae = H.drawerBody) != null && Ae.isConnected && (H.drawerBody.scrollTop = H.drawerTop);
      };
      typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(xe) : xe();
    }, ue = se.current;
    try {
      const [xe, Ae, Fe] = await Promise.all([
        gc(w),
        wc(ue, w),
        Ec(ue, w)
      ]);
      if (ue !== se.current) return;
      const Ge = [];
      for (const Ye of xe)
        try {
          let J = null;
          if (Ye.engine.provider.kind === "driver") {
            const ve = Ye.engine.provider.id;
            J = Ae.get(ve) || null;
          }
          Ge.push(xc(Ye, J, Fe));
        } catch {
        }
      x(Ge);
      const it = (fe = ae.current) == null ? void 0 : fe.definition.id;
      if (it) {
        const Ye = Ge.find((J) => J.definition.id === it);
        Ye && (ae.current = Ye, I(Ye));
      }
      F();
    } catch (xe) {
      const Ae = xe instanceof Error ? xe.message : "加载领域引擎失败";
      u.error(Ae), T || x([]);
    } finally {
      T || O(!1);
    }
  }, []);
  i(() => {
    de();
  }, [E, de]);
  const q = l(() => {
    if (!M.trim()) return b;
    const w = M.trim().toLowerCase();
    return b.filter(
      (T) => {
        var H, F, ue;
        return Sr(T.definition.domain, T.definition.id).title.toLowerCase().includes(w) || T.definition.name.toLowerCase().includes(w) || T.definition.domain.toLowerCase().includes(w) || T.definition.description.toLowerCase().includes(w) || [
          ((H = on[T.definition.id]) == null ? void 0 : H.description) || "",
          ((F = on[T.definition.id]) == null ? void 0 : F.inputs) || "",
          ((ue = on[T.definition.id]) == null ? void 0 : ue.outputs) || ""
        ].some((X) => X.toLowerCase().includes(w)) || T.definition.tags.some((X) => X.toLowerCase().includes(w)) || T.definition.operations.some((X) => {
          const fe = Xi(X);
          return [
            X.name,
            X.id,
            X.description,
            ...X.tool_names,
            fe.description,
            fe.inputs,
            fe.outputs,
            fe.limitations || ""
          ].some((xe) => xe.toLowerCase().includes(w));
        });
      }
    );
  }, [b, M]), U = l(
    () => Ln.map((w) => ({
      ...w,
      views: q.filter(
        (T) => Sr(T.definition.domain, T.definition.id).key === w.key
      )
    })).filter((w) => w.views.length > 0),
    [q]
  ), pe = s(() => {
    de(!0);
  }, [de]), Ee = s((w) => {
    ae.current = w, I(w), V(!0);
  }, []), be = s(() => {
    V(!1), e == null || e();
  }, [e]), oe = s(
    (w) => {
      V(!1), t == null || t(w);
    },
    [t]
  ), Se = s(() => {
    V(!1), n == null || n();
  }, [n]), ke = s(async () => {
    if ((_ == null ? void 0 : _.status) === "queued" || (_ == null ? void 0 : _.status) === "running")
      return;
    const w = ++Y.current, T = () => w === Y.current;
    try {
      let H = await yc();
      if (!T()) return;
      for ($(H); H.status === "queued" || H.status === "running"; ) {
        if (await new Promise((F) => setTimeout(F, 1e3)), !T()) return;
        try {
          H = await hc(H.id);
        } catch (F) {
          if (!Tc(F)) throw F;
          const ue = await fc(!0);
          if (!T()) return;
          ue.ready ? H = {
            ...H,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: ue,
            recovered: !0
          } : H = {
            ...H,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: ue,
            recovered: !0
          };
        }
        if (!T()) return;
        $(H);
      }
      if (!T()) return;
      H.status === "completed" ? (H.warning ? u.warning(H.warning) : u.success("NeqSim 运行环境已安装并启用"), await de(!0, !0)) : u.error(H.error || "NeqSim 安装失败");
    } catch (H) {
      if (!T()) return;
      u.error(H instanceof Error ? H.message : "NeqSim 安装失败");
    }
  }, [de, _]), Ie = s(
    async (w) => {
      if (w.definition.id === "neqsim") {
        (_ == null ? void 0 : _.status) === "queued" || (_ == null ? void 0 : _.status) === "running" ? (ae.current = w, I(w), V(!0)) : ke();
        return;
      }
      A(w), Z(null), B(null), D(""), te(!0);
      const T = ++ie.current;
      try {
        const H = await Er(w.definition.id);
        if (T !== ie.current) return;
        Z(H), B(H.active_task);
      } catch (H) {
        if (T !== ie.current) return;
        D(
          H instanceof Error ? H.message : "读取运行环境失败"
        );
      }
    },
    [ke, _]
  ), Te = s(
    async (w) => {
      if (w) {
        D(w);
        return;
      }
      if (!z) return;
      D("");
      const T = ++ie.current;
      try {
        const H = await Er(
          z.definition.id
        );
        if (T !== ie.current) return;
        Z(H), B(H.active_task);
      } catch (H) {
        if (T !== ie.current) return;
        D(
          H instanceof Error ? H.message : "读取运行环境失败"
        );
      }
    },
    [z]
  ), we = s(() => {
    de(!0, !0);
  }, [de]), ye = s(
    (w) => {
      w.definition.provider.kind === "driver" || w.definition.source === "mcp" ? be() : w.definition.source === "library" || w.definition.provider.kind === "skill" ? Se() : oe("builtin");
    },
    [be, Se, oe]
  );
  return r.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": N },
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
        value: M,
        onChange: (w) => {
          const T = w.target.value;
          S(T), W(T.trim() ? {} : { general: !0 });
        },
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        m,
        {
          icon: f ? r.createElement(f) : void 0,
          onClick: pe,
          loading: j
        },
        "刷新"
      )
    ),
    // Content
    j ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(d, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : q.length === 0 ? r.createElement(c, {
      description: M ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...U.map((w) => {
        const T = !!R[w.key];
        return r.createElement(
          "div",
          { key: w.key, style: { marginBottom: 20 } },
          r.createElement(
            m,
            {
              type: "text",
              onClick: () => W((H) => ({
                ...H,
                [w.key]: !H[w.key]
              })),
              "aria-expanded": !T,
              style: {
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 8,
                paddingInline: 0
              }
            },
            `${T ? "▸" : "▾"} ${w.title} (${w.views.length})`
          ),
          T ? null : r.createElement(
            p,
            { gutter: [12, 12], align: "top" },
            ...w.views.map(
              (H) => r.createElement(
                v,
                {
                  key: H.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 12,
                  lg: 12,
                  style: { display: "flex", minWidth: 0 }
                },
                r.createElement(kc, {
                  view: H,
                  onDetails: () => Ee(H),
                  onInstall: () => void Ie(H),
                  onConfigure: () => ye(H),
                  onRefresh: () => void de(!0),
                  installTask: H.definition.id === "neqsim" ? _ ? {
                    id: _.id,
                    engine_id: "neqsim",
                    status: _.status,
                    progress: _.progress,
                    message: _.message,
                    error: _.error,
                    warning: _.warning
                  } : null : (z == null ? void 0 : z.definition.id) === H.definition.id ? G : null
                })
              )
            )
          )
        );
      })
    ),
    // Detail drawer
    r.createElement(_c, {
      view: C,
      open: N,
      onClose: () => V(!1),
      onNavigateToMcp: be,
      onNavigateToTools: oe,
      onNavigateToSkills: Se,
      onInstallNeqsim: ke,
      neqsimInstallState: _
    }),
    r.createElement(Cc, {
      open: ee,
      engineName: (z == null ? void 0 : z.definition.name) || "领域引擎",
      plan: P,
      task: G,
      error: K,
      onClose: () => {
        ie.current += 1, te(!1);
      },
      onTaskChange: B,
      onRetry: Te,
      onCompleted: we,
      onManage: () => {
        ie.current += 1, te(!1), z && ye(z);
      }
    })
  );
}
const Ic = sc, es = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function Ac(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && es.has(t) ? t : e;
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
  const t = L().React, { useEffect: n, useState: r } = t, { Alert: a, Spin: i } = L().antd, [s, l] = r(null), [o, d] = r("");
  if (n(() => {
    let m = !0;
    const u = L().loadBuiltinPage;
    return l(null), u ? (d(""), u(e).then((p) => {
      m && l(() => p);
    }).catch((p) => {
      m && d(
        p instanceof Error ? p.message : "加载原生管理页面失败"
      );
    }), () => {
      m = !1;
    }) : (d("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      m = !1;
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
function $c({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const n = L().React, { Tabs: r } = L().antd;
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
function zc({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  const r = L().React, { Tabs: a } = L().antd;
  return r.createElement(a, {
    defaultActiveKey: "simulation",
    className: "ugsci-engine-tabs",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: r.createElement(pc)
      },
      {
        key: "domain",
        label: "领域计算",
        children: r.createElement(
          Mc,
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
function ts({
  initialTab: e = "engines"
} = {}) {
  var b, x, j, O;
  const t = L().React, { useEffect: n, useState: r } = t, { Tabs: a, Select: i } = L().antd, { RocketOutlined: s, ToolOutlined: l, ThunderboltOutlined: o } = L().antdIcons || {}, d = (x = (b = L()).useSelectedAgent) == null ? void 0 : x.call(b), c = (O = (j = L()).useAgentDisplayName) == null ? void 0 : O.call(j), m = (d == null ? void 0 : d.id) || "default", [u, p] = r([]);
  n(() => {
    let M = !0;
    return En().then((S) => {
      M && p(S);
    }).catch(() => {
    }), () => {
      M = !1;
    };
  }, []);
  const [v, g] = r(
    () => Ac(e)
  ), [f, h] = r("mcp");
  n(() => {
    try {
      const M = new URLSearchParams(window.location.search).get("tab");
      M && !es.has(M) && Va(v);
    } catch {
    }
  }, [v]);
  const y = (M) => {
    g(M), Va(M);
  }, E = (M, S) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    S ? t.createElement(S, { style: { fontSize: 14 } }) : null,
    M
  );
  return t.createElement(
    "div",
    { className: "ugsci-capabilities" },
    t.createElement("style", null, rc),
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
        value: m,
        style: { minWidth: 180, maxWidth: "100%" },
        options: u.length ? u.map((M) => ({
          value: M.id,
          label: (c == null ? void 0 : c(M)) || Lr(M.name) || M.id
        })) : [
          {
            value: m,
            label: (c == null ? void 0 : c({ id: m, name: "" })) || m
          }
        ],
        onChange: (M) => {
          var S, N;
          return (N = (S = L()).setSelectedAgent) == null ? void 0 : N.call(S, M);
        }
      })
    ),
    t.createElement(a, {
      activeKey: v,
      onChange: (M) => y(M),
      items: [
        {
          key: "engines",
          label: E("计算引擎", s),
          children: t.createElement(
            zc,
            {
              onNavigateToMcp: () => {
                h("mcp"), y("tools");
              },
              onNavigateToTools: (M) => {
                h(M || "mcp"), y("tools");
              },
              onNavigateToSkills: () => y("skills")
            }
          )
        },
        {
          key: "tools",
          label: E("工具", l),
          children: t.createElement($c, {
            activeSubTab: f,
            onSubTabChange: h
          })
        },
        {
          key: "skills",
          label: E("技能", o),
          children: t.createElement(Ic, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const ns = ts;
function Rc() {
  return L().React.createElement(ns, {
    initialTab: "tools"
  });
}
function Lc() {
  return L().React.createElement(ns, {
    initialTab: "skills"
  });
}
function xt(e) {
  if (e)
    try {
      const t = new URL(e);
      if (t.username || t.password) return;
      if (t.protocol === "https:" || t.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(t.hostname))
        return t.href;
    } catch {
    }
}
function Pc(e, t = !1) {
  const n = String(e || "").trim().toLowerCase().replace(/[-_]/g, "");
  if (n === "sse") return "sse";
  if (n === "stdio") return "stdio";
  if (n === "streamablehttp" || n === "http" || !n && t)
    return "streamable_http";
  if (!n) return "stdio";
  throw new Error("不支持的 MCP 连接方式，请检查目录配置");
}
function Oc(e) {
  return [
    ...new Set(
      [
        ...JSON.stringify(e).matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)
      ].map((t) => t[1])
    )
  ];
}
function Nc(e, t) {
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
function jc(e, t = Date.now, n = 6e4) {
  const r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
  function s(l, o, d) {
    const c = a.get(l);
    if (c)
      return !o || c.refresh ? c.promise : c.promise.then(
        () => s(l, !0, d),
        () => s(l, !0, d)
      );
    let m = !1;
    const u = Promise.resolve().then(async () => {
      const p = await e(l, o);
      if (!p.ok)
        throw new Error(`OSS fetch failed (${p.status}): ${l}`);
      const v = await p.text(), g = JSON.parse(v), f = r.get(l);
      if (r.set(l, { value: g, text: v, at: t() }), m = !o && p.headers.get("X-QwenPaw-Cache") === "stale", d && (f == null ? void 0 : f.text) !== v)
        for (const h of i) h();
      return g;
    }).catch((p) => {
      const v = r.get(l);
      throw v && (v.at = t() - n + Math.min(15e3, n)), p;
    }).finally(() => {
      var p;
      ((p = a.get(l)) == null ? void 0 : p.promise) === u && a.delete(l), m && s(l, !0, !0).catch(() => {
      });
    });
    return a.set(l, { promise: u, refresh: o }), u;
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
const qa = {
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
}, Pn = "ugsci.market.githubSources", Fa = "https://github.com/anthropics/skills/tree/main/skills", rs = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Bc = `${rs}/skills`;
function Hc(e) {
  const t = e.replace(/^\/+/, "");
  return Ti(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function gn(e, t = !1) {
  const n = e.replace(/^\/+/, "");
  return ut(
    `/plugins/oss-proxy?path=${encodeURIComponent(n)}${t ? "&refresh=true" : ""}`,
    { cache: t ? "no-store" : "no-cache" }
  );
}
const as = jc(gn), Uc = as.subscribe;
async function Vr(e, t = !1) {
  const n = e.replace(/^\/+/, "");
  if (/^(skills|mcp|agents)\/manifest\.json$/.test(n))
    return as.get(n, t);
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
function Dc(e) {
  var i, s, l, o;
  const t = {}, n = e.config || {};
  for (const d of /* @__PURE__ */ new Set([
    ...e.env || [],
    ...Oc(n)
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
    iconUrl: e.icon_url ? Hc(e.icon_url) : void 0,
    category: e.category ? Ut(e.category) : "",
    description: e.description,
    transport: Pc(
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
const is = "ugsci.market.mcpSources", ss = "ugsci.market.expertSources";
function os(e, t) {
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
function ls(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Vc() {
  return os(is, "mcp");
}
function _n(e) {
  ls(is, e);
}
function qc() {
  return os(ss, "expert");
}
function Cn(e) {
  ls(ss, e);
}
function cs(e) {
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
function ds(e, t, n, r = "github") {
  return r === "oss" ? `oss:${e}/${n || "/"}` : `${r}:${e}/${t}:${n || "/"}`;
}
function Fc(e) {
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
function Gc() {
  try {
    const e = localStorage.getItem(Pn);
    if (!e) {
      const r = [], a = cs(Fa);
      return a && r.push({
        id: ds(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: Fa,
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
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === Bc)
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
function Wc(e) {
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
async function Zc(e) {
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
      const c = e.skillsPath ? e.skillsPath + "/" : "", m = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${c}${d.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${c}${d.name}/SKILL.md`, u = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${c}${d.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${c}${d.name}`, p = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: d.name,
        description: "",
        source_url: u,
        html_url: u,
        version: null,
        author: null
      };
      try {
        const v = {};
        t && e.accessToken && (v.Authorization = `token ${e.accessToken}`);
        const g = await fetch(m, {
          headers: v
        });
        if (!g.ok) return p;
        const f = await g.text(), h = Wc(f);
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
async function Jc(e) {
  const t = Fc(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: n, prefix: r } = t, a = r.split("/").map(encodeURIComponent).join("/"), i = await gn(`${a}/manifest.json`);
  if (!i.ok)
    throw new Error(`无法获取技能列表: manifest.json (${i.status})`);
  const s = await i.json(), l = [];
  if (s && s.tag_groups && typeof s.tag_groups == "object")
    for (const [c, m] of Object.entries(s.tag_groups))
      Array.isArray(m) && l.push({
        id: c,
        label: Ut(c),
        tags: m
      });
  const o = [];
  function d(c, m) {
    for (const u of c) {
      if (u.type === "collection" && Array.isArray(u.children)) {
        d(u.children, u.name);
        continue;
      }
      const p = u.path || u.name || "";
      if (!p) continue;
      const v = p.split("/").map(encodeURIComponent).join("/"), g = `${n}/${a}/${v}`;
      let f = null;
      if (u.metadata) {
        const y = u.metadata.match(/version:\s*"?([\d.]+)"?/);
        y && (f = y[1]);
      }
      const h = m ? `${e.label}/${m}` : e.label;
      o.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: h,
        name: u.name || p.split("/").pop() || p,
        description: u.description || "",
        source_url: g,
        html_url: g,
        version: f,
        author: null,
        tag: u.tag || void 0,
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
async function Qc(e = !1) {
  const t = await Vr("mcp/manifest.json", e), n = [], r = {};
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
    for (const [m, u] of Object.entries(r))
      if (u.some((p) => l.includes(p))) {
        s = m;
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
async function Kc(e = !1) {
  const t = await Vr("skills/manifest.json", e), n = [], r = /* @__PURE__ */ new Set();
  function a(i, s) {
    for (const l of i) {
      if ((l == null ? void 0 : l.type) === "collection" && Array.isArray(l.children)) {
        a(l.children, l.name || s);
        continue;
      }
      const o = String((l == null ? void 0 : l.path) || (l == null ? void 0 : l.name) || "").trim();
      if (!o) continue;
      const d = o.split("/").map(encodeURIComponent).join("/"), c = `${rs}/skills/${d}`, m = typeof l.tag == "string" && l.tag.trim() ? l.tag.trim() : void 0;
      m && r.add(m);
      let u = null;
      if (typeof l.metadata == "string") {
        const p = l.metadata.match(/version:\s*"?([\d.]+)"?/);
        p && (u = p[1]);
      }
      n.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: s ? `UGSci/${s}` : "UGSci",
        name: l.name || o.split("/").pop() || o,
        description: l.description || "",
        source_url: c,
        html_url: c,
        version: u,
        author: null,
        tag: m,
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
async function us(e = !1) {
  const t = await Vr("agents/manifest.json", e), n = [], r = {};
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
      drivers: i.drivers,
      category: s
    };
  }), categories: n };
}
async function Xc(e) {
  const t = e.filter((s) => s.enabled), n = await Promise.all(
    t.map(async (s) => {
      try {
        if (s.platform === "oss") {
          const { skills: l, categories: o } = await Jc(s);
          return {
            skills: l,
            categories: o,
            error: null,
            label: s.label
          };
        } else
          return {
            skills: await Zc(s),
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
function Yc({
  open: e,
  onClose: t,
  sources: n,
  onChange: r
}) {
  const a = L().React, { useState: i } = a, {
    Modal: s,
    Input: l,
    Button: o,
    List: d,
    Tag: c,
    Switch: m,
    Typography: u,
    Tooltip: p,
    message: v
  } = L().antd, { PlusOutlined: g, DeleteOutlined: f, LinkOutlined: h, GithubOutlined: y } = L().antdIcons || {}, { Text: E } = u, [b, x] = i(""), [j, O] = i(""), M = () => {
    const C = b.trim();
    if (!C) return;
    const I = cs(C);
    if (!I) {
      v.error(
        "无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接"
      );
      return;
    }
    const R = ds(
      I.owner,
      I.repo,
      I.skillsPath,
      I.platform
    );
    if (n.some(($) => $.id === R)) {
      v.warning("该源已存在");
      return;
    }
    const W = {
      id: R,
      url: C,
      label: I.label,
      owner: I.owner,
      repo: I.repo,
      ref: I.ref,
      skillsPath: I.skillsPath,
      enabled: !0,
      platform: I.platform,
      accessToken: j.trim() || void 0
    }, _ = [...n, W];
    Tn(_), r(_), x(""), O(""), v.success(`已添加源: ${I.label}`);
  }, S = (C, I) => {
    const R = n.map((W) => W.id === C ? { ...W, enabled: I } : W);
    Tn(R), r(R);
  }, N = (C, I) => {
    const R = n.map(
      (W) => W.id === C ? { ...W, accessToken: I.trim() || void 0 } : W
    );
    Tn(R), r(R);
  }, V = (C) => {
    const I = n.filter((R) => R.id !== C);
    Tn(I), r(I), v.success("已移除源");
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
          value: b,
          onChange: (C) => x(C.target.value),
          onPressEnter: M,
          prefix: h ? a.createElement(h) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          o,
          {
            type: "primary",
            icon: g ? a.createElement(g) : void 0,
            onClick: M
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      b.trim() && b.trim().toLowerCase().includes("gitee.com") ? a.createElement(
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
          value: j,
          onChange: (C) => O(C.target.value),
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
      renderItem: (C) => a.createElement(
        d.Item,
        {
          actions: [
            a.createElement(
              p,
              { title: C.enabled ? "点击禁用" : "点击启用" },
              a.createElement(m, {
                size: "small",
                checked: C.enabled,
                onChange: (I) => S(C.id, I)
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
                onClick: () => V(C.id)
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
                color: C.platform === "gitee" ? "orange" : C.platform === "oss" ? "green" : "blue",
                style: { fontSize: 11 }
              },
              C.platform === "gitee" ? "Gitee" : C.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              c,
              { style: { fontSize: 11 } },
              C.label
            ),
            C.skillsPath ? a.createElement(
              E,
              { type: "secondary", style: { fontSize: 11 } },
              `/${C.skillsPath}`
            ) : null,
            C.platform !== "oss" ? a.createElement(
              E,
              { type: "secondary", style: { fontSize: 11 } },
              `@${C.ref}`
            ) : null
          ),
          a.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            C.url
          ),
          // Gitee token input for existing Gitee sources
          C.platform === "gitee" ? a.createElement(
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
              value: C.accessToken || "",
              onChange: (I) => N(C.id, I.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Ga({
  open: e,
  onClose: t,
  sources: n,
  onChange: r,
  type: a
}) {
  const i = L().React, { useState: s } = i, {
    Modal: l,
    Input: o,
    Button: d,
    List: c,
    Tag: m,
    Switch: u,
    Typography: p,
    Tooltip: v,
    message: g
  } = L().antd, {
    PlusOutlined: f,
    DeleteOutlined: h,
    LinkOutlined: y,
    ApiOutlined: E,
    UserOutlined: b,
    ImportOutlined: x,
    ExportOutlined: j,
    CopyOutlined: O
  } = L().antdIcons || {}, { Text: M } = p, [S, N] = s(""), [V, C] = s(""), [I, R] = s(""), [W, _] = s(!1), $ = a === "mcp" ? "MCP" : "专家模板", z = a === "mcp" ? E ? i.createElement(E, { style: { fontSize: 18 } }) : null : b ? i.createElement(b, { style: { fontSize: 18 } }) : null, A = () => {
    const K = S.trim(), D = V.trim();
    if (!K) return;
    const ee = D || K.slice(0, 40), te = `${a}:${K}`;
    if (n.some((Y) => Y.id === te)) {
      g.warning("该源已存在");
      return;
    }
    const se = {
      id: te,
      label: ee,
      url: K,
      enabled: !0,
      type: a
    }, ae = [...n, se];
    a === "mcp" ? _n(ae) : Cn(ae), r(ae), N(""), C(""), g.success(`已添加${$}源: ${ee}`);
  }, P = (K, D) => {
    const ee = n.map((te) => te.id === K ? { ...te, enabled: D } : te);
    a === "mcp" ? _n(ee) : Cn(ee), r(ee);
  }, Z = (K) => {
    const D = n.filter((ee) => ee.id !== K);
    a === "mcp" ? _n(D) : Cn(D), r(D), g.success("已移除源");
  }, G = () => {
    const K = JSON.stringify({ type: a, sources: n }, null, 2);
    try {
      navigator.clipboard.writeText(K), g.success(`${$}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const D = document.createElement("textarea");
      D.value = K, document.body.appendChild(D), D.select(), document.execCommand("copy"), document.body.removeChild(D), g.success(`${$}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, B = () => {
    const K = I.trim();
    if (!K) {
      g.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const D = JSON.parse(K);
      let ee = [];
      if (Array.isArray(D))
        ee = D;
      else if (D && Array.isArray(D.sources))
        ee = D.sources;
      else if (D && typeof D == "object")
        ee = [D];
      else
        throw new Error("Invalid format");
      const te = ee.filter(
        (ie) => ie && typeof ie.url == "string" && typeof ie.label == "string"
      );
      if (te.length === 0) {
        g.error("未找到有效的源数据");
        return;
      }
      const se = new Set(n.map((ie) => ie.id)), ae = [];
      for (const ie of te) {
        const de = ie.id || `${a}:${ie.url}`;
        se.has(de) || ae.push({
          id: de,
          label: ie.label,
          url: ie.url,
          enabled: ie.enabled !== !1,
          type: a
        });
      }
      if (ae.length === 0) {
        g.info("所有源均已存在，无新增");
        return;
      }
      const Y = [...n, ...ae];
      a === "mcp" ? _n(Y) : Cn(Y), r(Y), R(""), _(!1), g.success(`成功导入 ${ae.length} 个${$}源`);
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
        z,
        i.createElement("span", null, `配置${$}源`)
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
              icon: j ? i.createElement(j) : void 0,
              onClick: G,
              disabled: n.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          i.createElement(
            d,
            {
              icon: x ? i.createElement(x) : void 0,
              onClick: () => _(!W),
              size: "small"
            },
            W ? "隐藏导入" : "导入JSON"
          )
        ),
        i.createElement(d, { onClick: t }, "关闭")
      ),
      width: 680
    },
    // Description
    i.createElement(
      M,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 12 }
      },
      `配置${$}源地址，支持从远程仓库或团队共享的 JSON 导入${$}配置。`
    ),
    // Import section (collapsible)
    W ? i.createElement(
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
        M,
        {
          strong: !0,
          style: { fontSize: 12, display: "block", marginBottom: 8 }
        },
        `粘贴${$}源 JSON（支持从导出的剪贴板内容粘贴）`
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
        value: I,
        onChange: (K) => R(K.target.value),
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
            onClick: B
          },
          "导入"
        ),
        i.createElement(
          d,
          {
            size: "small",
            onClick: () => R("")
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
        value: V,
        onChange: (K) => C(K.target.value),
        style: { width: 200 }
      }),
      i.createElement(o, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: S,
        onChange: (K) => N(K.target.value),
        onPressEnter: A,
        prefix: y ? i.createElement(y) : void 0,
        style: { flex: 1 }
      }),
      i.createElement(
        d,
        {
          type: "primary",
          icon: f ? i.createElement(f) : void 0,
          onClick: A
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
        M,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    i.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (K) => i.createElement(
        c.Item,
        {
          actions: [
            i.createElement(
              v,
              { title: K.enabled ? "点击禁用" : "点击启用" },
              i.createElement(u, {
                size: "small",
                checked: K.enabled,
                onChange: (D) => P(K.id, D)
              })
            ),
            i.createElement(
              v,
              { title: "移除此源" },
              i.createElement(d, {
                size: "small",
                type: "text",
                danger: !0,
                icon: h ? i.createElement(h) : void 0,
                onClick: () => Z(K.id)
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
              m,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              K.label
            ),
            K.enabled ? null : i.createElement(
              m,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          i.createElement(
            M,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            K.url
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
function ed({
  template: e,
  agentId: t,
  agentName: n,
  existing: r,
  onSaved: a,
  onConnected: i,
  onClose: s
}) {
  var we;
  const { React: l, antd: o, openExternalLink: d } = L(), { useState: c, useRef: m, useEffect: u } = l, { Modal: p, Button: v, Input: g, Alert: f, Tag: h } = o, y = l.createElement, E = e.authType === "oauth2", b = Object.entries(e.env || {}).filter(
    ([, ye]) => ye.startsWith("your-") || ye.includes("${")
  ), [x, j] = c({}), [O, M] = c(r), [S, N] = c(r ? "saved" : "config"), [V, C] = c(""), [I, R] = c(""), [W, _] = c(""), [$, z] = c(!1), [A, P] = c(""), [Z, G] = c(""), [B, K] = c(0), D = m(!0), ee = m(0), te = m(""), se = { "Content-Type": "application/json", "X-Agent-Id": t }, ae = encodeURIComponent(e.id), Y = (ye, he = {}) => ge(ye, {
    ...he,
    headers: se,
    cache: "no-store",
    bypassCache: !0
  }), ie = (ye) => ye ? Y(
    `/mcp/oauth/session/${ae}?session_id=${encodeURIComponent(ye)}`,
    { method: "DELETE" }
  ).then(
    () => !0,
    () => !1
  ) : Promise.resolve(!0);
  u(() => (D.current = !0, () => {
    D.current = !1, ee.current += 1, ie(te.current);
  }), []);
  const de = (ye) => D.current && ee.current === ye, q = (ye) => {
    const he = xt(ye);
    if (!he)
      throw new Error("授权服务返回的登录地址无效，请联系服务提供方。");
    d ? d(he) : window.open(he, "_blank", "noopener,noreferrer");
  }, U = async (ye, he = ++ee.current) => {
    C(""), N("checking");
    try {
      if (E) {
        const T = await Y(
          `/mcp/oauth/status/${ae}`
        );
        if (!de(he)) return;
        if (!T.authorized) {
          N("saved"), C("账号尚未授权或授权已过期，请点击登录授权。");
          return;
        }
      }
      const Q = await Y(`/mcp/${ae}`, {
        method: "PUT",
        body: JSON.stringify({ enabled: !0 })
      });
      if (!de(he)) return;
      M({ ...ye, ...Q, enabled: !0 }), a({ ...ye, ...Q, enabled: !0 });
      const w = await Y(`/mcp/tools/${ae}`);
      if (!de(he)) return;
      if (!Array.isArray(w) || w.length === 0) {
        C(
          "配置已启用，但服务尚未返回可用工具。可稍后重新检测，或检查账号权限和服务接入要求。"
        ), N("error");
        return;
      }
      K(w.length), N("connected"), i();
    } catch {
      if (!de(he)) return;
      N("error"), C(
        E ? "账号授权后，工具连接检测未通过。请检查网络或服务账号权限后重试；授权失效可重新登录。" : "配置已保存，工具连接检测未通过。请检查网络、密钥权限或本地运行环境后重试。"
      );
    }
  }, pe = async (ye, he = ++ee.current) => {
    N("starting"), C(""), R("");
    const Q = te.current;
    if (te.current = "", _(""), await ie(Q), !!de(he))
      try {
        const w = await Y(
          `/mcp/oauth/start/${ae}`,
          {
            // The backend uses the saved endpoint, including securely stored URL credentials.
            method: "POST",
            body: JSON.stringify({
              url: "",
              client_id: A.trim(),
              scope: Z.trim()
            })
          }
        );
        if (!de(he)) {
          ie(w.session_id);
          return;
        }
        if (!w.session_id || !xt(w.auth_url))
          throw new Error("Invalid authorization response");
        te.current = w.session_id, _(w.session_id), R(w.auth_url), N("waiting"), q(w.auth_url);
      } catch {
        if (!de(he)) return;
        N("error"), C(
          "无法发起登录授权。请确认服务支持标准 MCP OAuth；若服务要求预先注册客户端，可在高级设置填写客户端 ID，或查看服务接入说明后重试。"
        );
      }
  };
  u(() => {
    if (S !== "waiting" || !W || !O) return;
    const ye = ee.current;
    let he = !1, Q = !1, w, T = 0;
    const H = Date.now() + 5 * 6e4, F = async () => {
      if (!(he || Q || !de(ye))) {
        if (clearTimeout(w), Date.now() >= H) {
          ie(W), N("error"), C("等待授权超时。配置已保留，请重新登录授权。");
          return;
        }
        Q = !0;
        try {
          const ue = await Y(
            `/mcp/oauth/status/${ae}?session_id=${encodeURIComponent(
              W
            )}`
          );
          if (he || !de(ye)) return;
          if (T = 0, ue.authorized && ue.phase === "authorized") {
            te.current = "", _(""), U(O, ye);
            return;
          }
          if (["denied", "failed", "cancelled", "expired"].includes(
            ue.phase || ""
          )) {
            N("error"), C(
              ue.phase === "denied" ? "授权未获同意。你可以重新登录并选择允许的权限。" : "本次授权未完成或已失效，配置已保留，可重新登录授权。"
            );
            return;
          }
        } catch {
          if (++T >= 3 && !he && de(ye)) {
            N("error"), C("暂时无法查询授权状态，请检查网络后重试。");
            return;
          }
        } finally {
          Q = !1;
        }
        !he && de(ye) && (w = setTimeout(F, 2e3));
      }
    };
    return F(), window.addEventListener("focus", F), () => {
      he = !0, clearTimeout(w), window.removeEventListener("focus", F);
    };
  }, [S, W, O]);
  const Ee = async () => {
    const ye = b.filter(([w]) => {
      var T;
      return !((T = x[w]) != null && T.trim());
    });
    if (ye.length) {
      C(
        `请填写：${ye.map(
          ([w]) => {
            var T, H;
            return ((H = ((T = e.inputHints) == null ? void 0 : T[w]) || qa[w]) == null ? void 0 : H.label) || w;
          }
        ).join("、")}`
      );
      return;
    }
    let he;
    try {
      he = Nc(
        {
          url: e.url,
          command: e.command,
          args: e.args,
          headers: e.headers,
          cwd: e.cwd,
          env: { ...e.env, ...x }
        },
        x
      );
    } catch (w) {
      C(w instanceof Error ? w.message : "请检查连接配置");
      return;
    }
    const Q = ++ee.current;
    N("saving"), C("");
    try {
      const w = {
        name: e.name,
        description: e.description,
        enabled: !E,
        transport: e.transport,
        ...he
      }, T = O ? await Y(`/mcp/${ae}`, {
        method: "PUT",
        body: JSON.stringify(w)
      }) : await Ur(t, {
        client_key: e.id,
        client: w
      });
      if (!de(Q)) return;
      const H = { ...T, key: e.id, enabled: !E };
      M(H), j({}), a(H), E ? await pe(H, Q) : await U(H, Q);
    } catch {
      if (!de(Q)) return;
      N("config"), C(
        "配置未能保存，请检查服务配置或是否已有同名连接后重试。填写内容暂时保留在此窗口。"
      );
    }
  }, be = async () => {
    ee.current += 1, N("saved"), C("已取消本次授权等待，配置已保留。尚未完成授权的连接保持未启用。"), !await ie(te.current) && D.current && C(
      "已停止等待，但暂时无法取消服务端授权流程。请关闭授权网页；连接不会在此窗口自动启用。"
    ), te.current = "", _(""), R("");
  }, oe = ["saving", "starting", "waiting", "checking"].includes(S), Se = xt(e.source), ke = xt(e.setupUrl), Ie = S === "connected" ? `已连接 · 已读取 ${B} 个工具` : S === "waiting" ? "等待浏览器登录授权" : S === "starting" ? "正在准备安全登录" : S === "checking" ? "正在检测可用工具" : S === "saving" ? "正在保存连接配置" : O ? E ? "已保存 · 账号授权与连接待确认" : "已保存 · 连接待检测" : "填写接入信息", Te = [
    y(
      v,
      { key: "close", onClick: s },
      oe ? "关闭并停止等待" : "关闭"
    )
  ];
  return S === "config" ? Te.push(
    y(
      v,
      { key: "save", type: "primary", onClick: Ee },
      O ? "更新凭证并连接" : "添加连接"
    )
  ) : S === "waiting" ? Te.push(
    y(v, { key: "cancel", onClick: be }, "取消授权"),
    y(
      v,
      {
        key: "reopen",
        type: "primary",
        onClick: () => q(I)
      },
      "重新打开授权页"
    )
  ) : !oe && O && (b.length && Te.push(
    y(
      v,
      {
        key: "edit",
        onClick: () => {
          j({}), C(""), N("config");
        }
      },
      "更新凭证"
    )
  ), Te.push(
    y(
      v,
      { key: "check", onClick: () => U(O) },
      "重新检测"
    )
  ), E && Te.push(
    y(
      v,
      {
        key: "auth",
        type: "primary",
        onClick: () => pe()
      },
      "登录授权"
    )
  )), y(
    p,
    {
      title: `连接 ${e.name}`,
      open: !0,
      onCancel: s,
      footer: Te,
      width: 560,
      destroyOnClose: !0
    },
    y("p", { style: { color: "var(--app-card-muted)" } }, e.description),
    y("p", null, `目标专家：${n}`),
    y(h, { color: S === "connected" ? "green" : "blue" }, Ie),
    E ? y(f, {
      style: { margin: "12px 0" },
      type: "info",
      showIcon: !0,
      message: "在服务提供方页面登录并确认权限，返回这里自动完成连接检测。UGSci 不需要你的账号密码。"
    }) : null,
    V ? y(f, {
      role: "alert",
      style: { margin: "12px 0" },
      type: "warning",
      showIcon: !0,
      message: V
    }) : null,
    ...(e.requirements || []).map(
      (ye, he) => y("p", { key: `req-${he}` }, ye)
    ),
    ke ? y(
      "p",
      null,
      y(
        "a",
        {
          href: ke,
          target: "_blank",
          rel: "noopener noreferrer",
          onClick: d ? (ye) => {
            ye.preventDefault(), d(ke);
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
        onClick: d ? (ye) => {
          ye.preventDefault(), d(Se);
        } : void 0
      },
      "查看服务接入说明 ↗"
    ) : null,
    S === "config" ? y(
      "div",
      { style: { marginTop: 16 } },
      ...b.map(([ye]) => {
        var T;
        const he = ((T = e.inputHints) == null ? void 0 : T[ye]) || qa[ye], Q = xt(he == null ? void 0 : he.link), w = (he == null ? void 0 : he.label) || ye;
        return y(
          "div",
          { key: ye, style: { marginBottom: 16 } },
          y(
            "label",
            {
              htmlFor: `mcp-input-${ye}`,
              style: { display: "block", marginBottom: 6 }
            },
            `${w}（必填）`
          ),
          he != null && he.help ? y(
            "p",
            { style: { fontSize: 12, margin: "4px 0" } },
            he.help
          ) : null,
          Q ? y(
            "a",
            {
              href: Q,
              target: "_blank",
              rel: "noopener noreferrer",
              onClick: d ? (H) => {
                H.preventDefault(), d(Q);
              } : void 0
            },
            "获取密钥 / 查看设置 ↗"
          ) : null,
          y((he == null ? void 0 : he.isSecret) === !1 ? g : g.Password, {
            id: `mcp-input-${ye}`,
            placeholder: `请输入 ${w}`,
            value: x[ye] || "",
            autoComplete: "off",
            onChange: (H) => j((F) => ({ ...F, [ye]: H.target.value }))
          })
        );
      })
    ) : null,
    E ? y(
      "div",
      { style: { marginTop: 12 } },
      y(
        v,
        {
          type: "link",
          size: "small",
          disabled: oe,
          onClick: () => z(!$)
        },
        $ ? "收起高级设置" : "高级设置（服务要求时填写）"
      ),
      $ ? y(
        "div",
        null,
        y(g, {
          "aria-label": "OAuth 客户端 ID",
          placeholder: "客户端 ID（通常自动获取）",
          value: A,
          disabled: oe,
          onChange: (ye) => P(ye.target.value)
        }),
        y(g, {
          "aria-label": "OAuth 权限范围",
          placeholder: "权限范围（按服务文档填写，可留空）",
          value: Z,
          disabled: oe,
          style: { marginTop: 8 },
          onChange: (ye) => G(ye.target.value)
        })
      ) : null
    ) : null,
    (we = e.limitations) != null && we.length ? y(
      "details",
      { style: { marginTop: 12 } },
      y("summary", null, "使用限制"),
      ...e.limitations.map((ye, he) => y("p", { key: he }, ye))
    ) : null
  );
}
function td({
  open: e,
  onClose: t
}) {
  const { React: n, antd: r } = L(), a = n.createElement, { Modal: i, Input: s, Button: l, Alert: o, Checkbox: d, Radio: c, Space: m } = r, [u, p] = n.useState({
    id: "",
    name: "",
    version: "1.0.0",
    description: "",
    author: "",
    system_prompt: "",
    tags: "",
    recommended_skills: ""
  }), [v, g] = n.useState(""), [f, h] = n.useState("submission"), [y, E] = n.useState(null), [b, x] = n.useState(""), [j, O] = n.useState(!1), [M, S] = n.useState(""), [N, V] = n.useState(""), [C, I] = n.useState(null);
  n.useEffect(() => {
    if (!e) {
      g("");
      return;
    }
    let G = !0;
    return x(""), O(!1), I(null), V(""), E(null), ge("/publisher/status").then((B) => {
      G && E(B);
    }).catch(() => {
      G && V("无法读取发布服务配置，请稍后重试");
    }), () => {
      G = !1;
    };
  }, [e]);
  const R = {
    ...u,
    tags: u.tags.split(/[,，]/).map((G) => G.trim()).filter(Boolean),
    recommended_skills: u.recommended_skills.split(/[,，]/).map((G) => G.trim()).filter(Boolean)
  }, W = JSON.stringify({ expert: R, mode: f }), _ = W + v, $ = f === "release" ? y == null ? void 0 : y.direct_publish_configured : y == null ? void 0 : y.submission_configured, z = async (G) => {
    V(""), I(null), S(G);
    try {
      const B = await ge(`/publisher/expert/${G}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-UGSci-Publisher-Token": v
        },
        body: W
      });
      G === "inspect" && x(_), I(B), B.status === "published" && us(!0).catch(() => {
      });
    } catch (B) {
      x("");
      let K = (B == null ? void 0 : B.message) || "提交失败，请重试";
      try {
        K = JSON.parse(K).detail || K;
      } catch {
      }
      V(String(K));
    } finally {
      S("");
    }
  }, A = async (G) => {
    if (G) {
      V(""), I(null), x(""), O(!1);
      try {
        if (G.size > 1024 * 1024) throw new Error("专家 JSON 不能超过 1 MB");
        const B = JSON.parse(await G.text()), K = [
          "id",
          "name",
          "version",
          "description",
          "author",
          "system_prompt",
          "tags",
          "recommended_skills"
        ];
        if (!B || typeof B != "object" || Array.isArray(B) || Object.keys(B).some((D) => !K.includes(D)))
          throw new Error(
            "仅支持公开专家模板字段；请移除记忆、知识文件、凭证和其他运行配置"
          );
        for (const D of K)
          if (B[D] !== void 0 && (["tags", "recommended_skills"].includes(D) ? !Array.isArray(B[D]) || B[D].some((ee) => typeof ee != "string") : typeof B[D] != "string"))
            throw new Error(`字段 ${D} 格式无效`);
        p({
          id: B.id || "",
          name: B.name || "",
          version: B.version || "1.0.0",
          description: B.description || "",
          author: B.author || "",
          system_prompt: B.system_prompt || "",
          tags: (B.tags || []).join(", "),
          recommended_skills: (B.recommended_skills || []).join(", ")
        });
      } catch (B) {
        V((B == null ? void 0 : B.message) || "模板导入失败");
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
    }, B = URL.createObjectURL(
      new Blob([JSON.stringify(G, null, 2)], { type: "application/json" })
    ), K = document.createElement("a");
    K.href = B, K.download = "ugsci-expert-template.json", K.click(), setTimeout(() => URL.revokeObjectURL(B), 1e3);
  }, Z = (G, B, K, D = !1) => a(
    "label",
    { key: G, style: { display: "block", marginBottom: 12 } },
    a("div", { style: { marginBottom: 4 } }, B),
    a(D ? s.TextArea : s, {
      "aria-label": B,
      value: u[G],
      placeholder: K,
      rows: G === "system_prompt" ? 7 : 2,
      onChange: (ee) => {
        p((te) => ({ ...te, [G]: ee.target.value })), I(null);
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
      closable: !M,
      maskClosable: !M,
      onCancel: () => {
        M || (g(""), t());
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
      m,
      { style: { marginBottom: 16 }, wrap: !0 },
      a(
        "label",
        null,
        "导入专家 JSON ",
        a("input", {
          type: "file",
          accept: ".json,application/json",
          "aria-label": "导入专家 JSON",
          disabled: !!M,
          onChange: (G) => {
            var B;
            A((B = G.target.files) == null ? void 0 : B[0]), G.target.value = "";
          }
        })
      ),
      a(l, { onClick: P }, "下载空白模板")
    ),
    Z(
      "id",
      "专家 ID",
      "例如 alice-reservoir，须以管理员分配的命名空间开头"
    ),
    a(
      "div",
      { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } },
      Z("name", "专家名称", "公开显示的名称"),
      Z("version", "版本号", "例如 1.0.0")
    ),
    Z("description", "简介", "专家擅长什么", !0),
    Z("author", "公开作者", "可使用团队名或笔名"),
    Z(
      "system_prompt",
      "公开提示词",
      "填写专家职责、流程与输出要求；勿填写私人资料或密钥",
      !0
    ),
    Z("tags", "标签", "科研, 油藏工程"),
    Z(
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
        value: v,
        autoComplete: "off",
        onChange: (G) => g(G.target.value),
        placeholder: "管理员分配的投稿凭证，无需 OSS AccessKey"
      })
    ),
    a(c.Group, {
      value: f,
      style: { margin: "12px 0" },
      onChange: (G) => {
        h(G.target.value), I(null);
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
          checked: j,
          onChange: (G) => O(G.target.checked)
        },
        "我确认以上内容可公开分享，不含私人数据或账号密钥"
      )
    ),
    y && !$ && a(o, {
      type: "warning",
      message: "管理员尚未配置远端发布服务，当前无法上传 OSS。请联系管理员开通投稿服务。",
      style: { marginBottom: 12 }
    }),
    N && a(o, {
      type: "error",
      showIcon: !0,
      message: N,
      style: { marginBottom: 12 }
    }),
    C && a(o, {
      showIcon: !0,
      type: C.status === "checked" ? "info" : "success",
      message: C.status === "checked" ? `服务端检查通过：${C.operation === "update" ? "更新现有专家" : "新增专家"}` : C.status === "published" ? "已发布，OSS 内容与目录已校验" : "已上传 OSS，等待管理员审核",
      description: a(
        "div",
        { style: { overflowWrap: "anywhere" } },
        a("div", null, `回执：${C.receipt_id}`),
        a("div", null, `SHA-256：${C.sha256}`)
      ),
      style: { marginBottom: 12 }
    }),
    a(
      m,
      null,
      a(
        l,
        {
          disabled: !!M || !$ || !v.trim() || !u.id || !u.name || !u.system_prompt,
          loading: M === "inspect",
          onClick: () => z("inspect")
        },
        "检查归属与版本"
      ),
      a(
        l,
        {
          type: "primary",
          disabled: !!M || !$ || !j || b !== _,
          loading: M === "publish",
          onClick: () => z("publish")
        },
        f === "release" ? "发布新版本" : "上传到 OSS 待审核"
      )
    ),
    M && a(
      "div",
      { role: "status", style: { marginTop: 12 } },
      M === "inspect" ? "正在校验身份、命名空间与版本…" : "正在写入 OSS 并核验回执，请稍候…"
    )
  );
}
async function nd() {
  return ge("/market/providers");
}
async function rd(e) {
  return ge(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function ad(e, t, n, r, a) {
  return ge("/market/search", {
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
function Wa(e) {
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
async function Za(e, t) {
  const n = { bundle_url: e };
  return t && (n.access_token = t), ge("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function id({
  embedded: e = !1
} = {}) {
  var Ta;
  const t = L().React, { useState: n, useEffect: r, useCallback: a, useMemo: i, useRef: s } = t, {
    Spin: l,
    Empty: o,
    Input: d,
    Button: c,
    message: m,
    Row: u,
    Col: p,
    Card: v,
    Tag: g,
    Tooltip: f,
    Typography: h,
    Select: y,
    Drawer: E,
    Descriptions: b,
    Tabs: x,
    Badge: j,
    Progress: O,
    Modal: M,
    Alert: S
  } = L().antd, {
    ReloadOutlined: N,
    SearchOutlined: V,
    DownloadOutlined: C,
    AppstoreOutlined: I,
    ShopOutlined: R,
    CheckCircleOutlined: W,
    LoadingOutlined: _,
    UserOutlined: $,
    UserAddOutlined: z,
    SettingOutlined: A,
    GithubOutlined: P,
    ApiOutlined: Z
  } = L().antdIcons || {}, { Text: G, Paragraph: B, Title: K } = h, [D, ee] = n("skills"), [te, se] = n([]), [ae, Y] = n([]), [ie, de] = n([]), [q, U] = n(""), [pe, Ee] = n(""), [be, oe] = n(!1), [Se, ke] = n(!1), [Ie, Te] = n(
    {}
  ), [we, ye] = n(null), [he, Q] = n({}), [w, T] = n([]), [H, F] = n(""), [ue, X] = n(""), [fe, xe] = n(""), [Ae, Fe] = n(""), [Ge, it] = n({}), [Ye, J] = n(/* @__PURE__ */ new Set()), [ve, Re] = n(null), [Ve, me] = n(24), je = s(Ae);
  je.current = Ae;
  const [He, We] = n([]), [lt, Ze] = n([]), [$e, mt] = n([]), [ct, De] = n(""), [Le, dt] = n(!1), [Mt, qt] = n(24), [Yn, na] = n(24), [ra, er] = n(!1), [Gs, aa] = n(!1), [Ws, ia] = n([]), [Zs, sa] = n(!1), [Js, oa] = n([]), [Qs, la] = n(!1), [Ks, ca] = n(!1), [da, Xs] = n([]), [ua, Ys] = n(
    []
  ), [tr, ma] = n(!1), [pa, ga] = n(""), [vt, fa] = n(""), [ya, eo] = n([]), [ha, to] = n([]), [nr, ba] = n(!1), [va, Ea] = n(""), [Et, wa] = n(""), [rr, xa] = n(!1), [et, wn] = n(null), [Ft, no] = n([]), Gt = s(null), ar = s(0), Wt = s(0);
  r(() => {
    let k = !0;
    return nd().then((ce) => {
      k && se(ce);
    }).catch(() => {
    }), rd("zh").then((ce) => {
      k && Y(ce);
    }).catch(() => {
    }), En().then((ce) => {
      k && (T(ce), ce.length > 0 && (F(ce[0].id), Fe(ce[0].id)));
    }).catch(() => {
    }), () => {
      k = !1;
    };
  }, []);
  const Zt = a(
    async (k) => {
      const ce = ++Wt.current, le = k ?? Gc();
      if (We(k || le), le.filter((Pe) => Pe.enabled).length === 0) {
        Ze([]), er(!1);
        return;
      }
      er(!0);
      try {
        const { skills: Pe, errors: Ne } = await Xc(le);
        if (ce !== Wt.current) return;
        if (Ze(Pe), Ne.length > 0) {
          for (const Be of Ne)
            console.warn(
              `[ugsci] GitHub source '${Be.label}' error: ${Be.message}`
            );
          m.warning(
            `部分源加载失败: ${Ne.map((Be) => Be.label).join(", ")}`
          );
        }
      } catch (Pe) {
        if (ce !== Wt.current) return;
        m.error(Pe.message || "加载技能源失败");
      } finally {
        ce === Wt.current && er(!1);
      }
    },
    []
  ), gt = a(async (k = !1) => {
    const ce = ++ar.current, le = () => ce === ar.current;
    ma(!0), ba(!0), dt(!0), await Promise.allSettled([
      Qc(k).then((_e) => {
        le() && (Xs(_e.servers), Ys(_e.categories), ga(""));
      }).catch(() => {
        le() && ga("MCP 目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        le() && ma(!1);
      }),
      us(k).then((_e) => {
        le() && (eo(_e.agents), to(_e.categories), Ea(""));
      }).catch(() => {
        le() && Ea("人才目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        le() && ba(!1);
      }),
      Kc(k).then((_e) => {
        le() && (mt(_e.skills), no(_e.categories), De(""));
      }).catch(() => {
        le() && De("技能目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        le() && dt(!1);
      })
    ]);
  }, []);
  r(() => {
    Zt(), gt(), ia(Vc()), oa(qc());
    const k = Uc(() => {
      gt();
    });
    return () => {
      k(), ar.current += 1, Wt.current += 1;
    };
  }, [Zt, gt]), r(() => {
    qt(24);
  }, [q, pe]), r(() => {
    na(24);
  }, [ue, Et]);
  const xn = a(
    async (k, ce, le) => {
      oe(!0);
      try {
        const _e = await ad(
          k,
          le,
          20,
          "zh",
          ce || void 0
        );
        le === void 0 || Object.keys(le).length === 0 ? de(_e.results) : de((Be) => [...Be, ..._e.results]);
        const Pe = Object.values(_e.by_provider || {}).some(
          (Be) => Be.has_more
        );
        ke(Pe);
        const Ne = {};
        for (const [Be, pt] of Object.entries(_e.by_provider || {}))
          Ne[Be] = (le[Be] || 1) + 1;
        if (Te(Ne), _e.errors.length > 0)
          for (const Be of _e.errors)
            console.warn(
              `[ugsci] Market provider '${Be.provider}' error: ${Be.message}`
            );
      } catch (_e) {
        m.error(_e.message || "搜索市场失败"), de([]);
      } finally {
        oe(!1);
      }
    },
    []
  );
  r(() => (Gt.current && clearTimeout(Gt.current), Gt.current = setTimeout(() => {
    xn(q, pe, {});
  }, 400), () => {
    Gt.current && clearTimeout(Gt.current);
  }), [q, pe, xn]);
  const ro = () => {
    xn(q, pe, Ie);
  }, Sa = async (k) => {
    const ce = `${k.source}:${k.slug}`;
    try {
      Q((_e) => ({ ..._e, [ce]: "installing" }));
      const le = await Za(k.source_url);
      le.installed && m.success(
        `技能「${le.name || k.name}」已安装到技能池，可在技能中心查看`
      ), Q((_e) => {
        const Pe = { ..._e };
        return delete Pe[ce], Pe;
      });
    } catch (le) {
      m.error(Wa(le) || "安装技能失败"), Q((_e) => {
        const Pe = { ..._e };
        return delete Pe[ce], Pe;
      });
    }
  }, ao = (k) => {
    window.history.pushState({}, "", k), window.dispatchEvent(new PopStateEvent("popstate"));
  }, io = async (k) => {
    const ce = `github:${k.sourceId}:${k.name}`, le = He.find((Pe) => Pe.id === k.sourceId), _e = (le == null ? void 0 : le.accessToken) || void 0;
    try {
      Q((Ne) => ({ ...Ne, [ce]: "installing" }));
      const Pe = await Za(k.source_url, _e);
      Pe.installed && m.success(
        `技能「${Pe.name || k.name}」已安装到技能池，可在技能中心查看`
      ), Q((Ne) => {
        const Be = { ...Ne };
        return delete Be[ce], Be;
      });
    } catch (Pe) {
      m.error(Wa(Pe) || "安装技能失败"), Q((Ne) => {
        const Be = { ...Ne };
        return delete Be[ce], Be;
      });
    }
  }, It = i(() => {
    const k = [], ce = /* @__PURE__ */ new Set();
    for (const le of [...$e, ...lt]) {
      const _e = le.source_url || `${le.sourceLabel}:${le.name}`;
      ce.has(_e) || (ce.add(_e), k.push(le));
    }
    return k;
  }, [$e, lt]), ka = i(() => {
    const k = [], ce = /* @__PURE__ */ new Set();
    if (Ft.length > 0)
      for (const le of Ft)
        ce.has(le.id) || (ce.add(le.id), k.push(le));
    for (const le of It)
      le.tag && !ce.has(le.tag) && (ce.add(le.tag), k.push({ id: le.tag, label: le.tag }));
    for (const le of It)
      !le.isOfficial && le.sourceLabel && !ce.has(le.sourceLabel) && (ce.add(le.sourceLabel), k.push({ id: le.sourceLabel, label: le.sourceLabel }));
    return k;
  }, [It, Ft]), At = i(() => {
    let k = It;
    if (pe) {
      const ce = Ft.find(
        (le) => le.id === pe
      );
      ce && ce.tags ? k = k.filter(
        (le) => le.tag && ce.tags.includes(le.tag) || le.sourceLabel === pe
      ) : k = k.filter(
        (le) => le.tag === pe || le.sourceLabel === pe
      );
    }
    if (q.trim()) {
      const ce = q.toLowerCase();
      k = k.filter(
        (le) => {
          var _e;
          return le.name.toLowerCase().includes(ce) || ((_e = le.description) == null ? void 0 : _e.toLowerCase().includes(ce));
        }
      );
    }
    return k;
  }, [It, q, pe, Ft]), _a = te.filter((k) => k.available), $t = i(() => pe ? ie.filter((k) => {
    const ce = _a.find((le) => le.key === k.source);
    return (ce == null ? void 0 : ce.label) === pe;
  }) : ie, [ie, pe, _a]), so = D === "skills" ? t.createElement(
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
        prefix: V ? t.createElement(V) : void 0,
        value: q,
        onChange: (k) => U(k.target.value),
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
            gt(!0), Zt();
          }
        },
        "刷新技能目录"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    ct ? t.createElement(S, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络后点击“刷新技能目录”重试，已加载的技能仍可浏览。",
      style: { marginBottom: 12 }
    }) : null,
    ka.length > 0 ? t.createElement(
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
          color: pe === "" ? "blue" : void 0,
          onClick: () => Ee("")
        },
        "全部"
      ),
      ...ka.map((k) => {
        const ce = lt.some(
          (le) => !le.isOfficial && le.sourceLabel === k.id
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
            color: pe === k.id ? ce ? "blue" : "geekblue" : void 0,
            icon: ce && P ? t.createElement(P) : void 0,
            onClick: () => Ee(
              pe === k.id ? "" : k.id
            )
          },
          k.label
        );
      })
    ) : null,
    // GitHub skills section
    (ra || Le) && It.length === 0 ? t.createElement(
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
    ) : At.length > 0 ? t.createElement(
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
          `技能市场 (${At.length})`
        )
      ),
      t.createElement(
        u,
        { gutter: [12, 12] },
        ...At.slice(0, Mt).map((k) => {
          const ce = `github:${k.sourceId}:${k.name}`, le = he[ce];
          return t.createElement(
            p,
            { key: ce, xs: 24, sm: 12, md: 8, lg: 6 },
            t.createElement(
              v,
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
                B,
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
                    Z ? t.createElement(Z, {
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
                le ? t.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: _ ? t.createElement(_) : void 0
                  },
                  "安装中"
                ) : t.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: C ? t.createElement(C) : void 0,
                    onClick: () => io(k)
                  },
                  "安装"
                )
              )
            )
          );
        })
      )
    ) : null,
    At.length > Mt ? t.createElement(
      "div",
      { style: { textAlign: "center", marginBottom: 20 } },
      t.createElement(
        c,
        {
          onClick: () => qt((k) => k + 24)
        },
        `显示更多技能（已显示 ${Math.min(
          Mt,
          At.length
        )} / ${At.length}）`
      )
    ) : null,
    // Market results section title
    $t.length > 0 || be ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      R ? t.createElement(R, {
        style: { fontSize: 14, color: "var(--app-action-link)" }
      }) : null,
      t.createElement(
        G,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${$t.length > 0 ? ` (${$t.length})` : ""}`
      )
    ) : null,
    // Results grid
    be && $t.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(l, { size: "large" })
    ) : $t.length === 0 ? t.createElement(o, {
      description: q ? `未找到匹配「${q}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...$t.map((k) => {
        const ce = `${k.source}:${k.slug}`, le = he[ce];
        return t.createElement(
          p,
          { key: ce, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            v,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ye(k)
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
              B,
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
              le ? t.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: _ ? t.createElement(_) : void 0
                },
                "安装中"
              ) : t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: C ? t.createElement(C) : void 0,
                  onClick: (_e) => {
                    _e.stopPropagation(), Sa(k);
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
    Se && !be ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        { onClick: ro, loading: be },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    we ? t.createElement(
      E,
      {
        title: t.createElement(
          "div",
          {
            style: { display: "flex", alignItems: "center", gap: 8 }
          },
          we.icon_url ? t.createElement("img", {
            src: we.icon_url,
            alt: we.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : t.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          t.createElement("span", null, we.name)
        ),
        open: !0,
        onClose: () => ye(null),
        width: 480,
        extra: t.createElement(
          c,
          {
            type: "primary",
            icon: C ? t.createElement(C) : void 0,
            onClick: () => {
              Sa(we);
            }
          },
          "安装到技能池"
        )
      },
      t.createElement(
        b,
        { column: 1, bordered: !0, size: "small" },
        t.createElement(
          b.Item,
          { label: "来源" },
          we.source
        ),
        t.createElement(
          b.Item,
          { label: "描述" },
          we.description || "-"
        ),
        we.version ? t.createElement(
          b.Item,
          { label: "版本" },
          we.version
        ) : null,
        we.author ? t.createElement(
          b.Item,
          { label: "作者" },
          we.author
        ) : null,
        t.createElement(
          b.Item,
          { label: "来源链接" },
          t.createElement(
            "a",
            { href: we.source_url, target: "_blank" },
            we.source_url
          )
        )
      ),
      we.stats ? t.createElement(
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
          ...Object.entries(we.stats).map(
            ([k, ce]) => t.createElement(
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
                String(ce)
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
  ) : null, zt = i(() => {
    let k = ya;
    if (Et && (k = k.filter((ce) => ce.category === Et)), ue.trim()) {
      const ce = ue.toLowerCase();
      k = k.filter(
        (le) => le.name.toLowerCase().includes(ce) || le.description.toLowerCase().includes(ce) || le.tags.some((_e) => _e.toLowerCase().includes(ce))
      );
    }
    return k;
  }, [ya, ue, Et]), oo = async (k) => {
    if (!rr) {
      xa(!0);
      try {
        const [ce, le] = await Promise.all([
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
            const Ne = await Pe.json(), Be = Array.isArray(Ne) ? Ne : Ne.skills;
            if (!Array.isArray(Be)) throw new Error("专家技能清单格式无效");
            return Be.map(
              (pt) => typeof pt == "string" ? pt : pt == null ? void 0 : pt.name
            ).filter((pt) => typeof pt == "string" && pt.trim());
          })() : Promise.resolve([])
        ]), _e = await ge("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: k.name,
            description: k.description,
            skill_names: le
          })
        });
        await Nt(_e.id, "AGENTS.md", ce), m.success(`专家「${k.name}」创建成功，已跳转至专家`), ao("/ugsci-experts");
      } catch (ce) {
        m.error(ce.message || "创建专家失败");
      } finally {
        xa(!1);
      }
    }
  }, Ca = a(async (k) => {
    if (k)
      try {
        const ce = await Hr(k);
        if (je.current !== k) return;
        it(
          Object.fromEntries(ce.map((le) => [le.key, le]))
        );
      } catch {
        je.current === k && it({});
      }
  }, []);
  r(() => {
    it({}), J(/* @__PURE__ */ new Set()), Ae && Ca(Ae);
  }, [Ae, Ca]), r(() => {
    me(24);
  }, [fe, vt]);
  const lo = (k) => {
    if (!Ae) {
      m.warning("请先选择目标专家");
      return;
    }
    Re({
      template: k,
      agentId: Ae,
      existing: Ge[k.id]
    });
  }, Rt = i(() => {
    let k = da;
    if (vt && (k = k.filter((ce) => ce.category === vt)), fe.trim()) {
      const ce = fe.toLowerCase();
      k = k.filter(
        (le) => le.name.toLowerCase().includes(ce) || le.description.toLowerCase().includes(ce) || le.tags.some((_e) => _e.toLowerCase().includes(ce))
      );
    }
    return k.map(Dc);
  }, [da, fe, vt]), co = D === "mcp" ? t.createElement(
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
        prefix: V ? t.createElement(V) : void 0,
        value: fe,
        onChange: (k) => xe(k.target.value),
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
          onChange: (k) => Fe(k),
          style: { minWidth: 180 },
          size: "small",
          options: w.map((k) => ({ value: k.id, label: k.name }))
        })
      ),
      // Configure MCP source button
      t.createElement(
        c,
        {
          icon: Z ? t.createElement(Z) : void 0,
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
          onClick: () => gt(!0)
        },
        "刷新目录"
      )
    ),
    pa ? t.createElement(S, {
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
          color: vt === "" ? "blue" : void 0,
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
            color: vt === k.id ? "geekblue" : void 0,
            onClick: () => fa(
              vt === k.id ? "" : k.id
            )
          },
          k.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    tr && Rt.length === 0 ? t.createElement(
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
    ) : Rt.length === 0 ? t.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...Rt.slice(0, Ve).map(
        (k, ce) => {
          var le, _e, Pe;
          return t.createElement(
            p,
            { key: k.id, xs: 24, sm: 12, md: 8 },
            t.createElement(
              v,
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
                    loading: ce < 12 ? "eager" : "lazy",
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
                B,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 3 }
                },
                k.description
              ),
              (le = k.requirements) != null && le.length || (_e = k.limitations) != null && _e.length ? t.createElement(
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
                  (Ne, Be) => t.createElement(
                    "p",
                    { key: Be, style: { margin: "6px 0" } },
                    Ne
                  )
                ),
                xt(k.source) ? t.createElement(
                  "a",
                  {
                    href: xt(k.source),
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
                  Ye.has(k.id) ? "已连接 · 工具检测通过" : Ge[k.id] ? k.authType === "oauth2" && !((Pe = Ge[k.id].oauth_status) != null && Pe.authorized) ? "已保存 · 待登录授权" : "已保存 · 连接待检测" : k.transport === "stdio" ? `${k.command} ${(k.args || []).join(" ")}` : k.authType === "oauth2" ? "浏览器登录 · 自动检测连接" : "远程服务 · 按账号权限连接"
                ),
                t.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: Z ? t.createElement(Z) : void 0,
                    onClick: () => lo(k)
                  },
                  Ge[k.id] ? "管理连接" : k.transport === "stdio" ? "添加工具" : "连接"
                )
              )
            )
          );
        }
      )
    ),
    Rt.length > Ve ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        { onClick: () => me((k) => k + 24) },
        `加载更多 MCP（已显示 ${Math.min(
          Ve,
          Rt.length
        )} / ${Rt.length}）`
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
      R ? t.createElement(R, {
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
  ) : null, uo = ve ? t.createElement(ed, {
    key: `${ve.agentId}:${ve.template.id}`,
    template: ve.template,
    agentId: ve.agentId,
    agentName: ((Ta = w.find((k) => k.id === ve.agentId)) == null ? void 0 : Ta.name) || ve.agentId,
    existing: ve.existing,
    onSaved: (k) => {
      je.current === ve.agentId && (it((ce) => ({ ...ce, [k.key]: k })), J((ce) => {
        const le = new Set(ce);
        return le.delete(k.key), le;
      }));
    },
    onConnected: () => {
      je.current === ve.agentId && J((k) => new Set(k).add(ve.template.id));
    },
    onClose: () => Re(null)
  }) : null, mo = D === "experts" ? t.createElement(
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
        prefix: V ? t.createElement(V) : void 0,
        value: ue,
        onChange: (k) => X(k.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      t.createElement(
        c,
        {
          icon: $ ? t.createElement($) : void 0,
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
          onClick: () => gt(!0)
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
    va ? t.createElement(S, {
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
          color: Et === "" ? "blue" : void 0,
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
            color: Et === k.id ? "geekblue" : void 0,
            onClick: () => wa(
              Et === k.id ? "" : k.id
            )
          },
          k.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    nr && zt.length === 0 ? t.createElement(
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
    ) : zt.length === 0 ? t.createElement(o, {
      description: "未找到匹配的人才",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...zt.slice(0, Yn).map(
        (k) => t.createElement(
          p,
          { key: k.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            v,
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
              t.createElement(at, {
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
              B,
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
                  (ce) => ce !== "agent" && ce !== "template" && ce !== "workspace"
                ).slice(0, 3).join(" · ") || "人才模板"
              ),
              t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: z ? t.createElement(z) : void 0
                },
                "查看详情"
              )
            )
          )
        )
      )
    ),
    zt.length > Yn ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        {
          onClick: () => na((k) => k + 24)
        },
        `显示更多人才（已显示 ${Math.min(
          Yn,
          zt.length
        )} / ${zt.length}）`
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
      R ? t.createElement(R, {
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
  ) : null, po = [
    {
      key: "skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        I ? t.createElement(I, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: so
    },
    {
      key: "mcp",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        Z ? t.createElement(Z, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: co
    },
    {
      key: "experts",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        z ? t.createElement(z, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: mo
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
            icon: N ? t.createElement(N) : void 0,
            onClick: () => {
              xn(q, pe, {}), Zt(), gt(!0);
            },
            loading: be || ra || Le || tr || nr
          },
          "刷新"
        )
      )
    }),
    t.createElement(x, {
      items: po,
      activeKey: D,
      onChange: (k) => ee(k)
    }),
    // Skill source config modal
    t.createElement(Yc, {
      open: Gs,
      onClose: () => aa(!1),
      sources: He,
      onChange: (k) => {
        We(k), Zt(k);
      }
    }),
    // MCP source config modal
    t.createElement(Ga, {
      open: Zs,
      onClose: () => sa(!1),
      sources: Ws,
      onChange: (k) => ia(k),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    uo,
    // Expert source config modal
    t.createElement(td, {
      open: Ks,
      onClose: () => {
        ca(!1), gt();
      }
    }),
    t.createElement(Ga, {
      open: Qs,
      onClose: () => la(!1),
      sources: Js,
      onChange: (k) => oa(k),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    et ? t.createElement(
      M,
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
          t.createElement(at, {
            name: et.name,
            size: 40
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              G,
              { strong: !0, style: { fontSize: 16 } },
              et.name
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
              et.category ? t.createElement(
                g,
                { color: "blue", style: { fontSize: 10 } },
                Ut(et.category)
              ) : null,
              ...et.tags.filter(
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
              icon: z ? t.createElement(z) : void 0,
              style: Ke,
              onClick: async () => {
                await oo(et), wn(null);
              }
            },
            "创建专家"
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
          B,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          et.description
        )
      ),
      // Skills manifest hint
      et.skills_manifest ? t.createElement(
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
      et.instructions ? t.createElement(
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
      et.drivers && Object.keys(et.drivers).length > 0 ? t.createElement(
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
          ...Object.entries(et.drivers).map(
            ([k, ce]) => t.createElement(
              g,
              { key: k, color: "cyan", style: { fontSize: 11 } },
              `${k}${ce && ce.length > 0 ? ` (${ce.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function sd() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Ja = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Qa = {
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
function od() {
  const e = L(), t = e.React, { useEffect: n, useRef: r } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, i = (a == null ? void 0 : a.id) || "default", s = r(null), l = r(null);
  return n(() => {
    if (s.current === i) return;
    s.current = i, qn();
    const o = sd(), d = Ja[o] || Ja.en, c = Qa[o] || Qa.en;
    let m = !1;
    return (async () => {
      var u, p;
      try {
        const v = await Zn(i);
        if (m) return;
        const g = Bo(v);
        if (l.current) {
          try {
            l.current();
          } catch {
          }
          l.current = null;
        }
        const f = window.QwenPaw;
        (u = f == null ? void 0 : f.chat) != null && u.welcome && (g.length > 0 ? (l.current = f.chat.welcome.set("ugsci", {
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
      } catch (v) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${i}":`,
          v
        );
        const g = window.QwenPaw;
        if ((p = g == null ? void 0 : g.chat) != null && p.welcome && !m) {
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
      m = !0;
    };
  }, [i]), null;
}
const ld = 256;
let Qe = {};
const _r = /* @__PURE__ */ new Set(), Nn = () => _r.forEach((e) => e()), cd = (e) => (_r.add(e), () => _r.delete(e)), fn = /* @__PURE__ */ new Map();
function Ka(e, t) {
  const n = [];
  for (const i of t) {
    if (!i) continue;
    const s = Qe[Dt(e, i)] || Object.values(Qe).find((l) => l.uiId === i);
    s && n.push(s);
  }
  const r = `${e}::${t.join("\0")}`, a = fn.get(r);
  return a && a.length === n.length && a.every((i, s) => i === n[s]) ? a : (fn.set(r, n), n);
}
function Dt(e, t) {
  return `${e}::${t}`;
}
function jn(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? jn(e.genui) : e.ui && typeof e.ui == "object" ? jn(e.ui.genui) : null;
}
function ln(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, a = typeof r == "string" ? ln(r) : jn(n);
        if (a) return a;
      }
      return null;
    }
    return jn(t);
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
const Xa = /* @__PURE__ */ new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output"
]), dr = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function ms(e) {
  var r, a, i, s;
  if (!Array.isArray(e)) return [];
  const t = [], n = (l, o = !1) => {
    var m, u, p;
    if (!l || typeof l != "object") return;
    if (Array.isArray(l)) {
      const v = o ? l.map((g) => {
        var f;
        return ((f = g == null ? void 0 : g.data) == null ? void 0 : f.name) ?? (g == null ? void 0 : g.name);
      }).filter((g) => !!g).map((g) => String(g)) : [];
      if (o && v.length) {
        const g = v.some(
          (f) => dr.has(f)
        );
        for (const f of l) {
          const h = ((m = f == null ? void 0 : f.data) == null ? void 0 : m.output) ?? (f == null ? void 0 : f.output) ?? ((u = f == null ? void 0 : f.data) == null ? void 0 : u.result) ?? (f == null ? void 0 : f.result) ?? ((p = f == null ? void 0 : f.data) == null ? void 0 : p.content) ?? (f == null ? void 0 : f.content);
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
    const c = Xa.has(String(d.type || ""));
    Object.entries(d).forEach(
      ([v, g]) => n(g, c && v === "content")
    );
  };
  n(e);
  for (const l of e) {
    if (!l || typeof l != "object") continue;
    const o = l;
    if (!Xa.has(String(o.type || "")) || !Array.isArray(o.content))
      continue;
    const d = o.content, c = (a = (r = d[0]) == null ? void 0 : r.data) == null ? void 0 : a.name;
    if (!c) continue;
    const m = (s = (i = d[1]) == null ? void 0 : i.data) == null ? void 0 : s.output;
    if (m == null) continue;
    const u = typeof m == "string" ? m : JSON.stringify(m), p = ln(u) || (dr.has(String(c)) ? cn(u) : null);
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
function ps(e) {
  var s;
  const t = Dt(e.sessionId, e.uiId), n = Object.entries(Qe).filter(([, l]) => l.uiId === e.uiId).sort(([, l], [, o]) => o.revision - l.revision), r = Qe[t] || ((s = n[0]) == null ? void 0 : s[1]);
  if (r && e.revision < r.revision) return;
  const a = { ...Qe };
  for (const [l] of n) l !== t && delete a[l];
  a[t] = r && e.revision === r.revision ? { ...r, ...e, tree: r.tree } : e;
  const i = Object.entries(a).sort(
    ([, l], [, o]) => o.updatedAt - l.updatedAt
  );
  Qe = Object.fromEntries(i.slice(0, ld)), Nn();
}
function dd(e, t) {
  for (const n of ms(t))
    !n.ui_id || !n.tree || ps({
      schemaVersion: "1",
      uiId: n.ui_id,
      revision: n.revision || 1,
      tree: n.tree,
      sessionId: e,
      sourceToolCallId: n.tool_call_id,
      updatedAt: Date.now()
    });
}
const gs = {
  setSnapshot: ps,
  applyPatch(e, t, n, r) {
    var d, c;
    const a = (d = window.QwenPaw) == null ? void 0 : d.host, i = r || ((c = a == null ? void 0 : a.getCurrentSessionId) == null ? void 0 : c.call(a)) || "", s = Dt(i, e.ui_id), l = Qe[s] || Object.values(Qe).find((m) => m.uiId === e.ui_id);
    if (!l || n <= l.revision) return;
    Qe = {
      ...Object.fromEntries(
        Object.entries(Qe).filter(
          ([, m]) => m.uiId !== e.ui_id
        )
      ),
      [s]: { ...l, sessionId: i, tree: t, revision: n, updatedAt: Date.now() }
    }, Nn();
  },
  getSnapshot: (e, t) => Qe[Dt(e, t)],
  clearSession(e) {
    Qe = Object.fromEntries(
      Object.entries(Qe).filter(
        ([, t]) => t.sessionId !== e
      )
    );
    for (const t of [...fn.keys()])
      t.startsWith(`${e}::`) && fn.delete(t);
    Nn();
  },
  hydrateFromMessages: dd
};
function ud({ children: e }) {
  return e;
}
function md() {
  return gs;
}
function pd(e, t) {
  var i, s;
  const n = (s = (i = window.QwenPaw) == null ? void 0 : i.host) == null ? void 0 : s.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), a = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    cd,
    () => Ka(e, a),
    () => Ka(e, a)
  );
}
function gd(e) {
  gs.clearSession(e);
}
function fd() {
  Qe = {}, fn.clear(), Nn();
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
function yd(e) {
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
function Ya(e) {
  var p, v, g, f;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: i } = yd(
    e
  ), s = a === "in_progress" || a === "calling", l = a === "failed" || a === "error", o = ln(r), d = o ? null : cn(r);
  let c = 0;
  (v = o == null ? void 0 : o.tree) != null && v.root && (c = fs(o.tree.root));
  const m = i === "emit_ui_patch" || (o == null ? void 0 : o.kind) === "genui_patch", u = s ? m ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : l ? m ? "📝 UI Patch Error" : "🎨 UI Tree Error" : o ? m ? `📝 UI Patched (rev ${o.revision ?? "?"})` : `🎨 UI Tree (${c} nodes)` : m ? "📝 UI Patch" : "🎨 UI Tree";
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
      n.createElement("span", null, m ? "📝" : "🎨"),
      n.createElement("span", null, u),
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
function fs(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children))
    for (const n of e.children) t += fs(n);
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
function hd(e) {
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
function ei(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: i } = hd(
    e
  ), s = i === "get_genui_guide", l = a === "in_progress" || a === "calling";
  let o = s ? "GenUI 指南" : "组件目录", d = r;
  try {
    const m = r ? JSON.parse(r) : null;
    if (m && typeof m == "object") {
      const u = m.components;
      Array.isArray(u) ? (o = `组件目录（${u.length} 个 kind）`, d = u.map((p) => p == null ? void 0 : p.kind).filter(Boolean).join(" · ")) : (m.purpose || m.layout_structure) && (o = "GenUI 指南", d = String(
        m.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。"
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
const bd = /* @__PURE__ */ new Set(["send_message"]), ti = 1e4, vd = 500, ni = {};
function Ed() {
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
  return new Set(bd);
}
function wd(e) {
  const t = Date.now(), n = ni[e] || 0;
  return t - n < vd ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (ni[e] = t, !1);
}
function xd(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const a = t[r];
    return a == null ? "" : typeof a == "string" ? a : JSON.stringify(a);
  });
}
function Cr(e, t = {}) {
  var i, s, l, o, d, c, m;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, a = Ed();
  if (!a.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(a).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (wd(r))
    return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const u = t.formValues || {};
    let p = ((i = n.payload) == null ? void 0 : i.content) || ((s = n.payload) == null ? void 0 : s.message) || "";
    const v = /\{\{\s*[\w.-]+\s*\}\}/.test(p);
    return p = xd(p, u).trim(), p && !v && Object.keys(u).length > 0 && (p += `
${Object.entries(u).map(
      ([f, h]) => `${f}: ${typeof h == "string" ? h : JSON.stringify(h)}`
    ).join(`
`)}`), !p && Object.keys(u).length > 0 && (p = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(u).map(
      ([h, y]) => `${h}: ${typeof y == "string" ? y : JSON.stringify(y)}`
    ).join(`
`)}`), !p || !p.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : p.length > ti ? (console.warn(
      "[ugsci.genui] send_message: content length " + p.length + " exceeds max " + ti
    ), { ok: !1, message: "消息内容过长" }) : !((d = (o = (l = window.QwenPaw) == null ? void 0 : l.chat) == null ? void 0 : o.sendMessage) != null && d.call(o, p)) ? (console.info(
      "[ugsci.genui] send_message: could not find chat sender, content:",
      p
    ), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  if (r === "open_url") {
    const u = ((c = n.payload) == null ? void 0 : c.url) || ((m = n.payload) == null ? void 0 : m.href) || "", p = typeof u == "string" ? u.trim() : "";
    return /^https?:\/\//i.test(p) ? (window.open(p, "_blank", "noopener,noreferrer"), { ok: !0, message: "已打开链接" }) : (console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed"), { ok: !1, message: "仅允许 http(s) 链接" });
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const ot = /* @__PURE__ */ new Map(), yn = /* @__PURE__ */ new Map(), Sd = 128, Mn = /* @__PURE__ */ new Map();
function Bn(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function kd(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function _d(e) {
  return e.startsWith("workspace://");
}
function Cd(e) {
  return _d(e) ? e.slice(12) : e;
}
async function Td(e) {
  if (!e) return null;
  if (Bn(e)) return e;
  if (ot.has(e))
    return ot.get(e) ?? null;
  if (Mn.has(e))
    return Mn.get(e);
  const t = Md(e);
  Mn.set(e, t);
  try {
    const n = await t;
    if (!ot.has(e) && ot.size >= Sd) {
      const r = ot.keys().next().value;
      if (r !== void 0) {
        const a = ot.get(r);
        a != null && a.startsWith("blob:") && URL.revokeObjectURL(a), ot.delete(r);
      }
    }
    return ot.set(e, n), n && yn.delete(e), n;
  } finally {
    Mn.delete(e);
  }
}
async function Md(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const a = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return yn.set(e, a), console.warn("[ugsci.genui]", a), null;
  }
  const r = Cd(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const a = await n.resolveWorkspaceBlob(r);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await Id(r, n);
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
async function Id(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (kd(e) && (a != null && a.filePreviewUrl) ? n = a.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
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
function ri(e) {
  return e ? Bn(e) ? e : ot.get(e) ?? null : null;
}
function ai(e) {
  return yn.get(e) ?? null;
}
function Ad() {
  for (const e of ot.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  ot.clear(), yn.clear();
}
const ys = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput"
], Lt = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96"
], $d = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function Ce(e) {
  return typeof e == "string" ? e : e == null ? "" : String(e);
}
function rt(e) {
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
  const t = e.props || {}, n = Ce(t.name);
  if (n) return n;
  const r = Ce(t.label), a = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return a ? a[1].toLowerCase() : r || Ce(e.nodeId);
}
function hs(e) {
  return ys.includes(e);
}
function bs(e) {
  return Math.min(Math.max(rt(e) || 2, 1), 4);
}
function zd(e, t, n = 6) {
  const r = rt(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function Rd(e) {
  const n = (Ce(e) || "16:9").split(":"), r = Number(n[0]), a = Number(n[1]);
  return r > 0 && a > 0 ? `${r} / ${a}` : "16 / 9";
}
function Ld(e) {
  return /^https?:\/\//i.test(Ce(e).trim());
}
function nt(e, t) {
  const n = {}, r = `${rt(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${rt(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = Ce(t.align)), t.justify && (n.justifyContent = Ce(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const a = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, i = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${zd(
      t.columns,
      a,
      i
    )}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${rt(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${rt(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${rt(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = Rd(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${rt(t.size) || 16}px`);
  return n;
}
function qr(e, t) {
  function n(m) {
    return typeof m == "string" ? m : m == null ? "" : String(m);
  }
  function r(m) {
    if (typeof m == "number" && Number.isFinite(m)) return m;
    if (typeof m == "string") {
      const u = Number(m);
      return Number.isFinite(u) ? u : 0;
    }
    return 0;
  }
  function a(m) {
    return Array.isArray(m) ? m : [];
  }
  const i = e.generator && typeof e.generator == "object" ? e.generator : {}, s = a(i.coefficients).map(n).filter(Boolean), l = n(i.type) === "polynomial" || s.length > 0;
  let o = a(e.categories).map(n), d = a(e.series);
  if (l && t) {
    const m = s.length > 0 ? s : ["a", "b", "c", "d", "e"], u = typeof i.xMin == "number" ? i.xMin : -3, p = typeof i.xMax == "number" ? i.xMax : 3, v = Math.min(
      Math.max(r(i.samples) || 61, 10),
      400
    ), g = Array.from(
      { length: v },
      (h, y) => u + (p - u) * y / Math.max(v - 1, 1)
    ), f = m.map((h) => r(t[h]));
    o = g.map((h) => Number(h.toFixed(2)).toString()), d = [
      {
        name: n(i.label) || "f(x)",
        values: g.map(
          (h) => f.reduce(
            (y, E, b) => y + E * Math.pow(h, f.length - b - 1),
            0
          )
        )
      }
    ];
  }
  const c = d.map((m, u) => {
    const p = m && typeof m == "object" ? m : {};
    return {
      name: n(p.name) || `Series ${u + 1}`,
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
function vs(e, t, n = 640) {
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
    const p = t.series[0].values.map((E) => Math.abs(E)), v = p.reduce((E, b) => E + b, 0) || 1, g = n / 2, f = a / 2, h = Math.min(n, a) / 2 - 20;
    let y = -Math.PI / 2;
    if (p.forEach((E, b) => {
      const x = E / v * Math.PI * 2, j = g + h * Math.cos(y), O = f + h * Math.sin(y), M = g + h * Math.cos(y + x), S = f + h * Math.sin(y + x), N = document.createElementNS(i.namespaceURI, "path");
      N.setAttribute(
        "d",
        `M ${g} ${f} L ${j} ${O} A ${h} ${h} 0 ${x > Math.PI ? 1 : 0} 1 ${M} ${S} Z`
      ), N.setAttribute("fill", r[b % r.length]), i.appendChild(N), y += x;
    }), e.appendChild(i), t.showLegend) {
      const E = document.createElement("div");
      E.className = "legend", p.forEach((b, x) => {
        const j = document.createElement("span"), O = document.createElement("i");
        O.style.background = r[x % r.length], j.append(
          O,
          document.createTextNode(
            `${t.categories[x] || `#${x + 1}`}: ${b}`
          )
        ), E.appendChild(j);
      }), e.appendChild(E);
    }
    return;
  }
  const s = t.series.flatMap((p) => p.values), l = Math.max(...s, 0), o = Math.min(...s, 0), d = l - o || 1, c = (p) => a - 24 - (p - o) / d * (a - 44), m = (p) => 30 + p * (n - 50) / Math.max(t.categories.length - 1, 1), u = document.createElementNS(i.namespaceURI, "line");
  if (u.setAttribute("x1", "30"), u.setAttribute("x2", String(n - 15)), u.setAttribute("y1", String(c(0))), u.setAttribute("y2", String(c(0))), u.setAttribute("stroke", "#d9d9d9"), i.appendChild(u), t.series.forEach((p, v) => {
    const g = r[v % r.length];
    if (t.chartType === "bar") {
      const y = (n - 50) / Math.max(t.categories.length, 1), E = Math.max(1, y / t.series.length - 3);
      p.values.forEach((b, x) => {
        const j = document.createElementNS(i.namespaceURI, "rect"), O = Math.min(c(b), c(0)), M = Math.max(c(b), c(0));
        j.setAttribute(
          "x",
          String(30 + x * y + v * (E + 2))
        ), j.setAttribute("y", String(O)), j.setAttribute("width", String(E)), j.setAttribute("height", String(Math.max(1, M - O))), j.setAttribute("fill", g), i.appendChild(j);
      });
      return;
    }
    const f = p.values.map((y, E) => `${m(E)},${c(y)}`).join(" "), h = document.createElementNS(i.namespaceURI, "polyline");
    h.setAttribute("points", f), h.setAttribute(
      "fill",
      t.chartType === "area" ? `${g}22` : "none"
    ), h.setAttribute("stroke", g), h.setAttribute("stroke-width", "2"), i.appendChild(h);
  }), e.appendChild(i), t.showLegend) {
    const p = document.createElement("div");
    p.className = "legend", t.series.forEach((v, g) => {
      const f = document.createElement("span"), h = document.createElement("i");
      h.style.background = r[g % r.length], f.append(h, document.createTextNode(v.name)), p.appendChild(f);
    }), e.appendChild(p);
  }
}
const Pd = {
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
}, Od = {
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
function Es(e) {
  const t = Ce(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = Od[n];
  return r ? { kind: "svg", paths: Pd[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
}
function Nd(e, t, n = {}) {
  const r = Es(t), a = n.size && n.size > 0 ? n.size : 16;
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
function ws(e, t = {}) {
  if (hs(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[hn(e)] = r);
  }
  for (const n of e.children || []) ws(n, t);
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
  const a = r.useMemo(() => ws(e), [e]), [i, s] = r.useState(
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
      setValue: (c, m) => s((u) => ({
        ...u,
        [c]: m
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
const ne = (e) => typeof e == "string" ? e : e != null ? String(e) : "", yt = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, ht = (e) => !!e, an = (e) => Array.isArray(e) ? e : [], Bd = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((a) => Object.is(e[a], t[a]));
}, ii = {
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
}, Hd = new Set(ys);
function Ud(e) {
  const t = [], n = (r) => {
    Hd.has(r.kind) && t.push(r);
    for (const a of r.children || []) n(a);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let mr = null;
function Fr(e) {
  return mr || (mr = e.createContext(null)), mr;
}
function Dd({ node: e }) {
  var v;
  const t = (v = window.QwenPaw) == null ? void 0 : v.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const a = e.props || {}, i = n.useContext(Jn(n)), [s, l] = n.useState({}), [o, d] = n.useState(
    null
  ), c = n.useMemo(
    () => Ud(e),
    [e]
  ), m = n.useMemo(() => {
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
        ...m,
        ...g,
        ...(i == null ? void 0 : i.values) || {}
      };
      return Bd(g, f) ? g : f;
    }),
    [m, i == null ? void 0 : i.values]
  );
  const u = n.useMemo(
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
      var b;
      return (b = E.props) == null ? void 0 : b.required;
    }).find((E) => {
      const b = hn(E), x = s[b];
      return x == null || x === "" || Array.isArray(x) && x.length === 0;
    });
    if (g) {
      d({
        ok: !1,
        message: `${ne((h = g.props) == null ? void 0 : h.label) || ne((y = g.props) == null ? void 0 : y.name) || "必填项"}不能为空`
      });
      return;
    }
    const f = a.action && typeof a.action == "object" ? a.action : { type: "submit_form", payload: {} };
    d(
      Cr(f, {
        formValues: s,
        formId: ne(a.formId) || e.nodeId
      })
    );
  };
  return n.createElement(
    Fr(n).Provider,
    { value: u },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a.title ? n.createElement(
        "div",
        { style: { fontWeight: 600, marginBottom: 8 } },
        ne(a.title)
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
        ne(a.submitLabel) || "提交"
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
function Vd({
  node: e,
  fieldType: t
}) {
  var h, y, E;
  const n = (h = window.QwenPaw) == null ? void 0 : h.host, r = n == null ? void 0 : n.React, a = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const i = e.props || {}, s = r.useContext(Fr(r)), l = r.useContext(Jn(r)), o = s || l, [d, c] = r.useState(
    i.value ?? i.checked ?? ""
  ), m = hn(e), u = i.value ?? i.checked ?? "", p = o ? ((y = o.values) == null ? void 0 : y[m]) ?? u : d, v = (b) => {
    const x = b != null && b.target ? t === "Switch" ? b.target.checked : b.target.value : b;
    o ? o.setValue(m, x) : c(x);
  }, g = (b) => r.createElement(
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
      ne(i.label),
      i.required ? r.createElement(
        "span",
        { style: { color: ze.error } },
        " *"
      ) : null
    ) : null,
    b,
    i.description ? r.createElement(
      "span",
      { style: { fontSize: 11, color: ze.muted } },
      ne(i.description)
    ) : null
  ), f = ne(i.label) || ne(i.placeholder) || m;
  return t === "Input" ? g(
    r.createElement(a.Input || "input", {
      "aria-label": f,
      placeholder: ne(i.placeholder),
      value: p,
      onChange: v,
      size: "small"
    })
  ) : t === "NumberInput" ? g(
    r.createElement(a.InputNumber || "input", {
      "aria-label": f,
      value: p,
      min: i.min,
      max: i.max,
      step: i.step,
      onChange: v,
      size: "small",
      style: { width: "100%" }
    })
  ) : t === "Textarea" ? g(
    r.createElement(((E = a.Input) == null ? void 0 : E.TextArea) || "textarea", {
      "aria-label": f,
      placeholder: ne(i.placeholder),
      value: p,
      rows: yt(i.rows) || 3,
      onChange: v,
      style: { width: "100%" }
    })
  ) : t === "Select" ? g(
    r.createElement(
      a.Select || "select",
      {
        "aria-label": f,
        placeholder: ne(i.placeholder),
        value: p || void 0,
        onChange: v,
        size: "small",
        style: { width: "100%" }
      },
      an(i.options).map(
        (b, x) => {
          var j;
          return r.createElement(
            ((j = a.Select) == null ? void 0 : j.Option) || "option",
            {
              key: x,
              value: ne(typeof b == "object" ? b.value : b)
            },
            ne(typeof b == "object" ? b.label : b)
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
      onChange: v,
      size: "small"
    }),
    r.createElement("span", null, ne(i.label))
  ) : t === "Slider" ? g(
    r.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 8 } },
      r.createElement(a.Slider || "input", {
        type: "range",
        value: yt(p),
        min: i.min ?? 0,
        max: i.max ?? 100,
        step: i.step ?? 1,
        onChange: v,
        style: { flex: 1 }
      }),
      r.createElement(
        "span",
        { style: { minWidth: 32, fontSize: 12 } },
        ne(p)
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
    r.createElement("span", null, ne(i.label) || "选择文件"),
    r.createElement("input", {
      type: "file",
      multiple: ht(i.multiple),
      accept: ne(i.accept) || void 0,
      onChange: (b) => o == null ? void 0 : o.setValue(
        m,
        Array.from(b.target.files || []).map((x) => ({
          name: x.name,
          size: x.size,
          type: x.type
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
  const s = e.props || {}, l = a.useContext(Fr(a)), [o, d] = a.useState(ht(s.checked)), [c, m] = a.useState(
    null
  ), u = () => {
    n && d((v) => !v), s.action && typeof s.action == "object" ? m(
      Cr(s.action, {
        formValues: l == null ? void 0 : l.values,
        formId: l ? "form" : void 0
      })
    ) : t && typeof s.href == "string" && m(
      Cr({ type: "open_url", payload: { url: s.href } })
    );
  };
  return a.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    a.createElement(
      i.Button || "button",
      {
        type: t ? "link" : (n ? o : ne(s.variant) === "primary") ? "primary" : "default",
        size: "small",
        disabled: ht(s.disabled),
        loading: ht(s.loading),
        onClick: u
      },
      ne(s.label) || "Action"
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
let si = null, In = null;
function qd(e) {
  return In && si === e || (si = e, In = class extends e.Component {
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
function Fd({ node: e }) {
  var o;
  const t = (o = window.QwenPaw) == null ? void 0 : o.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, a = bn(n), i = e.props || {}, s = e.children || [];
  return Wd(
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
let An = null, oi = null;
function bn(e) {
  return An && oi === e || (An = e.memo(
    Fd,
    (t, n) => t.node === n.node
  ), oi = e), An;
}
function Gd({
  node: e
}) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    qd(n),
    { node: e },
    n.createElement(bn(n), { node: e })
  );
}
function Wd(e, t, n, r, a, i) {
  var s, l;
  switch (n.kind) {
    // ── Layout ───────────────────────────────────────────────────────────
    case "Stack":
      return e.createElement(
        "div",
        { style: nt("Stack", r) },
        i()
      );
    case "Row":
      return e.createElement(
        "div",
        { style: nt("Row", r) },
        i()
      );
    case "Grid":
      return e.createElement(
        "div",
        { style: nt("Grid", r) },
        i()
      );
    case "Spacer":
      return e.createElement("div", { style: nt("Spacer", r) });
    case "ScrollArea":
      return e.createElement(
        "div",
        { style: nt("ScrollArea", r) },
        i()
      );
    case "AspectBox":
      return e.createElement(
        "div",
        { style: nt("AspectBox", r) },
        i()
      );
    // ── Text ─────────────────────────────────────────────────────────────
    case "Text":
      return e.createElement(
        "div",
        {
          style: {
            fontSize: ii[ne(r.size)] || ii.base,
            color: ze[ne(r.color)] || ze.default,
            fontWeight: ht(r.bold) ? "bold" : "normal",
            lineHeight: 1.6
          }
        },
        ne(r.value)
      );
    case "Heading": {
      const o = bs(r.level), d = {
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
        ne(r.value)
      );
    }
    case "Divider":
      return e.createElement(
        t.Divider || "hr",
        r.label ? { children: ne(r.label) } : {}
      );
    case "Markdown": {
      const o = (s = window.QwenPaw) == null ? void 0 : s.host, d = o == null ? void 0 : o.ReactMarkdown;
      if (d) {
        const c = o != null && o.remarkGfm ? [o.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(d, {
            children: ne(r.content || r.value),
            remarkPlugins: c
          })
        );
      }
      return e.createElement(
        "div",
        { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } },
        ne(r.content || r.value)
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
        ne(r.code)
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
        r.icon ? e.createElement("span", { style: { fontSize: 20 } }, ne(r.icon)) : null,
        e.createElement(
          "div",
          null,
          e.createElement(
            "div",
            { style: { fontSize: 16, fontWeight: 600 } },
            ne(r.title)
          ),
          r.subtitle ? e.createElement(
            "div",
            { style: { fontSize: 12, color: ze.muted } },
            ne(r.subtitle)
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
              ne(d.key)
            ),
            e.createElement(
              "span",
              { style: { fontWeight: 500, fontSize: 13 } },
              ne(d.value)
            )
          )
        )
      );
    }
    // ── Status / Display ────────────────────────────────────────────────
    case "Badge":
      return e.createElement(t.Tag || "span", {
        color: ne(r.variant) || "default",
        children: ne(r.value)
      });
    case "Tag":
      return e.createElement(t.Tag || "span", {
        color: ne(r.color) || "default",
        children: ne(r.label)
      });
    case "Stat":
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 2 } },
        e.createElement(
          "span",
          { style: { fontSize: 12, color: ze.muted } },
          ne(r.label)
        ),
        e.createElement(
          "span",
          { style: { fontSize: 20, fontWeight: "bold" } },
          ne(r.value)
        ),
        r.delta ? e.createElement(
          "span",
          {
            style: {
              fontSize: 12,
              color: ne(r.trend) === "up" ? ze.success : ne(r.trend) === "down" ? ze.error : ze.muted
            }
          },
          ne(r.delta)
        ) : null
      );
    case "Progress":
      return e.createElement(t.Progress || "div", {
        percent: yt(r.value),
        size: "small"
      });
    case "Skeleton": {
      const o = yt(r.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: o }).map(
          (d, c) => e.createElement(t.Skeleton || "div", {
            key: c,
            active: ht(r.active),
            title: !1,
            paragraph: { rows: 1 }
          })
        )
      );
    }
    case "Avatar":
      return e.createElement(Jd, {
        src: ne(r.src),
        name: ne(r.name),
        size: yt(r.size) || 32
      });
    case "Icon": {
      const o = Es(r.name), d = yt(r.size) || 16, c = ze[ne(r.color)] || ze.default;
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
          (m, u) => e.createElement("path", { key: u, d: m })
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
          title: r.title ? ne(r.title) : void 0,
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
              ne(r.title)
            ),
            e.createElement(
              "div",
              { style: { fontSize: 24, fontWeight: "bold" } },
              ne(r.value)
            )
          ),
          r.icon ? e.createElement(
            "span",
            { style: { fontSize: 32 } },
            ne(r.icon)
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
              ne(r.title)
            ),
            e.createElement(
              "div",
              { style: { fontSize: 24, fontWeight: "bold" } },
              ne(r.value)
            ),
            r.delta ? e.createElement(
              "span",
              {
                style: {
                  fontSize: 12,
                  color: ne(r.trend) === "up" ? ze.success : ne(r.trend) === "down" ? ze.error : ze.muted
                }
              },
              `${ne(r.delta)} ${r.period ? ne(r.period) : ""}`.trim()
            ) : null
          ),
          r.icon ? e.createElement(
            "span",
            { style: { fontSize: 32 } },
            ne(r.icon)
          ) : null
        )
      );
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", {
        type: ne(r.severity) === "success" ? "success" : ne(r.severity) === "warning" ? "warning" : ne(r.severity) === "error" ? "error" : "info",
        message: r.title ? ne(r.title) : void 0,
        description: ne(r.message),
        showIcon: !0,
        style: { margin: "4px 0" }
      });
    case "Callout":
      return e.createElement(t.Alert || "div", {
        type: ne(r.variant) === "tip" ? "success" : ne(r.variant) === "warning" ? "warning" : ne(r.variant) === "important" ? "error" : "info",
        message: r.title ? ne(r.title) : void 0,
        description: ne(r.message),
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
              background: ne(r.status) === "done" ? ze.success : ne(r.status) === "pending" ? ze.warning : ze.primary,
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
              ne(r.title)
            ),
            r.date ? e.createElement(
              "div",
              { style: { fontSize: 12, color: ze.muted } },
              ne(r.date)
            ) : null,
            r.description ? e.createElement(
              "div",
              { style: { fontSize: 13, marginTop: 4 } },
              ne(r.description)
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
          ne(r.title)
        ) : null,
        e.createElement(
          "div",
          { style: nt("KpiBoard", r) },
          i()
        )
      );
    case "FeatureGrid":
      return e.createElement(
        "div",
        { style: { ...nt("FeatureGrid", r), margin: "4px 0" } },
        i()
      );
    case "Stepper": {
      const o = an(r.steps).map((c) => ne(c)), d = yt(r.current);
      return e.createElement(
        t.Steps || "div",
        { current: d, size: "small", style: { margin: "4px 0" } },
        ...o.map(
          (c, m) => {
            var u;
            return e.createElement(((u = t.Steps) == null ? void 0 : u.Item) || "div", {
              key: m,
              title: c
            });
          }
        )
      );
    }
    // ── Table / List ────────────────────────────────────────────────────
    case "Table": {
      const o = an(r.headers).map((u) => ne(u)), c = a.filter((u) => u.kind === "TableRow").map((u, p) => {
        const v = (u.children || []).filter(
          (f) => f.kind === "TableCell"
        ), g = { key: p };
        return o.forEach((f, h) => {
          var E, b;
          const y = (b = (E = v[h]) == null ? void 0 : E.props) == null ? void 0 : b.value;
          g[f] = y == null ? "" : ne(y);
        }), g;
      }), m = o.map((u) => ({ title: u, dataIndex: u, key: u }));
      return e.createElement(t.Table || "table", {
        dataSource: c,
        columns: m,
        size: ht(r.compact) ? "small" : "middle",
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
            var m, u, p;
            return e.createElement(
              ((m = t.List) == null ? void 0 : m.Item) || "li",
              { key: c },
              (u = d.props) != null && u.icon ? e.createElement(
                "span",
                { style: { marginRight: 6 } },
                ne(d.props.icon)
              ) : null,
              ne((p = d.props) == null ? void 0 : p.value)
            );
          }
        )
      );
    }
    case "ImageGallery": {
      const o = a.filter((d) => d.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...nt("ImageGallery", r), margin: "4px 0" } },
        ...o.map((d, c) => {
          const m = d.props || {};
          return e.createElement(Tr, {
            key: c,
            src: ne(m.src),
            alt: ne(m.alt),
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
          src: ne(r.src),
          alt: ne(r.alt),
          style: {
            maxWidth: "100%",
            borderRadius: ht(r.rounded) ? "8px" : void 0,
            maxHeight: r.maxHeight ? `${yt(r.maxHeight)}px` : void 0
          }
        }),
        r.caption ? e.createElement(
          "div",
          { style: { fontSize: 12, color: ze.muted } },
          ne(r.caption)
        ) : null
      );
    case "Chart":
      return e.createElement(Zd, { props: r });
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
      return e.createElement(Vd, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(Dd, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", {
        color: ne(r.color) || "default",
        closable: !0,
        onClose: () => {
        },
        children: ne(r.label)
      });
    case "ChipGroup": {
      const o = an(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
        ...o.map(
          (d, c) => e.createElement(t.Tag || "span", { key: c }, ne(d))
        )
      );
    }
    // ── Tabs / Accordion ────────────────────────────────────────────────
    case "Tabs": {
      const o = bn(e), c = a.filter((m) => m.kind === "TabItem").map((m) => {
        var u, p, v;
        return {
          key: ne((u = m.props) == null ? void 0 : u.key) || ne((p = m.props) == null ? void 0 : p.tab),
          label: ne((v = m.props) == null ? void 0 : v.tab),
          children: (m.children || []).map(
            (g, f) => e.createElement(o, { key: g.nodeId || f, node: g })
          )
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, {
        items: c,
        defaultActiveKey: ne(r.activeKey) || ((l = c[0]) == null ? void 0 : l.key)
      }) : e.createElement(
        "div",
        null,
        ...c.map(
          (m, u) => e.createElement(
            "div",
            { key: u },
            e.createElement(
              "div",
              { style: { fontWeight: 600, marginBottom: 4 } },
              m.label
            ),
            m.children
          )
        )
      );
    }
    case "TabItem":
      return e.createElement("div", null, i());
    case "Accordion": {
      const o = bn(e), d = a.filter((c) => c.kind === "AccordionItem");
      if (t.Collapse) {
        const c = d.map((m) => {
          var u, p, v;
          return {
            key: ne((u = m.props) == null ? void 0 : u.key) || ne((p = m.props) == null ? void 0 : p.header),
            label: ne((v = m.props) == null ? void 0 : v.header),
            children: (m.children || []).map(
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
          (c, m) => {
            var u;
            return e.createElement(
              "details",
              { key: m },
              e.createElement(
                "summary",
                {
                  style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" }
                },
                ne((u = c.props) == null ? void 0 : u.header)
              ),
              e.createElement(
                "div",
                { style: { paddingLeft: 12 } },
                (c.children || []).map(
                  (p, v) => e.createElement(o, { key: p.nodeId || v, node: p })
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
        e.createElement("summary", null, ne(r.label) || "Debug JSON"),
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
function Zd({
  props: e
}) {
  var j, O;
  const t = (O = (j = window.QwenPaw) == null ? void 0 : j.host) == null ? void 0 : O.React;
  if (!t) return null;
  const n = t.useContext(Jn(t)), r = qr(e, n == null ? void 0 : n.values), a = r.chartType, i = r.title, s = r.categories, l = r.series, o = r.height, d = r.showLegend, c = 400;
  if (r.empty)
    return t.createElement(
      "div",
      { style: { padding: 12, color: ze.muted, fontSize: 12 } },
      "Chart: no data"
    );
  if (a === "pie") {
    const M = l[0].values.map((W) => Math.abs(W)), S = M.reduce((W, _) => W + _, 0) || 1, N = c / 2, V = o / 2, C = Math.min(c, o) / 2 - 20;
    let I = -Math.PI / 2;
    const R = M.map((W, _) => {
      const $ = W / S * 2 * Math.PI, z = N + C * Math.cos(I), A = V + C * Math.sin(I), P = N + C * Math.cos(I + $), Z = V + C * Math.sin(I + $), G = $ > Math.PI ? 1 : 0, B = `M ${N} ${V} L ${z} ${A} A ${C} ${C} 0 ${G} 1 ${P} ${Z} Z`;
      return I += $, {
        path: B,
        color: Lt[_ % Lt.length],
        label: s[_] || `#${_ + 1}`,
        val: W
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
        ...R.map(
          (W, _) => t.createElement("path", {
            key: _,
            d: W.path,
            fill: W.color,
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
        ...R.map(
          (W, _) => t.createElement(
            "span",
            {
              key: _,
              style: { display: "flex", alignItems: "center", gap: 4 }
            },
            t.createElement("span", {
              style: {
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 2,
                background: W.color
              }
            }),
            `${W.label}: ${W.val}`
          )
        )
      ) : null
    );
  }
  const m = l.flatMap((M) => M.values), u = Math.max(...m, 0), p = Math.min(...m, 0), v = u - p || 1, g = s.length > 0 ? (c - 40) / s.length : 0, f = l.length > 0 ? Math.max(1, g / l.length - 2) : 0, h = s.length > 1 ? (c - 40) / (s.length - 1) : 0, y = Math.max(1, Math.ceil(s.length / 8)), E = (M) => o - 20 - (M - p) / v * (o - 40), b = E(0), x = (M) => 30 + M * h;
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
      ...[0, 0.25, 0.5, 0.75, 1].map((M, S) => {
        const N = o - 20 - M * (o - 40);
        return t.createElement("line", {
          key: `g${S}`,
          x1: 30,
          y1: N,
          x2: c - 10,
          y2: N,
          stroke: "var(--ant-color-border-secondary, #f0f0f0)",
          strokeWidth: 1
        });
      }),
      ...s.map(
        (M, S) => S % y === 0 || S === s.length - 1 ? t.createElement(
          "text",
          {
            key: `x${S}`,
            x: x(S),
            y: o - 6,
            fontSize: 10,
            fill: ze.muted,
            textAnchor: "middle"
          },
          M.length > 6 ? M.slice(0, 6) + "…" : M
        ) : null
      ),
      ...l.map((M, S) => {
        const N = Lt[S % Lt.length];
        if (a === "bar")
          return M.values.map(
            (I, R) => t.createElement("rect", {
              key: `b${S}-${R}`,
              x: 30 + R * g + S * (f + 2) + 1,
              y: Math.min(E(I), b),
              width: f,
              height: Math.abs(b - E(I)),
              fill: N,
              rx: 2
            })
          );
        const V = M.values.map((I, R) => `${x(R)},${E(I)}`).join(" "), C = [
          t.createElement("polyline", {
            key: `l${S}`,
            points: V,
            fill: "none",
            stroke: N,
            strokeWidth: 2
          })
        ];
        if (a === "area") {
          const I = `${x(0)},${o - 20} ${V} ${x(
            M.values.length - 1
          )},${o - 20}`;
          C.unshift(
            t.createElement("polygon", {
              key: `a${S}`,
              points: I,
              fill: N,
              opacity: 0.15
            })
          );
        }
        return C;
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
        (M, S) => t.createElement(
          "span",
          {
            key: S,
            style: { display: "flex", alignItems: "center", gap: 4 }
          },
          t.createElement("span", {
            style: {
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 2,
              background: Lt[S % Lt.length]
            }
          }),
          M.name
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
    ri(e.src) || (Bn(e.src) ? e.src : null)
  ), [l, o] = r(
    ai(e.src)
  );
  return a(() => {
    if (!e.src) return;
    if (Bn(e.src)) {
      s(e.src), o(null);
      return;
    }
    const c = ri(e.src);
    if (c) {
      s(c), o(null);
      return;
    }
    s(null), o(null);
    let m = !1;
    return Td(e.src).then((u) => {
      m || (s(u), o(u ? null : ai(e.src)));
    }), () => {
      m = !0;
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
function Jd(e) {
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
const Qd = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
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
@media print { body { padding: 0; } }`, li = {
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
function Kd(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function Xd(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function re(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = Ce(n)), r;
}
function $n(e, t) {
  Object.assign(e.style, t);
}
function en(e, t, n) {
  for (const r of t || [])
    e.appendChild(Gr(r, n));
  return e;
}
function ci(e, t, n) {
  return t && e.appendChild(re("div", "muted small", t)), e.appendChild(re("div", "display-value", n)), e;
}
function xs(e, t, n, r) {
  const a = Ce(e);
  if (r.missing.has(a)) {
    const s = re(
      "div",
      `media-unavailable ${n}`.trim(),
      "此媒体未能离线嵌入"
    );
    return s.setAttribute("role", "img"), s.setAttribute("aria-label", Ce(t)), s;
  }
  const i = re("img", n);
  return i.src = r.media[a] || a, i.alt = Ce(t), i;
}
function Yd(e, t, n) {
  return e ? xs(e, t, "avatar", n) : re(
    "span",
    "avatar avatar-fallback",
    Ce(t).charAt(0).toUpperCase()
  );
}
function eu(e) {
  const t = re("div", "markdown");
  let n = null;
  for (const r of Ce(e).split(/\r?\n/)) {
    const a = r.match(/^(#{1,4})\s+(.*)$/), i = r.match(/^\s*[-*]\s+(.*)$/);
    a ? (n = null, t.appendChild(re(`h${a[1].length}`, "", a[2]))) : i ? (n || (n = re("ul"), t.appendChild(n)), n.appendChild(re("li", "", i[1]))) : r.trim() ? (n = null, t.appendChild(re("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function tu(e, t) {
  const n = e.props || {}, r = e.kind, a = hn(e), i = re("label", "field");
  n.label && r !== "Switch" && i.appendChild(
    re(
      "span",
      "field-label",
      `${Ce(n.label)}${n.required ? " *" : ""}`
    )
  );
  let s;
  if (r === "Textarea") {
    const o = re("textarea");
    o.rows = rt(n.rows) || 3, o.placeholder = Ce(n.placeholder), s = o;
  } else if (r === "Select") {
    const o = re("select");
    for (const d of rn(n.options)) {
      const c = re("option"), m = d && typeof d == "object" ? d : null;
      c.value = Ce(m ? m.value : d), c.textContent = Ce(m ? m.label : d), o.appendChild(c);
    }
    s = o;
  } else {
    const o = re("input");
    o.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (o.min = Ce(n.min)), n.max != null && (o.max = Ce(n.max)), n.step != null && (o.step = Ce(n.step)), r === "FileInput" ? (n.accept && (o.accept = Ce(n.accept)), o.multiple = un(n.multiple)) : o.placeholder = Ce(n.placeholder), s = o;
  }
  const l = Object.prototype.hasOwnProperty.call(t.values, a) ? t.values[a] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const o = s;
    o.checked = un(l), o.checked ? o.setAttribute("checked", "") : o.removeAttribute("checked");
  } else if (r === "Textarea")
    s.value = Ce(l), s.textContent = Ce(l);
  else if (r === "Select") {
    const o = Ce(l);
    s.value = o;
    for (const d of Array.from(s.options))
      d.value === o ? d.setAttribute("selected", "") : d.removeAttribute("selected");
  } else r !== "FileInput" && (s.value = Ce(l), s.setAttribute("value", Ce(l)));
  if (s.setAttribute("data-genui-field", a), s.setAttribute("data-genui-kind", r), r === "Switch") {
    const o = re("span", "switch-line");
    o.append(s, re("span", "", n.label)), i.appendChild(o);
  } else if (r === "Slider") {
    const o = re("span", "slider-line");
    o.append(s, re("output", "slider-value", l)), i.appendChild(o);
  } else
    i.appendChild(s);
  return n.description && i.appendChild(re("small", "description", n.description)), i;
}
function Gr(e, t) {
  var i, s, l, o, d, c, m;
  if (!e || typeof e != "object") return re("div");
  const n = e.props || {}, r = e.children || [];
  if (hs(e.kind)) return tu(e, t);
  if (e.kind === "Chart") {
    const u = re("div", "chart");
    return u.setAttribute("data-genui-chart", JSON.stringify(n)), vs(u, qr(n, t.values)), u;
  }
  if (e.kind === "Heading")
    return re(`h${bs(n.level)}`, "", n.value);
  if (e.kind === "Text")
    return re("div", un(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown")
    return eu(n.content || n.value);
  if (e.kind === "CodeBlock") return re("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const u = re("div", "section-header");
    n.icon && u.appendChild(re("span", "section-icon", n.icon));
    const p = re("div");
    return p.appendChild(re("strong", "", n.title)), n.subtitle && p.appendChild(re("div", "muted small", n.subtitle)), u.appendChild(p), u;
  }
  if (e.kind === "KeyValueList") {
    const u = re("dl", "key-values");
    for (const p of rn(n.items)) {
      const v = p && typeof p == "object" ? p : {};
      u.append(re("dt", "", v.key), re("dd", "", v.value));
    }
    return u;
  }
  if (e.kind === "Divider") {
    const u = re("div", "divider");
    return n.label && u.appendChild(re("span", "", n.label)), u;
  }
  if (e.kind === "Spacer") {
    const u = re("div");
    return $n(u, nt("Spacer", n)), u;
  }
  if (e.kind === "Tabs") {
    const u = re("div", "tabs");
    u.setAttribute("data-genui-tabs", "1");
    const p = re("div", "tab-buttons"), v = re("div");
    return r.filter((f) => f.kind === "TabItem").forEach((f, h) => {
      var y;
      p.appendChild(re("button", h ? "" : "active", (y = f.props) == null ? void 0 : y.tab)), v.appendChild(
        en(
          re("div", h ? "tab-panel hidden" : "tab-panel"),
          f.children,
          t
        )
      );
    }), u.append(p, v), u;
  }
  if (e.kind === "Accordion") {
    const u = re("div");
    for (const p of r.filter(
      (v) => v.kind === "AccordionItem"
    )) {
      const v = re("details");
      v.append(
        re("summary", "", (i = p.props) == null ? void 0 : i.header),
        en(re("div", "accordion-body"), p.children, t)
      ), u.appendChild(v);
    }
    return u;
  }
  if (e.kind === "Form") {
    const u = re("div", "stack form");
    n.title && u.appendChild(re("div", "card-title", n.title)), en(u, r, t);
    const p = re("button", "button", Ce(n.submitLabel) || "提交");
    return p.setAttribute("data-genui-submit", "1"), u.appendChild(p), u;
  }
  if ($d.has(e.kind)) {
    const u = re(
      "button",
      e.kind === "LinkButton" ? "link-button" : "button",
      Ce(n.label) || "Action"
    );
    return un(n.disabled) && (u.disabled = !0), u.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && Ld(n.href) && u.setAttribute("data-genui-href", Ce(n.href).trim()), u;
  }
  if (e.kind === "Image") {
    const u = re("figure");
    return u.appendChild(xs(n.src, n.alt, "", t)), n.caption && u.appendChild(re("figcaption", "", n.caption)), u;
  }
  if (e.kind === "ImageGallery") {
    const u = re("div", "image-gallery");
    $n(u, nt("ImageGallery", n));
    for (const p of r.filter((v) => v.kind === "Image"))
      u.appendChild(Gr(p, t));
    return u;
  }
  if (e.kind === "Avatar") return Yd(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return re("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const u = re("progress");
    return u.max = 100, u.value = rt(n.value), u;
  }
  if (e.kind === "Stat") {
    const u = re("div", "stat");
    return u.append(
      re("span", "muted small", n.label),
      re("strong", "stat-value", n.value)
    ), n.delta && u.appendChild(
      re("span", `small trend-${Ce(n.trend)}`, n.delta)
    ), u;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const u = re("div", "card metric-card"), p = ci(re("div"), n.title, n.value);
    return n.delta && p.appendChild(
      re(
        "div",
        `small trend-${Ce(n.trend)}`,
        `${Ce(n.delta)}${n.period ? ` ${Ce(n.period)}` : ""}`
      )
    ), u.appendChild(p), n.icon && u.appendChild(re("span", "metric-icon", n.icon)), u;
  }
  if (e.kind === "TimelineCard") {
    const u = re("div", "card timeline");
    return u.append(
      re("i", `timeline-dot status-${Ce(n.status)}`),
      ci(re("div"), n.title, n.date)
    ), n.description && u.appendChild(re("div", "small", n.description)), u;
  }
  if (e.kind === "Stepper") {
    const u = re("ol", "stepper");
    return rn(n.steps).forEach((p, v) => {
      u.appendChild(
        re("li", v <= rt(n.current) ? "active" : "", p)
      );
    }), u;
  }
  if (e.kind === "Table") {
    const u = re("table", "data-table"), p = re("thead"), v = re("tr");
    for (const f of rn(n.headers))
      v.appendChild(re("th", "", f));
    p.appendChild(v);
    const g = re("tbody");
    for (const f of r.filter((h) => h.kind === "TableRow")) {
      const h = re("tr", (s = f.props) != null && s.highlight ? "highlight" : "");
      for (const y of (f.children || []).filter(
        (E) => E.kind === "TableCell"
      )) {
        const E = re("td", (l = y.props) != null && l.bold ? "bold" : "", (o = y.props) == null ? void 0 : o.value);
        (d = y.props) != null && d.align && (E.style.textAlign = Ce(y.props.align)), h.appendChild(E);
      }
      g.appendChild(h);
    }
    return u.append(p, g), u;
  }
  if (e.kind === "List") {
    const u = re(un(n.ordered) ? "ol" : "ul", "data-list");
    for (const p of r.filter((v) => v.kind === "ListItem"))
      u.appendChild(
        re(
          "li",
          "",
          `${(c = p.props) != null && c.icon ? `${Ce(p.props.icon)} ` : ""}${Ce(
            (m = p.props) == null ? void 0 : m.value
          )}`
        )
      );
    return u;
  }
  if (e.kind === "ChipGroup") {
    const u = re("div", "chips");
    for (const p of rn(n.items))
      u.appendChild(re("span", "tag", p));
    return u;
  }
  if (e.kind === "Skeleton") {
    const u = re("div", "skeletons");
    for (let p = 0; p < (rt(n.rows) || 3); p += 1)
      u.appendChild(re("i", "skeleton"));
    return u;
  }
  if (e.kind === "Icon") {
    const u = re("span", "icon");
    return Nd(u, n.name, { size: rt(n.size) || 16 }), u;
  }
  if (e.kind === "JsonDebug") {
    const u = re("details");
    return u.append(
      re("summary", "", Ce(n.label) || "Debug JSON"),
      re(
        "pre",
        "code",
        JSON.stringify(n.data == null ? n : n.data, null, 2)
      )
    ), u;
  }
  if (e.kind === "KpiBoard") {
    const u = re("div", "stack");
    n.title && u.appendChild(re("div", "card-title", n.title));
    const p = re("div", "grid");
    return $n(p, nt("KpiBoard", n)), en(p, r, t), u.appendChild(p), u;
  }
  if (!Object.prototype.hasOwnProperty.call(li, e.kind))
    return re(
      "div",
      "unknown-component",
      `Unknown component: ${Ce(e.kind)}`
    );
  const a = re("div", li[e.kind]);
  return $n(a, nt(e.kind, n)), e.kind === "Card" && n.title && a.appendChild(re("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && a.appendChild(re("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && a.appendChild(re("strong", "", n.title)), n.message && a.appendChild(re("div", "", n.message))) : en(a, r, t), a;
}
function di(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function nu() {
  return `(function () {
  "use strict";
  ${di(qr, "resolveChartModel")}
  ${di(vs, "paintChartElement")}
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
function ru(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = re("main");
  return r.id = "genui-root", r.appendChild(
    Gr(e, {
      values: t,
      media: n.sources || {},
      missing: new Set(n.missing || [])
    })
  ), r;
}
function Ss(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const a = ru(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${Kd(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${Qd}
  </style>
</head>
<body>${a.outerHTML}
<script id="genui-values-data" type="application/json">${Xd(
    t
  )}<\/script>
<script>${nu()}<\/script></body>
</html>`;
}
function ks(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function au(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => Ym), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  ks(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", {
    filename: t,
    via: "html-to-image"
  });
}
function iu(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function su(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await iu(await n.blob()) : null;
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
async function _s(e) {
  const t = {}, n = [], r = Array.from(
    e.querySelectorAll("img[data-genui-media-source]")
  );
  return await Promise.all(
    r.map(async (a) => {
      const i = a.dataset.genuiMediaSource || "", s = await su(a);
      i && (s ? t[i] = s : n.push(i));
    })
  ), { sources: t, missing: Array.from(new Set(n)) };
}
async function ou(e, t, n, r, a = r) {
  const i = await _s(e), s = Ss(
    t,
    n,
    i,
    a
  ), l = new Blob([s], { type: "text/html;charset=utf-8" }), o = URL.createObjectURL(l);
  ks(o, `${r}.html`), setTimeout(() => URL.revokeObjectURL(o), 1e3), i.missing.length && console.warn(
    "[ugsci.genui] HTML export has media that could not be embedded",
    { filename: r, missing: i.missing }
  ), console.info("[ugsci.genui] HTML export created", {
    filename: r,
    bytes: l.size,
    embeddedMedia: Object.keys(i.sources).length,
    missingMedia: i.missing.length
  });
}
async function lu(e, t, n, r) {
  const a = await _s(e), i = Ss(
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
const Je = "var(--ant-color-text, rgba(0, 0, 0, 0.88))", qe = "var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45))", jt = "var(--ant-color-border-secondary, #f0f0f0)", Mr = "var(--ant-color-bg-container, #fff)", Ir = "var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02))", Cs = "var(--ant-color-success, #52c41a)", cu = "var(--ant-color-success-bg, #f6ffed)", du = "var(--ant-color-warning, #faad14)", uu = "var(--ant-color-warning-bg, #fffbe6)", Ts = "var(--ant-color-error, #ff4d4f)", mu = "var(--ant-color-error-bg, #fff2f0)", ui = "var(--ant-color-primary, #1677ff)", pu = {
  derived_expression: "推导结果",
  effective_inventory: "有效库存",
  estimated_ogip: "估算原始储量",
  initial_p_over_z: "初始 p/z",
  current_p_over_z: "当前 p/z",
  recovery_factor: "采收率",
  remaining_gas: "剩余气量",
  result: "计算结果",
  transformed_expression: "变换结果"
}, Ms = {
  current_pressure: "当前压力",
  current_z_factor: "当前 z 因子",
  initial_pressure: "初始压力",
  initial_z_factor: "初始 z 因子",
  produced_gas: "累计产气量"
};
function vn(e) {
  return pu[e] || Ms[e] || e.replace(/[_.-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function gu(e, t = "") {
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
function Hn(e, t = "") {
  if (typeof e == "number") return gu(e, t);
  if (typeof e == "boolean") return e ? "是" : "否";
  if (e == null) return "—";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function mi(e) {
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
function fu(e) {
  const t = e == null ? void 0 : e.result;
  return !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(
    ([, n]) => ["string", "number", "boolean"].includes(typeof n)
  ).sort(([n], [r]) => mi(n) - mi(r)).slice(0, 4).map(([n, r]) => {
    var a;
    return {
      key: n,
      label: vn(n),
      value: Hn(r, n),
      unit: String(((a = e == null ? void 0 : e.units) == null ? void 0 : a[n]) || "")
    };
  });
}
function yu(e) {
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
function hu(e) {
  var r, a;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.variables) ? e.trace.variables.filter((i) => (i == null ? void 0 : i.source) === "input") : [];
  if (t.length)
    return t.slice(0, 8).map((i) => ({
      name: String(i.name || ""),
      label: String(
        Ms[String(i.name || "")] || i.display_name || vn(String(i.name || "参数"))
      ),
      value: `${Hn(i.value, i.name)}${i.unit ? ` ${i.unit}` : ""}`,
      source: "用户输入"
    }));
  const n = ((a = e == null ? void 0 : e.provenance) == null ? void 0 : a.parameter_sources) || {};
  return Object.entries(n).filter(([, i]) => (i == null ? void 0 : i.source) === "user_input").slice(0, 8).map(([i, s]) => ({
    name: i,
    label: vn(i),
    value: `${Hn(s == null ? void 0 : s.value, i)}${s != null && s.unit ? ` ${s.unit}` : ""}`,
    source: "用户输入"
  }));
}
function Qn(e) {
  var c, m, u, p;
  const t = (e == null ? void 0 : e.provenance) || {}, n = t.unit_audit, r = Object.values((n == null ? void 0 : n.per_symbol) || {}), a = typeof (n == null ? void 0 : n.ok) == "boolean" ? n.ok : null, i = t.source || ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.source), s = Array.isArray(e == null ? void 0 : e.warnings) ? e.warnings.map(String) : [];
  let l = "success", o = "公式与单位已核验", d = "公式匹配、参数完整，计算证据链可追溯。";
  return a === !1 ? (l = "error", o = "单位检查未通过", d = "结果使用前需要修正单位不一致项。") : i === "freeform" ? (l = "warning", o = "AI 推导 · 建议复核", d = "符号步骤已通过安全校验，但公式并非审定公式库来源。") : s.length ? (l = "warning", o = "计算完成 · 存在提醒", d = "核心计算已完成，请同时阅读警告和适用条件。") : a === null && (o = "计算证据链已记录", d = "推导步骤和参数来源可追溯；此记录没有逐项单位审计。"), {
    title: ((m = e == null ? void 0 : e.trace) == null ? void 0 : m.formula_name) || ((u = e == null ? void 0 : e.trace) == null ? void 0 : u.title) || (e == null ? void 0 : e.operation) || "UGSci 数学计算",
    formula: yu(e),
    trustLabel: o,
    trustDetail: d,
    trustTone: l,
    results: fu(e),
    inputs: hu(e),
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
function bu(e) {
  return e === "error" ? { color: Ts, background: mu } : e === "warning" ? { color: du, background: uu } : { color: Cs, background: cu };
}
function St({ children: e }) {
  return L().React.createElement(
    "div",
    { style: { fontWeight: 600, color: Je, marginBottom: 8 } },
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
  const i = L().React, s = Qn(e), l = bu(s.trustTone), o = s.results[0], d = s.results.slice(1, a ? 2 : 4);
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
          { style: { color: qe, fontSize: 12, marginBottom: 3 } },
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
                color: Je,
                fontSize: a ? 22 : 28,
                fontWeight: 600,
                overflowWrap: "anywhere"
              }
            },
            o.value
          ),
          o.unit ? i.createElement(
            "span",
            { style: { color: qe, fontSize: 13 } },
            o.unit
          ) : null
        ) : i.createElement(
          "strong",
          { style: { color: Je } },
          "计算已完成"
        ),
        o ? i.createElement(
          "div",
          { style: { color: qe, fontSize: 12, marginTop: 3 } },
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
          color: a ? qe : Je,
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
          borderTop: `1px solid ${jt}`
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
            { style: { color: qe } },
            c.label
          ),
          i.createElement(
            "span",
            { style: { color: Je, textAlign: "right" } },
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
          borderTop: `1px solid ${jt}`,
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
          { style: { color: qe } },
          "使用公式"
        ),
        i.createElement(
          "code",
          { style: { color: Je, overflowWrap: "anywhere" } },
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
          { style: { color: qe } },
          "关键输入"
        ),
        i.createElement(
          "span",
          { style: { color: Je } },
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
          { style: { color: qe } },
          "适用条件"
        ),
        i.createElement(
          "span",
          { style: { color: Je } },
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
            border: `1px solid ${ui}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: ui,
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
            border: `1px solid ${jt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Mr,
            color: Je,
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
            border: `1px solid ${jt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Mr,
            color: Je,
            cursor: "pointer"
          }
        },
        "复现计算"
      ) : null
    )
  );
}
function vu({ payload: e }) {
  const t = L().React, n = Qn(e);
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(St, null, "你最需要知道的"),
      t.createElement(
        "p",
        { style: { margin: 0, color: Je, fontSize: 13, lineHeight: 1.7 } },
        `本次使用 ${n.title}，读取 ${n.inputs.length} 项输入，记录 ${n.stepCount} 个推导步骤`,
        n.passedGateCount ? `，并通过 ${n.passedGateCount} 项计算校验。` : "。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(St, null, "边界与提醒"),
      n.boundaries.length || n.warnings.length ? t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: qe,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...[...n.warnings, ...n.boundaries].slice(0, 4).map(
          (r, a) => t.createElement("li", { key: `${a}:${r}` }, r)
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: qe, fontSize: 12 } },
        "未声明额外边界条件。"
      )
    )
  );
}
function Eu({ payload: e }) {
  var l, o, d;
  const t = L().React, n = Qn(e), r = (e == null ? void 0 : e.provenance) || {}, a = Object.entries(((l = r == null ? void 0 : r.unit_audit) == null ? void 0 : l.per_symbol) || {}), i = Object.entries((r == null ? void 0 : r.parameter_sources) || {}), s = (c, m, u = c) => t.createElement(
    "div",
    {
      key: u,
      style: {
        display: "grid",
        gridTemplateColumns: "90px minmax(0, 1fr)",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${jt}`,
        fontSize: 12
      }
    },
    t.createElement("span", { style: { color: qe } }, c),
    t.createElement(
      "span",
      { style: { color: Je, overflowWrap: "anywhere" } },
      m || "—"
    )
  );
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(St, null, "公式身份"),
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
        St,
        null,
        `参数来源（${i.length}）`
      ),
      i.length ? t.createElement(
        "div",
        { style: { display: "grid" } },
        ...i.map(
          ([c, m]) => s(
            vn(c),
            `${(m == null ? void 0 : m.source) === "user_input" ? "用户输入" : "推导生成"} · ${Hn(m == null ? void 0 : m.value, c)}${m != null && m.unit ? ` ${m.unit}` : ""}`,
            c
          )
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: qe, fontSize: 12 } },
        "没有参数来源记录。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        St,
        null,
        `单位审计（${n.unitCheckCount} 项）`
      ),
      t.createElement(
        "div",
        {
          style: {
            color: n.unitAuditOk === !1 ? Ts : n.unitAuditOk === !0 ? Cs : qe,
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
          { style: { cursor: "pointer", color: qe, fontSize: 12 } },
          "查看逐项单位检查"
        ),
        t.createElement(
          "div",
          { style: { marginTop: 6 } },
          ...a.map(
            ([c, m]) => s(
              vn(c),
              `${m != null && m.ok ? "✓" : "✗"} ${(m == null ? void 0 : m.actual) || "无量纲"} → ${(m == null ? void 0 : m.expected) || "—"}`,
              `unit:${c}`
            )
          )
        )
      ) : null
    ),
    Array.isArray(r.gate) && r.gate.length ? t.createElement(
      "section",
      null,
      t.createElement(St, null, "通过的计算校验"),
      t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: qe,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...r.gate.map(
          (c, m) => t.createElement(
            "li",
            { key: `${m}:${c}` },
            String(c)
          )
        )
      )
    ) : null,
    r.replay_token ? t.createElement(
      "section",
      null,
      t.createElement(St, null, "复现身份"),
      t.createElement(
        "code",
        {
          style: {
            display: "block",
            padding: 10,
            borderRadius: 8,
            background: Ir,
            color: qe,
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
function wu({ payload: e }) {
  const t = L().React, n = Qn(e), [r, a] = t.useState(!1), i = e == null ? void 0 : e.replay, s = [
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
            { style: { display: "block", color: Je } },
            String(l)
          ),
          t.createElement(
            "span",
            { style: { color: qe, fontSize: 11 } },
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
          border: `1px solid ${jt}`,
          borderRadius: 7,
          padding: "6px 10px",
          background: Mr,
          color: Je,
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
          color: qe,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          fontSize: 11,
          lineHeight: 1.55
        }
      },
      JSON.stringify(e, null, 2)
    ) : t.createElement(
      "p",
      { style: { margin: 0, color: qe, fontSize: 12 } },
      "原始运行数据默认隐藏，需要诊断或审计时再展开。"
    )
  );
}
const xu = 128;
let Ar = [], Is = "";
const $r = /* @__PURE__ */ new Set(), As = () => $r.forEach((e) => e()), $s = (e) => ($r.add(e), () => $r.delete(e)), pi = () => Ar;
function Zr(e) {
  return !!(e && typeof e == "object" && e.trace && Array.isArray(e.trace.steps) && e.provenance && (e.operation || e.trace.formula_id));
}
function Su(e) {
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
    sessionId: t || ((o = (l = L()).getCurrentSessionId) == null ? void 0 : o.call(l)) || "",
    payload: e,
    updatedAt: Date.now()
  };
  return Ar = [r, ...Ar.filter((d) => d.uiId !== n)].slice(
    0,
    xu
  ), As(), r;
}
function Qr(e) {
  Is = e, As();
}
function ku() {
  return L().React.useSyncExternalStore(
    $s,
    () => Is,
    () => ""
  );
}
function zs(e) {
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
    const a = Su(r);
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
function _u(e, t) {
  zs(e).forEach(
    (n) => Jr(n, t)
  );
}
function Cu(e) {
  const t = L().React, n = t.useSyncExternalStore($s, pi, pi);
  return t.useMemo(
    () => n.filter((r) => r.sessionId === e),
    [n, e]
  );
}
const Tu = [], Ht = /* @__PURE__ */ new Map();
function Mu(e) {
  Ht.set(e, (Ht.get(e) || 0) + 1);
}
function Iu(e) {
  const t = (Ht.get(e) || 1) - 1;
  t > 0 ? Ht.set(e, t) : Ht.delete(e);
}
function Au(e) {
  return (Ht.get(e) || 0) > 0;
}
function gi(e) {
  const t = [], n = (r) => {
    t.push(r);
    for (const a of r.children || []) n(a);
  };
  return n(e), t;
}
function $u(e) {
  var d, c;
  const t = gi(e), n = String(
    ((c = (d = t.find(
      (m) => {
        var u;
        return m.kind === "Heading" && Number((u = m.props) == null ? void 0 : u.level) === 2;
      }
    )) == null ? void 0 : d.props) == null ? void 0 : c.value) || "公式计算"
  ), r = t.some(
    (m) => {
      var u;
      return m.kind === "Alert" && String(((u = m.props) == null ? void 0 : u.severity) || "") === "warning";
    }
  ), a = t.filter((m) => m.kind === "MetricCard").map((m) => {
    var u, p;
    return {
      label: String(((u = m.props) == null ? void 0 : u.title) || "结果"),
      value: String(((p = m.props) == null ? void 0 : p.value) ?? "—")
    };
  }), i = t.filter((m) => m.kind === "TableRow").map(
    (m) => (m.children || []).filter((u) => u.kind === "TableCell").map((u) => {
      var p;
      return String(((p = u.props) == null ? void 0 : p.value) ?? "");
    })
  ).filter((m) => m.length >= 4 && m[3] === "derived").map((m) => ({
    label: m[0] || "结果",
    value: [m[1], m[2]].filter(Boolean).join(" ")
  })).reverse(), s = t.filter((m) => m.kind === "NumberInput" || m.kind === "Slider").slice(0, 5).map(
    (m) => {
      var u, p, v;
      return `${String(((u = m.props) == null ? void 0 : u.label) || ((p = m.props) == null ? void 0 : p.name) || "输入")}=${String(
        ((v = m.props) == null ? void 0 : v.value) ?? "—"
      )}`;
    }
  ), l = t.filter((m) => m.kind === "AccordionItem").filter(
    (m) => {
      var u;
      return ["适用场景", "假设条件"].includes(String(((u = m.props) == null ? void 0 : u.header) || ""));
    }
  ).flatMap((m) => gi(m)).filter((m) => m.kind === "ListItem").map((m) => {
    var u;
    return String(((u = m.props) == null ? void 0 : u.value) || "");
  }).filter(Boolean).slice(0, 3), o = [...i, ...a].filter(
    (m, u, p) => p.findIndex(
      (v) => v.label === m.label && v.value === m.value
    ) === u
  );
  return { title: n, warning: r, inputs: s, conditions: l, results: o };
}
function zu({
  data: e
}) {
  var g, f;
  const t = (g = window.QwenPaw) == null ? void 0 : g.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = md(), a = n.useRef(
    /* @__PURE__ */ new Map()
  ), i = ((f = t.getCurrentSessionId) == null ? void 0 : f.call(t)) || "__current_chat__", s = Array.isArray(e.output) ? e.output : Tu, l = n.useMemo(() => ms(s), [s]), o = n.useMemo(() => zs(s), [s]);
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
    for (const h of d) Mu(h);
    return () => {
      for (const h of d) Iu(h);
    };
  }, [c]);
  const m = n.useMemo(
    () => l.map((h) => h.ui_id).filter((h) => !!h),
    [l]
  ), p = pd(i, m).filter(
    (h) => (
      // Only include snapshots whose ui_id appears in this response's results
      l.some(
        (y) => y.ui_id === h.uiId && (y.kind === "genui" || y.kind === "genui_patch" && !Au(h.uiId))
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
          var E, b;
          return n.createElement(
            "div",
            {
              key: String(
                ((E = h.provenance) == null ? void 0 : E.replay_token) || ((b = h.trace) == null ? void 0 : b.formula_id) || y
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
                const x = Jr(h, i);
                x != null && x.uiId && Qr(x.uiId), window.dispatchEvent(
                  new CustomEvent("qwenpaw:open-compute-workbench", {
                    detail: { uiId: x == null ? void 0 : x.uiId }
                  })
                );
              }
            })
          );
        }
      )
    );
  if (p.length === 0) return null;
  const v = (h) => n.createElement(
    "div",
    {
      key: Dt(h.sessionId, h.uiId),
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
        children: n.createElement(Gd, {
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
            var b;
            const E = (b = y.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : b.querySelector(
              ".qwenpaw-genui-export-target"
            );
            E && au(E, h.uiId).catch(
              (x) => console.warn("[ugsci.genui] PNG export failed", x)
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
            var b;
            const E = (b = y.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : b.querySelector(
              ".qwenpaw-genui-export-target"
            );
            E && lu(
              E,
              h.tree.root,
              a.current.get(h.uiId) || {},
              h.uiId
            ).catch(
              (x) => console.warn("[ugsci.genui] PDF print failed", x)
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
            var b;
            const E = (b = y.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : b.querySelector(
              ".qwenpaw-genui-export-target"
            );
            E && ou(
              E,
              h.tree.root,
              a.current.get(h.uiId) || {},
              h.uiId,
              h.uiId
            ).catch(
              (x) => console.warn("[ugsci.genui] HTML export failed", x)
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
      if (!h.uiId.startsWith("ui_trc_")) return v(h);
      const y = $u(h.tree.root), E = y.results[0] || {
        label: "计算结果",
        value: "已完成"
      };
      return n.createElement(
        "div",
        {
          key: Dt(h.sessionId, h.uiId),
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
            (b) => n.createElement(
              "div",
              {
                key: `${b.label}:${b.value}`,
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
                b.label
              ),
              n.createElement("strong", null, b.value)
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
            v(h)
          )
        )
      );
    })
  );
}
function Ru({ payload: e }) {
  var l, o;
  const t = L().React, n = ((l = e == null ? void 0 : e.trace) == null ? void 0 : l.variables) || [], r = ((o = e == null ? void 0 : e.trace) == null ? void 0 : o.steps) || [], a = [
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
      const m = i.get(d.from), u = i.get(d.to);
      return t.createElement("line", {
        key: `e${c}`,
        x1: m.x + 155,
        y1: m.y + 16,
        x2: u.x,
        y2: u.y + 16,
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
function Lu({
  payload: e,
  compact: t = !1
}) {
  var d;
  const n = L().React, [r, a] = n.useState(!t), i = ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.steps) || [], s = i.filter(
    (c) => c.kind !== "bind" || c.note !== "input"
  ), o = (r ? i : s).map(
    (c, m) => n.createElement(
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
        m + 1
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
const zn = "var(--ant-color-text, rgba(0,0,0,.88))", gr = "var(--ant-color-text-secondary, rgba(0,0,0,.45))", fi = "var(--ant-color-border, #d9d9d9)", fr = "var(--ant-color-bg-container, #fff)", yi = "var(--ant-color-primary, #1677ff)";
function Pu() {
  var f, h, y;
  const e = L().React, t = ((h = (f = L()).getCurrentSessionId) == null ? void 0 : h.call(f)) || "", n = Cu(t), r = ku(), [a, i] = e.useState(n[0]), [s, l] = e.useState("summary"), [o, d] = e.useState("steps");
  if (e.useEffect(() => {
    const E = n.find((b) => b.uiId === r);
    E && E !== a ? i(E) : n.some((b) => b.uiId === (a == null ? void 0 : a.uiId)) || i(n[0]);
  }, [n, r, a]), !n.length)
    return e.createElement(
      "div",
      { style: { padding: 20, color: gr } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。"
    );
  const c = (a == null ? void 0 : a.payload) || n[0].payload, m = c.provenance || {}, u = c.replay, p = () => {
    var b, x, j;
    const E = m.replay_token;
    E && ((j = (x = (b = window.QwenPaw) == null ? void 0 : b.chat) == null ? void 0 : x.sendMessage) == null || j.call(
      x,
      `请调用 ugsci_replay_calculation 验证并重放以下令牌：
${E}`
    ));
  }, v = [
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
      u ? e.createElement(
        "span",
        {
          style: {
            color: u.reproducible ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-warning, #faad14)",
            fontSize: 12
          }
        },
        u.reproducible ? `✓ 可复现 · ${u.elapsedMs ?? "?"} ms` : "! 版本已变化"
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
      ...v.map(
        ([E, b]) => e.createElement(
          "button",
          {
            key: E,
            type: "button",
            role: "tab",
            onClick: () => l(E),
            "aria-selected": s === E,
            style: g(s === E)
          },
          b
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
            n.find((b) => b.uiId === E.target.value)
          );
        },
        style: {
          width: "100%",
          padding: "7px 9px",
          border: `1px solid ${fi}`,
          borderRadius: 7,
          color: zn,
          background: fr
        }
      },
      ...n.map(
        (E) => {
          var b;
          return e.createElement(
            "option",
            { key: E.uiId, value: E.uiId },
            ((b = E.payload.trace) == null ? void 0 : b.formula_name) || E.uiId.slice(0, 18)
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
        onReplay: m.replay_token ? p : void 0
      }),
      e.createElement(vu, { payload: c })
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
          ([E, b]) => e.createElement(
            "button",
            {
              key: E,
              type: "button",
              onClick: () => d(E),
              "aria-pressed": o === E,
              style: {
                border: `1px solid ${o === E ? yi : fi}`,
                borderRadius: 7,
                padding: "5px 9px",
                background: fr,
                color: o === E ? yi : zn,
                cursor: "pointer"
              }
            },
            b
          )
        )
      ),
      o === "flow" ? e.createElement(Ru, { payload: c }) : e.createElement(Lu, { payload: c, compact: !0 })
    ) : s === "evidence" ? e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Eu, { payload: c })
    ) : e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(wu, { payload: c })
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
function Ou(e) {
  var o, d, c, m, u, p, v;
  const t = L().React, n = ((o = e == null ? void 0 : e.data) == null ? void 0 : o.content) || [], r = ((c = (d = n[1]) == null ? void 0 : d.data) == null ? void 0 : c.output) ?? ((u = (m = n[1]) == null ? void 0 : m.data) == null ? void 0 : u.content) ?? ((v = (p = n[0]) == null ? void 0 : p.data) == null ? void 0 : v.output), a = sn(r), [i, s] = t.useState(null);
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
let wt = null;
function Nu(e, t) {
  var a, i, s, l;
  const n = "ugsci";
  wt == null || wt();
  const r = [];
  if (ge("/ugsci/genui/config", {
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
      e.chat.toolRender(n, "emit_ui_tree", Ya)
    ), r.push(
      e.chat.toolRender(n, "emit_ui_patch", Ya)
    ), r.push(
      e.chat.toolRender(n, "list_ui_components", ei)
    ), r.push(
      e.chat.toolRender(n, "get_genui_guide", ei)
    );
    for (const o of [
      "ugsci_trace_calculation",
      "ugsci_replay_calculation",
      "ugsci_derive_formula",
      "ugsci_evaluate_formula",
      "ugsci_transform_formula",
      "ugsci_formula_preview"
    ])
      r.push(e.chat.toolRender(n, o, Ou));
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  return (i = e.slot) != null && i.fill && r.push(
    e.slot.fill(
      n,
      "chat.workbench.compute",
      () => t.createElement(Pu)
    )
  ), (l = (s = e.chat) == null ? void 0 : s.response) != null && l.append && (r.push(
    e.chat.response.append(
      n,
      (o) => {
        const d = () => (t.useEffect(
          () => _u(o.data.output),
          [o.data.output]
        ), null);
        return t.createElement(
          ud,
          null,
          t.createElement(d),
          t.createElement(zu, { data: o.data })
        );
      },
      { id: "ugsci.genui.response-append", order: 50 }
    )
  ), console.info("[ugsci.genui] Registered response.append slot")), wt = () => {
    var o;
    for (const d of r.reverse()) (o = d == null ? void 0 : d.dispose) == null || o.call(d);
    if (fd(), Ad(), e.genui) {
      const d = { ...e.genui };
      delete d.dispose, delete d.clearSession, e.genui = d;
    }
    wt = null;
  }, e.genui = {
    ...e.genui || {},
    dispose: wt,
    clearSession: gd
  }, wt;
}
const hi = {
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
  const e = L().React, { Alert: t, Card: n, Space: r, Spin: a, Switch: i, Typography: s, message: l } = L().antd, { useEffect: o, useState: d } = e, [c, m] = d(null), [u, p] = d(!1);
  o(() => {
    let g = !0, f = null;
    const h = (y = !1) => {
      ge("/ugsci/genui/config").then((E) => {
        g && (m(E), yr(E));
      }).catch((E) => {
        g && (m(hi), yr(hi), y && l.error(String(E)), f = setTimeout(() => h(!1), 3e4));
      });
    };
    return h(!0), () => {
      g = !1, f && clearTimeout(f);
    };
  }, []);
  const v = async (g) => {
    p(!0);
    try {
      const f = await ge("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: g })
      });
      m(f), yr(f), l.success(
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
            loading: u,
            disabled: c.backend_unavailable,
            onChange: v
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
function Bu({
  preference: e
}) {
  const { React: t, antd: n } = L(), r = t.useSyncExternalStore(
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
function Hu() {
  const { React: e, antd: t, sidebarDensity: n } = L();
  return e.createElement(
    "div",
    { style: { width: "100%" } },
    e.createElement(t.Typography.Title, { level: 2 }, "UGSci 设置"),
    e.createElement(
      t.Typography.Paragraph,
      { type: "secondary", style: { marginBottom: 28 } },
      "集中管理 UGSci 的功能与偏好设置。"
    ),
    n && e.createElement(Bu, {
      preference: n
    }),
    e.createElement(ju)
  );
}
function Uu() {
  const { React: e } = L();
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
      ), m = c.origin === r.origin && c.pathname.startsWith(`${r.pathname}/`), u = c.origin === a.origin && c.pathname === a.pathname && ((d == null ? void 0 : d.method) || "GET").toUpperCase() === "GET";
      if (!m && !u || c.username || c.password)
        throw new Error("可视化请求超出当前数据服务范围");
      const p = new Headers(d == null ? void 0 : d.headers);
      Object.entries(s).forEach(
        ([f, h]) => p.set(f, h)
      );
      const v = e.getApiToken();
      v ? p.set("Authorization", `Bearer ${v}`) : p.delete("Authorization");
      const g = { ...d, headers: p };
      return e.fetch ? e.fetch(
        u ? `/workspace/tree${c.search}` : `/ugsci/visualization${c.pathname.slice(
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
          let m;
          try {
            m = JSON.parse(c.slice(5).trim());
          } catch {
            continue;
          }
          if (yield m, m.type === "done") return;
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
class Un extends Error {
  constructor(t) {
    super(t), this.name = "ImportJobFailedError";
  }
}
function Du(e, t) {
  return new Promise((n, r) => {
    const a = () => {
      clearTimeout(i), t == null || t.removeEventListener("abort", a), r(new DOMException("已停止等待导入", "AbortError"));
    }, i = setTimeout(() => {
      t == null || t.removeEventListener("abort", a), n();
    }, e);
    t != null && t.aborted ? a() : t == null || t.addEventListener("abort", a, { once: !0 });
  });
}
async function Vu(e, t, n = {}) {
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
        throw new Un("导入完成但未返回数据集编号");
      return d;
    }
    if (d.status === "failed" || d.status === "cancelled")
      throw new Un(
        d.error || (d.status === "cancelled" ? "导入任务已取消" : "导入失败")
      );
    o + 1 < i && await Du(s, r);
  }
  throw new Error("等待导入超时，后台任务可能仍在处理；请稍后重试查询");
}
async function Rs(e, t, n = {}) {
  return (await Vu(e, t, n)).result.id;
}
function qu() {
  var x, j, O;
  const e = L(), t = e.React, { useEffect: n, useRef: r, useState: a } = t, { Spin: i, Alert: s, Button: l } = e.antd, o = r(null), d = r(null), c = r(null), [m, u] = a(!0), [p, v] = a(null), [g, f] = a(0), [h, y] = a("正在加载三维可视化引擎…"), E = ((x = e.useSelectedAgent) == null ? void 0 : x.call(e).id) || ((j = e.getSelectedAgentId) == null ? void 0 : j.call(e)), b = ((O = e.useLocation) == null ? void 0 : O.call(e).search) ?? window.location.search;
  return n(() => {
    const M = new AbortController();
    let S = null;
    return (async () => {
      var V, C;
      u(!0), v(null), y("正在加载三维可视化引擎…");
      try {
        const I = new URLSearchParams(b), R = (V = I.get("path")) == null ? void 0 : V.trim(), W = {
          agentId: I.get("agentId") || E,
          chatId: I.get("chatId") || void 0,
          projectDirOverride: I.get("projectDirOverride") || void 0
        }, _ = Kn(e, W);
        let $ = I.get("datasetId") || void 0;
        if (R && !$) {
          const A = new Xr(
            _.apiBase,
            _.authToken,
            _
          ), P = I.get("name") || R.replace(/\\/g, "/").split("/").pop() || R;
          y(`正在导入 ${P}…`);
          const Z = I.get("root") === "workspace" ? "workspace" : "project", G = JSON.stringify([
            _.apiBase,
            _.headers,
            R,
            Z
          ]);
          if (((C = c.current) == null ? void 0 : C.scope) !== G) {
            c.current = null;
            const B = await A.createWorkspaceImport(
              R,
              Z,
              P.replace(/\.[^.]+$/, ""),
              M.signal
            );
            M.signal.throwIfAborted(), c.current = { scope: G, id: B.job_id };
          }
          $ = await Rs(A, c.current.id, {
            signal: M.signal
          });
        }
        const z = await Kr();
        if (M.signal.aborted || !o.current) return;
        y("正在加载场景…"), S = z.mount(o.current, {
          ..._,
          initialDatasetId: $,
          enableCommands: !0
        }), d.current = S, await S.ready, M.signal.aborted || u(!1);
      } catch (I) {
        if (M.signal.aborted) return;
        I instanceof Un && (c.current = null), S == null || S.dispose(), S = null, d.current = null, v(I instanceof Error ? I.message : "可视化引擎加载失败"), u(!1);
      }
    })(), () => {
      M.abort(), S == null || S.dispose(), d.current === S && (d.current = null);
    };
  }, [g, E, b]), t.createElement(
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
    m && t.createElement(
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
        { type: "primary", onClick: () => f((M) => M + 1) },
        "重试"
      )
    )
  );
}
function Fu({
  jobId: e,
  file: t,
  onOpen: n,
  onRetryImport: r
}) {
  const a = L(), i = a.React, { useEffect: s, useRef: l, useState: o } = i, { Button: d, Alert: c } = a.antd, m = l(null), [u, p] = o("等待后台处理…"), [v, g] = o(null), [f, h] = o(null), [y, E] = o(!1), [b, x] = o(0), [j, O] = o(!1);
  return s(() => {
    const M = new AbortController();
    let S = null;
    g(null), O(!1), E(!1), h(null);
    const N = Kn(a, t), V = new Xr(N.apiBase, N.authToken, N);
    return (async () => {
      try {
        const C = await Rs(V, e, {
          signal: M.signal,
          onProgress: (R) => p(
            `${R.status === "queued" ? "等待后台处理" : "正在解析数据"}（${Math.round(R.progress * 100)}%）`
          )
        });
        if (M.signal.aborted) return;
        h(C), p("正在加载场景…");
        const I = await Kr();
        if (M.signal.aborted || !m.current) return;
        S = I.mount(m.current, {
          ...N,
          initialDatasetId: C,
          autoLoad: !1,
          compact: !0,
          enableCommands: !1
        }), await S.ready, M.signal.aborted || E(!0);
      } catch (C) {
        if (M.signal.aborted) return;
        S == null || S.dispose(), S = null, O(C instanceof Un), g(C instanceof Error ? C.message : String(C));
      }
    })(), () => {
      M.abort(), S == null || S.dispose();
    };
  }, [e, b, t.agentId, t.chatId, t.projectDirOverride]), i.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    i.createElement("div", {
      ref: m,
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
        display: v ? "none" : "block"
      }
    }),
    !y && !v && i.createElement(
      "div",
      { role: "status", style: { padding: 12 } },
      u
    ),
    v && i.createElement(c, {
      type: "warning",
      message: "预览失败",
      description: v,
      showIcon: !0
    }),
    v && i.createElement(
      d,
      {
        onClick: () => j ? r() : x((M) => M + 1),
        style: { marginTop: 8 }
      },
      j ? "重新导入" : "重试预览"
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
function Gu(e) {
  var M, S, N;
  const t = L(), n = t.React, { useEffect: r, useState: a } = n, { Button: i, Spin: s, Alert: l, Typography: o } = t.antd, d = (M = t.useNavigate) == null ? void 0 : M.call(t), c = ((S = t.useSelectedAgent) == null ? void 0 : S.call(t).id) || ((N = t.getSelectedAgentId) == null ? void 0 : N.call(t)), m = e.artifact || e.file || {}, u = {
    ...m,
    agentId: m.agentId || c
  }, p = u.filename || u.title || e.filename || "未命名文件", v = u.workspacePath || u.path || e.workspacePath, g = JSON.stringify([
    v,
    p,
    u.workspaceRoot,
    u.agentId,
    u.chatId,
    u.projectDirOverride
  ]), [f, h] = a(null), y = (f == null ? void 0 : f.key) === g ? f.id : null, [E, b] = a(null), [x, j] = a(0);
  r(() => {
    const V = new AbortController();
    if (h(null), b(null), !v) {
      b("文件缺少工作区路径，无法导入预览");
      return;
    }
    const C = Kn(t, u);
    return new Xr(C.apiBase, C.authToken, C).createWorkspaceImport(
      v,
      u.workspaceRoot || "project",
      p.replace(/\.[^.]+$/, ""),
      V.signal
    ).then((R) => {
      V.signal.aborted || h({ id: R.job_id, key: g });
    }).catch((R) => {
      V.signal.aborted || b(R instanceof Error ? R.message : String(R));
    }), () => V.abort();
  }, [g, x]);
  const O = (V) => {
    if (!d) {
      b("当前宿主未提供页面导航，请从侧栏打开油气可视化");
      return;
    }
    const C = new URLSearchParams({ datasetId: V }), I = u.agentId;
    I && C.set("agentId", I), u.chatId ? C.set("chatId", u.chatId) : u.projectDirOverride && C.set("projectDirOverride", u.projectDirOverride), d(`/oilgas-visualization?${C}`);
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
    E && !y && v && n.createElement(
      i,
      { onClick: () => j((V) => V + 1) },
      "重试导入"
    ),
    y && n.createElement(Fu, {
      key: `${y}:${u.agentId || ""}:${u.chatId || ""}:${u.projectDirOverride || ""}`,
      jobId: y,
      file: u,
      onOpen: O,
      onRetryImport: () => j((V) => V + 1)
    })
  );
}
async function Wu(e, t = {}) {
  const { scope: n, signal: r, ...a } = t;
  r == null || r.throwIfAborted();
  const i = Kn(L(), n), s = await Kr();
  return r == null || r.throwIfAborted(), s.mount(e, {
    ...i,
    autoLoad: !1,
    enableCommands: !1,
    ...a
  });
}
const Ls = [
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
], Yr = Ls;
Ls.map(
  (e) => e.extension
);
const Zu = Yr.filter((e) => e.workspacePreview !== !1).flatMap((e) => e.previewExtensions || [e.extension]), Ju = Yr.filter((e) => e.workspacePreview !== !1).flatMap((e) => e.mimeTypes || []);
Yr.filter((e) => !e.companionOnly).map((e) => e.extension);
function Qu(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0, e.ugsci = {
    ...e.ugsci,
    visualization: { version: 1, mount: Wu }
  }, e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: qu,
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
    icon: Eo,
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
        component: Gu,
        // Generic CSV belongs to the native table preview. Pipeline/network
        // CSV remains available through an explicit visualization import.
        extensions: Zu,
        mimeTypes: Ju,
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
const Ku = /* @__PURE__ */ new Set([
  "launch_simulation",
  "check_simulation_status",
  "wait_for_simulation",
  "read_simulation_results",
  "analyze_simulation"
]), Xu = /* @__PURE__ */ new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output",
  "tool_result"
]);
function Yu(e) {
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
        if (Xu.has(a.type)) {
          const l = Array.isArray(a.content) ? a.content : [];
          [
            (s = a.data) == null ? void 0 : s.name,
            ...l.map((d) => {
              var c;
              return (c = d == null ? void 0 : d.data) == null ? void 0 : c.name;
            }),
            a.name
          ].some((d) => Ku.has(d)) && n(a);
          return;
        }
        for (const l of ["output", "content", "data"])
          r(a[l], i + 1);
      }
    }
  };
  return r(e), [...t.values()];
}
function em({ reference: e }) {
  var j, O, M, S, N, V;
  const t = L(), n = t.React, { Button: r } = t.antd, [a, i] = n.useState(!1), [s, l] = n.useState(!1), o = n.useId(), d = `${o}-details`, c = `${o}-results`, [, m] = n.useState(0), u = (j = t.useNavigate) == null ? void 0 : j.call(t), p = ((M = (O = t.useSelectedAgent) == null ? void 0 : O.call(t)) == null ? void 0 : M.id) || ((S = t.getSelectedAgentId) == null ? void 0 : S.call(t)) || "default", v = ((N = t.getCurrentSessionId) == null ? void 0 : N.call(t)) || "", g = e.agent_id || p, f = p === g, h = `数模任务 · ${e.simulator || "模拟计算"}`, y = {
    borderRadius: "var(--app-radius, 10px)",
    minHeight: 34,
    height: "auto",
    padding: "6px 14px",
    fontSize: "var(--app-font-secondary, 13px)",
    lineHeight: 1.5,
    whiteSpace: "normal"
  };
  n.useEffect(() => {
    const C = () => m((I) => I + 1);
    return window.addEventListener("qwenpaw:simulation-monitor-ready", C), () => window.removeEventListener("qwenpaw:simulation-monitor-ready", C);
  }, []);
  const E = window.QwenPaw, b = (V = E == null ? void 0 : E.runCenter) == null ? void 0 : V.SimulationMonitor, x = () => window.dispatchEvent(
    new CustomEvent("qwenpaw:open-simulation-workbench", {
      detail: { runId: e.run_id, agentId: g, sessionId: v }
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
          onClick: () => l((C) => !C),
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
          onClick: () => i((C) => !C)
        },
        a ? "收起结果" : "查看结果"
      ),
      n.createElement(
        r,
        { style: y, disabled: !f, onClick: x },
        "在侧栏监测"
      ),
      u && n.createElement(
        r,
        {
          type: "text",
          style: y,
          disabled: !f,
          onClick: () => u(
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
      b ? n.createElement(b, {
        runId: e.run_id,
        compact: !0,
        scope: { agentId: g, chatId: v }
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
        ["来源会话", e.session_id || v]
      ].filter(([, C]) => C).flatMap(([C, I]) => [
        n.createElement(
          "dt",
          {
            key: `${C}-label`,
            style: { color: "var(--app-text-secondary, #64748b)" }
          },
          C
        ),
        n.createElement(
          "dd",
          {
            key: C,
            style: {
              margin: 0,
              minWidth: 0,
              overflowWrap: "anywhere",
              fontFamily: "ui-monospace, SFMono-Regular, monospace"
            }
          },
          I
        )
      ])
    )
  );
}
function tm({ data: e }) {
  const t = L().React;
  return t.createElement(
    t.Fragment,
    null,
    ...Yu(e.output).map(
      (n) => t.createElement(em, { key: n.run_id, reference: n })
    )
  );
}
function nm(e, t) {
  var r, a, i, s;
  (r = e.ugsciSimulationDispose) == null || r.call(e);
  const n = (s = (i = (a = e.chat) == null ? void 0 : a.response) == null ? void 0 : i.append) == null ? void 0 : s.call(
    i,
    "ugsci",
    ({ data: l }) => t.createElement(tm, { data: l }),
    { id: "ugsci.simulation.response-append", order: 60 }
  );
  e.ugsciSimulationDispose = () => {
    var l;
    return (l = n == null ? void 0 : n.dispose) == null ? void 0 : l.call(n);
  };
}
const nn = "/ugsci/storage-dynamics", bi = (e) => e === "injection" ? "注气" : "采气", Ue = (e) => e == null ? "缺测" : e.toLocaleString("zh-CN", { maximumFractionDigits: 2 }), rm = {
  xls_row_limit: "疑似 XLS 导出截断",
  invalid_range: "数值超出合法范围",
  invalid_number: "无法识别数值",
  invalid_identity: "日期或库井标识无效",
  duplicate_identical: "相同重复已去重",
  duplicate_conflict: "重复冲突已排除"
}, am = {
  gas: "日气量",
  hours: "生产小时",
  pressure: "井口油压",
  casing: "套压",
  water: "日产水量",
  vent: "放空量"
};
function im({ rows: e }) {
  const t = L().React, n = [...new Set(e.map((o) => o.month))].sort(), r = n.map((o) => {
    const d = e.filter((m) => m.month === o), c = (m) => {
      const u = d.map((p) => p[m]).filter((p) => p != null);
      return u.length ? u.reduce((p, v) => p + v, 0) : null;
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
    return r.map((c, m) => {
      if (c[o] == null)
        return d = !1, "";
      const u = `${d ? "L" : "M"}${i(m)},${s(c[o])}`;
      return d = !0, u;
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
      Ue(o * a)
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
    ), /* @__PURE__ */ t.createElement("rect", { x: i(d) - 3, y: "40", width: "6", height: "205", fill: "transparent" }, /* @__PURE__ */ t.createElement("title", null, o.month, " 注气 ", Ue(o.injection), " / 采气 ", Ue(o.withdrawal), " ", "万m³"))))
  ));
}
function sm() {
  const e = L(), t = e.React, {
    Card: n,
    Select: r,
    Input: a,
    Button: i,
    Space: s,
    Alert: l,
    Table: o,
    Tabs: d,
    Statistic: c,
    Spin: m,
    DatePicker: u,
    InputNumber: p,
    Typography: v
  } = e.antd, [g, f] = t.useState([]), [h, y] = t.useState(""), [E, b] = t.useState(""), [x, j] = t.useState(""), [O, M] = t.useState(""), [S, N] = t.useState(""), [V, C] = t.useState(""), [I, R] = t.useState(4), [W, _] = t.useState(30), [$, z] = t.useState(null), [A, P] = t.useState(null), [Z, G] = t.useState(""), [B, K] = t.useState(""), D = t.useRef(!0), ee = async (U) => {
    var be;
    const pe = await ge(`${nn}/datasets`, {
      bypassCache: !0
    });
    if (!D.current) return;
    const Ee = pe.datasets.sort(
      (oe, Se) => Se.created_at.localeCompare(oe.created_at)
    );
    f(Ee), y(U || ((be = Ee[0]) == null ? void 0 : be.id) || "");
  };
  t.useEffect(() => (D.current = !0, ee().catch((U) => {
    D.current && K(String(U.message || U));
  }), () => {
    D.current = !1;
  }), []);
  const te = () => ({
    dataset_id: h,
    facility: x,
    well: O,
    start: S,
    end: V,
    cycle_start_month: I,
    drop_threshold_pct: W
  }), se = async () => {
    K(""), G("读取并审计数据…");
    try {
      const U = await ge(`${nn}/imports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_path: E })
      });
      for (; D.current; ) {
        await new Promise((Ee) => setTimeout(Ee, 1200));
        const pe = await ge(`${nn}/imports/${U.id}`, {
          bypassCache: !0
        });
        if (pe.status === "failed") throw new Error(pe.error);
        if (pe.status === "completed") {
          await ee(pe.dataset.id), z(null), j(""), M("");
          break;
        }
      }
    } catch (U) {
      D.current && K(U.message || String(U));
    } finally {
      D.current && G("");
    }
  }, ae = async () => {
    K(""), G("分析注采动态…");
    const U = te();
    try {
      const pe = await ge(`${nn}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(U)
      });
      D.current && (z(pe), P(U));
    } catch (pe) {
      D.current && K(pe.message || String(pe));
    } finally {
      D.current && G("");
    }
  }, Y = async () => {
    if (A) {
      G("生成报告…"), K("");
      try {
        const U = await ut(`${nn}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(A)
        });
        if (!U.ok) throw new Error(await U.text());
        const pe = URL.createObjectURL(await U.blob()), Ee = document.createElement("a");
        Ee.href = pe, Ee.download = "储气库生产动态分析报告.md", Ee.click(), setTimeout(() => URL.revokeObjectURL(pe), 1e3);
      } catch (U) {
        K(U.message || String(U));
      } finally {
        D.current && G("");
      }
    }
  }, ie = g.find((U) => U.id === h), de = (U, pe, Ee) => /* @__PURE__ */ t.createElement(
    o,
    {
      size: "small",
      dataSource: U,
      columns: pe,
      rowKey: Ee,
      pagination: { pageSize: 12, showSizeChanger: !0 },
      scroll: { x: "max-content" }
    }
  ), q = (U, pe, Ee) => ({ title: U, dataIndex: pe, render: Ee });
  return /* @__PURE__ */ t.createElement("div", { style: { padding: 24, maxWidth: 1600, margin: "0 auto" } }, /* @__PURE__ */ t.createElement(v.Title, { level: 2, style: { marginTop: 0 } }, "储气库生产动态分析"), /* @__PURE__ */ t.createElement(v.Paragraph, { type: "secondary" }, "从注采日记录到库井动态、运行阶段与复核线索。保留计量口径，每个异常可追溯到原表。"), /* @__PURE__ */ t.createElement(n, { title: "数据与分析范围", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(s.Compact, { style: { width: "100%", marginBottom: 16 } }, /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "注采数据路径",
      value: E,
      onChange: (U) => b(U.target.value),
      placeholder: "本地 XLS / XLSX / UTF-8 CSV 文件或目录的绝对路径",
      disabled: !!Z
    }
  ), /* @__PURE__ */ t.createElement(i, { onClick: se, disabled: !E.trim() || !!Z }, "导入并检查")), /* @__PURE__ */ t.createElement(s, { wrap: !0, style: { marginBottom: 12 } }, /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "数据集",
      style: { minWidth: 260 },
      placeholder: "选择数据集",
      value: h || void 0,
      disabled: !!Z,
      onChange: (U) => {
        y(U), j(""), M(""), z(null);
      },
      options: g.map((U) => ({
        label: `${U.name} · ${Ue(U.records)} 条`,
        value: U.id
      }))
    }
  ), /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "储气库",
      value: x,
      style: { minWidth: 145 },
      disabled: !!Z,
      onChange: (U) => {
        j(U), M("");
      },
      options: [
        { label: "全部储气库", value: "" },
        ...((ie == null ? void 0 : ie.facilities) || []).map((U) => ({
          label: U.facility,
          value: U.facility
        }))
      ]
    }
  ), /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "井号",
      value: O,
      onChange: (U) => M(U.target.value),
      placeholder: "原始井号（可选）",
      style: { width: 150 },
      disabled: !!Z
    }
  ), /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "起始日期",
      type: "date",
      value: S,
      onChange: (U) => N(U.target.value),
      disabled: !!Z,
      style: { width: 155 }
    }
  ), /* @__PURE__ */ t.createElement("span", null, "至"), /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "截止日期",
      type: "date",
      value: V,
      onChange: (U) => C(U.target.value),
      disabled: !!Z,
      style: { width: 155 }
    }
  )), /* @__PURE__ */ t.createElement(s, { wrap: !0 }, /* @__PURE__ */ t.createElement("span", null, "气年度起始月"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "气年度起始月份",
      min: 1,
      max: 12,
      value: I,
      disabled: !!Z,
      onChange: (U) => R(U || 4)
    }
  ), /* @__PURE__ */ t.createElement("span", null, "折算量下降筛查阈值（%）"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "下降筛查阈值",
      min: 1,
      max: 100,
      value: W,
      disabled: !!Z,
      onChange: (U) => _(U || 30)
    }
  ), /* @__PURE__ */ t.createElement(i, { type: "primary", onClick: ae, disabled: !h || !!Z }, "分析动态"), /* @__PURE__ */ t.createElement(i, { onClick: Y, disabled: !$ || !!Z }, "下载分析报告"))), B && /* @__PURE__ */ t.createElement(
    l,
    {
      type: "error",
      showIcon: !0,
      message: B,
      style: { marginBottom: 16 }
    }
  ), Z && /* @__PURE__ */ t.createElement("div", { role: "status", style: { padding: 16 } }, /* @__PURE__ */ t.createElement(m, { size: "small" }), " ", Z), !$ && !Z && /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(v.Paragraph, null, "选择已导入数据集并点击“分析动态”。也可以在专家中心创建“储气库生产动态分析师”，通过对话调用相同的分析工具。"), /* @__PURE__ */ t.createElement(
    l,
    {
      type: "info",
      showIcon: !0,
      message: "源文件只读；空值不补零，井口油压不替代地层压力。"
    }
  )), $ && /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(
    l,
    {
      type: "info",
      showIcon: !0,
      message: `分析截至数据日期 ${$.summary.as_of} · ${$.filters.facility || "全部库"} / ${$.filters.well || "全部井"} · ${$.summary.start} 起 · 气年度 ${$.parameters.cycle_start_month} 月起 · 筛查阈值 ${$.parameters.drop_threshold_pct}%`,
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
        `${$.summary.facilities} / ${$.summary.wells}`,
        ""
      ],
      ["已记录累计注气", Ue($.summary.injection), "万m³"],
      ["已记录累计采气", Ue($.summary.withdrawal), "万m³"],
      ["气量缺测日记录", Ue($.summary.missing_gas), "条"],
      ["筛查线索", Ue($.summary.anomaly_count), "项"]
    ].map(([U, pe, Ee]) => /* @__PURE__ */ t.createElement(n, { key: U, size: "small" }, /* @__PURE__ */ t.createElement(c, { title: U, value: pe, suffix: Ee })))
  ), /* @__PURE__ */ t.createElement(n, { title: "注采月度动态", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(im, { rows: $.monthly }), /* @__PURE__ */ t.createElement(v.Text, { type: "secondary" }, "未记录的一侧保持缺测。累计注采差额需要完整历史与期初库存才能参与库存核算。")), /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(
    d,
    {
      items: [
        {
          key: "coverage",
          label: "数据覆盖与质量",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, de(
            $.coverage,
            [
              q("储气库", "facility"),
              q("方向", "mode", bi),
              q("起始日期", "start"),
              q("截止日期", "end"),
              q("记录数", "records", Ue),
              q("气量缺测", "missing_gas", Ue),
              q("计量量 / 万m³", "observed_volume", Ue)
            ],
            (U) => `${U.facility}-${U.mode}`
          ), /* @__PURE__ */ t.createElement(
            l,
            {
              type: "warning",
              showIcon: !0,
              message: "分析口径与数据限制",
              description: /* @__PURE__ */ t.createElement("ul", null, $.warnings.map((U, pe) => /* @__PURE__ */ t.createElement("li", { key: pe }, U)))
            }
          ), /* @__PURE__ */ t.createElement(v.Paragraph, { style: { marginTop: 12 } }, "整个数据集导入检查：", Object.entries($.quality.import_counts).map(([U, pe]) => `${rm[U] || U} ${pe} 项`).join("；") || "未发现已配置检查项中的问题", "。下方最多显示 100 条原表问题样例。"), de(
            $.quality.examples,
            [
              q("问题", "message"),
              q(
                "字段",
                "field",
                (U) => am[U] || U || "—"
              ),
              q("文件", "file"),
              q("表", "sheet"),
              q("原行号", "row")
            ],
            (U) => `${U.file}-${U.sheet}-${U.row}-${U.code}-${U.field}`
          ))
        },
        {
          key: "cycles",
          label: "气年度与阶段",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, de(
            $.cycles,
            [
              q("储气库", "facility"),
              q("气年度", "gas_year"),
              q("注气 / 万m³", "injection", Ue),
              q("采气 / 万m³", "withdrawal", Ue),
              q("净计量变化 / 万m³", "net_metered_change", Ue),
              q(
                "水气质量比 / t/万m³",
                "water_gas_mass_ratio",
                Ue
              ),
              q("覆盖状态", "completeness")
            ],
            (U) => `${U.facility}-${U.gas_year}`
          ), /* @__PURE__ */ t.createElement(v.Title, { level: 5 }, "近期运行阶段（按实测记录）"), de(
            $.phases_recent,
            [
              q("库", "facility"),
              q(
                "状态",
                "state",
                (U) => ({
                  injection: "注气",
                  withdrawal: "采气",
                  mixed: "混合",
                  zero_observed: "已观测零气量",
                  unknown: "气量未知"
                })[U] || U
              ),
              q("起始", "start"),
              q("截止", "end"),
              q("连续观测日", "observed_days")
            ],
            (U) => `${U.facility}-${U.start}`
          ))
        },
        {
          key: "wells",
          label: "井动态与短期基线",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, de(
            $.wells,
            [
              q("库", "facility"),
              q("井号", "well"),
              q("方向", "mode", bi),
              q("运行日", "active_days", Ue),
              q("累计计量 / 万m³", "observed_volume", Ue),
              q("最近运行日期", "last_active_date"),
              q("折算量变化 / %", "rate_change_pct", Ue),
              q("井口油压变化 / %", "pressure_change_pct", Ue),
              q(
                "条件性日量基线 / 万m³",
                "forecast",
                (U) => Ue(U == null ? void 0 : U.daily_volume)
              ),
              q(
                "滚动回测 MAE / 万m³",
                "forecast",
                (U) => Ue(U == null ? void 0 : U.backtest_mae)
              ),
              q("基线状态", "forecast_reason")
            ],
            (U) => `${U.facility}-${U.well}-${U.mode}`
          ), /* @__PURE__ */ t.createElement(v.Text, { type: "secondary" }, "短期基线仅限保持工况的 7 日分析；停井、缺测与日期断档会断开阶段。回测仅使用预测时点之前的记录。"))
        },
        {
          key: "anomalies",
          label: "复核线索",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(v.Paragraph, null, "共 ", Ue($.summary.anomaly_count), " ", "项筛查线索，显示最近 100 项。线索需要结合现场调度与工程资料复核。"), de(
            $.anomalies,
            [
              q("日期", "day"),
              q("库", "facility"),
              q("井号", "well"),
              q("线索", "message"),
              q("变化 / %", "rate_change_pct", Ue),
              q(
                "原表位置",
                "source",
                (U) => `${U.file} / ${U.sheet} / 第 ${U.row} 行`
              )
            ],
            (U) => `${U.facility}-${U.well}-${U.day}-${U.code}`
          ))
        }
      ]
    }
  ))));
}
function om() {
  var l, o, d, c;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = L().React, n = "ugsci";
  nm(e, t);
  function r() {
    return L().React.createElement(id, { embedded: !0 });
  }
  function a() {
    return L().React.useEffect(() => {
      window.history.replaceState({}, "", "/market?tab=ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
    }, []), null;
  }
  (o = (l = e.chat) == null ? void 0 : l.rightHeader) != null && o.add ? (e.chat.rightHeader.add(
    n,
    t.createElement(od),
    {
      id: "ugsci.welcome-injector",
      order: -1
      // render before other right-header items (invisible anyway)
    }
  ), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const s = (L().antdIcons || {}).ToolOutlined;
  e.route.add(n, {
    id: "ugsci.storage-dynamics",
    path: "/ugsci-storage-dynamics",
    component: sm
  }), e.menu.add(n, {
    id: "ugsci.storage-dynamics",
    location: "primary.agentScoped",
    label: () => "储气库动态",
    icon: wo,
    route: "ugsci.storage-dynamics",
    order: 7
  }), e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: nc
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: xo,
    route: "ugsci.experts",
    order: 5
  }), e.route.add(n, {
    id: "ugsci.settings",
    path: "/ugsci-settings",
    component: Hu
  }), e.route.add(n, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: Uu
  }), e.route.add(n, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: ts
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
    component: Rc
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Lc
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
    const u = e.menu.snapshot("primary.agentScoped").find((p) => p.id === "oilgas-vis.page");
    u && e.menu.replace(n, "oilgas-vis.page", {
      ...u,
      visible: () => !1
    });
  } catch {
  }
  Nu(e, t), Qu(e), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, host-managed navigation"
  );
}
function zr() {
  try {
    om();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(zr, 500);
  }
}
var Ci;
if ((Ci = window.QwenPaw) != null && Ci.host)
  zr();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), zr());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function lm(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), a = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(a), t && (r.href = t), a.href = e, a.href;
}
const cm = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function bt(e) {
  const t = [];
  for (let n = 0, r = e.length; n < r; n++)
    t.push(e[n]);
  return t;
}
let Pt = null;
function Ps(e = {}) {
  return Pt || (e.includeStyleProperties ? (Pt = e.includeStyleProperties, Pt) : (Pt = bt(window.getComputedStyle(document.documentElement)), Pt));
}
function Dn(e, t) {
  const r = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return r ? parseFloat(r.replace("px", "")) : 0;
}
function dm(e) {
  const t = Dn(e, "border-left-width"), n = Dn(e, "border-right-width");
  return e.clientWidth + t + n;
}
function um(e) {
  const t = Dn(e, "border-top-width"), n = Dn(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function Os(e, t = {}) {
  const n = t.width || dm(e), r = t.height || um(e);
  return { width: n, height: r };
}
function mm() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const tt = 16384;
function pm(e) {
  (e.width > tt || e.height > tt) && (e.width > tt && e.height > tt ? e.width > e.height ? (e.height *= tt / e.width, e.width = tt) : (e.width *= tt / e.height, e.height = tt) : e.width > tt ? (e.height *= tt / e.width, e.width = tt) : (e.width *= tt / e.height, e.height = tt));
}
function Vn(e) {
  return new Promise((t, n) => {
    const r = new Image();
    r.onload = () => {
      r.decode().then(() => {
        requestAnimationFrame(() => t(r));
      });
    }, r.onerror = n, r.crossOrigin = "anonymous", r.decoding = "async", r.src = e;
  });
}
async function gm(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function fm(e, t, n) {
  const r = "http://www.w3.org/2000/svg", a = document.createElementNS(r, "svg"), i = document.createElementNS(r, "foreignObject");
  return a.setAttribute("width", `${t}`), a.setAttribute("height", `${n}`), a.setAttribute("viewBox", `0 0 ${t} ${n}`), i.setAttribute("width", "100%"), i.setAttribute("height", "100%"), i.setAttribute("x", "0"), i.setAttribute("y", "0"), i.setAttribute("externalResourcesRequired", "true"), a.appendChild(i), i.appendChild(e), gm(a);
}
const Xe = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || Xe(n, t);
};
function ym(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function hm(e, t) {
  return Ps(t).map((n) => {
    const r = e.getPropertyValue(n), a = e.getPropertyPriority(n);
    return `${n}: ${r}${a ? " !important" : ""};`;
  }).join(" ");
}
function bm(e, t, n, r) {
  const a = `.${e}:${t}`, i = n.cssText ? ym(n) : hm(n, r);
  return document.createTextNode(`${a}{${i}}`);
}
function vi(e, t, n, r) {
  const a = window.getComputedStyle(e, n), i = a.getPropertyValue("content");
  if (i === "" || i === "none")
    return;
  const s = cm();
  try {
    t.className = `${t.className} ${s}`;
  } catch {
    return;
  }
  const l = document.createElement("style");
  l.appendChild(bm(s, n, a, r)), t.appendChild(l);
}
function vm(e, t, n) {
  vi(e, t, ":before", n), vi(e, t, ":after", n);
}
const Ei = "application/font-woff", wi = "image/jpeg", Em = {
  woff: Ei,
  woff2: Ei,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: wi,
  jpeg: wi,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function wm(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function ea(e) {
  const t = wm(e).toLowerCase();
  return Em[t] || "";
}
function xm(e) {
  return e.split(/,/)[1];
}
function Rr(e) {
  return e.search(/^(data:)/) !== -1;
}
function Sm(e, t) {
  return `data:${t};base64,${e}`;
}
async function Ns(e, t, n) {
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
function km(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function ta(e, t, n) {
  const r = km(e, t, n.includeQueryParams);
  if (hr[r] != null)
    return hr[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let a;
  try {
    const i = await Ns(e, n.fetchRequestInit, ({ res: s, result: l }) => (t || (t = s.headers.get("Content-Type") || ""), xm(l)));
    a = Sm(i, t);
  } catch (i) {
    a = n.imagePlaceholder || "";
    let s = `Failed to fetch resource: ${e}`;
    i && (s = typeof i == "string" ? i : i.message), s && console.warn(s);
  }
  return hr[r] = a, a;
}
async function _m(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : Vn(t);
}
async function Cm(e, t) {
  if (e.currentSrc) {
    const i = document.createElement("canvas"), s = i.getContext("2d");
    i.width = e.clientWidth, i.height = e.clientHeight, s == null || s.drawImage(e, 0, 0, i.width, i.height);
    const l = i.toDataURL();
    return Vn(l);
  }
  const n = e.poster, r = ea(n), a = await ta(n, r, t);
  return Vn(a);
}
async function Tm(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await Xn(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function Mm(e, t) {
  return Xe(e, HTMLCanvasElement) ? _m(e) : Xe(e, HTMLVideoElement) ? Cm(e, t) : Xe(e, HTMLIFrameElement) ? Tm(e, t) : e.cloneNode(js(e));
}
const Im = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", js = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function Am(e, t, n) {
  var r, a;
  if (js(t))
    return t;
  let i = [];
  return Im(e) && e.assignedNodes ? i = bt(e.assignedNodes()) : Xe(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? i = bt(e.contentDocument.body.childNodes) : i = bt(((a = e.shadowRoot) !== null && a !== void 0 ? a : e).childNodes), i.length === 0 || Xe(e, HTMLVideoElement) || await i.reduce((s, l) => s.then(() => Xn(l, n)).then((o) => {
    o && t.appendChild(o);
  }), Promise.resolve()), t;
}
function $m(e, t, n) {
  const r = t.style;
  if (!r)
    return;
  const a = window.getComputedStyle(e);
  a.cssText ? (r.cssText = a.cssText, r.transformOrigin = a.transformOrigin) : Ps(n).forEach((i) => {
    let s = a.getPropertyValue(i);
    i === "font-size" && s.endsWith("px") && (s = `${Math.floor(parseFloat(s.substring(0, s.length - 2))) - 0.1}px`), Xe(e, HTMLIFrameElement) && i === "display" && s === "inline" && (s = "block"), i === "d" && t.getAttribute("d") && (s = `path(${t.getAttribute("d")})`), r.setProperty(i, s, a.getPropertyPriority(i));
  });
}
function zm(e, t) {
  Xe(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Xe(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function Rm(e, t) {
  if (Xe(e, HTMLSelectElement)) {
    const r = Array.from(t.children).find((a) => e.value === a.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function Lm(e, t, n) {
  return Xe(t, Element) && ($m(e, t, n), vm(e, t, n), zm(e, t), Rm(e, t)), t;
}
async function Pm(e, t) {
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
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => Mm(r, t)).then((r) => Am(e, r, t)).then((r) => Lm(e, r, t)).then((r) => Pm(r, t));
}
const Bs = /url\((['"]?)([^'"]+?)\1\)/g, Om = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Nm = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function jm(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function Bm(e) {
  const t = [];
  return e.replace(Bs, (n, r, a) => (t.push(a), n)), t.filter((n) => !Rr(n));
}
async function Hm(e, t, n, r, a) {
  try {
    const i = n ? lm(t, n) : t, s = ea(t);
    let l;
    return a || (l = await ta(i, s, r)), e.replace(jm(t), `$1${l}$3`);
  } catch {
  }
  return e;
}
function Um(e, { preferredFontFormat: t }) {
  return t ? e.replace(Nm, (n) => {
    for (; ; ) {
      const [r, , a] = Om.exec(n) || [];
      if (!a)
        return "";
      if (a === t)
        return `src: ${r};`;
    }
  }) : e;
}
function Hs(e) {
  return e.search(Bs) !== -1;
}
async function Us(e, t, n) {
  if (!Hs(e))
    return e;
  const r = Um(e, n);
  return Bm(r).reduce((i, s) => i.then((l) => Hm(l, s, t, n)), Promise.resolve(r));
}
async function Ot(e, t, n) {
  var r;
  const a = (r = t.style) === null || r === void 0 ? void 0 : r.getPropertyValue(e);
  if (a) {
    const i = await Us(a, null, n);
    return t.style.setProperty(e, i, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function Dm(e, t) {
  await Ot("background", e, t) || await Ot("background-image", e, t), await Ot("mask", e, t) || await Ot("-webkit-mask", e, t) || await Ot("mask-image", e, t) || await Ot("-webkit-mask-image", e, t);
}
async function Vm(e, t) {
  const n = Xe(e, HTMLImageElement);
  if (!(n && !Rr(e.src)) && !(Xe(e, SVGImageElement) && !Rr(e.href.baseVal)))
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
async function qm(e, t) {
  const r = bt(e.childNodes).map((a) => Ds(a, t));
  await Promise.all(r).then(() => e);
}
async function Ds(e, t) {
  Xe(e, Element) && (await Dm(e, t), await Vm(e, t), await qm(e, t));
}
function Fm(e, t) {
  const { style: n } = e;
  t.backgroundColor && (n.backgroundColor = t.backgroundColor), t.width && (n.width = `${t.width}px`), t.height && (n.height = `${t.height}px`);
  const r = t.style;
  return r != null && Object.keys(r).forEach((a) => {
    n[a] = r[a];
  }), e;
}
const xi = {};
async function Si(e) {
  let t = xi[e];
  if (t != null)
    return t;
  const r = await (await fetch(e)).text();
  return t = { url: e, cssText: r }, xi[e] = t, t;
}
async function ki(e, t) {
  let n = e.cssText;
  const r = /url\(["']?([^"')]+)["']?\)/g, i = (n.match(/url\([^)]+\)/g) || []).map(async (s) => {
    let l = s.replace(r, "$1");
    return l.startsWith("https://") || (l = new URL(l, e.url).href), Ns(l, t.fetchRequestInit, ({ result: o }) => (n = n.replace(s, `url(${o})`), [s, o]));
  });
  return Promise.all(i).then(() => n);
}
function _i(e) {
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
async function Gm(e, t) {
  const n = [], r = [];
  return e.forEach((a) => {
    if ("cssRules" in a)
      try {
        bt(a.cssRules || []).forEach((i, s) => {
          if (i.type === CSSRule.IMPORT_RULE) {
            let l = s + 1;
            const o = i.href, d = Si(o).then((c) => ki(c, t)).then((c) => _i(c).forEach((m) => {
              try {
                a.insertRule(m, m.startsWith("@import") ? l += 1 : a.cssRules.length);
              } catch (u) {
                console.error("Error inserting rule from remote css", {
                  rule: m,
                  error: u
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
        a.href != null && r.push(Si(a.href).then((l) => ki(l, t)).then((l) => _i(l).forEach((o) => {
          s.insertRule(o, s.cssRules.length);
        })).catch((l) => {
          console.error("Error loading remote stylesheet", l);
        })), console.error("Error inlining remote css file", i);
      }
  }), Promise.all(r).then(() => (e.forEach((a) => {
    if ("cssRules" in a)
      try {
        bt(a.cssRules || []).forEach((i) => {
          n.push(i);
        });
      } catch (i) {
        console.error(`Error while reading CSS rules from ${a.href}`, i);
      }
  }), n));
}
function Wm(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => Hs(t.style.getPropertyValue("src")));
}
async function Zm(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = bt(e.ownerDocument.styleSheets), r = await Gm(n, t);
  return Wm(r);
}
function Vs(e) {
  return e.trim().replace(/["']/g, "");
}
function Jm(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    (r.style.fontFamily || getComputedStyle(r).fontFamily).split(",").forEach((i) => {
      t.add(Vs(i));
    }), Array.from(r.children).forEach((i) => {
      i instanceof HTMLElement && n(i);
    });
  }
  return n(e), t;
}
async function Qm(e, t) {
  const n = await Zm(e, t), r = Jm(e);
  return (await Promise.all(n.filter((i) => r.has(Vs(i.style.fontFamily))).map((i) => {
    const s = i.parentStyleSheet ? i.parentStyleSheet.href : null;
    return Us(i.cssText, s, t);
  }))).join(`
`);
}
async function Km(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await Qm(e, t);
  if (n) {
    const r = document.createElement("style"), a = document.createTextNode(n);
    r.appendChild(a), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function qs(e, t = {}) {
  const { width: n, height: r } = Os(e, t), a = await Xn(e, t, !0);
  return await Km(a, t), await Ds(a, t), Fm(a, t), await fm(a, n, r);
}
async function Fs(e, t = {}) {
  const { width: n, height: r } = Os(e, t), a = await qs(e, t), i = await Vn(a), s = document.createElement("canvas"), l = s.getContext("2d"), o = t.pixelRatio || mm(), d = t.canvasWidth || n, c = t.canvasHeight || r;
  return s.width = d * o, s.height = c * o, t.skipAutoScale || pm(s), s.style.width = `${d}`, s.style.height = `${c}`, t.backgroundColor && (l.fillStyle = t.backgroundColor, l.fillRect(0, 0, s.width, s.height)), l.drawImage(i, 0, 0, s.width, s.height), s;
}
async function Xm(e, t = {}) {
  return (await Fs(e, t)).toDataURL();
}
const Ym = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: Fs,
  toPng: Xm,
  toSvg: qs
}, Symbol.toStringTag, { value: "Module" }));
